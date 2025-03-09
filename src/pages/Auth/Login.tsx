
import { useState, FormEvent, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, User, ArrowRight, LogIn } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

const Login = () => {
  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  
  // Register state
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  
  // Reset password state
  const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  
  // Loading states
  const [loginLoading, setLoginLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  
  const navigate = useNavigate();
  
  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        // Check if user is admin
        const { data: adminData } = await supabase
          .from('admin_users')
          .select('id')
          .eq('id', data.session.user.id)
          .single();
          
        if (adminData) {
          navigate('/admin/dashboard');
        } else {
          navigate('/account');
        }
      }
    };
    
    checkAuth();
  }, [navigate]);
  
  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });
      
      if (error) throw error;
      
      if (data.user) {
        toast({
          title: 'Login realizado com sucesso',
          description: 'Bem-vindo(a) de volta!',
        });
        
        // Check if user is admin
        const { data: adminData, error: adminError } = await supabase
          .from('admin_users')
          .select('id')
          .eq('id', data.user.id)
          .single();
          
        if (!adminError && adminData) {
          navigate('/admin/dashboard');
        } else {
          navigate('/account');
        }
      }
    } catch (error: any) {
      let errorMessage = 'Verifique suas credenciais e tente novamente.';
      
      if (error.message.includes('Invalid login credentials')) {
        errorMessage = 'Email ou senha inválidos. Verifique suas credenciais.';
      }
      
      toast({
        title: 'Erro ao fazer login',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoginLoading(false);
    }
  };
  
  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setRegisterLoading(true);
    
    if (registerPassword.length < 8) {
      toast({
        title: 'Senha fraca',
        description: 'A senha deve ter pelo menos 8 caracteres.',
        variant: 'destructive',
      });
      setRegisterLoading(false);
      return;
    }
    
    try {
      // Create user in auth
      const { data, error } = await supabase.auth.signUp({
        email: registerEmail,
        password: registerPassword,
        options: {
          data: {
            name: registerName,
          },
        },
      });
      
      if (error) throw error;
      
      if (data.user) {
        // Create customer profile
        const { error: customerError } = await supabase
          .from('customers')
          .insert([
            {
              id: data.user.id,
              name: registerName,
              email: registerEmail,
            },
          ]);
          
        if (customerError) throw customerError;
        
        toast({
          title: 'Conta criada com sucesso',
          description: 'Bem-vindo(a) à Carmem Bezerra!',
        });
        
        navigate('/account');
      }
    } catch (error: any) {
      let errorMessage = 'Ocorreu um erro ao criar sua conta.';
      
      if (error.message.includes('User already registered')) {
        errorMessage = 'Este email já está registrado. Tente fazer login.';
      }
      
      toast({
        title: 'Erro ao criar conta',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setRegisterLoading(false);
    }
  };
  
  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      
      toast({
        title: 'Email enviado',
        description: 'Verifique sua caixa de entrada para redefinir sua senha.',
      });
      
      setIsResetPasswordDialogOpen(false);
    } catch (error: any) {
      toast({
        title: 'Erro ao enviar email',
        description: error.message || 'Ocorreu um erro ao enviar o email de redefinição de senha.',
        variant: 'destructive',
      });
    } finally {
      setResetLoading(false);
    }
  };
  
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <div className="w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-xl md:flex">
        {/* Left side - Form */}
        <div className="p-6 md:w-1/2 md:p-8">
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-bold text-brand-purple">Carmem Bezerra</h1>
            <p className="mt-1 text-sm text-muted-foreground">Elegância Materna</p>
          </div>
          
          <Tabs defaultValue="login" className="mt-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Criar Conta</TabsTrigger>
            </TabsList>
            
            {/* Login Form */}
            <TabsContent value="login">
              <div className="mt-4 text-center">
                <h2 className="text-xl font-medium">Bem-vinda de volta</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Entre com suas credenciais para acessar sua conta
                </p>
              </div>
              
              <form onSubmit={handleLogin} className="mt-6 space-y-4">
                <div className="space-y-2">
                  <label htmlFor="login-email" className="text-sm font-medium">
                    Email
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <Input
                      id="login-email"
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="pl-10"
                      placeholder="seu@email.com"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="login-password" className="text-sm font-medium">
                      Senha
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsResetPasswordDialogOpen(true)}
                      className="text-xs text-brand-purple hover:underline"
                    >
                      Esqueceu a senha?
                    </button>
                  </div>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <Input
                      id="login-password"
                      type={showLoginPassword ? "text" : "password"}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="pl-10"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center pr-3"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                    >
                      {showLoginPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                </div>
                
                <Button type="submit" className="w-full" disabled={loginLoading}>
                  {loginLoading ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-t-transparent border-white"></div>
                  ) : (
                    <>
                      <LogIn className="mr-2 h-4 w-4" />
                      <span>Entrar</span>
                    </>
                  )}
                </Button>
              </form>
              
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-muted-foreground">ou</span>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-center">
                  <Link to="/" className="text-sm text-brand-purple hover:underline">
                    Voltar para página inicial
                  </Link>
                </div>
              </div>
            </TabsContent>
            
            {/* Register Form */}
            <TabsContent value="register">
              <div className="mt-4 text-center">
                <h2 className="text-xl font-medium">Crie sua conta</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Junte-se à Carmem Bezerra e desfrute de uma experiência exclusiva
                </p>
              </div>
              
              <form onSubmit={handleRegister} className="mt-6 space-y-4">
                <div className="space-y-2">
                  <label htmlFor="register-name" className="text-sm font-medium">
                    Nome completo
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <Input
                      id="register-name"
                      type="text"
                      value={registerName}
                      onChange={(e) => setRegisterName(e.target.value)}
                      className="pl-10"
                      placeholder="Seu nome completo"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="register-email" className="text-sm font-medium">
                    Email
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <Input
                      id="register-email"
                      type="email"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      className="pl-10"
                      placeholder="seu@email.com"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="register-password" className="text-sm font-medium">
                    Senha
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <Input
                      id="register-password"
                      type={showRegisterPassword ? "text" : "password"}
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      className="pl-10"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center pr-3"
                      onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                    >
                      {showRegisterPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    A senha deve ter pelo menos 8 caracteres
                  </p>
                </div>
                
                <Button type="submit" className="w-full" disabled={registerLoading}>
                  {registerLoading ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-t-transparent border-white"></div>
                  ) : (
                    <>
                      <User className="mr-2 h-4 w-4" />
                      <span>Criar Conta</span>
                    </>
                  )}
                </Button>
              </form>
              
              <div className="mt-6 text-center text-sm">
                <p className="text-muted-foreground">
                  Ao criar uma conta, você concorda com nossos{' '}
                  <Link to="/terms" className="text-brand-purple hover:underline">
                    Termos de Serviço
                  </Link>{' '}
                  e{' '}
                  <Link to="/privacy" className="text-brand-purple hover:underline">
                    Política de Privacidade
                  </Link>
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Right side - Image and benefits */}
        <div className="relative hidden bg-gradient-to-r from-brand-purple/80 to-brand-purple md:block md:w-1/2">
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
          <div className="relative flex h-full flex-col items-center justify-center p-8 text-white">
            <h2 className="mb-6 text-2xl font-bold">Vantagens da sua conta</h2>
            
            <ul className="space-y-4">
              <li className="flex items-start">
                <ArrowRight className="mr-2 h-5 w-5 shrink-0" />
                <span>Acompanhe seus pedidos em tempo real</span>
              </li>
              <li className="flex items-start">
                <ArrowRight className="mr-2 h-5 w-5 shrink-0" />
                <span>Acesso exclusivo a promoções e novidades</span>
              </li>
              <li className="flex items-start">
                <ArrowRight className="mr-2 h-5 w-5 shrink-0" />
                <span>Histórico completo de compras e aluguéis</span>
              </li>
              <li className="flex items-start">
                <ArrowRight className="mr-2 h-5 w-5 shrink-0" />
                <span>Experiência personalizada de acordo com suas preferências</span>
              </li>
              <li className="flex items-start">
                <ArrowRight className="mr-2 h-5 w-5 shrink-0" />
                <span>Notificações sobre status de pedidos e eventos especiais</span>
              </li>
            </ul>
            
            <div className="mt-8 w-full rounded-lg bg-white/20 p-4 backdrop-blur-sm">
              <p className="text-center font-medium">
                "A Carmem Bezerra transformou a minha experiência como mãe. Os produtos são incríveis e o atendimento é excepcional!"
              </p>
              <p className="mt-2 text-center text-sm opacity-80">— Mariana Silva, Cliente desde 2022</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Reset Password Dialog */}
      <Dialog open={isResetPasswordDialogOpen} onOpenChange={setIsResetPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Redefinir senha</DialogTitle>
            <DialogDescription>
              Digite seu email para receber instruções de redefinição de senha.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleResetPassword}>
            <div className="space-y-2 py-4">
              <label htmlFor="reset-email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="reset-email"
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="seu@email.com"
                required
              />
            </div>
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsResetPasswordDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={resetLoading}>
                {resetLoading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-t-transparent border-white"></div>
                ) : 'Enviar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Login;
