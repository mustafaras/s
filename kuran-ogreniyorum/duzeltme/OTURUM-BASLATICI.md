# KAO-FIX · Yeni oturum başlatıcıları

**Kullanım:** Her adımda **yeni bir oturum** aç, aşağıdaki blokların **yalnız sıradaki birini** olduğu gibi yapıştır.
Blok bitince ajanın son mesajında şu üçü olmalı:
1. `Sıradaki = …`
2. Commit hash'i
3. Kontrol exit özeti

Bu üçü yoksa bir sonrakine geçme; aynı bloğu yeni oturumda tekrar yapıştır. Ajan yarım işi `Aktif:` satırından sürdürür.

Sıra: 00 → 01 → 02 → 03/A → 03/B → 03/C → 03/D → 04 → 05 → … → 19 (toplam **23 oturum**).
Kararları değiştirmek istersen (KF-1…KF-9, bkz. `.anti-amnesia/CURRENT-STATE.md`), bunu **yalnız 1 numaralı bloğun sonuna** bir satır olarak ekle. Örnek: `Karar: KF-3 = 3`.

İlerleme işareti (isteğe bağlı): bitirdiğin bloğun başlığındaki `[ ]` işaretini `[x]` yap.


### [ ] 1 · KAO-FIX-00 — Başlangıç, dal, kararlar, taban ölçümü
```text
/Users/m_ras/Desktop/seyma reposunda KAO düzeltme programının KAO-FIX-00 promptunu uygula.

Okuma sırası (başka dosya açma):
1) kuran-ogreniyorum/duzeltme/BAGLAM-YONETIMI.md
2) sed -n '1,60p' kuran-ogreniyorum/duzeltme/.anti-amnesia/CURRENT-STATE.md ; tail -5 kuran-ogreniyorum/duzeltme/.anti-amnesia/LEDGER.md
3) awk '/^## 1\. Ortak sözleşme/,/^## 2\. /' kuran-ogreniyorum/duzeltme/FIX-PROMPTLARI.md
4) awk '/^## KAO-FIX-00 /,/^---$/' kuran-ogreniyorum/duzeltme/FIX-PROMPTLARI.md

Ön koşul: CURRENT-STATE "Sıradaki" = KAO-FIX-00. Değilse DUR ve bana söyle.
Bu oturumda kao-duzeltme dalını açacaksın (main'e dönme). Kararlar KF-1…KF-9: aşağıda "Karar:" satırı yoksa hepsi varsayılan.
İki commit: "KAO-DENETIM: …" (yalnız rapor) ve "KAO-FIX-00: …".
Yalnız bu promptu uygula; yukarıdaki iki commit. Bitince CURRENT-STATE, LEDGER ve kanit/ güncel olsun.
Push, merge, tag, deploy ve mustafaras/seyma-data'ya yazma YOK. Sır isteme. Tarayıcı açma. Senin olmayan kirli dosyalara dokunma.
Son mesajında: Sıradaki prompt, iki commit hash'i, taban ölçümleri, kontrol exit özeti (≤10 satır).
```

### [ ] 2 · KAO-FIX-01 — Dondurma hattı onarımı + tekrar üretim testi
```text
/Users/m_ras/Desktop/seyma reposunda KAO düzeltme programının KAO-FIX-01 promptunu uygula.

Okuma sırası (başka dosya açma):
1) kuran-ogreniyorum/duzeltme/BAGLAM-YONETIMI.md
2) sed -n '1,60p' kuran-ogreniyorum/duzeltme/.anti-amnesia/CURRENT-STATE.md ; tail -5 kuran-ogreniyorum/duzeltme/.anti-amnesia/LEDGER.md
3) awk '/^## 1\. Ortak sözleşme/,/^## 2\. /' kuran-ogreniyorum/duzeltme/FIX-PROMPTLARI.md
4) awk '/^## KAO-FIX-01 /,/^---$/' kuran-ogreniyorum/duzeltme/FIX-PROMPTLARI.md

Ön koşul: dal kao-duzeltme ve CURRENT-STATE "Sıradaki" = KAO-FIX-01. Değilse DUR ve bana söyle.
Önce kırmızı test, sonra düzeltme. app/content/* DEĞİŞMEZ.
Yalnız bu promptu uygula; tek commit "KAO-FIX-01: …". Bitince CURRENT-STATE, LEDGER ve kanit/ güncel olsun.
Push, merge, tag, deploy ve mustafaras/seyma-data'ya yazma YOK. Sır isteme. Tarayıcı açma. Senin olmayan kirli dosyalara dokunma.
Son mesajında: Sıradaki prompt, freeze-repro sonucu, commit hash'i, kontrol exit özeti (≤10 satır).
```

