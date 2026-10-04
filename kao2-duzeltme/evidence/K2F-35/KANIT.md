# K2F-35 — Küçük metin ve etiket düzeltmeleri
Tarih: 2026-10-04 · Dal: kao2-duzeltme · Önceki commit: 33c878c7 · Uygulayıcı: Claude Sonnet 5.5
Kapatılan bulgular: K4-04 · K3-09 · R değişimi: yok (10/10 korunur)

## İlerleme günlüğü
- [x] P1: sync PASS (35/44, seq 97), ağaç temiz, dal kao2-duzeltme; K2F-34 canlıda (main dc9743f4, pin 20261004c)
- [x] Kaynaklar bulundu: `progressRing` (Views ≈111), ünite ekranı `kao-unit-progress` (Views ≈236), `kaoMilestoneLabels` (≈440), `kaoPrayerLemmaIds`
- [x] Testler kırmızı: components/hub/path/milestones (4 dosya), onboarding yalnız başlık
- [x] Üretim kodu yazıldı; 5 test yeşil; path testinde unutulan `/100%/` iddiası da güncellendi
- [x] code-reviewer APPROVE; LOW (N=0 etiketi) kapatıldı + test
- [x] kapilar.sh YEŞİL, tekrar-uret 10/10

## Yapılan
- (a) `progressRing`: görünen metin ve aria-label Türkçe yüzde ("%20"); (b) ünite ekranı "x / y kalıcı kelime · a / b ders" (sayı yalnız kalıcı kelime); (c) `namaz` taşı etiketi "Namazda geçen N kelimeyi tanıyorum" (N = taşın gerçek koşulundaki doğrulanmış namaz kelimeleri; N=0 ise eski güvenli etiket); (d) onboarding test özeti "KAO2-11 onboarding" (handler başlığı zaten 45'e güncel). Yeni handler/CSS yok.

## TDD
- Kırmızı: `node tests/kao/test_kao2_components.js` → `AssertionError: ... did not match /role="img" aria-label="&lt;Tamamlanma&gt;: %0"/`; hub `halka = biten ders / ünite dersi`; path `... ilerlemesi: %20`; milestones `strictly equal` (namaz etiketi)
- Yeşil: components, hub (10), path (4), milestones (10), onboarding (28) PASS

## Kapılar (P3)
`bash kao2-duzeltme/tools/kapilar.sh` → SONUÇ: TÜM KAPILAR YEŞİL (kao 53 · app 77 · panel 23 · panel-v2 27 · quran 9 · reminders · driver · zikr · kontrast · l2-paket · plan-check · sync)
tekrar-uret: 10/10 PASS (önceki 10/10)

## Ölçümler
- Bütçe: runtime 116,270 → 116,365 KiB (tavan 128) · css 13,661 KiB değişmedi · içerik 183,544 KiB
- Ring çıktısında `\d%` biçimi 0 (test_kao2_components)

## Bilerek değişen testler
- test_kao2_components: `: 0%`/`: 100%` → `: %0`/`: %100` · Türkçe yüzde · K3-09
- test_kao2_hub: ring regex `: (\d+)%` → `: %(\d+)` · K3-09
- test_kao2_path: `ilerlemesi: 20%` → `: %20`; `/100%/` → `aria-label … %100`; `N kelime ·` → `N kalıcı kelime ·` · K3-09/K4-04
- test_kao2_onboarding: özet satırı "KAO2-12" → "KAO2-11 onboarding" · K3-09

## Kanıt düzeyleri
- Kaynak/test ✓ (bağımsız code-reviewer APPROVE, CRITICAL/HIGH/MEDIUM yok) · Yayın: yok · Cihaz: yok (kullanıcıda)

## Sürprizler / sonraki promptlara not
- K4-04'ün üçüncü maddesi (ardışık tekrar eden gramer görevi u01.02) K2F-35 Adımlar'ında yok; kapsam dışı olduğundan yapılmadı → LEDGER NOTE seq 99.
- K3-09'un "Bugün alt satırı 0 tekrar + 3 yeni" kısmı K2F-31'de kapanmıştı.
