
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect, createContext, useContext } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ShopProvider } from "@/contexts/ShopContext";
import Index from "./pages/Index";
import Gallery from "./pages/Gallery";
import Contact from "./pages/Contact";
import About from "./pages/About";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Checkout from "./pages/Checkout";
import Favorites from "./pages/Favorites";
import NotFound from "./pages/NotFound";
import Login from "./pages/admin/Login";
import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/Products';
import ProductForm from './pages/admin/ProductForm';
import AdminOrders from './pages/admin/Orders';
import OrderDetail from './pages/admin/OrderDetail';
import AdminCustomers from './pages/admin/Customers';
import CustomerDetail from './pages/admin/CustomerDetail';
import Categories from './pages/admin/Categories';
import AdminSettings from './pages/admin/AdminSettings';
import PhotoshootManagement from './pages/admin/PhotoshootManagement';
import Auth from "./pages/Auth/Auth";
import UserProfileLayout from "./pages/Profile/UserProfileLayout";
import UserProfile from "./pages/Profile/UserProfile";
import OrderHistory from "./pages/Profile/OrderHistory";
import NotificationPanel from "./pages/Profile/NotificationPanel";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

export const AuthContext = createContext<{
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  user: any;
}>({
  isAuthenticated: false,
  isAdmin: false,
  isLoading: true,
  user: null,
});

// Protected Route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useContext(AuthContext);
  
  if (isLoading) {
    return <div className="flex h-screen w-full items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-purple border-t-transparent"></div>
    </div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};

// Customer Protected Route component
const CustomerProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="flex h-screen w-full items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-purple border-t-transparent"></div>
    </div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  return <>{children}</>;
};

const App = () => {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    isAdmin: false,
    isLoading: true,
    user: null,
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        
        if (data.session) {
          const { data: adminData, error } = await supabase
            .from('admin_users')
            .select('role')
            .eq('id', data.session.user.id)
            .single();
          
          if (error && error.code !== 'PGRST116') {
            console.error("Error checking admin status:", error);
          }
            
          setAuthState({
            isAuthenticated: true,
            isAdmin: !!adminData,
            isLoading: false,
            user: data.session.user,
          });
        } else {
          setAuthState({
            isAuthenticated: false,
            isAdmin: false,
            isLoading: false,
            user: null,
          });
        }
      } catch (error) {
        console.error("Error checking auth:", error);
        setAuthState({
          isAuthenticated: false,
          isAdmin: false,
          isLoading: false,
          user: null,
        });
      }
    };

    checkAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Admin Auth state change:", event, session?.user?.id);
      
      if (event === "SIGNED_IN" && session) {
        try {
          const { data: adminData, error } = await supabase
            .from('admin_users')
            .select('role')
            .eq('id', session.user.id)
            .single();
          
          if (error && error.code !== 'PGRST116') {
            console.error("Error checking admin status on auth change:", error);
          }
            
          setAuthState({
            isAuthenticated: true,
            isAdmin: !!adminData,
            isLoading: false,
            user: session.user,
          });
        } catch (error) {
          console.error("Error in auth change handler:", error);
        }
      } else if (event === "SIGNED_OUT") {
        setAuthState({
          isAuthenticated: false,
          isAdmin: false,
          isLoading: false,
          user: null,
        });
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={authState}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ShopProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<Index />} />
                  <Route path="/gallery" element={<Gallery />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/shop" element={<Shop />} />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/favorites" element={<Favorites />} />
                  
                  {/* Auth routes */}
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/auth/login" element={<Auth />} />
                  <Route path="/auth/register" element={<Auth />} />
                  
                  {/* User profile routes */}
                  <Route 
                    path="/profile" 
                    element={
                      <CustomerProtectedRoute>
                        <UserProfileLayout />
                      </CustomerProtectedRoute>
                    }
                  >
                    <Route index element={<UserProfile />} />
                    <Route path="orders" element={<OrderHistory />} />
                    <Route path="notifications" element={<NotificationPanel />} />
                  </Route>
                  
                  {/* Admin routes */}
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route path="/admin" element={
                    <ProtectedRoute>
                      <Navigate to="/admin/dashboard" replace />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/dashboard" element={
                    <ProtectedRoute>
                      <AdminDashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/products" element={
                    <ProtectedRoute>
                      <AdminProducts />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/products/new" element={
                    <ProtectedRoute>
                      <ProductForm />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/products/:id" element={
                    <ProtectedRoute>
                      <ProductForm />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/photoshoots" element={
                    <ProtectedRoute>
                      <PhotoshootManagement />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/orders" element={
                    <ProtectedRoute>
                      <AdminOrders />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/orders/:id" element={
                    <ProtectedRoute>
                      <OrderDetail />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/customers" element={
                    <ProtectedRoute>
                      <AdminCustomers />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/customers/:id" element={
                    <ProtectedRoute>
                      <CustomerDetail />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/categories" element={
                    <ProtectedRoute>
                      <Categories />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/settings" element={
                    <ProtectedRoute>
                      <AdminSettings />
                    </ProtectedRoute>
                  } />
                  
                  {/* Catch-all route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </ShopProvider>
        </AuthProvider>
      </QueryClientProvider>
    </AuthContext.Provider>
  );
};

export default App;
