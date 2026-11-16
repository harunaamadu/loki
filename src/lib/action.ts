export type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export class ActionError extends Error {}

export function fail(e: unknown): { ok: false; error: string } {
  if (e instanceof ActionError) return { ok: false, error: e.message };
  console.error(e);
  return { ok: false, error: "Something went wrong. Please try again." };
}