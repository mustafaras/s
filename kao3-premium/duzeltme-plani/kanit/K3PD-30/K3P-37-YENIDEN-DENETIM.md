# K3P 37 kart yeniden denetim matrisi (K3PD-30)

Tarih: 2026-10-29 · Ölçüm HEAD: `746ecdd2` (= origin/main, canlı pin `20261029a`) · Dal: `k3pd-denetim-duzeltmeleri`.

Bu belge eski K3P kayıtlarını **silmez ve geriye dönük PASS yazmaz**. Eski `K3P-STATE.json` (completed, 37/37) tarihsel kapanıştır; aşağıda her kartın eski kaydı korunur, yanına güncel HEAD'de ne ölçüldüğü ayrı yazılır.

## 1. Kapsam ve sınır

- **Ölçüldü (yerel, ağsız):** `tests/app`, `tests/kao`, `tests/panel-v2` fixture'ları güncel HEAD'e karşı çalıştı; 3 dosya 120 sn zaman aşımına düştü (`tests/kao/test_k3p_recognition_gate.js`, `test_kao2_grammar_tasks.js`, `test_kao2_kabul.js`); üçü tek tek koşunca exit 0. `test_kao2_perf_budget`: içerik 184,591 KiB · runtime **137,743 KiB** · CSS **15,953 KiB** · p95 4,888 ms.
- **Ölçülmedi / yapılmadı:** her K3P kartının tek tek bağımsız yeniden denetimi; 217 sahnenin bağımsız G4 hükmü; Shift+Tab/Escape/odak tuzağı koşumu; cihaz, gerçek ekran okuyucu, L2/230 kayıt, gerçek öğrenme etkisi.
- Bu belge **bağımsız denetçi PASS'i değildir**; satır başına 'güncel kapsam' sütunu yalnız yukarıdaki fixture/ölçü eşliğini ifade eder.

## 2. F-01…F-14 bulgu kapanış sınıflandırması

| Bulgu | Kapatan K3PD kartları (güncel verdict) | Sınıf |
| --- | --- | --- |
| F-01 | K3PD-02 done/PASS; K3PD-03 done/PASS; K3PD-26 done/PASS; K3PD-31 todo/— | Kaynak kapandı; final denetim açık (K3PD-31) |
| F-02 | K3PD-04 done/PASS; K3PD-05 done/PASS; K3PD-06 done/PASS; K3PD-28 done/PASS; K3PD-31 todo/— | Kaynak kapandı; final denetim açık (K3PD-31) |
| F-03 | K3PD-07 done/PASS; K3PD-08 done/PASS; K3PD-09 done/PASS; K3PD-31 todo/— | Kaynak kapandı; final denetim açık (K3PD-31) |
| F-04 | K3PD-10 done/PASS; K3PD-11 done/ACCEPTED_DEVIATION; K3PD-29 done/ACCEPTED_DEVIATION; K3PD-31 todo/— | Kaynak kapandı; final denetim açık (K3PD-31); kısmen KABUL EDİLMİŞ SAPMA (ACCEPTED_DEVIATION, bağımsız PASS değil) |
| F-05 | K3PD-12 done/PASS; K3PD-24 done/PASS; K3PD-25 done/ACCEPTED_DEVIATION; K3PD-31 todo/— | Kaynak kapandı; final denetim açık (K3PD-31); kısmen KABUL EDİLMİŞ SAPMA (ACCEPTED_DEVIATION, bağımsız PASS değil) |
| F-06 | K3PD-14 done/PASS; K3PD-15 done/PASS; K3PD-31 todo/— | Kaynak kapandı; final denetim açık (K3PD-31) |
| F-07 | K3PD-16 done/PASS; K3PD-29 done/ACCEPTED_DEVIATION; K3PD-31 todo/— | Kaynak kapandı; final denetim açık (K3PD-31); kısmen KABUL EDİLMİŞ SAPMA (ACCEPTED_DEVIATION, bağımsız PASS değil) |
| F-08 | K3PD-13 done/PASS; K3PD-23 done/PASS; K3PD-31 todo/— | Kaynak kapandı; final denetim açık (K3PD-31) |
| F-09 | K3PD-19 done/PASS; K3PD-20 done/PASS; K3PD-21 done/ACCEPTED_DEVIATION; K3PD-22 done/PASS; K3PD-23 done/PASS; K3PD-24 done/PASS; K3PD-25 done/ACCEPTED_DEVIATION; K3PD-28 done/PASS; K3PD-29 done/ACCEPTED_DEVIATION; K3PD-31 todo/— | Kaynak kapandı; final denetim açık (K3PD-31); kısmen KABUL EDİLMİŞ SAPMA (ACCEPTED_DEVIATION, bağımsız PASS değil) |
| F-10 | K3PD-17 done/PASS; K3PD-31 todo/— | Kaynak kapandı; final denetim açık (K3PD-31) |
| F-11 | K3PD-21 done/ACCEPTED_DEVIATION; K3PD-29 done/ACCEPTED_DEVIATION; K3PD-30 todo/—; K3PD-31 todo/— | Kaynak kapandı; final denetim açık (K3PD-30, K3PD-31); kısmen KABUL EDİLMİŞ SAPMA (ACCEPTED_DEVIATION, bağımsız PASS değil) |
| F-12 | K3PD-02 done/PASS; K3PD-26 done/PASS; K3PD-30 todo/—; K3PD-31 todo/— | Kaynak kapandı; final denetim açık (K3PD-30, K3PD-31) |
| F-13 | K3PD-02 done/PASS; K3PD-03 done/PASS; K3PD-18 done/PASS; K3PD-30 todo/—; K3PD-31 todo/— | Kaynak kapandı; final denetim açık (K3PD-30, K3PD-31) |
| F-14 | K3PD-00 done/PASS; K3PD-28 done/PASS; K3PD-30 todo/—; K3PD-31 todo/— | Kaynak kapandı; final denetim açık (K3PD-30, K3PD-31) |

