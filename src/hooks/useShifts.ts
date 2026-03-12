/**
 * useShifts — SQLite destekli shift state hook'u
 *
 * AsyncStorage'dan tamamen kaldırıldı.
 * Tüm okuma/yazma işlemleri expo-sqlite üzerinden gider.
 */

import { useState, useCallback, useEffect } from 'react';
import { ShiftEntry } from '../types';
import { getAllShifts, upsertShift, deleteShift } from '../utils/db';

export function useShifts() {
  const [entries, setEntries] = useState<ShiftEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // ── İlk yükleme: DB'den tüm kayıtları çek
  useEffect(() => {
    (async () => {
      try {
        const rows = await getAllShifts();
        setEntries(rows);
      } catch (err) {
        console.error('[useShifts] load error:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ── Ekle veya güncelle
  const addOrUpdate = useCallback(async (entry: Omit<ShiftEntry, 'id' | 'day'>) => {
    try {
      const saved = await upsertShift(entry);
      setEntries(prev => {
        const idx = prev.findIndex(e => e.date === saved.date);
        const next = idx >= 0
          ? prev.map((e, i) => i === idx ? saved : e)
          : [saved, ...prev];
        // Tarihe göre azalan sıra koru
        return next.sort((a, b) => {
          const ts = (d: string) => {
            const [dd, mm, yy] = d.split('.').map(Number);
            return new Date(yy, mm - 1, dd).getTime();
          };
          return ts(b.date) - ts(a.date);
        });
      });
    } catch (err) {
      console.error('[useShifts] upsert error:', err);
    }
  }, []);

  // ── Sil
  const remove = useCallback(async (id: string) => {
    try {
      await deleteShift(id);
      setEntries(prev => prev.filter(e => e.id !== id));
    } catch (err) {
      console.error('[useShifts] delete error:', err);
    }
  }, []);

  return { entries, loading, addOrUpdate, remove };
}
