# K3PD-11 — kaynak kanıtı ve doğrulama

## Yetki ve başlangıç anlık görüntüsü

- Jev gate, kullanıcının aynen verdiği `Evet, yalnız K3PD-11 için 137 KiB` metninde belirsizlik uyarısı verdi. Varsayım açıklandı: izin yalnız `tests/kao/test_kao2_perf_budget.js` runtime tavanı 136→137 KiB ve bu exact yolun K3PD-11 allowlist satırına eklenmesidir.
- Uygulama başlamadan canlı aday K3PD-11 doğrulandı. Branch `k3pd-denetim-duzeltmeleri`, başlangıç HEAD `9c211a5aabc4be4058a4d3f7308d337dc4473fc8`, `HEAD...origin/main` `1/0` idi. `durum.mjs --check` PASS; `--sonraki` K3PD-11 gösterdi.
- Kart başlangıcındaki çalışma ağacı K3PD `releaseApproval.status=NOT_APPROVED`, `candidateSha=null` idi. İzlenen başlangıç HEAD’indeki releaseApproval ise `APPROVED` durumunu yalnız A SHA `a6c5961dbf19a652b8bd7d57cedee1271249ad22` ve o tarihteki exact yayın kapsamı için taşıyordu; seq71 aynı A adayı için önceki yayın makbuzudur. A onayı K3PD-11’e veya yeni bir adaya uygulanmaz. K3PD-11 başlangıcındaki çalışma ağacı releaseApproval alanı değiştirilmedi.
- Eski K3P ayrı tutuldu: legacy kaydı `completed`, `37/37`, `nextPrompt=null`, tarihsel `APPROVED-2026-10-18`. Bu tarihsel kayıt K3PD releaseApproval veya K3PD-11 yetkisi değildir.
- Korunan kirli dosyaların başlangıç hashleri: `KAPANIS.md` `d8e8419e2849b9eec922e537bca7100149fdfee6120ce850fda77128f8af9bcd`; `README.md` `1aee47cdd05726f4a5966748ae3f786bd79d2e394dd37f3ec7b083f2d36eed0f`; `kanit/sonraki/GORSEL-KANIT.md` `d7627027bba21007550f0a5c76130a4d9f11b7b896d001a60e9333c81ffeed28`.

## Gerçek kaynak: Arapça harf adları

