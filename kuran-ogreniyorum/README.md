# Kur'an Arapçası Öğreniyorum (KAO) — Araştırma ve plan

**20 Eylül 2026 · Planlama teslimatı v2 · Üretim kodu 0/0 (henüz hiçbir kart açılmadı).**

**Kullanıcı kararları (v2):** KAO, yürüyen İlham & İbadet planından **farklı ve
bağımsız**dır; hub'a yalnız bir **kart** eklenir, içerik kendi overlay'inde
görülür; hedef kitle **sıfırdan başlayan**, amaç **Kur'an Arapçasını Türkçe
anlamak**; **telaffuz** ana katmandır. Kalite hedefi "world-class" bir
kanıt-koşulları setine çevrilmiştir ([08](08-KALITE-VE-KABUL.md)); henüz elde
edilmiş bir sonuç olarak kullanılmaz.

Şeyma'ya, **hiç Kur'an Arapçası bilmeyen, ana dili Türkçe** bir öğreniciye
Kur'an'ın kelimelerini, anlamlarını ve gramerini **bilimsel öğrenme
ilkeleriyle** öğreten, **ayrı bir modül** eklemenin planıdır. Bu klasör yalnız
plan ve araştırma içerir; `app.js`, `app/core/*`, `app/content/*`, `index.html`
ve testlere **dokunulmamıştır**. Repoda eş zamanlı çalışan diğer ajanların
alanlarına (`archive/ilham-ibadet-premium-plan/`, `app/core/saygi.js` vb.) girilmez.

## Bir cümlede

> "Zaten her gün namazda okuduğun 150–200 kelimeden başla; Türkçede zaten
> bildiğin 225 kelimeyi 'tanı', bilmediğin 275 kelimeyi aralıklı tekrarla
> öğren; her kelimeyi kökü ve kalıbıyla gör; günde 10 dakikada Kur'an
> kelimelerinin %80'ine ulaş."

## Neden ayrı bir modül?

- Mevcut **Kur'an Yolculuğu** (`app/core/quran.js`) bir *istek → video → izleme*
  akışıdır (Raşit ile sûre sûre yolculuk). KAO bir *öğrenme motoru*dur: kelime
  envanteri, aralıklı tekrar zamanlayıcısı, alıştırma türleri, ilerleme.
  İki alan aynı hub'da yaşar ama farklı veri kökleri, farklı registry ve farklı
  fixture ailesine sahiptir (bkz. [05](05-VERI-MODELI-VE-TEKNIK.md)).
- Monolit bölünme programları (MON/MON2) kapandı; yeni bir `app/core/*`
  modülü **yeni bir program** gerektirir ve dört yükleme listesine aynı
  commit'te eklenmelidir (CLAUDE.md, MON-25 dersi). KAO bu programdır.

## Oturumda yalnız bunu kullan

**[Tek sıralı prompt dosyası: UYGULAMA-PROMPTLARI.md](UYGULAMA-PROMPTLARI.md)** — 37 prompt
(KAO-P00 başlangıç · 30 kart · 6 dalga denetimi KAO-D1…D6). Her yeni oturumda
tek promptun "Yeni oturuma yapıştır" bloğu kopyalanır. Canlı durum:
[.anti-amnesia/CURRENT-STATE.md](.anti-amnesia/CURRENT-STATE.md) (üretilmiş),
olay günlüğü [.anti-amnesia/LEDGER.md](.anti-amnesia/LEDGER.md), makine kaynağı
[KAO-STATE.json](KAO-STATE.json). Denetim:

```sh
node kuran-ogreniyorum/tools/kao-plan-check.mjs            # salt-okur; FAIL → exit 1
node kuran-ogreniyorum/tools/kao-plan-check.mjs --render   # CURRENT-STATE.md üret
node kuran-ogreniyorum/tools/kao-plan-check.mjs --self-test
node kuran-ogreniyorum/tools/kao-plan-check.mjs --card KAO-07
```

Denetleyici şunları **makine olarak** zorlar: prompt sırası = STATE sırası,
bağımlılık/kapı/`gateApproval`, `KAO-xx:` konulu her commit'in yalnız o kartın
izinli dosyalarına dokunması, 26 gereksinimin sahibi olması, ledger seq
sürekliliği, `done` için EVIDENCE.json, KAO kaynaklarında yasak ifadeler
(`SeyAudio.say`, `localStorage`, dış `fetch`, `verified:false`) ve dört yükleme
listesi eşitliği. İçeriğin dinî/dilbilimsel doğruluğunu ve ekran kalitesini
otomatik kanıtlayamaz — onlar insan doğrulaması ve cihaz kabulüdür.

## Okuma sırası

