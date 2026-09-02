# Şeyma — app.js Monolit Bölümleme Uygulama Kataloğu

**60 prompt · 12 dalga · durum: ready · uygulanmış prompt: 0**

Bu katalog uygulama emri değildir. Kullanıcının yeni ve açık onayı yoksa hiçbir
MON promptu uygulanmaz. Onay sonrası da promptlar numara sırasıyla, tek yerel
commit olarak yürütülür. Satır numaraları yalnız canlı grep ipucudur.

## Ajan için ilk 60 saniye

    cat monolit-bolumlenme-plan/MON-STATE.json
    sed -n '1,240p' monolit-bolumlenme-plan/.anti-amnesia/CURRENT-STATE.md
    sed -n '1,120p' monolit-bolumlenme-plan/.anti-amnesia/LEDGER.md
    git status --short --branch && git log --oneline -5

blockedPrompt doluysa, active prompt yarımsa veya ilgili olmayan kirli değişim
varsa dur. Otomatik reset/checkout yapma. lastCompletedPrompt ile öncül kart
uyuşmuyorsa sonraki karta atlama. Her başarılı kartın yerel commit'i; kod,
MON-STATE.json, CURRENT-STATE.md, LEDGER ve cache-bust değişimini birlikte
taşır. Yerel commit push/merge/deploy yetkisi vermez.

## Ortak sözleşme S1–S8

| Sözleşme | Bağlayıcı kural |
|---|---|
| S1 — Ön koşul | Önceki prompt tamamdır, state zinciri tutarlıdır, canlı çıpalar ölçülmüştür. |
| S2 — I1–I6 | data, App yüzeyi, migrate, render grafiği, sync Guard 1/2 korunur; bir prompt bir geri alınabilir yerel commit'tir. |
| S3 — M1–M4 | app.js imza-koruyan delegeyi tutar; data/ui/dark ve dokuz atama app.js'tedir; sync callbackleri app.js sahibidir; FX korunur. |
| S4 — Veri güvenliği | Tarayıcı/gerçek profil/token/canlı localStorage yoktur; seyma-data yazılmaz; yalnız Node/VM ve sentetik fixture kullanılır. |
| S5 — Load güvenliği | Yeni IIFE yüklemede DOM, ağ, timer callbacki veya başka modül verisi okumaz; yalnız registry kurar. |
| S6 — Kanıt | Önce/sonra grep sayımları, hedef fixture ve driver dump karşılaştırması kayda geçer; PASS olmayan kart commit edilmez. |
| S7 — Yükleme | Her yeni app/core dosyası indexte reminderDelivery sonrası/SW inline öncesi, cache-bust ve iki harness FILES dizisinde aynı committe yer alır. |
| S8 — Handoff | State + CURRENT-STATE + append-only LEDGER aynı committe güncellenir; sapma/red/risk yazılır. |

### Kırmızı çizgiler MON-K1…K8

1. sync.js, panel, app/content, frozen reminder motorları, sw.js ve data taşıma kapsamı değildir.
2. window.data/ui/save snapshot ataması, dış modül data= yazımı ve 6079 finally zincirini kırmak yasaktır.
3. SeyOnSyncState/SeyOnSynced için getter-only tuzak ve sync.js değişikliği yasaktır.
4. App adı/imzası, inline onclick veya modal Tab/Shift+Tab/Escape sözleşmesi değişmez.
5. SeyAudio/SeyHaptics/SeyFx/SeyTimeTheme çağrı adı, guardı ve ayar anlamı değişmez.
6. Bir domain kartı yalnız bir yeni core registry taşır; komşu domain eklenmez.
7. Uydurma test/komut/başarı sayısı yazılmaz; dosya önce rg --files ile bulunur.
8. Kullanıcı onayı olmadan push, tag, merge, deploy, browser veya canlı veri eylemi yoktur.

### Delege ve registry standardı

Taşınan çağrılabilir gövde için app.js imza-koruyan shim bırakır:

    function example(a, b){ return window.SeymaExample.example.apply(null, arguments); }

Registry window.Seyma<Module>dir; app.js öncesi yüklenir ve yalnız fonksiyon
isimlerini kurar. Fonksiyon adı/imzası, this ve return korunur. Closure state
gerektiğinde modül yalnız B1 getterdan okur; mutasyon/rebind/app-owned handler
ince kabukta kalır. Karar net değilse durulur ve deliverable seçenekleri yazar.

### Ortak kapı setleri

- Çekirdek: syntax, modularization/faz-minus11, driver, zikr.
- State: çekirdek + verify-state-helper-boundary, verify-state-migration-boundary,
  verify-state-adapter-contract ve faz10 sync.
- Domain: çekirdek + ilgili Quran/reminder ailesi + premium suite.
- Tam: domain + panel/panel-v2, Quran, reminder smoke. Dosya yoksa komut uydurulmaz.

## Dalga haritası

| Dalga | Promptlar | Risk | Ayrı onay |
|---|---|---|---|
| 1 | MON-01..MON-06 | kanıt/karar | evet |
| 2 | MON-07..MON-10 | saf çekirdek | evet |
| 3 | MON-11..MON-15 | mutable state | evet |
| 4 | MON-16..MON-18 | sync köprüsü | evet |
| 5 | MON-19..MON-25 | manevi domain | evet |
| 6 | MON-26..MON-32 | bakım/terapi | evet |
| 7 | MON-33..MON-39 | arşiv/analiz/ayar | evet |
| 8 | MON-40..MON-43 | reminder/mesaj | evet |
| 9 | MON-44..MON-49 | render | evet |
| 10 | MON-50..MON-54 | App/boot | evet |
| 11 | MON-55..MON-57 | geçiş/regression | evet |
| 12 | MON-58..MON-60 | dokümantasyon/kapanış | evet |

## MON-01 · Soğuk başlangıç, baseline ve MON-S1 kararı

**Kimlik:** Öncül yok; sınıf: yapılandırma; kapılar: S1–S8, I1–I6, M1–M4.

**Amaç:** Canlı uygulama öncesi gerçekleri ve güvenli delege biçimini karar kanıtına dönüştürmek.

**Kapsam:** Yalnız deliverables/MON-S1-DELEGASYON-KARARI.md, state zinciri; app.js 2713, 4415–4431, 4964, 6079, 6271, 6726, 17021, 18857.

**Adım adım görev:** wc/rg ile baseline, dokuz data ataması, App sayımları, FX referansları ve FILES dizilerini ölç; thin shim/dependency bag/tam taşıma seçeneklerini karar ve red gerekçeleriyle kaydet. Ardından yalnız bu kartın kaynaklarını, cache-bust/FILES etkisini ve anti-amnesia zincirini güncelle; tek yerel committen önce tüm kapıları çalıştır.

**Yasaklar:** app.js, index.html, harness, test veya production kodu değişmez.

**Delege / registry erişimi:** Henüz registry yok; karar §M1 imza-koruyan Seyma<Module> standardını kilitler.

**Doğrulama:** wc -l app.js = 18957; B1 getter rg sonucu 7; App function sayımı 545; JSON parse ve git diff --check PASS.

**Kabul kriteri:** Karar belgesi canlı ölçüleri, 6079 takasını, strict-mode callback tuzağını ve onay sınırını içerir.

**Halt ve LEDGER protokolü:** Bir ölçüm güvenlik varsayımını bozarsa blockedPrompt=MON-01 ve LEDGER kanıtı. Başarısız/eksik kanıtı append-only LEDGERa yaz; stateyi gerçeğe göre blocked yap; kullanıcı yönü olmadan sonraki karta geçme.

## MON-02 · FX ve handler değişmezlik manifesti

**Kimlik:** Öncül MON-01; sınıf: yapılandırma; kapılar: S1–S8, I1–I6, M1–M4.

**Amaç:** Premium FX ve App yüzeyinin refactor boyunca ölçülebilir biçimde korunmasını sağlamak.

**Kapsam:** deliverables/MON-S2-FX-HANDLER-MANIFESTI.md; app.js FX satırları, App atamaları, inline onclick.

**Adım adım görev:** SeyAudio/SeyHaptics/SeyFx/SeyTimeTheme çağrılarını fonksiyon+guard ile listele; App function/tüm App./onclick ölçüm yöntemini ayır. Ardından yalnız bu kartın kaynaklarını, cache-bust/FILES etkisini ve anti-amnesia zincirini güncelle; tek yerel committen önce tüm kapıları çalıştır.

**Yasaklar:** FX API, ayar, CSS, app.js veya fixture değiştirme.

**Delege / registry erişimi:** Registry yok; yeni registrylerin FX motoruna doğrudan bağlanma yasağını kaydeder.

**Doğrulama:** rg -n Sey(Audio|Haptics|Fx|TimeTheme); tüm test_premium_*.js PASS.

**Kabul kriteri:** Manifest çağrı yeri, guard ve fixture eşleşmesini sıfır toleransla sabitler.

**Halt ve LEDGER protokolü:** Bir FX fixture FAIL veya çağrı açıklanamazsa dur. Başarısız/eksik kanıtı append-only LEDGERa yaz; stateyi gerçeğe göre blocked yap; kullanıcı yönü olmadan sonraki karta geçme.

## MON-03 · 24 modül sahiplik ve yükleme matrisi

**Kimlik:** Öncül MON-02; sınıf: yapılandırma; kapılar: S1–S8, I1–I6, M1–M4.

**Amaç:** Her gövdenin tek sahibini ve yönlü bağımlılığını uygulama öncesi kesinleştirmek.

**Kapsam:** deliverables/MON-S3-MODUL-SAHIPLIK-MATRISI.md; 24 hedef modül ve frozen reminder dörtlüsü.

**Adım adım görev:** Her hedefi korunacak/yeni gövde/app.js shim olarak etiketle; registry, bağımlılık, dalga, forbidden reverse dependency ve index sırasını yaz. Ardından yalnız bu kartın kaynaklarını, cache-bust/FILES etkisini ve anti-amnesia zincirini güncelle; tek yerel committen önce tüm kapıları çalıştır.

**Yasaklar:** Yeni dosya veya script tag ekleme.

**Delege / registry erişimi:** window.Seyma<Module>; shim return window.Seyma<Module>.x.apply(null, arguments).

**Doğrulama:** Matris 24 benzersiz hedef içerir; index core sırası kaynakla karşılaştırılır; git diff --check PASS.

**Kabul kriteri:** Tek fonksiyonun iki sahibi yok; M1–M4 çelişkisi yoktur.

**Halt ve LEDGER protokolü:** Çift sahiplik veya cycle çözülmezse MON-S3 güncellenmeden ilerleme yok. Başarısız/eksik kanıtı append-only LEDGERa yaz; stateyi gerçeğe göre blocked yap; kullanıcı yönü olmadan sonraki karta geçme.

## MON-04 · Harness üretim yükleme-paritesi

**Kimlik:** Öncül MON-03; sınıf: yapılandırma; kapılar: S1–S8, I1–I6, M1–M4.

**Amaç:** Node VM harness'lerini gerçek script sırasına güvenli biçimde hizalamak.

**Kapsam:** driver.mjs ve zikr-harness.mjs FILES dizileri; MON-S4 karar notu.

**Adım adım görev:** Index sırasını kaynak kabul et; mevcut core modüllerini her FILES dizisine üretim öncesi sırayla ekle; load-order assertion ekle. Ardından yalnız bu kartın kaynaklarını, cache-bust/FILES etkisini ve anti-amnesia zincirini güncelle; tek yerel committen önce tüm kapıları çalıştır.

