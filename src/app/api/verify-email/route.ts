import { createHash } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

const baseUrl = () => process.env.AUTH_URL ?? "http://localhost:3000";

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("token");
  const email = req.nextUrl.searchParams.get("email")?.toLowerCase();
  const failUrl = new URL("/login?verified=failed", baseUrl());
  if (!raw || !email) return NextResponse.redirect(failUrl);

  const token = createHash("sha256").update(raw).digest("hex");
  const record = await prisma.verificationToken.findUnique({
    where: { identifier_token: { identifier: email, token } },
  });
  if (!record || record.expires < new Date())
    return NextResponse.redirect(failUrl);

  await prisma.$transaction([
    prisma.verificationToken.delete({
      where: { identifier_token: { identifier: email, token } },
    }),
    prisma.user.update({
      where: { email },
      data: { emailVerified: new Date() },
    }),
  ]);
  return NextResponse.redirect(new URL("/account?verified=1", baseUrl()));
}
