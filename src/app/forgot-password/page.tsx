import { Suspense } from "react";
import { PasswordRecoveryForm } from "@/components/auth/PasswordRecoveryForm";

export const metadata = {
  title: "Forgot password | FreshFlower.zone",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return (
    <Suspense>
      <PasswordRecoveryForm />
    </Suspense>
  );
}
