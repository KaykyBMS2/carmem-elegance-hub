
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Loader2, ChevronLeft, Save, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

// Define customer interface
interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  created_at: string;
  updated_at: string;
}

const CustomerDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Fetch customer data
  const { data: customerData, isLoading, error } = useQuery({
    queryKey: ['customer', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as Customer;
    }
  });
  
  useEffect(() => {
    if (customerData) {
      setCustomer(customerData);
    }
  }, [customerData]);
  
  if (isLoading) {
    return (
      <AdminLayout title="Detalhes do Cliente">
        <div className="flex h-[calc(100vh-200px)] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand-purple" />
        </div>
      </AdminLayout>
    );
  }
  
  if (error || !customer) {
    return (
      <AdminLayout title="Detalhes do Cliente">
        <div className="mt-8 text-center">
          <p className="text-lg text-muted-foreground">Cliente não encontrado ou erro ao carregar dados.</p>
          <Button 
            variant="outline"
            className="mt-4"
            onClick={() => navigate('/admin/customers')}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Voltar para Clientes
          </Button>
        </div>
      </AdminLayout>
    );
  }
  
  // Criar um component para ações
  const CustomerActions = () => (
    <div className="flex gap-2">
      <Button variant="outline" onClick={() => navigate('/admin/customers')}>
        <ChevronLeft className="mr-2 h-4 w-4" />
        Voltar
      </Button>
    </div>
  );
  
  return (
    <AdminLayout title={`Cliente: ${customer.name}`}>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <p className="text-muted-foreground">
            Cadastrado em {format(new Date(customer.created_at), 'dd/MM/yyyy', { locale: pt })}
          </p>
        </div>
        <CustomerActions />
      </div>
      
      <div className="space-y-6 rounded-lg border p-6 shadow-sm">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <Label htmlFor="name">Nome</Label>
            <Input 
              id="name" 
              value={customer.name} 
              readOnly={!isEditing} 
              className={!isEditing ? "bg-muted" : ""}
              onChange={(e) => setCustomer({...customer, name: e.target.value})}
            />
          </div>
          
          <div>
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              value={customer.email} 
              readOnly={!isEditing}
              className={!isEditing ? "bg-muted" : ""} 
              onChange={(e) => setCustomer({...customer, email: e.target.value})}
            />
          </div>
          
          <div>
            <Label htmlFor="phone">Telefone</Label>
            <Input 
              id="phone" 
              value={customer.phone || ''} 
              readOnly={!isEditing}
              className={!isEditing ? "bg-muted" : ""} 
              onChange={(e) => setCustomer({...customer, phone: e.target.value})}
            />
          </div>
          
          <div>
            <Label htmlFor="address">Endereço</Label>
            <Input 
              id="address" 
              value={customer.address || ''} 
              readOnly={!isEditing}
              className={!isEditing ? "bg-muted" : ""} 
              onChange={(e) => setCustomer({...customer, address: e.target.value})}
            />
          </div>
          
          <div>
            <Label htmlFor="city">Cidade</Label>
            <Input 
              id="city" 
              value={customer.city || ''} 
              readOnly={!isEditing}
              className={!isEditing ? "bg-muted" : ""} 
              onChange={(e) => setCustomer({...customer, city: e.target.value})}
            />
          </div>
          
          <div>
            <Label htmlFor="state">Estado</Label>
            <Input 
              id="state" 
              value={customer.state || ''} 
              readOnly={!isEditing}
              className={!isEditing ? "bg-muted" : ""} 
              onChange={(e) => setCustomer({...customer, state: e.target.value})}
            />
          </div>
          
          <div>
            <Label htmlFor="postal_code">CEP</Label>
            <Input 
              id="postal_code" 
              value={customer.postal_code || ''} 
              readOnly={!isEditing}
              className={!isEditing ? "bg-muted" : ""} 
              onChange={(e) => setCustomer({...customer, postal_code: e.target.value})}
            />
          </div>
        </div>
        
        {isEditing ? (
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancelar
            </Button>
            <Button className="gap-1">
              <Save className="h-4 w-4" />
              Salvar
            </Button>
          </div>
        ) : (
          <div className="flex justify-end">
            <Button 
              variant="outline" 
              onClick={() => setIsEditing(true)}
            >
              Editar Informações
            </Button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default CustomerDetail;
