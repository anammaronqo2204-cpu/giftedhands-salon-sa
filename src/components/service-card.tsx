import Link from "next/link";
import type { Service } from "@/db/schema";
import { categoryLabel } from "@/lib/constants";
import { formatDuration, formatRands } from "@/lib/utils";
import { ArrowRight, Clock } from "./icons";
import { Badge, SmartImage } from "./ui";

export function ServiceCard({ service, priority = false }: { service: Service; priority?: boolean }) {
  return (
    <article className="card group flex h-full flex-col overflow-hidden transition duration-300 hover:-translate-y-1 hover:shadow-soft">
      <Link href={`/services/${service.slug}`} className="relative block aspect-[4/5] overflow-hidden bg-sand">
        <SmartImage
          src={service.imageUrl}
          alt={service.name}
          priority={priority}
          className="transition duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-espresso/70 to-transparent" />
        <div className="absolute left-4 top-4 flex gap-2">
          <Badge tone="light">{categoryLabel(service.category)}</Badge>
          {service.hairIncluded && <Badge tone="gold">Hair included</Badge>}
        </div>
        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3 text-cream">
          <span className="font-display text-2xl font-semibold leading-none">
            {formatRands(service.priceRands, service.priceFrom)}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-cream/15 px-3 py-1 text-xs font-semibold backdrop-blur">
            <Clock className="h-3.5 w-3.5" /> {formatDuration(service.durationMinutes)}
          </span>
        </div>
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-xl font-semibold leading-snug text-espresso">
          <Link href={`/services/${service.slug}`} className="hover:text-gold-dark">
            {service.name}
          </Link>
        </h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-mocha">{service.shortDescription}</p>
        <div className="mt-5 flex items-center justify-between gap-3">
          <Link
            href={`/services/${service.slug}`}
            className="inline-flex items-center gap-1 text-sm font-semibold text-espresso/70 transition hover:text-espresso"
          >
            Details <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href={`/book?service=${service.slug}`} className="btn btn-dark px-5 py-2.5 text-xs">
            Book now
          </Link>
        </div>
      </div>
    </article>
  );
}
