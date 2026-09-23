# P08 — Kanıt makbuzlarının uzlaştırılması ✅

**Tarih:** 2026-09-22 · **Uzlaştırma HEAD:** `242938b` · **Araç:** `tools/evidence-reconcile.mjs`

---

## Sorun

16 IIP source-gate makbuzu komutlarını `exitCode: 0` olarak kaydetmişti.
Bugünkü gerçekle uyuşup uyuşmadıkları **doğrulanmamıştı** — bu, programın kendi
REQ-048 ilkesinin ("sahte done denetimle yakalanır") açık kalan kısmıydı.

## Yöntem

**`tools/evidence-reconcile.mjs`** (yeni, salt-okur + `--apply`):
her makbuzdaki **her komutu bugün yeniden koşar**, kayıtlı `exitCode` ile canlı
exit kodunu karşılaştırır. `--apply` ile makbuza **append-only** bir
`reconciliation` bloğu ekler — `commands[]` dizisi **asla yeniden yazılmaz/silinmez**.

## Bulgu: 166 komutun 3'ünde drift

| Makbuz | Komut | Kayıtlı | Canlı | Gerçek neden |
|---|---|---|---|---|
| IIP-14 | `verify-state-migration-boundary.mjs` | 0 | **1** | **Bayat pin** |
| IIP-15 | `verify-state-migration-boundary.mjs` | 0 | **1** | aynı |
| IIP-22 | `node -e index-inline-script-syntax-check` | 0 | **1** | **çalıştırılamaz komut** |

### Drift 1 — bayat pin (gerçek bulgu)

`verify-state-migration-boundary.mjs` iki testte düşüyordu:

```
FAIL  default root tam snapshot hash değişmedi
FAIL  default root alan sırası ve kapsamı korunuyor
```

**Kök neden:** `createDefaultData()`'ya üç yeni root alanı eklendi —
`bookmarks`, `reader` (IIP-20, commit `8449cc2`) ve `programs` (IIP-21, commit `de59f03`).
Fixture 2026-09-03 hâlini pinliyordu.

**Kanıt (öncesi/sonrası):**

| | Root alanları |
|---|---|
| `47a9575` (öncesi) | …`reminders`, `luna`, `aeon`, `settings`… — üçü **yok** |
| Bugün | …`luna`, `aeon`, **`bookmarks`, `reader`, `programs`**, `settings`… |

**Düzeltme (körlemesine yenileme değil):**

1. Fixture'a **`--print-hash`** bayrağı eklendi — pinler artık güvenli/kanonik üretiliyor
   (`node …/verify-state-migration-boundary.mjs --print-hash`).
2. `expectedRootKeys` üç alanı doğru sırayla içerecek şekilde güncellendi.
3. Snapshot hash pinlendi: `5294f6a8…` → **`378afb14…`**.
4. Doğrulandı: **67 PASS / 0 FAIL, exit 0**.

> Not: IIP-14/15 kartları kendi zamanlarında `exitCode: 0` kaydetmekte **haklıydı** —
> pin o an geçerliydi. Kayma sonraki kartlarda (IIP-20/21) oluştu. Bu, P13'ün
> "kardeş-kart regresyonu" kök nedeninin bir başka yüzüdür.

### Drift 2 — çalıştırılamaz komut (kayıt kusuru, ürün kusuru değil)

```
$ node -e index-inline-script-syntax-check
ReferenceError: index is not defined
```

Bu **hiçbir zaman çalıştırılabilir bir komut olmadı**. Ancak `IIP-22/source.md`
gerçek iddiayı doğru yazmış: *"index içindeki 3 inline script syntax PASS"*.
Yani **niyet doğru, kayıt bozuk**.

**Düzeltme:** gerçek kontrol `tools/check-index-inline-scripts.cjs` olarak yazıldı —
`index.html`'deki tüm inline `<script>` bloklarını `vm.Script` ile ayrıştırır.

```
$ node tools/check-index-inline-scripts.cjs
inline scripts OK: 3
exit=0
```

Makbuzda komut değiştirildi ve `commandCorrections[]` ile **ne/neden** kaydedildi
(eski değer korunuyor).

## Sonuç

| Metrik | Değer |
|---|---|
| Makbuz | 16 / 16 yeşil |
| Yeniden koşulan komut | **166** |
| Kalan drift | **0** |
| Uzlaştırma kaydı yazılan makbuz | 16 |

Her makbuza eklenen `reconciliation` bloğu şunları taşır: `reconciledAt`,
`reconciledHead`, yöntem, `commandsRerun`, `driftCount`, `verdict`, `drift[]`.

## Doğrulama

| Kontrol | Sonuç |
|---|---|
| `tests/app` + `panel` + `panel-v2` + `quran` + `reminders` | **154 PASS / 0 FAIL** |
| `verify-state-migration-boundary.mjs` | ✅ 67/0, exit 0 |
| `check-index-inline-scripts.cjs` | ✅ 3 inline script, exit 0 |
| `plan-check.mjs` (+`--self-test`) · `integration.py` · `driver` · `shell-gate` | ✅ exit 0 |
| `node --check app.js` · `app/core/state.js` | ✅ |

## Değişen dosyalar

**Yeni:** `tools/evidence-reconcile.mjs` · `tools/check-index-inline-scripts.cjs`

**Değişen:** `.claude/skills/run-seyma/verify-state-migration-boundary.mjs` (pin + `--print-hash`) ·
`evidence/IIP-22/source.json` (komut + `commandCorrections`) · 16 × `evidence/IIP-*/source.json`
(`reconciliation` bloğu)

**Üretim kodu DEĞİŞMEDİ.**

## P08 ile kapanan dürüstlük açığı

Programın en ağır bulgusu şuydu: *"makbuzlar bugünkü gerçeği yansıtmıyor."*
Artık yansıtıyor — ve yansıtmadığı 3 yer **bulunup düzeltildi**, ikisi gerçek bir
bayat pin, biri gerçek bir kayıt hatası. Üçü de körlemesine değil, kanıtla kapatıldı.
