import { PrintButton } from "@/components/print-button";
import {
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
  STATUS_LABELS,
} from "@/lib/constants";
import { formatARS, formatDateTimeAR } from "@/lib/money";
import type { Order } from "@/lib/types";

export function OrderReceipt({ order }: { order: Order }) {
  return (
    <section className="mx-auto max-w-4xl px-4 py-10 print:bg-white print:text-black">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div>
          <p className="section-eyebrow">Comprobante</p>
          <h1 className="mt-2 text-3xl font-black text-white">
            Pedido {order.orderNumber}
          </h1>
        </div>
        <PrintButton />
      </div>

      <article className="rounded-2xl border border-white/10 bg-[#111318] p-6 print:border-black print:bg-white">
        <header className="flex flex-wrap justify-between gap-4 border-b border-white/10 pb-5 print:border-black">
          <div>
            <p className="text-2xl font-black text-white print:text-black">
              T.PlayGames
            </p>
            <p className="mt-1 text-sm text-[#A7ACB8] print:text-black">
              Jugá más. Pagá menos.
            </p>
          </div>
          <div className="text-sm text-[#A7ACB8] print:text-black">
            <p className="font-black text-white print:text-black">
              {order.orderNumber}
            </p>
            <p>{formatDateTimeAR(order.createdAt)}</p>
            <p>Estado: {STATUS_LABELS[order.status]}</p>
            <p>Pago: {PAYMENT_STATUS_LABELS[order.paymentStatus]}</p>
            <p>
              Método:{" "}
              {PAYMENT_METHOD_LABELS[order.paymentMethod ?? "mercadopago"]}
            </p>
          </div>
        </header>

        <section className="grid gap-4 border-b border-white/10 py-5 text-sm print:border-black md:grid-cols-2">
          <div>
            <h2 className="font-black text-white print:text-black">Cliente</h2>
            <p className="mt-2 text-[#A7ACB8] print:text-black">
              {order.customer.firstName} {order.customer.lastName}
            </p>
            <p className="text-[#A7ACB8] print:text-black">
              {order.customer.email}
            </p>
            <p className="text-[#A7ACB8] print:text-black">
              {order.customer.phone}
            </p>
          </div>
          {order.address ? (
            <div>
              <h2 className="font-black text-white print:text-black">
                Entrega
              </h2>
              <p className="mt-2 text-[#A7ACB8] print:text-black">
                {order.address.street}, {order.address.city},{" "}
                {order.address.province} ({order.address.postalCode})
              </p>
              {order.address.notes ? (
                <p className="text-[#A7ACB8] print:text-black">
                  {order.address.notes}
                </p>
              ) : null}
            </div>
          ) : (
            <div>
              <h2 className="font-black text-white print:text-black">
                Entrega
              </h2>
              <p className="mt-2 text-[#A7ACB8] print:text-black">
                Producto digital con entrega manual protegida.
              </p>
            </div>
          )}
        </section>

        <section className="py-5">
          <h2 className="font-black text-white print:text-black">Productos</h2>
          <div className="mt-3 divide-y divide-white/10 print:divide-black">
            {order.items.map((item) => (
              <div
                key={`${item.productId}-${item.variantId ?? "base"}`}
                className="grid gap-2 py-3 text-sm md:grid-cols-[1fr_auto]"
              >
                <div>
                  <p className="font-semibold text-white print:text-black">
                    {item.productName}
                  </p>
                  <p className="text-[#A7ACB8] print:text-black">
                    {item.variantLabel ?? item.sku} · Cantidad {item.quantity}
                  </p>
                </div>
                <p className="font-black text-white print:text-black">
                  {formatARS(item.totalCents)}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="ml-auto max-w-sm border-t border-white/10 pt-5 text-sm print:border-black">
          <ReceiptRow label="Subtotal" value={order.totals.subtotalCents} />
          <ReceiptRow
            label="Descuentos"
            value={
              -order.totals.productDiscountCents -
              order.totals.couponDiscountCents
            }
          />
          <ReceiptRow label="Envío" value={order.totals.shippingCents} />
          <div className="mt-3 flex justify-between text-xl font-black text-white print:text-black">
            <span>Total</span>
            <span>{formatARS(order.totals.totalCents)}</span>
          </div>
        </section>

        <p className="mt-6 text-xs leading-5 text-[#7D8492] print:text-black">
          Este documento es un comprobante de pedido emitido por la tienda para
          seguimiento de compra. No reemplaza factura fiscal. Los textos legales
          y condiciones comerciales deben ser revisados por un profesional antes
          del lanzamiento.
        </p>
      </article>
    </section>
  );
}

function ReceiptRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between text-[#A7ACB8] print:text-black">
      <span>{label}</span>
      <span>{formatARS(value)}</span>
    </div>
  );
}
