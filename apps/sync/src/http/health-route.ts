import { IncomingMessage, ServerResponse } from "node:http";
import { RouteHandler } from "./route-handler";
import { RuntimeStats } from "../core/runtime-stats";
import { ServerState } from "../core/server-state";

export class HealthRoute implements RouteHandler {
  constructor(
    private readonly stats: RuntimeStats,
    private readonly state: ServerState,
  ) {}

  matches(req: IncomingMessage): boolean {
    return req.method === "GET" && req.url === "/health";
  }

  handle(_req: IncomingMessage, res: ServerResponse): void {
    const draining = this.state.isShuttingDown();
    res.writeHead(draining ? 503 : 200, {
      "content-type": "application/json",
    });
    res.end(
      JSON.stringify({
        status: draining ? "shutting_down" : "ok",
        connections: this.stats.connectionCount(),
        rooms: this.stats.roomCount(),
        uptimeSeconds: Math.floor(process.uptime()),
      }),
    );
  }
}
