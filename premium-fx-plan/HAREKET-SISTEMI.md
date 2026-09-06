# HAREKET SİSTEMİ — Token'lar, Geçişler, Malzeme

**Uygulayan kartlar:** FX2-02, FX2-07, FX2-15 … FX2-18, FX2-24 … FX2-25.
**Sorun:** 48 `@keyframes`, 82 `transition:` — süre ve eğri her yerde elle
yazılmış. Premium his **tutarlılıktan** doğar; şu an tutarlılık yok
(`M7 motionTokenCompliance = 0,21`).

---

## 1. Token Skalası (FX2-02 — `app/styles.css` `:root`)

```css
/* Süre — 5 adım, hepsi bu skaladan seçilir */
--dur-1: 120ms;   /* basma durumu, mikro geri bildirim */
--dur-2: 200ms;   /* buton/ikon durum değişimi */
--dur-3: 320ms;   /* kart girişi, sekme geçişi */
--dur-4: 480ms;   /* overlay/sheet */
--dur-5: 800ms;   /* zemin/tema crossfade */

/* Eğri — anlamına göre */
--ease-out:    cubic-bezier(.16, 1, .3, 1);      /* giriş (mevcut --ease-premium) */
--ease-in:     cubic-bezier(.7, 0, .84, 0);      /* çıkış */
--ease-spring: cubic-bezier(.34, 1.56, .64, 1);  /* toggle, badge, bounce */
--ease-glide:  cubic-bezier(.65, 0, .35, 1);     /* zemin, uzun crossfade */

/* Yükseklik — 4 kademe, katmanlı gölge + iç ışık */
--elev-0: none;
--elev-1: 0 1px 2px rgba(0,0,0,.04), 0 2px 8px rgba(0,0,0,.04),
          inset 0 1px 0 rgba(255,255,255,.30);
--elev-2: 0 2px 4px rgba(0,0,0,.05), 0 8px 20px rgba(0,0,0,.06),
          inset 0 1px 0 rgba(255,255,255,.34);
--elev-3: 0 4px 8px rgba(0,0,0,.06), 0 16px 36px rgba(0,0,0,.09),
          inset 0 1px 0 rgba(255,255,255,.38);
--elev-4: 0 8px 16px rgba(0,0,0,.08), 0 28px 60px rgba(0,0,0,.13),
          inset 0 1px 0 rgba(255,255,255,.42);

/* Basma */
--press-scale: .965;
--press-dim:   .92;
```

**Geriye uyum:** `--ease-premium` **silinmez**, `var(--ease-out)`'a takma ad
olur — 30+ mevcut kullanım kırılmaz.

**Koyu tema:** `--elev-*` `#root[data-theme="dark"]` bloğunda daha yüksek
opaklık + daha düşük iç ışıkla yeniden tanımlanır.

**Reduced-motion:** tek blokta tüm `--dur-*` `1ms`'ye çekilir; kural tek yerde
kalır, 48 keyframe'e ayrı `!important` yazılmaz.

---

## 2. Basma Durumu (FX2-07)

Markup değişmez. Delege katman `pointerdown`'da `.sey-press` sınıfını takar,
`pointerup/cancel/leave`'de kaldırır.

```css
.sey-press{
  transform: scale(var(--press-scale));
  filter: brightness(var(--press-dim));
  transition: transform var(--dur-1) var(--ease-out),
              filter    var(--dur-1) var(--ease-out);
}
```

**Kritik düzeltme:** mevcut `.surface:active{transform:scale(.97)}` kaldırılır.
`.surface` bir **kart** sınıfı; kartın içindeki butona basınca bütün kartın
küçülmesi hatalı bir davranış (TEŞHİS §2).

---

## 3. Sekme Geçişi (FX2-15)

`render()` `app.innerHTML = html` ile ekranı yıkar → çıkış animasyonu doğal
olarak imkânsız. Çözüm `render()`'ı **sarmalamak**, değiştirmemek (I7):

```
App.go(id)
  └─ tabChanged ise:
       1. #app'e .sey-leaving   (opacity 0 → translateY 6px, --dur-2/--ease-in)
       2. transitionend VEYA 200ms timeout   ← ikisinden hangisi önce gelirse
       3. render()               ← mevcut yol, sözleşme aynı
       4. #app'ten .sey-leaving kaldır, .sey-entering ekle
       5. çift rAF sonra .sey-entering kaldır
```

