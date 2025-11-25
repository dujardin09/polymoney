export interface Market {
  id: string;
  question: string;
  description: string;
  endDate?: string;
  endDateIso: string;
  active: boolean;
  closed: boolean;
  slug?: string;
  outcomes?: string | string[];
  outcomePrices?: string | string[];
  category?: string;
  image?: string;
  bestBid?: number;
  bestAsk?: number;
}

export interface Event {
  id: string;
  title: string;
  slug: string;
  description: string;
  endDate: string;
  startDate: string;
  active: boolean;
  closed: boolean;
  markets: Market[];
  category?: string;
  image?: string;
}

export interface MarketWithLeading {
  market: Market;
  leadingOutcome: string;
  leadingPrice: number;
}

export interface PolymoneyConfig {
  minPrice: number;
  maxPrice: number;
  maxMinutes: number;
}
