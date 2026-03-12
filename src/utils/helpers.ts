import { RowColor } from '../types';

export const DAYS = ['Pazar','Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi'];

export function timeToMins(t: string): number {
  if (!t) return 0;
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

export function minsToHM(mins: number): string {
  if (mins <= 0) return '0:00';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}:${String(m).padStart(2, '0')}`;
}

export function getRowColor(startTime: string, endTime: string, isHoliday: boolean): RowColor {
  if (isHoliday) return 'purple';
  if (!startTime || !endTime) return 'none';
  const total = timeToMins(endTime) - timeToMins(startTime);
  if (total < 9 * 60 + 30) return 'red';
  if (total <= 10 * 60 + 30) return 'yellow';
  return 'blue';
}

export function getDayName(dateStr: string): string {
  const [d, m, y] = dateStr.split('.').map(Number);
  const date = new Date(y, m - 1, d);
  return DAYS[date.getDay()] ?? '';
}

export function todayStr(): string {
  const now = new Date();
  const d = String(now.getDate()).padStart(2, '0');
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const y = now.getFullYear();
  return `${d}.${m}.${y}`;
}

export function parseDate(dateStr: string): Date {
  const [d, m, y] = dateStr.split('.').map(Number);
  return new Date(y, m - 1, d);
}

/** Days elapsed from startDate to today */
export function calcElapsedDays(startDateStr: string): number {
  const start = parseDate(startDateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  start.setHours(0, 0, 0, 0);
  return Math.max(0, Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
}

/** Human-readable elapsed time: "1 yıl 9 ay 5 gün" */
export function calcElapsedLabel(startDateStr: string): string {
  const start = parseDate(startDateStr);
  const today = new Date();
  let years  = today.getFullYear() - start.getFullYear();
  let months = today.getMonth()    - start.getMonth();
  let days   = today.getDate()     - start.getDate();
  if (days   < 0) { months--; const prev = new Date(today.getFullYear(), today.getMonth(), 0); days += prev.getDate(); }
  if (months < 0) { years--;  months += 12; }
  const parts: string[] = [];
  if (years  > 0) parts.push(`${years} yıl`);
  if (months > 0) parts.push(`${months} ay`);
  if (days   > 0) parts.push(`${days} gün`);
  return parts.join(' ') || '0 gün';
}

/** Elapsed as decimal years e.g. 1.8 */
export function calcElapsedYears(startDateStr: string): string {
  const days = calcElapsedDays(startDateStr);
  return (days / 365).toFixed(1);
}

/** Days until next Monday */
export function daysUntilNextWeek(): number {
  const d = new Date();
  return (8 - d.getDay()) % 7 || 7;
}

/** Days until 1st of next month */
export function daysUntilNextMonth(): number {
  const n = new Date();
  const next = new Date(n.getFullYear(), n.getMonth() + 1, 1);
  return Math.ceil((next.getTime() - n.getTime()) / (1000*60*60*24));
}

/** Days until Jan 1 of next year */
export function daysUntilNextYear(): number {
  const n = new Date();
  const next = new Date(n.getFullYear() + 1, 0, 1);
  return Math.ceil((next.getTime() - n.getTime()) / (1000*60*60*24));
}

export function getWeekLabel(entries: { date: string }[], offset: number): string {
  const slice = entries.slice(offset * 7, offset * 7 + 7);
  if (!slice.length) return '';
  return `${slice[slice.length - 1].date} - ${slice[0].date}`;
}

export function calcWeekStats(entries: { startTime: string; endTime: string; isHoliday: boolean }[]) {
  let total = 0, days = 0;
  entries.forEach(e => {
    if (!e.isHoliday && e.startTime && e.endTime) {
      total += timeToMins(e.endTime) - timeToMins(e.startTime);
      days++;
    }
  });
  return { totalMinutes: total, days, targetMinutes: 47 * 60 + 30 };
}

export function isWeekend(dateStr: string): boolean {
  const d = parseDate(dateStr).getDay();
  return d === 0 || d === 6;
}

export function formatDateLong(dateStr: string): string {
  const days = ['Pazar','Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi'];
  const months = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran',
                  'Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
  const d = parseDate(dateStr);
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()} ${days[d.getDay()]}`;
}
