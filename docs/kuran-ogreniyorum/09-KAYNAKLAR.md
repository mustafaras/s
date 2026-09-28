# 09 — Kaynaklar

Erişim tarihi 20 Eylül 2026. "Kullanım" sütunu bu plandaki rolünü söyler.

## Korpus ve veri

| Kaynak | Kullanım |
|---|---|
| [Quranic Arabic Corpus — ana sayfa](https://corpus.quran.com/) · [Data download (v0.4, GNU)](https://corpus.quran.com/download/) · [Lemmas by frequency (3.680 lemma)](https://corpus.quran.com/lemmas.jsp) · [Wikipedia özeti](https://en.wikipedia.org/wiki/Quranic_Arabic_Corpus) | Sıklık, kök, lemma, POS türetme; ilk 25 lemma tablosu |
| [mustafa0x/quran-morphology (GitHub)](https://github.com/mustafa0x/quran-morphology) | QAC verisinin alternatif dağıtımı (lisansı QAC'ye tabi) |
| [Tanzil — Download Quran Text](https://tanzil.net/download/) · [Tanzil Translations](https://tanzil.net/trans/) · [Quranic fonts](https://tanzil.net/docs/quranic_fonts) | Harekeli metin (CC BY 3.0, verbatim), meal referansı, font notları |
| [QUL — Quranic Universal Library](https://qul.tarteel.ai/) · [Translations (TR wbw #99, Diyanet #148, Elmalılı #233)](https://qul.tarteel.ai/resources/translation) · [FAQ (lisans: kaynağa göre)](https://qul.tarteel.ai/faq) · [GitHub](https://github.com/TarteelAI/quranic-universal-library) | Türkçe kelime-kelime referansı; morfoloji sqlite alternatifi |
| [risan/quran-json](https://github.com/risan/quran-json) · [gaitco/quran-database](https://github.com/gaitco/quran-database) | JSON dağıtım örnekleri (kullanılmadı; lisans zinciri Tanzil) |
| [Quran Morphology (quranmorphology.com)](https://quranmorphology.com/) | Kök/lemma çapraz kontrol |

## Sıklık ve Türkçe avantajı

| Kaynak | Kullanım |
|---|---|
| [ilimtalibi — Kur'an-ı Kerim'de En Sık Geçen 500 Kelime (dilimizde olmayan 275)](https://www.ilimtalibi.com/FileUpload/ks438996/File/kuran_500_kelime_v3_p.pdf) | %82,6 kapsam; 225 kognat / net 275; konu ve fiil türü gruplaması; kaynakçası (Ebu'l-Futûh sıklık listesi, Timaş Kur'an Lügatı) |
| [Understand Quran Academy — Kolay Yolla Kur'an'ı Anlama (TR PDF, 2013)](https://download.understandquran.com/fileadmin/user_upload/courses/short/turkish/UQ-Merged_REVISED_Oct_2013_Tr_Only_Quran.pdf) · [80% words part 1 (EN)](https://download.understandquran.com/fileadmin/user_upload/vocabulary/words/eng_part_1.pdf) | Namaz metni çapası, 125 kelime ≈ %50, TFE yöntemi, ders sırası (Fâtiha → Nasr → Felak → Nâs → Kâfirûn → rükû/secde → salavat → dua), kelime başına sıklık |
| [Quran Progress — 125 words](https://www.quranprogress.com/en/blog/125-words-to-understand-the-quran/) · [How many words in the Quran](https://www.quranprogress.com/en/blog/how-many-words-in-the-quran/) | 125/250/500 eşikleri, 14.870 benzersiz form |
| [Kalimah — 100 most common Quranic words](https://kalimah-center.com/quranic-arabic-words/) · [Quranic Arabic grammar: 10 rules](https://kalimah-center.com/quranic-arabic-grammar/) | Gramer öncelik listesi çapraz kontrolü |
| [Kalamullah — 80% of Quranic words](https://www.kalamullah.com/80-percent-of-quranic-words.html) · [85% of Qur'anic words (duas.org)](https://www.duas.org/downloads/85Quranwords.pdf) | Alternatif listeler |
| [Gerçek Edebiyat — TDK sözlükte kökene göre sayılar](https://www.gercekedebiyat.com/haber/1573-2267.html) · [Doğru Veri](https://dogruveri.com/turkcede-hangi-dilden-kac-kelime-var/) · [Dursunoğlu — Türkiye Türkçesindeki Arapça sözcükler ve ses olayları (AYK)](https://www.ayk.gov.tr/wp-content/uploads/2015/01/DURSUNO%C4%9ELU-Halit-T%C3%9CRK%C4%B0YE-T%C3%9CRK%C3%87ES%C4%B0%E2%80%99NDEK%C4%B0-ARAP%C3%87A-S%C3%96ZC%C3%9CKLER-VE-BU-S%C3%96ZC%C3%9CKLERDEK%C4%B0-SES-OLAYLARI.pdf) | 6.463 Arapça kökenli madde; kognat ses değişimi kuralları (ع/ح düşmesi, uzun ünlü, ة→-et/-e) |

## Öğrenme bilimi

| Kaynak | Kullanım |
|---|---|
| [Open Spaced Repetition — About](https://open-spaced-repetition.github.io/) · [ts-fsrs](https://open-spaced-repetition.github.io/ts-fsrs/) · [fsrs.js](https://github.com/open-spaced-repetition/fsrs.js) · [awesome-fsrs (makaleler)](https://github.com/open-spaced-repetition/awesome-fsrs) · [Anki (FSRS entegrasyonu)](https://en.wikipedia.org/wiki/Anki_(software)) · [SM-2'den FSRS'e](https://www.mindomax.com/spaced-repetition-algorithms) | Zamanlayıcı seçimi ve port referansı |
| [Testing the reminding account of the lag effect in L2 vocabulary (Applied Psycholinguistics)](https://resolve-he.cambridge.org/core/journals/applied-psycholinguistics/article/testing-the-reminding-account-of-the-lag-effect-in-l2-vocabulary-learning/4D03D1F5169B719D90F14BBE474015F5) · [Within-session repeated retrieval (SSLA)](https://resolve.cambridge.org/core/journals/studies-in-second-language-acquisition/article/does-repeated-practice-make-perfect-the-effects-of-withinsession-repeated-retrieval-on-second-language-vocabulary-learning/F14BA8A576CD2563D14CEA46E35D842E) · [Retrieval schedules and collocations (SSLA)](https://resolve-he.cambridge.org/core/journals/studies-in-second-language-acquisition/article/abs/effects-of-retrieval-schedules-on-the-acquisition-of-explicit-automatizedexplicit-and-implicit-knowledge-of-l2-collocations/201FABD72088A7F590598A5973E5B499) · [Spaced practice: fill-in-the-blanks vs flashcards](https://www.academia.edu/120579340/Does_spaced_practice_have_the_same_effects_on_different_second_language_vocabulary_learning_activities_Fill_in_the_blanks_versus_flashcards) · [Repetition & incidental vocabulary meta-analysis (Language Learning 2025)](https://onlinelibrary.wiley.com/doi/10.1111/lang.12697) | Aralık, geri çağırma, tekrar sayısı kanıtları |
| [Root-and-pattern efficacy in Arabic vocabulary acquisition (Veredas)](https://revista.domhelder.edu.br/index.php/veredas/article/view/5622) · [QFI — Learning Arabic Through Its Living Roots](https://www.qfi.org/blog/when-words-connect/) · [Pseudoword & root variation, L2 Arabic (U. Michigan)](https://deepblue.lib.umich.edu/items/ca0b1825-8642-46ea-bf19-d29e79b8e1d0) · [Orthographic effects in L2 Arabic (UMD)](https://drum.lib.umd.edu/bitstreams/952baa22-c0cd-45b8-8412-537018dbc47a/download) · [Morphological knowledge & vocabulary (Hawaii)](https://scholarspace.manoa.hawaii.edu/bitstreams/95d2f6ea-26f2-4481-91de-5e4bc6289349/download) | Kök-kalıp öğretimi kanıtı |
| [Cognate vocabulary & explicit L2 rule learning (Sanahuja & Erdocia 2024)](https://journals.sagepub.com/doi/10.1177/13621688241254617) · [Cognates, false cognates, non-cognates (IJBEB 2017)](https://www.tandfonline.com/doi/full/10.1080/13670050.2017.1325834) · [Cognate facilitation in naming (JECP)](https://www.sciencedirect.com/science/article/abs/pii/S0022096515002118) · [Cognate-based teaching & materials](https://www.sciencedirect.com/science/article/pii/S1877042812012657) · [English-Turkish cognates in BNC-COCA (2025)](https://www.researchgate.net/publication/390322578_Integrating_English-Turkish_Cognates_Information_into_the_BNC-COCA_word_lists_2025) | Kognat köprüsü ve yalancı kognat uyarısı |

## Gramer sırası ve mevcut uygulamalar

| Kaynak | Kullanım |
|---|---|
| [Riwaq — Quranic Arabic grammar guide](https://riwaqalquran.com/blog/quranic-arabic-grammar/) · [Quranica — grammar](https://quranica.com/articles/learn-quranic-arabic-grammar/) · [eArabicLearning — 7 core concepts](https://earabiclearning.com/blog/2026/05/arabic-grammar-for-beginners/) · [Buruj Academy](https://burujacademy.com/blog/basic-quranic-arabic-grammar/) · [Al-Qaem — Arabic nouns PDF](https://al-islam.org/sites/default/files/singles/637-arabicnouns.pdf) | Mikro-kavram sıralaması çapraz kontrolü |
| [Kalaam](https://www.kalaamapp.com/) · [Kalimah Arabic (App Store)](https://apps.apple.com/gb/app/kalimah-arabic/id6743724222) · [Kalima — Arabic Vocabulary](https://apps.apple.com/mk/app/kalima-arabic-vocabulary/id6758943648) · [Corpus Quran app](https://play.google.com/store/apps/details?id=com.corpusquran) | Rakip özellik karşılaştırması |
| [Kur'an ile Arapça Öğrenin (Play)](https://play.google.com/store/apps/details?id=com.ionicframework.qpionic711514&hl=en_US) · [kuranarapcasi.com (22 ders)](https://www.kuranarapcasi.com/) · [Udemy — Kur'an Arapçası](https://www.udemy.com/course/kuran-arapcas/) · [Nile Center — Kur'an Arapçası](https://nilecenter.org/courses/kuran-arapcasi/) · [Superprof — klasik Kur'an Arapçası](https://www.superprof.com.tr/blog/klasik-kuran-arapcasi-ogrenmek/) | Türkçe pazar ve anlatım tonu |

## Fontlar

| Kaynak | Kullanım |
|---|---|
| [Amiri (Wikipedia, OFL)](https://en.wikipedia.org/wiki/Amiri_(typeface)) · [Scheherazade New (OFL)](https://en.wikipedia.org/wiki/Scheherazade_New) · [Naskh guide — Amiri/Noto Naskh/KFGQPC](https://arabiccalligraphygenerator.online/naskh-calligraphy) · [KFGQPC Uthmanic Hafs (archive)](https://archive.org/details/kfgqpc-uthmanic-script-hafs-regular_2) | Mevcut font yığınının yeterliliği; yeni font paketlememe kararı |

## Repo içi

`CLAUDE.md` (veri güvenliği, MON-25 dört liste, fx2 pin tuzağı),
`archive/ilham-ibadet-premium-plan/01-MEVCUT-DURUM.md` ve `03-TASARIM-SISTEMI.md`
(hub durumu, Arapça tipografi ölçüleri), `app/core/quran.js` (registry
kalıbı), `app/content/quranStrikingVersesV1.js` (insan doğrulama notu),
`app/core/state.js` (`MIGRATE_DEPENDENCIES`), `panel/panelCoverageManifest.js`
(manifest satır şeması), `app/styles.css` (`--quran*` ailesi, Arapça font
yığını, `--f-*` ölçek).

## Telaffuz ve ses (v2 eki)

| Kaynak | Kullanım |
|---|---|
| [JSHSR — Arapça öğretmenliği öğrencilerinin harf telaffuz sorunları (Adıyaman Ü.)](https://jshsr.org/index.php/pub/article/view/2072?articlesBySimilarityPage=16) · [DergiPark — ortaokul öğrencilerinin telaffuz hataları](https://dergipark.org.tr/en/download/article-file/688406) · [Harran İlahiyat Dergisi](https://dergipark.org.tr/en/download/article-file/2076297) · [Lidergi — telaffuz hatasından kaynaklanan anlam değişimi](https://lidergi.com/index.php/pub/article/download/11/11/78) · [DergiPark — Arapça öğrenme hataları ve düzeltme yöntemleri](https://dergipark.org.tr/tr/download/article-file/4208440) | Türk öğrenci hata haritası (boğaz/peltek/kalın), ana dil aktarımı, düzeltme önerileri |
| [HVPT meta-analizi — L2 algı eğitimi (SSLA)](https://www.cambridge.org/core/journals/studies-in-second-language-acquisition/article/high-variability-phonetic-training-hvpt-a-metaanalysis-of-l2-perceptual-training-studies/6ABB8C1F32D88D53EA8D05A4565E76F6) · [HVPT üretime aktarım meta-analizi (Applied Psycholinguistics)](https://www.cambridge.org/core/journals/applied-psycholinguistics/article/does-perceptual-high-variability-phonetic-training-improve-l2-speech-production-a-metaanalysis-of-perceptionproduction-connection/E38D8F5CE65DC708137B0E95F97C6BC7) · [ERIC — HVPT ile telaffuz öğrenimi](https://files.eric.ed.gov/fulltext/EJ1425175.pdf) | Algı-önce yöntem, çok okuyucu, üretim sınırı |
| [Abu-Rabia — Reading Arabic texts: text type, reader type, vowelization](https://link.springer.com/article/10.1023/A:1007906222227) · [Arabic vowels & comprehension (2nd/6th grade)](https://link.springer.com/article/10.1023/A:1023291620997) · [Role of short vowels — critical review](https://www.researchgate.net/publication/330858787_The_Role_of_Short_Vowels_in_Reading_Arabic_A_Critical_Literature_Review) · [Visual word recognition & vowelization (Cognitive Processing)](https://link.springer.com/article/10.1007/s10339-017-0830-9) | Hareke varsayılan açık; soldurma yalnız ileri seviyede |
| [Schmitt, Jiang & Grabe 2011 — Percentage of words known and comprehension (MLJ)](https://onlinelibrary.wiley.com/doi/10.1111/j.1540-4781.2011.01146.x) · [PDF](https://www.lextutor.ca/cover/papers/schmitt_etal_2011.pdf) · [Lexical coverage revisited (Hawaii)](https://scholarspace.manoa.hawaii.edu/bitstreams/be187723-ba8b-433c-9472-b3b4ac847b86/download) · [Coverage-comprehension model (ERIC)](https://files.eric.ed.gov/fulltext/EJ1296462.pdf) · [How does lexical coverage affect processing (Applied Linguistics)](https://academic.oup.com/applij/article/45/6/953/7841943) | %95–98 kuralı; "anlayabildiğin âyet" sayacı |
| [Hulstijn & Laufer 2001 — Involvement Load Hypothesis (Language Learning)](https://onlinelibrary.wiley.com/doi/abs/10.1111/0023-8333.00164) · [ILH systematic review (PMC 2022)](https://pmc.ncbi.nlm.nih.gov/articles/PMC9598591/) | Görev yükü derecelendirmesi |
| [HF — zaibihassan/Quranic-Word-By-Word-Audio-Data (Apache 2.0)](https://huggingface.co/datasets/zaibihassan/Quranic-Word-By-Word-Audio-Data) · [HF — Buraaq/quran-audio-text-dataset](https://huggingface.co/datasets/Buraaq/quran-audio-text-dataset) · [cpfair/quran-align (CC BY 4.0)](https://github.com/cpfair/quran-align) · [Internet Archive — quranwbw word-by-word audio](https://archive.org/details/quran-wordbyword) · [OpenSLR 132 — Quran speech dataset](https://www.openslr.org/132/) | Ses klip kaynakları; köken/lisans doğrulaması D-08 |
