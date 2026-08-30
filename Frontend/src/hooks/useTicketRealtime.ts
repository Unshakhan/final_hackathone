import { useEffect, useState } from "react";
import { getSocket } from "../socket/client";

export type SocketState = "connected" | "reconnecting" | "disconnected";

export function useTicketRealtime(ticketId: string | undefined, onTicketChange: () => void): SocketState {
  const [status, setStatus] = useState<SocketState>(getSocket()?.connected ? "connected" : "disconnected");
  useEffect(() => {
    const socket = getSocket();
    if (!socket || !ticketId) return;
    const join = () => socket.emit("ticket:join", { ticketId });
    const connected = () => { setStatus("connected"); join(); };
    const disconnected = () => setStatus("disconnected");
    const reconnecting = () => setStatus("reconnecting");
    const changed = (payload: { ticketId?: string }) => { if (payload.ticketId === ticketId) onTicketChange(); };
    socket.on("connect", connected);
    socket.on("disconnect", disconnected);
    socket.on("connect_error", reconnecting);
    socket.io.on("reconnect_attempt", reconnecting);
    socket.on("ticket:status-updated", changed);
    socket.on("ticket:resolved", changed);
    if (socket.connected) join(); else void Promise.resolve().then(reconnecting);
    return () => {
      socket.emit("ticket:leave", { ticketId });
      socket.off("connect", connected);
      socket.off("disconnect", disconnected);
      socket.off("connect_error", reconnecting);
      socket.io.off("reconnect_attempt", reconnecting);
      socket.off("ticket:status-updated", changed);
      socket.off("ticket:resolved", changed);
    };
  }, [ticketId, onTicketChange]);
  return status;
}
