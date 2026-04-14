import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles, Star } from "lucide-react";
import { ProductCard } from "../components/ProductCard";
import { useProducts, useStoryImages } from "../hooks/useQueries";

const TESTIMONIALS = [
  {
    name: "Khushi",
    text: "I ordered a custom 5-charms beaded bracelet for myself, and it turned out absolutely beautiful. The attention to detail and craftsmanship are incredible, and it feels so unique and personal. I've already received so many compliments, and everyone keeps asking me where I got it from.",
    rating: 5,
  },
  {
    name: "Shashank R",
    text: "Got a beaded bracelet for myself and absolutely love it. Looks premium and pairs well with casual and formal outfits. The packaging was beautiful too!",
    rating: 5,
  },
  {
    name: "Sujith Reddy",
    text: "I gifted a set to my best friend for her birthday and she was in tears! Truly handmade with so much love. Each piece is unique and special.",
    rating: 5,
  },
];

export function HomePage() {
  const { data: products, isLoading } = useProducts();
  const { data: storyImages } = useStoryImages();

  const newArrivals = [...(products ?? [])]
    .sort((a, b) => Number(b.createdAt) - Number(a.createdAt))
    .slice(0, 4);

  const bestSellers = (products ?? []).slice(0, 4);

  return (
    <main>
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#fdf8f3] via-[#faf0eb] to-[#f5ece6]" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-[oklch(0.88_0.06_15_/_0.35)] to-[oklch(0.90_0.05_50_/_0.20)] blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-gradient-to-tr from-[oklch(0.92_0.07_80_/_0.25)] to-[oklch(0.95_0.04_60_/_0.15)] blur-3xl" />
        <div className="absolute inset-0">
          <img
            src="/assets/generated/hero-jewellery-banner.dim_1400x700.jpg"
            alt="Handmade beaded jewellery"
            className="w-full h-full object-cover opacity-10"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-24 w-full">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-6">
              <span className="inline-flex items-center gap-1.5 font-body text-xs tracking-[0.25em] uppercase px-4 py-1.5 rounded-full border border-[oklch(0.70_0.08_30_/_0.30)] text-[oklch(0.45_0.06_30)] bg-[oklch(0.95_0.03_50_/_0.60)]">
                ✦ Handcrafted With Love
              </span>
            </div>
            <h1 className="font-display text-5xl md:text-7xl font-semibold leading-tight mb-4 text-[oklch(0.25_0.04_30)]">
              The
              <br />
              <span className="bg-gradient-to-r from-[oklch(0.62_0.14_50)] via-[oklch(0.68_0.12_30)] to-[oklch(0.58_0.10_20)] bg-clip-text text-transparent">
                Pearlfect
              </span>
              <br />
              Store
            </h1>
            <p className="font-body text-base md:text-lg text-[oklch(0.45_0.05_30)] mb-3 leading-relaxed">
              Handmade Beaded Jewellery Made With Love
            </p>
            <p className="font-body text-sm md:text-base mb-8 leading-relaxed">
              <span className="text-[oklch(0.55_0.10_30)]">
                Elegant pieces for every soul —
              </span>{" "}
              <span className="text-[oklch(0.50_0.08_50)]">
                gifted, worn, and cherished
              </span>
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link to="/shop" data-ocid="hero.primary_button">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-[oklch(0.62_0.14_50)] to-[oklch(0.58_0.12_20)] text-white hover:opacity-90 font-body rounded-full px-8 shadow-md border-0"
                >
                  Shop Collection
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/custom-orders" data-ocid="hero.secondary_button">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-[oklch(0.70_0.08_30_/_0.50)] text-[oklch(0.35_0.06_30)] hover:bg-[oklch(0.92_0.04_50_/_0.50)] font-body rounded-full px-8"
                >
                  Custom Orders
                </Button>
              </Link>
            </div>
            <div className="mt-10 flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-[oklch(0.85_0.08_15)]" />
              <div className="w-4 h-4 rounded-full bg-[oklch(0.82_0.10_50)]" />
              <div className="w-4 h-4 rounded-full bg-[oklch(0.78_0.06_80)]" />
              <div className="w-4 h-4 rounded-full bg-[oklch(0.92_0.04_60)]" />
              <span className="font-body text-xs text-[oklch(0.60_0.04_30)] ml-1 tracking-widest uppercase">
                Our palette
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Story */}
      <section className="py-20 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="font-body text-xs tracking-[0.25em] uppercase text-muted-foreground mb-4">
              Our Story
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-medium text-foreground mb-6 leading-tight">
              Each Bead Holds a Story,
              <br />
              <em className="italic">Every Piece Holds a Feeling</em>
            </h2>
            <p className="font-body text-muted-foreground leading-relaxed mb-4">
              The Pearlfect Store was born from a deep love for the art of
              beadwork — crafting jewellery that feels personal and precious for
              everyone who wears it.
            </p>
            <p className="font-body text-muted-foreground leading-relaxed mb-6">
              Every necklace, bracelet, phone charm, and anklet is made by hand.
              Whether it&apos;s a gift for him, her, or yourself, each piece is
              made with intention and love.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/custom-orders" data-ocid="story.secondary_button">
                <Button variant="outline" className="rounded-full font-body">
                  Create Something Custom
                </Button>
              </Link>
              <Link to="/about" data-ocid="story.link">
                <Button
                  variant="ghost"
                  className="rounded-full font-body text-muted-foreground"
                >
                  Read Our Story →
                </Button>
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <img
              src={
                storyImages?.slot1
                  ? storyImages.slot1.imageUrl.getDirectURL()
                  : "/assets/generated/gallery-crafting-process.dim_800x800.jpg"
              }
              alt="Crafting process"
              className="rounded-2xl object-cover w-full aspect-square shadow-soft"
            />
            <img
              src={
                storyImages?.slot2
                  ? storyImages.slot2.imageUrl.getDirectURL()
                  : "/assets/generated/gallery-jewellery-spread-v2.dim_800x800.jpg"
              }
              alt="Jewellery collection"
              className="rounded-2xl object-cover w-full aspect-square shadow-soft mt-8"
            />
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-16 px-4 sm:px-6 bg-gradient-to-br from-[oklch(0.96_0.03_50)] to-[oklch(0.94_0.04_20)]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <p className="font-body text-xs tracking-[0.25em] uppercase text-muted-foreground mb-2">
                Just Landed
              </p>
              <h2 className="font-display text-3xl md:text-4xl font-medium text-foreground">
                New Arrivals
              </h2>
              <p className="font-body text-sm text-muted-foreground mt-1">
                Fresh from the studio
              </p>
            </div>
            <Link to="/shop" data-ocid="new-arrivals.primary_button">
              <Button
                variant="outline"
                className="rounded-full font-body text-sm"
              >
                Shop New Arrivals
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {[1, 2, 3, 4].map((n) => (
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
          ) : newArrivals.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {newArrivals.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i + 1} />
              ))}
            </div>
          ) : (
            <div
              className="text-center py-12"
              data-ocid="new-arrivals.empty_state"
            >
              <Sparkles className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
              <p className="font-body text-muted-foreground">
                New pieces coming soon!
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Best Sellers */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <p className="font-body text-xs tracking-[0.25em] uppercase text-muted-foreground mb-2">
                Customer Favourites
              </p>
              <h2 className="font-display text-3xl md:text-4xl font-medium text-foreground">
                Best Sellers
              </h2>
            </div>
            <Link to="/shop" data-ocid="best-sellers.primary_button">
              <Button
                variant="outline"
                className="rounded-full font-body text-sm"
              >
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {[1, 2, 3, 4].map((n) => (
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
          ) : bestSellers.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {bestSellers.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i + 1} />
              ))}
            </div>
          ) : (
            <div
              className="text-center py-12"
              data-ocid="best-sellers.empty_state"
            >
              <Sparkles className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
              <p className="font-body text-muted-foreground">
                Our best sellers are on their way!
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Shop By Category: Bracelets, Necklaces, Phone Charms, Charms */}
      <section className="py-16 px-4 sm:px-6 bg-[#fdf8f3]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="font-body text-xs tracking-[0.25em] uppercase text-muted-foreground mb-3">
              Browse By Category
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-medium text-foreground">
              Shop The Collection
            </h2>
          </div>

          {/* Bracelets */}
          <div className="mb-14">
            <div className="flex items-end justify-between mb-6">
              <div>
                <h3 className="font-display text-2xl font-medium text-foreground">
                  Bracelets
                </h3>
                <p className="font-body text-sm text-muted-foreground mt-1">
                  Beaded and delicate, for every wrist
                </p>
              </div>
              <Link to="/shop" data-ocid="bracelets.view_all">
                <Button
                  variant="ghost"
                  className="rounded-full font-body text-sm text-muted-foreground"
                >
                  See All <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </Link>
            </div>
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                {[1, 2, 3, 4].map((n) => (
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
            ) : (products ?? []).filter(
                (p) => p.category.toLowerCase() === "bracelets",
              ).length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                {(products ?? [])
                  .filter((p) => p.category.toLowerCase() === "bracelets")
                  .slice(0, 4)
                  .map((product, i) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      index={i + 1}
                    />
                  ))}
              </div>
            ) : (
              <div className="text-center py-10 rounded-2xl border border-dashed border-muted-foreground/20">
                <p className="font-body text-sm text-muted-foreground">
                  Bracelets coming soon!
                </p>
              </div>
            )}
          </div>

          {/* Necklaces */}
          <div className="mb-14">
            <div className="flex items-end justify-between mb-6">
              <div>
                <h3 className="font-display text-2xl font-medium text-foreground">
                  Necklaces
                </h3>
                <p className="font-body text-sm text-muted-foreground mt-1">
                  Elegant and timeless, for every neckline
                </p>
              </div>
              <Link to="/shop" data-ocid="necklaces.view_all">
                <Button
                  variant="ghost"
                  className="rounded-full font-body text-sm text-muted-foreground"
                >
                  See All <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </Link>
            </div>
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                {[1, 2, 3, 4].map((n) => (
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
            ) : (products ?? []).filter(
                (p) => p.category.toLowerCase() === "necklaces",
              ).length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                {(products ?? [])
                  .filter((p) => p.category.toLowerCase() === "necklaces")
                  .slice(0, 4)
                  .map((product, i) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      index={i + 1}
                    />
                  ))}
              </div>
            ) : (
              <div className="text-center py-10 rounded-2xl border border-dashed border-muted-foreground/20">
                <p className="font-body text-sm text-muted-foreground">
                  Necklaces coming soon!
                </p>
              </div>
            )}
          </div>

          {/* Phone Charms */}
          <div className="mb-14">
            <div className="flex items-end justify-between mb-6">
              <div>
                <h3 className="font-display text-2xl font-medium text-foreground">
                  Phone Charms
                </h3>
                <p className="font-body text-sm text-muted-foreground mt-1">
                  Cute, beaded, and made to dangle ✨
                </p>
              </div>
              <Link to="/shop" data-ocid="phone-charms.view_all">
                <Button
                  variant="ghost"
                  className="rounded-full font-body text-sm text-muted-foreground"
                >
                  See All <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </Link>
            </div>
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                {[1, 2, 3, 4].map((n) => (
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
            ) : (products ?? []).filter(
                (p) => p.category.toLowerCase() === "phone charms",
              ).length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                {(products ?? [])
                  .filter((p) => p.category.toLowerCase() === "phone charms")
                  .slice(0, 4)
                  .map((product, i) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      index={i + 1}
                    />
                  ))}
              </div>
            ) : (
              <div className="text-center py-10 rounded-2xl border border-dashed border-muted-foreground/20">
                <p className="font-body text-sm text-muted-foreground">
                  Phone charms coming soon!
                </p>
              </div>
            )}
          </div>

          {/* Charms */}
          <div>
            <div className="flex items-end justify-between mb-6">
              <div>
                <h3 className="font-display text-2xl font-medium text-foreground">
                  Charms
                </h3>
                <p className="font-body text-sm text-muted-foreground mt-1">
                  Little treasures for every collection ✨
                </p>
              </div>
              <Link to="/shop" data-ocid="charms.view_all">
                <Button
                  variant="ghost"
                  className="rounded-full font-body text-sm text-muted-foreground"
                >
                  See All <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </Link>
            </div>
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                {[1, 2, 3, 4].map((n) => (
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
            ) : (products ?? []).filter(
                (p) => p.category.toLowerCase() === "charms",
              ).length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                {(products ?? [])
                  .filter((p) => p.category.toLowerCase() === "charms")
                  .slice(0, 4)
                  .map((product, i) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      index={i + 1}
                    />
                  ))}
              </div>
            ) : (
              <div className="text-center py-10 rounded-2xl border border-dashed border-muted-foreground/20">
                <p className="font-body text-sm text-muted-foreground">
                  Charms coming soon!
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Custom Order Banner */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#e8f0e8] to-[#d4e4d4] p-10 md:p-16">
            <div className="relative z-10 text-center max-w-xl mx-auto">
              <p className="font-body text-xs tracking-[0.25em] uppercase text-[#4a6e5a] mb-4">
                Bespoke Jewellery
              </p>
              <h2 className="font-display text-3xl md:text-5xl font-medium mb-4 leading-tight text-[#2a4535]">
                Want Something
                <br />
                <em className="italic text-[#3a5a48]">Uniquely Yours?</em>
              </h2>
              <p className="font-body text-[#4a6055] mb-8 leading-relaxed">
                Design your dream piece. Share your vision and we'll craft a
                one-of-a-kind jewellery piece just for you.
              </p>
              <Link
                to="/custom-orders"
                data-ocid="custom-banner.primary_button"
              >
                <Button
                  variant="outline"
                  className="rounded-full font-body border-[#c06080] text-[#7a3050] hover:bg-[#c06080]/10 hover:text-[#2a4535] px-8"
                >
                  Request a Custom Piece
                </Button>
              </Link>
            </div>
            <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-green-200/30" />
            <div className="absolute -left-8 -bottom-8 w-36 h-36 rounded-full bg-green-300/20" />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-4 sm:px-6 bg-muted/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="font-body text-xs tracking-[0.25em] uppercase text-muted-foreground mb-3">
              Kind Words
            </p>
            <h2 className="font-display text-3xl font-medium text-foreground">
              What Our Customers Say
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div
                key={t.name}
                className="bg-card rounded-2xl p-6 shadow-soft"
                data-ocid={`testimonials.item.${i + 1}`}
              >
                <div className="flex gap-1 mb-4">
                  {([1, 2, 3, 4, 5] as number[]).slice(0, t.rating).map((n) => (
                    <Star
                      key={n}
                      className="h-4 w-4 fill-primary text-primary"
                    />
                  ))}
                </div>
                <p className="font-body text-sm text-muted-foreground leading-relaxed mb-4 italic">
                  &ldquo;{t.text}&rdquo;
                </p>
                <p className="font-display text-sm font-medium text-foreground">
                  — {t.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
