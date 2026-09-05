export const INTERNAL_EVENTS = {
  // Emitted when a chat message is successfully sent and should trigger notification processing.
  MESSAGE_SENT: 'chat.message.sent',

  // Emitted when a bidder sends a follow request to a seller.
  FOLLOW_REQUESTED: 'follow.requested',

  // Emitted when a seller accepts a follow request from a bidder.
  FOLLOW_ACCEPTED: 'follow.accepted',
} as const;
