
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Trash2, CreditCard, QrCode, Money, Info, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useShop } from '@/contexts/ShopContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Coupon } from '@/types/coupon';

// Schema for the checkout form validation
const checkoutFormSchema = z.object({
  name: z.string().min(3, 'Nome completo é obrigatório'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(10, 'Número de telefone inválido'),
  address: z.string().min(5, 'Endereço é obrigatório'),
  city: z.string().min(2, 'Cidade é obrigatória'),
  state: z.string().min(2, 'Estado é obrigatório'),
  zipCode: z.string().min(8, 'CEP inválido'),
  paymentMethod: z.enum(['credit_card', 'debit_card', 'pix', 'boleto']),
  installments: z.number().optional(),
  cardNumber: z.string().optional(),
  cardName: z.string().optional(),
  cardExpiry: z.string().optional(),
  cardCvv: z.string().optional(),
  isRental: z.boolean().default(false),
  rentalStartDate: z.string().optional(),
  rentalEndDate: z.string().optional(),
  pickupPreference: z.string().optional(),
  notes: z.string().optional(),
});

type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, cartTotal, clearCart, calculateDiscount, coupon, applyCoupon, removeCoupon, calculateInstallmentValue } = useShop();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [selectedInstallments, setSelectedInstallments] = useState(1);
  const [applyCouponLoading, setApplyCouponLoading] = useState(false);
  const [pixDiscount, setPixDiscount] = useState(5); // 5% discount for PIX
  const [isRental, setIsRental] = useState(false);
  
  // Get coupon validation
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  
  // Initialize form with default values
  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      name: '',
      email: user?.email || '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      paymentMethod: 'credit_card',
      installments: 1,
      isRental: false,
      notes: '',
    },
  });
  
  const paymentMethod = form.watch('paymentMethod');
  
  // Fetch user profile data if user is logged in
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (error) throw error;
        
        if (data) {
          form.setValue('name', data.name || '');
          form.setValue('phone', data.phone || '');
          form.setValue('address', data.address || '');
          form.setValue('city', data.city || '');
          form.setValue('state', data.state || '');
          form.setValue('zipCode', data.postal_code || '');
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };
    
    fetchUserProfile();
  }, [user, form]);
  
  // Check if cart has rental items
  useEffect(() => {
    const hasRentalItems = cart.some(item => item.isRental);
    setIsRental(hasRentalItems);
    form.setValue('isRental', hasRentalItems);
  }, [cart, form]);
  
  // Apply coupon code
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast({
        title: "Erro",
        description: "Digite um código de cupom",
        variant: "destructive",
      });
      return;
    }
    
    setApplyCouponLoading(true);
    
    try {
      const result = await applyCoupon(couponCode);
      
      if (result.success) {
        toast({
          title: "Sucesso",
          description: result.message,
        });
        setCouponCode('');
      } else {
        toast({
          title: "Erro",
          description: result.message,
          variant: "destructive",
        });
      }
    } finally {
      setApplyCouponLoading(false);
    }
  };
  
  // Remove applied coupon
  const handleRemoveCoupon = () => {
    removeCoupon();
    toast({
      title: "Cupom removido",
      description: "O cupom foi removido com sucesso.",
    });
  };
  
  // Calculate subtotal
  const subtotal = cartTotal;
  
  // Calculate discount amount
  const couponDiscount = calculateDiscount(subtotal);
  
  // Calculate PIX discount if payment method is PIX
  const pixDiscountAmount = paymentMethod === 'pix' ? (subtotal - couponDiscount) * (pixDiscount / 100) : 0;
  
  // Calculate total after discounts
  const total = subtotal - couponDiscount - pixDiscountAmount;
  
  // Calculate installment value with interest (for credit cards)
  const installmentValue = paymentMethod === 'credit_card' ? 
    calculateInstallmentValue(total, selectedInstallments) : total;
  
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };
  
  // Handle form submission
  const onSubmit = async (values: CheckoutFormValues) => {
    if (cart.length === 0) {
      toast({
        title: "Carrinho vazio",
        description: "Adicione produtos ao carrinho para finalizar a compra.",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // Create order in database
      const { data: order, error } = await supabase
        .from('orders')
        .insert({
          customer_name: values.name,
          customer_email: values.email,
          customer_phone: values.phone,
          total_amount: total,
          status: 'pending',
          payment_method: values.paymentMethod,
          coupon_id: coupon?.id,
          coupon_discount: couponDiscount,
          installments: values.paymentMethod === 'credit_card' ? selectedInstallments : 1,
          payment_status: 'pending',
          rental_start_date: values.rentalStartDate ? new Date(values.rentalStartDate).toISOString() : null,
          rental_end_date: values.rentalEndDate ? new Date(values.rentalEndDate).toISOString() : null,
          rental_pickup_preference: values.pickupPreference,
          customer_notes: values.notes,
        })
        .select()
        .single();
        
      if (error) throw error;
      
      // Create order items
      const orderItems = cart.map(item => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        price: item.promoPrice || item.salePrice || item.price,
        is_rental: item.isRental || false,
        rental_start_date: values.rentalStartDate ? new Date(values.rentalStartDate).toISOString() : null,
        rental_end_date: values.rentalEndDate ? new Date(values.rentalEndDate).toISOString() : null,
      }));
      
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);
        
      if (itemsError) throw itemsError;
      
      // Update coupon usage count if applied
      if (coupon) {
        const { error: couponError } = await supabase
          .from('discount_coupons')
          .update({ current_uses: (coupon.current_uses || 0) + 1 })
          .eq('id', coupon.id);
          
        if (couponError) console.error('Error updating coupon usage:', couponError);
      }
      
      // Create customer if not exists
      const { data: existingCustomer } = await supabase
        .from('customers')
        .select('id')
        .eq('email', values.email)
        .single();
        
      if (!existingCustomer) {
        await supabase.from('customers').insert({
          name: values.name,
          email: values.email,
          phone: values.phone,
          address: values.address,
          city: values.city,
          state: values.state,
          postal_code: values.zipCode,
        });
      }
      
      // Clear cart and coupon
      clearCart();
      
      // Redirect to order confirmation page
      navigate(`/order-confirmation/${order.id}`);
    } catch (error: any) {
      console.error('Error creating order:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao finalizar a compra. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  // If cart is empty, redirect to shop
  if (cart.length === 0) {
    return (
      <div className="container mx-auto max-w-4xl py-12 px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-montserrat">Seu carrinho está vazio</CardTitle>
            <CardDescription>
              Adicione produtos ao carrinho antes de finalizar a compra.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center my-8">
              <Button
                onClick={() => navigate('/shop')}
                className="bg-brand-purple hover:bg-brand-purple/90"
              >
                Voltar para a loja
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto max-w-6xl py-8 px-4">
      <h1 className="text-3xl font-bold font-montserrat mb-8">Finalizar Compra</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-xl font-montserrat">Detalhes do pedido</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium font-montserrat">Informações Pessoais</h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome completo</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium font-montserrat">Endereço de Entrega</h3>
                    
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Endereço</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cidade</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Estado</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="zipCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CEP</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {isRental && (
                    <>
                      <Separator />
                      
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium font-montserrat">Detalhes do Aluguel</h3>
                        
                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            Você está alugando produtos que precisam ser devolvidos. Por favor, preencha as informações abaixo.
                          </AlertDescription>
                        </Alert>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="rentalStartDate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Data de Retirada</FormLabel>
                                <FormControl>
                                  <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="rentalEndDate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Data de Devolução</FormLabel>
                                <FormControl>
                                  <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={form.control}
                          name="pickupPreference"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Preferência de Retirada</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione uma opção" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="store">Retirar na loja</SelectItem>
                                  <SelectItem value="delivery">Entrega no endereço</SelectItem>
                                  <SelectItem value="appointment">Agendar visita para prova</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </>
                  )}
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium font-montserrat">Método de Pagamento</h3>
                    
                    <FormField
                      control={form.control}
                      name="paymentMethod"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex flex-col space-y-1"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="credit_card" id="credit_card" />
                                <Label htmlFor="credit_card" className="flex items-center">
                                  <CreditCard className="mr-2 h-4 w-4" />
                                  Cartão de Crédito
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="debit_card" id="debit_card" />
                                <Label htmlFor="debit_card" className="flex items-center">
                                  <CreditCard className="mr-2 h-4 w-4" />
                                  Cartão de Débito
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="pix" id="pix" />
                                <Label htmlFor="pix" className="flex items-center">
                                  <QrCode className="mr-2 h-4 w-4" />
                                  PIX (5% de desconto)
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="boleto" id="boleto" />
                                <Label htmlFor="boleto" className="flex items-center">
                                  <Money className="mr-2 h-4 w-4" />
                                  Boleto Bancário
                                </Label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {paymentMethod === 'credit_card' && (
                      <div className="space-y-4 border p-4 rounded-md">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <Label>Número do Cartão</Label>
                            <Input placeholder="0000 0000 0000 0000" />
                          </div>
                          <div>
                            <Label>Nome no Cartão</Label>
                            <Input placeholder="NOME COMPLETO" />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Validade</Label>
                            <Input placeholder="MM/AA" />
                          </div>
                          <div>
                            <Label>CVV</Label>
                            <Input placeholder="123" />
                          </div>
                        </div>
                        
                        <div>
                          <Label>Parcelas</Label>
                          <Select 
                            defaultValue="1"
                            onValueChange={(value) => setSelectedInstallments(parseInt(value))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">À vista</SelectItem>
                              {[...Array(9)].map((_, i) => (
                                <SelectItem key={i+2} value={(i+2).toString()}>
                                  {i+2}x de {formatCurrency(calculateInstallmentValue(total, i+2) / (i+2))}
                                  {i > 0 && " (com juros)"}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {selectedInstallments > 1 && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Total com juros: {formatCurrency(calculateInstallmentValue(total, selectedInstallments))}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {paymentMethod === 'pix' && (
                      <Alert className="bg-green-50 border-green-200">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <AlertDescription className="text-green-700">
                          PIX selecionado. Você receberá um QR code para pagamento após finalizar o pedido. 
                          Aplicamos 5% de desconto para este método de pagamento!
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {paymentMethod === 'boleto' && (
                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                          Boleto selecionado. Você receberá o boleto para pagamento após finalizar o pedido.
                          O prazo de compensação é de até 3 dias úteis.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                  
                  <Separator />
                  
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Observações (opcional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="Informações adicionais sobre seu pedido..."
                            rows={3} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="pt-4">
                    <Button 
                      type="submit" 
                      className="w-full bg-brand-purple hover:bg-brand-purple/90"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="mr-2">Processando...</span>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        </>
                      ) : (
                        `Finalizar compra: ${formatCurrency(selectedInstallments > 1 ? 
                          calculateInstallmentValue(total, selectedInstallments) : total)}`
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle className="text-xl font-montserrat">Resumo do Pedido</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="max-h-[300px] overflow-y-auto space-y-3">
                  {cart.map((item) => {
                    const price = item.promoPrice || item.salePrice || item.price;
                    const totalPrice = price * item.quantity;
                    
                    return (
                      <div key={item.id} className="flex gap-3">
                        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="h-full w-full object-cover object-center"
                          />
                        </div>
                        <div className="flex flex-1 flex-col">
                          <div className="flex justify-between text-sm font-medium text-gray-900">
                            <h3 className="font-montserrat line-clamp-2">
                              {item.name}
                              {item.isRental && <span className="text-brand-purple"> (Aluguel)</span>}
                            </h3>
                          </div>
                          <div className="mt-auto flex items-end justify-between">
                            <p className="text-xs text-gray-500">Qtd: {item.quantity}</p>
                            <div className="text-right">
                              <p className="text-sm font-medium text-gray-900">
                                {formatCurrency(totalPrice)}
                              </p>
                              {(item.salePrice || item.promoPrice) && (
                                <p className="text-xs text-gray-500 line-through">
                                  {formatCurrency(item.price * item.quantity)}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <Separator />
                
                <div className="flex items-center">
                  <Input
                    type="text"
                    placeholder="Código do cupom"
                    className="flex-1"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    disabled={!!coupon || applyCouponLoading}
                  />
                  <Button
                    className="ml-2 shrink-0"
                    onClick={coupon ? handleRemoveCoupon : handleApplyCoupon}
                    disabled={applyCouponLoading}
                    variant={coupon ? "destructive" : "default"}
                  >
                    {applyCouponLoading ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    ) : coupon ? (
                      <Trash2 className="h-4 w-4" />
                    ) : (
                      "Aplicar"
                    )}
                  </Button>
                </div>
                
                {coupon && (
                  <Alert className="bg-green-50 border-green-200">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <AlertDescription className="text-green-700">
                      Cupom {coupon.code} aplicado!{' '}
                      {coupon.discount_type === 'percentage' ? (
                        `${coupon.discount_value}% de desconto`
                      ) : (
                        `${formatCurrency(coupon.discount_value)} de desconto`
                      )}
                    </AlertDescription>
                  </Alert>
                )}
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Desconto do cupom</span>
                      <span className="text-green-600">-{formatCurrency(couponDiscount)}</span>
                    </div>
                  )}
                  
                  {pixDiscountAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Desconto PIX (5%)</span>
                      <span className="text-green-600">-{formatCurrency(pixDiscountAmount)}</span>
                    </div>
                  )}
                  
                  {selectedInstallments > 1 && paymentMethod === 'credit_card' && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Juros ({selectedInstallments}x)</span>
                      <span className="text-rose-600">
                        +{formatCurrency(calculateInstallmentValue(total, selectedInstallments) - total)}
                      </span>
                    </div>
                  )}
                  
                  <Separator />
                  
                  <div className="flex justify-between font-montserrat">
                    <span className="text-lg font-medium">Total</span>
                    <span className="text-lg font-semibold">
                      {formatCurrency(selectedInstallments > 1 ? 
                        calculateInstallmentValue(total, selectedInstallments) : total)}
                    </span>
                  </div>
                  
                  {paymentMethod === 'credit_card' && selectedInstallments > 1 && (
                    <div className="text-sm text-gray-600 text-right">
                      {selectedInstallments}x de {formatCurrency(calculateInstallmentValue(total, selectedInstallments) / selectedInstallments)}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
