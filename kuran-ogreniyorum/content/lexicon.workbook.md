# KAO · Seviyeli kelime çalışma kitabı (taslak)

> Amaç: anlamları **kademeli** yazmak (03 §1) ve her kelimeyi **cümle bağlamında**
> görmek (02 §2.6). Arapça ve `context_ar` korpustan gelir — **değiştirme**.

## Nasıl doldurulur
| Sütun | Yazılacak |
|---|---|
| `ar` · `translit_tr` · `root` · `context_ar` · `context_ref` | **mekanik** (korpustan) — dokunma |
| `ref_tr` · `context_ref_tr` | **REFERANS** (quran.com tr kelime-kelime, 06 §2) — kopyalama, kendi anlamını yaz |
| `tr1` | kelimenin kısa Türkçe anlamı **zorunlu** |
| `tr2` | ikinci anlam (varsa) |
| `pattern` | kalıp etiketi (örn. `masdar`) |
| `cognateTr` | Türkçedeki karşılığı (varsa) |
| `cognateShift` | yalnız anlam kayması varsa |
| `context_tr` | `context_ar` cümlesinin kısa çevirisi |
| `verifiedBy` | onaylayan ad |
| `verifiedAt` | onay tarihi `YYYY-AA-GG` (iki ayrı gün: iki tarih) |

Onay kuralı 06 §3: iki bağımsız göz **ya da** aynı kişinin iki ayrı günü.

## Sıra (03 §1: kademeli seviyeler)

### Kova D · Seviye 1 çekirdeği (Fâtiha + İhlâs/Felak/Nâs + tesbihat — zaten okuduğun metin) — **63** kelime

