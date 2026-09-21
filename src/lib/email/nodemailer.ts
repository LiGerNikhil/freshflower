import nodemailer from "nodemailer";
import { canonical } from "@/lib/seo";

type EmailTemplate =
  | {
      type: "verify-email";
      name: string;
      token: string;
    }
  | {
      type: "order-confirmation";
      name: string;
      orderNumber: string;
      total: number;
      items: { name: string; quantity: number; price: number }[];
      deliveryAddress: { line1?: string; city?: string; pincode?: string };
    }
  | {
      type: "password-changed";
      name: string;
    };

export type SendEmailInput = {
  to: string;
  template: EmailTemplate;
};

function smtpConfig() {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_APP_PASSWORD;
  if (!user || !pass) {
    throw new Error("Missing SMTP_USER or SMTP_APP_PASSWORD.");
  }
  return { user, pass };
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function baseLayout({ title, body }: { title: string; body: string }) {
  return `<!doctype html>
<html>
  <body style="margin:0;background:#fbf7f0;font-family:Arial,sans-serif;color:#1f1b16;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#fbf7f0;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border-radius:18px;padding:28px;">
            <tr><td style="font-size:12px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:#a9813a;">FreshFlower.zone</td></tr>
            <tr><td><h1 style="margin:14px 0 16px;font-size:28px;line-height:1.2;color:#1f1b16;">${escapeHtml(title)}</h1></td></tr>
            <tr><td style="font-size:15px;line-height:1.7;color:#4c463d;">${body}</td></tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function renderTemplate(template: EmailTemplate): { subject: string; html: string; text: string } {
  if (template.type === "verify-email") {
    const url = canonical(`/account/verify-email?token=${encodeURIComponent(template.token)}`);
    return {
      subject: "Verify your FreshFlower.zone account",
      text: `Hi ${template.name}, verify your FreshFlower.zone account: ${url}`,
      html: baseLayout({
        title: "Verify your email",
        body: `<p>Hi ${escapeHtml(template.name)},</p><p>Confirm your email address to finish setting up your FreshFlower.zone account.</p><p><a href="${url}" style="display:inline-block;background:#d6aa5a;color:#1f1b16;text-decoration:none;border-radius:10px;padding:12px 18px;font-weight:700;">Verify email</a></p><p>If you did not create this account, you can ignore this email.</p>`,
      }),
    };
  }

  if (template.type === "order-confirmation") {
    const total = `₹${template.total.toLocaleString("en-IN")}`;
    const items = template.items
      .map(
        (item) =>
          `<li>${escapeHtml(item.name)} × ${item.quantity} — ₹${(item.price * item.quantity).toLocaleString("en-IN")}</li>`,
      )
      .join("");
    const address = [template.deliveryAddress.line1, template.deliveryAddress.city, template.deliveryAddress.pincode]
      .filter(Boolean)
      .join(", ");
    return {
      subject: `Order ${template.orderNumber} confirmed`,
      text: `Hi ${template.name}, your order ${template.orderNumber} is confirmed. Total: ${total}. Delivering to: ${address}.`,
      html: baseLayout({
        title: "Order confirmed",
        body: `<p>Hi ${escapeHtml(template.name)},</p><p>Your order <strong>${escapeHtml(template.orderNumber)}</strong> is confirmed.</p><p>Total: <strong>${total}</strong></p><p>Delivering to: ${escapeHtml(address)}</p><ul>${items}</ul><p>We will prepare your flowers and keep you updated.</p>`,
      }),
    };
  }

  return {
    subject: "Your FreshFlower.zone password was changed",
    text: `Hi ${template.name}, your FreshFlower.zone password was changed. If this was not you, contact us immediately.`,
    html: baseLayout({
      title: "Password changed",
      body: `<p>Hi ${escapeHtml(template.name)},</p><p>Your FreshFlower.zone password was changed successfully.</p><p>If this was not you, please contact us immediately.</p>`,
    }),
  };
}

export async function sendEmail({ to, template }: SendEmailInput) {
  const { user, pass } = smtpConfig();
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    requireTLS: true,
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 10_000,
    auth: { user, pass },
  });
  const rendered = renderTemplate(template);
  await transporter.sendMail({
    from: `FreshFlower.zone <${user}>`,
    to,
    subject: rendered.subject,
    text: rendered.text,
    html: rendered.html,
  });
}
