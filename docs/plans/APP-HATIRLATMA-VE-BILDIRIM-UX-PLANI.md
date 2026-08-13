# Şeyma Uygulaması — Hatırlatma, Bildirim ve Günlük Ritüel UX Planı

**Belge türü:** Ürün ve teknik uygulama planı
**Durum:** Öneri / uygulamaya alınmayı bekliyor
**Kapsam:** Şeyma uygulamasındaki namaz vakitleri, zikir, terapi odası, Saygı, okuma ve benzeri kişisel ritüeller için hatırlatma deneyimi
**Hazırlanma amacı:** Hatırlatmaları tek tek eklenen bildirimler olmaktan çıkarıp, kullanıcının mahremiyetini, ruh hâlini ve günlük akışını gözeten bütünlüklü bir deneyime dönüştürmek
**Uygulama durumu:** Ürün planı ve session-bağımsız yürütme kiti hazırlanmıştır. Uygulama kodu, runtime test dosyası, kullanıcı veri şeması, servis worker, roadmap veya deployment davranışında reminder uygulaması henüz yapılmamıştır.
**Canlıya alma kilidi:** Kullanıcının bu konuşmada açık, güncel ve kapsamı belirli
onayı olmadan push, merge, tag, Pages deploy, dış sistem write veya canlı
doğrulaması yapılamaz. `mustafaras/seyma-data` yazımı için ayrıca açık veri
yazma izni gerekir; testlerin yeşil olması bu izinlerin yerine geçmez.

## Uygulama yürütme kiti

Bu planın session-bağımsız uygulama sözleşmesi ve anti-amnesia kontrolü
[`../reminders/README.md`](../reminders/README.md) içindedir. Ajanlar planı
uygulamaya geçerken aşağıdaki kaynakları birlikte kullanır:

- [`../reminders/APP-REMINDER-CONTEXT.md`](../reminders/APP-REMINDER-CONTEXT.md) — authority, okuma sırası, kapsam ve context bütçesi.
- [`../reminders/APP-REMINDER-STATE.json`](../reminders/APP-REMINDER-STATE.json) — makinece okunabilir aktif prompt ve blocker.
- [`../reminders/APP-REMINDER-ANTI-AMNESIA-LEDGER.md`](../reminders/APP-REMINDER-ANTI-AMNESIA-LEDGER.md) — kanıtlı canlı durum.
- [`../reminders/APP-REMINDER-PROMPTLARI.md`](../reminders/APP-REMINDER-PROMPTLARI.md) — sıralı, bağımsız ve test kapılı promptlar.
- [`../reminders/APP-REMINDER-TEST-MATRIX.md`](../reminders/APP-REMINDER-TEST-MATRIX.md) — test / acceptance gate matrisi.
- [`../reminders/APP-REMINDER-TRACEABILITY-MATRIX.md`](../reminders/APP-REMINDER-TRACEABILITY-MATRIX.md) — plan → prompt → test izlenebilirliği.
- [`../reminders/APP-REMINDER-APP-PANEL-SURFACE-MAP.md`](../reminders/APP-REMINDER-APP-PANEL-SURFACE-MAP.md) — gerçek app runtime, current panel, Panel-v2 ayrımı ve data lineage.
- [`../reminders/APP-REMINDER-APPROVAL-GATE.md`](../reminders/APP-REMINDER-APPROVAL-GATE.md) — kullanıcı onayı olmadan canlılık kilidi.
- [`../reminders/verify-reminder-context.mjs`](../reminders/verify-reminder-context.mjs) — state / ledger / prompt / link consistency doğrulaması.

Prompt listesi bu planın yerine geçmez. Plan ürün authority’sidir; promptlar
yalnız planın uygulanabilir görev diline çevrilmiş yürütme projeksiyonudur.
Plan, prompt veya test matrisi değiştiğinde izlenebilirlik matrisi ve machine
state birlikte güncellenir; checker geçmeden yeni bir prompt `ready` kabul
edilmez.

---

## 1. Yönetici özeti

Şeyma’nın mevcut yapısında namaz vakitleri, zikir, tefekkür, terapi odası, Saygı / Günün Öncüsü, okuma, günlük, su, uyku, kafein, takviye ve ÆON mesajları gibi çok sayıda değerli yüzey bulunuyor. Ancak bu yüzeyler şu anda ortak bir hatırlatma politikasına bağlı değil. Bazıları yalnızca ekranda görünen bir kart veya nudge olarak çalışıyor; bazıları bildirim izniyle ilişkili; bazıları ise ileride yapılmak üzere roadmap’te bekliyor.

Bu planın önerdiği ana fikir şudur:

> Şeyma kullanıcıyı daha çok bildirime maruz bırakan bir uygulama değil, doğru anda küçük ve anlamlı bir sonraki adımı görünür kılan sakin bir günlük eşlikçi olmalıdır.

Önerilen çözüm, bütün hatırlatmaları aşağıdaki ortak model altında toplar:

1. Kullanıcı hangi konularda hatırlatma istediğini açıkça seçer.
2. Her hatırlatma bir amaç, zaman aralığı, öncelik, sessiz saat ve erteleme davranışıyla tanımlanır.
3. Sistem günlük bildirim bütçesini, kullanıcı kapasitesini ve çakışmaları gözetir.
4. Bildirim metni mahrem bilgiyi kilit ekranına taşımaz.
5. Uygulama kapalıyken çalışabilecek yetenekler ile yalnızca uygulama açıkken güvenilir biçimde çalışabilecek yetenekler birbirinden ayrılır.
6. Hatırlatma yapılması bir başarı ölçüsü sayılmaz; kullanıcının hatırlatmayı ertelemesi, kapatması veya görmezden gelmesi de kabul edilen bir davranıştır.
7. Sağlık ve ruh sağlığı alanlarında sistem tanı, tedavi, acil müdahale veya klinik takip iddiasında bulunmaz.

İlk uygulanacak değerli çekirdek öneri:

- namaz vakti ve namaz sonrası kısa kapanış,
- zikir / tefekkür oturumu,
- terapi odasında tek küçük pratik,
- Saygı / Günün Öncüsü okuma uyarısı,
- okuma ve günlük için akşam ritüeli,
- gerektiğinde su, uyku ve ilaç / takviye gibi kullanıcı tarafından açıkça kurulan kişisel hatırlatmalar.

Bu çekirdek, daha sonra haftalık özet, özel günler, güvenli durum kontrolü ve kişiselleştirilmiş önerilerle genişletilebilir.

---

## 2. Hedef ve başarı ölçütü

### 2.1. Ürün hedefi

Hatırlatma sistemi, kullanıcının gün içinde önem verdiği davranışlara nazikçe dönmesini kolaylaştırmalıdır. Sistem:

- kullanıcının ibadet, içe dönüş, öğrenme, bakım ve bağlantı niyetlerini desteklemeli,
- ekrandaki bir sonraki adımı anlaşılır biçimde göstermeli,
- yoğun veya zor bir günde beklentiyi otomatik olarak azaltabilmeli,
- kullanıcının izinlerini ve tercihlerini kolayca geri alabilmesini sağlamalı,
- veriyi ve bildirim içeriğini mahrem tutmalı,
- “uygulamayı yeterince kullandın mı?” yerine “şu an sana ne iyi gelebilir?” sorusunu merkeze almalıdır.

### 2.2. Başarı ölçütleri

İlk sürümün başarısı yalnızca tıklama veya bildirim açma oranıyla ölçülmemelidir. Aşağıdaki ölçütler birlikte değerlendirilmelidir:

| Alan | Başarı göstergesi | Başarısızlık sinyali |
|---|---|---|
| Kontrol | Kullanıcı her kategoriyi ayrı ayrı açıp kapatabiliyor | Tek bir genel izin bütün tercihleri kontrol ediyor |
| Sakinlik | Bildirim yoğunluğu kullanıcı tarafından öngörülebiliyor | Kullanıcı bildirim bombardımanı hissediyor |
| Eyleme geçiricilik | Bildirimden hedef ekrana tek dokunuşla ulaşılabiliyor | Bildirim açılıyor ama sonraki adım belirsiz kalıyor |
| Mahremiyet | Kilit ekranında hassas konu görünmüyor | “Terapi”, “namazını kılmadın”, ruh hâli veya sağlık bilgisi ifşa oluyor |
| Güven | Sistem yalnızca gerçekten yapabildiği zamanlamayı vaat ediyor | Uygulama kapalıyken kesin çalışacakmış gibi davranıyor |
| Esneklik | Erteleme, bugün susturma, kalıcı kapatma kolay | Kullanıcı kapatmak için ayarlar içinde kayboluyor |
| Ruh sağlığı | Hatırlatma dili yargılamıyor ve suçluluk üretmiyor | Kaçırılan eylem başarısızlık olarak sunuluyor |
| Erişilebilirlik | Metin, kontrast, dokunma alanı ve ekran okuyucu akışı anlaşılır | Renk, zaman veya animasyon tek bilgi kaynağı oluyor |
| Veri güvenliği | Hatırlatma tercihleri ve günlükleri gereksiz yere dışarı çıkmıyor | Hassas tercihlerin sync veya panel verisine sızma riski oluşuyor |

### 2.3. Kapsam dışı hedefler

Bu plan aşağıdaki vaatleri yapmaz:

- uygulama kapalıyken her platformda kusursuz yerel alarm garantisi,
- ruh hâli, terapi veya ibadet davranışından otomatik klinik sonuç çıkarma,
- ilaç dozunu, tedavi planını veya sağlık kararını önerme,
- kullanıcının kişisel verisini otomatik olarak bir sağlık çalışanına veya yakına gönderme,
- namaz, zikir, okuma veya terapi hedeflerini puanlayarak manevi / psikolojik başarı skoru üretme,
- notification permission iznini kullanıcıyı ikna ederek zorla alma,
- mevcut `data.notifications` alanını bütün hatırlatmalar için kontrolsüz bir günlük olarak kullanma.

---

## 3. Mevcut ürün ve mimari durumu

Bu bölüm, planın mevcut repo gerçekliğine dayanması için hazırlanmıştır. Yeni bir özellik tasarlanırken mevcut yüzeyler yeniden icat edilmemeli; önce burada listelenen sözleşmelere oturtulmalıdır.

### 3.1. Mevcut uygulama sınırları

- Uygulama vanilla JS / HTML / CSS kullanır.
- Build step, bundler, backend veya `package.json` bulunmaz.
- GitHub Pages üzerinde statik olarak yayımlanır.
- Ana veri nesnesi `app.js` içindeki `data` yapısıdır.
- Kalıcı kullanıcı verisi `localStorage` üzerinden tutulur ve `sync.js` ile uzak veri deposuna senkronize edilebilir.
- `sw.js` PWA kurulumunu ve bildirim tıklamasını yönetir; klasik push backend’i bulunmadığı için uygulama kapalıyken genel zamanlanmış yerel bildirim garantisi mevcut değildir.
- Gerçek tarayıcıda uygulama açılarak test yapılmamalıdır. Yeni hatırlatma davranışları headless Node harness’ları ve sentetik zaman girdileri ile doğrulanmalıdır.

### 3.2. Mevcut veri ve ekran yüzeyleri