### [ ] 3 · KAO-FIX-02 — Kısa sûre çalışma kitabı ve içe alma kapısı
```text
/Users/m_ras/Desktop/seyma reposunda KAO düzeltme programının KAO-FIX-02 promptunu uygula.

Okuma sırası (başka dosya açma):
1) kuran-ogreniyorum/duzeltme/BAGLAM-YONETIMI.md
2) sed -n '1,60p' kuran-ogreniyorum/duzeltme/.anti-amnesia/CURRENT-STATE.md ; tail -5 kuran-ogreniyorum/duzeltme/.anti-amnesia/LEDGER.md
3) awk '/^## 1\. Ortak sözleşme/,/^## 2\. /' kuran-ogreniyorum/duzeltme/FIX-PROMPTLARI.md
4) awk '/^## KAO-FIX-02 /,/^---$/' kuran-ogreniyorum/duzeltme/FIX-PROMPTLARI.md

Ön koşul: dal kao-duzeltme ve CURRENT-STATE "Sıradaki" = KAO-FIX-02. Değilse DUR ve bana söyle.
app/content/* DEĞİŞMEZ; yalnız araç, test ve çalışma kitabı (837 satır, tr sütunu boş). lexicon.reference.json'u elle açma; yalnız araç okur.
Yalnız bu promptu uygula; tek commit "KAO-FIX-02: …". Bitince CURRENT-STATE, LEDGER ve kanit/ güncel olsun.
Push, merge, tag, deploy ve mustafaras/seyma-data'ya yazma YOK. Sır isteme. Tarayıcı açma. Senin olmayan kirli dosyalara dokunma.
Son mesajında: Sıradaki prompt, --surah-import sayıları, commit hash'i, kontrol exit özeti (≤10 satır).
```

### [ ] 4 · KAO-FIX-03/A — Türkçe katman: Tîn, Alak, Kadr, Beyyine (230 satır)
```text
/Users/m_ras/Desktop/seyma reposunda KAO düzeltme programının KAO-FIX-03 promptunu PARTİ A uygula.

Okuma sırası (başka dosya açma):
1) kuran-ogreniyorum/duzeltme/BAGLAM-YONETIMI.md
2) sed -n '1,60p' kuran-ogreniyorum/duzeltme/.anti-amnesia/CURRENT-STATE.md ; tail -5 kuran-ogreniyorum/duzeltme/.anti-amnesia/LEDGER.md
3) awk '/^## 1\. Ortak sözleşme/,/^## 2\. /' kuran-ogreniyorum/duzeltme/FIX-PROMPTLARI.md
4) awk '/^## KAO-FIX-03 /,/^---$/' kuran-ogreniyorum/duzeltme/FIX-PROMPTLARI.md
5) Yalnız: awk '/^## Parti A/,/^## Parti B/' kuran-ogreniyorum/content/surahs.review.md

Ön koşul: dal kao-duzeltme ve CURRENT-STATE "Sıradaki" = KAO-FIX-03/A. Değilse DUR ve bana söyle.
Yalnız A bölümündeki satırların tr/verifiedBy/verifiedAt hücrelerini "Çeviri kuralları"na harfiyen uyarak doldur.
Referans ipucunu kopyalama, İngilizce yazma, Arapça hücrelere dokunma. Her sûreden sonra --surah-import (copy=0, language=0).
Bağlam dolarsa bitmiş son sûrede dur, CURRENT-STATE "Aktif: KAO-FIX-03/A (… kaldı)" yaz ve commit'le.
Yalnız bu promptu uygula; tek commit "KAO-FIX-03/A: …". Bitince CURRENT-STATE, LEDGER ve kanit/ güncel olsun.
Push, merge, tag, deploy ve mustafaras/seyma-data'ya yazma YOK. Sır isteme. Tarayıcı açma. Senin olmayan kirli dosyalara dokunma.
Son mesajında: Sıradaki prompt, doldurulan satır sayısı, copy/language, commit hash'i (≤10 satır).
```

### [ ] 5 · KAO-FIX-03/B — Türkçe katman: Zilzâl … Fil (210 satır)
```text
/Users/m_ras/Desktop/seyma reposunda KAO düzeltme programının KAO-FIX-03 promptunu PARTİ B uygula.

Okuma sırası (başka dosya açma):
1) kuran-ogreniyorum/duzeltme/BAGLAM-YONETIMI.md
2) sed -n '1,60p' kuran-ogreniyorum/duzeltme/.anti-amnesia/CURRENT-STATE.md ; tail -5 kuran-ogreniyorum/duzeltme/.anti-amnesia/LEDGER.md
3) awk '/^## 1\. Ortak sözleşme/,/^## 2\. /' kuran-ogreniyorum/duzeltme/FIX-PROMPTLARI.md
4) awk '/^## KAO-FIX-03 /,/^---$/' kuran-ogreniyorum/duzeltme/FIX-PROMPTLARI.md
5) Yalnız: awk '/^## Parti B/,/^## Parti C/' kuran-ogreniyorum/content/surahs.review.md

Ön koşul: dal kao-duzeltme ve CURRENT-STATE "Sıradaki" = KAO-FIX-03/B. Değilse DUR ve bana söyle.
Yalnız B bölümünü "Çeviri kuralları"na harfiyen uyarak doldur; her sûreden sonra --surah-import (copy=0, language=0).
Bağlam dolarsa bitmiş son sûrede dur, Aktif satırını yaz, commit'le.
Yalnız bu promptu uygula; tek commit "KAO-FIX-03/B: …". Bitince CURRENT-STATE, LEDGER ve kanit/ güncel olsun.
Push, merge, tag, deploy ve mustafaras/seyma-data'ya yazma YOK. Sır isteme. Tarayıcı açma. Senin olmayan kirli dosyalara dokunma.
Son mesajında: Sıradaki prompt, doldurulan satır sayısı, copy/language, commit hash'i (≤10 satır).
```

