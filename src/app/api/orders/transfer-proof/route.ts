import { NextResponse } from "next/server";

import { sendTransferProofReceivedEmail } from "@/lib/email";
import {
  getOrderForCustomer,
  submitTransferProof,
} from "@/lib/order-persistence";
import { checkRateLimit, getClientKey } from "@/lib/rate-limit";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { validateTransferProofFile } from "@/lib/transfer-proofs";

export async function POST(request: Request) {
  const limit = checkRateLimit(
    `transfer-proof:${getClientKey(request)}`,
    8,
    60_000,
  );
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Demasiados intentos. Esperá un minuto." },
      { status: 429 },
    );
  }

  const formData = await request.formData().catch(() => undefined);
  if (!formData) {
    return NextResponse.json(
      { error: "No se pudo leer el formulario." },
      { status: 400 },
    );
  }

  const file = formData.get("file");
  const orderNumber = String(formData.get("orderNumber") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  if (!(file instanceof File) || !orderNumber) {
    return NextResponse.json(
      { error: "Seleccioná un comprobante y un número de pedido." },
      { status: 400 },
    );
  }

  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = supabase ? await supabase.auth.getUser() : { data: { user: null } };

  const order = await getOrderForCustomer({
    idOrNumber: orderNumber,
    userId: user?.id,
    email: user?.email ?? email,
  });
  if (!order) {
    return NextResponse.json(
      { error: "No encontramos un pedido con esos datos." },
      { status: 404 },
    );
  }

  if (order.paymentMethod !== "transfer") {
    return NextResponse.json(
      { error: "Este pedido no fue creado con pago por transferencia." },
      { status: 400 },
    );
  }

  if (
    order.transferExpiresAt &&
    new Date(order.transferExpiresAt).getTime() < Date.now()
  ) {
    return NextResponse.json(
      {
        error:
          "El plazo para enviar el comprobante venció. Escribinos para revisar el pedido.",
      },
      { status: 400 },
    );
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const validation = validateTransferProofFile({
    fileName: file.name,
    mimeType: file.type,
    size: file.size,
    bytes,
  });
  if (!validation.ok || !validation.mimeType || !validation.extension) {
    return NextResponse.json(
      { error: validation.error ?? "Comprobante inválido." },
      { status: 400 },
    );
  }

  const result = await submitTransferProof({
    order,
    bytes,
    fileName: file.name,
    mimeType: validation.mimeType,
    extension: validation.extension,
    actorId: user?.id,
    actorRole: user ? "customer" : undefined,
    guestEmail: user?.email ?? email,
    uploadedIp: getClientKey(request),
  });
  if (result.error || !result.proof) {
    return NextResponse.json(
      { error: result.error ?? "No se pudo guardar el comprobante." },
      { status: 500 },
    );
  }

  sendTransferProofReceivedEmail(result.order).catch(() => {});

  return NextResponse.json({
    order: result.order,
    proof: {
      id: result.proof.id,
      fileName: result.proof.fileName,
      status: result.proof.status,
      createdAt: result.proof.createdAt,
    },
  });
}
