import { notFound } from "next/navigation";

import { OrderReceipt } from "@/components/order-receipt";
import { getOrderForCustomer } from "@/lib/order-persistence";
import { getCurrentClerkUser } from "@/lib/clerk-auth";

export const metadata = {
  title: "Comprobante de pedido",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AccountOrderReceiptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentClerkUser();

  if (!user?.id || !user.email) notFound();

  const order = await getOrderForCustomer({
    idOrNumber: id,
    clerkUserId: user.id,
    email: user.email,
  });
  if (!order) notFound();

  return <OrderReceipt order={order} />;
}
