import Link from "next/link";
import { Hero } from "@/components/home/hero";
import { DepartmentTiles } from "@/components/home/department-tiles";
import { ValueProps } from "@/components/home/value-props";
import { ProductGrid } from "@/components/product/product-grid";
import { getHomeShowcase, getProducts } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [latest, showcase] = await Promise.all([
    getProducts({ take: 8 }),
    getHomeShowcase(),
  ]);

  return (
    <div className="space-y-16">
      <Hero imagePublicId={showcase.hero} />
      <DepartmentTiles images={showcase.departments} />

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

      <ValueProps />
    </div>
  );
}
