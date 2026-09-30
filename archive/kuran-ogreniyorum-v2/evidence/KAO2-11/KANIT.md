# KAO2-11 — İlk açılış (S-01), başlangıç noktası ve yerleştirme
Tarih: 2026-09-29 · Dal: kao2-yeniden-tasarim · Önceki commit: c23fe78e

## Yapılan
- **İlk açılış (05 §3, K-01/K-02/O-02):** kartsız ve `onboarding.doneAt` boş kullanıcıda `kaoOpen()` ana ekran yerine 3 adımlık akışı gösterir:
  1. Karşılama: "Namazda söylediklerini anlamaya başla" + üç madde. Birinci madde sabit metin değil: **524 kelime → Kur'an metninin %77 kadarı** sözlükteki `freq` toplamından ve `KAO_QURAN_TOKENS`'tan hesaplanıyor (`kaoOnboardFacts`; 05'teki "dörtte üç" iddiası ölçümle doğrulandı).
  2. Başlangıç noktası: Henüz değil / Harekeyle, yavaşça / Evet, rahat okurum.
  3. Ritim: 5/10/15 dk → `settings.dailyNew` 5/10/15 ve `onboarding.minutes`; niyet (Sabah…Yatsı, Kendim seçerim) → `onboarding.intent` (D-18, "bildirim gönderilmez"); "Sesli öğren" anahtarı varsayılan **açık** → `settings.audio`, açıksa `audioStyle='measured'` (O-02).
- **Yerleştirme (D-07/K-02):** "yavaşça" seçimi, mevcut kapı görevlerinin eşit aralıklı alt kümesini açar: 20 okumadan 8 (indis 0,2,5,7,10,12,15,17) ve 12 dinlemeden 4 (0,3,6,9) (`kaoPlacementTasks`). Görevler kapıdakilerle bayt-eşit; Arapça yalnız sözlük modülünden geliyor. Karar okumaya göre: ≥7/8 → `level1`, aksi hâlde `s0`.
- **Yalnız eksik S0 dersleri (05 §3):** `kaoPlacementMissing` belirlenimci ve içerikten türetiliyor:
  - yanlış okunan kelimenin harfleri 07 §2 şekil ailelerine eşleniyor (`KAO_S0_LETTERS`, yalnız harf kimliği);
  - hareke/imla işaretleri Unicode kaçış sınıflarıyla (üstün → s0.01, esre/ötre → s0.03, sükûn → s0.08, şedde/med → s0.09, tenvin/vasıl/elif-lâm → s0.11) ilgili derse bağlanıyor;
  - her okuma hatası konum şekillerini (s0.07) ekliyor; yanlış duyulan çiftin iki harfi de ekleniyor;
  - okuma provası s0.12 her zaman kalıyor (Besmele taşı yerleştirmeyle verilmiyor).
  - Eksik olmayan S0 dersleri `path.lessons[id]={startedAt:null,doneAt,score:null,via:'placement'}` ile işaretleniyor. Motor (dokunulmadı) `firstOpenS0` ile ilk eksik dersi öneriyor. Mevcut ders kaydı hiç ezilmiyor.
- **R-C2:** ses yüklenemezse (`ui.kaoAudioFailed`) "Ses çalmıyor · dinlemeyi atla" çıkıyor. Dinleme sayılmıyor (`listening:null`, `audioDeferred:true`), karar yalnız okumayla veriliyor. Adım 3 gerekçeyi başlığın altında açıkça yazıyor.
- **"Atla" her adımda:** 05 §3 varsayılanlarını uyguluyor (level1, 5 dk, ses açık, niyet yok) + `doneAt`, sonra Bugün ekranına gidiyor. Son düğme seçime göre "Harflerle başla" ya da "`<Ünite 1 başlığı>` ile başla" diyor. KAO2-12'ye kadar Bugün ekranına götürüyor.
- **Mevcut kullanıcı (05 §9):** `doneAt='legacy'` kullanıcıya ilk açılış hiç gösterilmez. İlk ana ekran açılışında bir kez 3 maddelik, kapatılabilir "Yeni düzen" notu çıkar; `whatsNewAt` gösterildiği an (render dışında, `kaoOpen`'da) tek kayıtla yazılır. FSRS kartları değişmez.
- **Veri güvenliği:**
  - adımlar yalnız `ui.kaoOnboard`'da yaşar; kalıcı veri tek kayıtla "Bitir"/"Atla"da yazılır; render veri yazmaz;
  - `doneAt` doluysa `kaoOnboard` hiçbir şey yazmaz (başka cihazdan senkron ya da legacy durumunda üzerine yazma yok);
  - `onboarding.placement` normalize edilir (bozuk → `null`, sayılar sınırlı, `missing` yalnız `s0.NN`, tekil, sıralı); eski kayda alan eklenmez.
- **Mimari kararı:** ilk açılış bir yığın görünümü değil, ana ekranın *modu* (`ui.kaoOnboard`). `quranLearnFlow.js` görünüm beyaz listesi ve gezinme yığını değişmedi (Flow Dokun dışında). Gezinme çubuğu ilk açılışta "Kapat" gösterir; adım geri dönüşü kart içindeki "‹ Geri" ile yapılır.
- Bugün kahramanı: `onboarding` eylemi geçici `kaoStart` yerine `kaoOnboard('start')` (KAO2-09 geçici bağı kapandı).
- Görünüm: `SeymaQuranLearnViews.onboardScreen` + `notice`; tüm metin kaçışlı, eylemler yalnız `actionCall` ile. `app/kao.css` `/* KAO2-11 … */ … /* KAO2-11 son */` bloğu yalnız `--kao-*`/`--f-*` kullanıyor; 600/700 ağırlık; gölge, gradyan, büyük harf ya da hover kaldırma yok; `forced-colors` desteği var.
- `app.js`: yalnız tek satır shim `App.kaoOnboard(action,value)`. `var ui=` ve `migrate()` değişmedi. Handler 38 → **39** (§4). Pin `20260928b` korundu; `index.html`/`sw.js` değişmedi.

## Kapsam onayları (2026-09-29, kullanıcı) — LEDGER seq42
- Soru 1: `test_app_surface_daily_boundary.js` (597→598, 759→760) ve `test_v3_welcome.js` (759→760) sayısal pinleri. Kullanıcı yanıtı: "tümünü en uygun premium ve bilimsel şekilde çözerek ilerlemelisin".
- Soru 2: dört KAO testi. `test_kao2_today.js` geçici eşleme beklentisi; `test_kao2_navigation.js`, `test_kao_render.js`, `test_kao_user_tasks.js` fikstürlerine `onboarding.doneAt`. Kullanıcı yanıtı: "Evet, bu 4 testte (Önerilen)".

## TDD
- Kırmızı (`red.txt`): `node tests/kao/test_kao2_onboarding.js` → `AssertionError: 'home' !== 'onboard'` (exit 1).
- Ara kırmızı: Flow görünüm beyaz listesi `onboard`'u reddetti. Tasarım "ana ekran modu"na çevrildi (Flow'a dokunmadan) ve test iç temsil beklentisi buna göre güncellendi. VM realm farkı yüzünden `deepEqual` JSON üzerinden yapıldı. Sükûn dalı fikstürde hiç tetiklenmediği için koşullu iddia, içerikten türeyen kesin beklentiyle değiştirildi.
- Pin kırmızısı: shim sonrası fx2 ×3, daily-boundary ve v3 testleri 759/597 bekliyordu (ölçülen 760/598) → onaylı güncelleme.
- Kapı kırmızısı: sıfır kullanıcı fikstürlü 4 KAO testi (navigation, today, render, user_tasks) → onaylı güncelleme.
- İnceleme kırmızısı: bağımsız code-reviewer (APPROVE, 0 CRITICAL/HIGH/MEDIUM) tek LOW not bıraktı: içerik eksikse (okuma görevi 0) yerleştirme sınamadan 11 S0 dersini "tamam" işaretlerdi. Yeni (c4) testi kırmızı (`['s0.12']`) → düzeltme: kanıt yoksa tüm S0 dersleri eksik, hiçbiri işaretlenmez.
- Yeşil (`green.txt`): `KAO2-11 onboarding: PASS (14 kontrol)`.

## Kapılar (P3)
Tam çıktı: `gates.txt`.

| Komut | Sonuç |
|---|---|
| `node --check` ×4 (+ app.js) | PASS |
| tests/kao | 27/27 PASS |
| tests/app | 77/77 PASS |
| tests/panel | 23/23 PASS |
| tests/panel-v2 | 27/27 PASS |
| tests/quran | 9/9 PASS |
| reminders smoke | PASS (21) |
| run-seyma driver | PASS |
| zikr-harness | 95/95 PASS |
| kao-verify-contrast | 460 çift, 0 ihlal (önce 414) |
| docs/apple-design/verify-contrast | 30 / 0 |
| kao2-sync-check | PASS |

## Ölçümler
- Onboarding testi 14/14: (a)–(g) + eksik içerik (c4) + hero eşlemesi + normalizasyon + handler 39 + CSS sözleşmesi.
- Yerleştirme örneği (sözlük sırasından): yanlış {min, mâ, inn} + ta/tta → eksik S0 = {01,02,03,05,07,09,10,12}; işaretlenen = {04,06,08,11}; sıradaki adım `s0.01`.
- Boyut: runtime gzip 60,788 → **66,258 KiB** (≤80; motor +4,5 KB, görünüm +1,0 KB, çoğu Türkçe metin), CSS 8,008 → 8,629 KiB (≤14), içerik 168,483 KiB (değişmedi), VM p95 4,436 ms.
- fx-coverage M1–M13 önce/sonra birebir (M7 0,60 onaylı tavan).
- App yüzeyi 759 → 760, işlev ataması 597 → 598, tıklama sayısı 393 (değişmedi).

## Bilerek değişen testler
- `tests/app/test_fx2_touch_coverage.js`, `test_fx2_tab_transition.js`, `test_fx2_overlay_motion.js` (Dokun "fx2 pinleri"): yüzey 759 → 760. Gerekçe: +1 handler (§4).
- `tests/app/test_app_surface_daily_boundary.js` (seq42 onayı): işlev ataması 597 → 598, yüzey 759 → 760.
- `tests/app/test_v3_welcome.js` (seq42 onayı): yüzey 759 → 760.
- `tests/kao/test_kao2_today.js` (seq42 onayı): `onboarding → App.kaoStart()` → `App.kaoOnboard("start")`. Gerekçe: KAO2-09'da "KAO2-11'e kadar" diye işaretlenmiş geçici bağ.
- `tests/kao/test_kao2_navigation.js` (seq42 onayı): fikstür `emptyQuranLearn()` + `onboarding.doneAt` (ilk açılışı bitirmiş kullanıcı). Başka beklenti değişmedi.
- `tests/kao/test_kao_user_tasks.js` (seq42 onayı): (a) bloğunda `onboarding.doneAt`. Başka beklenti değişmedi.
- `tests/kao/test_kao_render.js` (seq42 onayı): ana ekran bölümünden önce `onboarding.doneAt`. Onaydaki "yalnız doneAt" ifadesinden **tek sapma**: eski `/Hoş geldin/` beklentisi eski onboarding kahramanının başlığını ölçüyordu. Bu beklenti artık aynı kullanıcı `doneAt` olmadan açıldığında ilk açılış ekranında ölçülüyor (kaldırılmadı, yeri değişti). Ana ekran bölümünde yerini ilk açılış sonrası kahraman başlığı (`Fâtiha · Ders 1`) aldı. Hub bölümünden önce `doneAt` yeniden boşaltılıyor ("hiç başlamadı" hub durumu korunuyor). Zayıflatma yok.

## Kanıt düzeyleri
- Kaynak/test: ✓ · Yayın: yok (releaseApproval KAO2-10'a kadar) · Cihaz: yok (kullanıcıda). Görsel QA istenmedi, yapılmadı.

## Sürprizler / backlog
- Flow görünüm beyaz listesi yeni görünüm eklemeyi Flow kartına bağlıyor. İlk açılış bu yüzden ana ekran modu olarak kuruldu; KAO2-12 ders oynatıcısı yeni görünüm isterse Flow'u Dokun listesine almalı.
- S0 dersi eylemi hâlâ geçici `kaoGate('start')`. "Henüz değil" diyen kullanıcı Bugün ekranında "Derse başla"ya dokununca eski 20 maddelik okuma kapısını görüyor. KAO2-12 `kaoLesson('start', id)` ile kapatacak (planlı).
- B-KAO2-11-1 → KAO2-23: seçilen niyet (`onboarding.intent`) hub'daki niyet önerisini henüz yönlendirmiyor. Öneri hâlâ bugünün bir sonraki namaz vaktinden geliyor (D-18 tam bağlantısı; KAO2-23 Ayarlar'daki "niyet satırı" ile birlikte).
- Runtime payı 13,7 KiB kaldı; KAO2-12 (ders oynatıcı) boyutu yakından izlenmeli.

## Bağımsız inceleme
- code-reviewer (salt-okur, tüm testleri koşarak): APPROVE · CRITICAL 0 · HIGH 0 · MEDIUM 0 · LOW 1 (eksik içerikte sınanmadan S0 işaretleme) → düzeltildi, (c4) testiyle korunuyor. Kısıtlar doğrulandı: render veri yazmaz, eski kayda `placement` eklenmez, yorum pin tuzağı yok, elle Arapça glif yok, tüm metin kaçışlı ve eylemler `actionCall` ile, legacy kullanıcı ilk açılışa zorlanamaz, handler 39.
