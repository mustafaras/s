# K3PD-10 — Harf kurma görevine doğrulanmış anlam ipucu

## Yetki ve başlangıç

- Bu oturum yalnız K3PD-10 içindir. Branch `k3pd-denetim-duzeltmeleri`; base/başlangıç HEAD `dec3ace0db0991a592685fa989cad1ec423b9c3d`; başlangıç ve son `HEAD...origin/main` `4/0`.
- Başlangıç `durum.mjs --check` PASS, `--sonraki` K3PD-10; K3PD `releaseApproval=NOT_APPROVED`. Eski K3P programının `37/37`, `nextPrompt=null` kaydı ayrıdır.
- Kullanıcının açık izniyle PROMPTLAR.md’de yalnız K3PD-10 allowlist satırı exact yollara çevrildi. K3PD-08/09 satırlarına ve CSS’ye dokunulmadı.
- Tam değişiklik kapsamı: `app/core/quranLearn.js`, `tests/kao/test_k3p_build.js`, `tests/kao/test_k3p_ladder.js`, PROMPTLAR.md’de yalnız K3PD-10 satırı, DURUM.json, GUNCEL-DURUM.md, KAYIT.md ve bu kanıt dosyası.
- Başlangıçta kirli üç korunan dosyanın SHA-256 değerleri son ölçümde de aynı: KAPANIS `d8e8419e2849b9eec922e537bca7100149fdfee6120ce850fda77128f8af9bcd`; README `1aee47cdd05726f4a5966748ae3f786bd79d2e394dd37f3ec7b083f2d36eed0f`; GORSEL-KANIT `d7627027bba21007550f0a5c76130a4d9f11b7b896d001a60e9333c81ffeed28`. Stage edilmediler.

## Gerçek görev davranışı ve kırmızı→yeşil

- `kaoBuildLetters` build görevini yalnız `lemma.verified === true` iken kurar; soru ipucu doğrulanmış Türkçe anlamdır. Build görevinde `direction`, `isNew`, `retry`, kart/kol bağlamı korunur. `kaoBuildTask`, anlamı boşsa cevaplanamaz R1/R2 görevi de döndürmez. Oturum materyalizasyonu görevi olmayan öğeyi yalnız geçici UI kuyruğundan çıkarır; FSRS, günlük yanıt sayısı veya kalıcı şema güncellenmez.
- Gerçek VM `kaoBuildTask`→`kaoTaskHTML` çıktısı: kart `w:l_min_1f6fa6:ar>tr`, görev `build/R3/A`, `direction=tr>ar`, `isNew=true`, `retry=true`; görünür erişilebilir soru `Anlamı: -den, -dan`; 2 hedef harf + 2 çeldirici = 4 seçim. Harekeli `مِن` ve harekesiz `من` cevap ilk HTML’de görünmüyor. Cevap/şık etiketleri değiştirilince anlam ipucu aynı kalıyor.
- İlk kaynak replay’inde yeni ipucu beklentisi `task.prompt` tanımsız olduğu için exit 1 verdi. İlk uygulama sonrasında bağımsız denetçi ayrıca boş verified anlamın R2’ye düşüp `<h2 class="kao-question"></h2>` ürettiğini gösterdi ve FAIL verdi (KAYIT seq68’de korunuyor). Son düzeltme sonrası aynı eksik-anlam sınaması `kaoBuildTask=null` ve güvenli boş başlık; gerçek `kaoStart` zincirinde hedef öğe UI kuyruğunda yok, kalan öğeler gerçek task nesnesine sahip ve FSRS/günlük kayıt aynı kalıyor. Güncel build testi 10/10 PASS.
- Güncel sözlük ve fixture uygunluk koşuluyla 274 doğrulanmış, 2–6 harfli ve phonics harflerine çevrilebilir lemma var; eksik birincil anlam `0/274`. Önceki 275 sayısı denetçiyle yeniden üretilemediğinden 274 olarak düzeltilmiştir.
- Ladder sınırları: A kolunda `522/1000`, 32 build task; B kolu R1/build dışı. Kaygı görevi 5 harf çipi ve HTML’de 5 düğme çiziyor.

## Kart ve G0/G1 doğrulaması

| Canlı komut | Sonuç |
| --- | --- |
| `node tests/kao/test_k3p_build.js` | Exit 0; 10 kontrol. Doğrulanmış ipucu, cevap sızıntısı yok, verified tür şartı, eksik anlamda gerçek kuyruk/grade sınırı. |
| `node tests/kao/test_k3p_ladder.js` | Exit 0; A=522/1000, 32 build, B/R1, kaygı 5 çip/5 düğme. |
| `node tests/kao/test_k3p_dda.js` | Exit 0; 14/14 (yardımlı grade 2, normal grade korunur, gerçek görev/handler). |
| `node tests/kao/test_kao_fsrs.js` | Exit 0; 24 yayınlanmış FSRS vektörü. |
| `node tests/kao/test_kao_queue.js` | Exit 0; 20 deterministik görev, 1.000 interleave. |
| `node tests/kao/test_k3p_resume.js` | Exit 0; 7 kontrol. |
| `node tests/kao/test_k3p_distractors.js` | Önceki denetim koşusu exit 0: 25 tohum × 2 yön, 1.084 yeni + 1.119 yerleşik görev, yinelenen çeldirici yok. Tarihsel sıra tabanı bulunmadığından yalnız eski sıra karşılaştırması doğrulanamaz; bu karşılaştırma PASS sayılmadı. |
| `node tests/kao/test_kao_pronunciation_contract.js` | Exit 0; 524/524. |

