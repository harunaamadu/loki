"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { addToBagAction } from "@/actions/bag";
import { toggleWishlistAction } from "@/actions/wishlist";
import { createRestockAlertAction } from "@/actions/restock";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { applyBagResult } from "@/store/bag-store";
import { useUIStore } from "@/store/ui-store";
import { FREE_SHIPPING_THRESHOLD_USD_CENTS } from "@/config/store";
import { cn } from "@/lib/utils";
import type { SizeStock } from "@/lib/types";

interface Props {
  productId: string;
  priceUsdCents: number;
  sizes: SizeStock[];
  signedIn: boolean;
  defaultEmail: string;
  initiallyWished: boolean;
}

const threshold = `$${(FREE_SHIPPING_THRESHOLD_USD_CENTS / 100).toLocaleString("en")}`;

export function PurchasePanel({
  productId,
  priceUsdCents,
  sizes,
  signedIn,
  defaultEmail,
  initiallyWished,
}: Props) {
  const router = useRouter();
  const setBagOpen = useUIStore((s) => s.setBagOpen);

  // A single-size item (most bags and jewelry) is selected for the customer
  const [size, setSize] = useState<string | null>(() =>
    sizes.length === 1 && sizes[0].stock > 0 ? sizes[0].size : null,
  );
  const [sizeError, setSizeError] = useState(false);
  const [wished, setWished] = useState(initiallyWished);
  const [email, setEmail] = useState(defaultEmail);
  const [bagPending, startBag] = useTransition();
  const [wishPending, startWish] = useTransition();
  const [alertPending, startAlert] = useTransition();

  const [ctaVisible, setCtaVisible] = useState(true);
  const ctaRef = useRef<HTMLDivElement>(null);
  const sizesRef = useRef<HTMLDivElement>(null);

  const selected = sizes.find((s) => s.size === size);
  const allSoldOut = sizes.every((s) => s.stock === 0);
  const loginUrl = `/login?callbackUrl=${encodeURIComponent(`/product/${productId}`)}`;
  const freeShipping = priceUsdCents >= FREE_SHIPPING_THRESHOLD_USD_CENTS;
  const showSticky = !ctaVisible && !(selected && selected.stock === 0);

  useEffect(() => {
    const el = ctaRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) =>
      setCtaVisible(entry.isIntersecting),
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  function addToBag() {
    if (!selected) {
      setSizeError(true);
      sizesRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (!signedIn) return router.push(loginUrl);
    startBag(async () => {
      if (
        applyBagResult(
          await addToBagAction({ productId, size: selected.size, quantity: 1 }),
        )
      ) {
        toast.success("Added to bag");
        setBagOpen(true);
      }
    });
  }

  function toggleWishlist() {
    if (!signedIn) return router.push(loginUrl);
    const before = wished;
    setWished(!before); // optimistic
    startWish(async () => {
      const res = await toggleWishlistAction(productId);
      if (res.ok) setWished(res.data.wished);
      else {
        setWished(before);
        toast.error(res.error);
      }
    });
  }

  return (
    <div className="space-y-4">
      {allSoldOut && (
        <p className="text-sm text-muted-foreground">
          Currently sold out. Choose a size to be emailed when it returns.
        </p>
      )}

      <div className="space-y-2">
        <div
          ref={sizesRef}
          role="radiogroup"
          aria-label="Size"
          aria-invalid={sizeError || undefined}
          className="flex flex-wrap gap-2"
        >
          {sizes.map((s) => (
            <button
              key={s.size}
              type="button"
              role="radio"
              aria-checked={size === s.size}
              title={
                s.stock === 0 ? "Sold out. Select to be notified." : undefined
              }
              onClick={() => {
                setSize(s.size);
                setSizeError(false);
              }}
              className={cn(
                "min-w-12 cursor-pointer border px-3 py-2 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground",
                size === s.size
                  ? "border-foreground bg-foreground text-background"
                  : "hover:border-foreground",
                s.stock === 0 &&
                  size !== s.size &&
                  "text-muted-foreground line-through",
              )}
            >
              {s.size}
            </button>
          ))}
        </div>
        {sizeError && (
          <p role="alert" className="text-xs text-destructive">
            Please select a size.
          </p>
        )}
        {selected && selected.stock > 0 && selected.stock <= 3 && (
          <p className="text-xs text-destructive">
            Only {selected.stock} left in this size
          </p>
        )}
      </div>

      <div ref={ctaRef}>
        {selected && selected.stock === 0 ? (
          <form
            className="space-y-2 border p-3"
            onSubmit={(e) => {
              e.preventDefault();
              startAlert(async () => {
                const res = await createRestockAlertAction({
                  productId,
                  size: selected.size,
                  email,
                });
                if (res.ok)
                  toast.success("We'll email you when it's back in stock");
                else toast.error(res.error);
              });
            }}
          >
            <p className="text-sm">
              Size {selected.size} is sold out. Get notified when it returns:
            </p>
            <Input
              type="email"
              required
              autoComplete="email"
              aria-label="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button type="submit" variant="outline" disabled={alertPending}>
              {alertPending ? "Saving…" : "Notify me"}
            </Button>
          </form>
        ) : (
          <Button className="w-full" disabled={bagPending} onClick={addToBag}>
            {bagPending ? "Adding…" : selected ? "Add to bag" : "Select a size"}
          </Button>
        )}
      </div>

      <Button
        variant="outline"
        className="w-full gap-2"
        disabled={wishPending}
        onClick={toggleWishlist}
      >
        <Heart
          className={cn("h-4 w-4", wished && "fill-current")}
          aria-hidden
        />
        {wished ? "Remove from wishlist" : "Save to wishlist"}
      </Button>

      <p className="text-xs text-muted-foreground">
        {freeShipping
          ? "Complimentary DHL Express DDP shipping. Duties are pre-calculated at checkout."
          : `Free DHL Express DDP shipping on orders over ${threshold}.`}
      </p>

      {showSticky && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/95 p-3 backdrop-blur md:hidden">
          <Button className="w-full" disabled={bagPending} onClick={addToBag}>
            {bagPending ? "Adding…" : selected ? "Add to bag" : "Select a size"}
          </Button>
        </div>
      )}
    </div>
  );
}
