# Panel Düzeltme Prompt Seti

> Kaynak: [PANEL-DENETIM-RAPORU.md](PANEL-DENETIM-RAPORU.md) — buradaki her
> prompt, raporun bir maddesini eksiksiz çözecek şekilde yazıldı.
>
> **Kullanım:** Her prompt kendi başına bağımsızdır (context-engineered) —
> herhangi bir kodlama ajanına (Claude Code, Cursor, Codex, Copilot Workspace,
> vb.) bu konuşmanın geçmişi olmadan tek başına verilebilir. Prompt'ları
> sırayla (Faz 1 → 4) uygula; her prompt kendi doğrulama adımlarını içerir.
> Bir prompt'u çalıştırmadan önce `git status` ile çalışma dizininin temiz
> olduğundan emin ol, her prompt'tan sonra ayrı bir commit at.
>
> **Tüm prompt'larda geçerli ortak kısıtlar** (her prompt'un içine de
> gömülüdür, ama tekrar altını çiziyoruz):
> - Bu repo `/Users/m_ras/Desktop/seyma` — Şeyma adlı özel bir sağlık/mood
>   takip uygulaması + ÆON gözlemci paneli. `panel.js`/`panel.html` gerçek
>   kişisel sağlık verisi taşıyabilir.
> - **Uygulamayı asla bir tarayıcıda açma / sunucuya deploy etme / gerçek
>   veri repo'suna (`mustafaras/seyma-data`) push etme.** Doğrulama yalnız
>   `node --check`, mevcut headless test dosyaları (`tests/test_panel_*.js`)
>   ve `.claude/skills/run-seyma/` altındaki harness'larla yapılır.
> - CommonJS/vanilla JS, framework yok, build adımı yok. Mevcut kod stiline
>   (tek satırlık yoğun fonksiyonlar, `esc()` ile HTML kaçışı, Türkçe UI
>   metni) sadık kal — gereksiz yeniden yazım/refactor yapma, yalnız
>   istenen değişikliği uygula.
> - Her değişiklikten sonra ilgili test dosyalarını çalıştır ve sonucu
>   raporla; testler kırmızıya düşerse ya testi (davranış kasıtlı
>   değiştiyse) ya kodu düzelt.

---

## Faz 1 — Sessiz veri kaybını durdur

### Prompt 1.1 — Yan-kanal fetch hatasının 9 kartı sessizce boşaltmasını düzelt

```
Bağlam: /Users/m_ras/Desktop/seyma reposunda panel.js dosyasında bir gözlemci
dashboard'u var. loadAll() fonksiyonu içinde panel.js:4548-4581 civarında şu
desen var:

  Promise.all([loadInbox, loadDeliveryP, loadSyncReceiptP,
               loadObserverProjectionP, loadEventLogP])
    .catch(function(err){ ... PROJECTION_SECTIONS={}; ... })

Sorun: Bu beş fetch'ten HERHANGİ biri başarısız olursa (örn. yalnızca
data/observer-inbox.json GitHub API'de geçici 500/timeout verirse), ortak
catch bloğu PROJECTION_SECTIONS'ı boş objeye resetliyor — halbuki ana
data/latest.json (latestLegacy) verisi sağlıklı gelmiş olabilir. Bu durumda
PROJECTION_SECTIONS'a bağlı 9 kart (dailyPhoto, roomContentHistory,
saygiRoot, locNudge, therapyProvenance, profileProgress,
notificationTimeline, externalSources, locationTiming) "missing" durumuna
düşüyor ve kullanıcıya bunun "gerçek veri yok" mu yoksa "geçici ağ hatası"
mı olduğunu ayırt eden hiçbir gösterge çıkmıyor. Bu, "panelde bir şey
görünmüyor" şikayetinin en olası kök nedeni.

Görev:
1. panel.js içinde bu Promise.all zincirini bul (loadAll/init fonksiyonu
   içinde, PROJECTION_SECTIONS'ın atandığı yer — panel.js:4548 civarı).
2. .catch bloğunu değiştir: PROJECTION_SECTIONS={} ile TAMAMEN resetlemek
   yerine, önceki (varsa) PROJECTION_SECTIONS değerini KORU — yalnızca
   fetch hatası olduğunu ayrı bir state alanında işaretle (örn. mevcut
   PROJECTION_STATE global'ine section_fetch_failed:true benzeri bir alan
   ekle, ya da yeni küçük bir SECTION_FETCH_STATE={ok:false,
   lastError:<mesaj>, failedAt:<ISO tarih>} global'i tanımla — panel.js'in
   üst kısmındaki (satır ~114-140) diğer global tanımlarına bakıp aynı
   isimlendirme/yapı konvansiyonunu takip et).
3. syncRibbonHTMLP fonksiyonuna (panel.js:1150 civarı) bu yeni durumu
   yansıtan kısa, ayırt edici bir uyarı ekle — örn. "Bazı modüller geçici
   olarak yüklenemedi, otomatik yeniden denenecek" gibi Türkçe, panelin
   mevcut ton/üslubuna uygun bir metin. Mevcut sync ribbon'daki diğer durum
   metinlerinin (örn. "Projection bozuk; güvenli legacy fallback
   kullanılıyor") yanına, aynı badge/rozet desenini kullanarak ekle.
4. İlk yüklemede (uygulama daha hiç PROJECTION_SECTIONS almamışken) bu
   hata olursa hâlâ normal "missing" davranışı olmalı — yalnız "önceden
   sağlıklı veri vardı, şimdi geçici hata oluştu" senaryosunda eski veri
   korunmalı ve yukarıdaki uyarı gösterilmeli. Bu ayrımı net bir koşulla
   yap (örn. PROJECTION_SECTIONS zaten dolu mu kontrolü).

Kısıtlar: Mevcut chooseProjection/legacy_fallback mantığına (panelCoverage
Manifest.js) dokunma — bu değişiklik yalnız panel.js'teki yan-kanal fetch
catch bloğunu ilgilendiriyor. Ağır bir yeniden yapılanma yapma, minimal ve
odaklı bir düzeltme yaz. Gerçek network çağrısı yapma/deneme — yalnız kod
okuyarak ve mevcut mock/fixture'larla doğrula.

Doğrulama:
- node --check panel.js
- node tests/test_panel_p0_sync.js
- node tests/test_panel_p1_projection.js
- Eğer bu iki test dosyasında side-channel/section fetch hatası senaryosu
  yoksa, mevcut mock fetch fixture desenini (dosyaların başındaki context/
  mock yapısına bak) kullanarak YENİ bir assertion ekle: "observer-inbox
  fetch'i reddedilirse ana latest.json verisi sağlıklıysa
  PROJECTION_SECTIONS eski değerini korur ve syncRibbonHTMLP çıktısı yeni
  uyarı metnini içerir" — bunu ya mevcut bir test dosyasına ya da açıkça
  isimlendirilmiş yeni bir tests/test_panel_section_fetch_failure.js
  dosyasına ekle, diğer test dosyalarındaki extractFunction/vm.
  runInNewContext deseniyle aynı şekilde yaz.

Kabul kriterleri: Yukarıdaki üç doğrulama komutu da PASS vermeli; yeni
eklenen assertion(lar) da PASS vermeli; mevcut hiçbir test kırılmamalı.
```

