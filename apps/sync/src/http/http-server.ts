import http, { IncomingMessage, ServerResponse } from "node:http";
import { Duplex } from "node:stream";
import { RouteHandler } from "./route-handler";
import { Logger } from "../core/logger";
import { Stoppable } from "../core/stoppable";

export type UpgradeListener = (
  req: IncomingMessage,
  socket: Duplex,
  head: Buffer,
) => void;

export class HttpServer implements Stoppable {
  readonly name = "http-server";

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

  stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server.close((err) => (err ? reject(err) : resolve()));
      this.server.closeIdleConnections();
    });
  }

  private dispatch(req: IncomingMessage, res: ServerResponse): void {
    const route = this.routes.find((r) => r.matches(req));
    if (route) {
      route.handle(req, res);
      return;
    }
    res.writeHead(404, {
      "Content-Type": "application/json",
    });
    res.end(
      JSON.stringify({
        error: "Not found",
      }),
    );
  }
}
