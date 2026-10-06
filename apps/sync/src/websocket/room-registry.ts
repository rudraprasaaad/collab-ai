import { Logger } from "../core/logger";
import { Room } from "./room";
import type { RawData, WebSocket } from "ws";

export class RoomRegistry {
  private readonly rooms = new Map<string, Room>();

  constructor(private readonly logger: Logger) {}

  join(docId: string, socket: WebSocket): void {
    let room = this.rooms.get(docId);
    if (!room) {
      room = new Room(docId);
      this.rooms.set(docId, room);
      this.logger.info("room created", { docId });
    }
    room.add(socket);
  }

  leave(docId: string, socket: WebSocket): void {
    const room = this.rooms.get(docId);
    if (!room || !room.remove(socket)) return;

    if (room.isEmpty()) {
      this.rooms.delete(docId);
      this.logger.info("room removed", { docId });
    }
  }

  relay(
    docId: string,
    sender: WebSocket,
    data: RawData,
    isBinary: boolean,
  ): void {
    this.rooms.get(docId)?.broadcast(sender, data, isBinary);
  }

  roomCount(): number {
    return this.rooms.size;
  }
}
