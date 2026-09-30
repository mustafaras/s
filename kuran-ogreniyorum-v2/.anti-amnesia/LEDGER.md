# KAO2 LEDGER — yalnız eklenir

Kurallar:
- **Yalnız sona eklenir.** Eski kayıt düzeltilmez, silinmez; hata bulunursa yeni
  bir `FIX` kaydı eklenir ve eski kayda seq numarasıyla atıf yapar.
- Başlık biçimi (araç bunu ayrıştırır): `## seq N · YYYY-MM-DD · TÜR · KART`
  - TÜR: `PLAN` | `DECISION` | `CARD` | `BLOCKED` | `FIX` | `GATE` | `NOTE`
  - KART: `KAO2-NN` ya da `—`
- Her kayıtta en az şu satırlar: `- status:` ve `- next:` (sonraki kart ya da `none`).
- `CARD` kaydı kartı kapatırken: `- status: done`, `- commit:`, `- evidence:`,
  `- gates:` (komut → sonuç), `- metrics:`, `- evidence-levels:` (kaynak/test · yayın · cihaz), `- surprises:`.
- Aynı committe `KAO2-STATE.json.ledgerLastSeq` ve `CURRENT-STATE.md` güncellenir;
  `node kuran-ogreniyorum-v2/tools/kao2-sync-check.mjs` PASS olmadan commit atılmaz.
- `- commit:` satırına commit öncesinde `HEAD+1` yazılır (commit kendi hash'ini
  içeremez); gerçek hash bir sonraki kartın başlangıç kaydında (`NOTE`) belirtilir.

---

## seq 1 · 2026-09-28 · PLAN · —
- status: done
- summary: Kapsamlı analiz (01 kullanıcı yolculuğu: 9K/8Y/9O bulgu; 02 tasarım: T-01…T-26; 03 içerik ve pedagoji: P-01…P-10) ve plan (04 bilimsel temel D-01…D-21; 05 hedef deneyim; 06 tasarım sistemi; 07 müfredat v2; 08 teknik plan) yazıldı.
- key-facts: Motor (FSRS-5, kuyruk, telaffuz) sağlam; eksik olan öğretim katmanı ve rehberlik. Üniteler sıklık dilimi (quranLearn.js L552); `q.units` hiç yazılmıyor; Fâtiha taşı yanlış koşulda (L435); 25 kavramın `plainTr`'si gösterilmiyor; cevap sonrası ekran anında geçiyor (L968).
- next: KAO2-00

## seq 2 · 2026-09-28 · DECISION · —
- status: done
- summary: G0 kararları kullanıcı yetkisiyle alındı (10-KARARLAR.md).
- K-1: içerik ≤256 KiB gzip (modül başı tavan), runtime ≤80 KiB, css ≤14 KiB, ses ≤24 MB, vm p95 ≤40 ms.
- K-2: quranLearnFlow.js → quranLearnViews.js → quranLearn.js; dört liste aynı committe.
- K-3: hece sesi = insan kaydı, iki ses (kademe A); geçici olarak kelime içinde ses (kademe B); TTS yasak.
- K-4: L0 otomatik + L1 proje sahibi + L2 alan uzmanı; draft görünmez.
- measurements: içerik 158,4 KiB (bütçe 160 KiB, KF-11); runtime 50.221 B; css 7.051 B; ses 14 MB / 16 MB.
- next: KAO2-00

