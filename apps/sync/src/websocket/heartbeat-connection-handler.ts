import WebSocket from "ws";
import { ConnectionContext, ConnectionHandler } from "./connection-handler";
import { HeartbeatMonitor } from "./heartbeat-monitor";

export class HeartbeatConnectionHandler implements ConnectionHandler {
  constructor(
    private readonly monitor: HeartbeatMonitor,
    private readonly inner: ConnectionHandler,
  ) {}

  onConnection(socket: WebSocket, context: ConnectionContext): void {
    this.monitor.track(socket);
    this.inner.onConnection(socket, context);
  }
}
