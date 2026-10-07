# Denetim-2 düzeltmeleri · Prompt 1 … Prompt 16

Bu dosya, [`DENETIM-RAPORU.md`](DENETIM-RAPORU.md)'ndaki tüm sorunları düzeltmek için **sırayla** yapıştırılacak 16 prompttur.

## Nasıl kullanılır (senin yapacağın)

1. **Yeni bir oturum aç** (her prompt için ayrı oturum).
2. Aşağıdaki sıradaki promptun **gri kutusunun içini olduğu gibi kopyala, yapıştır.** Başka bir şey yazmana gerek yok.
3. Oturum bitince bir sonraki prompta geç. Ajan yanlış sıradaki promptu yapıştırdığını görürse sana hangisinin sırada olduğunu söyler.
4. **Prompt 12, 15 ve 16'da** kutunun içinde `<<…>>` ile işaretli bir yer var: oraya kendi kararını ya da komut çıktını yazarsın.

Ajanın uyacağı kurallar ayrı dosyada: [`ORTAK-KURALLAR.md`](ORTAK-KURALLAR.md). Her prompt ajana önce onu okutur; senin okumana gerek yok.

## Özet tablo

| Prompt | Ne yapar | Senden ne bekler |
|---|---|---|
| **1** | Kayıt düzenini kurar, başlangıç ölçümü alır | — |
| **2** | Kapı araçlarını düzeltir (plan-check istisnası, yavaş makine kipi) | — |
| **3** | "Kelime dizme"de aynı görünen iki çipin yanlış sayılmasını düzeltir | — |
| **4** | Aynı derste aynı gramer sorusunun iki kez gelmesini engeller | — |
| **5** | R-01 ve R-10 denetim kontrollerini güçlendirir | — |
| **6** | Ses görevinin ekranını teste bağlar | — |
| **7** | Bayat "müfredat eşleme" sayfasını araçla düzeltir | — |
| **8** | Test listesini (README) tamamlar ve testle korur | — |
| **9** | Süreç kurallarını (tek commit, kayıt, yayın) araçla denetleyen kontrolü kurar | — |
| **10** | Eski programın eksik kayıtlarını geriye dönük düzeltir | — |
| **11** | Sana iki karar sorar (L1 onayı + u09.01 başlığı) ve durur | Soruları oku |
| **12** | Kararını uygular | **Kutudaki iki satırı doldur** |
| **13** | Her şeyi baştan sona doğrular, sonuç belgesini yazar | — |
| **14** | Yayın özetini gösterir, onay sorar ve durur | Özeti oku |
| **15** | Canlıya alır (yalnız onay verdiysen) | **"YAYIN-3 onaylı" ya da "ertele" yaz** |
| **16** | Senin terminal çıktınla canlı doğrulamayı kaydeder, programı kapatır | **Komutu kendi bilgisayarında çalıştır, çıktıyı yapıştır** |

---

## Prompt 1 — Başlangıç ve ölçüm

```text
Şeyma deposunda denetim-2 düzeltmelerinin PROMPT 1'ini yap (commit öneki D2F-01).
Önce kao2-duzeltme/denetim-2/ORTAK-KURALLAR.md'yi oku ve uy. Bu ilk prompt olduğu için D2F-STATE.json henüz yok; sen kuracaksın.

GÖREV: Program kayıt düzenini kur ve başlangıç ölçümü al.
OKU: kao2-duzeltme/denetim-2/DENETIM-RAPORU.md §1, §2, §7 · kao2-duzeltme/tools/fix-sync-check.mjs (örnek yapı).
DOKUNULACAK DOSYALAR (yalnız bunlar): kao2-duzeltme/denetim-2/D2F-STATE.json, CURRENT-STATE.md, LEDGER.md,
  tools/d2f-sync-check.mjs, evidence/D2F-01/KANIT.md (hepsi yeni).
ADIMLAR:
1) git status temiz olmalı; HEAD 2d260251'i içermeli. Değilse dur.
2) D2F-STATE.json: program "KAO2-FIX denetim-2", status "active", baseCommit (şimdiki HEAD), nextPrompt "D2F-02",
   prompts D2F-01…D2F-16 (başlık, status, evidence, session), n: N-01…N-09 hepsi "fail",
   pins (araçla ölç: App.kao* 45, App yüzeyi 766, atama 604, onclick 393, yayın 20261006e), userGates: D2F-12, D2F-15, D2F-16.
3) tools/d2f-sync-check.mjs (salt okur, ağsız): STATE ↔ CURRENT-STATE içindeki "d2f-sync" bloğu (nextPrompt, lastSeq, status)
   ↔ LEDGER son seq ↔ koddaki pinler. --clean: çalışma ağacı temiz. --repro: tekrar-uret-2.cjs'i koşar, STATE'te "pass" olan
   her N gerçekten PASS olmalı.
4) Başlangıç ölçümü (bayraksız): bash kao2-duzeltme/tools/kapilar.sh (tam; yalnız test_kao2_kabul ve test_kao2_perf_budget
   kırmızı beklenir) · tekrar-uret-2 0/9 · tekrar-uret 10/10. Sonuçları KANIT'a yaz.
5) LEDGER seq 1 PROMPT kaydı, CURRENT-STATE, tek commit: "D2F-01: denetim-2 düzeltme programı başladı, başlangıç ölçümü".
BİTTİ SAYILIR: d2f-sync-check PASS · ölçümler KANIT'ta · tek commit · ağaç temiz.
```

## Prompt 2 — Kapı araçları

