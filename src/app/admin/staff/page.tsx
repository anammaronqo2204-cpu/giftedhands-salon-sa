import type { Metadata } from "next";
import Link from "next/link";
import { AdminNav } from "@/components/admin-nav";
import { Check, Scissors, X } from "@/components/icons";
import { Badge } from "@/components/ui";
import { requireAdmin } from "@/lib/admin-auth";
import { getStaff, getStaffForService, getServices } from "@/lib/data";
import { deactivateStaffAction, deleteStaffAction, upsertStaffAction } from "../actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Manage braiders & stylists",
  robots: { index: false },
};

export default async function StaffPage() {
  await requireAdmin();
  const [team, services] = await Promise.all([getStaff(), getServices()]);
  const serviceAssignments = await Promise.all(
    services.map(async (service) => ({ service, staff: await getStaffForService(service.id) })),
  );

  return (
    <div className="container-x py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Salon dashboard</p>
          <h1 className="mt-3 font-display text-4xl font-semibold">Braiders & stylists</h1>
          <p className="mt-1 max-w-2xl text-sm text-mocha">
            Add staff, rename them, set role/notes, and deactivate anyone who is no longer taking bookings.
          </p>
        </div>
        <Link href="/admin/schedule" className="btn btn-dark px-5 py-2.5 text-xs">
          Open schedule log
        </Link>
      </div>
      <AdminNav active="staff" />

      <section className="card mt-8 p-6">
        <h2 className="font-display text-2xl font-semibold">Add a braider or stylist</h2>
        <StaffForm />
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {team.map((person) => {
          const assigned = serviceAssignments
            .filter((row) => row.staff.some((s) => s.staffId === person.id))
            .map((row) => row.service.name);
          return (
            <article key={person.id} className="card p-6">
              <div className="flex items-start gap-4">
                <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-espresso text-gold">
                  <Scissors className="h-7 w-7" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-display text-2xl font-semibold">{person.name}</h2>
                    <Badge tone={person.active ? "green" : "red"}>{person.active ? "Active" : "Inactive"}</Badge>
                    <Badge tone="gold">{person.role}</Badge>
                  </div>
                  {person.bio && <p className="mt-2 text-sm text-mocha">{person.bio}</p>}
                  <p className="mt-3 text-xs text-cocoa">
                    <span className="font-semibold">Default on:</span>{" "}
                    {assigned.length > 0 ? assigned.join(", ") : "No services yet"}
                  </p>
                </div>
              </div>

              <details className="mt-5 rounded-2xl border border-linen bg-sand/30 p-4">
                <summary className="cursor-pointer text-sm font-semibold">Edit staff member</summary>
                <StaffForm person={person} />
                <div className="mt-4 flex flex-wrap gap-2">
                  <form action={deactivateStaffAction.bind(null, person.id)}>
                    <button type="submit" className="btn btn-outline-dark px-4 py-2 text-xs">
                      <X className="h-3.5 w-3.5" /> Deactivate
                    </button>
                  </form>
                  <form action={deleteStaffAction.bind(null, person.id)}>
                    <button type="submit" className="btn border border-rose-200 bg-rose-100 px-4 py-2 text-xs text-rose-800 hover:bg-rose-200">
                      Delete / archive
                    </button>
                  </form>
                </div>
              </details>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function StaffForm({ person }: { person?: Awaited<ReturnType<typeof getStaff>>[number] }) {
  return (
    <form action={upsertStaffAction} className="mt-5 grid gap-4 sm:grid-cols-2">
      {person && <input type="hidden" name="id" value={person.id} />}
      <div>
        <label className="label" htmlFor={`staff-name-${person?.id ?? "new"}`}>Name</label>
        <input id={`staff-name-${person?.id ?? "new"}`} name="name" className="input" defaultValue={person?.name ?? ""} required />
      </div>
      <div>
        <label className="label" htmlFor={`role-${person?.id ?? "new"}`}>Role</label>
        <select id={`role-${person?.id ?? "new"}`} name="role" className="input" defaultValue={person?.role ?? "braider"}>
          <option value="braider">Braider</option>
          <option value="stylist">Stylist</option>
        </select>
      </div>
      <div>
        <label className="label" htmlFor={`sort-${person?.id ?? "new"}`}>Sort order</label>
        <input id={`sort-${person?.id ?? "new"}`} name="sortOrder" type="number" className="input" defaultValue={person?.sortOrder ?? 999} />
      </div>
      <div>
        <label className="label" htmlFor={`avatar-${person?.id ?? "new"}`}>Avatar URL</label>
        <input id={`avatar-${person?.id ?? "new"}`} name="avatar" className="input" defaultValue={person?.avatar ?? "/images/staff-avatar.png"} />
      </div>
      <div className="sm:col-span-2">
        <label className="label" htmlFor={`bio-${person?.id ?? "new"}`}>Notes / bio</label>
        <textarea id={`bio-${person?.id ?? "new"}`} name="bio" className="input min-h-24" defaultValue={person?.bio ?? ""} />
      </div>
      <label className="inline-flex items-center gap-2 text-sm font-semibold text-cocoa sm:col-span-2">
        <input type="checkbox" name="active" defaultChecked={person?.active ?? true} className="h-4 w-4 rounded border-linen text-gold" />
        Active and bookable
      </label>
      <div className="sm:col-span-2">
        <button type="submit" className="btn btn-gold">
          <Check className="h-4 w-4" /> {person ? "Save staff" : "Add staff"}
        </button>
      </div>
    </form>
  );
}
