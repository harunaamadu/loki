import Link from "next/link";
import { ProductGrid } from "@/components/product/product-grid";
import {
  getBoutiques,
  getDepartmentCounts,
  getDesigners,
  getProducts,
} from "@/lib/queries";
import {
  Hero,
  ShopByWardrobe,
  MenCampaignBanner,
  ValueProps,
  PartnerBoutique,
  RecentlyViewedProducts,
} from "@/components/home";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [latest, counts, boutiques, designers] = await Promise.all([
    getProducts({ take: 8 }),
    getDepartmentCounts(),
    getBoutiques(),
    getDesigners(),
  ]);

  return (
    <div className="space-y-16">
      <Hero />
      <ShopByWardrobe counts={counts} />
      <MenCampaignBanner />

      <section aria-labelledby="arrivals-heading" className="space-y-6">
        <div className="flex items-end justify-between">
          <h2
            id="arrivals-heading"
            className="text-sm font-semibold uppercase tracking-[0.12em]"
          >
            New arrivals
          </h2>
          <Link
            href="/shop"
            className="text-xs underline underline-offset-4 hover:text-muted-foreground"
          >
            View all
          </Link>
        </div>
        {latest.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            New pieces are on their way.
          </p>
        ) : (
          <ProductGrid products={latest} />
        )}
      </section>

      <PartnerBoutique
        boutiqueCount={boutiques.length}
        designers={designers.map((d) => d.name)}
      />
      <RecentlyViewedProducts />
      <ValueProps />
    </div>
  );
}
