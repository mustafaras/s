# K2F-29 · Ayarlar 1/2 — gruplar ve Switch — KANIT

## İlerleme günlüğü
- [x] `settingsGroup` (Views) eklendi; `kaoSettingsHTML` yeniden kuruldu: Günlük hedef · Ses · Okuma · Gölgeleme · Görünürlük · Veri · Hakkında (Öğrenme grubu K2F-30'a bırakıldı)
- [x] beş aç/kapat ayarı `switchRow` (role="switch", aria-checked, track/thumb); etiket değer içermez
- [x] eski kart/h3/.kao-toggle CSS'i silindi, grup yüzeyi kuralları eklendi
- [x] kontrast aracı yeni yüzeye (`.kao-group-surface`, `.kao-group-footer`) taşındı: 776 çift, 0 eşik altı
- [x] testler yeni düzene uyarlandı (settings +3 kontrol, design_contract (f) bileşen sınar)

## Yapılan
- `quranLearnViews.js`: `settingsGroup`. `quranLearn.js`: `kaoSettingsHTML` gruplu. `kao.css`: grup yüzeyi/ayraç/iç boşluk; `.kao-settings section`, `.kao-settings h3`, `.kao-toggle` kuralları kalktı.
- Mevcut handler'lar yeniden kullanıldı; yeni handler yok (App.kao* 44 · yüzey 765 · atama 603).

## TDD
Test uyarlamaları kod değişikliğinden sonra yapıldı (kırmızı-önce değil): önce eski testler yeni HTML'de kırıldı (grup başlıkları, `: açık` metin düğmeleri, kontrast aracı seçicisi), sonra beklentiler spec'e göre yeniden yazıldı. Yeni kontroller: grup sırası, 5 anahtar × açık/kapalı durum, Okuma sırası, Veri/Hakkında/Gölgeleme footer.

## Kapılar (P3)
kapilar.sh YEŞİL (kao 53 · app 77 · panel 23 · panel-v2 27 · quran 9 · reminders · driver · zikr · kontrast · l2-paket · plan-check · sync) · tekrar-üret 10/10.

## Ölçümler
runtime 114,485 KiB (tavan 128) · css 13,420 KiB (tavan 14; K2F-28 sonrası 13,452 → kuralların kalkması pay açtı).

## Bilerek değişen testler
test_kao2_settings.js (grup sırası, switch, Okuma sırası) · test_kao2_design_contract.js ((f) bileşeni sınar; baseline dalındaki eski `missing===5` kaldırıldı — baseline tarihsel) · test_kao_requirements.js (anahtar eylemleri `&quot;` ile yazılır → decode) · test_kao_render.js (hub anahtarı, kaynaklar bağlantısı) · docs/kuran-ogreniyorum/tools/kao-verify-contrast.mjs (`.kao-settings section` yerine `.kao-group-surface`; ayar alt açıklaması satırı eklendi).

## Kanıt düzeyleri
kaynak/test ✓ · yayın — · cihaz — (gruplu yerleşim, anahtar görünümü, iç boşluklar gözlenmedi).

## Sürprizler / sonraki promptlara not
- `test_kao2_handler_surface.js` işaretlemedeki `App.kao*` adlarını kaynak metninden tarar; adı dinamik kuran yardımcılar "çağrılmayan tanım" sayısını şişirir → eylemler `{name:'kaoX'}` literaliyle yazıldı (K2F-30'da `kaoToggleAutoAdvance` için aynı).
- K2F-28 ek tur 3: ikinci inceleme `kaoStart`'ta eski `ui.kaoLesson` kalması gerilemesini buldu; K2F-29'dan önce ayrı commit'te (19f4d6ff) kapatıldı.

## Bağımsız inceleme (code-reviewer): CRITICAL/HIGH 0, MEDIUM 1, LOW 3
- **MEDIUM kapandı:** `.kao-group-surface{overflow:hidden}` switch odak halkasını kırpıyordu → yüzey içi satırlarda `outline-offset:-3px` (test eklendi).
- **LOW (bilerek açık):** ardışık switch satırları arasında ayraç yok (yüzeyde `>*+*` üst çizgi var, görsel QA cihazda); `.kao-switch-row` padding'i yalnız Ayarlar için; `settingsGroup` `kaoViewsApi()` kaydına bağlı (register zorunlu).
