
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { Calendar, ChevronRight, Search, FileDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Table } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

const Orders = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: orders, isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data || [];
    }
  });
  
  const filteredOrders = orders?.filter(order => 
    order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    order.customer_email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
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
  
  const exportToCSV = () => {
    if (!orders) return;
    
    // Format data for CSV
    const csvContent = [
      ['ID', 'Cliente', 'Email', 'Telefone', 'Total', 'Status', 'Data'],
      ...orders.map(order => [
        order.id,
        order.customer_name,
        order.customer_email,
        order.customer_phone || '-',
        `R$ ${order.total_amount.toFixed(2)}`,
        getStatusBadge(order.status).label,
        format(new Date(order.created_at), 'dd/MM/yyyy HH:mm', { locale: pt })
      ])
    ].map(row => row.join(',')).join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `pedidos-${format(new Date(), 'dd-MM-yyyy')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <AdminLayout title="Gerenciamento de Pedidos" description="Visualize e gerencie todos os pedidos.">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Buscar por cliente ou email..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button 
            variant="outline" 
            className="flex items-center gap-1" 
            onClick={exportToCSV}
          >
            <FileDown className="h-4 w-4" />
            <span>Exportar</span>
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <thead className="bg-muted/50">
            <tr>
              <th className="w-[120px] px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                ID
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Cliente
              </th>
              <th className="hidden px-4 py-3 text-left text-sm font-medium text-muted-foreground sm:table-cell">
                Total
              </th>
              <th className="hidden px-4 py-3 text-left text-sm font-medium text-muted-foreground md:table-cell">
                Data
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Status
              </th>
              <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-4 py-3 text-center">
                  <div className="flex justify-center p-4">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-purple border-t-transparent"></div>
                  </div>
                </td>
              </tr>
            ) : filteredOrders && filteredOrders.length > 0 ? (
              filteredOrders.map((order) => {
                const statusInfo = getStatusBadge(order.status);
                
                return (
                  <tr key={order.id} className="border-t">
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {order.id.split('-')[0]}...
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium">{order.customer_name}</p>
                        <p className="text-xs text-muted-foreground">{order.customer_email}</p>
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 text-sm sm:table-cell">
                      R$ {order.total_amount.toFixed(2)}
                    </td>
                    <td className="hidden px-4 py-3 text-sm md:table-cell">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{format(new Date(order.created_at), 'dd/MM/yyyy', { locale: pt })}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={statusInfo.variant}>
                        {statusInfo.label}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to={`/admin/orders/${order.id}`}
                        className="inline-flex items-center justify-center rounded-md p-1 text-sm font-medium ring-offset-background transition-colors hover:bg-muted hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        <ChevronRight className="h-4 w-4" />
                        <span className="sr-only">Ver detalhes</span>
                      </Link>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                  Nenhum pedido encontrado
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>
    </AdminLayout>
  );
};

export default Orders;
