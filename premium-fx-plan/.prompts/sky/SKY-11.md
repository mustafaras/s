# SKY-11 — Eski CSS hava dokularını header'dan kaldır

**Kart 11/15 · Faz 3 · Dosya: `app/styles.css` (~40 satır silme)**

> **Önce `SKY-00-ONBILGI.md` oku.** Bu kartta SADECE aşağıdaki iş var.
> Başka dosyaya dokunma. Karar gerekiyorsa DUR ve kullanıcıya sor.

---

## 1. AMAÇ

Canvas artık yağmur/kar/sis/fırtına çiziyor. Header'daki **eski CSS
dokuları** artık gereksiz ve canvas'ın üstüne binerek görüntüyü kirletiyor.
Onları kaldır. **Gökyüzü gradientini SİLME** — o kalıyor.

## 2. ⚠️ NE SİLİNECEK, NE KALACAK

| Kalacak ✅ | Silinecek ❌ |
|---|---|
| `.sey-hdr-sky{...}` gövdesi (gradient) | `.sey-hdr-sky.sky-wx-*::after` blokları |
| `.sey-hdr-sky::before` (ufuk parlaması) | `@keyframes ambRainHdr` |
| `.sey-hdr-sky.sky-time-*` palet blokları | `@keyframes ambSnowHdr` |
| `#root.amb-paused .sey-hdr-sky::after` | `.sey-hdr-sky::after` boş tanımı |
| `.sey-hdr-scene`, `.sey-hdr-wx`, `.sey-hdr-arc`, `.sey-hdr-phase` | — |

> **Sayfa zeminindeki `#sey-aurora::after` bloklarına DOKUNMA.** Onlar ayrı
> bir sistem ve `test_fx2_ambience.js` sözleşmesine bağlı.

## 3. NE YAPACAKSIN

1. `app/styles.css` içinde `.sey-hdr-sky.sky-wx-` ile başlayan **tüm**
   blokları sil (clear, cloud, fog, drizzle, rain, snow, storm, none).
2. `@keyframes ambRainHdr` ve `@keyframes ambSnowHdr` bloklarını sil.
3. `.sey-hdr-sky::after{ ... opacity:0 ... }` boş tanımını sil.
4. `#root.amb-paused .sey-hdr-sky::after{...}` satırını sil (artık `::after`
   yok; duraklatma JS tarafında `visibilitychange` ile yapılıyor).
5. `app/styles.css?v=` değerini `index.html`'de bir artır.

## 4. DOĞRULAMA

```bash
grep -c 'sky-wx-' app/styles.css
grep -c 'ambRainHdr\|ambSnowHdr' app/styles.css
grep -c 'sky-time-' app/styles.css
node tests/app/test_fx2_ambience.js | tail -2
for t in tests/app/*.js; do node "$t" >/dev/null 2>&1 || echo "FAIL $t"; done
```

**Beklenen:**
- `sky-wx-` → `0`
- `ambRainHdr|ambSnowHdr` → `0`
- `sky-time-` → **8 veya daha fazla** (palet blokları KALMALI)
- `test_fx2_ambience` → `14 / 14` · başka FAIL yok

## 5. DUR VE SOR

- `sky-time-` sayısı 0 olduysa: **fazla sildin**, geri al.
- `test_fx2_ambience` düşerse: `#sey-aurora::after` bloklarına dokunmuşsun.

## 6. BİTİRME

```bash
git add app/styles.css index.html
git commit -m "sky: SKY-11 eski header hava dokularini kaldir

Canvas artik yagis/sis/simsek ciziyor; sky-wx-* CSS dokulari ve
ambRainHdr/ambSnowHdr keyframe'leri gereksiz. Gokyuzu gradienti KALDI.
Dogrulama: test_fx2_ambience 14/14.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

`SKY-STATE.json` → `"SKY-11": "done"`
