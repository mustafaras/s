# Şeyma Repo Organizasyonu ve Modülerleştirme Planı

**Durum:** M0–M3 ve L1 tamamlandı; L2-a constants/ICONS ve L2-b/B1-B2
read-only/parity kapıları `REPO-L002`/`REPO-L004`/`REPO-L005` ile
`ready_for_review`.
**Kapsam:** Kök Markdown dağınıklığı, uzun runtime dosyaları ve güvenli
modülerleştirme
**Dış etki:** Bu plan tek başına commit, push, merge, deploy veya kullanıcı
verisi yazma yetkisi vermez. Her runtime adımı paired ledger ve ayrı kabul
makbuzuyla ilerler.

M0 ve L0 uygulama kanıtları şu iki manifestoda tutulur:

- [`REPO-M0-MARKDOWN-MANIFEST.md`](REPO-M0-MARKDOWN-MANIFEST.md)
- [`REPO-L0-RUNTIME-DEPENDENCY-MAP.md`](REPO-L0-RUNTIME-DEPENDENCY-MAP.md)

Sequence kayıtları `docs/ledgers/` altındaki paired repo ledger’larında tutulur.

## 1. Mevcut durumun kanıtı

2026-08-02 çalışma alanı envanteri:

| Sınıf | Dosya | Yaklaşık satır | Sorun | İlk karar |
|---|---|---:|---|---|
| Operasyon kuralı | `AGENTS.md` | 3.800 | Güncel kurallar ve uzun tarihsel handoff aynı dosyada | Kuralları koru; handoff arşivini daha sonra ayır |
| Mimari kural | `CLAUDE.md` | 242 | Kök referans dosyası | Kök dosya olarak bırak |
| Ana roadmap | `GELISTIRME-PLANI.md` | 747 | Ürün durumları ve teknik ilkeler | Kök canonical dosya olarak bırak |
| Ürün roadmap’leri | `SEYMA-V2-PLAN.md`, `ILHAM-IBADET-GELISTIRME-PLANI.md`, `KURAN-YOLCULUGU-GELISTIRME-PLANI.md`, `ZIKIRMATIK-GELISTIRME-PLANI.md` | 81–1.139 | Roadmap’ler operasyon dosyalarıyla aynı seviyede | `docs/roadmaps/` adayları |
| Eski prompt/denetim | `KURAN-YOLCULUGU-YENI-OTURUM-PROMPTU.md`, `ZIKIRMATIK-IPHONE16-PREMIUM-PROMPT-PAKETI.md`, `ZIKIRMATIK-REDESIGN-DENETIMI.md` | 225–843 | Tarihsel belgeler canonical roadmap gibi görünüyor | `docs/prompts/legacy/`, `docs/audits/` adayları |
| Ana uygulama | `app.js` | 13.606 | Tek IIFE içinde state, migration, render ve feature akışları | Kademeli modülerleştir |
| Observer paneli | `panel.html` | 4.114 | HTML, CSS ve JS aynı dosyada | Önce CSS/JS ayır |
| Paylaşılan stil | `styles.css` | 1.230 | Token, base ve component stilleri karışık | Sözleşme korunarak böl |
| İçerik modülleri | `motivationProgramV2.js`, `profileAssessmentV1.js` | 4.186–5.192 | Büyük ama dondurulmuş veri içerikleri | Şimdilik bölme; içerik bütünlüğünü koru |

Bu tablo, “uzun dosya = hemen taşı” kararı vermez. Runtime dosyalarının kökte
olması GitHub Pages’in build’siz yükleme sözleşmesinin bir parçasıdır; belge
dosyaları ile runtime dosyaları ayrı politikalarla ele alınır.

## 2. Hedef kök düzeni

### 2.1 Kök dizinde kalacaklar

İlk düzenleme sonunda kökte yalnızca şu sınıflar kalmalıdır:

