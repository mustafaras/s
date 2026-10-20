# K3PD-09 — gerçek görev ve notlama kanıtı

Durum: `done`; bağımsız salt-okur denetim `PASS`; `nextPrompt` K3PD-10. K3PD-10 yalnız adaydır, yeni işe yetki değildir.

## Yetki ve başlangıç

- Canlı dal `k3pd-denetim-duzeltmeleri`; başlangıç HEAD `10914697204b8411beae040ff108d2c80caa0a7d`; başlangıç `HEAD...origin/main` farkı 3/0.
- Başlangıç adayı `durum.mjs --sonraki` ile K3PD-09; başlangıç `--check` PASS. K3PD `releaseApproval=NOT_APPROVED`.
- Kullanıcı, yalnız PROMPTLAR.md’deki K3PD-09 allowlist satırını exact yollara çevirmeye izin verdi. K3PD-08 satırına dokunulmadı.
- Başlangıçtaki kirli dosyalar karta alınmadı. Üç korunan dosyanın başlangıç ve son SHA-256 değerleri aynı: `KAPANIS.md` `d8e8419e2849b9eec922e537bca7100149fdfee6120ce850fda77128f8af9bcd`; `README.md` `1aee47cdd05726f4a5966748ae3f786bd79d2e394dd37f3ec7b083f2d36eed0f`; `kanit/sonraki/GORSEL-KANIT.md` `d7627027bba21007550f0a5c76130a4d9f11b7b896d001a60e9333c81ffeed28`.
- Kapanmış K3P kaydı ayrı kaldı: 37/37 tamamlandı, `nextPrompt=null`, tarihsel `releaseApproval=APPROVED-2026-10-18`. Ardıl K3PD onayı bundan bağımsız olarak `NOT_APPROVED`.

## Kırmızı → yeşil ve gerçek handler sonuçları

Üretim kodu değiştirilmeden önce güçlendirilmiş DDA sınamaları kırmızı verdi: önbellekteki normal görev 4 seçenek sundu (beklenen 3); kolay kuyruk seçimi `build` görevini gerçek iki seçenekli MC gibi sundu; sunulmuş ses yardımı sonrası pencere/streak değişiminde doğru cevap grade 4 oldu (beklenen 2); kolay görev retry satırı aynı kartı kuyrukta çoğalttı. Sınamalar eski davranışı `bootKao` içindeki gerçek lesson/answer/presentation handler’ları üzerinden çalıştırdı.

Son kodla DDA 14/14 kontrol PASS:

- İki yanlış sonrası normal cached MC görev tam 3 seçenek ve HTML’de 3 cevap düğmesi verdi.
- Araya alınan B/R1 kolay kelime görevi tam 2 seçenek ve HTML’de 2 cevap düğmesi verdi.
- Gerçek sunum callback’inde çalan ses yardımı, daha sonra `window` veya `wrongStreak` değişse de doğru cevabı grade 2 yaptı.
- Yardımsız normal gerçek görev, beş tekrarlı hızlı doğru yanıtta grade 4 verdi. FSRS’nin diğer mevcut eşlemeleri `test_kao_fsrs.js` içindeki 24 yayın vektörüyle de PASS.
- Undo, pencere/streak ve kolay eklemeyi geri aldı; aynı kolay kart tekrarlanmadı; çıkış + yeni oturum eski yardımcı kuyruğunu taşımadı.
- Ladder/B/R1’la sunulan 5 harf çipli build görevi 3 yanlış durumunda da 5 çip ve 5 gerçek HTML düğmesi sundu; harf çiplerine dört-şık sınırı uygulanmadı.

Uygulama yalnız `quranLearn.js` içindeki uyarlama/notlama/kuyruk bağlantılarını değiştirir. Harf/sıralama görevleri cap dışında kalır; kolay aday gerçek görev kurucusunda B/R1 MC olacak biçimde seçilir; gerçekten sunulmuş yardım task’ın UI görev nesnesinde grade 2 olarak tutulur; kolay task retry ile çoğaltılmaz. `kaoGrade` normal eşlemesi, FSRS parametreleri, içerik, ladder/hash, kalıcı alan ve şema değiştirilmedi. Sıkı çalışma zamanı bütçesini korumak için aynı uyarlama bölümündeki üç yinelenen açıklama satırı kaldırıldı; davranış satırları değişmedi.

## Kart testleri

| Komut | Exit | Sonuç |
| --- | ---: | --- |
| `node tests/kao/test_k3p_dda.js` | 0 | 14 kontrol; gerçek görev/HTML, grade 2/4, undo, dedupe, restart |
| `node tests/kao/test_k3p_ladder.js` | 0 | A=522/1000; 32 build örneği; kaygıdaki gerçek build 5 çip |
| `node tests/kao/test_kao_fsrs.js` | 0 | 24 yayımlanmış vektör, grade mapping ve predictedR |
| `node tests/kao/test_kao_queue.js` | 0 | 20 deterministic task, kuyruk/interleave matrisleri |
| `node tests/kao/test_k3p_resume.js` | 0 | 7 resume/retry/ödül kontrolü |

## DENETLEYICI.md §4 G0 + G1

G0 canlı listedeki komutları ve exit’leri: `git status --short --branch` 0; `git rev-parse HEAD` 0; `git diff --check` 0; `node --check app.js`, `sync.js`, `app/core/quranLearn.js`, `app/core/quranLearnFlow.js`, `app/core/quranLearnViews.js` her biri 0; `node .claude/skills/run-seyma/driver.mjs` 0; `node .claude/skills/run-seyma/zikr-harness.mjs` 0 (95/95); `node kao3-premium/duzeltme-plani/araclar/durum.mjs --check` 0; `--sonraki` 0 ve K3PD-09; `node tests/kao/test_k3pd_control.js` 0 (33 negatif, 34 K3PD politika, 6 legacy pin politikası).

