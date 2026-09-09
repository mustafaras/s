# SKY-10 — app.js entegrasyonu

**Kart 10/15 · Faz 3 · Dosya: `app.js` (~25 satır) + `index.html` (?v= bump)**

> **Önce `SKY-00-ONBILGI.md` oku.** Bu kartta SADECE aşağıdaki iş var.
> Başka dosyaya dokunma. Karar gerekiyorsa DUR ve kullanıcıya sor.

---

## 1. AMAÇ

Canvas motorunu uygulamaya **bağla**. Şu ana kadar motor yazıldı ama hiçbir
yerden çağrılmıyor — bu, FX-1'in düştüğü tuzağın ta kendisi
("API yazıldı, prize takılmadı"). Bu kart prize takar.

## 2. ⚠️ EN KRİTİK KISIT — DEĞİŞMEZLER

Bu kart `app.js`'e dokunuyor. **Yeni `App.<ad>` handler'ı EKLEME** ve
**`onclick=` sayısını DEĞİŞTİRME**. Sadece mevcut fonksiyonların içine
çağrı ekliyorsun.

## 3. NE YAPACAKSIN

### Adım 1 — sahne nesnesi üreticisi

`app.js` içinde `function syncHeaderScene(){` satırını bul.
**ÜSTÜNE** şu fonksiyonu ekle:

```javascript
// SKY: SeyAmbience sahnesini canvas motorunun beklediği şekle çevirir.
// Yeni ağ çağrısı YOK — hepsi zaten canlı olan data.weather'dan gelir.
function skySceneNow(){
  if(!window.SeyAmbience || typeof window.SeyAmbience.scene!=='function') return null;
  var sc; try{ sc = window.SeyAmbience.scene(); }catch(e){ return null; }
  if(!sc) return null;
  var spot = (data && data.weather && data.weather.spots && data.weather.spots.length)
    ? data.weather.spots[0] : null;
  return {
    time: sc.time, weather: sc.weather, season: sc.season,
    isDay: sc.isDay, intensity: sc.intensity, seed: sc.seed,
    solar: headerSolarProgress(spot),
    wind: spot && spot.wind != null ? Number(spot.wind) : 0
  };
}
// SKY: canvas'ı header gökyüzü host'una bağla. render() header'ı yıktığı için
// her boyamada yeniden çağrılır; parçacık durumu modülde yaşadığı için
// süreklilik korunur.
function mountSkyCanvas(){
  if(!window.SeySkyFx || typeof window.SeySkyFx.mount!=='function') return;
  var host = document.querySelector('.sey-hdr-sky');
  if(!host){ try{ window.SeySkyFx.unmount(); }catch(e){} return; }
  var sc = skySceneNow(); if(!sc) return;
  try{ window.SeySkyFx.mount(host, sc); window.SeySkyFx.update(sc); }catch(e){}
}
```

### Adım 2 — `syncHeaderScene` sonunda çağır

`syncHeaderScene` fonksiyonunun **en son satırı** olarak (kapanış `}`'ından
hemen önce) ekle:

```javascript
  mountSkyCanvas();
```

### Adım 3 — render sonrası çağır

`app.js` içinde şu satırı bul:

```javascript
  try{ if(window.SeyFx && typeof window.SeyFx.sweepCounters==='function') window.SeyFx.sweepCounters(); }catch(e){}
```

**ALTINA** ekle:

```javascript
  try{ mountSkyCanvas(); }catch(e){}
```

### Adım 4 — cache-busting

`index.html` içinde `app.js?v=` değerini bir artır (örn. `20260908f` →
`20260909a`).

## 4. DOĞRULAMA

```bash
node --check app.js
node tests/app/test_sky_fx.js
for t in tests/app/*.js tests/panel/*.js tests/quran/*.js; do
  node "$t" >/dev/null 2>&1 || echo "FAIL $t"; done
node .claude/skills/run-seyma/driver.mjs 2>&1 | grep -c '^FAIL'
grep -oE 'App\.[A-Za-z0-9_]+\s*=[^=]' app.js | grep -oE 'App\.[A-Za-z0-9_]+' | sort -u | wc -l
grep -o 'onclick=' app.js | wc -l
```

**Beklenen:** test PASS · başka FAIL yok · driver `0` · handler **718** ·
onclick **391**

## 5. DUR VE SOR

- handler 718 **değilse**: DUR, yeni `App.` tanımı eklemişsin, geri al.
- driver `0` değilse: DUR, `mountSkyCanvas` bir hata fırlatıyor olabilir.

## 6. BİTİRME

```bash
git add app.js index.html
git commit -m "sky: SKY-10 canvas motorunu app.js'e bagla

skySceneNow() + mountSkyCanvas(); syncHeaderScene ve render kuyrugundan
cagrilir. Yeni App.* handler'i YOK, onclick sayisi degismedi.
Dogrulama: handler 718, onclick 391, driver 0 FAIL.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

`SKY-STATE.json` → `"SKY-10": "done"`
