# KAO-04 · Gramer inceleme tablosu

> Arapça metnin tamamı korpustan çözülür (`tools/kao-grammar-build.mjs --build`); bu dosyada
> yalnız onay sütunları (`verifiedBy`, `verifiedAt`) düzenlenir. Onay kuralı D-12 (06 §3):
> tek doğrulayıcı + tek tarih + kavram denetimi 0 sorun.

## Onay tablosu

| id | ünite | başlık | şablon | örnek | tablo | verifiedBy | verifiedAt |
|---|---|---|---|---|---|---|---|
| g0_5 | 1 | Fiil önce gelir | 4 | 4 | 1 | claude-opus-5-5 | 2026-09-23 |
| g1 | 1 | Başındaki 'el': o bilinen | 4 | 4 | 1 | claude-opus-5-5 | 2026-09-23 |
| g2 | 1 | İki isim yan yana: …nın …ı | 4 | 4 | 1 | claude-opus-5-5 | 2026-09-23 |
| g3 | 2 | '-de, -den, -e' kelimeleri | 4 | 4 | 1 | claude-opus-5-5 | 2026-09-23 |
| g4 | 2 | 'o, onlar, sen, siz, ben, biz' | 3 | 4 | 1 | claude-opus-5-5 | 2026-09-23 |
| g5 | 3 | Yapışık ekler: -ı, -leri, -in, -iniz, -im, -imiz | 4 | 4 | 1 | claude-opus-5-5 | 2026-09-23 |
| g6 | 3 | Olumsuzluk: lâ, lem, mâ | 3 | 4 | 1 | claude-opus-5-5 | 2026-09-23 |
| g7 | 4 | '-an, -en, ki o' bağları | 3 | 4 | 1 | claude-opus-5-5 | 2026-09-23 |
| g8 | 4 | 'Şüphesiz' ve 'ancak': inne, illâ | 4 | 4 | 1 | claude-opus-5-5 | 2026-09-23 |
| g9 | 5 | Bu, şu, o, bunlar, onlar | 3 | 4 | 1 | claude-opus-5-5 | 2026-09-23 |
| g10 | 5 | '-dır' yazılmaz: isim cümlesi | 3 | 4 | 1 | claude-opus-5-5 | 2026-09-23 |
| g11 | 6 | Sondaki yuvarlak 'te': dişil kelime | 3 | 3 | 1 | claude-opus-5-5 | 2026-09-23 |
| g12 | 6 | Çoğul: sona ek ya da içten değişim | 3 | 4 | 1 | claude-opus-5-5 | 2026-09-23 |
| g13 | 7 | Geçmiş zaman: yaptı, yaptılar, yaptım | 4 | 4 | 1 | claude-opus-5-5 | 2026-09-23 |
| g14 | 7 | Kâne: 'idi, oldu' | 3 | 3 | 1 | claude-opus-5-5 | 2026-09-23 |
| g15 | 8 | Şimdiki ve geniş zaman: yapar, yapıyor | 4 | 4 | 1 | claude-opus-5-5 | 2026-09-23 |
| g16 | 8 | Yapmaz, yapmadı, asla yapmayacak | 3 | 3 | 1 | claude-opus-5-5 | 2026-09-23 |
| g17 | 9 | Emir: yap!, deyin! | 4 | 4 | 1 | claude-opus-5-5 | 2026-09-23 |
| g18 | 9 | Seslenme: ey … | 3 | 4 | 1 | claude-opus-5-5 | 2026-09-23 |
| g19 | 10 | Yapan ve yapılan: kâtib, mektûb | 4 | 3 | 1 | claude-opus-5-5 | 2026-09-23 |
| g20 | 10 | Fiilin adı: bilme, anma, inanma | 3 | 3 | 1 | claude-opus-5-5 | 2026-09-23 |
| g21 | 11 | Kalıp değişince anlam kayar: ilim → talim | 4 | 3 | 1 | claude-opus-5-5 | 2026-09-23 |
| g22 | 12 | 'Eğer', '-ınca', '-seydi' | 3 | 4 | 1 | claude-opus-5-5 | 2026-09-23 |
| g23 | 12 | Cümleye zaman rengi veren fiiller: kâne, leyse, asbaha | 3 | 3 | 1 | claude-opus-5-5 | 2026-09-23 |
| g24 | 12 | Kur'an'ın sık kalıpları | 3 | 4 | 1 | claude-opus-5-5 | 2026-09-23 |
| unit11 | 11 | Türkçedeki akrabalar (R-A8) | — | — | 73 | claude-opus-5-5 | 2026-09-23 |

## g0_5 · Ünite 1 · Fiil önce gelir

- **Terimsiz:** Türkçede iş cümlenin sonunda söylenir: 'İbrahim temelleri yükseltiyor.' Arapçada çoğu zaman önce iş söylenir, sonra işi yapan, sonra işten etkilenen: 'yükseltiyor İbrahim temelleri.'
- **Terimli** (gizli — ünite <3): Türkçe cümle özne–nesne–yüklem (SOV) sırasındadır; Arapça fiil cümlesi çoğunlukla fiil–fâil–mef'ûl (VSO) sırasındadır.
- Okurken ilk kelimede 'ne oldu?' diye sor: cevap çoğu zaman odur.
- İşi yapan fiilden hemen sonra gelir; Türkçeye çevirirken onu başa alırsın.
- Dizme görevinde fiili sona koymak 'sıra' hatası olarak kaydedilir.

**Aynı cümle, iki sıra**

| Satır | 1. | 2. | 3. |
|---|---|---|---|
| Türkçe sıra | İbrahim | temelleri | yükseltiyor |
| Arapça sıra | يَرْفَعُ [2:127:2] | إِبْرَٰهِـۧمُ [2:127:3] | ٱلْقَوَاعِدَ [2:127:4] |
| Arapçadaki görev | iş (fiil) | yapan (özne) | etkilenen (nesne) |

**Örnekler**

- `2:127:2-4` يَرْفَعُ إِبْرَٰهِـۧمُ ٱلْقَوَاعِدَ — İbrahim temelleri yükseltiyor
- `2:7:1-4` خَتَمَ ٱللَّهُ عَلَىٰ قُلُوبِهِمْ — Allah onların kalplerini mühürledi
- `2:251:4-6` وَقَتَلَ دَاوُۥدُ جَالُوتَ — ve Dâvud Câlût'u öldürdü
- `5:119:17-19` رَّضِىَ ٱللَّهُ عَنْهُمْ — Allah onlardan razı oldu

**Şablonlar**

- g0_5-k1 · Kelime dizme: Arapça sırayla diz: önce iş, sonra yapan, sonra etkilenen.
- g0_5-k2 · Kelime dizme: 've Dâvud Câlût'u öldürdü' cümlesini Arapça sırayla kur.
- g0_5-k3 · Parça çevir: Bu parçanın doğru çevirisi hangisi?
- g0_5-k4 · Anlam seç: Cümlenin ilk kelimesi neyi söylüyor?

## g1 · Ünite 1 · Başındaki 'el': o bilinen

- **Terimsiz:** Kelimenin başındaki 'el' parçası 'o bilinen' demektir: kitâb (bir kitap) → el-kitâb (o kitap).
- **Terimli** (gizli — ünite <3): Harf-i tarif (el) ismi belirli yapar; belirsiz isim çoğunlukla tenvinle (-un, -in, -an) biter.
- Bazı harflerden önce 'el'deki l okunmaz, sonraki harf ikilenir: 'er-Rahmân', 'es-sırât'.
- Belirsiz isim sondaki 'n' sesinden tanınır: kitâbun = bir kitap.

**Belirsiz ve belirli**

| Kelime | Belirsiz (bir …) | Belirli (o …) |
|---|---|---|
| kitap | كِتَـٰبٌ [2:89:3] | ٱلْكِتَـٰبُ [2:2:2] |
| yol | صِرَٰطٍ [2:142:20] | ٱلصِّرَٰطَ [1:6:2] |
| gün | يَوْمًا [2:48:2] | وَبِٱلْيَوْمِ [2:8:7] |

**Örnekler**

- `1:2:1-4` ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَـٰلَمِينَ — Övgü, âlemlerin Rabbi Allah'a aittir
- `1:6:1-3` ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ — bizi dosdoğru yola ilet
- `2:2:1-4` ذَٰلِكَ ٱلْكِتَـٰبُ لَا رَيْبَ — işte o kitap; hiç şüphe yok
- `2:142:19-21` إِلَىٰ صِرَٰطٍ مُّسْتَقِيمٍ — dosdoğru bir yola

**Şablonlar**

