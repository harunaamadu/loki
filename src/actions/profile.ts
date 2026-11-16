"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireVerified } from "@/lib/guards";
import { ActionError, fail, type ActionResult } from "@/lib/action";
import { profileSchema } from "@/lib/validations";

// Only these fields are ever writable (matches the rule's affectedKeys().hasOnly(...)).
export async function updateProfileAction(
  input: unknown,
): Promise<ActionResult> {
  try {
    const user = await requireVerified();
    const parsed = profileSchema.safeParse(input);
    if (!parsed.success) throw new ActionError(parsed.error.issues[0].message);
    const { displayName, ...rest } = parsed.data;
    await prisma.user.update({
      where: { id: user.id },
      data: { name: displayName, ...rest },
    });
    revalidatePath("/account");
    return { ok: true, data: undefined };
  } catch (e) {
    return fail(e);
  }
}
