
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Table } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, FileDown, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Customers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: customers, isLoading } = useQuery({
    queryKey: ['admin-customers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data || [];
    }
  });
  
  const filteredCustomers = customers?.filter(customer => 
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (customer.phone && customer.phone.includes(searchTerm))
  );
  
  const exportToCSV = () => {
    if (!customers) return;
    
    // Format data for CSV
    const csvContent = [
      ['ID', 'Nome', 'Email', 'Telefone', 'Cidade', 'Estado', 'Data de Cadastro'],
      ...customers.map(customer => [
        customer.id,
        customer.name,
        customer.email,
        customer.phone || '-',
        customer.city || '-',
        customer.state || '-',
        format(new Date(customer.created_at), 'dd/MM/yyyy', { locale: pt })
      ])
    ].map(row => row.join(',')).join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `clientes-${format(new Date(), 'dd-MM-yyyy')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <AdminLayout title="Clientes">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Buscar por nome, email ou telefone..."
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
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Nome
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Email
              </th>
              <th className="hidden px-4 py-3 text-left text-sm font-medium text-muted-foreground md:table-cell">
                Telefone
              </th>
              <th className="hidden px-4 py-3 text-left text-sm font-medium text-muted-foreground lg:table-cell">
                Localização
              </th>
              <th className="hidden px-4 py-3 text-left text-sm font-medium text-muted-foreground sm:table-cell">
                Cadastro
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
            ) : filteredCustomers && filteredCustomers.length > 0 ? (
              filteredCustomers.map((customer) => (
                <tr key={customer.id} className="border-t">
                  <td className="px-4 py-3">
                    <div className="font-medium">{customer.name}</div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {customer.email}
                  </td>
                  <td className="hidden px-4 py-3 text-sm md:table-cell">
                    {customer.phone || '-'}
                  </td>
                  <td className="hidden px-4 py-3 text-sm lg:table-cell">
                    {customer.city && customer.state 
                      ? `${customer.city}, ${customer.state}` 
                      : customer.city || customer.state || '-'
                    }
                  </td>
                  <td className="hidden px-4 py-3 text-sm sm:table-cell">
                    {format(new Date(customer.created_at), 'dd/MM/yyyy', { locale: pt })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to={`/admin/customers/${customer.id}`}
                      className="inline-flex items-center justify-center rounded-md p-1 text-sm font-medium ring-offset-background transition-colors hover:bg-muted hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <ChevronRight className="h-4 w-4" />
                      <span className="sr-only">Ver detalhes</span>
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                  Nenhum cliente encontrado
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>
    </AdminLayout>
  );
};

export default Customers;
