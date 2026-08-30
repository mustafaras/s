# Faz 3: Premium Açılış Ritüeli — Detay Spec

**Hedef:** Uygulama ilk izlenimini yükseltmek.

---

## 3.1 Splash HTML

**Dosya:** `/Users/m_ras/Desktop/seyma/index.html`

**Eklenecek bölüm (body içinde, ilk çocuk):**

```html
<div id="sey-splash" class="sey-splash" aria-hidden="true">
  <div class="sey-splash-aurora"></div>
  <div class="sey-splash-content">
    <div class="sey-splash-brand">
      <span class="sey-splash-wordmark">Şeyma</span>
      <span class="sey-splash-flam">🦩</span>
    </div>
    <div class="sey-splash-greeting" id="sey-splash-greeting">Günışığı yükleniyor…</div>
  </div>
</div>
```

**Kural:** Splash, uygulama verisi yüklenene kadar görünür. `app.js` boot sonunda gizlenir.

---

## 3.2 Splash CSS

**Dosya:** `/Users/m_ras/Desktop/seyma/app/styles.css`

**Önerilen stil:**

```css
.sey-splash {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--page);
  overflow: hidden;
  transition: opacity 0.3s ease, visibility 0.3s ease;
}
.sey-splash.is-done {
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
}
.sey-splash-aurora {
  position: absolute;
  inset: -20%;
  background:
    radial-gradient(circle at 20% 30%, color-mix(in srgb, var(--room) 25%, transparent), transparent 40%),
    radial-gradient(circle at 80% 70%, color-mix(in srgb, var(--journal) 20%, transparent), transparent 45%);
  animation: seyAurora 14s ease-in-out infinite;
  opacity: 0.7;
}
.sey-splash-content {
  position: relative;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
}
.sey-splash-wordmark {
  font-family: 'Snell Roundhand', 'Brush Script MT', 'Segoe Script', cursive;
  font-size: 48px;
  font-weight: 800;
  color: var(--text);
  animation: seyFloatIn 0.8s ease both;
}
.sey-splash-flam {
  font-size: 38px;
  display: inline-block;
  animation: seyFlamBob 4s ease-in-out infinite;
  margin-left: 6px;
}
.sey-splash-greeting {
  font-size: var(--f-callout);
  color: var(--muted);
  animation: seyFloatIn 0.8s 0.25s ease both;
}

@media (prefers-reduced-motion: reduce) {
  .sey-splash,
  .sey-splash-aurora,
  .sey-splash-wordmark,
  .sey-splash-flam,
  .sey-splash-greeting {
    animation: none !important;
    transition: none !important;
  }
}
```

---

## 3.3 Splash JS

**Dosya:** `/Users/m_ras/Desktop/seyma/app.js`

**Boot akışına eklenecek:**

```js
function hideSplash(){
  var el = document.getElementById('sey-splash');
  if(!el) return;
  el.classList.add('is-done');
  setTimeout(function(){ if(el.parentNode) el.parentNode.removeChild(el); }, 350);
}

function updateSplashGreeting(){
  var h = new Date().getHours();
  var g = (h >= 5 && h < 11) ? 'Günaydın, Günışığı' :
        (h < 18) ? 'İyi günler, Günışığı' :
        (h < 22) ? 'İyi akşamlar, Günışığı' : 'İyi geceler, Günışığı';
  var el = document.getElementById('sey-splash-greeting');
  if(el) el.textContent = g;
}

// app.js boot sırasında:
updateSplashGreeting();
// localStorage okunduktan / migrate sonrası:
// hideSplash() çağrılır.
```

**Koşullar:**
- `settings.launchRitual === false` ise splash hiç gösterilmemeli (CSS’te `display:none` veya JS’te hemen `hideSplash`).
- Splash, `localStorage` okunana kadar görünür; ama maksimum 3 saniye sonra otomatik kapanmalı (timeout güvenlik duvarı).

---

## 3.4 Veri Durumuna Göre Karşılama

**Eklenebilecek mesajlar:**

| Durum | Mesaj |
|-------|-------|
| Normal gün, kayıt yok | “Bugünü birlikte dolduralım, Günışığı.” |
| Dün kaydedilmemiş | “Dünü kaçırmış olabilirsin, bugün devam edelim.” |
| Bugün kaydedilmiş | “Bugün zaten parlıyor, devam et.” |
| Uzun streak | “X günlük seri, harika.” |

**Not:** Bu mesajlar sadece splash’te gösterilir; uygulama içinde `weatherHeaderHTML` zaten benzer karşılama yapıyor.

---

## 3.5 Reduce Motion Uyumu

- Aktifse splash animasyonları devre dışı.
- Gizleniş anında anında kalkabilir veya kısa opacity geçişi.

---

## 3.6 Test Planı

### `tests/app/test_premium_launch_splash.js`

**Seneryolar:**
1. `#sey-splash` elementi mevcut.
2. `settings.launchRitual === false` ise hemen gizli.
3. `settings.launchRitual === true` ise belirli bir süre görünür.
4. `hideSplash()` çağrıldığında `is-done` class eklenir.
5. Reduce motion aktifse animasyon class’ı yok.

---

## 3.7 Çıktı Listesi

- [ ] `index.html` splash HTML spec’i
- [ ] `app/styles.css` splash CSS spec’i
- [ ] `app.js` splash JS entegrasyonu spec’i
- [ ] Karşılama mesajları matrisi
- [ ] Test skeleton