```text
Şeyma deposunda denetim-2 düzeltmelerinin PROMPT 2'sini yap (commit öneki D2F-02).
Önce kao2-duzeltme/denetim-2/ORTAK-KURALLAR.md'yi oku ve uy; nextPrompt "D2F-02" olmalı.

GÖREV: (a) plan-check'e eklenmiş geniş "K2F-NN ek:" iznini yalnız 65e94db2 commit'ine daralt, D2F önekini tanıt;
(b) kapilar.sh yavaş makinede dürüstçe yeşil bitebilsin. Rapordaki bulgu: D2-12 (araç kısmı), §5.
OKU: docs/kuran-ogreniyorum/tools/kao-plan-check.mjs (KAO_SUBJECT_RE, ~satır 25–50) ve kao-plan-check.test.mjs ·
  git show 5b267dde · kao2-duzeltme/tools/kapilar.sh · tests/kao/test_kao2_kabul.js A-10 bölümü · tests/kao/test_kao2_perf_budget.js.
DOKUNULACAK DOSYALAR: docs/kuran-ogreniyorum/tools/kao-plan-check.mjs, docs/kuran-ogreniyorum/tools/kao-plan-check.test.mjs,
  kao2-duzeltme/tools/kapilar.sh, tests/kao/test_kao2_perf_budget.js.
ADIMLAR:
1) Önce self-test'e ekle ve kırmızı gör: "D2F-03: …" KAO dosyasına dokunabilir; "D2F-3:" ve "D2FX-03:" reddedilir;
   "K2F-38 ek:" yalnız 65e94db2 için kabul, başka hash'te red (bugün kabul ediliyor → kırmızı).
2) Regex'teki genel "(?: ek)?" iznini kaldır; tek hash istisna listesi (gerekçe yorumuyla); D2F-(0[1-9]|1[0-6]) tanı.
3) kapilar.sh: KAO2_ACCEPT_SLOW_HOST=1 verilirse kabul testine de geçirilsin; perf satırında "GÖRELİ BANT ATLANDI (yavaş makine)"
   yazılsın. Mutlak tavanlar (içerik ≤256 KiB, runtime ≤128, css ≤14, p95 ≤40 ms) aynen zorunlu. Bayraksız davranış değişmez.
4) test_kao2_perf_budget.js: aynı bayrakla yalnız göreli bant atlanır ve bu stdout'a yazılır.
   Mutasyon kanıtı (scratchpad kopyası): runtime tavanını aşan sahte dosyayla bayraklı koşu FAIL.
5) Hem bayraklı hem bayraksız kapilar.sh koş; bayraklı "TÜM KAPILAR YEŞİL" olmalı. İkisini KANIT'a yaz.
Commit: "D2F-02: plan-check istisnası tek commit'e daraldı, kapılar yavaş makinede dürüstçe yeşil"
BİTTİ SAYILIR: self-test PASS · plan-check PASS · bayraklı kapilar.sh çıkış 0.
```

## Prompt 3 — "Kelime dizme" aynı görünen çipler

```text
Şeyma deposunda denetim-2 düzeltmelerinin PROMPT 3'ünü yap (commit öneki D2F-03).
Önce kao2-duzeltme/denetim-2/ORTAK-KURALLAR.md'yi oku ve uy; nextPrompt "D2F-03" olmalı.

GÖREV: u08.02 dersindeki "Kelime dizme" (g16-k2) sorusunda aynı yazılı iki çip (تَفْعَلُوا۟ ×2) var. Kullanıcı görünürde doğru
sırayı seçtiğinde, aynı görünen çipleri ters seçerse "yanlış" sayılıyor ve tekrar planına hata yazılıyor. Düzelt.
Rapordaki bulgu: D2-01. Yeniden üretme: node kao2-duzeltme/denetim-2/tekrar-uret-2.cjs → N-01.
OKU: app/core/quranLearn.js — kaoAnswer'ın sıralama yolu (~2160–2180; "selected.ordinal===index" ~2173),
  kaoGrammarTaskValid'in "Kelime dizme" dalı (~1604–1607), kaoTaskHTML geri bildirim (~1739). Dosyayı tamamen okuma; grep + ±60 satır.
DOKUNULACAK DOSYALAR: app/core/quranLearn.js, tests/kao/test_kao2_grammar_tasks.js.
ADIMLAR:
1) Önce test (kırmızı gör): u08.02'de aynı yazılı iki çip yer değiştirilerek doğru görünen sırayla seçilince geri bildirim "Doğru",
   günlük doğru sayısı artar, hata kaydı yok; gerçekten yanlış sıra yine yanlış. 109 dersin tüm sıralama görevlerinde
   aynı yazılı çiplerin yer değiştirmesi sonucu değiştirmez. Parça (fragment) sıralaması da aynı yolu kullanır, onu da sına.
2) Sıra kontrolünü çip kimliği yerine çip yazısına (etikete) dayandır. FSRS ve kaoBuildQueue'ya dokunma.
3) N-01 PASS olmalı.
Commit: "D2F-03: aynı yazılı dizme çipleri doğru sırada doğru sayılır"
BİTTİ SAYILIR: N-01 PASS · test PASS · kapılar yeşil · tekrar-uret 10/10.
```

## Prompt 4 — Aynı derste aynı gramer sorusu

