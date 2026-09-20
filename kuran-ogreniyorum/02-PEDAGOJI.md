# 02 — Pedagojik tasarım (bilimsel yaklaşım)

Hedef öğrenici: **ana dili Türkçe, Kur'an Arapçası sıfır**, günde ~10 dakika,
telefonda, tek başına. Amaç: **anlayarak okumak** (üretim/konuşma değil).
Her ilke bir mekaniğe, her mekanik bir ölçüte bağlanır; ölçülmeyen ilke
plana giremez.

## 1. Öğrenme hedefleri (ne öğrenecek)

| Katman | Bilgi | Ölçüt |
|---|---|---|
| L0 Harf–hareke | 28 harf, 4 konum, fetha/kesra/damme/sükûn/şedde/tenvin/med | 20 kelimelik okuma kontrolünde ≥18 doğru → atla |
| L1 Kelime tanıma | Harekeli kelimeyi görüp Türkçe anlamı seçmek | FSRS kararlılık ≥ 21 gün |
| L2 Kelime hatırlama | Türkçeden Arapça formu tanımak (ters yön) | Aynı kartın ters yönü ayrı kart |
| L3 Kök–kalıp | Kelimenin kökünü ve kalıp anlamını çıkarmak (ك-ت-ب → kâtib/mektûb/kitâb) | Kök ağacı görevlerinde ≥%80 |
| L4 Gramer parçası | Zamir/edat/olumsuzluk ekleri; çekim tabloları | Boşluk doldurma ≥%80 |
| L5 Parça çözümleme | 3–7 kelimelik âyet parçasını kelime kelime çözmek | "Kelime dizme" görevinde doğru sıra |
| L6 Bağlam okuma | Bilinen sûreyi (Fâtiha → İhlâs → Nasr ...) anlayarak okumak | Sûre "anladım" işareti + gecikmeli test |

## 2. İlkeler → mekanikler

### 2.1 Sıklık öncelikli seçim
Kelime envanteri **korpus sıklığına** göre sıralanır (lemma bazlı). Ama sırayı
tek başına sıklık belirlemez; **"bilinen metin"** (namazda okunan) ve
**kognat** ağırlıklandırması uygulanır:

```
öncelik = 0.55·sıklıkNorm + 0.30·namazMetnindeGeçiyor + 0.15·kognatDeğil
```

