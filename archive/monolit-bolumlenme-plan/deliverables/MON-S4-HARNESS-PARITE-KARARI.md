# MON-S4 — Harness Üretim Yükleme-Paritesi Kararı

**Program:** `MONOLIT-BOLUMLENME` · **Prompt:** `MON-04` · **Tarih:** 2026-09-02
**Kapsam:** `driver.mjs` + `zikr-harness.mjs` FILES dizileri ve load-order
assertion · **Dal:** `zikirmatik-manuel-zikir` — LOCAL-ONLY
**Öncüller:** MON-S1 (registry/shim), MON-S2 (FX manifesti), MON-S3 (sahiplik matrisi)

## 1. Karar

`index.html` üretim script sırası **kanonik kaynak** olarak kabul edilir.
Her iki harness (`driver.mjs`, `zikr-harness.mjs`) artık index 43–71
sırasının **app.js'e kadarki önekiyle birebir parite** içinde boot seti
yükler ve bu eşitliği çalışma anında `assertLoadOrder()` ile kanıtlar.

## 2. Yapılan değişiklik (yalnız harness dosyaları)

| Dosya | Değişim |
|---|---|
| `driver.mjs` | FILES: 8 → **23** dosya (app.js dahil); `assertLoadOrder` eklendi |
| `zikr-harness.mjs` | FILES: 15 → **23** dosya (app.js dahil); `assertLoadOrder` eklendi |

Eski driver setine göre eklenenler: 9 content (motivationNarratives,
saygiPeople, hijriCalendar, quran×3, esmaul×2, zikirCoreContentV1) + 6 core
(dateUtils, state, syncGlue, helpers, mediaFx, timeTheme). Eski zikr
setine göre eklenenler: 4 content (motivationNarratives, quran×3) + 4 core
(dateUtils, syncGlue, helpers, timeTheme). İki harness artık **aynı boot
seti** ile çalışır (harness-paritesi de MON-S4'ün bir hedefiydi).

## 3. Güvenlik sınırları (değişmedi, kanıtla)

- **sync.js yüklenmez** (I5/ağ): FILES'ta kasıtlı olarak yok; sandbox'ta
  `fetch()` asla çözülmez, timer'lar no-op (driver.mjs 147–151 mevcut sınır
  korunur). Ağ imkânsız kalır — kart kabul kriteri sağlanır.
- **panel/panelCoverageManifest.js yüklenmez**: boot seti tanımı `app/*` +
  `app.js`; panel ayrı regression yüzeyidir.
- **Gerçek DOM/timer/browser yok**: değişiklik yalnızca dosya listesi ve bir
  assertion fonksiyonudur; sandbox mimarisi dokunulmadı.
- **Registry'ler yalnız yüklenir, çağrılmaz**: syncGlue `SeymaSave` getter
  tanımı yan etkisizdir (soft resolver); state/dateUtils/helpers/timeTheme
  yalnız `window.Seyma*` yazar; mediaFx `bootCtx`'i ilk çağrıya erteler.
  Content modülleri salt içerik + `Object.freeze` (quran×3 kanıt: dosya
  başındaki "KURAL" notları). Taramada DOM/localStorage/fetch teması yok.
- **app.js davranışı değişmedi**: `node --check app.js` PASS, tüm fixture
  ailesi PASS (§5).

## 4. assertLoadOrder sözleşmesi

Her iki harness'ta aynı fonksiyon:
1. `index.html`'den `<script src="app…">` sırasını çeker (cache-bust
   sorgusuz), yalnız `app/*` + `app.js` tutar;
2. FILES'taki `app.js`'e kadarki önekiyle üretim önekini JSON dizisi olarak
   karşılaştırır;
3. Eşitsizlikte **fail-fast throw** üretir (harness FAIL, sessiz sapma yok).

Gelecek MON kartlarında yeni `app/core/*` eklenirken kural: **önce
index.html'e ekle, sonra FILES'a aynı konumda ekle**; assertion sıra
ihlalini anında yakalar. sync.js hiçbir koşulda FILES'a eklenmez.

## 5. Doğrulama kanıtı (tümü PASS, exit 0)

| Kanıt | Sonuç |
|---|---|
| `node --check` ×2 harness | PASS |
| Programatik parite (`/tmp/parity_check.mjs`) | **PARITE OK ×2** (23 dosya, app.js öncesi 22) |
| `driver.mjs` tam boot | PASS (onboarding + seeded + location gate) |
| `zikr-harness.mjs` | **95/95 assertion** PASS |
| syntax ×2 (app.js/sync.js), 6 app fixture, panel faz11, premium ailesi (8), reminder-smoke, helper/migration boundary | TÜMÜ PASS |
| `git diff --check` | PASS |

## 6. Cache-bust / FILES etkisi

- `index.html` **değişmedi** → cache-bust etkisi yok.
- Harness FILES değişikliği bu kartın kendi kapsamıdır ve aynı committe
  işlenir. Gelecek kartlarda yeni core dosyası eklenirse: index script satırı
  (kendi `?v=` ile) + iki FILES dizisi + bu assertion aynı committe.

## 7. Halt değerlendirmesi

Parite için canlı ağ/DOM gerekmedi; halt tetiklenmedi. Sandbox sınırları
(fetch hiç çözülmez, timer no-op) korunarak tam parite sağlandı.

## 8. Sonraki kart

`MON-05 · Boundary fixture geçiş matrisi` — yeni açık kullanıcı onayı ile.