```text
Şeyma deposunda denetim-2 düzeltmelerinin PROMPT 4'ünü yap (commit öneki D2F-04).
Önce kao2-duzeltme/denetim-2/ORTAK-KURALLAR.md'yi oku ve uy; nextPrompt "D2F-04" olmalı.

GÖREV: u01.02 dersinde g1-k1 ve g1-k2 birebir aynı soruyu (aynı kelime, aynı cevap, aynı şıklar) bir soru arayla iki kez
gösteriyor. Bir ders içinde aynı gramer sorusu iki kez çıkmasın. Rapordaki bulgu: D2-09 (K4-04 kalıntısı). Yeniden üretme: N-09.
OKU: app/core/quranLearn.js kaoLessonActivate (~1876) ve geçersiz gramer görevini aynı dersin kelime alıştırmasıyla değiştiren
  mevcut ikame yolu (K2F-10) · app/core/quranLearnFlow.js lessonPlan (~163) ardışıklık kuralı (dokunma, yalnız oku).
DOKUNULACAK DOSYALAR: app/core/quranLearn.js, tests/kao/test_kao2_grammar_tasks.js.
ADIMLAR:
1) Önce test (kırmızı gör): 109 dersin gerçek yürüyüşünde hiçbir derste aynı gramer sorusu (tür + soru metni + uyaran + şıklar)
   iki kez yok; her derste alıştırma sayısı değişmiyor (bugünkü değerleri testte sabitle).
2) Soru kurulduktan sonra ders içi "görülen sorular" kümesine bak; tekrar ise mevcut ikame yolunu kullan (kelime alıştırması).
   Flow dosyasına dokunma.
3) Gösterilen gramer sorusu sayısı önce/sonra KANIT'a (bugün 78; azalma yalnız çift sayısı kadar olabilir).
4) EK (LEDGER seq 4 NOTE, kullanıcı kararıyla bu prompta eklendi): "Kelime dizme" görevi bazen çözülmüş sırayla açılıyor.
   gramOrderRecipe (~1379) karıştırma sonrası "zaten sıralı mı" kontrolünü çip kimliğiyle (item.ordinal===index) yapıyor; aynı
   yazılı çipler yer değişmiş gelince kaydırma yapılmıyor (g16-k2, 2000 tohumda 22). Önce test (kırmızı gör): 18 dizme
   şablonunun her biri ≥2000 tohumla kurulunca gösterilen yazı dizisi hiçbir zaman doğru yazı dizisine eşit değil. Sonra kontrolü
   yazı dizisine çevir (kaoOrderLabels ile). Sayıları önce/sonra KANIT'a yaz.
Commit: "D2F-04: ders içinde aynı gramer sorusu tekrar gösterilmez, dizme çözülmüş açılmaz"
BİTTİ SAYILIR: N-09 PASS · kabul testi A-2 PASS · dizme çözülmüş açılma 0/36000 · kapılar yeşil.
```

## Prompt 5 — Denetim kontrollerini güçlendir (R-01, R-10)

```text
Şeyma deposunda denetim-2 düzeltmelerinin PROMPT 5'ini yap (commit öneki D2F-05).
Önce kao2-duzeltme/denetim-2/ORTAK-KURALLAR.md'yi oku ve uy; nextPrompt "D2F-05" olmalı.

GÖREV: Kalıcı denetim testinde R-01, ustalık kaydı hiç yazılmasa bile geçiyor (başarısız denemeyi "kayıt var" sayıyor);
R-10, girintili koşulsuz dosya yazımını kaçırıyor. İkisini de gerçekten bulgusunu yakalayacak hale getir.
Rapordaki bulgular: D2-02, D2-03. Yeniden üretme: N-02, N-03.
OKU: tests/kao/test_kao2_denetim.js R-01 (~17–30) ve R-10 (~171–175) · tests/kao/helpers/kao-harness.js (walkLesson, playLesson).
DOKUNULACAK DOSYALAR: tests/kao/test_kao2_denetim.js, kao2-duzeltme/denetim/tekrar-uret.cjs (yalnız başa bir yorum satırı:
  "tarihsel kayıt; güncel kontroller tests/kao/test_kao2_denetim.js — R-01/R-10 D2F-05'te güçlendi").
ADIMLAR:
1) R-01: Ünite 1 derslerini walkLesson ile gerçekten oyna, ustalığı doğru cevaplarla geç → path.units['1'].masteryAt dolu,
   masteryScore ≥ 0,8, sonraki adım "next-unit". Aynı kurulumda yanlış cevaplarla → masteryAt boş, adım "repair".
   Elle st.at / st.phase ataması yok.
2) R-10: satır başı boşluklu yazımı da yakalayan kalıp + yazımın KAO2_EVIDENCE_OUT koşulu altında olduğunun kontrolü.
3) Mutasyon kanıtı (scratchpad kopyasında, commit edilmez): (a) quranLearn.js'te masteryAt yazımını kapat → R-01 FAIL;
   (b) test_kao2_kabul.js'e girintili koşulsuz A-KABUL.md yazımı ekle → R-10 FAIL. Komut ve çıktıyı KANIT'a yaz.
Commit: "D2F-05: R-01 gerçek ustalık geçişini, R-10 girintili yazımı da yakalar"
BİTTİ SAYILIR: test_kao2_denetim 10/10 · N-02, N-03 PASS · iki mutasyon FAIL veriyor.
```

## Prompt 6 — Ses görevinin ekranı teste bağlansın

```text
Şeyma deposunda denetim-2 düzeltmelerinin PROMPT 6'sını yap (commit öneki D2F-06).
Önce kao2-duzeltme/denetim-2/ORTAK-KURALLAR.md'yi oku ve uy; nextPrompt "D2F-06" olmalı.

GÖREV: K2F-40 şık ekranını Views.choice'a taşıdı; denetim 6.905 ekranın aynı kaldığını doğruladı ama "ses" türü görev
sentetik ortamda üretilemediği için doğrulanamadı. Bunu kalıcı testle kapat. Rapordaki yer: §8 "doğrulanamayanlar".
OKU: app/core/quranLearn.js — ses görevinin kurulduğu yer ve kullanılabilirlik koşulu (grep: audio, direction) ·
  tests/kao/test_kao2_components.js.
DOKUNULACAK DOSYALAR: tests/kao/test_kao2_components.js.
ADIMLAR:
1) Ses görevini harness'te GERÇEK kurucuyla üret (ses kullanılabilirliği ayar/kayıt yoluyla açılır; görev nesnesi elle yazılmaz).
2) Cevapsız / doğru / yanlış üç durumda: şıklar Views.choice düğme kipinden geliyor, durum sınıfı, aria-pressed/disabled,
   ses düğmesinin erişilebilir adı doğru.
3) Tek seferlik kanıt (commit edilmez): git archive ile f4c256c7^ ve HEAD ağaçlarını scratchpad'e aç, aynı üç durumun HTML'i
   bayt-eşit mi? Sonucu KANIT'a yaz. Ses görevi sentetik ortamda hiç kurulamıyorsa nedenini KANIT'a yaz ve test bunu sınasın.
Commit: "D2F-06: ses görevi şık ekranı testte"
BİTTİ SAYILIR: components testi PASS · eşitlik sonucu KANIT'ta · kapılar yeşil.
```

## Prompt 7 — Müfredat eşleme sayfası gerçeği yazsın

