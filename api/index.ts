import type { VercelRequest, VercelResponse } from "@vercel/node";
import { PolymarketService } from "../src/services/polymarket.service";
import { ValidationError, validateMarketQuery } from "../src/utils/validation";

const polymarketService = new PolymarketService();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.url?.startsWith("/api/markets")) {
    try {
      const url = new URL(req.url, `http://${req.headers.host}`);
      const query = validateMarketQuery(url.searchParams);

      const events = await polymarketService.fetchEventsClosingSoon(
        query.maxMinutes,
      );
      const markets = polymarketService.getMarketsInPriceRange(
        events,
        query.minPrice,
        query.maxPrice,
      );

      return res.json({
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

  return res.status(404).json({ error: "Not Found" });
}
