# Denetim-3 düzeltmeleri — devam starter'ı (D3F-15'ten itibaren)

Kullanım: yeni bir Claude Code oturumunda, depo kökünde (`/Users/m_ras/Desktop/seyma`, dal `main`) aşağıdaki kutuyu olduğu gibi yapıştır.
(Önceki starter D3F-06'dan başlıyordu; git geçmişinde `c4116a53`.)

```text
Şeyma deposunda "denetim-3 düzeltmeleri" programına devam ediyorsun (önek D3F-NN). Kaynak rapor:
kao2-duzeltme/denetim-3/DENETIM-3-RAPORU.md (19 bulgu, F-01…F-19). Durum: kao2-duzeltme/denetim-3/D3F-STATE.json
(findings.F-NN.status, commits, releases, pins, openDecisions). Her düzeltmenin kanıtı evidence/D3F-NN/KANIT.md (+ mutasyon betiği).

DURUM (2026-10-08 akşamı, HEAD 8e411e61 = origin/main, ağaç temiz)
- fixed F-01…F-14 (D3F-01…D3F-14). nextFinding F-15. Yayın pini 20261008d (D3F-STATE.pins.release = index.html = sw.js SW_VERSION).
- Canlıda: YAYIN-4…YAYIN-8 (son: YAYIN-8, Pages run 37814250275, 63/63 bayt-eşit). Hepsi D3F-STATE.releases'ta onay alıntısıyla.
- YAYIN-5 ve YAYIN-6 tam kapıyı kullanıcı kararıyla atladı (çalışma zamanı farkı yoktu). YAYIN-8 perf MUTLAK tavanı
  (p95 ≤ 40 ms) kırmızıyken çıktı: yük ortalaması 53'tü; A/B (taban 8f0a3d10 ↔ HEAD, dönüşümlü) regresyon göstermedi
  (evidence/YAYIN-8/YAYIN.md). → ÇALIŞMA ZAMANINA DOKUNAN BİR SONRAKİ YAYINDA tam kapıyı SAKİN makinede koş; önce `uptime`.
- Açık karar (kullanıcıda, DOKUNMA): openDecisions.perf-goreli-bant (göreli p95 bandı bu makinede oynak).
- Kapanmış programlar: FIX-STATE ve D2F-STATE closeCommit=128ab06d (araçlar kodu oradan ölçer). Kayıtlarına yalnız düzeltme
  NOTE'u eklenir (geçmiş satır değişmez). Son NOTE'lar: FIX LEDGER seq 127 (D3F-07); denetim-2 LEDGER seq 25–29 (D3F-05/08/12/13/14).

ÇALIŞMA BİÇİMİ (kullanıcının kuralı — ihlal etme)
1. Bulguları TEK TEK düzelt. Her düzeltmenin sonunda dur, ne yaptığını ve sıradakinin planını yaz, ONAY iste. Onaysız sonrakine geçme.
2. Her bulgu bir yerel commit: "D3F-NN: …"; ek gerekirse "D3F-NN: ek — …". Commit sonuna:
   Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
   D3F-STATE: findings.F-NN → fixed + evidence, nextFinding, commits ("(bu commit)" yaz; hash bir sonraki commit'te yazılır).
3. Push/deploy YALNIZ kullanıcının açık talimatıyla ("canlıya al", "push … deploy", "hepsini yap" gibi). Yayın kaydı:
   evidence/YAYIN-N/YAYIN.md (onay birebir alıntı · kapsam · pin · yayın farkı · kapı sonucu ya da SAPMA) → ff push → Pages run (API)
   → canlı bayt eşitliği (+ gizlilik 404) → CANLI.md → commit + push. Kapı kırmızıysa yayınlama; günlüğü oku, kullanıcıya sor.
4. Çalışma zamanı dosyası (app/, index.html, sw.js, panel-v2.html'in yüklediği dosyalar) değişirse pin yükselt (her düzeltme kendi pini):
   20261008d → 20261008e … : `git grep -l <eski> -- index.html sw.js panel-v2.html tests/ | while IFS= read -r f; do perl -pi -e 's/<eski>/<yeni>/g' "$f"; done`
   + D3F-STATE.pins.release. tests/app/test_asset_pin_freshness.js (D3F-10) pinsiz değişikliği OTOMATİK yakalar (kabul A-9 de kırmızı olur).
5. TDD: önce test/denetim betiği, RED'i ÇIKTI METNİYLE doğru nedenle gör, sonra düzelt, GREEN. Mutasyon betiği evidence/D3F-NN/ altına
   (taze klon, ağsız, "mutasyon noktası yok" ise çıkış 2, her kırmızı beklenen metinle eşleştirilir). Mutasyon HAYATTA kalırsa ya test zayıftır
   (güçlendir — D3F-09 M3) ya mutant eşdeğerdir (D3F-11 M3: choiceList zaten tekilleştiriyordu) — ikisini de KANIT'a dürüstçe yaz.
   Sabit sayı yazma; beklentiyi veriden hesapla (D3F-09 ek: sabit "132" bayatladı).
6. Arapça içerik/okunuş ELLE YAZILMAZ: yalnız tools/kao-lexicon-build.mjs, tools/kao-content-freeze.mjs, tools/kao2-curriculum-build.mjs.
   Araç çıktısı araç değiştirilip yeniden üretilir; iki üretim bayt-eş olmalı (`--out-dir` boş dizinle karşılaştır).
   İnceleme sayfalarındaki [x] işaretleri "bağlam" eşleşmesiyle taşınır: blok/satır METNİNİ değiştirme; ek bilgi "- İnceleme:" satırına ya da
   tablo düzey hücresinin backtick'i içine (D3F-06/12).
7. Kapı: `KAO2_ACCEPT_SLOW_HOST=1 bash kao2-duzeltme/tools/kapilar.sh` (~20–30 dk) İZOLE KLONDA:
   `T=$(mktemp -d "$TMPDIR/x.XXXX"); git clone -q . "$T/r"`. Kapı koşarken aynı makinede ağır iş (mutasyon betikleri, test döngüleri)
   ÇALIŞTIRMA — perf mutlak tavanı yükle kırmızıya döner (YAYIN-8). Kırmızıda günlük $TMPDIR/kapilar-…/ altında; tahmin etme, oku.
8. Kapıları commit'ten SONRA da koş (temiz ağaç). Hızlı set (~5 dk): kao-plan-check · fix-sync-check --clean · d2f-sync-check --strict --clean ·
   tests/app/test_asset_pin_freshness.js · evidence/D3F-08/pages-kayit-denetimi.mjs · evidence/D3F-13/belge-denetimi.mjs ·
   mutasyonlar D3F-03 · D3F-04 · D3F-06 · D3F-07 · D3F-08 · D3F-09 · D3F-10 · D3F-11 · D3F-12 · D3F-14.
9. İlerleme günlüğü: uzun işlerin çıktısını `tee -a /tmp/claude-501/seyma-ilerleme.log` ile yaz (kullanıcı `tail -f` ile izliyor;
   /tmp kökü sandbox'ta yazılamaz, /tmp/claude-501 yazılır).
10. zsh tuzakları: `for u in $liste` kelime bölmez → `| while IFS= read -r u`. `$(...)` içinde ters tırnaklı JS → bash komut ikamesi;
    JS'te String.fromCharCode(96) kullan. `git log --follow` ile `--reverse` birlikte çalışmaz (JS'te ters çevir).
    Canlı ölçümde tek seferlik `curl -sf` hatası FARKLI gösterebilir → FARKLI'yı 3 kez yeniden dene, sonucu ayrı yaz.
11. CLAUDE.md DATA SAFETY: tarayıcı açma, sunucu kurma, mustafaras/seyma-data'ya yazma, gizli bilgi isteme yok.
    Ağ: yalnız github.com (push), api.github.com (run izleme), mustafaras.github.io (canlı okuma) — Bash allowed_domains ile.
12. Dürüstlük: ölçemediğini "ÖLÇÜLMEDİ (neden)" yaz; kanıt düzeylerini ayır (kaynak/test · yayın · canlı · cihaz).
    Kullanıcı/uzman/cihaz kanıtı gerektireni (L2, A-11/A-12, ekran okuyucu) "doğrulandı" yazma; onay türünü abartma
    (explicit / inferred / ai-delegated — D3F-07). Rapordaki sayıyla yetinme; genel değişmezle ölç (D3F-08/10 raporun ötesinde gerçek bulgu buldu).

KALAN BULGULAR (önce raporun ilgili bölümünü ve kodu oku, kendin ölç)
- F-15 DÜŞÜK · `d2f-sync-check --audit-k2f`: KAO2-FIX'in 44 KANIT'ının 43'ünde "Oturum:" yok, 7'sinde bölüm eksik — tarihsel, yalnız raporlanıyor.
  Oturum kimliği sonradan UYDURULAMAZ. Öneri: araçla yeniden say, hangi dosyada ne eksik listele, geçmişi yeniden yazmadan FIX LEDGER'a
  düzeltme NOTE'u (seq 128) + FIX-STATE.ledgerLastSeq + CURRENT-STATE senkronu ("Canlı gerçekler" yeniden ölçülerek). Kod/pin yok.
- F-16 DÜŞÜK · app/core/quranLearn.js okuyucu "Kelime anlamı" paneli role="dialog" ama aria-modal/odak/Escape yok, satır içi panel →
  role="region" + aria-live (CLAUDE.md "Modal keyboard contract" modal OLMAYAN panel için geçerli değil; erişilebilirlik fixture'larını
  tests/kao/test_kao2_a11y.js vb. güncelle). ÇALIŞMA ZAMANI → pin 20261008e + tam kapı (sakin makine). Ekran okuyucu doğrulaması kullanıcıda.
- F-17 DÜŞÜK · D2F-16 ölçütü ("CANLI.md kullanıcı çıktısıyla · tek commit") birebir sağlanmadı: komutu Claude çalıştırdı, 2 commit oldu;
  kayıt dürüst. Yalnız kayıt notu (denetim-2 LEDGER seq 30).
- F-18 DÜŞÜK · 8bf8f658 süreç dışı (öneksiz, testlerden önce, plan dışı pin 20261006c) ama "tutuldu" kararı doğru — kayıt (LEDGER seq 21'de
  karar var; eksik kalan bir şey varsa yalnız not).
- F-19 DÜŞÜK · depo public: Pages'te gizlilik yolları 404, ama raw.githubusercontent'ta okunur (kişisel veri yok). Kapsam kararı
  KULLANICININ — yalnız bildir, depo görünürlüğünü değiştirme, dosya silme.

BAŞLA: D3F-STATE.json ve raporun F-15 bölümünü oku; `git status -sb` + `git log --oneline -5` (beklenen: main = origin/main, temiz;
bu starter commit'i HEAD olabilir) ve `uptime`; F-15 planını kullanıcıya kısaca söyle ve onay alınca başla.
```
