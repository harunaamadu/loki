"use server";

import { z } from "zod";
import { getProductsByIds } from "@/lib/queries";
import { ID_REGEX } from "@/lib/validations";
import type { ProductListItem } from "@/lib/types";

const idsSchema = z.array(z.string().min(1).max(64).regex(ID_REGEX)).max(12);

/** Public catalog data only. Invalid input returns an empty list rather than an error. */
export async function getProductsByIdsAction(
  ids: unknown,
): Promise<ProductListItem[]> {
  const parsed = idsSchema.safeParse(ids);
  if (!parsed.success) return [];
  return getProductsByIds(parsed.data);
}
