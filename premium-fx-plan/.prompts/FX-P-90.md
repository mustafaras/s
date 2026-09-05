---
code: FX-P-90
name: Bagimsiz denetim + seri kapanisi
phase: FX-WAVE-2 / Kapanis
agent: audit
prerequisites:
  - FX-P-81..87 tamamlandi (FX-P-89 basarili VEYA kalici ertelendi)
  - FX-P-88 SERIDE YOK (bloklu)
input_files:
  - tum repo
output_files:
  - premium-fx-plan/deliverables/FX-VERIFY-RAPORU-2.md
  - premium-fx-plan/.anti-amnesia/* (kapanis)
  - premium-fx-plan/deliverables/FX-SERI-KAPANIS-BELGESI.md (ek bolum)
forbidden:
  - uygulama kodu duzenleme (salt-okur denetim; yalniz belge yazilir)
  - git push / PR / deploy
---

# FX-P-90 · Bağımsız denetim + seri kapanışı

## Amaç

FX-P-70'ın tekrarı — **çağrı-noktası odaklı** (geçmiş ders: motor var, çağrı yok; fixture'lar gate'i kendisi enjekte ediyordu). Serinin gerçekten kullanıcıya göründüğünü canlı kod kanıtıyla doğrula.

## Kesin Kural

Bu ajan **kod yazmaz**. Yalnız okur, çalıştırır, rapor yazar. Uyumsuzluk bulursa: durum makinesinde `blockedPrompt` set eder ve durur — kendisi düzeltmeye kalkmaz.

## Denetim Matrisi (her satır için motor + çağrı + CSS + test kanıtı)

| # | Özellik | Canlı kanıt komutu (hepsi eşleşmeli) |
|---|---|---|
| 1 | Aurora | `grep -n 'theme-aurora' app/core/timeTheme.js app/styles.css index.html` → 3 dosyada; `grep -c 'sey-aurora' index.html` → ≥1 |
| 2 | Nav bounce | `grep -n 'seyNavBounce' app/styles.css` → keyframe + kural + reduce |
| 3 | Badge pop | `grep -n 'seyBadgePop' app/styles.css` → aynı üçlü |
| 4 | Surface depth | `grep -n 'hover:hover' app/styles.css` + `.surface:hover` |
| 5 | Glass | `grep -n '@supports (backdrop-filter' app/styles.css` |
| 6 | Sync bell | `grep -n -A3 'saveActionPending' app.js \| grep -c 'SeyAudio.bell'` → 1 |
| 7 | Splash notu | `grep -n 'sey-splash-note' index.html app.js` → 2 dosya |
| 8 | Ring shimmer | `grep -n 'sey-habits-ring-wrap' app.js` + yanındaki `SeyFx.shimmer` |
| 9 | Bar shimmer | `grep -n 'sey-motivation-bar' app.js` + `SeyFx.shimmer` |
| 10 | Pitch/voice UI | `grep -n 'App.setVoicePitch\|App.setVoiceVoiceName' app.js` → handler + 2 onchange |
| 11 | Pitch backfill | `grep -n 'voicePitch' app/core/state.js` → migrate + createDefaultData |
| 12 | Emoji-ikon yasağı (K1) | FX-P-91 kanıtı + `grep -nP '[\x{1F300}-\x{1FAFF}\x{2600}-\x{27BF}]' app.js` çıktısında FX-P-91 kapsam satırlarının (voiceGuidance/premiumAtmosphere kart başlıkları, splash notu) artık geçmemesi; genel marka emojileri (🦩/✨ toast, maskot) kapsam dışı — sayılmaz |

## Uçtan Uca Dersi Uygula (zorunlu)

En az bir doğrulama **gerçek `migrate()` çıktısını gerçek motorlara vererek** uçtan uca yapmalı (2026-09-04 hatasının panzehiri — `test_premium_fx_gate_defaults.js` deseni): migrate çıktısındaki `premiumAtmosphere=true` state'i ile `timeTheme.js` gerçekten `theme-aurora` ekliyor mu, `mediaFx.js` gerçekten ses üretiyor mu.

## Adımlar

1. **`FX-PROMPT-STATE.json`:** `activePrompt: "FX-P-90"`.
2. **Tam regression (S5 genişletilmiş):**
   ```bash
   node --check app.js && node --check sync.js && node --check app/core/state.js && node --check app/core/mediaFx.js && node --check app/core/timeTheme.js
   node .claude/skills/run-seyma/driver.mjs
   node .claude/skills/run-seyma/zikr-harness.mjs
   for f in tests/app/test_premium_*.js; do node "$f" || echo "FAIL: $f"; done
   for f in tests/app/*.js; do node "$f" || echo "FAIL: $f"; done
   for f in tests/panel/*.js; do node "$f" || echo "FAIL: $f"; done
   for f in tests/panel-v2/test_panel_v2_*.js; do node "$f" || echo "FAIL: $f"; done
   for f in tests/quran/*.js; do node "$f" || echo "FAIL: $f"; done
   node tests/reminders/run-reminder-smoke.mjs
   node .claude/skills/run-seyma/verify-state-migration-boundary.mjs
   node docs/apple-design/verify-contrast.mjs && node docs/apple-design/verify-theme-tristate.mjs
   ```
3. **`FX-VERIFY-RAPORU-2.md` yaz:** denetim matrisi tablosu (satır başına ✅/❌ + komut çıktısı özeti) + regression sonuçları + uçtan uca kanıt.
4. **`FX-SERI-KAPANIS-BELGESI.md`'e "Dalga 8–10 Ek Kapanışı" bölümü** ekle (mevcut metni değiştirme).
5. **Envanter güncelle:** `PREMIUM-OZELLIK-ENVANTERI.md`'de ❌ satırları ✅'a çevir (her satıra kanıt referansı); FX-P-88 bloklu, FX-P-89 kararlı haliyle işaretle.
6. **Kök yönlendirme:** kök `AGENTS.md` + `CLAUDE.md` "premium FX work" satırını bu serinin kapanış belgesine işaret et (tek satır).
7. **Kapanış:** durum makinesi `lastCompletedPrompt: "FX-P-90"`, `implementationComplete: true` (yalnız tümü ✅ ise), `currentPhase: "FX-WAVE-2 kapanış"`.
8. **Commit:** `premium-fx: FX-P-90 denetim + seri kapanışı`. **Push yok.**

## FX-P-66/67 Kararı (kullanıcıya)

Denetim raporunun sonuna soru olarak ekle: A/B kopya deneyi + launch-ritual genişletmesi isteniyor mu? İstenmezse kalıcı "ertelenmiş" kapanır.

## Kullanıcıya Sunulacak Son Kapılar

- Son regression çıktısı (0 FAIL beklentisi)
- Merge kararı: `premium-fx-gorsel-yuzey` → `main` — **yalnız kullanıcı onayıyla**
- Deploy: merge sonrası otomatik (pages.yml) — onay zincirinin sonunda