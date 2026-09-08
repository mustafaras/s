# Şeyma — Tam Denetim Promptu (kod tarafı + uygulama tarafı + ekran görüntüsü)

> **Nasıl kullanılır:** Yeni bir oturum aç ve şunu yaz:
> *"`docs/TAM-DENETIM-PROMPTU.md` dosyasını oku ve baştan sona uygula."*
>
> Bu belge **salt-okur denetim** talimatıdır. Uygulama kodunu değiştirmez;
> yalnız ne çalışıyor / ne çalışmıyor / ne görünmüyor tespiti yapar ve
> ekran görüntüleriyle belgeler.

---

## 0. ÖNCE OKU (atlamadan)

| Dosya | Neden |
|---|---|
| `CLAUDE.md` → **DATA SAFETY** | Veri kaybı geçmişi var; kuralları ihlal etme |
| `docs/GELISTIRME-PLANI.md` | Özellik listesi + durum tablosu (denetimin özellik envanteri) |
| `premium-fx-plan/TESHIS.md` | FX-1 neden başarısız oldu: *"fixture modülü test etti, bağlantıyı test etmedi"* |
| `premium-fx-plan/PLAN-FX2.md` | 28 kart, değişmezler I1–I8, sözleşme S1–S8 |
| `premium-fx-plan/KAPSAM-OLCUMU.md` | M1–M13 metrikleri **ve neden yanıltıcı olabildikleri** |
| `premium-fx-plan/deliverables/FX2-BAGLANTI-DENETIMI.md` | Önceki **EKSİK** denetim (B1–B8). Doğrula ama bununla yetinme |
| `tests/README.md` | Mevcut fixture envanteri |

---

## 1. VERİ GÜVENLİĞİ — PAZARLIK YOK

1. `mustafaras/seyma-data` reposuna **yazma**. Okuma serbest.
2. Gerçek token / parola / 2FA **isteme, doldurma, otomatikleştirme**.
   Giriş ekranını sentetik `settings.auth` tohumuyla aş, **asla** parola alanı
   doldurma.
3. `?forceSync=1` kullanma, `localStorage['seyma-sync-force']` **set etme**.
   (`sync.js` Guard 1 zaten localhost push'unu engeller — bunu **doğrula**,
   ama tek güvenlik katmanı sayma.)
4. Sunucuyu yalnız `127.0.0.1`'e bind et. **Turn bitmeden durdur.**
5. Push / merge / deploy / tag **yok**.
6. Tüm test verisi **sentetik**. Kullanıcının gerçek `localStorage`'ına dokunma
   — daima **izole tarayıcı bağlamı** kullan.
7. Ekran görüntülerinde gerçek kişisel veri olmasın (sentetik tohum kullandığın
   için zaten olmayacak; yine de kontrol et).

---

## 2. ORTAM KURULUMU

### 2.1 Cache'siz sunucu (zorunlu — bayat asset denetimi bozar)

```python
# $TMPDIR/nocache.py
import functools, http.server
class H(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control","no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma","no-cache"); self.send_header("Expires","0")
        super().end_headers()
    def log_message(self,*a): pass
h=functools.partial(H, directory="/Users/m_ras/Desktop/seyma")
http.server.ThreadingHTTPServer(("127.0.0.1",9002),h).serve_forever()
```

`Cache-Control: no-store` başlığının gerçekten döndüğünü `curl -D -` ile doğrula.

### 2.2 Tarayıcı

chrome-devtools MCP · `new_page` + **`isolatedContext`** (temiz depolama) ·
`emulate` ile `viewport: 414x896x2,mobile,touch` (iPhone) ve ayrıca
`1280x900x2` (geniş) — **her iki boyutta da** ana yüzeyleri görüntüle.

### 2.3 Sentetik tohum — ZENGİN OLMALI

