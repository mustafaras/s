# Namaz metni ↔ lemma eşlemesi (L2 inceleme)

> Araç çıktısıdır (`tools/kao2-curriculum-build.mjs`, K2F-24); elle düzenlemeyin. Arapça içermez; kelimeler kimlik + okunuşla anılır.
> Kural: harekesiz iskelet + yaygın önek/zamir eki ayıklanmış TAM eşitlik; tek aday → eşleme, birden çok aday ya da aday yok → eşleme YOK (tahmin yok).
> Bu liste yapay zekâ değil, gerçek alan uzmanının (L2) bakması içindir: eşlenmeyen kelimeler uygulamada "açık" görünür, hiçbir lemmaya bağlanmaz.

## Eşleşmeyen kelimeler (14)

| Namaz kelimesi | Okunuş | Anlam | Metinler | Neden | Adaylar |
|---|---|---|---|---|---|
| lp_1673d5aec4 | va-taʿâlâ | yücedir | subhaneke | aday yok | — |
| lp_436fccf6c0 | al-tahiyyâtu | hürmetler | tahiyyat | aday yok | — |
| lp_692bba530a | li-lahi | Allah içindir | tahiyyat | aday yok | — |
| lp_6e8c2964fc | va-al-salavâtu | dualar | tahiyyat | aday yok | — |
| lp_79cb46c8fc | al-sâlihîna | salihlerin | tahiyyat | aday yok | — |
| lp_98e5be5669 | ʿibâdi | kullarının | tahiyyat | aday yok | — |
| lp_b1bf6df603 | va-tabâraka | bereketlidir | subhaneke | aday yok | — |
| lp_c7d096cadc | ʿabduhu | kuludur | tahiyyat | birden çok aday | l_Eabada_557021, l_Eabod_3558c0 |
| lp_ccce7cf12f | al-aʿlâ | en yüce | secde | aday yok | — |
| lp_d9d03c781d | va-aşhadu | ve şahitlik ederim | tahiyyat | aday yok | — |
| lp_db3e429022 | aşhadu | şahitlik ederim | tahiyyat | aday yok | — |
| lp_f0473a3990 | allahumma | Allahım | subhaneke | aday yok | — |
| lp_f5843446b4 | cadduka | şanın | subhaneke | aday yok | — |
| lp_f70c1a5dcf | muhammaden | Muhammed | tahiyyat | aday yok | — |

## Eşlenen kelimeler (18)

- lp_060fad1342 (va-bi-hamdika · hamdinle) → l_Hamod_98138a · subhaneke
- lp_10bcd8764a (ismuka · adın) → l_som_585f33 · subhaneke
- lp_25704375a0 (ʿalayka · senin üzerine) → l_EalaY_f79ef3 · tahiyyat
- lp_31fee142df (ʿalaynâ · bizim üzerimize) → l_EalaY_f79ef3 · tahiyyat
- lp_5cfe478ddb (subhânaka · seni tenzih ederim) → l_suboHa_n_59533b · subhaneke
- lp_67dad87faf (ʿalaykum · üzerinize) → l_EalaY_f79ef3 · selam
- lp_6cc3dd4445 (va-rahmetu · rahmeti) → l_raHomap_490a24 · tahiyyat, selam
- lp_779a7fd410 (va-al-tayyibâtu · güzel sözler) → l_Tay_iba_t_e6ca86 · tahiyyat
- lp_7ae90ff4c5 (rabbiya · Rabbimi) → l_rab_fc2490 · ruku, secde
- lp_7cb56720c0 (al-salâmu · selam) → l_sala_m_daff0b · tahiyyat, selam
- lp_820672c615 (subhâna · tenzih ederim) → l_suboHa_n_59533b · ruku, secde
- lp_832ee02139 (va-barakâtuhu · bereketleri) → l_baraka_t_188a75 · tahiyyat
- lp_99236de03d (va-ʿalâ · ve üzerine) → l_EalaY_f79ef3 · tahiyyat
- lp_999a97b04a (va-lâ · ve yoktur) → l_laA_4e2bfd · subhaneke
- lp_99f327d450 (al-nabiyyu · peygamber) → l_n_abiY_e09f3b · tahiyyat
- lp_cd25a85435 (va-rasûluhu · elçisidir) → l_rasuwl_9a5606 · tahiyyat
- lp_e3ae18f2ca (gayruka · senden başka) → l_gayor_6b16f9 · subhaneke
- lp_e5958c3b77 (al-ʿazîmi · yüce) → l_EaZiym_93f908 · ruku
