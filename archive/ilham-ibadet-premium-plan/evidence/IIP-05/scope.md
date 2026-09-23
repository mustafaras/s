# IIP-05 kapsam kapısı

## İzinli yüzey

- Üretim: `app/core/saygi.js`, `app/styles.css`
- Test: `tests/app/test_saygi_boundary.js`, `tests/app/test_iip_05.js`

## Gerçekleşen değişiklik

- Öncü makalesi 43rem üst genişlikte, biyografi paragrafları 68ch okuma ölçüsünde ve uzun Türkçe başlıklar kırılabilir hale getirildi.
- Portresiz ve yüklenemeyen görseller için metinli fallback yüzeyi eklendi; kaynak/lisans footer'ı ayrı ve sarılabilir bir blok oldu.
- Sabit `Okudum` eylemi inline aşırı z-index yerine scoped CSS, safe-area alt boşluğu, bounded width ve erişilebilir kilit açıklamasıyla düzenlendi.
- IIP-05 sentetik no-network fixture'ı olumlu/olumsuz, boş/yükleniyor/hata/dönüş ve scroll-gate durumlarını kapsıyor.

## Korunan sınırlar

Data/migration/sync, App handler gövdeleri, handler çağrı sırası, gerçek ağ/token/localStorage, browser screenshot, VoiceOver, fiziksel cihaz kabulü, commit/push/deploy ve IIP-06 kapsam dışıdır.

Scope reviewer: Codex / integrator
