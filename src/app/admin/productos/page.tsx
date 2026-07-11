import { ProductAdminForm } from "@/components/admin-actions";
import { formatARS } from "@/lib/money";
import { listProducts } from "@/lib/store";

export default function AdminProductsPage() {
  const products = listProducts();

  return (
    <section>
      <h1 className="text-3xl font-black text-white">Productos</h1>
      <div className="mt-6">
        <ProductAdminForm />
      </div>
      <div className="mt-6 overflow-hidden rounded-lg border border-white/10">
        {products.map((product) => (
          <div
            key={product.id}
            className="grid gap-3 border-b border-white/10 bg-[#111318] p-4 text-sm last:border-0 md:grid-cols-6"
          >
            <span className="font-black text-white md:col-span-2">
              {product.name}
            </span>
            <span className="text-[#A7ACB8]">{product.category}</span>
            <span className="text-[#A7ACB8]">{product.sku}</span>
            <span className="text-[#A7ACB8]">Stock {product.stock}</span>
            <span className="font-black text-white">
              {formatARS(product.promoPriceCents ?? product.priceCents)}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
