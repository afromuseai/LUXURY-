import { pgTable, text, serial, timestamp, varchar, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const leadStatusEnum = pgEnum("lead_status", [
  "new",
  "contacted",
  "qualified",
  "proposal_sent",
  "closed_won",
  "closed_lost",
]);

export const leadSourceEnum = pgEnum("lead_source", [
  "contact_form",
  "ai_website_generator",
  "ai_business_advisor",
  "ai_chatbot_builder",
  "chat_widget",
]);

export const leadsTable = pgTable("leads", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 320 }).notNull(),
  name: varchar("name", { length: 255 }),
  company: varchar("company", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  industry: varchar("industry", { length: 100 }),
  message: text("message"),
  source: leadSourceEnum("source").notNull().default("contact_form"),
  status: leadStatusEnum("status").notNull().default("new"),
  notes: text("notes"),
  metadata: text("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertLeadSchema = createInsertSchema(leadsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const selectLeadSchema = createSelectSchema(leadsTable);
export const updateLeadSchema = insertLeadSchema.partial();

export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Lead = typeof leadsTable.$inferSelect;
