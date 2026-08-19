# REM-57 — Panel redaction ve reminder no-op kararı

## Receipt

- **Program:** APP-REMINDER-UX
- **Prompt:** REM-57
- **Tarih:** 2026-08-19
- **Commit:** `b507c00`
- **Repo:** `/Users/m_ras/Desktop/seyma`
- **Başlangıç HEAD:** `dce1326` (REM-56 teslim makbuzu)
- **Bitiş HEAD:** `b507c00`
- **Release approval:** `NOT_APPROVED`
- **Approval evidence:** `none` (standing `after_each_prompt` teslimatı ayrı kayıttır)

## Kapsam

- **Allowlist:** `panelCoverageManifest.js` (redaction / adoption),
  `panel.js` projection consumer (**değiştirilmedi** — aşağıya bakınız),
  `docs/reminders/APP-REMINDER-DECISIONS.md` (REM-ADR-021/022/023,
  REM-DISC-011/012), `tests/reminders/test_reminder_panel_redaction.js` (yeni G13-C gate)
- **Closure records:** `docs/reminders/evidence/REM-57.md`,
  `docs/reminders/APP-REMINDER-ANTI-AMNESIA-LEDGER.md`,
  `docs/reminders/APP-REMINDER-STATE.json`
- **Protected paths changed:** `no`
- **App runtime dosyası değişikliği:** `no`
- **Panel runtime değişikliği:** `no` (`panel.js`, `panel.html`, `panel.css`)
- **Panel-v2:** ayrı regression olarak koşuldu, değiştirilmedi

## Görev 1 — Panelde reminder gösterilmeli mi? Hayır (REM-ADR-021)

| Eksen | Gerekçe |
|---|---|
| Feature | Panelin sahip olduğu hiçbir kullanıcı akışı reminder tercihine bağlı değil; gözlemci hatırlatma kurmaz, ertelemez, kapatmaz. |
| Operator | Yedi reminder kökü sync sınırını geçmiyor (REM-53). Panelde hesaplanabilecek her "sağlık" değeri kanıtsız tahmindir; yokluğu `0` / `healthy` diye sunmak yanlış gözlemdir. |
| Privacy | Reminder yüzeyi kullanıcının kendi kelimeleriyle yazdığı başlık, gövde, ilaç adı, terapi notu ve ritüel saatini taşır; ikinci bir kişiye görünmesi için ürün gerekçesi yok (UX planı §13.2). |

