# MON-59 — Karar belgeleri ve release sınırı konsolidasyonu

**Program:** `MONOLIT-BOLUMLENME`
**Kart:** `MON-59` · **Sınıf:** closing / entegrasyon
**Tarih:** 2026-09-13
**Dal:** `premium-fx-gorsel-yuzey` · **Durum:** ✅ yerel olarak tamamlandı
**Başlangıç commit'i:** `a7cd64c` (`MON-58` docs-sync)
**Kapanış commit'i:** bu kartın tek yerel commit'i
**Sahip:** Codex / Şeyma monolit bölümlenme çalışma zinciri

## 1. Amaç ve kapsam kararı

Bu belge, MON-S1..S7 kararlarını, MON-S8 save addendum'unu, MON-51..54
`SeymaAppSurface` kararlarını, S1–S8 / I1–I6 / M1–M4 sınırlarını ve
yerel release sınırını tek denetlenebilir kayıtta birleştirir. Belge bir
karar konsolidasyonudur; yeni runtime davranışı, yeni registry, fixture
semantiği, production script tag'i, cache-bust, FILES girdisi veya ağ yolu
eklemez.

MON-59 kapsamındaki değişiklikler yalnızca:

- bu konsolidasyon belgesi,
- `MON-STATE.json` içindeki canlı kart zinciri,
- append-only `LEDGER.md`,
- `.anti-amnesia/CURRENT-STATE.md` içindeki bu kart kapanış kaydıdır.

`app.js`, `app/core/*`, `index.html`, `.claude/skills/run-seyma/driver.mjs`,
`.claude/skills/run-seyma/zikr-harness.mjs`, `sync.js`, `tests/`,
`app/content/*`, panel yüzeyleri ve gerçek veri bu kartta değiştirilmemiştir.
Plan README/roadmap üzerinde MON-58'in son dokümantasyon snapshot'ı korunur;
MON-60 kapanış kartı bu üçlü kapanış belgelerini final seri durumu ile
hizalayacaktır.

## 2. Karar indeksi — sahip, tarih, kanıt ve sonuç

| Karar | Seçilen çözüm | Sahiplik | Kanıt | Durum |
|---|---|---|---|---|
| [MON-S1](MON-S1-DELEGASYON-KARARI.md) | Load-safe IIFE registry + app.js imza-koruyan shim | Registry gövdesi ilgili `app/core` owner'ında; canlı resolver, callback ve kabuk app.js'te | MON-S1; [MON-D11 delegasyon envanteri](MON-D11-DELEGE-ENVANTERI.md) | Kabul |
| [MON-S2](MON-S2-FX-HANDLER-MANIFESTI.md) | Premium FX API/call-site manifesti; registry yeniden tanımlaması yok | `SeyAudio`, `SeyHaptics`, `SeyFx`, `SeyTimeTheme` kendi API owner'larında; app.js çağrı kontratını tüketir | MON-S2; FX fixture ailesi; [tam regression](MON-D11-TAM-REGRESSION-RAPORU.md) | Kabul |
| [MON-S3](MON-S3-MODUL-SAHIPLIK-MATRISI.md) | 24 hedef için tek registry owner + 6 korunan yüzey + 18 yeni hedef | Pure/read-only gövdeler registryde; state, DOM, focus, save, network ve boot kabuğu app.js'te | MON-S3; [load-order raporu](MON-D11-LOAD-SIRASI-RAPORU.md); delegasyon envanteri | Kabul |
| [MON-S4](MON-S4-HARNESS-PARITE-KARARI.md) | Production index prefix'i iki VM harness FILES listesiyle birebir parite | `index.html` kanonik sıradır; driver ve zikr assertion ile fail-fast denetler | MON-S4; MON-55 load-order raporu | Kabul |
| [MON-S5](MON-S5-FIXTURE-GECIS-MATRISI.md) | Assertion semantiği yalnız ilgili taşıma kartında geçer; eski ve yeni kanıt ayrı raporlanır | Fixture owner ilgili MON kartıdır; yeni anlam belirsizse halt | MON-S5; MON-57 tam regression raporu | Kabul |
| [MON-S6](MON-S6-STATE-MUTASYON-KARARI.md) | `data` canlı root'u ve dokuz rebind kaynağı app.js'te; B1 yalnız canlı-okur getter | `data/ui/dark`, `migrate`, `getDay`, default root ve import/reset/unlock app.js closure/boot owner'ıdır | MON-S6; B1/B2/B3; state-rebind fixture | Kabul |
| [MON-S7](MON-S7-SYNCGLUE-KARARI.md) | Sync callbackleri app.js global ataması olarak kalır; syncGlue yalnız güvenli resolver yüzeyi sağlar | `SeyOnSyncState` / `SeyOnSynced` app.js; transport ve Guard 1/2 sync.js | MON-S7; Faz10; syncGlue boundary | Kabul |
| [MON-S8](MON-S8-SYNCGLUE-SAVE-KARARI.md) | Save gövdesi syncGlue'da, imza-koruyan shim app.js'te; local persistence → sanitize → schedule sırası korunur | Save resolver bag'i syncGlue; callback, rebind ve schedule sahipliği app.js/sync.js sınırında | MON-S8; `test_syncGlue_save_boundary.js`; Faz10 | Kabul |
| MON-51 | İzinli 46 local UI App handlerı tek `SeymaAppSurface` domain dispatch yüzeyinde | App adları/imzaları app.js'te; domain registry yalnız seçilmiş handler gövdelerini yürütür; GPS/fetch/frozen transport hariç | MON-51 scope + domain boundary | Kabul |
| MON-52 | Overlay/settings/messaging local handlerleri immutable owner registry üzerinden delege | Profile consent, permission, transport, upload, record ve modal engine app-owned | MON-52 overlay boundary; app/panel regression | Kabul |
| MON-53 | Timer, listener ve foreground callback gövdeleri load-safe registryde; kayıt ve teardown app.js'te | Kayıt sırası, timer süreleri, listener türleri, retry ve teardown app-owned | MON-53 lifecycle manifest + 16/16 boundary | Kabul |
| MON-54 | Boot/start/late-boot callback gövdeleri registryde; `window.App=App` ve expose sonrası atamalar app.js'te | App expose sırası, data rebind, sync callbacks, final render ve late guard app-owned | MON-54 boot boundary + onboarding/seeded driver | Kabul |

