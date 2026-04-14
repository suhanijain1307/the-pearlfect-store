import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { Product } from "../backend";

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextValue {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalAmount: number;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

const GUEST_KEY = "pearlfect_cart_guest";

function cartKey(phone: string | null): string {
  return phone ? `pearlfect_cart_${phone}` : GUEST_KEY;
}

function loadCart(key: string): CartItem[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    return JSON.parse(raw) as CartItem[];
  } catch {
    return [];
  }
}

function saveCart(key: string, items: CartItem[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(items));
  } catch {
    // Storage quota exceeded — silent fail
  }
}

/** Read current logged-in phone from localStorage without importing UserAuthContext. */
function getCurrentPhone(): string | null {
  try {
    const raw = localStorage.getItem("pearlfect_user_session");
    if (!raw) return null;
    const session = JSON.parse(raw) as { phone: string };
    return session.phone ?? null;
  } catch {
    return null;
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const phoneRef = useRef<string | null>(getCurrentPhone());

  const [items, setItems] = useState<CartItem[]>(() =>
    loadCart(cartKey(phoneRef.current)),
  );

  // Persist every change to the right storage key
  const itemsRef = useRef(items);
  useEffect(() => {
    itemsRef.current = items;
    saveCart(cartKey(phoneRef.current), items);
  }, [items]);

  // Listen for login/logout events via BroadcastChannel (works same-tab + cross-tab)
  useEffect(() => {
    const channel = new BroadcastChannel("pearlfect_auth");

    const handleMessage = (
      e: MessageEvent<{ type: string; phone?: string }>,
    ) => {
      if (e.data.type === "login" && e.data.phone) {
        const newPhone = e.data.phone;
        const prevPhone = phoneRef.current;

        if (newPhone !== prevPhone) {
          // Merge guest cart into user cart
          const guestItems =
            prevPhone === null ? itemsRef.current : loadCart(GUEST_KEY);
          const userItems = loadCart(cartKey(newPhone));
          const merged = mergeCartItems(userItems, guestItems);

          // Clear guest cart from storage
          if (prevPhone === null) {
            localStorage.removeItem(GUEST_KEY);
          }

          phoneRef.current = newPhone;
          saveCart(cartKey(newPhone), merged);
          setItems(merged);
        }
      } else if (e.data.type === "logout") {
        // User just logged out — switch to guest cart (don't wipe user cart)
        phoneRef.current = null;
        const guestItems = loadCart(GUEST_KEY);
        setItems(guestItems);
      }
    };

    channel.addEventListener("message", handleMessage);
    return () => {
      channel.removeEventListener("message", handleMessage);
      channel.close();
    };
  }, []);

  const addToCart = useCallback((product: Product, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id
            ? { ...i, quantity: i.quantity + quantity }
            : i,
        );
      }
      return [...prev, { product, quantity }];
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.product.id !== productId));
  }, []);

  const updateQuantity = useCallback(
    (productId: string, quantity: number) => {
      if (quantity <= 0) {
        removeFromCart(productId);
        return;
      }
      setItems((prev) =>
        prev.map((i) => (i.product.id === productId ? { ...i, quantity } : i)),
      );
    },
    [removeFromCart],
  );

  const clearCart = useCallback(() => {
    setItems([]);
    localStorage.removeItem(cartKey(phoneRef.current));
  }, []);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalAmount = items.reduce(
    (sum, i) => sum + i.product.price * i.quantity,
    0,
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalAmount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

// ── helpers ─────────────────────────────────────────────────────────────────

function mergeCartItems(base: CartItem[], incoming: CartItem[]): CartItem[] {
  const map = new Map<string, CartItem>();
  for (const item of base) map.set(item.product.id, { ...item });
  for (const item of incoming) {
    const existing = map.get(item.product.id);
    if (existing) {
      map.set(item.product.id, {
        ...existing,
        quantity: existing.quantity + item.quantity,
      });
    } else {
      map.set(item.product.id, { ...item });
    }
  }
  return Array.from(map.values());
}