Notlar: F-11 için 474 kaydın aynı kapsamda olduğu iddiası geçersizdir (6 log × 74 = 444 ayrıntılı kayıt); eski sentetik çekimler yanlış tema/token sorgusu nedeniyle K3PD-29 kayıtlarında geçersiz işaretlidir ve yeni v11 koşumları (7 koşum, 546 satır) ayrı raporlanır. F-14 için güncel ölçü yukarıdadır; `targets.runtimeKiBMax=128` eski kayıtta bayat kalır (geçerli karar 136 KiB, bkz. DUZELTME-NOTU.md). F-12 vekil ölçüler (H5/H9) özgün hipotez değildir; deney ölçümü canlı kesim tarihinden başlar.

## 3. 37 kartın matrisi (eski kayıt korunur)

| Kart | Dalga | Eski durum | Eski tarih | Eski kayıt özeti (kısaltılmış) | Güncel HEAD kapsamı |
| --- | --- | --- | --- | --- | --- |
| K3P-00 | 0 | done | 2026-10-10 | kao3-premium/kanit/onceki/ (kontak-acik.jpg, kontak-koyu.jpg, log.txt; 58 görünüm × 2 tema, token:false) | kart bazında ayrı ölçülmedi; yalnız toplu yerel fixture koşusu (§1) |
| K3P-01 | 0 | done | 2026-10-10 | çift şık yerleşik 631/1127→0, yeni 1/1087→0; runtime 118,648 KiB; K-P pin ertelemesi | kart bazında ayrı ölçülmedi; yalnız toplu yerel fixture koşusu (§1) |
| K3P-02 | 0 | done | 2026-10-10 | doğru panelde geri alma yok, gövde Doğru tekrarlamıyor; yanlışta "Yanlışlıkla dokundum"; özet başlığı tek | kart bazında ayrı ölçülmedi; yalnız toplu yerel fixture koşusu (§1) |
| K3P-03 | 0 | done | 2026-10-10 | görev başına 6 sn taban (FLOOR_PER_TASK); ders sonrası Bugün ~1 dk → ~4 dk; runtime 118,804 KiB | kart bazında ayrı ölçülmedi; yalnız toplu yerel fixture koşusu (§1) |
| K3P-04 | 0 | done | 2026-10-10 | okunuş motoru: vasl elifi, şemsî idgâm, cümle içi vasl, âyet sonu vakf, lafza-i celâl; vasl 18→0, idgâmsız 274→0; 19 lemma + 1.090 örnek + 1… | kart bazında ayrı ölçülmedi; yalnız toplu yerel fixture koşusu (§1) |
| K3P-04B | 0 | done | 2026-10-11 | Türk alfabesi okunuşu (Diyanet tablosu, istağfera, er-rahmân); 341 lemma başlığı, 1.553 örnek, 373 gramer, 471 sûre okunuşu; okunuş dışı far… | kart bazında ayrı ölçülmedi; yalnız toplu yerel fixture koşusu (§1) |
| K3P-05 | 0 | done | 2026-10-11 | kapilar.sh: k3p çift şık + k3p okunuş kapıda; deney-rapor.cjs (H2/H5/H7/H8/H9 toplu sayı, H3 K3P-16 sonrası; izdüşüm yalnız izinli alanlar; … | kart bazında ayrı ölçülmedi; yalnız toplu yerel fixture koşusu (§1) |
| K3P-A1 | A | done | 2026-10-11 | overlay yerinde güncelleniyor: kaoSplitOverlay/kaoPatchOverlay/kaoPaintApp (SeymaQuranLearn, App.* değil); app.js mount + render.js paint de… | kart bazında ayrı ölçülmedi; yalnız toplu yerel fixture koşusu (§1) |
| K3P-A2 | A | done | 2026-10-11 | odak kilidi: kaoFocusLocked (ders ekranı açıkken); helpers.js toast kuyruğu (≤3, tekrar bir kez; urgent/own ertelenmez), flushToasts özet/çı… | kart bazında ayrı ölçülmedi; yalnız toplu yerel fixture koşusu (§1) |
| K3P-A3 | A | done | 2026-10-11 | nefes ritmi: lessonPlan(…, reviews) — hedef → ısınma (en kararlı s, ≤5) → tanış + hemen 2 şıklı soru → kavram + 1 görev → karışık tür blokla… | kart bazında ayrı ölçülmedi; yalnız toplu yerel fixture koşusu (§1) |
| K3P-15 | 3 | done | 2026-10-11 | K-C üç kol: hızlı doğru panel yok (✓, 600 ms), yavaş doğru pekiştirme şeridi (1.600 ms, dokunuş durdurur), yanlış tam kart; medyan ui.kaoLat… | kart bazında ayrı ölçülmedi; yalnız toplu yerel fixture koşusu (§1) |
| K3P-A4 | A | done | 2026-10-12 | K-O zaman bütçesi: görev üst sınırı = seçilen dk ÷ ölçülmüş görev süresi (en az 6 sn); bütçe en düşük R'li tekrarları alır, ısınma K3P-A3 (e… | kart bazında ayrı ölçülmedi; yalnız toplu yerel fixture koşusu (§1) |
| K3P-A5 | A | done | 2026-10-12 | K-K uyarlanır zorluk: son 8 görevlik kayan pencere (yalnız ui). Kaygı (p<%70 ya da art arda 2 yanlış) → şık 4→3→2, ses otomatik, kolay kart;… | kart bazında ayrı ölçülmedi; yalnız toplu yerel fixture koşusu (§1) |
| K3P-A6 | A | done | 2026-10-12 | D-2/D-3: ders ilerlemesi 5 bölümlü (Hedef/Isınma/Tanış-Sına/Karışık/Zirve), plan öğelerinden türetilir, etkin bölüm kendi içinde dolar, aria… | kart bazında ayrı ölçülmedi; yalnız toplu yerel fixture koşusu (§1) |
| K3P-A7 | A | done | 2026-10-12 | A-5/D-7: yarım kalan ders görünür "Kaldığın yerden" oldu — Bugün birincil eylemi "Kaldığın yerden · Bölüm n/5", hub alt satırı "Kaldığın yer… | kart bazında ayrı ölçülmedi; yalnız toplu yerel fixture koşusu (§1) |
| K3P-A8 | A | done | 2026-10-12 | edilgin ekran bütçesi (D-4): akis-olc ilk görünüm ölçüsü (<details> gövdesi sayılmaz, <summary> sayılır); hedef/tanış/kavram kartlarında ayr… | kart bazında ayrı ölçülmedi; yalnız toplu yerel fixture koşusu (§1) |
| K3P-06 | 1 | done | 2026-10-13 | tasarım tokenları (açık+koyu): --kao-mat-ground/card/moment, --kao-shadow-1/-2, --kao-ar-hero/body/inline, --kao-ease, --kao-dur-micro/trans… | kart bazında ayrı ölçülmedi; yalnız toplu yerel fixture koşusu (§1) |
| K3P-07 | 1 | done | 2026-10-13 | Scheherazade New Regular v4.500 (SIL OFL, SHA-512 doğrulandı) alt kümesi: assets/kao/font/ScheherazadeNew-Regular.k3p.woff2 24,5 KiB (tavan … | kart bazında ayrı ölçülmedi; yalnız toplu yerel fixture koşusu (§1) |
| K3P-08 | 1 | done | 2026-10-13 | Arapça tipografi sistemi: bütün Arapça kurallar 3 kademeli ölçeğe bağlandı (--kao-ar-hero/body/inline); sahte kalın kaldırıldı (Arapça font-… | kart bazında ayrı ölçülmedi; yalnız toplu yerel fixture koşusu (§1) |
| K3P-09 | 1 | done | 2026-10-13 | Üç katmanlı materyal + an kartı + altın yalnız kazanılmış şeylerde: zemin --kao-mat-ground (açık parşömen / koyu yüzey), kartlar 1 px çizgi … | kart bazında ayrı ölçülmedi; yalnız toplu yerel fixture koşusu (§1) |
| K3P-10 | 1 | done | 2026-10-13 | Hareket grameri (TASARIM §5.4, D-5/D-6): görev geçişi 24 px yatay kayma + opaklık ≤240 ms (.kao-task-in, --kao-dur-transition); şık basışı s… | kart bazında ayrı ölçülmedi; yalnız toplu yerel fixture koşusu (§1) |
| K3P-11 | 2 | done | 2026-10-13 | Tezhip sayfası (TASARIM §2) — imza bileşen: views.tezhipPage({title,lines,footer,interactive}) saf görünüm; kelime üç durumda (bilinen/öğren… | kart bazında ayrı ölçülmedi; yalnız toplu yerel fixture koşusu (§1) |
| K3P-12 | 2 | done | 2026-10-14 | Bugün ekranı yeniden (K-F, §3.1): Tezhip an kartı (interactive:false, ünitenin çapa sûresi; kartın tamamı okuyucuyu açar) + hedef eğimi cüml… | kart bazında ayrı ölçülmedi; yalnız toplu yerel fixture koşusu (§1) |
| K3P-13 | 2 | done | 2026-10-14 | Ders âyetle açılır ve kapanır (K-G, TASARIM §3.2 · AKIS §3 ①⑤): açılış (goal) ve kapanış (apply) A YNI âyet satırını paylaşır — satır, hedef… | kart bazında ayrı ölçülmedi; yalnız toplu yerel fixture koşusu (§1) |
| K3P-14 | 2 | done | 2026-10-15 | Ders sonu anı: oturum başlangıcındaki bilinen lemma/kapsam tabanına göre yalnız yeni iki yönlü kalıcı kelimeler Tezhip'te yaldızlanır; gerçe… | kart bazında ayrı ölçülmedi; yalnız toplu yerel fixture koşusu (§1) |
| K3P-16 | 3 | done | 2026-10-15 | Saf ladderRung/ladderArm; tek seededRank kaynağından deterministik kart kolu, B daima R1, A için s eşikleri ve relearning bir basamak inişi;… | kart bazında ayrı ölçülmedi; yalnız toplu yerel fixture koşusu (§1) |
| K3P-17 | 3 | done | 2026-10-15 | R3 "harflerden kur" (kind:'build'): kelimenin harfleri + aynı nokta ailesinden 2 çeldirici harf tek görevde; dizme ve cevap yolu K3P-20 dizm… | kart bazında ayrı ölçülmedi; yalnız toplu yerel fixture koşusu (§1) |
| K3P-18 | 3 | done | 2026-10-15 | R4 "âyette boşluk" (kind:'cloze'): doğrulanmış örnek âyette hedef kelime boşluk olur; âyet VE okunuş aynı konumda boşalır (okunuş da boşalır… | kart bazında ayrı ölçülmedi; yalnız toplu yerel fixture koşusu (§1) |
| K3P-19 | 3 | done | 2026-10-16 | Okunuşun soldurulması (KARARLAR K-A son madde, P4/H4): s ≥ 21 olan kartın görevinde okunuş yerel `<details class="kao-pronunciation-fold"><s… | kart bazında ayrı ölçülmedi; yalnız toplu yerel fixture koşusu (§1) |
| K3P-20 | 3 | done | 2026-10-16 | Kelime/harf dizmede sürükle-bırak: çipler pointer olaylarıyla görsel olarak sürüklenir (transform + pointer capture) ve hedef bölgeye bırakı… | kart bazında ayrı ölçülmedi; yalnız toplu yerel fixture koşusu (§1) |
| K3P-21 | 3 | done | 2026-10-16 | Görünür ses kontrolleri (ANALIZ §4 "ses düğmesi", Dalga 3 sonu): gizli uzun basma (350 ms) ve satır içi ok fonksiyonu KALDIRILDI — keşfedile… | kart bazında ayrı ölçülmedi; yalnız toplu yerel fixture koşusu (§1) |
| K3P-22 | 4 | done | 2026-10-16 | Âyet merdiveni (K-E): boş durum KALDIRILDI. "Henüz hazır âyet yok" metni ve `kao-ayah-empty` işaretlemesi artık hiçbir yerde geçmez (CSS'i d… | kart bazında ayrı ölçülmedi; yalnız toplu yerel fixture koşusu (§1) |
| K3P-23 | 4 | done | 2026-10-17 | (eski kayıtta özet yok) | kart bazında ayrı ölçülmedi; yalnız toplu yerel fixture koşusu (§1) |
| K3P-24 | 4 | done | 2026-10-17 | İlerleme ekranı üç sade ölçüye indi (K-H, TASARIM §3.5 · ANALIZ E-5): Kur'an kapsamı %, yaldızlı sûreler ×/20 (bir sûre BÜTÜN lemmaları bili… | kart bazında ayrı ölçülmedi; yalnız toplu yerel fixture koşusu (§1) |
| K3P-25 | 4 | done | 2026-10-17 | Mevcut kullanıcıya hızlı geçiş seçimi (K-C "Varsayılanlar"): teklif yalnız BİR KEZ gösterilir (onboarding.k3pNoticeAt damgası, geriye uyumlu… | kart bazında ayrı ölçülmedi; yalnız toplu yerel fixture koşusu (§1) |
| K3P-26 | 5 | done | 2026-10-18 | Son görsel QA: 320/390/460 px × açık/koyu, 474 sentetik ekran; yatay sayfa taşması ve istenmeyen kırpılma yok, 15 bilgi amaçlı kaydırmalı al… | kart bazında ayrı ölçülmedi; yalnız toplu yerel fixture koşusu (§1) |
| K3P-27 | 5 | done | 2026-10-18 | Pin 20261017a→20261018a; değişen üretim varlıkları quranLearn.js + quranLearnViews.js. Ortak pin 15 dosyada / 82 geçişte güncellendi; pinDef… | kart bazında ayrı ölçülmedi; yalnız toplu yerel fixture koşusu (§1) |

Sayım: 37 satır, tekil ve sıralı (K3P-00…K3P-27 dahil kayıtlı kimlikler). Başlıktaki '36' eski kayıtta bayattır; gerçek sayı 37.
