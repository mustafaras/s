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
