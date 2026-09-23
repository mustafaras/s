# 06 — İçerik üretim hattı ve lisans kararları

İlke: **Arapça hafızadan yazılmaz.** Her Arapça yazım korpus/Tanzil metninden
gelir; her Türkçe anlam doğrulayıcı tarafından satır satır onaylanır (D-12:
yapay zekâ doğrulayıcı kabul);
`verified:false` içerik üretim paketine giremez (fixture reddeder).

## 1. Hat

```
[QAC v0.4 morfoloji]  [Tanzil Uthmani metni]  [Tanzil/QUL TR meal — yalnız referans]
          │                    │                          │
          └──── tools/kao-lexicon-build.mjs (Node, ağsız; girdiler yerel dosya) ────┐
                    │  1. lemma sıklığı, kök, POS, örnek konum (sûre:âyet:kelime)   │
                    │  2. sıklık ≤ 500 + çapa metin kesişimi → aday liste           │
                    │  3. kognat alanı: doğrulayıcı yazar (§3.1 biçim kuralı)       │
                    │     (araç kognat üretmez; yalnız biçimi denetler)             │
                    │  4. örnek parça kesimi: 3–7 kelimelik pencere, harekeli       │
                    ▼                                                               │
     kuran-ogreniyorum/content/lexicon.draft.json   (taslak; repo'da tutulur)      │
                    │                                                               │
           Doğrulama (yapay zekâ doğrulayıcı, D-12):                                │
             a) Arapça hareke görsel kontrol   b) Türkçe anlam(lar)                 │
             c) kognat & anlam kayması notu    d) transliterasyon                    │
             e) örnek parça Türkçesi (kendi kısa çeviri)                            │
                    ▼                                                               │
     lexicon.verified.json  →  node tools/kao-lexicon-build.mjs --freeze            │
                    ▼                                                               │
     app/content/quranLexiconV1.js  (verified:true, version, methodology, attribution)
```

Girdi dosyaları (`quranic-corpus-morphology-0.4.txt`, `quran-uthmani.txt`)
**repo'ya konmaz**; `kuran-ogreniyorum/content/README` indirme adresini ve
sha256'yı kaydeder; araç dosya yoksa açık hata verir.

## 2. Lisans karar tablosu

