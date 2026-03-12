import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  StatusBar, SafeAreaView,
} from 'react-native';
import { AppSettingsProvider, useAppSettings } from './src/hooks/useAppSettings';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { MesaiScreen }     from './src/screens/MesaiScreen';
import { SettingsScreen }  from './src/screens/SettingsScreen';
import { SplashScreen }    from './src/components/SplashScreen';
import { useShifts }       from './src/hooks/useShifts';
import { initDb }          from './src/utils/db';
import { ShiftEntry }      from './src/types';

type Tab = 'dashboard' | 'mesai' | 'settings';

function Inner() {
  const { colors: C, themeMode, loaded: settingsLoaded } = useAppSettings();

  const [tab, setTab]         = useState<Tab>('dashboard');
  const [dbReady, setDbReady] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  const { entries, loading: shiftsLoading, addOrUpdate, remove } = useShifts();

  // ── Uygulama ilk açıldığında SQLite'ı başlat
  useEffect(() => {
    initDb()
      .then(() => setDbReady(true))
      .catch(err => {
        console.error('[App] DB init error:', err);
        setDbReady(true); // hata olsa bile devam et
      });
  }, []);

  // Hazır mı?
  const isReady = settingsLoaded && dbReady && !shiftsLoading;

  // isReady'yi ref ile takip et — splash callback'inin stale closure
  // sorunu yaşamaması için her zaman güncel değeri okuyabilir
  const isReadyRef = useRef(isReady);
  isReadyRef.current = isReady;

  // Splash animasyonu bittiğinde — ref'den güncel isReady değerini oku
  const [splashAnimDone, setSplashAnimDone] = useState(false);

  // Splash animasyonu bittiyse VE isReady true ise → splash'ı kapat
  useEffect(() => {
    if (isReady && splashAnimDone) {
      setShowSplash(false);
    }
  }, [isReady, splashAnimDone]);

  const NAV = [
    { key: 'dashboard', icon: '📊', label: 'Dashboard' },
    { key: 'mesai',     icon: '⏱',  label: 'Mesai'    },
    { key: 'settings',  icon: '⚙️',  label: 'Ayarlar'  },
  ] as const;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: C.bg }]}>
      <StatusBar
        barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={C.bg}
      />

      {/* Ana içerik */}
      {!showSplash && (
        <>
          {/* Nav */}
          <View style={[styles.nav, { backgroundColor: C.bg, borderBottomColor: C.border }]}>
            {NAV.map(n => (
              <TouchableOpacity
                key={n.key}
                style={styles.navBtn}
                onPress={() => setTab(n.key)}
              >
                <Text style={[styles.navText, tab === n.key ? { color: C.cyan } : { color: C.muted }]}>
                  {n.icon}  {n.label}
                </Text>
                {tab === n.key && <View style={[styles.indicator, { backgroundColor: C.cyan }]} />}
              </TouchableOpacity>
            ))}
          </View>

          <View style={[styles.content, { backgroundColor: C.bg }]}>
            {tab === 'dashboard' && <DashboardScreen entries={entries} />}
            {tab === 'mesai'     && (
              <MesaiScreen
                entries={entries}
                onSave={(e: Omit<ShiftEntry, 'id' | 'day'>) => addOrUpdate(e)}
                onDelete={(id: string) => remove(id)}
              />
            )}
            {tab === 'settings' && <SettingsScreen />}
          </View>
        </>
      )}

      {/* Splash — en üstte, fade-out ile kapanıyor */}
      {showSplash && (
        <SplashScreen
          themeMode={themeMode}
          onFinish={() => setSplashAnimDone(true)}
        />
      )}
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <AppSettingsProvider>
      <Inner />
    </AppSettingsProvider>
  );
}

const styles = StyleSheet.create({
  safe:      { flex: 1 },
  nav:       { flexDirection: 'row', borderBottomWidth: 1 },
  navBtn:    { flex: 1, paddingVertical: 14, alignItems: 'center', position: 'relative' },
  navText:   { fontSize: 12, fontWeight: '600', letterSpacing: 0.2 },
  indicator: { position: 'absolute', bottom: 0, left: '15%', right: '15%', height: 2, borderRadius: 2 },
  content:   { flex: 1, paddingTop: 12 },
});
