# 🎯 Zikirmatik — Premium, Kalıcı ve Ölçülebilir Geliştirme Planı

> **Kapsam:** Yalnızca Zikirmatik. İlham & İbadet’in diğer parçaları bu
> çalışmanın dışında kalır.
>
> **Amaç:** Zikirmatiği günlük küçük bir sayaç olmaktan çıkarıp; tam ekran,
> çevrimdışı çalışan, seçilen zikre günler boyunca kaldığı yerden devam eden,
> Esmâ için hem tek ebced turunu hem de `ebced²` tamamlama yolculuğunu güvenilir
> biçimde izleyen bağımsız bir ibadet aracına dönüştürmek.
>
> **Sıralı uygulama promptları:**
> [`ZIKIRMATIK-IPHONE16-PREMIUM-PROMPT-PAKETI.md`](../prompts/legacy/ZIKIRMATIK-IPHONE16-PREMIUM-PROMPT-PAKETI.md)
> — opak iPhone Pro Max tasarımı, 99 Esmâ içerik sözleşmesi, erişilebilirlik,
> test ve kontrollü yayın kapılarını ZP-00–ZP-19 halinde uygular.

## Uygulama durumu — 2026-07-29

> **Canlı görünürlük durumu:** Kullanıcı talebiyle Zikirmatik kartı, sekmesi,
> modalı ve panel kartı geçici olarak kapatıldı. Veri modeli, migration,
> sayımlar ve hatimler korunuyor. Yeni opak, geniş, iPhone 16 Pro Max uyumlu
> tasarım ayrı branch üzerinde hazırlanıp onaydan önce `main`e alınmayacak.

Z1–Z9 fazlarının çekirdeği uygulandı ve headless kabul kapılarından geçti. Canlı
tarayıcı açılmadı; ağ/senkron testleri mock ortamında çalıştı. Son teslim
durumu: tam ekran bağımsız sayaç, 99 Esmâ, ebced turu + `ebced²` tam hatim,
kalıcı yolculuklar, güvenli undo/yeni hatim, idempotent migration, erişilebilir
premium ayarlar, nötr analiz, panel aynası ve monotonik cihaz merge tamamlandı.

---

## 0. Ürün ilkesi: gelenek ile bilimsel ürün tasarımını ayır

- **Ebced**, Arap harflerinin sayısal değerlerine dayanan geleneksel bir hesap
  sistemidir. Uygulama bu değeri deterministik biçimde hesaplar ve gösterir.
- `ebced²` hedefi uygulamada **“Ebced² Tam Hatim”** adıyla sunulur; ancak bunun
  dinen zorunlu, evrensel veya bilimsel olarak kanıtlanmış bir ibadet ölçüsü
  olduğu ileri sürülmez.
- Arayüzde kısa ve sakin açıklama:
  > “Bu hedef geleneksel ebced hesabına dayalı kişisel bir tamamlama
  > yolculuğudur; dua ve zikrin kabulü için zorunlu bir sayı değildir.”
- “Bilimsel” yaklaşım; teolojik sonuç iddiası değil:
  - sayım doğruluğu,
  - veri kaybını önleme,
  - düşük bilişsel yük,
  - erişilebilir dokunma alanları,
  - isteğe bağlı ritim/nefes desteği,
  - ölçülebilir ve denetlenebilir ilerleme,
  - yanlış kesinlik üretmeyen raporlama
  anlamına gelir.

---

## 1. Hedef matematiği ve kesin gösterim kuralları

### 1.1 Esmâ için iki katmanlı hedef

Her Esmâ presetinde:

- `baseTarget = ebced`
- `hatimTarget = ebced × ebced`
- `countDirection = "up"` veri kaynağında daima ileri gider.
- Geri sayım yalnız görsel bir sunumdur; kalıcı değer negatif veya geriye
  giden sayaç değildir.

### 1.2 el-Fettâh örneği

- Arapça yazım: `فتاح`
- Asıl ebced: `489`
- Bir tur: `489`
- Ebced² Tam Hatim: `489 × 489 = 239.121`
- Tam hatimde toplam **489 adet 489’luk tur** bulunur.

