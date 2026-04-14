import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface GalleryPhoto {
    id: string;
    createdAt: bigint;
    imageUrl: ExternalBlob;
    caption: string;
}
export interface Coupon {
    id: string;
    expiryDate: bigint;
    code: string;
    usedCount: bigint;
    discountPercent: number;
    isActive: boolean;
    usageLimit: bigint;
}
export interface OrderItem {
    productId: string;
    productName: string;
    quantity: bigint;
    price: number;
}
export interface CustomOrderRequest {
    id: string;
    status: string;
    designDescription: string;
    inspirationImageUrl?: ExternalBlob;
    name: string;
    createdAt: bigint;
    contactNumber: string;
}
export interface Order {
    id: string;
    razorpayPaymentId?: string;
    customerName: string;
    status: string;
    couponCode?: string;
    trackingNumber?: string;
    paymentMethod: string;
    discountAmount?: number;
    createdAt: bigint;
    totalAmount: number;
    address: string;
    phone: string;
    items: Array<OrderItem>;
}
export interface TrackingSummary {
    trackingNumber: string;
    totalEntries: bigint;
    lastMessage: string;
    lastUpdatedAt: bigint;
    currentStatus: string;
}
export interface TrackingEntry {
    id: string;
    status: string;
    trackingNumber: string;
    updatedAt: bigint;
    message: string;
}
export interface ProductReview {
    id: string;
    createdAt: bigint;
    productId: string;
    reviewerName: string;
    comment: string;
    rating: bigint;
}
export interface NewsletterSubscriber {
    subscribedAt: bigint;
    email: string;
}
export interface Product {
    id: string;
    inStock: boolean;
    saleEndDate?: bigint;
    name: string;
    createdAt: bigint;
    description: string;
    imageUrl: ExternalBlob;
    category: string;
    salePrice?: number;
    price: number;
}
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addGalleryPhoto(imageUrl: ExternalBlob, caption: string): Promise<void>;
    addProduct(name: string, price: number, salePrice: number | null, saleEndDate: bigint | null, description: string, imageUrl: ExternalBlob, category: string): Promise<void>;
    addReview(productId: string, reviewerName: string, rating: bigint, comment: string): Promise<void>;
    applyCoupon(code: string): Promise<Coupon>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    clearAllOrders(): Promise<void>;
    createCoupon(code: string, discountPercent: number, expiryDate: bigint, usageLimit: bigint): Promise<void>;
    deleteCoupon(id: string): Promise<void>;
    deleteGalleryPhoto(id: string): Promise<void>;
    deleteProduct(id: string): Promise<void>;
    deleteReview(id: string): Promise<void>;
    deleteTrackingEntry(trackingNumber: string, entryId: string): Promise<void>;
    editTrackingEntry(trackingNumber: string, entryId: string, newMessage: string): Promise<void>;
    getAllTrackingSummaries(): Promise<Array<TrackingSummary>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCoupons(): Promise<Array<Coupon>>;
    getCustomOrders(): Promise<Array<CustomOrderRequest>>;
    getGalleryPhotos(): Promise<Array<GalleryPhoto>>;
    getNewsletterSubscribers(): Promise<Array<NewsletterSubscriber>>;
    getOrderByPhone(phone: string): Promise<Array<Order>>;
    getOrderByTrackingNumber(trackingNumber: string): Promise<Order | null>;
    getOrders(): Promise<Array<Order>>;
    getProduct(id: string): Promise<Product>;
    getProducts(): Promise<Array<Product>>;
    getPromoBanner(): Promise<{
        subText: string;
        endDate: bigint;
        text: string;
        bgColor: string;
    } | null>;
    getReviews(productId: string): Promise<Array<ProductReview>>;
    getTrackingHistory(trackingNumber: string): Promise<Array<TrackingEntry>>;
    getTrackingInfo(trackingNumber: string): Promise<{
        history: Array<TrackingEntry>;
        lastUpdatedAt?: bigint;
        currentStatus?: string;
    }>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    placeOrder(customerName: string, phone: string, address: string, paymentMethod: string, items: Array<OrderItem>, totalAmount: number, couponCode: string | null, discountAmount: number | null, razorpayPaymentId: string | null): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setPromoBanner(text: string, subText: string, endDate: bigint, bgColor: string): Promise<void>;
    submitCustomOrder(name: string, contactNumber: string, designDescription: string, inspirationImageUrl: ExternalBlob | null): Promise<void>;
    subscribeNewsletter(email: string): Promise<void>;
    updateCoupon(couponId: string, _request: Coupon): Promise<Coupon>;
    updateCustomOrderStatus(id: string, status: string): Promise<void>;
    updateOrderStatus(id: string, status: string): Promise<void>;
    updateOrderTracking(id: string, trackingNumber: string): Promise<void>;
    updateProduct(id: string, name: string, price: number, salePrice: number | null, saleEndDate: bigint | null, description: string, imageUrl: ExternalBlob, category: string, inStock: boolean): Promise<void>;
    updateTrackingStatus(trackingNumber: string, status: string, message: string): Promise<TrackingEntry>;
}
