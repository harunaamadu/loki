import { ForgotPasswordForm } from "../../../components/auth/password-forms";

export default function ForgotPasswordPage() {
  return (
    <div className="mx-auto max-w-sm space-y-6">
      <h1 className="text-2xl font-semibold">Forgot password</h1>
      <ForgotPasswordForm />
    </div>
  );
}
