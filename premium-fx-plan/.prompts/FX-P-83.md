---
code: FX-P-83
name: Surface hover/active + glass genislemesi
phase: FX-WAVE-2 / Dalga 8
agent: visual
prerequisites:
  - FX-P-82 tamamlandi
input_files:
  - /Users/m_ras/Desktop/seyma/app/styles.css
output_files:
  - /Users/m_ras/Desktop/seyma/app/styles.css
forbidden:
  - app.js duzenleme
  - renk tokenlarini degistirme
  - contain ekleme (FX-P-89'a ait)
  - git push / PR / deploy
---

# FX-P-83 · `.surface` hover/active derinlik + glass & blur genişlemesi

## Amaç

Plandaki §4.5.1 + §4.5.6: genel kart derinliği (hover `translateY(-2px)`, active `scale(.97)`) ve seçili yüzeylere glass zenginleştirmesi. **Salt CSS.**

## Kesin Bağlantı Noktaları (doğrulanmış)

- `.surface` sınıfı app.js'te yüzlerce kartta kullanılıyor (ör. `app.js:12545,12556` sesli rehberlik kartı). **Global `.surface` kuralı yazılırken dikkat:** mevcut kural yok — bu prompt ilkini ekliyor.
- Mevcut bileşen-spesifik örnekler (desen referansı, dokunma): `styles.css:165` `.saygi-source-card:hover`, `styles.css:1695` `.ambient-control:active`.
- `var(--ease-premium,cubic-bezier(.16,1,.3,1))` token mevcut.

## Adımlar

1. **`FX-PROMPT-STATE.json`:** `activePrompt: "FX-P-83"`.

2. **Seçici envanteri (önce):** `grep -c '"surface"' app.js` — kaç kart etkileniyor gör. Kural **genel** yazılır ama touch cihazda hover tetiklenmemeli.

3. **`app/styles.css`:** FX bölümüne ekle:
   ```css
   /* FX-P-83: genel kart derinliği — yalnız hover kabiliyetli cihazlarda;
      dokunmada yalnız :active tepkisi (mobilde hover-stick engellenir). */
   @media (hover:hover){
     .surface{transition:transform .18s var(--ease-premium,cubic-bezier(.16,1,.3,1)),box-shadow .18s ease;}
     .surface:hover{transform:translateY(-2px);box-shadow:0 10px 24px color-mix(in srgb,var(--text) 8%,transparent);}
   }
   .surface:active{transform:scale(.97);}
   @media (prefers-reduced-motion: reduce){.surface,.surface:hover,.surface:active{transition:none!important;transform:none!important;}}
   ```

4. **Glass genişlemesi — yalnız bu üç yüzeye** (körlemesine blur yasak, performans):
   ```css
   /* FX-P-83: glass/blur — header, bottomnav ve overlay backdrop. Eski iOS'ta
      backdrop-filter yoksa mevcut opak görünüm aynen korunur (@supports). */
   @supports (backdrop-filter: blur(1px)){
     .sey-appheader,.sey-bottomnav{backdrop-filter:blur(14px) saturate(1.1);-webkit-backdrop-filter:blur(14px) saturate(1.1);}
     .sey-appheader{border-color:color-mix(in srgb,var(--text) 10%,var(--field-bd,#E7DFE6));}
     .overlay,.modal{backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);}
   }
   ```
   **Önce doğrula:** `.sey-appheader`, `.sey-bottomnav`, `.overlay`, `.modal` sınıf adlarının gerçek kullanımını `grep -o 'class="[^"]*(overlay|modal)[^"]*"' app.js | head` ile kontrol et; farklıysa gerçek sınıf adlarını kullan (ör. modal backdrop'ın gerçek sınıfı farklı olabilir). Tahminle sınıf uydurma.

5. **Cache-bump (S9):** `index.html` → `app/styles.css?v=20260906a`.

## Yasaklar

`app.js` düzenlemek; `contain` eklemek; tüm kartlara blur basmak; `!important` (reduce bloğu hariç).

## Test / Kanıt

```bash
cd /Users/m_ras/Desktop/seyma
node --check app.js
node .claude/skills/run-seyma/driver.mjs
node .claude/skills/run-seyma/zikr-harness.mjs
node docs/apple-design/verify-contrast.mjs
node docs/apple-design/verify-theme-tristate.mjs
```

`tests/app/test_premium_reduced_motion.js`'e 2 assertion:
1. styles.css'te `@media (hover:hover)` bloğunda `.surface:hover` mevcut.
2. reduce bloğu `.surface` transform'unu kapsıyor; `@supports (backdrop-filter: blur(1px))` bloğu mevcut.

## S6 Değişmezlik Kanıtı

```bash
grep -o 'App\.[a-zA-Z0-9_]*\s*=' app.js | sort -u | wc -l   # değişmedi
```

## Bitiş (S7/S8)

LEDGER + `CURRENT-STATE.md` + durum makinesi; commit: `premium-fx: FX-P-83 surface derinlik + glass`. **Push yok.**