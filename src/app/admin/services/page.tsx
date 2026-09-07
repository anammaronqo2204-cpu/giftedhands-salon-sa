import type { Metadata } from "next";
import Link from "next/link";
import { AdminNav } from "@/components/admin-nav";
import { ArrowRight, Calendar, Check, X } from "@/components/icons";
import { Badge, SmartImage } from "@/components/ui";
import { requireAdmin } from "@/lib/admin-auth";
import { CATEGORIES, categoryLabel } from "@/lib/constants";
import { getAllServices, getServiceImages, getStaffForService } from "@/lib/data";
import { formatDuration, formatRands } from "@/lib/utils";
import { archiveServiceAction, deleteServiceAction, upsertServiceAction } from "../actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Manage services",
  robots: { index: false },
};

export default async function AdminServicesPage() {
  await requireAdmin();
  const services = await getAllServices();
  const cards = await Promise.all(
    services.map(async (service) => ({
      service,
      images: await getServiceImages(service.id),
      staff: await getStaffForService(service.id),
    })),
  );

  return (
    <div className="container-x py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Salon dashboard</p>
          <h1 className="mt-3 font-display text-4xl font-semibold">Services & images</h1>
          <p className="mt-1 max-w-2xl text-sm text-mocha">
            Edit names, prices, durations and customer-facing photos. Uploaded photos immediately appear on the public services and gallery pages.
          </p>
        </div>
        <Link href="/admin" className="btn btn-dark px-5 py-2.5 text-xs">
          Back to bookings
        </Link>
      </div>
      <AdminNav active="services" />

      <section className="card mt-8 p-6">
        <h2 className="font-display text-2xl font-semibold">Add a new service</h2>
        <ServiceForm />
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {cards.map(({ service, images, staff }) => (
          <article key={service.id} className="card overflow-hidden">
            <div className="grid gap-0 sm:grid-cols-[13rem_1fr]">
              <div className="relative min-h-72 bg-sand sm:min-h-full">
                <SmartImage src={service.imageUrl} alt={service.name} sizes="260px" />
                <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                  <Badge tone={service.active ? "green" : "red"}>{service.active ? "Live" : "Hidden"}</Badge>
                  {service.featured && <Badge tone="gold">Featured</Badge>}
                </div>
              </div>
              <div className="p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="gold">{categoryLabel(service.category)}</Badge>
                  <span className="text-xs font-semibold text-mocha">
                    {formatRands(service.priceRands, service.priceFrom)} · {formatDuration(service.durationMinutes)}
                  </span>
                </div>
                <h2 className="mt-3 font-display text-2xl font-semibold">{service.name}</h2>
                <p className="mt-1 text-sm text-mocha">{service.shortDescription}</p>
                <div className="mt-4 grid gap-2 text-xs text-cocoa sm:grid-cols-2">
                  <p><span className="font-semibold">Images:</span> {images.length}</p>
                  <p>
                    <span className="font-semibold">Default staff:</span>{" "}
                    {staff.length > 0 ? staff.map((s) => `${s.priority}. ${s.staff.name}`).join(", ") : "Not assigned"}
                  </p>
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Link href={`/admin/services/${service.slug}/images`} className="btn btn-dark px-4 py-2 text-xs">
                    Change photos <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                  <Link href={`/admin/services/${service.slug}/staff`} className="btn btn-outline-dark px-4 py-2 text-xs">
                    Assign braiders
                  </Link>
                  <Link href={`/services/${service.slug}`} className="btn btn-outline-dark px-4 py-2 text-xs">
                    Public page
                  </Link>
                </div>
              </div>
            </div>

            <details className="border-t border-linen bg-sand/30">
              <summary className="cursor-pointer px-5 py-4 text-sm font-semibold text-espresso">
                Edit service details
              </summary>
              <div className="p-5 pt-0">
                <ServiceForm service={service} />
                <div className="mt-4 flex flex-wrap gap-2">
                  <form action={archiveServiceAction.bind(null, service.id)}>
                    <button type="submit" className="btn btn-outline-dark px-4 py-2 text-xs">
                      <X className="h-3.5 w-3.5" /> Hide service
                    </button>
                  </form>
                  <form action={deleteServiceAction.bind(null, service.id)}>
                    <button type="submit" className="btn border border-rose-200 bg-rose-100 px-4 py-2 text-xs text-rose-800 hover:bg-rose-200">
                      Delete / archive
                    </button>
                  </form>
                </div>
              </div>
            </details>
          </article>
        ))}
      </div>
    </div>
  );
}

