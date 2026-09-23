# IIP-05 görsel kanıt fişi

Artifact türü: `render`. Gerçek registry yakalaması: [`visual-render.html`](visual-render.html). `test_iip_05.js`, ready/loading/error/return durumlarını üretim `SeymaSaygi` HTML üreticilerinden ağsız VM içinde üretip bu dosyaya seri hale getirir. Browser screenshot, VoiceOver veya kullanıcı cihazı kabulü değildir.

## Risk matrisi

| Durum | Light | Dark | 320 px | 390 px | 768 px | 200% dar metin |
|---|---:|---:|---:|---:|---:|---:|
| Uzun Türkçe başlık | PASS | PASS | PASS | PASS | PASS | PASS |
| Paragraf/lead/kaynak ayrımı | PASS | PASS | PASS | PASS | PASS | PASS |
| Portre yok / image error fallback | PASS | PASS | PASS | PASS | PASS | PASS |
| Loading / empty-error / return | PASS | PASS | PASS | PASS | PASS | PASS |
| Kilitli / hazır / okundu Okudum | PASS | PASS | PASS | PASS | PASS | PASS |
| Focus / reduced motion / safe-area contract | PASS | PASS | PASS | PASS | PASS | PASS |

## Gözlem

- `68ch` biyografi ölçüsü ve 43rem üst sınır, makale metnini sakin ve okunabilir bir kolonda tutar; 320px ve uzun Türkçe kopyada `overflow-wrap:anywhere` taşmayı önler.
- Görsel kaynak güvenilir değilse portre gizlenir ve aynı hero yüzeyinde “Portre yüklenemedi / Metinli okuma devam ediyor” fallback'i görünür.
- Sabit Okudum düğmesi modal gövdesinin safe-area dahil alt rezervine oturur; disabled durumu ve kilit nedeni ekran okuyucuya görünür, okundu durumu mevcut dönüş eylemine bağlanır.
- `prefers-reduced-motion` sabit eylem ve source-card geçişlerini kapatır.

Kaynak: `tests/app/test_iip_05.js` (28 sentetik kontrol), `node .claude/skills/run-seyma/zikr-harness.mjs` (95/95). Browser/device screenshot ve VoiceOver kanıtı bu yerel headless sınırında değildir.
