# K2F-37 — a11y ve tasarım sözleşmesi matrisi
Tarih: 2026-10-06 · Dal: claude/nifty-feynman-y2kva3 · Önceki commit: b345a6c1 · Uygulayıcı: Claude Sonnet 5.5
Kapatılan bulgular: K6-02 · K2-05 · R değişimi: yok (10/10 → 10/10)

## İlerleme günlüğü
- [x] P1: sync PASS, STATE in_progress
- [x] a11y matrisi yazıldı (görünümler kaynaktan türetilir)
- [x] matris gerçek kusurları buldu; KAO dosyalarında düzeltildi
- [x] dokunma hedefi (≥44 px) matriste CSS'ten çözülür; mutasyon kanıtı
- [x] design_contract görünüm listesi kaynaktan türetildi (18 görünüm × boş/tohumlu)
- [x] kapılar

## Yapılan
- `test_kao2_a11y.js`: sabit 15 görünümlük liste kalktı; görünüm listesi `quranLearnFlow.js` `VIEWS` ∪ `quranLearn.js` `KAO_VIEW_TITLES` kaynak metninden türetilir (18 görünüm, tekrarsız; `map` → `stats` takma adı bilinir). **Matris 445 yüzey:** {boş, tohumlu} × 18 görünüm + ek ünite/sûre/kavram/kelime örnekleri + ilk açılış (1, 2, yerleştirme okuma, yerleştirme dinleme, 3, legacy "yenilikler", başlangıcı değiştir) + ders oynatıcı (4 farklı ders: her aşama, her görev türü, cevap sonrası panel-açık doğru/yanlış, özet) + tekrar oturumu (odak modu) + ustalık (başlangıç, kaldı özeti) + onarım + S0 (12 ders × her aşama/alıştırma).
- Her yüzeye uygulanan kurallar (mini HTML ayrıştırıcıyla, miras alınan lang/dir ve kimlik grafiğiyle): düğme adı · tıklanabilir öğe düğme/bağlantı (kabuk hariç) · yinelenen id · kırık aria-labelledby/describedby/controls · form alanı etiketi · Arapça metin miras lang="ar"+dir="rtl" (aria-hidden süs hariç) · aria-live yalnız polite · aria-current="step" ≤1 · pozitif tabindex yok · role=img adlı · tek `role=dialog aria-modal` ve adı · NavBar ≤1 · dolgulu birincil ≤1.
- Dokunma hedefi: yüzeylerde çizilen her düğme/bağlantı için CSS'ten (sınıf/etiket/boşluk-">" seçicileri, `var()` çözümü) en küçük yükseklik çözülür; 42 imza hepsi ≥44 px; istisna listesi (`TOUCH_EXEMPT`) boş.
- Kontrast: kontrast aracı aynı testte (778 çift, 0 ihlal); yeni renk çifti eklenmedi, araç değişmedi.
- `test_kao2_design_contract.js`: görünüm listesi aynı kaynaktan türetilir (18 görünüm; `unit`, `concept`, `grammar`, `roots`, `s0`, `sources` artık dahil); S0 görünümü başlamış ders ister (kayıt yalnız o adımda serbest); primaryPerView ≤1 hepsinde.

## Matrisin bulduğu ve düzelttiği gerçek kusurlar
1. **Gate (Harf kontrolü) mini ders listesi/başlığı:** "Kalınlık: ط ض ص" vb. 4 başlıkta Arapça harfler lang/dir taşımıyordu → `kaoMarkArabic` (Arapça parçalar `<span lang="ar" dir="rtl">`). Kaynak: `quranLearn.js`.
2. **Ders oynatıcı kavram tablosu:** hücrelerdeki Arapça (ör. مَن, لَو) lang/dir'siz → `escapeMixed` (Views `concept` aşaması hücreleri). 3 derste (u04.01, u10.01, u12.01) görüldü.
3. **Kök arama kutusu (Kök aileleri):** `<input type="search">` erişilebilir ada sahip değildi (yalnız placeholder) → `aria-label="Kök ara"`.
Üçü matris ilk koştuğunda 19 ihlal olarak çıktı; düzeltmeden sonra 0.

## TDD
- Kırmızı: `node tests/kao/test_kao2_a11y.js` → "a11y ihlali (19): boş/gate: Arapça lang!=ar: Kalınlık: ط ض ص …" ve (ayrı) "boş/roots: etiketsiz alan <input type="search" …".
- Yeşil: a11y 12 kontrol PASS (matris 445 yüzey) · design_contract PASS.

## Mutasyon kanıtı (commit edilmez)
- `.kao-navbar-action` `min-height:44px` → `30px` → "çözülemeyen ya da 44 px altı dokunma hedefi" FAIL; `app/kao.css` geri alındı (`git diff` boş).
- Üç düzeltme geri alınınca matris ilk koşudaki gibi kırmızı (kırmızı koşu bunun kanıtı).

## Kapılar (P3)
- tests/kao 51/53: yalnız `test_kao2_perf_budget` + kabul'ün katı A-10 göreli bandı (makine hızı; bkz. K2F-35 YAYIN.md) · tests/app 77 · panel 23 · panel-v2 27 · quran 9 · reminders · driver · zikr · kontrast · l2-paket · plan-check · sync PASS.
tekrar-uret: 10/10 PASS (önceki 10/10)

## Ölçümler
- Matris boyutu: **445 yüzey**, 18 görünüm kaynaktan; 42 dokunma-hedefi imzası hepsi ≥44 px.
- Test süresi: a11y ≈ 20 sn.

## Bilerek değişen testler
- test_kao2_a11y.js: (1) "tüm görünümlerde her düğme adı" testi matrise genişledi · K6-02/K2-05
- test_kao2_design_contract.js: görünüm listesi 12 sabit → 18 türetilmiş; S0 için başlamış ders · K2-05

## Kanıt düzeyleri
- Kaynak/test ✓ · Yayın: yok (kaynak değişti: quranLearn.js, quranLearnViews.js → bir sonraki yayında yeni pin) · Cihaz: yok (kullanıcıda; VoiceOver turu yapılmadı)

## Sürprizler / sonraki promptlara not
- Ders oynatıcı kavram tablosunda "Arapça" sütunu bazı satırlarda Arapça yerine sûre/âyet/kelime referansı gösteriyor (u04.01: "2:17:3"); içerik/tasarım bulgusu, bu promptun kapsamı dışı — LEDGER NOTE.
- Kök dizin yasağı: matris `$TMPDIR` kullanmaz; geçici dosya yok.
