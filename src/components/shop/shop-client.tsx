"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ProductGrid } from "@/components/product/product-grid";
import {
  PRICE_BUCKETS,
  selectActiveCount,
  useFilterStore,
  type SortKey,
} from "@/store/filter-store";
import { useUIStore } from "@/store/ui-store";
import { useHydrated } from "@/hooks/use-hydrated";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";
import {
  CATEGORIES,
  CATEGORY_LABEL,
  CONDITIONS,
  CONDITION_LABEL,
  DEPARTMENTS,
  DEPARTMENT_LABEL,
  type CurrencyKey,
} from "@/lib/labels";
import type { ProductListItem } from "@/lib/types";

interface Initial {
  department: string;
  category: string;
  condition: string;
  q: string;
  sale: boolean;
}

function Group({
  title,
  value,
  options,
  onChange,
}: {
  title: string;
  value: string;
  options: [string, string][];
  onChange: (v: string) => void;
}) {
  const all: [string, string][] = [["", "All"], ...options];
  return (
    <fieldset className="space-y-2">
      <legend className="mb-2 text-xs font-semibold uppercase tracking-[0.12em]">
        {title}
      </legend>
      <ul className="space-y-1 text-sm">
        {all.map(([v, label]) => (
          <li key={v || "all"}>
            <button
              type="button"
              aria-pressed={value === v}
              onClick={() => onChange(v)}
              className={cn(
                "cursor-pointer py-0.5 text-left transition-colors",
                value === v
                  ? "font-medium text-foreground underline underline-offset-4"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {label}
            </button>
          </li>
        ))}
      </ul>
    </fieldset>
  );
}

function FilterPanel({
  products,
  currency,
}: {
  products: ProductListItem[];
  currency: CurrencyKey;
}) {
  const f = useFilterStore();
  const active = useFilterStore(selectActiveCount);
  const designers = useMemo(
    () => [...new Set(products.map((p) => p.designer))].sort(),
    [products],
  );

  const fmt = (cents: number) =>
    formatMoney(cents, currency).replace(/\.00$/, "");
  const priceOptions: [string, string][] = PRICE_BUCKETS.map((b) => [
    b.key,
    b.min === 0
      ? `Under ${fmt(b.max)}`
      : b.max === Number.POSITIVE_INFINITY
        ? `${fmt(b.min)}+`
        : `${fmt(b.min)} – ${fmt(b.max)}`,
  ]);

  return (
    <div className="space-y-6">
      <Group
        title="Department"
        value={f.department}
        onChange={(v) => f.set("department", v)}
        options={DEPARTMENTS.map((d) => [d, DEPARTMENT_LABEL[d]])}
      />
      <Group
        title="Category"
        value={f.category}
        onChange={(v) => f.set("category", v)}
        options={CATEGORIES.map((c) => [c, CATEGORY_LABEL[c]])}
      />
      <Group
        title="Condition"
        value={f.condition}
        onChange={(v) => f.set("condition", v)}
        options={CONDITIONS.map((c) => [c, CONDITION_LABEL[c]])}
      />
      <Group
        title="Designer"
        value={f.designer}
        onChange={(v) => f.set("designer", v)}
        options={designers.map((d) => [d, d])}
      />
      <Group
        title="Price"
        value={f.price}
        onChange={(v) => f.set("price", v)}
        options={priceOptions}
      />

      <div className="flex items-center gap-2">
        <Checkbox
          id="in-stock"
          checked={f.inStock}
          onCheckedChange={(v) => f.set("inStock", v === true)}
        />
        <Label htmlFor="in-stock" className="text-sm font-normal">
          In stock only
        </Label>
      </div>

      {active > 0 && (
        <Button type="button" variant="ghost" size="sm" onClick={f.reset}>
          Clear all filters ({active})
        </Button>
      )}
    </div>
  );
}

export function ShopClient({
  products,
  initial,
}: {
  products: ProductListItem[];
  initial: Initial;
}) {
  const f = useFilterStore();
  const active = useFilterStore(selectActiveCount);
  const currency = useUIStore((s) => s.currency);
  const hydrated = useHydrated();
  const activeCurrency: CurrencyKey = hydrated ? currency : "USD";
  const [open, setOpen] = useState(false);

  // Re-apply when the URL changes (e.g. header department links, footer links)
    const urlKey = `${initial.department}|${initial.category}|${initial.condition}|${initial.q}|${initial.sale}`;
  useEffect(() => {
    useFilterStore.getState().apply(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlKey]);

  const visible = useMemo(() => {
    const term = f.q.trim().toLowerCase();
    const bucket = PRICE_BUCKETS.find((b) => b.key === f.price);
    const list = products.filter(
      (p) =>
        (!f.department || p.department === f.department) &&
        (!f.category || p.category === f.category) &&
        (!f.condition || p.condition === f.condition) &&
        (!f.designer || p.designer === f.designer) &&
        (!bucket ||
          (p.priceUsdCents >= bucket.min && p.priceUsdCents < bucket.max)) &&
        (!f.inStock || p.totalStock > 0) &&
        (!term || `${p.designer} ${p.title}`.toLowerCase().includes(term)),
    );
    return [...list].sort((a, b) =>
      f.sort === "price-asc"
        ? a.priceUsdCents - b.priceUsdCents
        : f.sort === "price-desc"
          ? b.priceUsdCents - a.priceUsdCents
          : 0,
    );
  }, [
    products,
    f.q,
    f.department,
    f.category,
    f.condition,
    f.designer,
    f.price,
    f.inStock,
    f.sort,
  ]);

  return (
    <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
      <aside aria-label="Filters" className="hidden lg:block">
        <FilterPanel products={products} currency={activeCurrency} />
      </aside>

      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <Input
            type="search"
            placeholder="Search designer or item…"
            value={f.q}
            onChange={(e) => f.set("q", e.target.value)}
            className="max-w-xs"
            aria-label="Search products"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="lg:hidden"
            onClick={() => setOpen(true)}
          >
            Filters{active > 0 ? ` (${active})` : ""}
          </Button>
          <select
            value={f.sort}
            onChange={(e) => f.set("sort", e.target.value as SortKey)}
            aria-label="Sort"
            className="ml-auto h-9 border bg-background px-3 text-sm"
          >
            <option value="newest">Newest</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
          </select>
        </div>

        <p className="text-xs text-muted-foreground" aria-live="polite">
          {visible.length} {visible.length === 1 ? "item" : "items"}
        </p>

        {visible.length === 0 ? (
          <div className="space-y-3 py-12 text-center">
            <p className="text-sm text-muted-foreground">
              No items match your filters.
            </p>
            <Button type="button" variant="outline" size="sm" onClick={f.reset}>
              Clear filters
            </Button>
          </div>
        ) : (
          <ProductGrid products={visible} />
        )}
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="left"
          className="w-full overflow-y-auto sm:max-w-sm"
        >
          <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
          </SheetHeader>
          <div className="px-4 pb-4">
            <FilterPanel products={products} currency={activeCurrency} />
            <Button
              type="button"
              className="mt-6 w-full"
              onClick={() => setOpen(false)}
            >
              Show {visible.length} {visible.length === 1 ? "item" : "items"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
