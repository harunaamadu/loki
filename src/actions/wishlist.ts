"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireVerified } from "@/lib/guards";
import { ActionError, fail, type ActionResult } from "@/lib/action";
import { ID_REGEX } from "@/lib/validations";

export async function toggleWishlistAction(
  productId: string,
): Promise<ActionResult<{ wished: boolean }>> {
  try {
    const user = await requireVerified();
    if (!ID_REGEX.test(productId) || productId.length > 64)
      throw new ActionError("Invalid product.");

    const key = { userId_productId: { userId: user.id, productId } };
    const existing = await prisma.wishlistItem.findUnique({ where: key });
    if (existing) {
      await prisma.wishlistItem.delete({ where: key });
    } else {
      if (
        !(await prisma.product.findUnique({
          where: { id: productId },
          select: { id: true },
        }))
      ) {
        throw new ActionError("Product not found.");
      }
      await prisma.wishlistItem.create({
        data: { userId: user.id, productId },
      });
    }
    revalidatePath("/wishlist");
    return { ok: true, data: { wished: !existing } };
  } catch (e) {
    return fail(e);
  }
}
