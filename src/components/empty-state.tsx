import Link from "next/link";
import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  body,
  href,
  action,
}: {
  icon?: LucideIcon;
  title: string;
  body: string;
  href?: string;
  action?: string;
}) {
  return (
    <div className="tpg-card mx-auto max-w-2xl p-8 text-center">
      {Icon ? (
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-xl border border-[#1D6DFF]/30 bg-[#1D6DFF]/12 text-[#8FB7FF]">
          <Icon className="h-7 w-7" />
        </div>
      ) : null}
      <h2 className="mt-5 text-2xl font-black text-white">{title}</h2>
      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#A7ACB8]">
        {body}
      </p>
      {href && action ? (
        <Link href={href} className="btn btn-primary mt-6">
          {action}
        </Link>
      ) : null}
    </div>
  );
}
