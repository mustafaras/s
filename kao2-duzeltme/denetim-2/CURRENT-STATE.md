# KAO2-FIX denetim-2 · CURRENT-STATE

<!-- d2f-sync
nextPrompt: D2F-07
lastSeq: 9
status: active
-->

**Son güncelleme:** 2026-10-07 · D2F-06 sonu. Bu dosya her prompt sonunda **baştan** yazılır.

## Nerede kaldık
- **YAYIN (seq 7, kullanıcı kararı):** ortam değişikliği için D2F-04 sonrası erken yayın — pin `20261007a`, `main` ff-only. Program kapanmadı:
  D2F-05…16 pending. Ayrıntı: ORTAK-KURALLAR §9, evidence/D2F-04/YAYIN.md.
- Program: düzeltme programı (16 prompt, [`DUZELTME-PROMPTLARI.md`](DUZELTME-PROMPTLARI.md)); kurallar [`ORTAK-KURALLAR.md`](ORTAK-KURALLAR.md); kaynak rapor [`DENETIM-RAPORU.md`](DENETIM-RAPORU.md).
- Tamamlanan: **6/16** (D2F-01…D2F-06). Sıradaki: **D2F-07 — Müfredat eşleme sayfası gerçeği yazsın** (yeni oturumda).
- Başlangıç commit'i (`baseCommit`): `cbe0d604`. D2F-05 PROMPT `467ab6fa`, D2F-05 NOT `80ed4450`; D2F-06 bu oturumda `d2f-05` dalında commit edildi (henüz push edilmedi).
- Kullanıcı kapıları: D2F-12, D2F-15, D2F-16. Yayın: seq 7 ile tek seferlik erken yayın (`releaseApproval: user_override_2026-10-07_early_release`).

## Canlı gerçekler (araçla ölçüldü, 2026-10-07, D2F-06)
| Ölçüm | Değer | Araç |
|---|---|---|
| `App.kao*` handler | 45 (değişmedi) | `d2f-sync-check.mjs` |
| App yüzeyi / atama | 766 / 604 | aynı |
| `onclick` | 393 | aynı |
| Yayın pini | `20261007a` | aynı |
| `test_kao2_components` (ses görevi dahil) | **çıkış 0 PASS** | koşuldu |
| `tekrar-uret-2.cjs` | **5/9 PASS** (N-01, N-02, N-03, N-08, N-09; D2F-05'te de 5/9 — azalmadı) | koşuldu |
| `tekrar-uret.cjs` | 10/10 PASS (tarihsel kalıp; gövdesi değişmedi) | koşuldu |
| `kapilar.sh` bayraklı (`KAO2_ACCEPT_SLOW_HOST=1`) | **çıkış 1, "SONUÇ: KIRMIZI KAPI VAR"** — iki kırmızı ortam kaynaklı (aşağıda "Ortam kırmızıları"); diğer tüm satırlar + perf (p95 4.570 · steady 3.179) PASS | tam koşu |
| Bayt-eşitlik: ses görevi şık ekranı, `f4c256c7^` (K2F-40 öncesi) vs HEAD | üç durum **bayt-eşit** (idle 617 · correct 853 · wrong 973 B; `diff -q` EQUAL) | tek seferlik sonda |
| Mutasyon A: Views düğme kipi geri alındı | FAIL (`düğme kipi: idle şıkkta sınıf yok`, satır 86) | scratchpad |
| Mutasyon B: motor `disabled:false` | FAIL (`doğru: yanıt sonrası şıklar Views.choice düğme kipi çıktısı`, satır 185 — yeni bölüm) | scratchpad |

### Ortam kırmızıları (D2F-06 ile ilgisiz; prompt dosya listesi dışı, §3)
- `tests/kao/test_kao2_kabul.js` **A-4**: yalnız `night-review` durumu (`8/9`). `kaoNightWindow` (`app/core/quranLearn.js:423`)
  yerel saat kullanır; bu makine **+03** → `23:30Z` gece penceresi dışı → `daily`. `TZ=UTC` ile A-4 geçer. D2F-01/04 konteynerleri UTC'ydi.
- `tests/app/test_settings_boundary.js`: `git log --all --diff-filter=A -- app/core/settings.js` ajan ana makinesi kontrol-noktası
  kök commit'ini (`625eba07…`, `refs/agents/1eefe730-…/checkpoints/turn/*`, `main` atası **değil**) seçer → `git show <sha>^` geçersiz.

## Açık bulgular (N durumları)
N-01 `pass` (D2F-03) · N-02 `pass` (D2F-05: R-01 gerçek ustalık) · N-03 `pass` (D2F-05: R-10 girintili yazım) · N-08 `pass` (D2F-04
erken yayın pini) · N-09 `pass` (D2F-04). **N-04, N-05, N-06, N-07 açık.** Eşleme:
N-05↔D2-05 (D2F-08) · N-06/N-07↔D2-06/07 (D2F-10) · N-04↔D2-04 (D2F-11/12).
D2F-06 açık bir **denetim** bulgusunu kapattı (kaynak/test): rapor §8 "ses (audioOnly) türü sentetik ortamda üretilmedi" — artık görev gerçek
kurucuyla üretilip kalıcı teste bağlı (`test_kao2_components.js`). Canlı davranış değişmedi (K2F-40 ekranı zaten yayında).
Kapanan NOT: LEDGER seq 4 (dizme "zaten sıralı" kimlik kontrolü) D2F-04'te kapandı (kaynak/test; canlıda yayına kadar eski davranış).
Kapsam dışı gözlem: parça dizmesinde çözülmüş açılış kontrolü yok (`s:95:4:1` 5/500) — programda prompt yok.
Kapsam dışı gözlem (D2F-05): kabul testi saat diliminden bağımsız değil (A-4) — programda prompt yok.
Kapsam dışı gözlem (D2F-06): ses görevinde aynı etiketli iki çeldirici olabiliyor (ör. iki "yer, yeryüzü"; doğru şık tekil) — belirsizlik
doğurmuyor; programda prompt yok, kullanıcıya ayrı iş olarak not edildi.

## Ortam notu
Konteyner sığ klonla ve `rsync`'siz gelebilir. İlk kapı koşusundan önce `git rev-parse --is-shallow-repository` ve
`which rsync` (gerekirse `git fetch --unshallow origin`, `apt-get update && apt-get install -y rsync` — `update` olmadan kurulum başarısız).
Bu makinede (macOS, yerel saat **+03**) iki ortam kırmızısı beklenir: kabul A-4 (gece penceresi yerel saat → `TZ=UTC` ile geçer) ve
`test_settings_boundary` (ajan ana makinesi `refs/agents/**` kök kontrol-noktası commit'i `git log --all`'ı kirletir). Normal (UTC,
ajan ref'siz) konteynerde ikisi de yeşildir. `test_kao2_kabul.js` ve `test_kao2_grammar_tasks.js` tek başına yavaş koşar; kapılar ~15–22 dk.
