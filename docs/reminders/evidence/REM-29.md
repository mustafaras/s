# REM-29 — Release packet ve kullanıcı cihazı kabul hazırlığı evidence

**Tarih:** 2026-08-16<br>
**Durum:** `ready_for_user_acceptance` — deployed değil<br>
**Kapsam:** Source, synthetic test, local commit, remote/Pages ve user-device
kanıtlarını birbirinden ayıran release packet.

## 1. Source evidence — S0/S1

- **Repository:** `/Users/m_ras/Desktop/seyma`
- **Başlangıç branch/status:** `main...origin/main [ahead 64]`; worktree temiz.
- **Source/test baseline SHA:** `c32150576dbce50f495e5d5ef71990ace6e211c7`
- REM-27 ve REM-28 canonical evidence/ledger satırları `done`; REM-28
  closure gate daha önce `next=REM-29` ile PASS etti.
- REM-29’da üretim source’u (`app.js`, `sync.js`, `sw.js`, `styles.css`,
  `index.html`, panel source’u) değiştirilmedi.

Bu SHA, bu packet hazırlanırken checkout’ta bulunan local source baseline’ıdır;
tek başına deploy veya production davranışı kanıtı değildir.

## 2. Test / migration / privacy / accessibility evidence — S2

REM-28 receipt’inde kayıtlı güncel sentetik kanıtlar:

- `node --check` — `app.js`, `sync.js`, `sw.js`, `hijriCalendar.js`, reminder
  catalog/constants ve panel modules PASS.
- Headless app driver PASS; Zikr harness `90/90` PASS.
- B1 helper `0 failure`; B2 migration `32/32`, second-boot deep parity PASS.
- `tests/reminders/test_*.js`: `33/33` suite PASS.
- `tests/test_*.js`: `92/92` root fixture PASS.
- `tests/panel-v2/test_panel_v2_*.js`: `27/27` fixture PASS.
- Deterministic threshold, midnight, quiet-hours, Europe/Istanbul, DST,
  Hicri offset, stale prayer, offline/online, reopen ve duplicate matrix PASS.
- Notification body, sync sanitize, panel redaction, token absence ve
  data-repo zero-write negative matrix PASS.
- REM-27 accessibility/copy/theme: accessibility `127`, copy/privacy `71`,
  contrast `33` assertion PASS.

Bu kanıtlar synthetic/headless S2’dir. Kullanıcı cihazı, production browser,
background scheduling veya live notification davranışını kesinleştirmez.

## 3. Local commit / allowlist evidence — S3

Beklenen REM-29 değişiklikleri yalnızca:

- `docs/reminders/evidence/REM-29.md`
- `docs/reminders/APP-REMINDER-ANTI-AMNESIA-LEDGER.md`
- `docs/reminders/APP-REMINDER-STATE.json`

REM-29’da test veya üretim source’u değiştirilmemiştir. `data/`,
`mustafaras/seyma-data`, `archive/`, `.github/workflows/` ve secrets protected
alanları değişmemiştir. `git diff --name-only` yalnız bu allowlist’i
göstermelidir; `git diff --check` PASS olmalıdır.

## 4. Remote / Pages / deployment evidence — S4

- `git push`: yapılmadı.
- Branch merge / PR merge / tag / release: yapılmadı.
- GitHub Pages workflow / deploy: tetiklenmedi.
- Live HTTP/cache-bust doğrulaması: yapılmadı.
- Remote equality: doğrulanmadı; `ahead 64` yalnız local tracking-ref
  gözlemidir, canlı remote kanıtı değildir.
- `mustafaras/seyma-data` veya başka external system write: yapılmadı.
- Release approval: `NOT_APPROVED`, scope boş.

Bu nedenle packet release hazırlığıdır; deployed, live veya production-ready
iddiası değildir.

## 5. Kullanıcı cihazı kabul checklist’i — S5 pending

Ajan bu listeyi çalıştırmadı ve kullanıcı cihazı sonucunu kendi adına
tamamlanmış saymıyor. Kullanıcı, hedef sürümü kendi cihazında açıp sonuçları
`PASS/FAIL + kısa not` olarak kaydetmelidir. Secret, token, private data veya
notification body chat’e gönderilmemelidir.

### Temiz profil ve başlangıç

- [ ] Clean/incognito profile veya daha önce `seyma-reset-v1` bulunmayan
  kullanıcı kontrollü profil kullanıldı.
