import { db } from "@/db";
import {
  bookings,
  locations,
  reviews,
  services,
  staff,
  staffSchedule,
  serviceStaff,
  serviceImages,
  type Booking,
  type Location,
  type Review,
  type Service,
  type Staff,
  type StaffSchedule,
  type ServiceStaff,
  type ServiceImage,
} from "@/db/schema";
import { and, asc, desc, eq, ne, sql } from "drizzle-orm";
import { ensureSeeded } from "./seed";

// ---------------------------------------------------------------- services

async function attachMainImages(rows: Service[]): Promise<Service[]> {
  if (rows.length === 0) return rows;
  const imageRows = await db
    .select()
    .from(serviceImages)
    .where(eq(serviceImages.active, true))
    .orderBy(asc(serviceImages.serviceId), asc(serviceImages.sortOrder), asc(serviceImages.id));

  const firstByService = new Map<number, string>();
  for (const image of imageRows) {
    if (!firstByService.has(image.serviceId)) {
      firstByService.set(image.serviceId, image.imageUrl);
    }
  }

  return rows.map((service) => ({
    ...service,
    imageUrl: firstByService.get(service.id) ?? service.imageUrl,
  }));
}

export async function getServices(): Promise<Service[]> {
  await ensureSeeded();
  const rows = await db
    .select()
    .from(services)
    .where(eq(services.active, true))
    .orderBy(asc(services.sortOrder), asc(services.name));
  return attachMainImages(rows);
}

export async function getAllServices(): Promise<Service[]> {
  await ensureSeeded();
  const rows = await db
    .select()
    .from(services)
    .orderBy(asc(services.sortOrder), asc(services.name));
  return attachMainImages(rows);
}

export async function getFeaturedServices(limit = 6): Promise<Service[]> {
  await ensureSeeded();
  const rows = await db
    .select()
    .from(services)
    .where(
      and(eq(services.active, true), eq(services.featured, true)),
    )
    .orderBy(asc(services.sortOrder))
    .limit(limit);
  return attachMainImages(rows);
}

export async function getServiceBySlug(
  slug: string,
): Promise<Service | null> {
  await ensureSeeded();
  const rows = await db
    .select()
    .from(services)
    .where(
      and(eq(services.slug, slug), eq(services.active, true)),
    )
    .limit(1);
  const [service] = await attachMainImages(rows);
  return service ?? null;
}

export async function getServiceById(
  id: number,
): Promise<Service | null> {
  const rows = await db
    .select()
    .from(services)
    .where(eq(services.id, id))
    .limit(1);
  const [service] = await attachMainImages(rows);
  return service ?? null;
}

export async function getServiceBySlugAnyStatus(
  slug: string,
): Promise<Service | null> {
  await ensureSeeded();
  const rows = await db
    .select()
    .from(services)
    .where(eq(services.slug, slug))
    .limit(1);
  const [service] = await attachMainImages(rows);
  return service ?? null;
}

export async function getAllServiceImages(): Promise<Array<ServiceImage & { service: Service }>> {
  await ensureSeeded();
  const rows = await db
    .select({ image: serviceImages, service: services })
    .from(serviceImages)
    .innerJoin(services, eq(serviceImages.serviceId, services.id))
    .where(and(eq(serviceImages.active, true), eq(services.active, true)))
    .orderBy(asc(serviceImages.sortOrder), desc(serviceImages.id));
  return rows.map((row) => ({ ...row.image, service: row.service }));
}

// ---------------------------------------------------------------- locations

export async function getLocations(): Promise<Location[]> {
  await ensureSeeded();
  return db
    .select()
    .from(locations)
    .orderBy(asc(locations.sortOrder));
}

export async function getLocationById(
  id: number,
): Promise<Location | null> {
  const rows = await db
    .select()
    .from(locations)
    .where(eq(locations.id, id))
    .limit(1);
  return rows[0] ?? null;
}

// ---------------------------------------------------------------- reviews

export async function getApprovedReviews(
  limit?: number,
): Promise<Review[]> {
  await ensureSeeded();
  const query = db
    .select()
    .from(reviews)
    .where(eq(reviews.approved, true))
    .orderBy(desc(reviews.createdAt));
   return limit ? query.limit(limit) : query;
}

export async function getAllReviews(): Promise<Review[]> {
  await ensureSeeded();
  return db
    .select()
    .from(reviews)
    .orderBy(desc(reviews.createdAt));
}

