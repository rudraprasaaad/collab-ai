import { ServerState } from "./server-state";
import { Stoppable } from "./stoppable";
import { Logger } from "./logger";

export class ShutDownCoordinator {
  private running: Promise<void> | null = null;

  constructor(
    private readonly state: ServerState,
    private readonly stoppables: Stoppable[],
    private readonly timeoutMs: number,
    private readonly logger: Logger,
  ) {}

  listen(): void {
    for (const signal of ["SIGINT", "SIGTERM"] as const) {
      process.once(signal, () => void this.shutdown(signal));
    }
  }

  shutdown(reason: string): Promise<void> {
    this.running ??= this.run(reason);
    return this.running;
  }

  private async run(reason: string): Promise<void> {
    this.logger.info("shutdown started", { reason });
    this.state.beginShutdown();

    const force = setTimeout(() => {
      this.logger.error("shutdown timedout, forcing exit", {
        timeoutMs: this.timeoutMs,
      });
      process.exit(1);
    }, this.timeoutMs);
    force.unref();

    try {
      for (const stoppable of this.stoppables) {
        await stoppable.stop();
        this.logger.info("stopped", {
          name: stoppable.name,
        });
      }
      this.logger.info("shutdown complete");
      process.exit(0);
    } catch (err) {
      this.logger.error("shutdown failed", {
        err: String(err),
      });
      process.exit(1);
    }
  }
}
