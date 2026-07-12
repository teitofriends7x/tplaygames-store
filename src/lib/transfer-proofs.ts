import { randomBytes } from "crypto";
import path from "node:path";

export const TRANSFER_PROOF_MAX_BYTES = 10 * 1024 * 1024;
export const TRANSFER_PROOF_BUCKET =
  process.env.SUPABASE_TRANSFER_PROOFS_BUCKET || "transfer-proofs";

const allowedExtensions = new Map([
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".png", "image/png"],
  [".pdf", "application/pdf"],
]);

export type TransferProofValidation = {
  ok: boolean;
  mimeType?: "image/jpeg" | "image/png" | "application/pdf";
  extension?: ".jpg" | ".jpeg" | ".png" | ".pdf";
  error?: string;
};

export function validateTransferProofFile(input: {
  fileName: string;
  mimeType: string;
  size: number;
  bytes: Uint8Array;
}): TransferProofValidation {
  if (input.size <= 0) {
    return { ok: false, error: "El archivo está vacío." };
  }

  if (input.size > TRANSFER_PROOF_MAX_BYTES) {
    return { ok: false, error: "El comprobante no puede superar 10 MB." };
  }

  const extension = path
    .extname(input.fileName)
    .toLowerCase() as TransferProofValidation["extension"];
  const expectedMime = extension ? allowedExtensions.get(extension) : undefined;

  if (!extension || !expectedMime) {
    return {
      ok: false,
      error: "Formato no permitido. Subí JPG, PNG o PDF.",
    };
  }

  const detectedMime = detectMimeFromSignature(input.bytes);
  if (!detectedMime) {
    return {
      ok: false,
      error: "No se pudo validar el tipo real del archivo.",
    };
  }

  if (detectedMime !== expectedMime || input.mimeType !== expectedMime) {
    return {
      ok: false,
      error: "La extensión y el tipo del archivo no coinciden.",
    };
  }

  return { ok: true, mimeType: detectedMime, extension };
}

export function buildTransferProofStoragePath(input: {
  orderId: string;
  fileName: string;
  extension: string;
}) {
  const safeOrderId = input.orderId.replace(/[^a-zA-Z0-9-]/g, "");
  const safeBaseName =
    path
      .basename(input.fileName, path.extname(input.fileName))
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9-_]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 72) || "comprobante";
  const suffix = randomBytes(6).toString("hex");

  return `${safeOrderId}/${Date.now()}-${suffix}-${safeBaseName}${input.extension}`;
}

export function detectMimeFromSignature(
  bytes: Uint8Array,
): "image/jpeg" | "image/png" | "application/pdf" | undefined {
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }

  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return "image/png";
  }

  if (
    bytes[0] === 0x25 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x44 &&
    bytes[3] === 0x46
  ) {
    return "application/pdf";
  }

  return undefined;
}
