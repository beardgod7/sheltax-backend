export function getAvailableTourDates(availableDays: string[], month: number, year: number): string[] {
  const dates: string[] = [];
  const daysOfWeek: Record<string, number> = {
    Sunday: 0,
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
  };

  const targetDays = availableDays.map((day) => daysOfWeek[day]);
  const daysInMonth = new Date(year, month, 0).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day);
    const dayOfWeek = date.getDay();

    if (targetDays.includes(dayOfWeek)) {
      if (date.getTime() >= new Date().setHours(0, 0, 0, 0)) {
        const formattedDate = date.toISOString().split('T')[0];
        dates.push(formattedDate);
      }
    }
  }

  return dates;
}

export function isDateAvailable(dateString: string, availableDays: string[]): boolean {
  const date = new Date(dateString);
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayName = dayNames[date.getDay()];

  const today = new Date().setHours(0, 0, 0, 0);
  if (date.getTime() < today) {
    return false;
  }

  return availableDays.includes(dayName);
}

export function getDateRange(startDate: Date | string, endDate: Date | string): string[] {
  const dates: string[] = [];
  const currentDate = new Date(startDate);
  const end = new Date(endDate);

  while (currentDate <= end) {
    dates.push(currentDate.toISOString().split('T')[0]);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
}

export function formatDate(date: string | Date, format: 'short' | 'long' | 'full' = 'long'): string {
  const d = new Date(date);

  const options: Record<string, Intl.DateTimeFormatOptions> = {
    short: { month: 'short', day: 'numeric', year: 'numeric' },
    long: { month: 'long', day: 'numeric', year: 'numeric' },
    full: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' },
  };

  return d.toLocaleDateString('en-US', options[format] || options.long);
}

export function getDaysBetween(startDate: Date | string, endDate: Date | string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}
