import { Logger } from "../core/logger";
import type { WebSocket } from "ws";

export class HeartbeatMonitor {
  private readonly aliveBySocket = new Map<WebSocket, boolean>();
  private timer: NodeJS.Timeout | null = null;

  constructor(
    private readonly intervalMs: number,
    private readonly logger: Logger,
  ) {}

  track(socket: WebSocket): void {
    this.aliveBySocket.set(socket, true);
    socket.on("pong", () => this.aliveBySocket.set(socket, true));
    socket.once("close", () => this.aliveBySocket.delete(socket));
  }

  start(): void {
    if (this.timer) return;

    this.timer = setInterval(() => this.tick(), this.intervalMs);
    this.timer.unref();
    this.logger.info("hearbeat started", { intervalMs: this.intervalMs });
  }

  stop(): void {
    if (!this.timer) return;
    clearInterval(this.timer);

    this.timer = null;
    this.logger.info("heartbeat stopped");
  }

  private tick(): void {
    for (const [socket, alive] of this.aliveBySocket) {
      if (!alive) {
        this.logger.info("terminating unresponsive client");
        socket.terminate();
        continue;
      }
      this.aliveBySocket.set(socket, false);
      socket.ping();
    }
  }
}