- g1-k1 · Ek çöz: Kelimeyi parçalarına ayır.
- g1-k2 · Ek çöz: Kelimeyi parçalarına ayır.
- g1-k3 · Kelime dizme: 'bizi dosdoğru yola ilet' parçasını diz.
- g1-k4 · Parça çevir: 'el' yoksa çeviri nasıl olur?

## g2 · Ünite 1 · İki isim yan yana: …nın …ı

- **Terimsiz:** İki ismi yan yana koyunca Türkçedeki '-nın … -ı' bağı kurulur; sıra Türkçenin tersidir: 'Rab âlemler' = 'âlemlerin Rabbi'.
- **Terimli** (gizli — ünite <3): İzafet tamlaması: muzâf (tamlanan) önce, muzâfun ileyh (tamlayan) sonra gelir; muzâf 'el' ve tenvin almaz, tamlayan -i ile okunur.
- Birinci kelime sahip olunan şeydir, ikincisi sahibi.
- Birinci kelime 'el' almaz ama belirli sayılır: 'âlemlerin Rabbi' belli bir Rab'dir.

**Tamlamalar**

| Türkçesi | 1. kelime (tamlanan) | 2. kelime (tamlayan) |
|---|---|---|
| âlemlerin Rabbi | رَبِّ [1:2:3] | ٱلْعَـٰلَمِينَ [1:2:4] |
| hesap günü | يَوْمِ [1:4:2] | ٱلدِّينِ [1:4:3] |
| Allah'ın adı | بِسْمِ [1:1:1] | ٱللَّهِ [1:1:2] |
| Allah'ın nimeti | نِعْمَتَ [3:103:8] | ٱللَّهِ [3:103:9] |

**Örnekler**

- `1:2:3-4` رَبِّ ٱلْعَـٰلَمِينَ — âlemlerin Rabbi
- `1:4:1-3` مَـٰلِكِ يَوْمِ ٱلدِّينِ — hesap gününün sahibi
- `1:1:1-2` بِسْمِ ٱللَّهِ — Allah'ın adıyla
- `3:103:7-10` وَٱذْكُرُوا۟ نِعْمَتَ ٱللَّهِ عَلَيْكُمْ — Allah'ın size olan nimetini hatırlayın

**Şablonlar**

- g2-k1 · Kelime dizme: 'hesap gününün sahibi' tamlamasını Arapça sırayla diz.
- g2-k2 · Kelime dizme: Parçayı diz.
- g2-k3 · Parça çevir: Doğru çeviri hangisi?
- g2-k4 · Anlam seç: Bu kelime tamlamada ne demek?

## g3 · Ünite 2 · '-de, -den, -e' kelimeleri

- **Terimsiz:** Türkçede sona eklenen '-de, -den, -e' Arapçada kelimenin önüne gelen küçük kelimelerdir: fî = içinde, min = -den, ilâ = -e doğru.
- **Terimli** (gizli — ünite <3): Harf-i cer (edat): bi, li, fî, min, alâ, ilâ, an; kendinden sonraki ismi -i ile (mecrûr) okutur.
- Bi ve li kelimeye yapışır: bismi = 'adıyla', lillâhi = 'Allah için'.
- Edat bir ek (-hi, -him) alabilir: fîhi = 'onda', aleyhim = 'onların üzerine'.

**Küçük kelimeler**

| Türkçesi | Arapça |
|---|---|
| içinde, -de | فِى |
| -den | مِن |
| üzerine | عَلَىٰ |
| -e doğru | إِلَىٰ |
| -den (uzaklaşma) | عَن |
| ile (bi-, yapışık) | بِسْمِ [1:1:1] |
| için (li-, yapışık) | لِلَّهِ [1:2:2] |

**Örnekler**

- `2:2:3-5` لَا رَيْبَ فِيهِ — onda hiç şüphe yok
- `2:5:1-5` أُو۟لَـٰٓئِكَ عَلَىٰ هُدًى مِّن رَّبِّهِمْ — işte onlar Rablerinden gelen bir hidayet üzeredir
- `2:4:3-5` بِمَآ أُنزِلَ إِلَيْكَ — sana indirilene
- `1:7:1-4` صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ — kendilerine nimet verdiğin kimselerin yolu

**Şablonlar**

- g3-k1 · Ek çöz: Kelimeyi parçalarına ayır.
- g3-k2 · Ek çöz: Kelimeyi parçalarına ayır.
- g3-k3 · Anlam seç: Bu küçük kelime ne demek?
- g3-k4 · Parça çevir: Doğru çeviri hangisi?

## g4 · Ünite 2 · 'o, onlar, sen, siz, ben, biz'

- **Terimsiz:** 'o, onlar, sen, siz, ben, biz' Arapçada tek başına duran kısa kelimelerdir: hüve (o), hüm (onlar), ente (sen), nahnü (biz).
- **Terimli** (gizli — ünite <3): Munfasıl (ayrık) zamirler: hüve, hiye, hüm, ente, entüm, ene, nahnü; isim cümlesinde çoğunlukla özne olur.
- Arapçada 'sen' erkeğe ve kadına ayrı söylenir.
- Zamir cümleyi vurgular: 'kurtuluşa erenler onlardır.'

**Tek başına duran zamirler**

| Türkçe | Arapça |
|---|---|
| o (erkek) | هُوَ [2:29:1] |
| o (kadın) | هِىَ [2:68:8] |
| onlar | هُمْ [2:4:11] |
| sen (erkek) | أَنتَ [2:32:10] |
| siz | أَنتُمْ [2:85:2] |
| ben | أَنَا۠ [2:258:21] |
| biz | نَحْنُ [2:11:10] |

**Örnekler**

- `112:1:1-4` قُلْ هُوَ ٱللَّهُ أَحَدٌ — de ki: O Allah'tır, tektir
- `2:5:6-8` وَأُو۟لَـٰٓئِكَ هُمُ ٱلْمُفْلِحُونَ — kurtuluşa erenler de onlardır
- `2:32:9-12` إِنَّكَ أَنتَ ٱلْعَلِيمُ ٱلْحَكِيمُ — şüphesiz sen bilensin, hikmet sahibisin
- `2:30:18-19` وَنَحْنُ نُسَبِّحُ — biz ise tesbih ediyoruz

**Şablonlar**

- g4-k1 · Arapça seç: 'biz' hangisi?
- g4-k2 · Anlam seç: Bu kelime ne demek?
- g4-k3 · Parça çevir: Doğru çeviri hangisi?

## g5 · Ünite 3 · Yapışık ekler: -ı, -leri, -in, -iniz, -im, -imiz

- **Terimsiz:** Türkçedeki iyelik ekleri Arapçada da kelimenin sonuna yapışır: rabbi-hum (Rableri), rabbi-kum (Rabbiniz), abdi-nâ (kulumuz).
- **Terimli** (görünür): Muttasıl (bitişik) zamirler: -hû, -hüm, -ke, -küm, -î, -nâ; isme gelince iyelik, fiile ve edata gelince nesne olur.
- Aynı ek fiile gelince nesne olur: halakakum = 'sizi yarattı'.
- Edata gelince 'ona, onlara' anlamı verir: lehû = 'onun için, ona'.

**Yapışık ekli kelimeler (Kur'an'dan)**

| Ek (Türkçesi) | Kur'an'dan kelime |
|---|---|
| -ı / -i (onun) | مِّثْلِهِۦ [2:23:12] |
| -leri (onların) | رَّبِّهِمْ [2:5:5] |
| -in (senin) | قَبْلِكَ [2:4:9] |
| -iniz (sizin) | رَبَّكُمُ [2:21:4] |
| -im (benim) | هُدَاىَ [2:38:11] |
| -imiz (bizim) | عَبْدِنَا [2:23:8] |

**Örnekler**

- `2:5:3-5` هُدًى مِّن رَّبِّهِمْ — Rablerinden bir hidayet
- `2:21:3-4` ٱعْبُدُوا۟ رَبَّكُمُ — Rabbinize kulluk edin
- `112:4:1-5` وَلَمْ يَكُن لَّهُۥ كُفُوًا أَحَدٌۢ — hiçbir şey O'na denk olmadı
- `2:40:8-11` وَأَوْفُوا۟ بِعَهْدِىٓ أُوفِ بِعَهْدِكُمْ — ahdimi yerine getirin, ben de ahdinizi yerine getireyim

**Şablonlar**

- g5-k1 · Ek çöz: Kelimeyi parçalarına ayır.
- g5-k2 · Ek çöz: Kelimeyi parçalarına ayır.
- g5-k3 · Ek çöz: Kelimeyi parçalarına ayır.
- g5-k4 · Parça çevir: Doğru çeviri hangisi?

## g6 · Ünite 3 · Olumsuzluk: lâ, lem, mâ

