# KAO yerel korpus girdileri

Bu klasörün `inputs/` altındaki ham korpuslar yalnız yerel derleme girdisidir;
Git'e girmez. Derleyici ağ çağrısı yapmaz, dosyaları değiştirmez ve Arapça
içeriği hafızadan üretmez.

## Gerekli dosyalar

| Dosya | Resmî indirme | Sabit sürüm / seçenek | Beklenen SHA-256 |
|---|---|---|---|
| `quranic-corpus-morphology-0.4.txt` | [Quranic Arabic Corpus v0.4](https://corpus.quran.com/download/) | v0.4, telif bloğu korunmuş özgün TSV | `a1d12923815341face765083805d2148ed2d9f5cc3f7d6665219d887675d8c46` |
| `quran-uthmani.txt` | [Tanzil Quran Text](https://tanzil.net/download/) | Uthmani 1.1, `outType=txt`; Tanzil **varsayılanları** (alef/marks/sajdah/tatweel açık, rub/laa/stanween kapalı) | **gövde** `7f429d485cb43f0ac78e2830789f6634709725010922c535035a221e531708de` |

### Tanzil indirme tarifi (tek adres)

```sh
curl -fSL -o quran-uthmani.txt \
  'https://tanzil.net/pub/download/index.php?quranType=uthmani&outType=txt&agree=true\
&alef=true&marks=true&sajdah=true&tatweel=true'
```

### Neden Tanzil için "tam dosya" SHA-256 YOK

Tanzil, telif bloğunu (baştaki `#` satırları) **aynen korunması** şartıyla verir ve bu
blokta **yuvarlanan bir yıl** vardır:

```
#  Copyright (C) 2007-2026 Tanzil Project
```

Yıl her takvim yılında değiştiği için aynı Kur'an metninin **tam-dosya** hash'i
ilkeler olarak sabitlenemez (2026'da pinlenen bir hash 2027'de tutmaz). Bu yüzden
kapı iki parçalıdır:

1. **Gövde SHA-256** — yalnızca âyet satırları (`#` ile başlayanlar çıkarılır,
   CRLF→LF, baş/son boşluk kırpılır). Yıldan ve telif bloğu düzenlemesinden bağımsız.
2. **Yapısal kapı** — veri satırı sayısı **QAC âyet sayısına eşit** olmalı ve her veri
   satırında Arapça yazı bulunmalı (bozuk indirme / HTML gövdesi reddedilir).

Not: Tanzil 1.1 indirmesi 6236 âyet verir; QAC ile âyet bazında hizalıdır. Ham
dosya yine de **değiştirilmez** ve Git'e girmez.

Gövde hash'ini kendin üretebilirsin (araçla **aynı** tanım):

```sh
node -e "const fs=require('fs'),c=require('crypto');const b=fs.readFileSync('quran-ogreniyorum/content/inputs/quran-uthmani.txt','utf8').replace(/\r\n/g,'\n').split('\n').filter(l=>!l.startsWith('#')).join('\n').trim();console.log(c.createHash('sha256').update(Buffer.from(b,'utf8')).digest('hex'))"
```

Beklenen: `7f429d48…1708de` — hash tanımı **tam olarak** `stripTanzilBoilerplate()`
fonksiyonudur (CRLF→LF, `#` satırları atılır, baş/son boşluk kırpılır).

İndirme sayfalarındaki kullanım koşullarını kullanıcı doğrudan kabul eder;
ajan e-posta, parola veya başka hesap bilgisi istemez ve forma girmez. Hash
eşleşmezse dosyayı düzenleme: doğru sürüm/seçeneklerle yeniden indir.

## Kullanım

Önce ağsız gömülü sınama:

```sh
node tools/kao-lexicon-build.mjs --self-test
```

### KAO-01 — istatistik (yalnız sayım)

```sh
node tools/kao-lexicon-build.mjs \
  --inputs kuran-ogreniyorum/content/inputs \
  --stats
```

Çıktı yalnız `kuran-ogreniyorum/evidence/KAO-01/stats.json` olur. `sourceHashes`
alanı QAC'nin tam-dosya hash'ini ve Tanzil'in hem tam-dosya hem **gövde** hash'ini
tutarlar (`uthmaniBodySha256`).

### KAO-02 — aday liste, kognat/komşu önerisi, inceleme tablosu

```sh
node tools/kao-lexicon-build.mjs --inputs kuran-ogreniyorum/content/inputs --draft
node tools/kao-lexicon-build.mjs --review-md      # taslaktan tabloyu yeniden üretir
node tools/kao-lexicon-build.mjs --import-md      # kullanıcı tabloyu doldurduktan sonra
```

`--draft` üç çıktı verir:

| Çıktı | İçerik |
|---|---|
| `content/lexicon.draft.json` | ~530 aday lemma: korpustan Arapça/translit/kök/POS/sıklık/örnek, kova etiketi |
| `content/lexicon.review.md` | 06 §3 sütunlarıyla inceleme tablosu (birincil doldurma yolu) |
| `evidence/KAO-02/draft-report.json` | Kova sayıları, kapsam oranı, kök tanısı, `verifiedTotal` |

**Altın kural:** araç yalnız korpustan **mekanik** alanları üretir; Türkçe anlam,
kalıp, kognat notu ve örnek çevirilerini **doğrulayıcı yazar** (06 §3, D-12: yapay
zekâ doğrulayıcı). `--import-md` sonucu `lexicon.verified.json`'a yazılır; `--draft`
yeniden üretimde doğrulanmış alanları oradan taşır (emek kaybolmaz).

**Seçim kuralı (03 §9):** A = lemma sıralamasında ilk 100 işlev kelimesi ·
B/C = sıralamada ≤500 içerik kelimesi · D = çapa/tesbihat, sıralamadan bağımsız.
Bu, "sıklık ≤500" ifadesinin sıra eşiği okumasıdır; gerekçe D kovasının kendi
tanımıdır ("sıklık >500 olsa da").

**Kapsam paydası:** ölçüm **LEM etiketli token havuzu** üzerindendir (77.429
kelime token'ının 74.608'i LEM taşır). Rapor ayrıca `ratioWordTokens` ve
sıra eşiğini yükselten alternatifleri (`coverage.alternatives`) yanında verir;
hedef %80 tutmazsa bu **açıkça** `warnings` + `coverage.goalMet:false` ile
bildirilir — eşiği yükseltmek kullanıcı kararıdır, araç kendi kendine değiştirmez.

Kova tanımları (03 §9): **A** işlev kelimeleri (edat/zamir/bağlaç) · **B** kognat
isim/fiil (Türkçe karşılığı var) · **C** kognat olmayan isim/fiil · **D** çapa metin
(Fâtiha + 112–114 + tesbihat).

**Kognat kanalı tektir:** inceleme tablosunun `cognateTr` / `cognateShift`
sütunları; biçim kuralı 06 §3.1 (aynı kökten güncel Türkçe sözcük, en çok 3,
parantez yok) ve araç biçimi denetler. Kognat dolu satır B kovasına girer;
sayı `draft-report.json` içinde `cognate.matchedTotal` ile raporlanır. Anlam kayması (`cognateShift`) doluysa R-A8 uyarısı — pastil + "dikkat"
metni — devreye girer; yalnız o kart için.

Çıkış kodları:

- `0`: self-test, istatistik veya taslak başarılı.
- `2`: gerekli yerel girdi yok (her dosyanın resmî adresi, indirme tarifi ve beklenen
  hash'i gösterilir) — ya da `--review-md`/`--import-md` için taslak henüz üretilmemiş.
- `3`: dosya var ama **gövde** hash'i uyuşmuyor ya da yapısal kapı düştü (âyet sayısı
  uyuşmazlığı, Arapça olmayan satır); kutsal metin/korpus sessizce kabul edilmez.
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
- **D-08:** Kognat eşlemesi (`cognateTr`, `cognateShift`) yalnız inceleme tablosu
  sütunlarında yaşar ve **insan** tarafından TDK verisinden yazılır; araç hiçbir
  kognat iddiası üretmez. Sütun boş kaldığı sürece B kovası boş kalır ve anlam
  kayması notu yazılmaz.

Bu taslaklar kullanıcı/lisans kabulü değildir. `verified:true` üretim içeriği
ve `app/content/quranLexiconV1.js` bu kartta üretilmez (KAO-03 onayı sonrası
KAO-05).
