# 05 — Hedef deneyim

Bu belge "ne göreceğiz, hangi sırayla, neden" sorusunun cevabıdır. Görsel dil
06'da, müfredat 07'de, veri ve kod 08'de.

## 1. Tasarım ilkeleri (bu modüle özgü)

1. **Her an tek sıradaki adım.** Kullanıcı hiçbir ekranda "ne yapmalıyım?"
   diye düşünmez; birincil düğme her zaman bir sonraki doğru adımdır (D-13).
2. **Önce öğret, sonra sor, sonra gerçek metinde göster** (D-01, D-02, D-06).
3. **Yol görünür, kilit yok.** Kullanıcı nerede olduğunu, önünde ne kaldığını
   görür; istediği yere gidebilir ama öneri tektir.
4. **Kabuk sessiz, içerik güzel.** Arapça metin, ses ve boşluk öne; süs yok (D-14).
5. **Sayılar dürüst ve cesaretlendirici.** İlk gün "0" gösterilmez; gerçek,
   anlamlı kazanç gösterilir (D-17).

## 2. Bilgi mimarisi

```
Kur'an Arapçası (modal · kendi gezinme yığını)
│
├── [İlk açılış] Karşılama → Başlangıç noktası → Ritim        (yalnız 1 kez)
│
└── Bugün  (kök ekran)
    ├── ① Sıradaki adım kartı            ← tek birincil eylem
    │      "Fâtiha · Ders 2 · 5 yeni kelime · ~6 dk"  [Başla]
    │
    ├── ② Yolun                          ← seviye/ünite ilerlemesi
    │      Seviye 1 · Namazın dili  ●●●○○
    │      [Tüm yolu gör ›]  → Yol → Ünite → Ders
    │
    ├── ③ Keşfet (grouped list)
    │      Kısa sûreler ›   Namazda ne diyorum ›   Kök aileleri ›
    │      Gramer notları ›   Telaffuz stüdyosu ›   Günün âyeti ›
    │
    └── ④ Sen (grouped list)
           İlerleme ve taşlar ›   Ayarlar ›
```

Ekran envanteri (eski → yeni):

| Yeni | Eski | Değişim |
|---|---|---|
| S-01 İlk açılış (3 adım) | — | **Yeni** |
| S-02 Bugün | E1 home | Yeniden yazılır: 8 bağlantı → 1 kart + yol + 2 grouped list |
| S-03 Yol | E4 units (kısmen) | **Yeni**: seviyeler + tematik üniteler |
| S-04 Ünite | — | **Yeni**: hedef, dersler, kelimeler, kavram, çapa metin, ustalık kontrolü |
| S-05 Ders oynatıcı | E2 session (kısmen) | **Yeni akış**: Tanış → Kavram → Pekiştir → Uygula → Özet |
| S-06 Tekrar turu | E2 session | Korunur + yeni geri bildirim paneli |
| S-07 Özet | E3 done | Yeniden yazılır: öğrenilenler + yarın + sıradaki |
| S-08 Kelime | E5 word | 3 katman → tek kaydırmalı detay |
| S-09 Sûre okuyucu | E6 reader | Sûre tanıtım kartı + dinlerken oku + akış düzeni |
| S-10 Gramer notları | — | **Yeni**: 25 kavramlık kütüphane |
| S-11 Kök aileleri | E5 katman 2 | **Yeni ekran**: 73 kök ailesi |
| S-12 İlerleme | E10 map + stats | Birleşir: taşlar, kapsam eğrisi, harita, istatistik |
| S-13 Ayarlar | E7 settings | Grouped list + switch + "Hakkında ve kaynaklar" alt sayfası |
| (korunur) | E8 phonics, E9 ayah, E11 prayer | Yeni kabuk + küçük akış düzeltmeleri |