**Yasaklar:** sync.js yüklemek, fetch çözmek, gerçek DOM/timer/browser kullanmak.

**Delege / registry erişimi:** Registryler app.js öncesi sadece yüklenir; çağrı yoktur.

**Doğrulama:** driver ve zikr PASS; iki FILES dizisi rg ile index sırasını karşılar.

**Kabul kriteri:** Ağ imkânsız kalır ve boot seti production sıraya yakındır.

**Halt ve LEDGER protokolü:** Parite için canlı ağ/DOM gerekirse bloke. Başarısız/eksik kanıtı append-only LEDGERa yaz; stateyi gerçeğe göre blocked yap; kullanıcı yönü olmadan sonraki karta geçme.

## MON-05 · Boundary fixture geçiş matrisi

**Kimlik:** Öncül MON-04; sınıf: yapılandırma; kapılar: S1–S8, I1–I6, M1–M4.

**Amaç:** Başlangıç assertionlarının hangi committe kasıtlı değişeceğini dürüstçe planlamak.

**Kapsam:** deliverables/MON-S5-FIXTURE-GECIS-MATRISI.md; modularization, faz-minus11, date-utils, helpers fixtures.

**Adım adım görev:** Her assertionın mevcut anlamını, değişeceği MON'u, yeni semantiğini ve aynı-commit fixture güncellemesini yaz. Ardından yalnız bu kartın kaynaklarını, cache-bust/FILES etkisini ve anti-amnesia zincirini güncelle; tek yerel committen önce tüm kapıları çalıştır.

**Yasaklar:** Gelecek modül veya fixture kodunu şimdi değiştirmek.

**Delege / registry erişimi:** Registry yok; kanıt sahipliği kararları kayıt altındadır.

**Doğrulama:** Dört mevcut boundary fixture PASS; matriste assertion grubu eksik değildir.

**Kabul kriteri:** Eski PASS ile yeni semantik kanıtı ayrıdır.

**Halt ve LEDGER protokolü:** Yeni semantik tarif edilemiyorsa dur. Başarısız/eksik kanıtı append-only LEDGERa yaz; stateyi gerçeğe göre blocked yap; kullanıcı yönü olmadan sonraki karta geçme.

## MON-06 · Dalga 1 kapanışı: ön-uçuş bütünlüğü

**Kimlik:** Öncül MON-05; sınıf: yapılandırma; kapılar: S1–S8, I1–I6, M1–M4.

**Amaç:** İlk gövde taşımadan önce karar, baseline ve güvenlik zincirini kapatmak.

**Kapsam:** Yalnız deliverables/MON-D1-ON-UCUS-RAPORU.md ve anti-amnesia zinciri.

**Adım adım görev:** MON-S1..S5 çapraz bağlantısını denetle; sonraki kartın açık kapsamını ve yeni kullanıcı onayı gereğini yaz. Ardından yalnız bu kartın kaynaklarını, cache-bust/FILES etkisini ve anti-amnesia zincirini güncelle; tek yerel committen önce tüm kapıları çalıştır.

**Yasaklar:** app/core, app.js, index veya test değişikliği.

**Delege / registry erişimi:** Registry yok.

**Doğrulama:** node --check app.js sync.js; driver; zikr; dört boundary; premium fixture ailesi PASS.

**Kabul kriteri:** 0 kod taşıması ve tam kanıtla Dalga 1 kapanmıştır.

**Halt ve LEDGER protokolü:** Bir ön-ucuş kapısı kırmızıysa blockedPrompt=MON-06. Başarısız/eksik kanıtı append-only LEDGERa yaz; stateyi gerçeğe göre blocked yap; kullanıcı yönü olmadan sonraki karta geçme.

## MON-07 · dateUtils: saf tarih gövdeleri

**Kimlik:** Öncül MON-06; sınıf: dateUtils; kapılar: S1–S8, I1–I6, M1–M4.

**Amaç:** Saf tarih fonksiyonlarını davranış değişmeden gerçek registry gövdelerine almak.

**Kapsam:** app/core/dateUtils.js; app.js 4768–4773 shimleri; index/FILES; date-utils fixture.

**Adım adım görev:** Bağımlılık envanteri çıkar; pad/fmt/todayStr/addDays/diffDays/shortDate gövdelerini taşı; aynı isim/imza/return shim bırak; cache-bust+FILES güncelle. Ardından yalnız bu kartın kaynaklarını, cache-bust/FILES etkisini ve anti-amnesia zincirini güncelle; tek yerel committen önce tüm kapıları çalıştır.

**Yasaklar:** dayIndexFor/activeDate/curDay, data/ui ve tarih algoritması değişmez.

**Delege / registry erişimi:** SeymaDateUtils.pad/fmt/todayStr/addDays/diffDays/shortDate.

**Doğrulama:** node --check iki dosya; test_date_utils_boundary 58/58; driver, zikr, modularization, faz-minus11 PASS.

**Kabul kriteri:** Altı shim yalnız registryye iner; bugun dump farkı yoktur.

**Halt ve LEDGER protokolü:** Saat dilimi veya string çıktısı değişirse kanıtla bloke. Başarısız/eksik kanıtı append-only LEDGERa yaz; stateyi gerçeğe göre blocked yap; kullanıcı yönü olmadan sonraki karta geçme.

## MON-08 · dateUtils: state-okur tarih yardımcıları

**Kimlik:** Öncül MON-07; sınıf: dateUtils; kapılar: S1–S8, I1–I6, M1–M4.

**Amaç:** Canlı B1 getter kullanarak tarih-uygulama köprüsünü ayırmak.

**Kapsam:** dateUtils registry; app.js 4774–4780 ve 6230 shimleri.

**Adım adım görev:** dayIndexFor/activeDate/curDay/dateLabelTR bağımlılıklarını taze SeymaState okumalarıyla taşı; reset/import sonrası test et. Ardından yalnız bu kartın kaynaklarını, cache-bust/FILES etkisini ve anti-amnesia zincirini güncelle; tek yerel committen önce tüm kapıları çalıştır.

**Yasaklar:** data/ui atama, getDay taşıma, tarih metni değişimi.

**Delege / registry erişimi:** SeymaDateUtils.dayIndexFor/activeDate/curDay/dateLabelTR.

**Doğrulama:** date-utils 58/58; verify-state-helper-boundary; driver/zikr; data= rg dokuz atama PASS.

**Kabul kriteri:** B1 tazeliği ve editDate önceliği korunur.

**Halt ve LEDGER protokolü:** SeymaState undefined yolu bootu etkilerse dur. Başarısız/eksik kanıtı append-only LEDGERa yaz; stateyi gerçeğe göre blocked yap; kullanıcı yönü olmadan sonraki karta geçme.

## MON-09 · helpers: saf görünüm üreticileri

**Kimlik:** Öncül MON-08; sınıf: helpers; kapılar: S1–S8, I1–I6, M1–M4.

**Amaç:** HTML yardımcılarını çıktı/onclick değiştirmeden registryye almak.

**Kapsam:** helpers; app.js 6107–6111/6195 shimleri; dump kanıtı.

**Adım adım görev:** segTabs/progBar/starRow/miniBars/statTile/collapsibleCardHTML bağımlılıklarını sınıflandır; resolver gerekiyorsa MON-S1 biçiminde kur; stringleri karşılaştır. Ardından yalnız bu kartın kaynaklarını, cache-bust/FILES etkisini ve anti-amnesia zincirini güncelle; tek yerel committen önce tüm kapıları çalıştır.

**Yasaklar:** Stil, aria metni, HTML sırası veya onclick stringi değişmez.

**Delege / registry erişimi:** SeymaHelpers altı görünüm üyesi.

**Doğrulama:** test_helpers_boundary 30/30; driver --dump bugun/rapor; zikr; premium PASS.

**Kabul kriteri:** Altı üretici ve dump çıktısı semantik olarak aynıdır.

**Halt ve LEDGER protokolü:** Closure bağımlılığı güvenli verilemiyorsa bloke. Başarısız/eksik kanıtı append-only LEDGERa yaz; stateyi gerçeğe göre blocked yap; kullanıcı yönü olmadan sonraki karta geçme.

## MON-10 · helpers: etkileşim yardımcıları ve saf çekirdek kapanışı

**Kimlik:** Öncül MON-09; sınıf: helpers; kapılar: S1–S8, I1–I6, M1–M4.

**Amaç:** Toast/confetti/haptic yardımcılarını guardlarını koruyarak ayırmak.

**Kapsam:** helpers; app.js 6417/6437/6448 shimleri; MON-D2 raporu.

**Adım adım görev:** Timer/DOM/haptic bağımlılıklarını lazy boundary ile taşı; legacy haptic ile SeyHaptics ayrımını koru; tam helper manifestini yaz. Ardından yalnız bu kartın kaynaklarını, cache-bust/FILES etkisini ve anti-amnesia zincirini güncelle; tek yerel committen önce tüm kapıları çalıştır.

**Yasaklar:** Yeni efekt, timer, notification veya gesture ekleme.

**Delege / registry erişimi:** SeymaHelpers.toast/confetti/haptic; toplam 12 üyelik yüzey.

**Doğrulama:** helpers 30/30; premium haptics/reduced-motion; driver/zikr; node --check PASS.

**Kabul kriteri:** 12 üyeli registry, FX/erişilebilirlik farkı olmadan kapanır.

**Halt ve LEDGER protokolü:** Manifest farkı varsa Dalga 3 başlamaz. Başarısız/eksik kanıtı append-only LEDGERa yaz; stateyi gerçeğe göre blocked yap; kullanıcı yönü olmadan sonraki karta geçme.

## MON-11 · state: bağımlılık keşfi ve MON-S6 mutasyon kararı

**Kimlik:** Öncül MON-10; sınıf: state; kapılar: S1–S8, I1–I6, M1–M4.

**Amaç:** En yüksek riskli state taşınmasından önce okunabilirlik, mutasyon ve ownership sınırını kilitlemek.

**Kapsam:** deliverables/MON-S6-STATE-MUTASYON-KARARI.md; migrate/getDay/createDefaultData ve dokuz rebind.

**Adım adım görev:** Her state fonksiyonunun okuma/yazma/closure/App handler ilişkisini çıkar; state registry seçenekleri ve rebind yasağını karar olarak yaz. Ardından yalnız bu kartın kaynaklarını, cache-bust/FILES etkisini ve anti-amnesia zincirini güncelle; tek yerel committen önce tüm kapıları çalıştır.

**Yasaklar:** Kod taşıma, migrate semantiği ve B1 getter değişikliği.

**Delege / registry erişimi:** SeymaState yalnız canlı getter okumalıdır; dış modül data= yazmaz.

**Doğrulama:** verify-state-* üçlüsü, test_faz10_sync, driver/zikr PASS.

**Kabul kriteri:** M2/M2prime ve 6079 finally davranışı karar belgesinde örnekle kanıtlıdır.

**Halt ve LEDGER protokolü:** Migrate bağımlılığı çözülemezse MON-11 bloke. Başarısız/eksik kanıtı append-only LEDGERa yaz; stateyi gerçeğe göre blocked yap; kullanıcı yönü olmadan sonraki karta geçme.

## MON-12 · state: migrate gövde aktarımı

**Kimlik:** Öncül MON-11; sınıf: state; kapılar: S1–S8, I1–I6, M1–M4.

