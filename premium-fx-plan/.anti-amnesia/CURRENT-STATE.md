# Premium FX — Güncel Durum

**Tarih:** 2026-09-07
**Seri:** **FX-2 — "Hissedilir Premium"** (yeni seri açıldı)
**Dal:** `premium-fx-gorsel-yuzey` · **LOCAL ONLY** (push/merge/deploy yok)
**Plan sürümü:** FX-2 v2.0 (28 kart, 8 dalga)

---

## Şu An Neredeyiz

| | |
|---|---|
| Son tamamlanan prompt | **FX2-04** — altın aile birleştirme |
| Sıradaki prompt | **FX2-05** — kontrast ve doğrulama |
| Aşama | Dalga 1 — Renk Kimliği |
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
2. Kart: [`../.prompts/FX2-05.md`](../.prompts/FX2-05.md)
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
