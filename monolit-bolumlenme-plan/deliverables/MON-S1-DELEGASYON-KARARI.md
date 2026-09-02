# MON-S1 — `app.js` Delegasyon Sözleşmesi Kararı

**Program:** `MONOLIT-BOLUMLENME` · **Prompt:** `MON-01` · **Tarih:** 2026-09-02
**Karar:** ✅ Kabul edildi — *load-safe registry + app.js imza-koruyan shim*
**Kapsam:** Bu belge mimari kararı ve canlı baseline'ı kaydeder. Üretim kodu,
`index.html`, harness, fixture, `sync.js`, panel, content modülleri veya veri
değiştirilmemiştir.

## 1. Karar özeti

Her ileriki taşıma, yalnız bütün bağımlılıkları bu belgede tanımlı güvenli
yolla çözülebiliyorsa aşağıdaki biçimi kullanır:

```js
// app.js — mevcut isim/imza, ince delege
function hedef(a, b){
  return window.SeymaOrnek.hedef.apply(null, arguments);
}

// app/core/ornek.js — app.js'ten önce yüklenen, yan etkisiz IIFE registry
(function(){
  'use strict';
  window.SeymaOrnek = { hedef: function(a, b){ /* taşınmış gövde */ } };
})();
```

Bu şablon **yalnız özgür fonksiyonlar** için kabul edilmiştir: taşınmadan önce
fonksiyonun dinamik `this`, lexical closure, gizli DOM/ağ/timer yan etkisi ve
global yazma bağımlılığı envanterle kanıtlanır. `this` kullanan veya açık bir
bağımlılık rotası bulunmayan gövde bu şablona zorlanmaz; ilgili MON promptu
bloklanır ve yeni karar seçeneği üretilir.

## 2. CANLI baseline — 2026-09-02

| Konu | Ölçülen gerçek | Koruma / yorumu |
|---|---|---|
| `app.js` | 18.957 satır; IIFE sonu 18.957 | geçiş boyunca tek IIFE kalır |
| `var data=null` | 2713 | bildirimin kendisi app.js sahibidir |
| B1 getter | 4424–4430; 7 ayrı `Object.defineProperty` | `data/ui/dark/migrate/getDay/createDefaultData/save` taze okunur |
| State girişleri | load 4415–4416; `migrate` 4431; `getDay` 4964; default 6726 | M2, M2prime ve I3 referansı |
| Sync / App çıpası | callbacks 6240/6250; `save` 6271; `var App` 6456; `window.App=App` 17021 | callback ve App sahipliği app.js'te kalır |
| Late boot | 18857 | `if(!data)` guard app.js'te kalır |
| `data` kaynak satırı | 9 satır: 2713, 4415, 4416, 6079, 6734, 9266, 9270, 9296, 18857 | çizelge satır ölçüsüdür |
| `data=` tokenı | 11 token; başlangıç bildirimi hariç 10 rebind yazımı | 4415 ve 6079 aynı satırda ikişer yazım içerir; iki metrik karıştırılmaz |
| Geçici takas | 6079: `data=d` → `finally data=savedData` | taşınmaz; `finally` zinciri eksiltilmez |
| `App.x=function` | 545 | isim/imza manifest baseline'ı |
| Tüm `App.x=` satırı | 704 | function dışı alias/property atamalarını da kapsar |
| Inline `onclick="App…"` | 415 occurrence; 321 eşsiz handler adı | I2 için iki ayrı görünüm ölçüsü |
| FX satırları | `SeyAudio` 26; `SeyHaptics` 21; `SeyFx` 2; `SeyTimeTheme` 2 | ad, guard ve ayar anlamı M4 altında korunur |
| Yeni B1 registry tüketimi | `SeymaState`, `SeymaSave`, `SeymaDateUtils`, `SeymaHelpers`: app.js'te 0 doğrudan referans | skeleton durumudur; ilk tüketim kendi MON fixture eşiğinde kaydedilir |

## 3. Devlet ve callback sahipliği

1. `var data`, `ui`, `dark` app.js closure'ında kalır. Yeni modül `data=`
   yazamaz; B1 üzerinden okuma, ancak canlı getter sonradan tanımlandığında
   çözülür.
2. Import/reset/unlock/late-boot yollarındaki rebind'ler app.js'te kalır.
   Özellikle 6079 geçici takası `try/finally` ile bütün olarak korunur.
