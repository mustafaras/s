# AEON · Fallback Protocol (uygulama kilidi)

Şeyma uygulamasının **giriş kapısı**. Kilit açıkken (varsayılan) `index.html`'e gelen
her istek bu sayfaya yönlenir ve `app.js` **hiç çalışmaz**. Amaç: uygulama
kullanılamasın, ama geçmiş veriler ve mevcut durum hiç etkilenmesin.

## Ne yapar / ne yapmaz

| | |
|---|---|
| `seyma-reset-v1` (uygulama verisi) | **okunmaz, yazılmaz** |
| `mustafaras/seyma-data` | **hiç dokunulmaz** (ağ isteği yok) |
| `sync.js` / `SeySync.schedule()` / `save()` | **hiç çalışmaz** (yönlendirme `<body>`'den önce) |
| Panel (`panel.html`, `panel-v2.html`), `v3-tanitim/` | kilit **kapsamı dışında** |
| Kilit durumu | ayrı ad alanı: `localStorage['seyma-aeon-lock-v1']` |

Kilit anahtarı uygulamanın `seyma-reset-v1` anahtarından ayrı olduğu için
uygulama içindeki **"Verileri sıfırla" kilidi açmaz**; kilit sıfırlamak da veriye
dokunmaz.

## Bu sayfa çıkmaz sokaktır (bilerek)

Sayfada **hiçbir etkileşim yoktur**: düğme, bağlantı, odaklanabilir öğe, dokunma
sayacı, klavye kısayolu veya gizli jest bulunmaz. `fallback.js` depoya hiçbir şey
yazmaz — `localStorage` üzerinde tek bir çağrısı bile yoktur. Sayfa yalnızca saat,
çözülme animasyonu, canvas alanı ve durum satırlarını çizer.

Bu bir eksiklik değil, sözleşmedir: **buradan uygulamaya geçiş yolu yoktur.**
Doğrulaması: sayfada `button, a[href], input, select, textarea, [tabindex],
[contenteditable]` seçicilerinin toplamı **0**; 7 dokunuş + `AEON` yazımı +
`Escape` denendiğinde adres değişmez ve depo boş kalır.

## Açma (uygulamaya dönüş)

Tek yol var — o da bu sayfada değil, **uygulama girişinde**:

1. `https://mustafaras.github.io/s/?aeon=active` — `index.html`'in `<head>`'indeki
   kapı anahtarı `active` yazar, doğrular ve uygulama yoluna döner. Bu sayfa hiç
   yüklenmez.
2. Alternatif: `index.html` içindeki kapı `<script>`'i kaldırılır (kaynak düzeyinde).

## Yeniden kilitleme

`https://mustafaras.github.io/s/?aeon=lock` — anahtarı `locked` yazar ve bu sayfaya
yönlendirir. Kilit kalıcıdır (tarayıcı deposu silinene kadar).

## Depo engelliyse (fail-open)

- Depo tamamen kapalıysa (SecurityError) `index.html`'deki kapı sessizce düşer ve
  uygulama açılır — kilit döngüsü/kilitlenme olmaz.
- Depo salt-okunursa (gizli sekme) sayfa açılır; sayfa zaten yazmadığı için fark
  etmez, sahip `?aeon=active` ile çıkar.

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
