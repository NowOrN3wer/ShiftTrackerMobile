# ShiftTracker 📊

React Native + TypeScript çalışma saati takip uygulaması.

## Kurulum

```bash
npm install
npx expo start
```

## Renk Sistemi (Mesai Listesi)

| Renk      | Koşul              |
|-----------|--------------------|
| 🔴 Kırmızı | < 9 saat 30 dk     |
| 🟡 Sarı   | 9:30 – 10:30 arası |
| 🔵 Mavi   | 10:30+             |
| 🟣 Mor    | Tatil günü         |

## Proje Yapısı

```
ShiftTracker/
├── App.tsx                        # Root + navigation
├── src/
│   ├── types/index.ts             # ShiftEntry, RowColor tipleri
│   ├── utils/
│   │   ├── theme.ts               # Renkler ve row color map
│   │   └── helpers.ts             # timeToMins, minsToHM, getRowColor...
│   ├── hooks/
│   │   └── useShifts.ts           # State yönetimi (addOrUpdate)
│   ├── components/
│   │   ├── StatCard.tsx           # Dashboard metric kartı
│   │   ├── ProgressBar.tsx        # İlerleme çubuğu
│   │   ├── ShiftRow.tsx           # Renkli liste satırı
│   │   └── Legend.tsx             # Renk açıklaması
│   └── screens/
│       ├── DashboardScreen.tsx    # Ana dashboard
│       └── MesaiScreen.tsx        # Giriş formu + liste
```

## Gereksinimler

- Node.js 18+
- Expo CLI
- iOS Simulator veya Android Emulator (ya da Expo Go uygulaması)
