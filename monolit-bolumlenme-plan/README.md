# Şeyma — `app.js` Monolit Bölümleme Programı

**Sürüm:** 2.1 · **Tarih:** 2026-09-02 · **Durum:** `in_progress` · **Uygulanan prompt:** 1/60 (`MON-01`)

Bu klasör, Şeyma'nın 18.957 satırlık `app.js` IIFE monolitini davranışı
koruyarak `app/core/*` modüllerine ayırmak için tek planlama otoritesidir. Bu
bir **kademeli kod uygulama paketidir**: yalnız `MON-01` (baseline + karar)
tamamlandı; üretim kodu taşınmadı. Sonraki promptlar ayrı ve açık kullanıcı
onayıyla, sırayla yürür.

## Sınır ve otorite

- Okuma sırası: `AGENTS.md` → `docs/GELISTIRME-PLANI.md` →
  `docs/monolit-bolumlenme-haritasi.md` → `premium-fx-plan/MODULARIZATION.md`
  → bu klasördeki durum zinciri.
- 24-hedef-modül haritası `MODULARIZATION.md` v2.1; gerçek iş alanı kanıtı
  `docs/monolit-bolumlenme-haritasi.md`dir. Graphify topluluk etiketi modül
  sınırı değildir.
- Dal `premium-fx-local` **LOCAL-ONLY**dir. Push, merge, tag, deploy ve
  `mustafaras/seyma-data` yazımı ayrı kullanıcı onayı gerektirir.
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
node tests/app/test_faz10_sync.js
node tests/panel/test_faz11_panel.js
for f in tests/app/test_premium_*.js; do node "$f"; done
node tests/reminders/run-reminder-smoke.mjs
```

`tests/quran/test_quran_*.js` ve panel/panel-v2 aileleri, yalnız ilgili alan
taşındığında veya dalga kapanışında eklenir. Dosya yoksa komut uydurulmaz.
