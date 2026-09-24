# KAO-09 · Devir

**Tarih:** 2026-09-24 · **Başlangıç HEAD:** `35e31cfd63619bf4f0c9a41810ea289b55e13d13` · **Durum:** done

## Ne yapıldı

- `kaoBuildQueue`: gün+kart kimliğinden xorshift sıralama; due≤60, yeni≤`dailyNew`, gramer≤3, parça≤2 ve aynı tür ardışık≤2.
- `kaoPickDistractors`: yalnız review ve `s≥21`, aynı POS/farklı kök; önceki hedef-çeldirici kümesi bir sonraki tekrarda dışlanır.
- `kaoBuildTask`: deterministik doğru seçenek ve güvenli çeldiricilerle saf görev nesnesi üretir.
- `kaoNightWindow`: açık `settings.targetBed`, dep-bag health helper ve 90 dakikalık pencereyle 3 dakika/8 review kartı sözleşmesini döndürür; bağımlılık yoksa `false`.
- KAO-05 üretim paketinde bulunmayan `semNeighbors`, doğrulanmış 12 kümenin yalnız lemma kimlikleriyle registry’ye sabitlendi; aynı-kök komşuluğu donmuş sözlük dizininden türetilir.

## Kontrol sonuçları

- KAO-09 iki zorunlu fixture → PASS
- R-A2 → 1.000 sentetik oturum, ihlal 0
- R-A5 → 1.000 sentetik oturum, ihlal 0; 12/12 küme + aynı-kök fixture PASS
- KAO-08 FSRS regresyonu → 24/24 PASS
- Migration parity → 67/67 PASS
- Driver → PASS; zikir → 95/95; state-rebind → 37/37
- Shell inventory → 7.800 satır tavanında PASS
- Plan-check → PASS (0 warn); diff-check → PASS

## Gereksinim kapanışı

| R-id | Durum | Kanıt |
|---|---|---|
| R-A1 | partial | Saf pencere/helper sözleşmesi PASS; üretim dep-bag bağlantısı ve UI KAO-10/20’de. |
| R-A2 | done | 1.000 oturumda kararsız/POS/kök/ardışık-tekrar ihlali 0. |
| R-A5 | done | Aynı oturum ve 3 gün ayrımı, 1.000 oturumda ihlal 0. |

## Sınırlar

- Mevcut `app.js` kaydı health helper’ı henüz geçmez; KAO-09 izin listesi `app.js` içermez. KAO-10 ilk izinli entegrasyon kartıdır.
- Tarayıcı/gerçek veri açılmadı; cihaz kabulü iddia edilmez.
- Push, merge, tag veya deploy yapılmadı.

## Sonraki yetkili eylem

Canlı STATE sıradaki kartı KAO-10 olarak gösterir. Bu devir KAO-10 uygulaması veya herhangi bir yayın işlemi için yetki vermez.