**Gezinme:** `ui.kaoStack` yığını. Sol üst: kökte `Kapat`, diğer ekranlarda
`‹ <önceki ekran adı>`. Geri her zaman gelinen yere döner (01 Y-10'un çözümü).
Ders oynatıcı ve tekrar turu **odak modu**dur: üstte yalnız `✕` + ilerleme çubuğu.

## 3. İlk açılış (S-01): 3 adım, ≤60 saniye

Koşul: `quranLearn.onboarding.doneAt` boş **ve** hiç kart yok. Kartı olan
kullanıcıya gösterilmez; ona tek seferlik "Yeni düzen" notu çıkar (§9).

```
Adım 1 · Karşılama                 Adım 2 · Başlangıç noktası         Adım 3 · Ritim
┌──────────────────────────┐      ┌──────────────────────────┐      ┌──────────────────────────┐
│                   Atla   │      │ ‹                  2/3   │      │ ‹                  3/3   │
│                          │      │                          │      │                          │
│  Namazda söylediklerini  │      │  Arapça harfleri okuya-  │      │  Günde ne kadar?         │
│  anlamaya başla          │      │  biliyor musun?          │      │  ◉ 5 dk   ○ 10 dk  ○ 15  │
│                          │      │                          │      │  Günde ~5 yeni kelime    │
│  📖 500 kelime →         │      │ ┌──────────────────────┐ │      │                          │
│     Kur'an kelimelerinin │      │ │ Henüz değil          │ │      │  Ne zaman?               │
│     dörtte üçü           │      │ │ Harflerle başlayalım │ │      │  ○ Sabah namazından sonra│
│  🔁 Önce öğren, sonra    │      │ └──────────────────────┘ │      │  ◉ Yatsıdan sonra        │
│     akıllı tekrar        │      │ ┌──────────────────────┐ │      │  ○ Kendim seçerim        │
│  🕌 Fâtiha'dan başla;    │      │ │ Harekeyle, yavaşça   │ │      │                          │
│     namazda anla         │      │ │ 2 dk'lık kontrol     │ │      │  Sesli öğren   [  ●]     │
│                          │      │ └──────────────────────┘ │      │                          │
│                          │      │ ┌──────────────────────┐ │      │                          │
│  [   Başlayalım   ]      │      │ │ Evet, rahat okurum   │ │      │  [  Fâtiha ile başla  ]  │
│                          │      │ └──────────────────────┘ │      │                          │
└──────────────────────────┘      └──────────────────────────┘      └──────────────────────────┘
```

Yönlendirme kuralı:

| Seçim | Sonuç | Başlangıç noktası |
|---|---|---|
| Henüz değil | Seviye 0 tam yol (12 ders) | S0 · Ders 1 "İlk harfler" |
| Harekeyle, yavaşça | 2 dk yerleştirme: 8 okuma + 4 dinleme (mevcut kapının kısa sürümü) | ≥7/8 → Seviye 1; aksi hâlde yalnız eksik S0 dersleri önerilir |
| Evet, rahat okurum | Seviye 1 | Seviye 1 · Ünite 1 "Fâtiha" · Ders 1 |

"Atla" her adımda var ve makul varsayılanlarla (Seviye 1, 5 dk, ses açık)
doğrudan Bugün'e götürür. Tüm seçimler Ayarlar'dan değiştirilebilir.
Adım 3'teki başlık düğmesi seçime göre değişir ("Harflerle başla" / "Fâtiha ile başla").

## 4. "Sıradaki adım" motoru

Saf fonksiyon: `kaoNextStep(data, now) → {kind, title, subtitle, minutes, action}`.
Ana ekran kartı, hub kartı ve özet ekranı aynı fonksiyonu kullanır (tek doğruluk kaynağı).

Öncelik sırası (ilk eşleşen kazanır):

| # | Durum | Sıradaki adım | Örnek metin |
|---|---|---|---|
| 1 | İlk açılış yapılmadı | İlk açılış | "Hoş geldin · 1 dakikada başlayalım" |
| 2 | Gece penceresi | Hafif tekrar | "Uyumadan önce 8 kart · ~3 dk" |
| 3 | S0 gerekli ve bitmedi | Sıradaki S0 dersi | "Harfler · Ders 3: Hareke · ~5 dk" |
| 4 | Bugünkü ders yapılmadı | **Günlük ders** = vadeli tekrarlar + sıradaki ders parçası | "Fâtiha · Ders 2 · 8 tekrar + 5 yeni · ~7 dk" |
| 5 | Ünitenin dersleri bitti, ustalık kontrolü yapılmadı | Ustalık kontrolü | "Fâtiha'yı dokunmadan oku · ~4 dk" |
| 6 | Ünite tamam | Sonraki ünite tanıtımı | "Sıradaki ünite: Tesbihat ve tekbir" |
| 7 | Bugün bitti | Dinlendirici öneri (isteğe bağlı) | "Bugünlük tamam ✓ · İstersen: Günün âyeti" |

Günlük ders bileşimi (tek "Başla" ile akar, arada özet yok):

```
[Tekrar] vadesi gelenler (en çok 20; mevcut FSRS kuyruğu)
   → [Ders] sıradaki ders parçası: Tanış (≤ yeni bütçe) → Kavram (varsa) → Pekiştir
   → [Uygula] çapa metninden 1 âyet/satır, bilinen kelimeler açık
   → [Özet]
```

Süre tahmini gerçek ölçümden gelir: kullanıcının son 7 günlük ortalama görev
süresi (veri yoksa 0,55 dk/görev); üst sınır, kullanıcının seçtiği günlük süre.

## 5. Ders anatomisi (S-05)

Bir **ders** ~5 dakikadır; ünitenin 4–6 yeni kelimesini ve varsa bir kavramı içerir.

| Aşama | Ekran | İçerik | Kullanıcı eylemi |
|---|---|---|---|
| 0 · Hedef | Tek kart | "Bu derste: الرَّحْمَٰن · الرَّحِيم · مَالِك · يَوْم · الدِّين · Fâtiha 3–4. âyet" | Başla |
| 1 · Tanış | Kelime başına 1 kart | Büyük harekeli Arapça · ses (otomatik; sessiz saatte değil) · okunuş · anlam · Türkçe akraba (rahmet, rahim) · Fâtiha'daki yeri vurgulu | Dinle / Devam |
| 2 · Kavram | 1–2 kart (varsa) | `plainTr` sade anlatım · tablo · çözümlü örnek · "Terimi: izafet" (katlanabilir) | Anladım |
| 3 · Pekiştir | 6–10 görev | Kolaydan zora: 2 şık → 4 şık → ses→anlam → anlam→Arapça → kavram sorusu (bloklu) | Cevap → geri bildirim → Devam |
| 4 · Uygula | 1 ekran | Çapa metin satırı; yeni kelimeler vurgulu, bilinenler açık; "Dinle" ile kelime kelime vurgu | Oku · "Anladım" |
| 5 · Özet | 1 ekran | "5 yeni kelime" (liste) · doğruluk · "Yarın 7 tekrar, ~4 dk" · sıradaki adım | Bugün yeter / Devam et |

Tanış kartından sonraki ilk görev yalnız 2 şıklıdır: ilk geri çağırma
başarıyla sonuçlanmalıdır (D-02).

### Geri bildirim paneli (tüm görevlerde)

```
┌──────────────────────────────┐
│ ━━━━━━━━━━━━━░░░░░░░░   ✕    │   ← ilerleme çubuğu (odak modu)
│                              │
│            رَبِّ              │
│            rabbi             │
│   Bu kelime ne demek?        │
│  ┌────────────────────────┐  │
│  │ ✓ Rab, terbiye eden    │  │   ← doğru şık: yeşil + ✓ + kalın
│  └────────────────────────┘  │
│  ┌────────────────────────┐  │
│  │ ✕ Gün                  │  │   ← seçilen yanlış: turuncu + ✕
│  └────────────────────────┘  │
│  (diğer şıklar soluk)        │
├──────────────────────────────┤
│ Yakın! رَبّ "sahip, terbiye   │   ← alt panel, aria-live
│ eden" demek. Türkçedeki      │
│ "Rab" ile aynı kelime.       │
│  [ 🔊 ]      [   Devam   ]   │
└──────────────────────────────┘
```

Kurallar:
- Panel her cevapta açılır; ekran kullanıcı "Devam"a basana kadar kalır
  (Ayarlar'da "Doğruda otomatik geç" isteğe bağlı açılabilir).
- Doğru cevapta panel kısadır ("Doğru ✓ · rahmet ile akraba").
- Yanlış cevapta açıklama hata sınıfından gelir: kognat, kök, ek, kural, sıra, ses (07 §4).
- Geri alma, panelde "Aslında biliyordum" bağlantısı olarak yaşar (eski 3 sn
  düğmesinin yerine, 01 O-03).

## 6. Ünite ekranı (S-04)

```
┌──────────────────────────────┐
│ ‹ Yol                        │
│ Ünite 1                      │
│ Fâtiha                       │   ← large title
│ Her namazda okuduğun 7 âyet. │
│ Bitirince Fâtiha'yı kelime   │
│ kelime anlayacaksın.         │
│  ◔ 12 / 29 kelime · 2/5 ders │   ← halka + metin
│ [  Ders 3'e devam et  ]      │
│                              │
│ DERSLER                      │
│  ✓ 1 Besmele ve Hamd         │
│  ✓ 2 Rahmân, Rahîm           │
│  ● 3 Din gününün sahibi   ›  │
│  ○ 4 Yalnız sana             │
│  ○ 5 Doğru yol               │
│  ○ Ustalık: Fâtiha'yı oku    │
│                              │
│ KAVRAMLAR                    │
│  Fiil önce gelir          ›  │
│  "el-": bilinen olan      ›  │
│  İki isim yan yana        ›  │
│                              │
│ KELİMELER (29)            ›  │
│ ÇAPA METİN: Fâtiha        ›  │
└──────────────────────────────┘
```

## 7. Bugün ekranı (S-02)

```
┌──────────────────────────────┐
│ Kapat                        │
│ Kur'an Arapçası              │   ← large title
│                              │
│ ┌──────────────────────────┐ │
│ │ SIRADAKİ                 │ │
│ │ Fâtiha · Ders 3          │ │
│ │ Din gününün sahibi       │ │
│ │ 8 tekrar · 5 yeni · 7 dk │ │
│ │ [        Başla        ]  │ │   ← tek birincil eylem
│ └──────────────────────────┘ │
│                              │
│ YOLUN                        │
│ ┌──────────────────────────┐ │
│ │ Seviye 1 · Namazın dili  │ │
│ │ ━━━━━━━━░░░░░░  Ünite 1/3│ │
│ │ 41 kelime · Kur'an'ın %31│ │
│ │ Tüm yolu gör           › │ │
│ └──────────────────────────┘ │
│                              │
│ KEŞFET                       │
│ 📖 Kısa sûreler          ›  │
│ 🕌 Namazda ne diyorum    ›  │
│ 🌿 Kök aileleri          ›  │
│ 📐 Gramer notları        ›  │
│ 🎧 Telaffuz stüdyosu     ›  │
│ ✨ Günün âyeti           ›  │
│                              │
│ SEN                          │
│ 📈 İlerleme ve taşlar    ›  │
│ ⚙︎ Ayarlar               ›  │
└──────────────────────────────┘
```

(Emojiler yalnız wireframe'de yer tutucudur; uygulamada mevcut `icon()` çizgi
simgeleri kullanılır.)

Sıfır kullanıcıda "Yolun" kartı %0 yerine **hedefi** gösterir: "İlk hedef:
Fâtiha'yı anlamak · 29 kelime".

## 8. Hub kartı (İlham & İbadet içinde)

Bir bakışta tek bilgi + tek eylem (widget mantığı). Yükseklik ~120 px.

| Durum | Başlık satırı | Alt satır | Eylem |
|---|---|---|---|
| Hiç başlamadı | Kur'an Arapçası | "Namazda söylediklerini anlamaya başla · 5 dk" | Başla |
| Günlük ders bekliyor | Kur'an Arapçası · Ünite 1 | "Sıradaki: Din gününün sahibi · 7 dk" | Devam |
| Bugün tamam | Kur'an Arapçası ✓ | "Bugünlük tamam · yarın 6 tekrar" | Aç |
| Gece penceresi | Kur'an Arapçası | "Uyumadan önce 8 kart · 3 dk" | Tekrar et |

Sağda küçük ilerleme halkası (ünite ilerlemesi, gerçek veri). Niyet önerisi
(namaz vakti) yalnız "bekliyor" durumunda alt satırın yerine geçer.

## 9. Mevcut kullanıcı geçişi

Kartı olan kullanıcı ilk açılış akışını görmez. Bunun yerine:
- Tek seferlik "Yeni düzen" notu (3 madde, kapatılabilir).
- Kartlarındaki lemmalar yeni tematik ünitelere eşlenir; üniteler tamamlanan
  kelime sayısıyla dolu başlar. Hiçbir FSRS kartı değişmez.
- Kazanılmış taşlar korunur. "Fâtiha" taşının koşulu düzeltilir (07 §6);
  eski koşulla kazanılmış taş geri alınmaz.

## 10. Boş, hata ve kenar durumları

| Durum | Davranış |
|---|---|
| Ses yüklenemedi | Görev sessiz sürer; tanış kartında "Ses şu an çalmıyor" notu; S0 dinleme görevleri ertelenir (mevcut R-C2) |
| Sessiz saat (23–07) | Otomatik ses yok, düğme çalışır |
| Doğrulanmamış içerik | Öğe **gösterilmez** (kullanıcıya hata kutusu çıkmaz); yalnız test/denetim sayacına düşer (01 Y-11) |
| Tekrar borcu çok (>60) | "Bugün yalnız tekrar" önerisi; yeni kelime 0; metin suçlamasız |
| Günlerce ara | "Hoş geldin · 10 kartla ısınalım" (en zayıf 10 kart); borcun tamamı gösterilmez |
| Tüm içerik bitti | Seviye 6 serbest okuma + Kur'an Yolculuğu köprüsü |
