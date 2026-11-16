import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ActionError } from "@/lib/action";

export async function getSessionUser() {
  const session = await auth();
  return session?.user ?? null;
}

/** isSignedIn() */
export async function requireUser() {
  const user = await getSessionUser();
  if (!user) throw new ActionError("You must be signed in.");
  return user;
}

/** isVerified(): signed in AND email verified */
export async function requireVerified() {
  const user = await requireUser();
  if (!user.verified)
    throw new ActionError("Please verify your email address first.");
  return user;
}

/** isAdmin(): verified AND role ADMIN */
export async function requireAdmin() {
  const user = await requireVerified();
  if (user.role !== "ADMIN") throw new ActionError("Not authorized.");
  return user;
}

export async function requirePageUser(callbackUrl: string) {
  const user = await getSessionUser();
  if (!user) redirect(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  return user;
}

export async function requirePageAdmin() {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN" || !user.verified) redirect("/");
  return user;
}
