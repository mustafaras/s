# REPO-L003 — L2-b state/migrate sınır envanteri

**Tarih:** 2026-08-02
**Durum:** `ready_for_review`
**Kapsam:** `app/core/state.js` için yalnız read-only sınır ve fixture
tasarımı.
**Runtime değişikliği:** Yok.
**Kullanıcı verisi:** Okunmadı/yazılmadı.

## Kanıtlanan mevcut sınır

`app.js` içindeki state boot/migration alanı:

- `data` yükleme boot bloğu: satır 1310–1313.
- `migrate(d)`: satır 1314–1489.
- `ui` başlangıcı ayrı ephemeral yüzey olarak satır 1537’de başlıyor.
- `createDefaultData()`: satır 3284–3287.

| Kaynak gövdesi | SHA-256 |
|---|---|
| `app.js` satır 1310–1313 boot bloğu | `9772a76d8df092d155372f669d53cfc347224b4a9b7a6c780d85f8e75af0a726` |
| `app.js` satır 1314–1489 `migrate()` | `e36c6068968ce081120eca391e091eabaf16896df045ac8543b6574f82c66e66` |
| `app.js` satır 3284–3287 `createDefaultData()` | `c7e4257bfc675f2d87eab3f5bdfde6cef1c35a53009a8beb57fce6aafb31a90b` |
| Mevcut `app.js` | `7ae3cea827ede29a0c19d2956eaeb190928c532836a754da4fcb6ff567fbd2a7` / 13.481 satır |

Bu turda bu byte sınırlarının hiçbiri değiştirilmedi.

## `migrate()` doğrudan bağımlılıkları

| Bağımlılık | Konum | Sınır riski |
|---|---:|---|
| `ensureSaygiDay` | 1814 | Gün kayıtlarını yerinde backfill eder |
| `emptyZikrRoot`, `migrateZikrV2` | 294, 449 | `ZIKR_*`, `window.EsmaulHusnaV1`, `zikrUid` ve V3/V4 migration zinciri |
| `emptySaygiRoot` | 637 | Saygı kalıcı kökünü oluşturur |
| `ensureQuranJourney` | 740 | QY şema sabitleri, opsiyonel katalog ve video/not alanları |
| `emptyLibrary`, `normBook` | 2039, 2854 | `uid()` ile yeni kimlik üretir; mevcut kayıtları mutate eder |
| `emptyWatchlist`, `normTitle` | 2040, 2855 | Aynı kimlik/tip/alan mutasyonu riski |
| `emptyMusic`, `normTrack` | 2043, 2860 | Arşiv kaydını normalize eder |
| `emptySoulArchive`, `normSoulItem` | 2044, 2872 | `soulActivityById` kataloğuna bağlı |
| `backfillArchivesFromDays` | 2876 | Geçici olarak global `data=d` değiştirir; en kritik ayrıştırma riski |
| `todayStr`, `syncDerivedHabits` | 1578, 1994 | Zaman ve günlük türetilmiş tik davranışını etkiler |
| `ensureProfileAssessment` | 2100 | `window.ProfileAssessmentV1` sürüm/cevap sözleşmesi |
| `ensureTherapyAllDays` | 1813 | Tüm gün kayıtlarını terapi alanlarıyla mutate eder |
| `ensurePrayerDay` | 99 | `PRAYER_ORDER` ve prayer alanlarını backfill eder |
| `CAFFEINE_DEFAULT_BED` | 924 | Sabitler modülüyle ileride ortaklaştırılacak değer |

Bu tablo, `migrate()`ın yalnızca “default state” dosyasına kopyalanmasının
yanlış olduğunu kanıtlar. Özellikle `backfillArchivesFromDays` global `data`
değişimi ve `migrateZikrV2`/`ensureQuranJourney` içerik modülü bağımlılıkları,
önce dependency-bag veya saf adapter tasarımı gerektirir.

## Güvenli hedef sözleşme (henüz uygulanmadı)

İlk state modülü doğrudan global `data` yazmamalı; klasik script olarak şu
read-only test edilebilir yüzeyi hedeflemelidir:

```js
window.SeymaState = {
  createDefaultData,
  migrate,
  ensureProfileAssessment,
  stateSchemaVersion: 2
};
```

Gerçek uygulama entegrasyonunda eski `app.js` yüzeyi korunur. Migration
adapter’ı dependency bag ile çağrılır:

```js
migrate(input, {
  now,
  uid,
  catalogs,
  featureMigrations,
  logger
});
```

Bu API bu turda oluşturulmadı; yalnızca sonraki kod adımının sınırı olarak
kayda alındı.

## Read-only migration fixture kapısı

Kod taşınmadan önce aşağıdaki fixture sınıfları aynı `migrate()` üzerinde
çalıştırılmalıdır:

1. **Boş/eski minimal:** `settings`, `days`, `profileAssessment`, Zikirmatik,
   Kur’an ve prayer kökleri yok.
2. **Kısmi eski kayıt:** mevcut gün/not/tik/kitap/video notu korunurken eksik
   yeni alanlar backfill edilir.
3. **Zengin gerçekçi şekil:** Zikirmatik tefekkürleri, Kur’an video history ve
   notları, profil cevapları, arşiv kayıtları, namaz ve bilimsel profil alanları
   birlikte bulunur.
4. **Bozuk tipler:** `null`, string, dizi yerine obje ve bilinmeyen alanlar;
   geçerli veri silinmez, tip hataları güvenli default’a iner.
5. **İdempotens:** İlk migration sonrası ikinci ve üçüncü geçişte derin
   eşdeğerlik; zaman damgası ve kimlikler gereksiz yere değişmez.

Her fixture şu kapıları taşımalıdır:

- bilinmeyen top-level/nested alan korunur;
- `data.psych` ve kullanıcı cevapları bit-bit korunur;
- Kur’an `notes[]`/`videoHistory`, Zikirmatik lifetime/hatim/tefekkür ve
  profil `responses` kayıp üretmez;
- `version===2` kalır;
- migration sırasında `localStorage.setItem`, `SeySync.schedule`, fetch veya
  GitHub Contents API çağrısı yapılmaz;
- `migrate()` yalnız verilen clone üzerinde çalışır; global `data` side effect
  fixture’ta ayrıca assert edilir.

## Sıralı sonraki adımlar

1. **B0 (bu kayıt):** sınır/hash/bağımlılık envanteri — tamamlandı.
2. **B1:** `empty*` ve saf normalizer helper’larını dependency-bag ile
   read-only test etmek; runtime’a bağlamamak.
3. **B2:** `migrate()` adapter’ını eski gövdeyle byte/fixture parity sağlayacak
   şekilde scratch harness’te çalıştırmak.
4. **B3:** yalnız parity kanıtı sonrası `index.html`ye state scripti eklemek ve
   app.js boot çağrısını aynı sırada yönlendirmek.
5. **B4:** ayrı kabul kapısıyla persistence (`save`/localStorage/sync) sınırına
   geçmek. Bu kayıt B4 yetkisi vermez.

## Güvenlik ve durak

Gerçek tarayıcı açılmadı, server başlatılmadı, ağ/fetch çalıştırılmadı.
`data/`, `sync.js`, localStorage ve `mustafaras/seyma-data` değişmedi. Commit,
push, merge ve deploy yapılmadı. `REPO-L003` yalnız envanter/plan kapısıdır;
sonraki güvenli adım B1 read-only helper fixture’ıdır.
