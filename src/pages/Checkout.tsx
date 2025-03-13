
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShop } from '@/contexts/ShopContext';
import { useAuth } from '@/contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { 
  CreditCard,
  Receipt,
  Banknote,
  QrCode,
  Trash,
  AlertCircle,
  CheckCircle2,
  ShoppingBag,
  Calendar
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// Form schema for checkout
const checkoutFormSchema = z.object({
  name: z.string().min(3, { message: 'O nome é obrigatório' }),
  email: z.string().email({ message: 'Email inválido' }),
  phone: z.string().min(10, { message: 'Telefone inválido' }),
  address: z.string().min(5, { message: 'Endereço é obrigatório' }),
  city: z.string().min(2, { message: 'Cidade é obrigatória' }),
  state: z.string().min(2, { message: 'Estado é obrigatório' }),
  postalCode: z.string().min(8, { message: 'CEP inválido' }),
  paymentMethod: z.enum(['credit_card', 'debit_card', 'pix', 'boleto']),
  installments: z.number().optional(),
  couponCode: z.string().optional(),
  rentalStartDate: z.string().optional(),
  rentalEndDate: z.string().optional(),
  rentalPickupPreference: z.string().optional(),
  customerNotes: z.string().optional(),
});

type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_purchase_amount: number | null;
}

