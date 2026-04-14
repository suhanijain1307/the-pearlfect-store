import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "@tanstack/react-router";
import { Heart, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Product } from "../backend";
import { LoginPopup } from "../components/LoginPopup";
import { useCart } from "../context/CartContext";
import { useUserAuth } from "../context/UserAuthContext";
import { useWishlist } from "../context/WishlistContext";

interface ProductCardProps {
  product: Product;
  index?: number;
}

const toastStyle = {
  background: "#fce4ec",
  color: "#000000",
  border: "1px solid #f8bbd0",
  "--toast-description-color": "#000000",
} as React.CSSProperties;

export function ProductCard({ product, index = 1 }: ProductCardProps) {
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const {
    isLoggedIn,
    getOrCreateCode,
    getStoredCode,
    verifyCode,
    hasCode,
    login,
  } = useUserAuth();
  const wishlisted = isWishlisted(product.id);
  const navigate = useNavigate();
  const [showLoginPopup, setShowLoginPopup] = useState(false);

  const now = Date.now();
  const hasSale =
    product.salePrice != null &&
    product.saleEndDate != null &&
    Number(product.saleEndDate) / 1_000_000 > now;

  const displayPrice = hasSale ? product.salePrice! : product.price;

  const handleAddToCart = () => {
    addToCart(product);
    toast.success(`${product.name} added to cart!`, {
      description: "Continue shopping or head to checkout.",
      style: toastStyle,
    });
  };

  const handleBuyNow = () => {
    if (!isLoggedIn) {
      setShowLoginPopup(true);
      return;
    }
    addToCart(product);
    navigate({ to: "/checkout" });
  };

  const handleLoginSuccess = () => {
    setShowLoginPopup(false);
    addToCart(product);
    navigate({ to: "/checkout" });
  };

  return (
    <>
      {/* Login popup for Buy Now — modal overlay */}
      {showLoginPopup && (
        <LoginPopup
          onSuccess={handleLoginSuccess}
          getOrCreateCode={getOrCreateCode}
          getStoredCode={getStoredCode}
          verifyCode={verifyCode}
          hasCode={hasCode}
          login={login}
        />
      )}

      <div
        className="product-card bg-card rounded-2xl overflow-hidden shadow-soft group"
        data-ocid={`shop.item.${index}`}
      >
        <Link to="/shop/$id" params={{ id: product.id }}>
          <div className="relative aspect-square overflow-hidden bg-muted">
            <img
              src={product.imageUrl.getDirectURL()}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
            {hasSale && (
              <div className="absolute top-2 left-2">
                <span className="bg-rose-500 text-white text-[10px] font-bold font-body px-2 py-0.5 rounded-full">
                  SALE
                </span>
              </div>
            )}
            {!product.inStock && (
              <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                <span className="font-body text-sm font-medium text-foreground">
                  Out of Stock
                </span>
              </div>
            )}
          </div>
        </Link>
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <Badge variant="secondary" className="text-xs font-body">
              {product.category}
            </Badge>
            <button
              type="button"
              onClick={() => {
                toggleWishlist(product);
                toast(
                  wishlisted ? "Removed from wishlist" : "Added to wishlist ♥",
                  { style: toastStyle },
                );
              }}
              className="flex-shrink-0 p-1 rounded-full hover:bg-muted transition-colors"
              aria-label={
                wishlisted ? "Remove from wishlist" : "Add to wishlist"
              }
              data-ocid={`shop.toggle.${index}`}
            >
              <Heart
                className={`h-4 w-4 transition-colors ${
                  wishlisted
                    ? "fill-rose-400 text-rose-400"
                    : "text-muted-foreground"
                }`}
              />
            </button>
          </div>
          <Link to="/shop/$id" params={{ id: product.id }}>
            <h3 className="font-display text-base font-medium text-foreground mb-1 hover:text-primary transition-colors">
              {product.name}
            </h3>
          </Link>
          <div className="flex items-baseline gap-2 mb-3">
            <p className="font-body text-lg font-semibold text-foreground">
              ₹{displayPrice.toLocaleString("en-IN")}
            </p>
            {hasSale && (
              <p className="font-body text-sm text-muted-foreground line-through">
                ₹{product.price.toLocaleString("en-IN")}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 font-body text-xs"
              onClick={handleAddToCart}
              disabled={!product.inStock}
              data-ocid={`shop.secondary_button.${index}`}
            >
              <ShoppingBag className="h-3 w-3 mr-1" />
              Add to Cart
            </Button>
            <Button
              size="sm"
              className="flex-1 font-body text-xs bg-foreground text-background hover:bg-foreground/90"
              onClick={handleBuyNow}
              disabled={!product.inStock}
              data-ocid={`shop.primary_button.${index}`}
            >
              Buy Now
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
