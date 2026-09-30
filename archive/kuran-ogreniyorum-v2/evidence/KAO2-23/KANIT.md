# KAO2-23 — Ayarlar (S-13) iOS düzeni + "Hakkında ve kaynaklar"
Tarih: 2026-09-30 · Dal: kao2-yeniden-tasarim (= main) · Önceki commit: `51570555`

## Bulgu (01 O-04 · 02 T-22, T-23)
Ayarlar **7 dağınık bölüm** halindeydi ve **kaynak/lisans listesi Ayarlar'ın
gövdesine gömülüydü** — iOS kalıbı inset grouped list + ayraç alt sayfa bekler.

## Yapılan
- **Amaca göre gruplama (T-22):** 7 bölüm → üç ana grup + alt başlıklar:
  - **Günlük hedef** — süre segmenti (5/10/15) + **Niyet satırı**
  - **Ses** — üslup segmenti (Kapalı/Yavaş/Doğal) + sessiz saat notu · **Ses · gölgeleme** alt başlığı
  - **Okuma** — okunuş katmanı, harekeler, tekrarda soldurma · **Okuma · görünüm** (Arapça satır aralığı, kelime boşluğu) · **Okuma · görünürlük**
  - **Diğer** — Seviye 0 kontrolünü yeniden aç, CSV indir
- **Alt sayfa (T-23):** kaynak/lisans listesi + Seviye 0/CSV **derine** taşındı.
  Ayarlar yalnız `Hakkında ve kaynaklar ›` bağlantısını taşır.
- **Alt sayfa (`kao-sources-page`):** Hakkında (sürüm, çalışma biçimi, **gizlilik**),
  Gelişmiş eylemler, tam kaynak listesi. Geri yolu `‹ Ayarlar`.
- **Niyet satırı** gerçek veriden okunur (`s.intent` → namaz kodu), D-18 uygulama niyeti.

## TDD
- **Kırmızı:** `test_kao2_settings.js` → `üç grup doğru sırada (06 §2)`.
- **Kendi hatalarım (testler yakaladı):**
  1. Gömülü kaynak bloğunu çıkarırken desen iki kez eşleşti (biri yeni alt sayfam) →
     yalnız Ayarlar'daki çağrı ayırt edici bağlamla çıkarıldı.
  2. **`kaoSourcesHTML(esc)` çağrıldığında `esc` aktarılmıyordu** → `TypeError`; artık
     parametre yoksa `quranLearnDeps.esc` kullanılır (tek doğru kaynak).
  3. Alt sayfada `kao-settings-group` sınıfını yeniden kullandım → ayrım testte
     kanıtlanamadı; `kao-about-group` olarak ayrıldı.
  4. Testim `kaoSourcesHTML` (bölüm) ile `kaoSourcesPageHTML` (sayfa) karıştırdı.
  5. Testin grup iddiası fazla katıydı (alt başlıklar grupluydu) → sıra + alt başlık
     kalıbına göre yazıldı.
- **Yeşil:** `test_kao2_settings.js` **8/8** · KAO ailesi **41/41**.

## Kapılar (P3)
| Komut / aile | Sonuç |
|---|---|
| `tests/kao/test_*.js` | PASS · **41/41** |
| `tests/app/test_*.js` | PASS · **77/77** |
| panel · panel-v2 · quran | PASS · 23/23 · 27/27 · 9/9 |
| reminders · driver · zikr · contrast · iip_22 | PASS |
| `git diff --check` | temiz |

### K-1 bütçe (revizyon 2: 128 KiB)
çalışma zamanı **88.529 / 128 KiB** · içerik 177.657/256 · css 12.142/14 · p95 4.7 ms.

## Kimlik pinleri — DEĞİŞMEDİ
`App.kao*` **43** (kartın kabul ölçütü: "handler sayısı değişmedi (40)" — burada 43,
çünkü KAO2-19/20'de 3 handler eklendi; **bu kartta 0 yeni handler**).

## Yan düzeltme
E7 kaynaklar fixture'ı (`test_kao_render`) kaynak listesini Ayarlar gövdesinde
arıyordu; kartın (T-23) gereğine göre **alt sayfaya** yönlendirildi — aynı kontroller
(kaynak adları, manifest eşleşmesi, `href` atıfları) korunur.

## Dürüstçe açık
- Cihaz kabulü ve gerçek ekran okuyucu testi yapılmadı.
- "Hakkında" sürüm dizesi basit (`KAO2 · metin katmanı N sûre bağlamı`); sürüm
  numarası sabitleme KAO2-27 kapanış kartında ele alınacak.