**Amaç:** migrate davranışını eski/normal/gelecek sürüm köklerinde eşdeğer tutarak ayırmak.

**Kapsam:** app/core/state.js; app.js 4431 migrate shim; ilgili state fixture.

**Adım adım görev:** Migrate alt yardımcılarını envanterle; registry gövdesine taşı; future root fail-closed ve unknown-field davranışını fixture ile sabitle; app.js shim bırak. Ardından yalnız bu kartın kaynaklarını, cache-bust/FILES etkisini ve anti-amnesia zincirini güncelle; tek yerel committen önce tüm kapıları çalıştır.

**Yasaklar:** Schema alanı ekleme/silme, sanitize/sync değişimi, data rebind.

**Delege / registry erişimi:** SeymaState.migrate; app.js migrate imzası korunur.

**Doğrulama:** node --check; verify-state-migration-boundary; test_faz10_sync; driver/zikr; before-after sentetik snapshot PASS.

**Kabul kriteri:** Eski/normal/future sentetik kök sonuçları eşdeğerdir.

**Halt ve LEDGER protokolü:** Bir snapshot farkı veya future root açılması varsa dur. Başarısız/eksik kanıtı append-only LEDGERa yaz; stateyi gerçeğe göre blocked yap; kullanıcı yönü olmadan sonraki karta geçme.

## MON-13 · state: getDay gövde aktarımı

**Kimlik:** Öncül MON-12; sınıf: state; kapılar: S1–S8, I1–I6, M1–M4.

**Amaç:** Gün normalizasyonunu tüm nested default ve arşiv bağıyla eşdeğer tutmak.

**Kapsam:** state; app.js 4964 getDay shim; day template ve empty* bağımlılıkları.

**Adım adım görev:** Yeni gün/var gün pathlerini ayrı envanterle; getDay gövdesini taşı; tüm empty helper erişimlerini resolver ile koru; mutable day referansını kopyalama. Ardından yalnız bu kartın kaynaklarını, cache-bust/FILES etkisini ve anti-amnesia zincirini güncelle; tek yerel committen önce tüm kapıları çalıştır.

**Yasaklar:** Yeni day alanı, archive backfill, data= taşıma.

**Delege / registry erişimi:** SeymaState.getDay; app.js getDay shim.

**Doğrulama:** verify-state-migration-boundary; driver --dump bugun; zikr; sync fixture; node --check PASS.

**Kabul kriteri:** Yeni/var gün pathleri sentetik parity ile kanıtlıdır.

**Halt ve LEDGER protokolü:** Referans kimliği veya defaults değişirse bloke. Başarısız/eksik kanıtı append-only LEDGERa yaz; stateyi gerçeğe göre blocked yap; kullanıcı yönü olmadan sonraki karta geçme.

## MON-14 · state: createDefaultData aktarımı

**Kimlik:** Öncül MON-13; sınıf: state; kapılar: S1–S8, I1–I6, M1–M4.

**Amaç:** Başlangıç verisini ve start/reset öncesi varsayımları eşdeğer tutmak.

**Kapsam:** state; app.js 6726 createDefaultData shim; start/late boot çağrıları.

**Adım adım görev:** Default kök, settings ve tarih bağımlılıklarını çıkar; registry gövdesine taşı; onboarding/start/late-boot için sentetik boot testleri çalıştır. Ardından yalnız bu kartın kaynaklarını, cache-bust/FILES etkisini ve anti-amnesia zincirini güncelle; tek yerel committen önce tüm kapıları çalıştır.

**Yasaklar:** Varsayılan alan, settings değeri, reset handler data= satırı değiştirme.

**Delege / registry erişimi:** SeymaState.createDefaultData; app.js shim.

**Doğrulama:** verify-state-*; driver onboarding+seeded; zikr; test_faz10_sync PASS.

**Kabul kriteri:** Onboarding ve seeded render mevcut davranışı korur.

**Halt ve LEDGER protokolü:** Default kök hash/snapshot farkı varsa dur. Başarısız/eksik kanıtı append-only LEDGERa yaz; stateyi gerçeğe göre blocked yap; kullanıcı yönü olmadan sonraki karta geçme.

## MON-15 · state Dalga 3 kapanışı ve B1 yeniden-atama denetimi

**Kimlik:** Öncül MON-14; sınıf: state; kapılar: S1–S8, I1–I6, M1–M4.

**Amaç:** State geçişinin canlı getter, rebind ve strict-mode sınırlarını bağımsız kanıtla kapatmak.

**Kapsam:** MON-D3-STATE-RAPORU.md; state, app.js shims, fixture güncellemeleri.

**Adım adım görev:** Import/reset/unlock/6079/late-boot rebind senaryolarını sentetik çalıştır; all setter ownership grepini kaydet; state fixture geçişini LEDGER'a yaz. Ardından yalnız bu kartın kaynaklarını, cache-bust/FILES etkisini ve anti-amnesia zincirini güncelle; tek yerel committen önce tüm kapıları çalıştır.

**Yasaklar:** syncGlue/save, App handler gövdesi veya sync.js taşıma.

**Delege / registry erişimi:** SeymaState tam yüzey; data/ui/dark app.js sahibidir.

**Doğrulama:** verify-state üçlüsü; test_faz10_sync; driver/zikr; node --check; premium PASS.

**Kabul kriteri:** Dokuz atama app.js'te, registryde sıfır data=; B1 taze değer kanıtlıdır.

**Halt ve LEDGER protokolü:** Herhangi atama dış modüle kaçarsa blockedPrompt=MON-15. Başarısız/eksik kanıtı append-only LEDGERa yaz; stateyi gerçeğe göre blocked yap; kullanıcı yönü olmadan sonraki karta geçme.

## MON-16 · syncGlue: callback sahipliği envanteri

**Kimlik:** Öncül MON-15; sınıf: syncGlue; kapılar: S1–S8, I1–I6, M1–M4.

**Amaç:** Sync köprüsünü strict-mode yükleme hatası yaratmadan tasarlamak.

**Kapsam:** deliverables/MON-S7-SYNCGLUE-KARARI.md; app.js save 6271, SeyOnSyncState/SeyOnSynced; syncGlue.

**Adım adım görev:** Callback atama sırasını, save bağımlılıklarını, sync.js çağrılarını ve retry etkisini çıkar; callbacklerin app.js sahibi kalacağı kararını kilitle. Ardından yalnız bu kartın kaynaklarını, cache-bust/FILES etkisini ve anti-amnesia zincirini güncelle; tek yerel committen önce tüm kapıları çalıştır.

**Yasaklar:** sync.js, Guard 1/2, remote, token, gerçek localStorage değişmez.

**Delege / registry erişimi:** SeymaSave yalnız save gövdesine güvenli erişim; callback registryye alınmaz.

**Doğrulama:** test_faz10_sync; node --check app.js sync.js; driver PASS.

**Kabul kriteri:** Strict-mode getter trap riski ve callback ownership açıkça kanıtlanır.

**Halt ve LEDGER protokolü:** Callback atamasına müdahale gerekirse dur. Başarısız/eksik kanıtı append-only LEDGERa yaz; stateyi gerçeğe göre blocked yap; kullanıcı yönü olmadan sonraki karta geçme.

## MON-17 · syncGlue: save gövde aktarımı

**Kimlik:** Öncül MON-16; sınıf: syncGlue; kapılar: S1–S8, I1–I6, M1–M4.

**Amaç:** Save mantığını sync davranışını değiştirmeden registryye ayırmak.

**Kapsam:** app/core/syncGlue.js; app.js 6271 save shim; yalnız gerekli resolverlar.

**Adım adım görev:** save akışını local persistence/schedule/header state olarak böl; gövdeyi taşı; app.js shim ve callback atamalarını yerinde bırak; sanitizer sınırına dokunma. Ardından yalnız bu kartın kaynaklarını, cache-bust/FILES etkisini ve anti-amnesia zincirini güncelle; tek yerel committen önce tüm kapıları çalıştır.

**Yasaklar:** sync.js değişimi, SeyOnSyncState/SeyOnSynced taşınması, schedule semantiği değişimi.

**Delege / registry erişimi:** SeymaSave üzerinden save; callbacks app.js global atamasıdır.

**Doğrulama:** node --check; test_faz10_sync; driver save path; test_sync_large_file; premium fixtures PASS.

**Kabul kriteri:** Save imzası/return/schedule sırası ve callbacks değişmez.

**Halt ve LEDGER protokolü:** Sync fixture veya guard hash değişirse bloke. Başarısız/eksik kanıtı append-only LEDGERa yaz; stateyi gerçeğe göre blocked yap; kullanıcı yönü olmadan sonraki karta geçme.

## MON-18 · syncGlue Dalga 4 kapanışı

**Kimlik:** Öncül MON-17; sınıf: syncGlue; kapılar: S1–S8, I1–I6, M1–M4.

**Amaç:** State+sync çekirdeğini gerçek no-network kanıtıyla kapatmak.

**Kapsam:** MON-D4-STATE-SYNC-RAPORU.md ve anti-amnesia.

**Adım adım görev:** migrate/getDay/default/save manifestlerini; all resolverları; mock fetch/timer no-op kanıtını birleştir; fixture değişimlerini açıkla. Ardından yalnız bu kartın kaynaklarını, cache-bust/FILES etkisini ve anti-amnesia zincirini güncelle; tek yerel committen önce tüm kapıları çalıştır.

**Yasaklar:** Domain/render/App/production network değişimi.

**Delege / registry erişimi:** SeymaState/SeymaSave sahiplik tablosu.

**Doğrulama:** verify-state üçlüsü; faz10 sync; driver/zikr; node --check app.js sync.js PASS.

**Kabul kriteri:** State ve sync köprüsünde açık risk/uydurma PASS yoktur.

**Halt ve LEDGER protokolü:** Herhangi network çözülüyorsa ileri kartlara geçme. Başarısız/eksik kanıtı append-only LEDGERa yaz; stateyi gerçeğe göre blocked yap; kullanıcı yönü olmadan sonraki karta geçme.

## MON-19 · prayer domain modülü

**Kimlik:** Öncül MON-18; sınıf: prayer; kapılar: S1–S8, I1–I6, M1–M4.

**Amaç:** Namaz/vakit yardımcılarını tek load-safe registry altında ayırmak.

**Kapsam:** app/core/prayer.js; PRAYER_NAMES/PRAYER_CITIES, prayer cache/ensure helpers ve ilgili app.js shimleri.

**Adım adım görev:** Fonksiyon envanteri, content/date/state bağımlılıkları, fetch yalnız çağrıldığında kuralı; gövde+shim; index/FILES/cache-bust; ilgili dump karşılaştırması. Ardından yalnız bu kartın kaynaklarını, cache-bust/FILES etkisini ve anti-amnesia zincirini güncelle; tek yerel committen önce tüm kapıları çalıştır.

**Yasaklar:** Hicri content, sync.js, panel, GPS/browser gerçek çağrısı.

**Delege / registry erişimi:** SeymaPrayer; app.js imza shimi.

**Doğrulama:** node --check; driver; zikr; test_faz10_sync; premium fixtures PASS.

**Kabul kriteri:** Vakit cache ve permission/fetch lazy kalır; saygi dump farkı yoktur.

**Halt ve LEDGER protokolü:** Load-time fetch veya konum erişimi görülürse dur. Başarısız/eksik kanıtı append-only LEDGERa yaz; stateyi gerçeğe göre blocked yap; kullanıcı yönü olmadan sonraki karta geçme.

## MON-20 · zikir domain: motor