| Yüzey | Mevcut veri / davranış | Hatırlatma fırsatı | Mevcut boşluk |
|---|---|---|---|
| Namaz vakitleri | `data.settings.prayer`, günlük `prayer` kayıtları, konum / yöntem / Hicri ayarı, güncel ve sonraki vakit görünümü | Vakit öncesi hazırlık, vakit sonrası işaretleme, günlük ibadet ritmi | Ayar alanları mevcut olsa da ortak zamanlayıcı ve teslimat politikası yok |
| Zikir | `data.zikr`, oturumlar, yolculuklar, tefekkür / yansıma | Günlük kısa zikir, devam eden yolculuğa dönüş | Kullanıcı kontrollü sıklık ve erteleme merkezi yok |
| Terapi odası | `data.days[].therapy`, nefes, ilk adım, öz şefkat, karar hızlandırıcı, CBT kaydı gibi araçlar | Günlük mikro-pratik, zor gün desteği, güvenli kapanış | Terapi içeriğini ifşa etmeyen hatırlatma dili ve kapasite modu gerekiyor |
| Saygı / Günün Öncüsü | Günlük kişi, koleksiyon, okuma durumu, `readAt`, “Zihnimi Besledim” akışı | Günlük okuma için sakin çağrı, okuma sonrası kısa yansıma | Okuma kapısı ile bildirim arasında ortak kural yok |
| Okuma | `data.library`, kitap ilerlemesi, hedefler, alıntı / okuma kaydı | Okuma hedefi, uyku öncesi okuma | Her gün zorunlu hissettirmeden esnek hedef modeli gerekiyor |
| Günlük | Günlük ışığı kartı, duygu / düşünce / niyet kayıtları | Sabah check-in, akşam kapanışı, haftalık yansıma | Duygusal yoğunlukta bildirim azaltma kuralı yok |
| Su / uyku / kafein | Mevcut kartlar ve nudge’lar | Gün içi su, uykuya geçiş, kafein sınırı | Birden çok sağlık nudge’ının aynı anda çakışma riski var |
| İlaç / takviye | Uyku ilacı ve bazı ağrı kesici / takviye kayıtları; tam zamanlanmış ilaç listesi roadmap’te | Kullanıcının girdiği ilaç / takviye saatleri | Doz önerisi yapılmamalı; veri modeli ve güvenlik sınırı tamamlanmalı |
| ÆON mesajları | `data.notifications`, inbox, native bildirim, Service Worker tıklaması | Sosyal / gözlem mesajı geldiğinde uyarı | ÆON mesajı ile kişisel ritüel bildirimleri aynı bütçeye karışmamalı |
| Özel günler | Hicri dönüşüm ve mübarek gün bilgisi mevcut | Kullanıcının seçtiği kandil / özel gün hatırlatması | Varsayılanları kullanıcı adına belirlememek gerekiyor |
| Haftalık özet | Roadmap’te kısmi / planlanan yüzey | Haftalık sakin değerlendirme | Bildirim yerine kontrollü ve mahrem bir uygulama içi sunum gerekli |

### 3.3. Mevcut bildirim davranışı

Mevcut notification yapısı esas olarak ÆON mesajlarının alınması, gösterilmesi ve yinelenmemesi için kullanılır. `showInboxPopup()`, `showNativeAeonNotification()`, izin durumu ve `shownNotificationIds` gibi parçalar genel hatırlatma motoru olarak doğrudan genellenmemelidir.

Planlanan sistem bu sınırı korur:

- ÆON mesajları “gelen ileti” akışında kalır.
- Kullanıcı kurduğu ritüel ve bakım hatırlatmaları ayrı bir “reminder” alanında yönetilir.
- `data.notifications` ile zamanlanmış hatırlatmalar aynı kimlik veya deduplication kaydını paylaşmaz.
- Notification permission banner’ı her kategori için tekrar tekrar gösterilmez.
- Kullanıcı native bildirim iznini reddettiğinde uygulama içi hatırlatma merkezi çalışmaya devam eder.

---

## 4. Temel ürün ilkeleri

### 4.1. Nazik ama edilgen olmayan dil

Hatırlatma görünür olmalı; fakat emir, suçlama veya manevi değerlendirme üretmemelidir.

Kullanılacak dil:

- “İstersen şimdi kısa bir durak açabilirsin.”
- “Günün içinde sana ayırdığın küçük alan burada.”
- “Bir sonraki vakte hazırlanmak için birkaç dakikan var.”
- “Okuma yolculuğuna dönmek istersen Saygı seni bekliyor.”
- “Bugün tek bir küçük adım yeterli olabilir.”

Kaçınılacak dil:

- “Namazını hâlâ kılmadın.”
- “Bugünkü hedefini yine kaçırdın.”
- “Terapi egzersizini yapmalısın.”
- “Zikir serin bozulacak.”
- “İyi değilsin, hemen kontrol yap.”

### 4.2. Hatırlatma başarı değil, seçenek

Bir hatırlatmanın açılması veya işaretlenmesi olumlu bir seçenek olarak sunulabilir; fakat seri, puan, rozet veya streak kaybı üzerinden baskı yapılmamalıdır. Kullanıcı:

- tamamlayabilir,
- 10 / 30 / 60 dakika erteleyebilir,
- bu günü susturabilir,
- yalnızca uygulama içi göstermeyi seçebilir,
- hatırlatmayı kalıcı olarak kapatabilir.

### 4.3. Kullanıcının kapasitesine saygı

Kullanıcı gün içinde “Bugün hafif gidelim” veya “Sessiz mod” seçtiğinde sistem tüm düşük öncelikli hatırlatmaları azaltmalıdır. Zor gün verisi otomatik teşhis olarak yorumlanmamalıdır; kullanıcı seçimi ve açık etkileşim temel alınmalıdır.

Önerilen kapasite modları:

| Mod | Davranış |
|---|---|
| Dengeli | Seçili ritüeller ve bakım hatırlatmaları normal akışta çalışır |
| Hafif gün | Yalnızca kullanıcının açıkça seçtiği yüksek öncelikli hatırlatmalar kalır |
| Sessiz | Native bildirimler ve düşük öncelikli uygulama nudge’ları durur; sistem uyarıları korunur |
| Ritüel odaklı | Namaz, zikir, okuma veya seçilen tek kategori öne çıkar; diğerleri gruplanır |

### 4.4. Mahremiyet varsayılan olmalı

Bildirim ekranı başkaları tarafından görülebilir. Bu nedenle native bildirim gövdesinde aşağıdakiler yazmamalıdır:

- ruh hâli,
- terapi aracı veya terapi içeriği,
- ilaç adı veya doz bilgisi,
- namazın kılınıp kılınmadığı,
- kişisel not veya günlük metni,
- özel kişi / ilişki detayı,
- hassas profil veya sağlık bilgisi.

Kilit ekranı için güvenli genel metinler kullanılmalı; detay hedef ekranda ve uygulama açıldıktan sonra gösterilmelidir.

### 4.5. Gerçek yetenek ile vaat ayrımı

Statik PWA yapısında uygulama tamamen kapalıyken arbitrary local schedule garantisi verilemez. Planın her ekranı şu yetenek durumlarından birini dürüstçe göstermelidir:

1. **Uygulama açıkken güvenilir:** Foreground scheduler ve uygulama içi kart.
2. **İzin verilmişse mümkün:** Browser / PWA native notification.
3. **Bu kurulumda desteklenmiyor:** Uygulama kapalıyken kesin zamanlı yerel alarm.
4. **Gelecek altyapı ile mümkün olabilir:** Gerçek push backend’i veya native uygulama entegrasyonu.

---

## 5. Hatırlatma bilgi mimarisi

### 5.1. Hatırlatma kategorileri

Tüm öneriler aşağıdaki kategorilerden birine bağlanmalıdır:

| Kategori | Amaç | Örnekler | Varsayılan yaklaşım |
|---|---|---|---|
| `ritual` | Kullanıcının anlam verdiği ritüellere dönüş | Namaz, zikir, tefekkür, Saygı okuması, okuma | Açıkça seçilmeden native bildirim yok |
| `care` | Günlük beden ve enerji bakımını desteklemek | Su, uyku hazırlığı, yemek, hareket, kafein | Uygulama içi nudge; native isteğe bağlı |
| `reflection` | İç gözlem ve gün kapatma | Günlük, duygu check-in, haftalık özet, şükür | Akşam için en fazla bir ana davet |
| `support` | Terapi odası ve zor anlarda küçük destek | Nefes, öz şefkat, ilk adım, güvenli kapanış | Kullanıcı seçimi + düşük frekans |
| `health` | Kullanıcının kendisinin kurduğu sağlık takibi | İlaç, takviye, doktor randevusu notu | Açık kurulum ve net güvenlik uyarısı |
| `special` | Kullanıcının seçtiği özel gün veya dönem | Kandil, Hicri gün, kişisel yıldönümü | Seçime dayalı, sessiz ve seyrek |
| `system` | Uygulamanın güvenilir çalışması | Stale prayer cache, sync error, izin durumu | Sadece eylem gerektirdiğinde göster |
| `social` | ÆON / gözlem akışından gelen ileti | Yeni mesaj, cevap veya observer sonucu | Mevcut inbox akışı; ritüel bütçesinden ayrı |

### 5.2. Öncelik sınıfları

Öncelik, “ne daha değerli?” anlamına değil, çakışma olduğunda hangi hatırlatmanın önce gösterileceğine işaret etmelidir.

| Seviye | Anlam | Örnek | Sessiz saat davranışı |
|---|---|---|---|
| `P0` | Uygulamanın güvenilirliği veya kullanıcının açıkça beklediği zorunlu sistem durumu | Veri senkron hatası, izin veya stale veri uyarısı | Yalnızca eylem gerçekten gerekli olduğunda; gereksiz tekrar yok |
| `P1` | Kullanıcının açıkça zaman kurduğu kişisel hatırlatma | Kullanıcının kurduğu ilaç saati, seçilmiş namaz offset’i | Kullanıcı ayarına göre; varsayılan olarak sessiz saati ihlal etmez |
| `P2` | Seçili ritüel veya bakım daveti | Zikir, terapi mikro-pratiği, Saygı okuması | Sessiz saatte ertelenir veya uygulama içine düşer |
| `P3` | İlham, keşif ve düşük aciliyetli öneri | Alıntı, haftalık öneri, yeni içerik | Native bildirim varsayılan olarak kapalı |

### 5.3. Bir hatırlatmanın kanonik parçaları

Her tanım aşağıdaki kavramları taşımalıdır:

