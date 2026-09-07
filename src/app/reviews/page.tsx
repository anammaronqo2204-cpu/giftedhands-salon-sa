import type { Metadata } from "next";
import { Quote } from "@/components/icons";
import { ReviewForm } from "@/components/review-form";
import { PageHero, StarRating } from "@/components/ui";
import { getApprovedReviews, getReviewStats, getServices } from "@/lib/data";
import { formatCreatedAt } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Client Reviews",
  description: "Read what clients say about Giftedhands Salon's no pain braiding, and share your own experience.",
};

export default async function ReviewsPage() {
  const [reviews, stats, services] = await Promise.all([
    getApprovedReviews(),
    getReviewStats(),
    getServices(),
  ]);

  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));

  return (
    <>
      <PageHero
        eyebrow="Client love"
        title={
          <>
            Real words from <span className="gold-text">real crowns.</span>
          </>
        }
        description="Comfort is our promise — here's what our clients say the morning after."
      >
        <div className="flex flex-wrap items-center gap-4 rounded-3xl border border-cream/15 bg-cream/5 px-6 py-4 backdrop-blur">
          <span className="font-display text-5xl font-semibold text-gold">
            {(stats.average || 5).toFixed(1)}
          </span>
          <div>
            <StarRating rating={stats.average || 5} size="h-5 w-5" />
            <p className="mt-1 text-sm text-cream/70">Based on {stats.count} approved reviews</p>
          </div>
        </div>
      </PageHero>

      <div className="container-x grid gap-12 py-16 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <div className="grid gap-5 sm:grid-cols-2">
            {reviews.map((r) => (
              <figure key={r.id} className="card relative flex h-full flex-col p-6">
                <Quote className="absolute right-5 top-5 h-7 w-7 text-gold/30" />
                <StarRating rating={r.rating} />
                <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-cocoa">
                  &ldquo;{r.comment}&rdquo;
                </blockquote>
                <figcaption className="mt-5 border-t border-linen pt-3">
                  <p className="font-semibold text-espresso">{r.customerName}</p>
                  <p className="text-xs text-mocha">
                    {r.serviceName ? `${r.serviceName} · ` : ""}
                    {formatCreatedAt(r.createdAt)}
                  </p>
                </figcaption>
              </figure>
            ))}
            {reviews.length === 0 && (
              <p className="text-mocha">No reviews yet — be the first to share your experience.</p>
            )}
          </div>
        </div>

        <div className="space-y-6 lg:col-span-5">
          <div className="card p-6">
            <h2 className="font-display text-xl font-semibold">Rating breakdown</h2>
            <ul className="mt-4 space-y-2">
              {distribution.map((d) => {
                const pct = reviews.length ? Math.round((d.count / reviews.length) * 100) : 0;
                return (
                  <li key={d.star} className="flex items-center gap-3 text-sm">
                    <span className="w-8 font-semibold">{d.star}★</span>
                    <span className="h-2 flex-1 overflow-hidden rounded-full bg-sand">
                      <span className="block h-full rounded-full bg-gold" style={{ width: `${pct}%` }} />
                    </span>
                    <span className="w-8 text-right text-mocha">{d.count}</span>
                  </li>
                );
              })}
            </ul>
          </div>
          <ReviewForm serviceNames={services.map((s) => s.name)} />
        </div>
      </div>
    </>
  );
}
