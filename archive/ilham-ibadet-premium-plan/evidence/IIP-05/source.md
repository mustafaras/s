# IIP-05 kaynak kapısı

Kaynak ve sentetik contract kanıtı:

- `app/core/saygi.js:242-248`: portre fallback'i, source/license footer'ı, fixed Okudum HTML'i ve mevcut IntersectionObserver/scroll fallback'i.
- `app/styles.css:756-796`: 43rem makale genişliği, 68ch biyografi ölçüsü, uzun kopya sarma, broken/empty portrait fallback, safe-area fixed action, modal alt boşluğu, dar görünüm ve reduced-motion.
- `tests/app/test_iip_05.js:143-196`: REQ/TC olumlu-olumsuz durumları ve loading/error/return/no-network scope kontrolleri.

Source gate sonucu: PASS. `node --check app/core/saygi.js`, IIP-05 fixture, IIP-04 fixture ve Saygı boundary temiz geçti; kişisel veri, gerçek localStorage veya ağ kullanılmadı.
