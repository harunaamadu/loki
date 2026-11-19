import Link from "next/link";
import { ProductImage } from "@/components/product/product-image";
import {
  DEPARTMENTS,
  DEPARTMENT_LABEL,
  type DepartmentKey,
} from "@/lib/labels";

export function DepartmentTiles({
  images,
}: {
  images: Record<DepartmentKey, string | null>;
}) {
  const tiles = DEPARTMENTS.filter((d) => images[d]);
  if (tiles.length === 0) return null;

  return (
    <section aria-labelledby="departments-heading" className="space-y-4">
      <h2
        id="departments-heading"
        className="text-sm font-semibold uppercase tracking-[0.12em]"
      >
        Shop by department
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tiles.map((d) => (
          <Link
            key={d}
            href={`/shop?department=${d}`}
            className="group relative block aspect-3/4 overflow-hidden bg-secondary"
          >
            <div className="h-full w-full transition-transform duration-700 group-hover:scale-105">
              <ProductImage
                publicId={images[d]}
                alt={DEPARTMENT_LABEL[d]}
                width={900}
                height={1200}
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              />
            </div>
            <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/60 to-transparent p-5 text-white">
              <p className="font-heading text-xl tracking-wide">
                {DEPARTMENT_LABEL[d]}
              </p>
              <p className="text-xs underline-offset-4 group-hover:underline">
                Shop now
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
