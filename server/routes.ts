import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // === API ROUTES ===

  app.get(api.quotes.list.path, async (req, res) => {
    const quotes = await storage.getQuotes();
    res.json(quotes);
  });

  app.post(api.quotes.create.path, async (req, res) => {
    try {
      const input = api.quotes.create.input.parse(req.body);
      const quote = await storage.createQuote(input);
      res.status(201).json(quote);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.quotes.delete.path, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        return res.status(404).json({ message: "Not found" });
    }
    await storage.deleteQuote(id);
    res.status(204).send();
  });

  // === RSS FEED ROUTE ===
  app.get('/feed', async (req, res) => {
    const quotes = await storage.getQuotesForFeed();
    
    // Simple XML generation
    const xml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
<channel>
  <title>Täglicher Spruch</title>
  <link>${req.protocol}://${req.get('host')}</link>
  <description>Jeden Tag ein neuer lustiger Spruch</description>
  ${quotes.map(quote => `
  <item>
    <title>Spruch vom ${quote.displayDate}</title>
    <description><![CDATA[${quote.content}]]></description>
    <guid>${quote.id}</guid>
    <pubDate>${new Date(quote.displayDate).toUTCString()}</pubDate>
  </item>
  `).join('')}
</channel>
</rss>`;

    res.set('Content-Type', 'application/xml');
    res.send(xml);
  });

  // Seed data if empty
  const existing = await storage.getQuotes();
  if (existing.length === 0) {
      await storage.createQuote({ content: "Der frühe Vogel fängt den Wurm, aber die zweite Maus bekommt den Käse.", displayDate: "2026-01-06" });
      await storage.createQuote({ content: "Ich bin nicht faul, ich bin im Energiesparmodus.", displayDate: "2026-01-07" });
      await storage.createQuote({ content: "Arbeit ist schön, deshalb lasse ich immer etwas für morgen übrig.", displayDate: "2026-01-08" });
  }

  return httpServer;
}
