# Handoff — ÆON Panel-v2 Premium — Post-close 304 Loading Bugfix

## İş Bilgisi

- Prompt No: Post-close bakım düzeltmesi
- Kısa Adı: Polling 304 Loading Deadlock
- Uygulayan Ajan: OpenAI Codex (GPT-5)
- Tarih: 2026-08-12
- Başlangıç Commit: `8e398cc`
- Uygulama Commit: `97e5214`
- Pages Run: `31572931763`
- Prompt 41 durumu: Başlatılmadı

## Yapılanlar

- [x] `304 Not Modified` sonrası skeleton kilitlenmesi düzeltildi.
- [x] Fetch ve JSON gövdesi için 20 saniyelik timeout/abort eklendi.
- [x] Timeout sonrası geç yanıtın state/DOM'u bozması engellendi.
- [x] Loading statusu `Kontrol ediliyor` olarak düzeltildi.
- [x] Cache-bust `20260812b` yapıldı.
- [x] Headless regresyon testleri genişletildi.
- [x] Commit, push ve GitHub Pages deploy tamamlandı.

### Kök Neden

`load()` başlangıçta `isFetching=true` ile skeleton render ediyordu. `fetchLatest()` 304 aldığında `notModified` dönüyor, fakat `load()` finalizer'ı render'ı atlıyordu. Böylece gerçek içerik ve `aria-busy=false` DOM'a hiç dönemiyordu; üst status da eski `Gönderiliyor` metninde kalıyordu.

### Değiştirilen Dosyalar

- `panel-v2.js` — 304 final render, loading status ayrımı, fetch/JSON timeout ve late-response guard.
- `panel-v2.html` — cache-bust `20260812b`.
- `tests/test_panel_v2_polling_tests.js` — 304 recovery, fetch timeout, JSON timeout ve late-response kontratları.
- `tests/test_panel_v2_hit_areas.js` — CSS cache-bust kontratı.
- `tests/test_panel_v2_performance.js` — CSS/JS cache-bust kontratları.

## Teknik Kararlar

| Karar | Gerekçe |
|-------|---------|
| `load()` başarılı her sonuçta final render yapıyor | 304 akışı skeleton'ı ve `aria-busy` durumunu güvenle kapatmalı |
| Deadline fetch ve `response.json()` zincirini birlikte kapsıyor | Sadece network response timeout'u JSON body stall'ını çözmez |
| Abort sonrası geç yanıtlar yok sayılıyor | Eski istek yeni hata/state sonucunu ezmemeli |
| `loading` statusu `saving`den ayrıldı | Panel read-only GET kontrolünü kullanıcıya yanlışlıkla gönderim gibi göstermemeli |

## Test Sonuçları

```text
node --check panel-v2.js                         → PASS
node --check panelCoverageManifest.js            → PASS
node --check app.js                               → PASS
tests/test_panel_v2_*.js                          → 27/27 PASS
tests/test_panel_p*.js                            → 11/11 PASS
tests/test_*.js                                   → 59/59 PASS
node .claude/skills/run-seyma/driver.mjs          → PASS
node .claude/skills/run-seyma/zikr-harness.mjs    → 90/90 PASS
git diff --check                                  → PASS
```

## Deploy ve Canlı Kanıt

- Branch: `main`
- HEAD/origin: `97e5214` eşit.
- Pages run `31572931763`: validate/deploy SUCCESS.
- Canlı panel: https://mustafaras.github.io/s/panel-v2.html
- Canlı HTML: `panel-v2.css/js?v=20260812b`.
- Canlı CSS SHA256: `e6d72fd36dcf4a5226acfc4c1a6b68d0784837068af23114edad8cab0f8a94fe`.
- Canlı JS SHA256: `96337eabc9852a7316e361b3b1a904ce88409eadd9afeacef08155296aa206be`.
- Gerçek tarayıcı açılmadı; kullanıcı verisi, token ve `mustafaras/seyma-data` okunmadı/yazılmadı.

## Sıradaki Adım

- Prompt 41 başlatılmadı.
- Yeni bakım işi başlamadan önce bu handoff ve güncel `LEDGER.md` okunmalı.