Örnek ekran durumları:

| Toplam okunan | Tur göstergesi | Tur içi | Tam hatim |
|---:|---|---:|---:|
| 0 | 1. tur | 0 / 489 | 0 / 239.121 |
| 488 | 1. tur | 488 / 489 | 488 / 239.121 |
| 489 | 1 tur tamam · 2. tur hazır | 0 / 489 | 489 / 239.121 |
| 490 | 2. tur | 1 / 489 | 490 / 239.121 |
| 8.445 | 17 tur tamam · 18. tur | 132 / 489 | 8.445 / 239.121 |
| 239.120 | 489. tur | 488 / 489 | 239.120 / 239.121 |
| 239.121 | 489 tur tamam | 489 / 489 | Tam hatim tamamlandı |

### 1.3 Tek kaynaklı formüller

```text
hatimTarget       = baseTarget²
completedCycles   = floor(hatimCount / baseTarget)
cyclePosition     = hatimCount % baseTarget
currentCycleNo    = min(baseTarget, completedCycles + 1)
remainingInCycle  = hatimCount >= hatimTarget
                    ? 0
                    : cyclePosition == 0 && hatimCount > 0
                    ? baseTarget
                    : baseTarget - cyclePosition
remainingInHatim  = max(0, hatimTarget - hatimCount)
hatimProgress     = min(1, hatimCount / hatimTarget)
```

Tam tur sınırında arayüz çelişki üretmemeli:

- Ana sayaç: `489 tamamlandı`
- İkincil bilgi: `1 tur tamam · 2. tur hazır`
- Sonraki dokunuşla: `2. tur · 1/489`

---

## 2. Yeni veri modeli — günlük sayıdan kalıcı yolculuğa

Mevcut `sessions[date].perPreset[presetId] = number` yapısı günlük rapor için
korunur; fakat kaldığı yerden devamın ana kaynağı olmaktan çıkar.

### 2.1 `data.zikr` şema v2

```js
data.zikr = {
  schemaVersion: 2,
  presets: [],

  journeys: {
    "esma_19": {
      presetId: "esma_19",
      lifetimeCount: 8445,
      activeHatimId: "hatim_...",
      lastAt: "ISO_DATE",
      lastSessionId: "zs_...",

      hatims: [{
        id: "hatim_...",
        mode: "ebced_square",
        baseTarget: 489,
        target: 239121,
        count: 8445,
        startedAt: "ISO_DATE",
        completedAt: null,
        status: "active"
      }]
    }
  },

  sessions: {
    "YYYY-MM-DD": {
      totalCount: 0,
      completedSets: 0,
      perPreset: {
        "esma_19": {
          count: 0,
          completedCycles: 0,
          lastAt: "ISO_DATE"
        }
      }
    }
  },

  activeSession: {
    id: "zs_...",
    presetId: "esma_19",
    hatimId: "hatim_...",
    startedAt: "ISO_DATE",
    lastAt: "ISO_DATE",
    count: 0,
    pausedAt: null
  },

  settings: {
    activePresetId: "esma_19",
    defaultMode: "hatim",
    soundOn: false,
    haptic: true,
    keepAwake: false,
    reducedMotion: false,
    breathGuide: false,
    confirmReset: true
  }
}
```

### 2.2 Kaynakların sorumluluğu

- `journeys[presetId].hatims[]`:
  - günler üstü kalıcı hatim ilerlemesinin **tek doğruluk kaynağı**,
  - uygulama kapanıp açılsa da devam eder,
  - yeni gün başladığında sıfırlanmaz.
- `sessions[date]`:
  - yalnız günlük/haftalık analiz,
  - bugünkü toplam ve tur sayısı,
  - panel aynası.
- `data.days[date].zikr`:
  - hızlı günlük özet,
  - panel/gün detayında güvenli render,
  - hatim kaynağı değildir.
- `activeSession`:
  - kullanıcı modalı kapatıp geri döndüğünde “Oturuma devam et”,
  - preset ve aktif hatim bağını korur.

