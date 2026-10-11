export interface ScreeningDateValue {
  screening_date?: string | null;
  screening_year?: number | null;
  screening_month?: number | null;
  screening_day?: number | null;
}

export function formatScreeningDate(screening: ScreeningDateValue): string {
  let { screening_year: year, screening_month: month, screening_day: day } = screening;
  if (!year && screening.screening_date) {
    const match = screening.screening_date.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      year = Number(match[1]);
      month = Number(match[2]);
      day = Number(match[3]);
    }
  }
  if (!year) return 'Unknown';
  if (!month) return String(year);
  const monthName = new Intl.DateTimeFormat('en-US', { month: 'long' })
    .format(new Date(2000, month - 1, 1));
  return day ? `${monthName} ${day}, ${year}` : `${monthName} ${year}`;
}
