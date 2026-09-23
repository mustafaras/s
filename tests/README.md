# Headless test fixtures

Bu klasör, repository içindeki sentetik Node testlerini toplar. Testler uygulama
runtime’ına yüklenmez; `repo-root.js` sayesinde root’tan veya `tests/` içinden
çalıştırıldığında aynı kaynak dosyalarını okur.

## Klasörler ve sınırlar

- `panel-v2/` — ÆON Panel-v2 Premium’un 27 headless VM fixture’ı ve ortak
  sandbox yardımcısı. Panel-v2 dosyalarının tek canonical test konumudur.
- `panel/` — legacy Panel 1 / observer fixture’ları (`test_panel_*.js` ve
  `test_faz11_panel.js`).
- `app/` — sync ve büyük dosya davranışı için uygulama fixture’ları.
- `app/test_iip_*.js` — **İlham & İbadet Premium (IIP)** ailesi, 16 fixture.
  Program: [`archive/ilham-ibadet-premium-plan/`](../archive/ilham-ibadet-premium-plan/README.md);
  durum [`IIP-STATE.json`](../archive/ilham-ibadet-premium-plan/IIP-STATE.json);
  denetim tablosu [`evidence/DENETIM-BASELINE.md`](../archive/ilham-ibadet-premium-plan/evidence/DENETIM-BASELINE.md);
  kapatma adımları [`DUZELTME-PROMPTLARI.md`](../archive/ilham-ibadet-premium-plan/DUZELTME-PROMPTLARI.md).
  Kapsam: `test_iip_03` (anlam denetimi, payda bastırma), `04` (hub hiyerarşi),
  `05` (öncü okuyucu görsel sözleşmesi), `06` (ibadet/kıble birlik), `07`
  (zikir–Kur’an geçiş), `09` (bilgi mimarisi), `10` (öncü arama/filtre), `11`
  (okuyucu etkileşimi), `12` (günlük odak + Devam), `13` (vakit tazeliği),
  `14` (tarihsel kayıt sunumu), `15` (ritim doğruluğu), `17` (kaynaklı seçki),
  `20` (yer imi/okuyucu tercihi), `21` (yedi duraklı yolculuk), `22` (offline
  paket).
  **Kural:** `app/core/saygi.js` paylaşılan bir üretim dosyasıdır; bir kart ona
  yazdığında o dosyaya bağlı ÖNCEKİ kartların fixture’larını da yeniden koş.
  IIP-20/21 bunu atladığı için `test_iip_05/06/09/12/13` gate’leri sessizce
  bozuldu ve ancak 2026-09-22 denetiminde yakalandı.
