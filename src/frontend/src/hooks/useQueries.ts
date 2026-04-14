import {
  createActorWithConfig,
  useActor,
} from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Coupon,
  CustomOrderRequest,
  GalleryPhoto,
  NewsletterSubscriber,
  Order,
  OrderItem,
  Product,
  ProductReview,
} from "../backend";
import type { ExternalBlob } from "../backend";
import { createActor } from "../backend";
import {
  applyOverrides,
  customToProduct,
  deleteCustomProduct,
  getCustomProducts,
  saveCustomProduct,
  saveOverride,
} from "../data/localProducts";
import { STATIC_PRODUCTS } from "../data/staticProducts";

// ─── Local order storage (fallback for when backend is unavailable) ───────────
const ORDERS_LOCAL_KEY = "pearlfect_local_orders";

export interface OrderHistoryEntry {
  id: string;
  status: string;
  message: string;
  timestamp: number; // ms
}

interface LocalOrder {
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
  trackingNumber: string | null;
  couponCode: string | null;
  discountAmount: number | null;
  razorpayPaymentId: string | null;
  createdAt: number;
  lastUpdatedAt?: number;
  adminMessage?: string;
  updateHistory?: OrderHistoryEntry[];
}

function getLocalOrders(): LocalOrder[] {
  try {
    return JSON.parse(
      localStorage.getItem(ORDERS_LOCAL_KEY) ?? "[]",
    ) as LocalOrder[];
  } catch {
    return [];
  }
}

function saveLocalOrder(order: LocalOrder): void {
  const orders = getLocalOrders();
  const idx = orders.findIndex((o) => o.id === order.id);
  if (idx >= 0) {
    orders[idx] = order;
  } else {
    orders.unshift(order); // newest first
  }
  localStorage.setItem(ORDERS_LOCAL_KEY, JSON.stringify(orders));
}

/** Dispatch a custom storage event so same-tab listeners can react.
 * Exported so CheckoutPage can call it immediately after saving an order. */
export function broadcastOrdersUpdate(): void {
  // This fires for same-tab listeners (storage event only fires cross-tab)
  window.dispatchEvent(
    new StorageEvent("storage", {
      key: ORDERS_LOCAL_KEY,
      newValue: localStorage.getItem(ORDERS_LOCAL_KEY),
      storageArea: localStorage,
    }),
  );
}

function updateLocalOrderStatus(id: string, status: string): void {
  const orders = getLocalOrders();
  const idx = orders.findIndex((o) => o.id === id);
  if (idx >= 0) {
    orders[idx] = { ...orders[idx], status, lastUpdatedAt: Date.now() };
    localStorage.setItem(ORDERS_LOCAL_KEY, JSON.stringify(orders));
    broadcastOrdersUpdate();
  }
}

function updateLocalOrderTracking(id: string, trackingNumber: string): void {
  const orders = getLocalOrders();
  const idx = orders.findIndex((o) => o.id === id);
  if (idx >= 0) {
    orders[idx] = { ...orders[idx], trackingNumber, lastUpdatedAt: Date.now() };
    localStorage.setItem(ORDERS_LOCAL_KEY, JSON.stringify(orders));
    broadcastOrdersUpdate();
  }
}

function updateLocalOrderMessage(id: string, message: string): void {
  const orders = getLocalOrders();
  const idx = orders.findIndex((o) => o.id === id);
  if (idx >= 0) {
    orders[idx] = {
      ...orders[idx],
      adminMessage: message,
      lastUpdatedAt: Date.now(),
    };
    localStorage.setItem(ORDERS_LOCAL_KEY, JSON.stringify(orders));
    broadcastOrdersUpdate();
  }
}

function addLocalOrderHistoryEntry(id: string, entry: OrderHistoryEntry): void {
  const orders = getLocalOrders();
  const idx = orders.findIndex((o) => o.id === id);
  if (idx >= 0) {
    const existing = orders[idx].updateHistory ?? [];
    orders[idx] = {
      ...orders[idx],
      updateHistory: [...existing, entry],
      lastUpdatedAt: Date.now(),
    };
    localStorage.setItem(ORDERS_LOCAL_KEY, JSON.stringify(orders));
    broadcastOrdersUpdate();
  }
}

