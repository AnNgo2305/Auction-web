export const AUCTION_EVENTS = {
  // Server emits → All clients in auction room receive
  // Server notifies clients that the auction has started.
  AUCTION_STARTED: 'auction:started',

  // Server emits → All clients in auction room receive
  // Server notifies clients that the auction end time has been extended.
  AUCTION_EXTENDED: 'auction:extended',

  // Server emits → All clients in auction room receive
  // Server notifies clients that the auction has been completed.
  AUCTION_COMPLETED: 'auction:completed',

  // Server emits → All clients in auction room receive
  // Server notifies clients that the auction has been closed.
  AUCTION_CLOSED: 'auction:closed',

  // Server emits → All clients in auction room receive
  // Server notifies clients about the winner of the auction.
  AUCTION_WINNER: 'auction:winner',

  // Client emits → Server receives
  // Client emits this event to join an auction room.
  AUCTION_JOIN: 'auction:join',

  // Client emits → Server receives
  // Client emits this event to leave an auction room.
  AUCTION_LEAVE: 'auction:leave',

  // Server emits → Other clients in auction room receive
  // Server notifies other clients that a new bidder has joined the auction.
  BIDDER_JOINED: 'auction:bidder:joined',
} as const;