```text
Şeyma deposunda denetim-2 düzeltmelerinin PROMPT 7'sini yap (commit öneki D2F-07).
Önce kao2-duzeltme/denetim-2/ORTAK-KURALLAR.md'yi oku ve uy; nextPrompt "D2F-07" olmalı.

GÖREV: docs/kuran-ogreniyorum/kao2/inceleme/MUFREDAT-ESLEME.md hâlâ "Tüm başlık ve vaatler taslaktır (draft)" ve boş kutulu
"Karar bekleyen noktalar" yazıyor; oysa taslak metin yok ve G2 kararı 2026-10-02'de verildi. Sayfayı üreten aracı düzelt.
Rapordaki bulgular: D2-11, K3-07 kalıntısı.
OKU: tools/kao2-curriculum-build.mjs — MUFREDAT sayfasını yazan bölüm (grep: "Karar bekleyen", "taslaktır") ·
  MUFREDAT-ESLEME.md satır 1–10, 80–90 ve son 10 satır · kao2-duzeltme/FIX-STATE.json decisions.G2.
DOKUNULACAK DOSYALAR: tools/kao2-curriculum-build.mjs, docs/kuran-ogreniyorum/kao2/inceleme/MUFREDAT-ESLEME.md (yalnız araç çıktısı),
  tests/kao/test_kao2_curriculum.js.
ADIMLAR:
1) Önce test (kırmızı gör): taslak metin sayısı 0 iken sayfada "taslaktır" yok; G2 kararı varsa "Karar bekleyen noktalar"
   yerine "G2 kararı (2026-10-02)" özeti ve işaretli onay satırı; sayfadaki sayılar texts.tr.json ile aynı.
2) Araç sayfayı veriden yazsın. Sayfayı elle düzenleme. Aracı iki kez çalıştır → bayt-eşit.
   Aracın ürettiği diğer dosyalar değişmemeli (git diff --stat ile göster).
Commit: "D2F-07: müfredat eşleme sayfası gerçek onay durumunu yazar"
BİTTİ SAYILIR: curriculum testi PASS · iki üretim aynı · yalnız MUFREDAT-ESLEME.md değişti.
```

## Prompt 8 — Test listesi tam olsun

```text
Şeyma deposunda denetim-2 düzeltmelerinin PROMPT 8'ini yap (commit öneki D2F-08).
Önce kao2-duzeltme/denetim-2/ORTAK-KURALLAR.md'yi oku ve uy; nextPrompt "D2F-08" olmalı.

GÖREV: tests/kao/README.md 54 test dosyasından 53'ünü listeliyor (test_kao_pronunciation_contract.js yok). Tamamla ve
bir daha eksik kalmasın diye testle koru. Rapordaki bulgular: D2-05, K6-06 kalıntısı. Yeniden üretme: N-05.
OKU: tests/kao/README.md.
DOKUNULACAK DOSYALAR: tests/kao/README.md, tests/kao/test_kao2_inventory.js (yeni).
ADIMLAR:
1) Önce yeni test (kırmızı gör): tests/kao/test_*.js içindeki her dosya README'de bir satırda geçiyor; README'de adı geçen her
   test dosyası diskte var; helpers/ ve fixtures/ içerikleri de listelenmiş.
2) Eksik satırları ekle (yeni test dahil).
Commit: "D2F-08: tests/kao envanteri tam ve testle korunuyor"
BİTTİ SAYILIR: N-05 PASS · yeni test PASS · kapılar yeşil.
```

## Prompt 9 — Süreç kurallarını denetleyen kontrol

```text
Şeyma deposunda denetim-2 düzeltmelerinin PROMPT 9'unu yap (commit öneki D2F-09).
Önce kao2-duzeltme/denetim-2/ORTAK-KURALLAR.md'yi oku ve uy; nextPrompt "D2F-09" olmalı.

GÖREV: Önceki programda "tek commit", "güncel CURRENT-STATE" ve "yayın kanıtı" kuralları tekrar tekrar delindi (M-05, M-07, M-12).
Bunu bu programda araçla engelle.
OKU: kao2-duzeltme/denetim-2/tools/d2f-sync-check.mjs · DENETIM-RAPORU.md §4 ve §6 (E-7…E-10).
DOKUNULACAK DOSYALAR: kao2-duzeltme/denetim-2/tools/d2f-sync-check.mjs, kao2-duzeltme/tools/kapilar.sh (yalnız d2f-sync satırı).
ADIMLAR:
1) d2f-sync-check'e --strict ekle. Kurallar yalnız baseCommit'ten sonraki D2F commit'lerine KAPI olarak uygulanır:
   (a) bitmiş her prompt için tam bir commit; (b) öneksiz ya da bilinmeyen önekli commit yok;
   (c) ?v= ya da SW_VERSION değiştiren commit yalnız D2F-15'te ve evidence/D2F-15/YAYIN.md var;
   (d) her KANIT 8 bölümü + "Oturum:" satırını taşıyor ve iki prompt aynı oturum adresini paylaşmıyor;
   (e) D2F-12, D2F-15, D2F-16 için LEDGER'da GATE "closed" kaydı ve D2F-11, D2F-14 için GATE "waiting" kaydı var;
   (f) CURRENT-STATE'teki "Canlı gerçekler" tarihi son prompt tarihinden eski değil.
2) --audit-k2f: aynı kuralları KAO2-FIX dönemine (07802fa6 sonrası) yalnız RAPOR olarak uygular, çıkış kodunu etkilemez.
   Çıktısı rapordaki sayılarla tutmalı: 128 commit, 28 çok commit'li prompt, 21 plan dışı pin.
3) Kırmızı kanıtı: scratchpad'de sahte git geçmişiyle her kuralın (a–f) FAIL verdiğini göster → KANIT.
4) kapilar.sh "d2f-sync-check --strict" satırını koşsun.
Commit: "D2F-09: tek commit, yayın, KANIT ve onay kuralları araçla denetleniyor"
BİTTİ SAYILIR: --strict PASS · 6 mutasyon FAIL · --audit-k2f sayıları raporla aynı · kapılar yeşil.
```

## Prompt 10 — Eski programın eksik kayıtları

