import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ServiceCard } from "@/components/service-card";
import { ArrowRight, Calendar, Check, ChevronLeft, Clock, MapPin } from "@/components/icons";
import { Badge, SmartImage } from "@/components/ui";
import { categoryLabel } from "@/lib/constants";
import { getLocations, getServiceBySlug, getServiceImages, getServices, getStaffForService } from "@/lib/data";
import { formatDuration, formatRands } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  if (!service) return { title: "Service not found" };
  return {
    title: `${service.name} — ${formatRands(service.priceRands, service.priceFrom)}`,
    description: service.shortDescription,
  };
}

export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  if (!service) notFound();

  const [all, locations, images, serviceStaff] = await Promise.all([
    getServices(),
    getLocations(),
    getServiceImages(service.id),
    getStaffForService(service.id),
  ]);
  const related = all.filter((s) => s.category === service.category && s.id !== service.id).slice(0, 3);
  const availableAt = locations.filter((l) => !service.centurionOnly || l.slug === "centurion");
  const detailImages = images.length > 0 ? images : [{ id: 0, serviceId: service.id, imageUrl: service.imageUrl, caption: service.name, sortOrder: 1, active: true }];

  const included = [
    service.hairIncluded ? "Quality hair / curls included" : "Bring your own hair",
    "Consultation on size, length & colour",
    "Gentle no-pain installation",
    "Sealed ends & finishing mousse",
    "Aftercare guidance",
  ];

  return (
    <>
      <div className="container-x pt-8">
        <Link
          href={`/services?category=${service.category}`}
          className="inline-flex items-center gap-1 text-sm font-semibold text-mocha transition hover:text-espresso"
        >
          <ChevronLeft className="h-4 w-4" /> Back to {categoryLabel(service.category)}
        </Link>
      </div>

      <section className="container-x grid gap-12 py-10 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <div className="lg:sticky lg:top-28">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] shadow-soft">
              <SmartImage
                src={detailImages[0].imageUrl}
                alt={detailImages[0].caption ?? service.name}
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            {detailImages.length > 1 && (
              <div className="mt-4 grid grid-cols-4 gap-3">
                {detailImages.slice(1, 5).map((image) => (
                  <div key={image.id} className="relative aspect-square overflow-hidden rounded-2xl bg-sand">
                    <SmartImage src={image.imageUrl} alt={image.caption ?? service.name} sizes="120px" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-6">
          <div className="flex flex-wrap gap-2">
            <Badge tone="gold">{categoryLabel(service.category)}</Badge>
            {service.hairIncluded && <Badge tone="dark">Hair included</Badge>}
            {service.centurionOnly && <Badge tone="slate">Centurion only</Badge>}
          </div>
          <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
            {service.name}
          </h1>
          <div className="mt-6 flex flex-wrap items-center gap-6">
            <p className="font-display text-4xl font-semibold text-espresso">
              {formatRands(service.priceRands, service.priceFrom)}
            </p>
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-mocha">
              <Clock className="h-4 w-4 text-gold-dark" /> approx. {formatDuration(service.durationMinutes)}
            </p>
          </div>
          <p className="mt-6 text-base leading-relaxed text-cocoa sm:text-lg">{service.description}</p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={`/book?service=${service.slug}`} className="btn btn-gold px-7 py-3.5 text-base">
              <Calendar className="h-5 w-5" /> Book this style
            </Link>
            <Link href="/services" className="btn btn-outline-dark px-7 py-3.5 text-base">
              Compare styles
            </Link>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            <div className="rounded-3xl border border-linen bg-white p-6">
              <h2 className="font-display text-lg font-semibold">What&apos;s included</h2>
              <ul className="mt-4 space-y-2.5 text-sm text-cocoa">
                {included.map((item) => (
                  <li key={item} className="flex gap-2.5">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-gold-dark" /> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl border border-linen bg-white p-6">
              <h2 className="font-display text-lg font-semibold">Available at</h2>
              <ul className="mt-4 space-y-3 text-sm text-cocoa">
                {availableAt.map((l) => (
                  <li key={l.id} className="flex gap-2.5">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold-dark" />
                    <span>
                      <span className="font-semibold">{l.name}</span>
                      {l.isHouseCall && (
                        <span className="text-mocha"> · +{formatRands(l.callOutFeeRands)} call-out</span>
                      )}
                      <br />
                      <span className="text-mocha">{l.addressLine}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-6 rounded-3xl bg-sand/70 p-6 text-sm leading-relaxed text-cocoa">
            <h2 className="font-display text-lg font-semibold text-espresso">Before your appointment</h2>
            <p className="mt-2">
              Arrive with clean, detangled and blow-dried hair. Skip heavy oils and gels on the day.
              Let us know your preferred colour and any scalp sensitivities in your booking notes.
            </p>
          </div>

          {serviceStaff.length > 0 && (
            <div className="mt-6 rounded-3xl border border-linen bg-white p-6">
              <h2 className="font-display text-lg font-semibold">Default staff order</h2>
              <p className="mt-1 text-xs text-mocha">
                The booking system tries #1 first, then moves to the runner-up if they are busy.
              </p>
              <ol className="mt-4 space-y-2 text-sm text-cocoa">
                {serviceStaff.map((row) => (
                  <li key={row.id} className="flex items-center justify-between gap-3 rounded-2xl bg-sand/50 px-4 py-3">
                    <span className="font-semibold">{row.priority}. {row.staff.name}</span>
                    <span className="text-xs uppercase tracking-[0.14em] text-mocha">{row.staff.role}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      </section>

      {related.length > 0 && (
        <section className="bg-sand/60 py-16">
          <div className="container-x">
            <div className="flex items-end justify-between gap-4">
              <h2 className="font-display text-3xl font-semibold">You might also love</h2>
              <Link
                href={`/services?category=${service.category}`}
                className="inline-flex items-center gap-1 text-sm font-semibold text-espresso/70 hover:text-espresso"
              >
                See all {categoryLabel(service.category)} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((s) => (
                <ServiceCard key={s.id} service={s} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
