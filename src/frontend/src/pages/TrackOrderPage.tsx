import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle,
  Clock,
  MessageSquare,
  Package,
  PackageCheck,
  Truck,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useGetOrderByTrackingId } from "../hooks/useQueries";
import type { ExtendedOrder } from "../hooks/useQueries";

// The 4 admin-set statuses + standard ones
const STATUS_LABEL: Record<string, string> = {
  pending: "Order Placed",
  confirmed: "Order Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
  payment_confirmed: "Payment Confirmed",
  awaiting_shipment: "Awaiting Shipment",
};

const STATUS_COLOR: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  confirmed: "bg-blue-100 text-blue-700 border-blue-200",
  processing: "bg-blue-100 text-blue-700 border-blue-200",
  awaiting_shipment: "bg-amber-100 text-amber-700 border-amber-200",
  shipped: "bg-purple-100 text-purple-700 border-purple-200",
  out_for_delivery: "bg-orange-100 text-orange-700 border-orange-200",
  delivered: "bg-green-100 text-green-700 border-green-200",
  cancelled: "bg-red-100 text-red-700 border-red-200",
  payment_confirmed: "bg-green-100 text-green-700 border-green-200",
};

const PROGRESS_STEPS = [
  { key: "processing", label: "Processing", icon: Package },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "out_for_delivery", label: "Out for Delivery", icon: Truck },
  { key: "delivered", label: "Delivered", icon: CheckCircle },
];

const STATUS_STEP_MAP: Record<string, number> = {
  pending: 0,
  confirmed: 0,
  payment_confirmed: 0,
  awaiting_shipment: 0,
  processing: 1,
  shipped: 2,
  out_for_delivery: 3,
  delivered: 4,
  cancelled: -1,
};

