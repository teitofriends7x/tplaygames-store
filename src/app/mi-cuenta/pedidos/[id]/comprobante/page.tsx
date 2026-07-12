import { notFound } from "next/navigation";

import { OrderReceipt } from "@/components/order-receipt";
import { getOrderForCustomer } from "@/lib/order-persistence";
import { getSupabaseServerClient } from "@/lib/supabase/server";

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
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = supabase ? await supabase.auth.getUser() : { data: { user: null } };

  if (!user?.id || !user.email) notFound();

  const order = await getOrderForCustomer({
    idOrNumber: id,
    userId: user.id,
    email: user.email,
  });
  if (!order) notFound();

  return <OrderReceipt order={order} />;
}
