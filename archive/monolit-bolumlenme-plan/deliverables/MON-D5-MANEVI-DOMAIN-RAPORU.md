# MON-D5 · Manevi domain çapraz regression raporu

Tarih: 2026-09-04
Durum: ✅ TAMAMLANDI
Öncül: MON-23
Sınıf: kapanış / yalnız kanıt ve durum zinciri
Dal: `zikirmatik-manuel-zikir` · LOCAL-ONLY

## 1. Kapsam ve karar

Bu kart üretim kodu, fixture semantiği, `sync.js`, veri, panel veya render
taşıması yapmadan dört manevi registry'nin canlı yönlerini ve yan etki
sınırlarını denetledi. Yeni domain, `appSurface` veya `render` taşıması yoktur.

Kabul kararı: Prayer, Zikir, Quran ve Saygı registryleri arasında circular
dependency yok; registry yüklenirken hiçbirinde load-time persistence, ağ,
timer veya DOM başlatımı yok. Saygı'nın Prayer/Zikir bağlantıları görünür,
çağrı-anında çözülen resolver kenarlarıdır. Komşu `window.Seyma*` registry
nesnesine doğrudan yazım bulunmadı.

## 2. Dört registry yönlü dependency tablosu

Üretim yükleme sırası ilgili core bölümünde şöyledir; bu oklar dependency
değil, önkoşul yükleme sırasını gösterir:

`state/dateUtils/syncGlue/helpers → Prayer → Zikir → Quran → Saygı → mediaFx/timeTheme`

| Registry | Açık dependency bag'i ve yön | Dört manevi registry ile kenar | Yan etki / sahiplik sınıfı |
|---|---|---|---|
| `window.SeymaPrayer` (`app/core/prayer.js:18-26`) | `data`, `getDay`, `dayIndexFor`, `todayStr`, `addDays`, `pad`, `esc`, `save`, `storage`, `fetch` | Manevi registrylerden dışarıya doğrudan kenar yok | Saf şehir/vakit hesapları ve B1 canlı state okuması; cache/fetch yalnız açık `fetchPrayerTimes()` çağrısında; prayer günü apply ve save kendi domain yolunda |
| `window.SeymaZikr` (`app/core/zikir.js:8-16`) | Motor bag'i: `data`, `getDay`, `todayStr`, `addDays`, `dayIndexFor`, `save`; görünüm bag'i `app.js:238-260` içinde açıkça tamamlanır | Prayer/Quran/Saygı'ya doğrudan kenar yok; mevcut `SeyAudio.tap` FX yüzeyi (`app/core/zikir.js:477-480`) ayrı registry değildir | Zikir root/session/hatim ve manuel kayıt mutation'ı kendi domaininde; view üreticileri registryde, overlay/paint/draft kabuğu app.js'te |
| `window.SeymaQuran` (`app/core/quran.js:40-51`) | Named bag yalnız canlı `data` resolver'ıdır; kataloglar çağrı anında `QuranRevelationOrderV1`/`QuranStrikingVersesV1`, outbox yazıcısı çağrı anında `SeySync` çözer (`:253-258`) | Prayer/Zikir/Saygı'ya doğrudan kenar yok | Normalizer/reducer ve read-only remote apply; DOM/storage/fetch/timer yok; outbox transport ve save app/sync sınırlarında |
| `window.SeymaSaygi` (`app/core/saygi.js:13-17`) | `data`, `ui`, `getDay`, tarih yardımcıları, `icon`, `esc`, `featuresLive`, `render`, app-owned `quranJourneyHubCardHTML`, `zikrVisible`, `zikrPreviewCardHTML` | Doğrudan lazy `SeymaPrayer` (`:45-50`, `:176-205`) ve `SeymaZikr` (`:157-160`, `:215`); Quran kartı app.js kabuğu üzerinden (`app.js:400`) | Saygı/İman/kıble HTML ve okuma alanı; Saygı kaydı kendi state'ine gider. Prayer cache'ine veya komşu registry nesnesine yazan atama yok |

Bağımlılık grafiğinin yönü kullanan registryden çözülen registryye doğrudur:

```text
Saygi ──lazy resolver────────────────────> Prayer
Saygi ──lazy resolver────────────────────> Zikir
Saygi ──app.js quranJourneyHubCardHTML───> Quran
```

