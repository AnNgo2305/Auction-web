import { useEffect } from 'react';
import type { Socket } from 'socket.io-client';
import {
  getPresenceSocket,
  subscribePresence,
  unsubscribePresence,
} from '@/features/presence/presence-socket.service';
import { usePresenceStore } from '@/shared/stores/presence.store.ts';

type UsePresenceSocketOptions = {
  userIds: string[];
};

export function usePresenceSocket({
  userIds,
}: UsePresenceSocketOptions): Socket | null {
  const { clearUsers } = usePresenceStore();

  useEffect(() => {
    const socket = getPresenceSocket();
    if (!socket || userIds.length === 0) {
      return;
    }

    const handleConnect = () => {
      subscribePresence(userIds);
    };

    if (socket.connected) {
      subscribePresence(userIds);
    }

    socket.on('connect', handleConnect);

    return () => {
      socket.off('connect', handleConnect);
      unsubscribePresence(userIds);
      clearUsers(userIds);
    };
  }, [userIds, clearUsers]);

  return getPresenceSocket();
}
