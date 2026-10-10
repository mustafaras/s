# K3P · Öğrenme akışı: kullanıcı akışta kolayca kalabilmeli

**İstek (2026-10-10):** Kullanıcı öğrenme akışında kolayca kalabilmeli. Bu hem pedagojik olarak hem
tasarımla sağlanmalı.

Belgenin yapısı:

- §1: Bugünkü akışın ölçümü
- §2: Akışın bilimsel koşulları
- §3: Yeni ders mimarisi
- §4: Uyarlanır zorluk
- §5: Tasarım kuralları
- §6: Ölçülebilir hedefler
- §7: Hipotezler

İlgili kartlar [KARTLAR.md](KARTLAR.md) içinde, "Dalga A" başlığındadır.

**Ölçüm aracı:** `node kao3-premium/araclar/akis-olc.cjs [dersId]`. Salt-okurdur, ağa çıkmaz.

---

## 1. Bugünkü akışın ölçümü

Koşullar: headless ortam, yerleşik kullanıcı, ders u01.02.

```text
G×20  [goal:38] [intro:61] [intro:59] [intro:59] [intro:43] [concept:68]  G×10  [apply:99]
└ 20 tekrar ┘ └──────── 6 ara ekran art arda · 328 sözcük, sıfır soru ────────┘
```

Okuma anahtarı: `G` bir görevdir (soru). `[tür:n]` görev dışı bir ara ekrandır; `n` o ekrandaki
sözcük sayısıdır.

