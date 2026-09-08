# Premium FX — Güncel Durum

**Tarih:** 2026-09-08
**Seri:** **FX-2 — "Hissedilir Premium"** (yeni seri açıldı)
**Dal:** `premium-fx-gorsel-yuzey` · **LOCAL ONLY** (push/merge/deploy yok)
**Plan sürümü:** FX-2 v2.0 (28 kart, 8 dalga)

---

## Şu An Neredeyiz

| | |
|---|---|
| Son tamamlanan prompt | **FX2-25** — aurora v2 (parallax + grain) (Dalga 6 kapanışı) |
| Sıradaki prompt | **FX2-26** — (Dalga 7) |
| Aşama | Dalga 7 — Varsayılanlar ve Kapanış |
| Bloklu | yok |
| Uygulama tamamlandı | hayır — FX-2 serisi devam ediyor |

**Durum makinesi:** [`FX2-STATE.json`](FX2-STATE.json)

---

## Neden Yeni Bir Seri Açıldı

FX-1 (91 prompt, ~70 fixture, "DEPLOY-A-HAZIR" kararı) **kapandı** ama
kullanıcı geri bildirimi net: *"tüm fx promptları uygulamama karşın uygulama
hâlâ premium bir his vermiyor."*

2026-09-06'da yapılan kod denetimi bunu doğruladı
([`../TESHIS.md`](../TESHIS.md)):

- `SeyAudio.tap` → `app.js`'te **0 çağrı**
- `SeyFx.ripple` → 1 çağrı, **tetiklenemez** (hiçbir `onclick` `event` geçmiyor)
- `.sey-ripple` / `.sey-shimmer` / `.sey-enter` → markup'ta **0 kullanım**
- `SeyHaptics` 21 çağrı → **iOS Safari'de tamamı no-op**
- 361 butonun 277'si satır içi stille yazılı, **ortak sınıf yok**
- 4 premium ayar varsayılan **kapalı**; bulut TTS anahtar olmadan sessiz
- 717 `App.*` handler'ının **~%3,5'i** herhangi bir FX tetikliyor
- Buna rağmen **9/9 premium fixture yeşil** ← asıl kök neden

**Ders:** Fixture'lar modülü test etti, **bağlantıyı** test etmedi.
FX-2 bu yüzden birim olarak API'yi değil **kapsamı** alır
([`../KAPSAM-OLCUMU.md`](../KAPSAM-OLCUMU.md)).

---

## Taban Çizgisi (2026-09-06, kaynak ölçümü commit `67f95a6`)

| Metrik | Taban | Hedef |
|---|---:|---:|
| M1 etkileşimli eleman | 390 | — |
| M2 basma geri bildirimi | **0** | ≥ 343 |
| M3 ses bağlı etkileşim | 18 | ≥ 200 |
| M4 ripple konteyneri | **0** | ≥ 325 |
| M5 canlandırılan sayaç | 1 | ≥ 8 |
| M6 çıkış animasyonlu overlay | **0** | ≥ 10 |
| M7 hareket token uyumu | 0,13 | ≥ 0,80 |
| M8 kapalı gelen premium ayar | 2 | 0 |
| M9 iOS geri bildirim kanalı | **0** | ≥ 2 |
| M10 pembe token | 9 | **0** |
| M11 palet ailesi | 3 | **≤ 2** |
| M12 canlı zemin sahnesi | **0** | ≥ 18 |
| M13 kontrast (8 çift) | 0 | **8** |

Testler taban anında **yeşil**: syntax OK, `driver.mjs` fail=0,
premium ailesi 9/9.

Kartın tarihsel beklenen tabanından farklar kaynak ölçümüyle kaydedildi:
M1 390, M3 18, M7 0,13, M8 2, M10 9 ve M11 3. M8 yalnız kartta tanımlanan
beş kimlik ayarını sayar; mevcut `migrate()` içinde `launchRitual` ile
`voiceLocalFallback` false backfill edilir. M9 mevcut rastgele gürültü buffer'ını
sessiz iOS unlock kanalı saymadığı için 0'dır. `coverage.json` bu ölçümün
makinece okunabilir otoritesidir.

---

## FX2-01 — Tamamlandı (2026-09-06)

`tools/fx-coverage.mjs` yalnızca `node:fs` ve `node:path` kullanarak kaynak
metni tarayan, uygulamayı çalıştırmayan ve ağ/VM kullanmayan kapsam denetçisi
olarak eklendi. `--save` yalnızca `coverage.json` yazar; `--gate` sabit FX2
eşikleriyle çalışır ve bu aşamada exit 1 verir.

Ölçüm dosyası: [`coverage.json`](coverage.json). Uygulama yüzeyi değişmedi;
`app.js`, `app/`, `index.html`, `tests/` ve `sync.js` dokunulmadı.

## FX2-02 — Tamamlandı (2026-09-06)

İzin verilen CSS iskeleti uygulandı: mevcut `#root` bloğuna `--dur-*`,
`--ease-*`, `--elev-*`, `--press-*` tokenları eklendi; `--ease-premium`
geriye uyumlu olarak `var(--ease-out)` alias'ına bağlandı; koyu tema
elevation/press override'ları ve tek reduced-motion süre bloğu eklendi.
`index.html` cache-bump'i `styles.css?v=20260906e` oldu. Selector, layout,
süre ve property yüzeyi korunarak yalnız aktif easing değerleri tokenlara
bağlandı; `app.js`, `app/core/**` ve test dosyaları değişmedi.

Kullanıcı onayıyla blokaj çözüldü: mevcut aktif `transition:`/`animation:`
bildirimlerindeki hardcoded easing değerleri ortak `--ease-*` tokenlarına
bağlandı; `none` ve `linear` davranışları korundu. Süre değerleri değiştirilmedi.
M7 bağımsız hesabı **0,13 → 0,56** oldu (`23/173` → `97/173` token uyumlu
bildirim); kart hedefi `≥0,45` geçti. `--elev-*` doğrulaması 10 bildirime
ulaştı. Global `--gate` diğer FX metrikleri henüz hedef altında olduğu için
exit 1 vermeye devam eder; FX2-02'nin M7 kapısı geçmiştir.

## FX2-03 — Tamamlandı (2026-09-07)

Pembe ana palet tokenları Şampanya Altını + Füme Mürekkep kararına taşındı:
açık tema `--accent:#B08D57`, `--accent-ink:#8A6A3B`, koyu tema
`--accent:#E3C08A`, iki temada `--accent-soft` ve `--accent-bg`, ayrıca
`--page` ve `--learn` yüzeyleri güncellendi. `index.html` CSS cache-bump'i
`styles.css?v=20260906f` oldu.

