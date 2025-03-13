
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, ChevronRight, Clock, CreditCard, QrCode, Copy, Money } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  price: number;
  is_rental: boolean;
  product: {
    name: string;
    id: string;
  };
  product_images: {
    image_url: string;
  }[];
}

interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  total_amount: number;
  status: string;
  payment_method: string;
  payment_status: string;
  coupon_discount: number;
  installments: number;
  created_at: string;
  rental_start_date: string | null;
  rental_end_date: string | null;
  rental_pickup_preference: string | null;
  customer_notes: string | null;
}

const OrderConfirmation = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId) return;
      
      try {
        setLoading(true);
        
        // Fetch order details
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .single();
          
        if (orderError) throw orderError;
        
        setOrder(orderData);
        
        // Fetch order items with product details
        const { data: itemsData, error: itemsError } = await supabase
          .from('order_items')
          .select(`
            *,
            product:product_id (
              name,
              id
            ),
            product_images:product_id (
              image_url
            )
          `)
          .eq('order_id', orderId);
          
        if (itemsError) throw itemsError;
        
        setOrderItems(itemsData || []);
      } catch (error) {
        console.error('Error fetching order details:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrderDetails();
  }, [orderId]);
  
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };
  
  // Format payment method display
  const formatPaymentMethod = (method: string) => {
    const methods: Record<string, { label: string; icon: React.ReactNode }> = {
      'credit_card': { 
        label: 'Cartão de Crédito', 
        icon: <CreditCard className="h-4 w-4" /> 
      },
      'debit_card': { 
        label: 'Cartão de Débito', 
        icon: <CreditCard className="h-4 w-4" /> 
      },
      'pix': { 
        label: 'PIX', 
        icon: <QrCode className="h-4 w-4" /> 
      },
      'boleto': { 
        label: 'Boleto Bancário', 
        icon: <Money className="h-4 w-4" /> 
      },
    };
    
    return methods[method] || { label: method, icon: null };
  };
  
  // Format pickup preference display
  const formatPickupPreference = (preference: string | null) => {
    if (!preference) return 'Não especificado';
    
    const preferences: Record<string, string> = {
      'store': 'Retirar na loja',
      'delivery': 'Entrega no endereço',
      'appointment': 'Agendar visita para prova',
    };
    
    return preferences[preference] || preference;
  };
  
  // Copy order ID to clipboard
  const copyOrderId = () => {
    if (!order) return;
    
    navigator.clipboard.writeText(order.id);
    toast({
      title: "Copiado!",
      description: "Número do pedido copiado para a área de transferência",
    });
  };
  
  if (loading) {
    return (
      <div className="container mx-auto max-w-3xl py-16 px-4 flex justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-purple border-t-transparent"></div>
      </div>
    );
  }
  
  if (!order) {
    return (
      <div className="container mx-auto max-w-3xl py-16 px-4">
        <Card className="text-center py-8">
          <CardContent>
            <h1 className="text-2xl font-bold font-montserrat mb-4">Pedido não encontrado</h1>
            <p className="text-muted-foreground mb-6">
              Não foi possível encontrar informações para o pedido solicitado.
            </p>
            <Button asChild className="bg-brand-purple hover:bg-brand-purple/90">
              <Link to="/shop">Voltar para a loja</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const { payment_method } = order;
  const paymentInfo = formatPaymentMethod(payment_method);
  
  return (
    <div className="container mx-auto max-w-3xl py-16 px-4">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold font-montserrat">
            Pedido Confirmado!
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="rounded-lg bg-muted p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Número do pedido</p>
                <div className="flex items-center">
                  <p className="font-montserrat font-medium">
                    {order.id.split('-')[0]}...
                  </p>
                  <button 
                    onClick={copyOrderId} 
                    className="ml-2 text-muted-foreground hover:text-foreground"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Data do pedido</p>
                <p className="font-medium">
                  {format(new Date(order.created_at), 'dd/MM/yyyy', { locale: pt })}
                </p>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium font-montserrat mb-3">Seus dados</h3>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div>
                <dt className="text-muted-foreground">Nome</dt>
                <dd>{order.customer_name}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Email</dt>
                <dd>{order.customer_email}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Telefone</dt>
                <dd>{order.customer_phone || 'Não informado'}</dd>
              </div>
            </dl>
          </div>
          
          {(order.rental_start_date || order.rental_end_date) && (
            <div>
              <h3 className="text-lg font-medium font-montserrat mb-3">Detalhes do Aluguel</h3>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                {order.rental_start_date && (
                  <div>
                    <dt className="text-muted-foreground">Data de Retirada</dt>
                    <dd>{format(new Date(order.rental_start_date), 'dd/MM/yyyy', { locale: pt })}</dd>
                  </div>
                )}
                {order.rental_end_date && (
                  <div>
                    <dt className="text-muted-foreground">Data de Devolução</dt>
                    <dd>{format(new Date(order.rental_end_date), 'dd/MM/yyyy', { locale: pt })}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-muted-foreground">Preferência de Retirada</dt>
                  <dd>{formatPickupPreference(order.rental_pickup_preference)}</dd>
                </div>
              </dl>
              {order.customer_notes && (
                <div className="mt-3">
                  <p className="text-muted-foreground text-sm">Observações:</p>
                  <p className="text-sm">{order.customer_notes}</p>
                </div>
              )}
            </div>
          )}
          
          <div>
            <h3 className="text-lg font-medium font-montserrat mb-3">Itens do Pedido</h3>
            <div className="space-y-3">
              {orderItems.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
                    <img
                      src={item.product_images?.[0]?.image_url || '/placeholder.svg'}
                      alt={item.product?.name}
                      className="h-full w-full object-cover object-center"
                    />
                  </div>
                  <div className="flex flex-1 flex-col">
                    <div className="flex justify-between text-sm font-medium text-gray-900">
                      <h3 className="font-montserrat">
                        {item.product?.name}
                        {item.is_rental && <span className="text-brand-purple"> (Aluguel)</span>}
                      </h3>
                    </div>
                    <div className="mt-auto flex items-end justify-between">
                      <p className="text-xs text-gray-500">Qtd: {item.quantity}</p>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {formatCurrency(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="text-lg font-medium font-montserrat mb-3">Resumo do Pagamento</h3>
            
            <div className="flex items-center mb-4">
              <div className="mr-2 flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                {paymentInfo.icon}
              </div>
              <div>
                <p className="font-medium">{paymentInfo.label}</p>
                {order.payment_method === 'credit_card' && order.installments > 1 && (
                  <p className="text-sm text-muted-foreground">
                    {order.installments}x de {formatCurrency(order.total_amount / order.installments)}
                  </p>
                )}
              </div>
            </div>
            
            <div className="rounded-lg border p-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(order.total_amount + order.coupon_discount)}</span>
                </div>
                
                {order.coupon_discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Desconto de cupom</span>
                    <span className="text-green-600">-{formatCurrency(order.coupon_discount)}</span>
                  </div>
                )}
                
                <Separator />
                
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>{formatCurrency(order.total_amount)}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="rounded-lg bg-brand-purple/10 p-4">
            <div className="flex">
              <Clock className="h-5 w-5 text-brand-purple mr-2" />
              <div>
                <h4 className="font-medium font-montserrat">Status do Pedido: {order.status.toUpperCase()}</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Você receberá atualizações sobre o status do seu pedido por email.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-2 sm:flex-row sm:justify-between sm:space-x-0 sm:space-y-0">
          <Button asChild variant="outline">
            <Link to="/shop">
              Continuar comprando
            </Link>
          </Button>
          <Button asChild className="bg-brand-purple hover:bg-brand-purple/90">
            <Link to="/profile/orders">
              <span>Meus Pedidos</span>
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default OrderConfirmation;
