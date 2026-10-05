# Oturum başlatıcı — K2F-36 (Kabul testi gerçek ölçüm)

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

Durum (önceki oturumdan): K2F-00…35 tamam (36/44), nextPrompt K2F-36 (kabul testi gerçek ölçüm: A-1…A-10,
mutasyon kanıtı). Dal yerel; canlı pin 20261004c (K2F-34 içeriği, main dc9743f); K2F-35 ve sonrası canlıda DEĞİL
(yayın yalnız kullanıcı "canlıya al" derse). K2F-35 oturumunun ortamı sığ klon + yavaştı: perf/plan-check/boundary kırmızıları baseline'da da vardı.

K2F-36'e özel notlar (önceki oturumlardan öğrenilenler):
- Yeni handler yok: pinler App.kao* 45 · yüzey 766 · atama 604 sabit. Eylemleri literal yaz; yorumlarda
  App.<ad>= ya da onclick yazma (fx2/v3 düz metin taraması).
- Test başlıkları gerçek sayıyı söyler (K3-09): onboarding dosyasının özet satırı "KAO2-12 onboarding: PASS (N kontrol)"
  ve başlık/kart numarası PROMPTLAR §K2F-36 (d) ile uyumlu olmalı; K2F-34 sonrası N=28 (K2F-34 a–g dahil).
- Önce kırmızı yaz, sonra uygula; satırı silince kırılıyor mu diye mutasyonla doğrula. Ortak api testlerde tek kez
  kaydolur — veriyi dışarı taşı (bkz. motorData). VM'den dönen dizilerde deepEqual öncesi Array.from kullan.
- Açık NOTE (LEDGER seq 96): dinleme şıklarında doğru harf hep 1. düğme; K2F-36 kapsamı değil, dokunma.
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
- K2F-36 yeni bölümü yalnız K2F-36 kapanınca okunur.
- Canlıya alma yalnız kullanıcı isterse: pin `20261004c` → yeni pin (index.html ×15, sw.js ×16, 8 pin taşıyan test), `kapilar.sh`, ff-only push, Pages run, bayt eşitliği, gizlilik 404. Önceki örnek: `evidence/K2F-33/YAYIN.md`.
