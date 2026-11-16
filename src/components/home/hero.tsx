"use client";

import { useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Button } from "@/components/ui/button";
import { ProductImage } from "@/components/product/product-image";

gsap.registerPlugin(useGSAP);

export function Hero({ imagePublicId }: { imagePublicId: string | null }) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from("[data-hero]", {
          y: 40,
          opacity: 0,
          duration: 0.8,
          stagger: 0.12,
          ease: "power3.out",
        });
        gsap.from("[data-hero-image]", {
          clipPath: "inset(0 0 100% 0)",
          duration: 1.1,
          ease: "power3.inOut",
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      className="grid items-center gap-10 border-b pb-12 md:grid-cols-2 md:pb-16"
    >
      <div className="space-y-6">
        <p
          data-hero
          className="text-xs uppercase tracking-[0.2em] text-muted-foreground"
        >
          New season
        </p>
        <h1
          data-hero
          className="font-display text-4xl font-semibold leading-tight tracking-tight md:text-5xl"
        >
          Independent luxury, delivered to your door.
        </h1>
        <p
          data-hero
          className="max-w-md text-sm leading-relaxed text-muted-foreground"
        >
          Pieces from independent boutiques across Europe and North America,
          shipped DHL Express DDP to Accra, Kumasi and Takoradi with import
          duties pre-calculated at checkout.
        </p>
        <div data-hero className="flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link href="/shop?department=WOMEN">Shop women</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/shop?department=MEN">Shop men</Link>
          </Button>
        </div>
      </div>

      <div
        data-hero-image
        className="relative aspect-4/5 overflow-hidden bg-secondary"
      >
        <ProductImage
          publicId={imagePublicId}
          alt="Featured look"
          width={1200}
          height={1500}
          sizes="(min-width: 768px) 50vw, 100vw"
          priority
        />
      </div>
    </section>
  );
}
