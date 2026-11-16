import Link from "next/link";
import { GoogleButton, RegisterForm } from "@/components/auth/auth-forms";

export default function RegisterPage() {
  return (
    <div className="mx-auto max-w-sm space-y-6">
      <h1 className="text-2xl font-semibold">Create account</h1>
      <GoogleButton />
      <div className="text-center text-xs uppercase text-muted-foreground">
        or
      </div>
      <RegisterForm />
      <p className="text-sm text-muted-foreground">
        Already registered?{" "}
        <Link href="/login" className="underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
