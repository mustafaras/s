# Zikirmatik — iPhone 16 Pro Max Premium Uygulama Prompt Paketi

> **Belge türü:** Sıralı ve uygulanabilir geliştirme promptları
> **Kapsam:** Yalnızca Zikirmatik
> **Hedef branch:** `zikirmatik-iphone16-redesign`
> **Canlı durumu:** Kullanıcı onayı gelene kadar `main`e merge ve canlı deploy yok
> **Tamamlanma hedefi:** Opak, tam ekran, güvenilir, erişilebilir; 99 Esmâ’nın
> Türkçe anlamı, önemi/tefekkür bağlamı ve kaynaklarıyla çalışan kalıcı
> Zikirmatik

Bu paket, `ZIKIRMATIK-GELISTIRME-PLANI.md` içindeki ürün ve matematik
kararlarını uygulama sırasına dönüştürür. Promptlar **ZP-00 → ZP-19**
sırasıyla çalıştırılır. Bir promptun kabul kapısı geçmeden sonraki prompta
geçilmez.

---

## 1. “Bilimsel” ve “dinî içerik” için dürüstlük sözleşmesi

Bu üründe **bilimsel yaklaşım** şu ölçülebilir mühendislik özelliklerini
ifade eder:

- sayaç ve Ebced² matematiğinin deterministik doğruluğu,
- çift dokunma/çift olay kaynaklı hatalı sayımı önleme,
- veri kaybına karşı idempotent migration ve monotonik merge,
- düşük bilişsel yük ve açık bilgi hiyerarşisi,
- erişilebilirlik, okunabilirlik ve motor hata toleransı,
- gözlemlenebilir kabul ölçütleri ve tekrar çalıştırılabilir testler,
- kullanıcıya ait istatistikleri yargılamadan gösterme.

Şunlar **bilimsel gerçek gibi yazılmaz**:

- Bir Esmâ’yı belirli sayıda okumanın belirli dünyevî sonucu garanti ettiği,
- Ebced veya Ebced² sayısının dua ya da zikrin kabul şartı olduğu,
- Sayaç kullanımının tek başına tıbbi/psikolojik tedavi sağladığı,
- “dopamin”, “sinir sistemi”, “beyin frekansı” gibi ölçülmeyen biyolojik
  açıklamalar,
- Kaynaksız fazilet, hadis, sayı reçetesi veya dinî hüküm.

Dinî içerikte üç katman birbirinden ayrılır:

1. **Türkçe anlam:** Yetkili/kurumsal kaynakla uyumlu kısa anlam.
2. **Önemi ve tefekkür bağlamı:** İsmi tanımaya yardımcı olan, hüküm veya
   sonuç garantisi vermeyen, sakin ve kaynaklı açıklama.
3. **Geleneksel sayı bilgisi:** Ebced yönteminin adı, hesap yazımı ve
   bağlayıcı olmadığına dair açıklama.

Arayüzde kalıcı kısa not:

> “Ebced², geleneksel ebced hesabına dayalı kişisel bir tamamlama
> yolculuğudur; dua ve zikrin kabulü için zorunlu bir sayı değildir.”

---

## 2. Değişmez proje ve veri güvenliği kuralları

Her prompt aşağıdaki kuralları miras alır:

- Önce `AGENTS.md`, `CLAUDE.md`, `ZIKIRMATIK-GELISTIRME-PLANI.md` ve bu dosya
  okunur.
- Uygulama gerçek tarayıcıda açılmaz; yerel server başlatılmaz.
- Doğrulama yalnız ağ erişimi kapalı Node `vm` harness ile yapılır.
- `mustafaras/seyma-data` reposuna hiçbir yazma yapılmaz.
- `sync.js` içindeki localhost ve anti-clobber korumaları zayıflatılmaz.
- Tek kalıcı kaynak `data` nesnesidir; yeni alanlar `migrate()` ile backfill
  edilir.
- Vanilla HTML/CSS/JS düzeni, inline `App.*` handler deseni ve mevcut overlay
  mimarisi korunur.
- Kullanıcının mevcut Zikirmatik verisi silinmez, yeniden yorumlanmaz veya
  sessizce sıfırlanmaz.
- Zikirmatik kullanıcıya kapalı kalır:
  `ZIKR_V2_VISIBLE` ve `ZIKR_V2_VISIBLE_P` yayın onayına kadar açılmaz.
- Tasarım değişiklikleri yalnız `zikirmatik-iphone16-redesign` branch’inde
  yapılır.
- Her faz sonunda `git diff --check` ve ilgili testler çalıştırılır.
- Başarısız test varken “tamamlandı” yazılmaz.
- `index.html` cache sürümü yalnız bütün kod fazları bitince bir kez artırılır.
- `main`e merge ve GitHub Pages deploy yalnız kullanıcının açık onayıyla
  yapılır.

---

## 3. Cihaz, yerleşim ve görsel kalite sözleşmesi

Zikirmatik gerçek bir tam ekran araç gibi davranır:

