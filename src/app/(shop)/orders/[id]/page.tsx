import { notFound } from "next/navigation";
import { requirePageUser } from "@/lib/guards";
import { getOrderById } from "@/lib/queries";
import { reconcilePayment } from "@/lib/payments";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";
import {
  DELIVERY_LABEL,
  ORDER_STATUS_LABEL,
  ORDER_STEPS,
  PAYMENT_LABEL,
} from "@/lib/labels";
import { PayNowButton, CancelOrderButton } from "@/components/orders/order-controls";

export const dynamic = "force-dynamic";

export default async function OrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ reference?: string; trxref?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const user = await requirePageUser(`/orders/${id}`);

  let order = await getOrderById(id);
  // get rule: owner or admin
  if (!order || (order.userId !== user.id && user.role !== "ADMIN")) notFound();

  // Returning from Paystack: verify with Paystack's API (not the URL) and then re-read the order
  const reference = sp.reference ?? sp.trxref;
  if (reference && order.paymentStatus === "UNPAID") {
    try {
      if (await reconcilePayment(reference, order.id))
        order = (await getOrderById(id)) ?? order;
    } catch (e) {
      console.error("reconcilePayment failed", e);
    }
  }

  const money = (c: number) => formatMoney(c, order.currency, order.fxRate);
  const stepIndex = ORDER_STEPS.indexOf(order.status);
  const isOwner = order.userId === user.id;
  const canPay =
    isOwner &&
    order.status === "ORDER_PLACED" &&
    order.paymentStatus === "UNPAID";
  const canCancel =
    isOwner &&
    order.status === "ORDER_PLACED" &&
    order.paymentStatus === "UNPAID";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold">Order {order.orderNumber}</h1>
        <p className="text-sm text-muted-foreground">
          {DELIVERY_LABEL[order.deliveryMethod]} ·{" "}
          {PAYMENT_LABEL[order.paymentMethod]}
          {order.paymentLast4 ? ` ending ${order.paymentLast4}` : ""} ·{" "}
          {order.paymentStatus === "PAID" ? "Paid" : "Awaiting payment"}
        </p>
      </div>

      {canPay && (
        <div className="space-y-3 border p-4 text-sm">
          <p>
            Payment is pending. Items are held for 30 minutes from when the
            order was placed.
          </p>
          <PayNowButton orderId={order.id} />
        </div>
      )}

      {order.status === "CANCELLED" ? (
        <p className="border p-4 text-sm">This order was cancelled.</p>
      ) : (
        <ol className="grid gap-3 sm:grid-cols-4">
          {ORDER_STEPS.map((s, i) => (
            <li
              key={s}
              className={cn(
                "border p-3 text-sm",
                i <= stepIndex
                  ? "border-foreground font-medium"
                  : "text-muted-foreground",
              )}
            >
              {ORDER_STATUS_LABEL[s]}
            </li>
          ))}
        </ol>
      )}

      <div className="divide-y border text-sm">
        {order.items.map((i) => (
          <div key={i.id} className="flex justify-between p-4">
            <span>
              {i.designer} · {i.title} ({i.size}) × {i.quantity}
            </span>
            <span>{money(i.unitPriceUsdCents * i.quantity)}</span>
          </div>
        ))}
        <div className="flex justify-between p-4">
          <span>Subtotal</span>
          <span>{money(order.subtotalUsdCents)}</span>
        </div>
        {order.discountUsdCents > 0 && (
          <div className="flex justify-between p-4">
            <span>Discount ({order.promoCode})</span>
            <span>−{money(order.discountUsdCents)}</span>
          </div>
        )}
        <div className="flex justify-between p-4">
          <span>Shipping</span>
          <span>{money(order.shippingUsdCents)}</span>
        </div>
        <div className="flex justify-between p-4">
          <span>Duties &amp; taxes</span>
          <span>{money(order.dutiesUsdCents)}</span>
        </div>
        <div className="flex justify-between p-4 font-medium">
          <span>Total</span>
          <span>{money(order.totalUsdCents)}</span>
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        <p>{order.customerName}</p>
        <p>{order.shippingAddress}</p>
        <p>
          {order.shippingCity}, {order.shippingCountry}
        </p>
        <p>{order.phone}</p>
      </div>

      {canCancel && <CancelOrderButton orderId={order.id} />}
    </div>
  );
}
