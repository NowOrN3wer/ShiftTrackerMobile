# AI Geliştirici Talimatları (AI Instructions)

Mevcut projede çalışacak olan yapay zeka (Cursor, Claude, GitHub Copilot, vb.) için bağlamı ve standartları belirleyen proje kuralları.

## Proje Stack'i
- **Framework:** React Native (Expo)
- **Dil:** TypeScript (`.tsx`, `.ts`)
- **UI & Stil:** StyleSheet `makeStyles()` fonksiyonu ile dinamik tema enjeksiyonu.
- **Veritabanı:** `expo-sqlite` (Tüm mesai CRUD operasyonları buradan yürütülür).
- **Tarih Seçici:** `@react-native-community/datetimepicker`
- **Tarih Formatı:** UI üzerinde standart `DD.MM.YYYY`.

## Geliştirme Kuralları
1. **Tip Güvenliği:** Her yeni bileşen, yardımcı fonksiyon (helper) ve hook için uygun TypeScript `interface` veya `type` tanımlamalarını mutlaka yapın. Kodda mümkün olduğunca `any` kullanmaktan kaçının.
2. **Local Storage Mantığı:** Basit ve global değerler (Tema seçimi, işe başlama tarihi, standart giriş çıkış saatleri) için `AsyncStorage` (`src/hooks/useAppSettings.tsx`), yoğun ve satırsal veri kümeleri (her güne ait mesai kaydı) için `expo-sqlite` kullanılmalıdır. Bu iki kuralı birbirine karıştırmayın.
3. **Tarih ve Saat İşlemleri:** Uygulamada saat standartları katı kodlanmış (hardcoded 9 saat 30 dakika) değildir. Saatler, ayarlar üzerinden dinamik alınır. Herhangi bir tarih karşılaştırması yapacağınızda doğrudan string ('01.12.YYYY' > '30.11.YYYY') kıyası yapmayın; mutlaka `src/utils/helpers.ts` içerisindeki `parseDate` metodunu kullanarak `Date` veya milisaniye türüne dönüştürerek yapın.
4. **Tema Çözümlemesi:** Renkleri donuk (`'#000'`, `'red'`) gibi ifadelerle vermeyin. Projede karanlık/aydınlık mod uyarlaması vardır. `makeStyles(C)` yapısını takip edin ve her rengi `C.cyan`, `C.surface`, `C.text` vb. şeklinde tetikleyin.
5. **Dosya Değişiklik Önkoşulu:** Projede herhangi bir geliştirme/değişiklik yapmadan önce bu dosya dahil olmak üzere `agenda.md` ve `progress.md` dosyalarına göz gezdirip mevcut plan ve kurallara uyun. Kod yazımını her zaman temiz tutun (Clean Code).

## Önemli Yol Göstericiler (Dosyalar)
- `src/hooks/useAppSettings.tsx`: Tema modunun, varsayılan uygulamaların (saatlerin) yönetildiği context dosyası.
- `src/utils/db.ts`: Tüm kayıt yükleme, yazma, güncelleme işlemlerinin gerçekleştiği veritabanı servisi.
- `src/utils/helpers.ts`: Verilerin birbirine çevrilmesi, sürelerin hesaplanması ve süre durumlarına göre renk (`red, yellow, blue`) tayin etme merkezi.
- `src/types/index.ts`: Temel arayüz şemalarını bulunduran tanımlama dosyası.
