
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  ShoppingCart, 
  Users, 
  Tag, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  ChevronDown,
  Image 
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
}

const AdminLayout = ({ children, title }: AdminLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Produtos', href: '/admin/products', icon: ShoppingBag },
    { name: 'Ensaios', href: '/admin/photoshoots', icon: Image },
    { name: 'Pedidos', href: '/admin/orders', icon: ShoppingCart },
    { name: 'Clientes', href: '/admin/customers', icon: Users },
    { name: 'Categorias', href: '/admin/categories', icon: Tag },
    { name: 'Cupons', href: '/admin/coupons', icon: Tag },
    { name: 'Configurações', href: '/admin/settings', icon: Settings },
  ];

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: 'Desconectado',
      description: 'Você saiu do sistema com sucesso.',
    });
    navigate('/admin/login');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden" 
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div 
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform bg-white shadow-lg transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Sidebar header */}
          <div className="flex h-16 items-center justify-between border-b px-4">
            <Link to="/admin/dashboard" className="flex items-center">
              <span className="text-xl font-bold text-brand-purple">Carmem Bezerra</span>
            </Link>
            <button
              type="button"
              className="text-gray-500 hover:text-gray-600 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-2 py-4">
            <ul className="space-y-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                const Icon = item.icon;
                
                return (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className={cn(
                        "flex items-center rounded-md px-3 py-2 text-sm font-medium",
                        isActive
                          ? "bg-brand-purple/10 text-brand-purple"
                          : "text-gray-700 hover:bg-gray-100"
                      )}
                    >
                      <Icon size={18} className="mr-3" />
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Sidebar footer */}
          <div className="border-t px-4 py-4">
            <button
              type="button"
              onClick={handleSignOut}
              className="flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              <LogOut size={18} className="mr-3" />
              Sair
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top navbar */}
        <header className="border-b bg-white shadow-sm">
          <div className="flex h-16 items-center justify-between px-4">
            {/* Left: Hamburger menu and title */}
            <div className="flex items-center gap-4">
              <button
                type="button"
                className="text-gray-500 hover:text-gray-600 lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu size={24} />
              </button>
              <h1 className="text-xl font-semibold text-gray-800">{title}</h1>
            </div>

            {/* Right: User menu */}
            <div className="relative">
              <button
                type="button"
                className="flex items-center rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple focus:ring-offset-2"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                <span className="sr-only">Abrir menu do usuário</span>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-brand-purple text-white flex items-center justify-center">
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="hidden text-sm font-medium text-gray-700 md:block">
                    {user?.email}
                  </span>
                  <ChevronDown size={16} className="text-gray-500" />
                </div>
              </button>

              {/* User dropdown menu */}
              {userMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                  onClick={() => setUserMenuOpen(false)}
                >
                  <div className="px-4 py-2 text-xs text-gray-500">
                    Conta
                  </div>
                  <div className="border-t"></div>
                  <Link
                    to="/admin/settings"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Configurações
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Sair
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 overflow-auto bg-gray-50 p-4">
          <div className="container mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
