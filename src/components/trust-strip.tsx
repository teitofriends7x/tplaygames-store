import { CreditCard, Headphones, ShieldCheck, Truck } from "lucide-react";

const items = [
  {
    icon: ShieldCheck,
    title: "Compra segura",
    body: "Precios finales y actualizados. Tu pedido se confirma una vez acreditado el pago.",
  },
  {
    icon: CreditCard,
    title: "Pago con Mercado Pago",
    body: "Pagá con tarjeta, dinero en cuenta o cuotas. También aceptamos transferencia con precio especial.",
  },
  {
    icon: Truck,
    title: "Envíos a todo el país",
    body: "Envíos a domicilio por provincia o retiro en punto acordado.",
  },
  {
    icon: Headphones,
    title: "Atención por WhatsApp",
    body: "Consultas sobre productos, pedidos y envíos con atención personalizada.",
  },
];

export function TrustStrip() {
  return (
    <section className="tpg-container py-8">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => (
          <article key={item.title} className="tpg-card-soft p-4">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-[#1D6DFF]/13 text-[#8FB7FF]">
              <item.icon className="h-5 w-5" />
            </div>
            <h3 className="mt-4 font-black text-white">{item.title}</h3>
            <p className="mt-2 text-sm leading-6 text-[#A7ACB8]">{item.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
