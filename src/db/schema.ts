import {
  boolean,
  date,
  index,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const staffRoleEnum = pgEnum("staff_role", ["braider", "stylist"]);
export const bookingStatusEnum = pgEnum("booking_status", [
  "pending",
  "confirmed",
  "completed",
  "cancelled",
]);

export const services = pgTable(
  "services",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    category: text("category").notNull(),
    shortDescription: text("short_description").notNull(),
    description: text("description").notNull(),
    priceRands: integer("price_rands").notNull(),
    priceFrom: boolean("price_from")
      .notNull()
      .default(false),
    durationMinutes: integer("duration_minutes").notNull(),
    imageUrl: text("image_url")
      .notNull()
      .default("/images/services/twists.jpg"),
    hairIncluded: boolean("hair_included")
      .notNull()
      .default(false),
    centurionOnly: boolean("centurion_only")
      .notNull()
      .default(false),
    featured: boolean("featured").notNull().default(false),
    sortOrder: integer("sort_order")
      .notNull()
      .default(0),
    active: boolean("active")
      .notNull()
      .default(true),
  },
  (table) => [
    index("services_category_idx").on(table.category),
    index("services_active_idx").on(table.active),
  ],
);

export const locations = pgTable("locations", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  addressLine: text("address_line").notNull(),
  area: text("area").notNull(),
  description: text("description").notNull(),
  callOutFeeRands: integer("call_out_fee_rands")
    .notNull()
    .default(0),
  capacity: integer("capacity").notNull().default(2),
  mapsUrl: text("maps_url"),
  isHouseCall: boolean("is_house_call")
    .notNull()
    .default(false),
  sortOrder: integer("sort_order")
    .notNull()
    .default(0),
});

export const bookings = pgTable(
  "bookings",
  {
    id: serial("id").primaryKey(),
    reference: varchar("reference", { length: 16 })
      .notNull()
      .unique(),
    serviceId: integer("service_id")
      .notNull()
      .references(() => services.id),
    locationId: integer("location_id")
      .notNull()
      .references(() => locations.id),
    staffId: integer("staff_id")
      .references(() => staff.id),
    customerName: text("customer_name").notNull(),
    phone: text("phone").notNull(),
    email: text("email"),
    bookingDate: date("booking_date", { mode: "string" })
      .notNull(),
    startMinutes: integer("start_minutes").notNull(),
    endMinutes: integer("end_minutes").notNull(),
    address: text("address"),
    notes: text("notes"),
    totalRands: integer("total_rands").notNull(),
    status: bookingStatusEnum("status")
      .notNull()
      .default("pending"),
    createdAt: timestamp("created_at", {
      withTimezone: true,
    }).notNull().defaultNow(),
  },
  (table) => [
    index("bookings_date_status_idx")
      .on(table.bookingDate, table.status),
    index("bookings_staff_idx").on(table.staffId),
  ],
);

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  customerName: text("customer_name").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment").notNull(),
  serviceName: text("service_name"),
  approved: boolean("approved")
    .notNull()
    .default(false),
  createdAt: timestamp("created_at", {
    withTimezone: true,
  }).notNull().defaultNow(),
});

export const staff = pgTable("staff", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  role: staffRoleEnum("role")
    .notNull()
    .default("braider"),
  avatar: text("avatar")
    .notNull()
    .default("/images/staff-avatar.png"),
  bio: text("bio"),
  active: boolean("active")
    .notNull()
    .default(true),
  sortOrder: integer("sort_order")
    .notNull()
    .default(0),
});

export const staffSchedule = pgTable(
  "staff_schedule",
  {
    id: serial("id").primaryKey(),
    staffId: integer("staff_id")
      .notNull()
      .references(() => staff.id),
    locationId: integer("location_id")
      .notNull()
      .references(() => locations.id),
    date: date("date", { mode: "string" }).notNull(),
    startMinutes: integer("start_minutes").notNull(),
    endMinutes: integer("end_minutes").notNull(),
    capacity: integer("capacity")
      .notNull()
      .default(1),
    notes: text("notes"),
  },
  (table) => [
    index("staff_schedule_lookup")
      .on(table.staffId, table.locationId, table.date),
    index("staff_schedule_cap")
      .on(table.staffId, table.date, table.startMinutes),
  ],
);

export const serviceStaff = pgTable("service_staff", {
  id: serial("id").primaryKey(),
  serviceId: integer("service_id")
    .notNull()
    .references(() => services.id),
  staffId: integer("staff_id")
    .notNull()
    .references(() => staff.id),
  priority: integer("priority").notNull(),
  active: boolean("active")
    .notNull()
    .default(true),
}, (table) => [
  index("service_staff_lookup")
    .on(table.serviceId, table.priority, table.active),
  index("service_staff_unique")
    .on(table.serviceId, table.staffId),
]);

export const serviceImages = pgTable(
  "service_images",
  {
    id: serial("id").primaryKey(),
    serviceId: integer("service_id")
      .notNull()
      .references(() => services.id),
    imageUrl: text("image_url").notNull(),
    caption: text("caption"),
    sortOrder: integer("sort_order")
      .notNull()
      .default(0),
    active: boolean("active")
      .notNull()
      .default(true),
  },
  (table) => [index("service_images_service_idx").on(table.serviceId)],
);

export type Service = typeof services.$inferSelect;
export type NewService = typeof services.$inferInsert;
export type Location = typeof locations.$inferSelect;
export type NewLocation = typeof locations.$inferInsert;
export type Booking = typeof bookings.$inferSelect;
export type NewBooking = typeof bookings.$inferInsert;
export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;
export type BookingStatus = Booking["status"];
export type Staff = typeof staff.$inferSelect;
export type NewStaff = typeof staff.$inferInsert;
export type StaffSchedule = typeof staffSchedule.$inferSelect;
export type NewStaffSchedule = typeof staffSchedule.$inferInsert;
export type ServiceStaff = typeof serviceStaff.$inferSelect;
export type NewServiceStaff = typeof serviceStaff.$inferInsert;
export type ServiceImage = typeof serviceImages.$inferSelect;
export type NewServiceImage = typeof serviceImages.$inferInsert;

export const STAFF_PRIORITY_LABELS: Record<number, string> = {
  1: "Primary",
  2: "Backup",
  3: "Tertiary",
};
