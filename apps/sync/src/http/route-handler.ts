import { IncomingMessage, ServerResponse } from "node:http";

export interface RouteHandler {
  matches(req: IncomingMessage): boolean;
  handle(req: IncomingMessage, res: ServerResponse): void;
}