- `position: fixed; inset: 0; width: 100%; min-height: 100dvh`,
- `100svh` ve eski Safari için güvenli fallback,
- üst/alt `env(safe-area-inset-*)` desteği,
- Dynamic Island, tarayıcı çubukları ve PWA standalone modu ile çakışmama,
- birincil doğrulama görünümü: geniş Pro Max sınıfı portre ekran,
- ek regresyon genişlikleri: `390`, `393`, `430`, `440` CSS px,
- yükseklikler ve safe-area değerleri hardcode edilmez,
- kullanıcı büyük yazı seçtiğinde içerik kırpılmaz; gerekli alan kayar,
- ana sayaç eylemi başparmak erişim alanında kalır.

Tasarım yönü:

- **opak yüzeyler**, şeffaf ana kart veya gereksiz cam efekti yok,
- açık temada sıcak kırık beyaz/kum; koyu temada gerçek koyu yüzey,
- yalnız bir ana vurgu rengi ve ölçülü altın detay,
- ana sayı için tabular rakamlar,
- Türkçe için sistem sans-serif; Arapça için okunaklı sistem fallback zinciri,
- dekor değil işlev öncelikli; gereksiz halka, parıltı, parçacık ve gradient yok,
- her ekranda bir birincil eylem,
- sayaç ekranında aynı anda en fazla üç ilerleme seviyesi:
  “bu tur”, “tam hatim”, “bugün”.

“Premium”, efekt yoğunluğu değil; tutarlı boşluk, güçlü tipografi, doğru
matematik, sakin geri bildirim ve hatasız devamlılık demektir.

---

## 4. Ortak prompt başlığı

Aşağıdaki metni her uygulama promptunun başına ekle:

```text
Şeyma projesinin zikirmatik-iphone16-redesign branch’indesin.
Önce AGENTS.md, CLAUDE.md, ZIKIRMATIK-GELISTIRME-PLANI.md ve
ZIKIRMATIK-IPHONE16-PREMIUM-PROMPT-PAKETI.md dosyalarını tamamen oku.
Gerçek tarayıcı açma, server başlatma, seyma-data’ya yazma ve sync
korumalarını değiştirme. Zikirmatik feature flag’lerini açma; main’e merge
ve deploy yapma. Mevcut kullanıcı verisini koru. Yalnız bu promptun kapsamını
uygula; ilgisiz dosyalara dokunma. Sonunda değişen dosyaları, testleri ve
kalan riskleri raporla.
```

---

# FAZ A — Envanter, içerik ve doğruluk temeli

## ZP-00 — Değişiklik öncesi denetim ve izlenebilir başlangıç

```text
ROL: Kıdemli frontend mimarı ve veri güvenliği denetçisi.

AMAÇ:
Mevcut Zikirmatik v2 çekirdeğini değiştirmeden envanterle; korunacak,
yeniden tasarlanacak ve eksik parçaları kanıtlarıyla ayır.

YAP:
1. app.js içinde data.zikr, migrate(), matematik helper’ları, App.openZikr,
   tüm App.zikr* handler’ları ve zikroverlayHTML çağrı zincirini çıkar.
2. styles.css içindeki tüm zikr sınıflarını/tokens’ları listele.
3. panel.html aynasını ve sync.js merge/sanitize davranışını incele.
4. esmaulHusnaV1.js alanlarını ve 99 kayıt bütünlüğünü doğrula.
5. zikr-harness.mjs mevcut assertion’larını işlev gruplarına ayır.
6. “koru / değiştir / ekle / kaldır” tablosu oluştur.
7. Tasarım borçlarını kanıta dayalı yaz: şeffaflık, genişlik, safe-area,
   tipografi, taşma, eylem hiyerarşisi.

ÇIKTI:
ZIKIRMATIK-REDESIGN-DENETIMI.md

KABUL:
- Kod değişikliği yok.
- Feature flag kapalı.
- 99 kayıt, sıra ve benzersiz id kontrolü raporda.
- Veri kaybı riski taşıyan her nokta ayrı işaretli.
- node --check app.js ve mevcut zikr harness sonucu kayıtlı.
```

## ZP-01 — İçerik otoritesi ve 99 Esmâ editoryal şeması

```text
ROL: Dinî içerik editörüyle çalışan veri modelleyici.

AMAÇ:
99 Esmâ için Türkçe anlam, önemi/tefekkür bağlamı ve kaynak bilgisini
makinece doğrulanabilir, sürümlü bir içerik modülüne dönüştür.

YAP:
1. esmaulHusnaV1.js’i geriye uyumlu V2 içerik sözleşmesine yükselt veya
   yeni esmaulHusnaV2.js modülü oluştur.
2. Her kayıtta zorunlu alanlar:
   id, order, name, arabic, transliterationTr, ebced, meaningTr,
   importanceTr, reflectionTr, sourceRefs, editorialStatus.
3. meaningTr, Diyanet’teki anlamla semantik olarak uyumlu ve kısa olsun.
4. importanceTr, ismi tanımaya dönük 1–2 cümle olsun; kişiye vaat,
   reçeteli sayı, uydurma fazilet veya dinî hüküm içermesin.
5. reflectionTr, emir vermeyen tek bir tefekkür sorusu/odağı olsun.
6. Her kayıt en az bir kaynak kimliğine bağlansın.
7. Kaynak registry’sinde başlık, kurum, URL, erişim tarihi ve kullanım alanı
   bulunsun.
8. Ebced yöntemi ayrı metadata olarak kalsın; anlam kaynağıyla karışmasın.
9. İçerik metinleri kodla otomatik “uydurulmasın”; her kayıt
   editorialStatus="reviewed" olmadan yayın kabulüne girmesin.
10. 99 ismin Allah’ın isimlerini sınırladığı izlenimi verilmesin.

KABUL:
- Tam 99 kayıt; order 1–99; id benzersiz.
- Boş meaningTr/importanceTr/reflectionTr/sourceRefs yok.
- Arapça alanlarda hareke/normalizasyon kararı belgeli.
- “kesin sağlar”, “garanti”, “şu kadar oku olur” benzeri iddia yok.
- İçerik doğrulama scripti/harness assertion’ı mevcut.
```

