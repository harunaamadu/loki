import Link from "next/link";
import { Menu } from "lucide-react";
import { signOutAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ACCOUNT_LINKS, DEPARTMENTS } from "@/config/nav";
import { cn } from "@/lib/utils";

interface MobileNavProps {
  className?: string;
  signedIn: boolean;
  isAdmin: boolean;
}

export function MobileNav({ className, signedIn, isAdmin }: MobileNavProps) {
  const onlyMobile = "min-[431px]:hidden";

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          aria-label="Open menu"
          className={cn(onlyMobile, className)}
        >
          <Menu />
        </Button>
      </SheetTrigger>

      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle className="text-xl">Menu</SheetTitle>
          <SheetDescription className="sr-only">
            Browse departments and manage your account.
          </SheetDescription>
        </SheetHeader>

        <nav aria-label="Mobile navigation" className="grid flex-1 auto-rows-min gap-1 px-4">
          {DEPARTMENTS.map(([key, label]) => (
            <SheetClose asChild key={key}>
              <Button asChild variant="ghost" className="justify-start">
                <Link href={`/shop?department=${key}`}>{label}</Link>
              </Button>
            </SheetClose>
          ))}

          {signedIn &&
            ACCOUNT_LINKS.map(([href, label]) => (
              <SheetClose asChild key={href}>
                <Button asChild variant="ghost" className="justify-start">
                  <Link href={href}>{label}</Link>
                </Button>
              </SheetClose>
            ))}
        </nav>

        <SheetFooter>
          {isAdmin && (
            <SheetClose asChild>
              <Button asChild variant="secondary">
                <Link href="/admin">Admin</Link>
              </Button>
            </SheetClose>
          )}

          {signedIn ? (
            <form action={signOutAction}>
              <Button type="submit" variant="ghost" className="w-full">
                Sign out
              </Button>
            </form>
          ) : (
            <SheetClose asChild>
              <Button asChild variant="ghost">
                <Link href="/login">Sign in</Link>
              </Button>
            </SheetClose>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}