# AEON · Fallback Protocol (uygulama kilidi — koşulsuz)

Şeyma uygulamasının **giriş kapısı**. 2026-11-13'ten itibaren kilit **koşulsuzdur**:
`index.html`'e gelen her istek (her link, her parametre, her cihaz) bu sayfaya
yönlenir ve `app.js` **hiç çalışmaz**. Amaç: uygulamanın hiç kimse tarafından
kullanılamaması; geçmiş veriler ve mevcut durumun hiç etkilenmemesi.

## Ne yapar / ne yapmaz

| | |
|---|---|
| `seyma-reset-v1` (uygulama verisi) | **okunmaz, yazılmaz** |
| `mustafaras/seyma-data` | **hiç dokunulmaz** (ağ isteği yok) |
| `sync.js` / `SeySync.schedule()` / `save()` | **hiç çalışmaz** (yönlendirme `<body>`'den önce) |
| Panel (`panel.html`, `panel-v2.html`), `v3-tanitim/` | kilit **kapsamı dışında** |
| Kilit durumu | **depo yok** — kapı koşulsuz yönlendirir; hiçbir anahtar okunmaz/yazılmaz |

`?aeon=active`, `?aeon=lock` ve `localStorage['seyma-aeon-lock-v1']` 2026-11-13'te
**bilerek kaldırıldı**: artık hiçbir URL parametresi kilidi açmaz veya kapatmaz.

## Bu sayfa çıkmaz sokaktır (bilerek)

Sayfada **hiçbir etkileşim yoktur**: düğme, bağlantı, odaklanabilir öğe, dokunma
sayacı, klavye kısayolu veya gizli jest bulunmaz. `fallback.js` depoya hiçbir şey
yazmaz — `localStorage` üzerinde tek bir çağrısı bile yoktur. Sayfa yalnızca saat,
çözülme animasyonu, canvas alanı ve durum satırlarını çizer.

Bu bir eksiklik değil, sözleşmedir: **buradan uygulamaya geçiş yolu yoktur.**
Doğrulaması: sayfada `button, a[href], input, select, textarea, [tabindex],
[contenteditable]` seçicilerinin toplamı **0**; 7 dokunuş + `AEON` yazımı +
`Escape` denendiğinde adres değişmez ve depo boş kalır.

## Açma (yalnız kaynak değişikliğiyle)

URL parametresi veya depo anahtarı YOKTUR. Sahip uygulamayı yeniden açmak
istediğinde:

1. `index.html`'in `<head>`'indeki `ÆON FALLBACK KİLİDİ` `<script>` bloğunu
   kaldır (veya yorumla),
2. commit + push → Pages yayını.

Bu iki adım atılmadıkça hiçbir link, hiçbir cihaz uygulamaya ulaşamaz.

## Depo engelliyse

Kapı artık hiçbir depoya dokunmaz; tek işi `location.replace`tir. Yönlendirme
bizzat başarısız olursa (alışılmadık tarayıcı) en dış `catch` yutar ve uygulama
açılır — kilitli-döngü olmaz.

## Dosyalar

| Dosya | İş |
|---|---|
| `index.html` | mühür sahnesi; yalnız `fallback.css` + `fallback.js` yükler |
| `fallback.css` | kendi paleti (uygulama tema tokenlarından bağımsız), hareket, `prefers-reduced-motion` |
| `fallback.js` | saat, decode animasyonu, canvas alanı — **etkileşim yok** |

Üç dosya **birlikte** yayınlanmalı: `sw.js` `SW_OFFLINE_MANIFEST` üçünü de
`cache.addAll` ile indirir; biri 404 olursa offline paketi kurulmaz (atomik install).

## Kural

Bu yönlendirmeyi **sahibin açık isteği olmadan kaldırma**. Uygulamanın "açılmıyor"
görünmesi bir hata değil, bu sayfanın işidir. Sayfaya yeniden dokunma/klavye ile
kilit açma yolu **ekleme** — sahip bunu açıkça reddetti.
