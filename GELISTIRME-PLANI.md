# Şeyma 🦩 — Geliştirme Planı (Yol Haritası)

Bu belge, uygulamaya eklenebilecek **faydalı yeni özelliklerin** kapsamlı bir
planıdır. Amaç: mevcut sıcak/estetik dili ve mimariyi bozmadan, günlük kullanımı
derinleştirmek. Her madde **ne / neden / nasıl (teknik) / emek / panel etkisi**
ile yazıldı. Öncelik sırasına göre sürümlere bölündü.

> 📄 **Bu bir yaşayan belgedir.** Maddeler tamamlandıkça durum işaretlenir ve
> aşağıdaki canlı özet ile değişiklik günlüğü güncel tutulur. Sıra ve kapsam
> ihtiyaç değiştikçe revize edilebilir.
>
> 🔔 **Tetikleyici:** Kullanıcı **"geliştirme planı"** dediğinde → aşağıdaki
> **Uygulama Durumu (canlı özet)** tablosu güncel haliyle gösterilir.

**Durum rozetleri:** ✅ Uygulandı · 🟡 Kısmen · ❌ Yok

---

## 📊 Uygulama Durumu (canlı özet)

_Son güncelleme: 2026-07-13 · Kaynak: `app.js` (fonksiyon/satır kanıtı)._

| # | Madde | Sürüm | Durum | Kanıt / Not |
|---|-------|:-----:|:-----:|-------------|
| — | Altyapı (sync, panel, tema, Okuma/İzleme hub'ları) | 0 | ✅ | `sync.js`, `panel.html`, `styles.css`, hub deseni |
| 1 | 🎵 Ne Dinledim | 1 | ✅ | `listeningOverlayHTML` hub (Bugün/Favoriler/İstatistik/Sözler) + `data.music` + `data.days[].listening`; `--listen` teal accent; panel "🎧 Dinleme Arşivi" (2026-07-04) |
| 2 | 🙏 Şükran / 3 Güzel Şey | 1 | ✅ | `App.onGratitude` + `data.days[].gratitude` (≤3); Bugün kartı (geçmiş günde düzenlenebilir); panel gün-detayı bloğu (2026-07-04) |
| 3 | 📈 Otomatik içgörüler | 1 | ✅ | `corrInsights()` → render `rapor` |
| 4 | 🗓️ Ruh hali ısı haritası | 1 | ✅ | `moodHeatmapCard()` → `rapor`'da GitHub-tarzı yıllık mod ısı haritası: ‹yıl› seçici, yatay kaydırılır 7×hafta grid, mod paleti, ay/gün etiketleri, hücreye dokun → `App.heatOpen` harita'da o günü açar; panel `moodHeatmapCardHTML()` salt-okunur ayna (2026-07-04) |
| 5 | 🏅 Rozet & seri | 1 | ✅ | `badgesGrid()` + `currentStreak/maybeStreak/bestStreak` + kilometre taşları |
| 6 | 🧠 Düşünce kaydı (CBT) | 2 | ❌ | `thoughts` yok |
| 7 | 🌬️ Nefes / meditasyon | 2 | 🟡 | Veri modeli var (`WIND_DOWN_STEPS` "4-7-8 nefes", `emptyWindDown`); rehberli animasyon/UI bağlı değil |
| 8 | ✍️ Serbest günlük | 2 | ❌ | Ayrı journaling yok; yalnızca günlük `note` alanı var |
| 9 | 🎯 Günün niyeti | 2 | ✅ | `App.onIntention` + `data.days[].intention` (≤140); Bugün kartı "Bugünün niyeti" (geçmiş günde "O günün niyeti", düzenlenebilir); gün-detayı popup'ında "🎯 Niyet"; panel `exRowAlways("🎯 Niyet", …)`; `daysTracked` sinyali (2026-07-04) |
| 10 | 🩸 Döngü tahmini & faz | 2 | ✅ | `cycleHTML` + faz hesabı + sonraki regl/ovülasyon/doğurganlık |
| 11 | 💊 İlaç hatırlatıcı & uyum | 2 | 🟡 | Uyku ilacı türü + ağrı kesici log var; saatli liste + uyum % (`data.meds`) yok |
| 12 | 🔔 PWA bildirimler | 3 | ❌ | service worker / Notification yok |
| 13 | 🔒 PIN kilidi | 3 | ❌ | `settings.pin` yok |
| 14 | 🛟 Yedek indir/yükle | 1 | ✅ | `exportJson` / `importJson` + Ayarlar butonları |
| 15 | 🕰️ Geçmiş günü düzenleme | 3 | ✅ | `editDay`/`exitEdit` + uyarı bandı + auto-exit (2026-07-03) |
| 16 | 🚩 Kötü-gün serisi uyarısı | 3 | ❌ | panelde bayrak yok |
| 17 | 📮 Haftalık özet | 3 | 🟡 | Rapor'da 3 haftalık blok/istatistik var; paylaşılabilir "bu hafta" kartı + panel bölümü yok |
| 18 | 💌 "İyiyim" dokunuşu | 3 | ❌ | — |
| 19 | 💬 Günün alıntısı | 3 | ❌ | "Günün Mesajı" (DAILY) var ama kütüphane alıntısı değil |
| 20 | 🕯️ Bugün 1 yıl önce | 3 | ✅ | `onThisDayCard()` → Bugün ekranında salt-okunur "Bugün, N yıl önce" kartı (mod/tik/niyet/not/şükran + "O günü aç →" → `App.openDate`); panel `exRowAlways("🕯️ Bir yıl önce", …)`; yeni veri yok, `data.days`'ten okur (2026-07-04) |
| 21 | 🎉 Özel gün kutlaması | 3 | ❌ | `specialDays` yok |
| 22 | 📳 Haptik + mikro animasyon | 3 | ✅ | Mikro animasyon (confetti/seyFade/toast) + `haptic()` → `navigator.vibrate` (tik/mod/SOS dokunuşlarında); Ayarlar'da "Titreşim geri bildirimi" aç/kapa (`settings.haptics`, varsayılan açık) (2026-07-04) |
| 23 | 📍 Konum-açma dürtüsü (nudge) | 3 | ✅ | `tryLocNudge`/`openLocNudgeNow` → konum kapalıyken Bugün/Sağlık'ta dağınık aralıklarla (6s ara, gün≤2, %60, 3-7s gecikme) çıkan alt-sheet; her seferinde 1-2 sağlık-çerçeveli fayda (`LOC_BENEFITS`, 20 madde — çoğu araç yolu·mesafe·süre·oturuş odaklı); "Konumu aç"→mevcut rıza modalı, "Belki sonra"/✕→snooze+backoff, **"Bugün gösterme"→o günlük sus (ertesi gün tekrar çıkar, `optOutDay`)**; konum AÇIK iken Bugün kartında gerçek veri: mesafe + **⏱️ süre** (`walkSec`/`vehicleSec`), panel "Bugün Hareket"e yansır; 8 reddten sonra fısıltı modu (2026-07-03) |
| 24 | ☕ Kafein bilimsel takip + otomatik tik | 7 | ✅ | `CAFFEINE_TYPES` katalogu (türk/espresso/filtre/americano/cappuccino/latte/siyah çay/yeşil çay/enerji · mg/serving), `CAFFEINE_LIMITS` (standart 400/hassas 300/gebe 200), `caffeineTotalMg`/`caffeineResidueAt`/`caffeineCutoffTime`/`caffeineTimingOk`; Sağlık'ta premium kafein kartı (içecek chip'leri + günlük içim listesi + saat input + limit bar + tek sefer 200 mg / günlük limit / geç-kahve uyarıları + yatma saati kalıntı göstergesi + EFSA/FDA kaynak notu); `caffeineMode`/`targetBed` ayarları; 6-faktör `sleepReadiness` (süre 26/kalite 18/kafein 18/okuma 16/wind-down 14/ilaç 8); yeni **türetilmiş** "Günlük kafein limitini aşmadım" tiki (`caffeineOk`, elle tıklanmaz — miktar+saat sağlanınca otomatik yeşil); panel kafein satırı mg+kalıntı hesaplar (2026-07-10) |