### Prompt 1.2 — Terapi ve Konum modüllerine "eski veri" (stale) durumu ekle

```
Bağlam: /Users/m_ras/Desktop/seyma reposunda panelCoverageManifest.js
dosyasında dailyPhoto projeksiyonu (panelCoverageManifest.js:246-249
civarı) açık bir "stale" (eski veri) bayrağı taşıyor — veri belli bir
yaştan eskiyse status alanı bunu yansıtıyor. Ancak therapyProjection
(panelCoverageManifest.js:315-317) ve konum ile ilgili projeksiyon
fonksiyonu (panelCoverageManifest.js:315-335 aralığında, locationTiming/
locNudge'ı besleyen fonksiyon) yalnızca 'missing' / 'malformed' / 'ok'
durumlarını dönebiliyor — 'stale' dalı hiç yok. Sonuç: 2 hafta önceki bir
terapi kaydı da "ok" gösteriliyor, hiç kayıt yoksa da "missing" — arada
görsel/durumsal fark yok, gözlemci verinin ne kadar güncel olduğunu
anlayamıyor.

Görev:
1. panelCoverageManifest.js içinde dailyPhoto'nun stale hesaplama mantığını
   bul (muhtemelen bir "eşik gün sayısı" karşılaştırması, örn. son
   fetchedAt/updatedAt ile şu anki tarih farkı).
2. Aynı deseni therapyProjection fonksiyonuna uygula: terapi kaydının en
   son tarihi (data.days.<date>.therapy'nin bulunduğu en güncel gün) ile
   referans tarih arasındaki fark belli bir eşiği (örn. 3-7 gün — dailyPhoto
   ile tutarlı bir eşik seç, ya da ayrı bir makul sabit tanımla ve neden
   seçtiğini kısa bir yorumla açıkla) aşarsa status:'stale' dönsün.
3. Konum projeksiyonuna (locationTiming/locNudge'ı besleyen fonksiyon)
   aynı stale mantığını uygula — en son örnek/nudge zamanına göre.
4. panel.js içinde d4ModuleDescriptorsP fonksiyonundaki (panel.js:1334-1353)
   thStatus ve locationStatus hesaplamalarını güncelle — şu an yalnızca
   'malformed'/'missing'/'incomplete'/'ok' arasında seçim yapıyorlar
   (panel.js:1339,1341 civarı), yeni 'stale' durumunu da bu zincire ekle
   (auditRollupStatusP fonksiyonunun zaten 'incomplete' bucket'ını
   desteklediğini unutma — stale'i mantıklı şekilde bu bucket'a veya yeni
   bir uyarı rengine bağla, panel.js:1261-1267 civarındaki
   auditRollupStatusP tanımına bak).
5. p3StatusP / d4CoverageBadgeP gibi rozet render fonksiyonlarının 'stale'
   durumunu görünür bir Türkçe etiketle (örn. "Eski") gösterdiğinden emin
   ol — muhtemelen zaten destekliyor (dailyPhoto için çalışıyorsa), sadece
   yeni durumun doğru rozete eşlendiğini doğrula.

Kısıtlar: Mevcut dailyPhoto stale eşiğini/mantığını bozma, yalnız aynı
deseni terapi ve konuma da yay. Yeni bir framework/kütüphane ekleme.

Doğrulama:
- node --check panelCoverageManifest.js panel.js
- node .claude/skills/run-seyma/verify-state-migration-boundary.mjs (varsa
  ilgili fixture'ları etkiliyorsa)
- node tests/test_panel_p1_projection.js
- node tests/test_panel_p3_root_modules.js
- node tests/test_panel_p4_provenance.js
- Bu test dosyalarından en az birine, "3 gün önceki terapi kaydı ->
  status stale" ve "8 gün önceki konum örneği -> status stale" senaryolarını
  kontrol eden yeni assertion(lar) ekle (mevcut fixture/mock event
  oluşturma desenini kullan).

Kabul kriterleri: Tüm listelenen testler PASS; yeni eklenen stale
senaryosu assertion'ları PASS; dailyPhoto'nun mevcut stale davranışı
regresyona uğramamalı (ilgili test hâlâ PASS).
```

### Prompt 1.3 — Terapi kartına "geçmişe bakan" son kayıt bilgisi ekle

