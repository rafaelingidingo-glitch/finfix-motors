import { formatTZS, toWaDigits } from "@/lib/format";

/**
 * WhatsApp link helpers.
 * Business number: +255 786 068 760 (managed via site settings).
 */

export function buildWhatsAppUrl(number: string, message: string): string {
  return `https://wa.me/${toWaDigits(number)}?text=${encodeURIComponent(message)}`;
}

export const GENERAL_INQUIRY_MESSAGE =
  "Hello Elly Magari! I would like to inquire about your vehicles and services.";

export function generalWhatsAppUrl(number: string): string {
  return buildWhatsAppUrl(number, GENERAL_INQUIRY_MESSAGE);
}

/** Message for a specific vehicle inquiry — includes name, price and link. */
export function vehicleInquiryMessage(opts: {
  make: string;
  model: string;
  year: number;
  price: number;
  status?: string;
  url?: string;
}): string {
  const lines = [
    "Hello Elly Magari! I am interested in this vehicle:",
    "",
    `*${opts.year} ${opts.make} ${opts.model}*`,
    `Price: ${formatTZS(opts.price)}`,
  ];
  if (opts.status === "SOLD") {
    lines.push("", "I see it is marked as sold — do you have a similar vehicle available?");
  } else {
    lines.push("", "Is it still available?");
  }
  if (opts.url) lines.push("", `View it here: ${opts.url}`);
  return lines.join("\n");
}

export function vehicleWhatsAppUrl(
  number: string,
  opts: {
    make: string;
    model: string;
    year: number;
    price: number;
    status?: string;
    slug: string;
    origin?: string;
  }
): string {
  const base = opts.origin ?? "";
  const url = `${base}/vehicles/${opts.slug}`;
  return buildWhatsAppUrl(number, vehicleInquiryMessage(opts));
}