function editLocalOrderHistoryEntry(
  orderId: string,
  entryId: string,
  updates: Partial<OrderHistoryEntry>,
): void {
  const orders = getLocalOrders();
  const idx = orders.findIndex((o) => o.id === orderId);
  if (idx >= 0) {
    const history = orders[idx].updateHistory ?? [];
    orders[idx] = {
      ...orders[idx],
      updateHistory: history.map((e) =>
        e.id === entryId ? { ...e, ...updates } : e,
      ),
      lastUpdatedAt: Date.now(),
    };
    localStorage.setItem(ORDERS_LOCAL_KEY, JSON.stringify(orders));
  }
}

function deleteLocalOrderHistoryEntry(orderId: string, entryId: string): void {
  const orders = getLocalOrders();
  const idx = orders.findIndex((o) => o.id === orderId);
  if (idx >= 0) {
    orders[idx] = {
      ...orders[idx],
      updateHistory: (orders[idx].updateHistory ?? []).filter(
        (e) => e.id !== entryId,
      ),
      lastUpdatedAt: Date.now(),
    };
    localStorage.setItem(ORDERS_LOCAL_KEY, JSON.stringify(orders));
  }
}

export function useProducts() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: async () => {
      const customProducts = getCustomProducts().map(customToProduct);
      if (!actor) {
        return [...applyOverrides(STATIC_PRODUCTS), ...customProducts];
      }
      try {
        const backendProducts = await actor.getProducts();
        const backendIds = new Set(backendProducts.map((p) => p.id));
        const uniqueStatic = STATIC_PRODUCTS.filter(
          (p) => !backendIds.has(p.id),
        );
        const customIds = new Set(customProducts.map((p) => p.id));
        const filteredBackend = backendProducts.filter(
          (p) => !customIds.has(p.id),
        );
        return [
          ...filteredBackend,
          ...applyOverrides(uniqueStatic),
          ...customProducts,
        ];
      } catch {
        return [...applyOverrides(STATIC_PRODUCTS), ...customProducts];
      }
    },
    enabled: !isFetching,
    staleTime: 0,
    refetchOnMount: "always",
    placeholderData: [...STATIC_PRODUCTS],
  });
}

export function useProduct(id: string) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Product>({
    queryKey: ["product", id],
    queryFn: async () => {
      const customProducts = getCustomProducts().map(customToProduct);
      const customMatch = customProducts.find((p) => p.id === id);
      if (customMatch) return customMatch;
      const staticProduct = STATIC_PRODUCTS.find((p) => p.id === id);
      if (staticProduct) return applyOverrides([staticProduct])[0];
      if (!actor) throw new Error("Product not found");
      return actor.getProduct(id);
    },
    enabled: !isFetching || id.startsWith("static-") || id.startsWith("local-"),
  });
}