```
Bağlam: /Users/m_ras/Desktop/seyma reposunda panelCoverageManifest.js
içindeki therapyProjection(source,date) fonksiyonu (panelCoverageManifest.
js:315-317 civarı) yalnızca TEK bir günün (date parametresi ile verilen,
genelde "bugün" veya seçili gün) data.days.<date>.therapy alanına bakıyor.
Dün terapi yapılmış, bugün yapılmamışsa kart "0 düşünce özeti / missing"
gösteriyor — gözlemciye "hiç terapi yapılmamış" izlenimi veriyor, oysa
geçmişte kayıt var. Bu yanıltıcı.

Görev:
1. therapyProjection fonksiyonunu, yalnız tek günü değil, kaynak
   (source/data) içindeki TÜM data.days.*.therapy kayıtlarını tarayarak
   "en son terapi kaydının tarihi" ve "o kayıttan bu yana geçen gün
   sayısı"nı da hesaplayacak şekilde genişlet. Fonksiyonun dönüş
   objesine yeni alanlar ekle: örn. lastRecordedDate (ISO tarih veya null)
   ve daysSinceLastRecord (sayı veya null). Mevcut alanları (status,
   thoughtCount, vb.) KIRMA — yalnız ekle.
2. Bu tarama makul bir üst sınır içinde olsun (örn. son 90 gün) — tüm
   geçmişi sınırsız taramak yerine performans için bir pencere kullan;
   app.js'in data.days yapısının tarih-anahtarlı bir obje olduğunu
   unutma (Object.keys(data.days) ile gün listesi alınabilir, tarihe göre
   sırala).
3. panel.js içinde bu projeksiyonu tüketen kart fonksiyonlarını
   (p4ProvenanceCardHTMLP — panel.js:1240 civarı, ve d4ModuleDescriptorsP
   içindeki 'therapy-profile' modülü — panel.js:1345 civarı) güncelle:
   eğer bugünkü thoughtCount 0 ama lastRecordedDate doluysa, "Bugün kayıt
   yok · son kayıt N gün önce (<tarih>)" gibi Türkçe, net bir metin göster
   — sanki "hiç yapılmamış" gibi değil, "bugün yapılmamış ama geçmişte
   var" anlamını taşısın. Eğer lastRecordedDate de null ise (gerçekten
   hiç yapılmamışsa) mevcut "missing" davranışı aynen kalsın.

Kısıtlar: therapyProjection'ın imzasını (parametrelerini) değiştirme,
yalnız dönüş objesine alan ekle — bu fonksiyonu çağıran başka yerler
kırılmamalı. Ham terapi düşünce metnini/hassas içeriği hâlâ projeksiyona
sızdırma (yalnız tarih/sayı meta verisi ekleniyor, bu CLAUDE.md'deki
"hassas metin/ham yanıt panele taşınmaz" kuralına uymalı).

Doğrulama:
- node --check panelCoverageManifest.js panel.js
- node tests/test_panel_p4_provenance.js
- Yeni bir assertion ekle: "3 gün önce terapi kaydı var, bugün yok ->
  panel kartı 'son kayıt 3 gün önce' içerir, 'missing' değil" ve "hiç
  terapi kaydı yok -> mevcut missing davranışı korunuyor" senaryolarını
  kapsayacak şekilde.

Kabul kriterleri: Tüm testler PASS; hassas terapi metni projeksiyona
sızmadığını doğrulayan mevcut redaction testleri (varsa) hâlâ PASS.
```

---

## Faz 2 — Kartlara tazelik/provenance göstergesi

### Prompt 2.1 — Ortak "eskime rozeti" (staleness badge) helper'ı ekle ve tüm kartlara uygula

```
Bağlam: /Users/m_ras/Desktop/seyma reposunda panel.js dosyasında, dailyPhoto
dışında hiçbir modül kartında "bu veri ne kadar eski" göstergesi yok.
roomContentHistory, saygiRoot, locNudge, locationTiming,
notificationTimeline, externalSources kartları p3TimeP/d4SafeTimeP
fonksiyonlarıyla (panel.js:1202 ve panel.js:1325 civarı) ham tarihi
yazdırıyor ama üç haftalık veri ile bir dakikalık veri aynı görsel tonda
gösteriliyor — yoğun rozet/KPI grid'i içinde fark edilmesi neredeyse
imkansız.

Görev:
1. panel.js'e yeni bir paylaşılan fonksiyon ekle: stalenessBadgeP(iso).
   Girdi: ISO tarih string'i veya null/undefined. Çıktı: HTML string
   (mevcut p3BadgeP/p3StatusP fonksiyonlarının döndürdüğü badge/span
   deseniyle tutarlı — panel.js içindeki mevcut badge fonksiyonlarına
   bakıp aynı class/data-component konvansiyonunu kullan). Mantık:
     - null/geçersiz tarih -> muted/dim "veri yok" rozeti (mevcut 'b-dim'
       tonuyla tutarlı)
     - <= 24 saat -> yeşil "güncel" rozeti ('b-ok' tonuyla)
     - 1-7 gün -> sarı "N gün önce" rozeti ('b-warn' tonuyla)
     - > 7 gün -> kırmızı "eski · N gün önce" rozeti ('b-danger' tonuyla)
   Eşikleri panel.js'in başındaki (ilk ~150 satır) diğer sabit tanımlarına
   bakıp varsa mevcut bir eşik deseniyle hizala; yoksa makul sabitler
   olarak adlandırılmış (örn. STALE_WARN_DAYS=1, STALE_DANGER_DAYS=7)
   şekilde tanımla, sihirli sayı bırakma.
2. Bu fonksiyonu şu kartlara uygula (her birinde ilgili "son
   güncellenme"/"örnek"/"fetched" tarih alanını bul ve yanına
   stalenessBadgeP(...) çıktısını ekle):
   - roomContentHistory kartı (rootModulesCardHTMLP içinde, panel.js:1210
     civarı)
   - saygiRoot kartı (aynı fonksiyon içinde)
   - locNudge / locationTiming kartı (panel.js:1231 civarındaki
     "Konum zaman ayrımı" p3-module bloğu — zaten p3TimeP çağrıları var,
     yanlarına badge ekle)
   - notificationTimeline kartı (p4ProvenanceCardHTMLP içinde)
   - externalSources kartı (aynı fonksiyon içinde)
3. dailyPhoto kartının MEVCUT stale mantığını BOZMA — istersen onu da bu
   ortak helper'a geçirebilirsin ama davranışı (eşikleri) aynı kalsın,
   ya da dokunmadan bırak, tercih sana ait; öncelik yeni kartlara
   uygulamak.

Kısıtlar: Kart layout'unu/DOM yapısını büyük ölçüde değiştirme, yalnız
mevcut tarih gösterimlerinin yanına küçük bir rozet ekle. panel.css'te
yeni class'lar gerekiyorsa (örn. .staleness-badge-*), panel.css'teki
mevcut badge stillerinin (örn. .status-badge, .p3-badge) yanına, aynı
isimlendirme/boyut/tipografi konvansiyonuyla ekle — hem light hem dark
tema (#root[data-theme="dark"] bloğu) için tanımla.

Doğrulama:
- node --check panel.js
- node tests/test_panel_p3_root_modules.js
- node tests/test_panel_p4_provenance.js
- node tests/test_panel_p1_projection.js
- Yeni stalenessBadgeP fonksiyonu için üç senaryoyu (güncel/birkaç gün/
  eski/veri yok) kapsayan yeni assertion'lar ekle (mevcut extractFunction
  + vm.runInNewContext test desenini kullanarak, tests/ altında uygun bir
  dosyaya veya yeni tests/test_panel_staleness_badge.js dosyasına).
- Mevcut PANEL-014/PANEL-12 responsive/a11y test dosyasını da çalıştır
  (tests/test_panel_p5_responsive_a11y.js) — yeni class'ların CSS
  karşılığı olmadan render edilmediğini teyit için.

Kabul kriterleri: Tüm testler PASS; yeni rozet hem light hem dark temada
panel.css'te tanımlı; hiçbir mevcut test kırılmamalı.
```

