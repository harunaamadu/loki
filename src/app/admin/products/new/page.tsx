import { ProductForm } from "@/components/admin/product-form";
import { requirePageAdmin } from "@/lib/guards";

export default async function NewProductPage() {
  await requirePageAdmin();
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">New product</h1>
      <ProductForm />
    </div>
  );
}