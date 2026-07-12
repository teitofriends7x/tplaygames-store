import { notFound } from "next/navigation";

import { OrderReceipt } from "@/components/order-receipt";
import { getOrderForCustomer } from "@/lib/order-persistence";

export const metadata = {
  title: "Comprobante de pedido",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function TrackingReceiptPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const orderNumber = firstParam(params.orderNumber);
  const email = firstParam(params.email);
  if (!orderNumber || !email) notFound();

  const order = await getOrderForCustomer({
    idOrNumber: orderNumber,
    email,
  });
  if (!order) notFound();

  return <OrderReceipt order={order} />;
}

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}
