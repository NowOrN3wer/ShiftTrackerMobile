import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../utils/theme';

interface Props {
  value: number;   // 0–100
  label?: string;
  color?: string;
}

export const ProgressBar: React.FC<Props> = ({ value, label, color = Colors.cyan }) => (
  <View style={styles.wrap}>
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${Math.min(value, 100)}%` as any, backgroundColor: color }]} />
    </View>
    {label ? <Text style={styles.label}>{label}</Text> : null}
  </View>
);

const styles = StyleSheet.create({
  wrap: { marginTop: 10 },
  track: {
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 2,
  },
  label: {
    fontSize: 10,
    color: Colors.muted,
    marginTop: 6,
    fontFamily: 'monospace',
  },
});
