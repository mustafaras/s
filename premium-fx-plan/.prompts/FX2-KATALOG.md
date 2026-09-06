# FX-2 PROMPT KATALOĞU

**Seri:** 20 kart · 6 dalga · Dal `premium-fx-gorsel-yuzey` · **LOCAL-ONLY**
**Ön okuma (her oturum):** [`../TESHIS.md`](../TESHIS.md) →
[`../PLAN-FX2.md`](../PLAN-FX2.md) →
[`../.anti-amnesia/FX2-STATE.json`](../.anti-amnesia/FX2-STATE.json)

---

## Kart Listesi

| # | Kart | Dalga | Dokunduğu dosya | Hedef metrik |
|---|---|---|---|---|
| 01 | Kapsam denetçisi + taban çizgisi | 0 | `tools/fx-coverage.mjs` (yeni) | araç kurulur |
| 02 | Hareket token sistemi | 0 | `app/styles.css` | M7 → 0,45 |
| 11 | `SeyTouch` delege dokunma katmanı | 1 | `app/core/mediaFx.js`, `app.js` | **M2 → ≥%95** |
| 12 | Basma durumu CSS'i + `.surface:active` düzeltmesi | 1 | `app/styles.css` | M2 görsel |
| 13 | Ripple'ı delege katmana bağla | 1 | `app/core/mediaFx.js`, `app/styles.css` | **M4 → ≥%90** |
| 14 | Niyet haritası (`data-fx`) | 1 | `app.js` | anlam ayrımı |
| 15 | Dokunma kapsamı fixture'ı | 1 | `tests/app/` (yeni) | eşik kilidi |
| 21 | Ses motoru v2 (bus/reverb/limiter) | 2 | `app/core/mediaFx.js` | klipleme 0 |
| 22 | Ses paleti v2 (11 ses) | 2 | `app/core/mediaFx.js` | **M3 → ≥200** |
| 23 | iOS ses kilidi + görünürlük | 2 | `app/core/mediaFx.js` | **M9 → ≥2** |
| 24 | Ses motoru fixture'ı | 2 | `tests/app/` (yeni) | fixture yeşil |
| 31 | Sekme geçiş motoru | 3 | `app.js`, `app/styles.css` | 7/7 sekme |
| 32 | Overlay giriş/çıkış hareketi | 3 | `app.js`, `app/styles.css` | **M6 → ≥10** |
| 33 | Stagger sistemi (`--i`) | 3 | `app.js`, `app/styles.css` | ≥8 yüzey |
| 34 | Sayaç + halka canlandırma | 3 | `app.js`, `app/styles.css` | **M5 → ≥8** |
| 41 | Elevation skalası uygulaması | 4 | `app/styles.css` | M7 → ≥0,80 |
| 42 | Zaman teması v2 (gerçek zemin) | 4 | `app/core/timeTheme.js`, `app/styles.css` | kontrast ≥4,5:1 |
| 43 | Aurora v2 (parallax + grain) | 4 | `app.js`, `app/styles.css` | GPU katmanı ≤2 |
| 51 | Varsayılan denetimi | 5 | `app/core/state.js`, `app.js` | **M8 → 0** |
| 52 | Tam regresyon + kapsam raporu | 5 | `deliverables/` (yeni) | 0 FAIL |
| 53 | Kapanış + doküman senkronu | 5 | belgeler, `CLAUDE.md`, `AGENTS.md` | tutarlılık |

---

## Her Kartın Ortak Sözleşmesi

**Başlamadan:**
```bash
cd /Users/m_ras/Desktop/seyma
git branch --show-current            # premium-fx-gorsel-yuzey olmalı
git status --short                   # temiz olmalı
cat premium-fx-plan/.anti-amnesia/FX2-STATE.json
```

**Bitirmeden (S3 — hepsi geçmeli):**
```bash
node --check app.js && node --check app/core/mediaFx.js
node .claude/skills/run-seyma/driver.mjs 2>&1 | grep -c '^FAIL'   # 0
for f in tests/app/test_premium_*.js tests/app/test_fx2_*.js; do
  [ -e "$f" ] || continue; node "$f" >/dev/null || echo "FAIL $f"; done
node tools/fx-coverage.mjs --gate
```

**Değişmezlik kanıtı (S5):**
```bash
grep -oE 'App\.[A-Za-z0-9_]+\s*=[^=]' app.js | grep -oE 'App\.[A-Za-z0-9_]+' | sort -u | wc -l   # kart neyi bekliyorsa
grep -o 'onclick=' app.js | wc -l
grep -c '<script src="app.js' index.html                # 1
```

**Kayıt (S6 — aynı commit):** `LEDGER.md` satırı + `CURRENT-STATE.md` +
`FX2-STATE.json`.

**Commit (S7):** `fx2: FX2-P-NN <kısa Türkçe özet>` — **push yok**.

**Durursa (S8):** kapsam yükselmediyse `blockedPrompt` yaz, seriyi durdur.

---

## Yasaklar (tüm kartlarda)

- `git push`, PR, deploy, tag, `mustafaras/seyma-data`'ya yazma
- Tarayıcı otomasyonuyla token/parola alanı okuma-doldurma
- Harici kütüphane / CDN / ses dosyası / font ekleme
- `render()`'ı yeniden yazma, sanal DOM, bileşen çatısı
- `panel.html` / `panel-v2.html` (bu seride kapsam dışı)
- `MODULARIZATION.md`'yi değiştirme (`test_modularization_boundary.js` ona bağlı)
