# Şeyma — `app.js` Monolit Bölümleme Programı

**Sürüm:** 2.1 · **Tarih:** 2026-09-09 · **Durum:** `in_progress` · **Uygulanan prompt:** 28/60 (`MON-28`)

Bu klasör, Şeyma'nın `app.js` IIFE monolitini davranışı
koruyarak `app/core/*` modüllerine ayırmak için tek planlama otoritesidir. Bu
bir **kademeli kod uygulama paketidir**: Dalga 1–5 (`MON-01..MON-25`)
tamamlandı; `migrate`, `getDay` ve `createDefaultData` state registry'sine
taşındı, canlı rebind sahipliği app.js'te bırakıldı. `MON-16` syncGlue callback
sahipliğini app.js'te kilitledi, `MON-17` save gövdesini syncGlue registry'sine
aldı, `MON-18` state+sync Dalga 4 kapanışını no-network kanıtıyla tamamladı.
Dalga 5'in dört manevi domaini ayrıldı: `MON-19` prayer, `MON-20/21` zikir
motor+görünüm, `MON-22` quran, `MON-23` saygı; `MON-24` çapraz regression
raporuyla, `MON-25` Dalga 5 kabul denetimiyle kapandı (canlı ölçümde I1–I6/M1–M4
farkı yok; tek onarım: `driver.mjs` FILES listesine SKY serisinin atladığı
`skyFx.js` eklendi). `MON-26` motivation gövdelerini `app/core/motivation.js` SeymaMotivation
registry'sine aldı (23 shim + App-owned mutation kabuğu; birleşik kaynakta
onclick 391/App 718 birebir). `MON-27` crisis güvenlik metni, modal HTML'i ve
craving görünüm yardımcılarını `app/core/crisis.js` SeymaCrisis registry'sine
aldı; SOS/tile/modal çıktısı parent/current ile birebir, App-owned mutation ve
focus sınırı korundu. `MON-28` journal text/count/streak/savedAt yardımcıları ile
Günlük Işığı kartı ve modalını `app/core/journal.js` SeymaJournal registry'sine
aldı; save sırası, modal focus ve `bugun` kartı parent/current ile birebir
korundu. Dalga 6 devam ediyor (`MON-29` health sırada).

## Sınır ve otorite

- Okuma sırası: `AGENTS.md` → `docs/GELISTIRME-PLANI.md` →
  `docs/monolit-bolumlenme-haritasi.md` → `premium-fx-plan/MODULARIZATION.md`
  → bu klasördeki durum zinciri.
- 24-hedef-modül haritası `MODULARIZATION.md` v2.1; gerçek iş alanı kanıtı
  `docs/monolit-bolumlenme-haritasi.md`dir. Graphify topluluk etiketi modül
  sınırı değildir.
- Dal `premium-fx-gorsel-yuzey` **LOCAL-ONLY**dir (MON zinciri
  `zikirmatik-manuel-zikir` dalını içerir; üstünde 76 lokal SKY/PREM/FX2
  commit'i var). Push, merge, tag, deploy ve `mustafaras/seyma-data` yazımı
  ayrı kullanıcı onayı gerektirir.
- Tarayıcı, gerçek profil, token, gerçek localStorage ve canlı veri yoktur.
  Doğrulama yalnız `run-seyma` Node/VM harness'leri ve sentetik fixture'lardır.

## Dosya ağacı

| Yol | Rol |
|---|---|
| [`UYGULAMA-PROMPTLARI.md`](UYGULAMA-PROMPTLARI.md) | 60 sıralı kart, ortak sözleşme ve her kartın sekiz aşamalı çalışma sayfası |
| [`MON-STATE.json`](MON-STATE.json) | Makine-okur durum, dalgalar, kapılar ve ayrı onaylar |
| [`.anti-amnesia/CURRENT-STATE.md`](.anti-amnesia/CURRENT-STATE.md) | İnsan-okur durum, canlı baseline ve FX mirası |
| [`.anti-amnesia/LEDGER.md`](.anti-amnesia/LEDGER.md) | Sekiz kolonlu, yalnız-eklemeli uygulama kaydı |
| [`DEVIR-PROMPTU.md`](DEVIR-PROMPTU.md) | Kaynak soğuk-başlangıç brief'i; korunur, değiştirilmez |
| `deliverables/` | Ancak ilgili MON-S kararında oluşturulacak karar ve kapanış belgeleri |

## Oturum protokolü

1. `MON-STATE.json`, `CURRENT-STATE.md`, `LEDGER.md` ve aktif promptu oku.
2. `blockedPrompt` doluysa veya çalışma ağacı prompt dışı değişikse dur; önce
   kapsam sahibiyle çöz. Başka prompta atlama ve otomatik reset/checkout yapma.
3. Aktif promptun canlı grep çıpalarını yeniden ölç, sapmayı LEDGER'a yaz.
4. Yalnız o promptun kapsamını uygula; gerçek kapıların tamamı geçmeden commit
   yapma. Başarılıysa kod + durum zinciri aynı **yerel** commit'tedir.
5. Her dalga kapanışında tam regression çalışır. Yerel PASS, deploy veya cihaz
   kabulü değildir.

Her kartın aynı numaralı **Çalışma sayfası** uygulanacak şeyin sahibini, canlı
arama komutunu, değişiklik sırasını, allowed/forbidden sınırını, test paketini
ve fail-closed el değiştirme biçimini verir. Kart ile çalışma sayfası çelişirse
çalışma sayfası değil canlı kaynak ve karar kayıtları üstündür.

## Güvenli komutlar

```bash
node --check app.js && node --check sync.js
node .claude/skills/run-seyma/driver.mjs
node .claude/skills/run-seyma/zikr-harness.mjs
node tests/app/test_modularization_boundary.js
node tests/app/test_faz_minus11_boundary.js
node tests/app/test_date_utils_boundary.js
node tests/app/test_helpers_boundary.js
node tests/app/test_prayer_boundary.js
node tests/app/test_faz10_sync.js
node tests/app/test_syncGlue_save_boundary.js
node tests/panel/test_faz11_panel.js
for f in tests/app/test_premium_*.js; do node "$f"; done
node tests/reminders/run-reminder-smoke.mjs
```

`tests/quran/test_quran_*.js` ve panel/panel-v2 aileleri, yalnız ilgili alan
taşındığında veya dalga kapanışında eklenir. Dosya yoksa komut uydurulmaz.
