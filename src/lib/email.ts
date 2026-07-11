import { DEFAULT_SITE_URL } from "@/lib/constants";
import { formatARS } from "@/lib/money";
import type { Order } from "@/lib/types";

export type EmailTemplate =
  | "welcome"
  | "password-reset"
  | "order-received"
  | "payment-approved"
  | "payment-rejected"
  | "order-shipped"
  | "order-delivered"
  | "digital-delivery-available"
  | "order-cancelled"
  | "refund";

export async function sendTransactionalEmail(input: {
  to: string;
  template: EmailTemplate;
  subject: string;
  html: string;
}): Promise<{ sent: boolean; provider: "resend" | "development" }> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!apiKey || !from) {
    console.info("[email:development]", {
      to: input.to,
      template: input.template,
      subject: input.subject,
    });
    return { sent: false, provider: "development" };
  }

  const { Resend } = await import("resend");
  const resend = new Resend(apiKey);
  await resend.emails.send({
    from,
    to: input.to,
    subject: input.subject,
    html: input.html,
  });

  return { sent: true, provider: "resend" };
}

export function renderOrderEmail(order: Order, title: string): string {
  const itemsHtml = order.items
    .map(
      (item) =>
        `<tr>
          <td style="padding:8px 0;border-bottom:1px solid #2A2E39">${item.productName} x${item.quantity}</td>
          <td style="padding:8px 0;border-bottom:1px solid #2A2E39;text-align:right">${formatARS(item.totalCents)}</td>
        </tr>`,
    )
    .join("");

  const trackUrl = `${DEFAULT_SITE_URL}/seguimiento`;

  return `
    <div style="font-family:Arial,Helvetica,sans-serif;background:#070707;color:#ffffff;padding:24px;max-width:600px;margin:0 auto">
      <h1 style="color:#1D6DFF;margin:0 0 8px">T.PlayGames</h1>
      <h2 style="margin:0 0 16px">${title}</h2>
      <div style="background:#111318;border-radius:12px;padding:20px;margin-bottom:16px">
        <p style="margin:0 0 4px;color:#A7ACB8;font-size:13px">Número de pedido</p>
        <p style="margin:0;font-size:20px;font-weight:900">${order.orderNumber}</p>
      </div>
      <table style="width:100%;border-collapse:collapse;margin-bottom:16px">
        ${itemsHtml}
      </table>
      <div style="text-align:right;font-size:18px;font-weight:900;margin-bottom:16px">
        Total: ${formatARS(order.totals.totalCents)}
      </div>
      <div style="background:#111318;border-radius:12px;padding:16px;margin-bottom:16px">
        <p style="margin:0 0 8px;color:#A7ACB8;font-size:13px">Seguí tu pedido</p>
        <a href="${trackUrl}" style="color:#1D6DFF;text-decoration:none;font-weight:700">${trackUrl}</a>
      </div>
      <p style="color:#7D8492;font-size:12px;margin:0">
        Este correo fue generado por T.PlayGames. Si tenés dudas, respondé este email o escribinos por WhatsApp.
      </p>
    </div>
  `;
}

export async function sendOrderConfirmationEmail(
  order: Order,
  publicOrderNumber: string,
): Promise<{ sent: boolean; provider: "resend" | "development" }> {
  const orderWithPublicNumber = { ...order, orderNumber: publicOrderNumber };

  const paymentInstructions =
    order.paymentMethod === "transfer"
      ? "<p style='color:#86EFAC;font-weight:700'>Recordá realizar la transferencia dentro de las 24 horas y enviar el comprobante por WhatsApp.</p>"
      : "";

  const html = renderOrderEmail(orderWithPublicNumber, "Pedido recibido") + paymentInstructions;

  return sendTransactionalEmail({
    to: order.customer.email,
    template: "order-received",
    subject: `T.PlayGames - Pedido ${publicOrderNumber} confirmado`,
    html,
  });
}
