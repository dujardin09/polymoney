import type { VercelRequest, VercelResponse } from "@vercel/node";
import { PolymarketService } from "../src/services/polymarket.service";
import { validateMarketQuery, ValidationError } from "../src/utils/validation";
import { readFile } from "fs/promises";
import { join } from "path";

const polymarketService = new PolymarketService();

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  try {
    const url = new URL(req.url || "/", `http://${req.headers.host}`);

    if (url.pathname === "/") {
      const html = await readFile(join(process.cwd(), "public/index.html"), "utf-8");
      return res.status(200).setHeader("Content-Type", "text/html").send(html);
    }

    if (url.pathname === "/styles.css") {
      const css = await readFile(join(process.cwd(), "public/styles.css"), "utf-8");
      return res.status(200).setHeader("Content-Type", "text/css").send(css);
    }

    if (url.pathname === "/app.js") {
      const js = await readFile(join(process.cwd(), "public/app.js"), "utf-8");
      return res.status(200).setHeader("Content-Type", "application/javascript").send(js);
    }

    if (url.pathname === "/api/markets") {
      try {
        const query = validateMarketQuery(url.searchParams);
        const events = await polymarketService.fetchEventsClosingSoon(query.maxMinutes);
        const markets = polymarketService.getMarketsInPriceRange(
          events,
          query.minPrice,
          query.maxPrice,
        );

        return res.status(200).json({
          totalEvents: events.length,
          markets: markets.map((m) => ({
            question: m.market.question,
            leadingOutcome: m.leadingOutcome,
            leadingPrice: m.leadingPrice,
            slug: m.market.slug,
            endDate: m.market.endDate,
          })),
        });
      } catch (error) {
        if (error instanceof ValidationError) {
          return res.status(400).json({ error: error.message });
        }
        return res.status(500).json({ error: (error as Error).message });
      }
    }

    return res.status(404).send("Not Found");
  } catch (error) {
    console.error("Handler error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