FX2-04 kapsamındaki `#D96D8B` aurora fallback'i özellikle korunarak M10
`9 → 1`, M11 `3 → 2` oldu. `--kandil` açık tema renkleri (`#9C4A5A`,
`#D68A94`), `--warn`, `--read`/`--watch`/`--listen` ve `--sun` değişmedi.
Kontrast ölçümleri sırasıyla **4,83**, **13,48**, **12,17** ile AA eşiğini
geçti. `app.js`, `app/core/**`, `sync.js`, `tests/**` ve `coverage.json`
değişmedi.

## FX2-04 — Tamamlandı (2026-09-07)

Altın aile iki temada `--gold-1..5` merdivenine bağlandı. ÆON (`--aeon`,
`--aeon2`), zikir sayacı (`--zikr-counter-gold`) ve nav/header fallback'leri
`var(--gold-*)` kullanıyor; 12 adet `#A4824C` kaldırıldı. `#sey-aurora`
fallback'i `var(--accent-ink,#8A6A3B)` oldu. `index.html` CSS cache-bump'i
`styles.css?v=20260906g` oldu.

Canlı ölçüm: **M10 1 → 0**, **M11 2 → 2**; kart eşiği geçti. `--kandil`,
`--warn`, `--read`/`--watch`/`--listen`, `--sun`/`--sun2` değerleri ve
`panel/**` korunarak doğrulandı. `app.js`, `sync.js`, test dosyaları ve
`coverage.json` değişmedi. Headless kanıt: driver 0 fail; app 29/29; zikir
95/95; migration 60/60; panel 23/23; Panel-v2 27/27; Kur'an 9/9;
reminder smoke 20/20.

## FX2-05 — Tamamlandı (2026-09-07)

Yeni `tests/app/test_fx2_palette_contrast.js` fixture'ı ağsız biçimde
`app/styles.css` tokenlarını okuyarak 12 grubu ve 8 kontrast çiftini kilitliyor.
İlk gerçek koşuda `#8A6A3B / #F7F1E8` oranı **4,4472** çıktı; eşik
gevşetilmedi. Açık `--accent-ink`, açık `--gold-4` ve aurora fallback'i
`#886738` yapıldı; oran **4,625** oldu. CSS değiştiği için cache-bump
`styles.css?v=20260906h` yapıldı.

Sonuç: fixture **12/12**, M10 **0**, M11 **2**, M13 **8/8**. Protected
renkler ve panel yüzeyi değişmedi; `app.js`/`app/core/**`/`sync.js` değişmedi.
`coverage.json` yeniden yazılmadı. Dalga 1 kapandı; sıradaki kart FX2-06.

## FX2-06 — Tamamlandı (2026-09-07)

`app/core/mediaFx.js` sonuna `window.SeyTouch` eklendi: tek delege
`pointerdown` dinleyicisi `#root` üzerinde, `pointerup`/`pointercancel`/
`pointermove` yardımcıları `passive:true` ile kuruldu. Dinleme `#app`'e değil
`#root`'a bağlı; `preventDefault` yok, scroll davranışı korunuyor. Devre dışı
ve form elemanları filtreleniyor, >10 px hareket basmayı iptal ediyor, her FX
çağrısı kendi `try/catch` sınırında ve `install()` idempotent.

İlk boot `render()` çağrısından hemen sonra `app.js` içine tek satır bağlantı
eklendi. `mediaFx.js` cache-bump'i `20260902b`, `app.js` cache-bump'i
`20260906f` oldu. App handler/markup/render/paint ve CSS değişmedi.

Sonuç: M2 **0 → 390/390** (hedef ≥343), `App.*` **717**, `onclick` **391**;
statik gate `preventDefault=0`, listener **4**, passive listener **4**.
Sentetik idempotence/pointer fixture PASS; driver 0 fail, zikir 95/95,
migration 60/60, B1 0 failure, B3 20/20, app 30/30, panel 23/23,
Panel-v2 27/27, Kur'an 9/9, reminder 20/20 PASS. `coverage.json` yeniden
yazılmadı; push/deploy/browser yok. Sıradaki kart FX2-07.

FX2-06 denetim düzeltmesi: delege `pointerdown` sırasında `event.currentTarget`
`#root` olduğu için eski iki argümanlı `SeyFx.ripple` dalgayı root'a ekliyordu.
`ripple(event, color, targetEl)` artık açık hedefi önceliyor; inline eski
çağrılar `event.currentTarget` fallback'iyle değişmeden çalışıyor. Bu davranış
`test_premium_fx_utils.js` içindeki sentetik hedef-host regression'ıyla
kilitlendi. `mediaFx.js` cache-bump'i `20260902c` oldu.

## FX2-07 — Tamamlandı (2026-09-07)

`SeyTouch` tarafından takılan `.sey-press` için yalnız `transform` ve
`filter` kullanan token tabanlı basma geri bildirimi eklendi. Açık temada
`--press-scale`/`--press-dim`, koyu temada mevcut `--press-dim:1.12` kullanılır;
reduced-motion'da transform kapanır, parlaklık geri bildirimi kalır.

Kartın içindeki butona basınca tüm kartı küçülten `.surface:active` kuralı ve
onun reduced-motion eşleniği tamamen kaldırıldı; `.surface:hover` değişmedi.
`index.html` stylesheet cache-bump'i `20260906i` oldu. Canlı ölçüm M9 **0 → 1**;
`app.js`, `app/core/**`, markup ve `coverage.json` değişmedi. Headless kanıt:
reduced-motion 31/31, driver 0 fail, zikir 95/95, migration 60/60, app 30/30,
panel 23/23, Panel-v2 27/27, Kur'an 9/9, reminder 20/20 PASS. Sıradaki FX2-08.

## FX2-08 — Tamamlandı (2026-09-07)

`SeyFx.ripple(event, color, targetEl)` delege hedefini kullanmayı sürdürürken
host'u runtime'da `.sey-ripple` sınıfıyla hazırlıyor; 8 px altındaki ölçülemeyen
hedefler atlanıyor ve `position:static` elemanlar dalga taşmaması için
`relative` yapılıyor. `data-fx="destructive"` olan hedeflerde açık renk
verilmemişse dalga `--drop` tonuna kayıyor. Dalga `animationend` ile veya 600 ms
timeout ile tek sefer temizleniyor; eski `ripple(event, color)` yolu korunuyor.

`.sey-ripple` konteynerine `isolation:isolate` eklendi. `index.html` cache
bump'leri `styles.css?v=20260906j` ve `mediaFx.js?v=20260902d` oldu. Canlı
ölçüm M4 **390/390**; hedef önceki FX2-06 delege bağlantısıyla taban 0'dan
geçilmişti, bu kart host/taşma/temizleme sözleşmesini tamamlıyor. `app.js`,
markup ve `coverage.json` değişmedi. Sıradaki FX2-09.

