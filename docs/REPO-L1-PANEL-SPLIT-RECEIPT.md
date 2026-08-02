# REPO-L001 — ÆON Panel CSS/JS Ayrıştırma Makbuzu

**Tarih:** 2026-08-02
**Durum:** `completed` — tüm doğrulama kapıları geçti
**Kapsam:** Yalnız bağımsız `panel.html` observer shell’i
**Runtime sınırı:** `app.js`/`sync.js` ve Şeyma uygulaması değişmedi
**Kullanıcı verisi:** Okunmadı/yazılmadı

## Ayrıştırma kanıtı

| Alan | Önce | Sonra | Kanıt |
|---|---:|---:|---|
| `panel.html` | 4.114 satır, inline style + inline script | 20 satır shell | Önce hash `fa5208efd119a7a57d9382016c77355b1a340994da5cee223d6e0762c067a31c`; sonra hash `e7fcf45657fa1ed1be38800dbe07f373cbc6ad7cb373e79eac9e1d455a4bb5da` |
| CSS body | inline 261 satır | `panel.css` 261 satır | Body hash `8a269b489e49a0bd0545500fa1d76e21bfd88ef0c98020c74aa5349074aa3fcc` birebir |
| JS body | inline 3.831 satır | `panel.js` 3.831 satır | Body hash `85eb3168130e32d2ec3b3e67a34188a3ef56f2528183ef2825b8fe30ab5dd36f` birebir |

`panel.html` artık yalnız shell, `panel.css?v=20260802a` ve
`panel.js?v=20260802a` referanslarını içeriyor. Leaflet ve frozen içerik/transport
script sırası korunuyor; `panel.js` en son çalışıyor.

## Uyum korumaları

- `panel.js` mevcut IIFE, global helper adları, `window.load` ve inline
  `onclick` handler sözleşmesini koruyor.
- `test_faz11_panel.js` artık aynı kaynak fonksiyonları `panel.js` üzerinden
  okuyor; sentetik test davranışı değişmedi.
- Panelin observer inbox/outbox API çağrıları yeniden yazılmadı.
- `panel.css` yalnız mevcut `<style>` gövdesinin dışarı alınmış halidir;
  CSS token ve selector isimleri değiştirilmedi.

## Kabul kapısı

- [x] Style tag sayısı: 0.
- [x] Inline script sayısı: 0.
- [x] Panel script sayısı: 7; sıra korunuyor.
- [x] `node --check panel.js`.
- [x] `node test_faz11_panel.js`: 50/50.
- [x] Shell/link/cache-bust kontrolü.
- [x] `git diff --check`.
- [x] `app.js`, `sync.js`, storage, `seyma-data` ve kullanıcı verileri
  değişmedi.
- [x] Browser/server, commit/push/merge/deploy yapılmadı.

**L1 sonucu:** `completed`; sonraki runtime fazı `REPO-L002` app.js çekirdek
ayrıştırmasıdır ve ayrıca onay/ledger kapısı olmadan başlamaz.
