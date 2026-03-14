import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeMode, ColorsType as Colors, getColors } from '../utils/theme';

const THEME_KEY    = '@shift_theme';
const START_KEY    = '@shift_start_date';
const SHIFT_START_KEY = '@shift_default_start';
const SHIFT_END_KEY   = '@shift_default_end';

interface AppSettings {
  themeMode:    ThemeMode;
  startDate:    string;   // "DD.MM.YYYY"
  defaultStart: string;   // "HH:MM"
  defaultEnd:   string;   // "HH:MM"
  colors:       Colors;
  setTheme:     (m: ThemeMode) => void;
  setStartDate: (d: string) => void;
  setDefaultStart: (t: string) => void;
  setDefaultEnd: (t: string) => void;
  loaded:       boolean;
}

const Ctx = createContext<AppSettings>({} as AppSettings);

export const AppSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeMode, setThemeMode] = useState<ThemeMode>('dark');
  const [startDate, setStartDateState] = useState('');
  const [defaultStart, setDefaultStartState] = useState('08:30');
  const [defaultEnd, setDefaultEndState] = useState('18:00');
  const [loaded, setLoaded] = useState(false);

  // Load from storage on mount
  useEffect(() => {
    (async () => {
      try {
        const [t, s, start, end] = await Promise.all([
          AsyncStorage.getItem(THEME_KEY),
          AsyncStorage.getItem(START_KEY),
          AsyncStorage.getItem(SHIFT_START_KEY),
          AsyncStorage.getItem(SHIFT_END_KEY),
        ]);
        if (t === 'light' || t === 'dark') setThemeMode(t);
        if (s) setStartDateState(s);
        if (start) setDefaultStartState(start);
        if (end) setDefaultEndState(end);
      } catch (_) {}
      setLoaded(true);
    })();
  }, []);

  const setTheme = useCallback((m: ThemeMode) => {
    setThemeMode(m);
    AsyncStorage.setItem(THEME_KEY, m).catch(() => {});
  }, []);

  const setStartDate = useCallback((d: string) => {
    setStartDateState(d);
    AsyncStorage.setItem(START_KEY, d).catch(() => {});
  }, []);

  const setDefaultStart = useCallback((t: string) => {
    setDefaultStartState(t);
    AsyncStorage.setItem(SHIFT_START_KEY, t).catch(() => {});
  }, []);

  const setDefaultEnd = useCallback((t: string) => {
    setDefaultEndState(t);
    AsyncStorage.setItem(SHIFT_END_KEY, t).catch(() => {});
  }, []);

  return (
    <Ctx.Provider value={{
      themeMode,
      startDate,
      defaultStart,
      defaultEnd,
      colors: getColors(themeMode),
      setTheme,
      setStartDate,
      setDefaultStart,
      setDefaultEnd,
      loaded,
    }}>
      {children}
    </Ctx.Provider>
  );
};

export const useAppSettings = () => useContext(Ctx);
