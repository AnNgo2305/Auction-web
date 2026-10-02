export const BID_EVENTS = {
  // Client emits → Server receives
  // Client emits this event to place a new bid.
  BID_PLACE: 'bid:place',

  // Server emits → All clients in auction receive
  // Server notifies other clients that a new bid has been successfully created.
  BID_NEW: 'bid:new',

  // Server emits → Sending client receives
  // Server confirms that the bid was successfully placed.
  BID_ACK: 'bid:ack',

  // Server emits → Sending client receives
  // Server notifies the client that the bid operation failed.
  BID_ERROR: 'bid:error',

  // Client emits → Server receives
  // Client emits this event to join an auction room.
  AUCTION_JOIN: 'auction:join',
} as const;
