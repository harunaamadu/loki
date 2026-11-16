import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ActionError } from "@/lib/action";

export async function getSessionUser() {
  const session = await auth();
  return session?.user ?? null;
}

/** For Server Actions: throws ActionError if not signed in. */
export async function requireUser() {
  const user = await getSessionUser();
  if (!user) throw new ActionError("You must be signed in.");
  return user;
}

/** For Server Actions: throws ActionError if not an admin. */
export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "ADMIN") throw new ActionError("Not authorized.");
  return user;
}

/** For pages: redirects instead of throwing. */
export async function requirePageUser(callbackUrl: string) {
  const user = await getSessionUser();
  if (!user) redirect(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  return user;
}

export async function requirePageAdmin() {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") redirect("/");
  return user;
}
