import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminNav } from "@/components/admin-nav";
import { Check, ChevronLeft, Scissors } from "@/components/icons";
import { Badge } from "@/components/ui";
import { STAFF_PRIORITY_LABELS } from "@/db/schema";
import { requireAdmin } from "@/lib/admin-auth";
import { getServiceBySlugAnyStatus, getStaff, getStaffForService } from "@/lib/data";
import { saveServiceStaffAction } from "../../../actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Assign service staff",
  robots: { index: false },
};

export default async function ServiceStaffPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await requireAdmin();
  const { slug } = await params;
  const service = await getServiceBySlugAnyStatus(slug);
  if (!service) notFound();

  const [team, assigned] = await Promise.all([getStaff(), getStaffForService(service.id)]);
  const activeTeam = team.filter((person) => person.active);
  const byPriority = new Map(assigned.map((row) => [row.priority, row.staffId]));

  return (
    <div className="container-x py-10">
      <Link href="/admin/services" className="inline-flex items-center gap-1 text-sm font-semibold text-mocha hover:text-espresso">
        <ChevronLeft className="h-4 w-4" /> Back to services
      </Link>
      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Service assignment</p>
          <h1 className="mt-3 font-display text-4xl font-semibold">{service.name}</h1>
          <p className="mt-1 max-w-2xl text-sm text-mocha">
            Choose the primary braider/stylist for this service. The booking system tries #1 first, then #2, then #3 if someone is already busy.
          </p>
        </div>
        <Link href={`/admin/services/${service.slug}/images`} className="btn btn-dark px-5 py-2.5 text-xs">
          Manage images
        </Link>
      </div>
      <AdminNav active="services" />

      <section className="card mt-8 p-6 sm:p-8">
        <h2 className="font-display text-2xl font-semibold">Default staff order</h2>
        <form action={saveServiceStaffAction} className="mt-6 grid gap-5 md:grid-cols-3">
          <input type="hidden" name="serviceId" value={service.id} />
          {[
            ["primaryStaffId", 1],
            ["backupStaffId", 2],
            ["tertiaryStaffId", 3],
          ].map(([name, priority]) => (
            <div key={name}>
              <label className="label" htmlFor={String(name)}>{STAFF_PRIORITY_LABELS[Number(priority)]}</label>
              <select id={String(name)} name={String(name)} className="input" defaultValue={byPriority.get(Number(priority)) ?? ""}>
                <option value="">No staff selected</option>
                {activeTeam.map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.name} — {person.role}
                  </option>
                ))}
              </select>
            </div>
          ))}
          <div className="md:col-span-3">
            <button type="submit" className="btn btn-gold">
              <Check className="h-4 w-4" /> Save staff order
            </button>
          </div>
        </form>
      </section>

      <section className="mt-8 grid gap-5 md:grid-cols-3">
        {assigned.map((row) => (
          <div key={row.id} className="card p-6">
            <div className="flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-espresso text-gold">
                <Scissors className="h-6 w-6" />
              </span>
              <div>
                <Badge tone="gold">{STAFF_PRIORITY_LABELS[row.priority] ?? `Priority ${row.priority}`}</Badge>
                <h3 className="mt-1 font-display text-xl font-semibold">{row.staff.name}</h3>
                <p className="text-xs text-mocha">{row.staff.role}</p>
              </div>
            </div>
            {row.staff.bio && <p className="mt-4 text-sm text-mocha">{row.staff.bio}</p>}
          </div>
        ))}
        {assigned.length === 0 && (
          <p className="card p-6 text-sm text-mocha md:col-span-3">
            No staff assigned yet. Pick a primary and backups above.
          </p>
        )}
      </section>
    </div>
  );
}
