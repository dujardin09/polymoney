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

export async function handleGetIndex(): Promise<Response> {
  const fs = await import("fs/promises");
  const path = await import("path");
  
  const indexHtml = await fs.readFile(
    path.join(process.cwd(), "public/index.html"),
    "utf-8",
  );
  return new Response(indexHtml, {
    headers: { "Content-Type": "text/html" },
  });
}

export async function handleStaticFile(
  pathname: string,
): Promise<Response | null> {
  const fs = await import("fs/promises");
  const path = await import("path");

  const filePath = path.join(process.cwd(), "public", pathname);

  try {
    const content = await fs.readFile(filePath, "utf-8");

    const contentTypes: Record<string, string> = {
      ".html": "text/html",
      ".css": "text/css",
      ".js": "application/javascript",
      ".json": "application/json",
    };

    const ext = pathname.slice(pathname.lastIndexOf("."));
    const contentType = contentTypes[ext] || "text/plain";

    return new Response(content, {
      headers: { "Content-Type": contentType },
    });
  } catch {
    return null;
  }
}
