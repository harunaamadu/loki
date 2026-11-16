import { create } from "zustand";

export type SortKey = "newest" | "price-asc" | "price-desc";

interface FilterState {
  q: string;
  category: string; // category slug, "" = all
  sort: SortKey;
  setQ: (q: string) => void;
  setCategory: (category: string) => void;
  setSort: (sort: SortKey) => void;
  reset: () => void;
}

export const useFilterStore = create<FilterState>()((set) => ({
  q: "",
  category: "",
  sort: "newest",
  setQ: (q) => set({ q }),
  setCategory: (category) => set({ category }),
  setSort: (sort) => set({ sort }),
  reset: () => set({ q: "", category: "", sort: "newest" }),
}));
