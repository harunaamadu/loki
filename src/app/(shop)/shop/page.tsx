import { ShopClient } from "@/components/shop/shop-client";
import { getProducts } from "@/lib/queries";
import {
  CATEGORIES,
  DEPARTMENTS,
  DEPARTMENT_LABEL,
  type DepartmentKey,
} from "@/lib/labels";

export const dynamic = "force-dynamic";

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ department?: string; category?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const products = await getProducts();

  const department = (DEPARTMENTS as readonly string[]).includes(
    sp.department ?? "",
  )
    ? sp.department!
    : "";
  const category = (CATEGORIES as readonly string[]).includes(sp.category ?? "")
    ? sp.category!
    : "";
  const q = (sp.q ?? "").slice(0, 80);

  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl font-semibold tracking-tight">
        {department
          ? DEPARTMENT_LABEL[department as DepartmentKey]
          : "All products"}
      </h1>
      <ShopClient products={products} initial={{ department, category, q }} />
    </div>
  );
}
