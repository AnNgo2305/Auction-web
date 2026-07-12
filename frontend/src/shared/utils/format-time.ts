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
