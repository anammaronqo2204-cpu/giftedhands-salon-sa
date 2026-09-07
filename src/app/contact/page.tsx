import type { Metadata } from "next";
import Link from "next/link";
import { Clock, Home, Instagram, MapPin, Phone, WhatsApp } from "@/components/icons";
import { Badge, PageHero } from "@/components/ui";
import { BUSINESS, HOURS_DISPLAY } from "@/lib/constants";
import { getLocations } from "@/lib/data";
import { formatRands } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Locations & Contact",
  description:
    "Visit Giftedhands Salon in Centurion (24 Kersieboom Crescent, Zwartkop) or Fourways (173 Main Road, Rietfontein), or book a house call anywhere in Pretoria & Johannesburg.",
};

const FAQ = [
  {
    q: "Does 'no pain braiding' really mean no pain?",
    a: "Yes. We use a knotless, gentle-tension technique and check in with you throughout. You should never feel pulling, and you won't wake up with a headache or bumps along your hairline.",
  },
  {
    q: "How should I prepare my hair?",
    a: "Arrive with clean, detangled and blow-dried (stretched) hair with no heavy oils or gels. If you can't, add our Wash, Condition & Blow Dry service to your booking.",
  },
  {
    q: "Is hair included in the price?",
    a: "On most styles, yes — we supply quality pre-stretched hair and curls in your chosen colour. Services marked 'with your hair' are priced for clients who bring their own.",
  },
  {
    q: "How do house calls work?",
    a: "Choose 'House Call' when booking and enter your address. A R200 call-out fee is added to the service price. Please have a comfortable chair and good lighting ready.",
  },
  {
    q: "How long will my style last?",
    a: "With a satin bonnet at night and light scalp oiling, most installs look fresh for 6–8 weeks. A scalp detox before your next install keeps your hair healthy.",
  },
  {
    q: "Can I reschedule?",
    a: `Of course — WhatsApp us on ${BUSINESS.phoneDisplay} with your booking reference at least 24 hours before your appointment.`,
  },
];

export default async function ContactPage() {
  const locations = await getLocations();
  const branches = locations.filter((l) => !l.isHouseCall);
  const houseCall = locations.find((l) => l.isHouseCall);

  return (
    <>
      <PageHero
        eyebrow="Locations & contact"
        title={
          <>
            Two branches. <span className="gold-text">One promise.</span>
          </>
        }
        description="Find us in Centurion and Fourways, or book a house call anywhere in Pretoria and Johannesburg."
      >
        <div className="flex flex-wrap gap-3">
          <a href={BUSINESS.whatsappUrl} target="_blank" rel="noreferrer" className="btn btn-whatsapp">
            <WhatsApp className="h-5 w-5" /> WhatsApp {BUSINESS.phoneDisplay}
          </a>
          <a href={`tel:${BUSINESS.phoneTel}`} className="btn btn-outline-light">
            <Phone className="h-4 w-4" /> Call us
          </a>
          <a href={BUSINESS.instagramUrl} target="_blank" rel="noreferrer" className="btn btn-outline-light">
            <Instagram className="h-4 w-4" /> Instagram
          </a>
        </div>
      </PageHero>

      <div className="container-x py-16">
        <div className="grid gap-8 lg:grid-cols-2">
          {branches.map((loc) => (
            <div key={loc.id} className="card overflow-hidden">
              <div className="aspect-[16/9] bg-sand">
                <iframe
                  title={`Map of Giftedhands ${loc.name}`}
                  src={`https://www.google.com/maps?q=${encodeURIComponent(`${loc.addressLine.split(" — ")[0]}, ${loc.area}`)}&output=embed`}
                  className="h-full w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
              <div className="p-7">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-display text-3xl font-semibold">{loc.name}</h2>
                  <Badge tone="green">Walk-ins by appointment</Badge>
                </div>
                <p className="mt-3 flex gap-2 text-sm text-cocoa">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold-dark" />
                  <span>
                    {loc.addressLine}
                    <br />
                    {loc.area}
                  </span>
                </p>
                <p className="mt-4 text-sm leading-relaxed text-mocha">{loc.description}</p>
                <div className="mt-6 flex flex-wrap gap-2">
                  <Link href={`/book?location=${loc.slug}`} className="btn btn-dark px-5 py-2.5 text-xs">
                    Book at {loc.name}
                  </Link>
                  {loc.mapsUrl && (
                    <a href={loc.mapsUrl} target="_blank" rel="noreferrer" className="btn btn-outline-dark px-5 py-2.5 text-xs">
                      Open in Google Maps
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-12">
          {houseCall && (
            <div className="grain relative overflow-hidden rounded-[2rem] bg-espresso p-8 text-cream lg:col-span-7">
              <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-gold/20 blur-3xl" />
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gold text-espresso">
                <Home className="h-6 w-6" />
              </span>
              <h2 className="mt-5 font-display text-3xl font-semibold">{houseCall.name}s</h2>
              <p className="mt-1 text-sm text-gold">{houseCall.addressLine}</p>
              <p className="mt-4 max-w-lg text-sm leading-relaxed text-cream/75">{houseCall.description}</p>
              <ul className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
                <li className="rounded-2xl bg-cream/5 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-cream/50">Call-out fee</p>
                  <p className="mt-1 font-display text-2xl font-semibold text-gold">{formatRands(houseCall.callOutFeeRands)}</p>
                </li>
                <li className="rounded-2xl bg-cream/5 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-cream/50">Coverage</p>
                  <p className="mt-1 font-semibold">Pretoria &amp; Johannesburg</p>
                </li>
              </ul>
              <Link href="/book?location=house-call" className="btn btn-gold mt-7">
                Book a house call
              </Link>
            </div>
          )}

          <div className="card p-8 lg:col-span-5">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gold/15 text-gold-dark">
              <Clock className="h-6 w-6" />
            </span>
            <h2 className="mt-5 font-display text-2xl font-semibold">Opening hours</h2>
            <ul className="mt-5 space-y-3 text-sm">
              {HOURS_DISPLAY.map((h) => (
                <li key={h.days} className="flex justify-between border-b border-linen pb-3">
                  <span className="text-cocoa">{h.days}</span>
                  <span className="font-semibold">{h.time}</span>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-xs leading-relaxed text-mocha">
              Long installs need an early start — the latest start time for each style is shown automatically when you book.
            </p>
          </div>
        </div>

        <section className="mt-20">
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow justify-center">Good to know</p>
            <h2 className="mt-4 font-display text-3xl font-semibold sm:text-4xl">Frequently asked questions</h2>
          </div>
          <div className="mx-auto mt-10 max-w-3xl divide-y divide-linen rounded-[2rem] border border-linen bg-white">
            {FAQ.map((item) => (
              <details key={item.q} className="group px-6 py-5 open:bg-sand/40 sm:px-8">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-espresso [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-linen text-lg leading-none transition group-open:rotate-45 group-open:border-gold group-open:bg-gold group-open:text-espresso">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-mocha">{item.a}</p>
              </details>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
