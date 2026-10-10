# K3P · Tasarım v2 — "Tezhip": anlamı yaldızlanan Mushaf

Bu belge v1'in yerini alır. v1 mevcut ekranları cilalıyordu. v2 deneyimin **merkezini** değiştirir.
Kararların gerekçeleri [KARARLAR.md](KARARLAR.md)'de, bulgular [ANALIZ.md](ANALIZ.md)'de, uygulama
sırası [KARTLAR.md](KARTLAR.md)'dedir.

## 0. Tez

Bugün uygulama bir **kelime kartı uygulaması**. İçinde bir de Kur'an var.

v2'de uygulama bir **Mushaf sayfası**. Kelime kartları o sayfayı aydınlatmanın aracıdır.

Kullanıcının asıl hedefi "524 kelime" değil; **namazda ve Mushaf'ta okuduğunu anlamak**. Bu yüzden
ilerlemenin birimi kelime sayısı olmaktan çıkar, **sayfada aydınlanan anlam** olur.

Görsel metafor Türk-İslâm kitap sanatından gelir: **tezhip**. Bilinen her kelime sayfada altınla
işlenir. Bu yalnız bir süs değil, gerçek ölçünün kendisidir: kapsam (bilinen token oranı) doğrudan
yaldız olarak görünür. Kavramsal kodlama (Paivio) ve anlamlı ilerleme aynı görselde birleşir.

## 1. İlkeler

| # | İlke | Dayanak | Somut sonuç |
| --- | --- | --- | --- |
| P1 | **Metin merkezde** | Ön düzenleyici (Ausubel 1960) | Her ders bir âyetle açılır ve kapanır |
| P2 | **Önce hatırla, sonra tanı** | Sınama etkisi, üretme etkisi, istenen güçlükler | Tanıma payı ≤ %60, 4 basamaklı merdiven |
| P3 | **Geri bildirim hataya** | Pashler 2005, Butler 2008, hiperdüzeltme | Üç kollu geri bildirim (K-C) |
| P4 | **Desteği zamanla çek** | İskele (Wood, Bruner ve Ross 1976) | Okunuş s ≥ 21'de, hareke s ≥ 30'da solar |
| P5 | **Tek karar** | Hick–Hyman yasası | Her ekranda tek birincil eylem; Bugün ekranında ≤ 5 seçim |
| P6 | **Zirve ve son** | Kahneman 1993 | Ders, anlaşılan âyetin sesli okunmasıyla biter |
| P7 | **Suçluluk yok** | Öz-belirleme kuramı | Esnek haftalık hedef, cezasız seri |
| P8 | **Doğruluk süsten önce** | Güven | Çift şık 0, okunuş hatası 0; bu ikisi her kartın kapısıdır |

## 2. İmza bileşen: Tezhip sayfası

```text
╭──────────────── Fâtiha ────────────────╮      ✦ altın   = bilinen (s ≥ 21)
│  ✦بِسْمِ  ✦ٱللَّهِ  ✦ٱلرَّحْمَـٰنِ  ✦ٱلرَّحِيمِ   │      ◌ yarım   = öğreniliyor
│  ✦ٱلْحَمْدُ  ✦لِلَّهِ  ◌رَبِّ  ٱلْعَـٰلَمِينَ         │        mürekkep = henüz yok
│  …                                       │
╰──── 7 âyet · %64 anlam · 3 kelime kaldı ──╯
```

- **Veri:** Yeni alan yok. Bilinen kelimeler `kaoKnownLemmaSet`'ten, kısa sûre ve namaz metinleri
  mevcut içerik modüllerinden gelir.
- **Biçim:** Satır içi `<span>` ve CSS ile yapılır. Yaldızın rengi temaya göre değişir:
  - **Açık tema:** Kelimenin rengi mürekkep olarak kalır. Arkasına altın tonlu bir zemin
    (`color-mix(--quran2 22%, transparent)`) ve altına 2 px altın çizgi gelir.
  - **Koyu tema:** Kelimenin rengi doğrudan `--quran2` olur.
  - **Neden böyle:** Altın, açık zeminde metin rengi olarak kullanılamaz. `#C9A227` parşömen
    üzerinde yaklaşık 2,2:1 kontrast verir; WCAG'ın istediği 4,5:1'in çok altında. Koyu temada
    `#E4C54A` yaklaşık 10:1 verir, sorun yoktur. Kenarlık SVG rumî motifi (opaklık ≤ .08) ve tek bir altın cetvel çizgisi.
  Görsel tek bir an kartında toplanır.
- **Etkileşim:** Kelimeye dokununca anlamı, sesi ve "neden altın" bilgisi açılır (mevcut okuyucu
  balonu). Yaldızsız kelimede bunun yerine "Bu kelimeyi öğren" görünür ve
  `App.kaoReader('add',…)` çağrılır.
