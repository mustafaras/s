# KAO2 — Müfredat eşlemesi (G2 incelemesi)

> Araç çıktısı: `node tools/kao2-curriculum-build.mjs` — elle düzenlemeyin; değişiklik `kaynak/kuran/kao2/curriculum.spec.json` üzerinden yapılır.
> Arapça, okunuş ve anlam `QuranLexiconV1` içerik modülünden kopyalanır. Metin durumu: 133 metin · draft 0 · sourced 133 · expert 0. Tüm başlık ve vaatler onaylıdır (`sourced`), uygulamada görünür.

## Özet

| Ünite | Seviye | Başlık | Ders | Kelime | Kavramlar | Çapa |
|---|---|---|---|---|---|---|
| 1 | 1 | Fâtiha | 5 | 23 | g0_5, g1, g2 | prayer:fatiha |
| 2 | 1 | Namazın cümleleri | 3 | 16 | g3, g4 | prayer:tekbir, prayer:subhaneke, prayer:ruku, prayer:secde, prayer:tahiyyat, prayer:selam |
| 3 | 1 | Üç kısa sûre | 6 | 28 | g5, g6 | surah:112, surah:113, surah:114 |
| 4 | 2 | Kur'an'ın tutkalı | 5 | 25 | g7, g8 | lemma-pool:edat-baglac |
| 5 | 2 | Bu, şu, kim, ne | 2 | 10 | g9, g10 | lemma-pool:isaret-soru |
| 6 | 2 | Gök, yer ve insan | 30 | 147 | g11, g12 | lemma-pool:isim |
| 7 | 3 | Oldu, yaptı | 9 | 42 | g13, g14 | lemma-pool:fiil-mazi |
| 8 | 3 | Yapar, yapıyor | 9 | 46 | g15, g16 | lemma-pool:fiil-muzari |
| 9 | 3 | Yap, ver, bağışla | 11 | 57 | g17, g18 | lemma-pool:fiil-emir |
| 10 | 4 | Bir kök, bir aile | 20 | 98 | g19, g20 | lemma-pool:kok-ailesi |
| 11 | 4 | Kalıplar | 6 | 21 | g21 | lemma-pool:kalip |
| 12 | 4 | Eğer ve zaman | 3 | 11 | g22, g23, g24 | lemma-pool:sart-zaman |

Toplam: 12 ünite · 109 ders · 524 lemma · Seviye 0: 12 ders.

## K2F-20 ile değişenler (G2 onaylı 2026-10-02)

26 ders değişti, 41 lemma başka derse taşındı. Ders kimlikleri, sıraları ve boyutları sabittir; Ünite 1–3 değişmedi. Tamamlanmış ders tamamlanmış kalır; derse sonradan taşınan ve tanışılmamış kelimeler sıradaki dersin planında tanıştırılır (A-6). Değişen derslerin başlık/hedef metinleri K2F-21'de yeniden yazılır.

| Ders | Başlık (eski metin) | Çıkan | Giren |
|---|---|---|---|
| u04.01 | Dikkat ve vurgu | man (`l_man_48b676`), summ (`l_vum_88b269`) | alâ (`l_alaA_121826`), favk (`l_fawoq_451ce1`) |
| u04.02 | O gün, her ve bazı | av (`l_aw_43116a`) | yavma'iz (`l_yawoma_i_367815`) |
| u04.03 | 'sonra', 'ile' ve 'veya' | laʿall (`l_laEal_7b9569`) | summ (`l_vum_88b269`) |
| u04.04 | 'ya da', 'ama' ve 'ise' | favk (`l_fawoq_451ce1`), alâ (`l_alaA_121826`) | immâ (`l_im_aA_986f60`), av (`l_aw_43116a`) |
| u04.05 | 'asla', 'sanki' ve 'umulur ki' | immâ (`l_im_aA_986f60`) | laʿall (`l_laEal_7b9569`) |
| u06.01 | Gök, yer ve işitme | kavm (`l_qawom_d51842`) | samʿ (`l_samoE_5d4faf`) |
| u06.07 | Mal, dost ve gece | aksar (`l_akovar_f7f01e`) | kufr (`l_kufor_1c9ee6`) |
| u06.20 | Topluluk ve kutsal | aşadd (`l_a_ad_4fecc8`) | kavm (`l_qawom_d51842`) |
| u07.01 | Geçmişte olanlar | ʿamila (`l_Eamila_50319c`) | ahalla (`l_aHal_a_bf74a4`) |
| u07.03 | İnanmak ve yapmak | faʿala (`l_faEala_b34da5`), nazara (`l_n_aZara_cdb6f4`), katala (`l_qatala_ae1dd2`) | anşa'a (`l_an_a_a_a1dde3`), aʿadda (`l_aEad_a_17540a`), ʿamila (`l_Eamila_50319c`) |
| u07.04 | Duymak ve girmek | sabara (`l_Sabara_34dfc2`) | balaga (`l_balaga_f89222`) |
| u07.06 | Şükretmek ve sahip olmak | balaga (`l_balaga_f89222`) | şâ'a (`l_aA_a_25c447`) |
| u07.09 | Tuzak ve yükseltmek | katama (`l_katama_166c72`) | hakka (`l_Haq_a_a024e5`) |
| u08.01 | Şimdiki ve geniş zaman | şâ'a (`l_aA_a_25c447`), attakâ (`l_t_aqaY_bc8006`) | katala (`l_qatala_ae1dd2`), sabara (`l_Sabara_34dfc2`) |
| u08.02 | Bulmak, bakmak ve sormak | daʿâ (`l_daEaA_f5ec67`), akala (`l_akala_0ec27c`) | nazara (`l_n_aZara_cdb6f4`), faʿala (`l_faEala_b34da5`) |
| u08.09 | Bağışlamak ve yürümek | hakka (`l_Haq_a_a024e5`) | katama (`l_katama_166c72`) |
| u09.01 | Anmak, yemek, vermek: fiil kökleri | arâda (`l_araAda_e67825`) | akala (`l_akala_0ec27c`) |
| u09.06 | Göstermek ve dayanmak | buşşira (`l_bu_ira_749280`) | arâda (`l_araAda_e67825`) |
| u09.07 | Açıklamak | aʿrada (`l_aEoraDa_78a3e1`) | aksamu (`l_aqosamu_a01a25`) |
| u09.11 | Çağırmak, sakınmak ve müjdelemek | aʿadda (`l_aEad_a_17540a`), ahalla (`l_aHal_a_bf74a4`), anşa'a (`l_an_a_a_a1dde3`), aksamu (`l_aqosamu_a01a25`) | daʿâ (`l_daEaA_f5ec67`), attakâ (`l_t_aqaY_bc8006`), buşşira (`l_bu_ira_749280`), aʿrada (`l_aEoraDa_78a3e1`) |
| u10.01 | Yapan ve yapılan | hakîm (`l_Hakiym_e62e6c`), hakama (`l_Hakama_763b9a`), hukm (`l_Hukom_5dd24a`), hikmet (`l_Hikomap_d90667`) | musammen (`l_m_usam_FY_24926e`), amina (`l_amina_0a79a6`), mu'minât (`l_m_u_omina_t_b9c5a2`), mukazzibîn (`l_m_uka_ibiyn_f66cdd`) |
| u10.03 | Daha iyi bilen ve daha çok | kufr (`l_kufor_1c9ee6`), amina (`l_amina_0a79a6`) | aksar (`l_akovar_f7f01e`), aşadd (`l_a_ad_4fecc8`) |
| u10.20 | Kök ailesi: hüküm ve hikmet | samʿ (`l_samoE_5d4faf`), mukazzibîn (`l_m_uka_ibiyn_f66cdd`), musammen (`l_m_usam_FY_24926e`) | hukm (`l_Hukom_5dd24a`), hikmet (`l_Hikomap_d90667`), hakama (`l_Hakama_763b9a`) |
| u11.03 | İman, iyilik ve diriltmek | aslaha (`l_aSolaHa_540483`) | hakîm (`l_Hakiym_e62e6c`) |
| u11.04 | Selâmlama ve ıslah | mu'minât (`l_m_u_omina_t_b9c5a2`) | aslaha (`l_aSolaHa_540483`) |
| u12.03 | Sık kalıplar | yavma'iz (`l_yawoma_i_367815`) | man (`l_man_48b676`) |

## G2 karar noktaları (kapıyla ölçülen kalan tutarsızlıklar)

- **u02.01, u02.02, u03.02** — Ünite 1–3 donmuş (K2F-20 kapsamı dışı). u02.01 (edat), u02.02 (zamir), u03.02 (olumsuzluk) başlıklarını taşıyacak lemma yok ya da başka ünitede.
  - K2F-21: başlık/hedef dersin gerçek kelimelerine göre yeniden yazılır (önerilen)
  - Ünite 1–3 de yeniden dağıtıma açılır (namaz çapası bozulur)
- **u04.01, u04.02** — Sözlükte 'ilgi bağı' (REL) yalnız 2 lemma (biri Ünite 1, biri Ünite 3), 'ancak' (EXP) yalnız 1 lemma (Ünite 2).
  - K2F-21: başlıklar mevcut kelimelere göre yeniden yazılır (önerilen)
  - Sözlük genişletilir (yeni lemma = yeni doğrulama, dondurulmuş modül + bütçe + yayın pini)
