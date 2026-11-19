"use server";

import { prisma } from "@/lib/prisma";
import { requireVerified } from "@/lib/guards";
import { ActionError, fail, type ActionResult } from "@/lib/action";
import { bagSchema, removeBagItemsSchema } from "@/lib/validations";
import { getBagForUser } from "@/lib/queries";
import type { BagLine } from "@/lib/types";

const MAX_QTY = 10;

export async function addToBagAction(
  input: unknown,
): Promise<ActionResult<BagLine[]>> {
  try {
    const user = await requireVerified();
    const parsed = bagSchema.safeParse(input);
    if (!parsed.success) throw new ActionError(parsed.error.issues[0].message);
    const { productId, size, quantity } = parsed.data;
    if (quantity < 1) throw new ActionError("Quantity must be at least 1.");

    const sizeRow = await prisma.productSize.findUnique({
      where: { productId_size: { productId, size } },
    });
    if (!sizeRow || sizeRow.stock < 1)
      throw new ActionError("This size is sold out.");

    const key = { userId_productId_size: { userId: user.id, productId, size } };
    const existing = await prisma.bagItem.findUnique({ where: key });
    const next = Math.min(
      (existing?.quantity ?? 0) + quantity,
      MAX_QTY,
      sizeRow.stock,
    );

    await prisma.bagItem.upsert({
      where: key,
      update: { quantity: next },
      create: { userId: user.id, productId, size, quantity: next },
    });
    return { ok: true, data: await getBagForUser(user.id) };
  } catch (e) {
    return fail(e);
  }
}

/** quantity 0 removes the line */
export async function setBagQuantityAction(
  input: unknown,
): Promise<ActionResult<BagLine[]>> {
  try {
    const user = await requireVerified();
    const parsed = bagSchema.safeParse(input);
    if (!parsed.success) throw new ActionError(parsed.error.issues[0].message);
    const { productId, size, quantity } = parsed.data;
    const where = {
      userId_productId_size: { userId: user.id, productId, size },
    };

    if (quantity === 0) {
      await prisma.bagItem.deleteMany({
        where: { userId: user.id, productId, size },
      });
    } else {
      const sizeRow = await prisma.productSize.findUnique({
        where: { productId_size: { productId, size } },
      });
      if (!sizeRow || sizeRow.stock < 1)
        throw new ActionError("This size is sold out.");
      await prisma.bagItem.update({
        where,
        data: { quantity: Math.min(quantity, MAX_QTY, sizeRow.stock) },
      });
    }
    return { ok: true, data: await getBagForUser(user.id) };
  } catch (e) {
    return fail(e);
  }
}

/** Removes several lines in one round trip. Always scoped to the signed-in user. */
export async function removeBagItemsAction(
  input: unknown,
): Promise<ActionResult<BagLine[]>> {
  try {
    const user = await requireVerified();
    const parsed = removeBagItemsSchema.safeParse(input);
    if (!parsed.success) throw new ActionError(parsed.error.issues[0].message);

    await prisma.bagItem.deleteMany({
      where: {
        userId: user.id,
        OR: parsed.data.map(({ productId, size }) => ({ productId, size })),
      },
    });
    return { ok: true, data: await getBagForUser(user.id) };
  } catch (e) {
    return fail(e);
  }
}
