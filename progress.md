# Proje İlerleme Durumu (Progress)

## Tamamlanan Özellikler ve Modüller
- [x] Temel UI yapısı ve Navigasyon sistemi kurulumu tamamlandı.
- [x] SQLite ile yerel veritabanı entegrasyonu (`expo-sqlite`) sağlandı.
- [x] iOS ve Android için native tarih ve saat seçici (`@react-native-community/datetimepicker`) eklendi.
- [x] Tema desteği eklendi (Açık mod ve Koyu mod - System Dark Mode uyumluluğu).
- [x] Kullanıcıların kendi "Giriş" ve "Çıkış" (Varsayılan Mesai Saatleri) standartlarını belirleyebilmesi sağlandı (`useAppSettings` üzerinden).
- [x] Mesai tablosunda tarihe göre gerçek zamanlı azalan (Descending) sıralama (Timestamp hesaplamasıyla) düzeltildi.
- [x] Dashboard'daki hedeflerin (haftalık, aylık) ve yüzdelik dilimlerin statik olmaktan çıkarılıp tamamen kullanıcının saatlerine göre dinamik hesaplanması sağlandı.
- [x] Dashboard'a "Bu Yıl En İyi", "Bu Yıl En Kötü", "Bu Ay En İyi" ve "Bu Ay En Kötü" mesai istatistiklerinin gösterimi eklendi.
- [x] Tatil (`isHoliday: true`) işlenen günlerin, ilgili ayın ve haftanın hedefinden düşülmesi sağlandı.
- [x] Projenin Github repostory'si (`NowOrN3wer/ShiftTrackerMobile`) oluşturuldu ve ilk push gönderildi.

## Karşılaşılan ve Çözülen Temel Sorunlar
- **Sıralama Sorunu:** SQLite sorgularından (ORDER BY date DESC ile) dönen ve `DD.MM.YYYY` formatında olan tarihlerin string mantığı nedeniyle yanlış harmanlanması, UI tarafında `Date` nesnesine parse edilip yeniden sıralanarak çözüldü.
- **DateTimePicker Çökmesi:** Tarih ve Saat seçimlerinde başlangıç aşamasında geçerli bir default değer olmaması halinde bileşene `NaN` gönderilmesi sonucu (özellikle iOS cihazlarda) oluşan çökme sorunu önlendi (Güvenlikli parse kontrolü içeren yardımcı fonksiyonlar eklendi).