> ⚠️ **Önceki denetimin en büyük hatası buydu:** boş listelerle test edildi,
> bu yüzden `sey-stagger` her yerde 0 çıktı ve yanlış yorumlandı.
> Liste tabanlı özellikleri görebilmek için **her koleksiyonu doldur**.

`localStorage['seyma-reset-v1']` içine yaz (zorunlu alanlar):

- `version:2`, `startDate` (~30 gün önce), `lastOpenedDate`, `savedAt`
- `days`: **≥30 gün**, dolu — `mood`, `water`, `steps`, `ticks`, `note`,
  `meals`, `journal`, `prayer`, `zikr`, `soulActivities`, `caffeine`, `sleep`
- `settings.auth = {rememberMe:true, usernameHash:'qa', unlockedAt:<iso>}`
- `settings.locationEnabled:true` + `location:{lat,lng,acc,ts}`
- `settings.premiumAtmosphere/uiSounds/richHaptics:true`
- `weather.spots[0]` = `{code, isDay, precip, wind, sunrise, sunset, temp, hi, lo, uv}`
- **Koleksiyonlar dolu:** `library` (kitaplar+alıntılar), `watchlist`,
  `music`, `learning`, `soulArchive`, `reminders`, `luna.qa`, `aeon.qa`,
  `cycle.periods`, `body.weights`, `labResults`, `zikr` (preset+geçmiş),
  `quranJourney`
- `settings.ghToken:''`, `settings.openaiKey:''` (boş — gerçek anahtar YOK)

Kapıyı aç:

```js
if (window.data?.settings) window.data.settings.locationEnabled = true;
window.ui.locationGateState='granted'; window.ui.locationGateRequestInFlight=false;
window.App.go('bugun');
```

Boot sonrası doğrula: `SeyTouch._installed`, `SeyAudio._unlocked`,
`SeyFx.isPremiumFxEnabled()`, `#app.innerHTML.length > 50000`.

---

## 3. DENETİM YÖNTEMİ — ÜÇ SEVİYE (en kritik kural)

Her özellik **üç seviyede ayrı ayrı** raporlanır. Yalnız S1'e bakmak
denetimi geçersiz kılar.

| | Soru | Yöntem | Yetersiz kanıt |
|---|---|---|---|
| **S1 KOD** | Kaynakta var mı? | `grep`, fonksiyon/çağrı sayımı | — |
| **S2 ÇALIŞMA ZAMANI** | Gerçekten tetikleniyor mu? | API'ye **spy** tak, gerçek `pointerdown`/`pointerup` gönder, DOM'u ölç | "fonksiyon tanımlı" |
| **S3 ALGI** | Kullanıcı **görüyor/duyuyor** mu? | **piksel farkı**, ses **RMS**, kaplanma %, ekran görüntüsü | "sınıf basılıyor" |

**S1 ✅ + S2 ✅ + S3 ❌ = BULGU.** Bu kombinasyon serinin ana hatasıdır.

---

## 4. BÖLÜM A — KOD TARAFI ENVANTERİ

### A1. Özellik envanterini kaynaktan çıkar

```bash
# Tüm App.* handler yüzeyi (718 bekleniyor)
grep -oE 'App\.[A-Za-z0-9_]+\s*=[^=]' app.js | grep -oE 'App\.[A-Za-z0-9_]+' | sort -u > "$TMPDIR/handlers.txt"
wc -l "$TMPDIR/handlers.txt"

# Tüm overlay aç/kapat çiftleri  ← ÖNCEKİ DENETİM BUNU ATLADI
grep -oE 'App\.(open|close)[A-Za-z0-9_]+' app.js | sort -u

# Tüm HTML üreten fonksiyonlar (ekranlar)
grep -oE '^function [a-zA-Z0-9_]+HTML' app.js | sort -u

# data şeması kökleri
grep -oE 'd\.[a-z][A-Za-z0-9_]+' app/core/state.js | sort -u | head -60

# migrate() backfill edilen alanlar
grep -cE 'if\(.*===undefined|if\(typeof' app/core/state.js
```

