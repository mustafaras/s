# TEŞHİS — "Neden Hâlâ Premium Hissettirmiyor?"

**Tarih:** 2026-09-06
**Yöntem:** Belge iddiaları yok sayıldı; yalnızca `app.js`, `app/styles.css`,
`app/core/mediaFx.js`, `app/core/timeTheme.js`, `app/core/state.js` ve
`index.html` üzerinden sayım yapıldı. Her satır tekrar üretilebilir bir
`grep`/`node` komutuna dayanır.
**Sonuç:** FX serisi bir **API** üretti, bir **deneyim** üretmedi. 91 prompt
uygulandı, ~70 fixture yeşil, ve kullanıcının parmağının değdiği yüzeyde
neredeyse hiçbir şey değişmedi. Aşağıdaki 7 kök neden bunu açıklıyor.

---

## 0. Tek Cümlelik Özet

> FX motoru yazıldı ama **prize takılmadı**: `SeyAudio.tap()` uygulamanın
> hiçbir yerinden çağrılmıyor, `SeyFx.ripple()` çağrılamayacak şekilde bağlı,
> `.sey-ripple/.sey-shimmer/.sey-enter` sınıfları hiçbir markup'a basılmıyor,
> ve haptik katmanının tamamı hedef cihazda (iOS Safari) sessiz bir no-op.

---

## 1. Kanıt Tablosu (ham sayılar)

| Ölçüm | Değer | Komut |
|---|---:|---|
| `app.js` satır | **17.470** | `wc -l app.js` (belgelerdeki 18.805 bayat) |
| `App.<ad>=` handler (benzersiz) | **717** | `grep -oE 'App\.[A-Za-z0-9_]+\s*=[^=]' … \| sort -u \| wc -l` |
| `onclick=` | **391** | `grep -o 'onclick=' app.js \| wc -l` |
| `oninput=` / `onchange=` | **66 / 41** | aynı desen |
| `<button>` toplam | **361** | `grep -o '<button' app.js \| wc -l` |
| …`class=` taşıyan | **89** | `grep -o '<button[^>]*class=' app.js \| wc -l` |
| …yalnız `style=` taşıyan | **277** | `grep -o '<button[^>]*style=' app.js \| wc -l` |
| `styles.css` satır / `@keyframes` | **1.804 / 48** | `wc -l`, `grep -c '@keyframes'` |
| `:active` / `:hover` kuralı | **35 / 32** | `grep -c ':active'` |

### FX çağrı noktaları — gerçek sayım

| API | app.js'te çağrı | Not |
|---|---:|---|
| `SeyAudio.tap` | **0** | 🔴 Hiçbir buton ses çıkarmıyor |
| `SeyAudio.success` | 4 | yalnız kutlama anları |
| `SeyAudio.warning` | 4 | |
| `SeyAudio.bell` | 5 | |
| `SeyAudio.voice` / `guides` / `greeting` | 6 / 4 / 1 | varsayılan **kapalı** |
| `SeyAudio.ambient` | 2 | varsayılan **kapalı** |
| `SeyHaptics.*` | 21 | 🔴 iOS'ta tamamı no-op (§4) |
| `SeyFx.ripple` | **1** | 🔴 tetiklenemez (§3) |
| `SeyFx.shimmer` | 3 | |
| `SeyFx.countUp` | **1** | yalnız su sayacı |
| `SeyFx.enter` | **1** | yalnız sekme değişimi |
| `SeyFx.transition` | 2 | |
| `SeyTimeTheme.apply/applySeasonal` | 2 | etkisi §6'da |

**Kapsam oranı:** 717 `App.*` handler'ının **~25'i (%3,5)** herhangi bir FX
tetikliyor. 361 butonun **0'ı** FX katmanından basma geri bildirimi alıyor.

### CSS sınıfları — yazıldı, kullanılmadı

```
grep -c 'sey-ripple'  app.js → 0   |  app/styles.css → 5
grep -c 'sey-shimmer' app.js → 0   |  app/styles.css → 6
grep -c 'sey-enter'   app.js → 0   |  app/styles.css → 5
```

Üç görsel efektin de CSS'i var, **hiçbiri markup'a basılmıyor.**

---

## 2. R1 — Ortak bir "dokunulabilir eleman" primitifi yok

