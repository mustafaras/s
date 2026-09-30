# KAO2-20 — Kök aileleri (S-11)
Tarih: 2026-09-30 · Dal: kao2-yeniden-tasarim (= main) · Önceki commit: f801540d

## Yapılan

### (a) İki katmanlı liste
- **Öğrenme sırası (varsayılan):** `QuranGrammarV1.unit11.roots` → **73 aile**.
  Her satır: kök harfleri (Arapça, RTL), okunuş, anlam, **Türkçe türev sayısı**,
  müfredattaki kelime sayısı ve (varsa) "N biliyorsun".
- **Keşif katmanı (isteğe bağlı):** `QuranLexiconV1.roots` → **301 kök**, kelime
  sayısına göre sıralı. "Tüm kökler (301)" düğmesiyle açılır; "Öğrenme sırasına dön"
  ile kapanır. Varsayılan **kapalı** (P10: önce öğrenme sırası, sonra keşif).
- **Arama:** anlam ya da kök üzerinden süzer (`kaoRoots('query', …)`).

### (b) Kök sayfası — tek odaklı
- Kök harfleri (büyük, RTL), okunuş, anlam.
- **Türkçeye geçen türevler** her biri **kalıp etiketiyle** (`masdar (fi'l)`,
  `ism-i fâil (fâ'il)` …).
- **Bu kökten kelimeler:** Arapça + anlam + **durum rozeti**
  (`biliyorsun` / `öğreniyorsun` / `yeni`); her satır kelime detayına gider.
- İnsan okunur özet: *"0 / 6 kelime öğrenildi."* ya da *"…tamamını biliyorsun."*
- **Açık geri yolu:** `‹ Kök aileleri` → listeye döner. Detayda liste tekrarlanmaz
  (fixture bunu zorlar: `kao-root-family-list` yok).

### (c) Erişim yolları
- **Keşfet satırı:** "Kök aileleri · 73 aile" → `App.kaoOpenRoots()`.
  **Koşullu:** yalnız kullanıcı en az bir kelime kartı edinmişse görünür. Gerekçe:
  `test_kao2_today.js` yeni hesapta "ilgili kartlar gelene kadar gizli" sözleşmesini
  koruyor; kök aileleri bir keşif katmanıdır ve yol haritasını sade tutmak gerekir.
  (Bu satırı koşulsuz eklemek o sözleşmeyi kırıyordu — testler yakaladı.)
- **Kelime detayından:** kök ağacı bölümünde "Kök ailesini aç" → aynı kök sayfası.

## TDD
- **Kırmızı:** `node tests/kao/test_kao2_roots.js` → `kaoRootsModel is not a function`.
- **Kendi hatalarım (hepsi testlerle yakalandı ve düzeltildi):**
  1. **`app/core/quranLearn.js` boşaltıldı.** Bir düzenleme betiğinde `io.open(p,'w')`
     çağrısı `write()` hatasından **önce** dosyayı kesti; motor 2937 → **0 satır** oldu.
     `git checkout HEAD --` ile kurtarıldı; tüm sonraki düzenlemeler yazmadan önce
     doğrulama (`assert`) ile yapıldı. **DERS: dosyayı `'w'` ile açıp sonra hata
     almak içeriği yok eder — doğrula, sonra yaz.**
  2. **Parantez dengesi:** iç içe üçlü operatöre dal eklerken bir `)` fazla kaçtı
     (`node --check` yakaladı). Denge, HEAD'deki satırdan hesaplanarak onarıldı.
  3. Testte uydurma API (`kaoDiscoverRows`) kullandım; gerçek render ile değiştirildi.
  4. Kök bağlantısı **2. katmanda** (kök ağacı); test 1. katmanda arıyordu.
  5. `class="kao-root-'+status+'"` birleştirmesi, 44 px tarayıcısında sahte
     `kao-root-` sınıfı üretti → `data-kao-root-state` niteliğine çevrildi.
  6. `test_v3_welcome.js` etiketine yazdığım kesme işareti JS string'ini kırdı.
  7. Keşfet satırını koşulsuz ekleyince `test_kao2_today.js`'in gizlilik sözleşmesi
     kırıldı → satır koşullu yapıldı, testler güncellendi.
- **Yeşil:** `test_kao2_roots.js` **9/9** · KAO ailesi **38/38**.

## Kapılar (P3)
| Komut / aile | Sonuç |
|---|---|
| `tests/kao/test_*.js` | PASS · **38/38** |
| `tests/app/test_*.js` | PASS · **77/77** |
| `tests/panel`, `tests/panel-v2`, `tests/quran` | PASS · 23/23 · 27/27 · 9/9 |
| reminders · driver · zikr · contrast | PASS |
| `git diff --check` | temiz |

### K-1 bütçe ölçümü
| Ölçü | Değer | Bütçe | Durum |
|---|---|---|---|
| çalışma zamanı `quranLearn*` | **86.032 KiB** | 88 | ⚠️ **%98 — pay ~2 KiB** |
| içerik toplam | 173.298 KiB | 256 | ✅ |
| `app/kao.css` | 11.574 KiB | 14 | ✅ |
| VM p95 | 4.479 ms | ≤40 ms | ✅ |

**⚠️ Bütçe uyarısı:** çalışma zamanı bütçesi neredeyse dolu. Sonraki KAO2 kartları
(21+) yeni çalışma zamanı kodu isteyecek; bütçe revizyonu **kullanıcı kararıdır**
(80→88 bir kez onaylandı, ikinci artış onay ister). Alternatif: yeni ekranların
`quranLearnViews.js`'e taşınması ya da bütçenin yeniden tanımlanması.

## Kimlik pinleri (gerçek ölçümle güncellendi)
- `App.x=` benzersiz yüzey **762 → 764** (yeni: `App.kaoRoots`, `App.kaoOpenRoots`)
- `app.js` işlev ataması **600 → 602**
- `App.kao*` sayısı **41 → 43**
- `onclick=` sayımı **393 sabit** (`app/core/quranLearn.js` bu taramaya girmiyor)

## Arayüz kanıtı (headless render)
- Keşfet satırı → **VAR**, eylem `App.kaoOpenRoots()` (kartı olan kullanıcıda)
- Aile sayısı → **73** · örnek: `علم` = `bilmek` · 5 türev
- Tüm kökler → **301**, katman varsayılan **kapalı**, açılınca liste 301
- Kök sayfası → okunuş + anlam + türevler (kalıp etiketli) + 6 kelime, durum rozetli
- Özet → *"0 / 6 kelime öğrenildi."*
- Geri yolu → **VAR** (`‹ Kök aileleri`)

## Dürüstçe açık
- **Cihaz kabulü** hiç yapılmadı; gerçek ekran okuyucu testi ajan tarafından yapılmadı.
- 301 kökün **227'sinde** anlam/türev bilgisi yok (`unit11` dışı); liste bunu
  "N kelime" ile dürüstçe gösterir, boş anlam **uydurulmaz**.
- Bütçe %98 dolu — sonraki kart için plan gerekir.
