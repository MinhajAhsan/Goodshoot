// Single source of truth for brand + tunable constants.
// Rename the brand in ONE place here.

export const brand = {
  name: "GoodShoot",
  tagline: "One team. Every important moment, captured.",
  description:
    "Book vetted photographers and videographers for weddings, events, and brand shoots — get an instant quote in minutes.",
  // Support / contact shown in the footer.
  email: "hello@goodshoot.example",
} as const;

// Currency display (v1 is PKR-only; schema is multi-currency ready).
export const currency = {
  code: "PKR",
  symbol: "Rs",
} as const;

export function formatMoney(amount: number, currencyCode: string = currency.code): string {
  const symbol = currencyCode === "PKR" ? "Rs" : currencyCode + " ";
  return `${symbol} ${Math.round(amount).toLocaleString("en-PK")}`;
}

// Portfolio clips for the hero PhotoFrameGallery.
// Swap these for your own footage later — just replace the `src` values.
export const portfolioClips: { src: string; poster?: string; label: string }[] = [
  { src: "", label: "Weddings" },
  { src: "", label: "Corporate" },
  { src: "", label: "Music Videos" },
  { src: "", label: "Real Estate" },
  { src: "", label: "Portraits" },
];
