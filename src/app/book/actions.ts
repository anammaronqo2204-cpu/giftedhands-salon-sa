"use server";

import { db } from "@/db";
import { bookings } from "@/db/schema";
import {
  generateReference,
  getAvailability,
  hoursForDate,
  isDateWithinWindow,
} from "@/lib/booking";
import { getLocationById, getServiceById } from "@/lib/data";
import { isValidDateStr, isValidSAPhone, normalisePhone } from "@/lib/utils";

export type SlotDTO = {
  startMinutes: number;
  endMinutes: number;
  label: string;
  available: boolean;
  staffId?: number;
  staffName?: string;
  staffPriority?: number;
};

export async function fetchAvailability(input: {
  serviceId: number;
  locationId: number;
  date: string;
}): Promise<{ slots: SlotDTO[]; closed: boolean }> {
  if (!isValidDateStr(input.date) || !isDateWithinWindow(input.date)) {
    return { slots: [], closed: true };
  }
  const [service, location] = await Promise.all([
    getServiceById(input.serviceId),
    getLocationById(input.locationId),
  ]);
  if (!service || !location) return { slots: [], closed: true };
  if (!hoursForDate(input.date)) return { slots: [], closed: true };

  const slots = await getAvailability(location, service, input.date);
  return { slots, closed: false };
}

export type BookingInput = {
  serviceId: number;
  locationId: number;
  date: string;
  startMinutes: number;
  name: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
};

export type BookingResult =
  | { ok: true; reference: string }
  | { ok: false; error: string };

export async function createBooking(input: BookingInput): Promise<BookingResult> {
  const name = input.name.trim();
  const phone = input.phone.trim();
  const email = input.email.trim();
  const address = input.address.trim();
  const notes = input.notes.trim();

  if (name.length < 2) return { ok: false, error: "Please enter your full name." };
  if (!isValidSAPhone(phone)) {
    return { ok: false, error: "Please enter a valid South African mobile number (e.g. 063 827 9114)." };
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "That email address doesn't look right." };
  }
  if (!isValidDateStr(input.date) || !isDateWithinWindow(input.date)) {
    return { ok: false, error: "Please choose a date within the next few weeks." };
  }

  const [service, location] = await Promise.all([
    getServiceById(input.serviceId),
    getLocationById(input.locationId),
  ]);
  if (!service || !service.active) return { ok: false, error: "That service is no longer available." };
  if (!location) return { ok: false, error: "Please choose a location." };
  if (service.centurionOnly && location.slug !== "centurion") {
    return { ok: false, error: `${service.name} is only available at our Centurion branch.` };
  }
  if (location.isHouseCall && address.length < 8) {
    return { ok: false, error: "Please enter the full address for your house call." };
  }

  const slots = await getAvailability(location, service, input.date);
  const slot = slots.find((s) => s.startMinutes === input.startMinutes);
  if (!slot || !slot.available || !slot.staffId) {
    return {
      ok: false,
      error: "Sorry, that time was just taken. Please pick another slot.",
    };
  }

  const totalRands = service.priceRands + location.callOutFeeRands;

  for (let attempt = 0; attempt < 5; attempt++) {
    const reference = generateReference();
    try {
      await db.insert(bookings).values({
        reference,
        serviceId: service.id,
        locationId: location.id,
        staffId: slot.staffId,
        customerName: name,
        phone: normalisePhone(phone),
        email: email || null,
        bookingDate: input.date,
        startMinutes: slot.startMinutes,
        endMinutes: slot.endMinutes,
        address: location.isHouseCall ? address : null,
        notes: notes || null,
        totalRands,
        status: "pending",
      });
      return { ok: true, reference };
    } catch (err) {
      const code = (err as { code?: string }).code;
      if (code !== "23505") {
        console.error("Failed to create booking", err);
        return { ok: false, error: "Something went wrong saving your booking. Please try again." };
      }
    }
  }
  return { ok: false, error: "Could not generate a booking reference. Please try again." };
}
