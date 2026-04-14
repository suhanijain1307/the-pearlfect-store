import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  createActorWithConfig,
  useActor,
} from "@caffeineai/core-infrastructure";
import { Link, useNavigate } from "@tanstack/react-router";
import { ShoppingBag, Trash2, Truck } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { createActor } from "../backend";
import { LoginPopup } from "../components/LoginPopup";
import { useCart } from "../context/CartContext";
import { useUserAuth } from "../context/UserAuthContext";
import { broadcastOrdersUpdate, usePlaceOrder } from "../hooks/useQueries";
import {
  applyLocalCoupon,
  incrementCouponUsage,
  saveLocalCoupon,
} from "../utils/couponStorage";

const FREE_DELIVERY_THRESHOLD = 499;
const DELIVERY_FEE = 50;

// ─── Saved address helpers ────────────────────────────────────────────────────

interface SavedAddress {
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
}

function loadSavedAddress(phone: string): SavedAddress | null {
  try {
    const raw = localStorage.getItem(`pearlfect_address_${phone}`);
    if (!raw) return null;
    return JSON.parse(raw) as SavedAddress;
  } catch {
    return null;
  }
}

function saveAddress(phone: string, address: SavedAddress) {
  try {
    localStorage.setItem(`pearlfect_address_${phone}`, JSON.stringify(address));
  } catch {
    // storage full — silently skip
  }
}

// ─── Main Checkout Page ───────────────────────────────────────────────────────

