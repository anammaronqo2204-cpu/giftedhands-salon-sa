import { db } from "@/db";
import {
  bookings,
  serviceStaff,
  staff,
  staffSchedule,
  type Location,
  type Service,
  type Staff,
} from "@/db/schema";
import { and, asc, eq, ne } from "drizzle-orm";
import { randomBytes } from "node:crypto";
import {
  BOOKING_WINDOW_DAYS,
  HOURS,
  MIN_LEAD_MINUTES,
  SLOT_STEP_MINUTES,
} from "./constants";
import { addDays, dayOfWeek, formatMinutes, nowInSAST } from "./utils";

export type Slot = {
  startMinutes: number;
  endMinutes: number;
  label: string;
  available: boolean;
  staffId?: number;
  staffName?: string;
  staffPriority?: number;
};

export type DayOption = {
  dateStr: string;
  open: boolean;
};

type ExistingBooking = {
  staffId: number | null;
  locationId: number;
  startMinutes: number;
  endMinutes: number;
};

type Candidate = Staff & { priority: number };

export function hoursForDate(dateStr: string) {
  return HOURS[dayOfWeek(dateStr)] ?? null;
}

/** The list of bookable days starting today (SAST). */
export function getBookableDays(): DayOption[] {
  const { dateStr: today } = nowInSAST();
  const days: DayOption[] = [];
  for (let i = 0; i < BOOKING_WINDOW_DAYS; i++) {
    const dateStr = addDays(today, i);
    days.push({ dateStr, open: hoursForDate(dateStr) !== null });
  }
  return days;
}

export function isDateWithinWindow(dateStr: string) {
  const { dateStr: today } = nowInSAST();
  const last = addDays(today, BOOKING_WINDOW_DAYS - 1);
  return dateStr >= today && dateStr <= last;
}

function overlaps(startA: number, endA: number, startB: number, endB: number) {
  return startA < endB && endA > startB;
}

async function getCandidates(service: Service): Promise<Candidate[]> {
  const mapped = await db
    .select({ s: staff, priority: serviceStaff.priority })
    .from(serviceStaff)
    .innerJoin(staff, eq(serviceStaff.staffId, staff.id))
    .where(
      and(
        eq(serviceStaff.serviceId, service.id),
        eq(serviceStaff.active, true),
        eq(staff.active, true),
      ),
    )
    .orderBy(asc(serviceStaff.priority), asc(staff.sortOrder), asc(staff.name));

  if (mapped.length > 0) {
    return mapped.map((row) => ({ ...row.s, priority: row.priority }));
  }

  const all = await db
    .select()
    .from(staff)
    .where(eq(staff.active, true))
    .orderBy(asc(staff.sortOrder), asc(staff.name));

  return all.map((s) => ({ ...s, priority: 99 }));
}

export async function findAvailableStaffForSlot(
  location: Location,
  service: Service,
  dateStr: string,
  startMinutes: number,
): Promise<Candidate | null> {
  const endMinutes = startMinutes + service.durationMinutes;
  const candidates = await getCandidates(service);

  if (candidates.length === 0) return null;

  const [daySchedules, existing] = await Promise.all([
    db
      .select()
      .from(staffSchedule)
      .where(
        and(
          eq(staffSchedule.locationId, location.id),
          eq(staffSchedule.date, dateStr),
        ),
      ),
    db
      .select({
        staffId: bookings.staffId,
        locationId: bookings.locationId,
        startMinutes: bookings.startMinutes,
        endMinutes: bookings.endMinutes,
      })
      .from(bookings)
      .where(
        and(
          eq(bookings.bookingDate, dateStr),
          ne(bookings.status, "cancelled"),
        ),
      ),
  ]);

  const hasExplicitSchedule = daySchedules.length > 0;
  const candidateIds = new Set(candidates.map((candidate) => candidate.id));
  const scheduledCandidateIds = new Set(
    daySchedules
      .filter((row) => candidateIds.has(row.staffId))
      .map((row) => row.staffId),
  );

  for (const candidate of candidates) {
    const coveringShifts = daySchedules.filter(
      (shift) =>
        shift.staffId === candidate.id &&
        shift.startMinutes <= startMinutes &&
        shift.endMinutes >= endMinutes,
    );

    // If any schedule exists for this branch/date, honour it strictly. If there
    // is no explicit schedule at all yet, fall back to all active mapped staff
    // so the site remains bookable while the salon builds out schedules.
    if (hasExplicitSchedule && coveringShifts.length === 0) {
      continue;
    }

    // Capacity usually equals 1, but this allows a lead braider to supervise a
    // helper/team and carry more than one appointment at once if admin sets it.
    const capacity = hasExplicitSchedule
      ? Math.max(...coveringShifts.map((shift) => shift.capacity), 1)
      : 1;

    const busyCount = existing.filter(
      (booking: ExistingBooking) =>
        booking.staffId === candidate.id &&
        overlaps(startMinutes, endMinutes, booking.startMinutes, booking.endMinutes),
    ).length;

    // Extra branch guard: if a branch schedule exists and this staff member is
    // scheduled elsewhere, don't double-use them at the same time.
    const elsewhereBusy = existing.some(
      (booking: ExistingBooking) =>
        booking.staffId === candidate.id &&
        booking.locationId !== location.id &&
        overlaps(startMinutes, endMinutes, booking.startMinutes, booking.endMinutes),
    );

    if (busyCount < capacity && !elsewhereBusy) {
      return candidate;
    }
  }

  // If admin has created schedules but none include any mapped staff, fall back
  // to location capacity so the public side does not appear broken.
  if (hasExplicitSchedule && scheduledCandidateIds.size === 0) return null;

  return null;
}

export async function getAvailability(
  location: Location,
  service: Service,
  dateStr: string,
): Promise<Slot[]> {
  const hours = hoursForDate(dateStr);
  if (!hours) return [];

  const { dateStr: today, minutes: nowMinutes } = nowInSAST();
  const duration = service.durationMinutes;
  const slots: Slot[] = [];

  for (
    let start = hours.open;
    start + duration <= hours.close;
    start += SLOT_STEP_MINUTES
  ) {
    const end = start + duration;
    const inPast =
      dateStr < today ||
      (dateStr === today && start < nowMinutes + MIN_LEAD_MINUTES);
    const availableStaff = inPast
      ? null
      : await findAvailableStaffForSlot(location, service, dateStr, start);

    slots.push({
      startMinutes: start,
      endMinutes: end,
      label: formatMinutes(start),
      available: Boolean(availableStaff),
      staffId: availableStaff?.id,
      staffName: availableStaff?.name,
      staffPriority: availableStaff?.priority,
    });
  }

  return slots;
}

const REF_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateReference() {
  const bytes = randomBytes(6);
  let out = "";
  for (let i = 0; i < 6; i++) {
    out += REF_ALPHABET[bytes[i] % REF_ALPHABET.length];
  }
  return `GH-${out}`;
}
