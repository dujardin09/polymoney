import { z } from "zod";

const API_CONFIG = {
  polymarket: {
    baseUrl: "https://gamma-api.polymarket.com",
    endpoints: {
      events: "/events",
    },
    limits: {
      maxEvents: 1000,
    },
  },
};

const marketQuerySchema = z.object({
  minPrice: z.coerce.number().min(0).max(1).default(0.95),
  maxPrice: z.coerce.number().min(0).max(1).default(0.99),
  maxMinutes: z.coerce.number().int().positive().default(60),
});

function validateMarketQuery(params) {
  try {
    return marketQuerySchema.parse({
      minPrice: params.minPrice,
      maxPrice: params.maxPrice,
      maxMinutes: params.maxMinutes,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = error.errors
        .map((e) => `${e.path.join(".")}: ${e.message}`)
        .join(", ");
      throw new Error(message);
    }
    throw error;
  }
}

async function fetchEventsClosingSoon(maxMinutes) {
  const now = new Date();
  const later = new Date(now.getTime() + maxMinutes * 60 * 1000);

  const endDateMin = now.toISOString();
  const endDateMax = later.toISOString();

  const url = new URL(
    `${API_CONFIG.polymarket.baseUrl}${API_CONFIG.polymarket.endpoints.events}`
  );
  url.searchParams.append("closed", "false");
  url.searchParams.append("end_date_min", endDateMin);
  url.searchParams.append("end_date_max", endDateMax);
  url.searchParams.append(
    "limit",
    API_CONFIG.polymarket.limits.maxEvents.toString()
  );

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Polymarket API error: ${response.status}`);
  }

  return await response.json();
}

function getLeadingOutcome(market) {
  if (!market.outcomes || !market.outcomePrices) return null;

  try {
    let outcomes = market.outcomes;
    let prices = market.outcomePrices;

    if (typeof outcomes === "string") {
      outcomes = JSON.parse(outcomes);
    }
    if (typeof prices === "string") {
      prices = JSON.parse(prices);
    }

    if (!Array.isArray(outcomes) || !Array.isArray(prices)) return null;
    if (outcomes.length === 0 || prices.length === 0) return null;

    const numericPrices = prices.map((p) =>
      typeof p === "string" ? parseFloat(p) : p
    );

    const maxPrice = Math.max(...numericPrices);
    const maxIndex = numericPrices.indexOf(maxPrice);

    return {
      market,
      leadingOutcome: outcomes[maxIndex] || "Unknown",
      leadingPrice: maxPrice,
    };
  } catch (e) {
    return null;
  }
}

function getMarketsInPriceRange(events, minPrice, maxPrice) {
  const results = [];

  events.forEach((event) => {
    event.markets.forEach((market) => {
      const leading = getLeadingOutcome(market);
      if (
        leading &&
        leading.leadingPrice >= minPrice &&
        leading.leadingPrice <= maxPrice
      ) {
        results.push(leading);
      }
    });
  });

  return results.sort((a, b) => b.leadingPrice - a.leadingPrice);
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const validated = validateMarketQuery(req.query);

    const events = await fetchEventsClosingSoon(validated.maxMinutes);
    const markets = getMarketsInPriceRange(
      events,
      validated.minPrice,
      validated.maxPrice
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
    console.error("Error fetching markets:", error);
    return res
      .status(error.message.includes(":") ? 400 : 500)
      .json({ error: error.message || "Internal server error" });
  }
}
