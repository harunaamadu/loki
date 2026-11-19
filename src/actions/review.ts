"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSessionUser, requireVerified } from "@/lib/guards";
import { rateLimit } from "@/lib/rate-limit";
import { ActionError, fail, type ActionResult } from "@/lib/action";
import { getReviewsPage } from "@/lib/queries";
import { ID_REGEX, loadReviewsSchema, reviewSchema } from "@/lib/validations";
import type { ReviewDTO } from "@/lib/reviews";

export async function submitReviewAction(
  input: unknown,
): Promise<ActionResult<{ updated: boolean }>> {
  try {
    const user = await requireVerified();
    const parsed = reviewSchema.safeParse(input);
    if (!parsed.success) throw new ActionError(parsed.error.issues[0].message);
    const { productId, rating, body } = parsed.data;
    const title = parsed.data.title || null;

    if (!(await rateLimit(`review:${user.id}`, 10, 3600))) {
      throw new ActionError(
        "You're submitting reviews too quickly. Please try again later.",
      );
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });
    if (!product) throw new ActionError("Product not found.");

    // Decided on the server: a paid, non-cancelled order containing this product
    const purchased = await prisma.order.findFirst({
      where: {
        userId: user.id,
        paymentStatus: "PAID",
        status: { not: "CANCELLED" },
        items: { some: { productId } },
      },
      select: { id: true },
    });

    const key = { userId_productId: { userId: user.id, productId } };
    const existing = await prisma.review.findUnique({
      where: key,
      select: { id: true },
    });

    await prisma.review.upsert({
      where: key,
      update: { rating, title, body, verifiedPurchase: !!purchased },
      create: {
        userId: user.id,
        productId,
        rating,
        title,
        body,
        verifiedPurchase: !!purchased,
      },
    });

    revalidatePath(`/product/${productId}`);
    return { ok: true, data: { updated: !!existing } };
  } catch (e) {
    return fail(e);
  }
}

/** Authors can delete their own review; admins can delete any. */
export async function deleteReviewAction(id: string): Promise<ActionResult> {
  try {
    const user = await requireVerified();
    if (!ID_REGEX.test(id) || id.length > 128)
      throw new ActionError("Invalid review.");

    const review = await prisma.review.findUnique({
      where: { id },
      select: { userId: true, productId: true },
    });
    if (!review) throw new ActionError("Review not found.");
    if (review.userId !== user.id && user.role !== "ADMIN")
      throw new ActionError("Not authorized.");

    await prisma.review.delete({ where: { id } });
    revalidatePath(`/product/${review.productId}`);
    revalidatePath("/admin/reviews");
    return { ok: true, data: undefined };
  } catch (e) {
    return fail(e);
  }
}

/** Public read for sorting and "load more". */
export async function loadReviewsAction(
  input: unknown,
): Promise<ActionResult<{ reviews: ReviewDTO[]; total: number }>> {
  try {
    const parsed = loadReviewsSchema.safeParse(input);
    if (!parsed.success) throw new ActionError("Invalid request.");
    const viewer = await getSessionUser();
    const { productId, sort, page } = parsed.data;
    return {
      ok: true,
      data: await getReviewsPage(productId, sort, page, viewer?.id ?? null),
    };
  } catch (e) {
    return fail(e);
  }
}
