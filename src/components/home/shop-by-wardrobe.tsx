import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductImage } from "@/components/product/product-image";
import { Reveal } from "@/components/shared/reveal";
import { DEPARTMENT_CARDS, type DepartmentCardKey } from "@/config/departments";

export function ShopByWardrobe({ counts }: { counts: Record<DepartmentCardKey, number> }) {
  return (
    <section aria-labelledby="wardrobe-heading">
      <div className="flex flex-col justify-between gap-4 border-b border-border pb-6 sm:flex-row sm:items-end">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Curated Departments
          </p>
          <h2 id="wardrobe-heading" className="mt-1 font-heading text-3xl font-medium sm:text-4xl">
            Shop by Wardrobe
          </h2>
        </div>
        <Link
          href="/shop"
          className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] underline-offset-4 hover:underline"
        >
          <span>Explore Complete Edit</span>
          <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-5 sm:gap-7 lg:grid-cols-4">
        {DEPARTMENT_CARDS.map((card, i) => (
          <Reveal key={card.key} delay={i * 0.06} className="h-full">
            <Link
              href={card.href}
              className="group block h-full border border-border bg-background transition-colors hover:border-foreground"
            >
              <div className="aspect-3/4 overflow-hidden bg-secondary">
                <div className="h-full w-full transition-transform duration-300 group-hover:scale-103">
                  <ProductImage
                    publicId={card.publicId}
                    alt={card.label}
                    width={900}
                    height={1200}
                    sizes="(min-width: 1024px) 25vw, 50vw"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between gap-2 p-4">
                <div>
                  <h3 className="font-heading text-2xl font-medium">{card.label}</h3>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">{card.subtitle}</p>
                </div>
                <span
                  className="shrink-0 text-[11px] font-medium tabular-nums text-muted-foreground"
                  aria-label={`${counts[card.key]} items`}
                >
                  {counts[card.key]}
                </span>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}