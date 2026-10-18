"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Size } from "@/lib/products";

export type CartItem = { productId: string; size: Size; quantity: number };

type CartContextValue = {
  items: CartItem[];
  count: number;
  ready: boolean;
  addItem: (item: CartItem) => void;
  updateQuantity: (productId: string, size: Size, quantity: number) => void;
  removeItem: (productId: string, size: Size) => void;
  clearCart: () => void;
};

const STORAGE_KEY = "drip-egypt-cart-v1";
const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let restored: CartItem[] = [];
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) restored = JSON.parse(saved);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
    queueMicrotask(() => { setItems(restored); setReady(true); });
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, ready]);

  const addItem = useCallback((next: CartItem) => {
    setItems((current) => {
      const existing = current.find(
        (item) => item.productId === next.productId && item.size === next.size,
      );
      if (!existing) return [...current, { ...next, quantity: Math.min(10, next.quantity) }];
      return current.map((item) =>
        item === existing
          ? { ...item, quantity: Math.min(10, item.quantity + next.quantity) }
          : item,
      );
    });
  }, []);

  const updateQuantity = useCallback(
    (productId: string, size: Size, quantity: number) => {
      const safeQuantity = Math.max(1, Math.min(10, Math.trunc(quantity)));
      setItems((current) =>
        current.map((item) =>
          item.productId === productId && item.size === size
            ? { ...item, quantity: safeQuantity }
            : item,
        ),
      );
    },
    [],
  );

  const removeItem = useCallback((productId: string, size: Size) => {
    setItems((current) =>
      current.filter(
        (item) => !(item.productId === productId && item.size === size),
      ),
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);
  const value = useMemo(
    () => ({
      items,
      count: items.reduce((sum, item) => sum + item.quantity, 0),
      ready,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
    }),
    [items, ready, addItem, updateQuantity, removeItem, clearCart],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error("useCart must be used inside CartProvider");
  return value;
}

