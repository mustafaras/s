# Şeyma / ÆON — İş Özeti ve Ajan Başlangıç Haritası

Bu dosya, tamamlanmış işlerin kısa ve session-bağımsız özetidir. Ayrıntılı
promptbook, ham handoff ve eski tasarım planları çalışma ağacında tutulmaz;
gerektiğinde Git geçmişinden incelenir. Güncel durum iddiası için aşağıdaki
canonical state, ledger, source ve test dosyaları yeniden doğrulanır.

## Ürün ve sınırlar

- Şeyma: vanilla JS/HTML/CSS, statik GitHub Pages uygulaması; ana runtime
  `app.js`, senkron sınırı `sync.js` ve kullanıcı state'i tek `data` objesidir.
- ÆON current observer panel: `panel.html`, `panel/panel.js`, `panel/panel.css` ve
  `panel/panelCoverageManifest.js`; Şeyma runtime'ından bağımsız gözlem yüzeyidir.
- ÆON Panel-v2 Premium: `panel-v2.html`, `panel/v2/panel-v2.js`, `panel/v2/panel-v2.css` ve
  `tests/panel-v2/`; current observer panel ile ayrı regression scope'udur.
- `data/`, kullanıcı localStorage'ı, tokenlar, `mustafaras/seyma-data` ve
  kullanıcı cihazı kabulü bu dokümantasyon çalışmasının kapsamı dışındadır.

## Tamamlanan ana iş akışları

### Panel-v2 Premium

- 40/40 sıralı tasarım ve kalite promptu kapanmıştır; Prompt 41 başlatılmamıştır.
- Premium token sistemi, kart/buton/status bileşenleri, skeleton, grafikler,
  trendler, gün detayı, arşiv filtreleri, polling/ETag, event log, senkron
  sağlık, notification lifecycle, responsive/a11y ve performans yüzeyleri
  üretim koduna taşınmıştır.
- Güncel ajan başlangıcı ve kanıt sahibi:
  [`CURRENT-STATE.md`](../archive/PANEL-V2-PREMIUM-TASARIM/.anti-amnesia/CURRENT-STATE.md)
  ardından [`LEDGER.md`](../archive/PANEL-V2-PREMIUM-TASARIM/.anti-amnesia/LEDGER.md).
- Test sahibi: [`tests/panel-v2/README.md`](../tests/panel-v2/README.md).

### Reminder / notification UX

- `REM-00..REM-72` prompt zinciri kapanmış ve dondurulmuştur; makine durumu
  [`APP-REMINDER-STATE.json`](reminders/APP-REMINDER-STATE.json) içinde
  `activePrompt: null`, `lastCompletedPrompt: REM-72` olarak tutulur.
- Güncel ajan girişi [`APP-REMINDER-WORK-SUMMARY.md`](reminders/APP-REMINDER-WORK-SUMMARY.md),
  freeze validator ve 20 testlik bakım smoke runner'ıdır. Eski prompt,
  evidence, ledger ve matrix bytes'ı Git geçmişinde tutulur; çalışma ağacında
  tekrar eden tarihsel kopyalar bulunmaz.
- App runtime (`REM-44..54`), current panel (`REM-55..66`) ve integration
  (`REM-67..72`) ayrı yüzeylerdir; Panel-v2 bu zincire dahil değildir.

## Güvenli doğrulama sözleşmesi

- Uygulama tarayıcıda açılmaz. `run-seyma` headless VM harness'i ve sentetik
  Node fixture'ları kullanılır; gerçek ağ, token ve veri repo write yoktur.
- Kod değişikliği iddiası için source/test, deployment ve kullanıcı cihazı
  kanıtı ayrı raporlanır. Local commit veya test sonucu tek başına canlı kabul
  anlamına gelmez.
- Release approval varsayılanı `not_approved` kalır; bu doküman temizliği
  push, deploy, tag, force-push veya dış sistem yazma yetkisi vermez.

## Yeni ajan için kısa okuma sırası

1. [`AGENTS.md`](../AGENTS.md) ve [`CLAUDE.md`](../CLAUDE.md)
2. [`GELISTIRME-PLANI.md`](GELISTIRME-PLANI.md)
3. İlgili yüzey için run skill, current state/ledger ve test README
4. Reminder işi ise [`docs/reminders/README.md`](reminders/README.md) ve
   [`APP-REMINDER-STATE.json`](reminders/APP-REMINDER-STATE.json)
5. Sonra yalnız allowlist'teki source/test dosyaları ve güncel Git durumu

Bu özet bir canlı release kaydı değildir; tarih, SHA, deploy ve cihaz kabulü
gibi değişken kanıtlar kendi canonical dosyalarından tekrar okunmalıdır.
