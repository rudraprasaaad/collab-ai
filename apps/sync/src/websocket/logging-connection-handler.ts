import { Logger } from "../core/logger";
import { ConnectionContext, ConnectionHandler } from "./connection-handler";
import type { WebSocket } from "ws";

export class LoggingConnectionHandler implements ConnectionHandler {
  constructor(private readonly logger: Logger) {}

  onConnection(socket: WebSocket, { docId }: ConnectionContext): void {
    this.logger.info("client connected", { docId });
    socket.on("close", () =>
      this.logger.info("client disconnected", { docId }),
    );
  }
}