- **Terimsiz:** 'yok, değil, -me' anlamını üç kısa kelime taşır: lâ (yok, -mez), lem (-medi), mâ (değil).
- **Terimli** (görünür): Nefy edatları: lâ (genel/şimdiki olumsuzluk ve yasak), lem (muzâriyi cezmeder, geçmişi olumsuzlar), mâ (mâzi ve isim cümlesini olumsuzlar).
- Lem'den sonra gelen fiil şimdiki zaman görünse de anlam geçmiştir: lem yelid = 'doğurmadı'.
- Lâ, emirle birlikte yasak bildirir: lâ tüfsidû = 'bozgunculuk yapmayın'.

**Üç olumsuzluk**

| Kelime | Arapça | Ne yapar |
|---|---|---|
| lâ | لَا | yok; -mez; yasakta -me |
| lem | لَم | geçmiş: -medi |
| mâ | مَا [2:102:61] | değil; -medi |

**Örnekler**

- `112:3:1-4` لَمْ يَلِدْ وَلَمْ يُولَدْ — doğurmadı ve doğurulmadı
- `2:2:3-5` لَا رَيْبَ فِيهِ — onda hiç şüphe yok
- `2:8:9-11` وَمَا هُم بِمُؤْمِنِينَ — oysa onlar inanmış değiller
- `2:6:8-11` لَمْ تُنذِرْهُمْ لَا يُؤْمِنُونَ — onları uyarmasan da inanmazlar

**Şablonlar**

- g6-k1 · Kelime dizme: 'doğurmadı ve doğurulmadı' parçasını diz.
- g6-k2 · Anlam seç: Bu kelime fiile hangi anlamı verir?
- g6-k3 · Parça çevir: Doğru çeviri hangisi?

## g7 · Ünite 4 · '-an, -en, ki o' bağları

- **Terimsiz:** Türkçedeki '-an, -en' ve 'ki o' bağlarını Arapçada ayrı kelimeler kurar: ellezî (o ki), ellezîne (onlar ki), men (kim), mâ (şey ki).
- **Terimli** (görünür): İsm-i mevsûl: ellezî, elletî, ellezîne; men (kişiler için), mâ (şeyler için); ardından onu açıklayan sıla cümlesi gelir.
- Ellezîne yu'minûne = 'inanan kimseler' (Türkçede '-an' ekiyle çevrilir).
- Men kişiler için, mâ şeyler için kullanılır.

**Bağlayan kelimeler**

| Türkçe | Arapça |
|---|---|
| o ki (erkek, tekil) | ٱلَّذِى [2:17:3] |
| o ki (kadın, tekil) | ٱلَّتِى [2:24:8] |
| onlar ki (çoğul) | ٱلَّذِينَ [1:7:2] |
| kim (kişi) | مَن |
| şey ki (şey) | مَا |

**Örnekler**

- `1:7:1-4` صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ — kendilerine nimet verdiğin kimselerin yolu
- `2:3:1-3` ٱلَّذِينَ يُؤْمِنُونَ بِٱلْغَيْبِ — görünmeyene inananlar
- `2:8:3-5` مَن يَقُولُ ءَامَنَّا — 'inandık' diyen kimse
- `2:21:4-6` رَبَّكُمُ ٱلَّذِى خَلَقَكُمْ — sizi yaratan Rabbiniz

**Şablonlar**

- g7-k1 · Anlam seç: Bu kelime ne demek?
- g7-k2 · Kelime dizme: 'görünmeyene inananlar' parçasını diz.
- g7-k3 · Parça çevir: Doğru çeviri hangisi?

## g8 · Ünite 4 · 'Şüphesiz' ve 'ancak': inne, illâ