## ZP-02 — Çekirdek zikirlerin Türkçe anlam ve bağlam kataloğu

```text
ROL: İçerik tasarımcısı ve ürün metni denetçisi.

AMAÇ:
Sübhanallah, Elhamdülillah, Allahu Ekber, Lâ ilâhe illallah,
Estağfirullah ve kullanımdaki diğer yerleşik presetleri açıklamasız sayı
etiketleri olmaktan çıkar.

YAP:
1. Her yerleşik preset için originalText, transliterationTr, meaningTr,
   importanceTr, sourceRefs ve kind alanlarını tanımla.
2. Kısa anlamları sade Türkçeyle yaz.
3. “Önemi” metnini ibadet bağlamını açıklayan, kaynaklı ve ölçülü biçimde yaz.
4. Kullanıcı presetinde meaningTr/importanceTr isteğe bağlı olsun ve
   “kişisel not” etiketi taşısın.
5. Yerleşik metin kullanıcı tarafından değiştirilemesin; özel preset ayrı
   kayda dönüşsün.
6. İçerik detay görünümünde “Anlamı”, “Tefekkür odağı” ve “Kaynak” başlıkları
   birbirinden ayrışsın.

KABUL:
- Yerleşik hiçbir preset anlamsız/bağlamsız kalmıyor.
- Kaynaksız hadis veya fazilet metni yok.
- Türkçe karakter, kesme işareti ve transliterasyon tutarlı.
- Sayaç ekranı uzun metinle boğulmuyor; detay isteğe bağlı açılıyor.
```

## ZP-03 — Ebced hesap motoru ve matematik sözleşmesi

```text
ROL: Sayısal doğruluk mühendisi.

AMAÇ:
Ebced, tur, kalan ve Ebced² tam hatim hesaplarını tek saf motor altında
topla; UI’ın kendi başına matematik üretmesini engelle.

YAP:
1. normalizeArabic, ebced, baseTarget, hatimTarget, completedCycles,
   currentCycleNo, cyclePosition, remainingInCycle, remainingInHatim ve
   progress hesaplarını saf fonksiyon yap.
2. Kalıcı count daima ileri giden negatif olmayan safe integer olsun.
3. Geri sayımı yalnız türetilmiş görünüm olarak üret.
4. Tam tur sınırında “1 tur tamam · 2. tur hazır” durumunu açık state ile çöz.
5. Tamamlanmış hatimde count hedef üstüne çıkmasın; yeni hatim yalnız açık
   kullanıcı eylemiyle başlasın.
6. Arapça normalizasyon kurallarını ve el- takısı kararını metadata’da göster.
7. Fettâh 489² senaryosunu referans kabul testi yap.

KABUL:
- 489 × 489 = 239121.
- 0, 1, 488, 489, 490, 239120, 239121 sınırları doğru.
- NaN, 0, negatif, eksik preset güvenli.
- UI ve panel aynı helper sonuçlarını/aynı formül sözleşmesini kullanıyor.
- Tüm saf matematik testleri ağsız ve deterministik.
```

---

# FAZ B — Veri modeli, oturum ve kalıcılık

## ZP-04 — Veri modeli V3 ve kayıpsız migration

```text
ROL: Şema ve migration mühendisi.

AMAÇ:
İçerik sürümü, aktif oturum ve ayrı hatim yolculuklarını kapsayan V3 şemayı
eski Zikirmatik verisini kaybetmeden kur.

YAP:
1. data.zikr.schemaVersion değerini kontrollü yükselt.
2. journeys, hatims, sessions, activeSession, settings ve editorialVersion
   alanlarının sorumluluklarını ayır.
3. Eski daily/perPreset sayımlarını bir kez taşı; ikinci migration’da tekrar
   ekleme yapma.
4. Bilinmeyen/custom presetleri koru.
5. Artık katalogda bulunmayan presetleri silmek yerine archived işaretle.
6. Eksik veya bozuk alt alanları güvenli varsayılanla düzelt; geçerli yüksek
   count’u düşürme.
7. Migration öncesi/sonrası toplamları testte karşılaştır.

KABUL:
- Boş, V1, V2, kısmi ve bozuk kayıt fixture’ları geçiyor.
- migrate(migrate(x)) derin eşdeğer.
- Hiçbir lifetime/hatim/günlük toplam azalmaz.
- Mevcut aktif preset ve hatim mümkünse korunur.
- panel.html eksik V3 alanında kırılmaz.
```

## ZP-05 — Atomik sayaç ve oturum durum makinesi

