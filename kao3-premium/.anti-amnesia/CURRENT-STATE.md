# K3P · CURRENT-STATE

Sıradaki prompt: K3P-23

## Son durum

- **Tarih:** 2026-10-16.
- **Son tamamlanan:** **K3P-22 — Âyet merdiveni (K-E).** 32/37 kart bitti.
- **Yetki:** kullanıcı K3P-22'yi "tam ve kusursuz" uygulamamı istedi. Yalnız yerel commit; yayın ayrı kayıtla ve açık onayla yürür.
- **Kanıt:** kaynak/headless ve sentetik veri. Tarayıcı, gerçek hesap, kişisel veri deposu, görsel QA veya cihaz kabulü yok.

## K3P-22 ne yaptı

- **Boş durum kaldırıldı:** "Henüz hazır âyet yok" metni ve `kao-ayah-empty` işaretlemesi artık hiçbir yerde geçmez (CSS'i de silindi — öksüz seçici bırakılmadı).
- **Merdiven:** %95 eşiğine ulaşmayan kullanıcıya — en yakın âyet **Tezhip** olarak (kelime kelime, bilinen/henüz-bilinmiyor işaretli), **"En yakın âyet: %N tanıdık · M kelime kaldı"** cümlesi ve **eksik lemmaların her biri** için mevcut `App.kaoNav('word', id)` bağlantısı.
- **Eşik 0.95 DEĞİŞMEDİ** (K-E: düşürmek ödülü sahteleştirir). Eşiğe ulaşan kullanıcı tam âyet ekranını görür; test bunu kilitler.
- Yeni `App.kao*` handler **yok** (45 sabit): birincil eylem mevcut `kaoStart`, kelime bağlantısı mevcut `kaoNav`.
- Yeni test `test_k3p_22` (6 kontrol; kartın **20-kelime** kabul senaryosu dâhil). KAO envanteri **79 → 80**.
- **Bulunan ve düzeltilen gerçek hatalar:** `tezhipPage`'in `lines`'i sayfa dizisi beklediği (Tezhip boş çiziliyordu) · `tezhipCard`'ın kendi etiketsiz birincil düğmesi (a11y + "primary per view" ihlali) · `.kao-ayah-ladder-line strong` **2,09:1** kontrast (açık temada okunmuyor → `--quran-mid`) · öksüz `kao-ayah-empty` CSS'i.

## Ölçü panosu

| Ölçü | Şimdi | Tavan/hedef |
| --- | --- | --- |
| Runtime gzip L6 (bağlayıcı) | 130,728 KiB | 136 KiB; kalan ~5,3 KB |
| **CSS gzip L9** | **15,772 KiB** | 16 KiB; **kalan yalnız 233 B — dikkat** |
| İçerik | 184,591 KiB | 256 KiB |
| App.kao* | 45 | 45 |
| Kontrast çifti | 756/756 PASS | 0 hata |
| KAO fixture envanteri | **80** | 80 PASS |

## Kapılar ve açık sınırlar

- `kapi-hizli --kart K3P-22` → **HIZLI KAPI YEŞİL**. tests/kao **80 PASS**, app 78, panel 23, panel-v2 27, quran 9, reminders, driver, zikr PASS; `kao-verify-contrast` **756/756**.
- Paylaşılan fixture düzeltmesi (kapsam içi beyan): `test_kao_queue` eski boş-durum metnini sabitliyordu → merdiven beklentisine çevrildi + olumsuz iddia eklendi.
- `tests/app/test_asset_pin_freshness.js`: `app/core/quranLearn.js` ve `app/kao.css` `pinDeferral.files`'ta → **ERTELENDİ** diyerek PASS (K-P).
- **CSS bütçesi kritik:** yeni bir kart CSS kuralı ekleyecekse önce ya aynı işi gören eski kuralı silmeli ya da §5 gereği durmalı. Kalan pay **233 B**.
- **Açık:** görsel QA (`KAO_QA_CHROME`), ekran okuyucu turu, dokunmatik cihaz kabulü ve Tezhip denetimi **K3P-26**'da kullanıcıda.

## Devir notu

K3P-22 uygulandı; çalışma ağacında pin yükseltmesi **yok**, yayın yapılmadı. Sıradaki kart **K3P-23**. Kişisel veri/gerçek hesap tarayıcısı açma; `mustafaras/seyma-data` kapsam dışıdır.
