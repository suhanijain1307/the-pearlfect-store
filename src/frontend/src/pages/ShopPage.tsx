import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles } from "lucide-react";
import { useState } from "react";
import { ProductCard } from "../components/ProductCard";
import { useProducts } from "../hooks/useQueries";

type SortOption = "default" | "price-asc" | "price-desc";

export function ShopPage() {
  const { data: products, isLoading } = useProducts();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [sortOption, setSortOption] = useState<SortOption>("default");

  const specialTabs = ["All", "New Arrivals", "Best Sellers"];
  const coreCategories = [
    "Bracelets",
    "Necklaces",
    "Anklets",
    "Phone Charms",
    "Charms",
  ];
  const fixedTabs = [...specialTabs, ...coreCategories];
  const dynamicCategories = Array.from(
    new Set(products?.map((p) => p.category) ?? []),
  );
  const categories = [
    ...fixedTabs,
    ...dynamicCategories.filter(
      (c) => !fixedTabs.some((f) => f.toLowerCase() === c.toLowerCase()),
    ),
  ];

  let filtered = (() => {
    const all = products ?? [];
    if (selectedCategory === "All") return all;
    if (selectedCategory === "New Arrivals") {
      return [...all].sort((a, b) => Number(b.createdAt) - Number(a.createdAt));
    }
    if (selectedCategory === "Best Sellers") {
      return all.slice(0, 6);
    }
    return all.filter(
      (p) => p.category.toLowerCase() === selectedCategory.toLowerCase(),
    );
  })();

  if (sortOption === "price-asc") {
    filtered = [...filtered].sort((a, b) => a.price - b.price);
  } else if (sortOption === "price-desc") {
    filtered = [...filtered].sort((a, b) => b.price - a.price);
  }

  return (
    <main className="min-h-screen">
      {/* Notice banner */}
      <div className="bg-[#fdf6f0] border-b border-[#e8d5c4] py-2.5 px-4 text-center">
        <p className="font-body text-sm text-[#a07850] tracking-wide">
          Charms may change from time to time ✨ these are just sample pieces.
        </p>
      </div>

      {/* Header */}
      <section className="py-16 px-4 sm:px-6 bg-muted/20 text-center">
        <p className="font-body text-xs tracking-[0.25em] uppercase text-muted-foreground mb-3">
          Handmade With Love
        </p>
        <h1 className="font-display text-4xl md:text-5xl font-medium text-foreground">
          Our Collection
        </h1>
        <p className="font-body text-muted-foreground mt-3 max-w-md mx-auto">
          Every piece is crafted with care, from the first bead to the final
          clasp.
        </p>
      </section>

      {/* Filter + Sort Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-2 flex flex-wrap items-center gap-2 justify-between">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              type="button"
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              data-ocid="shop.tab"
            >
              <Badge
                variant={selectedCategory === cat ? "default" : "outline"}
                className="cursor-pointer font-body text-xs px-4 py-1.5 rounded-full"
              >
                {cat}
              </Badge>
            </button>
          ))}
        </div>

        {/* Sort */}
        <Select
          value={sortOption}
          onValueChange={(v) => setSortOption(v as SortOption)}
        >
          <SelectTrigger
            className="w-48 font-body text-xs rounded-full"
            data-ocid="shop.select"
          >
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default" className="font-body text-xs">
              Default
            </SelectItem>
            <SelectItem value="price-asc" className="font-body text-xs">
              Price: Low to High
            </SelectItem>
            <SelectItem value="price-desc" className="font-body text-xs">
              Price: High to Low
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Product Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} className="rounded-2xl overflow-hidden">
                <Skeleton className="aspect-square w-full" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-6 w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24" data-ocid="shop.empty_state">
            <Sparkles className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-display text-xl text-foreground mb-2">
              No products yet
            </h3>
            <p className="font-body text-muted-foreground">
              Check back soon — beautiful pieces are on their way!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filtered.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i + 1} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
