# Premium FX — Güncel Durum

**Tarih:** 2026-09-07
**Seri:** **FX-2 — "Hissedilir Premium"** (yeni seri açıldı)
**Dal:** `premium-fx-gorsel-yuzey` · **LOCAL ONLY** (push/merge/deploy yok)
**Plan sürümü:** FX-2 v2.0 (28 kart, 8 dalga)

---

## Şu An Neredeyiz

| | |
|---|---|
| Son tamamlanan prompt | **FX2-10** — dokunma kapsamı fixture'ı |
| Sıradaki prompt | **FX2-11** — ses motoru v2 (bus / reverb / limiter) |
| Aşama | Dalga 3 — Ses Kimliği |
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
2. Kart: [`../.prompts/FX2-11.md`](../.prompts/FX2-11.md)
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