### 2.3 Gün değişimi

Gece yarısından sonra:

- aktif hatim ve toplam ilerleme aynen kalır,
- yeni tarihin günlük sayacı `0` ile başlar,
- ekranda:
  - `Bugün: 0`
  - `Bu hatim: 8.445 / 239.121`
  - `18. adet 489’luk tur: 132 / 489`
  birlikte gösterilir.

### 2.4 Kayıt güvenliği

- Her geçerli dokunmada:
  1. aktif hatim sayısı,
  2. lifetime toplamı,
  3. günlük preset sayısı,
  4. günlük toplam,
  5. `lastAt`
  tek işlem içinde güncellenir.
- Ardından `save()` ile localStorage’a hemen yazılır.
- GitHub senkronu mevcut debounce mekanizmasını kullanır.
- Görsel performans için tam `render()` her dokunuşta yapılmaz:
  `zikrPaintLive()` yalnız sayaç, halka ve metrik DOM’larını günceller.
- Tur/hatim sınırı, preset değişimi, sekme değişimi ve hata durumunda tam
  `render()` yapılır.

---

## 3. Tam ekran ve kendi içinde çalışan Zikirmatik

### 3.1 Bağımsız overlay

Mevcut alt-sheet görünümü kaldırılır.

- `position: fixed; inset: 0; width: 100%; height: 100dvh`
- `z-index` diğer hub modal çakışmalarından bağımsız.
- Kendine özel kimlikler:
  - `#zikr-overlay`
  - `#zikr-screen`
  - `#zikr-scroll`
  - `#zikr-live-count`
- Ortak `#sey-ov-body` kullanılmaz.
- Modal kendi header, içerik, dock ve navigasyonunu taşır.
- Telefon safe-area değerlerine tam uyumlu olur.
- Tarayıcı geri tuşu / kapatma:
  - oturumu silmez,
  - yalnız görünümü kapatır,
  - tekrar açınca aynı preset ve aynı hatim geri gelir.

### 3.2 İç navigasyon

Zikirmatik kendi içinde dört görünüme sahip olur:

1. **Sayaç**
2. **Esmâ & Zikirler**
3. **Hatimlerim**
4. **Analiz**

İlham & İbadet sekmesine dönmeden tüm temel işlemler yapılabilir.

### 3.3 Sayaç ekranı

Üst bölüm:

- geri/kapat,
- aktif Esmâ adı,
- bağlantı/kayıt durumu: `Cihazda kaydedildi`,
- sessiz mod göstergesi.

Odak bölümü:

- Arapça isim,
- Türkçe okunuş,
- kısa anlam,
- büyük dokunma alanı,
- merkezde **tur içinde kalan sayı**,
- çevresinde tek turun ilerleme halkası.

Alt metrik şeridi:

- `Bugün 327`
- `Bu oturum 146`
- `17 tur tamam`
- `Tam hatim %3,53`

Hatim kartı:

```text
el-Fettâh · Ebced² Tam Hatim
8.445 / 239.121
18. tur · 132 / 489
230.676 kaldı
```

Sabit alt dock:

- `−1 Geri al`
- `Duraklat / Devam`
- ekran kilidi / keep-awake
- ses
- titreşim

### 3.4 Dokunma güvenilirliği

- Ana dokunma alanı en az `180×180 CSS px`.
- Küçük kontroller en az `44×44 CSS px`; aralarında en az `8px`.
- Tek fiziksel dokunuş yalnız bir sayı üretir.
- `pointerdown` ve `click` birlikte çift sayım üretmemeli; proje desenine uygun
  tek handler yolu kullanılmalı.
- 250 ms’den kısa tekrar blokajı yapılmaz; hızlı zikir ritmi engellenmez.
- Aynı event kimliği ikinci kez işlenmez.
- Uzun basma sayaç artırmaz.
- Klavye erişimi: `Space` / `Enter` bir sayım.
- Ekran okuyucu her sayıda konuşmaz; yalnız tur/hatim kilometre taşlarını
  `aria-live="polite"` ile bildirir.