3. `window.SeyOnSyncState` ve `window.SeyOnSynced`, app.js tarafından 6240 ve
   6250'de atanır. `syncGlue.js` bunlara getter-only property tanımlayamaz:
   strict-mode app.js ataması boot sırasında `TypeError` üretir.
4. `save()` çıkarılabilirse yalnız gövdesi registryye taşınır; app.js imzalı
   shim, callback sahipliği ve `sync.js` Guard 1/2 davranışı korunur. Aksi
   halde `save()` app.js'te kalır ve MON-17 bloke/karar kaydı üretir.

## 4. Seçenekler ve hüküm

| Seçenek | Hüküm | Gerekçe |
|---|---|---|
| A — load-safe registry + app.js shim | **Kabul** | Build'siz statik yükleme sırasıyla ve mevcut IIFE/VM modeliyle uyumlu; küçük, geri alınabilir adımlar sağlar. |
| B — modüle geniş dependency-bag enjekte etmek | **Red** | İlk aşamada closure kaynaklarını maskeleyip `data` snapshot/staleness riski doğurur; bir fonksiyon için açık resolver kanıtı yoksa taşıma yapılmaz. |
| C — `window.data/ui/save = …` snapshotı | **Red** | Rebind sonrası bayatlar; B1 canlı getter kararına aykırıdır. |
| D — modülün doğrudan `data=` yazması | **Red** | M2/M2prime, import/reset/6079 sahipliği ve rollback sınırını ihlal eder. |
| E — global event bus veya bundler | **Red** | Yeni yaşam döngüsü ve hata yüzeyi getirir; statik repo ve headless harness sözleşmesinin dışında. |
| F — `SeyOnSyncState/SeyOnSynced`i syncGlue'ya taşımak | **Red** | Getter-only tuzağı strict-mode boot throw riski taşır; callback sahipliği app.js'tedir. |
| G — app.js'i tek seferde kaldırmak | **Red** | 17021 sonrası App atamalarını, inline handler yüzeyini ve kademeli test eşiğini yok sayar. |

## 5. Her taşıma öncesi zorunlu karar ağacı

1. Aday fonksiyonun tam çağıranlarını, `this` kullanımını, closure sembollerini,
   DOM/ağ/timer yan etkisini ve `data` yazımlarını canlı `rg` ile çıkar.
2. Fonksiyon saf veya B1 ile açıkça salt-okur değilse; yahut app-owned rebind,
   App handler, callback kaydı ise **gövde taşınmaz**. Önce ilgili karar kartı
   veya daha dar bir helper seçilir.
3. Her closure sembolü için mevcut güvenli owner belirlenir. "Şimdilik global
   olur" kabul edilemez; resolver, argüman veya app.js kabuğu açıkça yazılır.
4. Registry IIFE yüklenirken yalnız üyelerini kurar. DOM sorgusu, `fetch`,
   `setTimeout`, listener, localStorage veya state snapshotı çalıştırmaz.
5. app.js shim aynı ad, parametre sırası, return ve hata davranışını korur.
   `this` gerekiyorsa `apply(null, arguments)` kullanılmaz; karar yeniden açılır.
6. Yeni `app/core/*` ancak gerekli olduğunda reminderDelivery sonrasına / inline
   SW öncesine eklenir; cache-bust, `driver.mjs` ve `zikr-harness.mjs` FILES
   güncellemeleri aynı committe olur.
7. Önce/sonra App function, tüm App, onclick, FX ve `data` baseline metrikleri
   kaydedilir. Eşik fixture değişikliği yalnız MON-S5 matrisi izin veriyorsa
   aynı committe yapılır.

## 6. Kesin kapsam dışı

`sync.js`, Guard 1/2, `panel/*`, `app/content/*`, frozen reminder dörtlüsü,
`sw.js`, kullanıcı localStorage'ı, `mustafaras/seyma-data`, token/hesap alanları
ve tarayıcı doğrulaması bu kararla değişmez. Push, merge, tag ve deploy ayrıca
kullanıcı onayı gerektirir.

## 7. MON-01 kanıt paketi ve sonuç

Bu promptta üretim dosyası değiştirilmedi. Kaynak baseline komutları çalıştırıldı;
sonraki prompt için doğrulanacak başlıklar şunlardır: FX/App manifesti (MON-02),
24 modül sahipliği (MON-03), harness paritesi (MON-04) ve fixture eşik matrisi
(MON-05). MON-01 yerel/başsız kanıt düzeyindedir; deploy veya cihaz kabulü
iddiası değildir.
