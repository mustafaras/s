# Handoff — ÆON Panel-v2 Premium — Post-close repo organization

## Amaç

40/40 prompt ve final QA sonrasında test, plan ve ajan başlangıç belgelerini
tek canonical yapıda toplamak.

## Yapılanlar

- 27 `test_panel_v2_*.js` fixture’ı `tests/panel-v2/` altına taşındı.
- `tests/panel-v2/helpers/panel-v2-test-helper.js` ortak helper olarak taşındı;
  repository root çözümlemesi yeni klasör derinliğine göre düzeltildi.
- `tests/README.md` ve `tests/panel-v2/README.md` güncel envanter ve komutları
  taşıyor.
- `CURRENT-STATE.md` canonical ajan başlangıç kaydı olarak eklendi.
- `AGENTS.md`, `CLAUDE.md`, `HANDOFF-TEMPLATE.md` ve aktif plan dosyaları güncel
  test yollarına hizalandı; tamamlanmış context kartları arşive taşındı.
- `00-PLAN.md`, `01-GOREV-LISTESI.md` ve `03-BILGI-AKISI-KONTROL-TAKIP.md`
  eski plan durumundan kapanış durumuna geçirildi.
- Tarihsel prompt handoff’ları append-only oldukları için değiştirilmedi;
  `.anti-amnesia/archive/prompt-handoffs/` altına taşındı.

## Arşivleme kararı

- `PANEL-DENETIM-MERKEZI-*` üçlüsü `archive/panel-denetim-merkezi/` altına
  taşındı; eski Denetim Merkezi işi tamamlanmış ve Panel-v2 tarafından artık
  başlangıç kaynağı olarak kullanılmıyor.
- `02-TASARIM-REFERANSI.md` ve `04-40-PROMPT.md`
  `PANEL-V2-PREMIUM-TASARIM/archive/` altına taşındı.
- `AGENT-CONTEXT.md`, `CODEX-STARTER.md`, `TOKEN-BUDGET.md` ve eski
  post-close/prompt handoff’ları `.anti-amnesia/archive/` altında tutuluyor.
- Dosyalar silinmedi; Git geçmişi ve arşiv yolları üzerinden geri alınabilir.

## Değiştirilmeyen sınırlar

- `panel-v2.html/js/css` üretim davranışı değiştirilmedi.
- `panel.html/js/css`, `app.js`, `sync.js`, `index.html`, `data/` ve canlı veri
  deposu değiştirilmedi.
- Gerçek tarayıcı açılmadı; kullanıcı verisi veya secret okunmadı/yazılmadı.
- Commit, push, Pages deploy ve canlı yeniden doğrulama yapılmadı.

## Doğrulama

Bu handoff’un tamamlanmasından sonra çalıştırılacak canonical komutlar:

```bash
for f in tests/panel-v2/test_panel_v2_*.js; do node "$f"; done
node --check panel-v2.js
node --check panelCoverageManifest.js
git diff --check
```

## Sonraki ajan

Yeni bir Panel-v2 bakım isteği yoksa çalışma burada kapalıdır. Yeni istek
gelirse önce `CURRENT-STATE.md`, ardından `LEDGER.md` okunmalı; Prompt 41
başlatılmamalı ve kapsam kullanıcı isteğiyle ayrıca belirlenmelidir.