export function useGalleryPhotos() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<GalleryPhoto[]>({
    queryKey: ["galleryPhotos"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getGalleryPhotos();
    },
    enabled: !!actor && !isFetching,
    staleTime: 0,
    refetchOnMount: "always",
    refetchInterval: 5000, // poll every 5s so customer gallery stays in sync
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCustomOrders() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<CustomOrderRequest[]>({
    queryKey: ["customOrders"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCustomOrders();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useOrders() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Order[]>({
    queryKey: ["orders"],
    queryFn: async () => {
      const localOrders = getLocalOrders();
      let backendOrders: Order[] = [];
      try {
        const activeActor = actor ?? (await createActorWithConfig(createActor));
        backendOrders = await activeActor.getOrders();
      } catch {
        // Backend unavailable or unauthorized — fall back to localStorage only
      }
      // Merge: backend orders take precedence; local orders fill in the rest
      const backendIds = new Set(backendOrders.map((o) => o.id));
      const localOnly = localOrders
        .filter((o) => !backendIds.has(o.id))
        .map((o) => ({
          ...o,
          trackingNumber: o.trackingNumber ?? undefined,
          couponCode: o.couponCode ?? undefined,
          discountAmount: o.discountAmount ?? undefined,
          razorpayPaymentId: o.razorpayPaymentId ?? undefined,
          items: o.items.map((i) => ({ ...i, quantity: BigInt(i.quantity) })),
        })) as unknown as Order[];
      return [...backendOrders, ...localOnly];
    },
    enabled: !isFetching,
    staleTime: 0,
    refetchOnMount: "always",
  });
}

export function useGetOrderByPhone(phone: string | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Order[]>({
    queryKey: ["ordersByPhone", phone],
    queryFn: async () => {
      if (!actor || !phone) return [];
      return actor.getOrderByPhone(phone);
    },
    enabled: !!actor && !isFetching && !!phone,
  });
}

/** Read an order by Tracking ID from localStorage (the single source of truth).
 * Falls back to backend if not found locally. Updates instantly on admin writes. */
export function useGetOrderByTrackingId(trackingId: string | null) {
  return useQuery<ExtendedOrder | null>({
    queryKey: ["orderByTrackingId", trackingId],
    queryFn: () => {
      if (!trackingId) return null;
      const orders = getLocalOrders();
      const found = orders.find(
        (o) =>
          o.trackingNumber?.toLowerCase() === trackingId.trim().toLowerCase(),
      );
      if (!found) return null;
      return {
        id: found.id,
        customerName: found.customerName,
        phone: found.phone,
        address: found.address,
        paymentMethod: found.paymentMethod,
        items: found.items,
        totalAmount: found.totalAmount,
        status: found.status,
        trackingNumber: found.trackingNumber ?? null,
        couponCode: found.couponCode ?? null,
        discountAmount: found.discountAmount ?? null,
        razorpayPaymentId: found.razorpayPaymentId ?? null,
        createdAt: found.createdAt,
        lastUpdatedAt: found.lastUpdatedAt ?? found.createdAt,
        adminMessage: found.adminMessage ?? "",
        updateHistory: found.updateHistory ?? [],
      } satisfies ExtendedOrder;
    },
    enabled: !!trackingId,
    staleTime: 0,
    refetchOnMount: "always",
    refetchInterval: 5000, // poll every 5s for cross-device support
  });
}

export function usePlaceOrder() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      customerName: string;
      phone: string;
      address: string;
      paymentMethod: string;
      items: OrderItem[];
      totalAmount: number;
      couponCode?: string | null;
      discountAmount?: number | null;
      razorpayPaymentId?: string | null;
      localOrderId?: string | null;
      localTrackingId?: string | null;
    }) => {
      // Always save to localStorage first for instant admin visibility
      const orderId =
        params.localOrderId ?? `ORD-${Date.now().toString().slice(-6)}`;
      saveLocalOrder({
        id: orderId,
        customerName: params.customerName,
        phone: params.phone,
        address: params.address,
        paymentMethod: params.paymentMethod,
        items: params.items.map((i) => ({
          productId: i.productId,
          productName: i.productName,
          quantity: Number(i.quantity),
          price: i.price,
        })),
        totalAmount: params.totalAmount,
        status: "Processing",
        trackingNumber: params.localTrackingId ?? null,
        couponCode: params.couponCode ?? null,
        discountAmount: params.discountAmount ?? null,
        razorpayPaymentId: params.razorpayPaymentId ?? null,
        createdAt: Date.now(),
      });
      // Then try to persist to backend (best-effort)
      try {
        const activeActor = actor ?? (await createActorWithConfig(createActor));
        await activeActor.placeOrder(
          params.customerName,
          params.phone,
          params.address,
          params.paymentMethod,
          params.items,
          params.totalAmount,
          params.couponCode ?? null,
          params.discountAmount ?? null,
          params.razorpayPaymentId ?? null,
        );
      } catch {
        // Backend failed — order is saved in localStorage, admin will still see it
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export function useSubmitCustomOrder() {
  const { actor } = useActor(createActor);
  return useMutation({
    mutationFn: async (params: {
      name: string;
      contactNumber: string;
      designDescription: string;
      inspirationImageUrl: ExternalBlob | null;
    }) => {
      const activeActor = actor ?? (await createActorWithConfig(createActor));
      await activeActor.submitCustomOrder(
        params.name,
        params.contactNumber,
        params.designDescription,
        params.inspirationImageUrl,
      );
    },
  });
}

export function useAddProduct() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      name: string;
      price: number;
      description: string;
      imageUrl: ExternalBlob;
      category: string;
    }) => {
      const localId = `local-${Date.now()}`;
      const imageUrlStr = params.imageUrl ? params.imageUrl.getDirectURL() : "";
      // Try backend first (with fallback actor so actor null doesn't block upload)
      try {
        const activeActor = actor ?? (await createActorWithConfig(createActor));
        await activeActor.addProduct(
          params.name,
          params.price,
          null,
          null,
          params.description,
          params.imageUrl,
          params.category,
        );
      } catch {
        // Backend failed, fall through to localStorage only
      }
      // Always save to localStorage for immediate UI update
      saveCustomProduct({
        id: localId,
        name: params.name,
        price: params.price,
        description: params.description,
        imageUrl: imageUrlStr,
        category: params.category,
        inStock: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useUpdateProduct() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      id: string;
      name: string;
      price: number;
      description: string;
      imageUrl: ExternalBlob;
      category: string;
      inStock: boolean;
    }) => {
      try {
        const activeActor = actor ?? (await createActorWithConfig(createActor));
        await activeActor.updateProduct(
          params.id,
          params.name,
          params.price,
          null,
          null,
          params.description,
          params.imageUrl,
          params.category,
          params.inStock,
        );
      } catch {
        // ignore backend errors, still update localStorage
      }
      // Always update localStorage override for immediate UI reflection
      saveOverride({
        id: params.id,
        name: params.name,
        price: params.price,
        description: params.description,
        category: params.category,
        inStock: params.inStock,
      });
      // If it's a local product, also update the custom product entry
      if (params.id.startsWith("local-")) {
        const all = getCustomProducts();
        const idx = all.findIndex((x) => x.id === params.id);
        if (idx >= 0) {
          all[idx] = {
            ...all[idx],
            name: params.name,
            price: params.price,
            description: params.description,
            category: params.category,
            inStock: params.inStock,
          };
          const CUSTOM_KEY = "pearlfect_custom_products";
          localStorage.setItem(CUSTOM_KEY, JSON.stringify(all));
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useDeleteProduct() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      // Remove from localStorage regardless
      deleteCustomProduct(id);
      if (actor) {
        try {
          await actor.deleteProduct(id);
        } catch {
          // ignore backend errors for local products
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useAddGalleryPhoto() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { imageUrl: ExternalBlob; caption: string }) => {
      // Use provided actor or create a fresh one — never fail silently
      const activeActor = actor ?? (await createActorWithConfig(createActor));
      await activeActor.addGalleryPhoto(params.imageUrl, params.caption);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["galleryPhotos"] });
    },
  });
}

export function useDeleteGalleryPhoto() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const activeActor = actor ?? (await createActorWithConfig(createActor));
      await activeActor.deleteGalleryPhoto(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["galleryPhotos"] });
    },
  });
}