Bu kararların ortak tarihi, ilgili karar belgesinin tarihidir; MON-59'un
konsolidasyon tarihi 2026-09-13'tür. Her owner, evidence ve kapsam dışı
alanı yukarıdaki kaynak belgede açıkça izlenebilir.

## 3. S1–S8 uygulama zinciri ve canlı yükleme sınırı

Kanonik yükleme grafiği aşağıdaki gibidir:

```text
index.html app/content + app/core (load-safe registryler)
        ↓
app.js IIFE (canlı resolver bag'i, shim, mutation/DOM/focus/boot sahibi)
        ↓
sync.js (transport, Guard 1/2; production'ta son script)
```

S1–S8 kararlarının birleşik kuralları:

1. Registry IIFE yüklenirken DOM, `fetch`, timer, listener, localStorage,
   network veya state snapshotı çalıştırmaz.
2. app.js mevcut fonksiyon adı, parametre sırası, `this`/return/hata yolu,
   App aliası ve inline `onclick="App..."` yüzeyini koruyan shim owner'ıdır.
3. `data`, `ui`, `dark`, `migrate`, `getDay`, `createDefaultData` ve `save`
   B1 canlı getter ile çözülür; tek seferlik snapshot ve yazılabilir state
   adapteri kabul edilmez.
4. `SeyOnSyncState` ve `SeyOnSynced` app.js tarafından doğrudan atanır.
   syncGlue bu isimlere getter-only property veya wrapper kuramaz.
5. Save sırası local persistence'tan sonra sanitized sync payload ve
   `SeySync.schedule` çağrısını korur; sync.js Guard 1/2 sınırı değişmez.
6. Yeni core olursa aynı committe `index.html`, driver FILES, zikr FILES ve
   ilgili state-rebind boot listesi güncellenir; bu kartta yeni core yoktur.
7. `sync.js` production sırasındaki son script olarak kalır; driver/zikr
   FILES'a yüklenmez. No-network VM sınırı bu nedenle korunur.

