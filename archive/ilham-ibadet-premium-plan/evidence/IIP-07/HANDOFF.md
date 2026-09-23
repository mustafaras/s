# IIP-07 devir

- Ajan / rol / tarih: Codex / frontend + integrator / 2026-09-20
- Yetkili kapsam: Kullanıcının açık talimatıyla yalnız IIP-07; commit/push/deploy yok.
- CWD / branch / başlangıç HEAD / son HEAD: `/Users/m_ras/Desktop/seyma` / `main` / `fd4704ab8d5064055c04e07014547c5cf6027601` / aynı HEAD.
- Kart durumu: `done`; `completedCards=7/24`; IIP-08 başlamadı ve yetkilendirilmedi.
- Üretim yüzeyi: `app/core/zikir.js`, `app/core/render.js`, `app/styles.css`; test: `tests/app/test_iip_07.js`.
- Davranış: zikir ve Kur’an başlık, buton, kaynak ve durum rail’i ortaklaştırıldı; sayaç/manual/undo/not, video/iframe/not ve hedefli repaint davranışları korundu.
- Kanıt: `scope.json`, `requirements.json`, `review.json`, `source.json`, `visual.json`, `visual-render.html`, `commands.md`.
- Hash: source/test diff `db51d9443c532e2abd4a30ac38c995cbfa02a783290c7de3634bdd19b8d29eb4`; görsel artifact `d8df9e5082257bb01e68941493f33af98e1dede36200ca0967dcbd65be9d0105`.
- Testler: IIP-07 21/21; Saygı 20/20; Zikir 17/17; Kur’an 20/20; Zikr harness 95/95; driver, IIP-04/IIP-05, modal focus, state rebind, shell gate, syntax, plan-check ve diff-check PASS.
- Sınırlar: sentetik visual render; browser screenshot, VoiceOver, fiziksel cihaz, gerçek sensör, canlı veri/token, yayın ve kullanıcı kabulü yapılmadı.
- Sunucu/süreç: başlatılmadı.
- Sonraki yetkili eylem: yok. Kesin durma sınırı: IIP-08 veya başka kart için açık kullanıcı yetkisi gelmeden üretim dosyasına, state’e, test/evidence zincirine dokunulmaz; commit/push/deploy yapılmaz.
