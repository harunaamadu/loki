import { Hero } from "@/components/layout/hero";
import { ProductCard } from "@/components/product/product-card";
import { getProducts } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const featured = await getProducts({ featured: true, take: 8 });

  return (
    <div className="space-y-10">
      <Hero />
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Featured</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {/* {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))} */}
          Product Cards
        </div>
      </section>
    </div>
  );
}