const Checkout = () => {
  const { cart, cartTotal, clearCart } = useShop();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [hasRentalItems, setHasRentalItems] = useState(false);
  
  // Check if there are rental items in the cart
  useEffect(() => {
    setHasRentalItems(cart.some(item => item.isRental));
  }, [cart]);

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      name: '',
      email: user?.email || '',
      phone: '',
      address: '',
      city: '',
      state: '',
      postalCode: '',
      paymentMethod: 'credit_card',
      installments: 1,
      couponCode: '',
      rentalStartDate: '',
      rentalEndDate: '',
      rentalPickupPreference: 'store',
      customerNotes: '',
    }
  });

  // Load user data if authenticated
  useEffect(() => {
    const loadUserProfile = async () => {
      if (isAuthenticated && user) {
        try {
          const { data, error } = await supabase
            .from('user_profiles')
            .select('name, phone, address, city, state, postal_code')
            .eq('id', user.id)
            .single();
          
          if (data && !error) {
            form.setValue('name', data.name || '');
            form.setValue('phone', data.phone || '');
            form.setValue('address', data.address || '');
            form.setValue('city', data.city || '');
            form.setValue('state', data.state || '');
            form.setValue('postalCode', data.postal_code || '');
          }
        } catch (error) {
          console.error('Error loading user profile:', error);
        }
      }
    };
    
    loadUserProfile();
  }, [isAuthenticated, user, form]);

  // Redirect if cart is empty
  useEffect(() => {
    if (cart.length === 0) {
      navigate('/shop');
    }
  }, [cart, navigate]);

  // Apply coupon code
  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Digite um código de cupom');
      return;
    }
    
    setCouponLoading(true);
    setCouponError('');
    
    try {
      const { data, error } = await supabase
        .from('discount_coupons')
        .select('*')
        .eq('code', couponCode.trim())
        .eq('is_active', true)
        .single();
      
      if (error) {
        setCouponError('Cupom inválido ou expirado');
        setCoupon(null);
        setDiscountAmount(0);
      } else if (data) {
        // Check if minimum purchase amount is met
        if (data.min_purchase_amount && cartTotal < data.min_purchase_amount) {
          setCouponError(`Este cupom requer uma compra mínima de R$${data.min_purchase_amount.toFixed(2)}`);
          setCoupon(null);
          setDiscountAmount(0);
          return;
        }
        
        // Calculate discount
        let discount = 0;
        if (data.discount_type === 'percentage') {
          discount = (cartTotal * data.discount_value) / 100;
        } else {
          discount = data.discount_value;
        }
        
        setCoupon(data);
        setDiscountAmount(discount);
        toast({
          title: "Cupom aplicado!",
          description: `Desconto de ${formatCurrency(discount)} aplicado à sua compra.`,
        });
      }
    } catch (error) {
      console.error('Error applying coupon:', error);
      setCouponError('Erro ao aplicar o cupom');
    } finally {
      setCouponLoading(false);
    }
  };

  // Remove coupon
  const removeCoupon = () => {
    setCoupon(null);
    setCouponCode('');
    setDiscountAmount(0);
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  // Calculate total with all discounts applied
  const calculateTotal = () => {
    let total = cartTotal;
    
    // Apply coupon discount if applicable
    if (coupon) {
      total -= discountAmount;
    }
    
    // Apply 5% PIX discount if applicable
    if (form.watch('paymentMethod') === 'pix') {
      total = total * 0.95; // 5% off
    }
    
    return Math.max(0, total);
  };

  // Calculate installment price
  const calculateInstallmentPrice = (totalAmount: number, installments: number) => {
    if (installments <= 1) return totalAmount;
    
    // Simple interest calculation (1.5% per month)
    const interestRate = 0.015;
    const installmentValue = (totalAmount * (1 + interestRate * installments)) / installments;
    return installmentValue;
  };

  // Handle form submission
  const onSubmit = async (values: CheckoutFormValues) => {
    if (cart.length === 0) {
      toast({
        title: "Carrinho vazio",
        description: "Adicione produtos ao carrinho antes de finalizar a compra.",
        variant: "destructive",
      });
      return;
    }
    
    setProcessing(true);
    
    try {
      // Calculate total with discounts
      const finalTotal = calculateTotal();
      
      // Create order in database
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_name: values.name,
          customer_email: values.email,
          customer_phone: values.phone,
          status: 'pending',
          total_amount: finalTotal,
          payment_method: values.paymentMethod,
          coupon_id: coupon?.id,
          coupon_discount: discountAmount,
          installments: values.installments || 1,
          payment_status: 'pending',
          rental_start_date: values.rentalStartDate || null,
          rental_end_date: values.rentalEndDate || null,
          rental_pickup_preference: values.rentalPickupPreference || null,
          customer_notes: values.customerNotes || null,
        })
        .select('id')
        .single();
      
      if (orderError) {
        throw new Error(`Erro ao criar pedido: ${orderError.message}`);
      }
      
      // Create order items
      const orderItems = cart.map(item => ({
        order_id: orderData.id,
        product_id: item.id,
        quantity: item.quantity,
        price: item.promoPrice || item.salePrice || item.price,
        is_rental: item.isRental || false,
        rental_start_date: values.rentalStartDate || null,
        rental_end_date: values.rentalEndDate || null,
      }));
      
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);
      
      if (itemsError) {
        throw new Error(`Erro ao criar itens do pedido: ${itemsError.message}`);
      }
      
      // Create customer record if it doesn't exist
      const { error: customerError } = await supabase
        .from('customers')
        .upsert({
          email: values.email,
          name: values.name,
          phone: values.phone,
          address: values.address,
          city: values.city,
          state: values.state,
          postal_code: values.postalCode,
        });
      
      if (customerError) {
        console.error('Error saving customer data:', customerError);
      }
      
      // Clear cart
      clearCart();
      
      // Redirect to success page
      toast({
        title: "Pedido realizado com sucesso!",
        description: "Você receberá uma confirmação por email em breve.",
      });
      
      // Redirect to confirmation page
      navigate(`/order-confirmation/${orderData.id}`);
      
    } catch (error) {
      console.error('Error processing order:', error);
      toast({
        title: "Erro ao processar o pedido",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao processar seu pedido. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <div className="flex-grow container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8 font-montserrat">Finalizar Compra</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Informações Pessoais</CardTitle>
                    <CardDescription>Preencha seus dados para a entrega</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome Completo</FormLabel>
                          <FormControl>
                            <Input placeholder="Seu nome completo" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="seu@email.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Telefone</FormLabel>
                            <FormControl>
                              <Input placeholder="(00) 00000-0000" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Endereço</FormLabel>
                          <FormControl>
                            <Input placeholder="Rua, número, complemento" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cidade</FormLabel>
                            <FormControl>
                              <Input placeholder="Sua cidade" {...field} />
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
                              <Input placeholder="UF" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="postalCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>CEP</FormLabel>
                            <FormControl>
                              <Input placeholder="00000-000" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
                
                {/* Rental Information (if applicable) */}
                {hasRentalItems && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Informações de Aluguel</CardTitle>
                      <CardDescription>Detalhes para os itens alugados</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        name="rentalPickupPreference"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Preferência de Retirada</FormLabel>
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="flex flex-col space-y-1"
                              >
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="store" id="store" />
                                  <Label htmlFor="store">Retirar na loja</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="delivery" id="delivery" />
                                  <Label htmlFor="delivery">Entrega (sujeito a taxas adicionais)</Label>
                                </div>
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="customerNotes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Observações</FormLabel>
                            <FormControl>
                              <Input placeholder="Alguma observação especial?" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                )}
                
                {/* Payment Method */}
                <Card>
                  <CardHeader>
                    <CardTitle>Método de Pagamento</CardTitle>
                    <CardDescription>Escolha como deseja pagar</CardDescription>
                  </CardHeader>
                  <CardContent>
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
                              <div className="flex items-center space-x-2 border p-3 rounded-md">
                                <RadioGroupItem value="credit_card" id="credit_card" />
                                <Label htmlFor="credit_card" className="flex items-center">
                                  <CreditCard className="h-4 w-4 mr-2" />
                                  Cartão de Crédito
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2 border p-3 rounded-md">
                                <RadioGroupItem value="debit_card" id="debit_card" />
                                <Label htmlFor="debit_card" className="flex items-center">
                                  <CreditCard className="h-4 w-4 mr-2" />
                                  Cartão de Débito
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2 border p-3 rounded-md">
                                <RadioGroupItem value="pix" id="pix" />
                                <Label htmlFor="pix" className="flex items-center">
                                  <QrCode className="h-4 w-4 mr-2" />
                                  Pix (5% de desconto)
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2 border p-3 rounded-md">
                                <RadioGroupItem value="boleto" id="boleto" />
                                <Label htmlFor="boleto" className="flex items-center">
                                  <Receipt className="h-4 w-4 mr-2" />
                                  Boleto Bancário
                                </Label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Credit Card Installments */}
                    {form.watch('paymentMethod') === 'credit_card' && (
                      <div className="mt-4">
                        <FormField
                          control={form.control}
                          name="installments"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Parcelas</FormLabel>
                              <FormControl>
                                <select
                                  className="w-full border border-gray-300 rounded-md p-2"
                                  value={field.value}
                                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                                >
                                  {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                                    <option key={num} value={num}>
                                      {num}x de {formatCurrency(calculateInstallmentPrice(calculateTotal(), num) / num)}
                                      {num > 1 ? ' com juros' : ' sem juros'}
                                    </option>
                                  ))}
                                </select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <div className="flex justify-end">
                  <Button 
                    type="submit" 
                    className="bg-brand-purple hover:bg-brand-purple/90" 
                    size="lg"
                    disabled={processing}
                  >
                    {processing ? (
                      <>Processando<span className="ml-2 animate-pulse">...</span></>
                    ) : (
                      'Finalizar Compra'
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
          
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Resumo do Pedido</CardTitle>
                <CardDescription>
                  {cart.length} {cart.length === 1 ? 'item' : 'itens'} no carrinho
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Cart Items Summary */}
                <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4">
                      <div className="h-16 w-16 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                        <img 
                          src={item.imageUrl} 
                          alt={item.name} 
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium line-clamp-1">{item.name}</p>
                        <p className="text-sm text-gray-500">
                          Qtd: {item.quantity} x {formatCurrency(item.promoPrice || item.salePrice || item.price)}
                        </p>
                        {item.isRental && (
                          <p className="text-xs text-brand-purple">Aluguel</p>
                        )}
                      </div>
                      <p className="text-sm font-medium">
                        {formatCurrency((item.promoPrice || item.salePrice || item.price) * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
                
                <Separator />
                
                {/* Coupon Code */}
                <div>
                  <div className="flex gap-2 items-center">
                    <Input
                      placeholder="Código do cupom"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      disabled={!!coupon || couponLoading}
                      className="flex-1"
                    />
                    {coupon ? (
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={removeCoupon}
                        size="icon"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={applyCoupon}
                        disabled={couponLoading}
                      >
                        {couponLoading ? 'Aplicando...' : 'Aplicar'}
                      </Button>
                    )}
                  </div>
                  
                  {couponError && (
                    <p className="text-xs text-red-500 mt-1 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" /> {couponError}
                    </p>
                  )}
                  
                  {coupon && (
                    <p className="text-xs text-green-600 mt-1 flex items-center">
                      <CheckCircle2 className="h-3 w-3 mr-1" /> 
                      Cupom aplicado: {coupon.discount_type === 'percentage' 
                        ? `${coupon.discount_value}% de desconto` 
                        : `${formatCurrency(coupon.discount_value)} de desconto`}
                    </p>
                  )}
                </div>
                
                <Separator />
                
                {/* Order Totals */}
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>{formatCurrency(cartTotal)}</span>
                  </div>
                  
                  {coupon && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Desconto do cupom</span>
                      <span>-{formatCurrency(discountAmount)}</span>
                    </div>
                  )}
                  
                  {form.watch('paymentMethod') === 'pix' && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Desconto Pix (5%)</span>
                      <span>-{formatCurrency((cartTotal - discountAmount) * 0.05)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between font-bold text-lg pt-2">
                    <span>Total</span>
                    <span className="text-brand-purple">{formatCurrency(calculateTotal())}</span>
                  </div>
                  
                  {form.watch('paymentMethod') === 'credit_card' && form.watch('installments') > 1 && (
                    <div className="text-xs text-gray-500 text-right">
                      {form.watch('installments')}x de {formatCurrency(calculateInstallmentPrice(calculateTotal(), form.watch('installments') || 1) / (form.watch('installments') || 1))}
                    </div>
                  )}
                </div>
                
                {/* Payment Icons */}
                <div className="flex justify-center space-x-2 pt-4">
                  <CreditCard className="h-6 w-6 text-gray-400" />
                  <Receipt className="h-6 w-6 text-gray-400" />
                  <QrCode className="h-6 w-6 text-gray-400" />
                  <Banknote className="h-6 w-6 text-gray-400" />
                </div>
                
                {/* Secure checkout message */}
                <p className="text-xs text-center text-gray-500 flex items-center justify-center">
                  <ShoppingBag className="h-3 w-3 mr-1" />
                  Compra segura via Mercado Pago
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Checkout;
