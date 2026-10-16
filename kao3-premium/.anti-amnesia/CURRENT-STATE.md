# K3P · CURRENT-STATE

Sıradaki prompt: K3P-22

## Son durum

- **Tarih:** 2026-10-16.
- **Son tamamlanan:** **K3P-21 — Görünür ses kontrolleri.** 31/37 kart bitti. **Dalga 3 kapandı.**
- **Yetki:** kullanıcı K3P-21'i "tam ve kusursuz" uygulamamı istedi. Yalnız yerel commit; push/deploy bu turda **istenmedi**. `releaseApproval=NOT_APPROVED`.
- **Kanıt:** kaynak/headless ve sentetik veri. Tarayıcı, gerçek hesap, kişisel veri deposu, görsel QA veya cihaz kabulü yok.

## K3P-21 ne yaptı

- Gizli **uzun basma (350 ms)** ve **satır içi ok fonksiyonu** kaldırıldı (ANALIZ §4: keşfedilemiyordu).
- Yerine **iki görünür düğme:** **◖ Yavaş** → `App.kaoPlay(id,'measured')`, **◗ Doğal** → `App.kaoPlay(id,'flowing')`.
- Her düğme kendi **`aria-label`**'ını taşır (`Yavaş oku` / `Doğal hızda oku`), gerçek `<button type="button">` ve CSS'ten **≥44 px**.
- Ses denetiminde artık `onpointerdown`, `setTimeout`, `shiftKey` **yok**; tek dokunuş yeterli.
- Yeni `App.kao*` handler **eklenmedi** (45 sabit; mevcut `kaoPlay` kullanılır). Ayarlar açıklaması iki düğmeyi anlatır.
- Yeni test `test_k3p_audio_buttons` (6 kontrol). KAO envanteri **78 → 79**.

## K3P-20 sınırı (iki kartın çakışmaması)

- K3P-20 çip sürükleme `onpointerdown`'ı **yalnız dizme görevlerinin çiplerindedir** ve koşulludur (`order && disabled===false`).
- Ses denetimi ve düz seçim görevi bundan **etkilenmez** (düz görev HTML'inde `onpointerdown` = 0).
- Kartın "görev HTML'inde `onpointerdown` yok" ölçütü **ses denetimi** için uygulandı; dizme çiplerindeki sürükleme kancası korunur. Bu sınır teste yazıldı.

## Ölçü panosu

| Ölçü | Şimdi | Tavan/hedef |
| --- | --- | --- |
| Runtime gzip L6 (bağlayıcı) | 129,707 KiB | 136 KiB; kalan ~6,3 KB |
| CSS gzip L9 | 15,595 KiB | 16 KiB |
| İçerik | 184,591 KiB | 256 KiB |
| App.kao* | 45 | 45 |
| fx2 pini (handlers/onclick) | 766 / 393 | sabit |
| KAO fixture envanteri | **79** | 79 PASS |

## Kapılar ve açık sınırlar

- `kapi-hizli --kart K3P-21` → **HIZLI KAPI YEŞİL**.
- **Dalga sonu tam kapısı** `KAO2_ACCEPT_SLOW_HOST=1 bash tools/kapi/kapilar.sh` → **exit 0, TÜM KAPILAR YEŞİL**: KAO **79**, app 78, panel 23, panel-v2 27, quran 9, reminders, driver, zikr, kontrast, çift şık, okunuş, plan ve **pin senkronu** PASS. Perf: runtime 129,707 KiB · p95 4,938 ms / steady 3,237 ms (yalnız göreli bant atlandı).
- Paylaşılan fixture düzeltmeleri (kapsam içi beyan; dördü de eski uzun-basmayı sabitliyordu ve her birine **olumsuz iddia eklendi**): `test_kao2_components`, `test_kao2_feedback`, `test_kao_render`, `test_kao_requirements`. Hiçbiri gevşetilmedi.
- `tests/app/test_asset_pin_freshness.js`: `app/core/quranLearn.js` `pinDeferral.files`'ta → **ERTELENDİ** diyerek PASS (K-P).
- **Açık:** görsel QA (`KAO_QA_CHROME`), ekran okuyucu turu, dokunmatik cihaz kabulü ve Tezhip denetimi **K3P-26**'da kullanıcıda.

## Devir notu

K3P-21 uygulandı, **Dalga 3 kapandı**; yayın bu turda istenmedi (çalışma ağacında pin yükseltmesi **yok**). Sıradaki kart **K3P-22**. Kişisel veri/gerçek hesap tarayıcısı açma; `mustafaras/seyma-data` kapsam dışıdır.
