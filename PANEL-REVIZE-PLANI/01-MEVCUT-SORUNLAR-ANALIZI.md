# PANEL-REVIZE: Mevcut Sorunlar Analizi

> Revizyon: ÆON Observer Dashboard — Premium, pro ve veri-kaybetmeyen yeni yüzey.
> Mevcut referans: [panel.html](panel.html), [panel.js](panel.js), [panel.css](panel.css), [panelCoverageManifest.js](panelCoverageManifest.js)

## 1. Genel durum

Mevcut panel, Şeyma uygulamasının **tüm veri katmanını** tek bir sayfada göstermeye çalışan, fonksiyonel ama görsel/kavramsal olarak aşırı yüklenmiş bir gözlem arayüzüdür. Temel hedefi — kullanıcı tarafından girilen **hiçbir veriyi kaçırmamak** — doğru bir hedeftir; fakat bu hedef, **"her şeyi aynı anda görünür kıl"** şeklinde uygulanmıştır. Sonuç: gözlemci için bilgi yoğunluğu yüksek, premium hissi zayıf, odaklanması zor bir ekran.

Bu doküman, mevcut paneldeki sorunları **UX, mimari, veri, estetik ve güven** eksenlerinde tespit eder. Her tespit somut kod konumuyla desteklenmiştir.

---

## 2. Bilişsel yük ve UX karmaşası

### 2.1 Tek sayfada çok fazla kavramsal katman

