import type { Metadata } from "next";
import Link from "next/link";
import { AdminNav } from "@/components/admin-nav";
import { Calendar, Check, Clock, MapPin, Scissors, X } from "@/components/icons";
import { Badge } from "@/components/ui";
import { requireAdmin } from "@/lib/admin-auth";
import { getAllBookings, getLocations, getScheduleForDate, getStaff } from "@/lib/data";
import { formatDateLong, formatMinutes, formatRands, nowInSAST } from "@/lib/utils";
import { addShiftAction, deleteShiftAction, reassignBookingAction } from "../actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Schedule log",
  robots: { index: false },
};

export default async function SchedulePage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; location?: string }>;
}) {
  await requireAdmin();
  const [{ date, location }, locations, team, allBookings] = await Promise.all([
    searchParams,
    getLocations(),
    getStaff(),
    getAllBookings(),
  ]);

  const today = nowInSAST().dateStr;
  const selectedDate = date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : today;
  const selectedLocation = locations.find((l) => l.slug === location) ?? locations[0];
  const schedule = selectedLocation
    ? await getScheduleForDate(selectedLocation.id, selectedDate)
    : [];
  const bookings = allBookings
    .filter((booking) => booking.bookingDate === selectedDate)
    .filter((booking) => !selectedLocation || booking.locationId === selectedLocation.id)
    .sort((a, b) => a.startMinutes - b.startMinutes);
  const activeTeam = team.filter((person) => person.active);

  return (
    <div className="container-x py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Salon dashboard</p>
          <h1 className="mt-3 font-display text-4xl font-semibold">Schedule log</h1>
          <p className="mt-1 max-w-2xl text-sm text-mocha">
            Allocate braiders to branches, define working hours/capacity, and reassign bookings between staff.
          </p>
        </div>
        <Link href="/admin/staff" className="btn btn-dark px-5 py-2.5 text-xs">
          Manage staff
        </Link>
      </div>
      <AdminNav active="schedule" />

      <form className="card mt-8 grid gap-4 p-6 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <div>
          <label className="label" htmlFor="date">Date</label>
          <input id="date" name="date" type="date" className="input" defaultValue={selectedDate} />
        </div>
        <div>
          <label className="label" htmlFor="location">Location</label>
          <select id="location" name="location" className="input" defaultValue={selectedLocation?.slug}>
            {locations.map((loc) => (
              <option key={loc.id} value={loc.slug}>{loc.name}</option>
            ))}
          </select>
        </div>
        <button className="btn btn-dark" type="submit">View day</button>
      </form>

      <div className="mt-8 grid gap-8 lg:grid-cols-12">
        <section className="lg:col-span-5">
          <div className="card p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl font-semibold">Staff on duty</h2>
                <p className="mt-1 text-sm text-mocha">{formatDateLong(selectedDate)} · {selectedLocation?.name}</p>
              </div>
              <Badge tone="gold">{schedule.length} shifts</Badge>
            </div>

            <form action={addShiftAction} className="mt-6 grid gap-4">
              <input type="hidden" name="date" value={selectedDate} />
              <input type="hidden" name="locationId" value={selectedLocation?.id} />
              <div>
                <label className="label" htmlFor="staffId">Add braider/stylist</label>
                <select id="staffId" name="staffId" className="input" required>
                  <option value="">Choose staff</option>
                  {activeTeam.map((person) => (
                    <option key={person.id} value={person.id}>{person.name} — {person.role}</option>
                  ))}
                </select>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="label" htmlFor="startTime">Start</label>
                  <input id="startTime" name="startTime" type="time" className="input" defaultValue="07:30" />
                </div>
                <div>
                  <label className="label" htmlFor="endTime">End</label>
                  <input id="endTime" name="endTime" type="time" className="input" defaultValue="18:00" />
                </div>
                <div>
                  <label className="label" htmlFor="capacity">Capacity</label>
                  <input id="capacity" name="capacity" type="number" min="1" className="input" defaultValue="1" />
                </div>
              </div>
              <div>
                <label className="label" htmlFor="notes">Notes</label>
                <input id="notes" name="notes" className="input" placeholder="e.g. Centurion morning shift" />
              </div>
              <button type="submit" className="btn btn-gold w-fit">
                <Check className="h-4 w-4" /> Add shift
              </button>
            </form>

            <div className="mt-6 space-y-3">
              {schedule.map((shift) => (
                <div key={shift.id} className="rounded-2xl border border-linen bg-sand/40 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{shift.staff.name}</p>
                      <p className="text-xs text-mocha">
                        {formatMinutes(shift.startMinutes)} – {formatMinutes(shift.endMinutes)} · capacity {shift.capacity}
                      </p>
                      {shift.notes && <p className="mt-1 text-xs italic text-cocoa">{shift.notes}</p>}
                    </div>
                    <form action={deleteShiftAction.bind(null, shift.id)}>
                      <button type="submit" className="rounded-full bg-rose-100 p-2 text-rose-700 hover:bg-rose-200" aria-label="Delete shift">
                        <X className="h-4 w-4" />
                      </button>
                    </form>
                  </div>
                </div>
              ))}
              {schedule.length === 0 && (
                <p className="rounded-2xl bg-sand/60 p-4 text-sm text-mocha">
                  No explicit shifts yet. Until you add shifts for a date/location, public booking falls back to all active assigned staff so customers can still book.
                </p>
              )}
            </div>
          </div>
        </section>

        <section className="lg:col-span-7">
          <div className="card overflow-hidden">
            <div className="flex items-start justify-between gap-4 border-b border-linen p-6">
              <div>
                <h2 className="font-display text-2xl font-semibold">Bookings for this day</h2>
                <p className="mt-1 text-sm text-mocha">Reallocate a booking to a different braider/stylist here.</p>
              </div>
              <Badge tone={bookings.length > 0 ? "green" : "slate"}>{bookings.length} bookings</Badge>
            </div>
            {bookings.length === 0 ? (
              <p className="p-8 text-sm text-mocha">No bookings for this location/date yet.</p>
            ) : (
              <div className="divide-y divide-linen">
                {bookings.map((booking) => (
                  <div key={booking.id} className="p-5">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge tone={booking.status === "cancelled" ? "red" : booking.status === "pending" ? "amber" : "green"}>{booking.status}</Badge>
                          <span className="text-xs font-semibold text-mocha">{booking.reference}</span>
                        </div>
                        <h3 className="mt-2 font-display text-xl font-semibold">{booking.customerName}</h3>
                        <p className="mt-1 text-sm text-cocoa">{booking.service.name}</p>
                        <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-mocha">
                          <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {formatMinutes(booking.startMinutes)} – {formatMinutes(booking.endMinutes)}</span>
                          <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {booking.location.name}</span>
                          <span>{formatRands(booking.totalRands)}</span>
                        </div>
                        <p className="mt-2 text-xs text-mocha">
                          Current staff: <span className="font-semibold text-espresso">{booking.staff?.name ?? "Unassigned"}</span>
                        </p>
                      </div>
                      <form action={reassignBookingAction} className="flex min-w-52 flex-col gap-2">
                        <input type="hidden" name="bookingId" value={booking.id} />
                        <label className="label" htmlFor={`booking-staff-${booking.id}`}>Reassign to</label>
                        <select id={`booking-staff-${booking.id}`} name="staffId" className="input" defaultValue={booking.staffId ?? ""}>
                          <option value="">Choose staff</option>
                          {activeTeam.map((person) => (
                            <option key={person.id} value={person.id}>{person.name}</option>
                          ))}
                        </select>
                        <button type="submit" className="btn btn-dark px-4 py-2 text-xs">
                          <Scissors className="h-3.5 w-3.5" /> Reassign
                        </button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      <section className="mt-8 rounded-[2rem] border border-linen bg-white p-6">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-gold/15 text-gold-dark">
            <Calendar className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-display text-xl font-semibold">How the runner-up system works</h2>
            <p className="mt-2 text-sm leading-relaxed text-mocha">
              For each service, the booking engine tries the primary staff member first. If that person is already booked or not scheduled for that branch/time, it automatically tries the backup, then the tertiary option. Use Services → Assign braiders to set that order.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
