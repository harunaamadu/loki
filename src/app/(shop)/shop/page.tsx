import { ShopClient } from "@/components/shop/shop-client";
import { getProducts } from "@/lib/queries";
import {
  CATEGORIES,
  CONDITIONS,
  CONDITION_LABEL,
  DEPARTMENTS,
  DEPARTMENT_LABEL,
  type ConditionKey,
  type DepartmentKey,
} from "@/lib/labels";

export const dynamic = "force-dynamic";

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{
    department?: string;
    category?: string;
    condition?: string;
    designer?: string;
    q?: string;
    sale?: string;
  }>;
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
  const condition = (CONDITIONS as readonly string[]).includes(
    sp.condition ?? "",
  )
    ? sp.condition!
    : "";
  const designer = products.some((p) => p.designer === sp.designer)
    ? sp.designer!
    : "";
  const q = (sp.q ?? "").slice(0, 80);
  const sale = sp.sale === "1";

  const deptLabel = department
    ? DEPARTMENT_LABEL[department as DepartmentKey]
    : "";
  const conditionLabel = condition
    ? CONDITION_LABEL[condition as ConditionKey]
    : "";
  const title = sale
    ? deptLabel
      ? `${deptLabel} private sale`
      : "Private sale"
    : deptLabel || conditionLabel || designer || "All products";

  return (
    <div className="space-y-8">
      <h1 className="font-heading text-3xl font-semibold tracking-tight">
        {title}
      </h1>
      <ShopClient
        products={products}
        initial={{ department, category, condition, designer, q, sale }}
      />
    </div>
  );
}
