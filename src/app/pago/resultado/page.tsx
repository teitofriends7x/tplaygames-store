import type { Metadata } from "next";
import Link from "next/link";

import { PaymentResultActions } from "@/components/payment-result-actions";
import { PAYMENT_STATUS_LABELS, STATUS_LABELS } from "@/lib/constants";
import { findOrder } from "@/lib/store";

export const metadata: Metadata = {
  title: "Resultado de pago",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function PaymentResultPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const orderParam = Array.isArray(params.order)
    ? params.order[0]
    : params.order;
  const order = orderParam ? findOrder(orderParam) : undefined;

  return (
    <section className="tpg-container py-16">
      <div className="tpg-card mx-auto max-w-3xl p-6">
        <p className="section-eyebrow">Pago</p>
        <h1 className="mt-2 text-3xl font-black text-white">Estado del pago</h1>
        {order ? (
          <>
            <p className="mt-3 text-[#A7ACB8]">Pedido {order.orderNumber}</p>
            <dl className="mt-6 grid gap-3 sm:grid-cols-2">
              <Info label="Pedido" value={STATUS_LABELS[order.status]} />
              <Info
                label="Pago"
                value={PAYMENT_STATUS_LABELS[order.paymentStatus]}
              />
            </dl>
            <PaymentResultActions orderNumber={order.orderNumber} />
          </>
        ) : (
          <p className="mt-3 text-[#A7ACB8]">
            No encontramos el pedido. Si acabás de realizar el pago, puede
            tardar unos minutos en reflejarse. Si el problema persiste,
            contactanos por WhatsApp.
          </p>
        )}
        <Link href="/mis-pedidos" className="btn btn-primary mt-6">
          Ver mis pedidos
        </Link>
      </div>
    </section>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#070707] p-4">
      <dt className="text-xs font-bold uppercase text-[#A7ACB8]">{label}</dt>
      <dd className="mt-1 font-black text-white">{value}</dd>
    </div>
  );
}
