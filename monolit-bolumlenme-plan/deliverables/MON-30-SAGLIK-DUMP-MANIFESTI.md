# MON-30 · Sağlık kartı ve sekmesi dump manifesti

**Tarih:** 2026-09-10
**Öncül:** MON-29
**Durum:** ✅ tamamlandı · LOCAL-ONLY
**Kapsam:** SeymaHealth görünüm registry'si ve app.js imza-koruyan shimleri

## Karar ve sahiplik

MON-29'da kurulan window.SeymaHealth registry'si, sağlık hesaplarının
yanına sağlık sekmesi ve kart HTML üreticilerini de aldı. app.js aynı
fonksiyon adlarını ve çağrı imzalarını shim olarak korur. App-owned mutation,
save, DOM/focus, render dispatch ve App.* handler gövdeleri taşınmadı.

Taşınan 35 görünüm üyesi:

ringSeg, macroBarHTML, nutriInsightHTML, beslenmeCardHTML, targetsCardHTML,
waterCard, magnesiumFeedbackHTML, magnesiumBannerHTML, magnesiumCardHTML,
magnesiumHeadline, activityRings, sparkCard, medFreeBadge, gaugeBadge,
caffeineCurveSVG, caffeineBlock, sleepPrepCard, lastWeight, weightRefMs,
weightWeekReady, nextWeightInDays, bodyCard, labCard, discomfortCard,
moodScore, moodColorScore, mentalStats, mentalBalanceCard, healthSleepCard,
healthWalkCard, healthAppleCard, saglikHTML, fmtTR, cycleWheel, cycleHTML.

bodyData, sağlık kayıt/save handlerları, refreshTargets, cycleStats,
recalcLutealHitRate, sync.js, schema ve render çekirdeği app.js'te kaldı.
saglikHTML içindeki varsayılan ui.cards başlatması da app-owned
ensureHealthCardState resolver'ına bırakıldı.

## Canlı kaynak ve load-order

- Registry view bölümü: app/core/health.js:37-1146.
- Dependency bag kaydı: app.js:449-492.
- İlk/son app shim örnekleri: app.js:9497, app.js:11435 ve app.js:11523.
- app.js canlı App assignment yüzeyi: 721 → 721.
- index.html: health.js?v=20260910a, app.js?v=20260910a.
- Health zaten index.html, driver.mjs, zikr-harness.mjs ve
  test_state_rebind_boundary.js FILES zincirindeydi; bu kartta dört listeye
  yeni dosya eklenmedi, sıra korunarak yalnız cache-bust yenilendi.
- Cache-bust etkisi nedeniyle journal load-order fixture'ındaki health
  beklentisi 20260910a ile hizalandı; fixture semantiği değişmedi.

## Önce/sonra saglik dump parity

Baseline ve AFTER aynı seeded headless VM ile üretildi:

| Ölçüm | Önce | Sonra |
|---|---:|---:|
| Dump byte | 65.622 | 65.622 |
| Normalleştirilmiş dump parity | — | PASS |
| Inline style= | 312 | 312 |
| var(-- theme token | 297 | 297 |
| onclick=App. | 60 | 60 |
| data-fx= | 10 | 10 |

Ham SHA-256 farkı yalnız mevcut magnezyum nudge skorunun Math.random()
alanındadır (Skor 79/100 ↔ Skor 80/100); bu alan normalize edildiğinde
dump tam eşittir. Kart sırası ve HTML copy/onClick yüzeyi eşittir:

mental → h-sleep → h-caffeine → h-sleepprep → h-body → h-lab → h-walk →
h-discomfort → h-apple → h-cycle

Health modülünün yükleme taraması document, storage, ağ ve timer çağrısı
bulmadı. Theme tokenları, inline handlerlar, card builder kayıtları ve
erişilebilir bölüm sırası değişmedi.

## Kapı sonucu

- node --check app/core/health.js, app.js, sync.js: PASS.
- node .claude/skills/run-seyma/driver.mjs --dump saglik: PASS.
- test_health_boundary.js: 30/30.
- test_today_card_preferences.js: 11/11.
- test_premium_settings.js: 39/39.
- Tam tests/app, panel, Panel-v2, Quran ve reminder smoke aileleri: PASS.
- Zikirmatik harness: 95/95.
- State migration/helper/adapter: B2 60/60, B1 0 failure, B3 20/20.
- test_state_rebind_boundary.js: 37/37.
- git diff --check: PASS.

Bu belge kaynak ve headless VM kanıtıdır; canlı deploy veya kullanıcı cihazı
kabulü değildir. sync.js/Guard, data, CSS, settings schema, panel,
report/render çekirdeği, remote, push, merge, tag ve deploy dokunulmamıştır.
Sıradaki sıralı kart MON-31'dir ve ayrıca açık kullanıcı yönü gerektirir.
