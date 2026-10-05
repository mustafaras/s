# K2F-35 — Küçük metin ve etiket düzeltmeleri
Tarih: 2026-10-05 · Dal: claude/nifty-feynman-y2kva3 · Önceki commit: dc9743f · Uygulayıcı: Claude Sonnet 5.5
Kapatılan bulgular: K4-04 · K3-09 · R değişimi: yok (10/10 → 10/10)

## İlerleme günlüğü
- [x] P1: sync PASS, STATE in_progress
- [x] kırmızı testler yazıldı: hub (a), path (a,b), milestones (c); onboarding (d) yalnız özet satırı
- [x] üretim değişikliği: Views `progressRing` + `unitScreen`, `quranLearn.js` `kaoMilestoneLabels`/koşul metni
- [x] mutasyon: "kalıcı" sözcüğü geri alınınca path testi FAIL, geri konunca PASS
- [x] kapılar (aşağıda); ortam kaynaklı kırmızılar baseline ile karşılaştırıldı

## Yapılan
- (a) Halka görünür metni ve aria-label Türkçe yüzde: `%20`, `%100` (eskiden `20%`). Üç tüketici (hub, yol, ünite) tek `progressRing`ten geçer.
- (b) Ünite ekranı ilerleme satırı: "x / y kalıcı kelime · a / b ders" (sayı zaten yalnız kalıcı/settled kelimeleri sayıyordu; etiket artık bunu söylüyor).
- (c) `namaz` taşı etiketi doğrulanmış namaz lemmalarının gerçek sayısını söyler: "Namazda geçen N kelime tanıdık" (N=`kaoPrayerLemmaIds('namaz').length`); sıradaki-taş koşul metni "Namazda geçen N kelimenin tümü 7 gün oturmuş olsun". Sayı hesaplanamazsa eski etiket yedek kalır.
- (d) `test_kao2_onboarding.js` özet satırı "KAO2-11 onboarding"; handler sayacı başlığı zaten gerçek değerdeydi (45, assert 45).
- Yeni handler/CSS yok.

## TDD
- Kırmızı: `node tests/kao/test_kao2_hub.js` → "halka = biten ders / ünite dersi" (aria-label artık %N bekler); `test_kao2_path.js` → aria-label "%20" eşleşmedi; `test_kao2_milestones.js` → "etiket gerçek lemma sayısını söyler".
- Yeşil: dört dosya PASS (hub 10 · path 4 · milestones 9 · onboarding 28).

## Kapılar (P3)
- tests/kao: yalnız `test_kao2_perf_budget.js` (ve ona bağlı `test_kao2_kabul.js`) kırmızı → **bu ortamda baseline'da da kırmızı** (`git stash` ile ölçüldü: p95 8,8 ms vs tavan 5,09 ms; konteyner yavaş). Diğer tüm tests/kao PASS.
- tests/app: `test_deploy_surface_contract.js` (rsync bu ortamda yok), `test_profile_boundary.js`, `test_settings_boundary.js` (sığ klon: `git rev-parse --is-shallow-repository`=true, MON commitleri yok) → ortam kaynaklı, değişiklikle ilgisiz.
- `kao-plan-check`: planCheckBase d19b4576 sığ klonda bulunamıyor → ortam kaynaklı FAIL.
- panel 23 · panel-v2 27 · quran 9 · reminders · driver · zikr · kontrast · l2-paket · `fix-sync-check --repro` PASS.
tekrar-uret: 10/10 PASS (önceki 10/10)

## Ölçümler
- Hub/yol/ünite halkası: "N%" biçimi 0 (hub testi `\d%` taraması).
- Namaz kapsamı: lemma sayısı testte `30 ≤ N < 60` aralığında ölçülür ve etikete birebir yazılır.

## Bilerek değişen testler
- test_kao2_path.js: aria-label `20%` → `%20`; `/100%/` → `/%100/`; "kelime · a / b ders" → "kalıcı kelime · …" · Türkçe yüzde + belirsiz etiket · K3-09/K4-04
- test_kao2_hub.js: aria-label regex `(\d+)%` → `%(\d+)`; görünür halka metni %N eklendi · K3-09
- test_kao2_components.js (Dokun listesinde YOK; `progressRing` çıktısını doğrudan sınayan tek test, değişikliğin zorunlu sonucu): `0%`→`%0`, `100%`→`%100` + görünür metin kontrolü · K3-09 — sapma LEDGER'a yazıldı
- test_kao2_onboarding.js: özet satırı KAO2-12 → KAO2-11 · doğru kart numarası · K3-09

## Kanıt düzeyleri
- Kaynak/test: ✓ · Yayın: yok · Cihaz: yok (kullanıcıda)

## Sürprizler / sonraki promptlara not
- `test_kao2_components.js` Dokun listesinde değildi ama `progressRing`i doğrudan sınıyor; zorunlu güncelleme yapıldı (P1.6 sapması, gerekçeli).
- Bu ortam sığ klon + yavaş: K2F-36'nın A-9/A-10 ölçümleri (perf p95, plan-check tabanı) burada kırmızı çıkar; tam geçmişli/hızlı ortamda doğrulanmalı.

## Ek (kullanıcı: "tüm açıkları kapat", 2026-10-05)
- NOTE seq 96 kapatıldı: dinleme şıkları dönüşümlü (seq 98); test_kao2_onboarding 28→29.
- Ortam: `git fetch --unshallow` + rsync kurulumu → test_profile_boundary, test_settings_boundary, test_deploy_surface_contract, kao-plan-check artık PASS. Kalan tek kırmızı: perf göreli bandı (konteyner ~2× yavaş; test zayıflatılmadı).
