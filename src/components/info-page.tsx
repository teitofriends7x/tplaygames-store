import { MessageCircle } from "lucide-react";
import Link from "next/link";

export function InfoPage({
  title,
  sections,
  legal = false,
  whatsappUrl,
}: {
  title: string;
  sections: [string, string][];
  legal?: boolean;
  whatsappUrl?: string;
}) {
  return (
    <section className="tpg-container py-10">
      <p className="section-eyebrow">Ayuda</p>
      <h1 className="mt-2 text-3xl font-black text-white">{title}</h1>
      {legal ? (
        <p className="mt-4 rounded-xl border border-[#F59E0B]/30 bg-[#F59E0B]/10 p-4 text-sm leading-6 text-[#F8D18A]">
          Esta información es orientativa. Para consultas específicas sobre tu
          compra, contactanos por WhatsApp.
        </p>
      ) : null}
      <div className="mt-6 space-y-4">
        {sections.map(([heading, body]) => (
          <section key={heading} className="tpg-card p-5">
            <h2 className="text-xl font-black text-white">{heading}</h2>
            <p className="mt-2 leading-7 text-[#A7ACB8]">{body}</p>
          </section>
        ))}
      </div>
      {whatsappUrl ? (
        <div className="mt-8">
          <Link
            href={whatsappUrl}
            className="btn btn-secondary inline-flex items-center gap-2"
          >
            <MessageCircle className="h-4 w-4" />
            Consultar por WhatsApp
          </Link>
        </div>
      ) : null}
    </section>
  );
}