```text
ROL: Etkileşim ve durum makinesi mühendisi.

AMAÇ:
Tap, undo, pause, resume, preset değişimi, gün değişimi ve kapanma akışlarını
tek bir açık durum makinesiyle güvenilir hale getir.

YAP:
1. Durumları tanımla: idle, active, paused, cycle-complete,
   hatim-complete, error-recoverable.
2. Her geçişin izin verilen olaylarını ve yan etkilerini belge.
3. Bir sayım eyleminde journey, active hatim, gün kaydı ve activeSession
   atomik güncellensin; save yalnız tutarlı nesneyi görsün.
4. pointerup/click/touch sentezinden gelen çift olayı tek mantıksal tap yap.
5. undo yalnız son geri alınabilir eylemi tersine çevirsin; 0 altına inmesin.
6. Gün değişiminde günlük oturum yeni güne geçsin, hatim aynı count ile sürsün.
7. Preset A → B → A akışında her yolculuk kendi yerinde kalsın.
8. Hatim tamamlanınca otomatik yeni hatim oluşturma.

KABUL:
- Hızlı 100 mantıksal tap = tam 100.
- Reload 132 → 132.
- 489 sınırında tap/undo iki yönde doğru.
- Gün değişimi günlük sayıyı ayırıyor, lifetime sayıyı koruyor.
- Aynı eylem iki kez save/sync delta üretmiyor.
```

## ZP-06 — Sync merge ve çoklu cihaz güvenliği

```text
ROL: Dağıtık veri birleşimi ve çatışma güvenliği mühendisi.

AMAÇ:
İki cihazdaki Zikirmatik ilerlemesinin eksilmeden ve aynı sayımı iki kez
eklemeden birleşmesini sağla.

YAP:
1. Mevcut SeySync merge sözleşmesini bozmadan Zikirmatik V3 alanlarını ele al.
2. Hatimleri stabil id ile birleştir; aynı hatimde count için monotonik
   maksimum yaklaşımını kullan.
3. Günlük perPreset değerlerinde mevcut merge ilkesini koru.
4. Tamamlanma timestamp’ini kaybetme; aktif/tamamlanmış durum çelişkisini
   deterministik çöz.
5. Preset ve kullanıcı notlarında last-write kararını timestamp ile açıkla.
6. localhost/file anti-push ve remote day-count guard’larına dokunma.

KABUL:
- A cihazı 100, B cihazı aynı hatimde 120 → birleşim 120; 220 değil.
- Farklı hatim id’leri kaybolmadan birlikte kalır.
- Tamamlanmış hatim aktif duruma gerilemez.
- test_faz10_sync.js ve ek çatışma fixture’ları geçer.
- Ağ çağrıları mock; gerçek data reposuna yazım yok.
```

---

# FAZ C — Premium tam ekran ürün mimarisi

## ZP-07 — Bilgi mimarisi ve tek görevli ekran akışı

```text
ROL: Mobil ürün tasarımcısı.

AMAÇ:
Tam ekran Zikirmatik içinde kullanıcının “seç → anla → say → devam et”
akışını en az bilişsel yükle kur.

İÇ NAVİGASYON:
1. Sayaç
2. Esmâ
3. Hatimlerim
4. Geçmiş
5. Ayarlar

YAP:
1. Her ekranın birincil işi ve birincil eylemini tanımla.
2. Sayaç ekranında üst bar, içerik özeti, ana sayı alanı, tur/hatim ilerlemesi
   ve alt eylem bölgesi dışında öğe gösterme.
3. Detay metnini ana sayaçtan ayır; bottom sheet/detay görünümüne taşı.
4. Sekme değişiminde sayaç oturumu kaybolmasın.
5. Kapatınca odak geldiği elemana dönsün.
6. Navigasyon etiketlerinin tamamı Türkçe ve kısa olsun.

KABUL:
- Kullanıcı seçili zikri, kalan turu ve hatim durumunu tek bakışta anlıyor.
- Aynı önemde yarışan iki ana CTA yok.
- Kritik eylemler menü içine gizlenmiyor.
- Sayaç ekranında gereksiz rozet/istatistik kalabalığı yok.
```

## ZP-08 — Opak tasarım sistemi ve tipografi

```text
ROL: Senior visual designer ve CSS sistem mühendisi.

AMAÇ:
Şeffaf eski görünümü kaldır; açık/koyu temada premium, sakin ve okunaklı
opak bir tasarım sistemi kur.

YAP:
1. zikr için semantic tokenlar tanımla:
   surface, surfaceRaised, text, textMuted, accent, accentStrong, border,
   success, warning, danger, focusRing, shadow.
2. Tüm ana yüzeyleri opak yap; ana layoutta backdrop-filter kullanma.
3. En fazla bir hafif dekoratif gradient kullan; metin arkasına koyma.
4. Sistem font zinciri kullan; 11px altı metin oluşturma.
5. Gövde metnini varsayılan 16–17px bandında tut; clamp ile uyarlanabilir yap.
6. Ana sayı tabular-nums ve taşmayan clamp ölçeğinde olsun.
7. Arapça metne lang="ar", dir="rtl", uygun line-height ve ayrı fallback ver.
8. Türkçe/Arapça metinlerde font ağırlığı 400 altına düşmesin.
9. light/dark için kontrast tokenlarını ayrı doğrula.
10. Eski `.zikr-*` stillerinden yeni sistemle çakışanları temizle.

KABUL:
- Ana modal, kart ve alt bar opak.
- Açık/koyu temada içerik okunaklı.
- 200% metin büyütmede taşma/örtüşme yok.
- Arapça harfler kesilmiyor ve rakamlarla baseline bozulmuyor.
- Kullanılmayan zikr CSS’i raporlanıp güvenle temizlenmiş.
```

