# KAO2-FIX denetim-2 · CURRENT-STATE

<!-- d2f-sync
nextPrompt: none
lastSeq: 30
status: completed
-->

**Son güncelleme:** 2026-10-09 · kapanış sonrası düzeltme notları (LEDGER seq 25, denetim-3 D3F-05; seq 26, D3F-08; seq 27, D3F-12; seq 28, D3F-13; seq 29, D3F-14; seq 30, D3F-17). Program 2026-10-07'de D2F-16 ile kapandı (`closeCommit` `128ab06d`); sonraki düzeltmeler `kao2-duzeltme/denetim-3/` (D3F-NN) altında.

## Nerede kaldık
- **YAYIN (seq 7, kullanıcı kararı):** ortam değişikliği için D2F-04 sonrası erken yayın — pin `20261007a`, `main` ff-only (tarihsel; sonraki yayın D2F-15, pin `20261007b`). Ayrıntı: evidence/D2F-04/YAYIN.md (ORTAK-KURALLAR silindi; geri getirme: `git show d439127b:kao2-duzeltme/denetim-2/ORTAK-KURALLAR.md`).
- Program: düzeltme programı (16 prompt, [`DUZELTME-PROMPTLARI.md`](DUZELTME-PROMPTLARI.md)); kurallar `ORTAK-KURALLAR.md` 2026-10-07'de kullanıcı kararıyla kaldırıldı (LEDGER seq 23); kaynak rapor [`DENETIM-RAPORU.md`](DENETIM-RAPORU.md).
- Tamamlanan: **16/16** — **PROGRAM KAPANDI** (`status=completed`, `nextPrompt=null`). Canlı bayt eşitliği ✓ (20/20 EŞİT, 4/4 gizlilik 404, Pages run 37664767297).
- Başlangıç commit'i (`baseCommit`): `cbe0d604`. D2F-05 PROMPT `467ab6fa`, D2F-05 NOT `80ed4450`; D2F-06 `79eca899` (dal `d2f-05`); D2F-06 NOT `e7b2c170`; D2F-07 dal `d2f-07`; D2F-08 aynı dal.
- Kullanıcı kapıları: D2F-11→12 (GATE waiting, seq 16), D2F-12, D2F-15, D2F-16. Yayın: seq 7 ile tek seferlik erken yayın (`releaseApproval: user_override_2026-10-07_early_release`).

