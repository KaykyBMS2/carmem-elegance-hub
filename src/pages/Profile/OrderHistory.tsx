
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
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
import { Button } from '@/components/ui/button';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Loader2,
  PackageCheck,
  RefreshCw,
  Search,
  ShoppingBag,
  Truck,
} from 'lucide-react';
import { Input } from '@/components/ui/input';

interface Order {
  id: string;
  created_at: string;
  status: string;
  total_amount: number;
  items_count: number;
}

const OrderHistory = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: orders, isLoading, error } = useQuery({
    queryKey: ['user-orders', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      // First get customer data for the current user
      const { data: customerData } = await supabase
        .from('user_profiles')
        .select('email')
        .eq('id', user.id)
        .single();
      
      if (!customerData) return [];
      
      // Then get orders for this customer email
      const { data: ordersData, error } = await supabase
        .from('orders')
        .select(`
          id,
          created_at,
          status,
          total_amount,
          order_items(count)
        `)
        .eq('customer_email', customerData.email)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Format the data
      return ordersData.map(order => ({
        id: order.id,
        created_at: order.created_at,
        status: order.status,
        total_amount: order.total_amount,
        items_count: order.order_items[0].count,
      })) as Order[];
    },
    enabled: !!user,
  });
  
  const filteredOrders = orders?.filter(order => 
    order.id.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4 text-yellow-500" />
            <span className="text-sm font-medium text-yellow-500">Pendente</span>
          </div>
        );
      case 'processing':
        return (
          <div className="flex items-center gap-1">
            <RefreshCw className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium text-blue-500">Em processamento</span>
          </div>
        );
      case 'shipped':
        return (
          <div className="flex items-center gap-1">
            <Truck className="h-4 w-4 text-purple-500" />
            <span className="text-sm font-medium text-purple-500">Enviado</span>
          </div>
        );
      case 'delivered':
        return (
          <div className="flex items-center gap-1">
            <PackageCheck className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium text-green-500">Entregue</span>
          </div>
        );
      case 'completed':
        return (
          <div className="flex items-center gap-1">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-600">Concluído</span>
          </div>
        );
      case 'cancelled':
        return (
          <div className="flex items-center gap-1">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <span className="text-sm font-medium text-red-500">Cancelado</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-500">{status}</span>
          </div>
        );
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de Pedidos</CardTitle>
        <CardDescription>
          Acompanhe e veja os detalhes dos seus pedidos anteriores.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="relative max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Buscar por ID do pedido..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-brand-purple" />
          </div>
        ) : error ? (
          <div className="py-10 text-center">
            <AlertCircle className="mx-auto mb-2 h-6 w-6 text-red-500" />
            <p className="text-lg font-medium">Erro ao carregar pedidos</p>
            <p className="text-sm text-muted-foreground">
              Ocorreu um erro ao tentar carregar seus pedidos. Tente novamente mais tarde.
            </p>
          </div>
        ) : filteredOrders && filteredOrders.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID do Pedido</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Itens</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">
                      #{order.id.substring(0, 8)}
                    </TableCell>
                    <TableCell>
                      {format(new Date(order.created_at), 'dd/MM/yyyy', { locale: pt })}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(order.status)}
                    </TableCell>
                    <TableCell>{order.items_count}</TableCell>
                    <TableCell className="text-right">
                      R$ {order.total_amount.toFixed(2).replace('.', ',')}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" className="gap-1">
                        <ShoppingBag className="h-4 w-4" />
                        <span className="hidden sm:inline">Detalhes</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <ShoppingBag className="mb-2 h-10 w-10 text-gray-300" />
            <h3 className="text-lg font-medium">Nenhum pedido encontrado</h3>
            <p className="text-sm text-muted-foreground">
              Você ainda não fez nenhum pedido ou nenhum pedido corresponde à sua busca.
            </p>
            <Button className="mt-4 gap-1">
              <ShoppingBag className="h-4 w-4" />
              Explorar produtos
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OrderHistory;
