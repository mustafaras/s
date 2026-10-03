# K2F-24 — Uygula 2/2 — Ünite 2 namaz çapası
Tarih: 2026-10-03 · Dal: kao2-duzeltme · Önceki commit: ab19144e · Uygulayıcı: Claude Sonnet 5.5
Kapatılan bulgular: K3-02 · D-07 · R değişimi: yok (10/10 korunur)

## İlerleme günlüğü
- [x] P1: sync PASS (24/44, seq 68, pin 20261003a), dal kao2-duzeltme, FIX-STATE in_progress
- [x] Kırmızı test (lesson_flow, 5 yeni kontrol)
- [x] Araç: lp_* → l_* eşleme + prayer-lemma-map.json + NAMAZ-ESLEME-L2.md
- [x] applyWords eşlemeyi kullanır (+ tanış kartı çapası)
- [x] Kapılar yeşil, P4 kapanış

## Yapılan
- `tools/kao2-curriculum-build.mjs`: `buildPrayerMap` — harekesiz iskelet (hançer elif hem silinmiş hem elife çevrilmiş iki biçim; elif/ya biçimleri birleşik), yalnız yaygın önek (ve, bi, li, fe, el, vel) ve zamir eki (ke, he, ye, nâ, küm, hüm, hâ) ayıklanmış TAM eşitlik, çekirdek ≥2 harf; **tek aday → eşleme, birden çok aday ya da aday yok → eşleme yok**. Kod yalnız `\uXXXX` kod noktaları kullanır; çıktılarda Arapça harf yok (P9).
- Çıktılar: `docs/kuran-ogreniyorum/kao2/content/prayer-lemma-map.json` (map + details), `docs/kuran-ogreniyorum/kao2/inceleme/NAMAZ-ESLEME-L2.md` (eşleşmeyenler: kimlik, okunuş, anlam, metin, neden, adaylar + eşlenenlerin listesi), `QuranCurriculumV2.prayerLemmaMap` (modüle yalnız `map` girer).
- Ünite apply: ilk lemması örnek cümleye düşen ders, çapa namaz metinlerinden dersin lemmalarını (doğrudan ya da eşlemeyle) EN ÇOK içereni alır (eşitlikte çapa sırası). u02.01 `tekbir` kaldı; u02.02 ve u02.03 `examples` → `prayer:tahiyyat`.
- `app/core/quranLearnFlow.js`: `applyWords` lp_* kelimenin durumunu eşlenen lemmadan türetir (`lemmaId` aynen, ek alan `mappedLemmaId`); tanış kartı çapası eşlenen kelimeyi bulur. `masteryRead` aynı yolu kullanır.
- Ölçüm: 30 benzersiz lp_* kelimesinden **18 eşlendi, 12 eşlenmedi** (11 aday yok, 1 birden çok aday: `lp_c7d096cadc` kul/kulluk etti).

## TDD
- Kırmızı: `node tests/kao/test_kao2_lesson_flow.js` → `AssertionError: eşleme sayısı 0` (test_kao2_lesson_flow.js:253)
- Yeşil: `node tests/kao/test_kao2_lesson_flow.js` → PASS (17 kontrol)

## Kapılar (P3)
kapilar.sh: tests/kao 52 · app 77 · panel 23 · panel-v2 27 · quran 9 · reminders · driver · zikr · kontrast · plan-check · sync PASS — SONUÇ: TÜM KAPILAR YEŞİL
tekrar-uret: 10/10 PASS (önceki 10/10)

## Ölçümler
- Eşleme bayt-eşit: araç `--out-dir` çıktısı ile `quranCurriculumV2.js`, `prayer-lemma-map.json`, `NAMAZ-ESLEME-L2.md`, `MUFREDAT-ESLEME.md` `cmp` ile aynı.
- Eşleşmeyen liste var: 12 satır (hedef: liste mevcut).
- Bütçe: müfredat modülü gzip 21,936 B (tavan 48 KiB) · içerik 185,223 KiB (tavan 256) · runtime 112,810 KiB (tavan 128).
- Pinler değişmedi: App.kao* 44 · yüzey 765 · atama 603 · yayın 20261003a.

## Bilerek değişen testler
- tests/kao/test_kao2_lesson_flow.js (K2F-23 kontrolü): "çapa metni olmayan ders sayısı" 97 → 95 · Ünite 2'nin 2 dersi artık namaz çapasına bağlı (örnek cümle modu gerekmiyor) · K3-02/D-07.

## Kanıt düzeyleri
- Kaynak/test: ✓ · Yayın: yok (değişen yayın varlıkları: quranLearnFlow.js · quranCurriculumV2.js; pin yükseltilmedi) · Cihaz: yok (kullanıcıda)

## Sürprizler / sonraki promptlara not
- Üretici araç tüm çıktıları yeniden yazar; `INCELEME-KAO2-17.md`/`-18.md` onay kutuları sıfırlandığı için bu iki dosya `git checkout` ile geri alındı (Dokun listesinde yoktu).
- Eşleme yalnızca eşit iskelette çalışır; çekim/çoğul/fiil (ör. aşhadu, salavât, tahiyyât, ʿibâd) bilerek eşlenmedi → L2 listesinde. Ünite 2 odak lemmalarından yalnız suboHa_n, sala_m, Tay_iba_t, baraka_t, raHomap, rasuwl namaz metinlerine bağlanır; Salaw_p, Eabod (iki aday), ahida, ilaY, Ean bağlanmaz.
- Eşlenen bazı kelimeler Ünite 1 lemmalarına gider (ör. EalaY, rab, Hamod); ilgili ders tamamlanmışsa "known" görünür.