- **u07.02, u12.02** — Yardımcı fiil (kâne ve kardeşleri) sözlükte yalnız üç tane: kâna (Ünite 3'te, donuk), leyse (u08.03), asbaha (u09.08); sâre, bâte… yok. İki ders için en az 3'er yardımcı fiil gerekir, üç fiil ikisine yetmez. (K2F-21'de düzeltildi: önceki sunumda 'leyse yok' yazılmıştı.)
  - K2F-21: dersler kâna/asbaha'yı tek derste toplar, diğeri yeniden adlandırılır (önerilen)
  - Sözlük genişletilir (sâre, bâte, zalle)
- **u09.02** — 'Seslenme: ey …' dersi seslenme alan isimleri ister (kavm, rabb, mûsâ…); bunlar isim ünitesindedir. Fiil ünitesine isim taşımak sınıf kuralını bozar.
  - Dersi kavramsal bırak, başlığı fiil kelimeleriyle uyumlu yaz (K2F-21, önerilen)
  - İsim lemmalarını Ünite 9'a taşı (fiil/isim karışımı kabul edilir)
- **u10.01, u11.01** — 'Bir kökten' dersleri aynı kökten ≥%60 lemma ister; en iyi dağıtımda %40–50'ye çıkıyor (aynı kök ailesi başka derslere bölünmüş ve anlam komşusu kuralı tek derste toplanmayı engelliyor).
  - Başlık 'bir kökten' iddiasını kaldırır (K2F-21, önerilen)
  - Anlam komşusu kuralı (R-A5) bu iki derste gevşetilir
- **u11.05** — 'Hidayet' için sözlükte yalnız 3 lemma var, biri Ünite 1'de donmuş.
  - Başlık genellenir (K2F-21, önerilen)
  - Ünite 1'den lemma çekilir
- **u07.01** — Örnek âyetlerin %58'i geçmiş kipte (eşik %60); tek örnek eksik.
  - Eşik %55'e indirilir ya da K2F-21'de örnek seçimi kipe göre yapılır
- **u08.07** — 'Yeterli gelmek' başlığının yarısı lemma anlamlarında.
  - K2F-21: başlık yeniden yazılır

## G2 kararı (2026-10-02)

> kullanıcı: 'tüm önerilerini gerçekleştir' → G2 onaylı, karar noktalarında önerilen seçenekler kabul: Ünite 1–3 donuk kalır, sözlük genişletilmez, ilgili derslerin başlık/hedef metinleri K2F-21'de dersin gerçek kelimelerine göre yeniden yazılır (u02.01/.02, u03.02, u04.01/.02, u07.02, u09.02, u10.01, u11.01/.05, u12.02, u07.01, u08.07).

- Ünite 5 (Bu, şu, kim, ne) 10 kelime: hedef aralık 20–60 dışında; dağıtım spec `poolRules` ile değiştirilebilir.
- Ünite 6 (Gök, yer ve insan) 147 kelime: hedef aralık 20–60 dışında; dağıtım spec `poolRules` ile değiştirilebilir.
- Ünite 2 çapası: namaz metinlerinin çoğu kelimesi sözlükte yok (`lp_*`); 11 odak kelimesi eski plan listesinden kimlikle eklendi.
- Dağıtım kuralları (ilk eşleşen kazanır): Ü5 işaret ve soru edatları → Ü5 işaret/soru isimleri → Ü12 şart ve zaman parçacıkları → Ü12 zaman zarfları → Ü9 seslenme (g18) → Ü4 edat, zamir, bağlaç → Ü11 unit11 kök ailesi (≥3 üye), türemiş bâb → Ü10 unit11 kök ailesi (≥3 üye) → Ü10 türemiş isimler: yapan, yapılan, fiilin adı (g19, g20) — G2 dengeleme → Ü9 türemiş bâb fiiller → Ü8 illetli / câmid fiiller → Ü7 sağlam I. bâb fiiller → Ü6 kalan isimler.

- [x] Ünite sırası, çapalar ve ders bölümü uygun.
- [x] Kelime–ünite eşlemesi uygun.
- [x] Karar noktalarında önerilen seçenekler kabul edildi.

## Seviye 0

- s0.01 · Sağdan sola, harf ve hareke
- s0.02 · Nokta ailesi
- s0.03 · Esre ve ötre
- s0.04 · Çengel ailesi
- s0.05 · Bağlanmayan harfler
- s0.06 · Dişli aile
- s0.07 · Konum şekilleri
- s0.08 · Sükûn ve kapalı hece
- s0.09 · Uzatma (med) ve şedde
- s0.10 · Kalan harfler
- s0.11 · Tenvin, elif-lâm, vasıl
- s0.12 · İlk okuma provası

## Ünite 1 · Fâtiha

Vaat: Her namazda okuduğun Fâtiha'yı kelime kelime anlayacaksın.

### u01.01 · Besmele

Kavram: g0_5 Fiil önce gelir · Uygula: prayer:fatiha

| # | Arapça | Okunuş | Anlam | Kimlik |
|---|---|---|---|---|
| 1 | ٱسْم | asm | ad, isim | `l_som_585f33` |
| 2 | ٱللَّه | allah | Allah (özel isim) | `l_ll_ah_d0a09b` |
| 3 | رَحْمَٰن | rahmân | rahmeti her şeyi kuşatan | `l_r_aHoma_n_c13ea2` |

### u01.02 · Rahîm ve Hamd

Kavram: g1 Başındaki 'el': o bilinen · Uygula: prayer:fatiha

| # | Arapça | Okunuş | Anlam | Kimlik |
|---|---|---|---|---|
| 1 | رَحِيم | rahîm | çok merhametli (sürekli) | `l_r_aHiym_ecdbe9` |
| 2 | حَمْد | hamd | övgü ve şükür | `l_Hamod_98138a` |
| 3 | رَبّ | rabb | terbiye edip yöneten Rab | `l_rab_fc2490` |
| 4 | عَٰلَمِين | ʿâlamîn | bütün varlıklar, âlemler | `l_Ea_lamiyn_c337cf` |
| 5 | مَٰلِك | mâlik | sahip, malik | `l_ma_lik_581500` |

### u01.03 · Yalnız sana

Kavram: g2 İki isim yan yana: …nın …ı · Uygula: prayer:fatiha

| # | Arapça | Okunuş | Anlam | Kimlik |
|---|---|---|---|---|
| 1 | يَوْم | yavm | gün | `l_yawom_9b88c1` |
| 2 | دِين | dîn | hesap, karşılık | `l_diyn_6c222f` |
| 3 | إِيَّا | iyyâ | yalnız (sana, beni) | `l_iy_aA_dbb412` |
| 4 | عَبَدَ | ʿabada | kulluk etti, ibadet etti | `l_Eabada_557021` |
| 5 | ٱسْتَعِينُ | astaʿînu | yardım dileriz | `l_sotaEiynu_1fb93f` |

### u01.04 · Doğru yol

Kavram: — · Uygula: prayer:fatiha

| # | Arapça | Okunuş | Anlam | Kimlik |
|---|---|---|---|---|
| 1 | هَدَى | hadâ | yol gösterdi, doğruya iletti | `l_hadaY_a88771` |
| 2 | صِرَٰط | sirât | yol | `l_Sira_T_7c7de6` |
| 3 | مُسْتَقِيم | mustakîm | dosdoğru | `l_m_usotaqiym_930fac` |
| 4 | ٱلَّذِى | allazî | o ki; -an, -en kimse | `l_l_a_iY_1a8370` |
| 5 | أَنْعَمَ | anʿama | nimet verdi, lütfetti | `l_anoEama_bec8a1` |

### u01.05 · Gazaba uğrayanlar değil

Kavram: — · Uygula: prayer:fatiha

| # | Arapça | Okunuş | Anlam | Kimlik |
|---|---|---|---|---|
| 1 | عَلَىٰ | ʿalâ | üzerine, üstünde | `l_EalaY_f79ef3` |
| 2 | غَيْر | gayr | başka, -den gayrı | `l_gayor_6b16f9` |
| 3 | مَغْضُوب | magdûb | gazaba uğramış | `l_magoDuwb_278690` |
| 4 | لَا | lâ | hayır; yok | `l_laA_4e2bfd` |
| 5 | ضَآلّ | dâll | yolunu şaşırmış, sapkın | `l_DaA_l_145c36` |


## Ünite 2 · Namazın cümleleri

Vaat: Tekbirden selâma kadar namazda söylediklerini anlayacaksın.

### u02.01 · Büyüklük ve tek ilah

Kavram: g3 '-de, -den, -e' kelimeleri · Uygula: prayer:tekbir

| # | Arapça | Okunuş | Anlam | Kimlik |
|---|---|---|---|---|
| 1 | أَكْبَر | akbar | daha büyük | `l_akobar_df8ff4` |
| 2 | إِلَٰه | ilâh | tapılan, ilah | `l_ila_h_3366e5` |
| 3 | أَيُّهَا | ayyuhâ | ey (seslenme) | `l_ay_uhaA_a494bb` |
| 4 | إِنّ | inn | şüphesiz, gerçekten | `l_in_51f9c7` |
| 5 | إِلَّا | illâ | ancak, -den başka | `l_il_aA_e925a2` |

### u02.02 · Tenzih, selâm ve bereket

Kavram: g4 'o, onlar, sen, siz, ben, biz' · Uygula: prayer:tahiyyat

| # | Arapça | Okunuş | Anlam | Kimlik |
|---|---|---|---|---|
| 1 | سُبْحَٰن | subhân | her eksikten uzak (tenzih) | `l_suboHa_n_59533b` |
| 2 | صَلَوٰة | salât | namaz | `l_Salaw_p_7f701a` |
| 3 | سَلَٰم | salâm | esenlik, barış | `l_sala_m_daff0b` |
| 4 | طَيِّبَٰت | tayyibât | temiz, helal ve hoş şeyler | `l_Tay_iba_t_e6ca86` |
| 5 | بَرَكَٰت | barakât | bereketler, bolluklar | `l_baraka_t_188a75` |

### u02.03 · Namazda ne diyorum

Kavram: — · Uygula: prayer:tahiyyat

| # | Arapça | Okunuş | Anlam | Kimlik |
|---|---|---|---|---|
| 1 | رَحْمَة | rahmet | merhamet, acıma | `l_raHomap_490a24` |
| 2 | عَبْد | ʿabd | kul | `l_Eabod_3558c0` |
| 3 | رَسُول | rasûl | elçi | `l_rasuwl_9a5606` |
| 4 | شَهِدَ | şahida | tanık oldu, şahit oldu | `l_ahida_de36bb` |
| 5 | إِلَىٰ | ilâ | -e, -a; -e doğru | `l_ilaY_d3d2d9` |
| 6 | عَن | ʿan | -den (uzaklaşma) | `l_Ean_2cd3f8` |


## Ünite 3 · Üç kısa sûre

Vaat: İhlâs, Felak ve Nâs'ı anlayarak okuyacaksın.

### u03.01 · Kelime sonundaki ekler

Kavram: g5 Yapışık ekler: -ı, -leri, -in, -iniz, -im, -imiz · Uygula: surah:112

| # | Arapça | Okunuş | Anlam | Kimlik |
|---|---|---|---|---|
| 1 | قَالَ | kâla | dedi, söyledi | `l_qaAla_657dd3` |
| 2 | أَحَد | ahad | bir, tek | `l_aHad_84cb2f` |
| 3 | صَمَد | samad | her şeyin yöneldiği, kimseye muhtaç olmayan | `l_S_amad_6a6bdd` |
| 4 | لَم | lam | -madı, -medi | `l_lam_7f1b55` |
| 5 | وَلَدَ | valada | doğurdu | `l_walada_bc1aa9` |

### u03.02 · Sığınma ve sabah aydınlığı

Kavram: g6 Olumsuzluk: lâ, lem, mâ · Uygula: surah:112

| # | Arapça | Okunuş | Anlam | Kimlik |
|---|---|---|---|---|
| 1 | كَانَ | kâna | oldu, idi | `l_kaAna_febd3a` |
| 2 | كُفُو | kufû | denk, eş | `l_kufuw_3fbe35` |
| 3 | عُذْ | ʿuz | sığındı, korunma diledi | `l_Eu_o_4dcde9` |
| 4 | فَلَق | falak | sabah aydınlığı, şafak | `l_falaq_f1e2b8` |
| 5 | مِن | min | -den, -dan | `l_min_1f6fa6` |

### u03.03 · Yaratmak ve gece

Kavram: — · Uygula: surah:113

| # | Arapça | Okunuş | Anlam | Kimlik |
|---|---|---|---|---|
| 1 | شَرّ | şarr | kötülük, şer | `l_ar_7b0807` |
| 2 | مَا | mâ | şey ki; ne | `l_maA_13038a` |
| 3 | خَلَقَ | halaka | yarattı | `l_xalaqa_2fa056` |
| 4 | غَاسِق | gâsik | karanlığı basan (gece) | `l_gaAsiq_dc791e` |
| 5 | إِذَا | izâ | -dığı zaman, -ınca | `l_i_aA_5b7376` |

### u03.04 · Düğümlere üfleyenler

Kavram: — · Uygula: surah:113

| # | Arapça | Okunuş | Anlam | Kimlik |
|---|---|---|---|---|
| 1 | وَقَبَ | vakaba | (karanlık) çöktü, bastırdı | `l_waqaba_851dd3` |
| 2 | نَفَّٰثَٰت | naffâsât | üfleyen (kadın)lar | `l_n_af_a_va_t_b7ff1f` |
| 3 | فِى | fî | içinde; -de, -da | `l_fiY_39977c` |
| 4 | عُقْدَة | ʿukdet | düğüm | `l_Euqodap_88823f` |
| 5 | حَاسِد | hâsid | kıskanç, haset eden | `l_HaAsid_83cf8e` |

### u03.05 · Kıskançlık ve vesvese

Kavram: — · Uygula: surah:113

| # | Arapça | Okunuş | Anlam | Kimlik |
|---|---|---|---|---|
| 1 | حَسَدَ | hasada | kıskandı, haset etti | `l_Hasada_76834c` |
| 2 | نَاس | nâs | insanlar | `l_n_aAs_ba9c78` |
| 3 | مَلِك | malik | hükümdar, kral | `l_malik_2063d1` |
| 4 | وَسْوَاس | vasvâs | vesvese veren, fısıldayan | `l_wasowaAs_75a11c` |

### u03.06 · Üç sûreyi birlikte okuma

Kavram: — · Uygula: surah:114

| # | Arapça | Okunuş | Anlam | Kimlik |
|---|---|---|---|---|
| 1 | خَنَّاس | hannâs | sinip saklanan | `l_xan_aAs_eb9958` |
| 2 | وَسْوَسَ | vasvasa | vesvese verdi, fısıldadı | `l_wasowasa_aeaf29` |
| 3 | صَدْر | sadr | göğüs | `l_Sador_913a7b` |
| 4 | جِنَّة | cinnet | cinler | `l_jin_ap_589db1` |


## Ünite 4 · Kur'an'ın tutkalı

Vaat: Cümleleri birbirine bağlayan kelimeleri tanıyacaksın.

### u04.01 · Dikkat ve vurgu

Kavram: g7 '-an, -en, ki o' bağları · Uygula: examples

| # | Arapça | Okunuş | Anlam | Kimlik |
|---|---|---|---|---|
| 1 | أَلَآ | alâ | dikkat edin, bilin ki | `l_alaA_121826` |
| 2 | أَنّ | ann | -dığı, ki (şüphesiz) | `l_an_e1bf35` |
| 3 | أَن | an | -mek, -mesi | `l_an_d1c942` |
| 4 | قَد | kad | muhakkak, gerçekten (geçmişte) | `l_qad_03fa2b` |
| 5 | فَوْق | favk | üst, üstünde | `l_fawoq_451ce1` |

### u04.02 · O gün, her ve bazı

Kavram: g8 'Şüphesiz' ve 'ancak': inne, illâ · Uygula: examples

| # | Arapça | Okunuş | Anlam | Kimlik |
|---|---|---|---|---|
| 1 | يَوْمَئِذ | yavma'iz | o gün, o vakit | `l_yawoma_i_367815` |
| 2 | بَل | bal | hayır, aksine | `l_bal_1b5a6f` |
| 3 | كُلّ | kull | her, bütün | `l_kul_03497c` |
| 4 | بَعْض | baʿd | bir kısım, bazı | `l_baEoD_256db1` |
| 5 | عِند | ʿind | yanında, katında | `l_Eind_8fe318` |

### u04.03 · 'sonra', 'ile' ve 'veya'

Kavram: — · Uygula: examples

| # | Arapça | Okunuş | Anlam | Kimlik |
|---|---|---|---|---|
| 1 | لَن | lan | asla ... -mayacak | `l_lan_094a36` |
| 2 | ثُمّ | summ | sonra, ardından | `l_vum_88b269` |
| 3 | مَع | maʿ | ile, beraber | `l_maE_d833a0` |
| 4 | أَم | am | yoksa, veya | `l_am_1e8491` |
| 5 | لَٰكِن | lâkin | ama, lakin | `l_la_kin_4550fb` |

### u04.04 · 'ya da', 'ama' ve 'ise'

Kavram: — · Uygula: examples

| # | Arapça | Okunuş | Anlam | Kimlik |
|---|---|---|---|---|
| 1 | إِمَّا | immâ | ya ... ya da; eğer (in+mâ) | `l_im_aA_986f60` |
| 2 | أَو | av | veya, yahut | `l_aw_43116a` |
| 3 | لَٰكِنّ | lâkinn | ama, fakat (vurgulu) | `l_la_kin_d0bdf4` |
| 4 | سَوْف | savf | ileride, -ecek (gelecek) | `l_sawof_892db8` |
| 5 | أَمَّا | ammâ | ise, -e gelince | `l_am_aA_c993e0` |

### u04.05 · 'asla', 'sanki' ve 'umulur ki'

Kavram: — · Uygula: examples

| # | Arapça | Okunuş | Anlam | Kimlik |
|---|---|---|---|---|
| 1 | كَلَّا | kallâ | asla!, hayır (reddetme) | `l_kal_aA_3a705b` |
| 2 | إِذًا | izen | öyleyse, o zaman | `l_i_FA_60c2bd` |
| 3 | كَأَنّ | ka'ann | sanki, gibi | `l_ka_an_965a6d` |
| 4 | لَعَلّ | laʿall | umulur ki | `l_laEal_7b9569` |
| 5 | بَلَىٰ | balâ | hayır öyle değil, evet (olumsuza cevap) | `l_balaY_04cddb` |


## Ünite 5 · Bu, şu, kim, ne

Vaat: İşaret ve soru kelimeleriyle âyetin kime, neye döndüğünü göreceksin.

### u05.01 · İşaret kelimeleri

Kavram: g9 Bu, şu, o, bunlar, onlar · Uygula: examples

| # | Arapça | Okunuş | Anlam | Kimlik |
|---|---|---|---|---|
| 1 | هَٰذَا | hâzâ | bu (yakın işaret) | `l_ha_aA_9f90d0` |
| 2 | ذَٰلِك | zâlik | o, şu (uzak işaret) | `l_a_lik_f3410a` |
| 3 | أُولَٰٓئِك | ûlâ'ik | onlar (uzak işaret) | `l_uwla_ik_8eb052` |
| 4 | كَيْف | kayf | nasıl? | `l_kayof_79814e` |
| 5 | هَل | hal | ... mı? (soru) | `l_hal_232554` |

### u05.02 · Soru kelimeleri

Kavram: g10 '-dır' yazılmaz: isim cümlesi · Uygula: examples

| # | Arapça | Okunuş | Anlam | Kimlik |
|---|---|---|---|---|
| 1 | أَىّ | ayy | hangi? | `l_aY_907a32` |
| 2 | أَنَّىٰ | annâ | nasıl, nereden | `l_an_aY_15158e` |
| 3 | مَاذَا | mâzâ | ne?, neyi? | `l_maA_aA_ff073e` |
| 4 | ذَا | zâ | o, bu (işaret; men zâ: kim?) | `l_aA_baa50b` |
| 5 | كَم | kam | kaç?; ne çok, nice | `l_kam_0f9dfb` |


## Ünite 6 · Gök, yer ve insan

Vaat: Kur'an'ın en sık isimlerini tanıyacaksın.

### u06.01 · Gök, yer ve işitme

Kavram: g11 Sondaki yuvarlak 'te': dişil kelime · Uygula: examples

| # | Arapça | Okunuş | Anlam | Kimlik |
|---|---|---|---|---|
| 1 | أَرْض | ard | yer, yeryüzü | `l_aroD_977a0d` |
| 2 | سَمَآء | samâ' | gök | `l_samaA_3fe4ed` |
| 3 | سَمْع | samʿ | işitme, kulak | `l_samoE_5d4faf` |
| 4 | نَفْس | nafs | kendi, can | `l_nafos_fde475` |

### u06.02 · Kitap ve kalp

Kavram: g12 Çoğul: sona ek ya da içten değişim · Uygula: examples

| # | Arapça | Okunuş | Anlam | Kimlik |
|---|---|---|---|---|
| 1 | كِتَٰب | kitâb | yazılı kitap | `l_kita_b_291fe8` |
| 2 | قَلْب | kalb | kalp, gönül | `l_qalob_e14dcc` |
| 3 | عَذَاب | ʿazâb | azap, ceza | `l_Ea_aAb_4b9936` |

### u06.03 · Ödül ve karşılık

Kavram: — · Uygula: examples

| # | Arapça | Okunuş | Anlam | Kimlik |
|---|---|---|---|---|
| 1 | أَجْر | acr | ödül, karşılık | `l_ajor_c798df` |
| 2 | جَنَّة | cannet | bahçe; cennet | `l_jan_ap_50e4b4` |
| 3 | نَار | nâr | ateş, alev | `l_naAr_d577c3` |
| 4 | حَقّ | hakk | gerçek, doğru | `l_Haq_3072cf` |
| 5 | خَيْر | hayr | hayır, iyilik | `l_xayor_65557c` |

### u06.04 · Âyet ve işaret

Kavram: — · Uygula: examples

| # | Arapça | Okunuş | Anlam | Kimlik |
|---|---|---|---|---|
| 1 | شَىْء | şay' | şey, nesne | `l_aYo_56e1b1` |
| 2 | ءَايَة | âyet | âyet; işaret, delil | `l_aAyap_9bea05` |
| 3 | بَيْن | bayn | ara, arasında | `l_bayon_d87f11` |
| 4 | سَبِيل | sabîl | yol | `l_sabiyl_bdac41` |
| 5 | دُون | dûn | -den başka | `l_duwn_bc1447` |

### u06.05 · Musa ve halkı

Kavram: — · Uygula: examples

| # | Arapça | Okunuş | Anlam | Kimlik |
|---|---|---|---|---|
| 1 | مُوسَىٰ | mûsâ | Musa (peygamber) | `l_muwsaY_3064bc` |
| 2 | أَهْل | ahl | ehil, halk; aile | `l_ahol_86b2cf` |
| 3 | عَظِيم | ʿazîm | büyük, azametli | `l_EaZiym_93f908` |
| 4 | يَد | yad | el | `l_yad_84953d` |
| 5 | دُنْيَا | dunyâ | en yakın (hayat), dünya | `l_d_unoyaA_4c3c1e` |

### u06.06 · Güç ve sahiplik

Kavram: — · Uygula: examples

| # | Arapça | Okunuş | Anlam | Kimlik |
|---|---|---|---|---|
| 1 | عَزِيز | ʿazîz | güçlü, üstün | `l_Eaziyz_4804b0` |
| 2 | ذُو | zû | sahip, -li | `l_uw_7be8de` |
| 3 | شَيْطَٰن | şaytân | şeytan | `l_ayoTa_n_06003d` |
| 4 | مَلَك | malak | melek | `l_malak_b3955c` |
| 5 | مَثَل | masal | örnek, misal | `l_maval_5dedc0` |

### u06.07 · Mal, dost ve gece

Kavram: — · Uygula: examples

| # | Arapça | Okunuş | Anlam | Kimlik |
|---|---|---|---|---|
| 1 | مَال | mâl | mal, servet | `l_maAl_d64b35` |
| 2 | وَلِىّ | valiyy | dost, yakın | `l_waliY_0884c3` |
| 3 | لَيْل | layl | gece vakti | `l_layol_c1152e` |
| 4 | أَوَّل | avval | birinci, ilk | `l_aw_al_3314ee` |
| 5 | كُفْر | kufr | inkâr | `l_kufor_1c9ee6` |

### u06.08 · Oğullar ve arkadaşlar

Kavram: — · Uygula: examples

| # | Arapça | Okunuş | Anlam | Kimlik |
|---|---|---|---|---|
| 1 | بُنَىّ | bunayy | oğul (çoğul: oğullar) | `l_bunaY_8dc929` |
| 2 | أَصْحَٰب | ashâb | sahipler, ehil; arkadaşlar | `l_aSoHa_b_b49ea8` |
| 3 | جَهَنَّم | cahannam | Cehennem (azap yurdu) | `l_jahan_am_665115` |
| 4 | زَوْج | zavc | eş | `l_zawoj_99a6c2` |
| 5 | أَخ | ah | kardeş | `l_ax_48233a` |

### u06.09 · Peygamber ve Firavun

Kavram: — · Uygula: examples

| # | Arapça | Okunuş | Anlam | Kimlik |
|---|---|---|---|---|
| 1 | مِثْل | misl | benzer, eş | `l_mivol_d81d43` |
| 2 | نَبِىّ | nabiyy | haber getiren peygamber | `l_n_abiY_e09f3b` |
| 3 | فِرْعَوْن | firʿavn | Firavun | `l_firoEawon_45c9f5` |
| 4 | أَلِيم | alîm | acı veren, elem verici | `l_aliym_a29290` |
| 5 | وَجْه | vach | yüz | `l_wajoh_c3bb4d` |

### u06.10 · Delil ve insan

Kavram: — · Uygula: examples

| # | Arapça | Okunuş | Anlam | Kimlik |
|---|---|---|---|---|
| 1 | بَيِّنَة | bayyinet | apaçık delil | `l_bay_inap_86ef67` |
| 2 | إِنسَٰن | insân | insan | `l_insa_n_d60ef4` |
| 3 | آخَر | âhar | başka, diğer | `l_A_xar_621bf1` |
| 4 | قَلِيل | kalîl | az, azıcık | `l_qaliyl_2b769c` |
| 5 | قُرْءَان | kur'ân | okunan (Kitap), Kur'ân | `l_quro_aAn_5027d4` |

### u06.11 · İbrahim ve ev

Kavram: — · Uygula: examples

| # | Arapça | Okunuş | Anlam | Kimlik |
|---|---|---|---|---|
| 1 | إِبْرَاهِيم | ibrâhîm | İbrahim (peygamber) | `l_iboraAhiym_d85936` |
| 2 | بَيْت | bayt | ev | `l_bayot_3393ba` |
| 3 | يَمِين | yamîn | yemin | `l_yamiyn_398e7f` |
| 4 | آبَاء | âbâ' | babalar, atalar | `l_A_baA_febd74` |
| 5 | أُمَّة | ummet | topluluk, ümmet | `l_um_ap_e71e1a` |

### u06.12 · Oğul ve su

Kavram: — · Uygula: examples

| # | Arapça | Okunuş | Anlam | Kimlik |
|---|---|---|---|---|
| 1 | ٱبْن | abn | oğul | `l_bon_228952` |
| 2 | كَثِير | kasîr | çok, birçok | `l_kaviyr_d003d4` |
| 3 | مَآء | mâ' | su, sıvı | `l_maA_e36bc7` |
| 4 | نِسَآء | nisâ' | kadınlar | `l_nisaA_371a3e` |
| 5 | نَذِير | nazîr | uyaran, uyarıcı | `l_na_iyr_9ec980` |

### u06.13 · Göz ve gündüz

Kavram: — · Uygula: examples

| # | Arapça | Okunuş | Anlam | Kimlik |
|---|---|---|---|---|
| 1 | عَيْن | ʿayn | göz | `l_Eayon_c7bc29` |
| 2 | نَهَار | nahâr | gündüz | `l_nahaAr_1471c5` |
| 3 | قَرْيَة | karyet | kasaba, şehir | `l_qaroyap_3147eb` |
| 4 | شَدِيد | şadîd | çetin, şiddetli | `l_adiyd_2db895` |
| 5 | وَلَد | valad | çocuk, evlat | `l_walad_a334cd` |

### u06.14 · Nehir ve vade

Kavram: — · Uygula: examples

| # | Arapça | Okunuş | Anlam | Kimlik |
|---|---|---|---|---|
| 1 | نَهَر | nahar | ırmak, nehir | `l_nahar_fb00c1` |
| 2 | أَجَل | acal | belirli süre, vade | `l_ajal_77d132` |
| 3 | بَصِير | basîr | her şeyi gören | `l_baSiyr_69e5a4` |
| 4 | تَحْت | taht | alt, altında | `l_taHot_fb7d9c` |

### u06.15 · Düşman ve yurt

Kavram: — · Uygula: examples

| # | Arapça | Okunuş | Anlam | Kimlik |
|---|---|---|---|---|
| 1 | عَدُوّ | ʿaduvv | düşman | `l_Eaduw_4c00d2` |
| 2 | بَصَر | basar | göz, görme | `l_baSar_691898` |
| 3 | دَار | dâr | yurt, ev | `l_daAr_682c39` |
| 4 | سَاعَة | sâʿet | kıyamet saati | `l_saAEap_ac5bf9` |

### u06.16 · İşiten ve gücü yeten

Kavram: — · Uygula: examples

| # | Arapça | Okunuş | Anlam | Kimlik |
|---|---|---|---|---|
| 1 | سَمِيع | samîʿ | her şeyi işiten | `l_samiyE_d49cf3` |
| 2 | أَبٌ | abun | baba | `l_abN_71b506` |
| 3 | قَدِير | kadîr | her şeye gücü yeten | `l_qadiyr_cd0ac2` |
| 4 | أُولِى | ûlî | sahipler, -ler (topluluk) | `l_uwliY_3328a7` |
| 5 | خَبِير | habîr | her şeyden haberdar | `l_xabiyr_dadb64` |

### u06.17 · Nuh ve ışık

Kavram: — · Uygula: examples

| # | Arapça | Okunuş | Anlam | Kimlik |
|---|---|---|---|---|
| 1 | إِسْرَائِيل | isrâ'îl | İsrail (Yakub peygamber) | `l_isoraA_iyl_66e2a2` |
| 2 | نُوح | nûh | Nuh (peygamber) | `l_nuwH_1acf34` |
| 3 | نُور | nûr | ışık, aydınlık | `l_nuwr_2e4de0` |
| 4 | بَحْر | bahr | deniz | `l_baHor_61776d` |
| 5 | وَيْل | vayl | yazıklar olsun! | `l_wayol_4f2e46` |

### u06.18 · Dağ ve günah

Kavram: — · Uygula: examples

| # | Arapça | Okunuş | Anlam | Kimlik |
|---|---|---|---|---|
| 1 | جَبَل | cabal | dağ | `l_jabal_7f35ca` |
| 2 | ذَنب | zanb | günah, suç | `l_anb_d90705` |
| 3 | بَشَر | başar | insan, beşer | `l_ba_ar_dfc1d7` |
| 4 | سَيِّـَٔات | sayyiât | kötülükler, günahlar | `l_say_i_aAt_cbbfce` |
| 5 | إِثْم | ism | günah, suç | `l_ivom_eafb0c` |

### u06.19 · Nimet ve geçimlik

Kavram: — · Uygula: examples

| # | Arapça | Okunuş | Anlam | Kimlik |
|---|---|---|---|---|
| 1 | مَتَٰع | matâʿ | yararlanma, geçimlik | `l_mata_E_087815` |
| 2 | ءَالَآء | âlâ' | nimetler, lütuflar | `l_aAlaA_553b3f` |
| 3 | مَرْيَم | maryam | Meryem (İsa'nın annesi) | `l_maroyam_acbcf0` |
| 4 | أُمّ | umm | anne | `l_um_dd7260` |
| 5 | شَمْس | şams | güneş | `l_amos_c38bdc` |

### u06.20 · Topluluk ve kutsal

Kavram: — · Uygula: examples

| # | Arapça | Okunuş | Anlam | Kimlik |
|---|---|---|---|---|
| 1 | فَرِيق | farîk | bir grup, bölük | `l_fariyq_23fdad` |
| 2 | حَرَام | harâm | dokunulmaz, kutsal | `l_HaraAm_07e3df` |
| 3 | كَرِيم | karîm | değerli, cömert | `l_kariym_465d92` |
| 4 | قَوْم | kavm | topluluk, halk | `l_qawom_d51842` |
| 5 | وَٰحِدَة | vâhidet | bir, tek (dişil) | `l_wa_Hidap_1b129f` |

### u06.21 · Önderler ve kuvvet

Kavram: — · Uygula: examples

| # | Arapça | Okunuş | Anlam | Kimlik |
|---|---|---|---|---|
| 1 | مَلَأ | mala' | ileri gelenler, önderler | `l_mala_3ccd3f` |
| 2 | قُوَّة | kuvvet | güç, kuvvet | `l_quw_ap_4ad7a3` |
| 3 | وَٰحِد | vâhid | bir, tek | `l_wa_Hid_e2c15d` |
| 4 | عَرْش | ʿarş | taht, arş | `l_Earo_7dbbdb` |
| 5 | حَيْث | hays | -dığı yer | `l_Hayov_5b7279` |

### u06.22 · Ordu ve haber

Kavram: — · Uygula: examples

| # | Arapça | Okunuş | Anlam | Kimlik |
|---|---|---|---|---|
| 1 | جُند | cund | asker, ordu | `l_jund_600913` |
| 2 | نَبَأ | naba' | haber (önemli) | `l_naba_ea48de` |
| 3 | رَجُل | racul | erkek, adam | `l_rajul_891848` |
| 4 | رِيح | rîh | rüzgâr | `l_riyH_14b7a7` |
| 5 | حَدِيث | hadîs | söz, haber | `l_Hadiyv_d707e2` |

### u06.23 · Söz ve nesil

Kavram: — · Uygula: examples

| # | Arapça | Okunuş | Anlam | Kimlik |
|---|---|---|---|---|
| 1 | كَلِمَة | kalimet | söz, kelime | `l_kalimap_5d4228` |
| 2 | رِجَال | ricâl | erkekler, adamlar | `l_rijaAl_b36b89` |
| 3 | ذُرِّيَّة | zurriyyet | soy, nesil | `l_ur_iy_ap_2745b8` |
| 4 | بَاب | bâb | kapı | `l_baAb_51f669` |
| 5 | لُوط | lût | Lut (peygamber) | `l_luwT_833109` |

### u06.24 · Ay ve Yusuf

Kavram: — · Uygula: examples

| # | Arapça | Okunuş | Anlam | Kimlik |
|---|---|---|---|---|
| 1 | قَمَر | kamar | ay (gökteki) | `l_qamar_a95a93` |
| 2 | يُوسُف | yûsuf | Yusuf (peygamber) | `l_yuwsuf_bd02d7` |
| 3 | ءَال | âl | aile, soy; taraftarlar | `l_aAl_95d364` |
| 4 | جَحِيم | cahîm | alevli ateş | `l_jaHiym_0170fa` |
| 5 | ٱمْرَأَت | amra'at | kadın; eş | `l_mora_at_d761dc` |

### u06.25 · Semûd ve Âdem

Kavram: — · Uygula: examples

| # | Arapça | Okunuş | Anlam | Kimlik |
|---|---|---|---|---|
| 1 | قَرِيب | karîb | yakın | `l_qariyb_b0bf66` |
| 2 | ثَمُود | samûd | Semûd (kavmi) | `l_vamuwd_717675` |
| 3 | آدَم | âdam | Âdem (peygamber) | `l_A_dam_143ced` |
| 4 | بَأْس | ba's | savaş, şiddet | `l_ba_os_3e2b64` |
| 5 | بَعِيد | baʿîd | uzak | `l_baEiyd_8bccdd` |

### u06.26 · İsa ve dil

Kavram: — · Uygula: examples

| # | Arapça | Okunuş | Anlam | Kimlik |
|---|---|---|---|---|
| 1 | عِيسَى | ʿîsâ | İsa (peygamber) | `l_EiysaY_1af04a` |
| 2 | جُنَاح | cunâh | günah, sakınca | `l_junaAH_86068c` |
| 3 | لِسَان | lisân | dil | `l_lisaAn_5d42eb` |
| 4 | مِيثَٰق | mîsâk | kesin söz, antlaşma | `l_m_iyva_q_ac1e15` |
| 5 | عَاد | ʿâd | Âd (kavmi) | `l_EaAd2_f73727` |

### u06.27 · Muhtaç olmayan

Kavram: — · Uygula: examples

| # | Arapça | Okunuş | Anlam | Kimlik |
|---|---|---|---|---|
| 1 | غَنِىّ | ganiyy | zengin, hiçbir şeye muhtaç olmayan | `l_ganiY_463a95` |
| 2 | طَعَام | taʿâm | yiyecek, yemek | `l_TaEaAm_f85a5a` |
| 3 | أُنثَىٰ | unsâ | dişi | `l_unvaY_bfb590` |
| 4 | وَكِيل | vakîl | güvenilip işi bırakılan, vekil | `l_wakiyl_a481db` |
| 5 | وَرَآء | varâ' | arka, geri | `l_waraA_905c82` |

### u06.28 · Gemi ve yoksul

Kavram: — · Uygula: examples

| # | Arapça | Okunuş | Anlam | Kimlik |
|---|---|---|---|---|
| 1 | فُلْك | fulk | gemi | `l_fulok_807067` |
| 2 | مِسْكِين | miskîn | yoksul, düşkün | `l_misokiyn_63a03c` |
| 3 | قَرْن | karn | nesil, çağ | `l_qaron_c7a8aa` |
| 4 | سَبْع | sabʿ | yedi (sayı) | `l_saboE_6a6f8c` |
| 5 | يَتِيم | yatîm | yetim, öksüz | `l_yatiym_4a612b` |

### u06.29 · İyiler ve kötülük

Kavram: — · Uygula: examples

| # | Arapça | Okunuş | Anlam | Kimlik |
|---|---|---|---|---|
| 1 | بَرّ | barr | iyi, erdemli (çoğul ebrâr) | `l_bar_4aea03` |
| 2 | جِنّ | cinn | cin | `l_jin_7f7c85` |
| 3 | سَيِّئَة | sayyi'et | kötülük, günah | `l_say_i_ap_5198f7` |
| 4 | خَلْف | half | arka, geri | `l_xalof_4a2374` |
| 5 | أَعْمَىٰ | aʿmâ | kör | `l_aEomaY_ea9134` |
| 6 | شَهْر | şahr | ay (takvim) | `l_ahor_1c433f` |

### u06.30 · İsimlerin dünyası

Kavram: — · Uygula: examples

| # | Arapça | Okunuş | Anlam | Kimlik |
|---|---|---|---|---|
| 1 | نَصِيب | nasîb | pay, hisse | `l_naSiyb_a556ca` |
| 2 | رُوح | rûh | ruh; can | `l_ruwH_1d9882` |
| 3 | هَٰرُون | hârûn | Harun (peygamber) | `l_ha_ruwn_3d8730` |
| 4 | حَمِيم | hamîm | kaynar su | `l_Hamiym_3e44f9` |
| 5 | حِزْب | hizb | taraf, parti | `l_Hizob_666efe` |
| 6 | طَيِّبَة | tayyibet | güzel, hoş, temiz | `l_Tay_ibap_bae173` |


## Ünite 7 · Oldu, yaptı

Vaat: Geçmiş zaman anlatılarını çözeceksin.

### u07.01 · Geçmişte olanlar

Kavram: g13 Geçmiş zaman: yaptı, yaptılar, yaptım · Uygula: examples

| # | Arapça | Okunuş | Anlam | Kimlik |
|---|---|---|---|---|
| 1 | أَحَلَّ | ahalla | helal kıldı, serbest bıraktı | `l_aHal_a_bf74a4` |
| 2 | جَعَلَ | caʿala | kıldı, yaptı | `l_jaEala_307581` |
| 3 | عَلِمَ | ʿalima | bildi | `l_Ealima_ceb6d7` |
| 4 | جَآءَ | câ'a | geldi | `l_jaA_a_c0bd29` |

### u07.02 · Gönderme ve yalanlama

Kavram: g14 Kâne: 'idi, oldu' · Uygula: examples

| # | Arapça | Okunuş | Anlam | Kimlik |
|---|---|---|---|---|
| 1 | أَرْسَلَ | arsala | gönderdi | `l_arosala_4ee820` |
| 2 | كَذَّبَ | kazzaba | yalanladı | `l_ka_aba_15a65b` |
| 3 | كَفَرَ | kafara | inkâr etti | `l_kafara_af1746` |
| 4 | أَنزَلَ | anzala | indirdi | `l_anzala_adebf9` |

### u07.03 · İnanmak ve yapmak

Kavram: — · Uygula: examples

| # | Arapça | Okunuş | Anlam | Kimlik |
|---|---|---|---|---|
| 1 | ءَامَنَ | âmana | iman etti, inandı | `l_aAmana_966a5c` |
| 2 | رَجَعَ | racaʿa | döndü | `l_rajaEa_39e51f` |
| 3 | أَنشَأَ | anşa'a | ortaya çıkardı, var etti | `l_an_a_a_a1dde3` |
| 4 | أَعَدَّ | aʿadda | hazırladı | `l_aEad_a_17540a` |
| 5 | عَمِلَ | ʿamila | yaptı, işledi | `l_Eamila_50319c` |

### u07.04 · Duymak ve girmek

Kavram: — · Uygula: examples

| # | Arapça | Okunuş | Anlam | Kimlik |
|---|---|---|---|---|
| 1 | سَمِعَ | samiʿa | işitti, duydu | `l_samiEa_640570` |
| 2 | دَخَلَ | dahala | girdi | `l_daxala_442502` |
| 3 | كَسَبَ | kasaba | kazandı, elde etti | `l_kasaba_94ec71` |
| 4 | بَلَغَ | balaga | ulaştı, erişti | `l_balaga_f89222` |
| 5 | رَزَقَ | razaka | rızık verdi | `l_razaqa_19085c` |

### u07.05 · Vurmak ve çıkmak

Kavram: — · Uygula: examples

| # | Arapça | Okunuş | Anlam | Kimlik |
|---|---|---|---|---|
| 1 | ضَرَبَ | daraba | vurdu | `l_Daraba_fbd307` |
| 2 | خَرَجَ | haraca | çıktı | `l_xaraja_d1d0bb` |
| 3 | بَعَثَ | baʿasa | gönderdi | `l_baEava_a09270` |
| 4 | عَقَلُ | ʿakalu | akletti, kavradı | `l_Eaqalu_36636d` |
| 5 | كَتَبَ | kataba | yazdı | `l_kataba_f09a6a` |

### u07.06 · Şükretmek ve sahip olmak

Kavram: — · Uygula: examples

| # | Arapça | Okunuş | Anlam | Kimlik |
|---|---|---|---|---|
| 1 | شَكَرَ | şakara | şükretti, teşekkür etti | `l_akara_350195` |
| 2 | مَلَكَتْ | malakat | sahip oldu | `l_malakato_07e799` |
| 3 | حَسِبَ | hasiba | sandı | `l_Hasiba_a4ca56` |
| 4 | شَآءَ | şâ'a | diledi, istedi | `l_aA_a_25c447` |
| 5 | حَمَلَ | hamala | taşıdı, yüklendi | `l_Hamala_304f43` |

### u07.07 · Bırakmak ve toplamak

Kavram: — · Uygula: examples

| # | Arapça | Okunuş | Anlam | Kimlik |
|---|---|---|---|---|
| 1 | تَرَكَ | taraka | bıraktı, terk etti | `l_taraka_738029` |
| 2 | حَشَرَ | haşara | topladı, bir araya getirdi | `l_Ha_ara_ed6489` |
| 3 | يَحْزُن | yahzun | üzülür, hüzünlenir | `l_yaHozun_b30b11` |
| 4 | ذَهَبَ | zahaba | gitti | `l_ahaba_3f10c5` |
| 5 | نَفَعَ | nafaʿa | fayda verdi, yararlandı | `l_nafaEa_06e253` |

### u07.08 · Kalmak ve güç yetirmek

Kavram: — · Uygula: examples

| # | Arapça | Okunuş | Anlam | Kimlik |
|---|---|---|---|---|
| 1 | لَبِثَ | labisa | kaldı, eğlendi | `l_labiva_2b778d` |
| 2 | قَدَرَ | kadara | güç yetirdi | `l_qadara_a5b3da` |
| 3 | يَشْعُرُ | yaşʿuru | farkına varır, sezer | `l_ya_oEuru_05ae7b` |
| 4 | فَتَنُ | fatanu | sınadı; saptırmaya çalıştı | `l_fatanu_2455b0` |
| 5 | لَعَنَ | laʿana | lanetledi, rahmetinden uzaklaştırdı | `l_laEana_bf347d` |

### u07.09 · Tuzak ve yükseltmek

Kavram: — · Uygula: examples

| # | Arapça | Okunuş | Anlam | Kimlik |
|---|---|---|---|---|
| 1 | مَكَرَ | makara | hile yaptı, tuzak kurdu | `l_makara_540389` |
| 2 | رَفَعَ | rafaʿa | yükseltti, kaldırdı | `l_rafaEa_7f376e` |
| 3 | حَقَّ | hakka | gerçekleşti, hak edildi | `l_Haq_a_a024e5` |
| 4 | عَرَفَ | ʿarafa | tanıdı, bildi | `l_Earafa_a51610` |


## Ünite 8 · Yapar, yapıyor

Vaat: Şimdiki ve geniş zamanı tanıyacaksın.

### u08.01 · Şimdiki ve geniş zaman

Kavram: g15 Şimdiki ve geniş zaman: yapar, yapıyor · Uygula: examples

| # | Arapça | Okunuş | Anlam | Kimlik |
|---|---|---|---|---|
| 1 | أَتَى | atâ | geldi | `l_ataY_c25581` |
| 2 | رَءَا | ra'â | gördü | `l_ra_aA_d87b92` |
| 3 | أَنفَقَ | anfaka | harcadı, infak etti | `l_anfaqa_0b12ad` |
| 4 | قَتَلَ | katala | öldürdü | `l_qatala_ae1dd2` |
| 5 | صَبَرَ | sabara | sabretti, katlandı | `l_Sabara_34dfc2` |

### u08.02 · Bulmak, bakmak ve sormak

Kavram: g16 Yapmaz, yapmadı, asla yapmayacak · Uygula: examples

| # | Arapça | Okunuş | Anlam | Kimlik |
|---|---|---|---|---|
| 1 | وَجَدَ | vacada | buldu | `l_wajada_733e47` |
| 2 | نَظَرَ | nazara | baktı | `l_n_aZara_cdb6f4` |
| 3 | فَعَلَ | faʿala | yaptı | `l_faEala_b34da5` |
| 4 | أَخَذَ | ahaza | aldı, tuttu | `l_axa_a_2954c6` |
| 5 | سَأَلَ | sa'ala | sordu | `l_sa_ala_a822cc` |

### u08.03 · Korkmak ve emretmek

Kavram: — · Uygula: examples

| # | Arapça | Okunuş | Anlam | Kimlik |
|---|---|---|---|---|
| 1 | لَيْسَ | laysa | değildir | `l_l_ayosa_5684fc` |
| 2 | خَافَ | hâfa | korktu | `l_xaAfa_29d6b0` |
| 3 | أَمَرَ | amara | emretti, buyurdu | `l_amara_3fab3c` |
| 4 | جَزَىٰ | cazâ | karşılık verdi | `l_jazaY_a84a54` |
| 5 | وَعَدَ | vaʿada | söz verdi, vaat etti | `l_waEada_9ae985` |

### u08.04 · Tövbe ve okumak

Kavram: — · Uygula: examples

| # | Arapça | Okunuş | Anlam | Kimlik |
|---|---|---|---|---|
| 1 | تَابَ | tâba | tövbe etti, döndü | `l_taAba_0ab18c` |
| 2 | جَرَيْ | caray | aktı; yürüdü | `l_jarayo_c231f0` |
| 3 | قَضَىٰٓ | kadâ | hükmetti, karar verdi | `l_qaDaY_2a99a6` |
| 4 | مَسَّ | massa | dokundu, değdi | `l_mas_a_ba2e94` |
| 5 | تَلَىٰ | talâ | okudu | `l_talaY_d5d166` |

### u08.05 · Artırmak ve sanmak

Kavram: — · Uygula: examples

| # | Arapça | Okunuş | Anlam | Kimlik |
|---|---|---|---|---|
| 1 | زَادَ | zâda | artırdı, çoğalttı | `l_zaAda_884c7a` |
| 2 | ظَنَّ | zanna | sandı, zannetti | `l_Zan_a_9b29e5` |
| 3 | يَذَرَ | yazara | bıraktı, terk etti | `l_ya_ara_ef2203` |
| 4 | بِئْسَ | bi'sa | ne kötü! | `l_bi_osa_d43552` |
| 5 | خَشِىَ | haşiya | (saygıyla) korktu, çekindi | `l_xa_iYa_982ede` |

### u08.06 · Razı olmak

Kavram: — · Uygula: examples

| # | Arapça | Okunuş | Anlam | Kimlik |
|---|---|---|---|---|
| 1 | رَضِىَ | radiya | razı oldu, hoşnut oldu | `l_r_aDiYa_3ee772` |
| 2 | نَسِىَ | nasiya | unuttu | `l_nasiYa_a017e1` |
| 3 | ذَاقُ | zâku | tattı | `l_aAqu_e43a4a` |
| 4 | صَدَّ | sadda | alıkoydu, engelledi | `l_Sad_a_552787` |
| 5 | رَدَّ | radda | geri çevirdi, döndürdü | `l_rad_a_c68b16` |

### u08.07 · Umut, yetmek ve affetmek

Kavram: — · Uygula: examples

| # | Arapça | Okunuş | Anlam | Kimlik |
|---|---|---|---|---|
| 1 | عَسَى | ʿasâ | umulur ki, olabilir ki | `l_EasaY_2fc848` |
| 2 | سَآءَ | sâ'a | kötü oldu; üzdü | `l_saA_a_0909f5` |
| 3 | عَفَا | ʿafâ | affetti, bağışladı | `l_EafaA_0e7e7b` |
| 4 | نَهَىٰ | nahâ | yasakladı, alıkoydu | `l_nahaY_8c8b5c` |
| 5 | كَفَىٰ | kafâ | yetti, kâfi geldi | `l_kafaY_089040` |

### u08.08 · İsyan ve aramak

Kavram: — · Uygula: examples

| # | Arapça | Okunuş | Anlam | Kimlik |
|---|---|---|---|---|
| 1 | عَصَا | ʿasâ | isyan etti, karşı geldi | `l_EaSaA_9aa159` |
| 2 | بَغَىٰ | bagâ | istedi, aradı | `l_bagaY_4c4004` |
| 3 | خَلَا | halâ | baş başa kaldı | `l_xalaA_13082a` |
| 4 | كَادَ | kâda | az kaldı, neredeyse -ecekti | `l_kaAda_69a3ae` |
| 5 | أَذِنَ | azina | izin verdi | `l_a_ina_39e033` |

### u08.09 · Bağışlamak ve yürümek

Kavram: — · Uygula: examples

| # | Arapça | Okunuş | Anlam | Kimlik |
|---|---|---|---|---|
| 1 | وَهَبَ | vahaba | bağışladı, armağan etti | `l_wahaba_f39bde` |
| 2 | كَتَمَ | katama | gizledi, sakladı | `l_katama_166c72` |
| 3 | مَشَ | maşa | yürüdü | `l_m_a_a_fb0e46` |
| 4 | بَلَوْ | balav | sınadı, denedi | `l_balawo_60a2d6` |
| 5 | وَضَعَ | vadaʿa | koydu; doğurdu | `l_waDaEa_057a2f` |
| 6 | يَرْجُوا۟ | yarcû | umar, ümit eder | `l_yarojuwA_199bfc` |


## Ünite 9 · Yap, ver, bağışla

Vaat: Emir ve dua cümlelerini anlayacaksın.

### u09.01 · Anmak, yemek, vermek: fiil kökleri

Kavram: g17 Emir: yap!, deyin! · Uygula: examples

| # | Arapça | Okunuş | Anlam | Kimlik |
|---|---|---|---|---|
| 1 | ذَكَرَ | zakara | andı, hatırladı | `l_akara_67cfbf` |
| 2 | أَكَلَ | akala | yedi | `l_akala_0ec27c` |
| 3 | رَحِمَ | rahima | merhamet etti, acıdı | `l_r_aHima_870005` |
| 4 | غَفَرَ | gafara | bağışladı, örttü | `l_gafara_e47aae` |
| 5 | آتَى | âtâ | verdi | `l_A_taY_2a778d` |

### u09.02 · Uymak ve yüz çevirmek

Kavram: g18 Seslenme: ey … · Uygula: examples

| # | Arapça | Okunuş | Anlam | Kimlik |
|---|---|---|---|---|
| 1 | ٱتَّبَعَ | attabaʿa | uydu, izledi | `l_t_abaEa_e11446` |
| 2 | ٱتَّخَذَ | attahaza | edindi, tuttu | `l_t_axa_a_6d8c4b` |
| 3 | أَخْرَجَ | ahraca | dışarı çıkardı | `l_axoraja_186bcc` |
| 4 | تَوَلَّىٰ | tavallâ | yüz çevirdi | `l_tawal_aY_fdd891` |
| 5 | أَطَاعَ | atâʿa | itaat etti, boyun eğdi | `l_aTaAEa_74ca26` |

### u09.03 · Vahyetmek ve sevmek

Kavram: — · Uygula: examples

| # | Arapça | Okunuş | Anlam | Kimlik |
|---|---|---|---|---|
| 1 | أَوْحَىٰٓ | avhâ | vahyetti, bildirdi | `l_awoHaY_5691fd` |
| 2 | أَلْقَىٰٓ | alkâ | attı, bıraktı | `l_aloqaY_525495` |
| 3 | أَحْبَبْ | ahbab | sevdi | `l_aHobabo_02c0a1` |
| 4 | أَصَابَ | asâba | isabet etti, başa geldi | `l_aSaAba_7cb0f1` |
| 5 | نَزَّلَ | nazzala | (parça parça) indirdi | `l_naz_ala_e7cda7` |

### u09.04 · Savaşmak ve yok etmek

Kavram: — · Uygula: examples

| # | Arapça | Okunuş | Anlam | Kimlik |
|---|---|---|---|---|
| 1 | قَٰتَلَ | kâtala | savaştı, çarpıştı | `l_qa_tala_f7c6c3` |
| 2 | أَهْلَكَ | ahlaka | helak etti, yok etti | `l_aholaka_36d8f7` |
| 3 | ٱفْتَرَىٰ | aftarâ | uydurdu, iftira etti | `l_fotaraY_22f50e` |
| 4 | نَبَّأَ | nabba'a | haber verdi, bildirdi | `l_nab_a_a_97ecfa` |
| 5 | أَنذَرَ | anzara | uyardı, korkuttu | `l_an_ara_72baf2` |

### u09.05 · Seslenmek ve tenzih

Kavram: — · Uygula: examples

| # | Arapça | Okunuş | Anlam | Kimlik |
|---|---|---|---|---|
| 1 | نَادَىٰ | nâdâ | seslendi, çağırdı | `l_naAdaY_6f54dd` |
| 2 | سَبَّحَ | sabbaha | tesbih etti, noksanlıktan tenzih etti | `l_sab_aHa_bf280a` |
| 3 | ٱسْتَطَاعَ | astatâʿa | güç yetirdi | `l_sotaTaAEa_d34f23` |
| 4 | أُدْخِلَ | udhila | (içeri) sokuldu, kondu | `l_udoxila_00b5ee` |
| 5 | عَذَّبَ | ʿazzaba | azap etti, cezalandırdı | `l_Ea_aba_be4552` |

### u09.06 · Göstermek ve dayanmak

Kavram: — · Uygula: examples

| # | Arapça | Okunuş | Anlam | Kimlik |
|---|---|---|---|---|
| 1 | أَرَيْ | aray | gösterdi | `l_arayo_d53b57` |
| 2 | تَوَكَّلْ | tavakkal | dayandı, tevekkül etti | `l_tawak_alo_21b95a` |
| 3 | حَرَّمَ | harrama | haram kıldı, yasakladı | `l_Har_ama_8f6d04` |
| 4 | أَرَادَ | arâda | istedi, diledi | `l_araAda_e67825` |
| 5 | نَجَّىٰ | naccâ | kurtardı | `l_naj_aY_521435` |

### u09.07 · Açıklamak

Kavram: — · Uygula: examples

| # | Arapça | Okunuş | Anlam | Kimlik |
|---|---|---|---|---|
| 1 | بَيَّنُ | bayyanu | açıkladı, beyan etti | `l_bay_anu_305824` |
| 2 | ٱسْتَوَىٰٓ | astavâ | yöneldi; eşit oldu | `l_sotawaY_89d53f` |
| 3 | ٱخْتَلَفَ | ahtalafa | ayrılığa düştü | `l_xotalafa_cd0ab4` |
| 4 | ٱبْتَغَىٰ | abtagâ | aradı, istedi | `l_botagaY_ad5f0f` |
| 5 | أَقْسَمُ | aksamu | yemin etti, and içti | `l_aqosamu_a01a25` |

### u09.08 · Yöneltmek ve fayda

Kavram: — · Uygula: examples

| # | Arapça | Okunuş | Anlam | Kimlik |
|---|---|---|---|---|
| 1 | وَلَّىٰ | vallâ | çevirdi, yöneltti | `l_wal_aY_e4e16c` |
| 2 | أَبْصَرَ | absara | gördü, anladı | `l_aboSara_9f0224` |
| 3 | أَغْنَتْ | agnat | fayda verdi, işe yaradı | `l_agonato_9fcd5e` |
| 4 | أَصْبَحَ | asbaha | sabahladı; hâline geldi | `l_aSobaHa_69bc2c` |
| 5 | ٱسْتَجَابَ | astacâba | karşılık verdi, icabet etti | `l_sotajaAba_abdb53` |

### u09.09 · Kurtuluş ve çaba

Kavram: — · Uygula: examples

| # | Arapça | Okunuş | Anlam | Kimlik |
|---|---|---|---|---|
| 1 | أَفْلَحَ | aflaha | kurtuluşa erdi, başardı | `l_afolaHa_e69ae1` |
| 2 | جَٰهَدَ | câhada | çaba gösterdi, cihat etti | `l_ja_hada_33407c` |
| 3 | زَيَّنَ | zayyana | süsledi, güzel gösterdi | `l_zay_ana_5368d6` |
| 4 | جَٰدَلُ | câdalu | tartıştı, çekişti | `l_ja_dalu_728397` |
| 5 | قَدَّمَ | kaddama | önden gönderdi, takdim etti | `l_qad_ama_29cf56` |

### u09.10 · Vefat ve kurtarmak

Kavram: — · Uygula: examples

| # | Arapça | Okunuş | Anlam | Kimlik |
|---|---|---|---|---|
| 1 | تَوَفَّىٰ | tavaffâ | canını aldı, vefat ettirdi | `l_tawaf_aY_1ebd4b` |
| 2 | أَنجَىٰ | ancâ | kurtardı | `l_anjaY_cbb481` |
| 3 | بَدَّلَ | baddala | değiştirdi | `l_bad_ala_16265e` |
| 4 | أَذَاقَ | azâka | tattırdı | `l_a_aAqa_3f3c06` |
| 5 | سَخَّرَ | sahhara | boyun eğdirdi, emre amade kıldı | `l_sax_ara_9612f4` |
| 6 | ٱشْتَرَىٰ | aştarâ | satın aldı | `l_otaraY_52a098` |

### u09.11 · Çağırmak, sakınmak ve müjdelemek

Kavram: — · Uygula: examples

| # | Arapça | Okunuş | Anlam | Kimlik |
|---|---|---|---|---|
| 1 | دَعَا | daʿâ | çağırdı; dua etti | `l_daEaA_f5ec67` |
| 2 | ٱتَّقَىٰ | attakâ | sakındı, korundu | `l_t_aqaY_bc8006` |
| 3 | ٱسْتُهْزِئَ | astuhzi'a | alay etti | `l_sotuhozi_a_a56746` |
| 4 | بُشِّرَ | buşşira | müjdeledi | `l_bu_ira_749280` |
| 5 | أَعْرَضَ | aʿrada | yüz çevirdi, aldırış etmedi | `l_aEoraDa_78a3e1` |
| 6 | كَلَّمَ | kallama | konuştu, söz söyledi | `l_kal_ama_04b12e` |


## Ünite 10 · Bir kök, bir aile

Vaat: Bir kökten türeyen kelime ailesini göreceksin.

### u10.01 · Yapan ve yapılan

Kavram: g19 Yapan ve yapılan: kâtib, mektûb · Uygula: examples

| # | Arapça | Okunuş | Anlam | Kimlik |
|---|---|---|---|---|
| 1 | مُسَمًّى | musammen | belirlenmiş, adı konmuş | `l_m_usam_FY_24926e` |
| 2 | أَمِنَ | amina | güvende oldu, emin oldu | `l_amina_0a79a6` |
| 3 | عَلِيم | ʿalîm | her şeyi bilen | `l_Ealiym_c50d0d` |
| 4 | مُؤْمِنَٰت | mu'minât | inanan kadınlar | `l_m_u_omina_t_b9c5a2` |
| 5 | مُكَذِّبِين | mukazzibîn | yalanlayanlar | `l_m_uka_ibiyn_f66cdd` |

### u10.02 · Fiilin adı

Kavram: g20 Fiilin adı: bilme, anma, inanma · Uygula: examples

| # | Arapça | Okunuş | Anlam | Kimlik |
|---|---|---|---|---|
| 1 | عِلْم | ʿilm | bilgi, ilim | `l_Eilom_2f0f9d` |
| 2 | قَوْل | kavl | söz | `l_qawol_58e075` |
| 3 | غَفُور | gafûr | çok bağışlayan | `l_gafuwr_926fa2` |
| 4 | مَغْفِرَة | magfiret | bağışlanma | `l_m_agofirap_60a926` |
| 5 | كَٰفِرُون | kâfirûn | inkârcılar | `l_ka_firuwn_165d2d` |

### u10.03 · Daha iyi bilen ve daha çok

Kavram: — · Uygula: examples

| # | Arapça | Okunuş | Anlam | Kimlik |
|---|---|---|---|---|
| 1 | أَعْلَم | aʿlam | daha iyi bilen | `l_aEolam_db561d` |
| 2 | أَكْثَر | aksar | daha çok, çoğu | `l_akovar_f7f01e` |
| 3 | ذِكْرَىٰ | zikrâ | öğüt, hatırlatma | `l_ikoraY_20da2f` |
| 4 | أَشَدّ | aşadd | daha çetin, daha şiddetli | `l_a_ad_4fecc8` |
| 5 | ذِكْر | zikr | anma, hatırlama | `l_ikor_0e35a1` |

### u10.04 · İnkâr eden

Kavram: — · Uygula: examples

| # | Arapça | Okunuş | Anlam | Kimlik |
|---|---|---|---|---|
| 1 | كَافِر | kâfir | inkâr eden, nankör | `l_kaAfir_9b3cf0` |
| 2 | خَلْق | halk | yaratma, yaratılış | `l_xaloq_875745` |
| 3 | صَادِق | sâdik | doğru sözlü | `l_SaAdiq_43c41b` |
| 4 | شَهِيد | şahîd | tanık, şahit | `l_ahiyd_b0cb34` |
| 5 | شَهَٰدَة | şahâdet | tanıklık, şahitlik | `l_aha_dap_12afc0` |

### u10.05 · Tanıklık eden

Kavram: — · Uygula: examples

| # | Arapça | Okunuş | Anlam | Kimlik |
|---|---|---|---|---|
| 1 | شَاهِد | şâhid | tanıklık eden | `l_aAhid_a005f4` |
| 2 | عَمَل | ʿamal | iş, amel | `l_Eamal_8215bb` |
| 3 | ظَالِم | zâlim | zulmeden, haksızlık eden | `l_ZaAlim_fae7dd` |
| 4 | ظُلُمَٰت | zulumât | karanlıklar (çoğul) | `l_Zuluma_t_933b08` |
| 5 | أَحْسَن | ahsan | daha güzel | `l_aHosan_e3fcdb` |

### u10.06 · Zulmetmek

Kavram: — · Uygula: examples

| # | Arapça | Okunuş | Anlam | Kimlik |
|---|---|---|---|---|
| 1 | ظَلَمَ | zalama | zulmetti, haksızlık etti | `l_Zalama_7a9278` |
| 2 | حَسَنَة | hasanet | iyilik, güzellik | `l_Hasanap_efe980` |
| 3 | حَسَن | hasan | güzel, iyi | `l_Hasan_003925` |
| 4 | مُفْسِد | mufsid | bozguncu, fesat çıkaran | `l_mufosid_901e3a` |
| 5 | صَٰلِح | sâlih | iyi, düzgün (iş/kişi) | `l_Sa_liH_30bb88` |

### u10.07 · İyi işler

Kavram: — · Uygula: examples

| # | Arapça | Okunuş | Anlam | Kimlik |
|---|---|---|---|---|
| 1 | صَٰلِحَٰت | sâlihât | iyi işler, güzel ameller | `l_S_a_liHa_t_f6a492` |
| 2 | مُنَٰفِقُون | munâfikûn | ikiyüzlüler, münafıklar | `l_muna_fiquwn_bdda5c` |
| 3 | رِزْق | rizk | rızık, nasip | `l_rizoq_aec3ab` |
| 4 | جَمِيع | camîʿ | hepsi, topluca | `l_jamiyE_be9182` |
| 5 | أَجْمَعِين | acmaʿîn | hepsi, tamamı | `l_ajomaEiyn_0fc80b` |

### u10.08 · Toplamak ve hayat

Kavram: — · Uygula: examples

| # | Arapça | Okunuş | Anlam | Kimlik |
|---|---|---|---|---|
| 1 | جَمَعَ | camaʿa | topladı, biriktirdi | `l_jamaEa_62dac9` |
| 2 | حَيَوٰة | hayât | hayat, yaşam | `l_Hayaw_p_e08aa3` |
| 3 | هُدًى | huden | hidayet, doğru yol | `l_hudFY_2e4b07` |
| 4 | فَضْل | fadl | lütuf, ihsan | `l_faDol_4925b8` |
| 5 | قِيَٰمَة | kiyâmet | diriliş, kalkış | `l_qiya_map_2880f6` |

### u10.09 · Diri ve yolunu kaybetmek

Kavram: — · Uygula: examples

| # | Arapça | Okunuş | Anlam | Kimlik |
|---|---|---|---|---|
| 1 | حَيّ | hayy | diri, canlı | `l_Hay_3dc2a8` |
| 2 | ضَلَّ | dalla | yolunu kaybetti, saptı | `l_Dal_a_2775a8` |
| 3 | قَامَ | kâma | kalktı, ayağa kalktı | `l_qaAma_63cbf7` |
| 4 | أَمْر | amr | iş, durum | `l_amor_9fbe48` |
| 5 | شَرِيك | şarîk | ortak | `l_ariyk_5de5f5` |

### u10.10 · Ölüm ve sapkınlık

Kavram: — · Uygula: examples

| # | Arapça | Okunuş | Anlam | Kimlik |
|---|---|---|---|---|
| 1 | مَوْت | mavt | ölüm, ölme | `l_mawot_7aa65a` |
| 2 | ضَلَٰل | dalâl | sapkınlık, yolunu yitirme | `l_Dala_l_fc4484` |
| 3 | كَبِير | kabîr | büyük | `l_kabiyr_bbdade` |
| 4 | عَهْد | ʿahd | söz, ahit | `l_Eahod_2c711f` |
| 5 | حِسَاب | hisâb | hesap, sorgu | `l_HisaAb_b41eae` |

### u10.11 · Ölmek ve nimet

Kavram: — · Uygula: examples

| # | Arapça | Okunuş | Anlam | Kimlik |
|---|---|---|---|---|
| 1 | مَاتَ | mâta | öldü | `l_m_aAta_a0f90e` |
| 2 | نِعْمَة | niʿmet | nimet, iyilik | `l_niEomap_410611` |
| 3 | نَعَم | naʿam | sağmal hayvanlar (deve, sığır, koyun) | `l_n_aEam_57fa95` |
| 4 | سَجَدَ | sacada | secde etti, yere kapandı | `l_sajada_c38135` |
| 5 | مَسْجِد | mascid | secde yeri, mescit | `l_masojid_ddafe8` |

### u10.12 · Ölü ve secde

Kavram: — · Uygula: examples

| # | Arapça | Okunuş | Anlam | Kimlik |
|---|---|---|---|---|
| 1 | مَيِّت | mayyit | ölü | `l_m_ay_it_fb6ea2` |
| 2 | سَاجِد | sâcid | secde eden | `l_saAjid_62ac5a` |
| 3 | مَكَان | makân | yer, mekân | `l_m_akaAn_b26fbd` |
| 4 | مَعْرُوف | maʿrûf | uygun, iyi bilinen (şey) | `l_m_aEoruwf_413882` |
| 5 | نَصَرَ | nasara | yardım etti | `l_naSara_e01de2` |

### u10.13 · Yardımcı ve zafer

Kavram: — · Uygula: examples

| # | Arapça | Okunuş | Anlam | Kimlik |
|---|---|---|---|---|
| 1 | نَصِير | nasîr | yardımcı | `l_naSiyr_87b8a1` |
| 2 | نَصْر | nasr | yardım, zafer | `l_naSor_e325f5` |
| 3 | فَاسِق | fâsik | yoldan çıkan, itaatsiz | `l_faAsiq_392fe3` |
| 4 | عَٰقِبَة | ʿâkibet | sonuç, akıbet | `l_Ea_qibap_313f20` |
| 5 | عِقَاب | ʿikâb | ceza, karşılık | `l_EiqaAb_736634` |

### u10.14 · Son ve sürekli kalan

Kavram: — · Uygula: examples

| # | Arapça | Okunuş | Anlam | Kimlik |
|---|---|---|---|---|
| 1 | آخِر | âhir | son, sonraki | `l_A_xir_5b7462` |
| 2 | مُبِين | mubîn | açık, apaçık | `l_m_ubiyn_4f4924` |
| 3 | خَٰلِد | hâlid | sürekli kalan | `l_xa_lid_db5cbd` |
| 4 | مُجْرِم | mucrim | suçlu, günahkâr | `l_mujorim_63cb7c` |
| 5 | سُوٓء | sû' | kötülük, fena şey | `l_suw_8ed869` |

### u10.15 · Görünmeyen ve sakınanlar

Kavram: — · Uygula: examples

| # | Arapça | Okunuş | Anlam | Kimlik |
|---|---|---|---|---|
| 1 | غَيْب | gayb | görünmeyen, gizli | `l_gayob_611f35` |
| 2 | مُتَّقِين | muttakîn | sakınanlar | `l_mut_aqiyn_afd23b` |
| 3 | وَعْد | vaʿd | söz, vaat | `l_waEod_f8ac8c` |
| 4 | مُلْك | mulk | hükümranlık, egemenlik | `l_mulok_138b85` |
| 5 | جَزَآء | cazâ' | karşılık, ceza | `l_jazaA_22eebd` |

### u10.16 · İzin ve delil

Kavram: — · Uygula: examples

| # | Arapça | Okunuş | Anlam | Kimlik |
|---|---|---|---|---|
| 1 | إِذْن | izn | izin | `l_i_on_21db05` |
| 2 | سُلْطَٰن | sultân | delil, yetki | `l_suloTa_n_bfb334` |
| 3 | فِتْنَة | fitnet | deneme, imtihan | `l_fitonap_d46440` |
| 4 | كَذِب | kazib | yalan, asılsız söz | `l_ka_ib_7a5632` |
| 5 | كَٰذِب | kâzib | yalan söyleyen, yalancı | `l_ka_ib_807adf` |

### u10.17 · Kaybedenler

Kavram: — · Uygula: examples

| # | Arapça | Okunuş | Anlam | Kimlik |
|---|---|---|---|---|
| 1 | خَٰسِرِين | hâsirîn | kaybedenler, zarara uğrayanlar | `l_xa_siriyn_7458a8` |
| 2 | زَكَوٰة | zakât | zekât; arınma | `l_zakaw_p_c43173` |
| 3 | مَصِير | masîr | varılacak yer, son | `l_maSiyr_274d5b` |
| 4 | سِحْر | sihr | büyü, sihir | `l_siHor_af28f3` |
| 5 | غَٰفِل | gâfil | habersiz, dalgın | `l_ga_fil_8b70be` |

### u10.18 · Eşit ve boş

Kavram: — · Uygula: examples

| # | Arapça | Okunuş | Anlam | Kimlik |
|---|---|---|---|---|
| 1 | سَوَآء | savâ' | eşit, bir | `l_sawaA_91f5d4` |
| 2 | بَٰطِل | bâtil | boş, geçersiz; batıl | `l_ba_Til_462461` |
| 3 | كَيْد | kayd | tuzak, hile | `l_kayod_27a62a` |
| 4 | خَوْف | havf | korku | `l_xawof_3af862` |
| 5 | لِقَآء | likâ' | kavuşma, karşılaşma | `l_liqaA_390528` |

### u10.19 · Topluluk ve sığınak

Kavram: — · Uygula: examples

| # | Arapça | Okunuş | Anlam | Kimlik |
|---|---|---|---|---|
| 1 | طَآئِفَة | tâ'ifet | bölük, topluluk | `l_TaA_ifap_740947` |
| 2 | دُعَآء | duʿâ' | çağrı, dua | `l_duEaA_bcbfae` |
| 3 | مَأْوَىٰ | ma'vâ | barınak, sığınılacak yer | `l_ma_owaY_b4a4a7` |
| 4 | سَٰحِر | sâhir | büyücü | `l_sa_Hir_f05100` |

### u10.20 · Kök ailesi: hüküm ve hikmet

Kavram: — · Uygula: examples

| # | Arapça | Okunuş | Anlam | Kimlik |
|---|---|---|---|---|
| 1 | حُكْم | hukm | hüküm, yargı | `l_Hukom_5dd24a` |
| 2 | حِكْمَة | hikmet | hikmet, bilgelik | `l_Hikomap_d90667` |
| 3 | ظَنّ | zann | sanı, tahmin | `l_Zan_1e2f1f` |
| 4 | حَكَمَ | hakama | hükmetti, karar verdi | `l_Hakama_763b9a` |


## Ünite 11 · Kalıplar

Vaat: Kalıp değişince anlamın nasıl kaydığını göreceksin.

### u11.01 · Kalıp değişince anlam değişir

Kavram: g21 Kalıp değişince anlam kayar: ilim → talim · Uygula: examples

| # | Arapça | Okunuş | Anlam | Kimlik |
|---|---|---|---|---|
| 1 | عَلَّمَ | ʿallama | öğretti | `l_Eal_ama_5c04b6` |
| 2 | ٱسْتَغْفَرَ | astagfara | bağışlanma diledi | `l_sotagofara_863081` |
| 3 | مُسْلِم | muslim | teslim olan, Müslüman | `l_musolim_c8bd6d` |
| 4 | أَسْلَمَ | aslama | teslim oldu, Müslüman oldu | `l_asolama_25091d` |

### u11.02 · İnanan ve düşünen

Kavram: — · Uygula: examples

| # | Arapça | Okunuş | Anlam | Kimlik |
|---|---|---|---|---|
| 1 | مُؤْمِن | mu'min | inanan, mümin | `l_mu_omin_870b47` |
| 2 | تَذَكَّرَ | tazakkara | düşünüp öğüt aldı | `l_ta_ak_ara_901fef` |
| 3 | مُرْسَل | mursal | gönderilmiş elçi | `l_m_urosal_fc2a88` |
| 4 | مُحْسِن | muhsin | iyilik eden | `l_muHosin_7e031b` |

### u11.03 · İman, iyilik ve diriltmek

Kavram: — · Uygula: examples

| # | Arapça | Okunuş | Anlam | Kimlik |
|---|---|---|---|---|
| 1 | إِيمَٰن | îmân | inanç, iman | `l_iyma_n_4151c0` |
| 2 | أَحْسَنَ | ahsana | iyilik etti, güzel yaptı | `l_aHosana_1ac221` |
| 3 | حَكِيم | hakîm | hikmet sahibi | `l_Hakiym_e62e6c` |
| 4 | أَحْيَا | ahyâ | diriltti, hayat verdi | `l_aHoyaA_35079e` |

### u11.04 · Selâmlama ve ıslah

Kavram: — · Uygula: examples

| # | Arapça | Okunuş | Anlam | Kimlik |
|---|---|---|---|---|
| 1 | أَصْلَحَ | aslaha | düzeltti, ıslah etti | `l_aSolaHa_540483` |
| 2 | تَحِيَّة | tahiyyet | selamlama, esenlik dileği | `l_taHiy_ap_de08b0` |
| 3 | أَمَاتَ | amâta | öldürdü, can aldı | `l_amaAta_5bf411` |

### u11.05 · Doğru yol ve ortak koşmak

Kavram: — · Uygula: examples

| # | Arapça | Okunuş | Anlam | Kimlik |
|---|---|---|---|---|
| 1 | ٱهْتَدَىٰ | ahtadâ | doğru yolu buldu | `l_hotadaY_132fd7` |
| 2 | أَشْرَكَ | aşraka | ortak koştu, şirk koştu | `l_a_oraka_c73d6e` |
| 3 | أَقَامَ | akâma | ayakta tuttu, dosdoğru kıldı | `l_aqaAma_382983` |

### u11.06 · Ortak koşmak

Kavram: — · Uygula: examples

| # | Arapça | Okunuş | Anlam | Kimlik |
|---|---|---|---|---|
| 1 | أَضَلَّ | adalla | saptırdı, yoldan çıkardı | `l_aDal_a_5ed954` |
| 2 | مُشْرِك | muşrik | ortak koşan, müşrik | `l_mu_orik_2ba276` |
| 3 | ٱسْتَكْبَرَ | astakbara | büyüklendi, kibirlendi | `l_sotakobara_4181b5` |


## Ünite 12 · Eğer ve zaman

Vaat: Şart ve zaman cümlelerini çözeceksin.

### u12.01 · 'eğer', '-ınca', '-seydi'

Kavram: g22 'Eğer', '-ınca', '-seydi' · Uygula: examples

| # | Arapça | Okunuş | Anlam | Kimlik |
|---|---|---|---|---|
| 1 | إِن | in | eğer, şayet | `l_in_f645c5` |
| 2 | لَو | lav | -se, -sa (gerçekleşmemiş) | `l_law_8f1f74` |
| 3 | لَوْلَآ | lavlâ | -mese idi | `l_lawolaA_b76376` |
| 4 | حَتَّىٰ | hattâ | ta ki, -e kadar | `l_Hat_aY_47c8d9` |

### u12.02 · Önce, sonra ve o vakit

Kavram: g23 Cümleye zaman rengi veren fiiller: kâne, leyse, asbaha · Uygula: examples

| # | Arapça | Okunuş | Anlam | Kimlik |
|---|---|---|---|---|
| 1 | لَمَّا | lammâ | -ınca, -dığında | `l_lam_aA_c2bb4a` |
| 2 | قَبْل | kabl | önce | `l_qabol_0769c8` |
| 3 | إِذ | iz | hani, o vakit | `l_i_a0c726` |
| 4 | بَعْد | baʿd | sonra | `l_baEod_22102e` |

### u12.03 · Sık kalıplar

Kavram: g24 Kur'an'ın sık kalıpları · Uygula: examples

| # | Arapça | Okunuş | Anlam | Kimlik |
|---|---|---|---|---|
| 1 | أَبَدًا | abaden | hiçbir zaman, ebediyen | `l_abadFA_f54ff9` |
| 2 | حِين | hîn | zaman, vakit | `l_Hiyn_b9a2cc` |
| 3 | مَن | man | kim; o kimse ki | `l_man_48b676` |
