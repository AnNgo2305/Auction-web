export const AUCTION_EVENTS = {
  AUCTION_STARTED: 'auction:started',

  AUCTION_EXTENDED: 'auction:extended',

  AUCTION_COMPLETED: 'auction:completed',

  AUCTION_CLOSED: 'auction:closed',

  AUCTION_REOPENED: 'auction:reopened',

  AUCTION_WINNER: 'auction:winner',

  AUCTION_JOIN: 'auction:join',

  AUCTION_LEAVE: 'auction:leave',

  BIDDER_JOINED: 'auction:bidder:joined',

  BIDDER_SNAPSHOT: 'auction:bidder:snapshot',

  BIDDER_LEFT: 'auction:bidder:left',

  AUCTION_UPDATED: 'auction:updated',

  AUCTION_SUBSCRIBE: 'auction:subscribe',

  AUCTION_UNSUBSCRIBE: 'auction:unsubscribe',
} as const;
