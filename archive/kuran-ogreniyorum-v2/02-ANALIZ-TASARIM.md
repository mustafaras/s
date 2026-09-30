# 02 — Analiz: Tasarım denetimi (Apple HIG uyumu)

Kaynak: `app/kao.css` (93 satır, ~260 kural) + `quranLearn.js` markup'ı.
Ölçüt: Apple Human Interface Guidelines (Layout, Typography, Color, Materials,
Navigation, Modality, Buttons, Toggles, Progress Indicators, Onboarding) ve
repodaki bağlayıcı [`docs/apple-design/IOS27-TASARIM-PLANI.md`](../docs/apple-design/IOS27-TASARIM-PLANI.md)
(AD-38: içerik katmanında cam yok; semantik token; ≥44 pt hedef).

## 1. Ölçülen göstergeler

| Gösterge | Değer | Apple beklentisi | Durum |
|---|---|---|---|
| Farklı `font-weight` değeri | **9** (600, 700, 750, 760, 780, 800, 850, 900, 950) | 3–4 anlamlı ağırlık (Regular 400, Medium 500, Semibold 600, Bold 700) | ❌ |
| ≥800 ağırlıklı kural | **40** / 52 | Gövde metni Regular; vurgu Semibold | ❌ |
| `text-transform:uppercase` + harf aralığı | 4 yerde (eyebrow, kicker, header p) | iOS'ta büyük harfli, harf aralıklı etiket yalnız grouped list üstbilgisinde, küçük ve soluk | ⚠️ |
| Serif başlık (`Iowan Old Style`) | 3 yerde (hub, header h1, kapsam sayısı) | Sistem fontu (SF Pro); serif yalnız içerik (okuma) bağlamında | ❌ |
| Dekoratif katman (hub kartı) | 5: `::before` halka, `::after` ışıma, `.spine`, `.frame`, `.ornament` ✦ | "Deference": içerik öne, süs yok | ❌ |
| Dekoratif katman (dialog) | 4: arka plan ızgara deseni, iç çerçeve, başlık altı eşkenar dörtgen, rozet | Sheet: düz zemin + grabber | ❌ |
| Birincil düğme sayısı (ana ekran) | 1 dolgulu + **8 metin bağlantısı** alt alta | Ekran başına 1 belirgin eylem; ikincil gezinme liste satırlarıyla | ❌ |
| Geri düğmesi yerleşimi | Sağ üstte "Geri" metni | Sol üstte `‹` chevron + önceki ekran adı | ❌ |
| Açık/kapalı kontroller | Metin düğmesi ("…: açık") | `role="switch"` iOS anahtarı | ❌ |
| Başlık | Her ekranda aynı H1 | Her ekranın kendi başlığı (large title → inline) | ❌ |

## 2. Bulgular (bileşen bileşen)

### 2.1 Hub kartı (`.kao-hub-card`)
- **T-01** 236 px min-yükseklik, 24 px köşe + 7 px iç çerçeve + sol "sırt" şeridi + halka + ışıma + ✦ süsü. Apple kart dili: tek yüzey, tek köşe yarıçapı, gölge yerine hafif ayrım.
- **T-02** Başlık tekrarı: küçük kicker "KUR'AN ARAPÇASI" + kalın başlık "Kur'an Arapçası Öğreniyorum".
- **T-03** Durum rozeti, açıklama, isteğe bağlı 3 bilgi satırı, 4 noktalı yol, alt çizgi + CTA hapı: **7 bilgi bloğu**. HIG "widget" mantığı: bir bakışta 1 bilgi + 1 eylem.
- **T-04** `:hover` ile `translateY(-3px)` + büyük gölge: dokunmatik öncelikli iOS'ta hover kaldırma efekti anlamsız; basınç geri bildirimi `scale(.98)` yeterli.
- **T-05** Yol noktaları (`kao-hub-path`) ilerlemeyi göstermiyor (01 Y-01). Apple'da ilerleme göstergesi ya gerçek veri taşır ya hiç yoktur.

### 2.2 Modal kabuğu (`.kao-overlay` / `.kao-dialog` / `.kao-header`)
- **T-06** Tam ekran dialog, sheet gibi davranmıyor: grabber yok, büyük başlık yok, ekran içi gezinme yığını (stack) yok. iOS'ta uzun akışlı modül = **tam ekran modal + NavigationStack**: sol üstte geri/`Kapat`, ortada inline başlık, altta içerik.
- **T-07** Başlıkta 44 px mühür ikonu + iki satır (üst etiket + serif H1) + sağda yuvarlak X; başlık alanı ~90 px. HIG: navigation bar 44 pt + large title; ikon yok.
- **T-08** Arka plan `::before` ızgara deseni (%34 opaklık) metin zemini düzensiz; AD-38'e göre içerik katmanı opak ve düz olmalı.
- **T-09** Başlık altındaki döndürülmüş kare (`.kao-header::after`) ve iç çerçeve (`.kao-dialog-frame`) salt süs.

