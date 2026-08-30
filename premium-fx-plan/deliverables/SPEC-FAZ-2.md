# Faz 2: Mikro-animasyon ve Shimmer Genişlemesi — Detay Spec

**Hedef:** Görsel geri bildirim zenginliği kazandırmak.

---

## 2.1 Count-up Animasyonu

**Yeni yardımcı:** `animateNumber(elementId, from, to, duration, formatter)`

**Konum:** `app.js` içine veya `app/core/fxUtils.js` modülüne.

**Parametreler:**

| Parametre | Tip | Açıklama |
|-----------|-----|----------|
| `elementId` | string | Güncellenecek DOM elementinin id’si |
| `from` | number | Başlangıç değeri |
| `to` | number | Bitiş değeri |
| `duration` | number | ms cinsinden süre (default 400) |
| `formatter` | function | İsteğe bağlı formatlama (örn. `(n)=>n+' bardak'`) |

**Easing:** `cubic-bezier(.16,1,.3,1)` — JS’te `easeOutCubic` uygulanır.

**Kullanım alanları:**
- Su sayısı (`waterCard` içindeki `w/g` metni).
- Gün indexi (hero dashboard).
- Streak (hero dashboard).
- Tamamlanmış tik sayısı (habits badge).
- Adım sayısı (sağlık sekmesi, varsa).

**Reduce motion uyumu:** `prefers-reduced-motion` veya `settings.premiumAtmosphere === false` ise anında güncelle, animasyon yapma.

---

## 2.2 Shimmer Genişlemesi

**Mevcut:** `app/styles.css` içinde `seyShine` keyframe’i var.

**Yeni uygulama alanları:**

### 2.2.1 Habits SVG Progress Ring

**Konum:** `habitsCardHTML()` içindeki SVG `circle` elementi.

**Değişiklik:** Progress ring üzerine shimmer pseudo-element veya ikinci bir overlay circle ekle.

```css
.sey-habit-ring-shimmer {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.4) 50%, transparent 70%);
  animation: seyShine 2.6s ease-in-out infinite;
  pointer-events: none;
}
```

**Not:** SVG üzerine CSS pseudo-element eklenemez; bu yüzden shimmer için ayrı bir SVG `circle` veya overlay div kullanılmalı.

### 2.2.2 Premium Atmosfer Açıkken Tüm Progress Bar’lar

- Su barı (zaten shimmer var; güçlendirilebilir).
- Günlük Işığı hedef barı (zaten var).
- Motivation ilerleme barı (zaten var).
- Header sync durum çubuğu (yeni).

### 2.2.3 Header Accent Çizgileri

**Konum:** `.sey-appheader`

**Değişiklik:** Header synapse desenine yavaş shimmer eklenmesi (düşük opacity, 8 sn döngü).

---

## 2.3 Ripple Efekti

**Yeni CSS class:** `.sey-ripple`

**Yeni keyframe:**

```css
@keyframes seyRipple {
  0% { transform: scale(0); opacity: 0.35; }
  100% { transform: scale(2.5); opacity: 0; }
}
.sey-ripple {
  position: absolute;
  border-radius: 50%;
  background: currentColor;
  pointer-events: none;
  animation: seyRipple 0.5s ease-out forwards;
}
```

**JS entegrasyonu:**

```js
function rippleEffect(event, element, color){
  if(!settings.premiumAtmosphere) return;
  var rect = element.getBoundingClientRect();
  var x = event.clientX - rect.left;
  var y = event.clientY - rect.top;
  var r = document.createElement('span');
  r.className = 'sey-ripple';
  r.style.left = x + 'px';
  r.style.top = y + 'px';
  r.style.width = r.style.height = '40px';
  r.style.marginLeft = r.style.marginTop = '-20px';
  r.style.color = color || 'var(--accent)';
  element.appendChild(r);
  setTimeout(function(){ if(r.parentNode) r.parentNode.removeChild(r); }, 500);
}
```

**Kullanım:**
- Tüm `.surface` kart butonlarına.
- Bottom nav item’lara.
- Header mini butonlara.

**Reduce motion:** Aktifse ripple hiç oluşturulmamalı.

---

## 2.4 Kart Hover / Active

**Mevcut:** `.surface` class genel kart stili.

**Yeni kurallar:**

```css
.surface {
  transition: transform 0.18s var(--ease-premium, cubic-bezier(.16,1,.3,1)),
              box-shadow 0.2s ease;
}
.surface:hover {
  transform: translateY(-2px);
  box-shadow: 0 18px 42px rgba(108,74,58,0.12);
}
.surface:active {
  transform: scale(0.985);
  box-shadow: 0 8px 20px rgba(108,74,58,0.08);
}

@media (prefers-reduced-motion: reduce) {
  .surface { transition: none !important; }
  .surface:hover, .surface:active { transform: none !important; }
}
```

**Not:** Touch cihazlarda `:hover` takılı kalabilir; bu yüzden active state daha önemli.

---

## 2.5 Bottom Nav Aktif İkon Bounce

**Yeni keyframe:**

```css
@keyframes seyNavBounce {
  0% { transform: translateY(0); }
  40% { transform: translateY(-4px); }
  100% { transform: translateY(0); }
}
.sey-bottomnav-item.is-active .sey-bottomnav-glyph {
  animation: seyNavBounce 0.34s var(--ease-premium, ease) both;
}

@media (prefers-reduced-motion: reduce) {
  .sey-bottomnav-item.is-active .sey-bottomnav-glyph { animation: none !important; }
}
```

---

## 2.6 Sekme Geçiş Animasyonu

**Mevcut:** `render()` doğrudan `#app.innerHTML` değiştiriyor; geçiş sert.

**Öneri (düşük risk):**
- `render()` sonunda `#app` elementine kısa `seyFade` + `seyFloatIn` animasyonu uygula.
- Ancak her render’da animasyon tekrarlanmamalı; sadece tab değişiminde.

**Yaklaşım:**
- `App.go(tab)` çağrıldığında `#app` class’ına `is-tab-changing` ekle.
- CSS’te 0.2 sn fade/float uygula.
- Animasyon bitince class kaldır.

```css
#app.is-tab-changing {
  animation: seyTabChange 0.24s var(--ease-premium, ease);
}
@keyframes seyTabChange {
  0% { opacity: 0.85; transform: translateY(6px); }
  100% { opacity: 1; transform: translateY(0); }
}
```

**Risk:** Her içerik güncellemesinde animasyon çalışırsa rahatsız edici olur. Sadece tab değişiminde uygulanmalı.

---

## 2.7 Test Planı

### `tests/app/test_premium_reduced_motion.js`

**Seneryolar:**
1. `prefers-reduced-motion: reduce` aktifse `.surface` transform geçişi yok.
2. Ripple elementi oluşturulmuyor.
3. Bottom nav bounce animation yok.
4. Tab change animation class’ı uygulanmıyor.

### `tests/app/test_premium_count_up.js`

**Seneryolar:**
1. `animateNumber` fonksiyonu tanımlı.
2. Reduce motion aktifse değer anında güncelleniyor.
3. Normal durumda ara değerler üretiliyor.

---

## 2.8 Çıktı Listesi

- [ ] `animateNumber()` yardımcı spec’i
- [ ] `.sey-ripple` CSS + JS spec’i
- [ ] `.surface` hover/active kuralları
- [ ] `seyNavBounce` keyframe
- [ ] `seyTabChange` geçiş spec’i
- [ ] Habits shimmer spec’i
- [ ] Test skeleton’ları
