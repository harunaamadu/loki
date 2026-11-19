import type { Metadata } from "next";
import Link from "next/link";
import { getBoutiques } from "@/lib/queries";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Partner boutiques" };

export default async function BoutiquesPage() {
  const boutiques = await getBoutiques();

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Global Atelier Network
        </p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Partner boutiques
        </h1>
        <p className="max-w-xl text-sm text-muted-foreground">
          Every piece is sourced from an independent boutique. Browse the edit
          from each salon.
        </p>
      </div>

      {boutiques.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Our boutique list is coming soon.
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {boutiques.map((b) => (
            <li key={b.slug}>
              <Link
                href={`/boutiques/${b.slug}`}
                className="flex h-full items-baseline justify-between gap-3 border border-border bg-background p-5 transition-colors hover:border-foreground"
              >
                <span className="font-heading text-2xl font-medium">
                  {b.name}
                </span>
                <span className="text-[11px] tabular-nums text-muted-foreground">
                  {b.count} {b.count === 1 ? "item" : "items"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
