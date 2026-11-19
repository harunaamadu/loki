"use client";

import { useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ProductImage } from "@/components/product/product-image";
import { HERO_BANNERS } from "@/config/hero";

gsap.registerPlugin(useGSAP);

export function Hero() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from("[data-hero]", {
          y: 32,
          opacity: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: "power3.out",
        });
        gsap.from("[data-banner]", {
          clipPath: "inset(0 0 100% 0)",
          duration: 1.1,
          stagger: 0.15,
          ease: "power3.inOut",
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} className="space-y-8">
      <div className="max-w-2xl space-y-4">
        <p
          data-hero
          className="text-xs uppercase tracking-[0.2em] text-muted-foreground"
        >
          New season
        </p>
        <h1
          data-hero
          className="font-heading text-4xl font-semibold leading-tight tracking-tight md:text-5xl"
        >
          Independent luxury, delivered to your door.
        </h1>
        <p data-hero className="text-sm leading-relaxed text-muted-foreground">
          Pieces from independent boutiques across Europe and North America,
          shipped DHL Express DDP to Accra, Kumasi and Takoradi with import
          duties pre-calculated at checkout.{" "}
          <Link
            href="/shop?department=KIDS"
            className="underline underline-offset-4 hover:text-foreground"
          >
            Shop kids
          </Link>
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {HERO_BANNERS.map((b, i) => (
          <Link
            key={b.department}
            href={b.href}
            data-banner
            className="group relative block aspect-4/5 overflow-hidden bg-secondary md:aspect-3/4 lg:aspect-4/5"
          >
            <div className="h-full w-full transition-transform duration-700 group-hover:scale-105">
              <ProductImage
                publicId={b.publicId}
                alt={`${b.label} editorial`}
                width={1100}
                height={1375}
                sizes="(min-width: 768px) 50vw, 100vw"
                priority={i === 0}
              />
            </div>
            <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/65 to-transparent p-6 text-white">
              <p className="font-heading text-2xl tracking-wide">{b.label}</p>
              <p className="text-xs underline-offset-4 group-hover:underline">
                Shop the edit
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
