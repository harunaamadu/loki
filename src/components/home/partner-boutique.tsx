import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/shared/reveal";

interface Props {
  boutiqueCount: number;
  designers: string[];
}

const MAX_NAMES = 12;
const list = new Intl.ListFormat("en", { style: "long", type: "conjunction" });

const card =
  "flex flex-col justify-between border border-border bg-secondary p-8 sm:p-10";
const eyebrow =
  "text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground";
const cta =
  "inline-flex items-center gap-2 border border-foreground bg-background px-6 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-foreground transition-colors hover:bg-foreground hover:text-background";

export function PartnerBoutique({ boutiqueCount, designers }: Props) {
  const names =
    designers.length > MAX_NAMES
      ? `${designers.slice(0, MAX_NAMES).join(", ")}, and more`
      : list.format(designers);

  return (
    <Reveal>
      <section
        aria-label="Partner boutiques and designers"
        className="grid grid-cols-1 gap-6 md:grid-cols-2"
      >
        <div className={card}>
          <div>
            <p className={eyebrow}>Global Atelier Network</p>
            <h2 className="mt-2 font-heading text-3xl font-medium">
              {boutiqueCount} Independent Partner{" "}
              {boutiqueCount === 1 ? "Boutique" : "Boutiques"}
            </h2>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground sm:text-sm">
              From Via Montenapoleone in Milan to Rue Saint-Honoré in Paris and
              Mayfair in London, browse curated inventory directly from each
              flagship salon.
            </p>
          </div>
          <div className="mt-7">
            <Link href="/boutiques" className={cta}>
              <span>Explore Partner Boutiques</span>
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </div>
        </div>

        <div className={card}>
          <div>
            <p className={eyebrow}>A–Z Index</p>
            <h2 className="mt-2 font-heading text-3xl font-medium">
              Designers &amp; Maisons
            </h2>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground sm:text-sm">
              {designers.length > 0
                ? `Navigate ${names}.`
                : "Browse every designer and maison in our edit."}
            </p>
          </div>
          <div className="mt-7">
            <Link href="/designers" className={cta}>
              <span>Browse Designers A–Z</span>
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </section>
    </Reveal>
  );
}
