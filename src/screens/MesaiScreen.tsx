import React, { useState } from 'react';
import {
  ScrollView, View, Text, TouchableOpacity,
  StyleSheet, Alert, Platform, Modal,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { ShiftEntry } from '../types';
import { useAppSettings } from '../hooks/useAppSettings';
import { Legend } from '../components/Legend';
import { getRowColor, minsToHM, timeToMins, todayStr, getWeekLabel } from '../utils/helpers';
import { getRowColors } from '../utils/theme';

// ── Yardımcı fonksiyonlar ────────────────────────────────────────────
/** "GG.AA.YYYY" → Date */
function parseDate(str: string): Date {
  const [dd, mm, yyyy] = str.split('.').map(Number);
  return new Date(yyyy, mm - 1, dd);
}
/** Date → "GG.AA.YYYY" */
function formatDate(d: Date): string {
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}.${mm}.${yyyy}`;
}
/** "HH:MM" → Date (saat picker için) */
function parseTime(str: string): Date {
  const [h, m] = str.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}
/** Date → "HH:MM" */
function formatTime(d: Date): string {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

interface Props {
  entries: ShiftEntry[];
  onSave:   (e: Omit<ShiftEntry, 'id' | 'day'>) => void;
  onDelete: (id: string) => void;
}

export const MesaiScreen: React.FC<Props> = ({ entries, onSave, onDelete }) => {
  const { colors: C, themeMode } = useAppSettings();
  const rowColors = getRowColors(themeMode);

  const [date,  setDate]  = useState(todayStr());
  const [start, setStart] = useState('08:30');
  const [end,   setEnd]   = useState('18:00');
  const [weekOffset, setWeekOffset] = useState(0);
  const [saved, setSaved] = useState(false);

  // Picker görünürlük state'leri
  const [showDatePicker,  setShowDatePicker]  = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker,   setShowEndPicker]   = useState(false);

  const pageEntries = entries.slice(weekOffset * 7, weekOffset * 7 + 7);
  const weekLabel   = getWeekLabel(entries, weekOffset);

  // ── Picker handler'ları
  const onDateChange = (_e: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') setShowDatePicker(false);
    if (selected) setDate(formatDate(selected));
  };
  const onStartChange = (_e: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') setShowStartPicker(false);
    if (selected) setStart(formatTime(selected));
  };
  const onEndChange = (_e: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') setShowEndPicker(false);
    if (selected) setEnd(formatTime(selected));
  };

  const handleSave = () => {
    if (!date) { Alert.alert('Hata', 'Tarih giriniz'); return; }
    onSave({ date, startTime: start, endTime: end, isHoliday: false });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const handleHoliday = () => {
    if (!date) { Alert.alert('Hata', 'Tarih giriniz'); return; }
    onSave({ date, startTime: '', endTime: '', isHoliday: true });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const handleLongPress = (entry: ShiftEntry) => {
    Alert.alert(
      entry.date,
      `${entry.day}\n${entry.startTime || '—'} → ${entry.endTime || '—'}`,
      [
        {
          text: '🗑 Sil',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Kaydı Sil',
              `${entry.date} tarihli kaydı silmek istiyor musun?`,
              [
                { text: 'İptal', style: 'cancel' },
                { text: 'Sil', style: 'destructive', onPress: () => onDelete(entry.id) },
              ]
            );
          },
        },
        {
          text: '✏️ Düzenle',
          onPress: () => {
            setDate(entry.date);
            setStart(entry.startTime || '08:30');
            setEnd(entry.endTime || '18:00');
          },
        },
        { text: 'Kapat', style: 'cancel' },
      ]
    );
  };

  const s = makeStyles(C);
  const isDark = themeMode === 'dark';

  // ── iOS Picker Modal bileşeni
  const renderIOSPickerModal = (
    visible: boolean,
    onClose: () => void,
    mode: 'date' | 'time',
    value: Date,
    onChange: (e: DateTimePickerEvent, d?: Date) => void,
    title: string,
  ) => (
    <Modal visible={visible} transparent animationType="slide">
      <View style={s.modalOverlay}>
        <View style={[s.modalContent, { backgroundColor: isDark ? '#1c1f2a' : '#fff' }]}>
          <View style={s.modalHeader}>
            <Text style={[s.modalTitle, { color: C.text }]}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={[s.modalDone, { color: C.cyan }]}>Tamam</Text>
            </TouchableOpacity>
          </View>
          <DateTimePicker
            value={value}
            mode={mode}
            display="spinner"
            onChange={onChange}
            locale="tr-TR"
            themeVariant={isDark ? 'dark' : 'light'}
            style={{ height: 180 }}
          />
        </View>
      </View>
    </Modal>
  );

  return (
    <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>

      {/* ── Form */}
      <View style={s.card}>
        <Text style={s.cardTitle}>Mesai Girişi</Text>
        <View style={s.formRow}>
          {/* Tarih — date picker */}
          <View style={s.field}>
            <Text style={s.fieldLabel}>Tarih</Text>
            <TouchableOpacity
              style={s.pickerBtn}
              onPress={() => setShowDatePicker(true)}
              activeOpacity={0.7}
            >
              <Text style={[s.pickerText, { color: C.text }]}>{date}</Text>
              <Text style={s.pickerIcon}>📅</Text>
            </TouchableOpacity>
          </View>

          {/* Giriş — time picker */}
          <View style={s.field}>
            <Text style={s.fieldLabel}>Giriş</Text>
            <TouchableOpacity
              style={s.pickerBtn}
              onPress={() => setShowStartPicker(true)}
              activeOpacity={0.7}
            >
              <Text style={[s.pickerText, { color: C.text }]}>{start}</Text>
              <Text style={s.pickerIcon}>⏰</Text>
            </TouchableOpacity>
          </View>

          {/* Çıkış — time picker */}
          <View style={s.field}>
            <Text style={s.fieldLabel}>Çıkış</Text>
            <TouchableOpacity
              style={s.pickerBtn}
              onPress={() => setShowEndPicker(true)}
              activeOpacity={0.7}
            >
              <Text style={[s.pickerText, { color: C.text }]}>{end}</Text>
              <Text style={s.pickerIcon}>⏰</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={s.btnRow}>
          <TouchableOpacity style={s.secondaryBtn} onPress={handleHoliday}>
            <Text style={[s.secondaryBtnText, { color: C.muted }]}>🏖 Tatil</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.secondaryBtn} onPress={() => setDate(todayStr())}>
            <Text style={[s.secondaryBtnText, { color: C.muted }]}>📍 Bugün</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={[s.saveBtn, { backgroundColor: saved ? C.green : C.cyan }]}
          onPress={handleSave}
          activeOpacity={0.8}
        >
          <Text style={s.saveBtnText}>{saved ? '✓ Kaydedildi' : 'Kaydet'}</Text>
        </TouchableOpacity>
      </View>

      {/* ── iOS Picker Modals */}
      {Platform.OS === 'ios' && (
        <>
          {renderIOSPickerModal(showDatePicker, () => setShowDatePicker(false), 'date', parseDate(date), onDateChange, 'Tarih Seç')}
          {renderIOSPickerModal(showStartPicker, () => setShowStartPicker(false), 'time', parseTime(start), onStartChange, 'Giriş Saati')}
          {renderIOSPickerModal(showEndPicker, () => setShowEndPicker(false), 'time', parseTime(end), onEndChange, 'Çıkış Saati')}
        </>
      )}

      {/* ── Android Picker'lar (otomatik modal) */}
      {Platform.OS === 'android' && showDatePicker && (
        <DateTimePicker value={parseDate(date)} mode="date" onChange={onDateChange} />
      )}
      {Platform.OS === 'android' && showStartPicker && (
        <DateTimePicker value={parseTime(start)} mode="time" is24Hour onChange={onStartChange} />
      )}
      {Platform.OS === 'android' && showEndPicker && (
        <DateTimePicker value={parseTime(end)} mode="time" is24Hour onChange={onEndChange} />
      )}

      {/* ── List */}
      <View style={s.card}>
        <View style={s.listHeader}>
          <Text style={s.cardTitle}>Mesai Kayıtları</Text>
          <View style={s.weekNav}>
            <TouchableOpacity
              style={s.navBtn}
              onPress={() => entries.length > (weekOffset+1)*7 && setWeekOffset(w => w+1)}
            >
              <Text style={[s.navBtnText, { color: C.text }]}>‹</Text>
            </TouchableOpacity>
            <Text style={s.weekLabel}>{weekLabel}</Text>
            <TouchableOpacity
              style={s.navBtn}
              onPress={() => weekOffset > 0 && setWeekOffset(w => w-1)}
            >
              <Text style={[s.navBtnText, { color: C.text }]}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Legend />

        {/* Table head */}
        <View style={s.tableHead}>
          <Text style={[s.th, { flex:1.8 }]}>Tarih</Text>
          <Text style={[s.th, { flex:1, textAlign:'center' }]}>Giriş</Text>
          <Text style={[s.th, { flex:1, textAlign:'center' }]}>Çıkış</Text>
          <Text style={[s.th, { width:44, textAlign:'right' }]}>Top.</Text>
        </View>

        {pageEntries.length === 0
          ? <Text style={s.empty}>Bu haftaya ait kayıt yok</Text>
          : pageEntries.map(entry => {
              const color = getRowColor(entry.startTime, entry.endTime, entry.isHoliday);
              const theme = rowColors[color];
              const total = entry.isHoliday ? '—'
                : entry.startTime && entry.endTime
                ? minsToHM(timeToMins(entry.endTime) - timeToMins(entry.startTime)) : '—';
              return (
                <TouchableOpacity
                  key={entry.id}
                  activeOpacity={0.7}
                  style={[s.row, { backgroundColor: theme.bg }]}
                  onLongPress={() => handleLongPress(entry)}
                >
                  <View style={[s.accent, { backgroundColor: theme.accent }]} />
                  <View style={{ flex:1.8 }}>
                    <Text style={[s.rowDate, { color: C.text }]}>{entry.date}</Text>
                    <Text style={[s.rowDay,  { color: C.muted }]}>{entry.day}</Text>
                  </View>
                  <Text style={[s.rowTime,  { color: C.text }]}>{entry.startTime || '—'}</Text>
                  <Text style={[s.rowTime,  { color: C.text }]}>{entry.endTime   || '—'}</Text>
                  <Text style={[s.rowTotal, { color: theme.accent }]}>{total}</Text>
                </TouchableOpacity>
              );
            })
        }

        <Text style={s.hint}>Satıra uzun bas → Düzenle / Sil</Text>
      </View>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
};

function makeStyles(C: ReturnType<typeof import('../utils/theme').getColors>) {
  return StyleSheet.create({
    scroll: { flex:1, paddingHorizontal:16 },
    card: { backgroundColor:C.surface, borderWidth:1, borderColor:C.border, borderRadius:16, padding:16, marginBottom:12 },
    cardTitle: { fontSize:14, fontWeight:'700', color:C.text, marginBottom:14 },
    formRow: { flexDirection:'row', gap:8, marginBottom:10 },
    field: { flex:1 },
    fieldLabel: { fontSize:9, color:C.muted, textTransform:'uppercase', letterSpacing:1, fontFamily:'monospace', marginBottom:4 },
    pickerBtn: {
      backgroundColor:C.surface2, borderWidth:1, borderColor:C.border,
      borderRadius:10, paddingVertical:10, paddingHorizontal:8,
      flexDirection:'row', alignItems:'center', justifyContent:'center', gap:4,
    },
    pickerText: { fontFamily:'monospace', fontSize:13, textAlign:'center' },
    pickerIcon: { fontSize:12 },
    btnRow: { flexDirection:'row', gap:8, marginBottom:8 },
    secondaryBtn: {
      flex:1, padding:10, backgroundColor:C.surface2,
      borderWidth:1, borderColor:C.border, borderRadius:10, alignItems:'center',
    },
    secondaryBtnText: { fontSize:12, fontWeight:'600' },
    saveBtn: { padding:14, borderRadius:12, alignItems:'center' },
    saveBtnText: { color:'#000', fontWeight:'700', fontSize:14, letterSpacing:0.4 },
    listHeader: { flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:12 },
    weekNav: { flexDirection:'row', alignItems:'center', gap:8 },
    navBtn: {
      width:28, height:28, backgroundColor:C.surface2,
      borderWidth:1, borderColor:C.border, borderRadius:8,
      alignItems:'center', justifyContent:'center',
    },
    navBtnText: { fontSize:16 },
    weekLabel: { fontSize:10, color:C.muted, fontFamily:'monospace' },
    tableHead: {
      flexDirection:'row', paddingHorizontal:4, paddingBottom:8,
      borderBottomWidth:1, borderBottomColor:C.border, marginBottom:4,
    },
    th: { fontSize:9, color:C.muted, textTransform:'uppercase', letterSpacing:1, fontFamily:'monospace' },
    empty: { color:C.muted, textAlign:'center', padding:20, fontSize:13 },
    row: {
      flexDirection:'row', alignItems:'center', paddingVertical:12, paddingRight:12,
      borderBottomWidth:1, borderBottomColor:'rgba(128,128,128,0.06)',
    },
    accent: { width:3, alignSelf:'stretch', marginRight:10, borderRadius:2 },
    rowDate: { fontSize:11, fontFamily:'monospace' },
    rowDay:  { fontSize:10, marginTop:2 },
    rowTime: { flex:1, fontSize:12, fontFamily:'monospace', textAlign:'center' },
    rowTotal: { width:44, fontSize:12, fontWeight:'700', fontFamily:'monospace', textAlign:'right' },
    hint: { fontSize:10, color:C.muted, textAlign:'center', paddingTop:12, fontStyle:'italic' },
    // Modal stilleri
    modalOverlay: {
      flex:1, justifyContent:'flex-end', backgroundColor:'rgba(0,0,0,0.4)',
    },
    modalContent: {
      borderTopLeftRadius:20, borderTopRightRadius:20, paddingBottom:40,
    },
    modalHeader: {
      flexDirection:'row', justifyContent:'space-between', alignItems:'center',
      paddingHorizontal:20, paddingVertical:16,
      borderBottomWidth:1, borderBottomColor:'rgba(128,128,128,0.15)',
    },
    modalTitle: { fontSize:16, fontWeight:'700' },
    modalDone: { fontSize:16, fontWeight:'600' },
  });
}
