
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Login from './Login';
import Register from './Register';
import { Flower, Heart } from 'lucide-react';

const Auth = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  
  // Redirect if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate('/profile', { replace: true });
    }
  }, [isAuthenticated, navigate, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-purple-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-purple"></div>
      </div>
    );
  }

  // Determine which tab is active
  const isLoginRoute = window.location.pathname === '/auth/login';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-purple-50">
      <div className="absolute top-8 left-8">
        <Link to="/" className="flex items-center group">
          <div className="relative w-10 h-10 mr-3 transition-transform group-hover:scale-110">
            <div className="absolute w-full h-full rounded-full bg-brand-purple/20 animate-float"></div>
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <path 
                d="M50 7C25.1 7 5 27.1 5 52s20.1 45 45 45s45-20.1 45-45S74.9 7 50 7zm0 80c-19.3 0-35-15.7-35-35s15.7-35 35-35s35 15.7 35 35s-15.7 35-35 35z" 
                fill="#b982ff"
              />
              <path 
                d="M50 22c-16.5 0-30 13.5-30 30s13.5 30 30 30s30-13.5 30-30s-13.5-30-30-30zm0 50c-11 0-20-9-20-20s9-20 20-20s20 9 20 20s-9 20-20 20z" 
                fill="#b982ff" 
                opacity="0.6"
              />
              <circle cx="50" cy="52" r="10" fill="#b982ff" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-montserrat font-bold tracking-tight">Carmem Bezerra</h1>
            <p className="text-xs text-muted-foreground -mt-1">Elegância Materna</p>
          </div>
        </Link>
      </div>
      
      <div className="max-w-md w-full">
        <div className="relative mb-10 text-center">
          <Flower className="absolute -top-8 -left-6 text-brand-purple/20 h-14 w-14 rotate-12" />
          <Heart className="absolute -top-4 -right-4 text-brand-purple/10 h-10 w-10 rotate-12" />
          <h1 className="text-3xl font-montserrat font-bold text-gray-800">Bem-vinda à Carmem Bezerra</h1>
          <p className="text-muted-foreground mt-2">Elegância e conforto para o período mais especial.</p>
          <div className="h-1 w-20 bg-gradient-to-r from-brand-purple/30 via-brand-purple to-brand-purple/30 mx-auto mt-4 rounded-full"></div>
        </div>
        
        <div className="bg-white shadow-lg rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-xl">
          <div className="flex justify-center mb-6 border-b">
            <Link
              to="/auth/login"
              className={`w-1/2 py-4 text-center font-medium transition-colors ${
                isLoginRoute
                  ? 'text-brand-purple border-b-2 border-brand-purple font-semibold'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Entrar
            </Link>
            <Link
              to="/auth/register"
              className={`w-1/2 py-4 text-center font-medium transition-colors ${
                !isLoginRoute
                  ? 'text-brand-purple border-b-2 border-brand-purple font-semibold'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Criar Conta
            </Link>
          </div>
          
          <div className="px-8 py-6 pb-8">
            {isLoginRoute ? <Login /> : <Register />}
          </div>
        </div>
        
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>
            Ao continuar, você concorda com nossos{' '}
            <Link to="/terms" className="text-brand-purple hover:underline">
              Termos de Serviço
            </Link>{' '}
            e{' '}
            <Link to="/privacy" className="text-brand-purple hover:underline">
              Política de Privacidade
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