- `app/test_v3_welcome.js` — v3.0 tanıtım/kutlama sayfasının sözleşmesi
  (287 kontrol, ağsız/sentetik): `index.html` bootstrap sırası (head + app.js’ten
  önce), **sonsuz döngü koruması** (`?v3done=1` kaçışı), kalıcılık anahtarı
  (`seyma-v3-welcome-v1`, `seyma-reset-v1`’den ayrı namespace), depo kapalıyken
  `markSeen()`’in **yalan söylememesi**, ayrı sayfa izolasyonu (app.js/sync.js/
  panel yüklenmez), erişilebilirlik + token tüketimi + `prefers-reduced-motion`,
  **canlı `app/styles.css` tokenlarıyla WCAG kontrast ölçümü** (en düşük çift
  5.76:1), **kutlama katmanı** (konfeti/sayaç/ilerleme çubuğu, 13 adlandırılmış
  efektin ad ad kontrolü) ve **uygulama içi v3.0 metni** (Ayarlar → Hakkında,
  başlangıç rozeti, köprü).
  `App.x=554` ve fx2 pinlerini (App yüzeyi 718, tıklama 391) de önden doğrular.
  **Salt-okur uzak kaynak köprüsü (v3-source.js)** bölümü ağın güvenli sınırda
  kaldığını doğrular: yalnız GET (`PUT`/`POST`/`PATCH`/`DELETE` yok), depoya
  yazma yok, `sync.js`/push yolu kapalı, token yalnız `Authorization`
  başlığında (console/DOM/metne sızmaz), kimlik yalnız cihaz deposundan,
  **kimlik varsa repo esastır** (tek GET; cihaz kaydı yalnız kimlik yokken ya
  da ağ hatasında yedek), 1 MB üstü dosya için `git/blobs`
  yedeği + UTF-8 `TextDecoder`, ağ hatasında sayfa yine çizilir.
  **Kişisel veri katmanı (v3-data.js + v3-charts.js)** bölümü salt-okurluk
  sözleşmesini kaynak düzeyinde doğrular: `v3-data.js` ağdan muaf ve uzak veriyi
  yalnız belleğe alır (`setData`), kişisel metin alanları
  (`note`/`journal`/`intention`/`meals`) ekrana çıkmıyor, ruh hâli yalnız
  sayısal seviye (etiket yazılmıyor), tek istisna `nickname` yalnız selamlamada.
  Ayrıca `HABIT_SINCE` tablosunu `app.js HABITS[]` ile **birebir** karşılaştırır
  ve formül sabitlerini (seri eşiği 4, su 8/10, adım 0,72 m, uyku 7,5 sa)
  doğrular. **Gün sayısı dinamikliği:** `dayCount` sabit yazılmadığını, veriden
  türetildiğini (`diffDays(startDate, bugün) + 1`), `startDate` yoksa en erken
  kayıtlı günün kullanıldığını, türetilemezse sahte sayı gösterilmediğini
  (`dayCount: null`), rozetin de gerçek sayıdan üretildiğini ve dinamik
  güncelleme düğümlerinin (hero/sayaç/kapanış/footer) var olduğunu doğrular;
  statik HTML varsayılanının gerçek `startDate` ile eşit olmasını
  (**24 Haziran 2026 / 84** — eski "23 Haziran / 85" geri gelemez) zorunlu kılar.
  **Statik anlık görüntü (2026-09-15):** `v3-snapshot.js`'i VM'de yükleyip iç tutarlılık
  (hücre = gün = kayıtlı gün; tik toplamı), gerçek `startDate`, yasaklı alan
  taraması (not/günlük/etiket/token/ham kayıt yok), veri katmanının snapshot
  önceliği ve köprünün ağa çıkmamasını doğrular.
  **Tazelik kuralı + "N. gün" düğmesi:** kaynak seçiminin tazeliğe göre olduğunu,
  köprünün yalnız iyileştirebilecekse ağa çıktığını, Ayarlar düğmesinin
  `dayIndexFor` ile dinamik ve düz `<a>` olduğunu doğrular.
  **B1/B2 korumaları (2026-09-15):** "tam gün" rozeti sabit "7/7" değil gerçek
  alışkanlık sayısından üretilir; uygulama metinlerinde bayat "4.500 adım"
  kalmadı (yürüyüş tiki `stepsGoal` ile dolar).
  Run:
  `node tests/app/test_v3_welcome.js`.
  Hero flamingosunun **gerçek 🦩 emojisi** olduğunu (elle çizilmiş SVG'nin
  tamamen kaldırıldığını), sayfadaki tek emojinin bu olduğunu ve emojinin
  renklendirilmediğini de doğrular.
  **Gelişmiş istatistik katmanı (v3-stats.js + v3-statsview.js)** için **17
  matematik birim testi** çalıştırır (bilinen değerlerle: örneklem SS,
  çeyrekler, IQR, regresyon eğimi/R², Pearson ±1, hareketli ortalama pencere
  kuralı) ve dürüstlük kurallarını kaynakta doğrular (n<3 → hesaplama yok,
  sıfıra bölme koruması, aykırı değer gizlenmez, "nedensellik değildir").
- `app/test_aeon_message_expand.js` — ÆON/Luna sohbetinde uzun mesajın
  “Tümünü göster” durumunun render’lar arasında yaşadığını doğrular. Kırpılmış
  balonun kimliği eskiden her render’da artan bir sayaçtan üretiliyor ve açık/kapalı
  bilgisi yalnızca DOM’da tutuluyordu; her arka plan render’ı (30 sn ÆON yoklaması,
  reminder timer’ı, foreground dönüşü, yeni mesaj, panel makbuzu) mesajı kullanıcı
  okurken kapatıyordu. Ağsız, sentetik, `node:vm` tabanlı.
