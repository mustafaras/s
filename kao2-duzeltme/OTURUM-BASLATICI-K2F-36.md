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

Durum (önceki oturumdan): K2F-00…35 tamam (36/44), nextPrompt K2F-36 (kabul testi gerçek ölçüm: A-1…A-10'u
handler'larla/alt süreçle gerçekten ölçen test + A-KABUL.md). Dal kao2-duzeltme (K2F-34 dahil main'e ff-only
yayınlandı; K2F-35 ve sonrası yerel); canlı main dc9743f4, pin 20261004c. K2F-35 ve sonrası canlıda DEĞİL
(yayın yalnız kullanıcı "canlıya al" derse).

K2F-36'ya özel notlar (önceki oturumlardan öğrenilenler):
- Yeni handler yok: pinler App.kao* 45 · yüzey 766 · atama 604 sabit. Yorumlarda App.<ad>= ya da onclick yazma.
- Dokun yalnız test_kao2_kabul.js + evidence/K2F-36/A-KABUL.md (KAO2_EVIDENCE_OUT ile). Üretim kodu gerekirse P6.
- Mutasyon kanıtı commit edilmez: $TMPDIR kopyasında yap, KANIT'a sonucu yaz. Testte totoloji/dosya sayımı/regex sayımı yok.
- A-9 aileleri alt süreçle çalıştırır (çıkış kodu); eşzamanlı koşumlar perf_budget'ı kırmızı gösterebilir — tek başına koş.
- VM'den dönen dizilerde deepEqual öncesi Array.from. Modal görsel QA turu (LEDGER seq 101) NOT 96/99'u kapattı; CSS payı 13,778 / 14 KiB (≈0,22 KiB kaldı). Yeni `tests/kao/test_kao2_modal_layout.js` ~23 sn sürer (109 ders yürür). Tarayıcı taraması: `kao2-duzeltme/tools/gorsel-qa/audit-modal.mjs` (yalnız kullanıcı "ekran görüntüsü" isterse).
- CSS payı çok dar: 13,661 / 14 KiB (kalan ≈0,34 KiB); aşmak P6 durma koşuludur. Bu prompt CSS gerektirmez; runtime 116,270 / 128 KiB.
- CSS jetonları: kao.css'te fallback'siz kullanılan her --jeton tanımlı olmalı (test_kao2_design_contract.js
  zorlar; tanımsız jeton bildirimi sessizce düşürür). KAO satırlarındaki her icon:'ad' constants.js'te tanımlı olmalı.
- Her prompt sonunda bağımsız code-reviewer çalıştır, bulguları kapat; çıktıdaki eşzamanlı koşumlar perf_budget
  testini kırmızı gösterebilir — kapıları TEK başına koş. Heredoc'ta backtick'i tırnaksız bırakma (kabuk çalıştırır);
  <<'EOF' kullan. prev-commit için git log --format=%h -1 ölç, tahmin etme.
- Arayüz değiştiyse ekran görüntüsüyle kanıtla: kao2-duzeltme/tools/gorsel-qa/README.md (soketsiz CDP, boş profil;
  Chrome sandbox dışında açılır → kullanıcıdan Bash onayı gerekir). Görüntüler sentetik veridir; cihaz değildir.
- Cihaz doğrulaması (K2F-26…35 görsel/odak/dakika metinleri) kullanıcıdadır; "cihazda düzeldi" deme.
```

## Sıradan sonra
- K2F-37 yeni bölümü yalnız K2F-36 kapanınca okunur.
- Canlıya alma yalnız kullanıcı isterse: pin `20261004c` → yeni pin (index.html ×15, sw.js ×16, 8 pin taşıyan test), `kapilar.sh`, ff-only push, Pages run, bayt eşitliği, gizlilik 404. Önceki örnek: `evidence/K2F-33/YAYIN.md`.
