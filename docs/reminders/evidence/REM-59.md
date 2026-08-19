# REM-59 — Panel partial fetch, stale ve fail-closed

## Receipt

- **Program:** APP-REMINDER-UX
- **Prompt:** REM-59
- **Tarih:** 2026-08-19
- **Commit:** `2fb1068`
- **Repo:** `/Users/m_ras/Desktop/seyma`
- **Başlangıç HEAD:** `6261f63` (REM-58 kapanış makbuzu)
- **Bitiş HEAD:** `2fb1068`
- **Release approval:** `NOT_APPROVED`
- **Approval evidence:** `none` (standing `after_each_prompt` teslimatı ayrı kayıttır)

## Kapsam

- **Allowlist:** `panel.js` partial state,
  `tests/reminders/test_reminder_panel_partial_state.js` (yeni G13-E gate),
  existing `tests/test_panel_p3_root_modules.js`, `tests/test_panel_p4_provenance.js`,
  `tests/test_panel_staleness_badge.js` (regression)
- **Closure records:** `docs/reminders/evidence/REM-59.md`,
  `docs/reminders/APP-REMINDER-ANTI-AMNESIA-LEDGER.md`,
  `docs/reminders/APP-REMINDER-STATE.json`
- **Protected paths changed:** `no`
- **App runtime dosyası değişikliği:** `no`
- **Panel-v2:** ayrı regression olarak koşuldu, değiştirilmedi

## Görev 1 — İlk load missing / healthy / stale / partial failure / recovered / malformed

Yan kanal (section) fetch hatası kararı tek, saf ve test edilebilir
`applySectionFailureP()` fonksiyonuna taşındı. Bu fonksiyon:

- Önceki **sağlıklı sections** kümesini **korur** (silmez) ve yalnızca hata
  durumunu işaretler (Görev 2).
- İlk yüklemede (henüz hiç section yokken) normal **missing** davranışına düşer.
- `malformed` / `null` sections girdisi boş ilk yük olarak ele alınır (sızıntı
  olmaz).
- **Recovery**: başarılı bir sonraki poll, `load()` içindeki
  `PROJECTION.sectionFetchState={ok:true,lastError:null,failedAt:null}` ile
  hata durumunu temizler (önceki REM-58 döngüsünden gelen mevcut davranış).

## Görev 2 — Yan kanal failure önceki sağlıklı sections'ı korur

Test, `applySectionFailureP(healthySections(), err)` çağrısında dönen
`sections`'ın girdiyle birebir aynı olduğunu doğrular (`deepEqual`) ve
`sectionFetchState.ok=false` olarak işaretlenir. Başarısız alan "success" gibi
görünmez: `sectionFetchState.ok=false` iken `emptyStateReasonP('missing')`
`pending`/`error` metni üretir, asla `Hazır`/`başarılı` iddiası kullanmaz.

## Görev 3 — Reminder system status: unavailable / stale / error / pending / ok

REM-59 için yeni `reminderSystemStatusP()` saf fonksiyonu eklendi. Bu fonksiyon
reminder system status'unu BEŞ ayrık durumla raporlar:

| Durum | `code` | `kind` | Metin |
|---|---|---|---|
| ok (sağlıklı, reason `ready` / source `projection`) | `ok` | `ok` | "Projeksiyon hazır ve güncel." |
| pending (receipt_missing) | `pending` | `pending` | "Senkron bekleniyor · veri gelmiş olabilir" |
| stale (projection_stale) | `stale` | `warning` | "Kaynak veya projeksiyon eski · görünüm güncelmiş gibi sunulmuyor" |
| error (projection_invalid / parse_failed) | `error` | `error` | "Projeksiyon bozuk · önceki güvenli görünüm korunuyor" |
| unavailable (fetch failed / load_failed / missing / permission / network) | `unavailable` | `error` / `muted` | "Kaynak yok · projeksiyon henüz oluşmadı" |

Beş kod (`ok` / `stale` / `error` / `pending` / `unavailable`) deterministik ve
ayrıktır; tek yeşil rozetle maskeleme yok. `emptyStateReasonP` üç `kind`
kümesiyle (`unused`/`pending`/`error`) modül seviyesinde aynı dürüstlüğü
sağlar. `stale` veri `missing`'e veya `ok`'a karışmaz; `recovered` durumunda
sonraki başarılı poll hata durumunu temizler ve duplicate'siz kalır.

## Görev 4 — fail() draft / token / selected UI state'i silmez

Test, `fail()` fonksiyonunu izole bir VM context'inde çalıştırır ve:

- Yalnızca `#app.innerHTML`'ini değiştirdiğini (hata ekranı) doğrular.
- `UI.msgDraft` / `UI.selectedDate` / `UI.eventFilter` state'ini **mutate
  etmediğini** doğrular (`deepEqual` korunur).
- `fail()` gövdesinde `localStorage.setItem/removeItem`, `PTOKEN=`, `UI.msgDraft=`,
  `UI.selectedDate=` yazma yolu olmadığını doğrular (brace-matching extractor).
- Token state'i SİLİNMEZ / DEĞİŞTİRİLMEZ: test bir token sabitini (ör.
  `github_pat_...`) hiçbir render çıktısına taşımadığını ve `PTOKEN=` mutasyonu
  olmadığını doğrular.

## Görev 5 — Panel status mesajlarında raw network error / token / personal detail yok

- `applySectionFailureP` dönen `sectionFetchState.lastError` **yalnız sabit bir
  KOD'dur** (`network` / `unauthorized` / `forbidden` / `not_found` /
  `rate_limited` / `conflict`) — ham network hatası, token veya kişisel ayrıntı
  asla burada tutulmaz. Bu, önceki davranışın (`String(err.message)`) iyileştirilmiş
  hâlidir.
- `fail()` ve `syncRibbonHTMLP` gövdelerinde token sentinel'leri
  (`ghp_`, `github_pat_`, `Bearer `, `Authorization`) bulunmadığı doğrulanır.
- `fail()` yalnız sabit "Bağlantı bekleniyor" + `esc(msg)` gösterir; `msg` sabit
  kodlarla sınırlanır.

## Doğrulama

```
node tests/reminders/test_reminder_panel_partial_state.js   → PASS (13 case / 123 assertion)
node tests/test_panel_p3_root_modules.js                    → PASS (35 assertion)
node tests/test_panel_p4_provenance.js                      → PASS (28 assertion)
node tests/test_panel_staleness_badge.js                    → PASS (7 assertion)
```

**Regression:** tüm reminder suite PASS, tüm panel root suite PASS, tüm Panel-v2
suite PASS, `node --check panel.js` PASS, `git diff --check` PASS,
`verify-reminder-context.mjs` PASS (73 prompt, 66 link, approval=not_approved).

## Kabul

- Partial failure fail-closed: önceki sağlıklı sections korunur, başarısız alan
  success gibi görünmez.
- Stale data stale görünür; recovery sonrası state temiz ve duplicate'siz.
- Reminder system status unavailable / stale / error / pending / ok ayrımı
  deterministik.
- fail() draft / token / selected UI state'ini silmez.
- Panel status mesajlarında raw network error, token veya personal detail yok.
- PANEL-02 failure gap kapanır; REM-60 ready.

## Notlar / discrepancy

- `applySectionFailureP` yeni bir top-level fonksiyondur; yan kanal section
  hatası kararını `load()` içinden tek, saf, test edilebilir fonksiyona taşır.
- `sectionFetchState.lastError` artık sabit bir hata KODU tutar (önceki
  `String(err.message)` yerine), böylece ham network hatası / token / kişisel
  ayrıntı panel durumuna girmez.
