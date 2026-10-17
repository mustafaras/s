# K3P · K3P-23 oturum başlatıcısı (Okuyucu: senkron yaldız + "Kartlarıma ekle")

**Bu dosya kimin için:** K3P-23'ü uygulayacak yeni oturumun **ilk mesajı** olarak yapıştırılır.
Genel başlatıcı [STARTER.md](STARTER.md)'dir; bu dosya **kritik CSS bütçesi**, **okuyucu kart
şeması** ve **doğrulanmamış lemma** uyarılarını ekler.

---

```text
K3P programındasın (Kur'an Arapçası modalı · "Tezhip"). Repo kökü: /Users/m_ras/Desktop/seyma

1. Önce kao3-premium/BAGLAM-YONETIMI.md belgesini oku. §1–§6 bağlayıcıdır.
2. Şunu çalıştır: node kao3-premium/araclar/senkron.mjs --sonraki
   Çıktıdaki prompt bu oturumun TEK görevidir. Beklenen kimlik: K3P-23 ("Okuyucu: senkron yaldız
   ve 'Kartlarıma ekle'"). Farklı bir kimlik çıkarsa uygulama, bana bildir.
3. Senkron UYUMSUZ derse ya da çalışma ağacı beklenmedik biçimde kirliyse DUR ve bana bildir.
   (Kart "in-progress" ise ağacın kirli olması beklenir; o durumda devir notundan devam et.)
4. Bu kart DALGA SONU DEĞİL (Dalga 4'ün sonu K3P-25). §3 kapanış protokolünü uygula: hızlı kapı →
   K3P-STATE / CURRENT-STATE / LEDGER → uyum denetimi → tek commit → kısa rapor.
   `KAO2_ACCEPT_SLOW_HOST=1 bash tools/kapi/kapilar.sh` bu kartta ZORUNLU DEĞİL; yine de
   `test_kao2_reader` ve `test_kao2_migration` yeşil olmalı (kartın Kabul maddesi).
5. Bağlam yetmezse §4 devir protokolünü uygula: commit yok, devir notu yaz.

⚠️ KRİTİK BÜTÇE UYARISI (ölçüm 2026-10-17, bu dalda):
- **CSS 15,772 / 16 KiB → yalnız 233 B pay kaldı.** Bu kart senkron yaldızı "yalnız CSS" ile
  çözer, yani CSS'e kural EKLEYECEK. Her CSS eklemesinden önce
  `node tests/kao/test_kao2_perf_budget.js` koş ve sayıyı LEDGER'a yaz.
- Pay yetmezse §5 gereği DUR ve tavan kararını bana sor. Kodu büyütmeden önce aynı işi gören
  eski CSS kuralını sil (K3P-20/21/22'de öksüz kalan sınıflar silindi — öksüz seçici bırakma).
- Çalışma zamanı 130,728 / 136 KiB (kalan ~5,3 KiB) · içerik 184,591 / 256 KiB (rahat).
- Yeni sınıf ekliyorsan `test_kao2_design_contract`'ın öksüz seçici denetimini unutma: CSS'te
  tanımlayıp işaretlemede kullanmadığın sınıf kırmızıya döner.

⚠️ DEVralınan ÇELİŞKİ — ÖNCE KARAR VER (2026-10-17 taraması):
- `kaoRevealWord` (yani `App.kaoReader('word', index)`) bugün bilinmeyen kelime için ZATEN kart
  yazıyor ama `kaoLessonMarkIntro` şemasıyla DEĞİL: `state:'learning'`, `reps:1`, `s:0`, `d:0`,
  `r:…`, `due:+1 gün`, `introducedAt`, `tomorrowReason:'reader_unknown'` ve **`readerUnknown:true`**.
- `readerUnknown:true` kartı `isSettled` DIŞINDA bırakır (quranLearn.js ~2972) ve ilk doğru
  cevaptan sonra plan yeniden yazılır (~2485). Yani "okurken anlamı açmak" kelimeyi bilerek
  "bildim" yapmaz — bu bilinçli bir tasarım.
- Kartın istediği "Kartlarıma ekle", `kaoLessonMarkIntro` şemasıyla (`state:'new'` + `introducedAt`)
  AYRI ve BİLİNÇLİ bir ekleme demektir. İkisi çakışır: aynı kart kimliği (`w:<lemma>:ar>tr`) iki
  farklı şemayla yazılamaz.
- **Yapılması gereken:** iki davranışı ayır (okurken gösterme ≠ kartlarıma ekleme), mevcut
  `readerUnknown` davranışını bozma (`test_kao2_reader` yeşil kalmalı) ve kartın "şema eski
  kartlarla aynı / idempotent" ölçütlerini karşıla. Karar veremiyorsan §5 gereği DUR ve bana sor.

Kartın özü (prompt metnini senkron çıktısından oku, burası yalnız hatırlatma):
- **Senkron yaldız:** çalan kelime (`aria-current`) altın halkayla gösterilir; **yalnız CSS**.
  Hareket azaltma açıksa yalnız renk değişir (animasyon/geçiş yok — M7 uyumu).
- **"Kartlarıma ekle":** açılan anlam balonunda düğme; `App.kaoReader('add', index)` çağırır.
  Bu, MEVCUT `kaoReader` çoğaltıcısına eklenen yeni bir EYLEMDİR — yeni handler değildir.
- Kart, `kaoLessonMarkIntro` ile AYNI şemayla kurulur: `introducedAt` + `state: 'new'`.
  Yeni alan uydurma; şema eski kartlarla aynı kalmalı (`test_kao2_migration` bunu denetler).
- **İdempotent:** iki kez eklemek TEK kart üretmeli (ikinci çağrı yeni kart/isim yazmamalı).
- Lemma zaten kartlarındaysa düğme "Kartlarında var" olur ve DEVRE DIŞI kalır.
- **Doğrulanmamış lemma eklenemez** (`lemma.verified === true` değilse ekleme yapılmaz).
- Kabul: yeni test yeşil + `test_kao2_reader` + `test_kao2_migration` +
  `kapi-hizli --kart K3P-23` yeşil.

Değişmez kurallar:
- Push, merge ve deploy yok. Bunlar yalnız K3P-27'de, benim AÇIK onayımla yapılır. (Yayın
  onayını ben ayrıca veririm; sen kendiliğinden push etme.)
- Uygulamayı tarayıcıda açma (CLAUDE.md DATA SAFETY).
- mustafaras/seyma-data deposuna yazma.
- Token ya da parola isteme.
- Yeni App.kao* handler ekleme (45'te kalır); gerekiyorsa mevcut eylem çoğaltıcılarını kullan.
- `data` şeması ve `migrate()` değişmez (I1–I6).
```

---

**İlerlemeyi görmek için:** `node kao3-premium/araclar/senkron.mjs --liste`
**Bu kartın tam metni:** `node kao3-premium/araclar/senkron.mjs --prompt K3P-23`
**Dosya yeri notu:** K3P-23 `app/core/quranLearn.js` ve `app/kao.css` dosyalarına dokunur; ikisi
de **pinli** olduğu için kart bitince `K3P-STATE.json → pinDeferral.files`'a eklenmeli (K-P).
