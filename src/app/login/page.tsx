import { Suspense } from "react";
import LoginRegisterForm from "./LoginRegisterForm";

export const metadata = {
  title: "Login | FreshFlower.zone",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <Suspense>
      <LoginRegisterForm />
    </Suspense>
  );
}
