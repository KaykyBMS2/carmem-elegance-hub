
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

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
});

export const useShop = () => useContext(ShopContext);

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const { isAuthenticated, user } = useAuth();

  // Calculate cart total and count
  const cartTotal = cart.reduce((total, item) => {
    const price = item.promoPrice || item.salePrice || item.price;
    return total + price * item.quantity;
  }, 0);

  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

  // Load cart and favorites from localStorage on mount
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

  // Load favorites from localStorage
  useEffect(() => {
    const loadFavorites = async () => {
      // Always use localStorage for favorites (avoiding Supabase integration for now)
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

  // Save cart to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('carmem_bezerra_cart', JSON.stringify(cart));
  }, [cart]);

  // Save favorites to localStorage when they change
  useEffect(() => {
    localStorage.setItem('carmem_bezerra_favorites', JSON.stringify(favorites));
  }, [favorites, isAuthenticated]);

  // Cart operations
  const addToCart = (product: Omit<CartItem, 'quantity'>, quantity = 1) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      
      if (existingItem) {
        // Update quantity of existing item
        return prevCart.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + quantity } 
            : item
        );
      } else {
        // Add new item
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
  };

  // Favorites operations
  const addToFavorites = async (product: FavoriteItem) => {
    // Update local state only
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

  const removeFromFavorites = async (productId: string) => {
    // Update local state
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
    cartCount
  };

  return (
    <ShopContext.Provider value={value}>
      {children}
    </ShopContext.Provider>
  );
};
