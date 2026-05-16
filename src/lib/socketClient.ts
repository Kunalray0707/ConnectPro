import { io, type Socket } from 'socket.io-client';

const DEFAULT_URL = 'http://localhost:4242';

type ConnectedPayload = { ok: boolean };

let socketSingleton: Socket | null = null;

export function getSocket(): Socket {
  if (socketSingleton) return socketSingleton;

  socketSingleton = io(DEFAULT_URL, {
    transports: ['polling', 'websocket'],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 250,
  });

  return socketSingleton;
}

export function disconnectSocket(): void {
  if (socketSingleton) {
    socketSingleton.disconnect();
    socketSingleton = null;
  }
}

export function onConnected(handler: (payload: ConnectedPayload) => void): () => void {
  const socket = getSocket();
  const listener = (payload: ConnectedPayload) => handler(payload);
  socket.on('connected', listener);

  return () => {
    socket.off('connected', listener);
  };
}