- `AGENTS.md`: kısa ve güncel çalışma/veri güvenliği kuralları.
- `CLAUDE.md`: mimari ve doğrulama talimatları.
- `GELISTIRME-PLANI.md`: ana ürün roadmap’i ve teknik ilkeler.
- `index.html`, `panel.html`, `styles.css`, `app.js`, `sync.js`, `sw.js`,
  `manifest.json`: build’siz statik runtime girişleri.
- Script olarak doğrudan yüklenen frozen veri/transport modülleri.
- Test komutları, ancak `tests/` taşıması bütün referanslar güncellendikten
  sonra yapılır.

Kökten kaldırılacak her runtime dosyası için önce `index.html`,
`panel.html`, service worker ve test harness referansları taranır. Sadece
dosyayı taşıyıp script yolunu güncellememek kabul edilmez.

### 2.2 Belge dizinleri

```text
docs/
├── README.md                         # tüm belge sınıflarının index’i
├── REPO-ORGANIZASYON-VE-MODULERLESTIRME-PLANI.md
├── roadmaps/                         # yaşayan ürün roadmap’leri
├── prompts/legacy/                   # tamamlanmış/tarihsel prompt paketleri
├── audits/                           # denetim ve değerlendirme belgeleri
├── archive/                          # eski handoff ve kapanmış çalışma kayıtları
└── panel/                            # ÆON panelinin canonical plan/prompt/ledger paketi
```

`AGENTS.md`, `CLAUDE.md` ve `GELISTIRME-PLANI.md` için ilk aşamada kopya
üretilmez. Kopya belge iki farklı canonical kaynak oluşturur ve anti-amnesia
kuralını bozar.

## 3. Markdown karmaşasını çözme sırası

### Faz M0 — sınıflandırma ve link haritası

1. Her Markdown dosyasına şu metadata kararı verilir: `operational`,
   `canonical-roadmap`, `historical-prompt`, `audit`, `archive`.
2. Her dosyanın gelen/giden linkleri `rg` ile çıkarılır.
3. Dosya adı, durum, sahibi, canonical hedefi ve taşınma riski bir manifestoda
   tutulur.
4. Aynı konuyu anlatan belgeler için “tek canonical kaynak” kararı verilir;
   eski belge silinmez, `superseded-by` bağlantısıyla arşivlenir.

**Kapı:** Link haritası ve canonical sahiplik kararı olmadan `mv`, silme veya
toplu yeniden adlandırma yapılmaz.

### Faz M1 — tarihsel belgeleri kökten çıkarma

İlk düşük riskli adaylar (REPO-M001 kapsamında tamamlandı):

- `KURAN-YOLCULUGU-YENI-OTURUM-PROMPTU.md` →
  `docs/prompts/legacy/`.
- `ZIKIRMATIK-IPHONE16-PREMIUM-PROMPT-PAKETI.md` →
  `docs/prompts/legacy/`.
- `ZIKIRMATIK-REDESIGN-DENETIMI.md` → `docs/audits/`.

Taşıma makbuzu: [`REPO-M1-MARKDOWN-MOVE-RECEIPT.md`](REPO-M1-MARKDOWN-MOVE-RECEIPT.md).

Sonraki adaylar olan ürün roadmap’leri (REPO-M002 kapsamında tamamlandı):

- `SEYMA-V2-PLAN.md`
- `ILHAM-IBADET-GELISTIRME-PLANI.md`
- `KURAN-YOLCULUGU-GELISTIRME-PLANI.md`
- `ZIKIRMATIK-GELISTIRME-PLANI.md`

Taşıma makbuzu: [`REPO-M2-ROADMAP-MOVE-RECEIPT.md`](REPO-M2-ROADMAP-MOVE-RECEIPT.md).

Bu ikinci grup için `AGENTS.md`, `CLAUDE.md`, `GELISTIRME-PLANI.md`, promptlar
ve test dokümanlarındaki güncel yollar kontrol edilerek taşıma tamamlandı.
Tarihsel handoff metinlerindeki eski dosya adları geçmiş kanıtı olarak aynen
kalabilir; bunlar güncel link sayılmaz.

