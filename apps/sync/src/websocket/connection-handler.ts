import type { WebSocket } from "ws";

export interface ConnectionContext {
  docId: string;
}

export interface ConnectionHandler {
  onConnection(socket: WebSocket, context: ConnectionContext): void;
}
