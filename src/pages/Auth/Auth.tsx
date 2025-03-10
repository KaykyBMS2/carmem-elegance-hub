
import { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Login from './Login';
import Register from './Register';
import { useAuth } from '@/contexts/AuthContext';

const Auth = () => {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate('/profile', { replace: true });
    }
  }, [isAuthenticated, navigate, isLoading]);

  // If the user is already authenticated, redirect them
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-purple"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/profile" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white/80 to-brand-purple/5 pt-32 pb-20 px-4">
      <div className="max-w-md mx-auto glass-card p-8 rounded-xl shadow-subtle">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-montserrat font-bold text-gray-800">Bem-vinda à Carmem Bezerra</h1>
          <p className="text-muted-foreground mt-2">Elegância e conforto para o período mais especial.</p>
        </div>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "login" | "register")} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="login" className="text-sm">Entrar</TabsTrigger>
            <TabsTrigger value="register" className="text-sm">Criar Conta</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <Login />
          </TabsContent>
          
          <TabsContent value="register">
            <Register />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Auth;
