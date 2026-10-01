# Kur'an Arapçası Öğreniyorum (KAO) fixture ailesi

Bu klasör, KAO modülünün ağsız ve sentetik Node/VM fixture'larını barındırır.
Fixture'lar gerçek tarayıcı, gerçek hesap, token, kişisel veri veya
`mustafaras/seyma-data` kullanmaz. Repo kökünü çözmek için ortak
`tests/repo-root.js` yardımcısı `require('../repo-root')` ile kullanılır;
bu klasörde ikinci bir kök çözücü tutulmaz.

## Planlanan fixture'lar

| Fixture | Durum | Amaç |
|---|---|---|
| `test_kao2_design_contract.js` | KAO2-02 | Canlı CSS ve boş/tohumlu 12 görünüm: baseline ihlal sayımları, strict hedef kapısı; beş ayarın açık/kapalı switch semantiği |
| `test_kao2_perf_budget.js` | KAO2-00 | K-1 gzip tavanları; boş VM içinde 20 tekrar p95 ≤40 ms, varsa KAO2-01 tabanına göre ≤+%25 |
| `test_kao_lexicon_contract.js` | planlandı | Sözlük şeması, doğrulama ve boyut sözleşmesi |
| `test_kao_lexicon_coverage.js` | planlandı | 77.430 token hedefi ve kapsam bantları |
| `test_kao_migration.js` | planlandı | `ensureQuranLearn` migration ve idempotentlik |
| `test_kao_fsrs.js` | planlandı | FSRS referans vektörleri ve monotonluk |
| `test_kao_queue.js` | planlandı | Kuyruk bütçesi, serpiştirme ve deterministik seed |
| `test_kao_render.js` | planlandı | Overlay, erişilebilirlik, klavye ve hedef boyutu |
| `test_kao_boundary.js` | planlandı | Registry sınırı, shim ve dört yükleme listesi |
| `test_kao_panel_projection.js` | planlandı | Gizlilik güvenli panel özeti ve eksik alan dayanıklılığı |
| `test_kao_phonics_contract.js` | planlandı | Harf, minimal çift, ses kimliği ve transliterasyon sözleşmesi |
| `test_kao_privacy.js` | planlandı | Bellek-içi mikrofon ve aynı-origin ses sınırı |
| `test_kao_requirements.js` | planlandı | Bağlayıcı R-A/R-B/R-C kabul kontrolleri |
| `test_kao_user_tasks.js` | planlandı | Üç kullanıcı görevinin headless senaryosu |
| `test_kao_independence.js` | planlandı | KAO-IIP bağımsızlığı ve hub fallback sözleşmesi |
| `test_kao_freeze_repro.js` | KAO-FIX-01 | Dört içerik modülünün araçlarla `$TMPDIR` kopyasında bayt-eş yeniden üretimi; girdi yoksa SKIP |
| `test_kao_surah_import.js` | KAO-FIX-02 | Kısa sûre çalışma kitabı içe alma kapısı: boş/kopya/İngilizce/doğrulayıcı-tarih denetimi ve tablo gidiş-dönüşü (sentetik) |
| `test_kao_state_budget.js` | KAO-FIX-09 | KF-10 koruması: `daily` budanmaz (400 gün korunur), `ensureQuranLearn` idempotent; boyut yalnız bilgi |
| `test_kao2_view_resolution.js` | K2F-02 | Yığınsız `ui.kaoView` çözümü ve gerçek `kaoNav`/`kaoSetView` ile 12 parametresiz + 4 parametreli görünüm; `helpers/kao-harness.js` (bootKao/freshUser/openView/walkLesson) öz-testi |
| `test_kao2_handler_surface.js` | K2F-03 | İşaretlemede çağrılan her `App.kao*` ↔ `app.js` tek satırlık shim ↔ `window.SeymaQuranLearn`; `KNOWN_MISSING=['kaoS0']` yalnız küçülür (K2F-12 boşaltır) |
| `test_kao2_mastery.js` | K2F-05…08 | Ünite ustalığı: A saf Flow (`masteryPlan`, `unitMastery`); B gerçek handler'larla oturum + kayıt; C `repairPlan`, onarım oturumu, `skip-mastery`, 12 ünite simülasyonu; D görünümler (ayrı Ustalık satırı, Bugün birincil + "Şimdilik atla", özet, Yol `aria-current`, `u<n>` taşı) ve dokunarak uçtan uca (sıfır kullanıcı → Ünite 2, v1 → Ünite 4); ~28 sn |
| `test_kao2_grammar_tasks.js` | K2F-09…11 | Gramer 1–3/3: A) modül 93 doğrulanmış âyet örneğini taşır (kaynakla birebir, bütçe); B) fail-closed (geçersiz görev gösterilmez, ders planında ikame, kuyruk/tekrar süzgeci); C) görevler örnekten ve kavram tablosundan kurulur (83/86 şablon, L2 listesi, rehberlik soldurma, kavram sayfasında örnek+not, 109 ders yürüyüşü, ardışık tür yok) |
| `test_kao2_s0.js` | K2F-12…15 | Seviye 0: `kaoS0` yüzeyi (12 dersin 12'si çökmeden çizilir, R-04/R-06), harfsiz ders içeriği, 5 aşama + puanlı alıştırma (6–8 soru, aşama başına ≤1 birincil düğme), Bugün/ilk açılıştan 3 dokunuşla S0, 12 ders uçtan uca → Fâtiha, Besmele taşı yalnız `s0.12` sonrası |
| `test_kao2_settings.js` | K2F-16 | Ayarlar: niyet satırı `onboarding.intent`'ten okunur, `kaoSetIntent` 5 vakit + kendim kabul eder, geçersiz değer reddedilir (R-07); handler pini |
| `test_kao2_hub.js` | K2F-16 | Hub kartı: niyet varsa öneri o vaktin saatiyle (geçtiyse "yarın"), yoksa sıradaki-vakit davranışı |
| `test_kao2_lesson_coherence.js` | K2F-19 | Ders tutarlılık kapısı (K5-03), üç ölçüm: ETİKET (başlık/hedef kategorisi ↔ lemma ≥%60, kavram kategorisi; kip/zaman/seslenme QAC tablosundan) · ÖRNEK (kip dersinde gösterilen örnek âyetlerin ≥%60'ı hedef kipi taşır) · ANLAM (tematik derste başlık sözcükleri lemma anlamlarında); ve KÖK ("bir kökten" derslerinde lemmaların ≥%60'ı aynı kök); `KNOWN_MISMATCH` 18 · `KNOWN_EXAMPLE_MISMATCH` 11 · `KNOWN_SEMANTIC_GAP` 1 (/109), yalnız küçülür, çıta = liste uzunluğu |
| `test_kao2_lemma_morph.js` | K2F-19 | `tests/kao/fixtures/qac-lemma-morph.json` (QAC 0.4'ten SAYILMIŞ PERF/IMPF/IMPV/VOC; araç `tools/kao2-lemma-morph-build.mjs`): şema, 524 lemma, `total` = sözlük `freq`, satır tutarlılığı, bilinen dilbilgisi gerçekleri, ayrıştırıcı (CRLF, `l:IMPV+` sayılmaz), girdi varsa bayt-eşit yeniden üretim (yoksa SKIP) |

Fixture'lar ilgili uygulama kartında tek tek eklenecek; bu başlangıç promptu
üretim kodu veya çalıştırılabilir fixture eklemez.
