import { ProductForm } from "@/components/admin/product-form";
import { requirePageAdmin } from "@/lib/guards";
import { getCategories } from "@/lib/queries";

export default async function NewProductPage() {
  await requirePageAdmin(); // defense in depth, in addition to proxy.ts
  const categories = await getCategories();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">New product</h1>
      <ProductForm
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
      />
    </div>
  );
}
