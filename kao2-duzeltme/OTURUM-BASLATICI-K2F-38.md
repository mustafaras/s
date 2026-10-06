# Oturum başlatıcı — K2F-38 (Denetim kontrolleri kalıcı fixture)

Yeni oturumun ilk mesajı olarak aşağıdaki bloğu aynen yapıştır.

```text
Şeyma deposunda KAO2-FIX programına devam et. Program klasörü: kao2-duzeltme/.

Kod yazmadan önce sırayla yap:
1) CLAUDE.md "DATA SAFETY" bölümünü oku: tarayıcı açma, sunucu başlatma, mustafaras/seyma-data'ya
   yazma YOK. Doğrulama yalnız headless Node (node:vm) fixture'larıyla.
2) kao2-duzeltme/BAGLAM-YONETIMI.md'yi oku ve §3 okuma bütçesine uy.
3) kao2-duzeltme/.anti-amnesia/CURRENT-STATE.md'yi ve LEDGER.md'nin yalnız son 3 kaydını oku.
4) node kao2-duzeltme/tools/fix-sync-check.mjs --clean --repro → PASS olmalı.
   (Yarım kalmış prompt varsa BAGLAM-YONETIMI §6'yı uygula.)
5) FIX-STATE.json → nextPrompt. PROMPTLAR.md §1'in tamamını ve YALNIZ nextPrompt bölümünü oku.
6) Promptun "Oku" satırındaki kaynakları yalnız verilen aralıklarda oku.

Yalnız nextPrompt'u yürüt; tamamlanmış promptu yeniden açma, sonrakine geçme. P1–P14'ü uygula.
Kapsam dışı gereksinimi yapma: LEDGER NOTE + CURRENT-STATE "Açık riskler". Durma koşulunda P6.
Kullanıcı kapısında P7. Her promptta LEDGER + CURRENT-STATE + FIX-STATE aynı committe;
fix-sync-check PASS; tek commit. Push/merge/deploy yalnız YAYIN promptlarında ve açık kullanıcı onayıyla.

Durum (önceki oturumdan): K2F-00…37 tamam (38/44), nextPrompt K2F-38 (Denetim kontrolleri kalıcı fixture). K2F-36 yalnız test/kanıt
(test_kao2_kabul.js gerçek ölçüm; KAO2_ACCEPT_SLOW_HOST=1 yavaş konteynerde A-10 göreli bandını atlar). Canlı pin 20261005b (main 59160810, run 37349172650);
K2F-37 kaynağı (Arapça lang/dir + kök arama etiketi) canlıda DEĞİL (yayın yalnız kullanıcı "canlıya al" derse). K2F-35 oturumunun ortamı sığ klon + yavaştı: perf/plan-check/boundary kırmızıları baseline'da da vardı.

K2F-38'e özel notlar (önceki oturumlardan öğrenilenler):
- Yeni handler yok: pinler App.kao* 45 · yüzey 766 · atama 604 sabit. Eylemleri literal yaz; yorumlarda
  App.<ad>= ya da onclick yazma (fx2/v3 düz metin taraması).
- Test başlıkları gerçek sayıyı söyler (K3-09): onboarding dosyasının özet satırı "KAO2-12 onboarding: PASS (N kontrol)"
  ve başlık/kart numarası PROMPTLAR §K2F-38 (d) ile uyumlu olmalı; K2F-34 sonrası N=28 (K2F-34 a–g dahil).
- Önce kırmızı yaz, sonra uygula; satırı silince kırılıyor mu diye mutasyonla doğrula. Ortak api testlerde tek kez
  kaydolur — veriyi dışarı taşı (bkz. motorData). VM'den dönen dizilerde deepEqual öncesi Array.from kullan.
- Açık NOTE (LEDGER seq 96): dinleme şıklarında doğru harf hep 1. düğme; K2F-38 kapsamı değil, dokunma.
- CSS payı çok dar: 13,661 / 14 KiB (kalan ≈0,34 KiB); aşmak P6 durma koşuludur. Bu prompt CSS gerektirmez; runtime 116,270 / 128 KiB.
- CSS jetonları: kao.css'te fallback'siz kullanılan her --jeton tanımlı olmalı (test_kao2_design_contract.js
  zorlar; tanımsız jeton bildirimi sessizce düşürür). KAO satırlarındaki her icon:'ad' constants.js'te tanımlı olmalı.
- Her prompt sonunda bağımsız code-reviewer çalıştır, bulguları kapat; çıktıdaki eşzamanlı koşumlar perf_budget
  testini kırmızı gösterebilir — kapıları TEK başına koş. Heredoc'ta backtick'i tırnaksız bırakma (kabuk çalıştırır);
  <<'EOF' kullan. prev-commit için git log --format=%h -1 ölç, tahmin etme.
- Arayüz değiştiyse ekran görüntüsüyle kanıtla: kao2-duzeltme/tools/gorsel-qa/README.md (soketsiz CDP, boş profil;
  Chrome sandbox dışında açılır → kullanıcıdan Bash onayı gerekir). Görüntüler sentetik veridir; cihaz değildir.
- Cihaz doğrulaması (K2F-26…34 görsel/odak/dakika metinleri) kullanıcıdadır; "cihazda düzeldi" deme.
```

