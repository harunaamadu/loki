import { create } from "zustand";

export type SortKey = "newest" | "price-asc" | "price-desc";

export const PRICE_BUCKETS = [
  { key: "u500", min: 0, max: 50_000 },
  { key: "500-1000", min: 50_000, max: 100_000 },
  { key: "1000-2500", min: 100_000, max: 250_000 },
  { key: "o2500", min: 250_000, max: Number.POSITIVE_INFINITY },
] as const;

interface Fields {
  q: string;
  department: string;
  category: string;
  condition: string;
  designer: string;
  price: string; // PRICE_BUCKETS key, "" = any
  inStock: boolean;
  sort: SortKey;
}

interface FilterState extends Fields {
  set: <K extends keyof Fields>(key: K, value: Fields[K]) => void;
  /** Reset everything, then apply the given values (used when the URL changes). */
  apply: (partial: Partial<Fields>) => void;
  reset: () => void;
}

const initial: Fields = {
  q: "",
  department: "",
  category: "",
  condition: "",
  designer: "",
  price: "",
  inStock: false,
  sort: "newest",
};

export const useFilterStore = create<FilterState>()((set) => ({
  ...initial,
  set: (key, value) => set({ [key]: value } as Partial<Fields>),
  apply: (partial) => set({ ...initial, ...partial }),
  reset: () => set(initial),
}));

export const selectActiveCount = (s: Fields) =>
  [s.department, s.category, s.condition, s.designer, s.price].filter(Boolean)
    .length + (s.inStock ? 1 : 0);
