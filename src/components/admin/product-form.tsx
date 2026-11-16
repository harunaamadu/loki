"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createProductAction, updateProductAction } from "@/actions/product";
import {
  ImageUploader,
  type UploadedImage,
} from "@/components/admin/image-uploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CATEGORIES,
  CATEGORY_LABEL,
  CONDITIONS,
  CONDITION_LABEL,
  DEPARTMENTS,
  DEPARTMENT_LABEL,
} from "@/lib/labels";

export interface ProductFormValues {
  department: string | null;
  designer: string;
  title: string;
  category: string;
  subcategory: string;
  priceUsd: string;
  originalPriceUsd: string;
  color: string;
  material: string;
  condition: string;
  boutique: string;
  sizes: { size: string; stock: number }[];
  images: UploadedImage[];
}

const EMPTY: ProductFormValues = {
  department: "WOMEN",
  designer: "",
  title: "",
  category: "CLOTHING",
  subcategory: "",
  priceUsd: "",
  originalPriceUsd: "",
  color: "",
  material: "",
  condition: "NEW_SEASON",
  boutique: "",
  sizes: [{ size: "One Size", stock: 1 }],
  images: [],
};

const selectCls = "h-9 w-full border bg-background px-3 text-sm";
const toCents = (v: string) => Math.round(Number.parseFloat(v) * 100);

export function ProductForm({
  productId,
  initial = EMPTY,
}: {
  productId?: string;
  initial?: ProductFormValues;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [v, setV] = useState<ProductFormValues>(initial);
  const [customId, setCustomId] = useState("");
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof ProductFormValues>(
    k: K,
    val: ProductFormValues[K],
  ) => setV((p) => ({ ...p, [k]: val }));
  const nullable = (s: string) => s.trim() || null;

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const payload = {
      department: v.department || null,
      designer: v.designer,
      title: v.title,
      category: v.category,
      subcategory: nullable(v.subcategory),
      priceUsdCents: toCents(v.priceUsd),
      originalPriceUsdCents: v.originalPriceUsd.trim()
        ? toCents(v.originalPriceUsd)
        : null,
      color: nullable(v.color),
      material: nullable(v.material),
      condition: v.condition,
      boutique: nullable(v.boutique),
      sizes: v.sizes,
      images: v.images,
    };

    start(async () => {
      const res = productId
        ? await updateProductAction(productId, payload)
        : await createProductAction({
            ...payload,
            id: customId.trim() || undefined,
          });
      if (!res.ok) {
        setError(res.error);
        toast.error(res.error);
        return;
      }
      toast.success(productId ? "Product updated" : "Product created");
      router.push(productId ? `/product/${productId}` : "/shop");
      router.refresh();
    });
  }

  const text = (
    k: keyof ProductFormValues,
    label: string,
    required = false,
  ) => (
    <div className="space-y-2">
      <Label htmlFor={k}>{label}</Label>
      <Input
        id={k}
        required={required}
        value={v[k] as string}
        onChange={(e) => set(k, e.target.value as never)}
      />
    </div>
  );

  return (
    <form onSubmit={onSubmit} className="max-w-2xl space-y-4">
      {!productId && (
        <div className="space-y-2">
          <Label htmlFor="id">
            Product id (optional; auto-generated if blank)
          </Label>
          <Input
            id="id"
            value={customId}
            onChange={(e) => setCustomId(e.target.value)}
          />
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        {text("designer", "Designer", true)}
        {text("title", "Title", true)}
        <div className="space-y-2">
          <Label>Department</Label>
          <select
            className={selectCls}
            value={v.department ?? ""}
            onChange={(e) => set("department", e.target.value || null)}
          >
            <option value="">None</option>
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>
                {DEPARTMENT_LABEL[d]}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label>Category</Label>
          <select
            className={selectCls}
            value={v.category}
            onChange={(e) => set("category", e.target.value)}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABEL[c]}
              </option>
            ))}
          </select>
        </div>
        {text("subcategory", "Subcategory")}
        <div className="space-y-2">
          <Label>Condition</Label>
          <select
            className={selectCls}
            value={v.condition}
            onChange={(e) => set("condition", e.target.value)}
          >
            {CONDITIONS.map((c) => (
              <option key={c} value={c}>
                {CONDITION_LABEL[c]}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="priceUsd">Price (USD)</Label>
          <Input
            id="priceUsd"
            type="number"
            step="0.01"
            min="0.01"
            required
            value={v.priceUsd}
            onChange={(e) => set("priceUsd", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="originalPriceUsd">Original price (USD)</Label>
          <Input
            id="originalPriceUsd"
            type="number"
            step="0.01"
            min="0"
            value={v.originalPriceUsd}
            onChange={(e) => set("originalPriceUsd", e.target.value)}
          />
        </div>
        {text("color", "Color")}
        {text("material", "Material")}
        {text("boutique", "Boutique")}
      </div>

      <div className="space-y-2">
        <Label>Sizes and stock</Label>
        {v.sizes.map((s, i) => (
          <div key={i} className="flex gap-2">
            <Input
              placeholder="Size"
              value={s.size}
              onChange={(e) =>
                set(
                  "sizes",
                  v.sizes.map((x, j) =>
                    j === i ? { ...x, size: e.target.value } : x,
                  ),
                )
              }
            />
            <Input
              type="number"
              min="0"
              className="w-28"
              value={s.stock}
              onChange={(e) =>
                set(
                  "sizes",
                  v.sizes.map((x, j) =>
                    j === i
                      ? {
                          ...x,
                          stock: Number.parseInt(e.target.value, 10) || 0,
                        }
                      : x,
                  ),
                )
              }
            />
            <Button
              type="button"
              variant="ghost"
              disabled={v.sizes.length === 1}
              onClick={() =>
                set(
                  "sizes",
                  v.sizes.filter((_, j) => j !== i),
                )
              }
            >
              Remove
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          onClick={() => set("sizes", [...v.sizes, { size: "", stock: 0 }])}
        >
          Add size
        </Button>
      </div>

      <div className="space-y-2">
        <Label>Images</Label>
        <ImageUploader
          images={v.images}
          onAdd={(img) => setV((p) => ({ ...p, images: [...p.images, img] }))}
          onRemove={(id) =>
            setV((p) => ({
              ...p,
              images: p.images.filter((i) => i.publicId !== id),
            }))
          }
          onMakeMain={(id) =>
            setV((p) => ({
              ...p,
              images: [
                ...p.images.filter((i) => i.publicId === id),
                ...p.images.filter((i) => i.publicId !== id),
              ],
            }))
          }
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : productId ? "Save changes" : "Create product"}
      </Button>
    </form>
  );
}
