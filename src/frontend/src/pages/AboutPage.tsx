import { Gem, Heart, Sparkles } from "lucide-react";
import { motion } from "motion/react";

const VALUES = [
  {
    icon: Heart,
    title: "Handmade with Love",
    description:
      "Every bead is threaded with intention. Each piece carries the warmth and care of hands that truly love what they make.",
  },
  {
    icon: Sparkles,
    title: "Made for Everyone",
    description:
      "Jewellery doesn't have a gender. Whether it's for him, her, or yourself — our pieces are made for every soul who appreciates something beautiful.",
  },
  {
    icon: Gem,
    title: "Quality in Every Bead",
    description:
      "Only the finest pearls, seed beads, and gemstone accents. We never compromise on materials because we never want you to compromise on feeling your best.",
  },
];

export function AboutPage() {
  return (
    <main>
      {/* Hero */}
      <section className="relative py-28 px-4 sm:px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[oklch(0.95_0.04_50)] via-[oklch(0.93_0.05_20)] to-[oklch(0.90_0.06_15)]" />
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-[oklch(0.88_0.07_15_/_0.35)] blur-3xl" />
        <div className="absolute bottom-0 left-0 w-60 h-60 rounded-full bg-[oklch(0.90_0.06_50_/_0.25)] blur-3xl" />
        <div className="relative max-w-3xl mx-auto text-center">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="font-body text-xs tracking-[0.28em] uppercase text-[oklch(0.50_0.08_30)] mb-4"
          >
            The Pearlfect Store
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-5xl md:text-7xl font-semibold text-[oklch(0.25_0.04_30)] mb-6 leading-tight"
          >
            Our Story
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="font-body text-base md:text-lg text-[oklch(0.45_0.06_30)] leading-relaxed"
          >
            Born in 2023. Built one bead at a time.
          </motion.p>
        </div>
      </section>

      {/* Brand Story */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-14 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <p className="font-body text-xs tracking-[0.25em] uppercase text-muted-foreground mb-4">
                How It Began
              </p>
              <h2 className="font-display text-3xl md:text-4xl font-medium text-foreground mb-6 leading-snug">
                A Brand Built
                <br />
                <em className="italic text-[oklch(0.60_0.12_30)]">
                  One Bead at a Time
                </em>
              </h2>
              <div className="space-y-4 font-body text-muted-foreground leading-relaxed">
                <p>
                  The Pearlfect Store was born in 2023 from a simple love of
                  crafting. What started as a quiet creative escape quickly grew
                  into something far more meaningful — a brand built one bead at
                  a time.
                </p>
                <p>
                  Every piece is handmade with intention. From delicate pearl
                  necklaces to playful phone charms and elegant anklets, each
                  creation carries the warmth of the hands that made it.
                </p>
                <p>
                  We believe jewellery is more than an accessory — it's a
                  feeling. A memory. A little piece of someone's heart.
                </p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="relative"
            >
              <div className="rounded-3xl overflow-hidden aspect-[4/5] bg-muted shadow-soft-lg">
                <img
                  src="/assets/generated/about-brand-story.dim_600x750.jpg"
                  alt="The Pearlfect Store crafting process"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-5 -left-5 w-36 h-36 rounded-2xl overflow-hidden border-4 border-background shadow-soft">
                <img
                  src="/assets/generated/about-beads-detail.dim_200x200.jpg"
                  alt="Bead detail"
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Founder Story */}
      <section className="py-20 px-4 sm:px-6 bg-muted/20">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center mb-12"
          >
            <p className="font-body text-xs tracking-[0.25em] uppercase text-muted-foreground mb-3">
              Meet the Founder
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-medium text-foreground">
              The Person Behind the Beads
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="bg-card rounded-3xl p-8 md:p-12 shadow-soft relative overflow-hidden"
          >
            {/* decorative quote mark */}
            <div className="absolute top-6 left-8 font-display text-[120px] leading-none text-[oklch(0.88_0.06_30_/_0.4)] select-none pointer-events-none">
              &ldquo;
            </div>
            <div className="relative">
              {/* Highlight quote */}
              <div className="inline-block bg-gradient-to-r from-[oklch(0.92_0.06_50)] to-[oklch(0.90_0.07_20)] rounded-2xl px-6 py-4 mb-8">
                <p className="font-display text-xl md:text-2xl font-medium text-[oklch(0.30_0.06_30)] italic">
                  "Honestly? I started because I was bored."
                </p>
              </div>

              <div className="space-y-4 font-body text-muted-foreground leading-relaxed max-w-2xl">
                <p>
                  What began as an idle afternoon project — stringing beads with
                  no plan — became The Pearlfect Store. I never imagined it
                  would become official. But the pieces kept coming, and so did
                  the love for them.
                </p>
                <p>
                  I never expected to be a jewellery maker. But here we are, and
                  I wouldn't change a thing.
                </p>
              </div>

              <div className="mt-8 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[oklch(0.85_0.08_15)] to-[oklch(0.80_0.10_50)] flex items-center justify-center">
                  <span className="font-display text-lg font-semibold text-[oklch(0.30_0.06_30)]">
                    S
                  </span>
                </div>
                <div>
                  <p className="font-display text-base font-semibold text-foreground">
                    Suhani
                  </p>
                  <p className="font-body text-xs text-muted-foreground tracking-wider uppercase">
                    Founder, The Pearlfect Store
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="font-body text-xs tracking-[0.25em] uppercase text-muted-foreground mb-3">
              What We Stand For
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-medium text-foreground">
              Our Values
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {VALUES.map((val, i) => (
              <motion.div
                key={val.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.12 }}
                className="bg-card rounded-2xl p-8 shadow-soft text-center"
                data-ocid={`about.item.${i + 1}`}
              >
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[oklch(0.90_0.06_50)] to-[oklch(0.88_0.08_20)] flex items-center justify-center mx-auto mb-5">
                  <val.icon className="h-6 w-6 text-[oklch(0.45_0.10_30)]" />
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground mb-3">
                  {val.title}
                </h3>
                <p className="font-body text-sm text-muted-foreground leading-relaxed">
                  {val.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
