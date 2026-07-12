"use client";

import {
  Heart,
  Link2,
  Loader2,
  LogOut,
  PackageCheck,
  Pencil,
  Save,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { EmptyState } from "@/components/empty-state";
import { useStoreAuth } from "@/components/clerk-store-auth";
import { PAYMENT_STATUS_LABELS, STATUS_LABELS } from "@/lib/constants";
import { formatARS, formatDateTimeAR } from "@/lib/money";
import type { AccountProfile, Order } from "@/lib/types";

type AccountPayload = {
  profile?: AccountProfile;
  orders?: Order[];
};

export function AccountDashboard() {
  const { user, loading: authLoading, signOut } = useStoreAuth();
  const router = useRouter();
  const [payload, setPayload] = useState<AccountPayload | null>(null);
  const [guestCount, setGuestCount] = useState(0);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!user) return;

    let active = true;
    Promise.all([
      fetch("/api/account").then((response) => response.json()),
      fetch("/api/account/orders").then((response) => response.json()),
      fetch("/api/account/link-guest-orders").then((response) =>
        response.json(),
      ),
    ])
      .then(([profileResult, ordersResult, linkResult]) => {
        if (!active) return;
        setPayload({
          profile: profileResult.profile,
          orders: ordersResult.orders ?? [],
        });
        setGuestCount(linkResult.count ?? 0);
      })
      .catch(() => {
        if (active) setError("No pudimos cargar tu cuenta.");
      });

    return () => {
      active = false;
    };
  }, [user]);

  if (authLoading || (user && !payload && !error)) {
    return (
      <section className="tpg-container py-10">
        <div className="tpg-card flex items-center gap-3 p-5 text-[#A7ACB8]">
          <Loader2 className="h-5 w-5 animate-spin" />
          Cargando tu cuenta...
        </div>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="tpg-container py-10">
        <p className="section-eyebrow">Cliente</p>
        <h1 className="mt-2 text-3xl font-black text-white">Mi cuenta</h1>
        <div className="mt-6">
          <EmptyState
            icon={ShieldCheck}
            title="Iniciá sesión para ver tu cuenta"
            body="Tu historial de pedidos, datos de envío y comprobantes quedan asociados a tu email verificado."
            href="/login"
            action="Ingresar"
          />
        </div>
      </section>
    );
  }

  async function saveProfile(formData: FormData) {
    setMessage("");
    setError("");
    const response = await fetch("/api/account", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: formData.get("firstName"),
        lastName: formData.get("lastName"),
        phone: formData.get("phone"),
        street: formData.get("street"),
        city: formData.get("city"),
        province: formData.get("province"),
        postalCode: formData.get("postalCode"),
        addressNotes: formData.get("addressNotes") || undefined,
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error ?? "No se pudo guardar el perfil.");
      return;
    }

    setPayload((current) => ({ ...(current ?? {}), profile: data.profile }));
    setMessage("Perfil actualizado.");
    setEditing(false);
  }

  async function handleSignOut() {
    await signOut();
    router.replace("/login");
    router.refresh();
  }

  async function linkGuestOrders() {
    setMessage("");
    setError("");
    const response = await fetch("/api/account/link-guest-orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirm: true }),
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error ?? "No se pudieron vincular los pedidos.");
      return;
    }

    setMessage(`${data.linked} pedido(s) vinculados.`);
    const ordersResult = await fetch("/api/account/orders").then((item) =>
      item.json(),
    );
    setPayload((current) => ({
      ...(current ?? {}),
      orders: ordersResult.orders ?? current?.orders ?? [],
    }));
    setGuestCount(0);
  }

  const profile = payload?.profile;
  const orders = payload?.orders ?? [];

  return (
    <section className="tpg-container py-10">
      <p className="section-eyebrow">Cliente</p>
      <h1 className="mt-2 text-3xl font-black text-white">
        Hola{profile?.firstName || user.firstName ? `, ${profile?.firstName ?? user.firstName}` : ""}
      </h1>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-[#A7ACB8]">
        Revisá tus pedidos, favoritos y datos guardados desde un solo lugar.
      </p>

      {message ? (
        <div className="mt-5 rounded-xl border border-[#22C55E]/30 bg-[#22C55E]/10 p-4 text-sm text-[#86EFAC]">
          {message}
        </div>
      ) : null}
      {error ? (
        <div className="mt-5 rounded-xl border border-[#EF4444]/30 bg-[#EF4444]/10 p-4 text-sm text-[#FCA5A5]">
          {error}
        </div>
      ) : null}

      <div className="mt-8 grid gap-6 lg:grid-cols-[360px_1fr]">
        <aside className="space-y-4">
          <div className="tpg-card p-5">
            <h2 className="font-black text-white">Datos de cuenta</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div><dt className="text-[#737986]">Email</dt><dd className="mt-1 break-all font-semibold text-white">{user.email}</dd></div>
              <div><dt className="text-[#737986]">Teléfono</dt><dd className="mt-1 text-[#D7DAE2]">{profile?.phone || "Sin completar"}</dd></div>
              <div><dt className="text-[#737986]">Dirección</dt><dd className="mt-1 text-[#D7DAE2]">{profile?.street ? `${profile.street}, ${profile.city ?? ""}` : "Sin completar"}</dd></div>
            </dl>
            <button type="button" onClick={() => setEditing((value) => !value)} className="btn btn-secondary mt-4 w-full">
              <Pencil className="h-4 w-4" />
              {editing ? "Cerrar edición" : "Editar perfil"}
            </button>
          </div>

          {editing ? (
          <form action={saveProfile} className="tpg-card grid gap-3 p-5">
            <h2 className="font-black text-white">Editar perfil</h2>
            <input
              name="firstName"
              defaultValue={profile?.firstName}
              placeholder="Nombre"
              className="input"
            />
            <input
              name="lastName"
              defaultValue={profile?.lastName}
              placeholder="Apellido"
              className="input"
            />
            <input
              name="phone"
              defaultValue={profile?.phone}
              placeholder="Teléfono"
              className="input"
            />
            <input
              name="street"
              defaultValue={profile?.street}
              placeholder="Dirección"
              className="input"
            />
            <input
              name="city"
              defaultValue={profile?.city}
              placeholder="Ciudad"
              className="input"
            />
            <input
              name="province"
              defaultValue={profile?.province}
              placeholder="Provincia"
              className="input"
            />
            <input
              name="postalCode"
              defaultValue={profile?.postalCode}
              placeholder="Código postal"
              className="input"
            />
            <textarea
              name="addressNotes"
              defaultValue={profile?.addressNotes}
              placeholder="Notas de entrega"
              className="input min-h-20 py-3"
            />
            <button className="btn btn-primary">
              <Save className="h-4 w-4" />
              Guardar datos
            </button>
          </form>
          ) : null}

          {guestCount > 0 ? (
            <div className="tpg-card p-5">
              <h2 className="font-black text-white">Compras anteriores</h2>
              <p className="mt-2 text-sm leading-6 text-[#A7ACB8]">
                Encontramos {guestCount} pedido(s) realizados con tu email.
              </p>
              <button
                onClick={linkGuestOrders}
                className="btn btn-secondary mt-3"
              >
                <Link2 className="h-4 w-4" />
                Vincular a mi cuenta
              </button>
            </div>
          ) : null}

          <Link
            href="/favoritos"
            className="tpg-card block p-5 hover:border-[#1D6DFF]"
          >
            <Heart className="h-5 w-5 text-[#8FB7FF]" />
            <h2 className="mt-3 font-black text-white">Favoritos</h2>
            <p className="mt-1 text-sm text-[#A7ACB8]">
              Guardá productos y retomá tu selección desde cualquier sesión.
            </p>
          </Link>

          <Link href="/seguimiento" className="btn btn-secondary w-full">
            Seguir un pedido puntual
          </Link>
          {["admin", "operator"].includes(user.role) ? (
            <Link href="/admin" className="btn btn-secondary w-full">
              <ShieldCheck className="h-4 w-4" />
              Panel administrador
            </Link>
          ) : null}
          <button type="button" onClick={handleSignOut} className="btn btn-secondary w-full">
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </button>
        </aside>

        <div>
          <h2 className="text-xl font-black text-white">Pedidos recientes</h2>
          {!orders.length ? (
            <div className="mt-4">
              <EmptyState
                icon={PackageCheck}
                title="Todavía no realizaste ninguna compra."
                body="Cuando completes una compra con tu cuenta, va a aparecer en esta sección."
                href="/catalogo"
                action="Ver productos"
              />
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {orders.map((order) => (
                <Link
                  key={order.id}
                  href={`/mis-pedidos/${order.id}`}
                  className="tpg-card grid gap-3 p-4 text-sm hover:border-[#1D6DFF] md:grid-cols-[1.2fr_1fr_1fr_1fr_auto]"
                >
                  <span className="font-black text-white">
                    {order.orderNumber}
                  </span>
                  <span className="text-[#A7ACB8]">
                    {STATUS_LABELS[order.status]}
                  </span>
                  <span className="text-[#A7ACB8]">
                    {PAYMENT_STATUS_LABELS[order.paymentStatus]}
                  </span>
                  <span className="text-[#A7ACB8]">
                    {formatDateTimeAR(order.createdAt)}
                  </span>
                  <span className="font-black text-white">
                    {formatARS(order.totals.totalCents)}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
