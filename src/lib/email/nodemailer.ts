import nodemailer from "nodemailer";

export type EmailAttachment = {
  filename: string;
  content: Buffer;
  contentType?: string;
};

type EmailTemplate =
  | {
      type: "email-otp";
      name: string;
      otp: string;
    }
  | {
      type: "order-confirmation";
      name: string;
      orderNumber: string;
      total: number;
      items: { name: string; quantity: number; price: number; color?: string }[];
      deliveryAddress: { line1?: string; city?: string; pincode?: string };
    }
  | {
      type: "password-changed";
      name: string;
    }
  | {
      type: "payment-verification-required";
      orderNumber: string;
      customerName: string;
      customerEmail?: string;
      customerPhone?: string;
      total: number;
      paymentAccount: { label: string; receiverName: string; upiId: string };
      upiTransactionRef: string;
      submittedAt: Date;
      adminOrderUrl: string;
    }
  | {
      type: "payment-verified-customer";
      name: string;
      orderNumber: string;
      total: number;
    }
  | {
      type: "payment-correction-customer";
      name: string;
      orderNumber: string;
      reason: string;
      orderUrl: string;
    };

export type SendEmailInput = {
  to: string;
  template: EmailTemplate;
  attachments?: EmailAttachment[];
};

export function adminPaymentNotificationRecipient(): string {
  return (
    process.env.PAYMENT_NOTIFICATION_EMAIL ??
    process.env.ADMIN_NOTIFICATION_EMAIL ??
    process.env.SMTP_USER ??
    ""
  ).trim();
}

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
  if (template.type === "email-otp") {
    const expiryMinutes = 15;
    return {
      subject: `Your FreshFlower.zone verification code`,
      text: `Hi ${template.name}, your FreshFlower.zone email verification code is ${template.otp}. This code is valid for ${expiryMinutes} minutes. If you did not create this account, you can ignore this email.`,
      html: baseLayout({
        title: "Verify your email",
        body: `<p>Hi ${escapeHtml(template.name)},</p><p>Enter this code on the FreshFlower.zone page to finish setting up your account.</p><p style="margin:22px 0;text-align:center;font-size:34px;font-weight:800;letter-spacing:0.22em;color:#1f1b16;">${escapeHtml(template.otp)}</p><p style="text-align:center;font-size:13px;color:#8a8377;">This code is valid for ${expiryMinutes} minutes.</p><p>If you did not create this account, you can ignore this email.</p>`,
      }),
    };
  }

  if (template.type === "order-confirmation") {
    const total = `₹${template.total.toLocaleString("en-IN")}`;
    const items = template.items
      .map(
        (item) =>
          `<li>${escapeHtml(item.name)}${item.color ? ` — ${escapeHtml(item.color)}` : ""} × ${item.quantity} — ₹${(item.price * item.quantity).toLocaleString("en-IN")}</li>`,
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

  if (template.type === "payment-verification-required") {
    const total = `₹${template.total.toLocaleString("en-IN")}`;
    const submittedAt = new Intl.DateTimeFormat("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Asia/Kolkata",
    }).format(template.submittedAt);
    const body = `<p>A manual UPI payment needs admin verification.</p>
      <p><strong>Order:</strong> ${escapeHtml(template.orderNumber)}</p>
      <p><strong>Customer:</strong> ${escapeHtml(template.customerName)}${template.customerPhone ? ` · ${escapeHtml(template.customerPhone)}` : ""}${template.customerEmail ? ` · ${escapeHtml(template.customerEmail)}` : ""}</p>
      <p><strong>Amount:</strong> ${total}</p>
      <p><strong>Payment account:</strong> ${escapeHtml(template.paymentAccount.label)} · ${escapeHtml(template.paymentAccount.receiverName)} · ${escapeHtml(template.paymentAccount.upiId)}</p>
      <p><strong>UPI reference:</strong> ${escapeHtml(template.upiTransactionRef)}</p>
      <p><strong>Submitted:</strong> ${escapeHtml(submittedAt)} IST</p>
      <p><a href="${template.adminOrderUrl}" style="display:inline-block;background:#d6aa5a;color:#1f1b16;text-decoration:none;border-radius:10px;padding:12px 18px;font-weight:700;">Open admin order</a></p>`;
    return {
      subject: `Payment verification required — Order ${template.orderNumber}`,
      text: `Payment verification required — Order ${template.orderNumber}\nCustomer: ${template.customerName}${template.customerPhone ? ` · ${template.customerPhone}` : ""}${template.customerEmail ? ` · ${template.customerEmail}` : ""}\nAmount: ${total}\nPayment account: ${template.paymentAccount.label} · ${template.paymentAccount.receiverName} · ${template.paymentAccount.upiId}\nUPI reference: ${template.upiTransactionRef}\nSubmitted: ${submittedAt} IST\nAdmin: ${template.adminOrderUrl}`,
      html: baseLayout({ title: "Payment verification required", body }),
    };
  }

  if (template.type === "payment-verified-customer") {
    const total = `₹${template.total.toLocaleString("en-IN")}`;
    return {
      subject: `Payment verified for order ${template.orderNumber}`,
      text: `Hi ${template.name}, your payment for order ${template.orderNumber} (${total}) has been verified.`,
      html: baseLayout({
        title: "Payment verified",
        body: `<p>Hi ${escapeHtml(template.name)},</p><p>Your payment for order <strong>${escapeHtml(template.orderNumber)}</strong> has been verified.</p><p>Amount: <strong>${total}</strong></p><p>We will continue preparing your flowers and keep you updated.</p>`,
      }),
    };
  }

  if (template.type === "payment-correction-customer") {
    return {
      subject: `Payment details need correction — Order ${template.orderNumber}`,
      text: `Hi ${template.name}, payment details for order ${template.orderNumber} need correction. Reason: ${template.reason}. Update here: ${template.orderUrl}`,
      html: baseLayout({
        title: "Payment details need correction",
        body: `<p>Hi ${escapeHtml(template.name)},</p><p>We could not verify the payment details for order <strong>${escapeHtml(template.orderNumber)}</strong>.</p><p><strong>Reason:</strong> ${escapeHtml(template.reason)}</p><p><a href="${template.orderUrl}" style="display:inline-block;background:#d6aa5a;color:#1f1b16;text-decoration:none;border-radius:10px;padding:12px 18px;font-weight:700;">Update payment details</a></p>`,
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

export async function sendEmail({ to, template, attachments }: SendEmailInput) {
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
  return transporter.sendMail({
    from: `FreshFlower.zone <${user}>`,
    to,
    subject: rendered.subject,
    text: rendered.text,
    html: rendered.html,
    attachments,
  });
}