## Sıradan sonra
- K2F-38 yeni bölümü yalnız K2F-38 kapanınca okunur.
- Canlıya alma yalnız kullanıcı isterse: pin `20261005b` → yeni pin (index.html ×15, sw.js ×16, 8 pin taşıyan test), `kapilar.sh`, ff-only push, Pages run, bayt eşitliği, gizlilik 404. Önceki örnek: `evidence/K2F-33/YAYIN.md`.

Bu oturum devrinden ek notlar (2026-10-05, K2F-35/36 ve ekran kanıtı turu):
- (K2F-36 sonrası durum; K2F-37 farkı aşağıda) Yüzde düzeltmesi (Bugün "Kur’an kapsamı %47", tekrar doğruluğu `%N`) canlıya alındı (main 59160810, run 37349172650, pin 20261005b); canlı bayt eşitliği kullanıcı terminalinde teyit bekliyor (YAYIN-2.md). Sonraki yayında pin yükseltilir (index.html ×15, sw.js ×16, 8 pin taşıyan test + test_kao2_curriculum).
- Kabul testi: `KAO2_ACCEPT_SLOW_HOST=1 node tests/kao/test_kao2_kabul.js` yavaş makinede yalnız A-10 göreli p95 bandını atlar (≈3–4 dk; aileleri gerçekten çalıştırır). Hızlı makinede bayraksız çalıştır. `tools/perf-ab.cjs` makineden bağımsız A/B ölçer.
- Bash'te `$TMPDIR` BOŞ olabilir (ilk K2F-36 turunda geçici dosyalar kök dizine düştü). Geçici işler için mutlak scratchpad yolu kullan; `rm` kök yola engellenir.
- Ekran görüntüsü (yalnız kullanıcı isterse): `KAO_QA_CHROME=/opt/pw-browsers/chromium-1194/chrome-linux/chrome KAO_QA_NO_SANDBOX=1 node kao2-duzeltme/tools/gorsel-qa/shoot-k2f35.mjs <kök> <çıktı> <profil>`; ÖNCE için `git archive <commit> | tar -x -C <dizin>`; kontak sayfası için `pip install pillow`. Görüntüler sentetiktir, cihaz değildir; PNG'leri küçült (quantize) ki depo şişmesin.
- Ağ: `mustafaras.github.io` bu oturumlarda egress ile engelliydi; canlı bayt doğrulaması kullanıcı terminalinde `curl | shasum -a 256` ile yapıldı (K2F-35 YAYIN.md).
- Pin değişen yayında yalnız kullanıcı "canlıya al" derse push/deploy; K2F-36 gibi yalnız test/kanıt commit'leri pini değiştirmez.
- K2F-37 devri: kaynakta yayında OLMAYAN fark var (quranLearn.js + quranLearnViews.js: Arapça lang/dir sarmalayıcıları, kök arama aria-label); canlı pin 20261005b bunları taşımaz. Yeni yayında pin yükselt. a11y matrisi 445 yüzey/≈20 sn; yeni kapsam gerekirse yalnız `buildMatrix()`e ekle (görünümler kaynaktan türetilir).
- LEDGER NOTE seq 105 açık (kavram tablosunda "Arapça" sütununda referans); K2F-38 kapsamı değil.
