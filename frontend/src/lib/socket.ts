import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket(token?: string): Socket {
  if (!socket) {
    socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:4000", {
      autoConnect: false,
      auth: token ? { token } : undefined,
      withCredentials: true,
    });
  }
  return socket;
}

export function connectSocket(token?: string) {
  const s = getSocket(token);
  if (token) s.auth = { token };
  if (!s.connected) s.connect();
  return s;
}

export function disconnectSocket() {
  socket?.disconnect();
}