## FX2-09 — Tamamlandı (2026-09-07)

`SeyTouch` artık `data-fx` niyetini `nav`, `open`, `close`, `toggle`,
`confirm` ve `destructive` olarak yorumluyor. Eksik ses API'leri `FX_FALLBACK`
ile güvenli karşılığa düşüyor; `toggle`, mevcut `aria-pressed`/`is-on`/
`is-active` durumundan sonraki sesi seçiyor. `close` ripple üretmez;
`data-fx="none"` ise basma sınıfı dahil tüm geri bildirimi atlar.

`app.js`te yalnız düğme açılış etiketlerine **41** `data-fx` özniteliği
eklendi: alt navigasyon şablonu altı sekmeyi, başlık markası bir sekmeyi daha
kapsadığı için gerçek yüzeyde en az 46 yüksek değerli eylem anlam ayrımı alır.
`App.*=717` ve `onclick=391` korundu; handler, mevcut öznitelik değerleri ve
markup yapısı değişmedi. Cache bump'leri `mediaFx.js?v=20260902e` ve
`app.js?v=20260906g`. M2/M3/M4 canlı ölçümü 390/408/390 korundu; `coverage.json`
yazılmadı. Sentetik niyet sözleşmesi 9/9, driver 0 fail, zikir 95/95, migration
60/60, app 30/30, panel 23/23, Panel-v2 27/27, Kur'an 9/9, reminder 20/20 PASS.
Sıradaki FX2-10.

## FX2-10 — Tamamlandı (2026-09-07)

Yeni `tests/app/test_fx2_touch_coverage.js` gerçek `app/core/mediaFx.js`
kaynağını ağsız `node:vm` içinde yükleyerek delege dokunma bağlantısını
**12/12** grupta kilitler. Katman API'si, idempotent kurulum, seçici ve statik
buton kapsamı, `preventDefault` yokluğu, dört passive dinleyici, premium-kapalı
ve reduced-motion davranışları, App/onclick değişmezliği, niyet sözlüğü,
ripple ölçü/konum güvenliği ve render dışındaki tek boot bağlantısı doğrulandı.

Kaynakta bulunan **360** statik `<button>` seçicideki `button` koluyla %100
kapsanır; sayım tarihsel bir sabite bağlanmadı. Canlı kapsam ölçümü M2
**390 ≥ 343**, M4 **390 ≥ 325**, M9 **1 ≥ 1**; `coverage.json` yazılmadı.
Uygulama kaynakları ve `index.html` değişmedi. Sıradaki FX2-11.

## FX2-11 — Tamamlandı (2026-09-07)

`app/core/mediaFx.js` içindeki tek `AudioContext` artık ilk kullanımda ortak
master bus'a bağlanır: `busGain(0.8)` → compressor (-18 dB, 4:1, 3 ms / 120
ms) → tanh soft limiter (1024 örnek, 2x) → destination; reverb send ise kod
içinde üretilen iki kanallı 0,9 sn impulse convolver üzerinden bus'a döner.
Harici asset veya ağ çağrısı eklenmedi.

İç `playVoice` ADSR/filter/detune/gain-jitter/reverb/partial'ları, `playNoise`
band-pass transient'i ve altı köklü polifoni sınırını sağlar; eski
`tap`/`success`/`warning`/`bell` adları ve imzaları korundu. Tam Web Audio
stub kontratı graph düğümlerinin bir kez kurulmasını ve yedinci-sekizinci
köklerde 20 ms eski-ses sönümünü doğruladı; mevcut audio fixture 27/27 geçti.
`index.html` mediaFx cache-bump'i `20260902f` oldu. Sıradaki FX2-12.

## FX2-12 — Tamamlandı (2026-09-07)

`SeyAudio` ses paleti 11 bağlayıcı sese genişletildi: 22 ms yalnız-gürültü
`tick`, 45 ms/660 Hz sine `tap`, yönlü `toggleOn`/`toggleOff`, `nav`,
`sheetOpen`/`sheetClose`, üç notalı `success`, altı inharmonik parsiyelli
900 ms `bell`, triangle `warning` ve düşük kazançlı `error`. Eski
`tap`/`success`/`warning`/`bell` dış adları korunurken zikirin hızlı sayacı
`SeyAudio.tick()`e bağlandı; `sawtooth` tamamen kaldırıldı.

Gerçek kaynak fixture'ı 36/36 ile yeni API, üç notalı başarı, 660 Hz tap,
altı parsiyelli çan, `sawtooth=0` ve zikir tick yönlendirmesini kilitler.
M3 canlı ölçüm **408 ≥ 200**; `coverage.json` yazılmadı. `mediaFx.js` cache
versiyonu `20260902g` oldu. Sıradaki FX2-13.

## FX2-13 — Tamamlandı (2026-09-07)

`SeyTouch.install()` artık ilk `pointerdown`da, basma dinleyicisinden **önce**
aynı capture fazında çalışan tek seferlik/pasif iOS kilit açma dinleyicisini
kurar. Bu dinleyici askıdaki `AudioContext`i sürdürür, 1 örneklik sessiz
buffer oynatır ve `_unlocked` işaretini yazar. Ses üreticileri ve ambiyans
bağlamı kendi kendine `resume()` etmez; `running` değilse sessiz no-op olur.

`visibilitychange` gizlenince ambiyansı durdurup bağlamı askıya alır; yalnız
önceden kullanıcı jestiyle açılmış bağlamı görünür dönüşte sürdürür.
`SeyAudio.isAudible()` yeni, geriye uyumlu durum API'sidir. Platform fixture'ı
kilit açma sırasını, once/pasif davranışı ve suspend/resume yaşam döngüsünü
**14/14** ile doğrular; audio fixture **37/37**. M9 canlı ölçüm **1 → 2**;
cache sürümü `20260902h`. Sıradaki FX2-14.

## FX2-14 — Tamamlandı (2026-09-07)

Yeni `tests/app/test_fx2_audio_engine.js`, gerçek `app/core/mediaFx.js`i
ağsız `node:vm` içinde kayıt tutan bir sahte `AudioContext` ile yükler.
Fixture 12 grupta master graph zincirini, kod içi reverb impulse'unu, tek
kurulumu, altı sesli polifoni sınırını, detune varyasyonunu, kısa ses
sürelerini, inharmonik çanı, warning waveformunu, dört koşullu gating
matrisini, iOS kilidini, UI ses yolunda ağ yokluğunu ve I2 API yüzeyini
doğrular.

