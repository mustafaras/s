# K2F-34/35 — Ekran görüntüsü kanıtı (kontrollü yerel görsel QA, 2026-10-05)

**Kanıt düzeyi:** sentetik veriyle yerel render ✓ — gerçek cihaz **değil**. Yayın/cihaz kabulü ayrıca kullanıcıdadır.
**Yöntem:** `kao2-duzeltme/tools/gorsel-qa/` (CLAUDE.md "kontrollü yerel görsel QA" istisnası): sunucu AÇILMADI, soket dinlenmedi; boş geçici profilli headless Chromium CDP pipe ile sürüldü; `http://127.0.0.1:9000/*` diskten karşılandı, diğer tüm dış istekler kesildi (`blocked-external` log'da). `sync.js` Guard 1 doğrulandı (`node tests/app/test_local_visual_qa_guard.js` PASS); `forceSync` yok, token yok (`token:false force:null` log satırı), gerçek profil/parola/GitHub alanına dokunulmadı; sentetik veri (`createDefaultData()` + 60 kelimelik kart). `mustafaras/seyma-data`'ya yazma yok.
**ÖNCE** = `a352fa77` (K2F-33 sonu, `git archive`); **SONRA** = bu çalışma ağacı (K2F-34 + K2F-35 + dinleme konumu + yüzde düzeltmesi). Araç ek: `shoot-k2f35.mjs`; `cdp.mjs` Chrome yolu `KAO_QA_CHROME`, root konteyneri için `KAO_QA_NO_SANDBOX=1` (yalnız boş profil).

| # | Değişiklik | ÖNCE | SONRA | Görüntü |
|---|---|---|---|---|
| 1 | Hub halkası Türkçe yüzde (K3-09) | `20%` | `%20` | `kiyas-1-yuzde-ve-unite.png` (sol) |
| 2 | Yol ekranı halkaları | `20%`, `0%` | `%20`, `%0` | `kiyas-1…` (orta) |
| 3 | Ünite satırı (K4-04) | `6 / 23 kelime · 1 / 5 ders` | `6 / 23 kalıcı kelime · 1 / 5 ders` | `kiyas-1…` (sağ) |
| 4 | `namaz` taşı koşulu ve etiketi (K4-04) | "Namazımı anlıyorum" / "Namaz metinlerindeki tüm kelimeler 7 gün oturmuş olsun" | "Namazda geçen 35 kelime tanıdık" / "Namazda geçen 35 kelimenin tümü 7 gün oturmuş olsun" | `kiyas-2…` (sol, orta) |
| 5 | **Ekran görüntüsünde bulunan ek kusur:** Bugün ekranı kapsam satırı | `Kur’an kelimelerinin 47%’i` | `Kur’an kapsamı %47` (+ tekrar doğruluğu tablosundaki `75%` → `%75` kaynak düzeltmesi) | `kiyas-2…` (sağ) |
| 6 | Yerleştirme okuma şıkları (K5-06, K2F-34): doğru şık konumu | `0,0,0,0,0,0,0,0` (hep 1. düğme) | `0,2,2,1,1,0,0,2` | `kiyas-3-okuma-siklari.png` |
| 7 | Yerleştirme dinleme şıkları (seq 98): doğru harf konumu | `0,0,0,0` | `0,1,1,0` | `kiyas-4-dinleme-siklari.png` |

Ham metin dökümleri: `once/log.txt`, `sonra/log.txt`, `genel-*/log.txt` (aynı sayılar). Tam ekran görüntüler `once/` ve `sonra/` altında (a1 hub, b1 yol, c1 ünite, d1b/d2 ilerleme-taşlar, e1–e4 ilk açılış/yerleştirme); `genel-once/` ve `genel-sonra/` yalnız Bugün ekranını (01) tutar (19 görünümün tamamı çekildi, SKIP 0, boyut için yalnız biri saklandı).

## Ekranlardan çıkan sonuç ve dürüst sınırlar
- 1–4 ve 6–7 gözle ve metin dökümüyle doğrulandı; 5 numara ekran görüntüsünde fark edilen **yeni** bir bulgudur (K3-09'un halka düzeltmesi ana ekran satırını kaçırmıştı) ve bu turda kaynakta düzeltildi: `quranLearnViews.js` kapsam satırı, `quranLearn.js` `pct`. Test: `test_kao2_hub.js` "K2F-35 ek" (kırmızı → yeşil, düzeltme geri alınınca düşüyor); `test_kao2_today.js` ve `test_kao_requirements.js` regex'leri `%N` biçimine güncellendi.
- Halka `%N` metni 28/44 px halkada görsel olarak sığıyor (kiyas-1); ünite satırında halka etiketi gövdeye biraz yakın — cihazda teyit edilmeli.
- "SONRA" görüntülerdeki 5. değişiklik **canlıda değil** (canlı pin `20261005a`); yayın için yeni pin gerekir.
- Dinleme sesi (Sesi dinle) headless çekimde çalıştırılmadı; yalnız şık konumu doğrulandı.
