# K2F-37 ek — Modal tasarım ekran taraması (kontrollü yerel görsel QA, 2026-10-06)
**Kanıt düzeyi:** sentetik veriyle yerel render ✓ — gerçek cihaz **değil**. Yöntem K2F-35 `EKRAN.md` ile aynı (sunucu yok, boş geçici profil, dış istek kesik, token yok, forceSync yok, Guard 1). Araç: `kao2-duzeltme/tools/gorsel-qa/shoot-modal.mjs <kök> <çıktı> <profil> [genişlik] [dark]`.
**Kapsam:** 15 görünüm (Bugün, Yol, Ünite, Kelime, Sûre, Ayarlar, Telaffuz, Günün âyeti, Namaz, İlerleme, Harf kontrolü, Gramer, Kavram, Kök aileleri, Kaynaklar) + ders oynatıcı (hedef, tanış ×4, kavram, 13 görev, doğru/yanlış panel, kelime dizme, uygula, özet) + S0 (aşama 1–4, cevap) + ustalık başlangıcı + ayarlar alt kısmı — **3 koşul:** 390 px, 320 px (dar), 390 px karanlık tema.
**Ölçüm (her yüzeyde):** `documentElement.scrollWidth == clientWidth` (sayfa yatay taşması) ve diyalog gövdesi taşması — 390 px ve 320 px'te **0 taşma** (`overflowX=false`, sw=cw; `log-390.txt`, `log-320.txt`).

| # | Bulgu | Kanıt | Durum |
|---|---|---|---|
| 1 | Ünite ekranı ilerleme kutusunda halka kırpılıyor (")" yayı, `%40` taşıyor) | `kiyas-1-…` (sol/önce) | **düzeltildi** — eski çubuktan kalan ölü `.kao-unit-progress{height:5px;overflow:hidden}` silindi (sonra: tam halka) |
| 2 | Ders kavram tablosunda Arapça hücreler yerine âyet referansı ("1:2:3") | `kiyas-1-…` (sağ) | **düzeltildi** — Arapça + okunuş çizilir (109 ders taramalı test) |
| 3 | Kavram tablosunun 3. sütunu 390/320 px'te kısmen taşar (kaydırmalı sarmalayıcı) | `modal-390-ders-1.png`, `modal-320-dar-ekran.png` | **açık (bilinen sınır)**, sayfa taşmıyor; tasarım kararı |
| 4 | Karanlık tema: kontrast/okunabilirlik, panel, halka, anahtarlar | `modal-karanlik-1/2.png` | sorun görülmedi |
| 5 | 320 px: başlıklar ("Öğrenme ayarların"), NavBar, düğmeler, panel | `modal-320-dar-ekran.png` | sorun görülmedi (başlık sınıra yakın ama sığıyor) |
| 6 | 390 px: NavBar/LargeTitle çifti, gruplu liste, anahtarlar, panel, özet | `modal-390-*.png` | sorun görülmedi |

Dosyalar: `kiyas-1-unite-halka-ve-kavram-tablosu.png` (ÖNCE|SONRA), `modal-390-gorunumler-1/2/3.png`, `modal-390-ders-1/2.png`, `modal-390-s0-ustalik.png`, `modal-320-dar-ekran.png`, `modal-karanlik-1/2.png`, `log-*.txt`.
**Sınırlar:** ses, titreşim, gerçek dokunma ve kaydırma davranışı, VoiceOver bu çekimde yok; yalnız statik görüntü. Cihaz doğrulaması kullanıcıdadır.
