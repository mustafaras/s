# D3F-16 ek — F-20 (rapor dışı): KAO test düzeneği gerçek saati sızdırıyordu

Oturum: claude-opus-5-5 · 2026-10-09 · D3F-16 ek

## Bulgu
D3F-16 fixture turunda `tests/kao/test_kao2_grammar_tasks.js` D4 ("ilk görev parça dizme olmalı") kırmızı çıktı.
Temiz HEAD `7a4a0f6d` klonunda da kırmızıydı. Dün (2026-10-08) D3F-11 mutasyonunun M0'ı aynı testi yeşil koşmuştu.
Kod değişmeden test kendiliğinden kırmızıya dönmüştü.

## Kök neden
`tests/kao/helpers/kao-harness.js` başında "Saat yalnız parametre" yazıyor. Ama `bootKao` yalnız `todayStr`'yi `now`'a (varsayılan `2026-09-30`)
sabitliyor, VM'e ise **gerçek** `Date`'i veriyordu. `kaoStart` kuyruğu `new Date()` ile kurduğu için yeni kullanıcının ilk parça görevi
gerçek tarihe bağlıydı (`$TMPDIR` sondası, saat kaydırarak):

| VM saati | ilk görev |
|---|---|
| 2026-09-30 … 2026-10-08 | `fragment/order` · `s:95:4` |
| 2026-10-09 ve sonrası | `fragment/translate` · `s:95:5` |

Kod hatası değil, hermetik olmayan test düzeneğiydi.

**Etki:** `test_kao2_grammar_tasks`, onu yeniden koşan `test_kao2_kabul` A-9 (190/191) ve tam kapı (`kapilar.sh`) 2026-10-09'dan itibaren kırmızıydı.
Hızlı setteki D3F-11 mutasyonunun M0'ı da kırmızıydı. Bu durum her yayını engelliyordu.

## Yapılan
- `tests/kao/helpers/kao-harness.js`: `clockAt(now)`. VM'e `Date`'ten türeyen bir sınıf verilir: argümansız `new Date()` ve `Date.now()`
  `now` anından başlar ve gerçek süreyle ilerler (süre ölçümleri bozulmaz). Argümanlı `new Date(x)`, `Date.parse` ve `Date.UTC` değişmez.
  Düzeneği kullanan 17 test dosyası bu saati görür.
- `tests/kao/test_kao2_grammar_tasks.js`: yeni kontrol (D4'ün önünde). İki ayrı `now` için VM `Date.now()`/`new Date()` o ana oturur,
  görev kimliği `kao:<now tarihi>:` ile başlar ve `DEFAULT_NOW` için ilk parça görevi `order` olur (D4'ün ön koşulu açıkça yazılı).
- Üretim kodu (app/, index.html, sw.js) **değişmedi** → pin değişmedi (`20261008e`).

## TDD
- RED (`saat/red.txt`): `VM Date.now() 2026-09-30T12:00:00.000Z anından başlamalı (sapma 769665718 ms)` (≈8,9 gün gerçek saat sızıntısı).
- GREEN (`saat/green.txt`): `test_kao2_grammar_tasks` 39/39, D4 dahil.
- Düzenek kullanıcıları (17 dosya, gerçek saat, 2026-10-09 13:08–13:2x): **17/17 PASS** (kabul dahil)
- Mutasyon: `bash kao2-duzeltme/denetim-3/evidence/D3F-16/saat/saat-mutasyon.sh` → commit öncesi M0 yeşil + M1 (gerçek Date) kırmızı "anından başlamalı"; M2/M3 kullanıcı süre kararıyla yayın sırasında koşuldu, sonuç `YAYIN-9/YAYIN.md`te

## Tarih taraması (kısmi — kullanıcı kararıyla durduruldu)
Amaç, düzeneği kullanmayan ve kendi VM'ini kuran testlerde başka saat sızıntısı olup olmadığını görmekti. Sonda bir `--require` önyüklemesiydi:
argümansız `Date` + `Date.now` kayar, `Date`'i verilmemiş `vm.createContext` bağlamlarına da aynı saat verilir, `NODE_OPTIONS` ile alt süreçlere de geçer.
- 1. sürüm sonda (yalnız ana süreç): `test_kao_requirements` kırmızı göründü. Neden sondanın kendisiydi: test yatış saatini ana süreçten,
  kod VM'in kendi `Date`'inden okuyordu. VM'i kapsayan 2. sürümle yeşil. Gerçek kullanımda ikisi aynı saattir; bulgu değil.
- 2. sürüm, düzeltme sonrası, **yalnız 2026-09-30 tamamlandı** (yük 16): kırmızı yalnız `test_kao2_perf_budget`
  (p95 8,26 ms > göreli bant 5,09 ms; yük kaynaklı, açık karar `perf-goreli-bant`) ve `test_kao2_kabul`.
  Kabulün kırmızısı `tests/app/test_map_boundary.js`'ten geldi (KAO dışı); saat mi yük mü olduğu **ÖLÇÜLMEDİ**.
- Bugün ve ileri tarihler (2026-11-15, 2027-03-01, 2027-10-09) **ÖLÇÜLMEDİ**. Kullanıcı taramayı gereksiz bulup durdurdu (2026-10-09):
  "bunu beklememiz zorunlu mu hiç yapmayalım ztn çok fazla gereksiz test var".
  Sonuç: düzeneği kullanmayan ve kendi `Date`'ini veren testlerde (ör. `test_kao2_a11y`/`test_kao2_reader` boot'ları `todayStr` sabit,
  `Date` gerçek) ileride benzer bir saat sızıntısı **dışlanmadı**.

## Kanıt düzeyleri
kaynak/test ✓ · yayın — (test-only değişiklik; pin yok) · cihaz — (gerekmez)