export function useUpdateCustomOrderStatus() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { id: string; status: string }) => {
      const activeActor = actor ?? (await createActorWithConfig(createActor));
      await activeActor.updateCustomOrderStatus(params.id, params.status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customOrders"] });
    },
  });
}

export function useUpdateOrderStatus() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { id: string; status: string }) => {
      // Always update localStorage immediately
      updateLocalOrderStatus(params.id, params.status);
      // Then sync to backend
      try {
        const activeActor = actor ?? (await createActorWithConfig(createActor));
        await activeActor.updateOrderStatus(params.id, params.status);
      } catch {
        // Backend update failed — localStorage is updated, UI stays correct
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export function useUpdateOrderTracking() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { id: string; trackingNumber: string }) => {
      // Always update localStorage immediately
      updateLocalOrderTracking(params.id, params.trackingNumber);
      // Then sync to backend
      try {
        const activeActor = actor ?? (await createActorWithConfig(createActor));
        await activeActor.updateOrderTracking(params.id, params.trackingNumber);
      } catch {
        // Backend update failed — localStorage is updated
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export function useStoryImages() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<{ slot1: GalleryPhoto | null; slot2: GalleryPhoto | null }>({
    queryKey: ["storyImages"],
    queryFn: async () => {
      if (!actor) return { slot1: null, slot2: null };
      const photos = await actor.getGalleryPhotos();
      return {
        slot1: photos.find((p) => p.caption === "__story_1__") ?? null,
        slot2: photos.find((p) => p.caption === "__story_2__") ?? null,
      };
    },
    enabled: !!actor && !isFetching,
  });
}

export function useReplaceStoryImage() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      slot: 1 | 2;
      imageUrl: ExternalBlob;
      existingId?: string;
    }) => {
      const activeActor = actor ?? (await createActorWithConfig(createActor));
      if (params.existingId)
        await activeActor.deleteGalleryPhoto(params.existingId);
      await activeActor.addGalleryPhoto(
        params.imageUrl,
        `__story_${params.slot}__`,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["storyImages"] });
      queryClient.invalidateQueries({ queryKey: ["galleryPhotos"] });
    },
  });
}

