---
name: run-seyma
description: Run and verify the Şeyma app safely with headless Node VM harnesses; never open the app in a browser.
---

# Şeyma — Güvenli Headless Doğrulama

Şeyma statik vanilla JS/HTML/CSS uygulamasıdır. Bu skill'in amacı uygulamayı
gerçek tarayıcıda açmadan `app.js` render yolunu ve dar state sınırlarını
kontrol etmektir.

## Kritik veri güvenliği

Uygulama browser'da açılmaz ve generic local server ile test edilmez. Eski bir
browser profili `seyma-reset-v1` içinde gerçek token taşıyabilir; uygulama
açılışında `save()` çalışarak `mustafaras/seyma-data` deposunu clobber edebilir.

Tüm canonical harness'lar:

- `node:vm` kullanır.
- Gerçek browser, kullanıcı localStorage'ı, token ve gerçek veri yüklemez.
- `fetch` ya hiç çalışmaz ya da sentetik mock ile sınırlıdır.
- Kullanıcı verisi, `mustafaras/seyma-data`, push ve deploy işlemi yapmaz.

## Canonical harness seti

| Dosya | Sorumluluk |
|---|---|
| `driver.mjs` | App boot, onboarding/seeded render, tab/theme/card etkileşimi ve reminder yüzeyinin temel smoke kontrolü |
| `zikr-harness.mjs` | İlham & İbadet, Zikirmatik, Saygı, kıble, Hicri ve ibadet raporu headless kontrolü |
| `verify-state-helper-boundary.mjs` | Read-only helper boundary; production extraction değildir |
| `verify-state-migration-boundary.mjs` | Sentetik eski state ile gerçek `migrate()` parity kontrolü |
| `verify-state-adapter-contract.mjs` + `state-adapter-scratch.mjs` | Production graph dışı dependency-bag sözleşmesi |

Eski fazlara ait profile/Quran/Zikir/reminder validator ve snapshot dosyaları
çalışma ağacında tutulmaz; gerektiğinde Git geçmişinden incelenir. Quran mail
workflow ve reply bridge alt klasörleri staged dış entegrasyon kodu olarak
ayrı korunur; bunlar bu app smoke setinin parçası değildir.

## Komutlar

Repo kökünden:

```bash
node .claude/skills/run-seyma/driver.mjs
node .claude/skills/run-seyma/zikr-harness.mjs
node .claude/skills/run-seyma/verify-state-helper-boundary.mjs
node .claude/skills/run-seyma/verify-state-migration-boundary.mjs
node .claude/skills/run-seyma/verify-state-adapter-contract.mjs
```

`driver.mjs` iki boot çalıştırır: boş onboarding state ve sentetik seeded
state. Ardından gerçek `App.go()`, tema ve kart etkileşimlerini sürer.
`zikr-harness.mjs` aynı VM yaklaşımıyla faith hub davranışını kontrol eder.

Panel `app.js` ile aynı uygulama değildir. Panel değişikliğinde browser yerine
syntax, script-tag balance ve `tests/panel/test_panel_*.js` fixture'ları kullanılır;
Panel-v2 ayrıca `tests/panel-v2/` altında çalıştırılır.

## Harness kuralları

- `app/core/constants.js`, `app.js`'den önce yüklenir.
- Timer'lar no-op'tur; polling gerçek callback çalıştırmaz.
- `fetch` resolving promise'a dönüştürülmez; bu, dış write'ın imkânsız kalması
  için load-bearing güvenlik sınırıdır.
- `sync.js` driver'a yüklenmez; app guard'ları sayesinde push yolu açılmaz.
- DOM stub yalnız gerekli `#app` ve `#root` kabuğunu sağlar; eksik stub ile
  gerçek fresh-render davranışı korunur.
- Yeni fixture eklenirse sentetik boundary, sabit saat ve no-network kanıtı
  açıkça belirtilir.

## Değişiklik sonrası minimum kapı

```bash
node --check app.js
node --check sync.js
node .claude/skills/run-seyma/driver.mjs
node .claude/skills/run-seyma/zikr-harness.mjs
```

Gerçek browser açılmaz. Live davranış, deploy veya kullanıcı cihazı kabulü bu
skill'in local headless PASS sonucu değildir.
