# 07 — Kalite hedefleri ve kabul matrisi

## Kanıt seviyeleri

1. **Kaynak/sentetik test:** gerçek veri, ağ ve tarayıcı deposu olmadan işlev kanıtı.
2. **Yerel görsel QA:** ayrıca istendiğinde yalnız `127.0.0.1:9000`, disposable profil, Guard 1 kaynağı/testi doğrulanmış, force-sync yok; sunucu tur sonunda kapatılır.
3. **Kullanıcı cihazı:** Safari/PWA, klavye, ses, sensör ve gerçek kullanımın kullanıcı teyidi.
4. **Yayın:** ayrı yetkiyle build/deploy sonucu ve dağıtılan sürüm. Diğer seviyelerin yerine geçmez.

Bu planın mevcut kanıtı seviye 1'de iki baseline komutudur; diğerleri bekler.

## Ölçülebilir hedefler

| Alan | Kabul hedefi | Ölçüm |
|---|---|---|
| Erişim | Bölüm girişinden vakit kaydı, aktif zikir, Kur’an'a ≤2 dokunuş | Tanımlı ilk/geri dönen kullanıcı senaryoları |
| Günlük odak | İlk normal mobil ekranda bir baskın eylem | 390×844 tasarım kontrolü; %200 yazıda içerik kesilmez |
| Okuma | Son paragraf ve eylem birbirini örtmez | 320–1280 genişlik, yatay ve klavye açık durum |
| Erişilebilirlik | 44×44 ürün hedefi; metin 4.5:1; büyük metin 3:1 | Ölçülmüş bounding box/renk; WCAG minimumuyla karıştırılmaz |
| Odak | Klavye ile tüm eylemler; dialog dönüş odağı; görünür focus | Tab/Shift+Tab/ESC ve ekran okuyucu cihaz kontrolü |
| Kayıt | Çift dokunma/yenileme çift kayıt yaratmaz | Sabit saatli VM senaryoları |
| Kesintisizlik | Sayaç/not/video durumunda global yeniden kurulum yok | DOM kimliği, seçim/caret, scroll ve state assertion |
| İçerik | Yeni yayınların %100'ünde kaynak ve review durumu | Katalog doğrulayıcı + insan editoryal incelemesi |
| Performans | Hub geçişinde hedef cihazda p95 ≤200 ms | En az 30 tekrar, cihaz/tarayıcı kaydı; baseline henüz yok |
| Sayım | Dokunmaya görsel yanıt hedefi ≤100 ms; yanlış artış 0 | Yerel UI ölçümü + hızlı ardışık sentetik giriş |
| Hareket | Reduced-motion'da dekoratif sürekli animasyon 0 | CSS/runtime ve yerel görsel doğrulama |
| Boyut | A paketi ilave JS/CSS toplamı gzip ≤30 KB hedefi | Aynı sıkıştırıcıyla önce/sonra; font/medya ayrıca raporlanır |
| Hata | Timeout/kota/izin reddinde çıkış ve tekrar yolu var | Enjekte edilmiş hata senaryoları |

Performans hedefleri ölçüm sonrası gerekçeli yeniden değerlendirilebilir; mevcut PASS iddiası değildir. Dış ağ bekleme süresi yerel etkileşim gecikmesinden ayrı ölçülür. Yapay veri tek başına gerçek cihaz hızını kanıtlamaz.

## Asgari senaryo seti

- Boş kullanıcı, eski şema, yoğun sentetik geçmiş, yalnız not içeren gün.
- 23:59→00:00, ay/yıl dönüşü, artık gün, saat dilimi uyuşmazlığı.
- Bayat/tarihi farklı vakit, eksik API alanı, ağ timeout, GPS reddi.
- Pusula yok, manyetik sensör, geçersiz değer, modal kapandıktan sonra gelen olay.
- Türkçe/İngilizce biyografi, görselsiz kişi, cache, kaynak 404, hızlı önceki/sonraki yarışması.
- Arama I/İ/ı/i, aksan, boş sonuç, filtre temizleme, 100 kaydın hepsine erişim.
- Okudum iki kez, son paragraf görünümü, geri dönüş, mevcut okuma tiki.
- Zikir hızlı 100 giriş, manuel ekle/geri al, hatim sınırı, preset geçişi, not yazarken poll.
- Kur’an bekliyor/gönderiliyor/hata/teslim/izlendi/video yok; stale cihaz tekrar istek; not caret korunumu.
- Yeni şema varsa ikinci migration değişimsizliği; silinen favorinin sync ile dirilmemesi; eski istemci uyumluluğu.
- Panel ve Panel-v2 ayrı kontrol; yeni alanların redaction ve kapsam kararları.

## Uygulama sırasında komut rehberi

Repo kökünden, etkilenen karta göre çalıştırılır. Sıra: syntax → dar alan testleri → VM → sınır/bütçe → gerekli çapraz regresyon. Başarısız exit code pipeline ile gizlenmez.

```sh
node --check app.js
node --check sync.js
node --check app/core/saygi.js
node --check app/core/prayer.js
node --check app/core/zikir.js
node --check app/core/quran.js
node --check app/core/render.js
node tests/app/test_saygi_boundary.js
node tests/app/test_prayer_boundary.js
node tests/app/test_zikir_boundary.js
node tests/app/test_zikir_view_boundary.js
node tests/app/test_zikr_manual_entry.js
node tests/app/test_quran_boundary.js
node .claude/skills/run-seyma/driver.mjs
node .claude/skills/run-seyma/zikr-harness.mjs
node .claude/skills/run-seyma/verify-state-migration-boundary.mjs
node tools/shell-inventory.mjs --gate
node docs/apple-design/verify-contrast.mjs
node tests/app/test_faz10_sync.js
node tests/panel/test_faz11_panel.js
```

Kur’an transport değişimi varsa `tests/quran/test_*.js`; panel değişimi veya final regresyonda `tests/panel/` ve `tests/panel-v2/` ayrıca çalıştırılır. Kapanışta [güncel fixture rehberi](../tests/README.md) esas alınır. Tarihsel snapshot testleri kasıtlı tasarım farkında başarısız olabilir: önce gerçek fark açıklanır, davranış kontratı bağımsız doğrulanır, sonra yalnız yetkili beklenen değer güncellenir; pinleri körlemesine yenilemek yasaktır.

## Bitmiş sayılma koşulu

Kartın üründe çalışan eylemi, boş/yükleniyor/hata durumu, erişilebilirliği, ilgili test çıktısı ve dosya diff'i birlikte bulunur. Görsel tasarım için henüz ekran kanıtı yoksa “uygulandı, görsel kabul bekliyor” denir. Düğmenin HTML'de bulunması, kullanıcı hedefini tamamladığının kanıtı değildir.