- **Kimlik:** Sabit ve okunabilir `reminderId`.
- **Kategori:** `ritual`, `care`, `reflection`, `support`, `health`, `special`, `system`, `social`.
- **Amaç:** Kullanıcıya hangi küçük eylemi teklif ettiği.
- **Tetikleyici:** Sabit saat, namaz vakti offset’i, uygulama açılışı, günün bölümü, tamamlanmama, haftalık takvim veya sistem durumu.
- **Zaman aralığı:** Tek bir dakikaya mahkûm olmayan earliest / latest penceresi.
- **Öncelik:** Çakışma çözümünde kullanılacak seviye.
- **Hedef:** `faith`, `zikr`, `room`, `saygi`, `reading`, `gunluk`, `settings` gibi deep-link.
- **Görüntüleme kanalı:** Uygulama içi kart, banner, native notification veya özet.
- **Mahrem metin:** Kilit ekranında kullanılabilecek genel metin.
- **Detay metni:** Yalnızca uygulama içinde gösterilecek açıklama.
- **Susturma kuralları:** Tamamlandıysa, bugün sessiz moddaysa, aynı kategori yakın zamanda gösterildiyse veya başka hatırlatmayla gruplanabiliyorsa davranış.
- **Erteleme seçenekleri:** 10, 30, 60 dakika, bu akşam, yarın veya kapat.
- **Frekans:** Günlük, haftalık, vakit bazlı, tek seferlik veya sistem olayı.
- **Sürüm:** Metin ve davranış değişikliğinin izlenebilmesi için tanım sürümü.

---

## 6. Hatırlatma Merkezi deneyimi

Hatırlatmaların ana yönetim yüzeyi `Ayarlar > Hatırlatmalar ve bildirimler` altında tek bir merkez olmalıdır. Her özellik kendi ekranında hızlı bir aç / kapat kontrolü taşıyabilir; fakat bütün ayarlar merkezi görünümde de bulunmalıdır.

### 6.1. Üst bölüm: durum özeti

Hatırlatma Merkezi açıldığında kullanıcı önce şunları görmelidir:

- bugünün modu: Dengeli / Hafif gün / Sessiz / Ritüel odaklı,
- bugün kalan önerilen hatırlatma sayısı,
- native bildirim izni durumu,
- sessiz saat aralığı,
- günlük native bildirim bütçesi,
- “Bugün tümünü sustur” kısa eylemi,
- “Önizleme bildirimi gönder” test eylemi.

Örnek durum metni:

> Bugün 2 sakin hatırlatma planlandı. Bildirimler 22:30–07:30 arasında sessizde.

### 6.2. Hazır profiller

Kullanıcıyı çok sayıda anahtarla karşılamamak için hazır profiller sunulabilir:

| Profil | İçerik |
|---|---|
| Sakin | Yalnızca uygulama içi günlük kartları; native bildirim kapalı |
| Dengeli | Kullanıcının seçtiği ritüeller için sınırlı native bildirim; bakım önerileri uygulama içinde |
| Destekleyici | Dengeli’ye ek olarak seçili terapi / günlük / uyku davetleri |
| Ritüel odaklı | Kullanıcının seçtiği ibadet veya okuma kategorisi ağırlıklı |
| Özel | Her kategori ve zaman aralığı kullanıcı tarafından belirlenir |

Profil seçimi mevcut tercihleri silmemeli; yalnızca bir başlangıç önerisi uygulamalıdır. Kullanıcı “Özel”e geçince hangi alanların değiştiği açıklanmalıdır.

### 6.3. Kategori kartı

Her kategori kartı aşağıdaki bilgileri tek bakışta göstermelidir:

- kategori adı ve sakin ikon,
- açık / kapalı durumu,
- bugün kaç kez gösterileceği,
- kanal: uygulama içi / native / yalnızca özet,
- zaman penceresi,
- “düzenle” ve “bugün sustur” eylemleri.

Örnek:

> Zikir ve tefekkür · Açık
>
> Her gün 1 kısa davet · 20:30–21:30
> Uygulama içi + native izin verilirse

### 6.4. Ayrıntı ekranı

Bir hatırlatmanın ayrıntı ekranında şu sıralama izlenmelidir:

1. Ne için olduğunu açıklayan tek cümle.
2. Aç / kapat anahtarı.
3. Zaman veya tetikleyici seçimi.
4. Hatırlatmadan ne kadar önce / sonra gösterileceği.
5. Kanal seçimi.
6. Sessiz saat davranışı.
7. Erteleme seçenekleri.
8. Örnek bildirim önizlemesi.
9. “Bu hatırlatmayı bugün sustur” eylemi.
10. En altta kalıcı kapatma ve veri temizleme seçenekleri.

### 6.5. İlk kullanım akışı

İlk açılışta browser notification izni istenmemelidir. Bunun yerine:

1. Kullanıcı kısa bir “Gün içinde neleri hatırlamamı istersin?” seçimi görür.
2. En fazla üç başlangıç kategorisi seçer.
3. Sistem her seçim için önerilen sıklığı gösterir.
4. Kullanıcı ilk native kanal açma eylemine bastığında izin açıklaması gösterilir.
5. Kullanıcı kabul ederse browser / PWA izin istemi tetiklenir.
6. Reddederse uygulama içi kartlar açık kalır; tekrar tekrar izin istenmez.

İzin açıklaması teknik değil, sonuç odaklı olmalıdır:

> Şeyma’nın uygulama kapalıyken her saati garanti edemediğini bilerek, seçtiğin küçük durakları uygun olduğunda cihaz bildirimleriyle hatırlatabilirsin. İstediğin zaman kapatabilirsin.

### 6.6. Bildirim izin durumları

Kullanıcıya belirsiz bir “bildirimler çalışmıyor” mesajı gösterilmemelidir. Aşağıdaki durumlar ayrı anlatılmalıdır:

| Durum | Kullanıcıya gösterilecek anlam | Eylem |
|---|---|---|
| Desteklenmiyor | Bu tarayıcı native bildirim sunmuyor | Uygulama içi hatırlatmaları kullan |
| Henüz sorulmadı | Native bildirim izni henüz seçilmedi | İzin açıklamasını aç |
| Verildi | Native kanal kullanılabilir | Test bildirimi / ayarları yönet |
| Reddedildi | Tarayıcı izni kapalı | Tarayıcı ayarlarını açma rehberi |
| Geçici hata | Bildirim gönderme anında başarısız oldu | Yeniden dene; uygulama içi kartı koru |
| PWA sınırlaması | Uygulama kapalıyken zamanlama garanti edilemiyor | Uygulamayı açınca catch-up kartı göster |

---

## 7. Önerilen hatırlatma katalogu

Aşağıdaki katalog, kullanıcı tarafından söylenen konuların ötesine geçen ve Şeyma’nın mevcut yüzeyleriyle uyumlu olabilecek konuları toplar. Her satır doğrudan uygulanacak özellik değil; ürün önceliklendirmesinde kullanılacak aday tanımdır.

### 7.1. Namaz vakitleri ve iman köşesi

#### Önerilen hatırlatmalar

1. **Vakit öncesi hazırlık:** Kullanıcının ayarladığı offset ile, örneğin 10 / 20 / 30 dakika önce.
2. **Vakit başlangıcı:** Yalnızca kullanıcı açıkça seçtiyse.
3. **Vakit sonrası nazik kapanış:** “İstersen vakti günlüğüne işaretleyebilirsin.”
4. **Gün sonu eksik kayıt özeti:** “Bugünün ibadet kaydını tamamlamak ister misin?”; asla “kaçırdın” dili kullanılmaz.
5. **Cemaat / nafile / not alanı hatırlatması:** Kullanıcı bu alanları kullanıyorsa, otomatik hedef üretmeden yalnızca kaydı kolaylaştıran uygulama içi eylem.
6. **Hicri özel gün:** Kullanıcının seçtiği kandil veya özel günlerde, önceden belirlenmiş sınırlı bir bildirim.
7. **Konum / vakit verisi tazeliği:** Vakit verisi stale olduğunda ritüel hatırlatması üretmek yerine önce verinin güncellenmesi gerektiği açıklanır.

#### UX kuralları

- Varsayılan olarak her beş vakit için native bildirim açılmamalıdır.
- Kullanıcı “yalnızca sonraki vakit” veya “günde en fazla iki vakit” seçebilmelidir.
- Vakitler konum ve yöntem değiştiğinde yeniden hesaplanmalı; eski zamanlara dayalı bildirimler iptal edilmelidir.
- Vakit ile zikir veya günlük hatırlatması çakışırsa tek bir gruplanmış kart gösterilebilir.
- Namazın kılınıp kılınmadığı kilit ekranında veya notification başlığında gösterilmemelidir.

#### Örnek metinler

- Kilit ekranı: “Günün içinde küçük bir durak için vakit yaklaşıyor.”
- Uygulama içi detay: “İman Köşesi’nden bu vakti, notunu veya nafile kaydını açabilirsin.”
- Vakit sonrası: “İstersen bu anı sakince işaretleyebilirsin; işaretlememek de sorun değil.”

### 7.2. Zikir ve tefekkür

#### Önerilen hatırlatmalar

1. Kullanıcının seçtiği günlük zikir hedefi için tek bir kısa davet.
2. Devam eden zikir yolculuğuna, kullanıcının seçtiği gün / saat penceresinde dönüş.
3. Zikir oturumu sonrası tefekkür notu için isteğe bağlı kapanış.
4. Uzun süre açılmayan bir yolculuk için haftada en fazla bir “dönmek istersen” önerisi.
5. Namaz sonrası zikir seçilmişse, namaz sonrası uygun zaman penceresinde gruplanmış ritüel kartı.

#### UX kuralları

- Zikir serisi bozulması, kayıp hedef veya başarısızlık dili kullanılmamalı.
- Sayaç tamamlanmasa bile oturum “başladı” veya “kısa durak” olarak kaydedilebilmeli.
- Bildirim, belirli bir dini uygulamayı doğru / yanlış ilan etmemeli.
- Tefekkür metni native notification’a asla taşınmamalı.
- Kullanıcı yalnızca uygulama içi kart seçerse native izin istemi açılmamalı.

#### Örnek metinler

- “İstersen birkaç dakikalık bir zikir durağı açabilirsin.”
- “Bugün yolculuğuna küçük bir adımla dönmek ister misin?”
- “Oturumun ardından bir cümlelik tefekkür alanı hazır.”

### 7.3. Terapi odası

Terapi odası, bildirim sistemi açısından en hassas yüzeydir. Hatırlatma, kullanıcıyı “terapiye çağıran” veya ruh hâlini değerlendiren bir otorite gibi davranmamalıdır.

#### Önerilen hatırlatmalar

1. Kullanıcının seçtiği nefes pratiği için kısa, günlük veya haftada birkaç kez davet.
2. “İlk adım” aracına, ertelemesi uzun süren bir niyet varsa haftada bir sakin dönüş.
3. Kullanıcının manuel seçtiği öz şefkat pratiği.
4. Günlük kapanışında “Bugün kendine daha yumuşak davranmak ister misin?” seçeneği.
5. Kullanıcı uygulama içinden “şimdi desteğe ihtiyacım var” dediğinde, doğrudan terapi odası araçlarına giden görünür ama native olmayan destek kartı.
6. Güvenlik / kriz akışında, otomatik teşhis yerine açık güvenlik kaynakları ve kullanıcının kendi belirlediği destek kişisi / kaynaklarına erişim.

#### UX kuralları

- Native başlıkta “Terapi” kelimesi varsayılan olarak kullanılmamalı; kullanıcı görünürlük tercihiyle bunu değiştirebilmeli.
- CBT notu, duygu puanı, kriz ifadesi veya hassas metin bildirim içeriğine konmamalı.
- Zor gün sinyali varsa hatırlatma sıklığı artırılmamalı; varsayılan davranış azaltmak veya durdurmak olmalı.
- Bir terapi pratiği tamamlanmadığında yeni bildirim otomatik çoğalmamalı.
- Sistem klinik yardımın yerine geçmediğini uygun bağlamda açıkça belirtmeli.

