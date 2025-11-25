import type { PolymoneyConfig } from "./types";

export const config: PolymoneyConfig = {
  minPrice: 0.95,
  maxPrice: 0.99,
  maxMinutes: 60,
};

export const API_CONFIG = {
  polymarket: {
    baseUrl: "https://gamma-api.polymarket.com",
    endpoints: {
      events: "/events",
    },
    limits: {
      maxEvents: 1000,
    },
  },
  server: {
    port: 3000,
  },
};
