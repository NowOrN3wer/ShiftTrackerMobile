import React, { useState, useEffect } from 'react';
import {
  ScrollView, View, Text, StyleSheet, TextInput,
  TouchableOpacity,
} from 'react-native';
import { ShiftEntry } from '../types';
import { useAppSettings } from '../hooks/useAppSettings';
import { ProgressBar } from '../components/ProgressBar';
import {
  minsToHM, timeToMins, calcWeekStats,
  calcElapsedDays, calcElapsedLabel, calcElapsedYears,
  daysUntilNextWeek, daysUntilNextMonth, daysUntilNextYear,
  isWeekend, todayStr, formatDateLong,
} from '../utils/helpers';

interface Props { entries: ShiftEntry[] }

const MAX_MINS = 11 * 60;

function nowStr() {
  const n = new Date();
  return `${String(n.getHours()).padStart(2,'0')}:${String(n.getMinutes()).padStart(2,'0')}`;
}

export const DashboardScreen: React.FC<Props> = ({ entries }) => {
  const { colors, startDate, themeMode } = useAppSettings();
  const C = colors;

  const [clock, setClock] = useState(nowStr());
  const [calcH, setCalcH] = useState('8');
  const [calcM, setCalcM] = useState('30');
  const [calcResult, setCalcResult] = useState<{ elapsed:string; min:string; sug:string }|null>(null);

  useEffect(() => {
    const t = setInterval(() => setClock(nowStr()), 30000);
    return () => clearInterval(t);
  }, []);

  // ── Elapsed from startDate
  const elapsedDays  = calcElapsedDays(startDate);
  const elapsedLabel = calcElapsedLabel(startDate);
  const elapsedYears = calcElapsedYears(startDate);

  // ── Stats
  const thisWeek  = entries.slice(0, 7);
  const weekStats = calcWeekStats(thisWeek);
  const weekPct   = Math.round((weekStats.totalMinutes / weekStats.targetMinutes) * 100);

  const workEntries = entries.filter(e => !e.isHoliday && e.startTime && e.endTime);
  const annualBal   = workEntries.reduce((acc, e) =>
    acc + timeToMins(e.endTime) - timeToMins(e.startTime) - (9*60+30), 0);

  const monthEntries = entries.slice(0, 20);
  const monthTotal   = monthEntries
    .filter(e => !e.isHoliday && e.startTime && e.endTime)
    .reduce((acc, e) => acc + timeToMins(e.endTime) - timeToMins(e.startTime), 0);
  const monthWorked  = monthEntries.filter(e => !e.isHoliday && e.startTime).length;
  const monthPct     = Math.round((monthTotal / (190*60)) * 100);
  const monthAvg     = monthWorked > 0 ? Math.round(monthTotal / monthWorked) : 0;

  const bestDay  = workEntries.reduce((b, e) => {
    const m = timeToMins(e.endTime)-timeToMins(e.startTime);
    return m > (b?.mins||0) ? {mins:m, date:e.date} : b;
  }, null as {mins:number;date:string}|null);
  const worstDay = workEntries.reduce((b, e) => {
    const m = timeToMins(e.endTime)-timeToMins(e.startTime);
    return !b || m < b.mins ? {mins:m, date:e.date} : b;
  }, null as {mins:number;date:string}|null);

  // ── Calc
  const handleCalc = () => {
    const startMins = parseInt(calcH||'0')*60 + parseInt(calcM||'0');
    const n = new Date(); const nowMins = n.getHours()*60+n.getMinutes();
    setCalcResult({
      elapsed: nowMins > startMins ? minsToHM(nowMins-startMins)+' geçti' : '0:00',
      min: minsToHM(startMins + 9*60+30),
      sug: minsToHM(startMins + 10*60+30),
    });
  };

  const today = todayStr();
  const dayType = isWeekend(today) ? 'HAFTA SONU' : 'HAFTA İÇİ';

  // Dynamic styles based on theme
  const s = makeStyles(C);

  return (
    <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>

      {/* ── Row 1: Balance + Monthly avg */}
      <View style={s.row2}>
        <View style={[s.card, s.half]}>
          <Text style={s.label}>Yıllık Net Denge</Text>
          <Text style={[s.value, { color: annualBal>=0 ? C.green : C.red }]}>
            {annualBal>=0?'+':''}{minsToHM(Math.abs(annualBal))}
          </Text>
          <Text style={s.sub}>Hafta içi × 9s30dk</Text>
        </View>
        <View style={[s.card, s.half]}>
          <Text style={s.label}>Aylık Ortalama</Text>
          <Text style={[s.value, { color: monthAvg < 9*60+30 ? C.yellow : C.cyan }]}>
            {minsToHM(monthAvg)}
          </Text>
          <Text style={s.sub}>{monthWorked} / 20 gün</Text>
        </View>
      </View>

      {/* ── Monthly progress */}
      <View style={[s.card, { marginTop:10 }]}>
        <Text style={s.label}>Aylık Hedef / Gerçekleşen</Text>
        <View style={{ flexDirection:'row', alignItems:'baseline', gap:8 }}>
          <Text style={[s.value, { fontSize:20, color:C.text }]}>{minsToHM(monthTotal)}</Text>
          <Text style={{ color:C.muted, fontSize:13 }}>/ 190:00</Text>
        </View>
        <View style={{ marginTop:10 }}>
          <View style={{ height:4, backgroundColor:C.border, borderRadius:2, overflow:'hidden' }}>
            <View style={{ width:`${Math.min(monthPct,100)}%` as any, height:'100%', backgroundColor:C.cyan, borderRadius:2 }}/>
          </View>
          <Text style={[s.sub, { marginTop:6 }]}>%{monthPct} tamamlandı</Text>
        </View>
      </View>

      {/* ── Week total + streak */}
      <View style={[s.row2, { marginTop:10 }]}>
        <View style={[s.card, s.half]}>
          <Text style={s.label}>Bu Hafta Toplam</Text>
          <Text style={[s.value, { color: weekPct<50?C.red:C.cyan, fontSize:20 }]}>
            {minsToHM(weekStats.totalMinutes)}
          </Text>
          <Text style={s.sub}>/ 47:30 · %{weekPct}</Text>
          <View style={{ height:4, backgroundColor:C.border, borderRadius:2, overflow:'hidden', marginTop:8 }}>
            <View style={{ width:`${Math.min(weekPct,100)}%` as any, height:'100%', backgroundColor:weekPct<50?C.red:C.cyan, borderRadius:2 }}/>
          </View>
        </View>
        <View style={[s.card, s.half]}>
          <Text style={s.label}>Streak 🔥</Text>
          <Text style={[s.value, { color:C.text }]}>0 gün</Text>
          <Text style={s.sub}>Henüz seri yok</Text>
        </View>
      </View>

      {/* ── Weekly bars */}
      <View style={[s.card, { marginTop:10 }]}>
        <Text style={s.label}>Haftalık Çalışma</Text>
        {thisWeek.slice(0,7).map((e,i) => {
          const mins = !e.isHoliday&&e.startTime&&e.endTime
            ? timeToMins(e.endTime)-timeToMins(e.startTime) : 0;
          const pct = mins/MAX_MINS*100;
          const barC = e.isHoliday ? C.purple
            : mins===0 ? C.border
            : mins<9*60+30 ? C.red
            : mins<=10*60+30 ? C.yellow : C.blue;
          return (
            <View key={i} style={s.barRow}>
              <Text style={s.barLabel}>{e.day.slice(0,3)}</Text>
              <View style={s.barTrack}>
                <View style={[s.barFill, { width:`${pct}%` as any, backgroundColor:barC }]}/>
              </View>
              <Text style={s.barTime}>{e.isHoliday?'tatil':mins>0?minsToHM(mins):'0:00'}</Text>
            </View>
          );
        })}
      </View>

      {/* ── Best / Worst */}
      <View style={[s.row2, { marginTop:10 }]}>
        <View style={[s.card, s.half]}>
          <Text style={s.label}>Ay En İyi</Text>
          <Text style={[s.value, { color:C.blue, fontSize:20 }]}>
            {bestDay ? minsToHM(bestDay.mins) : '—'}
          </Text>
          <Text style={s.sub}>{bestDay?.date ?? ''}</Text>
        </View>
        <View style={[s.card, s.half]}>
          <Text style={s.label}>Ay En Kötü</Text>
          <Text style={[s.value, { color:C.red, fontSize:20 }]}>
            {worstDay ? minsToHM(worstDay.mins) : '—'}
          </Text>
          <Text style={s.sub}>{worstDay?.date ?? ''}</Text>
        </View>
      </View>

      {/* ── Çıkış hesaplayıcı */}
      <View style={[s.card, { marginTop:10 }]}>
        <Text style={s.label}>Çıkış Hesaplayıcı</Text>
        <View style={s.calcRow}>
          <TextInput style={s.calcInput} value={calcH} onChangeText={setCalcH}
            keyboardType="numeric" placeholder="Saat" placeholderTextColor={C.muted}
            keyboardAppearance={themeMode === 'dark' ? 'dark' : 'light'}/>
          <TextInput style={s.calcInput} value={calcM} onChangeText={setCalcM}
            keyboardType="numeric" placeholder="Dk" placeholderTextColor={C.muted}
            keyboardAppearance={themeMode === 'dark' ? 'dark' : 'light'}/>
          <TouchableOpacity style={[s.calcBtn, { backgroundColor:C.cyan }]} onPress={handleCalc}>
            <Text style={s.calcBtnText}>Hesapla</Text>
          </TouchableOpacity>
        </View>
        {calcResult && (
          <View style={{ marginTop:12, alignItems:'center' }}>
            <Text style={{ fontSize:20, fontWeight:'700', color:C.cyan, fontFamily:'monospace' }}>
              {calcResult.elapsed}
            </Text>
            <View style={{ flexDirection:'row', gap:32, marginTop:10 }}>
              <View style={{ alignItems:'center' }}>
                <Text style={{ fontSize:18, fontWeight:'700', color:C.red, fontFamily:'monospace' }}>{calcResult.min}</Text>
                <Text style={{ fontSize:10, color:C.muted }}>En Erken Çıkış</Text>
              </View>
              <View style={{ alignItems:'center' }}>
                <Text style={{ fontSize:18, fontWeight:'700', color:C.green, fontFamily:'monospace' }}>{calcResult.sug}</Text>
                <Text style={{ fontSize:10, color:C.muted }}>Önerilen Çıkış</Text>
              </View>
            </View>
          </View>
        )}
      </View>

      {/* ── Geri sayım */}
      <View style={[s.row3, { marginTop:10 }]}>
        {[
          [String(daysUntilNextWeek()), 'Sonraki Haftaya'],
          [String(daysUntilNextMonth()), 'Sonraki Aya'],
          [String(daysUntilNextYear()), 'Sonraki Yıla'],
        ].map(([num,lbl]) => (
          <View key={lbl} style={s.countCard}>
            <Text style={[s.countNum, { color:C.cyan }]}>{num}</Text>
            <Text style={s.countLbl}>{lbl}</Text>
          </View>
        ))}
      </View>

      {/* ── Geçen süre (startDate'den hesaplanan) */}
      <View style={[s.row3, { marginTop:10 }]}>
        <View style={s.countCard}>
          <Text style={[s.countNum, { color:C.blue }]}>{elapsedDays}</Text>
          <Text style={s.countLbl}>Geçen Gün</Text>
        </View>
        <View style={[s.countCard, { flex:2 }]}>
          <Text style={[s.countNum, { color:C.cyan, fontSize:16 }]}>{elapsedLabel}</Text>
          <Text style={s.countLbl}>Geçen Süre</Text>
        </View>
        <View style={s.countCard}>
          <Text style={[s.countNum, { color:C.purple }]}>{elapsedYears}</Text>
          <Text style={s.countLbl}>Yıl</Text>
        </View>
      </View>

      {/* ── Bugün */}
      <View style={[s.card, { marginTop:10, alignItems:'center' }]}>
        <Text style={s.label}>Bugün</Text>
        <Text style={[s.value, { color:C.text, fontSize:16 }]}>{formatDateLong(today)}</Text>
        <View style={{ flexDirection:'row', gap:32, marginTop:12 }}>
          <View style={{ alignItems:'center' }}>
            <Text style={{ fontSize:9, color:C.muted, textTransform:'uppercase', letterSpacing:1 }}>Gün Durumu</Text>
            <Text style={{ fontSize:14, fontWeight:'700', color:C.cyan }}>{dayType}</Text>
          </View>
          <View style={{ alignItems:'center' }}>
            <Text style={{ fontSize:9, color:C.muted, textTransform:'uppercase', letterSpacing:1 }}>Şu Anki Saat</Text>
            <Text style={{ fontSize:14, fontWeight:'700', color:C.text, fontFamily:'monospace' }}>{clock}</Text>
          </View>
        </View>
      </View>

      <View style={{ height:100 }}/>
    </ScrollView>
  );
};

