"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guards";
import { ActionError, fail, type ActionResult } from "@/lib/action";
import { ID_REGEX } from "@/lib/validations";
import { PREFERENCES } from "@/lib/labels";

const idSchema = z.string().min(1).max(128).regex(ID_REGEX);

const subscriberUpdate = z.object({
  status: z.enum(["ACTIVE", "UNSUBSCRIBED"]),
  departmentPreference: z.enum(PREFERENCES).nullable(),
});

export async function updateSubscriberAction(
  id: string,
  input: unknown,
): Promise<ActionResult> {
  try {
    await requireAdmin();
    if (!idSchema.safeParse(id).success) throw new ActionError("Invalid id.");
    const parsed = subscriberUpdate.safeParse(input);
    if (!parsed.success) throw new ActionError(parsed.error.issues[0].message);

    const r = await prisma.subscriber.updateMany({
      where: { id },
      data: parsed.data,
    });
    if (r.count === 0) throw new ActionError("Subscriber not found.");
    revalidatePath("/admin/subscribers");
    return { ok: true, data: undefined };
  } catch (e) {
    return fail(e);
  }
}

export async function deleteSubscriberAction(
  id: string,
): Promise<ActionResult> {
  try {
    await requireAdmin();
    if (!idSchema.safeParse(id).success) throw new ActionError("Invalid id.");
    await prisma.subscriber.deleteMany({ where: { id } });
    revalidatePath("/admin/subscribers");
    return { ok: true, data: undefined };
  } catch (e) {
    return fail(e);
  }
}

export async function setRestockStatusAction(
  id: string,
  status: string,
): Promise<ActionResult> {
  try {
    await requireAdmin();
    if (!idSchema.safeParse(id).success) throw new ActionError("Invalid id.");
    const parsed = z.enum(["PENDING", "NOTIFIED"]).safeParse(status);
    if (!parsed.success) throw new ActionError("Invalid status.");

    const r = await prisma.restockAlert.updateMany({
      where: { id },
      data: { status: parsed.data },
    });
    if (r.count === 0) throw new ActionError("Alert not found.");
    revalidatePath("/admin/restock-alerts");
    return { ok: true, data: undefined };
  } catch (e) {
    return fail(e);
  }
}
