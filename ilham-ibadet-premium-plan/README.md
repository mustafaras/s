# İlham & İbadet — Premium ürün ve uygulama planı v2.1

**19 Eylül 2026 · Planlama teslimatı · Üretim uygulaması 0/24.**

Hedef, İlham & İbadet'i nitelikli içerik, kesintisiz okuma, güvenilir kayıt ve sakin bir görsel kimlikle her gün dönmek isteyeceğin bir alana taşımak. “World-class / top-tier” hedefini ekran, davranış, içerik ve kanıt koşullarına çevirdik; henüz elde edilmiş kalite sonucu olarak kullanmıyoruz.

**Ajan için giriş:** [START-HERE](START-HERE.md). **Kullanıcı için ilk okuma:** [ürün vizyonu](specs/01-URUN-VIZYONU.md) → [12 ekran şartnamesi](specs/02-EKRAN-SARTNAMESI.md) → [kalite hedefleri](specs/05-KALITE-SKOR-KARTI.md).

## Oturumda yalnız bunu kullan

**[Tek sıralı prompt dosyası: UYGULAMA-PROMPTLARI.md](UYGULAMA-PROMPTLARI.md)** — her yeni oturumda seçtiğin tek adımın bloğunu kopyala. Ajan için kısa başlangıç: [START-HERE](START-HERE.md).

`node ilham-ibadet-premium-plan/tools/session-brief.mjs IIP-01` yalnız seçili görev ve canlı kayıtlarını çıkarır. Ayrıntılı dosyalar korunur, varsayılan oturum bağlamına yüklenmez. Token tasarrufu testleri azaltarak değil gereksiz tekrar okumayı kaldırarak sağlanır.

## V2'de esaslı olarak değişenler

- **12 ekran için şartname:** kompozisyon, ana eylem, içerik yoğunluğu, responsive, odak/dönüş ve hata hâlleri.
- **İmza deneyimler:** günlük seçki, kesilmeyen okuyucu, gerçek kayıttan devam, anlamdan pratiğe geçiş, güvenilir vakit ve yargılamayan ritim.
- **48 gereksinim ve 48 test senaryosu:** her birinin sahibi, olumlu kabulü, olumsuz kontrolü ve kanıt bağlantısı var. Test senaryosu yazılmış olması otomatik test uygulanmış demek değildir.
- **24 bağımsız görev kartı:** yeni bir ajan yalnız başlangıç rehberi ve yetkili kartını okuyarak dosya sınırını, kontrolleri ve durma noktasını bulabilir.
- **Gerçek takip sistemi:** JSON durum kaynağı, üretilmiş pano/DAG/izlenebilirlik matrisi, dosya sahipliği, ledger, kararlar, riskler ve devir şablonları.
- **İçerik üretim hattı:** kaynak/iddia/hak/insan incelemesi, yayın ve geri çekme; taslakla kabul edilmiş metin ayrılıyor.
- **Kalite protokolü:** 8 kullanıcı görevi, 100 puanlık tasarım değerlendirmesi, zorunlu doğruluk/erişilebilirlik koşulları ve cihazdan ayrı kaynak kanıtı.

V1'in koşullu namaz migration döngüsü kaldırıldı. Erken aşamada yanlış kesinlik üreten kopya düzeltilmesi planlandı; B'de eski kayıtları değiştirmeden sunum yapılır. Yeni namaz şeması sessizce program kapsamına alınmaz. Dayanaksız gün toplamı geri çekildi; mühendislik/tasarım/editoryal/inceleme süreleri ilk keşifte ayrı tahminlenecek.

## Ürün dosyaları