export async function getReviewStats() {
  await ensureSeeded();
  const [row] = await db
    .select({
      count: sql<number>`count(*)::int`,
      average: sql<number>`coalesce(avg(${reviews.rating}), 0)::float`,
    })
    .from(reviews)
    .where(eq(reviews.approved, true));
  return {
    count: row?.count ?? 0,
    average: Number(row?.average ?? 0),
  };
}

// ---------------------------------------------------------------- bookings (with staff)

export type BookingWithDetails = Booking & {
  service: Service;
  location: Location;
  staff: Staff | null;
};

export async function getBookingByReference(
  reference: string,
): Promise<BookingWithDetails | null> {
  const rows = await db
    .select({
      booking: bookings,
      service: services,
      location: locations,
      staff,
    })
    .from(bookings)
    .innerJoin(services, eq(bookings.serviceId, services.id))
    .innerJoin(locations, eq(bookings.locationId, locations.id))
    .leftJoin(staff, eq(bookings.staffId, staff.id))
    .where(eq(bookings.reference, reference.toUpperCase()))
    .limit(1);
  const row = rows[0];
  if (!row) return null;
  return {
    ...row.booking,
    service: row.service,
    location: row.location,
    staff: row.staff,
  };
}

export async function getAllBookings(): Promise<BookingWithDetails[]> {
  await ensureSeeded();
  const rows = await db
    .select({
      booking: bookings,
      service: services,
      location: locations,
      staff,
    })
    .from(bookings)
    .innerJoin(services, eq(bookings.serviceId, services.id))
    .innerJoin(locations, eq(bookings.locationId, locations.id))
    .leftJoin(staff, eq(bookings.staffId, staff.id))
    .orderBy(desc(bookings.bookingDate), desc(bookings.startMinutes));
  return rows.map((r) => ({
    ...r.booking,
    service: r.service,
    location: r.location,
    staff: r.staff,
  }));
}

// ---------------------------------------------------------------- staff

export async function getStaff(): Promise<Staff[]> {
  await ensureSeeded();
  return db
    .select()
    .from(staff)
    .orderBy(asc(staff.sortOrder), asc(staff.name));
}

export async function getActiveStaff(): Promise<Staff[]> {
  await ensureSeeded();
  return db
    .select()
    .from(staff)
    .where(eq(staff.active, true))
    .orderBy(asc(staff.sortOrder), asc(staff.name));
}

export async function getStaffById(
  id: number,
): Promise<Staff | null> {
  const rows = await db
    .select()
    .from(staff)
    .where(eq(staff.id, id))
    .limit(1);
  return rows[0] ?? null;
}

export async function getStaffBySlug(
  slug: string,
): Promise<Staff | null> {
  const rows = await db
    .select()
    .from(staff)
    .where(eq(staff.slug, slug))
    .limit(1);
  return rows[0] ?? null;
}

export async function addStaff(
  name: string,
  role: "braider" | "stylist",
  bio?: string,
): Promise<number> {
  const slug =
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") +
    "-" +
    Date.now().toString(36);
  const result = await db
    .insert(staff)
    .values({
      name,
      slug,
      role,
      bio: bio ?? null,
      sortOrder: 999,
    })
    .returning();
  return result[0].id;
}

export async function updateStaff(
  id: number,
  patch: {
    name?: string;
    role?: "braider" | "stylist";
    bio?: string | null;
    active?: boolean;
    sortOrder?: number;
    avatar?: string;
  },
): Promise<void> {
  await db.update(staff).set(patch).where(eq(staff.id, id));
}

export async function removeStaff(id: number): Promise<void> {
  await db.delete(staff).where(eq(staff.id, id));
}

// ---------------------------------------------------------------- staff schedule

export async function getScheduleForDate(
  locationId: number,
  date: string,
): Promise<(StaffSchedule & { staff: Staff })[]> {
  const rows = await db
    .select({
      sch: staffSchedule,
      s: staff,
    })
    .from(staffSchedule)
    .innerJoin(staff, eq(staffSchedule.staffId, staff.id))
    .where(
      and(
        eq(staffSchedule.date, date),
        eq(staffSchedule.locationId, locationId),
      ),
    )
    .orderBy(asc(staffSchedule.startMinutes));
  return rows.map((r) => ({ ...r.sch, staff: r.s }));
}

export async function getScheduleForStaff(
  staffId: number,
  date: string,
): Promise<StaffSchedule[]> {
  return db
    .select()
    .from(staffSchedule)
    .where(
      and(
        eq(staffSchedule.staffId, staffId),
        eq(staffSchedule.date, date),
      ),
    )
    .orderBy(asc(staffSchedule.startMinutes));
}

