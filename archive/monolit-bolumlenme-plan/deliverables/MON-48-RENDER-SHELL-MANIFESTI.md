# MON-48 · Render header, nav ve overlay shell manifesti

**Tarih:** 2026-09-12

**Dal:** `premium-fx-gorsel-yuzey`

**Durum:** ✅ TAMAMLANDI — LOCAL-ONLY

**Öncül:** MON-47 yerel commit `963e719ce73a555359d751aff4da23c0e509890d`

## Karar ve kapsam

MON-48 kapsamındaki dört render girişi `app/core/render.js` içindeki
`SeymaRender` registry'sine taşındı:

- `SeymaRender.appHeaderHTML`
- `SeymaRender.navHTML`
- `SeymaRender.overlayShell`
- `SeymaRender.soulOverlayShell`

`app.js` aynı imza/adlarla ince delegasyon shimi olarak kaldı. Header ve nav
markup üretimi registry'de, overlay shell üretimi ise mevcut
`SeymaLibrary.overlayShell` / `soulOverlayShell` domain sahiplerine named
resolver üzerinden bağlıdır. `modalsHTML()` ve `render()` app.js'te kaldı;
MON-49 kapsamına taşınmadı.

Korunan sınırlar: save semantiği, `App.go`, tüm handler adları/imzaları ve
inline `onclick` sözleşmesi, modal focus/escape/keyboard yolu, backdrop kuralı,
`data`/`migrate()`/DOM sahipliği, CSS, `sync.js`, ağ ve kalıcı veri yüzeyi.

## Yükleme ve cache kanıtı

Yeni core dosyası eklenmedi. `index.html`, driver `FILES`, zikr harness `FILES`
ve state-rebind boot listelerinin sırası değişmedi. Sadece mevcut registry ile
uyumlu cache-bust güncellendi:

- `app/core/render.js?v=20260912d`
- `app.js?v=20260912d`

Registry cold-boot fixture'ı DOM, localStorage, timer, network veya resolver
çağrısı yapmadan yükleme ve eksik/tekrar kayıt fail-closed davranışını doğrular.

## Header/nav/overlay eşdeğerliği

Seeded headless driver çıktısında eski MON-47 HEAD ile güncel kaynak arasında
yalnız shell bileşenleri ayrıştırılarak karşılaştırıldı:

| Yüzey | UTF-8 byte | SHA-256 | HEAD/current |
|---|---:|---|---|
| Bugün header | 2,612 | `b765b5c6bfade97a000eaf400748a48dfcf2b2309baad61c588685eb0e0c2e31` | `cmp=0` |
| Okuma header | 2,612 | aynı | `cmp=0` |
| Bugün nav | 5,690 | `00d6ca7a3679488e7d634a594d24077c3c5ac7f412dd9fd632d2b57e7636314e` | `cmp=0` |
| Okuma nav | 5,690 | aynı | `cmp=0` |
| Okuma overlay shell kuyruğu | 8,799 | `a95e49288316cca462bff6004647312efdccb2fe7feaf107c6e96ed3f3c2e5c3` | `cmp=0` |

Tam dump byte uzunlukları Bugün `112,402`, Okuma `121,201` idi. Ham tam dump
`cmp` sonucu, uygulamadaki mevcut rastgele “Günün havası” puanının tek karakter
değişmesi nedeniyle `1` oldu; shell bileşenlerinin ayrıştırılmış karşılaştırması
tamamen `cmp=0` verdi. Bu nondeterministik fark MON-48 değişikliğine ait
değildir ve shell hash'lerine dahil değildir.

Header save state, tema düğmesi ve sky scene; nav landmark/labels, aktif
`aria-current`, unread/Saygı rozetleri; overlay dialog, breadcrumb, focus ve
escape girişleri mevcut markup ve handler sözleşmesiyle aynıdır. Nav item
yüksekliği mevcut `53px` kuralıyla `44px` erişilebilirlik eşiğinin üzerindedir;
focus-visible ve reduced-motion kuralları korunmuştur.

## Kapılar

- `node --check app.js`, `sync.js`, `app/core/render.js`: PASS
- data-safe headless `driver.mjs`: PASS (onboarding, seeded render, header save,
  theme, reminder/deeplink akışları)
- `tests/app/test_render_shell_boundary.js`: **19/19 PASS**
- `tests/app/test_modal_focus_containment.js`: PASS
- `tests/app/test_premium_reduced_motion.js`: **34/34 PASS**
- tam app-core, panel/Panel-v2, Quran/reminder ve Apple design fixture aileleri:
  **exit 0**
- `git diff --check`: PASS

MON-48 için yeni sınır fixture'ı registry üyelerini, canlı state dependency
bag'ini, header/nav ARIA ve keyboard semantiğini, overlay focus marker'larını,
app.js shim tekilliğini ve cache-bust sözleşmesini ağsız sentetik VM'de denetler.

## Anti-amnesia ve serbest bırakma sınırı

`MON-STATE.json` gerçeği `lastCompletedPrompt=MON-48`,
`nextPrompt=MON-49`, `completedPrompts=48`, Dalga 9 `5/6` olarak güncellendi;
`activePrompt=null`, `blockedPrompt=null`, `releaseApproval=not_approved` kaldı.
`CURRENT-STATE.md` ve append-only `LEDGER.md` aynı kapanış kanıtını taşır.

Bu kart tek yerel commit ile kapatıldı. Browser/device acceptance, native
permission, remote yazma, push/merge/tag/deploy ve `mustafaras/seyma-data`
yazımı yapılmadı. MON-49 için yeni açık kullanıcı yönü gerekir; bu manifest
MON-49 yetkisi vermez.
