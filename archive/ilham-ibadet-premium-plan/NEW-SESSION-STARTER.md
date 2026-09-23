# IIP — Yeni Oturum Starter

Bu dosyayı yeni oturumda önce ve tamamen oku. Sonra yalnız kullanıcı tarafından açıkça seçilen kartı uygula; sonraki karta kendiliğinden geçme.

## Mevcut teslim durumu

- CWD: `/Users/m_ras/Desktop/seyma`
- Branch: `main`
- Canlı HEAD / `origin/main`: `a6537feb4a511e524ca46b9d665e6806f455d885`
- Son commit: `feat(iip-05): refine pioneer reader visual quality`
- IIP durumu: `IIP-01`–`IIP-05` done, `completedCards=5/24`
- IIP-05: commit, feature-branch push, `main`e fast-forward merge, `main` push ve Pages deploy tamamlandı.
- Pages run: <https://github.com/mustafaras/s/actions/runs/35510804335>
- Canlı site: <https://mustafaras.github.io/s/>
- Cihaz/VoiceOver kabulü: `not_verified`
- Canlı kişisel veri yazma: `not_approved`
- `main` remote ile eşit; bu starter dosyası yerel untracked olarak korunuyor ve deploy commit’ine dahil edilmedi.

## IIP-05 özeti

Değişen ana yüzeyler:

- `app/core/saygi.js`: Öncü okuyucusunda portre yok/yüklenemedi fallback’i, uzun başlık ve metin yapısı, kaynak/lisans footer’ı, erişilebilir kilit açıklaması ve sabit `Okudum` eylemi.
- `app/styles.css`: 43rem makale genişliği, 68ch okuma ölçüsü, uzun Türkçe metin sarma, kaynak footer’ı, safe-area alt boşluğu, bounded fixed action ve dar ekran/reduced-motion kuralları.
- `tests/app/test_iip_05.js`: 28 source/style/fixture contract kontrolü.
- Kanıt: `ilham-ibadet-premium-plan/evidence/IIP-05/`
- Devir: `ilham-ibadet-premium-plan/evidence/IIP-05/HANDOFF.md`

Mevcut scroll-gate, `markSaygiRead` ve okuma dönüş akışı korunmuştur. Hesap, `data`, `migrate()`, sync, handler gövdeleri ve çağrı sırası değiştirilmedi.

## Son doğrulama

Başarılı kapılar:

- `node --check app/core/saygi.js` — PASS
- `node tests/app/test_iip_05.js` — 28/28
- `node tests/app/test_iip_04.js` — 25/25
- `node tests/app/test_saygi_boundary.js` — 20/20
- `node tests/app/test_modal_focus_containment.js` — PASS
- `node .claude/skills/run-seyma/zikr-harness.mjs` — 95/95
- `node .claude/skills/run-seyma/driver.mjs` — PASS
- `node tools/shell-inventory.mjs --gate` — PASS
- `node ilham-ibadet-premium-plan/tools/plan-check.mjs --render` — PASS
- `git diff --check` — PASS
- Pages `validate` ve `deploy` — PASS
- Canlı HTTP 200 ve canlı `saygi.js`/`styles.css` IIP-05 içerik kontrolü — PASS

## Yeni oturum başlangıç sırası

1. `AGENTS.md` ve `docs/GELISTIRME-PLANI.md` ilgili başlangıç kurallarını oku.
2. `ilham-ibadet-premium-plan/IIP-STATE.json` ve `tracking/CURRENT-STATE.md` oku.
3. `git status --short --branch` ve `git log -1 --format='%H%n%s'` çalıştır.
4. `node ilham-ibadet-premium-plan/tools/plan-check.mjs` çalıştır.
5. Kullanıcı yeni kartı açıkça seçerse yalnız o kart için `node ilham-ibadet-premium-plan/tools/session-brief.mjs IIP-NN` çalıştır.

## Kesin durma sınırı

Bir sonraki planlı kart `IIP-06 — İbadet ve kıble görsel birlik`tir; yeni oturumda IIP-06 yetkisi yoktur. Kullanıcı açıkça IIP-06’yı seçmeden üretim dosyasına dokunma, state’e kart yetkisi yazma, test/evidence üretme veya sonraki karta geçme.

IIP-05 yeniden uygulanmayacak; kanıtı `evidence/IIP-05/` altındadır. IIP-06 için yetki gelirse önce canlı `session-brief.mjs IIP-06` çıktısını oku. IIP-06 brief’inin izinli yüzeyini varsayma; yalnız canlı brief belirler.

## Korunan sınırlar

- `kuran-ogreniyorum/` kullanıcıya ait untracked klasördür; stage/commit etme.
- Gerçek token, localStorage, kişisel veri veya `mustafaras/seyma-data` yazma.
- Kontrollü yerel görsel QA yalnız `127.0.0.1:9000`, disposable profil, `forceSync=1` yok ve `seyma-sync-force` yok şartlarıyla yapılabilir; sunucuyu oturum sonunda kapat.
- Commit/push/merge/deploy yalnız açık kullanıcı talimatıyla yapılır.
- IIP-05 canlıdır; yeniden uygulama veya yeniden deploy gerekmez.
- Cihaz, VoiceOver ve kullanıcı tarafı kabulü bu starter tarafından doğrulanmış sayılmaz.

## Bu dosyanın oluşturulma amacı

Bu starter yalnız sonraki oturumun yön bulması içindir. IIP-05 teslim kanıtı değildir; asıl kanıt `IIP-STATE.json`, ledger ve `evidence/IIP-05/` altındadır.