(Kognat olan kelime *daha kolay* olduğu için tam döngüye girmez; "Zaten
biliyorsun" turunda tanınır.)

### 2.2 Aralıklı tekrar — FSRS
Her öğrenme birimi (kelime yönü, gramer parçası, kök) bir **kart**tır.
Kart durumu: `{s: kararlılık(gün), d: zorluk(1–10), r: son gözden geçirme,
due: sonraki, reps, lapses, state: new|learning|review|relearning}`.
Değerlendirme 4'lü (Yine / Zor / İyi / Kolay) **gösterilmez**; UI'da ikili
sonuç (doğru/yanlış) + tepki süresi otomatik "İyi/Kolay" ayrımına çevrilir
(basitlik; kullanıcı kendi bilgisini derecelendirmez). Hedef hatırlama 0,90.

Günlük bütçe: yeni kart 5/10/15 (ayar), tekrar limiti 60. "Bugün bitti"
durumu açık söylenir; sonsuz kaydırma yok.

### 2.3 Geri çağırma üstünlüğü
Alıştırma türleri, hepsi **üretici hatırlama**:

| Tür | Girdi → Çıktı | Katman |
|---|---|---|
| Anlam seç | Arapça kelime → 4 Türkçe seçenek (çeldiriciler aynı POS/aynı kök ailesinden) | L1 |
| Arapça seç | Türkçe → 4 Arapça (harekeli) | L2 |
| Kök bul | Kelime → 3 harf kök seç (harf çipleri) | L3 |
| Kalıp eşle | Aynı kökten 3 kelime → 3 anlam eşleştir | L3 |
| Ek çöz | كِتَابُهُمْ → "kitap + onların" (parçalara dokun) | L4 |
| Çekim tablosu | فَعَلَ → boş hücreyi doldur (çip) | L4 |
| Kelime dizme | Karışık 4–6 Arapça çip → âyet parçası sırası | L5 |
| Parça çevir | Âyet parçası → 3 Türkçe çeviriden doğru olanı | L5 |
| Sûre okuma | Kelime kelime dokunarak anlam açma; sonunda "anladım" | L6 |

Yazı yazma (klavye) **yok** — telefonda Arapça klavye yükü ve hata kaynağı;
tüm görevler dokunma/çip seçimi.

### 2.4 Serpiştirme ve kavramsal çeşitleme
Bir oturum 12–16 görev: %50 vadesi gelen tekrar, %25 yeni kelime tanıtımı,
%15 gramer parçası, %10 âyet parçası. Aynı türden ardışık ≤2 görev.

### 2.5 Kök-ve-kalıp (sarf) — ana dili gibi işlemleme
Her kelime kartı `root`, `pattern`, `family[]` taşır. Kök **ilk gösterimde**
verilir ("ع-ل-م ailesinden: ilim, âlim, malûm, muallim, alâmet"). Türkçedeki
türevler kognat köprüsüdür — tek kök, Türkçede 5–10 kelime.

### 2.6 Bağlam: her kelime Kur'an cümlesi içinde
Kart ≥3 **kısa âyet parçası** (3–7 kelime) taşır; tam âyet değil, çünkü
bilişsel yük. Parçanın Türkçesi kendi kısa çevirisi; kaynak/âyet numarası
her zaman görünür.

### 2.7 Kognat köprüsü ve yalancı kognat uyarısı
`cognate: {tr:'kitap', shift:null}` veya `{tr:'nefs', shift:'Türkçede "nefis"
daha çok lezzet/ego; Kur'an'da "can/benlik"'}`. Uyarı **yalnız anlam kayması
varsa** gösterilir; her kartta uyarı yorgunluğu yaratmaz.

### 2.8 TFE — çok duyulu zamir/çekim pratiği
Zamir ve fiil çekim kartlarında "işaret et" mikro-animasyon (kendine/karşıya/
yana ok), sesli model paketli okuyucu klibidir (`App.kaoPlay`; TTS değil — bkz.
[10](10-TELAFFUZ.md) §8). Türkçe açıklamaların sesli okunması isteğe bağlı
`SeyAudio.voice` (yerel TTS; sessiz saat 23–07 kapısı orada). Mikrofon yalnız
gölgelemede ve isteğe bağlıdır (karar D-10).

### 2.9 Terminoloji geciktirme
İlk 2 ünitede gramer terimi yok: "ben/sen/o eki", "-de/-den kelimesi".
Terim ("harf-i cer", "muzâri") 3. üniteden itibaren parantez içinde eklenir.

### 2.10 Hata sonrası açıklama
Yanlış cevapta anında doğru + tek satır gerekçe (kök / edat / ek ipucu).
Yanlış kart aynı oturumda 1 kez daha gelir (relearning).

### 2.11 Uyku/dinlenme, aşırı yük ve sakinlik
Günlük hedef aşılınca "bugün yeter" ekranı; seri (streak) **yumuşak**:
kaçırılan gün cezalandırılmaz, "kaldığın yerden" devam. Şeyma'nın genel
yargılamayan tonuyla uyumlu (IIP "yargılamayan ritim" ilkesi).

## 3. Ölçüm — pedagojik telemetri (yalnız yerel, sayısal)

`data.quranLearn.stats` altında: günlük tekrar sayısı, doğruluk, ortalama
tepki süresi, kapsam yüzdesi (bilinen lemma token'larının 77.430'a oranı),
ünite ilerlemesi. Panel aynasına yalnız **özet** gider (kapsam %, seri,
bugün çalışıldı mı). Serbest metin yoktur → gizlilik riski düşük.

Kapsam formülü: `coverage = Σ freq(lemma ∈ bilinen) / 77.430` — "bilinen" =
her iki yönde de `state=review && s ≥ 21`.

## 4. Neyi bilerek yapmıyoruz

- Tecvid / kıraat öğretimi (ayrı disiplin; kapsam dışı).
- Konuşma/yazma üretimi.
- Tefsir hükmü — kart anlamları sözlük düzeyindedir; mezhep/yorum içermez;
  tartışmalı anlamlarda "sözlük anlamı; bağlamda tefsire bak" notu.
- Puan/lig/rozet enflasyonu — yalnız kapsam yüzdesi ve ünite kilometre taşı.

## 5. Kanıt kütüphanesi — "world-class" için eklenen ilkeler (v2)

Her satır: kanıt → KAO'da somut karşılığı → nasıl ölçülür.

### 5.1 Kapsam ≠ anlama: %98 kuralı ve "anlayabildiğin âyet"
Okuma anlaması için bilinen kelime oranı **%95 (asgari) – %98 (rahat)**
gerekir (Laufer 1989; Hu & Nation 2000; Schmitt vd. 2011: %92–100 aralığında
her %1 kapsam ≈ %2,3 anlama; eşik yok, ilişki doğrusal). Sonuç: "Kur'an'ın
%80'ini tanıyorsun" ile "âyeti anlıyorsun" farklı şeylerdir. KAO iki sayaç
gösterir: **kelime kapsamı** (token) ve **anlayabildiğin âyet sayısı** —
kelimelerinin ≥%95'i bilinen âyetler (Krashen'in *i+1* fikrinin ölçülebilir
hâli). Her gün "bugün anlayabildiğin yeni bir âyet" kartı (hub kartında da).

