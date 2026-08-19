# REM-56 — Panel coverage manifest ve reminder schema classification

## Receipt

- **Program:** APP-REMINDER-UX
- **Prompt:** REM-56
- **Tarih:** 2026-08-19
- **Commit:** `654212d`
- **Repo:** `/Users/m_ras/Desktop/seyma`
- **Başlangıç HEAD:** `4af659b` (REM-55 düzeltme: panel.js cache-bust ve teslim makbuzu)
- **Bitiş HEAD:** `654212d`
- **Release approval:** `NOT_APPROVED`
- **Approval evidence:** `none` (standing `after_each_prompt` teslimatı ayrı kayıttır)

## Kapsam

- **Allowlist:** `panelCoverageManifest.js` (manifest + coverage sınıflandırma),
  `tests/reminders/test_reminder_panel_coverage.js` (yeni G13-B gate),
  `tests/test_panel_p1_projection.js` (mevcut coverage/projection regression sahibi),
  `docs/reminders/evidence/REM-56.md`
- **Closure records:** `docs/reminders/evidence/REM-56.md`,
  `docs/reminders/APP-REMINDER-ANTI-AMNESIA-LEDGER.md`,
  `docs/reminders/APP-REMINDER-STATE.json`
- **Protected paths changed:** `no`
- **App runtime dosyası değişikliği:** `no` (`app.js`, `sync.js`, `index.html`,
  `app/core/*`, `sw.js` diff'te yok)
- **Panel runtime değişikliği:** `no` (`panel.js`, `panel.html`, `panel.css`
  değişmedi — coverage yüzeyi zaten yalnız sayaç render ediyor)
- **Panel-v2:** ayrı regression olarak koşuldu, değiştirilmedi

## Bulunan gerçek kusur — reminder namespace'i fail-OPEN idi

`ruleForPath` eşleşme bulamadığında manifestin son kuralına (`{path:"*"}`,
mode `summary`) düşüyordu. Yorumu bunu bilinçli bir tercih olarak anlatıyordu
("unknown future fields summary-classified instead of silently unclassified"),
fakat sonucu reminder yüzeyi için şuydu:

| Girdi | Eski sınıf | Eski projection sonucu |
|---|---|---|
| `reminderQueueV2` (bilinmeyen kök) | `summary` | **ham obje** `snapshot.data`'ya kopyalanıyordu |
| `remindersV2.prefs.therapyNote` | `summary` | **ham terapi notu** projection'a giriyordu |
| `notifications.*.reminderBody` | `summary` (fullDetail'de kök `full`) | ham gövde |
| `days.*.reminderCompletion.prayerCompletion` | `summary` | ham namaz tamamlama |

Ayrıca **coverage listesi path'in kendisini yayımlıyordu**. Kullanıcı bir
hatırlatmayı kendi kelimeleriyle adlandırdığı için path bir mahrem içeriktir:
sentetik fixture'da `coverage.summary` şu satırı taşıyordu —

```
reminderQueueV2.Anneme ilaç ver.body
```

yani başlığın kendisi `data/observer-snapshot.json` içine ve panel state'ine
düşüyordu. `coverageForData` çıktısındaki `unmappedPaths` alanı ise
**hiçbir zaman doldurulmuyordu** (ölü alan): 2026-08-19 baseline'ında
`unmappedPaths.length===0` her fixture için doğruydu, çünkü hiçbir kod yolu
oraya yazmıyordu.

**Neden bugün sızıntı görünmüyordu:** app'in yazdığı yedi reminder kökü
(`reminders`, `delivery`, `deliveryLog`, `reminderDelivery`,
`reminderDeliveries`, `reminderHistory`, `notificationDelivery`) manifestte
zaten explicit `redacted` idi ve `sync.js` sanitize bunları zaten siliyordu.
Kusur **gelecek yüzeye** açıktı: app'in yeni bir reminder kökü/anahtarı
eklemesi, panel manifestinde hiçbir karar olmadan gözlemci yüzeyini
genişletiyordu. REM-56 Görev 2 tam olarak bunu yasaklıyor.

## Uygulanan sözleşme

1. **Fail-closed namespace.** `reminderSegmentIndex()` bir path'in reminder
   namespace'inde olup olmadığını belirler: herhangi bir segment
   `/reminder|occurrence|quiethours|catchup/`, veya kök segment
   `delivery` / `deliveries` / `deliveryLog` / `notificationDelivery(-ies)`.
   Explicit kuralı olmayan reminder path'i artık `summary` değil `unmapped`
   olur ve `redact()` tarafından **withheld** edilir (`WITHHELD_MODES`).
2. **Allowlist'ten önce gelir.** Kontrol `fullDetail` allowlist'inden ÖNCE
   çalışır; böylece `notifications` gibi full-detail izinli bir kökün içine
   düşen reminder alanı `full` olamaz (Görev 2'nin ikinci yarısı).
3. **Maskeli audit.** `unmappedPaths` artık dolduruluyor, fakat ham path ile
   değil: `maskReminderPath()` yalnız identifier-şekilli segmentleri korur,
   diğerlerini ve reminder segmentinin altındaki her şeyi `*` yapar
   (`reminderQueueV2.Anneme ilaç ver.body` → `reminderQueueV2.*`). Coverage
   özeti böylece ne reminder detayı ne de ham path taşır (Görev 3).
4. **12 alan sınıfı, tek mode.** `MANIFEST.reminderCoverage.fields` preference,
   occurrence, delivery, category, safeAggregate, privateDetail, therapy,
   medication, journal, mood, prayerCompletion ve token sınıflarını gerekçesiyle
   sabitler (Görev 1). `safeAggregate` tek `summary` olan sınıftır: sync
   sınırını geçen tek reminder yüzeyi REM-53'ün sabit lifecycle event özetidir.
   Diğer on bir sınıf `redacted`. Alan veride yoksa etkin mode `missing` olur.
5. **Yeni saf API.** `classifyPath(path,opts)` tek path için tek mode +
   `mapped` / `masked` / `withheld` döner; `reminderCoverageReport(data,opts)`
   deklarasyon ↔ çözümleme paritesini, mode sayaçlarını ve maskeli unmapped
   listesini raporlar. İkisi de saf: ağ, DOM, localStorage, mutation yok.
6. **Aşırı yakalama koruması.** `settings.prayer.remindersEnabled` ve
   `settings.prayer.reminderOffsetMinutes` explicit `summary` kuralı aldı:
   bunlar önceden var olan, senkronlanan namaz vakti tercihleridir ve panelin
   `settingsProjection` yüzeyinde meşru olarak görünür. `locNudge.snoozeUntil`
   ve `days.*.therapy.share.deliveredAt` gibi reminder olmayan yollar da
   sınıflarını korur (fixture bunu ayrıca doğrular).

## Versiyon kararı (Görev 4)

- `schemaVersion` **1 kalır** ve `manifestVersion` **`panel-coverage-v1` kalır**:
  wire sözleşmesi kırılmadı. Değişiklik yalnız (a) yayımlanabilir alan kümesini
  daraltıyor ve (b) zaten deklare edilmiş `unmappedPaths` listesini gerçekten
  dolduruyor. Eski bir projection dosyası hâlâ parse edilir.
- Reminder sınıflandırması kendi sürümünü taşır:
  `MANIFEST.reminderCoverage.contractVersion = "panel-reminder-coverage-v1"`,
  ve `buildObserverSnapshot` bunu additive `reminderCoverageVersion` alanı
  olarak projection'a yazar; `parseObserverSnapshot` alanı **zorunlu tutmaz**
  (geri uyumluluk fixture ile kanıtlandı).
- Bir sonraki **daraltıcı olmayan** (yani gözlemci yüzeyini genişleten) manifest
  değişikliği `panel-coverage-v2` bump'ı ister. Bu karar `APP-REMINDER-DECISIONS.md`
  içine REM-57 kapsamında append edilecektir — decisions log REM-56
  allowlist'inde değildir, bu yüzden karar burada kayıt altına alınır.

## Komut sonuçları

| Katman | Komut | Sonuç | Kısa kanıt |
|---|---|---|---|
| Syntax | `node --check panelCoverageManifest.js` / `panel.js` | PASS | 2/2 |
| Yeni gate | `node tests/reminders/test_reminder_panel_coverage.js` | PASS | 405 assertion / 10 senaryo |
| Panel P1 | `node tests/test_panel_p1_projection.js` | PASS | 43 (35'ten) |
| Panel P6 | `node tests/test_panel_p6_qa_release.js` | PASS | 16 |
| Context | `node docs/reminders/verify-reminder-context.mjs` | PASS | 73 prompt, 66 link |
| Regression | tüm `tests/`, `tests/reminders/`, `tests/panel-v2/` fixture'ları | PASS | 117/117 (116 baseline + 1 yeni) |
| Headless | `run-seyma` driver / zikr / helper / migration / adapter | PASS | 5/5 |
| Diff | `git diff --check` | PASS | temiz |

**Regresyon kanıtı:** fail-closed satırı (`reminderSegmentIndex` dalı)
geçici olarak kaldırıldığında yeni fixture'ın 4. senaryosu FAIL veriyor
(`unknown reminder fields stay unmapped and fail closed`), geri konduğunda
405/405 PASS. Yani gate gerçekten kusuru yakalıyor, davranışı tarif etmiyor.

## Panel-v2 ayrımı (Görev 5)

- Panel-v2'nin **ayrı bir coverage manifesti yoktur**; `panel-v2.js` içindeki
  `root.SeymaPanelCoverage || root.PanelCoverageV1` ifadesindeki
  `SeymaPanelCoverage` repoda hiçbir yerde tanımlı değildir, yani Panel-v2 de
  aynı saf `panelCoverageManifest.js` adapter'ını `{fullDetail:true}` ile
  tüketir. "İki manifest" yoktur; iki tüketici vardır.
- Bu ayrım maskelemeyi zorunlu kılan somut nedendir: current panel coverage'ı
  yalnız **sayaç** olarak render eder (`coverageRibbonHTMLP`), Panel-v2 ise
  `coverage.unmappedPaths.slice(0,3).join(", ")` ile **token'ları kendi audit
  DOM'una basar**. Maskeleme bu yüzden tüketicide değil kaynakta yapılmıştır.
- Panel-v2 runtime'ı ve `tests/panel-v2/` fixture'ları değiştirilmedi; 27
  fixture ayrı regression olarak koşuldu ve PASS.

## Discrepancy kayıtları

1. **Test dosyası adı:** `APP-REMINDER-TEST-MATRIX.md` G13-B satırı fixture'ı
   `test_reminder_panel_manifest.js` olarak adlandırıyor; REM-56 promptunun
   allowlist'i ve doğrulama komutu ise `tests/reminders/test_reminder_panel_coverage.js`
   diyor. Prompt sözleşmesi izlendi (allowlist + verification komutu birebir).
   Test matrisi bu promptun allowlist'inde değildir, bu yüzden düzeltilmedi;
   REM-66 veya matris sahibi promptu G13-B satırını gerçek yola çekmelidir.
2. **Surface map gap register (REM-55'ten devir):** §5 `PANEL-01` satırı prompt
   sütununda REM-55'i saymıyor (§2 sayıyor). `APP-REMINDER-APP-PANEL-SURFACE-MAP.md`
   REM-56 allowlist'inde de değildir; kayıt açık kalıyor ve REM-57 karar
   günlüğüne taşınacaktır.

## Evidence seviyeleri

- Source evidence: S0 / S1 — okunan bölümler: surface map §2/§4, UX planı §13.2,
  `panelCoverageManifest.js` MANIFEST / `coverageForData` / `redactedPaths` /
  `redact`, `app.js` `REMINDER_PRIVACY_SCHEMAS` + `REMINDER_SYNC_BLOCKED_ROOTS`
- Synthetic test evidence: S2 — yukarıdaki tablo
- Commit / remote evidence: S3 — `654212d`
- CI / Pages evidence: S4 — standing `after_each_prompt` teslimatında ayrıca kaydedilir
- User-device evidence: S5 — `N/A` (ajan tarafından yapılmaz)

## Release hard gate

- Push / merge / tag / Pages / external write: standing `after_each_prompt`
  kapsamı closure PASS sonrası ayrı receipt olarak yürütülür
- `mustafaras/seyma-data` write: not performed
- `releaseApproval` `not_approved` olarak korunur

## Standing teslimat makbuzu (S3 / S4)

| Katman | Kanıt |
|---|---|
| Commit | kod `654212d`, kapanış docs `7e624ef`, cache-bust `377f171` |
| Remote | `git push origin main` → `4af659b..377f171`; local HEAD = `origin/main` = `ls-remote refs/heads/main` |
| CI | Pages workflow `32223147836` — completed / success |
| Live HTTP | `index.html`, `panel.html`, `panelCoverageManifest.js?v=20260819a` → 200 |
| Cache-bust | üç yüzey de (`index.html` `2026080402`, `panel.html` `20260816a`, `panel-v2.html` `20260811b`) → `20260819a`; aksi hâlde önbelleğe alınmış tarayıcı fail-OPEN adapter'ı kullanmaya devam ederdi (CLAUDE.md ilke 5) |
| Canlı davranış | indirilen canlı dosya `vm`'de koşturuldu: `classifyPath('reminderQueueV2')` → `unmapped` + `withheld`, `redactForObserver` özel gövdeyi taşımıyor, `REMINDER_COVERAGE` 12 alan / `panel-reminder-coverage-v1`; eski `return ruleForPath(parts).mode||'summary'` satırı canlıda 0 kez |
| `mustafaras/seyma-data` | yazılmadı |

## Sonuç

- **Durum:** done
- **Blocker:** `none`
- **Sonraki prompt:** REM-57
- **Not:** PANEL-01 coverage yarısı kapandı. Reminder alanlarının tek mode'u
  manifestte deklare, bilinmeyen alanlar fail-closed, coverage özeti maskeli.
  Panelde reminder aggregate gösterilip gösterilmeyeceği kararı ve redaction
  taraması REM-57'ye aittir.