**Sayım:** ✅ 13 · 🟡 3 · ❌ 8 _(+ altyapı ✅)_

---

## 0) Mevcut durum (referans)

Uygulama tek sayfa (vanilla JS, mobil ≤460px), Türkçe, sıcak/emoji dilli.

- **Sekmeler:** `bugun` (ruh hali, öğün, uyku, adım, regl, kafein, su, enerji,
  stres, tetik, SOS, not), `sos`, `saglik`, `harita` (vücut ağrı haritası),
  `rapor`, `mesaj` (Luna AI), `ayarlar`.
- **Hub'lar (overlay):** 📖 Ne Okudum, 🎬 Ne İzledim (Bugün / Kitaplık-Arşiv /
  İstatistik / Alıntılar-Replikler).
- **Altyapı:** GitHub private repoya otomatik sync (`sync.js` → tüm `data`
  objesini `data/latest.json`'a yazar), gözlemci **panel** (`panel.html`,
  salt-okunur), açık/koyu tema (`styles.css` CSS değişkenleri), ekran görüntüsü
  test harness'i (`files/shot/`).

### Uyulacak teknik ilkeler (yeni her özellik için)
1. **Tek `data` objesi:** Yeni alanları `data`'ya ekle → sync ve panel
   otomatik alır (cherry-pick gerekmez).
2. **Tema uyumu:** Renkleri sabit hex yerine CSS değişkenleriyle ver
   (`--read`, `--watch`, `--ok`, `--drop`, `--pause`, `--text`, `--muted`…).
   Yeni accent gerekiyorsa hem açık hem koyu blokta tanımla.
3. **Overlay deseni:** Yeni hub'lar `openX/closeX` + `ui.xView` + `segTabs`
   desenini izlesin (Okuma/İzleme birebir şablon).
4. **Panel yansıması:** Kullanıcıya eklenen her kalıcı kayıt panelde de
   görünmeli (bento kart veya gün-detayı satırı).
5. **Doğrulama:** Değişiklikleri `files/shot/` harness'i ile **hem açık hem
   koyu** temada ekran görüntüsüyle doğrula; konsol hatası olmamalı.
6. **Cache:** `index.html` içindeki `?v=` sürümünü her yayında artır.
7. **Gizlilik:** Hassas alanlar (token vb.) `sync.js` sanitize'inde kalmalı.

---

## 🌟 Sürüm 1 — Başlangıç paketi (en yüksek değer / mimariye en uygun)

### 1. 🎵 "Ne Dinledim" hub'ı — ✅ Uygulandı
- **Ne:** Şarkı/albüm/podcast kaydı; sanatçı, tür, ruh haline göre çalma
  listesi, favori sözler, istatistik.
- **Neden:** Okuma/İzleme üçlemesini tamamlar; günlük ruh haliyle güçlü bağ.
- **Nasıl:** `readingOverlayHTML` şablonunu kopyala-uyarla; `data.listening`
  (items + günlük entries), yeni accent `--listen` (örn. yeşil/teal).
- **Emek:** Orta. **Panel:** Yeni "🎧 Dinleme" bento kartı + gün-detayı satırı.

### 2. 🙏 Şükran / "3 Güzel Şey" günlüğü — ✅ Uygulandı
- **Ne:** Her güne 3 küçük iyi şey.
- **Neden:** Ruh haline kanıtlı olumlu etki, çok hafif.
- **Nasıl:** `data.days[date].gratitude = [..]`; `bugun` sekmesine kart.
- **Emek:** Düşük. **Panel:** Gün-detayında "bugün minnettar olunanlar".

### 3. 📈 Otomatik içgörüler (korelasyon kartları) — ✅ Uygulandı
- **Ne:** "Yürüyüş yaptığın günlerde enerjin daha yüksek", "5 saatten az
  uyuduğunda ruh halin düşüyor" gibi cümleler.
- **Neden:** Var olan veriyi anlama dönüştürür; rapor sekmesine güç katar.
- **Nasıl:** `rapor` içinde geçmiş günleri tarayan basit korelasyon/eşik
  fonksiyonları (uyku↔mod, adım↔enerji, kafein↔uyku, regl fazı↔mod).
- **Emek:** Orta. **Panel:** "Bu haftanın içgörüsü" kartı.

### 4. 🗓️ Ruh hali ısı haritası (takvim) — ✅ Uygulandı (2026-07-04)
- **Ne:** GitHub-benzeri yıllık grid; her gün ruh hali rengiyle.
- **Neden:** Örüntüyü tek bakışta gösterir.
- **Nasıl:** `rapor` içinde `moodHeatmapCard()` → `data.days` üzerinden yıllık 7×hafta
  grid; renk = mod paleti; ‹yıl› seçici (`ui.heatYear`/`App.heatYear`); hücreye dokun →
  `App.heatOpen` harita'da o günü açar (güvenli geçmiş-gün düzenleme akışına bağlı).
- **Emek:** Orta. **Panel:** `moodHeatmapCardHTML()` salt-okunur ayna (tam yıl).

### 5. 🏅 Rozet & seri (streak) sistemi — ✅ Uygulandı
- **Ne:** "7 gün su hedefi", "10 kitap", "30 gün kayıt" rozetleri + seriler.
- **Neden:** Motivasyon, "zinciri kırma" hissi.
- **Nasıl:** Türetilmiş (hesaplanan) rozetler; `data.badges` yalnızca
  kilitlenme tarihini tutar. Okuma/izleme/su/alışkanlık verisi hazır.
- **Emek:** Orta. **Panel:** "Kazanımlar" şeridi.

### 14. 🛟 Dışa/içe aktarma (yedek)  ← Sürüm 1'e alındı (kritik) — ✅ Uygulandı
- **Ne:** Tek tuşla `data`'yı JSON indir / geri yükle.
- **Neden:** Repoya erişilmese bile veri güvencesi; taşınabilirlik.
- **Nasıl:** `ayarlar`'a "Yedeği indir / Yedekten yükle" (Blob download +
  file input → `JSON.parse` → doğrula → `data`'ya yaz → `save()`).
- **Emek:** Düşük. **Panel:** —

---

## 💜 Sürüm 2 — Duygu & zihin sağlığı derinleştirme

### 6. 🧠 Düşünce kaydı (CBT tarzı) — ❌ Yok
- **Ne:** Otomatik düşünce → duygu/şiddet → kanıt → yeniden çerçeveleme.
- **Nasıl:** `sos` akışına bağlı yeni overlay; `data.days[date].thoughts[]`.
- **Emek:** Orta. **Panel:** Sayı/özet (mahremiyete saygılı, kısaltılmış).

### 7. 🌬️ Nefes / meditasyon — 🟡 Kısmen
- **Ne:** Rehberli nefes animasyonu (ör. 4-7-8), süre kaydı, günlük dk hedefi.
- **Nasıl:** CSS/SVG animasyon; `data.days[date].breath.minutes`. SOS'tan erişim.
- **Emek:** Orta. **Panel:** "Nefes dakikası" satırı.

### 8. ✍️ Serbest günlük (journaling) + Luna promptları — ❌ Yok
- **Ne:** "Bugün seni ne zorladı?" gibi yazma soruları; uzun serbest metin.
- **Nasıl:** `data.days[date].journal`; Luna (mesaj sekmesi) verilerden
  kişisel prompt üretir.
