import Link from "next/link";
import { ResetPasswordForm } from "../../../components/auth/password-forms";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; email?: string }>;
}) {
  const { token, email } = await searchParams;

  return (
    <div className="mx-auto max-w-sm space-y-6">
      <h1 className="text-2xl font-semibold">Choose a new password</h1>
      {token && email ? (
        <ResetPasswordForm email={email} token={token} />
      ) : (
        <p className="text-sm">
          This link is incomplete.{" "}
          <Link href="/forgot-password" className="underline">
            Request a new one
          </Link>
        </p>
      )}
    </div>
  );
}
