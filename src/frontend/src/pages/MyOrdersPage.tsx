import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ChevronDown,
  ChevronUp,
  ClipboardCopy,
  Package,
  ShoppingBag,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useUserAuth } from "../context/UserAuthContext";
import {
  type ExtendedOrder,
  useCancelOrder,
  useGetOrderByPhone,
} from "../hooks/useQueries";

const ORDERS_LOCAL_KEY = "pearlfect_local_orders";

// ─── Status helpers ────────────────────────────────────────────────────────────
const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  processing: "Processing",
  awaiting_shipment: "Awaiting Shipment",
  shipped: "Shipped",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const STATUS_BADGE_CLASS: Record<string, string> = {
  pending: "bg-muted text-foreground border border-border",
  confirmed: "bg-blue-50 text-blue-700 border border-blue-200",
  processing: "bg-blue-50 text-blue-700 border border-blue-200",
  awaiting_shipment: "bg-amber-50 text-amber-700 border border-amber-200",
  shipped: "bg-amber-50 text-amber-700 border border-amber-200",
  out_for_delivery: "bg-orange-50 text-orange-700 border border-orange-200",
  delivered: "bg-green-50 text-green-700 border border-green-200",
  cancelled: "bg-red-50 text-red-500 border border-red-200",
};

const CANCELLABLE_STATUSES = new Set([
  "pending",
  "confirmed",
  "processing",
  "awaiting_shipment",
]);

function readLocalOrders(): ExtendedOrder[] {
  try {
    const raw = localStorage.getItem(ORDERS_LOCAL_KEY);
    if (!raw) return [];
    const orders = JSON.parse(raw) as Array<{
      id: string;
      customerName: string;
      phone: string;
      address: string;
      paymentMethod: string;
      items: Array<{
        productId: string;
        productName: string;
        quantity: number;
        price: number;
      }>;
      totalAmount: number;
      status: string;
      trackingNumber?: string | null;
      couponCode?: string | null;
      discountAmount?: number | null;
      razorpayPaymentId?: string | null;
      createdAt: number;
      lastUpdatedAt?: number;
      adminMessage?: string;
      updateHistory?: Array<{
        id: string;
        status: string;
        message: string;
        timestamp: number;
      }>;
    }>;
    return orders.map((o) => ({
      id: o.id,
      customerName: o.customerName,
      phone: o.phone,
      address: o.address,
      paymentMethod: o.paymentMethod,
      items: o.items,
      totalAmount: o.totalAmount,
      status: o.status,
      trackingNumber: o.trackingNumber ?? null,
      couponCode: o.couponCode ?? null,
      discountAmount: o.discountAmount ?? null,
      razorpayPaymentId: o.razorpayPaymentId ?? null,
      createdAt: o.createdAt,
      lastUpdatedAt: o.lastUpdatedAt ?? o.createdAt,
      adminMessage: o.adminMessage ?? "",
      updateHistory: o.updateHistory ?? [],
    }));
  } catch {
    return [];
  }
}

