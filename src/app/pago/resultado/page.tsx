import Link from "next/link";

import { PaymentResultActions } from "@/components/payment-result-actions";
import { PAYMENT_STATUS_LABELS, STATUS_LABELS } from "@/lib/constants";
import { findOrder } from "@/lib/store";

export default async function PaymentResultPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const orderParam = Array.isArray(params.order) ? params.order[0] : params.order;
  const order = orderParam ? findOrder(orderParam) : undefined;

  return (
    <section className="mx-auto max-w-3xl px-4 py-16">
      <div className="rounded-lg border border-white/10 bg-[#111318] p-6">
        <h1 className="text-3xl font-black text-white">Estado del pago</h1>
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
            No encontramos el pedido en el estado local. La URL de retorno no
            confirma pagos por si sola; el webhook verificado actualiza el pedido.
          </p>
        )}
        <Link
          href="/mis-pedidos"
          className="mt-6 inline-flex h-11 items-center rounded-lg bg-[#1D6DFF] px-5 text-sm font-black text-white"
        >
          Ver mis pedidos
        </Link>
      </div>
    </section>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-[#070707] p-4">
      <dt className="text-xs font-bold uppercase text-[#A7ACB8]">{label}</dt>
      <dd className="mt-1 font-black text-white">{value}</dd>
    </div>
  );
}
