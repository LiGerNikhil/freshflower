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
  await sendEmail({
    to: email,
    template: { type: "email-otp", name, otp },
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
