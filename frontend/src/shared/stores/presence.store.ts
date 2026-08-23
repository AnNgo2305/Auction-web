import { create } from 'zustand';

interface PresenceStoreState {
  // The set of user IDs who are currently online.
  onlineUsers: Set<string>;

  // Maps each user ID to their last-seen timestamp.
  lastSeenMap: Map<string, string | null>;
}

interface PresenceStoreActions {
  // Mark a user as online and clear their stale last-seen entry.
  setUserOnline: (userId: string) => void;

  // Mark a user as offline and record their last-seen timestamp.
  setUserOffline: (userId: string, lastSeen: string | null) => void;

  // Replace the entire presence snapshot (used on initial load / reconnect).
  reconcilePresence: (snapshot: {
    onlineMap: Record<string, boolean>;
    lastSeenMap: Record<string, string | null>;
  }) => void;

  // Clear all online users (e.g. socket disconnected) and last-seen data.
  resetPresence: () => void;

  // Clear presence data for the specified users (e.g. after unsubscribing).
  clearUsers: (userIds: string[]) => void;
}

type PresenceStore = PresenceStoreState & PresenceStoreActions;

export const usePresenceStore = create<PresenceStore>((set) => ({
  onlineUsers: new Set(),
  lastSeenMap: new Map(),

  setUserOnline: (userId) =>
    set((state) => {
      const onlineUsers = new Set(state.onlineUsers);
      onlineUsers.add(userId);

      const lastSeenMap = new Map(state.lastSeenMap);
      lastSeenMap.delete(userId);

      return {
        onlineUsers,
        lastSeenMap,
      };
    }),

  setUserOffline: (userId, lastSeen) =>
    set((state) => {
      const onlineUsers = new Set(state.onlineUsers);
      onlineUsers.delete(userId);

      const lastSeenMap = new Map(state.lastSeenMap);
      lastSeenMap.set(userId, lastSeen ?? new Date().toISOString());

      return {
        onlineUsers,
        lastSeenMap,
      };
    }),

  reconcilePresence: ({ onlineMap, lastSeenMap: snapshotLastSeenMap }) =>
    set((state) => {
      const onlineUsers = new Set(state.onlineUsers);
      const lastSeenMap = new Map(state.lastSeenMap);

      for (const [userId, isOnline] of Object.entries(onlineMap)) {
        if (isOnline) {
          onlineUsers.add(userId);
          lastSeenMap.delete(userId);
        } else {
          onlineUsers.delete(userId);
          lastSeenMap.set(userId, snapshotLastSeenMap[userId] ?? null);
        }
      }

      return {
        onlineUsers,
        lastSeenMap,
      };
    }),

  resetPresence: () =>
    set({
      onlineUsers: new Set(),
      lastSeenMap: new Map(),
    }),

  clearUsers: (userIds) =>
    set((state) => {
      if (userIds.length === 0) {
        return state;
      }

      const onlineUsers = new Set(state.onlineUsers);
      const lastSeenMap = new Map(state.lastSeenMap);

      for (const userId of userIds) {
        onlineUsers.delete(userId);
        lastSeenMap.delete(userId);
      }

      return {
        onlineUsers,
        lastSeenMap,
      };
    }),
}));