| Okuma | Amaç |
|---|---|
| [Mevcut durum](01-MEVCUT-DURUM.md) | Kodla doğrulanan başlangıç ve eksikler |
| [Deneyim ve işlev](02-DENEYIM-VE-ISLEV.md) | Bilgi mimarisi ve öncelik |
| [Tasarım sistemi](03-TASARIM-SISTEMI.md) | Tipografi, malzeme, renk, hareket, wireframe |
| [İçerik stratejisi](04-ICERIK-STRATEJISI.md) | İçerik aileleri ve pilot hacim |
| [Ürün vizyonu](specs/01-URUN-VIZYONU.md) | İmza deneyimler ve kaynaklı ürün örnekleri |
| [Ekran şartnamesi](specs/02-EKRAN-SARTNAMESI.md) | 12 ekranın ayrıntılı sözleşmesi |
| [8 bileşen sözleşmesi](specs/06-BILESEN-KATALOGU.md) | Anatomi, varyant, klavye, odak ve hata davranışı |
| [Etkileşim sözleşmeleri](specs/03-ETKILESIM-SOZLESMELERI.md) | Durum makineleri, devam, cache, odak, iptal |
| [İçerik üretim sistemi](specs/04-ICERIK-URETIM-SISTEMI.md) | Editoryal iş akışı ve insan kabulü |
| [Kalite değerlendirmesi](specs/05-KALITE-SKOR-KARTI.md) | Skor, kullanıcı görevleri ve performans ölçümü |

## Ajan ve uygulama dosyaları

| Dosya | Otorite |
|---|---|
| [START-HERE](START-HERE.md) / [AGENTS](AGENTS.md) | Okuma sırası ve çalışma sözleşmesi |
| [IIP-STATE.json](IIP-STATE.json) | Tek güncel kart/durum/yetki/kanıt kaydı |
| [CURRENT-STATE](tracking/CURRENT-STATE.md) | Üretilmiş kısa takip panosu |
| [24 kart kataloğu](06-UYGULAMA-KARTLARI.md) | Kart başına bağımsız görev |
| [TRACEABILITY](tracking/TRACEABILITY.md) | REQ → kart → TC → kanıt |
| [DEPENDENCIES](tracking/DEPENDENCIES.md) | Döngüsüz teknik önkoşullar ve seri yazma sınırları |
| [Teknik sözleşme](05-TEKNIK-SOZLESME.md) | Veri/ağ/sahiplik ve geri alma |
| [Kalite komut rehberi](07-KALITE-VE-KABUL.md) | Mevcut testler ve kanıt düzeyleri |
| [Kararlar](tracking/DECISIONS.md) / [Riskler](tracking/RISKS.md) | Açık seçimler, sahip ve kapanış kanıtı |
| [LEDGER](tracking/LEDGER.jsonl) | Olay günlüğü |
| [Devir](templates/HANDOFF.md) / [kanıt](templates/EVIDENCE.json) | Doldurulacak şablonlar; kendileri kanıt değil |

## Denetleme

Repo kökünden:

```sh
node ilham-ibadet-premium-plan/tools/plan-check.mjs
node ilham-ibadet-premium-plan/tools/plan-check.mjs --self-test
python3 ilham-ibadet-premium-plan/tools/plan-check.integration.py
```

İlk komut salt-okur. Kart sayısı, bağımlılık, scope, yetki, gerekli receipt'ler, artifact hash, ledger, üretilmiş görünüm ve yerel bağlantıları kontrol eder. `--self-test` bozuk durum örneklerinin reddedildiğini bellekte test eder. Python kontrolü geçici kopyada geçerli tamamlanma kaydı ve bozulmuş kanıt senaryolarını test eder; üretim uygulamasını çalıştırmaz. İçeriğin bilimsel/dinî doğruluğunu veya ekran kalitesini otomatik kanıtlayamaz.

State/REQ güncellendikten sonra pano üretimi:

```sh
node ilham-ibadet-premium-plan/tools/plan-check.mjs --render
```

## Şu an ne hazır, ne bekliyor?

Hazır: ayrıntılı plan ve ajan takip altyapısı. Bekleyen: ekran prototiplerinin üretilmesi, üretim kartları, yeni içerik incelemesi, gerçek görsel/cihaz kabulü ve yayın. Önceki turdaki **95/95 bölüm testi ve shell PASS** başlangıç kanıtıdır; bu planın yeni özelliklerinin test sonucu değildir.

Kaynak baseline: `e794e7bcc637b2431dcfae29f645ef1b02a2b51c`, `main`. Tüm yeni dosyalar bu klasörde; üretim kodu, kişisel veri ve eski program durumları değişmedi. Geçerli kullanıcı yetkisi olmadan hiçbir kart otomatik başlatılmaz; verilmiş yetki de tekrar sorulmaz.
