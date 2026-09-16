# MONOLIT-BOLUMLENME Program Taraması ve Arşivi — 2026-09-09

**Tarama:** `monolit-bolumlenme-plan/` prompt serisinin (MON-01…60) durumu,
önceden uygulanan kartların sağlığı ve tek düzeltme (MON-25 kapsamında).
Bu belge, FX/SKY/PREM taramasının kardeş kaydıdır; monolit programının
premium-fx-plan tarafındaki arşiv kanıtıdır.

## 1. Nerede kalındı (durum)

| Alan | Değer |
|---|---|
| Son tamamlanan | `MON-25` (Dalga 5 kabul denetimi, bu commit) |
| Sıradaki | `MON-26` — motivation domain modülü (Dalga 6 ilk kartı) |
| İlerleme | 25/60 · Dalga 1–5 kapalı (Dalga 5: 7/7) · Dalga 6–12 açık |
| State | `monolit-bolumlenme-plan/MON-STATE.json` · `.anti-amnesia/CURRENT-STATE.md` · `LEDGER.md` seq 37 |
| Dal | `premium-fx-gorsel-yuzey` LOCAL-ONLY; MON zinciri `zikirmatik-manuel-zikir` dalını içerir |
| Onay | `approvalRequired: true` — MON-26 yalnız yeni açık kullanıcı onayıyla başlar |

## 2. Önce uygulanan kartların doğrulaması (2026-09-09 koşumu)

Tüm MON-STATE `verificationGate` kapıları aynen koşuldu, tümü PASS (exit 0):

- **driver.mjs** (onarım sonrası) + **zikr-harness** 95/95
- State üçlüsü: B1 `0 failure` · B2 `60/60` · B3 `20/20` · rebind (MON-15) `37/37`
- Dalga 2–4 boundary'leri: modularization `64/64` · Faz−1.1 `27/27` ·
  date-utils `59/59` · helpers `31/31` · save boundary `19/19`
- Dalga 5 manevi registry'leri: prayer `19/19` · zikir `17/17` · quran `20/20` · saygı `20/20`
- Regresyon aileleri: Faz10 sync `69/69` · large-file `15/15` · manual `21/21`
  · modal focus · fx2 ailesi `66/66` · premium ailesi `249/249` · Quran ailesi
  · reminder smoke `20/20` · panel faz11 `50/50`
- `node --check app.js && sync.js` OK · `git diff --check` temiz

MON-19..23'te taşınan prayer/zikir/quran/saygı gövdeleri
`app/core/*.js` registry'lerinde canlı; app.js imza-koruyan shim + canlı
bag + rebind sahipliği yerinde.

## 3. Bulunan ve onarılan tek kusur (driver S4 paritesi)

| # | Bulgu | Sınıf | Çözüm |
|---|---|---|---|
| 1 | SKY serisi `app/core/skyFx.js`'i `index.html` ve `zikr-harness.mjs` FILES listesine eklemiş, **`driver.mjs` FILES listesini atlamıştı** → `driver.mjs` MON-04 `assertLoadOrder` kontratında `harness FILES ≠ index.html sırası` ile **exit 1** (MON-24 kapanışından sonra bozulmuştu) | Harness paritesi (MON-S4) — üretim hatası DEĞİL | `driver.mjs` FILES dizisine `'app/core/skyFx.js'` aynı konuma eklendi (tek satır, timeTheme→reminderCatalog arası); driver onboarding+seeded boot ile exit 0 |

**Ders (LEDGER seq 37'ye de işlendi):** Yeni `app/core/*` modülü eklerken
MON-S4 parite zinciri **dört** listedir: `index.html` script sırası,
`driver.mjs` FILES, `zikr-harness.mjs` FILES ve
`tests/app/test_state_rebind_boundary.js` boot listesi. Bir halka bile
atlanırsa load-order fixture'ı fail-closed durur — istenen davranış.

## 4. MON-25 kabul ölçümü (özet; tam tablo `MON-D5-ACCEPTANCE.md`)

- app.js 17.332 → 17.804 satır; `App.fn` 553 → 556 (yalnız +3 additive voice
  handler FX-P-86/87); onclick 354 = 354; gerçek `data=` atama tokeni 9 = 9
  (tamamı app.js'te) — **I1–I6/M1–M4 farkı yok**.
- FX delta (`SeyAudio +3/+3`, `SeyFx +21/+26`, `SeyTimeTheme +1`) bu dalın
  MON-24 sonrası 76 lokal SKY/PREM/FX2 commitinin belgelenmiş ekleri;
  manevi registry sahipliğine dokunmaz.

## 5. Bu programın premium-fx-plan ile ilişkisi

- `premium-fx-plan/MODULARIZATION.md` monolit programının **yürütme
  stratejisidir** (24 hedef modül haritası); `docs/monolit-bolumlenme-haritasi.md`
  iş alanı kanıtıdır.
- FX-2/SKY/PREM serileri kapanmıştır (15/15 + 28/28); monolit Dalga 6+
  kartları bu dalgaların bıraktığı app.js temeli üzerinde yürür. FX çağrı
  yüzeyi MON-S2 manifestiyle izlenmeye devam eder.
- Bu taramadan sonra monolit ilerlemesi `monolit-bolumlenme-plan/.anti-amnesia/`
  zincirinde taşınır; bu belge yalnız arşiv kanıtıdır ve güncellenmez.

**Kanıt seviyesi:** K1 (test) yerel PASS · K2 (dump/ölçüm) kayıtlı · K3 cihaz
kabulü yok · push/merge/tag/deploy YOK (kural gereği, ayrı onay).