**Kimlik:** Öncül MON-19; sınıf: zikir; kapılar: S1–S8, I1–I6, M1–M4.

**Amaç:** Zikirmatik sayım/oturum motorunu preset ve FX sınırını koruyarak ayırmak.

**Kapsam:** app/core/zikir.js; seed, tap, history/settings motor gövdeleri ve shimler.

**Adım adım görev:** Motor/view ayrımını çıkar; state mutationları app-owned kabukta bırak; SeyAudio guides ve SeyHaptics çağrılarını manifestteki biçimde koru. Ardından yalnız bu kartın kaynaklarını, cache-bust/FILES etkisini ve anti-amnesia zincirini güncelle; tek yerel committen önce tüm kapıları çalıştır.

**Yasaklar:** Frozen zikir content değiştirme, yeni ses/haptic, render kabuğu taşıma.

**Delege / registry erişimi:** SeymaZikir motor üyeleri.

**Doğrulama:** node --check; zikr-harness; premium audio/haptics/voice; driver PASS.

**Kabul kriteri:** Zikir session, hedef, FX çağrı sayısı/guardı eşdeğerdir.

**Halt ve LEDGER protokolü:** Zikir fixture/dump farkı varsa bloke. Başarısız/eksik kanıtı append-only LEDGERa yaz; stateyi gerçeğe göre blocked yap; kullanıcı yönü olmadan sonraki karta geçme.

## MON-21 · zikir domain: görünüm ve hatim yüzeyleri

**Kimlik:** Öncül MON-20; sınıf: zikir; kapılar: S1–S8, I1–I6, M1–M4.

**Amaç:** Zikir view üreticilerini motoru bozmadan aynı registryde tamamlamak.

**Kapsam:** app/core/zikir.js; counter/preset/hatim/history/settings view gövdeleri.

**Adım adım görev:** HTML üreticilerini envanterle; view resolverlarını bağla; zikir tab dumpını öncesi/sonrası karşılaştır; inline handlers aynı kalır. Ardından yalnız bu kartın kaynaklarını, cache-bust/FILES etkisini ve anti-amnesia zincirini güncelle; tek yerel committen önce tüm kapıları çalıştır.

**Yasaklar:** Motor semantiği, content katalogu, render çekirdeği değişmez.

**Delege / registry erişimi:** SeymaZikir view üyeleri; app.js shimler.

**Doğrulama:** zikr-harness 95/95; driver; premium fixtures; node --check PASS.

**Kabul kriteri:** Zikir registry hem motor hem görünümde tek modüldür; modal/onclick farkı yoktur.

**Halt ve LEDGER protokolü:** View bağımlılığı render taşınmasını gerektirirse dur. Başarısız/eksik kanıtı append-only LEDGERa yaz; stateyi gerçeğe göre blocked yap; kullanıcı yönü olmadan sonraki karta geçme.

## MON-22 · quran domain modülü

**Kimlik:** Öncül MON-21; sınıf: quran; kapılar: S1–S8, I1–I6, M1–M4.

**Amaç:** Kur'an Yolculuğu state machineini idempotence ve transport sınırını koruyarak ayırmak.

**Kapsam:** app/core/quran.js; quranRandomVerseStart, request/delivery/response helpers ve shims.

**Adım adım görev:** Outbox/delivery/response ayrımını çıkar; read-only apply idempotenceini koru; UI handler kabuğunu app.jste bırak; index/FILES/cache-bust güncelle. Ardından yalnız bu kartın kaynaklarını, cache-bust/FILES etkisini ve anti-amnesia zincirini güncelle; tek yerel committen önce tüm kapıları çalıştır.

**Yasaklar:** quranTransportV1, data repo, workflow, Gmail/App Script, panel değişmez.

**Delege / registry erişimi:** SeymaQuran; App handlerlar ince shim/kabuk.

**Doğrulama:** node --check; tüm tests/quran/test_quran_*.js; driver/zikr; faz10 sync PASS.

**Kabul kriteri:** RequestId/surah normalize, 200→304→200 ve duplicate kanıtları PASS.

**Halt ve LEDGER protokolü:** Transport veya remote write ihtiyacı görülürse dur. Başarısız/eksik kanıtı append-only LEDGERa yaz; stateyi gerçeğe göre blocked yap; kullanıcı yönü olmadan sonraki karta geçme.

## MON-23 · saygi domain modülü

**Kimlik:** Öncül MON-22; sınıf: saygi; kapılar: S1–S8, I1–I6, M1–M4.

**Amaç:** Öncü/kıble/hicri/kandil yüzeyini content ve modal kontratını koruyarak ayırmak.

**Kapsam:** app/core/saygi.js; saygiHTML yardımcıları, wireSaygiReadGate, kıble/hicri/kandil shims.

**Adım adım görev:** Saygı/person/modal/reading bağlarını sınıflandır; mevcut content registryleri lazy oku; focus sözleşmesi ve saygi dumpını karşılaştır. Ardından yalnız bu kartın kaynaklarını, cache-bust/FILES etkisini ve anti-amnesia zincirini güncelle; tek yerel committen önce tüm kapıları çalıştır.

**Yasaklar:** saygiPeople/hijri content, prayer modülü, panel, modal altyapısı değişmez.

**Delege / registry erişimi:** SeymaSaygi.

**Doğrulama:** zikr-harness; test_modal_focus_containment; driver; premium fixtures PASS.

**Kabul kriteri:** Saygı/İman HTML ve keyboard contract farkı yoktur.

**Halt ve LEDGER protokolü:** Focus/aria veya content erişimi kırılırsa bloke. Başarısız/eksik kanıtı append-only LEDGERa yaz; stateyi gerçeğe göre blocked yap; kullanıcı yönü olmadan sonraki karta geçme.

## MON-24 · manevi domainler çapraz regression

**Kimlik:** Öncül MON-23; sınıf: kapanış; kapılar: S1–S8, I1–I6, M1–M4.

**Amaç:** Prayer/zikir/quran/saygi sınırlarını birbirine karıştırmadan kapatmak.

**Kapsam:** MON-D5-MANEVI-DOMAIN-RAPORU.md; yalnız kanıt ve durum zinciri.

**Adım adım görev:** Registry bağımlılık grafiğini kontrol et; zikir/quran/saygi dumps, prayer lazy load ve FX manifest farklarını kaydet. Ardından yalnız bu kartın kaynaklarını, cache-bust/FILES etkisini ve anti-amnesia zincirini güncelle; tek yerel committen önce tüm kapıları çalıştır.

**Yasaklar:** Yeni domain taşıma veya appSurface/render taşıma.

**Delege / registry erişimi:** Dört registry için yönlü dependency tablosu.

**Doğrulama:** node --check; driver; zikr; Quran ailesi; modal focus; premium ailesi PASS.

**Kabul kriteri:** Dört registryde circular dependency ve load-side-effect yoktur.

**Halt ve LEDGER protokolü:** Bir domain komşu registryye yazıyorsa dur. Başarısız/eksik kanıtı append-only LEDGERa yaz; stateyi gerçeğe göre blocked yap; kullanıcı yönü olmadan sonraki karta geçme.

## MON-25 · Dalga 5 kabul denetimi

**Kimlik:** Öncül MON-24; sınıf: kapanış; kapılar: S1–S8, I1–I6, M1–M4.

**Amaç:** Manevi dalganın yalnız davranış-koruyucu refactor olarak kapandığını kanıtlamak.

**Kapsam:** MON-D5-ACCEPTANCE.md, state/LEDGER.

**Adım adım görev:** Önce/sonra App/onclick/FX sayımlarını karşılaştır; kullanıcı onayı/ayrı deploy kapısını yeniden yaz. Ardından yalnız bu kartın kaynaklarını, cache-bust/FILES etkisini ve anti-amnesia zincirini güncelle; tek yerel committen önce tüm kapıları çalıştır.

**Yasaklar:** Kod veya fixture semantiği değiştirme.

**Delege / registry erişimi:** Registry yok; yalnız mevcut registry manifesti.

**Doğrulama:** Dalga 5 seti ve git diff --check PASS.

**Kabul kriteri:** Acceptance raporu mevcut kanıtın sınırını açıkça ayırır.

**Halt ve LEDGER protokolü:** Her sayı tolerans dışındaysa blockedPrompt=MON-25. Başarısız/eksik kanıtı append-only LEDGERa yaz; stateyi gerçeğe göre blocked yap; kullanıcı yönü olmadan sonraki karta geçme.

## MON-26 · motivation domain modülü

**Kimlik:** Öncül MON-25; sınıf: motivation; kapılar: S1–S8, I1–I6, M1–M4.

**Amaç:** Terapi Odası görev ve overlay yüzeyini oda erişilebilirliği korunarak ayırmak.

**Kapsam:** app/core/motivation.js; roomOverlayHTML, roomBodyHTML, task/tamamlama shims.

**Adım adım görev:** Task/state/overlay bağımlılıklarını çıkar; app-owned mutation kabuğunu koru; narrative/content lazy resolver; dump/focus regression. Ardından yalnız bu kartın kaynaklarını, cache-bust/FILES etkisini ve anti-amnesia zincirini güncelle; tek yerel committen önce tüm kapıları çalıştır.

**Yasaklar:** motivation content, profile, crisis, render çekirdeği değişmez.

**Delege / registry erişimi:** SeymaMotivation.

**Doğrulama:** test_motivation_room_accessibility; driver; node --check; premium PASS.

**Kabul kriteri:** Oda modalı, görev tamamlama ve focus path eşdeğerdir.

**Halt ve LEDGER protokolü:** Content veya focus farkı varsa dur. Başarısız/eksik kanıtı append-only LEDGERa yaz; stateyi gerçeğe göre blocked yap; kullanıcı yönü olmadan sonraki karta geçme.

## MON-27 · crisis domain modülü

**Kimlik:** Öncül MON-26; sınıf: crisis; kapılar: S1–S8, I1–I6, M1–M4.

**Amaç:** Kriz odası ve craving yönetimini güvenlik metni/handler sınırını koruyarak ayırmak.

**Kapsam:** app/core/crisis.js; CRISES, openCrisis, crisis modal ve craving helpers.

**Adım adım görev:** Güvenlik kritik copy/handlerları envanterle; state writes app kabuğunda; HTML/gating parity kanıtı. Ardından yalnız bu kartın kaynaklarını, cache-bust/FILES etkisini ve anti-amnesia zincirini güncelle; tek yerel committen önce tüm kapıları çalıştır.

**Yasaklar:** Yeni klinik öneri, reminder, network veya modal altyapısı değişmez.

**Delege / registry erişimi:** SeymaCrisis.

**Doğrulama:** driver --dump sos; modal focus; node --check; test_faz10_sync PASS.

**Kabul kriteri:** Kriz yüzeyi davranış/kopya korunarak yüklenir.

**Halt ve LEDGER protokolü:** SOS dump veya handler farkında blokla. Başarısız/eksik kanıtı append-only LEDGERa yaz; stateyi gerçeğe göre blocked yap; kullanıcı yönü olmadan sonraki karta geçme.

## MON-28 · journal domain modülü

**Kimlik:** Öncül MON-27; sınıf: journal; kapılar: S1–S8, I1–I6, M1–M4.

**Amaç:** Günlük Işığı ve terapi notlarını storage semantiği değişmeden ayırmak.

**Kapsam:** app/core/journal.js; journalLightCardHTML, journalModalHTML, saveJournal shims.

