# REPO-L002 — L2-a sabitler/ikonlar ayrıştırma makbuzu

**Tarih:** 2026-08-02
**Durum:** `ready_for_review`
**Kapsam:** Yalnızca `app.js` içindeki boot sabitleri ve `ICONS` sözlüğü.
**Kapsam dışı:** `data`, `migrate`, `save`, `localStorage`, `sync.js`, panel
verisi, kullanıcı verisi ve dış ağ yazımı.

## Değişiklik

`app/core/constants.js` yeni bir klasik script olarak eklendi ve `index.html`
içinde `app.js`ten hemen önce yükleniyor. Modül aşağıdaki sözleşmeyi dışa
aktarır:

```js
window.SeymaConstants = {
  KEY,
  TKEY,
  FEATURE_GATE_TS,
  ICONS
};
```

`app.js` bu sözleşmeyi yerel alias'larla tüketiyor. Modül eksik/boş olsa bile
eski anahtar ve tarih değerleri için güvenli fallback korunuyor; üretim giriş
noktası ise sabitler modülünü deterministik sırada yükler. `icon()` yardımcısı
aynı IIFE içinde kaldı; böylece mevcut `App` ve inline handler yüzeyi
çözülmedi.

## Byte ve sınır kanıtı

| Ölçüm | Kanıt |
|---|---|
| Eski tam `ICONS` bloğu (`app.js` satır 15–141) | `62a2858973590752b124bc46b4f749c540feac41898e3757502efcc576573c50` |
| Taşınan ikon kayıt gövdesi (önce/sonra) | `149bf2f547a8392f700b1b2bf69dadd8af36618950965298f3cc662c66d582ac` |
| Eski `app.js` SHA-256 / satır | `66d8c3cfdfacc9e7da2e32da5107e3f482d18acd41b71aaaf4ce5ed611434a12` / 13.606 |
| Yeni `app.js` SHA-256 / satır | `7ae3cea827ede29a0c19d2956eaeb190928c532836a754da4fcb6ff567fbd2a7` / 13.481 |
| Yeni `app/core/constants.js` SHA-256 / satır | `321682fc27be3bf06f7689d08f6ca3422d3e53fc3da3a080cc8bf1ab743c5dfb` / 135 |
| `index.html` sabit yükleme sırası | `constants.js → app.js → sync.js` |

Sabit modülünde ikon kayıtlarının byte gövdesi değiştirilmedi; yalnızca
`var ICONS={` bildirimi `ICONS:{` nesne özelliğine dönüştürüldü.

## Fixture/harness uyumu

`app.js` boot eden `run-seyma` fixture'ları gerçek giriş sırasını taklit etmek
üzere `app/core/constants.js`i `app.js`ten önce yükleyecek şekilde güncellendi.
L1 panel ayrımından kalan iki eski regex kaynağı da `panel.html` yerine
`panel.js`e taşındı; bu, L2 davranışından bağımsız bir uyumluluk düzeltmesidir.

## Doğrulama kapıları

- `node --check app.js app/core/constants.js panel.js sync.js` — PASS.
- `driver.mjs` onboarding/seeded boot ve tema/tab etkileşimleri — PASS.
- `zikr-harness.mjs` — **90/90**.
- `test_faz10_sync.js` — **64/64**.
- `test_faz11_panel.js` — **50/50**.
- Profil, Zikirmatik ve Kur’an migration fixture'ları — PASS; Zikirmatik
  migration **41/41**, Kur’an migration **59/59**.
- `verify-zikir-math.mjs` — tüm matematik ve panel parity kontrolleri PASS.
- `git diff --check` — PASS.

## Veri güvenliği ve durak

Gerçek tarayıcı açılmadı; server başlatılmadı; fetch/GitHub Contents API
çalıştırılmadı. `data/`, `sync.js`, `localStorage` ve `mustafaras/seyma-data`
üzerinde okuma/yazma yapılmadı. Commit, push, merge ve deploy yapılmadı.

`REPO-L002` bu alt faz için `ready_for_review` durumundadır. Sonraki güvenli
adım, aynı kanıt disiplinini koruyarak `app/core/state.js` sınırını planlamak
ve `migrate()` için önce yalnızca read-only fixture kapsamını çıkarmaktır.