İlk çalıştırmada fake compressor parametreleri eksik olduğu için graph kurulum
assertion'ı haklı olarak düştü; fixture gevşetilmeden mock tamamlandı. Sonuç
**12/12 PASS**. Uygulama kaynakları ve `index.html` değişmedi;
`coverage.json` yazılmadı. Dalga 3 kapandı: M3 **408 ≥ 200**, M9 **2 ≥ 2**.
Sıradaki FX2-15.

## FX2-15 — Tamamlandı (2026-09-07)

`App.go` yalnız kendi gövdesinde çıkış → swap → giriş motoruna taşındı:
gerçek sekme değişiminde eski `#app` önce `sey-leaving` olur, `transitionend`
ve 200 ms timeout ağı tek bir commit'e bağlanır, yeni kabuk iki
`requestAnimationFrame` sonrası `sey-entering` sınıfını bırakır. Hızlı ikinci
istek eski timer'ı ve bayat `transitionend` işleyicisini timer kimliğiyle
etkisizleştirir; yalnız son hedef commit edilir. Premium kapalı veya
reduced-motion durumunda eski senkron davranış korunur. Yeni ses eklenmedi.

`app/styles.css` tokenlı `#app` geçişi ve reduced-motion bypass'ını aldı;
`index.html` CSS/app cache sürümleri `20260907a` oldu. Yeni ağsız dar fixture
`tests/app/test_fx2_tab_transition.js` 7/7 ile çıkış sırası, timeout, hızlı
geçiş, fallback ve I7 yüzeyini kilitler. No-op timer kullanan mevcut driver,
zikir ve B1 render fixture'ları yalnız kendi eski senkron kapsamları için
FX kapısını kapatır; motorun asenkron kabul kanıtı yeni fixture'dadır.

Kanıt: syntax temiz; driver fail=0 ve `--dump bugun` nav üretir;
reduced-motion 31/31; app 33/33, current panel 24/24 (Faz11 dahil),
Panel-v2 27/27, Kur'an 9/9, reminder 20/20, zikir 95/95, B1/B2/B3 PASS.
Salt-okunur kapsam raporu M3=408 ve M9=2'yi korur; `coverage.json`
yazılmadı. `App.*` 718 (`App._goTimer` dahil), `onclick=391`; `render()`,
`paint()` ve scroll/odak restorasyonu dokunulmadı. Push/deploy/browser yok.
Durum: `FX2-15 → FX2-16`, blokaj yok.

## FX2-16 — Tamamlandı (2026-09-07)

On iki hedef overlay kapatıcısı yalnız kendi dış sarmalayıcısında `SeyFx.sheetClose`
üzerinden çalışır: ortak `#sey-ov-card/#sey-ov-back`, Zikirmatik, Kur'an,
Kıble ve Reminder yüzeyleri doğru kart/backdrop kimlikleriyle bağlandı. Eski
kapatma gövdeleri — odak iadesi, scroll kilidi, render ve kayıt sırası dahil —
aynen `body` callback'i içinde kaldı. Yardımcı premium/reduced-motion kapalıysa
senkron eski yolu anında kullanır; açıksa kart/backdrop çıkış sınıflarını ekler,
kartın kendi `animationend` olayını dinler ve 260 ms ağ ile en fazla bir kez
tamamlar. Çocuk animationend olayları erken kapatmaz, çift kapatma ikinci gövdeyi
çalıştırmaz.

CSS, ortak ve dört özel sheet yüzeyini tokenlı alttan girişe bağlar; çıkış ve
backdrop fade aynı tokenlarla çalışır, reduced-motion bunları tamamen kapatır.
Cache sürümleri CSS/mediaFx/app için `20260907b` oldu. Yeni ağsız
`tests/app/test_fx2_overlay_motion.js` 7/7; mevcut reduced-motion fixture'ı
yeni üç sınıfı açıkça kapsar (34/34). Salt-okunur ölçüm M6 **0 → 12 ≥ 10**;
`coverage.json` yazılmadı. `App.*=718`, `onclick=391`; `render()`, `paint()`,
modal odak ve scroll kilidi dokunulmadı. Push/deploy/browser yok.

Durum: `FX2-16 → FX2-17`, blokaj yok.

## FX2-17 — Tamamlandı (2026-09-07)

On ÆON-dışı tekrar eden liste yüzeyi `sey-stagger` sınıfı ve markup içi
`--i:Math.min(i,8)` ile CSS tabanlı giriş sırası aldı: reminder kartları ve
inbox, okuma/izleme/dinleme günlükleri ile arşivleri, öğrenme ve ruh pratiği
kayıtları. Böylece JavaScript düğüm gezmeden, liste uzunluğu ne olursa olsun
en yüksek gecikme sekizinci kademede kalır. ÆON sohbeti ve mesaj listesi
bilinçli olarak dışarıda bırakıldı.

`sey-fade-in` mevcut keyframe'i yeniden tanımlanmadı; yeni kural tokenlı süre
ve easing kullanır. Reduced-motion altında `animation:none!important` ile
anlıktır. CSS/app cache sürümleri `20260907c` oldu. Kanıt: syntax, driver,
zikir 95/95, tüm app fixture'ları 34/34 ve `git diff --check` PASS; `App.*=718`
ve `onclick=391` korundu. Push/deploy/browser yok.

Durum: `FX2-17 → FX2-18`, blokaj yok.

## FX2-18 — Tamamlandı (2026-09-07)

`SeyFx.sweepCounters()` kalıcı sayaç anahtarlarıyla ilk boyamayı animasyonsuz
kaydeder; `app.innerHTML` yeniden kurulduğunda önceki değeri koruyup yalnız
hedef değişiminde `countUp` çalıştırır. Reduced-motion hedef değeri doğrudan
yazar. `app.js` içinde beslenme, motivasyon, terapi ve hero/ritim yüzeylerine
10 kaynak satırında `data-countup` bağlandı; `App.waterAdd` içindeki manuel
çağrı kaldırıldı.

`ringSeg(cx,cy,R,C,color,startFrac,lenFrac,w)` imzası korunarak ürettiği
circle'a `sey-ring-seg` eklendi; stroke-dashoffset geçişi tokenlı ve
reduced-motion altında kapalıdır. Cache sürümleri CSS/app `20260907d`,
mediaFx `20260907c`. Dar `test_premium_fx_utils.js` fixture'ı API, ilk boyama,
yeni DOM düğümünde değer değişimi, tekrar etmeme ve reduced-motion davranışını
35/35 ile kilitler.

Kanıt: syntax, driver + `--dump bugun`, zikir 95/95, app 34/34, panel 23/23,
Panel-v2 27/27, Kur'an 9/9, reminder ve B1/B2/B3 PASS. Salt-okunur kapsam
M5 **1 → 10 ≥ 8**; `coverage.json` yazılmadı. `App.*=718`, `onclick=391`,
manuel `SeyFx.countUp`=0; ringSeg/progBar imzaları aynı. Browser/server,
network, push/deploy yok.

