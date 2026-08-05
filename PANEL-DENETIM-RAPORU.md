# ÆON Panel — Veri Akışı & Kod Denetim Raporu

> Kapsam: `panel.html`, `panel.js`, `panel.css`, `panelCoverageManifest.js`.
> Yöntem: uçtan uca veri akışı (fetch → projection → render), görüntüleme/kapsam
> boşlukları ve kod karmaşıklığı üç ayrı odakla incelendi. Bulgular dosya:satır
> referanslarıyla verilmiştir. Bu rapor **salt analiz ve aksiyon planıdır** —
> henüz hiçbir kod değişikliği uygulanmamıştır.
>
> Tarih: 2026-08-05

---

## Özet

Panel savunmacı yazılmış: neredeyse her kartta bir "veri yok" durumu tanımlı,
sert çökme riski düşük. Asıl risk üç katmanda toplanıyor:

- **(A) Veri akışında sessiz kayıp** — gerçek veri sağlıklı geldiği halde bazı
  kartların "veri yok" göstermesine yol açan bir fetch-hata karışıklığı var.
- **(B) Kartların "eski/boş" ayrımını gösterememesi** — kullanıcı için veri
  akışı "bozuk" hissi yaratan asıl sebep muhtemelen bu.
- **(C) Kod tekrarı ve karmaşıklık** — şu an görünür bir hataya yol açmıyor
  ama gelecekteki değişiklikleri kırılgan hale getiriyor.

**En yüksek etkili tek düzeltme:** madde A1 (yan-kanal fetch hatasının 9
kartı sessizce boşaltması). Kullanıcının "panelde bir şey görünmüyor"
şikâyetinin en olası kök nedeni budur.

---

## A) Veri akışında kritik / sessiz sorunlar

### A1 — Yan-kanal fetch hatası tüm modülleri sessizce boşaltıyor (KRİTİK)

**Konum:** `panel.js:4548-4581`

```
Promise.all([loadInbox, loadDeliveryP, loadSyncReceiptP,
             loadObserverProjectionP, loadEventLogP])
```