## ZP-09 — iPhone Pro Max tam ekran kabuk ve safe-area

```text
ROL: Mobile Safari/PWA layout uzmanı.

AMAÇ:
Zikirmatik modalını geniş Pro Max portre ekranında ekranı gerçekten dolduran,
Dynamic Island ve alt home indicator alanına saygılı bağımsız bir kabuk yap.

YAP:
1. `100dvh` birincil, `100svh`/`100vh` fallback stratejisi kur.
2. Üst ve alt padding’i env(safe-area-inset-top/bottom) ile hesapla.
3. Header ve alt eylem alanını sabit/sticky; ana içeriği kontrollü scroll yap.
4. Body scroll lock ve geri yüklemeyi modal yaşam döngüsüne bağla.
5. 390, 393, 430, 440px genişliklerde aynı bileşen hiyerarşisini koru.
6. Kısa yükseklikte ana sayı küçülsün; alt eylem kaybolmasın.
7. Landscape görünümünü kırılmadan güvenli fallback olarak destekle.
8. Hardcode cihaz yüksekliği kullanma.

KABUL:
- İç içe kontrolsüz scroll yok.
- Kapat, geri al ve ana tap alanı safe-area dışında kalmıyor.
- Alt home indicator kontrol üstüne binmiyor.
- Büyük yazıda kapatma eylemi daima erişilebilir.
- Headless layout sözleşmesi gerekli class/style değerlerini doğruluyor.
```

## ZP-10 — Modal semantiği, odak ve kapatma güvenliği

```text
ROL: Erişilebilir modal uygulama uzmanı.

AMAÇ:
Tam ekran Zikirmatik kabuğunu semantik, klavye kullanılabilir ve yanlışlıkla
kapanmaya karşı güvenli hale getir.

YAP:
1. role="dialog", aria-modal="true", aria-labelledby ve açıklama bağlantısını
   kur.
2. Açılışta anlamlı ilk elemana odak ver; odak modal içinde dolaşsın.
3. Kapanınca tetikleyici elemana odak döndür.
4. Escape yalnız güvenli durumda kapatsın; açık onay dialogu varsa önce onu kapat.
5. Sayaç ana alanı gerçek button semantiği ve açıklayıcı aria-label taşısın.
6. Sayımın her tapında live region spam yapma; yalnız tur/hatim kilometre
   taşlarını duyur.
7. Kapatma sırasında aktifSession kaydını güvenle sonlandır/duraklat.

KABUL:
- Tab sırası görünür hiyerarşiyle aynı.
- Odak modal dışına kaçmıyor.
- Ekran okuyucu seçili zikri, turu ve kalan sayıyı anlayabiliyor.
- Yanlışlıkla arka plan tıklaması modalı kapatmıyor.
```

---

# FAZ D — Sayaç, Esmâ ve Hatimlerim deneyimi

## ZP-11 — Ana sayaç ekranı

```text
ROL: Etkileşim tasarımcısı ve frontend uygulayıcısı.

AMAÇ:
Tek elle kullanılabilen, dokunmayı kaçırmayan ve matematiği açık gösteren
premium ana sayaç ekranını uygula.

YAP:
1. Üstte: kapat, seçili zikir adı, duraklat/menü.
2. Anlam satırında kısa meaningTr; “Anlam ve önemi” detay düğmesi.
3. Ortada geniş ana tap düğmesi; sayı geri sayım modunda kalan turu göstersin.
4. Altında:
   - “18. tur · 132 / 489”
   - “17 tur tamamlandı”
   - “Tam hatim: 8.445 / 239.121”
   biçiminde çelişkisiz bilgi.
5. Bugünkü sayı ikincil, lifetime/hatim sayısından görsel olarak ayrı olsun.
6. Geri al görünür; yeni hatim ve sıfırlama korumalı menüde olsun.
7. Sayı biçimlendirmesinde Türkçe binlik ayırıcı kullan.
8. Tap sırasında layout shift oluşturma.

KABUL:
- Fettâh 0, 488, 489, 490 ve tamamlama ekranları doğru.
- Ana tap alanı en az 48×48 CSS px; hedefler arasında güvenli boşluk.
- 100 hızlı tap kaçırılmıyor/çift sayılmıyor.
- Sayaç değeri uzun sayıda taşmıyor.
```

## ZP-12 — 99 Esmâ kütüphanesi ve seçim