#### Örnek metinler

- Kilit ekranı: “Şeyma’da sana ayırabileceğin sakin bir alan var.”
- Uygulama içi detay: “İstersen nefes, ilk adım veya öz şefkat araçlarından birini seç.”
- Sessiz gün: “Bugün hatırlatmaları hafiflettik. İstersen yalnızca bir küçük pratik açabilirsin.”

### 7.4. Saygı / Günün Öncüsü

#### Önerilen hatırlatmalar

1. Kullanıcının seçtiği zaman aralığında Günün Öncüsü okuma daveti.
2. Gün içinde okunmamışsa, aynı gün yalnızca bir kez “bugünlük kapanış” daveti.
3. Okuma tamamlandıysa “Zihnimi Besledim” kaydı için isteğe bağlı uygulama içi kapanış.
4. Kişi değişimi veya Wikipedia içeriği yüklenemediğinde, hatırlatma yerine veri durumu uyarısı.
5. Kullanıcının koleksiyon hedefi varsa, haftalık sakin özet.

#### UX kuralları

- “Okumadın” veya “günü kaçırdın” mesajı kullanılmamalı.
- Okuma kapısı `Okudum` eylemini engelleyen bir zorunluluğa dönüşmemeli.
- Dış kaynak / Wikipedia içeriği yüklenmemişse sistem okundu gibi işaretlememeli.
- Native bildirimde kişinin adı, makale başlığı veya hassas bağlam kullanıcı seçmedikçe görünmemeli.

#### Örnek metinler

- “Bugünün ilham durağı hazır; birkaç dakikan varsa açabilirsin.”
- “İstersen bugünkü kişiyi okumayla kapatabilirsin.”
- “Okuma sonrası zihnini besleyen tek cümleyi saklamak ister misin?”

### 7.5. Okuma ve öğrenme

#### Önerilen hatırlatmalar

1. Kullanıcının kitabı için haftalık veya seçili günlerde okuma penceresi.
2. Uyku öncesi okuma hedefi; uyku saatinden önce ve yalnızca seçildiyse.
3. Kaldığı sayfaya dönme daveti.
4. Haftalık okuma ilerlemesi ve alıntı arşivi özeti.
5. Uzun süre kullanılmayan kitap için en fazla haftada bir keşif önerisi.

#### UX kuralları

- Günlük kitap hedefi zorunlu veya seri kaybı üzerinden baskılı olmamalı.
- Okuma hatırlatması, uykuya geçiş penceresinde terapi / zikir / su gibi diğer düşük öncelikli önerilerle çakışırsa birleştirilmeli.
- İçerik gövdesi native bildirime konmamalı; uygulama içinde gösterilmeli.

### 7.6. Günlük, duygu check-in ve haftalık yansıma

#### Önerilen hatırlatmalar

1. Sabah tek dokunuşlu “Bugün nasıl başlamak istiyorsun?” check-in’i.
2. Akşam tek bir “Günlük Işığı” kapanış daveti.
3. Kullanıcının seçtiği duygu / niyet alanını tamamlamaya yönelik uygulama içi nudge.
4. Haftada bir, gün ve saat seçilebilir yansıma özeti.
5. Özel bir günün yıldönümü için yalnızca kullanıcı kurduysa hatırlatma.

#### UX kuralları

- Aynı gün hem sabah hem akşam check-in varsayılan olarak native gönderilmemeli; biri uygulama içi olabilir.
- Duygu düşüklüğünden otomatik olarak alarm veya sıklaştırılmış bildirim çıkarılmamalı.
- Haftalık özet yalnızca kullanıcının kendi cihazında / uygulama içinde gösterilmeli; native bildirime özet metni yazılmamalı.
- Kullanıcı bir gün kayıt girmediyse sistem “eksik veri” uyarısı üretmemeli.

### 7.7. Su, yemek, hareket, kafein ve uyku

Bu alanlar önemli olmakla birlikte bildirim yorgunluğunun en hızlı oluşabileceği alandır. Sistem bütün sağlıklı davranışları aynı gün hatırlatmaya çalışmamalıdır.

#### Önerilen model

- Kullanıcı en fazla iki bakım kategorisini native kanal için seçer.
- Su için sabit aralık yerine uyanıklık penceresinde gruplanmış en fazla 3 nudge önerilir.
- Kafein için uyku saatine bağlı tek bir kapanış uyarısı yeterlidir.
- Uyku için “hazırlık penceresi” ve “ekranı azaltma” gibi kullanıcı seçimine dayalı tek bir ritüel kullanılır.
- Hareket / esneme yalnızca kullanıcı seçerse ve sessiz saat dışında çalışır.
- Yemek hatırlatması tıbbi öneri gibi sunulmaz; kullanıcı kendi rutinini girerse basit zaman hatırlatıcısı olarak çalışır.

#### Örnek metinler

- “Küçük bir su molası iyi gelebilir.”
- “Uykuya yaklaşırken günü yavaşlatmak ister misin?”
- “Kafein kapanış penceren geldi; seçtiğin takibe göz atabilirsin.”

### 7.8. İlaç ve takviye

Bu alan ancak güvenlik sözleşmesi netleştirildikten sonra uygulanmalıdır.

#### Güvenli kapsam

- Kullanıcı ilaç / takviye adını, zamanını ve kendi notunu kendisi girer.
- Sistem yalnızca kullanıcının kurduğu saati hatırlatır.
- Doz önerisi, ilaç etkileşimi, tedavi kararı veya “almalısın” ifadesi üretilmez.
- Hatırlatma metni kullanıcı isterse genel, varsayılan olarak mahrem olmalıdır.
- Silme, düzenleme, bugün susturma ve “doktoruma sor” gibi not alanları kullanıcı kontrolündedir.
- Bir doz atlandıysa sistem otomatik olarak ikinci bir doz önermez; yalnızca kullanıcının seçtiği “sonra hatırlat” davranışını uygular.

#### Açık güvenlik metni

> Bu özellik yalnızca senin girdiğin zamanı hatırlatır; doz, tedavi veya tıbbi karar önermez. Sağlıkla ilgili kararlar için doktorunun veya eczacının yönlendirmesini takip et.

#### Öncelik

İlaç / takviye hatırlatmaları, kullanıcı açıkça kurduysa `P1` olabilir; ancak sessiz saatleri otomatik aşmamalı ve cihaz / PWA sınırı açıkça belirtilmelidir.

### 7.9. Özel günler ve Hicri takvim

Özel günler, kullanıcının inancı ve kişisel bağlamı nedeniyle kişiselleştirilmelidir.

- Hicri tarih ve mübarek gün bilgisi uygulama içinde görünür olabilir.
- Native özel gün bildirimleri varsayılan olarak kapalı tutulabilir.
- Kullanıcı tüm özel günler, yalnızca seçilen günler veya hiçbiri arasında seçim yapmalıdır.
- Hatırlatma öncesinde “yerel hilal farkı / Hicri offset” ayarının sonucu kullanıcıya anlaşılır biçimde açıklanmalıdır.
- Özel gün bildirimi ticari, puanlayıcı veya zorunluluk dili taşımamalıdır.

### 7.10. ÆON mesajları ve sistem durumları

ÆON mesajları sosyal / gözlem akışıdır; kişisel ritüel akışına karıştırılmamalıdır.

- ÆON gelen kutusu kendi bildirim geçmişini ve deduplication mantığını korur.
- Kullanıcı sosyal bildirimlerini ritüel bildirimlerinden bağımsız susturabilir.
- Sync hatası, stale vakit verisi veya izin değişimi yalnızca kullanıcı eylem yapabileceği zaman gösterilir.
- Teknik hata metni kullanıcıyı korkutmamalı; ancak verinin tazeliği ve olası etkisi dürüstçe belirtilmelidir.

---

## 8. Hatırlatma motoru için önerilen davranış modeli

Bu bölüm uygulama kodu değil, gelecekteki uygulamanın davranış sözleşmesidir.

### 8.1. Kavramsal veri tipleri

İleride tanımlanacak alanlar birbirinden ayrılmalıdır:

#### `ReminderDefinition`

Ürün tarafından sağlanan sabit tanım:

- `id`
- `category`
- `priority`
- `titleKey`
- `privateTitleKey`
- `bodyKey`
- `deepLink`
- `triggerType`
- `defaultWindow`
- `defaultChannel`
- `snoozeOptions`
- `suppressionRules`
- `definitionVersion`

#### `ReminderPreference`

Kullanıcının tercihi:

- `enabled`
- `daysOfWeek`
- `timeWindow`
- `offsetMinutes`
- `channel`
- `quietHoursBehavior`
- `maxPerDay`
- `snoozeOptions`
- `privacyMode`
- `lastEditedAt`

#### `ReminderOccurrence`

Belirli bir gün / vakit için deterministik oluşum:

- `reminderId`
- `occurrenceId`
- `localDate`
- `scheduledAt`
- `timezone`
- `sourceRevision`
- `priority`

#### `ReminderDelivery`

Teslimatın cihaz içindeki sonucu:

- `occurrenceId`
- `channel`
- `status`: `scheduled`, `shown`, `opened`, `snoozed`, `dismissed`, `suppressed`, `failed`
- `shownAt`
- `actedAt`
- `reason`

#### `SuppressionContext`

O anki bağlam:

- `quietHours`
- `todayMode`
- `dailyBudgetRemaining`
- `recentCategoryDeliveries`
- `completedSignals`
- `staleDataSignals`
- `permissionState`
- `visibilityState`

### 8.2. Yerel ve senkronlanan verinin ayrılması

Mahremiyet ve mevcut full-replace sync davranışı nedeniyle önerilen varsayılan ayrım:

| Veri | Varsayılan saklama | Gerekçe |
|---|---|---|
| Hatırlatma tanımları | Kod / sabit katalog | Kullanıcı verisi değil |
| Kategori tercihleri | Cihaz yerelinde ayrı bir `localStorage` anahtarı | Hassas rutin ve izin bilgisi gereksiz yere sync’e çıkmasın |
| Browser permission durumu | Cihaz yerelinde | Tarayıcıya özgü ve cihaz bağımlı |
| Günlük bütçe / son gösterim | Cihaz yerelinde | Aynı bildirimin iki cihazda çakışmasını önlemek ve mahremiyeti korumak |
| Kullanıcının uygulama içi tamamlamaları | Mevcut `data` alanları | Zaten günlük yaşam verisinin parçası |
| ÆON `data.notifications` | Mevcut ayrı yapı | Sosyal / gözlem mesajlarıyla uyumluluk |
| Native notification gövdesi | Kalıcı kayda yazılmaz | Hassas metin sızıntısını önlemek |
| Hatırlatma geçmişi | Kısa, cihaz yerel log | Debug ve kullanıcı geçmişi için; gereksiz büyümeyi önlemek |

