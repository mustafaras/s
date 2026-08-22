# Reminder bakım fixture'ları

Bu klasör, dondurulmuş `REM-00..REM-72` reminder programının seçilmiş 20
sentetik Node regression fixture'ını içerir. Fixture'lar production runtime'a
yüklenmez; browser, gerçek `localStorage`, gerçek `Notification`, kullanıcı
verisi, token, remote veya ağ bağlantısı kullanmaz.

## Çalıştırma

```bash
node docs/reminders/verify-reminder-freeze.mjs
node tests/reminders/run-reminder-smoke.mjs
```

Runner şu sahiplikleri birlikte korur:

- App boot/migration/acceptance/privacy/native boundary
- Sync privacy ve concurrency
- Current panel source/coverage/redaction/polling/privacy/a11y/performance
- Fixture architecture ve current-panel scope ayrımı
- App → sync → projection → panel lineage, schema/status ve integrated
  privacy/UX

Root panel fixture'ları `tests/panel/test_panel_*.js`, Panel-v2 fixture'ları ise
`tests/panel-v2/` altında ayrıca çalıştırılır. Fixture sayısı tek başına
başarı kanıtı değildir; runner exit code'u ve ilgili fixture çıktısı birlikte
değerlendirilir.

## Sentetik sınır

`helpers/reminder-test-helper.js` sabit/injected saat, bellek içi storage,
native notification mock'u ve ağ erişimini reddeden fetch mock'u sağlar.
`helpers/integrated-privacy-scanner.js` production payload'ı kullanmadan
cross-surface hassas alan kaçışlarını kontrol eder.

Eski prompt-bazlı test envanteri çalışma ağacında tutulmaz; eski bytes gerektiğinde
Git geçmişinden incelenir. Yeni reminder davranışı için önce açık kapsam ve
güncel acceptance koşulu tanımlanmalıdır.
