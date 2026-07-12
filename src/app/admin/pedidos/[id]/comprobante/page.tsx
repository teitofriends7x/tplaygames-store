import { notFound } from "next/navigation";

import { OrderReceipt } from "@/components/order-receipt";
import { getOrderDetailsForAdmin } from "@/lib/order-persistence";

export const metadata = {
  title: "Comprobante administrativo",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminOrderReceiptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrderDetailsForAdmin(id);
  if (!order) notFound();

  return <OrderReceipt order={order} />;
}
