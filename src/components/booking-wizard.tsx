"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { createBooking, fetchAvailability, type SlotDTO } from "@/app/book/actions";
import type { Location, Service } from "@/db/schema";
import { CATEGORIES, categoryLabel } from "@/lib/constants";
import {
  cn,
  dateParts,
  formatDateLong,
  formatDuration,
  formatMinutes,
  formatRands,
} from "@/lib/utils";
import { Check, ChevronLeft, ChevronRight, Clock, Home, MapPin } from "./icons";
import { Badge, SmartImage } from "./ui";

type Day = { dateStr: string; open: boolean };

const STEPS = ["Style", "Location", "Date & time", "Your details", "Confirm"];

export function BookingWizard({
  services,
  locations,
  days,
  initialServiceSlug,
  initialLocationSlug,
}: {
  services: Service[];
  locations: Location[];
  days: Day[];
  initialServiceSlug?: string;
  initialLocationSlug?: string;
}) {
  const router = useRouter();
  const initialService = services.find((s) => s.slug === initialServiceSlug) ?? null;
  const initialLocation = locations.find((l) => l.slug === initialLocationSlug) ?? null;

  const [step, setStep] = useState(initialService ? 1 : 0);
  const [category, setCategory] = useState<string>(initialService?.category ?? "all");
  const [serviceId, setServiceId] = useState<number | null>(initialService?.id ?? null);
  const [locationId, setLocationId] = useState<number | null>(initialLocation?.id ?? null);
  const [date, setDate] = useState<string | null>(null);
  const [startMinutes, setStartMinutes] = useState<number | null>(null);
  const [slots, setSlots] = useState<SlotDTO[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [closed, setClosed] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "", notes: "" });
  const [error, setError] = useState<string | null>(null);
  const [submitting, startSubmit] = useTransition();

  const service = services.find((s) => s.id === serviceId) ?? null;
  const location = locations.find((l) => l.id === locationId) ?? null;
  const total = (service?.priceRands ?? 0) + (location?.callOutFeeRands ?? 0);

  const visibleServices = useMemo(
    () => (category === "all" ? services : services.filter((s) => s.category === category)),
    [services, category],
  );

  const usedCategories = CATEGORIES.filter((c) => services.some((s) => s.category === c.slug));

  // Load availability when the combination changes.
  useEffect(() => {
    if (!service || !location || !date) return;
    let cancelled = false;
    setSlotsLoading(true);
    setSlots([]);
    fetchAvailability({ serviceId: service.id, locationId: location.id, date }).then((res) => {
      if (cancelled) return;
      setSlots(res.slots);
      setClosed(res.closed);
      setSlotsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [service, location, date]);

  function chooseService(s: Service) {
    setServiceId(s.id);
    setStartMinutes(null);
    if (s.centurionOnly && location && location.slug !== "centurion") {
      setLocationId(null);
    }
    setError(null);
  }

  function chooseLocation(l: Location) {
    setLocationId(l.id);
    setStartMinutes(null);
    setError(null);
  }

  function chooseDate(d: string) {
    setDate(d);
    setStartMinutes(null);
  }

  const canContinue = [
    Boolean(service),
    Boolean(location),
    Boolean(date) && startMinutes !== null,
    form.name.trim().length >= 2 &&
      form.phone.trim().length >= 10 &&
      (!location?.isHouseCall || form.address.trim().length >= 8),
    true,
  ][step];

  function next() {
    if (!canContinue) return;
    setError(null);
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function back() {
    setError(null);
    setStep((s) => Math.max(s - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function submit() {
    if (!service || !location || !date || startMinutes === null) return;
    setError(null);
    startSubmit(async () => {
      const res = await createBooking({
        serviceId: service.id,
        locationId: location.id,
        date,
        startMinutes,
        ...form,
      });
      if (res.ok) {
        router.push(`/book/confirmed/${res.reference}`);
      } else {
        setError(res.error);
        if (res.error.toLowerCase().includes("time")) {
          setStartMinutes(null);
          setStep(2);
        }
      }
    });
  }

  return (
    <div className="grid gap-10 lg:grid-cols-12">
      <div className="lg:col-span-8">
        {/* Stepper */}
        <ol className="no-scrollbar flex items-center gap-2 overflow-x-auto pb-2">
          {STEPS.map((label, i) => {
            const done = i < step;
            const active = i === step;
            return (
              <li key={label} className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => done && setStep(i)}
                  disabled={!done}
                  className={cn(
                    "flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] transition",
                    active && "border-espresso bg-espresso text-cream",
                    done && "border-gold bg-gold/15 text-gold-dark hover:bg-gold/25",
                    !active && !done && "border-linen text-mocha",
                  )}
                >
                  <span
                    className={cn(
                      "grid h-5 w-5 place-items-center rounded-full text-[10px]",
                      active ? "bg-gold text-espresso" : done ? "bg-gold text-espresso" : "bg-linen text-cocoa",
                    )}
                  >
                    {done ? <Check className="h-3 w-3" /> : i + 1}
                  </span>
                  {label}
                </button>
                {i < STEPS.length - 1 && <ChevronRight className="h-4 w-4 text-linen" />}
              </li>
            );
          })}
        </ol>

        <div className="mt-8">
          {/* STEP 0: SERVICE */}
          {step === 0 && (
            <section>
              <StepTitle title="Choose your style" subtitle="Hair is included on most styles. Prices are per install." />
              <div className="no-scrollbar mt-6 flex gap-2 overflow-x-auto pb-1">
                <Chip active={category === "all"} onClick={() => setCategory("all")}>
                  All
                </Chip>
                {usedCategories.map((c) => (
                  <Chip key={c.slug} active={category === c.slug} onClick={() => setCategory(c.slug)}>
                    {c.label}
                  </Chip>
                ))}
              </div>
              <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {visibleServices.map((s) => {
                  const selected = s.id === serviceId;
                  return (
                    <li key={s.id}>
                      <button
                        type="button"
                        onClick={() => chooseService(s)}
                        className={cn(
                          "flex w-full items-center gap-4 rounded-2xl border bg-white p-3 text-left transition hover:border-gold",
                          selected ? "border-gold ring-2 ring-gold/40" : "border-linen",
                        )}
                      >
                        <span className="relative h-20 w-16 shrink-0 overflow-hidden rounded-xl bg-sand">
                          <SmartImage src={s.imageUrl} alt="" sizes="64px" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-[10px] font-bold uppercase tracking-[0.15em] text-gold-dark">
                            {categoryLabel(s.category)}
                          </span>
                          <span className="block truncate font-semibold text-espresso">{s.name}</span>
                          <span className="mt-1 flex items-center gap-3 text-xs text-mocha">
                            <span className="font-bold text-espresso">
                              {formatRands(s.priceRands, s.priceFrom)}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Clock className="h-3 w-3" /> {formatDuration(s.durationMinutes)}
                            </span>
                          </span>
                        </span>
                        <span
                          className={cn(
                            "grid h-6 w-6 shrink-0 place-items-center rounded-full border",
                            selected ? "border-gold bg-gold text-espresso" : "border-linen",
                          )}
                        >
                          {selected && <Check className="h-4 w-4" />}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {/* STEP 1: LOCATION */}
          {step === 1 && (
            <section>
              <StepTitle
                title="Where would you like to be braided?"
                subtitle={
                  service?.centurionOnly
                    ? `${service.name} is available at our Centurion branch only.`
                    : "Visit a branch or let us come to you."
                }
              />
              <ul className="mt-6 grid gap-3 md:grid-cols-3">
                {locations.map((l) => {
                  const disabled = Boolean(service?.centurionOnly && l.slug !== "centurion");
                  const selected = l.id === locationId;
                  return (
                    <li key={l.id}>
                      <button
                        type="button"
                        disabled={disabled}
                        onClick={() => chooseLocation(l)}
                        className={cn(
                          "flex h-full w-full flex-col rounded-2xl border bg-white p-5 text-left transition",
                          disabled ? "cursor-not-allowed opacity-40" : "hover:border-gold",
                          selected ? "border-gold ring-2 ring-gold/40" : "border-linen",
                        )}
                      >
                        <span className="flex w-full items-start justify-between">
                          <span className="grid h-10 w-10 place-items-center rounded-xl bg-espresso text-gold">
                            {l.isHouseCall ? <Home className="h-5 w-5" /> : <MapPin className="h-5 w-5" />}
                          </span>
                          {l.callOutFeeRands > 0 && (
                            <Badge tone="gold">+{formatRands(l.callOutFeeRands)}</Badge>
                          )}
                        </span>
                        <span className="mt-4 font-display text-xl font-semibold text-espresso">{l.name}</span>
                        <span className="mt-1 text-sm text-cocoa">{l.addressLine}</span>
                        <span className="text-xs text-mocha">{l.area}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {/* STEP 2: DATE & TIME */}
          {step === 2 && service && location && (
            <section>
              <StepTitle
                title="Pick a date and time"
                subtitle={`${service.name} takes about ${formatDuration(service.durationMinutes)}. Times shown are start times.`}
              />
              <div className="no-scrollbar mt-6 flex gap-2 overflow-x-auto pb-2">
                {days.map((d) => {
                  const p = dateParts(d.dateStr);
                  const selected = d.dateStr === date;
                  return (
                    <button
                      key={d.dateStr}
                      type="button"
                      disabled={!d.open}
                      onClick={() => chooseDate(d.dateStr)}
                      className={cn(
                        "flex w-[4.6rem] shrink-0 flex-col items-center rounded-2xl border py-3 transition",
                        !d.open && "cursor-not-allowed opacity-40",
                        selected
                          ? "border-espresso bg-espresso text-cream"
                          : "border-linen bg-white text-espresso hover:border-gold",
                      )}
                    >
                      <span className="text-[10px] font-bold uppercase tracking-[0.15em] opacity-70">{p.day}</span>
                      <span className="font-display text-2xl font-semibold leading-tight">{p.date}</span>
                      <span className="text-[10px] font-semibold uppercase tracking-[0.12em] opacity-70">{p.month}</span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 min-h-[8rem]">
                {!date && <p className="text-sm text-mocha">Select a date to see available start times.</p>}
                {date && slotsLoading && (
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <div key={i} className="h-11 animate-pulse rounded-xl bg-sand" />
                    ))}
                  </div>
                )}
                {date && !slotsLoading && closed && (
                  <p className="rounded-2xl bg-sand p-4 text-sm text-cocoa">We&apos;re closed on this day. Please pick another date.</p>
                )}
                {date && !slotsLoading && !closed && (
                  <>
                    <p className="mb-3 text-sm font-semibold text-espresso">{formatDateLong(date)}</p>
                    {slots.every((s) => !s.available) ? (
                      <p className="rounded-2xl bg-sand p-4 text-sm text-cocoa">
                        No start times left for this style on this day. Try another date or location.
                      </p>
                    ) : (
                      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                        {slots.map((s) => {
                          const selected = s.startMinutes === startMinutes;
                          return (
                            <button
                              key={s.startMinutes}
                              type="button"
                              disabled={!s.available}
                              onClick={() => setStartMinutes(s.startMinutes)}
                              className={cn(
                                "rounded-xl border py-2.5 text-sm font-semibold transition",
                                !s.available && "cursor-not-allowed border-linen/60 text-mocha/40 line-through",
                                s.available && !selected && "border-linen bg-white text-espresso hover:border-gold",
                                selected && "border-gold bg-gold text-espresso",
                              )}
                            >
                              {s.label}
                            </button>
                          );
                        })}
                      </div>
                    )}
                    {startMinutes !== null && (
                      <p className="mt-4 inline-flex flex-wrap items-center gap-2 rounded-full bg-gold/15 px-4 py-2 text-xs font-semibold text-gold-dark">
                        <Clock className="h-4 w-4" /> Finishes around {formatMinutes(startMinutes + service.durationMinutes)}
                        {slots.find((slot) => slot.startMinutes === startMinutes)?.staffName && (
                          <span>· Assigned to {slots.find((slot) => slot.startMinutes === startMinutes)?.staffName}</span>
                        )}
                      </p>
                    )}
                  </>
                )}
              </div>
            </section>
          )}

          {/* STEP 3: DETAILS */}
          {step === 3 && (
            <section>
              <StepTitle title="Your details" subtitle="We'll confirm your booking on WhatsApp." />
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="label" htmlFor="name">Full name</label>
                  <input
                    id="name"
                    className="input"
                    placeholder="e.g. Thandiwe Mokoena"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    autoComplete="name"
                  />
                </div>
                <div>
                  <label className="label" htmlFor="phone">WhatsApp number</label>
                  <input
                    id="phone"
                    className="input"
                    placeholder="063 827 9114"
                    inputMode="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    autoComplete="tel"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="label" htmlFor="email">
                    Email <span className="font-normal normal-case tracking-normal text-mocha">(optional)</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    className="input"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    autoComplete="email"
                  />
                </div>
                {location?.isHouseCall && (
                  <div className="sm:col-span-2">
                    <label className="label" htmlFor="address">House call address</label>
                    <input
                      id="address"
                      className="input"
                      placeholder="Street, complex/unit, suburb, city"
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                      autoComplete="street-address"
                    />
                  </div>
                )}
                <div className="sm:col-span-2">
                  <label className="label" htmlFor="notes">
                    Colour, length &amp; notes <span className="font-normal normal-case tracking-normal text-mocha">(optional)</span>
                  </label>
                  <textarea
                    id="notes"
                    className="input min-h-28"
                    placeholder="e.g. Colour 1B with a few honey-blonde pieces, medium-size parts, sensitive scalp."
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  />
                </div>
              </div>
            </section>
          )}

          {/* STEP 4: CONFIRM */}
          {step === 4 && service && location && date && startMinutes !== null && (
            <section>
              <StepTitle title="Almost done — check the details" subtitle="Tap confirm and we'll reserve this slot for you." />
              <div className="mt-6 overflow-hidden rounded-3xl border border-linen bg-white">
                <div className="relative h-40 bg-sand">
                  <SmartImage src={service.imageUrl} alt={service.name} sizes="(max-width: 1024px) 100vw, 60vw" />
                  <div className="absolute inset-0 bg-gradient-to-t from-espresso/80 to-transparent" />
                  <div className="absolute bottom-4 left-5 text-cream">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">{categoryLabel(service.category)}</p>
                    <p className="font-display text-2xl font-semibold">{service.name}</p>
                  </div>
                </div>
                <dl className="grid gap-x-8 gap-y-4 p-6 text-sm sm:grid-cols-2">
                  <Item label="When" value={formatDateLong(date)} sub={`${formatMinutes(startMinutes)} – ${formatMinutes(startMinutes + service.durationMinutes)}`} />
                  <Item label="Where" value={location.name} sub={location.isHouseCall ? form.address : location.addressLine} />
                  <Item label="Name" value={form.name} sub={form.phone} />
                  <Item label="Notes" value={form.notes || "—"} />
                </dl>
                <div className="flex items-center justify-between border-t border-linen bg-sand/50 px-6 py-4">
                  <span className="text-sm text-cocoa">
                    {service.name}
                    {location.callOutFeeRands > 0 && ` + ${formatRands(location.callOutFeeRands)} call-out`}
                  </span>
                  <span className="font-display text-2xl font-semibold">
                    {formatRands(total, service.priceFrom)}
                  </span>
                </div>
              </div>
              <p className="mt-4 text-xs leading-relaxed text-mocha">
                By confirming you agree to arrive with clean, blow-dried hair and to give at least 24 hours&apos; notice
                if you need to reschedule. Payment is made on the day.
              </p>
            </section>
          )}

          {error && (
            <p className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800">
              {error}
            </p>
          )}

          <div className="mt-8 flex items-center justify-between gap-3">
            <button type="button" onClick={back} disabled={step === 0} className="btn btn-outline-dark">
              <ChevronLeft className="h-4 w-4" /> Back
            </button>
            {step < STEPS.length - 1 ? (
              <button type="button" onClick={next} disabled={!canContinue} className="btn btn-dark">
                Continue <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button type="button" onClick={submit} disabled={submitting} className="btn btn-gold px-8">
                {submitting ? "Reserving your slot…" : "Confirm booking"}
              </button>
            )}
          </div>
        </div>
      </div>

      <aside className="lg:col-span-4">
        <div className="card p-6 lg:sticky lg:top-28">
          <p className="eyebrow">Your booking</p>
          <dl className="mt-5 space-y-4 text-sm">
            <Item label="Style" value={service?.name ?? "Not selected"} sub={service ? `${formatRands(service.priceRands, service.priceFrom)} · ${formatDuration(service.durationMinutes)}` : undefined} />
            <Item label="Location" value={location?.name ?? "Not selected"} sub={location?.addressLine} />
            <Item
              label="Date & time"
              value={date ? formatDateLong(date) : "Not selected"}
              sub={startMinutes !== null && service ? `${formatMinutes(startMinutes)} – ${formatMinutes(startMinutes + service.durationMinutes)}` : undefined}
            />
          </dl>
          <div className="mt-6 border-t border-linen pt-4">
            {location && location.callOutFeeRands > 0 && (
              <div className="flex justify-between text-sm text-cocoa">
                <span>Call-out fee</span>
                <span>{formatRands(location.callOutFeeRands)}</span>
              </div>
            )}
            <div className="mt-1 flex items-baseline justify-between">
              <span className="font-semibold">Total</span>
              <span className="font-display text-3xl font-semibold">
                {service ? formatRands(total, service.priceFrom) : "—"}
              </span>
            </div>
            <p className="mt-2 text-xs text-mocha">No online payment needed — pay on the day.</p>
          </div>
        </div>
      </aside>
    </div>
  );
}

function StepTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div>
      <h2 className="font-display text-2xl font-semibold sm:text-3xl">{title}</h2>
      {subtitle && <p className="mt-2 text-sm text-mocha">{subtitle}</p>}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] transition",
        active ? "border-espresso bg-espresso text-cream" : "border-linen bg-white text-cocoa hover:border-espresso",
      )}
    >
      {children}
    </button>
  );
}

function Item({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div>
      <dt className="text-[10px] font-bold uppercase tracking-[0.18em] text-mocha">{label}</dt>
      <dd className="mt-0.5 font-semibold text-espresso">{value}</dd>
      {sub && <dd className="text-xs text-mocha">{sub}</dd>}
    </div>
  );
}
