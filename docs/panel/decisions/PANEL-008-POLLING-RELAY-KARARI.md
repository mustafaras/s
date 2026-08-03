# PANEL-008 — Polling / ETag / Relay Kararı

**Tarih:** 2026-08-03
**Durum:** `ready_for_review`
**Kapsam:** GitHub Pages üzerinde gözlem panelinin güncellenme maliyeti ve
gecikmesi. Bu karar gerçek relay açmaz.

## Karar

ÆON paneli GitHub Contents API üzerinde 15 saniyelik **yakın takip polling**
ile kalır. `data/latest.json` ve yardımcı Contents okumaları memory içi ETag
cache’iyle `If-None-Match` gönderir; `304 Not Modified` geldiğinde snapshot
gövdesi parse edilmez. `panelSig` değişmeyen 200/304 turlarında tam render’ı
engeller; durum rozeti DOM’da hedefli güncellenir.

Bu aşamada SSE/WebSocket relay uygulanmaz. GitHub Pages statik olduğu için
relay ayrı bir auth’lı backend, deploy yüzeyi, işletim maliyeti ve rollback
prosedürü getirir. Mevcut 15 saniyelik gözlem ihtiyacı bu ek yetkiyi
haklılaştıracak şekilde kanıtlanmış değildir.

## Ölçüm sözleşmesi

Panelde dört zaman ve iki revision birbirinden ayrıdır:

- `sourceUpdatedAt`: uygulamanın local snapshot kaynağındaki zaman.
- `acceptedAt`: uzak sync receipt’in kabul zamanı.
- `projectionBuiltAt`: observer projection’ın üretim zamanı.
- `panelPollAt`: panel polling turunun tamamlanma zamanı.
- `sourceRevision`: receipt/latest kaynak revision’ı.
- `visibleRevision`: panelde seçilen projection veya güvenli legacy fallback
  revision’ı.

Telemetry yalnız metadata tutar: son poll sonucu, süre, ETag durumu, skip
sayısı, draft defer sayısı ve son 100 latency örneği. Ham snapshot, token veya
kullanıcı metni telemetry’ye yazılmaz.

## Fixture ölçümü

`test_panel_p2_polling.js` sentetik 20 poll süresinde:

- p50: **120 ms**
- p95: **190 ms**
- ilk response: `200` + ETag
- değişmeyen ikinci response: `304`, JSON body parse edilmedi
- ikinci istek: `If-None-Match` taşıdı

Bu değerler GitHub üretim latency iddiası değildir; conditional-fetch ve
percentile hesabının fixture kanıtıdır. Üretim gözleminde p50/p95 telemetry
örneklerinden yeniden hesaplanabilir.

Gerçek GitHub `X-RateLimit-*` kotası veya CDN cache header’ı bu turda canlı
çağrıyla ölçülmedi; dış servis açmama ve token/veri sınırı korunmuştur. Bu
nedenle karar, ölçülmüş üretim kota tasarrufu iddiası değil, ETag’li conditional
okuma davranışının güvenli uygulanabilirlik kanıtıdır.

## Taslak ve stale davranışı

Input/textarea odağı veya ÆON taslağı varken poll skip/defer edilir. Ağdan yeni
data gelse bile DOM render’ı ertelenir; `UI.msgDraft` korunur ve sonraki güvenli
turda görünür revision uygulanır. UI metinleri `Yakın takip`, `Polling
atlandı`, `Taslak korunuyor`, `Polling eski` ve `ETag 304` olarak ayrıdır;
“anlık” başarı iddiası kullanılmaz.

## Relay karar kapısı

Relay ancak aşağıdaki maddeler birlikte ölçülürse yeniden değerlendirilebilir:

1. Kullanıcı ihtiyacı 15 saniyelik yakın takipten daha sık güncelleme ister.
2. Gerçek üretim telemetry’sinde p95 uçtan uca gecikme kabul eşiğini aşar.
3. Backend auth modeli token’ı browser’a taşımadan tanımlanır; origin, replay,
   rate limit, tenant/data isolation ve secret rotation belgelenir.
4. Aylık maliyet, bağlantı limiti, bakım sahibi ve kapatma/rollback komutu
   onaylanır.
5. Relay kapandığında panelin ETag polling’e otomatik dönüşü test edilir.

Relay devreye alınırsa event/snapshot şeması relay’e bağımlı yapılmayacak;
GitHub canonical kaynak ve mevcut legacy fallback korunacaktır.

## Dış etki sınırı

Bu karar ve fixture’lar gerçek GitHub/relay çağrısı yapmaz. `data/` veya
`mustafaras/seyma-data` yazılmaz; panel okuma yüzeyi herhangi bir dosyaya PUT
yapmaz. Relay açılması ayrı kullanıcı izni ve ayrı release kapısı gerektirir.
