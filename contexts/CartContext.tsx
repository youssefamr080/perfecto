'use client'

import React, { createContext, useContext, useReducer, useEffect } from 'react'

// Temporary Product type until Prisma client is fully generated
interface Product {
  id: string
  name: string
  price: number
  oldPrice?: number | null
  images: string[]
  unitType: 'WEIGHT' | 'PIECE'
  isAvailable: boolean
  category: string
  description?: string | null
}

interface CartItem {
  product: Product
  quantity: number
}

interface CartContextType {
  items: CartItem[]
  addItem: (product: Product, quantity: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  getTotalItems: () => number
  getTotalPrice: () => number
  isLoading: boolean
  isInCart: (productId: string) => boolean
  itemCount: number
  subtotal: number
  fee: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

type CartAction =
  | { type: 'ADD_ITEM'; payload: { product: Product; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: { productId: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { productId: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: { items: CartItem[] } }

const cartReducer = (state: CartItem[], action: CartAction): CartItem[] => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItemIndex = state.findIndex(
        item => item.product.id === action.payload.product.id
      )
      
      const existingItem = state[existingItemIndex]

      if (existingItemIndex >= 0) {
        const newState = [...state]
        // عند إضافة منتج موجود، قم دائمًا بجمع الكمية الجديدة مع الكمية الحالية.
        newState[existingItemIndex].quantity += action.payload.quantity
        return newState
      } else {
        return [...state, { product: action.payload.product, quantity: action.payload.quantity }]
      }
    }
    
    case 'REMOVE_ITEM':
      return state.filter(item => item.product.id !== action.payload.productId)
    
    case 'UPDATE_QUANTITY': {
      if (action.payload.quantity <= 0) {
        return state.filter(item => item.product.id !== action.payload.productId)
      }
      return state.map(item =>
        item.product.id === action.payload.productId
          // استبدل الكمية بالكامل بالكمية الجديدة المرسلة
          ? { ...item, quantity: action.payload.quantity }
          : item
      )
    }
    
    case 'CLEAR_CART':
      return []
    
    case 'LOAD_CART':
      return action.payload.items
    
    default:
      return state
  }
}

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, [], (initial) => {
    if (typeof window === 'undefined') {
      return initial;
    }
    try {
      const savedCart = localStorage.getItem('cart');
      return savedCart ? JSON.parse(savedCart) : initial;
    } catch (error) {
      console.error("Failed to load cart from localStorage", error);
      return initial;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('cart', JSON.stringify(state));
    } catch (error) {
      console.error("Failed to save cart to localStorage", error);
    }
  }, [state]);

  const [isLoading, setIsLoading] = React.useState(true);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  const addItem = (product: Product, quantity: number) => {
    dispatch({ type: 'ADD_ITEM', payload: { product, quantity } });
  };

  const removeItem = (productId: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { productId } });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const contextValue: CartContextType = {
    items: state,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    isLoading,
    getTotalItems: () => state.reduce((total: number, item: CartItem) => total + item.quantity, 0),
    getTotalPrice: () => state.reduce((total: number, item: CartItem) => total + item.product.price * item.quantity, 0),
    isInCart: (productId: string) => state.some((item: CartItem) => item.product.id === productId),
    itemCount: state.length,
    subtotal: state.reduce((total: number, item: CartItem) => total + item.product.price * item.quantity, 0),
    fee: state.reduce((total: number, item: CartItem) => total + item.product.price * item.quantity, 0) > 0 ? 5 : 0,
  };

  return <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
