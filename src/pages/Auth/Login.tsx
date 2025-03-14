
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await signIn(email, password);
      
      if (error) throw error;
      
      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vinda de volta à Carmem Bezerra.",
      });
      
      navigate('/profile');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao fazer login",
        description: error.message || "Verifique suas credenciais e tente novamente.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="email" className="text-gray-700">E-mail</Label>
          <div className="relative mt-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
              <Mail size={16} />
            </div>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              className="pl-10 border-gray-300 focus:border-brand-purple focus:ring-brand-purple"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>
        
        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-gray-700">Senha</Label>
            <Link to="/auth/forgot-password" className="text-xs text-brand-purple hover:underline font-medium">
              Esqueceu a senha?
            </Link>
          </div>
          <div className="relative mt-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
              <Lock size={16} />
            </div>
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              className="pl-10 pr-10 border-gray-300 focus:border-brand-purple focus:ring-brand-purple"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
        
        <div className="flex items-center">
          <Checkbox 
            id="remember-me" 
            checked={rememberMe}
            onCheckedChange={(checked) => setRememberMe(checked as boolean)}
            className="text-brand-purple focus:ring-brand-purple"
          />
          <label htmlFor="remember-me" className="ml-2 text-sm text-gray-600">
            Lembrar-me
          </label>
        </div>
      </div>
      
      <Button 
        type="submit" 
        className="w-full bg-brand-purple hover:bg-brand-purple/90 font-bold py-2.5" 
        disabled={loading}
      >
        {loading ? (
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-t-transparent"></div>
        ) : (
          "Entrar"
        )}
      </Button>
    </form>
  );
};

export default Login;
