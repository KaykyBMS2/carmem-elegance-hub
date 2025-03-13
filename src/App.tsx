
import { Routes, Route } from "react-router-dom";
import { AdminRoute } from "./main";

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

function App() {
  return (
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
      
      {/* Admin login route - public */}
      <Route path="/admin/login" element={<AdminLogin />} />
      
      {/* Protected admin routes */}
      <Route path="/admin" element={<AdminRoute><Dashboard /></AdminRoute>} />
      <Route path="/admin/dashboard" element={<AdminRoute><Dashboard /></AdminRoute>} />
      <Route path="/admin/products" element={<AdminRoute><Products /></AdminRoute>} />
      <Route path="/admin/products/new" element={<AdminRoute><ProductForm /></AdminRoute>} />
      <Route path="/admin/products/:id" element={<AdminRoute><ProductForm /></AdminRoute>} />
      <Route path="/admin/categories" element={<AdminRoute><Categories /></AdminRoute>} />
      <Route path="/admin/orders" element={<AdminRoute><Orders /></AdminRoute>} />
      <Route path="/admin/orders/:id" element={<AdminRoute><OrderDetail /></AdminRoute>} />
      <Route path="/admin/customers" element={<AdminRoute><Customers /></AdminRoute>} />
      <Route path="/admin/customers/:id" element={<AdminRoute><CustomerDetail /></AdminRoute>} />
      <Route path="/admin/photoshoots" element={<AdminRoute><PhotoshootManagement /></AdminRoute>} />
      <Route path="/admin/settings" element={<AdminRoute><AdminSettings /></AdminRoute>} />
      <Route path="/admin/coupons" element={<AdminRoute><CouponManagement /></AdminRoute>} />
      
      {/* Error routes */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
