# IIP — İlham & İbadet Premium · KAPANIŞ BELGESİ

**Kapanış tarihi:** 2026-09-22 · **Kapanış HEAD:** `1e1e172` · **Durum:** ✅ KAPANDI
**Program:** 24 kart + 18 düzeltme promptu (P00–P17) · **Kalan iş: YOK**

---

## 1. Neden kapandı

İki program birlikte yürütüldü ve ikisi de tamamlandı:

| Program | Kapsam | Sonuç |
|---|---|---|
| **IIP-01…IIP-24** (24 kart) | Hub yenileme: görsel/kabul, mimari/okuyucu/vakit, kalıcılık/offline/teslim | 24/24 done |
| **P00–P17** (18 prompt) | Denetimde bulunan 16 kusur sınıfının kapatılması | 18/18 kapandı |

Kalan prompt **yoktur**. `IIP-STATE.json` → `nextExecutableCard: null`,
`completedCards: 24/24`, tüm kartlar `done`.

---

## 2. Ölçülen sonuç

| Aile | Denetim öncesi | Kapanış |
|---|---|---|
| `tests/app` | 60 PASS / **13 FAIL** | **73 / 0** |
| `tests/quran` | 8 / **1** | **9 / 0** |
| `tests/panel` · `tests/panel-v2` | 23 · 27 | 23 · 27 |
| `plan-check.mjs` | **exit 1** | **exit 0** |
| `plan-check.mjs --self-test` | **exit 1** | **exit 0** (15 senaryo) |
| `plan-check.integration.py` | **exit 1** | **exit 0** (4 PASS) |
| `evidence-reconcile.mjs` | — | 16 makbuz / 166 komut / **0 drift** |
| **TOPLAM** | **123 / 16 FAIL** | **154 / 0 FAIL** |

---

## 3. Kapatılan gerçek kusurlar (hepsi kanıtla)

| # | Kusur | Kök neden | Düzeltme |
|---|---|---|---|
| 1 | `iip21Root()` okuma yolunda veri yazıyordu | IIP-21 (`de59f03`) render'da `data.programs` oluşturuyordu | Okuma/yazma ayrıldı (`iip21WriteRoot`) |
| 2 | **Kardeş-kart regresyonu** — 13 fixture sessizce kırıldı | Aynı dosyaya yazan kart, önceki kartların fixture'larını koşmuyordu | **P13 kapısı**: `FIXTURE-MAP.json` + `plan-check` doğrulaması |
| 3 | 7 bayat cache-bust pini | `index.html` doğruydu, test pinleri kalmıştı | `git show` ile meşruluk kanıtlandı, gerekçeli güncellendi |
| 4 | 4 fixture'da `==` yanlış-pozitifi | `App\.[…]\s*=` regex'i `==`'in ilk `=`'ini yakalıyordu | `=(?!=)`; **mutasyon testiyle** doğrulandı |
| 5 | IIP-03 panel payda bekçisi bayat | Panel sahte oranı bırakmıştı | Negatif kontrole çevrildi |
| 6 | IIP-14/15 snapshot pin bayat | IIP-20/21 üç root alanı ekledi | `--print-hash` üreticisi + kanonik değerler |
| 7 | IIP-22'de **çalıştırılamaz komut** | `node -e index-inline-script-syntax-check` → `ReferenceError` | Gerçek kontrol: `tools/check-index-inline-scripts.cjs` |
| 8 | Kanıt makbuzları bugünkü gerçeği yansıtmıyordu | Kayıtlar denetlenmiyordu | `tools/evidence-reconcile.mjs` — 166 komut yeniden koşuldu |

---

## 4. Kanıt zinciri

**Kapanış belgeleri** (`evidence/`):
- `DENETIM-BASELINE.md` — denetim öncesi ölçüm
- `DENETIM-SONRASI.md` — önce/sonra karşılaştırma
- `KAPANIS-P13-P14-P10.md` — üç sınırın kapanışı + kod denetimi
- `P08-MAKBUZ-UZLASTIRMA.md` — makbuz uzlaştırması
- `IIP-PERF-LOCAL.json` + `IIP-PERF-PROTOKOL.md` — performans
- `QA-LOCAL-VISUAL-20260922.md` — kontrollü yerel görsel QA (seviye 2)

**Araçlar** (`tools/`):
- `plan-check.mjs` · `plan-check.integration.py` — plan bütünlüğü
- `fixture-map-build.mjs` — fixture → üretim haritası
- `evidence-reconcile.mjs` — makbuz uzlaştırma
- `check-index-inline-scripts.cjs` — inline script syntax
- `session-brief.mjs` · `plan-check.integration.py`

---

## 5. Dürüstçe açık bırakılanlar

Bu maddeler **kapatılmış gibi raporlanamaz**; kayıtları da öyle diyor:

