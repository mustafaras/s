# PREM-01 — `SeyFx.transition` ölü API'sini kaldır

**Kart 13/15 · PREM (SKY'dan bağımsız) · Dosya: `app/core/mediaFx.js`**

> **Önce `SKY-00-ONBILGI.md` oku.** Bu kartta SADECE aşağıdaki iş var.
> Başka dosyaya dokunma. Karar gerekiyorsa DUR ve kullanıcıya sor.

---

## 1. AMAÇ

`SeyFx.transition` **hiçbir yerden çağrılmıyor** (denetimde ölçüldü: 0 çağrı).
Ölü API. Kaldır.

## 2. ÖNCE DOĞRULA (kaldırmadan önce)

```bash
grep -c 'SeyFx\.transition' app.js
grep -rn 'SeyFx\.transition\|\.transition(' tests/ .claude/skills/ 2>/dev/null | grep -v 'style.transition'
```

**Beklenen:** `app.js` → `0` · testlerde referans yok.

> ⚠️ Eğer bir test `transition`'a bağlıysa **DUR ve kullanıcıya sor.**
> Testi silme, gevşetme.

## 3. NE YAPACAKSIN

`app/core/mediaFx.js` içinde şu bloğu bul ve **tamamını sil**:

```javascript
    transition: function(el, property, durationMs){
      // FX-P-37: tek property için CSS transition helper.
      if (!shouldAnimate()) return;
      if (!el || !el.style) return el;
      durationMs = Math.max(0, Math.min(Number(durationMs) || 200, 1000));
      el.style.transition = property + ' ' + durationMs + 'ms ease';
      return el;
    },
```

`index.html`'de `mediaFx.js?v=` değerini bir artır.

## 4. DOĞRULAMA

```bash
node --check app/core/mediaFx.js
grep -c 'transition: function' app/core/mediaFx.js
for t in tests/app/*.js tests/panel/*.js; do node "$t" >/dev/null 2>&1 || echo "FAIL $t"; done
node .claude/skills/run-seyma/driver.mjs 2>&1 | grep -c '^FAIL'
```

**Beklenen:** `transition: function` → `0` · hiç FAIL yok · driver `0`

## 5. DUR VE SOR

- Herhangi bir test düşerse: **DUR**, değişikliği geri al, kullanıcıya bildir.

## 6. BİTİRME

```bash
git add app/core/mediaFx.js index.html
git commit -m "prem: PREM-01 SeyFx.transition olu API'sini kaldir

app.js'te 0 cagri, testlerde referans yok. Kozmetik borc temizligi.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

`SKY-STATE.json` → `"PREM-01": "done"`
