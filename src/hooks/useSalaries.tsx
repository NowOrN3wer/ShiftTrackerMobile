import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { getSalaries, upsertSalary, deleteSalary, SalaryRow } from '../utils/db';

interface SalariesContextData {
  salaries: SalaryRow[];
  loading: boolean;
  addOrUpdate: (amount: number, date: string, existingId?: string) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

const SalariesContext = createContext<SalariesContextData>({} as any);

export const SalariesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [salaries, setSalaries] = useState<SalaryRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSalaries = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getSalaries();
      setSalaries(data);
    } catch (err) {
      console.error('[SalariesProvider] fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSalaries();
  }, [fetchSalaries]);

  const addOrUpdate = async (amount: number, date: string, existingId?: string) => {
    try {
      const submitId = existingId || date;
      await upsertSalary(submitId, amount, date);
      await fetchSalaries();
    } catch (err) {
      console.error('[SalariesProvider] save error:', err);
    }
  };

  const remove = async (id: string) => {
    try {
      await deleteSalary(id);
      await fetchSalaries();
    } catch (err) {
      console.error('[SalariesProvider] delete error:', err);
    }
  };

  return (
    <SalariesContext.Provider value={{ salaries, loading, addOrUpdate, remove }}>
      {children}
    </SalariesContext.Provider>
  );
};

export function useSalaries() {
  return useContext(SalariesContext);
}