| Konu | Kayıt | Neden |
|---|---|---|
| Cihaz kabulü | `deviceAcceptance: user_attested` · `agentVerified: false` | Cihaz onayını yalnız kullanıcı verir (kök kural). Kayıt **kullanıcı beyanıdır**, ajan doğrulaması değil. Cihaz: iPhone 15 Pro Max. |
| Hedef cihaz p50/p95 | `performanceAcceptance: user_accepted` · `p50Ms/p95Ms: null` | **Sayı yok.** Kullanıcı kabulüyle kapandı; `p95 ≤ 200 ms` hedefi sayısal olarak doğrulanmadı. Ölçüm protokolü `IIP-PERF-PROTOKOL.md`'de hazır. |
| Gerçek ekran okuyucu testi | — | Ajan tarayıcı otomasyonuyla doğrulamaz (kök kural 6). |
| Yerel görsel QA kapsamı | `localVisualQa: passed` (seviye 2) | Auth kapısında duruldu; token/parola alanı okunmadı/doldurulmadı. İç yüzeyler bu seviyede kapsanmaz. |

---

## 6. Yayın

| Commit | İçerik |
|---|---|
| `8ba784e` | IIP-23/24 kanıt ve durum kayıtları + denetim programı |
| `fc6f265` | Bayat pinler + **gerçek render mutasyonu** + plan araçları |
| `70e42bc` | Kardeş-kart regresyon kapısı (P13) + perf ölçümü + dürüst cihaz kaydı |
| `ea500ed` | Cihaz teyidi + P06 kod denetimi |
| `242938b` | Kontrollü yerel görsel QA (seviye 2) |
| `deec999` | Makbuz uzlaştırması (P08) |
| `d2600c7` | Cihaz modeli (iPhone 15 Pro Max) |
| `1e1e172` | P14 performans maddesi kullanıcı kabulüyle kapatıldı |

Her commit Pages deploy'u tetikledi; son deploy **success**, canlı site **HTTP 200**,
`app/core/saygi.js` yerel ile **bit düzeyinde aynı**.

---

## 7. Yeni oturum için not

Program kapandı. **Yeni bir IIP işi başlatılmaz**; aşağıdaki iki durumda
`IIP-STATE.json` yeniden açılır:

1. **Hedef cihaz p50/p95 ölçümü** yapılırsa → `performanceAcceptance` sayısal kanıta yükseltilir
   (protokol: `evidence/IIP-PERF-PROTOKOL.md`).
2. **Yeni içerik/kart ihtiyacı** doğarsa → ayrı kapsam değişikliği ve kullanıcı onayı gerekir
   (plan kuralı: "yeni içerik ihtiyacı insan incelemesi ister").

