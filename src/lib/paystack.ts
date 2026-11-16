import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

const BASE = "https://api.paystack.co";

function secret() {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) throw new Error("PAYSTACK_SECRET_KEY is not set");
  return key;
}

export interface PaystackTx {
  status: string;
  reference: string;
  amount: number; // minor units
  currency: string;
  metadata?: { orderId?: string } | null;
  authorization?: { channel?: string; last4?: string } | null;
}

export async function initializeTransaction(p: {
  email: string;
  amountMinor: number;
  currency: "USD" | "GHS";
  reference: string;
  callbackUrl: string;
  channels: string[];
  metadata: Record<string, string>;
}): Promise<string> {
  const res = await fetch(`${BASE}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: p.email,
      amount: p.amountMinor,
      currency: p.currency,
      reference: p.reference,
      callback_url: p.callbackUrl,
      channels: p.channels,
      metadata: p.metadata,
    }),
  });
  const json = (await res.json()) as {
    status?: boolean;
    message?: string;
    data?: { authorization_url?: string };
  };
  if (!res.ok || !json.status || !json.data?.authorization_url) {
    throw new Error(
      `Paystack initialize failed: ${json.message ?? res.status}`,
    );
  }
  return json.data.authorization_url;
}

export async function verifyTransaction(
  reference: string,
): Promise<PaystackTx | null> {
  const res = await fetch(
    `${BASE}/transaction/verify/${encodeURIComponent(reference)}`,
    {
      headers: { Authorization: `Bearer ${secret()}` },
      cache: "no-store",
    },
  );
  if (!res.ok) return null;
  const json = (await res.json()) as { status?: boolean; data?: PaystackTx };
  return json.status && json.data ? json.data : null;
}

/** x-paystack-signature = HMAC-SHA512(rawBody, secretKey) */
export function verifyWebhookSignature(
  rawBody: string,
  signature: string | null,
): boolean {
  if (!signature) return false;
  const expected = createHmac("sha512", secret()).update(rawBody).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && timingSafeEqual(a, b);
}