İleride cihazlar arası tercih senkronu istenirse bu, varsayılan davranış değil açık bir “cihazlar arasında hatırlatmalarımı senkronize et” seçeneği olmalıdır. Bu seçenek devreye alınmadan önce `sync.js` sanitize sözleşmesi, veri deposunun mahremiyet modeli ve çakışma davranışı ayrıca onaylanmalıdır.

### 8.3. Foreground scheduler

Mevcut statik PWA için güvenilir ilk teknik yaklaşım foreground scheduler’dır. Planlanan kontrol noktaları:

- uygulama açılışı,
- `visibilitychange`,
- `focus`,
- `pageshow`,
- kullanıcı eylemi sonrası,
- uygulama açıkken sınırlı aralıkla çalışan timer,
- ağ geri geldiğinde sistem durumunun yeniden değerlendirilmesi.

Her kontrolde sistem:

1. Geçerli tarih, saat dilimi ve yaz / kış saati durumunu okur.
2. Namaz vakitleri ve veri tazeliğini kontrol eder.
3. Aktif `ReminderDefinition` ve kullanıcı tercihlerinden oluşumları hesaplar.
4. Sessiz saat, gün modu, günlük bütçe ve tamamlanma sinyallerini uygular.
5. Aynı `occurrenceId` daha önce teslim edilmişse yeniden göstermez.
6. Uygulama kapalıyken kaçırılmış oluşumları “geçmiş bildirim spam’i” olarak değil, bugünün sakin bir catch-up kartı olarak özetler.

### 8.4. Deterministik kimlik ve tekrar engelleme

Bir hatırlatma için deduplication kimliği aşağıdaki bileşenlerden türetilmelidir:

`reminderId + localDate + scheduledAt + timezone + definitionVersion`

Aynı gün içindeki erteleme, yeniden açılış veya timer tekrarları yeni bildirim oluşturmamalıdır. Tanım sürümü değiştiğinde eski oluşumlar yanlışlıkla yeniden tetiklenmemeli; migrasyon kuralı açıkça belirtilmelidir.

### 8.5. Çakışma ve gruplayabilme

Aynı zaman penceresinde birden fazla düşük öncelikli hatırlatma oluşursa:

- aynı kategori içindekiler tek kartta gruplanır,
- farklı kategorilerden en fazla bir ana davet seçilir,
- kalanlar “Bugün sana ayrılan diğer küçük duraklar” bölümüne taşınır,
- native kanalda yalnızca tek bir özet bildirimi gösterilir,
- P1 kullanıcı tarafından kurulmuş bir saat ile P2 öneri çakışırsa P1 öne çıkar.

Örnek:

> Akşam için iki küçük durak hazır:
>
> - kısa zikir
> - birkaç sayfa okuma

### 8.6. Günlük bildirim bütçesi

Başlangıç için önerilen varsayılanlar:

- native bildirim: günde en fazla 3,
- düşük öncelikli native bildirim: günde en fazla 1,
- aynı kategori: 6 saat içinde en fazla 1 native bildirim,
- uygulama içi kart: aynı gün yeniden görünür olabilir ancak aynı kopya tekrar tekrar öne çıkarılmamalı,
- ÆON sosyal bildirimleri: ayrı bütçe, fakat global “sessiz gün” tercihine uyar.

Bu değerler sabit ürün gerçeği değil, ilk UX denemesi için güvenli başlangıç değerleridir. Kullanıcı “daha az” veya “daha fazla” seçebilir; “sınırsız” seçeneği önerilmemelidir.

### 8.7. Sessiz saatler

Varsayılan olarak 22:30–07:30 gibi bir aralık önerilebilir; fakat ilk kurulumda kullanıcıya gösterilmeli ve yerel yaşam düzenine göre değiştirilebilmelidir.

Sessiz saat davranışları:

- ertele ve sabah yeniden sun,
- yalnızca uygulama içinde göster,
- tamamen bugün sustur,
- kullanıcının açıkça kurduğu bazı P1 hatırlatmalar için istisna.

İstisna seçeneği her kullanıcı için otomatik açılmamalıdır.

### 8.8. Catch-up davranışı

PWA kapalıyken zamanında bildirim verilemeyebilir. Uygulama yeniden açıldığında:

- kaçırılan her uyarı tek tek gösterilmemeli,
- son 24 saatten yalnızca anlamlı ve hâlâ geçerli olanlar özetlenmeli,
- eski namaz / ilaç / özel saat uyarıları “kaçırdın” diliyle gösterilmemeli,
- kullanıcıya “Bugün için kalanları yeniden düzenle” seçeneği sunulmalı,
- geçmiş oluşumlar tekrar native bildirim olarak kuyruğa alınmamalı.

---

## 9. Bildirim ve uygulama içi kart tasarımı

### 9.1. Kanal hiyerarşisi

Hatırlatmanın kanalı önceliği şöyle olmalıdır:

1. Uygulama açık ve görünürse bağlam içi kart / toast.
2. Uygulama açık ama başka sekmede ise sakin banner veya inbox.
3. Native izin verilmiş ve bütçe uygunsa native notification.
4. Uygulama kapalıysa yalnızca platformun gerçekten desteklediği kanal; destek yoksa garanti iddiası yok.

### 9.2. Native bildirim yapısı

Native bildirimin ideal biçimi:

- genel ve mahremiyet güvenli başlık,
- tek cümlelik seçenek dili,
- tek ana eylem: “Aç”,
- ikincil eylem: “10 dk ertele” veya “Bugün sustur”,
- düşük öncelikli içerikte ses / titreşim varsayılan olarak kapalı veya kullanıcının sistem tercihine bağlı,
- `renotify: false` benzeri tekrar azaltma davranışı,
- deep-link ile doğrudan doğru ekrana geçiş.

### 9.3. Güvenli metin tasarımı

| Hassas içerik | Güvenli native metin | Uygulama içi detay |
|---|---|---|
| Namaz | “Günün içinde küçük bir durak yaklaşıyor.” | Vakit, kalan süre ve İman Köşesi eylemleri |
| Zikir | “Kısa bir sakinlik alanı hazır.” | Zikir seçimi ve sayaç |
| Terapi | “Şeyma’da sana ayırabileceğin bir alan var.” | Nefes, ilk adım, öz şefkat araçları |
| Saygı | “Bugünün ilham durağı hazır.” | Kişi, okuma ve `Okudum` akışı |
| İlaç | “Kurduğun kişisel hatırlatma zamanı geldi.” | Kullanıcı adı / notu, kendi girdiği bilgi |
| Günlük | “Günü kapatmak için küçük bir alan var.” | Duygu, düşünce ve niyet alanı |
| Sistem | “Şeyma’da ilgilenmen gereken bir durum var.” | Stale veri, sync veya izin açıklaması |

### 9.4. Uygulama içi hatırlatma kartı

Kartlar şu yapıyı izlemelidir:

- ikon + kategori etiketi,
- sıcak ama kısa başlık,
- bir cümlelik bağlam,
- birincil eylem,
- “ertele”, “bugün sustur”, “kapat” menüsü,
- kartın neden göründüğünü açıklayan erişilebilir yardımcı metin.

Kartın ana rengi yalnızca kategori rengiyle ayırt edilmemeli; ikon, başlık ve metin de anlam taşımalıdır. Light / dark temada yeni token’lar ayrı ayrı kontrast doğrulamasından geçmelidir.

### 9.5. Erteleme menüsü

Her hatırlatma aynı erteleme seçeneklerine sahip olmak zorunda değildir. Başlangıçta:

- 10 dakika,
- 30 dakika,
- 1 saat,
- bu akşam,
- yarın,
- bugün bir daha gösterme,
- bu hatırlatmayı kapat.

İlaç ve namaz gibi zamana bağlı konularda “bu akşam” seçeneği yalnızca semantik olarak anlamlıysa sunulmalıdır. Yanlış eylem seçenekleri güveni azaltır.

---

## 10. Günlük deneyim akışı

### 10.1. Sabah

Sabah akışının amacı kullanıcıyı yeni bir görev listesine boğmak değil, günün tonunu seçmesini sağlamaktır.

Önerilen akış:

1. Günün kısa selamlaması.
2. İsteğe bağlı tek dokunuşlu duygu / niyet check-in’i.
3. Bugünün seçili ritüeli veya yaklaşan ilk vakit.
4. Kullanıcının dünkü açık kalan kayıtları varsa yalnızca uygulama içinde kısa özet.
5. Native bildirim gönderilecekse en fazla bir P1 / P2 daveti.

### 10.2. Gün içi

Gün içi sistem, vakitleri ve kullanıcının seçtiği tek / iki bakım alanını gözetir. Aynı saat içinde su, zikir, okuma ve terapiyi ayrı ayrı göstermek yerine “Bugün için küçük duraklar” başlığı altında sıralamalıdır.

### 10.3. Akşam

Akşam, çok sayıda tamamlanmamış görevin listelendiği bir “borç ekranı” olmamalıdır. Önerilen akış:

- tek bir Günlük Işığı veya tefekkür daveti,
- kullanıcının seçtiği zikir / okuma ritüeli,
- uykuya hazırlık için en fazla bir bakım uyarısı,
- günün tamamlanmamış öğelerini isterse görme seçeneği.

### 10.4. Zor gün akışı

Kullanıcı “bugün hafif” modunu seçtiğinde:

- native P2 / P3 bildirimleri durur,
- uygulama içinde yalnızca bir “tek küçük adım” kartı kalır,
- terapi odası hızlı giriş sunar fakat kullanıcıyı oraya zorlamaz,
- streak, hedef ve başarısızlık metinleri gizlenir,
- kullanıcı daha sonra normal moda dönebilir.

---

## 11. Kişiselleştirme ve öneri politikası

### 11.1. İlk kurulumda sorulacak minimum sorular

Kullanıcıdan uzun profil alınmamalıdır. Başlangıç için:

1. Hangi konularda hatırlatma istersin? En fazla üç seçim.
2. Hangi saatler senin için sessiz / uygun?
3. Native bildirim mi, uygulama içi kart mı, ikisi mi?
4. Günlük en fazla kaç native bildirim kabul edersin?
5. “Hafif gün” modunu hızlı erişimde tutmak ister misin?

Namaz, ilaç veya uyku gibi daha özel ayarlar ancak kullanıcı ilgili kategoriyi açtığında sorulmalıdır.

### 11.2. Uyarlanabilirlik sınırı

İleride davranış verisine göre öneri yapılabilir; ancak sistem:

- terapi notlarını analiz ederek sıklık artırmamalı,
- düşük ruh hâlini klinik sinyal gibi sınıflandırmamalı,
- ibadet kaydını inanç veya ahlak puanına dönüştürmemeli,
- açılmayan bir hatırlatmayı daha sık göndermemeli,
- kişisel metinleri model veya dış servisle paylaşmamalı.

Uyarlama için güvenli sinyaller:

- kullanıcının açıkça seçtiği kategori,
- kullanıcının seçtiği saat,
- kullanıcının “daha az / daha çok” tercihi,
- tamamlanan / ertelenen / kapatılan hatırlatmanın cihaz içi sonucu,
- “hafif gün” veya “sessiz” modu.

### 11.3. Başarıya göre değil, tercih sinyaline göre ayarlama

Bir kullanıcı üç kez ertelediğinde sistem “daha çok hatırlat” sonucuna gitmemelidir. Olası güvenli yorumlar:

