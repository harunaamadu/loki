"use server";

import { AuthError } from "next-auth";
import bcrypt from "bcryptjs";
import { signIn, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { loginSchema, registerSchema } from "@/lib/validations";
import { safeRedirect } from "@/lib/utils";

export interface FormState {
  error?: string;
}

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
            ? "Invalid email or password."
            : "Could not sign in.",
      };
    }
    throw e; // NEXT_REDIRECT must propagate
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
    },
  });

  try {
    await signIn("credentials", { email, password, redirectTo: "/" });
  } catch (e) {
    if (e instanceof AuthError)
      return { error: "Account created. Please sign in." };
    throw e;
  }
  return {};
}

export async function googleSignInAction() {
  await signIn("google", { redirectTo: "/" });
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}
