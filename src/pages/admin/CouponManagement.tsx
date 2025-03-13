
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { Plus, Trash2, Edit, Check } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Table } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Coupon form schema
const couponFormSchema = z.object({
  code: z.string().min(3, "Código deve ter pelo menos 3 caracteres"),
  discount_type: z.enum(["percentage", "fixed"]),
  discount_value: z.number().positive("Valor deve ser positivo"),
  min_purchase_amount: z.number().nonnegative("Valor mínimo não pode ser negativo").optional(),
  max_uses: z.number().int().nonnegative("Número máximo de usos não pode ser negativo").optional(),
  is_active: z.boolean().default(true),
  expires_at: z.string().optional(),
});

type CouponFormValues = z.infer<typeof couponFormSchema>;

const CouponManagement = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<any>(null);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Form setup
  const form = useForm<CouponFormValues>({
    resolver: zodResolver(couponFormSchema),
    defaultValues: {
      code: '',
      discount_type: 'percentage',
      discount_value: 0,
      min_purchase_amount: 0,
      max_uses: undefined,
      is_active: true,
      expires_at: '',
    },
  });
  
  const editForm = useForm<CouponFormValues>({
    resolver: zodResolver(couponFormSchema),
    defaultValues: {
      code: '',
      discount_type: 'percentage',
      discount_value: 0,
      min_purchase_amount: 0,
      max_uses: undefined,
      is_active: true,
      expires_at: '',
    },
  });
  
  // Fetch coupons
  const fetchCoupons = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('discount_coupons')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setCoupons(data || []);
    } catch (error: any) {
      console.error("Error fetching coupons:", error);
      toast({
        title: "Erro ao carregar cupons",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchCoupons();
  }, []);
  
  // Reset form when dialog closes
  useEffect(() => {
    if (!isAddDialogOpen) {
      form.reset();
    }
  }, [isAddDialogOpen, form]);
  
  // Set edit form values when a coupon is selected
  useEffect(() => {
    if (selectedCoupon && isEditDialogOpen) {
      editForm.reset({
        code: selectedCoupon.code,
        discount_type: selectedCoupon.discount_type as "percentage" | "fixed",
        discount_value: selectedCoupon.discount_value,
        min_purchase_amount: selectedCoupon.min_purchase_amount || undefined,
        max_uses: selectedCoupon.max_uses || undefined,
        is_active: selectedCoupon.is_active,
        expires_at: selectedCoupon.expires_at ? new Date(selectedCoupon.expires_at).toISOString().split('T')[0] : undefined,
      });
    }
  }, [selectedCoupon, isEditDialogOpen, editForm]);
  
  // Add new coupon
  const onSubmit = async (values: CouponFormValues) => {
    try {
      const { error } = await supabase.from('discount_coupons').insert({
        code: values.code.toUpperCase(),
        discount_type: values.discount_type,
        discount_value: values.discount_value,
        min_purchase_amount: values.min_purchase_amount || null,
        max_uses: values.max_uses || null,
        is_active: values.is_active,
        expires_at: values.expires_at ? new Date(values.expires_at).toISOString() : null,
      });
      
      if (error) throw error;
      
      toast({
        title: "Cupom criado",
        description: "O cupom foi criado com sucesso.",
      });
      
      setIsAddDialogOpen(false);
      fetchCoupons();
    } catch (error: any) {
      toast({
        title: "Erro ao criar cupom",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  
  // Update coupon
  const onUpdate = async (values: CouponFormValues) => {
    if (!selectedCoupon) return;
    
    try {
      const { error } = await supabase
        .from('discount_coupons')
        .update({
          code: values.code.toUpperCase(),
          discount_type: values.discount_type,
          discount_value: values.discount_value,
          min_purchase_amount: values.min_purchase_amount || null,
          max_uses: values.max_uses || null,
          is_active: values.is_active,
          expires_at: values.expires_at ? new Date(values.expires_at).toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedCoupon.id);
      
      if (error) throw error;
      
      toast({
        title: "Cupom atualizado",
        description: "O cupom foi atualizado com sucesso.",
      });
      
      setIsEditDialogOpen(false);
      setSelectedCoupon(null);
      fetchCoupons();
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar cupom",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  
  // Delete coupon
  const deleteCoupon = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este cupom?")) return;
    
    try {
      const { error } = await supabase
        .from('discount_coupons')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Cupom excluído",
        description: "O cupom foi excluído com sucesso.",
      });
      
      fetchCoupons();
    } catch (error: any) {
      toast({
        title: "Erro ao excluir cupom",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  
  const formatDiscountValue = (type: string, value: number) => {
    if (type === 'percentage') {
      return `${value}%`;
    } else {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(value);
    }
  };
  
  return (
    <AdminLayout title="Gerenciamento de Cupons">
      <div className="mb-6 flex justify-between items-center">
        <p className="text-muted-foreground">
          Gerencie os cupons de desconto da loja
        </p>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-brand-purple hover:bg-brand-purple/90">
              <Plus className="mr-2 h-4 w-4" />
              Novo Cupom
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Criar Novo Cupom</DialogTitle>
              <DialogDescription>
                Preencha as informações para criar um novo cupom de desconto.
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código do Cupom</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="CARMEM10" 
                          onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                        />
                      </FormControl>
                      <FormDescription>
                        Código que os clientes usarão para aplicar o desconto.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="discount_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Desconto</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="percentage">Porcentagem (%)</SelectItem>
                            <SelectItem value="fixed">Valor Fixo (R$)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="discount_value"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valor do Desconto</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0" 
                            step={form.watch("discount_type") === "percentage" ? "1" : "0.01"}
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="min_purchase_amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valor Mínimo de Compra (R$)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0" 
                            step="0.01" 
                            {...field}
                            value={field.value || ''}
                            onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormDescription>
                          Opcional. Deixe em branco para sem mínimo.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="max_uses"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Usos Máximos</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="1" 
                            step="1" 
                            {...field}
                            value={field.value || ''}
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormDescription>
                          Opcional. Deixe em branco para ilimitado.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="expires_at"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Expiração</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormDescription>
                        Opcional. Deixe em branco para sem validade.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="h-4 w-4 rounded border-gray-300 focus:ring-brand-purple"
                        />
                      </FormControl>
                      <FormLabel className="text-sm font-normal">Cupom Ativo</FormLabel>
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="bg-brand-purple hover:bg-brand-purple/90">
                    Criar Cupom
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        
        {/* Edit dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Editar Cupom</DialogTitle>
              <DialogDescription>
                Atualize as informações do cupom de desconto.
              </DialogDescription>
            </DialogHeader>
            
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(onUpdate)} className="space-y-4 pt-4">
                <FormField
                  control={editForm.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código do Cupom</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="CARMEM10" 
                          onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="discount_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Desconto</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="percentage">Porcentagem (%)</SelectItem>
                            <SelectItem value="fixed">Valor Fixo (R$)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={editForm.control}
                    name="discount_value"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valor do Desconto</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0" 
                            step={editForm.watch("discount_type") === "percentage" ? "1" : "0.01"}
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="min_purchase_amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valor Mínimo de Compra (R$)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0" 
                            step="0.01" 
                            {...field}
                            value={field.value || ''}
                            onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={editForm.control}
                    name="max_uses"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Usos Máximos</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="1" 
                            step="1" 
                            {...field}
                            value={field.value || ''}
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={editForm.control}
                  name="expires_at"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Expiração</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="h-4 w-4 rounded border-gray-300 focus:ring-brand-purple"
                        />
                      </FormControl>
                      <FormLabel className="text-sm font-normal">Cupom Ativo</FormLabel>
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="bg-brand-purple hover:bg-brand-purple/90">
                    Atualizar Cupom
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <div className="rounded-md border">
          <Table>
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Código
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Desconto
                </th>
                <th className="hidden px-4 py-3 text-left text-sm font-medium text-muted-foreground sm:table-cell">
                  Valor Mínimo
                </th>
                <th className="hidden px-4 py-3 text-left text-sm font-medium text-muted-foreground md:table-cell">
                  Usos
                </th>
                <th className="hidden px-4 py-3 text-left text-sm font-medium text-muted-foreground md:table-cell">
                  Validade
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
                  <td colSpan={7} className="py-6 text-center">
                    <div className="flex justify-center">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-brand-purple border-t-transparent"></div>
                    </div>
                  </td>
                </tr>
              ) : coupons.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-muted-foreground">
                    Nenhum cupom encontrado.
                  </td>
                </tr>
              ) : (
                coupons.map((coupon) => (
                  <tr key={coupon.id} className="border-t hover:bg-muted/50">
                    <td className="px-4 py-3 font-medium">
                      {coupon.code}
                    </td>
                    <td className="px-4 py-3">
                      {formatDiscountValue(coupon.discount_type, coupon.discount_value)}
                    </td>
                    <td className="hidden px-4 py-3 sm:table-cell">
                      {coupon.min_purchase_amount ? (
                        new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(coupon.min_purchase_amount)
                      ) : (
                        <span className="text-muted-foreground">Sem mínimo</span>
                      )}
                    </td>
                    <td className="hidden px-4 py-3 md:table-cell">
                      {coupon.current_uses || 0}
                      {coupon.max_uses ? ` / ${coupon.max_uses}` : ''}
                    </td>
                    <td className="hidden px-4 py-3 md:table-cell">
                      {coupon.expires_at ? (
                        format(new Date(coupon.expires_at), 'dd/MM/yyyy', { locale: pt })
                      ) : (
                        <span className="text-muted-foreground">Sem validade</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={coupon.is_active ? "default" : "outline"}
                        className={coupon.is_active ? "bg-green-100 text-green-800 hover:bg-green-100" : "bg-gray-100 text-gray-800"}
                      >
                        {coupon.is_active ? "Ativo" : "Inativo"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedCoupon(coupon);
                            setIsEditDialogOpen(true);
                          }}
                          className="h-8 w-8 p-0"
                        >
                          <span className="sr-only">Editar</span>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteCoupon(coupon.id)}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                        >
                          <span className="sr-only">Excluir</span>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>
      </Card>
    </AdminLayout>
  );
};

export default CouponManagement;