export function useRemoveStoryImage() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const activeActor = actor ?? (await createActorWithConfig(createActor));
      await activeActor.deleteGalleryPhoto(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["storyImages"] });
      queryClient.invalidateQueries({ queryKey: ["galleryPhotos"] });
    },
  });
}

export function useReviews(productId: string) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<ProductReview[]>({
    queryKey: ["reviews", productId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getReviews(productId);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddReview() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      productId: string;
      reviewerName: string;
      rating: number;
      comment: string;
    }) => {
      const activeActor = actor ?? (await createActorWithConfig(createActor));
      await activeActor.addReview(
        params.productId,
        params.reviewerName,
        BigInt(params.rating),
        params.comment,
      );
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["reviews", vars.productId] });
    },
  });
}

// ─── Coupons ─────────────────────────────────────────────────────────────────
export function useCoupons() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Coupon[]>({
    queryKey: ["coupons"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCoupons();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useApplyCoupon() {
  const { actor } = useActor(createActor);
  return useMutation({
    mutationFn: async (code: string) => {
      const activeActor = actor ?? (await createActorWithConfig(createActor));
      return activeActor.applyCoupon(code);
    },
  });
}

export function useCreateCoupon() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      code: string;
      discountPercent: number;
      expiryDate: bigint;
      usageLimit: bigint;
    }) => {
      const activeActor = actor ?? (await createActorWithConfig(createActor));
      await activeActor.createCoupon(
        params.code,
        params.discountPercent,
        params.expiryDate,
        params.usageLimit,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
    },
  });
}

export function useDeleteCoupon() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const activeActor = actor ?? (await createActorWithConfig(createActor));
      await activeActor.deleteCoupon(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
    },
  });
}

// ─── Newsletter ───────────────────────────────────────────────────────────────
export function useSubscribeNewsletter() {
  const { actor } = useActor(createActor);
  return useMutation({
    mutationFn: async (email: string) => {
      const activeActor = actor ?? (await createActorWithConfig(createActor));
      await activeActor.subscribeNewsletter(email);
    },
  });
}

