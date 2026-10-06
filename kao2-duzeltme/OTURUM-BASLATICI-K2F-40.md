# Oturum başlatıcı — K2F-40 (K-2 katman tamamlama)

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
fix-sync-check PASS; tek commit. Push/merge/deploy yalnız YAYIN promptlarında ve açık kullanıcı onayıyla
("canlıya al" gibi açık bir cümle olmadan main'e push yok; belirlenen dala push serbest).

Durum (önceki oturumdan): K2F-00…39 tamam (40/44), nextPrompt K2F-40 (K-2 katman tamamlama). K2F-39 CANLIDA
(main 3122b5ae, pin 20261006d, Pages run 37498517193 success; sonra yalnız kayıt commit'i main f1cb4a01);
canlı bayt eşitliği kullanıcı terminalinde bekliyor (github.io bu konteynerden engelli), cihaz doğrulaması kullanıcıda.
DAL: bu oturumlarda çalışma dalı `claude/laughing-cori-o6ag6m` (kao2-duzeltme DEĞİL); yayın = ff-only `git push origin HEAD:main`.

K2F-40'a özel notlar:
- Yeni handler yok: pinler App.kao* 45 · yüzey 766 · atama 604 sabit. Yorumlarda App.<ad>= ya da tıklama niteliği
  adı yazma (fx2/v3 düz metin taraması yorumları da sayar).
- Önce 6 görev türü (meaning, arabic, audio, grammar, order, fragment) × {cevapsız, doğru, yanlış} HTML dökümünü
  scratchpad'e al (mutlak yol; `$TMPDIR` BOŞ olabilir), sonra şıkları `Views.choice` ile kur ve dökümleri bayt-eşit
  (ya da yalnız sınıf sırası farkı) karşılaştır; fark KANIT'ta. Önce kırmızı: bileşen testi şık HTML'inin Views'tan
  geldiğini sınasın (motorda kopya kalmasın); satırı silince kırılıyor mu mutasyonla doğrula.
- Bütçe: runtime gzip 117,3 / 128 KiB (ölç, tahmin etme); css 13,027 / 14 KiB (K2F-39 payı açtı, bu prompt CSS eklemez).
- Test başlıkları gerçek sayıyı söyler (K3-09). VM'den dönen dizilerde deepEqual öncesi Array.from kullan.
- Açık NOTE (LEDGER seq 96): dinleme şıklarında doğru harf hep 1. düğme; K2F-40 kapsamı değil, dokunma.
- Commit mesajı ÖNEKİ kao-plan-check için katıdır: tam olarak `K2F-40: …` (iki nokta hemen sonra). `K2F-38 ek:` benim
  hatamdı; araç şimdi " ek" ekini de tanır ama yeni commit'lerde standart biçimi kullan.
- Ortam tuzakları (bu konteynerde yaşandı): (a) depo sığ klon olabilir → `git fetch --unshallow origin` yoksa
  profile/settings_boundary ve plan-check kırmızı çıkar; (b) `rsync` yoksa `test_deploy_surface_contract` kırmızı →
  `apt-get install -y rsync`; (c) perf_budget/kabul A-10 göreli bandı yavaş konteynerde kırmızı → kabulü
  `KAO2_ACCEPT_SLOW_HOST=1` ile koş; (d) `pkill -f <desen>` komut satırında deseni geçiriyorsa KENDİ kabuğunu öldürür —
  PID ile durdur.
- Tam kapılar uzun sürer (≈25+ dk, 4 çekirdek): `kapilar.sh` yerine eşdeğer paralel koşu işe yaradı —
  tests/{kao,app,panel,panel-v2,quran}/test_*.js dosyalarını `xargs -P 4` ile koş (kabul + perf_budget hariç),
  ardından reminders smoke, run-seyma driver + zikr, kao-verify-contrast, l2-paket --check, kao-plan-check,
  tekrar-uret; en son kabul testini tek başına koş. Bunu LEDGER gates satırında dürüstçe "kapilar.sh değil, eşdeğer
  paralel koşu" diye yaz.
- Arayüz değiştiyse ekran görüntüsüyle kanıtla (yalnız kullanıcı isterse tarayıcı; CLAUDE.md kontrollü yerel istisna):
  KAO için `tools/gorsel-qa/shoot-modal.mjs <kök> <çıktı> <profil> [genişlik] [dark]` (`KAO_QA_SCAN=1`, `KAO_QA_S0=s0.NN`),
  ana uygulama sekmeleri için `shoot-app.mjs`, panel ilk açılışı için `shoot-panel.mjs`. Ortam:
  `KAO_QA_CHROME=/opt/pw-browsers/chromium-1194/chrome-linux/chrome KAO_QA_NO_SANDBOX=1`; Bash `dangerouslyDisableSandbox`
  ister (kullanıcı onayı). Görüntüler sentetiktir, cihaz değildir; panel yalnız token'sız ilk açılışta çekilir, token/parola
  alanlarına dokunulmaz. 7 paralel çekim düşer; en fazla 2–3 paralel.
- Yayın istenirse (yalnız açık "canlıya al"): pin `20261006d` → sonraki harf; `grep -rl` ile bul (index.html ×17,
  sw.js ×18, panel-v2.html, 8–10 pin taşıyan test + FIX-STATE), pin/yüzey testleri + driver, commit, dala push,
  `git fetch origin main && merge-base --is-ancestor && git push origin HEAD:main`, Pages run (actions_list
  `resource_id: pages.yml`), sonra LEDGER RELEASE kaydı. Örnek: `evidence/K2F-39/YAYIN.md`.
- Cihaz doğrulaması (K2F-26…39 görsel/odak/dakika metinleri, NavBar/alt çubuk/panel-v2 dar ekran düzeltmeleri) kullanıcıdadır;
  "cihazda düzeldi" deme.
```

## Sıradan sonra
- K2F-41 (Kayıtlar ve yönlendirme belgeleri: LEDGER'da D-12 kognat turu "ertelendi" notu, tests/kao/README.md eksik envanter,
  arşive tek düzeltme notu), K2F-42 (kapanış regresyonu), K2F-43 (YAYIN-2, kullanıcı onay kapısı) yalnız sırası gelince okunur.
- Gözlenen ama düzeltilmeyen küçük notlar (LEDGER seq 112): kelime ekranında Arapça kök ortalı/Latin satır solda; geri bildirim
  kartında "Doğru / Doğru —" tekrarı; 200 px ve gerçek cihaz taranmadı (KAO 200 px temiz).