- `app/test_app_surface_lifecycle_boundary.js` — MON-53 `SeymaAppSurface`
  timer/listener/foreground callback registry’sinin cold-load no-op, fail-closed
  kayıt, timer/listener sahipliği ve cache-bust paritesini ağsız sentetik VM’de
  doğrular.
- `app/test_app_surface_boot_boundary.js` — MON-54 `SeymaAppSurface` boot/start,
  `window.App` expose sırası, auth late-boot guard, initial render/splash sırası,
  fail-closed kayıt ve cache-bust paritesini ağsız sentetik VM’de doğrular.
- `app/test_messaging_boundary.js` — MON-42 `SeymaMessaging` registry’sinin
  salt-okur chronology/render/attachment sınırını ve source notification dedupe
  sözleşmesini sentetik resolver bag’iyle doğrular.
- `app/test_motivation_room_accessibility.js` — Terapi Odası dialog semantiği,
  Tab/Shift+Tab focus sarma, Escape kapanışı ve yansıma taslağında yeniden render
  olmaması için ağsız sentetik regresyon fixture’ı.
- `app/test_crisis_boundary.js` — MON-27 `SeymaCrisis` registry’si: güvenlik
  kopyası, üç SOS yüzeyi, salt HTML/state sınırı, App handler kabuğu ve modal
  dialog/focus sözleşmesi; browser, gerçek ağ ve veri yoktur.
- `app/test_journal_boundary.js` — MON-28 `SeymaJournal` registry’si: Günlük
  Işığı text/count/streak/savedAt görünümü, journal kartı/modalı, app-owned
  save sırası, modal focus ve load-safe resolver sınırı; browser, gerçek ağ ve
  veri yoktur.
- `app/test_health_boundary.js` — MON-29 `SeymaHealth` registry’si: su/uyku,
  beslenme, kafein, magnezyum, adım ve ölçüm hesaplarının sentetik vektörleri,
  dateUtils resolver, app shim ve state-mutation sınırı; browser, gerçek ağ ve
  veri yoktur.
- `app/test_library_boundary.js` — MON-33 `SeymaLibrary` registry’si: beş hub,
  entry/archive kimliği, modal focus parity ve read-only mutasyon sınırı; browser,
  gerçek ağ ve veri yoktur.
- `app/test_report_boundary.js` — MON-34 `SeymaReport` registry’si: salt-okur
  dependency bag, 16 rapor üyesi, KPI/heatmap HTML determinism, app shim ve
  state mutasyonu sınırı; browser, gerçek ağ ve veri yoktur.
- `app/test_map_boundary.js` — MON-35 `SeymaMap` registry’si: load-side-effect,
  fixed/live location-weather projection, harita/weather/location HTML, error
  UI ve app-owned geolocation/fetch sınırı; browser, gerçek GPS ve gerçek ağ yoktur.
- `app/test_settings_boundary.js` — MON-37 `SeymaSettings` registry’si:
  eski/yeni ayarlar HTML byte parity, FX/theme/prayer-preference read surface,
  doğrudan data bağı ve state mutation sınırı; browser, gerçek ağ ve gerçek
  veri yoktur.
- `app/test_modal_focus_containment.js` — Tüm ortak modal ailesinin odak
  sözleşmesini, metin alanı dahil Tab/Shift+Tab sarma, Escape kapanışı, semantik
  dialog kabuğu ve focusable arka plan regresyonunu ağsız sentetik olarak doğrular.
- `app/test_local_visual_qa_guard.js` — Ajanın ekran görüntüsü alabilen yerel
  QA istisnasının Guard 1, force-sync ve gerçek profil sınırlarını kaynak
  düzeyinde ağsız doğrular.
