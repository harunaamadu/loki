import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { transitionOrder } from "@/lib/orders";

const HOLD_MINUTES = 30;

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const stale = await prisma.order.findMany({
    where: {
      status: "ORDER_PLACED",
      paymentStatus: "UNPAID",
      createdAt: { lt: new Date(Date.now() - HOLD_MINUTES * 60 * 1000) },
    },
    select: { id: true },
    take: 100,
  });

  let cancelled = 0;
  for (const o of stale) {
    try {
      await transitionOrder(o.id, "CANCELLED"); // restores per-size stock
      cancelled++;
    } catch (e) {
      console.error("expire-orders failed for", o.id, e);
    }
  }
  return NextResponse.json({ cancelled });
}
