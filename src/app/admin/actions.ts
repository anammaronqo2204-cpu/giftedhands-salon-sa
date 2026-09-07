"use server";

import { db } from "@/db";
import {
  bookings,
  reviews,
  services,
  serviceImages,
  serviceStaff,
  staff,
  staffSchedule,
  type BookingStatus,
} from "@/db/schema";
import { ADMIN_COOKIE, ADMIN_IFRAME_COOKIE, isAdmin, passwordMatches, sessionToken } from "@/lib/admin-auth";
import { CATEGORIES } from "@/lib/constants";
import { isValidDateStr } from "@/lib/utils";
import { and, eq, sql } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function loginAction(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  if (!passwordMatches(password)) {
    redirect("/admin/login?error=1");
  }
  const store = await cookies();
  const token = sessionToken();
  store.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  store.set(ADMIN_IFRAME_COOKIE, token, {
    httpOnly: true,
    sameSite: "none",
    secure: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  redirect("/admin");
}

export async function logoutAction() {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
  store.delete(ADMIN_IFRAME_COOKIE);
  redirect("/admin/login");
}

async function guard() {
  if (!(await isAdmin())) redirect("/admin/login");
}

function revalidateEverything() {
  [
    "/",
    "/services",
    "/gallery",
    "/reviews",
    "/book",
    "/admin",
    "/admin/services",
    "/admin/staff",
    "/admin/schedule",
  ].forEach((route) => revalidatePath(route));
}

function slugify(value: string) {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "item"
  );
}

function readBool(formData: FormData, key: string) {
  return formData.get(key) === "on" || formData.get(key) === "true";
}

function readInt(formData: FormData, key: string, fallback = 0) {
  const raw = String(formData.get(key) ?? "").trim();
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseTimeToMinutes(raw: FormDataEntryValue | null, fallback: number) {
  const value = String(raw ?? "").trim();
  const match = /^(\d{1,2}):(\d{2})$/.exec(value);
  if (!match) return fallback;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return fallback;
  return hours * 60 + minutes;
}

const ALLOWED: BookingStatus[] = ["pending", "confirmed", "completed", "cancelled"];

export async function updateBookingStatus(id: number, status: BookingStatus) {
  await guard();
  if (!ALLOWED.includes(status)) return;
  await db.update(bookings).set({ status }).where(eq(bookings.id, id));
  revalidateEverything();
}

export async function reassignBookingAction(formData: FormData) {
  await guard();
  const bookingId = readInt(formData, "bookingId");
  const staffId = readInt(formData, "staffId");
  if (!bookingId || !staffId) return;
  await db.update(bookings).set({ staffId }).where(eq(bookings.id, bookingId));
  revalidateEverything();
}

export async function setReviewApproval(id: number, approved: boolean) {
  await guard();
  await db.update(reviews).set({ approved }).where(eq(reviews.id, id));
  revalidateEverything();
}

export async function deleteReview(id: number) {
  await guard();
  await db.delete(reviews).where(eq(reviews.id, id));
  revalidateEverything();
}

// ---------------------------------------------------------------- services

export async function upsertServiceAction(formData: FormData) {
  await guard();
  const id = readInt(formData, "id");
  const name = String(formData.get("name") ?? "").trim();
  if (name.length < 2) return;

  const category = String(formData.get("category") ?? CATEGORIES[0]?.slug ?? "twists").trim();
  const shortDescription = String(formData.get("shortDescription") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const imageUrl = String(formData.get("imageUrl") ?? "").trim() || "/images/services/twists.jpg";
  const priceRands = readInt(formData, "priceRands");
  const durationMinutes = readInt(formData, "durationMinutes", 180);
  const sortOrder = readInt(formData, "sortOrder", 999);
  const payload = {
    name,
    category,
    shortDescription: shortDescription || `${name} at Giftedhands Salon SA.`,
    description: description || shortDescription || `${name} at Giftedhands Salon SA.`,
    priceRands,
    priceFrom: readBool(formData, "priceFrom"),
    durationMinutes,
    imageUrl,
    hairIncluded: readBool(formData, "hairIncluded"),
    centurionOnly: readBool(formData, "centurionOnly"),
    featured: readBool(formData, "featured"),
    active: readBool(formData, "active"),
    sortOrder,
  };

  if (id) {
    await db.update(services).set(payload).where(eq(services.id, id));
  } else {
    await db.insert(services).values({
      ...payload,
      slug: `${slugify(name)}-${Date.now().toString(36)}`,
    });
  }
  revalidateEverything();
}

export async function archiveServiceAction(id: number) {
  await guard();
  await db.update(services).set({ active: false }).where(eq(services.id, id));
  revalidateEverything();
}

export async function deleteServiceAction(id: number) {
  await guard();
  try {
    await db.delete(services).where(eq(services.id, id));
  } catch {
    await db.update(services).set({ active: false }).where(eq(services.id, id));
  }
  revalidateEverything();
}

// ---------------------------------------------------------------- staff

export async function upsertStaffAction(formData: FormData) {
  await guard();
  const id = readInt(formData, "id");
  const name = String(formData.get("name") ?? "").trim();
  if (name.length < 2) return;
  const role = String(formData.get("role") ?? "braider") === "stylist" ? "stylist" : "braider";
  const avatar = String(formData.get("avatar") ?? "").trim() || "/images/staff-avatar.png";
  const bio = String(formData.get("bio") ?? "").trim() || null;
  const sortOrder = readInt(formData, "sortOrder", 999);
  const active = readBool(formData, "active");

  if (id) {
    await db
      .update(staff)
      .set({ name, role, avatar, bio, sortOrder, active })
      .where(eq(staff.id, id));
  } else {
    await db.insert(staff).values({
      name,
      slug: `${slugify(name)}-${Date.now().toString(36)}`,
      role,
      avatar,
      bio,
      sortOrder,
      active: true,
    });
  }
  revalidateEverything();
}

export async function deactivateStaffAction(id: number) {
  await guard();
  await db.update(staff).set({ active: false }).where(eq(staff.id, id));
  revalidateEverything();
}

export async function deleteStaffAction(id: number) {
  await guard();
  try {
    await db.delete(staff).where(eq(staff.id, id));
  } catch {
    await db.update(staff).set({ active: false }).where(eq(staff.id, id));
  }
  revalidateEverything();
}

// ---------------------------------------------------------------- service staff mapping

export async function saveServiceStaffAction(formData: FormData) {
  await guard();
  const serviceId = readInt(formData, "serviceId");
  if (!serviceId) return;
  const picks = [
    { key: "primaryStaffId", priority: 1 },
    { key: "backupStaffId", priority: 2 },
    { key: "tertiaryStaffId", priority: 3 },
  ] as const;

  await db.delete(serviceStaff).where(eq(serviceStaff.serviceId, serviceId));

  const seen = new Set<number>();
  for (const pick of picks) {
    const staffId = readInt(formData, pick.key);
    if (staffId && !seen.has(staffId)) {
      seen.add(staffId);
      await db.insert(serviceStaff).values({
        serviceId,
        staffId,
        priority: pick.priority,
        active: true,
      });
    }
  }
  revalidateEverything();
}

// ---------------------------------------------------------------- schedule

export async function addShiftAction(formData: FormData) {
  await guard();
  const staffId = readInt(formData, "staffId");
  const locationId = readInt(formData, "locationId");
  const date = String(formData.get("date") ?? "").trim();
  if (!staffId || !locationId || !isValidDateStr(date)) return;
  const startMinutes = parseTimeToMinutes(formData.get("startTime"), 7 * 60 + 30);
  const endMinutes = parseTimeToMinutes(formData.get("endTime"), 18 * 60);
  const capacity = Math.max(1, readInt(formData, "capacity", 1));
  const notes = String(formData.get("notes") ?? "").trim() || null;
  if (endMinutes <= startMinutes) return;

  await db.insert(staffSchedule).values({
    staffId,
    locationId,
    date,
    startMinutes,
    endMinutes,
    capacity,
    notes,
  });
  revalidateEverything();
}

export async function deleteShiftAction(id: number) {
  await guard();
  await db.delete(staffSchedule).where(eq(staffSchedule.id, id));
  revalidateEverything();
}

// ---------------------------------------------------------------- images

async function saveUpload(file: File, folder: "services" | "staff") {
  if (!file || file.size === 0) return null;
  if (!file.type.startsWith("image/")) return null;
  const ext = file.type.includes("png") ? "png" : file.type.includes("webp") ? "webp" : "jpg";
  const bytes = Buffer.from(await file.arrayBuffer());
  const dir = path.join(process.cwd(), "public", "uploads", folder);
  await mkdir(dir, { recursive: true });
  const filename = `${Date.now()}-${randomUUID()}.${ext}`;
  await writeFile(path.join(dir, filename), bytes);
  return `/uploads/${folder}/${filename}`;
}

export async function uploadServiceImageAction(formData: FormData) {
  await guard();
  const serviceId = readInt(formData, "serviceId");
  const file = formData.get("image");
  if (!serviceId || !(file instanceof File)) return;
  const imageUrl = await saveUpload(file, "services");
  if (!imageUrl) return;

  const makeMain = readBool(formData, "makeMain");
  if (makeMain) {
    await db
      .update(serviceImages)
      .set({ sortOrder: 99 })
      .where(and(eq(serviceImages.serviceId, serviceId), eq(serviceImages.sortOrder, 1)));
    await db.update(services).set({ imageUrl }).where(eq(services.id, serviceId));
    await db.insert(serviceImages).values({ serviceId, imageUrl, sortOrder: 1 });
  } else {
    const [{ max }] = await db
      .select({ max: sql<number>`coalesce(max(${serviceImages.sortOrder}), 0)::int` })
      .from(serviceImages)
      .where(eq(serviceImages.serviceId, serviceId));
    await db.insert(serviceImages).values({
      serviceId,
      imageUrl,
      sortOrder: Number(max ?? 0) + 1,
    });
  }
  revalidateEverything();
}

export async function makeServiceImageMainAction(formData: FormData) {
  await guard();
  const imageId = readInt(formData, "imageId");
  const serviceId = readInt(formData, "serviceId");
  if (!imageId || !serviceId) return;
  const [image] = await db
    .select()
    .from(serviceImages)
    .where(eq(serviceImages.id, imageId))
    .limit(1);
  if (!image) return;
  await db
    .update(serviceImages)
    .set({ sortOrder: 99 })
    .where(and(eq(serviceImages.serviceId, serviceId), eq(serviceImages.sortOrder, 1)));
  await db.update(serviceImages).set({ sortOrder: 1 }).where(eq(serviceImages.id, imageId));
  await db.update(services).set({ imageUrl: image.imageUrl }).where(eq(services.id, serviceId));
  revalidateEverything();
}

export async function deleteServiceImageAction(id: number) {
  await guard();
  await db.update(serviceImages).set({ active: false }).where(eq(serviceImages.id, id));
  revalidateEverything();
}
