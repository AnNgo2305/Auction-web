import { io, type Socket } from 'socket.io-client';
import { PRESENCE_EVENTS } from '@/features/presence/presence-socket.constant';
import type { PresenceSubscriptionPayload } from '@/features/presence/payload/presence-subscription.payload';
import { refreshAccessToken } from '@/shared/api/auth-session';
import { emitLogoutEvent } from '@/shared/api/auth-event';
import { usePresenceStore } from '@/shared/stores/presence.store';
import type { OnlineEvent } from '@/features/presence/event/online.event';
import type { OfflineEvent } from '@/features/presence/event/offline.event';
import type { PresenceSnapshotEvent } from '@/features/presence/event/presence-snapshot.event';

const HEARTBEAT_INTERVAL_MS = 20_000;
let socket: Socket | null = null;
let heartbeatTimer: ReturnType<typeof setInterval> | null = null;

/**
 * Open the /presence socket connection and start the heartbeat loop.
 * Call ONCE, e.g. right after the user is authenticated.
 *
 * This function intentionally owns ONLY page-agnostic infra: creating the
 * connection and keeping it alive via heartbeat. Everything that differs
 * per page/screen — what to re-subscribe to on reconnect, what to do on
 * disconnect (e.g. ChatPage cares about the open conversation's peer,
 * ProfilePage cares about the profile owner) — is left to each caller via
 * getPresenceSocket(), so they can attach their own 'connect'/'disconnect'
 * listeners with page-specific logic.
 */
export function connectPresenceSocket(): void {
  if (socket) return; // already connected

  const { setUserOnline, setUserOffline, reconcilePresence } =
    usePresenceStore.getState();

  socket = io(`${import.meta.env.VITE_API_URL}/presence`, {
    withCredentials: true,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
  });

  socket.on('connect', () => {
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer);
    }
    heartbeatTimer = setInterval(() => {
      socket?.emit(PRESENCE_EVENTS.HEARTBEAT);
    }, HEARTBEAT_INTERVAL_MS);
  });

  socket.on('disconnect', () => {
    if (heartbeatTimer) clearInterval(heartbeatTimer);
  });

  socket.on(PRESENCE_EVENTS.EXCEPTION, async ({ errorCode }) => {
    if (errorCode !== 'ACCESS_TOKEN_EXPIRED') {
      socket?.disconnect();
      socket = null;
      emitLogoutEvent();
      return;
    }

    try {
      await refreshAccessToken();
      socket?.connect();
    } catch {
      emitLogoutEvent();
    }
  });

  socket.on(PRESENCE_EVENTS.PRESENCE_ONLINE, ({ userId }: OnlineEvent) => {
    setUserOnline(userId);
  });

  socket.on(
    PRESENCE_EVENTS.PRESENCE_OFFLINE,
    ({ userId, lastSeen }: OfflineEvent) => {
      setUserOffline(userId, lastSeen);
    },
  );

  socket.on(
    PRESENCE_EVENTS.PRESENCE_SNAPSHOT,
    ({ onlineMap, lastSeenMap }: PresenceSnapshotEvent) => {
      reconcilePresence({
        onlineMap,
        lastSeenMap,
      });
    },
  );
}

/**
 * Close the /presence socket. Call on logout, or app teardown.
 */
export function disconnectPresenceSocket(): void {
  if (heartbeatTimer) clearInterval(heartbeatTimer);
  socket?.disconnect();
  socket = null;
}

/**
 * Returns the current socket instance so callers can attach their own
 * listeners (connect/disconnect/PRESENCE_ONLINE/PRESENCE_OFFLINE/...) and
 * detach them on cleanup with socket.off(...). Returns null if not
 * connected yet.
 */
export function getPresenceSocket(): Socket | null {
  return socket;
}

/**
 * Start watching these userIds for presence changes. Thin wrapper —
 * just emits; callers own their own re-subscribe-on-reconnect logic
 * (see getPresenceSocket() usage in each page).
 */
export function subscribePresence(userIds: string[]): void {
  if (userIds.length === 0) return;
  const payload: PresenceSubscriptionPayload = { userIds };
  socket?.emit(PRESENCE_EVENTS.PRESENCE_SUBSCRIBE, payload);
}

/**
 * Stop watching these userIds.
 */
export function unsubscribePresence(userIds: string[]): void {
  if (userIds.length === 0) return;
  const payload: PresenceSubscriptionPayload = { userIds };
  socket?.emit(PRESENCE_EVENTS.PRESENCE_UNSUBSCRIBE, payload);
}
