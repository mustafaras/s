---
code: FX-P-82
name: Nav bounce + badge pop
phase: FX-WAVE-2 / Dalga 8
agent: visual
prerequisites:
  - FX-P-81 tamamlandi
input_files:
  - /Users/m_ras/Desktop/seyma/app/styles.css
output_files:
  - /Users/m_ras/Desktop/seyma/app/styles.css
forbidden:
  - app.js duzenleme (render zaten is-active + badge span uretiyor)
  - index.html duzenleme
  - git push / PR / deploy
---

# FX-P-82 · Bottom nav bounce + ÆON badge pop

## Amaç

Plandaki §4.6.2 + §4.6.4: aktif sekme ikonunda hafif bounce; unread badge'inde pop girişi. **Salt CSS** — render zaten gerekli sınıfları üretiyor.

## Kesin Bağlantı Noktaları (doğrulanmış)

- `app.js:14775`: render zaten `<button class="sey-bottomnav-item'+(active?' is-active':'')+'...">` üretiyor.
- `app.js:14772-14773`: badge render zaten `<span class="sey-bottomnav-badge">` / `.sey-bottomnav-badge saygi` üretiyor (mesaj + saygi).
- `app/styles.css:129`: `.sey-bottomnav-badge` stili mevcut — üzerine animation eklenecek.
- `.sey-bottomnav-glyph` ikon sarmalayıcısı mevcut (styles.css `sey-bottomnav-*` ailesi).

## Adımlar

1. **`FX-PROMPT-STATE.json`:** `activePrompt: "FX-P-82"`.

2. **`app/styles.css`:** FX bölümüne (`.sey-ripple` bloklarının üstü) ekle:
   ```css
   /* FX-P-82: aktif sekme ikonu bounce — yalnız sekme DEĞİŞİKLiğinde çalar
      (render yeni buton dizisi üretince animation yeniden başlar). */
   @keyframes seyNavBounce{0%{transform:translateY(0) scale(1);}40%{transform:translateY(-3px) scale(1.06);}100%{transform:translateY(0) scale(1);}}
   .sey-bottomnav-item.is-active .sey-bottomnav-glyph{animation:seyNavBounce .32s var(--ease-premium,cubic-bezier(.16,1,.3,1));}
   /* FX-P-82: unread badge pop — badge her render'da yeniden oluştuğu için
      giriş animasyonu doğal olarak yalnız yeni badge'te görünür. */
   @keyframes seyBadgePop{0%{transform:scale(.4);opacity:0;}60%{transform:scale(1.12);opacity:1;}100%{transform:scale(1);opacity:1;}}
   .sey-bottomnav-badge{animation:seyBadgePop .3s var(--ease-premium,cubic-bezier(.16,1,.3,1));transform-origin:center;}
   @media (prefers-reduced-motion: reduce){.sey-bottomnav-item.is-active .sey-bottomnav-glyph,.sey-bottomnav-badge{animation:none!important;}}
   ```

3. **Çakışma kontrolü:** `app/styles.css:138`'teki mevcut reduce kuralı `.sey-bottomnav-item,.sey-bottomnav-item::before,.sey-bottomnav-glyph,.sey-bottomnav-indicator`'ı kapsıyor — yeni `animation:none!important` satırı onunla aynı bloğa da alınabilir; yalnız çift kural bırakma, birini seç.

4. **Cache-bump (S9):** `index.html` → `app/styles.css?v=20260906a` (FX-P-81 aynı sürüme aldıysa dokunma; ikisi de aynı günse tek bump yeter).

## Yasaklar

`app.js`/`index.html` düzenlemek; badge metnini/eşik değerini (`unread>9?'9+'`) değiştirmek; yeni keyframe dosyası.

## Test / Kanıt

```bash
cd /Users/m_ras/Desktop/seyma
node --check app.js
node .claude/skills/run-seyma/driver.mjs
node .claude/skills/run-seyma/zikr-harness.mjs        # 95/95
node tests/app/test_premium_reduced_motion.js          # mevcut set
```

`tests/app/test_premium_reduced_motion.js`'e 2 statik assertion:
1. styles.css'te `@keyframes seyNavBounce` ve `@keyframes seyBadgePop` mevcut.
2. reduce bloğu her iki sınıfı (`is-active .sey-bottomnav-glyph`, `.sey-bottomnav-badge`) `animation:none` ile kapsıyor.

Ek görsel kanıt: `node .claude/skills/run-seyma/driver.mjs --dump bugun` çıktısında `sey-bottomnav-item is-active` + `sey-bottomnav-badge` birlikteliği (render tarafı zaten üretiyor — değişiklik gerekmediğinin kanıtı).

## S6 Değişmezlik Kanıtı

```bash
grep -o 'App\.[a-zA-Z0-9_]*\s*=' app.js | sort -u | wc -l   # değişmedi
grep -c 'src="app.js' index.html                             # 1
```

## Bitiş (S7/S8)

LEDGER + `CURRENT-STATE.md` + durum makinesi; commit: `premium-fx: FX-P-82 nav bounce + badge pop`. **Push yok.**