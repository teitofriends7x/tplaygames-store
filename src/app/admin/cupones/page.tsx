import { demoCoupons } from "@/lib/demo-data";
import { formatARS } from "@/lib/money";

export default function AdminCouponsPage() {
  return (
    <section>
      <h1 className="text-3xl font-black text-white">Cupones</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {demoCoupons.map((coupon) => (
          <article
            key={coupon.id}
            className="rounded-lg border border-white/10 bg-[#111318] p-5"
          >
            <h2 className="text-xl font-black text-white">{coupon.code}</h2>
            <p className="mt-2 text-[#A7ACB8]">
              {coupon.type === "percentage"
                ? `${coupon.value}%`
                : formatARS(coupon.value)}{" "}
              · minimo {formatARS(coupon.minPurchaseCents)}
            </p>
            <p className="mt-2 text-sm text-[#A7ACB8]">
              Activo: {coupon.active ? "si" : "no"} · Usos: {coupon.redemptions}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
