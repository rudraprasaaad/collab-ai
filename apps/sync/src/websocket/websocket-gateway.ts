import { WebSocketServer } from "ws";
import { DocumentPathParser } from "./document-path-parser";
import { ConnectionHandler } from "./connection-handler";
import { ClientRequest, IncomingMessage } from "node:http";
import { Duplex } from "node:stream";

export class WebSocketGateWay {
  readonly name = "websocket-gateway";

  private readonly wss = new WebSocketServer({ noServer: true });

  constructor(
    private readonly pathParser: DocumentPathParser,
    private readonly handler: ConnectionHandler,
  ) {}

  handleUpgrade(req: IncomingMessage, socket: Duplex, head: Buffer): void {
    const docId = this.pathParser.parse(req.url);
    if (!docId) {
      socket.write("HTTP/1.1 404 Not Found\r\nConnection: close\r\n\r\n");
      socket.destroy();
      return;
    }
    this.wss.handleUpgrade(req, socket, head, (ws) => {
      this.handler.onConnection(ws, { docId });
    });
  }

  async stop(): Promise<void> {
    for (const client of this.wss.clients) {
      client.close(1001, "server shutting down");
    }

    await new Promise<void>((resolve, reject) => {
      this.wss.close((err) => (err ? reject(err) : resolve()));
    });
  }
}
