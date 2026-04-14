import { Link } from "@tanstack/react-router";
import { Heart, HelpCircle, Instagram, Mail, Truck } from "lucide-react";

export function Footer() {
  const year = new Date().getFullYear();
  const hostname =
    typeof window !== "undefined" ? window.location.hostname : "";

  return (
    <footer className="bg-foreground text-white py-16 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div>
            <h3 className="font-display text-xl mb-3 text-white">
              The Pearlfect Store
            </h3>
            <p className="text-sm font-body text-white opacity-70 leading-relaxed">
              Each piece is lovingly handcrafted with carefully selected beads
              and pearls, bringing a touch of elegance to every moment — for him
              and for her.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display text-base mb-4 text-white">
              Quick Links
            </h4>
            <ul className="space-y-2">
              {(
                [
                  { to: "/shop", label: "Shop" },
                  { to: "/gallery", label: "Gallery" },
                  { to: "/custom-orders", label: "Custom Orders" },
                  { to: "/wishlist", label: "Wishlist" },
                  { to: "/track-order", label: "Track Order" },
                  { to: "/faq", label: "FAQ" },
                  { to: "/contact", label: "Contact" },
                ] as const
              ).map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className="text-sm font-body text-white opacity-70 hover:opacity-100 transition-opacity"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h4 className="font-display text-base mb-4 text-white">Policies</h4>
            <ul className="space-y-2">
              {(
                [
                  { to: "/return-policy", label: "Return Policy" },
                  { to: "/shipping-policy", label: "Shipping Policy" },
                  { to: "/refund-policy", label: "Refund Policy" },
                  { to: "/privacy-policy", label: "Privacy Policy" },
                ] as const
              ).map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className="text-sm font-body text-white opacity-70 hover:opacity-100 transition-opacity"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display text-base mb-4 text-white">
              Get In Touch
            </h4>
            <div className="space-y-3">
              <a
                href="mailto:thepearlfectstore@gmail.com"
                className="flex items-center gap-2 text-sm font-body text-white opacity-70 hover:opacity-100 transition-opacity"
              >
                <Mail className="h-4 w-4 flex-shrink-0" />
                thepearlfectstore@gmail.com
              </a>
              <a
                href="https://instagram.com/the.pearlfect.store"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-sm font-body text-white opacity-70 hover:opacity-100 transition-opacity"
              >
                <Instagram className="h-4 w-4 flex-shrink-0" />
                @the.pearlfect.store
              </a>
              <Link
                to="/faq"
                className="flex items-center gap-2 text-sm font-body text-white opacity-70 hover:opacity-100 transition-opacity"
              >
                <HelpCircle className="h-4 w-4 flex-shrink-0" />
                Help & FAQ
              </Link>
              <Link
                to="/track-order"
                className="flex items-center gap-2 text-sm font-body text-white opacity-70 hover:opacity-100 transition-opacity"
              >
                <Truck className="h-4 w-4 flex-shrink-0" />
                Track Your Order
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs font-body text-white opacity-50">
            © {year} The Pearlfect Store. Made with{" "}
            <Heart className="inline h-3 w-3 fill-current" /> love.
          </p>
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(hostname)}`}
            target="_blank"
            rel="noreferrer"
            className="text-xs font-body text-white opacity-40 hover:opacity-60 transition-opacity"
          >
            Built with love using caffeine.ai
          </a>
        </div>
      </div>
    </footer>
  );
}
