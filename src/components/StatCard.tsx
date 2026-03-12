import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../utils/theme';

interface Props {
  label: string;
  value: string;
  sub?: string;
  valueColor?: string;
  style?: ViewStyle;
  children?: React.ReactNode;
}

export const StatCard: React.FC<Props> = ({ label, value, sub, valueColor, style, children }) => (
  <View style={[styles.card, style]}>
    <Text style={styles.label}>{label}</Text>
    <Text style={[styles.value, valueColor ? { color: valueColor } : {}]}>{value}</Text>
    {sub ? <Text style={styles.sub}>{sub}</Text> : null}
    {children}
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    padding: 16,
  },
  label: {
    fontSize: 9,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: Colors.muted,
    marginBottom: 8,
    fontFamily: 'monospace',
  },
  value: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.cyan,
    fontFamily: 'monospace',
    lineHeight: 28,
  },
  sub: {
    fontSize: 11,
    color: Colors.muted,
    marginTop: 6,
    lineHeight: 16,
  },
});
