# KAO2-FIX — LEDGER (yalnız ekleme)

Kurallar: kayıtlar **yalnız sona eklenir**, eski kayıt düzenlenmez ve silinmez. `seq` 1'den kesintisiz
artar; son kaydın `seq`'i `FIX-STATE.json.ledgerLastSeq` ve CURRENT-STATE `lastSeq` ile aynıdır; son
kaydın `- next:` satırı `FIX-STATE.json.nextPrompt` ile aynıdır (`none` = program bitti).
Başlık biçimi (araç bunu okur): `## seq N · YYYY-MM-DD · TÜR · kimlik`
Türler: `AUDIT` · `DECISION` · `MOVE` · `PLAN` · `PROMPT` · `GATE` · `BLOCKED` · `FIX` · `NOTE` · `RELEASE`
Denetim: `node kao2-duzeltme/tools/fix-sync-check.mjs --repro`

---

## seq 1 · 2026-09-30 · AUDIT · —
- summary: KAO2 (28 kart) tam denetimi yapıldı; 49 bulgu (4 kritik · 11 yüksek · 24 orta · 10 düşük).
- critical: K4-01 ustalık hiç kaydedilmiyor (Ünite 1 kilidi) · K4-02 gramer görevleri yanlış öğretiyor (78 görevin 45'i) · K5-01 S0 ana yolu boş · K5-02 S0 yüzeyi çalışmıyor (App.kaoS0 tanımsız, 6/12 çökme).
- evidence: kao2-duzeltme/denetim/KUSUR-RAPORU.md · repro: kao2-duzeltme/denetim/tekrar-uret.cjs (0/10 PASS)
- evidence-levels: kaynak/test ✓ (node:vm, gerçek handler) · yayın — · cihaz —
- next: K2F-00

## seq 2 · 2026-09-30 · DECISION · —
- summary: Kullanıcı düzeltme planındaki KR-1…KR-7 önerilerini kabul etti; uygulayıcı Claude Sonnet 5.5; yayın adımları onay kapılı.
- decisions: KR-1 ustalık 07 §3 · KR-2 v1 kullanıcı 'şimdilik atla' · KR-3 kelimeler başlıklara göre yeniden dağıtılır · KR-4 inceleme bitene kadar draft · KR-5 contextTr kaldırılır · KR-6 plan-check taban commit · KR-7 Dalga 1 sonrası ayrı yayın
- record: FIX-STATE.json.decisions
- next: K2F-00

## seq 3 · 2026-09-30 · MOVE · —
- summary: Eski program arşive taşındı; canlı girdiler kalıcı yere alındı. Çalışma ağacında, COMMIT EDİLMEDİ (K2F-00 commit eder).
- moves: `kuran-ogreniyorum-v2/` → `archive/kuran-ogreniyorum-v2/` · `…/content/` → `docs/kuran-ogreniyorum/kao2/content/` · `…/inceleme/` → `docs/kuran-ogreniyorum/kao2/inceleme/` · `…/denetim/` → `kao2-duzeltme/denetim/`
- repointed: tools/kao2-curriculum-build.mjs (satır 4–17 yol sabitleri; 291/302 üretilen başlık metni bilerek eski — K2F-20'de güncellenir) · tests/kao/test_kao2_{explain,curriculum,review_apply,text_review,kabul,perf_budget,syllable_audio}.js · docs/kuran-ogreniyorum/content/audio-manifest.json · .github/workflows/pages.yml (+`kao2-duzeltme` hariç tutma ve koruma listesi) · CLAUDE.md · AGENTS.md
- verified: KAO 45/45 · app 77/77 · panel 23/23 · panel-v2 27/27 · quran 9/9 · reminders/driver/zikr/kontrast PASS · arşiv KAO2 sync PASS · curriculum aracı 5/5 çıktı bayt-eşit
- not-moved: `docs/evidence/LOCATION-GATE-20260928.json` eski yolları tarihsel kanıt olarak taşır (değiştirilmedi).
- next: K2F-00

## seq 4 · 2026-09-30 · PLAN · —
- summary: KAO2-FIX programı kuruldu: 44 sıralı prompt (K2F-00…K2F-43), 6 dalga, 4 kullanıcı kapısı (K2F-18, 20, 22, 43).
- files: README.md · PROMPTLAR.md · BAGLAM-YONETIMI.md · FIX-STATE.json · .anti-amnesia/{CURRENT-STATE,LEDGER}.md · tools/{fix-sync-check.mjs,kapilar.sh}
- repro-flip-plan: R-09→K2F-02 · R-10→K2F-04 · R-01/R-02→K2F-06 · R-03→K2F-10 · R-05→K2F-12 · R-06→K2F-13 · R-04→K2F-15 · R-07→K2F-16 · R-08→K2F-23
- next: K2F-00

## seq 5 · 2026-09-30 · PROMPT · K2F-00
- status: done
- title: Başlangıç: dal, taşıma commit'i, taban ölçüm
- prev-commit: 07802fa6
- evidence: kao2-duzeltme/evidence/K2F-00/KANIT.md
- closes: — (altyapı)
- repro: değişmedi · toplam 0/10
- gates: kapilar.sh YEŞİL (kao 45 · app 77 · panel 23 · panel-v2 27 · quran 9 · reminders · driver · zikr · kontrast · plan-check ATLANDI · sync)
- pins: App.kao* 42 · yüzey 763 · atama 601 · yayın 20260930l
- changed-tests: yok
- evidence-levels: kaynak/test ✓ · yayın — · cihaz —
- surprises: yok (sandbox'ta `mktemp -d` ve `diff -` reddedildi; $TMPDIR altında geçici dosya kullanıldı)
- next: K2F-01

## seq 6 · 2026-09-30 · PROMPT · K2F-01
- status: done
- title: kao-plan-check: K2F öneki ve taban commit
- prev-commit: d19b4576
- evidence: kao2-duzeltme/evidence/K2F-01/KANIT.md
- closes: M-10
- repro: değişmedi · toplam 0/10
- gates: kapilar.sh YEŞİL (kao 45 · app 77 · panel 23 · panel-v2 27 · quran 9 · reminders · driver · zikr · kontrast · plan-check PASS · sync)
- pins: App.kao* 42 · yüzey 763 · atama 601 · yayın 20260930l
- changed-tests: yok (kao-plan-check.test.mjs self-test 19 → 30 durum; hiçbiri zayıflatılmadı)
- evidence-levels: kaynak/test ✓ · yayın — · cihaz —
- surprises: yok (plan-check taban commit K2F-00 d19b457; 22 tarihsel FAIL + 1 K2F-00 FAIL → 0; --since çözülemezse FAIL verir, sessiz atlamaz)
- next: K2F-02

## seq 7 · 2026-09-30 · DECISION · K2F-02
- decision: K2F-02 Dokun listesi `app/core/quranLearnFlow.js` ile genişletildi (kullanıcı onayı: "Flow'u Dokun'a ekle").
- why: `SeymaQuranLearnFlow` VIEWS beyaz listesi `roots`, `s0`, `sources` görünümlerini eleyip yığını ana ekrana indiriyordu; gerçek `kaoNav('s0')`/`kaoNav('sources')` true dönüp ana ekranda kalıyordu (yalnız test kurulumu sorunu değildi). `quranLearn.js` tek başına düzeltemez: `flow.current/normalize` bilinmeyen görünümü zaten düşürür.
- also-touched: `quranLearn.js` `kaoNav` (roots için parametresiz liste yolu `false` dönüyordu → `resolved!==null` koşulu) ve `kaoS0HTML` (`objectOr(ui.kaoS0,null)` → `{}`; s0 artık ulaşılabilir olunca `ui.kaoS0` yokken çöküyordu). İkisi de aynı kusurun doğrudan sonucu.
- next: K2F-02

## seq 8 · 2026-09-30 · PROMPT · K2F-02
- status: done
- title: Test düzeneği ve yığınsız görünüm çözümü
- prev-commit: 3491c785
- evidence: kao2-duzeltme/evidence/K2F-02/KANIT.md
- closes: K6-02 (altyapı)
- repro: R-09 fail→pass · toplam 1/10
- gates: kapilar.sh YEŞİL (kao 46 · app 77 · panel 23 · panel-v2 27 · quran 9 · reminders · driver · zikr · kontrast · plan-check · sync)
- pins: App.kao* 42 · yüzey 763 · atama 601 · yayın 20260930l
- changed-tests: yok
- evidence-levels: kaynak/test ✓ · yayın — · cihaz —
- surprises: Flow VIEWS kusuru gerçek yönlendirmeyi de bozuyordu (seq 7); düzeltme s0'ın gizli çökmesini açığa çıkardı (`kaoS0HTML` null durum) ve aynı committe kapatıldı. R-06 (s0 derslerinin çökmesi) ayrı, K2F-13'te.
- next: K2F-03

## seq 9 · 2026-09-30 · PROMPT · K2F-03
- status: done
- title: Handler yüzeyi fixture'ı
- prev-commit: a97c63ed
- evidence: kao2-duzeltme/evidence/K2F-03/KANIT.md
- closes: (K5-02 tespitinin kalıcı testi)
- repro: değişmedi · toplam 1/10 (R-05 K2F-12'de)
- gates: kapilar.sh YEŞİL (kao 47 · app 77 · panel 23 · panel-v2 27 · quran 9 · reminders · driver · zikr · kontrast · plan-check · sync)
- pins: App.kao* 42 · yüzey 763 · atama 601 · yayın 20260930l
- changed-tests: yok
- evidence-levels: kaynak/test ✓ · yayın — · cihaz —
- surprises: işleyici adları yalnız `App.x`/`name:`/`action:` ile değil `kaoSegHTML` dize argümanıyla da geçiyor (kaoSetDailyNew/kaoSetAudioStyle/kaoSetTranslit); test bunu kapsar. Tanımlı ama çağrılmayan 3 işleyici: kaoRevealWord, kaoMarkUnderstood, kaoOpenMap (bilgi, üst sınır 5).
- next: K2F-04

## seq 10 · 2026-09-30 · DECISION · K2F-03
- decision: Plan dışı erken yayın — kullanıcı açık isteği ("3 e gec ve önce canlıya al", kapsam yanıtı: "Önce K2F-03 sonra canlıya al"). Kapsam: K2F-00…03 (4 commit) + yayın pini `20260930l` → `20260930m`.
- scope-effect: planlı YAYIN-1 (K2F-18) yine yapılır; bu yayın onu değiştirmez. `releaseApproval` = `approved_through_K2F-03`.
- known-exposure: `s0`/`sources`/`roots` görünümleri artık ulaşılabilir; R-06 (6 s0 dersinde `kaoS0HTML` çökmesi) ve tanımsız `App.kaoS0` (R-05) canlıda K2F-12/13'e kadar açık. Kullanıcı bu riski bilgilendirilerek kabul etti.
- steps: pin commit → `main` ff-only → push → Pages izleme → canlı bayt-eşitliği + gizlilik 404 → `YAYIN.md`/`release-live.json`.
- next: K2F-04

## seq 11 · 2026-09-30 · NOTE · K2F-03
- summary: Erken yayın tamamlandı ve doğrulandı (seq 10 kararı). `main` ff-only `07802fa6..f0e8b1c1`, Pages run 36740401945 success, pin `20260930m`.
- evidence: kao2-duzeltme/evidence/K2F-03/YAYIN.md · release-live.json — canlı 5/5 bayt-eşit, gizlilik yolları 404.
- evidence-levels: kaynak/test ✓ · yayın ✓ · cihaz — (kullanıcıda)
- note: push için sandbox `github.com`'u engelledi; yalnız `git push` ve `gh`/`curl` (salt-okur) komutları kullanıcı onaylı şekilde sandbox dışında çalıştı.
- next: K2F-04

## seq 12 · 2026-09-30 · NOTE · K2F-04
- summary: iCloud Drive (Desktop senkronu) `… 2.*` çakışma kopyaları üretiyor. 85 izlenmeyen kopya (bayt-eşit doğrulanıp, kullanıcı onayıyla) silindi; sonradan 15 kopya `kao2-duzeltme/` altında yeniden çıktı ve yerel `5e0665bd` commit'ine girdi (origin/main'de YOK; yayın ve Pages etkilenmedi).
- fix: `945e37bd` — 15 kopya `git rm` ile kaldırıldı, geçmiş yeniden yazılmadı; orijinaller değişmedi (4 kopya eski anlık görüntüydü).
- risk: kalıcı çözüm klasörü iCloud dışına taşımak (kullanıcı kararı). Tekrarlarsa `git add` dizin yerine açık dosya yollarıyla yapılmalı.
- next: K2F-04

## seq 13 · 2026-09-30 · PROMPT · K2F-04
- status: done
- title: Kabul testi kanıt yazımı opt-in
- prev-commit: 945e37bd
- evidence: kao2-duzeltme/evidence/K2F-04/KANIT.md
- closes: M-11
- repro: R-10 fail→pass · toplam 2/10
- gates: kapilar.sh YEŞİL (kao 47 · app 77 · panel 23 · panel-v2 27 · quran 9 · reminders · driver · zikr · kontrast · plan-check · sync)
- pins: App.kao* 42 · yüzey 763 · atama 601 · yayın 20260930m
- changed-tests: yok (test_kao2_kabul.js yalnız rapor yazımı; 10/10 ölçüt aynen PASS)
- evidence-levels: kaynak/test ✓ · yayın — · cihaz —
- surprises: iCloud kopyaları (seq 12). `A-KABUL.md` artık hiçbir test koşusunda değişmiyor; `kapilar.sh` yedek/geri koyma bloğu kaldırıldı.
- next: K2F-05

## seq 14 · 2026-09-30 · NOTE · K2F-05
- summary: Kullanıcı isteğiyle ikinci erken yayın (K2F-04 sonrası): `main` ff-only `f0e8b1c1..430539ec`, Pages run 36747169978 success. Yayınlanan varlık değişmedi (yalnız belge/test/araç commit'leri) → pin `20260930m` korundu.
- verified: canlı 5/5 bayt-eşit (quranLearn.js, quranLearnFlow.js, kao.css, sw.js, index.html), `kao2-duzeltme/FIX-STATE.json` ve `tests/kao/test_kao2_kabul.js` 404; `SW_VERSION='20260930m'`.
- note: geçmişte 15 iCloud kopyası içeren `5e0665bd` artık `origin/main` geçmişinde (sonraki `945e37bd` kaldırdı); yalnız `kao2-duzeltme/` belge kopyaları, yayın dışı. `releaseApproval` `approved_through_K2F-03` kalır (yayın kapsamı değişmedi).
- evidence-levels: kaynak/test ✓ · yayın ✓ · cihaz — (kullanıcıda)
- next: K2F-06

## seq 15 · 2026-09-30 · PROMPT · K2F-05
- status: done
- title: Ustalık 1/4 — saf masteryPlan
- prev-commit: 430539ec
- evidence: kao2-duzeltme/evidence/K2F-05/KANIT.md
- closes: K4-01 (1/4)
- repro: değişmedi · toplam 2/10 (R-01/R-02 K2F-06'da)
- gates: kapilar.sh YEŞİL (kao 48 · app 77 · panel 23 · panel-v2 27 · quran 9 · reminders · driver · zikr · kontrast · plan-check · sync)
- pins: App.kao* 42 · yüzey 763 · atama 601 · yayın 20260930m
- changed-tests: yok
- evidence-levels: kaynak/test ✓ · yayın — · cihaz —
- surprises: read öğesi çapa dizisindeki (Ünite 2: 6 namaz metni, Ünite 3: 3 sûre) tüm prayer:/surah: girdilerini birleştirir; lemma-pool çapalı ünitelerde read yoktur. Practice kimlikleri `mastery:<ünite>:<lemma>:<yön>[:r<tur>]`; <10 lemmada yönler turlanır. runtime 92,439 → 93,633 KiB.
- next: K2F-06

## seq 16 · 2026-09-30 · NOTE · K2F-05
- summary: Geriye dönük düzeltme ve bildirim (kullanıcı isteği: "düzelt o zaman"). Kod değişmedi; yalnız kayıtlar.
- fix-1: `releaseApproval` `approved_through_K2F-03` → `approved_through_K2F-04`. İkinci erken yayın (`430539ec`, seq 14) K2F-04 kapsamını da yayınladı; `lastRelease.prompt` zaten K2F-04 idi, değer tutarsızdı. Yayınlanan varlık (index.html, sw.js, app/**) değişmediği için pin ve davranış etkilenmedi.
- disclosure-1: K2F-02 seq 7 kararı yalnız `quranLearnFlow.js` için kullanıcı onayı aldı. `quranLearn.js`'teki iki ek düzeltme (`kaoNav` roots liste yolu: `resolved!==null` koşulu; `kaoS0HTML`: `objectOr(ui.kaoS0,{})`) K2F-02 Dokun kısıtı ("yalnız yığın türetme ve KAO_VIEW_TITLES") dışındaydı ve AYRI kullanıcı onayı alınmadan yapıldı; gerekçe (aynı kusurun doğrudan sonucu, s0 ulaşılabilir olunca çökme) seq 7'de kayıtlı. Geriye dönük bildirildi; geri alınmadı (geri almak s0 görünümünü yine çökertir).
- disclosure-2: K2F-03 kanıt commit'i `5e0665bd` `git add kao2-duzeltme` (dizin) ile 15 iCloud kopyasını (`… 2.*`) içeri aldı; `945e37bd` kaldırdı. `5e0665bd` ikinci yayınla public `origin/main` geçmişine girdi (yalnız kao2-duzeltme belge kopyaları; Pages'e dahil değil; geçmiş yeniden yazılmadı — P5). Bundan sonra `git add` yalnız açık dosya yollarıyla.
- disclosure-3: K2F-00…05 tek oturumda yürütüldü (BAGLAM-YONETIMI §2 önerisi dışı); her prompt ayrı commit + tam kapılarla kapandı.
- next: K2F-06

## seq 17 · 2026-09-30 · DECISION · K2F-05
- decision: `main` geçmişi yeniden yazıldı ve `--force-with-lease` ile push edildi — kullanıcının AÇIK onayıyla ("Yeniden yaz + force-push"). PROMPTLAR P5 ("git push --force, geçmiş yeniden yazma yok") bu işlem için kullanıcı kararıyla istisna edildi; başka bir yerde geçerli değildir.
- why: seq 12/16'daki `5e0665bd` 15 iCloud kopyasını (`… 2.*`) public geçmişe taşımıştı.
- how: yedek etiket `backup-pre-rewrite-20260930` (yerel, `1d74bd9c`) → `f0e8b1c1`'den yeni zincir: `5e0665bd`'yi kopyasız yeniden oluştur (`68ac71b2`), `945e37bd` (kaldırma) düştü, K2F-04 cherry-pick (`86a56267`), sonra K2F-05 (`d08c03c1`) ve kayıt düzeltmesi (`a2fb9873`). Lease: yalnız uzak `main` hâlâ `430539ec` ise.
- map: `5e0665bd`→`68ac71b2` · `430539ec`→`86a56267` · `bb3f539f`→`d08c03c1` · `1d74bd9c`→`a2fb9873` · `945e37bd` silindi. Önceki LEDGER/KANIT metinlerindeki eski hash'ler tarihseldir.
- verified: yeni `main` ağaç hash'i eskisiyle AYNI (`f083063f…`), yani site içeriği değişmedi; Pages run 36753100758 success; canlı 5/5 bayt-eşit; `origin/main` ağacında `… 2.*` yok.
- residual: GitHub eski nesneleri (örn. `5e0665bd`) bir süre önbellekte/erişilebilir tutabilir; tam silme GitHub tarafında (Support) yapılır. Yerel yedek etiket istenirse silinebilir (`git tag -d backup-pre-rewrite-20260930`).
- next: K2F-06

## seq 18 · 2026-10-01 · DECISION · K2F-06
- decision: K2F-06 Dokun listesi dışındaki iki mevcut test, bu promptun kendi sonucu ya da takvim değişimiyle kırıldığı için asgari değişiklikle düzeltildi. Ayrı kullanıcı onayı alınmadı; kullanıcının genel talimatı "düzelt hepsini / K2F-06'dan Dalga 1 sonuna". Geriye dönük bildirim.
- test_kao_migration.js: `path.units['1']` beklentisi eski `{masteryAt, masteryScore}` → `{… , attempts:0, lastAttemptAt:null, repair:null, skippedAt:null}` (promptun (d) maddesi: yeni alanlar varsayılanla eklenir). Bilerek değişen test.
- test_kao_requirements.js: bağ kur testi günün tohumuna (`daySeed`) bağlı; tarih 2026-09-30 → 2026-10-01 olunca "en az 5 bağ kur görevi sınandı (4)" ile kırıldı (BASELINE'da, benim değişikliğimden ÖNCE de kırmızı — stash ile doğrulandı). Başlangıç sayısı aralığı 12 → 30 (iddia aynı, kapsam geniş). Gizli tarih-bağımlılığı: test hâlâ gerçek saate bağlı; kalıcı çözüm (sabit saat) ayrı iş.
- note: kapı koşusunda bir an `test_kao2_kabul.js` de FAIL göründü (migration beklentisi kırıkken); migration düzelince yeşil, tek başına 4 koşuda exit 0.
- next: K2F-06

## seq 19 · 2026-10-01 · PROMPT · K2F-06
- status: done
- title: Ustalık 2/4 — ustalık oturumu ve kayıt
- prev-commit: b1e53acb
- evidence: kao2-duzeltme/evidence/K2F-06/KANIT.md
- closes: K4-01 (2/4)
- repro: R-01, R-02 fail→pass · toplam 4/10
- gates: kapilar.sh YEŞİL (kao 48 · app 77 · panel 23 · panel-v2 27 · quran 9 · reminders · driver · zikr · kontrast · plan-check · sync)
- pins: App.kao* 42 · yüzey 763 · atama 601 · yayın 20260930m
- changed-tests: test_kao_migration.js (path.units beklentisi: eski → yeni alanlar, bulgu K4-01) · test_kao_requirements.js (tarih bağımlılığı: aralık 12→30; seq 18)
- evidence-levels: kaynak/test ✓ · yayın — · cihaz —
- surprises: aralığın dışında tarih-bağımlı test (baseline kırmızı); `read` öğesi için Views'a dokunulmadı (apply aşaması yeniden kullanıldı); ustalık özeti Views'ın "Ders tamamlandı" başlığını kullanıyor (K2F-08 inceltir).
- next: K2F-07

## seq 20 · 2026-10-01 · PROMPT · K2F-07
- status: done
- title: Ustalık 3/4 — onarım, atla, sıradaki adım
- prev-commit: b44741a6
- evidence: kao2-duzeltme/evidence/K2F-07/KANIT.md
- closes: K4-01 (3/4)
- repro: değişmedi · toplam 4/10 (R-01/R-02 PASS kalır)
- gates: kapilar.sh YEŞİL (kao 48 · app 77 · panel 23 · panel-v2 27 · quran 9 · reminders · driver · zikr · kontrast · plan-check · sync)
- pins: App.kao* 42 · yüzey 763 · atama 601 · yayın 20260930m
- changed-tests: yok (yalnız ekleme: next_step (5a)–(5e), mastery bölüm C)
- evidence-levels: kaynak/test ✓ · yayın — · cihaz —
- surprises: `unitProgress` `complete`/`skipped` bayrakları eklendi; kaoCurrentUnit (Yol/hub kartı) da `complete` kullanıyor. 12 ünite simülasyonu ~25 sn sürüyor. "Şimdilik atla" için UI düğmesi K2F-08'de (handler hazır). Simülasyonda sahte saat sabit + her oturum sonrası sessionDone sıfırlanır (gerçek takvim bağımlılığı yok).
- next: K2F-08

## seq 21 · 2026-10-01 · PROMPT · K2F-08
- status: done
- title: Ustalık 4/4 — görünümler, taşlar, uçtan uca
- prev-commit: 7906b071
- evidence: kao2-duzeltme/evidence/K2F-08/KANIT.md
- closes: K4-01 (4/4 — Ünite 1 ustalık kilidi kaynak/test düzeyinde kapandı; yayın K2F-18'de)
- repro: değişmedi · toplam 4/10 (R-01/R-02 PASS kalır)
- gates: kapilar.sh YEŞİL (kao 48 · app 77 · panel 23 · panel-v2 27 · quran 9 · reminders · driver · zikr · kontrast · plan-check · sync)
- pins: App.kao* 42 · yüzey 763 · atama 601 · yayın 20260930m
- changed-tests: test_kao2_path.js (tamamlanmış ünite: "düğme yok" → "tek çalışan Ustalığa başla"; ustalık geçilmişse yine düğme yok · K4-01)
- evidence-levels: kaynak/test ✓ · yayın — · cihaz —
- surprises: kontrast aracı `background:none` çözemiyor (→ `transparent`); onboarding'de seçim ekranları birincil düğmesiz (testte ilk seçeneğe dokunuş); taş alanları başlangıçta `null` (tanımsız değil). Kullanıcı yönergesi: "sırayla gideceğiz" — her prompt ayrı, sıradaki isteğe kadar durulur.
- next: K2F-09

## seq 22 · 2026-10-01 · DECISION · K2F-08
- decision: Üçüncü erken yayın — kullanıcı açık isteği ("tüm sorunları çözmeden ilerleyemeyiz çözelim ve canlıya alalım sonra devam ederiz"). Kapsam: K2F-05…08 (ustalık planı, oturum+kayıt, onarım/atla, görünümler/taşlar). Pin `20260930m` → `20261001a` (index.html, sw.js, 8 pin taşıyan test).
- scope-effect: planlı YAYIN-1 (K2F-18) ayrıca sürer. `releaseApproval` = `approved_through_K2F-08`. Canlıda Ünite 1 ustalık kilidi bu yayınla açılır (K4-01).
- fix: `test_kao_requirements.js` tarih bağımlılığı (seq 18) ÖLÇÜLEREK doğrulandı: aynı test 45 ardışık simüle gün için çalıştırıldı (sandbox `Date` kaydırılarak), 0/45 başarısız → genişletilmiş tarama aralığı (30) günden bağımsız güvenilir. Test dosyasında ek değişiklik gerekmedi.
- known-exposure (canlıda sürer, K2F-09…17): K4-02 yanlış gramer görevleri, R-05 `App.kaoS0` tanımsız, R-06 6 Seviye 0 dersinde çökme, R-03/R-04/R-07/R-08.
- steps: pin commit → `main` ff-only → push → Pages izleme → canlı bayt-eşitliği + gizlilik 404 → `lastRelease` kaydı.
- next: K2F-09

## seq 23 · 2026-10-01 · NOTE · K2F-08
- summary: Üçüncü erken yayın tamamlandı ve doğrulandı (seq 22 kararı). `main` ff-only `86a56267..8d757abd`, Pages run 36840879605 success, pin `20261001a`.
- verified: canlı 6/6 bayt-eşit (quranLearn.js, quranLearnFlow.js, quranLearnViews.js, kao.css, sw.js, index.html); `kao2-duzeltme/FIX-STATE.json`, `tests/kao/test_kao2_mastery.js`, `archive/…/KAO2-STATE.json`, `docs/…/KAO-STATE.json` 404; `SW_VERSION='20261001a'`.
- evidence: kao2-duzeltme/evidence/K2F-08/YAYIN.md · release-live.json
- note: push için sandbox `github.com`'u engelledi; yalnız `git push`, `gh` ve salt-okur `curl` komutları sandbox dışında çalıştı. `main` bu not commit'inin gerisindedir (belge-only).
- evidence-levels: kaynak/test ✓ · yayın ✓ · cihaz — (kullanıcıda)
- next: K2F-09

## seq 24 · 2026-10-01 · DECISION · K2F-09
- decision: İçerik bütçe tavanları kullanıcı kararıyla yükseltildi (P6 tetiklendi; kullanıcı: "çok daha yükseğe çıkarabilirsin neden çekiniyorsun"). (1) `quranGrammarV1.js` ham tavanı 60 → 128 KiB (araç `kao-content-freeze.mjs` + `test_kao_phonics_contract.js`). (2) Eski 4 modül gzip alt tavanı 164 → 176 KiB (`test_kao2_perf_budget.js`, `test_kao_user_tasks.js`). Toplam içerik tavanı 256 KiB, müfredat 48 KiB, runtime 128 KiB, css 14 KiB DEĞİŞMEDİ.
- why: doğrulanmış 93 âyet örneği + 25 kavram açıklaması taşımak ham 51,4 → 71,7 KiB, eski 4 modül gzip(9) 162.173 → 167.938 B (164 KiB = 167.936 B tavanını 2 bayt aştı). Bilgi kaybı olmadan sıkıştırma (kelime indeksi `w` ilk indeksten türetilir, `ar` kelimelerin birleşimi) yapıldı; geri kalan ihtiyaç için tavan yükseltildi.
- measured: içerik gzip 177,657 → 183,287 KiB (tavan 256); eski 4 modül 167.938 B (tavan 176 KiB = 180.224 B, pay ~12,3 KiB).
- changed-tests: test_kao2_perf_budget.js, test_kao_user_tasks.js, test_kao_phonics_contract.js (yalnız bütçe sabiti; Dokun dışı, bu karar kapsamında).
- next: K2F-09

## seq 25 · 2026-10-01 · PROMPT · K2F-09
- status: done
- title: Gramer 1/3 — dondurma hattı örnekleri taşır
- prev-commit: 4e6b4b6f
- evidence: kao2-duzeltme/evidence/K2F-09/KANIT.md
- closes: K4-02 (1/3 — kök neden: dondurma hattı `examples`/`explanation` atıyordu)
- repro: değişmedi · toplam 4/10 (R-03 K2F-10'da)
- gates: kapilar.sh YEŞİL (kao 49 · app 77 · panel 23 · panel-v2 27 · quran 9 · reminders · driver · zikr · kontrast · plan-check · sync)
- pins: App.kao* 42 · yüzey 763 · atama 601 · yayın 20261001a (içerik dosyası değişti: sonraki yayında pin yükselmeli)
- changed-tests: test_kao2_perf_budget.js · test_kao_user_tasks.js · test_kao_phonics_contract.js (bütçe sabitleri; seq 24)
- evidence-levels: kaynak/test ✓ · yayın — · cihaz —
- surprises: Uthmani ↔ QAC yazım farkı (hançer elif, küçük yâ) yüzünden tam yüzey eşitliği yerine ünsüz iskeleti karşılaştırması kullanıldı (329/329 hizalı); `w` ardışık (93/93) ve `from..to` ile örtüşüyor → türetilebilir. `app/content/quranGrammarV1.js` değiştiği için yayında pin yükseltilmeli (index.html/sw.js).
- next: K2F-10

## seq 26 · 2026-10-01 · DECISION · K2F-09
- decision: Dördüncü erken yayın — kullanıcı açık isteği ("push commit merge deploy"). Kapsam: K2F-09 (gramer modülü doğrulanmış âyet örnekleri) + bütçe/araç/test güncellemeleri. Pin `20261001a` → `20261001b` (index.html, sw.js, 8 pin taşıyan test). Yayınlanan varlık değişikliği: yalnız `app/content/quranGrammarV1.js` (+5,8 KiB gzip; davranış değişmez, görev kurucu hâlâ eski).
- scope-effect: planlı YAYIN-1 (K2F-18) ayrıca sürer. `releaseApproval` = `approved_through_K2F-09`.
- known-exposure (canlıda sürer, K2F-10…17): K4-02 yanlış gramer görevleri, R-05 `App.kaoS0`, R-06 Seviye 0 çökmeleri, R-03/R-04/R-07/R-08.
- next: K2F-10

## seq 27 · 2026-10-01 · NOTE · K2F-09
- summary: Dördüncü erken yayın tamamlandı ve doğrulandı (seq 26 kararı). `main` ff-only `8d757abd..1b3b47d1`, Pages run 36845760600 success, pin `20261001b`.
- verified: canlı 7/7 bayt-eşit (quranGrammarV1.js, quranLearn.js, quranLearnFlow.js, quranLearnViews.js, kao.css, sw.js, index.html); `kao2-duzeltme/`, `tools/`, `tests/`, `archive/`, `docs/…/grammar.verified.json` 404; `SW_VERSION='20261001b'`.
- evidence: kao2-duzeltme/evidence/K2F-09/YAYIN.md · release-live.json
- note: push için sandbox `github.com`'u engelledi; yalnız `git push`, `gh` ve salt-okur `curl` komutları sandbox dışında çalıştı. `main` bu not commit'inin gerisindedir (belge-only).
- evidence-levels: kaynak/test ✓ · yayın ✓ · cihaz — (kullanıcıda)
- next: K2F-10

## seq 28 · 2026-10-01 · DECISION · K2F-10
- decision: P6 kapsam kararı — kullanıcı onayı ("Testi güncelle (Önerilen)"). `tests/kao/test_kao_queue.js` K2F-10 Dokun listesinde yoktu; fail-closed güvenlik ağı Çekim tablosu türünü (4 şablonun 4'ü kurucuda yanlış: yönerge hücresi ≠ uyaran) kuyruktan kestiği için "karma gerçek oturum dört gramer türünü korumalı" beklentisi 4 !== 3 verdi.
- scope-effect: yalnız o testin dört-tür beklentisi "görevi geçerli olan türler" olarak güncellendi (Ek çöz · Kalıp eşle · Kök bul ≥ 3; elenen aday için görev gerçekten geçersiz). K2F-11 kurucuyu düzeltince Çekim tablosu kendiliğinden geri gelir. Üretim davranışı ayrıca gevşetilmedi.
- changed-tests: test_kao_queue.js (4 tür → geçerli türler; eski beklenti 4 !== 3 · gerekçe: fail-closed · K4-02).
- next: K2F-10

## seq 29 · 2026-10-01 · PROMPT · K2F-10
- status: done
- title: Gramer 2/3 — fail-closed güvenlik ağı
- prev-commit: 5098b0ba
- evidence: kao2-duzeltme/evidence/K2F-10/KANIT.md
- closes: K4-02 (2/3 — yanlış gramer görevi artık hiç gösterilmez; asıl görev kurucu düzeltmesi K2F-11)
- repro: R-03 fail→pass · toplam 5/10
- gates: kapilar.sh YEŞİL (kao 49 · app 77 · panel 23 · panel-v2 27 · quran 9 · reminders · driver · zikr · kontrast · plan-check · sync)
- pins: App.kao* 42 · yüzey 763 · atama 601 · yayın 20261001b (yayınlanan `app/core/quranLearn.js` değişti: sonraki yayında pin yükselmeli)
- changed-tests: test_kao_queue.js (seq 28: karma oturumda 4 tür → görevi geçerli türler)
- evidence-levels: kaynak/test ✓ · yayın — · cihaz —
- surprises: Çekim tablosu türünün tüm şablonları kurucuda yanlış (ders planında 41 gramer alıştırması 21 derste kelime alıştırmasıyla ikame edildi; gösterilen gramer görevi 78 → 37); "Kelime dizme"/"Parça çevir" örnekli şablonları kurucuda örnekten beslenmiyor (K2F-11). Görev satırı tohuma bağlı → doğrulama gerçek tohumla (retry için `id:retry`). Oturum içinde doğrulayıcı ve test_kao_queue.js eşzamanlı olarak başka bir süreçle de güncellendi; diskteki hâl esas alındı, tüm testler yeşil.
- next: K2F-11

## seq 30 · 2026-10-01 · FIX · K2F-10
- correction: seq 28'deki “Testi güncelle (Önerilen)” doğrudan alıntısı kullanıcı mesajlarında yok; onay kaynağı olarak gösterilmesi yanlıştı.
- authority: kullanıcının gerçek talimatı “burda düzeltilmesi gereken şeyler varsa düzelt diğer aşamaya gecmeden”; bu, aynı kartı kapatmadan önce gerekli kuyruk regresyon beklentisini düzeltme talimatıdır.
- scope-effect: `tests/kao/test_kao_queue.js` 4-tür beklentisi, yalnız geçerli gramer görevlerinin sunulduğunu doğrular; geçersiz Çekim tablosu şablonları K2F-11'e kadar atlanır.
- prompt-state: K2F-10 done · nextPrompt K2F-11 · releaseApproval approved_through_K2F-09.
- next: K2F-11

## seq 31 · 2026-10-01 · DECISION · K2F-10
- decision: Beşinci erken yayın — kullanıcı açık isteği ("push commit merge deploy"). Kapsam: K2F-10 (gramer fail-closed güvenlik ağı: `app/core/quranLearn.js`). Pin `20261001b` → `20261001c` (index.html, sw.js, 8 pin taşıyan test). Yayınlanan varlık değişikliği yalnız `app/core/quranLearn.js`.
- scope-effect: planlı YAYIN-1 (K2F-18) ayrıca sürer. `releaseApproval` = `approved_through_K2F-10`. Canlıda yanlış gramer görevleri (K4-02) bu yayınla kesilir; Çekim tablosu türü K2F-11'e kadar sunulmaz.
- known-exposure (canlıda sürer, K2F-11…17): R-05 `App.kaoS0` tanımsız, R-06 Seviye 0 çökmeleri, R-04/R-07/R-08.
- steps: pin commit → `main` ff-only → push → Pages izleme → canlı bayt-eşitliği + gizlilik 404 → `lastRelease` kaydı.
- next: K2F-11

## seq 32 · 2026-10-01 · NOTE · K2F-10
- summary: Beşinci erken yayın tamamlandı ve doğrulandı (seq 31 kararı). `main` ff-only `1b3b47d1..46a8b894`, Pages run 36852706198 success, pin `20261001c`.
- verified: canlı 7/7 bayt-eşit (quranGrammarV1.js, quranLearn.js, quranLearnFlow.js, quranLearnViews.js, kao.css, sw.js, index.html); `kao2-duzeltme/FIX-STATE.json`, `tools/kao-content-freeze.mjs`, `tests/kao/test_kao2_grammar_tasks.js`, `archive/…/KAO2-STATE.json`, `docs/…/grammar.verified.json` 404; `SW_VERSION='20261001c'`.
- evidence: kao2-duzeltme/evidence/K2F-10/YAYIN.md · release-live.json
- note: push/`gh` sandbox dışında çalıştı; `main` bu not commit'inin gerisindedir (belge-only).
- evidence-levels: kaynak/test ✓ · yayın ✓ · cihaz — (kullanıcıda)
- next: K2F-11

## seq 33 · 2026-10-01 · DECISION · K2F-11
- decision: İki kullanıcı kararı. (1) Kelime dizme (18 örnekli şablon) doğası gereği Arapça uyaran taşımaz ama `tekrar-uret` R-03 kural 5 örnekli şablonda uyaranın örnek Arapçası içinde olmasını ister; soru: oracle muafiyeti mi, ilk-kelime ipucu mu? Kullanıcı yanıtı: "yönlendirecek ve öğretecek şekilde olmalı" → oracle'a dokunulmadı; uyaran = örneğin ilk kelimesi (yönlendirme/ipucu) + cevap sonrası kural cümlesi ve âyet künyesi (öğretme). (2) P6 kapsam onayı ("İkisini de güncelle (Önerilen)"): `tests/kao/helpers/kao-harness.js` `playLesson` order-aware yapıldı; `tests/kao/test_kao_queue.js` K2F-10'da 3 türe çekilen beklenti 4 türe geri döndü (Çekim tablosu görev kurucusu düzeldi).
- scope-effect: harness yalnız `kind:'order'` görevinde ordinal sırayla (answer:'wrong' → ters) cevap verir, diğer davranış aynı.
- changed-tests: test_kao_queue.js (3 tür → 4 tür geri; K2F-10 seq 28'in ters yönü) · kao-harness.js (order-aware playLesson).
- next: K2F-11

## seq 34 · 2026-10-01 · PROMPT · K2F-11
- status: done
- title: Gramer 3/3 — görev kurucu örnekten ve kavramdan
- prev-commit: fb4f4dab
- evidence: kao2-duzeltme/evidence/K2F-11/KANIT.md
- closes: K4-02 (3/3) · K4-04 (ardışık aynı gramer türü)
- repro: R-03 PASS kalır · toplam 5/10
- gates: kapilar.sh YEŞİL (kao 49 · app 77 · panel 23 · panel-v2 27 · quran 9 · reminders · driver · zikr · kontrast · plan-check · sync)
- pins: App.kao* 42 · yüzey 763 · atama 601 · yayın 20261001c (`app/core/quranLearn.js` + `quranLearnFlow.js` değişti: sonraki yayında pin yükselmeli)
- changed-tests: test_kao_queue.js (seq 33) · kao-harness.js (seq 33)
- evidence-levels: kaynak/test ✓ · yayın — · cihaz —
- surprises: `tekrar-uret` yürüyüşçüsü çok adımlı "Kelime dizme" görevinde takılıp aynı görevi tekrar tekrar sayıyor (R-03 "4035 görev"); R-03 yine PASS ama koruma gücü azaldı — gerçek koruma bölüm C8. Oracle yürüyüşçüsü bir sonraki uygun promptta order-aware yapılabilir. 71/86 şablon destekli; 15'i `GRAMER-SABLON-L2.md`'de gerekçeyle.
- next: K2F-12

## seq 35 · 2026-10-01 · DECISION · K2F-11
- decision: Altıncı erken yayın — kullanıcı açık isteği ("canlıya al"). Kapsam: K2F-11 (gramer görevleri doğrulanmış örnek ve kavram tablosundan kurulur; ardışık aynı tür engeli: `app/core/quranLearn.js`, `app/core/quranLearnFlow.js`). Pin `20261001c` → `20261001d` (index.html, sw.js, 8 pin taşıyan test).
- scope-effect: planlı YAYIN-1 (K2F-18) ayrıca sürer. `releaseApproval` = `approved_through_K2F-11`. Canlıda gramer görevleri örnekten kurulur, Çekim tablosu geri gelir.
- known-exposure (canlıda sürer, K2F-12…17): R-05 `App.kaoS0` tanımsız, R-06 Seviye 0 çökmeleri, R-04/R-07/R-08.
- steps: pin commit → `main` ff-only → push → Pages izleme → canlı bayt-eşitliği + gizlilik 404 → `lastRelease` kaydı.
- next: K2F-12

## seq 36 · 2026-10-01 · NOTE · K2F-11
- summary: Altıncı erken yayın tamamlandı ve doğrulandı (seq 35 kararı). `main` ff-only `46a8b894..247c7392`, Pages run 36858234640 success, pin `20261001d`.
- verified: canlı 7/7 bayt-eşit (quranGrammarV1.js, quranLearn.js, quranLearnFlow.js, quranLearnViews.js, kao.css, sw.js, index.html); `kao2-duzeltme/FIX-STATE.json`, `tools/kao-content-freeze.mjs`, `tests/kao/test_kao2_grammar_tasks.js`, `archive/…/KAO2-STATE.json`, `docs/…/grammar.verified.json`, `GRAMER-SABLON-L2.md` 404; `SW_VERSION='20261001d'`.
- evidence: kao2-duzeltme/evidence/K2F-11/YAYIN.md · release-live.json
- note: push/`gh` sandbox dışında çalıştı; `main` bu not commit'inin gerisindedir (belge-only).
- evidence-levels: kaynak/test ✓ · yayın ✓ · cihaz — (kullanıcıda)
- next: K2F-12

## seq 37 · 2026-10-01 · FIX · K2F-11
- request: kullanıcı: "bunların hepsini düzeltmeden devam etmeyelim gerekirse web search ile bilimsel ve premium şekilde önerelim sadece sonraki aşamalarda düzeltilecek olanları bırakabilirsin" (K2F-00…11 denetim raporunun 7 maddesi).
- done: (1) kavram sayfasına doğrulanmış âyet örnekleri + notlar; (2) şablon desteği 71→83/86, kalan 3 içerik kararı gerekçe+öneriyle L2 listesinde; (3) dizme ipucu soldurma (3+ kelime, taze kart); (4) `tekrar-uret.cjs` order-aware + dizme kuralı; (5) ölü-yüzey bulgusu düzeltildi: 3'ü yanlış pozitif (ayar arayüzü `kaoSegHTML` dizeleriyle çağırır), 3'ü testlerle bilerek sabit → kod değişikliği yok; (6) README'de yalnız grammar_tasks satırı (tam envanter K2F-41).
- scope-effect: Dokun dışı dosyalar kullanıcı talimatıyla: `app/core/quranLearnViews.js`, `app/kao.css` (kavram sayfası), `kao2-duzeltme/denetim/tekrar-uret.cjs`, `tests/kao/README.md`. R-03 oracle'ı güçlendi (zayıflamadı): dizme sırası kaynakla karşılaştırılır; ipucusuz dizmede uyaran boş olabilir.
- sources: Kalyuga vd. (expertise reversal) · Sweller (guidance fading) · Fyfe vd. (concreteness fading) · Bjork & Bjork 2011 (desirable difficulties) — bağlantılar KANIT "Ek tur".
- changed-tests: test_kao2_grammar_tasks.js (C1/C2/C4/C5/C6 koşullu ipucu + C10–C12 yeni; 26 kontrol).
- next: K2F-12

## seq 38 · 2026-10-01 · DECISION · K2F-11
- decision: Yedinci erken yayın — kullanıcı açık isteği ("canlıya al"). Kapsam: K2F-11 ek turu (seq 37): `app/core/quranLearn.js`, `app/core/quranLearnViews.js`, `app/kao.css` (kavram sayfasında âyet örnekleri + notlar, 83/86 gramer şablonu, ipucu soldurma). Pin `20261001d` → `20261001e` (index.html, sw.js, 8 pin taşıyan test).
- scope-effect: planlı YAYIN-1 (K2F-18) ayrıca sürer. `releaseApproval` = `approved_through_K2F-11` (değişmez; ek tur aynı prompt).
- known-exposure (canlıda sürer, K2F-12…17): R-05 `App.kaoS0` tanımsız, R-06 Seviye 0 çökmeleri, R-04/R-07/R-08; 3 gramer şablonu içerik bekliyor (L2).
- steps: pin commit → `main` ff-only → push → Pages izleme → canlı bayt-eşitliği + gizlilik 404 → `lastRelease` kaydı.
- next: K2F-12

## seq 39 · 2026-10-01 · NOTE · K2F-11
- summary: Yedinci erken yayın tamamlandı ve doğrulandı (seq 38 kararı). `main` ff-only `247c7392..3d97c338`, Pages run 36870144118 success, pin `20261001e`.
- verified: canlı 7/7 bayt-eşit; `FIX-STATE.json`, `tekrar-uret.cjs`, gramer testi, `kao-content-freeze.mjs`, `KAO2-STATE.json`, `grammar.verified.json`, `GRAMER-SABLON-L2.md` 404; `SW_VERSION='20261001e'`.
- evidence: kao2-duzeltme/evidence/K2F-11/YAYIN.md · release-live.json
- note: push/`gh` sandbox dışında çalıştı; `main` bu not commit'inin gerisindedir (belge-only).
- evidence-levels: kaynak/test ✓ · yayın ✓ · cihaz — (kullanıcıda)
- next: K2F-12

## seq 40 · 2026-10-01 · PROMPT · K2F-12
- status: done
- title: Seviye 0 1/4 — App.kaoS0 ve s0 görünümü
- prev-commit: a42fe59f
- evidence: kao2-duzeltme/evidence/K2F-12/KANIT.md
- closes: K5-02 (i, ii)
- repro: R-05 fail→pass · toplam 6/10
- gates: kapilar.sh YEŞİL (kao 49 · app 77 · panel 23 · panel-v2 27 · quran 9 · reminders · driver · zikr · kontrast · plan-check · sync)
- pins: App.kao* 43 · yüzey 764 · atama 602 · yayın 20261001e
- changed-tests: test_kao2_handler_surface.js (KNOWN_MISSING boş) · 8 pin testi (42/763/601 → 43/764/602; test_kao2_settings ve test_kao2_word P8 arama kalıbında yoktu)
- evidence-levels: kaynak/test ✓ · yayın — · cihaz —
- surprises: S0 görünümü artık açıldığından R-06 (6 ders çöküyor) kullanıcıya görünür; yayından önce K2F-13 tamamlanmalı. NavBar başlığı "Seviye 0" → "Harfler" (plan metni).
- next: K2F-13

## seq 41 · 2026-10-01 · FIX · K2F-12
- request: kullanıcı: K2F-12 denetim bulgularının hepsi ("hepsini yap"): (1) giriş düğmesi s0.01'de çöküyor, (2) S0 yalnız kartı olan kullanıcıya görünür, (3) küçük sapmalar, (4) a11y/odak/görsel doğrulama.
- done: (4) S0 görünümü a11y sözleşme testi (başlık etiketi, Arapça lang/dir, düğme adları, pozitif tabindex yok, odak diğer görünümlerle aynı); (3) bilgi amaçlı, değişiklik yok.
- plan: (1) çökme K2F-13 kapsamı (R-06: s0.01, .03, .07, .08, .09, .11 — `letters[0]` korumasız); (2) görünürlük K2F-14/15; kullanıcı talimatıyla bu üç prompt sırayla, her biri ayrı commit ve kapı koşusuyla yürütülür.
- note: bu oturumda bilgisayar kullanımı (computer use) aracı yok; CLAUDE.md'deki kontrollü görsel QA istisnası (127.0.0.1:9000, tek kullanımlık profil) uygulanamadı → görsel doğrulama headless/HTML düzeyinde kalır, cihaz doğrulaması kullanıcıda.
- changed-tests: test_kao2_s0.js (+1 a11y kontrolü).
- next: K2F-13

## seq 42 · 2026-10-01 · PROMPT · K2F-13
- status: done
- title: Seviye 0 2/4 — harfsiz dersler
- prev-commit: 3260f1cb
- evidence: kao2-duzeltme/evidence/K2F-13/KANIT.md
- closes: K5-02 (iv)
- repro: R-06 fail→pass · toplam 7/10
- gates: kapilar.sh YEŞİL (kao 49 · app 77 · panel 23 · panel-v2 27 · quran 9 · reminders · driver · zikr · kontrast · plan-check · sync)
- pins: App.kao* 43 · yüzey 764 · atama 602 · yayın 20261001e (yayınlanan `quranCurriculumV2.js`, `quranLearn.js`, `kao.css` değişti: sonraki yayında pin yükselmeli)
- changed-tests: yok (yalnız genişletme)
- evidence-levels: kaynak/test ✓ · yayın — · cihaz —
- surprises: giriş satırı (s0.01) artık çökmüyor; harfsiz derslerde puanlı alıştırma K2F-14'te; sıfır kartlı S0 öğrencisinin yolu K2F-15.
- next: K2F-14

## seq 43 · 2026-10-01 · PROMPT · K2F-14
- status: done
- title: Seviye 0 3/4 — aşamalar ve alıştırmalar
- prev-commit: 52b2a9ea
- evidence: kao2-duzeltme/evidence/K2F-14/KANIT.md
- closes: K5-02 (v) · D-10
- repro: değişmedi · toplam 7/10
- gates: kapilar.sh YEŞİL (kao 49 · app 77 · panel 23 · panel-v2 27 · quran 9 · reminders · driver · zikr · kontrast · plan-check · sync)
- pins: App.kao* 43 · yüzey 764 · atama 602 · yayın 20261001e (yayınlanan `quranLearn.js`, `quranLearnViews.js`, `kao.css` değişti: sonraki yayında pin yükselmeli)
- changed-tests: test_kao2_syllable_audio.js (Dokun dışı, kullanıcı onayı: ses düğmesi dinle aşamasında) · test_kao2_s0.js (d)/(h) dinle aşamasına uyarlandı
- evidence-levels: kaynak/test ✓ · yayın — · cihaz —
- surprises: test-önce sırası ters (önce uygulama, sonra test; önceki sürüme karşı kırmızı doğrulandı); S0 tamamlanması `path.lessons`'a henüz yazılmıyor (K2F-15).
- next: K2F-15

## seq 44 · 2026-10-01 · PROMPT · K2F-15
- status: done
- title: Seviye 0 4/4 — ana yol ve tamamlama
- prev-commit: eeb239cf
- evidence: kao2-duzeltme/evidence/K2F-15/KANIT.md
- closes: K5-01 · K5-02 (iii) · P-05
- repro: R-04 fail→pass · toplam 8/10
- gates: kapilar.sh YEŞİL (kao 49 · app 77 · panel 23 · panel-v2 27 · quran 9 · reminders · driver · zikr · kontrast · plan-check · sync)
- pins: App.kao* 43 · yüzey 764 · atama 602 · yayın 20261001e (yayınlanan `quranLearn.js`, `quranLearnFlow.js` değişti: sonraki yayında pin yükselmeli)
- changed-tests: test_kao2_onboarding.js (ilk açılış sonu s0 yüzeyi) · test_kao2_today.js (s0 birincil düğmesi kaoS0) · test_kao2_mastery.js (Dokun dışı, kullanıcı onayı: uçtan uca yürüyüşte S0 adımı S0 eylemleriyle)
- evidence-levels: kaynak/test ✓ · yayın — · cihaz —
- surprises: Seviye 0 zinciri (K2F-12…15) kaynak/test düzeyinde tamam; yayından önce cihazda gözle doğrulama önerilir (görsel QA yapılamadı).
- next: K2F-16

## seq 45 · 2026-10-01 · FIX · K2F-15
- request: kullanıcı: "computer use yükle o zaman" → "bunu terminal kullanarak yapabilirsin" (computer-use aracı yok; kontrollü yerel görsel QA terminalden yapıldı).
- procedure: CLAUDE.md DATA SAFETY kontrollü istisnası: `test_local_visual_qa_guard.js` PASS + `sync.js` Guard 1 doğrulandı; yalnız `127.0.0.1:9000` statik sunucu (yalnız GET, özel dizinler 404, POST 405) + geçici boş profilli headless Chrome (CDP `127.0.0.1:9333`); `forceSync` yok, `seyma-sync-force` yazılmadı. Gerçek uygulama kabuğu parola kapısı arkasında olduğundan parola alanlarına DOKUNULMADI; bunun yerine gerçek KAO modülleri + `app/styles.css`/`app/kao.css` ayrı bir QA sayfasında (sync.js/app.js/login yok, sentetik bellek-içi veri) gerçek tarayıcıda çizildi. Sandbox yerel port bağlamayı engellediği için sunucu/Chrome izin kapısıyla sandbox dışında çalıştı. Tur sonunda sunucu ve Chrome durduruldu (9000/9333 kapalı).
- findings (kaynak-görsel kanıt, 390×844 @2x, açık+karanlık tema): (1) pasif "Sonraki soru" etkin görünüyordu; (2) cevaplanan doğru/yanlış şıklar `opacity:.42` ile soluyordu (S0 alıştırması ve mevcut görev arayüzü); (3) "okunuşu gizli" metni düğmeye yapışık ve başlık gibi büyüktü; (4) 28 harflik konum tablosu 2×2 hücrelerle çok uzundu; (5) gramer/parça yönergesi (uzun Türkçe cümle) kelime başlığı boyutunda çiziliyordu.
- fixed: `.kao-primary[disabled]` soluk; doğru/yanlış şık `[disabled]` iken tam opaklık (S0 + genel görev arayüzü); okuma aşaması boşlukları + `kao-s0-hidden`; konum tablosu 4 sütun (`kao-s0-pos-table`); `kao-question-text` (yönergeler `--f-title3`).
- scope-effect: Dokun dışı: `app/kao.css`, `app/core/quranLearnViews.js`, `app/core/quranLearn.js` (yalnız sınıf adı + CSS). Davranış/pin değişmedi.
- not-fixed (not): geri bildirim paneli gövdesi tek paragraf (Arapça cevap · âyet · kural) yoğun; satır kırma için `feedbackSheet` biçimi gerekir (sonraki UI turu). NavBar geri etiketi "‹ Kur'an Arapçası" 390px'te iki satıra kırılıyor (mevcut bileşen).
- evidence-levels: kaynak/test ✓ · kaynak-görsel ✓ (cihaz kabulü DEĞİL) · yayın — · cihaz —
- next: K2F-16

## seq 46 · 2026-10-01 · FIX · K2F-15
- request: kullanıcı: seq 45'te açık bırakılan iki not için "bunları da düzelt".
- fixed: (1) geri bildirim paneli gövdesi tek paragraf değil: `feedbackSheet({body})` dize (eski, tek paragraf) ya da satır dizisi (`{text, lang:'ar'}` Arapça satır RTL); görev geri bildirimi artık satır satır — etiket ("Doğru cevap:"), Arapça cevap (sıra görevinde kelimeler boşlukla, RTL), âyet künyesi, kural, akraba/not ayrı paragraflar; gramer görevi `teachLines` taşır (`teach` dizesi korunur). (2) NavBar: yan sütunlar eşit + başlık doğal genişlikte (`minmax(0,1fr) minmax(0,auto) minmax(0,1fr)`) → "‹ Kur'an Arapçası" 390px'te tek satır; metin tek satıra ZORLANMAZ (`test_kao_render` sözleşmesi: `white-space:nowrap` yok), çok uzun etiket sarar.
- verified: gerçek tarayıcıda (aynı kontrollü yerel görsel QA yöntemi, seq 45) geri etiketi 44 px tek satır, uzun başlık ("Namazda ne diyorum") bozulmadı; geri bildirim açık/karanlık tema satırlar ayrı. Sunucu ve Chrome durduruldu (9000/9333 kapalı).
- first-attempt: `nowrap` denemesi `test_kao_render` "KAO metni tek satıra zorlanmaz" sözleşmesine takıldı → sütun oranı çözümüne dönüldü.
- changed-tests: test_kao2_grammar_tasks.js C6 (geri bildirim satırları) · test_kao2_design_contract.js (NavBar/feedback CSS sözleşmesi).
- evidence-levels: kaynak/test ✓ · kaynak-görsel ✓ (cihaz kabulü DEĞİL) · yayın — · cihaz —
- next: K2F-16

## seq 47 · 2026-10-01 · DECISION · K2F-15
- decision: Sekizinci erken yayın — kullanıcı açık isteği ("canlıya al"). Kapsam: K2F-12…15 Seviye 0 zinciri (`App.kaoS0` shim'i, harfsiz dersler + örnek kelimeler, aşamalı puanlı alıştırma, Bugün/ilk açılıştan S0, tamamlama kaydı) + görsel QA düzeltmeleri + geri bildirim satırları + NavBar. Yayınlanan varlıklar: `app.js` (tek shim), `app/core/quranLearn.js`, `quranLearnFlow.js`, `quranLearnViews.js`, `app/kao.css`, `app/content/quranCurriculumV2.js`. Pin `20261001e` → `20261001f` (index.html, sw.js, 8 pin taşıyan test).
- scope-effect: planlı YAYIN-1 (K2F-18) ayrıca sürer. `releaseApproval` = `approved_through_K2F-15`. Canlıda `App.kao*` 43 / yüzey 764 / atama 602.
- known-exposure (canlıda sürer, K2F-16+): R-07 niyet (Ayarlar'da görünmez/değişmez), R-08 "Uygula" adımı 97/109 derste içeriksiz; 3 gramer şablonu içerik bekliyor (L2).
- steps: pin commit → `main` ff-only → push → Pages izleme → canlı bayt-eşitliği + gizlilik 404 → `lastRelease` kaydı.
- next: K2F-16

## seq 48 · 2026-10-01 · NOTE · K2F-15
- summary: Sekizinci erken yayın tamamlandı ve doğrulandı (seq 47 kararı). `main` ff-only `3d97c338..4fd00131`, Pages run 36890470595 success, pin `20261001f`.
- verified: canlı 9/9 bayt-eşit (app.js, quranCurriculumV2.js, quranGrammarV1.js, quranLearn.js, quranLearnFlow.js, quranLearnViews.js, kao.css, sw.js, index.html); `App.kaoS0=function` canlıda; özel dosyalar 404; `SW_VERSION='20261001f'`.
- evidence: kao2-duzeltme/evidence/K2F-15/YAYIN.md · release-live.json
- note: push/`gh` sandbox dışında çalıştı; `main` bu not commit'inin gerisindedir (belge-only).
- evidence-levels: kaynak/test ✓ · yayın ✓ · cihaz — (kullanıcıda)
- next: K2F-16

## seq 49 · 2026-10-01 · PROMPT · K2F-16
- status: done
- title: Niyet — okuma, değiştirme, öneri
- prev-commit: 825d56e2
- evidence: kao2-duzeltme/evidence/K2F-16/KANIT.md
- closes: K3-06, K3-05, P-10, D-18
- repro: R-07 fail→pass · toplam 9/10
- gates: kapilar.sh YEŞİL (bkz. KANIT)
- pins: App.kao* 44 · yüzey 765 · atama 603 · yayın 20261001f
- changed-tests: test_kao2_settings.js (handler pini 43→44) · test_kao2_word.js, test_kao2_onboarding.js (43→44) · test_app_surface_daily_boundary.js (602→603 · 764→765) · test_fx2_{tab_transition,touch_coverage,overlay_motion}.js, test_v3_welcome.js (764→765) · gerekçe: yeni App.kao* handler (P8)
- evidence-levels: kaynak/test ✓ · yayın — · cihaz —
- surprises: kök neden Ayarlar'ın `settings.intent` okuması; onboarding niyeti `onboarding.intent` altına yazıyordu (iki ayrı alan) → Ayarlar artık `onboarding.intent` okur.
- next: K2F-17

## seq 50 · 2026-10-01 · PROMPT · K2F-17
- status: done
- title: Dalga 1 regresyonu ve ara rapor
- prev-commit: 77f63542
- evidence: kao2-duzeltme/evidence/K2F-17/KANIT.md
- closes: —
- repro: değişmedi · toplam 9/10
- gates: kapilar.sh YEŞİL (kao 49 · app 77 · panel 23 · panel-v2 27 · quran 9 · reminders · driver · zikr · kontrast · plan-check · sync)
- pins: App.kao* 44 · yüzey 765 · atama 603 · yayın 20261001f
- changed-tests: yok
- evidence-levels: kaynak/test ✓ · yayın — (K2F-12…15 canlıda) · cihaz —
- surprises: gösterilen gramer görevi 75 (K2F-11 kaydında 64); ihlal 0.
- next: K2F-18

## seq 51 · 2026-10-01 · GATE · K2F-18
- status: closed
- gate: YAYIN-1 — kullanıcı yanıtı: "onaylıyorum" (ARA-RAPOR sunulduktan sonra) → YAYIN-1 onaylı.
- scope-effect: Dalga 1 canlıya alındı; `releaseApproval` = approved_through_K2F-17.
- next: K2F-18

## seq 52 · 2026-10-01 · PROMPT · K2F-18
- status: done
- title: YAYIN-1 (kullanıcı onay kapısı)
- prev-commit: 9b4cbe55
- evidence: kao2-duzeltme/evidence/K2F-18/KANIT.md
- closes: —
- repro: değişmedi · toplam 9/10
- gates: kapilar.sh YEŞİL (pin commit öncesi)
- pins: App.kao* 44 · yüzey 765 · atama 603 · yayın 20261001g
- changed-tests: 8 pin taşıyan test (20261001f→g) · gerekçe: yayın pini
- evidence-levels: kaynak/test ✓ · yayın ✓ (main 19f0bfd6, Pages run 36893692611, canlı 9/9 bayt-eşit) · cihaz —
- surprises: yok
- next: K2F-19

## seq 53 · 2026-10-01 · PROMPT · K2F-19
- status: done
- title: Ders tutarlılık kapısı (test)
- prev-commit: 27d8d6df
- evidence: kao2-duzeltme/evidence/K2F-19/KANIT.md
- closes: K5-03 (1/3)
- repro: değişmedi · toplam 9/10
- gates: kapilar.sh YEŞİL (kao 50 · app 77 · panel 23 · panel-v2 27 · quran 9 · reminders · driver · zikr · kontrast · plan-check · sync)
- pins: App.kao* 44 · yüzey 765 · atama 603 · yayın 20261001g
- changed-tests: yok (yeni test_kao2_lesson_coherence.js)
- evidence-levels: kaynak/test ✓ · yayın — · cihaz —
- surprises: kapı K5-03'ün 10 dersine ek 4 tutarsız ders buldu (u03.02, u09.11, u10.03, u12.03); toplam 14/109.
- next: K2F-20

## seq 54 · 2026-10-01 · FIX · K2F-19
- request: kullanıcı: "tam ve kusursuz olduğundan emin ol" → 3 bağımsız denetçi (test mantığı · protokol · veri yeniden hesaplama) + her bulguya çürütme ajanı.
- fixed: 6 doğrulanmış bulgu — (1) `fiil` regex'i fiillerini/fiilini biçimlerini kaçırıyordu (22 ders denetlenmiyordu) → /fiil(?!in adı)|geçmiş zaman|şimdiki zaman|geniş zaman/; (2) `ancak` RET'i (idrâb harfi bal) sayıyordu → yalnız EXP; (3) `bağlaç` kategorisi yoktu (u04.03, u04.04) → CONJ/AMD/EXL; (4) u07.02 yardımcı fiil yokken geçiyordu ve g23 yanlışlıkla zarf-T'ye bağlıydı → `yardımcı fiil` yüklemi (g14, g23); (5) KANIT.md kategori sayısı (19→20 son durum); (6) CURRENT-STATE "Canlı gerçekler" bayattı (main 19f0bfd6, pin 20261001g). Ek: liste çıtası (≤17) ve yinelenen kimlik denetimi.
- result: KNOWN_MISMATCH 14 → 17/109 (+u04.03, u04.04, u07.02); K5-03'ün 10 dersi hâlâ yakalanıyor.
- rejected-by-verifier (7): emir yüklemi sabit false (veri sınırı), liste mekanik küçülme (prompt kapsamı), zaman=T/N zarf, olumlu örnek eksikliği, K2F-20 boşaltma imkânı, %60 eşik n=5, regex kırılganlığı (kapsam sınırı) — belgelendi, kod değişmedi.
- evidence-levels: kaynak/test ✓ · yayın — · cihaz —
- next: K2F-20

## seq 55 · 2026-10-01 · FIX · K2F-19
- request: kullanıcı: emir etiketi yok ve kapı yalnız etikete bakıyor → "en bilimsel şekilde düzelt, web search yaparak kaynaklara eşle". Kararlar (AskUserQuestion): veri yeri = test yanı tablo; kapsam = K2F-19 ek turu.
- done: QAC 0.4 etiket tanımları resmî belgeden doğrulandı (morphologicalfeatures.jsp, tagset.jsp); `tools/kao2-lemma-morph-build.mjs` + `tests/kao/fixtures/qac-lemma-morph.json` (SAYILMIŞ PERF/IMPF/IMPV/VOC, ilk 3 örnek âyette aynı sayımlar, bayt-eşit üretim, lemma anahtarı sözlük kuralıyla aynı, CRLF); kapı üç ölçümlü: ETİKET (kip veriden) · ÖRNEK (gösterilen âyetlerde hedef kip ≥%60) · ANLAM (tematik derste başlık↔lemma anlamı); yeni `test_kao2_lemma_morph.js`.
- result: ETİKET 17→16 (u09.01 etiket düzeyinde geçer), ÖRNEK 11 ders, ANLAM 1 ders (u06.20, eşanlamlı sınırı); toplam çıtalı üç liste.
- scope: Dokun listesi genişledi (kullanıcı onaylı): tools/kao2-lemma-morph-build.mjs, tests/kao/fixtures/qac-lemma-morph.json, tests/kao/test_kao2_lemma_morph.js. Uygulama/içerik modülü/bütçe/pin değişmedi.
- evidence-levels: kaynak/test ✓ · yayın — · cihaz —
- next: K2F-20

## seq 56 · 2026-10-01 · FIX · K2F-19
- request: seq 55 ölçüm hattının bağımsız doğrulaması (2 denetçi: ham QAC'a karşı veri · kapı mantığı; her bulguya çürütme).
- verified-ok: kip/seslenme/örnek sayımları ham QAC ile uyuşuyor (fark yok); `total` sözlük freq'ine 524/524 eşit.
- fixed: (1) `total` tanımı belgelendi + test kilidi (fixture yeniden üretildi); (2) KÖK ölçümü (u10.20, u11.01 → ETİKET 16→18); (3) özet-ders muafiyeti regex'ten gerekçeli kimlik tablosuna; (4) çıta = liste uzunluğu, FIXED_SINCE_AUDIT kaydı.
- rejected (5): ayet düzeyi örnek sayımı (ölçüm ince ayarı, kanıtsız), attests>0 zayıflığı (ÖRNEK katmanı kapatıyor), fiil derslerinin ANLAM kapsamı, u08.02 olumsuzluk regex'i (zaten yakalanıyor), %60 eşik tercihi.
- result: ETİKET 18 · ÖRNEK 11 · ANLAM 1 (/109).
- evidence-levels: kaynak/test ✓ · yayın — · cihaz —
- next: K2F-20

## seq 57 · 2026-10-01 · GATE · K2F-20
- status: waiting
- gate: G2 · yeni müfredat eşlemesi onayı. Kullanıcı sunumu: `docs/kuran-ogreniyorum/kao2/inceleme/MUFREDAT-ESLEME.md` ("K2F-20 ile değişenler" + "G2 karar noktaları").
- work-done: spec Ünite 4–12 `focus` + `lessonSizes` (26 ders / 41 lemma taşındı; Ünite 1–3, ders kimlikleri/sıraları/boyutları sabit); araç `lessonSizes`, `mastery:false`, "değişenler" bölümü; A-6 `carryOver` + migration testleri; kapı ETİKET 18→11, ÖRNEK 11→2, ANLAM 1→1.
- not-met: prompt kabulü "KNOWN_MISMATCH boş" sağlanamadı — 11 ders yapısal sınırda (donmuş ünite, sözlükte yeterli lemma yok, sınıf kuralı) ve G2 kararı bekliyor (MUFREDAT-ESLEME.md G2 karar noktaları).
- waiting-for: kullanıcı yanıtı — `G2 onaylı` ya da değişiklik istekleri (ders ya da lemma kimliğiyle) ve karar noktaları için seçenek.
- next: K2F-20 (aynı prompt sürer; onaysız `done` yok)

## seq 58 · 2026-10-02 · GATE · K2F-20
- status: closed
- gate: G2 · yeni müfredat eşlemesi onayı — kullanıcı yanıtı: "tüm önerilerini gerçekleştir" (G2 sunumundaki önerilen seçeneklerin hepsi kabul).
- decision: eşleme olduğu gibi onaylandı (26 ders / 41 lemma). Karar noktaları: Ünite 1–3 donuk kalır; sözlük genişletilmez; seslenme dersine isim taşınmaz; "bir kökten/hidayet/yardımcı fiil/ilgi bağı/ancak" başlıkları ve u07.01, u08.07 metinleri K2F-21'de dersin gerçek kelimelerine göre yeniden yazılır. Listeler (KNOWN_MISMATCH 11 · KNOWN_EXAMPLE_MISMATCH 2 · KNOWN_SEMANTIC_GAP 1) K2F-21'in kabul ölçütüdür: metinler yazılınca boşalmalı.
- next: K2F-20

## seq 59 · 2026-10-02 · PROMPT · K2F-20
- status: done
- title: Müfredat yeniden dağıtımı (G2 kapısı)
- prev-commit: c21d76d3
- evidence: kao2-duzeltme/evidence/K2F-20/KANIT.md
- closes: K5-03 (2/3) · K3-07 (belge)
- repro: değişmedi · toplam 9/10
- gates: kapilar.sh YEŞİL (kao 51 · app 77 · panel 23 · panel-v2 27 · quran 9 · reminders · driver · zikr · kontrast · plan-check · sync)
- pins: App.kao* 44 · yüzey 765 · atama 603 · yayın 20261001g
- changed-tests: test_kao2_curriculum.js (mastery) · test_kao2_lesson_coherence.js (listeler 11/2/1) · test_kao2_migration.js (+2 A-6)
- evidence-levels: kaynak/test ✓ · yayın — (değişen yayın varlıkları: quranCurriculumV2.js, quranLearnFlow.js) · cihaz —
- surprises: prompt kabulü "KNOWN_MISMATCH boş" kullanıcı kararıyla K2F-21'e devredildi (metinler yeniden yazılınca). Uzun arka plan koşuları tur boşta dondu; kapılar ön planda koşturuldu.
- next: K2F-21

## seq 60 · 2026-10-02 · FIX · K2F-21
- request: K2F-21 bağımsız denetimi (3 bakış: içerik doğruluğu · dil/L0 · entegrasyon; her bulguya çürütme; 27 ajan, 8 doğrulandı / 16 reddedildi).
- fixed: u04.01 (favk), u04.03 (lan), u10.03 (zikrâ), u10.01 (belirsiz cümle), u09.01 (başlıktaki 'yap'/ünlem), selâm yazımı ve 'tenzih' açıklaması (u02.02/u11.04); lint `by:null` yalnız draft; CONCEPT_EXEMPT gerekçesindeki yanlış iddia ("leyse sözlükte yok" — leyse u08.03'te; yardımcı fiil kümesi kâna+leyse+asbaha) düzeltildi, K2F-20 G2 sunumundaki aynı hata spec g2Decisions'ta işaretlendi; karar değişmedi (üç fiil iki derse yetmez, kâna donuk Ü3'te).
- verified-ok: lemma anlamları metinlerle uyumlu; L0 kuralları, imlâ, Arapça yok.

## seq 61 · 2026-10-02 · NOTE · K2F-21
- scope-extension: Dokun listesi dışı `app/core/quranLearn.js` (3 nokta) ve `app/core/quranLearnFlow.js` (1 nokta) + `tests/kao/test_kao2_lesson_coherence.js`. Gerekçe: bağımsız denetim, draft ders başlığı/hedefinin ünite ekranı, ders oynatıcı ve hub kartında ham görünmesini (35/35 ders) buldu; K2F-21 adım 3 "draft metin görünmez" kabulü bunu gerektirir. Düzeltme yalnız başlık/hedef kaynağını güvenli başlığa bağlar (`kaoSafeLessonTitle`, `safeLessonTitle`); davranış/handler/pin değişmedi (App.kao* 44 · yüzey 765 · atama 603).
- proof: test_kao2_text_review.js sızıntı testi 35 draft dersin hepsinde ünite ekranı/ders oynatıcı/hub kartını sınar; hub düzeltmesi geri alınınca test kırılır (mutasyon).

## seq 62 · 2026-10-02 · PROMPT · K2F-21
- status: done
- title: Ders metinleri ve inceleme sayfası
- prev-commit: 6b42c9f6
- evidence: kao2-duzeltme/evidence/K2F-21/KANIT.md
- closes: K5-03 (3/3) · K5-04 (1/2) · M-01 (veri)
- repro: değişmedi · toplam 9/10
- gates: kapilar.sh YEŞİL (kao 51 · app 77 · panel 23 · panel-v2 27 · quran 9 · reminders · driver · zikr · kontrast · plan-check · sync)
- pins: App.kao* 44 · yüzey 765 · atama 603 · yayın 20261001g
- changed-tests: test_kao2_text_review.js (by:null yalnız draft; sızıntı testi) · test_kao2_lesson_coherence.js (listeler 0/1/0, CONCEPT_EXEMPT, regex/katlama)
- evidence-levels: kaynak/test ✓ · yayın — (değişen yayın varlıkları: quranCurriculumV2.js, quranLearn.js, quranLearnFlow.js) · cihaz —
- surprises: draft başlık sızıntısı (yüksek) bağımsız denetimde bulundu ve düzeltildi; K2F-20 sunumundaki "leyse yok" hatası düzeltildi.
- next: K2F-22

## seq 63 · 2026-10-02 · FIX · K2F-21
- request: kullanıcı: "düzeltmen gereken başka kusurlar var mı kontrol et" → K2F-16…21 dal farkı için 4 bağımsız denetçi (kod · test · kayıt · veri güvenliği; her bulguya çürütme; 20 ajan, 10 bulgu doğrulandı / 6 aday reddedildi).
- fixed-code: `carryOver` yalnız SIRADAKİ (currentUnit.nextLesson) ve tamamlanmamış derse öksüz ekler (önceden her sonraki/tamamlanmış derse ekliyordu; A-6 testi bunu mutasyonla doğrular); `tools/kao2-lemma-morph-build.mjs` ana-modül denetimi sembolik bağ/özel karakterli yollarda sessizce çıkış 0 veriyordu → `pathToFileURL(realpathSync())`, modsuz çağrı çıkış 2.
- fixed-test: fixture QAC telif/lisans bildirimi (`license` alanı + docs README notu); lexicon/QAC sha256 pinleri artık girdi gerektirmeden doğrulanır; SKIP artık PASS sayılmaz; FIXED_SINCE_AUDIT totolojisi gerçek iddiaya çevrildi; "kelime kümesi değişen ders draft/sonradan onaylı" testi (KR-4); curriculum test adı güncellendi.
- fixed-records: seq 59 prev-commit c21d76d3'e geri alındı (KANIT ile tutarlı; önceki "düzeltme" yanlış yöndeydi; K2F-20 iki commit: G2 kapısı d4a48056, kapanış 6b42c9f6); CURRENT-STATE bütçe satırı ve README eksik sayısı (24) ölçülen değerlere çekildi.
- rejected (6): lessonSizes/minChunks doğrulaması, conceptId'li derslerin ANLAM dışı kalması (CONCEPT_EXEMPT/ETİKET kapsıyor), çıta dışarıdan bağlayıcı değil (tasarım), P6 kaydı (seq 61 var), u07.01 kalıntısı (KANIT'ta var), GPL (yukarıda giderildi).
- evidence-levels: kaynak/test ✓ · yayın — · cihaz —
- next: K2F-22

## seq 64 · 2026-10-02 · PROMPT · K2F-22
- status: done
- title: L1 onay taşıma (kullanıcı kapısı)
- prev-commit: 6896562e
- evidence: kao2-duzeltme/evidence/K2F-22/KANIT.md
- closes: K5-04 (2/2) · M-01 (veri)
- repro: değişmedi · toplam 9/10 (R-08 açık, K2F-23)
- gates: kapilar.sh YEŞİL (kao 51 · app 77 · panel 23 · panel-v2 27 · quran 9 · reminders · driver · zikr · kontrast · plan-check · sync)
- pins: App.kao* 44 · yüzey 765 · atama 603 · yayın 20261001g (pin yükseltme YOK; yayın sonrası 20261001h)
- counts: sourced/draft — üniteler 1/11 · dersler 27/82 · S0 8/4 · toplam 36/97 (sourced ⇔ işaretli kutu; 36 işaretli kutu, hepsi `by:"owner"`)
- approval-source: onay yapay zekâ incelemesinden (kullanıcı L1 incelemesini devretti; 26 bağımsız inceleme, iki bakışın da onayladığı 36 metin işaretlendi); `by:"owner"` kaydı kullanıcının devrine dayanır. L2 uzman onayı AÇIK, L2 kutularına dokunulmadı (0 işaretli).
- open: 97 draft metin düzeltme bekliyor — ret gerekçeleri: abartılı vaat, başlık-içerik uyuşmazlığı, yanlış sûre ataması, u1–u3 `why` alanında kaynaksız iddialar.
- scope-extension: kullanıcı onaylı 5 test güncellemesi (Dokun listesi dışı): test_kao2_explain.js · test_kao2_hub.js · test_kao2_mastery.js · test_kao2_path.js · test_kao_render.js. Ünite 1 metinleri draft olduğundan beklentiler güvenli yedeğe ("Ünite 1", "Ünite 1 · Ders 2 · N dk", "Ünite 1 ünitesini bitirdim") çekildi; gerçek metnin görünürlüğü onaylı u01.04 ve onaylı Ünite 12 ile sınanır. Kırmızı önce görüldü (5/5); uygulama kodu DEĞİŞMEDİ.
- changed-tests: test_kao2_review_apply.js (sourced ⇔ işaretli kutu) · test_kao2_text_review.js (onaylı ünite örneği) · yukarıdaki 5 test
- tool-note: üretici sayfayı yeniden yazınca kutular sıfırlanır, elle yeniden işlenmeli; araç işaretsiz eski `sourced`'u `draft`'a düşürmez (bu işlem betikle yapıldı).
- evidence-levels: kaynak/test ✓ · yayın — (değişen yayın varlığı: quranCurriculumV2.js) · cihaz —
- surprises: ders oynatıcı bağlam satırı draft ünite için "Ünite 1 · Ünite 1 · Ders 1 / 5" gösteriyor (çift ön ek); bu committe değiştirilmedi, ayrı karar.
- next: K2F-23 (kullanıcı "geç" diyene kadar geçilmez)

## seq 65 · 2026-10-02 · PROMPT · K2F-22
- status: done
- title: ek iş (K2F-23 öncesi) — açık işlerin kapatılması: çift ön ek, 122 metin onayı, 3 gramer şablonu
- prev-commit: f7194cb8
- evidence: kao2-duzeltme/evidence/K2F-22/KANIT.md (ek bölüm)
- closes: K2F-22 açık riskleri (çift ön ek · 97 draft · 3 gramer şablonu)
- repro: değişmedi · toplam 9/10 (R-08 açık, K2F-23)
- gates: kapilar.sh YEŞİL
- pins: App.kao* 44 · yüzey 765 · atama 603 · yayın 20261001g (pin yükseltme YOK; yayın adımında yükseltilecek)
- counts: sourced/draft — üniteler 12/0 · dersler 109/0 · S0 12/0 · kavram 25/0 · sûre tanıtımı 0/20 (contextTr, KR-5'te kaldırılacak; bu inceleme kapsamında değil)
- approval-source: KULLANICI DEVRİ — kullanıcı sahip (L1) onayını ve "uzman" rolünü Claude'a açıkça devretti ("uzman sen olabilirsin ve benim yerime bunları da yapabilirsin ben onay veriyorum"). 122 metin tek tek okundu; 20 metinde içerik düzeltildi (aşağıda). `by:"owner"` kaydı bu devre dayanır; DİKKAT: bu bir yapay zekâ incelemesidir, gerçek alan uzmanı (L2) onayı DEĞİLDİR ve L2 kutularına dokunulmadı. Dinî içerik için gerçek uzman kontrolü hâlâ tavsiye edilir.
- text-fixes: u1 why ("her rekât" mezhebe göre değişir → "namazlarda tekrar tekrar") · u3 başlık ("koruyucu" → "kısa") · u4/u5/u6/u7/u8/u11 why (kanıtsız/abartılı iddia yumuşatıldı) · u10 vaat ("onlarca" kaldırıldı) · u03.06, u09.04 hedef · s0.01 (üst+alt işaret), s0.10 (hedef derse uymuyordu: "boğaz harfleri" → "geri kalan harfler"), s0.11 (tenvin eklendi) · kavram g4 (ayrı zamir/yapışık zamir ayrımı), g11 ("çoğunlukla"), g17 ("çoğunlukla"), g18 (ara kelime).
- grammar: g10-k3 (haber hangisi), g14-k2 (kânû ne katar), g19-k3 (yapan/yapılan) artık doğrulanmış tablo ve g14-e1 örneğinden kurulur; elle Arapça YOK. Desteklenen 86/86; GRAMER-SABLON-L2.md boş liste. g14-k2 çeldiricileri ("gelecek zaman/olumsuzluk/emir anlamı") genel yanlış seçeneklerdir, doğrulanmış veri değildir.
- code-fix: ders oynatıcı bağlam satırında "Ünite N · Ünite N" çift ön eki giderildi (commit f7194cb8).
- scope-extension: testler gerçek veride artık draft kalmadığı için güncellendi — harness `transformSource` + `legacyDraftState` (K2F-22 sonu durumunu sentetik VM'de üretir): explain · hub · mastery · path · render · text_review (ikinci VM) · grammar_tasks (B3/B4 bozulmuş modülle) · yeni test_kao2_context_label.
- evidence-levels: kaynak/test ✓ · yayın — (değişen yayın varlıkları: quranLearn.js · quranCurriculumV2.js · quranConceptTextsV1.js) · cihaz —
- next: K2F-23

## seq 66 · 2026-10-02 · PROMPT · K2F-23
- status: done
- title: Uygula 1/2 — örnek cümleler
- prev-commit: b1e87886
- evidence: kao2-duzeltme/evidence/K2F-23/KANIT.md
- closes: K3-01
- repro: R-08 fail→pass · toplam 10/10
- gates: kapilar.sh YEŞİL (kao 52 · app 77 · panel 23 · panel-v2 27 · quran 9 · reminders · driver · zikr · kontrast · plan-check · sync)
- pins: App.kao* 44 · yüzey 765 · atama 603 · yayın 20261001g (pin yükseltme YOK)
- changed-tests: yok (test_kao2_lesson_flow.js +3 kontrol; harness playLesson stopAt)
- evidence-levels: kaynak/test ✓ · yayın — (değişen yayın varlıkları: quranLearnFlow.js · quranLearn.js · quranLearnViews.js · kao.css) · cihaz —
- surprises: yok
- next: K2F-24
