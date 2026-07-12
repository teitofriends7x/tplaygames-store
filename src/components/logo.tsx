import Link from "next/link";

import { STORE_NAME } from "@/lib/constants";

export function Logo() {
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1D6DFF]"
      aria-label="Ir al inicio de T.PlayGames"
    >
      <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#1D6DFF] text-sm font-black text-white shadow-[0_0_22px_rgba(29,109,255,0.38)]">
        T
      </span>
      <span className="hidden text-lg font-black tracking-normal text-white min-[350px]:inline">
        {STORE_NAME}
      </span>
    </Link>
  );
}
