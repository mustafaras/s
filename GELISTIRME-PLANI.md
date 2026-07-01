# Şeyma 🦩 — Geliştirme Planı (Yol Haritası)

Bu belge, uygulamaya eklenebilecek **faydalı yeni özelliklerin** kapsamlı bir
planıdır. Amaç: mevcut sıcak/estetik dili ve mimariyi bozmadan, günlük kullanımı
derinleştirmek. Her madde **ne / neden / nasıl (teknik) / emek / panel etkisi**
ile yazıldı. Öncelik sırasına göre sürümlere bölündü.

> Not: Bu bir **plan**dır, henüz uygulanmadı. Sırayı ve kapsamı ihtiyaç
> değiştikçe güncelleyebiliriz.

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

### 1. 🎵 "Ne Dinledim" hub'ı
- **Ne:** Şarkı/albüm/podcast kaydı; sanatçı, tür, ruh haline göre çalma
  listesi, favori sözler, istatistik.
- **Neden:** Okuma/İzleme üçlemesini tamamlar; günlük ruh haliyle güçlü bağ.
- **Nasıl:** `readingOverlayHTML` şablonunu kopyala-uyarla; `data.listening`
  (items + günlük entries), yeni accent `--listen` (örn. yeşil/teal).
- **Emek:** Orta. **Panel:** Yeni "🎧 Dinleme" bento kartı + gün-detayı satırı.

### 2. 🙏 Şükran / "3 Güzel Şey" günlüğü
- **Ne:** Her güne 3 küçük iyi şey.
- **Neden:** Ruh haline kanıtlı olumlu etki, çok hafif.
- **Nasıl:** `data.days[date].gratitude = [..]`; `bugun` sekmesine kart.
- **Emek:** Düşük. **Panel:** Gün-detayında "bugün minnettar olunanlar".

### 3. 📈 Otomatik içgörüler (korelasyon kartları)
- **Ne:** "Yürüyüş yaptığın günlerde enerjin daha yüksek", "5 saatten az
  uyuduğunda ruh halin düşüyor" gibi cümleler.
- **Neden:** Var olan veriyi anlama dönüştürür; rapor sekmesine güç katar.
- **Nasıl:** `rapor` içinde geçmiş günleri tarayan basit korelasyon/eşik
  fonksiyonları (uyku↔mod, adım↔enerji, kafein↔uyku, regl fazı↔mod).
- **Emek:** Orta. **Panel:** "Bu haftanın içgörüsü" kartı.

### 4. 🗓️ Ruh hali ısı haritası (takvim)
- **Ne:** GitHub-benzeri yıllık grid; her gün ruh hali rengiyle.
- **Neden:** Örüntüyü tek bakışta gösterir.
- **Nasıl:** `rapor` içinde `data.days` üzerinden ay/yıl grid; renk = mod
  değeri → CSS değişken tonları.
- **Emek:** Orta. **Panel:** Aynı ısı haritası salt-okunur.

### 5. 🏅 Rozet & seri (streak) sistemi
- **Ne:** "7 gün su hedefi", "10 kitap", "30 gün kayıt" rozetleri + seriler.
- **Neden:** Motivasyon, "zinciri kırma" hissi.
- **Nasıl:** Türetilmiş (hesaplanan) rozetler; `data.badges` yalnızca
  kilitlenme tarihini tutar. Okuma/izleme/su/alışkanlık verisi hazır.
- **Emek:** Orta. **Panel:** "Kazanımlar" şeridi.

### 14. 🛟 Dışa/içe aktarma (yedek)  ← Sürüm 1'e alındı (kritik)
- **Ne:** Tek tuşla `data`'yı JSON indir / geri yükle.
- **Neden:** Repoya erişilmese bile veri güvencesi; taşınabilirlik.
- **Nasıl:** `ayarlar`'a "Yedeği indir / Yedekten yükle" (Blob download +
  file input → `JSON.parse` → doğrula → `data`'ya yaz → `save()`).
- **Emek:** Düşük. **Panel:** —

---

## 💜 Sürüm 2 — Duygu & zihin sağlığı derinleştirme

### 6. 🧠 Düşünce kaydı (CBT tarzı)
- **Ne:** Otomatik düşünce → duygu/şiddet → kanıt → yeniden çerçeveleme.
- **Nasıl:** `sos` akışına bağlı yeni overlay; `data.days[date].thoughts[]`.
- **Emek:** Orta. **Panel:** Sayı/özet (mahremiyete saygılı, kısaltılmış).

### 7. 🌬️ Nefes / meditasyon
- **Ne:** Rehberli nefes animasyonu (ör. 4-7-8), süre kaydı, günlük dk hedefi.
- **Nasıl:** CSS/SVG animasyon; `data.days[date].breath.minutes`. SOS'tan erişim.
- **Emek:** Orta. **Panel:** "Nefes dakikası" satırı.

