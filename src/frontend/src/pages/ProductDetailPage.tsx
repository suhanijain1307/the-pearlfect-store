import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft, Minus, Plus, ShoppingBag, Star, Truck } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { LoginPopup } from "../components/LoginPopup";
import { ProductCard } from "../components/ProductCard";
import { useCart } from "../context/CartContext";
import { useUserAuth } from "../context/UserAuthContext";
import {
  useAddReview,
  useProduct,
  useProducts,
  useReviews,
} from "../hooks/useQueries";

const cartToastStyle = {
  background: "#fce4ec",
  color: "#000000",
  border: "1px solid #f8bbd0",
  "--toast-description-color": "#000000",
} as React.CSSProperties;

function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange?: (v: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange?.(n)}
          onMouseEnter={() => onChange && setHovered(n)}
          onMouseLeave={() => onChange && setHovered(0)}
          className={onChange ? "cursor-pointer" : "cursor-default"}
          data-ocid="review.toggle"
        >
          <Star
            className={`h-5 w-5 ${
              n <= (hovered || value)
                ? "fill-[oklch(0.75_0.12_60)] text-[oklch(0.75_0.12_60)]"
                : "text-muted-foreground"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

function SaleCountdown({ endDate }: { endDate: bigint }) {
  const endMs = Number(endDate) / 1_000_000;
  const [remaining, setRemaining] = useState(() =>
    Math.max(0, endMs - Date.now()),
  );
  useEffect(() => {
    const id = setInterval(
      () => setRemaining(Math.max(0, endMs - Date.now())),
      1000,
    );
    return () => clearInterval(id);
  }, [endMs]);
  if (remaining <= 0) return null;
  const days = Math.floor(remaining / 86400000);
  const hours = Math.floor((remaining % 86400000) / 3600000);
  const mins = Math.floor((remaining % 3600000) / 60000);
  const secs = Math.floor((remaining % 60000) / 1000);
  return (
    <p className="font-body text-xs text-rose-500 mt-1">
      Sale ends in: {days > 0 ? `${days}d ` : ""}
      {String(hours).padStart(2, "0")}h {String(mins).padStart(2, "0")}m{" "}
      {String(secs).padStart(2, "0")}s
    </p>
  );
}

export function ProductDetailPage() {
  const { id } = useParams({ from: "/shop/$id" });
  const { data: product, isLoading, isError } = useProduct(id);
  const { data: allProducts } = useProducts();
  const { data: reviews } = useReviews(id);
  const addReviewMutation = useAddReview();
  const { addToCart } = useCart();
  const {
    isLoggedIn,
    getOrCreateCode,
    getStoredCode,
    verifyCode,
    hasCode,
    login,
  } = useUserAuth();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [reviewName, setReviewName] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  // Tracks whether we're in "buy now pending login" mode
  const [buyNowPending, setBuyNowPending] = useState(false);

  const sameCat =
    allProducts
      ?.filter((p) => p.id !== id && p.category === product?.category)
      .slice(0, 4) ?? [];
  const fillCount = 4 - sameCat.length;
  const others =
    fillCount > 0
      ? (allProducts
          ?.filter((p) => p.id !== id && p.category !== product?.category)
          .slice(0, fillCount) ?? [])
      : [];
  const related = [...sameCat, ...others];

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, quantity);
    toast.success(`${product.name} added to cart!`, {
      style: cartToastStyle,
    });
  };

  const handleBuyNow = () => {
    if (!product) return;
    if (!isLoggedIn) {
      // Mark that we want to buy now, show login popup
      setBuyNowPending(true);
      setShowLoginPopup(true);
      return;
    }
    addToCart(product, quantity);
    navigate({ to: "/checkout" });
  };

  const handleLoginSuccess = () => {
    setShowLoginPopup(false);
    if (buyNowPending && product) {
      setBuyNowPending(false);
      addToCart(product, quantity);
      navigate({ to: "/checkout" });
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewComment.trim()) {
      toast.error("Please fill in your name and review.");
      return;
    }
    try {
      await addReviewMutation.mutateAsync({
        productId: id,
        reviewerName: reviewName.trim(),
        rating: reviewRating,
        comment: reviewComment.trim(),
      });
      toast.success("Review submitted! Thank you.");
      setReviewName("");
      setReviewRating(5);
      setReviewComment("");
    } catch {
      toast.error("Could not submit review. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid md:grid-cols-2 gap-12">
          <Skeleton className="aspect-square w-full rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-20 w-full" />
          </div>
        </div>
      </main>
    );
  }

  if (isError || !product) {
    return (
      <main
        className="max-w-7xl mx-auto px-4 sm:px-6 py-24 text-center"
        data-ocid="product.error_state"
      >
        <h2 className="font-display text-2xl text-foreground mb-4">
          Product not found
        </h2>
        <Link to="/shop">
          <Button variant="outline" className="rounded-full font-body">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Shop
          </Button>
        </Link>
      </main>
    );
  }

  return (
    <main>
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 text-sm font-body text-muted-foreground hover:text-foreground transition-colors mb-8"
          data-ocid="product.link"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Shop
        </Link>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Image */}
          <div className="relative rounded-3xl overflow-hidden aspect-square bg-muted shadow-soft-lg">
            <img
              src={product.imageUrl.getDirectURL()}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Info */}
          <div className="flex flex-col justify-center">
            <Badge variant="secondary" className="w-fit font-body text-xs mb-4">
              {product.category}
            </Badge>
            <h1 className="font-display text-3xl md:text-4xl font-medium text-foreground mb-3">
              {product.name}
            </h1>
            {/* Price display with sale */}
            {product.salePrice != null &&
            product.saleEndDate != null &&
            Number(product.saleEndDate) / 1_000_000 > Date.now() ? (
              <div className="mb-2">
                <div className="flex items-baseline gap-3">
                  <p className="font-body text-2xl font-semibold text-rose-600">
                    ₹{product.salePrice.toLocaleString("en-IN")}
                  </p>
                  <p className="font-body text-lg text-muted-foreground line-through">
                    ₹{product.price.toLocaleString("en-IN")}
                  </p>
                  <span className="bg-rose-500 text-white text-xs font-bold font-body px-2 py-0.5 rounded-full">
                    SALE
                  </span>
                </div>
                <SaleCountdown endDate={product.saleEndDate} />
              </div>
            ) : (
              <p className="font-body text-2xl font-semibold text-foreground mb-2">
                ₹{product.price.toLocaleString("en-IN")}
              </p>
            )}
            <Badge
              variant={product.inStock ? "outline" : "secondary"}
              className="w-fit mb-3 font-body text-xs"
            >
              {product.inStock ? "✓ In Stock" : "Out of Stock"}
            </Badge>

            {/* Delivery Info */}
            <div className="flex items-center gap-2 mb-5 px-3 py-2 rounded-full bg-[oklch(0.93_0.06_155_/_0.25)] border border-[oklch(0.80_0.08_155_/_0.40)] w-fit">
              <Truck className="h-4 w-4 text-[oklch(0.45_0.12_155)]" />
              <span className="font-body text-xs text-[oklch(0.35_0.10_155)]">
                Estimated Delivery: 4–6 business days
              </span>
            </div>

            <p className="font-body text-muted-foreground leading-relaxed mb-8">
              {product.description}
            </p>

            {/* Quantity */}
            <div className="flex items-center gap-4 mb-6">
              <span className="font-body text-sm text-muted-foreground">
                Quantity
              </span>
              <div className="flex items-center border border-border rounded-full overflow-hidden">
                <button
                  type="button"
                  className="p-2 px-3 hover:bg-muted transition-colors"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  data-ocid="product.toggle"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span className="px-4 font-body text-sm font-medium">
                  {quantity}
                </span>
                <button
                  type="button"
                  className="p-2 px-3 hover:bg-muted transition-colors"
                  onClick={() => setQuantity((q) => q + 1)}
                  data-ocid="product.toggle"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                className="flex-1 font-body rounded-full"
                onClick={handleAddToCart}
                disabled={!product.inStock}
                data-ocid="product.secondary_button"
              >
                <ShoppingBag className="mr-2 h-4 w-4" />
                Add to Cart
              </Button>
              <Button
                className="flex-1 font-body rounded-full bg-foreground text-background hover:bg-foreground/90"
                onClick={handleBuyNow}
                disabled={!product.inStock}
                data-ocid="product.primary_button"
              >
                Buy Now
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="py-16 px-4 sm:px-6 bg-muted/20 mt-12">
          <div className="max-w-7xl mx-auto">
            <h2 className="font-display text-2xl font-medium text-foreground mb-8">
              You May Also Like
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {related.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i + 1} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Reviews Section */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-2xl font-medium text-foreground mb-8">
            Customer Reviews
          </h2>

          {/* Existing Reviews */}
          {!reviews || reviews.length === 0 ? (
            <div
              className="text-center py-10 bg-muted/20 rounded-2xl mb-10"
              data-ocid="reviews.empty_state"
            >
              <Star className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
              <p className="font-body text-muted-foreground">
                Be the first to review this piece!
              </p>
            </div>
          ) : (
            <div className="space-y-4 mb-10">
              {reviews.map((review, i) => (
                <div
                  key={review.id}
                  className="bg-card rounded-2xl p-6 shadow-soft"
                  data-ocid={`reviews.item.${i + 1}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-display text-sm font-semibold text-foreground mb-1">
                        {review.reviewerName}
                      </p>
                      <StarRating value={Number(review.rating)} />
                    </div>
                    <p className="font-body text-xs text-muted-foreground">
                      {new Date(
                        Number(review.createdAt) / 1_000_000,
                      ).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <p className="font-body text-sm text-muted-foreground leading-relaxed mt-3 italic">
                    &ldquo;{review.comment}&rdquo;
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Write a Review */}
          <div className="bg-card rounded-2xl p-6 md:p-8 shadow-soft">
            <h3 className="font-display text-lg font-medium text-foreground mb-6">
              Write a Review
            </h3>
            <form
              onSubmit={handleReviewSubmit}
              className="space-y-5"
              data-ocid="review.modal"
            >
              <div className="space-y-1.5">
                <Label className="font-body text-sm" htmlFor="review-name">
                  Your Name
                </Label>
                <Input
                  id="review-name"
                  value={reviewName}
                  onChange={(e) => setReviewName(e.target.value)}
                  placeholder="Enter your name"
                  className="font-body text-sm rounded-xl"
                  data-ocid="review.input"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="font-body text-sm">Rating</Label>
                <StarRating value={reviewRating} onChange={setReviewRating} />
              </div>
              <div className="space-y-1.5">
                <Label className="font-body text-sm" htmlFor="review-comment">
                  Your Review
                </Label>
                <Textarea
                  id="review-comment"
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share your experience with this piece..."
                  className="font-body text-sm rounded-xl min-h-[100px]"
                  data-ocid="review.textarea"
                />
              </div>
              <Button
                type="submit"
                className="font-body rounded-full bg-foreground text-background hover:bg-foreground/90"
                disabled={addReviewMutation.isPending}
                data-ocid="review.submit_button"
              >
                {addReviewMutation.isPending
                  ? "Submitting..."
                  : "Submit Review"}
              </Button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
