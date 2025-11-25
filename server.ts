import { Elysia } from "elysia";
import { API_CONFIG } from "./src/config";
import { PolymarketService } from "./src/services/polymarket.service";
import { ValidationError, validateMarketQuery } from "./src/utils/validation";

const polymarketService = new PolymarketService();

const app = new Elysia()
  .get("/", () => Bun.file("public/index.html"))
  .get("/styles.css", () => Bun.file("public/styles.css"))
  .get("/app.js", () => Bun.file("public/app.js"))
  .get("/api/markets", async ({ query }) => {
    try {
      const params = new URLSearchParams(query as Record<string, string>);
      const validated = validateMarketQuery(params);

      const events = await polymarketService.fetchEventsClosingSoon(
        validated.maxMinutes,
      );
      const markets = polymarketService.getMarketsInPriceRange(
        events,
        validated.minPrice,
        validated.maxPrice,
      );

      return {
        totalEvents: events.length,
        markets: markets.map((m) => ({
          question: m.market.question,
          leadingOutcome: m.leadingOutcome,
          leadingPrice: m.leadingPrice,
          slug: m.market.slug,
          endDate: m.market.endDate,
        })),
      };
    } catch (error) {
      if (error instanceof ValidationError) {
        throw new Error(error.message);
      }
      throw error;
    }
  })
  .listen(API_CONFIG.server.port);

console.log(
  `🚀 Polymoney server running at http://${app.server?.hostname}:${app.server?.port}`
);
