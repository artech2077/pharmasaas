import type { IncomingMessage, ServerResponse } from "node:http";

import { buildHealthResponse } from "./handlers/health.js";

const sendJson = (res: ServerResponse, statusCode: number, payload: unknown) => {
  const body = JSON.stringify(payload);
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Content-Length", Buffer.byteLength(body));
  res.end(body);
};

export const handleRequest = (req: IncomingMessage, res: ServerResponse) => {
  if (req.method === "GET" && req.url === "/health") {
    return sendJson(res, 200, buildHealthResponse());
  }

  if (req.method === "GET" && req.url === "/") {
    return sendJson(res, 200, { name: "@pharmasaas/api", status: "ready" });
  }

  return sendJson(res, 404, { error: "Not Found" });
};