```text
ROL: Mobil bilgi erişimi tasarımcısı.

AMAÇ:
99 Esmâ’yı isim, Arapça yazım, Türkçe anlam ve ilerleme bilgisiyle hızlı,
saygılı ve anlaşılır biçimde seçilebilir yap.

YAP:
1. Türkçe isim/anlam ve sadeleştirilmiş arama eşleşmesi ekle.
2. Liste satırında order, name, arabic, kısa meaningTr ve ilerleme durumu olsun.
3. Filtreler: Tümü, Devam edenler, Tamamlananlar, Favoriler.
4. Sıralama varsayılan olarak kaynak sırası; kullanıcı ilerlemeye göre de
   sıralayabilsin.
5. İsme dokunmak detay açsın; “Bu isimle devam et” açık eylem olsun.
6. Katalog seçimi mevcut hatmi sıfırlamasın.
7. Arama sonucu yok durumunu Türkçe ve sakin yaz.

KABUL:
- Tam 99 isim gösteriliyor.
- Arama Türkçe diakritik farklılıklarında güvenli.
- Liste virtualize edilmeden mobilde akıcı; gereksiz re-render yok.
- Her satırın erişilebilir adı anlamlı.
- Kaynak sırası ve id eşleşmesi bozulmuyor.
```

## ZP-13 — “Anlamı ve önemi” içerik detayı

```text
ROL: İçerik tasarımcısı ve erişilebilir frontend geliştiricisi.

AMAÇ:
Her zikir/Esmâ için Türkçe anlamı, önemi, tefekkür bağlamı ve ebced
açıklamasını ana sayacı boğmadan sun.

YAP:
1. Detay görünümünde sıra:
   Arapça → Türkçe ad/transliterasyon → Anlamı → Önemi → Tefekkür odağı
   → Ebced bilgisi → Kaynaklar.
2. “Önemi” metnini vaaz, fetva veya sonuç garantisi gibi sunma.
3. Ebced sayısını yöntem ve yazım biçimiyle birlikte göster.
4. Ebced² açıklamasını kısa ve kalıcı disclaimer ile ver.
5. Kaynak bağlantılarını kurum adıyla etiketle; yeni sekme güvenliğini kullan.
6. Kullanıcıya içerik hatası bildirebilmesi için yalnız yerel bir
   “İçerik notu” alanı düşün; dış mesaj gönderme.

KABUL:
- 99/99 kayıtta bütün bölümler dolu.
- Kaynak referansı olmayan iddia yok.
- Ana sayaçtan detaya ve geri dönüşte count/oturum değişmiyor.
- Uzun metin büyük yazıda okunabilir ve kapatılabilir.
```

## ZP-14 — Hatimlerim ve yeni hatim yaşam döngüsü

```text
ROL: Ürün akışı ve kalıcı veri mühendisi.

AMAÇ:
Kullanıcının her Esmâ için hangi Ebced² yolculuğunda olduğunu görmesini,
devam etmesini ve tamamlanmış hatimleri kaybetmeden yenisini başlatmasını sağla.

YAP:
1. Devam edenleri üstte, tamamlananları arşivde göster.
2. Kartta isim, başlangıç, count/target, tamamlanan tur/baseTarget,
   yüzde ve son sayım zamanı yer alsın.
3. “Devam et” aktif hatmi seçsin; yeni kayıt üretmesin.
4. “Yeni hatim başlat” tamamlanmamış aktif hatim varsa açık seçenek sunsun:
   aktif olana dön / arşivle ve yeni başlat / vazgeç.
5. Tamamlanmış hatim değiştirilemez arşiv kaydı olsun; düzeltme gerekiyorsa
   ayrı denetimli akış kullan.
6. Silme yerine arşivleme tercih et; silme varsa geri döndürülebilir veya
   güçlü onaylı olsun.

KABUL:
- Aynı preset için iki “aktif” hatim oluşmuyor.
- Yeni hatim lifetime totalini silmiyor.
- Tamamlanma yalnız bir kez kaydediliyor.
- Eksik tarih/bozuk eski kayıtta liste kırılmıyor.
```

## ZP-15 — Düzeltme, geri alma ve güvenli sıfırlama

```text
ROL: Hata önleme odaklı UX mühendisi.

AMAÇ:
Yanlış sayımın düzeltilmesini kolay, veri kaybını ise zor hale getir.

YAP:
1. Tek adım geri al doğrudan erişilebilir olsun.
2. Bir oturum içindeki son N eylem için sınırlı yerel undo geçmişi tasarla;
   gereksiz kalıcı olay günlüğü üretme.
3. “Bugünkü sayımı düzelt”, “Bu hatmi arşivle” ve “Tüm Zikirmatik verisini
   sil” eylemlerini birbirinden ayır.
4. Yıkıcı eylemde etki alanı ve silinecek sayı açıkça yazsın.
5. Onay dialogunda varsayılan odak “Vazgeç” olsun.
6. Yanlış tamamlanan tur/hatim geri alındığında derived durum doğru gerilesin.

KABUL:
- Undo 0 altına düşmüyor.
- 489 → undo = 488; tur tamamlandı rozeti kalkıyor.
- 239121 → undo = 239120; tamamlanma durumu güvenle geri alınıyor.
- Yıkıcı eylemler tek kazara dokunuşla çalışmıyor.
```

---

# FAZ E — Duyusal geri bildirim, erişilebilirlik ve raporlama

## ZP-16 — Ses, haptic, hareket ve ekran uyanıklığı

