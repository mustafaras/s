# KAO2-00 — K-1 bütçe ve süre kapısı, ses bütçesi, kaynakça teyidi
Tarih: 2026-09-28 · Dal: kao2-yeniden-tasarim · Önceki commit: a47a68f

## Yapılan
- KAO2-00 başlangıcı d4faa17; ilk BLOCKED kaydı a47a68f ve LEDGER seq 5. Kullanıcı üretici ve çıktısı optimizasyonunu açıkça onayladı; Dokun listesi bu iki dosyayla eşlendi.
- K-1: içerik ≤256 KiB, mevcut dört modül ≤164 KiB, varsa curriculum ≤48 KiB, runtime ≤80 KiB, CSS ≤14 KiB; 20 bağımsız boş VM'de nearest-rank p95 ≤40 ms; varsa KAO2-01 tabanına göre ≤+%25.
- R-C5 isteğe bağlı curriculum'u toplamda sayar; mevcut dört modülü ayrıca sınırlar. Ses bütçesi 16 →24 MiB (karar belgesindeki “MB” kodda 1024 tabanlı).
- Sözlük üreticisinin yalnız açma satırı değişti: 512 ayrı split/join taraması yerine PUA E000–E1FF kodlarını tek replace geçişinde çözme. Dictionary en çok 512 öğedir; dictionary sözcükleri harf/işaret sınıfından geldiği için PUA içermez. Yedekli kodların açılması anlamsal olarak aynı.
- `node tools/kao-lexicon-build.mjs --freeze` ile sözlük yeniden üretildi. Elle Arapça veya okunuş yazılmadı. Üretim çıktısında yalnız decoder satırı değişti; motor, state, shim ve cache pini değişmedi.
- 04 §4: 38 kaynağın tamamı işaretlendi; 37 ✓, Ausubel 1968 birincil teyit eksikliği nedeniyle ⚠︎. D-07 Güç sütununda (⚠︎). URL ve sınırlar [KAYNAKCA-TEYIT.md](KAYNAKCA-TEYIT.md) içinde. Kart adım 7'nin izin verdiği uyarılı teyit kapanışı; yeni künye/karar uydurulmadı.

## TDD
- İlk geçici 1 KiB tavan: FAIL `content 162177 bytes exceeds budget`.
- Gerçek tavanlarla ilk denemeler: FAIL p95 82,948 /80,949 ms >40.
- Onay sonrası değişiklik öncesi yeniden kırmızı: FAIL p95 96,490 ms >40.
- Üretici düzeltmesi + freeze sonrası yeşil: PASS p95 3,801 ms; tam P3 koşusunda 3,834 ms. Süre tavanı değiştirilmedi, ısınma/aykırı değer atma veya ön-çözülmüş veri kullanılmadı.
- Önceki BLOCKED kanıtı [BLOCKED-ILK-KANIT.md](BLOCKED-ILK-KANIT.md); bu belge nihai durumdur.

## Kapılar (P3)
[gate-receipts.json](gate-receipts.json) 163 komutun exit kodunu, çıktı hash'lerini ve son satırlarını içerir.
| Komut / aile | Sonuç |
|---|---|
| `node --check` app.js, sync.js, quranLearn.js, quranLexiconV1.js, kao-lexicon-build.mjs | 5 PASS |
| `tests/kao/test_*.js` | 18/18 PASS; freeze repro SKIP değil, 4 modül bayt-eş |
| `tests/app/test_*.js` | 77/77 PASS |
| `tests/panel/test_*.js` | 23/23 PASS |
| `tests/panel-v2/test_panel_v2_*.js` | 27/27 PASS |
| `tests/quran/test_*.js` | 9/9 PASS |
| `node tests/reminders/run-reminder-smoke.mjs` | PASS, 21 curated fixture |
| `node .claude/skills/run-seyma/driver.mjs` | PASS, boş/tohumlu state, açık/koyu tema |
| `node .claude/skills/run-seyma/zikr-harness.mjs` | PASS, 95/95 assertion |
| `node docs/kuran-ogreniyorum/tools/kao-verify-contrast.mjs` | PASS, 336 çift /0 ihlal |
| `node kuran-ogreniyorum-v2/tools/kao2-sync-check.mjs` | PASS, 1/28 done · next KAO2-01 · seq 7 |

Flow/Views/Curriculum henüz yok; P3 koşullu syntax komutları uygulanamaz. Ek kapılar: lexicon self-test PASS; audio self-test 4 klip/14223 B PASS; migration harness 67/67 PASS; değişen test/ses aracı syntax PASS; git diff --check PASS.

## Ölçümler / içerik eşliği
- İçerik: 162173 B =158,372 KiB (önce 162177 B); runtime: 50221 B =49,044 KiB; CSS: 7051 B =6,886 KiB.
- Tam kapı koşusu p95: 3,834 ms /40 ms. Bu makinedeki Node VM vekil ölçümüdür; cihaz veya gerçek tarayıcı süresi değildir. KAO2-01 tabanı henüz yok, relatif kapı o karttan itibaren çalışır.
- [verify-parity.cjs](verify-parity.cjs): eski a47a68f modülü ile bütün serileştirilebilir içerik, 524 lemma için byId çıktıları, roots/attribution ve freeze sözleşmesi PASS.
- Semantik SHA256: `d735edfdd284924b596aad93825ee12219e5fba25b629d926cbca8ea5998b4c9`.
- Dört içerik modülü gerçek üretim girdilerinden geçici kopyada tekrar üretildi; kaynaklarla bayt eşliği PASS. Yeniden üretim testi repoya yazmadı.

## Bilerek değişen testler
- R-C5 toplam 160 →256 KiB; ayrıca mevcut modüller ≤164 KiB: K-1 kullanıcı kararı. Büyüme sınırı kaldırılmadı.
- Yeni perf fixture'ının 1 KiB tavanı yalnız kırmızı ispatıydı; kalıcı 256 KiB ve süre 40 ms. Hiçbir mevcut davranış beklentisi zayıflatılmadı.

## Kanıt düzeyleri
- Kaynak/test: PASS; tam P3, migration ve içerik/freeze eşliği doğrulandı. Kaynakça 37 teyit +1 açık işaret.
- Yayın: yok; push/deploy/tag/main merge yapılmadı; yayın pini 20260927g kaldı.
- Cihaz: yok; tarayıcı/sunucu açılmadı, hesap/secret/kullanıcı verisi okunmadı. Açık/koyu tema yalnız headless kanıtıdır.

## Sürprizler / backlog / sınır
Eski sözlük yükleyicisi süre bütçesini aşıyordu; onaylı iki dosya kapsamıyla çözüldü. Ausubel birincil teyidi ve §4 dışındaki metin içi kaynakların ayrı denetimi açık nottur; 38 künye işaretlenmesi kararların etki büyüklüklerini yeniden doğruladığımız anlamına gelmez. K-3 okuyucu/lisans, G2/G3 ve L2 uzman işleri ileriki kartların kapılarıdır. KAO2-01 çalıştırılmadı.
