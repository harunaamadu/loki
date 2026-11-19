import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const MAX = 12;

interface RecentState {
  ids: string[];
  add: (id: string) => void;
  clear: () => void;
}

export const useRecentlyViewedStore = create<RecentState>()(
  persist(
    (set) => ({
      ids: [],
      add: (id) =>
        set((s) => ({
          ids: [id, ...s.ids.filter((x) => x !== id)].slice(0, MAX),
        })),
      clear: () => set({ ids: [] }),
    }),
    {
      name: "loki-recent",
      version: 1,
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
