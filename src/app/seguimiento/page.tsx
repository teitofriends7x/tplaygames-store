import type { Metadata } from "next";

import { OrderTrackingForm } from "./tracking-form";

export const metadata: Metadata = {
  title: "Seguimiento de pedido",
  description: "Consultá el estado de tu pedido en T.PlayGames.",
};

export default function TrackingPage() {
  return <OrderTrackingForm />;
}
