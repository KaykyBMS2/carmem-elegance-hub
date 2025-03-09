
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff, Mail, Sparkles } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signIn, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/profile');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await signIn(email, password);

      if (error) {
        throw error;
      }

      toast({
        title: 'Login realizado com sucesso',
        description: 'Bem-vindo de volta!',
      });
      
      navigate('/profile');
    } catch (error: any) {
      toast({
        title: 'Erro ao fazer login',
        description: error.message || 'Verifique suas credenciais e tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-10">
      {/* Elementos de design */}
      <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-brand-purple/20 blur-3xl"></div>
      <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-brand-purple/10 blur-3xl"></div>
      
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white/90 p-6 shadow-xl backdrop-blur sm:p-8">
        <div className="mb-8 text-center">
          <Link to="/" className="inline-block">
            <h1 className="text-3xl font-bold text-brand-purple">Carmem Bezerra</h1>
            <p className="mt-1 text-gray-600">Elegância Materna</p>
          </Link>
          <div className="mt-6">
            <h2 className="text-2xl font-bold">Bem-vinda de volta</h2>
            <p className="mt-2 text-gray-600">Entre com sua conta para continuar</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              E-mail
            </label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <div className="pointer-events-none flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-gray-500">
                <Mail size={16} />
              </div>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="block w-full flex-1 rounded-none rounded-r-md border border-gray-300 px-3 py-2 focus:border-brand-purple focus:outline-none focus:ring-1 focus:ring-brand-purple sm:text-sm"
                placeholder="seu-email@exemplo.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Senha
            </label>
            <div className="relative mt-1">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-brand-purple focus:outline-none focus:ring-1 focus:ring-brand-purple sm:text-sm"
                placeholder="•••••••••"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 transform"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <div className="mt-2 text-right text-sm">
              <Link to="/auth/forgot-password" className="text-brand-purple hover:underline">
                Esqueceu sua senha?
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-1 rounded-md bg-brand-purple px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-purple/90 focus:outline-none focus:ring-2 focus:ring-brand-purple focus:ring-offset-2 disabled:bg-brand-purple/70"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-t-transparent border-white"></div>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Entrar
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-8 flex items-center justify-center gap-2">
          <span className="h-px flex-1 bg-gray-300"></span>
          <span className="text-xs uppercase text-gray-500">ou</span>
          <span className="h-px flex-1 bg-gray-300"></span>
        </div>
        
        <div className="mt-6 grid">
          <Link 
            to="/auth/register" 
            className="flex items-center justify-center gap-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          >
            Criar uma nova conta
          </Link>
        </div>
        
        <div className="mt-6 text-center text-sm">
          <Link to="/" className="text-gray-600 hover:text-brand-purple">
            Voltar para a página inicial
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
