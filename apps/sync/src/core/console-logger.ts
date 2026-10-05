import { Logger } from "./logger";

export class ConsoleLogger implements Logger {
  info(message: string, meta?: Record<string, unknown>): void {
    console.log(message, meta ?? "");
  }

  error(message: string, meta?: Record<string, unknown>): void {
    console.log(message, meta ?? "");
  }
}
