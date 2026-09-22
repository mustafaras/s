# IIP — İlham & İbadet Premium · KAPANIŞ BELGESİ

**Kapanış tarihi:** 2026-09-22 · **Kapanış HEAD:** `1e1e172` · **Durum:** ✅ KAPANDI
**Program:** 24 kart + 18 düzeltme promptu (P00–P17) · **Kalan iş: YOK**

---

## 1. Neden kapandı

İki program birlikte yürütüldü ve ikisi de tamamlandı:

| Program | Kapsam | Sonuç |
|---|---|---|
| **IIP-01…IIP-24** (24 kart) | Hub yenileme: görsel/kabul, mimari/okuyucu/vakit, kalıcılık/offline/teslim | 24/24 done |
| **P00–P17** (18 prompt) | Denetimde bulunan 16 kusur sınıfının kapatılması | 18/18 kapandı |

Kalan prompt **yoktur**. `IIP-STATE.json` → `nextExecutableCard: null`,
`completedCards: 24/24`, tüm kartlar `done`.

---

## 2. Ölçülen sonuç

| Aile | Denetim öncesi | Kapanış |
|---|---|---|
| `tests/app` | 60 PASS / **13 FAIL** | **73 / 0** |
| `tests/quran` | 8 / **1** | **9 / 0** |
| `tests/panel` · `tests/panel-v2` | 23 · 27 | 23 · 27 |
| `plan-check.mjs` | **exit 1** | **exit 0** |
| `plan-check.mjs --self-test` | **exit 1** | **exit 0** (15 senaryo) |
| `plan-check.integration.py` | **exit 1** | **exit 0** (4 PASS) |
| `evidence-reconcile.mjs` | — | 16 makbuz / 166 komut / **0 drift** |
| **TOPLAM** | **123 / 16 FAIL** | **154 / 0 FAIL** |

---

## 3. Kapatılan gerçek kusurlar (hepsi kanıtla)

| # | Kusur | Kök neden | Düzeltme |
|---|---|---|---|
| 1 | `iip21Root()` okuma yolunda veri yazıyordu | IIP-21 (`de59f03`) render'da `data.programs` oluşturuyordu | Okuma/yazma ayrıldı (`iip21WriteRoot`) |
| 2 | **Kardeş-kart regresyonu** — 13 fixture sessizce kırıldı | Aynı dosyaya yazan kart, önceki kartların fixture'larını koşmuyordu | **P13 kapısı**: `FIXTURE-MAP.json` + `plan-check` doğrulaması |
| 3 | 7 bayat cache-bust pini | `index.html` doğruydu, test pinleri kalmıştı | `git show` ile meşruluk kanıtlandı, gerekçeli güncellendi |
| 4 | 4 fixture'da `==` yanlış-pozitifi | `App\.[…]\s*=` regex'i `==`'in ilk `=`'ini yakalıyordu | `=(?!=)`; **mutasyon testiyle** doğrulandı |
| 5 | IIP-03 panel payda bekçisi bayat | Panel sahte oranı bırakmıştı | Negatif kontrole çevrildi |
| 6 | IIP-14/15 snapshot pin bayat | IIP-20/21 üç root alanı ekledi | `--print-hash` üreticisi + kanonik değerler |
| 7 | IIP-22'de **çalıştırılamaz komut** | `node -e index-inline-script-syntax-check` → `ReferenceError` | Gerçek kontrol: `tools/check-index-inline-scripts.cjs` |
| 8 | Kanıt makbuzları bugünkü gerçeği yansıtmıyordu | Kayıtlar denetlenmiyordu | `tools/evidence-reconcile.mjs` — 166 komut yeniden koşuldu |

---

## 4. Kanıt zinciri

**Kapanış belgeleri** (`evidence/`):
- `DENETIM-BASELINE.md` — denetim öncesi ölçüm
- `DENETIM-SONRASI.md` — önce/sonra karşılaştırma
- `KAPANIS-P13-P14-P10.md` — üç sınırın kapanışı + kod denetimi
- `P08-MAKBUZ-UZLASTIRMA.md` — makbuz uzlaştırması
- `IIP-PERF-LOCAL.json` + `IIP-PERF-PROTOKOL.md` — performans
- `QA-LOCAL-VISUAL-20260922.md` — kontrollü yerel görsel QA (seviye 2)

