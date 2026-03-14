/**
 * db.ts — SQLite veritabanı katmanı
 *
 * Tablo şeması:
 *   shifts (
 *     id          TEXT PRIMARY KEY,   -- "DD.MM.YYYY" (tarih = PK)
 *     date        TEXT NOT NULL,      -- "DD.MM.YYYY"
 *     day         TEXT NOT NULL,      -- "Pazartesi" vb.
 *     start_time  TEXT,               -- "08:30" | NULL
 *     end_time    TEXT,               -- "18:00" | NULL
 *     is_holiday  INTEGER NOT NULL DEFAULT 0   -- 0 | 1
 *   )
 */

import * as SQLite from 'expo-sqlite';
import { ShiftEntry } from '../types';
import { getDayName } from './helpers';

// expo-sqlite v14 (Expo 51) — openDatabaseAsync API
let _db: SQLite.SQLiteDatabase | null = null;
let _dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (_db) return _db;
  if (_dbPromise) return _dbPromise;

  _dbPromise = (async () => {
    const db = await SQLite.openDatabaseAsync('shifttracker.db');

    await db.execAsync(`
      PRAGMA journal_mode = WAL;

      CREATE TABLE IF NOT EXISTS shifts (
        id         TEXT PRIMARY KEY,
        date       TEXT NOT NULL,
        day        TEXT NOT NULL,
        start_time TEXT,
        end_time   TEXT,
        is_holiday INTEGER NOT NULL DEFAULT 0
      );
    `);

    _db = db;
    return db;
  })();

  return _dbPromise;
}

// ─── Init: uyumluluk için tutuluyor, getDb artık tabloyu otomatik oluşturur
export async function initDb(): Promise<void> {
  await getDb();
}

// ─── Row → ShiftEntry ─────────────────────────────────────────────────────

interface ShiftRow {
  id: string;
  date: string;
  day: string;
  start_time: string | null;
  end_time: string | null;
  is_holiday: number;
}

function rowToEntry(row: ShiftRow): ShiftEntry {
  return {
    id: row.id,
    date: row.date,
    day: row.day,
    startTime: row.start_time ?? '',
    endTime: row.end_time ?? '',
    isHoliday: row.is_holiday === 1,
  };
}

// ─── CRUD ─────────────────────────────────────────────────────────────────

/** Tüm kayıtları tarihe göre azalan sırada getir */
export async function getAllShifts(): Promise<ShiftEntry[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<ShiftRow>(
    `SELECT * FROM shifts`
  );
  return rows.map(rowToEntry).sort((a, b) => {
    const parse = (d: string) => {
      const [dd, mm, yy] = d.split('.').map(Number);
      return new Date(yy, mm - 1, dd).getTime();
    };
    return parse(b.date) - parse(a.date);
  });
}

/** Tek kayıt getir */
export async function getShift(date: string): Promise<ShiftEntry | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<ShiftRow>(
    `SELECT * FROM shifts WHERE id = ?`, [date]
  );
  return row ? rowToEntry(row) : null;
}

/** Kayıt ekle veya güncelle (aynı tarih varsa üzerine yaz) */
export async function upsertShift(entry: Omit<ShiftEntry, 'id' | 'day'>): Promise<ShiftEntry> {
  const db = await getDb();
  const day = getDayName(entry.date);
  const id = entry.date;

  await db.runAsync(
    `INSERT INTO shifts (id, date, day, start_time, end_time, is_holiday)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       day        = excluded.day,
       start_time = excluded.start_time,
       end_time   = excluded.end_time,
       is_holiday = excluded.is_holiday`,
    [
      id,
      entry.date,
      day,
      entry.startTime || null,
      entry.endTime || null,
      entry.isHoliday ? 1 : 0,
    ]
  );

  return { id, day, ...entry };
}

/** Kayıt sil */
export async function deleteShift(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(`DELETE FROM shifts WHERE id = ?`, [id]);
}

/** Belirli tarih aralığındaki kayıtlar */
export async function getShiftsBetween(from: string, to: string): Promise<ShiftEntry[]> {
  const db = await getDb();
  // Tarihler "DD.MM.YYYY" — doğrudan string karşılaştırması için epoch'a çevirmek gerekir.
  // Bunun yerine tüm veriyi çekip JS'de filtreleriz (yıllık ~250 kayıt, sorun yok).
  const rows = await db.getAllAsync<ShiftRow>(
    `SELECT * FROM shifts ORDER BY date DESC`
  );
  const toTs = (d: string) => {
    const [dd, mm, yy] = d.split('.').map(Number);
    return new Date(yy, mm - 1, dd).getTime();
  };
  const fromTs = toTs(from);
  const toTs2 = toTs(to);
  return rows
    .filter(r => { const t = toTs(r.date); return t >= fromTs && t <= toTs2; })
    .map(rowToEntry);
}

/** Veritabanını kapat (uygulama kapanırken) */
export async function closeDb(): Promise<void> {
  if (_db) { await _db.closeAsync(); _db = null; _dbPromise = null; }
}