### [ ] 6 · KAO-FIX-03/C — Türkçe katman: Kureyş … Nâs (178 satır)
```text
/Users/m_ras/Desktop/seyma reposunda KAO düzeltme programının KAO-FIX-03 promptunu PARTİ C uygula.

Okuma sırası (başka dosya açma):
1) kuran-ogreniyorum/duzeltme/BAGLAM-YONETIMI.md
2) sed -n '1,60p' kuran-ogreniyorum/duzeltme/.anti-amnesia/CURRENT-STATE.md ; tail -5 kuran-ogreniyorum/duzeltme/.anti-amnesia/LEDGER.md
3) awk '/^## 1\. Ortak sözleşme/,/^## 2\. /' kuran-ogreniyorum/duzeltme/FIX-PROMPTLARI.md
4) awk '/^## KAO-FIX-03 /,/^---$/' kuran-ogreniyorum/duzeltme/FIX-PROMPTLARI.md
5) Yalnız: awk '/^## Parti C/,/^## Parti D/' kuran-ogreniyorum/content/surahs.review.md

Ön koşul: dal kao-duzeltme ve CURRENT-STATE "Sıradaki" = KAO-FIX-03/C. Değilse DUR ve bana söyle.
Yalnız C bölümünü "Çeviri kuralları"na harfiyen uyarak doldur (Nâs/Felak/İhlâs Seviye 1 çapa metinleri; özen göster); her sûreden sonra --surah-import.
Bağlam dolarsa bitmiş son sûrede dur, Aktif satırını yaz, commit'le.
Yalnız bu promptu uygula; tek commit "KAO-FIX-03/C: …". Bitince CURRENT-STATE, LEDGER ve kanit/ güncel olsun.
Push, merge, tag, deploy ve mustafaras/seyma-data'ya yazma YOK. Sır isteme. Tarayıcı açma. Senin olmayan kirli dosyalara dokunma.
Son mesajında: Sıradaki prompt, doldurulan satır sayısı, copy/language, commit hash'i (≤10 satır).
```

### [ ] 7 · KAO-FIX-03/D — Türkçe katman: Fâtiha 29 + tamamlayıcı sözlük 190
```text
/Users/m_ras/Desktop/seyma reposunda KAO düzeltme programının KAO-FIX-03 promptunu PARTİ D uygula.

Okuma sırası (başka dosya açma):
1) kuran-ogreniyorum/duzeltme/BAGLAM-YONETIMI.md
2) sed -n '1,60p' kuran-ogreniyorum/duzeltme/.anti-amnesia/CURRENT-STATE.md ; tail -5 kuran-ogreniyorum/duzeltme/.anti-amnesia/LEDGER.md
3) awk '/^## 1\. Ortak sözleşme/,/^## 2\. /' kuran-ogreniyorum/duzeltme/FIX-PROMPTLARI.md
4) awk '/^## KAO-FIX-03 /,/^---$/' kuran-ogreniyorum/duzeltme/FIX-PROMPTLARI.md
5) Yalnız: awk '/^## Parti D/,0' kuran-ogreniyorum/content/surahs.review.md

Ön koşul: dal kao-duzeltme ve CURRENT-STATE "Sıradaki" = KAO-FIX-03/D. Değilse DUR ve bana söyle.
D bölümünü doldur. Fâtiha satırları (f-…) âyetteki anlamı; tamamlayıcı sözlük satırları (ls_…) LEMMANIN SÖZLÜK ANLAMINI alır, bağlam çekimi değil.
Sonunda --surah-import → filled=837, missing=0, copy=0, language=0 olmalı.
Yalnız bu promptu uygula; tek commit "KAO-FIX-03/D: …". Bitince CURRENT-STATE, LEDGER ve kanit/ güncel olsun.
Push, merge, tag, deploy ve mustafaras/seyma-data'ya yazma YOK. Sır isteme. Tarayıcı açma. Senin olmayan kirli dosyalara dokunma.
Son mesajında: Sıradaki prompt, --surah-import sayıları, commit hash'i (≤10 satır).
```

### [ ] 8 · KAO-FIX-04 — Kısa sûre dondurma: referanstan kopuş + atıf + pin
```text
/Users/m_ras/Desktop/seyma reposunda KAO düzeltme programının KAO-FIX-04 promptunu uygula.

Okuma sırası (başka dosya açma):
1) kuran-ogreniyorum/duzeltme/BAGLAM-YONETIMI.md
2) sed -n '1,60p' kuran-ogreniyorum/duzeltme/.anti-amnesia/CURRENT-STATE.md ; tail -5 kuran-ogreniyorum/duzeltme/.anti-amnesia/LEDGER.md
3) awk '/^## 1\. Ortak sözleşme/,/^## 2\. /' kuran-ogreniyorum/duzeltme/FIX-PROMPTLARI.md
4) awk '/^## KAO-FIX-04 /,/^---$/' kuran-ogreniyorum/duzeltme/FIX-PROMPTLARI.md

Ön koşul: dal kao-duzeltme ve CURRENT-STATE "Sıradaki" = KAO-FIX-04. Değilse DUR ve bana söyle.
Ek ön koşul: --surah-import → filled=837, copy=0, language=0; değilse DUR.
Modülü yalnız araçla üret (elle düzenleme yok); PIN-P (9 dosya) uygula ve tüm tests/app'i koş.
Yalnız bu promptu uygula; tek commit "KAO-FIX-04: …". Bitince CURRENT-STATE, LEDGER ve kanit/ güncel olsun.
Push, merge, tag, deploy ve mustafaras/seyma-data'ya yazma YOK. Sır isteme. Tarayıcı açma. Senin olmayan kirli dosyalara dokunma.
Son mesajında: Sıradaki prompt, referansla birebir aynı kelime (hedef 0), İngilizce (hedef 0), yeni pin, commit hash'i, kontrol özeti (≤10 satır).
```

