import type { Metadata } from "next";
import Link from "next/link";
import { Instagram } from "@/components/icons";
import { PageHero, SmartImage } from "@/components/ui";
import { BUSINESS } from "@/lib/constants";
import { getAllServiceImages } from "@/lib/data";
import { GALLERY } from "@/lib/gallery";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "Browse recent knotless braids, goddess braids, French curl, Riverlocks, twists and kids braids by Giftedhands Salon SA.",
};

export default async function GalleryPage() {
  const uploaded = await getAllServiceImages();
  const items = uploaded.length
    ? uploaded.map((image, index) => ({
        src: image.imageUrl,
        alt: image.caption ?? image.service.name,
        style: image.service.name,
        href: `/services/${image.service.slug}`,
        tall: index % 5 === 0,
      }))
    : GALLERY.map((item) => ({ ...item, href: "/services" }));

  return (
    <>
      <PageHero
        eyebrow="Our work"
        title={
          <>
            Crowns we&apos;re <span className="gold-text">proud of.</span>
          </>
        }
        description="Every install is photographed fresh out of the chair. Tap any style to book it, or follow us on Instagram for daily inspiration."
      >
        <div className="flex flex-wrap gap-3">
          <a href={BUSINESS.instagramUrl} target="_blank" rel="noreferrer" className="btn btn-gold">
            <Instagram className="h-4 w-4" /> Follow {BUSINESS.instagramHandle}
          </a>
          <Link href="/book" className="btn btn-outline-light">
            Book a style
          </Link>
        </div>
      </PageHero>

      <div className="container-x py-14">
        <div className="columns-2 gap-4 md:columns-3 lg:columns-4 [&>*]:mb-4">
          {items.map((item) => (
            <Link
              key={item.src}
              href={item.href}
              className={cn(
                "group relative block break-inside-avoid overflow-hidden rounded-2xl bg-sand",
                item.tall ? "aspect-[3/5]" : "aspect-[3/4]",
              )}
            >
              <SmartImage
                src={item.src}
                alt={item.alt}
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="transition duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-espresso/75 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
              <div className="absolute inset-x-0 bottom-0 translate-y-2 p-4 text-cream opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">Style</p>
                <p className="font-display text-lg font-semibold">{item.style}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
