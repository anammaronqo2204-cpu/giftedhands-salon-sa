export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function formatRands(amount: number, from = false) {
  const digits = Math.round(amount).toString();
  const grouped = digits.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${from ? "from " : ""}R${grouped}`;
}

export function formatMinutes(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

export function formatDuration(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} ${h === 1 ? "hr" : "hrs"}`;
  return `${h} ${h === 1 ? "hr" : "hrs"} ${m} min`;
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAY_NAMES_LONG = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const MONTH_NAMES_LONG = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function parseDateStr(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return { y, m, d };
}

export function dayOfWeek(dateStr: string) {
  const { y, m, d } = parseDateStr(dateStr);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

export function formatDateLong(dateStr: string) {
  const { y, m, d } = parseDateStr(dateStr);
  const dow = dayOfWeek(dateStr);
  return `${DAY_NAMES_LONG[dow]}, ${d} ${MONTH_NAMES_LONG[m - 1]} ${y}`;
}

export function formatDateShort(dateStr: string) {
  const { m, d } = parseDateStr(dateStr);
  const dow = dayOfWeek(dateStr);
  return `${DAY_NAMES[dow]} ${d} ${MONTH_NAMES[m - 1]}`;
}

export function dateParts(dateStr: string) {
  const { y, m, d } = parseDateStr(dateStr);
  const dow = dayOfWeek(dateStr);
  return {
    day: DAY_NAMES[dow],
    dayLong: DAY_NAMES_LONG[dow],
    date: d,
    month: MONTH_NAMES[m - 1],
    monthLong: MONTH_NAMES_LONG[m - 1],
    year: y,
  };
}

export function addDays(dateStr: string, days: number) {
  const { y, m, d } = parseDateStr(dateStr);
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  return dt.toISOString().slice(0, 10);
}

export function isValidDateStr(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const { y, m, d } = parseDateStr(value);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return (
    dt.getUTCFullYear() === y &&
    dt.getUTCMonth() === m - 1 &&
    dt.getUTCDate() === d
  );
}

/** Current date and time-of-day in South Africa (SAST, UTC+2, no DST). */
export function nowInSAST() {
  const shifted = new Date(Date.now() + 2 * 60 * 60 * 1000);
  const dateStr = shifted.toISOString().slice(0, 10);
  const minutes = shifted.getUTCHours() * 60 + shifted.getUTCMinutes();
  return { dateStr, minutes };
}

export function normalisePhone(raw: string) {
  const digits = raw.replace(/[^\d+]/g, "");
  if (digits.startsWith("+27")) return digits;
  if (digits.startsWith("27") && digits.length === 11) return `+${digits}`;
  if (digits.startsWith("0") && digits.length === 10) return `+27${digits.slice(1)}`;
  return digits;
}

export function isValidSAPhone(raw: string) {
  const normalised = normalisePhone(raw);
  return /^\+27\d{9}$/.test(normalised);
}

export function formatCreatedAt(date: Date) {
  return new Intl.DateTimeFormat("en-ZA", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Africa/Johannesburg",
  }).format(date);
}
