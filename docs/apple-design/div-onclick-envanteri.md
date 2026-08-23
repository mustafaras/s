# AD-18 — `div onclick` erişilebilirlik envanteri

> Bu envanter AD-18 kapsamında, 2026-08-23 tarihinde mevcut kaynak üzerinde çıkarıldı.
> Kaynak kodlarına dokunulmadı; yalnızca AD-19 … AD-23 dönüşümleri için sıralı plan kaydıdır.

## Sayım ve strateji

- `app.js`: 54 adet `<div ... onclick>`
- `panel/panel.js`: 8 adet `<div ... onclick>`
- Toplam: **62**
- `button`: İçinde başka `<button>` yok; ileride `<button type="button" class="… sey-asbtn">` dönüşümü adayı.
- `role`: İçinde başka `<button>` var; iç içe buton geçersiz olduğu için `role="button" tabindex="0"` + Enter/Space `onkeydown` adayı.
- `closeFn` / koşullu callback satırlarında mevcut değişken veya mevcut koşul korunacak; yeni `App` handler eklenmeyecek.

## `app.js` — 54 kayıt

| # | Dosya:satır | Handler | İçinde başka `<button>` var mı | Strateji |
| ---: | --- | --- | :---: | --- |
| 1 | `app.js:6093` | `App.go` | evet | `role` |
| 2 | `app.js:6123` | `App.toggleCard` | hayır | `button` |
| 3 | `app.js:6132` | `App.toggleCard` | hayır | `button` |
| 4 | `app.js:7322` | `App.closeReminderCenter` | evet | `role` |
| 5 | `app.js:10169` | `App.go` | evet | `role` |
| 6 | `app.js:10697` | `App.toggleWeather` | hayır | `button` |
| 7 | `app.js:10759` | `App.toggleVacationCard` | hayır | `button` |
| 8 | `app.js:10903` | `App.openRoom` | hayır | `button` |
| 9 | `app.js:10949` | `App.closeRoom` | evet | `role` |
| 10 | `app.js:10950` | `event.stopPropagation` | evet | `role` |
| 11 | `app.js:11782` | `App.cycleRasit` | hayır | `button` |
| 12 | `app.js:12011` | `App.toggleDailyPhoto` | evet | `role` |
| 13 | `app.js:12306` | `App.openJournalModal` | hayır | `button` |
| 14 | `app.js:12323` | `App.closeJournalModal` | evet | `role` |
| 15 | `app.js:12324` | `event.stopPropagation` | evet | `role` |
| 16 | `app.js:12469` | `App.closeCrisis` | evet | `role` |
| 17 | `app.js:12470` | `event.stopPropagation` | evet | `role` |
| 18 | `app.js:12530` | `App.toggleCrisisDropdown` | hayır | `button` |
| 19 | `app.js:12557` | `App.toggleCrisisDropdown` | hayır | `button` |
| 20 | `app.js:12877` | `App.heatOpen` | hayır | `button` |
| 21 | `app.js:14158` | `App.closeFaithCorner` | hayır | `button` |
| 22 | `app.js:14158` | `event.stopPropagation` | hayır | `button` |
| 23 | `app.js:15799` | `App.closeQibla` | evet | `role` |
| 24 | `app.js:15915` | `App.closeSaygiPerson` | hayır | `button` |
| 25 | `app.js:15915` | `event.stopPropagation` | hayır | `button` |
| 26 | `app.js:16093` | `closeFn` değişken callback'i | hayır | `button` |
| 27 | `app.js:16094` | `event.stopPropagation` | hayır | `button` |
| 28 | `app.js:16104` | `closeFn` değişken callback'i | hayır | `button` |
| 29 | `app.js:16105` | `event.stopPropagation` | hayır | `button` |
| 30 | `app.js:16234` | `App.closeBookEdit` | hayır | `button` |
| 31 | `app.js:16234` | `event.stopPropagation` | hayır | `button` |
| 32 | `app.js:16243` | `App.closeQuoteAdd` | hayır | `button` |
| 33 | `app.js:16243` | `event.stopPropagation` | hayır | `button` |
| 34 | `app.js:16364` | `App.closeTitleEdit` | hayır | `button` |
| 35 | `app.js:16364` | `event.stopPropagation` | hayır | `button` |
| 36 | `app.js:16372` | `App.closeReplicaAdd` | hayır | `button` |
| 37 | `app.js:16372` | `event.stopPropagation` | hayır | `button` |
| 38 | `app.js:16476` | `App.closeTrackEdit` | hayır | `button` |
| 39 | `app.js:16476` | `event.stopPropagation` | hayır | `button` |
| 40 | `app.js:16484` | `App.closeLyricAdd` | hayır | `button` |
| 41 | `app.js:16484` | `event.stopPropagation` | hayır | `button` |
| 42 | `app.js:16682` | `App.closeEmergency` | evet | `role` |
| 43 | `app.js:16683` | `event.stopPropagation` | evet | `role` |
| 44 | `app.js:16687` | `App.closeDetail` | evet | `role` |
| 45 | `app.js:16688` | `event.stopPropagation` | evet | `role` |
| 46 | `app.js:16706` | `App.cancelLocationConsent` | evet | `role` |
| 47 | `app.js:16707` | `event.stopPropagation` | evet | `role` |
| 48 | `app.js:16716` | `App.locNudgeDismiss` | evet | `role` |
| 49 | `app.js:16717` | `event.stopPropagation` | evet | `role` |
| 50 | `app.js:16734` | `App.cancelReset` | evet | `role` |
| 51 | `app.js:16735` | `event.stopPropagation` | evet | `role` |
| 52 | `app.js:18248` | `App.aeonOpenImage` | hayır | `button` |
| 53 | `app.js:18295` | `App.aeonCloseAttachSheet` | evet | `role` |
| 54 | `app.js:18296` | `event.stopPropagation` | evet | `role` |

## `panel/panel.js` — 8 kayıt

| # | Dosya:satır | Handler | İçinde başka `<button>` var mı | Strateji |
| ---: | --- | --- | :---: | --- |
| 55 | `panel/panel.js:468` | `pickDay` | hayır | `button` |
| 56 | `panel/panel.js:2162` | koşullu `closeD4ModuleDrawerP` | evet | `role` |
| 57 | `panel/panel.js:2835` | `aeonOpenImageP` | hayır | `button` |
| 58 | `panel/panel.js:3039` | `devLogoTapP` | hayır | `button` |
| 59 | `panel/panel.js:4023` | `aeonOpenImageP` | hayır | `button` |
| 60 | `panel/panel.js:4233` | `toggleSoulArchiveP` | evet | `role` |
| 61 | `panel/panel.js:4893` | `pickDay` | hayır | `button` |
| 62 | `panel/panel.js:4899` | `pickDay` | hayır | `button` |

## AD-19 … AD-23 için sabit kurallar

1. Her parti yalnız bu envanterdeki satırlardan oluşur; yeni kayıt eklenmez.
2. `button` stratejisinde handler adı, argümanları ve görünen HTML metni karakteri karakterine korunur.
3. `role` stratejisinde iç butonlar korunur; dış kabuk yalnız `role="button" tabindex="0"` ve Enter/Space klavye köprüsü alır.
4. `event.stopPropagation`, `closeFn` ve koşullu drawer callback'i yeni `App` handler değildir; olduğu gibi korunur.
5. Her dönüşüm partisinde S5 handler/call dağılımı birebir karşılaştırılır; iç içe buton, form kontrolü veya `contenteditable` görülürse satır `ERTELENDI` olarak işaretlenir.