- **Terimsiz:** Vurgu 'inne' (şüphesiz) ile yapılır; 'illâ' ancak, -den başka demektir. 'Mâ … illâ' birlikte 'sadece' anlamı verir.
- **Terimli** (görünür): İnne (harf-i müşebbehe bi'l-fiil) ismini mansûb, haberini merfû okutur; illâ istisna edatıdır; mâ … illâ kasr (sınırlama) kurar.
- İnnemâ = 'sadece, ancak': innemâ nahnu muslihûn = 'biz sadece ıslah edicileriz'.
- Olumsuzluktan sonra illâ gelirse cümle 'yalnız …' diye çevrilir.

**Vurgu ve sınırlama**

| Kelime | Arapça | Anlam |
|---|---|---|
| inne | إِنّ | şüphesiz |
| enne | أَنّ | -dığı, ki |
| illâ | إِلَّا | ancak, -den başka |
| innemâ | إِنَّمَا [2:11:9] | sadece, ancak |

**Örnekler**

- `2:6:1-3` إِنَّ ٱلَّذِينَ كَفَرُوا۟ — şüphesiz inkâr edenler
- `2:20:20-25` إِنَّ ٱللَّهَ عَلَىٰ كُلِّ شَىْءٍ قَدِيرٌ — şüphesiz Allah her şeye gücü yetendir
- `2:9:5-8` وَمَا يَخْدَعُونَ إِلَّآ أَنفُسَهُمْ — ancak kendilerini aldatırlar
- `2:26:35-39` وَمَا يُضِلُّ بِهِۦٓ إِلَّا ٱلْفَـٰسِقِينَ — onunla yalnız yoldan çıkanları saptırır

**Şablonlar**

- g8-k1 · Parça çevir: Doğru çeviri hangisi?
- g8-k2 · Anlam seç: Bu kelime ne demek?
- g8-k3 · Ek çöz: Kelimeyi parçalarına ayır.
- g8-k4 · Kelime dizme: Parçayı diz.

## g9 · Ünite 5 · Bu, şu, o, bunlar, onlar

- **Terimsiz:** Yakını göstermek için hâzâ (bu), uzağı göstermek için zâlike (o) kullanılır; kadınlar ve çoğul için ayrı kelimeler vardır.
- **Terimli** (görünür): İsm-i işaret: hâzâ / hâzihî (yakın, eril/dişil), zâlike / tilke (uzak, eril/dişil), hâulâi / ulâike (çoğul).
- Zâlike el-kitâbu = 'işte o kitap': işaret kelimesi + 'el'li isim.
- Uzak işaret saygı ve büyüklük de bildirebilir.

**İşaret kelimeleri**

| Türkçe | Arapça |
|---|---|
| bu (erkek) | هَٰذَا |
| bu (kadın) | هَـٰذِهِ [2:35:14] |
| o (erkek, uzak) | ذَٰلِك |
| o (kadın, uzak) | تِلْكَ [2:134:1] |
| bunlar | هَـٰٓؤُلَآءِ [2:31:12] |
| onlar (uzak) | أُولَٰٓئِك |

**Örnekler**

- `2:2:1-4` ذَٰلِكَ ٱلْكِتَـٰبُ لَا رَيْبَ — işte o kitap; hiç şüphe yok
- `2:25:19-22` قَالُوا۟ هَـٰذَا ٱلَّذِى رُزِقْنَا — dediler: bu bize verilendir
- `2:134:1-4` تِلْكَ أُمَّةٌ قَدْ خَلَتْ — o, gelip geçmiş bir ümmetti
- `2:5:1-3` أُو۟لَـٰٓئِكَ عَلَىٰ هُدًى — işte onlar bir hidayet üzeredir

**Şablonlar**

- g9-k1 · Arapça seç: 'bu' hangisi?
- g9-k2 · Kelime dizme: Parçayı diz.
- g9-k3 · Parça çevir: Doğru çeviri hangisi?

## g10 · Ünite 5 · '-dır' yazılmaz: isim cümlesi

- **Terimsiz:** Türkçedeki '-dır' eki Arapçada yazılmaz: 'Allah Samed' = 'Allah Samed'dir'. Cümle bir isimle başlar ve onun hakkında bir şey söyler.
- **Terimli** (görünür): İsim cümlesi: mübteda (çoğunlukla belirli) + haber (çoğunlukla belirsiz); şimdiki zamanda 'olmak' fiili yazılmaz.
- Hakkında konuşulan önce, söylenen sonra gelir.
- İkinci kelime 'el'siz ise çoğu zaman haberdir: ilâhun vâhid = tek bir ilahtır.

**İsim cümleleri**

| Cümle | Hakkında konuşulan (mübteda) | Söylenen (haber) |
|---|---|---|
| Allah Samed'dir | ٱللَّهُ [112:2:1] | ٱلصَّمَدُ [112:2:2] |
| ilahınız tek ilahtır | وَإِلَـٰهُكُمْ [2:163:1] | إِلَـٰهٌ [2:163:2] |
| onlar kurtuluşa erenlerdir | هُمُ [2:5:7] | ٱلْمُفْلِحُونَ [2:5:8] |

**Örnekler**

- `112:2:1-2` ٱللَّهُ ٱلصَّمَدُ — Allah Samed olandır
- `2:163:1-3` وَإِلَـٰهُكُمْ إِلَـٰهٌ وَٰحِدٌ — ilahınız tek bir ilahtır
- `2:5:6-8` وَأُو۟لَـٰٓئِكَ هُمُ ٱلْمُفْلِحُونَ — kurtuluşa erenler de onlardır
- `2:255:1-6` ٱللَّهُ لَآ إِلَـٰهَ إِلَّا هُوَ ٱلْحَىُّ — Allah; O'ndan başka ilah yoktur, diri olan O'dur

**Şablonlar**

- g10-k1 · Kelime dizme: 'ilahınız tek bir ilahtır' cümlesini diz.
- g10-k2 · Parça çevir: Doğru çeviri hangisi?
- g10-k3 · Anlam seç: '-dır' hangi kelimede saklı?

## g11 · Ünite 6 · Sondaki yuvarlak 'te': dişil kelime

- **Terimsiz:** Kelime sonundaki yuvarlak 'te' çoğunlukla dişil (kadınsı) kelimeyi gösterir; durakta 'e' ya da 'h' okunur: rahmet, cennet, âyet.
- **Terimli** (görünür): Tâ-i merbûta müennes işaretidir; vakıfta h okunur, vasılda t okunur.
- Türkçeye çoğu zaman '-et' sesiyle geçmiştir: rahmet, nimet, cennet.
- Dişil kelimeyi niteleyen kelime de dişil olur.

**Yuvarlak 'te' ile biten kelimeler**

| Türkçe | Arapça |
|---|---|
| rahmet | رَحْمَة |
| cennet, bahçe | جَنَّة |
| âyet, işaret | ءَايَة |
| nimet | نِعْمَة |
| kelime, söz | كَلِمَة |
| ümmet | أُمَّة |

**Örnekler**

- `2:157:1-6` أُو۟لَـٰٓئِكَ عَلَيْهِمْ صَلَوَٰتٌ مِّن رَّبِّهِمْ وَرَحْمَةٌ — işte onlar; Rablerinden onlara lütuflar ve rahmet vardır
- `2:35:3-6` ٱسْكُنْ أَنتَ وَزَوْجُكَ ٱلْجَنَّةَ — sen ve eşin cennete yerleşin
- `3:103:7-9` وَٱذْكُرُوا۟ نِعْمَتَ ٱللَّهِ — Allah'ın nimetini hatırlayın

**Şablonlar**

- g11-k1 · Anlam seç: Bu kelime ne demek?
- g11-k2 · Ek çöz: Kelimeyi parçalarına ayır.
- g11-k3 · Parça çevir: Doğru çeviri hangisi?

## g12 · Ünite 6 · Çoğul: sona ek ya da içten değişim

- **Terimsiz:** Çoğul iki yolla yapılır: sona '-ûn / -în' (erkek) ya da '-ât' (dişil) eklenir; ya da kelimenin içi değişir: kalb → kulûb.
- **Terimli** (görünür): Cem-i müzekker sâlim (-ûne/-îne), cem-i müennes sâlim (-ât) ve cem-i mükesser (kırık çoğul).
- -ûn ve -în aynı çoğuldur; cümledeki yerine göre değişir.
- Kırık çoğul ezberlenir: kalb → kulûb, kitâb → kütüb.

**Tekil ve çoğul**

| Kelime | Tekil | Çoğul | Nasıl |
|---|---|---|---|
| inanan | مُؤْمِن | مُّؤْمِنِينَ [2:91:30] | sona -în |
| cennet | جَنَّة | جَنَّـٰتٍ [2:25:8] | sona -ât |
| kalp | قَلْب | قُلُوبِ [3:151:3] | içi değişir |

**Örnekler**

- `2:8:9-11` وَمَا هُم بِمُؤْمِنِينَ — oysa onlar inananlardan değiller
- `2:25:1-5` وَبَشِّرِ ٱلَّذِينَ ءَامَنُوا۟ وَعَمِلُوا۟ ٱلصَّـٰلِحَـٰتِ — iman edip iyi işler yapanları müjdele
- `2:10:1-3` فِى قُلُوبِهِم مَّرَضٌ — kalplerinde bir hastalık var
- `2:25:6-8` أَنَّ لَهُمْ جَنَّـٰتٍ — onlar için cennetler olduğunu

**Şablonlar**

- g12-k1 · Anlam seç: Bu kelime tekil mi çoğul mu?
- g12-k2 · Kelime dizme: 'kalplerinde bir hastalık var' parçasını diz.
- g12-k3 · Parça çevir: Doğru çeviri hangisi?

## g13 · Ünite 7 · Geçmiş zaman: yaptı, yaptılar, yaptım

- **Terimsiz:** Geçmiş zaman fiilin sonuna şahıs eki getirilerek kurulur: fe'ale (yaptı), fe'alû (yaptılar), fe'altü (yaptım), fe'alnâ (yaptık).
- **Terimli** (görünür): Mâzi fiil: 14 siyga (şahıs–sayı–cinsiyet) çekimi; kalıp fa'ala. Kur'an'da geçmeyen siygalar tabloda boş gösterilir.
- Ekleri tanı: -û (onlar), -te (sen), -tüm (siz), -tü (ben), -nâ (biz).
- Tablodaki her biçim Kur'an'dan alınmıştır; geçmeyen biçim uydurulmaz.

**Mâzi çekimi**

| Şahıs | Türkçe | fa'ala (yaptı) | Başka bir sağlam fiil |
|---|---|---|---|
| o (erkek) | yaptı | فَعَلَ [7:155:20] | خَتَمَ [2:7:1] |
| o ikisi (erkek) | yaptılar (ikisi) | (Kur'an'da geçmez) | كَسَبَا [5:38:7] |
| onlar (erkek) | yaptılar | فَعَلُوا۟ [3:135:3] | كَفَرُوا۟ [2:6:3] |
| o (kadın) | yaptı | (Kur'an'da geçmez) | رَبِحَت [2:16:7] |
| o ikisi (kadın) | yaptılar (ikisi) | (Kur'an'da geçmez) | فَسَدَتَا [21:22:7] |
| onlar (kadın) | yaptılar | فَعَلْنَ [2:234:18] | بَلَغْنَ [2:231:4] |
| sen (erkek) | yaptın | فَعَلْتَ [10:106:12] | خَرَجْتَ [2:149:3] |
| siz ikiniz | yaptınız (ikiniz) | (Kur'an'da geçmez) | (Kur'an'da geçmez) |
| siz (erkek) | yaptınız | فَعَلْتُم [12:89:5] | ظَلَمْتُمْ [2:54:7] |
| sen (kadın) | yaptın | (Kur'an'da geçmez) | (Kur'an'da geçmez) |
| siz ikiniz (kadın) | yaptınız (ikiniz) | (Kur'an'da geçmez) | (Kur'an'da geçmez) |
| siz (kadın) | yaptınız | (Kur'an'da geçmez) | (Kur'an'da geçmez) |
| ben | yaptım | (Kur'an'da geçmez) | لَبِثْتُ [2:259:27] |
| biz | yaptık | فَعَلْنَا [14:45:10] | فَرَقْنَا [2:50:2] |

**Örnekler**

- `2:6:1-3` إِنَّ ٱلَّذِينَ كَفَرُوا۟ — şüphesiz inkâr edenler
- `2:25:2-5` ٱلَّذِينَ ءَامَنُوا۟ وَعَمِلُوا۟ ٱلصَّـٰلِحَـٰتِ — iman edip iyi işler yapanlar
- `2:31:1-3` وَعَلَّمَ ءَادَمَ ٱلْأَسْمَآءَ — ve Âdem'e isimleri öğretti
- `3:135:1-4` وَٱلَّذِينَ إِذَا فَعَلُوا۟ فَـٰحِشَةً — ve onlar ki bir çirkinlik yaptıklarında

**Şablonlar**

- g13-k1 · Çekim tablosu: 'o yaptı' hücresini doldur.
- g13-k2 · Çekim tablosu: 'siz yaptınız' hücresini doldur.
- g13-k3 · Ek çöz: Fiili parçalarına ayır.
- g13-k4 · Parça çevir: Doğru çeviri hangisi?

## g14 · Ünite 7 · Kâne: 'idi, oldu'

- **Terimsiz:** Kâne 'oldu, idi' demektir; ardından şimdiki zamanlı bir fiil gelirse '-ıyordu, -ırdı' anlamı verir: kânû yekzibûn = yalan söylüyorlardı.
- **Terimli** (görünür): Kâne nâkıs fiildir: ismini merfû, haberini mansûb okutur; muzâri ile hikâye ve süreklilik kurar.
- Kâne'nin kendisi de çekilir: kânû (idiler), küntüm (idiniz), küntü (idim).
- Allah için 'kâna'llâhu alîmen' kalıcı bir sıfatı anlatır: 'Allah bilendir'.

**Kâne çekimi**

| Şahıs | Türkçe | Arapça |
|---|---|---|
| o (erkek) | idi, oldu | كَانَ [2:75:6] |
| o (kadın) | idi, oldu | كَانَتْ [2:94:3] |
| onlar | idiler | كَانُوا۟ [2:10:11] |
| siz | idiniz | كُنتُمْ [2:23:2] |
| ben | idim | كُنتُ [4:73:14] |
| biz | idik | كُنَّا [4:97:11] |

**Örnekler**

- `2:10:10-12` بِمَا كَانُوا۟ يَكْذِبُونَ — yalan söyleyip durduklarından dolayı
- `2:23:1-4` وَإِن كُنتُمْ فِى رَيْبٍ — eğer bir şüphe içindeyseniz
- `4:17:17-20` وَكَانَ ٱللَّهُ عَلِيمًا حَكِيمًا — Allah her şeyi bilen, hikmet sahibidir

**Şablonlar**

- g14-k1 · Çekim tablosu: 'onlar idiler' hücresini doldur.
- g14-k2 · Anlam seç: 'kânû yekzibûn' içinde bu kelime ne katar?
- g14-k3 · Parça çevir: Doğru çeviri hangisi?

## g15 · Ünite 8 · Şimdiki ve geniş zaman: yapar, yapıyor

- **Terimsiz:** Şimdiki/geniş zaman fiilin önüne ye-, te-, e-, ne- getirilerek kurulur: yef'alü (yapar), tef'alûne (yaparsınız), nef'alü (yaparız).
- **Terimli** (görünür): Muzâri: mudâraat harfleri (e, t, y, n) başa gelir; çoğulda -ûne eki alır; şimdiki ve gelecek zamanı birlikte taşır.
- Baş harf kimin yaptığını söyler: ye- (o), te- (sen / o kadın), e- (ben), ne- (biz).
- Tablodaki her biçim Kur'an'dan alınmıştır; geçmeyen biçim boş kalır.

**Muzâri çekimi**

| Şahıs | Türkçe | fa'ala (yapar) | Başka bir sağlam fiil |
|---|---|---|---|
| o (erkek) | yapar | يَفْعَلُ [2:85:31] | يَخْطَفُ [2:20:3] |
| o ikisi (erkek) | yaparlar (ikisi) | (Kur'an'da geçmez) | يَخْصِفَانِ [7:22:10] |
| onlar (erkek) | yaparlar | يَفْعَلُونَ [2:71:24] | يَخْدَعُونَ [2:9:6] |
| o (kadın) | yapar | (Kur'an'da geçmez) | تَسْقُطُ [6:59:14] |
| o ikisi (kadın) | yaparlar (ikisi) | (Kur'an'da geçmez) | (Kur'an'da geçmez) |
| onlar (kadın) | yaparlar | (Kur'an'da geçmez) | يَطْهُرْنَ [2:222:14] |
| sen (erkek) | yaparsın | (Kur'an'da geçmez) | تَجْعَلُ [2:30:11] |
| siz ikiniz | yaparsınız (ikiniz) | (Kur'an'da geçmez) | (Kur'an'da geçmez) |
| siz (erkek) | yaparsınız | تَفْعَلُونَ [16:91:20] | تَعْلَمُونَ [2:22:23] |
| sen (kadın) | yaparsın | (Kur'an'da geçmez) | تَعْجَبِينَ [11:73:2] |
| siz ikiniz (kadın) | yaparsınız (ikiniz) | (Kur'an'da geçmez) | (Kur'an'da geçmez) |
| siz (kadın) | yaparsınız | (Kur'an'da geçmez) | (Kur'an'da geçmez) |
| ben | yaparım | (Kur'an'da geçmez) | أَعْلَمُ [2:30:25] |
| biz | yaparız | نَفْعَلُ [37:34:3] | نَعْبُدُ [1:5:2] |

**Örnekler**

- `2:3:1-3` ٱلَّذِينَ يُؤْمِنُونَ بِٱلْغَيْبِ — görünmeyene inananlar
- `2:13:17-19` وَلَـٰكِن لَّا يَعْلَمُونَ — fakat bilmezler
- `1:5:1-2` إِيَّاكَ نَعْبُدُ — yalnız sana kulluk ederiz
- `2:30:24-28` إِنِّىٓ أَعْلَمُ مَا لَا تَعْلَمُونَ — ben sizin bilmediğinizi bilirim

**Şablonlar**

- g15-k1 · Çekim tablosu: 'o yapar' hücresini doldur.
- g15-k2 · Ek çöz: Fiili parçalarına ayır.
- g15-k3 · Parça çevir: Doğru çeviri hangisi?
- g15-k4 · Kelime dizme: Parçayı diz.

## g16 · Ünite 8 · Yapmaz, yapmadı, asla yapmayacak

- **Terimsiz:** Aynı fiil üç olumsuzlukla üç zaman anlatır: lâ yef'alü (yapmaz), lem yef'al (yapmadı), len yef'ale (asla yapmayacak).
- **Terimli** (görünür): Lâ nâfiye (muzâri merfû kalır), lem (cezm eder, geçmiş anlam), len (nasb eder, gelecek; kesin olumsuzluk).
- Lem ve len fiilin sonunu değiştirir: yef'alû → lem yef'alû / len yef'alû (sondaki -n düşer).
- Len, 'asla' vurgusu taşır.

**Üç olumsuzluk, üç zaman**

| Edat | Arapça | Zaman |
|---|---|---|
| lâ | لَا | şimdi / genel: -mez |
| lem | لَم | geçmiş: -medi |
| len | لَن | gelecek: asla -meyecek |

**Örnekler**

- `2:24:1-5` فَإِن لَّمْ تَفْعَلُوا۟ وَلَن تَفْعَلُوا۟ — eğer yapamazsanız, ki asla yapamayacaksınız
- `2:6:8-11` لَمْ تُنذِرْهُمْ لَا يُؤْمِنُونَ — onları uyarmasan da inanmazlar
- `112:3:1-4` لَمْ يَلِدْ وَلَمْ يُولَدْ — doğurmadı ve doğurulmadı

**Şablonlar**

- g16-k1 · Anlam seç: Bu kelime ne anlatır?
- g16-k2 · Kelime dizme: Parçayı diz.
- g16-k3 · Parça çevir: Doğru çeviri hangisi?

## g17 · Ünite 9 · Emir: yap!, deyin!

- **Terimsiz:** Emir, şimdiki zamandaki fiilin baş harfi atılarak yapılır: te-kûlü (dersin) → kul (de!); çoğulda -û eklenir: kûlû (deyin!).
- **Terimli** (görünür): Emr-i hâzır: muzâri cezm hâlinden mudâraat harfi atılır; gerekirse başa vasl hemzesi (i-, u-) eklenir.
- Dua da emir kalıbıyla yapılır: ihdinâ (bizi ilet), iğfir (bağışla).
- Olumsuz emir 'lâ' ile kurulur: lâ tüfsidû (bozgunculuk yapmayın).

**Kur'an'dan emirler**

| Kime | Türkçe | Arapça |
|---|---|---|
| sen | de! | قُلْ [2:80:8] |
| siz (söz) | deyin! | قُولُوٓا۟ [2:136:1] |
| siz (kulluk) | kulluk edin! | ٱعْبُدُوا۟ [2:21:3] |
| sen (dua) | bağışla! | ٱغْفِرْ [3:147:8] |

**Örnekler**

- `112:1:1-4` قُلْ هُوَ ٱللَّهُ أَحَدٌ — de ki: O Allah'tır, tektir
- `1:6:1-3` ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ — bizi dosdoğru yola ilet
- `2:21:1-4` يَـٰٓأَيُّهَا ٱلنَّاسُ ٱعْبُدُوا۟ رَبَّكُمُ — ey insanlar, Rabbinize kulluk edin
- `2:43:1-4` وَأَقِيمُوا۟ ٱلصَّلَوٰةَ وَءَاتُوا۟ ٱلزَّكَوٰةَ — namazı kılın, zekâtı verin

**Şablonlar**

- g17-k1 · Anlam seç: Bu kelime ne demek?
- g17-k2 · Ek çöz: Kelimeyi parçalarına ayır.
- g17-k3 · Kelime dizme: 'namazı kılın, zekâtı verin' parçasını diz.
- g17-k4 · Parça çevir: Doğru çeviri hangisi?

## g18 · Ünite 9 · Seslenme: ey …

- **Terimsiz:** Seslenmek için 'yâ' (ey) kullanılır; 'el'li kelimeden önce 'yâ eyyühâ' gelir. Duada 'Rabbenâ' tek başına 'ey Rabbimiz' demektir.
- **Terimli** (görünür): Nidâ: harf-i nidâ yâ; el'li isme 'eyyühâ' aracılığıyla seslenilir; münâdâ muzâf ise mansûb okunur (Rabbenâ).
- Yâ eyyühe'l-lezîne âmenû = 'ey iman edenler'.
- Dualarda 'yâ' çoğu zaman düşer: Rabbenâ âtinâ = 'Rabbimiz, bize ver'.

**Seslenme kalıpları**

| Türkçe | Arapça |
|---|---|
| ey (… olanlar) | أَيُّهَا |
| ey oğulları | يَـٰبَنِىٓ [2:40:1] |
| ey Âdem | يَـٰٓـَٔادَمُ [2:35:2] |
| Rabbimiz! (yâ düşer) | رَبَّنَآ [2:201:4] |

**Örnekler**

- `2:21:1-3` يَـٰٓأَيُّهَا ٱلنَّاسُ ٱعْبُدُوا۟ — ey insanlar, kulluk edin
- `2:104:1-3` يَـٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوا۟ — ey iman edenler
- `2:40:1-3` يَـٰبَنِىٓ إِسْرَٰٓءِيلَ ٱذْكُرُوا۟ — ey İsrailoğulları, hatırlayın
- `2:201:4-5` رَبَّنَآ ءَاتِنَا — Rabbimiz, bize ver

**Şablonlar**

- g18-k1 · Ek çöz: Kelimeyi parçalarına ayır.
- g18-k2 · Kelime dizme: 'ey iman edenler' parçasını diz.
- g18-k3 · Parça çevir: Doğru çeviri hangisi?

## g19 · Ünite 10 · Yapan ve yapılan: kâtib, mektûb

- **Terimsiz:** Fiilden 'yapan' ve 'yapılan' kelimeleri türer: kâtib (yazan), mektûb (yazılan). Türkçedeki 'kâtip, mektup, âlim, malûm, zalim, mazlum' buradan gelir.
- **Terimli** (görünür): İsm-i fâil (I. babda fâ'il; mezid babda mu-…-i-) ve ism-i mef'ûl (I. babda mef'ûl; mezid babda mu-…-a-).
- Fâ'il kalıbı 'yapan', mef'ûl kalıbı 'yapılan' demektir.
- Mezid babda tek fark bir sesli harftir: mürsil (gönderen) / mürsel (gönderilen).

**Aynı kökten yapan ve yapılan**

| Kök ve anlam | Yapan (fâil) | Yapılan (mef'ûl) |
|---|---|---|
| yazmak | كَاتِبٌۢ [2:282:13] | مَكْتُوبًا [7:157:8] |
| bilmek | عَـٰلِمُ [6:73:19] | مَّعْلُومٌ [15:4:8] |
| zulmetmek | ظَالِم | مَظْلُومًا [17:33:11] |
| göndermek (IV) | مُرْسِلِينَ [28:45:18] | مُّرْسَل |

**Örnekler**

- `1:7:5-7` غَيْرِ ٱلْمَغْضُوبِ عَلَيْهِمْ — gazaba uğramış olanların değil
- `2:19:17-19` وَٱللَّهُ مُحِيطٌۢ بِٱلْكَـٰفِرِينَ — Allah inkârcıları kuşatandır
- `2:35:16-18` فَتَكُونَا مِنَ ٱلظَّـٰلِمِينَ — yoksa ikiniz de zalimlerden olursunuz

**Şablonlar**

- g19-k1 · Kök bul: Bu kelimenin kökü hangisi?
- g19-k2 · Kalıp eşle: Aynı kökten üç kelimeyi anlamlarıyla eşleştir.
- g19-k3 · Anlam seç: Bu kelime ne demek?
- g19-k4 · Parça çevir: Doğru çeviri hangisi?

## g20 · Ünite 10 · Fiilin adı: bilme, anma, inanma

- **Terimsiz:** Fiilin adı (yapma, bilme) da kökten türer: alime (bildi) → ilm (bilme, bilgi); zekera (andı) → zikr (anma).
- **Terimli** (görünür): Masdar: fiilin isim hâli; I. babda semâî (ezberlenir), mezid babda kıyâsî (tef'îl, if'âl, istif'âl).
- Türkçedeki 'ilim, zikir, küfür, iman, rahmet, halk' birer masdardır.
- IV. bab masdarı if'âl kalıbındadır: âmene → îmân, enzele → inzâl.

**Fiil ve adı**

| Türkçesi | Fiil | Masdar |
|---|---|---|
| ilim | عَلِمَ | عِلْم |
| zikir | ذَكَرَ | ذِكْر |
| küfür | كَفَرَ | كُفْر |
| iman | ءَامَنَ | إِيمَٰن |
| rahmet | رَّحِمَ | رَحْمَة |
| yaratma (halk) | خَلَقَ | خَلْق |

**Örnekler**

- `1:2:1-2` ٱلْحَمْدُ لِلَّهِ — övgü Allah'a aittir
- `2:32:3-5` لَا عِلْمَ لَنَآ — bizim hiçbir bilgimiz yok
- `2:108:11-14` وَمَن يَتَبَدَّلِ ٱلْكُفْرَ بِٱلْإِيمَـٰنِ — kim inkârı imanla değiştirirse

**Şablonlar**

- g20-k1 · Kalıp eşle: Fiili, adını ve türemiş fiili eşleştir.
- g20-k2 · Anlam seç: Bu kelime ne demek?
- g20-k3 · Parça çevir: Doğru çeviri hangisi?

## g21 · Ünite 11 · Kalıp değişince anlam kayar: ilim → talim

- **Terimsiz:** Aynı kök kalıbı değişince anlamını kaydırır: alime (bildi) → allema (öğretti); nezele (indi) → enzele (indirdi); gafere (bağışladı) → istagfere (bağışlanma diledi). Türkçedeki 'ilim → talim → muallim' zinciri bunu gösterir.
- **Terimli** (görünür): Mezîd bablar: II (fa''ale: ettirgenlik, yoğunluk), IV (ef'ale: ettirgenlik), V (tefa''ale: dönüşlülük), X (istef'ale: isteme, sayma).
- II ve IV. bab çoğu zaman 'yaptırmak' anlamı verir: bildi → bildirdi (öğretti).
- X. bab çoğu zaman 'istemek' anlamı verir: bağışladı → bağışlanma diledi.

**Kök fiil ve türemiş bab**

| Kök anlamı | I. bab | Türemiş bab | Kayma |
|---|---|---|---|
| bilmek | عَلِمَ | عَلَّمَ | II: öğretti |
| inmek | نَزَلَ [17:105:4] | أَنزَلَ | IV: indirdi |
| bağışlamak | غَفَرَ | ٱسْتَغْفَرَ | X: bağışlanma diledi |
| güvende olmak | أَمِنَ | ءَامَنَ | IV: iman etti, güvence verdi |
| yalan söylemek | كَذَبَ [39:32:4] | كَذَّبَ | II: yalanladı |
| anmak | ذَكَرَ | تَذَكَّرَ | V: öğüt aldı |

**Örnekler**

- `2:31:1-3` وَعَلَّمَ ءَادَمَ ٱلْأَسْمَآءَ — ve Âdem'e isimleri öğretti
- `2:4:3-5` بِمَآ أُنزِلَ إِلَيْكَ — sana indirilene
- `3:135:10-11` فَٱسْتَغْفَرُوا۟ لِذُنُوبِهِمْ — günahları için bağışlanma dilediler

**Şablonlar**

- g21-k1 · Kalıp eşle: Aynı kökten üç kelimeyi anlamlarıyla eşleştir.
- g21-k2 · Kök bul: Bu fiilin kökü hangisi?
- g21-k3 · Anlam seç: Bu fiil ne demek?
- g21-k4 · Parça çevir: Doğru çeviri hangisi?

## g22 · Ünite 12 · 'Eğer', '-ınca', '-seydi'

- **Terimsiz:** 'Eğer … -se' için in, '-dığı zaman' için izâ, '-seydi (ama olmadı)' için lev kullanılır; cevap çoğunlukla 'fe' ile başlar.
- **Terimli** (görünür): Şart edatları: in (ihtimal), izâ (gerçekleşecek zaman), lev (imtinâ), levlâ (olmasaydı), lemmâ (geçmişte -ınca), men (şart ismi); cevâb-ı şart fâ ile bağlanır.
- Lev ile kurulan cümle gerçekleşmemiş bir şeyi anlatır: 'Allah dileseydi giderirdi.'
- Men şart ismi de olur: 'kim hidayetime uyarsa …'.

**Şart kelimeleri**

| Kelime | Arapça | Anlam |
|---|---|---|
| in | إِن | eğer |
| izâ | إِذَا | -dığı zaman |
| lev | لَو | -seydi (olmadı) |
| levlâ | لَوْلَآ | … olmasaydı |
| lemmâ | لَمَّا | -ınca (geçmiş) |

**Örnekler**

- `2:23:1-4` وَإِن كُنتُمْ فِى رَيْبٍ — eğer bir şüphe içindeyseniz
- `2:11:1-3` وَإِذَا قِيلَ لَهُمْ — onlara denildiği zaman
- `2:20:14-17` وَلَوْ شَآءَ ٱللَّهُ لَذَهَبَ — Allah dileseydi giderirdi
- `2:38:9-11` فَمَن تَبِعَ هُدَاىَ — kim hidayetime uyarsa

**Şablonlar**

- g22-k1 · Anlam seç: Bu kelime ne demek?
- g22-k2 · Kelime dizme: Parçayı diz.
- g22-k3 · Parça çevir: Doğru çeviri hangisi?

## g23 · Ünite 12 · Cümleye zaman rengi veren fiiller: kâne, leyse, asbaha

- **Terimsiz:** Bazı fiiller cümleye zaman ve durum rengi verir: kâne (idi), leyse (değildir), asbaha (… hâline geldi).
- **Terimli** (görünür): Nevâsıh: kâne ve kardeşleri (leyse, asbaha, zalle, sâra …) ismi merfû, haberi mansûb okutur.
- Leyse, isim cümlesini olumsuz yapar: 'onlar bir şey üzerinde değil'.
- Asbaha 'sabahladı' kökünden gelir ama çoğu zaman 'oldu, hâline geldi' demektir.

**Kâne ve kardeşleri**

| Fiil | Arapça | Anlam |
|---|---|---|
| kâne | كَانَ | idi, oldu |
| leyse | لَّيْسَ | değildir |
| leyset (dişil) | لَيْسَتِ [2:113:3] | değildir |
| asbaha | أَصْبَحَ | … hâline geldi |

**Örnekler**

- `2:113:1-6` وَقَالَتِ ٱلْيَهُودُ لَيْسَتِ ٱلنَّصَـٰرَىٰ عَلَىٰ شَىْءٍ — Yahudiler dedi: Hristiyanlar bir şey üzerinde değil
- `3:103:17-19` فَأَصْبَحْتُم بِنِعْمَتِهِۦٓ إِخْوَٰنًا — nimetiyle kardeşler oldunuz
- `2:10:10-12` بِمَا كَانُوا۟ يَكْذِبُونَ — yalan söyleyip durduklarından dolayı

**Şablonlar**

- g23-k1 · Anlam seç: Bu kelime ne demek?
- g23-k2 · Kelime dizme: 'nimetiyle kardeşler oldunuz' parçasını diz.
- g23-k3 · Parça çevir: Doğru çeviri hangisi?

## g24 · Ünite 12 · Kur'an'ın sık kalıpları

- **Terimsiz:** Bazı söz kalıpları Kur'an'da defalarca tekrarlanır; kalıbı tanıyınca cümleyi hemen anlarsın.
- **Terimli** (görünür): Sık kalıplar: inna'llâhe alâ kulli şey'in kadîr; inna'llâhe gafûrun rahîm; ve mâ … illâ … (kasr); ve ma'llâhu bi-gâfilin ammâ ta'melûn.
- Kalıbın anahtar kelimesini tanımak yeter: kadîr, gafûr, gâfil.
- Mâ … illâ … = 'yalnızca, sadece'.

**Kalıplar ve anahtar kelimeleri**

| Kalıp | Anahtar kelime | Anlam |
|---|---|---|
| her şeye gücü yeter | قَدِيرٌ [2:20:25] | gücü yeten |
| bağışlayan, merhametli | غَفُورٌ [2:173:24] | çok bağışlayan |
| yalnızca (mâ … illâ) | إِلَّا [3:144:3] | ancak |
| habersiz değildir | بِغَـٰفِلٍ [2:74:35] | habersiz |

**Örnekler**

- `2:20:20-25` إِنَّ ٱللَّهَ عَلَىٰ كُلِّ شَىْءٍ قَدِيرٌ — şüphesiz Allah her şeye gücü yetendir
- `2:173:22-25` إِنَّ ٱللَّهَ غَفُورٌ رَّحِيمٌ — şüphesiz Allah çok bağışlayan, çok merhametlidir
- `3:144:1-4` وَمَا مُحَمَّدٌ إِلَّا رَسُولٌ — Muhammed ancak bir elçidir
- `2:74:33-37` وَمَا ٱللَّهُ بِغَـٰفِلٍ عَمَّا تَعْمَلُونَ — Allah yaptıklarınızdan habersiz değildir

**Şablonlar**

- g24-k1 · Parça çevir: Doğru çeviri hangisi?
- g24-k2 · Kelime dizme: Kalıbı diz.
- g24-k3 · Anlam seç: Kalıbın bu anahtar kelimesi ne demek?

## unit11 · Türkçedeki akrabalar (R-A8)

| kök | Türkçe türevler (kalıp) |
|---|---|
| علم | ilim = masdar (fi'l) · âlim = ism-i fâil (fâ'il) · malûm = ism-i mef'ûl (mef'ûl) · talim = masdar (tef'îl, II) · muallim = ism-i fâil (mufa''il, II) |
| كتب | kitap = masdar (fi'âl) · kâtip = ism-i fâil (fâ'il) · mektup = ism-i mef'ûl (mef'ûl) · mektep = ism-i mekân (mef'al) |
| رحم | rahmet = masdar (fa'le) · merhamet = masdar (mef'ale, mîmî) · rahim = sıfat-ı müşebbehe (fa'îl) · merhum = ism-i mef'ûl (mef'ûl) |
| سلم | selam = masdar (fa'âl) · selamet = masdar (fa'âle) · İslam = masdar (if'âl, IV) · müslim = ism-i fâil (muf'il, IV) · teslim = masdar (tef'îl, II) |
| حكم | hüküm = masdar (fu'l) · hâkim = ism-i fâil (fâ'il) · hikmet = câmid isim (fi'le) · mahkeme = ism-i mekân (mef'ale) · muhakeme = masdar (mufâ'ale, III) |
| عبد | ibadet = masdar (fi'âle) · âbit = ism-i fâil (fâ'il) · mabet = ism-i mekân (mef'al) · mabut = ism-i mef'ûl (mef'ûl) |
| قول | kavil = masdar (fa'l) · makale = masdar (mef'ale, mîmî) |
| نزل | nüzul = masdar (fu'ûl) · inzal = masdar (if'âl, IV) · tenzil = masdar (tef'îl, II) · menzil = ism-i mekân (mef'il) |
| غفر | mağfiret = masdar (mef'ile, mîmî) · istiğfar = masdar (istif'âl, X) · gafur = mübalağa (fa'ûl) |
| كفر | küfür = masdar (fu'l) · kâfir = ism-i fâil (fâ'il) · kefaret = mübalağa (fa''âle) · tekfir = masdar (tef'îl, II) |
| امن | iman = masdar (if'âl, IV) · mümin = ism-i fâil (muf'il, IV) · emin = sıfat-ı müşebbehe (fa'îl) · emanet = masdar (fa'âle) |
| ذكر | zikir = masdar (fi'l) · tezkere = masdar (tef'ile, II) · müzakere = masdar (mufâ'ale, III) |
| حمد | hamt = masdar (fa'l) · Ahmet = ism-i tafdîl (ef'al) · Muhammet = ism-i mef'ûl (mufa''al, II) · Mahmut = ism-i mef'ûl (mef'ûl) |
| خلق | halk = masdar (fa'l) · mahluk = ism-i mef'ûl (mef'ûl) · halik = ism-i fâil (fâ'il) · ahlak = çoğul (ef'âl) |
| رسل | resul = sıfat-ı müşebbehe (fa'ûl) · risale = masdar (fi'âle) · irsal = masdar (if'âl, IV) · mürsel = ism-i mef'ûl (muf'al, IV) |
| حقق | hak = masdar (fa'l) · hakikat = câmid isim (fa'île) · tahkik = masdar (tef'îl, II) · muhakkak = ism-i mef'ûl (mufa''al, II) |
| صدق | sıdk = masdar (fi'l) · sadık = ism-i fâil (fâ'il) · sadaka = câmid isim (fa'ale) · tasdik = masdar (tef'îl, II) |
| شهد | şahit = ism-i fâil (fâ'il) · şahadet = masdar (fa'âle) · şehit = sıfat-ı müşebbehe (fa'îl) · müşahede = masdar (mufâ'ale, III) |
| صبر | sabır = masdar (fa'l) · sabur = mübalağa (fa'ûl) |
| شكر | şükür = masdar (fu'l) · şakir = ism-i fâil (fâ'il) · teşekkür = masdar (tefe''ul, V) |
| عمل | amel = masdar (fa'al) · amil = ism-i fâil (fâ'il) · amele = çoğul (fa'ale) · muamele = masdar (mufâ'ale, III) |
| قدر | kudret = masdar (fu'le) · kader = masdar (fa'al) · kadir = ism-i fâil (fâ'il) · takdir = masdar (tef'îl, II) · mukadder = ism-i mef'ûl (mufa''al, II) |
| خير | hayır = câmid isim (fa'l) · ihtiyar = masdar (ifti'âl, VIII) |
| ظلم | zulüm = masdar (fu'l) · zalim = ism-i fâil (fâ'il) · mazlum = ism-i mef'ûl (mef'ûl) · zulmet = câmid isim (fu'le) |
| حسن | hüsün = masdar (fu'l) · ihsan = masdar (if'âl, IV) · muhsin = ism-i fâil (muf'il, IV) · tahsin = masdar (tef'îl, II) · ahsen = ism-i tafdîl (ef'al) |
| قتل | katil = ism-i fâil (fâ'il) · maktul = ism-i mef'ûl (mef'ûl) · kıtal = masdar (fi'âl, III) · mukatele = masdar (mufâ'ale, III) |
| فسد | fesat = masdar (fa'âl) · müfsit = ism-i fâil (muf'il, IV) |
| صلح | salih = ism-i fâil (fâ'il) · sulh = masdar (fu'l) · ıslah = masdar (if'âl, IV) · maslahat = masdar (mef'ale, mîmî) |
| جهد | cihat = masdar (fi'âl, III) · mücahit = ism-i fâil (mufâ'il, III) · içtihat = masdar (ifti'âl, VIII) |
| نفق | infak = masdar (if'âl, IV) · nafaka = câmid isim (fa'ale) · nifak = masdar (fi'âl, III) · münafık = ism-i fâil (mufâ'il, III) |
| رزق | rızık = masdar (fi'l) · rezzak = mübalağa (fa''âl) |
| دخل | duhul = masdar (fu'ûl) · dahil = ism-i fâil (fâ'il) · ithal = masdar (if'âl, IV) · müdahale = masdar (mufâ'ale, III) |
| خرج | huruç = masdar (fu'ûl) · hariç = ism-i fâil (fâ'il) · ihraç = masdar (if'âl, IV) · mahreç = ism-i mekân (mef'al) |
| جمع | cami = ism-i fâil (fâ'il) · cemaat = câmid isim (fa'âle) · mecmua = ism-i mef'ûl (mef'ûl) |
| حيي | hayat = masdar (fa'ale) · ihya = masdar (if'âl, IV) · hayvan = câmid isim (fa'alân) |
| موت | mevt = masdar (fa'l) · memat = masdar (mef'al, mîmî) · meyyit = sıfat-ı müşebbehe (fay'il) |
| نور | nur = câmid isim (fu'l) · tenvir = masdar (tef'îl, II) · münevver = ism-i mef'ûl (mufa''al, II) |
| هدي | hidayet = masdar (fi'âle) · hediye = câmid isim (fa'île) · mühtedi = ism-i fâil (müfte'il, VIII) |
| ضلل | dalalet = masdar (fa'âle) · idlal = masdar (if'âl, IV) |
| فضل | fazilet = câmid isim (fa'île) · fazla = masdar (fa'l) |
| قوم | kıyam = masdar (fi'âl) · kıyamet = masdar (fi'âle) · ikamet = masdar (if'âl, IV) · istikamet = masdar (istif'âl, X) · makam = ism-i mekân (mef'al) |
| حبب | muhabbet = masdar (mef'ale, mîmî) · habip = sıfat-ı müşebbehe (fa'îl) · mahbup = ism-i mef'ûl (mef'ûl) |
| حرم | haram = sıfat-ı müşebbehe (fa'âl) · harem = câmid isim (fa'al) · ihram = masdar (if'âl, IV) · mahrem = câmid isim (mef'al) |
| حلل | helal = sıfat-ı müşebbehe (fa'âl) · hal = masdar (fa'l) · mahal = ism-i mekân (mef'al) · tahlil = masdar (tef'îl, II) |
| امر | emir = masdar (fa'l) · amir = ism-i fâil (fâ'il) · memur = ism-i mef'ûl (mef'ûl) |
| خلف | halef = câmid isim (fa'al) · halife = câmid isim (fa'île) · ihtilaf = masdar (ifti'âl, VIII) · muhalif = ism-i fâil (mufâ'il, III) |
| قلب | kalp = câmid isim (fa'l) · inkılap = masdar (infi'âl, VII) |
| شرك | şirk = masdar (fi'l) · şerik = sıfat-ı müşebbehe (fa'îl) · şirket = câmid isim (fi'le) · müşrik = ism-i fâil (muf'il, IV) · iştirak = masdar (ifti'âl, VIII) |
| كبر | kibir = masdar (fi'l) · kebir = sıfat-ı müşebbehe (fa'îl) · ekber = ism-i tafdîl (ef'al) · tekbir = masdar (tef'îl, II) · mütekebbir = ism-i fâil (mutefa''il, V) |
| عهد | ahit = masdar (fa'l) · taahhüt = masdar (tefe''ul, V) · müteahhit = ism-i fâil (mutefa''il, V) |
| حسب | hesap = masdar (fi'âl, III) · muhasebe = masdar (mufâ'ale, III) |
| نعم | nimet = câmid isim (fi'le) · inam = masdar (if'âl, IV) |
| برك | bereket = câmid isim (fa'ale) · mübarek = ism-i mef'ûl (mufâ'al, III) · tebrik = masdar (tef'îl, II) |
| سجد | secde = masdar (fa'le) · mescit = ism-i mekân (mef'il) |
| سبح | tesbih = masdar (tef'îl, II) · tesbihat = çoğul (tef'îlât) |
| كون | kâinat = çoğul (fâ'ilât) · mekân = ism-i mekân (mef'al) |
| بعث | bais = ism-i fâil (fâ'il) · mebus = ism-i mef'ûl (mef'ûl) |
| نظر | nazar = masdar (fa'al) · nazır = ism-i fâil (fâ'il) · manzara = ism-i mekân (mef'ale) · münazara = masdar (mufâ'ale, III) |
| عرف | irfan = masdar (fi'lân) · marifet = masdar (mef'ile, mîmî) · arif = ism-i fâil (fâ'il) · maruf = ism-i mef'ûl (mef'ûl) · tarif = masdar (tef'îl, II) |
| عزز | aziz = sıfat-ı müşebbehe (fa'îl) · izzet = masdar (fi'le) · muazzez = ism-i mef'ûl (mufa''al, II) |
| نصر | nusret = masdar (fu'le) · ensar = çoğul (ef'âl) |
| صدر | masdar = ism-i mekân (mef'al) · sadır = ism-i fâil (fâ'il) |
| خبر | haber = câmid isim (fa'al) · ihbar = masdar (if'âl, IV) · muhbir = ism-i fâil (muf'il, IV) · muhabere = masdar (mufâ'ale, III) |
| نفع | menfaat = masdar (mef'ale, mîmî) · intifa = masdar (ifti'âl, VIII) |
| وكل | vekil = sıfat-ı müşebbehe (fa'îl) · tevekkül = masdar (tefe''ul, V) · müvekkil = ism-i fâil (mufa''il, II) |
| حمل | hamal = mübalağa (fa''âl) · hamile = ism-i fâil (fâ'ile) · tahammül = masdar (tefe''ul, V) |
| قرب | akraba = çoğul (ef'ilâ) · takriben = masdar (tef'îl, II) |
| فسق | fısk = masdar (fi'l) · fasık = ism-i fâil (fâ'il) |
| قسم | kasem = masdar (fa'al) · kısım = câmid isim (fi'l) · taksim = masdar (tef'îl, II) |
| حدث | hadis = câmid isim (fa'îl) · hadise = câmid isim (fa'île) · muhaddis = ism-i fâil (mufa''il, II) |
| عقد | akit = masdar (fa'l) · akide = câmid isim (fa'île) · ukde = câmid isim (fu'le) |
| عقب | akıbet = ism-i fâil (fâ'ile) · ukubet = masdar (fu'ûle) · takip = masdar (tef'îl, II) · müteakip = ism-i fâil (mutefâ'il, VI) |
| عدد | adet = masdar (fa'al) · istidat = masdar (istif'âl, X) |
