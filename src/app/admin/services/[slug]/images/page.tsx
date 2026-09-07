import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminNav } from "@/components/admin-nav";
import { Check, ChevronLeft, X } from "@/components/icons";
import { Badge, SmartImage } from "@/components/ui";
import { requireAdmin } from "@/lib/admin-auth";
import { getServiceBySlugAnyStatus, getServiceImages } from "@/lib/data";
import {
  deleteServiceImageAction,
  makeServiceImageMainAction,
  uploadServiceImageAction,
} from "../../../actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Manage service images",
  robots: { index: false },
};

export default async function ServiceImagesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await requireAdmin();
  const { slug } = await params;
  const service = await getServiceBySlugAnyStatus(slug);
  if (!service) notFound();
  const images = await getServiceImages(service.id);

  return (
    <div className="container-x py-10">
      <Link href="/admin/services" className="inline-flex items-center gap-1 text-sm font-semibold text-mocha hover:text-espresso">
        <ChevronLeft className="h-4 w-4" /> Back to services
      </Link>
      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Service photos</p>
          <h1 className="mt-3 font-display text-4xl font-semibold">{service.name}</h1>
          <p className="mt-1 max-w-2xl text-sm text-mocha">
            Upload a new photo from your phone, tablet or laptop. The first/main image is what customers see on service cards.
          </p>
        </div>
        <Link href={`/admin/services/${service.slug}/staff`} className="btn btn-dark px-5 py-2.5 text-xs">
          Assign braiders
        </Link>
      </div>
      <AdminNav active="services" />

      <section className="card mt-8 p-6 sm:p-8">
        <h2 className="font-display text-2xl font-semibold">Upload a photo</h2>
        <form action={uploadServiceImageAction} className="mt-5 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end" encType="multipart/form-data">
          <input type="hidden" name="serviceId" value={service.id} />
          <div>
            <label className="label" htmlFor="image">Choose image</label>
            <input
              id="image"
              name="image"
              type="file"
              accept="image/*"
              className="input file:mr-4 file:rounded-full file:border-0 file:bg-espresso file:px-4 file:py-2 file:text-xs file:font-bold file:text-cream"
              required
            />
          </div>
          <label className="inline-flex items-center gap-2 text-sm font-semibold text-cocoa sm:pb-3">
            <input type="checkbox" name="makeMain" defaultChecked className="h-4 w-4 rounded border-linen text-gold" />
            Make main image
          </label>
          <div className="sm:col-span-2">
            <button type="submit" className="btn btn-gold">
              <Check className="h-4 w-4" /> Upload image
            </button>
          </div>
        </form>
      </section>

      <section className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((image, index) => (
          <article key={image.id} className="card overflow-hidden">
            <div className="relative aspect-[4/5] bg-sand">
              <SmartImage src={image.imageUrl} alt={image.caption ?? service.name} sizes="(max-width: 1024px) 50vw, 33vw" />
              <div className="absolute left-3 top-3">
                <Badge tone={index === 0 ? "gold" : "light"}>{index === 0 ? "Main" : `#${index + 1}`}</Badge>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 p-4">
              <form action={makeServiceImageMainAction}>
                <input type="hidden" name="serviceId" value={service.id} />
                <input type="hidden" name="imageId" value={image.id} />
                <button type="submit" className="btn btn-dark px-4 py-2 text-xs" disabled={index === 0}>
                  Make main
                </button>
              </form>
              <form action={deleteServiceImageAction.bind(null, image.id)}>
                <button type="submit" className="btn border border-rose-200 bg-rose-100 px-4 py-2 text-xs text-rose-800 hover:bg-rose-200">
                  <X className="h-3.5 w-3.5" /> Remove
                </button>
              </form>
            </div>
          </article>
        ))}
        {images.length === 0 && (
          <p className="card p-8 text-sm text-mocha sm:col-span-2 lg:col-span-3">
            No uploaded images yet. Upload one above to replace the default public photo.
          </p>
        )}
      </section>
    </div>
  );
}