- `app/test_deploy_surface_contract.js` — Pages yayın yüzeyi sözleşmesi
  (2026-09-22): `.github/workflows/pages.yml`’in “Stage runtime-only site”
  adımından **gerçek** `--exclude` bayraklarını çıkarır, aynı rsync’i geçici bir
  dizinde **çalıştırır** ve staged ağacı denetler. İç dizinlerden biri
  (`docs tests archive .claude tools files kuran-ogreniyorum jev-gate
  kuran-ogreniyorum jev-gate`) sızarsa, zorunlu çalışma zamanı varlıklarından
  biri (`index.html`, `app.js`, `app/styles.css`, `panel/…`, `v3` istisnası
  dâhil) düşerse veya staged ağaçta bir `.md` kalırsa FAIL eder. Guard adımının
  dizin listesi rsync dışlama listesiyle tutarsızsa da FAIL eder. Metin
  taraması değil yürütülebilir kanıt üretir; ağsız ve salt-okurdur (repo ağacına
  yazmaz, yalnız `os.tmpdir()`’e). Mutasyonla doğrulandı: bir `--exclude`
  kaldırılınca sızıntı yakalanır. `node tests/app/test_deploy_surface_contract.js`.
- `app/test_state_rebind_boundary.js` — MON-15 state Dalga 3 kapanışı: canlı
  B1 getter tazeliği, dokuz `app.js` data atama satırı, registryde sıfır
  `data=` yazımı, import/reset/location/auth late-boot ve 6079 try/finally
  geri-bind sınırı; sentetik `node:vm`, ağsız. Boot listesi MON2-01'den
  beri `app/core/reminderSurface.js`'i de içerir (MON-25 dört-liste sözleşmesi).
- `app/test_prayer_boundary.js` — MON-19 `SeymaPrayer` registry sınırı:
  load-safe expose, canlı state/date resolver, cache hit, explicit mock fetch,
  no-op timer ve normalizer davranışı; gerçek ağ/GPS/browser yoktur.
- `app/test_zikir_boundary.js` — MON-20 `SeymaZikr` motor/FX sınırı:
  load-safe registry, beş seed, canlı root/tap/pause/manual resolverları,
  `SeyAudio.tap` guardı ve guide/haptic sahipliği; browser ve gerçek ağ yoktur.
- `app/test_zikir_view_boundary.js` — MON-21 görünüm registry sınırı ve
  sentetik zikir dump parity: 16 view üyesi, app-owned draft mutation,
  overlay/paint kabuğu, inline handler sayıları ve sabit SHA-256 çıktıları;
  browser, gerçek ağ ve veri yoktur.
- `app/test_quran_boundary.js` — MON-22 `SeymaQuran` registry sınırı:
  requestId/sûre normalizasyonu, reducer geçişleri, outbox çözümleyicisi,
  read-only delivery/response apply idempotensi, 200→304→200 tekrar sınırı
  ve app.js shim/UI kabuğu; browser, gerçek ağ ve veri yoktur.
- `app/test_saygi_boundary.js` — MON-23 `SeymaSaygi` registry sınırı:
  SaygiPeople/HijriCalendar lazy çözümleme, kıble saf metrikleri, Saygı/İman/
  Kıble modal focus sözleşmesi, Okudum eylemi ve deterministic preview dump;
  browser, gerçek ağ ve veri yoktur.
- `app/test_zikr_manual_entry.js` — ZP-10 · Manuel zikir girişi (elle sayım)
  ağırlıklı ağsız sentetik fixture: sheet aç/kapa, gün/perPreset/lifetime işleme,
  doğrulama (0/negatif/ondalıklı/sınır), Esmâ hedef kırpma + tamamlanma engeli,
  geri alma, V4→V5 migration idempotentliği ve `mergeZikr` union matematiği
  (manuel + dokunuş birleşimi, çift sayım yok, reverted hariç, gün düzeyi
  rebalance). `node tests/app/test_zikr_manual_entry.js`.
- `quran/` — Kur’an taşıma, katalog ve demo sözleşmesi fixture’ları.
- `panel/test_panel_p*.js` — Panel-01–06 kontrol, projection, event ve polling fixture’ları.
- `panel/test_panel_boot_resilience.js` — panel boot/poll dayanıklılık fixture’ı:
  fetch zaman aşımı + gerçek iptal, `load()` tek uçuş kilidi, event-log gün
  dosyalarında sınırlı eşzamanlılık, ardışık hata backoff’u ve “yer tutucuda
  takılı kalma” regresyonu. 2026-08-21’de sahada görülen `ERR_HTTP2_PROTOCOL_ERROR`
  istek seli + “Çekirdek başlatılıyor…” kilitlenmesini kalıcı olarak kapatır.