function makeStyles(C: ReturnType<typeof import('../utils/theme').getColors>) {
  return StyleSheet.create({
    scroll: { flex:1, paddingHorizontal:16 },
    row2: { flexDirection:'row', gap:10 },
    row3: { flexDirection:'row', gap:10 },
    half: { flex:1 },
    card: { backgroundColor:C.surface, borderWidth:1, borderColor:C.border, borderRadius:16, padding:16 },
    label: { fontSize:9, letterSpacing:1.2, textTransform:'uppercase', color:C.muted, marginBottom:8, fontFamily:'monospace' },
    value: { fontSize:24, fontWeight:'700', color:C.cyan, fontFamily:'monospace', lineHeight:28 },
    sub:   { fontSize:11, color:C.muted, marginTop:4, lineHeight:16 },
    barRow: { flexDirection:'row', alignItems:'center', gap:8, marginVertical:4 },
    barLabel: { width:28, fontSize:10, color:C.muted, fontFamily:'monospace' },
    barTrack: { flex:1, height:6, backgroundColor:C.border, borderRadius:3, overflow:'hidden' },
    barFill:  { height:'100%', borderRadius:3 },
    barTime:  { width:44, fontSize:10, color:C.muted, textAlign:'right', fontFamily:'monospace' },
    calcRow: { flexDirection:'row', gap:8, marginTop:10 },
    calcInput: {
      flex:1, backgroundColor:C.surface2, borderWidth:1, borderColor:C.border,
      borderRadius:10, padding:10, color:C.text, fontFamily:'monospace', fontSize:14, textAlign:'center',
    },
    calcBtn: { paddingHorizontal:14, paddingVertical:10, borderRadius:10, justifyContent:'center' },
    calcBtnText: { color:'#000', fontWeight:'700', fontSize:12 },
    countCard: {
      flex:1, backgroundColor:C.surface, borderWidth:1, borderColor:C.border,
      borderRadius:14, padding:14, alignItems:'center',
    },
    countNum: { fontSize:22, fontWeight:'800', fontFamily:'monospace' },
    countLbl: { fontSize:9, color:C.muted, textTransform:'uppercase', letterSpacing:0.8, marginTop:4, textAlign:'center' },
  });
}
