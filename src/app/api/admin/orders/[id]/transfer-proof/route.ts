import { NextResponse } from "next/server";

import { AuthorizationError, requireActorRole } from "@/lib/authz";
import {
  sendTransferApprovedEmail,
  sendTransferRejectedEmail,
} from "@/lib/email";
import { reviewTransferProof } from "@/lib/order-persistence";
import { transferProofReviewSchema } from "@/lib/validation";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const actor = await requireActorRole(request, ["admin", "operator"]);
    const { id } = await context.params;
    const payload = await request.json().catch(() => undefined);
    const parsed = transferProofReviewSchema.safeParse(payload);
    if (!parsed.success) {
      return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
    }

    const result = await reviewTransferProof({
      orderId: id,
      proofId: parsed.data.proofId,
      action: parsed.data.action,
      reason: parsed.data.reason,
      actorId: actor.userId,
      actorRole: actor.role,
    });
    if (!result.order || !result.proof) {
      return NextResponse.json(
        { error: result.error ?? "No se pudo revisar el comprobante." },
        { status: 400 },
      );
    }

    if (parsed.data.action === "approve") {
      sendTransferApprovedEmail(result.order).catch(() => {});
    } else {
      sendTransferRejectedEmail(result.order, parsed.data.reason).catch(
        () => {},
      );
    }

    return NextResponse.json({ order: result.order, proof: result.proof });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    return NextResponse.json({ error: "Error interno." }, { status: 500 });
  }
}
