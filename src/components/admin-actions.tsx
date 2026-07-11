"use client";

import { Send } from "lucide-react";
import { useState } from "react";

import { ORDER_STATUSES, STATUS_LABELS } from "@/lib/constants";
import type { OrderStatus } from "@/lib/types";

export function OrderStatusForm({ orderId }: { orderId: string }) {
  const [status, setStatus] = useState<OrderStatus>("preparing");
  const [message, setMessage] = useState("");

  async function submit(formData: FormData) {
    const response = await fetch(`/api/admin/orders/${orderId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-demo-role": "operator",
      },
      body: JSON.stringify({
        status,
        internalComment: formData.get("internalComment"),
      }),
    });
    setMessage(response.ok ? "Estado actualizado." : "No autorizado o error.");
  }

  return (
    <form action={submit} className="rounded-lg border border-white/10 bg-[#111318] p-4">
      <h2 className="font-black text-white">Actualizar estado</h2>
      <select
        value={status}
        onChange={(event) => setStatus(event.currentTarget.value as OrderStatus)}
        className="mt-3 h-11 w-full rounded-lg border border-white/10 bg-[#070707] px-3 text-white"
      >
        {ORDER_STATUSES.map((item) => (
          <option key={item} value={item}>
            {STATUS_LABELS[item]}
          </option>
        ))}
      </select>
      <textarea
        name="internalComment"
        placeholder="Comentario interno"
        className="mt-3 min-h-24 w-full rounded-lg border border-white/10 bg-[#070707] px-3 py-3 text-white"
      />
      <button className="mt-3 inline-flex h-10 items-center gap-2 rounded-lg bg-[#1D6DFF] px-4 text-sm font-bold text-white">
        <Send className="h-4 w-4" />
        Guardar
      </button>
      {message ? <p className="mt-3 text-sm text-[#22C55E]">{message}</p> : null}
    </form>
  );
}

export function DigitalDeliveryForm({ orderId }: { orderId: string }) {
  const [message, setMessage] = useState("");

  async function submit(formData: FormData) {
    const response = await fetch(`/api/admin/orders/${orderId}/digital-delivery`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-demo-role": "operator",
      },
      body: JSON.stringify({
        secureReference: formData.get("secureReference"),
        internalNote: formData.get("internalNote"),
        channel: formData.get("channel"),
      }),
    });
    setMessage(response.ok ? "Entrega digital registrada." : "No se pudo registrar.");
  }

  return (
    <form action={submit} className="rounded-lg border border-white/10 bg-[#111318] p-4">
      <h2 className="font-black text-white">Entrega digital manual</h2>
      <select
        name="channel"
        className="mt-3 h-11 w-full rounded-lg border border-white/10 bg-[#070707] px-3 text-white"
        defaultValue="email"
      >
        <option value="email">Correo</option>
        <option value="whatsapp">WhatsApp</option>
        <option value="manual">Manual</option>
      </select>
      <textarea
        name="secureReference"
        placeholder="Contenido o referencia segura. No se muestra en listados."
        className="mt-3 min-h-24 w-full rounded-lg border border-white/10 bg-[#070707] px-3 py-3 text-white"
      />
      <textarea
        name="internalNote"
        placeholder="Nota interna de auditoria"
        className="mt-3 min-h-24 w-full rounded-lg border border-white/10 bg-[#070707] px-3 py-3 text-white"
      />
      <button className="mt-3 inline-flex h-10 items-center rounded-lg bg-[#1D6DFF] px-4 text-sm font-bold text-white">
        Registrar entrega
      </button>
      {message ? <p className="mt-3 text-sm text-[#22C55E]">{message}</p> : null}
    </form>
  );
}

export function ProductAdminForm() {
  const [message, setMessage] = useState("");

  async function submit(formData: FormData) {
    const priceCents = Math.round(Number(formData.get("priceArs")) * 100);
    const payload = {
      id: `prod-${formData.get("slug")}`,
      slug: formData.get("slug"),
      name: formData.get("name"),
      shortDescription: formData.get("shortDescription"),
      description: formData.get("description"),
      category: formData.get("category"),
      platform: formData.get("platform") || undefined,
      type: formData.get("type"),
      condition: "new",
      brand: formData.get("brand"),
      model: formData.get("model"),
      priceCents,
      sku: formData.get("sku"),
      stock: Number(formData.get("stock")),
      lowStockThreshold: 2,
      publicationStatus: "draft",
      featured: false,
      offer: false,
    };
    const response = await fetch("/api/admin/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-demo-role": "admin",
      },
      body: JSON.stringify(payload),
    });
    setMessage(response.ok ? "Producto guardado como borrador." : "Error al guardar.");
  }

  return (
    <form action={submit} className="grid gap-3 rounded-lg border border-white/10 bg-[#111318] p-4 md:grid-cols-2">
      <h2 className="md:col-span-2 font-black text-white">Nuevo producto</h2>
      <input name="name" placeholder="Nombre" required className="input" />
      <input name="slug" placeholder="slug-unico" required className="input" />
      <input name="brand" placeholder="Marca" required className="input" />
      <input name="model" placeholder="Modelo" required className="input" />
      <input name="sku" placeholder="SKU" required className="input" />
      <input name="priceArs" placeholder="Precio ARS" required className="input" />
      <input name="stock" placeholder="Stock" required className="input" />
      <select name="category" className="input" defaultValue="Juegos">
        <option>Consolas</option>
        <option>Controles</option>
        <option>Juegos</option>
      </select>
      <select name="platform" className="input" defaultValue="PC">
        <option>PlayStation</option>
        <option>Xbox</option>
        <option>Nintendo</option>
        <option>PC</option>
      </select>
      <select name="type" className="input" defaultValue="physical">
        <option value="physical">Fisico</option>
        <option value="digital">Digital</option>
      </select>
      <input
        name="shortDescription"
        placeholder="Descripcion corta"
        required
        className="input md:col-span-2"
      />
      <textarea
        name="description"
        placeholder="Descripcion completa"
        required
        className="input min-h-24 py-3 md:col-span-2"
      />
      <button className="h-10 rounded-lg bg-[#1D6DFF] px-4 text-sm font-bold text-white md:col-span-2">
        Guardar borrador
      </button>
      {message ? <p className="text-sm text-[#22C55E] md:col-span-2">{message}</p> : null}
    </form>
  );
}
