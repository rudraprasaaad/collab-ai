import WebSocket from "ws";
import { Logger } from "../core/logger";
import { ConnectionContext, ConnectionHandler } from "./connection-handler";
import { RoomRegistry } from "./room-registry";

export class RoomConnectionHandler implements ConnectionHandler {
  constructor(
    private readonly registry: RoomRegistry,
    private readonly logger: Logger,
  ) {}

  onConnection(socket: WebSocket, { docId }: ConnectionContext): void {
    this.registry.join(docId, socket);

    this.logger.info("client connected", { docId });

    socket.on("message", (data, isBinary) => {
      this.registry.relay(docId, socket, data, isBinary);
    });

    socket.on("close", () => {
      this.registry.leave(docId, socket);
      this.logger.info("client disconnected", { docId });
    });

    socket.on("error", (error) => {
      this.logger.error("socket error", { docId, message: error.message });
      socket.terminate();
    });
  }
}
