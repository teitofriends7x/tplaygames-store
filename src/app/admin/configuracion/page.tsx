import type { ReactNode } from "react";

import { formatARS } from "@/lib/money";
import { getStoreState } from "@/lib/store";

export default function AdminSettingsPage() {
  const settings = getStoreState().settings;

  return (
    <section>
      <p className="section-eyebrow">Sistema</p>
      <h1 className="mt-2 text-3xl font-black text-white">Configuración</h1>
      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        <SettingsCard title="Envíos">
          <p className="mt-2 text-[#A7ACB8]">
            Envío bonificado desde {formatARS(settings.freeShippingFromCents)}.
          </p>
          <p className="mt-2 text-[#A7ACB8]">
            Retiro: {settings.pickupEnabled ? "habilitado" : "deshabilitado"}.
          </p>
          <div className="mt-4 grid gap-2 text-sm text-[#A7ACB8]">
            {Object.entries(settings.provinceShippingCents).map(
              ([province, cents]) => (
                <div key={province} className="flex justify-between gap-4">
                  <span>{province}</span>
                  <span>{formatARS(cents)}</span>
                </div>
              ),
            )}
          </div>
        </SettingsCard>
        <SettingsCard title="Pagos">
          <p className="mt-2 text-[#A7ACB8]">
            Mercado Pago:{" "}
            {settings.paymentMethods.mercadoPago
              ? "configurable"
              : "desactivado"}
            .
          </p>
          <p className="mt-2 text-[#A7ACB8]">
            Transferencia:{" "}
            {settings.paymentMethods.transfer ? "configurable" : "desactivada"}.
          </p>
          {settings.transferDiscountPercent ? (
            <p className="mt-2 text-[#A7ACB8]">
              Descuento por transferencia: {settings.transferDiscountPercent}%.
            </p>
          ) : null}
        </SettingsCard>
        <SettingsCard title="Credenciales">
          <p className="mt-2 text-[#A7ACB8]">
            Supabase, Mercado Pago, Resend y WhatsApp se configuran por
            variables de entorno. No hay secretos hardcodeados.
          </p>
        </SettingsCard>
        <SettingsCard title="Redes sociales">
          <p className="mt-2 text-[#A7ACB8]">
            Instagram y TikTok son campos configurables. No se muestran enlaces
            falsos si no existen URLs reales.
          </p>
        </SettingsCard>
      </div>
    </section>
  );
}

function SettingsCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="tpg-card p-5">
      <h2 className="text-xl font-black text-white">{title}</h2>
      {children}
    </div>
  );
}
