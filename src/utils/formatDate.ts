export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-PH', {
    year: 'numeric', month: 'short', day: 'numeric',
  }).format(new Date(date))
}

export function formatDateLong(date: string | Date): string {
  return new Intl.DateTimeFormat('en-PH', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  }).format(new Date(date))
}