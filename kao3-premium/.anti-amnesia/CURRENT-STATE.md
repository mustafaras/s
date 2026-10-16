# K3P · CURRENT-STATE

Sıradaki prompt: K3P-21

## Son durum

- **Tarih:** 2026-10-16.
- **Son tamamlanan:** **K3P-20 — Kelime dizmede sürükle-bırak.** 30/37 kart bitti.
- **Yetki:** kullanıcı 2026-10-16'da (a) K3P-20'yi "tam ve kusursuz" uygulamamı ve (b) **ara yayın** yapmamı istedi (pin koordineli yükseltilir → `main` → push). Yayın ayrı kayıtla yürütülür.
- **Kanıt:** kaynak/headless ve sentetik veri. Tarayıcı, gerçek hesap, kişisel veri deposu, görsel QA veya cihaz kabulü yok.

## K3P-20 ne yaptı

- Çipler pointer olaylarıyla sürüklenir (`transform` + `setPointerCapture`); hedef bölgeye bırakılan çip mevcut `App.kaoAnswer(taskId,choiceId)`'i çağırır.
- Mantık **`window.SeymaQuranLearn.kaoDrag`** içinde; `App`'e yeni handler **yok** (`App.kao*` 45 sabit). **Dokunma ve klavye yolu aynen** kalır (çipin kendi `onclick`'i).
- **Saf bırakma hesabı:** `kaoDropIndex(rects, point)` — kutu içi indeks, kenarlar dâhil, boşluk/dışı/bozuk girdi → −1. Test edilebilir.
- Bölge **dışına** bırakma cevap üretmez; **hareket olmadan** cevap verilmez.
- **Hareket azaltma** açıkken animasyonsuz çalışır (aynı mantık, geçiş yok).
- Sürüklenebilirlik yalnız dizme görevlerinde (order/build) ve etkin çiplerde.
- **K-D pin denetimi (öncesi → sonrası):** `handlers.size` **766 → 766**, `onclick` **393 → 393**. **Pin kaymadı.**
- Yeni test `test_k3p_drag` (6 kontrol, async). KAO envanteri **77 → 78**.

## Ölçü panosu

| Ölçü | Şimdi | Tavan/hedef |
| --- | --- | --- |
| Runtime gzip L6 (bağlayıcı) | 130,015 KiB | 136 KiB; kalan ~5,9 KB |
| CSS gzip L9 | 15,595 KiB | 16 KiB; kalan ~0,4 KB |
| İçerik | 184,591 KiB | 256 KiB |
| App.kao* | 45 | 45 |
| fx2 pini | handlers 766 · onclick 393 | sabit |
| KAO fixture envanteri | **78** | 78 PASS |

## Kapılar ve açık sınırlar

- `kapi-hizli --kart K3P-20` → **HIZLI KAPI YEŞİL**. tests/kao **78 PASS**, app 78, panel 23, panel-v2 27, quran 9, reminders, driver, zikr PASS; `test_kao2_a11y` **14/14**.
- Paylaşılan sözleşme düzeltmeleri (kapsam içi beyan): yorumlarda `onclick` geçmesi onboarding sözleşmesini kırdı → yorumlar yeniden yazıldı (davranış aynı); `kao-drop-ready` CSS seçicisi öksüz kaldı → sınıf sürükleme sırasında hedef bölgeye **gerçekten ekleniyor** (işlevli görsel geri bildirim).
- `tests/app/test_asset_pin_freshness.js`: `app/core/quranLearn.js`, `app/core/quranLearnViews.js` ve `app/kao.css` `pinDeferral.files`'ta → **ERTELENDİ** diyerek PASS (K-P).
- **Açık:** sürükle-bırak gerçek dokunmatik cihazda denenmedi; görsel QA (`KAO_QA_CHROME`), ekran okuyucu turu, cihaz kabulü ve Tezhip denetimi K3P-26'da kullanıcıda.
- Hiçbir kabul kontrolü kaldırılmadı veya gevşetilmedi.

## Devir notu

K3P-20 uygulandı; ara yayın ayrı kayıtla yürütülür. Sıradaki kart **K3P-21**. Kişisel veri/gerçek hesap tarayıcısı açma; `mustafaras/seyma-data` kapsam dışıdır.