function ProgressTracker({ status }: { status: string }) {
  const currentStep = STATUS_STEP_MAP[status] ?? 0;
  if (currentStep === -1) return null;

  return (
    <div className="py-4">
      <div className="flex items-center justify-between relative">
        {/* connecting line */}
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-border/50 z-0" />
        <div
          className="absolute top-4 left-0 h-0.5 bg-primary z-0 transition-all duration-500"
          style={{
            width: `${Math.max(0, ((currentStep - 1) / (PROGRESS_STEPS.length - 1)) * 100)}%`,
          }}
        />
        {PROGRESS_STEPS.map((step, i) => {
          const stepNum = i + 1;
          const done = currentStep >= stepNum;
          const active = currentStep === stepNum;
          const Icon = step.icon;
          return (
            <div
              key={step.key}
              className="relative z-10 flex flex-col items-center gap-1.5 flex-1"
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  done
                    ? "bg-primary border-primary text-primary-foreground"
                    : active
                      ? "bg-primary/20 border-primary text-primary"
                      : "bg-background border-border/50 text-muted-foreground"
                }`}
              >
                {done && stepNum < currentStep ? (
                  <PackageCheck className="h-4 w-4" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
              </div>
              <span
                className={`font-body text-[10px] text-center leading-tight max-w-[60px] ${
                  done ? "text-foreground font-medium" : "text-muted-foreground"
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function OrderResult({ order }: { order: ExtendedOrder }) {
  const formatDate = (ts: number) =>
    new Date(ts).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  const formatDateTime = (ts: number) =>
    new Date(ts).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const statusKey = order.status;
  const statusLabel = STATUS_LABEL[statusKey] ?? statusKey.split("_").join(" ");
  const statusColor =
    STATUS_COLOR[statusKey] ?? "bg-muted text-muted-foreground border-border";

  return (
    <div className="mt-8 space-y-4" data-ocid="track.item.1">
      {/* Main card */}
      <div className="bg-card rounded-2xl shadow-soft border border-border/30 p-6 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="font-display text-base font-semibold text-foreground">
              Order #{order.id.slice(-8).toUpperCase()}
            </p>
            <p className="font-body text-sm text-muted-foreground">
              Placed on {formatDate(order.createdAt)}
            </p>
          </div>
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-body font-semibold border capitalize ${statusColor}`}
          >
            {statusLabel}
          </span>
        </div>

        {/* Tracking ID chip */}
        <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 rounded-xl px-4 py-2.5">
          <Truck className="h-4 w-4 text-rose-500 flex-shrink-0" />
          <div>
            <p className="font-body text-[10px] text-rose-500 uppercase tracking-widest font-semibold">
              Tracking ID
            </p>
            <p className="font-mono text-sm font-bold text-rose-700">
              {order.trackingNumber}
            </p>
          </div>
        </div>

        {/* Progress tracker */}
        <ProgressTracker status={order.status} />

        {/* Last updated */}
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Clock className="h-3.5 w-3.5 flex-shrink-0" />
          <span className="font-body text-xs">
            Last updated:{" "}
            <span className="font-medium text-foreground">
              {formatDateTime(order.lastUpdatedAt)}
            </span>
          </span>
        </div>

        {/* Admin message */}
        {order.adminMessage && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start gap-2.5">
            <MessageSquare className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-body text-xs font-semibold text-amber-700 mb-0.5 uppercase tracking-widest">
                Update from The Pearlfect Store
              </p>
              <p className="font-body text-sm text-amber-800 leading-relaxed">
                {order.adminMessage}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Order summary */}
      <div className="bg-card rounded-2xl shadow-soft border border-border/30 p-5">
        <p className="font-display text-sm font-semibold text-foreground mb-3">
          Order Summary
        </p>
        <div className="space-y-1.5">
          {order.items.map((item) => (
            <div
              key={item.productId}
              className="flex justify-between font-body text-sm"
            >
              <span className="text-foreground">
                {item.productName} × {Number(item.quantity)}
              </span>
              <span className="text-muted-foreground">
                ₹{(item.price * Number(item.quantity)).toLocaleString("en-IN")}
              </span>
            </div>
          ))}
          <div className="flex justify-between font-body text-sm font-semibold pt-2 border-t border-border/50 mt-1">
            <span>Total</span>
            <span>₹{order.totalAmount.toLocaleString("en-IN")}</span>
          </div>
        </div>

        {/* Delivery address */}
        <div className="mt-4 pt-4 border-t border-border/50">
          <p className="font-body text-xs text-muted-foreground uppercase tracking-widest mb-1">
            Delivery Address
          </p>
          <p className="font-body text-sm text-foreground">{order.address}</p>
        </div>
      </div>
    </div>
  );
}

export function TrackOrderPage() {
  const queryClient = useQueryClient();
  const [trackingId, setTrackingId] = useState("");
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  const { data: order, isLoading } = useGetOrderByTrackingId(submittedId);

  // Auto-fill and auto-submit from URL query param ?id=...
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    if (id) {
      setTrackingId(id);
      setSubmittedId(id);
    }
  }, []);

  // Storage event listener: reactively refetch when admin updates localStorage in another tab
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === "pearlfect_local_orders" && submittedId) {
        queryClient.invalidateQueries({
          queryKey: ["orderByTrackingId", submittedId],
        });
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, [submittedId, queryClient]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingId.trim()) setSubmittedId(trackingId.trim());
  };

  return (
    <main className="min-h-screen">
      <section className="py-12 px-4 sm:px-6 bg-muted/20 text-center">
        <Truck className="h-10 w-10 mx-auto text-primary mb-3" />
        <h1 className="font-display text-4xl font-medium text-foreground">
          Track Your Order
        </h1>
        <p className="font-body text-muted-foreground mt-2">
          Enter your Tracking ID to check your order status.
        </p>
      </section>

      <div className="max-w-xl mx-auto px-4 sm:px-6 py-10">
        <form
          onSubmit={handleSubmit}
          className="bg-card rounded-2xl shadow-soft border border-border/30 p-8 space-y-5"
        >
          <div>
            <Label
              htmlFor="trackingId"
              className="font-body text-sm mb-1.5 block"
            >
              Tracking ID
            </Label>
            <Input
              id="trackingId"
              type="text"
              required
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
              placeholder="e.g. TRK-123456"
              className="rounded-xl font-body"
              data-ocid="track.input"
            />
          </div>
          <Button
            type="submit"
            className="w-full rounded-xl font-body bg-foreground text-background hover:bg-foreground/90"
            disabled={isLoading}
            data-ocid="track.submit_button"
          >
            {isLoading ? "Searching..." : "Track Order"}
          </Button>
        </form>

        {submittedId && !isLoading && !order && (
          <div className="mt-6 text-center" data-ocid="track.empty_state">
            <Package className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="font-body text-muted-foreground">
              No order found for this Tracking ID.
            </p>
            <p className="font-body text-xs text-muted-foreground mt-1">
              Make sure you entered the exact Tracking ID from your confirmation
              page.
            </p>
          </div>
        )}

        {order && <OrderResult order={order} />}
      </div>
    </main>
  );
}