```text
Şeyma deposunda denetim-2 düzeltmelerinin PROMPT 10'unu yap (commit öneki D2F-10).
Önce kao2-duzeltme/denetim-2/ORTAK-KURALLAR.md'yi oku ve uy; nextPrompt "D2F-10" olmalı.

GÖREV: KAO2-FIX kayıtlarındaki boşlukları DÜRÜSTÇE kapat. Geçmiş commit'ler ve eski LEDGER satırları değişmez; yalnız ekleme
yapılır ve eklenen her şey "geriye dönük (D2F-10)" diye etiketlenir. Rapordaki bulgular: D2-06 (kayıt), D2-07, D2-12 (kayıt),
M-07, M-12. Yeniden üretme: N-06, N-07.
OKU: DENETIM-RAPORU.md §4, §6 (E-4, E-7, E-10), §7 · kao2-duzeltme/.anti-amnesia/CURRENT-STATE.md · LEDGER.md seq 114–122 ·
  git show --stat 6796d87a dc9743f4 8bf8f658 5b267dde.
DOKUNULACAK DOSYALAR: kao2-duzeltme/.anti-amnesia/LEDGER.md (yalnız sona ekleme), kao2-duzeltme/.anti-amnesia/CURRENT-STATE.md,
  kao2-duzeltme/FIX-STATE.json (ledgerLastSeq, branch, implementer notu, audit2 alanı), kao2-duzeltme/evidence/K2F-43/KANIT.md (yeni),
  kao2-duzeltme/evidence/K2F-34/YAYIN.md (yeni), kao2-duzeltme/README.md, kao2-duzeltme/deliverables/KAO2-FIX-KAPANIS.md (yalnız sona §8).
ADIMLAR:
1) Eski LEDGER'ın sonuna, her biri ayrı seq: "GATE · K2F-43" (status: closed-inferred; kullanıcının gerçek talimatı alıntı;
   "onay çıkarımla verildi, açık teyit Prompt 15'te") · "NOTE · K2F-34" (yayın kanıtı eksikti) · "NOTE · K2F-38" (8bf8f658 KAO2 dışı
   CSS commit'i; 5b267dde plan-check genişletmesi, Prompt 2'de daraltıldı) · "NOTE · denetim-2" (rapora ve bu programa bağlantı).
2) evidence/K2F-43/KANIT.md (başlıkta "GERİYE DÖNÜK — D2F-10") ve evidence/K2F-34/YAYIN.md (git'ten: commit, pin, ff aralığı;
   Pages run numarası kayıtta yoksa "kayıtta yok" yaz, tahmin etme).
3) Eski CURRENT-STATE'i BAŞTAN yaz: yalnız bugün ölçülen kapanış gerçekleri (tek runtime değeri, pinler) + açık işler
   (bu program, L2, cihaz, canlı doğrulama). Raporun §6 E-10'daki bayat satırların hepsi gitsin.
4) FIX-STATE "branch" alanı gerçeği yazsın ("oturum dalları → main; bkz. denetim-2"); README'deki "her prompt ayrı oturum,
   tek commit" iddiası gerçeğe çekilsin; KAPANIŞ belgesine §8: denetim-2 hükmü, sayılar, bu programa bağlantı.
5) node kao2-duzeltme/tools/fix-sync-check.mjs --repro PASS kalmalı. Eski LEDGER satırları bayt aynı (git diff yalnız ekleme).
Commit: "D2F-10: KAO2-FIX kayıtları geriye dönük düzeltildi"
BİTTİ SAYILIR: N-06, N-07 PASS · fix-sync-check PASS · d2f-sync --strict PASS.
```

## Prompt 11 — Sana iki karar sorulur (L1 onayı + u09.01)

```text
Şeyma deposunda denetim-2 düzeltmelerinin PROMPT 11'ini yap (commit öneki D2F-11).
Önce kao2-duzeltme/denetim-2/ORTAK-KURALLAR.md'yi oku ve uy; nextPrompt "D2F-11" olmalı.

GÖREV: Kullanıcıya iki karar sorusunu hazırla, kaydet ve DUR. Bu promptta hiçbir metin ya da veri değiştirme.
Arka plan (rapor D2-04, D2-10, K5-04, M-01): 158 metnin L1 onay kutularını kullanıcı değil Claude işaretledi (kullanıcının devriyle),
veride by:"owner" yazıyor, CLAUDE.md/AGENTS.md ise "L1 onayı kullanıcıda" diyor. Ayrıca u09.01'in başlığı "Emir kipi: an, ye,
ver, bağışla" ama tanış kartları geçmiş zaman anlamı veriyor ("andı", "yedi", "verdi").
OKU: docs/kuran-ogreniyorum/kao2/content/texts.tr.json (u09.01 ve review alanları) · içerik modüllerinde u09.01 lemmalarının
  emir biçimi var mı (QuranLexiconV1 alanlarını node -e ile listele; yoksa seçenek 2 sunulamaz) · CLAUDE.md KAO2 satırı (grep).
DOKUNULACAK DOSYALAR: yalnız kao2-duzeltme/denetim-2/ (KANIT, LEDGER, CURRENT-STATE, D2F-STATE).
ADIMLAR:
1) Seçenekleri somutlaştır ve KANIT'a yaz:
   L1 — A: 158 metni kullanıcı kendisi inceler (INCELEME-KAO2-17/18.md'deki L1 kutularını kendisi işaretler; işaretsizler draft
        olur ve uygulamada gizlenir). B: onaylar yerinde kalır, veri gerçeği söyler (by:"ai-delegated", delegatedBy:"owner",
        delegatedAt:"2026-10-02"; görünürlük değişmez). C: veri aynı kalır, yalnız CLAUDE.md/AGENTS.md düzeltilir.
   u09.01 — 1: başlık ve hedef kartlara uyar (önerdiğin metni yaz). 2: başlık kalır, tanış kartında emir biçimi de gösterilir
        (yalnız içerik modülünde emir biçimi varsa; yoksa bu seçeneği "mümkün değil" diye yaz). Ya da kullanıcının kendi metni.
2) LEDGER: "GATE · D2F-11 · status: waiting" + beklenen cevap biçimi. D2F-STATE: D2F-11 done, nextPrompt D2F-12.
3) Commit: "D2F-11: kullanıcı kararı bekleniyor — L1 onay kaynağı ve u09.01"
4) Kullanıcıya tek, kısa mesajla iki soruyu ve seçenekleri sun; Prompt 12'nin kutusundaki iki satırı doldurmasını söyle. DUR.
BİTTİ SAYILIR: tek commit · GATE waiting kaydı · kullanıcıya soru soruldu.
```