---

## 4. Hatim yönetimi

### 4.1 Hatimlerim ekranı

Her Esmâ için:

- aktif hatim,
- tamamlanan hatim sayısı,
- lifetime toplam,
- son çalışma zamanı,
- kaldığı tur.

Kart örneği:

```text
el-Fettâh
Aktif hatim · %3,53
17 / 489 tur tamam
Son çalışma: bugün 21:42
[Devam et]
```

### 4.2 Yeni hatim

- Aktif hatim bitmeden “Yeni hatim” varsayılan olarak açılmaz.
- Kullanıcı isterse:
  - aktif hatmi arşivle,
  - yeni hatim başlat,
  - mevcut hatme dön
  seçeneklerini görür.
- Yeni hatim lifetime toplamını silmez.

### 4.3 Sıfırlama yerine güvenli dil

Ana ekrandaki tehlikeli `Bugünkü sayaç sıfırlandı` davranışı ayrıştırılır:

- **Oturumu bitir:** sayıları korur.
- **Bugünkü kaydı düzelt:** yalnız bugünkü sayıya müdahale eder, onay ister.
- **Aktif hatmi arşivle:** ilerlemeyi saklar.
- **Tüm zikir geçmişini sil:** Ayarlar içinde, yazılı doğrulama ve yedek
  uyarısıyla bulunur.

---

## 5. Premium fakat sakin görsel sistem

### 5.1 Tasarım yönü

- Tema: koyu zümrüt + sıcak altın + fildişi.
- “Lüks” hissi yoğun animasyondan değil:
  - tipografi,
  - boşluk,
  - hassas haptic,
  - yumuşak derinlik,
  - temiz sayı hiyerarşisinden gelir.
- Arapça isim en yüksek görsel saygıyla, sayaçtan ayrı bir katmanda durur.
- Rakamlar `font-variant-numeric: tabular-nums`.
- Tur tamamlanınca:
  - tek altın halka yayılımı,
  - kısa çift titreşim,
  - “18. tura geçtin” bildirimi.
- Tam hatimde:
  - sakin tamamlanma ekranı,
  - tarih/süre/toplam özeti,
  - paylaşma zorlaması veya konfeti yok.

### 5.2 Hareket ve duyusal ayarlar

- `prefers-reduced-motion` otomatik uygulanır.
- Ses varsayılanı kullanıcı tercihiyle hatırlanır.
- Haptic başarısızsa sayaç çalışmaya devam eder.
- İsteğe bağlı odak modu:
  - üst/alt kontroller solar,
  - yalnız isim, sayaç ve halka kalır.
- Yanlış dokunmayı azaltmak için “cep modu”:
  - ekran kilidi,
  - yeniden açmak için iki saniye basılı tut.

---

## 6. Bilimsel ve ölçülü odak özellikleri

### 6.1 İsteğe bağlı nefes rehberi

- Sayaçtan bağımsızdır; her zikri bir nefese zorla bağlamaz.
- İsteğe bağlı `5–6 nefes/dk` görsel ritim:
  - “nefes al” / “nefes ver” yerine sade genişleyen halka,
  - kapatılabilir,
  - tıbbi fayda iddiası içermez.
- Hızlı zikir kullanan kişide ritmi yavaşlatmaz.

### 6.2 Kişisel ritim analizi

- Son oturumlardan medyan sayım hızı:
  - `zikir/dk`,
  - tahmini tur süresi,
  - tahmini hatim süresi.
- Tahminler kesin tarih vaadi olarak sunulmaz:
  > “Son ritmine göre yaklaşık 34 oturum.”
- Aykırı hızlı dokunuşlar analizden çıkarılır; sayımdan çıkarılmaz.
- Uzun oturumlarda isteğe bağlı nazik mola:
  - 10–15 dakika veya kullanıcı hedefi,
  - el/bilek rahatlatma önerisi,
  - suçluluk dili yok.

### 6.3 Gösterilmeyecek “bilimsel” metrikler

- kalori,
- stres puanı,
- “maneviyat skoru”,
- kabul olasılığı,
- psikolojik tanı,
- uydurma biyometrik çıkarım
  gösterilmez.

