export function formatPresence(
  isOnline: boolean,
  lastSeen: string | null,
): {
  text: string;
  showDot: boolean;
  variant: 'online' | 'recent' | 'away' | 'offline';
} {
  if (isOnline) {
    return {
      text: 'Online',
      showDot: true,
      variant: 'online',
    };
  }

  if (!lastSeen) {
    return {
      text: 'Offline',
      showDot: false,
      variant: 'offline',
    };
  }

  const lastSeenDate = new Date(lastSeen);
  const now = new Date();

  const diffMs = now.getTime() - lastSeenDate.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffMinutes < 1) {
    return {
      text: 'Just now',
      showDot: false,
      variant: 'recent',
    };
  }

  if (diffMinutes < 60) {
    return {
      text: `Last seen ${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`,
      showDot: false,
      variant: 'recent',
    };
  }

  const diffHours = Math.floor(diffMinutes / 60);

  if (diffHours < 24) {
    return {
      text: `Last seen ${diffHours} hour${diffHours === 1 ? '' : 's'} ago`,
      showDot: false,
      variant: 'away',
    };
  }

  const diffDays = Math.floor(diffHours / 24);

  return {
    text: `Last seen ${diffDays} day${diffDays === 1 ? '' : 's'} ago`,
    showDot: false,
    variant: 'offline',
  };
}
