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
  return `
    <main style="font-family:Arial,sans-serif;background:#070707;color:#ffffff;padding:24px">
      <h1 style="color:#1D6DFF">T.PlayGames</h1>
      <h2>${title}</h2>
      <p>Pedido: <strong>${order.orderNumber}</strong></p>
      <p>Total: <strong>${order.totals.totalCents / 100} ARS</strong></p>
      <p>Este correo fue generado por el flujo transaccional de T.PlayGames.</p>
    </main>
  `;
}
