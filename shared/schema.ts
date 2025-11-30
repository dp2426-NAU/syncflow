import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  avatar: text("avatar"),
  role: text("role").notNull().default("Engineer"), // Engineer, Reviewer, Architect
  timezone: text("timezone").notNull().default("UTC"),
  utcOffset: integer("utc_offset").notNull().default(0),
  status: text("status").notNull().default("offline"), // online, idle, offline
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Columns (Board sections)
export const columns = pgTable("columns", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  position: integer("position").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertColumnSchema = createInsertSchema(columns).omit({
  id: true,
  createdAt: true,
});
export type InsertColumn = z.infer<typeof insertColumnSchema>;
export type Column = typeof columns.$inferSelect;

// Tasks table
export const tasks = pgTable("tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  tag: text("tag").notNull().default("Engineering"), // Design, Engineering, Product, Bug
  priority: text("priority").notNull().default("Medium"), // High, Medium, Low
  columnId: varchar("column_id").notNull().references(() => columns.id, { onDelete: "cascade" }),
  assignedTo: text("assigned_to").array().notNull().default(sql`ARRAY[]::text[]`),
  activeViewers: text("active_viewers").array().notNull().default(sql`ARRAY[]::text[]`),
  comments: integer("comments").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;

// Architecture Decision Records (ADRs)
export const adrs = pgTable("adrs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  status: text("status").notNull().default("Proposed"), // Proposed, Accepted, Rejected, Deprecated
  summary: text("summary").notNull(),
  authorId: varchar("author_id").notNull().references(() => users.id),
  tags: text("tags").array().notNull().default(sql`ARRAY[]::text[]`),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertAdrSchema = createInsertSchema(adrs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertAdr = z.infer<typeof insertAdrSchema>;
export type Adr = typeof adrs.$inferSelect;

// Pull Request Reviews
export const prReviews = pgTable("pr_reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  authorId: varchar("author_id").notNull().references(() => users.id),
  riskLevel: text("risk_level").notNull().default("Medium"), // Low, Medium, High
  summary: text("summary").notNull(),
  checklist: jsonb("checklist").notNull().default(sql`'[]'::jsonb`),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPrReviewSchema = createInsertSchema(prReviews).omit({
  id: true,
  createdAt: true,
});
export type InsertPrReview = z.infer<typeof insertPrReviewSchema>;
export type PrReview = typeof prReviews.$inferSelect;

// Activity Log
export const activities = pgTable("activities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  action: text("action").notNull(), // moved, commented, completed, viewing, etc.
  target: text("target").notNull(), // Task name, ADR title, etc.
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
  createdAt: true,
});
export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type Activity = typeof activities.$inferSelect;

// Notifications
export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // task_assigned, comment, pr_review, adr_update, mention
  title: text("title").notNull(),
  message: text("message").notNull(),
  link: text("link"), // optional link to navigate to
  read: boolean("read").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;