- **Emek:** Orta. **Panel:** Var/yok rozeti (içerik gizli tutulabilir).

### 9. 🎯 Günün niyeti / kelimesi — ❌ Yok
- **Ne:** Sabah tek cümlelik niyet, akşam "tuttun mu?" değerlendirmesi.
- **Nasıl:** `data.days[date].intention = {text, kept}`.
- **Emek:** Düşük. **Panel:** Gün-detayı satırı.

---

## 🩸 Sürüm 2 — Döngü & beden (mevcut regl/harita üstüne)

### 10. Adet döngüsü tahmini & faz — ✅ Uygulandı
- **Ne:** Sonraki regl tahmini, folliküler/luteal faz, semptom-faz
  korelasyonu, nazik yaklaşan-regl hatırlatması.
- **Nasıl:** Geçmiş regl günlerinden ortalama döngü; faz→gün eşlemesi;
  içgörü motoruyla (madde 3) birleşir.
- **Emek:** Orta. **Panel:** "Tahmini faz" rozeti.

### 11. 💊 İlaç hatırlatıcı & uyum takibi — 🟡 Kısmen
- **Ne:** Saatli ilaç listesi, "aldım/atladım", haftalık uyum yüzdesi.
- **Nasıl:** `data.meds[]` (tanım) + `data.days[date].medLog[]`.
- **Emek:** Orta (bildirimle → ileri). **Panel:** Uyum yüzdesi kartı.

---

## 🔔 Sürüm 3 — Hatırlatıcı & erişim

### 12. PWA yerel bildirimler — ❌ Yok
- **Ne:** Su, akşam check-in, ilaç, "bugün birkaç sayfa okudun mu?" nazik
  hatırlatmaları.
- **Nasıl:** Service worker + Notification API (izin akışı); zamanlama
  tercihleri `ayarlar`'da.
- **Emek:** İleri (PWA/SW altyapısı). **Panel:** —

### 13. 🔒 PIN / gizlilik kilidi — ❌ Yok
- **Ne:** Açılışta PIN (opsiyonel biyometrik).
- **Nasıl:** `data.settings.pin` (hash'li); açılışta kilit ekranı.
- **Emek:** Orta. **Panel:** —

### 15. 🕰️ Geçmiş günü düzenleme — ✅ Uygulandı (2026-07-03)
- **Ne:** Retroaktif kayıt/düzeltme (unutulan günü geri dönüp doldurma).
- **Nasıl:** Tarih seçici → o günün `data.days[date]`'ini düzenleme moduna al.
- **Emek:** Orta. **Panel:** — (zaten geçmişi gösteriyor).

---

## 🤝 Sürüm 3 — Panel (gözlemci) & bağ

### 16. Kötü-gün serisi uyarısı — ❌ Yok
- **Ne:** Arka arkaya düşük ruh hali → gözlemciye nazik bildirim.
- **Nasıl:** Sync sırasında eşik kontrolü; panelin okuduğu alana bayrak.
- **Emek:** Orta. **Panel:** Uyarı şeridi.

### 17. 📮 Haftalık özet — 🟡 Kısmen
- **Ne:** Hem kullanıcıya hem gözlemciye paylaşılabilir "bu hafta" kartı
  (ruh hali, uyku, okuma/izleme, kazanımlar).
- **Nasıl:** Haftalık toplayıcı; panelde ayrı bölüm; görsel export (madde 22).
- **Emek:** Orta. **Panel:** "Bu hafta" kartı.

### 18. 💌 "İyiyim" dokunuşu — ❌ Yok
- **Ne:** Tek tuşla sevdiğine küçük kalp/sinyal gönderme.
- **Nasıl:** `data`'da küçük sinyal alanı → panel gösterir (tek yönlü, hafif).
- **Emek:** Düşük. **Panel:** "Son dokunuş" göstergesi.

---

## ✨ Sürüm 3 — Küçük ama tatlı dokunuşlar

### 19. 💬 Günün alıntısı — ❌ Yok
- Kütüphanedeki alıntı/repliklerden rastgele biri ana ekranda. **Emek:** Düşük.

### 20. 🕯️ "Bugün 1 yıl önce" — ❌ Yok
- Geçmiş `data.days` içinden aynı günün notu/ruh hali. **Emek:** Düşük.

### 21. 🎉 Özel gün kutlaması — ❌ Yok
- Doğum günü/yıldönümü konfeti + mesaj (`data.settings.specialDays`).
  **Emek:** Düşük.

### 22. 📳 Haptik + mikro animasyon — 🟡 Kısmen
- Kayıt/kutlama anlarında `navigator.vibrate` + küçük animasyonlar.
  **Emek:** Düşük.

---

## Önerilen sıra (özet)

| Sürüm | Odak | Maddeler |
|------|------|----------|
| **v1** | En yüksek değer, mimariye uygun | 1 Ne Dinledim · 2 Şükran · 3 İçgörüler · 4 Isı haritası · 5 Rozetler · 14 Yedek |
| **v2** | Zihin sağlığı + döngü | 6 Düşünce kaydı · 7 Nefes · 8 Günlük · 9 Niyet · 10 Döngü tahmini · 11 İlaç |
| **v3** | Hatırlatıcı, panel, dokunuşlar | 12 Bildirim · 13 PIN · 15 Geçmiş düzenleme · 16 Seri uyarısı · 17 Haftalık özet · 18 İyiyim · 19–22 tatlı dokunuşlar |

**İlk hamle önerisi:** v1'den **Şükran (2)** + **Yedek (14)** en hızlı kazanım
(düşük emek, yüksek fayda); ardından **Ne Dinledim (1)** ve **İçgörüler (3)**.

---

_Bu plan bir yaşayan belgedir; tamamlandıkça maddeleri işaretleyip sürüm
notlarını buraya ekleyebiliriz._

---

## 🗒️ Değişiklik günlüğü

- **2026-07-13** — **🧠 Bilimsel Profil Değerlendirmesi ana arayüzde inaktif; sonuçlar panelde korunuyor**:
  174 maddelik tek oturumlu profil değerlendirmesi (`data.profileAssessment`) artık `Bugün/Sağlık/Rapor/Mesaj/Harita/Saygı`
  sekmelerini kilitlemiyor. `migrate()` içinde `settings.profileAssessmentInactive=true` varsayılanı eklendi; eski ve yeni
  kullanıcılarda değerlendirme ana uygulama arayüzünde görünmüyor. Tüm kod, veri modeli, yanıtlar (`responses`), puanlama ve
  rapor üretimi (`profileAssessmentV1.js` + `app.js` profil motoru) **silinmedi**; Ayarlar'dan veya kod bayrağı değiştirilerek
  yeniden aktive edilebilir. Tamamlanan profil özetleri panelde (`panel.html` → `profileAssessmentCardHTML`) görünmeye devam ediyor;
  inaktif hale getirildikten sonra da `data.profileAssessment` senkronize kalmaya devam ediyor. Cache-bust: `app.js v=20260713a`.
  
  **Hata düzeltmesi (2026-07-13 20:00):** `panel.html` içindeki `profileAssessmentCardHTML()` tamamlanmış değerlendirme
  sonuçlarını yalnızca `consent.panelSummarySharingAccepted === true` ise gösteriyordu. Arayüz inaktif hale gelince kullanıcı
  bu paylaşım bayrağını değiştiremiyordu ve panelde "paylaşım kapalı" mesajıyla kendi sonuçlarını göremiyordu. Düzeltme:
  paneldeki bu izin kontrolü kaldırıldı; tamamlanmış profil özeti artık kullanıcının kendi panelinde doğrudan görüntüleniyor.
  `consent.panelSummarySharingAccepted` alanı `sync.js` merge mantığında ve `app.js` consent akışında hâlâ var, ancak panel
  görünümü artık ona bağlı değil.

- **2026-07-13** — **🧭 120 günlük İçsel Pusula + Saygı Seçkisi artık panelde görünür**:
  `panel.html` artık `motivationProgramV2.js` ve `saygiPeople.js` modüllerini doğrudan yükleyerek gözlemci panelinde
  aktif program gününü (Faz, alan, görev, günlük ilerleme çubuğu) ve bugünkü Saygı kişisini (alan, dönem, okundu/okunmadı,
  toplam okuma ilerlemesi) gösteriyor. Veri kaynağı canlı `D.motivation` ve `D.days[].saygi` kayıtları; herhangi bir panel
  kullanıcısı için kendi sonuçları panelde yansıtılıyor. Arayüz değişikliği yalnızca `panel.html` üzerinde; `app.js`, modüller
  veya veri yapısı dokunulmadı.

- **2026-07-13** — **📝 Panelde aktif günün görev metni daha belirgin okunuyor**:
  `motivationPanelCardHTML()` aktif gün özetinde `standardTask` artık büyük (`var(--f2)`), ikonlu (`clipboard-list`) ve
  altın renk başlıklı (`var(--gold)`) bir satır olarak gösteriliyor. Yanına `minimumTask` (`shield`) ve `successMeaning`
  (`sparkles`) eklendi; görevin tam ve minimum versiyonu ile o günün anlamı panelde ilk bakışta görünür hale geldi.
  İkon setine `clipboard-list` ve `shield` eklendi. `app.js` veya veri modeli dokunulmadı.

- **2026-07-11** — **💾 Kapsamlı yazma denetimi + "sekme kapanırken son düzenleme kaybolabilir"
  düzeltmesi**: Kullanıcının her girdisinin gerçekten `seyma-data`'ya yazıldığından emin olmak
  için `App.*`'daki **253 handler'ın tamamı** gerçek V8 `Function.toString()` ile tek tek
  incelendi (headless, tarayıcı açılmadan) — her biri doğrudan ya da zincirleme
  (`submitAeonMedia`, `parseHealthXML`, `App.completeMotivationTask` gibi bir yardımcı
  üzerinden) `save()`/`commit()`'e ulaşıyor mu diye otomatik + elle doğrulandı. 213'ü doğrudan
  persist ediyor; kalan 40'ı meşru şekilde veri değiştirmeyen eylemler (pano kopyalama, dosya
  seçici açma, sekme/scroll, ve "Kaydet" düğmesine kadar yalnızca taslakta duran alan girişleri
  — `ui.bookEdit`/`ui.quoteDraft`/`ui.crisisNote` vb., karşılık gelen `App.saveBook`/
  `App.saveQuote`/`App.completeCrisis` gibi commit handler'larının gerçekten var olduğu ve
  `commit()` çağırdığı ayrıca doğrulandı). **Bulunan tek gerçek (önceden var olan) açık:** 17
  metin alanı (niyet, kitap sayfası, döngü rahatsızlık notu/ilaçları, kafein saati, okuma/izleme
  hedefi…) `debounceSave()` ile geciktirilmiş kayıt kullanıyordu — mutasyon, yazının hemen
  ardından değil, gecikmeli `fn` **içinde** oluyordu; sekme kapanırken/arka plana alınırken
  çalışan `finalizeSession()` bu bekleyen zamanlayıcıları hiç flush etmiyordu. Yani bir alana
  yazıp ~300-500ms içinde uygulama kapatılırsa o son düzenleme hem localStorage'a hem
  `seyma-data`'ya hiç yazılmadan kaybolabilirdi (önceki kayıtlar etkilenmezdi). **Düzeltme:**
  `debounceSave()` artık bekleyen fonksiyon referansını `fieldTimerFns`'te tutuyor; yeni
  `flushFieldTimers()` (app.js:~627) tüm bekleyenleri anında çalıştırıp temizliyor,
  `finalizeSession()`'ın (beforeunload/pagehide/sekme-gizlenme) en başında çağrılıyor — artık
  hiçbir düzenleme kapanış anında kaybolmuyor. **Doğrulama:** headless `vm` harness'te
  `setTimeout`'un hiç ateşlenmediği (gerçek "erken kapatma" senaryosunu birebir taklit eden) bir
  kurulumda niyet alanına yazılıp hemen `finalizeSession()` tetiklendi — düzenleme doğrulandı
  şekilde kaydedildi (8/8 PASS); ayrıca çift-çağrı güvenliği ve tüm sekmelerin regresyonsuz
  render'ı da doğrulandı. `mustafaras/seyma-data`'ya hiçbir şey yazılmadı (yalnızca salt-okunur
  okuma + headless test).
