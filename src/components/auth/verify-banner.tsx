"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { resendVerificationAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";

export function VerifyBanner() {
  const [pending, start] = useTransition();
  const [sent, setSent] = useState(false);
  return (
    <div className="border-b bg-secondary px-4 py-2 text-center text-sm">
      Please verify your email to order, save items or manage your profile.{" "}
      <Button
        variant="link"
        size="sm"
        disabled={pending || sent}
        onClick={() =>
          start(async () => {
            const res = await resendVerificationAction();
            if (res.ok) {
              setSent(true);
              toast.success("Verification email sent");
            } else toast.error(res.error);
          })
        }
      >
        {sent ? "Email sent" : "Resend email"}
      </Button>
    </div>
  );
}
