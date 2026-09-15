# MON2 sonrası bulgular (2026-09-15)

MON2 serisi kapandıktan sonra yapılan **yerel görsel QA** sırasında bulunan
gerçek kusurlar. Bunlar MON2 kartlarından değil, daha eski MON kartlarından
(MON-35 / MON-45) kaynaklanır; MON2 bu bulguları **yakaladı**.

---

## BULGU-01 · Harita sekmesi ilk açılışta çöküyordu (DÜZELTİLDİ)

**Şiddet:** HIGH — sekme hiç açılmıyordu.
**Köken:** MON-35 (map registry) + MON-45 (render taşıması) arasındaki sahiplik kayması.
**Bulunma:** Yerel QA, `App.go('harita')` + `ui.calMonth` tanımsız.

### Belirti

```
TypeError: Cannot read properties of undefined (reading 'split')
    at renderHarita (app/core/map.js:240)
    at haritaHTML  (app/core/map.js:318)
    at mapTabHTML  (app.js:861)
    at call        (app/core/render.js:49)
    at mapTabHTML  (app/core/render.js:85)
    at haritaHTML  (app/core/render.js:1767)
    at paint       (app/core/render.js:360)
```

### Kök neden

`ui.calMonth` yalnız üç yerde kuruluyordu: `App.calMove`, `App.calToday`,
`App.heatOpen` — hepsi **kullanıcı etkileşimi**. Uygulamaya doğrudan Takvim
sekmesiyle girildiğinde hiçbiri çalışmaz ve `calMonth` tanımsız kalır.

`app.js:710`'da korumalı bir sarmalayıcı vardı:

```js
function haritaHTML(){
  var today=todayStr();
  if(!ui.calMonth) ui.calMonth=today.slice(0,7);   // ← koruma
  return SEYMA_RENDER.haritaHTML.apply(null,arguments);
}
```

**Ama render zinciri bu sarmalayıcıyı hiç çağırmıyor.** Gerçek yol:

```
render.js:360  → haritaHTML()   [render.js:1767 — render.js'in KENDİ tanımı]
               → mapTabHTML()   [render.js:85]
               → call('mapTabHTML')
               → app.js:861 mapTabHTML
               → SEYMA_MAP.haritaHTML()   ← app.js:710 ATLANIYOR
               → renderHarita()
               → ui.calMonth.split('-')   💥
```

Yani `app.js:710`'daki koruma **ölü kod**; MON-45'te render zinciri render.js'e
taşınırken koruma eski katmanda kaldı.

### Düzeltme

Koruma **asıl sahibi olan** `app/core/map.js` `renderHarita` içine taşındı:

```js
if(!ui.calMonth||typeof ui.calMonth!=='string'||ui.calMonth.indexOf('-')<0) ui.calMonth=today.slice(0,7);
```

`app.js:710`'daki blok **silinmedi** (MON2 kapsamı dışı; `*HTML` builder sayımı
pinli) — yorumla işaretlendi ve bu belgeye bağlandı.

### Doğrulama

| Senaryo | Önce | Sonra |
|---|---|---|
| `SeymaMap.haritaHTML()` + `calMonth` tanımsız | ❌ çöküyor | ✅ 20.204 bayt |
| `App.go('harita')` + `calMonth` tanımsız (canlı) | ❌ hata + sekme açılmıyor | ✅ **0 hata**, "Eylül 2026" takvimi, 30 gün, ay özeti |

Cache-bust: `map.js` → `20260915a`, `app.js` → `20260915c` + 4 app_surface pin'i
+ `test_map_boundary` / `test_journal_boundary` literal pin'leri.

---

## Bilinen sınırlar (kusur değil)

| Konu | Durum | Açıklama |
|---|---|---|
| `guides.suraOpen` / `guides.suraBookmark` | Tanımlı, **çağrılmıyor** | Kur'an sûre açma / yer imi akışında sesli ipucu bağlanmamış (FX-P-55 kapsamı). Ölü API. |
| `app.js:710` haritaHTML sarmalayıcısı | Ölü kod | Yukarıda; MON2 sonrası ayrı bir programda temizlenebilir. |
| Konum kapısı | Test ortamında geçilemiyor | Gerçek GPS gerekir — **tasarım gereği doğru** (yerel QA'da state ile aşılır). |
| Auth kilidi | Parola bilinmiyor | Statik hash (`AUTH_HASH`); `migrate()` auth alanlarını sıfırlar — güvenlik tasarımı. |

---

## Yerel QA yöntemi (tekrarlanabilir)

```bash
python3 -m http.server 9000 --bind 127.0.0.1   # DATA SAFETY: yalnız loopback, token yok
# Tarayıcıda: 127.0.0.1:9000 → konum kapısı + auth state ile aşılır (sentetik seed)
pkill -f "http.server 9000"                     # turn bitmeden KAPAT
```

**Guard 1 doğrulandı** (`sync.js:223, 988-992`): localhost'tan push engelli —
token olsa bile veri yazılamaz.
