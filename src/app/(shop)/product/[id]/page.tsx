import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { Price } from "@/components/shared/money";
import { RecentlyViewedProducts } from "@/components/home/recently-viewed-products";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductGrid } from "@/components/product/product-grid";
import { PurchasePanel } from "@/components/product/purchase-panel";
import { RecentlyViewedTracker } from "@/components/product/recently-viewed-tracker";
import { FREE_SHIPPING_THRESHOLD_USD_CENTS } from "@/config/store";
import {
  getProductById,
  getRelatedProducts,
  getReviewSummary,
  getWishlistIds,
} from "@/lib/queries";
import { cloudinaryImageUrl, jsonLd, siteUrl } from "@/lib/seo";
import { ID_REGEX } from "@/lib/validations";
import {
  CATEGORY_LABEL,
  CONDITION_LABEL,
  DEPARTMENT_LABEL,
  type CategoryKey,
  type ConditionKey,
  type DepartmentKey,
} from "@/lib/labels";
import type { Department, ProductCategory } from "@/generated/prisma/client";
import type { ProductDetail } from "@/lib/types";

import { ReviewsSection } from "@/components/reviews/reviews-section";
import { StarRating } from "@/components/reviews/star-rating";

import { ShareButton } from "@/components/product/share-button";

export const dynamic = "force-dynamic";

const validId = (id: string) => id.length <= 64 && ID_REGEX.test(id);

function describe(p: ProductDetail) {
  const made = p.material ? ` in ${p.material.toLowerCase()}` : "";
  return `${p.designer} ${p.title}${made}. Sourced from independent boutiques and shipped DHL Express DDP to Ghana.`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const p = validId(id) ? await getProductById(id) : null;
  if (!p) return { title: "Product not found" };

  const title = `${p.designer} ${p.title}`;
  const description = describe(p);
  const image = p.imagePublicIds[0]
    ? cloudinaryImageUrl(
        p.imagePublicIds[0],
        "c_fill,g_auto,w_1200,h_630,f_auto,q_auto",
      )
    : null;

  return {
    title,
    description,
    alternates: { canonical: `/product/${p.id}` },
    openGraph: {
      title,
      description,
      images: image
        ? [{ url: image, width: 1200, height: 630, alt: title }]
        : undefined,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!validId(id)) notFound();
  const product = await getProductById(id);
  if (!product) notFound();

  const session = await auth();
  const user = session?.user;
  const [wishedIds, related, summary] = await Promise.all([
    user ? getWishlistIds(user.id) : Promise.resolve([] as string[]),
    getRelatedProducts({
      id: product.id,
      category: product.category as ProductCategory,
      department: product.department as Department | null,
    }),
    getReviewSummary(product.id),
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
  const preOwned = product.condition === "PRE_OWNED";

  const details: [string, string | null][] = [
    ["Condition", CONDITION_LABEL[product.condition as ConditionKey]],
    ["Category", CATEGORY_LABEL[product.category as CategoryKey]],
    ["Subcategory", product.subcategory],
    ["Material", product.material],
    ["Color", product.color],
    ["Sourced from", product.boutique],
  ];

  const images = product.imagePublicIds
    .slice(0, 4)
    .map((pid) => cloudinaryImageUrl(pid))
    .filter((u): u is string => !!u);
  const structured = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    sku: product.id,
    description: describe(product),
    brand: { "@type": "Brand", name: product.designer },
    ...(images.length ? { image: images } : {}),
    ...(product.material ? { material: product.material } : {}),
    ...(product.color ? { color: product.color } : {}),
    ...(summary.count > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: summary.average.toFixed(1),
            reviewCount: summary.count,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
    offers: {
      "@type": "Offer",
      url: `${siteUrl()}/product/${product.id}`,
      priceCurrency: "USD",
      price: (product.priceUsdCents / 100).toFixed(2),
      availability:
        product.totalStock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      itemCondition: preOwned
        ? "https://schema.org/UsedCondition"
        : "https://schema.org/NewCondition",
    },
  };

  return (
    <div className="space-y-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(structured) }}
      />
      <RecentlyViewedTracker productId={product.id} />

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
              <div className="flex items-start justify-between gap-4">
                <h1 className="font-heading text-3xl font-semibold tracking-tight">
                  {product.title}
                </h1>
                <ShareButton
                  productId={product.id}
                  text={`${product.designer} ${product.title}`}
                />
              </div>
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
              {summary.count > 0 && (
                <a
                  href="#reviews"
                  className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  <StarRating value={summary.average} />
                  <span>
                    {summary.average.toFixed(1)} ({summary.count})
                  </span>
                </a>
              )}
            </div>

            <PurchasePanel
              productId={product.id}
              priceUsdCents={product.priceUsdCents}
              sizes={product.sizes}
              signedIn={!!user}
              defaultEmail={user?.email ?? ""}
              initiallyWished={wishedIds.includes(product.id)}
            />

            {preOwned && (
              <p className="border bg-secondary p-3 text-xs leading-relaxed text-muted-foreground">
                <span className="font-medium text-foreground">
                  Authenticated pre-owned.
                </span>{" "}
                Each piece is checked by our partner boutique before it is
                dispatched.
              </p>
            )}

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

      <ReviewsSection
        productId={product.id}
        productTitle={product.title}
        viewer={
          user
            ? { id: user.id, role: user.role, verified: user.verified }
            : null
        }
      />

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

      <RecentlyViewedProducts excludeId={product.id} />
    </div>
  );
}