### [ ] 9 · KAO-FIX-05 — Başlık kelimesi biçimi (bağlam şeddesi) + DİA
```text
/Users/m_ras/Desktop/seyma reposunda KAO düzeltme programının KAO-FIX-05 promptunu uygula.

Okuma sırası (başka dosya açma):
1) kuran-ogreniyorum/duzeltme/BAGLAM-YONETIMI.md
2) sed -n '1,60p' kuran-ogreniyorum/duzeltme/.anti-amnesia/CURRENT-STATE.md ; tail -5 kuran-ogreniyorum/duzeltme/.anti-amnesia/LEDGER.md
3) awk '/^## 1\. Ortak sözleşme/,/^## 2\. /' kuran-ogreniyorum/duzeltme/FIX-PROMPTLARI.md
4) awk '/^## KAO-FIX-05 /,/^---$/' kuran-ogreniyorum/duzeltme/FIX-PROMPTLARI.md

Ön koşul: dal kao-duzeltme ve CURRENT-STATE "Sıradaki" = KAO-FIX-05. Değilse DUR ve bana söyle.
Arapçayı hafızadan TAMAMLAMA: مَشَى vakası korpustan çıkmıyorsa dur ve bana sor.
verified.json değişince freeze aracının JSON_SHA256'sını güncelle; PIN-P uygula.
Yalnız bu promptu uygula; tek commit "KAO-FIX-05: …". Bitince CURRENT-STATE, LEDGER ve kanit/ güncel olsun.
Push, merge, tag, deploy ve mustafaras/seyma-data'ya yazma YOK. Sır isteme. Tarayıcı açma. Senin olmayan kirli dosyalara dokunma.
Son mesajında: Sıradaki prompt, şeddeli başlık (hedef 0), DİA çift ünsüz (hedef 0), مَشَى kararı, commit hash'i, kontrol özeti (≤10 satır).
```

### [ ] 10 · KAO-FIX-06 — İki yönlü kelime kartı
```text
/Users/m_ras/Desktop/seyma reposunda KAO düzeltme programının KAO-FIX-06 promptunu uygula.

Okuma sırası (başka dosya açma):
1) kuran-ogreniyorum/duzeltme/BAGLAM-YONETIMI.md
2) sed -n '1,60p' kuran-ogreniyorum/duzeltme/.anti-amnesia/CURRENT-STATE.md ; tail -5 kuran-ogreniyorum/duzeltme/.anti-amnesia/LEDGER.md
3) awk '/^## 1\. Ortak sözleşme/,/^## 2\. /' kuran-ogreniyorum/duzeltme/FIX-PROMPTLARI.md
4) awk '/^## KAO-FIX-06 /,/^---$/' kuran-ogreniyorum/duzeltme/FIX-PROMPTLARI.md

Ön koşul: dal kao-duzeltme ve CURRENT-STATE "Sıradaki" = KAO-FIX-06. Değilse DUR ve bana söyle.
Yeni App.kao* handler ekleme. Önce kırmızı test, sonra kod; PIN-P; kao-sim 365 gün ölçümü.
Yalnız bu promptu uygula; tek commit "KAO-FIX-06: …". Bitince CURRENT-STATE, LEDGER ve kanit/ güncel olsun.
Push, merge, tag, deploy ve mustafaras/seyma-data'ya yazma YOK. Sır isteme. Tarayıcı açma. Senin olmayan kirli dosyalara dokunma.
Son mesajında: Sıradaki prompt, lemmasBothDirections/lemmasSeen (hedef ≥0,95), newMax, commit hash'i, kontrol özeti (≤10 satır).
```

### [ ] 11 · KAO-FIX-07 — "Bilinen kelime" ve kapsam tanımı
```text
/Users/m_ras/Desktop/seyma reposunda KAO düzeltme programının KAO-FIX-07 promptunu uygula.

Okuma sırası (başka dosya açma):
1) kuran-ogreniyorum/duzeltme/BAGLAM-YONETIMI.md
2) sed -n '1,60p' kuran-ogreniyorum/duzeltme/.anti-amnesia/CURRENT-STATE.md ; tail -5 kuran-ogreniyorum/duzeltme/.anti-amnesia/LEDGER.md
3) awk '/^## 1\. Ortak sözleşme/,/^## 2\. /' kuran-ogreniyorum/duzeltme/FIX-PROMPTLARI.md
4) awk '/^## KAO-FIX-07 /,/^---$/' kuran-ogreniyorum/duzeltme/FIX-PROMPTLARI.md

Ön koşul: dal kao-duzeltme ve CURRENT-STATE "Sıradaki" = KAO-FIX-07. Değilse DUR ve bana söyle.
Değiştirdiğin her eski test iddiasını kanıta "eski → yeni, gerekçe 02 §3" olarak yaz; araclar/kao-mutate.mjs M10'unu ters çevir. PIN-P.
Yalnız bu promptu uygula; tek commit "KAO-FIX-07: …". Bitince CURRENT-STATE, LEDGER ve kanit/ güncel olsun.
Push, merge, tag, deploy ve mustafaras/seyma-data'ya yazma YOK. Sır isteme. Tarayıcı açma. Senin olmayan kirli dosyalara dokunma.
Son mesajında: Sıradaki prompt, knownByCode = knownByPlanDefinition, kapsam düşüşü notu, commit hash'i, kontrol özeti (≤10 satır).
```

