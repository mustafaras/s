# Denetim Merkezi Değişimi — Prompt Seti

> Kaynak: [PANEL-DENETIM-MERKEZI-YENIDEN-TASARIM-PLANI.md](PANEL-DENETIM-MERKEZI-YENIDEN-TASARIM-PLANI.md) —
> buradaki her prompt, plan dosyasının bir bölümünü eksiksiz uygulayacak
> şekilde yazıldı. İlerleme kaydı:
> [PANEL-DENETIM-MERKEZI-LEDGER.md](PANEL-DENETIM-MERKEZI-LEDGER.md).
>
> **Kullanım:** Her prompt kendi başına bağımsızdır (context-engineered) —
> herhangi bir kodlama ajanına (Claude Code, Cursor, Codex, Copilot
> Workspace, vb.) bu konuşmanın geçmişi olmadan tek başına verilebilir.
> Prompt'ları sırayla (Faz 1 → 5) uygula; her prompt kendi doğrulama
> adımlarını içerir. Bir prompt'u çalıştırmadan önce `git status` ile
> çalışma dizininin temiz olduğundan emin ol, her prompt'tan sonra ayrı bir
> commit at ve [PANEL-DENETIM-MERKEZI-LEDGER.md](PANEL-DENETIM-MERKEZI-LEDGER.md)'yi
> güncelle (bkz. o dosyanın §3-4'ü).
>
> **Context/Token Engineering notu:** Bu prompt'ların hiçbiri plan
> dosyasının tam analizini/gerekçesini tekrar etmez — yalnızca ilgili `§X`
> bölümüne işaret eder. Bir prompt'u uygulayan ajan, plan dosyasının
> YALNIZCA referans verilen bölümünü okumalı, tüm dosyayı baştan sona
> okumak ZORUNDA değildir; bu, her yeni oturumun gereksiz token
> harcamasını önler. Aynı ilke ledger güncellemeleri için de geçerlidir
> (bkz. ledger §1 "Token/Context Engineering ilkeleri").
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
> - Bu girişim yalnızca `panel.js`/`panel.css`/`panelCoverageManifest.js`/
>   `panel.html` dosyalarına dokunur. `app.js`/`sync.js`/`styles.css`
>   **kapsam dışıdır** — bir adım bu dosyaları değiştirmeni gerektiriyor
>   gibi görünüyorsa dur, planı tekrar oku.
> - Her değişiklikten sonra ilgili test dosyalarını çalıştır ve sonucu
>   raporla; testler kırmızıya düşerse ya testi (davranış kasıtlı
>   değiştiyse) ya kodu düzelt.
> - `data`/`PROJECTION`'a yeni bir persisted alan YAZMA — tüm yeni kartlar
>   render-time türetilmiş (derived) olmalı (plan §3 "Hedef olmayanlar").

---

## Faz 1 — Yeni kartlar (ekleme, kaldırma yok)

### Prompt D1.1 — "Bugün Ne Yapmalıyım" kartı (needsAttentionCardHTMLP)

```
Bağlam: /Users/m_ras/Desktop/seyma reposunda panel.js dosyasında ÆON
gözlemci dashboard'u var. PANEL-DENETIM-MERKEZI-YENIDEN-TASARIM-PLANI.md
§6.1'de tanımlanan "Bugün Ne Yapmalıyım" kartını ekliyoruz — henüz mevcut
audit apparatus'u (auditEntryHTMLP/eventLogCardHTMLP) SİLMİYORUZ, yalnızca
yanına yeni bir kart ekliyoruz (plan §9 Faz 1 kuralı).

render() fonksiyonu (panel.js:3110-3336 civarı) içinde şu değerler ZATEN
hesaplanıyor ve `h+=...` ile HTML'e ekleniyor:
- rsk = risk(cur,saved) → panel.js:3133, risk() tanımı panel.js:1724
- moodDist → panel.js:3134-3135 (mood="zorlandim"/"cok-zorlandim" sayacı)
- sosRows → panel.js:3137
- missingDays(cur) → panel.js:1799 tanımlı, henüz render() içinde
  çağrılmıyor olabilir, kontrol et
- curSleep/prevSleep → panel.js:3126
- therapyRecencyTextP(th) → panel.js:1357 (th değişkeni şu an yalnız
  p4ProvenanceCardHTMLP içinde PROJECTION.sections.therapyProvenance'tan
  okunuyor — render()'da henüz yok, bu prompt'ta ekleyeceksin)

commandRiskHTMLP(riskState,canonical,projectionState) — panel.js:2096 —
zaten AYNI DESENİ kullanıyor: render()'da hesaplanan local değerleri
parametre olarak alıp HTML string döndürüyor. Yeni fonksiyonu TAM OLARAK
bu desenle yaz.

Görev:
1. panel.js'e yeni bir fonksiyon ekle:
   function needsAttentionCardHTMLP(riskState, moodDist, sosRows,
   missingCount, curSleep, prevSleep, therapyText, windowDays) { ... }
   — commandRiskHTMLP'nin hemen altına (panel.js:2103'ten sonra) yerleştir.
2. Fonksiyon mantığı (plan §6.1'deki sözde koda birebir uy):
   - maddeler=[] dizisi oluştur.
   - missingCount>=2 ise "{n} gündür kayıt yok" ekle.
   - sosRows'tan son 7 gün içindeki toplam SOS sayısını hesapla (sosRows
     zaten tarih-azalan sıralı; today()'den 7 gün öncesine kadar filtrele),
     >=1 ise "Son 7 günde {n} kez SOS kullanıldı" ekle.
   - moodDist["zorlandim"]+moodDist["cok-zorlandim"]>=3 ise "Bu dönem {n}
     gün zor geçmiş" ekle.
   - curSleep>0 && curSleep<prevSleep-1.5 ise "Uyku ortalaması düşüyor:
     {prevSleep} → {curSleep} sa" ekle (1 ondalık basamak yuvarla).
   - therapyText (null olmayan) varsa doğrudan ekle.
   - maddeler boşsa: risk() 'ok' sınıfıyla tutarlı sakin bir durum göster
     ("Şu an dikkat gereken bir şey görünmüyor · ritim sakin").
   - maddeler doluysa: riskState.klass'a göre kart tonu (ok/warn/danger,
     commandRiskHTMLP'nin kind eşlemesine bak, panel.js:2098) + maddeler
     ilk 3'ü liste halinde göster.
3. render() içinde therapyRecencyTextP çağrısı için PROJECTION.sections.
   therapyProvenance'ı oku (p4ProvenanceCardHTMLP'nin panel.js:1363'teki
   aynı deseniyle: `var th=PROJECTION.sections.therapyProvenance||{...}`).
4. render() içinde missingDays(cur) çağrısını ekle (henüz yoksa) ve yeni
   kartı çağır: `h+=needsAttentionCardHTMLP(rsk, moodDist, sosRows,
   missingCount, curSleep, prevSleep, therapyText, cur.length);` —
   auditEntryHTMLP() çağrısının HEMEN ÜSTÜNE ekle (panel.js:3218 civarı,
   henüz auditEntryHTMLP()'yi silme).
5. Kart CSS'i için yeni sınıf icat ETME — mevcut `.card`, `.lift`, `.pad`,
   `.span-12` sınıflarını kullan (auditEntryHTMLP'nin panel.js:1403'teki
   div açılışına bak, aynı iskeleti kopyala).

Kısıtlar: risk() fonksiyonunun kendi eşiklerini (SOS≥2/≥4, mood≥3,
avg<2.5/<3.5, panel.js:1729) DEĞİŞTİRME — yalnız oradan ilham al, ayrı bir
risk motoru icat etme. Mevcut auditEntryHTMLP/eventLogCardHTMLP çağrılarına
DOKUNMA (onlar Faz 3'te kaldırılacak, bu prompt'un kapsamı değil).

Doğrulama:
- node --check panel.js
- node tests/test_panel_p0_sync.js
- node tests/test_panel_p1_projection.js
- Yeni bir tests/test_panel_needs_attention.js dosyası yaz (diğer
  tests/test_panel_*.js dosyalarındaki VM extract/mock deseniyle aynı
  şekilde): en az şu senaryoları test et — (a) tüm maddeler tetiklenmez
  durumda "sakin" mesajı döner, (b) missingCount=3 iken ilgili metin
  içerir, (c) SOS>=1 son 7 günde iken ilgili metin içerir, (d) dönen HTML
  esc() ile kaçışlanmış (XSS güvenliği), ham `<`/`>` kullanıcı verisi HTML
  olarak enjekte edilmiyor.

Kabul kriterleri: Yukarıdaki tüm doğrulama komutları PASS; yeni test
dosyası en az 4 assertion içerir ve hepsi PASS; mevcut hiçbir test
kırılmamış.
```

### Prompt D1.2 — "Bu hafta değişenler" süzülmüş liste (curatedChangeLogCardHTMLP)

```
Bağlam: PANEL-DENETIM-MERKEZI-YENIDEN-TASARIM-PLANI.md §6.2. Mevcut
eventLogCardHTMLP() (panel.js:1683) ve eventLogCardInnerHTMLP() (panel.js:
1657) event log'u HAM olarak gösteriyor — 132 kayıttan 129'u "Kullanıcı
kayıtları" (rutin gün kaydı) gürültüsü. Bu prompt aynı veri kaynağını
(buildEventLogStateP panel.js:466, loadEventLogP panel.js:474,
eventLogSourceP panel.js:1536) kullanan ama gürültüyü süzen YENİ bir kart
ekliyor — eskisini SİLMİYORUZ (Faz 3'e kadar).

Görev:
1. ÖNCE eventLogCardInnerHTMLP() (panel.js:1657) ve eventLogSourceP()
   (panel.js:1536) fonksiyonlarını oku — event objelerinin gerçek alan
   adlarını/kategori sistemini (screenshot'taki "Kullanıcı kayıtları",
   "Terapi & profil", "Senkronizasyon", "İletişim & bildirim", "Dış
   kaynak" filtre butonlarının kod karşılığını) çıkar. Bu prompt'ta
   varsayım YAPMA, kodu oku.
2. Yeni bir fonksiyon ekle: curatedChangeLogCardHTMLP() —
   eventLogCardHTMLP()'nin hemen altına (panel.js:1683'ten sonra)
   yerleştir.
3. Filtre mantığı: eventLogSourceP()'nin döndürdüğü event listesinden,
   kategorisi "Kullanıcı kayıtları" (veya kod karşılığı ne ise) OLANLARI
   varsayılan olarak ÇIKAR; geri kalanları (SOS, terapi aracı ilk
   kullanımı, bildirim teslim hatası, senkron conflict, konum izni reddi
   — bu son'u `permission-denied` reason'ıyla ara, app.js'de değil ama
   event log'a bu bilgi PROJECTION üzerinden yansıyor olabilir, kontrol
   et) en yeni üstte, en fazla 10 madde göster.
4. Filtrelenen maddeler boşsa: "Bu hafta rutin dışı bir değişiklik yok"
   gibi sakin bir boş durum göster.
5. Kartın altına küçük bir "Tüm kayıtları göster" linki/toggle'ı ekle —
   tıklanınca mevcut eventLogCardInnerHTMLP()'nin ürettiği TAM listeyi
   aynı kart içinde açar (yeni bir UI state alanı, örn. UI.curatedLogShowAll,
   diğer UI.* boolean toggle'larının deseniyle aynı şekilde tanımla).
6. render() içinde yeni kartı çağır — eventLogCardHTMLP() çağrısının
   HEMEN ÜSTÜNE ekle (panel.js:3219 civarı, eskisini silme).

Kısıtlar: buildEventLogStateP/loadEventLogP/eventLogSourceP'nin kendi veri
çekme mantığına DOKUNMA — yalnız zaten döndürdükleri listeyi filtrele.
Yeni bir GitHub API çağrısı EKLEME.

Doğrulama:
- node --check panel.js
- node tests/test_panel_p2_event_log.js
- Yeni tests/test_panel_curated_change_log.js: (a) "Kullanıcı kayıtları"
  kategorisi varsayılan görünümde YOK, (b) SOS/terapi/senkron gibi
  kategoriler VAR, (c) 10 madde sınırı uygulanıyor, (d) "Tüm kayıtları
  göster" açılınca ham liste (eventLogCardInnerHTMLP ile aynı sayıda
  madde) görünüyor.

Kabul kriterleri: Tüm doğrulama komutları PASS; adım 1'de çıkarılan gerçek
kategori kodları prompt'un varsayımlarıyla eşleşmiyorsa, filtre mantığı
GERÇEK kodlara göre düzeltilmiş olmalı (varsayımda ısrar etme).
```

### Prompt D1.3 — Haftalık otomatik özet kartı (A4)

```
Bağlam: PANEL-DENETIM-MERKEZI-YENIDEN-TASARIM-PLANI.md §12.1 satır A4.
render() içinde `cur`/`prev` pencere karşılaştırmaları zaten hesaplı
(curAvg/prevAvg panel.js:3116, curSleep/prevSleep panel.js:3126,
curWater/prevWater panel.js:3129, curEnergy/prevEnergy panel.js:3131,
curSos/prevSos panel.js:3117).

Görev:
1. weeklyDigestCardHTMLP(cur, prev, curAvg, prevAvg, curSleep, prevSleep,
   curSos, prevSos, curSess) fonksiyonu ekle — needsAttentionCardHTMLP'nin
   (D1.1'de eklendi) hemen altına.
2. Şablon metin üret (LLM/network YOK, düz string birleştirme): "Bu hafta
   ritim {geçen haftaya göre sakin/benzer/daha yoğun} · uyku ortalaması
   {curSleep} saat {trend oku ↑/↓/→} · {curSos} SOS oldu {trend}." gibi
   3-4 cümlelik, mevcut `tc()` trend-chip yardımcısının (panel.js:3175
   civarı, render() içinde tanımlı, fonksiyona parametre olarak geçir
   veya aynı mantığı kopyala) kullandığı eşiklerle (fark<0.05 → "→")
   tutarlı ol.
3. "Raporu kopyala" butonu ekleme — bu D1.3'ün kapsamı DEĞİL, o A8'dir
   (bu prompt setinde yok, plan §12.1'de ayrı madde, sonraki bir fazda).
4. render() içinde çağır, needsAttentionCardHTMLP'nin hemen altına.

Kısıtlar: Yeni bir persisted alan yazma (örn. "bu haftanın özeti"
`data`'ya kaydedilmez, her render'da yeniden hesaplanır). Metin şablonu
panelin mevcut Türkçe/sıcak üslubuna uygun olmalı (diğer kartların
metinlerine bak).

Doğrulama:
- node --check panel.js
- Yeni tests/test_panel_weekly_digest.js: en az 3 senaryo (uyku artışı/
  azalışı/sabit; SOS 0 iken metin "SOS oldu" DEMEMELİ, "SOS olmadı" gibi
  bir ayrım olmalı).

Kabul kriterleri: Tüm testler PASS; SOS=0 durumunda metin yanlışlıkla
"0 SOS oldu" gibi tuhaf bir cümle üretmiyor (doğal dil kontrolü — 0 için
ayrı bir dal yaz).
```

### Prompt D1.4 — Aylık ısı haritası takvimi (A2)

```
Bağlam: PANEL-DENETIM-MERKEZI-YENIDEN-TASARIM-PLANI.md §12.1 satır A2.
moodDist hesaplaması (panel.js:3134-3135) haftalık pencerede çalışıyor;
bu kart AYNI mood/tik/SOS verisini AYLIK bir takvim ızgarasında gösterir.
SECTIONS dizisi (panel.js:3211-3213 civarında tanımlı/kullanılıyor) mevcut
bölüm başlıklarının deseni — yeni bölüm eklerken aynı deseni izle.

Görev:
1. monthlyHeatmapCardHTMLP(monthKey) fonksiyonu ekle — parametre olarak
   UI.month (panel.js:3112'de zaten tanımlı) alır.
2. Ay içindeki her gün için bir hücre üret: recOf(d) (panel.js'te tanımlı
   yardımcı, ara ve kullan) ile o günün `mood`/`habits` tik sayısı/
   `cravingSOSCount`'unu oku. Renk yoğunluğu mood'a göre (mevcut
   MOOD_LABEL/mood renklerine bak, panel.js içinde ara — muhtemelen
   moodDist'in kullandığı aynı 5 mood anahtarı: cok-iyi/iyi/normal/
   zorlandim/cok-zorlandim), SOS günü için küçük bir nokta/badge ekle.
3. Ay değiştirme kontrolü ekleme (ileri/geri ok) — mevcut `d2-date-label`/
   `panel-date` input deseninden (panel.js:3207) ilham al, aynı basitlikte
   bir "←/→ ay" kontrolü.
4. `SECTIONS.forEach` döngüsünün (panel.js:3221-3223) ürettiği section-header
   deseniyle TUTARLI bir görsel bölüm başlığı ekle veya doğrudan bento
   grid'e `order` ile yerleştir (mevcut kart `order` numaralarını grep'le,
   çakışmayan bir sayı seç, örn. order:19).

Kısıtlar: Takvim SADECE render — `data`'ya ay seçimi dışında hiçbir şey
yazma; ay seçimi yalnızca `UI.month` (zaten var, panel.js:3112) üzerinden
geçici state olarak tutulur.

Doğrulama:
- node --check panel.js
- Yeni tests/test_panel_monthly_heatmap.js: (a) 28-31 gün arası doğru
  sayıda hücre üretir (ay uzunluğuna göre), (b) SOS günü işaretleniyor,
  (c) veri olmayan gün boş/nötr hücre olarak render ediliyor (hata
  fırlatmıyor).

Kabul kriterleri: Tüm testler PASS; Şubat (28/29 gün) ve 31 günlük bir ay
için ayrı ayrı test edilmiş olmalı (yıl kayması/gün sayısı hatası riski
yüksek bir alan).
```

### Prompt D1.5 — Milestone/kutlama rozetleri (A6)

```
Bağlam: PANEL-DENETIM-MERKEZI-YENIDEN-TASARIM-PLANI.md §12.1 satır A6.
currentStreak() ve bestStreak() (panel.js:1088 civarı) zaten var.

Görev:
1. milestoneRibbonHTMLP(streak, best, therapyUsageCount, sosFreeStreak)
   fonksiyonu ekle.
2. Eşikler (basit, sabit liste — aşırı mühendislik yapma): streak===best
   && best>=7 ise "Yeni seri rekoru! {n} gün" rozeti; sosFreeStreak>=30
   ise "30 gündür SOS'suz" rozeti; therapyUsageCount belli round-number
   eşiklerini (10/25/50) geçtiyse "Terapi aracını {n}. kez kullandın"
   rozeti. Hiçbiri tetiklenmezse HİÇBİR ŞEY render etme (kartın kendisi
   yok, boş div bile yok) — bu bir "her zaman görünen kart" değil, yalnız
   gerçekten bir kilometre taşı geçildiğinde beliren bir şerit.
3. Hero kartların (commandCenterHeroesHTMLP çağrısı, panel.js:3192)
   hemen altına ekle.

Kısıtlar: Bu rozetler `data`'ya "gösterildi mi" diye bir bayrak YAZMAZ —
her render'da mevcut duruma göre yeniden hesaplanır (aynı gün tekrar
render'da tekrar görünmesi kabul edilebilir, "yalnız bir kez göster"
mantığı bu prompt'un kapsamında değil).

Doğrulama:
- node --check panel.js
- Yeni tests/test_panel_milestones.js: (a) streak=best=7 iken rozet
  görünür, (b) streak=5 iken hiçbir rozet görünmez (kart tamamen boş),
  (c) sosFreeStreak=30 iken ilgili rozet görünür.

Kabul kriterleri: Tüm testler PASS; "hiçbir milestone yokken kart hiç
render edilmiyor" davranışı test 1 assertion ile açıkça doğrulanmış
olmalı (boş string veya null dönüşü kontrol edilmeli).
```

---

## Faz 2 — Dev-mode giriş noktası

### Prompt D2.1 — Gizli "Geliştirici / Ham Veri" modu

```
Bağlam: PANEL-DENETIM-MERKEZI-YENIDEN-TASARIM-PLANI.md §5. Mevcut
toggleAuditPage(show) (panel.js:1456) ve setAuditTab(tab) (panel.js:1417)
tam audit sayfasını (auditPageHTMLP, panel.js:1446) açıp kapatıyor. Şu an
bu, auditEntryHTMLP() içindeki "Ayrıntılı denetim yüzeyini aç" butonundan
(panel.js:1407) tetikleniyor. Bu prompt, AYNI toggleAuditPage(true)
çağrısına gizli bir ikinci giriş noktası ekliyor — auditEntryHTMLP
butonunu SİLMİYORUZ (o Faz 3'te auditEntryHTMLP ile birlikte kaldırılacak).

Görev:
1. ÆON logosunun render edildiği yeri bul (coreStripHTML, panel.js:2104,
   "⬡" karakterinin olduğu div, panel.js:2113 civarı).
2. Logoya `onclick` ile bir sayaç ekle: 5 saniye içinde 5 kez tıklanırsa
   toggleAuditPage(true) çağır. UI objesine yeni state ekle (örn.
   UI.devTapCount, UI.devTapFirstAt — diğer UI.* alanlarının tanımlandığı
   yere, panel.js'in üst kısmına bak).
3. Ayrıca URL parametresi desteği ekle: sayfa yüklenirken
   `new URLSearchParams(location.search).get('debug')==='1'` ise
   otomatik olarak dev-mode'un kullanılabilir olduğunu işaretle (yalnız
   bir kez tetikler, sürekli açık bırakmaz — kullanıcı yine
   toggleAuditPage(false) ile kapatabilmeli).
4. localStorage'a HİÇBİR İZ YAZMA — sayaç yalnızca bellekte (UI objesi),
   sayfa yenilenince sıfırlanır.

Kısıtlar: Görünür hiçbir buton/link EKLEME — tetikleyici tamamen gizli
kalmalı. Mevcut toggleAuditPage/auditPageHTMLP/setAuditTab kodunu
DEĞİŞTİRME, yalnız yeni bir çağrı yolu ekle.

Doğrulama:
- node --check panel.js
- Yeni tests/test_panel_dev_mode_trigger.js: (a) 5 tıklamadan az
  toggleAuditPage'i TETİKLEMİYOR, (b) 5 tıklama (5 saniye içinde)
  tetikliyor, (c) 5 tıklama ama 5 saniyeden yavaş SIFIRLANIYOR (sayaç
  reset), (d) ?debug=1 ile sayfa yüklendiğinde dev-mode kullanılabilir.

Kabul kriterleri: Tüm testler PASS; hiçbir görünür UI elemanı eklenmediği
kod incelemesiyle (grep ile yeni buton/link olmadığı) doğrulanmış olmalı.
```

---

## Faz 3 — Birincil yüzeyden kaldırma

### Prompt D3.1 — auditEntryHTMLP/eventLogCardHTMLP çağrılarını render()'dan çıkar

```
Bağlam: PANEL-DENETIM-MERKEZI-YENIDEN-TASARIM-PLANI.md §4 ve §9 Faz 3.
Faz 1-2 (D1.1-D1.5, D2.1) tamamlandıktan SONRA çalıştırılmalı — ledger'da
bunların hepsi `done` olmadan bu prompt'u UYGULAMA.

Görev:
1. render() içindeki (panel.js:3218-3219 civarı) şu iki satırı SİL:
   h+=auditEntryHTMLP();
   h+=eventLogCardHTMLP();
2. Bu iki fonksiyonun TANIMINI (auditEntryHTMLP panel.js:1393,
   eventLogCardHTMLP panel.js:1683) SİLME — D2.1'de eklenen gizli
   dev-mode giriş noktası hâlâ toggleAuditPage(true) üzerinden
   auditPageHTMLP()'yi çağırıyor, o da rootModulesCardHTMLP/
   p4ProvenanceCardHTMLP/d4ModuleAtlasHTMLP/eventLogCardHTMLP'yi
   kullanıyor (auditPaneHTMLP, panel.js:1411-1415). Bu fonksiyonlar
   YAŞAMAYA DEVAM EDER, yalnız render()'ın birincil akışından çağrılmazlar.
3. D1.1/D1.2'de eklenen needsAttentionCardHTMLP()/
   curatedChangeLogCardHTMLP() çağrılarının artık auditEntryHTMLP/
   eventLogCardHTMLP'nin BOŞALTTIĞI `order` konumlarını (order:6, order:8)
   almasını sağla — D1.1/D1.2'de "hemen üstüne ekle" dendiği için sıralama
   zaten doğru olmalı, yalnız görsel olarak (order numaralarını grep'le)
   doğrula, çakışma varsa düzelt.

Kısıtlar: auditPageHTMLP/auditPaneHTMLP/setAuditTab/toggleAuditPage/
rootModulesCardHTMLP/p4ProvenanceCardHTMLP/d4ModuleAtlasHTMLP
fonksiyonlarının TANIMLARINA dokunma — yalnız render()'daki BİRİNCİL
çağrı satırlarını kaldırıyorsun.

Doğrulama:
- node --check panel.js
- TÜM tests/test_panel_*.js dosyalarını sırayla çalıştır — bu adımda
  muhtemelen 8 dosya (bkz. PANEL-DENETIM-MERKEZI-YENIDEN-TASARIM-PLANI.md
  §8 listesi) FAIL verecek çünkü auditEntryHTMLP/eventLogCardHTMLP'nin
  render() çıktısında bulunmasını varsayıyor olabilirler — bu FAIL'leri
  BU PROMPT'TA düzeltme, yalnız hangi dosyaların FAIL verdiğini kaydet,
  düzeltme D3.2'nin işi.
- grep -n "auditEntryHTMLP()\|eventLogCardHTMLP()" panel.js → yalnızca
  fonksiyon TANIM satırları ve auditPaneHTMLP içindeki
  eventLogCardHTMLP çağrısı kalmalı, render()'daki eski iki satır
  görünmemeli.

Kabul kriterleri: node --check PASS; grep sonucu yukarıdaki gibi; hangi
test dosyalarının FAIL verdiği (isim listesi) ledger'ın D3.1 satırının
Not sütununa yazılmış olmalı (D3.2'ye devredilecek liste).
```

### Prompt D3.2 — 8 etkilenen test dosyasının tek tek güncellenmesi

```
Bağlam: PANEL-DENETIM-MERKEZI-YENIDEN-TASARIM-PLANI.md §8. D3.1'in
Doğrulama adımında hangi test dosyalarının FAIL verdiği belirlendi
(ledger D3.1 satırının Not'una bakarak öğren). Aday liste (D3.1 SONRASI
gerçek FAIL listesiyle teyit et, körü körüne bu listeye güvenme):

tests/test_panel_p4_provenance.js
tests/test_panel_p6_qa_release.js
tests/test_panel_focus_location.js
tests/test_panel_event_focus.js
tests/test_panel_p3_timeline_drawer.js
tests/test_panel_p3_root_modules.js
tests/test_panel_p4_module_cards.js
tests/test_panel_p2_event_log.js

Görev (HER dosya için AYRI AYRI, toplu sed/replace YAPMA):
1. Dosyayı oku, FAIL veren assertion'ın TAM olarak neyi test ettiğini
   anla — render() çıktısında auditEntryHTMLP/eventLogCardHTMLP'nin
   BULUNMASINI mı bekliyor (bu durumda test artık geçersiz, D3.1'in
   kasıtlı sonucu — testi GÜNCELLE, yeni needsAttentionCardHTMLP/
   curatedChangeLogCardHTMLP çıktısını veya dev-mode üzerinden
   auditPageHTMLP çıktısını test edecek şekilde YENİDEN YAZ) yoksa
   auditEntryHTMLP/rootModulesCardHTMLP/vb. fonksiyonlarının kendi
   İÇ mantığını mı test ediyor (bu durumda fonksiyon hâlâ var ve
   değişmedi, test NEDEN FAIL veriyor incele — muhtemelen VM
   loader'ın render() çağrısını simüle ederken eski iki satırın
   varlığına dolaylı bağımlı olması).
2. Her dosya için: test gerçekten "birincil dashboard'da audit görünsün"
   mü test ediyordu (o zaman dev-mode/toggleAuditPage üzerinden test
   edecek şekilde taşı) yoksa "fonksiyon doğru HTML üretiyor mu" mu test
   ediyordu (o zaman fonksiyonu DOĞRUDAN çağırarak test etmeye devam
   edebilir, render() akışından bağımsız).
3. Her dosya değişikliğinden SONRA o dosyayı tek başına çalıştır, PASS
   olduğunu doğrula, SONRA bir sonraki dosyaya geç.

Kısıtlar: 8 dosyayı TEK bir commit'te toplu değiştirme — her dosya
kendi mantığına göre farklı bir düzeltme gerektirebilir, birini
diğerine kör kopyalama. Test DAVRANIŞINI (ne test ettiğini) sadece
gerçekten artık geçersizse değiştir; mümkün olduğunca ORİJİNAL test
niyetini KORU, yalnız hedefini (nereden render edildiğini) güncelle.

Doğrulama (her dosya için tek tek, SONRA hepsi birden):
- node tests/test_panel_p4_provenance.js
- node tests/test_panel_p6_qa_release.js
- node tests/test_panel_focus_location.js
- node tests/test_panel_event_focus.js
- node tests/test_panel_p3_timeline_drawer.js
- node tests/test_panel_p3_root_modules.js
- node tests/test_panel_p4_module_cards.js
- node tests/test_panel_p2_event_log.js
- Son olarak TÜM tests/test_panel_*.js dosyalarını çalıştır (regresyon
  taraması), hiçbiri kırılmamalı.

Kabul kriterleri: 8 dosyanın hepsi PASS; her dosya için ne değiştirildiği
(hedef taşındı mı, fonksiyon mantığı mı değişti) ledger D3.2 satırının
Not sütununda TEK TEK listelenmiş olmalı (8 alt-madde).
```

---

## Faz 4 — CSS temizliği

### Prompt D4.1 — Kullanılmayan audit/event CSS sınıflarının temizlenmesi

```
Bağlam: PANEL-DENETIM-MERKEZI-YENIDEN-TASARIM-PLANI.md §4 ve §9 Faz 4.
D3.1/D3.2 TAMAMLANDIKTAN SONRA çalıştırılmalı — auditPageHTMLP/
rootModulesCardHTMLP/p4ProvenanceCardHTMLP/d4ModuleAtlasHTMLP hâlâ
dev-mode üzerinden kullanılıyor, bu yüzden panel.css'teki `.audit-*`/
`.p3-*`/`.p4-*`/`.d4-*` sınıfları TAMAMEN silinemez — yalnızca gerçekten
artık HİÇBİR fonksiyon tarafından üretilmeyen sınıflar silinir.

Görev:
1. panel.css'teki her `.audit-*`/`.p3-*`/`.p4-*`/`.d4-*`/`.event-log-*`
   sınıfı için, panel.js içinde o sınıf adının hâlâ bir `class="..."`
   veya `.className` içinde ÜRETİLİP ÜRETİLMEDİĞİNİ grep ile kontrol et
   (dev-mode fonksiyonları dahil — onlar hâlâ yaşıyor, o sınıfları
   kullanan CSS'i SİLME).
2. Yalnızca panel.js'te hiçbir yerde artık üretilmeyen (D3.1/D3.2
   sırasında kaldırılmış eski render dallarına ait) sınıfları panel.css'ten
   sil.
3. Silme sonrası panel.css'te hiçbir "orphan" (tanımlı ama hiç kullanılmayan)
   yeni sınıf kalmadığını tekrar grep ile doğrula.

Kısıtlar: "Muhtemelen kullanılmıyordur" diye TAHMİN ile silme — her sınıf
için grep sonucunu (0 eşleşme) GÖSTER, sonra sil. Emin olmadığın bir
sınıfı SİLME, listele ve atla.

Doğrulama:
- Her silinen sınıf için: grep -n "\.<sınıf-adı>" panel.js panel.html →
  0 sonuç (silmeden ÖNCE çalıştırıp kaydet)
- TÜM tests/test_panel_*.js dosyalarını çalıştır (CSS silme davranışı
  bozmamalı ama regresyon taraması yine de yapılmalı)
- panel.html'i tarayıcıda AÇMADAN, script-tag balance kontrolünü
  (CLAUDE.md "Verification" bölümündeki yöntem) çalıştır.

Kabul kriterleri: Silinen HER sınıf için grep kanıtı (0 eşleşme) ledger
D4.1 satırının Not sütununda listelenmiş; tüm testler regresyonsuz PASS.
```

---

## Faz 5 — Doğrulama

### Prompt D5.1 — Tam regresyon + cache-bust + push/deploy

```
Bağlam: PANEL-DENETIM-MERKEZI-YENIDEN-TASARIM-PLANI.md §9 Faz 5 ve
PANEL-DENETIM-MERKEZI-LEDGER.md §4 madde 4b/5. Faz 1-4 (D1.1-D4.1)
TAMAMLANDIKTAN SONRA, bu girişimin TEK push/deploy adımı.

Görev:
1. TÜM tests/test_panel_*.js dosyalarını sırayla çalıştır, tam listeyi
   ve sonuçlarını topla.
2. node --check panel.js
3. Script-tag balance kontrolü (CLAUDE.md "Verification" bölümü).
4. grep -n "panel.js?v=\|panel.css?v=\|panelCoverageManifest.js?v="
   panel.html — bu girişim boyunca panel.js/panel.css/
   panelCoverageManifest.js içeriği değiştiyse (muhtemelen değişti,
   D1.1-D4.1 hepsi panel.js'e dokundu), `?v=` string'i D1.1'den beri
   HİÇ bump'lanmadıysa (her prompt kendi commit'inde 4b'yi uyguladıysa
   zaten güncel olmalı — kontrol amaçlı son bir doğrulama) şimdi
   bump'la.
5. `git log --oneline` ile bu girişimin TÜM commit'lerini gözden geçir,
   PANEL-DENETIM-MERKEZI-LEDGER.md'deki §2 tablosunun HEPSİNİN `done`
   olduğunu doğrula — bir tanesi `pending`/`in-progress`/`blocked` ise
   DUR, push etme.
6. `git push origin main`.
7. `gh run list --workflow=pages.yml --limit 1` ile deploy'un
   `completed`/`success` olduğunu doğrula (10 dakikayı aşan bir kuyruk
   gecikmesi olursa bu GitHub Pages servis tarafı bir durumdur, workflow
   config'i sorgulama — CLAUDE.md'de bu konuda önceden doğrulanmış bilgi
   var).
8. PANEL-DENETIM-MERKEZI-LEDGER.md'nin D5.1 satırını `done` yap, deploy
   run ID'sini yaz.

Kısıtlar: Ledger'da TEK BİR satır bile `done` değilken push ETME (madde
5). Uygulamayı tarayıcıda AÇARAK doğrulama yapma.

Doğrulama: Yukarıdaki 8 adımın hepsi.

Kabul kriterleri: Tüm test dosyaları PASS; deploy `success`; ledger'daki
TÜM 10 satır (D1.1-D5.1) `done` ve her biri gerçek commit SHA/test
özeti/tarih taşıyor.
```

---

## Uygulama Sırası Özeti

| Sıra | Prompt | Öncelik | Bağımlılık |
|------|--------|---------|------------|
| 1 | D1.1 — Bugün Ne Yapmalıyım | Kritik | Yok |
| 2 | D1.2 — Bu hafta değişenler | Kritik | Yok, D1.1 ile paralel çalıştırılabilir |
| 3 | D1.3 — Haftalık özet | Yüksek | D1.1'den sonra (aynı bölgeye ekleniyor) yapılırsa çakışma riski azalır |
| 4 | D1.4 — Aylık ısı haritası | Orta | Yok, diğerleriyle paralel çalıştırılabilir |
| 5 | D1.5 — Milestone rozetleri | Düşük efor | Yok, paralel çalıştırılabilir |
| 6 | D2.1 — Dev-mode giriş noktası | Orta | D1.1-D1.5'ten bağımsız, ama D3.1'den ÖNCE bitmeli |
| 7 | D3.1 — Birincil yüzeyden kaldırma | Kritik | D1.1-D1.5 VE D2.1 hepsi `done` olmalı |
| 8 | D3.2 — 8 test dosyası güncelleme | Yüksek efor | D3.1'den SONRA, D3.1'in FAIL listesine bağımlı |
| 9 | D4.1 — CSS temizliği | Düşük-Orta | D3.1 VE D3.2'den SONRA |
| 10 | D5.1 — Push/deploy | Kritik | Faz 1-4'ün HEPSİ `done` olmalı |

Her prompt'tan sonra ayrı commit at, böylece bir adımda sorun çıkarsa
yalnız o adım `blocked` olur, geri kalan ilerleme kaybolmaz. D1.1-D1.5 ve
D2.1 birbirinden bağımsız olduğu için FARKLI oturumlarda/ajanlarda paralel
uygulanabilir — senkronizasyon yalnızca [PANEL-DENETIM-MERKEZI-LEDGER.md](PANEL-DENETIM-MERKEZI-LEDGER.md)
§2 tablosu üzerinden sağlanır (bir ajan başlamadan önce ilgili satırın
hâlâ `pending` olduğunu görüp `in-progress`'e çevirir — bu, kilitleme
mekanizması yerine geçen basit bir "önce oku, sonra yaz" disiplinidir).
