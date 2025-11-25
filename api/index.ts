import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  handleGetIndex,
  handleGetMarkets,
  handleStaticFile,
} from "../src/routes/handlers";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  const url = new URL(req.url || "/", `http://${req.headers.host}`);

  if (url.pathname === "/") {
    const response = await handleGetIndex();
    const html = await response.text();
    return res
      .status(response.status)
      .setHeader("Content-Type", "text/html")
      .send(html);
  }

  if (url.pathname === "/api/markets") {
    const mockReq = new Request(`http://${req.headers.host}${req.url}`);
    const response = await handleGetMarkets(mockReq);
    const data = await response.json();
    return res.status(response.status).json(data);
  }

  const staticResponse = await handleStaticFile(url.pathname);
  if (staticResponse) {
    const content = await staticResponse.text();
    const contentType =
      staticResponse.headers.get("Content-Type") || "text/plain";
    return res
      .status(staticResponse.status)
      .setHeader("Content-Type", contentType)
      .send(content);
  }

  return res.status(404).send("Not Found");
}