### 8. ✍️ Serbest günlük (journaling) + Luna promptları
- **Ne:** "Bugün seni ne zorladı?" gibi yazma soruları; uzun serbest metin.
- **Nasıl:** `data.days[date].journal`; Luna (mesaj sekmesi) verilerden
  kişisel prompt üretir.
- **Emek:** Orta. **Panel:** Var/yok rozeti (içerik gizli tutulabilir).

### 9. 🎯 Günün niyeti / kelimesi
- **Ne:** Sabah tek cümlelik niyet, akşam "tuttun mu?" değerlendirmesi.
- **Nasıl:** `data.days[date].intention = {text, kept}`.
- **Emek:** Düşük. **Panel:** Gün-detayı satırı.

---

## 🩸 Sürüm 2 — Döngü & beden (mevcut regl/harita üstüne)

### 10. Adet döngüsü tahmini & faz
- **Ne:** Sonraki regl tahmini, folliküler/luteal faz, semptom-faz
  korelasyonu, nazik yaklaşan-regl hatırlatması.
- **Nasıl:** Geçmiş regl günlerinden ortalama döngü; faz→gün eşlemesi;
  içgörü motoruyla (madde 3) birleşir.
- **Emek:** Orta. **Panel:** "Tahmini faz" rozeti.

### 11. 💊 İlaç hatırlatıcı & uyum takibi
- **Ne:** Saatli ilaç listesi, "aldım/atladım", haftalık uyum yüzdesi.
- **Nasıl:** `data.meds[]` (tanım) + `data.days[date].medLog[]`.
- **Emek:** Orta (bildirimle → ileri). **Panel:** Uyum yüzdesi kartı.

---

## 🔔 Sürüm 3 — Hatırlatıcı & erişim

### 12. PWA yerel bildirimler
- **Ne:** Su, akşam check-in, ilaç, "bugün birkaç sayfa okudun mu?" nazik
  hatırlatmaları.
- **Nasıl:** Service worker + Notification API (izin akışı); zamanlama
  tercihleri `ayarlar`'da.
- **Emek:** İleri (PWA/SW altyapısı). **Panel:** —

### 13. 🔒 PIN / gizlilik kilidi
- **Ne:** Açılışta PIN (opsiyonel biyometrik).
- **Nasıl:** `data.settings.pin` (hash'li); açılışta kilit ekranı.
- **Emek:** Orta. **Panel:** —

### 15. 🕰️ Geçmiş günü düzenleme
- **Ne:** Retroaktif kayıt/düzeltme (unutulan günü geri dönüp doldurma).
- **Nasıl:** Tarih seçici → o günün `data.days[date]`'ini düzenleme moduna al.
- **Emek:** Orta. **Panel:** — (zaten geçmişi gösteriyor).

---

## 🤝 Sürüm 3 — Panel (gözlemci) & bağ

### 16. Kötü-gün serisi uyarısı
- **Ne:** Arka arkaya düşük ruh hali → gözlemciye nazik bildirim.
- **Nasıl:** Sync sırasında eşik kontrolü; panelin okuduğu alana bayrak.
- **Emek:** Orta. **Panel:** Uyarı şeridi.

### 17. 📮 Haftalık özet
- **Ne:** Hem kullanıcıya hem gözlemciye paylaşılabilir "bu hafta" kartı
  (ruh hali, uyku, okuma/izleme, kazanımlar).
- **Nasıl:** Haftalık toplayıcı; panelde ayrı bölüm; görsel export (madde 22).
- **Emek:** Orta. **Panel:** "Bu hafta" kartı.

### 18. 💌 "İyiyim" dokunuşu
- **Ne:** Tek tuşla sevdiğine küçük kalp/sinyal gönderme.
- **Nasıl:** `data`'da küçük sinyal alanı → panel gösterir (tek yönlü, hafif).
- **Emek:** Düşük. **Panel:** "Son dokunuş" göstergesi.

---

## ✨ Sürüm 3 — Küçük ama tatlı dokunuşlar

### 19. 💬 Günün alıntısı
- Kütüphanedeki alıntı/repliklerden rastgele biri ana ekranda. **Emek:** Düşük.

### 20. 🕯️ "Bugün 1 yıl önce"
- Geçmiş `data.days` içinden aynı günün notu/ruh hali. **Emek:** Düşük.

### 21. 🎉 Özel gün kutlaması
- Doğum günü/yıldönümü konfeti + mesaj (`data.settings.specialDays`).
  **Emek:** Düşük.

### 22. 📳 Haptik + mikro animasyon
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
