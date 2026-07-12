import { NextResponse } from "next/server";

import { AuthorizationError, requireActorRole } from "@/lib/authz";
import {
  createTransferProofSignedUrl,
  getOrderDetailsForAdmin,
} from "@/lib/order-persistence";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await requireActorRole(request, ["admin", "operator"]);
    const { id } = await context.params;
    const proofId = new URL(request.url).searchParams.get("proofId");
    if (!proofId) {
      return NextResponse.json(
        { error: "Falta el comprobante solicitado." },
        { status: 400 },
      );
    }

    const order = await getOrderDetailsForAdmin(id);
    const proof = order?.transferProofs?.find((item) => item.id === proofId);
    if (!proof) {
      return NextResponse.json(
        { error: "Comprobante no encontrado." },
        { status: 404 },
      );
    }

    const signedUrl = await createTransferProofSignedUrl(proof);
    if (!signedUrl) {
      return NextResponse.json(
        {
          error:
            "El comprobante está disponible solo en el entorno de desarrollo local.",
        },
        { status: 409 },
      );
    }

    return NextResponse.redirect(signedUrl);
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    return NextResponse.json({ error: "Error interno." }, { status: 500 });
  }
}