- **2026-07-11** — **⏳ Saygı + Terapi Odası (İçsel Pusula): 2026-07-13 09:00 aktivasyon kilidi
  ("gün 1" garantisi)**: Her iki özellik de artık **2026-07-13 09:00 TR saatiyle** (sabit UTC+3
  offset, cihazın kendi saat dilimi ayarından bağımsız — `FEATURE_GATE_TS`/`featuresLive()`,
  `app.js` en üstte) aktifleşiyor; o âna kadar ikisi de şık bir "yakında" durumunda kalıyor
  (Saygı sekmesi: kilitli bilgi kartı, Wikipedia fetch yok; İçsel Pusula: aynı `#sey-motivation-card`
  id'li ama tıklanamaz teaser kart). **Kök neden ve düzeltme:** Saygı zaten `data.startDate`'den
  bağımsız, sabit bir takvim epoch'una göre seçim yapıyordu (`SAYGI_EPOCH`) — yalnızca epoch
  `2026-07-10` yerine **`2026-07-13`** olacak şekilde düzeltildi. İçsel Pusula'nın günü
  (`data.motivation.currentProgramDay`) ise zaten eylem-tetiklemeli bir sayaç (ilk oluşturulduğunda
  1 ile başlar, `data.startDate`'e hiç bağlı değil) — ama `ensureMotivationRoot` her yerde
  (boot, Bugün/Rapor/Ayarlar render'ı) koşulsuz çağrılıyordu; artık **her çağrı noktası**
  `featuresLive()` ile korunuyor, yani kilit açılana kadar `data.motivation` **hiçbir koşulda**
  oluşmuyor — 13 Temmuz'dan önce kim ne kadar test ederse etsin sayaç ilerlemez, kilit açıldığı
  an ilk kez oluştuğunda otomatik olarak 1'dir. `panel.html`/`sync.js`/`motivationProgramV2.js`
  dokunulmadı (panel salt-okunur ayna, gerçek prod verisinde bu alanlar zaten hiç yoktu — `gh api`
  ile salt-okunur doğrulandı, hiçbir şey `seyma-data`'ya yazılmadı).
  **Doğrulama:** headless `vm` harness'i sahte saat (`FakeDate`) ile hem kilit-öncesi hem
  kilit-sonrası koşturuldu; en kritik test — `data.startDate` 2025-01-01'e (566+ "kullanım günü")
  sabitlenip kilit-sonrası bir tarihte hem Saygı'nın (takvim-bazlı, doğru ilerleyen indeks)
  hem İçsel Pusula'nın ("Gün 1/120") **kullanım gün sayısından tamamen bağımsız** doğru
  sonucu verdiği kanıtlandı (47/47 assertion PASS). Ayrıca gerçek prod `data/latest.json`
  (salt-okunur çekildi) `migrate()` + tüm sekme render'larından hem kilit-öncesi hem
  kilit-sonrası hatasız geçti, 18 gerçek gün kaydından hiçbiri kaybolmadı. Cache-bust:
  `app.js v=20260711o`.
- **2026-07-11** — **📎 ÆON sohbetine belge + hazır ses dosyası eki (iki yönlü, premium attach sheet)**:
  2026-07-06'daki sesli mesaj/fotoğraf altyapısının üzerine, hem Şeyma (app.js) hem gözlemci (panel.html)
  artık ÆON sohbetine **genel belge** (PDF/Word/Excel/metin/zip…) ve **cihazdan hazır bir ses dosyası**
  ekleyebiliyor — ikisi de canlı mikrofon kaydından ayrı, WhatsApp/Telegram tarzı bir **ek gönderme sayfası**
  (bottom-sheet) üzerinden. Composer'daki tek kamera düğmesi, tıklanınca **Fotoğraf / Belge / Ses dosyası**
  seçenekli bir ataç (paperclip) düğmesine dönüştü; canlı kayıt mikrofon düğmesi olduğu gibi kaldı. Hiçbir
  yerde emoji ikon kullanılmadı — yeni `paperclip` SVG ikonu mevcut `ICONS`/`icon()` sistemine eklendi.
  - **Belge:** yeni `mediaKind:'file'` — depolama aynı `data/aeon-media/<id>.json` (yaz-bir-kez) deseni;
    balonlarda dosya adı + boyut + aç/indir kartı (`aeonPaintFileCard`/`aeonPaintFileCardP`), açma paneldeki
    zaten mime-generic `openPdfP`'yi (tahlil PDF'leri için yazılmıştı) yeniden kullanıyor, app.js tarafında
    eşdeğeri yeni `App.aeonOpenFile` — decode→Blob→yeni sekme, açılmazsa `<a download>`.
  - **Ses dosyası:** **yeni bir oynatıcı yazılmadı** — mevcut `'voice'` kind'i (`viaUpload:true` + `name`
    ile) aynen yeniden kullanıldı; `aeonPaintVoicePlayer` zaten `peaks` yoksa düz varsayılan dalga formu
    çiziyor, süre yalnızca seçilen dosyanın kendi metadata'sından (`<audio>`+`loadedmetadata`) okunuyor.
  - **Boyut uyarısı:** mevcut tahlil-yükleme emsaliyle birebir (`>4MB` → uyarı toast/alert, engellemez).
  - **Doğrulama:** `node --check app.js`, panel.html script-syntax kontrolü, ve `run-seyma` headless
    `vm` harness'i genişletilerek (özel bir doğrulama betiği ile — repodaki `driver.mjs` değişmedi) attach
    sheet açılışı/kapanışı, emoji taraması (yok) ve sahte `file`/yüklenen-`voice` qa öğelerinin balon olarak
    hatasız render edildiği doğrulandı. Gerçek dosya seç→yükle→aç akışı ve `getUserMedia`/GitHub ağ çağrıları
    headless ortamda çalıştırılamadığından **tarayıcıda test edilmedi** (CLAUDE.md'nin kesin kuralı gereği —
    uygulamayı "çalışıyor mu" diye tarayıcıda açmak, stale localStorage + token ile `seyma-data`'yı ezme
    riski taşır). Cache-bust: `app.js v=20260711n`.
- **2026-07-10** — **☕ Kafein bilimsel takip + 6-faktör uyku hazırlığı + otomatik kafein tiki**: Sağlık sekmesindeki
  kafein takibi "kaç fincan" basitliğinden çıkarıldı; içecek türlerine göre **otomatik mg hesabı + günlük limit +
  uyku zamanlaması** bağlantılı bilimsel sisteme çevrildi. `CAFFEINE_TYPES` katalogu (türk kahvesi 60 · espresso 60 ·
  filtre 95 · americano 77 · cappuccino 63 · latte 63 · siyah çay 40 · yeşil çay 25 · enerji 80 mg/serving) ve
  `CAFFEINE_LIMITS` (standart 400 / hassas 300 / gebe 200 mg — EFSA 2015 & FDA) sabitleri eklendi. `caffeineTotalMg` /
  `caffeineResidueAt` (yarı ömür ~5 sa, `0.5^(dt/5)`) / `caffeineCutoffTime` (yatma − 6 sa) / `caffeineTimingOk`
  fonksiyonları hesapları yapar. Sağlık'ta premium kafein kartı: içecek chip grid + günlük içim listesi (satır başına
  saat input + sil) + limit bar (yeşil/sarı/kırmızı) + tek sefer 200 mg / günlük limit aşımı / geç-kahve uyarıları +
  yatma saatindeki kalıntı göstergesi (<50 yeşil "dalmayı etkilemez" · 50-100 sarı · >100 kırmızı) + `targetBed` input
  + EFSA/FDA kaynak notu. `settings.caffeineMode` (standart/hassas/gebe) + `settings.targetBed` migrate ile backfill
  edildi; eski `cups`/`last` verisi `drinks`'e (türk) geriye uyumlu çevrilir — veri kaybı yok. **"Uykuya dalma hazırlığı"
  kartı** 4-faktörden **6-faktöre** çıktı (süre 26 · kalite 18 · kafein 18 · okuma 16 · wind-down 14 · ilaç 8 = 100) —
  kafein kalıntı/zamanlama ve wind-down hijyeni bilimsel faktör olarak eklendi. Yeni **türetilmiş** "Günlük kafein
  limitini aşmadım" tiki (`caffeineOk`): elle tıklanmaz, kafein miktarı (≤ limit) + son içim saati (≤ cut-off)
  sağlanınca otomatik yeşillenir; hiç kahve içilmeyen günlerde de yeşil (0 mg = limit aşılmadı). `coffeeManaged` tiki
  (kriz/istek yönetimi) ayrı amaçla korundu. Panel kafein satırı drinks'ten mg + yatma kalıntısı hesaplar (eski
  cups/last fallback'i korundu). jsdom test 31/31; cache-bust `v=20260710m`.
- **2026-07-10** — **🆘 SOS sekmesi → üçlü "Raşit'in Kriz Odaları" (modal)**: Alttaki
  `sos` sekmesi kaldırıldı; tatlı krizi tek buton yerine **Bugün**'de üçlü, Raşit-temalı
  bir kart oldu: **Tatlı · Yemek · Kahve**. Her biri tıklanınca süreli, bilimsel bir
  **modal oda** açar (`crisisModalHTML`, `CRISES` config): Raşit'in nüktedan girişi +
  bilimsel kutu (tatlı=10 dk "urge surfing"; yemek=20 dk tokluk sinyali + HALT ayrımı;
  kahve=adenozin/yarılanma ömrü + saat 14:00 sonrası uyku uyarısı) + geri sayım + "ne
  denedin" + "tetikleyici" + **"Krizi yönettim"**. "Krizi yönettim" ilgili günün
  flag'ini kurar → bağlı tik kendiliğinden yeşillenir. **Üç yeni/bağlı tik** Bugün'ün
  tiklerine eklendi: 🍬 `sweetManaged` (`craving10MinDone`), 🍽️ `foodManaged`
  (`foodCravingDone`) ve ☕ `coffeeManaged` (`coffeeCravingDone`) — üçü de türetilmiş.
  Modaldaki **"Şu an ne denedin?"** ve **"Bu isteği ne tetikledi?"** bölümleri premium
  açılır (expander) hâline geldi (varsayılan kapalı; `ui.crisisTriedOpen`/`ui.crisisTrigOpen`,
  `App.toggleCrisisSection`). **"Raşit'e yaz / Raşit'i ara"** butonları "Raşit'ten Notlar"
  balonunun hemen altına, premium ikili olarak taşındı (`rasitContactHTML`). **"Zihnimi
  Besledim"** kutucukları vurgulu premium bir karta dönüştü. **Rapor**'daki "Raşit'ten
  Notlar" bölümü kaldırıldı (Bugün'deki balon kaldı). Panel yansıması: `foodManaged` tik
  çipleri + gün-detayında Tatlı/Yemek/Kahve krizi "Yönetildi" satırları + yeni tetikleyici
  etiketleri (duygusal/enerji dibi/keyif). Headless harness ile doğrulandı.
- **2026-07-10** — **✒️ Sabit marka başlığı (sticky header) — el yazısı wordmark + shimmer**:
  Başlangıç ekranı hariç **her sekmenin en üstünde** sabit, buzlu-cam bir marka başlığı
  (`appHeaderHTML`, `#app` flex-shell'in ilk çocuğu). Ortada **"Şeyma 🦩"** el yazısı
  wordmark'ı (iOS `Snell Roundhand`, cursive fallback) — üzerinden akan **ışık süzülmesi**
  (`.sey-wordmark` + `seyWordSheen` gradyan-kayması), minik sallanan flamingo (`seyFlamBob`)
  ve altında ✦ süslemeli ince gradyan ayraç. Giriş animasyonu (`seyHeaderIn`) yalnızca ilk
  görünümde oynar (`lastHeaderShown` ile sonraki render'larda bastırılır → titreme yok);
  `prefers-reduced-motion`'da tüm animasyonlar kapanır. `data-scroll`'un üst güvenli-alan
  dolgusu header'a devredildi. Kısa metin + stil alternatifleri kullanıcıya sunulup seçildi
  (**"Şeyma 🦩"** + script-shimmer). Cache-bust: `styles.css v=20260710a`, `app.js v=20260710b`.
  Headless harness ile doğrulandı (açık/koyu, tüm sekmeler, üç kriz akışı, expander'lar,
  kilitli tik→modal, onboarding'de header YOK) — JS hatası yok.
- **2026-07-06** — **⬡ ÆON sohbetine sesli mesaj + fotoğraf (iki yönlü)**: Hem Şeyma
  (app.js) hem gözlemci (panel.html) artık ÆON sohbetinde WhatsApp tarzı sesli mesaj ve
  fotoğraf gönderip alabiliyor. Video kapsam dışı bırakıldı (iOS Safari'de video
  `MediaRecorder` desteği tutarsız).
  - **Depolama:** Medya ana `data` senkronuna gömülmüyor — her ses/foto kendi
    `data/aeon-media/<id>.json` dosyasında (yaz-bir-kez, sha gerekmez) duruyor; aksi
    halde her küçük değişiklikte birikmiş tüm medya yeniden yüklenirdi.
    `putAeonMedia`/`fetchAeonMedia` (app.js) ve `putAeonMediaP`/`fetchAeonMediaP`
    (panel.html) — her iki taraf da kendi token/repo'sunu kullanır.
  - **Ses:** `MediaRecorder` + `AnalyserNode` ile dokun-başlat/dokun-durdur kayıt,
    canlı dalga formu, azami 120 sn. Balonlarda gerçek (kaydedilmiş) dalga formu +
    oynat/duraklat + ilerleme süresi — sahte/rastgele çizim değil.
  - **Fotoğraf:** Seç/çek → canvas ile ≤1280px + JPEG 0.72 sıkıştırma → yükle;
    balonlarda en-boy oranı korunan küçük resim + tam ekran lightbox.
  - **Veri modeli:** `data.aeon.qa[]` öğelerine `kind/mediaId/mediaMime/durationSec/
    peaks/w/h` (soru tarafı) ve `answerKind/answerMediaId/…` (yanıt tarafı);
    `data.notifications[]`'a aynı alanlar (proaktif gözlemci mesajları) —
    `mergeInbox()` bunları `data/observer-inbox.json`'daki mesajlardan taşır.
  - **Anlık görünürlük:** Kendi gönderdiğin medya, yükleme bitmeden
    `aeonMediaCache`'e önceden konur — balon ağ turu beklemeden anında görünür;
    gelen/geçmiş medya ilk görüntülemede çekilir, sonra önbellekte kalır.
  - **Doğrulama:** Gerçek Chromium'da (`--use-fake-device-for-media-stream`) hem
    app.js hem panel.html tarafında kayıt/iptal/gönder/oynat/fotoğraf akışları uçtan
    uca test edildi (durum yönetimi doğru, sızıntı yok); gerçek cihazda (iOS Safari
    mikrofon izni, gerçek Kısayollar/token) henüz denenmedi.
- **2026-07-06** — **🍏 Sağlık senkronu: GitHub Gist'e geçiş (Kısayollar kurulumunu
  sadeleştirme)**: Ana repodaki `data/health-sync.json` (Contents API) yerine bir
  **GitHub Gist** kullanılıyor artık. Sebep: Contents API her güncellemede önce
  dosyanın sha'sını çekip sonra içeriği base64'e çevirmeyi gerektiriyordu —
  Kısayollar'da en kafa karıştırıcı, hataya en açık adımlar bunlardı. Gist'in
  `PATCH` isteği düz metinle çalışır, sha istemez; Kısayol'daki eylem sayısı
  6-7'den 4'e indi ve "sha"/"base64" gibi hiçbir teknik terim gerekmiyor.
  - **Yeni ayar:** `data.settings.healthGistId` (Ayarlar'da değil, doğrudan
    kurulum kartındaki bir alana yapıştırılıyor). `App.setHealthGistId`,
    `migrate()`'te varsayılan `''`.
  - **Okuma:** `fetchHealthSync()` artık `GET https://api.github.com/gists/{id}`
    çekiyor, `files['health-sync.json'].content`'i `JSON.parse` edip
    `applyHealthSync()`'e veriyor (repo/branch/sha kavramı yok).
  - **Kart yeniden yazıldı** (`healthSetupCardHTML`): 3 bölüm — (1) tarayıcıda
    gist.github.com'da tek seferlik "kutu" oluşturma (adım adım, numaralı
    rozetler, kopyala çipleri: `App.copyHealthStarter`, Gist ID input'u), (2)
    Kısayollar'da 4 eylem (kopya çipleri: `App.copyHealthUrl`,
    `App.copyHealthAuth`, `App.copyHealthTemplate`), (3) otomasyona bağlama.
    Jetonun **gist izni** gerektiği (ince ayarlı jetonlar desteklemiyor, classic
    jeton gerekli) açıkça not edildi.
  - Ayarlar'daki eski Contents-API talimatı zaten Bugün ekranına yönlendiriyordu;
    değişmedi.
- **2026-07-06** — **🍏 Sağlık senkronu kurulum kartı — genişletilebilir, avantajlı,
  kopyala-yapıştır**: Ayarlar'daki düz metin talimat, Bugün ekranındaki Konum &
  Hareket kartının hemen altına taşındı — kullanıcı GPS'in arka planda
  çalışmadığını gördüğü anda gerçek çözümü de orada buluyor.
  - `healthSetupCardHTML()`: `ui.healthSetupOpen` ile açılır/kapanır accordion
    (`App.toggleHealthSetup`); daraltılmışken tek satır özet + "bağlı ✓" rozeti
    (sağlık verisi geldiyse), genişleyince 4 maddelik avantaj listesi (pil dostu,
    gerçekten arka planda, daha doğru, gizli kalır) + 3 adımlı kurulum + kopyala
    çipleri.
  - **Minimum hareket:** `App.copyHealthUrl` / `App.copyHealthAuth` /
    `App.copyHealthFields` ile URL, Authorization jetonu ve gövde alan adları
    tek dokunuşla panoya kopyalanıyor — jeton hiçbir zaman ekrana/HTML'e
    basılmıyor, tıklanınca `data.settings.ghToken`'dan doğrudan okunup
    kopyalanıyor. `shortcuts://` deep-link'i Kısayollar'ı doğrudan açıyor.
  - Ayarlar'daki eski uzun blok kaldırıldı, yerine Bugün ekranına götüren kısa
    bir yönlendirme kartı kondu (tek kaynak, iki yerde bakım yok).
- **2026-07-06** — **🧠 Faz 7 anketinin zorunlu tetikleyicisi kaldırıldı**: İki
  haftada bir `render()`'ı tam ekran bloke eden `psychDue()` kontrolü
  kaldırıldı — anket artık hiç açılmadığı sürece kullanıcıyı uygulamaya
  girişte durdurmuyor. `data.psych` (geçmiş/skorlar) ve panelin "Psikolojik
  Profil" kartı bozulmadan korunuyor; sadece otomatik/zorunlu açılış
  durduruldu. `psychActive()` artık her zaman `false` dönüyor ki eski
  "zorunlu anket açıkken arka plan popup'ını bastır" korumaları (gelen kutusu
  popup'ı, ÆON yanıt popup'ı) bir daha tetiklenmeyen anketin ardında kalıp
  sonsuza dek susmasın. `psychHTML()`/`App.psychBegin` vb. anket ekranı kodu
  dokunulmadan (ileride manuel/opsiyonel bir giriş noktasına bağlanabilir
  şekilde) bırakıldı.
- **2026-07-06** — **🍏 Sağlık senkronu (arka plan hareket verisi)**: Tarayıcı,
  uygulama arka plandayken GPS izleyemediği için (`watchPosition` yalnızca
  foreground'da çalışır) kısa aktiflik sürelerinde mesafe/adım verisi eksik
  kalıyordu. Çözüm: telefonun **Kısayollar** otomasyonu (kullanıcı tek seferlik
  kurar, sonrasında sessizce/otomatik çalışır) günlük adım + yürüyüş mesafesini
  Sağlık uygulamasından okuyup `data/health-sync.json`'a (`{date,steps,walkM,
  updatedAt}`) yazar; bu, senkronun zaten kullandığı GitHub Contents API'siyle
  aynı token/repo üzerinden yapılır.
  - **Okuma:** `fetchHealthSync()` → `applyHealthSync()` (app.js), `data.days[date]
    .health` alanına yazar (`emptyHealth()`); `pollRemote()` altında
    `fetchObserverInbox()` ile aynı tetikleyicilerde (boot, 30s poll,
    visibilitychange, focus, pageshow, online) — kullanıcı hiçbir şey yapmaz.
  - **Öncelik sırası:** `effSteps()` artık manuel > 🍏 sağlık > GPS-izlenen adım
    sırasını izliyor (panel.html'deki `effStepsP` birebir aynısı).
  - **Panel yansıması:** Bugün kartında (`locationCardHTML`) ve panelin gün-detayı
    + "Hareket" içgörü sekmesinde (`moveRows`) 🍏 satırı; GPS kapalıyken bile
    görünür (sağlık senkronu konum iznine bağlı değil).
  - **Ayarlar:** "Sağlık senkronu 🍏" kartı, Kısayollar kurulum adımlarını
    (otomasyon tetikleyicisi + eylemler + hedef URL) tek seferlik referans
    olarak gösteriyor. index cache-bust `v=20260705g` → `v=20260706a`.
- **2026-07-03** — **📍 Nudge iyileştirmeleri: süre verisi + günlük opt-out**:
  - **Süre ölçümü:** Konum açıkken artık yalnız mesafe değil **süre** de tutulur —
    `movement.walkSec` / `movement.vehicleSec` (`onLocationFix`'te fix'ler arası `dt`,
    fix başına ≤30s biriktirilir). Bugün ekranı Konum kartına **⏱️ Ayakta** ve
    **🕰️ Yolda** satırları eklendi (`fmtDur`; canlı `updateMovementUI`). Böylece
    nudge'daki "kaç saati yolda, kaç dakikası ayakta" vaadi gerçekten gösteriliyor.
  - **Panel yansıması:** `panel.html` "Bugün Hareket" bloğuna "⏱️ Ayakta süre" +
    "🕰️ Yolda süre" satırları (`fmtDurP`). Mesafe + yürüyüş/araç zaten yansıyordu.
  - **Günlük opt-out:** "Bir daha gösterme" → **"Bugün gösterme"** oldu. Kalıcı
    `optedOut` yerine `optOutDay=bugün`; eligibility `optOutDay===bugün` ise susar,
    **ertesi gün ve sonraki günler tekrar tetiklenir**. Toast: "Tamam, bugünlük
    kapattım — yarın yine buradayım 🌿".
  - **Fayda bankası 20 maddeye çıktı** (12 yeni; çoğu araç yolu·mesafe·süre·oturuş
    sağlığı). index cache-bust `v=20260704h` → `v=20260704i`. Doğrulama:
    `files/feat-locnudge.js` (73 konum-AÇIK kartı gerçek veriyle: 130.75 km / 🚶2.35 km /
    🚗128.40 km / ⏱️35 dk / 🕰️2 sa; günlük opt-out bugün susar, ertesi gün çıkar) — JS hatası yok.
- **2026-07-03** — **#23 📍 Konum-açma dürtüsü (nudge) ✅**: Konum kapalıyken kullanıcıyı
  konum paylaşımına nazikçe yönlendiren, sağlıkla ilişkilendirilmiş bir dürtü eklendi.
  - **Nerede & ne zaman:** Yalnız `bugun`/`saglik` sekmesinde, başka modal açık değilken,
    düzenleme modunda değilken çıkar. `App.go` (sekme), boot ve sekmeye geri dönüş
    (`visibilitychange`) tetikler.
  - **Ritim (rahatsız etmeyen):** `LOC_NUDGE` = min 6s ara · gün ≤2 · %60 olasılık ·
    3-7s rastgele gecikme · 8s ekranda kalış. "Belki sonra" 8s, ✕/arka plan 4s snooze +
    her reddte artan backoff (2s→maks 24s). 8 reddten sonra "fısıltı modu" (3 günde bir).
  - **İçerik:** Her açılışta `LOC_BENEFITS`'ten sırayla 1-2 fayda; **20 madde**, çoğu araç
    yolculuğu · kat edilen mesafe · yolda geçen süre · uzun oturuş–dolaşım ilişkisi çerçeveli
    (🚗 uzun yol, ⏱️ yolda/ayakta süre, 🛣️ tekerlek vs adım, 🦵 bacak dolaşımı, 💺 koltuk
    süresi, 🚙 km, 🕰️ sabit pozisyon, 💧 su+adım, 🌊 şişlik, 🧠 yol yorgunluğu, 🎯 hedef, 🫁 nefes).
  - **Akış:** "Konumu aç ✨" → mevcut `ui.locationConsent` rıza modalı (tek gizlilik kaynağı) →
    tarayıcı izni. "Bir daha gösterme" → `optedOut`. Kalıcı sayaçlar `data.locNudge`
    (shownCount/dismissCount/dismissStreak/benefitIdx/dayCount/snoozeUntil…); sync'e zararsız
    yansır (gizli alan yok). Panel yansıması yok (cihaz/etkileşim özelliği, haptik gibi).
  - index cache-bust `v=20260704g` → `v=20260704h`. Doğrulama: `files/feat-locnudge.js`
    (70 açık nudge, 71 "Konumu aç"→rıza modalı, 72 koyu nudge araç faydalarıyla) — konum
    kapalıyken nudge çıkıyor + fayda dönüşümü/kalıcılığı, "Konumu aç"→rıza, "Belki sonra"→snooze,
    **konum açıkken asla çıkmıyor**, gerçek JS hatası yok.
- **2026-07-04** — **#9 🎯 Günün niyeti + #20 🕯️ Bugün 1 yıl önce + #22 📳 Haptik ✅** (üçü birlikte):
  - **#9 Günün niyeti:** Bugün ekranında "Günün Mesajı"nın hemen altına warm cam kart
    (`data.days[].intention`, ≤140 karakter, `App.onIntention` + `debounceSave`). Başlık
    bugün "Bugünün niyeti" / geçmiş günde "O günün niyeti"; geçmiş gün güvenli düzenlemeye
    bağlı (`curDay()`). Gün-detayı popup'ında "🎯 Niyet:" bloğu; `daysTracked` sinyaline
    eklendi. Panel'de `exRowAlways("🎯 Niyet", …)` (gün-detayının ilk satırı).
  - **#20 Bugün 1 yıl önce:** `onThisDayCard()` → Bugün ekranında salt-okunur nostalji kartı
    ("Bugün, N yıl önce"): geçmiş yılların aynı gününden en yakını (mod/tik/niyet/not/şükran)
    + "O günü aç →" (`App.openDate`). Yeni veri yok, `data.days`'ten okur. Panel'de
    `exRowAlways("🕯️ Bir yıl önce", …)` (Şükran'ın altında).
  - **#22 Haptik:** `haptic()` helper → `navigator.vibrate` (tik/mod/SOS dokunuşlarında);
    Ayarlar'da "Titreşim geri bildirimi" aç/kapa (`settings.haptics`, varsayılan açık).
    Panel yansıması yok (cihaza özel).
  - index cache-bust `v=20260704f` → `v=20260704g`. Doğrulama: `files/feat-shot.js`
    (60-66: bugun açık/koyu, niyet kartı + kalıcılık, on-this-day kartı, popup, Ayarlar
    haptik) + `files/feat-panel.js` (67: panel Niyet/Bir yıl önce satırları) — niyet
    yazılıp localStorage'a düştü, on-this-day + popup + panel satırları render oldu,
    gerçek JS hatası yok (panelde yalnız benign 404).
- **2026-07-04** — **#4 🗓️ Ruh hali ısı haritası ✅**: Rapor sekmesine "Mod dağılımı"nın
  hemen altına **GitHub-tarzı yıllık mod ısı haritası** eklendi (`moodHeatmapCard()`).
  ‹yıl› seçici (veri başlangıcı → bugün arası), yatay kaydırılabilir 7×hafta grid
  (Pzt başlangıç), ay/gün etiketleri, mod paletiyle renklendirilmiş hücreler; boş
  günler soluk, gelecek günler pasif, bugün halkalı. Bir hücreye **dokununca**
  `App.heatOpen` → harita sekmesinde o günü açar (gün-detayı + "Bu günü düzenle"),
  böylece geçmiş gün güvenli düzenleme akışına bağlanır. Panel'e salt-okunur ayna
  (`moodHeatmapCardHTML()`, tam yıl, panel mod paleti) eklendi. `ui.heatYear` +
  `App.heatYear` yıl navigasyonu; index cache-bust `v=20260704f`.
  Doğrulama: `files/heatmap-shot.js` (50-54: rapor açık/koyu, tap→harita, yıl nav,
  panel) — 184 dokunulabilir hücre, tap gün-detayını açtı, yıl geri 2025'i gösterdi,
  gerçek JS hatası yok.
- **2026-07-03** — **Panel — tik'ler tam isimleriyle**: Gözlemci panelinde (panel.html)
  gün-detayı tik rozetleri artık kısaltma yerine **uygulamadaki tam başlıklarla**
  görünüyor (ör. "Tatlı", "Aksam" → "Tatlı krizini yönettim", "Akşam 7'den sonra
  gereksiz atıştırmadım"). panel-test.js ile doğrulandı; gerçek JS hatası yok.
- **2026-07-03** — **Günlük tikler yenilendi — 🥦 Sebze/lif + 🧘 Germe/nefes → 📝 Günlük notu + 🌿 Açık hava**:
  Az kullanılan iki tik kaldırıldı; yerine takip edilmeyen iki güçlü alan eklendi:
  📝 **Duygu/günlük notu yazdım** (zihni boşaltmak → kaygıyı düşürür) ve
  🌿 **Açık havaya çıktım** (doğal ışık → ruh hâli, D vitamini ile sinerji).
  Toplam tik sayısı **10** olarak korundu. Yeni tik'lerin `since` tarihi **bugün**
  yapıldı → geçmiş günlerin yüzdesi bozulmaz; eski `veggie`/`mobility` verisi
  zarar görmeden arşivde kalır. `HABITS` dizisi (app.js), haftalık özet etiketleri
  ve panel eş dizisi (panel.html) senkron güncellendi; cache-bust `v=20260704e`.
  Harness (habit-shot.js) ile açık+koyu doğrulandı; JS hatası yok.
- **2026-07-03** — **Günışığı hava durumu kartı — estetik + genişleyebilir**:
  Üstteki Günışığı header'ı **dokunulabilir, genişleyebilir bir hava-durumu
  kartına** dönüştü. Sağdaki 🦩 kaldırıldı; yerine anlık hava geldi. Konum
  **kapalıyken** iki sabit nokta gösterilir: 🏠 **Ev · Kazan** ve
  🏢 **İş · Altındağ**; konum **açıkken** canlı konumun (best-effort şehir adı).
  Karta dokununca açılır: her nokta için sıcaklık/hissedilen/nem/rüzgâr/UV/
  en-yüksek-düşük/gün doğumu-batımı + **hava-bazlı sağlık notları** (UV, sıcak/
  soğuk, yağış+basınç→baş ağrısı, rüzgâr, nem) + **nüktedan pozitif söz**.
  Veri: **Open-Meteo** (anahtarsız, CORS), 30 dk önbellek (`data.weather`).
  Panele **"☀️ Günışığı · Hava"** kartı yansıtıldı. `.wxcard` CSS + cache-bust
  `v=20260704d`. Harness ile açık+koyu, kapalı+açık ve panel doğrulandı; JS hatası yok.
- **2026-07-04** — **Günışığı header (üst) — estetik**: Bugün ekranının **en
  üstüne** gün doğumu temalı yeni bir header eklendi (☀️ + "Günışığı" + saate
  göre selam + 🦩). Uygulama adı **"Şeyma 🦩"** olduğu gibi korundu
  (hero/onboarding/rapor/sekme başlığı değişmedi). Sadece `--sun`/`--sun2`/
  `--sun-glow` değişkenleri eklendi (açık+koyu); cache-bust `v=20260704c`.
  Harness ile açık+koyu doğrulandı.
- **2026-07-04** — **#1 Ne Dinledim ✅ + #2 Şükran ✅**: 🎵 "Ne Dinledim"
  hub'ı (Bugün / Favoriler / İstatistik / Sözler) — `data.music` favorileri +
  `data.days[].listening` günlük kayıtları, teal `--listen` accent (açık/koyu),
  günlük hedef halkası, 7 günlük çubuk grafik. 🙏 "3 Güzel Şey" kartı Bugün
  sekmesinde (`data.days[].gratitude`, ≤3; geçmiş günde de düzenlenebilir).
  Panel yansıması: "🎧 Dinleme Arşivi" bento kartı + gün-detayında dinleme
  kayıtları ve "3 güzel şey" bloğu + sözler "Alıntılar · Replikler · Sözler"
  bölümüne katıldı. Harness ile açık/koyu temada doğrulandı (JS hatası yok);
  cache-bust `v=20260704a`. Sayım: ✅ 8 · 🟡 5 · ❌ 9.
- **2026-07-03** — Belge **yaşayan belge**ye çevrildi: canlı durum tablosu,
  rozetler ve tetikleyici notu eklendi. Mevcut durum denetlendi
  (✅ 6 · 🟡 5 · ❌ 11).
- **2026-07-03** — **#15 Geçmiş günü düzenleme ✅**: Harita'dan güvenli
  geçmiş-gün düzenleme, uyarı bandı, otomatik çıkış (idle/görünürlük/reload),
  ay özeti kartı; takvim tarih-yön hatası düzeltildi.

