
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import { 
  ChevronLeft, 
  Loader2, 
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  Truck,
  PackageCheck
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

// Types
interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  combo_id: string | null;
  quantity: number;
  price: number;
  is_rental: boolean | null;
  rental_start_date: string | null;
  rental_end_date: string | null;
  product?: {
    name: string;
  };
  combo?: {
    name: string;
  };
}

interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  created_at: string;
  updated_at: string;
  status: string;
  total_amount: number;
  items?: OrderItem[];
}

const OrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [order, setOrder] = useState<Order | null>(null);
  const [status, setStatus] = useState<string>("");
  
  const { data: orderData, isLoading, error } = useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .single();
      
      if (orderError) throw orderError;
      
      const { data: itemsData, error: itemsError } = await supabase
        .from('order_items')
        .select(`
          *,
          product:product_id (name),
          combo:combo_id (name)
        `)
        .eq('order_id', id);
      
      if (itemsError) throw itemsError;
      
      return { ...orderData, items: itemsData } as Order;
    }
  });
  
  useEffect(() => {
    if (orderData) {
      setOrder(orderData);
      setStatus(orderData.status);
    }
  }, [orderData]);

  const updateOrderStatus = useMutation({
    mutationFn: async (newStatus: string) => {
      const { data, error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', id] });
      toast({
        title: 'Status atualizado',
        description: 'O status do pedido foi atualizado com sucesso.'
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao atualizar status',
        description: error.message,
        variant: 'destructive'
      });
    }
  });
  
  if (isLoading) {
    return (
      <AdminLayout title="Detalhes do Pedido">
        <div className="flex h-[calc(100vh-200px)] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand-purple" />
        </div>
      </AdminLayout>
    );
  }
  
  if (error || !order) {
    return (
      <AdminLayout title="Detalhes do Pedido">
        <div className="mt-8 text-center">
          <p className="text-lg text-muted-foreground">Pedido não encontrado ou erro ao carregar dados.</p>
          <Button 
            variant="outline"
            className="mt-4"
            onClick={() => navigate('/admin/orders')}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Voltar para Pedidos
          </Button>
        </div>
      </AdminLayout>
    );
  }
  
  // Componente para ações
  const OrderActions = () => (
    <div className="flex gap-2">
      <Button variant="outline" onClick={() => navigate('/admin/orders')}>
        <ChevronLeft className="mr-2 h-4 w-4" />
        Voltar
      </Button>
    </div>
  );

  // Função para renderizar o ícone de status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'processing':
        return <RefreshCw className="h-5 w-5 text-blue-500" />;
      case 'shipped':
        return <Truck className="h-5 w-5 text-purple-500" />;
      case 'delivered':
        return <PackageCheck className="h-5 w-5 text-green-500" />;
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'cancelled':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };
  
  return (
    <AdminLayout title={`Pedido #${order.id.substring(0, 8)}`}>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <p className="text-muted-foreground">
            Realizado em {format(new Date(order.created_at), 'dd/MM/yyyy HH:mm', { locale: pt })}
          </p>
        </div>
        <OrderActions />
      </div>
      
      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-6 rounded-lg border p-6 shadow-sm md:col-span-2">
          <div>
            <h3 className="mb-2 text-lg font-medium">Itens do Pedido</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-right">Qtd</TableHead>
                  <TableHead className="text-right">Preço</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.items && order.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      {item.product ? item.product.name : item.combo ? item.combo.name : 'Item indisponível'}
                    </TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">
                      R$ {item.price.toFixed(2).replace('.', ',')}
                    </TableCell>
                    <TableCell className="text-right">
                      R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={3} className="text-right font-medium">
                    Total do Pedido
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    R$ {order.total_amount.toFixed(2).replace('.', ',')}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="rounded-lg border p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-medium">Informações do Cliente</h3>
            <div className="space-y-2">
              <p><span className="font-medium">Nome:</span> {order.customer_name}</p>
              <p><span className="font-medium">Email:</span> {order.customer_email}</p>
              {order.customer_phone && (
                <p><span className="font-medium">Telefone:</span> {order.customer_phone}</p>
              )}
            </div>
          </div>
          
          <div className="rounded-lg border p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-medium">Status do Pedido</h3>
            <div className="mb-4 flex items-center gap-2">
              {getStatusIcon(order.status)}
              <span className="font-medium">
                {order.status === 'pending' && 'Pendente'}
                {order.status === 'processing' && 'Em processamento'}
                {order.status === 'shipped' && 'Enviado'}
                {order.status === 'delivered' && 'Entregue'}
                {order.status === 'completed' && 'Concluído'}
                {order.status === 'cancelled' && 'Cancelado'}
              </span>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Atualizar status:</p>
              <div className="flex gap-2">
                <Select 
                  value={status} 
                  onValueChange={setStatus}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Selecione um status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="processing">Em processamento</SelectItem>
                    <SelectItem value="shipped">Enviado</SelectItem>
                    <SelectItem value="delivered">Entregue</SelectItem>
                    <SelectItem value="completed">Concluído</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  size="sm" 
                  disabled={status === order.status || updateOrderStatus.isPending}
                  onClick={() => updateOrderStatus.mutate(status)}
                >
                  {updateOrderStatus.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Atualizar'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default OrderDetail;
