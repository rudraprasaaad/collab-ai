export class AppConfig {
  readonly port: number;

  constructor(env: NodeJS.ProcessEnv = process.env) {
    this.port = Number(env.PORT ?? 1234);
    if (Number.isNaN(this.port)) {
      throw new Error(`Invalid PORT: ${env.PORT}`);
    }
  }
}