Çıktıyı **özellik listesi** olarak sabitle. Rapordaki matrisin satırları bu olacak.

### A2. Modül yüzeyleri

`app/core/*.js` ve `app/content/*.js` içindeki her `window.X = {...}` için
metot listesi çıkar. Sonra **her metodun `app.js`'teki çağrı sayısını** say:

```bash
for m in <metotlar>; do printf '%-24s %s\n' "$m" "$(grep -o "SeyFx\.$m" app.js | wc -l)"; done
```

**0 çağrı = aday bulgu** (ölü API). Ama dolaylı erişimi (delegasyon,
`data-fx` niyet haritası) kontrol etmeden "ölü" deme.

### A3. CSS ↔ markup bağı

Her `sey-*` / `amb-*` / `theme-*` sınıfı için:
`CSS'te tanımlı mı?` × `app.js'te basılıyor mu?` × `çalışma zamanında DOM'da var mı?`

Üç sütunlu tablo çıkar. `CSS ✅ / app.js 0 / DOM 0` = ölü stil.
(Dikkat: `.sey-press`, `.sey-ripple` **runtime**'da `mediaFx.js` tarafından
eklenir — app.js'te 0 olması normaldir. DOM ölçümüyle doğrula.)

### A4. Statik sağlık

```bash
for f in app.js sync.js sw.js panel/panel.js app/core/*.js app/content/*.js tools/*.mjs; do
  node --check "$f" >/dev/null 2>&1 || echo "SYNTAX FAIL $f"; done

# Bayat cache: index.html'den SONRA değişen asset var mı?
# (zsh parametre genişletmesi + sandbox /tmp yasağı yanlış negatif verebilir —
#  ham `git log` zaman damgasıyla ÇAPRAZ KONTROL et)
```

---

## 5. BÖLÜM B — UYGULAMA TARAFI: TÜM YÜZEYLERİ GEZ

### B1. Ana sekmeler (7)
`bugun` · `saglik` · `aeon` · `saygi` · `takvim` · `rapor` · `ayarlar`

### B2. TÜM overlay'ler
A1'de çıkardığın `App.openX` listesinin **tamamını** gez. En az:

okuma · izleme · dinleme · öğrenme · ruh pratiği · zikirmatik · kıble ·
Kur'an Yolculuğu · İman Köşesi · Saygı kişi modalı · reminder merkezi ·
terapi odası · Günlük Işığı (journal) · kriz odası · profil değerlendirme ·
gün detayı · hava detayı · yedekleme/içe aktarma · ÆON ek dosya sayfası

### B3. Özel durumlar
açılış splash (`launchRitual:true`) · giriş ekranı · konum kapısı ·
boş durumlar (koleksiyon boşken) · hata durumları · offline

### B4. Her yüzey için ölç

```js
{ button, '[data-fx]', '.surface', '.sey-stagger', '.sey-enter',
  '.sey-ring-seg', '.sey-shimmer', '[data-countup]',
  appHTMLLength, rootClassName }
```

ve **ekran görüntüsü al** (§7 adlandırması).

---

## 6. BÖLÜM C — ÖZELLİK BAZLI DOĞRULAMA

### C1. Premium FX katmanı (FX-2, 28 kart)

Her kart için S1/S2/S3:

| Kart | Ne doğrulanacak |
|---|---|
| FX2-02 | `--dur-*/--ease-*/--elev-*/--press-*` **kullanılıyor** mu (yalnız tanımlı değil)? |
| FX2-03/04/05 | Şampanya altını, `--gold-1..5`, 8 kontrast çifti ≥4.5:1 |
| FX2-06/07 | `SeyTouch` kurulu; gerçek dokunuşta `.sey-press` |
| FX2-08 | Ripple: host hazırlama, taşma yok, `animationend`+timeout temizliği |
| FX2-09 | `data-fx` — **her yüzeyde kapsam yüzdesi** (buton başına) |
| FX2-11/12 | Ses motoru + 11 sesin her biri (§C3 RMS) |
| FX2-13 | iOS jest kilidi, `visibilitychange` suspend/resume |
| FX2-15 | Sekme geçişi `sey-leaving`→`sey-entering` (MutationObserver ile) |
| FX2-16 | `sheetClose`: 24 çağrı yerinin **kaçı gerçekten açılabiliyor**? Her overlay'i aç-kapat |
| FX2-17 | `sey-stagger` — **dolu listelerle** (boşsa ölçüm geçersiz) |
| FX2-18 | `data-countup` + `sey-ring-seg` (ringSeg hangi ekranlarda?) |
| FX2-19…23 | Canlı zemin → **§C2 zorunlu** |
| FX2-24 | `--elev-*` hangi yüzeylerde gerçekten uygulanıyor? |
| FX2-25 | Aurora parallax (`style.translate` değişiyor mu) + grain |
| FX2-26 | Varsayılanlar + **Ayarlar'da anahtarlar görünüyor ve çalışıyor mu?** |

### C2. CANLI ZEMİN — ÖZEL BÖLÜM ⚠️

> Kullanıcının ısrarlı şikâyeti: *"uygulamada hâlâ dinamik arkaplan ile ilgili
> hiçbir şey yok."* Sınıf ve renk ölçmek **YETMEZ** — algıyı ölç.

1. **Piksel farkı (asıl kanıt).** Aynı içerikle 4 zaman sahnesi
   (`amb-time-dawn/day/dusk/night`) ve 8 hava sahnesi (`amb-wx-*`) ekran
   görüntüsü al. Ardışık çiftlerin **ortalama mutlak piksel farkını (0–255)**
   hesapla.
   **Ölçüt:** ortalama fark `< 3` → pratikte görünmez → 🔴 BULGU.
2. **Kaplanma.** Görünen alanın yüzde kaçı opak kart/panel altında?
   Zemin kaç piksel gerçekten görünüyor? (Önceki ölçüm: **~%70 kapalı**.)
3. **Canlılık.** `setInterval` yok; sahne `render()`→`paint()` zincirine bağlı.
   Kullanıcı hiçbir şeye dokunmazsa 30 sn'lik poll sahneyi tazeliyor mu?
   Sistem saatini/`Date`'i ileri alıp doğrula.
4. **Veri bağı.** `data.weather.spots[0].code` = 0 → 3 → 45 → 63 → 75 → 95
   değiştirip her seferinde `paint()` sonrası sınıfın değiştiğini gör.
5. **Veri yokluğu.** `data.weather` boşken sahne geçerli mi
   (`amb-wx-none` + zaman/mevsim korunuyor)?
6. **Her iki tema.** Açık ve koyu ayrı ayrı — koyu temada sahneler siyaha
   yapışıyor mu?
7. **reduced-motion.** `emulate` ile aç: renk kalıp hareket duruyor mu?
8. **Mevsim + seed.** `amb-season-*` 6 değer ve `--amb-seed` gün içinde
   sabit / gün gün farklı mı?

Her sahne için **ekran görüntüsü zorunlu**.

### C3. SES — GERÇEKTEN SES ÇIKIYOR MU

> "Fonksiyon çağrıldı" kanıt **değildir**.

`AudioContext.destination` öncesine `AnalyserNode` tak, her sesten sonra
**RMS ölç**. RMS ≈ 0 → ses üretilmiyor → BULGU.
11 sesin her birini ayrı test et: `tick, tap, toggleOn, toggleOff, nav,
sheetOpen, sheetClose, success, bell, warning, error`.
Ayrıca: polifoni sınırı (≤6 kök), quiet-time (23–07) susturması,
`voiceGuidance` yolu (anahtarsız → yerel TTS fallback).

### C4. Uygulama özellikleri (FX dışı — `docs/GELISTIRME-PLANI.md` tablosu)

Durum tablosundaki **✅ işaretli her madde** için: gerçekten erişilebilir mi?
En az: ruh hali kaydı · su/adım · öğün · şükran · düşünce kaydı (CBT) ·
nefes/meditasyon · Günlük Işığı · döngü takibi · ilaç/reminder · PWA bildirim ·
geçmiş gün düzenleme · ısı haritası · rozet/seri · yedekleme · kafein ·
Günün Fotoğrafı · tatil modu · zihin-beden pratikleri · zikirmatik · kıble ·
hicri takvim · Saygı · İman Köşesi · Kur'an Yolculuğu · ÆON/Luna sohbeti ·
profil değerlendirme · terapi odası · kriz odası

Her biri için: **açılıyor mu → veri giriliyor mu → kaydediliyor mu →
panelde/raporda yansıyor mu** + ekran görüntüsü.

### C5. Gating matrisi

`premiumAtmosphere` × `uiSounds` × `richHaptics` × reduced-motion ×
quiet-time × `voiceGuidance` × `ambientSounds` × `launchRitual`

Kapalıyken **sızıntı** var mı? Açıkken **çalışmayan** var mı?

### C6. Panel yüzeyleri (ayrı regresyon alanı)
`panel.html` ve `panel-v2.html` — ayrı token'la, ayrı kod. Sentetik snapshot
ile aç, ana kartların render olduğunu ekran görüntüsüyle belgele.
**Gerçek token kullanma.**

---

## 7. EKRAN GÖRÜNTÜSÜ KURALLARI (zorunlu)

**Her özellik en az bir görüntüyle belgelenir.** Kayıt yeri:
`premium-fx-plan/assets/tam-denetim-<YYYYMMDD>/`

Adlandırma: `<alan>-<özellik>-<durum>.png`

```
sekme-bugun-koyu.png
sekme-bugun-acik.png
overlay-zikirmatik-sayac.png
overlay-kuran-liste.png
zemin-koyu-safak-acik.png
zemin-koyu-gece-kar.png
zemin-acik-aksam-yagmur.png
fx-ripple-dokunus-ani.png
fx-press-basili.png
bos-durum-okuma.png
hata-konum-kapisi.png
gating-premium-kapali.png
```

Kurallar:
- Zemin sahneleri için **aynı içerik/aynı scroll** ile çek (yoksa piksel farkı
  anlamsız olur).
- Öncesi/sonrası gerektiren bulgularda **çift** görüntü.
- Görüntülerde gerçek kişisel veri olmasın.
- Rapordaki her bulgu **ilgili görüntüye referans versin**.

---

## 8. DEĞİŞMEZLER — REGRESYON YOK KANITI

```bash
grep -oE 'App\.[A-Za-z0-9_]+\s*=[^=]' app.js | grep -oE 'App\.[A-Za-z0-9_]+' | sort -u | wc -l   # 718
grep -o 'onclick=' app.js | wc -l                       # 391
grep -c '<script src="app.js' index.html                # 1
grep -c 'preventDefault' app/core/mediaFx.js            # 0
grep -c 'setInterval'    app/core/timeTheme.js          # 0
grep -c 'fetch('         app/core/timeTheme.js          # 0
git log --oneline --grep='fx2:' -- sync.js | wc -l      # 0
git log --oneline --grep='fx2:' -- premium-fx-plan/MODULARIZATION.md | wc -l  # 0

node tools/fx-coverage.mjs --gate     # M7 dışında hepsi ✅ (M7=0.62 onaylı tavan)
for t in tests/app/*.js tests/panel/*.js tests/panel-v2/test_panel_v2_*.js tests/quran/*.js; do
  node "$t" >/dev/null 2>&1 || echo "FAIL $t"; done      # 0 FAIL
node tests/reminders/run-reminder-smoke.mjs
node .claude/skills/run-seyma/driver.mjs 2>&1 | grep -c '^FAIL'   # 0
node .claude/skills/run-seyma/zikr-harness.mjs 2>&1 | tail -1     # 95/95
```

---

## 9. ÇIKTI — `premium-fx-plan/deliverables/TAM-DENETIM-<YYYYMMDD>.md`

Şema (bu sırayla):

1. **Yöntem ve ortam** — sentetik veri, cache'siz sunucu, izole bağlam,
   viewport'lar, tarih
2. **Kod tarafı envanteri** — handler sayısı, modül yüzeyleri, çağrı sayıları,
   ölü API/CSS tablosu (Bölüm A)
3. **Yüzey matrisi** — her sekme + her overlay × FX markerları (Bölüm B)
4. **Özellik matrisi** — her özellik × **S1/S2/S3** (✅/⚠️/❌ + ölçülen sayı +
   ekran görüntüsü referansı)
5. **Canlı zemin özel raporu** — piksel farkı tablosu, kaplanma %, canlılık,
   veri bağı, iki tema, reduced-motion
6. **Ses raporu** — 11 ses × RMS + gating
7. **Gating matrisi**
8. **BULGULAR** — her biri şu alanlarla:
   - Ne (tek cümle)
   - Kanıt (ölçülen sayı + ekran görüntüsü dosyası)
   - Kök neden (`dosya:satır`)
   - Önerilen düzeltme
   - Risk / etkilenen yüzey
   - Ağırlık: 🔴 hiç görünmüyor · 🟡 kısmi/nadir · 🔵 kozmetik borç
9. **Değişmezlik kanıtları** (Bölüm 8 çıktıları)
10. **Kanıt seviyesi ayrımı** — K1 kaynak/test · K2 yerel görsel ·
    K3 cihaz kabulü ⏳ (**yalnız kullanıcıdan**)
11. **Öncelik sırası** — en yüksek etkili 5 düzeltme, gerekçesiyle

---

## 10. DÜRÜSTLÜK KURALLARI

1. Ölçemediğin şeye **"çalışıyor" deme**. "Ölçülemedi + neden" yaz.
2. **Kendi hatanı bulursan rapora yaz.** (Önceki denetimlerde iki kez oldu:
   zsh/sandbox kaynaklı yanlış negatif cache taraması; yalnız Permissions
   API'ye dayanıp Safari'de hiç çalışmayan düzeltme.)
3. **Metrik yeşil ≠ özellik çalışıyor.** M2/M4 = 390/390 "tam kapsam"
   gösteriyordu; üç sekme malzeme sisteminin tamamen dışındaydı.
4. Bir test bulgunu düşürürse **testi gevşetme** — bulguyu incele.
   (Bir kez `test_reminder_integrated_privacy.js` haklı olarak fazla geniş
   bir düzeltmeyi düşürdü.)
5. Ölçüm artefaktına dikkat: sekme zaten aktifse `tabChanged=false` olur ve
   giriş animasyonu ölçülemez; boş koleksiyon liste efektlerini sıfır gösterir;
   `transition` süren bir özelliği aynı karede okumak eski değeri verir.
   **Şüpheli sıfırı çapraz kontrol et.**
6. **Kaynak kodu değiştirme.** Bu salt-okur denetimdir; düzeltmeler ayrı
   kartta, kullanıcı onayıyla yapılır.

---

## 11. BİTİRME

- [ ] Sunucuyu durdur (`pkill -f nocache.py`) — **turn bitmeden**
- [ ] Ekran görüntüleri `premium-fx-plan/assets/tam-denetim-<tarih>/` altında
- [ ] Rapor yazıldı ve her bulgu bir görüntüye referans veriyor
- [ ] Commit: `denetim: tam kod + uygulama görünürlük denetimi`
- [ ] **Push / deploy YOK**
- [ ] Kullanıcıya özet: kaç 🔴 / 🟡 / 🔵 bulgu + en yüksek etkili 3 düzeltme
- [ ] K3 (cihaz kabulü) **yalnız kullanıcıdan gelir** — sen "cihazda düzeldi"
      **diyemezsin**
