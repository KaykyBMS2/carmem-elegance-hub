
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { 
  CheckCircle, 
  Clock, 
  Calendar, 
  ShoppingBag, 
  ChevronRight,
  CreditCard,
  QrCode,
  Wallet,
  Receipt
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  price: number;
  is_rental: boolean;
  rental_start_date: string | null;
  rental_end_date: string | null;
  product: {
    name: string;
    product_images: { image_url: string }[];
  };
}

interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  created_at: string;
  status: string;
  total_amount: number;
  payment_method: 'credit_card' | 'debit_card' | 'pix' | 'boleto';
  payment_status: string;
  coupon_discount: number;
  installments: number;
  rental_start_date: string | null;
  rental_end_date: string | null;
  items: OrderItem[];
}

const OrderConfirmation = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return;
      
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('orders')
          .select(`
            id,
            customer_name,
            customer_email,
            customer_phone,
            created_at,
            status,
            total_amount,
            payment_method,
            payment_status,
            coupon_discount,
            installments,
            rental_start_date,
            rental_end_date
          `)
          .eq('id', orderId)
          .single();
        
        if (error) {
          throw new Error('Pedido não encontrado');
        }
        
        // Fetch order items
        const { data: itemsData, error: itemsError } = await supabase
          .from('order_items')
          .select(`
            id,
            product_id,
            quantity,
            price,
            is_rental,
            rental_start_date,
            rental_end_date,
            product:product_id (
              name,
              product_images (image_url)
            )
          `)
          .eq('order_id', orderId);
        
        if (itemsError) {
          throw new Error('Erro ao carregar itens do pedido');
        }
        
        setOrder({ ...data, items: itemsData } as Order);
        
      } catch (error) {
        console.error('Error fetching order:', error);
        setError(error instanceof Error ? error.message : 'Erro ao carregar o pedido');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrder();
  }, [orderId]);

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR').format(date);
  };

  // Get payment method icon and text
  const getPaymentMethod = (method: string) => {
    switch (method) {
      case 'credit_card':
        return { icon: <CreditCard className="h-5 w-5" />, text: 'Cartão de Crédito' };
      case 'debit_card':
        return { icon: <Wallet className="h-5 w-5" />, text: 'Cartão de Débito' };
      case 'pix':
        return { icon: <QrCode className="h-5 w-5" />, text: 'Pix' };
      case 'boleto':
        return { icon: <Receipt className="h-5 w-5" />, text: 'Boleto Bancário' };
      default:
        return { icon: <CreditCard className="h-5 w-5" />, text: 'Método de Pagamento' };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto">
            <Skeleton className="h-12 w-2/3 mb-6" />
            <Skeleton className="h-8 w-1/2 mb-4" />
            <Skeleton className="h-32 w-full mb-8 rounded-lg" />
            <Skeleton className="h-20 w-full mb-4 rounded-lg" />
            <Skeleton className="h-20 w-full mb-4 rounded-lg" />
            <Skeleton className="h-20 w-full rounded-lg" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow container mx-auto px-4 py-12 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4 font-montserrat">Pedido não encontrado</h1>
            <p className="text-gray-600 mb-8">Não foi possível encontrar o pedido solicitado.</p>
            <Link to="/shop">
              <Button className="bg-brand-purple hover:bg-brand-purple/90">
                Voltar para a loja
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <div className="flex-grow container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Order Success Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center bg-green-100 text-green-600 rounded-full p-3 mb-4">
              <CheckCircle className="h-8 w-8" />
            </div>
            <h1 className="text-3xl font-bold mb-2 font-montserrat">Pedido Recebido!</h1>
            <p className="text-gray-600 font-poppins">
              Seu pedido foi confirmado e está sendo processado.
            </p>
          </div>
          
          {/* Order Details Card */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold font-montserrat">Detalhes do Pedido</h2>
              <span className="text-sm text-gray-500">#{order.id.slice(0, 8)}</span>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">Data</p>
                <p className="font-medium">{formatDate(order.created_at)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Total</p>
                <p className="font-medium text-brand-purple">{formatCurrency(order.total_amount)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Pagamento</p>
                <div className="flex items-center">
                  {getPaymentMethod(order.payment_method).icon}
                  <span className="ml-1 text-sm">{getPaymentMethod(order.payment_method).text}</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Status</p>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 text-amber-500 mr-1" />
                  <span className="text-sm font-medium text-amber-500">Processando</span>
                </div>
              </div>
            </div>
            
            {(order.rental_start_date || order.rental_end_date) && (
              <>
                <Separator className="my-4" />
                <div className="bg-purple-50 rounded-md p-4 mb-4">
                  <h3 className="font-medium mb-2 flex items-center font-montserrat">
                    <Calendar className="h-4 w-4 mr-2 text-brand-purple" />
                    Informações do Aluguel
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Data de Retirada</p>
                      <p className="font-medium">{formatDate(order.rental_start_date || '')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Data de Devolução</p>
                      <p className="font-medium">{formatDate(order.rental_end_date || '')}</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
          
          {/* Order Items */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4 font-montserrat">Itens do Pedido</h2>
            
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center">
                  <div className="h-16 w-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                    <img 
                      src={item.product.product_images[0]?.image_url || '/placeholder.svg'} 
                      alt={item.product.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="ml-4 flex-grow min-w-0">
                    <p className="font-medium truncate">{item.product.name}</p>
                    <div className="flex items-center text-sm text-gray-500">
                      <span>Qtd: {item.quantity}</span>
                      {item.is_rental && (
                        <span className="ml-2 text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">
                          Aluguel
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(item.price * item.quantity)}</p>
                    <p className="text-sm text-gray-500">{formatCurrency(item.price)} por unidade</p>
                  </div>
                </div>
              ))}
            </div>
            
            <Separator className="my-4" />
            
            {/* Order Summary */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Subtotal</span>
                <span>{formatCurrency(order.total_amount + order.coupon_discount)}</span>
              </div>
              
              {order.coupon_discount > 0 && (
                <div className="flex justify-between text-sm text-green-600 mb-2">
                  <span>Desconto</span>
                  <span>-{formatCurrency(order.coupon_discount)}</span>
                </div>
              )}
              
              {order.payment_method === 'pix' && (
                <div className="flex justify-between text-sm text-green-600 mb-2">
                  <span>Desconto Pix (5%)</span>
                  <span>-{formatCurrency((order.total_amount + order.coupon_discount) * 0.05)}</span>
                </div>
              )}
              
              <div className="flex justify-between font-bold mt-2">
                <span>Total</span>
                <span className="text-brand-purple">{formatCurrency(order.total_amount)}</span>
              </div>
              
              {order.payment_method === 'credit_card' && order.installments > 1 && (
                <div className="text-right text-sm text-gray-500 mt-1">
                  {order.installments}x de {formatCurrency(order.total_amount / order.installments)}
                </div>
              )}
            </div>
          </div>
          
          {/* Next Steps and Support */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4 font-montserrat">Próximos Passos</h2>
            
            <div className="mb-4">
              <p className="text-gray-600 mb-2 font-poppins">
                Você receberá um email de confirmação em <span className="font-medium">{order.customer_email}</span> com os detalhes do seu pedido.
              </p>
              
              {order.payment_method === 'boleto' && (
                <div className="bg-amber-50 p-4 rounded-md mt-4 flex items-start">
                  <span className="p-1 bg-amber-100 rounded-full mr-3 mt-0.5">
                    <Receipt className="h-4 w-4 text-amber-600" />
                  </span>
                  <div>
                    <p className="font-medium text-amber-800 mb-1">Aguardando pagamento do boleto</p>
                    <p className="text-sm text-amber-700">
                      Enviamos o boleto para o seu email. Por favor, realize o pagamento para que possamos processar seu pedido.
                    </p>
                  </div>
                </div>
              )}
              
              {order.payment_method === 'pix' && (
                <div className="bg-green-50 p-4 rounded-md mt-4 flex items-start">
                  <span className="p-1 bg-green-100 rounded-full mr-3 mt-0.5">
                    <QrCode className="h-4 w-4 text-green-600" />
                  </span>
                  <div>
                    <p className="font-medium text-green-800 mb-1">Pix gerado</p>
                    <p className="text-sm text-green-700">
                      Enviamos os dados do Pix para o seu email. Realize o pagamento para confirmar seu pedido.
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <Link to="/shop" className="flex-1">
                <Button variant="outline" className="w-full">
                  Continuar Comprando
                </Button>
              </Link>
              <Link to="/profile/orders" className="flex-1">
                <Button className="w-full bg-brand-purple hover:bg-brand-purple/90">
                  Meus Pedidos
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default OrderConfirmation;
