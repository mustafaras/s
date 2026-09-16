# MON-49 · Render modals ve çekirdek manifesti

**Tarih:** 2026-09-12

**Dal:** `premium-fx-gorsel-yuzey`

**Durum:** ✅ TAMAMLANDI — LOCAL-ONLY

**Öncül:** MON-48 yerel commit `2810b7ea84605eb07c50b262e3ed8f7d707491c7`

## Karar ve sahiplik

MON-49 kapsamındaki son iki render girişi `app/core/render.js` içindeki
`SeymaRender` registry'sine alındı:

- `SeymaRender.modalsHTML`
- `SeymaRender.render`

`app.js` aynı ad ve imzaları koruyan ince shimleri tutar. `modalsHTML` tüm
modal/overlay üretim sırasını registry'de korur; modal domain gövdeleri ve
focus/escape sahipliği mevcut domain/App sınırlarında kalır. `render`, canlı
state resolverları ve `renderState` accessor bag'i üzerinden tek gövde olarak
çalışır. `renderState` yalnızca mevcut app.js closure değişkenlerine canlı
getter/setter verir; yazıcılar app.js'te kalır.

Korunan sınırlar: `data`/`migrate()`/save semantiği, `App.go`, App boot ve
timer/handler adları-imzaları, inline `onclick`, modal contract ve backdrop,
`app/core/timeTheme.js` API'si, CSS, `sync.js`, network ve kalıcı veri yüzeyi.

## Çağrı grafiği ve guarded theme kanıtı

Registry gövdesindeki sıra canlı kaynakta ve sentetik boundary fixture'ında
sabitlendi:

1. `root[data-theme]` güncellenir.
2. `paintAmbientShell()` çağrılır; bu çağrı `SeyTimeTheme.apply()` guard'ı,
   `SeyAmbience.apply()` ve `SeyTimeTheme.applySeasonal()` guard'larını aynı
   biçimde ve aynı sırada korur.
3. Auth, konum ve profil kapıları erken `app.innerHTML` dönüşleriyle korunur.
4. Normal akışta tab içeriği üretilir, sonra `navHTML()`, sonra
   `modalsHTML()`, ardından tek `app.innerHTML=html` yazımı yapılır.
5. Overlay lifecycle, scroll/focus geri dönüşü, `renderState` güncellemesi,
   speech voice doldurma ve post-DOM FX/sky/theme-color adımları aynı sırada
   yürür.

Render ve modal gövdeleri MON-48 HEAD'inden, yalnız registry resolver
bağlantıları ve canlı accessor isimleri normalize edilerek byte-eşdeğer çıktı
verdi:

| Gövde | HEAD byte | Registry byte | Normalize SHA-256 | Sonuç |
|---|---:|---:|---|---|
| `render` | 13,467 | 13,467 | `df2bf556038447205f5398d7abec111cc84a20c87afd38b0e2b0e49f5ff83919` | `cmp=0` |
| `modalsHTML` | 14,289 | 14,289 | `7764f24926ca20276bde2d1ad6423487471ad43a62af2668031accf1ad8a95fb` | `cmp=0` |

Kaynakta `app.js` ve `app/core/render.js` içinde her biri için tek function
tanımı vardır; app.js tanımları yalnız signature-preserving shimdir. MON-49
boundary fixture'ı eksik/tekrar registry kaydını fail-closed, cold load'u
side-effect'siz, modal dialog yüzeyini ve gerçek sentetik `render()` DOM
akışını doğrular.

## Yükleme ve cache kanıtı

Yeni core dosyası eklenmedi; bu nedenle `index.html`, driver, zikr harness ve
state-rebind `FILES` sıraları değişmedi. Registry gövdesi için mevcut
scriptlerin cache-bust değeri tek kez `20260912e` oldu:

- `app/core/render.js?v=20260912e`
- `app.js?v=20260912e`

`tests/app/test_premium_voice.js` taşınan `onvoiceschanged` bloğunu yeni
canonical render kaynağından okur; davranış veya premium voice API'si
değiştirilmedi. `zikr-harness` de taşınan Saygı modal üretim satırını
`render.js`ten okur.

## DOM dump ve parity kanıtı

Seeded data-safe driver ile MON-48 HEAD ve güncel çalışma ağacının aynı
`bugun`/`reading` dump'ları alındı. Tam dump'larda yalnız uygulamanın mevcut
rastgele “Günün havası” puanı değişebildiği için ham SHA'lar ayrıdır; tek
`>N/100</span>` tokenı normalize edildiğinde her yüzey byte-eşittir:

| Dump | HEAD byte / SHA-256 | Güncel byte / SHA-256 | Normalize SHA-256 | Sonuç |
|---|---:|---:|---|---|
| `bugun` | 112,404 / `8df81de16a502aaa57fedf32d3649daafca0b3e6391612bf2c00b23f8369c724` | 112,404 / `b45a29f6e1a773add87a0aab1159b30f3d6680e22397d381724245952c17b39c` | `29f30d80cb7add97df6ffd7391f23feaa9aad4a4887d4cd5fb211e6c8f0f9f7c` | `cmp=0` |
| `reading` | 121,203 / `d72c7245b04dbf5e532b89a5eb10f5a25ed018aa9b047b6a370efe44f5c579f9` | 121,203 / `bfba0cbdcc09a5a52e1b69341c18f595ff78c33ffd31103c07bf25ea876b5508` | `b10becf371153d6d7e309d589e782679f8f077f9ee8e8e2de4676b7fe5326972` | `cmp=0` |

Driver içinde onboarding, konum hard gate, seeded render, tema, save state,
reminder center ve deep-link akışları PASS oldu. Root update, app innerHTML,
overlay lifecycle ve guarded theme call için bağımsız registry fixture'ı da
PASS oldu.

## Kapılar

- `node --check app.js`, `app/core/render.js`, `sync.js`: PASS
- `tests/app/test_render_core_boundary.js`: **16/16 PASS**
- `tests/app/test_render_shell_boundary.js`: **19/19 PASS**
- `tests/app/test_modal_focus_containment.js`: PASS
- `tests/app/test_premium_time_theme.js`: **53/53 PASS**
- `tests/app/test_premium_reduced_motion.js`: **34/34 PASS**
- data-safe `driver.mjs`: PASS
- `zikr-harness.mjs`: **95/95 PASS**
- tüm `tests/app/` ailesi: **47 fixture, exit 0**
- current panel: **50 assertion, exit 0**; Panel-v2: **27 fixture, exit 0**
- Quran: **9 fixture, exit 0**; reminder freeze + smoke: **21/21 curated fixture, exit 0**
- `git diff --check`: PASS

## Anti-amnesia ve serbest bırakma sınırı

`MON-STATE.json` gerçeği `lastCompletedPrompt=MON-49`, `nextPrompt=MON-50`,
`completedPrompts=49`, Dalga 9 `6/6` olarak güncellendi; `activePrompt=null`,
`blockedPrompt=null`, `releaseApproval=not_approved` kaldı. `CURRENT-STATE.md`
ve append-only `LEDGER.md` aynı kapanış kanıtını taşır.

Bu kart tek yerel commit ile kapatıldı. Browser/device acceptance, native
permission, remote yazma, push/merge/tag/deploy ve `mustafaras/seyma-data`
yazımı yapılmadı. MON-50 için yeni açık kullanıcı yönü gerekir; bu manifest
MON-50 yetkisi vermez.