- `reminders/` — dondurulmuş reminder programı için 20 seçilmiş ağsız sentetik
  bakım fixture'ı; runtime, browser ve gerçek veri kullanmaz. MON2 Dalga 1
  sonrası aile `app/core/reminderSurface.js`'i de yükler (`test_reminder_boot`
  123-dep bag, `test_reminder_end_to_end_lineage` REM-67 dilim sözleşmesi,
  fx2 `test_fx2_overlay_motion` iki aşamalı kaynak araması) ve 22
  `reminder*Legacy` çift gövdesi emekli edildiği için Legacy yolları 0'dır.
- `repo-root.js` — root kaynaklarına güvenli, cwd’den bağımsız erişim yardımcısı.

Reminder acceptance’ı üç ayrı scope olarak raporlanır: `tests/reminders/`
app/reminder contract bakım ailesi, `tests/panel/` current observer regression
ailesi ve `tests/panel-v2/` ayrı Premium regression
ailesidir. Panel-v2 fixture sayısı current panel acceptance’ının yerine
geçmez. Reminder setinin tamamı `run-reminder-smoke.mjs` ile exit-code bazlı
çalışır; `test_reminder_panel_fixture_architecture.js` static boundary ve
scope ayrımını, `test_reminder_end_to_end_lineage.js` ise sentetik app → sync →
projection → panel hattını kontrol eder.

Panel-v2 testlerinin ayrıntılı envanteri ve çalıştırma kuralları:
[`panel-v2/README.md`](panel-v2/README.md).

## Sık kullanılan komutlar

Tek Panel-v2 fixture’ı:

```bash
node tests/panel-v2/test_panel_v2_css.js
```

Tüm Panel-v2 fixture’ları:

```bash
for f in tests/panel-v2/test_panel_v2_*.js; do node "$f"; done
```

Reminder bakım regression:

```bash
node docs/reminders/verify-reminder-freeze.mjs
node tests/reminders/run-reminder-smoke.mjs
```

Current panel fixture’ları ayrıca:

```bash
for f in tests/panel/test_panel_*.js; do node "$f"; done
node tests/panel/test_faz11_panel.js
```

App/sync fixture’ları:

```bash
for f in tests/app/test_*.js; do node "$f"; done
```

Kur’an fixture’ları:

```bash
for f in tests/quran/test_*.js; do node "$f"; done
```

Tam panel kanıtında current-panel komutları ile Panel-v2 komutu ayrı exit code
olarak kaydedilir; `tests/app/`, `tests/panel/` ve `tests/quran/` globları
bilerek `tests/panel-v2/` altındaki fixture’ları içermez. Fixture sayısı tek
başına başarı kanıtı değildir: test adları, exit
code ve varsa failure signature birlikte raporlanır. Fixture’lar browser,
gerçek ağ, gerçek token, gerçek localStorage ve data repo write kullanmaz;
zaman duyarlı kontroller sabit/injected clock ya da açıkça bounded benchmark
sınırıyla çalışır.

Bilinen istisna: `tests/app/test_premium_settings.js` ve
`tests/app/test_premium_voice.js` sandbox'a gerçek `Date`'i verir; yerel saat
23:00–07:00 arasındayken `SeyAudio` quiet-time gating'i 1 + 8 assertion'ı
düşürür (2026-09-14 denetimi, 05:23'te 38/39 ve 59/67). Gece çalıştırırken
`getHours` döndüren küçük bir `-r` shim'i ile (12 sabitlenince 39/39 ve
67/67) ya da gündüz tekrar çalıştırarak doğrula; bu bir ürün regresyonu
değildir.

## Panel-v2 kapanış notu

Panel-v2 40/40 tamamlanmıştır. Güncel durum ve güncel yollar için
`archive/PANEL-V2-PREMIUM-TASARIM/.anti-amnesia/CURRENT-STATE.md`, kısa iş
özeti için `archive/PANEL-V2-PREMIUM-TASARIM/WORK-SUMMARY.md` okunur.
Ayrıntılı prompt/handoff bytes'ı Git geçmişinde tutulur; test fixture'ları
çalıştırmak için bu tarihsel dosyalara gerek yoktur.
