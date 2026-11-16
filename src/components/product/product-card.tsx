import Link from "next/link";
import { CldImage } from "next-cloudinary";
import { AddToCartButton } from "@/components/product/add-to-cart-button";
import { formatPrice } from "@/lib/utils";
import type { ProductListItem } from "@/lib/types";

export function ProductCard({ product }: { product: ProductListItem }) {
  return (
    <div className="flex flex-col border">
      <Link
        href={`/product/${product.slug}`}
        className="block aspect-square bg-muted"
      >
        {product.image && (
          <CldImage
            src={product.image.publicId}
            width={600}
            height={600}
            crop="fill"
            gravity="auto"
            alt={product.name}
            className="aspect-square w-full object-cover"
          />
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          {product.categoryName}
        </p>
        <Link href={`/product/${product.slug}`} className="font-medium">
          {product.name}
        </Link>
        <div className="flex items-baseline gap-2">
          <span className="font-semibold">
            {formatPrice(product.priceCents)}
          </span>
          {product.compareAtPriceCents &&
            product.compareAtPriceCents > product.priceCents && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(product.compareAtPriceCents)}
              </span>
            )}
        </div>
        <div className="mt-auto pt-2">
          <AddToCartButton
            item={{
              productId: product.id,
              slug: product.slug,
              name: product.name,
              priceCents: product.priceCents,
              image: product.image?.publicId ?? null,
              stock: product.stock,
            }}
          />
        </div>
      </div>
    </div>
  );
}
