export interface PresenceSnapshotEvent {
  // Maps each requested userId to whether they are currently online.
  onlineMap: Record<string, boolean>;

  // Maps each requested userId to their last-seen timestamp (ISO string),
  // or null if they've never been seen / are currently online.
  lastSeenMap: Record<string, string | null>;
}
