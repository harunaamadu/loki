"use client";

import { useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product/product-card";
import { useFilterStore, type SortKey } from "@/store/filter-store";
import type { ProductListItem } from "@/lib/types";

interface Props {
  products: ProductListItem[];
  categories: { slug: string; name: string }[];
}

export function ShopClient({ products, categories }: Props) {
  const { q, category, sort, setQ, setCategory, setSort, reset } = useFilterStore();

  const visible = useMemo(() => {
    const term = q.trim().toLowerCase();
    const filtered = products.filter(
      (p) =>
        (!category || p.categorySlug === category) &&
        (!term || p.name.toLowerCase().includes(term)),
    );
    return [...filtered].sort((a, b) => {
      if (sort === "price-asc") return a.priceCents - b.priceCents;
      if (sort === "price-desc") return b.priceCents - a.priceCents;
      return 0; // server already returns newest first
    });
  }, [products, q, category, sort]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search products…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="max-w-xs"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="h-9 border bg-background px-3 text-sm"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          className="h-9 border bg-background px-3 text-sm"
        >
          <option value="newest">Newest</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
        </select>
        <Button variant="ghost" size="sm" onClick={reset}>
          Reset
        </Button>
      </div>

      {visible.length === 0 ? (
        <p className="text-muted-foreground">No products match your filters.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {visible.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}