### Prompt 2.2 — Boş durum metinlerini "neden boş" ayrımıyla üç kategoriye ayır

```
Bağlam: /Users/m_ras/Desktop/seyma reposunda panel.js dosyasında çoğu kart,
veri yokken tek satır muted metin gösteriyor — örn. "Gösterim kaydı yok",
"İzinli ayar özeti yok" gibi (rootModulesCardHTMLP ve p4ProvenanceCardHTMLP
fonksiyonları içinde, panel.js:1210-1269 aralığı). Bu metinler ÜÇ farklı
kök sebebi ("hiç kullanılmadı", "senkron/ağ hatası bekleniyor", "izin
kapalı/redacted") ayırt etmeden aynı cümleyle geçiştiriyor — gözlemci
hangisi olduğunu anlayamıyor.

Görev:
1. panel.js içinde rootModulesCardHTMLP ve p4ProvenanceCardHTMLP
   fonksiyonlarındaki (panel.js:1210-1269 aralığı) her "boş durum" satırını
   bul (genelde status==='missing' koşuluyla eşleşen kısa metinler).
2. Her biri için, kaynak projeksiyonun (PROJECTION_SECTIONS.<modül>) zaten
   taşıdığı status/reason bilgisine bakarak (bu proje zaten
   panelCoverageManifest.js'te 'missing'/'malformed'/'ok' gibi status
   kodları üretiyor — chooseProjection fonksiyonundaki reason kodlarına da
   bak: projection_missing, projection_invalid, receipt_missing,
   projection_stale, projection_load_failed, projection_unavailable)
   metni üç kategoriden birine ayır:
   a) "Hiç kullanılmadı" — kullanıcı bu özelliği hiç kullanmamış (status
      missing AMA herhangi bir fetch/sync hatası yok)
   b) "Senkron bekleniyor" — veri var olabilir ama henüz senkron/fetch
      tamamlanmamış (örn. Faz 1.1'de eklenen section_fetch_failed durumu,
      ya da receipt_missing/projection_stale reason'ları)
   c) "Hata" — projection_invalid/projection_load_failed gibi net bir hata
      durumu
   Her kategori için ayrı, kısa, Türkçe, panelin mevcut üslubuna uygun bir
   metin yaz (örn. mevcut "Uzak kabul receipt'i olmadan projection
   başarıya yükseltilmedi" gibi cümlelerin tonunu örnek al).
3. Bu ayrımı yapan küçük bir paylaşılan helper fonksiyon yaz (örn.
   emptyStateReasonP(sectionState) -> {kind:'unused'|'pending'|'error',
   text:'...'}), kod tekrarını önlemek için — birden fazla kart bunu
   çağırsın.

Kısıtlar: Mevcut status kodu sözleşmesini (missing/malformed/ok/stale)
değiştirme, yalnız BUNLARDAN türeyen görüntü metnini zenginleştir. Ham
veri/hata mesajı sızdırma — yalnız önceden tanımlı, güvenli, sabit Türkçe
metinler kullan (CLAUDE.md'deki redaction kurallarına uy).

Doğrulama:
- node --check panel.js
- node tests/test_panel_p3_root_modules.js
- node tests/test_panel_p4_provenance.js
- Üç kategoriden her biri için ayrı bir senaryo/assertion ekle: "hiç
  kullanılmamış modül -> 'unused' metni", "section_fetch_failed durumunda
  -> 'pending' metni", "projection_invalid durumunda -> 'error' metni".

Kabul kriterleri: Tüm testler PASS; üç kategori metni birbirinden farklı
ve doğru duruma eşleniyor.
```

### Prompt 2.3 — Ağrı/rahatsızlık haritası için 30 günlük bölge/trend özeti kartı ekle

