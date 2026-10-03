# K2F-28 · Odak modu — KANIT

## İlerleme günlüğü
- [x] navigation testi odak çubuğu beklentisiyle güncellendi; eski kod kırmızıydı (NavBar/`kao-lesson-exit` vardı)
- [x] `focusBar` (yalnız ✕, `aria-label="Dersten çık"`, ≥44 px) eklendi; `lessonScreen` ve `renderScreen('session')` kullanır
- [x] ✕ eylemi: ders açıkken `kaoLesson("exit")`, tekrar oturumunda `kaoSetView("home")`
- [x] yeni görev çizilince odak soruya gider (`kaoFocusQuestion`)

## Yapılan
- `quranLearnViews.js`: `focusBar`, session'da NavBar yerine odak çubuğu; ders başlığındaki adım yazısı ve "Kapat" metni kalktı.
- `quranLearn.js`: `renderScreen`'e `exit` eylemi, `kaoFocusQuestion`.
- `kao.css`: `.kao-focusbar`/`.kao-focus-exit` (eski `.kao-lesson-head/-step/-exit` yerine).

## TDD
Test önce güncellendi ve eski kodla kırmızıydı; ardından uygulama. Not: kırmızı görüş ayrıca kaydedilmedi, kod yazımı testten önce başladı (sıra gevşek).

## Kapılar (P3)
kapilar.sh YEŞİL: kao 53 · app 77 · panel 23 · panel-v2 27 · quran 9 · reminders · driver · zikr · kontrast · l2-paket · plan-check · sync · tekrar-üret 10/10.

## Ölçümler
runtime 114,054 KiB (tavan 128) · css 13,447 KiB (tavan 14) · p95 4,078 ms · App.kao* 44 (değişmedi).

## Bilerek değişen testler
test_kao2_navigation.js (oturum odak sözleşmesi) · test_kao2_view_resolution.js (session NavBar başlığı muaf) · test_kao_render.js (`.kao-focus-exit` 44 px).

## Kanıt düzeyleri
kaynak/test ✓ · yayın — · cihaz — (odak aktarımı ve ✕ boyutu gözlenmedi).

## Sürprizler / sonraki promptlara not
- Görev ekranında ilerleme çubuğu ✕ satırının altındadır (aynı satırda değil); spec "ince çubuk" şartını karşılar, yerleşim cihazda gözlenmedi.
- Odak aktarımı yalnız `paintTask` yolunda (yeni görev); ders aşamaları arası odak değişmedi.

## Ek tur (bağımsız code-reviewer: CRITICAL/HIGH 0, MEDIUM 3, LOW 3)
- **Kırmızı-önce kanıtlandı:** `2afd6830` kaynağıyla `test_kao2_navigation.js` "ders/0: NavBar/LargeTitle/eski başlık yok" ile kırıldı; mevcut kaynakla PASS (ağaç geri alındı, temiz).
- **MEDIUM-1 kapandı:** ✕ artık tek eylem `kaoLesson('exit')`; ders dışı oturumda da çalışır, bekleyen `kaoAdvanceTimer`'ı temizler, `kaoPanel`/`kaoUndo`/`kaoFeedback`'i sıfırlar, shadow'u temizler. Yeni handler yok (pinler aynı: 44/765/603).
- **MEDIUM-2 kapandı (kaynakta):** ✕ sonrası `focusDialog('sey-ov-card')`; "oturum tamam" ekranında `kaoFocusQuestion` h2'ye düşer. Odak davranışı gerçek tarayıcıda gözlenmedi.
- **MEDIUM-3 kapandı:** view_resolution'da yığın türetme testi session'ı yeniden kapsar; yeni test ✕ sonrası zamanlayıcı/panel temizliğini doğrular; tekrar oturumu ✕ onclick'i `kaoLesson("exit")`.
- **Bilerek açık (LOW):** `model.progress` ölü alan; ✕ adı bağlama göre sabit "Dersten çık"; geniş ekranda ✕ hizası; `kaoFocusQuestion` için birim testi yok (yalnız kod yolu).
- Ölçüm: runtime 114,184 KiB · css 13,447 KiB · kapılar YEŞİL · tekrar-üret 10/10.

## Ek tur 2 — LOW bulguları kapandı
- `model.progress` ölü alanı kaldırıldı.
- ✕ adı bağlama göre: derste "Dersten çık", tekrar/oturum tamam ekranında "Oturumdan çık" (`exitLabel`).
- `.kao-focusbar` içerikle aynı `max-width:460px; margin:0 auto` (geniş ekran hizası; cihazda gözlenmedi).
- `kaoFocusQuestion` testi `test_kao2_feedback.js`'te: yeni görevde odak + `tabindex=-1`, yeniden çizimde odak yok; mutasyonla (çağrı silinince) kırıldığı doğrulandı.
- Ölçüm: runtime 114,220 KiB · css 13,452 KiB · kapılar YEŞİL · tekrar-üret 10/10.

## Ek tur 3 — ikinci bağımsız inceleme (CRITICAL/HIGH 0, MEDIUM 1, LOW 2) kapandı
- **MEDIUM (gerileme):** ders ✕'inden sonra `kaoStart` eski `ui.kaoLesson`'u taşıyordu → tekrar oturumu "Dersten çık" adı alıyor ve ✕ eski dersin resume kaydını yeniden yazabiliyordu. `kaoStart` artık `ui.kaoLesson=null` yapar (devam bilgisi kayıtlı resume'dan gelir; `more` yolu zaten böyleydi). Test: ders→✕→tekrar senaryosu (etiket "Oturumdan çık", ders kaydı değişmez); mutasyonla (satır silinince) kırıldığı doğrulandı.
- **LOW:** ✕ çıkışı `kaoOrderDraft`'ı da sıfırlar. `kaoFocusQuestion` h2 yedeği test edildi.
- Ölçüm: runtime 114,274 KiB · css 13,452 KiB · kapılar YEŞİL · tekrar-üret 10/10.
