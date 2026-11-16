"use server";

import { prisma } from "@/lib/prisma";
import { getSessionUser, requireVerified } from "@/lib/guards";
import { rateLimit } from "@/lib/rate-limit";
import { clientIp } from "@/lib/request";
import { ActionError, fail, type ActionResult } from "@/lib/action";
import { restockSchema } from "@/lib/validations";

export async function createRestockAlertAction(
  input: unknown,
): Promise<ActionResult> {
  try {
    const parsed = restockSchema.safeParse(input);
    if (!parsed.success) throw new ActionError(parsed.error.issues[0].message);
    const { productId, size, email } = parsed.data;

    if (!(await rateLimit(`restock:ip:${await clientIp()}`, 10, 3600))) {
      throw new ActionError("Too many requests. Please try again later.");
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        title: true,
        designer: true,
        sizes: { where: { size }, select: { stock: true } },
      },
    });
    if (!product || product.sizes.length === 0)
      throw new ActionError("Product or size not found.");

    const user = await getSessionUser();
    await prisma.restockAlert.upsert({
      where: { productId_size_email: { productId, size, email } },
      update: {},
      create: {
        productId,
        size,
        email,
        productTitle: product.title,
        designer: product.designer,
        userId: user?.verified ? user.id : null,
      },
    });
    return { ok: true, data: undefined };
  } catch (e) {
    return fail(e);
  }
}

export async function deleteRestockAlertAction(
  id: string,
): Promise<ActionResult> {
  try {
    const user = await requireVerified();
    const alert = await prisma.restockAlert.findUnique({
      where: { id },
      select: { userId: true },
    });
    if (!alert) throw new ActionError("Alert not found.");
    if (alert.userId !== user.id && user.role !== "ADMIN")
      throw new ActionError("Not authorized.");
    await prisma.restockAlert.delete({ where: { id } });
    return { ok: true, data: undefined };
  } catch (e) {
    return fail(e);
  }
}
