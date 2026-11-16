import { ProductCard } from "@/components/product/product-card";
import { requirePageUser } from "@/lib/guards";
import { getWishlistProducts } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function WishlistPage() {
  const user = await requirePageUser("/wishlist");
  const items = await getWishlistProducts(user.id);
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">Wishlist</h1>
      {items.length === 0 ? (
        <p className="text-muted-foreground">Nothing saved yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
          {items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
