"use client";

import { MessageCircle } from "lucide-react";
import { usePathname } from "next/navigation";

import { whatsappGeneralUrl } from "@/lib/whatsapp";

export function WhatsappFloat() {
  const pathname = usePathname();
  if (pathname === "/login" || pathname.startsWith("/login/")) return null;
  if (pathname === "/registro" || pathname.startsWith("/registro/")) return null;

  return (
    <a
      href={whatsappGeneralUrl()}
      className="fixed bottom-4 right-4 z-50 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#22C55E] text-white shadow-xl transition hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#22C55E]"
      aria-label="Consultar por WhatsApp"
      title="WhatsApp"
    >
      <MessageCircle className="h-6 w-6" />
    </a>
  );
}
