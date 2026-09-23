# IIP performans ölçümü ve cihaz protokolü

**Tarih:** 2026-09-22 · **Ölçülen HEAD:** `fc6f265` · **Araç:** `tests/app/test_iip_perf_measure.js`

---

## 1. Ölçülen: yerel VM render maliyeti

| Metrik | Değer |
|---|---|
| Ortam | node v26.3.1 · Apple M5 · 10 core |
| Yöntem | 5 ısınma + **30 örnek**, `App.go(tab)` sekme geçişi |
| **p50** | **0.43 – 0.62 ms** |
| **p95** | **1.14 – 1.48 ms** |
| min / ortalama / max | 0.26 / 0.61 / 1.61 ms |
| Plan hedefi (`07-KALITE-VE-KABUL.md`) | cihazda **p95 ≤ 200 ms** |

Makine-okunur kanıt: [`IIP-PERF-LOCAL.json`](IIP-PERF-LOCAL.json)

### Bu sayı NE kanıtlar

Gerçek üretim modül grafiği (38 modül, `driver.mjs` MON-04 yükleme sırası parity)
boot edilip **gerçek `render()` yolu** üzerinden bir sekme geçişinin maliyeti
ölçüldü. Ağ kapalı, depo kalıcı değil, kişisel veri yok.

### Bu sayı NE kanıtlamaz — DÜRÜST SINIR

- **Cihaz performansı DEĞİLDİR.** Masaüstü Node VM ≠ iPhone Safari/PWA. Composer,
  GPU raster, PWA kurulumu, termal bütçe, gerçek ağ beklemesi **yok**.
- **p95 ≤ 200 ms hedefi AÇIK kalır.** Bu hedef "hedef cihazda" tanımlı; yalnız
  kullanıcı kendi cihazında ölçebilir.
- Bu sayı **cihaz PASS'ı olarak raporlanamaz.**

### Ölçümün geçerlilik koşulları (harness kendisi zorlar)

Harnes, ölçümden önce üç şeyi **kanıtlar**, aksi halde exit 1 verir:

1. **Boot kanıtı:** `App`, `ui`, `App.go` yoksa ölçüm reddedilir. (İlk denemede
   sandbox ölüydü ve p95 = 0.004 ms "Pass" gibi görünüyordu — harness bunu
   yakalayıp reddetti. Bu proje defalarca aynı tuzağa düştü.)
2. **Render kanıtı:** `App.go()` `#app.innerHTML`'i değiştirmiyorsa ölçüm
   reddedilir (kapı ekranı ölçmek anlamsız).
3. **Anlamlılık tabanı:** p95 < 0.05 ms ise "render yolu çalışmadı" denip
   reddedilir.

### Devre dışı bırakılan kapılar (şeffaflık)

Ölçüm için üç üretim kapısı **bilinçli** olarak geçildi; bunlar harnesın
`gatesBypassed` alanında kayıtlı:

| Kapı | Nasıl geçildi | Neden |
|---|---|---|
| `needsAuth()` | `ui.authUnlocked = true` | Sandbox'ta `data.settings.auth` yok; driver da aynı yolu kullanır |
| `locationGateRequired()` | `locationEnabled=true` + `locationGateState='granted'` | Gerçek GPS gerektirir; offline sandbox karşılayamaz. Kullanıcı izin verdikten sonraki **aynı durum** |
| `SeyFx` premium FX | `isPremiumFxEnabled → false` | `App.go` aksi halde commit'i 200 ms `setTimeout`'a erteler (sandbox'ta timer yok). Bu, üretimin **reduced-motion** yoludur |

**Sonuç:** Ölçülen şey "animasyonsuz, izin verilmiş, kilitli olmayan sekme
geçişinin saf render maliyeti"dir. Animasyonlu yol ölçülmedi.

---

## 2. ÖLÇÜLMEDİ: hedef cihaz p95

Plan hedefi **hedef cihazda p95 ≤ 200 ms** — bu sayı **yok**. Aşağıdaki protokolü
kullanıcı kendi cihazında koşarsa kapanır.

### Cihaz protokolü (kullanıcı yapar)

**Hazırlık**
1. Telefonda `https://mustafaras.github.io/s/` aç (PWA olarak kuruluysa PWA'dan aç).
2. Başka ağır sekme/uygulama kapat. Şarj takılıysa çıkar (termal gerçekçilik).
3. Cihazı **soğuk** başlat: uygulamayı tamamen kapat, yeniden aç.

**Ölçüm**
4. Uygulama açıldıktan sonra **5 kez** Bugün ↔ İlham & İbadet geçişi yap (ısınma).
5. Sonra **30 geçiş** yap ve her birini süreyle birlikte kaydet.
   - **Kolay yol (önerilen):** Safari → Geliştirici menüsü yoksa, ekran kaydı
     al ve geçiş anlarını sonra say. Yeterli: 30 geçişin **en yavaş birkaçı**.
   - **Ölçüm yolu:** Safari Web Inspector → Timelines → Interaction/Animation
     kaydı; her geçişin ana iş parçacığı süresini not et.
6. Sonuçları p50 (ortanca) ve p95 (30 ölçümün 29.'su) olarak özetle.

**Bildirilecekler**
- Cihaz + OS (ör. iPhone 16 Pro / iOS 26.1 · Android Chrome)
- 30 geçişin p50 ve p95 değerleri
- Isınma sonrası ilk geçiş belirgin yavaş mıydı?
- Herhangi bir takılma/donma gözlendi mi?

**Yorumlama**
- p95 ≤ 200 ms → hedef **karşılandı**
- p95 > 200 ms → hedef **karşılanmadı**; süreyi ve ekranı bildir, darboğaz
  (ilk geçiş mi, tekrar mı) belirtilir
- Ölçüm yapılmazsa hedef "karşılanmadı" değil, **"ölçülmedi"** sayılır

---

## 3. Sonuç — dürüst seviye beyanı

| Seviye | Durum |
|---|---|
| 1 · Kaynak/headless (VM) | ✅ Ölçüldü: p50 0.43–0.62 ms, p95 1.14–1.48 ms |
| 2 · Yerel görsel QA (127.0.0.1:9000) | ⬜ Yapılmadı |
| 3 · **Hedef cihaz (p95 ≤ 200 ms)** | ⬜ **ÖLÇÜLMEDİ** — protokol yukarıda |
| 4 · Yayın | ayrı yetki |

**Kritik:** Seviye 1'deki düşük sayı, seviye 3 hedefi hakkında **hiçbir şey
kanıtlamaz**. İki farklı şey ölçülüyor.
