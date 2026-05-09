import { pgTable, text, serial, timestamp, varchar, integer, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const aiToolEnum = pgEnum("ai_tool", [
  "website_generator",
  "business_advisor",
  "chatbot_builder",
  "chat_widget",
  "content_generator",
]);

export const aiSessionsTable = pgTable("ai_sessions", {
  id: serial("id").primaryKey(),
  tool: aiToolEnum("tool").notNull(),
  email: varchar("email", { length: 320 }),
  inputSummary: text("input_summary"),
  outputSummary: text("output_summary"),
  tokensUsed: integer("tokens_used").default(0),
  durationMs: integer("duration_ms").default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertAiSessionSchema = createInsertSchema(aiSessionsTable).omit({
  id: true,
  createdAt: true,
});

export const selectAiSessionSchema = createSelectSchema(aiSessionsTable);
export type InsertAiSession = z.infer<typeof insertAiSessionSchema>;
export type AiSession = typeof aiSessionsTable.$inferSelect;