```
Bağlam: /Users/m_ras/Desktop/seyma reposunda app.js'in getDay fonksiyonu
(app.js:~1876-1887 civarı) her günün discomfort.regions (vücut haritası
ağrı bölgeleri) ve discomfort.meds (ağrı kesici alınıp alınmadığı)
verisini kalıcı olarak data.days.<date>.discomfort altında tutuyor. Ancak
panel.js'te bu veri yalnız SEÇİLİ günün anlık durumu için gösteriliyor
(panel.js:3661-3670 civarındaki dzRegs değişkeni) ve 30 günlük "ağrı
kesici alınan gün sayısı" tekil bir sayaç olarak var (panel.js:3017
civarı) — ama hangi vücut bölgelerinin ne sıklıkla işaretlendiğine dair
geçmişe dönük bir trend/özet kartı YOK. Kullanıcı geçmiş günlerdeki ağrı
paternini panelde hiç göremiyor.

Görev:
1. panel.js içinde D (ana data objesi) üzerinden son 30 günün
   data.days.<date>.discomfort.regions alanlarını tarayan yeni bir helper
   fonksiyon yaz, örn. discomfortTrendP(days) -> {regionCounts:{<bölge
   anahtarı>: <kaç günde işaretlendi>}, totalDaysWithPain: <sayı>,
   topRegions: [en sık işaretlenen 3 bölge, sayılarıyla]}. app.js'teki
   emptyDiscomfort()/discomfort.regions yapısının anahtar isimlerini
   (bölge id'leri) app.js'ten grep ederek doğru kullan.
2. Bu veriyi gösteren yeni, küçük bir kart fonksiyonu yaz (örn.
   discomfortTrendCardHTMLP()) — mevcut diğer küçük kart fonksiyonlarının
   (örn. panelBodyCardHTML, panelLabCardHTML — panel.js:2897,2933 civarı)
   desenini takip et: başlık, KPI/rozet satırı (en sık 3 bölge + gün
   sayısı), veri yoksa "Son 30 günde ağrı kaydı yok" gibi net bir boş
   durum.
3. Bu yeni kartı, mevcut günlük detay/sağlık kartlarının render edildiği
   akışa ekle (render() fonksiyonu içinde, discomfort'un günlük halinin
   zaten göründüğü yerin yakınına — panel.js:3661-3670 civarını referans
   al) — mevcut kart sıralama/grid deseniyle (span-12/pad class'ları gibi)
   tutarlı ekle.

Kısıtlar: Hassas/ham ağrı notu metnini (discomfort.note) bu yeni trend
kartına TAŞIMA — yalnız bölge id'si + sayım (meta veri) göster, ham metin
yok (CLAUDE.md redaction kurallarına uy). Yeni bir grafik kütüphanesi
ekleme, mevcut basit HTML/CSS bar/rozet desenlerini kullan (örn.
d4-module-summary veya benzeri mevcut basit görsel öğeler).

Doğrulama:
- node --check panel.js
- node tests/test_panel_p3_root_modules.js (veya en yakın ilgili test
  dosyası)
- Yeni discomfortTrendP fonksiyonu için: "3 farklı günde aynı bölge
  işaretlenmiş -> topRegions doğru sayıyor", "hiç kayıt yok -> boş durum"
  senaryolarını kapsayan yeni assertion'lar ekle (yeni bir
  tests/test_panel_discomfort_trend.js dosyası açılabilir, mevcut test
  dosyalarındaki mock D/data yapısı desenini kullan).

Kabul kriterleri: Tüm testler PASS; yeni kart yalnız meta veri (bölge id +
sayı) gösteriyor, ham not metni sızdırmıyor.
```

---

## Faz 3 — Ölü kodu temizle, status-badge mantığını birleştir

### Prompt 3.1 — Ölü kodu sil (event drawer, statusBadgeP, yinelenen cnt())

```
Bağlam: /Users/m_ras/Desktop/seyma reposunda panel.js dosyasında, önceki
bir oturumda event log satırlarındaki onclick kaldırılarak "listeye
tıklayınca modal açılması" sorunu çözüldü, ama üç fonksiyon hâlâ dosyada
duruyor ve hiçbir yerden çağrılmıyor:
  - openEventDrawerP (panel.js:1540, window.openEventDrawerP olarak
    export edilmiş ama hiçbir onclick string'i bunu çağırmıyor)
  - closeEventDrawerP (panel.js:1545, aynı durum)
  - eventDetailsP (panel.js:1510, yalnız yukarıdaki iki fonksiyon
    tarafından tetiklenen UI.eventSelectedId durumu hiç set edilmediği
    için pratikte hiç çağrılmıyor)
Ayrıca statusBadgeP (panel.js:1185) hiçbir yerden çağrılmayan, export bile
edilmemiş tamamen ölü bir fonksiyon. Son olarak cnt(rec) fonksiyonu
panel.js:801 VE panel.js:979'da birebir aynı şekilde iki kez tanımlanmış
(ikincisi birinciyi gölgeliyor).

Görev:
1. Önce her birinin GERÇEKTEN çağrılmadığını doğrula: panel.js içinde
   grep ile openEventDrawerP(, closeEventDrawerP(, eventDetailsP(,
   statusBadgeP( aramalarını yap — yalnız kendi tanım satırları ve
   window.X= export satırları çıkmalı, başka hiçbir onclick="..." veya
   fonksiyon çağrısı olmamalı. cnt( için iki tanımın da tam olarak
   birbirinin aynısı olduğunu (veya hangisinin "doğru"/güncel olduğunu)
   doğrula.
2. openEventDrawerP, closeEventDrawerP, eventDetailsP fonksiyonlarını ve
   bunlarla birlikte YALNIZ bunlar tarafından kullanılan, başka hiçbir
   yerde referans edilmeyen yardımcı state'i (örn. UI.eventDrawerLevel,
   EVENT_DRAWER_RETURN_ID — ama bunları silmeden önce eventDrawerKeydownP
   ve setEventDrawerLevelP gibi fonksiyonların bunları KULLANIP
   kullanmadığını da kontrol et; eventDrawerFocusableP ve
   eventDrawerKeydownP D4 modül drawer'ı (openD4ModuleDrawerP/
   closeD4ModuleDrawerP) tarafından da kullanılıyor olabilir, o kısmı
   SİLME, yalnız event-drawer'a özel kısmı sil) sil.
3. statusBadgeP fonksiyonunu tamamen sil.
4. cnt(rec) fonksiyonunun panel.js:979 civarındaki (veya hangisi kod
   akışında ikinci sırada geliyorsa onun) tekrarını sil, tek bir tanım
   bırak.
5. Silme sonrası panel.js'te artık kullanılmayan hiçbir referans/import
   kalmadığını grep ile doğrula.

Kısıtlar: D4 modül drawer'ı (openD4ModuleDrawerP, closeD4ModuleDrawerP,
d4ModuleDrawerHTMLP, eventDrawerFocusableP, eventDrawerKeydownP'nin
d4SelectedModule dalı) AKTİF ve KULLANILIYOR — bunlara DOKUNMA, yalnız
event-log'a özel ölü kodu sil. Emin olmadığın herhangi bir fonksiyonu
SİLMEDEN ÖNCE grep ile çağrı sitesi ara, "muhtemelen kullanılmıyor" diye
tahmin etme.

Doğrulama:
- node --check panel.js
- node tests/test_panel_event_focus.js
- node tests/test_panel_p3_timeline_drawer.js (bu dosya D4 modül drawer'ını
  ve şu an eventDetailsP/openEventDrawerP/closeEventDrawerP'yi isimle
  yüklüyor olabilir — eğer bu fonksiyonları siliyorsan bu test dosyasının
  extractFunction çağrılarını da güncellemen GEREKİR, yoksa "fonksiyon
  bulunamadı" hatasıyla çöker; dosyayı oku, hangi assertion'ların gerçekten
  drawer'ın var olduğunu test ettiğini belirle, o assertion'ları yeni
  davranışa (drawer yok, satırlar tıklanamaz) göre güncelle, D4 modül
  drawer'ıyla ilgili assertion'ları KORU)
- node tests/test_panel_p2_event_log.js (aynı şekilde isim listesini
  kontrol et ve gerekirse güncelle)
- node tests/test_panel_p6_qa_release.js (aynı şekilde)
- node tests/test_panel_p5_responsive_a11y.js
- grep -n "openEventDrawerP\|closeEventDrawerP\|eventDetailsP\|statusBadgeP" panel.js
  komutunun HİÇBİR SONUÇ döndürmediğini (tamamen silindiğini) doğrula.

Kabul kriterleri: Tüm test dosyaları PASS (gerekirse güncellenmiş
haliyle); grep hiçbir kalıntı bulmuyor; D4 modül drawer testleri hâlâ
PASS (regresyon yok).
```

