import {
  integer,
  jsonb,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export const submissionStatusEnum = pgEnum("submission_status", [
  "SUBMIT",
  "DRAFT",
]);

// ---------------------------------------------------------------------------
// Location tables
// ---------------------------------------------------------------------------

export const countries = pgTable("countries", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  code: varchar("code", { length: 10 }).notNull().unique(),
});

export const divisions = pgTable("divisions", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  slug: varchar("slug", { length: 120 }).notNull().unique(),
});

export const districts = pgTable("districts", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  slug: varchar("slug", { length: 120 }).notNull().unique(),
  divisionId: integer("division_id")
    .notNull()
    .references(() => divisions.id),
});

export const thanas = pgTable("thanas", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  slug: varchar("slug", { length: 120 }).notNull().unique(),
  districtId: integer("district_id")
    .notNull()
    .references(() => districts.id),
});

// ---------------------------------------------------------------------------
// File uploads
// ---------------------------------------------------------------------------

export const uploadedFiles = pgTable("uploaded_files", {
  id: uuid("id").primaryKey().defaultRandom(),
  originalName: varchar("original_name", { length: 255 }).notNull(),
  storedName: varchar("stored_name", { length: 255 }).notNull(),
  mimeType: varchar("mime_type", { length: 100 }).notNull(),
  sizeBytes: integer("size_bytes").notNull(),
  url: text("url").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// Form submissions
// ---------------------------------------------------------------------------

export const formSubmissions = pgTable("form_submissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  serviceName: varchar("service_name", { length: 100 }).notNull(),
  stakeholderCode: varchar("stakeholder_code", { length: 100 }).notNull(),
  rawPayload: jsonb("raw_payload").notNull(),
  status: submissionStatusEnum("status").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// Inferred types
// ---------------------------------------------------------------------------

export type Country = typeof countries.$inferSelect;
export type Division = typeof divisions.$inferSelect;
export type District = typeof districts.$inferSelect;
export type Thana = typeof thanas.$inferSelect;
export type UploadedFile = typeof uploadedFiles.$inferSelect;
export type FormSubmission = typeof formSubmissions.$inferSelect;
export type InsertFormSubmission = typeof formSubmissions.$inferInsert;