- **Yer:** Bugün ekranının kahramanı, ders sonu anı ve İlerleme ekranı.
- **Erişilebilirlik:** Yaldız yalnız renkle anlatılmaz. Bilinen kelimenin altında ince altın bir
  çizgi de olur (`forced-colors` modunda `Highlight`). Ekran okuyucu için
  `aria-label="ٱلرَّحْمَـٰن, biliniyor"`.

## 3. Ekranlar

### 3.1 Bugün (K-F: ≤ 5 seçim)

```text
┌──────────────────────────────────┐
│ Tezhip sayfası (bugünün sûresi)   │  ← an kartı
│ "3 kelime sonra Fâtiha tamam"     │  ← hedef eğimi
│ [ Bugünün dersi · 6 dk ]          │  ← tek birincil eylem
├──────────────────────────────────┤
│ ◔ Bu hafta 4/5 gün   · Sûreler › │
│ Namazda ne diyorum › · Kütüphane ›│
└──────────────────────────────────┘
```

- **Kütüphane** bugünkü Keşfet listesini (gramer, kök aileleri, telaffuz, S0) tek bir alt sayfada
  toplar.
- **İlerleme ve Ayarlar** gezinme çubuğunda simge olarak durur.

### 3.2 Ders: üç perde

> **Güncelleme (akış):** Ders ritmi [AKIS.md](AKIS.md) §3'teki 5 bölümlük "nefes" ritmine göre uygulanır: Hedef → Isınma → Tanış-Sına → Karışık → Zirve. Aşağıdaki üç perde bu ritmin özetidir; "Çalışma" perdesi Isınma, Tanış-Sına ve Karışık bölümlerini kapsar. Uyarlanır zorluk ve odak kuralları AKIS.md §4–§5'tedir.

| Perde | İçerik | Dayanak |
| --- | --- | --- |
| **1. Hedef** (5 sn) | Bugünün âyeti mürekkep hâlinde, öğrenilecek kelimeler soluk altınla işaretli. "Bu dersin sonunda bu âyeti anlayacaksın." | Ön düzenleyici |
| **2. Çalışma** | Tanışma, kavram, merdiven görevleri, karışık tekrar. Seri çizgisi görünür, ilerleme çubuğu akışkan. | Sınama ve üretme etkisi, aralıklı tekrar |
| **3. Okuma** (zirve) | Aynı âyet tekrar gelir: ses başlar, kelimeler sırayla yaldızlanır, Türkçe anlam belirir. Ardından kısa özet: ilk kez yaldızlanan kelimeler, kapsamda +%x. | Zirve-son kuralı, zamansal yakınlık |

### 3.3 Görev

- Arapça merkezde, `--kao-ar-hero` boyutunda (K-B yazı tipiyle).
- Okunuş, kartın kararlılık basamağına göre görünür, soluk ya da gizlidir.
- Ses için iki görünür düğme: ◖ yavaş, ◗ doğal. Gizli basılı tutma kalkar.
- Şıklar 2×2 ızgarada durur. Arapça şıklar yazı tipiyle sağdan sola; dokunma hedefi ≥ 56 px (Fitts).

### 3.4 Okuyucu

- Dinlerken çalan kelime altın halkayla vurgulanır (`kaoReaderPlayWords` sırası). Bu, sesle yazının
  zamansal yakınlığını sağlar.
- Kelimeye dokununca balon açılır: anlam, kök, ses ve "Kartlarıma ekle".

### 3.5 İlerleme

- Üstte üç ölçü:
  1. Kur'an kapsamı (yüzde)
  2. Yaldızlı sûreler (×/20)
  3. Haftalık hedef (gün/5)
- Altında tüm kısa sûrelerin Tezhip küçük resimleri.
- FSRS kalibrasyonu ve gece karşılaştırması "Ayrıntılar" altına iner; veri yoksa görünmez.

## 4. Hatırlama merdiveni (K-I)

Basamak, kartın FSRS kararlılığı `s` ve son unutma bilgisinden seçilir. Yeni veri alanı yok.

| Basamak | Koşul | Görev | Bilişsel işlem |
| --- | --- | --- | --- |
| R1 | Yeni kart / s < 3 | 4 şıktan tanı (Arapça→anlam) | Tanıma |
| R2 | 3 ≤ s < 10 | Sesten tanı (yazısız) ya da anlamdan Arapçayı seç | Ses-anlam eşleme |
| R3 | 10 ≤ s < 30 | **Harflerden kur:** karışık harf çiplerinden kelimeyi diz (çeldirici olarak 2 fazla harf) | Üretme |
| R4 | s ≥ 30 | **Âyette boşluk:** gerçek âyette eksik kelimeyi seç; çeldiriciler aynı türden | Bağlamda geri çağırma |

