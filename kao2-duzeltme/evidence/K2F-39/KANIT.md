# K2F-39 — CSS ve ölü kod temizliği
Tarih: 2026-10-06 · Dal: claude/laughing-cori-o6ag6m (kao2-duzeltme içeriği) · Önceki commit: 9a86307c · Uygulayıcı: Claude Sonnet 5.5
Kapatılan bulgular: K3-04 · K6-07 · M-13 · K2-07 · R değişimi: yok (10/10 PASS)

## İlerleme günlüğü
- [x] P1: sync PASS (39/44, seq 115), prompt in_progress
- [x] Ölçüm (önce): kao.css 436 sınıf, **25 öksüz** (rapordaki 18 büyümüştü), 3 linear-gradient, `kao-audio-pending` 3 yerde, gzip(9) 14239 B (13,905 KiB)
- [x] Kırmızı kontrol: design_contract → `AssertionError: kao.css öksüz sınıf seçicileri: kao-hub-head kao-hub-seal … (25)`
- [x] Sil: 53 kural / 61 seçici kaldırıldı (betikli, yorum ve diğer metin korunur); degrade; ölü ad; testler; kontrast HOME
- [x] Görsel regresyon: 58 görüntü önce/sonra piksel karşılaştırması
- [x] Mutasyon: gerçek degrade, öksüz sınıf, ölü ad geri eklenince kontrol kırmızı

## Yapılan
- **Öksüz seçiciler (K3-04):** `kao-hub-head/seal/kicker/status/copy/path/foot · kao-home · kao-hero-copy · kao-night · kao-milestone · kao-summary · kao-time-chip · kao-undo · kao-unit-list/card/number/copy/side · is-suggested · kao-root-tree · kao-next-review · kao-today-ayah · kao-hub-ayah · kao-settings-group` içeren tüm seçiciler/kurallar silindi (53 kural, 61 seçici). Kontrol dinamik üretilen sınıfları (`'kao-screen-'+görünüm`, `kao-feedback-`, `kao-lesson-anchor-`…) önek+birleştirme biçimiyle tanır; ilk alt-dize taraması 35 aday göstermişti, 10'u dinamik olarak kullanılıyordu (kao-screen-unit(s), kao-feedback-success/warning, kao-lesson-anchor/apply-new/known, kao-unit-step-done/current) → bunlar KORUNDU.
- **Degrade (K6-07):** ilerleme çubuğu dolgusu `linear-gradient(90deg,…)` → düz `var(--quran-mid)`; `.kao-home .kao-hero` degradesi kuralıyla birlikte gitti. **Sapma (bilerek):** prompt "linear-gradient yok" der; NavBar'daki `linear-gradient(var(--kao-bg),var(--kao-bg)),var(--quran-surface)` degrade DEĞİL, tek renkli katman: `--quran-bg` alfa 0,10 olduğundan `--kao-bg` ≈ %89 opak, düz renge çevirmek içeriğin çubuğun altından görünmesini geri getirir (mevcut sözleşme K2F-… görsel QA bulgusu). Kontrol "aynı rengi iki kez veren katman hariç gerçek degrade yok" biçiminde.
- **Ölü sınıf (M-13):** `kao-audio-pending` hem eklenmesi (2 yer) hem `reveal` ile kaldırılması kalktı; `reveal` yalnız bu sınıfı kaldırıyordu → fonksiyon, `playing` dinleyicisi ve 150 ms zamanlayıcı da gitti (`error` dinleyicisi ve `kaoAudioFailed` davranışı aynı).
- **K2-07:** boş `.kao-header p{}`, tekrarlı `.kao-header`, ölü `.kao-toggle[aria-pressed]` — öksüz-sınıf taramasında zaten sıfırdı (K2F-27 ve öncesi sildi); kontrole `.kao-header` yokluğu eklendi.
- **Kontrast aracı:** `HOME` = `[DIALOG, ['.kao-hero-card','background']]` (Bugün'ün gerçek kartı); var olmayan `.kao-time-chip` ve `.kao-undo` çiftleri çıkarıldı (gerçek geri-al `kao-feedback-undo` otomatik taramada), `ICON_MARKS`'tan `.kao-hub-seal`.

## TDD
- Kırmızı: `node tests/kao/test_kao2_design_contract.js` → `AssertionError: kao.css öksüz sınıf seçicileri: kao-hub-head … kao-settings-group`
- Yeşil: aynı komut → PASS

## Kapılar (P3)
Paralel koşu (4 işçi, 189 test dosyası + reminders/driver/zikr/kontrast/l2-paket/plan-check/tekrar-uret) ve kabul testi sonuçları aşağıda/LEDGER'de.
tekrar-uret: 10/10 PASS (önceki 10/10)

## Ölçümler
- css gzip(9): **13,027 KiB (13340 B)**, önce 13,905 KiB (14239 B) → **−899 B**; ham 92588 → 86510 B. Kabul: "gzip küçüldü" ✓
- Kontrast: 722 çift, 0 ihlal (eşik altında).
- Görsel: 390 px, 58 görüntü önce/sonra: 57'si gürültü eşiğinde aynı (arka plan animasyonu); yalnız `v09-prayer` (Namazda ne diyorum) ilerleme çubuğu dolgusu degradeden düz renge (beklenen, K6-07).

## Bilerek değişen testler
- `tests/kao/test_kao_render.js` ≈397: `.kao-hub-seal, .kao-hub-path, .kao-hub-foot, .kao-time-chip, .kao-unit-card, .kao-root-tree` varlık zorunluluğu kaldırıldı → öksüz seçici zorunluluğu artık ters yönde (design_contract). Gerekçe: bu seçiciler işaretlemede yok · K3-04.
- `tests/kao/test_kao_render.js` ≈591: `.kao-unit-number` min-width/min-height zorunluluğu kaldırıldı (öğe yok) · K3-04; `.kao-prayer-line h3 span` korunur.

## Kanıt düzeyleri
- Kaynak/test ✓ · yerel görsel (390, önce/sonra) ✓ · Yayın: yok · Cihaz: yok (kullanıcıda)

## Sürprizler / sonraki promptlara not
- Raporun "18 öksüz seçici"si 25'e büyümüştü; alt-dize taraması dinamik sınıflarda yanlış pozitif verir (35) → kontrol önek+birleştirme tanır.
- NavBar'daki tek renkli katman degrade sayılmaz (opaklık gerekçesi); gelecekte "gradient yok" kontrolü yazan biri bunu bozmamalı.
- Yayın pini DEĞİŞMEDİ (P5); `app/kao.css` ve `quranLearn.js` canlıda eski halinde, bir sonraki yayında yeni pin.
