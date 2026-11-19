"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductImage } from "@/components/product/product-image";
import { cn } from "@/lib/utils";

const SWIPE_PX = 60;

export function ProductGallery({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const [active, setActive] = useState(0);
  const count = images.length;

  if (count === 0) {
    return (
      <div className="aspect-4/5 overflow-hidden">
        <ProductImage publicId={null} alt={alt} />
      </div>
    );
  }

  const go = (delta: number) => setActive((i) => (i + delta + count) % count);

  return (
    <div className={cn("grid gap-3", count > 1 && "md:grid-cols-[72px_1fr]")}>
      {count > 1 && (
        <div className="order-2 flex gap-2 overflow-x-auto md:order-1 md:flex-col">
          {images.map((id, i) => (
            <button
              key={id}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Show image ${i + 1} of ${count}`}
              aria-current={i === active ? "true" : undefined}
              className={cn(
                "aspect-4/5 w-16 shrink-0 overflow-hidden border bg-secondary transition-opacity",
                i === active
                  ? "border-foreground"
                  : "border-transparent opacity-60 hover:opacity-100",
              )}
            >
              <ProductImage
                publicId={id}
                alt=""
                width={160}
                height={200}
                sizes="72px"
              />
            </button>
          ))}
        </div>
      )}

      <div
        role="group"
        aria-roledescription="carousel"
        aria-label={`${alt} images`}
        tabIndex={count > 1 ? 0 : undefined}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") go(-1);
          if (e.key === "ArrowRight") go(1);
        }}
        className="relative order-1 aspect-4/5 overflow-hidden bg-secondary focus-visible:outline-2 focus-visible:outline-foreground md:order-2"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={images[active]}
            className="absolute inset-0 touch-pan-y [&_img]:pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            drag={count > 1 ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.15}
            onDragEnd={(_, info) => {
              if (info.offset.x < -SWIPE_PX) go(1);
              else if (info.offset.x > SWIPE_PX) go(-1);
            }}
          >
            <ProductImage
              publicId={images[active]}
              alt={alt}
              width={1200}
              height={1500}
              sizes="(min-width: 768px) 50vw, 100vw"
              priority={active === 0}
            />
          </motion.div>
        </AnimatePresence>

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous image"
              className="absolute left-2 top-1/2 -translate-y-1/2 cursor-pointer bg-background/80 p-2 backdrop-blur hover:bg-background"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next image"
              className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer bg-background/80 p-2 backdrop-blur hover:bg-background"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <p
              aria-live="polite"
              className="absolute bottom-2 right-2 bg-background/80 px-2 py-0.5 text-[11px] tabular-nums backdrop-blur"
            >
              {active + 1} / {count}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
