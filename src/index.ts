import { Elysia } from "elysia";
import { join } from "path";
import { PolymarketService } from "./services/polymarket.service";
import { ValidationError, validateMarketQuery } from "./utils/validation";

const polymarketService = new PolymarketService();

const publicDir = join(import.meta.dir, "../public");

const app = new Elysia()
  .get("/", async () => {
    const file = Bun.file(join(publicDir, "index.html"));
    return new Response(await file.text(), {
      headers: { "Content-Type": "text/html" },
    });
  })
  .get("/styles.css", async () => {
    const file = Bun.file(join(publicDir, "styles.css"));
    return new Response(await file.text(), {
      headers: { "Content-Type": "text/css" },
    });
  })
  .get("/app.js", async () => {
    const file = Bun.file(join(publicDir, "app.js"));
    return new Response(await file.text(), {
      headers: { "Content-Type": "application/javascript" },
    });
  })
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
  });

export default app;
