# IIP-06 devir

- Ajan / rol / tarih: Codex / integrator / 2026-09-20
- Yetkili kapsam: Kullanıcının açık talimatıyla yalnız IIP-06; commit/push/deploy yok.
- CWD / branch / başlangıç HEAD / son HEAD: `/Users/m_ras/Desktop/seyma` / `main` / `a6537feb4a511e524ca46b9d665e6806f455d885` / aynı HEAD
- Kart durumu: `done`; owner/lock kapanışı state’e işlendi.
- Değişen üretim/test yüzeyi: `app/core/saygi.js`, `app/styles.css`, `tests/app/test_iip_06.js`; IIP-06 evidence/state/ledger/generated view.
- Davranış: altı vakit satırı saat/kayıt/ayrıntı alanlarına ayrıldı; yöntem, konum hassasiyeti ve veri durumu ortak meta düzenine alındı; qibla hedefi/cihaz yönü/sensör hata durumu ayrıştırıldı; sensörsüz ibre idle gösterildi. Hesap, sensör, `data`, migration, sync, handler gövdeleri ve call graph korunuyor.
- Kanıt: `visual-render.html` sentetik light/dark render artifact’i; source/requirements/review/visual receipt’leri ve `commands.md`.
- Testler: IIP-06 21/21; IIP-04 25/25; IIP-05 28/28; Saygı 20/20; Prayer 19/19; Zikirmatik 95/95; modal focus, driver, shell gate, syntax ve diff-check PASS.
- Sınırlar: browser screenshot, VoiceOver, fiziksel cihaz, canlı sensör, yayın ve kullanıcı kabulü yapılmadı; gerçek veri/token/ağ yazımı yok.
- Sunucu/süreç: başlatılmadı.
- Sonraki yetkili eylem: yok. Kesin durma sınırı: IIP-07 açıkça seçilmeden başka karta geçilmez; commit/push/deploy yapılmaz.
