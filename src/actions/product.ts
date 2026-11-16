"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guards";
import { ActionError, fail, type ActionResult } from "@/lib/action";
import { productSchema } from "@/lib/validations";
import { deleteCloudinaryImages } from "@/lib/cloudinary";
import { slugify } from "@/lib/utils";

function refresh() {
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/admin/products");
}

async function uniqueSlug(name: string) {
  const base = slugify(name) || "product";
  const taken = await prisma.product.findUnique({
    where: { slug: base },
    select: { id: true },
  });
  return taken ? `${base}-${crypto.randomUUID().slice(0, 6)}` : base;
}

export async function createProductAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    await requireAdmin();
    const parsed = productSchema.safeParse(input);
    if (!parsed.success) throw new ActionError(parsed.error.issues[0].message);
    const { images, ...data } = parsed.data;

    const product = await prisma.product.create({
      data: {
        ...data,
        slug: await uniqueSlug(data.name),
        images: {
          create: images.map((img, position) => ({ ...img, position })),
        },
      },
      select: { id: true },
    });
    refresh();
    return { ok: true, data: { id: product.id } };
  } catch (e) {
    return fail(e);
  }
}

export async function updateProductAction(
  id: string,
  input: unknown,
): Promise<ActionResult> {
  try {
    await requireAdmin();
    const parsed = productSchema.safeParse(input);
    if (!parsed.success) throw new ActionError(parsed.error.issues[0].message);
    const { images, ...data } = parsed.data;

    const existing = await prisma.product.findUnique({
      where: { id },
      select: { images: { select: { publicId: true } } },
    });
    if (!existing) throw new ActionError("Product not found.");

    const keep = new Set(images.map((i) => i.publicId));
    const removed = existing.images
      .map((i) => i.publicId)
      .filter((p) => !keep.has(p));

    await prisma.$transaction([
      prisma.productImage.deleteMany({ where: { productId: id } }),
      prisma.product.update({
        where: { id },
        data: {
          ...data,
          images: {
            create: images.map((img, position) => ({ ...img, position })),
          },
        },
      }),
    ]);
    await deleteCloudinaryImages(removed);
    refresh();
    return { ok: true, data: undefined };
  } catch (e) {
    return fail(e);
  }
}

export async function deleteProductAction(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    const existing = await prisma.product.findUnique({
      where: { id },
      select: { images: { select: { publicId: true } } },
    });
    if (!existing) throw new ActionError("Product not found.");

    await prisma.product.delete({ where: { id } }); // order history is kept (SetNull)
    await deleteCloudinaryImages(existing.images.map((i) => i.publicId));
    refresh();
    return { ok: true, data: undefined };
  } catch (e) {
    return fail(e);
  }
}
