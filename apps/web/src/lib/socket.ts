import { io, Socket } from "socket.io-client";
import { ClientToServerEvents, ServerToClientEvents } from "@siqap/shared";

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL?.trim() ||
  (typeof window !== "undefined"
    ? `http://${window.location.hostname}:3001`
    : "http://localhost:3001");

export type TypedClientSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

let socketInstance: TypedClientSocket | null = null;

export function getSocket(): TypedClientSocket {
  if (!socketInstance) {
    socketInstance = io(SOCKET_URL, {
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      transports: ["websocket", "polling"],
    });
  }
  return socketInstance;
}
