import { create } from 'zustand';

interface ChatStoreState {
  // The ID of the conversation currently opened by the user.
  activeConversationId: string | null;

  // The set of user IDs who are currently online.
  onlineUsers: Set<string>;

  // Maps each user ID to their last-seen timestamp.
  lastSeenMap: Map<string, string | null>;

  // Maps each conversation ID to the user ID who is currently typing.
  typingUsers: Map<string, string>;

  // Set the peer's latest read timestamp for a conversation.
  peerReadAt: Map<string, string | null>;
}

interface ChatStoreActions {
  // Set which conversation is currently open.
  setActiveConversation: (id: string | null) => void;

  // Mark a user as online and clear their stale last-seen entry.
  setUserOnline: (userId: string) => void;

  // Mark a user as offline and record their last-seen timestamp.
  setUserOffline: (userId: string, lastSeen: string | null) => void;

  // Replace the entire presence snapshot (used on initial load / reconnect).
  reconcilePresence: (snapshot: {
    onlineUserIds: string[];
    lastSeen: Record<string, string | null>;
  }) => void;

  // Clear all online users (e.g. socket disconnected) and last-seen data.
  resetPresence: () => void;

  // Mark peer as typing in a given conversation.
  setPeerTyping: (conversationId: string, userId: string) => void;

  // Clear typing state for peer in a conversation.
  clearPeerTyping: (conversationId: string, userId: string) => void;

  // Clear typing state for a conversation entirely (e.g. on leaving it).
  clearTypingForConversation: (conversationId: string) => void;

  // Clear typing state for every conversation at once.
  clearAllTyping: () => void;

  // Set the peer's latest read timestamp for a conversation.
  setPeerReadAt: (conversationId: string, lastReadAt: string | null) => void;

  // Update a single peer's read timestamp, keeping only the most recent value.
  updatePeerReadAt: (
    conversationId: string,
    userId: string,
    seenAt: string,
  ) => void;

  // Clear peer read receipts for every conversation at once.
  clearAllPeerReadAt: () => void;
}

type ChatStore = ChatStoreState & ChatStoreActions;

export const useChatStore = create<ChatStore>((set) => ({
  activeConversationId: null,
  onlineUsers: new Set(),
  lastSeenMap: new Map(),
  typingUsers: new Map(),
  peerReadAt: new Map(),

  setActiveConversation: (id) => set({ activeConversationId: id }),

  setUserOnline: (userId) =>
    set((state) => {
      const onlineUsers = new Set(state.onlineUsers);
      onlineUsers.add(userId);
      const lastSeenMap = new Map(state.lastSeenMap);
      lastSeenMap.delete(userId);
      return { onlineUsers, lastSeenMap };
    }),

  setUserOffline: (userId, lastSeen) =>
    set((state) => {
      const onlineUsers = new Set(state.onlineUsers);
      onlineUsers.delete(userId);
      const lastSeenMap = new Map(state.lastSeenMap);
      lastSeenMap.set(userId, lastSeen ?? new Date().toISOString());
      return { onlineUsers, lastSeenMap };
    }),

  setPeerTyping: (conversationId, userId) =>
    set((state) => {
      const updatedTypingUsers = new Map(state.typingUsers);
      updatedTypingUsers.set(conversationId, userId);
      return { typingUsers: updatedTypingUsers };
    }),

  clearPeerTyping: (conversationId, userId) =>
    set((state) => {
      const currentUserId = state.typingUsers.get(conversationId);
      if (currentUserId !== userId) return state;

      const updated = new Map(state.typingUsers);
      updated.delete(conversationId);
      return { typingUsers: updated };
    }),

  clearTypingForConversation: (conversationId) =>
    set((state) => {
      if (!state.typingUsers.has(conversationId)) return state;
      const updated = new Map(state.typingUsers);
      updated.delete(conversationId);
      return { typingUsers: updated };
    }),

  clearAllTyping: () => set({ typingUsers: new Map() }),

  resetPresence: () =>
    set({
      onlineUsers: new Set(),
      lastSeenMap: new Map(),
    }),

  reconcilePresence: ({ onlineUserIds, lastSeen }) =>
    set({
      onlineUsers: new Set(onlineUserIds),
      lastSeenMap: new Map(Object.entries(lastSeen)),
    }),

  setPeerReadAt: (conversationId, lastReadAt) =>
    set((state) => {
      const next = new Map(state.peerReadAt);
      if (lastReadAt === null) next.delete(conversationId);
      else next.set(conversationId, lastReadAt);
      return { peerReadAt: next };
    }),

  updatePeerReadAt: (conversationId, _userId, seenAt) =>
    set((state) => {
      const prev = state.peerReadAt.get(conversationId);
      if (prev && new Date(prev) >= new Date(seenAt)) return state;

      const next = new Map(state.peerReadAt);
      next.set(conversationId, seenAt);
      return { peerReadAt: next };
    }),

  clearAllPeerReadAt: () => set({ peerReadAt: new Map() }),
}));
