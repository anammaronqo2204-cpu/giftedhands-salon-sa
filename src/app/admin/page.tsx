import type { Metadata } from "next";
import Link from "next/link";
import { AdminNav } from "@/components/admin-nav";
import { Calendar, Check, Clock, Scissors, Star, X } from "@/components/icons";
import { Badge, StarRating } from "@/components/ui";
import { STATUS_LABELS } from "@/lib/constants";
import { getAllBookings, getAllReviews, type BookingWithDetails } from "@/lib/data";
import { requireAdmin } from "@/lib/admin-auth";
import {
  addDays,
  cn,
  formatCreatedAt,
  formatDateShort,
  formatMinutes,
  formatRands,
  nowInSAST,
} from "@/lib/utils";
import {
  deleteReview,
  logoutAction,
  setReviewApproval,
  updateBookingStatus,
} from "./actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Salon dashboard",
  robots: { index: false },
};

const VIEWS = [
  { key: "upcoming", label: "Upcoming" },
  { key: "today", label: "Today" },
  { key: "pending", label: "Needs confirmation" },
  { key: "all", label: "All" },
  { key: "cancelled", label: "Cancelled" },
] as const;

type ViewKey = (typeof VIEWS)[number]["key"];

const TONE: Record<string, "amber" | "green" | "slate" | "red"> = {
  pending: "amber",
  confirmed: "green",
  completed: "slate",
  cancelled: "red",
};

