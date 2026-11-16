import Link from "next/link";
import { safeRedirect } from "@/lib/utils";
import { GoogleButton, LoginForm } from "@/components/auth/auth-forms";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; verified?: string }>;
}) {
  const { callbackUrl, verified } = await searchParams;

  return (
    <div className="mx-auto max-w-sm space-y-6">
      <h1 className="text-2xl font-semibold">Sign in</h1>
      {verified === "failed" && (
        <p className="text-sm text-destructive">
          That verification link is invalid or has expired.
        </p>
      )}
      <GoogleButton />
      <div className="text-center text-xs uppercase text-muted-foreground">
        or
      </div>
      <LoginForm callbackUrl={safeRedirect(callbackUrl)} />
      <div className="flex justify-between text-sm text-muted-foreground">
        <Link href="/forgot-password" className="underline">
          Forgot password?
        </Link>
        <span>
          No account?{" "}
          <Link href="/register" className="underline">
            Create one
          </Link>
        </span>
      </div>
    </div>
  );
}
