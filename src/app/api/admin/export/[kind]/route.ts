import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { toCsv } from "@/lib/csv";
import {
  DELIVERY_LABEL,
  ORDER_STATUS_LABEL,
  PAYMENT_LABEL,
} from "@/lib/labels";

const usd = (cents: number) => (cents / 100).toFixed(2);

// Contains customer PII: admin + verified email only, never cached.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ kind: string }> },
) {
  const session = await auth();
  const u = session?.user;
  if (!u || u.role !== "ADMIN" || !u.verified) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { kind } = await params;
  let csv: string;

  if (kind === "subscribers") {
    const rows = await prisma.subscriber.findMany({
      orderBy: { createdAt: "desc" },
      take: 100_000,
    });
    csv = toCsv(
      ["email", "status", "departmentPreference", "source", "createdAt"],
      rows.map((r) => [
        r.email,
        r.status,
        r.departmentPreference ?? "",
        r.source,
        r.createdAt,
      ]),
    );
  } else if (kind === "orders") {
    const rows = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 50_000,
      include: { _count: { select: { items: true } } },
    });
    csv = toCsv(
      [
        "orderNumber",
        "createdAt",
        "status",
        "paymentStatus",
        "customerName",
        "customerEmail",
        "phone",
        "city",
        "country",
        "address",
        "delivery",
        "paymentMethod",
        "currency",
        "subtotalUsd",
        "discountUsd",
        "shippingUsd",
        "dutiesUsd",
        "totalUsd",
        "promoCode",
        "itemCount",
      ],
      rows.map((o) => [
        o.orderNumber,
        o.createdAt,
        ORDER_STATUS_LABEL[o.status],
        o.paymentStatus,
        o.customerName,
        o.customerEmail,
        o.phone,
        o.shippingCity,
        o.shippingCountry,
        o.shippingAddress,
        DELIVERY_LABEL[o.deliveryMethod],
        PAYMENT_LABEL[o.paymentMethod],
        o.currency,
        usd(o.subtotalUsdCents),
        usd(o.discountUsdCents),
        usd(o.shippingUsdCents),
        usd(o.dutiesUsdCents),
        usd(o.totalUsdCents),
        o.promoCode ?? "",
        o._count.items,
      ]),
    );
  } else if (kind === "restock-alerts") {
    const rows = await prisma.restockAlert.findMany({
      orderBy: { createdAt: "desc" },
      take: 100_000,
    });
    csv = toCsv(
      [
        "productId",
        "designer",
        "productTitle",
        "size",
        "email",
        "status",
        "createdAt",
      ],
      rows.map((r) => [
        r.productId,
        r.designer,
        r.productTitle,
        r.size,
        r.email,
        r.status,
        r.createdAt,
      ]),
    );
  } else {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return new NextResponse("\uFEFF" + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${kind}-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
