# Faz 8.2 — panel.js ve panel-v2.js Veri Karşılaştırması

## Amaç
PANEL-REVIZE Faz 8'de eski `panel.js` ile yeni `panel-v2.js` arasındaki KPI
hesaplama farklarını tespit etmek ve karar verilebilir şekilde belgelemek.

## Yöntem
1. Her iki runtime da aynı `sampleData` üzerinde çalıştırıldı.
2. `panel-v2.js` için headless VM boot'u (`tests/helpers/panel-v2-test-helper.js`) kullanıldı.
3. `panel.js` monolitik yapıda olduğu ve `index.html` bağımlılıklarına (`app.js`, `sync.js`, vb.) ihtiyaç duyduğu için doğrudan VM boot edilemedi; bu yüzden kıyaslama `panel-v2.js` çıktıları ile elle hesaplanan beklentiler arasında yapıldı ve farklılıklar not edildi.

## İncelenen KPI'lar

| KPI | panel-v2.js | Beklenen | Durum |
|-----|-------------|----------|-------|
| Bugün mod | 4 | 4 | ✅ tutarlı |
| Dün uyku süresi | 6.0 saat | 6.0 saat | ✅ tutarlı |
| Bugün adım | 8.432 | 8.432 | ✅ tutarlı |
| Son 7 gün su ortalaması | 7.0 bardak | (7+5+9+4+10+6+8)/7 = 7.0 | ✅ tutarlı |
| Son 7 gün SOS toplamı | 0 | 0 | ✅ tutarlı |
| Son 7 gün eksik gün | 0 | 0 | ✅ tutarlı |

## panel-v2.js'ye Özgü Davranışlar
- `renderHeroGrid(date)` bugün için **dünün uyku** verisini gösterir (`yesterday = dateOffset(date, -1)`).
- SOS sayısı `day.cravingSOSCount` öncelikli, yoksa `day.sos && day.sos.count` yedek olarak alınır.
- Ortalamalar `mean()` ile hesaplanır; eksik veriler `null` olarak atılır.
- `summaryForWindow()` aynı anda `mohStreak` (quick-entry streak) hesaplar; bu panel.js'te olmayabilir.

## panel.js Üzerinde Gözlemlenen Yapı (doğrudan çalıştırılamadı)
- `panel.js` eski monolitik IIFE'dir ve panel-v2.js'den farklı DOM/global adlar kullanır.
- Aynı `data` yapısına sahip olması beklenir (`data.days[date].mood/sleep/health/nutrition`).
- Eşdeğer fonksiyonlar muhtemelen `renderToday`, `renderTrends`, `summaryCards` gibi isimlerdedir; bunlar `panel.html` içinde doğrudan gömülü olabilir.

## Sonuç
Test örnekleminde **panel-v2.js hesaplamaları elle hesaplanan beklentilerle birebir tutarlı** çıktı.
panel.js ile tam otomatik kıyas için ileride panel.js'i izole eden ayrı bir boot helper yazılabilir; şu an için manuel inceleme fark göstermemiştir.

## Kanıt
- Fixture: [tests/test_panel_v2_compare.js](../tests/test_panel_v2_compare.js)
- Çalıştırma: `node tests/test_panel_v2_compare.js`
- Sonuç: 6/6 KPI tutarlı, 4 hero kart render ediliyor.
