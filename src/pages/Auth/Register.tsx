
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  User, 
  Phone, 
  MapPin,
  Calendar,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

// Esquema de validação para o formulário
const signupSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postal_code: z.string().optional(),
  birth_date: z.string().optional(),
}).refine(data => data.password === data.confirmPassword, {
  message: "As senhas não conferem",
  path: ["confirmPassword"],
});

type SignupFormValues = z.infer<typeof signupSchema>;

const Register = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Configuração do formulário
  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      postal_code: '',
      birth_date: '',
    },
  });
  
  // Função para fazer o registro
  const onSubmit = async (data: SignupFormValues) => {
    setIsSubmitting(true);
    
    try {
      const { error } = await signUp(data.email, data.password, {
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        address: data.address || null,
        city: data.city || null,
        state: data.state || null,
        postal_code: data.postal_code || null,
        birth_date: data.birth_date || null,
      });
      
      if (error) {
        toast({
          title: 'Erro ao criar conta',
          description: error.message || 'Verifique suas informações e tente novamente.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Conta criada com sucesso!',
          description: 'Verifique seu email para confirmar seu cadastro.',
        });
        navigate('/auth/login');
      }
    } catch (error: any) {
      toast({
        title: 'Erro ao criar conta',
        description: error.message || 'Ocorreu um erro inesperado.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Função para ir para o próximo passo
  const goToNextStep = () => {
    // Validar os campos do passo 1
    const step1Fields = ['name', 'email', 'password', 'confirmPassword'];
    const hasErrors = step1Fields.some(field => !!form.formState.errors[field as keyof SignupFormValues]);
    
    if (!hasErrors) {
      setStep(2);
    }
  };
  
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-10">
      {/* Elementos de design */}
      <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-brand-purple/20 blur-3xl"></div>
      <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-brand-purple/10 blur-3xl"></div>
      
      <div className="relative z-10 w-full max-w-xl rounded-2xl bg-white/90 p-6 shadow-xl backdrop-blur sm:p-8 md:p-10">
        {/* Cabeçalho */}
        <div className="mb-8 text-center">
          <Link to="/" className="inline-block">
            <h2 className="text-3xl font-bold text-brand-purple">Carmem Bezerra</h2>
            <p className="mt-1 text-gray-600">Elegância Materna</p>
          </Link>
          <div className="mt-6">
            <h1 className="text-2xl font-bold">Crie sua conta</h1>
            <p className="mt-2 text-gray-600">
              {step === 1 ? 'Comece sua jornada com informações básicas' : 'Informações adicionais (opcional)'}
            </p>
          </div>
        </div>
        
        {/* Indicador de passos */}
        <div className="mb-8 flex justify-center">
          <div className="flex items-center">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full ${step === 1 ? 'bg-brand-purple text-white' : 'bg-brand-purple text-white'}`}>
              1
            </div>
            <div className={`h-1 w-16 ${step > 1 ? 'bg-brand-purple' : 'bg-gray-200'}`}></div>
            <div className={`flex h-8 w-8 items-center justify-center rounded-full ${step === 2 ? 'bg-brand-purple text-white' : 'bg-gray-200 text-gray-600'}`}>
              2
            </div>
          </div>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {step === 1 && (
              <>
                {/* Nome */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome completo</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <User className="h-5 w-5 text-gray-400" />
                          </div>
                          <Input 
                            placeholder="Seu nome completo" 
                            className="pl-10" 
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Email */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <Mail className="h-5 w-5 text-gray-400" />
                          </div>
                          <Input 
                            type="email" 
                            placeholder="seu-email@exemplo.com" 
                            className="pl-10" 
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Senha */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            type={showPassword ? 'text' : 'password'} 
                            placeholder="•••••••••" 
                            {...field} 
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 flex items-center pr-3"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-5 w-5 text-gray-400" />
                            ) : (
                              <Eye className="h-5 w-5 text-gray-400" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Confirmar Senha */}
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmar Senha</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            type={showConfirmPassword ? 'text' : 'password'} 
                            placeholder="•••••••••" 
                            {...field} 
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 flex items-center pr-3"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-5 w-5 text-gray-400" />
                            ) : (
                              <Eye className="h-5 w-5 text-gray-400" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button
                  className="w-full gap-1"
                  type="button"
                  onClick={goToNextStep}
                >
                  <Sparkles className="h-4 w-4" />
                  Continuar
                </Button>
              </>
            )}
            
            {step === 2 && (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  {/* Telefone */}
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                              <Phone className="h-5 w-5 text-gray-400" />
                            </div>
                            <Input 
                              placeholder="(00) 00000-0000" 
                              className="pl-10" 
                              {...field} 
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Data de Nascimento */}
                  <FormField
                    control={form.control}
                    name="birth_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data de Nascimento</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                              <Calendar className="h-5 w-5 text-gray-400" />
                            </div>
                            <Input 
                              type="date" 
                              className="pl-10" 
                              {...field} 
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* Endereço */}
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Endereço</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <MapPin className="h-5 w-5 text-gray-400" />
                          </div>
                          <Input 
                            placeholder="Seu endereço completo" 
                            className="pl-10" 
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid gap-4 md:grid-cols-3">
                  {/* Cidade */}
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cidade</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Sua cidade" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Estado */}
                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Estado" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* CEP */}
                  <FormField
                    control={form.control}
                    name="postal_code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CEP</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="00000-000" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    type="button"
                    onClick={() => setStep(1)}
                  >
                    Voltar
                  </Button>
                  
                  <Button
                    className="flex-1 gap-1"
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-t-transparent border-white"></div>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Criar Conta
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </form>
        </Form>
        
        <div className="mt-6 text-center text-sm">
          Já tem uma conta?{' '}
          <Link to="/auth/login" className="font-medium text-brand-purple hover:underline">
            Faça login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
