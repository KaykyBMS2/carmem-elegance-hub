import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { Coupon } from '@/types/coupon';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  salePrice?: number | null;
  promoPrice?: number | null;
  imageUrl: string;
  quantity: number;
  isRental?: boolean;
  rentalPrice?: number | null;
}

export interface FavoriteItem {
  id: string;
  name: string;
  price: number;
  salePrice?: number | null;
  promoPrice?: number | null;
  imageUrl: string;
  isRental?: boolean;
  rentalPrice?: number | null;
}

interface ShopContextType {
  cart: CartItem[];
  favorites: FavoriteItem[];
  addToCart: (product: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartItemQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  addToFavorites: (product: FavoriteItem) => void;
  removeFromFavorites: (productId: string) => void;
  isInFavorites: (productId: string) => boolean;
  cartTotal: number;
  cartCount: number;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
  coupon: Coupon | null;
  calculateDiscount: (amount: number) => number;
  installmentFee: number;
  calculateInstallmentValue: (amount: number, installments: number) => number;
}

const ShopContext = createContext<ShopContextType>({
  cart: [],
  favorites: [],
  addToCart: () => {},
  removeFromCart: () => {},
  updateCartItemQuantity: () => {},
  clearCart: () => {},
  addToFavorites: () => {},
  removeFromFavorites: () => {},
  isInFavorites: () => false,
  cartTotal: 0,
  cartCount: 0,
  applyCoupon: async () => ({ success: false, message: '' }),
  removeCoupon: () => {},
  coupon: null,
  calculateDiscount: () => 0,
  installmentFee: 0,
  calculateInstallmentValue: () => 0,
});

export const useShop = () => useContext(ShopContext);

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const { isAuthenticated, user } = useAuth();
  
  const installmentFee = 0.0199; // 1.99% per month
  
  const cartTotal = cart.reduce((total, item) => {
    const price = item.promoPrice || item.salePrice || item.price;
    return total + price * item.quantity;
  }, 0);

  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);
  
  const calculateDiscount = (amount: number): number => {
    if (!coupon) return 0;
    
    if (coupon.min_purchase_amount && amount < coupon.min_purchase_amount) {
      return 0;
    }
    
    if (coupon.discount_type === 'percentage') {
      return (amount * coupon.discount_value) / 100;
    } else {
      return Math.min(amount, coupon.discount_value);
    }
  };
  
  const calculateInstallmentValue = (amount: number, installments: number): number => {
    if (installments <= 1) return amount;
    
    return amount * (installmentFee * Math.pow(1 + installmentFee, installments)) / 
           (Math.pow(1 + installmentFee, installments) - 1);
  };
  
  const applyCoupon = async (code: string): Promise<{ success: boolean; message: string }> => {
    try {
      const { data, error } = await supabase
        .from('discount_coupons')
        .select('*')
        .eq('code', code.toUpperCase())
        .eq('is_active', true)
        .single();
        
      if (error) {
        return { 
          success: false, 
          message: 'Cupom inválido ou expirado' 
        };
      }
      
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        return { 
          success: false, 
          message: 'Este cupom está expirado' 
        };
      }
      
      if (data.max_uses && data.current_uses >= data.max_uses) {
        return { 
          success: false, 
          message: 'Este cupom atingiu o limite máximo de utilizações' 
        };
      }
      
      if (data.min_purchase_amount && cartTotal < data.min_purchase_amount) {
        return { 
          success: false, 
          message: `Este cupom requer um valor mínimo de compra de ${new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          }).format(data.min_purchase_amount)}` 
        };
      }
      
      const typedCoupon: Coupon = {
        id: data.id,
        code: data.code,
        discount_type: data.discount_type === 'percentage' ? 'percentage' : 'fixed',
        discount_value: data.discount_value,
        min_purchase_amount: data.min_purchase_amount,
        max_uses: data.max_uses,
        current_uses: data.current_uses,
        is_active: data.is_active,
        starts_at: data.starts_at,
        expires_at: data.expires_at,
        created_by: data.created_by,
        created_at: data.created_at,
        updated_at: data.updated_at
      };
      
      setCoupon(typedCoupon);
      
      localStorage.setItem('carmem_bezerra_coupon', JSON.stringify(typedCoupon));
      
      return { 
        success: true, 
        message: 'Cupom aplicado com sucesso!' 
      };
    } catch (error) {
      console.error('Error applying coupon:', error);
      return { 
        success: false, 
        message: 'Erro ao aplicar o cupom. Tente novamente.' 
      };
    }
  };
  
  const removeCoupon = () => {
    setCoupon(null);
    localStorage.removeItem('carmem_bezerra_coupon');
  };

  useEffect(() => {
    const loadCartFromStorage = () => {
      const savedCart = localStorage.getItem('carmem_bezerra_cart');
      if (savedCart) {
        try {
          setCart(JSON.parse(savedCart));
        } catch (error) {
          console.error('Failed to parse cart from localStorage:', error);
          localStorage.removeItem('carmem_bezerra_cart');
        }
      }
    };

    loadCartFromStorage();
  }, []);

  useEffect(() => {
    const loadFavorites = async () => {
      const savedFavorites = localStorage.getItem('carmem_bezerra_favorites');
      if (savedFavorites) {
        try {
          setFavorites(JSON.parse(savedFavorites));
        } catch (error) {
          console.error('Failed to parse favorites from localStorage:', error);
          localStorage.removeItem('carmem_bezerra_favorites');
        }
      }
    };

    loadFavorites();
  }, [isAuthenticated, user]);
  
  useEffect(() => {
    const savedCoupon = localStorage.getItem('carmem_bezerra_coupon');
    if (savedCoupon) {
      try {
        setCoupon(JSON.parse(savedCoupon));
      } catch (error) {
        console.error('Failed to parse coupon from localStorage:', error);
        localStorage.removeItem('carmem_bezerra_coupon');
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('carmem_bezerra_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('carmem_bezerra_favorites', JSON.stringify(favorites));
  }, [favorites, isAuthenticated]);

  const addToCart = (product: Omit<CartItem, 'quantity'>, quantity = 1) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      
      if (existingItem) {
        return prevCart.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + quantity } 
            : item
        );
      } else {
        return [...prevCart, { ...product, quantity }];
      }
    });
    
    toast({
      title: "Produto adicionado",
      description: `${product.name} foi adicionado ao carrinho.`,
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
    
    toast({
      title: "Produto removido",
      description: "O produto foi removido do carrinho.",
    });
  };

  const updateCartItemQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCart(prevCart => 
      prevCart.map(item => 
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    removeCoupon();
  };

  const addToFavorites = (product: FavoriteItem) => {
    setFavorites(prev => {
      if (prev.some(item => item.id === product.id)) {
        return prev;
      }
      return [...prev, product];
    });
    
    toast({
      title: "Produto favorito",
      description: `${product.name} foi adicionado aos favoritos.`,
    });
  };

  const removeFromFavorites = (productId: string) => {
    setFavorites(prev => prev.filter(item => item.id !== productId));
    
    toast({
      title: "Produto removido",
      description: "O produto foi removido dos favoritos.",
    });
  };

  const isInFavorites = (productId: string) => {
    return favorites.some(item => item.id === productId);
  };

  const value = {
    cart,
    favorites,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    addToFavorites,
    removeFromFavorites,
    isInFavorites,
    cartTotal,
    cartCount,
    applyCoupon,
    removeCoupon,
    coupon,
    calculateDiscount,
    installmentFee,
    calculateInstallmentValue
  };

  return (
    <ShopContext.Provider value={value}>
      {children}
    </ShopContext.Provider>
  );
};