Bu yönlü grafikte cycle yoktur; yükleme önkoşulu bu yüzden `Prayer/Zikir/Quran`
sonra `Saygi` şeklindedir. `Prayer`, `Zikir` ve `Quran` kaynaklarında diğer üç
manevi registryye resolver kenarı, yazım veya geri kenar bulunmadı. Kaynak
taramasındaki tek registry expose ataması
her dosyanın kendi `window.Seyma<Domain>={...}` satırıdır
(`prayer.js:185`, `zikir.js:973`, `quran.js:324`, `saygi.js:249`).

### Cross-domain yazım yorumu

Saygı, İman/rapor HTML'i için Prayer'ın `ensurePrayerDay` ve Zikir'in
`zikrWeek`/`zikrStreak` resolverlarını çağırır. Bu çağrılar görünür dependency
kenarlarıdır; `window.SeymaPrayer` veya `window.SeymaZikr` nesnesine atama
yapmazlar. Eksik local day/root için mevcut additive normalizer davranışı
vardır; bu kartta değiştirilmemiş ve “komşu registryye yazım” olarak
gösterilmemiştir. Prayer cache yazıcısı yalnız `prayer.js` içindedir; Saygı
cache yazıcısını çağırmaz.

## 3. Load-safe ve lazy sınır kanıtı

| Registry / fixture | Load sırasında gözlenen | Açık çağrı kanıtı |
|---|---|---|
| Prayer | `test_prayer_boundary.js`: fetch `0`, timer `0`, cache/localStorage `0` | Explicit mock fetch sonrası `19/19`; cache hit ikinci fetch'i kesiyor, apply canlı günü ve save shim'ini kullanıyor |
| Zikir | `test_zikir_boundary.js`: storage/fetch/timer `0`; DOM/fetch/setTimeout sahipliği yok | Motor, canlı rebind, FX tap guard ve explicit manual save `17/17` |
| Quran | `test_quran_boundary.js`: fetch/storage/timer `0`; kaynakta DOM/storage/fetch/timer yok | Reducer ve read-only remote apply, duplicate/idempotence ve `200→304→200` ailesi `20/20` + Quran ailesi PASS |
| Saygı | `test_saygi_boundary.js`: storage/ağ/timer `0`; DOM, storage, timer ve observer yolları yalnız çağrı gövdelerinde | SaygiPeople/Hijri ilk çağrı lazy; modal/focus ve kıble sınırı `20/20`, modal `39/39` |

Hiçbir registry yüklemesi `data=` rebind etmez. App.js'in canlı state/rebind
sahipliği ve dokuz data assignment source-line / on bir token ölçümü
`test_state_rebind_boundary.js` ile yeniden PASS edilmiştir.

## 4. Zikir / Quran / Saygı dump kayıtları

`node .claude/skills/run-seyma/driver.mjs --dump saygi` ile alınan aynı
sentetik seeded `#app` çıktısından üç kapsamlı preview parçası ayrıştırıldı:

| Surface | Byte | SHA-256 | Not |
|---|---:|---|---|
| `#zikr-preview-card` | 1879 | `7aad7c7858bf254fded2cac0a42310dc2a0a67076d994000325eacbfdf3d37eb` | MON-21 canlı preview paritesiyle eşit |
| `#quran-journey-card` | 1834 | `aeb3ac22336660eeab164a6cdb37ed5c4e7337e6eca4274a9d7b3c623dbc94ae` | Çarpıcı âyet başlangıcı random olduğu için bu koşum snapshot'ıdır; yapısal kabul Quran ailesindedir |
| `#saygi-preview-card` | 2175 | `3d2257924c9bdf52d1ee2f9dc5a5042cd4f53381a307484711db67e08ec59a44` | Seeded app render snapshot'ı |

Deterministik Saygı boundary fixture'ının Grace Hopper sentetik preview
parçası ayrıca `1219` byte / SHA-256
`c69bee63eadfd109b8daa51b438e580ea6e88e7339356b21bfd534e0a853cf86` olarak
korunmaktadır (`test_saygi_boundary.js`). Bu kartta dump kaynakları veya
fixture semantiği değiştirilmedi.

## 5. FX manifest farkı

MON-S2 canlı app.js referansı ile mevcut kaynak aynı ölçüm yöntemiyle
karşılaştırıldı:

