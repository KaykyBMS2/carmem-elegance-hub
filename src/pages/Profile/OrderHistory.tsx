
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, PackageIcon, ShoppingCartIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface Order {
  id: string;
  created_at: string;
  status: string;
  total_amount: number;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return 'bg-amber-100 text-amber-800';
    case 'processing':
      return 'bg-blue-100 text-blue-800';
    case 'shipped':
      return 'bg-purple-100 text-purple-800';
    case 'delivered':
      return 'bg-green-100 text-green-800';
    case 'completed':
      return 'bg-teal-100 text-teal-800';
    case 'canceled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const OrderHistory = () => {
  const { user, profile } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user || !profile) return;

      setLoading(true);
      
      // Get customer details by email
      // Since we don't have direct user-to-orders linking, we'll search by email
      const { data: customerData } = await supabase
        .from('customers')
        .select('*')
        .eq('email', profile.email)
        .single();
        
      if (customerData) {
        // Get orders by customer email
        const { data: ordersData, error } = await supabase
          .from('orders')
          .select('*')
          .eq('customer_email', profile.email)
          .order('created_at', { ascending: false });
        
        if (!error && ordersData) {
          setOrders(ordersData as Order[]);
        }
      }
      
      setLoading(false);
    };

    fetchOrders();
  }, [user, profile]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Pedidos</CardTitle>
          <CardDescription>Acompanhe o status de todos os seus pedidos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-[150px]" />
                  <Skeleton className="h-4 w-[100px]" />
                </div>
                <Skeleton className="h-20 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (orders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Pedidos</CardTitle>
          <CardDescription>Acompanhe o status de todos os seus pedidos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <ShoppingCartIcon className="mb-2 h-10 w-10 text-gray-300" />
            <h3 className="text-lg font-medium">Sem pedidos</h3>
            <p className="text-sm text-muted-foreground">
              Você ainda não fez nenhum pedido conosco.
            </p>
            <Button variant="outline" className="mt-4">
              Explorar produtos
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de Pedidos</CardTitle>
        <CardDescription>Acompanhe o status de todos os seus pedidos</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="overflow-hidden rounded-lg border">
              <div className="flex items-center justify-between bg-muted/50 p-4">
                <div className="grid gap-1">
                  <div className="flex items-center gap-2">
                    <PackageIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      Pedido #{order.id.substring(0, 8)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CalendarIcon className="h-3 w-3" />
                    <span>
                      {format(new Date(order.created_at), "dd/MM/yyyy 'às' HH:mm")}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={getStatusColor(order.status)}>
                    {order.status === 'pending' && 'Pendente'}
                    {order.status === 'processing' && 'Em processamento'}
                    {order.status === 'shipped' && 'Enviado'}
                    {order.status === 'delivered' && 'Entregue'}
                    {order.status === 'completed' && 'Concluído'}
                    {order.status === 'canceled' && 'Cancelado'}
                  </Badge>
                  <div className="text-sm font-medium">
                    R$ {order.total_amount.toFixed(2)}
                  </div>
                </div>
              </div>
              <Separator />
              <div className="p-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex w-full items-center justify-center text-xs"
                >
                  Ver detalhes do pedido
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderHistory;