| Kaynak | Lisans | Nasıl kullanıyoruz | Yükümlülük | Karar |
|---|---|---|---|---|
| Quranic Arabic Corpus 0.4 | GNU GPL (verbatim dağıtım serbest, değiştirme yok) + kaynak/link zorunlu | Yalnız **sayım ve etiket türetme** (sıklık, kök, POS). Ham satırlar kopyalanmaz. | Türetilmiş çalışma tartışması: sayısal sıklık ve dilbilgisel gerçekler (kök ك-ت-ب gibi) telif konusu değildir; yine de atıf + link verilir | **D-01:** `QuranLexiconV1.attribution` içinde "Sıklık ve morfoloji etiketleri Quranic Arabic Corpus (corpus.quran.com) verisiyle hesaplanmıştır" + link. Kullanıcı onayı |
| Tanzil Kur'an metni | CC BY 3.0, verbatim, değiştirme yok, tanzil.net linki | Âyet parçaları (kelime pencereleri) — metin *değiştirilmez*, yalnız kesilir; referans verilir | Atıf + link; "kesit" değişiklik sayılmaz ama tam âyet referansı zorunlu | **D-02:** Her örnek `ref:'2:2'` taşır; `attribution` Tanzil satırı |
| Tanzil/QUL Türkçe mealler (Diyanet, Elmalılı ...) | Kaynağa göre değişir; QUL: "her kaynağın lisansını kontrol et" | **Kopyalanmaz.** Yalnız doğrulayıcının referansı | — | Kendi kısa çeviri; tefsir hükmü yok |
| QUL TR kelime-kelime (#99) | Belirtilmemiş | Referans | — | Kopya yok |
| ilimtalibi.com 500 kelime, Understand Quran TR PDF | Ücretsiz dağıtım; lisans belirtilmemiş | Metodoloji ilhamı; kelime seçimi kendi hesabımız | — | Kaynakçada anılır |
| ts-fsrs (open-spaced-repetition) | MIT | Algoritma portu (parametreler + formüller) | Lisans notu | **D-04:** `quranLearn.js` başında MIT atıfı |
| Fontlar | OFL (mevcut yığın) | Yeni font yok | — | — |

Repo'nun kendi LICENSE dosyası yok; **D-05:** kullanıcı repo lisansına karar
vermeden `quranLexiconV1.js` `main`'e push edilmez (public repo).

## 3. Doğrulama arayüzü (kod yazmadan)

Taslak JSON'u satır satır onaylamak için iki seçenek:
1. `lexicon.draft.json` → Markdown tablo (`--review-md`) → kullanıcı düzenler
   → `--import-md`.
2. Google Sheets/CSV döngüsü (aynı sütunlar).

Sütunlar: `lemmaId · ar · translit · tr1 · tr2 · root · pattern · pos · freq ·
cognateTr · cognateShift · ex1_ar · ex1_tr · ex1_ref · ... · verifiedBy · verifiedAt`.

Onay kuralı (**D-12**, kullanıcı kararı 2026-09-23): doğrulamayı yapay zekâ
yapar; **insan teyidi ve iki-göz / iki-gün şartı yoktur**. Bir satır şu
koşullarla doğrulanmış sayılır: `verifiedBy` dolu (yapay zekâ kimliği kabul),
`verifiedAt` tek geçerli tarih (`YYYY-AA-GG`), `tr1` dolu ve referansın birebir
kopyası değil (§2). `--import-md` tutarlılık denetimi **0 sorun** bildirmelidir
(örnek çevirileri tam, kalıp sözlükte, kognat biçimi geçerli, kayma yalnız
kognatla). `QuranStrikingVersesV1` notuyla aynı ruh: kayıt bazında bayrak,
toptan değil; içerik değişirse yeniden doğrulama.

### 3.1 Alan kuralları (araç denetler)

- **`pattern`** — biçim `etiket[ (vezin/not)][ · illet]`. Etiket sabit listeden:
  fiil I–X, fiil dörtlü, câmid fiil · masdar, ism-i fâil, ism-i mef'ûl,
  sıfat-ı müşebbehe, ism-i tafdîl, mübalağa, ism-i mekân, ism-i zaman,
  ism-i âlet, çoğul, câmid isim, özel isim, sayı ismi · zamir, ism-i işaret,
  ism-i mevsûl, soru ismi, şart ismi, zarf, ünlem ismi · harf-i cer, atıf harfi,
  olumsuzluk harfi, nasb harfi, cezm harfi, harf-i müşebbehe, istisna edatı,
  cevap harfi, tenbih harfi, nidâ edatı, istikbal harfi, tahkik harfi, tafsil
  harfi, idrâb harfi, gaye harfi, reddiye harfi, masdar harfi, istidrâk harfi,
  soru harfi, şart harfi. İllet (yalnız fiilde) kökten: mehmûz, muzaaf, misal,
  ecvef, nâkıs, lefif. Örnek: `fiil IV (ef'ale) · mehmûz, nâkıs`.
- **`cognateTr`** — aynı Arapça kökten gelen, bugün yaygın kullanılan Türkçe
  sözcük(ler); `;` ile en çok 3; parantez, Arapça asıl ya da farklı kökten
  sözcük yok. Kognat doluysa kelime B kovasına girer (03 §9).
- **`cognateShift`** — yalnız Türkçedeki ana anlam Arapçadakinden belirgin
  biçimde ayrılıyorsa; kognat yoksa boş.
- **`exN_tr`** — kesitin kısa Türkçesi. Parantez yalnız **aynı âyetin** kesit
  dışındaki sözünü tamamlar; açıklama/tefsir notu yazılmaz (§2).

## 4. Sürümleme

`lexiconVersion` değişince kart id'leri korunur (lemma id kararlı: Buckwalter
lemma'dan türetilmiş ASCII slug, ör. `rabb`, `Allah`, `kitAb`); silinen
lemma'nın kartı `orphan` olur, sayılmaz, silinmez. İçerik dosyası başında
`METHODOLOGY_TR` ve `ATTRIBUTION` sabitleri (nüzul kataloğu kalıbı).

## 5. Boyut bütçesi ve çevrimdışı

Üç içerik dosyası toplam ≤ 410 KB (gzip ~120 KB). Pages/CDN cache-bust ile
tek indirme; PWA `sw.js` fetch cache stratejisi içermediği için "tam
çevrimdışı" vaadi verilmez (IIP B09 ile aynı sınır). Seviye 6 (tam Kur'an
kelime kelime ≈ 77 K kelime × ~40 B ≈ 3 MB) **bu programın dışında**; ayrı
karar ister.
