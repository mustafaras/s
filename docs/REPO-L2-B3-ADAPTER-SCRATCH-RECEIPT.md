# REPO-L006 — L2-b/B3 dependency-bag adapter scratch

**Tarih:** 2026-08-02
**Durum:** `ready_for_review`
**Kapsam:** Gelecekteki state helper/migration modülünün dependency-bag
sözleşmesini production graph’ına bağlamadan executable scratch katmanında
tasarlamak.
**Runtime değişikliği:** Yok.
**Kullanıcı verisi:** Okunmadı/yazılmadı.

## Eklenen scratch yüzeyi

`.claude/skills/run-seyma/state-adapter-scratch.mjs` production `index.html`
tarafından yüklenmez ve `app.js`/`sync.js` import etmez. Yalnızca şu gelecekteki
sözleşmeyi tanımlar:

- `createStateDependencyBag()` — `now`, `uid`, `catalogs`,
  `featureMigrations`, `logger` değerlerini explicit ve frozen bag olarak
  üretir;
- `invokeStateHelperScratch()` — helper çağrısından önce input’u deep-clone
  eder ve original/working/result tanı yüzeylerini döndürür;
- `createStateHelperAdapterScratch()` — ilerideki adapter çağrı biçimini
  gösterir, fakat gerçek `migrate()` veya production state kullanmaz.

`catalogs` ve `featureMigrations` de clone/freeze edilir. Böylece helper’ın
global `data`, localStorage, sync veya ağ üzerinden gizli bağımlılık kurması
yerine bütün dış girdiler tek bir dependency bag’den geçer.

## Doğrulama

`.claude/skills/run-seyma/verify-state-adapter-contract.mjs`:

- adapter kaynak yüzeyinde localStorage/fetch/SeySync invocation yokluğunu;
- production `app.js`/`sync.js` import edilmediğini;
- bag’in frozen ve deterministik override’larla kurulmasını;
- unknown top-level, `data.psych` ve Kur’an sentinel’larının korunmasını;
- caller input’un mutate edilmemesini;
- wrapper’ın global `App` yüzeyi oluşturmamasını ölçer.

Sonuç: **20/20 PASS**.

Bu katman yalnız contract kanıtıdır. `app/core/state.js` oluşturulmadı,
`migrate()` dışa açılmadı, `index.html` script sırası değişmedi, `save()`/
localStorage/sync entegrasyonu yapılmadı. B1/B2 fixture’ları ve mevcut app,
panel, sync migration regresyonları ayrıca yeşil kaldı.

Gerçek tarayıcı/server/ağ açılmadı. `data/`, `sync.js`, localStorage ve
`mustafaras/seyma-data` değişmedi. Bu turda commit, push, merge ve deploy
yapılmadı; branch yalnız scratch review için hazırlandı.

## Sonraki güvenli sınır

Bir sonraki runtime adımı değildir. Önce bu sözleşme kullanıcı tarafından
incelenmeli; ancak ayrı kabul kapısından sonra `migrate(input, deps)` parity
adapter’ı scratch üzerinde gerçek mevcut gövdeyle karşılaştırılabilir. Panel
prompt paketi bu state kapısından bağımsızdır; panel ledger’ı ayrıca açık prompt
seçimi ister.
