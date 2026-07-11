import { formatARS } from "@/lib/money";
import { getStoreState } from "@/lib/store";

export default function AdminSettingsPage() {
  const settings = getStoreState().settings;

  return (
    <section>
      <h1 className="text-3xl font-black text-white">Configuracion</h1>
      <div className="mt-6 rounded-lg border border-white/10 bg-[#111318] p-5">
        <h2 className="text-xl font-black text-white">Envios</h2>
        <p className="mt-2 text-[#A7ACB8]">
          Envio gratis desde {formatARS(settings.freeShippingFromCents)}.
        </p>
        <p className="mt-2 text-[#A7ACB8]">
          Retiro: {settings.pickupEnabled ? "habilitado" : "deshabilitado"}.
        </p>
      </div>
      <div className="mt-4 rounded-lg border border-white/10 bg-[#111318] p-5">
        <h2 className="text-xl font-black text-white">Credenciales</h2>
        <p className="mt-2 text-[#A7ACB8]">
          Supabase, Mercado Pago, Resend y WhatsApp se configuran por variables
          de entorno. No hay secretos hardcodeados.
        </p>
      </div>
    </section>
  );
}
