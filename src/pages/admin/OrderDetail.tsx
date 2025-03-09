
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, User, Mail, Phone } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const OrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<string>('');
  
  const { data: order, isLoading: isOrderLoading } = useQuery({
    queryKey: ['admin-order', id],
    queryFn: async () => {
      if (!id) throw new Error('ID não fornecido');
      
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .single();
        
      if (orderError) throw orderError;
      
      setStatus(orderData.status);
      
      const { data: orderItems, error: itemsError } = await supabase
        .from('order_items')
        .select(`
          id,
          quantity,
          price,
          is_rental,
          rental_start_date,
          rental_end_date,
          product_id,
          combo_id,
          products:product_id (name, description),
          product_combos:combo_id (name, description)
        `)
        .eq('order_id', id);
        
      if (itemsError) throw itemsError;
      
      return {
        ...orderData,
        items: orderItems || []
      };
    },
    enabled: !!id
  });
  
  const updateOrderStatus = useMutation({
    mutationFn: async (newStatus: string) => {
      const { data, error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', id as string);
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Status atualizado",
        description: "O status do pedido foi atualizado com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ['admin-order', id] });
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar status",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao atualizar o status do pedido.",
        variant: "destructive",
      });
    }
  });
  
  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
    updateOrderStatus.mutate(newStatus);
  };
  
  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string, variant: "default" | "secondary" | "destructive" | "outline" }> = {
      'pending': { label: 'Pendente', variant: 'outline' },
      'processing': { label: 'Em processamento', variant: 'secondary' },
      'shipped': { label: 'Enviado', variant: 'default' },
      'delivered': { label: 'Entregue', variant: 'default' },
      'canceled': { label: 'Cancelado', variant: 'destructive' },
    };
    
    return statusMap[status] || { label: status, variant: 'outline' };
  };
  
  if (isOrderLoading) {
    return (
      <AdminLayout title="Detalhes do Pedido">
        <div className="flex justify-center p-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-purple border-t-transparent"></div>
        </div>
      </AdminLayout>
    );
  }
  
  if (!order) {
    return (
      <AdminLayout title="Pedido não encontrado">
        <div className="flex flex-col items-center justify-center p-12">
          <p className="mb-4 text-muted-foreground">O pedido solicitado não foi encontrado ou não existe.</p>
          <Button onClick={() => navigate('/admin/orders')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para lista de pedidos
          </Button>
        </div>
      </AdminLayout>
    );
  }
  
  const statusInfo = getStatusBadge(order.status);
  
  return (
    <AdminLayout 
      title={`Pedido #${order.id.split('-')[0]}...`}
      actions={
        <Button variant="outline" onClick={() => navigate('/admin/orders')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
      }
    >
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Itens do Pedido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {order.items.map((item) => {
                const itemName = item.products?.name || item.product_combos?.name || 'Item';
                const itemDescription = item.products?.description || item.product_combos?.description || '';
                
                return (
                  <div key={item.id} className="flex justify-between gap-4 rounded-lg border p-4">
                    <div className="flex-grow">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{itemName}</h4>
                        <p className="font-semibold">R$ {(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                      
                      <p className="mt-1 text-sm text-muted-foreground">{itemDescription}</p>
                      
                      <div className="mt-3 flex flex-wrap items-center gap-3">
                        <Badge variant="outline" className="text-xs">
                          Qtd: {item.quantity}
                        </Badge>
                        
                        <Badge variant="outline" className="text-xs">
                          Preço unitário: R$ {item.price.toFixed(2)}
                        </Badge>
                        
                        {item.is_rental && (
                          <Badge className="bg-brand-purple/20 text-xs text-brand-purple">
                            Aluguel
                          </Badge>
                        )}
                      </div>
                      
                      {item.is_rental && item.rental_start_date && item.rental_end_date && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          <span>Período: </span>
                          <span>
                            {format(new Date(item.rental_start_date), 'dd/MM/yyyy', { locale: pt })} até {' '}
                            {format(new Date(item.rental_end_date), 'dd/MM/yyyy', { locale: pt })}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              
              {order.items.length === 0 && (
                <div className="rounded-lg border border-dashed p-4 text-center text-muted-foreground">
                  Nenhum item encontrado neste pedido
                </div>
              )}
              
              <Separator className="my-4" />
              
              <div className="flex justify-between py-2 text-sm">
                <span>Subtotal</span>
                <span>R$ {order.total_amount.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between py-2 text-sm">
                <span>Frete</span>
                <span>R$ 0.00</span>
              </div>
              
              <Separator className="my-2" />
              
              <div className="flex justify-between py-2 font-semibold">
                <span>Total</span>
                <span>R$ {order.total_amount.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Status do Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status atual:</span>
                <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
              </div>
              
              <Select value={status} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Alterar status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="processing">Em processamento</SelectItem>
                  <SelectItem value="shipped">Enviado</SelectItem>
                  <SelectItem value="delivered">Entregue</SelectItem>
                  <SelectItem value="canceled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="text-xs text-muted-foreground">
                <p>Pedido criado em:</p>
                <p className="font-medium">
                  {format(new Date(order.created_at), 'dd/MM/yyyy HH:mm', { locale: pt })}
                </p>
              </div>
              
              <div className="text-xs text-muted-foreground">
                <p>Última atualização:</p>
                <p className="font-medium">
                  {format(new Date(order.updated_at), 'dd/MM/yyyy HH:mm', { locale: pt })}
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Dados do Cliente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{order.customer_name}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{order.customer_email}</span>
              </div>
              
              {order.customer_phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{order.customer_phone}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default OrderDetail;
