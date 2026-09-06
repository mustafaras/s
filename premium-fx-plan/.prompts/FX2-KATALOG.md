# FX-2 PROMPT KATALOĞU

**28 kart · 8 dalga · Dal `premium-fx-gorsel-yuzey` · LOCAL-ONLY**
Kartlar **kesintisiz sıralıdır**: FX2-01 → FX2-28. Atlama yok.

> **Her kart tek başına yeterlidir.** Uygulamak için başka belge okumak
> gerekmez; gereken spec kartın içine yazılmıştır. Belgeler yalnız *neden*
> için vardır.

---

## Sıra

| # | Kart | Dalga | Dosya | Hedef |
|---|---|---|---|---|
| 01 | Kapsam denetçisi + taban çizgisi | 0 Ölçüm | `tools/fx-coverage.mjs` | araç |
| 02 | Hareket + renk token iskeleti | 0 Ölçüm | `styles.css` | M7→0,45 |
| 03 | **Pembe → Şampanya Altını** | 1 Renk | `styles.css` | **M10→0** |
| 04 | Altın aile birleştirme | 1 Renk | `styles.css` | **M11→≤2** |
| 05 | Kontrast + tema fixture'ı | 1 Renk | `tests/app/` | M13 8/8 |
| 06 | **`SeyTouch` delege dokunma katmanı** | 2 Dokunma | `mediaFx.js`, `app.js` | **M2→≥%95** |
| 07 | Basma durumu CSS'i | 2 Dokunma | `styles.css` | M2 görsel |
| 08 | Ripple'ı delege katmana bağla | 2 Dokunma | `mediaFx.js`, `styles.css` | **M4→≥%90** |
| 09 | Niyet haritası (`data-fx`) | 2 Dokunma | `app.js`, `mediaFx.js` | ≥40 etiket |
| 10 | Dokunma kapsamı fixture'ı | 2 Dokunma | `tests/app/` | eşik kilidi |
| 11 | Ses motoru v2 | 3 Ses | `mediaFx.js` | klipleme 0 |
| 12 | Ses paleti v2 (11 ses) | 3 Ses | `mediaFx.js` | **M3→≥200** |
| 13 | iOS ses kilidi | 3 Ses | `mediaFx.js` | **M9→≥2** |
| 14 | Ses motoru fixture'ı | 3 Ses | `tests/app/` | fixture |
| 15 | Sekme geçiş motoru | 4 Hareket | `app.js`, `styles.css` | 7/7 |
| 16 | Overlay giriş/çıkış | 4 Hareket | `app.js`, `mediaFx.js` | **M6→≥10** |
| 17 | Stagger sistemi | 4 Hareket | `app.js`, `styles.css` | ≥8 |
| 18 | Sayaç + halka canlandırma | 4 Hareket | `app.js`, `mediaFx.js` | **M5→≥8** |
| 19 | **`SeyAmbience` çekirdeği** | 5 Zemin | `timeTheme.js` | motor |
| 20 | Güneş saati (gerçek sunrise/sunset) | 5 Zemin | `timeTheme.js`, `styles.css` | 4 sahne |
| 21 | **Hava modu (WMO → 8 sahne)** | 5 Zemin | `timeTheme.js`, `styles.css` | 8 sahne |
| 22 | Mevsim + günlük varyasyon | 5 Zemin | `timeTheme.js`, `styles.css` | **M12≥18** |
| 23 | Zemin fixture'ı + performans | 5 Zemin | `tests/app/` | kontrast |
| 24 | Elevation skalası | 6 Malzeme | `styles.css` | **M7→≥0,80** |
| 25 | Aurora v2 (parallax + grain) | 6 Malzeme | `app.js`, `styles.css` | GPU≤2 |
| 26 | Varsayılan denetimi | 7 Kapanış | `state.js`, `app.js` | **M8→0** |
| 27 | Tam regresyon + kapsam raporu | 7 Kapanış | `deliverables/` | 0 FAIL |
| 28 | Kapanış + doküman senkronu | 7 Kapanış | belgeler | tutarlılık |

---

## Her Kartta Zorunlu Akış

**1. Başlamadan:**
```bash
cd /Users/m_ras/Desktop/seyma
git branch --show-current      # premium-fx-gorsel-yuzey
git status --short             # temiz
python3 -c "import json;s=json.load(open('premium-fx-plan/.anti-amnesia/FX2-STATE.json'));print('sıradaki:',s['nextPrompt'],'| bloklu:',s['blockedPrompt'])"
```

**2. Bitirmeden (hepsi geçmeli):**
```bash
node --check app.js && node --check app/core/mediaFx.js && node --check app/core/timeTheme.js
node .claude/skills/run-seyma/driver.mjs 2>&1 | grep -c '^FAIL'          # 0
node .claude/skills/run-seyma/zikr-harness.mjs 2>&1 | tail -1            # 95/95
for f in tests/app/*.js; do node "$f" >/dev/null 2>&1 || echo "FAIL $f"; done
node tools/fx-coverage.mjs                                               # FX2-01 sonrası
```

**3. Değişmezlik kanıtı (S5) — sayılar DEĞİŞMEMELİ:**
```bash
grep -oE 'App\.[A-Za-z0-9_]+\s*=[^=]' app.js | grep -oE 'App\.[A-Za-z0-9_]+' | sort -u | wc -l   # 717
grep -o 'onclick=' app.js | wc -l                                                                # 391
grep -c '<script src="app.js' index.html                                                         # 1
```
(Kart açıkça "+N handler" diyorsa yalnız o kadar artar.)

**4. Kayıt (S6 — aynı commit):** `LEDGER.md` satırı + `CURRENT-STATE.md` +
`FX2-STATE.json` (`lastCompletedPrompt`, `nextPrompt`).

**5. Commit (S7):** `fx2: FX2-NN <kısa Türkçe özet>` — **push yok.**

**6. Durursa (S8):** hedef metrik yükselmediyse `blockedPrompt` yaz, dur.

---

## Tüm Kartlarda Yasak

- `git push`, PR, deploy, tag, `mustafaras/seyma-data`'ya yazma
- Uygulamayı doğrulamak için tarayıcı açma (headless harness kullan)
- Harici kütüphane / CDN / ses dosyası / font / görsel ekleme
- **Yeni ağ çağrısı** (canlı zemin `data.weather`'ı kullanır)
- `render()` yeniden yazma, sanal DOM, bileşen çatısı
- `MODULARIZATION.md` düzenleme (`test_modularization_boundary.js` ona bağlı)
- `--kandil`, `--warn`, `--read`/`--watch`/`--listen` renklerine dokunma
- `panel.html` / `panel-v2.html`
- Fixture gevşeterek testi yeşile boyama