### [ ] 12 · KAO-FIX-08 — Çeldirici geçmişi (R-A2)
```text
/Users/m_ras/Desktop/seyma reposunda KAO düzeltme programının KAO-FIX-08 promptunu uygula.

Okuma sırası (başka dosya açma):
1) kuran-ogreniyorum/duzeltme/BAGLAM-YONETIMI.md
2) sed -n '1,60p' kuran-ogreniyorum/duzeltme/.anti-amnesia/CURRENT-STATE.md ; tail -5 kuran-ogreniyorum/duzeltme/.anti-amnesia/LEDGER.md
3) awk '/^## 1\. Ortak sözleşme/,/^## 2\. /' kuran-ogreniyorum/duzeltme/FIX-PROMPTLARI.md
4) awk '/^## KAO-FIX-08 /,/^---$/' kuran-ogreniyorum/duzeltme/FIX-PROMPTLARI.md

Ön koşul: dal kao-duzeltme ve CURRENT-STATE "Sıradaki" = KAO-FIX-08. Değilse DUR ve bana söyle.
Test enjeksiyonsuz olmalı (kaoStart → kaoAnswer akışı). PIN-P.
Yalnız bu promptu uygula; tek commit "KAO-FIX-08: …". Bitince CURRENT-STATE, LEDGER ve kanit/ güncel olsun.
Push, merge, tag, deploy ve mustafaras/seyma-data'ya yazma YOK. Sır isteme. Tarayıcı açma. Senin olmayan kirli dosyalara dokunma.
Son mesajında: Sıradaki prompt, kırmızı→yeşil kanıtı, commit hash'i, kontrol özeti (≤10 satır).
```

### [ ] 13 · KAO-FIX-09 — daily budama ve durum bütçesi
```text
/Users/m_ras/Desktop/seyma reposunda KAO düzeltme programının KAO-FIX-09 promptunu uygula.

Okuma sırası (başka dosya açma):
1) kuran-ogreniyorum/duzeltme/BAGLAM-YONETIMI.md
2) sed -n '1,60p' kuran-ogreniyorum/duzeltme/.anti-amnesia/CURRENT-STATE.md ; tail -5 kuran-ogreniyorum/duzeltme/.anti-amnesia/LEDGER.md
3) awk '/^## 1\. Ortak sözleşme/,/^## 2\. /' kuran-ogreniyorum/duzeltme/FIX-PROMPTLARI.md
4) awk '/^## KAO-FIX-09 /,/^---$/' kuran-ogreniyorum/duzeltme/FIX-PROMPTLARI.md

Ön koşul: dal kao-duzeltme ve CURRENT-STATE "Sıradaki" = KAO-FIX-09. Değilse DUR ve bana söyle.
Kullanıcı verisi silinmez: budanan günler calibTotals'a toplanır; ensureQuranLearn idempotent kalır. PIN-P.
Yalnız bu promptu uygula; tek commit "KAO-FIX-09: …". Bitince CURRENT-STATE, LEDGER ve kanit/ güncel olsun.
Push, merge, tag, deploy ve mustafaras/seyma-data'ya yazma YOK. Sır isteme. Tarayıcı açma. Senin olmayan kirli dosyalara dokunma.
Son mesajında: Sıradaki prompt, 365. gün boyutu (hedef ≤100 KB), daily satır sayısı, seri çözümü, commit hash'i, kontrol özeti (≤10 satır).
```

### [ ] 14 · KAO-FIX-10 — Kilometre taşları
```text
/Users/m_ras/Desktop/seyma reposunda KAO düzeltme programının KAO-FIX-10 promptunu uygula.

Okuma sırası (başka dosya açma):
1) kuran-ogreniyorum/duzeltme/BAGLAM-YONETIMI.md
2) sed -n '1,60p' kuran-ogreniyorum/duzeltme/.anti-amnesia/CURRENT-STATE.md ; tail -5 kuran-ogreniyorum/duzeltme/.anti-amnesia/LEDGER.md
3) awk '/^## 1\. Ortak sözleşme/,/^## 2\. /' kuran-ogreniyorum/duzeltme/FIX-PROMPTLARI.md
4) awk '/^## KAO-FIX-10 /,/^---$/' kuran-ogreniyorum/duzeltme/FIX-PROMPTLARI.md

Ön koşul: dal kao-duzeltme ve CURRENT-STATE "Sıradaki" = KAO-FIX-10. Değilse DUR ve bana söyle.
Konfeti/SeyFx yok; yeni handler yok. PIN-P.
Yalnız bu promptu uygula; tek commit "KAO-FIX-10: …". Bitince CURRENT-STATE, LEDGER ve kanit/ güncel olsun.
Push, merge, tag, deploy ve mustafaras/seyma-data'ya yazma YOK. Sır isteme. Tarayıcı açma. Senin olmayan kirli dosyalara dokunma.
Son mesajında: Sıradaki prompt, simülasyonda dolan taşlar, commit hash'i, kontrol özeti (≤10 satır).
```