## Canlı gerçekler (2026-10-09 yeniden ölçüldü, D3F-17: YAYIN-9 tam kapısı `a384aa8a` + d2f --strict; ölçülmeyen satır kendi tarihini taşır; kaynak Araç sütununda)
| Ölçüm | Değer | Araç |
|---|---|---|
| `App.kao*` handler | 45 (kapanışta ve HEAD'de) | `d2f-sync-check.mjs` (kapanış) + `test_kao2_handler_surface` ve fx2/v3 pin testleri (YAYIN-9 tam kapısı, 2026-10-09) |
| App yüzeyi / atama | 766 / 604 | aynı |
| `onclick` | 393 | aynı |
| Yayın pini | kapanışta `20261007b` (D2F-15); güncel pin denetim-3'te (`D3F-STATE.json` → `pins.release`) | aynı + `kapilar.sh` "d3f pin senkronu" |
| `tests/kao` envanteri | **55 test + 3 yardımcı/fixture README'de**; `test_kao2_inventory.js` PASS | koşuldu (D2F-08); `tests/kao (55) PASS` YAYIN-9 tam kapısı (2026-10-09) |
| Araç iki üretim | `MUFREDAT-ESLEME.md` + `quranCurriculumV2.js` **bayt-eşit** ve depodakiyle **aynı** | `--out-dir` ×2 |
| Metin durumu | **158 kayıt · draft 0 · sourced 158 · ai-delegated 158 · owner 0** (yetki devriyle yapay zekâ; kullanıcı incelemesi değil). Ayrıca 12 ünitenin "Neden önemli" (`why`) alt onayı **12/12 draft** (`review.whyReview`; L1 işareti kapsamaz, hiçbir görünüm okumaz — LEDGER seq 27) | bağımsız sayım (2026-10-08) |
| `kapilar.sh` bayraklı / bayraksız | bayraklı **TÜM KAPILAR YEŞİL** (son: YAYIN-9 izole klon `a384aa8a`, 2026-10-09, 20/20; p95 6,075 ms); bayraksız **saate ve yüke bağlıydı**: render testi 21:30–23:00 kırmızı (D3F-02'de giderildi), göreli p95 bandı bu makinede oynak (açık karar, D3F-STATE `openDecisions`). D2F-13'teki "ikisi de yeşil" yalnız o koşu için doğruydu | tam koşu (D3F-03, 2026-10-08) |
| `tekrar-uret-2.cjs` | **9/9 PASS** | koşuldu (2026-10-08) |
| `d2f-sync-check --strict` | **PASS** (15/15 kayıtlı istisna; kural-a istisnaları hash'e bağlı, kapanış sonrası D2F/K2F öneki yasak) | koşuldu (D3F-17, 2026-10-09) + mutasyon 8/8 (D3F-04, 2026-10-08) |
| `--audit-k2f` | 128 commit · 28 çok commit'li prompt · 21 plan dışı pin | koşuldu (D2F-09) |
| `tekrar-uret.cjs` | 10/10 PASS | koşuldu (YAYIN-9 tam kapısı, 2026-10-09) |

## Bu oturumun işi
- **Düzeltme notu seq 26 (denetim-3 F-08, D3F-08).** Denetim-2 dönemindeki 4 Pages yayınından 3'ü kayıtsızdı: run 37647239210 (`3f3b28cd`, Copilot CLI oturumu, 15 commit, çalışma zamanı farkı yok), run 37666380654 (`128ab06d`, 2 commit, fark yok), run 37618089484 (`59abe97b`, D2F-04 erken yayını; onay seq 7'de, run ve ff aralığı yazılmamıştı). Denetim: `denetim-3/evidence/D3F-08/pages-kayit-denetimi.mjs` 4/4.
- **D2F-16 — Canlı doğrulama (seq 24, GATE closed).** Komutu Claude çalıştırdı: 20 EŞİT / 0 FARKLI, 4×404, perf PASS. [evidence/D2F-16/CANLI.md](evidence/D2F-16/CANLI.md), [KANIT.md](evidence/D2F-16/KANIT.md). Kanıt: kaynak ✓ · yayın ✓ · canlı ✓ · cihaz —.
- **D2F-15 — YAYIN-3 (seq 23, GATE closed).** Pin `20261007b`; yetki devriyle Claude kararı (birebir alıntılar LEDGER'da). `ORTAK-KURALLAR.md` kullanıcı kararıyla silindi. Ayrıntı: [evidence/D2F-15/KANIT.md](evidence/D2F-15/KANIT.md), [YAYIN.md](evidence/D2F-15/YAYIN.md).
- **D2F-14 — YAYIN-3 onayı bekleniyor (seq 22, GATE waiting).** Yayın hazırlandı, yapılmadı. Öneri: pin `20261007b`; `main`'e 3 yerel commit (ff-only); çalışma zamanı farkı yalnız `quranCurriculumV2.js` (aynı `20261007a` pininde değişmiş). Canlı pin artık `20261007a` (erken yayın), panel-v2 styles pini zaten yükseltilmiş. Ayrıntı: [evidence/D2F-14/KANIT.md](evidence/D2F-14/KANIT.md).
- **D2F-13 NOT (seq 21).** Kullanıcı isteğiyle: `MediaRecorder` plan-check uyarısı deterministik kapıya çevrildi (self-test 41/41, `PASS (0 warn)`); D2-12 `8bf8f658` **geri alınmadı**, gerekçeli kararla kayda geçti (geri alma yolu LEDGER seq 21).
- **D2F-13 — Baştan sona doğrulama (seq 20).** `kapilar.sh` bayraklı ve bayraksız TÜM KAPILAR YEŞİL; tekrar-uret-2 **9/9** (N-08 erken yayınla kapanmıştı), tekrar-uret 10/10, test_kao2_denetim 10/10, plan-check PASS, d2f strict PASS, perf-ab best3 1,098, kabul A-1…A-10 PASS. Sonuç belgesi: [DUZELTME-SONUCU.md](DUZELTME-SONUCU.md); kanıt: [evidence/D2F-13/KANIT.md](evidence/D2F-13/KANIT.md). Açık: L2 (0/37), 13 namaz kelimesi, K-3 ses, cihaz kabulü, ekran okuyucu, D2-06 canlı bayt eşitliği, D2-12 `8bf8f658`.
- **D2F-12 — Kararlar uygulandı (seq 18–19; uygulayıcı Copilot CLI, karar Claude seq 17 — düzeltme notu seq 25).** L1=B devir kararı: 158 kayıt `ai-delegated` + `delegatedBy:"owner"` + `delegatedAt:"2026-10-02"`; kullanıcı incelemesi gibi gösterilmedi. u09.01 başlık/hedef gerçek fiil kartlarına uyarlandı. N-04 PASS. Gerçek L2 onayı hâlâ yok. Ayrıntı: [evidence/D2F-12/KANIT.md](evidence/D2F-12/KANIT.md).
- **Yetki devri (seq 17, NOTE).** Kullanıcı kapı kararlarını Claude'a devretti; ORTAK-KURALLAR §10 eklendi (devredilemez: L2, cihaz kabulü, seyma-data, adıyla belirtilmemiş yayın). D2F-11 devir kararı: **L1 = B, u09.01 = 1** (kullanıcı onayı değil, devirle Claude kararı). GATE `waiting` kalır; D2F-12 kutusuna `yetki devri: seq 17` yazılır.
- **D2F-11 — Kullanıcı kararı bekleniyor (seq 16, GATE waiting).** İki soru: (1) 158 metnin L1 onay kaynağı — A sen incelersin / B `ai-delegated` yazılır / C yalnız belge; (2) u09.01 başlık↔kart — 1 başlık+hedef kartlara uyar / 2 emir biçimi kartta (bugünkü veriyle mümkün değil) / kendi metin. Beklenen cevap: D2F-12 kutusunda `L1 kararı: X` + `u09.01: Y`. Metin/veri/kod değişmedi. Ayrıntı: [evidence/D2F-11/KANIT.md](evidence/D2F-11/KANIT.md).
- **D2F-10 — Eski program kayıtları (seq 15).** KAO2-FIX LEDGER seq 123–126 (K2F-43 GATE closed-inferred, K2F-34/K2F-38/denetim-2 NOT), K2F-43 KANIT + K2F-34 YAYIN geriye dönük, CURRENT-STATE baştan, FIX-STATE/README/KAPANIŞ §8. N-06, N-07 PASS. Ayrıntı: [evidence/D2F-10/KANIT.md](evidence/D2F-10/KANIT.md).
- **D2F-09 — Süreç kuralları araçla (seq 14).** `d2f-sync-check.mjs --strict`: baseCommit'ten sonraki D2F commit'lerine (a) tam bir commit, (b) önek, (c) yayın yalnız D2F-15 + YAYIN.md,
  (d) KANIT 8 bölüm + tekil Oturum, (e) GATE closed/waiting, (f) bayat "Canlı gerçekler" kapısı. `--audit-k2f` aynı kuralları KAO2-FIX dönemine yalnız rapor olarak uygular.
  `kapilar.sh` `--strict`'i koşar. D2F-01…08'in delikleri `strictExceptions`'ta gerekçeli; yeni ihlal geçmez. Ayrıntı: [evidence/D2F-09/KANIT.md](evidence/D2F-09/KANIT.md).
- Önlem: M-05/M-07/M-12 tekrarına karşı (D2-12, E-8, E-10); N durumları değişmedi.

## Açık bulgular (N durumları)
N-01…N-09 **pass**. N-04, D2F-12'de L1 kaynak dürüstlüğü ve u09.01 tutarlılığıyla kapandı.

## Ortam notu
- **`kao-plan-check` (seq 13 NOTE ile giderildi):** `8e583a9` ("denetim-2:" öneki) için aracın tek-hash istisna listesine daraltılmış kayıt eklendi; araç PASS.
- Konteyner sığ klonla ve `rsync`'siz gelebilir. İlk kapı koşusundan önce `git rev-parse --is-shallow-repository` ve
  `which rsync` (gerekirse `git fetch --unshallow origin`, `apt-get update && apt-get install -y rsync` — `update` olmadan kurulum başarısız).
- `test_kao2_kabul.js` ve `test_kao2_grammar_tasks.js` tek başına yavaş koşar; kapılar ~15–22 dk.