function byDateAsc(a: BookingWithDetails, b: BookingWithDetails) {
  return a.bookingDate === b.bookingDate
    ? a.startMinutes - b.startMinutes
    : a.bookingDate.localeCompare(b.bookingDate);
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  await requireAdmin();
  const { view: rawView } = await searchParams;
  const view: ViewKey = VIEWS.some((v) => v.key === rawView) ? (rawView as ViewKey) : "upcoming";

  const [all, allReviews] = await Promise.all([getAllBookings(), getAllReviews()]);
  const { dateStr: today } = nowInSAST();
  const weekEnd = addDays(today, 7);
  const monthPrefix = today.slice(0, 7);

  const todays = all.filter((b) => b.bookingDate === today && b.status !== "cancelled");
  const pending = all.filter((b) => b.status === "pending" && b.bookingDate >= today);
  const thisWeek = all.filter(
    (b) => b.bookingDate >= today && b.bookingDate < weekEnd && b.status !== "cancelled",
  );
  const monthRevenue = all
    .filter(
      (b) =>
        b.bookingDate.startsWith(monthPrefix) &&
        (b.status === "confirmed" || b.status === "completed"),
    )
    .reduce((sum, b) => sum + b.totalRands, 0);

  let rows: BookingWithDetails[];
  switch (view) {
    case "today":
      rows = todays.slice().sort(byDateAsc);
      break;
    case "pending":
      rows = pending.slice().sort(byDateAsc);
      break;
    case "cancelled":
      rows = all.filter((b) => b.status === "cancelled");
      break;
    case "all":
      rows = all;
      break;
    default:
      rows = all
        .filter((b) => b.bookingDate >= today && b.status !== "cancelled")
        .sort(byDateAsc);
  }

  const pendingReviews = allReviews.filter((r) => !r.approved);
  const approvedReviews = allReviews.filter((r) => r.approved);

  return (
    <div className="container-x py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Salon dashboard</p>
          <h1 className="mt-3 font-display text-4xl font-semibold">Bookings</h1>
          <p className="mt-1 text-sm text-mocha">Today is {formatDateShort(today)} (SAST).</p>
        </div>
        <div className="flex gap-2">
          <Link href="/book" className="btn btn-outline-dark px-5 py-2.5 text-xs">
            New booking
          </Link>
          <form action={logoutAction}>
            <button type="submit" className="btn btn-dark px-5 py-2.5 text-xs">
              Sign out
            </button>
          </form>
        </div>
      </div>
      <AdminNav active="bookings" />

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={Calendar} label="Today" value={String(todays.length)} sub="appointments" />
        <Stat icon={Clock} label="Needs confirmation" value={String(pending.length)} sub="pending bookings" highlight={pending.length > 0} />
        <Stat icon={Check} label="Next 7 days" value={String(thisWeek.length)} sub="booked slots" />
        <Stat icon={Star} label="This month" value={formatRands(monthRevenue)} sub="confirmed & completed" />
      </div>

      <div className="mt-10 flex flex-wrap gap-2">
        {VIEWS.map((v) => (
          <Link
            key={v.key}
            href={`/admin?view=${v.key}`}
            className={cn(
              "rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] transition",
              view === v.key
                ? "border-espresso bg-espresso text-cream"
                : "border-linen bg-white text-cocoa hover:border-espresso",
            )}
          >
            {v.label}
            {v.key === "pending" && pending.length > 0 && (
              <span className="ml-2 rounded-full bg-gold px-1.5 py-0.5 text-[10px] text-espresso">{pending.length}</span>
            )}
          </Link>
        ))}
      </div>

      <div className="card mt-4 overflow-hidden">
        {rows.length === 0 ? (
          <p className="p-10 text-center text-sm text-mocha">No bookings in this view yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[56rem] text-left text-sm">
              <thead className="bg-sand/60 text-[10px] font-bold uppercase tracking-[0.18em] text-mocha">
                <tr>
                  <th className="px-5 py-3">When</th>
                  <th className="px-5 py-3">Client</th>
                  <th className="px-5 py-3">Style</th>
                  <th className="px-5 py-3">Braider</th>
                  <th className="px-5 py-3">Where</th>
                  <th className="px-5 py-3">Total</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-linen">
                {rows.map((b) => (
                  <tr key={b.id} className="align-top hover:bg-sand/30">
                    <td className="px-5 py-4">
                      <p className="font-semibold">{formatDateShort(b.bookingDate)}</p>
                      <p className="text-xs text-mocha">
                        {formatMinutes(b.startMinutes)} – {formatMinutes(b.endMinutes)}
                      </p>
                      <p className="mt-1 font-mono text-[11px] text-mocha">{b.reference}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-semibold">{b.customerName}</p>
                      <a
                        href={`https://wa.me/${b.phone.replace(/\D/g, "")}?text=${encodeURIComponent(
                          `Hi ${b.customerName.split(" ")[0]}, this is Giftedhands Salon confirming your ${b.service.name} on ${formatDateShort(b.bookingDate)} at ${formatMinutes(b.startMinutes)} (ref ${b.reference}). See you soon!`,
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-semibold text-emerald-700 hover:underline"
                      >
                        {b.phone}
                      </a>
                      {b.email && <p className="text-xs text-mocha">{b.email}</p>}
                      {b.notes && <p className="mt-1 max-w-xs text-xs italic text-cocoa">“{b.notes}”</p>}
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-semibold">{b.service.name}</p>
                      <p className="text-xs text-mocha">{Math.round(b.service.durationMinutes / 60 * 10) / 10} hrs</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="inline-flex items-center gap-1 font-semibold">
                        <Scissors className="h-3.5 w-3.5 text-gold-dark" /> {b.staff?.name ?? "Unassigned"}
                      </p>
                      <Link href={`/admin/schedule?date=${b.bookingDate}&location=${b.location.slug}`} className="text-xs font-semibold text-gold-dark hover:underline">
                        Reallocate
                      </Link>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-semibold">{b.location.name}</p>
                      {b.address && <p className="max-w-[14rem] text-xs text-mocha">{b.address}</p>}
                    </td>
                    <td className="px-5 py-4 font-semibold">{formatRands(b.totalRands)}</td>
                    <td className="px-5 py-4">
                      <Badge tone={TONE[b.status]}>{STATUS_LABELS[b.status]}</Badge>
                      <p className="mt-1 text-[11px] text-mocha">booked {formatCreatedAt(b.createdAt)}</p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap justify-end gap-1.5">
                        {b.status === "pending" && (
                          <>
                            <ActionButton action={updateBookingStatus.bind(null, b.id, "confirmed")} tone="green">
                              Confirm
                            </ActionButton>
                            <ActionButton action={updateBookingStatus.bind(null, b.id, "cancelled")} tone="red">
                              Cancel
                            </ActionButton>
                          </>
                        )}
                        {b.status === "confirmed" && (
                          <>
                            <ActionButton action={updateBookingStatus.bind(null, b.id, "completed")} tone="dark">
                              Complete
                            </ActionButton>
                            <ActionButton action={updateBookingStatus.bind(null, b.id, "cancelled")} tone="red">
                              Cancel
                            </ActionButton>
                          </>
                        )}
                        {b.status === "cancelled" && (
                          <ActionButton action={updateBookingStatus.bind(null, b.id, "pending")} tone="dark">
                            Restore
                          </ActionButton>
                        )}
                        {b.status === "completed" && (
                          <ActionButton action={updateBookingStatus.bind(null, b.id, "confirmed")} tone="slate">
                            Reopen
                          </ActionButton>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <section className="mt-14 grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="font-display text-2xl font-semibold">
            Reviews awaiting approval{" "}
            {pendingReviews.length > 0 && (
              <span className="ml-1 rounded-full bg-gold px-2 py-0.5 text-xs text-espresso">{pendingReviews.length}</span>
            )}
          </h2>
          <div className="mt-4 space-y-3">
            {pendingReviews.length === 0 && (
              <p className="card p-6 text-sm text-mocha">Nothing to moderate — you&apos;re all caught up.</p>
            )}
            {pendingReviews.map((r) => (
              <div key={r.id} className="card p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <StarRating rating={r.rating} />
                    <p className="mt-1 font-semibold">{r.customerName}</p>
                    <p className="text-xs text-mocha">
                      {r.serviceName ? `${r.serviceName} · ` : ""}
                      {formatCreatedAt(r.createdAt)}
                    </p>
                  </div>
                  <div className="flex gap-1.5">
                    <ActionButton action={setReviewApproval.bind(null, r.id, true)} tone="green">
                      <Check className="h-3.5 w-3.5" /> Approve
                    </ActionButton>
                    <ActionButton action={deleteReview.bind(null, r.id)} tone="red">
                      <X className="h-3.5 w-3.5" /> Delete
                    </ActionButton>
                  </div>
                </div>
                <p className="mt-3 text-sm text-cocoa">{r.comment}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="font-display text-2xl font-semibold">Published reviews ({approvedReviews.length})</h2>
          <div className="mt-4 max-h-[36rem] space-y-3 overflow-y-auto pr-1">
            {approvedReviews.map((r) => (
              <div key={r.id} className="card p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <StarRating rating={r.rating} />
                    <p className="mt-1 font-semibold">{r.customerName}</p>
                    <p className="text-xs text-mocha">{r.serviceName ?? "—"}</p>
                  </div>
                  <div className="flex gap-1.5">
                    <ActionButton action={setReviewApproval.bind(null, r.id, false)} tone="slate">
                      Hide
                    </ActionButton>
                    <ActionButton action={deleteReview.bind(null, r.id)} tone="red">
                      Delete
                    </ActionButton>
                  </div>
                </div>
                <p className="mt-3 line-clamp-3 text-sm text-cocoa">{r.comment}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  sub,
  highlight = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub: string;
  highlight?: boolean;
}) {
  return (
    <div className={cn("card p-5", highlight && "border-gold ring-2 ring-gold/30")}>
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-mocha">{label}</p>
        <span className="grid h-8 w-8 place-items-center rounded-xl bg-gold/15 text-gold-dark">
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-3 font-display text-3xl font-semibold">{value}</p>
      <p className="text-xs text-mocha">{sub}</p>
    </div>
  );
}

function ActionButton({
  action,
  tone,
  children,
}: {
  action: () => Promise<void>;
  tone: "green" | "red" | "dark" | "slate";
  children: React.ReactNode;
}) {
  const tones = {
    green: "bg-emerald-600 text-white hover:bg-emerald-700",
    red: "bg-rose-100 text-rose-800 hover:bg-rose-200",
    dark: "bg-espresso text-cream hover:bg-cocoa",
    slate: "bg-slate-100 text-slate-700 hover:bg-slate-200",
  };
  return (
    <form action={action}>
      <button
        type="submit"
        className={cn(
          "inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.1em] transition",
          tones[tone],
        )}
      >
        {children}
      </button>
    </form>
  );
}
