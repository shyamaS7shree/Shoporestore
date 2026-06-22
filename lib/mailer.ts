import nodemailer from "nodemailer";

type MailItem = {
  name?: string;
  quantity?: number;
  price?: number;
};

type SendShoporeMailInput = {
  to?: string;
  subject: string;
  title: string;
  userName?: string;
  intro: string;
  orderId?: string;
  paymentId?: string;
  amount?: number;
  items?: MailItem[];
};

function getTransporter() {
  const host = process.env.BREVO_SMTP_HOST || "smtp-relay.brevo.com";
  const port = Number(process.env.BREVO_SMTP_PORT || 587);
  const user = process.env.BREVO_SMTP_USER;
  const pass = process.env.BREVO_SMTP_KEY || process.env.BREVO_SMTP_PASS;

  if (!user || !pass) return null;

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });
}

function getFromAddress() {
  if (process.env.EMAIL_FROM) return process.env.EMAIL_FROM;

  const fromEmail = process.env.BREVO_FROM_EMAIL;
  const fromName = process.env.BREVO_FROM_NAME || "Shopore";
  return fromEmail ? `${fromName} <${fromEmail}>` : "Shopore <no-reply@shopore.local>";
}

function formatPrice(value?: number) {
  if (!Number.isFinite(Number(value))) return "";
  return `\u20b9${Number(value).toLocaleString("en-IN")}`;
}

function buildHtml({
  title,
  userName,
  intro,
  orderId,
  paymentId,
  amount,
  items,
}: SendShoporeMailInput) {
  const itemRows = items?.length
    ? items
        .map(
          (item) => `
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid #e5e7eb;">${item.name || "Product"}</td>
              <td style="padding:10px 0;border-bottom:1px solid #e5e7eb;text-align:center;">${item.quantity || 1}</td>
              <td style="padding:10px 0;border-bottom:1px solid #e5e7eb;text-align:right;">${formatPrice(item.price || 0)}</td>
            </tr>
          `
        )
        .join("")
    : "";

  return `
    <div style="margin:0;background:#f6f7fb;padding:24px;font-family:Arial,sans-serif;color:#071225;">
      <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;">
        <div style="padding:24px 24px 16px;border-bottom:1px solid #eef2f7;">
          <div style="font-size:28px;font-weight:700;letter-spacing:5px;">SHOPORE</div>
          <h1 style="margin:18px 0 0;font-size:22px;line-height:1.3;">${title}</h1>
        </div>
        <div style="padding:24px;">
          <p style="margin:0 0 12px;">Hi <strong>${userName || "there"}</strong>,</p>
          <p style="margin:0 0 20px;line-height:1.6;color:#334155;">${intro}</p>
          ${orderId ? `<p style="margin:0 0 8px;"><strong>Order ID:</strong> ${orderId}</p>` : ""}
          ${paymentId ? `<p style="margin:0 0 8px;"><strong>Payment ID:</strong> ${paymentId}</p>` : ""}
          ${Number.isFinite(Number(amount)) ? `<p style="margin:0 0 20px;"><strong>Total:</strong> ${formatPrice(amount)}</p>` : ""}
          ${
            itemRows
              ? `
                <table style="width:100%;border-collapse:collapse;margin-top:18px;font-size:14px;">
                  <thead>
                    <tr>
                      <th style="padding-bottom:8px;text-align:left;color:#64748b;">Item</th>
                      <th style="padding-bottom:8px;text-align:center;color:#64748b;">Qty</th>
                      <th style="padding-bottom:8px;text-align:right;color:#64748b;">Price</th>
                    </tr>
                  </thead>
                  <tbody>${itemRows}</tbody>
                </table>
              `
              : ""
          }
          <p style="margin:24px 0 0;line-height:1.6;color:#334155;">Thank you for shopping with Shopore.</p>
        </div>
      </div>
    </div>
  `;
}

export async function sendShoporeMail(input: SendShoporeMailInput) {
  if (!input.to) return "Customer email is missing";

  const transporter = getTransporter();
  if (!transporter) return "Missing BREVO_SMTP_USER and BREVO_SMTP_PASS in .env.local";

  try {
    await transporter.sendMail({
      from: getFromAddress(),
      to: input.to,
      subject: input.subject,
      html: buildHtml(input),
    });

    return null;
  } catch (error) {
    console.error("[mail] Failed:", error);
    return error instanceof Error ? error.message : "Email failed";
  }
}
