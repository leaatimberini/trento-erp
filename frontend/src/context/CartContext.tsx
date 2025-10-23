'use client';
import { Product } from '@/lib/types';
import { createContext, useContext, useState, ReactNode, useMemo } from 'react';

// Definir el tipo para un ítem del carrito (Producto + cantidad)
interface CartItem extends Product {
  quantity: number;
}

// Definir el tipo para el contexto
interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  totalAmount: number;
}

// Crear el contexto
const CartContext = createContext<CartContextType | undefined>(undefined);

// Hook personalizado para usar el contexto
export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

// Provider del contexto
export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const addToCart = (product: Product) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      if (existingItem) {
        // Incrementar cantidad si ya existe
        return prevItems.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      // Añadir nuevo ítem al carrito
      return [...prevItems, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(productId);
    } else {
      setCartItems(prevItems =>
        prevItems.map(item =>
          item.id === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartCount = useMemo(() => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  }, [cartItems]);

  const totalAmount = useMemo(() => {
    // --- INICIO DE LA CORRECCIÓN LÍNEA 58 ---
    return cartItems.reduce((total, item) => total + (item.price ?? 0) * item.quantity, 0);
    // --- FIN DE LA CORRECCIÓN ---
  }, [cartItems]);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, cartCount, totalAmount }}>
      {children}
    </CartContext.Provider>
  );
}