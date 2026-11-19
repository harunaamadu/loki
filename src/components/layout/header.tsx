import Link from "next/link";
import { cookies } from "next/headers";
import { auth } from "@/auth";
import { signOutAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { CurrencyToggle } from "@/components/shared/money";
import { PromoBanner } from "@/components/layout/promo-banner";
import { PROMO_COOKIE } from "@/config/store";
import { BagButton } from "../bag/bag-drawer";
import { MobileNav } from "./mobile-nav";
import { ACCOUNT_LINKS, DEPARTMENTS } from "@/config/nav";

export async function Header() {
  const [session, jar] = await Promise.all([auth(), cookies()]);
  const user = session?.user;
  const dismissed = jar.get(PROMO_COOKIE)?.value === "1";
  const onlyDesktop = "max-[430px]:hidden";

  return (
    <>
      <PromoBanner initiallyDismissed={dismissed} />
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
        <div className="mx-auto flex min-h-14 max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-2 sm:px-8">
          <div className="flex items-center gap-2">
            <MobileNav signedIn={!!user} isAdmin={user?.role === "ADMIN"} />
            <Link
              href="/"
              className="font-heading text-2xl font-semibold tracking-[0.22em]"
            >
              LOKI
            </Link>
          </div>

          <nav
            aria-label="Main navigation"
            className="flex flex-wrap items-center gap-1"
          >
            {DEPARTMENTS.map(([key, label]) => (
              <Button
                key={key}
                asChild
                variant="ghost"
                size="sm"
                className={onlyDesktop}
              >
                <Link href={`/shop?department=${key}`}>{label}</Link>
              </Button>
            ))}

            {user &&
              ACCOUNT_LINKS.map(([href, label]) => (
                <Button
                  key={href}
                  asChild
                  variant="ghost"
                  size="sm"
                  className={onlyDesktop}
                >
                  <Link href={href}>{label}</Link>
                </Button>
              ))}

            {user?.role === "ADMIN" && (
              <Button
                asChild
                variant="secondary"
                size="sm"
                className={onlyDesktop}
              >
                <Link href="/admin">Admin</Link>
              </Button>
            )}

            {user ? (
              <form action={signOutAction} className={onlyDesktop}>
                <Button type="submit" variant="ghost" size="sm">
                  Sign out
                </Button>
              </form>
            ) : (
              <Button asChild variant="ghost" size="sm" className={onlyDesktop}>
                <Link href="/login">Sign in</Link>
              </Button>
            )}

            <CurrencyToggle />
            <BagButton />
          </nav>
        </div>
      </header>
    </>
  );
}
