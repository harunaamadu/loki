"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { FOOTER_GROUPS } from "@/config/footer-links";
import { NewsletterSignup } from "@/components/layout/newsletter-signup";
import { useUIStore } from "@/store/ui-store";
import { useHydrated } from "@/hooks/use-hydrated";
import { cn } from "@/lib/utils";
import type { CurrencyKey } from "@/lib/labels";

interface FooterProps {
  defaultSubscriberEmail?: string;
}

const CURRENCY_OPTIONS: [CurrencyKey, string][] = [
  ["USD", "USD ($)"],
  ["GHS", "GHS (₵)"],
];

// The Vite app served everything under /gh. The Next.js routes are at the root.
function normalizePath(path: string) {
  return path.replace(/^\/gh(?=\/|\?|#|$)/, "") || "/";
}

function FooterLink({
  path,
  className,
  children,
}: {
  path: string;
  className?: string;
  children: React.ReactNode;
}) {
  if (/^(https?:|mailto:|tel:)/.test(path)) {
    const external = path.startsWith("http");
    return (
      <a
        href={path}
        className={className}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {children}
      </a>
    );
  }
  return (
    <Link href={normalizePath(path)} className={className}>
      {children}
    </Link>
  );
}

export function Footer({ defaultSubscriberEmail = "" }: FooterProps) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const currency = useUIStore((s) => s.currency);
  const setCurrency = useUIStore((s) => s.setCurrency);
  const hydrated = useHydrated();
  const activeCurrency: CurrencyKey = hydrated ? currency : "USD";

  const toggleSection = (id: string) =>
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <footer className="mt-20 border-t border-border bg-secondary">
      <div className="mx-auto max-w-6xl px-4 pb-10 pt-10 sm:px-8 md:pt-14">
        {/* Newsletter Subscription Band */}
        <NewsletterSignup defaultEmail={defaultSubscriberEmail} />

        {/* Brand Overview & Regional Currency Settlement */}
        <div className="flex flex-col gap-8 border-b border-border py-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-md">
            <Link
              href="/"
              className="font-heading text-2xl font-semibold tracking-[0.22em]"
            >
              LOKI
            </Link>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              Connecting discerning wardrobes in Accra, Kumasi, Takoradi,
              London, and Paris directly to independent luxury boutiques across
              Europe and North America.
            </p>
          </div>

          <div className="space-y-3 text-xs md:text-right">
            <p className="font-semibold uppercase tracking-[0.12em]">
              Destination &amp; Currency
            </p>
            <p className="text-muted-foreground">
              DHL Express DDP · Ghana (Accra · Kumasi · Takoradi)
            </p>
            <div
              className="inline-flex border border-border bg-background"
              role="group"
              aria-label="Currency"
            >
              {CURRENCY_OPTIONS.map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={activeCurrency === value}
                  onClick={() => setCurrency(value)}
                  className={cn(
                    "cursor-pointer px-3.5 py-2 text-xs font-medium transition-colors",
                    activeCurrency === value
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground">
              Privilege codes:{" "}
              <span className="font-medium text-foreground">LOKI10</span> (10%
              off) ·{" "}
              <span className="font-medium text-foreground">ACCRAVIP</span>{" "}
              ($150 off $1,000+)
            </p>
          </div>
        </div>

        {/* Main 4-column navigation: accordion on mobile, always expanded on desktop */}
        <nav
          aria-label="Footer navigation"
          className="grid grid-cols-1 md:grid-cols-4 md:gap-8 md:pt-10"
        >
          {FOOTER_GROUPS.map((group) => {
            const isOpen = Boolean(openSections[group.id]);
            const panelId = `footer-panel-${group.id}`;

            return (
              <div
                key={group.id}
                className="border-b border-border md:border-b-0"
              >
                <button
                  type="button"
                  onClick={() => toggleSection(group.id)}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  data-testid={`footer-toggle-${group.id}`}
                  className="flex min-h-12 w-full cursor-pointer items-center justify-between gap-4 py-3.5 text-left focus-visible:outline-2 focus-visible:outline-foreground md:hidden"
                >
                  <span className="text-xs font-semibold uppercase tracking-[0.12em]">
                    {group.title}
                  </span>
                  <ChevronDown
                    aria-hidden="true"
                    className={cn(
                      "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-150",
                      isOpen && "rotate-180",
                    )}
                  />
                </button>

                <h3 className="mb-4 hidden text-xs font-semibold uppercase tracking-[0.12em] md:block">
                  {group.title}
                </h3>

                <ul
                  id={panelId}
                  data-testid={`footer-panel-${group.id}`}
                  className={cn(
                    "space-y-2 text-xs md:block",
                    isOpen ? "block pb-5" : "hidden",
                  )}
                >
                  {group.links.map((item) => (
                    <li key={`${item.path}-${item.label}`}>
                      <FooterLink
                        path={item.path}
                        className="inline-block py-1 text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline md:py-0.5"
                      >
                        {item.label}
                      </FooterLink>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </nav>
      </div>

      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 border-t border-border px-4 py-5 text-[11px] text-muted-foreground sm:flex-row sm:px-8">
        <p>
          &copy; {new Date().getFullYear()} Loki Luxury Retail. All rights
          reserved.
        </p>
        <p>
          Import duties pre-calculated at checkout for seamless customs
          clearance.
        </p>
      </div>
    </footer>
  );
}
