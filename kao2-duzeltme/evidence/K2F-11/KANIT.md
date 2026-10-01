# K2F-11 — Gramer 3/3 — görev kurucu örnekten ve kavramdan
Tarih: 2026-10-01 · Dal: kao2-duzeltme · Önceki commit: fb4f4dab · Uygulayıcı: Claude Sonnet 5.5
Kapatılan bulgular: K4-02 (3/3) · K4-04 (ardışık aynı gramer türü) · R değişimi: R-03 PASS kalır

## İlerleme günlüğü
- [x] P1: sync PASS (11/44, nextPrompt K2F-11, seq 32); K2F-11 in_progress
- [x] Şablon envanteri: 86 şablon (Kelime dizme 18 · Parça çevir 25 · Anlam seç 19 · Ek çöz 13 · Çekim tablosu 4 · Arapça seç 2 · Kök bul 2 · Kalıp eşle 3); tablo yapıları incelendi
- [x] Kullanıcı kararı (Kelime dizme uyaran çelişkisi): "yönlendirecek ve öğretecek şekilde olmalı" → ilk kelime ipucu + cevap sonrası kural/âyet açıklaması; oracle'a dokunulmadı
- [x] Kırmızı: bölüm C (C1 `kaoGrammarSupport` tanımsız) görüldü
- [x] Tarifler (`gram*Recipe`), `kaoGrammarSupport`, `kaoBuildGrammarTask`, tür-bilen `kaoGrammarTaskValid`; arayüz order genellemesi + öğretici geri bildirim; Flow ardışık tür engeli
- [x] L2 listesi üretildi; Dokun dışı iki test dosyası kullanıcı onayıyla güncellendi (seq 33)
- [x] Kapılar, P4

