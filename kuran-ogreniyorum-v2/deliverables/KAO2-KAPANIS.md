# KAO2 · Kur'an Arapçası Öğrenme — Program Kapanışı

**Durum: 🏁 TAMAMLANDI (28/28 kart).** Dal: `kao2-yeniden-tasarim` (= `main`).
Kapanış tarihi: 2026-09-30 · Son yayın pini: **`20260930k`** (KAO2-27'de `20260930l`).

## 1. Ne yapıldı (tek paragraf)
KAO v1 "10 ekranlık bir içerik gezintisi"ydi: içerik vardı ama öğretmiyordu (01'de 11
kullanıcı yolu bulgusu, 02'de 26 tasarım bulgusu). KAO2 bu yüzeyi **tek karar noktalı,
sıralı bir öğrenme yoluna** çevirdi: Bugün ekranı → ders oynatıcı → tanış/bağla/alıştır →
geri bildirim → İlerleme. Müfredat **524 lemmanın tamamını** 12 üniteye/kavramlara
bağlar; her yeni lemma **tanış kartıyla** girer; her durumda **tek** sıradaki adım vardır.

## 2. Kapanan bulgular
| Kaynak | Bulgu | Kapanış |
|---|---|---|
| 01 K-01/K-02 | Girişte ne yapılacağı belirsiz; "şimdi ne yapmalıyım?" anı | S-02 Bugün + `nextStep` (8 tür, tek eylem) · A-4/A-12 |
| 01 Y-01…Y-03 | İlk kullanıcı yolu uzun/sisli | 3 dokunuşta ilk karta (A-1) |
| 01 Y-05 | Ayet/sûre bağlamı yok | Okuyucu v2 + 20 sûre bağlamı (L1 onayı bekliyor) |
| 01 Y-11 | Katman sayfalaması + doğrulanmamış örnek hata kutusu | KAO2-25: tek kaydırmalı detay · doğrulanmamış örnek **hiç gösterilmez** |
| 01 Y-12 | "Anladım" tek dokunuşla geçilebiliyordu | 3 soruluk hızlı kontrol (KAO2-19) |
| 02 T-01…T-05 | Gezinme/geri yığını tutarsız | Push/pop yığını + NavBar/LargeTitle (KAO2-03…06) |
| 02 T-13…T-15 | Ayarlar dağınık, kaynaklar gömülü | KAO2-23: 3 grup + "Hakkında ve kaynaklar" alt sayfası |
| 02 T-22/T-23 | (aynı) | aynı |
| 02 T-24…T-26 | Erişilebilirlik/kontrast denetlenmemiş | KAO2-26: 11 kontrol + 20 `min-height` düzeltmesi |
| 03 §1 | Kapsam eğrisi (en güçlü motivasyon) hiç gösterilmiyordu | KAO2-24: İlerleme'de gerçek veriden |
| 03 §2 | Kavram açıklamaları hiç gösterilmiyordu | Gramer notları + kavram ekranı (KAO2-17/18) · metin L1'de |
| 06 §7 | Tasarım ölçümleri | `test_kao2_design_contract` --strict: weights 2, deco/uppercase/serif 0 |

## 3. Kararlar (10-KARARLAR) — durum
| # | Karar | Durum |
|---|---|---|
| **K-1** | Bütçeler | **Güncellendi (kullanıcı yetkisiyle):** çalışma zamanı tavanı 80→88→**128 KiB**; ölçüm **92.432 KiB**. İçerik 177.657/256 · css 12.815/14 · p95 7,1 ms (≤40). |
| **K-2** | Tasarım katmanı | **Uygulandı:** `test_kao2_design_contract --strict` (deco 0 · tracking 0 · uppercase 0 · serif 0 · ekran başına ≤1 birincil). |
| **K-3** | Telaffuz sesi | **Katman A aktif, kayıt bekliyor:** `tools/kao2-syllable-audio.mjs` + manifest `planned[]` (230 klip, 2 ses, stüdyo protokolü). B (harf gerçek kelimede) çalışıyor. C (TTS/kesme) **yasak**. |
| **K-4** | Üç katmanlı metin denetimi | **L0 çalışıyor** (`test_kao2_text_review`), **L1 (proje sahibi) ve L2 (alan uzmanı) bekliyor.** `draft` metin uygulamada görünmez. |

## 4. Ölçümler
Tam tablo: [`evidence/KAO2-27/A-KABUL.md`](../evidence/KAO2-27/A-KABUL.md) — **A-1…A-10 PASS**,
A-11/A-12 cihaz/kullanıcıda. Kapılar: **KAO 45/45 · app 77/77 · panel 23/23 ·
panel-v2 27/27 · quran 9/9 · reminders/driver/zikr/iip_22 PASS · kontrast 726 çift 0 ihlal**.

## 5. Yayın pini (tek commit)
`index.html` `?v=`, `sw.js` (`SW_VERSION`, `SW_OFFLINE_VERSION=iip22-<pin>`, önbellek listesi),
`tests/app/test_iip_22.js` `release` sabiti ve tüm `tests/kao/*` pinleri **aynı committe**
güncellenir. KAO içerik dosyaları + `app/kao.css` + `app/core/quranLearn*.js` bu tek pini paylaşır.

## 6. Kanıt düzeyleri (dürüst ayrım)
| Düzey | Durum |
|---|---|
| Kaynak/test (fixture) | ✅ PASS — bu belge ve kart KANIT'ları |
| Yayın (Pages, bayt eşitliği) | ✅ doğrulandı — her kartın `YAYIN.md`'si |
| **Cihaz (telefon/Safari, A-11/A-12)** | ❌ **yapılmadı** — kullanıcıda |
| **Ekran okuyucu (VoiceOver/TalkBack)** | ❌ **yapılmadı** — kaynak düzeyi denetim var |
| **L1 metin onayı** (133 metin · 20 bağlam · 25 kavram · 12 `why`) | ❌ **kullanıcıda** — inceleme sayfaları hazır |
| **K-3 kayıtlar** (230 klip) | ❌ **kullanıcıda** — araç + manifest + `--check` kapısı hazır |

## 7. Yayın için kullanıcıya önerilen adımlar (bu belge push/deploy YAPMAZ)
1. Cihazda 1 hafta deneme → A-11/A-12 sayılarını raporla.
2. `INCELEME-KAO2-*.md` sayfalarını onayla → `draft` → `sourced` (içerik uygulamada görünür).
3. Muallim kayıtlarını `--check` ile doğrula (loudnorm −18 LUFS, −1 dBTP).
4. Ekran okuyucu turu (ana ekran → ders → kelime → İlerleme).
5. Ancak ondan sonra `main`'e push/deploy kararı.

## 8. Bilerek değişen testler (kartların kendi gereği)
`test_kao2_navigation` (map satırı) · `test_kao_render` E7/E10 (kaynak alt sayfası, gömülü
harita) · `test_kao2_today` (gömülü harita) · kimlik pinleri 43→42 / 602→601 / 764→763
(KAO2-25 `kaoWordLayer` kaldırıldı; tıklama 393 sabit). Her biri kart KANIT'ında gerekçeli.

## 9. Yeni bir KAO2 işi
Bu program **kapalıdır**. Yeni bir KAO2 kartı/serisi açmak ayrı kapsam onayı, kendi
state dosyası ve kanıt zinciri gerektirir (MON/MON2/IIP örüntüsü).
