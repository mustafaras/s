# FX-2 Saha Doğrulama — "FX'ler görünmüyor" raporu

| | |
|---|---|
| **Tarih** | 2026-09-08 |
| **Tetikleyici** | Kullanıcı: *"tüm fx'ler uygulanmış gibi görünmüyor… neden yerelde göremiyorum"* |
| **Yöntem** | Cache'siz yerel sunucu (`127.0.0.1:9002`, `no-store`) + izole tek kullanımlık tarayıcı bağlamı |
| **Veri** | **Sentetik** QA durumu — gerçek kişisel veri, token, parola kullanılmadı |
| **Commit'ler** | `cdd1c79`, `8415fdd` |
| **Sonuç** | 2 gerçek kök neden bulundu ve düzeltildi; FX bağlantısı zaten sağlamdı |

---

## 1. Kritik bulgu: FX'ler bozuk değildi — uygulama açılmıyordu

İlk varsayım ("FX bağlanmamış") **yanlıştı**. Tarayıcıda ölçüldü: sınıflar
doğru basılıyor, sentetik yağmur verisi verilince `amb-wx-clear` →
`amb-wx-rain` geçişi oluyor, `--wx-intensity`/`--amb-seed` yazılıyor.

Asıl sorun: **konum kapısı uygulamayı tamamen kilitliyordu.** Kullanıcı
yalnızca kapı ekranını görüyordu; arkasında render edilecek içerik yoktu.

### Zincir

| Adım | Kaynak | Sorun |
|---|---|---|
| 1 | `app.js:4066` | `ui.locationGateState` her boot'ta `'checking'`/`'required'` — **asla** `'granted'` |
| 2 | `ui` kalıcı değil | Önceki oturumun "izin verildi" bilgisi kayboluyor |
| 3 | `app.js:8477` | `locationGateRequired()` `'granted'` şart koşuyor |
| 4 | `app.js:8534` | Tek çıkış: taze ölçüm — `{enableHighAccuracy:true, maximumAge:1000}` |
| 5 | — | 1 sn tazelik + GPS hassasiyeti → iç mekânda/masaüstünde sürekli `code 3` timeout |
| 6 | — | Kapı açılmıyor → **içerik hiç render edilmiyor** |

`navigator.permissions` kodda hiç kullanılmıyordu (0 kez), yani uygulama
"bu izin zaten verilmiş" bilgisini sessizce öğrenemiyordu.

### Düzeltme (`cdd1c79` + `8415fdd`)

`locationGateSilentVerify()` — boot'ta `render()` sonrası çalışır, **iki yollu**:

1. **Permissions API** (Chromium/Firefox): `'granted'` → kapı açılır;
   `'denied'` → doğru hata mesajı; `'prompt'` → bekler.
2. **Sessiz önbellek yoklaması** (Safari yolu): `permissions.query`
   Safari'de `'geolocation'` adını çoğu sürümde desteklemez ve
   TypeError/reject verir — bu yüzden tek dayanak olamaz.
   `{enableHighAccuracy:false, timeout:8000, maximumAge:900000}` ile
   yoklanır: izin duruyorsa önbellekten anında döner ve **izin penceresi
   açılmaz**; izin kaldırılmışsa sessizce başarısız olur, kapı kapalı kalır.

Ek olarak kullanıcı düğmesi yolu: `maximumAge 1000 → 300000` ve timeout'ta
bir kez `enableHighAccuracy:false, timeout:25000, maximumAge:600000`.

**Kapı yalnız gerçek doğrulamayla açılır.** "Kayıtlı koordinat var" tek
başına yeterli sayılmaz. İlk denememde bu yedek vardı ve
`test_reminder_integrated_privacy.js` onu haklı olarak düşürdü (sandbox'ta
`navigator.permissions` yok → kapı yanlışlıkla açılıyordu); test
gevşetilmedi, **yedek kaldırıldı**.

> **Bu oturumda iki kez kendi hatamı yakaladım ve kaydediyorum:**
> (a) İlk tarama betiği zsh parametre genişletmesi + sandbox `/tmp` yazma
> yasağı yüzünden "0 bayat cache" yanlış negatifi verdi; ham `git log`
> karşılaştırmasıyla çapraz kontrol edilince 2 bayat asset çıktı.
> (b) İlk kapı düzeltmem yalnız Permissions API'ye dayanıyordu ve
> **Safari'de hiç çalışmıyordu** — kullanıcı "hiçbir şey düzelmedi"
> dediğinde ortaya çıktı.

---

## 2. İkincil bulgu: canlı zemin ölçülebilir biçimde görünmezdi

FX hattı çalışıyordu ama tasarım kalibrasyonu efekti algı eşiğinin altına
itiyordu. Ölçülen gerçek renkler (koyu tema):

| Sahne | Önce | Sonra |
|---|---|---|
| dawn | `rgb(11,8,6)` | **`rgb(44,29,16)`** bakır |
| day | düz `#000000` | **`rgb(26,29,34)`** nötr |
| dusk | `rgb(10,7,6)` | **`rgb(43,21,38)`** mor |
| night | `rgb(4,6,10)` | **`rgb(12,23,52)`** lacivert |

