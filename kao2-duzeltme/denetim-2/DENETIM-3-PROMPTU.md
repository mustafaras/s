# Denetim-3 promptu (Opus 5.5 için) — tüm düzeltme promptlarının bağımsız denetimi

Kullanım: yeni bir Claude Code oturumunda `/model opus` seç, depo kökünde (`/Users/m_ras/Desktop/seyma`, dal `main`) aşağıdaki kutuyu olduğu gibi yapıştır.
Denetçi **salt-okur** çalışır; yalnız kendi rapor klasörüne yazar.

```text
Sen Şeyma deposunun BAĞIMSIZ denetçisisin (Opus 5.5). Önceki oturumlarda iki düzeltme programı yürütüldü ve "kapandı" dendi:
  • KAO2-FIX: kao2-duzeltme/ (44 prompt, K2F-00…43) — durum kao2-duzeltme/FIX-STATE.json
  • denetim-2: kao2-duzeltme/denetim-2/ (16 prompt, D2F-01…16) — durum denetim-2/D2F-STATE.json, promptlar DUZELTME-PROMPTLARI.md
Görevin: bu iki programın "yapıldı" iddialarını kanıtla sınamak. Önceki raporlara, LEDGER'a, KANIT.md'lere İNANMA; her iddiayı kod, test çıktısı ve git geçmişiyle yeniden doğrula. Kapalı yazan bir şeyi açık bulmak başarıdır; "her şey yolunda" demek ancak kanıtla olur.

KATI KURALLAR (ihlal = denetim geçersiz)
1. SALT-OKUR. Uygulama koduna, testlere, pinlere (?v=, SW_VERSION), main'e, uzak depoya DOKUNMA. Commit, push, merge, deploy, revert yok. Yalnız yaz: kao2-duzeltme/denetim-3/ (rapor + kanıt). Rapor için commit bile atma; kullanıcıya bırak.
2. CLAUDE.md "DATA SAFETY"e uy: uygulamayı tarayıcıda açma, yerel sunucu kurma (görsel QA istisnası verilmedi). Doğrulama yalnız headless Node harness'leri ve fixture'larla (.claude/skills/run-seyma/). mustafaras/seyma-data'ya yazma YASAK; okuma gerekmez.
3. Gizli bilgi isteme/okuma yok (token, parola, 2FA). Gerçek hesap/cihaz eylemi yok.
4. Ağ yalnız: canlı Pages (https://mustafaras.github.io/s/) için GET/curl ve GitHub API okuma. gh TLS hatası verirse curl kullan.
5. Uydurma yok. Ölçemediğini "ÖLÇÜLEMEDİ (neden)" yaz. Kanıt düzeylerini ayır: kaynak/test · yayın · canlı bayt eşitliği · cihaz. Cihaz/uzman kanıtı olmayan şeyi "doğrulandı" yazma.
6. Bulguyu düzeltme; bildir. Her bulgu: kimlik, ciddiyet (KRİTİK/YÜKSEK/ORTA/DÜŞÜK), dosya:satır ya da commit, yeniden üretme komutu, beklenen/gerçek, hangi prompta ait.

NASIL BAŞLA (sırayla)
A. Bağlam: CLAUDE.md, kao2-duzeltme/README.md, FIX-STATE.json, denetim-2/{CURRENT-STATE.md, D2F-STATE.json, DENETIM-RAPORU.md, DUZELTME-SONUCU.md, DEVIR-LISTESI.md}, archive/kuran-ogreniyorum-v2/DUZELTME-NOTU.md. Not: ORTAK-KURALLAR.md kullanıcı kararıyla silindi (restore: git show d439127b:kao2-duzeltme/denetim-2/ORTAK-KURALLAR.md) — süreç kuralı ihlali sayılırken bu kararı ve yetki devrini (LEDGER seq 17, 23) dikkate al, ama devrin kapsamını da sına (devredilemez: L2, cihaz kabulü, seyma-data, adı geçmeyen yayın).
B. Git gerçeği: `git log --oneline cbe0d604..HEAD`, `git status -sb`, HEAD = origin/main mı. KAO2-FIX için FIX-STATE'teki baseCommit'ten itibaren aynısı.
C. Mevcut kapıları KENDİN çalıştır, çıktıyı rapora koy (yavaş makinede KAO2_ACCEPT_SLOW_HOST=1):
   bash kao2-duzeltme/tools/kapilar.sh
   node kao2-duzeltme/tools/fix-sync-check.mjs --repro
   node kao2-duzeltme/denetim-2/tools/d2f-sync-check.mjs --strict --clean --repro
   node kao2-duzeltme/denetim-2/tekrar-uret-2.cjs        (beklenen 9/9)
   node kao2-duzeltme/denetim/tekrar-uret.cjs            (beklenen 10/10; yol yoksa kao2-duzeltme/denetim/ altında ara)
   node docs/kuran-ogreniyorum/tools/kao-plan-check.mjs
   node tests/kao/test_kao2_perf_budget.js
   for f in tests/kao/*.js; do node "$f"; done ; ayrıca tests/app, tests/panel, tests/panel-v2, tests/quran, tests/reminders ailelerini ve .claude/skills/run-seyma/{driver,zikr-harness}.mjs
   Araçların kendisini de sına: bir kapı gerçekten kırmızı olabiliyor mu? (Ör. geçici KOPYADA — $TMPDIR içinde — bir kuralı bozup kapının yakaladığını göster; orijinali bozma.)
D. Her prompt için (K2F-00…43 ve D2F-01…16) tek tek: prompt metnindeki "BİTTİ SAYILIR" ölçütünü oku → ilgili commit(ler)i bul (`git log --grep`) → kod/test/veri ile ölçütün SAĞLANDIĞINI bağımsız göster. Tablo: prompt · ölçüt · sağlandı mı (EVET/KISMEN/HAYIR/ÖLÇÜLEMEDİ) · kanıt.

ÖZEL ODAKLAR (önceki denetimlerin kör noktaları — bunları ayrıca derinlemesine sına)
1. İçerik doğruluğu: Arapça içerik/okunuş yalnız araç çıktısından gelmeli (tools/kao-lexicon-build.mjs, kao-content-freeze.mjs). Elle düzenlenmiş Arapça var mı? quranCurriculumV2.js ↔ MUFREDAT-ESLEME.md araçla iki kez üretilince bayt-eşit mi ve depodakiyle aynı mı?
2. Öğretim doğruluğu: gramer görevlerinde yanlış eşleme (ilk denetimde %58) gerçekten düzeldi mi? Rastgele ≥40 görev örnekle, cevap anahtarını kendi Arapça/gramer bilginle sına; emin olmadığını "uzman gerekir" işaretle, hüküm verme. Aynı derste aynı gramer sorusu tekrarı, "kelime dizme" aynı görünen çipler, Seviye 0 ana yolunun boş olmaması, ünite ustalığının kaydedilip Ünite 1 kilidini açması, `kaoS0` handler'ının tanımlı olması: her biri headless senaryoyla yeniden çalıştırılsın.
3. Dürüstlük: "ai-delegated" L1 kayıtları (158) gerçekten böyle mi etiketli; hiçbir yerde kullanıcı/uzman incelemesi gibi sunulmuyor mu? L2 (0/37) hiçbir yerde "onaylı" görünmüyor mu? UI'da, belgede, state'te grep'le tara. Ayrıca K2F-43 yayını ve D2F-15 yayını "çıkarımla/devirle" onaylandı — kayıtlar bunu dürüstçe söylüyor mu?
4. Yayın: pin tutarlılığı (index.html, sw.js SW_VERSION/SW_OFFLINE_VERSION, panel-v2.html, pin testleri, FIX-STATE/D2F-STATE pins.release). Canlı bayt eşitliği: index.html, sw.js, panel-v2.html ve `?v=` taşıyan her dosyayı curl+shasum ile yerelle karşılaştır; gizlilik yolları (kao2-duzeltme/*, denetim-2/*, archive/*, docs/kuran-ogreniyorum/kao2/content/texts.tr.json) 404 mü (not: depo public; bunlar 404 DEĞİLSE bunun gizlilik mi kapsam sorusu mu olduğunu bildir). Pages workflow: son main commit'inin run'ı success mi.
5. Bütçe/performans: çalışma zamanı tavanı (88→128 KiB kararı) ve içerik bütçesi aşımı (gzip 159,9 KB > 130 KB, "açık karar") gerçekten kayıtlı karar mı yoksa sessiz aşım mı? Ölçümü kendin yap.
6. Veri güvenliği: sync.js Guard 1/Guard 2 hâlâ sağlam mı (localhost/file:/*.local push engeli, düşük gün sayısı engeli)? migrate() eski kayıtla geçerli nesne üretiyor mu? Yeni alanlar sanitize()'de gizli alan sızdırmıyor mu? Düzeltmelerden biri seyma-data'ya yazma yolu açtı mı? tests/app/test_faz10_sync.js ve ilgili fixture'ları çalıştır.
7. Erişilebilirlik: modal klavye sözleşmesi (Tab/Shift+Tab/Escape, backdrop odaklanamaz), kontrast denetimi (kao-verify-contrast.mjs), 44px dokunma hedefi, reduced-motion. Headless fixture ne kanıtlıyor, ne KANITLAMIYOR (ekran okuyucu ve gerçek cihaz kanıtlanmaz) — ayır.
8. Süreç: strictExceptions (15 kayıt) gerekçeleri makul mü, yeni gizli ihlal var mı; "tek prompt/tek commit/önek" kuralından sapmalar; kapsam dışı commit'ler (ör. 8bf8f658 — "tutuldu" kararı doğru mu, neyi değiştiriyor, test bayrakları neden gerekti). Kanıt dosyalarında (KANIT.md) bölüm/oturum eksikleri, bayat "Canlı gerçekler".
9. Yapısal pinler: App.kao* 45, App yüzeyi 766, atama 604, onclick 393 — araçla ve düz metin taramasıyla yeniden say; yorumlarda `App.<ad>=` ya da tıklama niteliği adı geçip pini kaydırıyor mu? Yeni app/core dosyası varsa dört listede (index.html, driver.mjs, zikr-harness.mjs, test_state_rebind_boundary.js) mi?
10. Dürüst açıklar: yapılmadığı söylenenler (L2, 13 namaz kelimesi, hece sesi K-3, cihaz kabulü A-11/A-12, ekran okuyucu) gerçekten uygulamada dürüstçe görünüyor mu (ör. eşlenmeyen kelime "açık" mı gösteriliyor, ses yokken ses düğmesi yalan söylemiyor mu)?

ÇIKTI (kao2-duzeltme/denetim-3/ altına yaz)
  DENETIM-3-RAPORU.md  — 1) Özet karar (KAPANIŞ DOĞRU / KISMEN / YANLIŞ) ve ilk 5 bulgu, 2) Ölçüm tablosu (komut · çıktı · beklenen), 3) Prompt-prompt tablo (60 satır), 4) Bulgular (ciddiyet sırasıyla, her biri yukarıdaki alanlarla), 5) Önceki raporların yanlış/abartılı iddiaları, 6) Doğrulanamayanlar ve neden, 7) Önerilen düzeltme sırası (uygulama YOK, yalnız öneri), 8) Kanıt düzeyi tablosu (kaynak/test · yayın · canlı · cihaz).
  evidence/ — komut çıktıları, örneklem listesi, canlı karşılaştırma çıktısı (olduğu gibi).
Sonunda tek mesajda: karar, bulgu sayısı ciddiyete göre, en önemli 3 risk, rapor yolu. Yazdıkların dışında depoda hiçbir değişiklik bırakma (`git status` temiz olmalı, yalnız yeni denetim-3/ klasörü hariç) ve bunu raporun sonunda göster.
```