Bu beşliden **herhangi biri** başarısız olursa (örn. yalnızca
`data/observer-inbox.json` GitHub API'de geçici 500/timeout verirse), ortak
`.catch` bloğu `PROJECTION_SECTIONS={}` yaparak **tüm projeksiyonu resetliyor**
— halbuki ana `data/latest.json` (`latestLegacy`) verisi gayet sağlıklı gelmiş
olabilir.

**Etkilenen 9 kart:** günün fotoğrafı, Terapi Odası geçmişi, Saygı kökü,
konum nudge, terapi provenance, profil ilerleme, bildirim zaman çizelgesi,
dış kaynaklar, konum zaman ayrımı — hepsi "missing" durumuna düşer, ve
kullanıcıya bunun "gerçekten veri yok" mu yoksa "geçici ağ hatası" mı
olduğunu ayırt eden **hiçbir uyarı çıkmaz**.

**Neden önemli:** Bu senaryo "gerçek veri kaybı" değil ama gözlemci
tarafında öyle görünüyor — ve panelin en çok şikâyet edilen davranışı
("bir şey görünmüyor") büyük ihtimalle bu.

### A2 — Terapi ve Konum modülleri "eski veri" (stale) durumunu hiç gösteremiyor

**Konum:** `panelCoverageManifest.js:315-335`, `panel.js:1339,1341`

`dailyPhoto` gibi modüllerde açık bir "stale" bayrağı var, ama Terapi+Profil
ve Konum Audit modüllerinde bu dal yok — yalnızca `missing` / `malformed` /
`ok` dönebiliyorlar. Sonuç: 2 hafta önceki bir terapi kaydı da "ok" gösterilir,
hiç kayıt yoksa da "missing" — ikisi arasında görsel/durumsal fark yok.

### A3 — Terapi kartı yalnızca "bugün"e bakıyor, geçmişi görmezden geliyor

**Konum:** `panelCoverageManifest.js:315-317`

`therapyProjection(source,date)` yalnız seçili günün
`data.days.<date>.therapy` alanını okuyor. Dün terapi yapılmış, bugün
yapılmamışsa kart "0 düşünce özeti / missing" gösterir — gözlemciye "hiç
yapılmamış" izlenimi verir, oysa geçmişte kayıt var.

### A4 — dailyPhoto dışında hiçbir kartta "ne zaman güncellendi" göstergesi yok

`roomContentHistory`, `saygiRoot`, `locNudge`, `locationTiming`,
`notificationTimeline`, `externalSources` — hepsi ham tarihi yazdırıyor
(`p3TimeP`/`d4SafeTimeP`, `panel.js:1202,1325`) ama üç haftalık veri ile bir
dakikalık veri **aynı görsel tonda**. Yoğun rozet/KPI grid'i içinde bu farkı
fark etmek neredeyse imkânsız.

---

## B) Görüntüleme / kapsam boşlukları

### B1 — Boş durum metinleri var ama "neden boş" ayrımı yok

Çoğu kart `"Gösterim kaydı yok"` gibi tek satır muted metinle geçiştiriyor.
Üç farklı kök sebep ("hiç kullanılmadı", "senkron/ağ hatası", "izin kapalı")
aynı tek cümleyle karşılanıyor — gözlemci hangisi olduğunu ayırt edemiyor.

### B2 — Ağrı/rahatsızlık haritası yalnız seçili gün için gösteriliyor

**Konum:** `panel.js:3661-3670` (`dzRegs`), 30 günlük "ağrı kesici gün"
sayacı `panel.js:3017`

`app.js` her günün `discomfort.regions` verisini kalıcı tutuyor
(`getDay`, `app.js:~1887`), ama panelde geçmişe dönük bölge/trend kartı yok
— yalnızca seçili günün anlık durumu görünüyor.

### B3 — Diğer üst seviye alanlar kapsam dışı değil (iyi haber)

`settings, cycle, library, watchlist, music, luna, aeon,
motivationProgramV2, profileAssessment, saygi, zikr, soulArchive,
notifications, quranJourney` — hepsinin panelde karşılığı var, ek çalışma
gerektirmiyor.

---

## C) Kod karmaşıklığı / bakım riski

### C1 — Aynı "status → renk/etiket" mantığı 6+ yerde ayrı ayrı yazılmış

- `p3StatusP` — `panel.js:1203`
- `statusBadgeP` — `panel.js:1185` (**hiçbir yerden çağrılmıyor — ölü kod**)
- `statusToneP` / `statusToneForCodeP` — `panel.js:1179-1180`
- `d2StatusBadgeP` — `panel.js:1136`
- `auditRollupStatusP` — `panel.js:1261`
- `localStatus` kapatması — üç ayrı fonksiyonda neredeyse birebir tekrar:
  `panel.js:1152` (`syncRibbonHTMLP`), `panel.js:1175` (`coverageRibbonHTMLP`),
  `panel.js:1551` (`eventLogCardInnerHTMLP`) — aralarında zaten küçük
  farklar oluşmuş (drift başlamış).

**Risk:** yeni bir durum kodu eklendiğinde 6 yerden birini güncellemeyi
unutursan rozet rengi/etiketi tutarsız çıkar.

### C2 — Ölü kod: event log "drawer" (modal) fonksiyonları

`openEventDrawerP` (`panel.js:1540`), `closeEventDrawerP` (`panel.js:1545`),
`eventDetailsP` (`panel.js:1510`) — önceki oturumda "listeye tıklayınca
saçma bir ekran açılıyor" şikâyeti çözülürken satırdaki `onclick` kaldırıldı,
ama bu üç fonksiyon hâlâ dosyada duruyor, hiçbir yerden çağrılmıyor. Zararsız
ama kod okuyan biri için kafa karıştırıcı.

### C3 — `cnt(rec)` fonksiyonu iki kez, birebir aynı şekilde tanımlanmış

**Konum:** `panel.js:801` ve `panel.js:979`

İkinci tanım birinciyi gölgeliyor; biri güncellenip diğeri unutulursa habit
sayım mantığı hangi tanımın parse sırasında etkin olduğuna bağlı olarak
sessizce ayrışabilir.

### C4 — `render()` fonksiyonu ~1069 satır, hesaplama+HTML iç içe

**Konum:** `panel.js:2964-4033`

Tüm panel DOM'unu tek fonksiyonda kuruyor; state hesaplama ile HTML
string-building ayrılmamış. `d4ModuleDescriptorsP` (`panel.js:1334-1353`)
gibi fonksiyonlarda 3-4 katmanlı iç içe ternary'ler var (örn. satır
1338-1339) — okunması ve güvenle değiştirilmesi zor.

