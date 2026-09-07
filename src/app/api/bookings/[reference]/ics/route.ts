import { getBookingByReference } from "@/lib/data";
import { BUSINESS } from "@/lib/constants";
import { parseDateStr } from "@/lib/utils";

export const dynamic = "force-dynamic";

function toUtcStamp(dateStr: string, minutesSAST: number) {
  const { y, m, d } = parseDateStr(dateStr);
  // SAST is UTC+2 with no daylight saving.
  const dt = new Date(Date.UTC(y, m - 1, d, 0, minutesSAST - 120));
  return dt.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

function escapeIcs(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/[,;]/g, (c) => `\\${c}`);
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ reference: string }> },
) {
  const { reference } = await params;
  const booking = await getBookingByReference(reference);
  if (!booking) {
    return new Response("Booking not found", { status: 404 });
  }

  const location = booking.address ?? `${booking.location.name}, ${booking.location.addressLine}`;
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:-//${BUSINESS.name}//Booking//EN`,
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${booking.reference}@giftedhandssalon`,
    `DTSTAMP:${toUtcStamp(booking.bookingDate, booking.startMinutes)}`,
    `DTSTART:${toUtcStamp(booking.bookingDate, booking.startMinutes)}`,
    `DTEND:${toUtcStamp(booking.bookingDate, booking.endMinutes)}`,
    `SUMMARY:${escapeIcs(`${booking.service.name} — ${BUSINESS.shortName}`)}`,
    `LOCATION:${escapeIcs(location)}`,
    `DESCRIPTION:${escapeIcs(
      `Reference ${booking.reference}. Please arrive with clean, blow-dried hair. Questions? WhatsApp ${BUSINESS.phoneDisplay}.`,
    )}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return new Response(lines.join("\r\n"), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="giftedhands-${booking.reference}.ics"`,
    },
  });
}
