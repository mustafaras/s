# D2F-11 · Sana iki karar sorulur (L1 onayı + u09.01) · KANIT

Oturum: https://claude.ai/code/session_afe16637-db13-4eeb-b52b-173a6da8c19c
Tarih: 2026-10-07 · önceki commit `618791e9` (D2F-10) · dal `d2f-07`.

## İlerleme günlüğü
1. ORTAK-KURALLAR okundu; `nextPrompt` = `D2F-11` (uyuşuyor), `d2f-sync-check --clean` PASS.
2. `texts.tr.json` review alanları, `quranLexiconV1.js` / `quranCurriculumV2.js` (node:vm), `INCELEME-KAO2-17/18.md`, `MUFREDAT-ESLEME.md`, CLAUDE.md/AGENTS.md KAO2 satırı okundu.
3. Seçenekler somutlaştırıldı; LEDGER `GATE waiting` + durum kayıtları yazıldı. Metin/veri/kod değişmedi.

## Yapılan
Yalnız bu klasörde kayıt: bu KANIT, LEDGER seq 16 (`GATE · D2F-11`, `status: waiting`), CURRENT-STATE, D2F-STATE. Hiçbir metin, veri, araç, test, pin değişmedi.

### Ölçülen olgular (bu oturumda okundu)
- `texts.tr.json`: **158 metin**, hepsi `review.level:"sourced"`, hepsi `by:"owner"`, hiçbirinde `delegatedBy` yok. (INCELEME-KAO2-17: 133 + INCELEME-KAO2-18: 25 = 158; ikisinde de bütün L1 kutuları `[x]`.)
- CLAUDE.md ve AGENTS.md KAO2 satırı: "L1 (proje sahibi) ve L2 (alan uzmanı) onayı kullanıcıda — … 158 inceleme kaydı `sourced`". Yani veri (`by:"owner"`), kutular (`[x]`) ve belge ("kullanıcıda") birbirini tutuyor, ama kutuları kullanıcı değil Claude işaretledi (raporun D2-04/D2-10/K5-04/M-01 bulgusu).
- u09.01 (`texts.tr.json` + `quranCurriculumV2.js` aynı):
  - başlık: "Emir kipi: an, ye, ver, bağışla"
  - hedef: "Anmak, yemek, merhamet etmek, bağışlamak ve vermek fiillerinin emir biçimini tanıyacaksın."
  - kavram `g17` "Emir: yap!, deyin!"; ders kelimeleri (`quranLexiconV1.js`): zakara "andı, hatırladı" · akala "yedi" · rahima "merhamet etti, acıdı" · gafara "bağışladı, örttü" · âtâ "verdi". Tanış kartları bu anlamları gösterir → geçmiş zaman; başlık/hedef ise emir diyor (çelişki).
  - İçerik modülünde lemma başına **emir biçimi alanı yok** (alanlar: id, ar, translit, meanings, root, pattern, pos, freq, cognate, examples, examplesException, verified, semNeighbors). Emir biçimleri yalnız **âyet örneklerinde** geçer (`examples[].ar/tr`): اذكروا "hatırlayın" (2:40) · كلا "yiyin" (2:35) · ارحمنا "bize acı" (2:286) · اغفر "bağışla" (2:286) · آتوا "verin" (2:43).

## TDD
Uygulanmaz: bu promptta kod/veri/test değişmez (promptun kendi kuralı). Kırmızı/mutasyon yok. N-04 bu prompt sonunda da FAIL kalır (kullanıcı kararı bekleniyor).

## Kapılar
Kod değişmediği için tam `kapilar.sh` koşulmadı (bilerek; yalnız kayıt dosyaları). Koşulanlar ve sonuçları aşağıda "Ölçümler"de.

