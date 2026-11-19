import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductGrid } from "@/components/product/product-grid";
import { getProductsByBoutique } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await getProductsByBoutique(slug);
  return { title: data ? `${data.name} boutique` : "Boutique not found" };
}

export default async function BoutiquePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getProductsByBoutique(slug);
  if (!data) notFound();

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Link
          href="/boutiques"
          className="text-xs text-muted-foreground underline-offset-4 hover:underline"
        >
          ← All boutiques
        </Link>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          {data.name}
        </h1>
        <p className="text-xs text-muted-foreground">
          {data.products.length} {data.products.length === 1 ? "item" : "items"}
        </p>
      </div>
      <ProductGrid products={data.products} />
    </div>
  );
}
