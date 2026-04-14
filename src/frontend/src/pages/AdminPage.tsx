import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useQueryClient } from "@tanstack/react-query";
import {
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Clock,
  Edit,
  ExternalLink,
  Eye,
  EyeOff,
  Gem,
  Home,
  Image,
  KeyRound,
  LayoutDashboard,
  Loader2,
  LogIn,
  Mail,
  Megaphone,
  Menu,
  MessageSquare,
  Package,
  Plus,
  Save,
  Settings,
  ShoppingBag,
  Tag,
  Trash2,
  TrendingUp,
  Truck,
  Upload,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ExternalBlob } from "../backend";
import type { Product } from "../backend";
import {
  useAddGalleryPhoto,
  useAddProduct,
  useClearAllOrders,
  useCoupons,
  useCreateCoupon,
  useCustomOrders,
  useDeleteCoupon,
  useDeleteGalleryPhoto,
  useDeleteOrderHistoryEntry,
  useDeleteProduct,
  useDeleteTrackingEntry,
  useEditOrderHistoryEntry,
  useEditTrackingEntry,
  useExtendedOrders,
  useGalleryPhotos,
  useGetPromoBanner,
  useGetTrackingHistory,
  useNewsletterSubscribers,
  useOrders,
  useProducts,
  useRemoveStoryImage,
  useReplaceStoryImage,
  useSaveOrderUpdate,
  useSetPromoBanner,
  useStoryImages,
  useUpdateCustomOrderStatus,
  useUpdateOrderStatus,
  useUpdateOrderTracking,
  useUpdateProduct,
  useUpdateTrackingStatus,
} from "../hooks/useQueries";
import type { ExtendedOrder, OrderHistoryEntry } from "../hooks/useQueries";
import {
  deleteLocalCoupon,
  getLocalCoupons,
  saveLocalCoupon,
} from "../utils/couponStorage";

type Section =
  | "overview"
  | "orders"
  | "tracking"
  | "products"
  | "gallery"
  | "homepage"
  | "custom-orders"
  | "coupons"
  | "promo-banner"
  | "newsletter"
  | "settings";

