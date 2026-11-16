import { notFound } from "next/navigation";
import { CldImage } from "next-cloudinary";
import { AddToCartButton } from "@/components/product/add-to-cart-button";
import { getProductBySlug } from "@/lib/queries";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="grid grid-cols-2 gap-3">
        {product.images.length === 0 && (
          <div className="aspect-square bg-muted" />
        )}
        {product.images.map((img) => (
          <CldImage
            key={img.id}
            src={img.publicId}
            width={800}
            height={800}
            crop="fill"
            gravity="auto"
            alt={product.name}
            className="aspect-square w-full object-cover"
          />
        ))}
      </div>
      <div className="space-y-4">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          {product.category.name}
        </p>
        <h1 className="text-3xl font-semibold">{product.name}</h1>
        <p className="text-2xl font-semibold">
          {formatPrice(product.priceCents)}
        </p>
        <p className="whitespace-pre-line text-muted-foreground">
          {product.description}
        </p>
        <p className="text-sm">
          {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
        </p>
        <AddToCartButton
          item={{
            productId: product.id,
            slug: product.slug,
            name: product.name,
            priceCents: product.priceCents,
            image: product.images[0]?.publicId ?? null,
            stock: product.stock,
          }}
        />
      </div>
    </div>
  );
}
