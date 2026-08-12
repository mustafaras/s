# Handoff — ÆON Panel-v2 Premium — Post-close Polling Loading Fix

## İş Bilgisi

- Prompt No: Post-close bakım düzeltmesi
- Kısa Adı: Polling 304 Deadlock + Background Refresh UX
- Uygulayan Ajan: OpenAI Codex (GPT-5)
- Tarih: 2026-08-12
- Başlangıç Commit: `8e398cc`
- Uygulama Commitleri: `97e5214`, `9287adf`
- Metadata Commit: `7f36ed1` / `35ce33a`
- Pages Run: code `31572931763`; final metadata `31573076278`; background UX `31574291704`
- Prompt 41 durumu: Başlatılmadı

## Yapılanlar

- [x] `304 Not Modified` sonrası skeleton kilitlenmesi düzeltildi.
- [x] Fetch ve JSON gövdesi için 20 saniyelik timeout/abort eklendi.
- [x] Timeout sonrası geç yanıtın state/DOM'u bozması engellendi.
- [x] Loading statusu `Kontrol ediliyor` olarak düzeltildi.
- [x] Mevcut snapshot varken background polling skeleton göstermiyor.
- [x] Cache-bust `20260812c` yapıldı.
- [x] Headless regresyon testleri genişletildi.
- [x] Commit, push ve GitHub Pages deploy tamamlandı.

### Kök Neden

`load()` başlangıçta `isFetching=true` ile her polling turunda skeleton render ediyordu. `fetchLatest()` 304 aldığında `notModified` dönüyor, fakat `load()` finalizer'ı render'ı atlıyordu. Böylece gerçek içerik ve `aria-busy=false` DOM'a hiç dönemiyordu; eski bundle'da üst status da `Gönderiliyor` metninde kalıyordu. Artık ilk snapshot yoksa skeleton, mevcut snapshot varsa gerçek panel içeriği korunuyor.

### Değiştirilen Dosyalar

- `panel-v2.js` — 304 final render, loading status ayrımı, fetch/JSON timeout ve late-response guard.
- `panel-v2.html` — cache-bust `20260812c`.
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
| Background refresh mevcut içeriği koruyor | Polling gecikmesi sırasında kullanıcı skeleton'a düşmemeli |

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
- Uygulama commit'i `97e5214`: validate/deploy SUCCESS.
- Önceki metadata commit'leri `7f36ed1` ve `35ce33a`; background UX uygulama commit'i `9287adf` için Pages run `31574291704` SUCCESS.
- Son handoff/ledger metadata commit'i `d608d40`; Pages run `31574558631` SUCCESS; repository temiz ve origin ile eşit.
- Canlı panel: https://mustafaras.github.io/s/panel-v2.html
- Canlı HTML: `panel-v2.css/js?v=20260812c`.
- Canlı CSS SHA256: `e6d72fd36dcf4a5226acfc4c1a6b68d0784837068af23114edad8cab0f8a94fe`.
- Canlı JS SHA256: `a988d713740a3a5f9baddaf51597f29eecadb3e29d54af8d9e1b8fa92055b037`.
- Gerçek tarayıcı açılmadı; kullanıcı verisi, token ve `mustafaras/seyma-data` okunmadı/yazılmadı.
- Kullanıcı cihazında daha önce açık kalan sekme eski JS belleğini tutabilir; sekmeyi kapatıp paneli yeniden açmak veya hard refresh yapmak gerekir.

## Sıradaki Adım

- Prompt 41 başlatılmadı.
- Yeni bakım işi başlamadan önce bu handoff ve güncel `LEDGER.md` okunmalı.