- [The Open University OpenLearn, Introduction to Arabic, Table 3.1](https://www.open.edu/openlearn/mod/oucontent/view.php?id=171153&section=3) 28 harf için İngilizce transliterasyondan ayrı bir `The letter’s name in Arabic` sütunu verir. Uygulamadaki ad eşlemesi bu Arapça sütunun yazımlarını kullanır; glif veya mekanik transliterasyon ad kabul edilmez.
- Hamza adı [OpenLearn §2.2 Al-hamzah](https://www.open.edu/openlearn/mod/oucontent/view.php?id=171153&section=14.2) başlığındaki `الهَمْزَة` biçiminden alınır. Sayfa hamzanın bağımsız/oturaklı yazım biçimlerini de açıklar.
- `test_k3p_build.js` kaynak tablosunu altın fixture olarak sabitler; canlı `QuranPhonicsV1.letters` envanterinin her girdisi ve gerçek build görevlerinde sunulan her hedef/çeldirici için kaynak adı bulunduğunu doğrular. Eksik eşleme ile yeni içerik, transliterasyon yedeği veya uydurma ad üretilmez.

## Davranış kanıtı

- Başlangıç HEAD kaynağında selected row her seçili harfi ayrı wrapper içinde `kaoArabicPairHTML` ile çiziyordu; bu tek RTL text node sözleşmesini sağlamıyordu. Eski build testi glif/okunuş etiketini kabul ediyor, doğrulanmış harf adı veya gerçek tekrarlı/birleşmeyen kelime davranışını sınamıyordu.
- `node tests/kao/test_k3p_build.js` — exit 0, 13 kontrol. Gerçek doğrulanmış lexicon içeriğinden tekrar harfli ve birleşmeyen harf içeren bir kelime seçildi; seçim, ters sıra, undo ve gerçek `App.kaoAnswer` yolu sınandı. Seçimler tek RTL `span.kao-order-preview` metin düğümünde birleştirildi; çipler ayrı kaldı. Mevcut word-order görevi token görünümünü korudu. Sabit Latin fixture cevabı kullanılmadı.
- Aynı build testi her gerçek fonik harfin hedef/çeldirici çipindeki `aria-label` değerini OpenLearn ad fixture’ıyla karşılaştırdı; tüm mevcut envanter eşleşti.
- `node tests/kao/test_k3p_drag.js` — exit 0, 6 kontrol. Tek `onclick` klavye/aktivasyon yolu, `aria-pressed` seçili durum, pointerdown/drop target davranışı, dışarı bırakmanın etkisiz oluşu, reduced-motion ve `App.kao*` yüzeyinin 45 atamada kalması sınandı.
- `node tests/kao/test_kao2_a11y.js` — exit 0, 14 kontrol; 552 yüzey, odak, klavye, RTL/lang, taşma ve dokunma hedefi sözleşmesi. Bu otomatik sözleşme sonucu gerçek ekran okuyucu veya cihaz kabulü değildir.
- `node tests/kao/test_kao_pronunciation_contract.js` — exit 0, 524/524; `node tests/kao/test_kao_render.js` — exit 0, render/44 px/odak/ARIA regresyonları PASS.

## Bütçe ve kart kapıları

- Kullanıcı onayıyla yalnız test runtime gzip tavanı 136 KiB’den 137 KiB’ye çıkarıldı; toplam içerik, eski içerik, CSS ve zaman tavanları değişmedi. `KAO2_WRITE_BASELINE` unset kaldı, slow-host istisnası kullanılmadı.
- İzole perf tekrarları exit 0: runtime `136.399 KiB`, CSS `15.890 KiB`, content `184.591 KiB`; p95 `10.742 ms` / steady `5.581 ms` ve p95 `10.441 ms` / steady `5.514 ms`. Mutlak 40 ms süre sınırları geçti.
- G0: `git diff --check`, JS sözdizimi, `driver.mjs`, `zikr-harness.mjs`, `durum.mjs --check/--sonraki` ve `test_k3pd_control.js` exit 0. Kart kayda alınmadan önce `--sonraki` K3PD-11 idi.
- G1’in 19 komutunun tamamı son koşulda exit 0 verdi: iki migration, FSRS, queue, requirements, render, navigation, a11y, inventory, design, pronunciation, phonics, mount, focus lock, asset pin freshness, IIP-22, perf, plan-check ve contrast.
- İlk eşzamanlı G1 grubundaki perf denemesi exit 1 ile döndü. Bu deneme diğer 18 G1 süreciyle çakıştı; stderr’in korunan son bölümü assertion stack’iydi ve nedenini tek başına belirlemiyordu. Perf iki kez tek başına, slow-host bayrağı kapalı ve baseline yazımı kapalı tekrarlandı; ikisi de exit 0 ve yukarıdaki ölçüleri verdi.
- Asset-pin freshness `60 fresh / 3 deferred / 0 blocking stale` bildirdi. Ertelemeler release PASS değildir; `index.html`/`sw.js` pin değişikliği yapılmadı.

## Durum ve açık kabul

- Durum `source_ready / EVIDENCE_PENDING`; `acceptanceDependencies=["K3PD-29"]`. Source/test kanıtı, gerçek font/iki tema/geometri görsel kabulünün yerini tutmaz. Bağımsız salt-okur PASS ve kapanış kapıları da bekliyor.
- `done` veya commit oluşturulmadı. Screenshot/görsel QA, push, merge, tag, deploy ve K3PD-12 uygulaması yapılmadı. K3PD-12 yalnız durum aracının sonraki adayı olarak türetilebilir; bu karta başlanmadı.

## Bağımsız salt-okur denetim ve yeniden açma · 2026-10-21

- Ayrı salt-okur denetçi kaynak ve gerçek build üretimini inceledi; genel hüküm `PARTIAL`. Denetçi dosya veya durum değiştirmedi.
- Kaynak eşlemesinin gerçek build çıktısında şu an doğru olduğu karşılaştırıldı; fakat regresyon testi `SOURCE_NAMES` tablosunu sentetik matrise enjekte ediyor. Gerçek `kaoBuildTask` çıktısındaki her `choice.ariaLabel` değerinin onaylı kaynak adıyla birebir eşleştiğini sabitlemiyor. Test bu üretim yolunu doğrudan doğrulamalı.
- Kısmi çok-harf seçiminde `paintTask()` görev düğümünün `innerHTML` değerini değiştiriyor ve odaklanmış çip düğümünü yok ediyor. Var olan test handler'ı doğrudan çağırıp yalnız HTML durumunu kontrol ettiği için odak kaybını yakalamadı. Klavye odağı seçimden sonra etkin, seçilmemiş bir çipe taşınmalı ve gerçek aktif-öğe/DOM yolu ile regresyonu sınanmalı.
- Bağımsız denetçi salt-okur kalmak için dosya yazıp silen `test_k3pd_control.js` kontrolünü çalıştırmadı; G0 kontrol kapısı yeniden yürütülmeli. K3PD-29 font/görsel kabulü de ayrı ve açık kalıyor.
- Bu bulgular üzerine K3PD-11 durumu `in_progress/PARTIAL` olarak kaydedildi; `nextPrompt=K3PD-11`. K3PD-12'ye geçiş veya K3PD-11'in source_ready/done kapanışı yapılmadı.

## PARTIAL bulgularının giderilmesi ve tekrar doğrulaması · 2026-10-21

- `paintTask()` aynı build görevi için klavye odağındaki çip kimliğini ve görev kimliğini render öncesi kaydeder. İçerik yenilendikten sonra seçim tamamlanmamışsa odağı sıradaki gerekli, seçilmemiş ve etkin harf çipine taşır. Yanıt tamamlanmışsa odak mevcut geri bildirim/devam kontrolüne gider; hızlı otomatik geçişte soru başlığına döner. Başka göreve geçerken eski çip odağı taşınmaz.
- Build düğümlerine seçim kimliği eklendi; seçili çip `aria-pressed="true"` ve `disabled` durumunu korur. Pointer/drop kancaları, tek `onclick` klavye etkinleştirmesi ve `App.kao*` sayısı değiştirilmedi.
- `test_k3p_build.js` artık sentetik ad matrisi yanında gerçek `kaoBuildTask` çıktı nesnesindeki her `ariaLabel` değerini OpenLearn kaynağıyla ve gerçek HTML çip adını aynı kaynakla birebir karşılaştırıyor. Odak testi üretim `kaoAnswer`/`paintTask` yolunu aktif öğe, `innerHTML` yenilemesi, odak aktarımı ve seçili durumunu modelleyen sentetik task DOM üzerinden sürüyor; gerçek tarayıcı/ekran okuyucu kabulü değildir.
- `node tests/kao/test_k3p_build.js` — exit 0, 14 kontrol; tekrar harf, birleşmeyen harf, ters sıra, geri alma, tek RTL metin düğümü, gerçek kaynak adı eşleşmesi, kısmi klavye odağı ve token olarak kalan word-order davranışı.
- `node tests/kao/test_k3p_drag.js` — exit 0, 6 kontrol; dokunma/klavye aktivasyonu, seçili durum, pointer/drop target, dışarı bırakma, reduced motion ve sürüklenebilirlik.
- `node tests/kao/test_kao2_a11y.js` — exit 0, 14 kontrol / 552 yüzey; `node tests/kao/test_kao_pronunciation_contract.js` — exit 0, 524/524. `node tests/kao/test_k3pd_control.js` — exit 0; 33 negatif kontrol, 34 K3PD ve 6 legacy pin politikası. Bu kontrolün kaynak kodu incelendi: yalnız OS geçici dizininde sentetik Git fixture'ı kuruyor ve `finally` içinde siliyor; ağ/gerçek depo checkout'u yazımı yok.
- G0 komutlarının tamamı ve G1’deki 19 komut exit 0. Perf, baseline yazımı ve slow-host istisnası kapalı, izole çalıştırıldı: runtime `136.810 KiB` (137 KiB sınırının altında), CSS `15.890 KiB`, content `184.591 KiB`, p95 `5.483 ms`, steady `3.060 ms`. Önceki `tests/kao/fixtures/kao2-perf-baseline.json` tabanı yazılmadı.
- DURUM `in_progress/PARTIAL`, `nextPrompt=K3PD-11`; yeni bağımsız salt-okur denetim bekliyor. K3PD-29 gerçek font/iki tema/geometri görsel kabulü bekliyor. `done`, commit, yayın veya K3PD-12 geçişi yok.

## Bağımsız yeniden denetim · source_ready hükmü · 2026-10-21

- Salt-okur bağımsız denetçi, gerçek build çiplerinin erişilebilir ad kaynağı eşleşmesini ve kısmi klavye seçiminden sonra odağın sıradaki etkin çipe taşınmasını PASS buldu. Kaydedilmiş K(build), K(drag), V(a11y), T(pronunciation_contract), G0/G1 ve izole perf kanıtlarını inceledi; bu denetim turunda testleri yeniden çalıştırmadı.
- Denetçi, GUNCEL-DURUM.md’deki güncel aday/perf özetini KAYIT seq75, EVIDENCE ve DURUM ile karşılaştırdı; tutarsızlıkların düzeltilmesinden sonra kayıt uzlaştırmasını PASS buldu. `durum.mjs --check` PASS; `--sonraki` K3PD-11’i göstermişti.
- Bağımsız hüküm yalnız kaynak kabulü içindir: K3PD-11 `source_ready/EVIDENCE_PENDING` oldu; K3PD-29 gerçek font/iki tema/geometri görsel kabulü açık kaldı. Gerçek tarayıcı/ekran okuyucu kabulü yapılmadı; `done` değil.
- Durum aracı K3PD-12’yi türetilmiş sıradaki aday olarak gösterebilir; bu yetki değildir ve K3PD-12 çalıştırılmadı. ReleaseApproval `NOT_APPROVED`; commit, screenshot, push, merge, tag veya deploy yapılmadı.
