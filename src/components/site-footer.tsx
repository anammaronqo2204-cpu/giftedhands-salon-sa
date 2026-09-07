import Link from "next/link";
import { BUSINESS, HOURS_DISPLAY } from "@/lib/constants";
import { Instagram, Logo, MapPin, Phone, WhatsApp } from "./icons";

const LINKS = [
  { href: "/services", label: "Services & Prices" },
  { href: "/book", label: "Book online" },
  { href: "/gallery", label: "Gallery" },
  { href: "/reviews", label: "Client reviews" },
  { href: "/contact", label: "Locations & hours" },
];

export function SiteFooter() {
  return (
    <footer className="grain relative overflow-hidden bg-espresso text-cream">
      <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-gold/10 blur-3xl" />
      <div className="container-x relative py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Link href="/" className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-gold/15 text-gold">
                <Logo className="h-9 w-9" />
              </span>
              <span className="flex flex-col leading-none">
                <span className="font-display text-2xl font-semibold">Giftedhands</span>
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold">
                  Salon SA
                </span>
              </span>
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-cream/70">
              {BUSINESS.tagline}. Knotless braids, goddess braids, twists, treatments and
              lashes — installed gently, finished beautifully. Centurion, Fourways and at
              your door.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <a
                href={BUSINESS.instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="grid h-10 w-10 place-items-center rounded-full border border-cream/15 text-cream/80 transition hover:border-gold hover:text-gold"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href={BUSINESS.whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="grid h-10 w-10 place-items-center rounded-full border border-cream/15 text-cream/80 transition hover:border-gold hover:text-gold"
                aria-label="WhatsApp"
              >
                <WhatsApp className="h-5 w-5" />
              </a>
              <a
                href={`tel:${BUSINESS.phoneTel}`}
                className="grid h-10 w-10 place-items-center rounded-full border border-cream/15 text-cream/80 transition hover:border-gold hover:text-gold"
                aria-label="Call us"
              >
                <Phone className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div className="lg:col-span-2">
            <h3 className="text-xs font-bold uppercase tracking-[0.22em] text-gold">Explore</h3>
            <ul className="mt-5 space-y-3 text-sm">
              {LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-cream/75 transition hover:text-cream">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h3 className="text-xs font-bold uppercase tracking-[0.22em] text-gold">Find us</h3>
            <ul className="mt-5 space-y-4 text-sm text-cream/75">
              <li className="flex gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                <span>
                  <span className="font-semibold text-cream">Centurion</span>
                  <br />
                  24 Kersieboom Crescent, Zwartkop
                </span>
              </li>
              <li className="flex gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                <span>
                  <span className="font-semibold text-cream">Fourways</span>
                  <br />
                  173 Main Road, Rietfontein
                  <br />
                  <span className="text-cream/55">inside Belleza Beauty House</span>
                </span>
              </li>
              <li className="flex gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                <span>
                  <span className="font-semibold text-cream">House calls</span>
                  <br />
                  Pretoria & Johannesburg · R200 call-out
                </span>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h3 className="text-xs font-bold uppercase tracking-[0.22em] text-gold">Hours</h3>
            <ul className="mt-5 space-y-3 text-sm text-cream/75">
              {HOURS_DISPLAY.map((h) => (
                <li key={h.days} className="flex justify-between gap-4 border-b border-cream/10 pb-2">
                  <span>{h.days}</span>
                  <span className="font-semibold text-cream">{h.time}</span>
                </li>
              ))}
            </ul>
            <a
              href={BUSINESS.whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-gold hover:text-gold-light"
            >
              <WhatsApp className="h-4 w-4" /> {BUSINESS.phoneDisplay}
            </a>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-cream/10 pt-6 text-xs text-cream/50 sm:flex-row sm:items-center">
          <p>
            © {new Date().getFullYear()} {BUSINESS.name}. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            <a
              href={BUSINESS.instagramUrl}
              target="_blank"
              rel="noreferrer"
              className="transition hover:text-cream"
            >
              {BUSINESS.instagramHandle}
            </a>
            <Link href="/admin" className="transition hover:text-cream">
              Salon login
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
