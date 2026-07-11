import { CURRENCY, LOCALE } from "@/lib/constants";

export function formatARS(cents: number): string {
  return new Intl.NumberFormat(LOCALE, {
    style: "currency",
    currency: CURRENCY,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export function clampCents(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.round(value));
}

export function calculatePercentageDiscount(
  amountCents: number,
  percentage: number,
): number {
  return clampCents(amountCents * (percentage / 100));
}

export function formatDateTimeAR(iso: string): string {
  return new Intl.DateTimeFormat(LOCALE, {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Argentina/Buenos_Aires",
  }).format(new Date(iso));
}
