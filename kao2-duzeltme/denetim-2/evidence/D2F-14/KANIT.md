# D2F-14 · Yayın özeti ve onay sorusu (YAYIN-3) · KANIT

Oturum: claude-code:b9936220-be4d-4f19-8846-806b9a508105
Tarih: 2026-10-07 · önceki commit `5f72ba5f` · dal `main`.

## İlerleme günlüğü
1. ORTAK-KURALLAR okundu; `nextPrompt=D2F-14`, ağaç temiz.
2. `git diff --stat 6796d87a..HEAD -- app/ index.html sw.js panel-v2.html` ve `59abe97b..HEAD` ölçüldü.
3. `git fetch` bu ortamda ağ (403/sandbox) nedeniyle çalışmadı; uzak durum yalnız yerel `origin/main` izleme referansından okundu.
4. Prompt'un dayandığı "canlı pin 20261006e" varsayımı **bayat** çıktı (aşağıda).

## Yapılan
- Yalnız kayıt: bu KANIT, LEDGER seq 22 (`GATE waiting`), CURRENT-STATE, D2F-STATE. Pin, `?v=`, `sw.js`, `main` ve push **değişmedi**.

## TDD
Yayın hazırlığı promptudur; yeni davranış ve test yok.

## Kapılar
Kod değişmedi; kapılar D2F-13'te yeşildi (DUZELTME-SONUCU.md §1). Bu oturumda yalnız `d2f-sync-check` koşulur (commit öncesi).

## Ölçümler
**Mevcut durum (git, bu oturum):**
| Ölçüm | Değer |
|---|---|
| `main` / HEAD | `5f72ba5f` |
| Yerel `origin/main` izleme referansı | `3f3b28cd` → HEAD **3 commit önde** (`2fe3abf6` D2F-12, `c7154f8b` + `5f72ba5f` D2F-13). Referans eski olabilir; fetch yapılamadı. |
| Kodda pin | `20261007a` (index.html, sw.js, panel-v2.html) — `59abe97b` ile (erken yayın, ORTAK-KURALLAR §9) |
| `59abe97b` yerel referansta mı | evet (`origin/main`'in atası); canlıda olduğu **doğrulanmadı** |

**Pin tabanından (`6796d87a`, 20261006e) HEAD'e fark** (`app/ index.html sw.js panel-v2.html`): 5 dosya, 62 ekleme / 43 silme:
`app/core/quranLearn.js`, `app/content/quranCurriculumV2.js`, `index.html`, `sw.js`, `panel-v2.html`.

**Erken yayından (`59abe97b`) sonra çalışma zamanı farkı:** yalnız `app/content/quranCurriculumV2.js` (1 satır, araç çıktısı;
D2F-12 L1 `ai-delegated` kaydı + u09.01 metni). Bu dosya **aynı `?v=20261007a` pininde** değişti → canlıda `20261007a` önbelleği
olan tarayıcı/SW eski içeriği sunar. Yani yeni pin gerçekten gerekli.

**Prompt'taki iki varsayımın düzeltmesi:**
- "Canlı pin 20261006e" → artık `20261007a` (erken yayın).
- "panel-v2.html'de eski `app/styles.css?v=20260811a`" → `59abe97b`'de zaten `20261007a`'ya yükseldi (D2-08 kapalı, N-08 PASS). Yeni pinde panel-v2 yalnız tutarlılık için yükselir.

## Bilerek değişen testler
Yok.

## Kanıt düzeyleri
- **Kaynak/test:** fark ve pin ölçümleri bu oturumda koşuldu (K).
- **Yayın:** `20261007a`'nın canlıda olduğu ve bu 3 commit'in push edilmediği **yerel referanstan çıkarım**; ağ yok, doğrulanmadı.
- **Cihaz:** yok.
- **Kullanıcı onayı:** henüz yok — bekleniyor.

## Yayın önerisi (YAYIN-3, henüz uygulanmadı)
- **Yeni pin önerisi:** `20261007b` (bugün 2026-10-07 + sonraki harf).
- **Canlıya gidecek içerik:** `main`'e 3 yerel commit (`2fe3abf6`, `c7154f8b`, `5f72ba5f`; ff-only). Çalışma zamanı dosyası: `app/content/quranCurriculumV2.js`. Diğerleri belge/test/araç (`docs/`, `tests/kao/`, `tools/kao2-curriculum-build.mjs`, `kao-plan-check`, `kao2-duzeltme/`), sayfa davranışı değişmez.
- **Pin bumpı (D2F-15):** `index.html` (17 `?v=20261007a` + curriculum), `sw.js` (`SW_VERSION`, `SW_OFFLINE_VERSION='iip22-20261007b'`, ön-önbellek listesi), `panel-v2.html` (`app/styles.css` ve `panel/v2/panel-v2.css`), `20261007a` taşıyan 12 test (`test_iip_22`, `test_iip_09`, 4× `test_app_surface_*`, `test_header_*` ×2, `test_v3_welcome`, `test_kao2_curriculum`, 2× `panel-v2`).
- **Etki:** `20261007b` ile SW yeni sürüme geçer, eski önbellek temizlenir; kullanıcı uygulamayı yeniden açınca güncel L1/u09.01 içeriği gelir.
- **Geri alma:** pin commit'ini `git revert` (main geçmişi yeniden yazılmaz).
- Bu yayın, K2F-43'te (pin `20261006e`) açık kullanıcı onayı alınmadan yapılan yayını da açıkça onaylamış olur.

## Sürprizler
1. Prompt'un iki varsayımı (canlı pin, panel-v2 pini) erken yayın (§9) yüzünden bayat; yukarıda düzeltildi.
2. `quranCurriculumV2.js` pin değişmeden güncellenmiş: yayına alınmazsa canlı tarayıcılar eski L1 kaydını görmeye devam eder.
