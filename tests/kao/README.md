# Kur'an Arapçası Öğreniyorum (KAO) fixture ailesi

Bu klasör, KAO modülünün ağsız ve sentetik Node/VM fixture'larını barındırır.
Fixture'lar gerçek tarayıcı, gerçek hesap, token, kişisel veri veya
`mustafaras/seyma-data` kullanmaz. Repo kökünü çözmek için ortak
`tests/repo-root.js` yardımcısı `require('../repo-root')` ile kullanılır;
bu klasörde ikinci bir kök çözücü tutulmaz.

## Planlanan fixture'lar

| Fixture | Durum | Amaç |
|---|---|---|
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

Fixture'lar ilgili uygulama kartında tek tek eklenecek; bu başlangıç promptu
üretim kodu veya çalıştırılabilir fixture eklemez.