| FX yüzeyi | MON-S2 referansı: satır / occurrence | MON-24 canlı app.js: satır / occurrence | Delta | Açıklama |
|---|---:|---:|---:|---|
| `SeyAudio` | 27 / 53 | 24 / 50 | -3 / -3 | MON-20'de `zikrTickSound` gövdesinin registryye alınmış kabul edilmiş delta'sı; kalan tap guardı `zikir.js:477-480` |
| `SeyHaptics` | 21 / 42 | 21 / 42 | 0 / 0 | Değişmedi |
| `SeyFx` | 2 / 4 | 2 / 4 | 0 / 0 | Değişmedi |
| `SeyTimeTheme` | 2 / 2 | 2 / 2 | 0 / 0 | Değişmedi |

Prayer, Quran ve Saygı registry kaynaklarında FX registry'sini yeniden
tanımlayan/saran veya yeni FX çağrı yüzeyi açan satır yoktur. MON-24'te
`mediaFx.js`, app.js FX çağrı sırası, guard biçimleri ve argümanlar
değiştirilmedi. FX ailesi toplamı `249/249` PASS'tır.

## 6. Değişmezlik / durum farkı

Bu karar kartında kaynak diff'i yoktur: dört registry, app.js, index.html,
driver/zikr `FILES`, cache-bust değerleri, sync.js, panel, content ve fixture
semantiği önce/sonra aynıdır. Bu nedenle I1–I6 ve M1–M4 delta'sı `0`'dır:

| Invariant | MON-24 sonucu |
|---|---|
| I1 | Tek `data` object, persistence ve migration zinciri değişmedi |
| I2 | App handler ad/imza/alias ve inline onclick sözleşmesi değişmedi |
| I3 | `migrate` eski/normal/future parity'si değişmedi; B2 `60/60` |
| I4 | Render çağrı yolu ve ortak modal keyboard contract değişmedi; `39/39` |
| I5 | `sync.js`, Guard 1/2, remote/data yazımı değişmedi |
| I6 | Bu kart için tek geri alınabilir yerel commit |
| M1 | Registryler mevcut canlı resolver/shim modelinde kaldı; eager iş yok |
| M2/M2prime | `data`/`ui`/`dark`, import/reset/late-boot rebind app.js'te kaldı |
| M3 | Sync callback sahipliği app.js'te, syncGlue setter trap kurmuyor |
| M4 | Premium FX API ve guarded call-site semantiği değişmedi |

Cache-bust / FILES etkisi: yeni core dosyası yok; `index.html`, `driver.mjs` ve
`zikr-harness.mjs` FILES listelerinde değişiklik yok; yeni `?v=` gerekmedi.
Mevcut üretim sırası `prayer → zikir → quran → saygi → mediaFx` ve iki ana
harness paritesi PASS kaldı.

## 7. Kapı paketi

Tüm koşumlar ağsız Node/VM veya mock fixture sınırında, exit `0` verdi:

- Syntax: `node --check app.js`, `sync.js`, dört registry.
- State/B1/B2/B3: `0 failure`, `60/60`, `20/20`; state rebind ve syncGlue save PASS.
- Domain boundary: Prayer `19/19`, Zikir `17/17`, Quran `20/20`, Saygı `20/20`.
- `driver.mjs`: exit `0`; `zikr-harness.mjs`: `95/95`.
- Modal focus: `39/39`; Zikir manual: PASS; modularization/Faz−1.1/date-utils/helpers: PASS.
- Quran ailesi: `66/66 + 70/70 + 9/9 + 38/38 + 55/55 + 9/9 + 17/17 + 41/41 + 207/207 = 512/512`.
- Premium ailesi: 8 fixture, toplam `249/249`.
- Faz10 sync, large-file, panel Faz11 ve reminder smoke: PASS.
- `git diff --check`: PASS.

## 8. Açık kalanlar ve sınırlar

Bu rapor headless kaynak/fixture kanıtıdır. Browser/device acceptance,
remote push, merge, tag, GitHub Pages deploy ve `mustafaras/seyma-data` yazımı
yapılmadı ve bu kart tarafından açılmadı. Bir sonraki sıralı kart MON-25'tir;
yeni açık kullanıcı yönü olmadan başlatılmaz.
