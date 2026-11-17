import Link from "next/link";
import { Reveal } from "../shared/reveal";
import { Button } from "../ui/button";
import { PARTNER_BOUTIQUES } from "../../../prisma/seed-data/catalog";
import { ArrowRight } from "lucide-react";

// interface PartnerBoutiqueProps {
//   onNavigate: (path: string) => void;
// }

export const PartnerBoutique = () => {
//   const handleLink = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
//     e.preventDefault();
//     onNavigate(path);
//   };

  return (
    <Reveal>
      <section aria-labelledby="partner-boutique">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-[#E5E5E5] bg-[#FAFAFA] p-8 sm:p-10 flex flex-col justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#666666]">
                Global Atelier Network
              </p>
              <h2 className="font-display text-3xl font-medium text-[#111111] mt-2">
                {PARTNER_BOUTIQUES.length} Independent Partner Boutiques
              </h2>
              <p className="text-xs sm:text-sm text-[#555555] leading-relaxed mt-3">
                From Via Montenapoleone in Milan to Rue Saint-Honoré in Paris
                and Mayfair in London, browse curated inventory directly from
                each flagship salon.
              </p>
            </div>
            <div className="mt-7">
              <a
                href="/gh/boutiques"
                // onClick={(e) => handleLink(e, "/gh/boutiques")}
                className="inline-flex items-center gap-2 border border-[#111111] bg-white hover:bg-[#111111] text-[#111111] hover:text-white px-6 py-3 text-xs font-semibold uppercase tracking-[0.14em] transition-colors"
              >
                <span>Explore Partner Boutiques</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          <div className="border border-[#E5E5E5] bg-[#FAFAFA] p-8 sm:p-10 flex flex-col justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#666666]">
                A–Z Index
              </p>
              <h2 className="font-display text-3xl font-medium text-[#111111] mt-2">
                Designers &amp; Maisons
              </h2>
              <p className="text-xs sm:text-sm text-[#555555] leading-relaxed mt-3">
                Navigate Bottega Veneta, Brioni, Chanel Pre-Owned, Khaite,
                Loewe, Max Mara, Miu Miu, Prada, Saint Laurent, The Row, and
                Toteme.
              </p>
            </div>
            <div className="mt-7">
              <a
                href="/gh/designers"
                // onClick={(e) => handleLink(e, "/gh/designers")}
                className="inline-flex items-center gap-2 border border-[#111111] bg-white hover:bg-[#111111] text-[#111111] hover:text-white px-6 py-3 text-xs font-semibold uppercase tracking-[0.14em] transition-colors"
              >
                <span>Browse Designers A–Z</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </section>
    </Reveal>
  );
};
