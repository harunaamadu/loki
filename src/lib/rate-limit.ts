import "server-only";
import { prisma } from "@/lib/prisma";

/**
 * Fixed-window limiter. Returns true if the request is allowed.
 * One atomic upsert, so it's safe under concurrency and across serverless instances.
 */
export async function rateLimit(
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<boolean> {
  const rows = await prisma.$queryRaw<{ count: number }[]>`
    INSERT INTO "RateLimit" ("key", "count", "resetAt")
    VALUES (${key}, 1, (NOW() AT TIME ZONE 'UTC') + make_interval(secs => ${windowSeconds}::double precision))
    ON CONFLICT ("key") DO UPDATE SET
      "count" = CASE WHEN "RateLimit"."resetAt" < (NOW() AT TIME ZONE 'UTC') THEN 1 ELSE "RateLimit"."count" + 1 END,
      "resetAt" = CASE WHEN "RateLimit"."resetAt" < (NOW() AT TIME ZONE 'UTC')
                       THEN (NOW() AT TIME ZONE 'UTC') + make_interval(secs => ${windowSeconds}::double precision)
                       ELSE "RateLimit"."resetAt" END
    RETURNING "count"
  `;
  return (rows[0]?.count ?? 1) <= limit;
}
