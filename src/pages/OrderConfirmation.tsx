
import { useState, useEffect } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { CheckCircle, Clock, Copy, DollarSign, Info, ShoppingBag } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Order, OrderItem } from '@/types/order';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useShop } from '@/contexts/ShopContext';

const OrderConfirmation = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const { clearCart } = useShop();
  
  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return;
      
      try {
        setLoading(true);
        
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .single();
          
        if (orderError) throw orderError;
        
        if (orderData) {
          setOrder(orderData);
          
          // Fetch order items
          const { data: itemsData, error: itemsError } = await supabase
            .from('order_items')
            .select(`
              *,
              product:products(id, name),
              product_images:product_images(image_url)
            `)
            .eq('order_id', orderId);
            
          if (itemsError) throw itemsError;
          
          if (itemsData) {
            const formattedItems: OrderItem[] = itemsData.map(item => {
              // Extract the image URL from the first product image
              let imageUrl = '/placeholder.svg';
              if (item.product_images && item.product_images.length > 0) {
                imageUrl = item.product_images[0].image_url;
              }
              
              return {
                ...item,
                product_images: [{image_url: imageUrl}]
              };
            });
            
            setOrderItems(formattedItems);
          }
          
          // Clear the cart after loading the order
          clearCart();
        }
      } catch (error) {
        console.error('Error fetching order:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os detalhes do pedido.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrder();
  }, [orderId, toast, clearCart]);
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };
  
  const copyOrderId = () => {
    if (orderId) {
      navigator.clipboard.writeText(orderId);
      setCopied(true);
      toast({
        title: 'Copiado',
        description: 'Número do pedido copiado para a área de transferência.',
      });
      
      setTimeout(() => setCopied(false), 2000);
    }
  };
  
  // Redirect if there's no order ID
  if (!orderId) {
    return <Navigate to="/" />;
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-10">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-purple border-t-transparent"></div>
            </div>
          ) : order ? (
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-4">
                  <CheckCircle className="h-10 w-10 text-green-600" />
                </div>
                <h1 className="text-3xl font-bold mb-2">Pedido Confirmado!</h1>
                <p className="text-gray-600">
                  Seu pedido foi recebido e está sendo processado.
                </p>
              </div>
              
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>Detalhes do Pedido</CardTitle>
                      <CardDescription>Pedido realizado em {
                        format(new Date(order.created_at), "d 'de' MMMM 'de' yyyy", { locale: ptBR })
                      }</CardDescription>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={copyOrderId}
                      className="flex items-center gap-1"
                    >
                      <Copy className="h-4 w-4" />
                      {copied ? 'Copiado!' : 'Copiar Nº'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Número do Pedido</h3>
                        <p className="font-medium">{orderId}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Status</h3>
                        <div className="flex items-center">
                          <span className="h-2 w-2 bg-amber-400 rounded-full mr-2"></span>
                          <span className="font-medium capitalize">{order.status}</span>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Forma de Pagamento</h3>
                        <p className="font-medium">{order.payment_method || 'PIX'}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Status do Pagamento</h3>
                        <div className="flex items-center">
                          <span className={`h-2 w-2 rounded-full mr-2 ${
                            order.payment_status === 'paid' ? 'bg-green-500' : 'bg-amber-400'
                          }`}></span>
                          <span className="font-medium capitalize">{order.payment_status || 'pendente'}</span>
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="font-medium mb-3">Itens do Pedido</h3>
                      <div className="space-y-3">
                        {orderItems.map((item) => (
                          <div key={item.id} className="flex gap-4">
                            <div className="h-16 w-16 flex-shrink-0 rounded-md overflow-hidden bg-gray-100">
                              {item.product_images && item.product_images[0] ? (
                                <img 
                                  src={item.product_images[0].image_url} 
                                  alt={item.product?.name} 
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center text-gray-400">
                                  <ShoppingBag className="h-6 w-6" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">{item.product?.name}</p>
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm">
                                <span>{item.quantity} {item.quantity > 1 ? 'unidades' : 'unidade'}</span>
                                {item.is_rental && (
                                  <span className="text-brand-purple">Aluguel</span>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">{formatCurrency(item.price * item.quantity)}</p>
                              <p className="text-sm text-muted-foreground">
                                {item.quantity > 1 && `${formatCurrency(item.price)} cada`}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="font-medium mb-3">Resumo</h3>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Subtotal</span>
                          <span>{formatCurrency(order.total_amount + (order.coupon_discount || 0))}</span>
                        </div>
                        
                        {!!order.coupon_discount && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Desconto</span>
                            <span className="text-green-600">-{formatCurrency(order.coupon_discount)}</span>
                          </div>
                        )}
                        
                        <div className="flex justify-between font-medium text-lg pt-2">
                          <span>Total</span>
                          <span>{formatCurrency(order.total_amount)}</span>
                        </div>
                        
                        {order.installments && order.installments > 1 && (
                          <div className="text-sm text-right text-muted-foreground">
                            ou {order.installments}x de {formatCurrency(order.total_amount / order.installments)}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {order.is_rental && (
                      <>
                        <Separator />
                        
                        <div>
                          <h3 className="font-medium mb-3">Detalhes do Aluguel</h3>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {order.rental_start_date && (
                              <div>
                                <p className="text-sm text-muted-foreground">Data de Retirada</p>
                                <p className="font-medium">{format(new Date(order.rental_start_date), "dd/MM/yyyy")}</p>
                              </div>
                            )}
                            
                            {order.rental_end_date && (
                              <div>
                                <p className="text-sm text-muted-foreground">Data de Devolução</p>
                                <p className="font-medium">{format(new Date(order.rental_end_date), "dd/MM/yyyy")}</p>
                              </div>
                            )}
                            
                            {order.rental_pickup_preference && (
                              <div className="col-span-full">
                                <p className="text-sm text-muted-foreground">Preferência de Retirada</p>
                                <p className="font-medium">{order.rental_pickup_preference}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                    
                    <div className="bg-blue-50 p-4 rounded-lg flex gap-3">
                      <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-blue-800 font-medium">Próximos passos</p>
                        <p className="text-blue-700 text-sm mt-1">
                          Você receberá um e-mail com a confirmação do pedido e instruções para pagamento.
                          Em caso de dúvidas, entre em contato conosco pelo WhatsApp.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="justify-between flex-wrap gap-4">
                  <Button asChild variant="outline">
                    <Link to="/profile/orders">Ver Meus Pedidos</Link>
                  </Button>
                  <Button asChild>
                    <Link to="/shop">Continuar Comprando</Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          ) : (
            <div className="text-center py-16">
              <ShoppingBag className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h2 className="text-2xl font-bold mb-2">Pedido não encontrado</h2>
              <p className="text-gray-600 mb-6">
                Não foi possível encontrar detalhes para este pedido.
              </p>
              <Button asChild>
                <Link to="/">Voltar para a página inicial</Link>
              </Button>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default OrderConfirmation;