## seq 3 · 2026-09-28 · PLAN · —
- status: done
- summary: Yol haritası bağımlılık sırasına göre yeniden dizildi (müfredat KAO2-07 → motor 08 → Bugün 09 → hub 10 → ilk açılış 11 → ders oynatıcı 12). Anti-amnezi sistemi (bu dosya, CURRENT-STATE.md, tools/kao2-sync-check.mjs) ve tek dosyalık sıralı UYGULAMA-PROMPTLARI.md oluşturuldu.
- files: kuran-ogreniyorum-v2/{09-YOL-HARITASI.md, 10-KARARLAR.md, UYGULAMA-PROMPTLARI.md, KAO2-STATE.json, tools/kao2-sync-check.mjs, .anti-amnesia/*}
- evidence-levels: kaynak/test — yalnız plan belgeleri ve senkron aracı (uygulama kodu değişmedi) · yayın — yok · cihaz — yok
- next: KAO2-00

## seq 4 · 2026-09-28 · NOTE · —
- status: done
- summary: Kullanıcı isteğiyle ("push commit merge deploy") plan klasörü `KAO2-PLAN` commit'iyle kao-duzeltme dalına alındı, main'e fast-forward birleştirildi, push edildi; GitHub Pages yeniden dağıttı. Uygulama kodu değişmedi (yalnız kuran-ogreniyorum-v2/).
- consequence: KAO2-00 artık planı commit'lemez; dal `main`'den açılır (UYGULAMA-PROMPTLARI KAO2-00 adım 1–2 güncellendi).
- evidence-levels: kaynak/test — sync-check PASS · yayın — Pages çalışması (hash ve run kimliği bir sonraki kayıtta) · cihaz — yok
- next: KAO2-00

## seq 5 · 2026-09-28 · BLOCKED · KAO2-00
- status: blocked
- title: K-1 süre kapısı mevcut sözlükte aşılıyor; üretici optimizasyonu kapsam dışı
- prev-commit: d4faa17
- commit: HEAD+1
- evidence: kuran-ogreniyorum-v2/evidence/KAO2-00/KANIT.md
- attempted: Kullanıcı d4faa17 tabanını onayladı; dal açıldı; TDD 1 KiB kırmızı, gerçek K-1 tavanlarında boyut yeşil ama süre kırmızı. R-C5 ve ses bütçesi güncellendi.
- gates: perf FAIL (82,948 / 80,949 ms >40) · user_tasks PASS · audio self-test PASS · sync PASS; diğer P3 kapıları durma koşulu nedeniyle çalıştırılmadı
- metrics: içerik 162177 B · runtime 50221 B · css 7051 B gzip; ayrı modül teşhisinde sözlük p95 84,421 ms
- changed-tests: test_kao_user_tasks.js K-1 bütçeleri; yeni test_kao2_perf_budget.js
- proposed: tools/kao-lexicon-build.mjs ve üretilmiş app/content/quranLexiconV1.js için sınırlı optimizasyon kapsam onayı; semantik/freeze kontrolleri ve tüm P3 kapıları korunmalı
- evidence-levels: kaynak/test kısmi, süre FAIL · yayın yok · cihaz yok
- surprises: mevcut sözlük yükleme süresi 40 ms bütçesini tek başına aşıyor; kaynakça teyidi tamamlanmadı
- next: KAO2-00

## seq 6 · 2026-09-28 · FIX · KAO2-00
- status: done
- summary: Seq 5 BLOCKED (a47a68f) sonrası kullanıcı tools/kao-lexicon-build.mjs ve araç çıktısı app/content/quranLexiconV1.js optimizasyonunu onayladı. Kart in_progress olarak sürdürüldü; Dokun listesi eşlendi. Tek geçişli decoder, içerik semantiği korunarak süre engelini çözdü.
- evidence: kuran-ogreniyorum-v2/evidence/KAO2-00/KANIT.md
- next: KAO2-00

## seq 7 · 2026-09-28 · CARD · KAO2-00
- status: done
- title: K-1 bütçe ve süre kapısı, ses bütçesi 24 MB, kaynakça teyidi
- prev-commit: a47a68f
- commit: HEAD+1
- evidence: kuran-ogreniyorum-v2/evidence/KAO2-00/KANIT.md
- gates: kao 18 PASS · app 77 PASS · panel 23 PASS · panel-v2 27 PASS · quran 9 PASS · reminders PASS · driver PASS · zikr 95/95 PASS · contrast 336/336 PASS · sync PASS; migration 67/67 PASS; lexicon/audio self-test PASS; semantic parity PASS; freeze 4/4 bayt-eş
- metrics: içerik gzip 162173 B · runtime 50221 B · CSS 7051 B · VM p95 3,834 ms ≤40 · 524 lemma semantik eş · 38 kaynak işaretli (37 ✓, 1 ⚠︎)
- changed-tests: R-C5 K-1 bütçeleri; yeni perf fixture; mevcut beklentiler zayıflatılmadı
- evidence-levels: kaynak/test ✓ · yayın — · cihaz —
- surprises: yükleme maliyeti onaylı üretici düzeltmesiyle çözüldü; Ausubel 1968 birincil teyidi yok, D-07 işaretli
- next: KAO2-01

## seq 8 · 2026-09-28 · BLOCKED · KAO2-01
- status: blocked
- title: Taban ve dökümler hazır; eski plan kapısı KAO2 commit önekini reddediyor
- prev-commit: f09987f5
- commit: HEAD+1
- evidence: kuran-ogreniyorum-v2/evidence/KAO2-01/KANIT.md
- attempted: perf tabanı 5,087625 ms, üzerine yazma korumalı opt-in; 24 sentetik HTML; P3 163/163 PASS. 08 §7 eski kao-plan-check exit 1: a47a68f/f09987f KAO2-00 öneki tanınmıyor.
- metrics: 1899 runtime satırı; 9 yazı ağırlığı; 35 KAO handler; 24 HTML
- proposed: yalnız docs/kuran-ogreniyorum/tools/kao-plan-check.mjs KAO2-00…27 önek uyumu için kapsam onayı; bilinmeyen önek reddini koru
- evidence-levels: kaynak/test P3 PASS, eski plan gate FAIL · yayın yok · cihaz yok
- surprises: eski programın commit önek tarayıcısı yeni programı kapsamıyor
- next: KAO2-01

## seq 9 · 2026-09-28 · FIX · KAO2-01
- status: done
- summary: Kullanıcının BLOCKED çözme talimatıyla docs/kuran-ogreniyorum/tools/kao-plan-check.mjs önek uyumu kapsamı onaylandı; Dokun listesi eşlendi. Seq 8 (b66a9e8) engeli yalnız iki regex değişikliğiyle çözüldü. 28 kart ve negatif önek örnekleri TDD PASS; mevcut self-test 19/19 PASS.
- next: KAO2-01

## seq 10 · 2026-09-28 · CARD · KAO2-01
- status: done
- title: Taban ölçüm, performans tabanı ve önce dökümleri
- prev-commit: b66a9e8
- commit: HEAD+1
- evidence: kuran-ogreniyorum-v2/evidence/KAO2-01/KANIT.md
- gates: P3 163/163 PASS (kao18/app77/panel23/panel-v2 27/quran9); reminder/driver/zikr/contrast PASS; eski plan PASS (3 WARN), self-test 19/19; prefix/artefakt/hash PASS; sync PASS
- metrics: p95 tabanı 5,087625 ms; 24 HTML; runtime 1899 satır; CSS 9 font-weight; KAO handler 35
- changed-tests: perf fixture yalnız opt-in taban yazma; kanıt alanında prefix ve artefakt kabul testleri
- evidence-levels: kaynak/test ✓ · yayın — · cihaz —
- surprises: eski commit önek engeli onaylı dosya kapsamıyla çözüldü; taban/döküm baytları değişmedi
- next: KAO2-02

## seq 11 · 2026-09-28 · CARD · KAO2-02
- status: done
- title: Tasarım sözleşmesi fixture'ı (taban modu)
- prev-commit: c89c3b4
- commit: HEAD+1
- evidence: kuran-ogreniyorum-v2/evidence/KAO2-02/KANIT.md
- gates: kao19/app77/panel23/panel-v2 27/quran9 PASS; reminders/driver/zikr/contrast PASS; toplam P3 164/164; eski plan PASS; sync PASS; strict beklenen FAIL, baseline PASS
- metrics: weights9 · uppercase4 · deco5 · serif3 · kaldırılacak13/13 · 24 görünüm primary≤1 · 4 ayar senaryosunda 5/5 switch semantiği eksik
- changed-tests: yalnız yeni test_kao2_design_contract.js + envanter; eski testler değişmedi
- evidence-levels: kaynak/test baseline ✓, hedef strict beklenen FAIL · yayın — · cihaz —
- surprises: yok; üretim tasarımı değişmedi, mevcut ihlaller kilitlendi
- next: KAO2-03

## seq 12 · 2026-09-28 · NOTE · —
- status: done
- summary: Kullanıcı tamamlanan KAO2-00…02'yi yeniden doğrulayıp canlıya almayı açıkça istedi. Yalnız bu teslim için commit/push/main fast-forward/Pages yetkisi kaydedildi; KAO2-03 kapsam dışı.
- release-preparation: Ortak cache pini 20260928a index.html/sw.js/test_iip_22.js içinde eşlendi. Pages runtime-only rsync ve guard yeni kuran-ogreniyorum-v2 klasörünü dışlıyor. Gelecek KAO2 kartları yayın yetkisi almış sayılmaz.
- evidence-levels: kaynak/test yayın öncesi yeniden koşuluyor · yayın sonucu commit sonrası Actions/canlı hash makbuzuyla raporlanacak · cihaz doğrulanmadı
- next: KAO2-03

## seq 13 · 2026-09-28 · NOTE · —
- status: done
- summary: Onaylı KAO2-00…02 ara yayını tamamlandı; main fast-forward, origin/main ve origin/kao2-yeniden-tasarim yayın commitine eşitlendi.
- release: 5aff0012e4be87142273cf4e78cb15e5ca64c0bb; pin20260928a; Actions36412204478 validate/deploy success.
- gates: P3 164/164 PASS; eski plan ve self-test19 PASS; sync PASS; 524 lemma semantik eşlik PASS; p95 4,210 ms.
- evidence: evidence/KAO2-02/YAYIN.md + release-gates.json + release-live.json
- evidence-levels: kaynak/test PASS · yayın 12 canlı varlık byte/hash eş, 2 plan URL 404 · cihaz doğrulanmadı
- boundaries: KAO2-03 başlamadı; bu makbuz commitinde yalnız plan/kanıt güncellenir. Gelecek kartlara yayın onayı aktarılmaz.
- next: KAO2-03


## seq 14 · 2026-09-28 · NOTE · —
- status: in_progress
- summary: Kullanıcı konum kapısı hatasının canlıya alınmasını ve ardından sıradaki KAO2 kartına geçilmesini istedi. Fe9de9c düzeltmesinin app.js/appSurface.js sürüm önbelleğini aşması için release pini 20260928a→20260928b olarak index/SW/fixture'larda eşlendi; Pages36415570405 success ve 12 canlı varlık byte/hash eş. Bir sonraki KAO kartı bu yeni taban pinini korur.
- evidence-levels: kaynak/test önceki turda 164/164 PASS + konum regresyonu 39/39 PASS; yayın 12 asset byte eşliği ✓ · cihaz doğrulanmadı
- next: KAO2-03


## seq 15 · 2026-09-28 · CARD · KAO2-03
- status: done
- title: Tokenlar ve süs temizliği
- prev-commit: a488e5c
- commit: HEAD+1
- evidence: kuran-ogreniyorum-v2/evidence/KAO2-03/KANIT.md
- gates: P3 164/164 PASS (kao19/app77/panel23/panel-v2 27/quran9); reminders21 fixture/73 assertion PASS; driver PASS; zikr95/95 PASS; contrast328 çift/0 ihlal PASS; sync PASS
- metrics: font-weight 2/≤4 · uppercase0 · letter-spacing0 · deco0 · serif0 · 13/13 seçici kaldırıldı · 24 görünüm primary≤1 · CSS gzip6411 B/≤14 KiB · perf p95 5,073 ms · contrast328/0
- changed-tests: design fixture baseline sabitleri + strict; render test süs span yokluğunu ve 44 px row tokenını doğrular
- evidence-levels: kaynak/test ✓ · yayın — · cihaz —
- surprises: legacy kao-plan-check tam taraması önceki yayımlanmış c7d5190/a488e5c teslim kayıtlarında 19 kapsam bulgusu veriyor; --self-test 19/19 PASS; P3 dışı, araç/kart kapsamı dışında
- next: KAO2-04

## seq 16 · 2026-09-28 · BLOCKED · KAO2-04
- status: blocked
- summary: K-2, run-seyma driver/harness FILES listelerini yalnız Edit aracıyla değiştirmeyi şart koşuyor; bu oturumda o araç yok. Ayrıca fail-closed görünüm bağımlılığı, yeni modül yüklemeyen mevcut KAO test fixture'larının güncellenmesini gerektiriyor; dört dosya KAO2-04 Dokun listesi dışında.
- attempted: Yeni gezinme fixture'ı yazılıp çalıştırıldı; ilk hata kaoNav API'sinin bulunmamasıydı. Kapsam dışı test/skill dosyalarına dokunulmadı.
- resolution: Kullanıcıdan dört KAO fixture'ının yalnız modül yükleme satırları için kapsam onayı ve `.claude/skills/run-seyma/*.mjs` düzenlemesi için Edit aracıyla devam edilmesi gerekiyor.
- evidence: kuran-ogreniyorum-v2/evidence/KAO2-04/KANIT.md
- next: KAO2-04

## seq 17 · 2026-09-28 · FIX · KAO2-04
- status: in_progress
- summary: Kullanıcı KAO2-04'ü yeniden açtı; yeni görünüm modüllerini yüklemek için dört KAO test fixture'ı kapsamını ve iki run-seyma FILES listesindeki düzenleme için apply_patch kullanımını açıkça onayladı.
- resolution: Seq 16'daki P6 engeli bu sınırlı kapsam onayıyla çözüldü. Üretim modülü görünüm bağımlılığını gerçek render yolunda fail-closed tutacak; saf motor testlerinin gereksiz modül bağımlılığı kazanmasına izin verilmeyecek.
- next: KAO2-04

## seq 18 · 2026-09-28 · BLOCKED · KAO2-04
- status: blocked
- summary: KAO2-04 akış/görünüm iskeleti ile NavBar uygulandı; KAO, panel, panel-v2, Kur'an, reminders, driver, zikr ve kontrast kapıları PASS. Genel app kapısı, iki yeni KAO shim'i yüzünden mevcut yüzey sayıları değişen kapsam dışı testlerde durdu.
- attempted: KAO suite izole tam tekrar PASS; perf 3.839 ms; app ailesi `test_app_surface_daily_boundary.js` 594/756 sabitini ve `test_v3_welcome.js` 756 sabitini korumaya çalıştı, ölçülen değer 596/758.
- resolution: Bu iki test KAO2-04 Dokun listesinde değil. Kullanıcı onayı gelene kadar dosyaları değiştirme; onay yalnız bu iki sayısal pini eşlemek için istenir.
- evidence: kuran-ogreniyorum-v2/evidence/KAO2-04/KANIT.md
- evidence-levels: kaynak/test kısmi PASS · yayın — · cihaz —
- next: KAO2-04

## seq 19 · 2026-09-28 · FIX · KAO2-04
- status: in_progress
- summary: Kullanıcı kapsamı yalnız `tests/app/test_app_surface_daily_boundary.js` ve `tests/app/test_v3_welcome.js` içindeki mevcut sayısal yüzey pinlerini güncellemek için genişletti.
- resolution: Ölçülen App function assignment sayısı 596, benzersiz yüzey 758; diğer kapsam dışı dosyalar hâlâ değiştirilmeyecek. Aynı KAO2-04 sürdürülüyor.
- next: KAO2-04

## seq 20 · 2026-09-28 · CARD · KAO2-04
- status: done
- title: Üç dosya iskeleti, gezinme yığını ve NavBar
- prev-commit: 30662403
- commit: HEAD+1
- evidence: kuran-ogreniyorum-v2/evidence/KAO2-04/KANIT.md
- gates: kao PASS · app PASS · panel PASS · panel-v2 PASS · quran PASS · reminders PASS · driver PASS · zikr PASS · contrast PASS · sync PASS
- metrics: App atamaları 596 · benzersiz yüzey 758 · etkileşim 393 · içerik 158.372 KiB/256 · runtime 52.172 KiB/80 · CSS 6.444 KiB/14 · p95 3.839 ms/40 · 11/11 görünüm başlığı · kontrast 340/0 ihlal
- changed-tests: yeni gezinme testi; dört KAO modül yükleme listesi; FX2 yüzey pinleri 756→758; kullanıcı onayıyla daily-boundary assignment 594→596/yüzey 756→758 ve v3 yüzey 756→758
- evidence-levels: kaynak/test ✓ · yayın — · cihaz —
- surprises: paralel P3 koşusunda p95 gürültülü çıktı; izole tekrar 3.839 ms PASS
- next: KAO2-05

## seq 21 · 2026-09-28 · NOTE · —
- status: approved
- summary: Kullanıcı KAO2-04 tamamlandıktan sonra "canlıya al ve sıradan devam et" dedi. Açık onay KAO2-03…04 kaynak tesliminin uzak KAO2 dalına push edilmesini, main'e fast-forward edilmesini, GitHub Pages yayını ve canlı byte/hash doğrulamasını kapsıyor.
- release-boundary: KAO2-05 ve sonrası için yayın yetkisi verilmedi; sonraki kart yerel kalır.
- evidence-levels: kaynak/test KAO2-04 KANIT.md'de PASS · yayın makbuzu bekleniyor · cihaz doğrulanmadı
- next: KAO2-05

## seq 22 · 2026-09-28 · NOTE · —
- status: verified
- summary: KAO2-03…04, kaynak commit `5037b07b0279596f4f703bb50f8d4f33c1c715b5` üzerinden onaylı kapsamda main'e fast-forward edilip Pages'te yayımlandı.
- actions: run `36423925592` success; `validate` ve `deploy` işleri PASS; runtime-only paket ve asset guard PASS.
- live: 14 yayımlanmış runtime varlığının HTTP baytları yerel SHA-256 ile eşleşti; KAO2 state ve kanıt yolları beklenen 404.
- evidence: kuran-ogreniyorum-v2/evidence/KAO2-04/YAYIN.md · kuran-ogreniyorum-v2/evidence/KAO2-04/release-live.json
- evidence-levels: kaynak/test PASS · yayın/hash PASS · cihaz doğrulanmadı
- release-boundary: kullanıcı onayı KAO2-03…04 ile sınırlı; KAO2-05 ve sonrası yayımlanmayacak.
- next: KAO2-05

## seq 23 · 2026-09-28 · CARD · KAO2-05
- status: done
- title: Bileşen kütüphanesi
- prev-commit: 3d0b2a0
- commit: HEAD+1
- evidence: kuran-ogreniyorum-v2/evidence/KAO2-05/KANIT.md
- gates: kao PASS · app PASS · panel PASS · panel-v2 PASS · quran PASS · reminders PASS · driver PASS · zikr PASS · contrast PASS · sync PASS
- metrics: içerik 158.372 KiB/256 · runtime 53.770 KiB/80 · CSS 7.329 KiB/14 · p95 4.896 ms/40 · kontrast 374/0 ihlal · 21 KAO fixture PASS
- changed-tests: yeni test_kao2_components.js; mevcut testler değişmedi
- evidence-levels: kaynak/test ✓ · yayın — · cihaz —
- surprises: ilk P3 koşusundaki nowrap çatışması CSS kapsamı içinde giderildi; son koşu tamamen PASS · switch entegrasyonu için mevcut KAO2-09 TODO korunuyor
- next: KAO2-06

## seq 24 · 2026-09-28 · BLOCKED · KAO2-06
- status: blocked
- title: Geri bildirim paneli ve Devam — kapsam dışı App yüzey pinleri P3'ü durdurdu
- prev-commit: fd751fc
- commit: HEAD+1
- evidence: kuran-ogreniyorum-v2/evidence/KAO2-06/KANIT.md
- attempted: KAO2-06 uygulaması ve KAO testleri tamamlandı; P3'ün tamamı çalıştırıldı. 77 uygulama fixture'ının 75'i geçti; iki sabit yüzey sayısı yeni App.kaoContinue shim'iyle ölçülen 597 atama/759 yüzey değerlerini beklemiyor.
- gates: syntax PASS · KAO 22/22 PASS · app 75/77 BLOCKED · panel 23/23 PASS · panel-v2 27/27 PASS · quran 9/9 PASS · reminders 21/21 PASS · driver PASS · zikr 95/95 PASS · contrast 382 çift/0 ihlal PASS · sync PASS
- proposed: Kullanıcı yalnız `tests/app/test_app_surface_daily_boundary.js` ve `tests/app/test_v3_welcome.js` içindeki sayısal pinlerin 596→597 ve 758→759 olarak eşlenmesine kapsam onayı verirse aynı KAO2-06'ya FIX kaydıyla dön ve tüm P3'ü yeniden çalıştır.
- evidence-levels: kaynak/test KAO PASS, tam P3 bloklu · yayın yok · cihaz doğrulanmadı
- surprises: README eski satırında KAO2-03'ü sıradaki gösteriyor; canlı STATE/CURRENT-STATE nextCard KAO2-06 ile uyumlu, README kapsam dışı olduğu için değişmedi.
- next: KAO2-06

## seq 25 · 2026-09-28 · FIX · KAO2-06
- status: in_progress
- summary: Kullanıcı “blocked sorununu çöz” talebiyle seq24'te belirtilen iki sayısal App pininin düzeltilmesini onayladı.
- resolution: `tests/app/test_app_surface_daily_boundary.js` işlev ataması/yüzey pinleri 596/758→597/759; `tests/app/test_v3_welcome.js` yüzey pini 758→759 güncellendi. İki hedefli kapı ve tam P3 yeşil.
- evidence: kuran-ogreniyorum-v2/evidence/KAO2-06/KANIT.md
- next: KAO2-06

## seq 26 · 2026-09-28 · CARD · KAO2-06
- status: done
- title: Geri bildirim paneli ve Devam
- prev-commit: 2c94f1d
- commit: HEAD+1
- evidence: kuran-ogreniyorum-v2/evidence/KAO2-06/KANIT.md
- gates: syntax PASS · KAO 22/22 PASS · app 77/77 PASS · panel 23/23 PASS · panel-v2 27/27 PASS · quran 9/9 PASS · reminders PASS · driver PASS · zikr 95/95 PASS · contrast 382 çift/0 ihlal PASS · sync PASS
- metrics: handler 38 · içerik gzip 158.372 KiB · runtime gzip 54.923 KiB · CSS gzip 7.460 KiB · VM p95 4.318 ms · geçiş p50/max 0.134/0.907 ms · ECE 0.0131 · gece 8 kart
- changed-tests: yeni test_kao2_feedback.js; etkilenen KAO testleri; FX2 yüzey pinleri; günlük App yüzeyi pinleri 596/758→597/759; v3 yüzey pini 758→759
- evidence-levels: kaynak/test ✓ · yayın — · cihaz —
- surprises: paralel P3 koşusunda perf p95 gürültülüydü; izole tekrar 4.318 ms ve tam KAO ailesi PASS. README'deki eski KAO2-03 satırı değiştirilmedi, kanıta kaydedildi.
- next: KAO2-07

## seq 27 · 2026-09-28 · NOTE · —
- status: verified
- summary: Kullanıcı “push commit merge deploy, şimdiye kadar tüm yaptıklarımızı canlıya al” talebiyle önceki KAO2-04 yayın sınırını KAO2-05…06'ya genişletti; KAO2-07 kapsam dışı kaldı.
- source: `b36db6b2e6286247f8f29d4ac6362ce6b8ae401d`; `kao2-yeniden-tasarim` ve `main` bu SHA'ya fast-forward eşitlendi.
- actions: Pages run 36446272528 success; validate ve deploy PASS.
- live: 14/14 runtime varlığı HTTP 200 ve yerel SHA-256 ile birebir; STATE ve KAO2-06 kanıt URL'leri runtime-only paket nedeniyle beklenen 404.
- evidence: kuran-ogreniyorum-v2/evidence/KAO2-06/YAYIN.md · kuran-ogreniyorum-v2/evidence/KAO2-06/release-live.json
- evidence-levels: kaynak/test PASS · yayın/run/hash PASS · cihaz doğrulanmadı
- next: KAO2-07

## seq 28 · 2026-09-28 · CARD · KAO2-07
- status: done
- title: Müfredat derleme aracı ve quranCurriculumV2.js
- prev-commit: 944dae6c
- commit: HEAD+1
- evidence: kuran-ogreniyorum-v2/evidence/KAO2-07/KANIT.md
- gates: syntax PASS · kao 23/23 PASS · app 77/77 PASS · panel 23/23 PASS · panel-v2 27/27 PASS · quran 9/9 PASS · reminders PASS · driver PASS · zikr 95/95 PASS · contrast 382 çift/0 ihlal PASS · sync PASS
- metrics: 524/524 lemma tam 1 derste · 12 ünite · 109 ders (3–7) · 25/25 kavram bağlı · S0 s0.01…s0.12 · iki çalıştırma bayt-eşit · gzip 10,104 KiB ≤48 · içerik toplamı 168,476 KiB ≤256 · VM p95 4,1–4,7 ms
- changed-tests: yeni test_kao2_curriculum.js; test_kao2_perf_budget.js müfredat modülünü zorunlu kıldı; test_state_rebind_boundary.js boot listesine modül eklendi
- evidence-levels: kaynak/test ✓ · yayın — · cihaz —
- surprises: Ünite 6 = 196 kelime (kart kuralı harfiyen; G2 kararına); Ünite 2 lp_* nedeniyle 11 odak kimliğiyle genişletildi; ders sayısı ~75 değil 109; .claude/skills iki FILES listesi K-2 gereği Edit aracıyla izinle düzenlendi
- next: KAO2-08

## seq 29 · 2026-09-28 · GATE · —
- status: open
- summary: G2 open · MUFREDAT-ESLEME.md kullanıcı onayı bekleniyor. KAO2-07 done; KAO2-08 G2 kapanmadan (LEDGER'da `GATE · — · G2 closed` kaydı olmadan) başlamaz.
- review: kuran-ogreniyorum-v2/inceleme/MUFREDAT-ESLEME.md (onay kutuları + karar bekleyen noktalar: Ünite 6 büyüklüğü, Ünite 5/12 küçüklüğü, Ünite 2 odak eki)
- next: KAO2-08

## seq 30 · 2026-09-28 · FIX · KAO2-07
- status: done
- summary: Kullanıcı G2 incelemesinde "Onay + Ünite 6 dengele" seçti. `curriculum.spec.json` poolRules'a türemiş isim kuralı (ism-i fâil/mef'ûl/mekân, masdar → Ünite 10) eklendi; araç yeniden çalıştırıldı.
- resolution: Ü6 196→147 kelime (40→30 ders), Ü10 49→98 (10→20 ders); toplam 109 ders. test_kao2_curriculum 12/12, perf PASS (gzip 10,111 KiB, p95 4,132 ms).
- evidence: kuran-ogreniyorum-v2/evidence/KAO2-07/KANIT.md
- next: KAO2-08

## seq 31 · 2026-09-28 · GATE · —
- status: closed
- summary: G2 closed · Kullanıcı MUFREDAT-ESLEME.md eşlemesini Ünite 6 dengelemesiyle onayladı (Ünite 2 odak eki ve kalan dağılım olduğu gibi kabul). KAO2-08 önkoşulu karşılandı.
- next: KAO2-08

## seq 32 · 2026-09-28 · CARD · KAO2-08
- status: done
- title: "Sıradaki adım" motoru (quranLearnFlow.js)
- prev-commit: e87e1f0a
- commit: HEAD+1
- evidence: kuran-ogreniyorum-v2/evidence/KAO2-08/KANIT.md
- gates: syntax PASS · kao 24/24 PASS · app 77/77 PASS · panel 23/23 PASS · panel-v2 27/27 PASS · quran 9/9 PASS · reminders PASS · driver PASS · zikr 95/95 PASS · contrast 382 çift/0 ihlal PASS · sync PASS
- metrics: nextStep 7 satır + 2 kenar PASS · Flow yasaklı API 0 · migration onboarding/path PASS · runtime gzip 58,813 KiB ≤80 · VM p95 4,225 ms
- changed-tests: yeni test_kao2_next_step.js; test_kao_migration.js yeni onboarding/path beklentileri
- evidence-levels: kaynak/test ✓ · yayın — · cihaz —
- surprises: next-unit, 05 §4 tablosunda ulaşılamaz sırada olduğu için "yeni ünite başlamadı" koşuluyla daily'den önce; action tanımlayıcıları KAO2-09/11/12'de bağlanacak; daily.ms yazılmıyor, süre 0,55 dk/görev yedeğiyle
- next: KAO2-09

## seq 33 · 2026-09-29 · FIX · KAO2-09
- status: in_progress
- summary: Kullanıcı KAO2-09 için kapsamı üç adımda genişletti: (1) test_kao_requirements.js + test_kao_queue.js yalnız ana ekran/switch semantiği beklentileri; (2) test_kao_user_tasks.js satır 196 ana ekran → İlerleme beklentisi; (3) KAO fikstürlerinde (navigation, queue, user_tasks, requirements, render) yalnız modül yükleme satırlarına quranCurriculumV2.js (KAO2-04 emsali).
- resolution: P6 engeli kod yazımından önce kullanıcı onayıyla çözüldü; başka kapsam dışı dosyaya dokunulmadı.
- next: KAO2-09

## seq 34 · 2026-09-29 · CARD · KAO2-09
- status: done
- title: Bugün ekranı, tek birincil eylem ve Yolun kartı
- prev-commit: 1a697a0c
- commit: HEAD+1
- evidence: kuran-ogreniyorum-v2/evidence/KAO2-09/KANIT.md
- gates: syntax PASS · kao 25/25 PASS · app 77/77 PASS · panel 23/23 PASS · panel-v2 27/27 PASS · quran 9/9 PASS · reminders PASS · driver PASS · zikr 95/95 PASS · contrast 406 çift/0 ihlal PASS · sync PASS
- metrics: today 7/7 · design strict (f) PASS: switch 5/5 · primary/görünüm ≤1 · runtime gzip 60,031 KiB · CSS 7,834 KiB · p95 4,227 ms
- changed-tests: yeni test_kao2_today.js; design (f) zorunlu; render/requirements/queue/user_tasks bilerek değişen ana ekran beklentileri; 5 fikstürde yükleme satırı
- evidence-levels: kaynak/test ✓ · yayın — · cihaz —
- surprises: harita İlerleme'ye, âyet sayacı Günün âyeti ekranına taşındı (erişim korunur); İlerleme'de </main> işaretleme hatası düzeltildi; eski ana ekran CSS'i öksüz, KAO2-26 backlog
- next: KAO2-10

## seq 35 · 2026-09-29 · FIX · KAO2-08
- status: done
- summary: KAO2-00…09 denetimi. Tekrar borcu >60 iken yeni ünite başlangıcında nextStep `next-unit` döndürüyordu; 05 §10 "Bugün yalnız tekrar" kuralına aykırı (masteryAt KAO2-13'e kadar yazılmadığı için üretimde gizli). `lessonStep` next-unit'i yalnız fresh>0 iken seçer.
- resolution: test_kao2_next_step.js yeni kenar satırı kırmızı→yeşil (14 kontrol); P3 kapıları yeşil.
- evidence: kuran-ogreniyorum-v2/evidence/KAO2-08/KANIT.md (Ek — FIX)
- next: KAO2-10

## seq 36 · 2026-09-29 · FIX · KAO2-09
- status: done
- summary: KAO2-00…09 denetimi. `app/kao.css` `.kao-path-more:focus-visible` `--quran-mid` → `--kao-tint` (yalnız --kao-* sözleşmesi; görsel fark yok). KANIT'taki CSS gzip 7,834 KiB yanlış kaydedilmişti: f3c9905c'de 7,822, FIX sonrası 7,817 KiB.
- resolution: gates: syntax PASS · kao 25/25 · app 77/77 · panel 23/23 · panel-v2 27/27 · quran 9/9 · reminders PASS · driver PASS · zikr 95/95 · contrast 406/0 · perf PASS (runtime 60,088 KiB · css 7,817 KiB · p95 4,37 ms) · sync PASS.
- evidence: kuran-ogreniyorum-v2/evidence/KAO2-09/KANIT.md (Ek — FIX)
- next: KAO2-10

## seq 37 · 2026-09-29 · NOTE · —
- status: verified
- summary: Kullanıcı denetim raporu sonrası "onaylıyorum" → kapsam sorusuna "hepsini" yanıtıyla KAO2-07…09 + denetim FIX'lerinin yayınını onayladı; releaseApproval approved_through_KAO2-09.
- source: `3b1b3d16bc26425e522cd42182da963ec451281e`; `kao2-yeniden-tasarim` ve `main` 944dae6c'den bu SHA'ya fast-forward eşitlendi.
- actions: Pages run 36531279286 success; validate ve deploy PASS.
- live: 15/15 runtime varlığı (quranCurriculumV2.js dahil) HTTP 200 ve yerel SHA-256 ile birebir; STATE ve KAO2-09 KANIT beklenen 404.
- evidence: kuran-ogreniyorum-v2/evidence/KAO2-09/YAYIN.md · kuran-ogreniyorum-v2/evidence/KAO2-09/release-live.json
- evidence-levels: kaynak/test PASS · yayın/run/hash PASS · cihaz doğrulanmadı
- next: KAO2-10

## seq 38 · 2026-09-29 · FIX · KAO2-10
- status: done
- summary: Kullanıcı KAO2-10 için kapsamı genişletti: Dokun dışı dört KAO testinde (test_kao_render.js, test_kao_queue.js, test_kao_user_tasks.js, test_kao_requirements.js) yalnız hub kartı beklentilerinin 05 §8'e göre güncellenmesi (KAO2-09 seq33 emsali).
- resolution: P6 engeli kod yazımından önce kullanıcı onayıyla çözüldü; tests/app fx2/v3 pinleri dış düğme satırı korunarak değiştirilmedi.
- next: KAO2-10

## seq 39 · 2026-09-29 · CARD · KAO2-10
- status: done
- title: Hub kartı v2 (tek bilgi, tek eylem, gerçek ilerleme)
- prev-commit: 4e836148
- commit: HEAD+1
- evidence: kuran-ogreniyorum-v2/evidence/KAO2-10/KANIT.md
- gates: syntax PASS · kao 26/26 PASS · app 77/77 PASS · panel 23/23 PASS · panel-v2 27/27 PASS · quran 9/9 PASS · reminders PASS · driver PASS · zikr 95/95 PASS · contrast 414 çift/0 ihlal PASS · sync PASS
- metrics: hub 8/8 · 05 §8 dört durum birebir · halka gerçek ünite ilerlemesi (Ü1 1/5 → %20), başlanmamışta yok · tek düğme/tek onclick · render veri yazmaz · runtime gzip 60,788 KiB · CSS 8,008 KiB · p95 4,36 ms
- changed-tests: yeni test_kao2_hub.js; render/queue/user_tasks/requirements hub beklentileri (seq38 onayı)
- evidence-levels: kaynak/test ✓ · yayın — · cihaz —
- surprises: eski hub CSS'i öksüz (B-KAO2-10-1 → KAO2-26); kontrast aracı dekoratif ikonu 4,5 eşiğiyle ölçüyor, ikon zemini %8'e indirildi; motor/müfredat eksikse hub sade karta düşer
- next: KAO2-11

## seq 40 · 2026-09-29 · NOTE · —
- status: verified
- summary: Kullanıcı "tümünü canlıya al" dedi; KAO2-10 yayınlandı, releaseApproval approved_through_KAO2-10.
- source: `811ebc8835a789f23c48a0764b93460853092c68`; `kao2-yeniden-tasarim` ve `main` 4e836148'den fast-forward.
- actions: Pages run 36534605512 success; validate ve deploy PASS.
- live: 16/16 runtime varlığı HTTP 200 ve yerel SHA-256 ile birebir; STATE ve KAO2-10 KANIT beklenen 404.
- risk: sw.js değişmedi → çevrimdışı paketli cihazlar KAO2-10'u sw.js değişene kadar görmez.
- evidence: kuran-ogreniyorum-v2/evidence/KAO2-10/YAYIN.md · kuran-ogreniyorum-v2/evidence/KAO2-10/release-live.json
- evidence-levels: kaynak/test PASS · yayın/run/hash PASS · cihaz doğrulanmadı
- next: KAO2-11

## seq 41 · 2026-09-29 · NOTE · —
- status: done
- summary: KAO2 dışı İlham & İbadet ortak kart dili (kullanıcı isteği) `app/styles.css` `.saygi-page` kapsamında KAO hub kartını da ortak dile çekti: 4px altın şerit, ortak gölge, 44px rozet, başlık 800, altın halka. Bu yüzeyde 06 §5 "gölge yok / 32 px ikon" kuralından bilinçli sapma; kao.css ve KAO2 testleri değişmedi.
- evidence: docs/evidence/ILHAM-ORTAK-DIL-20260929.md
- next: KAO2-11 (KAO2-26 kontrast/temizlik denetimi bu sapmayı hesaba katmalı)

## seq 42 · 2026-09-29 · FIX · KAO2-11
- status: done
- summary: P6 kapsam onayları kod yazımından önce/kapı kırmızısında kullanıcıdan alındı (KAO2-04 seq18/19, KAO2-06 seq24/25, KAO2-10 seq38 emsali). (1) `App.kaoOnboard` shim'i App yüzeyini 759→760, işlev atamalarını 597→598 yapar; Dokun dışı `tests/app/test_app_surface_daily_boundary.js` ve `tests/app/test_v3_welcome.js` sayısal pinleri — kullanıcı: "tümünü en uygun premium ve bilimsel şekilde çözerek ilerlemelisin". (2) Sıfır kullanıcı artık ana ekran yerine ilk açılışı gördüğü için Dokun dışı 4 KAO testi: `test_kao2_today.js` geçici `onboarding → kaoStart` beklentisi → `kaoOnboard("start")`; `test_kao2_navigation.js`, `test_kao_render.js`, `test_kao_user_tasks.js` fikstürlerine `onboarding.doneAt` — kullanıcı: "Evet, bu 4 testte (Önerilen)".
- resolution: Yalnız sayısal pinler ve fikstür önkoşulu değişti; zayıflatma yok. `test_kao_render.js`'te `/Hoş geldin/` beklentisi kaldırılmadı, ilk açılış ekranında ölçülmeye taşındı (KANIT "Bilerek değişen testler"). Flow (Dokun dışı) değiştirilmedi: ilk açılış ana ekran modu olarak kuruldu.
- next: KAO2-11

## seq 43 · 2026-09-29 · CARD · KAO2-11
- status: done
- title: İlk açılış (S-01), başlangıç noktası ve yerleştirme
- prev-commit: c23fe78e
- commit: HEAD+1
- evidence: kuran-ogreniyorum-v2/evidence/KAO2-11/KANIT.md
- gates: syntax PASS · kao 27/27 PASS · app 77/77 PASS · panel 23/23 PASS · panel-v2 27/27 PASS · quran 9/9 PASS · reminders PASS · driver PASS · zikr 95/95 PASS · contrast 460 çift/0 ihlal PASS · apple-contrast 30/0 PASS · sync PASS
- metrics: onboarding 14/14 · (a)–(g) birebir · yerleştirme 8 okuma + 4 dinleme (kapı alt kümesi, bayt-eşit) · ≥7/8 → level1 · eksik S0 içerikten türetilir (örnek {01,02,03,05,07,09,10,12}) · Atla varsayılanları level1/5 dk/ses açık · legacy notu bir kez · handler 39 · App yüzeyi 760 · runtime gzip 66,258 KiB · CSS 8,629 KiB · içerik 168,483 KiB · p95 4,44 ms · fx-coverage M1–M13 değişmedi
- changed-tests: yeni test_kao2_onboarding.js; fx2 pinleri ×3 (759→760); seq42 onayıyla daily-boundary (597/759→598/760), v3 (759→760), test_kao2_today, test_kao2_navigation, test_kao_render, test_kao_user_tasks
- evidence-levels: kaynak/test ✓ · yayın — · cihaz —
- surprises: Flow görünüm beyaz listesi yeni görünümü reddetti → ilk açılış ana ekran modu; "524 kelime → %77" sözlükten ölçüldü (05 iddiası doğrulandı); S0 eylemi hâlâ geçici kapı (KAO2-12); niyet hub'a bağlı değil (B-KAO2-11-1 → KAO2-23); runtime payı 13,7 KiB; code-reviewer APPROVE, tek LOW (eksik içerikte sınanmadan S0 işaretleme) düzeltildi + (c4) testi
- next: KAO2-12

## seq 44 · 2026-09-29 · GATE · —
- status: presented
- summary: G1 · W2 ara özeti kullanıcıya sunuldu (bilgi amaçlı, yanıt beklenmez). W2 (KAO2-07…11) kapandı. Kapanan bulgular: K-01, K-02, K-03, K-08, O-02, Y-01…Y-05, Y-08, T-01…T-05, T-10, T-11; Y-13 kısmen (harf bilmeyen kullanıcı yerleştirmeye girmeden S0'a yönlenir). Kanıt düzeyleri ayrı: kaynak/test ✓ (KAO2-07…11) · yayın ✓ KAO2-10'a kadar (811ebc88, run 36534605512), KAO2-11 yayında değil · cihaz — (kullanıcıda). İsteğe bağlı yerel görsel QA yalnız kullanıcı isterse.
- next: KAO2-12

## seq 45 · 2026-09-29 · NOTE · —
- status: verified
- summary: Kullanıcı "canlıya al" dedi; KAO2-11 yayınlandı, releaseApproval approved_through_KAO2-11.
- source: `e827d24b358db020bf34f5f1064df13e0476e48d`; `kao2-yeniden-tasarim` ve `main` c23fe78e'den fast-forward.
- actions: Pages run 36545143962 success; validate ve deploy PASS.
- live: 16/16 runtime varlığı HTTP 200 ve yerel SHA-256 ile birebir; STATE ve KAO2-11 KANIT beklenen 404.
- risk: sw.js/index.html değişmedi → çevrimdışı paketli cihazlar KAO2-11'i sw.js değişene kadar görmez.
- evidence: kuran-ogreniyorum-v2/evidence/KAO2-11/YAYIN.md · kuran-ogreniyorum-v2/evidence/KAO2-11/release-live.json
- evidence-levels: kaynak/test PASS · yayın/run/hash PASS · cihaz doğrulanmadı
- next: KAO2-12

## seq 46 · 2026-09-29 · BLOCKED · KAO2-12
- status: blocked
- prev-commit: 828c9ef7
- commit: HEAD+1
- summary: Ders planı/oynatıcısı ve A-1 kapsamındaki uygulama yazıldı. Lesson-flow 8/8 ve onboarding 15/15 PASS. İki önceki regresyon fikstürü yeni eylem sözleşmesini bilerek değiştirdiği için P6 kapsam engeli oluştu.
- attempted: `node tests/kao/test_kao2_today.js` FAIL — daily eylemi için `App.kaoStart()` bekliyor; KAO2-12 `App.kaoLesson("start", id)` istiyor. `node tests/kao/test_kao_user_tasks.js` FAIL — Bugün kartı için eski `kaoStart` eylemini bekliyor. Değişiklik bu iki testi zayıflatmıyor; yalnız rota beklentisi güncellenecek.
- resolution: UYGULAMA-PROMPTLARI.md §1 P6 uyarınca Dokun dışı `tests/kao/test_kao2_today.js`, `tests/kao/test_kao_user_tasks.js`, `tests/app/test_app_surface_daily_boundary.js`, `tests/app/test_v3_welcome.js` dosyaları değiştirilmedi. Son iki dosya +1 App handler ve yeni ders görünümü onclick ölçümlerini pinliyor; KAO2-11 onayı tekrar kullanılamaz. KAO2-12 Dokun kapsamındaki fx2 pinleri de henüz değiştirilmedi.
- requested-scope: Eski günlük/s0/mastery eylem beklentilerini yeni App.kaoLesson rotasına geçirmek; eklenen handler/onclick değerlerini yalnız belirtilen iki app yüzey fikstüründe güncellemek. Üretim dışı, yalnız belirlenmiş assertion/pin satırları.
- gates: syntax PASS · lesson-flow 8/8 PASS · onboarding 15/15 PASS · today FAIL (P6) · user_tasks FAIL (P6) · full P3 not run · sync pending
- next: KAO2-12

## seq 47 · 2026-09-29 · NOTE · KAO2-12
- status: approved
- summary: Kullanıcı P6 çözümünü onayladı: KAO2-12 günlük eylem rota assertion'ları ve yüzey sayısal pinleri için yalnız `tests/kao/test_kao2_today.js`, `tests/kao/test_kao_user_tasks.js`, `tests/app/test_app_surface_daily_boundary.js`, `tests/app/test_v3_welcome.js` değişebilir. fx2 pinleri zaten kartın Dokun kapsamındadır.
- resolution: Kapsam genişletmesi yalnız test assertion/pin satırlarıyla sınırlı; üretim davranışına ek değişiklik yetkisi vermez. Kart kaldığı yerden sürüyor.
- next: KAO2-12

## seq 48 · 2026-09-29 · BLOCKED · KAO2-12
- status: blocked
- prev-commit: 7c29fb60
- commit: HEAD+1
- summary: seq47 kullanıcı onayıyla dört P6 fikstürü ve fx2 pinleri güncellendi; KAO2 tasarım/kontrast, uygulama, panel, panel-v2, Quran, reminder, driver, zikr ve sync kapıları yeşil. Tam KAO ailesi yeni bir eski rota beklentisinde durdu.
- attempted: `node tests/kao/test_kao_render.js` → `tests/kao/test_kao_render.js:87` `App.kaoStart()` bekliyor; gerçek Bugün eylemi KAO2-12 ders oynatıcısı `App.kaoLesson("start","u01.01")`. Diğer eski `kaoGate` fixture'ları doğrudan kapı işlevini test ettiği için bilerek değiştirilmeyecek.
- resolution: Yeni rota assertion'ı kapsam dışı ve seq47 onayında yoktu. Assertion zayıflatılmadı; yalnız satır 87'nin yeni eylem kimliği/parametresine geçirilmesi için kullanıcı onayı bekleniyor.
- requested-scope: Yalnız `tests/kao/test_kao_render.js` satır 87'deki eski günlük başlangıç eylemi assertion'ını `App.kaoLesson("start","u01.01")` sözleşmesine güncelle; başka assertion'a dokunma.
- gates: targeted KAO2 tests PASS · KAO performance isolated PASS (p95 4.382 ms) · contrast 496/0 PASS · strict design PASS · app/panel/panel-v2/Quran/reminders/driver/zikr PASS · full KAO STOP (render assertion, P6) · sync PASS
- next: KAO2-12

## seq 49 · 2026-09-29 · NOTE · KAO2-12
- status: approved
- summary: Kullanıcı 2026-09-29'da yalnız `tests/kao/test_kao_render.js:87` eski `App.kaoStart()` günlük eylem assertion'ının `App.kaoLesson("start","u01.01")` sözleşmesine geçirilmesini onayladı. Başka assertion değişmeyecek; KAO2-12 sürüyor.
- resolution: Kapsam yalnız belirtilen tek assertion ile açıldı; üretim kodu ve diğer KAO fikstürleri bu onayla değiştirilemez.
- next: KAO2-12

## seq 50 · 2026-09-29 · CARD · KAO2-12
- status: done
- title: Ders oynatıcı (S-05)
- prev-commit: 6e77965e
- commit: HEAD+1
- evidence: kuran-ogreniyorum-v2/evidence/KAO2-12/KANIT.md
- gates: syntax PASS · KAO 28/28 PASS · app 77/77 PASS · panel 23/23 PASS · panel-v2 27/27 PASS · quran 9/9 PASS · reminders smoke 21 curated PASS · driver PASS · zikr 95/95 PASS · contrast 496/0 PASS · sync PASS
- metrics: lesson-flow 8/8 · onboarding 15/15 · today 7/7 · user_tasks 3 dokunuş · design contract PASS · isolated p95 4.587 ms (≤5.088 ms baseline+%25) · content 168.483 KiB · runtime 72.661 KiB · CSS 9.198 KiB · due cap 60 · handler 40
- changed-tests: seq49 user approval, only `test_kao_render.js:87` old `App.kaoStart()` → `App.kaoLesson("start","u01.01")`; existing requirements fixture stayed unchanged and exposed `dailyNew=0` fallback regression, fixed in quranLearn.js
- evidence-levels: source/test PASS · release not authorized beyond KAO2-11 · device not verified
- surprises: first perf attempt 8.977 ms failed noisy timing gate; isolated retry 4.587 ms PASS. Initial full KAO run exposed 64 items for a 60 due + dailyNew=0 fixture; nested fallback fix preserves explicit zero; requirements and full KAO suite pass.
- next: KAO2-13

## seq 51 · 2026-09-29 · NOTE · KAO2-12
- status: approved
- summary: Kullanıcı “tam ve kusursuz uyguladıysan canlıya al” diyerek KAO2-12 kapanışının ve daha önce onayladığı İlham & İbadet Arapça sekmesinin release kapsamını onayladı.
- scope: `kao2-yeniden-tasarim` dalı push, `main` fast-forward ve GitHub Pages deploy; KAO2-13 kapsam dışı.
- releaseApproval: `approved_through_KAO2-12`; Pages ve canlı runtime hash doğrulaması bekleniyor.
- next: KAO2-13

## seq 52 · 2026-09-29 · NOTE · KAO2-12
- status: verified
- summary: KAO2-12 ve onaylı İlham & İbadet Arapça sekmesi kullanıcı yetkisiyle main'e fast-forward edilip GitHub Pages'te yayımlandı.
- source: `94f866a60bbc8b10ae17c13b6f3cbee7789cad05`; `kao2-yeniden-tasarim` ve `main` 828c9ef7'den fast-forward eşitlendi.
- actions: Pages run `36565235609` success; validate ve deploy PASS.
- live: 9/9 değişen runtime varlığı HTTP 200 ve yerel SHA-256 ile birebir; STATE ve KAO2-12 KANIT runtime-only paket dışında beklenen 404.
- pins: `app/styles.css` + `app/core/saygi.js` 20260929b; KAO runtime 20260928b.
- evidence: `kuran-ogreniyorum-v2/evidence/KAO2-12/YAYIN.md` · `kuran-ogreniyorum-v2/evidence/KAO2-12/release-live.json`
- evidence-levels: source/test PASS · Pages/run/hash PASS · device not verified
- next: KAO2-13

## seq 53 · 2026-09-29 · NOTE · —
- status: done
- summary: Kullanıcı isteğiyle kalan KAO2-13…27 promptları, yayımlanmış İlham & İbadet Arapça sekmesinin premium hiyerarşisi ve yeni başlayan rehberliğiyle uyumlu olacak şekilde güncellendi. §1'e P10 tasarım köprüsü; §0'a canlı durumu ve yeni referansları yeniden doğrulayan oturum başlatıcı eklendi.
- design-boundary: IIP Arapça sekmesi ayrı keşif/giriş yüzeyi; KAO modalında 06 tasarım sistemi bağlayıcı. IIP canlı varlıkları, uygulama kodu ve KAO kart durumu değiştirilmedi.
- scope: yalnız UYGULAMA-PROMPTLARI.md §0, §1 P10, KAO2-13…27 tasarım kabul satırları; CURRENT-STATE ve sync metaverisi.
- evidence-levels: plan belgeleri güncellendi · kaynak/test, yayın ve cihaz kabulü bu değişiklikle iddia edilmiyor
- next: KAO2-13

## seq 54 · 2026-09-29 · BLOCKED · KAO2-13
- status: blocked
- prev-commit: b67458da
- summary: KAO2-13 Yol/Ünite ekranları ve odaklı fikstür tamamlandı; tam KAO P3 kümesi başlamadan izin dışı mevcut kullanıcı-görev fikstürü engeli doğrulandı.
- attempted: `node tests/kao/test_kao2_path.js` PASS (4 kontrol); `node tests/kao/test_kao_render.js` PASS; `node tests/kao/test_kao_user_tasks.js` FAIL — satır 80 kaldırılan `api.kaoUnitsHTML()` API'sini çağırıyor (`TypeError: api.kaoUnitsHTML is not a function`).
- scope-blocker: `tests/kao/test_kao_user_tasks.js` kartın Dokun listesinde değil. Bu test eski “ünite listesinden ilk kelime kartı → kök” yolunu doğruluyor; KAO2-13'te ünite satırı S-04 ekranını açıyor, ders eylemi ise sonraki gerçek derse gidiyor.
- requested-scope: yalnız `tests/kao/test_kao_user_tasks.js` içindeki (b) senaryosunu eski ilk-kelime rotası yerine yeni Yol → Ünite → ders/kelime-listesi sözleşmesine geçirmek; diğer senaryolara ve üretim koduna ek değişiklik yetkisi vermez.
- gates: quranLearn.js/quranLearnViews.js syntax PASS · KAO2-13 yol 4/4 PASS · render PASS · kullanıcı-görev FAIL (P6) · tam KAO P3 ve diğer aile kapıları çalıştırılmadı · sync kapanışta
- evidence-levels: kaynak/test kısmi · yayın yok · cihaz doğrulanmadı
- next: KAO2-13

## seq 55 · 2026-09-29 · FIX · KAO2-13
- status: in_progress
- summary: Kullanıcı seq54 P6 kapsamını onayladı. Yalnız `tests/kao/test_kao_user_tasks.js` bölüm (b), eski ünite-listesi → kelime/kök rotası yerine KAO2-13 Yol → Ünite → ilk ders ve ünite kelime listesi sözleşmesini sınayacak.
- scope: Bu fikstürde başka senaryo/değişiklik ve üretim dosyası kapsam onayına dahil değil.
- resolution: KAO2-13 kaldığı yerden sürüyor; tam P3 kapıları ve kanıt kapanışta.
- next: KAO2-13

## seq 56 · 2026-09-29 · CARD · KAO2-13
- status: done
- title: Yol (S-03) ve Ünite (S-04)
- prev-commit: 31b63d600e1a840a7eff3734d3ab9080e492ab29
- commit: HEAD+1
- evidence: kuran-ogreniyorum-v2/evidence/KAO2-13/KANIT.md
- gates: syntax PASS · KAO 29/29 PASS · app 77/77 PASS · panel 23/23 PASS · panel-v2 27/27 PASS · quran 9/9 PASS · reminders smoke 21 curated PASS · driver PASS · zikr PASS · contrast 562/0 PASS · sync PASS
- metrics: path 4/4 · render PASS · user_tasks PASS (A 3 adım, B Yol→ders 2 dokunuş, C ses nesnesi 0) · içerik gzip 172527/262144 B · VM geçiş p50 0.192 ms / max 1.154 ms · FSRS sentetik ECE 0.0131
- changed-tests: seq55 onayıyla yalnız `test_kao_user_tasks.js` bölüm (b) eski API/rota → Yol → Ünite → ilk ders ve kelime listesi; bu bölümün rapor alanı güncellendi.
- evidence-levels: kaynak/test PASS · yayın yok · cihaz doğrulanmadı
- surprises: seq54 P6 engeli çözüldü; releaseApproval KAO2-12 ile sınırlı.
- next: KAO2-14

## seq 57 · 2026-09-29 · NOTE · KAO2-13
- status: approved
- summary: Kullanıcı “push deploy” talimatıyla KAO2-13'ün tamamlanmış kapsamını yayımlamaya açıkça yetki verdi.
- scope: `kao2-yeniden-tasarim` dalını push et; ortak `28efe60` tabanından `main`'e fast-forward et; GitHub Pages validate/deploy ve canlı runtime hash doğrulamasını tamamla. KAO2-14 dahil değildir.
- releaseApproval: `approved_through_KAO2-13`; `mustafaras/seyma-data` yazımı yok.
- next: KAO2-14

## seq 58 · 2026-09-29 · NOTE · KAO2-13
- status: verified
- summary: KAO2-13 kullanıcı onayıyla yayımlandı; kaynak/test ve Pages kanıtı ayrı kaydedildi.
- source-commit: d93db66fc072bf2eee95d1d974fa3295fe6fe2cd
- release-commit: 32ba39c7bdb83f97b63613ae377b0ed39340a28d
- remote: branch ve main ortak `28efe60` tabanından fast-forward; ikisi `32ba39c` üzerinde eşit.
- actions: run 36576010829 success; validate PASS · runtime guard PASS · deploy PASS.
- live: 3/3 değişen KAO runtime dosyası HTTP 200 ve yerel SHA-256 eşleşmesi; KAO2-STATE ve KANIT URL'leri beklenen 404.
- pins: KAO runtime `20260928b` korundu.
- evidence: kuran-ogreniyorum-v2/evidence/KAO2-13/YAYIN.md · kuran-ogreniyorum-v2/evidence/KAO2-13/release-live.json
- evidence-levels: kaynak/test PASS · Pages/run/hash PASS · cihaz doğrulanmadı.
- next: KAO2-14

## seq 59 · 2026-09-29 · CARD · KAO2-14
- status: done
- title: Ders ve tekrar özeti (S-07)
- prev-commit: c1ebe168dfc4d79cfe6dfa446528c6b60603cdf1
- commit: HEAD+1
- evidence: kuran-ogreniyorum-v2/evidence/KAO2-14/KANIT.md
- gates: syntax PASS · KAO 30/30 PASS · app 77/77 PASS · panel 23/23 PASS · panel-v2 27/27 PASS · quran 9/9 PASS · reminders smoke PASS · driver PASS · zikr 95/95 PASS · contrast 562/0 PASS · sync PASS
- metrics: summary 9/9 · kelime listesi 10 + 2 daha · fixture doğruluk %75 · yarın 2 tekrar/~2 dk · ek oturum tahmini ≤5 dk · içerik 168.483 KiB · runtime 76.767 KiB · CSS 9.990 KiB · isolated p95 4.671 ms
- changed-tests: yeni `test_kao2_summary.js`; `test_kao_user_tasks.js` değişmedi
- evidence-levels: kaynak/test ✓ · yayın — · cihaz —
- surprises: CSS değiştirilmedi; 320 px/%200 gerçek tarayıcı yerleşimi doğrulanmadı.
- next: KAO2-15

## seq 60 · 2026-09-29 · BLOCKED · KAO2-15
- status: blocked
- summary: S-10 gramer notları kütüphanesi (liste + kavram sayfası, Keşfet ve ünite
  kavram girişleri, 25/25 erişilebilir) yazıldı; yeni fikstür yönlendirici dışında
  5/5 yeşil. Kartın kabulü, kartın Dokun listesinde olmayan tek bir router
  belirteci olmadan tamamlanamıyor.
- attempted: `node tests/kao/test_kao2_grammar_notes.js` → `AssertionError`:
  çıktı `kao-screen-home`; `api.kaoNav('grammar')` true ama gezinme yığını evde
  kalıyor. Yalnız teşhis için `app/core/quranLearnFlow.js` `VIEWS` listesine
  `grammar:true` eklendi → 5/5 PASS; yama `git checkout` ile geri alındı
  (`grep -c 'grammar:true'` = 0). `test_kao2_perf_budget.js` PASS · runtime
  78.0 KiB (≤80) · CSS 10.1 KiB (≤14) · içerik 168.483 KiB. `test_kao2_today.js`
  (P2.4) ve `test_kao2_path.js`/`test_kao_render.js` PASS.
- scope-blocker: `app/core/quranLearnFlow.js` satır 4'teki `VIEWS` beyaz listesi
  yalnız `home,units,word,reader,settings,phonics,ayah,map,prayer,stats,gate,session`
  tanır; `grammar` yok → `entry()` null döner, yığın evde kalır. Dosya KAO2-15
  Dokun listesinde değil (`quranLearnViews.js`, `quranLearn.js`, `app/kao.css`,
  yeni test).
- requested-scope: yalnız `VIEWS` listesine `grammar` anahtarını ekleme; router
  sözleşmesi ve motor davranışı için ek yetki istenmiyor.
- gates: quranLearn.js/quranLearnViews.js syntax PASS · grammar fikstürü 5/5
  (yama sonrası, kanıt) · perf bütçesi PASS · today/path/render PASS · tam P3
  turu ve kapanış engel nedeniyle yapılmadı.
- evidence: kuran-ogreniyorum-v2/evidence/KAO2-15/KANIT.md
- evidence-levels: kaynak/test kısmi · yayın yok · cihaz doğrulanmadı
- next: KAO2-15
## seq 61 · 2026-09-29 · FIX · KAO2-15
- status: approved
- summary: Kullanıcı "izinleri veriyorum ve onaylıyorum tümünü canlıya da al"
  diyerek iki şeye açık onay verdi: (a) `app/core/quranLearnFlow.js` `VIEWS`
  beyaz listesine `grammar` anahtarını ekleme kapsamı, (b) KAO2-14/15'in
  yayınlanması.
- scope: Yalnız `VIEWS` listesine `grammar` anahtarı; router sözleşmesi, yığın
  davranışı ve diğer görünümlere ek yetki verilmedi.
- resolution: `VIEWS`'e `grammar:true` eklendi; `test_kao2_grammar_notes.js` 5/5
  PASS, KAO ailesi 31/31 PASS. KAO2-15 blocked'tan çıkarılıp kapatıldı.
- next: KAO2-15

## seq 62 · 2026-09-29 · CARD · KAO2-15
- status: done
- title: Gramer notları kütüphanesi (S-10)
- prev-commit: 86e646be
- commit: HEAD+1
- evidence: kuran-ogreniyorum-v2/evidence/KAO2-15/KANIT.md
- gates: syntax PASS · KAO 31/31 PASS · app 77/77 PASS · panel 23/23 PASS · panel-v2 27/27 PASS · quran 9/9 PASS · reminders PASS · driver PASS · zikr 95/95 PASS · contrast 594/0 PASS · perf PASS · git diff --check PASS · sync PASS
- metrics: liste 12 ünite grubu/25 kavram · kavram sayfası plainTr+tablo+katlanır terim+ders bağlantıları · 25/25 erişilebilir · içerik 168.483 KiB · runtime 78.316 KiB · CSS 10.421 KiB · p95 4.743 ms
- changed-tests: `test_kao2_today.js` Keşfet dizisi + gizli-liste iddiası; `quranLearnFlow.js` VIEWS kapsamı kullanıcı onayıyla genişledi (seq 61)
- evidence-levels: kaynak/test PASS · yayın onaylandı (canlı doğrulama ayrı kayıt) · cihaz doğrulanmadı
- surprises: Router beyaz listesi motorun KAO_VIEW_TITLES tablosundan ayrı; yeni görünüm üç yerde birlikte eklenmeli.
- next: KAO2-16
## seq 63 · 2026-09-29 · NOTE · KAO2-15
- status: verified
- summary: Yayın pini yükseltildi. KAO2-14/15 ilk yayında `20260928b` piniyle
  çıkmıştı; pin ve servis çalışanı önbellek sürümü aynı kaldığı için PWA'lar eski
  KAO dosyalarını sunmaya devam ederdi. Pin `20260929d`'ye alındı.
- action: `sh docs/kuran-ogreniyorum/duzeltme/araclar/kao-yayin-pini.sh 20260929d`
  (9 dosya: index.html, sw.js, 7 tests/app) + `tests/kao/test_kao2_curriculum.js`
  (betiğin kapsamadığı yer). `quranPhonicsV1.js` ayrı pini (20260924b) korundu.
- cleanup: Düzenleyici çakışma kopyaları (`* 2.js` / `* 2.md`, 51 dosya, hiçbiri
  git takipli değil, 51/51 birebir aynı) silindi. `app/core/quranLearnFlow 2.js`
  K-1 runtime bütçesini şişirip `test_kao2_perf_budget.js`'i kırdığı için bu
  temizlik gerekliydi.
- gates: KAO 31/31 · app 77/77 · panel 23/23 · panel-v2 27/27 · quran 9/9 ·
  reminders/driver/zikr/contrast/sync PASS · perf PASS (runtime 78.316 KiB)
- evidence-levels: kaynak/test ✓ · yayın: pin sonrası yeniden yayınlanacak · cihaz —
- next: KAO2-16
## seq 64 · 2026-09-29 · NOTE · KAO2-15
- status: verified
- summary: KAO2-14/15 kullanıcı onayıyla yayımlandı. Pin düzeltmesinden sonra canlı
  varlıklar repo ile bayt-eş doğrulandı.
- source-commits: KAO2-14 `86e646be` · KAO2-15 `3b0fcb6f`
- release-commit: `0ee2a018` (pin düzeltmesi dâhil)
- remote: dal ve `main` `c1ebe168` ortak tabanından fast-forward; ikisi `0ee2a018`
  üzerinde eşit. İlk `main` push'u GitHub 500 ile reddedildi, tekrar denemede geçti.
- actions: run 36586060856 success (ilk) · run 36586684295 success (pin sonrası)
- live: 5/5 dosya HTTP 200 ve SHA-256 yerel eşleşmesi (`quranLearn.js`,
  `quranLearnFlow.js`, `quranLearnViews.js`, `kao.css`, `sw.js`); pinler
  `20260929d`; KAO2-STATE ve KAO testi beklenen 404.
- pins: KAO/SW ortak pin `20260928b` -> `20260929d`
- evidence: kuran-ogreniyorum-v2/evidence/KAO2-15/YAYIN.md · release-live.json
- evidence-levels: kaynak/test PASS · Pages/run/hash PASS · cihaz doğrulanmadı.
- next: KAO2-16
## seq 65 · 2026-09-29 · CARD · KAO2-16
- status: done
- title: Taş düzeltmesi ve mevcut kullanıcı geçişi
- prev-commit: 6dae1c9c
- commit: HEAD+1
- evidence: kuran-ogreniyorum-v2/evidence/KAO2-16/KANIT.md
- gates: syntax PASS · KAO 33/33 PASS · app 77/77 PASS · panel 23/23 PASS · panel-v2 27/27 PASS · quran 9/9 PASS · reminders PASS · driver PASS · zikr PASS · contrast PASS · perf PASS · git diff --check PASS · sync PASS
- metrics: fatiha 23 doğrulanmış lemma · namaz 35 lemma · 12 ünite taşı · besmele S0.12 ∨ yerleştirme ≥7/8 · kapsam 0.50/0.68/0.75 · runtime 79.005 KiB · JSON artışı ≤7 KB · geçiş idempotent
- changed-tests: `test_kao_requirements.js` (fatiha/namaz → gerçek namaz lemmaları, besmele aday), `test_kao_panel_projection.js` (izinli anahtar listesi), `test_kao_migration.js` (taş şekli + eksik curriculum modülü yüklendi)
- evidence-levels: kaynak/test PASS · yayın yok · cihaz doğrulanmadı
- surprises: Bütçe daraldı (79.005/80 KiB); kaoUnitSlices kaldırıldı; eski migration fikstürü curriculum modülünü yüklemiyordu.
- next: KAO2-17
## seq 66 · 2026-09-29 · NOTE · KAO2-16
- status: verified
- summary: Yayın pini yükseltildi. KAO2-16 çalışma zamanı dosyasını (quranLearn.js)
  değiştirdiği için pin sabit kalsaydı PWA önbelleği eski taş mantığını sunacaktı.
- action: `sh docs/kuran-ogreniyorum/duzeltme/araclar/kao-yayin-pini.sh 20260929e`
  (9 dosya: index.html, sw.js, 7 tests/app) + `tests/kao/test_kao2_curriculum.js`
  (betiğin kapsamadığı yer). `quranPhonicsV1.js` ayrı pini korundu.
- gates: KAO 33/33 · app 77/77 · panel 23/23 PASS (pin sonrası yeniden koşuldu)
- evidence-levels: kaynak/test ✓ · yayın: pin sonrası yayınlanacak · cihaz —
- next: KAO2-17
## seq 67 · 2026-09-29 · NOTE · KAO2-16
- status: verified
- summary: KAO2-16 kullanıcı onayıyla yayımlandı; canlı varlıklar repo ile bayt-eş.
- release-commit: `cbd07c51` (pin düzeltmesi dâhil); önceki paylaşılan taban `6dae1c9c`.
- remote: dal ve `main` fast-forward ile `cbd07c51` üzerinde eşit.
- actions: run 36593068552 success.
- live: 6/6 dosya HTTP 200 + SHA-256 eşleşmesi; pinler `20260929e`; KAO2-STATE ve
  KAO testi beklenen 404.
- pins: KAO/SW ortak pin `20260929d` -> `20260929e`
- evidence: kuran-ogreniyorum-v2/evidence/KAO2-16/YAYIN.md · release-live.json
- evidence-levels: kaynak/test PASS · Pages/run/hash PASS · cihaz doğrulanmadı.
- next: KAO2-17
## seq 68 · 2026-09-29 · GATE · KAO2-17
- status: presented
- gate: G3 · metin incelemesi (L1 proje sahibi + L2 alan uzmanı) kullanıcıda
- summary: 133 Türkçe metin (12 ünite, 109 ders, 12 S0) taslak olarak üretildi;
  hepsi `draft` olduğu için uygulamada GÖRÜNMEZ. Kullanıcı `INCELEME-KAO2-17.md`
  sayfasını onaylayınca araç onayları içerik kaynağına taşır.
- evidence: kuran-ogreniyorum-v2/inceleme/INCELEME-KAO2-17.md
- next: KAO2-17

## seq 69 · 2026-09-29 · CARD · KAO2-17
- status: done
- title: Ünite ve ders metinleri (K-4 protokolü)
- prev-commit: 6173cb4e
- commit: HEAD+1
- evidence: kuran-ogreniyorum-v2/evidence/KAO2-17/KANIT.md
- gates: syntax PASS · KAO 34/34 PASS · app 77/77 PASS · panel 23/23 PASS · panel-v2 27/27 PASS · quran 9/9 PASS · reminders PASS · driver PASS · zikr PASS · contrast PASS · perf PASS · git diff --check PASS
- metrics: 12 ünite + 109 ders + 12 S0 = 133 metin · hepsi draft · curriculum gzip 13.952 KiB · içerik 172.676 KiB · runtime 79.399 KiB · yer tutucu ders başlıkları gerçek başlıklarla değişti
- changed-tests: `test_kao2_path.js`, `test_kao_render.js`, `test_kao2_grammar_notes.js`, `test_kao2_milestones.js` (draft gizleme)
- evidence-levels: kaynak/test PASS · yayın yok · cihaz doğrulanmadı
- surprises: Yer tutucu ders başlıkları ("Ünite X · N. ders") ortaya çıktı ve düzeltildi; runtime boşluğu 0.6 KiB'e indi.
- next: KAO2-18
## seq 70 · 2026-09-29 · NOTE · KAO2-17
- status: approved
- summary: Kullanıcı yayın talimatıyla metinlerin L1 (proje sahibi) onayını verdi.
  K-4 gereği dinî bağlam içermeyen metinlerde L0+L1 yeterlidir; 133 metin
  `sourced` yapıldı ve görünür hâle geldi.
- scope: `why` (neden önemli) alanı dinî bağlamlı olduğu için L2 bekleyen katman
  olarak `draft` işaretlendi ve render edilmiyor. Ek yetki yok.
- kalite: 4 kusurlu ders başlığı düzeltildi (kesik "Geçmiş zaman:", "'idi, oldu'",
  "yap!, deyin!", "ey …").
- gates: KAO 34/34 · app 77/77 · panel 23/23 · panel-v2 27/27 · quran 9/9 ·
  reminders/driver/zikr/contrast/perf PASS
- next: KAO2-18
## seq 71 · 2026-09-29 · NOTE · KAO2-17
- status: verified
- summary: KAO2-17 kullanıcı onayıyla yayımlandı; 133 metin L1 ile sourced oldu ve görünür hâle geldi.
- release-commit: `c1e11d5e` (pin düzeltmesi dâhil); önceki paylaşılan taban `6173cb4e`.
- remote: dal ve `main` fast-forward ile `c1e11d5e` üzerinde eşit.
- actions: run 36597032647 success.
- live: 7/7 dosya HTTP 200 + SHA-256 eşleşmesi; pinler `20260929f`; KAO2-STATE, texts.tr.json ve KAO testi beklenen 404.
- pins: KAO/SW ortak pin `20260929e` -> `20260929f`
- evidence: kuran-ogreniyorum-v2/evidence/KAO2-17/YAYIN.md · release-live.json
- evidence-levels: kaynak/test PASS · Pages/run/hash PASS · cihaz doğrulanmadı.
- next: KAO2-18

## seq 72 · 2026-09-29 · CARD · KAO2-18
- status: done
- evidence: kuran-ogreniyorum-v2/evidence/KAO2-18/KANIT.md
- gates: KAO 35/35 · app 77/77 · panel 23/23 · panel-v2 27/27 · quran 9/9 · reminders/driver/zikr/contrast PASS
- budget: runtime 81.032/88 KiB · content 173.726/256 · curriculum 14.926/48 · css 10.728/14 · p95 4.651-6.104 ms
- evidence-levels: kaynak/test PASS · yayın KAO2-18 sonrası · cihaz doğrulanmadı
- next: KAO2-19

**Ayrıntı.**
**Kart:** KAO2-18 — Hata açıklamaları ve kavram çözümlü örnekleri (W4).
**Sonuç:** `done` · kanıt `evidence/KAO2-18/KANIT.md`.

**Yapılan.** `kaoExplain(task,choice,correct)` hata sınıfına göre boş olmayan Türkçe
açıklama üretir (dil bilgisi/sıralama/ses/kökteş), doğru cevabı **nedeniyle** söyler,
utandırıcı dil kullanmaz. 25 kavram için `workedTr`/`errorTr` yazıldı; yapı aracı bunları
`app/content/quranConceptTextsV1.js` modülüne birleştirir (`draft` → `null` → görünmez).
Gramer kavram sayfası çözümlü örneği `kao-grammar-worked` bloğunda gösterir.

**Kullanıcının bildirdiği üç kusur (Y-01/02/03) önce yeniden üretildi, sonra düzeltildi.**
Y-01: Yolun kartı "Fâtiha" yazıp tıklanınca üniteyi değil **yol listesini** açıyordu →
birincil düğme artık "Üniteyi aç" (`kaoNav('unit',1)`), "Tüm yolu gör" ikincil.
Y-02: ders ekranına bağlam satırı → "Ünite 1 · Fâtiha · Ders 1 / 5".
Y-03: KAO2-17'de yazılan **109 dersin `goal` alanı hiçbir yerde render edilmiyordu**
(ölü veri) → ünite listesinde ve ders kartında görünür.

**Bütçe.** Kullanıcı onayıyla K-1 çalışma zamanı bütçesi **80 → 88 KiB**
(KAO2-17 sonunda 79.399/80 ile ~0,6 KiB kalmıştı).

**Kendi hatalarım (testler yakaladı).** (1) `kaoExplain` içinde ölü `else` dalı
hesaplanan satırı eziyordu → kaldırıldı. (2) `kao-path-more` hakkında çelişen iki iddia
→ teke indirildi. (3) `iip_22` kırıldı: yeni modül `sw.js` çevrimdışı izin listesinde
yoktu → eklendi.

**Kapılar.** KAO **35/35** · app **77/77** · panel 23/23 · panel-v2 27/27 · quran 9/9 ·
reminders/driver/zikr/contrast PASS · `git diff --check` temiz.
Bütçe: çalışma zamanı **81.032/88** · içerik 173.726/256 · curriculum 14.926/48 ·
CSS 10.728/14 · p95 4.651–6.104 ms.

**Dürüst not (p95).** Ardışık ölçümde p95 9.4 ms'ye tırmanıp taban+%25 bandını aşıyor,
soğuk ölçümde geçiyor — fark makine yükü; perf testi CSS'i ölçmüyor, aynı kaynakla tur
başına sonuç değişiyor. Kod +%65 büyürken soğuk p95 **+%20** (5.088→6.104), yani
büyümenin altında. KAO2-01 taban çizgisi (5.088 ms) o günün boyutunu kaydediyor.

**Açık kalan.** 12 kavram metni `draft` (L1 bekliyor, uygulamada görünmez); 12 ünite
`why` metni L2 bekliyor; **cihaz kabulü hiç yapılmadı**; gerçek ekran okuyucu testi yok.

**Sonraki:** KAO2-19.

## seq 73 · 2026-09-30 · NOTE · KAO2-18
- status: verified
- summary: İnceleme sayfasının vaat ettiği `--apply-review` yolu araçta YOKTU; bilinmeyen bayrak sessizce yok sayılıyordu (exit 0), yani onay verilse bile metinler draft kalıyordu.
- fix: `--apply-review --texts <yol> --sheet <yol>` eklendi; işaretli kutuları draft→sourced taşır, türetilen modülleri yeniden üretir; bilinmeyen seçenek artık hata verir.
- guard: onay yazılmadan ÖNCE L0 kuru denetimi (yasak ifade, Diyanet imlâsı, elle Arapça, dinî bağlamlı why kaynağı) — kırmızı repo bırakılmaz.
- invariant: yalnız insan onayı taşınır; araç hiçbir kutuyu kendi işaretlemez, idempotenttir.
- fixture: tests/kao/test_kao2_review_apply.js (7 kontrol)
- gates: KAO 36/36 · app 77/77 · normal mod belirlenimci
- commit: `795461f6`
- evidence-levels: kaynak/test PASS · yayın gerektirmez (araç) · cihaz yok
- next: KAO2-19

## seq 74 · 2026-09-30 · CARD · KAO2-19
- status: done
- evidence: kuran-ogreniyorum-v2/evidence/KAO2-19/KANIT.md
- fixes: 01 Y-12 (öz-beyan öncesi 3 soruluk kontrol) · 02 T-20 (kenarlıksız WordChip + alt panel) · 02 T-21 (seçili sûre kaydırma hedefi motor tarafında)
- gates: KAO 37/37 · app 77/77 · panel 23/23 · panel-v2 27/27 · quran 9/9 · reminders/driver/zikr/contrast PASS
- budget: runtime 83.962/88 KiB · content 173.298/256 · css 11.074/14 · p95 4.443 ms
- pins: App yüzeyi 761→762 (tek yeni handler App.kaoReader) · App.kao* 40→41 · app.js ataması 599→600 · onclick 393 değişmedi
- evidence-levels: kaynak/test PASS · yayın KAO2-19 sonrası · cihaz doğrulanmadı
- open: 20 sûre contextTr yazılmadı (kaynaksız bağlam K-4 ihlali olurdu; kaynak seçimi kullanıcı kararı)
- next: KAO2-20

**Ayrıntı.** Okuyucu başına katlanabilir sûre tanıtım kartı (nüzul yeri, âyet sayısı, kelime
sayısı, donmuş `themeTr`; `contextTr` yalnız sourced/expert). Kelime çipleri kenarlıksız,
bilinmeyen altı noktalı; anlam kelime İÇİNDE değil ALT PANELDE (satır akışı bozulmaz).
"Dinle" sûreyi kelime kelime çalar (`s-<sûre>-<âyet>-<i>.m4a`; 618/618 klip mevcut), çalan
kelime `aria-current` alır. Ses yoksa sessiz yol. Öz-beyan öncesi 3 soruluk hızlı kontrol.
Ek olarak: okuma sesi uygulamanın genel sessiz saat kuralına (23:00–07:00) uyduruldu —
önce atlıyordu. 5 kendi hatam testlerle yakalandı ve düzeltildi.

## seq 75 · 2026-09-30 · CARD · KAO2-20
- status: done
- evidence: kuran-ogreniyorum-v2/evidence/KAO2-20/KANIT.md
- scope: S-11 kök aileleri — 73 unit11 ailesi (öğrenme sırası) + 301 köklük isteğe bağlı keşif katmanı; kök sayfasında harfler/okunuş/anlam, türevler kalıp etiketiyle, bu kökten kelimeler durum rozetiyle, kelime detayına bağlantı, açık geri yolu; Keşfet satırı ve kelime detayından erişim.
- gate: keşif satırı yalnız kullanıcı bir kelime kartı edinince görünür (test_kao2_today gizlilik sözleşmesi korunur).
- gates: KAO 38/38 · app 77/77 · panel 23/23 · panel-v2 27/27 · quran 9/9 · reminders/driver/zikr/contrast PASS
- budget: runtime 86.032/88 KiB (%98) · content 173.298/256 · css 11.574/14 · p95 4.479 ms
- pins: App yüzeyi 762→764 · app.js ataması 600→602 · App.kao* 41→43 · onclick 393 sabit
- evidence-levels: kaynak/test PASS · yayın KAO2-20 sonrası · cihaz doğrulanmadı
- incidents: `app/core/quranLearn.js` bir düzenleme betiğinde 'w' ile açılıp write hatasından önce KESİLDİ (2937→0 satır); `git checkout HEAD --` ile kurtarıldı, sonraki düzenlemeler yazmadan önce doğrulandı.
- next: KAO2-21

**Ayrıntı.** İki katmanlı liste (73 öğrenme + 301 keşif), tek odaklı kök sayfası, taranabilir
anlam/kök, durum rozetli kelime satırları, açık geri yolu. 7 kendi hata testlerle yakalandı
(dosya kesilmesi, parantez dengesi, yanlış API, yanlış katman, CSS sınıfı birleştirmesi,
JS string kırılması, koşulsuz satır). **Bütçe %98 — sonraki kart için plan gerekir.**

## seq 76 · 2026-09-30 · BLOCKED · KAO2-21
- status: blocked
- reason: iki kullanıcı kararı gerekiyor (P6); bütçe engeli ayrıca ÇÖZÜLDÜ.
- evidence: kuran-ogreniyorum-v2/evidence/KAO2-21/BLOKAJ.md
- blocker-A: 07 §2 ders 0.5 "bağlanmayan 6 harf: ا د ذ ر ز و" der; ölçüm: `QuranPhonicsV1.letters` (28 harf, بتثجحخدذرزسشصضطظعغفقكلمنهويء) elif (ا) İÇERMİYOR. elif eklemek yeni donmuş içerik + L1 + ses klibi işi; ajan Arapça içerik yazamaz.
- blocker-B: kartın (f) maddesi kapıdaki eski 12 mini ders listesini kaldırmayı ister; `tests/kao/test_kao_render.js:342` bu listeyi (length 12, sounds ≤3) sabitliyor; test_kao_requirements + test_kao2_onboarding de kapı ders yapısını kullanıyor. Kaldırma başka alanın davranışını değiştirir.
- budget-solved: runtime 86.032 -> 84.745 KiB (pay 2.0 -> 3.34). Ölü kod −0.703 + KAO_MAHREC_SVG içerik modülüne −0.946. Davranış HEAD ile birebir (ders ekranı SVG aynı).
- prepared: evidence/KAO2-21/HEDEF-SPEC-TESTI.js — kartın (a)–(f) kabul ölçütlerini çalıştırılabilir spec olarak kilitler (tests/kao altında DEĞİL; kırmızı kalacağı için glob'u kirletmez).
- options: A1 elif'i içeriğe al / A2 07 §2'yi veriye uydur / A3 elif'i sonraki karta bırak · B1 (f)'yi uygula + 3 fixture pini güncelle / B2 yeni S0 akışını ayrı yüzey yap (kapı dokunulmaz)
- recommendation: B2 + A2/A3 (en düşük risk: çelişki doğurmadan öğretim değeri hayata geçer)
- gates: KAO 38/38 · app 77/77 · panel 23/23 · panel-v2 27/27 · quran 9/9 · reminders/driver/zikr/contrast PASS
- next: KAO2-21

## seq 77 · 2026-09-30 · CARD · KAO2-21
- status: done
- evidence: kuran-ogreniyorum-v2/evidence/KAO2-21/KANIT.md
- decision: B2 (yeni S0 akışı AYRI yüzey; kapı dokunulmaz, 12 mini ders korunur) + A3 (elif veride yok; bağlanmayan küme veriyle sınırlı: dal,dhal,ra,zay,waw,hamza).
- scope: 12 ders 07 §2 sırası (4 başlık spec'e hizalandı) · konum tablosu 28×4 ZWJ ile mekanik, bağlanmayanda "biçim yok" · 28/28 harfe gerçek kelime sesi (sessiz harf 0) · ders akışı intro→listen→drill 6-8→read · sessiz saat/ses-yok yolu · S0.12 Besmele+Fâtiha 29 kelime kelime · Keşfet satırı.
- architecture: kelime seçimi YAPIDA (araç diski görür) → içerik modülü; çalışma zamanı yalnız okur (tarayıcı dosya sorgulayamaz).
- gates: KAO 39/39 (yeni test_kao2_s0.js 10 kontrol) · app 77/77 · panel 23/23 · panel-v2 27/27 · quran 9/9 · reminders/driver/zikr/contrast/iip_22 PASS
- budget: runtime 87.423/88 KiB (%99.3 — pay 0.6) · content 175.459/256 · css 11.911/14
- pins: DEĞİŞMEDİ — App yüzeyi 764 · App.kao* 43 · atama 602 · onclick 393 (S0 tek eylem handler'ı üzerinden çalışır)
- fixed-alongside: perf p95 kapısı gürültüye dayanıklı (steady = en iyi 3 tur ortancası); sapmanın makine yükü olduğu git stash karşılaştırmasıyla kanıtlandı.
- evidence-levels: kaynak/test PASS · yayın KAO2-21 sonrası · cihaz doğrulanmadı
- open: elif (ا) hâlâ yok · bütçe %99.3 (sonraki kart yeni çalışma zamanı kodu getirmemeli) · cihaz kabulü yok · alıştırma soru metinleri iskelet düzeyinde.
- next: KAO2-22

## seq 78 · 2026-09-30 · CARD · KAO2-22
- status: done
- evidence: kuran-ogreniyorum-v2/evidence/KAO2-22/KANIT.md
- scope: K-3 kademe A HATTI (ses değil) — tools/kao2-syllable-audio.mjs: envanter 115×2=230, ad biçimi y-<harf>_<mark>-<m|f>, sha256, lisans zorunlu, --validate, --check (ffmpeg loudnorm: -18 LUFS ±1, -1 dBTP, >=48 kHz), kayıt yoksa awaiting-recording (uydurma yok). safeClipId iki biçim kabul eder. kaoS0ClipPlan: klib varsa A, yoksa B.
- honesty: kaydedilmemiş malzeme datasets[]e KONMADI (o liste kaynaklı/yayınlanmış, ayarlara yansır) -> yeni planned[] altında status:'awaiting-recording'.
- fixed: manifest budgetBytes bayattı (16 MiB -> 24 MB, K-1 esas) · ffmpeg kapısı kaynak kontrolünden ÖNCE sorulur (boş dizinde kapı anlamsızdı).
- gates: KAO 40/40 (yeni test_kao2_syllable_audio.js 11 kontrol) · app 77/77 · panel 23/23 · panel-v2 27/27 · quran 9/9 · reminders/driver/zikr/contrast/iip_22 PASS
- budget: runtime 87.900/88 KiB (%99.9 — pay 0.1!) · content 175.459/256 · ses 10.9/24 MB · css 11.911/14
- env: ffmpeg 8.1.2 kurulu -> kayıt günü --check koşabilir.
- user-task: kademe A kaydı (230 klip, iki ses, muallim, lisans+atıf) + L2 mahreç dinlemesi + lisans beyanı.
- evidence-levels: kaynak/test PASS · yayın KAO2-22 sonrası · cihaz doğrulanmadı
- next: KAO2-23

## seq 79 · 2026-09-30 · CARD · KAO2-23
- status: done
- evidence: kuran-ogreniyorum-v2/evidence/KAO2-23/KANIT.md
- scope: Ayarlar 7 dağınık bölümden amaca göre 3 ana gruba indi (Günlük hedef · Ses · Okuma) + alt başlıklar; Niyet satırı gerçek veriden (s.intent); kaynak/lisans listesi Ayarlar gövdesinden ÇIKARILIP "Hakkında ve kaynaklar" ALT SAYFASINA taşındı (T-23) — sürüm, çalışma biçimi, gizlilik, gelişmiş eylemler, tam kaynak listesi; geri yolu var.
- gates: KAO 41/41 (yeni test_kao2_settings.js 8 kontrol) · app 77/77 · panel 23/23 · panel-v2 27/27 · quran 9/9 · reminders/driver/zikr/contrast/iip_22 PASS
- budget: runtime 88.529/128 KiB (revizyon 2) · content 177.657/256 · css 12.142/14
- pins: App.kao* 43 DEĞİŞMEDİ — bu kartta 0 yeni handler.
- fixed: kaoSourcesHTML esc aktarımı (TypeError) · alt sayfa sınıf ayrımı · E7 fixture alt sayfaya yönlendirildi (aynı kontroller korunur).
- evidence-levels: kaynak/test PASS · yayın KAO2-23 sonrası · cihaz doğrulanmadı
- next: KAO2-24

## seq 80 · 2026-09-30 · CARD · KAO2-24
- status: done
- evidence: kuran-ogreniyorum-v2/evidence/KAO2-24/KANIT.md
- scope: map + stats TEK İlerleme ekranında birleşti (S-12): tanıdık kelime + kapsam eğrisi (03 §1 noktaları çalışma zamanında lexicon freq'ten, ±0,1), taşlar (kazanılan + SIRADAKİ koşul metniyle), haftalık etkinlik (7 gün, yumuşak seri D-19 — kırık seri cezası yok), Mushaf haritası bölümü (114 hücre gömülü), algı doğruluğu + kalibrasyon. Ayrı 'map' görünümü kaldırıldı; kaoSetView/kaoNav tek noktadan kaoViewAlias() ile stats'a akar.
- gates: KAO 42/42 (yeni test_kao2_progress.js 14 kontrol) · app 77/77 · panel 23/23 · panel-v2 27/27 · quran 9/9 · reminders/driver/zikr/iip_22 PASS · contrast 726 çift 0 ihlal · design-contract --strict PASS (deco 0, tracking 0, serif 0)
- budget: runtime 91.567/128 KiB · content 177.657/256 · css 12.631/14 · p95 4,6 ms
- pins: App.kao* 43 DEĞİŞMEDİ · app.js App.*=function 602 · bu kartta 0 yeni handler (App.kaoOpenMap uyumluluk için korundu, İlerleme'ye akar).
- fixed: kaoStatsHTML'de tanımsız q · <main> içinde <main> + iki h2 · başlık değişiminde metin kalıntısı · dengesiz </main> · model saflığı (taş kazandırma ekrana taşındı) · strict sözleşmede tracking/dekoratif sözde-öğe ihlali · kazanılmış işaret kontrastı 2,20:1 → --kao-ok 10,02:1 · kaoNav yolunda eksik takma ad.
- fixtures: test_kao2_navigation (map satırı çıktı) · test_kao_render E10 (gömülü harita) · test_kao2_today (gömülü hücre) — kartın gereği.
- evidence-levels: kaynak/test PASS · yayın KAO2-24 sonrası · cihaz doğrulanmadı
- next: KAO2-25

## seq 81 · 2026-09-30 · CARD · KAO2-25
- status: done
- evidence: kuran-ogreniyorum-v2/evidence/KAO2-25/KANIT.md
- scope: Kelime kartı "Katman 1/3" sayfalaması kaldırıldı → TEK kaydırmalı detay (kahraman → Anlamı → Türkçede → Kök → Kur'an'da → Öğrenme durumu → Hata bildir). Y-11 kapandı: doğrulanmamış örnek HİÇ gösterilmez, hata kutusu sızmaz. Panel aynası (KAO-19) genişledi: start/unit/lesson/lessonsDone/milestones — anlatı metni YOK, katı süzme, eski veriyle kırılmaz.
- gates: KAO 43/43 (yeni test_kao2_word.js 11 kontrol) · app 77/77 · panel 23/23 · panel-v2 27/27 · quran 9/9 · reminders/driver/zikr/iip_22 PASS · contrast PASS · design-contract --strict PASS
- budget: runtime 92.431/128 KiB · content 177.657/256 · css 12.824/14
- pins: **KASITLI** App.kao* 43→42 (kaoWordLayer kaldırıldı) · App.*=function 602→601 · App yüzeyi 764→763 · onclick 393 DEĞİŞMEDİ. 8 pin dosyası güncellendi.
- fixed: test lemması kapsamı · assert.match argüman tipi · kök ikilisinde hata kutusu (Y-11) · nullable start · izinli olmayan --kao-r-2 → --kao-r-ctl · panel iki anahtar listesi · fx2 iki sayaç yeri.
- evidence-levels: kaynak/test PASS · yayın KAO2-25 sonrası · cihaz doğrulanmadı
- next: KAO2-26

## seq 82 · 2026-09-30 · CARD · KAO2-26
- status: done
- evidence: kuran-ogreniyorum-v2/evidence/KAO2-26/KANIT.md
- scope: tests/kao/test_kao2_a11y.js (11 kontrol, 15 görünüm × boş/tohumlu): düğme erişilebilir adları · modal odak/kilit/dönüş sözleşmesi (backdrop odaklanamaz) · diyalog role/aria-modal · odak hedefi · aria-live (yalnız polite, panelde) · aria-current="step" · Arapça lang/dir · sabit px yükseklik yok (metin denetimleri min-height) · kontrast aracı JSON 726 çift 0 ihlal · odak halkası + ≥44px · dar genişlik/%200 metin koruması. Üretimde 20 denetim height→min-height.
- gates: KAO 44/44 · app 77/77 · panel 23/23 · panel-v2 27/27 · quran 9/9 · reminders/driver/zikr/iip_22 PASS · contrast PASS
- budget: runtime 92.431/128 · content 177.657/256 · css 12.815/14
- pins: DEĞİŞMEDİ (App.kao* 42 · atama 601 · yüzey 763 · onclick 393)
- fixed: line-height→line-min-height bozulması (10 yer + min-min-height) · aria-live için keyfi sayı sınırı → anlamlı kural · ^/$ çapalı regex yüzünden sessiz geçen yükseklik testi · kao-chip miras kalıntısı
- next: KAO2-27