- **Unutma kuralı:** Unutulan kart bir basamak iner (merdiven iki yönlü çalışır).
- **Deney:** Kartların B kolu (hash'le seçilir) R1'de kalır, A kolu merdiveni çıkar (H3).
- **Çeldirici kalitesi:**
  - R3'teki fazla harfler, kelimenin harflerine biçimce en yakın harflerdir (aynı nokta ailesi:
    ب ت ث ن ي). Bu, S0'ın şekil aileleriyle aynı ilke.
  - R4'teki çeldiriciler aynı türden ve farklı kökten seçilir; mevcut `kaoPickDistractors`
    süzgeci B-01 düzeltmesinden sonra kullanılır.

## 5. Görsel sistem

### 5.1 Materyal (3 katman)

| Katman | Açık tema | Koyu tema | Kullanım |
| --- | --- | --- | --- |
| Zemin | `color-mix(--quran-surface 92%, --quran2)`: parşömen | Gece laciverti `--quran-bg` | Diyalog arka planı |
| Kart | `--quran-surface` + gölge `0 1px 2px` / `0 8px 24px` (%8 lacivert) | Yüzey + 1 px iç çizgi | Liste, görev |
| An | Lacivert degrade + 1 px altın cetvel + rumî SVG | Aynı, daha koyu | Tezhip, ders sonu, taş |

### 5.2 Renk görevleri

| Renk | Nerede |
| --- | --- |
| Lacivert | Yapı (başlıklar, birincil düğme) |
| Altın | Yalnız kazanılmış şeyler: yaldız, doğru cevap, taş |
| Yeşil | Kullanılmaz; doğru cevabı altın gösterir. İki başarı rengi işareti sulandırır. |
| Sıcak turuncu (`--quran-warn`) | Yalnız yanlış ve uyarı |

### 5.3 Tipografi

| Token | Değer | Kullanım |
| --- | --- | --- |
| `--kao-ar-hero` | `clamp(2.75rem, 12vw, 4.25rem)`, satır yüksekliği 2.0 | Soru, tanışma |
| `--kao-ar-body` | `1.75rem`, satır yüksekliği 2.1 | Şıklar, âyet satırı |
| `--kao-ar-inline` | `1.25em` | Türkçe metin içi |
| Latin okunuş | `--f-callout`, italik değil, `--kao-label-2` | Arapçanın hemen altında |

- Kural: Arapça her zaman Latin metnin **1,3 katı veya daha büyük** olur (Arapçanın x-yüksekliği
  daha küçüktür).
- Kalınlık her zaman 400.

### 5.4 Hareket grameri

Hepsi `SeyFx.shouldAnimate()` ve `prefers-reduced-motion` kapısından geçer.

| Sınıf | Süre | Eğri | Örnek |
| --- | --- | --- | --- |
| Mikro | 120–180 ms | `cubic-bezier(.2,.8,.2,1)` | Şık basışı, ✓ |
| Geçiş | 240–320 ms | Aynı eğri | Görev değişimi (yatay kayma 24 px + opaklık) |
| An | 600–1.200 ms | Yay (aşma %6) | Yaldızlanma, ders sonu |

- Dokunuşa görsel yanıt her zaman < 100 ms içinde başlar.
- Toplam an süresi ≤ 1,2 sn; uzun kutlama yok.
- Ses ve dokunsal geri bildirim (`SeyAudio` / `SeyHaptics`) sessiz saatleri ve ayarları zaten
  dikkate alıyor:

| Olay | Dokunsal | Ses |
| --- | --- | --- |
| Doğru | `tap` | Yumuşak kadans |
| Yanlış | `error` | Ses yok |
| Yaldız | `success` | Tek çan |

## 6. Ne değişmez (sözleşme)

- `quranLearn` şeması ve `migrate()`. Merdiven, deney ataması, medyan ve haftalık hedef hep mevcut
  veriden **türetilir**.
- `App.kao*` sayısı 45 (K-D), modal klavye sözleşmesi, 44 px tabanı, `forced-colors`.
- FSRS motoru ve kuyruk. Merdiven yalnız görev **biçimini** seçer; notlama aynıdır.
- Panel özeti `kaoPanelSummary`.

## 7. Bilerek yapılmayanlar

| Fikir | Neden hayır |
| --- | --- |
| Konuşma tanıma ile telaffuz puanı | Gizlilik / ağ (K-J) |
| Puan, lig, liderlik tablosu | Tek kullanıcılı uygulama. Dışsal ödül içsel motivasyonu aşındırabilir (SDT). |
| Seri kaybı uyarıları | K-H |
| Yapay zekâ sohbet öğretmeni | Doğrulanmamış içerik üretir. KAO'da içerik yalnız doğrulanmış araç çıktısından gelir. |
| Gramer görevlerini artırmak | Tutarlılık kapısı (`test_kao2_lesson_coherence`) bugün dengede; önce kelime merdiveni |
