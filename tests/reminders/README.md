# Reminder synthetic fixtures

REM-02’nin fixture zemini yalnızca Node ile çalışır. Bu klasör production
runtime’ına yüklenmez; browser, gerçek `localStorage`, gerçek `Notification`,
gerçek kullanıcı verisi, token, remote veya ağ bağlantısı kullanmaz.

## Contract

`helpers/reminder-test-helper.js` aşağıdaki sınırları sabitler:

- Clock her testte sabit bir ISO instant ve `Europe/Istanbul` timezone ile
  enjekte edilir. `advanceMs()` ve `setIso()` dışındaki hiçbir saat kaynağına
  izin verilmez.
- `createMemoryLocalStorage()` yalnızca bellek içindeki bir `Map` kullanır;
  JSON giriş ve çıkışında deep clone uygular.
- `createNotificationMock()` native izin istemez; constructor çağrılarını
  kaydeder ve testin okuyabileceği izole kopya döndürür.
- `createFetchMock()` verilen URL, header ve body’yi okumaz veya kaydetmez;
  her çağrıyı ağ devre dışı hatasıyla reddeder. Rapor yalnızca çağrı sayısı ve
  `realNetworkOpened: false` bilgisini içerir.
- `assert()` ve test runner hata çıktısına assertion label, token veya ham
  payload eklemez; yalnız sabit hata kodları yazılır.

## Saf fonksiyon sınırları

Catalog, policy ve engine testleri `PURE_BOUNDARY_CONTRACT` ile aynı sınırı
paylaşır:

| Sınır | Girdi | Çıktı | Yan etki |
|---|---|---|---|
| Catalog | `ReminderDefinition[]` | `ReminderDefinition[]` | yok |
| Policy | `ReminderPreference + SuppressionContext` | policy decision | yok |
| Engine | `ReminderOccurrence seed + deterministic clock` | `ReminderOccurrence[]` | yok |

`invokePure()` caller state’i clone ederek fonksiyonu izole girdide çalıştırır;
girdi mutasyonunu ve caller state değişimini reddeder. Her saf sınır için
unknown field preservation ve ikinci çağrı parity assertion’ı fixture’larda
zorunludur. Missing required field kontrolleri `getMissingFields()` ve
`assertRequiredFields()` ile yapılır.

## Çalıştırma

```bash
node tests/reminders/test_reminder_contract.js
node tests/reminders/test_reminder_timezones.js
node --check tests/reminders/helpers/reminder-test-helper.js
node --check tests/reminders/test_reminder_contract.js
git diff --check
```

`test_reminder_timezones.js` yalnız REM-02 contract skeleton’ıdır; occurrence,
DST ve scheduler davranışı runtime yazılmadan sonraki ilgili promptlarda
genişletilecektir.
