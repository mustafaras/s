# Denetim-3 düzeltmeleri — devam starter'ı (D3F-06'dan itibaren)

Kullanım: yeni bir Claude Code oturumunda, depo kökünde (`/Users/m_ras/Desktop/seyma`, dal `main`) aşağıdaki kutuyu olduğu gibi yapıştır.

```text
Şeyma deposunda "denetim-3 düzeltmeleri" programına devam ediyorsun (önek D3F-NN). Kaynak rapor:
kao2-duzeltme/denetim-3/DENETIM-3-RAPORU.md (19 bulgu, F-01…F-19). Durum: kao2-duzeltme/denetim-3/D3F-STATE.json
(findings.F-NN.status, commits, releases, openDecisions). Her yapılan düzeltmenin kanıtı evidence/D3F-NN/KANIT.md.

DURUM (2026-10-08 sonu)
- fixed: F-01 (g21-k1 aynı kök), F-02 (render testi saatten bağımsız), F-03 (kapilar.sh hatayı geçirmez/gizlemez),
  F-04 (strictExceptions hash'e bağlı; kapanış sonrası D2F/K2F öneki yasak), F-05 (D2F-12 uygulayıcısı Copilot CLI kaydı).
- YAYIN-4 canlıda: pin 20261008a, origin/main 700cae25, Pages run 37781196494 success, canlı 63/63 bayt-eşit
  (evidence/YAYIN-4/). Onay kullanıcının birebir cümlesi; D3F-STATE.releases.YAYIN-4.
- Açık karar (kullanıcıda, DOKUNMA): openDecisions.perf-goreli-bant — bayraksız kapıda göreli p95 bandı bu makinede oynak;
  güvenilir kapı koşusu KAO2_ACCEPT_SLOW_HOST=1 ile.
- Sıradaki: F-06. Sıra: F-06 → F-07 → F-08 → F-09 → F-10 → F-11 → F-12 → F-13 (CURRENT-STATE kısmı D3F-05'te kapandı)
  → F-14 → F-15 → F-16 → F-17 → F-18 → F-19.

ÇALIŞMA BİÇİMİ (kullanıcının kuralı — ihlal etme)
1. Bulguları TEK TEK düzelt. Her düzeltmenin sonunda dur, ne yaptığını ve sıradakinin planını yaz, ONAY iste.
   Onay gelmeden sonraki bulguya geçme. Birden çok bulguyu tek seferde uygulama.
2. Her bulgu bir yerel commit: "D3F-NN: …" (NN = bulgu numarası). Commit sonunda:
   Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
   Ek commit gerekirse "D3F-NN: ek — …" ve D3F-STATE.commits'e yaz. Push/deploy YALNIZ kullanıcının açık talimatıyla.
3. Çalışma zamanı dosyası (app/, index.html, sw.js, panel-v2.html'in yüklediği dosyalar) değişirse pin yükselt
   (kullanıcı kararı: her düzeltme kendi pinini). Pin 20261008a → bir sonraki (ör. 20261008b): index.html, sw.js (SW_VERSION
   ve SW_OFFLINE_VERSION), panel-v2.html ve pin taşıyan 12 test dosyası (`git grep -l <eski pin> -- index.html sw.js panel-v2.html tests/`;
   zsh'ta for-döngüsüyle değil `| while IFS= read -r f` ile değiştir). D3F-STATE.pins.release'i aynı commit'te güncelle —
   kapilar.sh "d3f pin senkronu" kapısı bunu sınar.
4. TDD: önce testi/mutasyonu yaz, RED'i gör, sonra düzelt, GREEN. Mutasyon betikleri depoya (evidence/D3F-NN/) girer,
   yeniden üretilebilir olmalı (F-14 dersi). Mutasyonun DOĞRU nedenle kırmızı olduğunu çıktı metniyle doğrula.
5. Arapça içerik/okunuş ELLE YAZILMAZ: yalnız tools/kao-lexicon-build.mjs, tools/kao-content-freeze.mjs,
   tools/kao2-curriculum-build.mjs çıktısı. Araçla üretilen sayfa/modül araç değiştirilip yeniden üretilir; iki üretim bayt-eşit olmalı.
6. Kapı: `bash kao2-duzeltme/tools/kapilar.sh` (~20 dk). KOMUT SÜRERKEN AYNI AĞAÇTA DEĞİŞİKLİK YAPMA (bir koşu böyle geçersiz oldu);
   uzun koşuları izole klonda yap: `T=$(mktemp -d "$TMPDIR/x.XXXX"); git clone -q . "$T/r"` (+ değişen dosyaları kopyala).
   Kırmızıda kapı çıktıyı $TMPDIR/kapilar-…/ altına yazar ve yolunu gösterir — tahmin etme, günlüğü oku.
7. Kapıları commit'ten SONRA da koş (temiz ağaç): kao-plan-check geçmişe bakar, commit'lenmemiş hâlde yeşil görünüp
   commit'te kırmızı olabilir (D3F-01'de oldu). Hızlı set: kao-plan-check · fix-sync-check --clean · d2f-sync-check --strict --clean
   · evidence/D3F-03/kapilar-mutasyon.sh · evidence/D3F-04/d2f-mutasyon.sh.
8. Kapanmış programlar dondu: FIX-STATE ve D2F-STATE closeCommit=128ab06d; araçlar kodu oradan ölçer. Onların LEDGER'ına
   yalnız düzeltme NOTE'u eklenebilir (geçmiş satır değişmez); ekleyince STATE.ledgerLastSeq, CURRENT-STATE senkron bloğu ve
   "Canlı gerçekler" (yeniden ÖLÇEREK, tarihi kaydırarak değil) güncellenir. Örnek: LEDGER seq 25 (D3F-05).
9. CLAUDE.md DATA SAFETY geçerli: tarayıcı açma, sunucu kurma, mustafaras/seyma-data'ya yazma, gizli bilgi isteme yok.
   Ağ: yalnız github.com / api.github.com / mustafaras.github.io okuma (Bash allowed_domains ile) ve onaylı push.
10. Dürüstlük: ölçemediğini "ÖLÇÜLEMEDİ (neden)" yaz; kanıt düzeylerini ayır (kaynak/test · yayın · canlı · cihaz).
    Kullanıcı/uzman/cihaz kanıtı gerektireni (L2, A-11/A-12, ekran okuyucu) "doğrulandı" yazma; kimin ne yaptığını gizleme.

KALAN BULGULAR (rapordaki §4 ve §7 önerileri; önce raporun ilgili bölümünü ve kodu oku, kendin doğrula)
- F-06 ORTA · docs/kuran-ogreniyorum/kao2/inceleme/INCELEME-KAO2-17.md'deki 133 "[x] L1 metin uygun" kutusunu yetki devriyle
  yapay zekânın koyduğu sayfada yazmıyor. Üretici tools/kao2-curriculum-build.mjs (OUT_TEXT_REVIEW); açıklamayı veriden
  (texts.tr.json review.by/delegatedBy/delegatedAt) türet, aracı değiştir, yeniden üret, test: tests/kao/test_kao2_text_review.js
  (+ review_apply). Çalışma zamanı modülü (quranCurriculumV2.js) değişmemeli → pin gerekmez; değişirse 3. kurala uy.
- F-07 ORTA · FIX-STATE.releaseApproval "approved_through_K2F-43" abartılı: K2F-43 yayını çıkarımla (LEDGER seq 123), YAYIN-3
  devirle (D2F seq 23) onaylandı. Öneri: "inferred_K2F-43 + ai-delegated_YAYIN-3" + açıklama. fix-sync-check alanı zorunlu tutar.
- F-08 ORTA · 3f3b28cd'nin push/deploy'u (Pages run 37647239210, Copilot oturumu) kayıtsız → D2F LEDGER düzeltme NOTE'u.
- F-09 ORTA · texts.tr.json lessons["u09.01"].review at/delegatedAt 2026-10-02 ama metin 2026-10-07'de (2fe3abf6) yeniden yazıldı.
  Araç/inceleme hattıyla düzelt; sayımlar (158 sourced) bozulmamalı; quranCurriculumV2.js etkileniyorsa pin.
- F-10 ORTA · app/core/state.js, zikir.js, skyFx.js, panel/panelCoverageManifest.js pinsiz değişmiş (kapsam dışı, canlıda):
  ?v= yükselt (index.html / panel-v2.html / sw.js listeleri), ilgili pin testleri.
- F-11 DÜŞÜK · g17-k2 "Bu emir kime söylenmiş?" şıkları ("siz (söz)" / "siz (kulluk)") kişiyi değil anlamı sınıyor.
- F-12 DÜŞÜK · 12 ünitenin why metni whyReview: draft (görünür değil) — kayıt/sayım dürüstlüğü.
- F-13 DÜŞÜK (kısmen) · kalan: DUZELTME-SONUCU.md (§1 "14/14", SW_VERSION 20261007a, §2 "13 kayıt"), CLAUDE.md + AGENTS.md
  KAO satırı "130 KB açık karar" (karar KAO2/K2F-09'da verildi; iki dosya aynı tutulur), DEVIR-LISTESI §3 "açık görünür"
  (gerçekte kapalı •••, dokununca açılır).
- F-14 DÜŞÜK · D2F-05/09 mutasyon betikleri depoda yok. D3F-04'ün d2f-mutasyon.sh'ı D2F-09 iddiasının bir kısmını yeniden üretir;
  eksik kalanı (D2F-05) belirle ve ya ekle ya da açıkça "yeniden üretilemez" yaz.
- F-15 DÜŞÜK · --audit-k2f: 43/44 K2F KANIT'ında "Oturum:" yok, 7'sinde bölüm eksik — tarihsel; rapor/kayıt kararı.
- F-16 DÜŞÜK · quranLearn.js okuyucu "Kelime anlamı" paneli role="dialog" ama modal değil → role="region" + aria-live
  (modal sözleşmesi CLAUDE.md; erişilebilirlik fixture'ları; pin).
- F-17 DÜŞÜK · D2F-16 ölçütü birebir sağlanmadı (kayıt dürüst) — kayıt notu.
- F-18 DÜŞÜK · 8bf8f658 süreç dışı, tutma kararı doğru — kayıt.
- F-19 DÜŞÜK · depo public, gizlilik yolları raw.githubusercontent'ta okunur — kapsam kararı kullanıcınındır; yalnız bildir.

BAŞLA: D3F-STATE.json'u ve raporun F-06 bölümünü oku, `git status -sb` + `git log --oneline -12` ile durumu doğrula
(beklenen: main temiz; origin/main 700cae25'in önünde yalnız YAYIN-4 canlı kaydı + bu starter commit'i olabilir), F-06 planını
kullanıcıya kısaca söyle ve onay alınca başla.
```
