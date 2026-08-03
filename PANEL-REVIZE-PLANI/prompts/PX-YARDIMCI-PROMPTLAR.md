# PX — Yardımcı Promptlar

> Bu dosya, ana faz promptları dışında ihtiyaç duyulabilecek **destek promptlarını** içerir. Bunlar bağımsız session'larda da verilebilir.

## PX-01 — Debug ve hata ayıklama

**Kullanım:** Bir test fixture fail ettiğinde veya beklenmeyen bir davranış gözlemlendiğinde.

### Prompt

```text
ÆON panel revizyonunda bir hata ile karşılaştım. Şu dosyaları incele:
- panel-revize-state.json
- panel-v2.js
- panel-v2.css
- ilgili test fixture (tests/test_panel_v2_XXX.js)

Hata mesajını, fail eden satırı ve önceki 3 turun state evidence kaydını raporla. 
Kodu değiştirmeden önce hipotezini söyle ve kullanıcıdan onay al. 
Düzeltme sonrası syntax check ve ilgili fixture'ı çalıştır; state.json güncelle.
```

## PX-02 — Mevcut panel ile yeni panel veri karşılaştırması

**Kullanım:** Aynı `data` objesiyle iki panelin farklı sonuç ürettiği şüphesi varsa.

### Prompt

```text
Aynı seed data ile mevcut panel.js (eski) ve panel-v2.js (yeni) hesapladığı KPI'ları karşılaştır.
Karşılaştırılacaklar: bugün mod, dün uyku süresi, bugün adım, 7 günlük su ortalaması, SOS sayısı, eksik gün.
Farkları PANEL-REVIZE-PLANI/08-VERI-KARSILASTIRMASI.md'ye tablo olarak yaz; nedenini açıkla.
Hiçbir dosyaya işlevsel değişiklik yapma; sadece analiz ve belgele.
```

## PX-03 — Rollback (eski panele dönüş)

**Kullanım:** Yeni panel canlıya alındıktan sonra ciddi bir sorun çıkarsa.

### Prompt

```text
panel-v1-backup/ klasöründeki yedek dosyaları geri yükle:
- panel-v1-backup/panel.html → panel.html
- panel-v1-backup/panel.js → panel.js
- panel-v1-backup/panel.css → panel.css
index.html cache-bump'ını güncelle (eski asset versiyonlarına geri dön).
Değişiklikleri commit et ve push et; state.json'da durumu "rollback" olarak kaydet.
Kullanıcıya eski panelin geri yüklendiğini bildir.
```

## PX-04 — Data safety hatırlatma

**Kullanım:** Herhangi bir session başında veya test öncesinde veri güvenliğini teyit etmek için.

### Prompt

```text
Bu session'da ÆON panel revizyonu ile çalışıyoruz. Aşağıdaki kuralları hatırlat ve uygula:
- Şeyma uygulamasını (index.html/app.js) tarayıcıda açma; headless fixture kullan.
- mustafaras/seyma-data reposuna yazma yapma (okuma serbest).
- ghToken, openaiKey, syncUrl gibi secrets'i kodda veya test çıktısında gösterme.
- Ham GPS, profil cevapları, terapi metinleri, medya verilerini panelde açık metin olarak gösterme.
- Her tur sonunda panel-revize-state.json güncelle.
```

## PX-05 — Faz atlaması / özel görev

**Kullanım:** Kullanıcı belirli bir göreve odaklanmak istediğinde.

### Prompt

```text
PANEL-REVIZE-PLANI/panel-revize-tasks.json'daki [GÖREV_ID] görevini uygula.
Önce dependsOn kontrolü yap; bağımlılıklar tamamlanmamışsa blocker olarak kaydet.
Görev tamamlandığında ilgili testleri çalıştır ve state.json güncelle.
Rapor formatı: İşlenen görev, dosyalar, test sonuçları, sonraki görev.
```

## PX-06 — State senkronizasyon onarımı

**Kullanım:** `panel-revize-state.json` ile `panel-revize-tasks.json` arasında uyumsuzluk varsa.

### Prompt

```text
PANEL-REVIZE-PLANI/panel-revize-state.json ile panel-revize-tasks.json arasındaki tutarlılığı kontrol et.
Eksik tamamlanmış görevleri, yanlış nextTaskId veya stale blockers varsa düzelt.
Eğer büyük bir onarım gerekiyorsa önce kullanıcıya rapor sun ve onay al.
```

---

Bu yardımcı promptlar, ana faz promptlarına destek olarak kullanılır.
