import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppSettings } from '../hooks/useAppSettings';

export const Legend: React.FC = () => {
  const { colors: C } = useAppSettings();
  const items = [
    { color: C.red,    label: '< 9:30' },
    { color: C.yellow, label: '9:30–10:30' },
    { color: C.blue,   label: '10:30+' },
    { color: C.purple, label: 'Tatil' },
  ];
  return (
    <View style={styles.wrap}>
      {items.map(item => (
        <View key={item.label} style={styles.item}>
          <View style={[styles.dot, { backgroundColor: item.color }]} />
          <Text style={[styles.label, { color: C.muted }]}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { flexDirection:'row', flexWrap:'wrap', gap:10, marginBottom:12 },
  item: { flexDirection:'row', alignItems:'center', gap:5 },
  dot:  { width:8, height:8, borderRadius:4 },
  label: { fontSize:10 },
});
