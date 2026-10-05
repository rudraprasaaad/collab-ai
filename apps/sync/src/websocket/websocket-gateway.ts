import { WebSocketServer } from "ws";
import { DocumentPathParser } from "./document-path-parser";
import { ConnectionHandler } from "./connection-handler";
import { IncomingMessage } from "node:http";
import { Duplex } from "node:stream";

export class WebSocketGateWay {
  private readonly wss = new WebSocketServer({ noServer: true });

  constructor(
    private readonly pathParser: DocumentPathParser,
    private readonly handler: ConnectionHandler,
  ) {}

  handleUpgrade(req: IncomingMessage, socket: Duplex, head: Buffer): void {
    const docId = this.pathParser.parse(req.url);
    if (!docId) {
      this.reject(socket, 404, "Not Found");
      return;
    }

    this.wss.handleUpgrade(req, socket, head, (ws) => {
      this.handler.onConnection(ws, { docId });
    });
  }

  private reject(socket: Duplex, status: number, text: string): void {
    socket.write(`HTTP/1.1 ${status} ${text}\r\nConnection: close\r\n\r\n`);
    socket.destroy();
  }
}
