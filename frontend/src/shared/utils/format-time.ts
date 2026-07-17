/**
 * ISO -> yyyy-MM-dd (for <input type="date">)
 */
export function formatIsoToDateInput(iso: string | null | undefined): string {
  if (!iso) return '';

  return iso.split('T')[0] ?? '';
}

/**
 * ISO -> dd/MM/yyyy
 * Example: 2026-07-12T00:00:00.000Z -> 12/07/2026
 */
export function formatIsoToDate(
  iso: string | null | undefined,
): string {
  if (!iso) return '';

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(iso));
}

/**
 * yyyy-MM-dd -> ISO
 */
export function formatDateInputToIso(
  date: string | null | undefined,
): string | null {
  if (!date) return null;

  return new Date(date).toISOString();
}

/**
 * ISO -> relative time
 * Examples:
 * - Just now
 * - 5 minutes ago
 * - 2 hours ago
 * - 3 days ago
 * - 2 months ago
 * - 1 year ago
 */
export function formatIsoToNow(
  iso: string | null | undefined,
): string {
  if (!iso) return '';

  const date = new Date(iso);
  const now = new Date();

  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 10) return 'Just now';

  const rtf = new Intl.RelativeTimeFormat('en', {
    numeric: 'auto',
  });

  const intervals = [
    { unit: 'year', seconds: 60 * 60 * 24 * 365 },
    { unit: 'month', seconds: 60 * 60 * 24 * 30 },
    { unit: 'week', seconds: 60 * 60 * 24 * 7 },
    { unit: 'day', seconds: 60 * 60 * 24 },
    { unit: 'hour', seconds: 60 * 60 },
    { unit: 'minute', seconds: 60 },
    { unit: 'second', seconds: 1 },
  ] as const;

  for (const interval of intervals) {
    const value = Math.floor(diffInSeconds / interval.seconds);

    if (value >= 1) {
      return rtf.format(-value, interval.unit);
    }
  }

  return 'Just now';
}