```text
ROL: Web platform yetenekleri ve progressive enhancement uzmanı.

AMAÇ:
Sayaç çekirdeğini hiçbir cihaz API’sine bağımlı kılmadan isteğe bağlı,
sakin geri bildirimler ekle.

YAP:
1. Ses, haptic, reduced motion ve keep awake ayrı ayar olsun.
2. Varsayılan ses kapalı; kullanıcı eylemi olmadan AudioContext başlatma.
3. navigator.vibrate yoksa sessizce devam et.
4. Wake Lock yalnız açık oturumda ve kullanıcı tercihiyle iste; visibility
   dönüşünde gerekirse yeniden al; kapanışta bırak.
5. prefers-reduced-motion: reduce değerini varsayılan davranışa yansıt,
   kullanıcı ayarıyla zorla animasyon açma.
6. Her tapta büyük animasyon/flash yapma; tur tamamında ölçülü geri bildirim ver.
7. API reddi sayaç ve save işlemini etkilemesin.

KABUL:
- İzin/API yokken sayaç tam çalışıyor.
- Ses/haptic kapalıyken yan etki yok.
- Reduced motion’da zorunlu scale/parçacık animasyonu yok.
- Wake lock sızıntısı yok.
```

## ZP-17 — WCAG 2.2 erişilebilirlik kabul geçidi

```text
ROL: WCAG 2.2 erişilebilirlik denetçisi.

AMAÇ:
Zikirmatik tam ekran akışını klavye, ekran okuyucu, düşük görme ve motor
hassasiyet açısından AA seviyesinde güvenli hale getir.

YAP:
1. Metin/zemin ve anlamlı UI kontrastını token bazında denetle.
2. Tıklanabilir hedefleri en az 24×24 WCAG alt sınırının üstünde,
   ürün standardı olarak çoğunlukla en az 44–48px yap.
3. Focus visible ve focus not obscured kurallarını doğrula.
4. Renk tek durum göstergesi olmasın; metin/ikon eşliği ekle.
5. aria-live yalnız anlamlı durum değişimlerinde çalışsın.
6. 200% zoom ve büyük yazıda yeniden akışı doğrula.
7. Sağdan sola Arapça metin, Türkçe çevre metninin okuma sırasını bozmasın.
8. Hata ve onay metinleri programatik olarak ilgili kontrole bağlı olsun.

KABUL:
- Tüm kontroller klavyeyle kullanılabilir.
- Görünmez/örtülü odak yok.
- Sayaç kilometre taşı ekran okuyucuda anlaşılır.
- Büyük yazıda ana eylemler kaybolmuyor.
- Erişilebilirlik assertion’ları harness’e eklenmiş.
```

## ZP-18 — Geçmiş, nötr analiz ve panel aynası

```text
ROL: Mahremiyet odaklı ürün analitiği geliştiricisi.

AMAÇ:
Kullanıcının ibadetini puanlamadan devamlılığı gözlemleyebileceği geçmiş ve
salt-okunur panel özeti oluştur.

YAP:
1. Göster: bugün/hafta toplamı, aktif hatimler, tamamlanan turlar,
   tamamlanan hatimler ve yıllık günlük yoğunluk haritası.
2. Isı haritasında “iyi/kötü”, başarısızlık, rekabet veya suçluluk dili kullanma.
3. Boş gün = “kayıt yok”; “başarısız” değil.
4. Panelde kullanıcı tarafıyla aynı tanımları kullan; farklı toplam üretme.
5. Panel yalnız salt-okunur özetlesin; hatim count’u değiştiren eylem ekleme.
6. Eksik/eskiden kalma veride 0/— durumunu açık ayır.
7. Tooltip/erişilebilir tablo alternatifiyle tarih ve count okunabilsin.

KABUL:
- Kullanıcı ve panel aynı fixture’da aynı toplamı verir.
- 365/366 gün ve yıl geçişi doğru.
- Boş/kısmi veride NaN veya kırık kart yok.
- İstatistikler “manevî başarı skoru” üretmiyor.
```

---

# FAZ F — Test, temizlik ve kontrollü yayın

## ZP-19 — Tam kabul paketi, temizlik ve yayın adayı

```text
ROL: Release mühendisi ve son kalite kapısı sahibi.

AMAÇ:
Tüm promptların çıktısını tek, temiz, test edilmiş yayın adayına dönüştür;
ancak kullanıcı onayı olmadan görünürlük açma veya canlıya alma.

ÖNCE DENETLE:
1. ZP-00 denetim maddelerinin hepsi kapanmış mı?
2. 99/99 içerik kaydı reviewed ve kaynaklı mı?
3. Opak tasarım, tipografi ve safe-area kabulü geçiyor mu?
4. Sayaç, migration, sync, panel ve erişilebilirlik testleri geçiyor mu?

ZORUNLU TESTLER:
- node --check app.js
- node --check sync.js
- node --check esmaulHusnaV1.js veya V2 modülü
- node .claude/skills/run-seyma/driver.mjs
- node .claude/skills/run-seyma/zikr-harness.mjs
- node test_faz10_sync.js
- node test_faz11_panel.js
- içerik bütünlük testi: 99/99
- git diff --check

ZORUNLU SENARYOLAR:
- Fettâh: 0, 488, 489, 490, 239120, 239121
- 132 say → kapat/aç → 132
- A → B → A preset devamlılığı
- gün değişimi
- offline save/reload
- 100 hızlı tap
- pointer/click çift olay
- tur ve hatim sınırında undo
- iki cihaz merge
- light/dark
- 390/393/430/440 genişlik
- büyük yazı/reduced motion
- 99 isim arama, detay, kaynak ve devam

TEMİZLİK:
1. Eski kullanılmayan zikr CSS/HTML dallarını kanıtla ve kaldır.
2. Duplicate helper/handler bırakma.
3. Console.log, geçici debug flag ve test datasını temizle.
4. Feature flag’leri KAPALI bırak.
5. Cache sürümünü yalnız nihai dosya seti belli olduğunda bir kez artır.
6. GELISTIRME-PLANI.md, ZIKIRMATIK-GELISTIRME-PLANI.md ve AGENTS.md’yi güncelle.
7. Yayın adayı commit’ini `zikirmatik-iphone16-redesign` branch’ine push et.

DUR:
- Main’e merge etme.
- GitHub Pages deploy tetikleme.
- Feature flag açma.
- Kullanıcıya test sonuçları, commit SHA, değişen dosyalar ve bilinen riskleri
  sun; canlıya alma için açık onay bekle.

KABUL:
- Working tree temiz.
- Tüm testler PASS.
- Zikirmatik normal canlı kullanıcı için hâlâ gizli.
- Redesign branch remote ile eşit.
- Kullanıcı onayı olmadan production değişikliği yok.
```

