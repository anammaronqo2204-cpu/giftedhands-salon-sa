import Image from "next/image";
import Link from "next/link";
import { ServiceCard } from "@/components/service-card";
import {
  ArrowRight,
  Calendar,
  Heart,
  Home as HomeIcon,
  Instagram,
  MapPin,
  Quote,
  Shield,
  Smile,
  Sparkle,
  WhatsApp,
} from "@/components/icons";
import { Badge, SectionHeading, SmartImage, StarRating } from "@/components/ui";
import { BUSINESS, HOURS_DISPLAY } from "@/lib/constants";
import {
  getAllServiceImages,
  getApprovedReviews,
  getFeaturedServices,
  getLocations,
  getReviewStats,
} from "@/lib/data";
import { GALLERY, PROCESS_IMAGE } from "@/lib/gallery";
import { formatRands } from "@/lib/utils";

export const dynamic = "force-dynamic";

const TICKER = [
  "Knotless Braids",
  "Goddess Braids",
  "French Curl",
  "Riverlocks",
  "Spring Twists",
  "Passion Twists",
  "Kids Braids",
  "Scalp Detox",
  "Lash Extensions",
  "House Calls",
];

const FEATURES = [
  {
    icon: Shield,
    title: "Truly pain-free",
    text: "Our signature gentle-tension technique means no headaches, no bumps and no sleepless first night. Your edges stay exactly where they belong.",
  },
  {
    icon: Sparkle,
    title: "Hair included",
    text: "Quality pre-stretched braiding hair and curls are included on most styles, in the colour of your choice. Just arrive with clean, blow-dried hair.",
  },
  {
    icon: HomeIcon,
    title: "Two branches + house calls",
    text: "Visit us in Centurion or Fourways, or let us come to you anywhere in Pretoria and Johannesburg for a R200 call-out fee.",
  },
  {
    icon: Smile,
    title: "Kids welcome",
    text: "We are famous for tear-free kids braiding. Gentle hands, quick fingers and plenty of patience for our littlest clients.",
  },
];

const METHOD = [
  {
    step: "01",
    title: "Consultation",
    text: "We look at your hair density, scalp health and lifestyle to recommend the perfect size, length and finish.",
  },
  {
    step: "02",
    title: "Scalp prep",
    text: "Clean, stretched hair and a light scalp oil so every parting glides. Add a scalp detox for the ultimate reset.",
  },
  {
    step: "03",
    title: "Gentle-tension install",
    text: "Knotless roots, feather-light grip and constant check-ins. If it ever feels tight, we adjust — no exceptions.",
  },
  {
    step: "04",
    title: "Finish & aftercare",
    text: "Sealed ends, a mousse-and-wrap set, and a simple care routine so your style lasts 6–8 weeks.",
  },
];