Dört sahne de siyahın **11/255** içindeydi — gözle ayırt edilemez. Hava
katmanı `opacity:.05`'ti. Kullanıcı kararıyla ("güçlü/sinematik") hava
opaklıkları tarayıcıda ölçülerek şu banda çekildi:

`clear .20 · cloud .22 · fog .22 · drizzle .20 · rain .26 · snow .26 · storm .28 · none 0`

**Kontrast M13 8/8 çift ≥ 4.5:1 korundu** (koyu zeminler luminans ≤ .05,
pay ≥ 12:1). `test_fx2_ambience.js` opaklık tavanı 0.09 → 0.30 güncellendi,
gerekçe koda yazıldı.

### Metrik dersi (FX-1'in hatasının kuzeni)

`M12` metriği sahnelerin **var olduğunu** sayıyor, **ayırt edilebildiğini**
değil. Fixture da `opacity ≤ 0.09` tavanıyla görünmezliği *doğruluyordu*.
FX-1'de fixture'lar modülü test edip bağlantıyı test etmemişti; FX-2'de
bağlantı test edildi ama **algılanabilirlik** test edilmedi. Önceki
kapanış raporlarının "192 sahne çalışıyor" ifadesi teknik olarak doğru,
pratikte yanıltıcıydı.

---

## 3. Ekran görüntüleri (bu oturumda alındı)

Kurulum: cache'siz sunucu, izole bağlam, iPhone viewport (414×896@2x),
sentetik 10 günlük durum, konum izni verilmiş cihaz simülasyonu.

| Dosya | Sahne | Zemin (ölçülen) |
|---|---|---|
| `01-koyu-gunduz-acik-hava.png` | koyu · gündüz · açık hava | `rgb(26,29,34)` |
| `02-koyu-aksam-yagmur.png` | koyu · akşam · yağmur | `rgb(43,21,38)` → `rgb(21,10,19)` |
| `03-koyu-gece-kar.png` | koyu · gece · kar | `rgb(12,23,52)` → `rgb(4,7,15)` |

Üç görüntüde de uygulama **tam render edilmiş** durumda (99 KB içerik,
`sey-app-booted theme-aurora amb-time-* amb-wx-* amb-season-*`), kapı
`granted`. Sahne farkı kenar boşluklarında ve başlık bölgesinde
görülebiliyor.

### Dürüst sınır: zemin büyük ölçüde kartlarla örtülü

Ölçüm: görünen alanın **~%70'i opak kartlarla kaplı**. Canlı zemin yalnız
ince kenar boşlukları, kart araları ve başlık bölgesinde görünüyor. Bu,
AD-38 kararının (*"kartlar opak `--card-solid`'e taşınır; cam yalnızca
fonksiyonel katmanda"*) doğrudan sonucu.

**Yani:** renk kalibrasyonu artık doğru, ama zeminin "hissedilmesi"
isteniyorsa sıradaki adım kart opaklığıdır — bu AD-38 ile çelişir ve ayrı
bir kullanıcı kararı gerektirir. Bu belge o kararı vermez.

---

## 4. Doğrulama

| Kapı | Sonuç |
|---|--:|
| `node --check` (app.js + core modülleri) | OK |
| `tests/app` + `tests/panel` + `tests/panel-v2` + `tests/quran` | **94 PASS / 0 FAIL** |
| `driver.mjs` | 0 FAIL |
| `zikr-harness.mjs` | 95/95 |
| `run-reminder-smoke.mjs` | 20 fixture · 73 assertion PASS |
| `test_fx2_ambience.js` (kontrast dahil) | 14/14 |
| `App.*` / `onclick` değişmezleri | 718 / 391 |
| Bayat cache | 0 |

---

## 5. Açık kalanlar

- **Cihaz kabulü (K3):** Safari yolunun gerçek cihazda çalıştığını **ben
  doğrulayamadım** — CDP geolocation iznini veremiyor (`permState:'prompt'`,
  `getCurrentPosition` timeout). Tarayıcı doğrulaması izin **stub'lanarak**
  yapıldı. Gerçek onay yalnız kullanıcının cihazından gelir.
- **Kart opaklığı:** zeminin hissedilmesi için gereken sonraki adım; AD-38
  ile çelişir, kullanıcı kararı bekler.
- **`migrate()` `startDate`'i doldurmuyor:** yalnız `createDefaultData()`
  set ediyor. `startDate` içermeyen bozuk bir state'te `currentStreak()` →
  `diffDays()` çöküyor (bu oturumda sentetik durumla tetiklendi). Gerçek
  kullanıcı verisinde `startDate` var; yine de savunmasız bir kenar durum.
- **M7 kapısı:** `--gate` hâlâ exit 1 (literal 0.80 eşiği vs kullanıcı
  onaylı 0.62 tavanı) — bilinen, kayıtlı istisna.
- **Push/merge/deploy:** YAPILMADI.