MON-55 canlı audit'i production prefix'i ve iki harness ön ekini **41 giriş**
(11 content + 29 cache-bust'li core + app.js) olarak doğruladı. MON-59'da bu
liste tekrar yazılmadı; karar yalnız bu canlı gerçeği konsolide eder.

## 4. Reddedilen seçenekler ve yeniden açma koşulları

| Seçenek | Hüküm | Korunan sınır |
|---|---|---|
| One-shot `window.data` / dependency snapshotı | Reddedildi | Reset, import, unlock ve late boot sonrası stale root üretir; B1 canlı getter ve M2 bozulur |
| Registry setter, `setData` veya dış `data=` | Reddedildi | M2/M2prime; dokuz app.js rebindi ve 6079 tarihsel locator'ına karşılık gelen canlı `try/finally` zinciri app.js'te kalır |
| Geniş gizli dependency bag veya global event bus | Reddedildi | Owner, çağrı sırası ve hata sınırı görünmezleşir; S1 dar resolver kararını bozar |
| Callback kayıtlarını registryye taşıma | Reddedildi | MON-53 kayıt/teardown ordering, browser listener türü ve timer sahipliği app.js'te kalır |
| `window.App=App` expose veya post-expose atamalarını taşıma | Reddedildi | MON-54 expose sırası, App handler görünürlüğü, late data guard ve initial render kontratı bozulur |
| Registry içinde FX API yeniden tanımlama/wrapper | Reddedildi | MON-S2/M4; mevcut guarded FX API ve call-site anlamı değişir |
| Bundler/dinamik import/build zinciri | Reddedildi | Build'siz static Pages modeli, index sıra kanıtı ve VM FILES parity bozulur |
| Browser/live-data ile release kabulü | Reddedildi | Yerel headless kaynak/test kanıtı ile device, deploy, remote ve canlı veri kabulü birbirinden ayrıdır |
| Bu kartta otomatik kod temizliği/minification | Reddedildi | MON-59 karar konsolidasyonudur; runtime diff ve geri dönüş yüzeyi gereksiz büyütülmez |

Karar yeniden açılır ancak canlı kaynak bu tabloda belirtilen owner veya
ordering ile çelişirse, duplicate/orphan registry bulunursa, I1–I6 ya da
M1–M4 kapılarından biri kırılırsa veya yeni bir runtime davranışına açıkça
izin veren ayrı bir MON kartı oluşturulursa.

## 5. I1–I6 ve M1–M4 birleşik güvenlik matrisi

| Kapı | Konsolide invariant | Owner / kanıt |
|---|---|---|
| I1 | `data` şekli, migrate normalizasyonu, local persistence ve save semantiği değişmez | app.js + syncGlue/S7–S8; state migration, syncGlue ve Faz10 kanıtı |
| I2 | App handler isimleri/imzaları/aliasları ve inline onclick kontratı değişmez | app.js shim/App owner; MON-51–54; App **556/721/718**, onclick **391** |
| I3 | Eski/normal/future state parity; B1 live getter; `getDay`/default davranışı | `SeymaState` read-only; B1/B2/B3 ve state-rebind |
| I4 | Render call graph, DOM ownership, modal focus/keyboard ve initial render sırası değişmez | app.js render/DOM/focus owner; render shell/core ve MON-54 boot kanıtı |
| I5 | sync.js, Guard 1/2, network boundary ve `mustafaras/seyma-data` yazmama kuralı değişmez | sync.js transport owner; no-network driver, Faz10 ve release checklist |
| I6 | Her kart tek yerel commit; registry load-safe; callback/listener/timer eager side effect üretmez | MON-STATE + LEDGER; driver/zikr no-op VM ve MON-53 boundary |
| M1 | App.js signature-preserving delegate; module load'unda eager DOM/network/state işi yok | S1; MON-D11 delegate/load-order raporları |
| M2 | `var data`, `ui`, `dark` ve dokuz rebind app.js closure'ında kalır | S6; live source and state-rebind evidence |
| M2prime | Import, reset, unlock ve late-boot data assignment handlers app-owned kalır | S6; MON-54 seeded/onboarding proof |
| M3 | `SeyOnSyncState` / `SeyOnSynced` app.js assignable globals; getter-only trap yok | S7/S8; strict-mode boot and Faz10 |
| M4 | Premium FX API, settings guard ve existing call sites semantically identical | S2; FX fixtures and full regression |

### 5.1 Owner özeti

| Yüzey | Tek owner | Taşınmayan sınır |
|---|---|---|
| Pure date/helper/report/domain hesapları | İlgili `Seyma*` registry | Registry yüklemesinde DOM/network/storage yok |
| State read boundary | `SeymaState` canlı getter | Setter/snapshot/external `data=` yok |
| State rebind, migrate girişleri, import/reset/unlock | app.js | `try/finally` geçici rebind zinciri app.js'te |
| Save gövdesi | `SeymaSave` / syncGlue | app.js shim, callback, local persistence sırası ve sync schedule korunur |
| App mutation, DOM, focus, render, boot | app.js kabuğu | `window.App=App`, late guard ve initial render app.js'te |
| Timer/listener registration ve teardown | app.js | callback gövdesi registryde olsa da kayıt sırası/tür/süre değişmez |
| Transport, Guard 1/2 ve network | sync.js / ilgili app-owned adapter | Bu kartta ağ çağrısı veya sync retry davranışı yok |
| FX/theme API | `mediaFx.js` / `timeTheme.js` / `skyFx.js` | API redefinition veya call-site değişikliği yok |

## 6. Canlı baseline ve MON-59 delta'sı

| Ölçüm | MON-59 başlangıcı | MON-59 sonrası |
|---|---:|---:|
| `app.js` satır sayısı | 13.144 | 13.144 |
| `app/core/*.js` | 29 | 29 |
| App function / all / unique | 556 / 721 / 718 | aynı |
| Inline onclick occurrence | 391 | aynı |
| Canonical `data` assignment | 9 / 11 | aynı |
| Production app/appSurface cache-bust | `20260913c` | aynı |
| Core/index/driver/zikr FILES | değişmedi | değişmedi |
| `sync.js` sırası ve Guard 1/2 | değişmedi | değişmedi |
| Runtime behavior | değişmedi | değişmedi |

Bu nedenle MON-59'un kaynak etkisi yalnız yeni Markdown kanıtı ve anti-amnesia
state kaydıdır. Cache-bust etkisi **yok**, FILES etkisi **yok**; yeni `app/core`
tag'i, test fixture'i veya production script satırı eklenmemiştir.

## 7. Yerel kanıt ve test sınırı

MON-57'nin temiz `fc96cfd` sonrası tam regression kanıtı bu konsolidasyonun
runtime evidence kaynağıdır:

- `node --check`: app/core/app/sync kapsamı **31/31 PASS**;
- driver: onboarding, seeded, interaction ve reminder akışları **PASS**;
- zikr harness: **95/95 PASS**;
- app fixture ailesi: **52/52 PASS**;
- premium: **9/9 PASS**;
- panel: **23/23 PASS**;
- Panel-v2: **27/27 PASS**;
- Quran: **9/9 PASS**;
- reminder smoke/freeze: **PASS**;
- boundary: modularization **101/101**, state-rebind **37/37**,
  Faz10 **69/69**, AppSurface boot/lifecycle/daily/overlay kanıtları PASS;
- `git diff --check`: PASS.

MON-59'e özgü kapanış kapıları ayrıca şunlardır:

1. `MON-STATE.json` JSON parse edilir;
2. bu belge ve anti-amnesia belgeleri içindeki relative Markdown linkleri
   canlı dosya/anchor hedeflerine karşı taranır;
3. MON-S1..S8, M1–M4, I1–I6, MON-D11 tam regression ve MON-D12 referansları
   bulunur;
4. final patch `git diff --check` ile temizdir.

Bu sonuçlar kaynak ve başsız sentetik kanıttır. Browser/device acceptance,
native permission, performance benchmark, GitHub Pages/deploy/CI, remote
repository state ve kullanıcı verisi kabulü değildir.

## 8. Release sınırı, rollback ve yeniden açma checklist'i

### 8.1 Bu kartta izinli olan

- Yerel karar belgesi ve anti-amnesia state/ledger güncellemesi.
- Node/VM, JSON, Markdown link ve diff-check doğrulaması.
- Tek, geri alınabilir yerel Git commit.

### 8.2 Bu kartta açıkça yapılmayan

- `git push`, merge, tag, GitHub Pages veya başka deploy;
- browser, gerçek cihaz, native notification/permission kabulü;
- `mustafaras/seyma-data` okuma-yazma akışı veya gerçek token kullanımı;
- network, sync retry, browser listener, timer hızı veya render contract değişikliği;
- release approval, production readiness veya live-data safety iddiası.

`releaseApproval` canlı state'te `not_approved` kalır. Bu kartın yerel PASS
sonucu release onayı vermez.

### 8.3 Rollback

MON-59 yalnız doküman/state değişikliğidir. Geri dönüş gerekirse hedef
belgeler, tarihçe korunarak yeni ve açıkça adlandırılmış yerel bir revert
commit'iyle önceki doğru duruma alınır; destructive `reset --hard` veya geniş
checkout kullanılmaz. Runtime rollback gerektirecek bir değişiklik bu kartta
yoktur. Referans noktaları:

- MON-58 docs-sync: `a7cd64c`;
- MON-57 full regression: `99fccf0`;
- MON-56 owner closure: `fc96cfd`.

### 8.4 Halt / reopen koşulları

| Bulgu | İşlem |
|---|---|
| Karar belgesi canlı source veya test kontratıyla çelişir | MON-59 blocked; bulgu append-only LEDGER'a yazılır |
| Duplicate/orphan owner, farklı callback kayıt sırası veya App expose farkı | İleri karta geçilmez; ilgili owner kararı yeniden açılır |
| JSON/link/diff kapısı başarısız | State gerçeğe göre blocked/in_progress yapılır; eksik kanıt saklanır |
| I1–I6 veya M1–M4 delta'sı | Runtime değişikliği durdurulur; kullanıcı yönü olmadan yeni karta geçilmez |
| Release/deploy/device talebi | Ayrı açık onay ve ilgili release/device gate gerekir |

## 9. Evidence index

- Karar temeli: [monolit-bolumlenme-plan README](../README.md),
  [MON-STATE](../MON-STATE.json), [CURRENT-STATE](../.anti-amnesia/CURRENT-STATE.md),
  [LEDGER](../.anti-amnesia/LEDGER.md).
- S kararları: [MON-S1](MON-S1-DELEGASYON-KARARI.md),
  [MON-S2](MON-S2-FX-HANDLER-MANIFESTI.md), [MON-S3](MON-S3-MODUL-SAHIPLIK-MATRISI.md),
  [MON-S4](MON-S4-HARNESS-PARITE-KARARI.md), [MON-S5](MON-S5-FIXTURE-GECIS-MATRISI.md),
  [MON-S6](MON-S6-STATE-MUTASYON-KARARI.md), [MON-S7](MON-S7-SYNCGLUE-KARARI.md),
  [MON-S8](MON-S8-SYNCGLUE-SAVE-KARARI.md).
- Canlı teknik evidence: [MON-D11 load-order](MON-D11-LOAD-SIRASI-RAPORU.md),
  [MON-D11 delege envanteri](MON-D11-DELEGE-ENVANTERI.md),
  [MON-D11 tam regression](MON-D11-TAM-REGRESSION-RAPORU.md),
  [MON-D12 docs sync](MON-D12-DOKUMAN-SENKRON-CHECKLIST.md).
- Kaynak ve harness authority: [`index.html`](../../index.html),
  [`app.js`](../../app.js), [run-seyma skill](../../.claude/skills/run-seyma/SKILL.md),
  [tests README](../../tests/README.md).

## 10. Kabul kararı

1. Her konsolide kararın owner'ı, tarihi, kanıtı, kapsamı ve rollback/reopen
   sınırı açıkça yazılmıştır.
2. Production index, iki harness FILES zinciri ve `sync.js` son-sıra kararı
   MON-55 canlı audit'iyle bağlıdır; MON-59 bu zinciri değiştirmemiştir.
3. MON-57 tam no-network regression kanıtı ve MON-59 JSON/link/diff kapanış
   kapıları ayrı ayrı çalıştırılacaktır; release/device kabulü iddia edilmez.
4. I1–I6 ve M1–M4 için tek owner, app.js kabuğu ve registry sınırı
   değişmeden korunmuştur.

**Sonuç:** MON-59 yerel karar konsolidasyonu olarak kabul edilmiştir.
`MON-STATE.json` sıradaki güvenli kartı `MON-60` olarak gösterir; MON-60
yalnız yeni açık yön ile başlatılabilir.