## Prompt 12 — Kararını uygula (kutuyu doldur)

> **Senin yapacağın:** Aşağıdaki kutuda iki `<<…>>` yerini doldur. Örnek: `L1 kararı: B` ve `u09.01: 1`.

```text
Şeyma deposunda denetim-2 düzeltmelerinin PROMPT 12'sini yap (commit öneki D2F-12).
Önce kao2-duzeltme/denetim-2/ORTAK-KURALLAR.md'yi oku ve uy; nextPrompt "D2F-12" olmalı.

KULLANICININ KARARI (birebir):
L1 kararı: <<A, B ya da C yaz>>
u09.01: <<1, 2 ya da kendi başlık ve hedef metnin>>

Yukarıdaki iki satır doldurulmamışsa ya da A/B/C ve 1/2/metin dışında bir şey yazıyorsa HİÇBİR ŞEY DEĞİŞTİRME: kullanıcıya
doğru biçimi tekrar sor ve dur.

GÖREV: Kararı uygula. Rapordaki bulgular: D2-04, D2-10, K5-04, M-01, K5-03 kalıntısı. Yeniden üretme: N-04.
OKU: kao2-duzeltme/denetim-2/evidence/D2F-11/KANIT.md (seçeneklerin tam metni) · tools/kao2-curriculum-build.mjs (--apply-review,
  review doğrulaması) · tests/kao/test_kao2_review_apply.js, test_kao2_text_review.js, test_kao2_lesson_coherence.js · CLAUDE.md/AGENTS.md KAO2 satırı.
DOKUNULACAK DOSYALAR: docs/kuran-ogreniyorum/kao2/content/texts.tr.json, tools/kao2-curriculum-build.mjs,
  app/content/quranCurriculumV2.js (yalnız araç çıktısı), docs/kuran-ogreniyorum/kao2/inceleme/INCELEME-KAO2-17.md ve -18.md
  (yalnız araç çıktısı), tests/kao/test_kao2_review_apply.js, test_kao2_text_review.js, test_kao2_lesson_coherence.js, CLAUDE.md, AGENTS.md.
  u09.01 için 2 seçildiyse ve başka dosya gerekiyorsa: DUR (BLOCKED), yeni prompt gerekir.
ADIMLAR:
1) LEDGER: "GATE · D2F-11 · status: closed" + kullanıcının iki satırı birebir alıntı.
2) Önce test (kırmızı gör), seçime göre: A → işaretli kutu ⇔ sourced; B → her sourced metinde by owner ya da ai-delegated ve
   ai-delegated ⇔ devir kaydı; C → belge kontrolü. Her durumda: CLAUDE.md ve AGENTS.md KAO2 satırı veriyle tutarlı (N-04).
   u09.01: başlık/hedef ile tanış kartının anlamı tutarlı (emir vaat ediliyorsa kartta emir biçimi görünür).
3) Uygula (yalnız araçla; quranCurriculumV2.js'i elle düzenleme). u09.01 yeni metni, kullanıcının yazdığı ya da Prompt 11'de
   sunulan seçenek metniyse sourced, by:"owner" (bu prompt onaydır); değilse draft.
   A seçildiyse: kullanıcı kutuları işaretleyene kadar metinler draft'a dönmez — bunun yerine LEDGER'a "GATE · L1 · waiting"
   yaz, CURRENT-STATE "bekleyen kullanıcı işleri"ne ekle; kutular işaretlenince ayrı bir prompt gerekir (kullanıcıya söyle).
4) CLAUDE.md ve AGENTS.md KAO2 satırları BİREBİR AYNI ve gerçeğe uygun olsun.
Commit: "D2F-12: L1 onay kaynağı ve u09.01 metni kullanıcı kararıyla düzeltildi"
BİTTİ SAYILIR: N-04 PASS · review_apply/text_review/coherence PASS · iki belge satırı aynı · GATE closed kaydı.
```

## Prompt 13 — Baştan sona doğrulama

```text
Şeyma deposunda denetim-2 düzeltmelerinin PROMPT 13'ünü yap (commit öneki D2F-13).
Önce kao2-duzeltme/denetim-2/ORTAK-KURALLAR.md'yi oku ve uy; nextPrompt "D2F-13" olmalı.

GÖREV: Tüm düzeltmeleri birlikte doğrula ve sonuç belgesini yaz.
OKU: kao2-duzeltme/denetim-2/evidence/D2F-01…12/KANIT.md "Ölçümler" bölümleri · DENETIM-RAPORU.md §1–§2, §7.
DOKUNULACAK DOSYALAR: kao2-duzeltme/denetim-2/DUZELTME-SONUCU.md (yeni), kao2-duzeltme/denetim-2/evidence/D2F-13/A-KABUL.md (yeni).
ADIMLAR:
1) KAO2_ACCEPT_SLOW_HOST=1 bash kao2-duzeltme/tools/kapilar.sh → TAM ve YEŞİL; bayraksız koşuyu da yap (yalnız göreli perf kırmızı olabilir).
2) tekrar-uret-2 → 8/9 (yalnız N-08 açık; o yayında kapanır) · tekrar-uret 10/10 · test_kao2_denetim 10/10 · plan-check ·
   d2f-sync-check --strict · node kao2-duzeltme/tools/perf-ab.cjs <depo> <git archive 07802fa6 ile açılmış scratchpad> (oran) ·
   KAO2_EVIDENCE_OUT=kao2-duzeltme/denetim-2/evidence/D2F-13/A-KABUL.md KAO2_ACCEPT_SLOW_HOST=1 node tests/kao/test_kao2_kabul.js.
3) DUZELTME-SONUCU.md: D2-01…D2-12 her satır → prompt → commit → kanıt → durum. Her satırı bu oturumda YENİDEN ölç; toplu
   "kapandı" damgası yok. Kanıt düzeyleri ayrı. Kullanıcıda kalanlar: L2 uzman onayı, 13 namaz kelimesi (uzman kararı),
   ses kayıtları (K-3), cihaz kabulü, ekran okuyucu turu.
Commit: "D2F-13: denetim-2 düzeltmelerinin baştan sona doğrulaması"
BİTTİ SAYILIR: tüm kapılar yeşil · 8/9 · belge her satırı ölçülmüş.
```