[panel.js](panel.js#L2807-L3900+) içindeki `render()` fonksiyonu, aşağıdaki katmanları **art arda** üretir:

1. **Komuta merkezi topbar** — marka, durum rozeti, yoğunluk seçimi, yenile/çıkış.
2. **Senkronizasyon şeridi** — `syncRibbonHTMLP()` ile revision, SHA, kaynak/visible, polling durumu.
3. **Kapsama / projection şeridi** — `coverageRibbonHTMLP()` ile redaction, fallback, coverage cell'leri.
4. **4 hero kartı** — Ruh, Beden, Süreklilik, Senkron.
5. **Risk şeridi** — `commandRiskHTMLP()` ile canonical durum ve projection uyarıları.
6. **Zaman aralığı + tarih seçici + jump-nav**
7. **Bento grid:** core strip, root modules, provenance, module atlas, event log, 5 section header, ~15 KPI kartı, sohbet kartları, hava, harita, seçili gün detayı, mod dağılımı, dönem özeti, SOS, notlar, kütüphane, izleme, dinleme, alıntılar, vücut/tahlil.

Bu, tek bir ekranda **60+ bileşen** demektir. Gözlemcinin dikkati dağılır; kritik sinyaller (örneğin "SOS arttı", "uyku düştü") görsel gürültüde kaybolur.

### 2.2 Birden fazla "durum rozeti" birbiriyle çakışıyor

Topbar'da `canonicalStatusP()` rozeti ([panel.js](panel.js#L2894)), sync ribbon'da polling durumu, coverage ribbon'da projection durumu, hero kartlarda Senkron değeri, risk şeridinde yine canonical uyarılar yer alır. Kullanıcı aynı bilgiyi farklı kavramlarla (canonical, revision, ETag, coverage, projection, source vs. visible) üç farklı yerde görür.

Bu, **sistem sağlığı bilgisi** ile **kullanıcı durum bilgisi**nin aynı görsel hiyerarşide sunulmasıdır. Gözlemci, Şeyma'nın bugünkü ruh halini mi yoksa senkronizasyonun teknik durumunu mu takip etmeli önce anlayamaz.

### 2.3 Jump-nav ve section header'lar yetersiz kalıyor

[panel.js](panel.js#L2945-L2954) ve [panel.css](panel.css#L266-L293) ile tanımlanan 5 bölüm (Bugün Özeti, Ruh Hali & Enerji, Hareket & Konum, Vücut & Tahlil, İçgörü & Risk, Arşivler) kavramsal olarak doğru, ama uygulamada kendi içlerinde çok fazla alt-kart barındırır. Bölüm atlama şeridi, kullanıcıyı bölüm başlığına götürür; fakat başlık hemen altındaki 800px'lik kart yığını arasında kaybolur.

### 2.4 "Audit" yoğunluk modu UX değil, teknik mod

[panel.js](panel.js#L2923-L2925) ve [panel.css](panel.css) üzerindeki yoğunluk seçici, "Hızlı / Standart / Audit" sunar. Fakat paneldeki çoğu kart zaten varsayılan olarak açıktır; "Audit" sadece daha fazla metrik gösterir. Bu bir **görünüm modu** yerine **geliştirici modu** gibi davranır.

---

## 3. Mimari ve kod kirliliği

### 3.1 Monolitik `render()` fonksiyonu

[panel.js](panel.js#L2807-L3900+) içindeki `render()` fonksiyonu, tek bir büyük HTML string'i üretir. İçinde:

- KPI kartı üreten yerel `kpi()` helper'ı.
- Seçili gün detayının özet/detay bölümlemesi (slice ile string manipülasyonu).
- Kütüphane/izleme/dinleme/alıntılar için ~300 satırlık inline modül.
- Her kartın kendi inline stilleri.

Bu yapı, yeni kart eklemeyi riskli hale getirir; çünkü değişikliklerin etki alanı tüm sayfayı kapsar. Ayrıca render performansı her veri değişikliğinde tüm DOM'u yeniden yazar.

### 3.2 Inline stil enflasyonu

Kartların çoğunda `style="..."` ile yazılmış yerel düzenlemeler vardır. Örneğin [panel.js](panel.js#L3006-L3008) konum geçmişi kartı, [panel.js](panel.js#L3033-L3035) konum kayıtları kartı gibi. CSS variables sistemi ([panel.css](panel.css#L1)) var olmasına rağmen, doğrudan inline stiller tematik tutarlılığı bozar ve premium hissi zayıflatır.

### 3.3 Birbirine benzeyen ama çoğaltılmış yardımcı fonksiyonlar

`kpi()`, `cardWrap()`, `syncRibbonHTMLP()`, `coverageRibbonHTMLP()`, `eventLogCardHTMLP()`, `d4ModuleAtlasHTMLP()` gibi fonksiyonlar birbirine benzer HTML üretim kalıpları kullanır ama ayrı ayrı tanımlanmıştır. Ortak bir kart framework'ü yoktur.

### 3.4 Komuta merkezi ile içerik ayrımı zayıf

Topbar komuta merkezi ([panel.js](panel.js#L2907-L2929)) hem marka/durum bilgisi hem de eylem düğmeleri barındırır. Fakat bu eylemler (yenile, çıkış) dışında panelde başka bir yerleşik navigasyon yoktur. Sekmeli arayüz isteniyorsa, bu topbar'dan ayrılmalıdır.

---

## 4. Veri gürültüsü ve odak kaybı

### 4.1 Seçili gün kartı aşırı geniş

[panel.js](panel.js#L3106-L3400+) aralığında üretilen "Seçili Gün" kartı, aşağıdaki her şeyi içerir:

- 7 adet mini istatistik (tik, mod, SOS, uyku, su, enerji, stres)
- 15 adet alışkanlık chip'i
- Tatil modu ve günlük ışığı chip'leri
- Öğün listesi + makro özet + hedefler
- Semptomlar, uyku detayı, uyku hazırlığı, yürüyüş, regl, namaz, kafein, kriz, tetik, yönetilmiş krizler
- Okuma / izleme / dinleme / öğrenme / zihin-beden / sağlık / oturum / Saygı / şükran / magnezyum
- Bir yıl önce nostalji
- Terapi odası kayıtları
- Günlük notu / Günlük Işığı

Bu, tek bir kartta **40+ veri satırı**dır. Gözlemci, o günün "en önemli üç sinyali"ni göremez; tüm girdiler aynı düzlemde sunulur.

### 4.2 Konum verisi çift yerde ve ham haliyle gösteriliyor

Aynı sayfada hem:

- **Canlı konum haritası** ([panel.js](panel.js#L3252-L3272))
- **Seçili günün movement.track segmentleri** ([panel.js](panel.js#L3273-L3332))
- **Ham konum kayıtları** ([panel.js](panel.js#L3333-L3372))

bulunur. GPS ham verileri, observer için "güvenli özet" yerine doğrudan listelenir; bu hem gizlilik riski taşır hem de okunabilirliği düşürür. (Not: `panelCoverageManifest.js` konum verilerini redacted olarak sınıflar; ama panel görselinde ham track/locationHistory ayrıntıları vardır.)

### 4.3 Arşiv kartları ana akışı kesiyor

Kütüphane, izleme arşivi, dinleme arşivi ve alıntılar ([panel.js](panel.js#L3634-L3890+)) oldukça büyük bloklardır. Bunlar günlük takip için ikincil verilerdir; fakat ana bento akışında tam genişlikte kartlar olarak yer alır.

### 4.4 KPI kartları aynı metriği tekrar ediyor

"SOS" hem hero'da, hem KPI'da, hem SOS yoğunluğu kartında, hem SOS geçmişi kartında gösterilir. "Uyku ortalaması" hem Beden hero'sunda, hem KPI'da, hem seçili gün detayında, hem dönem özeti kartında tekrarlanır. Bu, **güvenli redundancy** değil, **görsel tekrar**dır.

### 4.5 Trend chip'leri çok küçük ve yetersil

[panel.js](panel.js#L2837-L2845) ile üretilen `tc()` (trend-chip), KPI kartlarının sağ üst köşesinde 11.5px boyutundadır. Düşüş/artış yönünü gösterir ama nedenini, anlamını veya eşik değerini sunmaz.

---

## 5. Senkronizasyon ve teknik durum karmaşası

### 5.1 Çok sayıda teknik şerit

Panelde aynı anda:

- `syncRibbonHTMLP()` — revision, SHA, acceptedAt vs.
- `coverageRibbonHTMLP()` — coverage manifest, fallback, missing paths
- `commandRiskHTMLP()` — canonical conflict / anti-clobber / projection state
- `pollStatusP()` — ETag, 304, polling latency p50/p95
- `rootModulesCardHTMLP()` — eksik kök modüller
- `p4ProvenanceCardHTMLP()` — terapi redaction, profile progress, notification lifecycle, external fetch provenance
- `eventLogCardHTMLP()` — append-only event log

gibi teknik denetim kartları vardır. Bunlar panelin **üst kısmında** ve ana akışın içinde yer alır; gözlemciye "önce sistem sağlığını anla, sonra veriyi oku" mesajı verir.

### 5.2 "Canonical" terminolojisi kullanıcı dostu değil

[panel.js](panel.js#L1124+) `canonicalStatusP()` fonksiyonu şu durumları üretir:

- `Canonical conflict`
- `Uzak kabul bekleniyor; veri kaybı riskinde işlem durdu.`
- `Canonical kabul edildi`

Bu ifadeler, Şeyma'nın duygusal durumuyla ilgilenen bir gözlemci için anlaşılması zor teknik durumlardır. Aynı bilgi, çok daha sade bir "Senkron durum" rozetiyle verilebilir.

### 5.3 Coverage ribbon fallback mesajı endişe uyandırıyor

`projectionStatusP()` / `coverageRibbonHTMLP()` içindeki mesajlar — örneğin "Eski latest.json güvenli redaction fallback olarak kullanılıyor" — doğru teknik açıklamalardır; fakat normal koşullarda panelde görülmemelidirler. Sürekli görünür olmaları, gözlemciye sistem "zaten hasarlı"ymış hissiyatı verir.

---

## 6. Estetik ve premium hissi eksiklikleri

### 6.1 Çok fazla aksan rengi

[panel.css](panel.css#L22-L45) içinde tanımlı renkler: gold, green, amber, red, purple, journal, vacation, soul, faith, zikr, quranp, kandil, teal, pink. Her modül kendi rengini kullanır. Sonuç: panel bir gökkuşağına dönüşür; premium minimalizm yerine özellik listesi hissi verir.

### 6.2 Kartlar arası hiyerarşi zayıf

Tüm kartlar aynı `var(--surface-card)` arka planı, benzer `var(--r)` border-radius ve benzer gölgedir. Hero kartlar, detay kartlar ve arşiv kartları arasında yüzey hiyerarşisi yoktur. Her şey aynı "önem düzeyinde" görünür.

### 6.3 Tipografi skalası daralıyor

[panel.css](panel.css#L46-L52) tipografi 38px'den 11.5px'ye kadar iner. KPI sayıları büyüktür ama etiketler, chip'ler ve footnote metinleri çok küçüktür. Mobil daralmada ([panel.css](panel.css#L376-L404)) fontlar küçülür; bu durum premium hissi zayıflatır.

### 6.4 Boş durumlar vurgulu değil

"Konum verisi bekleniyor", "Bu güne öğün kaydı yok", "Henüz zikir notu yok" gibi boş durumlar her kartta ayrı ayrı tekrarlanır. Bunlar yerine, eksik verinin **hangi modülde** olduğunu gösteren sade bir "veri durumu" görünümü kullanılabilir.

---

## 7. Mobil ve erişilebilirlik sorunları

### 7.1 Masaüstü 12 kolonlu bento, mobilde tek sütuna düşüyor

[panel.css](panel.css#L310-L322) bento grid'i 12 kolonlu masaüstü düzeni sunar; [panel.css](panel.css#L388-L398) mobilde tüm kartlar `grid-column:span 12` olur. Fakat kart içeriği masaüstü için tasarlanmış düzenler (örneğin `grid-template-columns:repeat(4,1fr)` dstats, tablolar, harita + detay yan yana) mobilde sıkışır.

### 7.2 Topbar mobilde çok satırlı büyüyor

[panel.css](panel.css#L376-L385) mobilde topbar dikey esner; bu değerli ekran alanını kaybettirir. Marka + durum + yoğunluk + butonlar aynı satırda olmamalıdır.

### 7.3 Focus/keyboard navigasyonu zayıf

`jumpnav`, `card-exp-head`, `seg` gibi elementlerde ARIA var ama sayfa içi sekme yoktur. Kartların çoğu `onclick` ile inline bağlanmıştır. Yeni tasarımda klavye ve ekran okuyucu dostu bir tab/sekmeli yapı kurulmalıdır.

---

## 8. Veri kaçırma riskleri (mevcut tasarımın zayıf noktaları)

İronik olarak, "hiçbir veriyi kaçırmak" hedefi, mevcut tasarımda **bazı kritik verilerin gözden kaçmasına** neden olabilir:

- **SOS yoğunlaşması:** `curSos` değeri 4 farklı yerde gösterilir ama "son 7 günde SOS artışı" şeklinde bir **sinyal kartı** yoktur.
- **Uyku düşüş trendi:** Uyku ortalaması gösterilir ama 3 gündür 6 saatin altına düşmüşse buna dair öne çıkan uyarı yoktur.
- **Eksik gün sayısı:** `missingInRange` dönem özeti kartının alt satırında küçük kalır.
- **İlaç aşırı kullanımı:** `dzMohDays>=10` kontrolü seçili gün detayında gösterilir ama ana ekranda öne çıkmaz.
- **Terapi odası paylaşımları:** `th.share.sentAt` yalnızca seçili gün detayında görünür; gözlemcinin dikkatini çekmesi gereken bir etkinliktir.
- **Event log:** Teknik bir kart olarak üst bölümde yer alır; fakat kullanıcı tarafından yapılan son güncellemelerin kronolojik özetini sunabilir.

---

## 9. Özet: Revizyon için öncelikli problemler

| # | Problem | Etki | Çözüm yönü |
|---|---------|------|------------|
| 1 | Tek sayfada 60+ kart/şerit | Bilişsel aşırı yük | Sekmeli/tab'lı ana navigasyon |
| 2 | `render()` monolitik ~3400+ satır | Bakım/ekleme riski | Modüler kart kütüphanesi |
| 3 | 4-5 teknik durum şeridi çakışması | Kullanıcı kafası karışıklığı | Tek, sade senkron durum rozeti |
| 4 | Seçili gün kartı 40+ veri satırı | Kritik sinyal kaybolur | Özet + detay ayrımı, öncelikli sinyaller |
| 5 | Konum/track/locationHistory ham gösterim | Gizlilik + okunabilirlik | Harita odaklı, özet konum akışı |
| 6 | Aynı metrikler tekrar tekrar | Görsel gürültü | Tek hakiki kaynak ilkesi |
| 7 | Çok fazla aksan rengi | Premium hissi zayıf | Kısıtlı, anlamlı renk paleti |
| 8 | Hero/KPI/arşiv arasında yüzey hiyerarşisi yok | Odak kaybı | Seviye bazlı yüzey sistematiği |
| 9 | Mobil topbar ve bento sıkışıklığı | Mobil kullanılabilirlik | Mobil öncelikli yeniden düzen |
| 10 | Boş durumlar her yerde tekrarlanıyor | Düzensiz his | Merkezi veri durumu dili |

---

## 10. Tespitlerden çıkan tasarım ilkeleri

Aşağıdaki ilkeler, revizyon planının temelini oluşturur; detayları [02-TASARIM-ILKELERI-VE-VIZYON.md](02-TASARIM-ILKELERI-VE-VIZYON.md) içindedir:

1. **Hiçbir veri kaybolmaz, ama her veri aynı anda görünmez.** Veri katmanları önceliklendirilir.
2. **Gözlemcinin ilk bakışta görmesi gerekenler ayrılır.** Anomali, trend, son aktivite ve temel yaşam sinyalleri öne çıkar.
3. **Teknik senkron durumu, kullanıcı durumundan ayır.** Sync/coverage/provenance bilgileri tek, sade bir "system status" alanında toplanır.
4. **Sekmeler ve alt-sekmeler ile ilerici açılım.** Gerektiğinde sayfalar ve katmanlar kullanılır.
5. **Mobil öncelikli, ama masaüstünde de genişlebilir.** Dar ekran tasarım kaynağıdır.
6. **Kısıtlı, anlamlı renk paleti.** Aksan renkleri durum ve modül anlamı taşır; her kart kendi rengini seçemez.
7. **Kart kütüphanesi ve tutarlı yüzey hiyerarşisi.** Hero, summary, detail, archive seviyeleri ayrılır.

---

Sonraki adım: [02-TASARIM-ILKELERI-VE-VIZYON.md](02-TASARIM-ILKELERI-VE-VIZYON.md)