**Adım adım görev:** Text/count/streak/savedAt bağımlılıklarını çıkar; mutation/save çağrısı app kabuğunda; modal focus ve bugun dump karşılaştır. Ardından yalnız bu kartın kaynaklarını, cache-bust/FILES etkisini ve anti-amnesia zincirini güncelle; tek yerel committen önce tüm kapıları çalıştır.

**Yasaklar:** Data schema, sync.js, profile/motivation değişmez.

**Delege / registry erişimi:** SeymaJournal.

**Doğrulama:** driver --dump bugun; modal focus; test_faz10_sync; node --check PASS.

**Kabul kriteri:** Journal save sırası ve görünüm eşdeğerdir.

**Halt ve LEDGER protokolü:** Word/count veya save order farkı varsa dur. Başarısız/eksik kanıtı append-only LEDGERa yaz; stateyi gerçeğe göre blocked yap; kullanıcı yönü olmadan sonraki karta geçme.

## MON-29 · health domain: veri ve hesaplama gövdeleri

**Kimlik:** Öncül MON-28; sınıf: health; kapılar: S1–S8, I1–I6, M1–M4.

**Amaç:** Su, uyku, beslenme, kafein, magnezyum, adım ve ölçüm hesaplarını tek sağlık registryde ayırmak.

**Kapsam:** app/core/health.js; hesaplayıcılar, empty/helper erişimleri ve shimler.

**Adım adım görev:** Alt alan bağımlılık haritası çıkar; saf hesaplamaları taşı; data mutasyonunu kabukta tut; dateUtils resolverı kullan. Ardından yalnız bu kartın kaynaklarını, cache-bust/FILES etkisini ve anti-amnesia zincirini güncelle; tek yerel committen önce tüm kapıları çalıştır.

**Yasaklar:** Alan/schema değişimi, panel, sync, yeni sağlık tavsiyesi yok.

**Delege / registry erişimi:** SeymaHealth hesaplama üyeleri.

**Doğrulama:** driver; test_faz10_sync; test_today_card_preferences; premium PASS.

**Kabul kriteri:** Hesaplama sonuçları sentetik örneklerde eşdeğerdir.

**Halt ve LEDGER protokolü:** Herhangi sağlık değeri/limit farkı varsa bloke. Başarısız/eksik kanıtı append-only LEDGERa yaz; stateyi gerçeğe göre blocked yap; kullanıcı yönü olmadan sonraki karta geçme.

## MON-30 · health domain: kart ve sağlık sekmesi yüzeyleri

**Kimlik:** Öncül MON-29; sınıf: health; kapılar: S1–S8, I1–I6, M1–M4.

**Amaç:** Sağlık HTML üreticilerini hesaplama registrysiyle aynı modülde tamamlamak.

**Kapsam:** health; water/sleep/food/caffeine/magnesium/body cards ve saglikHTML bağımlıları.

**Adım adım görev:** Kart üreticilerini taşı; theme token/inline handler/dump parity kanıtı; app.js shimler. Ardından yalnız bu kartın kaynaklarını, cache-bust/FILES etkisini ve anti-amnesia zincirini güncelle; tek yerel committen önce tüm kapıları çalıştır.

**Yasaklar:** CSS, settings schema, report/render çekirdeği değişmez.

**Delege / registry erişimi:** SeymaHealth view üyeleri.

**Doğrulama:** driver --dump saglik; test_today_card_preferences; premium settings; node --check PASS.

**Kabul kriteri:** Sağlık kart sırası/kopyası/onClick sözleşmesi korunur.

**Halt ve LEDGER protokolü:** Dump veya accessibility farkında dur. Başarısız/eksik kanıtı append-only LEDGERa yaz; stateyi gerçeğe göre blocked yap; kullanıcı yönü olmadan sonraki karta geçme.

## MON-31 · health domain güvenlik ve migration denetimi

**Kimlik:** Öncül MON-30; sınıf: health; kapılar: S1–S8, I1–I6, M1–M4.

**Amaç:** Sağlık alt alanlarının migrate/getDay/sync ile olan yüksek hacimli bağını kapatmak.

**Kapsam:** MON-D6-HEALTH-RAPORU.md; health registry ve sentetik old-state örnekleri.

**Adım adım görev:** Her alt alan için absent/malformed/normal path kanıtı yaz; state ownershipi doğrula; panelin field yokluğunda kırılmadığını read-only fixturela kontrol et. Ardından yalnız bu kartın kaynaklarını, cache-bust/FILES etkisini ve anti-amnesia zincirini güncelle; tek yerel committen önce tüm kapıları çalıştır.

**Yasaklar:** Migrate davranışı değiştirme, panel source edit, gerçek kullanıcı verisi.

**Delege / registry erişimi:** SeymaHealth bağımlılık tablosu.

**Doğrulama:** verify-state-migration; faz10 sync; panel p3 root modules; driver PASS.

**Kabul kriteri:** Şema eklemeden health normalizasyonu eşdeğerdir.

**Halt ve LEDGER protokolü:** Panel veya migration FAIL ise blokla. Başarısız/eksik kanıtı append-only LEDGERa yaz; stateyi gerçeğe göre blocked yap; kullanıcı yönü olmadan sonraki karta geçme.

## MON-32 · Dalga 6 kapanışı: terapi ve bakım

**Kimlik:** Öncül MON-31; sınıf: kapanış; kapılar: S1–S8, I1–I6, M1–M4.

**Amaç:** Motivation/crisis/journal/health modüllerini çapraz UI ve state kanıtıyla kapatmak.

**Kapsam:** MON-D6-TERAPI-BAKIM-RAPORU.md; state zinciri.

**Adım adım görev:** Dört registry bağımlılık grafiği, modal focus, save/migration ve dump manifestlerini birleştir. Ardından yalnız bu kartın kaynaklarını, cache-bust/FILES etkisini ve anti-amnesia zincirini güncelle; tek yerel committen önce tüm kapıları çalıştır.

**Yasaklar:** Yeni modül, UX veya data alanı ekleme.

**Delege / registry erişimi:** Dört registry için yalnız dependency read contract.

**Doğrulama:** driver/zikr; motivation accessibility; modal focus; faz10 sync; premium PASS.

**Kabul kriteri:** Dalga 6 açık riskleri/ayrı device kabulü açıkça yazılıdır.

**Halt ve LEDGER protokolü:** Kritik modal/save farkı varsa ilerleme yok. Başarısız/eksik kanıtı append-only LEDGERa yaz; stateyi gerçeğe göre blocked yap; kullanıcı yönü olmadan sonraki karta geçme.

## MON-33 · library domain modülü

**Kimlik:** Öncül MON-32; sınıf: library; kapılar: S1–S8, I1–I6, M1–M4.

**Amaç:** Okuma/izleme/dinleme/öğrenme/soul arşivlerini tek registryde ayırmak.

**Kapsam:** app/core/library.js; hub/overlay/archive helpers ve shims.

**Adım adım görev:** Beş hubın entry/archive bağımlılığını çıkar; HTML ve app-owned entry mutations ayır; overlay focus/dump parity. Ardından yalnız bu kartın kaynaklarını, cache-bust/FILES etkisini ve anti-amnesia zincirini güncelle; tek yerel committen önce tüm kapıları çalıştır.

**Yasaklar:** Content, archive backfill 6079, panel ve sync değişmez.

**Delege / registry erişimi:** SeymaLibrary.

**Doğrulama:** driver --dump bugun; modal focus; test_daily_photo_history; node --check PASS.

**Kabul kriteri:** Hublar ve arşiv referans kimliği korunur.

**Halt ve LEDGER protokolü:** 6079 ya da archive sync değişirse dur. Başarısız/eksik kanıtı append-only LEDGERa yaz; stateyi gerçeğe göre blocked yap; kullanıcı yönü olmadan sonraki karta geçme.

## MON-34 · report domain modülü

**Kimlik:** Öncül MON-33; sınıf: report; kapılar: S1–S8, I1–I6, M1–M4.

**Amaç:** Rapor/istatistik/heatmap üreticilerini salt-okur analiz olarak ayırmak.

**Kapsam:** app/core/report.js; raporHTML yardımcıları, lastNDays/mood dağılımı/heatmap shims.

**Adım adım görev:** Read-only data erişimini doğrula; hesap/HTML gövdelerini taşı; rapor dumpını karşılaştır. Ardından yalnız bu kartın kaynaklarını, cache-bust/FILES etkisini ve anti-amnesia zincirini güncelle; tek yerel committen önce tüm kapıları çalıştır.

**Yasaklar:** Data mutation, map/health/settings taşıma, chart algoritması değişmez.

**Delege / registry erişimi:** SeymaReport.

**Doğrulama:** driver --dump rapor; node --check; premium fixtures; faz10 sync PASS.

**Kabul kriteri:** Rapor registry sıfır data= ve aynı KPI çıktısına sahiptir.

**Halt ve LEDGER protokolü:** KPI/heatmap farkı varsa bloke. Başarısız/eksik kanıtı append-only LEDGERa yaz; stateyi gerçeğe göre blocked yap; kullanıcı yönü olmadan sonraki karta geçme.

## MON-35 · map domain modülü

**Kimlik:** Öncül MON-34; sınıf: map; kapılar: S1–S8, I1–I6, M1–M4.

**Amaç:** Harita/konum/hava yüzeyini erişim ve network lazy sınırını koruyarak ayırmak.

**Kapsam:** app/core/map.js; haritaHTML/locationCard/weatherHeader ve helper shims.

**Adım adım görev:** Geolocation/fetch çağrılarını sadece user pathinde bırak; error code UIlarını koru; map dumpı ve load-side-effect kontrolü. Ardından yalnız bu kartın kaynaklarını, cache-bust/FILES etkisini ve anti-amnesia zincirini güncelle; tek yerel committen önce tüm kapıları çalıştır.

**Yasaklar:** Gerçek GPS/browser, hava API, panel veya permission davranışı değişmez.

**Delege / registry erişimi:** SeymaMap.

**Doğrulama:** driver --dump harita; test_local_visual_qa_guard; node --check PASS.

**Kabul kriteri:** Load-time GPS/fetch yoktur, tüm hata metinleri korunur.

**Halt ve LEDGER protokolü:** Herhangi eager permission/fetch görülürse dur. Başarısız/eksik kanıtı append-only LEDGERa yaz; stateyi gerçeğe göre blocked yap; kullanıcı yönü olmadan sonraki karta geçme.

## MON-36 · profile domain modülü

**Kimlik:** Öncül MON-35; sınıf: profile; kapılar: S1–S8, I1–I6, M1–M4.

**Amaç:** 174 maddelik profil assessment akışını frozen content ve privacy kontratıyla ayırmak.

**Kapsam:** app/core/profile.js; psychHTML/gate/scoring/UI shims; profile content salt-okur.

**Adım adım görev:** Consent/session/progress bağımlılıklarını çıkar; content registryye read-only bağlan; progress UI dumpını karşılaştır. Ardından yalnız bu kartın kaynaklarını, cache-bust/FILES etkisini ve anti-amnesia zincirini güncelle; tek yerel committen önce tüm kapıları çalıştır.

**Yasaklar:** profileAssessmentV1 içerik, sync merge, panel veya schema değişmez.

**Delege / registry erişimi:** SeymaProfile.

**Doğrulama:** driver; test_faz10_sync; panel p4 provenance; node --check PASS.

**Kabul kriteri:** Profil item/consent/progress semantics değişmeden registryye alınır.

