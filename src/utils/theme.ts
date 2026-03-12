export type ThemeMode = 'dark' | 'light';

export const DarkColors = {
  bg:       '#0d0f14',
  surface:  '#151820',
  surface2: '#1c2030',
  border:   '#252a3a',
  text:     '#e8eaf6',
  muted:    '#5a6080',
  cyan:     '#22d3ee',
  red:      '#ef4444',
  yellow:   '#eab308',
  blue:     '#3b82f6',
  purple:   '#a855f7',
  green:    '#22c55e',
} as const;

export const LightColors = {
  bg:       '#f0f2f8',
  surface:  '#ffffff',
  surface2: '#e8eaf2',
  border:   '#d0d4e8',
  text:     '#1a1d2e',
  muted:    '#7a80a0',
  cyan:     '#0891b2',
  red:      '#dc2626',
  yellow:   '#ca8a04',
  blue:     '#2563eb',
  purple:   '#9333ea',
  green:    '#16a34a',
} as const;

export type Colors = typeof DarkColors;

export function getColors(mode: ThemeMode): Colors {
  return mode === 'dark' ? DarkColors : LightColors;
}

export function getRowColors(mode: ThemeMode) {
  const C = getColors(mode);
  return {
    red:    { bg: mode==='dark' ? 'rgba(239,68,68,0.10)'  : 'rgba(220,38,38,0.07)',  accent: C.red    },
    yellow: { bg: mode==='dark' ? 'rgba(234,179,8,0.10)'  : 'rgba(202,138,4,0.07)',  accent: C.yellow },
    blue:   { bg: mode==='dark' ? 'rgba(59,130,246,0.10)' : 'rgba(37,99,235,0.07)',  accent: C.blue   },
    purple: { bg: mode==='dark' ? 'rgba(168,85,247,0.12)' : 'rgba(147,51,234,0.08)', accent: C.purple },
    none:   { bg: 'transparent',                                                       accent: C.border },
  };
}
