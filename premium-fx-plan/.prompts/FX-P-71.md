---
code: FX-P-71
name: Docusynchronization ve final catalog update
phase: Faz 7
agent: technical writer
prerequisites:
  - FX-P-65 tamamlandi
  - Branch: premium-fx-local
input_files:
  - /Users/m_ras/Desktop/seyma/premium-fx-plan/README.md
  - /Users/m_ras/Desktop/seyma/premium-fx-plan/PLAN.md
  - /Users/m_ras/Desktop/seyma/premium-fx-plan/NEXT-STEPS.md
  - /Users/m_ras/Desktop/seyma/premium-fx-plan/.prompts/PROMPT-CATALOG.md
output_files:
  - /Users/m_ras/Desktop/seyma/premium-fx-plan/README.md
  - /Users/m_ras/Desktop/seyma/premium-fx-plan/PLAN.md
  - /Users/m_ras/Desktop/seyma/premium-fx-plan/NEXT-STEPS.md
  - /Users/m_ras/Desktop/seyma/premium-fx-plan/.prompts/PROMPT-CATALOG.md
forbidden:
  - app.js degistirme
  - git push / PR / deploy
---

# FX-P-71 · Doküman senkronizasyonu ve final katalog güncellemesi

## Amac

Premium FX plan tum dalgalar tamamlandiktan sonra tum plan dosyalarini senkronize et: README, PLAN, NEXT-STEPS, PROMPT-CATALOG. Gerceklesenler ve iptal/ertelenenler net olsun.

## Girdi

- `.prompts/` icerisindeki tum FX-P-*.md dosyalari
- Mevcut plan dokumanlari
- LEDGER.md tamamlanma satirlari

## Adimlar

1. **FX-PROMPT-STATE.json guncelle:** `activePrompt: "FX-P-71"`.

2. **`PROMPT-CATALOG.md` index guncelle:**
   - Tum FX-P-01..P-74 icin linkleri ve durumlari `🟢 TAMAMLANDI` veya `🟡 BEKLIYOR` olarak guncelle.
   - Wave ozet tablosunu yeniden yaz: her dalga tamamlandiginda o dalganin tum promptlari gecmis.

3. **`README.md` guncelle:**
   - Proje ozetini guncelle: Faz -1.1 moduler cekirdek, 6 ana dalga, 74 prompt.
   - "Implementation Status" bolumu ekle; Faz 6'ya kadar tamamlandi, Faz 7 kapama asamasinda.
   - `LOCAL-ONLY-IMPLEMENTATION.md` linkini ve kuralini tekrar vurgula.

4. **`PLAN.md` guncelle:**
   - Gerceklesen gorevlerin yanına `[x]` koy.
   - Ertelenen veya kapsam disi kalan herhangi bir sey varsa "Deferred" bolumune tas.

5. **`NEXT-STEPS.md` guncelle:**
   - Artik implementation tamamlandigina gore "Sonraki adimlar":
     - Kullanici gozden gecirmesi
     - Belki kucuk UI polish
     - Lokal branch'de kalma; push/deploy yok
     - Tercihen `premium-fx-local` branch'inden `main`e merge etmeden once son bir regression

6. **Cross-link kontrolu:**
   - Tum `.prompts/FX-P-*.md` dosyalarinda referans verilen `PLAN.md`, `README.md`, `NEXT-STEPS.md` goreceli yollar dogru mu?
   - Yeni prompt dosyalari onceki promptlara `prerequisites` olarak dogru referans veriyor mu?

## Test / Kanit

```bash
cd /Users/m_ras/Desktop/seyma/premium-fx-plan
node --check ../app.js
node --check ../sync.js
node ../.claude/skills/run-seyma/driver.mjs
node ../.claude/skills/run-seyma/zikr-harness.mjs
```

Markdown link dogrulama:
```bash
grep -R '\[.*\](\.\/' .prompts/ | head
```

## Anti-Amnesi Guncellemesi

- `.anti-amnesia/LEDGER.md`'e satir ekle:
  ```markdown
  | FX-P-71 | 2026-08-31 | GitHub Copilot | dokuman senkronizasyonu | ✅ TAMAMLANDI | <yerel commit> | S5 gecti | README, PLAN, NEXT-STEPS, PROMPT-CATALOG senkronize edildi. |
  ```
- `.anti-amnesia/CURRENT-STATE.md`: "Devam Eden" → `FX-P-72`.
- `.anti-amnesia/FX-PROMPT-STATE.json`: `activePrompt: null`, `lastCompletedPrompt: "FX-P-71"`, `currentPhase: "Faz 7"`.

## Commit

```bash
git add -A
git commit -m "premium-fx: FX-P-71 Faz 7 dokuman senkronizasyonu ve katalog guncellemesi"
```

**Push yapma.**

## Rollback

```bash
git checkout -- premium-fx-plan/README.md premium-fx-plan/PLAN.md premium-fx-plan/NEXT-STEPS.md premium-fx-plan/.prompts/PROMPT-CATALOG.md
```

## Handoff Notu

FX-P-72: Anti-amnesia final gozden gecirme.
