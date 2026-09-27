# KAO — Kur'an Arapçası Öğreniyorum · KAPANIŞ BELGESİ (2026-09-27)

**Kapanış tarihi:** 2026-09-27 · **Kapanış HEAD:** `46a2f8f` · **Durum:** ✅ KAPANDI
**Programlar:** 30 kartlık üretim (KAO-P00…KAO-28b) + 27 kartlık düzeltme (KAO-FIX-00…26) = **57 kart**
**Kalan iş: YOK** (kod tarafında); cihaz kabulü yalnız kullanıcıda

> Bu belge, `docs/` altındaki kapanış kayıtları geleniğini izler (`IIP-KAPANIS.md` gibi).
> Ham promptbook, evidence ve ledger baytları çalışma ağacında tutulmaz — gerektiğinde Git geçmişinden okunur.
> Kanonik durum: `kuran-ogreniyorum/KAO-STATE.json` (`status=completed`) ·
> `kuran-ogreniyorum/duzeltme/.anti-amnesia/CURRENT-STATE.md` (`completed`) · `LEDGER.md` (seq 1–60).

---

## 1. Neden kapandı

| Program | Kapsam | Sonuç |
|---|---|---|
| **KAO-01…KAO-28b** (30 kart) | Öğrenme yüzeyinin üretimi: FSRS, oturum, okuyucu, telaffuz, panel, gizlilik | 30/30 done |
| **KAO-FIX-00…26** (27 kart) | Bağımsız denetimin (K-1, Y-1…Y-4, O-1…O-11, D-1…D-6) kapattırılması | 27/27 done |

`KAO-STATE.json` → `status=completed` · `releaseApproval=APPROVED` (kullanıcı, 2026-09-24).
Kalan prompt **yoktur**; yeni KAO işi ayrı kapsam onayı ister.

---

## 2. Ölçülen sonuç (denetim öncesi → kapanış)

| Ölçü | Denetim (26 Eyl) | Kapanış (27 Eyl) |
|---|---|---|
| Denetim matrisi (145 satır) | TAM 86 · EKSİK 10 · ÇELİŞKİLİ 2 | **TAM 121 · EKSİK 0 · ÇELİŞKİLİ 0** |
| Ters yön kartı (`tr>ar`) | 0 / 524 lemma | **524 / 524** |
| "Bilinen kelime" tanımı | kod ≠ plan (şişik %) | **kod = plan (513 = 513)** |
| Aynı tür ardışık | 4 (gramer muaf) | **≤2 (gramer dahil)** |
| Mutasyon yakalama | M04/M09 kaçıyordu | **17/17 yakalandı** |
| İçerik gzip | 162.177 B | 162.177 B (tavan 163.840, KF-11) |
| `quranLearn.js` satır | 1.790 / 1.900 | **1.899 / 1.900 (KF-2)** |
| İngilizce anlam | 26 | **0** |
| quran.com kopyası | 618/618 birebir | **0** |
| Bağlam şeddesi başlık | 26 (+17 tamamlayıcı) | **0** |
| Kilometre taşı kazanılan | 1/6 | **5/6** (`shortSurahs` gecikmeli test yolunda) |

Fixture aileleri (kapanış): **kao 17/17 · app 77/77 · panel 23/23 · panel-v2 27/27 · quran 9/9 · reminder 21 PASS**.

---

## 3. Kapatılan gerçek kusurlar

### KRİTİK

- **K-1 · quran.com kopyası + atıfsız dağıtım.** 618 kısa sûre kelimesi ve 29 Fâtiha kelimesi lisansı belirsiz üçüncü taraf çevirisinden üretime kopyalanmıştı. Kapanış: yerel Türkçe katman (`surahs.verified.json`) + ATTRIBUTION + kopya/İngilizce kapıları. Kanıt: `kanit/KAO-FIX-02…04.md`.

### YÜKSEK

- **Y-1 · "bilinen kelime" tanımı plandan sapmış** → gözlemci paneline ve kullanıcıya şişik ilerleme. Kapanış: iki yön `review ∧ s≥21` (FIX-07).
- **Y-2 · ters yön kartı hiç oluşmuyor** → L2 yönü çalışılmıyor. Kapanış: her lemma iki kart, `tr>ar` en erken ertesi gün (FIX-06).
- **Y-3 · İngilizce anlamlar** (26 kayıt). Kapanış: dil kapısı + yerel katman (FIX-04).
- **Y-4 · bağlamdan taşınmış şedde** (26 başlık, `مَّشَ` dâhil). Kapanış: `lemmaBw` biçimi + kapılar (FIX-05).

### ORTA (11/11 kapandı ya da gerekçeli karar)

