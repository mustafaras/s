# D2F-07 · Müfredat eşleme sayfası gerçeği yazsın · KANIT

Oturum: https://claude.ai/code/session_1f48752b-ccea-476d-8043-aecb83e71957
Tarih: 2026-10-07 · baseCommit `cbe0d604` · önceki commit `e7b2c170` (D2F-06 NOT) · bu oturumun dalı `d2f-07`.

## İlerleme günlüğü
1. ORTAK-KURALLAR okundu; `D2F-STATE.json.nextPrompt` = `D2F-07` (uyuşuyor). Başlangıçta `d2f-sync-check` PASS (seq 10).
2. Sorun doğrulandı: `docs/kuran-ogreniyorum/kao2/inceleme/MUFREDAT-ESLEME.md` (araç üretir) hâlâ
   "> … Tüm başlık ve vaatler taslaktır (`review.level: draft`)." yazıyordu ve `## Karar bekleyen noktalar` + boş
   `## Onay (G2)` kutuları taşıyordu. Oysa `texts.tr.json`'da **draft 0** (hepsi `sourced`) ve G2 kararı
   `kao2-duzeltme/FIX-STATE.json` `decisions.G2`'de **2026-10-02** tarihiyle kayıtlıydı.
3. Fikstür önce genişletildi (kırmızı): `tests/kao/test_kao2_curriculum.js` — mevcut kutu kontrolü `[ xX]` olacak şekilde
   gevşetildi ve iki yeni kontrol eklendi (D2-11 sayı/G2 · D2-11·K3-07 G2 başlığı). Kırmızı, beklendiği gibi
   `AssertionError: sayfa toplam metin 133 yazmalı` ile alındı.
4. Araç düzeltildi: `renderReview` artık durumu **veriden** yazar (`reviewStatus`) ve G2 kararını okur (`readG2Decision`,
   `kao2-duzeltme/FIX-STATE.json` → `decisions.G2`, korumalı: dosya yok/bozuksa `null`).
5. Sayfa yalnız `node tools/kao2-curriculum-build.mjs` ile yeniden üretildi (elle dokunulmadı). Test GREEN.

## Yapılan (tek commit'in üretim-dışı + fikstür değişiklikleri)
- `tools/kao2-curriculum-build.mjs`:
  - Yeni yardımcılar: `reviewLevel(entry)`, `reviewStatus(data)` (ünite + ders + S0 girdilerinden `total/draft/sourced/expert`),
    `readG2Decision()` (`FIX-STATE.json` `decisions.G2` metnini `·` ile tarih/özet olarak ayrıştırır; geçersizse `null`).
  - `renderReview` başlık satırı: `draft === 0` → "… draft 0 … Tüm başlık ve vaatler onaylıdır (`sourced`), uygulamada görünür.";
    aksi halde taslak uyarısı. Sayılar `texts.tr.json`'dan türetilir.
  - Karar bölümü: G2 kayıtlıysa `## G2 kararı (2026-10-02)` + `> <özet>` + gerekçe maddeleri + **işaretli** onay satırları
    (`- [x]` ×3); G2 yoksa eski `## Karar bekleyen noktalar` + boş `## Onay (G2)` kutuları korunur (geriye dönük).
- `docs/kuran-ogreniyorum/kao2/inceleme/MUFREDAT-ESLEME.md`: **yalnız araç çıktısı** (elle düzenlenmedi).
- `tests/kao/test_kao2_curriculum.js`: D2-11 (+ K3-07) kontrolleri; mevcut kontrol gevşetilmedi, kutu regex'i `[ xX]` yapıldı.

Dokunulmadı: `app.js`, `app/core/*`, `sync.js`, pinler/`sw.js`, `migrate()`, FSRS, `test_kao2_kabul.js`, aracın diğer çıktıları.
Yeni `App.kao*` handler eklenmedi.

## TDD
Önce kırmızı alındı: yeni kontroller düzeltme öncesi sayfada başarısız oldu
(`AssertionError: sayfa toplam metin 133 yazmalı`). Sonra araç düzeltildi, sayfa yeniden üretildi → GREEN.
İki mutasyon (aşağıda) da yeni kontrolleri **izole** eder (her biri çıkış 1).

