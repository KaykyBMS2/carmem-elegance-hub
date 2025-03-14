
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "As senhas não coincidem",
        description: "Por favor, verifique sua senha e tente novamente."
      });
      return;
    }
    
    if (!agreeTerms) {
      toast({
        variant: "destructive",
        title: "Termos não aceitos",
        description: "Você precisa aceitar os termos para continuar."
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const { error } = await signUp(email, password, { 
        name, 
        email 
      });
      
      if (error) {
        console.error("Registration error details:", error);
        throw error;
      }
      
      toast({
        title: "Conta criada com sucesso!",
        description: "Bem-vinda à Carmem Bezerra. Você pode fazer login agora.",
      });
      
      navigate('/auth/login');
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        variant: "destructive",
        title: "Erro ao criar conta",
        description: error.message || "Ocorreu um erro ao criar sua conta. Tente novamente.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto glass-card p-8 rounded-xl shadow-subtle">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-montserrat font-bold text-gray-800">Criar Conta</h1>
        <p className="text-muted-foreground mt-2">Cadastre-se para começar a comprar</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          {/* Name input */}
          <div>
            <Label htmlFor="name">Nome completo</Label>
            <div className="relative mt-1">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                <User size={16} />
              </div>
              <Input
                id="name"
                type="text"
                placeholder="Seu nome completo"
                className="pl-10"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>
          
          {/* Email input */}
          <div>
            <Label htmlFor="register-email">E-mail</Label>
            <div className="relative mt-1">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                <Mail size={16} />
              </div>
              <Input
                id="register-email"
                type="email"
                placeholder="seu@email.com"
                className="pl-10"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          
          {/* Password input */}
          <div>
            <Label htmlFor="register-password">Senha</Label>
            <div className="relative mt-1">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                <Lock size={16} />
              </div>
              <Input
                id="register-password"
                type={showPassword ? "text" : "password"}
                className="pl-10 pr-10"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500">A senha deve ter pelo menos 6 caracteres</p>
          </div>
          
          {/* Confirm password input */}
          <div>
            <Label htmlFor="confirm-password">Confirmar senha</Label>
            <div className="relative mt-1">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                <Lock size={16} />
              </div>
              <Input
                id="confirm-password"
                type={showPassword ? "text" : "password"}
                className="pl-10"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>
          
          {/* Terms agreement */}
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <Checkbox 
                id="agree-terms" 
                checked={agreeTerms}
                onCheckedChange={(checked) => setAgreeTerms(checked as boolean)}
                required
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="agree-terms" className="text-gray-600">
                Concordo com os{" "}
                <a href="#" className="text-brand-purple hover:underline">
                  Termos de Serviço
                </a>{" "}
                e{" "}
                <a href="#" className="text-brand-purple hover:underline">
                  Política de Privacidade
                </a>
              </label>
            </div>
          </div>
        </div>
        
        {/* Submit button */}
        <Button type="submit" className="w-full font-bold" disabled={loading}>
          {loading ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-t-transparent"></div>
          ) : (
            "Criar conta"
          )}
        </Button>
        
        {/* Login link */}
        <div className="text-center text-sm text-gray-500">
          Já tem uma conta?{" "}
          <Link
            to="/auth/login"
            className="font-medium text-brand-purple hover:underline"
          >
            Faça login
          </Link>
        </div>
      </form>
    </div>
  );
};

export default Register;
