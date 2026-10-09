# D3F-16 — F-16: okuyucu "Kelime anlamı" paneli artık modal değil, açılır bölge

Oturum: claude-opus-5-5 · 2026-10-09 · D3F-16

## Kök neden
`kaoReaderHTML` anlam panelini `<section class="kao-reader-panel" role="dialog" aria-label="Kelime anlamı">` olarak çiziyordu.
Panel sayfa akışında, okuyucunun altında duran satır içi bir bölgedir: `aria-modal` yok, odak oraya taşınmıyor, kendi Escape'i yok.
Üstelik zaten `role="dialog" aria-modal="true"` olan KAO kabuğunun (`#sey-ov-card`) **içinde** ikinci bir diyalogdu.
Ekran okuyucu "iletişim kutusu" der ama kullanıcı orada bir iletişim kutusu davranışı bulamaz.

Ayrıca her kelime dokunuşu ve "Kapat" `render()` çağırıyor. Yüzey `mount()` kaplamayı söküp yeniden ekliyor (app.js `registerQuranLearnSurface`).
Bu yüzden dokunulan düğme DOM'dan silinir ve klavye/ekran okuyucu odağı gövdeye düşer. Raporun "odak taşıma yok" maddesinin
modal olmayan bir panelde karşılığı budur.

**Genel ölçüm (raporun ötesi):** `app/core/*.js` + `app.js` içinde `aria-modal` taşımayan tek `role="dialog"` bu paneldi.
Diğer tüm diyaloglar modal sözleşmesindedir.

**Testler neden kaçırdı:** `test_kao2_a11y.js`'nin denetimi (kural h) her yüzeyde "tam bir diyalog kabuğu" istiyor. Ama yüzey matrisi
okuyucuyu yalnız panel **kapalıyken** çiziyordu. `test_kao2_reader.js:114` ise `role="dialog" | aria-live` diyerek kusurlu hâli de kabul ediyordu.

## Yapılan (arayüzde görünmeyen, yalnız erişilebilirlik ağacı ve odak)
- `app/core/quranLearn.js`:
  - Panel: `<section id="kao-reader-panel" class="kao-reader-panel" role="region" aria-live="polite" aria-label="Kelime anlamı">`.
  - Kelime düğmeleri `id="kao-reader-w-<sıra>"` alır. Açık kelimenin düğmesi `aria-expanded="true"` ve ek olarak `aria-controls="kao-reader-panel"` taşır
    (disclosure deseni; kapalı panele işaret eden `aria-controls` kalmaz).
  - `kaoReaderFocusWord(index)` (özel yardımcı): `kaoReader('word')` başarılı yeniden çizimden sonra, `kaoReader('close')` ise kapanış çiziminden
    sonra odağı yüzeyin mevcut `restoreFocus` bağımlılığıyla açan kelime düğmesine geri verir. Yeni bağımlılık yok.
  - Görsel/CSS değişikliği yok. `data` değişmez. Yeni `App.*` handler'ı ya da `onclick` yok (fx2/v3 yüzey pinleri kaymaz).
- **Pin** `20261008d` → **`20261008e`**: index.html, sw.js, panel-v2.html, 12 pin testi, `D3F-STATE.pins.release`.
- Çalışma zamanı boyutu: `quranLearn.js` 355 130 → 355 657 bayt (+527).

## TDD
- RED (`evidence/D3F-16/red.txt`):
  - `test_kao2_a11y`: `a11y ihlali (3): tohumlu/reader-112-anlam-paneli: diyalog kabuğu: 2 adet | …113… | …114…`.
    Matrise eklenen panel-açık yüzeyler genel kural (h) ile yakalandı. `reader-1` yüzeyinde panel yok: sûre 1 yirmi kısa sûre arasında
    değil, okuyucu hata durumunu çiziyor (beklenen).
  - `test_kao2_reader`: `AssertionError: panel erişilebilir bölge`.
- GREEN (`evidence/D3F-16/green.txt`): `test_kao2_a11y` 13/13 (yeni kontrol: role=region + aria-live, aria-expanded/aria-controls, sıra kimlikleri,
  açılışta ve "Kapat" sonrası odak açan kelimede) · `test_kao2_reader` 14/14.
- Not: yeni kontroldeki ilk kırmızılardan biri gerçek değil, ortam kaynaklıydı. VM'deki içerikten türetilen dizi başka bir realm'in `Array`'iydi
  ve `deepStrictEqual` prototip farkına takıldı. Beklenen dizi test realm'inde kuruldu.