| # | Dosya | Ne verir |
|---|---|---|
| 1 | [01-ARASTIRMA.md](01-ARASTIRMA.md) | Korpus istatistikleri, Türkçe konuşanın avantajı (500 kelime → net 275), öğrenme bilimi kanıtları, mevcut uygulamalar, veri kaynakları ve lisanslar |
| 2 | [02-PEDAGOJI.md](02-PEDAGOJI.md) | Bilimsel öğrenme tasarımı: ilke → mekanik eşlemesi (aralıklı tekrar/FSRS, geri çağırma, kök-kalıp, kognat, TFE, bağlam) |
| 3 | [03-MUFREDAT.md](03-MUFREDAT.md) | 0. seviyeden 6. seviyeye müfredat: harf/hareke kapısı, 12 ünite, 24 gramer mikro-kavramı, 500 kelimelik envanter planı, kilometre taşları |
| 4 | [04-DENEYIM-VE-TASARIM.md](04-DENEYIM-VE-TASARIM.md) | Uygulamaya yerleşim, 11 ekran, 390 px wireframe'ler, token/tipografi/hareket/erişilebilirlik sözleşmesi |
| 5 | [05-VERI-MODELI-VE-TEKNIK.md](05-VERI-MODELI-VE-TEKNIK.md) | `data.quranLearn` şeması, `migrate()` kancası, registry/içerik modülleri, yükleme sırası, panel aynası, sync bütçesi, fixture'lar |
| 6 | [06-ICERIK-URETIM-HATTI.md](06-ICERIK-URETIM-HATTI.md) | Korpus → sözlük derleme aracı → insan doğrulaması → dondurma; lisans karar tablosu |
| 7 | [07-UYGULAMA-KARTLARI.md](07-UYGULAMA-KARTLARI.md) | 6 dalga / 30 kart, bağımlılık, durma noktaları, onay kapıları |
| 8 | [08-KALITE-VE-KABUL.md](08-KALITE-VE-KABUL.md) | Kanıt düzeyleri, pedagojik ölçütler, test/kontrast/harness kapıları |
| 9 | [09-KAYNAKLAR.md](09-KAYNAKLAR.md) | Tüm kaynak bağlantıları ve ne için kullanıldıkları |
| 10 | [10-TELAFFUZ.md](10-TELAFFUZ.md) | Türkçe konuşan için ses envanteri (3 kova), mahreç, çekirdek okuma kuralları, algı-önce HVPT yöntemi, gölgeleme, ses varlıkları ve lisans |
| 12 | [12-EK-GEREKSINIMLER.md](12-EK-GEREKSINIMLER.md) | **Bağlayıcı** 26 ek gereksinim (R-A1…A9 bilimsel, R-B1…B8 tasarım, R-C1…C9 ürün); kart ve kabul kontrolü eşlemesi |
| 11 | [11-BAGIMSIZLIK-SOZLESMESI.md](11-BAGIMSIZLIK-SOZLESMESI.md) | KAO ⟂ IIP: sahiplik sınırları, tek satırlık kart sözleşmesi, test/zaman bağımsızlığı, çatışma çözümü |
| — | [UYGULAMA-PROMPTLARI.md](UYGULAMA-PROMPTLARI.md) · [KAO-STATE.json](KAO-STATE.json) · [.anti-amnesia/](.anti-amnesia/CURRENT-STATE.md) · [templates/](templates/EVIDENCE.template.json) · `tools/kao-plan-check.mjs` | Sıralı promptlar, makine durumu, güncel durum + günlük, kanıt/devir şablonları, denetleyici |

## Değişmezler (bu plan hangi kurallara bağlı)

7. **Ek gereksinimler bağlayıcıdır** — [12](12-EK-GEREKSINIMLER.md)'deki 26 madde
   öneri değil şarttır; kabul kontrolü geçmeyen kart kapanmaz.

0. **Bağımsızlık** — KAO, IIP programından bağımsızdır; tek temas noktası
   hub'daki karttır ([11](11-BAGIMSIZLIK-SOZLESMESI.md)).
1. **Veri güvenliği** — CLAUDE.md "DATA SAFETY" bölümü olduğu gibi geçerlidir.
   Sözlük, gramer, fonetik ve âyet örnekleri `app/content/*` olarak paketlenir;
   tek ağ erişimi aynı-origin **salt-GET ses klipleri**dir. Mikrofon kaydı
   yalnız bellekte kalır, hiçbir depoya/sync'e yazılmaz. `mustafaras/seyma-data`'ya
   yazma kararı kullanıcınındır.
2. **Tek `data` nesnesi** — ilerleme `data.quranLearn` altında tutulur;
   `migrate()` yeni alanı `ensureQuranLearn(d)` ile geriye dönük üretir.
3. **App yüzeyi kalıbı** — `onclick="App.kao*(...)"`, `ui.kao*` geçici durum,
   overlay için okuma/izleme/dinleme şablonu ve `App.onModalKeydown` klavye
   sözleşmesi. `addEventListener` ile yeni bağlama yok.
4. **Tasarım sistemi** — yeni renk markası yok. `--quran`/`--quran2`/
   `--quran-surface`/`--quran-ink` ailesi ve `--faith` tonu temel alınır;
   Arapça yığın `"Noto Naskh Arabic","Amiri","Scheherazade New"` mevcut
   yığındır. Yeni token yalnız açık/koyu çiftle ve gerçek ihtiyaçta.
5. **İçerik doğruluğu** — Arapça harf/hareke ve Türkçe anlam, korpustan
   türetilir ve **satır satır insan doğrulaması** olmadan `verified:true`
   alamaz (`quranStrikingVersesV1.js` ile aynı disiplin). Hafızadan yazılmış
   Arapça içerik üretim koduna giremez.
6. **Onay kapıları** — push, deploy, tag, `main`'e merge ve veri deposuna yazma
   ayrı ayrı kullanıcı onayı ister. `releaseApproval = NOT_APPROVED`.

## Şu an ne hazır, ne bekliyor

Hazır: araştırma, pedagoji (kanıt kütüphanesi), müfredat (+telaffuz hattı),
tasarım (11 ekran), veri modeli, içerik + ses hattı, bağımsızlık sözleşmesi,
30 kart + 26 bağlayıcı ek gereksinim ([12](12-EK-GEREKSINIMLER.md)), 37 sıralı
prompt, anti-amnesia takibi ve çalışan denetleyici (12/12 self-test). Bekleyen: kullanıcının plan onayı → **KAO-P00** (branch + iskelet), ardından
KAO-01 (sözlük derleme aracı). Kaynak baseline: `0436405`, `main`, 2026-09-20.
