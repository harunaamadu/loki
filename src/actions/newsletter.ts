"use server";

import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/guards";
import { rateLimit } from "@/lib/rate-limit";
import { clientIp } from "@/lib/request";
import { ActionError, fail, type ActionResult } from "@/lib/action";
import { newsletterSchema } from "@/lib/validations";

export async function subscribeAction(input: unknown): Promise<ActionResult> {
  try {
    const parsed = newsletterSchema.safeParse(input);
    if (!parsed.success) throw new ActionError(parsed.error.issues[0].message);
    const { email, departmentPreference, source } = parsed.data;

    if (!(await rateLimit(`newsletter:ip:${await clientIp()}`, 10, 3600))) {
      throw new ActionError("Too many requests. Please try again later.");
    }

    const user = await getSessionUser();
    await prisma.subscriber.upsert({
      where: { email },
      update: {},
      create: {
        email,
        departmentPreference,
        source,
        status: "ACTIVE",
        userId: user?.verified ? user.id : null,
      },
    });
    return { ok: true, data: undefined };
  } catch (e) {
    return fail(e);
  }
}
