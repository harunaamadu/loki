"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createProductAction } from "@/actions/product";
import {
  ImageUploader,
  type UploadedImage,
} from "@/components/admin/image-uploader";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function ProductForm({
  categories,
}: {
  categories: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [featured, setFeatured] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const price = Number.parseFloat(String(fd.get("price") ?? ""));
    const compare = String(fd.get("compare") ?? "").trim();

    startTransition(async () => {
      const res = await createProductAction({
        name: String(fd.get("name") ?? ""),
        description: String(fd.get("description") ?? ""),
        priceCents: Number.isFinite(price) ? Math.round(price * 100) : -1,
        compareAtPriceCents: compare
          ? Math.round(Number.parseFloat(compare) * 100)
          : null,
        stock: Number.parseInt(String(fd.get("stock") ?? "0"), 10) || 0,
        categoryId: String(fd.get("categoryId") ?? ""),
        isActive: true,
        isFeatured: featured,
        images,
      });
      if (!res.ok) {
        setError(res.error);
        toast.error(res.error);
        return;
      }
      toast.success("Product created");
      router.push("/shop");
    });
  }

  return (
    <form onSubmit={onSubmit} className="max-w-xl space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" required rows={5} />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-2">
          <Label htmlFor="price">Price</Label>
          <Input
            id="price"
            name="price"
            type="number"
            step="0.01"
            min="0"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="compare">Compare-at</Label>
          <Input
            id="compare"
            name="compare"
            type="number"
            step="0.01"
            min="0"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="stock">Stock</Label>
          <Input
            id="stock"
            name="stock"
            type="number"
            min="0"
            step="1"
            defaultValue={0}
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="categoryId">Category</Label>
        <select
          id="categoryId"
          name="categoryId"
          required
          className="h-9 w-full border bg-background px-3 text-sm"
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox
          id="featured"
          checked={featured}
          onCheckedChange={(v) => setFeatured(v === true)}
        />
        <Label htmlFor="featured">Featured on home page</Label>
      </div>

      <div className="space-y-2">
        <Label>Images</Label>
        <ImageUploader
          images={images}
          onAdd={(img) => setImages((prev) => [...prev, img])}
          onRemove={(id) =>
            setImages((prev) => prev.filter((i) => i.publicId !== id))
          }
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Create product"}
      </Button>
    </form>
  );
}