## Prompt 14 — Yayın özeti ve onay sorusu

```text
Şeyma deposunda denetim-2 düzeltmelerinin PROMPT 14'ünü yap (commit öneki D2F-14).
Önce kao2-duzeltme/denetim-2/ORTAK-KURALLAR.md'yi oku ve uy; nextPrompt "D2F-14" olmalı.

GÖREV: Yayını HAZIRLA ama YAPMA. Kullanıcıya özet sun, onay sorusunu sor ve DUR. Pin değiştirme, push yapma.
OKU: kao2-duzeltme/denetim-2/DUZELTME-SONUCU.md · git diff --stat 20261006e pininin commit'i (6796d87a)..HEAD -- app/ index.html sw.js panel-v2.html.
DOKUNULACAK DOSYALAR: yalnız kao2-duzeltme/denetim-2/ (KANIT, LEDGER, CURRENT-STATE, D2F-STATE).
ADIMLAR:
1) KANIT'a: canlıya gidecek dosyaların listesi, yeni pin önerisi (bugünün tarihi + harf), ve panel-v2.html'deki eski
   app/styles.css?v=20260811a pininin de yükseltileceği (D2-08).
2) LEDGER: "GATE · D2F-14 · status: waiting" — beklenen cevap: "YAYIN-3 onaylı" ya da "YAYIN-3 ertele".
3) Commit: "D2F-14: yayın onayı bekleniyor (YAYIN-3)"
4) Kullanıcıya kısa özet: ne değişti (DUZELTME-SONUCU'ndan 5–8 madde), hangi dosyalar canlıya gider, ve şu cümle:
   "Bu yayın, K2F-43'te (pin 20261006e) senin açık onayın alınmadan yapılan yayını da açıkça onaylamış olur."
   Prompt 15'in kutusuna "YAYIN-3 onaylı" ya da "YAYIN-3 ertele" yazmasını söyle. DUR.
BİTTİ SAYILIR: tek commit · GATE waiting · pin ve main değişmedi.
```

## Prompt 15 — Canlıya al (kutuya cevabını yaz)

> **Senin yapacağın:** Kutudaki `<<…>>` yerine `YAYIN-3 onaylı` ya da `YAYIN-3 ertele` yaz.

```text
Şeyma deposunda denetim-2 düzeltmelerinin PROMPT 15'ini yap (commit öneki D2F-15).
Önce kao2-duzeltme/denetim-2/ORTAK-KURALLAR.md'yi oku ve uy; nextPrompt "D2F-15" olmalı.

KULLANICININ CEVABI (birebir): <<YAYIN-3 onaylı ya da YAYIN-3 ertele>>

Cevap tam olarak "YAYIN-3 onaylı" ya da "YAYIN-3 ertele" değilse HİÇBİR ŞEY YAPMA; kullanıcıya bu iki cümleden birini yazmasını söyle ve dur.

GÖREV: Onaylıysa canlıya al; ertele ise yalnız kaydet. Rapordaki bulgular: D2-08, D2-06 (onay kısmı). Yeniden üretme: N-08.
OKU: kao2-duzeltme/denetim-2/evidence/D2F-14/KANIT.md · CLAUDE.md "Cache busting" · tests/app/test_iip_22.js release sabiti ·
  sw.js SW_VERSION / SW_OFFLINE_VERSION · kao2-duzeltme/evidence/K2F-18/YAYIN.md (biçim örneği).
DOKUNULACAK DOSYALAR (yalnız onaylıysa): index.html, sw.js, panel-v2.html, pin taşıyan testler
  (grep -rl 20261006e tests/ index.html sw.js panel-v2.html), kao2-duzeltme/denetim-2/evidence/D2F-15/{YAYIN.md,release-live.json}.
ADIMLAR — "YAYIN-3 ertele" ise: LEDGER "GATE · D2F-14 · status: closed (ertele)" + alıntı; D2F-STATE nextPrompt D2F-16;
  commit "D2F-15: YAYIN-3 ertelendi"; kullanıcıya Prompt 16'yı mevcut canlı pinle (20261006e) yapacağını söyle. Bitti.
ADIMLAR — "YAYIN-3 onaylı" ise:
1) LEDGER "GATE · D2F-14 · status: closed" + birebir alıntı.
2) Yeni pin: değişen HER yayın dosyasının ?v=, panel-v2.html'deki app/styles.css dahil; SW_VERSION, SW_OFFLINE_VERSION='iip22-<pin>',
   test_iip_22 release ve pin taşıyan tüm testler. Pin SONRASI: KAO2_ACCEPT_SLOW_HOST=1 bash kao2-duzeltme/tools/kapilar.sh → YEŞİL.
   tekrar-uret-2 → 9/9.
3) Commit: "D2F-15: YAYIN-3 — denetim-2 düzeltmeleri canlıda (pin <yeni>)".
4) git switch main && git merge --ff-only <bu dal> && git push origin main. Fast-forward olmazsa DUR (force yok).
5) Pages run numarasını ve sonucunu bul; erişemiyorsan "doğrulanamadı" yaz, tahmin etme. YAYIN.md'ye: pin, dosyalar, ff aralığı,
   run; "canlı bayt eşitliği: Prompt 16'da kullanıcı terminalinden". (Bu kayıtlar push'tan önceki commit'e girmeliydi:
   run numarası sonradan öğrenildiği için yalnız bu bilgi için Prompt 16 kaydına not düşülür, ayrı commit atılmaz.)
BİTTİ SAYILIR: onaylı → N-08 PASS, 9/9, main güncel, run kaydı (ya da "doğrulanamadı") · ertele → kayıt.
```