Durum: `FX2-18 → FX2-19`, blokaj yok; Dalga 4 kapandı.

---

## FX2-19 — Tamamlandı (2026-09-07)

`app/core/timeTheme.js` sonuna **`SeyAmbience`** eklendi (saf sahne hesaplayıcı;
`SeyTimeTheme`'in dört fonksiyonuna dokunulmadı — I2). `weatherClass(code)` WMO
kodunu 7 eşleme ile 8 hava sahnesine (`amb-wx-clear/cloud/fog/drizzle/rain/
snow/storm/none`) çevirir; `intensity(s)` yağış (0–8 mm) + rüzgârdan (0–40
km/s) 0,15–1 aralığında şiddet türetir; `seed(d)` günün tarihinden türeyen
deterministik 0–1 döndürür (gün içinde sabit, gün gün değişir); `scene(now,spot)`
üç katmanlı sahne nesnesi üretir (`time` şimdilik `amb-time-day` — FX2-20 gerçek
değeri koyacak, `season` boş — FX2-22 dolduracak); `apply()` bilinçli olarak
`false` döndürür (FX2-20'de gerçek gövde gelir). **Bu kart bilinçli görsel
değişiklik üretmez.** Canlı veri `data.weather.spots[0]` üzerinden `wx()` ile
okunur — yeni ağ çağrısı yok. `fetch(` = 0, `setInterval` = 0.

`app.js` **hiç açılmadı**. Cache: `timeTheme.js?v=20260906a` → `20260906b`.
Kanıt: `node --check` PASS; saf fonksiyon testi — `weatherClass(0)=amb-wx-clear`,
`63=amb-wx-rain`, `75=amb-wx-snow`, `95=amb-wx-storm`, `null=amb-wx-none`;
`intensity({precip:4,wind:20})=0.50`; `seed` deterministik `true`; `apply()=false`.
Driver 0 FAIL; `test_premium_time_theme.js` 53/53; tüm `tests/app/*.js` PASS.
Kapsam M12 hâlâ 0 (beklenen — S8 ihlali değil, `apply()` kasıtlı inert).
Browser/server, network, push/deploy, coverage.json yazımı yok.

Durum: `FX2-19 → FX2-20`, blokaj yok; Dalga 5 açıldı.

---

## FX2-20 — Tamamlandı (2026-09-07)

`SeyAmbience`'in `apply()`'i artık inert değil — gerçek gövdeyle canlı
zemin boyanıyor. `timeTheme.js` içine `timeClass(now,spot)` eklendi: gerçek
`sunrise/sunset` (45 dk öncesi dawn, +75 dk sonrasına kadar; gün +75 dk - gün
batımından 90 dk; gün batımından 90 dk önce - +45 dk sonra dusk; aksi night).
`sunrise/sunset` yoksa veya bozuksa `SeyTimeTheme.classForHour()`'a düşer
(fallback — asla kırılmaz). `scene()`'in `time` alanı artık
`this.timeClass(now, spot)` — FX2-19'daki sabit `amb-time-day` gitti.

`apply(now)`: `#root` bulunamazsa `false`; premium kapalıysa tüm `amb-*`
sınıflarını temizleyip `false` (katman söner). Premium açıkken `scene(now)`'ı
okur, `sc.time/weather/season` sınıflarını takar ve `--wx-intensity` (0.00–1.00),
`--amb-seed` (0.000–1.000), `--wx-dim` (isDay ? 1 : 0.72) değişkenlerini #root'a
yazar, `true` döner. **`setInterval` eklenmedi** — `render()` 30 sn'lik poll'da
`paint()`'i çağırır, sahne kendiliğinden tazelenir.

`app.js` `paint()` içindeki `SeyTimeTheme.apply()` guard'ının **hemen altına**
tek (1) satır `SeyAmbience.apply()` guard'ı eklendi. `SeyTimeTheme.apply()`
**silinmedi** — `theme-aurora` sınıfını o yönetiyor (FX2-25 ona bağlı).

`app/styles.css`: FX2-18 ringSeg bloğundan sonra canlı zemin zaman katmanı
(4 `amb-time-*` × 2 tema). `--page` değişkenini sahne ezer; geçiş
`background var(--dur-5) var(--ease-glide)` crossfade; reduced-motion'da
`transition:none`. Ton kayması bilinçli çok ince tutuldu.

Cache: `timeTheme.js?v=20260906b→c`, `styles.css?v=20260907d→e`,
`app.js?v=20260907d→e`.

Kanıt: `node --check` iki dosya PASS; grep — timeClass 2, classForHour 5
(fallback korundu), `amb-time-` CSS 10, `SeyAmbience` app.js **1** (tek guard),
setInterval 0. Fallback testi: veri yokken `amb-time-dusk` (sabit 17–20), veri
varken `amb-time-dusk` (gerçek 17:20 → 15:50'den dusk) — ikisi de `undefined`
değil. apply: premium kapalı `false` + `amb-*` temizleniyor (yalnız
`theme-time-day` kalır); premium açık 12:00'de `amb-time-day amb-wx-rain`,
intensity 0.50, seed 0.860, wx-dim 1. Driver 0 FAIL; `test_premium_time_theme`
53/53; `test_fx2_palette_contrast` 12/12; tüm `tests/app/*.js` PASS. Kapsam
**M12 0 → 4 ≥ 4** (hedef karşılandı; 18 seri kapanış kapısıdır, FX2-22/23'e
ait). Push/deploy/browser/server/network/coverage.json yok. Guard `paint()`
içinde (9051 satır) doğrulandı; `App.*` yüzeyine dokunulmadı.

Durum: `FX2-20 → FX2-21`, blokaj yok.

---

## FX2-21 — Tamamlandı (2026-09-07) · Hava Modu: WMO → 8 Sahne

İlk önce FX2-19'un `SeyAmbience.weatherClass()` mantığını görünür kıldık;
veri `data.weather.spots[0].code` üzerinden **zaten canlı** (yeni ağ çağrısı
yok). `app.js` bu kartta **hiç açılmadı**.

- **CSS (`styles.css`):** FX2-20 reduce bloğundan sonra 8 hava sahnesi; hepsi
  `#sey-aurora::after` üzerinde yaşar — **yeni DOM düğümü YOK**, zemin
  gradientini EZMEZ, üstüne **≤0,09 opaklıkla** biner (kontrast korunur):
  - `clear` (ışık huzmesi) · `cloud` (ambDrift) · `fog` (süt beyazı) ·
    `drizzle`+`rain` (dikey çizgiler; rain daha güçlü) · `snow` (iri mavi-beyaz
    desen) · `storm` (koyulaşma + 41 sn aralıklı şimşek) · `none` (kapalı)
  - Şiddet `--wx-intensity`'den (`max(var(--wx-intensity),…)`), gece koyulaşması
    `--wx-dim`'den; 4 keyframe `ambDrift/ambRain/ambSnow/ambFlash`
  - reduced-motion → renk kalır sadece animasyon durur
- **Batarya (`timeTheme.js`):** FX2-19 bloğuna `visibilitychange` listener →
  `#root.amb-paused` toggle; sekme arka plandayken hava animasyonları duraklar.
  Yalnız `document.addEventListener` varsa bağlanır — headless harneşlerde
  `document=null` olabileceği için sessizce geçer (53/53 korundu).
- **Cache bump (`index.html`):** styles `20260907e→f`, timeTheme `20260906c→d`.

**Kanıt:** syntax PASS; `amb-wx-` 9, 8 sahnenin hepsi ≥1, 4 `@keyframes amb*`,
`amb-paused` = 3 (styles 1 + timeTheme 2), opacity max `.09`. WMO testi:
`0→clear`, `3→cloud`, `45→fog`, `53→drizzle`, `63→rain`, `75→snow`,
`95→storm`, `null→none` — hepsi doğru. Driver 0 FAIL; `test_premium_time_theme`
53/53; `test_fx2_palette_contrast` 12/12; tüm `tests/app/*.js` PASS.
**M12 4 → 12 ≥ 12** (4 zaman + 8 hava; 18 seri kapanış kapısı, FX2-22 season
+6 ile dolar). Push/deploy/browser/server/network/coverage.json yok.

Durum: `FX2-21 → FX2-22`, blokaj yok.

---

## FX2-22 — Tamamlandı (2026-09-07) · Mevsim Katmanı + Günlük Varyasyon

`SeyAmbience.seasonClass(now)` eklendi → 6 `amb-season-*` sahnesi (spring/
summer/autumn/winter + ramazan + newyear); `SeyTimeTheme.seasonalClass`'a
**dokunulmadı (I2)** — ayrı ad alanı. `scene().season` artık
`this.seasonClass(now)` ile dolar. CSS'e 6 `--season-accent` tonu (2 tema,
toplam ~12 kural) + iki kalıcı yüzeyin (`--elev-3`) kenar ışığı; mevsim
**yalnız** `--season-accent` yazar, zemine/dokuya/metne karışmaz. `--amb-seed`
gradient açısını `--amb-angle` (170° ± 8°) ile kaydırır — gün içinde sabit,
gün gün değişir. Zaman gradientleri `170deg` → `var(--amb-angle)`.

**Kombinasyon:** 4 zaman × 8 hava × 6 mevsim = **192** (hedef ≥ 150).

**Kanıt:** syntax PASS; `amb-season-` styles 14 (≥12), `seasonClass` timeTheme
3 (≥2), `seasonalClass` korundu 4 (I2), `amb-angle` styles 8 (≥5). Driver
0 FAIL; `test_premium_time_theme` 53/53; `test_fx2_palette_contrast` 12/12;
tüm `tests/app/*.js` PASS. **M12 12 → 18 ≥ 18** (seri kapanış kapısı FX2-23'te
sağlanacak). Cache: styles `20260907f→g`, timeTheme `20260906d→20260907a`.
Push/deploy/browser/server/network/coverage.json yok.

Durum: `FX2-22 → FX2-23`, blokaj yok.

---

## FX2-23 — Tamamlandı (2026-09-08) · Canlı Zemin Fixture'ı (Dalga 5 kapanışı)

Yeni ağsız `tests/app/test_fx2_ambience.js` (14 grup) — **Dalga 5'in kapanış
kanıtı**. Uygulama dosyasına **hiç dokunulmadı** (kartın DOKUNULMAYACAK
koşulu karşılandı; `git status` uygulama temiz).

- **Yöntem:** GERÇEK `app/core/timeTheme.js`'i `node:vm` ile sahte
  `window`/`document` üzerinde yükler; `app/styles.css`'i metin olarak okur.
  `makeRoot()` sahte root'u `className`/`classList`/`style` senkron tutar;
  `blocksForSelector()` CSS kural bloklarını (selector + body) ayıklar.
- **14 grup:** (1) WMO eşlemesi tam — 8 sahne + bilinmeyen/null → `none`;
  (2) şiddet sınırları 0.15≤x≤1, uçlar doğru (`{0,0}→0.15`, `{99,99}→1`,
  `null→0.35`, `{4,20}→0.5`); (3) seed determinizmi — aynı gün aynı, farklı
  gün farklı, 100 gün 0≤s<1; (4) güneş saati 4 dilimin hepsi üretilebiliyor
  (sunrise 06:00/sunset 18:00 → dawn/day/dusk/night); (5) fallback spot=null
  yine geçerli `amb-time-*`; (6) fallback `SeyTimeTheme.classForHour` ile
  eşleşiyor; (7) apply() gating — premium kapalı → tüm `amb-*` silinir + `false`;
  (8) apply() yazımı — premium açık → 3 katman + 3 değişken
  (`--wx-intensity`/`--amb-seed`/`--wx-dim`); (9) **katman ayrımı (KRİTİK)** —
  üç katman aynı özelliği yazmıyor (time: `--page`/`--amb-angle`/transition,
  wx: yalnız `#sey-aurora::after` üzerinde opacity/background/animation,
  season: `--season-accent`/box-shadow); (10) opaklık tavanı — hiçbir
  `amb-wx-*` > 0.09; (11) DOM parçacığı yok — yağmur/kar gradient,
  `createElement`=0; (12) reduced-motion `animation:none!important`;
  (13) batarya — `setInterval`=0, `visibilitychange`, `amb-paused`;
  (14) kontrast M13 — 4 zaman × 2 tema = 8 çift ≥ 4.5:1, duraklar CSS'ten
  okunur (sabitlenmez).

**Kanıt:** fixture **14/14 PASS**; `test_fx2_palette_contrast` 12/12;
`test_premium_time_theme` 53/53; tüm `tests/app/*.js` **35/35 PASS**;
`git status` uygulama temiz. **M12 18 ≥ 18 ✅, M13 8 = 8 ✅** — Dalga 5
kapanış kapıları sağlandı. M7 (0.55, hedef ≥0.80) ve M8 (2, hedef 0) bilinçli
olarak sonraki dalgalara ertelendi (Dalga 6/7). Push/deploy/browser/server/
network/coverage.json yok.

Durum: `FX2-23 → FX2-24`, blokaj yok; **Dalga 5 kapandı.**

---

## FX2-24 — Tamamlandı (2026-09-08) · Elevation Skalası + 13 Animasyon Token'ı (Dalga 6 açılışı)

**Kullanıcı kararı (AskUserQuestion):** Kartın M7 ≥ 0.80 hedefi, kartın
adımlarıyla matematiksel olarak ulaşılamazdı — elevation box-shadow'ları M7'yi
hiç etkilemez, mevcut uyumlu `.surface` transition'ı değiştirmek sayıyı
değiştirmez, 13 gerçek animasyonun tamamı token'a çevrilse bile maks **0.62**
(120/195) olurdu; 0.80 için 49 bildirim daha gerekirdi ve tek kaynak 75
`none!important` bildirimiydi (temel reduced-motion yeniden yapılanması
gerektirir). Kullanıcı **"Elevation + 13 dönüşüm"**ü seçti; kart hedefi 0.62'ye
güncellendi (kart DOĞRULAMA'sına işlendi).

`app/styles.css` (yalnız; `app.js` DOKUNULMAYACAK karşılandı):

- **(1) Elevation token'ları.** Kartın Adım 1 tablosundaki `.card`/`.bento`/
  `.field` sınıfları gerçekte **yok** — gerçek yüzeylere eşlendi:
  `.surface`→`--elev-2`, `.sey-appheader`/`.sey-bottomnav-surface`→`--elev-3`
  (inset vurgular korunarak birleştirildi), `.qibla-v2-sheet`/`.quran-v2-screen`
  →`--elev-4`, `.aeon-input-field`/`.sey-auth-field input`→`--elev-1`.
  **Gap-fix (doğrulama sonrası):** koyu tema override'ları da token'a çevrildi —
  `#root[data-theme="dark"] .sey-appheader`/`.is-scrolled`/`.sey-bottomnav-surface`
  (555/557/562) `box-shadow:0 …` yerine `var(--elev-3)` kullanıyor; böylece
  elevation skalası koyu temada da gerçekten uygulanıyor (özgüllük artık token'ı
  ezmiyor). Reminder ekranı (1467/1577) bilinçli negatif-ofset bottom-sheet
  gölgesi ve kartın overlay listesinde olmadığı için kapsam dışı bırakıldı;
  `--zikr-shadow`/`--reminder-shadow` temalı gölgeler elevation değil.
- **(2) Zaman/mevsim vurguları birleştirildi (silinmedi).** `theme-time-*`
  appheader+bottomnav accent kurallarına `var(--elev-3),` öneki eklendi;
  `theme-season-*` appheader+bottomnav accent kurallarına da eklendi.
  `amb-season-*` box-shadow kurallarına **dokunulmadı** (FX2-22'den zaten
  `--elev-3` kullanıyor).
- **(3) Hover derinliği.** `.surface` transition `var(--dur-2) var(--ease-out)`,
  hover `box-shadow:var(--elev-3)`; mevcut reduced-motion bloğu korundu;
  `surface:active` 0, will-change 5 (artmadı).
- **(4) 13 gerçek animasyon token'a çevrildi.** `--ease-linear` token'ı eklendi
  (yoktu; koyu tema miras alır). seyRoomSheen/seySpin/seyWordSheen/seyQuranSpin/
  zikrOrbit/sey-ripple-spread/ambRain/ambSnow→`var(--ease-linear)`,
  ambDrift→`var(--ease-glide)`, qibla needle transition→`var(--ease-linear)`,
  sg-faith-next-bar width→`var(--ease-out)`.

Cache: `styles.css?v=20260907g→20260908a`.

**Kanıt:** **M7 0.55 → 0.62** (120/195, kullanıcı onaylı hedef); `var(--elev-`
**18** (≥12), `surface:active` **0**, will-change **5** (artmadı). Driver 0 FAIL;
`test_fx2_palette_contrast` 12/12; `test_fx2_ambience` 14/14; tüm FX2+premium
fixture'ları PASS; B1 boundary 64/27/59/31 PASS; CSS brace dengeli.
Push/deploy/browser/server/network/coverage.json yok.

Durum: `FX2-24 → FX2-25`, blokaj yok; **Dalga 6 açıldı.**

---

## FX2-25 — Tamamlandı (2026-09-08) · Aurora v2 (parallax + grain) (Dalga 6 kapanışı)

`app/core/mediaFx.js` + `app.js` (tek satır) + `app/styles.css` + `index.html`:

- **(1) Parallax bağlayıcı** — `SeyFx.bindAuroraParallax` (mediaFx.js, SeyFx
  nesnesine eklendi). `isPremiumFxEnabled()` gating'i: premium kapalı veya
  reduced-motion → dinleyici hiç bağlanmaz. `[data-scroll]`'a `auroraBound`
  dataset bayrağıyla **idempotent**; render() her seferinde yeni `[data-scroll]`
  ürettiği için yeniden bağlanır, eskisi çöpe gider (sızıntı yok). Hareket
  `Math.max(-24, Math.min(24, scrollTop * -0.04))` → **≤ ±24 px**, `ticking`
  bayrağıyla `requestAnimationFrame` throttle'lı, `{passive:true}`.
- **(2) app.js bağlantısı** — `paint()` içinde `SeyAmbience.apply()` guard'ının
  hemen yanına tek satır: `try{ if(window.SeyFx && typeof window.SeyFx.bindAuroraParallax==='function') window.SeyFx.bindAuroraParallax(); }catch(e){}`.
- **(3) Grain** — `#sey-aurora::before` (yeni DOM düğümü YOK), data-URI
  feTurbulence SVG **< 400 bayt** (blok 420 bayt), `opacity:.035`,
  `mix-blend-mode:overlay`; koyu tema `opacity:.055`. `::after` hava katmanına
  (FX2-21) **dokunulmadı** — grain `::before`'da, çakışma yok.
- **(4) Aurora halkaları** — zaten altın ailesinde: `var(--accent)` (altın),
  `var(--room2,#8E7CC3)` (mor, kontrast için korunur), `var(--accent-ink,#886738)`
  (koyu altın). `#D96D8B` yok (0) — FX2-04 kaldırmıştı, doğrulandı. Değişiklik
  gerekmedi.
- **(5) Reduced-motion uzlaşması (kart niyeti).** Kart "grain kalır, parallax
  gider" diyor; mevcut 1663 kuralı `#sey-aurora`'yı `opacity:0!important` ile
  tamamen gizliyordu (grain de görünmez olurdu). Kural `transform:none!important`
  olarak değiştirildi → aurora statik ama görünür (grain açık), parallax kapalı.
  `test_premium_reduced_motion` 34/34 ve `test_fx2_ambience` 14/14 bu değişikliği
  onayladı (yalnız `::after`'ın `animation:none!important`'ını iddia ediyorlar).
- **(6) Gap-fix: parallax `transform` yerine `translate` kullanır (kritik).**
  "Tam ve kusursuz" doğrulaması sırasında bulundu: `seyAurora` animasyonu
  `transform`'u sonsuz döngüyle eziyor (CSS animasyonları inline stili
  bastırır) → `au.style.transform` ile yazılan parallax **ölü koddur**. Çözüm:
  `au.style.translate = '0 ' + y + 'px'` — CSS Transforms spec'e göre
  `translate` → `rotate` → `scale` → `transform` sırasıyla uygulanır, yani
  `translate` ayrı bir özellik olduğu için `seyAurora`'nun `transform`'uyla
  **BİLEŞİR** ve parallax gerçekten çalışır. styles.css 1661 `will-change`'e
  `translate` eklendi (5'te kaldı); 1663 + kartın reduced-motion kuralına
  `translate:none!important` eklendi. Regresyon: `test_premium_fx_utils.js`
  Test 9 (12 iddia) — fonksiyon var, premium kapalı → false + dinleyici yok,
  öğe yok → false, bağlanınca true + `auroraBound`, scroll → `translate` set
  (transform DEĞİŞMEZ), ±24 clamp, idempotent, reduced-motion → false.
  Fixture 48/48 geçti.

Cache: `styles.css?v=20260908a→b`, `mediaFx.js?v=20260907c→20260908a`,
`app.js?v=20260907e→20260908a`.

**Kanıt:** `node --check` app.js+mediaFx.js OK; `bindAuroraParallax` app.js 1 /
mediaFx.js 1; `auroraBound` 3 (idempotans); `feTurbulence` 1; will-change **5**
(artmadı); grain bloğu 420 bayt (<900). Driver 0 FAIL; reduced_motion 34/34;
ambience 14/14; `test_premium_fx_utils` **48/48** (Test 9 parallax regresyonu
dahil); tüm `tests/app/*.js` PASS; panel/quran/panel-v2/reminder PASS.
**M7 0.62** (kullanıcı onaylı hedef — kartın literal 0.80 kapısı FX2-24'teki
ulaşılamaz hedefin aynısı; FX2-25 yeni transition/animation bildirimi eklemiyor).
Push/deploy/browser/server/network/coverage.json yok.

Durum: `FX2-25 → FX2-26`, blokaj yok; **Dalga 6 kapandı, Dalga 7 açıldı.**

---

## Bu Turda Eklenenler (2026-09-06, ikinci oturum)

**1. Kartlar yeniden numaralandı ve yeniden yazıldı.** 21 kart (gap'li
`FX2-P-01/02/11/…`) → **28 kart, kesintisiz `FX2-01…28`**. Yeni format:
her kart **tek başına yeterli** — uygulamak için başka belge okumak gerekmez;
kopyala-uygula kod blokları, kesin `grep` çapaları, beklenen çıktılı doğrulama.

**2. Renk kimliği dalgası eklendi (Dalga 1, FX2-03…05).**
Kullanıcı kararı: pembe (`#C77D93`/`#FFB1CF`) → **Şampanya Altını + Füme**
(`#B08D57` / `#8A6A3B` / koyu `#E3C08A`), `--gold-1..5` merdiveni.
Gerekçe: ÆON `#C99A3A`, nav `#A4824C`, zikir `#D8B968`, Saygı altını zaten
hâkim; **pembe paletteki tek yabancıydı.** Palet 5 aileden 2'ye iner.
Pembe tamamen token seviyesinde (11 hex) → düşük risk, yüksek etki.
Dokunulmayan: `--kandil` (dinî), `--warn`, `--read`/`--watch`/`--listen`, `--sun`.

**3. Canlı zemin dalgası eklendi (Dalga 5, FX2-19…23).**
Kullanıcının "vardı, kayboldu" dediği iş. FX-1 `PLAN.md` §4.4 "hava modu"nu
*"gelecekte hava API'si varsa"* diye ertelemiş, FX-P-88 bloklu kalmıştı.

> **O gerekçe geçersiz:** `data.weather.spots[0]` (`code`, `isDay`, `precip`,
> `sunrise`, `sunset`, `uv`, `wind`) **zaten canlı ve kayıtlı**.
> Canlı zemin için **tek bir yeni ağ çağrısı bile gerekmiyor.**

`SeyAmbience` üç katmanlı sahne yazar:
`amb-time-*` (4, **gerçek güneş saatiyle** — sabit saat aralığı değil) ×
`amb-wx-*` (8, WMO kodundan) × `amb-season-*` (6) = **192 kombinasyon**.
Artı `--amb-seed`: günün tarihinden deterministik, gradient açısını ±8°
kaydırır (gün içinde sabit). Sıkılma problemi böyle çözülür.
Çitler: DOM parçacığı yok, opaklık ≤ 0,09, `setInterval` yok,
reduced-motion'da renk kalır hareket durur, kontrast 8/8 fixture'lı.

**4. Yeni belge:** [`../RENK-VE-ZEMIN.md`](../RENK-VE-ZEMIN.md) —
renk kararı + canlı zemin sözleşmesi.

---

## Sıradaki Oturum İçin

1. Oku: [`../TESHIS.md`](../TESHIS.md) → [`../PLAN-FX2.md`](../PLAN-FX2.md)
   → [`FX2-STATE.json`](FX2-STATE.json)
2. Kart: [`../.prompts/FX2-26.md`](../.prompts/FX2-26.md)
3. Sözleşme: S1–S8 (`PLAN-FX2.md` §3) · Değişmezler: I1–I8 (§2)
4. **S8 kuralı:** her kart kendi hedef metriğini canlı ölçümle yükseltmelidir.

---

## Engeller / Bekleyenler

- **Push/merge/deploy:** kullanıcı onayı bekliyor (LOCAL-ONLY)
- **Cihaz kabulü (K3):** iPhone'da ses/basma doğrulaması yalnız kullanıcıdan
- **FX-1 ertelenmiş kartlar (FX-P-66/67):** FX-2 kapsamına **alınmadı**
- **FX-P-88 (hava modu):** FX-1'de bloklu kalmıştı; FX-2 kapsamı dışında
- **`panel.html` / `panel-v2.html`:** bu seride kapsam dışı

---

## FX-1 Arşivi

Tarihsel kayıt korunuyor:
- [`../deliverables/FX-SERI-KAPANIS-BELGESI.md`](../deliverables/FX-SERI-KAPANIS-BELGESI.md)
- [`FX-PROMPT-STATE.json`](FX-PROMPT-STATE.json) (kapalı seri)
- [`LEDGER.md`](LEDGER.md) (append-only, seq 1–70 FX-1)
- [`../arsiv/FX1-OZET.md`](../arsiv/FX1-OZET.md) (ne yapıldı / ne tutmadı)

`monolit-bolumlenme-plan/` bu dosyaların bazılarına atıf yapar — **silinmezler.**
