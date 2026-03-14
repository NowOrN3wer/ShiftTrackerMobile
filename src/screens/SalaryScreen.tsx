import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, KeyboardAvoidingView, Platform, Alert
} from 'react-native';
import { useAppSettings } from '../hooks/useAppSettings';
import { useSalaries } from '../hooks/useSalaries';
import { timeToMins, todayStr } from '../utils/helpers';
import DateTimePicker from '@react-native-community/datetimepicker';

export const SalaryScreen: React.FC = () => {
  const { colors: C, themeMode, defaultStart, defaultEnd } = useAppSettings();
  const { salaries, addOrUpdate, remove } = useSalaries();

  // New Salary Entry State
  const [salAmount, setSalAmount] = useState('');
  const [salDate, setSalDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Purchase Calculator State
  const [itemPrice, setItemPrice] = useState('');
  
  // Standard workable minutes per day based on settings
  const standardMins = timeToMins(defaultEnd) - timeToMins(defaultStart);

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
      <View style={[styles.resultBox, { backgroundColor: C.surface2, borderColor: C.border }]}>
        <Text style={[styles.resultTitle, { color: C.cyan }]}>Çalışılması Gereken Tahmini Süre</Text>
        <View style={styles.resultGrid}>
          <ResultItem label="Saat" value={requiredHours.toFixed(1)} C={C} />
          <ResultItem label="Gün" value={requiredDays.toFixed(1)} C={C} />
          <ResultItem label="Hafta" value={requiredWeeks.toFixed(1)} C={C} />
          <ResultItem label="Ay" value={requiredMonths.toFixed(1)} C={C} />
          <ResultItem label="Yıl" value={requiredYears.toFixed(2)} C={C} />
        </View>
        <Text style={[styles.infoText, { color: C.muted }]}>
          *Hesaplama son maaşınız ({latestSalary.toLocaleString('tr-TR')} ₺) ve günlük mesai standardınız ({Math.floor(standardMins/60)}s {(standardMins%60)}dk) üzerinden brüt olarak yapılmıştır.
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <ScrollView style={[styles.container, { backgroundColor: C.bg }]} keyboardShouldPersistTaps="handled">
        
        {/* Salary History Section */}
        <View style={[styles.card, { backgroundColor: C.surface, borderColor: C.border }]}>
          <Text style={[styles.sectionTitle, { color: C.text }]}>Maaş Ekle / Güncelle</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, { backgroundColor: C.bg, color: C.text, borderColor: C.border }]}
              placeholder="0.00 ₺"
              placeholderTextColor={C.muted}
              keyboardType="decimal-pad"
              value={salAmount}
              onChangeText={setSalAmount}
            />
            <TouchableOpacity 
              style={[styles.dateButton, { backgroundColor: C.surface2, borderColor: C.border }]}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={{ color: C.text, fontFamily: 'monospace' }}>
                {salDate.toLocaleDateString('tr-TR')}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={[styles.addBtn, { backgroundColor: C.cyan }]} onPress={handleAddSalary}>
            <Text style={styles.addBtnText}>Kaydet</Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={salDate}
              mode="date"
              display="default"
              themeVariant={themeMode}
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) setSalDate(selectedDate);
              }}
            />
          )}

          {/* Salary List */}
          <View style={styles.listContainer}>
            {salaries.map((s, index) => {
              // Compare with the previous entry (which is the next in the array since it's sorted descending)
              const previousSalary = salaries[index + 1];
              let diffText = '';
              let diffColor = C.muted;
              if (previousSalary) {
                const diff = s.amount - previousSalary.amount;
                if (diff > 0) {
                  diffText = `(+${diff.toLocaleString('tr-TR')} ₺ Zam)`;
                  diffColor = C.green;
                } else if (diff < 0) {
                  diffText = `(${diff.toLocaleString('tr-TR')} ₺ Düşüş)`;
                  diffColor = C.red;
                }
              }

              return (
                <TouchableOpacity 
                  key={s.id} 
                  style={[styles.row, { borderBottomColor: C.border }]}
                  onLongPress={() => handleDeleteSalary(s.id)}
                >
                  <View>
                    <Text style={[styles.rowDate, { color: C.muted }]}>{s.date}</Text>
                    <Text style={[styles.rowAmount, { color: C.text }]}>{s.amount.toLocaleString('tr-TR')} ₺</Text>
                  </View>
                  <Text style={[styles.rowDiff, { color: diffColor }]}>{diffText}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Purchase Calculator Section */}
        <View style={[styles.card, { backgroundColor: C.surface, borderColor: C.border, marginTop: 16 }]}>
          <Text style={[styles.sectionTitle, { color: C.text }]}>Alışveriş & Hedef Hesaplayıcı</Text>
          <Text style={[styles.infoText, { color: C.muted, marginBottom: 12 }]}>
            Almak istediğiniz bir eşyanın fiyatını girin, onu alabilmek için ne kadar çalışmanız gerektiğini hesaplayalım.
          </Text>
          
          <TextInput
            style={[styles.largeInput, { backgroundColor: C.bg, color: C.cyan, borderColor: C.border }]}
            placeholder="Eşya Fiyatı (₺)"
            placeholderTextColor={C.muted}
            keyboardType="decimal-pad"
            value={itemPrice}
            onChangeText={setItemPrice}
          />

          {renderPurchaseTime()}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const ResultItem = ({ label, value, C }: { label: string, value: string, C: any }) => (
  <View style={styles.resItem}>
    <Text style={[styles.resVal, { color: C.text }]}>{value}</Text>
    <Text style={[styles.resLbl, { color: C.muted }]}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  card: { borderWidth: 1, borderRadius: 16, padding: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 16, fontFamily: 'monospace' },
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
  resItem: { width: '30%', alignItems: 'center', marginBottom: 12 },
  resVal: { fontSize: 18, fontWeight: '700', fontFamily: 'monospace' },
  resLbl: { fontSize: 11, marginTop: 4, textTransform: 'uppercase', fontFamily: 'monospace' },
});
