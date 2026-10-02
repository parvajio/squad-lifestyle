'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { pixelTrack } from '@/lib/fpixel';

export interface CartProduct {
  _id: string;
  title: string;
  originalPrice: number;
  discountPrice?: number;
  images: string[];
  inStock: boolean;
  category?: { name: string } | string;
}

export interface CartItem {
  product: CartProduct;
  quantity: number;
  selectedSize?: string;
  selected: boolean;
}

export type DeliveryType = 'dhaka' | 'outside';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: CartProduct, selectedSize?: string, quantity?: number) => void;
  removeFromCart: (productId: string, selectedSize?: string) => void;
  updateQuantity: (productId: string, selectedSize: string | undefined, quantity: number) => void;
  toggleSelectItem: (productId: string, selectedSize?: string) => void;
  toggleSelectAll: (selected: boolean) => void;
  clearSelectedItems: () => void;
  clearCart: () => void;
  totalSelectedAmount: number;
  selectedItemCount: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  deliveryType: DeliveryType;
  setDeliveryType: (type: DeliveryType) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('dhaka');

  // Load from LocalStorage
  useEffect(() => {
    setIsMounted(true);
    try {
      const savedCart = localStorage.getItem('squad_cart');
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
      const savedDelivery = localStorage.getItem('squad_delivery_type');
      if (savedDelivery === 'dhaka' || savedDelivery === 'outside') {
        setDeliveryType(savedDelivery);
      }
    } catch (e) {
      console.error('Failed to load cart from localStorage', e);
    }
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    if (isMounted) {
      try {
        localStorage.setItem('squad_cart', JSON.stringify(cart));
        localStorage.setItem('squad_delivery_type', deliveryType);
      } catch (e) {
        console.error('Failed to save cart to localStorage', e);
      }
    }
  }, [cart, deliveryType, isMounted]);

  const addToCart = (product: CartProduct, selectedSize?: string, quantity = 1) => {
    const price = product.discountPrice ?? product.originalPrice;
    pixelTrack('AddToCart', {
      content_ids: [product._id],
      content_name: product.title,
      content_type: 'product',
      value: price * quantity,
      currency: 'BDT',
    });

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(
        (item) => item.product._id === product._id && item.selectedSize === selectedSize
      );

      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        return [
          ...prevCart,
          {
            product,
            quantity,
            selectedSize,
            selected: true, // Default: selected
          },
        ];
      }
    });

    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string, selectedSize?: string) => {
    setCart((prevCart) =>
      prevCart.filter(
        (item) => !(item.product._id === productId && item.selectedSize === selectedSize)
      )
    );
  };

  const updateQuantity = (
    productId: string,
    selectedSize: string | undefined,
    quantity: number
  ) => {
    if (quantity <= 0) {
      removeFromCart(productId, selectedSize);
      return;
    }

    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.product._id === productId && item.selectedSize === selectedSize) {
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  const toggleSelectItem = (productId: string, selectedSize?: string) => {
    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.product._id === productId && item.selectedSize === selectedSize) {
          return { ...item, selected: !item.selected };
        }
        return item;
      })
    );
  };

  const toggleSelectAll = (selected: boolean) => {
    setCart((prevCart) => prevCart.map((item) => ({ ...item, selected })));
  };

  const clearSelectedItems = () => {
    setCart((prevCart) => prevCart.filter((item) => !item.selected));
  };

  const clearCart = () => {
    setCart([]);
  };

  const totalSelectedAmount = cart
    .filter((item) => item.selected)
    .reduce((sum, item) => {
      const price = item.product.discountPrice ?? item.product.originalPrice;
      return sum + price * item.quantity;
    }, 0);

  const selectedItemCount = cart
    .filter((item) => item.selected)
    .reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        toggleSelectItem,
        toggleSelectAll,
        clearSelectedItems,
        clearCart,
        totalSelectedAmount,
        selectedItemCount,
        isCartOpen,
        setIsCartOpen,
        deliveryType,
        setDeliveryType,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
