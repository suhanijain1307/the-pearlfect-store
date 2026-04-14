import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Heart,
  HelpCircle,
  LogOut,
  Menu,
  Settings,
  ShoppingBag,
  Truck,
  User,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";
import { useUserAuth } from "../context/UserAuthContext";
import { useWishlist } from "../context/WishlistContext";

const SESSION_KEY = "pearlfect_admin_session";

export function Navbar() {
  const { totalItems } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { isLoggedIn, userPhone, logout } = useUserAuth();
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(
    () => localStorage.getItem(SESSION_KEY) === "true",
  );

  // Sync admin session on storage events (cross-tab) and on mount
  useEffect(() => {
    const handler = () => {
      setIsAdmin(localStorage.getItem(SESSION_KEY) === "true");
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  // Re-check admin status on every route change (same-tab login/logout)
  const currentAdminState = localStorage.getItem(SESSION_KEY) === "true";
  if (currentAdminState !== isAdmin) {
    setIsAdmin(currentAdminState);
  }

  const links = [
    { to: "/" as const, label: "Home" },
    { to: "/shop" as const, label: "Shop" },
    { to: "/gallery" as const, label: "Gallery" },
    { to: "/about" as const, label: "About" },
    { to: "/custom-orders" as const, label: "Custom Orders" },
    { to: "/contact" as const, label: "Contact" },
  ];

  const isActive = (path: string) =>
    path === "/" ? pathname === "/" : pathname.startsWith(path);

  return (
    <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link
            to="/"
            data-ocid="nav.link"
            className="flex flex-col leading-none"
          >
            <span className="font-display text-lg md:text-xl font-semibold text-foreground tracking-wide">
              The Pearlfect Store
            </span>
            <span className="text-[10px] font-body text-muted-foreground tracking-[0.15em] uppercase">
              Handmade Beaded Jewellery
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                data-ocid="nav.link"
                className={`text-sm font-body transition-colors ${
                  isActive(link.to)
                    ? "text-black font-semibold"
                    : "text-black hover:text-black/70"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/faq"
              data-ocid="nav.link"
              className={`text-sm font-body transition-colors ${
                isActive("/faq")
                  ? "text-black font-semibold"
                  : "text-black hover:text-black/70"
              }`}
            >
              FAQ
            </Link>
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-1">
            {/* Wishlist */}
            <Link to="/wishlist" data-ocid="nav.link" className="relative">
              <Button variant="ghost" size="sm" className="relative p-2">
                <Heart className="h-5 w-5" />
                {wishlistCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px] bg-rose-400 text-white">
                    {wishlistCount}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* Cart */}
            <Link to="/checkout" data-ocid="nav.link" className="relative">
              <Button variant="ghost" size="sm" className="relative p-2">
                <ShoppingBag className="h-5 w-5" />
                {totalItems > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px] bg-primary text-primary-foreground">
                    {totalItems}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* Track Order */}
            <Link
              to="/track-order"
              data-ocid="nav.link"
              className="hidden md:flex items-center gap-1 text-xs text-black hover:text-black/70 transition-colors font-body"
            >
              <Truck className="h-3.5 w-3.5" /> Track
            </Link>

            {/* User auth — desktop */}
            {isLoggedIn ? (
              <div className="hidden md:flex items-center gap-1">
                <Link
                  to="/my-orders"
                  data-ocid="nav.my_orders_link"
                  className={`flex items-center gap-1 text-xs font-body px-2.5 py-1 rounded-full border transition-colors ${
                    isActive("/my-orders")
                      ? "bg-rose-100 text-rose-700 border-rose-300 font-semibold"
                      : "text-black hover:text-black/70 border-transparent"
                  }`}
                  title={`Logged in as ${userPhone}`}
                >
                  <User className="h-3.5 w-3.5" /> My Orders
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  data-ocid="nav.logout_button"
                  className="flex items-center gap-1 text-xs text-black/60 hover:text-black/80 transition-colors font-body p-1"
                  aria-label="Logout"
                  title="Logout"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                data-ocid="nav.login_link"
                className="hidden md:flex items-center gap-1 text-xs text-black hover:text-black/70 transition-colors font-body"
              >
                <User className="h-3.5 w-3.5" /> Login
              </Link>
            )}

            {/* Admin link — only visible on /admin pages */}
            {isAdmin && pathname.startsWith("/admin") && (
              <Link
                to="/admin"
                data-ocid="nav.admin_link"
                className="hidden md:flex items-center gap-1.5 text-xs font-body px-2.5 py-1 rounded-full border transition-colors bg-amber-100 text-amber-700 border-amber-300 font-semibold"
              >
                <Settings className="h-3.5 w-3.5" /> Admin
              </Link>
            )}

            {/* Mobile menu toggle */}
            <button
              type="button"
              className="md:hidden p-2"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-background border-b border-border px-4 pb-4">
          <nav className="flex flex-col gap-3 pt-2">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                data-ocid="nav.link"
                onClick={() => setMobileOpen(false)}
                className={`text-sm font-body py-1 ${
                  isActive(link.to) ? "text-black font-semibold" : "text-black"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/faq"
              data-ocid="nav.link"
              onClick={() => setMobileOpen(false)}
              className="text-sm font-body text-black flex items-center gap-1.5"
            >
              <HelpCircle className="h-4 w-4" /> FAQ
            </Link>
            <Link
              to="/wishlist"
              data-ocid="nav.link"
              onClick={() => setMobileOpen(false)}
              className="text-sm font-body text-black flex items-center gap-1.5"
            >
              <Heart className="h-4 w-4" /> Wishlist
              {wishlistCount > 0 ? ` (${wishlistCount})` : ""}
            </Link>
            <Link
              to="/track-order"
              data-ocid="nav.link"
              onClick={() => setMobileOpen(false)}
              className="text-sm font-body text-black flex items-center gap-1.5"
            >
              <Truck className="h-4 w-4" /> Track Order
            </Link>

            {/* User auth — mobile */}
            {isLoggedIn ? (
              <>
                <Link
                  to="/my-orders"
                  data-ocid="nav.my_orders_link"
                  onClick={() => setMobileOpen(false)}
                  className="text-sm font-body text-black flex items-center gap-1.5"
                >
                  <User className="h-4 w-4" /> My Orders
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setMobileOpen(false);
                  }}
                  data-ocid="nav.logout_button"
                  className="text-sm font-body text-black/60 flex items-center gap-1.5 text-left"
                >
                  <LogOut className="h-4 w-4" /> Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                data-ocid="nav.login_link"
                onClick={() => setMobileOpen(false)}
                className="text-sm font-body text-black flex items-center gap-1.5"
              >
                <User className="h-4 w-4" /> Login
              </Link>
            )}

            {isAdmin && pathname.startsWith("/admin") && (
              <Link
                to="/admin"
                data-ocid="nav.admin_link"
                onClick={() => setMobileOpen(false)}
                className="text-sm font-body text-amber-700 font-medium flex items-center gap-1.5"
              >
                <Settings className="h-4 w-4" /> Admin Dashboard
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
