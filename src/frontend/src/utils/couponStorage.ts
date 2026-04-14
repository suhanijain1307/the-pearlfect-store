// Local coupon storage for reliable coupon validation at checkout
// Coupons are saved here when admin creates them so they work
// immediately without any backend actor dependency.

export interface LocalCoupon {
  id: string;
  code: string;
  discountPercent: number;
  expiryDate: number; // Unix ms
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
}

const KEY = "pearlfect_coupons";

export function getLocalCoupons(): LocalCoupon[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as LocalCoupon[];
  } catch {
    return [];
  }
}

export function saveLocalCoupon(coupon: LocalCoupon): void {
  const coupons = getLocalCoupons();
  const idx = coupons.findIndex((c) => c.id === coupon.id);
  if (idx >= 0) {
    coupons[idx] = coupon;
  } else {
    coupons.push(coupon);
  }
  localStorage.setItem(KEY, JSON.stringify(coupons));
}

export function deleteLocalCoupon(id: string): void {
  const coupons = getLocalCoupons().filter((c) => c.id !== id);
  localStorage.setItem(KEY, JSON.stringify(coupons));
}

export function applyLocalCoupon(
  code: string,
): { success: true; coupon: LocalCoupon } | { success: false; error: string } {
  const coupons = getLocalCoupons();
  const coupon = coupons.find(
    (c) => c.code.toUpperCase() === code.toUpperCase(),
  );

  if (!coupon) {
    return { success: false, error: "Invalid coupon code. Please try again." };
  }
  if (!coupon.isActive) {
    return { success: false, error: "This coupon is inactive." };
  }
  if (coupon.expiryDate < Date.now()) {
    return { success: false, error: "This coupon has expired." };
  }
  if (coupon.usedCount >= coupon.usageLimit) {
    return {
      success: false,
      error: "This coupon has reached its usage limit.",
    };
  }

  return { success: true, coupon };
}

export function incrementCouponUsage(code: string): void {
  const coupons = getLocalCoupons();
  const idx = coupons.findIndex(
    (c) => c.code.toUpperCase() === code.toUpperCase(),
  );
  if (idx >= 0) {
    coupons[idx] = { ...coupons[idx], usedCount: coupons[idx].usedCount + 1 };
    localStorage.setItem(KEY, JSON.stringify(coupons));
  }
}
