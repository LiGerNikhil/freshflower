"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { CartAddedToast } from "@/components/sections/CartAddedToast";
import type { CartItem } from "@/lib/types";
import { CART_STORAGE_KEY } from "@/lib/cart";

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  addItem: (item: CartItem) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
}

interface AddedNotification {
  item: CartItem;
  token: number;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [added, setAdded] = useState<AddedNotification | null>(null);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(CART_STORAGE_KEY);
      // Hydrate once from the browser-only external store after mount.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (saved) setItems(JSON.parse(saved) as CartItem[]);
    } catch {
      window.localStorage.removeItem(CART_STORAGE_KEY);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (hydrated)
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [hydrated, items]);

  // Stable identity so consumers can safely depend on it in effects.
  const clearCart = useCallback(() => setItems([]), []);

  const addItem = useCallback((item: CartItem) => {
    setItems((current) => {
      const existing = current.find(
        (entry) =>
          entry.productId === item.productId &&
          entry.productType === item.productType,
      );
      if (existing)
        return current.map((entry) =>
          entry.productId === item.productId &&
          entry.productType === item.productType
            ? { ...entry, quantity: entry.quantity + item.quantity }
            : entry,
        );
      return [...current, item];
    });
    setAdded({ item, token: Date.now() });
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal: items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      ),
      addItem,
      updateQuantity: (productId, quantity) =>
        setItems((current) =>
          quantity < 1
            ? current.filter((item) => item.productId !== productId)
            : current.map((item) =>
                item.productId === productId ? { ...item, quantity } : item,
              ),
        ),
      removeItem: (productId) =>
        setItems((current) =>
          current.filter((item) => item.productId !== productId),
        ),
      clearCart,
    }),
    [items, clearCart, addItem],
  );

  return (
    <CartContext.Provider value={value}>
      {children}
      <CartAddedToast notification={added} />
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}
