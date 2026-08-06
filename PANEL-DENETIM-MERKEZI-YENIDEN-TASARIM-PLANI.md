# Denetim Merkezi → Yeniden Tasarım Planı

**Durum:** Taslak — onay bekliyor, henüz kod değişikliği yapılmadı.
**Kapsam:** `panel.html` / `panel.js` / `panelCoverageManifest.js` / `panel.css` — yalnızca ÆON gözlemci panelini kapsar, `app.js` (Şeyma uygulamasının kendisi) etkilenmez.
**Tetikleyici:** Gözlemci ("Denetim Merkezi" ekranını kullanan kişi) ekran görüntüsü paylaşıp "bunun gerçekten bir faydasını göremiyorum" dedi; ardından "bu yığını komple kaldır, radikal ol" talimatı verildi.

> Bu dosya, [PANEL-DENETIM-MERKEZI-PROMPTLARI.md](PANEL-DENETIM-MERKEZI-PROMPTLARI.md)
> (uygulama adımları, her biri bağımsız çalıştırılabilir prompt olarak) ve
> [PANEL-DENETIM-MERKEZI-LEDGER.md](PANEL-DENETIM-MERKEZI-LEDGER.md)
> (ilerleme kaydı, anti-amnezi protokolü) ile birlikte üçlü, birbirini
> denetleyen bir sistem oluşturur. Kod değişikliğine başlamadan önce
> ledger'ın §0 protokolünü izle.

---

## 1. TL;DR

Panelde aynı ham veri **üç kez** gösteriliyor (dashboard'daki özet kart + tam ekran 4 sekmeli sayfa + dashboard'daki bağımsız event log kartı) ve bu verinin tamamı **mühendislik/QA amaçlı** (projection kaynağı, staleness rozeti, redaction sınıfı) — gözlemcinin "bugün kime/neye bakmalıyım" sorusuna cevap vermiyor. Buna karşın bu soruya cevap veren veri (`risk()`, mood dağılımı, SOS sayısı, eksik gün sayısı, uyku/su/enerji trendi) **zaten hesaplanıyor** ama tek satırlık bir rozete sıkıştırılmış durumda.

**Karar:** Audit/provenance yüzeyini birincil UI'dan tamamen kaldır → gizli bir "Geliştirici modu"na taşı. Boşalan yere, zaten var olan sinyallerden üretilen **"Bugün Ne Yapmalıyım"** özet kartı ve **"Bu hafta değişenler"** süzülmüş listesi koy.

---

## 2. Sorun teşhisi (kanıtlı)

### 2.1 Üçlü tekrar

