import { RowColor, ShiftEntry } from '../types';

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

export function getRowColor(startTime: string, endTime: string, isHoliday: boolean, standardMins: number = 9 * 60 + 30): RowColor {
  if (isHoliday) return 'purple';
  if (!startTime || !endTime) return 'none';
  const total = timeToMins(endTime) - timeToMins(startTime);
  if (total < standardMins) return 'red';
  if (total <= standardMins + 60) return 'yellow';
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

export function calcWeekStats(entries: { startTime: string; endTime: string; isHoliday: boolean }[], standardMins: number = 9 * 60 + 30) {
  let total = 0, days = 0, holidayCount = 0;
  entries.forEach(e => {
    if (e.isHoliday) {
      holidayCount++;
    } else if (e.startTime && e.endTime) {
      total += timeToMins(e.endTime) - timeToMins(e.startTime);
      days++;
    }
  });
  const targetMinutes = Math.max(0, 5 * standardMins - holidayCount * standardMins);
  return { totalMinutes: total, days, targetMinutes };
}

export function isWeekend(dateStr: string): boolean {
  const d = parseDate(dateStr).getDay();
  return d === 0 || d === 6;
}

/**
 * Calculates the current goal streak.
 * Consecutive weekdays where worked >= standardMins → streak++
 * Weekends and holidays are skipped (don't break or add to streak).
 * If today hasn't been entered yet, counting starts from yesterday.
 */
export function calcStreak(entries: ShiftEntry[], standardMins: number): { count: number; label: string } {
  if (!entries.length) return { count: 0, label: 'Henüz seri yok' };

  const entryMap = new Map<string, ShiftEntry>();
  entries.forEach(e => entryMap.set(e.date, e));

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let streak = 0;
  const current = new Date(today);
  let checkedDays = 0;
  const MAX_CHECK = 730;

  while (checkedDays < MAX_CHECK) {
    const dayOfWeek = current.getDay();

    // Skip weekends — they don't count
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      current.setDate(current.getDate() - 1);
      checkedDays++;
      continue;
    }

    const d = String(current.getDate()).padStart(2, '0');
    const m = String(current.getMonth() + 1).padStart(2, '0');
    const y = current.getFullYear();
    const dateStr = `${d}.${m}.${y}`;
    const isToday = current.getTime() === today.getTime();

    const entry = entryMap.get(dateStr);

    if (!entry) {
      if (isToday) {
        // Today not entered yet — look at previous days
        current.setDate(current.getDate() - 1);
        checkedDays++;
        continue;
      }
      // Past weekday with no record — streak broken
      break;
    }

    if (entry.isHoliday) {
      // Holidays are skipped, don't break streak
      current.setDate(current.getDate() - 1);
      checkedDays++;
      continue;
    }

    // Today: still working (start entered, no end yet) — skip
    if (isToday && entry.startTime && !entry.endTime) {
      current.setDate(current.getDate() - 1);
      checkedDays++;
      continue;
    }

    // Today: nothing entered yet — skip (handled above in !entry block,
    // but also possible if entry exists with empty times)
    if (isToday && !entry.startTime) {
      current.setDate(current.getDate() - 1);
      checkedDays++;
      continue;
    }

    if (!entry.startTime || !entry.endTime) {
      // Past day with missing time data — streak broken
      break;
    }

    const worked = timeToMins(entry.endTime) - timeToMins(entry.startTime);
    if (worked >= standardMins) {
      streak++;
    } else {
      break;
    }

    current.setDate(current.getDate() - 1);
    checkedDays++;
  }

  if (streak === 0) return { count: 0, label: 'Henüz seri yok' };
  return { count: streak, label: streak === 1 ? '1 günlük seri' : `${streak} günlük seri` };
}

export function formatDateLong(dateStr: string): string {
  const days = ['Pazar','Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi'];
  const months = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran',
                  'Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
  const d = parseDate(dateStr);
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()} ${days[d.getDay()]}`;
}
