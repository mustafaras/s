# MON-25 — Dalga 5 Kabul Denetimi (Acceptance Report)

**Tarih:** 2026-09-09 · **Öncül:** MON-24 · **Sınıf:** kapanış/kanıt kartı
**Kod değişimi:** YOK (bu kart üretim koduna dokunmaz; yalnız kanıt + durum zinciri)

## Amaç

Dalga 5'in (MON-19..MON-24, manevi domainler) yalnız davranış-koruyucu
refactor olarak kapandığını, MON-24'ten sonraki dal geçmişindeki SKY/PREM/FX2
işlerinden hiçbirinin `data`, `migrate`, App handler sözleşmesi (I1–I6/M1–M4)
veya yükleme sırası (MON-S4) sınırını ihlal etmediğini canlı ölçümle
kapatır.

## 1. Canlı baseline (HEAD = `df6eed8`, app.js 17.804 satır)

| Ölçüm | MON-24 (`5314d38`) | HEAD (`df6eed8`) | Delta | Yorum |
|---|---|---|---|---|
| app.js satır | 17.332 | 17.804 | +472 | SKY-10 canvas motoru + PREM-03 stagger + FX-P-86/87 voice yüzeyi |
| `App.fn = function` | 553 | 556 | **+3** | Yalnız `App.setVoiceCloudVoice`, `App.setVoicePitch`, `App.setVoiceVoiceName` (FX-P-86/87, ekleme; silinen handler yok) |
| tüm `App.x =` token | 713 | 719 | +6 | +3 fn + yeniden yazımlar; isim/imza kaldırma yok |
| inline `onclick="App.` | 354 | 354 | 0 | I2 yüzeyi stabil |
| `data=` gerçek atama tokeni | 9 | 9 | 0 | M2: 2175 (bildirim), 3973 (boot), 3974, 5847 (start), 5267×2 (backfill try/finally), 8487 (import), 8491 (reset→null), 8538+17664 (late-boot) — tamamı app.js'te |
| `SeyAudio` satır/occurrence | 24 / 50 | 27 / 53 | +3 / +3 | FX-P-86/87 voice arayüzü + SKY-10 entegrasyon çağrıları; guard deseni aynı |
| `SeyHaptics` | 21 / 42 | 21 / 42 | 0 | Değişmedi |
| `SeyFx` | 2 / 4 | 23 / 30 | +21 / +26 | PREM-03 kademeli giriş tek sistemde (`.sey-stagger` + `--i`, `SeyFx.enter`), `sheetClose`, `isPremiumFxEnabled` çağrıları; PREM-01 `SeyFx.transition` kaldırıldı (0 call site) |
| `SeyTimeTheme` | 3 | 4 | +1 | SKY-10 `applySeasonal` çağrısı (guarded) |

Deltaların tamamı MON-24'ten **sonra** gelen 76 lokal SKY/PREM/FX2 commitinin
belgelenmiş ekleri; manevi registry'lerin (Prayer/Zikir/Quran/Saygı) sahiplik
sınırına dokunmaz. FX deltanın kaynağı `git log 5314d38..HEAD -- app.js` ile
ayrıca izlenebilir (`sky:`/`prem:` önekli commitler).

## 2. MON-S4 yükleme-paritesi bulgusu ve onarımı (bu kartın tek düzeltmesi)

**Bulgu:** SKY serisi `app/core/skyFx.js`'i `index.html`'e
`timeTheme.js → reminderCatalog.js` arasına eklemiş; `zikr-harness.mjs` FILES
listesi `8e1e3e0` ile hizalanmıştı ama **`driver.mjs` FILES listesi
atlanmıştı**. Sonuç: `node .claude/skills/run-seyma/driver.mjs` MON-04
`assertLoadOrder` kontratında `harness FILES ≠ index.html sırası` hatasıyla
exit 1 veriyordu (MON-24 kapanışından sonra bozulmuş kapı).

**Onarım (bu commit):** `driver.mjs` FILES dizisine
`'app/core/skyFx.js'` aynı konuma eklendi — tek satır, üretim kodu değil
harness paritesi. Onarım sonrası driver exit 0 (onboarding + seeded boot +
reminder assertion'ları).

**Öğrenilen ders (LEDGER'a da işlendi):** Yeni `app/core/*` modülü eklerken
S4 parite zinciri **üç** listeyi kapsar: `index.html`, `driver.mjs` FILES,
`zikr-harness.mjs` FILES (artı `tests/app/test_state_rebind_boundary.js`
boot listesi). SKY serisi dördüncü zincir halkayı (`driver.mjs`) kaçırmıştı.

## 3. Kapı sonuçları (tümü exit 0, 2026-09-09)

| Kapı | Sonuç |
|---|---|
| `node --check app.js` / `sync.js` | OK |
| `driver.mjs` (S4 onarımı sonrası) | PASS, exit 0 |
| `zikr-harness.mjs` | 95/95 |
| B1 helper boundary | 0 failure |
| B2 state migration | 60/60 |
| B3 adapter contract | 20/20 |
| state rebind (MON-15) | 37/37 |
| modularization boundary | 64/64 |
| Faz−1.1 boundary | 27/27 |
| date-utils boundary | 59/59 |
| helpers boundary | 31/31 |
| syncGlue save boundary | 19/19 |
| Faz10 sync | 69/69 |
| sync large-file | 15/15 |
| zikr manual entry | 21/21 |
| modal focus containment | PASS |
| prayer/zikir/quran/saygı boundary | 19/19, 17/17, 20/20, 20/20 |
| fx2 ailesi (6 fixture) | 14+12+7+12+7+14 = 66/66 |
| premium ailesi (8 fixture) | 249/249 |
| Quran ailesi (9 fixture) | PASS |
| reminder smoke | 20/20 curated |
| panel faz11 | 50/50 |
| `git diff --check` | temiz |

## 4. Kabul — dört cümle

1. Tek sahip: dört manevi registry gövdeleri `app/core/{prayer,zikir,quran,saygi}.js`'te; app.js shim + canlı bag + rebind sahipliği.
2. Doğru yükleme sırası: `index.html` = `driver.mjs` FILES = `zikr-harness.mjs` FILES (S4, skyFx dahil 27 dosya öneki) — bu kartta onarıldı.
3. Hedef suite PASS: §3'teki tüm kapılar exit 0.
4. I1–I6/M1–M4 farkı yok: onclick 354=354, data= token 9=9, migrate/getDay/save gövdeleri ve Guard 1/2 dokunulmadı; App fn +3 yalnız additive voice handler.

## 5. Sınırın açık ayrımı

- Yerel PASS, deploy veya cihaz kabulü değildir; push/merge/tag/deploy ve
  `mustafaras/seyma-data` yazımı yapılmadı.
- FX delta MON-S2 manifestinin "yeni FX çağrısı = app.js satırı" izleme
  kuralı içinde açıklanmıştır; `mediaFx.js` semantiği değişmedi.
- Sıradaki kart: **MON-26 (motivation domain)** — `approvalRequired: true`,
  yeni açık kullanıcı yönü olmadan başlamaz.