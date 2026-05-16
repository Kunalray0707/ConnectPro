import { useEffect, useState } from 'react';
import { getSocket } from './socketClient';

type ConnectedPayload = { ok: boolean };

export function useSocketConnection() {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socket = getSocket();

    const onConnected = (payload: ConnectedPayload) => {
      if (payload?.ok) setConnected(true);
    };

    const onDisconnect = () => setConnected(false);

    socket.on('connected', onConnected);
    socket.on('disconnect', onDisconnect);

    return () => {
      socket.off('connected', onConnected);
      socket.off('disconnect', onDisconnect);
    };
  }, []);

  return { connected };
}
