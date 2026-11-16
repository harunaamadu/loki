"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin, requireUser } from "@/lib/guards";
import { ActionError, fail, type ActionResult } from "@/lib/action";
import { checkoutSchema } from "@/lib/validations";
import type { OrderStatus } from "@/generated/prisma/client";

const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["PAID", "CANCELLED"],
  PAID: ["PROCESSING", "CANCELLED", "REFUNDED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: ["REFUNDED"],
  CANCELLED: [],
  REFUNDED: [],
};

export async function createOrderAction(
  input: unknown,
): Promise<ActionResult<{ orderId: string }>> {
  try {
    const user = await requireUser();
    const parsed = checkoutSchema.safeParse(input);
    if (!parsed.success) throw new ActionError(parsed.error.issues[0].message);
    const { items, shipping, notes } = parsed.data;

    // Merge duplicate lines
    const wanted = new Map<string, number>();
    for (const i of items)
      wanted.set(i.productId, (wanted.get(i.productId) ?? 0) + i.quantity);

    const shippingCents = Number(process.env.SHIPPING_FLAT_CENTS ?? 0);
    const currency = process.env.NEXT_PUBLIC_CURRENCY ?? "USD";

    const order = await prisma.$transaction(async (tx) => {
      const products = await tx.product.findMany({
        where: { id: { in: [...wanted.keys()] }, isActive: true },
        include: { images: { orderBy: { position: "asc" }, take: 1 } },
      });
      if (products.length !== wanted.size) {
        throw new ActionError("One or more items are no longer available.");
      }

      let subtotalCents = 0;
      const lines = [];
      for (const p of products) {
        const qty = wanted.get(p.id)!;
        // Atomic stock check + decrement (prevents overselling)
        const res = await tx.product.updateMany({
          where: { id: p.id, stock: { gte: qty } },
          data: { stock: { decrement: qty } },
        });
        if (res.count === 0)
          throw new ActionError(`Not enough stock for "${p.name}".`);

        // Price comes from the DB, never from the client
        subtotalCents += p.priceCents * qty;
        lines.push({
          productId: p.id,
          name: p.name,
          imageUrl: p.images[0]?.url ?? null,
          unitPriceCents: p.priceCents,
          quantity: qty,
        });
      }

      return tx.order.create({
        data: {
          userId: user.id,
          status: "PENDING",
          paymentStatus: "UNPAID",
          subtotalCents,
          shippingCents,
          totalCents: subtotalCents + shippingCents,
          currency,
          notes,
          shipName: shipping.fullName,
          shipPhone: shipping.phone,
          shipLine1: shipping.line1,
          shipLine2: shipping.line2,
          shipCity: shipping.city,
          shipRegion: shipping.region,
          shipPostalCode: shipping.postalCode,
          shipCountry: shipping.country,
          items: { create: lines },
        },
        select: { id: true },
      });
    });

    revalidatePath("/shop");
    return { ok: true, data: { orderId: order.id } };
  } catch (e) {
    return fail(e);
  }
}

async function transition(orderId: string, next: OrderStatus) {
  await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
    if (!order) throw new ActionError("Order not found.");
    if (!TRANSITIONS[order.status].includes(next)) {
      throw new ActionError(
        `Cannot change an order from ${order.status} to ${next}.`,
      );
    }

    if (next === "CANCELLED") {
      for (const item of order.items) {
        if (item.productId) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }
      }
    }

    await tx.order.update({
      where: { id: orderId },
      data: {
        status: next,
        ...(next === "PAID" ? { paymentStatus: "PAID" } : {}),
        ...(next === "REFUNDED" ? { paymentStatus: "REFUNDED" } : {}),
      },
    });
  });
  revalidatePath(`/orders/${orderId}`);
}

/** Customers can cancel their own PENDING orders only. */
export async function cancelOrderAction(
  orderId: string,
): Promise<ActionResult> {
  try {
    const user = await requireUser();
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { userId: true, status: true },
    });
    if (!order) throw new ActionError("Order not found.");
    const isOwner = order.userId === user.id;
    if (!isOwner && user.role !== "ADMIN")
      throw new ActionError("Not authorized.");
    if (isOwner && user.role !== "ADMIN" && order.status !== "PENDING") {
      throw new ActionError("Only pending orders can be cancelled.");
    }
    await transition(orderId, "CANCELLED");
    return { ok: true, data: undefined };
  } catch (e) {
    return fail(e);
  }
}

export async function updateOrderStatusAction(
  orderId: string,
  next: OrderStatus,
): Promise<ActionResult> {
  try {
    await requireAdmin();
    await transition(orderId, next);
    return { ok: true, data: undefined };
  } catch (e) {
    return fail(e);
  }
}
