# K3P · K3P-10 oturum başlatıcısı (Dalga 1 sonu · Görsel sistem kapanışı)

**Bu dosya kimin için:** K3P-10'u uygulayacak yeni oturumun **ilk mesajı** olarak yapıştırılır.
Genel başlatıcı [STARTER.md](STARTER.md)'dir; bu dosya **dalga sonu**, **hareket grameri** ve
**üç dar bütçe** (runtime · css · app.js kabuğu) uyarılarını ekler.

---

```text
K3P programındasın (Kur'an Arapçası modalı · "Tezhip"). Repo kökü: /Users/m_ras/Desktop/seyma

1. Önce kao3-premium/BAGLAM-YONETIMI.md belgesini oku. §1–§6 bağlayıcıdır.
2. Şunu çalıştır: node kao3-premium/araclar/senkron.mjs --sonraki
   Çıktıdaki prompt bu oturumun TEK görevidir. Beklenen kimlik: K3P-10 ("Hareket grameri —
   Dalga 1 sonu"). Farklı bir kimlik çıkarsa uygulama, bana bildir.
3. Senkron UYUMSUZ derse ya da çalışma ağacı beklenmedik biçimde kirliyse DUR ve bana bildir.
4. Bu kart DALGA SONU: §3 kapanış protokolüne ek olarak
   `KAO2_ACCEPT_SLOW_HOST=1 bash tools/kapi/kapilar.sh` koş ve "TÜM KAPILAR YEŞİL" çıktısını gör.
   LEDGER'a DÜZELTME değil, NORMAL kayıt yaz ve Dalga 1 özetini düş: K3P-06…10'u tek tek
   (ne yaptı + ölçü) listele; dalga kapanış ölçülerini (runtime · css · kontrast · test sayısı) ver.
5. Bağlam yetmezse §4 devir protokolünü uygula: commit yok, devir notu yaz.

⚠️ ÜÇ DAR BÜTÇE (devralınan ölçüm, 2026-10-13 · birleşik ara yayın 20261013c canlıda):
- Çalışma zamanı 127,987 / 128 KiB (gzip L6; L9 127,650) — pay yalnız ~0,013 KiB
  (tests/kao/test_kao2_perf_budget.js ve test_kao2_mastery.js bunu iki ayrı seviyede ölçer).
- CSS 14,372 / 16 KiB (bu tavan K3P-09'da benim kararımla 14→16 yükseltildi).
- app.js kabuğu 7800 / 7800 satır (tests/app/test_modularization_boundary.js · test_aeon_mail_outbox.js)
  → app.js'te TEK SATIR BİLE yer yok. app.js'e dokunacaksan önce aynı işi gören eski satırı sil.
- Bu kart HEM CSS HEM JS ekler. HER commit'ten önce runtime'ı ve app.js satır sayısını ölç,
  sayıyı LEDGER'a yaz. Pay yetmezse §5 gereği DUR ve tavan kararını bana sor; kodu büyütmeden
  önce aynı işi gören ESKİ kodu sil (K3P-09'da ölü KAO_S0_SHAPES böyle silindi).

Kartın özü (prompt metnini senkron çıktısından oku, burası yalnız hatırlatma):
- Hareket sınıfları --kao-dur-micro/transition/moment ve --kao-ease (K3P-06'da tanımlandı) ile:
  görev geçişi 24 px yatay kayma + opaklık, EN ÇOK 240 ms (D-5 → --kao-dur-transition, 200 ms);
  şık basışı 120 ms küçülme (--kao-dur-micro); ✓ işareti yaylanarak belirir (--kao-ease).
- `kaoFx('wrong')` EKLENİR: seçilen şık BİR KEZ yatay sarsılır; `SeyHaptics.error` varsa yalnız o
  çalışır, SES ÇALMAZ (D-6 hata-dostu dil: kırmızı yok, "yanlış!" yok, ceza sesi yok).
  Çağrı yeri: `kaoAnswer` içindeki yanlış yolu. `kaoFx` bugün quranLearn.js ~1872'de.
- SeyHaptics yöntemleri: `tap`, `success`, `error` var; **`warning` YOK** (mediaFx.js ~527–545).
- Hareket azaltma: `prefers-reduced-motion` ya da `SeyFx.shouldAnimate() === false` iken HİÇBİR
  animasyon çalışmaz. İki kanıt: (a) kao.css metin taraması testi, (b) `kaoFx` için birim testi.
- Yeni `App.kao*` handler YOK (45'te kalır); mevcut eylem çoğaltıcılarını kullan.

Kabul:
- Testler yeşil (yeni metin-taraması testi + kaoFx birim testi).
- `kapi-hizli --kart K3P-10` yeşil.
- `KAO2_ACCEPT_SLOW_HOST=1 bash tools/kapi/kapilar.sh` → "TÜM KAPILAR YEŞİL".

Değişmez kurallar:
- Push, merge ve deploy yok. Bunlar yalnız K3P-27'de, benim AÇIK onayımla yapılır. (Ara yayınları
  ben ayrıca onaylarım; sen kendiliğinden push etme. Şu an main = 20261013c, dal = kao3-premium.)
- Uygulamayı tarayıcıda açma (CLAUDE.md DATA SAFETY). Ekran görüntüsü istersem kontrollü yerel
  CDP aracını kullanırım (KAO_QA_CHROME; sunucu açmaz, token/forceSync yok).
- mustafaras/seyma-data deposuna yazma.
- Token ya da parola isteme.
- Pin yükseltme yok (K-P): değiştirdiğin pinli dosyaları K3P-STATE.pinDeferral.files'a ekle;
  yükseltme K3P-27'de tek geçişte.
```

---

**İlerlemeyi görmek için:** `node kao3-premium/araclar/senkron.mjs --liste`
**Bu kartın tam metni:** `node kao3-premium/araclar/senkron.mjs --prompt K3P-10`
**Dalga 1'in tamamı:** K3P-06 (tokenlar) → K3P-07 (yazı tipi) → K3P-08 (Arapça tipografi) →
K3P-09 (materyal hiyerarşisi + an kartı) → **K3P-10 (hareket grameri · kapanış)**.
**Kapanışta:** dalga sonu tam kapısı + LEDGER'da Dalga 1 özeti. Yayın (push) ayrı onayımla.
