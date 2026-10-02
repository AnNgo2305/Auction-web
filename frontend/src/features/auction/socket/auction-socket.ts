import { io, type Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getAuctionSocket(): Socket {
  socket ??= io(`${import.meta.env.VITE_API_URL}/auctions`, {
    withCredentials: true,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    autoConnect: true,
  });

  return socket;
}
