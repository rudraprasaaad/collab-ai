export class AppConfig {
  readonly port: number;
  readonly heartbeatIntervalMs: number;
  readonly shutdownTimeoutMs: number;

  constructor(env: NodeJS.ProcessEnv = process.env) {
    this.port = AppConfig.readPositiveInt(env, "PORT", 1234);
    this.heartbeatIntervalMs = AppConfig.readPositiveInt(
      env,
      "HEARTBEAT_INTERVAL_MS",
      30_000,
    );
    this.shutdownTimeoutMs = AppConfig.readPositiveInt(
      env,
      "SHUTDOWN_TIMEOUT_MS",
      10_000,
    );
  }

  private static readPositiveInt(
    env: NodeJS.ProcessEnv,
    key: string,
    fallback: number,
  ): number {
    const raw = env[key];
    if (raw === undefined) return fallback;

    const value = Number(raw);
    if (!Number.isInteger(value) || value <= 0) {
      throw new Error(`Invalid ${key}: ${raw}`);
    }
    return value;
  }
}
