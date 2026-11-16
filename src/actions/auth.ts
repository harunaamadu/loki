"use server";

import { createHash, randomBytes } from "node:crypto";
import { AuthError } from "next-auth";
import bcrypt from "bcryptjs";
import { signIn, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";
import { clientIp } from "@/lib/request";
import { fail, type ActionResult } from "@/lib/action";
import { loginSchema, registerSchema } from "@/lib/validations";
import { safeRedirect } from "@/lib/utils";
import { requireUser } from "@/lib/guards";

export interface FormState {
  error?: string;
}

const baseUrl = () => process.env.AUTH_URL ?? "http://localhost:3000";
const sha256 = (v: string) => createHash("sha256").update(v).digest("hex");

async function issueVerification(email: string) {
  const raw = randomBytes(32).toString("hex");
  await prisma.verificationToken.deleteMany({ where: { identifier: email } });
  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token: sha256(raw),
      expires: new Date(Date.now() + 24 * 3600 * 1000),
    },
  });
  const url = `${baseUrl()}/api/verify-email?token=${raw}&email=${encodeURIComponent(email)}`;
  await sendEmail({
    to: email,
    subject: "Verify your email",
    html: `<p>Confirm your email to start ordering.</p><p><a href="${url}">Verify email</a> (valid for 24 hours)</p>`,
  });
}

// Login throttling lives in auth.ts (authorize) so it also covers /api/auth/callback/credentials.
export async function loginAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  try {
    await signIn("credentials", {
      ...parsed.data,
      redirectTo: safeRedirect(formData.get("callbackUrl")),
    });
  } catch (e) {
    if (e instanceof AuthError) {
      return {
        error:
          e.type === "CredentialsSignin"
            ? "Invalid email or password, or too many attempts. Try again later."
            : "Could not sign in.",
      };
    }
    throw e;
  }
  return {};
}

export async function registerAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  if (!(await rateLimit(`register:ip:${await clientIp()}`, 5, 3600))) {
    return {
      error: "Too many sign-ups from this network. Please try again later.",
    };
  }

  const { name, email, password } = parsed.data;
  const existing = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });
  if (existing) return { error: "An account with this email already exists." };

  await prisma.user.create({
    data: {
      name,
      email,
      passwordHash: await bcrypt.hash(password, 12),
      role: "USER",
      currency: "USD",
    },
  });

  try {
    await issueVerification(email);
  } catch (e) {
    console.error("Verification email failed", e);
  }

  try {
    await signIn("credentials", { email, password, redirectTo: "/account" });
  } catch (e) {
    if (e instanceof AuthError)
      return { error: "Account created. Please sign in." };
    throw e;
  }
  return {};
}

export async function resendVerificationAction(): Promise<ActionResult> {
  try {
    const user = await requireUser();
    if (user.verified) return { ok: true, data: undefined };
    if (!user.email) return { ok: false, error: "No email on this account." };
    if (!(await rateLimit(`verify-resend:${user.id}`, 3, 3600))) {
      return { ok: false, error: "Too many requests. Please try again later." };
    }
    await issueVerification(user.email.toLowerCase());
    return { ok: true, data: undefined };
  } catch (e) {
    return fail(e);
  }
}

export async function googleSignInAction() {
  await signIn("google", { redirectTo: "/" });
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}
