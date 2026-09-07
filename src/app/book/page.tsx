import type { Metadata } from "next";
import { BookingWizard } from "@/components/booking-wizard";
import { Shield, Sparkle, WhatsApp } from "@/components/icons";
import { getBookableDays } from "@/lib/booking";
import { BUSINESS } from "@/lib/constants";
import { getLocations, getServices } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Book your slot",
  description:
    "Book your braiding, treatment or lash appointment at Giftedhands Salon in Centurion, Fourways or at home. Live availability, instant reference, WhatsApp confirmation.",
};

export default async function BookPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string; location?: string }>;
}) {
  const { service, location } = await searchParams;
  const [services, locations] = await Promise.all([getServices(), getLocations()]);
  const days = getBookableDays();

  return (
    <>
      <section className="grain relative overflow-hidden bg-espresso text-cream">
        <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-gold/15 blur-3xl" />
        <div className="container-x relative flex flex-col gap-8 py-12 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="eyebrow text-gold">Online booking</p>
            <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.05] sm:text-5xl">
              Book your slot in under a minute.
            </h1>
            <p className="mt-4 text-cream/70">
              Pick a style, choose a branch or house call, and grab a time that works for you.
              We&apos;ll confirm on WhatsApp.
            </p>
          </div>
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-xs font-semibold text-cream/70">
            <li className="inline-flex items-center gap-2"><Sparkle className="h-4 w-4 text-gold" /> Live availability</li>
            <li className="inline-flex items-center gap-2"><Shield className="h-4 w-4 text-gold" /> No payment needed now</li>
            <li className="inline-flex items-center gap-2"><WhatsApp className="h-4 w-4 text-gold" /> WhatsApp confirmation</li>
          </ul>
        </div>
      </section>

      <div className="container-x py-12">
        <BookingWizard
          services={services}
          locations={locations}
          days={days}
          initialServiceSlug={service}
          initialLocationSlug={location}
        />
        <p className="mt-10 text-center text-sm text-mocha">
          Prefer to chat? Message us on WhatsApp at{" "}
          <a href={BUSINESS.whatsappUrl} target="_blank" rel="noreferrer" className="font-semibold text-espresso underline-offset-4 hover:underline">
            {BUSINESS.phoneDisplay}
          </a>
          .
        </p>
      </div>
    </>
  );
}
