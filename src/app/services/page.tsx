import type { Metadata } from "next";
import Link from "next/link";
import { ServiceCard } from "@/components/service-card";
import { PageHero } from "@/components/ui";
import { CATEGORIES } from "@/lib/constants";
import { getServices } from "@/lib/data";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Services & Prices",
  description:
    "Full Giftedhands Salon price list: twists, goddess braids, French curl, Riverlocks, specials, kids braids, scalp treatments and lashes. Hair included on most styles.",
};

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const services = await getServices();
  const activeCategory = CATEGORIES.some((c) => c.slug === category) ? category : undefined;

  const groups = CATEGORIES.filter((c) => !activeCategory || c.slug === activeCategory)
    .map((c) => ({ ...c, items: services.filter((s) => s.category === c.slug) }))
    .filter((g) => g.items.length > 0);

  return (
    <>
      <PageHero
        eyebrow="Price list"
        title={
          <>
            Every style, <span className="gold-text">honestly priced.</span>
          </>
        }
        description="Hair is included on most styles. Times are realistic estimates so you can plan your day — bring a snack and a charger for the longer installs!"
      />

      <div className="sticky top-16 z-30 border-b border-linen bg-cream/90 backdrop-blur sm:top-20">
        <div className="container-x no-scrollbar flex gap-2 overflow-x-auto py-3">
          <Link
            href="/services"
            className={cn(
              "shrink-0 rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] transition",
              !activeCategory
                ? "border-espresso bg-espresso text-cream"
                : "border-linen bg-white text-cocoa hover:border-espresso",
            )}
          >
            All
          </Link>
          {CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              href={`/services?category=${c.slug}`}
              className={cn(
                "shrink-0 rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] transition",
                activeCategory === c.slug
                  ? "border-espresso bg-espresso text-cream"
                  : "border-linen bg-white text-cocoa hover:border-espresso",
              )}
            >
              {c.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="container-x space-y-20 py-16">
        {groups.map((group) => (
          <section key={group.slug} id={group.slug}>
            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="eyebrow">{group.items.length} options</p>
                <h2 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">{group.label}</h2>
              </div>
              <p className="max-w-md text-sm text-mocha">{group.blurb}</p>
            </div>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {group.items.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          </section>
        ))}

        <section className="rounded-[2rem] border border-linen bg-white p-8 sm:p-10">
          <h2 className="font-display text-2xl font-semibold">Good to know</h2>
          <div className="mt-6 grid gap-6 text-sm leading-relaxed text-mocha md:grid-cols-3">
            <div>
              <h3 className="font-semibold text-espresso">Arrive prepared</h3>
              <p className="mt-1">
                Please come with clean, detangled and blow-dried hair. Not possible? Add our
                Wash, Condition &amp; Blow Dry to your booking.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-espresso">Colours &amp; lengths</h3>
              <p className="mt-1">
                Tell us your preferred colour in the notes when you book — we stock classic
                blacks, browns, ombrés and fashion shades.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-espresso">House calls</h3>
              <p className="mt-1">
                A R200 call-out fee is added to the service price for home appointments in
                Pretoria and Johannesburg.
              </p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
