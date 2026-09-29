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