### Faz M3 — `AGENTS.md` tarihçesini ayırma

`AGENTS.md` iki parçaya bölündü:

- Kök `AGENTS.md`: veri güvenliği, çalışma kuralları, doğrulama komutları,
  güncel proje yapısı ve kısa handoff özeti.
- `docs/archive/AGENTS-HANDOFF-LOG.md`: append-only tarihsel handoff
  kayıtları.

Taşımadan önce:

1. Her `### tarih` bölümünün byte sınırı belirlenir.
2. Eski ve yeni metinler hash/line-count ile karşılaştırılır.
3. Kök dosyada arşiv bağlantısı ve “tarihçe burada” uyarısı bulunur.
4. Yeni handoff’lar yalnız tek canonical arşive eklenir.

Taşıma kanıtı [`REPO-M3-AGENTS-HANDOFF-RECEIPT.md`](REPO-M3-AGENTS-HANDOFF-RECEIPT.md)
dosyasındadır; tarihsel handoff gövdesi byte/hash korunarak arşivlenmiştir.

## 4. Uzun runtime dosyalarını çözme sırası

### Faz L0 — davranış değişmeden ölçüm

- `app.js` fonksiyonları başlık/özellik alanına göre indekslenir.
- Global bağımlılıklar (`data`, `ui`, `App`, `ICONS`, `render`, `save`)
  haritalanır.
- `panel.html` içindeki style/script sınırları çıkarılır.
- `index.html` script sırası ve cache-bust sözleşmesi kaydedilir.

Bu fazda kod taşınmaz; amaç gizli bağımlılıkları görünür kılmaktır.

### Faz L1 — paneli üç parçaya ayırma (`REPO-L001 completed`)

İlk gerçek modülerleştirme panelde yapılır:

```text
panel.html       # HTML shell ve script/link girişleri
panel.css        # panel’e özel stiller
panel.js         # fetch, projection, render ve observer eylemleri
```

`panel.html` bağımsız çalışmaya devam eder. Global helper adları ve mevcut
`test_faz11_panel.js` sözleşmesi korundu; panel CSS/JS ayrıştırma makbuzu
[`REPO-L1-PANEL-SPLIT-RECEIPT.md`](REPO-L1-PANEL-SPLIT-RECEIPT.md)
dosyasındadır.

### Faz L2 — `app.js` çekirdek ayrımı

Tek seferde yeniden yazım yapılmaz. Sıra şöyledir:

1. `app/core/constants.js`: ikonlar, sabitler ve salt yardımcılar —
   `REPO-L002` ile ayrıştırıldı; makbuz:
   [`REPO-L2-CONSTANTS-RECEIPT.md`](REPO-L2-CONSTANTS-RECEIPT.md).
2. `app/core/state.js`: default state, `migrate`, normalizasyon — `REPO-L003`
   ile sınır/fixture envanteri, `REPO-L004` ile yalnız read-only helper
   kanıtı, `REPO-L005` ile sentetik black-box parity tamamlandı; runtime
   taşıması henüz yok.
3. `app/core/persistence.js`: `save`, localStorage ve sync çağrısı.
4. `app/core/render.js`: tab/overlay orkestrasyonu.
5. `app/features/quran.js`, `app/features/faith.js`, `app/features/zikr.js`,
   `app/features/saygi.js`: feature-specific state/render/handler kodları.
6. `app/entry.js`: mevcut global `App` API’sini dışarıya aynı adlarla sunan
   ince giriş katmanı.

Her adımda eski inline `onclick="App..."` sözleşmesi korunur. Bir modül
taşınmadan önce o fonksiyonun çağırdığı global isimler test fixture’ında
assert edilir.

### Faz L3 — CSS katmanları

`styles.css` için önerilen katmanlar:

```text
styles/tokens.css
styles/base.css
styles/layout.css
styles/components/*.css
styles/overlays/*.css
```

