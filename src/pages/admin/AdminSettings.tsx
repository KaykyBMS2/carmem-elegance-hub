
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

const AdminSettings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [isCreateUserDialogOpen, setIsCreateUserDialogOpen] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<'admin' | 'staff'>('staff');
  
  const { data: adminUsers, isLoading: isLoadingAdmins } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data || [];
    }
  });
  
  const updatePassword = useMutation({
    mutationFn: async ({ currentPassword, newPassword }: { currentPassword: string, newPassword: string }) => {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      toast({
        title: "Senha atualizada",
        description: "Sua senha foi atualizada com sucesso.",
      });
      setNewPassword('');
      setConfirmPassword('');
      setCurrentPassword('');
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar senha",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao atualizar a senha.",
        variant: "destructive",
      });
    }
  });
  
  const createAdminUser = useMutation({
    mutationFn: async ({ email, password, role }: { email: string, password: string, role: 'admin' | 'staff' }) => {
      // Step 1: Create a new user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (authError) throw authError;
      if (!authData.user) throw new Error("Falha ao criar usuário");
      
      // Step 2: Add the user to admin_users table
      const { error: adminError } = await supabase
        .from('admin_users')
        .insert([{
          id: authData.user.id,
          email: email,
          role: role
        }]);
      
      if (adminError) {
        // If there's an error, try to clean up the created auth user
        await supabase.auth.admin.deleteUser(authData.user.id);
        throw adminError;
      }
      
      return authData.user;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setIsCreateUserDialogOpen(false);
      setNewUserEmail('');
      setNewUserPassword('');
      setNewUserRole('staff');
      toast({
        title: "Usuário administrador criado",
        description: "O novo usuário foi criado com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar usuário",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao criar o usuário.",
        variant: "destructive",
      });
    }
  });
  
  const updateAdminRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string, role: 'admin' | 'staff' }) => {
      const { data, error } = await supabase
        .from('admin_users')
        .update({ role })
        .eq('id', userId)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({
        title: "Função atualizada",
        description: "A função do usuário foi atualizada com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar função",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao atualizar a função do usuário.",
        variant: "destructive",
      });
    }
  });
  
  const deleteAdminUser = useMutation({
    mutationFn: async (userId: string) => {
      // First remove from admin_users table
      const { error: adminError } = await supabase
        .from('admin_users')
        .delete()
        .eq('id', userId);
        
      if (adminError) throw adminError;
      
      // Then delete the auth user
      const { error: authError } = await supabase.auth.admin.deleteUser(userId);
      if (authError) throw authError;
      
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({
        title: "Usuário removido",
        description: "O usuário foi removido com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao remover usuário",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao remover o usuário.",
        variant: "destructive",
      });
    }
  });
  
  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Senhas não coincidem",
        description: "A nova senha e a confirmação não coincidem.",
        variant: "destructive",
      });
      return;
    }
    
    if (newPassword.length < 8) {
      toast({
        title: "Senha fraca",
        description: "A nova senha deve ter pelo menos 8 caracteres.",
        variant: "destructive",
      });
      return;
    }
    
    updatePassword.mutate({ currentPassword, newPassword });
  };
  
  const handleCreateAdminUser = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newUserEmail || !newUserPassword) {
      toast({
        title: "Campos obrigatórios",
        description: "Email e senha são obrigatórios.",
        variant: "destructive",
      });
      return;
    }
    
    if (newUserPassword.length < 8) {
      toast({
        title: "Senha fraca",
        description: "A senha deve ter pelo menos 8 caracteres.",
        variant: "destructive",
      });
      return;
    }
    
    createAdminUser.mutate({ 
      email: newUserEmail, 
      password: newUserPassword, 
      role: newUserRole 
    });
  };
  
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  const handleRoleUpdate = (userId: string, role: 'admin' | 'staff') => {
    updateAdminRole.mutate({ userId, role });
  };
  
  return (
    <AdminLayout title="Configurações">
      <Tabs defaultValue="account">
        <TabsList className="mb-4">
          <TabsTrigger value="account">Minha Conta</TabsTrigger>
          <TabsTrigger value="users">Usuários Administrativos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="account">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Detalhes da Conta</CardTitle>
                <CardDescription>
                  Visualize e gerencie as informações da sua conta.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium">Email</label>
                      <Input value={user?.email || ''} readOnly disabled />
                    </div>
                    <div>
                      <label className="text-sm font-medium">ID</label>
                      <Input value={user?.id || ''} readOnly disabled />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Alterar Senha</CardTitle>
                <CardDescription>
                  Atualize a senha da sua conta para maior segurança.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordUpdate} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="current-password" className="text-sm font-medium">
                      Senha Atual
                    </label>
                    <Input
                      id="current-password"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label htmlFor="new-password" className="text-sm font-medium">
                        Nova Senha
                      </label>
                      <Input
                        id="new-password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="confirm-password" className="text-sm font-medium">
                        Confirmar Nova Senha
                      </label>
                      <Input
                        id="confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  
                  <Button type="submit" className="mt-2">
                    Atualizar Senha
                  </Button>
                </form>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Segurança da Conta</CardTitle>
                <CardDescription>
                  Opções de segurança e acesso da sua conta.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="destructive" onClick={handleSignOut}>
                  Sair da Conta
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="users">
          <div className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Usuários Administrativos</CardTitle>
                  <CardDescription>
                    Gerencie os usuários com acesso administrativo.
                  </CardDescription>
                </div>
                <Button onClick={() => setIsCreateUserDialogOpen(true)}>
                  Novo Usuário
                </Button>
              </CardHeader>
              <CardContent>
                {isLoadingAdmins ? (
                  <div className="flex justify-center p-8">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-purple border-t-transparent"></div>
                  </div>
                ) : adminUsers && adminUsers.length > 0 ? (
                  <div className="space-y-4">
                    {adminUsers.map((adminUser) => (
                      <div key={adminUser.id} className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                          <div className="font-medium">{adminUser.email}</div>
                          <div className="text-sm text-muted-foreground">
                            Função: {adminUser.role === 'admin' ? 'Administrador' : 'Funcionário'}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {adminUser.id !== user?.id && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRoleUpdate(
                                  adminUser.id, 
                                  adminUser.role === 'admin' ? 'staff' : 'admin'
                                )}
                              >
                                {adminUser.role === 'admin' ? 'Rebaixar' : 'Promover'}
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                  if (confirm(`Tem certeza que deseja remover o usuário ${adminUser.email}?`)) {
                                    deleteAdminUser.mutate(adminUser.id);
                                  }
                                }}
                              >
                                Remover
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
                    <p>Nenhum usuário administrativo encontrado.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Create Admin User Dialog */}
      <Dialog open={isCreateUserDialogOpen} onOpenChange={setIsCreateUserDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Novo Usuário Administrativo</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleCreateAdminUser} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-user-email">Email</Label>
              <Input
                id="new-user-email"
                type="email"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                placeholder="email@exemplo.com"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="new-user-password">Senha</Label>
              <Input
                id="new-user-password"
                type="password"
                value={newUserPassword}
                onChange={(e) => setNewUserPassword(e.target.value)}
                placeholder="Senha temporária"
                required
              />
              <p className="text-xs text-muted-foreground">
                A senha deve ter pelo menos 8 caracteres.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label>Função</Label>
              <div className="flex gap-4">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="role-staff"
                    name="role"
                    value="staff"
                    checked={newUserRole === 'staff'}
                    onChange={() => setNewUserRole('staff')}
                    className="mr-2"
                  />
                  <label htmlFor="role-staff">Funcionário</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="role-admin"
                    name="role"
                    value="admin"
                    checked={newUserRole === 'admin'}
                    onChange={() => setNewUserRole('admin')}
                    className="mr-2"
                  />
                  <label htmlFor="role-admin">Administrador</label>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateUserDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">
                Criar Usuário
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminSettings;
