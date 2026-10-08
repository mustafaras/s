# D3F-11 — F-11: "Bu emir kime söylenmiş?" sorusu artık kişiyi sınıyor

Oturum: claude-opus-5-5 · 2026-10-08 · D3F-11

## Kök neden
`gramPersonRecipe` (g13/g15/g17 kişi tanıma) şık olarak tablonun "Kime" etiketini olduğu gibi kullanıyordu. g17 (emir) tablosunda
bu etiketler kişiye bir **anlam notu** ekliyor: "sen", "siz (söz)", "siz (kulluk)", "sen (dua)". Uyaran ٱعْبُدُوا۟ iken doğru şık
"siz (kulluk)", çeldiricilerden biri "siz (söz)" oluyordu. Kişiyi doğru tanıyan öğrenci iki "siz" arasında ancak anlama bakarak seçebiliyordu;
soru kişiyi değil anlamı sınıyordu. g13/g15'te parantez **cinsiyettir** ("o (erkek)" / "o (kadın)") ve gerçek kişi bilgisidir.

## Yapılan (arayüzde görünen değişiklik)
- `app/core/quranLearn.js`:
  - `gramPersonKey(label)`: parantez notu cinsiyetse korunur, değilse (anlam notu) atılır.
  - `gramPersonRecipe` doğru cevabı ve şıkları kişi anahtarından kurar.
- **g17-k2:** şıklar artık "sen" / "siz" (emir tablosunda yalnız iki kişi var; `kaoGrammarTaskValid` ≥2 şıkka izin verir).
  Yönerge "Bu emir kime söylenmiş? **(tek kişiye mi, topluluğa mı?)**" oldu; öğrenci neye bakacağını biliyor.
- **g13/g15:** davranış aynı (bütün kişi anahtarları zaten tekil, cinsiyet korunur).
- Aynı kişiyi gösteren şıkları `choiceList` zaten tekilleştiriyor (doğru cevap önce girer). İlk sürümdeki ek tekilleştirme gereksizdi ve kaldırıldı;
  tarif yalnız "doğru kişiden ayrı bir kişi var mı" diye bakıyor, yoksa görev kurulmuyor (`gramUnsupported`).
- **Pin** `20261008c` → **`20261008d`**: index.html, sw.js (`SW_VERSION`, `SW_OFFLINE_VERSION`), panel-v2.html, 12 pin testi, `D3F-STATE.pins.release`.

## TDD
- RED (yeni kontrol "D3F-11 · kişi sorusunda şıklar yalnız kişidir…"): `g:g17:g17-k2 2026-09-29: şık anlam notu taşıyor: "siz (kulluk)"`.
  g13 ve g15 aynı kontrolden geçti (cinsiyet notu kişi sayıldı).
- GREEN: `test_kao2_grammar_tasks` 38/38.
- D3F-10'un pin tazeliği testi, pin yükseltilmeden önce bu değişikliği yakaladı: `app/core/quranLearn.js?v=20261008c … sonra çalışma ağacında değişti`
  (kabul A-9: 190/191). Pin `20261008d` olunca PASS. Kural 3 artık otomatik zorunlu.
- Pin sonrası: 12 pin testi + `test_kao2_kabul` + `test_kao2_grammar_tasks` ok · `driver.mjs` rc=0 · `zikr-harness.mjs` rc=0 · `tests/kao` 54/55
  (tek kırmızı pin öncesi A-9'du; pin sonrası kabul ok).
- Mutasyon: `bash kao2-duzeltme/denetim-3/evidence/D3F-11/kisi-mutasyon.sh` → **4/4 PASS**
  (M0 yeşil · M1 ham etiket → "şık anlam notu taşıyor" · M2 cinsiyet notu atılır → g13 kırmızı · M3 eski yönerge → "yönerge kişiyi … söylemiyor").
- **Eşdeğer mutant (dürüstlük):** ilk M3 ("aynı kişi iki şık olsun") hayatta kaldı. Neden `choiceList`'in etikete göre tekilleştirmesi;
  mutasyon davranışı değiştirmiyordu. Tarifteki gereksiz tekilleştirme kaldırıldı ve M3, test edilmeyen tek kısım olan yönergeye çevrildi.
  Bunun için teste yönerge iddiası eklendi.

## Bilerek değişen testler
- `test_kao2_grammar_tasks.js`:
  - C4 ve C11, kişi kavramlarında (g13/g15/g17) cevabı/şıkları satır etiketinin kişi kısmıyla (`personKey`) karşılaştırır.
    Eskiden "şık = ham satır etiketi" varsayıyorlardı.
  - `personKey` dosya başına taşındı.
  - Yeni D3F-11 kontrolü.
- 12 pin testi: `20261008c` → `20261008d`.

## Sınır
- Kişi anahtarı yalnız "erkek/kadın" notunu kişi bilgisi sayar. Tabloya başka bir kişi niteleyicisi (ör. "ikiniz") parantez içinde eklenirse
  bu kurala eklenmesi gerekir. Bugünkü tablolarda "ikiniz/ikisi" parantez dışında.
- g17-k2 artık iki şıklı (sen/siz); şans başarısı %50. Tabloya yeni emir kişileri (ör. "siz ikiniz") eklenmedikçe daha fazla şık dürüstçe kurulamaz.
- Cihazda görsel doğrulama yok (A-11/A-12 kullanıcıda).

## Kanıt düzeyleri
kaynak/test ✓ · yayın — (henüz yok; tam kapı ve kullanıcı talimatı bekliyor) · cihaz —
