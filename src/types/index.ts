export interface ShiftEntry {
  id: string;
  date: string;       // "DD.MM.YYYY"
  day: string;        // "Pazartesi" etc.
  startTime: string;  // "HH:MM"
  endTime: string;    // "HH:MM"
  isHoliday: boolean;
}

export type RowColor = 'red' | 'yellow' | 'blue' | 'purple' | 'none';

export interface WeekStats {
  totalMinutes: number;
  targetMinutes: number;
  days: number;
}

export interface SalaryRow {
  id: string;
  amount: number;
  date: string;
}
