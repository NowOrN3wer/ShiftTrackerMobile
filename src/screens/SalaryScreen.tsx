import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, KeyboardAvoidingView, Platform, Alert, Modal
} from 'react-native';
import { useAppSettings } from '../hooks/useAppSettings';
import { useSalaries } from '../hooks/useSalaries';
import { timeToMins } from '../utils/helpers';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

export const SalaryScreen: React.FC = () => {
  const { colors: C, themeMode, defaultStart, defaultEnd } = useAppSettings();
  const { salaries, addOrUpdate, remove } = useSalaries();

  // New Salary Entry State
  const [salAmount, setSalAmount] = useState('');
  const [salDate, setSalDate] = useState(new Date());
  
  // Modals & UI Toggles
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showSalaries, setShowSalaries] = useState(false); // Default hidden privacy state
  const isDark = themeMode === 'dark';

  // Purchase Calculator State
  const [itemPrice, setItemPrice] = useState('');
  
  // Standard workable minutes per day based on settings
  const standardMins = timeToMins(defaultEnd) - timeToMins(defaultStart);

  const onDateChange = (_e: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') setShowDatePicker(false);
    if (selected) setSalDate(selected);
  };

  const handleAddSalary = async () => {
    const amount = parseFloat(salAmount.replace(',', '.'));
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Hata', 'Lütfen geçerli bir maaş tutarı giriniz.');
      return;
    }
    const dStr = `${String(salDate.getDate()).padStart(2,'0')}.${String(salDate.getMonth()+1).padStart(2,'0')}.${salDate.getFullYear()}`;
    await addOrUpdate(amount, dStr);
    setSalAmount('');
    Alert.alert('Başarılı', 'Maaş bilgisi kaydedildi.');
  };

  const handleDeleteSalary = (id: string) => {
    Alert.alert('Sil', 'Bu kaydı silmek istediğinize emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      { text: 'Sil', style: 'destructive', onPress: () => remove(id) }
    ]);
  };

  const s = makeStyles(C);

  // Convert required minutes into actionable human-readable format
  const renderPurchaseTime = () => {
    const price = parseFloat(itemPrice.replace(',', '.'));
    if (isNaN(price) || price <= 0 || salaries.length === 0) return null;

    // Latest salary is the first in the sorted array
    const latestSalary = salaries[0].amount;
    
    // We assume 30 days a month for a standard salary calculation
    const dailyWage = latestSalary / 30;
    const hourlyWage = dailyWage / (standardMins / 60);

    const requiredHours = price / hourlyWage;
    const requiredDays = requiredHours / (standardMins / 60);
    const requiredWeeks = requiredDays / 5; // Assuming 5 work days a week for goal setting
    const requiredMonths = price / latestSalary;
    const requiredYears = requiredMonths / 12;

    return (
      <View style={[s.resultBox, { backgroundColor: C.surface2, borderColor: C.border }]}>
        <Text style={[s.resultTitle, { color: C.cyan }]}>Çalışılması Gereken Tahmini Süre</Text>
        <View style={s.resultGrid}>
          <ResultItem label="Saat" value={requiredHours.toFixed(1)} C={C} />
          <ResultItem label="Gün" value={requiredDays.toFixed(1)} C={C} />
          <ResultItem label="Hafta" value={requiredWeeks.toFixed(1)} C={C} />
          <ResultItem label="Ay" value={requiredMonths.toFixed(1)} C={C} />
          <ResultItem label="Yıl" value={requiredYears.toFixed(2)} C={C} />
        </View>
        <Text style={[s.infoText, { color: C.muted }]}>
          *Hesaplama son maaşınız ({showSalaries ? `${latestSalary.toLocaleString('tr-TR')} ₺` : '**** ₺'}) ve günlük mesai standardınız ({Math.floor(standardMins/60)}s {(standardMins%60)}dk) üzerinden brüt olarak yapılmıştır.
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <ScrollView style={[s.container, { backgroundColor: C.bg }]} keyboardShouldPersistTaps="handled">
        
        {/* Salary History Section */}
        <View style={[s.card, { backgroundColor: C.surface, borderColor: C.border }]}>
          <View style={s.sectionHeader}>
            <Text style={[s.sectionTitle, { color: C.text }]}>Maaş Ekle / Geçmiş</Text>
            <TouchableOpacity onPress={() => setShowSalaries(!showSalaries)} style={s.eyeButton}>
              <Text style={{ fontSize: 16 }}>{showSalaries ? '👁️' : '🙈'}</Text>
              <Text style={{ fontSize: 12, color: C.cyan, fontWeight: '700', marginLeft: 4 }}>
                {showSalaries ? 'Gizle' : 'Göster'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={s.inputRow}>
            <TextInput
              style={[s.input, { backgroundColor: C.bg, color: C.text, borderColor: C.border }]}
              placeholder="0.00 ₺"
              placeholderTextColor={C.muted}
              keyboardType="decimal-pad"
              value={salAmount}
              onChangeText={setSalAmount}
            />
            <TouchableOpacity 
              style={[s.dateButton, { backgroundColor: C.surface2, borderColor: C.border }]}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={{ color: C.text, fontFamily: 'monospace' }}>
                {salDate.toLocaleDateString('tr-TR')}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={[s.addBtn, { backgroundColor: C.cyan }]} onPress={handleAddSalary}>
            <Text style={s.addBtnText}>Kaydet</Text>
          </TouchableOpacity>

          {/* Salary List */}
          <View style={s.listContainer}>
            {salaries.map((sal, index) => {
              const previousSalary = salaries[index + 1];
              let diffText = '';
              let diffColor = C.muted;
              if (previousSalary) {
                const diff = sal.amount - previousSalary.amount;
                const percent = Math.abs((diff / previousSalary.amount) * 100).toFixed(1);
                
                if (diff > 0) {
                  diffText = `(+${diff.toLocaleString('tr-TR')} ₺ | %${percent} Zam)`;
                  diffColor = C.green;
                } else if (diff < 0) {
                  diffText = `(${diff.toLocaleString('tr-TR')} ₺ | -%${percent} Düşüş)`;
                  diffColor = C.red;
                }
              }

              const displayAmount = showSalaries ? `${sal.amount.toLocaleString('tr-TR')} ₺` : '**** ₺';
              const displayDiff = showSalaries ? diffText : (diffText ? '****' : '');

              return (
                <TouchableOpacity 
                  key={sal.id} 
                  style={[s.row, { borderBottomColor: C.border }]}
                  onLongPress={() => handleDeleteSalary(sal.id)}
                >
                  <View>
                    <Text style={[s.rowDate, { color: C.muted }]}>{sal.date}</Text>
                    <Text style={[s.rowAmount, { color: C.text }]}>{displayAmount}</Text>
                  </View>
                  <Text style={[s.rowDiff, { color: diffColor }]}>{displayDiff}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Purchase Calculator Section */}
        <View style={[s.card, { backgroundColor: C.surface, borderColor: C.border, marginTop: 16 }]}>
          <Text style={[s.sectionTitle, { color: C.text }]}>Alışveriş & Hedef Hesaplayıcı</Text>
          <Text style={[s.infoText, { color: C.muted, marginBottom: 12 }]}>
            Almak istediğiniz bir eşyanın fiyatını girin, onu alabilmek için ne kadar çalışmanız gerektiğini hesaplayalım.
          </Text>
          
          <TextInput
            style={[s.largeInput, { backgroundColor: C.bg, color: C.cyan, borderColor: C.border }]}
            placeholder="Eşya Fiyatı (₺)"
            placeholderTextColor={C.muted}
            keyboardType="decimal-pad"
            value={itemPrice}
            onChangeText={setItemPrice}
          />

          {renderPurchaseTime()}
        </View>

        {/* iOS Date Picker Modal */}
        {Platform.OS === 'ios' && (
          <Modal visible={showDatePicker} transparent animationType="slide">
            <View style={s.modalOverlay}>
              <View style={[s.modalContent, { backgroundColor: isDark ? '#1c1f2a' : '#fff' }]}>
                <View style={s.modalHeader}>
                  <Text style={[s.modalTitle, { color: C.text }]}>Tarihi Seçin</Text>
                  <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                    <Text style={[s.modalDone, { color: C.cyan }]}>Tamam</Text>
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  value={salDate}
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

        {/* Android Date Picker */}
        {Platform.OS === 'android' && showDatePicker && (
          <DateTimePicker
            value={salDate}
            mode="date"
            display="default"
            onChange={onDateChange}
          />
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const ResultItem = ({ label, value, C }: { label: string, value: string, C: any }) => (
  // We cannot use standard styles outside of makeStyles context easily, so we just use local objects or pass down `s`
  <View style={{ width: '30%', alignItems: 'center', marginBottom: 12 }}>
    <Text style={{ fontSize: 18, fontWeight: '700', fontFamily: 'monospace', color: C.text }}>{value}</Text>
    <Text style={{ fontSize: 11, marginTop: 4, textTransform: 'uppercase', fontFamily: 'monospace', color: C.muted }}>{label}</Text>
  </View>
);

function makeStyles(C: ReturnType<typeof import('../utils/theme').getColors>) {
  return StyleSheet.create({
    container: { flex: 1, padding: 16 },
    card: { borderWidth: 1, borderRadius: 16, padding: 16 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    sectionTitle: { fontSize: 16, fontWeight: '700', fontFamily: 'monospace' },
    eyeButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface2, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
    inputRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
    input: { flex: 1, borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 16, fontFamily: 'monospace' },
    dateButton: { flex: 1, borderWidth: 1, borderRadius: 10, padding: 12, alignItems: 'center', justifyContent: 'center' },
    addBtn: { padding: 14, borderRadius: 10, alignItems: 'center' },
    addBtnText: { color: '#000', fontWeight: '700', fontSize: 16, fontFamily: 'monospace' },
    listContainer: { marginTop: 24 },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1 },
    rowDate: { fontSize: 12, fontFamily: 'monospace', marginBottom: 4 },
    rowAmount: { fontSize: 18, fontWeight: '700', fontFamily: 'monospace' },
    rowDiff: { fontSize: 12, fontWeight: '600', fontFamily: 'monospace' },
    largeInput: { borderWidth: 1, borderRadius: 10, padding: 16, fontSize: 24, fontWeight: '700', textAlign: 'center', fontFamily: 'monospace', marginBottom: 16 },
    infoText: { fontSize: 11, lineHeight: 16, fontFamily: 'monospace' },
    resultBox: { borderWidth: 1, borderRadius: 12, padding: 16, marginTop: 8 },
    resultTitle: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 16, textAlign: 'center', fontFamily: 'monospace' },
    resultGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 16 },
    // Modal stilleri
    modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
    modalContent: { borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 40 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(128,128,128,0.15)' },
    modalTitle: { fontSize: 16, fontWeight: '700' },
    modalDone: { fontSize: 16, fontWeight: '600' },
  });
}

