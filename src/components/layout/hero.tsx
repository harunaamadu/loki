"use client";

import { useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Button } from "@/components/ui/button";

gsap.registerPlugin(useGSAP);

export function Hero() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.from("[data-hero]", {
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.12,
        ease: "power3.out",
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} className="border-b py-16">
      <p
        data-hero
        className="text-sm uppercase tracking-widest text-muted-foreground"
      >
        New season
      </p>
      <h1
        data-hero
        className="mt-3 max-w-2xl text-5xl font-semibold tracking-tight"
      >
        Considered essentials, delivered.
      </h1>
      <p data-hero className="mt-4 max-w-xl text-muted-foreground">
        Browse the latest arrivals and pick up your favourites.
      </p>
      <div data-hero className="mt-8">
        <Button asChild size="lg">
          <Link href="/shop">Shop now</Link>
        </Button>
      </div>
    </section>
  );
}
