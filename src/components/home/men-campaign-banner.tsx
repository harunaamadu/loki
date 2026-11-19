import Link from "next/link";
import { ProductImage } from "@/components/product/product-image";
import { Reveal } from "@/components/shared/reveal";
import { HERO_BANNERS } from "@/config/hero";
import { Button } from "../ui/button";

export function MenCampaignBanner() {
  const men = HERO_BANNERS.find((b) => b.department === "MEN");

  return (
    <Reveal>
      <section aria-labelledby="men-campaign-heading">
        {/* Always dark, in light and dark mode, so it uses palette colours rather than theme tokens */}
        <div className="grid grid-cols-1 border border-border bg-neutral-900 text-white lg:grid-cols-12">
          <div className="relative min-h-70 overflow-hidden bg-neutral-800 sm:min-h-90 lg:col-span-7">
            <div className="absolute inset-0">
              <ProductImage
                publicId={men?.publicId ?? null}
                alt="Men's Italian tailoring and camel cashmere overcoat"
                width={1400}
                height={900}
                sizes="(min-width: 1024px) 58vw, 100vw"
                className="object-top"
              />
            </div>
          </div>

          <div className="flex flex-col justify-center p-8 sm:p-12 lg:col-span-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
              Menswear &amp; Archive Highlights
            </p>
            <h2
              id="men-campaign-heading"
              className="mt-2 font-heading text-3xl font-medium leading-tight sm:text-4xl"
            >
              Roman Cashmere &amp; Parisian Travel Leather
            </h2>
            <p className="mt-4 text-xs leading-relaxed text-neutral-300 sm:text-sm">
              Discover Brioni double-breasted greatcoats, unlined Italian suede
              loafers, and private archive reductions up to 15% off with direct
              Ghana dispatch.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button variant="secondary" size="lg" asChild>
                <Link
                  href="/shop?department=MEN"
                  className="text-xs font-semibold uppercase tracking-[0.14em]"
                >
                  Explore Menswear
                </Link>
              </Button>

              <Button variant="outline" size="lg" asChild>
                <Link
                  href="/shop?sale=1"
                  className="bg-transparent text-xs font-semibold uppercase tracking-[0.14em]"
                >
                  Shop Private Sale
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Reveal>
  );
}
