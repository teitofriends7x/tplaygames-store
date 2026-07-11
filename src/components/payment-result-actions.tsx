"use client";

import { useState } from "react";

export function PaymentResultActions({ orderNumber }: { orderNumber?: string }) {
  const [message, setMessage] = useState("");

  if (!orderNumber || process.env.NODE_ENV === "production") {
    return null;
  }

  async function approve() {
    const response = await fetch("/api/dev/payments/approve", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ orderNumber }),
    });
    setMessage(response.ok ? "Pago aprobado en modo desarrollo." : "No se pudo simular.");
  }

  return (
    <div className="mt-5 rounded-lg border border-[#F59E0B]/30 bg-[#F59E0B]/10 p-4">
      <p className="text-sm text-[#F8D18A]">
        Modo desarrollo: podes simular la aprobacion del pago sin Mercado Pago.
      </p>
      <button
        type="button"
        onClick={approve}
        className="mt-3 h-10 rounded-lg bg-[#F59E0B] px-4 text-sm font-black text-black"
      >
        Simular pago aprobado
      </button>
      {message ? <p className="mt-3 text-sm text-[#22C55E]">{message}</p> : null}
    </div>
  );
}
