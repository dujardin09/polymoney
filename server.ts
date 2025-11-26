import { API_CONFIG } from "./src/config";
import {
  handleGetIndex,
  handleGetMarkets,
  handleGetRecent,
  handleGetRecentMarkets,
  handleStaticFile,
} from "./src/routes/handlers";

const server = Bun.serve({
  port: API_CONFIG.server.port,
  async fetch(req) {
    const url = new URL(req.url);

    if (url.pathname === "/") {
      return handleGetIndex();
    }

    if (url.pathname === "/recent") {
      return handleGetRecent();
    }

    if (url.pathname === "/api/markets") {
      return handleGetMarkets(req);
    }

    if (url.pathname === "/api/recent-markets") {
      return handleGetRecentMarkets(req);
    }

    const staticResponse = handleStaticFile(url.pathname);
    if (staticResponse) {
      return staticResponse;
    }

    return new Response("Not Found", { status: 404 });
  },
});

console.log(`🚀 Polymoney server running at http://localhost:${server.port}`);
