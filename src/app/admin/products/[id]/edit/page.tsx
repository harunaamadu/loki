import { notFound } from "next/navigation";
import {
  ProductForm,
  type ProductFormValues,
} from "@/components/admin/product-form";
import { requirePageAdmin } from "@/lib/guards";
import { getProductRow } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePageAdmin();
  const { id } = await params;
  const p = await getProductRow(id);
  if (!p) notFound();

  const initial: ProductFormValues = {
    department: p.department,
    designer: p.designer,
    title: p.title,
    category: p.category,
    subcategory: p.subcategory ?? "",
    priceUsd: (p.priceUsdCents / 100).toFixed(2),
    originalPriceUsd: p.originalPriceUsdCents
      ? (p.originalPriceUsdCents / 100).toFixed(2)
      : "",
    color: p.color ?? "",
    material: p.material ?? "",
    condition: p.condition,
    boutique: p.boutique ?? "",
    sizes: p.sizes.map((s) => ({ size: s.size, stock: s.stock })),
    images: p.images.map((i) => ({
      publicId: i.publicId,
      url: i.url,
      width: i.width,
      height: i.height,
    })),
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">Edit product</h1>
      <ProductForm productId={p.id} initial={initial} />
    </div>
  );
}
