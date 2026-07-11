import Image from "next/image";

import { ProductAdminForm } from "@/components/admin-actions";
import { PRODUCT_TYPE_LABELS } from "@/lib/constants";
import { formatARS } from "@/lib/money";
import { listProducts } from "@/lib/store";

export default function AdminProductsPage() {
  const products = listProducts();

  return (
    <section>
      <p className="section-eyebrow">Catálogo</p>
      <h1 className="mt-2 text-3xl font-black text-white">Productos</h1>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-[#A7ACB8]">
        Los productos demo permiten validar compra y administración. Antes de
        producir, reemplazá imágenes, descripción, stock y condiciones reales.
      </p>
      <div className="mt-6">
        <ProductAdminForm />
      </div>
      <div className="mt-6 max-w-full overflow-x-auto rounded-2xl border border-white/10">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Categoría</th>
              <th>SKU</th>
              <th>Tipo</th>
              <th>Stock</th>
              <th>Precio</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-12 overflow-hidden rounded-lg border border-white/10 bg-[#070707]">
                      <Image
                        src={product.mainImage}
                        alt={product.images[0]?.alt ?? product.name}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-black text-white">{product.name}</p>
                      <p className="text-xs text-[#A7ACB8]">
                        {product.demo ? "Demo" : product.publicationStatus}
                      </p>
                    </div>
                  </div>
                </td>
                <td>{product.category}</td>
                <td>{product.sku}</td>
                <td>{PRODUCT_TYPE_LABELS[product.type]}</td>
                <td>
                  <span
                    className={
                      product.stock <= 0
                        ? "badge badge-red"
                        : product.stock <= product.lowStockThreshold
                          ? "badge badge-blue"
                          : "badge badge-green"
                    }
                  >
                    {product.stock}
                  </span>
                </td>
                <td className="font-black text-white">
                  {formatARS(product.promoPriceCents ?? product.priceCents)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
