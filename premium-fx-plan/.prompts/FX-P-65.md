---
code: FX-P-65
name: Full regression testleri ve Faz 6 kapanis
phase: Faz 6
agent: QA lead
prerequisites:
  - FX-P-64 tamamlandi
  - Branch: premium-fx-local
input_files:
  - /Users/m_ras/Desktop/seyma/app.js
  - /Users/m_ras/Desktop/seyma/app/core/mediaFx.js
  - /Users/m_ras/Desktop/seyma/app/core/timeTheme.js
  - /Users/m_ras/Desktop/seyma/index.html
  - /Users/m_ras/Desktop/seyma/premium-fx-plan/deliverables/REVIEW-CHECKLIST.md
  - /Users/m_ras/Desktop/seyma/premium-fx-plan/SAFEGUARDS.md
output_files:
  - /Users/m_ras/Desktop/seyma/premium-fx-plan/deliverables/REVIEW-CHECKLIST.md
forbidden:
  - app.js davranisini degistirme
  - data/settings seklini degistirme
  - git push / PR / deploy
---

# FX-P-65 · Full regression testleri ve Faz 6 kapanış

## Amaç

Dalga 6 kapanışı. Tüm mevcut testlerin, panel-v2 27 fixture’inin, sync/panel testlerinin ve yeni premium FX testlerinin birlikte geçtiğini doğrula; REVIEW-CHECKLIST ve SAFEGUARDS’ı işaretle.

## Girdi

- Tüm testler
- `REVIEW-CHECKLIST.md`
- `SAFEGUARDS.md`

## Adımlar

1. **FX-PROMPT-STATE.json güncelle:** `activePrompt: "FX-P-65"`.

2. **Full regression suite çalıştır:**
   ```bash
   cd /Users/m_ras/Desktop/seyma
   node --check app.js
   node --check sync.js
   node --check app/core/mediaFx.js
   node --check app/core/timeTheme.js
   node --check app/core/state.js
   node --check app/core/dateUtils.js
   node --check app/core/helpers.js
   node .claude/skills/run-seyma/driver.mjs
   node .claude/skills/run-seyma/zikr-harness.mjs
   node tests/app/test_faz10_sync.js
   node tests/app/test_aeon_message_expand.js
   node tests/app/test_modal_focus_containment.js
   node tests/app/test_faz_minus11_boundary.js
   node tests/app/test_modularization_boundary.js
   node tests/app/test_date_utils_boundary.js
   node tests/app/test_helpers_boundary.js
   node tests/app/test_premium_fx_utils.js
   node tests/app/test_premium_time_theme.js
   node tests/app/test_premium_voice.js
   node tests/app/test_premium_settings.js
   node tests/panel/test_faz11_panel.js
   node tests/panel/test_panel_p0_sync.js
   node tests/panel/test_panel_p1_projection.js
   node tests/panel/test_panel_p2_event_log.js
   node tests/panel/test_panel_p2_sync.js
   node tests/panel/test_panel_p2_polling.js
   node tests/panel/test_panel_p3_root_modules.js
   node tests/panel/test_panel_p4_provenance.js
   node tests/panel/test_panel_boot_resilience.js
   for f in tests/panel-v2/test_panel_v2_*.js; do node "$f" || echo "FAIL: $f"; done
   for f in tests/quran/test_quran_*.js; do node "$f" || echo "FAIL: $f"; done
   ```

3. **Hata varsa dur ve logla:**
   - Herhangi bir test fail ederse `FX-P-65` tamamlanmadı sayılır. Hatayı `.anti-amnesia/CURRENT-STATE.md`’ye "BLOKE" olarak yaz.

4. **`REVIEW-CHECKLIST.md` güncelle:**
   ```markdown
   - [x] Premium Atmosfer master switch UI uygulandı
   - [x] Settings persistence ve gating testleri PASS
   - [x] Reduced-motion ve accessibility uyumu uygulandı
   - [x] Panel senkronizasyonu guncellendi
   - [x] Full regression suite PASS
   ```

5. **`SAFEGUARDS.md` son kontrol:**
   - `LOCAL-ONLY` kuralı hâlâ geçerli mi?
   - `S6` (data/migrate/save değişmezliği) korunmuş mu?
   - `index.html` script tag sırası bozulmamış mı?
   - Eksik varsa seq satırı ekle.

## S6 Değişmezlik Kanıtı

```bash
grep -o 'App\.[a-zA-Z0-9_]*\s*=' app.js | sort -u | wc -l
grep -o 'onclick="App\.[a-zA-Z0-9_]*' app.js | sort | uniq -c
grep -c 'src="app.js' index.html
node tests/app/test_modularization_boundary.js
```

## Anti-Amnesi Güncellemesi

- `.anti-amnesia/LEDGER.md`’e satır ekle:
  ```markdown
  | FX-P-65 | 2026-08-31 | GitHub Copilot | Faz 6 full regression | ✅ TAMAMLANDI | <yerel commit> | S5/S6 gecti | Tum mevcut testler + yeni FX testleri gecti; REVIEW-CHECKLIST ve SAFEGUARDS guncellendi. |
  ```
- `.anti-amnesia/CURRENT-STATE.md`: `currentPhase: "Faz 6 tamamlandı"`, `lastCompletedFaz: "Faz 6"`, sıradaki `Dalga 7 / FX-P-71` (ayrı onay bekleniyor).
- `.anti-amnesia/FX-PROMPT-STATE.json`: `activePrompt: null`, `lastCompletedPrompt: "FX-P-65"`, `currentPhase: "Faz 6 tamamlandı"`.
- `NEXT-STEPS.md` güncelle: Faz 6 tamamlandı, Dalga 7 (Closure) için kullanıcı onayı bekleniyor.

## Commit

```bash
git add -A
git commit -m "premium-fx: FX-P-65 Faz 6 full regression ve kapanis"
```

**Push yapma.**

## Rollback

```bash
git checkout -- premium-fx-plan/deliverables/REVIEW-CHECKLIST.md premium-fx-plan/SAFEGUARDS.md
```

## Handoff Notu

Dalga 7 Closure başlar: FX-P-71 docs güncellemeleri.