### [ ] 15 · KAO-FIX-11 — Test kör noktaları
```text
/Users/m_ras/Desktop/seyma reposunda KAO düzeltme programının KAO-FIX-11 promptunu uygula.

Okuma sırası (başka dosya açma):
1) kuran-ogreniyorum/duzeltme/BAGLAM-YONETIMI.md
2) sed -n '1,60p' kuran-ogreniyorum/duzeltme/.anti-amnesia/CURRENT-STATE.md ; tail -5 kuran-ogreniyorum/duzeltme/.anti-amnesia/LEDGER.md
3) awk '/^## 1\. Ortak sözleşme/,/^## 2\. /' kuran-ogreniyorum/duzeltme/FIX-PROMPTLARI.md
4) awk '/^## KAO-FIX-11 /,/^---$/' kuran-ogreniyorum/duzeltme/FIX-PROMPTLARI.md

Ön koşul: dal kao-duzeltme ve CURRENT-STATE "Sıradaki" = KAO-FIX-11. Değilse DUR ve bana söyle.
Üretim kodu DEĞİŞMEZ; yalnız test ve araclar/kao-mutate.mjs. Mutasyonu yalnız $TMPDIR kopyasında çalıştır.
Yeni test gerçek bir hata gösterirse düzeltme; dur ve bana sor.
Yalnız bu promptu uygula; tek commit "KAO-FIX-11: …". Bitince CURRENT-STATE, LEDGER ve kanit/ güncel olsun.
Push, merge, tag, deploy ve mustafaras/seyma-data'ya yazma YOK. Sır isteme. Tarayıcı açma. Senin olmayan kirli dosyalara dokunma.
Son mesajında: Sıradaki prompt, mutasyon sonucu (hedef 15/15), commit hash'i, kontrol özeti (≤10 satır).
```

### [ ] 16 · KAO-FIX-12 — Kaynaklar ve lisanslar bölümü (E7)
```text
/Users/m_ras/Desktop/seyma reposunda KAO düzeltme programının KAO-FIX-12 promptunu uygula.

Okuma sırası (başka dosya açma):
1) kuran-ogreniyorum/duzeltme/BAGLAM-YONETIMI.md
2) sed -n '1,60p' kuran-ogreniyorum/duzeltme/.anti-amnesia/CURRENT-STATE.md ; tail -5 kuran-ogreniyorum/duzeltme/.anti-amnesia/LEDGER.md
3) awk '/^## 1\. Ortak sözleşme/,/^## 2\. /' kuran-ogreniyorum/duzeltme/FIX-PROMPTLARI.md
4) awk '/^## KAO-FIX-12 /,/^---$/' kuran-ogreniyorum/duzeltme/FIX-PROMPTLARI.md

Ön koşul: dal kao-duzeltme ve CURRENT-STATE "Sıradaki" = KAO-FIX-12. Değilse DUR ve bana söyle.
Statik HTML, düz <a>; yeni App.* handler YOK, fx2/v3 pin sayıları değişmemeli. PIN-P.
Yalnız bu promptu uygula; tek commit "KAO-FIX-12: …". Bitince CURRENT-STATE, LEDGER ve kanit/ güncel olsun.
Push, merge, tag, deploy ve mustafaras/seyma-data'ya yazma YOK. Sır isteme. Tarayıcı açma. Senin olmayan kirli dosyalara dokunma.
Son mesajında: Sıradaki prompt, listelenen kaynaklar, App/onclick sayıları, commit hash'i, kontrol özeti (≤10 satır).
```

### [ ] 17 · KAO-FIX-13 — Arapça yazı tipi yığını
```text
/Users/m_ras/Desktop/seyma reposunda KAO düzeltme programının KAO-FIX-13 promptunu uygula.

Okuma sırası (başka dosya açma):
1) kuran-ogreniyorum/duzeltme/BAGLAM-YONETIMI.md
2) sed -n '1,60p' kuran-ogreniyorum/duzeltme/.anti-amnesia/CURRENT-STATE.md ; tail -5 kuran-ogreniyorum/duzeltme/.anti-amnesia/LEDGER.md
3) awk '/^## 1\. Ortak sözleşme/,/^## 2\. /' kuran-ogreniyorum/duzeltme/FIX-PROMPTLARI.md
4) awk '/^## KAO-FIX-13 /,/^---$/' kuran-ogreniyorum/duzeltme/FIX-PROMPTLARI.md

Ön koşul: dal kao-duzeltme ve CURRENT-STATE "Sıradaki" = KAO-FIX-13. Değilse DUR ve bana söyle.
kao.css'i tam okuma (satırlar çok uzun); grep -o ile seç. :root ve yeni renk YOK. PIN-P, kontrastı yeniden ölç.
Yalnız bu promptu uygula; tek commit "KAO-FIX-13: …". Bitince CURRENT-STATE, LEDGER ve kanit/ güncel olsun.
Push, merge, tag, deploy ve mustafaras/seyma-data'ya yazma YOK. Sır isteme. Tarayıcı açma. Senin olmayan kirli dosyalara dokunma.
Son mesajında: Sıradaki prompt, kontrast sonucu, "cihaz kabulü bekliyor" notu, commit hash'i, kontrol özeti (≤10 satır).
```

