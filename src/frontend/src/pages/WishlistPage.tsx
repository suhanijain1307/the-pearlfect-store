import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";

const cartToastStyle = {
  background: "#fce4ec",
  color: "#000000",
  border: "1px solid #f8bbd0",
  "--toast-description-color": "#000000",
} as React.CSSProperties;

export function WishlistPage() {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  if (wishlist.length === 0) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-4 text-center py-24">
        <Heart className="h-14 w-14 text-muted-foreground/30 mx-auto mb-4" />
        <h2 className="font-display text-2xl font-medium text-foreground mb-3">
          Your wishlist is empty
        </h2>
        <p className="font-body text-muted-foreground mb-6">
          Save pieces you love and come back to them anytime.
        </p>
        <Link to="/shop">
          <Button
            className="rounded-full font-body bg-foreground text-background hover:bg-foreground/90"
            data-ocid="wishlist.primary_button"
          >
            Browse Collection
          </Button>
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <section className="py-12 px-4 sm:px-6 bg-muted/20 text-center">
        <h1 className="font-display text-4xl font-medium text-foreground">
          My Wishlist
        </h1>
        <p className="font-body text-muted-foreground mt-2">
          {wishlist.length} saved piece{wishlist.length !== 1 ? "s" : ""}
        </p>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist.map((product, i) => (
            <div
              key={product.id}
              className="bg-card rounded-2xl overflow-hidden shadow-soft border border-border/30"
              data-ocid={`wishlist.item.${i + 1}`}
            >
              <Link to="/shop/$id" params={{ id: product.id }}>
                <div className="aspect-square overflow-hidden bg-muted">
                  <img
                    src={product.imageUrl.getDirectURL()}
                    alt={product.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
              </Link>
              <div className="p-4">
                <Link to="/shop/$id" params={{ id: product.id }}>
                  <h3 className="font-display text-base font-medium text-foreground hover:text-primary transition-colors">
                    {product.name}
                  </h3>
                </Link>
                <p className="font-body text-sm text-muted-foreground mb-1">
                  {product.category}
                </p>
                <p className="font-body font-semibold text-foreground mb-4">
                  ₹{product.price.toLocaleString("en-IN")}
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1 rounded-xl font-body bg-foreground text-background hover:bg-foreground/90 text-xs"
                    onClick={() => {
                      addToCart(product);
                      toast.success(`${product.name} added to cart!`, {
                        style: cartToastStyle,
                      });
                    }}
                    data-ocid={`wishlist.primary_button.${i + 1}`}
                  >
                    <ShoppingBag className="h-3.5 w-3.5 mr-1.5" /> Add to Cart
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-xl border-destructive/30 text-destructive hover:bg-destructive/10"
                    onClick={() => removeFromWishlist(product.id)}
                    data-ocid={`wishlist.delete_button.${i + 1}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
