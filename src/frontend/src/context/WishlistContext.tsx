import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { Product } from "../backend";

interface WishlistContextType {
  wishlist: Product[];
  isWishlisted: (id: string) => boolean;
  toggleWishlist: (product: Product) => void;
  removeFromWishlist: (id: string) => void;
  count: number;
}

const WishlistContext = createContext<WishlistContextType | null>(null);

const STORAGE_KEY = "pearlfect_wishlist";

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlist, setWishlist] = useState<Product[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];
      // We store only minimal data; imageUrl needs special handling
      const parsed = JSON.parse(stored) as Array<{
        id: string;
        name: string;
        price: number;
        salePrice?: number;
        category: string;
        description: string;
        inStock: boolean;
        imageUrlStr: string;
        createdAt: string;
      }>;
      const { ExternalBlob } = require("../backend") as {
        ExternalBlob: typeof import("../backend").ExternalBlob;
      };
      return parsed.map((p) => ({
        ...p,
        imageUrl: ExternalBlob.fromURL(p.imageUrlStr),
        createdAt: BigInt(p.createdAt),
      })) as Product[];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      const toStore = wishlist.map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        salePrice: p.salePrice,
        category: p.category,
        description: p.description,
        inStock: p.inStock,
        imageUrlStr: p.imageUrl.getDirectURL(),
        createdAt: p.createdAt.toString(),
      }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
    } catch {
      // ignore
    }
  }, [wishlist]);

  const isWishlisted = useCallback(
    (id: string) => wishlist.some((p) => p.id === id),
    [wishlist],
  );

  const toggleWishlist = useCallback((product: Product) => {
    setWishlist((prev) =>
      prev.some((p) => p.id === product.id)
        ? prev.filter((p) => p.id !== product.id)
        : [...prev, product],
    );
  }, []);

  const removeFromWishlist = useCallback((id: string) => {
    setWishlist((prev) => prev.filter((p) => p.id !== id));
  }, []);

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        isWishlisted,
        toggleWishlist,
        removeFromWishlist,
        count: wishlist.length,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
