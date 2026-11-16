import "server-only";
import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { initializeTransaction, verifyTransaction } from "@/lib/paystack";
import type { PaymentKey } from "@/lib/labels";

/** Minor units actually charged: cents for USD, pesewas for GHS (at the order's stored rate). */
export function chargeAmountMinor(o: {
  totalUsdCents: number;
  currency: "USD" | "GHS";
  fxRate: number;
}) {
  return o.currency === "GHS"
    ? Math.round(o.totalUsdCents * o.fxRate)
    : o.totalUsdCents;
}

const CHANNELS: Record<PaymentKey, string[]> = {
  CARD: ["card"],
  APPLE_PAY: ["apple_pay"], // only works if Apple Pay is enabled on your Paystack account
  MTN_MOBILE_MONEY: ["mobile_money"],
  TELECEL_CASH: ["mobile_money"],
};

/** Creates a fresh Paystack transaction for an unpaid order and returns the hosted payment URL. */
export async function startPayment(orderId: string): Promise<string> {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new Error("Order not found");
  if (order.paymentStatus === "PAID") throw new Error("Order already paid");

  const reference = `${order.orderNumber}-${randomBytes(3).toString("hex")}`;
  const base = process.env.AUTH_URL ?? "http://localhost:3000";

  const url = await initializeTransaction({
    email: order.customerEmail,
    amountMinor: chargeAmountMinor(order),
    currency: order.currency,
    reference,
    callbackUrl: `${base}/orders/${order.id}`,
    channels: CHANNELS[order.paymentMethod],
    metadata: { orderId: order.id, orderNumber: order.orderNumber },
  });
  await prisma.order.update({
    where: { id: order.id },
    data: { paymentReference: reference },
  });
  return url;
}

/**
 * Verifies a reference with Paystack and marks the order paid. Idempotent.
 * Never trusts the client: status, currency and amount are all checked against our own order.
 */
export async function reconcilePayment(
  reference: string,
  expectedOrderId?: string,
): Promise<boolean> {
  const tx = await verifyTransaction(reference);
  if (!tx || tx.status !== "success") return false;

  const orderId = tx.metadata?.orderId;
  if (!orderId || (expectedOrderId && orderId !== expectedOrderId))
    return false;

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return false;
  if (order.paymentStatus === "PAID") return true;

  if (
    tx.currency !== order.currency ||
    tx.amount !== chargeAmountMinor(order)
  ) {
    console.error(
      `[payments] amount/currency mismatch for order ${order.orderNumber}`,
      {
        expected: chargeAmountMinor(order),
        expectedCurrency: order.currency,
        got: tx.amount,
        gotCurrency: tx.currency,
      },
    );
    return false;
  }

  await prisma.order.update({
    where: { id: order.id },
    data: {
      paymentStatus: "PAID",
      paidAt: new Date(),
      paymentReference: reference,
      paymentLast4:
        tx.authorization?.channel === "card" && tx.authorization.last4
          ? tx.authorization.last4
          : order.paymentLast4,
    },
  });

  if (order.status === "CANCELLED") {
    // Paid after the order was auto-cancelled (stock was released). Needs a manual refund.
    console.error(
      `[payments] ORDER ${order.orderNumber} was paid after cancellation. Refund required.`,
    );
  }
  return true;
}
