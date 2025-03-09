
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, User, Mail, Phone, MapPin, Calendar } from 'lucide-react';

const CustomerDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { data: customer, isLoading } = useQuery({
    queryKey: ['admin-customer', id],
    queryFn: async () => {
      if (!id) throw new Error('ID não fornecido');
      
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .select('*')
        .eq('id', id)
        .single();
        
      if (customerError) throw customerError;
      
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_email', customerData.email)
        .order('created_at', { ascending: false });
        
      if (ordersError) throw ordersError;
      
      return {
        ...customerData,
        orders: orders || []
      };
    },
    enabled: !!id
  });
  
  if (isLoading) {
    return (
      <AdminLayout title="Detalhes do Cliente">
        <div className="flex justify-center p-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-purple border-t-transparent"></div>
        </div>
      </AdminLayout>
    );
  }
  
  if (!customer) {
    return (
      <AdminLayout title="Cliente não encontrado">
        <div className="flex flex-col items-center justify-center p-12">
          <p className="mb-4 text-muted-foreground">O cliente solicitado não foi encontrado ou não existe.</p>
          <Button onClick={() => navigate('/admin/customers')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para lista de clientes
          </Button>
        </div>
      </AdminLayout>
    );
  }
  
  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, string> = {
      'pending': 'Pendente',
      'processing': 'Em processamento',
      'shipped': 'Enviado',
      'delivered': 'Entregue',
      'canceled': 'Cancelado',
    };
    
    return statusMap[status] || status;
  };
  
  return (
    <AdminLayout 
      title="Detalhes do Cliente"
      actions={
        <Button variant="outline" onClick={() => navigate('/admin/customers')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
      }
    >
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Informações Pessoais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{customer.name}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{customer.email}</span>
            </div>
            
            {customer.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{customer.phone}</span>
              </div>
            )}
            
            {(customer.address || customer.city || customer.state) && (
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <div className="text-sm">
                  {customer.address && <div>{customer.address}</div>}
                  {(customer.city || customer.state) && (
                    <div>
                      {customer.city && customer.city}
                      {customer.city && customer.state && ', '}
                      {customer.state && customer.state}
                    </div>
                  )}
                  {customer.postal_code && <div>CEP: {customer.postal_code}</div>}
                </div>
              </div>
            )}
            
            <Separator />
            
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                Cliente desde: {format(new Date(customer.created_at), 'dd/MM/yyyy', { locale: pt })}
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Histórico de Pedidos</CardTitle>
          </CardHeader>
          <CardContent>
            {customer.orders && customer.orders.length > 0 ? (
              <div className="space-y-4">
                {customer.orders.map((order) => (
                  <div key={order.id} className="flex justify-between rounded-lg border p-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Pedido #{order.id.split('-')[0]}...</span>
                        <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium">
                          {getStatusBadge(order.status)}
                        </span>
                      </div>
                      <div className="mt-1 text-sm text-muted-foreground">
                        {format(new Date(order.created_at), 'dd/MM/yyyy HH:mm', { locale: pt })}
                      </div>
                    </div>
                    <div className="flex flex-col items-end justify-between">
                      <div className="font-medium">R$ {order.total_amount.toFixed(2)}</div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 px-2"
                        onClick={() => navigate(`/admin/orders/${order.id}`)}
                      >
                        Ver detalhes
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
                <p>Este cliente ainda não realizou nenhum pedido.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default CustomerDetail;
