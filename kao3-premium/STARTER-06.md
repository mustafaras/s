# K3P · K3P-06 oturum başlatıcısı (Dalga 1 başlangıcı)

**Bu dosya kimin için:** K3P-06'yı uygulayacak yeni oturumun **ilk mesajı** olarak yapıştırılır.
Genel başlatıcı [STARTER.md](STARTER.md)'dir; bu dosya **Dalga 1'in ilk kartı**, **token sözleşmesi**
ve **dar çalışma zamanı bütçesi** uyarılarını ekler.

---

```text
K3P programındasın (Kur'an Arapçası modalı · "Tezhip"). Repo kökü: /Users/m_ras/Desktop/seyma

1. Önce kao3-premium/BAGLAM-YONETIMI.md belgesini oku. §1–§6 bağlayıcıdır.
2. Şunu çalıştır: node kao3-premium/araclar/senkron.mjs --sonraki
   Çıktıdaki prompt bu oturumun TEK görevidir. Beklenen kimlik: K3P-06 ("Tasarım tokenları").
   Farklı bir kimlik çıkarsa uygulama, bana bildir.
3. Senkron UYUMSUZ derse ya da çalışma ağacı beklenmedik biçimde kirliyse DUR ve bana bildir.
4. Bitirirken §3 kapanış protokolünü uygula: kapi-hizli → K3P-STATE / CURRENT-STATE / LEDGER → tek commit → kısa rapor.
5. Bağlam yetmezse §4 devir protokolünü uygula: commit yok, devir notu yaz.

DURUM (2026-10-13): Dalga A kapandı; dokuzuncu ara yayın canlıda (ortak sürüm 20261013a, Pages run
38363872562 success). Sıradaki kart Dalga 1'in ilk adımıdır.

⚠️ KRİTİK BÜTÇE UYARISI:
- Çalışma zamanı 127,654 / 128 KiB → yalnız ~0,35 KiB pay (tests/kao/test_kao2_perf_budget.js).
- `app.js` kabuk bütçesi 7799 / 7800 satır (tests/app/test_aeon_mail_outbox.js · test_modularization_boundary.js).
  Bu kart `kao.css` ağırlıklıdır; yine de HER commit'ten önce runtime'ı ve (app.js'e dokunursan)
  satır sayısını ölç ve sayıyı LEDGER'a yaz. Pay yetmezse §5 gereği DUR ve tavan kararını bana sor;
  kodu büyütmeden önce aynı işi gören eski kodu sil.
- CSS 13,190 / 14 KiB.

Kartın özü (prompt metnini senkron çıktısından oku, burası yalnız hatırlatma):
- Tokenları TANIMLA; bu kartta onları KULLANAN kural değişikliği YOK (kullanmak K3P-07…10'un işi).
- Materyal: `--kao-mat-ground`, `--kao-mat-card`, `--kao-mat-moment`; gölge: `--kao-shadow-1/-2`;
  Arapça ölçek: `--kao-ar-hero/body/inline`; hareket: `--kao-ease`, `--kao-dur-micro/transition/moment`.
- Renkler yalnız `--quran*`'tan `color-mix` ile türer → **yeni hex yok**. Süreler mevcut `--dur-*`'a bağlanır.
- Açık VE koyu temada tanımla. Sözleşme testini gevşetme; yalnız izin listesini gerekçesiyle GENİŞLET.
- Dikkat: `tests/kao/test_kao_render.js` KAO CSS'inde tüketilen token adlarını izin listesiyle denetler
  (`--kao-(bg|surface|label|sep|tint|accent|ok|fix|r-*|gutter|gap-*|row)` · `--(quran|faith|f-|dur-|kao-ar-)`).
  Yeni tokenlar bu listeye girmiyorsa o test gerekçeli genişletilmeli.
- Kabul: `test_kao2_design_contract` yeşil · kontrast aracı yeşil · `kapi-hizli --kart K3P-06` yeşil.

Değişmez kurallar:
- Push, merge ve deploy yok. Bunlar yalnız K3P-27'de, benim AÇIK onayımla yapılır; sen kendiliğinden push etme.
- Uygulamayı tarayıcıda açma (CLAUDE.md DATA SAFETY).
- mustafaras/seyma-data deposuna yazma.
- Token ya da parola isteme.
- Yeni App.kao* handler ekleme (45'te kalır).
```

---

**İlerlemeyi görmek için:** `node kao3-premium/araclar/senkron.mjs --liste`
**Bu kartın tam metni:** `node kao3-premium/araclar/senkron.mjs --prompt K3P-06`
**Dalga 1'in tamamı:** K3P-06…10 (token → yazı tipi → Arapça tipografi → materyal → hareket).
**Yayın:** bir sonraki dalga sonu K3P-10.
