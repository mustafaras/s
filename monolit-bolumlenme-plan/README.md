# Şeyma — `app.js` Monolit Bölümleme Programı

**Sürüm:** 2.1 · **Tarih:** 2026-09-13 · **Durum:** `completed` · **Uygulanan prompt:** 60/60 (`MON-60`)

Bu klasör, Şeyma'nın `app.js` IIFE monolitini davranışı
koruyarak `app/core/*` modüllerine ayırmak için tek planlama otoritesidir. Bu
bir **kademeli kod uygulama paketidir**: Dalga 1–11 (`MON-01..MON-57`)
tamamlandı; `migrate`, `getDay`, `createDefaultData`, state/sync, domain,
render ve appSurface registryleri 24 hedef kararına göre ayrıldı. App-owned
data rebind, save, DOM/focus, timer/listener, network ve `window.App` sıraları
korundu. `MON-55` production/harness yükleme paritesini, `MON-56` helper tek
sahipliğini, `MON-57` ise tüm no-network regression zincirini kapattı.
`MON-58` ile bu uygulama gerçeği roadmap, README, module map ve karar linklerine
senkronlandı; `MON-59` kararları ve `MON-60` seri kapanışı ile plan **60/60**
olarak kapandı. Yerel PASS, release/deploy/device kabulü değildir.

## Seri kapanışı

Kapanış belgesi: [`MON-SERI-KAPANIS-BELGESI.md`](deliverables/MON-SERI-KAPANIS-BELGESI.md).
Bu belge 12 dalgayı, 24 registry API/owner envanterini, S1–S8 / I1–I6 /
M1–M4 kararlarını, tam no-network regression kanıtını ve rollback/devir
protokolünü toplar. `MON-STATE.json` artık `status=completed`,
`completedPrompts=60` ve `nextPrompt=null` taşır; `releaseApproval=not_approved`
ve push/deploy, browser/device, gerçek token/veri ve `mustafaras/seyma-data`
sınırları değişmeden kalır. Yeni çalışma bu serinin devamı olarak varsayılmaz;
ayrı açık kullanıcı onayı ve kendi state/kanıt zinciri gerekir.

## Sınır ve otorite

- Okuma sırası: `AGENTS.md` → `docs/GELISTIRME-PLANI.md` →
  `docs/monolit-bolumlenme-haritasi.md` → `premium-fx-plan/MODULARIZATION.md`
  → bu klasördeki durum zinciri.
- 24-hedef-modül haritası `MODULARIZATION.md` v2.1; gerçek iş alanı kanıtı
  `docs/monolit-bolumlenme-haritasi.md`dir. Graphify topluluk etiketi modül
  sınırı değildir.
- Güncel karar zinciri: [`MON-S3-MODUL-SAHIPLIK-MATRISI.md`](deliverables/MON-S3-MODUL-SAHIPLIK-MATRISI.md),
  [`MON-D11-LOAD-SIRASI-RAPORU.md`](deliverables/MON-D11-LOAD-SIRASI-RAPORU.md),
  [`MON-D11-DELEGE-ENVANTERI.md`](deliverables/MON-D11-DELEGE-ENVANTERI.md),
  [`MON-D11-TAM-REGRESSION-RAPORU.md`](deliverables/MON-D11-TAM-REGRESSION-RAPORU.md)
  ve [`MON-D12-DOKUMAN-SENKRON-CHECKLIST.md`](deliverables/MON-D12-DOKUMAN-SENKRON-CHECKLIST.md).
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
