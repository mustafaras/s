# KAO2-FIX denetim-2 · CURRENT-STATE

<!-- d2f-sync
nextPrompt: D2F-07
lastSeq: 10
status: active
-->

**Son güncelleme:** 2026-10-07 · D2F-06 + seq 10 NOTE (ortam kırmızıları giderildi) sonu. Bu dosya her prompt sonunda **baştan** yazılır.

## Nerede kaldık
- **YAYIN (seq 7, kullanıcı kararı):** ortam değişikliği için D2F-04 sonrası erken yayın — pin `20261007a`, `main` ff-only. Program kapanmadı:
  D2F-05…16 pending. Ayrıntı: ORTAK-KURALLAR §9, evidence/D2F-04/YAYIN.md.
- Program: düzeltme programı (16 prompt, [`DUZELTME-PROMPTLARI.md`](DUZELTME-PROMPTLARI.md)); kurallar [`ORTAK-KURALLAR.md`](ORTAK-KURALLAR.md); kaynak rapor [`DENETIM-RAPORU.md`](DENETIM-RAPORU.md).
- Tamamlanan: **6/16** (D2F-01…D2F-06). Sıradaki: **D2F-07 — Müfredat eşleme sayfası gerçeği yazsın** (yeni oturumda).
- Başlangıç commit'i (`baseCommit`): `cbe0d604`. D2F-05 PROMPT `467ab6fa`, D2F-05 NOT `80ed4450`; D2F-06 `79eca899` (dal `d2f-05`).
- **seq 10 NOTE (bu oturum, kullanıcı yönergesi):** D2F-05/D2F-06'da "kapsam dışı" denen iki ortam kırmızısı **giderildi** (aşağıda);
  kapı artık **yeşil**. Bu bir NOTE'dır: `nextPrompt` ilerlemedi, pin/sw değişmedi.
- Kullanıcı kapıları: D2F-12, D2F-15, D2F-16. Yayın: seq 7 ile tek seferlik erken yayın (`releaseApproval: user_override_2026-10-07_early_release`).

## Canlı gerçekler (araçla ölçüldü, 2026-10-07, D2F-06 + seq 10)
| Ölçüm | Değer | Araç |
|---|---|---|
| `App.kao*` handler | 45 (değişmedi) | `d2f-sync-check.mjs` |
| App yüzeyi / atama | 766 / 604 | aynı |
| `onclick` | 393 | aynı |
| Yayın pini | `20261007a` | aynı |
| `kapilar.sh` bayraklı | **çıkış 0, "SONUÇ: TÜM KAPILAR YEŞİL"** | tam koşu |
| `test_kao2_kabul.js` | **10/10 PASS, çıkış 0** (A-4 dâhil; A-9: 189/189 dosya çıkış 0) | koşuldu |
| `test_settings_boundary.js` | **13/13 PASS** (seq 10 düzeltmesi) | koşuldu |
| `test_kao2_components` (ses görevi dahil) | çıkış 0 PASS | koşuldu |
| `tekrar-uret-2.cjs` | **5/9 PASS** (N-01, N-02, N-03, N-08, N-09; azalmadı) | koşuldu |
| `tekrar-uret.cjs` | 10/10 PASS | koşuldu |
| Bayt-eşitlik: ses görevi şık ekranı, `f4c256c7^` vs HEAD | üç durum **bayt-eşit** (idle 617 · correct 853 · wrong 973 B) | tek seferlik sonda (D2F-06) |

### seq 10 NOTE — giderilen ortam kırmızıları (ikisi de TEST kusuru; üretim doğruydu)
- `tests/kao/test_kao2_kabul.js` **A-4**: fikstür `now`'u `2026-09-30T23:30:00.000Z` idi; `kaoNightWindow` (`app/core/quranLearn.js:423`)
  **yerel** saat okur → `23:30Z` yalnız UTC'de 23:30. Düzeltme: yerel duvar saati 23:30 (`new Date(2026,8,30,23,30,0).toISOString()`);
  6 saat diliminde de `night-review`.
- `tests/app/test_settings_boundary.js`: `git log --all` ajan ana makinesi kök kontrol-noktası ref'ini (`625eba07…`, `main` atası **değil**,
  ebeveynsiz) seçiyordu → `git show <sha>^` geçersiz. Düzeltme: `--all` kaldırıldı (yalnız HEAD ataları → MON-37 `32ad00af`).
- Ayrıntı: [evidence/D2F-06/EK-KANIT.md](evidence/D2F-06/EK-KANIT.md).

## Açık bulgular (N durumları)
N-01 `pass` (D2F-03) · N-02 `pass` (D2F-05) · N-03 `pass` (D2F-05) · N-08 `pass` (D2F-04) · N-09 `pass` (D2F-04).
**N-04, N-05, N-06, N-07 açık.** Eşleme: N-05↔D2-05 (D2F-08) · N-06/N-07↔D2-06/07 (D2F-10) · N-04↔D2-04 (D2F-11/12).
D2F-06 açık bir **denetim** bulgusunu kapattı (kaynak/test): rapor §8 "ses (audioOnly) türü sentetik ortamda üretilmedi" — artık görev gerçek
kurucuyla üretilip kalıcı teste bağlı (`test_kao2_components.js`). Canlı davranış değişmedi (K2F-40 ekranı zaten yayında).
Kapsam dışı gözlem (D2F-06): ses görevinde aynı etiketli iki çeldirici olabiliyor (ör. iki "yer, yeryüzü"; doğru şık tekil) — belirsizlik
doğurmuyor; programda prompt yok, kullanıcıya ayrı iş olarak not edildi.

## Ortam notu
Konteyner sığ klonla ve `rsync`'siz gelebilir. İlk kapı koşusundan önce `git rev-parse --is-shallow-repository` ve
`which rsync` (gerekirse `git fetch --unshallow origin`, `apt-get update && apt-get install -y rsync` — `update` olmadan kurulum başarısız).
**Bu makine (macOS, yerel saat +03):** D2F-05/D2F-06'da beklenen iki kırmızı (kabul A-4 ve `test_settings_boundary`) seq 10'da **giderildi**;
kapı artık bu makinede de tamamen yeşil. `test_kao2_kabul.js` ve `test_kao2_grammar_tasks.js` tek başına yavaş koşar; kapılar ~15–22 dk.
