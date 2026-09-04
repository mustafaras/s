# MON-22 · Kur'an domain envanteri

**Tarih:** 2026-09-04
**Öncül:** MON-21
**Durum:** ✅ tamamlandı · LOCAL-ONLY
**Sınıf:** quran domain
**Kapılar:** S1–S8, I1–I6, M1–M4

## Karar

Kur'an Yolculuğu'nun şema, normalizer, state machine, request kimliği ve
read-only delivery/response uygulama gövdeleri `window.SeymaQuran` altında
toplandı. `app.js` aynı ad/imza ile registry shimlerini, DOM/render/save
akışını ve `App.*` UI handler kabuğunu koruyor.

Outbox yazma ile delivery/response dosyalarının GET/parse transportı bu kartta
yeniden tanımlanmadı. `quranOutboxWriter()` yalnız mevcut `SeySync.pushQuranRequest`
yüzeyini çağrı anında çözer; gerçek outbox transportı, `quranTransportV1.js` ve
`sync.js` sahipliğinde, değişmeden kaldı. Registry içindeki
`quranApplyRemoteUpdates()` transporttan gelen parse edilmiş kayıtları reducer
üzerinden yerel canonical state'e uygular; `save()`, render, fetch ve remote
yazma çağrısı yapmaz.

## Taşınan envanter

| Yüzey | Yeni sahip | Korunan sınır |
|---|---|---|
| Şema/sabitler, request/sûre/video normalizer'ları | `app/core/quran.js:10-71` | requestId biçimi ve sûre trim/lower/catalog doğrulaması |
| Journey/request normalize ve state machine | `app/core/quran.js:73-234` | monotonic rank, geçiş tablosu, duplicate olaylar, video geçmişi |
| Request ID, outbox adapter ve hata label'ı | `app/core/quran.js:236-267` | yalnız explicit `SeySync` yüzeyi; gerçek transport taşınmadı |
| Delivery/response seçim ve read-only apply | `app/core/quran.js:269-322` | delivery receipt → await → response validation sırası; idempotence |
| App shimleri | `app.js:272-312` | canlı registry ve aynı imza/return sözleşmesi |
| UI handler/render/save | `app.js:13913-14817` | `App.quranJourneyRequest`, `App.refreshQuranUpdates`, modal/UI state ve save |
| Vitrin âyet başlangıcı | `app/core/quran.js:247-253` | `quranRandomVerseStart` yalnız ephemeral `ui` başlangıcı |

`quranApplyRemoteUpdates` için kabul edilen akış şöyledir:

```text
queued
  └─ delivery receipt ─> notified ─> awaiting_reply
                                  └─ response received ─> validating_reply
                                                               └─ valid ─> ready
```

Aynı receipt/response tekrarında reducer `changed: false` döndürür. Daha ileri
`watched`/`question_opened` durakları geriye çekilmez; yeni geçerli video
yalnız video geçmişine eklenerek supersede edilir.

## Yükleme, FILES ve cache-bust

Yeni classic script `app/core/quran.js?v=20260904a`, `zikir.js` sonrasında ve
`app.js` öncesinde yüklendi (`index.html:55-75`). Aynı `zikir → quran → mediaFx`
sırası `driver.mjs:227-260` ve `zikr-harness.mjs:134-161` FILES dizilerine
eklendi. quran registry zorunlu olduğu için app.js yükleyen ilgili sentetik
fixture listeleri de aynı sıraya hizalandı; `tests/README.md` envanteri güncel.
`app.js` cache-bust `v=20260904e` olarak artırıldı.

Değişmeyen ve bu kartın dışında kalan yüzeyler:

- `app/content/quranTransportV1.js`
- `sync.js` ve Guard 1/Guard 2
- `data/`, `mustafaras/seyma-data`, workflow, Gmail/App Script
- `panel.html`, `panel.js`, `panel-v2.html` ve panel runtime'ları
- browser/device acceptance, push, merge, tag ve deploy

## Kanıt

Yeni registry fixture'ı [`tests/app/test_quran_boundary.js`](../../tests/app/test_quran_boundary.js)
`20/20` PASS verdi. Load-safe registry, fail-closed resolver, requestId/sûre
normalizer, reducer geçişi, duplicate response, read-only apply ve
200→304→200 tekrarındaki no-op davranışı doğrulandı.

Kur'an ailesi dokuz fixture ve toplam `512` assertion ile exit `0` verdi:

| Fixture | Sonuç |
|---|---:|
| `test_quran_a11y_contrast.js` | 66/66 |
| `test_quran_catalog.js` | 70/70 |
| `test_quran_flow_demo.js` | 9/9 |
| `test_quran_merge.js` | 38/38 |
| `test_quran_outbox_sync.js` | 55/55 |
| `test_quran_panel_parity.js` | 9/9 |
| `test_quran_pull_sync.js` | 17/17 |
| `test_quran_striking_verses.js` | 41/41 |
| `test_quran_transport.js` | 207/207 |

Özellikle pull fixture'ı sıcak ETag cache ile `200 → 304 → 200`, cache'siz
304'ün fail-closed davranışını ve 500/404 sınırlarını; merge/outbox/transport
fixture'ları duplicate requestId, duplicate response ve çoklu-sûre union
kanıtını korudu.

Ek kapılar:

- `node --check app.js`, `sync.js`, `app/core/quran.js`: PASS
- B1/B2/B3 state sınırları: B1 `0 failure`, B2 `60/60`, B3 `20/20`
- `node .claude/skills/run-seyma/driver.mjs`: exit 0
- `node .claude/skills/run-seyma/zikr-harness.mjs`: 95/95
- `node tests/app/test_faz10_sync.js`: 69/69
- modularization/Faz−1.1, state/B1, app, panel, Panel-v2, premium ve
  reminder smoke: exit 0
- `git diff --check`: exit 0

Bu belge deterministic/headless kaynak kanıtıdır; canlı deploy veya gerçek
cihaz kabulü değildir. MON-23 yeni kullanıcı onayı olmadan başlatılmaz.