export default async function HomePage() {
  const [featured, reviews, stats, locations, uploadedGallery] = await Promise.all([
    getFeaturedServices(6),
    getApprovedReviews(3),
    getReviewStats(),
    getLocations(),
    getAllServiceImages(),
  ]);

  const galleryItems = uploadedGallery.length
    ? uploadedGallery.map((image, index) => ({
        src: image.imageUrl,
        alt: image.caption ?? image.service.name,
        style: image.service.name,
        tall: index % 5 === 0,
      }))
    : GALLERY;

  return (
    <>
      {/* HERO */}
      <section className="grain relative overflow-hidden bg-espresso text-cream">
        <div className="pointer-events-none absolute -left-32 top-10 h-[28rem] w-[28rem] rounded-full bg-gold/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 bottom-0 h-96 w-96 rounded-full bg-copper/20 blur-3xl" />
        <div className="container-x relative grid gap-14 py-16 lg:grid-cols-12 lg:items-center lg:py-24">
          <div className="animate-fade-up lg:col-span-6">
            <p className="eyebrow text-gold">Centurion · Fourways · House calls</p>
            <h1 className="mt-6 font-display text-5xl font-semibold leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
              Home of <em className="gold-text not-italic">No Pain</em>
              <br />
              Braiding
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-cream/75">
              Knotless braids, goddess curls, French curl, Riverlocks and twists — installed
              so gently you&apos;ll forget you&apos;re in the chair. Book your slot online in
              under a minute.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/book" className="btn btn-gold px-7 py-3.5 text-base">
                <Calendar className="h-5 w-5" /> Book your slot
              </Link>
              <Link href="/services" className="btn btn-outline-light px-7 py-3.5 text-base">
                View price list <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
            <dl className="mt-12 grid grid-cols-3 gap-6 border-t border-cream/10 pt-8">
              <div>
                <dt className="text-[11px] font-bold uppercase tracking-[0.2em] text-cream/50">
                  Client rating
                </dt>
                <dd className="mt-2 flex items-center gap-2 font-display text-2xl font-semibold">
                  {stats.average ? stats.average.toFixed(1) : "5.0"}
                  <StarRating rating={stats.average || 5} size="h-3.5 w-3.5" />
                </dd>
              </div>
              <div>
                <dt className="text-[11px] font-bold uppercase tracking-[0.2em] text-cream/50">
                  Styles from
                </dt>
                <dd className="mt-2 font-display text-2xl font-semibold">{formatRands(300)}</dd>
              </div>
              <div>
                <dt className="text-[11px] font-bold uppercase tracking-[0.2em] text-cream/50">
                  Locations
                </dt>
                <dd className="mt-2 font-display text-2xl font-semibold">2 + home</dd>
              </div>
            </dl>
          </div>

          <div className="relative lg:col-span-6">
            <div className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-[2rem] shadow-soft ring-1 ring-cream/10 lg:ml-auto">
              <Image
                src="/images/hero.jpg"
                alt="Client with waist-length goddess braids at Giftedhands Salon"
                fill
                priority
                sizes="(max-width: 1024px) 90vw, 40vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-espresso/40 via-transparent to-transparent" />
            </div>
            <div className="absolute -left-2 bottom-8 max-w-[15rem] animate-float rounded-2xl bg-cream p-4 text-espresso shadow-soft sm:left-2 lg:-left-6">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold-dark">
                The promise
              </p>
              <p className="mt-1 font-display text-lg font-semibold leading-snug">
                No tension. No headaches. Just beautiful braids.
              </p>
            </div>
            <div className="absolute -right-1 top-6 rotate-6 rounded-full bg-gold px-4 py-2 text-xs font-extrabold uppercase tracking-[0.15em] text-espresso shadow-gold sm:right-4 lg:-right-2">
              Online booking
            </div>
          </div>
        </div>
      </section>

      {/* TICKER */}
      <div className="overflow-hidden border-y border-gold-dark/30 bg-gold py-3 text-espresso">
        <div className="flex w-max animate-marquee gap-10 whitespace-nowrap px-5 text-xs font-extrabold uppercase tracking-[0.25em]">
          {[...TICKER, ...TICKER].map((item, i) => (
            <span key={i} className="flex items-center gap-10">
              {item} <span className="text-espresso/40">✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* WHY */}
      <section className="container-x py-20 sm:py-24">
        <SectionHeading
          eyebrow="Why Giftedhands"
          title="Braids that look incredible and feel like nothing at all."
          description="Thousands of clients across Gauteng trust us because we never compromise on comfort, cleanliness or craftsmanship."
        />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="card group p-6 transition hover:-translate-y-1 hover:shadow-soft">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gold/15 text-gold-dark transition group-hover:bg-gold group-hover:text-espresso">
                <f.icon className="h-6 w-6" />
              </span>
              <h3 className="mt-5 font-display text-xl font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-mocha">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED SERVICES */}
      <section className="bg-sand/60 py-20 sm:py-24">
        <div className="container-x">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <SectionHeading
              eyebrow="Signature menu"
              title="Our most-loved styles"
              description="Transparent prices, hair included on most styles, and a realistic time estimate so you can plan your day."
            />
            <Link href="/services" className="btn btn-outline-dark shrink-0">
              Full price list <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((service, i) => (
              <ServiceCard key={service.id} service={service} priority={i < 3} />
            ))}
          </div>
        </div>
      </section>

      {/* METHOD */}
      <section className="container-x grid items-center gap-14 py-20 sm:py-24 lg:grid-cols-12">
        <div className="relative lg:col-span-5">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] shadow-soft">
            <SmartImage
              src={PROCESS_IMAGE}
              alt="Stylist gently working on a client's braids"
              sizes="(max-width: 1024px) 100vw, 40vw"
            />
          </div>
          <div className="absolute -bottom-6 -right-3 rounded-3xl bg-espresso p-5 text-cream shadow-soft sm:right-6">
            <p className="font-display text-4xl font-semibold text-gold">6–8</p>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cream/70">
              weeks of wear
            </p>
          </div>
        </div>
        <div className="lg:col-span-7 lg:pl-6">
          <SectionHeading
            eyebrow="The no-pain method"
            title="How we braid without the ouch."
            description="Pain isn't the price of a neat install. Here's what happens in every Giftedhands appointment."
          />
          <ol className="mt-10 grid gap-6 sm:grid-cols-2">
            {METHOD.map((m) => (
              <li key={m.step} className="relative rounded-3xl border border-linen bg-white/60 p-6">
                <span className="font-display text-3xl font-semibold text-gold">{m.step}</span>
                <h3 className="mt-3 font-display text-lg font-semibold">{m.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-mocha">{m.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* GALLERY PREVIEW */}
      <section className="bg-espresso py-20 text-cream sm:py-24">
        <div className="container-x">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <SectionHeading
              dark
              eyebrow="Recent work"
              title="Fresh out of the chair"
              description="A few of our favourite installs. Follow us on Instagram for daily inspiration."
            />
            <div className="flex shrink-0 gap-3">
              <a
                href={BUSINESS.instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="btn btn-outline-light"
              >
                <Instagram className="h-4 w-4" /> Instagram
              </a>
              <Link href="/gallery" className="btn btn-gold">
                View gallery
              </Link>
            </div>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
            {galleryItems.slice(0, 10).map((item, i) => (
              <Link
                key={item.src}
                href="/gallery"
                className={`group relative min-h-48 overflow-hidden rounded-2xl bg-cocoa ${
                  i === 0 || i === 3 ? "row-span-2" : "aspect-[3/4]"
                }`}
              >
                <SmartImage
                  src={item.src}
                  alt={item.alt}
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="transition duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-espresso/70 via-transparent to-transparent opacity-80" />
                <span className="absolute bottom-3 left-3 text-xs font-bold uppercase tracking-[0.15em] text-cream">
                  {item.style}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section className="container-x py-20 sm:py-24">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            eyebrow="Client love"
            title="Don't take our word for it."
            description={
              <span className="inline-flex flex-wrap items-center gap-2">
                <StarRating rating={stats.average || 5} />
                <span className="font-semibold text-espresso">
                  {(stats.average || 5).toFixed(1)}
                </span>
                <span>average from {stats.count} verified reviews</span>
              </span>
            }
          />
          <Link href="/reviews" className="btn btn-outline-dark shrink-0">
            Read all reviews
          </Link>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {reviews.map((r) => (
            <figure key={r.id} className="card relative flex h-full flex-col p-7">
              <Quote className="absolute right-6 top-6 h-8 w-8 text-gold/30" />
              <StarRating rating={r.rating} />
              <blockquote className="mt-4 flex-1 text-base leading-relaxed text-cocoa">
                &ldquo;{r.comment}&rdquo;
              </blockquote>
              <figcaption className="mt-6 border-t border-linen pt-4">
                <p className="font-semibold text-espresso">{r.customerName}</p>
                {r.serviceName && <p className="text-xs text-mocha">{r.serviceName}</p>}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* LOCATIONS */}
      <section className="bg-sand/60 py-20 sm:py-24">
        <div className="container-x">
          <SectionHeading
            eyebrow="Where to find us"
            title="Centurion, Fourways — or your living room."
            description="Choose the branch closest to you, or book a house call and we'll bring the salon to your door."
            align="center"
          />
          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {locations.map((loc) => (
              <div key={loc.id} className="card flex h-full flex-col p-7">
                <div className="flex items-start justify-between gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-espresso text-gold">
                    {loc.isHouseCall ? <HomeIcon className="h-5 w-5" /> : <MapPin className="h-5 w-5" />}
                  </span>
                  {loc.isHouseCall ? (
                    <Badge tone="gold">+{formatRands(loc.callOutFeeRands)} call-out</Badge>
                  ) : (
                    <Badge tone="green">Open today</Badge>
                  )}
                </div>
                <h3 className="mt-5 font-display text-2xl font-semibold">{loc.name}</h3>
                <p className="mt-1 text-sm font-semibold text-cocoa">{loc.addressLine}</p>
                <p className="text-sm text-mocha">{loc.area}</p>
                <p className="mt-4 flex-1 text-sm leading-relaxed text-mocha">{loc.description}</p>
                <div className="mt-6 flex flex-wrap gap-2">
                  <Link href={`/book?location=${loc.slug}`} className="btn btn-dark px-5 py-2.5 text-xs">
                    Book here
                  </Link>
                  {loc.mapsUrl && (
                    <a
                      href={loc.mapsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-outline-dark px-5 py-2.5 text-xs"
                    >
                      Directions
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="mx-auto mt-10 flex max-w-3xl flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm text-mocha">
            {HOURS_DISPLAY.map((h) => (
              <span key={h.days}>
                <span className="font-semibold text-espresso">{h.days}:</span> {h.time}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container-x pb-20 pt-4 sm:pb-24">
        <div className="grain relative overflow-hidden rounded-[2.5rem] bg-espresso px-8 py-14 text-center text-cream sm:px-14 sm:py-20">
          <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-gold/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -right-16 h-80 w-80 rounded-full bg-copper/30 blur-3xl" />
          <Heart className="mx-auto h-8 w-8 text-gold" />
          <h2 className="mx-auto mt-5 max-w-2xl font-display text-4xl font-semibold leading-tight sm:text-5xl">
            Ready for your next look?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-cream/70">
            Weekend slots fill up fast. Reserve yours now and we&apos;ll confirm on WhatsApp.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/book" className="btn btn-gold px-7 py-3.5 text-base">
              <Calendar className="h-5 w-5" /> Book your slot
            </Link>
            <a
              href={BUSINESS.whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="btn btn-outline-light px-7 py-3.5 text-base"
            >
              <WhatsApp className="h-5 w-5" /> WhatsApp us
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
