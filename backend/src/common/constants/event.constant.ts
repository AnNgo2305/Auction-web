export const INTERNAL_EVENTS = {
  // Emitted when a chat message is successfully sent and should trigger notification processing.
  MESSAGE_SENT: 'chat.message.sent',

  // Emitted when a bidder sends a follow request to a seller.
  FOLLOW_REQUESTED: 'follow.requested',

  // Emitted when a seller accepts a follow request from a bidder.
  FOLLOW_ACCEPTED: 'follow.accepted',

  // Emitted when a seller successfully creates an auction.
  AUCTION_CREATED: 'auction.created',

  // Emitted when a seller successfully updates an auction.
  AUCTION_UPDATED: 'auction.updated',

  // Emitted when a seller cancels an auction.
  AUCTION_CANCELLED: 'auction.cancelled',

  // Emitted when an auction is opened and becomes available for bidding.
  AUCTION_STARTED: 'auction.started',

  // Emitted when an auction is closed.
  AUCTION_ENDED: 'auction.ended',

  // Emitted when an auction is extended.
  AUCTION_EXTENDED: 'auction.extended',

  // Emitted when an auction is reopened for a new bidding round.
  AUCTION_REOPENED: 'auction.reopened',

  // Emitted when an auction is fully closed after settlement.
  AUCTION_CLOSED: 'auction.closed',

  // Emitted when the winner of an auction is determined.
  AUCTION_WINNER: 'auction.winner',

  // Emitted when a bid is successfully placed and should trigger watchlist notification processing.
  BID_PLACED: 'bid.placed',
} as const;