### Prompt 3.2 — 6 status-badge implementasyonunu tek bir fonksiyonda birleştir

```
Bağlam: /Users/m_ras/Desktop/seyma reposunda panel.js dosyasında aynı
"durum kodu -> renk/etiket" mantığı 6+ farklı yerde ayrı ayrı yazılmış:
  - p3StatusP (panel.js:1203) — tam status->[label,class] tablosu
  - statusToneP / statusToneForCodeP (panel.js:1179-1180)
  - d2StatusBadgeP (panel.js:1136)
  - auditRollupStatusP (panel.js:1261)
  - localStatus kapatması, üç ayrı fonksiyon içinde neredeyse birebir
    tekrar: syncRibbonHTMLP (panel.js:1152), coverageRibbonHTMLP
    (panel.js:1175), eventLogCardInnerHTMLP (panel.js:1551) — aralarında
    zaten küçük farklar oluşmuş (örn. tone parametresi/map birleştirme
    sırası farklı).
(Not: statusBadgeP zaten Prompt 3.1'de silindi, varsayım bu prompt ondan
SONRA uygulanıyor.)

Görev:
1. Önce tüm bu implementasyonları oku ve her birinin ürettiği (durum kodu
   -> [Türkçe etiket, CSS class, "tone" kategorisi]) eşlemesini çıkar. Hangi
   status kodlarının (ok/ready/active/completed, stale/incomplete/pending,
   error/malformed/mismatch, missing, b-ok/b-warn/b-danger/b-gold/b-dim,
   vb.) her fonksiyonda nasıl işlendiğini karşılaştır, aralarındaki
   TUTARSIZLIKLARI (örn. bir fonksiyonda "pending" olan bir kod başka
   fonksiyonda "muted" çıkıyorsa) not al.
2. Tek bir kanonik fonksiyon yaz: panelStatusP(code) -> {label, cls, tone}
   (isimlendirmeyi mevcut en kapsamlı implementasyon olan p3StatusP'nin
   döndürdüğü şekle göre ayarla, çünkü muhtemelen en çok status kodunu
   kapsıyor). Bu fonksiyon TÜM daha önce dağınık implementasyonlarda
   bulunan status kodlarını kapsamalı — hiçbirini eksik bırakma. Tutarsız
   bulduğun eşlemeler için, mevcut testlerin (tests/test_panel_*.js)
   hangi davranışı BEKLEDİĞİNE bak ve testlerle uyumlu olanı "doğru" kabul
   et.
3. p3StatusP, statusToneP, statusToneForCodeP, d2StatusBadgeP,
   auditRollupStatusP fonksiyonlarını ve syncRibbonHTMLP/
   coverageRibbonHTMLP/eventLogCardInnerHTMLP içindeki localStatus
   kapatmalarını, kendi özel mantıklarını SİLİP yeni panelStatusP(code)'u
   ÇAĞIRACAK şekilde yeniden yaz (ince wrapper'lar haline getir — örn.
   d2StatusBadgeP hâlâ var olabilir ama içi panelStatusP'yi çağırıp
   sonucu farklı bir HTML şablonuna sarabilir, isim/imza uyumluluğunu
   koru ki bu fonksiyonları çağıran ~10+ yer kırılmasın).
4. auditRollupStatusP'nin DİĞERLERİNDEN farklı bir işi olduğunu unutma —
   o bir LİSTE durumdan TEK bir rollup durum üretiyor (öncelik sıralaması
   var: error > incomplete > ok > missing). Bu rollup mantığını SİLME,
   yalnız ürettiği TEK kodu son adımda panelStatusP'ye geçirmesini sağla.

Kısıtlar: Bu fonksiyonları çağıran YERLERİN (grep ile bul: p3StatusP(,
statusToneP(, statusToneForCodeP(, d2StatusBadgeP(, auditRollupStatusP(,
localStatus() çağrıları) imzasını/dönüş tipini DEĞİŞTİRME — yalnız iç
implementasyonu birleştir, dışarıdan davranış (özellikle render edilen
HTML) aynı kalmalı, tutarsızlık bulunan yerler HARİÇ (onlarda test
beklentisine göre "doğru" davranışı seç ve neden değiştiğini bir yorum
satırıyla not et).

Doğrulama:
- node --check panel.js
- node tests/test_panel_event_focus.js
- node tests/test_panel_p0_sync.js
- node tests/test_panel_p1_projection.js
- node tests/test_panel_p2_event_log.js
- node tests/test_panel_p2_polling.js
- node tests/test_panel_p2_sync.js
- node tests/test_panel_p3_root_modules.js
- node tests/test_panel_p3_timeline_drawer.js
- node tests/test_panel_p4_provenance.js
- node tests/test_panel_p5_responsive_a11y.js
- node tests/test_panel_p6_qa_release.js
  (bu status-badge mantığı panelin HEMEN HEMEN HER kartında kullanıldığı
  için TÜM panel test dosyalarını çalıştırmak şart — herhangi biri
  kırılırsa birleştirme sırasında bir davranış farkı kaçmış demektir,
  o test dosyasının beklediği davranışa göre panelStatusP'yi düzelt,
  testi "kolay yoldan" değiştirme).

Kabul kriterleri: TÜM yukarıdaki test dosyaları PASS; grep ile
statusToneP(, statusToneForCodeP(, ve eski localStatus kapatma
implementasyonlarının artık panelStatusP'yi çağırdığı (kendi bağımsız
mantıkları olmadığı) doğrulanmış olmalı.
```

