import { sendEmail } from "@/lib/email/nodemailer";

export async function sendEmailOtp({
  email,
  name,
  otp,
}: {
  email: string;
  name: string;
  otp: string;
}) {
  let lastError: unknown;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      await sendEmail({
        to: email,
        template: { type: "email-otp", name, otp },
      });
      return;
    } catch (error) {
      lastError = error;
      const code =
        typeof error === "object" && error !== null && "code" in error
          ? String(error.code)
          : "";
      const transient =
        ["ECONNECTION", "ECONNRESET", "ETIMEDOUT", "ESOCKET", "ETLS"].includes(code) ||
        (typeof error === "object" &&
          error !== null &&
          "responseCode" in error &&
          Number(error.responseCode) >= 400 &&
          Number(error.responseCode) < 500);
      if (!transient || attempt === 1) break;
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }
  throw lastError;
}

export async function sendPasswordResetEmail({
  email,
  name,
  accountType,
  resetUrl,
}: {
  email: string;
  name: string;
  accountType: "customer" | "admin";
  resetUrl: string;
}) {
  await sendEmail({
    to: email,
    template: { type: "password-reset", name, accountType, resetUrl },
  });
}

export async function sendPasswordChangedEmail({ email, name }: { email: string; name: string }) {
  await sendEmail({
    to: email,
    template: { type: "password-changed", name },
  });
}

export async function sendOrderConfirmationEmail({
  email,
  name,
  orderNumber,
  total,
  items,
  deliveryAddress,
}: {
  email: string;
  name: string;
  orderNumber: string;
  total: number;
  items: { name: string; quantity: number; price: number }[];
  deliveryAddress: { line1?: string; city?: string; pincode?: string };
}) {
  await sendEmail({
    to: email,
    template: { type: "order-confirmation", name, orderNumber, total, items, deliveryAddress },
  });
}
