
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Login from './Login';
import Register from './Register';

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-purple"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 min-h-screen pt-16 md:pt-32 pb-20">
      <div className="max-w-md mx-auto glass-card p-8 rounded-xl shadow-subtle">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-montserrat font-bold text-gray-800">Bem-vinda à Carmem Bezerra</h1>
          <p className="text-muted-foreground mt-2">Elegância e conforto para o período mais especial.</p>
        </div>
        <div className="flex justify-center mb-6">
          <div className="grid grid-cols-2 w-full max-w-xs">
            <Link 
              to="/auth/login" 
              className={`py-2 text-center font-medium transition-colors ${
                window.location.pathname === '/auth/login' 
                  ? 'text-brand-purple border-b-2 border-brand-purple' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Entrar
            </Link>
            <Link 
              to="/auth/register" 
              className={`py-2 text-center font-medium transition-colors ${
                window.location.pathname === '/auth/register' 
                  ? 'text-brand-purple border-b-2 border-brand-purple' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Criar Conta
            </Link>
          </div>
        </div>
        
        {window.location.pathname === '/auth/login' ? <Login /> : <Register />}
      </div>
    </div>
  );
};

export default Auth;
