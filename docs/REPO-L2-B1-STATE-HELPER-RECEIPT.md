# REPO-L004 — L2-b/B1 state helper read-only fixture

**Tarih:** 2026-08-02
**Durum:** `ready_for_review`
**Kapsam:** `app.js` içindeki `empty*` kökleri ve arşiv normalizer’ları için
yalnızca izole kaynak/dependency-bag fixture’ı.
**Runtime değişikliği:** Yok.
**Kullanıcı verisi:** Okunmadı/yazılmadı.

## Yapılan iş

`.claude/skills/run-seyma/verify-state-helper-boundary.mjs` eklendi. Harness:

- `app.js`i boot etmeden yalnız hedef function declaration’larını brace-aware
  kaynak tarayıcısıyla çıkarır;
- açık bir dependency bag (`uid`, Kur’an/Zikirmatik sabitleri,
  `soulActivityById`) ile `node:vm` içinde değerlendirir;
- gerçek `localStorage`, `fetch`, `SeySync`, `data`, `migrate()` veya
  `sync.js` yüzeyini yüklemez;
- boş köklerin taze ve JSON-kararlı olmasını;
- `normBook`, `normTitle`, `normTrack`, `normSoulItem` için bozuk sentetik
  değerlerin güvenli şekle girmesini, bilinmeyen alanların korunmasını ve
  ikinci geçişte kimliğin değişmemesini ölçer.

Bu bir runtime extraction değildir. `app.js` boot/migrate gövdesi ve
persistence çağrıları bu adımda dokunulmadan kaldı.

## Kaynak hash kanıtı

| Helper | SHA-256 | Byte |
|---|---|---:|
| `emptyZikrRoot` | `22f4d989ea566afabefbc6eb0eef57a1cdc7f01be32f641446967075760d54ad` | 428 |
| `emptySaygiRoot` | `4a003979368b0deb297c19418e61bdb405dd57b686fb0ee8f4030fa0b4545cbb` | 77 |
| `emptyQuranJourney` | `948d329310350170d125545f5bb35b0577ed4a54617ca8d61d498821ac570c3d` | 179 |
| `emptyLibrary` | `792f7a18a75b6a79a9dc0ca1a012da6683ab86056a628ceda60d45fb4a5bb031` | 83 |
| `emptyWatchlist` | `f733a99801f394980f6e077d9c54ed39526e1531f8737417a30559f7f41cb50` | 88 |
| `emptyMusic` | `4f7430a79811c5e971d782acd8fdfec66bd5f080a5b92ee22b017a2c85686c4a` | 84 |
| `emptySoulArchive` | `bdf4b91e8aa7657915c2a43208a3a0c8212a252d8b766ebed1b1416a7c5af6ef` | 49 |
| `normBook` | `ac8af283b61fa5382c7b2f827996239d751c18826fa03c9a5cf08ea9691aed65` | 835 |
| `normTitle` | `ce0708dac78bceda16596585781cde7870b8e3b28f139de68c188e5831a7c169` | 829 |
| `normTrack` | `7c7f5d1375516cb1a50306da2037f9e01aa3ff607d8f56faa8d3129908060b62` | 520 |
| `normSoulItem` | `75de6f1313694b9f2cc713a27a85c50ebbfa590ee08016738c6e5b47928e60be` | 681 |

## Doğrulama

- `node --check .claude/skills/run-seyma/verify-state-helper-boundary.mjs` — PASS.
- `node .claude/skills/run-seyma/verify-state-helper-boundary.mjs` — **64/64**.
- Fixture kaynak yüzeyi: localStorage/fetch invocation yok; `app.js` boot yok.
- B1 fixture’ı gerçek uygulama state’i, `migrate()`, sync veya kullanıcı verisi
  üzerinde çalışmadı.

## Sonraki güvenli sınır

B1 yalnız helper parity başlangıcıdır. Bir sonraki adım B2’de `migrate()` için
sentetik fixture’ları aynı black-box boot/persistence harness’i içinde yeniden
çalıştırmak ve önceki migration çıktısıyla eşdeğerlik ölçmektir. B2 tamamlanıp
onaylanmadan `app/core/state.js`, `index.html` script sırası veya `save()`
entegrasyonu yapılmayacak; B4 persistence yetkisi açılmayacaktır.

Gerçek tarayıcı/server/ağ açılmadı; `data/`, `sync.js`, localStorage ve
`mustafaras/seyma-data` değişmedi. Commit, push, merge ve deploy yapılmadı.
