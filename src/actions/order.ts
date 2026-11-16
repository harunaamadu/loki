"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin, requireVerified } from "@/lib/guards";
import { ActionError, fail, type ActionResult } from "@/lib/action";
import { checkoutSchema } from "@/lib/validations";
import { computePricing } from "@/lib/pricing";
import { startPayment } from "@/lib/payments";
import { transitionOrder } from "@/lib/orders";
import { ORDER_STATUSES, type OrderStatusKey } from "@/lib/labels";

import { promoDiscount } from "@/lib/promo";
import { formatMoney } from "@/lib/money";

function newOrderNumber() {
  return `LK-${Date.now().toString(36)}${randomBytes(2).toString("hex")}`.toUpperCase();
}

function refreshOrder(orderId: string) {
  revalidatePath(`/orders/${orderId}`);
  revalidatePath("/orders");
  revalidatePath("/admin/orders");
}

export async function createOrderAction(
  input: unknown,
): Promise<ActionResult<{ orderId: string; paymentUrl: string | null }>> {
  try {
    const user = await requireVerified();
    if (!user.email)
      throw new ActionError("Your account has no email address.");
    const parsed = checkoutSchema.safeParse(input);
    if (!parsed.success) throw new ActionError(parsed.error.issues[0].message);
    const d = parsed.data;

    const wanted = new Map<
      string,
      { productId: string; size: string; quantity: number }
    >();
    for (const i of d.items) {
      const k = `${i.productId}::${i.size}`;
      wanted.set(k, {
        ...i,
        quantity: (wanted.get(k)?.quantity ?? 0) + i.quantity,
      });
    }
    if (wanted.size > 20) throw new ActionError("Too many items in one order.");

    const fxRate = Number(process.env.NEXT_PUBLIC_USD_TO_GHS ?? "15");

    const order = await prisma.$transaction(async (tx) => {
      const ids = [...new Set([...wanted.values()].map((w) => w.productId))];
      const products = await tx.product.findMany({
        where: { id: { in: ids } },
        include: { images: { orderBy: { position: "asc" }, take: 1 } },
      });
      const byId = new Map(products.map((p) => [p.id, p]));

      let subtotalUsdCents = 0;
      const lines = [];
      for (const w of wanted.values()) {
        const p = byId.get(w.productId);
        if (!p)
          throw new ActionError("An item in your bag is no longer available.");

        const r = await tx.productSize.updateMany({
          where: {
            productId: w.productId,
            size: w.size,
            stock: { gte: w.quantity },
          },
          data: { stock: { decrement: w.quantity } },
        });
        if (r.count === 0)
          throw new ActionError(
            `"${p.title}" (${w.size}) is no longer available in that quantity.`,
          );

        subtotalUsdCents += p.priceUsdCents * w.quantity;
        lines.push({
          productId: p.id,
          title: p.title,
          designer: p.designer,
          size: w.size,
          quantity: w.quantity,
          unitPriceUsdCents: p.priceUsdCents,
          imageUrl: p.images[0]?.url ?? null,
        });
      }

      let discountUsdCents = 0;
      let promoCode: string | null = null;
      if (d.promoCode) {
        const code = d.promoCode.toUpperCase();
        const promo = await tx.promoCode.findUnique({ where: { code } });
        if (
          !promo ||
          !promo.isActive ||
          (promo.expiresAt && promo.expiresAt < new Date())
        ) {
          throw new ActionError("That promo code is not valid.");
        }
        const result = promoDiscount(promo, subtotalUsdCents);
        if (!result.ok) {
          throw new ActionError(
            `${code} requires a minimum order of ${formatMoney(result.minSubtotalUsdCents, "USD")}.`,
          );
        }
        discountUsdCents = result.discountUsdCents;
        promoCode = code;
      }

      const pricing = computePricing({
        subtotalUsdCents,
        discountUsdCents,
        deliveryMethod: d.deliveryMethod,
        country: d.shippingCountry,
      });

      const created = await tx.order.create({
        data: {
          orderNumber: newOrderNumber(),
          userId: user.id,
          status: "ORDER_PLACED",
          paymentStatus: "UNPAID",
          customerName: d.customerName,
          customerEmail: user.email!,
          phone: d.phone,
          shippingCity: d.shippingCity,
          shippingCountry: d.shippingCountry,
          shippingAddress: d.shippingAddress,
          deliveryMethod: d.deliveryMethod,
          paymentMethod: d.paymentMethod,
          currency: d.currency,
          fxRate,
          promoCode,
          discountUsdCents,
          subtotalUsdCents,
          ...pricing,
          items: { create: lines },
        },
        select: { id: true },
      });
      await tx.bagItem.deleteMany({ where: { userId: user.id } });
      return created;
    });

    // If Paystack is unreachable, the order still exists; the order page offers "Pay now".
    let paymentUrl: string | null = null;
    try {
      paymentUrl = await startPayment(order.id);
    } catch (e) {
      console.error("startPayment failed", e);
    }

    revalidatePath("/orders");
    return { ok: true, data: { orderId: order.id, paymentUrl } };
  } catch (e) {
    return fail(e);
  }
}

/** Retry payment for an unpaid order. */
export async function payOrderAction(
  orderId: string,
): Promise<ActionResult<{ paymentUrl: string }>> {
  try {
    const user = await requireVerified();
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { userId: true, status: true, paymentStatus: true },
    });
    if (!order || order.userId !== user.id)
      throw new ActionError("Order not found.");
    if (order.status !== "ORDER_PLACED" || order.paymentStatus !== "UNPAID") {
      throw new ActionError("This order can't be paid anymore.");
    }
    return { ok: true, data: { paymentUrl: await startPayment(orderId) } };
  } catch (e) {
    return fail(e);
  }
}

/** Customers may cancel their own order only while it is still unpaid. Paid orders need an admin (refund). */
export async function cancelOrderAction(
  orderId: string,
): Promise<ActionResult> {
  try {
    const user = await requireVerified();
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { userId: true, status: true, paymentStatus: true },
    });
    if (!order) throw new ActionError("Order not found.");
    const isAdmin = user.role === "ADMIN";
    if (order.userId !== user.id && !isAdmin)
      throw new ActionError("Not authorized.");
    if (!isAdmin) {
      if (order.status !== "ORDER_PLACED")
        throw new ActionError("This order can no longer be cancelled online.");
      if (order.paymentStatus === "PAID") {
        throw new ActionError(
          "This order is already paid. Please contact support to cancel and refund it.",
        );
      }
    } else if (order.paymentStatus === "PAID") {
      console.warn(
        `[orders] Admin ${user.id} cancelled a PAID order ${orderId}. Issue the refund in Paystack.`,
      );
    }
    await transitionOrder(orderId, "CANCELLED");
    refreshOrder(orderId);
    return { ok: true, data: undefined };
  } catch (e) {
    return fail(e);
  }
}

export async function updateOrderStatusAction(
  orderId: string,
  next: string,
): Promise<ActionResult> {
  try {
    await requireAdmin();
    if (!(ORDER_STATUSES as readonly string[]).includes(next))
      throw new ActionError("Invalid status.");
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { paymentStatus: true },
    });
    if (!order) throw new ActionError("Order not found.");
    if (next !== "CANCELLED" && order.paymentStatus !== "PAID") {
      throw new ActionError("This order hasn't been paid yet.");
    }
    await transitionOrder(orderId, next as OrderStatusKey);
    refreshOrder(orderId);
    return { ok: true, data: undefined };
  } catch (e) {
    return fail(e);
  }
}