## Kapılar
`KAO2_ACCEPT_SLOW_HOST=1 bash kao2-duzeltme/tools/kapilar.sh` (tam koşu, bu oturumda):
```
== KAO2-FIX kapıları ==
mod: YAVAŞ MAKİNE (KAO2_ACCEPT_SLOW_HOST=1) — yalnız göreli p95 bandı atlanır, mutlak tavanlar zorunlu
node --check quranLearn.js         PASS
node --check quranLearnFlow.js     PASS
node --check quranLearnViews.js    PASS
node --check quranCurriculumV2.js  PASS
node --check quranGrammarV1.js     PASS
tests/kao (54)                     PASS
tests/app (77)                     PASS
tests/panel (23)                   PASS
tests/panel-v2 (27)                PASS
tests/quran (9)                    PASS
reminders smoke                    PASS
run-seyma driver                   PASS
run-seyma zikr                     PASS
kontrast                           PASS
l2-paket --check                   PASS
kao-plan-check                     FAIL
fix-sync-check --repro             PASS
== tekrar-uret özeti ==
KAO2 denetim tekrar üretimi: 10/10 PASS · 0 FAIL
== perf ==
KAO2 perf: PASS (content 183.544 KiB · runtime 117.350 KiB · css 13.035 KiB · p95 4.239 ms · steady 2.855 ms · GÖRELİ BANT ATLANDI (yavaş makine): steady 2.855 ms ≤ bant 6.360 ms)
SONUÇ: KIRMIZI KAPI VAR
```
Ayrı koşular (bu oturumda):
- `node kao2-duzeltme/denetim-2/tekrar-uret-2.cjs` → **5/9 PASS** (N-01, N-02, N-03, N-08, N-09; D2F-05/D2F-06'da da 5/9 idi — **azalmadı**).
- `node kao2-duzeltme/denetim/tekrar-uret.cjs` → 10/10 PASS · 0 FAIL.
- `node kao2-duzeltme/denetim-2/tools/d2f-sync-check.mjs` → **PASS** (D2F-07 done · nextPrompt D2F-08 · seq 11 · N 5/9 · pin `20261007a`).

**Tek kapı kırmızısı — `kao-plan-check`, ortam kaynaklı, D2F-07 ile ilgisiz:**
```
FAIL commit 8e583a9 KAO dosyasına tanınmayan önekle dokunuyor ("denetim-2: A-4 (yerel saat) ve settings sınırı (git --all) o"): tests/kao/test_kao2_kabul.js
```
`8e583a9`, bir önceki **seq 10 NOTE** commit'idir; öneki (`denetim-2:`) plan aracının tanıdığı KAO önekleri dışında kalıyor.
Bu kırmızı **temiz HEAD'de, bu oturumun hiçbir değişikliği olmadan da aynı** — `git archive HEAD` ile unpack edilmiş kopyada
doğrulandı. Yani D2F-07'den bağımsızdır ve düzeltmesi prompt dosya listesi (§3) dışındadır (commit mesajı kuralını ilgilendirir).

## Ölçümler
- `node tests/kao/test_kao2_curriculum.js` → **çıkış 0, PASS (15 kontrol)**:
```
KAO2 curriculum: PASS (15 kontrol)
```
- **İki üretim bayt-eşit + depodaki çıktıyla aynı** (`--out-dir` ×2):
```
BYTE-EQUAL  docs/kuran-ogreniyorum/kao2/inceleme/MUFREDAT-ESLEME.md
  = repo çıktısı
BYTE-EQUAL  app/content/quranCurriculumV2.js
  = repo çıktısı
```
  (Fikstürün `(g)` kontrolü de aracı iki kez koşup aynı eşitliği bağımsız doğrular.)
- **Bağımsız taslak sayımı** (`texts.tr.json`, özyinelemeli): `{"sourced":158}` → `draft: 0`. Sayfada "taslaktır" metni yok.
- **Üretilen sayfa (kanıt satırları):** başlık satırı "Metin durumu: 133 metin · draft 0 · sourced 133 · expert 0. Tüm başlık ve
  vaatler onaylıdır (`sourced`), uygulamada görünür."; `## G2 kararı (2026-10-02)`; üç `- [x]` onay satırı. Eski
  `## Karar bekleyen noktalar` ve boş `## Onay (G2)` blokları **yok**.
- **Mutasyon A** (scratchpad; `renderReview` durum satırı sabit "Tüm başlık ve vaatler taslaktır." yapıldı, commit edilmedi):
  çıkış **1**, ilk anlamlı satır `AssertionError [ERR_ASSERTION]: sayfa toplam metin 133 yazmalı`.
- **Mutasyon B** (scratchpad; `readG2Decision` içinde `const raw = decisions && decisions.G2;` → `const raw = null;`, commit edilmedi):
  çıkış **1**, ilk anlamlı satır `AssertionError [ERR_ASSERTION]: sayfa "## G2 kararı (2026-10-02)" yazmalı`.
- Pinler (değişmedi; bu promptta dokunulmadı): App.kao* 45 · App yüzeyi 766 · atama 604 · onclick 393 · yayın `20261007a`.
- `git diff --stat`: `docs/kuran-ogreniyorum/kao2/inceleme/MUFREDAT-ESLEME.md` (+18/−9) · `tests/kao/test_kao2_curriculum.js` (+48) ·
  `tools/kao2-curriculum-build.mjs` (+81/−…). `quranCurriculumV2.js` **değişmedi**.

## Bilerek değişen testler
- `tests/kao/test_kao2_curriculum.js` yalnız **genişletildi**: mevcut "inceleme listesi tam" kontrolündeki kutu beklentisi
  `/- \[ \] /` → `/- \[[ xX]\] /` yapıldı (kutu artık G2 durumuna göre işaretli olabilir; işaret zorunluluğu ayrı kontrolle konur).
  Hiçbir kontrol gevşetilmedi/kaldırılmadı.

## Kanıt düzeyleri
- **kaynak/test:** yukarıdaki tüm koşular bu oturumda, bu makinede.
- **yayın:** bu prompt yayın yapmadı; pin `20261007a` yalnız depodan okundu, canlı doğrulanmadı.
- **cihaz:** yok.

## Sürprizler
1. **`kao-plan-check` kırmızısı bu oturumda yeni göründü ama yeni değil:** seq 10 NOTE commit'inin öneki plan aracının
   tanımadığı bir önek olduğundan denetim düşüyor. Temiz HEAD kopyasında aynı → D2F-07 ile ilgisiz. Kullanıcıya not edildi.
2. Sayfa artık "taslak yok" gerçeğini yazdığı için, gelecekte bir metin yeniden `draft`'a düşerse durum satırı otomatik olarak
   taslak uyarısına döner (veriden üretim); bu davranış fikstürün `if (stat.draft === 0) … else …` dalıyla korunur.
