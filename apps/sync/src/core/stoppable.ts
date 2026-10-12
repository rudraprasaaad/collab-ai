export interface Stoppable {
  readonly name: string;
  stop(): void | Promise<void>;
}