| Yüzey | Fonksiyon | Nerede görünür |
|---|---|---|
| Özet kart | `auditEntryHTMLP()` — [panel.js:1393](panel.js#L1393) | Dashboard'da her zaman, `order:6` |
| Tam sayfa, 4 sekme | `auditPageHTMLP()` — [panel.js:1446](panel.js#L1446) | "Ayrıntılı denetim yüzeyini aç" butonuyla açılır (ekran görüntüsündeki sayfa) |
| ↳ sekme: Eksik Kök Modüller | `rootModulesCardHTMLP()` — [panel.js:1322](panel.js#L1322) | |
| ↳ sekme: Terapi·Bildirim·Provenance | `p4ProvenanceCardHTMLP()` — [panel.js:1362](panel.js#L1362) | |
| ↳ sekme: Eksik ve Özet Modüller | `d4ModuleAtlasHTMLP()` — [panel.js:1514](panel.js#L1514) | |
| ↳ sekme: Event Günlüğü | `eventLogCardHTMLP()` (yeniden kullanılıyor) | |
| Bağımsız event log kartı | `eventLogCardHTMLP()` — [panel.js:1683](panel.js#L1683) | Dashboard'da **ayrıca**, `order:8` — sekme içindekiyle birebir aynı veri kaynağı |

`render()` içinde ikisi de aynı anda basılıyor ([panel.js:3218-3219](panel.js#L3218-L3219)):
```js
h+=auditEntryHTMLP();
h+=eventLogCardHTMLP();
```

### 2.2 İçerik gerçekten mühendislik amaçlı, insan amaçlı değil

`PROJECTION.sections.*` üzerinden gösterilenler: `canonical projection` kaynak rozeti, `staleness` (eski/güncel) rozeti, `provenance` sınıfı (`user_input`/`derived`/`external`/`delivery`/`observer`/`redacted`), "hangi cihazdan geldi", "raw responses: redacted" notları. Bunların hepsi **panelin kendisinin doğru veri gösterdiğini kanıtlamak** için var (bkz. `emptyStateReasonP()` — [panel.js:1292](panel.js#L1292): "senkron bekleniyor" / "kaynak hatası" / "hiç kullanılmamış" ayrımı). Gerçek kullanım senaryosuyla (birini merak eden, destek olmak isteyen ikinci kişi) ilgisi yok.

Ekran görüntüsündeki sayının kanıtı: **132 kayıttan 129'u "Kullanıcı kayıtları"** (rutin gün kaydı), gerçek sinyal taşıyan kategoriler (Terapi & profil: 2, İletişim: 0, Dış kaynak: 0) neredeyse boş → sinyal/gürültü oranı çok düşük.

### 2.3 Gerçek sinyal zaten var, sadece ön planda değil

`render()` içinde her yenilemede hesaplanan ama şu an tek satırlık bir rozete (`commandRiskHTMLP`) sıkıştırılan veriler:

| Veri | Nereden geliyor | Satır |
|---|---|---|
| Risk skoru (düşük/orta/yakın takip) | `risk(cur, saved)` | [panel.js:1724](panel.js#L1724) |
| Ruh hali dağılımı (zorlandım/çok zorlandım günleri) | `moodDist` (render içinde) | [panel.js:3134](panel.js#L3134) |
| SOS satırları | `sosRows` | [panel.js:3137](panel.js#L3137) |
| Eksik gün sayısı | `missingDays(cur)` | [panel.js:1799](panel.js#L1799) |
| Uyku/su/enerji trendi (bu dönem vs önceki) | `curSleep/prevSleep`, `curWater/prevWater`, `curEnergy/prevEnergy` | [panel.js:3126-3132](panel.js#L3126-L3132) |
| Aktif seri / en iyi seri | `currentStreak()`, `bestStreak()` | [panel.js:1088](panel.js#L1088) |
| Terapi son kayıt / kaç gün önce | `therapyRecencyTextP(th)` | [panel.js:1357](panel.js#L1357) |

Bu tablodaki her şey **zaten kod içinde var** — yeni bir veri modeli, yeni bir sync alanı, yeni bir migration gerekmiyor. Sadece bugüne kadar bir "özet kart"a değil, tek satırlık bir risk rozetine dönüştürülmüş.

---

## 3. Hedefler / Hedef olmayanlar

**Hedefler:**
- Gözlemci panele girdiğinde 5 saniye içinde "bugün endişelenmem gereken bir şey var mı" sorusuna cevap alsın.
- Üçlü tekrarı teke indir.
- Mevcut mühendislik/provenance değerini (panelin kendi hatasını yakalama) **kaybetme**, sadece birincil konumdan kaldır.
- Veri modelinde/sync'te/migration'da hiçbir değişiklik yapma — yalnızca panel.js'in render/sunum katmanı değişsin.

**Hedef olmayanlar:**
- `app.js` tarafında hiçbir değişiklik yok (bu apparatus tamamen panel'e özel).
- Yeni bir persisted veri alanı eklemek yok — "Bugün Ne Yapmalıyım" ve "Bu hafta değişenler" tamamen **türetilmiş** (mevcut `data`/`PROJECTION` üzerinden render-time hesaplanan), `data` objesine yeni alan yazmıyor.
- `sync.js`'e dokunmuyoruz.

---

## 4. Karar: Kaldırılacaklar

Birincil (her zaman görünen) UI'dan tamamen çıkar:

- `auditEntryHTMLP()` çağrısı — [panel.js:3218](panel.js#L3218)
- `eventLogCardHTMLP()` çağrısı — [panel.js:3219](panel.js#L3219)
- `auditPageHTMLP()`, `auditPaneHTMLP()`, `setAuditTab()`, `toggleAuditPage()`, `auditTabDescriptionP()` — [panel.js:1411-1464](panel.js#L1411-L1464) (tam sayfa + sekme routing'i)
- `rootModulesCardHTMLP()`, `p4ProvenanceCardHTMLP()`, `d4ModuleAtlasHTMLP()`, `d4ModuleDrawerHTMLP()`, `auditRollupStatusP()` — bu render fonksiyonlarının **HTML üretim kısmı** kaldırılır (ama bkz. §5 — altındaki veri okuma kısmı korunur, dev moduna taşınır)
- `panel.css`'teki yalnızca bu yüzeye özel sınıflar: `.audit-*`, `.p3-*`, `.p4-*`, `.d4-*`, `.event-log-*` (yaklaşık 168 satır — dev-mode'a taşınanlar hariç silinir)
- `panel.html`'de bu sayfaya dair nav/route referansı varsa kaldırılır

**Kesinlikle dokunulmayacaklar** (audit apparatus'un *veri* tarafı, sadece *sunumu* kaldırılıyor):
- `panelCoverageManifest.js` — manifest/redaction mantığı aynen kalır (dev modu bunu kullanacak)
- `buildEventLogStateP()`, `loadEventLogP()`, `eventLogSourceP()`, `refreshEventLogP()` — event log'un veri katmanı (dev modu bunu kullanacak)
- `d4ModuleDescriptorsP()` — ham veri okuma (dev modu bunu kullanacak)

---

## 5. Karar: Korunacaklar — gizli "Geliştirici / Ham Veri" modu

Audit apparatus'un mühendislik değeri gerçek (panelin kendi hatasını/eski veriyi/bozuk projection'ı fark etme). Silmek yerine:

- Dashboard'da hiçbir zaman görünmeyen, yalnızca **ÆON logosuna 5 kez art arda dokunma** (veya `?debug=1` URL parametresi) ile açılan bir görünüm.
- Açıldığında mevcut `auditPageHTMLP()` + 4 sekme **aynen** gösterilir (kod yeniden yazılmaz, sadece giriş noktası taşınır — `toggleAuditPage(true)` çağrısının tetiklendiği yer değişir).
- Varsayılan kapalı, `localStorage`'da iz bırakmaz, gözlemci normal kullanımda asla görmez.

Böylece: mühendislik/debug değeri kaybolmaz, ama "günlük kullanım" ile "arıza teşhisi" ayrışır.

---

## 6. Yeni özellikler

### 6.1 "Bugün Ne Yapmalıyım" kartı

**Konum:** `auditEntryHTMLP()`'nin şu an olduğu yer (`order:6`), dashboard'da ilk ekranda, risk bandının hemen altında.

**Veri kaynağı (hepsi zaten `render()` içinde hesaplı, yeni hesaplama yok):**
`risk(cur,saved)`, `moodDist`, `sosRows`, `missingDays(cur)`, `curSleep/prevSleep`, `curWater`, `curEnergy`, `therapyRecencyTextP(th)`.

**Mantık (sözde kod):**
```
maddeler = []
if missingDays(cur) >= 2:
    maddeler.push("{n} gündür kayıt yok")
if sosRows bugünden itibaren son 7 günde >= 1:
    maddeler.push("Son 7 günde {n} kez SOS kullanıldı")
if moodDist["zorlandim"] + moodDist["cok-zorlandim"] >= 3 (pencere içinde):
    maddeler.push("Bu dönem {n} gün zor geçmiş")
if curSleep > 0 and curSleep < prevSleep - 1.5:
    maddeler.push("Uyku ortalaması düşüyor: {prevSleep} → {curSleep} sa")
if therapyRecencyTextP(th) döndürüyorsa (bugün terapi kaydı yok ama geçmişte var):
    maddeler.push(o metni)

eğer maddeler boşsa:
    göster: "Şu an dikkat gereken bir şey görünmüyor · ritim sakin" (calm state, risk() 'ok' ile tutarlı)
değilse:
    risk() klass'ına göre kart tonu (ok/warn/danger) + maddeler.slice(0,3) liste halinde
```

**Önemli ilke:** Eşikler `risk()` fonksiyonundaki mevcut sabitlerle (SOS≥2, mood≥3, avg<2.5 vb.) **tutarlı** olmalı — iki farklı yerde farklı eşik tanımlamak, panelin kendi içinde çelişmesine yol açar. Mümkünse maddeler `risk()`'in skorlama mantığından türetilir, ayrı bir "ikinci risk motoru" icat edilmez.

**Boş/sakin durum tasarımı önemli:** Her gün "3 madde" göstermeye zorlanmamalı — çoğu gün sakin geçiyorsa kart da sakin görünmeli, yoksa "alarm yorgunluğu" (her şey kırmızıysa hiçbir şey kırmızı değildir) oluşur.

### 6.2 "Bu hafta değişenler" — süzülmüş liste

**Konum:** `eventLogCardHTMLP()`'nin şu an olduğu yer (`order:8`).

**Veri kaynağı:** Aynı `buildEventLogStateP()`/`loadEventLogP()` event kaynağı — **silinmiyor, filtreleniyor.**

**Filtre mantığı:** Mevcut kategori sistemini (`Kullanıcı kayıtları`, `Terapi & profil`, `Senkronizasyon`, `İletişim & bildirim`, `Dış kaynak`) kullan ama:
- `Kullanıcı kayıtları` (rutin gün kaydı — 129/132'lik gürültü kaynağı) **varsayılan olarak gizli**
- Yalnızca "gün içinde önceki güne göre fark yaratan" olaylar gösterilir: yeni SOS, terapi aracı ilk kullanımı, bildirim teslim hatası, senkron conflict, konum izni reddi (bu oturumda eklediğimiz `permission-denied` reason dahil)
- En fazla ~10 madde, en yeni üstte
- İsteyen "Tüm kayıtları göster" ile eski rutin listeye dönebilir (bu, dev moduna değil, aynı kartın içinde bir toggle olarak kalabilir — nadiren ihtiyaç duyulan ama tamamen gizlenmemesi gereken bir şey)

---

## 7. Dosya bazlı değişiklik listesi

| Dosya | Değişiklik |
|---|---|
| `panel.js` | §4'teki render fonksiyonları kaldırılır/dev-moduna taşınır; §6'daki iki yeni fonksiyon (`needsAttentionCardHTMLP()`, `curatedChangeLogCardHTMLP()` gibi adlarla) eklenir; `render()`'daki çağrı satırları güncellenir; gizli dev-mode giriş noktası eklenir |
| `panel.css` | Audit/event'e özel ~168 satırın kullanılmayan kısmı silinir; yeni iki kart için (mevcut `.card`/`.kpi` sınıflarını yeniden kullanarak, minimum yeni CSS ile) stil eklenir |
| `panel.html` | Yalnızca bu yüzeye özel bir nav/route referansı varsa güncellenir (muhtemelen değişiklik gerekmez, panel.js render-driven) |
| `panelCoverageManifest.js` | **Değişmez** — dev modu hâlâ kullanıyor |

---

## 8. Etkilenen testler (8 dosya)

```
tests/test_panel_p4_provenance.js
tests/test_panel_p6_qa_release.js
tests/test_panel_focus_location.js
tests/test_panel_event_focus.js
tests/test_panel_p3_timeline_drawer.js
tests/test_panel_p3_root_modules.js
tests/test_panel_p4_module_cards.js
tests/test_panel_p2_event_log.js
```

**Yaklaşım:** Bu testler `auditEntryHTMLP`/`eventLogCardHTMLP`/`rootModulesCardHTMLP` vb.'nin **birincil dashboard'da** bulunmasını doğruluyor olabilir — bunlar ya (a) dev-mode giriş noktasını test edecek şekilde güncellenir (fonksiyonlar hâlâ var, sadece tetikleme yolu değişti), ya da (b) gerçekten birincil-yüzey varsayımı test ediyorsa yeni `needsAttentionCardHTMLP`/`curatedChangeLogCardHTMLP` için yazılacak testlerle **değiştirilir**. Her dosya tek tek incelenmeden toplu silme/toplu geçme yapılmayacak — Faz 3'te (bkz. §9) her dosya ayrı değerlendirilir.

---

## 9. Aşamalı uygulama planı

1. **Faz 1 — Yeni kartlar (ekleme, kaldırma yok):** `needsAttentionCardHTMLP()` ve `curatedChangeLogCardHTMLP()` yazılır, dashboard'a **audit apparatus'un yanına** eklenir (henüz hiçbir şey silinmez). Headless doğrulama + görsel gözden geçirme.
2. **Faz 2 — Dev-mode giriş noktası:** Gizli tetikleyici (logo 5 dokunma / `?debug=1`) eklenir, mevcut `auditPageHTMLP()` bu yola bağlanır.
3. **Faz 3 — Birincil yüzeyden kaldırma:** `auditEntryHTMLP()`/`eventLogCardHTMLP()` çağrıları `render()`'dan çıkarılır. Etkilenen 8 test dosyası tek tek gözden geçirilip güncellenir/taşınır.
4. **Faz 4 — CSS temizliği:** Kullanılmayan `.audit-*`/`.p3-*`/`.p4-*`/`.d4-*` sınıfları silinir (dev-mode'un kullandığı sınıflar hariç).
5. **Faz 5 — Doğrulama:** `node --check panel.js`, tüm `tests/test_panel_*.js`, script-tag balance kontrolü (CLAUDE.md "Verification" bölümündeki yöntemle, tarayıcı açılmadan).

Her faz kendi başına commit edilebilir — istenirse Faz 1-2'de durup gözlemcinin yeni kartları birkaç gün gerçek kullanımda denemesi, sonra Faz 3-4'e geçilmesi de mümkün.

---

## 10. Riskler ve azaltımlar

| Risk | Azaltım |
|---|---|
| Panelde gerçek bir senkron/projection hatası olduğunda artık ön planda görünmez | Üst bardaki senkron rozeti (`d2StatusBadgeP`/`coverageRibbonHTMLP`, zaten var, [panel.js:3185](panel.js#L3185)) tek güven göstergesi olarak kalır; tam audit görünümü dev-modda canlı |
| "Bugün Ne Yapmalıyım" kartı yanlış eşiklerle ya çok sık alarm verir ya da gerçek bir sorunu kaçırır | Eşikler `risk()`'in mevcut, zaten kullanılan sabitleriyle birebir hizalanır; ayrı bir risk motoru icat edilmez |
| 8 test dosyasının toplu güncellenmesi regresyon riski taşır | Faz 3'te dosya dosya, her birinin gerçekte neyi doğruladığı okunarak ilerlenir; toplu sed/replace yapılmaz |
| Dev-mode gizli tetikleyici gerçek kullanıcı tarafından yanlışlıkla bulunup kafa karıştırabilir | Varsayılan kapalı, `localStorage` izi yok, görünür bir buton/link yok |

---

## 11. Onay gereken açık kararlar

1. Dev-mode tetikleyicisi: **logoya 5 dokunma** mı, **`?debug=1` URL parametresi** mi, yoksa ikisi birden mi?
2. "Bu hafta değişenler" kartında "Tüm kayıtları göster" toggle'ı kalsın mı, yoksa o da tamamen dev-mode'a mı taşınsın?
3. Faz 1-2'den sonra bir ara doğrulama molası (gözlemcinin yeni kartları birkaç gün denemesi) isteniyor mu, yoksa tüm fazlar arka arkaya mı uygulansın?
4. §12'deki premium özelliklerden hangileri Faz 1'e dahil edilsin, hangileri sonraki bir faza ertelensin? (§12.3'teki öneri: A-grubundan 3 tanesiyle başla)

Onay gelince Faz 1'den başlarım.

---

## 12. Pro/Premium Ek Özellikler (genişletme)

Boşalan alana yalnızca "Bugün Ne Yapmalıyım" + "Bu hafta değişenler" koymak minimum düzeltme olur. Gözlemci paneli gerçekten daha işlevsel hale getirmek için, **yine mevcut veriden türetilebilen** ama şu ana kadar hiç yüzeye çıkarılmamış bir dizi ek özellik var. İki kategoriye ayırıyorum çünkü risk profilleri çok farklı:

- **Kategori A** — yalnızca render, hiçbir yeni veri alanı/migration/sync değişikliği yok. `data`/`PROJECTION`'a tek satır bile yazılmıyor. Düşük risk, hızlı.
- **Kategori B** — yeni bir veri kanalı gerektiriyor. Blast radius'u küçültmek için `app.js`'in `migrate()`'ine veya `data.days.*`'e **dokunmadan**, panelin zaten sahip olduğu ayrı transport dosyalarını (bkz. §12.2) kullanacak şekilde tasarlandı.

### 12.1 Kategori A — sadece render, sıfır veri modeli riski

| # | Özellik | Ne yapar | Veri kaynağı | Nereye eklenir |
|---|---|---|---|---|
| A1 | **Korelasyon motoru** | "Uyku < 6 sa olduğu günlerde ruh hali ortalaması %X daha düşük" gibi otomatik, iki değişkenli örüntüler bulur (uyku↔mood, su↔enerji, hareket↔mood, SOS↔hafta günü). Basit Pearson/eşik korelasyonu, LLM/network yok. | `data.days[*]` üzerinden mevcut `sleep`, `water`, `energy`, `mood`, `movement`, `cravingSOSCount` alanları | Yeni kart, `order:9` civarı, "Bugün Ne Yapmalıyım"ın hemen altı |
| A2 | **Aylık ısı haritası (heatmap) takvimi** | Ay görünümünde her gün bir hücre; renk = mood/tik yoğunluğu, küçük nokta = SOS günü. Tek bakışta "bu ay nasıl geçti" görülür — şu an bunu görmek için gün gün tıklamak gerekiyor. | `data.days[*].mood`, `.habits`, `.cravingSOSCount` (zaten `moodDist` için okunuyor, sadece haftalık pencere yerine aylık ızgaraya render ediliyor) | `SECTIONS` altına yeni bölüm |
| A3 | **Kişisel baseline / sapma** | Sabit eşikler yerine ("SOS≥2 ise uyar") kişinin kendi 30/60 günlük ortalamasına göre sapma ("bu hafta SOS ortalamanın 2.3 katı"). `risk()`'i zenginleştirir, değiştirmez. | Aynı `risk()` girdileri, farklı pencerelerde tekrar hesaplanır | `risk()`'e opsiyonel `baseline` parametresi |
| A4 | **Haftalık otomatik özet** | Her pazar (veya panel açıldığında son 7 gün tamamlanmışsa) insan diliyle yazılmış 3-4 cümlelik özet: "Bu hafta ritim geçen haftaya göre sakin · uyku ortalaması 6.8 saat · 1 SOS oldu". Şablon metin, LLM yok. | Zaten hesaplı `cur`/`prev` pencere karşılaştırmaları | Yeni kart veya "Bugün Ne Yapmalıyım"ın haftalık varyantı |
| A5 | **Konuşma başlatıcı önerileri** | Veriye dayalı, yargısız açılış cümlesi şablonları üretir — ör. SOS varsa "Bu hafta biraz zorlanmış görünüyor, nasıl hissettiğini sorabilirsin" gibi. Tamamen client-side şablon, kişiye özel metin göndermez, yalnızca gözlemciye öneri. | §6.1'deki "Bugün Ne Yapmalıyım" maddeleri | Aynı kartın altına küçük bir "Nasıl sorabilirim?" açılır bölüm |
| A6 | **Milestone/kutlama rozetleri** | Seri rekoru kırıldığında, terapi aracı X. kez kullanıldığında, 30 gün SOS'suz geçildiğinde pozitif bir rozet gösterir — panel yalnızca olumsuzu değil, iyi gidişi de görünür kılsın. | `currentStreak()`, `bestStreak()`, terapi/therapyProvenance sayaçları | Hero kartların yanına küçük bir kutlama şeridi |
| A7 | **Dönem karşılaştırma genişletmesi** | Mevcut 7/14/30/90 gün seçicisine ek olarak "bu ay vs geçen ay", "bu hafta vs geçen hafta" gibi takvim-hizalı karşılaştırma. | `windowDays()` zaten var, yalnızca pencere sınırları takvim ayına hizalanır | `d2-controls` şeridine yeni seçenek |
| A8 | **Panoya kopyalanabilir rapor** | "Raporu kopyala" butonu — A4'teki haftalık özeti düz metin olarak panoya kopyalar, gözlemci isterse kendi notlarına/WhatsApp'a yapıştırır. Ağ çağrısı yok, `navigator.clipboard` yerel. | A4'ün çıktısı | Haftalık özet kartının içinde bir buton |
| A9 | **Ayarlanabilir hassasiyet** | Gözlemci "Bugün Ne Yapmalıyım" eşiklerini kendi tercihine göre ayarlayabilir (ör. "SOS eşiğini 1'e indir"). **Yalnızca panelin kendi `localStorage`'ında** tutulur, `data`'ya hiç yazılmaz — kullanıcının senkron akışını etkilemez. | Yeni panel-local `UI`/`localStorage` ayarı | Ayarlar/panel tercihleri bölümü |

### 12.2 Kategori B — yeni veri kanalı gerektirir (izole, ama ayrı onay ister)

| # | Özellik | Ne yapar | Nasıl izole edilir |
|---|---|---|---|
| B1 | **Destek eylemleri günlüğü ("Care Log")** | Gözlemcinin kendi kısa notlarını bırakabildiği alan: "bugün onunla konuştum", "mesaj attım", "ziyarete gittim". Amaç: gözlemcinin kendi desteğini de takip edebilmesi, sadece "hastayı izlemek" değil, "ne yaptım" da görünür olsun. | `app.js`/`migrate()`'e **dokunmaz**. Panel zaten `data/observer-inbox.json` ve `data/aeon-outbox.json` adında kendi transport dosyalarını okuyup yazıyor ([panel.js:4291](panel.js#L4291), [sync.js:937](sync.js#L937)) — aynı desende **yeni, tamamen ayrı** bir `data/observer-notes.json` dosyası kullanılır. Şeyma tarafı (`app.js`) bu dosyanın varlığından haberdar bile olmak zorunda değil. |
| B2 | **Gözlemci eşiklerinin cihazlar arası senkronu** | A9'daki hassasiyet ayarını yalnızca bu cihazda değil, gözlemcinin başka bir cihazında da aynı tutmak. | Yine `observer-notes.json` benzeri ayrı bir panel-only dosya; kullanıcı `data`'sına karışmaz. Yalnızca A9 tek cihazda yetmezse gerekli. |

**Neden bu ikisi bile "izole" sayılıyor:** İkisi de `data.days`/`migrate()`/`sync.js`'in kullanıcı tarafı akışına dokunmuyor — tamamen panelin zaten kullandığı, kullanıcı verisinden ayrı transport dosyası deseniyle ilerliyor. Yine de "yeni bir dosya, yeni bir GitHub Contents API çağrısı" olduğu için Kategori A'dan daha fazla test/gözden geçirme ister; bu yüzden ayrı onay maddesi (§11.4).

### 12.3 Öneri: Faz 1 kapsamı

Hepsini birden eklemek yine "yığın" riski yaratır — bu planın başındaki teşhisin tekrarı olur. Faz 1 için önerim, en yüksek fayda/risk oranına sahip üçü:

1. **A4 — Haftalık otomatik özet** (gözlemcinin her girişte gördüğü, en çok kullanılacak özellik)
2. **A2 — Aylık ısı haritası** (görsel, tek bakışta anlaşılır, mevcut hiçbir görünümle çakışmıyor)
3. **A6 — Milestone/kutlama rozetleri** (ucuz, düşük risk, panelin tamamen negatif/klinik hissini dengeler)

A1 (korelasyon), A3 (baseline), A5 (konuşma başlatıcı), A7-A9 ve tüm Kategori B, Faz 1 sonrası ayrı fazlara bırakılabilir — her biri kendi başına değerlendirilecek kadar önemli.
