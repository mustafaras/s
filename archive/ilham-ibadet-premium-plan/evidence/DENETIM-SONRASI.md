# IIP denetim sonrası durum — P17 karşılaştırma raporu

**Ölçüm:** 2026-09-22 · **Baseline HEAD:** `8ba784e` · **Yöntem:** her fixture tek tek, gerçek exit kodu.

## Özet — önce / sonra

| Aile | ÖNCE (P00) | SONRA (P17) | Durum |
|---|---|---|---|
| `tests/app` | 60 PASS / **13 FAIL** | **73 PASS / 0 FAIL** | ✅ |
| `tests/panel` | 23 / 0 | 23 / 0 | ✅ |
| `tests/panel-v2` | 27 / 0 | 27 / 0 | ✅ |
| `tests/quran` | 8 / **1** | **9 / 0** | ✅ |
| `tests/reminders` | 1 / 0 | 1 / 0 | ✅ |
| plan araçları | 0 / **3** | **3 / 0** | ✅ |
| harness (`driver`, `zikr`, `shell-gate`) | 3 / 0 | 3 / 0 | ✅ |
| **TOPLAM** | **123 / 16** | **139 / 0** | ✅ |

## Kapatılan 16 kusur

| # | Kusur | Çözüm | Prompt |
|---|---|---|---|
| 1 | `test_app_surface_boot_boundary` bayat pin | appSurface `b`→`c` (gerekçeli) | P01 |
| 2 | `test_app_surface_domain_boundary` bayat pin | appSurface `b`→`c` | P01 |
| 3 | `test_app_surface_lifecycle_boundary` bayat pin | appSurface `b`→`c` | P01 |
| 4 | `test_app_surface_overlay_boundary` bayat pin | appSurface `b`→`c` | P01 |
| 5 | `test_header_celestial_timeline` bayat pin | styles.css `f`→`a` | P01 |
| 6 | `test_header_night_contrast` bayat pin | styles.css `f`→`a` | P01 |
| 7 | `test_v3_welcome` bayat pin | appSurface `b`→`c` | P01 |
| 8 | `test_iip_03` bayat payda pini | panel "payda bilinmiyor" kontratı | P04 |
| 9 | `test_iip_05` `==` yanlış-pozitifi | regex `=(?!=)` | P07 |
| 10 | `test_iip_06` `==` yanlış-pozitifi | regex `=(?!=)` | P07 |
| 11 | `test_iip_09` `==` yanlış-pozitifi | regex `=(?!=)` | P07 |
| 12 | `test_iip_12` — **gerçek kusur** | `iip21Root` okuma/yazma ayrımı | P06 |
| 13 | `test_iip_13` `==` yanlış-pozitifi | regex `=(?!=)` | P02 |
| 14 | `test_quran_striking_verses` bayat catalogVersion | v1→v2 (IIP-17 onaylı içerik) | P05 |
| 15 | `plan-check.mjs --self-test` yapısal bozuk | gate örtüşmesi dosya adından; senaryolar öz-yeterli | P11 |
| 16 | `plan-check.integration.py` `FileExistsError` | temiz fixture + 24/24 baseline uyumu | P12 |

## Gerçek davranış düzeltmesi (tek üretim kodu değişikliği)

`app/core/saygi.js` — `iip21Root()` okuma yolunda `data.programs` **oluşturuyordu** (IIP-21,
commit `de59f03`); bu IIP-12'nin "render data'yı mutasyona uğratmaz" kontratını bozuyordu.

```js
// ÖNCE (tek fonksiyon, okuma yolunda yazıyordu)
function iip21Root(){ var d=stateData(); if(!d)return null;
  if(!d.programs||...)d.programs={...}; ... return d.programs; }

// SONRA (ayrıldı)
function iip21Root(){ ... eksik/yetim yapıda null döner (dürüst boş hâl), YAZMAZ }
function iip21WriteRoot(){ ... yalnız iip21Apply (kullanıcı eylemi) içinde oluşturur }
```

Doğrulama: `test_iip_12` **92/92**, `test_iip_20`/`test_iip_21`/`test_saygi_boundary` PASS
(yolculuk özelliği bozulmadı). Kapsam kısıtına uyuldu: **yeni `App.*` üyesi eklenmedi.**

Cache-bust (kök kural 5): `index.html` → `app/core/saygi.js?v=20260922b` → **`20260922c`**.
Hiçbir fixture `saygi.js` sürümünü pinlemiyor (yalnız sıralama kontrolü); bump sonrası hepsi yeşil.

## Kanıt disiplini (pinler körlemesine yenilenmedi)

Her pin güncellemesi `git show <commit> --stat` ile doğrulandı:

| Pin | Commit | Kanıt |
|---|---|---|
| appSurface `b`→`c` | `9a2674a` | `app/core/appSurface.js \| 44 ++++---` gerçekten değişti |
| styles.css `f`→`a` | `3df00c8` | `app/styles.css \| 14 +++---` gerçekten değişti |
| catalogVersion v1→v2 | `0ecc2cb` | IIP-17 "add approved Latin readings" — onaylı içerik adımı |
| panel payda | `panel/panel.js:622` | `max:null, rate:null, denominatorReliable:false` — bilinçli bastırma |

Mutasyon testleriyle bekçilerin **gerçekten çalıştığı** kanıtlandı: `App.<ad>=` ataması
eklenince `test_iip_05/06/09/13` → exit 1; geri alınınca → exit 0.

## Bilinen sınırlar — KAPATILMADI (kullanıcı/ayrı yetki)

| # | Konu | Durum | Neden |
|---|---|---|---|
| A | Cihaz kabulü | `deviceAcceptance=not_verified` | Kök kural: cihaz onayını yalnız kullanıcı verir. Ajan kendi başına teyit edemez. (P10) |
| B | p50/p95 performans | **ölçülmedi** | p95 ≤200 ms hedefi; yerel VM ölçümü cihaz hızı kanıtı değildir. (P14) |
| C | Önleyici kapı (FIXTURE-MAP) | **yok** | "aynı dosyaya yazan kart, önceki fixture'ları koşar" kuralı henüz otomatik değil. (P13) |
| D | Kanıt makbuzu revizyonu | kısmi | `evidence/IIP-12|13/source.json` komut kayıtları bugünkü gerçekle tam uzlaştırılmadı; kartlar artık geçtiği için gate'ler yeşil. (P08) |
| E | `DUZELTME-PROMPTLARI.md` §0 güncelliği | güncel değil | Baseline §0 hâlâ eski sayıları (60/13) taşıyor; bu dosya yeni durumu kaydeder. |

## Yayın adayı beyanı — DÜRÜST seviye ayrımı

| Seviye | Durum |
|---|---|
| 1 · Kaynak/sentetik (ağsız VM) | ✅ **Tamam** — 139/139 PASS, üç plan aracı exit 0 |
| 2 · Yerel görsel QA (127.0.0.1:9000) | ⬜ Yapılmadı (istenmedi) |
| 3 · Cihaz (Safari/PWA, klavye, sensör) | ⬜ **Kullanıcı teyidi yok** |
| 4 · Yayın (build/deploy) | ⬜ Bu turda yapılmadı |

**Sonuç:** IIP programı **seviye 1** için artık gerçekten yeşil. Seviye 3-4 için kullanıcı
onayı gerekir; bu belge onları beyan etmez.
