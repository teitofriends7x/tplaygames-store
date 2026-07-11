import { NextResponse } from "next/server";

import { AuthorizationError, requireRole } from "@/lib/authz";
import { upsertProduct } from "@/lib/store";
import { productMutationSchema } from "@/lib/validation";
import type { Product } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const role = await requireRole(request, ["admin"]);
    const payload = await request.json().catch(() => undefined);
    const parsed = productMutationSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos invalidos.", issues: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const now = new Date().toISOString();
    const product: Product = {
      ...parsed.data,
      images: [
        {
          id: `${parsed.data.id}-image`,
          url: "/products/product-placeholder.svg",
          alt: `Imagen pendiente de ${parsed.data.name}`,
          position: 1,
          isPrimary: true,
        },
      ],
      mainImage: "/products/product-placeholder.svg",
      features: ["Cargado desde panel", "Pendiente de imagen real"],
      warranty: "Pendiente de configurar.",
      deliveryTerms: "Pendiente de configurar.",
      seoTitle: `${parsed.data.name} | T.PlayGames`,
      seoDescription: parsed.data.shortDescription,
      variants: [],
      transferEnabled: parsed.data.promoPriceCents !== undefined,
      createdAt: now,
      updatedAt: now,
      demo: false,
    };

    return NextResponse.json({ product: upsertProduct(product, role) });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    return NextResponse.json({ error: "Error interno." }, { status: 500 });
  }
}
