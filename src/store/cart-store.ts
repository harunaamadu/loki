import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  priceCents: number;
  image: string | null; // Cloudinary publicId
  stock: number;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  add: (item: Omit<CartItem, "quantity">, qty?: number) => void;
  setQuantity: (productId: string, qty: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      add: (item, qty = 1) =>
        set((s) => {
          const found = s.items.find((i) => i.productId === item.productId);
          if (found) {
            return {
              items: s.items.map((i) =>
                i.productId === item.productId
                  ? { ...i, quantity: Math.min(i.quantity + qty, item.stock) }
                  : i,
              ),
            };
          }
          return {
            items: [
              ...s.items,
              { ...item, quantity: Math.min(qty, item.stock) },
            ],
          };
        }),
      setQuantity: (productId, qty) =>
        set((s) => ({
          items: s.items
            .map((i) =>
              i.productId === productId
                ? { ...i, quantity: Math.min(qty, i.stock) }
                : i,
            )
            .filter((i) => i.quantity > 0),
        })),
      remove: (productId) =>
        set((s) => ({
          items: s.items.filter((i) => i.productId !== productId),
        })),
      clear: () => set({ items: [] }),
    }),
    {
      name: "loki-cart",
      version: 1,
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

export const selectCount = (s: CartState) =>
  s.items.reduce((n, i) => n + i.quantity, 0);
export const selectSubtotal = (s: CartState) =>
  s.items.reduce((n, i) => n + i.priceCents * i.quantity, 0);
