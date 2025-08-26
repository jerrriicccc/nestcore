/**
 * Formats a Date or string into `YYYY-MM-DD` format (ISO date format)
 */
export function createCurrentDate(date: Date | string): string {
  return new Date(date).toISOString().split('T')[0];
}

export function formattedDate(date: Date | string): string {
  const dateObj = new Date(date);
  return dateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function getTodayFormatted(): string {
  return createCurrentDate(new Date());
}
