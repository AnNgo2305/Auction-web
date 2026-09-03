import { create } from 'zustand';

interface ChatStoreState {
  // The ID of the conversation currently opened by the user.
  activeConversationId: string | null;

  // Maps each conversation ID to the user ID who is currently typing.
  typingUsers: Map<string, string>;

  // Set the peer's latest read timestamp for a conversation.
  peerReadAt: Map<string, string | null>;

  // Chat constants status.
  isSocketConnected: boolean;
}

interface ChatStoreActions {
  // Set which conversation is currently open.
  setActiveConversation: (id: string | null) => void;

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

  // Set chat constants status.
  setSocketConnected: (connected: boolean) => void;
}

type ChatStore = ChatStoreState & ChatStoreActions;

export const useChatStore = create<ChatStore>((set) => ({
  activeConversationId: null,
  typingUsers: new Map(),
  peerReadAt: new Map(),
  isSocketConnected: false,

  setActiveConversation: (id) => set({ activeConversationId: id }),

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

  setSocketConnected: (connected) => set({ isSocketConnected: connected }),
}));
