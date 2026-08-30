import { io, type Socket } from "socket.io-client";

let socket: Socket | null = null;

export const connectSocket = (token: string): Socket => {
  if (!socket) {
    const url = (import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");
    socket = io(url, { autoConnect: false, auth: { token }, reconnection: true });
  } else {
    socket.auth = { token };
  }
  if (!socket.connected) socket.connect();
  return socket;
};

export const getSocket = (): Socket | null => socket;
export const disconnectSocket = (): void => { socket?.disconnect(); socket = null; };
