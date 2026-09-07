import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, Check, Download, MapPin, WhatsApp } from "@/components/icons";
import { Badge, SmartImage } from "@/components/ui";
import { BUSINESS, STATUS_LABELS } from "@/lib/constants";
import { getBookingByReference } from "@/lib/data";
import { formatDateLong, formatDuration, formatMinutes, formatRands } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Booking received",
  robots: { index: false },
};

const STATUS_TONE: Record<string, "amber" | "green" | "slate" | "red"> = {
  pending: "amber",
  confirmed: "green",
  completed: "slate",
  cancelled: "red",
};

export default async function ConfirmedPage({
  params,
}: {
  params: Promise<{ reference: string }>;
}) {
  const { reference } = await params;
  const booking = await getBookingByReference(reference);
  if (!booking) notFound();

  const whatsappText = encodeURIComponent(
    `Hi Giftedhands! I just booked online.\n\nReference: ${booking.reference}\nStyle: ${booking.service.name}\nWhen: ${formatDateLong(booking.bookingDate)} at ${formatMinutes(booking.startMinutes)}\nWhere: ${booking.location.name}${booking.address ? ` (${booking.address})` : ""}\nAllocated staff: ${booking.staff?.name ?? "Giftedhands team"}\nName: ${booking.customerName}\n\nPlease confirm my slot. Thank you!`,
  );

  return (
    <div className="container-x py-12 sm:py-16">
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-gold text-espresso shadow-gold">
            <Check className="h-8 w-8" />
          </span>
          <p className="eyebrow mt-6 justify-center">Booking received</p>
          <h1 className="mt-3 font-display text-4xl font-semibold sm:text-5xl">
            See you soon, {booking.customerName.split(" ")[0]}!
          </h1>
          <p className="mt-4 text-mocha">
            Your slot is reserved. We&apos;ll confirm on WhatsApp shortly — keep your reference handy.
          </p>
          <div className="mt-6 inline-flex flex-col items-center gap-2 rounded-3xl border border-linen bg-white px-8 py-5">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-mocha">Your reference</span>
            <span className="font-display text-3xl font-semibold tracking-[0.15em] text-espresso">{booking.reference}</span>
            <Badge tone={STATUS_TONE[booking.status]}>{STATUS_LABELS[booking.status]}</Badge>
          </div>
        </div>

        <div className="card mt-10 overflow-hidden">
          <div className="relative h-44 bg-sand">
            <SmartImage src={booking.service.imageUrl} alt={booking.service.name} sizes="(max-width: 768px) 100vw, 768px" />
            <div className="absolute inset-0 bg-gradient-to-t from-espresso/80 to-transparent" />
            <div className="absolute bottom-5 left-6 text-cream">
              <p className="font-display text-2xl font-semibold">{booking.service.name}</p>
              <p className="text-sm text-cream/80">approx. {formatDuration(booking.service.durationMinutes)}</p>
            </div>
          </div>
          <dl className="grid gap-6 p-6 sm:grid-cols-2 sm:p-8">
            <div className="flex gap-3">
              <Calendar className="mt-0.5 h-5 w-5 shrink-0 text-gold-dark" />
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-[0.18em] text-mocha">When</dt>
                <dd className="font-semibold">{formatDateLong(booking.bookingDate)}</dd>
                <dd className="text-sm text-mocha">
                  {formatMinutes(booking.startMinutes)} – {formatMinutes(booking.endMinutes)}
                </dd>
              </div>
            </div>
            <div className="flex gap-3">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-gold-dark" />
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-[0.18em] text-mocha">Where</dt>
                <dd className="font-semibold">{booking.location.name}</dd>
                <dd className="text-sm text-mocha">{booking.address ?? booking.location.addressLine}</dd>
                {booking.location.mapsUrl && (
                  <a href={booking.location.mapsUrl} target="_blank" rel="noreferrer" className="text-sm font-semibold text-gold-dark hover:underline">
                    Get directions
                  </a>
                )}
              </div>
            </div>
            <div>
              <dt className="text-[10px] font-bold uppercase tracking-[0.18em] text-mocha">Booked for</dt>
              <dd className="font-semibold">{booking.customerName}</dd>
              <dd className="text-sm text-mocha">{booking.phone}</dd>
            </div>
            <div>
              <dt className="text-[10px] font-bold uppercase tracking-[0.18em] text-mocha">Total on the day</dt>
              <dd className="font-display text-2xl font-semibold">
                {formatRands(booking.totalRands, booking.service.priceFrom)}
              </dd>
              {booking.location.callOutFeeRands > 0 && (
                <dd className="text-sm text-mocha">includes {formatRands(booking.location.callOutFeeRands)} call-out fee</dd>
              )}
            </div>
            <div>
              <dt className="text-[10px] font-bold uppercase tracking-[0.18em] text-mocha">Allocated staff</dt>
              <dd className="font-semibold">{booking.staff?.name ?? "Giftedhands team"}</dd>
              <dd className="text-sm text-mocha">Subject to salon confirmation</dd>
            </div>
            {booking.notes && (
              <div className="sm:col-span-2">
                <dt className="text-[10px] font-bold uppercase tracking-[0.18em] text-mocha">Your notes</dt>
                <dd className="text-sm text-cocoa">{booking.notes}</dd>
              </div>
            )}
          </dl>
          <div className="flex flex-wrap gap-3 border-t border-linen bg-sand/50 p-6 sm:px-8">
            <a href={`${BUSINESS.whatsappUrl}?text=${whatsappText}`} target="_blank" rel="noreferrer" className="btn btn-whatsapp">
              <WhatsApp className="h-5 w-5" /> Send to WhatsApp
            </a>
            <a href={`/api/bookings/${booking.reference}/ics`} className="btn btn-outline-dark">
              <Download className="h-4 w-4" /> Add to calendar
            </a>
            <Link href="/" className="btn btn-outline-dark">
              Back to home
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            { title: "Come prepared", text: "Arrive with clean, detangled, blow-dried hair. No heavy oils or gel." },
            { title: "Settle in", text: "Longer styles take a few hours — bring a charger, snacks and something to watch." },
            { title: "Need to change?", text: `WhatsApp us on ${BUSINESS.phoneDisplay} quoting ${booking.reference} at least 24 hours ahead.` },
          ].map((tip) => (
            <div key={tip.title} className="rounded-3xl border border-linen bg-white p-5">
              <h2 className="font-display text-lg font-semibold">{tip.title}</h2>
              <p className="mt-1 text-sm leading-relaxed text-mocha">{tip.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
