import { PolymarketService } from "../services/polymarket.service";
import { ValidationError, validateMarketQuery } from "../utils/validation";

const polymarketService = new PolymarketService();

export async function handleGetMarkets(req: Request): Promise<Response> {
  try {
    const url = new URL(req.url);
    const query = validateMarketQuery(url.searchParams);

    const events = await polymarketService.fetchEventsClosingSoon(
      query.maxMinutes,
    );
    const markets = polymarketService.getMarketsInPriceRange(
      events,
      query.minPrice,
      query.maxPrice,
    );

    return Response.json({
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
      return Response.json({ error: error.message }, { status: 400 });
    }
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function handleGetRecentMarkets(req: Request): Promise<Response> {
  try {
    const url = new URL(req.url);
    const maxMinutes = parseInt(url.searchParams.get("maxMinutes") || "60");

    const events =
      await polymarketService.fetchRecentlyCreatedMarkets(maxMinutes);

    return Response.json({
      totalEvents: events.length,
      events: events.map((event) => ({
        title: event.title,
        slug: event.slug,
        startDate: event.startDate,
        endDate: event.endDate,
        markets: event.markets.map((market) => ({
          question: market.question,
          slug: market.slug,
          endDate: market.endDate,
          outcomes: market.outcomes,
          outcomePrices: market.outcomePrices,
        })),
      })),
    });
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function handleGetIndex(): Promise<Response> {
  const indexHtml = await Bun.file("public/index.html").text();
  return new Response(indexHtml, {
    headers: { "Content-Type": "text/html" },
  });
}

export async function handleGetRecent(): Promise<Response> {
  const recentHtml = await Bun.file("public/recent.html").text();
  return new Response(recentHtml, {
    headers: { "Content-Type": "text/html" },
  });
}

export function handleStaticFile(pathname: string): Response | null {
  const filePath = `public${pathname}`;
  const file = Bun.file(filePath);

  if (!file.exists()) return new Response("Not Found", { status: 404 });

  const contentTypes: Record<string, string> = {
    ".html": "text/html",
    ".css": "text/css",
    ".js": "application/javascript",
    ".json": "application/json",
  };

  const ext = pathname.slice(pathname.lastIndexOf("."));
  const contentType = contentTypes[ext] || "text/plain";

  return new Response(file, {
    headers: { "Content-Type": contentType },
  });
}