---

## Faz 4 — Yapısal refactor (acil değil, uzun vadeli)

### Prompt 4.1 — render() fonksiyonunu ve büyük kart fonksiyonlarını "hesapla / render et" olarak ayır

```
Bağlam: /Users/m_ras/Desktop/seyma reposunda panel.js'teki render()
fonksiyonu (panel.js:2964-4033, ~1069 satır) tüm panel DOM'unu tek
fonksiyonda kuruyor — state hesaplama (hangi kart hangi durumda, hangi
badge gösterilecek) ile HTML string-building tamamen iç içe. Aynı desen
psychCardHTML (panel.js:2423-2545, ~122 satır), profileAssessmentCardHTML
(panel.js:2545-2649, ~104 satır), quranJourneyPanelCardHTML
(panel.js:592-698, ~106 satır) gibi büyük kart fonksiyonlarında da var.
Bu, küçük bir veri değişikliğinin bile 100+ satırlık bir string-builder
içinde arama yapmayı gerektirmesine yol açıyor, hata riski yüksek.

Görev (BÜYÜK, DİKKATLİ VE AŞAMALI YAPILMALI — tek seferde tüm render()'ı
değiştirme):
1. İlk aşamada YALNIZ EN BÜYÜK ve EN İZOLE fonksiyonla başla: örn.
   psychCardHTML. Bu fonksiyonu ikiye böl:
   - psychCardDataP(D) -> saf bir JS objesi döndüren, HİÇBİR HTML string'i
     içermeyen bir "hesaplama" fonksiyonu (mevcut fonksiyonun içindeki
     tüm ara değişken hesaplamalarını buraya taşı).
   - psychCardHTML(D) -> psychCardDataP(D)'yi çağırıp dönen objeden HTML
     string'i üreten, YALNIZ template/markup mantığı içeren bir fonksiyon.
   Fonksiyonun DIŞARIDAN görünen imzası (psychCardHTML(D) çağrıldığında
   aynı HTML çıktısını üretmesi) DEĞİŞMEMELİ — bu saf bir iç refactor.
2. Aynı deseni sırayla profileAssessmentCardHTML ve
   quranJourneyPanelCardHTML için de uygula.
3. Her fonksiyonu böldükten SONRA, o fonksiyonu kapsayan ilgili test
   dosyasını çalıştırıp HTML çıktısının BİREBİR aynı kaldığını doğrula
   (test dosyaları zaten HTML string'i üzerinde .includes() assertion'ları
   yapıyor — bunlar hâlâ PASS olmalı, çünkü dışa dönük davranış
   değişmiyor).
4. render() fonksiyonunun kendisine DOKUNMA — bu, ayrı ve çok daha riskli
   bir iş, bu prompt kapsamına dahil değil (istenirse ayrı bir prompt
   olarak ele alınmalı).

Kısıtlar: Bu SAF bir refactor'dür — hiçbir görünür davranış/HTML çıktısı
değişmemeli. Yeni bir soyutlama katmanı/framework getirme, yalnız mevcut
fonksiyonu ikiye böl. Her adımdan sonra mutlaka test çalıştır, testler
kırmızıya düşerse HTML çıktısı yanlışlıkla değişmiş demektir, geri al ve
düzelt.

Doğrulama (her fonksiyon bölündükten sonra ayrı ayrı):
- node --check panel.js
- psychCardHTML için: ilgili test dosyasını bul (grep -rn
  "psychCardHTML" tests/) ve çalıştır
- profileAssessmentCardHTML için: grep -rn "profileAssessmentCardHTML"
  tests/ ile ilgili dosyayı bul ve çalıştır
- quranJourneyPanelCardHTML için: grep -rn "quranJourneyPanelCardHTML"
  tests/ ile ilgili dosyayı bul ve çalıştır
- Üç fonksiyon da bölündükten sonra TÜM tests/test_panel_*.js dosyalarını
  sırayla çalıştır, hiçbiri kırılmamalı.

Kabul kriterleri: Üç fonksiyon da veri/render ayrımına kavuşmuş; TÜM panel
test dosyaları PASS; hiçbir görünür davranış değişikliği yok (yalnız iç
yapı temizlendi).
```

### Prompt 4.2 — Üç projeksiyon global'ini tek bir state objesinde birleştir

