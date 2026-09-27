# KAO-FIX-13 · Arapça yazı tipi yığını — O-9

**Tarih:** 2026-09-27 · **Dal:** `kao-duzeltme` · **Kanıt düzeyi:** kaynak/test (cihaz doğrulaması **bekliyor**; yayın ayrı satır)

## Kırmızı → yeşil
| Komut | Exit | Sonuç |
|---|---|---|
| `node tests/kao/test_kao_render.js` (yeni blok, eski `kao.css`) | 1 | `tek kural: .kao-arabic-text,.kao-dialog [lang="ar"]` |
| aynı komut (düzeltme sonrası) | 0 | yığın birebir; `letter-spacing:normal`; Arapça seçicilerde yığın dışı font / harf aralığı yok; çıplak `[lang="ar"]` yok |
| Bozulma yoklaması (`$TMPDIR` kopyası) | 1 ×3 | çıplak `[lang="ar"]` kuralı, `.kao-overlay,[lang="ar"]` grubu, Arapça seçiciye `letter-spacing:.1em` → üçü de düştü |

## Karar (prompttan bilinçli sapma)
- Prompt `.kao-arabic-text,[lang="ar"]` diyordu. `kao.css` bütün uygulamada `styles.css`'ten sonra yüklenir. Çıplak `[lang="ar"]` (0,1,0) eşit özgüllükte `.iip17-arabic`'in (saygi.js, İlham günlük âyet) `Geeza Pro` yığınını ezerdi.
- Amaç "görev, okuyucu ve kelime ekranları" olduğu için kural `.kao-arabic-text,.kao-dialog [lang="ar"]` (0,2,0). KAO'nun 9 `lang="ar"` öğesinin hepsi `kaoOverlayHTML` → `.kao-dialog` içinde. Hub kartında Arapça yok (mevcut test).
- `.kao-ph-letter>span` yığın tekrarı kaldırıldı (öğe `lang="ar"`, aynı kuraldan alır; davranış aynı).
- `font:inherit` taşıyan KAO düğmeleri en çok (0,1,1). Arapça öğede (0,2,0) kazanır. `:root` yok, yeni renk yok.
- `letter-spacing`: Arapça seçicilerde yok. Kalıtıma karşı yığın kuralında `normal`.

## Kontroller
| Komut | Exit | Sonuç |
|---|---|---|
| `tests/kao/*.js` | 0 | 17/17 |
| driver · zikr · rebind | 0 · 0 · 0 | zikr 95/95 |
| `shell-inventory --gate` · `kao-plan-check` | 0 · 0 | PASS · PASS (1 warn, FIX-12'deki ile aynı) |
| `git diff --check` | 0 | temiz |
| `tests/app` · `panel` · `panel-v2` · `quran` | 0 | 77/77 · 23/23 · 27/27 · 9/9 (fx2/v3/surface pinleri aynı) |
| `kao-verify-contrast.mjs` | 0 | 336 çift, 0 eşik altı (renk değişmedi) |
| `kao-ui-probe.js .` | 0 | sızıntı yok |
| PIN-P `20260926j → 20260926k` | — | 9 dosya; `SW_VERSION` + `SW_OFFLINE_VERSION`; eski pin 0 |

## Değişen dosyalar
`app/kao.css` (yığın kuralı, `.kao-ph-letter>span` tekrarı çıktı; 40.209 B / 42 KB), `tests/kao/test_kao_render.js`, 9 pin dosyası.

## Kalan risk
- iOS'ta Noto Naskh / Amiri / Scheherazade yüklü değil. Gerçek çizim sistem Arapça yedeğine düşer. Web font eklemek bu kartın kapsamı dışında.
- Cihaz kabulü: CURRENT-STATE "Cihaz kabulü" listesinde, kullanıcıda.
