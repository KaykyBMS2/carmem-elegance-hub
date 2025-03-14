
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  Users,
  Package,
  Tag,
  ShoppingCart,
  Settings,
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  Camera,
  Ticket
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const AdminLayout = ({ children, title = 'Dashboard' }: AdminLayoutProps) => {
  const { user, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login');
  };

  const navItems = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
    { name: 'Produtos', href: '/admin/products', icon: <Package className="h-5 w-5" /> },
    { name: 'Categorias', href: '/admin/categories', icon: <Tag className="h-5 w-5" /> },
    { name: 'Pedidos', href: '/admin/orders', icon: <ShoppingCart className="h-5 w-5" /> },
    { name: 'Clientes', href: '/admin/customers', icon: <Users className="h-5 w-5" /> },
    { name: 'Ensaios Fotográficos', href: '/admin/photoshoots', icon: <Camera className="h-5 w-5" /> },
    { name: 'Cupons', href: '/admin/coupons', icon: <Ticket className="h-5 w-5" /> },
    { name: 'Configurações', href: '/admin/settings', icon: <Settings className="h-5 w-5" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className="lg:hidden">
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 flex">
            <div
              className="fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity"
              onClick={() => setSidebarOpen(false)}
            ></div>

            <div className="relative flex w-full max-w-xs flex-1 flex-col bg-white pt-5 pb-4">
              <div className="absolute top-0 right-0 -mr-12 pt-2">
                <button
                  className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="sr-only">Fechar menu</span>
                  <X className="h-6 w-6 text-white" />
                </button>
              </div>

              <div className="flex flex-shrink-0 items-center px-4">
                <h1 className="text-xl font-bold text-brand-purple">Carmem Bezerra Admin</h1>
              </div>
              <div className="mt-5 h-0 flex-1 overflow-y-auto">
                <nav className="space-y-1 px-2">
                  {navItems.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className="group flex items-center rounded-md px-3 py-2 text-base font-medium text-gray-600 hover:bg-brand-purple/10 hover:text-brand-purple"
                      onClick={() => setSidebarOpen(false)}
                    >
                      {item.icon}
                      <span className="ml-3">{item.name}</span>
                    </Link>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex min-h-0 flex-1 flex-col border-r border-gray-200 bg-white">
          <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
            <div className="flex flex-shrink-0 items-center px-4">
              <h1 className="text-xl font-bold text-brand-purple">Carmem Bezerra</h1>
            </div>
            <nav className="mt-5 flex-1 space-y-1 px-2">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="group flex items-center rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-brand-purple/10 hover:text-brand-purple"
                >
                  {item.icon}
                  <span className="ml-3">{item.name}</span>
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex flex-shrink-0 border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div>
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-brand-purple text-white">
                    {user?.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">{user?.email}</p>
                <button
                  onClick={handleSignOut}
                  className="flex items-center text-xs font-medium text-gray-500 hover:text-brand-purple"
                >
                  <LogOut className="mr-1 h-3 w-3" />
                  Sair
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col lg:pl-64">
        <div className="sticky top-0 z-10 bg-white pl-1 pt-1 sm:pl-3 sm:pt-3 lg:hidden">
          <button
            type="button"
            className="-ml-0.5 -mt-0.5 inline-flex h-12 w-12 items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Abrir menu</span>
            <Menu className="h-6 w-6" />
          </button>
        </div>

        <main className="flex-1">
          <div className="py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
            </div>
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