### C5 — Aynı "projeksiyon" verisi 3 ayrı global'de tutuluyor

`OBSERVER_PROJECTION`, `PROJECTION_STATE`, `PROJECTION_SECTIONS` —
kavramsal olarak aynı şeyi tanımlıyorlar ama manuel senkronizasyon
gerektiriyorlar. `panelSig()` (`panel.js:4595`) değişiklik algılamak için 9
ayrı global'i elle `JSON.stringify` ile birleştiriyor — yeni bir global
eklenirse bu fonksiyonda unutulma riski yüksek (sessiz re-render kırılması).

---

## Öncelikli Aksiyon Planı

### Faz 1 — Sessiz veri kaybını durdur
*(en yüksek etki, düşük–orta efor — kullanıcının asıl şikâyetini hedefler)*

- [ ] `panel.js:4572-4581`: yan-kanal fetch hatasını ana veri hatasından
      ayır. `PROJECTION_SECTIONS={}` ile resetlemek yerine kendi
      `reason:'section_fetch_failed'` durumunu taşı; eski
      `PROJECTION_SECTIONS` verisini **koru** (üzerine yazma); sync
      ribbon'da ayrı, geçici bir uyarı göster ("bazı modüller geçici
      olarak yüklenemedi, otomatik yeniden denenecek").
- [ ] Terapi ve Konum modüllerine `stale` durumu ekle
      (`panelCoverageManifest.js`), `dailyPhoto`'daki desene göre.
- [ ] Terapi kartına "son kayıt: N gün önce" bilgisi ekle — yalnız
      "bugün var/yok" yerine geçmişe bak.

### Faz 2 — Kartlara tazelik/provenance göstergesi
*(orta efor, yüksek gözlemci-güveni etkisi)*

- [ ] Ortak bir `stalenessBadgeP(timestamp)` helper'ı yaz (yeşil=güncel,
      sarı=birkaç gün, kırmızı=eski/yok), tüm modül kartlarına uygula.
- [ ] Boş durum metinlerini üç kategoriye ayır: "hiç kullanılmadı",
      "senkron bekleniyor", "hata" — B1'i çözer.
- [ ] Ağrı/rahatsızlık haritası için 30 günlük bölge/trend özeti ekle
      (B2).

### Faz 3 — Ölü kodu temizle, status-badge mantığını birleştir
*(düşük efor, yüksek okunabilirlik kazancı)*

- [ ] `statusBadgeP`, `openEventDrawerP`/`closeEventDrawerP`/
      `eventDetailsP`, ikinci `cnt()` tanımını sil.
- [ ] 6 status-mapping implementasyonunu tek bir `panelStatusP(code)`
      fonksiyonunda birleştir; diğerlerini bunu çağıracak şekilde
      inceltip kaldır.

### Faz 4 — Yapısal refactor
*(yüksek efor, uzun vadeli bakım kazancı — acil değil)*

- [ ] `render()` ve büyük kart fonksiyonlarını "veri hesapla" / "HTML
      üret" olarak ikiye ayır.
- [ ] 3 projeksiyon global'ini (`OBSERVER_PROJECTION`,
      `PROJECTION_STATE`, `PROJECTION_SECTIONS`) tek bir state objesine
      indir; `panelSig()`'i bu tek objeden türet.

---

## Doğrulama Notu

Bu bulgular yalnızca statik kod okumasıyla elde edildi (canlı fetch/network
denenmedi — `CLAUDE.md` veri güvenliği kuralları gereği panel gerçek
localStorage/token ile bir tarayıcıda açılmadı). Faz 1-2 uygulanırken
`.claude/skills/run-seyma/` altındaki headless harness'lar ve
`tests/test_panel_p0_sync.js` / `test_panel_p1_projection.js` gibi mevcut
fixture'lar; yeni "section_fetch_failed" durumu için de benzer bir headless
fixture eklenerek doğrulanmalıdır.
