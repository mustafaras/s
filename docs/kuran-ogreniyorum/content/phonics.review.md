# KAO fonetik içerik incelemesi

**Sürüm:** `quran-phonics-tr-v1` · **Tarih:** 2026-09-23 · **Doğrulayan:** `gpt-5-codex` · **Kural:** D-12

Bu inceleme `10-TELAFFUZ.md` ses envanteri ve KAO-01 Buckwalter tablosunu esas alır. Arapça harf ya da kelime hafızadan üretilmedi: harfler `bw-table`, kelime örnekleri `quranLexiconV1` kimlikleriyle kaynaklandı. D-12 program-geneli kullanıcı kararı insan/iki-göz koşulunu kaldırır; KAO-23 promptundaki eski ikinci-göz cümlesine karşı bu karar üstündür.

## Harf envanteri

| Kova | Kimlikler | Sayı | Sonuç |
|---|---|---:|---|
| A · aynı/çok yakın | ba, ta, jim, dal, ra, zay, sin, shin, fa, kaf, lam, mim, nun, ha, waw, ya | 16 | PASS |
| B · yakın ama farklı | hah, sad, dad, tta | 4 | PASS |
| C · Türkçede yok | tha, dhal, zah, ayn, ghayn, khah, qaf, hamza | 8 | PASS |
| Toplam | benzersiz harf | 28 | PASS |

`10-TELAFFUZ.md` tablosu A kovasını metinde 12 diye etiketlese de aynı satır 16 harf sayar. Ayrıca qaf hem B'deki kaf↔qaf yakın karşılaştırmasında hem C'deki Türkçede olmayan ses listesinde yer alır. Veri modelinde qaf tek ve C kovasındadır; B rolü `mp_k_qaf.roles` ile korunur. Bu nedenle 28 benzersiz harf 16+4+8, görsel kabulü ise 4 B + 8 C + qaf'ın ayrı B karşılaştırma varyantı = 13 SVG'dir.

## B/C algı çiftleri

| Hedef | Karşıt | Örnek kimlikleri | SVG | Sonuç |
|---|---|---|---|---|
| tta | ta | `l_TaEaAm_f85a5a` / `l_talaY_d5d166` | mahrec-tta | PASS |
| dad | dal | `l_Daraba_fbd307` / `l_daEaA_f5ec67` | mahrec-dad | PASS |
| sad | sin | `l_Sabara_34dfc2` / `l_sabiyl_bdac41` | mahrec-sad | PASS |
| hah | ha | `l_Haq_3072cf` / `l_hal_232554` | mahrec-hah | PASS |
| tha | sin | `l_vamuwd_717675` / `l_sabiyl_bdac41` | mahrec-tha | PASS |
| dhal | zay | `l_akara_67cfbf` / `l_zaAda_884c7a` | mahrec-dhal | PASS |
| zah | zay | `l_Zalama_7a9278` / `l_zaAda_884c7a` | mahrec-zah | PASS |
| ayn | hamza | `l_Ean_2cd3f8` / `l_an_d1c942` | mahrec-ayn | PASS |
| ghayn | khah | `l_gayob_611f35` / `l_xayor_65557c` | mahrec-ghayn | PASS |
| khah | ha | `l_xalaqa_2fa056` / `l_hal_232554` | mahrec-khah | PASS |
| hamza | ayn | `l_amara_3fab3c` / `l_Eamila_50319c` | mahrec-hamza | PASS |
| qaf | kaf | `l_qalob_e14dcc` / `l_kul_03497c` | mahrec-qaf-b + mahrec-qaf-c | PASS |

`a`/`b` alanları algıda ayrıştırılacak iki sesi, `exampleWords` ise o sesi Kur'an bağlamında taşıyan iki doğrulanmış sözlük kaydını verir. B/C'deki 12 benzersiz hedefin her biri en az bir çiftte bulunur.

## Okuma kuralları ve transliterasyon

- 7/7 çekirdek kural `10-TELAFFUZ.md` §4 ile aynı sırada ve tecvid kapsamını genişletmeden kaydedildi.
- `bwToOkunus` ve `bwToDia` aynı 28 Buckwalter anahtarını taşır; eksik/fazla/tekrarlı anahtar yoktur.
- DİA değerleri 28 ünsüzü birebir ayırır. Başlangıç okunuşu bilinçli olarak kayıplıdır; örneğin Türkçe kulağa yakın birden çok h/s/z ayrımı bilimsel katmanda görünür.
- Uzun ünlüler â/î/û ↔ ā/ī/ū; şedde ve sükûn ayrı işaret notlarıyla kaydedildi.

## SVG kabulü

13 dosyanın tamamı aynı `viewBox` ve sagittal temel yol geometrisini kullanır. Yalnız Türkçe `<title>` ve mahreç vurgu yolu değişir. Her dosyada `fill="currentColor"` vardır; sabit renk yoktur; dosya başına 4 KB sınırı denetim komutuyla zorlanır.

## Onay

| Alan | Sonuç |
|---|---|
| 28 benzersiz harf | PASS |
| Her B/C hedefinde en az bir algı çifti | PASS |
| 7 okuma kuralı | PASS |
| İki transliterasyon katmanı | PASS |
| DİA çıktıları çakışmasız | PASS |
| 13 temalanabilir mahreç SVG'si | PASS |
| D-12 imzası | `gpt-5-codex`, 2026-09-23 |
