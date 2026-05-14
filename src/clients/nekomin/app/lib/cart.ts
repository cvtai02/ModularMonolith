export type CartItem = {
  productId: string;
  productName: string;
  imageUrl: string;
  variantId?: string;
  variantLabel?: string;
  price: number;
  currency: string;
  quantity: number;
};

const KEY = "nekomin-cart";

export function getCartItems(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function addCartItem(item: CartItem): void {
  const items = getCartItems();
  const id = item.variantId ?? item.productId;
  const idx = items.findIndex((i) => (i.variantId ?? i.productId) === id);
  if (idx >= 0) {
    items[idx].quantity += item.quantity;
  } else {
    items.push(item);
  }
  localStorage.setItem(KEY, JSON.stringify(items));
}