İlk aşamada `styles.css` giriş noktası korunur ve dosyalar deterministik
sırayla yüklenir. Token isimleri (`--read`, `--watch`, `--listen`, `--ok`,
`--drop`, tema değişkenleri) değiştirilmez. Böylece PWA/cache davranışı ve
dark/light tema regresyonu tek değişiklikte bozulmaz.

### Faz L4 — frozen içerik ve test dizinleri

- `motivationProgramV2.js` ve `profileAssessmentV1.js` içerik modülleri
  oldukları için otomatik bölünmez; içerik hash’i ve `version` alanları
  korunur.
- `quranTransportV1.js` gibi doğrudan yüklenen modüller ancak script sırası
  ve `node --check` kanıtı ile taşınır.
- Test dosyaları `tests/` altına alınabilir; `AGENTS.md` komutları ve CI/Pages
  olmayan yerel çalıştırma belgeleri aynı değişiklikte güncellenir.

## 5. Anti-amnesia ve ledger kapısı

Her taşıma veya modül ayırma fazı için ayrı sequence kaydı gerekir:

```text
REPO-M###  Markdown taşıma
REPO-L###  Runtime modülerleştirme
```

Her kayıtta şunlar bulunur:

- önce/sonra dosya listesi,
- link ve script referans taraması,
- hash/line-count kanıtı,
- syntax/headless test sonuçları,
- cache-bust değişikliği olup olmadığı,
- kullanıcı verisine ve `seyma-data` reposuna yazılmadığı,
- commit/push/merge/deploy yapılmadığı,
- kalan risk ve tek sonraki güvenli adım.

Bir faz `completed` sayılmaz:

```text
linkler temiz değilse
OR script sırası kanıtlanmadıysa
OR app/sync/panel syntax testi geçmediyse
OR migration/headless testleri eksikse
OR frozen içerik hash’i değiştiyse
OR iki ledger kaydı eşleşmiyorsa
```

## 6. Uygulanmayacak tehlikeli kısayollar

- `app.js` veya `AGENTS.md` tek seferde otomatik formatter ile yeniden
  yazılmayacak.
- `git mv` sonrası link taraması yapılmadan dosya silinmeyecek.
- Root `data/`, localStorage anahtarları, sync merge/full-replace sözleşmesi
  ve kullanıcı verisi şeması bu temizlik gerekçesiyle değiştirilmeyecek.
- Frozen içerik modülleri “daha düzenli görünsün” diye yeniden üretilmeyecek.
- Gerçek tarayıcı açılmayacak; headless harness kullanılacak.
- Kullanıcı açıkça istemeden commit, push, merge veya deploy yapılmayacak.

## 7. Başarı ölçütü

Temizlik tamamlandığında:

1. Kök Markdown dosyaları operasyonel/canonical istisnalarla sınırlı olur.
2. Her belge tek bir canonical dizinde bulunur ve `docs/README.md` üzerinden
   keşfedilir.
3. `AGENTS.md` güncel kurallar için kısa kalır; tarihsel kayıt arşiv linkinden
   erişilir.
4. `panel.html` CSS/JS ayrımıyla okunabilir hale gelir.
5. `app.js` özellik modüllerine bölünürken mevcut `App` handler sözleşmesi,
   migration ve sync davranışı korunur.
6. Her faz için paired ledger ve yeniden üretilebilir test kanıtı bulunur.

## 8. Önerilen ilk uygulama adımı

Kullanıcı onayı sonrası yalnızca **M0 + L0 envanter fazı** çalıştırılır:

- hiçbir runtime kodu taşınmaz,
- hiçbir kullanıcı verisi okunup yazılmaz,
- Markdown link manifestosu ve `app.js`/`panel.html` bağımlılık haritası
  çıkarılır,
- sonuç ayrı bir ledger sequence ile raporlanır,
- rapordan sonra durulur.

Bu kapı geçmeden M1 veya L1’e geçilmez.