**Halt ve LEDGER protokolü:** Privacy/consent farkı varsa blokla. Başarısız/eksik kanıtı append-only LEDGERa yaz; stateyi gerçeğe göre blocked yap; kullanıcı yönü olmadan sonraki karta geçme.

## MON-37 · settings domain modülü

**Kimlik:** Öncül MON-36; sınıf: settings; kapılar: S1–S8, I1–I6, M1–M4.

**Amaç:** Ayarlar görünümünü ve app-owned settings handlersını ayırmadan registryye almak.

**Kapsam:** app/core/settings.js; ayarlarHTML ve read-only builder shims.

**Adım adım görev:** Settings read/render bağımlılıklarını çıkar; FX toggles, prayer/hijri ve preference copyyi manifestle; handler mutationlarını app kabuğunda bırak. Ardından yalnız bu kartın kaynaklarını, cache-bust/FILES etkisini ve anti-amnesia zincirini güncelle; tek yerel committen önce tüm kapıları çalıştır.

**Yasaklar:** Settings alanı/varsayılanı, migrate, toggleSetting, sync sanitize değişmez.

**Delege / registry erişimi:** SeymaSettings yalnız render/read helperları.

**Doğrulama:** driver --dump ayarlar; premium settings; time-theme; node --check PASS.

**Kabul kriteri:** Ayarlar HTML ve FX gating aynı kalır; registry data= içermez.

**Halt ve LEDGER protokolü:** Her toggle veya default farkında dur. Başarısız/eksik kanıtı append-only LEDGERa yaz; stateyi gerçeğe göre blocked yap; kullanıcı yönü olmadan sonraki karta geçme.

## MON-38 · Dalga 7 regression: arşiv/analiz/ayar

**Kimlik:** Öncül MON-37; sınıf: kapanış; kapılar: S1–S8, I1–I6, M1–M4.

**Amaç:** Library/report/map/profile/settings ayrımını karşılıklı bağımlılık ve gizlilik açısından kapatmak.

**Kapsam:** MON-D7-ANALIZ-ARSIV-RAPORU.md; kanıt zinciri.

**Adım adım görev:** Registry graph, dump manifesti, profile privacy, map lazy call ve settings FX manifestini denetle. Ardından yalnız bu kartın kaynaklarını, cache-bust/FILES etkisini ve anti-amnesia zincirini güncelle; tek yerel committen önce tüm kapıları çalıştır.

**Yasaklar:** Kod/production değişikliği.

**Delege / registry erişimi:** Beş registry için dependency manifest.

**Doğrulama:** driver; faz10 sync; panel p3/p4; premium; node --check PASS.

**Kabul kriteri:** Tüm registryler load-safe ve ownership sınırındadır.

**Halt ve LEDGER protokolü:** Privacy ya da eager side effectte blokla. Başarısız/eksik kanıtı append-only LEDGERa yaz; stateyi gerçeğe göre blocked yap; kullanıcı yönü olmadan sonraki karta geçme.

## MON-39 · Domain ara-kapanış: 15 domain registry envanteri

**Kimlik:** Öncül MON-38; sınıf: kapanış; kapılar: S1–S8, I1–I6, M1–M4.

**Amaç:** Render/App geçişi öncesi bütün domain modüllerinin sahiplik/delege yüzeyini eksiksiz doğrulamak.

**Kapsam:** deliverables/MON-D7-DOMAIN-ENVANTERI.md; 15 domain registry.

**Adım adım görev:** Her domain için gövde sayısı, shim, resolver, fixture, dump tabı ve open risk satırı oluştur; orphan app.js fonksiyonlarını belirt. Ardından yalnız bu kartın kaynaklarını, cache-bust/FILES etkisini ve anti-amnesia zincirini güncelle; tek yerel committen önce tüm kapıları çalıştır.

**Yasaklar:** Render/appSurface kodu taşımak veya sayıları uydurmak.

**Delege / registry erişimi:** SeymaPrayer/Zikir/Quran/Saygi/Motivation/Crisis/Journal/Health/Library/Report/Map/Profile/Settings/Reminders/Messaging hedef tablosu.

**Doğrulama:** Tüm önceki domain kapıları tekrar PASS; App/onclick/FX manifest farkı sıfır.

**Kabul kriteri:** 15 domain hedefin her biri bir sahip ve kanıtla listelenmiştir.

**Halt ve LEDGER protokolü:** Orphan/çift sahiplik varsa dur. Başarısız/eksik kanıtı append-only LEDGERa yaz; stateyi gerçeğe göre blocked yap; kullanıcı yönü olmadan sonraki karta geçme.

## MON-40 · reminders domain: çalışma zamanı bağlantıları

**Kimlik:** Öncül MON-39; sınıf: reminders; kapılar: S1–S8, I1–I6, M1–M4.

**Amaç:** Frozen reminder motorlarının üzerine yalnız app runtime adaptörlerini taşımak.

**Kapsam:** app/core/reminders.js; reminder app runtime helpers/shims; docs/reminders otoritesi.

**Adım adım görev:** Önce reminder README/state/approval gate oku; catalog/engine/scheduler/delivery kullanımlarını envanterle; app adaptör gövdelerini taşı. Ardından yalnız bu kartın kaynaklarını, cache-bust/FILES etkisini ve anti-amnesia zincirini güncelle; tek yerel committen önce tüm kapıları çalıştır.

**Yasaklar:** Frozen reminder×4, notification permission, delivery, sync, production data ve release action değişmez.

**Delege / registry erişimi:** SeymaReminders runtime üyeleri; frozen registryler read-only.

**Doğrulama:** node tests/reminders/run-reminder-smoke.mjs; driver; privacy fixtures; node --check PASS.

**Kabul kriteri:** Reminders modülü frozen motorları kopyalamaz/değiştirmez ve releaseApproval korunur.

**Halt ve LEDGER protokolü:** Her release/native/sync davranış ihtiyacında blokla. Başarısız/eksik kanıtı append-only LEDGERa yaz; stateyi gerçeğe göre blocked yap; kullanıcı yönü olmadan sonraki karta geçme.

## MON-41 · reminders domain: UI merkezi

**Kimlik:** Öncül MON-40; sınıf: reminders; kapılar: S1–S8, I1–I6, M1–M4.

**Amaç:** Reminder UI üreticilerini frozen katalog ve privacy sözleşmesiyle ayrıştırmak.

**Kapsam:** reminders; Reminder Center/app UI shims; modal/dump kanıtı.

**Adım adım görev:** UI builder/handler sınırını çıkar; texti Catalogdan al; notification request çağrısı eklemeden registryye taşı; focus/smoke kontrolü. Ardından yalnız bu kartın kaynaklarını, cache-bust/FILES etkisini ve anti-amnesia zincirini güncelle; tek yerel committen önce tüm kapıları çalıştır.

**Yasaklar:** Katalog metni kopyalama, native permission, scheduler/delivery/sync implementasyonu.

**Delege / registry erişimi:** SeymaReminders view üyeleri.

**Doğrulama:** reminder smoke; reminder privacy; modal focus; driver; node --check PASS.

**Kabul kriteri:** UI registry sadece mevcut Catalog/API yüzeyini tüketir; privacy scanner PASS.

**Halt ve LEDGER protokolü:** Her token/notification/remote kullanımında dur. Başarısız/eksik kanıtı append-only LEDGERa yaz; stateyi gerçeğe göre blocked yap; kullanıcı yönü olmadan sonraki karta geçme.

## MON-42 · messaging domain modülü

**Kimlik:** Öncül MON-41; sınıf: messaging; kapılar: S1–S8, I1–I6, M1–M4.

**Amaç:** ÆON/Luna sohbetini uzun mesaj/scroll/attachment sınırları korunarak ayırmak.

**Kapsam:** app/core/messaging.js; mesajHTML, bubble helpers, conversation shims.

**Adım adım görev:** Mesaj render/state/attachment bağımlılıklarını çıkar; App handlersı kabukta bırak; expand persistence, scroll ve notification dedupe kanıtla. Ardından yalnız bu kartın kaynaklarını, cache-bust/FILES etkisini ve anti-amnesia zincirini güncelle; tek yerel committen önce tüm kapıları çalıştır.

**Yasaklar:** Ağ/provider key, token, panel, reminder, gerçek media değişmez.

**Delege / registry erişimi:** SeymaMessaging.

**Doğrulama:** test_aeon_message_expand; driver --dump mesaj; node --check; modal focus PASS.

**Kabul kriteri:** Uzun mesaj açık durumu ve sıralama eşdeğerdir.

**Halt ve LEDGER protokolü:** Conversation state veya attachment flow farkında bloke. Başarısız/eksik kanıtı append-only LEDGERa yaz; stateyi gerçeğe göre blocked yap; kullanıcı yönü olmadan sonraki karta geçme.

## MON-43 · Dalga 8 kapanışı: reminder ve messaging

**Kimlik:** Öncül MON-42; sınıf: kapanış; kapılar: S1–S8, I1–I6, M1–M4.

**Amaç:** Frozen reminder sınırı ile mesajlaşma stateinin birbirinden ayrık kaldığını doğrulamak.

**Kapsam:** MON-D8-REMINDER-MESAJ-RAPORU.md; anti-amnesia.

**Adım adım görev:** Reminder approval gate, privacy scanner, messaging expansion ve no-network kanıtını bir araya getir. Ardından yalnız bu kartın kaynaklarını, cache-bust/FILES etkisini ve anti-amnesia zincirini güncelle; tek yerel committen önce tüm kapıları çalıştır.

**Yasaklar:** Release/deploy/notification veya live account işlemi.

**Delege / registry erişimi:** SeymaReminders/SeymaMessaging bağımlılık tablosu.

**Doğrulama:** reminder smoke; reminder privacy; aeon expand; driver; faz10 sync PASS.

**Kabul kriteri:** İki registry de veri/remote yazmadan boot eder; ayrı gated eylemler açık yazılıdır.

**Halt ve LEDGER protokolü:** ReleaseApproval veya privacy failde dur. Başarısız/eksik kanıtı append-only LEDGERa yaz; stateyi gerçeğe göre blocked yap; kullanıcı yönü olmadan sonraki karta geçme.

## MON-44 · render: onboarding ve Bugün kabukları

**Kimlik:** Öncül MON-43; sınıf: render; kapılar: S1–S8, I1–I6, M1–M4.

**Amaç:** İlk tab render gövdelerini DOM/handler değişmeden render registryye almak.

**Kapsam:** app/core/render.js; onboardingHTML/bugunHTML ve app.js shimleri.

**Adım adım görev:** Render-data read sınırını çıkar; HTML gövdelerini taşı; root/app innerHTML ve App.go çağrı grafiğini değiştirmeden shimle; dump diff al. Ardından yalnız bu kartın kaynaklarını, cache-bust/FILES etkisini ve anti-amnesia zincirini güncelle; tek yerel committen önce tüm kapıları çalıştır.

**Yasaklar:** State, App handler, modal, CSS ve save değişmez.

**Delege / registry erişimi:** SeymaRender.onboardingHTML/bugunHTML.

**Doğrulama:** driver onboarding+seeded; driver --dump bugun; node --check; premium PASS.

**Kabul kriteri:** Onboarding/Bugün markup ve interaction smoke eşdeğerdir.

**Halt ve LEDGER protokolü:** Render call graph veya boot sırası farkında dur. Başarısız/eksik kanıtı append-only LEDGERa yaz; stateyi gerçeğe göre blocked yap; kullanıcı yönü olmadan sonraki karta geçme.

