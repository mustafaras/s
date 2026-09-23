# KAO yerel korpus girdileri

Bu klasörün `inputs/` altındaki ham korpuslar yalnız yerel derleme girdisidir;
Git'e girmez. Derleyici ağ çağrısı yapmaz, dosyaları değiştirmez ve Arapça
içeriği hafızadan üretmez.

## Gerekli dosyalar

| Dosya | Resmî indirme | Sabit sürüm / seçenek | Beklenen SHA-256 |
|---|---|---|---|
| `quranic-corpus-morphology-0.4.txt` | [Quranic Arabic Corpus v0.4](https://corpus.quran.com/download/) | v0.4, telif bloğu korunmuş özgün TSV | `a1d12923815341face765083805d2148ed2d9f5cc3f7d6665219d887675d8c46` |
| `quran-uthmani.txt` | [Tanzil Quran Text](https://tanzil.net/download/) | Uthmani 1.1; varsayılan işaretler, secde/rub işaretleri ve üst elif/tatweel seçenekleri korunur | `7f30c647331a61100ebf24a80507dc0fcdd9f2df97f1312b5b2dfcb982a7f326` |

İndirme sayfalarındaki kullanım koşullarını kullanıcı doğrudan kabul eder;
ajan e-posta, parola veya başka hesap bilgisi istemez ve forma girmez. Hash
eşleşmezse dosyayı düzenleme: doğru sürüm/seçeneklerle yeniden indir.

## Kullanım

Önce ağsız gömülü sınama:

```sh
node tools/kao-lexicon-build.mjs --self-test
```

Gerçek girdiler yerleştirildikten sonra istatistik üretimi:

```sh
node tools/kao-lexicon-build.mjs \
  --inputs kuran-ogreniyorum/content/inputs \
  --stats
```

Çıktı yalnız `kuran-ogreniyorum/evidence/KAO-01/stats.json` olur. İçerdiği
başlıca alanlar: gerçek token/lemma/kök/âyet sayıları, ilk 25 lemma, kök/POS
dağılımı ve Tanzil metninden değişmeden kesilmiş 3–7 kelimelik örnekler.
`alignment` makbuzu; bağımsız vakıf işaretlerini, sûre başındaki ekli besmele
tokenlarını ve Tanzil sürümünde bölünmüş fakat QAC'de tek konum olan kelimeleri
ayrı sayaçlarla raporlar. Her âyet QAC kelime sayısına fail-closed hizalanmadan
istatistik dosyası yazılmaz. `LEM` taşımayan tokenlar `fallbackTokenTotal`
paydasında kalır; yüzey biçimi yeni bir lemma gibi sayılmaz.

Çıkış kodları:

- `0`: self-test veya derleme başarılı.
- `2`: gerekli yerel girdi yok; hata her dosyanın resmî adresini ve beklenen
  SHA-256 değerini gösterir.
- `3`: dosya var ama hash uyuşmuyor; kutsal metin/korpus sessizce kabul edilmez.
- `64`: CLI kullanımı hatalı.

## Sayım ve araştırma karşılaştırması

Plan sözleşmesi 77.430 token hedefler. QAC v0.4 resmî sürüm notu ise 77.429
kelime bildirir. Araç bu farkı gizlemez: `contractTokenTarget` ve
`officialReleaseWordTotal` ayrı tutulur, gözlenen `tokenTotal` ikisiyle de
karşılaştırılır. Benzer biçimde `01-ARASTIRMA.md` §1 “ilk 25” ifadesini
kullanmasına rağmen yalnız 10 somut lemma/frekans çifti yayımlar; araç yalnız
bu 10 çifti karşılaştırır, kalan 15 değeri uydurmaz.

## Lisans / atıf kararları (taslak)

- **D-01 açık:** Sıklık, lemma, kök ve POS etiketleri Quranic Arabic Corpus
  v0.4 verisinden türetilir. Kaynak: corpus.quran.com; GNU GPL ve özgün telif
  bloğu şartları geçerlidir. Ham dosya dağıtılmaz.
- **D-02 açık:** Örnek pencereler Tanzil Uthmani metninden değişmeden kesilir,
  sûre:âyet referansı taşır. Tanzil atfı ve bağlantısı zorunludur; metin
  değiştirilmez.

Bu taslaklar kullanıcı/lisans kabulü değildir. `verified:true` üretim içeriği
ve `app/content/quranLexiconV1.js` bu kartta üretilmez.