361 butonun **277'si** baştan sona satır içi `style="..."` ile boyanmış;
yalnız 89'unda `class` var ve o sınıflar da 25 ayrı ada dağılmış
(`sey-reminder-secondary` 22, `sey-reminder-primary` 9, `sey-asbtn` 5, …).

Sonuç: **basma durumunu tutturacak tek bir CSS kancası yok.** Ne
`:active` ölçeklemesi, ne ripple konteyneri (`position:relative;overflow:hidden`),
ne odak halkası, ne yükseklik (elevation) tutarlılığı takılabilir.

Üstüne, `-webkit-tap-highlight-color:transparent` **6 yerde** tanımlı: oralarda
tarayıcının kendi dokunma parıltısı da söndürülmüş ve yerine hiçbir şey
konmamış. Yani o butonlar **tamamen ölü** hissettiriyor.

> `.surface:active{transform:scale(.97)}` var ama `.surface` bir **kart**
> sınıfı (70 kullanım) — kartın içindeki butona basınca **bütün kart**
> küçülüyor. Bu premium değil, hatalı hissettiren bir davranış.

---

## 3. R2 — Ripple mimari olarak tetiklenemez durumda

`SeyFx.ripple(event)` `event.currentTarget` istiyor. Tek çağrı noktası
`App.go` (satır 5882) ve kodun kendi yorumu durumu itiraf ediyor:

> `// ripple yalnız event geçilirse (dokunma noktası) çalışır; mevcut
> onclick'ler event geçmediği için güvenle atlanır.`

Doğrulama:

```
grep -o 'onclick="App\.[A-Za-z]*(event' app.js | wc -l   → 0
grep -o "App\.go('[a-z]*'[^)]*)"        app.js           → hiçbirinde 2. argüman yok
```

**Uygulamada tek bir ripple bile oynamıyor** — ve oynasaydı bile ana eleman
`.sey-ripple` sınıfını taşımadığı için dalga kırpılmadan taşacaktı.

---

## 4. R3 — Haptik katmanı hedef cihazda tamamen sessiz

`SeyHaptics.*` → `navigator.vibrate`. **iOS Safari Vibration API'yi
desteklemez.** `index.html` `apple-mobile-web-app-capable`,
`apple-touch-icon`, `apple-mobile-web-app-title` taşıyor; CLAUDE.md hedefi
"mobile Safari/Chrome, ≤460px" diyor — yani birincil cihaz iPhone.

Dolayısıyla iki dalganın (Faz 2, 21 çağrı noktası) **kullanıcı tarafındaki
karşılığı sıfır.** Fixture'lar `navigator.vibrate` stub'ıyla test ettiği için
bu hiç görünmedi.

---

## 5. R4 — Ses tasarımı "enstrüman" değil, "bip"

`mediaFx.js` ham osilatör kullanıyor: filtre yok, gürültü transienti yok,
harmonik yok, reverb yok, kompresör yok, varyasyon yok.

| Ses | Şu anki | Sorun |
|---|---|---|
| `tap()` | 523 Hz triangle, **180 ms** | UI tıkı için 3–6× fazla uzun; "biiip" |
| `success()` | 2 nota sine arpej, 200 ms | ince, gövdesiz |
| `warning()` | 200 Hz **sawtooth**, 250 ms | sert, ucuz, rahatsız |
| `bell()` | saf sine + 6 Hz vibrato | çanın harmonikleri yok → **test tonu** |

Ayrıca her çalışta **birebir aynı** ses üretiliyor (pitch/velocity rastgeleliği
yok) — arka arkaya basınca "makineli tüfek" etkisi doğar. Master bus, limiter
ve polifoni sınırı olmadığı için çakışan sesler klipliyor.

---

## 6. R5 — "Premium" görünürlüğü varsayılan olarak kapalı

`app/core/state.js` `migrate()` varsayılanları:

| Ayar | Varsayılan | Sonuç |
|---|---|---|
| `premiumAtmosphere` | `true` | ✅ |
| `uiSounds` | `true` | ✅ ama tap sesi çağrılmıyor (§1) |
| `richHaptics` | `true` | ⚠️ iOS'ta no-op (§4) |
| `launchRitual` | **`false`** | 🔴 Açılış ritüeli hiç kimseye görünmüyor |
| `voiceGuidance` | **`false`** | 🔴 Sesli rehberlik ölü |
| `ambientSounds` | **`false`** | 🔴 Ambiyans ölü |
| `voiceCloudTts` | `true` ama `openaiKey` şart | 🔴 anahtarsız = sessiz |
| `voiceLocalFallback` | **`false`** | 🔴 anahtar yoksa **hiç** ses yok |

