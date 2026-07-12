"use client";

import { UploadCloud } from "lucide-react";
import { useState } from "react";

import type { Order } from "@/lib/types";

export function TransferProofUpload({
  order,
  email,
  onUploaded,
}: {
  order: Order;
  email?: string;
  onUploaded?: (order: Order) => void;
}) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (order.paymentMethod !== "transfer" || order.paymentStatus !== "pending") {
    return null;
  }

  async function submit(formData: FormData) {
    setLoading(true);
    setError("");
    setMessage("");
    formData.set("orderNumber", order.orderNumber);
    if (email) formData.set("email", email);

    try {
      const response = await fetch("/api/orders/transfer-proof", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "No se pudo subir el comprobante.");
        return;
      }

      setMessage("Comprobante recibido. Lo vamos a revisar manualmente.");
      if (onUploaded) {
        onUploaded(data.order);
      } else {
        window.location.reload();
      }
    } catch {
      setError("Error de conexión. Intentá nuevamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      action={submit}
      className="mt-5 rounded-2xl border border-[#1D6DFF]/25 bg-[#1D6DFF]/10 p-4"
    >
      <h3 className="font-black text-white">Enviar comprobante</h3>
      <p className="mt-1 text-sm leading-6 text-[#C8D9FF]">
        Subí JPG, PNG o PDF de hasta 10 MB. La aprobación es manual; no genera
        entrega inmediata.
      </p>
      <input
        type="file"
        name="file"
        accept="image/jpeg,image/png,application/pdf"
        required
        className="input mt-3"
      />
      <button disabled={loading} className="btn btn-primary mt-3">
        <UploadCloud className="h-4 w-4" />
        {loading ? "Enviando..." : "Subir comprobante"}
      </button>
      {message ? (
        <p className="mt-3 text-sm text-[#86EFAC]">{message}</p>
      ) : null}
      {error ? <p className="mt-3 text-sm text-[#FCA5A5]">{error}</p> : null}
    </form>
  );
}
