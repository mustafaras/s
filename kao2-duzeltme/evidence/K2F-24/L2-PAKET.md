# K2F-24 ek tur — L2 inceleme paketi (gerçek alan uzmanı için)

> **Bu paket bir ONAY DEĞİLDİR.** Yapay zekâ (Claude) hazırladı; hiçbir kutu işaretlenmedi, hiçbir `expert` düzeyi yazılmadı. Karar kullanıcıdadır (ya da kullanıcının getireceği alan uzmanında).
> Arapça içermez: kelimeler kimlik + okunuş + Türkçe anlamla anılır. Bakış sırasında uygulamadaki/araçtaki Arapça metne ilgili dosyadan bakılır.

## Nasıl kullanılır (tek oturum)

1. Bölüm A–B’yi sırayla oku; her satırdaki **Soru**’ya evet/hayır/düzeltme yaz (bu dosyada ya da yanıt olarak).
2. Uzman “uygun” derse: ilgili inceleme sayfasında L2 kutusunu `[x]` yap (bölüm B). Eşleme düzeltmesi (bölüm A) araç kuralı/sözlük değişikliği gerektirir → yeni bir kapsam onayıyla ele alınır; elle eşleme tablosu yazılmaz.
3. Bitince şunu yaz: **“L2 işaretlendi”** (ya da hangi maddelerin reddedildiğini listele). Yanıt yoksa kapı kapanmaz.

## A. Namaz metni ↔ sözlük lemması eşlemesi

Dosya: `docs/kuran-ogreniyorum/kao2/inceleme/NAMAZ-ESLEME-L2.md` (araç çıktısı) · veri: `docs/kuran-ogreniyorum/kao2/content/prayer-lemma-map.json` · metinler: `QuranShortSurahsV1.prayerTexts` (tekbir, subhaneke, fatiha, zamm_sure, ruku, secde, tahiyyat, selam).

Toplam 32 benzersiz namaz kelimesi: **19 eşlendi**, **13 eşlenmedi**. Eşlenmeyenler uygulamada “açık” görünür; hiçbir lemmaya bağlı değildir.

### A1. Eşlenmeyen kelimeler — hangisi bağlanmalı, hangisi lemma ister?

| Kimlik | Okunuş | Anlam | Metin | Neden eşlenmedi | Uzmana soru |
|---|---|---|---|---|---|
| lp_1673d5aec4 | va-taʿâlâ | yücedir | subhaneke | fiil; sözlükte lemması yok | Okunuş/anlam (“yücedir”) doğru mu? Bu fiil için ders sözlüğüne lemma eklenmeli mi? |
| lp_436fccf6c0 | al-tahiyyâtu | hürmetler | tahiyyat | müennes çoğul; tekil lemması sözlükte yok | Anlam (“hürmetler”) doğru mu? Tekil lemma (tahiyye) eklenmeli mi? |
| lp_692bba530a | li-lahi | Allah içindir | tahiyyat | birleşik yazım (li + Allah); lemma var (l_ll_ah_d0a09b) ama yazım kuralı tek kelimelik | Bu kelime Allah lemmasına bağlanabilir mi? |
| lp_6e8c2964fc | va-al-salavâtu | dualar | tahiyyat | kırık/müennes çoğul; tekil lemma sözlükte var (l_Salaw_p_7f701a) ama ek ayıklamayla üretilemez | Bu kelime salât lemmasına bağlanabilir mi? Evetse hangi lemma? |
| lp_98e5be5669 | ʿibâdi | kullarının | tahiyyat | kırık çoğul (kul); tekil lemma var (l_Eabod_3558c0) ama ek ayıklamayla üretilemez | “kullarının” ifadesi kul lemmasına (ismî) bağlanabilir mi? (Fiil “kulluk etti” lemmasına bağlanmamalı.) |
| lp_b1bf6df603 | va-tabâraka | bereketlidir | subhaneke | fiil; sözlükte lemması yok | Okunuş/anlam (“bereketlidir”) doğru mu? Lemma eklenmeli mi? |
| lp_c7d096cadc | ʿabduhu | kuludur | tahiyyat | İKİ ADAY: kul (isim) / kulluk etti (fiil) — belirsiz; eşleme bilerek YOK | “kuludur” için doğru lemma hangisi? (Beklenen: isim; kesin karar uzmandan.) |
| lp_ccce7cf12f | al-aʿlâ | en yüce | secde | elatif (en yüce); lemma sözlükte yok | Anlam (“en yüce”) doğru mu? Lemma eklenmeli mi? |
| lp_d9d03c781d | va-aşhadu | ve şahitlik ederim | tahiyyat | fiil 1. tekil (“şahitlik ederim”); lemma var (l_ahida_de36bb) ama e- önekli kalıp elatifle karışır → kural eklenmedi | Bu kelime “tanık oldu, şahit oldu” fiil lemmasının bir biçimi midir, o lemmaya bağlanabilir mi? |
| lp_db3e429022 | aşhadu | şahitlik ederim | tahiyyat | fiil 1. tekil (“şahitlik ederim”); lemma var (l_ahida_de36bb) ama e- önekli kalıp elatifle karışır → kural eklenmedi | Bu kelime “tanık oldu, şahit oldu” fiil lemmasının bir biçimi midir, o lemmaya bağlanabilir mi? |
| lp_f0473a3990 | allahumma | Allahım | subhaneke | nidâ biçimi (Allah + m); lemma var (l_ll_ah_d0a09b) ama kural tek kelimelik | Bu kelime Allah lemmasına bağlanabilir mi? |
| lp_f5843446b4 | cadduka | şanın | subhaneke | lemma sözlükte yok | Anlam (“şanın”) doğru mu? Lemma eklenmeli mi? |
| lp_f70c1a5dcf | muhammaden | Muhammed | tahiyyat | özel ad; sözlükte yok | Okunuş/anlam doğru mu? Özel ad lemması gerekli mi? |

