import { quotes, type Quote, type InsertQuote } from "@shared/schema";
import { db } from "./db";
import { eq, lte, desc } from "drizzle-orm";

export interface IStorage {
  getQuotes(): Promise<Quote[]>;
  createQuote(quote: InsertQuote): Promise<Quote>;
  deleteQuote(id: number): Promise<void>;
  getQuotesForFeed(): Promise<Quote[]>;
}

export class DatabaseStorage implements IStorage {
  async getQuotes(): Promise<Quote[]> {
    return await db.select().from(quotes).orderBy(desc(quotes.displayDate));
  }

  async createQuote(insertQuote: InsertQuote): Promise<Quote> {
    const [quote] = await db.insert(quotes).values(insertQuote).returning();
    return quote;
  }

  async deleteQuote(id: number): Promise<void> {
    await db.delete(quotes).where(eq(quotes.id, id));
  }

  async getQuotesForFeed(): Promise<Quote[]> {
    const today = new Date().toISOString().split('T')[0];
    return await db.select()
      .from(quotes)
      .where(lte(quotes.displayDate, today))
      .orderBy(desc(quotes.displayDate));
  }
}

export const storage = new DatabaseStorage();