| Kimlik | Konu | Kapanış |
|---|---|---|
| O-1 | R-A2b çeldirici kuralı etkisiz | FIX-08 — `card.lastDistractors` üretim yolunda |
| O-2 | `quranLearn` sınırsız büyüme | FIX-09 — **kullanıcı kararı KF-10**: budama sınırı kaldırıldı |
| O-3 | 6 milat taşından 5'i kazanılamıyor | FIX-10 — 5/6 kazanılıyor |
| O-4 | freeze hattı kırık (SHA pini) | FIX-01 |
| O-5 | mutasyon kör noktaları | FIX-11 — 17/17 |
| O-6 | ses lisansı atfı yayında yok | FIX-12 — E7 "Kaynaklar ve lisanslar" |
| O-7 | R-A5 komşuları elle yazılmış | FIX-14 — 70 doğrulanmış küme sözlükten |
| O-8 | belgelenmemiş bütçe aşımları | FIX-16 — plan bütçeleri hizalandı |
| O-9 | Arapça yazı tipi yığını | FIX-13 — **cihaz kabulü bekliyor** |
| O-10 | KAO dışı kardeş değişiklik | `58e0ceb` ile kapandı |
| O-11 | süreç kuralları | FIX-17/18 — plan-check her commit'i görür; `findings` gerekçe ister |

---

## 4. Yayın kaydı

| Yayın | Ana commit | Pages run | Pin |
|---|---|---|---|
| FIX-13…18 | `a7b6ffe`…`eceee66` | sıralı success | `20260926k`… |
| FIX-20…26 | `036b67b`…`3cc9ffb` | 36323989074 (`f534a7b`) | `20260927d`…`g` |
| **FIX-19 kapanış** | `882c8ef` | **36325923128** success | `20260927g` |
| Betik taşıma | `46a2f8f` | **36328476418** success | `20260927g` |

**Canlı doğrulama:** `index.html`, `sw.js`, `app/core/quranLearn.js`, `app/kao.css` → repo ile bayt-eş (`cmp`).
Canlı yüzey: `https://mustafaras.github.io/s/` · pin `20260927g`.

---

## 5. Dürüstçe açık bırakılanlar

| Konu | Durum | Neden |
|---|---|---|
| **Cihaz kabulü (K3)** | **bekliyor** | O-9 Arapça font (iOS'ta yığın yüklü değil → sistem yedeği), R-C9b ≤90 sn, DOC04-§4f %200 metin/320 px, VoiceOver, ses çalma, mikrofon izni, CSV indirme, soldurma |
| **DOC03-§9 global %80 token kapsamı** | **karşılanamaz** | 524 lemmanın tavanı %77,42; `eighty` eşiği kullanıcı kararıyla %75 (KF-12). %80 için **yeni lemma** gerekir → sonraki program |
| `DOC06-ilke` Tanzil karşılaştırma fixture'ı | eklenemedi | Korpus girdileri (`content/inputs/*`) repoda yok, yalnız yerel makinede |
| `KAO-21` köprüleri ("kelimelerini öğren", Esmâ kök notu) | atlandı | Başka programların dosyalarına dokunmak gerekirdi; ayrı onay ister |
| `10 §9` ikinci okuyucu sesi genellemesi | yapılamaz | İkinci okuyucu ses varlığı yok |
| `D-5` kısa kart anahtarları (`st/n/l`) | kabul edilmedi | Uzun adlar korundu; göç riski sync bütçesinden büyük |
| `D-3` vakıf işaretleri (377 örnek) | belgeli istisna | KF-5; okuyucu katmanı R-A6 ile karşılıyor |

---

## 6. Yeni oturum için not

- **Kanonik durum:** `kuran-ogreniyorum/duzeltme/.anti-amnesia/CURRENT-STATE.md` (`completed`, `Sıradaki: —`).
- **Doğrulama komutları** (hepsi salt-okur):
  ```sh
  sh kuran-ogreniyorum/duzeltme/araclar/kao-kapilar.sh   # tüm aileler + STD + kontrast
  node kuran-ogreniyorum/tools/kao-plan-check.mjs        # plan/state tutarlılığı
  node kuran-ogreniyorum/tools/kao-verify-contrast.mjs   # 336/336 kontrast
  node tests/kao/test_kao_user_tasks.js --report         # gzip bütçesi
  sh kuran-ogreniyorum/duzeltme/araclar/kao-canli-dogrula.sh  # canlı ↔ repo cmp
  ```
- **Yardımcı betikler** (`duzeltme/araclar/`, 2026-09-27 repoya alındı): `kao-kapilar.sh`
  (STD §Ö4), `kao-yayin-pini.sh` (PIN-P), `kao-canli-dogrula.sh`, `kao-pages-izle.sh`,
  `kao-sim-ozet.sh`. FIX-PROMPTLARI §Ö4'ten bağlıdır.
- **Tuzak:** yeni bir `App.kao*` handler eklemek fx2/v3/surface pinlerini kaydırır
  (App 756 · onclick 393 · v3 556 · surface 594). KAO runtime'ı, 4 içerik modülü ve
  `app/kao.css` tek yayın pinini paylaşır. Satır bütçesi **1.899/1.900** doludur.
- **Yayın:** push/deploy kararı kullanıcıda; bu belge hiçbir canlı eylem yetkisi vermez.

---

## 7. Bu belge kapsamı dışında olanlar

Şu konular **bu arşive dâhil edilmedi** çünkü kapalı değiller: KAO-FIX sonrası yeni bir
KAO programı (yok), içerik genişletme (%80 hedefi), ikinci okuyucu sesi ve cihaz kabulü.
Bunlar yeni kapsam onayı ister.