- Adım 2'deki **timeout zorunlu**: `transitionend` gelmezse (reduced-motion,
  arka plan sekmesi, düşük güç modu) uygulama asla kilitlenmemeli.
- `reduced-motion` veya premium kapalıysa **doğrudan adım 3**.
- Scroll/odak restorasyonu `render()` içinde kalır, dokunulmaz.

---

## 4. Overlay Hareketi (FX2-16)

13 overlay (`reading`, `watching`, `listening`, `zikr`, `qibla`, `faith`,
`quranJourney`, `saygiPerson`, `soulArchive`, `soulActivity`, `learning`,
`reminderCenter`, `crisis`) `ui.xOpen=false; render()` ile **anında** yok
oluyor.

```
App.closeX()
  └─ premium açık ve reduced-motion kapalıysa:
       1. overlay kartına .sey-sheet-out (translateY 100% + opacity, --dur-3/--ease-in)
          backdrop'a .sey-backdrop-out (blur 14px→0)
       2. 260ms timeout → mevcut kapatma gövdesi aynen çalışır
     değilse: mevcut gövde doğrudan
```

Kapatma gövdesi (state temizliği, `render()`, odak restorasyonu) **hiç
değişmez** — yalnız çalışma anı geciktirilir. Odak yönetimi
(`App.onModalKeydown`, `focusModalDialog`) sözleşmesi korunur.

Açılış: `.sey-sheet-in` — `translateY(100%) → 0`, `--dur-4/--ease-spring`;
backdrop `blur(0) → blur(14px)` `--dur-3`.

---

## 5. Stagger (FX2-17)

JS düğüm gezmez. Markup üretilirken indeks CSS değişkeni basılır:

```js
'<div class="surface sey-stagger" style="--i:'+i+'">'
```

```css
.sey-stagger{ animation: sey-fade-in var(--dur-3) var(--ease-out) backwards;
              animation-delay: calc(var(--i, 0) * 35ms); }
@media (prefers-reduced-motion: reduce){ .sey-stagger{ animation: none; } }
```

`--i` **en fazla 8** ile sınırlanır (`Math.min(i,8)`) — uzun listede son kart
yarım saniye beklemez.

---

## 6. Sayaç ve Halka (FX2-18)

- `SeyFx.countUp` şu an **tek** yerde (su). Hero istatistiklerinin tamamına
  `data-countup="<yeniDeğer>"` özniteliği basılır; `render()` sonrası tek bir
  tarama eski/yeni değeri karşılaştırıp canlandırır.
- İlerleme halkaları: `stroke-dashoffset` üzerine
  `transition: stroke-dashoffset var(--dur-4) var(--ease-out)`.
  `ringSeg`/`progBar` **imzaları değişmez** (I2), yalnız stil eklenir.

---

## 7. Malzeme ve Atmosfer (FX2-24, FX2-25)

- **Elevation:** 70 `.surface` kullanımı `--elev-2`, overlay `--elev-4`,
  header/nav `--elev-3`'e bağlanır. Tek gölge → katmanlı gölge + kenar ışığı.
- **Zaman teması → canlı zemin:** bu iş bu belgeden çıkarıldı ve kendi
  dalgasına taşındı. Ayrıntı: [`RENK-VE-ZEMIN.md`](RENK-VE-ZEMIN.md) Bölüm B
  (FX2-19…23). Orada zemin yalnız saat dilimine değil **gerçek güneş saatine,
  havaya ve mevsime** göre değişir (192 kombinasyon).
- **Aurora v2 (FX2-25):** `#sey-aurora` scroll'a göre `translate3d` parallax
  (`will-change: transform`), grain `::before`'da. `::after` **hava
  katmanınındır** (FX2-21) — çakışmaz. GPU katmanı **en fazla 2**.

---

## 8. Performans Çitleri (I8)

- Yalnız `transform` / `opacity` / `filter` animasyonu — `width`, `height`,
  `top`, `left`, `box-shadow` **animasyonda yasak**.
- `will-change` yalnız animasyon süresince; bitince kaldırılır.
- Delege katman `{passive:true}`; `pointerdown` işi ≤ 4 ms.
- Aynı anda ≤ 2 kalıcı sonsuz animasyon (aurora + shimmer).
