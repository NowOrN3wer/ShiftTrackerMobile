import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeMode, Colors, getColors } from '../utils/theme';

const THEME_KEY    = '@shift_theme';
const START_KEY    = '@shift_start_date';

interface AppSettings {
  themeMode:    ThemeMode;
  startDate:    string;   // "DD.MM.YYYY"
  colors:       Colors;
  setTheme:     (m: ThemeMode) => void;
  setStartDate: (d: string) => void;
  loaded:       boolean;
}

const Ctx = createContext<AppSettings>({} as AppSettings);

export const AppSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeMode, setThemeMode] = useState<ThemeMode>('dark');
  const [startDate, setStartDateState] = useState('');
  const [loaded, setLoaded] = useState(false);

  // Load from storage on mount
  useEffect(() => {
    (async () => {
      try {
        const [t, s] = await Promise.all([
          AsyncStorage.getItem(THEME_KEY),
          AsyncStorage.getItem(START_KEY),
        ]);
        if (t === 'light' || t === 'dark') setThemeMode(t);
        if (s) setStartDateState(s);
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

  return (
    <Ctx.Provider value={{
      themeMode,
      startDate,
      colors: getColors(themeMode),
      setTheme,
      setStartDate,
      loaded,
    }}>
      {children}
    </Ctx.Provider>
  );
};

export const useAppSettings = () => useContext(Ctx);
