import http, { IncomingMessage, ServerResponse } from "node:http";
import { Duplex } from "node:stream";
import { RouteHandler } from "./route-handler";
import { Logger } from "../core/logger";

export type UpgradeListener = (
  req: IncomingMessage,
  socket: Duplex,
  head: Buffer,
) => void;

export class HttpServer {
  private readonly server: http.Server;

  constructor(
    private readonly routes: RouteHandler[],
    private readonly logger: Logger,
  ) {
    this.server = http.createServer((req, res) => this.dispatch(req, res));
  }

  onUpgrade(listener: UpgradeListener) {
    this.server.on("upgrade", listener);
  }

  listen(port: number): Promise<void> {
    return new Promise((resolve) => {
      this.server.listen(port, () => {
        this.logger.info(`HTTP Server listening on port ${port}`);
        resolve();
      });
    });
  }

  private dispatch(req: IncomingMessage, res: ServerResponse): void {
    const route = this.routes.find((r) => r.matches(req));
    if (!route) {
      res.writeHead(404, {
        "Content-Type": "application/json",
      });
      res.end(
        JSON.stringify({
          error: "Not found",
        }),
      );
      return;
    }
    route.handle(req, res);
  }
}