## MON-45 · render: Sağlık, Rapor ve Harita tab kabukları

**Kimlik:** Öncül MON-44; sınıf: render; kapılar: S1–S8, I1–I6, M1–M4.

**Amaç:** Üç bağımsız tab kabuğunu registryye alırken domain registry çağrılarını korumak.

**Kapsam:** render; saglikHTML/raporHTML/haritaHTML shimleri.

**Adım adım görev:** Her tabın domain registry resolverını sabitle; dumps ve tab switch smoke kontrolü; fallback HTML yolunu koru. Ardından yalnız bu kartın kaynaklarını, cache-bust/FILES etkisini ve anti-amnesia zincirini güncelle; tek yerel committen önce tüm kapıları çalıştır.

**Yasaklar:** Health/report/map gövdeleri, App.go, CSS, network davranışı değişmez.

**Delege / registry erişimi:** SeymaRender.saglikHTML/raporHTML/haritaHTML.

**Doğrulama:** driver --dump saglik/rapor/harita; map lazy guard; node --check PASS.

**Kabul kriteri:** Üç tabın markupı, tab seçimi ve lazy network sınırı korunur.

**Halt ve LEDGER protokolü:** Her registry cycle veya dump farkında blokla. Başarısız/eksik kanıtı append-only LEDGERa yaz; stateyi gerçeğe göre blocked yap; kullanıcı yönü olmadan sonraki karta geçme.

## MON-46 · render: Saygı ve Terapi kabukları

**Kimlik:** Öncül MON-45; sınıf: render; kapılar: S1–S8, I1–I6, M1–M4.

**Amaç:** Manevi/terapi render girişlerini focus ve rich content davranışıyla taşımak.

**Kapsam:** render; saygiHTML ve room/render entry shimleri.

**Adım adım görev:** Saygi/Motivation registry çağrılarını yalnız resolverla bağla; modal entry, ARIA ve dumps karşılaştır. Ardından yalnız bu kartın kaynaklarını, cache-bust/FILES etkisini ve anti-amnesia zincirini güncelle; tek yerel committen önce tüm kapıları çalıştır.

**Yasaklar:** Saygi/Motivation domain gövdeleri, content, keyboard contract değişmez.

**Delege / registry erişimi:** SeymaRender.saygiHTML ve terapi entryleri.

**Doğrulama:** zikr harness; motivation accessibility; modal focus; node --check PASS.

**Kabul kriteri:** Manevi/terapi renderingde focus veya content farkı yoktur.

**Halt ve LEDGER protokolü:** Modal ownership değişirse dur. Başarısız/eksik kanıtı append-only LEDGERa yaz; stateyi gerçeğe göre blocked yap; kullanıcı yönü olmadan sonraki karta geçme.

## MON-47 · render: Kitaplık, Ayarlar ve Mesaj tab kabukları

**Kimlik:** Öncül MON-46; sınıf: render; kapılar: S1–S8, I1–I6, M1–M4.

**Amaç:** Kalan domain tab girişlerini render registryde birleştirmek.

**Kapsam:** render; library/settings/mesaj tab builder shims.

**Adım adım görev:** Library/Settings/Messaging resolverları, inline handler manifesti ve dump eşitliğini kanıtla. Ardından yalnız bu kartın kaynaklarını, cache-bust/FILES etkisini ve anti-amnesia zincirini güncelle; tek yerel committen önce tüm kapıları çalıştır.

**Yasaklar:** Domain registry, settings data, message state, App handler değişmez.

**Delege / registry erişimi:** SeymaRender ilgili tab üyeleri.

**Doğrulama:** driver --dump ayarlar/mesaj; aeon expand; premium settings; node --check PASS.

**Kabul kriteri:** Tab kabukları aynı App yüzeyini çağırır.

**Halt ve LEDGER protokolü:** Onclick hash veya message persistence farkında blokla. Başarısız/eksik kanıtı append-only LEDGERa yaz; stateyi gerçeğe göre blocked yap; kullanıcı yönü olmadan sonraki karta geçme.

## MON-48 · render: header, nav ve overlay shell

**Kimlik:** Öncül MON-47; sınıf: render; kapılar: S1–S8, I1–I6, M1–M4.

**Amaç:** Uygulama iskeletini erişilebilirlik ve focus geri dönüşünü koruyarak taşımak.

**Kapsam:** render; appHeaderHTML/navHTML/overlay shell shims.

**Adım adım görev:** Header save state, nav labels, overlay dialog/breadcrumb girişlerini sınıflandır; HTML dump ve modal focus kanıtı al. Ardından yalnız bu kartın kaynaklarını, cache-bust/FILES etkisini ve anti-amnesia zincirini güncelle; tek yerel committen önce tüm kapıları çalıştır.

**Yasaklar:** Save semantiği, App.go, CSS, handler adı, backdrop kuralı değişmez.

**Delege / registry erişimi:** SeymaRender.appHeaderHTML/navHTML/overlayShell.

**Doğrulama:** driver; test_modal_focus_containment; node --check; premium reduced-motion PASS.

**Kabul kriteri:** Header/nav/overlay ARIA ve keyboard path eşdeğerdir.

**Halt ve LEDGER protokolü:** 44px/focus/escape farkında dur. Başarısız/eksik kanıtı append-only LEDGERa yaz; stateyi gerçeğe göre blocked yap; kullanıcı yönü olmadan sonraki karta geçme.

## MON-49 · render: modals ve render çekirdeği

**Kimlik:** Öncül MON-48; sınıf: render; kapılar: S1–S8, I1–I6, M1–M4.

**Amaç:** Son render fonksiyonlarını tek registryye alırken render çağrı grafiğini sabit tutmak.

**Kapsam:** render; modalsHTML/render shims; SeyTimeTheme guarded call.

**Adım adım görev:** modalsHTML/render akışını envanterle; root update, app innerHTML, overlay lifecycle ve guarded theme callı aynı sırada delege et; render count/DOM dump kanıtı. Ardından yalnız bu kartın kaynaklarını, cache-bust/FILES etkisini ve anti-amnesia zincirini güncelle; tek yerel committen önce tüm kapıları çalıştır.

**Yasaklar:** App boot/timer/handlerlar, timeTheme API, modal contract değişmez.

**Delege / registry erişimi:** SeymaRender.modalsHTML/render.

**Doğrulama:** driver+zikr; modal focus; premium time-theme/reduced-motion; node --check PASS.

**Kabul kriteri:** I4 call graph ve theme guard biçimi manifestle eşdeğerdir.

**Halt ve LEDGER protokolü:** Render recursion, focus veya theme farkında bloque. Başarısız/eksik kanıtı append-only LEDGERa yaz; stateyi gerçeğe göre blocked yap; kullanıcı yönü olmadan sonraki karta geçme.

## MON-50 · appSurface: günlük handler grubu

**Kimlik:** Öncül MON-49; sınıf: appSurface; kapılar: S1–S8, I1–I6, M1–M4.

**Amaç:** Günlük mood/habit/health App handler gövdelerini isim/imza koruyan yüzey registryye ayırmak.

**Kapsam:** app/core/appSurface.js; günlük App.* handler shims; App objesi app.jste kalır.

**Adım adım görev:** Handler envanteri ve inline caller listesi çıkar; gövdeleri registryye taşı; app.js atamalarında aynı function signature shim bırak. Ardından yalnız bu kartın kaynaklarını, cache-bust/FILES etkisini ve anti-amnesia zincirini güncelle; tek yerel committen önce tüm kapıları çalıştır.

**Yasaklar:** App object creation, data rebind handlers, render core veya new handler ekleme.

**Delege / registry erişimi:** SeymaAppSurface günlük handler üyeleri.

**Doğrulama:** driver interaction smoke; App function count baseline; onclick manifest; faz10 sync PASS.

**Kabul kriteri:** Her existing handler aynı isim/imza/return pathle çalışır.

**Halt ve LEDGER protokolü:** Bir handler aliası/this davranışı belirsizse dur. Başarısız/eksik kanıtı append-only LEDGERa yaz; stateyi gerçeğe göre blocked yap; kullanıcı yönü olmadan sonraki karta geçme.

## MON-51 · appSurface: domain handler grubu

**Kimlik:** Öncül MON-50; sınıf: appSurface; kapılar: S1–S8, I1–I6, M1–M4.

**Amaç:** Prayer/zikir/quran/saygi/motivation/crisis/journal handler kabuklarını domain registrylerle birleştirmek.

**Kapsam:** appSurface; domain App.* shimleri.

**Adım adım görev:** Her handleri tek domain registryye map et; mutation/save/render sırasını kaydet; handler-by-handler smoke/dump kanıtı. Ardından yalnız bu kartın kaynaklarını, cache-bust/FILES etkisini ve anti-amnesia zincirini güncelle; tek yerel committen önce tüm kapıları çalıştır.

**Yasaklar:** Domain gövdesi/frozen transport/notification veya new handler değişmez.

**Delege / registry erişimi:** SeymaAppSurface domain handler üyeleri.

**Doğrulama:** driver/zikr; Quran ailesi; reminder smoke; App/onclick manifest PASS.

**Kabul kriteri:** Handler surface değişmeden domain registryye yönlenir.

**Halt ve LEDGER protokolü:** Save/render sırası veya handler count farkında blokla. Başarısız/eksik kanıtı append-only LEDGERa yaz; stateyi gerçeğe göre blocked yap; kullanıcı yönü olmadan sonraki karta geçme.

## MON-52 · appSurface: overlay, arşiv ve ayar handler grubu

**Kimlik:** Öncül MON-51; sınıf: appSurface; kapılar: S1–S8, I1–I6, M1–M4.

**Amaç:** Library/profile/settings/messaging overlay handlerlarını modal/FX sınırını koruyarak taşımak.

**Kapsam:** appSurface; overlay/archive/settings/message shims.

**Adım adım görev:** Open/close, focus return, scroll/persistence ve settings toggle handler bağımlılıklarını envanterle; registry delegeyi uygula. Ardından yalnız bu kartın kaynaklarını, cache-bust/FILES etkisini ve anti-amnesia zincirini güncelle; tek yerel committen önce tüm kapıları çalıştır.

**Yasaklar:** Modal engine, FX API, settings schema, browser/native permission değişmez.

**Delege / registry erişimi:** SeymaAppSurface overlay handler üyeleri.

**Doğrulama:** modal focus; aeon expand; premium settings/voice; driver dumps PASS.

**Kabul kriteri:** Overlay lifecycle ve FX call manifesti eşdeğerdir.

**Halt ve LEDGER protokolü:** Focus/permission/FX farkında dur. Başarısız/eksik kanıtı append-only LEDGERa yaz; stateyi gerçeğe göre blocked yap; kullanıcı yönü olmadan sonraki karta geçme.

## MON-53 · appSurface: timer, listener ve foreground köprüleri

**Kimlik:** Öncül MON-52; sınıf: appSurface; kapılar: S1–S8, I1–I6, M1–M4.

**Amaç:** Polling/timer/event listener köprülerini load-time side effect yaratmadan ayırmak.

**Kapsam:** appSurface; timer kayıtları, online/pageshow/foreground handlers; app.js boot owner.

**Adım adım görev:** Timer ve listener sahiplik tablosu çıkar; callback gövdelerini registryye al, kayıt/teardown sırasını app.js kabuğunda koru; no-op VM kanıtı. Ardından yalnız bu kartın kaynaklarını, cache-bust/FILES etkisini ve anti-amnesia zincirini güncelle; tek yerel committen önce tüm kapıları çalıştır.