## Yapılan
- `app/core/quranLearn.js`
  - Tarifler: **Kelime dizme** (`kind:'order'`, kelimeler örnek `words`'ten, karışık sıra çözülmüş değil, uyaran = ilk kelime + "Anlamı"/"İpucu" bağlamı) ·
    **Parça çevir** (uyaran = örnek Arapçası, doğru = örnek `tr`, çeldiriciler önce aynı kavramın, sonra başka kavramların örnek çevirileri) ·
    **Çekim tablosu** (yönergedeki hücre = satır başlığı + Türkçe hücre; erkek/kadın gibi birden çok eşleşmede seçilen satır yönergeye ve uyarana yazılır, ör. "o (kadın) yaptı"; cevap o satırın Arapça hücresi, çeldiriciler aynı tablonun hücreleri) ·
    **Ek çöz** (g1: "el + kelime", çeldirici "bir kelime"; g5: kelimeye yapışan ek; `'el + '` sabiti kalktı) ·
    **Anlam seç** (tek Arapça hücre + tek anlam/başlık; çok hücreli satırda metin hücresinden önceki en yakın Arapça hücre; g12 tekil/çoğul; g0_5 görev satırı) ·
    **Arapça seç** (belirsiz "bu" gibi yönergelerde seçilen satır yönergeye yazılır) · **Kök bul** (yalnız kökü listede olan satırlar) · **Kalıp eşle** (yalnız g21).
  - `kaoGrammarSupport(cardId)`: boş = destekli, aksi gerekçe; desteklenmeyen şablonda görev **kurulmaz** (`null`) → K2F-10 güvenlik ağı ders planında ikame eder / kuyrukta eler.
  - `kaoGrammarTaskValid` tür-bilen: Parça çevir (uyaran = örnek Arapçası, doğru = örnek çevirisi), Kelime dizme (sıra numaraları = örnek kelime sırası), Arapça seç'te boş uyaran serbest, Çekim tablosu uyaran = yönerge hücresi, örnekli şablonda uyaran örnek içinde.
  - `task.teach`: cevap sonrası "Âyet ref: “çeviri” · Kural: plainTr" (örneksiz şablonda yalnız kural) — geri bildirim panelinde gösterilir.
  - Arayüz: `kind:'order'` fragmana özel değil; sıra düğmeleri/aria-pressed gramerde de çalışır, boş şerit "Kelimeleri sırayla seç" (fragmanda "Önce fiili seç"), "Fiil önce gelir" notu yalnız fragmanda.
- `app/core/quranLearnFlow.js` (yalnız ardışık tür engeli): gramer türleri açgözlüyle yayılır; kaçınılmaz bitişik çift için araya kelime alıştırması konur.
- `tests/kao/test_kao2_grammar_tasks.js`: B1/B3/B6 düzenlendi (order-aware yürüyüşçü, B6 tüm-yanlış yürüyüş), bölüm C (C1–C9) eklendi; bölüm A'ya dokunulmadı.
- `docs/kuran-ogreniyorum/kao2/inceleme/GRAMER-SABLON-L2.md` (yeni; testin ürettiği liste, Arapça metin yok).
- Kullanıcı onayıyla Dokun dışı (seq 33): `tests/kao/helpers/kao-harness.js` (`playLesson` order-aware) · `tests/kao/test_kao_queue.js` (K2F-10'daki 3 tür → 4 tür geri).

## TDD
- Kırmızı: `node tests/kao/test_kao2_grammar_tasks.js` → C1: `AssertionError … actual: 'undefined', expected: 'function'` (`kaoGrammarSupport`); sonra C8: `u01.03: aynı tür ardışık Kelime dizme` / `u03.01: aynı tür ardışık Ek çöz` (K4-04) → Flow düzeltmesiyle yeşil.
- Yeşil: `test_kao2_grammar_tasks (bölüm A+B+C): 23 kontrol PASS`; tests/kao ailesi 49/49.

## Kapılar (P3)
```
node --check (5 modül) PASS · tests/kao (49) · app (77) · panel (23) · panel-v2 (27) · quran (9) PASS
reminders · driver · zikr · kontrast · kao-plan-check · fix-sync-check --repro PASS
SONUÇ: TÜM KAPILAR YEŞİL
KAO2 perf: PASS (content 183.287 KiB · runtime 102.469 KiB · css 12.938 KiB · p95 4.613 ms · steady 3.033 ms)
```
tekrar-uret: 5/10 PASS (önceki 5/10) — R-03 PASS kalır; kalan R-04…R-08 FAIL (beklenen)

## Ölçümler
- Destek: **71/86 şablon** (Kelime dizme 18/18 · Parça çevir 25/25 · Çekim tablosu 4/4 · Arapça seç 2/2 · Kök bul 2/2 · Anlam seç 14/19 · Ek çöz 5/13 · Kalıp eşle 1/3); **örnekli 43'ün 43'ü**. Desteklenmeyen 15 şablon gerekçeyle `GRAMER-SABLON-L2.md`'de.
- 109 ders yürüyüşünde gösterilen gramer görevi: **78 (başlangıç) → 37 (K2F-10) → 64 (K2F-11)**, kusur 0 (hedef ≥60 ✓); her derste alıştırma sayısı plana eşit, en az 9 (≥6 ✓).
- Her destekli şablon × 4 tohum (2026-09-29…10-02) geçerli görev kurar; Çekim tablosu cevapları yönergedeki satırdan, Anlam/Arapça seç/Ek çöz cevapları tablodaki aynı satırdan doğrulandı (C3/C4).
- Aynı kart ya da aynı gramer türü ardışık gelmez (C8, 109 ders).
- Bütçe: runtime 98,9 → 102,5 KiB (tavan 128); içerik ve css değişmedi.
- Pinler değişmedi: App.kao* 42 · yüzey 763 · atama 601 · yayın 20261001c (`quranLearn.js` + `quranLearnFlow.js` değişti → sonraki yayında pin yükselmeli).

## Bilerek değişen testler
- `tests/kao/test_kao_queue.js`: karma oturumda gramer türü 3 (K2F-10) → 4'e geri döndü · gerekçe: Çekim tablosu görev kurucusu düzeldi · K4-02 (kullanıcı onayı, seq 33).
- `tests/kao/helpers/kao-harness.js`: `playLesson` `kind:'order'` görevinde ordinal sırayla cevap verir (davranış başka yerde aynı) · gerekçe: çok adımlı Kelime dizme `test_kao2_mastery`/`test_kao2_view_resolution` yürüyüşünü kilitliyordu · K4-02 (kullanıcı onayı, seq 33).

## Kanıt düzeyleri
- Kaynak/test: ✓ · Yayın: yok (canlıda K2F-10 sürümü; sonraki yayında pin yükselmeli) · Cihaz: yok (kullanıcıda)

## Sürprizler / sonraki promptlara not
- `tekrar-uret.cjs` yürüyüşçüsü tek cevap veriyor; çok adımlı Kelime dizme'de aynı görevi tekrar tekrar sayıyor (R-03 "4035 görev"). R-03 PASS ama oracle zayıfladı; gerçek koruma C8. Oracle yürüyüşçüsü Dokun dışı, uygun promptta order-aware yapılabilir.
- Anlam seç'in eski kurucusu çok Arapça hücreli satırda yanlış anlam öğretiyordu (ör. tamlamada "âlemlerin Rabbi" cümlesini tek kelimeye atıyordu); oracle bunu yakalayamaz (örnek yok) — yeni kurucu bu satırları atlar, g2-k4/g19-k3/g20-k2 L2 listesinde.
- Kelime dizme'de uyaran = ilk kelime: 2 kelimelik parçada cevap kolaylaşır; kullanıcı "yönlendirecek ve öğretecek" dedi. Daha zor varyant L2/tasarım kararı.
- Doğrulayıcı `kaoGrammarTaskValid` K2F-10 sırasında başka bir süreçle eşzamanlı sıkılaştırılmıştı (tür eşleşmesi, boş uyaran); K2F-11'de tür-bilen yeniden yazıldı.

## Ek tur (kullanıcı isteği: "bunların hepsini düzeltmeden devam etmeyelim") — LEDGER seq 37
Araştırma dayanakları (web): [Kalyuga vd. uzmanlık-tersine-çevrilme ve rehberlik soldurma](https://link.springer.com/article/10.1007/s11251-009-9102-0) · [Sweller, guidance fading](https://cogscisci.wordpress.com/wp-content/uploads/2019/08/sweller-guidance-fading.pdf) · [Fyfe vd. concreteness fading](https://www.researchgate.net/publication/262943993_Concreteness_Fading_in_Mathematics_and_Science_Instruction_A_Systematic_Review) · [Bjork & Bjork 2011, desirable difficulties](https://bjorklab.psych.ucla.edu/wp-content/uploads/sites/13/2016/04/EBjork_RBjork_2011.pdf).
1. **Kavram sayfası**: doğrulanmış âyet örnekleri (kelime kelime okunuşlu, künyeli, çeviri) önce; sonra tablo; "Dikkat edilecekler" notları (`explanation[]`). Somut→soyut sırası. C10: 25 kavramın tümü.
2. **15 şablon → 83/86 destek**: kişi/şahıs tanıma (g13-k3, g15-k2, g17-k2; yinelenen biçimler soru ve çeldirici dışı), tamlama seçimi (g2-k4), masdar anlamı (g20-k2), fâil→mef'ûl (g19-k2) ve fiil→masdar (g20-k1) sütun eşleştirme, kelime listesi tablolarındaki 5 "Ek çöz" (g3-k1,k2 · g8-k3 · g11-k2 · g18-k1) → tablodan Türkçe→Arapça "Arapça seç" (üretim etkisi; arayüzde dürüst tür etiketi). Kalan 3 (g10-k3, g14-k2, g19-k3) yeni Türkçe içerik ister → gerekçe + öneriyle `GRAMER-SABLON-L2.md`.
3. **Dizme ipucu**: rehberlik soldurma — ipucu (ilk kelime) yalnız taze kartta (<2 tekrar) ve 3+ kelimede; sonra ipucusuz (istenen zorluk). Tüm 18 dizme örneği 3+ kelime; ipucusuz görev geçerli sayıldı.
4. **`tekrar-uret.cjs`**: yürüyüşçü order-aware (R-03 artık 4035 şişik ziyaret yerine 75 gerçek görevi sayar, 0 kusur); dizme için ipucu soldurma muafiyeti + dizme sırasını kaynak örnekle karşılaştıran yeni kural.
5. **Ölü yüzey — düzeltme**: rapordaki 6 handler'ın 3'ü (`kaoSetDailyNew/AudioStyle/Translit`) benim taramamın yanlış pozitifiydi (ayar arayüzü onları `kaoSegHTML('…')` dizeleriyle çağırıyor). Kalan 3 (`kaoRevealWord`, `kaoMarkUnderstood`, `kaoOpenMap`) testlerle bilerek sabit (App.kaoOpenMap shim'i `test_kao_render` pinli; öz-beyan/ pano dağıtıcıdan açılır) → değişiklik yok.
6. **README**: `test_kao2_grammar_tasks.js` satırı A+B+C; tam envanter (27 eksik dosya) K2F-41'de.
- Ölçüm: gösterilen gramer görevi 75 (K2F-10: 37) · en az alıştırma 9 · 26 kontrol PASS · runtime 104,7 KiB (≤128) · css 13,06 KiB (≤14).