---

## 7. Analiz ekranı

Öncelikli metrikler:

- bugün / hafta / ay toplamı,
- aktif hatim ilerlemesi,
- tamamlanan ebced turları,
- tamamlanan hatimler,
- en çok çalışılan Esmâ,
- gün/saat dağılımı,
- kişisel medyan ritim,
- kaldığı yer.

Görseller:

- 7 günlük küçük bar,
- 12 haftalık yoğunluk ısısı,
- Esmâ bazlı hatim kartları,
- yıllık toplam yalnız ikincil bilgi.

Seri:

- tek başarı ölçüsü değildir,
- kaçırılan gün “seri bozuldu” şeklinde cezalandırılmaz,
- “Son 30 günde 18 gün” gibi nötr devamlılık dili tercih edilir.

---

## 8. Panel aynası

Zikirmatik kullanıcı tarafında bağımsız çalışır; fakat kalıcı veriler proje
ilkesi gereği ÆON panelinde salt-okunur özetlenir:

- aktif Esmâ,
- aktif hatim `count / target`,
- tamamlanan tur sayısı,
- bugün/hafta toplamı,
- son zikir zamanı,
- tamamlanan hatim sayısı.

Panel:

- sayacı değiştiremez,
- hatim başlatamaz/silemez,
- ham dokunma olaylarını göstermez.

---

## 9. Migration planı

### 9.1 Eski veriden v2’ye

1. Mevcut `data.zikr.sessions` tarih sırasına konur.
2. Her preset için eski günlük `perPreset` toplamları bir kez toplanır.
3. `journeys[presetId].lifetimeCount` oluşturulur.
4. Esmâ ise:
   - `target = ebced²`,
   - `completedHatims = floor(lifetimeCount / target)`,
   - `remainder = lifetimeCount % target`,
   - `remainder > 0` ise bu değerle aktif hatim oluşturulur,
   - `remainder === 0 && lifetimeCount > 0` ise son hatim tamamlanmış kabul
     edilir; uygulama kendiliğinden boş yeni hatim başlatmaz.
5. Mevcut günlük kayıtlar değiştirilmez.
6. `migrationVersion: "zikr_v2"` yazılır; ikinci boot aynı sayıları tekrar
   ekleyemez.

### 9.2 Uyuşmazlık koruması

- Eski presetin hedefi sonradan değişmişse ham günlük toplam korunur.
- Esmâ ebced değeri modülden gelir; kullanıcı değiştiremez.
- Kullanıcı presetlerinde:
  - basit hedef,
  - manuel tur hedefi
  seçenekleri bulunur; otomatik ebced² uygulanmaz.

---

## 10. Uygulama fazları

| Faz | Durum | Kapsam | Çıktı | Kabul kapısı |
|---|---|---|---|---|
| Z1 | ✅ | Matematik + şema | `journeys`, `hatims`, saf hesap helper’ları | Sınır testleri eksiksiz |
| Z2 | ✅ | Migration | Günlük veriden kayıpsız v2 geçiş | İkinci migration toplamı büyütmez |
| Z3 | ✅ | Sayaç çekirdeği | atomik tap/undo/pause/resume | Reload ve gün değişiminde devam |
| Z4 | ✅ | Tam ekran kabuk | bağımsız 100dvh overlay + safe-area | Ortak overlay kimliği yok |
| Z5 | ✅ | Ebced² UI | tur + hatim + kalan + tamamlanma | Fettâh 489² senaryosu |
| Z6 | ✅ | Esmâ/Hatimlerim | arama, aktif hatimler, devam | 99 isimde ayrı ilerleme |
| Z7 | ✅ | Premium erişilebilirlik | haptic/ses/reduced motion/keyboard | WCAG dokunma/klavye kapıları |
| Z8 | ✅ | Analiz + panel | nötr devamlılık ve hatim özetleri | Eski/eksik veride güvenli |
| Z9 | ✅ | Veri güvenliği | sync/mirror/regresyon | Kayıp/çift sayım yok |