| # | Bulgu | Ölçüm | Akışı neden bozar |
| --- | --- | --- | --- |
| A-1 | **Edilgin blok:** Pratikten önce 6 ara ekran art arda geliyor. | 328 sözcük ve 6 "Devam" basışı; arada hiç hatırlama sorusu yok | Uzun okuma dikkati düşürür. Yeni kelime tanıştırıldığı anda sınanmazsa ilk kodlama zayıf kalır (Karpicke ve Roediger 2008). |
| A-2 | **Yenilik geç geliyor:** Dersin ilk 20 sorusu eski kelimelerin tekrarı. | Dersin hedefi ancak 21. dokunuşta görünüyor | Açık hedef akışın ilk koşuludur (Csikszentmihalyi 1990). Kullanıcı ne öğreneceğini görmeden çalışıyor. |
| A-3 | **Zorluk uyum sağlamıyor.** | Art arda 4 yanlıştan sonra da 4 şık, aynı tür | Zorlanma–beceri dengesi bozulur, kaygı başlar. |
| A-4 | **Bilgi taşımayan dokunuşlar** | Derste 30 "Devam" (toplam 69 dokunuşun 30'u) | Ritim her soruda kesilir (K-C ile çözülüyor). |
| A-5 | **Devam ipucu yok.** Veri korunuyor: devam noktası `path.lessons[id].resume` alanına yazılıyor; yeniden yüklemeden sonra çözülmüş kartlar tekrar sorulmuyor (0/8). | Yeniden yüklemeden sonra Bugün ekranı "Başla" diyor, ilerleme çubuğu 1/20'den başlıyor | Kullanıcı ilerlemesini kaybetmiş sanır. Görünür ilerleme devam etme isteğini artırır (verilmiş ilerleme etkisi, Nunes ve Drèze 2006). |
| A-6 | **Dış bölünme (koddan doğrulandı).** Ortak `toast()` öğesi `z-index:10000` ile açılıyor, KAO modalı `z-index:380`'de ([helpers.js:77](../app/core/helpers.js#L77), [kao.css:8](../app/kao.css#L8)). Toast `bottom:96px` konumunda, yani şıkların üstüne düşüyor. Kaynakları: 30 sn'lik `pollRemote`, `ambienceRefresh` ve hatırlatıcı zamanlayıcıları (`app.js` içinde 10 `setInterval`). | Ders sırasında modül dışından gelen toast, şık bölgesini kapatabilir. Ne sıklıkla olduğu cihazda ölçülecek. | Bölünmeden sonra göreve dönmenin bir bedeli var (Mark, Gudith ve Klocke 2008). |
| A-7 | **Yeniden kurulum (koddan doğrulandı).** Her `render()` çağrısında `mount` overlay'i **silip yeniden ekliyor** ([app.js:4986](../app.js#L4986) ve `registerQuranLearnSurface` içindeki `mount`). | Bir derste 7 aşama geçişinin 7'si tam render tetikliyor (görevler yerinde boyanıyor: 30 görevde 2 render). Her yeniden eklemede `seyFade` ve `sey-sheet-in` animasyonları yeniden başlıyor. Arka plan render'ları da aynı şeyi yapıyor; kaydırma konumu ve odak kayboluyor. | Sayfa her adımda yeniden açılıyormuş gibi görünür, odak kaybolur. Bu, ritmi ve premium hissi kıran en görünür etken. Ekrandaki görünümü görsel QA'da doğrulanacak. |
| ✓ | **Giriş zaten kolay** | Hub'dan ilk soruya 2 dokunuş | Bu korunacak. |

## 2. Akışın koşulları ve karşılıkları

Csikszentmihalyi'nin (1990) akış koşulları ve her birinin bu uygulamadaki karşılığı:

| Koşul | Uygulamadaki karşılığı | Kanıt |
| --- | --- | --- |
| **Açık ve yakın hedef** | Ders hedef âyetle açılır. Ekranda hep "bloğun 3/5'i" ve "âyete 2 kelime kaldı" görünür. | Ön düzenleyici (Ausubel 1960); hedef eğimi (Kivetz ve ark. 2006) |
| **Anında geri bildirim** | Dokunuşa 100 ms içinde görsel yanıt. Doğru cevapta sessiz akış, yanlış cevapta öğretim. | Pashler ve ark. 2005; Butler ve ark. 2008 |
| **Zorlanma ve becerinin dengesi** | Uyarlanır zorluk; hedef başarı bandı %80–90 (§4) | Wilson ve ark. 2019 ("%85 kuralı"); Vygotsky'nin yakınsak gelişim alanı |
| **Kontrol hissi** | Her an bırakılabilir, kalınan yerden dönülür, ilerleme görünür kalır | Öz-belirleme kuramı (Ryan ve Deci 2000) |
| **Dikkat dağıtıcının olmaması** | Odak kilidi: ders sırasında dış bildirimler ertelenir; ekranda tek kontrol ✕ | Mark ve ark. 2008 |
| **Düşük bilişsel yük** | Her ekranda tek karar; edilgin ekranda en çok 45 sözcük; görev türü blok içinde sabit kalır | Bilişsel yük kuramı (Sweller 1988); görev değiştirme maliyeti (Monsell 2003) |

**Bir uyarı:** "%85 kuralı" ikili sınıflandırma yapan öğrenme modelleri için matematiksel olarak
türetilmiştir. İnsan öğrenmesinde bir **sezgisel** kuraldır. Bu yüzden tek bir sayı yerine bir
bant (%80–90) olarak kullanılıyor ve H7 hipoteziyle ölçülecek.

## 3. Yeni ders mimarisi: "nefes" ritmi

```text
① Hedef        ② Isınma       ③ Tanış-Sına döngüsü             ④ Karışık pekiştirme      ⑤ Zirve
âyet (1 ekran) 3–5 kolay      [tanış → hemen sor] × yeni kelime  yeni + vadesi gelen         âyeti oku,
               tekrar         + örnekten kurala kavram (1 ekran) tekrarlar, uyarlanır zorluk yaldızlan
```

| Bölüm | Kural | Pedagojik gerekçe |
| --- | --- | --- |
| **① Hedef** | Tek ekran, en çok 25 sözcük. Âyet görünür; öğrenilecek kelimeler soluk altınla işaretli. | Ön düzenleyici: öğrenci neyi neden öğreneceğini baştan görür. |
| **② Isınma** | Vadesi gelmiş kartlardan kararlılığı (`s`) en yüksek 3–5 tanesi. Beklenen başarı yaklaşık %95. | Kolay başarılar ivme kazandırır ve kaygıyı düşürür. |
| **③ Tanış-Sına** | Her yeni kelime için: tanış ekranı (en çok 45 sözcük), **hemen ardından** 2 şıklı soru, sonra sıradaki kelime. Kavram örnekten kurala doğru verilir: örnek, tek cümlelik kural, hemen ardından bir soru. | Kodlamanın hemen ardından hatırlama yapılır. A-1'deki edilgin blok ortadan kalkar. |
| **④ Karışık** | Yeni ve vadesi gelmiş kartlar karışık sorulur; zorluk §4'e göre ayarlanır. Görev türü her soruda değil, 3–5 soruluk bloklar hâlinde değişir. | Karışık sıralama öğrenmeyi güçlendirir (Rohrer ve Taylor 2007); blok yapısı görev değiştirme maliyetini düşük tutar. |
| **⑤ Zirve** | Âyet sesle okunur, öğrenilen kelimeler yaldızlanır, ardından kısa bir özet. | Zirve-son kuralı (Kahneman 1993): deneyim, en güçlü anı ve sonuyla hatırlanır. |

**Zaman bütçesi:** Oturum kullanıcının seçtiği sürede kalır (5, 10 ya da 15 dk). Süreye sığmayan
vadeli kartlar ertesi güne kalır. Önce geri çağrılabilirliği (`R`) en düşük, yani unutulmaya en
yakın kartlar sorulur. FSRS küçük gecikmeleri tolere eder; uzayan oturum ise ertesi günün akışını
bozar.

**Veri:** Değişen yalnız ders planının **sırası**. Kart şeması, FSRS ve `migrate()` aynı kalır.

## 4. Uyarlanır zorluk: akış bandını korumak

Son 8 görevin kayan başarı oranı `p` olarak izlenir. Bu oran yalnız `ui` içinde tutulur.

| Durum | Eşik | Motor ne yapar | Kullanıcı ne görür |
| --- | --- | --- | --- |
| **Kaygı** | p < %70 ya da art arda 2 yanlış | Şık sayısı 4→3→2'ye iner, ses otomatik çalar, araya bilinen bir kelime girer. Art arda 3 yanlışta kelimeyle yeniden tanıştırılır. | "Birlikte bakalım" tonu |
| **Akış** | %70–92 | Plana göre devam eder | — |
| **Sıkılma** | p > %92 (en az 8 görev sonra) | Merdivende bir basamak çıkar, harekeler gizlenir, şık sayısı en yükseğe döner | İnce altın seri çizgisi |

**Notlama adaleti:** Kolaylaştırılmış bir soruya verilen doğru cevap, FSRS'te "Good" yerine
"Hard" (3 yerine 2) notunu alır. Böylece kolaylaştırma kartın kararlılığını yapay olarak şişirmez.
`kaoGrade` ([quranLearn.js:205](../app/core/quranLearn.js#L205)) bugün yalnız yanıt süresine ve
tekrar sayısına bakıyor; buna şık sayısı eklenir.

**Neden kalıcı değil:** Uzun vadeli zorluğu FSRS zaten yönetiyor. Uyarlanır zorluk yalnız oturum
içinde çalışır; böylece iki sistem çakışmaz.

## 5. Tasarım kuralları

| # | Kural | Ölçüt |
| --- | --- | --- |
| D-1 | **Odak modu:** Ders sırasında yalnız ✕ ve ilerleme çubuğu görünür (bugünkü davranış, korunur). | Ders ekranlarında gezinme kontrolü yok |
| D-2 | **Bölümlü ilerleme:** Çubuk 5 bölümlüdür (①…⑤); etkin bölüm kendi içinde dolar. | Kullanıcı her an nerede olduğunu ve ne kaldığını görür |
| D-3 | **Sabit eylem bölgesi:** Birincil eylem ve şıklar başparmağın eriştiği alt yarıda, hep aynı yerde durur. | Ardışık ekranlarda birincil eylemin konumu 8 px'ten fazla kaymaz |
| D-4 | **Edilgin ekran sınırı:** Ekran başına en çok 45 sözcük; art arda en çok 1 edilgin ekran (zirve âyeti hariç). | `akis-olc` ölçümünde art arda iki ara ekran yok |
| D-5 | **Hızlı geçiş:** Bir sorudan sonrakine geçiş en çok 240 ms; yeni soru yatay kayarak gelir. | Hareket grameri |
| D-6 | **Hata dostu dil:** Yanlışta kırmızı renk, "yanlış!" sözcüğü ve ceza sesi yok; sıcak turuncu kullanılır. | Metin taraması 0 sonuç verir |
| D-7 | **Devam ipucu:** Yarım kalan ders için birincil eylem "Kaldığın yerden · 8/20" olur; çubuk dolu başlar. | Yeniden yükleme testi |
| D-0 | **Yerinde güncelleme:** Overlay zaten varsa `mount`, yalnız `#sey-ov-body` içeriğini değiştirir. Açılış animasyonu yalnız `kaoOpen` anında çalışır. Kaydırma ve odak korunur. | 7 aşama geçişinde overlay düğümü aynı kalıyor (DOM kimliği testi); animasyon 1 kez çalışıyor |
| D-8 | **Odak kilidi:** `ui.kaoLesson` etkinken başka modüllerin toast ve hatırlatıcıları ertelenir; ders bitince gösterilir. Kriz ve güvenlik bildirimleri istisnadır. | Ders sırasında KAO dışı DOM eklemesi 0 |
| D-9 | **Bitiş kapısı:** Ders sonunda birincil eylem "Bugün yeter", ikincil eylem "5 dakika daha". Oturum kendiliğinden uzamaz. | Kullanıcının kontrolü korunur |

## 6. Ölçülebilir hedefler

| Ölçü | Bugün | Hedef | Araç |
| --- | --- | --- | --- |
| Art arda en uzun edilgin ekran dizisi | 6 | ≤ 1 | `akis-olc` |
| Edilgin bir ekrandaki en çok sözcük (zirve hariç) | 68 | ≤ 45 | `akis-olc` |
| İlk yeni içeriğe kadar dokunuş | 21 | ≤ 7 | `akis-olc` |
| Doğru cevaptan sonra "Devam" basışı | 30 | 0 | `dokunus-olc` |
| 2 yanlıştan sonra soru kolaylaşıyor mu | Hayır | Evet | `akis-olc` |
| Yeniden yüklemeden sonra devam ipucu | Yok | "Kaldığın yerden · n/N" | `akis-olc` |
| Oturum içi başarı bandı (cihazda) | Ölçülmedi | Oturumların ≥ %70'inde %80–90 | `deney-rapor` |
| Açılıştan ilk göreve dokunuş | 2 | ≤ 2 | `akis-olc` |
| Ders başına overlay yeniden kurulumu | 7 (+ arka plan render'ları) | 0 (yalnız açılışta) | Harness `calls.mount` sayımı |
| Ders sırasında KAO üstüne binen toast | Mümkün (z 10000 > 380) | 0 (ertelenir) | Headless DOM sayımı |

## 7. Hipotezler (önceden kayıtlı)

| # | Hipotez | Ölçü | Hedef |
| --- | --- | --- | --- |
| H7 | Uyarlanır zorluk, başarıyı akış bandında tutar | Günlük `answered/correct` ve kayan pencere | Oturumların ≥ %70'inde %80–90 |
| H8 | Nefes ritmi, dersi yarıda bırakmayı azaltır | `resume` alanı dolu, `doneAt` alanı boş derslerin oranı; 30 gün önce ve sonra | Azalır |
| H9 | Tanış-Sına döngüsü, ilk tekrardaki başarıyı artırır | Yeni kelimenin ertesi günkü ilk tekrarındaki doğruluk | Artar |

## Kaynaklar

- Csikszentmihalyi (1990), *Flow*
- Wilson, Shenhav, Straccia ve Cohen (2019), *Nature Communications* 10
- Karpicke ve Roediger (2008), *Science* 319
- Nunes ve Drèze (2006), *Journal of Consumer Research* 32
- Mark, Gudith ve Klocke (2008), *CHI*
- Sweller (1988), *Cognitive Science* 12
- Monsell (2003), *Trends in Cognitive Sciences* 7
- Rohrer ve Taylor (2007), *Instructional Science* 35
- Vygotsky (1978), *Mind in Society*
