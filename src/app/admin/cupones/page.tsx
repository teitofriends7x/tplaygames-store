import { demoCoupons } from "@/lib/demo-data";
import { formatARS } from "@/lib/money";

export default function AdminCouponsPage() {
  return (
    <section>
      <p className="section-eyebrow">Promociones</p>
      <h1 className="mt-2 text-3xl font-black text-white">Cupones</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {demoCoupons.map((coupon) => (
          <article key={coupon.id} className="tpg-card p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-black text-white">{coupon.code}</h2>
              <span
                className={
                  coupon.active ? "badge badge-green" : "badge badge-muted"
                }
              >
                {coupon.active ? "Activo" : "Inactivo"}
              </span>
            </div>
            <p className="mt-2 text-[#A7ACB8]">
              {coupon.type === "percentage"
                ? `${coupon.value}%`
                : formatARS(coupon.value)}{" "}
              · mínimo {formatARS(coupon.minPurchaseCents)}
            </p>
            <p className="mt-2 text-sm text-[#A7ACB8]">
              Usos: {coupon.redemptions}
              {coupon.totalLimit ? ` de ${coupon.totalLimit}` : ""}
            </p>
            {coupon.applicableCategories?.length ? (
              <p className="mt-2 text-xs text-[#A7ACB8]">
                Categorías: {coupon.applicableCategories.join(", ")}
              </p>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
