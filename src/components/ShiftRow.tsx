import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { ShiftEntry } from '../types';
import { getRowColors } from '../utils/theme';
import { getRowColor, minsToHM, timeToMins } from '../utils/helpers';
import { Colors } from '../utils/theme';

interface Props {
  entry: ShiftEntry;
  onLongPress?: (entry: ShiftEntry) => void;
}

export const ShiftRow: React.FC<Props> = ({ entry, onLongPress }) => {
  const color = getRowColor(entry.startTime, entry.endTime, entry.isHoliday);
  const theme = getRowColors('dark')[color];

  const total = entry.isHoliday
    ? '—'
    : entry.startTime && entry.endTime
    ? minsToHM(timeToMins(entry.endTime) - timeToMins(entry.startTime))
    : '—';

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onLongPress={() => onLongPress?.(entry)}
      style={[styles.row, { backgroundColor: theme.bg }]}
    >
      <View style={[styles.accent, { backgroundColor: theme.accent }]} />
      <View style={styles.cell}>
        <Text style={styles.dateText}>{entry.date}</Text>
        <Text style={styles.dayText}>{entry.day}</Text>
      </View>
      <Text style={styles.timeText}>{entry.startTime || '—'}</Text>
      <Text style={styles.timeText}>{entry.endTime || '—'}</Text>
      <Text style={[styles.totalText, { color: theme.accent }]}>{total}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingRight: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.03)',
  },
  accent: {
    width: 3,
    alignSelf: 'stretch',
    marginRight: 10,
    borderRadius: 2,
  },
  cell: { flex: 1.8 },
  dateText: { fontSize: 11, color: Colors.text, fontFamily: 'monospace' },
  dayText:  { fontSize: 10, color: Colors.muted, marginTop: 2 },
  timeText: {
    flex: 1,
    fontSize: 12,
    color: Colors.text,
    fontFamily: 'monospace',
    textAlign: 'center',
  },
  totalText: {
    width: 44,
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'monospace',
    textAlign: 'right',
  },
});
