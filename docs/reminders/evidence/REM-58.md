# REM-58 — Panel transport, ETag / 304 ve draft safety

## Receipt

- **Program:** APP-REMINDER-UX
- **Prompt:** REM-58
- **Tarih:** 2026-08-19
- **Commit:** (REM-58 closure commit)
- **Repo:** `/Users/m_ras/Desktop/seyma`
- **Başlangıç HEAD:** `49e66defe37eb1a54252b9ca7bc50d8fb050b48b`
- **Bitiş HEAD:** (REM-58 closure commit)
- **Release approval:** `NOT_APPROVED`
- **Approval evidence:** `none` (standing `after_each_prompt` teslimatı ayrı kayıttır)

## Kapsam

- **Allowlist:** `panel.js` polling / transport boundary,
  `tests/reminders/test_reminder_panel_polling.js` (yeni G13-D gate),
  `tests/test_panel_p2_polling.js` (polling regression),
  `tests/panel-v2/test_panel_v2_polling_telemetry.js` (polling regression)
- **Closure records:** `docs/reminders/evidence/REM-58.md`,
  `docs/reminders/APP-REMINDER-ANTI-AMNESIA-LEDGER.md`,
  `docs/reminders/APP-REMINDER-STATE.json`
- **Protected paths changed:** `no`
- **App runtime dosyası değişikliği:** `no`
- **Panel-v2:** ayrı regression olarak koşuldu, değiştirilmedi

## Görev 1 — Transport yanıt sınıfları ayrı ve deterministik

`loadTransportFileP` (Contents API) ve `fetchLatest` (latest.json) conditional
GET sözleşmesi dokuz ayrı yanıt sınıfıyla sabitlendi:

| Sınıf | Davranış | Kanıt |
|---|---|---|
| 200 | Gövde döner, ETag cache'e alınır | `test_reminder_panel_polling.js` case 1 |
| 304 (sıcak cache) | `notModified`, gövde yeniden parse edilmez | case 2 |
| 304 (soğuk cache) | `304 cache miss` fail-closed reddeder | case 3 |
| ETag değişti | Taze gövde döner, cache güncellenir | case 4 |
| Boş gövde | `raw:null`, geçerli snapshot sayılmaz | case 5 |
| Bozuk gövde | `loadSyncReceiptP` parse fail-closed → `null` | case 6 |
| Network hatası | Reddeder, önceki cache korunur | case 7 |
| Rate limit (429) | `rateLimited` ayrı sınıf, genel transport hatasına karışmaz | case 8 |
| Genel 5xx | `transport <status>`, rate limit olarak yanlış etiketlenmez | case 9 |

**Kod değişikliği:** `loadTransportFileP` içinde 429 artık genel
`transport <status>` hatasından ayrı sınıflandırılıyor
(`rateLimited=true`, `transport rate_limited`). Bu yalnız hata nedenini
dürüstleştirir; yazma yolu açmaz.

## Görev 2 — Kullanıcı etkileşimi sırasında render erteleme

Yeni `panelInteractionActiveP()` render kapısı eklendi. `applyPollRenderP`
artık yalnız metin girişi değil, gözlemcinin o an etkileşimde olduğu tüm
yüzeylerde render'ı erteler:

- Mesaj draft'ı (`UI.msgDraft`) — case 10
- Textarea / input focus (`panelBusyTyping`) — case 11
- Açık drawer (`D4_DRAWER_RETURN_ID` / `UI.d4SelectedModule`) — case 12
- Aktif filtre (`UI.eventFilter` / `UI.motivationFilter`) — case 13
- Bugün dışı seçili tarih (`UI.selectedDate !== today()`) — case 14
- Açık kart (`UI.expandedCards`) — case 15
- Temiz boş panel → anında render (erteleme yok) — case 16

Önemli ayrım: `panelDraftActiveP` fetch'i tamamen atlar (input skip);
`panelInteractionActiveP` yalnız render'ı erteler — veri yine çekilir,
imleç/odak/scroll bozulmaz. 304 turunda pending render da etkileşim
sürerken ertelenir.

## Görev 3 — Deferred snapshot tek kontrollü uygulanır

- Etkileşim varken gelen yeni snapshot `pendingRender=true` ile kuyruğa alınır
  (case 17).
- Etkileşim temizlendiğinde pending render **tek sefer** uygulanır
  (`renderCount===1`, `pendingRender=false`) (case 18).
- Etkileşim sürerken pending render uygulanmaz (case 19).

## Görev 4 — Değişmeyen reminder status'unda tam render yapılmaz

- Aynı snapshot (`sig===LASTSIG`, `dataChanged=false`) → tam render yapılmaz,
  yalnız poll ribbon güncellenir (case 20).
- Değişen snapshot → render olur, `LASTSIG` / `LAST_RENDERED_POLL_OUTCOME`
  güncellenir (case 21).
- `UI.newChanges` ribbon'ı yalnız gerçek event delta'sından beslenir
  (`hadPreviousSnapshot && changed`), kör render ile artmaz (case 22).

## Görev 5 — Panel polling hiçbir şey yazmaz

- Polling / transport sınırı (`loadTransportFileP`, `fetchLatest`,
  `pollConditionalDecisionP`, `panelDraftActiveP`, `panelInteractionActiveP`,
  `applyPollRenderP`) hiçbir `method:PUT/POST/PATCH/DELETE`,
  `localStorage.setItem/removeItem` veya reminder tercih yazma fonksiyonu
  taşımaz (case 23).
- `applyPollRenderP` yalnız render / ribbon / `pendingRender` durumunu
  değiştirir; veri nesnesine (`D`) veya reminder tercihine dokunmaz.
- `loadTransportFileP` yalnız GET (Contents + Blobs) kullanır (case 24).

## Doğrulama

```
node tests/reminders/test_reminder_panel_polling.js   → PASS (23 case / 82 assertion)
node tests/test_panel_p2_polling.js                   → PASS (15 assertion)
node tests/panel-v2/test_panel_v2_polling_telemetry.js → PASS (27 assertion)
node --check panel.js                                 → PASS
```

**Regression:** tüm reminder panel fixture'ları (coverage, projection,
redaction, source, polling) PASS; tüm panel root fixture'ları (P0, P1, P2
event/sync/polling, P3, P4, P6, staleness, Faz-11) PASS; tüm Panel-v2
fixture'ları PASS; tüm reminder suite PASS; `verify-reminder-context.mjs`
PASS (73 prompt, 66 local link, approval=not_approved); `git diff --check`
PASS.

## Kabul

- ETag / 304 / draft safety / no-mutation PASS.
- Panel yalnız read surface olarak kalıyor; polling hiçbir reminder
  preference / localStorage / app state write yapmıyor.
- PANEL-02 transport gap kapanır; REM-59 ready.

## Notlar / discrepancy

- `tests/test_panel_p2_polling.js` render-gate bölümü, `applyPollRenderP`'nin
  yeni `panelInteractionActiveP` bağımlılığını karşılamak için context'ine
  `panelInteractionActiveP` stub'ı eklendi (allowlist içi polling regression).
- `panelInteractionActiveP` yeni bir top-level fonksiyondur; `panelDraftActiveP`
  metin girişi kapısı (fetch-skip), `panelInteractionActiveP` render kapısı
  (fetch-skip değil) olarak ayrı tutulur.