---

## 11. Zorunlu test matrisi

### 11.1 Saf matematik

- Fettâh: `489² === 239121`
- `0`, `1`, `488`, `489`, `490`
- `239120`, `239121`, `239122`
- büyük sayılarda `Number.isSafeInteger`
- base target `1`, eksik, sıfır, NaN koruması

### 11.2 Kalıcılık

- 132 say → kapat → aç → 132
- sayfa reload → aynı preset/hatim
- gün değiştir → hatim aynı, bugün sıfır
- preset A → B → A → A kaldığı yer
- çevrimdışı say → yeniden aç → kayıp yok

### 11.3 Tur/hatim

- 488 → tap → 1 tur tamam
- 489 → undo → 488 ve tamamlanan tur geri alınır
- 239.120 → tap → tamamlanma yalnız bir kez
- tamamlanmış hatimde yanlışlıkla otomatik yeni hatim başlamaz
- yeni hatim lifetime toplamını silmez

### 11.4 Etkileşim

- hızlı 100 dokunma = tam 100 artış
- pointer/click çift tetik = tek artış
- ses/haptic kapalıyken sayaç çalışır
- reduced-motion ile zorunlu animasyon yok
- klavye ve ekran okuyucu kilometre taşı bildirimi

### 11.5 Migration

- eski boş kullanıcı,
- yalnız bugünkü kayıt,
- birden çok gün,
- birden çok preset,
- eski çoklu set,
- migration’ın iki kez çalışması,
- panelde alanların eksik olması.

### 11.6 Repo doğrulaması

```text
node --check app.js
node .claude/skills/run-seyma/driver.mjs
node .claude/skills/run-seyma/zikr-harness.mjs
node test_faz10_sync.js
node test_faz11_panel.js
git diff --check
```

Gerçek uygulama tarayıcıda agent tarafından açılmaz; Zikirmatik senaryoları
fetch/senkron kapalı Node VM harness ile sürülür.

---

## 12. Tamamlanma tanımı

Zikirmatik ancak aşağıdakilerin tümü sağlanınca tamamlanmış sayılır:

- Tam ekran ve diğer hub’lardan bağımsız çalışıyor.
- Her zikir kendi kaldığı yerden günler sonra devam ediyor.
- 99 Esmâ’nın ebced değeri değiştirilemez ve kaynaklı.
- Esmâ için tek tur ile `ebced²` tam hatim aynı anda izleniyor.
- Fettâh ekranı kaçıncı 489’luk turda olduğunu açıkça gösteriyor.
- Reload, gün değişimi, preset değişimi ve çevrimdışı kullanım veri kaybetmiyor.
- Undo tur ve hatim sınırlarında matematiksel olarak doğru.
- Günlük rapor ile lifetime hatim ilerlemesi birbirine karışmıyor.
- Sayaç hızlı kullanımda çift saymıyor ve dokunma kaçırmıyor.
- Erişilebilirlik, reduced-motion, ses/haptic fallback tamam.
- Panel salt-okunur doğru özet gösteriyor.
- Eski veri migration’ı idempotent ve kayıpsız.
- Dini zorunluluk veya bilimsel fayda konusunda yanıltıcı iddia yok.

---

## Kaynak ilkeleri

- TDV İslâm Ansiklopedisi — Ebced:
  https://islamansiklopedisi.org.tr/ebced
- Diyanet — Esmâ-i Hüsnâ’nın anlamını bilme ve anlama vurgusu:
  https://www2.diyanet.gov.tr/DiniYay%C4%B1nlarGenelMudurlugu/DergiDokumanlar/Aylik/2017/temmuz_aylik.pdf
- W3C WCAG 2.2 — Dokunma hedefi:
  https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html
- Bernardi ve ark. — Ritmik dua/mantra ve solunum-kardiyovasküler ritimler:
  https://pubmed.ncbi.nlm.nih.gov/11751348/
- Yavaş ritimli solunum ve dikkat çalışması:
  https://pmc.ncbi.nlm.nih.gov/articles/PMC11794674/
