const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

export function formatRelativeTime(input: number | Date, now: number = Date.now()): string {
  const date = input instanceof Date ? input : new Date(input);
  const diff = now - date.getTime();

  if (Number.isNaN(date.getTime())) return '';
  if (diff < 0) return formatAbsolute(date);
  if (diff < 30 * SECOND) return 'Vừa xong';
  if (diff < MINUTE) return 'Vừa xong';
  if (diff < HOUR) {
    const minutes = Math.floor(diff / MINUTE);
    return `${minutes} phút trước`;
  }
  if (diff < DAY) {
    const hours = Math.floor(diff / HOUR);
    return `${hours} giờ trước`;
  }
  if (diff < 7 * DAY) {
    const days = Math.floor(diff / DAY);
    return `${days} ngày trước`;
  }
  return formatAbsolute(date);
}

export function formatAbsolute(date: Date): string {
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
