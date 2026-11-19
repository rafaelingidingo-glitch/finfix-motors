/** Formatting helpers shared across the site. */

/** Format a price in Tanzanian Shillings, e.g. 32500000 -> "TZS 32,500,000" */
export function formatTZS(price: number): string {
  return `TZS ${new Intl.NumberFormat("en-US").format(price)}`;
}

/** Short price for cards, e.g. "TZS 32.5M" */
export function formatTZSShort(price: number): string {
  if (price >= 1_000_000) {
    const m = price / 1_000_000;
    const text = m % 1 === 0 ? m.toFixed(0) : m.toFixed(1);
    return `TZS ${text}M`;
  }
  return formatTZS(price);
}

/** Format mileage, e.g. 68000 -> "68,000 km" */
export function formatMileage(mileage?: number | null): string {
  if (mileage == null) return "—";
  return `${new Intl.NumberFormat("en-US").format(mileage)} km`;
}

/** Human friendly date, e.g. "12 Jan 2025" */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** URL-safe slug from vehicle info. */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/** WhatsApp number in international digits-only format for wa.me links. */
export function toWaDigits(number: string): string {
  return number.replace(/[^0-9]/g, "");
}