function ProductForm({
  initial,
  defaultCategory,
  onSubmit,
  onCancel,
  isPending,
}: {
  initial?: Product;
  defaultCategory?: string;
  onSubmit: (data: {
    name: string;
    price: number;
    description: string;
    imageUrl: ExternalBlob;
    category: string;
    inStock: boolean;
  }) => void;
  onCancel?: () => void;
  isPending: boolean;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [price, setPrice] = useState(initial?.price?.toString() ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [category, setCategory] = useState(
    initial?.category ?? defaultCategory ?? "",
  );
  const [inStock, setInStock] = useState(initial?.inStock ?? true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let blob: ExternalBlob;
    if (imageFile) {
      const buf = await imageFile.arrayBuffer();
      blob = ExternalBlob.fromBytes(new Uint8Array(buf));
    } else if (initial?.imageUrl) {
      blob = initial.imageUrl;
    } else {
      toast.error("Please upload a product image.");
      return;
    }
    onSubmit({
      name,
      price: Number.parseFloat(price),
      description,
      imageUrl: blob,
      category,
      inStock,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label className="font-body text-sm mb-1.5 block">Product Name</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="e.g. Pearl Drop Necklace"
            className="rounded-xl font-body"
            data-ocid="admin.input"
          />
        </div>
        <div>
          <Label className="font-body text-sm mb-1.5 block">Price (₹)</Label>
          <Input
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            type="number"
            min="0"
            step="0.01"
            placeholder="e.g. 1299"
            className="rounded-xl font-body"
            data-ocid="admin.input"
          />
        </div>
      </div>
      <div>
        <Label className="font-body text-sm mb-1.5 block">Category</Label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
          className="rounded-xl font-body border border-input bg-background px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-ring"
          data-ocid="admin.select"
        >
          <option value="" disabled>
            -- Select Category --
          </option>
          <option value="bracelets">Bracelets</option>
          <option value="necklaces">Necklaces</option>
          <option value="anklets">Anklets</option>
          <option value="phone charms">Phone Charms</option>
          <option value="charms">Charms</option>
        </select>
      </div>
      <div>
        <Label className="font-body text-sm mb-1.5 block">Description</Label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          placeholder="Describe this product..."
          rows={3}
          className="rounded-xl font-body resize-none"
          data-ocid="admin.textarea"
        />
      </div>
      <div>
        <Label className="font-body text-sm mb-1.5 block">Product Image</Label>
        <Input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
          className="rounded-xl font-body"
          data-ocid="admin.upload_button"
        />
        {initial && !imageFile && (
          <p className="text-xs text-muted-foreground mt-1">
            Leave empty to keep current image.
          </p>
        )}
      </div>
      {initial && (
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="instock"
            checked={inStock}
            onChange={(e) => setInStock(e.target.checked)}
            data-ocid="admin.checkbox"
          />
          <Label htmlFor="instock" className="font-body text-sm">
            In Stock
          </Label>
        </div>
      )}
      <div className="flex gap-2 pt-2">
        <Button
          type="submit"
          disabled={isPending}
          className="font-body bg-foreground text-background hover:bg-foreground/90 rounded-xl"
          data-ocid="admin.submit_button"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          {initial ? "Update Product" : "Add Product"}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="font-body rounded-xl"
            data-ocid="admin.cancel_button"
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}

function StoryImageSlot({
  slot,
  label,
  fallbackSrc,
  uploadOcid,
  deleteOcid,
}: {
  slot: 1 | 2;
  label: string;
  fallbackSrc: string;
  uploadOcid: string;
  deleteOcid: string;
}) {
  const { data: storyImages } = useStoryImages();
  const replaceStoryImage = useReplaceStoryImage();
  const removeStoryImage = useRemoveStoryImage();
  const fileRef = useRef<HTMLInputElement>(null);

  const current = slot === 1 ? storyImages?.slot1 : storyImages?.slot2;
  const src = current ? current.imageUrl.getDirectURL() : fallbackSrc;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const buf = await file.arrayBuffer();
    const blob = ExternalBlob.fromBytes(new Uint8Array(buf));
    await replaceStoryImage.mutateAsync({
      slot,
      imageUrl: blob,
      existingId: current?.id,
    });
    toast.success(`Story Image ${slot} updated!`);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="bg-card rounded-2xl p-5 shadow-soft">
      <p className="font-body font-medium text-foreground mb-3">{label}</p>
      <div className="relative rounded-xl overflow-hidden aspect-square mb-4">
        <img src={src} alt={label} className="w-full h-full object-cover" />
        <div className="absolute bottom-2 left-2">
          <span className="text-xs bg-black/50 text-white px-2 py-0.5 rounded-full font-body">
            {current ? "Custom image" : "Default image"}
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <label
          className="flex items-center justify-center gap-2 cursor-pointer bg-foreground text-background hover:bg-foreground/90 text-sm font-body rounded-xl px-4 py-2 transition-colors"
          data-ocid={uploadOcid}
        >
          <Upload className="h-4 w-4" />
          {replaceStoryImage.isPending ? "Uploading..." : "Replace Image"}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
            disabled={replaceStoryImage.isPending}
          />
        </label>
        {current && (
          <Button
            variant="outline"
            size="sm"
            className="font-body rounded-xl text-destructive border-destructive/30 hover:bg-destructive/10"
            onClick={async () => {
              await removeStoryImage.mutateAsync(current.id);
              toast.success(`Story Image ${slot} removed.`);
            }}
            disabled={removeStoryImage.isPending}
            data-ocid={deleteOcid}
          >
            <Trash2 className="h-4 w-4 mr-1.5" />
            Remove (restore default)
          </Button>
        )}
      </div>
    </div>
  );
}

// ─── Stat Card ───────────────────────────────────────────────────────────────
function StatCard({
  title,
  value,
  icon: Icon,
  accent,
  onClick,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  accent: string;
  onClick?: () => void;
}) {
  return (
    <div
      className={`bg-card rounded-2xl p-5 shadow-soft border border-border/50 flex items-start gap-4 ${
        onClick ? "cursor-pointer hover:shadow-md transition-shadow" : ""
      }`}
      onClick={onClick}
      onKeyDown={onClick ? (e) => e.key === "Enter" && onClick() : undefined}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${accent}`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="font-body text-xs text-muted-foreground uppercase tracking-widest mb-1">
          {title}
        </p>
        <p className="font-display text-2xl font-semibold text-foreground">
          {value}
        </p>
      </div>
    </div>
  );
}

// ─── Status Badge ────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700 border-amber-200",
    confirmed: "bg-blue-100 text-blue-700 border-blue-200",
    processing: "bg-blue-100 text-blue-700 border-blue-200",
    shipped: "bg-purple-100 text-purple-700 border-purple-200",
    delivered: "bg-green-100 text-green-700 border-green-200",
    cancelled: "bg-red-100 text-red-700 border-red-200",
    refunded: "bg-gray-100 text-gray-700 border-gray-200",
    payment_confirmed: "bg-green-100 text-green-700 border-green-200",
    awaiting_shipment: "bg-amber-100 text-amber-700 border-amber-200",
    out_for_delivery: "bg-orange-100 text-orange-700 border-orange-200",
    in_progress: "bg-blue-100 text-blue-700 border-blue-200",
    reviewed: "bg-purple-100 text-purple-700 border-purple-200",
    completed: "bg-green-100 text-green-700 border-green-200",
  };
  const cls = map[status] ?? "bg-gray-100 text-gray-700 border-gray-200";
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-body font-medium border ${cls} capitalize`}
    >
      {status.split("_").join(" ")}
    </span>
  );
}

// ─── Overview Section ────────────────────────────────────────────────────────
function OverviewSection({
  onNavigate,
}: {
  onNavigate: (section: Section) => void;
}) {
  const { data: orders } = useOrders();
  const { data: products } = useProducts();
  const { data: customOrders } = useCustomOrders();

  const totalRevenue = (orders ?? []).reduce((s, o) => s + o.totalAmount, 0);
  const totalOrders = (orders ?? []).length;
  const pendingOrders = (orders ?? []).filter(
    (o) => o.status === "pending",
  ).length;
  const totalProducts = (products ?? []).length;
  const outOfStock = (products ?? []).filter((p) => !p.inStock).length;
  const pendingCustomOrders = (customOrders ?? []).filter(
    (o) => o.status === "pending",
  ).length;
  const recentOrders = [...(orders ?? [])]
    .sort((a, b) => Number(b.createdAt) - Number(a.createdAt))
    .slice(0, 5);

  const formatDate = (ts: bigint) => {
    const d = new Date(Number(ts) / 1_000_000);
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div data-ocid="admin.overview.section" className="space-y-8">
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <StatCard
          title="Total Revenue"
          value={`₹${totalRevenue.toLocaleString("en-IN")}`}
          icon={TrendingUp}
          accent="bg-amber-50 text-amber-600"
        />
        <StatCard
          title="Total Orders"
          value={totalOrders}
          icon={ShoppingBag}
          accent="bg-blue-50 text-blue-600"
          onClick={() => onNavigate("orders")}
        />
        <StatCard
          title="Pending Orders"
          value={pendingOrders}
          icon={ClipboardList}
          accent="bg-orange-50 text-orange-600"
          onClick={() => onNavigate("orders")}
        />
        <StatCard
          title="Products"
          value={totalProducts}
          icon={Package}
          accent="bg-pink-50 text-pink-600"
          onClick={() => onNavigate("products")}
        />
        <StatCard
          title="Custom Requests"
          value={pendingCustomOrders}
          icon={ClipboardList}
          accent="bg-violet-50 text-violet-600"
          onClick={() => onNavigate("custom-orders")}
        />
      </div>

      {outOfStock > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 flex items-center gap-3">
          <Package className="h-5 w-5 text-amber-600 flex-shrink-0" />
          <p className="font-body text-sm text-amber-800">
            <span className="font-semibold">
              {outOfStock} product{outOfStock > 1 ? "s" : ""}
            </span>{" "}
            marked out of stock. Update from the Products section.
          </p>
        </div>
      )}

      <div className="bg-card rounded-2xl shadow-soft border border-border/50 overflow-hidden">
        <div className="px-6 py-4 border-b border-border/50">
          <h3 className="font-display text-lg font-medium text-foreground">
            Recent Orders
          </h3>
        </div>
        {recentOrders.length === 0 ? (
          <div
            className="px-6 py-10 text-center"
            data-ocid="admin.orders.empty_state"
          >
            <ShoppingBag className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="font-body text-muted-foreground">No orders yet</p>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {recentOrders.map((order, i) => (
              <div
                key={order.id}
                className="px-6 py-4 flex items-center justify-between gap-4"
                data-ocid={`admin.orders.item.${i + 1}`}
              >
                <div className="min-w-0">
                  <p className="font-body font-medium text-foreground truncate">
                    {order.customerName}
                  </p>
                  <p className="font-body text-xs text-muted-foreground">
                    {formatDate(order.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <StatusBadge status={order.status} />
                  <p className="font-body font-semibold text-foreground">
                    ₹{order.totalAmount.toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── History Log ─────────────────────────────────────────────────────────────
function HistoryLog({
  orderId,
  entries,
}: { orderId: string; entries: OrderHistoryEntry[] }) {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const editEntry = useEditOrderHistoryEntry();
  const deleteEntry = useDeleteOrderHistoryEntry();

  if (entries.length === 0) return null;

  const formatTs = (ts: number) =>
    new Date(ts).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="mt-1">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-xs font-body text-muted-foreground hover:text-foreground transition-colors"
        data-ocid="admin.orders.history_toggle"
      >
        <Clock className="h-3.5 w-3.5" />
        Update history ({entries.length})
        {open ? (
          <ChevronUp className="h-3.5 w-3.5" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5" />
        )}
      </button>
      {open && (
        <div className="mt-2 space-y-2 border-l-2 border-border/50 pl-4">
          {[...entries].reverse().map((entry) => (
            <div
              key={entry.id}
              className="relative group"
              data-ocid={`admin.orders.history.item.${entry.id}`}
            >
              {editingId === entry.id ? (
                <div className="bg-muted/40 rounded-xl p-3 space-y-2">
                  <p className="font-mono text-xs text-muted-foreground">
                    {formatTs(entry.timestamp)} ·{" "}
                    <StatusBadge status={entry.status} />
                  </p>
                  <Textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    rows={2}
                    className="rounded-lg font-body text-xs resize-none"
                    placeholder="Update message..."
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="rounded-lg font-body text-xs bg-foreground text-background hover:bg-foreground/90 h-7 px-3"
                      disabled={editEntry.isPending}
                      onClick={async () => {
                        await editEntry.mutateAsync({
                          orderId,
                          entryId: entry.id,
                          message: editText,
                        });
                        setEditingId(null);
                        toast.success("Entry updated.");
                      }}
                    >
                      <Save className="h-3 w-3 mr-1" /> Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-lg font-body text-xs h-7 px-3"
                      onClick={() => setEditingId(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="bg-muted/30 rounded-xl p-3">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs text-muted-foreground">
                        {formatTs(entry.timestamp)}
                      </span>
                      <StatusBadge status={entry.status} />
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                      <button
                        type="button"
                        className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                        onClick={() => {
                          setEditingId(entry.id);
                          setEditText(entry.message);
                        }}
                        aria-label="Edit entry"
                        data-ocid={`admin.orders.history.edit_button.${entry.id}`}
                      >
                        <Edit className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        className="p-1 rounded hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
                        onClick={async () => {
                          if (!confirm("Delete this history entry?")) return;
                          await deleteEntry.mutateAsync({
                            orderId,
                            entryId: entry.id,
                          });
                          toast.success("Entry deleted.");
                        }}
                        aria-label="Delete entry"
                        data-ocid={`admin.orders.history.delete_button.${entry.id}`}
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  {entry.message ? (
                    <p className="font-body text-xs text-foreground leading-relaxed">
                      {entry.message}
                    </p>
                  ) : (
                    <p className="font-body text-xs text-muted-foreground italic">
                      No message
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Order Card ───────────────────────────────────────────────────────────────
function OrderCard({
  order,
  index,
}: {
  order: ExtendedOrder;
  index: number;
}) {
  const updateOrderStatus = useUpdateOrderStatus();
  const saveOrderUpdate = useSaveOrderUpdate();
  const updateOrderTracking = useUpdateOrderTracking();

  const VALID_TRACKING_STATUSES = [
    "processing",
    "shipped",
    "out_for_delivery",
    "delivered",
  ];
  const [localStatus, setLocalStatus] = useState(
    VALID_TRACKING_STATUSES.includes(order.status)
      ? order.status
      : "processing",
  );
  const [message, setMessage] = useState(order.adminMessage);
  const [tracking, setTracking] = useState(order.trackingNumber ?? "");
  const [saving, setSaving] = useState(false);

  const isRazorpay = order.paymentMethod.startsWith("Razorpay | ");
  const razorpayPaymentId = isRazorpay
    ? order.paymentMethod.split("Razorpay | ")[1]
    : null;

  const formatDate = (ts: number) =>
    new Date(ts).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
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

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveOrderUpdate.mutateAsync({
        id: order.id,
        status: localStatus,
        message,
      });
      toast.success("Order update saved!");
    } finally {
      setSaving(false);
    }
  };

  const trackingDisplay = tracking || order.trackingNumber || "";

  return (
    <div
      className="bg-card rounded-2xl shadow-soft border border-border/50 p-5 space-y-4"
      data-ocid={`admin.orders.item.${index}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="font-display text-base font-semibold text-foreground">
            {order.customerName}
          </p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded-full text-foreground font-semibold">
              #{order.id}
            </span>
            <span className="font-body text-xs text-muted-foreground">
              {order.phone} · {formatDate(order.createdAt)}
            </span>
          </div>
          <p className="font-body text-sm text-muted-foreground mt-1">
            {order.address}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <StatusBadge status={order.status} />
          {isRazorpay ? (
            <div className="flex flex-col items-end gap-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full font-body text-xs font-medium border border-blue-200">
                <span className="w-4 h-4 rounded bg-[#3395FF] text-white text-[9px] font-bold flex items-center justify-center flex-shrink-0">
                  R
                </span>
                Razorpay
              </span>
              {razorpayPaymentId && (
                <p className="font-mono text-xs text-muted-foreground">
                  ID: {razorpayPaymentId}
                </p>
              )}
              <a
                href="https://dashboard.razorpay.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-body transition-colors"
                data-ocid={`admin.orders.secondary_button.${index}`}
              >
                Verify on Razorpay
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          ) : order.paymentMethod === "Cash on Delivery" ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full font-body text-xs font-medium border border-amber-200">
              <Truck className="h-3 w-3" /> COD
            </span>
          ) : (
            <span className="font-body text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full capitalize">
              {order.paymentMethod}
            </span>
          )}
        </div>
      </div>

      {/* Tracking ID + Last Updated row */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-1.5">
        <div className="flex items-center gap-1.5">
          <Truck className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
          <span className="font-body text-xs text-muted-foreground">
            Tracking ID:
          </span>
          {trackingDisplay ? (
            <span className="font-mono text-xs font-semibold text-foreground bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
              {trackingDisplay}
            </span>
          ) : (
            <span className="font-body text-xs text-muted-foreground italic">
              Not assigned
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
          <span className="font-body text-xs text-muted-foreground">
            Last updated:{" "}
            <span className="text-foreground font-medium">
              {formatDateTime(order.lastUpdatedAt)}
            </span>
          </span>
        </div>
      </div>

      {/* Items */}
      <div className="space-y-1">
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
        <div className="flex justify-between font-body text-sm font-semibold pt-1 border-t border-border/50">
          <span>Total</span>
          <span>₹{order.totalAmount.toLocaleString("en-IN")}</span>
        </div>
      </div>

      {/* Tracking number input */}
      <div className="flex items-center gap-2">
        <Input
          value={tracking}
          onChange={(e) => setTracking(e.target.value)}
          placeholder="Enter / update tracking number"
          className="rounded-xl font-body text-sm h-9 flex-1"
          data-ocid={`admin.orders.input.${index}`}
        />
        <Button
          size="sm"
          variant="outline"
          className="rounded-xl font-body text-xs flex-shrink-0"
          disabled={updateOrderTracking.isPending}
          onClick={() => {
            if (!tracking.trim()) return;
            updateOrderTracking.mutate({
              id: order.id,
              trackingNumber: tracking.trim(),
            });
            toast.success("Tracking number saved!");
          }}
          data-ocid={`admin.orders.save_button.${index}`}
        >
          Save Tracking
        </Button>
      </div>

      {/* Status + Message + Save */}
      <div className="bg-muted/30 rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-3">
          <Label className="font-body text-sm text-muted-foreground flex-shrink-0">
            Status:
          </Label>
          <Select value={localStatus} onValueChange={setLocalStatus}>
            <SelectTrigger
              className="w-48 rounded-xl font-body text-sm"
              data-ocid={`admin.orders.select.${index}`}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[
                { value: "processing", label: "Processing" },
                { value: "shipped", label: "Shipped" },
                { value: "out_for_delivery", label: "Out for Delivery" },
                { value: "delivered", label: "Delivered" },
              ].map((s) => (
                <SelectItem key={s.value} value={s.value} className="font-body">
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="font-body text-sm text-muted-foreground flex items-center gap-1.5">
            <MessageSquare className="h-3.5 w-3.5" /> Admin Note / Update
            Message
          </Label>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="e.g. Delayed due to local holiday. Expected delivery: 12 Apr."
            rows={2}
            className="rounded-xl font-body text-sm resize-none"
            data-ocid={`admin.orders.message.${index}`}
          />
        </div>

        <Button
          onClick={handleSave}
          disabled={saving}
          className="font-body bg-foreground text-background hover:bg-foreground/90 rounded-xl text-sm h-9"
          data-ocid={`admin.orders.update_button.${index}`}
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save Update
        </Button>
      </div>

      {/* Legacy quick-action buttons */}
      <div className="flex flex-wrap gap-2">
        {(order.paymentMethod === "UPI" ||
          order.paymentMethod === "Debit/Credit Card" ||
          isRazorpay) &&
          order.status !== "payment_confirmed" &&
          order.status !== "delivered" &&
          order.status !== "cancelled" && (
            <button
              type="button"
              onClick={() =>
                updateOrderStatus.mutate({
                  id: order.id,
                  status: "payment_confirmed",
                })
              }
              className="px-4 py-1.5 bg-green-600 text-white hover:bg-green-700 rounded-full font-body text-sm transition-colors"
              data-ocid={`admin.orders.confirm_button.${index}`}
            >
              ✓ Mark Payment Received
            </button>
          )}
        {order.paymentMethod === "Cash on Delivery" &&
          (order.status === "out_for_delivery" ||
            order.status === "delivered") && (
            <button
              type="button"
              onClick={() =>
                updateOrderStatus.mutate({
                  id: order.id,
                  status: "payment_confirmed",
                })
              }
              className="px-4 py-1.5 bg-amber-600 text-white hover:bg-amber-700 rounded-full font-body text-sm transition-colors"
              data-ocid={`admin.orders.cod_confirm_button.${index}`}
            >
              ✓ Mark Cash Collected
            </button>
          )}
        {order.status !== "shipped" &&
          order.status !== "delivered" &&
          order.status !== "cancelled" &&
          (order.paymentMethod === "Cash on Delivery" ||
          order.status === "payment_confirmed" ? (
            <button
              type="button"
              onClick={() =>
                updateOrderStatus.mutate({ id: order.id, status: "shipped" })
              }
              className="px-4 py-1.5 bg-purple-600 text-white hover:bg-purple-700 rounded-full font-body text-sm transition-colors"
              data-ocid={`admin.orders.ship_button.${index}`}
            >
              🚚 Mark as Shipped
            </button>
          ) : (
            <button
              type="button"
              disabled
              className="px-4 py-1.5 bg-muted text-muted-foreground rounded-full font-body text-sm cursor-not-allowed"
              data-ocid={`admin.orders.ship_button.${index}`}
            >
              🔒 Awaiting Payment Confirmation
            </button>
          ))}
      </div>

      {/* History */}
      <HistoryLog orderId={order.id} entries={order.updateHistory} />
    </div>
  );
}

// ─── Orders Section ──────────────────────────────────────────────────────────
function OrdersSection() {
  const { data: extendedOrders, refetch } = useExtendedOrders();
  const queryClient = useQueryClient();
  const clearAllOrders = useClearAllOrders();
  const [filter, setFilter] = useState("all");
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearing, setClearing] = useState(false);

  // Listen for storage events to immediately catch new orders placed by customers.
  // broadcastOrdersUpdate() fires a synthetic StorageEvent from CheckoutPage
  // so this handler triggers even for same-tab order placements.
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === "pearlfect_local_orders") {
        // Invalidate cache AND force an immediate refetch so the UI re-renders
        // right away without waiting for the next poll cycle
        queryClient.invalidateQueries({ queryKey: ["extendedOrders"] });
        void refetch();
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, [queryClient, refetch]);

  const handleClearAll = async () => {
    setClearing(true);
    try {
      await clearAllOrders.mutateAsync();
      toast.success("All orders cleared.");
      setShowClearConfirm(false);
    } finally {
      setClearing(false);
    }
  };

  const filters = [
    "all",
    "cod",
    "pending",
    "confirmed",
    "shipped",
    "delivered",
    "cancelled",
  ];
  const filterLabels: Record<string, string> = {
    all: "All",
    cod: "COD",
    pending: "Pending",
    confirmed: "Confirmed",
    shipped: "Shipped",
    delivered: "Delivered",
    cancelled: "Cancelled",
  };

  const filtered = (extendedOrders ?? []).filter((o) => {
    if (filter === "all") return true;
    if (filter === "cod") return o.paymentMethod === "Cash on Delivery";
    return o.status === filter;
  });
  const sorted = [...filtered].sort(
    (a, b) => Number(b.createdAt) - Number(a.createdAt),
  );
  const totalOrders = (extendedOrders ?? []).length;

  return (
    <div data-ocid="admin.orders.section" className="space-y-6">
      {/* Confirmation dialog */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-card rounded-2xl shadow-lg border border-border/60 p-6 max-w-sm w-full space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="font-display text-base font-semibold text-foreground">
                  Clear All Orders?
                </p>
                <p className="font-body text-xs text-muted-foreground">
                  This cannot be undone.
                </p>
              </div>
            </div>
            <p className="font-body text-sm text-foreground leading-relaxed bg-red-50 border border-red-100 rounded-xl px-4 py-3">
              Are you sure you want to delete all {totalOrders} order
              {totalOrders !== 1 ? "s" : ""}? This action is permanent and
              cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button
                onClick={handleClearAll}
                disabled={clearing}
                className="flex-1 rounded-xl font-body bg-red-600 hover:bg-red-700 text-white"
                data-ocid="admin.orders.clear_confirm_button"
              >
                {clearing ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-2" />
                )}
                Yes, clear all
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowClearConfirm(false)}
                disabled={clearing}
                className="flex-1 rounded-xl font-body"
                data-ocid="admin.orders.clear_cancel_button"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          className="flex flex-wrap gap-2"
          data-ocid="admin.orders.filter.tab"
        >
          {filters.map((f) => (
            <button
              type="button"
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full font-body text-sm transition-colors capitalize ${
                filter === f
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {filterLabels[f] ?? f}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {totalOrders > 0 && (
            <button
              type="button"
              onClick={() => setShowClearConfirm(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-body text-sm bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-colors"
              data-ocid="admin.orders.clear_all_button"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear All Orders
            </button>
          )}
          <button
            type="button"
            onClick={() => refetch()}
            className="font-body text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            data-ocid="admin.orders.refresh_button"
          >
            ↻ Refresh
          </button>
        </div>
      </div>

      {sorted.length === 0 ? (
        <div
          className="bg-card rounded-2xl shadow-soft border border-border/50 py-16 text-center"
          data-ocid="admin.orders.empty_state"
        >
          <ShoppingBag className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="font-body text-muted-foreground">No orders found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sorted.map((order, i) => (
            <OrderCard key={order.id} order={order} index={i + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Products Section ────────────────────────────────────────────────────────
const CATEGORIES = [
  { key: "all", label: "All" },
  { key: "bracelets", label: "Bracelets" },
  { key: "necklaces", label: "Necklaces" },
  { key: "anklets", label: "Anklets" },
  { key: "charms", label: "Charms" },
];

function ProductsSection() {
  const { data: products } = useProducts();
  const addProduct = useAddProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");

  const allProducts = products ?? [];

  const filteredProducts =
    activeCategory === "all"
      ? allProducts
      : allProducts.filter((p) => {
          if (activeCategory === "charms") {
            return (
              p.category.toLowerCase() === "charms" ||
              p.category.toLowerCase() === "phone charms"
            );
          }
          return p.category.toLowerCase() === activeCategory.toLowerCase();
        });

  const getCategoryCount = (key: string) =>
    key === "all"
      ? allProducts.length
      : allProducts.filter(
          (p) => p.category.toLowerCase() === key.toLowerCase(),
        ).length;

  return (
    <div data-ocid="admin.products.section" className="space-y-6">
      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            type="button"
            onClick={() => {
              setActiveCategory(cat.key);
              setShowAddProduct(false);
            }}
            className={`font-body text-sm px-4 py-1.5 rounded-full border transition-colors whitespace-nowrap ${
              activeCategory === cat.key
                ? "bg-foreground text-background border-foreground"
                : "bg-background text-foreground border-border hover:border-foreground/50"
            }`}
            data-ocid="admin.products.tab"
          >
            {cat.label} ({getCategoryCount(cat.key)})
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <p className="font-body text-muted-foreground">
          {filteredProducts.length} product
          {filteredProducts.length !== 1 ? "s" : ""}
        </p>
        {!showAddProduct && (
          <Button
            onClick={() => setShowAddProduct(true)}
            className="font-body bg-foreground text-background hover:bg-foreground/90 rounded-xl"
            data-ocid="admin.products.primary_button"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Product
          </Button>
        )}
      </div>

      {showAddProduct && (
        <div className="bg-card rounded-2xl p-6 shadow-soft border border-border/50">
          <h3 className="font-display text-lg font-medium mb-5">New Product</h3>
          <ProductForm
            isPending={addProduct.isPending}
            defaultCategory={activeCategory === "all" ? "" : activeCategory}
            onSubmit={async (data) => {
              await addProduct.mutateAsync(data);
              setShowAddProduct(false);
              toast.success("Product added!");
            }}
            onCancel={() => setShowAddProduct(false)}
          />
        </div>
      )}

      {filteredProducts.length === 0 ? (
        <div
          className="bg-card rounded-2xl shadow-soft border border-border/50 py-16 text-center"
          data-ocid="admin.products.empty_state"
        >
          <Package className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="font-body text-muted-foreground">
            {activeCategory === "all"
              ? "No products yet"
              : `No ${activeCategory} yet`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product, i) => (
            <div key={product.id} data-ocid={`admin.products.item.${i + 1}`}>
              {editingProduct?.id === product.id ? (
                <div className="bg-card rounded-2xl p-5 shadow-soft border border-accent/40">
                  <h4 className="font-display text-base font-medium mb-4">
                    Edit Product
                  </h4>
                  <ProductForm
                    initial={editingProduct}
                    isPending={updateProduct.isPending}
                    onSubmit={async (data) => {
                      await updateProduct.mutateAsync({
                        id: product.id,
                        ...data,
                      });
                      setEditingProduct(null);
                      toast.success("Product updated!");
                    }}
                    onCancel={() => setEditingProduct(null)}
                  />
                </div>
              ) : (
                <div className="bg-card rounded-2xl shadow-soft border border-border/50 overflow-hidden group">
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={product.imageUrl.getDirectURL()}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="font-display font-semibold text-foreground text-sm leading-tight">
                        {product.name}
                      </p>
                      <Badge
                        variant={product.inStock ? "default" : "secondary"}
                        className="text-xs flex-shrink-0 font-body"
                      >
                        {product.inStock ? "In Stock" : "Out"}
                      </Badge>
                    </div>
                    <p className="font-body text-xs text-muted-foreground mb-2">
                      {product.category}
                    </p>
                    <p className="font-display font-bold text-foreground">
                      ₹{product.price.toLocaleString("en-IN")}
                    </p>
                    <div className="flex gap-2 mt-3">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 rounded-xl font-body text-xs"
                        onClick={() => setEditingProduct(product)}
                        data-ocid={`admin.products.edit_button.${i + 1}`}
                      >
                        <Edit className="h-3 w-3 mr-1" /> Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-xl font-body text-xs text-destructive border-destructive/30 hover:bg-destructive/10"
                        onClick={async () => {
                          if (confirm("Delete this product?")) {
                            await deleteProduct.mutateAsync(product.id);
                            toast.success("Product deleted.");
                          }
                        }}
                        data-ocid={`admin.products.delete_button.${i + 1}`}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className={`w-full mt-2 rounded-xl font-body text-xs ${
                        product.inStock
                          ? "border-muted-foreground/30 text-muted-foreground hover:bg-muted/40"
                          : "border-green-500/50 text-green-700 hover:bg-green-50"
                      }`}
                      onClick={async () => {
                        await updateProduct.mutateAsync({
                          id: product.id,
                          name: product.name,
                          price: product.price,
                          description: product.description,
                          imageUrl: product.imageUrl,
                          category: product.category,
                          inStock: !product.inStock,
                        });
                        toast.success("Stock updated!");
                      }}
                      data-ocid={`admin.products.toggle.${i + 1}`}
                    >
                      {product.inStock ? "Mark Out of Stock" : "Mark In Stock"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Gallery Section ─────────────────────────────────────────────────────────
function GallerySection() {
  const { data: gallery, refetch: refetchGallery } = useGalleryPhotos();
  const addGalleryPhoto = useAddGalleryPhoto();
  const deleteGalleryPhoto = useDeleteGalleryPhoto();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [uploadProgress, setUploadProgress] = useState<string>("");

  const visiblePhotos = (gallery ?? []).filter(
    (p) => !p.caption.startsWith("__story_"),
  );

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setPendingFiles(files);
  };

  const handleUploadAll = async () => {
    if (pendingFiles.length === 0) return;
    let successCount = 0;
    const failedNames: string[] = [];
    for (let i = 0; i < pendingFiles.length; i++) {
      const file = pendingFiles[i];
      setUploadingIndex(i);
      setUploadProgress(
        `Uploading ${i + 1} of ${pendingFiles.length}: ${file.name}`,
      );
      try {
        const buf = await file.arrayBuffer();
        // Use withUploadProgress so the object-storage extension can track progress
        const blob = ExternalBlob.fromBytes(
          new Uint8Array(buf),
        ).withUploadProgress((pct) =>
          setUploadProgress(
            `Uploading ${i + 1}/${pendingFiles.length}: ${file.name} (${pct}%)`,
          ),
        );
        // caption defaults to filename so gallery items have a label
        const caption = file.name.replace(/\.[^.]+$/, "");
        await addGalleryPhoto.mutateAsync({ imageUrl: blob, caption });
        successCount++;
      } catch (err) {
        console.error("Gallery upload error:", err);
        failedNames.push(file.name);
      }
    }
    setUploadingIndex(null);
    setUploadProgress("");
    setPendingFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = "";

    if (successCount > 0) {
      toast.success(
        successCount === 1
          ? "Photo added successfully!"
          : `${successCount} photo${successCount > 1 ? "s" : ""} added successfully!`,
      );
      refetchGallery();
      // Notify customer gallery tabs to refetch immediately
      try {
        const bc = new BroadcastChannel("gallery-update");
        bc.postMessage({ type: "gallery-updated" });
        bc.close();
      } catch {
        // BroadcastChannel not supported — customer gallery will pick up via polling
      }
    }
    if (failedNames.length > 0) {
      toast.error(
        `Failed to upload: ${failedNames.slice(0, 3).join(", ")}${failedNames.length > 3 ? ` (+${failedNames.length - 3} more)` : ""}. Please try again.`,
      );
    }
  };

  const handleDelete = async (photoId: string) => {
    const confirmed = confirm("Delete this photo from gallery?");
    if (!confirmed) return;
    try {
      await deleteGalleryPhoto.mutateAsync(photoId);
      toast.success("Photo deleted.");
      refetchGallery();
      // Notify customer gallery tabs to refetch immediately
      try {
        const bc = new BroadcastChannel("gallery-update");
        bc.postMessage({ type: "gallery-updated" });
        bc.close();
      } catch {
        // BroadcastChannel not supported — customer gallery will pick up via polling
      }
    } catch {
      toast.error("Failed to delete photo. Please try again.");
    }
  };

  const isUploading = uploadingIndex !== null;

  return (
    <div data-ocid="admin.gallery.section" className="space-y-6">
      {/* Upload panel */}
      <div className="bg-card rounded-2xl p-6 shadow-soft border border-border/50">
        <h3 className="font-display text-base font-medium mb-1">Add Photos</h3>
        <p className="font-body text-sm text-muted-foreground mb-4">
          Select one or multiple images at once. They will appear on the Gallery
          page immediately after upload.
        </p>

        <div className="space-y-3">
          {/* File picker */}
          <label
            className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-border/60 hover:border-primary/40 rounded-xl py-8 px-4 cursor-pointer transition-colors bg-muted/20 hover:bg-muted/40"
            data-ocid="admin.gallery.upload_button"
          >
            <Upload className="h-7 w-7 text-muted-foreground" />
            <span className="font-body text-sm text-muted-foreground">
              {pendingFiles.length > 0
                ? `${pendingFiles.length} file${pendingFiles.length > 1 ? "s" : ""} selected`
                : "Click to select photos"}
            </span>
            <span className="font-body text-xs text-muted-foreground/70">
              Supports JPG, PNG, WEBP · Multiple files allowed
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFilesSelected}
              disabled={isUploading}
            />
          </label>

          {/* Preview of selected files */}
          {pendingFiles.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {pendingFiles.map((f, i) => (
                <div
                  key={`${f.name}-${i}`}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full font-body text-xs border ${
                    uploadingIndex === i
                      ? "bg-amber-50 border-amber-300 text-amber-700"
                      : uploadingIndex !== null && i < uploadingIndex
                        ? "bg-green-50 border-green-300 text-green-700 line-through opacity-60"
                        : "bg-muted border-border/50 text-muted-foreground"
                  }`}
                >
                  {uploadingIndex === i && (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  )}
                  {f.name.length > 20 ? `${f.name.slice(0, 18)}…` : f.name}
                </div>
              ))}
            </div>
          )}

          {/* Progress message */}
          {isUploading && uploadProgress && (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5">
              <Loader2 className="h-4 w-4 animate-spin text-amber-600 flex-shrink-0" />
              <p className="font-body text-sm text-amber-800">
                {uploadProgress}
              </p>
            </div>
          )}

          <Button
            onClick={handleUploadAll}
            disabled={pendingFiles.length === 0 || isUploading}
            className="font-body bg-foreground text-background hover:bg-foreground/90 rounded-xl"
            data-ocid="admin.gallery.submit_button"
          >
            {isUploading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Upload className="h-4 w-4 mr-2" />
            )}
            {isUploading
              ? `Uploading ${uploadingIndex! + 1}/${pendingFiles.length}…`
              : pendingFiles.length > 1
                ? `Upload ${pendingFiles.length} Photos`
                : "Upload Photo"}
          </Button>
        </div>
      </div>

      {/* Gallery grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="font-body text-sm text-muted-foreground">
            {visiblePhotos.length} photo{visiblePhotos.length !== 1 ? "s" : ""}{" "}
            in gallery
          </p>
        </div>

        {visiblePhotos.length === 0 ? (
          <div
            className="bg-card rounded-2xl shadow-soft border border-border/50 py-16 text-center"
            data-ocid="admin.gallery.empty_state"
          >
            <Image className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="font-body text-muted-foreground">
              No gallery photos yet. Upload your first photo above.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {visiblePhotos.map((photo, i) => (
              <div
                key={photo.id}
                className="relative group rounded-xl overflow-hidden aspect-square shadow-soft border border-border/30"
                data-ocid={`admin.gallery.item.${i + 1}`}
              >
                <img
                  src={photo.imageUrl.getDirectURL()}
                  alt={photo.caption || `Gallery ${i + 1}`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                  {photo.caption && (
                    <p className="text-white text-xs font-body text-center line-clamp-2">
                      {photo.caption}
                    </p>
                  )}
                  <button
                    type="button"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-body text-xs transition-colors"
                    onClick={() => handleDelete(photo.id)}
                    disabled={deleteGalleryPhoto.isPending}
                    data-ocid={`admin.gallery.delete_button.${i + 1}`}
                  >
                    <Trash2 className="h-3 w-3" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Homepage Section ────────────────────────────────────────────────────────
function HomepageSection() {
  return (
    <div data-ocid="admin.homepage.section" className="space-y-6">
      <p className="font-body text-muted-foreground text-sm">
        Manage the two story images displayed in the "Our Story" section on the
        homepage.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StoryImageSlot
          slot={1}
          label="Story Image 1"
          fallbackSrc="/assets/uploads/story-1.jpg"
          uploadOcid="admin.homepage.upload_button"
          deleteOcid="admin.homepage.delete_button"
        />
        <StoryImageSlot
          slot={2}
          label="Story Image 2"
          fallbackSrc="/assets/uploads/story-2.jpg"
          uploadOcid="admin.homepage.upload_button"
          deleteOcid="admin.homepage.delete_button"
        />
      </div>
    </div>
  );
}

// ─── Custom Orders Section ───────────────────────────────────────────────────
function CustomOrdersSection() {
  const { data: customOrders } = useCustomOrders();
  const updateCustomOrderStatus = useUpdateCustomOrderStatus();

  const sorted = [...(customOrders ?? [])].sort(
    (a, b) => Number(b.createdAt) - Number(a.createdAt),
  );

  const formatDate = (ts: bigint) => {
    const d = new Date(Number(ts) / 1_000_000);
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div data-ocid="admin.custom_orders.section" className="space-y-4">
      {sorted.length === 0 ? (
        <div
          className="bg-card rounded-2xl shadow-soft border border-border/50 py-16 text-center"
          data-ocid="admin.custom_orders.empty_state"
        >
          <ClipboardList className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="font-body text-muted-foreground">
            No custom order requests yet
          </p>
        </div>
      ) : (
        sorted.map((order, i) => (
          <div
            key={order.id}
            className="bg-card rounded-2xl shadow-soft border border-border/50 p-5 space-y-3"
            data-ocid={`admin.custom_orders.item.${i + 1}`}
          >
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <p className="font-display text-base font-semibold text-foreground">
                  {order.name}
                </p>
                <p className="font-body text-sm text-muted-foreground">
                  {order.contactNumber} · {formatDate(order.createdAt)}
                </p>
              </div>
              <StatusBadge status={order.status} />
            </div>
            <p className="font-body text-sm text-foreground leading-relaxed bg-muted/40 rounded-xl p-3">
              {order.designDescription}
            </p>
            {order.inspirationImageUrl && (
              <img
                src={order.inspirationImageUrl.getDirectURL()}
                alt="Inspiration"
                className="w-32 h-32 object-cover rounded-xl"
              />
            )}
            <div className="flex items-center gap-3">
              <Label className="font-body text-sm text-muted-foreground flex-shrink-0">
                Status:
              </Label>
              <Select
                value={order.status}
                onValueChange={(val) =>
                  updateCustomOrderStatus.mutate({ id: order.id, status: val })
                }
              >
                <SelectTrigger
                  className="w-44 rounded-xl font-body text-sm"
                  data-ocid="admin.select"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[
                    "pending",
                    "reviewed",
                    "in_progress",
                    "completed",
                    "cancelled",
                  ].map((s) => (
                    <SelectItem
                      key={s}
                      value={s}
                      className="font-body capitalize"
                    >
                      {s.replace("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// ─── Coupons Section ─────────────────────────────────────────────────────────
function CouponsSection() {
  const { data: coupons } = useCoupons();
  const createCoupon = useCreateCoupon();
  const deleteCoupon = useDeleteCoupon();
  const [showForm, setShowForm] = useState(false);
  const [code, setCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [usageLimit, setUsageLimit] = useState("100");

  // Sync backend coupons to localStorage whenever query data refreshes.
  // This ensures coupons created earlier (or from another device/session) are
  // always available at checkout without any extra steps.
  useEffect(() => {
    if (!coupons || coupons.length === 0) return;
    for (const c of coupons) {
      saveLocalCoupon({
        id: c.id,
        code: c.code,
        discountPercent: c.discountPercent,
        // Backend stores nanoseconds; localStorage needs milliseconds
        expiryDate: Number(c.expiryDate) / 1_000_000,
        usageLimit: Number(c.usageLimit),
        usedCount: Number(c.usedCount),
        isActive: c.isActive,
      });
    }
  }, [coupons]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !discountPercent || !expiryDate) return;
    const expiryMs = new Date(expiryDate).getTime();
    const expiry = BigInt(expiryMs) * 1_000_000n;
    const couponCode = code.toUpperCase();
    const discount = Number.parseFloat(discountPercent);
    const limit = Number.parseInt(usageLimit) || 100;
    const localId = `${couponCode}_${expiryMs}`;

    // Save to localStorage immediately so checkout works right away
    saveLocalCoupon({
      id: localId,
      code: couponCode,
      discountPercent: discount,
      expiryDate: expiryMs,
      usageLimit: limit,
      usedCount: 0,
      isActive: true,
    });

    // Also save to backend (best-effort)
    try {
      await createCoupon.mutateAsync({
        code: couponCode,
        discountPercent: discount,
        expiryDate: expiry,
        usageLimit: BigInt(limit),
      });
    } catch {
      // Backend save failed but localStorage save succeeded — coupons still work
    }

    toast.success(`Coupon created! Code: ${couponCode}`);
    setCode("");
    setDiscountPercent("");
    setExpiryDate("");
    setUsageLimit("100");
    setShowForm(false);
  };

  const formatDate = (ts: bigint) =>
    new Date(Number(ts) / 1_000_000).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  return (
    <div data-ocid="admin.coupons.section" className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="font-body text-muted-foreground">
          {(coupons ?? []).length} coupons
        </p>
        {!showForm && (
          <Button
            onClick={() => setShowForm(true)}
            className="font-body bg-foreground text-background hover:bg-foreground/90 rounded-xl"
            data-ocid="admin.coupons.primary_button"
          >
            <Plus className="mr-2 h-4 w-4" /> Create Coupon
          </Button>
        )}
      </div>

      {showForm && (
        <div className="bg-card rounded-2xl p-6 shadow-soft border border-border/50">
          <h3 className="font-display text-lg font-medium mb-4">New Coupon</h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="font-body text-sm mb-1.5 block">
                  Coupon Code
                </Label>
                <Input
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  required
                  placeholder="e.g. PEARL10"
                  className="rounded-xl font-body"
                  data-ocid="admin.coupons.input"
                />
              </div>
              <div>
                <Label className="font-body text-sm mb-1.5 block">
                  Discount %
                </Label>
                <Input
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(e.target.value)}
                  required
                  type="number"
                  min="1"
                  max="100"
                  placeholder="e.g. 10"
                  className="rounded-xl font-body"
                  data-ocid="admin.coupons.input"
                />
              </div>
              <div>
                <Label className="font-body text-sm mb-1.5 block">
                  Expiry Date
                </Label>
                <Input
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  required
                  type="datetime-local"
                  className="rounded-xl font-body"
                  data-ocid="admin.coupons.input"
                />
              </div>
              <div>
                <Label className="font-body text-sm mb-1.5 block">
                  Usage Limit
                </Label>
                <Input
                  value={usageLimit}
                  onChange={(e) => setUsageLimit(e.target.value)}
                  type="number"
                  min="1"
                  placeholder="100"
                  className="rounded-xl font-body"
                  data-ocid="admin.coupons.input"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={createCoupon.isPending}
                className="font-body bg-foreground text-background hover:bg-foreground/90 rounded-xl"
                data-ocid="admin.coupons.submit_button"
              >
                {createCoupon.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Create Coupon
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
                className="font-body rounded-xl"
                data-ocid="admin.coupons.cancel_button"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {(coupons ?? []).length === 0 ? (
        <div
          className="bg-card rounded-2xl py-16 text-center shadow-soft border border-border/50"
          data-ocid="admin.coupons.empty_state"
        >
          <Tag className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="font-body text-muted-foreground">No coupons yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {(coupons ?? []).map((coupon, i) => (
            <div
              key={coupon.id}
              className="bg-card rounded-2xl p-5 shadow-soft border border-border/50 flex items-center justify-between flex-wrap gap-4"
              data-ocid={`admin.coupons.item.${i + 1}`}
            >
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-mono font-bold text-foreground text-lg">
                    {coupon.code}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-body font-medium border ${coupon.isActive ? "bg-green-100 text-green-700 border-green-200" : "bg-gray-100 text-gray-700 border-gray-200"}`}
                  >
                    {coupon.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <p className="font-body text-sm text-muted-foreground">
                  {coupon.discountPercent}% off · Expires{" "}
                  {formatDate(coupon.expiryDate)} · Used{" "}
                  {Number(coupon.usedCount)}/{Number(coupon.usageLimit)}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl font-body text-destructive border-destructive/30 hover:bg-destructive/10"
                onClick={() => {
                  // Remove from localStorage by matching code
                  const locals = getLocalCoupons();
                  const local = locals.find((c) => c.code === coupon.code);
                  if (local) deleteLocalCoupon(local.id);
                  deleteCoupon.mutate(coupon.id);
                  toast.success("Coupon deleted.");
                }}
                data-ocid={`admin.coupons.delete_button.${i + 1}`}
              >
                <Trash2 className="h-4 w-4 mr-1.5" /> Delete
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Promo Banner Section ─────────────────────────────────────────────────────
function PromoBannerSection() {
  const setPromoBanner = useSetPromoBanner();
  const { data: backendBanner } = useGetPromoBanner();
  const [text, setText] = useState(
    "🌸 Summer Sale! Up to 20% off on all bracelets",
  );
  const [subText, setSubText] = useState("Use code PEARL20 at checkout");
  const [endDate, setEndDate] = useState("");
  const [bgColor, setBgColor] = useState("gold");

  // Sync backend banner into form fields + localStorage on every query refresh.
  // This covers banners created in prior sessions or on another device.
  useEffect(() => {
    if (!backendBanner) return;
    setText(backendBanner.text);
    setSubText(backendBanner.subText);
    setBgColor(backendBanner.bgColor);
    // Convert nanoseconds back to datetime-local string for the input
    const ms = Number(backendBanner.endDate) / 1_000_000;
    if (ms > Date.now()) {
      const dt = new Date(ms);
      // datetime-local format: YYYY-MM-DDTHH:MM
      const pad = (n: number) => String(n).padStart(2, "0");
      const local = `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
      setEndDate(local);
    }
    // Also keep localStorage in sync with the latest backend data
    localStorage.setItem(
      "pearlfect_promo_banner",
      JSON.stringify({
        text: backendBanner.text,
        subText: backendBanner.subText,
        endDateNs: backendBanner.endDate.toString(),
        bgColor: backendBanner.bgColor,
      }),
    );
  }, [backendBanner]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!endDate) {
      toast.error("Please set an end date.");
      return;
    }
    const endDateMs = new Date(endDate).getTime();
    const endDateNs = BigInt(endDateMs) * 1_000_000n;
    // Write to localStorage immediately so the banner appears on the site
    // the moment the admin saves — no waiting for backend round-trip.
    localStorage.setItem(
      "pearlfect_promo_banner",
      JSON.stringify({
        text,
        subText,
        endDateNs: endDateNs.toString(),
        bgColor,
      }),
    );
    try {
      await setPromoBanner.mutateAsync({
        text,
        subText,
        endDate: endDateNs,
        bgColor,
      });
      toast.success("Banner saved!");
    } catch {
      toast.error("Failed to save banner to backend, but it's saved locally.");
    }
  };

  const COLOR_OPTIONS = [
    { value: "gold", label: "Gold", cls: "bg-amber-400" },
    { value: "pink", label: "Pink", cls: "bg-pink-400" },
    { value: "rose", label: "Rose", cls: "bg-rose-500" },
    { value: "green", label: "Green", cls: "bg-emerald-600" },
    { value: "blue", label: "Blue", cls: "bg-blue-600" },
    { value: "dark", label: "Dark", cls: "bg-gray-900" },
  ];

  return (
    <div data-ocid="admin.promo.section" className="space-y-6">
      <p className="font-body text-sm text-muted-foreground">
        Set a site-wide promotional banner that appears at the top of every
        page. The banner will automatically hide after the end date.
      </p>
      <div className="bg-card rounded-2xl p-6 shadow-soft border border-border/50 max-w-2xl">
        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <Label className="font-body text-sm mb-1.5 block">
              Banner Text
            </Label>
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              required
              placeholder="e.g. 🌸 Summer Sale! 20% off everything"
              className="rounded-xl font-body"
              data-ocid="admin.promo.input"
            />
          </div>
          <div>
            <Label className="font-body text-sm mb-1.5 block">
              Sub Text (optional)
            </Label>
            <Input
              value={subText}
              onChange={(e) => setSubText(e.target.value)}
              placeholder="e.g. Use code PEARL20"
              className="rounded-xl font-body"
              data-ocid="admin.promo.input"
            />
          </div>
          <div>
            <Label className="font-body text-sm mb-1.5 block">
              End Date & Time
            </Label>
            <Input
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
              className="rounded-xl font-body"
              data-ocid="admin.promo.input"
            />
          </div>
          <div>
            <Label className="font-body text-sm mb-2 block">
              Background Color
            </Label>
            <div className="flex gap-2 flex-wrap">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setBgColor(c.value)}
                  className={`w-8 h-8 rounded-full ${c.cls} border-2 transition-all ${bgColor === c.value ? "border-foreground scale-110" : "border-transparent"}`}
                  aria-label={c.label}
                  data-ocid="admin.promo.toggle"
                />
              ))}
            </div>
          </div>

          {/* Preview */}
          {text && endDate && (
            <div className="rounded-xl overflow-hidden">
              <p className="font-body text-xs text-muted-foreground mb-1">
                Preview:
              </p>
              <div
                className={`py-2 px-4 text-center text-sm font-body text-white ${COLOR_OPTIONS.find((c) => c.value === bgColor)?.cls ?? "bg-amber-500"}`}
              >
                <span className="font-semibold">{text}</span>
                {subText && <span className="ml-2 opacity-90">{subText}</span>}
              </div>
            </div>
          )}

          <Button
            type="submit"
            disabled={setPromoBanner.isPending}
            className="w-full font-body bg-foreground text-background hover:bg-foreground/90 rounded-xl"
            data-ocid="admin.promo.submit_button"
          >
            {setPromoBanner.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Megaphone className="h-4 w-4 mr-2" />
            )}
            Save Banner
          </Button>
        </form>
      </div>
    </div>
  );
}

// ─── Newsletter Section ───────────────────────────────────────────────────────
function NewsletterSection() {
  const { data: subscribers } = useNewsletterSubscribers();

  const formatDate = (ts: bigint) =>
    new Date(Number(ts) / 1_000_000).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  return (
    <div data-ocid="admin.newsletter.section" className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="font-body text-muted-foreground">
          {(subscribers ?? []).length} subscribers
        </p>
      </div>
      {(subscribers ?? []).length === 0 ? (
        <div
          className="bg-card rounded-2xl py-16 text-center shadow-soft border border-border/50"
          data-ocid="admin.newsletter.empty_state"
        >
          <Mail className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="font-body text-muted-foreground">No subscribers yet</p>
        </div>
      ) : (
        <div className="bg-card rounded-2xl shadow-soft border border-border/50 overflow-hidden">
          <div className="divide-y divide-border/50">
            {(subscribers ?? []).map((sub, i) => (
              <div
                key={sub.email}
                className="px-5 py-3 flex items-center justify-between"
                data-ocid={`admin.newsletter.item.${i + 1}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0">
                    <Mail className="h-3.5 w-3.5 text-rose-500" />
                  </div>
                  <span className="font-body text-sm text-foreground">
                    {sub.email}
                  </span>
                </div>
                <span className="font-body text-xs text-muted-foreground">
                  {formatDate(sub.subscribedAt)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Settings Section ────────────────────────────────────────────────────────
function SettingsSection() {
  const ADMIN_PASSWORD_DEFAULT = "pearl2024";
  const rows = [
    { label: "Store Name", value: "The Pearlfect Store" },
    { label: "Instagram", value: "@the.pearlfect.store" },
    { label: "Email", value: "thepearlfectstore@gmail.com" },
    { label: "UPI ID", value: "suhanixoxo137-1@oksbi" },
    { label: "Product Management", value: "/manage-products (PIN: pearl)" },
    {
      label: "Admin Emails",
      value: "suhanij130713@gmail.com, suhanijain137@gmail.com",
    },
  ];

  const [backupEmail, setBackupEmail] = useState(
    () => localStorage.getItem("pearlfect_backup_email") || "",
  );
  const [backupEmailInput, setBackupEmailInput] = useState(
    () => localStorage.getItem("pearlfect_backup_email") || "",
  );
  const [savingBackup, setSavingBackup] = useState(false);

  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [passError, setPassError] = useState("");
  const [passSuccess, setPassSuccess] = useState("");

  const handleSaveBackupEmail = () => {
    setSavingBackup(true);
    setTimeout(() => {
      localStorage.setItem("pearlfect_backup_email", backupEmailInput.trim());
      setBackupEmail(backupEmailInput.trim());
      setSavingBackup(false);
      toast.success("Backup email saved.");
    }, 400);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPassError("");
    setPassSuccess("");
    const stored =
      localStorage.getItem("pearlfect_admin_password") ||
      ADMIN_PASSWORD_DEFAULT;
    if (currentPass !== stored) {
      setPassError("Current password is incorrect.");
      return;
    }
    if (newPass.length < 6) {
      setPassError("New password must be at least 6 characters.");
      return;
    }
    if (newPass !== confirmPass) {
      setPassError("New passwords do not match.");
      return;
    }
    localStorage.setItem("pearlfect_admin_password", newPass);
    setPassSuccess("Password updated successfully.");
    setCurrentPass("");
    setNewPass("");
    setConfirmPass("");
  };

  return (
    <div data-ocid="admin.settings.section" className="space-y-6 max-w-2xl">
      {/* Store info */}
      <div className="bg-card rounded-2xl shadow-soft border border-border/50 overflow-hidden">
        {rows.map((row, i) => (
          <div
            key={row.label}
            className={`px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-6 ${
              i < rows.length - 1 ? "border-b border-border/50" : ""
            }`}
          >
            <p className="font-body text-xs text-muted-foreground uppercase tracking-widest sm:w-44 flex-shrink-0">
              {row.label}
            </p>
            <p className="font-body text-foreground font-medium">{row.value}</p>
          </div>
        ))}
      </div>

      {/* Backup Email */}
      <div className="bg-card rounded-2xl shadow-soft border border-border/50 p-6">
        <h3 className="font-display text-lg font-semibold text-foreground mb-1">
          Backup Email
        </h3>
        <p className="font-body text-sm text-muted-foreground mb-4">
          Used for account recovery if you forget your password.
          {backupEmail && (
            <span className="ml-1 text-green-600 font-medium">
              Current: {backupEmail}
            </span>
          )}
        </p>
        <div className="flex gap-2">
          <Input
            type="email"
            placeholder="backup@email.com"
            value={backupEmailInput}
            onChange={(e) => setBackupEmailInput(e.target.value)}
            className="rounded-xl font-body flex-1"
          />
          <Button
            onClick={handleSaveBackupEmail}
            disabled={savingBackup || !backupEmailInput.trim()}
            className="rounded-xl font-body bg-foreground text-background hover:bg-foreground/90 flex-shrink-0"
          >
            {savingBackup ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Save"
            )}
          </Button>
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-card rounded-2xl shadow-soft border border-border/50 p-6">
        <h3 className="font-display text-lg font-semibold text-foreground mb-1">
          Change Password
        </h3>
        <p className="font-body text-sm text-muted-foreground mb-4">
          Update your admin login password.
        </p>
        <form onSubmit={handleChangePassword} className="space-y-3">
          <div className="space-y-1.5">
            <Label className="font-body text-sm">Current Password</Label>
            <Input
              type="password"
              placeholder="Current password"
              value={currentPass}
              onChange={(e) => setCurrentPass(e.target.value)}
              className="rounded-xl font-body"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label className="font-body text-sm">New Password</Label>
            <Input
              type="password"
              placeholder="New password (min 6 chars)"
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              className="rounded-xl font-body"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label className="font-body text-sm">Confirm New Password</Label>
            <Input
              type="password"
              placeholder="Confirm new password"
              value={confirmPass}
              onChange={(e) => setConfirmPass(e.target.value)}
              className="rounded-xl font-body"
              required
            />
          </div>
          {passError && (
            <p className="font-body text-sm text-red-500">{passError}</p>
          )}
          {passSuccess && (
            <p className="font-body text-sm text-green-600">{passSuccess}</p>
          )}
          <Button
            type="submit"
            className="rounded-xl font-body bg-foreground text-background hover:bg-foreground/90"
          >
            <KeyRound className="mr-2 h-4 w-4" />
            Update Password
          </Button>
        </form>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-2xl px-6 py-4">
        <p className="font-body text-sm text-amber-800">
          <span className="font-semibold">Tip:</span> All product and gallery
          changes take effect immediately. Use the Products section to add,
          edit, or remove items at any time.
        </p>
      </div>
    </div>
  );
}

// ─── Tracking Section ─────────────────────────────────────────────────────────

/** Status badge with consistent color coding for tracking statuses */
function TrackingStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    processing: "bg-blue-100 text-blue-700 border-blue-200",
    awaiting_shipment: "bg-amber-100 text-amber-700 border-amber-200",
    shipped: "bg-purple-100 text-purple-700 border-purple-200",
    out_for_delivery: "bg-orange-100 text-orange-700 border-orange-200",
    delivered: "bg-green-100 text-green-700 border-green-200",
    pending: "bg-slate-100 text-slate-600 border-slate-200",
    cancelled: "bg-red-100 text-red-700 border-red-200",
  };
  const cls = map[status] ?? "bg-slate-100 text-slate-600 border-slate-200";
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-body font-medium border capitalize ${cls}`}
    >
      {status.split("_").join(" ")}
    </span>
  );
}

const TRACKING_STATUSES = [
  { value: "processing", label: "Processing" },
  { value: "awaiting_shipment", label: "Awaiting Shipment" },
  { value: "shipped", label: "Shipped" },
  { value: "out_for_delivery", label: "Out for Delivery" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

function TrackingHistoryLog({
  orderId,
  entries,
  onRefresh,
}: {
  orderId: string;
  entries: OrderHistoryEntry[];
  onRefresh: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const editEntry = useEditTrackingEntry();
  const deleteEntry = useDeleteTrackingEntry();

  const formatTs = (ts: number) =>
    new Date(ts).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  if (entries.length === 0) {
    return (
      <p
        className="font-body text-xs text-muted-foreground italic"
        data-ocid="admin.tracking.history.empty"
      >
        No history yet — save an update above to start tracking.
      </p>
    );
  }

  return (
    <div className="mt-1">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-xs font-body text-muted-foreground hover:text-foreground transition-colors"
        data-ocid="admin.tracking.history_toggle"
      >
        <Clock className="h-3.5 w-3.5" />
        View history ({entries.length} update{entries.length !== 1 ? "s" : ""})
        {open ? (
          <ChevronUp className="h-3.5 w-3.5" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5" />
        )}
      </button>
      {open && (
        <div className="mt-3 space-y-2 border-l-2 border-rose-200 pl-4">
          {[...entries].reverse().map((entry) => (
            <div
              key={entry.id}
              className="relative group"
              data-ocid={`admin.tracking.history.item.${entry.id}`}
            >
              {editingId === entry.id ? (
                <div className="bg-rose-50/60 border border-rose-200/60 rounded-xl p-3 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs text-muted-foreground">
                      {formatTs(entry.timestamp)}
                    </span>
                    <TrackingStatusBadge status={entry.status} />
                  </div>
                  <Textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    rows={2}
                    className="rounded-lg font-body text-xs resize-none"
                    placeholder="Update message..."
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="rounded-lg font-body text-xs bg-rose-500 hover:bg-rose-600 text-white h-7 px-3"
                      disabled={editEntry.isPending}
                      onClick={async () => {
                        await editEntry.mutateAsync({
                          orderId,
                          entryId: entry.id,
                          message: editText,
                        });
                        setEditingId(null);
                        onRefresh();
                        toast.success("Message updated.");
                      }}
                    >
                      <Save className="h-3 w-3 mr-1" /> Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-lg font-body text-xs h-7 px-3"
                      onClick={() => setEditingId(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="bg-rose-50/40 border border-rose-100 rounded-xl p-3">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs text-muted-foreground">
                        {formatTs(entry.timestamp)}
                      </span>
                      <TrackingStatusBadge status={entry.status} />
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                      <button
                        type="button"
                        className="p-1 rounded hover:bg-rose-100 transition-colors text-muted-foreground hover:text-rose-600"
                        onClick={() => {
                          setEditingId(entry.id);
                          setEditText(entry.message);
                        }}
                        aria-label="Edit entry"
                        data-ocid={`admin.tracking.history.edit_button.${entry.id}`}
                      >
                        <Edit className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        className="p-1 rounded hover:bg-red-100 transition-colors text-muted-foreground hover:text-red-600"
                        onClick={async () => {
                          if (!confirm("Delete this tracking history entry?"))
                            return;
                          await deleteEntry.mutateAsync({
                            orderId,
                            entryId: entry.id,
                          });
                          onRefresh();
                          toast.success("Entry deleted.");
                        }}
                        aria-label="Delete entry"
                        data-ocid={`admin.tracking.history.delete_button.${entry.id}`}
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  {entry.message ? (
                    <p className="font-body text-xs text-foreground leading-relaxed">
                      {entry.message}
                    </p>
                  ) : (
                    <p className="font-body text-xs text-muted-foreground italic">
                      No message
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TrackingCard({
  order,
  index,
}: { order: ExtendedOrder; index: number }) {
  const updateTracking = useUpdateTrackingStatus();
  const queryClient = useQueryClient();

  const [selectedStatus, setSelectedStatus] = useState(
    order.status === "pending" ? "processing" : order.status,
  );
  const [noteMessage, setNoteMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  const formatDateTime = (ts: number) =>
    new Date(ts).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const handleCopy = () => {
    if (!order.trackingNumber) return;
    navigator.clipboard.writeText(order.trackingNumber).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleSave = async () => {
    if (!order.trackingNumber) return;
    setSaving(true);
    try {
      await updateTracking.mutateAsync({
        orderId: order.id,
        trackingNumber: order.trackingNumber,
        status: selectedStatus,
        message: noteMessage,
      });
      queryClient.invalidateQueries({ queryKey: ["extendedOrders"] });
      toast.success("Tracking status updated successfully!");
      setNoteMessage("");
    } finally {
      setSaving(false);
    }
  };

  const hasChanged =
    selectedStatus !== order.status || noteMessage.trim().length > 0;

  return (
    <div
      className="bg-card rounded-2xl shadow-soft border border-border/50 p-5 space-y-4"
      data-ocid={`admin.tracking.card.${index}`}
    >
      {/* Header: Tracking ID + customer info */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-1.5 min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-full">
              <Truck className="h-3.5 w-3.5 text-rose-500 flex-shrink-0" />
              <span className="font-mono text-sm font-bold text-rose-700 tracking-wide">
                {order.trackingNumber}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="p-0.5 rounded hover:bg-rose-100 transition-colors text-rose-400 hover:text-rose-600 flex-shrink-0"
                aria-label="Copy tracking ID"
                data-ocid={`admin.tracking.copy_button.${index}`}
              >
                {copied ? (
                  <span className="font-body text-[10px] text-green-600 font-medium">
                    Copied!
                  </span>
                ) : (
                  <svg
                    className="h-3.5 w-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <rect
                      x="9"
                      y="9"
                      width="13"
                      height="13"
                      rx="2"
                      ry="2"
                      strokeWidth="2"
                    />
                    <path
                      d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"
                      strokeWidth="2"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
          <div>
            <p className="font-display text-sm font-semibold text-foreground">
              {order.customerName}
            </p>
            <p className="font-body text-xs text-muted-foreground">
              Order #{order.id} · {order.phone}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <TrackingStatusBadge status={order.status} />
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="h-3 w-3 flex-shrink-0" />
            <span className="font-body text-[11px]">
              Last updated:{" "}
              <span className="text-foreground font-medium">
                {formatDateTime(order.lastUpdatedAt)}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Status + Message Update */}
      <div className="bg-gradient-to-br from-rose-50/60 to-pink-50/40 border border-rose-100 rounded-xl p-4 space-y-3">
        <p className="font-body text-xs font-semibold text-rose-700 uppercase tracking-wider">
          Update Status
        </p>

        <div>
          <Label className="font-body text-xs text-muted-foreground mb-1.5 block">
            New Status
          </Label>
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger
              className="w-full sm:w-52 rounded-xl font-body text-sm bg-white border-rose-200 focus:border-rose-400"
              data-ocid={`admin.tracking.status_select.${index}`}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TRACKING_STATUSES.map((s) => (
                <SelectItem key={s.value} value={s.value} className="font-body">
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="font-body text-xs text-muted-foreground flex items-center gap-1.5">
            <MessageSquare className="h-3.5 w-3.5" />
            Admin Note / Custom Update
          </Label>
          <Textarea
            value={noteMessage}
            onChange={(e) => setNoteMessage(e.target.value)}
            placeholder="e.g. Delayed due to courier, Delivered to neighbor, Customer requested hold..."
            rows={2}
            className="rounded-xl font-body text-sm resize-none bg-white border-rose-200 focus:border-rose-400"
            data-ocid={`admin.tracking.message_input.${index}`}
          />
        </div>

        <Button
          onClick={handleSave}
          disabled={saving || !hasChanged}
          className="font-body bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-sm h-9 disabled:opacity-50 disabled:cursor-not-allowed"
          data-ocid={`admin.tracking.save_button.${index}`}
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save Update
        </Button>
        {!hasChanged && (
          <p className="font-body text-[11px] text-muted-foreground">
            Change the status or add a note to enable saving.
          </p>
        )}
      </div>

      {/* History log */}
      <TrackingHistoryLog
        orderId={order.id}
        entries={order.updateHistory}
        onRefresh={() =>
          queryClient.invalidateQueries({ queryKey: ["extendedOrders"] })
        }
      />
    </div>
  );
}

function TrackingSection() {
  const { data: extendedOrders, refetch } = useExtendedOrders();
  const [search, setSearch] = useState("");

  const ordersWithTracking = (extendedOrders ?? [])
    .filter((o) => !!o.trackingNumber)
    .sort((a, b) => b.lastUpdatedAt - a.lastUpdatedAt);

  const filtered = search.trim()
    ? ordersWithTracking.filter(
        (o) =>
          o.trackingNumber?.toLowerCase().includes(search.toLowerCase()) ||
          o.customerName.toLowerCase().includes(search.toLowerCase()) ||
          o.id.toLowerCase().includes(search.toLowerCase()),
      )
    : ordersWithTracking;

  return (
    <div data-ocid="admin.tracking.section" className="space-y-6">
      {/* Summary row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: "Total Tracked",
            value: ordersWithTracking.length,
            color: "bg-rose-50 text-rose-700 border-rose-200",
          },
          {
            label: "In Transit",
            value: ordersWithTracking.filter(
              (o) => o.status === "shipped" || o.status === "out_for_delivery",
            ).length,
            color: "bg-purple-50 text-purple-700 border-purple-200",
          },
          {
            label: "Delivered",
            value: ordersWithTracking.filter((o) => o.status === "delivered")
              .length,
            color: "bg-green-50 text-green-700 border-green-200",
          },
          {
            label: "Processing",
            value: ordersWithTracking.filter(
              (o) =>
                o.status === "processing" || o.status === "awaiting_shipment",
            ).length,
            color: "bg-blue-50 text-blue-700 border-blue-200",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`rounded-xl border px-4 py-3 ${stat.color}`}
          >
            <p className="font-body text-xs opacity-80 mb-0.5">{stat.label}</p>
            <p className="font-display text-2xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Search + refresh */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" strokeWidth="2" />
            <path d="M21 21l-4.35-4.35" strokeWidth="2" />
          </svg>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by tracking ID, customer, or order..."
            className="pl-9 rounded-xl font-body text-sm"
            data-ocid="admin.tracking.search_input"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          className="rounded-xl font-body text-xs flex-shrink-0"
          data-ocid="admin.tracking.refresh_button"
        >
          Refresh
        </Button>
      </div>

      {ordersWithTracking.length === 0 ? (
        <div
          className="bg-card rounded-2xl shadow-soft border border-border/50 py-20 text-center"
          data-ocid="admin.tracking.empty_state"
        >
          <Truck className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="font-display text-lg font-medium text-foreground mb-2">
            No tracking IDs yet
          </p>
          <p className="font-body text-sm text-muted-foreground max-w-xs mx-auto">
            Tracking IDs are assigned to orders from the Orders tab. Once
            assigned, they'll appear here for management.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="bg-card rounded-2xl shadow-soft border border-border/50 py-12 text-center"
          data-ocid="admin.tracking.no_results"
        >
          <p className="font-body text-muted-foreground">
            No results for "{search}"
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="font-body text-xs text-muted-foreground">
            Showing {filtered.length} of {ordersWithTracking.length} tracked
            orders
          </p>
          {filtered.map((order, i) => (
            <TrackingCard key={order.id} order={order} index={i + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Nav items ────────────────────────────────────────────────────────────────
const NAV_ITEMS: {
  id: Section;
  label: string;
  icon: React.ElementType;
  ocid: string;
}[] = [
  {
    id: "overview",
    label: "Overview",
    icon: LayoutDashboard,
    ocid: "admin.nav.overview_link",
  },
  {
    id: "orders",
    label: "Orders",
    icon: ShoppingBag,
    ocid: "admin.nav.orders_link",
  },
  {
    id: "tracking",
    label: "Tracking",
    icon: Truck,
    ocid: "admin.nav.tracking_link",
  },
  {
    id: "products",
    label: "Products",
    icon: Package,
    ocid: "admin.nav.products_link",
  },
  {
    id: "gallery",
    label: "Gallery",
    icon: Image,
    ocid: "admin.nav.gallery_link",
  },
  {
    id: "homepage",
    label: "Homepage",
    icon: Home,
    ocid: "admin.nav.homepage_link",
  },
  {
    id: "custom-orders",
    label: "Custom Orders",
    icon: ClipboardList,
    ocid: "admin.nav.custom_orders_link",
  },
  {
    id: "coupons",
    label: "Coupons",
    icon: Tag,
    ocid: "admin.nav.coupons_link",
  },
  {
    id: "promo-banner",
    label: "Promo Banner",
    icon: Megaphone,
    ocid: "admin.nav.promo_banner_link",
  },
  {
    id: "newsletter",
    label: "Newsletter",
    icon: Mail,
    ocid: "admin.nav.newsletter_link",
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    ocid: "admin.nav.settings_link",
  },
];

const SECTION_TITLES: Record<Section, string> = {
  overview: "Overview",
  orders: "Orders",
  tracking: "Tracking Management",
  products: "Products",
  gallery: "Gallery",
  homepage: "Homepage Images",
  "custom-orders": "Custom Orders",
  coupons: "Coupons & Discounts",
  "promo-banner": "Promotional Banner",
  newsletter: "Newsletter Subscribers",
  settings: "Settings",
};

const ADMIN_EMAILS = ["suhanij130713@gmail.com", "suhanijain137@gmail.com"];
const ADMIN_PASSWORD = "pearl2024";
const SESSION_KEY = "pearlfect_admin_session";

// ─── Main AdminPage ───────────────────────────────────────────────────────────
export function AdminPage() {
  const [activeSection, setActiveSection] = useState<Section>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem(SESSION_KEY) === "true";
  });
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  // ─── Auth: not logged in ───────────────────────────────────────────────────
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotAnswer, setForgotAnswer] = useState("");
  const [forgotError, setForgotError] = useState("");
  const [revealedPassword, setRevealedPassword] = useState<string | null>(null);
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  if (!isLoggedIn) {
    const handleLogin = (e: React.FormEvent) => {
      e.preventDefault();
      setLoginError("");
      setLoggingIn(true);
      setTimeout(() => {
        const emailOk = ADMIN_EMAILS.includes(loginEmail.trim().toLowerCase());
        const passOk =
          loginPassword ===
          (localStorage.getItem("pearlfect_admin_password") || ADMIN_PASSWORD);
        if (emailOk && passOk) {
          localStorage.setItem(SESSION_KEY, "true");
          setIsLoggedIn(true);
          toast.success("Welcome to your admin dashboard!");
        } else {
          setLoginError("Incorrect email or password. Please try again.");
        }
        setLoggingIn(false);
      }, 500);
    };

    const handleForgot = (e: React.FormEvent) => {
      e.preventDefault();
      setForgotError("");
      const emailOk = ADMIN_EMAILS.includes(forgotEmail.trim().toLowerCase());
      if (!emailOk) {
        setForgotError("This email is not registered as an admin.");
        return;
      }
      const correctAnswer = "the pearlfect store";
      if (forgotAnswer.trim().toLowerCase() !== correctAnswer) {
        setForgotError("Incorrect answer. Hint: it's your store name.");
        return;
      }
      const currentPassword =
        localStorage.getItem("pearlfect_admin_password") || ADMIN_PASSWORD;
      const backupEmail = localStorage.getItem("pearlfect_backup_email") || "";
      setRevealedPassword(
        backupEmail
          ? `Your current password is: ${currentPassword}\n\nIf you want to update it, log in and go to Settings.\n\nBackup email on file: ${backupEmail}`
          : `Your current password is: ${currentPassword}\n\nIf you want to update it, log in and go to Settings.`,
      );
    };

    if (forgotMode) {
      return (
        <main className="min-h-screen flex items-center justify-center px-4 bg-muted/20">
          <div className="text-center max-w-sm w-full">
            <div className="w-20 h-20 rounded-full bg-card shadow-soft flex items-center justify-center mx-auto mb-6 border border-border/50">
              <KeyRound className="h-8 w-8 text-amber-500" />
            </div>
            <h1 className="font-display text-3xl font-semibold text-foreground mb-2">
              Forgot Password
            </h1>
            <p className="font-body text-muted-foreground mb-8">
              Verify your identity to retrieve your password.
            </p>

            {revealedPassword ? (
              <div className="space-y-4 text-left">
                <div className="bg-green-50 border border-green-200 rounded-2xl px-6 py-4">
                  {revealedPassword.split("\n").map((line) => (
                    <p
                      key={line || "empty"}
                      className="font-body text-sm text-green-800 first:font-semibold"
                    >
                      {line}
                    </p>
                  ))}
                </div>
                <Button
                  onClick={() => {
                    setForgotMode(false);
                    setRevealedPassword(null);
                    setForgotEmail("");
                    setForgotAnswer("");
                  }}
                  className="w-full rounded-full font-body bg-foreground text-background hover:bg-foreground/90"
                >
                  Back to Login
                </Button>
              </div>
            ) : (
              <form onSubmit={handleForgot} className="space-y-3 text-left">
                <div className="space-y-1.5">
                  <Label className="font-body text-sm">Admin Email</Label>
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="rounded-xl font-body"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="font-body text-sm">Security Question</Label>
                  <p className="font-body text-xs text-muted-foreground italic">
                    What is the name of your store?
                  </p>
                  <Input
                    type="text"
                    placeholder="Your store name"
                    value={forgotAnswer}
                    onChange={(e) => setForgotAnswer(e.target.value)}
                    className="rounded-xl font-body"
                    required
                  />
                </div>
                {forgotError && (
                  <p className="font-body text-sm text-red-500 text-center">
                    {forgotError}
                  </p>
                )}
                <Button
                  type="submit"
                  className="w-full rounded-full font-body bg-foreground text-background hover:bg-foreground/90 mt-2"
                >
                  <KeyRound className="mr-2 h-4 w-4" />
                  Verify &amp; Reveal Password
                </Button>
                <button
                  type="button"
                  onClick={() => {
                    setForgotMode(false);
                    setForgotError("");
                  }}
                  className="w-full font-body text-sm text-muted-foreground hover:text-foreground transition-colors text-center mt-1"
                >
                  Back to Login
                </button>
              </form>
            )}
          </div>
        </main>
      );
    }

    return (
      <main className="min-h-screen flex items-center justify-center px-4 bg-muted/20">
        <div className="text-center max-w-sm w-full">
          <div className="w-20 h-20 rounded-full bg-card shadow-soft flex items-center justify-center mx-auto mb-6 border border-border/50">
            <Gem className="h-8 w-8 text-amber-500" />
          </div>
          <h1 className="font-display text-3xl font-semibold text-foreground mb-2">
            Admin Login
          </h1>
          <p className="font-body text-muted-foreground mb-8">
            Sign in to manage The Pearlfect Store.
          </p>
          <form onSubmit={handleLogin} className="space-y-3 text-left">
            <div className="space-y-1.5">
              <Label htmlFor="admin-email" className="font-body text-sm">
                Email
              </Label>
              <Input
                id="admin-email"
                type="email"
                placeholder="your@email.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="rounded-xl font-body"
                required
                data-ocid="admin.email_input"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="admin-password" className="font-body text-sm">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="admin-password"
                  type={showLoginPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="rounded-xl font-body pr-10"
                  required
                  data-ocid="admin.password_input"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showLoginPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            {loginError && (
              <p className="font-body text-sm text-red-500 text-center">
                {loginError}
              </p>
            )}
            <Button
              type="submit"
              disabled={loggingIn}
              className="w-full rounded-full font-body bg-foreground text-background hover:bg-foreground/90 mt-2"
              data-ocid="admin.primary_button"
            >
              {loggingIn ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <LogIn className="mr-2 h-4 w-4" />
              )}
              Sign In
            </Button>
            <button
              type="button"
              onClick={() => {
                setForgotMode(true);
                setLoginError("");
              }}
              className="w-full font-body text-sm text-muted-foreground hover:text-foreground transition-colors text-center mt-1"
            >
              Forgot your password?
            </button>
          </form>
        </div>
      </main>
    );
  }

  const handleLogout = () => {
    localStorage.removeItem(SESSION_KEY);
    setIsLoggedIn(false);
    toast.success("Logged out successfully.");
  };

  // ─── Dashboard ─────────────────────────────────────────────────────────────
  const navigate = (section: Section) => {
    setActiveSection(section);
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen flex bg-muted/20">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          onKeyDown={(e) => e.key === "Escape" && setSidebarOpen(false)}
          role="presentation"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-60 bg-card border-r border-border/60 flex flex-col z-30 transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:static lg:flex`}
      >
        {/* Brand */}
        <div className="px-5 py-6 border-b border-border/50">
          <div className="flex items-center gap-2.5 mb-0.5">
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
              <Gem className="h-4 w-4 text-amber-600" />
            </div>
            <span className="font-display text-sm font-semibold text-foreground leading-tight">
              The Pearlfect Store
            </span>
          </div>
          <p className="font-body text-xs text-muted-foreground ml-10">
            Admin Panel
          </p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = activeSection === item.id;
            return (
              <button
                type="button"
                key={item.id}
                onClick={() => navigate(item.id)}
                data-ocid={item.ocid}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-body text-sm transition-all ${
                  active
                    ? "bg-amber-50 text-amber-700 font-medium"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon
                  className={`h-4 w-4 flex-shrink-0 ${active ? "text-amber-600" : ""}`}
                />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Admin indicator */}
        <div className="px-5 py-4 border-t border-border/50 space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400" />
            <span className="font-body text-xs text-muted-foreground">
              Logged in as Admin
            </span>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full text-left font-body text-xs text-red-400 hover:text-red-600 transition-colors px-1"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-0">
        {/* Top bar */}
        <header className="sticky top-0 z-10 bg-card/80 backdrop-blur-sm border-b border-border/50 px-4 sm:px-6 py-4 flex items-center gap-4">
          <button
            type="button"
            className="lg:hidden p-2 rounded-xl hover:bg-muted transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5 text-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="font-display text-xl font-semibold text-foreground">
              {SECTION_TITLES[activeSection]}
            </h1>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 rounded-full font-body text-xs font-medium border border-amber-200">
            <Gem className="h-3 w-3" /> Admin
          </span>
          {sidebarOpen && (
            <button
              type="button"
              className="lg:hidden p-2 rounded-xl hover:bg-muted"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </header>

        {/* Content */}
        <main className="flex-1 px-4 sm:px-6 py-6 overflow-y-auto">
          {activeSection === "overview" && (
            <OverviewSection onNavigate={navigate} />
          )}
          {activeSection === "orders" && <OrdersSection />}
          {activeSection === "tracking" && <TrackingSection />}
          {activeSection === "products" && <ProductsSection />}
          {activeSection === "gallery" && <GallerySection />}
          {activeSection === "homepage" && <HomepageSection />}
          {activeSection === "custom-orders" && <CustomOrdersSection />}
          {activeSection === "settings" && <SettingsSection />}
          {activeSection === "coupons" && <CouponsSection />}
          {activeSection === "promo-banner" && <PromoBannerSection />}
          {activeSection === "newsletter" && <NewsletterSection />}
        </main>
      </div>
    </div>
  );
}