### A2. Eşlenen kelimeler — eşleme anlamca doğru mu?

Kural: harekesiz iskelet + yaygın önek/zamir eki (+ düzenli çoğul) ayıklanmış tam eşitlik, tek aday. Her satır için soru: **Bu namaz kelimesi gösterilen sözlük lemmasının bir biçimi midir?**

| Kimlik | Okunuş | Anlam | Hedef lemma | Lemma anlamı | Metin |
|---|---|---|---|---|---|
| lp_060fad1342 | va-bi-hamdika | hamdinle | l_Hamod_98138a | övgü ve şükür | subhaneke |
| lp_10bcd8764a | ismuka | adın | l_som_585f33 | ad, isim | subhaneke |
| lp_25704375a0 | ʿalayka | senin üzerine | l_EalaY_f79ef3 | üzerine, üstünde / -e karşı; aleyhine | tahiyyat |
| lp_31fee142df | ʿalaynâ | bizim üzerimize | l_EalaY_f79ef3 | üzerine, üstünde / -e karşı; aleyhine | tahiyyat |
| lp_5cfe478ddb | subhânaka | seni tenzih ederim | l_suboHa_n_59533b | her eksikten uzak (tenzih) / tesbih | subhaneke |
| lp_67dad87faf | ʿalaykum | üzerinize | l_EalaY_f79ef3 | üzerine, üstünde / -e karşı; aleyhine | selam |
| lp_6cc3dd4445 | va-rahmetu | rahmeti | l_raHomap_490a24 | merhamet, acıma / lütuf, iyilik | tahiyyat, selam |
| lp_779a7fd410 | va-al-tayyibâtu | güzel sözler | l_Tay_iba_t_e6ca86 | temiz, helal ve hoş şeyler | tahiyyat |
| lp_79cb46c8fc | al-sâlihîna | salihlerin | l_Sa_liH_30bb88 | iyi, düzgün (iş/kişi) | tahiyyat |
| lp_7ae90ff4c5 | rabbiya | Rabbimi | l_rab_fc2490 | terbiye edip yöneten Rab / sahip, efendi | ruku, secde |
| lp_7cb56720c0 | al-salâmu | selam | l_sala_m_daff0b | esenlik, barış / selamlama | tahiyyat, selam |
| lp_820672c615 | subhâna | tenzih ederim | l_suboHa_n_59533b | her eksikten uzak (tenzih) / tesbih | ruku, secde |
| lp_832ee02139 | va-barakâtuhu | bereketleri | l_baraka_t_188a75 | bereketler, bolluklar | tahiyyat |
| lp_99236de03d | va-ʿalâ | ve üzerine | l_EalaY_f79ef3 | üzerine, üstünde / -e karşı; aleyhine | tahiyyat |
| lp_999a97b04a | va-lâ | ve yoktur | l_laA_4e2bfd | hayır; yok / -me, -ma (olumsuz / yasak) | subhaneke |
| lp_99f327d450 | al-nabiyyu | peygamber | l_n_abiY_e09f3b | haber getiren peygamber | tahiyyat |
| lp_cd25a85435 | va-rasûluhu | elçisidir | l_rasuwl_9a5606 | elçi / peygamber | tahiyyat |
| lp_e3ae18f2ca | gayruka | senden başka | l_gayor_6b16f9 | başka, -den gayrı / -sız, değil | subhaneke |
| lp_e5958c3b77 | al-ʿazîmi | yüce | l_EaZiym_93f908 | büyük, azametli | ruku |

## B. Dinî bağlamlı ünite ve ders metinleri

Seçim ölçütü: Ünite 1–3 dersleri her zaman; diğerleri için aracın dinî-bağlam deseni (`RELIGIOUS`, `tools/kao2-curriculum-build.mjs`) metinde geçiyor. Uzman listeye madde ekleyebilir/çıkarabilir.

