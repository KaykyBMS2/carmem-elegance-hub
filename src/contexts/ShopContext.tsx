
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

  // Load favorites from localStorage or Supabase depending on authentication
  useEffect(() => {
    const loadFavorites = async () => {
      if (isAuthenticated && user) {
        try {
          const { data, error } = await supabase
            .from('user_favorites')
            .select(`
              product_id,
              products:product_id (
                id,
                name,
                regular_price,
                sale_price,
                promotional_price,
                is_rental,
                rental_price,
                product_images (
                  image_url,
                  is_primary
                )
              )
            `)
            .eq('user_id', user.id);

          if (error) throw error;

          const formattedFavorites = data.map((item) => {
            const product = item.products;
            const primaryImage = product.product_images.find((img: any) => img.is_primary)?.image_url || 
                               product.product_images[0]?.image_url || '/placeholder.svg';
            
            return {
              id: product.id,
              name: product.name,
              price: product.regular_price,
              salePrice: product.sale_price,
              promoPrice: product.promotional_price,
              imageUrl: primaryImage,
              isRental: product.is_rental,
              rentalPrice: product.rental_price
            };
          });

          setFavorites(formattedFavorites);
        } catch (error) {
          console.error('Error loading favorites from Supabase:', error);
          // Fallback to localStorage if Supabase fails
          const savedFavorites = localStorage.getItem('carmem_bezerra_favorites');
          if (savedFavorites) {
            try {
              setFavorites(JSON.parse(savedFavorites));
            } catch (error) {
              console.error('Failed to parse favorites from localStorage:', error);
              localStorage.removeItem('carmem_bezerra_favorites');
            }
          }
        }
      } else {
        // Not authenticated, use localStorage
        const savedFavorites = localStorage.getItem('carmem_bezerra_favorites');
        if (savedFavorites) {
          try {
            setFavorites(JSON.parse(savedFavorites));
          } catch (error) {
            console.error('Failed to parse favorites from localStorage:', error);
            localStorage.removeItem('carmem_bezerra_favorites');
          }
        }
      }
    };

    loadFavorites();
  }, [isAuthenticated, user]);

  // Save cart to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('carmem_bezerra_cart', JSON.stringify(cart));
  }, [cart]);

  // Save favorites to localStorage when they change (for non-authenticated users)
  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem('carmem_bezerra_favorites', JSON.stringify(favorites));
    }
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
    // If user is authenticated, save to Supabase
    if (isAuthenticated && user) {
      try {
        const { error } = await supabase
          .from('user_favorites')
          .upsert({ 
            user_id: user.id,
            product_id: product.id
          });

        if (error) throw error;
        
      } catch (error) {
        console.error('Error saving favorite to Supabase:', error);
        toast({
          title: "Erro",
          description: "Não foi possível salvar o produto nos favoritos.",
          variant: "destructive",
        });
        return;
      }
    }
    
    // Always update local state
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
    // If user is authenticated, remove from Supabase
    if (isAuthenticated && user) {
      try {
        const { error } = await supabase
          .from('user_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', productId);

        if (error) throw error;
        
      } catch (error) {
        console.error('Error removing favorite from Supabase:', error);
        toast({
          title: "Erro",
          description: "Não foi possível remover o produto dos favoritos.",
          variant: "destructive",
        });
        return;
      }
    }
    
    // Always update local state
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
