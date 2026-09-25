export const BID_EVENTS = {
  // Client emits → Server receives
  // Client emits this event to join the room of an auction.
  AUCTION_JOIN: 'auction:join',

  // Server emits → Other clients in auction receive
  // Server notifies other clients that a user joined the auction room.
  AUCTION_USER_JOINED: 'auction:user:joined',

  // Client emits → Server receives
  // Client emits this event to leave the room of an auction.
  AUCTION_LEAVE: 'auction:leave',

  // Server emits → Other clients in auction receive
  // Server notifies other clients that a user left the auction room.
  AUCTION_USER_LEFT: 'auction:user:left',

  // Client emits → Server receives
  // Client emits this event to place a new bid.
  BID_PLACE: 'bid:place',

  // Server emits → Other clients in auction receive
  // Server notifies other clients that a new bid has been successfully created.
  BID_NEW: 'bid:new',

  // Server emits → Sending client receives
  // Server confirms that the bid was successfully placed.
  BID_ACK: 'bid:ack',

  // Server emits → Sending client receives
  // Server notifies the client that the bid operation failed.
  BID_ERROR: 'bid:error',
} as const;