### B1. Ünite metinleri (vaat + “neden önemli”)

Dosya: `docs/kuran-ogreniyorum/kao2/inceleme/INCELEME-KAO2-17.md  → “Üniteler” bölümü, her ünitenin ikinci kutusu (L2)`. Soru: Dinî ifade doğru, saygılı ve kaynağıyla uyumlu mu? (kutu: ünite satırındaki ikinci kutu)

| Kimlik | Başlık | Mevcut düzey |
|---|---|---|
| u1 | Fâtiha | sourced · kaynak: surah-theme, lexicon-meanings |
| u2 | Namazın cümleleri | sourced · kaynak: lexicon-meanings |
| u3 | Üç kısa sûre | sourced · kaynak: surah-theme, lexicon-meanings |
| u4 | Kur'an'ın tutkalı | sourced · kaynak: grammar-plain |
| u5 | Bu, şu, kim, ne | sourced · kaynak: grammar-plain |
| u6 | Gök, yer ve insan | sourced · kaynak: lexicon-meanings |
| u7 | Oldu, yaptı | sourced · kaynak: grammar-plain |
| u9 | Yap, ver, bağışla | sourced · kaynak: grammar-plain |

### B2. Ders metinleri

Dosya: `docs/kuran-ogreniyorum/kao2/inceleme/INCELEME-KAO2-17.md  → “Dersler” tabloları (tek “onay” kutusu; L1/L2 ayrımı yok — uzman onayı bu kutuya işlenirse L1 ile karışır, ayrım sende)`. Soru: Başlık/hedef/anlatım dinen doğru ve uygun mu?

| Kimlik | Başlık | Mevcut düzey |
|---|---|---|
| u01.01 | Besmele | sourced |
| u01.02 | Rahîm ve Hamd | sourced |
| u01.03 | Yalnız sana | sourced |
| u01.04 | Doğru yol | sourced |
| u01.05 | Gazaba uğrayanlar değil | sourced |
| u02.01 | Büyüklük ve tek ilah | sourced |
| u02.02 | Tenzih, selâm ve bereket | sourced |
| u02.03 | Namazda ne diyorum | sourced |
| u03.01 | Kelime sonundaki ekler | sourced |
| u03.02 | Sığınma ve sabah aydınlığı | sourced |
| u03.03 | Yaratmak ve gece | sourced |
| u03.04 | Düğümlere üfleyenler | sourced |
| u03.05 | Kıskançlık ve vesvese | sourced |
| u03.06 | Üç sûreyi birlikte okuma | sourced |
| u05.02 | Soru kelimeleri | sourced |
| u06.04 | Âyet ve işaret | sourced |
| u06.05 | Musa ve halkı | sourced |
| u06.09 | Peygamber ve Firavun | sourced |
| u06.17 | Nuh ve ışık | sourced |
| u06.24 | Ay ve Yusuf | sourced |
| u06.26 | İsa ve dil | sourced |
| u07.09 | Tuzak ve yükseltmek | sourced |
| u09.06 | Göstermek ve dayanmak | sourced |
| u09.09 | Kurtuluş ve çaba | sourced |
| u09.10 | Vefat ve kurtarmak | sourced |

### B3. Gramer kavramı metinleri (çözümlü örnek + hata açıklaması)

Dosya: `docs/kuran-ogreniyorum/kao2/inceleme/INCELEME-KAO2-18.md  → ilgili kavramın ikinci kutusu (L2)`. Soru: Örnekteki dinî içerik doğru mu?

| Kimlik | Başlık | Mevcut düzey |
|---|---|---|
| g0_5 | Fiil önce gelir | sourced |
| g7 | '-an, -en, ki o' bağları | sourced |
| g10 | '-dır' yazılmaz: isim cümlesi | sourced |
| g13 | Geçmiş zaman: yaptı, yaptılar, yaptım | sourced |
| g15 | Şimdiki ve geniş zaman: yapar, yapıyor | sourced |
| g17 | Emir: yap!, deyin! | sourced |
| g22 | 'Eğer', '-ınca', '-seydi' | sourced |

## C. Bu paketin kapsamadığı / dürüstçe açık olanlar

- Seçim: Ünite 1–3 dersleri (baştan dinî metin) + aracın dinî-bağlam deseni (`RELIGIOUS`) metinde geçen diğer ünite/ders/kavramlar. Desene takılmayan ama dinî bağlam taşıyan metin olabilir; uzman madde ekleyebilir.
- Mevcut `sourced` onayları kullanıcı devriyle yapay zekâ incelemesidir; bu paket onları **uzman onayına yükseltmez**.
- Telaffuz sesi (katman A kayıt), 20 `draft` sûre tanıtımı (KR-5) ve cihaz doğrulaması ayrı kapılardır.
