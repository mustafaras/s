# K2F-22 — L1 onay taşıma (kullanıcı kapısı)
Tarih: 2026-10-02 · Dal: kao2-duzeltme · Önceki commit: 6896562e · Uygulayıcı: Claude Sonnet 5.5
Kapatılan bulgular: K5-04 (2/2) · M-01 (veri tarafı) · R değişimi: yok

## Onay kaynağı (dürüstlük notu)
- Onay **yapay zekâ incelemesinden** geldi: kullanıcı L1 incelemesini bu işi yapan ajana devretti; 26 bağımsız inceleme yapıldı, **iki bakışın da onayladığı 36 metin** işaretlendi. Kullanıcı ayrıca "dosyalara da işle" dedi ve kapsam genişlemesini (5 test) onayladı.
- `by:"owner"` kaydı bu **kullanıcı devrine** dayanır; kullanıcının her satırı tek tek okuduğu anlamına gelmez.
- **L2 (alan uzmanı, dinî bağlam) onayı AÇIK:** hiçbir `[x] L2` yok (ölçüldü: 0); L2'ye dokunulmadı.

## İlerleme günlüğü
- [x] P1: durum doğrulandı — dal kao2-duzeltme, 5 dosya `M` (INCELEME-KAO2-17.md, texts.tr.json, quranCurriculumV2.js, test_kao2_review_apply.js, test_kao2_text_review.js); işaretleme ve veri işlemesi oturum başında yarım kalmış olarak hazırdı
- [x] kural testi "sourced ⇔ işaretli kutu" test_kao2_review_apply.js içinde
- [x] KIRMIZI görüldü: 5 test (explain, hub, mastery, path, kao_render) Ünite 1 draft olduğundan ham metin beklediği için kırıldı
- [x] 5 test güvenli yedeğe göre güncellendi; gerçek metin görünürlüğü onaylı ders u01.04 ve onaylı Ünite 12 ile doğrulanıyor; uygulama kodu DEĞİŞMEDİ
- [x] kapilar.sh YEŞİL
- [x] sayılar araçla ölçüldü (aşağıda)

## Ölçüm (texts.tr.json, araçla)
| Tür | sourced | draft | toplam |
|---|---|---|---|
| Ünite | 1 | 11 | 12 |
| Ders | 27 | 82 | 109 |
| S0 | 8 | 4 | 12 |
| **Toplam** | **36** | **97** | **133** |
- sourced 36 = incelemede işaretli kutu 36 (1 ünite satırı + 35 ders/S0 satırı); hepsi `by:"owner"`. `at`: 24 kayıt 2026-10-02, 12 kayıt önceki onay tarihini (2026-09-29 ×10, 2026-09-30 ×2) korur.
- Onaylı ünite: yalnız Ünite 12. Ünite 1 dahil 11 ünite metni draft → ekranda "Ünite N".
- Onaylı Ünite 1 dersi: yalnız u01.04.

## TDD
- Kırmızı (5 test, uygulama değişmeden): `test_kao2_explain.js:68` /Fâtiha/ · `test_kao2_hub.js:76` "Sıradaki: Rahîm ve Hamd" · `test_kao2_mastery.js:592` "Fâtiha ünitesini bitirdim" · `test_kao2_path.js:65` /Fâtiha/ · `test_kao_render.js:287` /Fâtiha/
- Yeşil: aynı komutlar → explain 12 · hub 9 · mastery 45 · path 4 · render PASS
- Beklentiler zayıflatılmadı: draft metnin SIZMADIĞI da sınanır (`doesNotMatch`), onaylı metnin GÖRÜNDÜĞÜ ayrıca sınanır (Y-02b: u01.04 hedefi; path: onaylı Ünite 12 başlığı/vaadi).
- path ünite ekranı: "Çapa metin · Fâtiha" sûre adıdır (yapısal müfredat verisi, onay kapısına bağlı metin değil); sızıntı araması bu satır çıkarılarak yapılır ve satırın varlığı ayrıca doğrulanır.

