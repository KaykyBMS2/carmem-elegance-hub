
import { Routes, Route } from "react-router-dom";

// Pages
import Index from "./pages/Index";
import About from "./pages/About";
import Gallery from "./pages/Gallery";
import Contact from "./pages/Contact";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Favorites from "./pages/Favorites";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";

// Auth pages
import Auth from "./pages/Auth/Auth";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";

// Profile pages
import UserProfileLayout from "./pages/Profile/UserProfileLayout";
import UserProfile from "./pages/Profile/UserProfile";
import NotificationPanel from "./pages/Profile/NotificationPanel";
import OrderHistory from "./pages/Profile/OrderHistory";

// Admin pages
import AdminLogin from "./pages/admin/Login";
import Dashboard from "./pages/admin/Dashboard";
import Products from "./pages/admin/Products";
import ProductForm from "./pages/admin/ProductForm";
import Categories from "./pages/admin/Categories";
import Orders from "./pages/admin/Orders";
import OrderDetail from "./pages/admin/OrderDetail";
import Customers from "./pages/admin/Customers";
import CustomerDetail from "./pages/admin/CustomerDetail";
import PhotoshootManagement from "./pages/admin/PhotoshootManagement";
import AdminSettings from "./pages/admin/AdminSettings";
import CouponManagement from "./pages/admin/CouponManagement";

// Error pages
import NotFound from "./pages/NotFound";

// Context providers
import { AuthProvider } from "./contexts/AuthContext";
import { ShopProvider } from "./contexts/ShopContext";

// Components
import { Toaster } from "./components/ui/toaster";

import "./App.css";

function App() {
  return (
    <AuthProvider>
      <ShopProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<About />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
          
          {/* Authentication routes */}
          <Route path="/auth" element={<Auth />}>
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
          </Route>
          
          {/* Profile routes */}
          <Route path="/profile" element={<UserProfileLayout />}>
            <Route index element={<UserProfile />} />
            <Route path="notifications" element={<NotificationPanel />} />
            <Route path="orders" element={<OrderHistory />} />
          </Route>
          
          {/* Admin routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/admin/products" element={<Products />} />
          <Route path="/admin/products/new" element={<ProductForm />} />
          <Route path="/admin/products/:id" element={<ProductForm />} />
          <Route path="/admin/categories" element={<Categories />} />
          <Route path="/admin/orders" element={<Orders />} />
          <Route path="/admin/orders/:id" element={<OrderDetail />} />
          <Route path="/admin/customers" element={<Customers />} />
          <Route path="/admin/customers/:id" element={<CustomerDetail />} />
          <Route path="/admin/photoshoots" element={<PhotoshootManagement />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
          <Route path="/admin/coupons" element={<CouponManagement />} />
          
          {/* Error routes */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </ShopProvider>
    </AuthProvider>
  );
}

export default App;
