# Şeyma Premium FX Planı — İnceleme Kontrol Listesi

Bu liste, planın uygulanmaya başlamadan önce ve her faz sonrası gözden geçirilmesi gereken maddeleri içerir.

## Genel

- [ ] Plan, Şeyma'nın mevcut mimarisine (tek `data` objesi, `migrate()`, `render()` innerHTML, inline `onclick`) uygun.
- [ ] Tüm efektler `prefers-reduced-motion: reduce` ile pasif hale getirilebiliyor.
- [ ] Kullanıcı `settings.premiumAtmosphere` ile tüm efektleri kapatabiliyor.
- [ ] Yeni veri alanları sadece `settings` altında.
- [ ] `migrate()` spec'i yazıldı ve idempotent.
- [ ] `sync.js` `sanitize()` ile uyumlu (hiçbir efekt state'i repoya gitmiyor).
- [ ] `index.html` cache-bump planı var.

## Kod Kalitesi

- [ ] Fonksiyonlar 50 satırı aşmıyor (uzun fonksiyonlar parçalanmış).
- [ ] Dosyalar 800 satırı aşmıyor (yeni modüller ayrı dosyalarda).
- [ ] Değişken/fonksiyon isimleri `camelCase`, sabitler `UPPER_SNAKE_CASE`.
- [ ] Hiçbir yerde `var` yok; `const`/`let` tercih ediliyor (Şeyma'da mevcut CommonJS/JS stiline uygun).
- [ ] Hata handling var; ses/haptik fonksiyonları try/catch ile sarmalı.

## Güvenlik

- [ ] Web Audio / Speech API sadece kullanıcı etkileşimiyle tetikleniyor.
- [ ] Otomatik oynatma yok.
- [ ] Harici ses dosyası kullanılmıyor (veya base64/data-uri).
- [ ] Hiçbir efekt `localStorage` dışında veri yazmıyor.

## Test

- [ ] `node --check app.js` geçiyor.
- [ ] `node --check app/core/audioFx.js` geçiyor.
- [ ] `run-seyma` headless testleri geçiyor.
- [ ] Yeni premium fixture'ları çalışıyor.
- [ ] Kontrast ve erişilebilirlik fixture'ları geçiyor.

## Dokümantasyon

- [ ] `docs/GELISTIRME-PLANI.md` güncelleme planı var.
- [ ] `AGENTS.md` / `CLAUDE.md` güncellenmesi gerekiyorsa planlandı.
- [ ] Anti-amnesi `CURRENT-STATE.md` ve `LEDGER.md` güncellendi.
