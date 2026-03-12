import React, { useState } from 'react';
import {
  ScrollView, View, Text, TouchableOpacity,
  StyleSheet, Switch, Alert, Platform, Modal,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useAppSettings } from '../hooks/useAppSettings';
import {
  calcElapsedDays, calcElapsedLabel, calcElapsedYears, formatDateLong,
} from '../utils/helpers';

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

export const SettingsScreen: React.FC = () => {
  const { colors: C, themeMode, setTheme, startDate, setStartDate } = useAppSettings();
  const [dateInput, setDateInput] = useState(startDate);
  const [saved, setSaved] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const isDark = themeMode === 'dark';

  const onDateChange = (_e: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') setShowDatePicker(false);
    if (selected) setDateInput(formatDate(selected));
  };

  const handleSave = () => {
    // basic format check DD.MM.YYYY
    const re = /^\d{2}\.\d{2}\.\d{4}$/;
    if (!re.test(dateInput)) {
      Alert.alert('Hata', 'Tarih formatı: GG.AA.YYYY\nÖrnek: 01.06.2024');
      return;
    }
    setStartDate(dateInput);
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
            <TouchableOpacity
              style={[s.saveBtn, saved && { backgroundColor: C.green }]}
              onPress={handleSave}
              activeOpacity={0.8}
            >
              <Text style={s.saveBtnText}>{saved ? '✓ Kaydedildi' : 'Kaydet'}</Text>
            </TouchableOpacity>
          </View>
          <Text style={s.hint}>Şu an kayıtlı: {startDate}</Text>
        </View>

        {/* iOS Picker Modal */}
        {Platform.OS === 'ios' && (
          <Modal visible={showDatePicker} transparent animationType="slide">
            <View style={s.modalOverlay}>
              <View style={[s.modalContent, { backgroundColor: isDark ? '#1c1f2a' : '#fff' }]}>
                <View style={s.modalHeader}>
                  <Text style={[s.modalTitle, { color: C.text }]}>Başlangıç Tarihi Seç</Text>
                  <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                    <Text style={[s.modalDone, { color: C.cyan }]}>Tamam</Text>
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  value={parseDate(dateInput)}
                  mode="date"
                  display="spinner"
                  onChange={onDateChange}
                  locale="tr-TR"
                  themeVariant={isDark ? 'dark' : 'light'}
                  style={{ height: 180 }}
                />
              </View>
            </View>
          </Modal>
        )}
        {Platform.OS === 'android' && showDatePicker && (
          <DateTimePicker value={parseDate(dateInput)} mode="date" onChange={onDateChange} />
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
          {[
            { color: C.red,    label: 'Kırmızı', desc: '9 saat 30 dakikadan az' },
            { color: C.yellow, label: 'Sarı',    desc: '9:30 ile 10:30 arası' },
            { color: C.blue,   label: 'Mavi',    desc: '10 saat 30 dakika ve üzeri' },
            { color: C.purple, label: 'Mor',     desc: 'Tatil / Resmi tatil günü' },
          ].map(item => (
            <View key={item.label} style={s.colorRow}>
              <View style={[s.colorDot, { backgroundColor: item.color }]}/>
              <View>
                <Text style={[s.colorLabel, { color: item.color }]}>{item.label}</Text>
                <Text style={s.colorDesc}>{item.desc}</Text>
              </View>
            </View>
          ))}
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

