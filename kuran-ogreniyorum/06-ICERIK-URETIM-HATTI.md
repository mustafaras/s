# 06 — İçerik üretim hattı ve lisans kararları

İlke: **Arapça hafızadan yazılmaz.** Her Arapça yazım korpus/Tanzil metninden
gelir; her Türkçe anlam insan tarafından satır satır onaylanır;
`verified:false` içerik üretim paketine giremez (fixture reddeder).

## 1. Hat

```
[QAC v0.4 morfoloji]  [Tanzil Uthmani metni]  [Tanzil/QUL TR meal — yalnız referans]
          │                    │                          │
          └──── tools/kao-lexicon-build.mjs (Node, ağsız; girdiler yerel dosya) ────┐
                    │  1. lemma sıklığı, kök, POS, örnek konum (sûre:âyet:kelime)   │
                    │  2. sıklık ≤ 500 + çapa metin kesişimi → aday liste           │
                    │  3. kognat aday etiketi: TDK Arapça kökenli listesiyle eşleme │
                    │     (yalnız ÖNERİ; insan karar verir)                         │
                    │  4. örnek parça kesimi: 3–7 kelimelik pencere, harekeli       │
                    ▼                                                               │
     kuran-ogreniyorum/content/lexicon.draft.json   (taslak; repo'da tutulur)      │
                    │                                                               │
           İnsan doğrulaması (kullanıcı / güvenilir kişi):                          │
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
| Tanzil/QUL Türkçe mealler (Diyanet, Elmalılı ...) | Kaynağa göre değişir; QUL: "her kaynağın lisansını kontrol et" | **Kopyalanmaz.** Yalnız insan doğrulayıcının referansı | — | Kendi kısa çeviri; tefsir hükmü yok |
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

Onay kuralı: **iki bağımsız göz** (kullanıcı + bir ilahiyat/Arapça bilen
kişi) ya da kullanıcının tek başına iki ayrı günde kontrolü; `verifiedBy`
alanı boş olamaz. `QuranStrikingVersesV1` notuyla aynı ruh: kayıt bazında
bayrak, toptan değil; içerik değişirse yeniden doğrulama.

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