- zamanı uygun değil,
- kanal fazla görünür,
- bugün kapasite düşük,
- hatırlatma gereksiz.

Bu nedenle üçüncü ertelemeden sonra öneri:

> Bu saati daha sakin bir zamana taşıyalım mı, yoksa bugün kapatalım mı?

olmalıdır.

---

## 12. Erişilebilirlik ve kapsayıcı tasarım

Hatırlatmalar kısa süreli ve sık görülen yüzeyler olduğu için erişilebilirlik doğrudan kullanıcı güvenini etkiler.

### 12.1. Görsel erişilebilirlik

- Light ve dark temadaki tüm yeni metin token’ları ayrı kontrast testinden geçmeli.
- Normal metin için en az 4.5:1, büyük metin için en az 3:1 kontrast korunmalı.
- Renk tek başına “açık / kapalı / gecikmiş” anlamı taşımamalı.
- İkonların yanında metin veya erişilebilir isim bulunmalı.
- Animasyonlar azaltılmış hareket tercihini gözetmeli.
- Geri sayım yalnızca zaman bilgisi olarak değil, metinsel açıklama ile verilmeli.

### 12.2. Etkileşim erişilebilirliği

- Kart, ana eylem ve erteleme eylemleri birbirinden yeterli dokunma alanıyla ayrılmalı.
- Bildirim açıldığında kullanıcı doğrudan bağlamlı ekrana gitmeli; yalnızca ana sayfaya atılmamalı.
- `Escape`, geri hareketi ve ekran okuyucu ile modal kapanabilmeli.
- Toast / banner içeriği ekran okuyucuya duyurulmalı fakat tekrar tekrar okunmamalı.
- Kullanıcıya yalnızca zaman baskılı seçim sunulmamalı; kapatma ve erteleme kalıcı olarak erişilebilir olmalı.

### 12.3. Dil erişilebilirliği

- Kısa ama bağlamsız cümleler yerine tek cümlede eylem ve seçim netleştirilmeli.
- Emoji anlamın tek taşıyıcısı olmamalı.
- “Bugün kaçırdın”, “başarısız”, “eksik” gibi kelimeler varsayılan metinlerde kullanılmamalı.
- Dini ve terapi bağlamında sıcaklık ile otorite dili birbirine karıştırılmamalı.

---

## 13. Gizlilik, güvenlik ve etik sınırlar

### 13.1. Bildirim gövdesi mahremiyet sözleşmesi

Her hatırlatma tanımı iki metin taşımalıdır:

- `privateTitle`: kilit ekranında güvenli, genel metin,
- `detailTitle` / `detailBody`: yalnızca uygulama içinde gösterilecek bağlamlı metin.

Kullanıcı ileride “kilit ekranında ayrıntıları göster” seçse bile bu ayar kategori bazında ve açık opt-in olmalıdır. Varsayılan güvenli metin korunmalıdır.

### 13.2. Senkron ve panel sınırı

Hatırlatma tercihleri veya teslim geçmişi `data` nesnesine eklenirse:

- `sync.js` sanitize kuralları yeniden değerlendirilmelidir,
- tam veri replace davranışı nedeniyle cihazlar arası çakışma ayrıca test edilmelidir,
- panel / gözlem dashboard’una hassas rutin veya bildirim geçmişi yansıtılmamalıdır,
- yalnızca gerekli, redakte edilmiş sağlık / sistem durumları gösterilmelidir,
- yeni alanlar yokken eski verinin migrate sonucu bozulmamalıdır.

Varsayılan öneri, hatırlatma tercihlerini cihaz yerelinde tutmaktır. Kullanıcı açıkça istemedikçe ritüel saatleri, ilaç saatleri veya terapi tercihleri uzak veri deposuna yazılmamalıdır.

### 13.3. Güvenli kullanım ve kriz sınırı

Terapi odası veya duygu check-in’i hassas bir sinyal gösterdiğinde sistem:

- acil yardım çağırdığı izlenimi vermemeli,
- kullanıcı adına yakına mesaj göndermemeli,
- klinik risk skoru üretmemeli,
- bildirim ile özel içeriği ifşa etmemeli,
- kullanıcıya uygun güvenlik kaynaklarını ve profesyonel yardım seçeneklerini açıkça gösterebilmelidir.

Bu alanda ayrıca ayrı bir güvenlik / klinik inceleme yapılmadan native bildirim içeriği yayına alınmamalıdır.

### 13.4. Kayıtların saklama süresi

Hatırlatma teslim logları sınırsız büyümemelidir. Öneri:

- cihaz yerelinde yalnızca son 30 gün veya son 200 oluşum,
- native bildirim gövdesi saklanmaz,
- kullanıcı “hatırlatma geçmişini temizle” eylemine sahip olur,
- debug çıktısı hassas metin taşımaz,
- sync / panel kayıtlarına teslim gövdesi yazılmaz.

---

## 14. Uygulama planı ve fazlar

Bu fazlar doğrudan kod talimatı değil, ilerideki geliştirme sırasıdır. Her faz bir öncekinin doğrulamasını geçmeden başlatılmamalıdır.

### Faz R0 — Sözleşme ve yetenek denetimi

**Amaç:** Kod yazmadan mevcut davranışın sınırlarını ve platform yeteneklerini sabitlemek.

İşler:

- mevcut ÆON notification akışını genel hatırlatma akışından ayıran sözleşmeyi yazmak,
- `data.settings.prayer`, `data.zikr`, `data.days[].therapy`, Saygı / okuma ve günlük alanlarını envanterlemek,
- foreground / background / PWA kapalı durumlarını ayrı test senaryoları yapmak,
- Notification API ve Service Worker durumlarını tarayıcı bazında belgelemek,
- local-only ve sync edilebilir veri sınırını onaylamak,
- mahrem bildirim metni kütüphanesini oluşturmak,
- kullanıcı günlük bütçesi için başlangıç varsayımlarını kararlaştırmak.

**Çıkış kapısı:** Uygulamanın hangi durumda hangi bildirimi gerçekten gösterebildiği yazılı ve test edilebilir olmalıdır.

### Faz R1 — Hatırlatma Merkezi bilgi mimarisi

**Amaç:** Kullanıcının tüm tercihlerini tek bir sakin yönetim yüzeyinde toplamak.

İşler:

- Ayarlar içinde Hatırlatma Merkezi bilgi mimarisi,
- hazır profiller,
- kategori kartları,
- izin durumu açıklamaları,
- sessiz saat ve günlük bütçe ayarları,
- bugün sustur / hafif gün / sessiz modları,
- erişilebilir modal ve deep-link davranışları,
- bildirim önizlemesi.

**Çıkış kapısı:** Kullanıcı herhangi bir kategoriyi izin istemeden uygulama içi kanalda açıp kapatabilmeli ve native izni nerede kontrol ettiğini anlayabilmelidir.

### Faz R2 — Yerel tercih ve oluşum sözleşmesi

**Amaç:** Hatırlatmanın ne zaman oluştuğunu ve tekrar etmeyeceğini deterministik hale getirmek.

İşler:

- `ReminderDefinition`, `ReminderPreference`, `ReminderOccurrence`, `ReminderDelivery` ve suppression kavramlarını sabitlemek,
- cihaz yerelinde tutulacak anahtarı ve saklama süresini belirlemek,
- occurrence ID ve timezone kurallarını uygulamak,
- gün / saat dilimi / DST / Hicri offset davranışlarını tanımlamak,
- eski veri ile yeni tercih yokken güvenli varsayılanı belirlemek.

**Çıkış kapısı:** Aynı tarih ve aynı zaman için uygulamayı tekrar açmak yeni duplicate üretmemeli; farklı timezone ve yaz / kış saati senaryoları deterministik olmalıdır.

### Faz R3 — Foreground scheduler ve uygulama içi inbox

**Amaç:** Native bildirim izni olmasa bile değerli bir hatırlatma deneyimi sunmak.

İşler:

- uygulama açılışı / görünürlük / focus / pageshow kontrolleri,
- oluşum hesaplama,
- bütçe ve quiet hours filtresi,
- deduplication,
- gruplanmış “Bugün sana ayrılan küçük duraklar” kartı,
- catch-up özeti,
- erteleme ve bugün susturma,
- cihaz içi kısa geçmiş.

**Çıkış kapısı:** Uygulama açıkken hatırlatmalar doğru hedefe yönlenmeli; kapalıyken kaçırılanlar açılışta spam olarak çoğalmamalıdır.

### Faz R4 — İlk ritüel çekirdeği

**Amaç:** Kullanıcının açıkça istediği dört ana yüzeyi ortak motorla çalıştırmak.

Öncelik sırası:

1. Namaz vakti ve vakit sonrası işaretleme.
2. Zikir / tefekkür.
3. Terapi odasında seçili tek mikro-pratik.
4. Saygı / Günün Öncüsü okuma.
5. Günlük veya okuma ile akşam kapanışı.

Her tanım için:

- private notification copy,
- detail copy,
- deep-link,
- default frequency,
- suppression rule,
- low-capacity behavior,
- accessibility label,
- migration / privacy etkisi yazılmalıdır.

**Çıkış kapısı:** Kullanıcı dört ana yüzeyi ayrı ayrı yönetebilmeli; birini kapatmak diğerlerini etkilememelidir.

### Faz R5 — Bakım ve sağlık hatırlatmaları

**Amaç:** Su, uyku, kafein, takviye ve kullanıcı tarafından kurulan ilaç saatlerini kontrollü biçimde eklemek.

İşler:

- mevcut nudge’ları ortak bütçeye bağlamak,
- bakım kategorileri arasında öncelik ve gruplayabilme,
- ilaç / takviye veri modeli,
- kullanıcı girişli zaman ve notlar,
- doz / tedavi önerisini engelleyen metin sözleşmesi,
- kullanıcıya ait sağlık verisinin sync dışında tutulması,
- silme / export / local clear akışları.

**Çıkış kapısı:** Sistem tıbbi öneri vermeden yalnızca açıkça kurulan kişisel zamanı hatırlatabilmeli.

### Faz R6 — Native PWA kanalının kontrollü açılması

**Amaç:** Platformun gerçekten desteklediği koşullarda native bildirimleri devreye almak.

İşler:

- permission state makinesi,
- ilk kanal açılışında açıklama,
- test bildirimi,
- private title / detail body ayrımı,
- notification click deep-link,
- native duplicate ve cooldown,
- ses / titreşim / renotify tercihi,
- iOS / Android / desktop davranışlarının ayrı kanıtları.

**Çıkış kapısı:** Native kanal çalışmadığında uygulama içi deneyim bozulmamalı; desteklenmeyen background yeteneği vaat edilmemelidir.

### Faz R7 — Özetler ve ileri kişiselleştirme

**Amaç:** Hatırlatmayı artırmak yerine daha anlamlı ve daha az sıklıkta hale getirmek.

İşler:

- haftalık sakin özet,
- “çok sık geliyor / az geliyor” hızlı geri bildirimi,
- kullanıcı seçimine dayalı önerilen saatler,
- özel gün tercihleri,
- tek ritüel odak modu,
- cihaz içi hatırlatma analitiği,
- opt-in kişiselleştirme açıklaması.

