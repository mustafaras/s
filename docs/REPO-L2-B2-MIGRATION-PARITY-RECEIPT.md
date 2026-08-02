# REPO-L005 — L2-b/B2 sentetik migration parity

**Tarih:** 2026-08-02
**Durum:** `ready_for_review`
**Kapsam:** Mevcut `app.js` `migrate()` davranışının sentetik black-box
fixture’larla kayıpsızlık/idempotence gözlemi.
**Runtime değişikliği:** Yok.
**Kullanıcı verisi:** Okunmadı/yazılmadı.

## Harness sözleşmesi

`.claude/skills/run-seyma/verify-state-migration-boundary.mjs` gerçek
`app.js`i yalnız `node:vm` içinde boot eder. Dört sentetik sınıf ve bir
idempotence turu çalıştırır:

1. **Minimal eski kayıt:** eksik köklerin/version/settings varsayılanlarının
   oluşması ve bilinmeyen top-level sentinel korunumu.
2. **Kısmi eski gün:** mood/not/intention, tikler, okuma/izleme/dinleme
   kayıtları ve arşiv backfill’inin korunması.
3. **Zengin gerçekçi state:** `data.psych`, profil cevapları, Zikirmatik
   lifetime/tefekkür, Kur’an video-history/not, prayer ve bilimsel profil
   sentinel’larının birlikte korunması.
4. **Bozuk tipler:** null/string/yanlış dizi türlerinin çökmeden güvenli
   default’a inmesi; geçerli gün/top-level alanların kaybolmaması.
5. **İdempotence:** zengin fixture’ın ikinci black-box boot’unda derin parity.
   Yalnız app boot telemetrisi (`lastOpenedAt`) ve canlı gözlem heartbeat’i
   (`days.*.liveSession`) migration dışı projection’dan çıkarılır; kullanıcı
   alanları karşılaştırmada kalır.

`localStorage` yalnız bellek içi stub’dır. `sync.js` yüklenmez, `SeySync`
oluşmaz, `fetch` never-settling stub’dır ve gerçek ağ çağrısı gerçekleşmez.

## Doğrulama

- `node --check .claude/skills/run-seyma/verify-state-migration-boundary.mjs` — PASS.
- `node .claude/skills/run-seyma/verify-state-migration-boundary.mjs` — **32/32**.
- Fixture güvenlik yüzeyi: `fetches=0`; yalnız sentetik localStorage stub
  yazımı; private `seyma-data` erişimi yok.
- Tam uygulama regresyonları: driver PASS; Zikirmatik **90/90**; sync
  **64/64**; panel **50/50**; profil migration PASS; Zikirmatik migration
  **41/41**; Kur’an migration **59/59**; `git diff --check` PASS.

## Sınır ve sonraki adım

B2 mevcut migration’ın davranış kanıtıdır; `migrate()` dışarı açılmadı,
`app/core/state.js` oluşturulmadı, `index.html` script sırası ve `save()`
değişmedi. Bu receipt runtime ayrıştırma yetkisi vermez. Sonraki adım, ayrı
bir onay/plan kapısıyla dependency-bag adapter’ının scratch-only tasarımıdır;
önceki gövdeyle parity sağlanmadan üretim script’ine bağlanmayacaktır.

Gerçek tarayıcı/server/ağ açılmadı. `data/`, `sync.js`, localStorage ve
`mustafaras/seyma-data` değişmedi. Commit, push, merge ve deploy yapılmadı.
