import { NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/paystack";
import { reconcilePayment } from "@/lib/payments";

// Set this URL in Paystack Dashboard > Settings > API Keys & Webhooks:
//   https://YOUR_DOMAIN/api/paystack/webhook
export async function POST(req: Request) {
  const raw = await req.text();
  if (!verifyWebhookSignature(raw, req.headers.get("x-paystack-signature"))) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: { event?: string; data?: { reference?: string } };
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Bad payload" }, { status: 400 });
  }

  if (event.event === "charge.success" && event.data?.reference) {
    // Re-verify with Paystack's API instead of trusting the webhook body
    await reconcilePayment(event.data.reference);
  }
  return NextResponse.json({ received: true });
}
