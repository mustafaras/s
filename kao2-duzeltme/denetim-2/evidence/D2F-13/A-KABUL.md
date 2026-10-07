# KAO2 · A-1…A-12 kabul ölçütleri (ölçüm)

Ölçüm: 2026-10-07T16:48:13Z · node tests/kao/test_kao2_kabul.js

| # | Ölçüt | Hedef | Ölçülen | Durum | Kanıt düzeyi |
|---|---|---|---|---|---|
| A-1 | Sıfır kullanıcı: modal açılışından ilk öğrenme kartına dokunuş (iki yol) | ≤3 | rahat okur 3 dokunuş → session/intro · harf bilmez 3 dokunuş → s0 (Aşama 1) | ✅ PASS | Fixture |
| A-2 | Her yeni lemmanın ilk görünümü tanış kartı (109 ders, gerçek oynatma) | %100 | 109/109 ders oynatıldı (onarım turları ayrı) · 1097 görev · 524 yeni lemma · ihlal 0 | ✅ PASS | Fixture |
| A-3 | Ekran başına dolgulu birincil düğme ve tek üst çubuk | ≤1 · NavBar ≤1 | 66 yüzey (17 görünüm × {boş, tohumlu} + ilk açılış 5 + ders aşamaları + panel-açık + ustalık + S0) · en çok 1 birincil · ihlal 0 | ✅ PASS | Fixture |
| A-4 | Her durumda tek, tanımlı sıradaki adım (9 durum + 12 ünite simülasyonu) | 9/9 durum · 12/12 ünite | durum 9/9 [onboarding→onboarding · s0-lesson→s0-lesson · daily→daily · night-review→night-review · rest→rest · mastery→mastery · next-unit→next-unit · repair→repair · warmup→warmup] · simülasyon ustalık sırası 1,2,3,4,5,6,7,8,9,10,11,12 · türler daily/mastery/next-unit/repair/rest · son "Tüm üniteler tamam ✓" | ✅ PASS | Fixture |
| A-5 | Müfredat bütünlüğü (lemma/kavram/sûre tanıtımı) | 524/25/20 | 524/524 lemma derse bağlı (ders listesinde doğrulandı) · 25/25 kavram bağlı, boş sayfa 0 · 20/20 sûre tanıtımı (tema + yer + âyet sayısı, render ile) | ✅ PASS | Fixture |
| A-6 | Eski veri güvenliği (kart/günlük/taş değerleri korunur) ve v1 kullanıcısı ilerleyebilir | eski değerler derin eşit · ders oynanır | 9 kök alan 9/9 korundu · ayarlar true · ders sonrası kayıp 0 · kart/işaret true · adım warmup (ders oynandı: true) | ✅ PASS | Fixture |
| A-7 | Tasarım sözleşmesi (06 §7 tamamı) | weights≤4 · deco/uppercase/serif 0 · kontrast 0 ihlal · switch bileşeni | weights=4 uppercase=0 deco=0 serif=0 · kontrast 0 ihlal (722 çift) · ayarlarda 6 switch, ham checkbox 0 | ✅ PASS | Fixture |
| A-8 | Cevap sonrası geri bildirim "Devam"a kadar görünür | %100 | cevap sonrası 3 çizimde görünür=true · panel açık=true · aynı görev=true · kaoContinue sonrası kapalı=true · ilerledi=true | ✅ PASS | Fixture |
| A-9 | Mevcut test aileleri gerçekten çalıştırıldı | hepsi yeşil (çıkış kodu 0) | 190/190 dosya çıkış 0 [kao 53 · app 77 · panel 23 · panel-v2 27 · quran 9 · reminders 1] | ✅ PASS | Fixture |
| A-10 | Bütçe ve süre (K-1) | runtime ≤128 · css ≤14 · content ≤256 KiB · p95 ≤40 ms | runtime 117.350 · css 13.035 · content 183.837 · p95 5.803 ms | ✅ PASS | Fixture |
| P10 | `App.kaoOpen()` gerçek KAO eylemine ulaşır; IIP ayrı yüzey | shim → motor + ayrı yüzey | kaoOpen true · role=dialog · aria-modal · IIP bağımsız | ✅ PASS | Fixture |
| A-11 | İlk hafta dönüş günleri ve ilk tekrar doğruluğu | ≥4/7 gün · ≥%80 | ölçülmedi | ⏳ | **Cihaz/kullanıcı** |
| A-12 | "Şimdi ne yapmalıyım?" anı | 0 | ölçülmedi | ⏳ | **Cihaz/kullanıcı** |

## P10 kapanış kabulü

| Kontrol | Ölçülen | Durum |
|---|---|---|
| `App.kaoOpen()` gerçek KAO eylemine ulaşır; IIP ayrı yüzey | kaoOpen true · role=dialog · aria-modal · IIP bağımsız | ✅ PASS |
