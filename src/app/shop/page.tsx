import { ShopClient } from "@/components/layout/shop-client";
import { getCategories, getProducts } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function ShopPage() {
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">Shop</h1>
      <ShopClient
        products={products}
        categories={categories.map((c) => ({ slug: c.slug, name: c.name }))}
      />
    </div>
  );
}