| ar | translit_tr | root | context_ar | context_ref | ref_tr | context_ref_tr | tr1 | tr2 | pattern | cognateTr | cognateShift | context_tr | verifiedBy | verifiedAt | lemmaId |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| ٱللَّه | allah | اله | بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ | 1:1 | Allah'ın | adıyla Allah'ın Rahman Rahim |  |  |  |  |  |  |  |  | l_ll_ah_d0a09b |
| رَّحِيم | rahîm | رحم | ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ | 1:1 | Rahim | Allah'ın Rahman Rahim |  |  |  |  |  |  |  |  | l_r_aHiym_ecdbe9 |
| رَّحْمَٰن | rahmân | رحم | بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ | 1:1 | Rahman | adıyla Allah'ın Rahman Rahim |  |  |  |  |  |  |  |  | l_r_aHoma_n_c13ea2 |
| ٱسْم | asm | سمو | بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ | 1:1 | adıyla | adıyla Allah'ın Rahman |  |  |  |  |  |  |  |  | l_som_585f33 |
| رَبّ | rabb | ربب | ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَـٰلَمِينَ | 1:2 | Rabbi | hamdolsun Allah'a Rabbi Alemlerin |  |  |  |  |  |  |  |  | l_rab_fc2490 |
| عَٰلَمِين | ʿâlamîn | علم | لِلَّهِ رَبِّ ٱلْعَـٰلَمِينَ | 1:2 | Alemlerin | Allah'a Rabbi Alemlerin |  |  |  |  |  |  |  |  | l_Ea_lamiyn_c337cf |
| حَمْد | hamd | حمد | ٱلْحَمْدُ لِلَّهِ رَبِّ | 1:2 | hamdolsun | hamdolsun Allah'a Rabbi |  |  |  |  |  |  |  |  | l_Hamod_98138a |
| يَوْم | yavm | يوم | مَـٰلِكِ يَوْمِ ٱلدِّينِ | 1:4 | gününün | sahibidir gününün Din |  |  |  |  |  |  |  |  | l_yawom_9b88c1 |
| دِين | dîn | دين | مَـٰلِكِ يَوْمِ ٱلدِّينِ | 1:4 | Din | sahibidir gününün Din |  |  |  |  |  |  |  |  | l_diyn_6c222f |
| مَٰلِك | mâlik | ملك | مَـٰلِكِ يَوْمِ ٱلدِّينِ | 1:4 | sahibidir | sahibidir gününün Din |  |  |  |  |  |  |  |  | l_ma_lik_581500 |
| عَبَدَ | ʿabada | عبد | إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ | 1:5 | kulluk ederiz | ancak sana kulluk ederiz ancak senden yardım isteriz |  |  |  |  |  |  |  |  | l_Eabada_557021 |
| إِيَّا | iyyâ |  | إِيَّاكَ نَعْبُدُ وَإِيَّاكَ | 1:5 | ancak sana | ancak sana kulluk ederiz ancak senden |  |  |  |  |  |  |  |  | l_iy_aA_dbb412 |
| ٱسْتَعِينُ | astaʿînu | عون | نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ | 1:5 | yardım isteriz | kulluk ederiz ancak senden yardım isteriz |  |  |  |  |  |  |  |  | l_sotaEiynu_1fb93f |
| هَدَى | hadî | هدي | ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ | 1:6 | bizi ilet | bizi ilet yola doğru |  |  |  |  |  |  |  |  | l_hadaY_a88771 |
| صِرَٰط | sirât | صرط | ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ | 1:6 | yola | bizi ilet yola doğru |  |  |  |  |  |  |  |  | l_Sira_T_7c7de6 |
| مُّسْتَقِيم | mustakîm | قوم | ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ | 1:6 | doğru | bizi ilet yola doğru |  |  |  |  |  |  |  |  | l_m_usotaqiym_930fac |
| لَا | lâ |  | ٱلْمَغْضُوبِ عَلَيْهِمْ وَلَا ٱلضَّآلِّينَ | 1:7 | ve değil | gazabedilmiş olanların kendilerine ve değil sapmışların |  |  |  |  |  |  |  |  | l_laA_4e2bfd |
| ٱلَّذِى | allazî |  | صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ | 1:7 | onlar ki | yoluna onlar ki ni'met verdin kimselerin |  |  |  |  |  |  |  |  | l_l_a_iY_1a8370 |
| عَلَىٰ | ʿalâ |  | ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ ٱلْمَغْضُوبِ | 1:7 | kimselerin | onlar ki ni'met verdin kimselerin değil gazabedilmiş olanların |  |  |  |  |  |  |  |  | l_EalaY_f79ef3 |
| غَيْر | gayr | غير | أَنْعَمْتَ عَلَيْهِمْ غَيْرِ ٱلْمَغْضُوبِ عَلَيْهِمْ | 1:7 | değil | ni'met verdin kimselerin değil gazabedilmiş olanların kendilerine |  |  |  |  |  |  |  |  | l_gayor_6b16f9 |
| أَنْعَمَ | anʿama | نعم | صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ | 1:7 | ni'met verdin | yoluna onlar ki ni'met verdin kimselerin değil |  |  |  |  |  |  |  |  | l_anoEama_bec8a1 |
| ضَآلّ | dâll | ضلل | عَلَيْهِمْ وَلَا ٱلضَّآلِّينَ | 1:7 | sapmışların | kendilerine ve değil sapmışların |  |  |  |  |  |  |  |  | l_DaA_l_145c36 |
| مَغْضُوب | magdûb | غضب | عَلَيْهِمْ غَيْرِ ٱلْمَغْضُوبِ عَلَيْهِمْ وَلَا | 1:7 | gazabedilmiş olanların | kimselerin değil gazabedilmiş olanların kendilerine ve değil |  |  |  |  |  |  |  |  | l_magoDuwb_278690 |
| فِى | fî |  | لَا رَيْبَ فِيهِ هُدًى لِّلْمُتَّقِينَ | 2:2 | kendisinde | yoktur hiç şüphe kendisinde yol göstericidir müttakiler için |  |  |  |  |  |  |  |  | l_fiY_39977c |
| مِن | min |  | وَيُقِيمُونَ ٱلصَّلَوٰةَ وَمِمَّا رَزَقْنَـٰهُمْ يُنفِقُونَ | 2:3 | ve şeyden | ve kılarlar namazlarını ve şeyden kendilerini rızıklandırdığımız infak ederler |  |  |  |  |  |  |  |  | l_min_1f6fa6 |
| صَلَوٰة | salûâe | صلو | بِٱلْغَيْبِ وَيُقِيمُونَ ٱلصَّلَوٰةَ وَمِمَّا رَزَقْنَـٰهُمْ | 2:3 | namazlarını | gaybde(gizlide) ve kılarlar namazlarını ve şeyden kendilerini rızıklandırdığımız |  |  |  |  |  |  |  |  | l_Salaw_p_7f701a |
| مَا | mâ |  | وَٱلَّذِينَ يُؤْمِنُونَ بِمَآ أُنزِلَ إِلَيْكَ | 2:4 | şeye | ve onlar ki iman ederler şeye indirilen sana |  |  |  |  |  |  |  |  | l_maA_13038a |
| لَم | lam |  | ءَأَنذَرْتَهُمْ أَمْ لَمْ تُنذِرْهُمْ لَا | 2:6 | uyarmasan da | onları uyarman yada uyarmasan da you warn them inanmazlar |  |  |  |  |  |  |  |  | l_lam_7f1b55 |
| قَالَ | kâla | قول | ٱلنَّاسِ مَن يَقُولُ ءَامَنَّا بِٱللَّهِ | 2:8 | derler | insanlardan öyleleri de derler inandık Allaha |  |  |  |  |  |  |  |  | l_qaAla_657dd3 |
| نَّاس | nâs | نوس | وَمِنَ ٱلنَّاسِ مَن يَقُولُ | 2:8 | insanlardan | ve insanlardan öyleleri de derler |  |  |  |  |  |  |  |  | l_n_aAs_ba9c78 |
| كَانَ | kâna | كون | أَلِيمٌۢ بِمَا كَانُوا۟ يَكْذِبُونَ | 2:10 | olduklarından | acı ötürü olduklarından yalancı |  |  |  |  |  |  |  |  | l_kaAna_febd3a |
| إِذَا | izâ |  | وَإِذَا قِيلَ لَهُمْ | 2:11 | zaman | zaman denildiği onlara |  |  |  |  |  |  |  |  | l_i_aA_5b7376 |
| خَلَقَ | halaka | خلق | رَبَّكُمُ ٱلَّذِى خَلَقَكُمْ وَٱلَّذِينَ مِن | 2:21 | sizi yarattı | Rabbinize o ki; sizi yarattı ve o ki; sizden öncekileri |  |  |  |  |  |  |  |  | l_xalaqa_2fa056 |
| عَبْد | ʿabd | عبد | نَزَّلْنَا عَلَىٰ عَبْدِنَا فَأْتُوا۟ بِسُورَةٍ | 2:23 | Our slave | We have revealed kulumuz (Muhammed)e Our slave haydi getirin bir sure |  |  |  |  |  |  |  |  | l_Eabod_3558c0 |
| سُبْحَٰن | subhân | سبح | قَالُوا۟ سُبْحَـٰنَكَ لَا عِلْمَ | 2:32 | Seni tesbih ederiz | dediler ki Seni tesbih ederiz yoktur bilgimiz |  |  |  |  |  |  |  |  | l_suboHa_n_59533b |
| رَحْمَة | rahmae | رحم | ٱللَّهِ عَلَيْكُمْ وَرَحْمَتُهُۥ لَكُنتُم مِّنَ | 2:64 | ve merhameti | Allah'ın size ve merhameti elbette olurdunuz ziyana uğrayanlardan |  |  |  |  |  |  |  |  | l_raHomap_490a24 |
| عُذْ | ʿuz | عوذ | هُزُوًا قَالَ أَعُوذُ بِٱللَّهِ أَنْ | 2:67 | sığınırım | alay dedi sığınırım Allah'a olmaktan |  |  |  |  |  |  |  |  | l_Eu_o_4dcde9 |
| شَهِدَ | şahida | شهد | أَقْرَرْتُمْ وَأَنتُمْ تَشْهَدُونَ | 2:84 | şahidsiniz | kabul etmiştiniz ve siz şahidsiniz |  |  |  |  |  |  |  |  | l_ahida_de36bb |
| رَسُول | rasûl | رسل | مِنۢ بَعْدِهِۦ بِٱلرُّسُلِ وَءَاتَيْنَا عِيسَى | 2:87 | peygamberler | arkasından after him peygamberler ve verdik Îsa'ya |  |  |  |  |  |  |  |  | l_rasuwl_9a5606 |
| أَحَد | ahad | احد | أَشْرَكُوا۟ يَوَدُّ أَحَدُهُمْ لَوْ يُعَمَّرُ | 2:96 | her biri | ortak koşan(lar) ister her biri olsa yaşatılmasını |  |  |  |  |  |  |  |  | l_aHad_84cb2f |
| إِلَٰه | ilâh | اله | قَالُوا۟ نَعْبُدُ إِلَـٰهَكَ وَإِلَـٰهَ ءَابَآئِكَ | 2:133 | senin tanrına | dediler ki kulluk edeceğiz senin tanrına ve tanrısına ataların |  |  |  |  |  |  |  |  | l_ila_h_3366e5 |
| شَرّ | şarr | شرر | شَيْـًٔا وَهُوَ شَرٌّ لَّكُمْ وَٱللَّهُ | 2:216 | kötüdür | bir şey (de) o kötüdür sizin için Allah |  |  |  |  |  |  |  |  | l_ar_7b0807 |
| أَكْبَر | akbar | كبر | أَهْلِهِۦ مِنْهُ أَكْبَرُ عِندَ ٱللَّهِ | 2:217 | daha büyük (bir günahtır) | halkını ondan (Mekke'den) daha büyük (bir günahtır) yanında Allah |  |  |  |  |  |  |  |  | l_akobar_df8ff4 |
| عُقْدَة | ʿukdae | عقد | وَلَا تَعْزِمُوا۟ عُقْدَةَ ٱلنِّكَاحِ حَتَّىٰ | 2:235 | akdine (kıymaya) | ve kalkışmayın resolve (on) akdine (kıymaya) nikah kadar |  |  |  |  |  |  |  |  | l_Euqodap_88823f |
| مَلِك | malik | ملك | ٱبْعَثْ لَنَا مَلِكًا نُّقَـٰتِلْ فِى | 2:246 | bir hükümdar | gönder bize bir hükümdar (onun önderliğinde) savaşalım yolunda |  |  |  |  |  |  |  |  | l_malik_2063d1 |
| صَدْر | sadr | صدر | مَا فِى صُدُورِكُمْ أَوْ تُبْدُوهُ | 3:29 | your breasts | olanı göğüslerinizde your breasts veya açığa vursanız onu |  |  |  |  |  |  |  |  | l_Sador_913a7b |
| طَيِّبَة | tayyibae | طيب | لَّدُنكَ ذُرِّيَّةً طَيِّبَةً إِنَّكَ سَمِيعُ | 3:38 | temiz | Yourself bir nesil temiz şüphesiz sen işitensin |  |  |  |  |  |  |  |  | l_Tay_ibap_bae173 |
| حَسَدَ | hasada | حسد | أَمْ يَحْسُدُونَ ٱلنَّاسَ عَلَىٰ | 4:54 | kıskanıyorlar mı | yoksa kıskanıyorlar mı insanlara yüzünden |  |  |  |  |  |  |  |  | l_Hasada_76834c |
| تَحِيَّة | tahiyyae | حيي | وَإِذَا حُيِّيتُم بِتَحِيَّةٍ فَحَيُّوا۟ بِأَحْسَنَ | 4:86 | bir selam ile | ve zaman selamlandığınız bir selam ile siz de selam verin daha güzeliyle |  |  |  |  |  |  |  |  | l_taHiy_ap_de08b0 |
| سَلَٰم | salâm | سلم | أَلْقَىٰٓ إِلَيْكُمُ ٱلسَّلَـٰمَ لَسْتَ مُؤْمِنًا | 4:94 | selam | veren size selam sen değilsin mü'min |  |  |  |  |  |  |  |  | l_sala_m_daff0b |
| وَسْوَسَ | vasvasa | وسوس | فَوَسْوَسَ لَهُمَا ٱلشَّيْطَـٰنُ | 7:20 | derken fısıldadı | derken fısıldadı onlara şeytan |  |  |  |  |  |  |  |  | l_wasowasa_aeaf29 |
| بَرَكَٰت | barakât | برك | لَفَتَحْنَا عَلَيْهِم بَرَكَـٰتٍ مِّنَ ٱلسَّمَآءِ | 7:96 | bolluklar | açardık üzerlerine bolluklar gökten the heaven |  |  |  |  |  |  |  |  | l_baraka_t_188a75 |
| جِنَّة | cinnae | جنن | بِصَاحِبِهِم مِّن جِنَّةٍ إِنْ هُوَ | 7:184 | delilik | arkadaşlarında hiçbir delilik o he |  |  |  |  |  |  |  |  | l_jin_ap_589db1 |
| وَلَدَ | valada | ولد | قَالَتْ يَـٰوَيْلَتَىٰٓ ءَأَلِدُ وَأَنَا۠ عَجُوزٌ | 11:72 | ben doğuracak mıyım? | dedi ki ey vay halime ben doğuracak mıyım? ben böyle kocamış bir kadın iken |  |  |  |  |  |  |  |  | l_walada_bc1aa9 |
| صَّمَد | samad | صمد | ٱللَّهُ ٱلصَّمَدُ | 112:2 | Samed'dir | Allah Samed'dir |  |  |  |  |  |  |  |  | l_S_amad_6a6bdd |
| كُفُو | kufû | كفا | يَكُن لَّهُۥ كُفُوًا أَحَدٌۢ | 112:4 | dengi | olmamıştır O'nun dengi hiçbir şey |  |  |  |  |  |  |  |  | l_kufuw_3fbe35 |
| فَلَق | falak | فلق | أَعُوذُ بِرَبِّ ٱلْفَلَقِ | 113:1 | karanlığı yarıp sabahı ortaya çıkaran | sığınırım ben Rabbe karanlığı yarıp sabahı ortaya çıkaran |  |  |  |  |  |  |  |  | l_falaq_f1e2b8 |
| غَاسِق | gâsik | غسق | وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ | 113:3 | gecenin | ve şerrinden gecenin zaman karanlığı çöktüğü |  |  |  |  |  |  |  |  | l_gaAsiq_dc791e |
| وَقَبَ | vakaba | وقب | غَاسِقٍ إِذَا وَقَبَ | 113:3 | karanlığı çöktüğü | gecenin zaman karanlığı çöktüğü |  |  |  |  |  |  |  |  | l_waqaba_851dd3 |
| نَّفَّٰثَٰت | naffâsât | نفث | وَمِن شَرِّ ٱلنَّفَّـٰثَـٰتِ فِى ٱلْعُقَدِ | 113:4 | üfleyenlerin | ve şerrinden üfleyenlerin düğümlere the knots |  |  |  |  |  |  |  |  | l_n_af_a_va_t_b7ff1f |
| حَاسِد | hâsid | حسد | وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ | 113:5 | hasedcinin | ve şerrinden hasedcinin zaman hased ettiği |  |  |  |  |  |  |  |  | l_HaAsid_83cf8e |
| وَسْوَاس | vasvâs | وسوس | مِن شَرِّ ٱلْوَسْوَاسِ ٱلْخَنَّاسِ | 114:4 | vesvesecinin | şerrinden (the) evil vesvesecinin sinsi |  |  |  |  |  |  |  |  | l_wasowaAs_75a11c |
| خَنَّاس | hannâs | خنس | شَرِّ ٱلْوَسْوَاسِ ٱلْخَنَّاسِ | 114:4 | sinsi | (the) evil vesvesecinin sinsi |  |  |  |  |  |  |  |  | l_xan_aAs_eb9958 |

### Kova A · Parçacıklar (edat/zamir/bağlaç) — **22** kelime

| ar | translit_tr | root | context_ar | context_ref | ref_tr | context_ref_tr | tr1 | tr2 | pattern | cognateTr | cognateShift | context_tr | verifiedBy | verifiedAt | lemmaId |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| إِنّ | inn |  | إِنَّ ٱلَّذِينَ كَفَرُوا۟ | 2:6 | elbette | elbette ki inkar edenler |  |  |  |  |  |  |  |  | l_in_51f9c7 |
| مَن | man |  | وَمِنَ ٱلنَّاسِ مَن يَقُولُ ءَامَنَّا | 2:8 | öyleleri de | ve insanlardan öyleleri de derler inandık |  |  |  |  |  |  |  |  | l_man_48b676 |
| إِلَىٰ | ilâ |  | بِمَآ أُنزِلَ إِلَيْكَ وَمَآ أُنزِلَ | 2:4 | sana | şeye indirilen sana ve şeye indirilen |  |  |  |  |  |  |  |  | l_ilaY_d3d2d9 |
| إِن | in |  | وَإِن كُنتُمْ فِى | 2:23 | eğer | eğer iseniz içinde |  |  |  |  |  |  |  |  | l_in_f645c5 |
| أَن | an |  | لَا يَسْتَحْىِۦٓ أَن يَضْرِبَ مَثَلًا | 2:26 | misal vermekten | değildir çekinecek misal vermekten set forth bir örneği |  |  |  |  |  |  |  |  | l_an_d1c942 |
| ذَٰلِك | zâlik |  | ذَٰلِكَ ٱلْكِتَـٰبُ لَا | 2:2 | işte o | işte o Kitap yoktur |  |  |  |  |  |  |  |  | l_a_lik_f3410a |
| عَن | ʿan |  | فَأَزَلَّهُمَا ٱلشَّيْطَـٰنُ عَنْهَا فَأَخْرَجَهُمَا مِمَّا | 2:36 | oradan | onlar(ın ayağın)ı kaydırdı şeytan oradan çıkardı yerden |  |  |  |  |  |  |  |  | l_Ean_2cd3f8 |
| قَد | kad |  | عَشْرَةَ عَيْنًا قَدْ عَلِمَ كُلُّ | 2:60 | elbette | twelve göze (pınar) elbette bilmişti bütün |  |  |  |  |  |  |  |  | l_qad_03fa2b |
| أَنّ | ann |  | وَعَمِلُوا۟ ٱلصَّـٰلِحَـٰتِ أَنَّ لَهُمْ جَنَّـٰتٍ | 2:25 | muhakkak | ve işleyen salih işler muhakkak onlar için vardır cennetler |  |  |  |  |  |  |  |  | l_an_e1bf35 |
| ثُمّ | summ |  | أَمْوَٰتًا فَأَحْيَـٰكُمْ ثُمَّ يُمِيتُكُمْ ثُمَّ | 2:28 | sonra | ölüler O sizi diriltti sonra öldürecek sonra |  |  |  |  |  |  |  |  | l_vum_88b269 |
| هَٰذَا | hâzâ |  | رِّزْقًا قَالُوا۟ هَـٰذَا ٱلَّذِى رُزِقْنَا | 2:25 | Bu | rızk olarak derler Bu şeydir rızıklandığımız |  |  |  |  |  |  |  |  | l_ha_aA_9f90d0 |
| أَو | û |  | أَوْ كَصَيِّبٍ مِّنَ | 2:19 | ya da (onlar) | ya da (onlar) boşanan yağmur gibi gökten |  |  |  |  |  |  |  |  | l_aw_43116a |
| إِذ | iz |  | وَإِذْ قَالَ رَبُّكَ | 2:30 | bir zamanlar | bir zamanlar dedi ki Rabbin |  |  |  |  |  |  |  |  | l_i_a0c726 |
| أُولَٰٓئِك | ûlâik |  | أُو۟لَـٰٓئِكَ عَلَىٰ هُدًى | 2:5 | işte onlar | işte onlar üzeredirler bir hidayet |  |  |  |  |  |  |  |  | l_uwla_ik_8eb052 |
| لَو | lû |  | عَلَيْهِمْ قَامُوا۟ وَلَوْ شَآءَ ٱللَّهُ | 2:20 | eğer | üzerlerine dikilip kalırlar eğer dileseydi Allah |  |  |  |  |  |  |  |  | l_law_8f1f74 |
| عِند | ʿind | عند | خَيْرٌ لَّكُمْ عِندَ بَارِئِكُمْ فَتَابَ | 2:54 | katında | daha iyidir sizin için katında yaratıcınız tevbenizi kabul buyurmuş olur |  |  |  |  |  |  |  |  | l_Eind_8fe318 |
| مَع | maʿ |  | قَالُوٓا۟ إِنَّا مَعَكُمْ إِنَّمَا نَحْنُ | 2:14 | sizinle beraberiz | derler şüphesiz biz sizinle beraberiz elbette sadece biz |  |  |  |  |  |  |  |  | l_maE_d833a0 |
| لَمَّا | lammâ |  | ٱسْتَوْقَدَ نَارًا فَلَمَّآ أَضَآءَتْ مَا | 2:17 | ne zaman ki | yakan ateş ne zaman ki aydınlatır çevresini |  |  |  |  |  |  |  |  | l_lam_aA_c2bb4a |
| حَتَّىٰ | hattâ |  | نُّؤْمِنَ لَكَ حَتَّىٰ نَرَى ٱللَّهَ | 2:55 | kadar | (will) we believe sana kadar görünceye Allah'ı |  |  |  |  |  |  |  |  | l_Hat_aY_47c8d9 |
| أَم | am |  | عَلَيْهِمْ ءَأَنذَرْتَهُمْ أَمْ لَمْ تُنذِرْهُمْ | 2:6 | yada | onlara onları uyarman yada uyarmasan da you warn them |  |  |  |  |  |  |  |  | l_am_1e8491 |
| بَل | bal |  | قُلُوبُنَا غُلْفٌۢ بَل لَّعَنَهُمُ ٱللَّهُ | 2:88 | bilakis | kalblerimiz perdelidir bilakis onları la'netlemiştir Allah |  |  |  |  |  |  |  |  | l_bal_1b5a6f |
| لَعَلّ | laʿall |  | مِن قَبْلِكُمْ لَعَلَّكُمْ تَتَّقُونَ | 2:21 | belki | sizden öncekileri before you belki korunursunuz |  |  |  |  |  |  |  |  | l_laEal_7b9569 |

### Kova C · sıra ≤100 (Kur’an’ın en sık kelimeleri) — **55** kelime

| ar | translit_tr | root | context_ar | context_ref | ref_tr | context_ref_tr | tr1 | tr2 | pattern | cognateTr | cognateShift | context_tr | verifiedBy | verifiedAt | lemmaId |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| إِلَّا | illâ |  | وَمَا يَخْدَعُونَ إِلَّآ أَنفُسَهُمْ وَمَا | 2:9 | başkasını | aldatamazlar they deceive başkasını kendilerinden değiller |  |  |  |  |  |  |  |  | l_il_aA_e925a2 |
| ءَامَنَ | âmana | امن | ٱلَّذِينَ يُؤْمِنُونَ بِٱلْغَيْبِ وَيُقِيمُونَ | 2:3 | inanırlar | onlar ki inanırlar gaybde(gizlide) ve kılarlar |  |  |  |  |  |  |  |  | l_aAmana_966a5c |
| أَرْض | ard | ارض | تُفْسِدُوا۟ فِى ٱلْأَرْضِ قَالُوٓا۟ إِنَّمَا | 2:11 | the earth | bozgunculuk yeryüzünde the earth derler sadece |  |  |  |  |  |  |  |  | l_aroD_977a0d |
| قَوْم | kavm | قوم | قَالَ مُوسَىٰ لِقَوْمِهِۦ يَـٰقَوْمِ إِنَّكُمْ | 2:54 | kavmine | demişti ki Musa kavmine ey kavmim şüphesiz sizler |  |  |  |  |  |  |  |  | l_qawom_d51842 |
| ءَايَة | âyae | ايي | كَفَرُوا۟ وَكَذَّبُوا۟ بِـَٔايَـٰتِنَآ أُو۟لَـٰٓئِكَ أَصْحَـٰبُ | 2:39 | ayetlerimizi | inkar eden ve yalanlayan ayetlerimizi işte onlar halkıdır |  |  |  |  |  |  |  |  | l_aAyap_9bea05 |
| عَلِمَ | ʿalima | علم | وَلَـٰكِن لَّا يَعْلَمُونَ | 2:13 | bilenlerden | fakat değildir bilenlerden |  |  |  |  |  |  |  |  | l_Ealima_ceb6d7 |
| كُلّ | kull | كلل | ٱللَّهَ عَلَىٰ كُلِّ شَىْءٍ قَدِيرٌ | 2:20 | her | Allah'ın üzerine her şey gücü yeter |  |  |  |  |  |  |  |  | l_kul_03497c |
| جَعَلَ | caʿala | جعل | وَرَعْدٌ وَبَرْقٌ يَجْعَلُونَ أَصَـٰبِعَهُمْ فِىٓ | 2:19 | tıkarlar | ve gök gürlemesi ve şimşek (ler) tıkarlar parmaklarını içine |  |  |  |  |  |  |  |  | l_jaEala_307581 |
| عَذَاب | ʿazâb | عذب | غِشَـٰوَةٌ وَلَهُمْ عَذَابٌ عَظِيمٌ | 2:7 | bir azab | perde inmiştir Onlar için vardır bir azab büyük |  |  |  |  |  |  |  |  | l_Ea_aAb_4b9936 |
| سَمَآء | samâ | سمو | كَصَيِّبٍ مِّنَ ٱلسَّمَآءِ فِيهِ ظُلُمَـٰتٌ | 2:19 | the sky | boşanan yağmur gibi gökten the sky içinde karanlıklar |  |  |  |  |  |  |  |  | l_samaA_3fe4ed |
| نَفْس | nafs | نفس | يَخْدَعُونَ إِلَّآ أَنفُسَهُمْ وَمَا يَشْعُرُونَ | 2:9 | kendilerinden | they deceive başkasını kendilerinden değiller farkında |  |  |  |  |  |  |  |  | l_nafos_fde475 |
| كَفَرَ | kafara | كفر | إِنَّ ٱلَّذِينَ كَفَرُوا۟ سَوَآءٌ عَلَيْهِمْ | 2:6 | inkar edenler | elbette ki inkar edenler eşittir onlara |  |  |  |  |  |  |  |  | l_kafara_af1746 |
| شَىْء | şî | شيا | عَلَىٰ كُلِّ شَىْءٍ قَدِيرٌ | 2:20 | şey | üzerine her şey gücü yeter |  |  |  |  |  |  |  |  | l_aYo_56e1b1 |
| جَآءَ | câa | جيا | قَالُوا۟ ٱلْـَٔـٰنَ جِئْتَ بِٱلْحَقِّ فَذَبَحُوهَا | 2:71 | getirdin | dediler işte şimdi getirdin doğruyu ve boğazladılar onu |  |  |  |  |  |  |  |  | l_jaA_a_c0bd29 |
| عَمِلَ | ʿamila | عمل | ٱلَّذِينَ ءَامَنُوا۟ وَعَمِلُوا۟ ٱلصَّـٰلِحَـٰتِ أَنَّ | 2:25 | ve işleyen | kimseleri inanan ve işleyen salih işler muhakkak |  |  |  |  |  |  |  |  | l_Eamila_50319c |
| آتَى | âtî | اتي | وَأَقِيمُوا۟ ٱلصَّلَوٰةَ وَءَاتُوا۟ ٱلزَّكَوٰةَ وَٱرْكَعُوا۟ | 2:43 | ve verin | ve kılın namazı ve verin zekatı ve ruku edin |  |  |  |  |  |  |  |  | l_A_taY_2a778d |
| رَءَا | raâ | راي | لَكَ حَتَّىٰ نَرَى ٱللَّهَ جَهْرَةً | 2:55 | görünceye | sana kadar görünceye Allah'ı açıkça |  |  |  |  |  |  |  |  | l_ra_aA_d87b92 |
| بَيْن | bayn | بين | نَكَـٰلًا لِّمَا بَيْنَ يَدَيْهَا وَمَا | 2:66 | arasındaki  (önündeki) | ibretlik bir ceza şey için arasındaki  (önündeki) onların iki eli ve şey (için) |  |  |  |  |  |  |  |  | l_bayon_d87f11 |
| أَتَى | atî | اتي | عَلَىٰ عَبْدِنَا فَأْتُوا۟ بِسُورَةٍ مِّن | 2:23 | haydi getirin | kulumuz (Muhammed)e Our slave haydi getirin bir sure onun gibi |  |  |  |  |  |  |  |  | l_ataY_c25581 |
| كِتَٰب | kitâb | كتب | ذَٰلِكَ ٱلْكِتَـٰبُ لَا رَيْبَ | 2:2 | Kitap | işte o Kitap yoktur hiç şüphe |  |  |  |  |  |  |  |  | l_kita_b_291fe8 |
| حَقّ | hakk | حقق | فَيَعْلَمُونَ أَنَّهُ ٱلْحَقُّ مِن رَّبِّهِمْ | 2:26 | haktır (gerçektir) | bilirler kesinlikle o haktır (gerçektir) Rablerinden their Lord |  |  |  |  |  |  |  |  | l_Haq_3072cf |
| قَبْل | kabl | قبل | أُنزِلَ مِن قَبْلِكَ وَبِٱلْـَٔاخِرَةِ هُمْ | 2:4 | before you | indirilen senden önce before you ve ahirete de onlar |  |  |  |  |  |  |  |  | l_qabol_0769c8 |
| شَآءَ | şâa | شيا | قَامُوا۟ وَلَوْ شَآءَ ٱللَّهُ لَذَهَبَ | 2:20 | dileseydi | dikilip kalırlar eğer dileseydi Allah elbette götürürdü |  |  |  |  |  |  |  |  | l_aA_a_25c447 |
| مُؤْمِن | mumin | امن | وَمَا هُم بِمُؤْمِنِينَ | 2:8 | inanıyor | olmadıkları halde onlar inanıyor |  |  |  |  |  |  |  |  | l_mu_omin_870b47 |
| بَعْد | baʿd | بعد | ٱللَّهِ مِنۢ بَعْدِ مِيثَـٰقِهِۦ وَيَقْطَعُونَ | 2:27 | after | Allah'a sonradan after söz verip bağlandıktan ve keserler |  |  |  |  |  |  |  |  | l_baEod_22102e |
| أَنزَلَ | anzala | نزل | يُؤْمِنُونَ بِمَآ أُنزِلَ إِلَيْكَ وَمَآ | 2:4 | indirilen | iman ederler şeye indirilen sana ve şeye |  |  |  |  |  |  |  |  | l_anzala_adebf9 |
| خَيْر | hayr | خير | أَنفُسَكُمْ ذَٰلِكُمْ خَيْرٌ لَّكُمْ عِندَ | 2:54 | daha iyidir | nefislerinizi bu daha iyidir sizin için katında |  |  |  |  |  |  |  |  | l_xayor_65557c |
| كَذَّبَ | kazzaba | كذب | وَٱلَّذِينَ كَفَرُوا۟ وَكَذَّبُوا۟ بِـَٔايَـٰتِنَآ أُو۟لَـٰٓئِكَ | 2:39 | ve yalanlayan | ve kimseler inkar eden ve yalanlayan ayetlerimizi işte onlar |  |  |  |  |  |  |  |  | l_ka_aba_15a65b |
| سَبِيل | sabîl | سبل | ضَلَّ سَوَآءَ ٱلسَّبِيلِ | 2:108 | yolu | sapıtmıştır dümdüz yolu |  |  |  |  |  |  |  |  | l_sabiyl_bdac41 |
| دَعَا | daʿâ | دعو | مِّن مِّثْلِهِۦ وَٱدْعُوا۟ شُهَدَآءَكُم مِّن | 2:23 | ve çağırın | onun gibi like it ve çağırın şahitlerinizi başkadan |  |  |  |  |  |  |  |  | l_daEaA_f5ec67 |
| ٱتَّقَىٰ | attakâ | وقي | قَبْلِكُمْ لَعَلَّكُمْ تَتَّقُونَ | 2:21 | korunursunuz | before you belki korunursunuz |  |  |  |  |  |  |  |  | l_t_aqaY_bc8006 |
| أَمْر | amr | امر | يَأْتِىَ ٱللَّهُ بِأَمْرِهِۦٓ إِنَّ ٱللَّهَ | 2:109 | emrini | getirinceye Allah emrini şüphesiz Allah |  |  |  |  |  |  |  |  | l_amor_9fbe48 |
| عَلِيم | ʿalîm | علم | بِكُلِّ شَىْءٍ عَلِيمٌ | 2:29 | bilir | her şeyi bilir |  |  |  |  |  |  |  |  | l_Ealiym_c50d0d |
| بَعْض | baʿd | بعض | وَقُلْنَا ٱهْبِطُوا۟ بَعْضُكُمْ لِبَعْضٍ عَدُوٌّ | 2:36 | kiminiz | ve dedik ki inin kiminiz kiminize düşman olarak |  |  |  |  |  |  |  |  | l_baEoD_256db1 |
| آخِر | âhir | اخر | مِن قَبْلِكَ وَبِٱلْـَٔاخِرَةِ هُمْ يُوقِنُونَ | 2:4 | ve ahirete de | senden önce before you ve ahirete de onlar kesinlikle inanırlar |  |  |  |  |  |  |  |  | l_A_xir_5b7462 |
| أَيُّهَا | ayyuhâ |  | يَـٰٓأَيُّهَا ٱلنَّاسُ ٱعْبُدُوا۟ | 2:21 | Ey! | Ey! insanlar kulluk edin |  |  |  |  |  |  |  |  | l_ay_uhaA_a494bb |
| جَنَّة | cannae | جنن | أَنَّ لَهُمْ جَنَّـٰتٍ تَجْرِى مِن | 2:25 | cennetler | muhakkak onlar için vardır cennetler akan altlarından |  |  |  |  |  |  |  |  | l_jan_ap_50e4b4 |
| نَار | nâr | نور | ٱلَّذِى ٱسْتَوْقَدَ نَارًا فَلَمَّآ أَضَآءَتْ | 2:17 | ateş | kişinin yakan ateş ne zaman ki aydınlatır |  |  |  |  |  |  |  |  | l_naAr_d577c3 |
| دُون | dûn | دون | شُهَدَآءَكُم مِّن دُونِ ٱللَّهِ إِن | 2:23 | other than | şahitlerinizi başkadan other than Allah eğer |  |  |  |  |  |  |  |  | l_duwn_bc1447 |
| أَرَادَ | arâda | رود | فَيَقُولُونَ مَاذَآ أَرَادَ ٱللَّهُ بِهَـٰذَا | 2:26 | istedi (kasdetti) | derler ki neyi istedi (kasdetti) Allah bu |  |  |  |  |  |  |  |  | l_araAda_e67825 |
| ٱتَّبَعَ | attabaʿa | تبع | وَٱتَّبَعُوا۟ مَا تَتْلُوا۟ | 2:102 | ve uydular | ve uydular şeye uydurduğu |  |  |  |  |  |  |  |  | l_t_abaEa_e11446 |
| مُوسَىٰ | mûsâ |  | وَإِذْ وَٰعَدْنَا مُوسَىٰٓ أَرْبَعِينَ لَيْلَةً | 2:51 | Musa ile | hani sözleşmiştik Musa ile kırk gece için |  |  |  |  |  |  |  |  | l_muwsaY_3064bc |
| قَلْب | kalb | قلب | ٱللَّهُ عَلَىٰ قُلُوبِهِمْ وَعَلَىٰ سَمْعِهِمْ | 2:7 | kalblerinin | Allah üzerini kalblerinin ve üzerini kulaklarının |  |  |  |  |  |  |  |  | l_qalob_e14dcc |
| أَرْسَلَ | arsala | رسل | إِنَّآ أَرْسَلْنَـٰكَ بِٱلْحَقِّ بَشِيرًا | 2:119 | seni gönderdik | doğrusu biz seni gönderdik gerçekle müjdeleyici |  |  |  |  |  |  |  |  | l_arosala_4ee820 |
| كَٰفِرُون | kâfirûn | كفر | وَٱللَّهُ مُحِيطٌۢ بِٱلْكَـٰفِرِينَ | 2:19 | inkarcıları | oysa Allah tamamen kuşatmıştır inkarcıları |  |  |  |  |  |  |  |  | l_ka_firuwn_165d2d |
| ظَالِم | zâlim | ظلم | فَتَكُونَا مِنَ ٱلظَّـٰلِمِينَ | 2:35 | the wrongdoers | olursunuz zalimlerden the wrongdoers |  |  |  |  |  |  |  |  | l_ZaAlim_fae7dd |
| أَهْل | ahl | اهل | كَفَرُوا۟ مِنْ أَهْلِ ٱلْكِتَـٰبِ وَلَا | 2:105 | (the) People | inkar eden(ler) ehlinden (the) People kitab ve müşriklerden |  |  |  |  |  |  |  |  | l_ahol_86b2cf |
| أَخَذَ | ahaza | اخذ | شَفَـٰعَةٌ وَلَا يُؤْخَذُ مِنْهَا عَدْلٌ | 2:48 | will be taken | şefaat da ve alınmaz will be taken ondan fidye de |  |  |  |  |  |  |  |  | l_axa_a_2954c6 |
| ٱتَّخَذَ | attahaza | اخذ | لَيْلَةً ثُمَّ ٱتَّخَذْتُمُ ٱلْعِجْلَ مِنۢ | 2:51 | siz (tanrı) edinmiştiniz | gece için sonra siz (tanrı) edinmiştiniz buzağıyı onun ardından |  |  |  |  |  |  |  |  | l_t_axa_a_6d8c4b |
| عَظِيم | ʿazîm | عظم | وَلَهُمْ عَذَابٌ عَظِيمٌ | 2:7 | büyük | Onlar için vardır bir azab büyük |  |  |  |  |  |  |  |  | l_EaZiym_93f908 |
| يَد | yad | يدي | لِّمَا بَيْنَ يَدَيْهَا وَمَا خَلْفَهَا | 2:66 | onların iki eli | şey için arasındaki  (önündeki) onların iki eli ve şey (için) ardından gelen |  |  |  |  |  |  |  |  | l_yad_84953d |
| مُّبِين | mubîn | بين | لَكُمْ عَدُوٌّ مُّبِينٌ | 2:168 | apaçık | sizin düşmanınızdır apaçık |  |  |  |  |  |  |  |  | l_m_ubiyn_4f4924 |
| دُّنْيَا | dunyâ | دنو | فِى ٱلْحَيَوٰةِ ٱلدُّنْيَا وَيَوْمَ ٱلْقِيَـٰمَةِ | 2:85 | dünya | hayatında the life dünya ve gününde kıyamet |  |  |  |  |  |  |  |  | l_d_unoyaA_4c3c1e |
| ظَلَمَ | zalama | ظلم | يَـٰقَوْمِ إِنَّكُمْ ظَلَمْتُمْ أَنفُسَكُم بِٱتِّخَاذِكُمُ | 2:54 | zulmettiniz | ey kavmim şüphesiz sizler zulmettiniz kendinize (tanrı) edinmekle |  |  |  |  |  |  |  |  | l_Zalama_7a9278 |
| سَأَلَ | saala | سال | لَكُم مَّا سَأَلْتُمْ وَضُرِبَتْ عَلَيْهِمُ | 2:61 | istediğiniz | sizin için vardır şeyler istediğiniz ve vuruldu üzerlerine |  |  |  |  |  |  |  |  | l_sa_ala_a822cc |

### Kova C · sıra 101–250 — **144** kelime

| ar | translit_tr | root | context_ar | context_ref | ref_tr | context_ref_tr | tr1 | tr2 | pattern | cognateTr | cognateShift | context_tr | verifiedBy | verifiedAt | lemmaId |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| وَجَدَ | vacada | وجد | وَلَتَجِدَنَّهُمْ أَحْرَصَ ٱلنَّاسِ | 2:96 | onları bulursun | onları bulursun en düşkünü insanların |  |  |  |  |  |  |  |  | l_wajada_733e47 |
| أَجْر | acr | اجر | صَـٰلِحًا فَلَهُمْ أَجْرُهُمْ عِندَ رَبِّهِمْ | 2:62 | mükafatları | iyi işler onlar için vardır mükafatları katında rablerinin |  |  |  |  |  |  |  |  | l_ajor_c798df |
| عِلْم | ʿilm | علم | سُبْحَـٰنَكَ لَا عِلْمَ لَنَآ إِلَّا | 2:32 | bilgimiz | Seni tesbih ederiz yoktur bilgimiz bizim başka |  |  |  |  |  |  |  |  | l_Eilom_2f0f9d |
| لَن | lan |  | لَّمْ تَفْعَلُوا۟ وَلَن تَفْعَلُوا۟ فَٱتَّقُوا۟ | 2:24 | ki asla | yapmadınızsa you do ki asla yapamayacaksınız o halde sakının |  |  |  |  |  |  |  |  | l_lan_094a36 |
| عَزِيز | ʿazîz | عزز | إِنَّكَ أَنتَ ٱلْعَزِيزُ ٱلْحَكِيمُ | 2:129 | Aziz olan | şüphesiz sensin yalnız sen Aziz olan Hakim olan |  |  |  |  |  |  |  |  | l_Eaziyz_4804b0 |
| أَخْرَجَ | ahraca | خرج | ٱلسَّمَآءِ مَآءً فَأَخْرَجَ بِهِۦ مِنَ | 2:22 | çıkardı | the sky su çıkardı onunla çeşitli ürünlerden |  |  |  |  |  |  |  |  | l_axoraja_186bcc |
| حَكِيم | hakîm | حكم | أَنتَ ٱلْعَلِيمُ ٱلْحَكِيمُ | 2:32 | hakim olansın | sen bilensin hakim olansın |  |  |  |  |  |  |  |  | l_Hakiym_e62e6c |
| ذُو | zû |  | وَبِٱلْوَٰلِدَيْنِ إِحْسَانًا وَذِى ٱلْقُرْبَىٰ وَٱلْيَتَـٰمَىٰ | 2:83 | ve | ve anaya-babaya iyilik edeceksiniz ve yakınlara ve yetimlere |  |  |  |  |  |  |  |  | l_uw_7be8de |
| أَكَلَ | akala | اكل | وَزَوْجُكَ ٱلْجَنَّةَ وَكُلَا مِنْهَا رَغَدًا | 2:35 | ve yeyin | ve eşin cennette ve yeyin ondan bol bol |  |  |  |  |  |  |  |  | l_akala_0ec27c |
| هَل | hal |  | هَلْ يَنظُرُونَ إِلَّآ | 2:210 | mı? | mı? gözlüyorlar gelmesini |  |  |  |  |  |  |  |  | l_hal_232554 |
| قَوْل | kavl | قول | ٱلَّذِينَ ظَلَمُوا۟ قَوْلًا غَيْرَ ٱلَّذِى | 2:59 | bir sözle | onlar ki zalimler bir sözle başka söylenenden |  |  |  |  |  |  |  |  | l_qawol_58e075 |
| غَفُور | gafûr | غفر | إِنَّ ٱللَّهَ غَفُورٌ رَّحِيمٌ | 2:173 | çok bağışlayandır | muhakkak ki Allah çok bağışlayandır çok esirgeyendir |  |  |  |  |  |  |  |  | l_gafuwr_926fa2 |
| لَّيْسَ | laysa | ليس | وَقَالَتِ ٱلْيَهُودُ لَيْسَتِ ٱلنَّصَـٰرَىٰ عَلَىٰ | 2:113 | değiller | ve dediler ki Yahudiler değiller Hıristiyanlar üzerinde |  |  |  |  |  |  |  |  | l_l_ayosa_5684fc |
| شَيْطَٰن | şaytân | شطن | خَلَوْا۟ إِلَىٰ شَيَـٰطِينِهِمْ قَالُوٓا۟ إِنَّا | 2:14 | şeytanları | yalnız kaldıkları ile şeytanları derler şüphesiz biz |  |  |  |  |  |  |  |  | l_ayoTa_n_06003d |
| فَعَلَ | faʿala | فعل | فَإِن لَّمْ تَفْعَلُوا۟ وَلَن تَفْعَلُوا۟ | 2:24 | you do | yok eğer yapmadınızsa you do ki asla yapamayacaksınız |  |  |  |  |  |  |  |  | l_faEala_b34da5 |
| مَلَك | malak | ملك | قَالَ رَبُّكَ لِلْمَلَـٰٓئِكَةِ إِنِّى جَاعِلٌ | 2:30 | meleklere | dedi ki Rabbin meleklere şüphesiz ben yaratacağım |  |  |  |  |  |  |  |  | l_malak_b3955c |
| مَثَل | masal | مثل | مَثَلُهُمْ كَمَثَلِ ٱلَّذِى | 2:17 | Onların durumu | Onların durumu durumu gibidir kişinin |  |  |  |  |  |  |  |  | l_maval_5dedc0 |
| نَّظَرَ | nazara | نظر | فِرْعَوْنَ وَأَنتُمْ تَنظُرُونَ | 2:50 | görüyordunuz | Fir'avn ve siz de görüyordunuz |  |  |  |  |  |  |  |  | l_n_aZara_cdb6f4 |
| مَال | mâl | مول | وَنَقْصٍ مِّنَ ٱلْأَمْوَٰلِ وَٱلْأَنفُسِ وَٱلثَّمَرَٰتِ | 2:155 | [the] wealth | ve noksanlığı mallarınızın [the] wealth ve canlarınızın ve ürünlerinizin |  |  |  |  |  |  |  |  | l_maAl_d64b35 |
| وَلِىّ | valîî | ولي | ٱللَّهِ مِن وَلِىٍّ وَلَا نَصِيرٍ | 2:107 | koruyucu | Allah'tan hiçbir koruyucu ve (ne de) bir yardımcı |  |  |  |  |  |  |  |  | l_waliY_0884c3 |
| هُدًى | hudenî | هدي | رَيْبَ فِيهِ هُدًى لِّلْمُتَّقِينَ | 2:2 | yol göstericidir | hiç şüphe kendisinde yol göstericidir müttakiler için |  |  |  |  |  |  |  |  | l_hudFY_2e4b07 |
| ذَكَرَ | zakara | ذكر | يَـٰبَنِىٓ إِسْرَٰٓءِيلَ ٱذْكُرُوا۟ نِعْمَتِىَ ٱلَّتِىٓ | 2:40 | hatırlayın | ey oğulları İsrail hatırlayın ni'metleri o ki; |  |  |  |  |  |  |  |  | l_akara_67cfbf |
| فَضْل | fadl | فضل | ذَٰلِكَ فَلَوْلَا فَضْلُ ٱللَّهِ عَلَيْكُمْ | 2:64 | iyiliği | bunun eğer olmasaydı iyiliği Allah'ın size |  |  |  |  |  |  |  |  | l_faDol_4925b8 |
| لَيْل | layl | ليل | وَٱلْأَرْضِ وَٱخْتِلَـٰفِ ٱلَّيْلِ وَٱلنَّهَارِ وَٱلْفُلْكِ | 2:164 | gece | ve yerin ve değişmesinde gece ve gündüzün ve gemilerde |  |  |  |  |  |  |  |  | l_layol_c1152e |
| كَيْف | kayf | كيف | كَيْفَ تَكْفُرُونَ بِٱللَّهِ | 2:28 | nasıl | nasıl inkar edersiniz Allah'a |  |  |  |  |  |  |  |  | l_kayof_79814e |
| قَتَلَ | katala | قتل | إِلَىٰ بَارِئِكُمْ فَٱقْتُلُوٓا۟ أَنفُسَكُمْ ذَٰلِكُمْ | 2:54 | ve öldürün | yaratıcınıza your Creator ve öldürün nefislerinizi bu |  |  |  |  |  |  |  |  | l_qatala_ae1dd2 |
| خَافَ | hâfa | خوف | فَمَنْ خَافَ مِن مُّوصٍ | 2:182 | korkar da | her kim de korkar da vasiyyet edenden (the) testator |  |  |  |  |  |  |  |  | l_xaAfa_29d6b0 |
| أَوَّل | avval | اول | وَلَا تَكُونُوٓا۟ أَوَّلَ كَافِرٍۭ بِهِۦ | 2:41 | ilk | ve olmayın be ilk inkar eden onu |  |  |  |  |  |  |  |  | l_aw_al_3314ee |
| أَكْثَر | aksar | كثر | مِّنْهُم بَلْ أَكْثَرُهُمْ لَا يُؤْمِنُونَ | 2:100 | çokları | onlardan zaten çokları inanmazlar believe |  |  |  |  |  |  |  |  | l_akovar_f7f01e |
| بُنَىّ | bunîî | بني | يَـٰبَنِىٓ إِسْرَٰٓءِيلَ ٱذْكُرُوا۟ | 2:40 | ey oğulları | ey oğulları İsrail hatırlayın |  |  |  |  |  |  |  |  | l_bunaY_8dc929 |
| رَجَعَ | racaʿa | رجع | فَهُمْ لَا يَرْجِعُونَ | 2:18 | dönecek | onlar değildir dönecek |  |  |  |  |  |  |  |  | l_rajaEa_39e51f |
| أَصْحَٰب | ashâb | صحب | بِـَٔايَـٰتِنَآ أُو۟لَـٰٓئِكَ أَصْحَـٰبُ ٱلنَّارِ هُمْ | 2:39 | halkıdır | ayetlerimizi işte onlar halkıdır ateş onlar |  |  |  |  |  |  |  |  | l_aSoHa_b_b49ea8 |
| سَمِعَ | samiʿa | سمع | فَرِيقٌ مِّنْهُمْ يَسْمَعُونَ كَلَـٰمَ ٱللَّهِ | 2:75 | işitirlerdi de | bir grup bunlardan işitirlerdi de sözünü Allah'ın |  |  |  |  |  |  |  |  | l_samiEa_640570 |
| تَوَلَّىٰ | tavallâ | ولي | ثُمَّ تَوَلَّيْتُم مِّنۢ بَعْدِ | 2:64 | dönmüştünüz | sonra dönmüştünüz ardından after |  |  |  |  |  |  |  |  | l_tawal_aY_fdd891 |
| أَمَرَ | amara | امر | وَيَقْطَعُونَ مَآ أَمَرَ ٱللَّهُ بِهِۦٓ | 2:27 | emrettiği | ve keserler şeyi emrettiği Allah'ın kendisiyle |  |  |  |  |  |  |  |  | l_amara_3fab3c |
| جَهَنَّم | cahannam |  | بِٱلْإِثْمِ فَحَسْبُهُۥ جَهَنَّمُ وَلَبِئْسَ ٱلْمِهَادُ | 2:206 | cehennem | günaha artık ona yeter cehennem ve ne kötü bir yataktır o |  |  |  |  |  |  |  |  | l_jahan_am_665115 |
| ذِكْر | zikr | ذكر | فَٱذْكُرُوا۟ ٱللَّهَ كَذِكْرِكُمْ ءَابَآءَكُمْ أَوْ | 2:200 | andığınız gibi | anın Allah'ı andığınız gibi atalarınızı veya |  |  |  |  |  |  |  |  | l_ikor_0e35a1 |
| دَخَلَ | dahala | دخل | وَإِذْ قُلْنَا ٱدْخُلُوا۟ هَـٰذِهِ ٱلْقَرْيَةَ | 2:58 | girin | hani demiştik ki girin şu kente |  |  |  |  |  |  |  |  | l_daxala_442502 |
| حَيَوٰة | hayûâe | حيي | خِزْىٌ فِى ٱلْحَيَوٰةِ ٱلدُّنْيَا وَيَوْمَ | 2:85 | the life | rezil olmaktan hayatında the life dünya ve gününde |  |  |  |  |  |  |  |  | l_Hayaw_p_e08aa3 |
| زَوْج | zavc | زوج | وَلَهُمْ فِيهَآ أَزْوَٰجٌ مُّطَهَّرَةٌ وَهُمْ | 2:25 | eşler | Onlar için vardır orada eşler tertemiz ve onlar |  |  |  |  |  |  |  |  | l_zawoj_99a6c2 |
| أَخ | ah | اخو | لَهُۥ مِنْ أَخِيهِ شَىْءٌ فَٱتِّبَاعٌۢ | 2:178 | kardeşi | kendisi tarafından kardeşi bir şey artık uymalıdır |  |  |  |  |  |  |  |  | l_ax_48233a |
| لَوْلَآ | lavlâ |  | بَعْدِ ذَٰلِكَ فَلَوْلَا فَضْلُ ٱللَّهِ | 2:64 | eğer olmasaydı | after bunun eğer olmasaydı iyiliği Allah'ın |  |  |  |  |  |  |  |  | l_lawolaA_b76376 |
| مِثْل | misl | مثل | بِسُورَةٍ مِّن مِّثْلِهِۦ وَٱدْعُوا۟ شُهَدَآءَكُم | 2:23 | like it | bir sure onun gibi like it ve çağırın şahitlerinizi |  |  |  |  |  |  |  |  | l_mivol_d81d43 |
| نَّبِىّ | nabîî | نبا | ٱللَّهِ وَيَقْتُلُونَ ٱلنَّبِيِّـۧنَ بِغَيْرِ ٱلْحَقِّ | 2:61 | peygamberleri | Allah'ın ve öldürüyorlardı peygamberleri etmediği halde hak |  |  |  |  |  |  |  |  | l_n_abiY_e09f3b |
| فِرْعَوْن | firʿavn |  | مِّنْ ءَالِ فِرْعَوْنَ يَسُومُونَكُمْ سُوٓءَ | 2:49 | Fir'avn | ailesinden (the) people Fir'avn onlar size reva görüyor en kötüsünü |  |  |  |  |  |  |  |  | l_firoEawon_45c9f5 |
| خَٰلِد | hâlid | خلد | وَهُمْ فِيهَا خَـٰلِدُونَ | 2:25 | ebedi kalacaklardır | ve onlar orada ebedi kalacaklardır |  |  |  |  |  |  |  |  | l_xa_lid_db5cbd |
| جَزَىٰ | cazâ | جزي | يَوْمًا لَّا تَجْزِى نَفْسٌ عَن | 2:48 | avail | günden cezalandırılmaz avail hiç kimse kimseden(günahından) |  |  |  |  |  |  |  |  | l_jazaY_a84a54 |
| لَٰكِن | lâkin |  | هُمُ ٱلْمُفْسِدُونَ وَلَـٰكِن لَّا يَشْعُرُونَ | 2:12 | fakat | onlar bozgunculardır fakat değildir anlayanlardan |  |  |  |  |  |  |  |  | l_la_kin_4550fb |
| أَلِيم | alîm | الم | وَلَهُمْ عَذَابٌ أَلِيمٌۢ بِمَا كَانُوا۟ | 2:10 | acı | onlara vardır bir azab acı ötürü olduklarından |  |  |  |  |  |  |  |  | l_aliym_a29290 |
| أَطَاعَ | atâʿa | طوع | وَقَالُوا۟ سَمِعْنَا وَأَطَعْنَا غُفْرَانَكَ رَبَّنَا | 2:285 | ve ita'at ettik | ve dediler ki İşittik ve ita'at ettik bağışlamanı dileriz Rabbimiz |  |  |  |  |  |  |  |  | l_aTaAEa_74ca26 |
| أَوْحَىٰٓ | avhâ | وحي | أَنۢبَآءِ ٱلْغَيْبِ نُوحِيهِ إِلَيْكَ وَمَا | 3:44 | vahyettiğimiz | (the) news görünmez alemin vahyettiğimiz sana sen değildin |  |  |  |  |  |  |  |  | l_awoHaY_5691fd |
| وَجْه | vach | وجه | مَنْ أَسْلَمَ وَجْهَهُۥ لِلَّهِ وَهُوَ | 2:112 | yüzünü | kim teslim ederse yüzünü Allah'a ve o |  |  |  |  |  |  |  |  | l_wajoh_c3bb4d |
| إِنسَٰن | insân | انس | عَلِمَ كُلُّ أُنَاسٍ مَّشْرَبَهُمْ كُلُوا۟ | 2:60 | insanlar | bilmişti bütün insanlar kendi içecekleri yeri yeyin |  |  |  |  |  |  |  |  | l_insa_n_d60ef4 |
| أَشْرَكَ | aşraka | شرك | وَمِنَ ٱلَّذِينَ أَشْرَكُوا۟ يَوَدُّ أَحَدُهُمْ | 2:96 | ortak koşan(lar) | kimselerden those who ortak koşan(lar) ister her biri |  |  |  |  |  |  |  |  | l_a_oraka_c73d6e |
| أَلْقَىٰٓ | alkâ | لقي | ٱللَّهِ وَلَا تُلْقُوا۟ بِأَيْدِيكُمْ إِلَى | 2:195 | throw (yourselves) | Allah kendinizi atmayın throw (yourselves) kendi ellerinizle tehlikeye |  |  |  |  |  |  |  |  | l_aloqaY_525495 |
| بَيِّنَة | bayyinae | بين | ٱبْنَ مَرْيَمَ ٱلْبَيِّنَـٰتِ وَأَيَّدْنَـٰهُ بِرُوحِ | 2:87 | açık deliller | oğlu Meryem açık deliller ve onu  destekledik Ruh ile (Ruh'ül-Kudüs) |  |  |  |  |  |  |  |  | l_bay_inap_86ef67 |
| عَمَل | ʿamal | عمل | وَرَبُّكُمْ وَلَنَآ أَعْمَـٰلُنَا وَلَكُمْ أَعْمَـٰلُكُمْ | 2:139 | bizim yaptıklarımız | sizin de Rabbiniz bizimdir bizim yaptıklarımız sizindir sizin yaptıklarınız |  |  |  |  |  |  |  |  | l_Eamal_8215bb |
| آخَر | âhar | اخر | مِّنْ أَيَّامٍ أُخَرَ وَعَلَى ٱلَّذِينَ | 2:184 | başka | günlerde days başka ve (lazımdır) kimselerin |  |  |  |  |  |  |  |  | l_A_xar_621bf1 |
| قَلِيل | kalîl | قلل | بِـَٔايَـٰتِى ثَمَنًا قَلِيلًا وَإِيَّـٰىَ فَٱتَّقُونِ | 2:41 | azıcık | benim ayetlerimi bedele azıcık ve benden sakının |  |  |  |  |  |  |  |  | l_qaliyl_2b769c |
| قِيَٰمَة | kiyâmae | قوم | ٱلدُّنْيَا وَيَوْمَ ٱلْقِيَـٰمَةِ يُرَدُّونَ إِلَىٰٓ | 2:85 | kıyamet | dünya ve gününde kıyamet onlar itilirler en şiddetlisine |  |  |  |  |  |  |  |  | l_qiya_map_2880f6 |
| قُرْءَان | kurân | قرا | أُنزِلَ فِيهِ ٱلْقُرْءَانُ هُدًى لِّلنَّاسِ | 2:185 | Kur'an | indirilmiştir onda Kur'an hidayet olarak insanlara |  |  |  |  |  |  |  |  | l_quro_aAn_5027d4 |
| وَعَدَ | vaʿada | وعد | ٱلشَّيْطَـٰنُ يَعِدُكُمُ ٱلْفَقْرَ وَيَأْمُرُكُم | 2:268 | size vaad eder | şeytan size vaad eder fakirliği ve size emreder |  |  |  |  |  |  |  |  | l_waEada_9ae985 |
| يَوْمَئِذ | yavmaiz |  | هُمْ لِلْكُفْرِ يَوْمَئِذٍ أَقْرَبُ مِنْهُمْ | 3:167 | o gün | onlar küfre o gün yakın idiler ondan |  |  |  |  |  |  |  |  | l_yawoma_i_367815 |
| إِبْرَاهِيم | ibrâhîm |  | وَإِذِ ٱبْتَلَىٰٓ إِبْرَٰهِـۧمَ رَبُّهُۥ بِكَلِمَـٰتٍ | 2:124 | İbrahim'i | zaman imtihan ettiği; İbrahim'i Rabbi kelimelerle |  |  |  |  |  |  |  |  | l_iboraAhiym_d85936 |
| أَنفَقَ | anfaka | نفق | وَمِمَّا رَزَقْنَـٰهُمْ يُنفِقُونَ | 2:3 | infak ederler | ve şeyden kendilerini rızıklandırdığımız infak ederler |  |  |  |  |  |  |  |  | l_anfaqa_0b12ad |
| بَيْت | bayt | بيت | وَإِذْ جَعَلْنَا ٱلْبَيْتَ مَثَابَةً لِّلنَّاسِ | 2:125 | Beyt'i (Ka'be'yi) | hani biz kıldık Beyt'i (Ka'be'yi) toplanma yeri insanlara |  |  |  |  |  |  |  |  | l_bayot_3393ba |
| غَفَرَ | gafara | غفر | وَقُولُوا۟ حِطَّةٌ نَّغْفِرْ لَكُمْ خَطَـٰيَـٰكُمْ | 2:58 | biz de bağışlayalım | ve deyin hitta (ya Rabbi bizi affet) biz de bağışlayalım sizin hatalarınızı |  |  |  |  |  |  |  |  | l_gafara_e47aae |
| صَٰلِح | sâlih | صلح | ٱلْـَٔاخِرِ وَعَمِلَ صَـٰلِحًا فَلَهُمْ أَجْرُهُمْ | 2:62 | iyi işler | ahiret ve yaparsa iyi işler onlar için vardır mükafatları |  |  |  |  |  |  |  |  | l_Sa_liH_30bb88 |
| يَمِين | yamîn | يمن | ٱللَّهَ عُرْضَةً لِّأَيْمَـٰنِكُمْ أَن تَبَرُّوا۟ | 2:224 | yeminlerinize | Allah'ı engel yeminlerinize iyilik etmenize you do good |  |  |  |  |  |  |  |  | l_yamiyn_398e7f |
| أَضَلَّ | adalla | ضلل | بِهَـٰذَا مَثَلًا يُضِلُّ بِهِۦ كَثِيرًا | 2:26 | saptırır | bu misalle saptırır onunla bir çoğunu |  |  |  |  |  |  |  |  | l_aDal_a_5ed954 |
| أَحْبَبْ | ahbab | حبب | ٱللَّهِ أَندَادًا يُحِبُّونَهُمْ كَحُبِّ ٱللَّهِ | 2:165 | onları severler | Allah'tan eşler onları severler sever gibi Allah'ı |  |  |  |  |  |  |  |  | l_aHobabo_02c0a1 |
| أَصَابَ | asâba | صوب | ٱلَّذِينَ إِذَآ أَصَـٰبَتْهُم مُّصِيبَةٌ قَالُوٓا۟ | 2:156 | onlara eriştiği | onlar ki zaman onlara eriştiği bir bela derler |  |  |  |  |  |  |  |  | l_aSaAba_7cb0f1 |
| أُمَّة | ummae | امم | وَمِن ذُرِّيَّتِنَآ أُمَّةً مُّسْلِمَةً لَّكَ | 2:128 | bir ümmet (çıkar) | neslimizden de our offspring bir ümmet (çıkar) teslim olan sana |  |  |  |  |  |  |  |  | l_um_ap_e71e1a |
| آبَاء | âbâ | ابو | إِلَـٰهَكَ وَإِلَـٰهَ ءَابَآئِكَ إِبْرَٰهِـۧمَ وَإِسْمَـٰعِيلَ | 2:133 | ataların | senin tanrına ve tanrısına ataların İbrahim ve İsma'il |  |  |  |  |  |  |  |  | l_A_baA_febd74 |
| ٱبْن | abn | بني | ٱلْعَذَابِ يُذَبِّحُونَ أَبْنَآءَكُمْ وَيَسْتَحْيُونَ نِسَآءَكُمْ | 2:49 | oğullarınızı | azabın boğazlayıp oğullarınızı sağ bırakıyorlardı kadınlarınızı |  |  |  |  |  |  |  |  | l_bon_228952 |
| كَثِير | kasîr | كثر | يُضِلُّ بِهِۦ كَثِيرًا وَيَهْدِى بِهِۦ | 2:26 | bir çoğunu | saptırır onunla bir çoğunu ve yine yola getirir onunla |  |  |  |  |  |  |  |  | l_kaviyr_d003d4 |
| مَآء | mâ | موه | مِنَ ٱلسَّمَآءِ مَآءً فَأَخْرَجَ بِهِۦ | 2:22 | su | gökten the sky su çıkardı onunla |  |  |  |  |  |  |  |  | l_maA_e36bc7 |
| تَابَ | tâba | توب | رَّبِّهِۦ كَلِمَـٰتٍ فَتَابَ عَلَيْهِ إِنَّهُۥ | 2:37 | tevbesini kabul etti | his Lord kelimeler tevbesini kabul etti onun şüphesiz |  |  |  |  |  |  |  |  | l_taAba_0ab18c |
| كَسَبَ | kasaba | كسب | لَّهُم مِّمَّا يَكْسِبُونَ | 2:79 | kazandıklarından | onların ötürü kazandıklarından |  |  |  |  |  |  |  |  | l_kasaba_94ec71 |
| نَزَّلَ | nazzala | نزل | رَيْبٍ مِّمَّا نَزَّلْنَا عَلَىٰ عَبْدِنَا | 2:23 | We have revealed | şüphe sana indirdiğimizden We have revealed kulumuz (Muhammed)e Our slave |  |  |  |  |  |  |  |  | l_naz_ala_e7cda7 |
| صَّٰلِحَٰت | sâlihât | صلح | ءَامَنُوا۟ وَعَمِلُوا۟ ٱلصَّـٰلِحَـٰتِ أَنَّ لَهُمْ | 2:25 | salih işler | inanan ve işleyen salih işler muhakkak onlar için vardır |  |  |  |  |  |  |  |  | l_S_a_liHa_t_f6a492 |
| رَزَقَ | razaka | رزق | ٱلصَّلَوٰةَ وَمِمَّا رَزَقْنَـٰهُمْ يُنفِقُونَ | 2:3 | kendilerini rızıklandırdığımız | namazlarını ve şeyden kendilerini rızıklandırdığımız infak ederler |  |  |  |  |  |  |  |  | l_razaqa_19085c |
| تَلَىٰ | talâ | تلو | أَنفُسَكُمْ وَأَنتُمْ تَتْلُونَ ٱلْكِتَـٰبَ أَفَلَا | 2:44 | okuduğunuz halde | kendinizi ve siz okuduğunuz halde Kitabı hâlâ |  |  |  |  |  |  |  |  | l_talaY_d5d166 |
| أَىّ | îî |  | يُلْقُونَ أَقْلَـٰمَهُمْ أَيُّهُمْ يَكْفُلُ مَرْيَمَ | 3:44 | hangisi | attıkları (kur'a) oklarını hangisi kefil olacak (diye) Meryem'e |  |  |  |  |  |  |  |  | l_aY_907a32 |
| نَصَرَ | nasara | نصر | وَلَا هُمْ يُنصَرُونَ | 2:48 | hiçbir yardım | ve yapılamaz onlara hiçbir yardım |  |  |  |  |  |  |  |  | l_naSara_e01de2 |
| نِسَآء | nisâ | نسو | أَبْنَآءَكُمْ وَيَسْتَحْيُونَ نِسَآءَكُمْ وَفِى ذَٰلِكُم | 2:49 | kadınlarınızı | oğullarınızı sağ bırakıyorlardı kadınlarınızı ve vardı bunda sizin için |  |  |  |  |  |  |  |  | l_nisaA_371a3e |
| قَضَىٰٓ | kadâ | قضي | وَٱلْأَرْضِ وَإِذَا قَضَىٰٓ أَمْرًا فَإِنَّمَا | 2:117 | hükmettiği | ve yerin zaman hükmettiği bir işe (şeye) şüphesiz sadece |  |  |  |  |  |  |  |  | l_qaDaY_2a99a6 |
| صَادِق | sâdik | صدق | إِن كُنتُمْ صَـٰدِقِينَ | 2:23 | doğru | eğer iseniz doğru |  |  |  |  |  |  |  |  | l_SaAdiq_43c41b |
| نَذِير | nazîr | نذر | بِٱلْحَقِّ بَشِيرًا وَنَذِيرًا وَلَا تُسْـَٔلُ | 2:119 | ve uyarıcı olarak | gerçekle müjdeleyici ve uyarıcı olarak değilsin sen sorumlu |  |  |  |  |  |  |  |  | l_na_iyr_9ec980 |
| صَبَرَ | sabara | صبر | يَـٰمُوسَىٰ لَن نَّصْبِرَ عَلَىٰ طَعَامٍ | 2:61 | biz  dayanamayız | ey Musa asla biz  dayanamayız yemeğe food |  |  |  |  |  |  |  |  | l_Sabara_34dfc2 |
| عَيْن | ʿayn | عين | ٱثْنَتَا عَشْرَةَ عَيْنًا قَدْ عَلِمَ | 2:60 | göze (pınar) | on iki twelve göze (pınar) elbette bilmişti |  |  |  |  |  |  |  |  | l_Eayon_c7bc29 |
| جَرَيْ | caray | جري | لَهُمْ جَنَّـٰتٍ تَجْرِى مِن تَحْتِهَا | 2:25 | akan | onlar için vardır cennetler akan altlarından under them |  |  |  |  |  |  |  |  | l_jarayo_c231f0 |
| لَٰكِنّ | lâkinn |  | كَفَرَ سُلَيْمَـٰنُ وَلَـٰكِنَّ ٱلشَّيَـٰطِينَ كَفَرُوا۟ | 2:102 | fakat | disbelieved Süleyman fakat şeytanlar küfre girdiler |  |  |  |  |  |  |  |  | l_la_kin_d0bdf4 |
| نَهَار | nahâr | نهر | وَٱخْتِلَـٰفِ ٱلَّيْلِ وَٱلنَّهَارِ وَٱلْفُلْكِ ٱلَّتِى | 2:164 | ve gündüzün | ve değişmesinde gece ve gündüzün ve gemilerde taşıyıp giden |  |  |  |  |  |  |  |  | l_nahaAr_1471c5 |
| قَرْيَة | karyae | قري | ٱدْخُلُوا۟ هَـٰذِهِ ٱلْقَرْيَةَ فَكُلُوا۟ مِنْهَا | 2:58 | kente | girin şu kente yeyin oradan |  |  |  |  |  |  |  |  | l_qaroyap_3147eb |
| شَدِيد | şadîd | شدد | وَأَنَّ ٱللَّهَ شَدِيدُ ٱلْعَذَابِ | 2:165 | şiddetlidir | ve gerçekten Allah'ın şiddetlidir azabı |  |  |  |  |  |  |  |  | l_adiyd_2db895 |
| شَهِيد | şahîd | شهد | مِّثْلِهِۦ وَٱدْعُوا۟ شُهَدَآءَكُم مِّن دُونِ | 2:23 | şahitlerinizi | like it ve çağırın şahitlerinizi başkadan other than |  |  |  |  |  |  |  |  | l_ahiyd_b0cb34 |
| مَسَّ | massa | مسس | وَقَالُوا۟ لَن تَمَسَّنَا ٱلنَّارُ إِلَّآ | 2:80 | bize dokunmayacaktır | Bir de dediler ki asla bize dokunmayacaktır ateş dışında |  |  |  |  |  |  |  |  | l_mas_a_ba2e94 |
| وَلَد | valad | ولد | ٱتَّخَذَ ٱللَّهُ وَلَدًا سُبْحَـٰنَهُۥ بَل | 2:116 | çocuk | edindi Allah çocuk O yücedir bilakis |  |  |  |  |  |  |  |  | l_walad_a334cd |
| أَمَّا | ammâ |  | فَمَا فَوْقَهَا فَأَمَّا ٱلَّذِينَ ءَامَنُوا۟ | 2:26 | gerçekten | hatta  olanı onun da üstünde gerçekten kimseler inanan |  |  |  |  |  |  |  |  | l_am_aA_c993e0 |
| ضَرَبَ | daraba | ضرب | يَسْتَحْىِۦٓ أَن يَضْرِبَ مَثَلًا مَّا | 2:26 | set forth | çekinecek misal vermekten set forth bir örneği gibi |  |  |  |  |  |  |  |  | l_Daraba_fbd307 |
| رِزْق | rizk | رزق | مِنَ ٱلثَّمَرَٰتِ رِزْقًا لَّكُمْ فَلَا | 2:22 | rızık olarak | çeşitli ürünlerden the fruits rızık olarak sizin için öyleyse |  |  |  |  |  |  |  |  | l_rizoq_aec3ab |
| أَقَامَ | akâma | قوم | يُؤْمِنُونَ بِٱلْغَيْبِ وَيُقِيمُونَ ٱلصَّلَوٰةَ وَمِمَّا | 2:3 | ve kılarlar | inanırlar gaybde(gizlide) ve kılarlar namazlarını ve şeyden |  |  |  |  |  |  |  |  | l_aqaAma_382983 |
| نَهَر | nahar | نهر | مِن تَحْتِهَا ٱلْأَنْهَـٰرُ كُلَّمَا رُزِقُوا۟ | 2:25 | ırmaklar | altlarından under them ırmaklar her rızıklandırıldıklarında |  |  |  |  |  |  |  |  | l_nahar_fb00c1 |
| قَٰتَلَ | kâtala | قتل | وَقَـٰتِلُوا۟ فِى سَبِيلِ | 2:190 | ve savaşın | ve savaşın yolunda (the) way |  |  |  |  |  |  |  |  | l_qa_tala_f7c6c3 |
| ضَلَّ | dalla | ضلل | بِٱلْإِيمَـٰنِ فَقَدْ ضَلَّ سَوَآءَ ٱلسَّبِيلِ | 2:108 | sapıtmıştır | imana şüphesiz (o) sapıtmıştır dümdüz yolu |  |  |  |  |  |  |  |  | l_Dal_a_2775a8 |
| جَمِيع | camîʿ | جمع | فِى ٱلْأَرْضِ جَمِيعًا ثُمَّ ٱسْتَوَىٰٓ | 2:29 | hepsini | varsa yeryüzünde hepsini sonra yöneldi |  |  |  |  |  |  |  |  | l_jamiyE_be9182 |
| خَرَجَ | haraca | خرج | لَمَا يَشَّقَّقُ فَيَخْرُجُ مِنْهُ ٱلْمَآءُ | 2:74 | çıkar | var ki çatlayıverir de çıkar ondan su |  |  |  |  |  |  |  |  | l_xaraja_d1d0bb |
| أَجَل | acal | اجل | ٱلنِّسَآءَ فَبَلَغْنَ أَجَلَهُنَّ فَأَمْسِكُوهُنَّ بِمَعْرُوفٍ | 2:231 | (iddetlerinin) sonuna | kadınları ulaştıklarında (iddetlerinin) sonuna ya onları tutun iyilikle |  |  |  |  |  |  |  |  | l_ajal_77d132 |
| بَعَثَ | baʿasa | بعث | ثُمَّ بَعَثْنَـٰكُم مِّنۢ بَعْدِ | 2:56 | sizi  tekrar diriltmiştik | sonra sizi  tekrar diriltmiştik ardından after |  |  |  |  |  |  |  |  | l_baEava_a09270 |
| مُجْرِم | mucrim | جرم | وَلِتَسْتَبِينَ سَبِيلُ ٱلْمُجْرِمِينَ | 6:55 | suçluların | belli olsun diye yolu suçluların |  |  |  |  |  |  |  |  | l_mujorim_63cb7c |
| خَلْق | halk | خلق | إِنَّ فِى خَلْقِ ٱلسَّمَـٰوَٰتِ وَٱلْأَرْضِ | 2:164 | (the) creation | şüphesiz yaratılışında (the) creation göklerin ve yerin |  |  |  |  |  |  |  |  | l_xaloq_875745 |
| أَهْلَكَ | ahlaka | هلك | لِيُفْسِدَ فِيهَا وَيُهْلِكَ ٱلْحَرْثَ وَٱلنَّسْلَ | 2:205 | ve yok etmeğe | bozgunculuğa orada ve yok etmeğe ekin ve nesli |  |  |  |  |  |  |  |  | l_aholaka_36d8f7 |
| أَحْيَا | ahyâ | حيي | وَكُنتُمْ أَمْوَٰتًا فَأَحْيَـٰكُمْ ثُمَّ يُمِيتُكُمْ | 2:28 | O sizi diriltti | siz iken ölüler O sizi diriltti sonra öldürecek |  |  |  |  |  |  |  |  | l_aHoyaA_35079e |
| بَصِير | basîr | بصر | يُعَمَّرَ وَٱللَّهُ بَصِيرٌۢ بِمَا يَعْمَلُونَ | 2:96 | görüyor | (o kadar) yaşaması Allah görüyor şeyleri yaptıkları |  |  |  |  |  |  |  |  | l_baSiyr_69e5a4 |
| تَذَكَّرَ | tazakkara | ذكر | لِلنَّاسِ لَعَلَّهُمْ يَتَذَكَّرُونَ | 2:221 | düşünürler | insanlara umulur ki düşünürler |  |  |  |  |  |  |  |  | l_ta_ak_ara_901fef |
| تَحْت | taht | تحت | تَجْرِى مِن تَحْتِهَا ٱلْأَنْهَـٰرُ كُلَّمَا | 2:25 | under them | akan altlarından under them ırmaklar her |  |  |  |  |  |  |  |  | l_taHot_fb7d9c |
| ٱفْتَرَىٰ | aftarâ | فري | مَّا كَانُوا۟ يَفْتَرُونَ | 3:24 | uyduruyor | şeyler oldukları uyduruyor |  |  |  |  |  |  |  |  | l_fotaraY_22f50e |
| عَدُوّ | ʿaduvv | عدو | بَعْضُكُمْ لِبَعْضٍ عَدُوٌّ وَلَكُمْ فِى | 2:36 | düşman olarak | kiminiz kiminize düşman olarak sizin için vardır yeryüzünde |  |  |  |  |  |  |  |  | l_Eaduw_4c00d2 |
| مَوْت | mavt | موت | ٱلصَّوَٰعِقِ حَذَرَ ٱلْمَوْتِ وَٱللَّهُ مُحِيطٌۢ | 2:19 | ölüm | the thunderclaps korkusuyla ölüm oysa Allah tamamen kuşatmıştır |  |  |  |  |  |  |  |  | l_mawot_7aa65a |
| نِعْمَة | niʿmae | نعم | إِسْرَٰٓءِيلَ ٱذْكُرُوا۟ نِعْمَتِىَ ٱلَّتِىٓ أَنْعَمْتُ | 2:40 | ni'metleri | İsrail hatırlayın ni'metleri o ki; ni'metlendirdim |  |  |  |  |  |  |  |  | l_niEomap_410611 |
| سُوٓء | sû | سوا | فِرْعَوْنَ يَسُومُونَكُمْ سُوٓءَ ٱلْعَذَابِ يُذَبِّحُونَ | 2:49 | en kötüsünü | Fir'avn onlar size reva görüyor en kötüsünü azabın boğazlayıp |  |  |  |  |  |  |  |  | l_suw_8ed869 |
| أَعْلَم | aʿlam | علم | قُلْ ءَأَنتُمْ أَعْلَمُ أَمِ ٱللَّهُ | 2:140 | daha iyi bilirsiniz | de ki siz mi daha iyi bilirsiniz yoksa Allah (mı) |  |  |  |  |  |  |  |  | l_aEolam_db561d |
| عَقَلُ | ʿakalu | عقل | ٱلْكِتَـٰبَ أَفَلَا تَعْقِلُونَ | 2:44 | aklınızı kullanmıyor musunuz? | Kitabı hâlâ aklınızı kullanmıyor musunuz? |  |  |  |  |  |  |  |  | l_Eaqalu_36636d |
| غَيْب | gayb | غيب | ٱلَّذِينَ يُؤْمِنُونَ بِٱلْغَيْبِ وَيُقِيمُونَ ٱلصَّلَوٰةَ | 2:3 | gaybde(gizlide) | onlar ki inanırlar gaybde(gizlide) ve kılarlar namazlarını |  |  |  |  |  |  |  |  | l_gayob_611f35 |
| كَتَبَ | kataba | كتب | فَوَيْلٌ لِّلَّذِينَ يَكْتُبُونَ ٱلْكِتَـٰبَ بِأَيْدِيهِمْ | 2:79 | yazıyorlar | vay haline o kimselerin ki yazıyorlar Kitabı elleriyle |  |  |  |  |  |  |  |  | l_kataba_f09a6a |
| مُتَّقِين | muttakîn | وقي | فِيهِ هُدًى لِّلْمُتَّقِينَ | 2:2 | müttakiler için | kendisinde yol göstericidir müttakiler için |  |  |  |  |  |  |  |  | l_mut_aqiyn_afd23b |
| وَعْد | vaʿd | وعد | صَدَقَكُمُ ٱللَّهُ وَعْدَهُۥٓ إِذْ تَحُسُّونَهُم | 3:152 | (yardım) va'dini | size doğruladı Allah (yardım) va'dini sürece onları öldürdüğünüz |  |  |  |  |  |  |  |  | l_waEod_f8ac8c |
| زَادَ | zâda | زيد | قُلُوبِهِم مَّرَضٌ فَزَادَهُمُ ٱللَّهُ مَرَضًا | 2:10 | artırmıştır | their hearts hastalık vardır artırmıştır Allah hastalıklarını |  |  |  |  |  |  |  |  | l_zaAda_884c7a |
| بَصَر | basar | بصر | سَمْعِهِمْ وَعَلَىٰٓ أَبْصَـٰرِهِمْ غِشَـٰوَةٌ وَلَهُمْ | 2:7 | gözlerinin | kulaklarının ve üzerine gözlerinin perde inmiştir Onlar için vardır |  |  |  |  |  |  |  |  | l_baSar_691898 |
| دَار | dâr | دور | أَنفُسَكُم مِّن دِيَـٰرِكُمْ ثُمَّ أَقْرَرْتُمْ | 2:84 | your homes | birbirinizi yurtlarınızdan your homes sonra kabul etmiştiniz |  |  |  |  |  |  |  |  | l_daAr_682c39 |
| مُلْك | mulk | ملك | ٱلشَّيَـٰطِينُ عَلَىٰ مُلْكِ سُلَيْمَـٰنَ وَمَا | 2:102 | mülkü | şeytanların hakkında mülkü Süleyman'ın küfre girmedi |  |  |  |  |  |  |  |  | l_mulok_138b85 |
| سَاعَة | sâʿae | سوع | إِذَا جَآءَتْهُمُ ٱلسَّاعَةُ بَغْتَةً قَالُوا۟ | 6:31 | o sa'at | zaman kendilerine geldiği o sa'at ansızın dediler |  |  |  |  |  |  |  |  | l_saAEap_ac5bf9 |
| سَمِيع | samîʿ | سمع | إِنَّكَ أَنتَ ٱلسَّمِيعُ ٱلْعَلِيمُ | 2:127 | işitensin | kuşkusuz sen (yalnız) sen işitensin bilensin |  |  |  |  |  |  |  |  | l_samiyE_d49cf3 |
| ظَنَّ | zanna | ظنن | ٱلَّذِينَ يَظُنُّونَ أَنَّهُم مُّلَـٰقُوا۟ | 2:46 | bilirler | onlar ki bilirler şüphesiz onlar kavuşacaklardır |  |  |  |  |  |  |  |  | l_Zan_a_9b29e5 |
| أَبٌ | abun | ابو | قَالَ إِبْرَٰهِيمُ لِأَبِيهِ ءَازَرَ أَتَتَّخِذُ | 6:74 | babası | demişti ki İbrahim babası Azer'e mi ediniyorsun? |  |  |  |  |  |  |  |  | l_abN_71b506 |
| شَكَرَ | şakara | شكر | ذَٰلِكَ لَعَلَّكُمْ تَشْكُرُونَ | 2:52 | şükredersiniz (diye) | bunun belki şükredersiniz (diye) |  |  |  |  |  |  |  |  | l_akara_350195 |
| نَبَّأَ | nabbaa | نبا | قُلْ أَؤُنَبِّئُكُم بِخَيْرٍ مِّن | 3:15 | size söyleyeyim mi? | de ki size söyleyeyim mi? daha iyisini bunlardan |  |  |  |  |  |  |  |  | l_nab_a_a_97ecfa |
| إِيمَٰن | îmân | امن | يَأْمُرُكُم بِهِۦٓ إِيمَـٰنُكُمْ إِن كُنتُم | 2:93 | imanınız | size emrediyor onunla imanınız eğer iseniz |  |  |  |  |  |  |  |  | l_iyma_n_4151c0 |
| أُولِى | ûlî | اول | ٱلْقِصَاصِ حَيَوٰةٌ يَـٰٓأُو۟لِى ٱلْأَلْبَـٰبِ لَعَلَّكُمْ | 2:179 | Ey sahipleri | the legal retribution hayat Ey sahipleri akıl böylece |  |  |  |  |  |  |  |  | l_uwliY_3328a7 |
| حَكَمَ | hakama | حكم | قَوْلِهِمْ فَٱللَّهُ يَحْكُمُ بَيْنَهُمْ يَوْمَ | 2:113 | hüküm verecektir | onların sözlerinin artık Allah hüküm verecektir aralarında günü |  |  |  |  |  |  |  |  | l_Hakama_763b9a |
| قَدِير | kadîr | قدر | كُلِّ شَىْءٍ قَدِيرٌ | 2:20 | gücü yeter | her şey gücü yeter |  |  |  |  |  |  |  |  | l_qadiyr_cd0ac2 |
| خَبِير | habîr | خبر | بِمَا تَعْمَلُونَ خَبِيرٌ | 2:234 | haberdardır | yaptıklarınızdan you do haberdardır |  |  |  |  |  |  |  |  | l_xabiyr_dadb64 |
| يَذَرَ | yazara | وذر | يُتَوَفَّوْنَ مِنكُمْ وَيَذَرُونَ أَزْوَٰجًا يَتَرَبَّصْنَ | 2:234 | geriye bıraktıkları | ölen(ler) içinizden geriye bıraktıkları eşleri (bekleyip) gözetlerler |  |  |  |  |  |  |  |  | l_ya_ara_ef2203 |

### Kova C · sıra 251–500 — **240** kelime

| ar | translit_tr | root | context_ar | context_ref | ref_tr | context_ref_tr | tr1 | tr2 | pattern | cognateTr | cognateShift | context_tr | verifiedBy | verifiedAt | lemmaId |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| أَنذَرَ | anzara | نذر | سَوَآءٌ عَلَيْهِمْ ءَأَنذَرْتَهُمْ أَمْ لَمْ | 2:6 | onları uyarman | eşittir onlara onları uyarman yada uyarmasan da |  |  |  |  |  |  |  |  | l_an_ara_72baf2 |
| حَسِبَ | hasiba | حسب | أَمْ حَسِبْتُمْ أَن تَدْخُلُوا۟ | 2:214 | sandınız (mı) | yoksa sandınız (mı) ki gireceksiniz |  |  |  |  |  |  |  |  | l_Hasiba_a4ca56 |
| مَلَكَتْ | malakat | ملك | أَوْ مَا مَلَكَتْ أَيْمَـٰنُكُمْ ذَٰلِكَ | 4:3 | sahip olduğu | yahut şeyle (yetinin) sahip olduğu ellerinizin budur |  |  |  |  |  |  |  |  | l_malakato_07e799 |
| مُشْرِك | muşrik | شرك | ٱلْكِتَـٰبِ وَلَا ٱلْمُشْرِكِينَ أَن يُنَزَّلَ | 2:105 | those who associate partners (with Allah) | kitab ve müşriklerden those who associate partners (with Allah) indirilmesini (there should) be sent down |  |  |  |  |  |  |  |  | l_mu_orik_2ba276 |
| نَادَىٰ | nâdâ | ندو | فَنَادَتْهُ ٱلْمَلَـٰٓئِكَةُ وَهُوَ | 3:39 | ona seslendiler | ona seslendiler melekler ve O (Zekeriyya) |  |  |  |  |  |  |  |  | l_naAdaY_6f54dd |
| إِسْرَائِيل | isrâîl |  | يَـٰبَنِىٓ إِسْرَٰٓءِيلَ ٱذْكُرُوا۟ نِعْمَتِىَ | 2:40 | İsrail | ey oğulları İsrail hatırlayın ni'metleri |  |  |  |  |  |  |  |  | l_isoraA_iyl_66e2a2 |
| نُوح | nûh |  | ٱصْطَفَىٰٓ ءَادَمَ وَنُوحًا وَءَالَ إِبْرَٰهِيمَ | 3:33 | ve Nuh'u | seçip üstün kıldı Adem'i ve Nuh'u ve ailesini İbrahim |  |  |  |  |  |  |  |  | l_nuwH_1acf34 |
| نُور | nûr | نور | ذَهَبَ ٱللَّهُ بِنُورِهِمْ وَتَرَكَهُمْ فِى | 2:17 | onların nurunu | giderdi Allah onların nurunu ve onları bıraktı içinde |  |  |  |  |  |  |  |  | l_nuwr_2e4de0 |
| ٱسْتَطَاعَ | astatâʿa | طوع | دِينِكُمْ إِنِ ٱسْتَطَـٰعُوا۟ وَمَن يَرْتَدِدْ | 2:217 | güçleri yetse | your religion eğer güçleri yetse ve kim döner |  |  |  |  |  |  |  |  | l_sotaTaAEa_d34f23 |
| أُدْخِلَ | udhila | دخل | عَنِ ٱلنَّارِ وَأُدْخِلَ ٱلْجَنَّةَ فَقَدْ | 3:185 | ve sokulursa | ateş(in elin)den the Fire ve sokulursa cennete işte o |  |  |  |  |  |  |  |  | l_udoxila_00b5ee |
| جَزَآء | cazâ | جزي | بِبَعْضٍ فَمَا جَزَآءُ مَن يَفْعَلُ | 2:85 | cezası | bir kısmını nedir? cezası kimsenin yapan |  |  |  |  |  |  |  |  | l_jazaA_22eebd |
| سَبَّحَ | sabbaha | سبح | ٱلدِّمَآءَ وَنَحْنُ نُسَبِّحُ بِحَمْدِكَ وَنُقَدِّسُ | 2:30 | tesbih ediyor | kan oysa biz tesbih ediyor seni överek ve takdis ediyoruz |  |  |  |  |  |  |  |  | l_sab_aHa_bf280a |
| سَوْف | savf |  | عُدْوَٰنًا وَظُلْمًا فَسَوْفَ نُصْلِيهِ نَارًا | 4:30 | yakında | düşmanlık ile ve zulüm ile yakında onu sokacağız cehenneme |  |  |  |  |  |  |  |  | l_sawof_892db8 |
| بَحْر | bahr | بحر | فَرَقْنَا بِكُمُ ٱلْبَحْرَ فَأَنجَيْنَـٰكُمْ وَأَغْرَقْنَآ | 2:50 | denizi | yarmıştık; sizin için denizi sizi kurtarmış ve boğmuştuk |  |  |  |  |  |  |  |  | l_baHor_61776d |
| عَذَّبَ | ʿazzaba | عذب | لِمَن يَشَآءُ وَيُعَذِّبُ مَن يَشَآءُ | 2:284 | azabeder | kimseyi dilediği azabeder kimseyi dilediği |  |  |  |  |  |  |  |  | l_Ea_aba_be4552 |
| عَلَّمَ | ʿallama | علم | وَعَلَّمَ ءَادَمَ ٱلْأَسْمَآءَ | 2:31 | ve öğretti | ve öğretti Adem'e isimleri |  |  |  |  |  |  |  |  | l_Eal_ama_5c04b6 |
| فَوْق | favk | فوق | بَعُوضَةً فَمَا فَوْقَهَا فَأَمَّا ٱلَّذِينَ | 2:26 | onun da üstünde | bir sivrisineği hatta  olanı onun da üstünde gerçekten kimseler |  |  |  |  |  |  |  |  | l_fawoq_451ce1 |
| حَمَلَ | hamala | حمل | وَءَالُ هَـٰرُونَ تَحْمِلُهُ ٱلْمَلَـٰٓئِكَةُ إِنَّ | 2:248 | taşıdığı | ve ailesinin Harun taşıdığı meleklerin şüphesiz |  |  |  |  |  |  |  |  | l_Hamala_304f43 |
| ٱهْتَدَىٰ | ahtadâ | هدي | وَٱلْفُرْقَانَ لَعَلَّكُمْ تَهْتَدُونَ | 2:53 | hidayete erersiniz (diye) | ve furkan belki hidayete erersiniz (diye) |  |  |  |  |  |  |  |  | l_hotadaY_132fd7 |
| ٱسْتَغْفَرَ | astagfara | غفر | أَفَاضَ ٱلنَّاسُ وَٱسْتَغْفِرُوا۟ ٱللَّهَ إِنَّ | 2:199 | ve mağfiret dileyin | akın ettiği insanların ve mağfiret dileyin Allah'tan şüphesiz |  |  |  |  |  |  |  |  | l_sotagofara_863081 |
| ٱسْتَكْبَرَ | astakbara | كبر | إِبْلِيسَ أَبَىٰ وَٱسْتَكْبَرَ وَكَانَ مِنَ | 2:34 | ve kibirlendi | İblis kaçındı ve kibirlendi ve oldu inkarcılardan |  |  |  |  |  |  |  |  | l_sotakobara_4181b5 |
| أَرَيْ | aray | راي | ٱللَّهُ ٱلْمَوْتَىٰ وَيُرِيكُمْ ءَايَـٰتِهِۦ لَعَلَّكُمْ | 2:73 | ve size gösterir | Allah ölüleri ve size gösterir ayetlerini umulur ki |  |  |  |  |  |  |  |  | l_arayo_d53b57 |
| شَرِيك | şarîk | شرك | ذَٰلِكَ فَهُمْ شُرَكَآءُ فِى ٱلثُّلُثِ | 4:12 | ortaktırlar | that onlar ortaktırlar üçte bire the third |  |  |  |  |  |  |  |  | l_ariyk_5de5f5 |
| بَلَغَ | balaga | بلغ | رُءُوسَكُمْ حَتَّىٰ يَبْلُغَ ٱلْهَدْىُ مَحِلَّهُۥ | 2:196 | varıncaya | başlarınızı kadar varıncaya kurban yerine |  |  |  |  |  |  |  |  | l_balaga_f89222 |
| بِئْسَ | bisa | باس | بِئْسَمَا ٱشْتَرَوْا۟ بِهِۦٓ | 2:90 | ne kötüdür | ne kötüdür sattıkları şey onunla |  |  |  |  |  |  |  |  | l_bi_osa_d43552 |
| كَبِير | kabîr | كبر | قِتَالٌ فِيهِ كَبِيرٌ وَصَدٌّ عَن | 2:217 | büyük bir günahtır | savaş O (aylar)da büyük bir günahtır ve alıkoymak yolundan |  |  |  |  |  |  |  |  | l_kabiyr_bbdade |
| تَرَكَ | taraka | ترك | ٱللَّهُ بِنُورِهِمْ وَتَرَكَهُمْ فِى ظُلُمَـٰتٍ | 2:17 | ve onları bıraktı | Allah onların nurunu ve onları bıraktı içinde karanlıklar |  |  |  |  |  |  |  |  | l_taraka_738029 |
| تَوَكَّلْ | tavakkal | وكل | وَعَلَى ٱللَّهِ فَلْيَتَوَكَّلِ ٱلْمُؤْمِنُونَ | 3:122 | dayansınlar | Allah'a Allah dayansınlar inananlar |  |  |  |  |  |  |  |  | l_tawak_alo_21b95a |
| وَيْل | vayl |  | فَوَيْلٌ لِّلَّذِينَ يَكْتُبُونَ | 2:79 | vay haline | vay haline o kimselerin ki yazıyorlar |  |  |  |  |  |  |  |  | l_wayol_4f2e46 |
| خَشِىَ | haşîa | خشي | مِنْهُمْ فَلَا تَخْشَوْهُمْ وَٱخْشَوْنِى وَلِأُتِمَّ | 2:150 | fear them | onlardan onlardan çekinmeyin fear them benden çekinin ve tamamlayayım |  |  |  |  |  |  |  |  | l_xa_iYa_982ede |
| إِذْن | izn | اذن | عَلَىٰ قَلْبِكَ بِإِذْنِ ٱللَّهِ مُصَدِّقًا | 2:97 | izniyle | kalbine your heart izniyle Allah'ın doğrulayıcı olarak |  |  |  |  |  |  |  |  | l_i_on_21db05 |
| أَلَآ | alâ |  | أَلَآ إِنَّهُمْ هُمُ | 2:12 | İyi bilin ki | İyi bilin ki muhakkak onlar |  |  |  |  |  |  |  |  | l_alaA_121826 |
| حَرَّمَ | harrama | حرم | إِنَّمَا حَرَّمَ عَلَيْكُمُ ٱلْمَيْتَةَ | 2:173 | haram kıldı | şüphesiz haram kıldı size leş |  |  |  |  |  |  |  |  | l_Har_ama_8f6d04 |
| حِسَاب | hisâb | حسب | وَٱللَّهُ سَرِيعُ ٱلْحِسَابِ | 2:202 | hesabı | Allah çabuk görendir hesabı |  |  |  |  |  |  |  |  | l_HisaAb_b41eae |
| جَبَل | cabal | جبل | عَلَىٰ كُلِّ جَبَلٍ مِّنْهُنَّ جُزْءًا | 2:260 | dağın | üzerine her dağın onlardan bir parça |  |  |  |  |  |  |  |  | l_jabal_7f35ca |
| مَّاتَ | mâta | موت | ٱلدِّينَ فَلَا تَمُوتُنَّ إِلَّا وَأَنتُم | 2:132 | (should) you die | bu dini öyleyse ölmeyin (should) you die başka (bir şekilde) sizler |  |  |  |  |  |  |  |  | l_m_aAta_a0f90e |
| مُسْلِم | muslim | سلم | رَبَّنَا وَٱجْعَلْنَا مُسْلِمَيْنِ لَكَ وَمِن | 2:128 | teslim olanlardan | Rabbimiz bizi yap teslim olanlardan sana neslimizden de |  |  |  |  |  |  |  |  | l_musolim_c8bd6d |
| بُشِّرَ | buşşira | بشر | وَبَشِّرِ ٱلَّذِينَ ءَامَنُوا۟ | 2:25 | ve müjdele | ve müjdele kimseleri inanan |  |  |  |  |  |  |  |  | l_bu_ira_749280 |
| ضَلَٰل | dalâl | ضلل | قَبْلُ لَفِى ضَلَـٰلٍ مُّبِينٍ | 3:164 | bir sapıklık | before (that) içinde bir sapıklık açık |  |  |  |  |  |  |  |  | l_Dala_l_fc4484 |
| مَّعْرُوف | maʿrûf | عرف | شَىْءٌ فَٱتِّبَاعٌۢ بِٱلْمَعْرُوفِ وَأَدَآءٌ إِلَيْهِ | 2:178 | örfe | bir şey artık uymalıdır örfe ve (diyeti) ödemelidir ona |  |  |  |  |  |  |  |  | l_m_aEoruwf_413882 |
| مَّيِّت | mayyit | موت | بِٱللَّهِ وَكُنتُمْ أَمْوَٰتًا فَأَحْيَـٰكُمْ ثُمَّ | 2:28 | ölüler | Allah'a siz iken ölüler O sizi diriltti sonra |  |  |  |  |  |  |  |  | l_m_ay_it_fb6ea2 |
| مُحْسِن | muhsin | حسن | خَطَـٰيَـٰكُمْ وَسَنَزِيدُ ٱلْمُحْسِنِينَ | 2:58 | güzel davrananlara | hatalarınızı ve daha fazlasını vereceğiz güzel davrananlara |  |  |  |  |  |  |  |  | l_muHosin_7e031b |
| رَّضِىَ | radîa | رضو | وَلَن تَرْضَىٰ عَنكَ ٱلْيَهُودُ | 2:120 | razı | ve olmazlar razı senden (ne) yahudiler |  |  |  |  |  |  |  |  | l_r_aDiYa_3ee772 |
| ذَنب | zanb | ذنب | فَأَخَذَهُمُ ٱللَّهُ بِذُنُوبِهِمْ وَٱللَّهُ شَدِيدُ | 3:11 | günahlarıyla | onları yakaladı Allah günahlarıyla Allah'ın çetindir |  |  |  |  |  |  |  |  | l_anb_d90705 |
| بَشَر | başar | بشر | وَلَمْ يَمْسَسْنِى بَشَرٌ قَالَ كَذَٰلِكِ | 3:47 | bir beşer | bana dokunmamışken touch(ed) me bir beşer dedi böyledir |  |  |  |  |  |  |  |  | l_ba_ar_dfc1d7 |
| فَاسِق | fâsik | فسق | بِهِۦٓ إِلَّا ٱلْفَـٰسِقِينَ | 2:26 | fasıklardan | onunla başkasını fasıklardan |  |  |  |  |  |  |  |  | l_faAsiq_392fe3 |
| حَشَرَ | haşara | حشر | أَنَّكُمْ إِلَيْهِ تُحْشَرُونَ | 2:203 | toplanacaksınız | şüphesiz siz O'nun huzuruna toplanacaksınız |  |  |  |  |  |  |  |  | l_Ha_ara_ed6489 |
| كُفْر | kufr | كفر | لَّعَنَهُمُ ٱللَّهُ بِكُفْرِهِمْ فَقَلِيلًا مَّا | 2:88 | inkarlarından dolayı | onları la'netlemiştir Allah inkarlarından dolayı artık çok az inanırlar |  |  |  |  |  |  |  |  | l_kufor_1c9ee6 |
| نَجَّىٰ | naccâ | نجو | وَإِذْ نَجَّيْنَـٰكُم مِّنْ ءَالِ | 2:49 | sizi kurtarmıştık | hani sizi kurtarmıştık ailesinden (the) people |  |  |  |  |  |  |  |  | l_naj_aY_521435 |
| صَدَّ | sadda | صدد | ٱلْكِتَـٰبِ لِمَ تَصُدُّونَ عَن سَبِيلِ | 3:99 | çevirmeğe çalışıyorsunuz | Kitap niçin? çevirmeğe çalışıyorsunuz yolundan (the) way |  |  |  |  |  |  |  |  | l_Sad_a_552787 |
| سُلْطَٰن | sultân | سلط | يُنَزِّلْ بِهِۦ سُلْطَـٰنًا وَمَأْوَىٰهُمُ ٱلنَّارُ | 3:151 | hiçbir güç | He sent down kendilerine hiçbir güç ve gidecekleri yer de cehennemdir |  |  |  |  |  |  |  |  | l_suloTa_n_bfb334 |
| يَحْزُن | yahzun | حزن | وَلَا هُمْ يَحْزَنُونَ | 2:38 | üzülenlerden | ve olmazlar onlar üzülenlerden |  |  |  |  |  |  |  |  | l_yaHozun_b30b11 |
| ذَاقُ | zâku | ذوق | بَعْدَ إِيمَـٰنِكُمْ فَذُوقُوا۟ ٱلْعَذَابَ بِمَا | 3:106 | öyle ise tadın | sonra inanmanızdan öyle ise tadın azabı karşılık |  |  |  |  |  |  |  |  | l_aAqu_e43a4a |
| أَحْسَن | ahsan | حسن | ٱللَّهِ وَمَنْ أَحْسَنُ مِنَ ٱللَّهِ | 2:138 | daha güzeli | Allah'ın ve kimdir daha güzeli Allah'tan Allah |  |  |  |  |  |  |  |  | l_aHosan_e3fcdb |
| رَدَّ | radda | ردد | وَيَوْمَ ٱلْقِيَـٰمَةِ يُرَدُّونَ إِلَىٰٓ أَشَدِّ | 2:85 | onlar itilirler | ve gününde kıyamet onlar itilirler en şiddetlisine (the) most severe |  |  |  |  |  |  |  |  | l_rad_a_c68b16 |
| سَيِّـَٔات | sayyiât | سوا | عَنكُم مِّن سَيِّـَٔاتِكُمْ وَٱللَّهُ بِمَا | 2:271 | günahlarınızın | sizden bir kısmını günahlarınızın Allah şeylerden |  |  |  |  |  |  |  |  | l_say_i_aAt_cbbfce |
| ٱسْتَوَىٰٓ | astavâ | سوي | جَمِيعًا ثُمَّ ٱسْتَوَىٰٓ إِلَى ٱلسَّمَآءِ | 2:29 | yöneldi | hepsini sonra yöneldi göke the heaven |  |  |  |  |  |  |  |  | l_sotawaY_89d53f |
| ٱخْتَلَفَ | ahtalafa | خلف | كَانُوا۟ فِيهِ يَخْتَلِفُونَ | 2:113 | ihtilaf halinde | oldukları onda ihtilaf halinde |  |  |  |  |  |  |  |  | l_xotalafa_cd0ab4 |
| ذَهَبَ | zahaba | ذهب | مَا حَوْلَهُۥ ذَهَبَ ٱللَّهُ بِنُورِهِمْ | 2:17 | giderdi | çevresini (was) around him giderdi Allah onların nurunu |  |  |  |  |  |  |  |  | l_ahaba_3f10c5 |
| إِثْم | ism | اثم | تَظَـٰهَرُونَ عَلَيْهِم بِٱلْإِثْمِ وَٱلْعُدْوَٰنِ وَإِن | 2:85 | günah | birleşiyorsunuz onlara karşı günah ve düşmanlıkla ve eğer |  |  |  |  |  |  |  |  | l_ivom_eafb0c |
| بَيَّنُ | bayyanu | بين | لَنَا رَبَّكَ يُبَيِّن لَّنَا مَا | 2:68 | açıklasın | bizim için Rabbine açıklasın bize ne olduğunu |  |  |  |  |  |  |  |  | l_bay_anu_305824 |
| حِين | hîn | حين | وَمَتَـٰعٌ إِلَىٰ حِينٍ | 2:36 | a period | ve nimet bir süre a period |  |  |  |  |  |  |  |  | l_Hiyn_b9a2cc |
| مُّرْسَل | mursal | رسل | وَإِنَّكَ لَمِنَ ٱلْمُرْسَلِينَ | 2:252 | the Messengers | elbette sen gönderilenlerdensin the Messengers |  |  |  |  |  |  |  |  | l_m_urosal_fc2a88 |
| مَتَٰع | matâʿ | متع | ٱلْأَرْضِ مُسْتَقَرٌّ وَمَتَـٰعٌ إِلَىٰ حِينٍ | 2:36 | ve nimet | the earth kalmak ve nimet bir süre a period |  |  |  |  |  |  |  |  | l_mata_E_087815 |
| نَسِىَ | nasîa | نسي | ٱلنَّاسَ بِٱلْبِرِّ وَتَنسَوْنَ أَنفُسَكُمْ وَأَنتُمْ | 2:44 | unutuyorsunuz da | insanlara iyiliği unutuyorsunuz da kendinizi ve siz |  |  |  |  |  |  |  |  | l_nasiYa_a017e1 |
| نَصِير | nasîr | نصر | وَلِىٍّ وَلَا نَصِيرٍ | 2:107 | bir yardımcı | koruyucu ve (ne de) bir yardımcı |  |  |  |  |  |  |  |  | l_naSiyr_87b8a1 |
| سَجَدَ | sacada | سجد | قُلْنَا لِلْمَلَـٰٓئِكَةِ ٱسْجُدُوا۟ لِـَٔادَمَ فَسَجَدُوٓا۟ | 2:34 | secde edin | demiştik Meleklere secde edin Adem'e hemen secde ettiler |  |  |  |  |  |  |  |  | l_sajada_c38135 |
| ءَالَآء | âlâ | الو | بَصْۜطَةً فَٱذْكُرُوٓا۟ ءَالَآءَ ٱللَّهِ لَعَلَّكُمْ | 7:69 | ni'metlerini | üstünlük güç' hatırlayın ki ni'metlerini Allah'ın umulur ki |  |  |  |  |  |  |  |  | l_aAlaA_553b3f |
| ٱبْتَغَىٰ | abtagâ | بغي | فَٱلْـَٔـٰنَ بَـٰشِرُوهُنَّ وَٱبْتَغُوا۟ مَا كَتَبَ | 2:187 | ve arayın | artık şimdi onlara yaklaşın ve arayın şeyleri yaz(ıp takdir etmiş ol)duğu |  |  |  |  |  |  |  |  | l_botagaY_ad5f0f |
| أُمّ | umm | امم | مُّحْكَمَـٰتٌ هُنَّ أُمُّ ٱلْكِتَـٰبِ وَأُخَرُ | 3:7 | anasıdır | muhkemdir (ki) onlar anasıdır Kitabın ve diğerleri de |  |  |  |  |  |  |  |  | l_um_dd7260 |
| فِتْنَة | fitnae | فتن | إِنَّمَا نَحْنُ فِتْنَةٌ فَلَا تَكْفُرْ | 2:102 | fitneyiz | şüphesiz biz fitneyiz sakın küfre girmeyin disbelieve |  |  |  |  |  |  |  |  | l_fitonap_d46440 |
| مَرْيَم | maryam |  | عِيسَى ٱبْنَ مَرْيَمَ ٱلْبَيِّنَـٰتِ وَأَيَّدْنَـٰهُ | 2:87 | Meryem | Îsa'ya oğlu Meryem açık deliller ve onu  destekledik |  |  |  |  |  |  |  |  | l_maroyam_acbcf0 |
| شَمْس | şams | شمس | ٱللَّهَ يَأْتِى بِٱلشَّمْسِ مِنَ ٱلْمَشْرِقِ | 2:258 | güneşi | Allah getirir güneşi doğudan the east |  |  |  |  |  |  |  |  | l_amos_c38bdc |
| فَرِيق | farîk | فرق | وَقَدْ كَانَ فَرِيقٌ مِّنْهُمْ يَسْمَعُونَ | 2:75 | bir grup | oysa vardı ki bir grup bunlardan işitirlerdi de |  |  |  |  |  |  |  |  | l_fariyq_23fdad |
| حَرَام | harâm | حرم | شَطْرَ ٱلْمَسْجِدِ ٱلْحَرَامِ وَحَيْثُ مَا | 2:144 | Haram'a | tarafına Mescid-i Haram'a ve nerede olursanız |  |  |  |  |  |  |  |  | l_HaraAm_07e3df |
| كَذِب | kazib | كذب | عَلَى ٱللَّهِ ٱلْكَذِبَ وَهُمْ يَعْلَمُونَ | 3:75 | yalan | karşı Allah'a yalan ve onlar bile bile |  |  |  |  |  |  |  |  | l_ka_ib_7a5632 |
| كَلَّا | kallâ |  | كَلَّا سَنَكْتُبُ مَا | 19:79 | hayır | hayır biz yazacağız şeyi |  |  |  |  |  |  |  |  | l_kal_aA_3a705b |
| نَّعَم | naʿam | نعم | وَٱلْخَيْلِ ٱلْمُسَوَّمَةِ وَٱلْأَنْعَـٰمِ وَٱلْحَرْثِ ذَٰلِكَ | 3:14 | davarlardan | ve atlardan salma davarlardan ve ekinlerden (gelen) bunlar (sadece) |  |  |  |  |  |  |  |  | l_n_aEam_57fa95 |
| قَامَ | kâma | قوم | أَظْلَمَ عَلَيْهِمْ قَامُوا۟ وَلَوْ شَآءَ | 2:20 | dikilip kalırlar | karanlık çöktüğü üzerlerine dikilip kalırlar eğer dileseydi |  |  |  |  |  |  |  |  | l_qaAma_63cbf7 |
| أَعْرَضَ | aʿrada | عرض | تَابَا وَأَصْلَحَا فَأَعْرِضُوا۟ عَنْهُمَآ إِنَّ | 4:16 | artık vazgeçin | tevbe eder ve uslanırlarsa artık vazgeçin onlardan çünkü |  |  |  |  |  |  |  |  | l_aEoraDa_78a3e1 |
| عَٰقِبَة | ʿâkibae | عقب | كَيْفَ كَانَ عَـٰقِبَةُ ٱلْمُكَذِّبِينَ | 3:137 | sonunun | nasıl olduğunu sonunun yalanlayıcıların |  |  |  |  |  |  |  |  | l_Ea_qibap_313f20 |
| كَٰذِب | kâzib | كذب | ٱللَّهِ عَلَى ٱلْكَـٰذِبِينَ | 3:61 | yalancıların | Allah'ın üstüne yalancıların |  |  |  |  |  |  |  |  | l_ka_ib_807adf |
| كَفَىٰ | kafâ | كفي | فِى شِقَاقٍ فَسَيَكْفِيكَهُمُ ٱللَّهُ وَهُوَ | 2:137 | onlara karşı sana yeter | içine anlaşmazlık (düşerler) onlara karşı sana yeter Allah ve O |  |  |  |  |  |  |  |  | l_kafaY_089040 |
| نَهَىٰ | nahâ | نهي | وَيَأْمُرُونَ بِٱلْمَعْرُوفِ وَيَنْهَوْنَ عَنِ ٱلْمُنكَرِ | 3:104 | ve men'eden | ve emreden iyiliği ve men'eden kötülükten the wrong |  |  |  |  |  |  |  |  | l_nahaY_8c8b5c |
| خَٰسِرِين | hâsirîn | خسر | أُو۟لَـٰٓئِكَ هُمُ ٱلْخَـٰسِرُونَ | 2:27 | ziyana uğrayanlar | işte onlardır ziyana uğrayanlar |  |  |  |  |  |  |  |  | l_xa_siriyn_7458a8 |
| زَكَوٰة | zakûâe | زكو | ٱلصَّلَوٰةَ وَءَاتُوا۟ ٱلزَّكَوٰةَ وَٱرْكَعُوا۟ مَعَ | 2:43 | zekatı | namazı ve verin zekatı ve ruku edin beraber |  |  |  |  |  |  |  |  | l_zakaw_p_c43173 |
| إِذًا | izenâ |  | ٱلْعِلْمِ إِنَّكَ إِذًا لَّمِنَ ٱلظَّـٰلِمِينَ | 2:145 | o takdirde | the knowledge şüphesiz sen o takdirde zalimlerden (olursun) the wrongdoers |  |  |  |  |  |  |  |  | l_i_FA_60c2bd |
| أَشَدّ | aşadd | شدد | كَٱلْحِجَارَةِ أَوْ أَشَدُّ قَسْوَةً وَإِنَّ | 2:74 | daha da | taş gibi hatta daha da katıdır çünkü |  |  |  |  |  |  |  |  | l_a_ad_4fecc8 |
| نَفَعَ | nafaʿa | نفع | يَضُرُّهُمْ وَلَا يَنفَعُهُمْ وَلَقَدْ عَلِمُوا۟ | 2:102 | yarar vereni | zarar veren değil yarar vereni andolsun gayet iyi biliyorlardı ki |  |  |  |  |  |  |  |  | l_nafaEa_06e253 |
| وَٰحِدَة | vâhidae | وحد | ٱلنَّاسُ أُمَّةً وَٰحِدَةً فَبَعَثَ ٱللَّهُ | 2:213 | bir tek | insanlar ümmet bir tek sonra gönderdi Allah |  |  |  |  |  |  |  |  | l_wa_Hidap_1b129f |
| عَسَى | ʿasî | عسي | كُرْهٌ لَّكُمْ وَعَسَىٰٓ أَن تَكْرَهُوا۟ | 2:216 | olur ki bazen | hoşunuza gitmez sizin olur ki bazen hoşlanmadığınız you dislike |  |  |  |  |  |  |  |  | l_EasaY_2fc848 |
| حُكْم | hukm | حكم | ٱللَّهُ ٱلْكِتَـٰبَ وَٱلْحُكْمَ وَٱلنُّبُوَّةَ ثُمَّ | 3:79 | hüküm (hikmet) | Allah Kitap hüküm (hikmet) ve peygamberlik sonra (o kalksın) |  |  |  |  |  |  |  |  | l_Hukom_5dd24a |
| كَرِيم | karîm | كرم | وَنُدْخِلْكُم مُّدْخَلًا كَرِيمًا | 4:31 | güzel | ve sizi sokarız bir yere güzel |  |  |  |  |  |  |  |  | l_kariym_465d92 |
| لَبِثَ | labisa | لبث | قَالَ كَمْ لَبِثْتَ قَالَ لَبِثْتُ | 2:259 | kaldın | dedi ne kadar kaldın dedi kaldım |  |  |  |  |  |  |  |  | l_labiva_2b778d |
| مَلَأ | mala | ملا | تَرَ إِلَى ٱلْمَلَإِ مِنۢ بَنِىٓ | 2:246 | the chiefs | you see ileri gelenlerini the chiefs oğullarının (the) Children |  |  |  |  |  |  |  |  | l_mala_3ccd3f |
| قُوَّة | kuvvae | قوي | مَآ ءَاتَيْنَـٰكُم بِقُوَّةٍ وَٱذْكُرُوا۟ مَا | 2:63 | kuvvetle | şeyi size verdiğimiz kuvvetle ve hatırlayın şeyi |  |  |  |  |  |  |  |  | l_quw_ap_4ad7a3 |
| سَآءَ | sâa | سوا | تَمْسَسْكُمْ حَسَنَةٌ تَسُؤْهُمْ وَإِن تُصِبْكُمْ | 3:120 | onları tasalandırır | size dokunsa bir iyilik onları tasalandırır ve eğer size dokunsa |  |  |  |  |  |  |  |  | l_saA_a_0909f5 |
| وَٰحِد | vâhid | وحد | عَلَىٰ طَعَامٍ وَٰحِدٍ فَٱدْعُ لَنَا | 2:61 | bir | yemeğe food bir du'a et bizim için |  |  |  |  |  |  |  |  | l_wa_Hid_e2c15d |
| وَلَّىٰ | vallâ | ولي | وَٱلْمَغْرِبُ فَأَيْنَمَا تُوَلُّوا۟ فَثَمَّ وَجْهُ | 2:115 | dönerseniz | batı da nereye dönerseniz oradadır yüzü (zatı) |  |  |  |  |  |  |  |  | l_wal_aY_e4e16c |
| أَبْصَرَ | absara | بصر | ظُلُمَـٰتٍ لَّا يُبْصِرُونَ | 2:17 | görenlerden | karanlıklar değildir görenlerden |  |  |  |  |  |  |  |  | l_aboSara_9f0224 |
| عَهْد | ʿahd | عهد | ٱلَّذِينَ يَنقُضُونَ عَهْدَ ٱللَّهِ مِنۢ | 2:27 | (verdikleri) sözü | onlar ki bozarlar (verdikleri) sözü Allah'a sonradan |  |  |  |  |  |  |  |  | l_Eahod_2c711f |
| عَرْش | ʿarş | عرش | خَاوِيَةٌ عَلَىٰ عُرُوشِهَا قَالَ أَنَّىٰ | 2:259 | çatıları | (duvarları) yığılmış üstüne çatıları dedi ki nasıl |  |  |  |  |  |  |  |  | l_Earo_7dbbdb |
| حَيْث | hays | حيث | مِنْهَا رَغَدًا حَيْثُ شِئْتُمَا وَلَا | 2:35 | yerde | ondan bol bol yerde dilediğiniz yaklaşmayın |  |  |  |  |  |  |  |  | l_Hayov_5b7279 |
| جُند | cund | جند | فَصَلَ طَالُوتُ بِٱلْجُنُودِ قَالَ إِنَّ | 2:249 | ordularla | ayrıldığında Talut ordularla dedi ki şüphesiz |  |  |  |  |  |  |  |  | l_jund_600913 |
| كَأَنّ | kaann |  | وَرَآءَ ظُهُورِهِمْ كَأَنَّهُمْ لَا يَعْلَمُونَ | 2:101 | sanki gibi | arkasına sırtlarının sanki gibi bilmiyorlarmış know |  |  |  |  |  |  |  |  | l_ka_an_965a6d |
| نَبَأ | naba | نبا | ذَٰلِكَ مِنْ أَنۢبَآءِ ٱلْغَيْبِ نُوحِيهِ | 3:44 | (the) news | bunlar haberlerindendir (the) news görünmez alemin vahyettiğimiz |  |  |  |  |  |  |  |  | l_naba_ea48de |
| رَجُل | racul | رجل | لَّمْ يَكُونَا رَجُلَيْنِ فَرَجُلٌ وَٱمْرَأَتَانِ | 2:282 | iki erkek | yoksa there are iki erkek (o zaman) bir erkek iki kadın |  |  |  |  |  |  |  |  | l_rajul_891848 |
| رِيح | rîh | روح | دَآبَّةٍ وَتَصْرِيفِ ٱلرِّيَـٰحِ وَٱلسَّحَابِ ٱلْمُسَخَّرِ | 2:164 | rüzgarları | canlıyı ve evirip çevirmesinde rüzgarları ve bulutları emre hazır bekleyen |  |  |  |  |  |  |  |  | l_riyH_14b7a7 |
| ٱسْتَجَابَ | astacâba | جوب | إِذَا دَعَانِ فَلْيَسْتَجِيبُوا۟ لِى وَلْيُؤْمِنُوا۟ | 2:186 | O halde onlar da karşılık versinler | zaman bana du'a ettiği O halde onlar da karşılık versinler bana inansınlar ki |  |  |  |  |  |  |  |  | l_sotajaAba_abdb53 |
| ذُرِّيَّة | zurriyyae | ذرر | قَالَ وَمِن ذُرِّيَّتِى قَالَ لَا | 2:124 | my offspring | (İbrahim) dedi ki benim soyumdan da my offspring buyurdu ulaşmaz |  |  |  |  |  |  |  |  | l_ur_iy_ap_2745b8 |
| أَبَدًا | abadenâ | ابد | وَلَن يَتَمَنَّوْهُ أَبَدًۢا بِمَا قَدَّمَتْ | 2:95 | asla | fakat (ölümü) istemezler they wish for it asla dolayı yapıp sunduğu işlerden |  |  |  |  |  |  |  |  | l_abadFA_f54ff9 |
| أَغْنَتْ | agnat | غني | كَفَرُوا۟ لَن تُغْنِىَ عَنْهُمْ أَمْوَٰلُهُمْ | 3:10 | will avail | inkar eden(ler) yarar sağlamaz will avail onlara malları |  |  |  |  |  |  |  |  | l_agonato_9fcd5e |
| أَنَّىٰ | annâ | اني | فَأْتُوا۟ حَرْثَكُمْ أَنَّىٰ شِئْتُمْ وَقَدِّمُوا۟ | 2:223 | biçimde | varın tarlanıza biçimde dilediğiniz ve hazırlık yapın |  |  |  |  |  |  |  |  | l_an_aY_15158e |
| أَصْبَحَ | asbaha | صبح | بَيْنَ قُلُوبِكُمْ فَأَصْبَحْتُم بِنِعْمَتِهِۦٓ إِخْوَٰنًا | 3:103 | (haline) geldiniz | arasını kalblerinizin (haline) geldiniz O'un ni'metiyle kardeşler |  |  |  |  |  |  |  |  | l_aSobaHa_69bc2c |
| أَصْلَحَ | aslaha | صلح | ٱلَّذِينَ تَابُوا۟ وَأَصْلَحُوا۟ وَبَيَّنُوا۟ فَأُو۟لَـٰٓئِكَ | 2:160 | uslananlar | (kimseler) tevbe edip uslananlar ve (gerçeği) açıklayanlar işte onlar |  |  |  |  |  |  |  |  | l_aSolaHa_540483 |
| حَدِيث | hadîs | حدث | يَكْتُمُونَ ٱللَّهَ حَدِيثًا | 4:42 | (hiçbir) söz | they will (be able to) hide Allah'tan (hiçbir) söz |  |  |  |  |  |  |  |  | l_Hadiyv_d707e2 |
| حَسَنَة | hasanae | حسن | فِى ٱلدُّنْيَا حَسَنَةً وَفِى ٱلْـَٔاخِرَةِ | 2:201 | güzellik | dünyada da the world güzellik ahirette de the Hereafter |  |  |  |  |  |  |  |  | l_Hasanap_efe980 |
| كَلِمَة | kalimae | كلم | بِيَحْيَىٰ مُصَدِّقًۢا بِكَلِمَةٍ مِّنَ ٱللَّهِ | 3:39 | bir kelimeyi | Yahya'yı doğrulayıcı bir kelimeyi Allahtan Allah |  |  |  |  |  |  |  |  | l_kalimap_5d4228 |
| مَّغْفِرَة | magfirae | غفر | بِٱلْهُدَىٰ وَٱلْعَذَابَ بِٱلْمَغْفِرَةِ فَمَآ أَصْبَرَهُمْ | 2:175 | mağfiret karşılığında | hidayet karşılığında ve azab mağfiret karşılığında ne kadar cesaretlidirler |  |  |  |  |  |  |  |  | l_m_agofirap_60a926 |
| مَصِير | masîr | صير | ٱلنَّارِ وَبِئْسَ ٱلْمَصِيرُ | 2:126 | dönüş yeridir | cehennem ve ne kötü dönüş yeridir |  |  |  |  |  |  |  |  | l_maSiyr_274d5b |
| مَسْجِد | mascid | سجد | مِمَّن مَّنَعَ مَسَـٰجِدَ ٱللَّهِ أَن | 2:114 | mescidlerinde | kimseden men eden mescidlerinde Allah'ın anılmasına |  |  |  |  |  |  |  |  | l_masojid_ddafe8 |
| رَّحِمَ | rahima | رحم | وَٱغْفِرْ لَنَا وَٱرْحَمْنَآ أَنتَ مَوْلَىٰنَا | 2:286 | bize merhamet et | bağışla bizi bize merhamet et sen bizim sahibimizsin |  |  |  |  |  |  |  |  | l_r_aHima_870005 |
| رِجَال | ricâl | رجل | عَلَيْهِنَّ بِٱلْمَعْرُوفِ وَلِلرِّجَالِ عَلَيْهِنَّ دَرَجَةٌ | 2:228 | erkeklerin (hakları) | (is) on them (örfe uygun) hakları erkeklerin (hakları) onlar (kadınlar) üzerinde bir derece fazladır |  |  |  |  |  |  |  |  | l_rijaAl_b36b89 |
| سِحْر | sihr | سحر | يُعَلِّمُونَ ٱلنَّاسَ ٱلسِّحْرَ وَمَآ أُنزِلَ | 2:102 | sihri | öğreterek insanlara sihri ve şeyi indirilen |  |  |  |  |  |  |  |  | l_siHor_af28f3 |
| أَفْلَحَ | aflaha | فلح | ٱللَّهَ لَعَلَّكُمْ تُفْلِحُونَ | 2:189 | kurtuluşa erersiniz | Allah'tan umulur ki kurtuluşa erersiniz |  |  |  |  |  |  |  |  | l_afolaHa_e69ae1 |
| بَاب | bâb | بوب | رَغَدًا وَٱدْخُلُوا۟ ٱلْبَابَ سُجَّدًا وَقُولُوا۟ | 2:58 | kapıdan | bol bol girin kapıdan secde ederek ve deyin |  |  |  |  |  |  |  |  | l_baAb_51f669 |
| عَفَا | ʿafâ | عفو | ثُمَّ عَفَوْنَا عَنكُم مِّنۢ | 2:52 | affetmiştik | sonra affetmiştik sizi ardından |  |  |  |  |  |  |  |  | l_EafaA_0e7e7b |
| عَصَا | ʿasâ | عصي | ذَٰلِكَ بِمَا عَصَوا۟ وَّكَانُوا۟ يَعْتَدُونَ | 2:61 | isyan etmeleri | işte bu sebebiyledir isyan etmeleri ve oldukları sınırı aşmış |  |  |  |  |  |  |  |  | l_EaSaA_9aa159 |
| غَٰفِل | gâfil | غفل | وَمَا ٱللَّهُ بِغَـٰفِلٍ عَمَّا تَعْمَلُونَ | 2:74 | gafil | ve değildir Allah gafil yaptıklarınızdan you do |  |  |  |  |  |  |  |  | l_ga_fil_8b70be |
| جَٰهَدَ | câhada | جهد | وَٱلَّذِينَ هَاجَرُوا۟ وَجَـٰهَدُوا۟ فِى سَبِيلِ | 2:218 | ve cihat edenler | ve kimseler ve hicret edenler ve cihat edenler yolunda (the) way |  |  |  |  |  |  |  |  | l_ja_hada_33407c |
| كَافِر | kâfir | كفر | تَكُونُوٓا۟ أَوَّلَ كَافِرٍۭ بِهِۦ وَلَا | 2:41 | inkar eden | be ilk inkar eden onu ve satmayın |  |  |  |  |  |  |  |  | l_kaAfir_9b3cf0 |
| لُوط | lût |  | وَٱلْيَسَعَ وَيُونُسَ وَلُوطًا وَكُلًّا فَضَّلْنَا | 6:86 | ve Lut'a da | ve el-Yesa'a ve Yunus'a ve Lut'a da hepsini üstün kıldık |  |  |  |  |  |  |  |  | l_luwT_833109 |
| مَّكَان | makân | كون | ٱسْتِبْدَالَ زَوْجٍ مَّكَانَ زَوْجٍ وَءَاتَيْتُمْ | 4:20 | yerine | başka bir eş yerine bir eşin vermiş olsanız (dahi) |  |  |  |  |  |  |  |  | l_m_akaAn_b26fbd |
| مُنَٰفِقُون | munâfikûn | نفق | ٱلرَّسُولِ رَأَيْتَ ٱلْمُنَـٰفِقِينَ يَصُدُّونَ عَنكَ | 4:61 | o ikiyüzlülerin | Elçiye görürsün o ikiyüzlülerin uzaklaştıklarını senden |  |  |  |  |  |  |  |  | l_muna_fiquwn_bdda5c |
| قَدَّمَ | kaddama | قدم | أَبَدًۢا بِمَا قَدَّمَتْ أَيْدِيهِمْ وَٱللَّهُ | 2:95 | yapıp sunduğu işlerden | asla dolayı yapıp sunduğu işlerden ellerinin Allah |  |  |  |  |  |  |  |  | l_qad_ama_29cf56 |
| قَمَر | kamar | قمر | فَلَمَّا رَءَا ٱلْقَمَرَ بَازِغًا قَالَ | 6:77 | Ay'ı | ne zaman ki gördüğünde Ay'ı doğarken dedi |  |  |  |  |  |  |  |  | l_qamar_a95a93 |
| سَوَآء | savâ | سوي | ٱلَّذِينَ كَفَرُوا۟ سَوَآءٌ عَلَيْهِمْ ءَأَنذَرْتَهُمْ | 2:6 | eşittir | ki inkar edenler eşittir onlara onları uyarman |  |  |  |  |  |  |  |  | l_sawaA_91f5d4 |
| يُوسُف | yûsuf |  | وَسُلَيْمَـٰنَ وَأَيُّوبَ وَيُوسُفَ وَمُوسَىٰ وَهَـٰرُونَ | 6:84 | ve Yusuf'a | ve Süleyman'a ve Eyyub'a ve Yusuf'a ve Musa'ya ve Harun'a |  |  |  |  |  |  |  |  | l_yuwsuf_bd02d7 |
| ءَال | âl | اول | نَجَّيْنَـٰكُم مِّنْ ءَالِ فِرْعَوْنَ يَسُومُونَكُمْ | 2:49 | (the) people | sizi kurtarmıştık ailesinden (the) people Fir'avn onlar size reva görüyor |  |  |  |  |  |  |  |  | l_aAl_95d364 |
| ٱمْرَأَت | amraat | مرا | رَجُلَيْنِ فَرَجُلٌ وَٱمْرَأَتَانِ مِمَّن تَرْضَوْنَ | 2:282 | iki kadın | iki erkek (o zaman) bir erkek iki kadın kimse razı olduğunuz |  |  |  |  |  |  |  |  | l_mora_at_d761dc |
| أَجْمَعِين | acmaʿîn | جمع | وَٱلْمَلَـٰٓئِكَةِ وَٱلنَّاسِ أَجْمَعِينَ | 2:161 | tüm | ve meleklerin ve insanların tüm |  |  |  |  |  |  |  |  | l_ajomaEiyn_0fc80b |
| بَٰطِل | bâtil | بطل | تَلْبِسُوا۟ ٱلْحَقَّ بِٱلْبَـٰطِلِ وَتَكْتُمُوا۟ ٱلْحَقَّ | 2:42 | batılla | mix gerçeği batılla ve gizlemeyin hakkı |  |  |  |  |  |  |  |  | l_ba_Til_462461 |
| جَحِيم | cahîm | جحم | عَنْ أَصْحَـٰبِ ٱلْجَحِيمِ | 2:119 | cehennem | halkından (the) companions cehennem |  |  |  |  |  |  |  |  | l_jaHiym_0170fa |
| كَيْد | kayd | كيد | لَا يَضُرُّكُمْ كَيْدُهُمْ شَيْـًٔا إِنَّ | 3:120 | onların tuzağı | size zarar vermez will harm you onların tuzağı hiçbir şekilde şüphesiz |  |  |  |  |  |  |  |  | l_kayod_27a62a |
| مَاذَا | mâzâ |  | كَفَرُوا۟ فَيَقُولُونَ مَاذَآ أَرَادَ ٱللَّهُ | 2:26 | neyi | inkar derler ki neyi istedi (kasdetti) Allah |  |  |  |  |  |  |  |  | l_maA_aA_ff073e |
| قَرِيب | karîb | قرب | عَنِّى فَإِنِّى قَرِيبٌ أُجِيبُ دَعْوَةَ | 2:186 | (onlara) yakınım | benden şüphesiz ben (onlara) yakınım karşılık veririm du'asına |  |  |  |  |  |  |  |  | l_qariyb_b0bf66 |
| ثَمُود | samûd |  | وَإِلَىٰ ثَمُودَ أَخَاهُمْ صَـٰلِحًا | 7:73 | Semud(kavmin)e de | ve Semud(kavmin)e de kardeşleri Salih'i (gönderdik) |  |  |  |  |  |  |  |  | l_vamuwd_717675 |
| خَوْف | havf | خوف | هُدَاىَ فَلَا خَوْفٌ عَلَيْهِمْ وَلَا | 2:38 | bir korku | benim hidayetime artık yoktur bir korku onlara ve olmazlar |  |  |  |  |  |  |  |  | l_xawof_3af862 |
| زَيَّنَ | zayyana | زين | زُيِّنَ لِلَّذِينَ كَفَرُوا۟ | 2:212 | süslü gösterildi | süslü gösterildi kimselere inkar edenlere |  |  |  |  |  |  |  |  | l_zay_ana_5368d6 |
| آدَم | âdam |  | وَعَلَّمَ ءَادَمَ ٱلْأَسْمَآءَ كُلَّهَا | 2:31 | Adem'e | ve öğretti Adem'e isimleri bütün |  |  |  |  |  |  |  |  | l_A_dam_143ced |
| بَأْس | bas | باس | وَٱلضَّرَّآءِ وَحِينَ ٱلْبَأْسِ أُو۟لَـٰٓئِكَ ٱلَّذِينَ | 2:177 | savaş | ve hastalıkta ve zamanında savaş işte onlar kimselerdir |  |  |  |  |  |  |  |  | l_ba_os_3e2b64 |
| بَعِيد | baʿîd | بعد | لَفِى شِقَاقٍۭ بَعِيدٍ | 2:176 | derin bir | içindedirler anlaşmazlık derin bir |  |  |  |  |  |  |  |  | l_baEiyd_8bccdd |
| بَغَىٰ | bagâ | بغي | دِينِ ٱللَّهِ يَبْغُونَ وَلَهُۥٓ أَسْلَمَ | 3:83 | arıyorlar | dininden Allah'ın arıyorlar oysa O'na teslim olmuştur |  |  |  |  |  |  |  |  | l_bagaY_4c4004 |
| عِيسَى | ʿîsî |  | بِٱلرُّسُلِ وَءَاتَيْنَا عِيسَى ٱبْنَ مَرْيَمَ | 2:87 | Îsa'ya | peygamberler ve verdik Îsa'ya oğlu Meryem |  |  |  |  |  |  |  |  | l_EiysaY_1af04a |
| جَٰدَلُ | câdalu | جدل | وَلَا تُجَـٰدِلْ عَنِ ٱلَّذِينَ | 4:107 | argue | savunma argue kimseleri those who |  |  |  |  |  |  |  |  | l_ja_dalu_728397 |
| جُنَاح | cunâh | جنح | ٱعْتَمَرَ فَلَا جُنَاحَ عَلَيْهِ أَن | 2:158 | hiçbir günah | ömre yaparsa yoktur hiçbir günah kendisine tavaf etmesinde |  |  |  |  |  |  |  |  | l_junaAH_86068c |
| لِسَان | lisân | لسن | لَفَرِيقًا يَلْوُۥنَ أَلْسِنَتَهُم بِٱلْكِتَـٰبِ لِتَحْسَبُوهُ | 3:78 | dillerini | bir grup (var ki) eğip bükerler dillerini Kitapla siz sanasınız diye |  |  |  |  |  |  |  |  | l_lisaAn_5d42eb |
| مِّيثَٰق | mîsâk | وثق | مِنۢ بَعْدِ مِيثَـٰقِهِۦ وَيَقْطَعُونَ مَآ | 2:27 | söz verip bağlandıktan | sonradan after söz verip bağlandıktan ve keserler şeyi |  |  |  |  |  |  |  |  | l_m_iyva_q_ac1e15 |
| قَدَرَ | kadara | قدر | صَلْدًا لَّا يَقْدِرُونَ عَلَىٰ شَىْءٍ | 2:264 | they have control | sert bir taş halinde (Böyleleri) elde edemezler they have control hiçbir şey |  |  |  |  |  |  |  |  | l_qadara_a5b3da |
| خَلَا | halâ | خلو | ءَامَنَّا وَإِذَا خَلَوْا۟ إِلَىٰ شَيَـٰطِينِهِمْ | 2:14 | yalnız kaldıkları | inandık ve zaman yalnız kaldıkları ile şeytanları |  |  |  |  |  |  |  |  | l_xalaA_13082a |
| يَشْعُرُ | yaşʿuru | شعر | أَنفُسَهُمْ وَمَا يَشْعُرُونَ | 2:9 | farkında | kendilerinden değiller farkında |  |  |  |  |  |  |  |  | l_ya_oEuru_05ae7b |
| أُنثَىٰ | unsâ | انث | وَٱلْعَبْدُ بِٱلْعَبْدِ وَٱلْأُنثَىٰ بِٱلْأُنثَىٰ فَمَنْ | 2:178 | kadın | köle köle ile kadın kadın ile kimse |  |  |  |  |  |  |  |  | l_unvaY_bfb590 |
| عَاد2 | ʿâd | عود | وَإِلَىٰ عَادٍ أَخَاهُمْ هُودًا | 7:65 | Ad(kavmin)e de | ve (gönderdik) Ad(kavmin)e de kardeşleri Hud'u |  |  |  |  |  |  |  |  | l_EaAd2_f73727 |
| غَنِىّ | ganîî | غني | أَذًى وَٱللَّهُ غَنِىٌّ حَلِيمٌ | 2:263 | zengindir | eziyet Allah zengindir halimdir |  |  |  |  |  |  |  |  | l_ganiY_463a95 |
| حَيّ | hayy | حيي | أَمْوَٰتٌۢ بَلْ أَحْيَآءٌ وَلَـٰكِن لَّا | 2:154 | onlar diridirler | ölüdürler bilakis onlar diridirler ama olmazsınız |  |  |  |  |  |  |  |  | l_Hay_3dc2a8 |
| كَادَ | kâda | كود | يَكَادُ ٱلْبَرْقُ يَخْطَفُ | 2:20 | neredeyse | neredeyse şimşek kapıverecek |  |  |  |  |  |  |  |  | l_kaAda_69a3ae |
| لِقَآء | likâ | لقي | ٱلَّذِينَ كَذَّبُوا۟ بِلِقَآءِ ٱللَّهِ حَتَّىٰٓ | 6:31 | huzuruna çıkmayı | kimseler yalanlayan(lar) huzuruna çıkmayı Allah'ın nihayet |  |  |  |  |  |  |  |  | l_liqaA_390528 |
| طَآئِفَة | tâifae | طوف | وَدَّت طَّآئِفَةٌ مِّنْ أَهْلِ | 3:69 | bir grup | istedi ki bir grup ehlinden (the) People |  |  |  |  |  |  |  |  | l_TaA_ifap_740947 |
| طَعَام | taʿâm | طعم | نَّصْبِرَ عَلَىٰ طَعَامٍ وَٰحِدٍ فَٱدْعُ | 2:61 | food | biz  dayanamayız yemeğe food bir du'a et |  |  |  |  |  |  |  |  | l_TaEaAm_f85a5a |
| تَوَفَّىٰ | tavaffâ | وفي | وَٱلَّذِينَ يُتَوَفَّوْنَ مِنكُمْ وَيَذَرُونَ | 2:234 | ölen(ler) | kimselerin ölen(ler) içinizden geriye bıraktıkları |  |  |  |  |  |  |  |  | l_tawaf_aY_1ebd4b |
| وَكِيل | vakîl | وكل | ٱللَّهُ وَنِعْمَ ٱلْوَكِيلُ | 3:173 | vekildir | Allah ve ne güzel vekildir |  |  |  |  |  |  |  |  | l_wakiyl_a481db |
| وَرَآء | varâ | وري | وَيَكْفُرُونَ بِمَا وَرَآءَهُۥ وَهُوَ ٱلْحَقُّ | 2:91 | ondan sonra gelen | ve inkar ederler şeyi ondan sonra gelen halbuki o haktır |  |  |  |  |  |  |  |  | l_waraA_905c82 |
| ذَا | zâ |  | مَّن ذَا ٱلَّذِى يُقْرِضُ | 2:245 | o kimse | kimdir o kimse who borç olarak verecek |  |  |  |  |  |  |  |  | l_aA_baa50b |
| ذِكْرَىٰ | zikrâ | ذكر | تَقْعُدْ بَعْدَ ٱلذِّكْرَىٰ مَعَ ٱلْقَوْمِ | 6:68 | hatırladıktan | sit sonra hatırladıktan beraber topluluğuyla |  |  |  |  |  |  |  |  | l_ikoraY_20da2f |
| إِمَّا | immâ |  | مِنْهَا جَمِيعًا فَإِمَّا يَأْتِيَنَّكُم مِّنِّى | 2:38 | zaman | oradan hepiniz zaman size  geldiği benden |  |  |  |  |  |  |  |  | l_im_aA_986f60 |
| أَذِنَ | azina | اذن | لَّمْ تَفْعَلُوا۟ فَأْذَنُوا۟ بِحَرْبٍ مِّنَ | 2:279 | bilin | böyle yapmazsanız you do bilin savaşa açıldığını (tarafından) |  |  |  |  |  |  |  |  | l_a_ina_39e033 |
| أَنجَىٰ | ancâ | نجو | بِكُمُ ٱلْبَحْرَ فَأَنجَيْنَـٰكُمْ وَأَغْرَقْنَآ ءَالَ | 2:50 | sizi kurtarmış | sizin için denizi sizi kurtarmış ve boğmuştuk ailesini |  |  |  |  |  |  |  |  | l_anjaY_cbb481 |
| شَهَٰدَة | şahâdae | شهد | مِمَّن كَتَمَ شَهَـٰدَةً عِندَهُۥ مِنَ | 2:140 | şahitliği | kimseden gizleyen şahitliği yanında bulunan tarafından |  |  |  |  |  |  |  |  | l_aha_dap_12afc0 |
| بَدَّلَ | baddala | بدل | فَبَدَّلَ ٱلَّذِينَ ظَلَمُوا۟ | 2:59 | fakat değiştirdiler | fakat değiştirdiler onlar ki zalimler |  |  |  |  |  |  |  |  | l_bad_ala_16265e |
| فَتَنُ | fatanu | فتن | خِفْتُمْ أَن يَفْتِنَكُمُ ٱلَّذِينَ كَفَرُوٓا۟ | 4:101 | (may) harm you | korkarsanız size bir kötülük yapmalarından (may) harm you kimselerin inkar eden(lerin) |  |  |  |  |  |  |  |  | l_fatanu_2455b0 |
| فُلْك | fulk | فلك | ٱلَّيْلِ وَٱلنَّهَارِ وَٱلْفُلْكِ ٱلَّتِى تَجْرِى | 2:164 | ve gemilerde | gece ve gündüzün ve gemilerde taşıyıp giden sail |  |  |  |  |  |  |  |  | l_fulok_807067 |
| لَعَنَ | laʿana | لعن | غُلْفٌۢ بَل لَّعَنَهُمُ ٱللَّهُ بِكُفْرِهِمْ | 2:88 | onları la'netlemiştir | perdelidir bilakis onları la'netlemiştir Allah inkarlarından dolayı |  |  |  |  |  |  |  |  | l_laEana_bf347d |
| مِسْكِين | miskîn | سكن | ٱلْقُرْبَىٰ وَٱلْيَتَـٰمَىٰ وَٱلْمَسَـٰكِينِ وَقُولُوا۟ لِلنَّاسِ | 2:83 | ve yoksullara | yakınlara ve yetimlere ve yoksullara ve söyleyin insanlara |  |  |  |  |  |  |  |  | l_misokiyn_63a03c |
| قَرْن | karn | قرن | قَبْلِهِم مِّن قَرْنٍ مَّكَّنَّـٰهُمْ فِى | 6:6 | generations | before them nesillerden generations onlara imkanlar vermiştik yeryüzünde |  |  |  |  |  |  |  |  | l_qaron_c7a8aa |
| سَاجِد | sâcid | سجد | وَٱدْخُلُوا۟ ٱلْبَابَ سُجَّدًا وَقُولُوا۟ حِطَّةٌ | 2:58 | secde ederek | girin kapıdan secde ederek ve deyin hitta (ya Rabbi bizi affet) |  |  |  |  |  |  |  |  | l_saAjid_62ac5a |
| سَبْع | sabʿ | سبع | ٱلسَّمَآءِ فَسَوَّىٰهُنَّ سَبْعَ سَمَـٰوَٰتٍ وَهُوَ | 2:29 | yedi | the heaven onları düzenledi yedi gök (olarak) ve O |  |  |  |  |  |  |  |  | l_saboE_6a6f8c |
| يَتِيم | yatîm | يتم | وَذِى ٱلْقُرْبَىٰ وَٱلْيَتَـٰمَىٰ وَٱلْمَسَـٰكِينِ وَقُولُوا۟ | 2:83 | ve yetimlere | ve yakınlara ve yetimlere ve yoksullara ve söyleyin |  |  |  |  |  |  |  |  | l_yatiym_4a612b |
| ظُلُمَٰت | zulumât | ظلم | وَتَرَكَهُمْ فِى ظُلُمَـٰتٍ لَّا يُبْصِرُونَ | 2:17 | karanlıklar | ve onları bıraktı içinde karanlıklar değildir görenlerden |  |  |  |  |  |  |  |  | l_Zuluma_t_933b08 |
| أَذَاقَ | azâka | ذوق | يَلْبِسَكُمْ شِيَعًا وَيُذِيقَ بَعْضَكُم بَأْسَ | 6:65 | ve taddırmağa | sizi birbirinize düşürüp parti parti ve taddırmağa kiminize hıncını |  |  |  |  |  |  |  |  | l_a_aAqa_3f3c06 |
| أَسْلَمَ | aslama | سلم | بَلَىٰ مَنْ أَسْلَمَ وَجْهَهُۥ لِلَّهِ | 2:112 | teslim ederse | hayır kim teslim ederse yüzünü Allah'a |  |  |  |  |  |  |  |  | l_asolama_25091d |
| بَلَىٰ | balâ |  | بَلَىٰ مَن كَسَبَ | 2:81 | evet | evet kim kazanır |  |  |  |  |  |  |  |  | l_balaY_04cddb |
| بَرّ | barr | برر | وَتَوَفَّنَا مَعَ ٱلْأَبْرَارِ | 3:193 | iyilerle | ve canımızı al beraber iyilerle |  |  |  |  |  |  |  |  | l_bar_4aea03 |
| دُعَآء | duʿâ | دعو | يَسْمَعُ إِلَّا دُعَآءً وَنِدَآءً صُمٌّۢ | 2:171 | çağırmadan | (does) hear başka çağırmadan ve bağırtıdan sağırdırlar |  |  |  |  |  |  |  |  | l_duEaA_bcbfae |
| جَمَعَ | camaʿa | جمع | فَكَيْفَ إِذَا جَمَعْنَـٰهُمْ لِيَوْمٍ لَّا | 3:25 | topladığımız | peki nasıl (olacak)? zaman topladığımız bir gün için hiç şüphe olmayan |  |  |  |  |  |  |  |  | l_jamaEa_62dac9 |
| جِنّ | cinn | جنن | لِلَّهِ شُرَكَآءَ ٱلْجِنَّ وَخَلَقَهُمْ وَخَرَقُوا۟ | 6:100 | cinleri | Allah'a ortak cinleri halbuki onları O yaratmıştır ve icadettiler |  |  |  |  |  |  |  |  | l_jin_7f7c85 |
| مُّؤْمِنَٰت | muminât | امن | يَنكِحَ ٱلْمُحْصَنَـٰتِ ٱلْمُؤْمِنَـٰتِ فَمِن مَّا | 4:25 | inanmış | marry hür kadınlarla inanmış sahip olduğunuz what |  |  |  |  |  |  |  |  | l_m_u_omina_t_b9c5a2 |
| مَأْوَىٰ | mavâ | اوي | بِهِۦ سُلْطَـٰنًا وَمَأْوَىٰهُمُ ٱلنَّارُ وَبِئْسَ | 3:151 | ve gidecekleri yer de | kendilerine hiçbir güç ve gidecekleri yer de cehennemdir ne kötüdür |  |  |  |  |  |  |  |  | l_ma_owaY_b4a4a7 |
| مَكَرَ | makara | مكر | وَمَكَرُوا۟ وَمَكَرَ ٱللَّهُ | 3:54 | ve tuzak kurdular | ve tuzak kurdular ve tuzak kurdu Allah da |  |  |  |  |  |  |  |  | l_makara_540389 |
| نَصْر | nasr | نصر | مَعَهُۥ مَتَىٰ نَصْرُ ٱللَّهِ أَلَآ | 2:214 | yardımı | onunla birlikte ne zaman yardımı Allah'ın İyi bilin ki |  |  |  |  |  |  |  |  | l_naSor_e325f5 |
| رَفَعَ | rafaʿa | رفع | أَخَذْنَا مِيثَـٰقَكُمْ وَرَفَعْنَا فَوْقَكُمُ ٱلطُّورَ | 2:63 | ve kaldırmıştık | almıştık sizin sözünüzü ve kaldırmıştık üzerinize dağı |  |  |  |  |  |  |  |  | l_rafaEa_7f376e |
| سَٰحِر | sâhir | سحر | إِنَّ هَـٰذَا لَسَـٰحِرٌ عَلِيمٌ | 7:109 | bir büyücüdür | muhakkak bu bir büyücüdür çok bilgili |  |  |  |  |  |  |  |  | l_sa_Hir_f05100 |
| سَمْع | samʿ | سمع | قُلُوبِهِمْ وَعَلَىٰ سَمْعِهِمْ وَعَلَىٰٓ أَبْصَـٰرِهِمْ | 2:7 | kulaklarının | kalblerinin ve üzerini kulaklarının ve üzerine gözlerinin |  |  |  |  |  |  |  |  | l_samoE_5d4faf |
| سَخَّرَ | sahhara | سخر | عَلَى ٱلْعَرْشِ وَسَخَّرَ ٱلشَّمْسَ وَٱلْقَمَرَ | 13:2 | ve boyun eğdirdi | üzerine Arş ve boyun eğdirdi güneşi ve ay'ı |  |  |  |  |  |  |  |  | l_sax_ara_9612f4 |
| سَيِّئَة | sayyiae | سوا | مَن كَسَبَ سَيِّئَةً وَأَحَـٰطَتْ بِهِۦ | 2:81 | bir günah | kim kazanır bir günah ve kuşatmış olursa kendisini |  |  |  |  |  |  |  |  | l_say_i_ap_5198f7 |
| وَهَبَ | vahaba | وهب | إِذْ هَدَيْتَنَا وَهَبْ لَنَا مِن | 3:8 | ve ver | bizi doğru yola ilettikten You (have) guided us ve ver bize katından |  |  |  |  |  |  |  |  | l_wahaba_f39bde |
| خَلْف | half | خلف | يَدَيْهَا وَمَا خَلْفَهَا وَمَوْعِظَةً لِّلْمُتَّقِينَ | 2:66 | ardından gelen | onların iki eli ve şey (için) ardından gelen ve bir öğüt müttakiler için |  |  |  |  |  |  |  |  | l_xalof_4a2374 |
| يَرْجُوا۟ | yarcûâ | رجو | ٱللَّهِ أُو۟لَـٰٓئِكَ يَرْجُونَ رَحْمَتَ ٱللَّهِ | 2:218 | umarlar | Allah işte onlar umarlar rahmetini Allah'ın |  |  |  |  |  |  |  |  | l_yarojuwA_199bfc |
| ٱشْتَرَىٰ | aştarâ | شري | أُو۟لَـٰٓئِكَ ٱلَّذِينَ ٱشْتَرَوُا۟ ٱلضَّلَـٰلَةَ بِٱلْهُدَىٰ | 2:16 | bought | işte onlar satın aldılar bought sapıklığı hidayet karşılığında |  |  |  |  |  |  |  |  | l_otaraY_52a098 |
| ٱسْتُهْزِئَ | astuhzia | هزا | ٱللَّهُ يَسْتَهْزِئُ بِهِمْ وَيَمُدُّهُمْ | 2:15 | alay eder | Allah alay eder kendileriyle ve onları bırakır |  |  |  |  |  |  |  |  | l_sotuhozi_a_a56746 |
| أَعْمَىٰ | aʿmâ | عمي | صُمٌّۢ بُكْمٌ عُمْىٌ فَهُمْ لَا | 2:18 | kördürler | sağırdırlar dilsizdirler kördürler onlar değildir |  |  |  |  |  |  |  |  | l_aEomaY_ea9134 |
| أَحْسَنَ | ahsana | حسن | إِلَى ٱلتَّهْلُكَةِ وَأَحْسِنُوٓا۟ إِنَّ ٱللَّهَ | 2:195 | ve iyilik edin | tehlikeye [the] destruction ve iyilik edin doğrusu Allah |  |  |  |  |  |  |  |  | l_aHosana_1ac221 |
| أَمَاتَ | amâta | موت | فَأَحْيَـٰكُمْ ثُمَّ يُمِيتُكُمْ ثُمَّ يُحْيِيكُمْ | 2:28 | öldürecek | O sizi diriltti sonra öldürecek sonra diriltecek |  |  |  |  |  |  |  |  | l_amaAta_5bf411 |
| شَاهِد | şâhid | شهد | فَٱكْتُبْنَا مَعَ ٱلشَّـٰهِدِينَ | 3:53 | şahidlerle | bizi yaz beraber şahidlerle |  |  |  |  |  |  |  |  | l_aAhid_a005f4 |
| شَهْر | şahr | شهر | شَهْرُ رَمَضَانَ ٱلَّذِىٓ | 2:185 | ayı | ayı ramazan ki |  |  |  |  |  |  |  |  | l_ahor_1c433f |
| حَسَن | hasan | حسن | ٱللَّهَ قَرْضًا حَسَنًا فَيُضَـٰعِفَهُۥ لَهُۥٓ | 2:245 | güzel | Allah'a bir borcu güzel arttırması karşılığnda ona |  |  |  |  |  |  |  |  | l_Hasan_003925 |
| كَم | kam |  | بَنِىٓ إِسْرَٰٓءِيلَ كَمْ ءَاتَيْنَـٰهُم مِّنْ | 2:211 | nice | oğullarına İsrail nice onlara verdik ayetlerden |  |  |  |  |  |  |  |  | l_kam_0f9dfb |
| كَتَمَ | katama | كتم | وَمَا كُنتُمْ تَكْتُمُونَ | 2:33 | gizlemekte | ve şeyleri olduğunuz gizlemekte |  |  |  |  |  |  |  |  | l_katama_166c72 |
| مَّشَ | maşa | مشي | أَضَآءَ لَهُم مَّشَوْا۟ فِيهِ وَإِذَآ | 2:20 | yürürler | aydınlattığı onları yürürler o(nun ışığı)nda zaman |  |  |  |  |  |  |  |  | l_m_a_a_fb0e46 |
| مُّكَذِّبِين | mukazzibîn | كذب | كَانَ عَـٰقِبَةُ ٱلْمُكَذِّبِينَ | 3:137 | yalanlayıcıların | olduğunu sonunun yalanlayıcıların |  |  |  |  |  |  |  |  | l_m_uka_ibiyn_f66cdd |
| مُّسَمًّى | musammenî | سمو | إِلَىٰٓ أَجَلٍ مُّسَمًّى فَٱكْتُبُوهُ وَلْيَكْتُب | 2:282 | belirli bir | kadar süreye belirli bir onu yazın ve yazsın |  |  |  |  |  |  |  |  | l_m_usam_FY_24926e |
| مُفْسِد | mufsid | فسد | إِنَّهُمْ هُمُ ٱلْمُفْسِدُونَ وَلَـٰكِن لَّا | 2:12 | bozgunculardır | muhakkak onlar bozgunculardır fakat değildir |  |  |  |  |  |  |  |  | l_mufosid_901e3a |
| نَصِيب | nasîb | نصب | أُو۟لَـٰٓئِكَ لَهُمْ نَصِيبٌ مِّمَّا كَسَبُوا۟ | 2:202 | bir pay | işte onlara vardır bir pay kazandıklarından they earned |  |  |  |  |  |  |  |  | l_naSiyb_a556ca |
| رُوح | rûh | روح | ٱلْبَيِّنَـٰتِ وَأَيَّدْنَـٰهُ بِرُوحِ ٱلْقُدُسِ أَفَكُلَّمَا | 2:87 | Ruh ile (Ruh'ül-Kudüs) | açık deliller ve onu  destekledik Ruh ile (Ruh'ül-Kudüs) Kudüs (Ruh'ül-Kudüs) öyle mi? |  |  |  |  |  |  |  |  | l_ruwH_1d9882 |
| طَيِّبَٰت | tayyibât | طيب | كُلُوا۟ مِن طَيِّبَـٰتِ مَا رَزَقْنَـٰكُمْ | 2:57 | (the) good things | yeyin güzelliklerden (the) good things şeyleri rızık olarak verdiğimiz |  |  |  |  |  |  |  |  | l_Tay_iba_t_e6ca86 |
| وَضَعَ | vadaʿa | وضع | فَلَمَّا وَضَعَتْهَا قَالَتْ رَبِّ | 3:36 | onu doğurunca | ne zaman ki onu doğurunca şöyle söyledi Rabbim |  |  |  |  |  |  |  |  | l_waDaEa_057a2f |
| ظَنّ | zann | ظنن | غَيْرَ ٱلْحَقِّ ظَنَّ ٱلْجَـٰهِلِيَّةِ يَقُولُونَ | 3:154 | zannı (gibi) | haksız the truth  zannı (gibi) cahiliyye diyorlardı |  |  |  |  |  |  |  |  | l_Zan_1e2f1f |
| أَعَدَّ | aʿadda | عدد | ٱلنَّاسُ وَٱلْحِجَارَةُ أُعِدَّتْ لِلْكَـٰفِرِينَ | 2:24 | hazırlanmış | insanlar ve taşlardır hazırlanmış inkarcılar için |  |  |  |  |  |  |  |  | l_aEad_a_17540a |
| أَحَلَّ | ahalla | حلل | أُحِلَّ لَكُمْ لَيْلَةَ | 2:187 | helal kılındı | helal kılındı size gecesi |  |  |  |  |  |  |  |  | l_aHal_a_bf74a4 |
| أَمِنَ | amina | امن | نُسُكٍ فَإِذَآ أَمِنتُمْ فَمَن تَمَتَّعَ | 2:196 | güvene kavuştuğunuz | kurbandan zaman güvene kavuştuğunuz kimse faydalanmak isteyen |  |  |  |  |  |  |  |  | l_amina_0a79a6 |
| أَنشَأَ | anşaa | نشا | فَأَهْلَكْنَـٰهُم بِذُنُوبِهِمْ وَأَنشَأْنَا مِنۢ بَعْدِهِمْ | 6:6 | ve yarattık | fakat onları helak ettik günahlarından ötürü ve yarattık onların ardından after them |  |  |  |  |  |  |  |  | l_an_a_a_a1dde3 |
| أَقْسَمُ | aksamu | قسم | أَهَـٰٓؤُلَآءِ ٱلَّذِينَ أَقْسَمُوا۟ بِٱللَّهِ جَهْدَ | 5:53 | yemin edenler | bunlar mı o kimseler yemin edenler Allah'a güçlü |  |  |  |  |  |  |  |  | l_aqosamu_a01a25 |
| بَلَوْ | balav | بلو | وَلَنَبْلُوَنَّكُم بِشَىْءٍ مِّنَ | 2:155 | andolsun sizi imtihan edeceğiz | andolsun sizi imtihan edeceğiz şeylerle (gibi) |  |  |  |  |  |  |  |  | l_balawo_60a2d6 |
| عَرَفَ | ʿarafa | عرف | جَآءَهُم مَّا عَرَفُوا۟ كَفَرُوا۟ بِهِۦ | 2:89 | o bildikleri (Kur'an) | kendilerine gelince şey o bildikleri (Kur'an) inkar ettiler onu |  |  |  |  |  |  |  |  | l_Earafa_a51610 |
| عِقَاب | ʿikâb | عقب | ٱللَّهَ شَدِيدُ ٱلْعِقَابِ | 2:196 | cezası | Allah'ın şiddetlidir cezası |  |  |  |  |  |  |  |  | l_EiqaAb_736634 |
| هَٰرُون | hârûn |  | مُوسَىٰ وَءَالُ هَـٰرُونَ تَحْمِلُهُ ٱلْمَلَـٰٓئِكَةُ | 2:248 | Harun | Musa ve ailesinin Harun taşıdığı meleklerin |  |  |  |  |  |  |  |  | l_ha_ruwn_3d8730 |
| حَمِيم | hamîm | حمم | شَرَابٌ مِّنْ حَمِيمٍ وَعَذَابٌ أَلِيمٌۢ | 6:70 | boiling water | bir içki kaynar sudan boiling water ve bir azab acıklı |  |  |  |  |  |  |  |  | l_Hamiym_3e44f9 |
| حَقَّ | hakka | حقق | هَدَىٰ وَفَرِيقًا حَقَّ عَلَيْهِمُ ٱلضَّلَـٰلَةُ | 7:30 | hak oldu | doğru yola iletti ve bir topluluğa da hak oldu üzerlerine sapıklık |  |  |  |  |  |  |  |  | l_Haq_a_a024e5 |
| حِكْمَة | hikmae | حكم | وَيُعَلِّمُهُمُ ٱلْكِتَـٰبَ وَٱلْحِكْمَةَ وَيُزَكِّيهِمْ إِنَّكَ | 2:129 | ve hikmeti | ve onlara öğretecek Kitabı ve hikmeti ve onları temizleyecek şüphesiz sensin |  |  |  |  |  |  |  |  | l_Hikomap_d90667 |
| حِزْب | hizb | حزب | ءَامَنُوا۟ فَإِنَّ حِزْبَ ٱللَّهِ هُمُ | 5:56 | taraftarlarıdır | mü'minleri yalnız taraftarlarıdır Allah'ın onlardır |  |  |  |  |  |  |  |  | l_Hizob_666efe |
| كَلَّمَ | kallama | كلم | يَعْلَمُونَ لَوْلَا يُكَلِّمُنَا ٱللَّهُ أَوْ | 2:118 | bizimle konuşmalı | know değil miydi? bizimle konuşmalı Allah ya da |  |  |  |  |  |  |  |  | l_kal_ama_04b12e |