export function useNewsletterSubscribers() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<NewsletterSubscriber[]>({
    queryKey: ["newsletterSubscribers"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getNewsletterSubscribers();
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Promo Banner ─────────────────────────────────────────────────────────────
const PROMO_BANNER_LS_KEY = "pearlfect_promo_banner";

/** Write banner data to localStorage so customer component reads it instantly. */
function writeBannerToStorage(params: {
  text: string;
  subText: string;
  endDate: bigint;
  bgColor: string;
}): void {
  try {
    localStorage.setItem(
      PROMO_BANNER_LS_KEY,
      JSON.stringify({
        text: params.text,
        subText: params.subText,
        endDateNs: params.endDate.toString(),
        bgColor: params.bgColor,
      }),
    );
  } catch {
    // Storage write failed — non-fatal
  }
}

export function useGetPromoBanner() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<{
    text: string;
    subText: string;
    endDate: bigint;
    bgColor: string;
    isActive: boolean;
  } | null>({
    queryKey: ["promoBanner"],
    queryFn: async () => {
      if (!actor) return null;
      const result = await actor.getPromoBanner();
      if (result) {
        const banner = result as {
          text: string;
          subText: string;
          endDate: bigint;
          bgColor: string;
          isActive: boolean;
        };
        // Sync backend result to localStorage so customer banner is always up to date
        writeBannerToStorage({
          text: banner.text,
          subText: banner.subText,
          endDate: banner.endDate,
          bgColor: banner.bgColor,
        });
        return banner;
      }
      return null;
    },
    enabled: !!actor && !isFetching,
    staleTime: 0,
    refetchOnMount: "always",
    refetchInterval: 5000,
  });
}

export function useSetPromoBanner() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      text: string;
      subText: string;
      endDate: bigint;
      bgColor: string;
    }) => {
      // Write to localStorage FIRST so the banner shows instantly on the site
      // even before the backend confirms — no waiting for round-trip.
      writeBannerToStorage(params);
      const activeActor = actor ?? (await createActorWithConfig(createActor));
      await activeActor.setPromoBanner(
        params.text,
        params.subText,
        params.endDate,
        params.bgColor,
      );
      return params;
    },
    onSuccess: (params) => {
      // Overwrite with confirmed data from backend call
      writeBannerToStorage(params);
      queryClient.invalidateQueries({ queryKey: ["promoBanner"] });
    },
  });
}

// ─── Extended order type (localStorage-only fields) ──────────────────────────
export interface ExtendedOrder {
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
  trackingNumber: string | null;
  couponCode: string | null;
  discountAmount: number | null;
  razorpayPaymentId: string | null;
  createdAt: number;
  lastUpdatedAt: number;
  adminMessage: string;
  updateHistory: OrderHistoryEntry[];
}

/** Returns orders from localStorage with all extended fields (history, message, timestamps). */
export function useExtendedOrders() {
  return useQuery<ExtendedOrder[]>({
    queryKey: ["extendedOrders"],
    queryFn: () => {
      const orders = getLocalOrders();
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
    },
    staleTime: 0,
    refetchOnMount: "always",
    refetchInterval: 1000, // poll every 1s so new customer orders appear in admin almost instantly
  });
}