**Yasaklar:** Gerçek timer hızını, sync retry, network, browser listener türünü değiştirme.

**Delege / registry erişimi:** SeymaAppSurface callback üyeleri; kayıt app.js sahibidir.

**Doğrulama:** driver; test_aeon_message_expand; test_faz10_sync; node --check PASS.

**Kabul kriteri:** Timer registration sayısı/ordering ve no-network harness davranışı eşdeğerdir.

**Halt ve LEDGER protokolü:** Yeni callback, duplicate listener veya network side effectte blokla. Başarısız/eksik kanıtı append-only LEDGERa yaz; stateyi gerçeğe göre blocked yap; kullanıcı yönü olmadan sonraki karta geçme.

## MON-54 · appSurface: boot, App expose ve late-boot guard

**Kimlik:** Öncül MON-53; sınıf: appSurface; kapılar: S1–S8, I1–I6, M1–M4.

**Amaç:** En son boot akışını `window.App=App` sonrası atamaları koruyarak ayırmak.

**Kapsam:** appSurface; boot/start/late-boot callbacks; app.js 17021–18957 shims.

**Adım adım görev:** 17021 sonrası tüm App atamalarını envanterle; window.App expose sırası, bootstrap, late data guard ve initial renderı aynı sırada delege et; onboarding/seeded boot karşılaştır. Ardından yalnız bu kartın kaynaklarını, cache-bust/FILES etkisini ve anti-amnesia zincirini güncelle; tek yerel committen önce tüm kapıları çalıştır.

**Yasaklar:** App obje expose, B1 getters, data= sites, sync callbacks veya render contract değişmez.

**Delege / registry erişimi:** SeymaAppSurface boot üyeleri; window.App=App app.jste kalır.

**Doğrulama:** driver onboarding+seeded; zikr; App/onclick count; node --check PASS.

**Kabul kriteri:** Boot iki sentetik state ile aynıdır ve post-expose handlerlar kaybolmaz.

**Halt ve LEDGER protokolü:** window.App sırası/late guard farkında MON-54 bloke. Başarısız/eksik kanıtı append-only LEDGERa yaz; stateyi gerçeğe göre blocked yap; kullanıcı yönü olmadan sonraki karta geçme.

## MON-55 · Final index ve harness geçişi

**Kimlik:** Öncül MON-54; sınıf: entegrasyon; kapılar: S1–S8, I1–I6, M1–M4.

**Amaç:** Tüm registryleri production sırayla yükleyip VM harness paritesini son kez sağlamak.

**Kapsam:** index.html app/core script tags/cache-bust; iki FILES dizisi; modül syntaxları.

**Adım adım görev:** MON-S3 sırasını uygula; her yeni core için tag/versiyon/FILES eşlemesi denetle; app.js tagini thin shell aşamasında koru; script order audit raporu yaz. Ardından yalnız bu kartın kaynaklarını, cache-bust/FILES etkisini ve anti-amnesia zincirini güncelle; tek yerel committen önce tüm kapıları çalıştır.

**Yasaklar:** sync.js sırası, content/reminder tags, SW inline, panel manifest veya browser değişmez.

**Delege / registry erişimi:** Tüm Seyma registryleri app.js öncesi load-safe.

**Doğrulama:** Tüm app/core node --check; driver; zikr; script order rg PASS.

**Kabul kriteri:** Index ve iki harness aynı core zincirini yükler; sync.js en sonda kalır.

**Halt ve LEDGER protokolü:** Eksik cache-bust veya sıra farkında dur. Başarısız/eksik kanıtı append-only LEDGERa yaz; stateyi gerçeğe göre blocked yap; kullanıcı yönü olmadan sonraki karta geçme.

## MON-56 · Delege ve eski gövde tamlık envanteri

**Kimlik:** Öncül MON-55; sınıf: entegrasyon; kapılar: S1–S8, I1–I6, M1–M4.

**Amaç:** app.jste yalnız planlı shim/kabuk kaldığını ve hiçbir gövdenin iki kez yaşamadığını kanıtlamak.

**Kapsam:** deliverables/MON-D11-DELEGE-ENVANTERI.md; tüm core/app.js.

**Adım adım görev:** Her registry üyeleri, shim satırı, eski gövde yokluğu, forbidden direct dependency ve app-owned exceptionları listele; duplicate/orphan taraması yap. Ardından yalnız bu kartın kaynaklarını, cache-bust/FILES etkisini ve anti-amnesia zincirini güncelle; tek yerel committen önce tüm kapıları çalıştır.

**Yasaklar:** Yeni behavior, minification, otomatik kod temizliği veya app.js kaldırma.

**Delege / registry erişimi:** 24 hedef registry/owner tablosu.

**Doğrulama:** rg function/App/data=; modularization fixture; App/onclick/FX manifest; git diff --check PASS.

**Kabul kriteri:** Her taşınan üyenin tek sahibi, her exceptionın karar referansı vardır.

**Halt ve LEDGER protokolü:** Duplicate veya orphan bulunursa MON-56 bloke. Başarısız/eksik kanıtı append-only LEDGERa yaz; stateyi gerçeğe göre blocked yap; kullanıcı yönü olmadan sonraki karta geçme.

## MON-57 · Tam regression ve performans sınırı

**Kimlik:** Öncül MON-56; sınıf: entegrasyon; kapılar: S1–S8, I1–I6, M1–M4.

**Amaç:** Refactor tamamını no-network regressionla dürüstçe kapatmak.

**Kapsam:** MON-D11-TAM-REGRESSION-RAPORU.md; yalnız kanıt/state.

**Adım adım görev:** Komutları suite bazında çalıştır; PASS/FAIL/atlanan ayrı-gated kanıtı yaz; önce/sonra app.js satır, module count ve output düzeyini raporla. Ardından yalnız bu kartın kaynaklarını, cache-bust/FILES etkisini ve anti-amnesia zincirini güncelle; tek yerel committen önce tüm kapıları çalıştır.

**Yasaklar:** Browser, deploy, gerçek veri, benchmark uydurmak veya FAILi gizlemek.

**Delege / registry erişimi:** Registry yok.

**Doğrulama:** syntax; driver; zikr; app fixtures; panel fixtures; panel-v2 fixtures; Quran; reminder smoke; premium suite PASS.

**Kabul kriteri:** Her komut gerçek dosyaya bağlı ve exit=0; cihaz/deploy ayrı kanıt olarak etiketlidir.

**Halt ve LEDGER protokolü:** Bir suite FAIL veya command missingse bloque, kapanışa geçme. Başarısız/eksik kanıtı append-only LEDGERa yaz; stateyi gerçeğe göre blocked yap; kullanıcı yönü olmadan sonraki karta geçme.

## MON-58 · Dokümantasyon ve roadmap senkronu

**Kimlik:** Öncül MON-57; sınıf: kapanış; kapılar: S1–S8, I1–I6, M1–M4.

**Amaç:** Uygulanan mimariyi kanonik plan, README ve anti-amnesia kayıtlarıyla tutarlı kılmak.

**Kapsam:** docs/GELISTIRME-PLANI.md, README/plan docs only as MON-58 scope; CURRENT-STATE/LEDGER/MON-STATE.

**Adım adım görev:** Roadmap modülerleşme satırını gerçek durumla güncelle; module map ve karar linklerini ekle; stale line/version claims taraması yap. Ardından yalnız bu kartın kaynaklarını, cache-bust/FILES etkisini ve anti-amnesia zincirini güncelle; tek yerel committen önce tüm kapıları çalıştır.

**Yasaklar:** Tarihsel FX kaydını değiştirme, fake deployment/acceptance yazma.

**Delege / registry erişimi:** Registry yok; dokümantasyon gerçek sourcea işaret eder.

**Doğrulama:** Markdown link taraması; JSON parse; git diff --check; MON-D11 rapor referansları PASS.

**Kabul kriteri:** Kanonik belgeler durum/karar/24 modül ile çelişmez.

**Halt ve LEDGER protokolü:** Bir otorite belirsiz veya kullanıcı onayı gerekirse dur. Başarısız/eksik kanıtı append-only LEDGERa yaz; stateyi gerçeğe göre blocked yap; kullanıcı yönü olmadan sonraki karta geçme.

## MON-59 · Karar belgeleri ve release sınırı konsolidasyonu

**Kimlik:** Öncül MON-58; sınıf: kapanış; kapılar: S1–S8, I1–I6, M1–M4.

**Amaç:** MON-S kararlarını, güvenlik mirasını ve ayrı teslim kapılarını tek denetlenebilir kayıtta birleştirmek.

**Kapsam:** deliverables/MON-KARAR-KONSOLIDASYONU.md; state zinciri.

**Adım adım görev:** MON-S1..S7, rejected options, M1–M4, 6079, callbacks, FX, testing sınırları ve release checklist referanslarını bağla. Ardından yalnız bu kartın kaynaklarını, cache-bust/FILES etkisini ve anti-amnesia zincirini güncelle; tek yerel committen önce tüm kapıları çalıştır.

**Yasaklar:** Push/merge/tag/deploy yapma; canlı acceptance iddiası yazma.

**Delege / registry erişimi:** Registry yok.

**Doğrulama:** JSON parse; link check; full regression rapor referansları; git diff --check PASS.

**Kabul kriteri:** Kararların sahibi, tarihi, kanıtı, geri dönüş/sınırı açıkça yazılıdır.

**Halt ve LEDGER protokolü:** Karar belgesi source ile çelişirse MON-59 bloke. Başarısız/eksik kanıtı append-only LEDGERa yaz; stateyi gerçeğe göre blocked yap; kullanıcı yönü olmadan sonraki karta geçme.

## MON-60 · Seri kapanış belgesi ve devir

**Kimlik:** Öncül MON-59; sınıf: kapanış; kapılar: S1–S8, I1–I6, M1–M4.

**Amaç:** Planlanan ayrıştırmayı dürüst kapsam ve ayrı teslim şartlarıyla resmi olarak kapatmak.

**Kapsam:** deliverables/MON-SERI-KAPANIS-BELGESI.md; README/state/ledger final satırları.

**Adım adım görev:** Dalga tablosu 60/60, 24 modül API/owner envanteri, test kanıtı, kararlar, açık/ayrı gated işler ve rollback/handoff protokolünü yaz; status tamamlandıysa yalnız kanıtla güncelle. Ardından yalnız bu kartın kaynaklarını, cache-bust/FILES etkisini ve anti-amnesia zincirini güncelle; tek yerel committen önce tüm kapıları çalıştır.

**Yasaklar:** Yeni kod, push, deploy, browser/device kabulü veya seyma-data yazımı.

**Delege / registry erişimi:** Registry yok.

**Doğrulama:** grep -c '^## MON-' UYGULAMA-PROMPTLARI.md = 60; MON-STATE totalPrompts=60; dalga toplamı=60; JSON parse; full regression PASS.

**Kabul kriteri:** Kapanış belgesi uygulama/yerel PASS/deploy/device sınırlarını ayrıştırır; next safe action user approvala bağlıdır.

**Halt ve LEDGER protokolü:** Her prompt/kanıt eksikse status completed yapılmaz; blockedPrompt=MON-60. Başarısız/eksik kanıtı append-only LEDGERa yaz; stateyi gerçeğe göre blocked yap; kullanıcı yönü olmadan sonraki karta geçme.
