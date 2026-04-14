import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "@tanstack/react-router";
import {
  Check,
  CheckCircle,
  Copy,
  CreditCard,
  MapPin,
  Package,
  Printer,
  Truck,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface OrderItem {
  productName: string;
  quantity: number;
  price: number;
}

interface LastOrder {
  id: string;
  trackingId: string;
  customerName: string;
  phone: string;
  address: string;
  items: OrderItem[];
  totalAmount: number;
  deliveryFee: number;
  discountAmount: number;
  paymentMethod: string;
}

function addBusinessDays(date: Date, days: number): Date {
  const result = new Date(date);
  let added = 0;
  while (added < days) {
    result.setDate(result.getDate() + 1);
    const day = result.getDay();
    if (day !== 0 && day !== 6) added++;
  }
  return result;
}

function formatDeliveryDate(date: Date): string {
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

export function OrderConfirmationPage() {
  const navigate = useNavigate();
  const [order, setOrder] = useState<LastOrder | null>(null);
  const [copiedOrderId, setCopiedOrderId] = useState(false);
  const [copiedTrackingId, setCopiedTrackingId] = useState(false);
  const toastShown = useRef(false);

  useEffect(() => {
    const raw = localStorage.getItem("lastOrder");
    if (!raw) {
      navigate({ to: "/shop" });
      return;
    }
    try {
      const parsed: LastOrder = JSON.parse(raw);
      setOrder(parsed);
      if (!toastShown.current) {
        toastShown.current = true;
        setTimeout(() => {
          toast.success(`Order confirmed! Your Order ID is ${parsed.id}`);
        }, 300);
      }
    } catch {
      navigate({ to: "/shop" });
    }
    return () => {
      localStorage.removeItem("lastOrder");
    };
  }, [navigate]);

  if (!order) return null;

  const today = new Date();
  const minDelivery = addBusinessDays(today, 4);
  const maxDelivery = addBusinessDays(today, 6);
  const deliveryRange = `${formatDeliveryDate(minDelivery)} – ${formatDeliveryDate(maxDelivery)} ${maxDelivery.getFullYear()}`;

  const subtotal = order.items.reduce(
    (s, item) => s + item.price * item.quantity,
    0,
  );
  const isCOD = order.paymentMethod === "Cash on Delivery";
  const orderDate = today.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const copyToClipboard = (text: string, type: "order" | "tracking") => {
    navigator.clipboard.writeText(text).then(() => {
      if (type === "order") {
        setCopiedOrderId(true);
        setTimeout(() => setCopiedOrderId(false), 2000);
      } else {
        setCopiedTrackingId(true);
        setTimeout(() => setCopiedTrackingId(false), 2000);
      }
    });
  };

  const handleTrackOrder = () => {
    navigate({ to: `/track-order?id=${order.trackingId}` } as any);
  };

  return (
    <>
      {/* Print styles injected via a style tag */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          body { background: white !important; }
        }
        .print-only { display: none; }
      `}</style>

      {/* Screen version */}
      <main
        className="min-h-screen bg-background print:hidden"
        data-ocid="order_confirmation.page"
      >
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 space-y-6">
          {/* Hero */}
          <div className="text-center space-y-5">
            <div className="relative w-24 h-24 mx-auto">
              <div className="w-24 h-24 rounded-full bg-green-50 border-4 border-green-100 flex items-center justify-center">
                <CheckCircle
                  className="h-12 w-12 text-green-500"
                  strokeWidth={1.5}
                />
              </div>
              <span className="absolute -top-1 -right-1 text-xl">✨</span>
            </div>
            <div>
              <h1 className="font-display text-3xl sm:text-4xl font-semibold text-foreground mb-2">
                Your order has been placed successfully!
              </h1>
              <p className="font-body text-muted-foreground">
                Thank you,{" "}
                <span className="font-medium text-foreground">
                  {order.customerName}
                </span>
                . Your handcrafted pieces are being lovingly prepared just for
                you.
              </p>
            </div>

            {/* ID Chips */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              {/* Order ID chip */}
              <div className="flex items-center gap-2 bg-muted/60 border border-border/60 rounded-full px-4 py-2 shadow-sm">
                <span className="font-body text-xs text-muted-foreground uppercase tracking-wide">
                  Order ID
                </span>
                <span className="font-mono text-sm font-semibold text-foreground">
                  {order.id}
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(order.id, "order")}
                  className="ml-1 p-1 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                  title="Copy Order ID"
                  data-ocid="order_confirmation.secondary_button"
                >
                  {copiedOrderId ? (
                    <Check className="h-3.5 w-3.5 text-green-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>

              {/* Tracking ID chip — rose/pink to stand out */}
              <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 rounded-full px-4 py-2 shadow-sm">
                <span className="font-body text-xs text-rose-500 uppercase tracking-wide">
                  Tracking ID
                </span>
                <span className="font-mono text-sm font-semibold text-rose-700">
                  {order.trackingId || "—"}
                </span>
                {order.trackingId && (
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(order.trackingId, "tracking")
                    }
                    className="ml-1 p-1 rounded-full hover:bg-rose-100 transition-colors text-rose-400 hover:text-rose-600"
                    title="Copy Tracking ID"
                    data-ocid="order_confirmation.secondary_button"
                  >
                    {copiedTrackingId ? (
                      <Check className="h-3.5 w-3.5 text-green-500" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                )}
              </div>
            </div>

            {isCOD && (
              <div>
                <span className="bg-amber-100 text-amber-700 border border-amber-200 rounded-full px-3 py-1 text-sm font-body inline-flex items-center gap-1.5">
                  <Truck className="h-3.5 w-3.5" />
                  Payment Status: Pending (COD) — Pay on delivery
                </span>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div
            className="bg-card rounded-2xl shadow-soft border border-border/50 p-5 space-y-3"
            data-ocid="order_confirmation.card"
          >
            <div className="flex items-center gap-2 mb-1">
              <Package className="h-4 w-4 text-muted-foreground" />
              <h2 className="font-display text-base font-semibold text-foreground">
                Order Summary
              </h2>
            </div>
            <Separator />
            <div className="space-y-2">
              {order.items.map((item, i) => (
                <div
                  key={`${item.productName}-${i}`}
                  className="flex justify-between items-center font-body text-sm"
                  data-ocid={`order_confirmation.item.${i + 1}`}
                >
                  <span className="text-foreground">
                    {item.productName} × {item.quantity}
                  </span>
                  <span className="text-muted-foreground">
                    ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
            </div>
            <Separator />
            <div className="space-y-1.5">
              <div className="flex justify-between font-body text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>₹{subtotal.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between font-body text-sm">
                <span className="text-muted-foreground">Delivery</span>
                {order.deliveryFee === 0 ? (
                  <span className="text-green-600 font-medium">Free</span>
                ) : (
                  <span>₹{order.deliveryFee}</span>
                )}
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between font-body text-sm text-green-600">
                  <span>Discount</span>
                  <span>-₹{order.discountAmount.toLocaleString("en-IN")}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-body text-base font-bold">
                <span className="text-foreground">Total</span>
                <span className="text-foreground">
                  ₹{order.totalAmount.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>

          {/* Payment & Delivery */}
          <div
            className="bg-card rounded-2xl shadow-soft border border-border/50 p-5 space-y-4"
            data-ocid="order_confirmation.card"
          >
            <h2 className="font-display text-base font-semibold text-foreground">
              Payment &amp; Delivery
            </h2>
            <Separator />

            {/* Payment Method */}
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="font-body text-xs text-muted-foreground mb-0.5">
                  Payment Method
                </p>
                <p className="font-body text-sm font-medium text-foreground">
                  {isCOD ? "Cash on Delivery" : "Online Payment (Razorpay)"}
                </p>
                {isCOD && (
                  <p className="font-body text-xs text-amber-600 mt-0.5">
                    Pay when your order arrives at your doorstep
                  </p>
                )}
              </div>
            </div>

            {/* Delivery Address */}
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="font-body text-xs text-muted-foreground mb-0.5">
                  Delivering to
                </p>
                <p className="font-body text-sm font-medium text-foreground">
                  {order.address}
                </p>
              </div>
            </div>

            {/* Estimated Delivery */}
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                <Truck className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="font-body text-xs text-muted-foreground mb-0.5">
                  Estimated Delivery
                </p>
                <p className="font-body text-sm font-medium text-foreground">
                  Est. {deliveryRange}
                </p>
                <p className="font-body text-xs text-muted-foreground mt-0.5">
                  4–6 business days from order date
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div
            className="flex flex-col sm:flex-row gap-3 no-print"
            data-ocid="order_confirmation.panel"
          >
            <Button
              variant="outline"
              className="flex-1 rounded-full font-body border-foreground/30 hover:bg-muted gap-2"
              onClick={handleTrackOrder}
              data-ocid="order_confirmation.secondary_button"
            >
              <Truck className="h-4 w-4" />
              Track Order
            </Button>
            <Button
              variant="outline"
              className="flex-1 rounded-full font-body border-foreground/30 hover:bg-muted gap-2"
              onClick={() => window.print()}
              data-ocid="order_confirmation.secondary_button"
            >
              <Printer className="h-4 w-4" />
              Print Receipt
            </Button>
            <Button
              className="flex-1 rounded-full font-body bg-foreground text-background hover:bg-foreground/90"
              onClick={() => navigate({ to: "/shop" })}
              data-ocid="order_confirmation.primary_button"
            >
              Continue Shopping
            </Button>
          </div>
        </div>
      </main>

      {/* Print-only receipt */}
      <div className="print-only p-10 max-w-2xl mx-auto font-body">
        <div className="text-center mb-8 border-b border-gray-200 pb-6">
          <h1 className="text-2xl font-semibold tracking-wide">
            The Pearlfect Store
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Handmade Beaded Jewellery Made With Love
          </p>
          <p className="text-xs text-gray-400 mt-1">
            thepearlfectstore@gmail.com · @the.pearlfect.store
          </p>
        </div>

        <h2 className="text-lg font-semibold text-center mb-1">
          ORDER RECEIPT
        </h2>
        <p className="text-center text-sm text-gray-500 mb-6">{orderDate}</p>

        <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
              Order ID
            </p>
            <p className="font-mono font-semibold">{order.id}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
              Tracking ID
            </p>
            <p className="font-mono font-semibold">{order.trackingId || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
              Customer
            </p>
            <p className="font-semibold">{order.customerName}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
              Phone
            </p>
            <p>{order.phone}</p>
          </div>
          <div className="col-span-2">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
              Delivery Address
            </p>
            <p>{order.address}</p>
          </div>
        </div>

        <table className="w-full text-sm border-collapse mb-4">
          <thead>
            <tr className="border-b border-gray-300">
              <th className="text-left py-2 font-semibold">Item</th>
              <th className="text-center py-2 font-semibold">Qty</th>
              <th className="text-right py-2 font-semibold">Price</th>
              <th className="text-right py-2 font-semibold">Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.productName} className="border-b border-gray-100">
                <td className="py-2">{item.productName}</td>
                <td className="py-2 text-center">{item.quantity}</td>
                <td className="py-2 text-right">
                  ₹{item.price.toLocaleString("en-IN")}
                </td>
                <td className="py-2 text-right">
                  ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex flex-col items-end text-sm space-y-1 mb-6">
          <div className="flex justify-between w-48">
            <span className="text-gray-500">Subtotal</span>
            <span>₹{subtotal.toLocaleString("en-IN")}</span>
          </div>
          <div className="flex justify-between w-48">
            <span className="text-gray-500">Delivery</span>
            <span>
              {order.deliveryFee === 0 ? "Free" : `₹${order.deliveryFee}`}
            </span>
          </div>
          {order.discountAmount > 0 && (
            <div className="flex justify-between w-48">
              <span className="text-gray-500">Discount</span>
              <span>-₹{order.discountAmount.toLocaleString("en-IN")}</span>
            </div>
          )}
          <div className="flex justify-between w-48 font-bold border-t border-gray-300 pt-1 mt-1">
            <span>Total</span>
            <span>₹{order.totalAmount.toLocaleString("en-IN")}</span>
          </div>
        </div>

        <div className="text-sm mb-6">
          <p>
            <span className="text-gray-500">Payment Method: </span>
            {order.paymentMethod}
          </p>
          <p>
            <span className="text-gray-500">Estimated Delivery: </span>Est.{" "}
            {deliveryRange}
          </p>
        </div>

        <div className="text-center border-t border-gray-200 pt-6 text-sm text-gray-500">
          <p className="font-semibold text-gray-700 mb-1">
            Thank you for your order! 🌸
          </p>
          <p>We hope you love your handcrafted jewellery.</p>
          <p className="mt-1">For support: thepearlfectstore@gmail.com</p>
        </div>
      </div>
    </>
  );
}
