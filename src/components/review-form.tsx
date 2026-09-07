"use client";

import { useActionState, useState } from "react";
import { submitReview, type ReviewFormState } from "@/app/reviews/actions";
import { cn } from "@/lib/utils";
import { Check, Star } from "./icons";

const initialState: ReviewFormState = { ok: false };

export function ReviewForm({ serviceNames }: { serviceNames: string[] }) {
  const [state, action, pending] = useActionState(submitReview, initialState);
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState<number | null>(null);

  if (state.ok) {
    return (
      <div className="card p-8 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-gold text-espresso">
          <Check className="h-7 w-7" />
        </span>
        <h3 className="mt-5 font-display text-2xl font-semibold">Thank you!</h3>
        <p className="mt-2 text-sm text-mocha">
          Your review has been sent to the salon and will appear once it&apos;s been approved.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="card p-6 sm:p-8">
      <h3 className="font-display text-2xl font-semibold">Share your experience</h3>
      <p className="mt-1 text-sm text-mocha">Reviews are moderated before they appear.</p>

      <div className="mt-6">
        <span className="label">Your rating</span>
        <div className="flex items-center gap-1" onMouseLeave={() => setHover(null)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              onMouseEnter={() => setHover(n)}
              aria-label={`${n} star${n > 1 ? "s" : ""}`}
              className="p-0.5 transition hover:scale-110"
            >
              <Star
                filled={n <= (hover ?? rating)}
                className={cn("h-8 w-8", n <= (hover ?? rating) ? "text-gold" : "text-linen")}
              />
            </button>
          ))}
          <input type="hidden" name="rating" value={rating} />
        </div>
      </div>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="review-name">Your name</label>
          <input id="review-name" name="name" className="input" placeholder="e.g. Thandiwe M." required />
        </div>
        <div>
          <label className="label" htmlFor="review-service">Style you had</label>
          <select id="review-service" name="serviceName" className="input" defaultValue="">
            <option value="">Prefer not to say</option>
            {serviceNames.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="review-comment">Your review</label>
          <textarea
            id="review-comment"
            name="comment"
            className="input min-h-32"
            placeholder="How did your braids feel? How was the service?"
            required
            minLength={10}
          />
        </div>
      </div>

      {state.error && (
        <p className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800">
          {state.error}
        </p>
      )}

      <button type="submit" disabled={pending} className="btn btn-gold mt-6">
        {pending ? "Sending…" : "Submit review"}
      </button>
    </form>
  );
}
