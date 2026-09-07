"use server";

import { db } from "@/db";
import { reviews } from "@/db/schema";

export type ReviewFormState = {
  ok: boolean;
  error?: string;
};

export async function submitReview(
  _prev: ReviewFormState,
  formData: FormData,
): Promise<ReviewFormState> {
  const name = String(formData.get("name") ?? "").trim();
  const rating = Number(formData.get("rating") ?? 0);
  const comment = String(formData.get("comment") ?? "").trim();
  const serviceName = String(formData.get("serviceName") ?? "").trim();

  if (name.length < 2) return { ok: false, error: "Please tell us your name." };
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { ok: false, error: "Please choose a star rating." };
  }
  if (comment.length < 10) {
    return { ok: false, error: "Please write a few words about your experience." };
  }
  if (comment.length > 1200) {
    return { ok: false, error: "Please keep your review under 1200 characters." };
  }

  await db.insert(reviews).values({
    customerName: name.slice(0, 80),
    rating,
    comment,
    serviceName: serviceName ? serviceName.slice(0, 120) : null,
    approved: false,
  });

  return { ok: true };
}
