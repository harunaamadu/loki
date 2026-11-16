"use client";

import { useEffect } from "react";
import { useBagStore } from "@/store/bag-store";
import type { BagLine } from "@/lib/types";

export function BagHydrator({ initial }: { initial: BagLine[] }) {
  const setItems = useBagStore((s) => s.setItems);
  useEffect(() => setItems(initial), [initial, setItems]);
  return null;
}