function ServiceForm({ service }: { service?: Awaited<ReturnType<typeof getAllServices>>[number] }) {
  return (
    <form action={upsertServiceAction} className="mt-5 grid gap-4 sm:grid-cols-2">
      {service && <input type="hidden" name="id" value={service.id} />}
      <div>
        <label className="label" htmlFor={`name-${service?.id ?? "new"}`}>Name</label>
        <input id={`name-${service?.id ?? "new"}`} name="name" className="input" defaultValue={service?.name ?? ""} required />
      </div>
      <div>
        <label className="label" htmlFor={`category-${service?.id ?? "new"}`}>Category</label>
        <select id={`category-${service?.id ?? "new"}`} name="category" className="input" defaultValue={service?.category ?? CATEGORIES[0].slug}>
          {CATEGORIES.map((category) => (
            <option key={category.slug} value={category.slug}>{category.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="label" htmlFor={`price-${service?.id ?? "new"}`}>Price (R)</label>
        <input id={`price-${service?.id ?? "new"}`} name="priceRands" className="input" type="number" min="0" defaultValue={service?.priceRands ?? 0} required />
      </div>
      <div>
        <label className="label" htmlFor={`duration-${service?.id ?? "new"}`}>Duration (minutes)</label>
        <input id={`duration-${service?.id ?? "new"}`} name="durationMinutes" className="input" type="number" min="15" step="15" defaultValue={service?.durationMinutes ?? 180} required />
      </div>
      <div>
        <label className="label" htmlFor={`sort-${service?.id ?? "new"}`}>Sort order</label>
        <input id={`sort-${service?.id ?? "new"}`} name="sortOrder" className="input" type="number" defaultValue={service?.sortOrder ?? 999} />
      </div>
      <div>
        <label className="label" htmlFor={`image-${service?.id ?? "new"}`}>Fallback image URL</label>
        <input id={`image-${service?.id ?? "new"}`} name="imageUrl" className="input" defaultValue={service?.imageUrl ?? "/images/services/twists.jpg"} />
      </div>
      <div className="sm:col-span-2">
        <label className="label" htmlFor={`short-${service?.id ?? "new"}`}>Short description</label>
        <input id={`short-${service?.id ?? "new"}`} name="shortDescription" className="input" defaultValue={service?.shortDescription ?? ""} />
      </div>
      <div className="sm:col-span-2">
        <label className="label" htmlFor={`desc-${service?.id ?? "new"}`}>Full description</label>
        <textarea id={`desc-${service?.id ?? "new"}`} name="description" className="input min-h-28" defaultValue={service?.description ?? ""} />
      </div>
      <div className="flex flex-wrap gap-4 sm:col-span-2">
        {[
          ["active", "Live on customer side"],
          ["featured", "Featured"],
          ["hairIncluded", "Hair included"],
          ["priceFrom", "Price says from"],
          ["centurionOnly", "Centurion only"],
        ].map(([name, label]) => (
          <label key={name} className="inline-flex items-center gap-2 text-sm font-semibold text-cocoa">
            <input
              type="checkbox"
              name={name}
              defaultChecked={
                service
                  ? Boolean(service[name as keyof typeof service])
                  : name === "active"
              }
              className="h-4 w-4 rounded border-linen text-gold"
            />
            {label}
          </label>
        ))}
      </div>
      <div className="sm:col-span-2">
        <button type="submit" className="btn btn-gold">
          <Check className="h-4 w-4" /> {service ? "Save changes" : "Add service"}
        </button>
      </div>
    </form>
  );
}
