import { WebSocket, type RawData } from "ws";

export class Room {
  private readonly sockets = new Set<WebSocket>();

  constructor(readonly docId: string) {}

  add(socket: WebSocket): void {
    this.sockets.add(socket);
  }

  remove(socket: WebSocket): boolean {
    return this.sockets.delete(socket);
  }

  isEmpty(): boolean {
    return this.sockets.size === 0;
  }

  broadcast(sender: WebSocket, data: RawData, isBinary: boolean): void {
    for (const socket of this.sockets) {
      if (socket === sender) continue;
      if (socket.readyState !== WebSocket.OPEN) continue;

      socket.send(data, { binary: isBinary });
    }
  }
}
