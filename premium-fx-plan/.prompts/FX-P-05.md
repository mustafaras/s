---
code: FX-P-05
name: settings.premiumAtmosphere ve diger yeni alanları migrate()’a ekle
phase: Faz 0
agent: state / data uzmanı
prerequisites:
  - Faz -1.1 tamamlandı (FX-P-01 … FX-P-04)
  - Kullanıcı onayı: Dalga 0 başlasın.
  - Branch: premium-fx-local
input_files:
  - /Users/m_ras/Desktop/seyma/app.js (sadece migrate() bölümü, line ~4415)
  - /Users/m_ras/Desktop/seyma/premium-fx-plan/deliverables/SPEC-FAZ-6.md
output_files:
  - /Users/m_ras/Desktop/seyma/app.js
forbidden:
  - migrate() dışındaki app.js bölümlerine dokunma
  - sync.js dokunma
  - save() dokunma
  - git push / PR / deploy
---

# FX-P-05 · settings.premiumAtmosphere ve diğer yeni alanları migrate()’a ekle

## Amaç

Eski `data` kayıtlarına yeni premium FX ayar alanlarını `migrate(d)` içinde güvenli şekilde backfill et. Sadece `settings.*` altına alan eklenecek; `data` şekli değişmeyecek.

> **I3 netleştirmesi:** I3 "`migrate()` dokunulmaz" der; bu, **mevcut backfill mantığını değiştirmemek** anlamına gelir. FX-P-05 ise `migrate()`'e **yeni, additive backfill alanları ekler** — bu I3'ü ihlal etmez, çünkü mevcut davranış korunur ve yalnızca yeni `settings.*` alanları eklenir. `migrate()` idempotent kalır.

## Girdi

- `app.js` içinde `migrate(d)` fonksiyonu (line ~4415).
- Eklenecek alanlar:
  - `settings.premiumAtmosphere = true`
  - `settings.uiSounds = true`
  - `settings.voiceGuidance = false`
  - `settings.ambientSounds = false`
  - `settings.richHaptics = true`
  - `settings.launchRitual = true`

## Adımlar

1. `FX-PROMPT-STATE.json` güncelle: `activePrompt: "FX-P-05"`.

2. `migrate(d)` fonksiyonunu bul ve şu kalıpta ekle:
   ```js
   if (d.settings == null) d.settings = {};
   if (d.settings.premiumAtmosphere == null) d.settings.premiumAtmosphere = true;
   if (d.settings.uiSounds == null) d.settings.uiSounds = true;
   if (d.settings.voiceGuidance == null) d.settings.voiceGuidance = false;
   if (d.settings.ambientSounds == null) d.settings.ambientSounds = false;
   if (d.settings.richHaptics == null) d.settings.richHaptics = true;
   if (d.settings.launchRitual == null) d.settings.launchRitual = true;
   ```

3. **Canlı getter'ları ekle (B1 kararı):** `app.js`'in IIFE kapsamında, `data`/`ui`/`dark`/`migrate`/`getDay`/`createDefaultData`/`save` tanımlarının **sonrasına** (boot bölümünde, `data` yüklendikten sonra) şu canlı getter'ları ekle:
   ```js
   Object.defineProperty(window, 'data', { get: function(){ return data; }, configurable: true });
   Object.defineProperty(window, 'ui',   { get: function(){ return ui; },   configurable: true });
   Object.defineProperty(window, 'dark', { get: function(){ return dark; }, configurable: true });
   Object.defineProperty(window, 'migrate', { get: function(){ return migrate; }, configurable: true });
   Object.defineProperty(window, 'getDay',  { get: function(){ return getDay; },  configurable: true });
   Object.defineProperty(window, 'createDefaultData', { get: function(){ return createDefaultData; }, configurable: true });
   Object.defineProperty(window, 'save', { get: function(){ return save; }, configurable: true });
   ```
   **Neden canlı getter?** `data` mutable bir bağlamadır (6+ kez yeniden atanır: 4412/4413/6692/9203/18724/9173/9177). Tek seferlik `window.data = data` bayat kalır; canlı getter her okumada taze değer döndürür (VM'de kanıtlandı). Bu, mevcut fonksiyonların davranışını/imzasını değiştirmez — yalnızca `window` üzerinden okunabilir kılar. I2/I3/I4'ü ihlal etmez ("dokunulmaz" = "davranış değiştirmez").

4. `node --check app.js` çalıştır.

5. `verify-state-migration-boundary.mjs` çalıştır; eski/partial/zengin state’lerin doğru migrate edildiğini doğrula.

## Test / Kanıt

```bash
cd /Users/m_ras/Desktop/seyma
node --check app.js
node .claude/skills/run-seyma/verify-state-migration-boundary.mjs
node .claude/skills/run-seyma/driver.mjs
node .claude/skills/run-seyma/zikr-harness.mjs
node tests/app/test_faz10_sync.js
node tests/app/test_modularization_boundary.js
node tests/panel/test_faz11_panel.js
```

Ek kanıt:
```bash
grep -A 10 'function migrate' app.js | head -25
```

## Anti-Amnesi Güncellemesi

- `.anti-amnesia/LEDGER.md`’e satır ekle (seq 23):
  ```markdown
  | 23 | 2026-08-31 | GitHub Copilot | FX-P-05 | ✅ TAMAMLANDI | <yerel commit> | S5 geçti | migrate()’a premium FX settings alanları eklendi. |
  ```
- `.anti-amnesia/CURRENT-STATE.md` güncelle: `currentPhase: "Faz 0"`, sıradaki `FX-P-06`.
- `.anti-amnesia/FX-PROMPT-STATE.json`: `activePrompt: null`, `lastCompletedPrompt: "FX-P-05"`, `currentPhase: "Faz 0"`.

## Commit

```bash
git add -A
git commit -m "premium-fx: FX-P-05 Faz 0 migrate backfill — premiumAtmosphere, uiSounds, voiceGuidance, ambientSounds, richHaptics, launchRitual"
```

**Push yapma.**

## Rollback

```bash
git checkout -- app.js
node --check app.js
```

## Handoff Notu

FX-P-06 `mediaFx.js` iskeletini gerçek API yüzeyiyle dolduracak. `app.js` içindeki `migrate()` güncellendi; diğer app.js bölümleri dokunulmadı.