export function CheckoutPage() {
  const { items, totalAmount, clearCart, removeFromCart } = useCart();
  const {
    isLoggedIn,
    userPhone,
    getOrCreateCode,
    getStoredCode,
    verifyCode,
    hasCode,
    login,
  } = useUserAuth();
  const placeOrder = usePlaceOrder();
  const { actor } = useActor(createActor);
  const navigate = useNavigate();

  // Show login popup when not logged in and cart has items
  const [showLoginPopup, setShowLoginPopup] = useState(
    !isLoggedIn && items.length > 0,
  );

  // Re-evaluate popup visibility whenever login state changes
  useEffect(() => {
    if (isLoggedIn) setShowLoginPopup(false);
    else if (items.length > 0) setShowLoginPopup(true);
  }, [isLoggedIn, items.length]);

  const deliveryFee = totalAmount >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountPercent: number;
  } | null>(null);
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  const discountAmount = appliedCoupon
    ? Math.round(totalAmount * (appliedCoupon.discountPercent / 100))
    : 0;
  const grandTotal = totalAmount + deliveryFee - discountAmount;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponError("");
    setCouponLoading(true);

    // 1. Try localStorage first (fastest, no network needed)
    const localResult = applyLocalCoupon(couponCode.trim().toUpperCase());
    if (localResult.success) {
      setCouponLoading(false);
      setAppliedCoupon({
        code: localResult.coupon.code,
        discountPercent: localResult.coupon.discountPercent,
      });
      return;
    }

    // 2. Fallback: fetch from backend and cache to localStorage
    try {
      const activeActor = actor ?? (await createActorWithConfig(createActor));
      const backendCoupons = await activeActor.getCoupons();
      const match = backendCoupons.find(
        (c) => c.code.toUpperCase() === couponCode.trim().toUpperCase(),
      );
      if (
        match?.isActive &&
        Number(match.expiryDate) / 1_000_000 > Date.now()
      ) {
        // Cache to localStorage so future applies work instantly
        saveLocalCoupon({
          id: match.id,
          code: match.code,
          discountPercent: match.discountPercent,
          expiryDate: Number(match.expiryDate) / 1_000_000,
          usageLimit: Number(match.usageLimit),
          usedCount: Number(match.usedCount),
          isActive: match.isActive,
        });
        setCouponLoading(false);
        setAppliedCoupon({
          code: match.code,
          discountPercent: match.discountPercent,
        });
        return;
      }
    } catch {
      // Backend unavailable — fall through to error
    }

    setCouponLoading(false);
    setCouponError(localResult.error);
  };

  // ── Form state ────────────────────────────────────────────────────────────

  const [form, setForm] = useState(() => {
    // Pre-fill phone from logged-in user; try to load saved address
    const phone = userPhone ?? "";
    if (phone) {
      const saved = loadSavedAddress(phone);
      if (saved) return { ...saved, paymentMethod: "Cash on Delivery" };
    }
    return {
      name: "",
      phone,
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      postalCode: "",
      paymentMethod: "Cash on Delivery",
    };
  });

  // When user logs in via the popup, load their saved address
  useEffect(() => {
    if (isLoggedIn && userPhone) {
      const saved = loadSavedAddress(userPhone);
      setForm((prev) => ({
        ...prev,
        phone: userPhone,
        ...(saved ?? {}),
      }));
    }
  }, [isLoggedIn, userPhone]);

  // Load Razorpay script
  useEffect(() => {
    if (document.querySelector('script[src*="razorpay"]')) return;
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.error("Your cart is empty!");
      return;
    }
    const effectivePhone =
      form.phone.trim() || (isLoggedIn && userPhone ? userPhone : "");

    const fullAddress = [
      form.addressLine1,
      form.addressLine2,
      form.city,
      form.state,
      form.postalCode,
    ]
      .filter(Boolean)
      .join(", ");

    // Persist address for next time
    if (isLoggedIn && userPhone) {
      saveAddress(userPhone, {
        name: form.name,
        phone: effectivePhone,
        addressLine1: form.addressLine1,
        addressLine2: form.addressLine2,
        city: form.city,
        state: form.state,
        postalCode: form.postalCode,
      });
    }

    // Razorpay payment
    if (form.paymentMethod === "Razorpay") {
      const rzp = new (
        window as unknown as {
          Razorpay: new (opts: Record<string, unknown>) => { open: () => void };
        }
      ).Razorpay({
        key: "rzp_live_SZSCdhZIeYCulA",
        amount: grandTotal * 100,
        currency: "INR",
        name: "The Pearlfect Store",
        description: "Handmade Beaded Jewellery",
        handler: async (response: { razorpay_payment_id: string }) => {
          const newOrderId = `ORD-${Date.now().toString().slice(-6)}`;
          const trackingId = `TRK-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
          try {
            await placeOrder.mutateAsync({
              customerName: form.name,
              phone: effectivePhone,
              address: fullAddress,
              paymentMethod: "Razorpay",
              items: items.map((i) => ({
                productId: i.product.id,
                productName: i.product.name,
                quantity: BigInt(i.quantity),
                price: i.product.price,
              })),
              totalAmount: grandTotal,
              couponCode: appliedCoupon?.code ?? null,
              discountAmount: discountAmount > 0 ? discountAmount : null,
              razorpayPaymentId: response.razorpay_payment_id,
              localOrderId: newOrderId,
              localTrackingId: trackingId,
            });
            localStorage.setItem(
              "lastOrder",
              JSON.stringify({
                id: newOrderId,
                trackingId,
                customerName: form.name,
                phone: effectivePhone,
                address: fullAddress,
                items: items.map((i) => ({
                  productName: i.product.name,
                  quantity: i.quantity,
                  price: i.product.price,
                })),
                totalAmount: grandTotal,
                deliveryFee,
                discountAmount,
                paymentMethod: "Razorpay",
              }),
            );
            // Broadcast immediately so admin dashboard updates without waiting for poll
            broadcastOrdersUpdate();
            if (appliedCoupon) incrementCouponUsage(appliedCoupon.code);
            clearCart();
            toast.success("Order placed! We'll dispatch your items soon.");
            navigate({ to: "/order-confirmation" });
          } catch {
            toast.error("Failed to place order. Please try again.");
          }
        },
        prefill: {
          name: form.name,
          contact: effectivePhone,
        },
        theme: {
          color: "#b8860b",
        },
        modal: {
          ondismiss: () => {
            toast.error("Payment cancelled.");
          },
        },
      });
      rzp.open();
      return;
    }

    // Cash on Delivery — validate first
    if (!form.name.trim()) {
      toast.error("Please enter your full name.");
      return;
    }
    if (!effectivePhone || !/^\d{10}$/.test(effectivePhone)) {
      toast.error("Please enter a valid 10-digit phone number.");
      return;
    }
    if (!form.addressLine1.trim()) {
      toast.error("Please enter your address.");
      return;
    }
    if (!form.city.trim()) {
      toast.error("Please enter your city.");
      return;
    }
    if (!form.state.trim()) {
      toast.error("Please enter your state.");
      return;
    }
    if (!/^\d{6}$/.test(form.postalCode)) {
      toast.error("Please enter a valid 6-digit PIN code.");
      return;
    }

    const newOrderId = `ORD-${Date.now().toString().slice(-6)}`;
    const trackingId = `TRK-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;

    // Save lastOrder to localStorage BEFORE the async call so it's always available
    // on the confirmation page even if the backend call fails
    localStorage.setItem(
      "lastOrder",
      JSON.stringify({
        id: newOrderId,
        trackingId,
        customerName: form.name,
        phone: effectivePhone,
        address: fullAddress,
        items: items.map((i) => ({
          productName: i.product.name,
          quantity: i.quantity,
          price: i.product.price,
        })),
        totalAmount: grandTotal,
        deliveryFee,
        discountAmount,
        paymentMethod: "Cash on Delivery",
      }),
    );

    try {
      await placeOrder.mutateAsync({
        customerName: form.name,
        phone: effectivePhone,
        address: fullAddress,
        paymentMethod: "Cash on Delivery",
        items: items.map((i) => ({
          productId: i.product.id,
          productName: i.product.name,
          quantity: BigInt(i.quantity),
          price: i.product.price,
        })),
        totalAmount: grandTotal,
        couponCode: appliedCoupon?.code ?? null,
        discountAmount: discountAmount > 0 ? discountAmount : null,
        razorpayPaymentId: null,
        localOrderId: newOrderId,
        localTrackingId: trackingId,
      });
    } catch {
      // Backend sync failed — the order is already saved locally, so we
      // still proceed to the confirmation page rather than blocking the customer.
      // Admin will see the order via localStorage sync.
    }

    // Broadcast immediately after save so admin dashboard reflects the order
    // without waiting for the next poll cycle — works for same-tab too
    broadcastOrdersUpdate();

    if (appliedCoupon) incrementCouponUsage(appliedCoupon.code);
    clearCart();
    toast.success("Order placed! We'll dispatch your items soon.");
    navigate({ to: "/order-confirmation" });
  };

  return (
    <>
      {/* Login Popup — blocks checkout until logged in */}
      {showLoginPopup && (
        <LoginPopup
          onSuccess={() => setShowLoginPopup(false)}
          getOrCreateCode={getOrCreateCode}
          getStoredCode={getStoredCode}
          verifyCode={verifyCode}
          hasCode={hasCode}
          login={login}
        />
      )}

      <main className="min-h-screen">
        <section className="py-12 px-4 sm:px-6 bg-muted/20 text-center">
          <h1 className="font-display text-4xl font-medium text-foreground">
            Checkout
          </h1>
        </section>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
          {items.length === 0 ? (
            <div className="text-center py-20" data-ocid="checkout.empty_state">
              <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h2 className="font-display text-2xl font-medium text-foreground mb-3">
                Your cart is empty
              </h2>
              <p className="font-body text-muted-foreground mb-6">
                Add some beautiful pieces to your cart first.
              </p>
              <Link to="/shop">
                <Button
                  className="rounded-full font-body bg-foreground text-background hover:bg-foreground/90"
                  data-ocid="checkout.primary_button"
                >
                  Shop Collection
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-5 gap-10">
              {/* Cart Summary */}
              <div className="md:col-span-2 order-2 md:order-1">
                <h2 className="font-display text-xl font-medium text-foreground mb-5">
                  Order Summary
                </h2>
                <div className="space-y-4">
                  {items.map((item, i) => (
                    <div
                      key={item.product.id}
                      className="flex gap-3 items-center"
                      data-ocid={`checkout.item.${i + 1}`}
                    >
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                        <img
                          src={
                            item.product.imageUrl?.getDirectURL?.() ??
                            "/assets/images/placeholder.svg"
                          }
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-body text-sm font-medium text-foreground truncate">
                          {item.product.name}
                        </p>
                        <p className="font-body text-xs text-muted-foreground">
                          Qty: {item.quantity}
                        </p>
                        <p className="font-body text-sm font-semibold">
                          ₹
                          {(item.product.price * item.quantity).toLocaleString(
                            "en-IN",
                          )}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.product.id)}
                        className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                        data-ocid={`checkout.delete_button.${i + 1}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <Separator className="my-4" />
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-body text-sm text-muted-foreground">
                      Subtotal
                    </span>
                    <span className="font-body text-sm">
                      ₹{totalAmount.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-body text-sm text-muted-foreground flex items-center gap-1">
                      <Truck className="h-3.5 w-3.5" /> Delivery
                    </span>
                    {deliveryFee === 0 ? (
                      <span className="font-body text-sm text-green-600 font-medium">
                        FREE
                      </span>
                    ) : (
                      <span className="font-body text-sm">₹{deliveryFee}</span>
                    )}
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between items-center text-green-600">
                      <span className="font-body text-sm flex items-center gap-1">
                        🏷️ Coupon ({appliedCoupon?.code})
                      </span>
                      <span className="font-body text-sm font-medium">
                        -₹{discountAmount.toLocaleString("en-IN")}
                      </span>
                    </div>
                  )}
                  {deliveryFee > 0 && (
                    <p className="font-body text-xs text-muted-foreground">
                      Order above ₹499 for free delivery
                    </p>
                  )}
                  <Separator className="my-2" />
                  <div className="flex justify-between items-center">
                    <span className="font-body font-medium text-foreground">
                      Total
                    </span>
                    <span className="font-display text-xl font-semibold text-foreground">
                      ₹{grandTotal.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Checkout Form */}
              <div className="md:col-span-3 order-1 md:order-2">
                <h2 className="font-display text-xl font-medium text-foreground mb-5">
                  Delivery Details
                </h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <Label
                      htmlFor="name"
                      className="font-body text-sm mb-1.5 block"
                    >
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      required
                      value={form.name}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, name: e.target.value }))
                      }
                      placeholder="Your full name"
                      className="rounded-xl font-body"
                      style={{
                        borderColor: "#a5d6a7",
                        borderWidth: "2px",
                        boxShadow: "0 0 0 0px #a5d6a7",
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.boxShadow =
                          "0 0 0 3px rgba(165,214,167,0.35)";
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.boxShadow = "0 0 0 0px #a5d6a7";
                      }}
                      data-ocid="checkout.input"
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="phone"
                      className="font-body text-sm mb-1.5 block"
                    >
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      required
                      type="tel"
                      value={form.phone}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, phone: e.target.value }))
                      }
                      placeholder="+91 XXXXX XXXXX"
                      className="rounded-xl font-body"
                      style={{
                        borderColor: "#a5d6a7",
                        borderWidth: "2px",
                        boxShadow: "0 0 0 0px #a5d6a7",
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.boxShadow =
                          "0 0 0 3px rgba(165,214,167,0.35)";
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.boxShadow = "0 0 0 0px #a5d6a7";
                      }}
                      data-ocid="checkout.input"
                    />
                  </div>

                  {/* Address sub-fields */}
                  <div
                    style={{
                      border: "2px solid #a5d6a7",
                      borderRadius: "14px",
                      background: "rgba(165,214,167,0.06)",
                      padding: "18px 16px 14px",
                    }}
                  >
                    <Label className="font-body text-sm mb-2 block font-medium">
                      Delivery Address
                    </Label>
                    <div className="space-y-3">
                      <div>
                        <Label
                          htmlFor="addr1"
                          className="font-body text-xs text-muted-foreground mb-1 block"
                        >
                          Address Line 1 – House/Flat number, street name
                        </Label>
                        <Input
                          id="addr1"
                          required
                          value={form.addressLine1}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              addressLine1: e.target.value,
                            }))
                          }
                          placeholder="House/Flat no., Street name"
                          className="rounded-xl font-body"
                          style={{
                            borderColor: "#a5d6a7",
                            borderWidth: "2px",
                            boxShadow: "0 0 0 0px #a5d6a7",
                          }}
                          onFocus={(e) => {
                            e.currentTarget.style.boxShadow =
                              "0 0 0 3px rgba(165,214,167,0.35)";
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.boxShadow =
                              "0 0 0 0px #a5d6a7";
                          }}
                          data-ocid="checkout.input"
                        />
                      </div>
                      <div>
                        <Label
                          htmlFor="addr2"
                          className="font-body text-xs text-muted-foreground mb-1 block"
                        >
                          Address Line 2 – Apartment, building, suite, landmark
                        </Label>
                        <Input
                          id="addr2"
                          value={form.addressLine2}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              addressLine2: e.target.value,
                            }))
                          }
                          placeholder="Apartment, building, landmark (optional)"
                          className="rounded-xl font-body"
                          style={{
                            borderColor: "#a5d6a7",
                            borderWidth: "2px",
                            boxShadow: "0 0 0 0px #a5d6a7",
                          }}
                          onFocus={(e) => {
                            e.currentTarget.style.boxShadow =
                              "0 0 0 3px rgba(165,214,167,0.35)";
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.boxShadow =
                              "0 0 0 0px #a5d6a7";
                          }}
                          data-ocid="checkout.input"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label
                            htmlFor="city"
                            className="font-body text-xs text-muted-foreground mb-1 block"
                          >
                            City / Town
                          </Label>
                          <Input
                            id="city"
                            required
                            value={form.city}
                            onChange={(e) =>
                              setForm((f) => ({ ...f, city: e.target.value }))
                            }
                            placeholder="City"
                            className="rounded-xl font-body"
                            style={{
                              borderColor: "#a5d6a7",
                              borderWidth: "2px",
                              boxShadow: "0 0 0 0px #a5d6a7",
                            }}
                            onFocus={(e) => {
                              e.currentTarget.style.boxShadow =
                                "0 0 0 3px rgba(165,214,167,0.35)";
                            }}
                            onBlur={(e) => {
                              e.currentTarget.style.boxShadow =
                                "0 0 0 0px #a5d6a7";
                            }}
                            data-ocid="checkout.input"
                          />
                        </div>
                        <div>
                          <Label
                            htmlFor="state"
                            className="font-body text-xs text-muted-foreground mb-1 block"
                          >
                            State
                          </Label>
                          <Input
                            id="state"
                            required
                            value={form.state}
                            onChange={(e) =>
                              setForm((f) => ({ ...f, state: e.target.value }))
                            }
                            placeholder="State"
                            className="rounded-xl font-body"
                            style={{
                              borderColor: "#a5d6a7",
                              borderWidth: "2px",
                              boxShadow: "0 0 0 0px #a5d6a7",
                            }}
                            onFocus={(e) => {
                              e.currentTarget.style.boxShadow =
                                "0 0 0 3px rgba(165,214,167,0.35)";
                            }}
                            onBlur={(e) => {
                              e.currentTarget.style.boxShadow =
                                "0 0 0 0px #a5d6a7";
                            }}
                            data-ocid="checkout.input"
                          />
                        </div>
                      </div>
                      <div>
                        <Label
                          htmlFor="postal"
                          className="font-body text-xs text-muted-foreground mb-1 block"
                        >
                          Postal Code / ZIP Code
                        </Label>
                        <Input
                          id="postal"
                          required
                          value={form.postalCode}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              postalCode: e.target.value,
                            }))
                          }
                          placeholder="PIN code"
                          className="rounded-xl font-body"
                          style={{
                            borderColor: "#a5d6a7",
                            borderWidth: "2px",
                            boxShadow: "0 0 0 0px #a5d6a7",
                          }}
                          onFocus={(e) => {
                            e.currentTarget.style.boxShadow =
                              "0 0 0 3px rgba(165,214,167,0.35)";
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.boxShadow =
                              "0 0 0 0px #a5d6a7";
                          }}
                          data-ocid="checkout.input"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Coupon Code */}
                  <div>
                    <Label className="font-body text-sm mb-2 block">
                      Discount Coupon
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        value={couponCode}
                        onChange={(e) => {
                          setCouponCode(e.target.value.toUpperCase());
                          setCouponError("");
                          if (appliedCoupon) setAppliedCoupon(null);
                        }}
                        placeholder="Enter coupon code"
                        className="rounded-xl font-body flex-1"
                        data-ocid="checkout.input"
                        disabled={!!appliedCoupon}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleApplyCoupon}
                        disabled={couponLoading || !!appliedCoupon}
                        className="rounded-xl font-body flex-shrink-0"
                        data-ocid="checkout.secondary_button"
                      >
                        {couponLoading
                          ? "..."
                          : appliedCoupon
                            ? "✓ Applied"
                            : "Apply"}
                      </Button>
                    </div>
                    {couponError && (
                      <p
                        className="font-body text-xs text-destructive mt-1"
                        data-ocid="checkout.error_state"
                      >
                        {couponError}
                      </p>
                    )}
                    {appliedCoupon && (
                      <p
                        className="font-body text-xs text-green-600 mt-1"
                        data-ocid="checkout.success_state"
                      >
                        🎉 {appliedCoupon.discountPercent}% discount applied!
                      </p>
                    )}
                  </div>

                  <div>
                    <Label className="font-body text-sm mb-3 block">
                      Payment Method
                    </Label>
                    <div className="space-y-2" data-ocid="checkout.radio">
                      {[
                        { value: "Razorpay", label: "Razorpay" },
                        {
                          value: "Cash on Delivery",
                          label: "Cash on Delivery",
                        },
                      ].map((method) => {
                        const isSelected = form.paymentMethod === method.value;
                        return (
                          <button
                            key={method.value}
                            type="button"
                            onClick={() =>
                              setForm((f) => ({
                                ...f,
                                paymentMethod: method.value,
                              }))
                            }
                            className="w-full flex items-center gap-3 p-3 border-2 rounded-xl cursor-pointer transition-all text-left"
                            style={{
                              borderColor: isSelected ? "#a5d6a7" : "#e2e8f0",
                              backgroundColor: isSelected
                                ? "rgba(165,214,167,0.08)"
                                : "transparent",
                            }}
                          >
                            {/* Radio dot */}
                            <span
                              className="flex-shrink-0 flex items-center justify-center rounded-full transition-all"
                              style={{
                                width: 22,
                                height: 22,
                                border: isSelected
                                  ? "2px solid #a5d6a7"
                                  : "2px solid #9ca3af",
                                backgroundColor: "transparent",
                              }}
                            >
                              {isSelected && (
                                <span
                                  className="rounded-full"
                                  style={{
                                    width: 12,
                                    height: 12,
                                    backgroundColor: "#a5d6a7",
                                  }}
                                />
                              )}
                            </span>
                            {/* Label */}
                            <span className="font-body text-sm text-foreground flex items-center gap-2">
                              {method.value === "Razorpay" && (
                                <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-[#3395FF] text-white text-[10px] font-bold flex-shrink-0">
                                  R
                                </span>
                              )}
                              {method.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Razorpay Info Panel */}
                  {form.paymentMethod === "Razorpay" && (
                    <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-[#3395FF] flex items-center justify-center flex-shrink-0 shadow-sm">
                          <span className="text-white font-bold text-lg">
                            R
                          </span>
                        </div>
                        <div>
                          <p className="font-display text-base font-semibold text-blue-900">
                            Pay with Razorpay
                          </p>
                          <p className="font-body text-xs text-blue-600">
                            Secure &amp; encrypted payment
                          </p>
                        </div>
                      </div>
                      <p className="font-body text-sm text-blue-800 mb-3">
                        You'll be redirected to Razorpay's secure checkout to
                        complete your payment.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {["UPI", "Cards", "Net Banking", "Wallets"].map((m) => (
                          <span
                            key={m}
                            className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-body rounded-full border border-blue-200"
                          >
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Cash on Delivery Info */}
                  {form.paymentMethod === "Cash on Delivery" && (
                    <div className="rounded-2xl border border-border bg-muted/30 p-5">
                      <p className="font-body text-sm text-foreground">
                        Pay with cash when your order arrives. Our delivery
                        partner will collect the payment.
                      </p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full rounded-full font-body bg-foreground text-background hover:bg-foreground/90 py-3"
                    disabled={placeOrder.isPending}
                    data-ocid="checkout.submit_button"
                  >
                    {placeOrder.isPending
                      ? "Placing Order..."
                      : form.paymentMethod === "Razorpay"
                        ? `Pay ₹${grandTotal.toLocaleString("en-IN")} with Razorpay`
                        : `Place Order · ₹${grandTotal.toLocaleString("en-IN")}`}
                  </Button>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