- [ ] Kullanıcı uygulamayı kendisi açtı; ajan browser açmadı.
- [ ] Kullanıcının cihazı, OS sürümü, browser/PWA durumu ve `Europe/Istanbul`
  timezone’u kaydedildi.
- [ ] Önceki localStorage, token ve gerçek data etkisi olmadığı doğrulandı.

### Permission ve güvenli bildirim içeriği

- [ ] İlk boot native permission istemiyor.
- [ ] Kullanıcı açık native eyleminden sonra `grant` sonucu gözlendi.
- [ ] `deny` / unsupported / PWA-limited durumda in-app fallback çalıştı ve
  tekrar tekrar izin istemedi.
- [ ] Lock-screen notification title/body genel kaldı; mood, journal, prayer
  completion/note, therapy detail, medication adı/dozu ve private note yok.

### Deep-link ve lifecycle

- [ ] Bildirim tıklaması yalnız allowlisted hedefe (`faith`, `zikr`, `room`,
  `saygi` veya ilgili güvenli hedef) yönlendirdi.
- [ ] Foreground, background ve uygulama yeniden açılışında aynı occurrence
  ikinci kez gösterilmedi.
- [ ] Kullanıcı, açılış/focus/online/reopen davranışını gözledi; duplicate,
  replay veya yanlış hedef varsa FAIL olarak kaydetti.

### Quiet hours ve zaman

- [ ] Quiet-hours başlangıç ve bitiş sınırı kullanıcı saatinde gözlendi.
- [ ] Quiet saatinde native yerine in-app fallback oluştu; sonradan replay
  olmadı.
- [ ] Exact threshold, midnight ve gerekiyorsa Hicri offset cihaz saatinde
  ayrıca PASS/FAIL olarak kaydedildi.

### Uygulama kapalıyken gerçekçi sınır

- [ ] Kullanıcı, statik GitHub Pages/PWA mimarisinde uygulama kapalıyken
  zamanlanmış background notification garantisi olmadığını kabul etti.
- [ ] Bu davranışın yokluğu otomatik olarak bug veya “kesinlikle fixed” sonucu
  sayılmadı; gerçek cihaz sonucu ayrı S5 kanıtı olarak tutuldu.

### iOS / Android ayrımı

- [ ] iOS: installed PWA, kullanıcı gesture’ı, OS notification permission ve
  lock-screen davranışı ayrı kaydedildi.
- [ ] Android: browser/PWA installation, notification permission/channel ve
  lock-screen davranışı ayrı kaydedildi.
- [ ] OS/browser sürümü, notification setting ve timezone not edildi; cihaz
  farkları source/test PASS ile karıştırılmadı.

### User confirmation

Kullanıcı şu minimum özetle onay vermelidir: `cihaz + OS/browser + PWA durumu +
timezone + permission sonucu + checklist PASS/FAIL + kısa risk notu`. Bu,
release approval değildir; push/merge/deploy için ayrıca exact scope gerekir.

## 6. Pending / blocked / deferred items

| Madde | Durum | Owner | Sonraki güvenli aksiyon |
|---|---|---|---|
| User-device acceptance | `pending`, release-ready değil | Kullanıcı | Clean profile/device checklist’i kendi cihazında çalıştırmak |
| Remote equality / Pages deploy | `blocked`, yetki yok | Kullanıcı + release işlemini yürüten ajan | Exact current approval ve ayrı release promptu olmadan işlem yapmamak |
| App-closed timed notification | `deferred`, mimari sınır | Program sahibi | Background guarantee vaat etmemek; gerekirse ayrı ürün/architecture kararı |
| iOS/Android davranış farkı | `pending`, S5 yok | Kullanıcı | Her OS/browser sonucu ayrı kaydetmek |

Bu maddeler release-ready veya deployed olarak etiketlenmemiştir.

## Sonuç ve kanıt seviyeleri

- **S0/S1:** source baseline, canonical docs, syntax/scope evidence.
- **S2:** REM-27/REM-28 synthetic regression, migration, privacy ve a11y
  receipts.
- **S3:** local packet commit; remote equality değildir.
- **S4:** N/A — push/deploy yapılmadı.
- **S5:** pending — kullanıcı cihazı acceptance’ı ajan tarafından yapılmadı.

- **Durum:** `ready_for_user_acceptance`
- **Blocker:** user-device acceptance ve exact release approval pending
- **Sonraki prompt:** REM-30 planned; user-device sonucu ayrı S5 kanıtı olarak
  beklemede