### [ ] 18 · KAO-FIX-14 — Anlam komşuları sözlük kaynağına
```text
/Users/m_ras/Desktop/seyma reposunda KAO düzeltme programının KAO-FIX-14 promptunu uygula.

Okuma sırası (başka dosya açma):
1) kuran-ogreniyorum/duzeltme/BAGLAM-YONETIMI.md
2) sed -n '1,60p' kuran-ogreniyorum/duzeltme/.anti-amnesia/CURRENT-STATE.md ; tail -5 kuran-ogreniyorum/duzeltme/.anti-amnesia/LEDGER.md
3) awk '/^## 1\. Ortak sözleşme/,/^## 2\. /' kuran-ogreniyorum/duzeltme/FIX-PROMPTLARI.md
4) awk '/^## KAO-FIX-14 /,/^---$/' kuran-ogreniyorum/duzeltme/FIX-PROMPTLARI.md

Ön koşul: dal kao-duzeltme ve CURRENT-STATE "Sıradaki" = KAO-FIX-14. Değilse DUR ve bana söyle.
Sözlük modülünü yalnız araçla üret; JSON_SHA256 + freeze-repro + PIN-P. Sözlük ≤340 KB.
Yalnız bu promptu uygula; tek commit "KAO-FIX-14: …". Bitince CURRENT-STATE, LEDGER ve kanit/ güncel olsun.
Push, merge, tag, deploy ve mustafaras/seyma-data'ya yazma YOK. Sır isteme. Tarayıcı açma. Senin olmayan kirli dosyalara dokunma.
Son mesajında: Sıradaki prompt, komşulu lemma sayısı (≥79), KAO_SEMANTIC_CLUSTERS=0, sözlük bayt, commit hash'i, kontrol özeti (≤10 satır).
```

### [ ] 19 · KAO-FIX-15 — Kuyruk ve şema ince ayarları
```text
/Users/m_ras/Desktop/seyma reposunda KAO düzeltme programının KAO-FIX-15 promptunu uygula.

Okuma sırası (başka dosya açma):
1) kuran-ogreniyorum/duzeltme/BAGLAM-YONETIMI.md
2) sed -n '1,60p' kuran-ogreniyorum/duzeltme/.anti-amnesia/CURRENT-STATE.md ; tail -5 kuran-ogreniyorum/duzeltme/.anti-amnesia/LEDGER.md
3) awk '/^## 1\. Ortak sözleşme/,/^## 2\. /' kuran-ogreniyorum/duzeltme/FIX-PROMPTLARI.md
4) awk '/^## KAO-FIX-15 /,/^---$/' kuran-ogreniyorum/duzeltme/FIX-PROMPTLARI.md

Ön koşul: dal kao-duzeltme ve CURRENT-STATE "Sıradaki" = KAO-FIX-15. Değilse DUR ve bana söyle.
KF-3 ve KF-9 kararlarını CURRENT-STATE'ten oku; her madde için ayrı kırmızı→yeşil test. PIN-P.
Yalnız bu promptu uygula; tek commit "KAO-FIX-15: …". Bitince CURRENT-STATE, LEDGER ve kanit/ güncel olsun.
Push, merge, tag, deploy ve mustafaras/seyma-data'ya yazma YOK. Sır isteme. Tarayıcı açma. Senin olmayan kirli dosyalara dokunma.
Son mesajında: Sıradaki prompt, maxSameTypeRun, grammarMax, dört maddenin test sonucu, commit hash'i (≤10 satır).
```

### [ ] 20 · KAO-FIX-16 — Plan ve belge hizası
```text
/Users/m_ras/Desktop/seyma reposunda KAO düzeltme programının KAO-FIX-16 promptunu uygula.

Okuma sırası (başka dosya açma):
1) kuran-ogreniyorum/duzeltme/BAGLAM-YONETIMI.md
2) sed -n '1,60p' kuran-ogreniyorum/duzeltme/.anti-amnesia/CURRENT-STATE.md ; tail -5 kuran-ogreniyorum/duzeltme/.anti-amnesia/LEDGER.md
3) awk '/^## 1\. Ortak sözleşme/,/^## 2\. /' kuran-ogreniyorum/duzeltme/FIX-PROMPTLARI.md
4) awk '/^## KAO-FIX-16 /,/^---$/' kuran-ogreniyorum/duzeltme/FIX-PROMPTLARI.md

Ön koşul: dal kao-duzeltme ve CURRENT-STATE "Sıradaki" = KAO-FIX-16. Değilse DUR ve bana söyle.
Yalnız belge. KAO-STATE.json, eski LEDGER ve KAO-KAPANIS.md DEĞİŞMEZ; düzeltme KAO-KAPANIS-EK-1.md ekiyle yapılır.
Plan belgelerini tam okuma; grep -n ile bulduğun satırları değiştir. Sayıları ölçerek yaz.
Yalnız bu promptu uygula; tek commit "KAO-FIX-16: …". Bitince CURRENT-STATE, LEDGER ve kanit/ güncel olsun.
Push, merge, tag, deploy ve mustafaras/seyma-data'ya yazma YOK. Sır isteme. Tarayıcı açma. Senin olmayan kirli dosyalara dokunma.
Son mesajında: Sıradaki prompt, değişen belgeler, kırık bağlantı 0, commit hash'i (≤10 satır).
```

