import React, { useState } from 'react';
import {
  ScrollView, View, Text, TouchableOpacity,
  StyleSheet, Switch, Alert, Platform, Modal,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useAppSettings } from '../hooks/useAppSettings';
import {
  calcElapsedDays, calcElapsedLabel, calcElapsedYears, formatDateLong, timeToMins, minsToHM,
} from '../utils/helpers';

/** "GG.AA.YYYY" → Date */
function parseDate(str: string): Date {
  if (!str) return new Date();
  const parts = str.split('.');
  if (parts.length !== 3) return new Date();
  const [dd, mm, yyyy] = parts.map(Number);
  const d = new Date(yyyy, mm - 1, dd);
  return isNaN(d.getTime()) ? new Date() : d;
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
  if (!str) return new Date();
  const parts = str.split(':');
  if (parts.length !== 2) return new Date();
  const [h, m] = parts.map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return isNaN(d.getTime()) ? new Date() : d;
}
/** Date → "HH:MM" */
function formatTime(d: Date): string {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export const SettingsScreen: React.FC = () => {
  const { colors: C, themeMode, setTheme, startDate, setStartDate, defaultStart, defaultEnd, setDefaultStart, setDefaultEnd } = useAppSettings();
  const [dateInput, setDateInput] = useState(startDate);
  const [startInput, setStartInput] = useState(defaultStart);
  const [endInput, setEndInput] = useState(defaultEnd);
  const [saved, setSaved] = useState(false);
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const isDark = themeMode === 'dark';

  const onDateChange = (_e: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') setShowDatePicker(false);
    if (selected) setDateInput(formatDate(selected));
  };
  const onStartChange = (_e: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') setShowStartPicker(false);
    if (selected) setStartInput(formatTime(selected));
  };
  const onEndChange = (_e: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') setShowEndPicker(false);
    if (selected) setEndInput(formatTime(selected));
  };

  const handleSave = () => {
    // basic format check DD.MM.YYYY
    const re = /^\d{2}\.\d{2}\.\d{4}$/;
    if (!re.test(dateInput)) {
      Alert.alert('Hata', 'Tarih formatı: GG.AA.YYYY\nÖrnek: 01.06.2024');
      return;
    }
    setStartDate(dateInput);
    setDefaultStart(startInput);
    setDefaultEnd(endInput);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const elapsed = calcElapsedDays(startDate);
  const elapsedLabel = calcElapsedLabel(startDate);
  const elapsedYears = calcElapsedYears(startDate);

  const s = makeStyles(C);

  return (
    <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>

      {/* ── Giriş Tarihi */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>İşe Giriş Tarihi</Text>
        <Text style={s.sectionDesc}>
          Dashboard'daki "Geçen Gün", "Geçen Süre" ve yıl hesapları bu tarihten itibaren otomatik hesaplanır.
        </Text>

        <View style={s.card}>
          <Text style={s.fieldLabel}>Başlangıç Tarihi</Text>
          <View style={s.inputRow}>
            <TouchableOpacity
              style={s.dateBtn}
              onPress={() => setShowDatePicker(true)}
              activeOpacity={0.7}
            >
              <Text style={[s.dateText, { color: C.text }]}>{dateInput}</Text>
              <Text style={s.dateIcon}>📅</Text>
            </TouchableOpacity>
          </View>
          <Text style={s.hint}>Şu an kayıtlı: {startDate}</Text>
        </View>

        <View style={s.card}>
          <Text style={s.fieldLabel}>Varsayılan Mesai Saatleri (Giriş / Çıkış)</Text>
          <View style={s.inputRow}>
            <TouchableOpacity
              style={s.dateBtn}
              onPress={() => setShowStartPicker(true)}
              activeOpacity={0.7}
            >
              <Text style={[s.dateText, { color: C.text }]}>{startInput}</Text>
              <Text style={s.dateIcon}>⏰</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={s.dateBtn}
              onPress={() => setShowEndPicker(true)}
              activeOpacity={0.7}
            >
              <Text style={[s.dateText, { color: C.text }]}>{endInput}</Text>
              <Text style={s.dateIcon}>⏰</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[s.saveBtn, saved && { backgroundColor: C.green }, { marginTop: 10 }]}
          onPress={handleSave}
          activeOpacity={0.8}
        >
          <Text style={s.saveBtnText}>{saved ? '✓ Kaydedildi' : 'Ayarları Kaydet'}</Text>
        </TouchableOpacity>

        {/* iOS Picker Modal */}
        {Platform.OS === 'ios' && (
          <Modal visible={showDatePicker || showStartPicker || showEndPicker} transparent animationType="slide">
            <View style={s.modalOverlay}>
              <View style={[s.modalContent, { backgroundColor: isDark ? '#1c1f2a' : '#fff' }]}>
                <View style={s.modalHeader}>
                  <Text style={[s.modalTitle, { color: C.text }]}>Seçim Yap</Text>
                  <TouchableOpacity onPress={() => { setShowDatePicker(false); setShowStartPicker(false); setShowEndPicker(false); }}>
                    <Text style={[s.modalDone, { color: C.cyan }]}>Tamam</Text>
                  </TouchableOpacity>
                </View>
                {showDatePicker && (
                  <DateTimePicker
                    value={parseDate(dateInput)}
                    mode="date"
                    display="spinner"
                    onChange={onDateChange}
                    locale="tr-TR"
                    themeVariant={isDark ? 'dark' : 'light'}
                    style={{ height: 180 }}
                  />
                )}
                {showStartPicker && (
                  <DateTimePicker
                    value={parseTime(startInput)}
                    mode="time"
                    display="spinner"
                    onChange={onStartChange}
                    locale="tr-TR"
                    themeVariant={isDark ? 'dark' : 'light'}
                    style={{ height: 180 }}
                  />
                )}
                {showEndPicker && (
                  <DateTimePicker
                    value={parseTime(endInput)}
                    mode="time"
                    display="spinner"
                    onChange={onEndChange}
                    locale="tr-TR"
                    themeVariant={isDark ? 'dark' : 'light'}
                    style={{ height: 180 }}
                  />
                )}
              </View>
            </View>
          </Modal>
        )}
        {Platform.OS === 'android' && showDatePicker && (
          <DateTimePicker value={parseDate(dateInput)} mode="date" onChange={onDateChange} />
        )}
        {Platform.OS === 'android' && showStartPicker && (
          <DateTimePicker value={parseTime(startInput)} mode="time" is24Hour onChange={onStartChange} />
        )}
        {Platform.OS === 'android' && showEndPicker && (
          <DateTimePicker value={parseTime(endInput)} mode="time" is24Hour onChange={onEndChange} />
        )}

        {/* Preview */}
        <View style={s.card}>
          <Text style={s.fieldLabel}>Hesaplanan Değerler (Önizleme)</Text>
          <View style={s.statRow}>
            <Text style={s.statLabel}>Geçen Gün</Text>
            <Text style={[s.statVal, { color: C.cyan }]}>{elapsed}</Text>
          </View>
          <View style={s.statRow}>
            <Text style={s.statLabel}>Geçen Süre</Text>
            <Text style={[s.statVal, { color: C.blue }]}>{elapsedLabel}</Text>
          </View>
          <View style={s.statRow}>
            <Text style={s.statLabel}>Yıl Olarak</Text>
            <Text style={[s.statVal, { color: C.purple }]}>{elapsedYears} yıl</Text>
          </View>
          <View style={[s.statRow, { borderBottomWidth: 0 }]}>
            <Text style={s.statLabel}>Başlangıç</Text>
            <Text style={[s.statVal, { color: C.text, fontSize: 11 }]}>{formatDateLong(startDate)}</Text>
          </View>
        </View>
      </View>

      {/* ── Tema */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>Görünüm</Text>
        <Text style={s.sectionDesc}>Uygulama temasını değiştir. Seçim telefonda kalıcı olarak saklanır.</Text>

        <View style={s.card}>
          <View style={s.themeRow}>
            <TouchableOpacity
              style={[s.themeBtn, themeMode === 'dark' && s.themeBtnActive]}
              onPress={() => setTheme('dark')}
              activeOpacity={0.8}
            >
              <Text style={s.themeIcon}>🌙</Text>
              <Text style={[s.themeLabel, themeMode === 'dark' && { color: C.cyan }]}>Koyu</Text>
              {themeMode === 'dark' && <View style={[s.themeCheck, { backgroundColor: C.cyan }]}><Text style={{ fontSize:10, color:'#000' }}>✓</Text></View>}
            </TouchableOpacity>

            <TouchableOpacity
              style={[s.themeBtn, themeMode === 'light' && s.themeBtnActive]}
              onPress={() => setTheme('light')}
              activeOpacity={0.8}
            >
              <Text style={s.themeIcon}>☀️</Text>
              <Text style={[s.themeLabel, themeMode === 'light' && { color: C.cyan }]}>Açık</Text>
              {themeMode === 'light' && <View style={[s.themeCheck, { backgroundColor: C.cyan }]}><Text style={{ fontSize:10, color:'#000' }}>✓</Text></View>}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* ── Renk Açıklaması */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>Mesai Renk Sistemi</Text>
        <View style={s.card}>
          {(() => {
            const standardMins = timeToMins(defaultEnd) - timeToMins(defaultStart);
            return [
              { color: C.red,    label: 'Kırmızı', desc: `${minsToHM(standardMins)}'dan az` },
              { color: C.yellow, label: 'Sarı',    desc: `${minsToHM(standardMins)} ile ${minsToHM(standardMins + 60)} arası` },
              { color: C.blue,   label: 'Mavi',    desc: `${minsToHM(standardMins + 60)} ve üzeri` },
              { color: C.purple, label: 'Mor',     desc: 'Tatil / Resmi tatil günü' },
            ].map(item => (
              <View key={item.label} style={s.colorRow}>
                <View style={[s.colorDot, { backgroundColor: item.color }]}/>
                <View>
                  <Text style={[s.colorLabel, { color: item.color }]}>{item.label}</Text>
                  <Text style={s.colorDesc}>{item.desc}</Text>
                </View>
              </View>
            ));
          })()}
        </View>
      </View>

      <View style={{ height: 100 }}/>
    </ScrollView>
  );
};

function makeStyles(C: ReturnType<typeof import('../utils/theme').getColors>) {
  return StyleSheet.create({
    scroll: { flex:1, paddingHorizontal:16 },
    section: { marginBottom:4 },
    sectionTitle: {
      fontSize:13, fontWeight:'700', color:C.text,
      marginTop:20, marginBottom:4, letterSpacing:0.2,
    },
    sectionDesc: { fontSize:12, color:C.muted, marginBottom:10, lineHeight:18 },
    card: {
      backgroundColor:C.surface, borderWidth:1, borderColor:C.border,
      borderRadius:16, padding:16, marginBottom:10,
    },
    fieldLabel: {
      fontSize:9, color:C.muted, textTransform:'uppercase',
      letterSpacing:1.2, fontFamily:'monospace', marginBottom:10,
    },
    inputRow: { flexDirection:'row', gap:10, alignItems:'center' },
    dateBtn: {
      flex:1, backgroundColor:C.surface2, borderWidth:1, borderColor:C.border,
      borderRadius:12, padding:13, flexDirection:'row', alignItems:'center',
      justifyContent:'center', gap:8,
    },
    dateText: {
      fontFamily:'monospace', fontSize:16, textAlign:'center', letterSpacing:1,
    },
    dateIcon: { fontSize:14 },
    saveBtn: {
      paddingHorizontal:16, paddingVertical:13, backgroundColor:C.cyan,
      borderRadius:12, justifyContent:'center', alignItems:'center',
    },
    saveBtnText: { color:'#000', fontWeight:'700', fontSize:13 },
    hint: { fontSize:10, color:C.muted, marginTop:8, fontFamily:'monospace' },
    statRow: {
      flexDirection:'row', justifyContent:'space-between', alignItems:'center',
      paddingVertical:10, borderBottomWidth:1, borderBottomColor:C.border,
    },
    statLabel: { fontSize:12, color:C.muted },
    statVal: { fontSize:14, fontWeight:'700', fontFamily:'monospace' },
    themeRow: { flexDirection:'row', gap:12 },
    themeBtn: {
      flex:1, backgroundColor:C.surface2, borderWidth:1, borderColor:C.border,
      borderRadius:14, padding:20, alignItems:'center', gap:8, position:'relative',
    },
    themeBtnActive: { borderColor:C.cyan },
    themeIcon: { fontSize:28 },
    themeLabel: { fontSize:13, fontWeight:'600', color:C.muted },
    themeCheck: {
      position:'absolute', top:10, right:10, width:18, height:18,
      borderRadius:9, alignItems:'center', justifyContent:'center',
    },
    colorRow: {
      flexDirection:'row', alignItems:'center', gap:14, paddingVertical:10,
      borderBottomWidth:1, borderBottomColor:C.border,
    },
    colorDot: { width:14, height:14, borderRadius:7 },
    colorLabel: { fontSize:12, fontWeight:'700' },
    colorDesc: { fontSize:11, color:C.muted, marginTop:2 },
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