- Fixture turu (pin sonrası, 2026-10-09 12:10–12:2x, yük 3–10): `tests/kao/*` + pin tazeliği + `test_fx2_*` + `test_iip_09/22` + `test_v3_welcome` +
  `test_app_surface_*` + `test_header_*` + `test_modal_focus_containment` + `driver.mjs` + `zikr-harness.mjs` → **74 PASS · 2 FAIL**.
  İki kırmızının kaynağı aynı ve bu değişiklikten **bağımsız**: `test_kao2_grammar_tasks` D4 "ilk görev parça dizme olmalı" ve onu yeniden koşan
  `test_kao2_kabul` A-9 (190/191). Aşağıdaki "Önceden var olan kırmızı" bölümüne bak.
- Mutasyon: `bash kao2-duzeltme/denetim-3/evidence/D3F-16/panel-mutasyon.sh` → **11/11 PASS** (M0 iki test yeşil · M1 role=dialog → matris "anlam-paneli: diyalog kabuğu: 2 adet" + okuyucu "panel erişilebilir bölge" · M2 açılışta odak dönmez · M3 "Kapat" sonrası odak dönmez · M4 aria-controls yok · M5 panel kimliği yok → genel kural "aria-controls hedefi yok" · M6 aria-live yok (iki test) · M7 düğme kimliği yok). Hayatta kalan mutant yok.

## Bilerek değişen testler
- `tests/kao/test_kao2_a11y.js`: matris okuyucu sûre 112/113/114/1 için panel-açık yüzeyi de çizer (sonra kapatır). Yeni D3F-16 kontrolü.
- `tests/kao/test_kao2_reader.js:114`: "dialog | aria-live" seçeneği kalktı; panel `role="region"` + `aria-live="polite"` olmalı, `role="dialog"` olmamalı.
- 12 pin testi: `20261008d` → `20261008e`.

## Sınır (dürüstlük)
- **Ekran okuyucu doğrulaması YAPILMADI** (VoiceOver/TalkBack); kullanıcıda. Kanıt yalnız üretilen işaretleme ve odak çağrılarıdır.
- `aria-live` kaplama her çizimde yeniden eklendiği için, panel ilk açıldığında içeriğin **duyurulacağı garanti değil**.
  Yeni eklenen canlı bölgeleri ekran okuyucular tutarsız duyurur. Güvenilir yol odağın açan düğmede kalmasıdır:
  düğme "genişletilmiş" okunur ve `aria-controls` panele götürür. `aria-live` rapor önerisi olarak ek katmandır.
- Escape panel değil, KAO kabuğunun ortak sözleşmesidir (`App.onModalKeydown` → `kaoClose`). Panel modal olmadığı için bu doğru davranıştır.
- Diğer okuyucu eylemleri ("Dinle", hızlı kontrol) da yeniden çizimle odağı düşürür. Bu F-16'nın kapsamı dışında; bilinen genel desen,
  ayrı bulgu gerektirir.
- Tam kapı (`kapilar.sh`) YAYIN öncesi sakin makinede koşulacak (starter kural 7). Bu commit yerel.

## Önceden var olan kırmızı (F-16 dışı, YENİ — kullanıcı kararı bekliyor)
- `tests/kao/test_kao2_grammar_tasks.js` D4 (`playFragment`, satır ≈869) temiz HEAD `7a4a0f6d` klonunda da kırmızı. D3F-16 değişikliği yokken aynı hata çıkıyor.
  Dün (2026-10-08) D3F-11 mutasyon betiğinin M0'ı bu testi yeşil koşmuştu.
- Neden (ölçüldü, `$TMPDIR` sondası): `tests/kao/helpers/kao-harness.js` `todayStr`'yi `2026-09-30`'a sabitliyor ama VM'e **gerçek** `Date`'i veriyor.
  `kaoStart` `new Date()` ile kuyruk kuruyor. Yeni kullanıcının ilk parça görevi saate göre değişiyor:
  `2026-09-30…2026-10-08` → `fragment/order s:95:4`; `2026-10-09` ve sonrası → `fragment/translate s:95:5`.
  Test "ilk görev order" varsayıyor. Kod hatası değil, **saate bağlı (hermetik olmayan) test**.
- Etki: tam kapı (`kapilar.sh`) ve kabul A-9 bugünden itibaren bu nedenle kırmızı. Bu durum F-16'dan bağımsız olarak bir sonraki YAYIN'ı engeller.
- Bu commit'te düzeltilmedi; kural 1 gereği her bulgu ayrı commit. Öneri: harness saati `now`'a sabitlesin ya da D4 ilk `order` görevini kuyrukta arasın.
  Kullanıcıya ayrı adım olarak sunuldu.
- **Sonradan (2026-10-09, kullanıcı onayıyla):** F-20 olarak kaydedildi ve `D3F-16: ek` commit'inde düzeltildi. Test düzeneği VM saatini `now`'dan başlatıyor.
  Kanıt: [`saat/KANIT.md`](saat/KANIT.md).

## Kanıt düzeyleri
kaynak/test ✓ · yayın — (henüz yok; tam kapı ve kullanıcı talimatı bekliyor) · cihaz/ekran okuyucu —
