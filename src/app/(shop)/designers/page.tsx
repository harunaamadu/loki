import type { Metadata } from "next";
import Link from "next/link";
import { getDesigners } from "@/lib/queries";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Designers A–Z" };

function letterOf(name: string) {
  const first = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .charAt(0)
    .toUpperCase();
  return /[A-Z]/.test(first) ? first : "#";
}

export default async function DesignersPage() {
  const designers = await getDesigners();

  const groups = new Map<string, typeof designers>();
  for (const d of designers) {
    const letter = letterOf(d.name);
    groups.set(letter, [...(groups.get(letter) ?? []), d]);
  }
  const letters = [...groups.keys()].sort((a, b) =>
    a === "#" ? 1 : b === "#" ? -1 : a.localeCompare(b),
  );

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          A–Z Index
        </p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Designers &amp; Maisons
        </h1>
      </div>

      {letters.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Our designer index is coming soon.
        </p>
      ) : (
        <>
          <nav
            aria-label="Jump to letter"
            className="flex flex-wrap gap-1 border-y py-3"
          >
            {letters.map((l) => (
              <a
                key={l}
                href={`#letter-${l === "#" ? "other" : l}`}
                className="px-2.5 py-1 text-sm font-medium hover:bg-secondary"
              >
                {l}
              </a>
            ))}
          </nav>

          <div className="space-y-10">
            {letters.map((l) => (
              <section
                key={l}
                id={`letter-${l === "#" ? "other" : l}`}
                className="scroll-mt-24"
              >
                <h2 className="mb-3 border-b pb-2 font-heading text-2xl font-medium">
                  {l}
                </h2>
                <ul className="grid gap-x-8 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
                  {groups.get(l)!.map((d) => (
                    <li key={d.name}>
                      <Link
                        href={`/shop?${new URLSearchParams({ designer: d.name })}`}
                        className="flex items-baseline justify-between gap-3 py-1.5 text-sm hover:underline"
                      >
                        <span>{d.name}</span>
                        <span className="text-[11px] tabular-nums text-muted-foreground">
                          {d.count}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
