import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Product, CartItem, AuthState } from './types';
import { authService } from './services/api';

const CART_STORAGE_KEY = 'charan_cart';

interface AppContextType {
  auth: AuthState;
  login: (user: User) => void;
  logout: () => void;
  cart: CartItem[];
  addToCart: (product: Product, qty: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  cartTotal: number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Auth State - Initialize with user from localStorage immediately
  const [auth, setAuth] = useState<AuthState>(() => {
    // Restore user immediately on mount (synchronous)
    try {
      const user = authService.getCurrentUser();
      if (user) {
        return { user, isAuthenticated: true };
      }
    } catch (error) {
      console.error('Error restoring auth:', error);
    }
    return { user: null, isAuthenticated: false };
  });

  // Cart State - Initialize from localStorage
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error restoring cart:', error);
    }
    return [];
  });

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  }, [cart]);

  // Also restore on mount to ensure it's up to date
  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      setAuth({ user, isAuthenticated: true });
    }
  }, []);

  const login = (user: User) => {
    setAuth({ user, isAuthenticated: true });
  };

  const logout = () => {
    authService.logout();
    setAuth({ user: null, isAuthenticated: false });
    // Clear cart when user logs out (optional - you might want to keep it)
    // clearCart();
  };

  // Cart Logic
  const addToCart = (product: Product, qty: number) => {
    setCart(prev => {
      const existing = prev.find(p => p.id === product.id);
      if (existing) {
        return prev.map(p => 
          p.id === product.id ? { ...p, quantity: p.quantity + qty } : p
        );
      }
      return [...prev, { ...product, quantity: qty }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(p => p.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    // Clear from localStorage as well
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing cart from storage:', error);
    }
  };

  const cartTotal = cart.reduce((sum, item) => {
    const price = item.offerPrice || item.price;
    return sum + (price * item.quantity);
  }, 0);

  return (
    <AppContext.Provider value={{ 
      auth, login, logout, 
      cart, addToCart, removeFromCart, clearCart, cartTotal 
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};