### [ ] 21 · KAO-FIX-17 — plan-check sertleştirme
```text
/Users/m_ras/Desktop/seyma reposunda KAO düzeltme programının KAO-FIX-17 promptunu uygula.

Okuma sırası (başka dosya açma):
1) kuran-ogreniyorum/duzeltme/BAGLAM-YONETIMI.md
2) sed -n '1,60p' kuran-ogreniyorum/duzeltme/.anti-amnesia/CURRENT-STATE.md ; tail -5 kuran-ogreniyorum/duzeltme/.anti-amnesia/LEDGER.md
3) awk '/^## 1\. Ortak sözleşme/,/^## 2\. /' kuran-ogreniyorum/duzeltme/FIX-PROMPTLARI.md
4) awk '/^## KAO-FIX-17 /,/^---$/' kuran-ogreniyorum/duzeltme/FIX-PROMPTLARI.md

Ön koşul: dal kao-duzeltme ve CURRENT-STATE "Sıradaki" = KAO-FIX-17. Değilse DUR ve bana söyle.
Önce 3 yeni öz-test vakası (kırmızı), sonra denetleyici. Eski KAO-STATE.json'a yazma.
Yalnız bu promptu uygula; tek commit "KAO-FIX-17: …". Bitince CURRENT-STATE, LEDGER ve kanit/ güncel olsun.
Push, merge, tag, deploy ve mustafaras/seyma-data'ya yazma YOK. Sır isteme. Tarayıcı açma. Senin olmayan kirli dosyalara dokunma.
Son mesajında: Sıradaki prompt, öz-test sayısı (hedef 19/19), plan-check son 3 satırı, commit hash'i (≤10 satır).
```

### [ ] 22 · KAO-FIX-18 — Sahipsiz plan maddeleri kararı
```text
/Users/m_ras/Desktop/seyma reposunda KAO düzeltme programının KAO-FIX-18 promptunu uygula.

Okuma sırası (başka dosya açma):
1) kuran-ogreniyorum/duzeltme/BAGLAM-YONETIMI.md
2) sed -n '1,60p' kuran-ogreniyorum/duzeltme/.anti-amnesia/CURRENT-STATE.md ; tail -5 kuran-ogreniyorum/duzeltme/.anti-amnesia/LEDGER.md
3) awk '/^## 1\. Ortak sözleşme/,/^## 2\. /' kuran-ogreniyorum/duzeltme/FIX-PROMPTLARI.md
4) awk '/^## KAO-FIX-18 /,/^---$/' kuran-ogreniyorum/duzeltme/FIX-PROMPTLARI.md

Ön koşul: dal kao-duzeltme ve CURRENT-STATE "Sıradaki" = KAO-FIX-18. Değilse DUR ve bana söyle.
Kod YOK. KF-6'yı CURRENT-STATE'ten oku; 7 maddeye tek satırlık durum notu ekle.
Yalnız bu promptu uygula; tek commit "KAO-FIX-18: …". Bitince CURRENT-STATE, LEDGER ve kanit/ güncel olsun.
Push, merge, tag, deploy ve mustafaras/seyma-data'ya yazma YOK. Sır isteme. Tarayıcı açma. Senin olmayan kirli dosyalara dokunma.
Son mesajında: Sıradaki prompt, 7/7 madde, "Sonraki program adayları" listesi, commit hash'i (≤10 satır).
```

### [ ] 23 · KAO-FIX-19 — Kapanış regresyonu ve yeniden denetim
```text
/Users/m_ras/Desktop/seyma reposunda KAO düzeltme programının KAO-FIX-19 promptunu uygula.

Okuma sırası (başka dosya açma):
1) kuran-ogreniyorum/duzeltme/BAGLAM-YONETIMI.md
2) sed -n '1,60p' kuran-ogreniyorum/duzeltme/.anti-amnesia/CURRENT-STATE.md ; tail -5 kuran-ogreniyorum/duzeltme/.anti-amnesia/LEDGER.md
3) awk '/^## 1\. Ortak sözleşme/,/^## 2\. /' kuran-ogreniyorum/duzeltme/FIX-PROMPTLARI.md
4) awk '/^## KAO-FIX-19 /,/^---$/' kuran-ogreniyorum/duzeltme/FIX-PROMPTLARI.md
5) Yalnız: grep -n "^\*\*[KYOD]-[0-9]" kuran-ogreniyorum/deliverables/KAO-UYGUNLUK-DENETIMI-20260926.md

Ön koşul: dal kao-duzeltme ve CURRENT-STATE "Sıradaki" = KAO-FIX-19. Değilse DUR ve bana söyle.
Kod DEĞİŞMEZ. Kırmızı çıkan her şey için CURRENT-STATE'e yeni FIX promptu taslağı ekle; kendin düzeltme.
Mutasyonu yalnız $TMPDIR kopyasında çalıştır. Kanıt düzeylerini ayır; cihaz kabulünü "bekliyor" yaz.
Yayın kararı bende.
Yalnız bu promptu uygula; tek commit "KAO-FIX-19: …". Bitince CURRENT-STATE, LEDGER ve kanit/ güncel olsun.
Push, merge, tag, deploy ve mustafaras/seyma-data'ya yazma YOK. Sır isteme. Tarayıcı açma. Senin olmayan kirli dosyalara dokunma.
Son mesajında: Sıradaki prompt, bulgu → durum özeti, aile sonuçları, açık kalanlar, commit hash'i (≤15 satır).
```