DENETLEYICI.md §4’ten alınan G0 komutları canlı kaynak değişikliğinden sonra yeniden çalıştırıldı: `git status --short --branch`, `git rev-parse HEAD`, `git diff --check`, `node --check app.js`, `sync.js`, `app/core/quranLearn.js`, `app/core/quranLearnFlow.js`, `app/core/quranLearnViews.js`, varsayılan `node .claude/skills/run-seyma/driver.mjs`, `node .claude/skills/run-seyma/zikr-harness.mjs`, `durum.mjs --check`, `durum.mjs --sonraki`, `node tests/kao/test_k3pd_control.js`; hepsi exit 0. Driver 35, zikr harness 95/95, kontrol 33 negatif + 34 K3PD + 6 legacy pin politikası PASS. Harness’ler sentetik Node/VM’dir; driver `--dump` kullanılmadı.

DENETLEYICI.md §4 G1 komutlarının hepsi son kaynakta exit 0: migration, KAO2 migration (15 kontrol), FSRS, queue, requirements (hedefli update 10.261 ms <50 ms), render, navigation, a11y (552 yüzey/14 kontrol), inventory (83 test + 4 yardımcı), design contract, pronunciation (524/524), phonics contract, K3P mount (19 render), focus lock, asset pin freshness (61 taze/2 ertelenmiş/0 engelleyici), IIP-22 (14/14), `tools/kao/kao-plan-check.mjs`, `tools/kao/kao-verify-contrast.mjs` (756 çift, 0 eşik altı). `KAO2_WRITE_BASELINE` değişkeni unset; perf baseline’a yazılmadı.

Perf istisnası açıkça kaydediliyor:

- Varsayılan `node tests/kao/test_kao2_perf_budget.js`: exit 1, yalnız göreli bant; steady 10.329 ms > `baseline p95 × 1.25 = 5.087625 ms`.
- DENETLEYICI §4’teki izinli `KAO2_ACCEPT_SLOW_HOST=1` koşusu: exit 0; içerik 184.591 KiB, runtime 135.912 KiB (139,174 B / 139,264 B sınırı), CSS 15.877 KiB, p95 21.812 ms, steady 10.003 ms. Yalnız göreli bant atlandı; mutlak 256/136/16 KiB ve p95 40 ms tavanları geçti.
- Baseline önce/sonra SHA-256 aynı: `302cfcc85422c346a62fb2e9b62df8a9f64c8ec362099adc5d40a35bce29d384`.

## Bağımsız salt-okur denetim — PASS

Bağımsız denetçi son kaynak/diff üzerinde önceki empty-meaning FAIL’in giderildiğini, gerçek VM task/HTML ve transient queue davranışını doğruladı. Build 10 kontrol, ladder A=522/1000 + 32 build + B/R1, DDA 14/14, FSRS 24 vektör, queue 20 görev/1.000 interleave, resume 7, pronunciation 524/524 ve distractors 1.084 yeni + 1.119 yerleşik görevde yinelenmeyen seçenekler geçti. A11y 14/552 ve bağımsız G0/G1 kontrolleri geçti. İzole perf koşusu p95 17.434 ms / steady 8.250 ms ile mutlak tavanları geçti; yalnız göreli bant slow-host istisnasıyla atlandı, baseline yazılmadı. Tarihsel distractor seçim-sırası tabanı eksik olduğu için yalnız tarihsel sıra karşılaştırması UNVERIFIABLE kaldı; bu kart kabulüne dahil değil.

## Sınırlar ve güncel durum

- `App.kao* = 45`. `app.js`, `sync.js`, `app/core/state.js`, Flow/Views, `index.html`, `sw.js`, K3P state/ledger pinleri ve K3PD allowlist dışı yollar değişmedi. Şema, migrate, FSRS parametreleri, içerik ve A/B hash değişikliği yok.
- Release `NOT_APPROVED`; publish/push/merge/tag/deploy ve screenshot yapılmadı. Gerçek hesap, browser profili, kişisel veri, token veya ağ kullanılmadı.
- Bağımsız salt-okur yeniden denetim PASS verdi; DURUM/KAYIT/EVIDENCE done/PASS ile eşlendi. Exact allowlist yolları tek yerel commit için stage edildi; korunan kirli dosyalar dışarıda kaldı. K3PD-11 sıradaki aday olarak bildiriliyor, bu kayıt ona yetki vermez. K3PD release NOT_APPROVED; push/merge/tag/deploy/screenshot yapılmadı.
