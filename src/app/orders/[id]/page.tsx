import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requirePageUser } from "@/lib/guards";
import { formatPrice } from "@/lib/utils";

export default async function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requirePageUser(`/orders/${id}`);

  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });

  // Owner-or-admin read rule (was a Firestore rule)
  if (!order || (order.userId !== user.id && user.role !== "ADMIN")) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">
        Order {order.id.slice(-8).toUpperCase()}
      </h1>
      <p className="text-sm text-muted-foreground">
        Status: {order.status} · Payment: {order.paymentStatus}
      </p>

      <div className="divide-y border">
        {order.items.map((i) => (
          <div key={i.id} className="flex justify-between p-4 text-sm">
            <span>
              {i.name} × {i.quantity}
            </span>
            <span>
              {formatPrice(i.unitPriceCents * i.quantity, order.currency)}
            </span>
          </div>
        ))}
        <div className="flex justify-between p-4 text-sm">
          <span>Shipping</span>
          <span>{formatPrice(order.shippingCents, order.currency)}</span>
        </div>
        <div className="flex justify-between p-4 font-medium">
          <span>Total</span>
          <span>{formatPrice(order.totalCents, order.currency)}</span>
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        <p>{order.shipName}</p>
        <p>{order.shipLine1}</p>
        {order.shipLine2 && <p>{order.shipLine2}</p>}
        <p>
          {order.shipCity}, {order.shipRegion} {order.shipPostalCode}
        </p>
        <p>{order.shipCountry}</p>
      </div>
    </div>
  );
}
