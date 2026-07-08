export function formatCount(count: number): string {
  if (count < 1_000) {
    return count.toString();
  }

  if (count < 1_000_000) {
    const value = count / 1_000;
    return `${Number(value.toFixed(value >= 10 ? 0 : 1))}K`;
  }

  if (count < 1_000_000_000) {
    const value = count / 1_000_000;
    return `${Number(value.toFixed(value >= 10 ? 0 : 1))}M`;
  }

  const value = count / 1_000_000_000;
  return `${Number(value.toFixed(value >= 10 ? 0 : 1))}B`;
}
