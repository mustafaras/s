# IIP-08 devir

- Ajan / rol / tarih: Codex / reviewer-integrator / 2026-09-20
- Yetkili kapsam: Kullanıcının açık talimatıyla yalnız IIP-08; bu kart yeni üretim/test kodu değiştirmedi.
- Başlangıç doğrulama HEAD: `fd4704ab8d5064055c04e07014547c5cf6027601`
- Kart durumu: `done`; `completedCards=8/24`; IIP-09 başlatılmadı ve yetkilendirilmedi.
- IIP-08 diff manifest hash: `68e0dd8bcea4eb629e81aa655ec8ccc68868e8aff5c63fc463cc200e3a16f1f3`.
- Gate'ler: `scope`, `requirements`, `review`, `visual` — tamamı PASS.
- Kanıt: `scope.json`, `requirements.json`, `review.json`, `visual.json`, `render-matrix.html`, `commands.md`.
- Test zinciri: Saygı 20/20, prayer 19/19, zikir 17/17, Kur'an 20/20, panel 50/50, IIP-04 25/25, IIP-05 28/28, IIP-07 21/21, zikr harness 95/95; driver, modal focus, shell gate ve diff-check PASS.
- Sınırlar: render artifact sentetiktir; browser screenshot, fiziksel cihaz, VoiceOver, gerçek sensör, kullanıcı kabulü ve canlı veri yazımı yapılmadı. `deviceAcceptance=not_verified`; `dataWriteApproval=not_approved`.
- Yayın yetkisi: Kullanıcının aynı turdaki açık `push commit merge deploy` talimatıyla yayın zinciri ayrıca çalıştırılacaktır; IIP-08 gate kapanışı bunun önkoşuludur.
- Korunan dosya: `ilham-ibadet-premium-plan/NEW-SESSION-STARTER.md` stage/commit dışı tutulur.