**Çıkış kapısı:** Sistem kullanıcıyı davranışlarına göre zorlamadan, yalnızca açık tercih sinyallerine göre ayarlanabilmelidir.

### Faz R8 — Panel, güvenlik ve yayın kapısı

**Amaç:** Yeni alanların gözlem dashboard’una hassas veri sızdırmadan ve mevcut sync sınırlarını bozmadan teslim edilmesi.

İşler:

- panelde gerekiyorsa yalnızca redakte edilmiş sistem sağlık göstergesi,
- sync sanitize denetimi,
- eski veri migrasyonu,
- cache-bust kontrolü,
- headless test matrisi,
- yeni kopya ve erişilebilirlik kontrolü,
- Pages / deployment / canlı içerik doğrulaması için yalnızca hazırlık ve
  evidence ayrımı.

**Çıkış kapısı:** Kaynak, test, deployment ve kullanıcı cihazı kanıtı ayrı
raporlanmalı; kullanıcı onayı olmadan deployment yapılmamalıdır.

### Faz R9 — Ürün derinliği ve sistem güvenilirliği

**Amaç:** İlk çekirdeğin ötesindeki günlük akışları ve operasyonel sınırları
ölçülebilir, mahrem ve session-bağımsız biçimde olgunlaştırmak.

İşler:

- privacy-safe başarı ölçütleri ve telemetry’siz observability,
- sabah / gün içi / akşam / düşük kapasite akışları,
- gelişmiş Reminder Center önizleme ve geçmiş yönetimi,
- stale vakit, offline, permission ve sync recovery durumları,
- opt-in kişiselleştirme guardrail’leri,
- haftalık sakin özet ve yansıma,
- canonical Türkçe copy lexicon,
- iki tema, responsive, reduced-motion ve render performansı,
- multi-tab idempotence / anti-clobber,
- retention, export, clear ve reset yaşam döngüsü.

**Çıkış kapısı:** Ürün davranışı test edilebilir; hassas çıkarım, notification
spam’i, private leakage ve local full-replace veri kaybı kanıtlanmış biçimde
engellenmelidir.

### Faz R10 — Reconciliation ve release candidate freeze

**Amaç:** Planın her bölümünü prompt, test, karar, allowlist ve evidence ile
izleyip release candidate’ı kullanıcı onayına hazır hale getirmek.

İşler:

- §1–§21 section-level traceability audit,
- prompt / ledger / state / test matrix parity kontrolü,
- full regression ve yeni reminder fixture suite’i,
- source / test / privacy / accessibility / panel evidence packet,
- release scope freeze ve açık discrepancy / deferred listesi.

**Çıkış kapısı:** Context validator PASS; release packet hazır; state
`releaseApproval.status = not_approved`; push, merge, Pages, canlı browser ve
gerçek veri deposu write yapılmamış olmalıdır.

### Faz R11 — Kullanıcı onaylı release execution

**Amaç:** Yalnız kullanıcının mevcut konuşmada açıkça onayladığı ve kapsamını
belirttiği işlemleri, ayrı source / remote / CI / Pages / live / device kanıtı
olarak yürütmek.

İşler:

- exact kullanıcı mesajı, tarih ve scope’un state’e kaydı,
- approval gate ve full matrix’in onay sonrası yeniden çalıştırılması,
- yalnız izin verilen commit / push / merge / tag / Pages işlemleri,
- remote equality, workflow, live HTTP ve cache-bust kanıtı,
- kullanıcı cihazı kabulünün S5 olarak ayrı bekletilmesi.

**Çıkış kapısı:** Kullanıcı onayı yoksa faz çalışmaz ve `approval_required` kalır.
Onay varsa bile `mustafaras/seyma-data` için ayrıca açık veri yazma izni
olmadan kişisel veri deposuna yazılmaz.

### Faz R12 — Şeyma app runtime uygulama hattı

**Amaç:** Hatırlatma motorunun mevcut uygulama runtime’ına gerçekten bağlandığını;
state, migration, clock, persistence, event log, navigation, render,
foreground lifecycle, feature deep-link, native boundary ve privacy sınırlarının
soyut plan olarak kalmadığını kanıtlamak.

İşler:

- `index.html` script order, global adapter ve cache-bust sözleşmesi,
- `app.js` canonical state ve additive migration,
- injected clock / timezone / occurrence adapter,
- save / commit / event-log idempotence,
- Reminder Center overlay, focus, draft ve deep-link akışı,
- render no-op / pending / stale / error durumları,
- visibility / focus / pageshow / online lifecycle orchestration,
- namaz, zikir, terapi, Saygı, okuma, günlük ve bakım surface adapter’ları,
- Notification / Service Worker / ÆON social channel ayrımı,
- local-only ve sync sanitize privacy sınırı,
- app syntax, VM, migration, privacy, a11y ve cache-bust acceptance.

**Çıkış kapısı:** REM-44–REM-54 tamamlanmadan app runtime reminder teslimi
hazır sayılmaz; panel promptları app davranışı varsayamaz.

### Faz R13 — Current ÆON observer panel uygulama hattı

**Amaç:** Reminder’ın panelde hangi kanıtla görünebileceğini ve hangi bilgilerin
kesinlikle görünemeyeceğini current `panel.js` / `panelCoverageManifest.js`
gerçekliği üzerinden kanıtlamak.

İşler:

- source selection, projection / legacy fallback ve provenance,
- coverage manifest ile full / summary / redacted / unmapped classification,
- redaction ve explicit no-op / safe aggregate kararı,
- ETag / 304 / draft safety / conditional polling,
- partial fetch, stale snapshot ve fail-closed states,
- sync receipt, coverage, freshness, capability ve privacy status’larının
  birbirinden ayrılması,
- dashboard card, daily detail ve event timeline lifecycle,
- observer action write boundary; reminder preference / delivery panelden
  yazılamaz,
- DOM / export / error / fixture secret scanner,
- current panel responsive, accessibility, performance ve root fixture QA,
- current panel ile Panel-v2’nin ayrı runtime / regression olarak raporlanması.

**Çıkış kapısı:** REM-55–REM-66 tamamlanmadan panelde “çalışıyor” veya
“senkronlandı” denmez; Panel-v2 PASS’ı current panel acceptance yerine geçmez.

### Faz R14 — App → sync → projection → panel integration hattı

**Amaç:** İki yüzeyin aynı reminder davranışını güvenli, izlenebilir ve
çelişkisiz biçimde taşıdığını uçtan uca sentetik kanıtla doğrulamak.

İşler:

- kullanıcı action → local state / event → sanitize → receipt → projection →
  panel status / card / no-op lineage fixture,
- source, local, sync, projection, section, privacy ve device failure
  semantiklerinin ayrılması,
- legacy / missing / future schema compatibility,
- app, sync, projection, panel DOM, errors, timeline ve observer writes için
  integrated negative privacy / no-write suite,
- app user UX ile panel operator UX’in ayrı accessibility / visual acceptance’ı,
- source / test / remote / CI / Pages / live / device kanıtlarının ayrı release
  packet’i.

**Çıkış kapısı:** REM-67–REM-72 tamamlanır; state `not_approved` kalır ve
kullanıcının açık, güncel, kapsamı belirli onayı olmadan push, merge, deploy,
live browser veya gerçek veri deposu write yapılmaz.

---

## 15. Test ve kalite planı

Hatırlatma motoru tarih ve cihaz durumuna duyarlı olduğu için yalnızca manuel ekran kontrolü yeterli değildir.

### 15.1. Önerilen test dosyaları

İleride `tests/` altında oluşturulması düşünülebilecek test kapsamları:

| Test | Kapsam |
|---|---|
| `test_reminder_contract.js` | Tanımların zorunlu alanları, kategori ve öncelik sözleşmesi |
| `test_reminder_scheduler.js` | Oluşum hesabı, foreground kontrolleri, duplicate engelleme |
| `test_reminder_timezones.js` | Europe/Istanbul, gün değişimi, DST ve Hicri offset |
| `test_reminder_budget.js` | Günlük limit, kategori cooldown, gruplayabilme |
| `test_reminder_quiet_hours.js` | Sessiz saat, hafif gün, sessiz mod, sabah catch-up |
| `test_reminder_permission.js` | Desteklenmiyor / reddedildi / verildi / geçici hata durumları |
| `test_reminder_copy.js` | Private copy, hassas kelime sızıntısı, Türkçe metin sözleşmesi |
| `test_reminder_privacy.js` | local-only tercih, sanitize, native body’ye hassas alan sızmaması |
| `test_reminder_migration.js` | Hatırlatma alanı olmayan eski veri ile güvenli açılış |
| `test_reminder_panel_projection.js` | Panelde yalnızca izin verilen redakte verinin görünmesi |
| `test_reminder_deeplinks.js` | Notification click ve uygulama içi kart hedefleri |
| `test_reminder_catchup.js` | Uygulama yeniden açıldığında tekil ve anlamlı özet |

App ve panel tarafı için test sahipliği ayrıca ayrıdır:

| Yüzey | Test scope’u | Kanıt sınırı |
|---|---|---|
| App runtime | `tests/reminders/test_reminder_app_*.js`, run-seyma driver, zikr harness, migration / native mocks | Gerçek browser, gerçek localStorage ve gerçek data repo yok |
| Current ÆON panel | `tests/reminders/test_reminder_panel_*.js`, mevcut `tests/test_panel_*.js`, `tests/test_faz11_panel.js` | Projection, coverage, redaction, 304, status ve observer write sınırı |
| Panel-v2 | `tests/panel-v2/test_panel_v2_*.js` ve `tests/panel-v2/README.md` | Current panel acceptance yerine geçmez; ayrı regression / design kanıtıdır |
| Integration | `tests/reminders/test_reminder_lineage.js`, cross-surface status / schema / privacy / UX | App → sync → projection → panel zinciri sentetik ve ağsız olmalıdır |

Dosya adları uygulama başlamadan önce kesinleştirilebilir; burada amaç test kapsamını görünür kılmaktır.

### 15.2. Tarih ve saat test matrisi

En az şu senaryolar sentetik tarih ile çalıştırılmalıdır:

- günün ilk açılışı,
- tam eşik dakikası,
- eşikten bir saniye önce / sonra,
- gece yarısı geçişi,
- sessiz saat başlangıcı / bitişi,
- namaz vakti verisi 48 saatten eski,
- konum veya yöntem değişimi,
- Europe/Istanbul yaz / kış saati geçişi,
- Hicri offset -2 / 0 / +2,
- uygulamanın birkaç gün kapalı kalıp açılması,
- aynı sekmenin birden fazla kez focus olması,
- offline başlayıp online olması,
- notification permission’ın sonradan reddedilmesi.

### 15.3. Headless doğrulama

Mevcut repo kuralları gereği doğrulama:

- Node syntax check,
- mevcut `run-seyma` headless harness’ları,
- sentetik `Date`, timer, localStorage ve Notification mock’ları,
- ağsız fixture’lar,
- light / dark tema render’ı,
- migration ve privacy testleri

ile yapılmalıdır. Gerçek Şeyma uygulaması browser’da açılarak “çalışıyor mu?” kontrolü yapılmamalıdır.

### 15.4. Manuel kullanıcı kabul testi