## Kapılar (P3)
kapilar.sh: SONUÇ: TÜM KAPILAR YEŞİL (tests/kao 51 · app 77 · panel 23 · panel-v2 27 · quran 9 · reminders · driver · zikr · kontrast · plan-check · fix-sync --repro) · perf: content 185,012 KiB · runtime 111,391 KiB · css 13,560 KiB
tekrar-uret: 9/10 PASS (önceki 9/10; R-08 açık, K2F-23)

## Bilerek değişen testler
- test_kao2_explain.js: Y-02/Y-03 draft güvenli yedeğe göre; yeni Y-02b (onaylı ders) · gerekçe: Ünite 1 metinleri draft
- test_kao2_hub.js: (b) "Sıradaki: Ünite 1 · Ders 2 · N dk" · gerekçe: u01.02 draft
- test_kao2_mastery.js: D(c) "Ünite 1 ünitesini bitirdim" · gerekçe: Ünite 1 başlığı draft
- test_kao2_path.js: yol ve ünite ekranı · gerekçe: Ünite 1 draft; onaylı Ünite 12 gerçek metni sınanır
- test_kao_render.js: yol/ünite vaadi · gerekçe: Ünite 1 draft
- test_kao2_review_apply.js: yeni kural "sourced ⇔ işaretli kutu" · test_kao2_text_review.js: onaylı ünite örneği (Ünite 1 yerine kaynaklı olan)

## Kanıt düzeyleri
- Kaynak/test ✓ · Yayın YOK (değişen yayın varlığı: `quranCurriculumV2.js`; pin yükseltilmedi, yayın sonrası 20261001h) · Cihaz YOK

## Açık kalanlar / sonraki promptlara not
- **L2 uzman onayı açık** (dinî bağlamlı metinler).
- **97 draft metin düzeltme bekliyor.** Ret gerekçeleri: abartılı vaat, başlık-içerik uyuşmazlığı, yanlış sûre ataması, u1–u3 "why" alanında kaynaksız iddialar.
- Gözlem (bu committe değiştirilmedi): ders oynatıcı bağlam satırı draft ünite için "Ünite 1 · Ünite 1 · Ders 1 / 5" gösteriyor (güvenli ünite adı ile "Ünite N" ön eki çift). Ayrı karar gerekir.
- Araç notu: üretici sayfayı yeniden yazınca kutular sıfırlanır; kutular elle yeniden işlenmeli. Araç işaretsiz eski `sourced`'u `draft`'a düşürmez; bu işlem betikle yapıldı.
- Sonraki: K2F-23 (kullanıcı "geç" diyene kadar geçilmez).

## Ek iş (K2F-23 öncesi) — açık işlerin kapatılması · LEDGER seq 65
- Kullanıcı devri: sahip (L1) onayı ve "uzman" rolü Claude'a açıkça devredildi. Bu bir yapay zekâ incelemesidir; gerçek alan uzmanı (L2) onayı değildir.
- Sayılar (texts.tr.json): üniteler 12/12 · dersler 109/109 · S0 12/12 · kavramlar 25/25 sourced. Sûre tanıtımı (`surahs`, 20) bu incelemenin kapsamı dışında, draft kaldı (KR-5'te contextTr kaldırılacak).
- Düzeltilen içerik: 20 metin (ayrıntı LEDGER seq 65). Gerekçeler: mezhebe göre değişen "her rekât" iddiası, kanıtsız/abartılı vaat, s0.10 hedef–içerik uyuşmazlığı, 3 kavramda tek başına yanlış okunabilecek basitleştirme.
- Gramer: 83/86 → 86/86; g10-k3, g14-k2, g19-k3 doğrulanmış veriden kurulur (C13 testi).
- Kod: çift "Ünite" ön eki (f7194cb8).
- Kapılar: kapilar.sh YEŞİL.