## Ölçümler
`d2f-sync-check.mjs` (--clean / varsayılan / --strict), `tekrar-uret-2.cjs` ve `tekrar-uret.cjs` bu oturumda koşuldu; sonuçlar:
- `D2F senkron: PASS · 11/16 prompt done · nextPrompt D2F-12 · ledger seq 16 · N 8/9 pass · App.kao* 45 · yüzey 766 · atama 604 · onclick 393 · pin 20261007a`
- `D2F strict: 18 commit incelendi (cbe0d604…HEAD) · 9/9 kayıtlı istisna kullanıldı` (bu commit öncesi hâl)
- `tekrar-uret-2.cjs`: 8/9 PASS · 1 FAIL (N-04, kullanıcı kararı bekliyor) — azalmadı · `tekrar-uret.cjs`: 10/10 PASS

## Bilerek değişen testler
Yok.

## Kanıt düzeyleri
Kaynak/test ✓ (yalnız okuma/ölçüm) · yayın — · cihaz —.

## Sürprizler
1. 158 metnin tamamında `by:"owner"` yazıyor; "devir" bilgisi (kullanıcının onayı Claude'a bıraktığı) veride hiçbir yerde yok — B seçeneği bu bilgiyi ilk kez veriye yazar.
2. Emir biçimi lemma alanı olarak yok; seçenek 2 yalnız âyet örneklerinden (elle Arapça yazmadan, mevcut `examples` alanından) beslenebilir, bunun için `render`/`quranLearn.js` dokunuşu gerekir.

---

## KARARLAR — seçeneklerin tam metni

### Karar 1 — L1 onayının kaynağı
- **A — Sen incelersin.** 158 metni sen okur, `INCELEME-KAO2-17.md` ve `-18.md`'deki L1 kutularını kendin işaretlersin. İşaretlemediğin metin `draft` olur ve uygulamada gizlenir (yerine "Ünite N · Ders M" yazar). En dürüst yol; sana iş çıkarır, bazı başlıklar kaybolabilir.
- **B — Onaylar yerinde kalır, veri gerçeği söyler.** Metinler görünür kalır; her metnin `review`'ı `by:"ai-delegated"`, `delegatedBy:"owner"`, `delegatedAt:"2026-10-02"` olur (kullanıcının devriyle Claude işaretledi). Görünürlük değişmez. İstersen sonra A'ya geçebilirsin.
- **C — Veri aynı kalır, yalnız belge düzelir.** `by:"owner"` kalır; yalnız CLAUDE.md/AGENTS.md "kutuları Claude işaretledi, sen incelemedin" diye düzeltilir. En ucuz; veri hâlâ "owner" der ve bu yanlıştır.
- Öneri: **B** (görünürlüğü bozmadan veriyi ve belgeyi gerçeğe uydurur).

### Karar 2 — u09.01 başlık/hedef ↔ tanış kartı uyumsuzluğu
- **1 — Başlık ve hedef kartlara uyar.** Önerilen metin:
  - başlık: **"Anmak, yemek, vermek: fiil kökleri"**
  - hedef: **"Anmak, yemek, merhamet etmek, bağışlamak ve vermek fiillerini tanıyacaksın."**
  (Emir kipi iddiası kalkar; geçmiş zaman kartlarla uyumlu. Yeni metin `draft` başlar, `sourced` yapmak sana kalır.)
- **2 — Başlık kalır, tanış kartında emir biçimi de gösterilir.** **Bugünkü veriyle mümkün değil (kendi başına):** içerik modülünde emir biçimi alanı yok, elle Arapça yazılamaz. Emir biçimleri yalnız âyet örneklerinde var (اذكروا, كلا, ارحمنا, اغفر, آتوا); bunları kartta öne çıkarmak `app/core/quranLearn.js`/içerik aracı dokunuşu ister → D2F-12'nin dokunma listesinde yok, **BLOCKED + yeni prompt** gerekir.
- **Ya da kendi metnin:** başlık + hedef metnini yaz (yalnız Türkçe; `draft` başlar).
- Öneri: **1**.
