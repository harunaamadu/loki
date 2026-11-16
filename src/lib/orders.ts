import "server-only";
import { prisma } from "@/lib/prisma";
import { ActionError } from "@/lib/action";
import { NEXT_STATUSES, type OrderStatusKey } from "@/lib/labels";

export async function transitionOrder(orderId: string, next: OrderStatusKey) {
  await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
    if (!order) throw new ActionError("Order not found.");
    if (!NEXT_STATUSES[order.status].includes(next)) {
      throw new ActionError("That status change is not allowed.");
    }
    if (next === "CANCELLED") {
      for (const it of order.items) {
        if (it.productId) {
          await tx.productSize.updateMany({
            where: { productId: it.productId, size: it.size },
            data: { stock: { increment: it.quantity } },
          });
        }
      }
    }
    await tx.order.update({ where: { id: orderId }, data: { status: next } });
  });
}
