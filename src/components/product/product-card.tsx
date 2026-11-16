import Link from "next/link";
import { Price } from "@/components/shared/money";
import { ProductImage } from "@/components/product/product-image";
import { CONDITION_LABEL, type ConditionKey } from "@/lib/labels";
import type { ProductListItem } from "@/lib/types";

export function ProductCard({
  product: p,
  priority = false,
}: {
  product: ProductListItem;
  priority?: boolean;
}) {
  const soldOut = p.totalStock === 0;
  const discount =
    p.originalPriceUsdCents && p.originalPriceUsdCents > p.priceUsdCents
      ? Math.round((1 - p.priceUsdCents / p.originalPriceUsdCents) * 100)
      : 0;
  const showCondition = p.condition !== "NEW_SEASON";

  return (
    <Link
      href={`/product/${p.id}`}
      className="group block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground"
    >
      <div className="relative aspect-4/5 overflow-hidden bg-secondary">
        <ProductImage
          publicId={p.imagePublicId}
          alt={p.title}
          priority={priority}
        />
        {p.secondImagePublicId && (
          <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
            <ProductImage publicId={p.secondImagePublicId} alt="" />
          </div>
        )}
        <div className="absolute left-2 top-2 flex flex-col items-start gap-1">
          {soldOut && (
            <span className="bg-background px-2 py-1 text-[10px] uppercase tracking-wider">
              Sold out
            </span>
          )}
          {discount > 0 && !soldOut && (
            <span className="bg-primary px-2 py-1 text-[10px] uppercase tracking-wider text-primary-foreground">
              −{discount}%
            </span>
          )}
          {showCondition && (
            <span className="bg-background px-2 py-1 text-[10px] uppercase tracking-wider">
              {CONDITION_LABEL[p.condition as ConditionKey]}
            </span>
          )}
        </div>
      </div>

      <div className="mt-3 space-y-0.5 text-sm">
        <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
          {p.designer}
        </p>
        <p className="underline-offset-4 group-hover:underline">{p.title}</p>
        <p className="flex items-baseline gap-2">
          <Price usdCents={p.priceUsdCents} className="font-medium" />
          {discount > 0 && p.originalPriceUsdCents && (
            <Price
              usdCents={p.originalPriceUsdCents}
              className="text-xs text-muted-foreground line-through"
            />
          )}
        </p>
      </div>
    </Link>
  );
}
