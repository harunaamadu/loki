"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { addToBagAction } from "@/actions/bag";
import { toggleWishlistAction } from "@/actions/wishlist";
import { createRestockAlertAction } from "@/actions/restock";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { applyBagResult } from "@/store/bag-store";
import { useUIStore } from "@/store/ui-store";
import { cn } from "@/lib/utils";
import type { SizeStock } from "@/lib/types";

interface Props {
  productId: string;
  sizes: SizeStock[];
  signedIn: boolean;
  defaultEmail: string;
  initiallyWished: boolean;
}

export function PurchasePanel({
  productId,
  sizes,
  signedIn,
  defaultEmail,
  initiallyWished,
}: Props) {
  const router = useRouter();
  const setBagOpen = useUIStore((s) => s.setBagOpen);
  const [size, setSize] = useState<string | null>(null);
  const [wished, setWished] = useState(initiallyWished);
  const [email, setEmail] = useState(defaultEmail);
  const [pending, start] = useTransition();

  const selected = sizes.find((s) => s.size === size);
  const loginUrl = `/login?callbackUrl=${encodeURIComponent(`/product/${productId}`)}`;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {sizes.map((s) => (
          <button
            key={s.size}
            type="button"
            onClick={() => setSize(s.size)}
            className={cn(
              "min-w-12 border px-3 py-2 text-sm",
              size === s.size &&
                "border-foreground bg-foreground text-background",
              s.stock === 0 && "text-muted-foreground line-through",
            )}
          >
            {s.size}
          </button>
        ))}
      </div>

      {selected && selected.stock > 0 && selected.stock <= 3 && (
        <p className="text-sm text-destructive">Only {selected.stock} left</p>
      )}

      {selected && selected.stock === 0 ? (
        <form
          className="space-y-2 border p-3"
          onSubmit={(e) => {
            e.preventDefault();
            start(async () => {
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
            This size is sold out. Get notified when it returns:
          </p>
          <Input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button type="submit" variant="outline" disabled={pending}>
            Notify me
          </Button>
        </form>
      ) : (
        <Button
          className="w-full"
          disabled={!selected || pending}
          onClick={() => {
            if (!signedIn) return router.push(loginUrl);
            start(async () => {
              if (
                applyBagResult(
                  await addToBagAction({ productId, size, quantity: 1 }),
                )
              ) {
                toast.success("Added to bag");
                setBagOpen(true);
              }
            });
          }}
        >
          {selected ? "Add to bag" : "Select a size"}
        </Button>
      )}

      <Button
        variant="outline"
        className="w-full"
        disabled={pending}
        onClick={() => {
          if (!signedIn) return router.push(loginUrl);
          start(async () => {
            const res = await toggleWishlistAction(productId);
            if (res.ok) setWished(res.data.wished);
            else toast.error(res.error);
          });
        }}
      >
        {wished ? "Remove from wishlist" : "Save to wishlist"}
      </Button>
    </div>
  );
}
