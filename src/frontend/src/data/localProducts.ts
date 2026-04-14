import { ExternalBlob } from "../backend";
import type { Product } from "../backend";

const STORAGE_KEY = "pearlfect_product_overrides";
const CUSTOM_KEY = "pearlfect_custom_products";

export type ProductOverride = {
  id: string;
  name?: string;
  price?: number;
  description?: string;
  category?: string;
  inStock?: boolean;
};

export type CustomProduct = {
  id: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  category: string;
  inStock: boolean;
};

export function getOverrides(): Record<string, ProductOverride> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

export function saveOverride(override: ProductOverride) {
  const overrides = getOverrides();
  overrides[override.id] = { ...overrides[override.id], ...override };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
}

export function getCustomProducts(): CustomProduct[] {
  try {
    return JSON.parse(localStorage.getItem(CUSTOM_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function saveCustomProduct(p: CustomProduct) {
  const all = getCustomProducts();
  const idx = all.findIndex((x) => x.id === p.id);
  if (idx >= 0) all[idx] = p;
  else all.push(p);
  localStorage.setItem(CUSTOM_KEY, JSON.stringify(all));
}

export function deleteCustomProduct(id: string) {
  const all = getCustomProducts().filter((x) => x.id !== id);
  localStorage.setItem(CUSTOM_KEY, JSON.stringify(all));
}

export function applyOverrides(products: Product[]): Product[] {
  const overrides = getOverrides();
  return products.map((p) => {
    const o = overrides[p.id];
    if (!o) return p;
    return {
      ...p,
      name: o.name ?? p.name,
      price: o.price ?? p.price,
      description: o.description ?? p.description,
      category: o.category ?? p.category,
      inStock: o.inStock !== undefined ? o.inStock : p.inStock,
    };
  });
}

export function customToProduct(c: CustomProduct): Product {
  return {
    id: c.id,
    name: c.name,
    price: c.price,
    description: c.description,
    imageUrl: ExternalBlob.fromURL(c.imageUrl),
    category: c.category,
    inStock: c.inStock,
    createdAt: BigInt(0),
  };
}