FX-P-55/85 ile yazılan splash ritüeli, FX-P-51…58'in tüm ses katmanı ve
FX-P-53 ambiyans motoru **kutunun içinde kapalı geliyor**.

Geriye kullanıcının gerçekten gördüğü şey kalıyor: aurora katmanı, nav bounce,
badge pop, `.surface` hover ve 5 kutlama sesi. Hepsi bu.

---

## 7. R6 — Zaman teması neredeyse görünmez

`#root.theme-time-*` sınıfları yalnız **iki elemanın `box-shadow` rengini**
değiştiriyor (`.sey-appheader`, `.sey-bottomnav-surface`). Sayfa zemini
(`--page`/`--bg`), kart rengi, aksan rengi **hiç değişmiyor**. Plan "sabah/
öğlen/akşam/gece gradient geçişi" diyordu; uygulanan şey bir gölge tonu.

Mevsimsel sınıflar da aynı iki elemanın gölgesinde kalıyor.

---

## 8. R7 — Hareketin sistemi yok, birikintisi var

48 `@keyframes`, 82 `transition:` bildirimi, süreler ve eğriler dosya boyunca
elle serpiştirilmiş. Tek bir `--ease-premium` token'ı var ama tutarsız
kullanılıyor; **süre skalası yok, elevation skalası yok, stagger sistemi yok,
yay (spring) yok.** Bu yüzden ekranlar birbirine benzemiyor; premium his
tutarlılıktan doğar, tekil efektten değil.

Üstüne render mimarisi hareketi zaten öldürüyor: `render()` her seferinde
`app.innerHTML = html` ile **bütün ekranı yıkıp yeniden kuruyor** (51 adet
`innerHTML=` ataması). Çıkış animasyonu imkânsız, süreklilik yok, DOM
kimliği korunmadığı için hiçbir geçiş "taşınmış" hissetmiyor.

---

## 9. R8 — Doğrulama yanlış şeyi ölçtü (kök nedenin kök nedeni)

Bu, tekrar yaşanmaması gereken asıl ders:

```
$ for f in tests/app/test_premium_*.js; do node "$f"; done
→ 9/9 PASS
$ grep -c 'SeyAudio\.tap' app.js
→ 0
```

**Tüm premium fixture'lar yeşilken uygulamanın hiçbir butonu ses çıkarmıyor.**
Çünkü fixture'lar `mediaFx.js` modülünün *iç davranışını* test ediyor,
modülün *uygulamaya bağlanıp bağlanmadığını* değil.

Aynı hata daha önce de yakalanmıştı: `applySeasonal` ~3 ay bağlanmadan durdu,
`premiumAtmosphere` hiç `migrate()`'e yazılmadı (commit `1ec2499`). Yani bu
sistematik: **"kod yazıldı" ≠ "bağlandı" ≠ "hissediliyor".**

---

## 10. FX-2 için Bağlayıcı Sonuçlar

1. Yeni serinin birimi **API değil, kapsam (coverage)** olacak. Her prompt
   ölçülebilir bir kapsam sayısını yükseltmek zorunda.
2. Bağlama, 361 butona tek tek dokunarak değil, **tek bir delege edilmiş
   pointer katmanıyla** yapılacak — `innerHTML` yeniden kurulumundan sağ çıkan
   tek mimari budur.
3. iOS'ta haptik yoksa yerine **ses + görsel basma durumu** konacak; haptik
   bonus olarak kalacak.
4. Ses motoru bip'ten enstrümana yükseltilecek (filtre, transient, harmonik,
   reverb, varyasyon, limiter).
5. Varsayılanlar dürüstleştirilecek: kapalı gelen premium özellik, olmayan
   özelliktir.
6. Kapanış kapısı **`node tools/fx-coverage.mjs` raporu** olacak; "fixture
   yeşil" tek başına yeterli sayılmayacak.

> Devam: [`PLAN-FX2.md`](PLAN-FX2.md) · Ölçüm sözleşmesi:
> [`KAPSAM-OLCUMU.md`](KAPSAM-OLCUMU.md)
