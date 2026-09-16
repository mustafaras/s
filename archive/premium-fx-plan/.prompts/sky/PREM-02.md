# PREM-02 — Motion token migrasyonu (M7)

**Kart 14/15 · PREM · Dosya: `app/styles.css` · TEKRARLI, güvenli**

> **Önce `SKY-00-ONBILGI.md` oku.** Bu kartta SADECE aşağıdaki iş var.
> Başka dosyaya dokunma. Karar gerekiyorsa DUR ve kullanıcıya sor.

---

## 1. AMAÇ

`app/styles.css` içinde hâlâ **elle yazılmış** süre ve eğri değerleri var
(`.3s ease` gibi). Bunları tasarım token'larına taşı. Ölçüsü: M7 metriği,
şu an **0,62** (hedef 0,80 — kullanıcı 0,62'yi onaylı tavan kabul etti,
yükseltmek **bonus**).

## 2. TOKEN SÖZLÜĞÜ

| Elle yazılmış | Token |
|---|---|
| `.12s` `.15s` | `var(--dur-1)` |
| `.2s` `.22s` | `var(--dur-2)` |
| `.28s` `.3s` | `var(--dur-3)` |
| `.4s` `.45s` | `var(--dur-4)` |
| `.6s` | `var(--dur-5)` |
| `ease-out` | `var(--ease-out)` |
| `ease-in` | `var(--ease-in)` |
| `linear` | `var(--ease-linear)` |
| `cubic-bezier(.16,1,.3,1)` | `var(--ease-premium)` |

> Tam liste için `app/styles.css` başındaki `:root` bloğuna bak. Orada
> **tanımlı olmayan** bir token uydurma.

## 3. NE YAPACAKSIN — KÜÇÜK PARTİLER HÂLİNDE

**Hepsini birden değiştirme.** Her seferinde **5–10 bildirim** dönüştür,
sonra doğrula, sonra devam et.

1. Mevcut skoru gör: `node tools/fx-coverage.mjs | grep '^M7'`
2. Token'sız bir `transition:` veya `animation:` bildirimi bul:
   ```bash
   grep -n 'transition:[^;]*[0-9]s' app/styles.css | grep -v 'var(--' | head -10
   ```
3. Token'a çevir.
4. **Doğrula** (§4), M7 arttı mı bak.
5. 2–4'ü tekrarla.

## 4. DOĞRULAMA (her parti sonrası)

```bash
node tools/fx-coverage.mjs | grep -E '^M7|^M13'
for t in tests/app/*.js; do node "$t" >/dev/null 2>&1 || echo "FAIL $t"; done
```

**Beklenen:** M7 **artmış veya aynı** (asla azalmamış) · M13 = `8` · FAIL yok

## 5. ⚠️ DOKUNMA

| Dokunma | Neden |
|---|---|
| `@media (prefers-reduced-motion)` içindeki `animation:none!important` | Erişilebilirlik kuralı |
| `#sey-aurora::after` blokları | `test_fx2_ambience` sözleşmesi |
| `--dur-*` / `--ease-*` token **tanımları** (`:root`) | Kaynak bunlar |

## 6. DUR VE SOR

- M7 **azalırsa**: DUR, son partiyi geri al.
- M13 `8` değilse: DUR, kontrast bozulmuş.

## 7. BİTİRME

```bash
git add app/styles.css index.html
git commit -m "prem: PREM-02 motion token migrasyonu

Elle yazilmis sure/egri degerleri --dur-*/--ease-* token'larina tasindi.
M7: 0.62 -> <yeni deger>.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

`SKY-STATE.json` → `"PREM-02": "done"` (M7'nin son değerini not düş)
