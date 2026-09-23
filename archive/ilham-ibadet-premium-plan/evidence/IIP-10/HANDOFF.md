# IIP-10 devir

- **Ajan / rol / tarih:** copilot / frontend-integrator / 2026-09-21.
- **Yetkili kapsam:** kullanıcının "yalnız IIP-10 adımını uygula (Öncü arama ve
  filtre); go apply be perfect" talimatı; commit/push/deploy **yok**.
- **CWD / branch / HEAD:** `/Users/m_ras/Desktop/seyma` / `main` /
  `3ccfa70411a30ac15d1d9241874895ec41226dab`.
- **Kart durumu:** `done`; IIP-09 done, DEC-07 approved; aktif lock yok.
- **Başlangıçtaki dirty dosyalar:** `.vscode/`, `jev-gate/`, `tests/jev-gate/`,
  `ilham-ibadet-premium-plan/NEW-SESSION-STARTER.md` (hepsi untracked, dokunulmadı).
- **Bu oturumda değişen dosyalar:** `app/core/saygi.js`, `app.js`,
  `app/styles.css`, `tests/app/test_iip_10.js` (yeni), **sekiz** pin fixture'ı
  (üç FX2 + dört app_surface + v3_welcome), plan kaydı + `evidence/IIP-10/*`.
- **diffHash:** manifest dosyasının SHA-256 değeri (`evidence/IIP-10/manifest.md`).

## Davranış

Öncü koleksiyonu artık **isimli liste birincil**dir: her satır ad, alan, tür·çağ ve
gerçek okundu metni taşır; tek dokunma hedefidir. 100 kutuluk numara gridi kapalı
bir ikincil `<details>` özetine indirildi. Arama alanı + iki filtre grubu (Alan:
Tümü/Bilim/Sanat · Okuma: Tümü/Okunanlar/Okunmayanlar) eklendi. Türkçe
normalizasyon (`İ/I/ı/i` + aksanlar) **yalnız arama indeksine** uygulanır; içerik,
`data` şeması, geçiş ve sync değişmedi. Sorgu yalnız `ui` oturumluk kanalında
yaşar; hedef-bölge boyama odak ve caret'i korur.

## Test

IIP-10 **61/61**, Saygı 20/20, IIP-09 22/22, IIP-04 26, zikir harness 95/95,
driver PASS, FX2 6/6, premium 9/9, Kur'an 9/9, reminder smoke 73+21, shell gate
PASS; plan-check, syntax, state-rebind, modal-focus, modularization ve
`diff --check` PASS. **Tam regresyon:** `tests/app` 60/60, `tests/panel` 23/23,
`tests/panel-v2` 27/27 — hepsi PASS. Kayıt: `evidence/IIP-10/commands.log`,
`evidence/IIP-10/source.md`.

## Eksik kabul

- Yalnız bağımsız insan incelemesi değil: `reviewer=copilot` (self-review).
- Tarayıcı ekran görüntüsü, ekran okuyucu, fiziksel cihaz ve yayın kabulü yok.
- `README`/`docs` güncellemesi gerekmedi; kart plan dokümanlarını değiştirmedi.

## Bilinen risk / engel

- DEC-07: `App` yüzeyi +1 (718 → 719; atama 556 → 557; `app.js` handler 554 → 555).
  Yalnız **beş** fixture pinlendi; `onclick=391` korundu.
- Düzeltme kaydı: ilk raporda altı uyuşmazlık "önceden var olan" sayılmıştı; ikisi
  (`test_app_surface_daily_boundary.js`, `test_v3_welcome.js`) **bu kartın**
  handler'ı yüzünden kırılmıştı. HEAD iş ağacıyla karşılaştırılarak bulundu ve
  düzeltildi.
- `tools/fx-coverage.mjs --gate` exit 1 döner — M7 için **onaylı** 0.62 tavanı;
  bilinen ve kabul edilmiş durum, yeni bir kusur değil.

## Geri alma / veri uyumluluğu

- Geri alma: `app/core/saygi.js`, `app.js`, `app/styles.css` ve üç FX2 pininin
  diff'i dar bir commit ile geri alınır.
- Yeni kalıcı veri **yok**; arama sorgusu/filtreleri kalıcı depoya yazılmaz, bu
  yüzden IIP-19 uyumluluk sözleşmesi devreye girmez. Geçiş (migration) gerekmez.

## Süreç

Sunucu veya tarayıcı başlatılmadı. Gerçek token / `localStorage` / kişisel veri
kullanılmadı; `seyma-data`'ya yazılmadı.

## Sonraki yetkili eylem

IIP-11 (Okuyucu etkileşimleri) **yalnız ayrıca yetkilendirildiğinde**; bu oturumda
başlanmadı. Kesin durma sınırı: commit/push/deploy/tag yok.
