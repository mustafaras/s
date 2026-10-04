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
- (a) `progressRing`: görünen metin ve aria-label Türkçe yüzde ("%20"); (b) ünite ekranı "x / y kalıcı kelime · a / b ders" (sayı yalnız kalıcı kelime); (c) `namaz` taşı etiketi "Namazda geçen N kelimeyi tanıyorum" (N = taşın gerçek koşulundaki doğrulanmış namaz kelimeleri; N=0 ise eski güvenli etiket); (c2) taşın koşul satırı "Bu N kelimenin hepsi 7 gün oturmuş olsun" (görüntüde yakalandı, FIX seq 100); (d) onboarding test özeti "KAO2-11 onboarding" (handler başlığı zaten 45'e güncel). Yeni handler/CSS yok.

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

## Ekran görüntüsü kanıtı (kullanıcı isteği, FIX seq 100)
Araç: `kao2-duzeltme/tools/gorsel-qa/shoot-k2f34-35.mjs` (soketsiz CDP, boş geçici profil, `127.0.0.1:9000`, token/parola yok, dış istekler kesildi; önce `tests/app/test_local_visual_qa_guard.js` yeşil). Önce = `git archive a352fa77`, sonra = çalışma ağacı; aynı sentetik veri (60 kelimelik kart + Ünite 1 / 1. ders bitmiş). Görüntü 390×844 @2×; yan yana sayfalar sol=ÖNCE, sağ=SONRA.
- [K35-1-halka-yuzde.png](ekran/K35-1-halka-yuzde.png): yol ekranında halka içi "0% / 20%" → "%0 / %20"
- [K35-2-kalici-kelime.png](ekran/K35-2-kalici-kelime.png): ünite satırı "6 / 23 kelime · 1 / 5 ders" → "6 / 23 kalıcı kelime · 1 / 5 ders", halka "%20"
- [K35-3-namaz-tasi.png](ekran/K35-3-namaz-tasi.png): Besmele + Fâtiha kazanılmışken sıradaki taş "Namazımı anlıyorum / Namaz metinlerindeki tüm kelimeler…" → "Namazda geçen 35 kelimeyi tanıyorum / Bu 35 kelimenin hepsi 7 gün oturmuş olsun"
- [K34-yerlestirme-okuma-8-soru.png](ekran/K34-yerlestirme-okuma-8-soru.png): 8 okuma sorusu önce/sonra. Önce: doğru şık 8/8 soruda en üstte; sonra: konumlar 1,3,3,2,2,1,1,3 ve her soruda üç şık aynı uzunlukta (log-sonra.txt: harf sayıları)
- Ham metin dökümü: [log-once.txt](ekran/log-once.txt), [log-sonra.txt](ekran/log-sonra.txt) (`blocked-external: 13` = tarayıcının istediği ama kesilen dış istekler)
- Sınır: sentetik veri + masaüstü Chrome (390 px görünüm); gerçek cihaz/telefon değil.

## Modal görsel QA (kullanıcı isteği, FIX seq 101)
Kanıt klasörü [modal-qa/](modal-qa/): `01-seviye0-ornek-kelimeler.png` (kullanıcının gönderdiği ekran ve 2 benzeri, önce/sonra), `02-arapca-hero-ve-kok.png`, `03-harf-kutulari-ve-unite-kutusu.png`, `04-gezinme-cubugu.png`, `05-kok-harfleri.png`; `tarama-once.txt` (21 bulgu) → `tarama-sonra-390.txt`, `tarama-sonra-320.txt` (0 bulgu, 227 kare). Hesaplanmış yazı boyutu ölçümü: kök harfleri 16 px → 28 px, yeni kelime Arapçası 17 px → ~47 px (12vw). Mutasyon: 7 CSS/JS değişikliğinin her biri geri alınınca test_kao2_modal_layout / onboarding / navigation kırıldı.
Sınır: sentetik veri + masaüstü Chrome (390 ve 320 px); gerçek cihaz değil. `blocked-external` sayacı (241) tarayıcının istediği ama kesilen dış istekleri sayar (ses/CDN); ağa çıkılmadı.

Son tur (FIX seq 103): açık sınırlar kapatıldı — `07-arapca-sik-liste-tablo.png` (Arapça şık/okuma listesi/harf tablosu/Kavram tablosu önce→sonra); `tarama-sonra-390.txt`, `-320.txt`, `tarama-acik-tema-390.txt` her biri 227 kare 0 bulgu. Gözle incelenen: S0 12 dersin tüm aşamaları, 4 ders akışı, ünite ekranları ve ana görünümler.
