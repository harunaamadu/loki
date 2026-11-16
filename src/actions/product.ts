"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guards";
import { ActionError, fail, type ActionResult } from "@/lib/action";
import { productSchema, productUpdateSchema } from "@/lib/validations";
import { deleteCloudinaryImages } from "@/lib/cloudinary";
import { sendEmail } from "@/lib/email";
import { slugify } from "@/lib/utils";

function refresh(id?: string) {
  revalidatePath("/");
  revalidatePath("/shop");
  if (id) revalidatePath(`/product/${id}`);
}

async function deletableImages(publicIds: string[]) {
  if (publicIds.length === 0) return [];
  const used = await prisma.productImage.findMany({
    where: { publicId: { in: publicIds } },
    select: { publicId: true },
  });
  const inUse = new Set(used.map((u) => u.publicId));
  return publicIds.filter((p) => !inUse.has(p));
}

export async function createProductAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    await requireAdmin();
    const parsed = productSchema.safeParse(input);
    if (!parsed.success) throw new ActionError(parsed.error.issues[0].message);
    const { id: givenId, sizes, images, ...fields } = parsed.data;

    const id =
      givenId ??
      `${slugify(`${fields.designer} ${fields.title}`).slice(0, 50) || "item"}-${randomBytes(3).toString("hex")}`;
    if (
      await prisma.product.findUnique({ where: { id }, select: { id: true } })
    ) {
      throw new ActionError("A product with this id already exists.");
    }

    await prisma.product.create({
      data: {
        id,
        ...fields,
        sizes: { create: sizes.map((s, position) => ({ ...s, position })) },
        images: {
          create: images.map((img, position) => ({ ...img, position })),
        },
      },
    });
    refresh();
    return { ok: true, data: { id } };
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
    const parsed = productUpdateSchema.safeParse(input);
    if (!parsed.success) throw new ActionError(parsed.error.issues[0].message);
    const { sizes, images, ...fields } = parsed.data;

    const existing = await prisma.product.findUnique({
      where: { id },
      include: { sizes: true, images: { select: { publicId: true } } },
    });
    if (!existing) throw new ActionError("Product not found.");

    const keepImages = new Set(images.map((i) => i.publicId));
    const removedImages = existing.images
      .map((i) => i.publicId)
      .filter((p) => !keepImages.has(p));

    await prisma.$transaction([
      prisma.product.update({ where: { id }, data: fields }),
      ...sizes.map((s, position) =>
        prisma.productSize.upsert({
          where: { productId_size: { productId: id, size: s.size } },
          update: { stock: s.stock, position },
          create: { productId: id, size: s.size, stock: s.stock, position },
        }),
      ),
      prisma.productSize.deleteMany({
        where: { productId: id, size: { notIn: sizes.map((s) => s.size) } },
      }),
      prisma.bagItem.deleteMany({
        where: { productId: id, size: { notIn: sizes.map((s) => s.size) } },
      }),
      prisma.productImage.deleteMany({ where: { productId: id } }),
      prisma.productImage.createMany({
        data: images.map((img, position) => ({
          ...img,
          position,
          productId: id,
        })),
      }),
    ]);

    await deleteCloudinaryImages(await deletableImages(removedImages)).catch(
      (e) => console.error(e),
    );

    // Back-in-stock: sizes that went from 0 (or missing) to > 0
    try {
      const prev = new Map(existing.sizes.map((s) => [s.size, s.stock]));
      for (const s of sizes) {
        if ((prev.get(s.size) ?? 0) === 0 && s.stock > 0) {
          const alerts = await prisma.restockAlert.findMany({
            where: { productId: id, size: s.size, status: "PENDING" },
          });
          for (const a of alerts) {
            await sendEmail({
              to: a.email,
              subject: `Back in stock: ${a.productTitle}`,
              html: `<p>${a.designer} ${a.productTitle} (size ${a.size}) is available again.</p>`,
            });
          }
          if (alerts.length) {
            await prisma.restockAlert.updateMany({
              where: { id: { in: alerts.map((a) => a.id) } },
              data: { status: "NOTIFIED" },
            });
          }
        }
      }
    } catch (e) {
      console.error("Restock notification failed", e);
    }

    refresh(id);
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
    await prisma.product.delete({ where: { id } });
    await deleteCloudinaryImages(
      await deletableImages(existing.images.map((i) => i.publicId)),
    ).catch((e) => console.error(e));
    refresh(id);
    return { ok: true, data: undefined };
  } catch (e) {
    return fail(e);
  }
}
