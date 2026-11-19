import Link from "next/link";
import { requirePageAdmin } from "@/lib/guards";

const LINKS = [
  ["/admin", "Overview"],
  ["/admin/products", "Products"],
  ["/admin/orders", "Orders"],
  ["/admin/restock-alerts", "Restock alerts"],
  ["/admin/subscribers", "Subscribers"],
  ["/admin/reviews", "Reviews"],
] as const;

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requirePageAdmin();
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8">
      <div className="flex items-center justify-between">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          ← Loki storefront
        </Link>
        <span className="text-xs uppercase tracking-widest text-muted-foreground">
          Admin
        </span>
      </div>
      <nav className="flex flex-wrap gap-4 border-b pb-3 text-sm">
        {LINKS.map(([href, label]) => (
          <Link key={href} href={href} className="hover:underline">
            {label}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  );
}