Kod / headless testleri geçtikten sonra kullanıcı cihazında ayrı bir kabul kanıtı gerekir. Bu testte:

- kullanıcının kendisi notification izni verir,
- gerçek cihazda kilit ekranı mahremiyeti kontrol edilir,
- PWA kapalıyken hangi davranışın çalışmadığı açıkça not edilir,
- uygulama tekrar açıldığında catch-up deneyimi incelenir,
- saat dilimi / sessiz saat / deep-link kontrol edilir.

Bu cihaz kanıtı, kaynak ve test kanıtının yerine geçmez.

---

## 16. İçerik ve marka yönü

Hatırlatma dili, Şeyma’nın sıcak ve informal tonunu korurken ibadet ve terapi konularında aşırı samimiyet veya otorite üretmemelidir.

### 16.1. Kopya karakteri

- kısa,
- nefes alan,
- seçenek sunan,
- yargılamayan,
- mahrem,
- bağlama duyarlı,
- eylemi kolaylaştıran,
- kullanıcıyı tekrar tekrar uygulamaya çağırmayan.

### 16.2. Kategori dil sözlüğü

| Kategori | Önerilen dil | Kaçınılacak dil |
|---|---|---|
| Namaz | vakit, durak, hazırlanmak, işaretlemek | görev, eksik, kaçırdın |
| Zikir | kısa durak, dönmek, sakinlik | seri, ceza, kayıp |
| Terapi | alan, küçük pratik, destek | tedavi, düzeltmek, teşhis |
| Saygı | ilham, okuma, keşif | zorunlu okuma, eksik |
| Okuma | yolculuk, birkaç sayfa, dönmek | hedef borcu, geri kaldın |
| Günlük | kapatmak, saklamak, yansımak | rapor, veri eksik |
| Sağlık | kendi kurduğun hatırlatma, bakım | doktor gibi öneri, almalısın |
| Sistem | tazelemek, kontrol etmek, ilgilenmek | hata yüzünden suçlama |

### 16.3. Bildirim sesi ve görsel yoğunluk

- P2 / P3 hatırlatmalar sessiz veya düşük dikkat çekicilikte başlamalı.
- Ses ve titreşim kullanıcı tarafından kategori bazında seçilebilmeli.
- Kırmızı / alarm estetiği yalnızca gerçek sistem problemi veya kullanıcının açıkça seçtiği durumlar için kullanılmalı.
- Namaz, zikir ve terapi yüzeyleri görsel olarak birbirleriyle yarışmamalı; aynı premium tasarım sisteminin sakin varyantlarını kullanmalı.

---

## 17. Önceliklendirme: ne önce yapılmalı?

### P0 — Güven ve kontrol

- Hatırlatma Merkezi bilgi mimarisi.
- Uygulama içi kanal.
- Aç / kapat / bugün sustur / ertele.
- Quiet hours ve günlük bütçe.
- Permission state açıklaması.
- Mahrem native kopya sözleşmesi.
- Foreground / background sınırının dürüstçe gösterilmesi.

### P1 — Kullanıcı isteğinin çekirdeği

- Namaz vakitleri.
- Zikir / tefekkür.
- Terapi odası mikro-pratikleri.
- Saygı / Günün Öncüsü okuma.
- Günlük veya okuma akşam kapanışı.

### P2 — Günlük bakım

- Su ve uyku nudge’larının ortak bütçeye alınması.
- Kafein kapanış uyarısı.
- Kullanıcı seçmeli hareket / esneme.
- Özel gün tercihleri.
- Haftalık sakin yansıma.

### P3 — Sağlık ve ileri özellikler

- İlaç / takviye zamanlayıcısı.
- Cihazlar arası hatırlatma tercih senkronu.
- Daha gelişmiş adaptasyon.
- Gerçek push backend’i veya native uygulama kanalı.
- Ayrı opt-in güvenli bağlantı özellikleri.

İlaç / takviye, kullanıcı açısından önemli olsa da güvenlik ve veri modeli tamamlanmadan P1’e çekilmemelidir.

---

## 18. Açık ürün kararları

Uygulamaya başlamadan önce aşağıdaki kararlar kullanıcıyla veya ürün sahibiyle netleştirilmelidir:

1. Native bildirimler uygulama kapalıyken çalışmadığında uygulama içi catch-up yeterli mi?
2. Varsayılan günlük native bütçe 3 mü, yoksa daha düşük mü olmalı?
3. Namaz bildirimleri beş vakit için mi, yalnızca seçili vakitler için mi açılmalı?
4. Namaz sonrası, zikir ve tefekkür tek bir gruplanmış ritüel olarak mı sunulmalı?
5. Terapi bildiriminde “terapi” kelimesi kullanıcı isteği olmadan tamamen gizlenmeli mi?
6. Saygı okuma hatırlatması her gün mü, seçili günlerde mi olmalı?
7. Günlük için sabah mı, akşam mı, yoksa kullanıcının seçtiği tek pencere mi varsayılan olmalı?
8. İlaç / takviye modülü yalnızca uygulama içi mi, native kanal da desteklenmeli mi?
9. Hatırlatma tercihleri cihazlar arasında senkronize edilmeli mi? Varsayılan öneri: hayır.
10. Kullanıcı kilit ekranında ayrıntılı metni açıkça seçebilmeli mi? Varsayılan öneri: güvenli genel metin.
11. “Hafif gün” modu otomatik önerilmeli mi, yoksa yalnızca kullanıcı mı açmalı? Varsayılan öneri: yalnızca kullanıcı.
12. Özel gün / kandil bildirimleri varsayılan kapalı mı kalmalı? Varsayılan öneri: evet.
13. ÆON sosyal bildirimleri global sessiz gün moduna uymalı mı, yoksa bağımsız mı kalmalı?
14. Kullanıcıya cihaz içi son 30 günlük hatırlatma geçmişi gösterilmeli mi?
15. Bir sonraki aşamada gerçek push altyapısı ürün kapsamına girecek mi?
16. Release için kullanıcı onayı hangi exact eylem ve branch kapsamını içermeli?
17. Kullanıcı onayı gelmeden yalnızca local validation ve release packet
    hazırlığı mı yapılacak? Bu planın varsayılan cevabı: evet.

Bu kararlar alınmadan bildirim sayısını artırmak, sonradan geri dönüşü zor bir bildirim yorgunluğu yaratabilir.

---

## 19. Uygulamaya alma kabul kapıları

Bir hatırlatma kategorisi yayına alınmadan önce tüm aşağıdaki kapılar geçilmelidir:

### Ürün kapısı

- Kullanıcı neyin hatırlatıldığını anlayabiliyor.
- Tek dokunuşla doğru hedefe gidiyor.
- Erteleme ve kapatma kolay.
- Hatırlatma yapılmadığında uygulama cezalandırıcı davranmıyor.
- Varsayılan sıklık sakin.

### Teknik kapı

- Deterministik occurrence ID var.
- Duplicate engellenmiş.
- Timezone / DST / midnight senaryoları test edilmiş.
- Foreground / background yeteneği doğru raporlanıyor.
- Native permission yokken uygulama içi kanal çalışıyor.
- Timer, focus ve visibility tekrarları spam üretmiyor.

### Gizlilik kapısı

- Native metin hassas bilgi içermiyor.
- Terapi, sağlık, ibadet ve günlük içeriği sync’e gereksiz çıkmıyor.
- Panelde özel rutin görünmüyor.
- Local clear ve kapatma davranışı anlaşılır.
- Debug / error log ham kullanıcı metni taşımıyor.

### Erişilebilirlik kapısı

- Light / dark kontrast ölçülmüş.
- Ekran okuyucu başlıkları anlamlı.
- Kart ve butonlar yeterli dokunma alanında.
- Renk / emoji tek bilgi kaynağı değil.
- Reduced motion ve focus davranışı doğrulanmış.

### Bilimsel / klinik sınır kapısı

- Tanı, tedavi veya acil müdahale iddiası yok.
- İlaç / takviye yalnızca kullanıcı tarafından kurulan zaman hatırlatması.
- Terapi metinleri kişiselleştirilmiş klinik öneri gibi sunulmuyor.
- Kriz akışı varsa profesyonel kaynaklar ve sınırlar açık.

### Teslim kapısı

- Syntax ve headless testler geçiyor.
- Migration testi geçiyor.
- Panel / sync etkisi incelenmiş.
- Cache-bust planı hazır.
- Deployment kanıtı kaynak ve test kanıtından ayrı tutuluyor.
- Gerçek cihaz davranışı ayrıca kullanıcı tarafından doğrulanıyor.
- Kullanıcının açık ve güncel release onayı exact mesaj ve kapsam ile kayıtlı.
- Onay yoksa release state `NOT_APPROVED` kalıyor; push, merge, Pages, tag,
  dış sistem write ve canlı doğrulaması yapılmıyor.
- Canlıya alma onayı ile `mustafaras/seyma-data` veri yazma onayı birbirinden
  ayrı tutuluyor.

---

## 20. Önerilen ilk teslim paketi

İlk uygulama paketi mümkün olduğunca küçük ama kullanıcıya gerçek değer verecek şekilde şu sınırda tutulmalıdır:

1. Hatırlatma Merkezi.
2. Yerel tercih, sessiz saat ve günlük bütçe.
3. Uygulama içi hatırlatma kartları.
4. Foreground scheduler ve duplicate engelleme.
5. Native izin akışı, yalnızca kullanıcı açıkça seçtiğinde.
6. Namaz için seçilebilir vakit öncesi hatırlatma.
7. Zikir için günde bir kısa davet.
8. Terapi odası için seçilebilir tek mikro-pratik.
9. Saygı için seçilebilir okuma penceresi.
10. Akşam için günlük / okuma / tefekkür arasından tek bir kapanış daveti.
11. “Hafif gün”, “bugün sustur” ve “10 / 30 / 60 dakika ertele”.
12. Mahrem notification copy ve deep-link.
13. Headless zaman, bütçe, privacy ve migration testleri.

İlk pakette su, ilaç, özel gün, gelişmiş adaptasyon ve tüm platformlarda kapalı uygulama bildirimi bir arada yapılmamalıdır. Bunlar çekirdek motor güvenilir hale geldikten sonra ayrı fazlarda ele alınmalıdır.
---

## 21. Sonuç

Şeyma için en iyi hatırlatma sistemi, kullanıcının gününü daha fazla görevle dolduran bir alarm tablosu değildir. Namaz, zikir, terapi odası, Saygı, okuma, günlük ve bakım alanlarını tek bir sakin ritim altında birleştiren; kullanıcıya seçim hakkı veren; hassas bilgiyi koruyan; uygulamanın teknik sınırlarını dürüstçe anlatan bir eşlik katmanıdır.

Bu planın ana uygulama kararı şudur:

> Önce kontrol, mahremiyet ve uygulama içi güvenilirlik; sonra sınırlı native bildirim; en son sağlık, adaptasyon ve ileri otomasyon.

Bu sıra korunursa hatırlatmalar Şeyma’nın mevcut premium deneyimini büyütür. Tersi durumda birbirinden bağımsız nudge’lar kullanıcıyı yorar, hassas alanları görünür kılar ve uygulamanın güvenini zedeler.
