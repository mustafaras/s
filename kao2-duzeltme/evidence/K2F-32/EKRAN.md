# K2F-32 (ve K2F-27…31) — ekran görüntüsü kanıtı
Tarih: 2026-10-04 · Kanıt düzeyi: **yerel kaynak-görsel** (cihaz kabulü DEĞİL; telefon doğrulaması kullanıcıda).

## Yöntem (CLAUDE.md "kontrollü yerel görsel QA" istisnası, kullanıcı isteğiyle)
- Gerçek ağ soketi yok: `127.0.0.1:9000` isteklerini CDP `Fetch` ile dosyadan karşılayan, boş geçici profilli headless Chrome for Testing; diğer tüm dış istekler engellendi (6 istek kesildi). Origin `http://127.0.0.1:9000` → `sync.js` Guard 1 geçerli (fixture `test_local_visual_qa_guard.js` PASS). `forceSync` yok, `seyma-sync-force` yazılmadı, token yok (`token:false`), gerçek profil/parola/token alanı açılmadı.
- Sentetik durum: uygulamanın kendi `createDefaultData()` çıktısı + 60 kelimelik sentetik kart/gün kaydı; giriş ve konum kapıları, parola/izin alanlarına dokunmadan oturum içi bayraklarla (`ui.authUnlocked`, `ui.locationGateState`, `settings.locationEnabled`) geçildi.
- Önce = canlıdaki önceki sürüm (`dc3f3f06`, `git archive`), sonra = bu dal (`ab41e056` içeriği). Aynı senaryo, 390×844 @2x.

## Dosyalar (`ekran/`)
| Değişiklik | Önce | Sonra |
|---|---|---|
| K2F-27/31 Bugün: tek başlık çubuğu ("Kapat"), "2 yeni kelime · ~2 dk" | once-01-bugun-hub | sonra-01-bugun-hub |
| K2F-29 gruplu Ayarlar | once-02-ayarlar-ust | sonra-02-ayarlar-ust |
| K2F-30 Öğrenme grubu (otomatik geç, başlangıç noktası) | — | sonra-03-ayarlar-ogrenme |
| K2F-30 başlangıç noktasını değiştir (Geri/Vazgeç) | — | sonra-04-baslangic-noktasi |
| K2F-32 İlerleme başlığı | once-05-ilerleme-ust | sonra-05-ilerleme-ust |
| K2F-32 kalibrasyon kapalı / açık | — | sonra-06-…-kapali · sonra-07-…-acik |
| K2F-28 ders oynatıcı (yalnız ✕ + ince çubuk) | once-08-ders-oynatici | sonra-08-ders-oynatici |

## Görselin ortaya çıkardığı kusurlar (testlerin yakalamadığı)
1. **Katlanan kalibrasyon satırı tıklanabilir görünmüyor** (K2F-32): `.kao-flag summary{display:flex}` işaretçiyi (▸) kaldırıyor, metin soluk gri; kapalı satır düz not gibi okunuyor (sonra-06).
2. **Başlık çubuğu saydam**: kaydırılan içerik çubuğun altından görünüp başlıkla çakışıyor (sonra-03, sonra-07) — K2F-27 sonrası.
3. **Ayarlar → Niyet segmenti sağa taşıyor**: "Kendim seçerim" kesik (sonra-02). Önceki sürümde taşma daha kötüydü (once-02), yani iyileşti ama bitmedi.
