
import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { User, ShoppingBag, Bell, Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

const UserProfileLayout = () => {
  const { user, profile, signOut, unreadCount } = useAuth();
  const navigate = useNavigate();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (profile?.avatar_url) {
      setAvatarUrl(profile.avatar_url);
    }
  }, [profile]);

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Até logo!",
      description: "Você saiu da sua conta.",
    });
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <div className="flex-1 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-[250px_1fr]">
            
            {/* Sidebar */}
            <aside className="bg-white rounded-xl shadow-subtle p-6">
              <div className="flex flex-col items-center mb-6">
                <div className="relative">
                  {avatarUrl ? (
                    <img 
                      src={avatarUrl} 
                      alt={profile?.name || 'Perfil'} 
                      className="w-20 h-20 rounded-full object-cover border-2 border-brand-purple"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-brand-purple/20 flex items-center justify-center text-2xl font-semibold text-brand-purple">
                      {profile?.name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                  )}
                </div>
                <h2 className="mt-4 text-lg font-medium text-gray-900">
                  {profile?.name || 'Minha Conta'}
                </h2>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>
              
              <nav className="space-y-1">
                <NavLink 
                  to="/profile" 
                  end
                  className={({ isActive }) => `flex items-center px-4 py-2.5 text-sm font-medium rounded-lg ${
                    isActive ? 'bg-brand-purple/10 text-brand-purple' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <User className="mr-3 h-5 w-5" />
                  Perfil
                </NavLink>
                
                <NavLink 
                  to="/profile/orders" 
                  className={({ isActive }) => `flex items-center px-4 py-2.5 text-sm font-medium rounded-lg ${
                    isActive ? 'bg-brand-purple/10 text-brand-purple' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <ShoppingBag className="mr-3 h-5 w-5" />
                  Meus Pedidos
                </NavLink>
                
                <NavLink 
                  to="/profile/notifications" 
                  className={({ isActive }) => `flex items-center px-4 py-2.5 text-sm font-medium rounded-lg ${
                    isActive ? 'bg-brand-purple/10 text-brand-purple' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="relative mr-3">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </div>
                  Notificações
                </NavLink>
                
                <div className="pt-6 mt-6 border-t border-gray-200">
                  <Button
                    variant="ghost" 
                    className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
                    onClick={handleSignOut}
                  >
                    <LogOut className="mr-3 h-5 w-5" />
                    Sair
                  </Button>
                </div>
              </nav>
            </aside>
            
            {/* Main content */}
            <main className="bg-white rounded-xl shadow-subtle p-6">
              <Outlet />
            </main>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default UserProfileLayout;
