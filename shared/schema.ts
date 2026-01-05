import { pgTable, serial, text } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const quotes = pgTable("quotes", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  // Storing as YYYY-MM-DD string to ensure strictly date-based logic without timezone shifts
  displayDate: text("display_date").notNull(), 
});

export const insertQuoteSchema = createInsertSchema(quotes).pick({
  content: true,
  displayDate: true,
});

export type Quote = typeof quotes.$inferSelect;
export type InsertQuote = z.infer<typeof insertQuoteSchema>;
