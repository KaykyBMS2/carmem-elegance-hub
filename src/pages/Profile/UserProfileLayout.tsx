
import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Bell, User, LogOut, Cog, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Navbar from '@/components/Navbar';
import { Badge } from '@/components/ui/badge';

interface UserProfileLayoutProps {
  children: React.ReactNode;
}

const UserProfileLayout = ({ children }: UserProfileLayoutProps) => {
  const { profile, unreadCount, signOut } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Fechar a sidebar se clicar fora dela
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  // Avatar placeholder com as iniciais
  const getInitials = () => {
    if (!profile?.name) return 'U';
    
    const names = profile.name.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  return (
    <div className="relative min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container relative mx-auto mt-24 max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        {/* Mobile header */}
        <div className="mb-6 flex items-center justify-between lg:hidden">
          <h1 className="text-2xl font-bold">Minha Conta</h1>
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Mobile sidebar */}
          <div
            ref={sidebarRef}
            className={`fixed inset-y-0 right-0 z-50 w-64 transform bg-white p-6 shadow-lg transition-transform duration-300 lg:hidden ${
              sidebarOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            <Button 
              variant="ghost" 
              size="icon"
              className="absolute right-4 top-4" 
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
            
            <div className="mb-6 mt-10 flex flex-col items-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-purple/10 text-lg font-semibold text-brand-purple">
                {getInitials()}
              </div>
              <h2 className="mt-2 text-lg font-medium">{profile?.name}</h2>
              <p className="text-sm text-muted-foreground">{profile?.email}</p>
            </div>
            
            <div className="space-y-2">
              <Button 
                variant="ghost" 
                className="w-full justify-start"
                onClick={() => {
                  setSidebarOpen(false);
                  navigate('/profile');
                }}
              >
                <User className="mr-2 h-4 w-4" />
                Meu Perfil
              </Button>
              
              <Button 
                variant="ghost" 
                className="w-full justify-start"
                onClick={() => {
                  setSidebarOpen(false);
                  navigate('/profile?tab=notifications');
                }}
              >
                <div className="relative mr-2">
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-3 w-3 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </div>
                Notificações
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="ml-auto">
                    {unreadCount}
                  </Badge>
                )}
              </Button>
              
              <Button 
                variant="ghost" 
                className="w-full justify-start"
                onClick={() => {
                  setSidebarOpen(false);
                  navigate('/profile?tab=settings');
                }}
              >
                <Cog className="mr-2 h-4 w-4" />
                Configurações
              </Button>
              
              <Button 
                variant="ghost" 
                className="w-full justify-start text-red-500"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </Button>
            </div>
          </div>
          
          {/* Desktop sidebar */}
          <div className="sticky hidden lg:col-span-3 lg:block">
            <div className="rounded-lg border bg-white p-6 shadow-sm">
              <div className="mb-6 flex flex-col items-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-purple/10 text-xl font-semibold text-brand-purple">
                  {getInitials()}
                </div>
                <h2 className="mt-2 text-lg font-medium">{profile?.name}</h2>
                <p className="text-sm text-muted-foreground">{profile?.email}</p>
              </div>
              
              <div className="space-y-2">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start"
                  onClick={() => navigate('/profile')}
                >
                  <User className="mr-2 h-4 w-4" />
                  Meu Perfil
                </Button>
                
                <Button 
                  variant="ghost" 
                  className="w-full justify-start"
                  onClick={() => navigate('/profile?tab=notifications')}
                >
                  <div className="relative mr-2">
                    <Bell className="h-4 w-4" />
                    {unreadCount > 0 && (
                      <span className="absolute -right-1 -top-1 flex h-3 w-3 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </div>
                  Notificações
                  {unreadCount > 0 && (
                    <Badge variant="secondary" className="ml-auto">
                      {unreadCount}
                    </Badge>
                  )}
                </Button>
                
                <Button 
                  variant="ghost" 
                  className="w-full justify-start"
                  onClick={() => navigate('/profile?tab=settings')}
                >
                  <Cog className="mr-2 h-4 w-4" />
                  Configurações
                </Button>
                
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-red-500"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </Button>
              </div>
            </div>
          </div>
          
          {/* Main content */}
          <div className="lg:col-span-9">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileLayout;