**Tek istisna (Görev 3'e cevap):** minimum redacted aggregate **reddedildi**.
Panelin gördüğü tek reminder-türevi yüzey REM-53'ün `safeEventSummary`
sözleşmesidir: `data.eventLog` içindeki sabit
`Bildirim yaşam döngüsü güncellendi` özeti + `reminder-v1:` correlation
prefix'i. Bu mevcut event log'un bir satırıdır; yeni alan, kart veya sayaç
açmaz. `system health`, `enabled category count` ve `safe delivery status`
üçü de ya cihaz-local veriden türetilemiyor ya da türetilse bile kategori
kümesi üzerinden sağlık/iman rutinini ifşa ediyor.

## Bulunan gerçek kusur — projection adoption fail-OPEN idi

`chooseProjection` kabul edilen bir projection için `data`'yı yeniden redakte
ediyordu (`redactForObserver(parsed.value.data)`), fakat:

```js
if(isObject(parsed.value.sections)) Object.keys(parsed.value.sections)
  .forEach(function(k){ parsedSections[k]=parsed.value.sections[k]; });   // AYNEN
return {..., snapshot:parsed.value,                                       // AYNEN
        coverage:parsed.value.coverage||coverageForData(...), ...};       // AYNEN
```

`panel.js` bunu doğrudan tüketiyor: `PROJECTION.sections=PROJECTION.state.sections||{}`,
ve bu sections dashboard kartlarına / drawer'lara render ediliyor.

**Somut senaryo:** `data/observer-snapshot.json` veri deposunda yaşar ve **eski
veya hatalı bir app sürümü** tarafından yazılmış olabilir. Sentetik düşmanca
fixture ile ölçüldü — REM-57 öncesi:

| Sızan | Nereye |
|---|---|
| `sections.reminderHealth.body` / `.medicationName` | panel `PROJECTION.sections` → kart |
| `sections.schedulerHealth.title` (özel hatırlatma başlığı) | aynı |
| `sections.today.record.reminderBody` | aynı |
| `sections.therapyProvenance.reminderNote` / `.occurrenceId` / `.ghToken` | aynı |
| `coverage.summary` içindeki `reminderQueueV2.<özel başlık>.body` | coverage yüzeyi + panel state |
| `snapshot` (dönen ham projection) | `PROJECTION.snapshot` bellekte |

Yani panelin sözleşmesi ("okuduğunu yeniden redakte et") yarısı uygulanmıştı.
REM-26 fixture'ı bunu kaçırmıştı çünkü yalnız **kendi ürettiği** snapshot'ı
test ediyordu; kendi ürettiği snapshot zaten sözleşmeye uygun olduğu için
adoption yolu hiç zorlanmamıştı.

## Uygulanan sözleşme (REM-ADR-022)

1. **Ayna bölümler her zaman yerelden kurulur.** `today`, `therapy`,
   `notifications`, `quran`, `saygi`, `location`, `archives`,
   `roomContentHistory`, `saygiRoot`, `locNudge`, `locationTiming`,
   `lifecycle` zaten redakte edilmiş veriden birebir yeniden üretilebilir;
   uzak değere hiç bakılmaz (kayıp yok, risk yok).
2. **Yalnız beş raw-derived bölüm adopt edilir:** `dailyPhoto`,
   `therapyProvenance`, `profileProgress`, `notificationTimeline`,
   `externalSources` — bunları app ham kaynaktan hesaplar ve panel yeniden
   üretemez (ör. `thoughtCount`, `responseCount`, lifecycle sayaçları).
3. **Adopt edilen değer sanitize edilir:** secret anahtarları, blob/base64
   alanları ve reminder-namespace anahtarları özyinelemeli olarak düşer.
   Manifestte explicit non-withheld kararı olan reminder-adlı alanlar
   (`prayerRemindersEnabled`, `reminderOffsetMinutes`) izinli kalır — izin
   listesi manifestten türetilir, elle tutulmaz.
4. **Bilinmeyen section anahtarı düşer.** Manifestin üretmediği bir bölüm
   (`reminderHealth`, `schedulerHealth`) adopt edilmez. Reminder no-op kararı
   böylece belge değil **yapı** tarafından zorlanır.
5. **Uzak coverage yeniden sınıflandırılır.** Her girdi güncel `classifyPath`
   ile yeniden kovalanır ve reminder girdileri maskelenir; `missing` kendi
   anlamını korur (yalnız maskelenir).
6. **Dönen snapshot sanitize edilir.** Yalnız metadata anahtarları + sanitize
   edilmiş `data` / `sections` / `coverage`; wire'dan gelen bilinmeyen
   top-level anahtar düşer.
7. **Denetlenebilirlik:** `chosen.adoption` = `{adoptedSectionKeys,
   rebuiltSectionKeys, droppedSectionKeys, droppedReminderKeys, droppedFields}`.
   Anahtar adları identifier-şekilli değilse `*` olarak maskelenir.

## Görev 4 — Tüm çıkışların taranması

Sekiz mahrem sınıf (therapy, medication, mood, prayer completion, note, body,
schedule, private title) sentetik sentinel'lerle **17 çıkış yüzeyinde** arandı:
`redactForObserver`, `buildObserverSnapshot`, `parseObserverSnapshot` round-trip,
`chooseProjection` beş dalı (`ready`, `projection_missing`, `projection_invalid`,
`projection_stale`, `receipt_missing`), düşmanca projection adoption,
`coverageForData` (+`fullDetail`), `reminderCoverageReport`, `redactedPaths`,
`parseEventLog`, `mergeEventLogs`, `notificationTimelineProjection`,
`normalizeReceipt`. Hepsi temiz. Aynı taramada aşırı silme de kontrol edildi:
`today.record.mood` / `.note` ve `settings.prayer.remindersEnabled` korunuyor.

Event log yolu ayrıca zorlandı: özel başlık taşıyan düşmanca bir event
`summary` → `Güvenli kayıt özeti`, `path` → `data` olarak indirgeniyor.

## Görev 5 — Mutation ve parity

`redactForObserver`, `buildObserverSnapshot` ve `chooseProjection` çağrıldıktan
sonra kaynak state, receipt ve uzak projection nesnesi deep-equal korunuyor
(`data.reminders...body` ve `projection.sections.reminderHealth.body` hâlâ
yerinde). Aynı girdi iki kez → deep-equal aynı çıktı. Redaksiyon idempotent:
`redactForObserver(redactForObserver(x))` = `redactForObserver(x)`.

## `panel.js` bilinçli no-op

Sanitizasyon saf adapter'a (`panelCoverageManifest.js`) kondu, `panel.js`'e
değil. Üç neden: (a) `panel.js` zaten `chooseProjection`'ın çıktısını tüketiyor,
sınır orada kapanınca panel otomatik olarak güvenli hâle geliyor; (b) aynı
adapter'ı Panel-v2 ve fixture'lar da tüketiyor — panelde düzeltmek adapter'ı
diğer tüketiciler için fail-open bırakırdı; (c) `panel.js` değişikliği
`panel.html` cache-bust'ı gerektirirdi, o dosya REM-57 allowlist'inde değil
(REM-55'te aynı eksiklik ayrı bir düzeltme commit'i gerektirmişti).
Negatif olarak doğrulandı: panel reminder köklerini okumuyor, reminder yazma
yolu yok, `PROJECTION.snapshot.data/sections` hiçbir render yolunda okunmuyor,
coverage yüzeyi yalnız sayaç basıyor.

## Komut sonuçları

| Katman | Komut | Sonuç | Kısa kanıt |
|---|---|---|---|
| Syntax | `node --check panelCoverageManifest.js` / `panel.js` | PASS | 2/2 |
| Yeni gate | `node tests/reminders/test_reminder_panel_redaction.js` | PASS | 317 assertion / 8 senaryo (kapanış sonrası düzeltmeyle 163/6'dan) |
| Panel P4 | `node tests/test_panel_p4_provenance.js` | PASS | 28 |
| Panel P3 | `node tests/test_panel_p3_root_modules.js` | PASS | 35 |
| REM-26 | `node tests/reminders/test_reminder_panel_projection.js` | PASS | 28 |
| Context | `node docs/reminders/verify-reminder-context.mjs` | PASS | 73 prompt, 66 link |
| Regression | tüm `tests/`, `tests/reminders/`, `tests/panel-v2/` | PASS | 118/118 |
| Diff | `git diff --check` | PASS | temiz |

**Regresyon kanıtı:** adoption sanitizasyonu geçici olarak eski verbatim-copy
hâline döndürüldüğünde yeni fixture'ın 3. senaryosu FAIL veriyor
(`an untrusted projection cannot smuggle reminder sections or raw paths`),
geri konduğunda 163/163 PASS.

## Discrepancy kayıtları

- **REM-DISC-011** (karar günlüğü): surface map §5 `PANEL-01` satırı REM-55'i
  saymıyor; test matrisi G13-B fixture adı `test_reminder_panel_manifest.js`
  diyor, prompt `test_reminder_panel_coverage.js` diyor. İki dosya da
  REM-55/56/57 allowlist'lerinde değil; owner REM-66 / matris sahibi.
- **REM-DISC-012** (karar günlüğü, deferred): adopt edilen beş raw-derived
  bölüm, **meşru anahtarlarının içine** konmuş reminder-dışı ham metni hâlâ
  taşıyabilir (ör. `therapyProvenance.thoughts[*].summary`). Bugün gerçek bir
  sızıntı değil (app sabit `Metin redacted` yazar, `days.*.therapy.*` zaten
  redacted); risk yalnız eski/hatalı bir app sürümünün yazdığı projection için.
  Owner: REM-64 (surface map §2 redaction satırı).

## Evidence seviyeleri

- Source evidence: S0 / S1 — surface map §2/§4, UX planı §13.2,
  `panelCoverageManifest.js` `redact` / `redactForObserver` / `chooseProjection`,
  `panel.js` `load()` projection tüketimi, REM-56 çıktısı
- Synthetic test evidence: S2 — yukarıdaki tablo
- Commit / remote evidence: S3 — `b507c00`
- CI / Pages evidence: S4 — standing `after_each_prompt` teslimatında kaydedilir
- User-device evidence: S5 — `N/A`

## Release hard gate

- Push / merge / tag / Pages / external write: standing `after_each_prompt`
  kapsamı closure PASS sonrası ayrı receipt olarak yürütülür
- `mustafaras/seyma-data` write: not performed
- `releaseApproval` `not_approved` olarak korunur

## Kapanış sonrası düzeltme — stale dalı da sanitize edildi (`080132d`)

Kullanıcının "tam ve kusursuz uygulandıklarından emin ol" talebiyle yapılan
denetim, REM-57 sınırında bir **boşluk** buldu ve kapatıldı.

- **Bulgu:** `chooseProjection`'ın `projection_stale` dalı dönen `snapshot`
  alanında uzak projection'ı **hâlâ aynen** veriyordu; sanitizasyon yalnız
  `ready` dalına uygulanmıştı.
- **Fixture neden kaçırmıştı:** ilk REM-57 taraması stale dalını **temiz**
  (kendi ürettiği) bir snapshot ile çalıştırıyordu; düşmanca projection yalnız
  `ready` dalına veriliyordu. REM-54 ve REM-55'teki kaçışlarla aynı sınıf hata:
  fixture yanlış tarafı donduruyordu.
- **Dürüst etki:** DOM sızıntısı **yoktu** — `panel.js` `PROJECTION.snapshot`'ı
  yalnız atıyor, hiçbir render yolunda okumuyor. Fakat receipt'in az önce
  güvenmediği ham payload panel belleğinde ve `panelSig()` serileştirmesinde
  tutuluyordu ve REM-57'nin "dönen snapshot yalnız metadata + sanitize edilmiş
  payload taşır" sözleşmesi altı daldan yalnız biri için doğruydu.
- **Düzeltme:** stale dalı artık yalnız **tanı metadata'sı** döndürür
  (`schemaVersion`, `manifestVersion`, revision, sha, üç zaman damgası);
  `data` / `sections` / `coverage` tamamen düşer. REM-55'in "stale snapshot
  tanı için korunur, veri kaynağı olarak kullanılmaz" sözleşmesi aynen geçerli.
- **Gate genişletildi:** fixture altı `chooseProjection` dalını da düşmanca
  projection ile zorluyor; ayrıca bozuk/beklenmedik şekilli girdilerin
  (null, sayı, metin, dizi, dizi içindeki reminder alanı, bozuk uzak coverage)
  fail-closed kaldığını ve adapter'ın throw etmediğini doğruluyor.
  **163 → 317 assertion, 6 → 8 senaryo.**
- **Regresyon kanıtı:** düzeltme geri alındığında yeni senaryo FAIL, geri
  konduğunda 317/317 PASS.
- **Denetimde ayrıca doğrulandı:** `sync.js:393` observer projection'ı aynı
  `P.buildObserverSnapshot` ile yazıyor, yani REM-56'nın fail-closed
  sınıflandırması **yazma tarafında da** geçerli; Panel-v2'nin audit DOM'una
  bastığı `unmappedPaths` token'ları maskeli ve `escapeHtml`'den geçiyor;
  `tests/README.md` ve `tests/reminders/README.md` per-file envanter değildir,
  bu yüzden yeni fixture'lar için envanter drift'i yoktur.

## Standing teslimat makbuzu (S3 / S4)

| Katman | Kanıt |
|---|---|
| Commit | kod `b507c00`, kapanış docs `ea272aa`, cache-bust `0479c49` |
| Remote | `git push origin main` → `dce1326..0479c49`; local HEAD = `origin/main` = `ls-remote` |
| CI | Pages workflow `32225603625` — completed / success |
| Live HTTP | `index.html`, `panel.html`, `panelCoverageManifest.js?v=20260819b` → 200 |
| Cache-bust | üç yüzey de `20260819a` → `20260819b`; aksi hâlde REM-56 sürümünü önbelleğe almış tarayıcı adoption düzeltmesini almazdı |
| Canlı davranış | indirilen canlı dosya `vm`'de düşmanca projection'a karşı koşturuldu: uydurma `reminderHealth` düşüyor, özel gövde hiçbir çıkışta yok, ham coverage path'i maskeli; eski verbatim adoption satırı canlıda 0 kez |
| `mustafaras/seyma-data` | yazılmadı |
| Düzeltme teslimatı | kod `080132d`, docs+cache-bust `7136a0c`; workflow `32231527004` success; canlı `?v=20260819c`; canlı dosya beş `chooseProjection` dalında düşmanca projection'a karşı sıfır sızıntı, stale snapshot yalnız tanı metadata anahtarları |

## Sonuç

- **Durum:** done
- **Blocker:** `none`
- **Sonraki prompt:** REM-58
- **Not:** PANEL-01 privacy yüzeyi kapandı. Reminder no-op kararı açık gerekçeyle
  kayıtlı ve artık yapısal olarak zorlanıyor; ham/private veri panel projection,
  sections, coverage, snapshot ve DOM yüzeylerinin hiçbirine girmiyor.
