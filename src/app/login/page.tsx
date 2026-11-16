import Link from "next/link";
import { GoogleButton, LoginForm } from "@/components/auth/auth-forms";
import { safeRedirect } from "@/lib/utils";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;

  return (
    <div className="mx-auto max-w-sm space-y-6">
      <h1 className="text-2xl font-semibold">Sign in</h1>
      <GoogleButton />
      <div className="text-center text-xs uppercase text-muted-foreground">
        or
      </div>
      <LoginForm callbackUrl={safeRedirect(callbackUrl)} />
      <p className="text-sm text-muted-foreground">
        No account?{" "}
        <Link href="/register" className="underline">
          Create one
        </Link>
      </p>
    </div>
  );
}