**Araçlar** (`tools/`):
- `plan-check.mjs` · `plan-check.integration.py` — plan bütünlüğü
- `fixture-map-build.mjs` — fixture → üretim haritası
- `evidence-reconcile.mjs` — makbuz uzlaştırma
- `check-index-inline-scripts.cjs` — inline script syntax
- `session-brief.mjs` · `plan-check.integration.py`

---

## 5. Dürüstçe açık bırakılanlar

Bu maddeler **kapatılmış gibi raporlanamaz**; kayıtları da öyle diyor:

| Konu | Kayıt | Neden |
|---|---|---|
| Cihaz kabulü | `deviceAcceptance: user_attested` · `agentVerified: false` | Cihaz onayını yalnız kullanıcı verir (kök kural). Kayıt **kullanıcı beyanıdır**, ajan doğrulaması değil. Cihaz: iPhone 15 Pro Max. |
| Hedef cihaz p50/p95 | `performanceAcceptance: user_accepted` · `p50Ms/p95Ms: null` | **Sayı yok.** Kullanıcı kabulüyle kapandı; `p95 ≤ 200 ms` hedefi sayısal olarak doğrulanmadı. Ölçüm protokolü `IIP-PERF-PROTOKOL.md`'de hazır. |
| Gerçek ekran okuyucu testi | — | Ajan tarayıcı otomasyonuyla doğrulamaz (kök kural 6). |
| Yerel görsel QA kapsamı | `localVisualQa: passed` (seviye 2) | Auth kapısında duruldu; token/parola alanı okunmadı/doldurulmadı. İç yüzeyler bu seviyede kapsanmaz. |

---

## 6. Yayın

| Commit | İçerik |
|---|---|
| `8ba784e` | IIP-23/24 kanıt ve durum kayıtları + denetim programı |
| `fc6f265` | Bayat pinler + **gerçek render mutasyonu** + plan araçları |
| `70e42bc` | Kardeş-kart regresyon kapısı (P13) + perf ölçümü + dürüst cihaz kaydı |
| `ea500ed` | Cihaz teyidi + P06 kod denetimi |
| `242938b` | Kontrollü yerel görsel QA (seviye 2) |
| `deec999` | Makbuz uzlaştırması (P08) |
| `d2600c7` | Cihaz modeli (iPhone 15 Pro Max) |
| `1e1e172` | P14 performans maddesi kullanıcı kabulüyle kapatıldı |

Her commit Pages deploy'u tetikledi; son deploy **success**, canlı site **HTTP 200**,
`app/core/saygi.js` yerel ile **bit düzeyinde aynı**.

---

## 7. Yeni oturum için not

Program kapandı. **Yeni bir IIP işi başlatılmaz**; aşağıdaki iki durumda
`IIP-STATE.json` yeniden açılır:

1. **Hedef cihaz p50/p95 ölçümü** yapılırsa → `performanceAcceptance` sayısal kanıta yükseltilir
   (protokol: `evidence/IIP-PERF-PROTOKOL.md`).
2. **Yeni içerik/kart ihtiyacı** doğarsa → ayrı kapsam değişikliği ve kullanıcı onayı gerekir
   (plan kuralı: "yeni içerik ihtiyacı insan incelemesi ister").

**Klasör taşınmadı, bilinçli olarak.** Program kökünde kalıyor çünkü taşıma
şunları kırar (2026-09-22'de simülasyonla ölçüldü):
- `tests/app/test_iip_17.js` — IIP-17 render artifact'ini kendi klasörüne yazar
- 16 kanıt makbuzu — `commands[]` içinde `ilham-ibadet-premium-plan/tools/plan-check.mjs` yolunu kaydeder
- `tools/evidence-reconcile.mjs` · `tools/fixture-map-build.mjs` — yol sabitleri
- Plan-içi bağlantılar (`../docs/`, `../tests/`, `../archive/`)
- `tests/README.md` · `AGENTS.md` · `CLAUDE.md` yönlendirme maddeleri

`plan-check.mjs` yine de **taşımaya dayanıklı** hale getirildi (repo kökü artık
`app.js` sembolünden çözülüyor, sabit varsayım yok) — ileride taşınma kararı
verilirse araç hazır.