G1’de `test_kao_migration.js`, `test_kao2_migration.js`, `test_kao_fsrs.js`, `test_kao_queue.js`, `test_kao_requirements.js`, `test_kao_render.js`, `test_kao2_navigation.js`, `test_kao2_a11y.js`, `test_kao2_inventory.js`, `test_kao2_design_contract.js`, `test_kao_pronunciation_contract.js`, `test_kao_phonics_contract.js`, `test_k3p_mount.js`, `test_k3p_focus_lock.js`, `test_asset_pin_freshness.js`, `test_iip_22.js`, `kao-plan-check.mjs` ve `kao-verify-contrast.mjs` exit 0. A11y 14 kontrol; inventory 83 test + 4 yardımcı/fixture; kontrast 756 çift, eşik altı 0; asset pin 61 taze, 2 K3PD-32’ye ertelenmiş, engelleyici bayat pin 0 (bu, release PASS’i değildir); IIP-22 14/14.

Perf kaynağı önceden incelendi: `KAO2_WRITE_BASELINE=1` tek yazma koşulu; test `tests/kao/fixtures/kao2-perf-baseline.json`’a `flag:'wx'` ile yazar. Değişken unset doğrulandı ve baseline SHA-256 `302cfcc85422c346a62fb2e9b62df8a9f64c8ec362099adc5d40a35bce29d384` kaldı. İzole varsayılan koşuda göreli +25% bant, steady 8.572 ms ile 6.36 ms sınırını aştı; mutlak kontroller daha önce geçti. DENETLEYICI’nin izin verdiği yalnız göreli istisnayla `KAO2_ACCEPT_SLOW_HOST=1 node tests/kao/test_kao2_perf_budget.js` exit 0: content 184.591 KiB, runtime 135.996 KiB (136 KiB mutlak tavanın altında), CSS 15.877 KiB, p95 22.493 ms ve steady 3.493 ms (ikisi de 40 ms mutlak tavanın altında). Bir paralel G1 koşusundaki p95 149 ms ölçümü CPU yüküyle kirlenince perf tek başına tekrarlandı; mutlak limit değiştirilmedi.

## Kapsam ve kapanış sınırları

- `App.kao*` atama sayısı 45. `app.js`, `sync.js`, `app/core/state.js`, `quranLearnFlow.js`, `quranLearnViews.js`, `index.html`, `sw.js` diff’i boş; pin, migration ve kalıcı şema değişmedi.
- PROMPTLAR’da yalnız K3PD-09 allowlist satırı exact yollara çevrildi; bu değişiklik kullanıcı izniyle yapıldı. Başka kart satırı değişmedi.
- Görsel/screenshot, ağ, kişisel veri, token, gerçek hesap, push, merge, tag, deploy yok. Release approval `NOT_APPROVED` olarak kaldı.
- DURUM/GUNCEL-DURUM/KAYIT bağımsız `PASS` sonrası `done` ve `nextPrompt=K3PD-10` ile eşlendi; tek exact-path yerel commit bu kartın kapanış adımıdır.

## Bağımsız salt-okur denetim — PASS

Bağımsız denetçi, eski HEAD kaynağını bellekteki VM’e vererek güncel DDA’yı çalıştırdı; beş beklenen kusur kırmızı oldu: normal görev 4≠3, kolay görev 4/build≠2, pencere değişimi sonrası grade 4≠2, streak değişimi sonrası grade 4≠2 ve kolay retry duplicate. Repository dosyası bu replay sırasında yazılmadı. Güncel kaynakta DDA 14/14, ladder’da kaygı durumundaki gerçek build 5 çip/5 HTML düğmesi, FSRS 24 vektör, queue 20 görev + 1000 interleave ve resume 7 kontrol PASS oldu. G0 ve G1’in perf dışı komutları tekrar exit 0 verdi; state ve exact diff denetlendi.

Denetçi izole varsayılan perf koşusunda p95 9.488 ms / steady 5.419 ms ölçtü; göreli bant geçti. Flag’li tekrar p95 11.308 ms / steady 6.688 ms ölçtü. Uygulayıcının ayrı varsayılan koşusu 8.572 ms ile göreli 6.36 ms bandını aşmıştı; bu gerçek başarısızlık KAYIT’ta tutuldu ve yalnız planın izin verdiği göreli-istisna flag’iyle tekrarlanan koşu kullanıldı. Tüm koşularda mutlak 40 ms tavanı ve boyut tavanları korunmuştur. Baseline yazımı kapalıydı ve hash aynı kaldı.

Bağımsız PASS kapsamı: gerçek davranış, kaynak diff’i, başlangıç/korunan hashler, exact allowlist, App.kao*=45, schema/migrate/pin sınırları, DURUM/KAYIT uyumu, releaseApproval=NOT_APPROVED ve K3PD-10’un yalnız aday olması.

## Kapanış eşleşmesi

Bağımsız PASS ve exact aday satırı düzeltmesinden sonra kapanış kapıları exit 0 verdi. K3PD-09 DURUM/KAYIT `done/PASS`; GUNCEL-DURUM aynı hükmü taşıyor; `nextPrompt=K3PD-10`. K3PD-10 yalnız sıradaki aday olarak bildirilir, bu oturumda başlatılmaz. Release approval `NOT_APPROVED`; push, merge, tag, deploy ve görsel çekimi yok.
