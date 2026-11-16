"use server";

import { createHash, randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";
import { clientIp } from "@/lib/request";
import { forgotSchema, resetSchema } from "@/lib/validations";

export interface PasswordState {
  error?: string;
  done?: boolean;
}

const sha256 = (v: string) => createHash("sha256").update(v).digest("hex");
const baseUrl = () => process.env.AUTH_URL ?? "http://localhost:3000";

/** Always answers the same way, so it can't be used to discover which emails have accounts. */
export async function requestPasswordResetAction(
  _prev: PasswordState,
  formData: FormData,
): Promise<PasswordState> {
  const parsed = forgotSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { email } = parsed.data;

  const ok =
    (await rateLimit(`pwreset:ip:${await clientIp()}`, 5, 3600)) &&
    (await rateLimit(`pwreset:email:${email}`, 3, 3600));
  if (!ok) return { error: "Too many requests. Please try again later." };

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });
  if (user) {
    const raw = randomBytes(32).toString("hex");
    const identifier = `reset:${email}`;
    await prisma.verificationToken.deleteMany({ where: { identifier } });
    await prisma.verificationToken.create({
      data: {
        identifier,
        token: sha256(raw),
        expires: new Date(Date.now() + 3600 * 1000),
      },
    });
    const url = `${baseUrl()}/reset-password?token=${raw}&email=${encodeURIComponent(email)}`;
    try {
      await sendEmail({
        to: email,
        subject: "Reset your password",
        html: `<p>Use the link below to choose a new password. It expires in 1 hour.</p><p><a href="${url}">Reset password</a></p><p>If you didn't ask for this, ignore this email.</p>`,
      });
    } catch (e) {
      console.error("Reset email failed", e);
    }
  }
  return { done: true };
}

export async function resetPasswordAction(
  _prev: PasswordState,
  formData: FormData,
): Promise<PasswordState> {
  const parsed = resetSchema.safeParse({
    email: formData.get("email"),
    token: formData.get("token"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { email, token, password } = parsed.data;

  if (!(await rateLimit(`pwreset-submit:ip:${await clientIp()}`, 10, 3600))) {
    return { error: "Too many attempts. Please try again later." };
  }

  const identifier = `reset:${email}`;
  const record = await prisma.verificationToken.findUnique({
    where: { identifier_token: { identifier, token: sha256(token) } },
  });
  if (!record || record.expires < new Date())
    return { error: "This link is invalid or has expired." };

  const passwordHash = await bcrypt.hash(password, 12);
  const now = new Date();
  await prisma.$transaction([
    prisma.verificationToken.deleteMany({ where: { identifier } }),
    // Receiving the email proves ownership, which also verifies the address
    prisma.user.updateMany({
      where: { email, emailVerified: null },
      data: { emailVerified: now },
    }),
    // passwordChangedAt invalidates every session issued before now (see auth.ts jwt callback)
    prisma.user.updateMany({
      where: { email },
      data: { passwordHash, passwordChangedAt: now },
    }),
  ]);
  return { done: true };
}
