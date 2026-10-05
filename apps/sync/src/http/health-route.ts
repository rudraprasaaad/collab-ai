import { IncomingMessage, ServerResponse } from "node:http";
import { RouteHandler } from "./route-handler";

export class HealthRoute implements RouteHandler {
  matches(req: IncomingMessage): boolean {
    const path = req.url?.split("?")[0];
    return req.method === "GET" && path === "/health";
  }

  handle(_req: IncomingMessage, res: ServerResponse): void {
    res.writeHead(200, {
      "Content-Type": "application/json",
    });
    res.end(JSON.stringify({ status: "ok" }));
  }
}
