# KAO-FIX-12 · Kaynaklar ve lisanslar (E7) — O-6

**Tarih:** 2026-09-27 · **Dal:** `kao-duzeltme` · **Kanıt düzeyi:** kaynak/test (cihaz yok; yayın ayrı satır)

## Kırmızı → yeşil
| Komut | Exit | Sonuç |
|---|---|---|
| `node tests/kao/test_kao_render.js` (yeni blok, eski `quranLearn.js`) | 1 | `E7 kaynaklar bölümü yok` |
| aynı komut (düzeltme sonrası) | 0 | 10 ad + 6+ bağlantı `rel="noopener" target="_blank"` + https; işleyici yok; manifest eş; modül URL'leri `href`; kaynakta tanzil/corpus/diyanet URL'si yok; CSS yalnız `--quran*`/`--f-*` |

## Kaynak doğrulaması (tahmin yok)
- Tadabur `CC BY-NC 4.0`, AQQD-v2 `CC0 1.0`: `audio-manifest.json` `datasets[]` → `KAO_AUDIO_SOURCES` (2 kayıt, yorumda kaynak).
- Tanzil `CC BY 3.0`, QAC `GNU GPL`, KAO Türkçe katman, 2 Diyanet PDF: çalışma anında `QuranLexiconV1`/`QuranShortSurahsV1.ATTRIBUTION.sources` (URL'ye göre tekilleştirilir).
- ts-fsrs v4.5.2 `MIT`: `quranLearn.js` satır 2–5 lisans başlığı (`grep -n "MIT License"`) → `KAO_FSRS_SOURCE`.

## Kontroller
| Komut | Exit | Sonuç |
|---|---|---|
| `tests/kao/*.js` | 0 | 17/17 |
| driver · zikr · rebind | 0 · 0 · 0 | zikr 95/95 |
| `shell-inventory --gate` · `kao-plan-check` | 0 · 0 | PASS · PASS (1 warn = HEAD'de de var, MediaRecorder) |
| `git diff --check` | 0 | temiz |
| `tests/app` · `tests/panel` · `tests/panel-v2` · `tests/quran` | 0 | 77/77 · 23/23 · 27/27 · 9/9 |
| `kao-verify-contrast.mjs` | 0 | 336 çift (HEAD 328; +4 yeni renk × 2 tema), 0 eşik altı |
| `kao-sim.js . 365` | 0 | iki yön 524/524, bilinen kod=plan 507, newMax 8, hata 0 |
| `kao-ui-probe.js .` | 0 | sızıntı yok |
| `kao-mutate.mjs $TMPDIR/kao-mut-*` (çalışma ağacı kopyası, hedef doğrulandı) | 0 | 17/17 YAKALANDI |
| Pinler | — | App 756 · onclick 393 · v3 556 · surface 594; `App.kao*` 35; quranLearn onclick 80 (HEAD ile aynı) |
| PIN-P `20260926i → 20260926j` | — | 9 dosya; `SW_VERSION` + `SW_OFFLINE_VERSION`; eski pin 0 |

## Değişen dosyalar
`app/core/quranLearn.js` (+23: `KAO_AUDIO_SOURCES`, `KAO_FSRS_SOURCE`, `kaoContentSources`, `kaoSourcesHTML`; E7 sonuna bölüm), `app/kao.css` (+1 satır `.kao-sources`, bağlantı ≥44 px), `tests/kao/test_kao_render.js`, 9 pin dosyası.
Bütçe: quranLearn.js 1.874/1.900 satır, kao.css 40.164 B / 42 KB.

## Kalan risk
- Manifest değişirse `KAO_AUDIO_SOURCES` elle eşlenir; test manifestle karşılaştırır (sapma kırmızı).
- `KAO Turkish review layer · project-authored` modülün İngilizce metni olarak görünür (modül elle düzenlenmez, V4).
- Cihazda görsel kabul yok (K3 kullanıcıda).
