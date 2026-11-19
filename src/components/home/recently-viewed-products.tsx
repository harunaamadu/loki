"use client";

import { useEffect, useMemo, useState } from "react";
import { getProductsByIdsAction } from "@/actions/catalog";
import { ProductGrid } from "@/components/product/product-grid";
import { Reveal } from "@/components/shared/reveal";
import { useHydrated } from "@/hooks/use-hydrated";
import { useRecentlyViewedStore } from "@/store/recently-viewed-store";
import type { ProductListItem } from "@/lib/types";

interface Props {
  /** Hide this product (use on a product page so it doesn't list itself). */
  excludeId?: string;
  limit?: number;
}

export function RecentlyViewedProducts({ excludeId, limit = 4 }: Props) {
  const ids = useRecentlyViewedStore((s) => s.ids);
  const clear = useRecentlyViewedStore((s) => s.clear);
  const hydrated = useHydrated();
  const [products, setProducts] = useState<ProductListItem[]>([]);

  const wanted = useMemo(
    () => ids.filter((id) => id !== excludeId).slice(0, limit),
    [ids, excludeId, limit],
  );
  const key = wanted.join(",");

  useEffect(() => {
    if (!hydrated || !key) return;
    let cancelled = false;
    getProductsByIdsAction(key.split(","))
      .then((r) => {
        if (!cancelled) setProducts(r);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [hydrated, key]);

  const shown =
    wanted.length === 0 ? [] : products.filter((p) => wanted.includes(p.id));
  if (!hydrated || shown.length === 0) return null;

  return (
    <Reveal>
      <section aria-labelledby="recent-heading" className="space-y-6">
        <div className="flex items-end justify-between">
          <h2
            id="recent-heading"
            className="text-sm font-semibold uppercase tracking-[0.12em]"
          >
            Recently viewed
          </h2>
          <button
            type="button"
            onClick={clear}
            className="cursor-pointer text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
          >
            Clear
          </button>
        </div>
        <ProductGrid products={shown} />
      </section>
    </Reveal>
  );
}
