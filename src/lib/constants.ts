export const BUSINESS = {
  name: "Giftedhands Salon SA",
  shortName: "Giftedhands",
  tagline: "Home of No Pain Braiding",
  phoneDisplay: "+27 63 827 9114",
  phoneTel: "+27638279114",
  whatsappNumber: "27638279114",
  whatsappUrl: "https://wa.me/27638279114",
  instagramUrl: "https://instagram.com/giftedhandssalonsa",
  instagramHandle: "@giftedhandssalonsa",
  region: "Gauteng, South Africa",
};

/** Opening hours per weekday (0 = Sunday). Minutes from midnight, SAST. */
export const HOURS: Record<number, { open: number; close: number } | null> = {
  0: { open: 9 * 60, close: 15 * 60 },
  1: { open: 7 * 60 + 30, close: 18 * 60 },
  2: { open: 7 * 60 + 30, close: 18 * 60 },
  3: { open: 7 * 60 + 30, close: 18 * 60 },
  4: { open: 7 * 60 + 30, close: 18 * 60 },
  5: { open: 7 * 60 + 30, close: 18 * 60 },
  6: { open: 7 * 60, close: 17 * 60 },
};

export const HOURS_DISPLAY = [
  { days: "Monday – Friday", time: "07:30 – 18:00" },
  { days: "Saturday", time: "07:00 – 17:00" },
  { days: "Sunday & Public Holidays", time: "09:00 – 15:00" },
];

export const SLOT_STEP_MINUTES = 30;
export const MIN_LEAD_MINUTES = 90;
export const BOOKING_WINDOW_DAYS = 45;

export type CategoryInfo = {
  slug: string;
  label: string;
  blurb: string;
};

export const CATEGORIES: CategoryInfo[] = [
  {
    slug: "twists",
    label: "Twists",
    blurb: "Lightweight, protective and endlessly versatile — our most-loved style.",
  },
  {
    slug: "goddess",
    label: "Goddess Braids",
    blurb: "Knotless braids finished with soft flowing curls, in synthetic or human hair.",
  },
  {
    slug: "signature",
    label: "Signature Styles",
    blurb: "French Curl and Riverlocks — the statement looks Giftedhands is known for.",
  },
  {
    slug: "specials",
    label: "Specials",
    blurb: "Bra-length looks at a friendlier price, with your own hair or ours.",
  },
  {
    slug: "kids",
    label: "Kids",
    blurb: "Gentle, tear-free braiding for our littlest clients.",
  },
  {
    slug: "treatments",
    label: "Treatments & Care",
    blurb: "Scalp detox, washes and conditioning to keep your crown healthy.",
  },
  {
    slug: "lashes",
    label: "Lashes",
    blurb: "Classic, hybrid and wispy lash extensions — Centurion branch only.",
  },
];

export const categoryLabel = (slug: string) =>
  CATEGORIES.find((c) => c.slug === slug)?.label ?? slug;

export const STATUS_LABELS: Record<string, string> = {
  pending: "Awaiting confirmation",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
};
