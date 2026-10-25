# K3PD-27 — İçerik yeniden üretimi ve telaffuz zinciri

Tarih: 2026-10-25 · Branch: `k3pd-denetim-duzeltmeleri` · Başlangıç HEAD: `35cf4b1faf4fcb97b9513142a8520eaaf8568a95`

## Yerel girdiler ve pinler

Üç gerekli yol bu çalışma ağacında mevcut. Üçü de `kaynak/kuran/icerik/.gitignore` tarafından Git dışında tutuluyor; bu yüzden pinler araç kaynaklarında ve gerçek yerel baytlarda doğrulandı. İndirme/ağ erişimi yapılmadı.

| Yol | SHA-256 (bu çalıştırma) | Kaynak/pin | Sonuç |
|---|---|---|---|
| `kaynak/kuran/icerik/inputs/quranic-corpus-morphology-0.4.txt` | `a1d12923815341face765083805d2148ed2d9f5cc3f7d6665219d887675d8c46` | `tools/kao-lexicon-build.mjs` pin’i aynı; Quranic Arabic Corpus indirme kaynağı, GNU GPL atfı korunur | PASS |
| `kaynak/kuran/icerik/inputs/quran-uthmani.txt` | `829083f684ecb5c71853029ca1970946a12c2dc90528d6e0e3cd6dbc41204b7c` | Tam dosya hash’i yıllık telif satırı nedeniyle pinlenmiyor; gövde SHA-256 `7f429d485cb43f0ac78e2830789f6634709725010922c535035a221e531708de` ile eşleşti; 6.236 âyet satırı | PASS |
| `kaynak/kuran/icerik/lexicon.reference.json` | `2ee7ca3d011a4fef232bffb407fac9f079ebb9b66baca5475b1a783617ed8ef6` | `tools/kao-content-freeze.mjs` SHA-256 pin’i aynı; quran.com API v4 referans girdisi | PASS |

Kaynak adresleri araçlarda kayıtlıdır: QAC `https://corpus.quran.com/download/`, Tanzil `https://tanzil.net/download/`; quran.com girdisi yalnız referanstır, üretim paketine kopyalanmaz. Burada kaynak içeriği yayımlanmadı.

## Dört modülün bayt-eş yeniden üretimi

`tests/kao/test_kao_freeze_repro.js` kaynağı incelendi. Test, iki üretim aracını ve `kaynak/kuran/icerik` girdilerini `os.tmpdir()` altındaki `kao-freeze-repro-*` kopyasına alıyor; kopyadaki `app/content` dizinini boş oluşturuyor; aşağıdaki dört gerçek aracı sırayla çalıştırıyor; her modülü repodaki güncel baytlarla karşılaştırıyor. `try/finally` içindeki `fs.rmSync(copy, { recursive:true, force:true })` test kopyasını siliyor. Seçilen `--freeze*` modları yalnız bu kopyanın `app/content` modüllerine yazar; workbook/import ve `--reference` ağ modları çağrılmaz.

| Üretilen modül | SHA-256 önce | SHA-256 sonra | Yeniden üretim |
|---|---|---|---|
| `app/content/quranLexiconV1.js` | `ae32ed0dd26b6ab51867f4bca6d713ec72561ae5a5339d4b92f3dc9d22d02d7f` | `ae32ed0dd26b6ab51867f4bca6d713ec72561ae5a5339d4b92f3dc9d22d02d7f` | bayt-eş |
| `app/content/quranGrammarV1.js` | `53808c0565af4d7d9057aecc03f0bfbd7b0f0b0e962a98ffbcaa62390ed530ea` | `53808c0565af4d7d9057aecc03f0bfbd7b0f0b0e962a98ffbcaa62390ed530ea` | bayt-eş |
| `app/content/quranShortSurahsV1.js` | `adb56a326bd27ffa490e57c21bae8030ddf824debc1d14449d6867ae4ee307ca` | `adb56a326bd27ffa490e57c21bae8030ddf824debc1d14449d6867ae4ee307ca` | bayt-eş |
| `app/content/quranPhonicsV1.js` | `3dfead88d140844266ecc007dc860c5eb7e720985556cd502669a478d8b3c7b9` | `3dfead88d140844266ecc007dc860c5eb7e720985556cd502669a478d8b3c7b9` | bayt-eş |

Gerçek komut sonucu `KAO freeze repro: PASS (4 modül bayt-eş)`, exit 0. Testin kendi önce/sonra SHA kontrolü de geçti. İzole kopya için OS temp dizini `/var/folders/qs/fvm17ydd23z_nbyz37cb8q480000gn/T`; test öncesi ve sonrası `kao-freeze-repro-*` listesi boştu. Kişisel veri, production input veya production modülüne yazım: 0.

## Araç → doğrulanmış girdi → çalışma zamanı telaffuzu

`node tests/kao/test_kao_pronunciation_contract.js` exit 0 verdi. Güncel `lexicon.verified.json` üzerinde ayrıca dinamik sayım yapıldı; testin `524/524` metni yalnız sabit bir çıktı metni olarak kabul edilmedi:

- doğrulanmış lemma: 524;
- `translit.auto=true` lemma: 524; güncel araç dönüşümünden sapma: 0;
- çalışma zamanında araçla karşılaştırılan lemma: 524; eşleşme: 524; sapma: 0.

Bu zincir araç/girdi/runtime uyumunu kanıtlar; telaffuzların bilimsel veya insan uzmanı tarafından yeniden onaylandığı anlamına gelmez.
