import Link from "next/link";
import { auth } from "@/auth";
import { signOutAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { CartButton } from "@/components/layout/cart-button";

export async function Header() {
  const session = await auth();
  const user = session?.user;

  return (
    <header className="border-b">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Loki
        </Link>
        <nav className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link href="/shop">Shop</Link>
          </Button>
          {user?.role === "ADMIN" && (
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/products/new">Add product</Link>
            </Button>
          )}
          {user ? (
            <form action={signOutAction}>
              <Button type="submit" variant="ghost" size="sm">
                Sign out
              </Button>
            </form>
          ) : (
            <Button asChild variant="ghost" size="sm">
              <Link href="/login">Sign in</Link>
            </Button>
          )}
          <CartButton />
        </nav>
      </div>
    </header>
  );
}