```
Bağlam: /Users/m_ras/Desktop/seyma reposunda panel.js dosyasında aynı
kavramsal "projeksiyon" verisi üç ayrı global'de tutuluyor:
OBSERVER_PROJECTION, PROJECTION_STATE, PROJECTION_SECTIONS (panel.js'in
başındaki global tanımlar bloğunda, ~satır 114-140 civarında ara). Bunlar
manuel olarak senkronize ediliyor (loadObserverProjectionP fonksiyonu,
panel.js:442 civarı). panelSig() fonksiyonu (panel.js:4595 civarı)
"herhangi bir şey değişti mi" kontrolü için 9 ayrı global'i elle
JSON.stringify ile birleştiriyor — yeni bir global eklenirse bu
fonksiyonda unutulma riski var (sessiz re-render kırılması).

Görev (RİSKLİ — geniş kapsamlı, dikkatli ilerle):
1. Önce panel.js içinde OBSERVER_PROJECTION, PROJECTION_STATE,
   PROJECTION_SECTIONS'a yapılan HER okuma ve yazma noktasını grep ile
   çıkar (üç ayrı grep -n "OBSERVER_PROJECTION\|PROJECTION_STATE\|
   PROJECTION_SECTIONS" panel.js). Her birinin hangi alanları taşıdığını
   (örn. PROJECTION_STATE.reason, PROJECTION_STATE.data,
   PROJECTION_STATE.snapshot) belgele.
2. Tek bir birleşik state objesi tasarla, örn.:
   PROJECTION = { snapshot: <eski OBSERVER_PROJECTION>,
                  state: <eski PROJECTION_STATE, .data/.snapshot hariç>,
                  sections: <eski PROJECTION_SECTIONS> }
   Alan isimlerini üstteki grep sonuçlarına göre ayarla, veri kaybı
   olmayacak şekilde bire bir taşı.
3. Üç eski global'i kullanan HER satırı yeni PROJECTION.* yoluna göre
   güncelle — bunu yaparken adım adım ilerle: önce yalnız
   OBSERVER_PROJECTION'ı PROJECTION.snapshot'a taşı, testleri çalıştır,
   sonra PROJECTION_STATE'i taşı, testleri çalıştır, sonra
   PROJECTION_SECTIONS'ı taşı, testleri tekrar çalıştır. Her adımda
   TÜM çağrı sitelerini güncellediğinden emin ol (grep ile eski isim
   kalmadığını doğrula).
4. panelSig() fonksiyonunu (panel.js:4595) güncelle: artık 9 ayrı
   global'i elle birleştirmek yerine tek PROJECTION objesini (ve varsa
   ilgili diğer state'i) JSON.stringify ile imzala — gelecekte
   PROJECTION objesine yeni bir alan eklenirse panelSig()'in otomatik
   yakalaması sağlanmalı.
5. Faz 1.1'de eklenen SECTION_FETCH_STATE (veya benzeri) global'i varsa,
   onu da bu birleşik PROJECTION objesinin bir alt alanı yap.

Kısıtlar: Bu değişiklik panel.js'in NEREDEYSE HER YERİNİ etkiler — mutlaka
küçük, test edilebilir adımlara böl (global başına bir adım). Tek seferde
üçünü birden taşımaya ÇALIŞMA, bir hata olursa hangi taşımanın sorun
çıkardığını ayırt edemezsin. Her adımdan sonra `git diff --stat` ile
değişikliğin kapsamını kontrol et ve TÜM panel testlerini çalıştır.

Doğrulama (HER adımdan sonra tekrarla):
- node --check panel.js
- grep -n "OBSERVER_PROJECTION\b" panel.js (taşındıkça azalmalı, sonunda
  yalnız yeni PROJECTION.snapshot tanımında/yorum satırında kalmalı)
- TÜM tests/test_panel_*.js dosyalarını sırayla çalıştır (test_panel_p0_
  sync, p1_projection, p2_event_log, p2_polling, p2_sync, p3_root_modules,
  p3_timeline_drawer, p4_provenance, p5_responsive_a11y, p6_qa_release,
  event_focus)
- node .claude/skills/run-seyma/ altındaki panel'i etkileyen fixture'lar
  varsa onları da çalıştır (SKILL.md'ye bak)

Kabul kriterleri: Her adımdan sonra TÜM testler PASS; final durumda grep
ile eski üç global isminin (tanım satırı hariç) hiçbir çağrı sitesinde
kalmadığı doğrulanmış olmalı; panelSig() artık tek bir PROJECTION
objesinden türetiliyor.
```

---

## Uygulama Sırası Özeti

| Sıra | Prompt | Öncelik | Bağımlılık |
|------|--------|---------|------------|
| 1 | 1.1 — Yan-kanal fetch hatası | Kritik | Yok |
| 2 | 1.2 — Terapi/Konum stale durumu | Kritik | Yok |
| 3 | 1.3 — Terapi geçmiş kaydı | Yüksek | 1.2 ile aynı dosyayı etkiler, sırayla yap |
| 4 | 2.1 — Staleness badge helper | Orta-Yüksek | 1.2'den sonra yapılırsa stale durumunu da gösterebilir |
| 5 | 2.2 — Boş durum kategorileri | Orta | 1.1'de eklenen section_fetch_failed durumunu kullanır |
| 6 | 2.3 — Ağrı/rahatsızlık trend kartı | Orta | Yok |
| 7 | 3.1 — Ölü kod temizliği | Düşük efor | Yok, ama 3.2'den ÖNCE yapılmalı |
| 8 | 3.2 — Status-badge birleştirme | Orta efor | 3.1'den sonra |
| 9 | 4.1 — render() ayrıştırma | Yüksek efor | Faz 1-3 stabil olduktan sonra |
| 10 | 4.2 — Global state birleştirme | Yüksek efor, riskli | Faz 1-3 stabil olduktan sonra, 4.1'den bağımsız |

Her prompt'tan sonra ayrı commit at, böylece bir adımda sorun çıkarsa yalnız
o adımı geri almak mümkün olur.
