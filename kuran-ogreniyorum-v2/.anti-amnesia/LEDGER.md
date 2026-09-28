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
