import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Animated, Easing,
  Dimensions,
} from 'react-native';

const { width, height } = Dimensions.get('window');

interface Props {
  onFinish: () => void;
  themeMode: 'dark' | 'light';
}

export const SplashScreen: React.FC<Props> = ({ onFinish, themeMode }) => {
  const dark = themeMode === 'dark';

  const logoScale   = useRef(new Animated.Value(0.4)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const subOpacity  = useRef(new Animated.Value(0)).current;
  const screenOpacity = useRef(new Animated.Value(1)).current;

  // Arka plan için gradient efekti — animasyonlu daire
  const ringScale   = useRef(new Animated.Value(0)).current;
  const ringOpacity = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    Animated.sequence([
      // 1) Arka halka genişle
      Animated.parallel([
        Animated.timing(ringScale, {
          toValue: 1,
          duration: 700,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(ringOpacity, {
          toValue: 0,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
      // 2) Logo belir + büyü
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 60,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
      // 3) Başlık belir
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
      // 4) Alt yazı belir
      Animated.timing(subOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      // 5) 1.2s bekle
      Animated.delay(1200),
      // 6) Tüm ekran karararak geç
      Animated.timing(screenOpacity, {
        toValue: 0,
        duration: 450,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => onFinish());
  }, []);

  const bg  = dark ? '#0d0f14' : '#f0f2f8';
  const accent = '#22d3ee';

  return (
    <Animated.View style={[styles.container, { backgroundColor: bg, opacity: screenOpacity }]}>

      {/* Arka halka animasyonu */}
      <Animated.View style={[
        styles.ring,
        {
          borderColor: accent,
          transform: [{ scale: ringScale.interpolate({ inputRange:[0,1], outputRange:[0.3, 3] }) }],
          opacity: ringOpacity,
        }
      ]} />

      {/* Logo */}
      <Animated.View style={[
        styles.logoWrap,
        { transform: [{ scale: logoScale }], opacity: logoOpacity }
      ]}>
        <View style={[styles.logoBox, { backgroundColor: dark ? '#151820' : '#fff', borderColor: dark ? '#252a3a' : '#d0d4e8' }]}>
          <Text style={styles.logoEmoji}>⏱</Text>
        </View>
      </Animated.View>

      {/* Başlık */}
      <Animated.Text style={[styles.title, { color: dark ? '#e8eaf6' : '#1a1d2e', opacity: textOpacity }]}>
        ShiftTracker
      </Animated.Text>

      {/* Alt yazı */}
      <Animated.Text style={[styles.sub, { color: dark ? '#5a6080' : '#7a80a0', opacity: subOpacity }]}>
        Mesai takip, hep yanında.
      </Animated.Text>

      {/* Alt versiyon */}
      <Animated.Text style={[styles.version, { color: dark ? '#252a3a' : '#d0d4e8', opacity: subOpacity }]}>
        v1.0.0
      </Animated.Text>

    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  ring: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 1.5,
  },
  logoWrap: {
    marginBottom: 24,
    shadowColor: '#22d3ee',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 12,
  },
  logoBox: {
    width: 88,
    height: 88,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoEmoji: {
    fontSize: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  sub: {
    fontSize: 14,
    fontWeight: '400',
    letterSpacing: 0.2,
  },
  version: {
    position: 'absolute',
    bottom: 48,
    fontSize: 12,
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
});
