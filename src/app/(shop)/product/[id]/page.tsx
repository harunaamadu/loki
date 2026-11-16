import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { Price } from "@/components/shared/money";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductGrid } from "@/components/product/product-grid";
import { PurchasePanel } from "@/components/product/purchase-panel";
import { FREE_SHIPPING_THRESHOLD_USD_CENTS } from "@/config/store";
import {
  getProductById,
  getRelatedProducts,
  getWishlistIds,
} from "@/lib/queries";
import {
  CATEGORY_LABEL,
  CONDITION_LABEL,
  DEPARTMENT_LABEL,
  type CategoryKey,
  type ConditionKey,
  type DepartmentKey,
} from "@/lib/labels";
import type { Department, ProductCategory } from "@/generated/prisma/client";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const p = await getProductById(id);
  return { title: p ? `${p.designer} ${p.title}` : "Product not found" };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) notFound();

  const session = await auth();
  const user = session?.user;
  const [wishedIds, related] = await Promise.all([
    user ? getWishlistIds(user.id) : Promise.resolve([] as string[]),
    getRelatedProducts({
      id: product.id,
      category: product.category as ProductCategory,
      department: product.department as Department | null,
    }),
  ]);

  const dept = product.department as DepartmentKey | null;
  const discount =
    product.originalPriceUsdCents &&
    product.originalPriceUsdCents > product.priceUsdCents
      ? Math.round(
          (1 - product.priceUsdCents / product.originalPriceUsdCents) * 100,
        )
      : 0;
  const threshold = `$${(FREE_SHIPPING_THRESHOLD_USD_CENTS / 100).toLocaleString("en")}`;

  const details: [string, string | null][] = [
    ["Condition", CONDITION_LABEL[product.condition as ConditionKey]],
    ["Category", CATEGORY_LABEL[product.category as CategoryKey]],
    ["Subcategory", product.subcategory],
    ["Material", product.material],
    ["Color", product.color],
    ["Sourced from", product.boutique],
  ];

  return (
    <div className="space-y-16">
      <div className="space-y-6">
        <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/" className="hover:text-foreground">
                Home
              </Link>
            </li>
            {dept && (
              <li className="flex items-center gap-2">
                <span aria-hidden>/</span>
                <Link
                  href={`/shop?department=${dept}`}
                  className="hover:text-foreground"
                >
                  {DEPARTMENT_LABEL[dept]}
                </Link>
              </li>
            )}
            <li className="flex items-center gap-2">
              <span aria-hidden>/</span>
              <Link
                href={`/shop?${new URLSearchParams({ ...(dept ? { department: dept } : {}), category: product.category })}`}
                className="hover:text-foreground"
              >
                {CATEGORY_LABEL[product.category as CategoryKey]}
              </Link>
            </li>
          </ol>
        </nav>

        <div className="grid gap-10 md:grid-cols-2">
          <ProductGallery
            images={product.imagePublicIds}
            alt={`${product.designer} ${product.title}`}
          />

          <div className="space-y-6">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                {product.designer}
              </p>
              <h1 className="font-display text-3xl font-semibold tracking-tight">
                {product.title}
              </h1>
              <p className="flex items-baseline gap-3 text-xl">
                <Price usdCents={product.priceUsdCents} />
                {discount > 0 && product.originalPriceUsdCents && (
                  <>
                    <Price
                      usdCents={product.originalPriceUsdCents}
                      className="text-sm text-muted-foreground line-through"
                    />
                    <span className="text-xs text-destructive">
                      −{discount}%
                    </span>
                  </>
                )}
              </p>
            </div>

            <PurchasePanel
              productId={product.id}
              sizes={product.sizes}
              signedIn={!!user}
              defaultEmail={user?.email ?? ""}
              initiallyWished={wishedIds.includes(product.id)}
            />

            <div className="border-t">
              <details className="group border-b py-4 text-sm" open>
                <summary className="flex cursor-pointer list-none items-center justify-between font-medium">
                  Details
                  <ChevronDown
                    className="h-4 w-4 transition-transform group-open:rotate-180"
                    aria-hidden
                  />
                </summary>
                <dl className="mt-3 grid grid-cols-[120px_1fr] gap-y-1.5 text-muted-foreground">
                  {details
                    .filter(([, v]) => v)
                    .map(([k, v]) => (
                      <div key={k} className="contents">
                        <dt>{k}</dt>
                        <dd className="text-foreground">{v}</dd>
                      </div>
                    ))}
                </dl>
              </details>

              <details className="group border-b py-4 text-sm">
                <summary className="flex cursor-pointer list-none items-center justify-between font-medium">
                  Shipping &amp; duties
                  <ChevronDown
                    className="h-4 w-4 transition-transform group-open:rotate-180"
                    aria-hidden
                  />
                </summary>
                <p className="mt-3 leading-relaxed text-muted-foreground">
                  Shipped DHL Express DDP (Delivered Duty Paid). Import duties
                  and taxes are pre-calculated at checkout, so there&apos;s
                  nothing to pay on delivery. Shipping is complimentary on
                  orders over {threshold}.
                </p>
              </details>
            </div>

            {user?.role === "ADMIN" && (
              <Button asChild variant="outline" size="sm">
                <Link href={`/admin/products/${product.id}/edit`}>
                  Edit product
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section aria-labelledby="related-heading" className="space-y-6">
          <h2
            id="related-heading"
            className="text-sm font-semibold uppercase tracking-[0.12em]"
          >
            You may also like
          </h2>
          <ProductGrid products={related} />
        </section>
      )}
    </div>
  );
}
