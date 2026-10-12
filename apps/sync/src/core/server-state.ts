export class ServerState {
  private shuttingDown = false;

  beginShutdown(): void {
    this.shuttingDown = true;
  }

  isShuttingDown(): boolean {
    return this.shuttingDown;
  }
}
