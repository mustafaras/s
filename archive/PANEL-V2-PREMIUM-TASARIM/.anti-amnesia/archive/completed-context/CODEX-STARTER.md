# Codex Starter — ÆON Panel-v2 Premium (post-close)

Bu checkout’ta Panel-v2 Premium’un 40 promptluk uygulaması ve final QA kapısı
tamamlanmıştır. Bu starter yeni ajanı eski Prompt 1 döngüsüne geri göndermez;
önce güncel durumu ve güvenli sınırları yükler.

## İlk okuma sırası

1. `AGENTS.md`
2. `CLAUDE.md`
3. `PANEL-V2-PREMIUM-TASARIM/.anti-amnesia/CURRENT-STATE.md`
4. `PANEL-V2-PREMIUM-TASARIM/.anti-amnesia/LEDGER.md`
5. İlgili son handoff veya plan bölümü

Ledger’daki `currentStep: 41` kapanış durumudur; Prompt 41 yoktur. Yeni bir
özellik kullanıcı tarafından açıkça istenmeden başlatılmaz.

## Canonical dosya sınırı

Panel-v2 bakımında normal kapsam:

- `panel-v2.html`, `panel-v2.js`, `panel-v2.css`
- gerektiğinde `panelCoverageManifest.js`
- `tests/panel-v2/test_panel_v2_*.js`
- `tests/panel-v2/helpers/panel-v2-test-helper.js`
- ilgili `.anti-amnesia/` current-state/ledger/handoff dosyaları

`panel.html`, `panel.js`, `panel.css`, `app.js`, `sync.js`, `index.html`,
`data/` ve `mustafaras/seyma-data` açık kapsam izni olmadan değiştirilmez.

## Güvenli çalışma döngüsü

1. `git status --short --branch` ile çalışma ağacını kontrol et.
2. İstenen değişikliğin Panel-v2 sınırında olduğunu doğrula.
3. Önce ilgili headless fixture’ı yaz/güncelle.
4. Gerçek tarayıcı açmadan test et:

   ```bash
   for f in tests/panel-v2/test_panel_v2_*.js; do node "$f"; done
   node --check panel-v2.js
   node --check panelCoverageManifest.js
   git diff --check
   ```

5. Kaynak/test kanıtı, deploy kanıtı ve kullanıcı cihazı kanıtını ayrı raporla.
6. Commit/push/deploy ancak kullanıcı bunu ayrıca istediğinde yapılır.

## Veri güvenliği

- Şeyma uygulamasını veya Panel-v2’yi ajan olarak tarayıcıda açma.
- `mustafaras/seyma-data` reposuna yazma.
- Token, parola, private data veya başka secret isteme/çıkarma.
- Testleri Node/VM fixture’ları ile yürüt; ağ ve localStorage yazımı gereken
  yeni bir test ekleme.

## Tarihsel kayıtlar

`handoff-PROMPT-01.md`–`40.md` o anki yolları taşıyan append-only kayıtlardır.
Güncel test yolu `tests/panel-v2/`, güncel başlangıç noktası ise
`CURRENT-STATE.md`’dir.
