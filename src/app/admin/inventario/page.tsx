import Image from "next/image";
import Link from "next/link";

import { PRODUCT_TYPE_LABELS } from "@/lib/constants";
import { listProducts } from "@/lib/store";

export default function AdminInventoryPage() {
  const products = listProducts();
  const lowStock = products.filter(
    (product) =>
      product.stock > 0 && product.stock <= product.lowStockThreshold,
  );
  const outOfStock = products.filter((product) => product.stock <= 0);

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="section-eyebrow">Operación</p>
          <h1 className="mt-2 text-3xl font-black text-white">Inventario</h1>
        </div>
        <Link href="/admin/productos" className="btn btn-secondary">
          Gestionar productos
        </Link>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Metric
          label="Productos seed/publicados"
          value={String(products.length)}
        />
        <Metric
          label="Stock bajo"
          value={String(lowStock.length)}
          tone="warn"
        />
        <Metric
          label="Sin stock"
          value={String(outOfStock.length)}
          tone="danger"
        />
      </div>
      <div className="mt-6 max-w-full overflow-x-auto rounded-2xl border border-white/10">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Producto</th>
              <th>SKU</th>
              <th>Tipo</th>
              <th>Stock</th>
              <th>Umbral</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const state =
                product.stock <= 0
                  ? "Sin stock"
                  : product.stock <= product.lowStockThreshold
                    ? "Stock bajo"
                    : "Disponible";

              return (
                <tr key={product.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-12 overflow-hidden rounded-lg border border-white/10 bg-[#070707]">
                        <Image
                          src={product.mainImage}
                          alt={product.images[0]?.alt ?? product.name}
                          fill
                          unoptimized
                          sizes="48px"
                          className="object-contain p-1"
                        />
                      </div>
                      <div>
                        <p className="font-black text-white">{product.name}</p>
                        <p className="text-xs text-[#A7ACB8]">
                          {product.category}
                          {product.platform ? ` · ${product.platform}` : ""}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td>{product.sku}</td>
                  <td>{PRODUCT_TYPE_LABELS[product.type]}</td>
                  <td>{product.stock}</td>
                  <td>{product.lowStockThreshold}</td>
                  <td>
                    <span
                      className={
                        state === "Disponible"
                          ? "badge badge-green"
                          : state === "Stock bajo"
                            ? "badge badge-blue"
                            : "badge badge-red"
                      }
                    >
                      {state}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Metric({
  label,
  value,
  tone = "normal",
}: {
  label: string;
  value: string;
  tone?: "normal" | "warn" | "danger";
}) {
  return (
    <div className="tpg-card p-5">
      <p className="text-sm text-[#A7ACB8]">{label}</p>
      <p
        className={
          tone === "danger"
            ? "mt-2 text-3xl font-black text-[#FCA5A5]"
            : tone === "warn"
              ? "mt-2 text-3xl font-black text-[#FBBF24]"
              : "mt-2 text-3xl font-black text-white"
        }
      >
        {value}
      </p>
    </div>
  );
}
