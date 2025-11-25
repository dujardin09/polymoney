import type { Event, Market, MarketWithLeading } from "./types";

function getLeadingOutcome(market: Market): MarketWithLeading | null {
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
      typeof p === "string" ? parseFloat(p) : p,
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

export function getMarketsInPriceRange(
  events: Event[],
  minPrice: number,
  maxPrice: number,
): MarketWithLeading[] {
  const results: MarketWithLeading[] = [];

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

export async function fetchEventsClosingSoon(
  maxMinutes: number,
): Promise<Event[]> {
  const now = new Date();
  const later = new Date(now.getTime() + maxMinutes * 60 * 1000);

  const endDateMin = now.toISOString();
  const endDateMax = later.toISOString();

  const url = new URL("https://gamma-api.polymarket.com/events");
  url.searchParams.append("closed", "false");
  url.searchParams.append("end_date_min", endDateMin);
  url.searchParams.append("end_date_max", endDateMax);
  url.searchParams.append("limit", "1000");

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return await response.json();
}
