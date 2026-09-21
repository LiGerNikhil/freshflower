import { sendEmail } from "@/lib/email/nodemailer";

export async function sendVerificationEmail({
  email,
  name,
  token,
}: {
  email: string;
  name: string;
  token: string;
}) {
  await sendEmail({
    to: email,
    template: { type: "verify-email", name, token },
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