### 5.2 Görev katılım yükü (Involvement Load; Laufer & Hulstijn 2001)
Kalıcılık görevin *ihtiyaç–arama–değerlendirme* yüküyle artar (sistematik
inceleme PMC 2022 desteği). KAO görev türleri yüke göre derecelenir: anlam
seç (düşük) → ek çöz / kök bul (orta) → kelime dizme / parça çevir (yüksek).
Yeni kelime ilk 2 tekrarda düşük yük, review'de yüksek yük alır.

### 5.3 Hareke ve görsel kelime tanıma (Abu-Rabia)
Harekeli metin hem zayıf hem iyi okurda doğruluk ve anlamayı artırır;
harekesiz okumada homograf yüzünden her 2–3 kelimeden biri risklidir.
KAO: hareke **varsayılan açık**; "soldurma" modu yalnız kullanıcı isteğiyle,
review kararlılığı ≥30 gün olan kelimelerde.

### 5.4 Algı-önce telaffuz (HVPT meta-analizleri)
[10-TELAFFUZ](10-TELAFFUZ.md) §5. Çok okuyuculu dinleme; üretim aktarımı
sınırlı olduğundan gölgeleme + öz-değerlendirme, skor yok.

### 5.5 Çift kodlama ve üretim etkisi
Kelime kartı = Arapça (görsel) + ses (işitsel) + kök ağacı (şematik) +
Türkçe kognat (dilsel köprü). "Üretim etkisi": kullanıcı kelimeyi çip
dizerek/ek çözerek *kurar*, hazır görmez.

### 5.6 Ayrıntılandırıcı sorgulama
Kök ağacında "neden bu kelime bu kökten?" sorusu (ör. مَكْتَب → yazılan yer);
her 5 yeni kelimede bir "bağ kur" görevi: Türkçedeki türevini seç.

### 5.7 Geri bildirim zamanı ve hata taksonomisi
Anında düzeltici geri bildirim + kısa gerekçe. Hatalar sınıflanır:
**ses karışıklığı** (ح/ه), **kök karışıklığı** (ك-ت-ب/ك-ذ-ب), **ek
karışıklığı** (ـهُ/ـهُمْ), **kognat tuzağı** (anlam kayması), **kural**
(elif-lâm/vakıf). Taksonomi telemetriye gider → zayıf alan otomatik daha sık
gelir; kullanıcıya "en çok karıştırdıkların" tek satırı.

### 5.8 Motivasyon: öz-belirleme ve niyet
Özerklik (ünite sırası öneri, kilit yok; günlük bütçe seçimi), yeterlik
(kapsam + anlaşılan âyet sayısı gibi gerçek göstergeler), ilişki (Kur'an
Yolculuğu'nda Raşit ile köprü). **Uygulama niyeti**: "Sabah namazından sonra
5 dakika" — mevcut namaz vakti verisi/hatırlatıcı altyapısı *okunarak* öneri
(REM programı dondurulmuş; yeni bildirim üretilmez, yalnız hub kartında
zamanlı öneri metni).

### 5.9 Bilişsel yük yönetimi
Tek görev tek ekran; en çok 4 çip; yeni kelimede önce ses+Arapça+Türkçe,
kök ikinci dokunuşta; gramer terimi geciktirme (§2.9); Seviye 0'da harf
başına en çok 3 yeni ses.

### 5.10 Aktarım ve genelleme ölçümü
Haftalık "yeni âyet" testi: hiç görülmemiş, kelime kapsamı ≥%95 bir parça
→ çeviri seçimi. Eğitilen kartlarda değil, **yeni metinde** başarı ölçülür
(HVPT literatüründeki "untrained stimuli" mantığı).