**Klasör taşınmadı, bilinçli olarak.** Program kökünde kalıyor çünkü taşıma
şunları kırar (2026-09-22'de simülasyonla ölçüldü):
- `tests/app/test_iip_17.js` — IIP-17 render artifact'ini kendi klasörüne yazar
- 16 kanıt makbuzu — `commands[]` içinde `ilham-ibadet-premium-plan/tools/plan-check.mjs` yolunu kaydeder
- `tools/evidence-reconcile.mjs` · `tools/fixture-map-build.mjs` — yol sabitleri
- Plan-içi bağlantılar (`../docs/`, `../tests/`, `../archive/`)
- `tests/README.md` · `AGENTS.md` · `CLAUDE.md` yönlendirme maddeleri

`plan-check.mjs` yine de **taşımaya dayanıklı** hale getirildi (repo kökü artık
`app.js` sembolünden çözülüyor, sabit varsayım yok) — ileride taşınma kararı
verilirse araç hazır.

---

## 8. Son kontrol ve kapanış notu (2026-09-23)

Kullanıcı isteğiyle son bir kontrol yapıldı: **uygulanmamış iş kalmadığı
doğrulandı** ve iki bayat durum alanı düzeltildi.

### Uygulanmayan iş: YOK — ölçülmüş kanıt

| Kontrol | Sonuç |
|---|---|
| `done` olmayan kart | **0** (24/24 `done`) |
| Kilit / `plannedWriteFiles` taşıyan kart (yani süren iş) | **0** |
| `P00–P17` düzeltme promptları | 18/18 kapandı (122 referans) |
| Kapanıştan sonra plana eklenen yeni iş | **yok** (son plan commit'i `34c5131`, kapanış kaydı) |
| `nextExecutableCard` | `null` |

### Düzeltilen bayat alanlar

`IIP-STATE.json` içinde iki alan kapanışta güncellenmemiş kalmıştı:

| Alan | Önce | Sonra |
|---|---|---|
| `status` | `in_progress` | **`done`** |
| `planStatus` | `in_progress` | **`done`** |
| `updatedAt` | `2026-09-22` | `2026-09-23` |

`planStatus` üretilen görünüme yansıdığı için `tracking/CURRENT-STATE.md`
yeniden üretildi (`plan-check.mjs --render`). `recommendedFirstCard: "IIP-01"`
**bilinçli olarak korundu** — `plan-check` onun geçerli bir kart kimliği olmasını
zorunlu kılar ve program kapanınca "ilk kart" yerine `nextExecutableCard: null`
anlamlı birincil sinyaldir.

> **Ders:** Kart durumları doğru olsa bile üst düzey `status`/`planStatus`
> kapanışta elle güncellenmeli. `plan-check` bu iki alanı *doğrulamaz* — bu
> yüzden sapma sessizce kalır. Kapanış damgası atarken üst düzey durumu da
> damgala.

### Doğrulama (2026-09-23)

- **156 fixture PASS / 0 FAIL** (app + panel + panel-v2 + quran + reminders)
- **9 araç kapısı exit 0:** `plan-check` · `plan-check --self-test` ·
  `plan-check.integration.py` · `evidence-reconcile` · `fixture-map-build` ·
  `driver.mjs` · `zikr-harness.mjs` · `shell-inventory --gate` ·
  `run-reminder-smoke`

---

## 9. Klasör neden kökte kalıyor (taşıma reddi — 2026-09-23)

Kullanıcı "yoksa kaldır/taşı" dedi. **Taşıma yapılmadı**; gerekçe ölçülmüş
bağımlılık, tercih değil.

Ölçüm (2026-09-23):

| Bağımlılık | Sayı / konum |
|---|---|
| Kanıt makbuzu `commands[]` içinde plan-check yolu | **20 dizin / 41 dosya** |
| `tools/evidence-reconcile.mjs` | kök yolu sabit: `ilham-ibadet-premium-plan/evidence` |
| `tools/fixture-map-build.mjs` | plan yolu + `note` alanı |
| `tests/FIXTURE-MAP.json` | `note` alanı plan-check'e atıf |
| `tests/app/test_iip_17.js` | render artifact'ini **plan klasörüne YAZAR** |
| Kök dokümanlar | `AGENTS.md`(1) · `CLAUDE.md`(1) · `tests/README.md`(5) · `archive/README.md`(2) |

**Kritik ayrım — kardeş programlarla farkı:** `archive/` altındaki MON · MON2 ·
FX2 klasörlerine `tools/`+`tests/` içinden **yalnız 2'şer referans** var (ad
gеçişi). IIP'te ise **20 makbuz dizini (41 dosya) canlı bir aracın yolunu
kaydeder** ve bu yollar `evidence-reconcile.mjs` tarafından **bugün hâlâ yeniden
koşulur**. Taşıma bu kayıtları "command not found" durumuna düşürür.

Ek olarak `docs/IIP-KAPANIS.md` §7'de kayıtlı taşıma simülasyonu zaten
yapılmıştı (aynı sonuçlar). Bu bölüm o kararı **ölçümle yeniden doğrular**.

> **Sonuç:** IIP kökte kalır. Arşiv statüsü zaten `status: done` + kapanış
> belgesi + `archive/README.md`'deki "Kapanmış ama TAŞINMAMIŞ program" bölümüyle
> ilan edilmiştir. Taşıma ancak 41 makbuzun yolları toplu yeniden yazılıp
> `evidence-reconcile` yeşil kalırsa gündeme gelebilir — ayrı bir onay ister.


---

## 8. Kapanış sonrası: yayın yüzeyi sızıntısı (2026-09-22)

Program kapandıktan sonra, kapanışı izleyen yayın doğrulaması sırasında
`pages.yml` ile ilgili **ayrı bir kusur** bulundu. Bu bir IIP kartı değildir ve
IIP kapsamını yeniden açmaz; buraya yalnız kayıt için yazılmıştır.

**Kusur.** `pages.yml` depo kökünü "olduğu gibi" yayınlıyordu. İlk sertleştirme
turunda `docs/` `tests/` `archive/` `.claude/` dışlanmıştı; aynı desenle
`tools/` `files/` `ilham-ibadet-premium-plan/` `kuran-ogreniyorum/` `jev-gate/`
**açıkta kaldı**.

**Kanıt (curl).** Deploy öncesi canlı sorgu:

| URL | Kod |
|---|---|
| `tools/evidence-reconcile.mjs` | `200` |
| `ilham-ibadet-premium-plan/IIP-STATE.json` | `200` |
| `kuran-ogreniyorum/KAO-STATE.json` | `200` |
| `jev-gate/JEV-GATE-STATE.json` | `200` |
| `v3-tanitim/` (kasıtlı yayında) | `200` |
| `docs/ tests/ archive/ files/ panel/ .github/ .claude/ app/ assets/` | `404` |
| `README.md` | `404` (`.md` dışlı) |

**Sır veya kişisel veri açığa çıkmadı.** `files/yedek/latest-*.json` (kişisel
veri yedeği) git'te **takipli değil** — bu yüzden zaten yayınlanmıyordu (`404`).
Açıkta kalanlar plan durum JSON'ları, kanıt dosyaları ve ajan araçlarıydı.

**Düzeltme.** Beş `--exclude` + guard dizin listesine eklendi. Ölçüm: staged
ağaç **233 → 69 dosya**.

**Kalıcı koruma.** Yeni fixture `tests/app/test_deploy_surface_contract.js`
(73 kontrol) iddiayı metin taramasıyla değil, `pages.yml`'den çıkarılan gerçek
rsync bayraklarıyla staged ağacı kurarak doğrular. Mutasyonla kanıtlandı: bir
`--exclude` kaldırılınca sızıntı yakalanır. `tests/FIXTURE-MAP.json` yeniden
üretildi; `tests/README.md` envanterine eklendi.

