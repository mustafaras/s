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
| `test_kao_pronunciation_contract.js` | KAO-FIX | Latin okunuş sözleşmesi: kısa sûre kelimesi, sözlük lemması/örneği, gramer hücresi, görev seçenekleri ve çizilen satırlarda okunuş zorunlu; bilinen okunuşlar sabit |
| `test_kao_user_tasks.js` | planlandı | Üç kullanıcı görevinin headless senaryosu |
| `test_kao_independence.js` | planlandı | KAO-IIP bağımsızlığı ve hub fallback sözleşmesi |
| `test_kao_freeze_repro.js` | KAO-FIX-01 | Dört içerik modülünün araçlarla `$TMPDIR` kopyasında bayt-eş yeniden üretimi; girdi yoksa SKIP |
| `test_kao_surah_import.js` | KAO-FIX-02 | Kısa sûre çalışma kitabı içe alma kapısı: boş/kopya/İngilizce/doğrulayıcı-tarih denetimi ve tablo gidiş-dönüşü (sentetik) |
| `test_kao_state_budget.js` | KAO-FIX-09 | KF-10 koruması: `daily` budanmaz (400 gün korunur), `ensureQuranLearn` idempotent; boyut yalnız bilgi |
| `test_kao2_view_resolution.js` | K2F-02 | Yığınsız `ui.kaoView` çözümü ve gerçek `kaoNav`/`kaoSetView` ile 12 parametresiz + 4 parametreli görünüm; `helpers/kao-harness.js` (bootKao/freshUser/openView/walkLesson) öz-testi |
| `test_kao2_context_label.js` | ek iş (K2F-23 öncesi) | Ders oynatıcı bağlam satırı: draft ünitede "Ünite N" ön eki bir kez, sourced ünitede başlık korunur |
| `test_kao2_handler_surface.js` | K2F-03 | İşaretlemede çağrılan her `App.kao*` ↔ `app.js` tek satırlık shim ↔ `window.SeymaQuranLearn`; `KNOWN_MISSING=['kaoS0']` yalnız küçülür (K2F-12 boşaltır) |
| `test_kao2_mastery.js` | K2F-05…08 | Ünite ustalığı: A saf Flow (`masteryPlan`, `unitMastery`); B gerçek handler'larla oturum + kayıt; C `repairPlan`, onarım oturumu, `skip-mastery`, 12 ünite simülasyonu; D görünümler (ayrı Ustalık satırı, Bugün birincil + "Şimdilik atla", özet, Yol `aria-current`, `u<n>` taşı) ve dokunarak uçtan uca (sıfır kullanıcı → Ünite 2, v1 → Ünite 4); ~28 sn |
| `test_kao2_grammar_tasks.js` | K2F-09…11 | Gramer 1–3/3: A) modül 93 doğrulanmış âyet örneğini taşır (kaynakla birebir, bütçe); B) fail-closed (geçersiz görev gösterilmez, ders planında ikame, kuyruk/tekrar süzgeci); C) görevler örnekten ve kavram tablosundan kurulur (83/86 şablon, L2 listesi, rehberlik soldurma, kavram sayfasında örnek+not, 109 ders yürüyüşü, ardışık tür yok) |
| `test_kao2_s0.js` | K2F-12…15 | Seviye 0: `kaoS0` yüzeyi (12 dersin 12'si çökmeden çizilir, R-04/R-06), harfsiz ders içeriği, 5 aşama + puanlı alıştırma (6–8 soru, aşama başına ≤1 birincil düğme), Bugün/ilk açılıştan 3 dokunuşla S0, 12 ders uçtan uca → Fâtiha, Besmele taşı yalnız `s0.12` sonrası |
| `test_kao2_settings.js` | K2F-16 | Ayarlar: niyet satırı `onboarding.intent`'ten okunur, `kaoSetIntent` 5 vakit + kendim kabul eder, geçersiz değer reddedilir (R-07); handler pini |
| `test_kao2_hub.js` | K2F-16 | Hub kartı: niyet varsa öneri o vaktin saatiyle (geçtiyse "yarın"), yoksa sıradaki-vakit davranışı |
| `test_kao2_arabic_tab.js` | K2F-26 ek | Arapça sekmesi (saygi.js) + gerçek KAO hub kartı uçtan uca: gizliyken "Ders kartı gizli · Göster", yedek mesaj yok, geri getirince ders girişi |
| `test_kao2_lesson_coherence.js` | K2F-19 | Ders tutarlılık kapısı (K5-03), üç ölçüm: ETİKET (başlık/hedef kategorisi ↔ lemma ≥%60, kavram kategorisi; kip/zaman/seslenme QAC tablosundan) · ÖRNEK (kip dersinde gösterilen örnek âyetlerin ≥%60'ı hedef kipi taşır) · ANLAM (tematik derste başlık sözcükleri lemma anlamlarında); ve KÖK ("bir kökten" derslerinde lemmaların ≥%60'ı aynı kök); `KNOWN_MISMATCH` 0 · `KNOWN_EXAMPLE_MISMATCH` 1 (u07.01) · `KNOWN_SEMANTIC_GAP` 0 (/109), 6 gerekçeli `CONCEPT_EXEMPT`, yalnız küçülür, çıta = liste uzunluğu |
| `test_kao2_lemma_morph.js` | K2F-19 | `tests/kao/fixtures/qac-lemma-morph.json` (QAC 0.4'ten SAYILMIŞ PERF/IMPF/IMPV/VOC; araç `tools/kao2-lemma-morph-build.mjs`): şema, 524 lemma, `total` = sözlük `freq`, satır tutarlılığı, bilinen dilbilgisi gerçekleri, ayrıştırıcı (CRLF, `l:IMPV+` sayılmaz), girdi varsa bayt-eşit yeniden üretim (yoksa SKIP) |
| `test_kao2_denetim.js` | K2F-38 | KAO2 denetimi R-01…R-10 kalıcı: ustalık kaydı · v1 kullanıcı · 109 ders gramer görevi (78 görev, 0 kusur) · S0 4 aşamalı oturum · `App.kao*` işaretleme↔app.js · 12 S0 dersi çökmeden · niyet satırı · 109 derste Uygula içeriği · yığınsız atama/kaoNav · kabul testi koşulsuz yazmaz; `tekrar-uret.cjs` tarihsel kalır; ~60 sn |
| `test_kao2_a11y.js` | KAO2-26 | Erişilebilirlik ve kontrast denetimi (06 §6–§7) |
| `test_kao2_components.js` | KAO2-04/05 · K2F-35/40 | Views bileşenleri: groupedList, switchRow, progressRing, choice (div + düğme kipi), feedbackSheet; kaçırma, erişilebilirlik, ölçü |
| `test_kao2_curriculum.js` | KAO2-07 | Müfredat omurgası (salt okunur, içerik modüllerinden bağımsız beklentiler) |
| `test_kao2_explain.js` | KAO2-18 | Hata sınıfına göre açıklamalar ve kavram çözümlü örnekler |
| `test_kao2_feedback.js` | KAO2-10 · K2F-31 | Cevap geri bildirimi paneli; ölçülen süre günlüğe (0–120 s), geri alma, gecikmeli sûre cevabı |
| `test_kao2_grammar_notes.js` | KAO2-15 | S-10 gramer notları kütüphanesi |
| `test_kao2_inventory.js` | D2F-08 | Bu envanterin koruması: her `tests/kao/test_*.js` burada tam adıyla bir satırda geçer, burada adı geçen her test diskte vardır, `helpers/` ve `fixtures/` içerikleri listelidir |
| `test_kao2_kabul.js` | KAO2-27 · K2F-36 | Kabul ölçütleri A-1…A-10, gerçek handler/render/alt süreç ölçümü (`KAO2_ACCEPT_SLOW_HOST=1` yalnız A-10 göreli bandını atlar) |
| `test_kao2_lesson_flow.js` | KAO2-12 · K2F-23 | Ders planı ve oynatıcı; Uygula adımı doğrulanmış örnek cümle |
| `test_kao2_migration.js` | KAO2-16 | Mevcut kullanıcı geçişi (05 §9), sentetik eski durumlar |
| `test_kao2_milestones.js` | KAO2-16 | Taş koşulları (07 §6) |
| `test_kao2_navigation.js` | KAO2-11 · K2F-27 | İlk açılış yönlendirmesi; NavBar tek üst çubuk, tek kapatma, diyalog adı LargeTitle'dan |
| `test_kao2_next_step.js` | KAO2-08 | "Sıradaki adım" motoru, tablo güdümlü |
| `test_kao2_onboarding.js` | KAO2-11/12 · K2F-30 | İlk açılış (S-01), yerleştirme, geçiş notu, A-1 ders başlangıcı; handler yüzey sayımı |
| `test_kao2_path.js` | KAO2-13 | S-03 yol ve S-04 ünite ekranları |
| `test_kao2_progress.js` | KAO2-24 · K2F-32/35 | İlerleme (S-12) birleşik ekranı |
| `test_kao2_reader.js` | KAO2-19 | Sûre bağlamı ve okuyucu v2 (S-09) |
| `test_kao2_review_apply.js` | KAO2-18 | K-4 onay taşıma kapısı (L0) |
| `test_kao2_roots.js` | KAO2-20 | Kök aileleri (S-11) |
| `test_kao2_summary.js` | KAO2-14 | Ders özeti |
| `test_kao2_syllable_audio.js` | KAO2-22 | Hece sesi hattı (K-3 kademe A); kayıt yoksa awaiting-recording |
| `test_kao2_text_review.js` | KAO2-17 | K-4 L0 otomatik kapılar (kaynak, imlâ, yasak ifade, elle Arapça yok) |
| `test_kao2_today.js` | KAO2-09 | Bugün ekranı (S-02) |
| `test_kao2_word.js` | KAO2-25 · K2F-33 | Kelime detayı v2 (S-08) + panel aynası |

K2F-41 / D2F-08: `tests/kao/test_*.js` envanteri gerçek dosya listesine eşittir (55 test dosyası); `test_kao2_inventory.js` bunu zorlar. Yeni test aynı committe buraya eklenir.

## Yardımcılar ve sabit veri

| Dosya | Amaç |
|---|---|
| `helpers/kao-harness.js` | Ortak harness: `bootKao`/`freshUser`/`openView`/`walkLesson`; gerçek handler'larla akışı sürer (öz-testi `test_kao2_view_resolution.js`) |
| `fixtures/fsrs-vectors.json` | FSRS referans vektörleri (`test_kao_fsrs.js`) |
| `fixtures/qac-lemma-morph.json` | QAC'tan sayılmış lemma biçim tablosu (`test_kao2_lemma_morph.js`) |