### 2.3 Ana ekran bölümleri
- **T-10** Beş bölümün tamamı aynı "kart" (22 px köşe, kenarlık, gölge): görsel hiyerarşi yok. iOS'ta birincil içerik (Bugün) öne çıkar, ikincil gezinme **inset grouped list** olur.
- **T-11** Kapsam sayısı `calc(var(--f-large) + 6px)` serif, `line-height:.88`, altında gölgeli degrade çubuk. Apple Fitness/Health dili: SF Rounded büyük rakam + sade halka/çubuk.
- **T-12** `kao-link-button` metin bağlantıları sola yaslı, ikonsuz, ayırıcısız; tıklanabilir oldukları yalnız renkle anlaşılıyor. HIG: liste satırı = ikon + başlık + chevron.
- **T-13** `.kao-time-chip` ve `.kao-eyebrow` her bölümde; bilgi yoğunluğu yüksek, beyaz alan az.

### 2.4 Oturum (görev) ekranı
- **T-14** İlerleme "7 / 14" metni, çubuk yok. Apple dili: üstte ince doğrusal çubuk + kapat düğmesi.
- **T-15** Seçim sonrası şık durumu hiç işaretlenmiyor (04 §4'teki "renk + simge + metin" kuralı yazılmış ama uygulanmamış).
- **T-16** Geri bildirim, ortada küçük bir `aria-live` metni; iOS dilinde cevap sonrası alt panel (✓ yeşil / düzeltme turuncusu) + tam genişlikte "Devam".
- **T-17** Ses düğmesindeki "basılı tut = doğal hız" (350 ms) gizli jesti keşfedilemez; HIG gizli jestlere birincil işlev yüklememeyi önerir.

### 2.5 Üniteler, kelime, okuyucu
- **T-18** Ünite kartı 3 sütunlu grid, küçük ilerleme çubuğu; tamamlandı işareti/halka yok. "Seviye" kutuları buton görünümlü ama etkisiz (01 Y-09).
- **T-19** Kelime kartında Arapça boyutu iyi; ama "Katman 1 / 3" sayfalaması yerine iOS'ta tek kaydırılabilir detay sayfası + bölüm başlıkları beklenir.
- **T-20** Okuyucuda her kelime ayrı kenarlıklı kutu (min 72×68 px): mushaf akışı parçalanıyor; okuma deneyimi yerine "düğme ızgarası".
- **T-21** Sûre seçici yatay kaydırmalı hap listesi (20 öğe); seçili sûre görünür alanda olmayabilir.

### 2.6 Ayarlar
- **T-22** 8 bölüm, metin düğmeleri, paragraf açıklamalar; iOS Settings kalıbı: inset grouped list, sağda switch/değer, altında soluk footer notu.
- **T-23** Kaynaklar ve lisanslar Ayarlar'ın en altında uzun liste; iOS'ta ayrı "Hakkında ve kaynaklar" alt sayfası.

### 2.7 Erişilebilirlik ve tema
- **T-24** Renk: `--quran-gold` ile yazılmış küçük punto üstbilgi metinleri açık temada kontrast riski taşır (ölçüm gerekli; `kao-verify-contrast.mjs` yalnız belirli çiftleri ölçüyor).
- **T-25** Dynamic Type: `--f-*` tokenları kullanılıyor ✅; ancak sabit px'li bileşen yükseklikleri (236, 76, 72×68) büyük metinde taşma riski yaratıyor.
- **T-26** Reduced motion bloğu var ✅; ama `kao-audio-pending{opacity:0}` içeriği sesle açığa çıkarıyor. Ses başarısız olursa 150 ms'lik zamanlayıcıya bağlı kalıyor; animasyonsuz modda da içerik gizli başlıyor.

## 3. Olumlu bulgular (korunacak)
- `--f-*` Dynamic Type ölçeği, `--dur-*` hareket tokenları, `--quran*` açık/koyu çiftleri.
- Arapça font yığını, `lang/dir`, satır aralığı ve kelime boşluğu tercihleri, hareke renklendirme.
- ≥44 px dokunma hedefleri, modal klavye sözleşmesi, odak halkası, `aria-live`.
- Arapça ile Latin okunuşun dikey yığın hâlinde birlikte verilmesi (`kao-arabic-stack`).

## 4. Tasarım kök nedeni
KAO görsel dili "el yazması / süslü mushaf" metaforuyla kurulmuş: çerçeveler,
rozetler, serif, ağır yazı. Bu metafor **içerikte** (Arapça metnin sunumu)
değerlidir; **arayüz kabuğunda** ise gürültüdür. Apple yaklaşımı tersidir:
kabuk görünmez ve sistemseldir; saygı ve güzellik içeriğin kendisine
(Arapça tipografi, boşluk, ses) bırakılır. Yeni sistem bu ayrımı yapar (06).