// ─── Order Card ───────────────────────────────────────────────────────────────
function OrderCard({
  order,
  onCancel,
}: {
  order: ExtendedOrder;
  onCancel: (order: ExtendedOrder) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() =>
      toast.success(`${label} copied!`, {
        style: { background: "#fce4ec", color: "#000" },
      }),
    );
  };

  const statusKey = order.status.toLowerCase().replace(/ /g, "_");
  const badgeClass =
    STATUS_BADGE_CLASS[statusKey] ??
    "bg-muted text-foreground border border-border";
  const statusLabel = STATUS_LABELS[statusKey] ?? order.status;
  const canCancel = CANCELLABLE_STATUSES.has(statusKey);

  const orderDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const totalItems = order.items.reduce(
    (sum, i) => sum + Number(i.quantity),
    0,
  );

  return (
    <div
      className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden"
      data-ocid={`my-orders.order_card.${order.id}`}
    >
      {/* Card Header */}
      <div className="p-5 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-secondary/40 flex items-center justify-center flex-shrink-0">
            <Package className="h-5 w-5 text-foreground/60" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-display text-sm font-semibold text-foreground">
                {order.id}
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(order.id, "Order ID")}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Copy order ID"
              >
                <ClipboardCopy className="h-3.5 w-3.5" />
              </button>
            </div>
            <p className="font-body text-xs text-muted-foreground">
              {orderDate} · {totalItems} item{totalItems !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-body font-medium ${badgeClass}`}
          >
            {statusLabel}
          </span>
          <span className="font-display text-base font-semibold text-foreground">
            ₹{order.totalAmount.toLocaleString("en-IN")}
          </span>
        </div>
      </div>

      {/* Quick preview — product names */}
      <div className="px-5 pb-3">
        <p className="font-body text-xs text-muted-foreground truncate">
          {order.items
            .map((i) => `${i.productName} ×${i.quantity}`)
            .join(" · ")}
        </p>
      </div>

      {/* Action Bar */}
      <div className="px-5 pb-4 flex items-center gap-2 flex-wrap">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setExpanded((v) => !v)}
          className="rounded-full font-body text-xs gap-1"
          data-ocid={`my-orders.view_details_button.${order.id}`}
        >
          {expanded ? (
            <>
              Hide Details <ChevronUp className="h-3.5 w-3.5" />
            </>
          ) : (
            <>
              View Details <ChevronDown className="h-3.5 w-3.5" />
            </>
          )}
        </Button>

        {canCancel && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onCancel(order)}
            className="rounded-full font-body text-xs text-destructive border-destructive/40 hover:bg-destructive/5"
            data-ocid={`my-orders.cancel_button.${order.id}`}
          >
            Cancel Order
          </Button>
        )}
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div
          className="border-t border-border bg-muted/20 px-5 py-4 space-y-4"
          data-ocid={`my-orders.order_details.${order.id}`}
        >
          {/* Items */}
          <div>
            <h4 className="font-body text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Items
            </h4>
            <div className="space-y-1.5">
              {order.items.map((item, idx) => (
                <div
                  key={`${item.productId}-${idx}`}
                  className="flex justify-between items-center"
                >
                  <span className="font-body text-sm text-foreground">
                    {item.productName}{" "}
                    <span className="text-muted-foreground">
                      ×{item.quantity}
                    </span>
                  </span>
                  <span className="font-body text-sm font-medium text-foreground">
                    ₹
                    {(item.price * Number(item.quantity)).toLocaleString(
                      "en-IN",
                    )}
                  </span>
                </div>
              ))}
            </div>
            <Separator className="mt-3 mb-2" />
            <div className="flex justify-between items-center">
              <span className="font-body text-sm font-medium text-foreground">
                Total
              </span>
              <span className="font-display text-base font-semibold text-foreground">
                ₹{order.totalAmount.toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          {/* Delivery Address */}
          <div>
            <h4 className="font-body text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
              Delivery Address
            </h4>
            <p className="font-body text-sm text-foreground">{order.address}</p>
          </div>

          {/* Payment Method */}
          <div>
            <h4 className="font-body text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
              Payment Method
            </h4>
            <p className="font-body text-sm text-foreground">
              {order.paymentMethod}
            </p>
          </div>

          {/* Tracking ID */}
          {order.trackingNumber && (
            <div>
              <h4 className="font-body text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                Tracking ID
              </h4>
              <div className="flex items-center gap-2">
                <span className="font-body text-sm font-medium text-foreground bg-secondary/40 px-3 py-1 rounded-full">
                  {order.trackingNumber}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    copyToClipboard(order.trackingNumber!, "Tracking ID")
                  }
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Copy tracking ID"
                >
                  <ClipboardCopy className="h-3.5 w-3.5" />
                </button>
                <Link
                  to="/track-order"
                  search={{ id: order.trackingNumber }}
                  className="font-body text-xs text-primary underline hover:no-underline"
                >
                  Track →
                </Link>
              </div>
            </div>
          )}

          {/* Admin Message */}
          {order.adminMessage && (
            <div className="rounded-xl bg-secondary/30 border border-secondary/50 px-4 py-3">
              <p className="font-body text-xs font-semibold text-muted-foreground mb-1">
                Update from The Pearlfect Store
              </p>
              <p className="font-body text-sm text-foreground">
                {order.adminMessage}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export function MyOrdersPage() {
  const { isLoggedIn, userPhone } = useUserAuth();
  const navigate = useNavigate();
  const cancelOrder = useCancelOrder();

  const [orders, setOrders] = useState<ExtendedOrder[]>([]);
  const [cancelTarget, setCancelTarget] = useState<ExtendedOrder | null>(null);

  const { data: backendOrders } = useGetOrderByPhone(userPhone);

  // Read from localStorage (immediate)
  useEffect(() => {
    if (!userPhone) return;

    const refresh = () => {
      const local = readLocalOrders().filter((o) => o.phone === userPhone);
      // backendOrders is Order[] (array from backend)
      const backendList: ExtendedOrder[] = (backendOrders ?? []).map((bo) => ({
        id: bo.id,
        customerName: bo.customerName,
        phone: bo.phone,
        address: bo.address,
        paymentMethod: bo.paymentMethod,
        items: bo.items.map((i) => ({
          productId: i.productId,
          productName: i.productName,
          quantity: Number(i.quantity),
          price: i.price,
        })),
        totalAmount: bo.totalAmount,
        status: bo.status,
        trackingNumber: bo.trackingNumber ?? null,
        couponCode: bo.couponCode ?? null,
        discountAmount: bo.discountAmount ?? null,
        razorpayPaymentId: bo.razorpayPaymentId ?? null,
        createdAt: Number(bo.createdAt),
        lastUpdatedAt: Number(bo.createdAt),
        adminMessage: "",
        updateHistory: [],
      }));
      // Merge with local orders, deduplicating by id (backend wins)
      const backendIds = new Set(backendList.map((o) => o.id));
      const localOnly = local.filter((o) => !backendIds.has(o.id));
      const merged: ExtendedOrder[] = [...localOnly, ...backendList];
      // Sort newest first
      merged.sort((a, b) => b.createdAt - a.createdAt);
      setOrders(merged);
    };

    refresh();
    const handler = (e: StorageEvent) => {
      if (e.key === ORDERS_LOCAL_KEY) refresh();
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, [userPhone, backendOrders]);

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoggedIn) {
      navigate({ to: "/login" });
    }
  }, [isLoggedIn, navigate]);

  const handleCancelConfirm = async () => {
    if (!cancelTarget) return;
    try {
      await cancelOrder.mutateAsync(cancelTarget.id);
      toast.success("Order cancelled successfully.", {
        style: { background: "#fce4ec", color: "#000" },
      });
      // Refresh local list
      setOrders((prev) =>
        prev.map((o) =>
          o.id === cancelTarget.id ? { ...o, status: "cancelled" } : o,
        ),
      );
    } catch {
      toast.error("Failed to cancel order. Please try again.");
    } finally {
      setCancelTarget(null);
    }
  };

  if (!isLoggedIn) return null;

  return (
    <main className="min-h-screen bg-background">
      {/* Page Header */}
      <section className="py-10 px-4 sm:px-6 bg-card border-b border-border/80">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-display text-3xl sm:text-4xl font-medium text-foreground">
            My Orders
          </h1>
          <p className="font-body text-sm text-muted-foreground mt-1">
            {userPhone && (
              <>
                Showing orders for{" "}
                <span className="font-medium">+91 {userPhone}</span>
              </>
            )}
          </p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {orders.length === 0 ? (
          /* Empty State */
          <div
            className="flex flex-col items-center justify-center py-24 text-center"
            data-ocid="my-orders.empty_state"
          >
            <div className="w-16 h-16 rounded-2xl bg-secondary/30 flex items-center justify-center mb-5">
              <ShoppingBag className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="font-display text-2xl font-medium text-foreground mb-2">
              No orders yet
            </h2>
            <p className="font-body text-muted-foreground mb-6">
              Start shopping to see your orders here.
            </p>
            <Link to="/shop">
              <Button
                type="button"
                className="rounded-full font-body bg-foreground text-background hover:bg-foreground/90"
                data-ocid="my-orders.shop_link"
              >
                Shop The Collection
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4" data-ocid="my-orders.order_list">
            {orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onCancel={setCancelTarget}
              />
            ))}
          </div>
        )}
      </div>

      {/* Cancel Confirmation Dialog */}
      <Dialog
        open={!!cancelTarget}
        onOpenChange={(open) => !open && setCancelTarget(null)}
      >
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              Cancel Order?
            </DialogTitle>
            <DialogDescription className="font-body text-sm text-muted-foreground mt-1">
              Are you sure you want to cancel order{" "}
              <span className="font-semibold text-foreground">
                {cancelTarget?.id}
              </span>
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCancelTarget(null)}
              className="flex-1 rounded-full font-body"
              data-ocid="my-orders.keep_order_button"
            >
              Keep Order
            </Button>
            <Button
              type="button"
              onClick={handleCancelConfirm}
              disabled={cancelOrder.isPending}
              className="flex-1 rounded-full font-body bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-ocid="my-orders.confirm_cancel_button"
            >
              {cancelOrder.isPending ? "Cancelling..." : "Cancel Order"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