## Prompt 16 — Canlı doğrulama ve kapanış (komutu sen çalıştırırsın)

> **Senin yapacağın:**
> 1. Kendi bilgisayarında, depo klasöründe şu komutu çalıştır. `P=` kısmına canlıdaki pini yaz (Prompt 15 yeni bir pin
>    söylediyse onu, ertelediysen `20261006e`):
>
> ```bash
> P=20261006e; git checkout main && git pull --ff-only && for f in index.html sw.js panel-v2.html $(grep -oE '(src|href)="[^"]+\?v='"$P"'"' index.html panel-v2.html | sed -E 's/.*"([^"?]+)\?v=.*/\1/' | sort -u); do l=$(shasum -a 256 "$f" | cut -d' ' -f1); r=$(curl -fsS "https://mustafaras.github.io/s/$f" | shasum -a 256 | cut -d' ' -f1); [ "$l" = "$r" ] && echo "EŞİT   $f" || echo "FARKLI $f"; done; for p in kao2-duzeltme/FIX-STATE.json kao2-duzeltme/denetim-2/DENETIM-RAPORU.md archive/README.md docs/kuran-ogreniyorum/kao2/content/texts.tr.json; do echo "$(curl -s -o /dev/null -w '%{http_code}' "https://mustafaras.github.io/s/$p") $p (404 beklenir)"; done
> ```
> 2. (İsteğe bağlı) aynı yerde `node tests/kao/test_kao2_perf_budget.js` çalıştır.
> 3. Çıkan satırları aşağıdaki kutuda `<<…>>` yerine yapıştır. Komutu çalıştıramıyorsan oraya `canlı doğrulama yok` yaz.

```text
Şeyma deposunda denetim-2 düzeltmelerinin PROMPT 16'sını yap (commit öneki D2F-16).
Önce kao2-duzeltme/denetim-2/ORTAK-KURALLAR.md'yi oku ve uy; nextPrompt "D2F-16" olmalı.

KULLANICININ TERMİNAL ÇIKTISI (birebir):
<<komut çıktısını buraya yapıştır ya da "canlı doğrulama yok" yaz>>

Yukarısı boşsa ya da ne komut çıktısı ne de "canlı doğrulama yok" ise HİÇBİR ŞEY YAPMA; kullanıcıdan çıktıyı iste ve dur.

GÖREV: Canlı doğrulamayı kaydet ve programı kapat. Rapordaki yerler: D2-06 (canlı kısım), M-12, §8 doğrulanamayanlar.
DOKUNULACAK DOSYALAR: kao2-duzeltme/denetim-2/{evidence/D2F-16/CANLI.md (yeni), D2F-STATE.json, CURRENT-STATE.md, LEDGER.md,
  DUZELTME-SONUCU.md (yalnız sona "Canlı doğrulama" bölümü)}.
ADIMLAR:
1) Çıktıyı CANLI.md'ye HİÇ DEĞİŞTİRMEDEN koy. LEDGER "GATE · D2F-16 · status: closed" + özet.
2) Herhangi bir "FARKLI" satır ya da 404 olmayan gizlilik satırı varsa: program KAPANMAZ → LEDGER "BLOCKED" (hangi dosya),
   D2F-STATE status "blocked", kullanıcıya yeni bir düzeltme promptu gerektiğini söyle.
3) Hepsi "EŞİT" ve dördü 404 ise: D2F-STATE status "completed", nextPrompt null; CURRENT-STATE kapanış hâli.
   "canlı doğrulama yok" ise: kapat ama her yerde "yayın ✓ · canlı doğrulanmadı · cihaz —" yaz.
   Perf çıktısı da varsa referans makine sonucu olarak DUZELTME-SONUCU'na ekle.
4) Prompt 15'te push sonrası öğrenilen Pages run bilgisi varsa CANLI.md'ye not düş.
Commit: "D2F-16: canlı doğrulama kaydı, denetim-2 programı kapandı"
BİTTİ SAYILIR: CANLI.md kullanıcı çıktısıyla · d2f-sync-check PASS (completed ya da blocked) · tek commit.
```

---

## Hangi sorun hangi promptta?

| Rapordaki sorun | Prompt |
|---|---|
| D2-01 Kelime dizmede aynı görünen çip yanlış sayılıyor | 3 |
| D2-02 R-01 kontrolü zayıf · D2-03 R-10 kalıbı zayıf | 5 |
| D2-04 L1 onayının kaynağı / CLAUDE.md çelişkisi (K5-04, M-01) | 11 → 12 |
| D2-05 test listesi eksik (K6-06) | 8 |
| D2-06 K2F-43 onayı çıkarımla, K2F-34 yayın kanıtı yok, canlı doğrulanmadı | 10, 14 → 15, 16 |
| D2-07 bayat CURRENT-STATE / FIX-STATE / README | 10 |
| D2-08 panel-v2'de eski styles.css pini | 15 |
| D2-09 aynı derste aynı gramer sorusu (K4-04) | 4 |
| D2-10 u09.01 başlığı içerikle uyuşmuyor (K5-03) | 11 → 12 |
| D2-11 müfredat eşleme sayfası bayat (K3-07) | 7 |
| D2-12 kapsam dışı commit + gevşetilmiş plan-check | 2, 10 |
| M-05, M-07, M-12 tekrarlayan süreç hataları | 9 (önleme), 10 (kayıt), 16 (canlı) |
| Ses görevi doğrulanamadı | 6 |
| Perf göreli bant (yavaş makine) | 2, 16 (isteğe bağlı referans ölçüm) |

**Bu listeyle çözülmeyenler (senin ya da bir uzmanın işi):** L2 dinî bağlam onayı (0/37), eşlenmeyen 13 namaz kelimesi (uzman
kararı; tahminle eşleme Arapça kuralına aykırı), hece sesi kayıtları (K-3), cihaz kabulü (A-11/A-12), ekran okuyucu turu.