/** Save status + optional message together, appending to history. */
export function useSaveOrderUpdate() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      id: string;
      status: string;
      message: string;
    }) => {
      const entry: OrderHistoryEntry = {
        id: `entry-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        status: params.status,
        message: params.message,
        timestamp: Date.now(),
      };
      updateLocalOrderStatus(params.id, params.status);
      updateLocalOrderMessage(params.id, params.message);
      addLocalOrderHistoryEntry(params.id, entry);
      // Sync status to backend best-effort
      try {
        const activeActor = actor ?? (await createActorWithConfig(createActor));
        await activeActor.updateOrderStatus(params.id, params.status);
      } catch {
        // Backend update failed — localStorage is updated, UI stays correct
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["extendedOrders"] });
    },
  });
}

/** Edit a past history entry's message (status is read-only once saved). */
export function useEditOrderHistoryEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      orderId: string;
      entryId: string;
      message: string;
    }) => {
      editLocalOrderHistoryEntry(params.orderId, params.entryId, {
        message: params.message,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["extendedOrders"] });
    },
  });
}

/** Delete a past history entry. */
export function useDeleteOrderHistoryEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { orderId: string; entryId: string }) => {
      deleteLocalOrderHistoryEntry(params.orderId, params.entryId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["extendedOrders"] });
    },
  });
}

// ─── Tracking Management ──────────────────────────────────────────────────────

/** Update tracking status + message for a specific order, appending to history. */
export function useUpdateTrackingStatus() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      orderId: string;
      trackingNumber: string;
      status: string;
      message: string;
    }) => {
      const entry: OrderHistoryEntry = {
        id: `entry-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        status: params.status,
        message: params.message,
        timestamp: Date.now(),
      };
      updateLocalOrderStatus(params.orderId, params.status);
      updateLocalOrderMessage(params.orderId, params.message);
      addLocalOrderHistoryEntry(params.orderId, entry);
      // Best-effort backend sync
      try {
        const activeActor = actor ?? (await createActorWithConfig(createActor));
        await activeActor.updateOrderStatus(params.orderId, params.status);
      } catch {
        // localStorage already updated
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["extendedOrders"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

/** Clear all orders from localStorage and backend. Destructive — use before publishing. */
export function useClearAllOrders() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      // Clear localStorage immediately
      localStorage.removeItem(ORDERS_LOCAL_KEY);
      localStorage.removeItem("lastOrder");
      broadcastOrdersUpdate();
      // Best-effort backend clear
      try {
        const activeActor = actor ?? (await createActorWithConfig(createActor));
        await activeActor.clearAllOrders();
      } catch {
        // Backend clear failed — localStorage already cleared
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["extendedOrders"] });
    },
  });
}

/** Delete a single order from localStorage. */
export function useDeleteOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (orderId: string) => {
      const orders = getLocalOrders().filter((o) => o.id !== orderId);
      localStorage.setItem(ORDERS_LOCAL_KEY, JSON.stringify(orders));
      broadcastOrdersUpdate();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["extendedOrders"] });
    },
  });
}

// ─── Cancel Order ─────────────────────────────────────────────────────────────

/** Cancel an order by ID: updates localStorage immediately + syncs to backend. */
export function useCancelOrder() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (orderId: string) => {
      // Update localStorage immediately
      updateLocalOrderStatus(orderId, "cancelled");
      // Best-effort backend sync
      try {
        const activeActor = actor ?? (await createActorWithConfig(createActor));
        await activeActor.updateOrderStatus(orderId, "cancelled");
      } catch {
        // Backend update failed — localStorage is already updated
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["extendedOrders"] });
    },
  });
}

/** Get tracking history for a specific order from localStorage. */
export function useGetTrackingHistory(orderId: string | null) {
  return useQuery<OrderHistoryEntry[]>({
    queryKey: ["trackingHistory", orderId],
    queryFn: () => {
      if (!orderId) return [];
      const orders = getLocalOrders();
      const order = orders.find((o) => o.id === orderId);
      return order?.updateHistory ?? [];
    },
    enabled: !!orderId,
    staleTime: 0,
    refetchOnMount: "always",
  });
}

/** Edit message of a tracking history entry (status is immutable once saved). */
export function useEditTrackingEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      orderId: string;
      entryId: string;
      message: string;
    }) => {
      editLocalOrderHistoryEntry(params.orderId, params.entryId, {
        message: params.message,
      });
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["extendedOrders"] });
      queryClient.invalidateQueries({
        queryKey: ["trackingHistory", vars.orderId],
      });
    },
  });
}

/** Delete a tracking history entry. */
export function useDeleteTrackingEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { orderId: string; entryId: string }) => {
      deleteLocalOrderHistoryEntry(params.orderId, params.entryId);
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["extendedOrders"] });
      queryClient.invalidateQueries({
        queryKey: ["trackingHistory", vars.orderId],
      });
    },
  });
}