---

## 5. Zorunlu içerik kalite kontrol listesi

Her Esmâ kaydı için:

- [ ] Sıra 1–99 arasında ve benzersiz
- [ ] Türkçe adı
- [ ] Arapça yazımı
- [ ] Türkçe transliterasyonu
- [ ] Türkçe kısa anlamı
- [ ] Türkçe “önemi” açıklaması
- [ ] Türkçe tefekkür odağı
- [ ] Ebced değeri
- [ ] Hesapta kullanılan normalize yazım
- [ ] En az bir anlam kaynağı
- [ ] Ebced yöntem kaynağı
- [ ] Editoryal durum `reviewed`
- [ ] Vaat/garanti/uydurma fazilet içermiyor
- [ ] Küçük ve büyük yazıda taşmıyor
- [ ] Ekran okuyucu sırası anlaşılır

Yerleşik her genel zikir için:

- [ ] Asıl metin
- [ ] Okunuş
- [ ] Türkçe anlam
- [ ] Türkçe önem/bağlam
- [ ] Kaynak
- [ ] Kullanıcı presetinden ayrışan kilitli built-in kimliği

---

## 6. Tamamlanma tanımı

Bu prompt paketi ancak aşağıdakilerin **tamamı** sağlanınca bitmiş sayılır:

- Zikirmatik başka hub’a bağımlı olmayan tam ekran modal olarak çalışır.
- Ana yüzeyler opak, tipografi okunaklı ve hiyerarşi sadedir.
- Geniş Pro Max ekranları dahil 390–440px portre genişliklerine uyarlanır.
- Safe-area, Dynamic Island sınıfı üst kesimler ve home indicator hesaba katılır.
- Her preset kendi kaldığı yerden devam eder.
- Günlük toplam ile ömürlük/hatim toplamı birbirine karışmaz.
- 99 Esmâ’nın tümünde Türkçe anlam, önem, tefekkür ve kaynak vardır.
- Ebced değeri kaynaklı, yöntemi açıklanmış ve kullanıcı tarafından değiştirilemez.
- Ebced² geleneksel kişisel hedef olarak sunulur; dinî/bilimsel zorunluluk
  iddiası taşımaz.
- Fettâh için kaçıncı 489’luk turun yapıldığı açıkça izlenir.
- Tap, undo, reload, gün değişimi, offline ve cihaz merge akışları veri kaybetmez.
- Tamamlanmış hatimler arşivlenir; yeni hatim açık eylemle başlar.
- Ses, haptic ve wake lock başarısız olsa da sayaç çalışır.
- WCAG 2.2 odak, hedef boyutu, kontrast ve yeniden akış kapıları geçer.
- Kullanıcı ve panel tarafındaki geçmiş/ısı haritası aynı veriyi gösterir.
- Tüm Node/harness testleri geçer.
- Feature flag kullanıcı onayına kadar kapalı kalır.
- Kullanıcı onayı olmadan `main`e merge veya canlı deploy yapılmaz.

---

## 7. Birincil kaynaklar

Dinî ve geleneksel içerik:

- Diyanet Din İşleri Yüksek Kurulu — Allah’ın 99 ismi:
  https://kurul.diyanet.gov.tr/tr/fetva/allahin-99-ismi-hakkinda-bilgi-verir-misiniz/56aa0e7b-6fe0-45ce-0892-08dd1c135351
- TDV İslâm Ansiklopedisi — Ebced:
  https://islamansiklopedisi.org.tr/ebced

Erişilebilirlik ve mobil arayüz:

- W3C — WCAG 2.2:
  https://www.w3.org/TR/WCAG22/
- W3C — Hedef boyutu, SC 2.5.8:
  https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html
- Apple Human Interface Guidelines — Layout:
  https://developer.apple.com/design/human-interface-guidelines/layout
- Apple Human Interface Guidelines — Typography:
  https://developer.apple.com/design/human-interface-guidelines/typography

> Kaynak erişim tarihi bu belgenin hazırlanma tarihi olan **2026-07-29**’dur.
> Uygulama sırasında metinler yeniden karşılaştırılır; kaynakta değişiklik
> varsa `editorialVersion` artırılır.