export async function getScheduleForStaffRange(
  staffId: number,
  from: string,
  to: string,
): Promise<StaffSchedule[]> {
  return db
    .select()
    .from(staffSchedule)
    .where(
      and(
        eq(staffSchedule.staffId, staffId),
        sql`${staffSchedule.date} >= ${from}`,
        sql`${staffSchedule.date} <= ${to}`,
      ),
    )
    .orderBy(asc(staffSchedule.date), asc(staffSchedule.startMinutes));
}

export async function setShift(
  staffId: number,
  locationId: number,
  date: string,
  startMinutes: number,
  endMinutes: number,
  capacity = 1,
  notes?: string,
): Promise<void> {
  await db
    .insert(staffSchedule)
    .values({
      staffId,
      locationId,
      date,
      startMinutes,
      endMinutes,
      capacity: capacity,
      notes: notes ?? null,
    })
    .onConflictDoNothing();
}

export async function removeShift(id: number): Promise<void> {
  await db.delete(staffSchedule).where(eq(staffSchedule.id, id));
}

// ---------------------------------------------------------------- service → staff mapping

export type ServiceStaffMapping = ServiceStaff & {
  staff: Staff;
};

export async function getStaffForService(
  serviceId: number,
): Promise<ServiceStaffMapping[]> {
  const rows = await db
    .select({
      m: serviceStaff,
      s: staff,
    })
    .from(serviceStaff)
    .innerJoin(staff, eq(staff.id, serviceStaff.staffId))
    .where(
      and(
        eq(serviceStaff.serviceId, serviceId),
        eq(serviceStaff.active, true),
      ),
    )
    .orderBy(asc(serviceStaff.priority), asc(staff.name));
  return rows.map((r) => ({
    ...r.m,
    staff: r.s,
  }));
}

export async function addServiceStaffMap(
  serviceId: number,
  staffId: number,
  priority: 1 | 2 | 3,
): Promise<void> {
  await db
    .insert(serviceStaff)
    .values({ serviceId, staffId, priority });
}

export async function clearServiceStaffMap(
  serviceId: number,
): Promise<void> {
  await db
    .delete(serviceStaff)
    .where(eq(serviceStaff.serviceId, serviceId));
}

export async function setServicePrimaryStaff(
  serviceId: number,
  staffId: number,
): Promise<void> {
  await clearServiceStaffMap(serviceId);
  await addServiceStaffMap(serviceId, staffId, 1);
}

export async function addServiceBackupStaff(
  serviceId: number,
  staffId: number,
): Promise<void> {
  await addServiceStaffMap(serviceId, staffId, 2);
}

export async function removeServiceStaffMap(
  id: number,
): Promise<void> {
  await db
    .delete(serviceStaff)
    .where(eq(serviceStaff.id, id));
}

// ---------------------------------------------------------------- service images (customer-facing)

export async function getServiceImages(
  serviceId: number,
): Promise<ServiceImage[]> {
  const rows = await db
    .select()
    .from(serviceImages)
    .where(
      and(
        eq(serviceImages.serviceId, serviceId),
        eq(serviceImages.active, true),
      ),
    )
    .orderBy(asc(serviceImages.sortOrder), asc(serviceImages.id));
  return rows;
}

export async function setServiceMainImage(
  serviceId: number,
  imageUrl: string,
): Promise<void> {
  // demote existing main image
  await db
    .update(serviceImages)
    .set({ sortOrder: 99 })
    .where(
      and(
        eq(serviceImages.serviceId, serviceId),
        eq(serviceImages.sortOrder, 1),
      ),
    );
  await db
    .insert(serviceImages)
    .values({ serviceId, imageUrl, sortOrder: 1 })
    .onConflictDoNothing();
}

export async function addServiceImage(
  serviceId: number,
  imageUrl: string,
): Promise<number> {
  const maxRows = await db
    .select({
      mx: sql<number>`coalesce(max(${serviceImages.sortOrder}), 0)::int`,
    })
    .from(serviceImages)
    .where(eq(serviceImages.serviceId, serviceId));
  const sortOrder = Number(maxRows[0]?.mx ?? 0) + 1;
  const result = await db
    .insert(serviceImages)
    .values({ serviceId, imageUrl, sortOrder })
    .returning();
  return result[0].id;
}

export async function removeServiceImage(
  id: number,
): Promise<void> {
  await db
    .update(serviceImages)
    .set({ active: false })
    .where(eq(serviceImages.id, id));
}
