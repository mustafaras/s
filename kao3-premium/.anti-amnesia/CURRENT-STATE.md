# K3P · CURRENT-STATE

Sıradaki prompt: K3P-20

## Son durum

- **Tarih:** 2026-10-16.
- **Son tamamlanan:** **K3P-19 — Okunuşun soldurulması** (P4/H4). 29/37 kart bitti.
- **Yetki:** kullanıcı 2026-10-16'da (a) K3P-19'u "tam ve kusursuz" uygulamamı ve (b) **ara yayın** yapmamı istedi (pinleri koordineli yükselt → `kao3-premium` → `main` → push). Yayın ayrı bir kayıtla yürür (aşağıda).
- **Kanıt:** kaynak/headless ve sentetik veri. Tarayıcı, gerçek hesap, kişisel veri deposu, görsel QA veya cihaz kabulü yok.

## K3P-19 ne yaptı

- s ≥ 21 olan kartın görevinde okunuş yerel `<details class="kao-pronunciation-fold"><summary>Okunuş</summary>…</details>` içine alınır: **varsayılan kapalı**, **handler yok** (tarayıcı `<summary>` kendi açar; yeni `App.kao*` yok — 45 sabit).
- **Sınır tam s = 21** (KARARLAR K-A: hareke soldurması s ≥ 30'un bir basamak öncesi). s = 20 görünür satır; s ≥ 21 katlı.
- **Sözleşme korunur:** okunuş satırı `<details>` **içinde** durur, yani HTML'den silinmez — `test_kao_pronunciation_contract`'ın "her Arapça satırın görünür okunuşu" eşitliği bozulmaz.
- `settings.translit === false` → okunuş HTML'de **hiç** çizilmez. Ayar **tanımsızsa** (eski yedek) bugünkü davranış sürer; **`migrate()` dokunulmadı**.
- **Katlama yalnız sunum:** aynı cevap, ayar açık/kapalı, aynı FSRS notu (test kilitler). Okunuşu açmak notu etkilemez.
- Uygulama: `kaoArabicPairHTML`'in 5. parametresi artık `pronunciationFolded` (kullanılmayan eski `fadeMode` yuvası). Çağrı yerleri: soru (`>ar`), şık çipleri (build/cloze dahil), cloze âyeti, yeniden tanış paneli, parça/transfer âyeti.
- **H4 ölçüsü hazır:** motor her cevapta `daily.calib.s21 = {n,ok}` sayar (yalnız s ≥ 21 kartlar; ölçek gözlem, yeni kart alanı yok) ve `deney-rapor.cjs` **H4** satırını basar — hedef **≥ %85**; sentetik örnekte **%90,0 (117/130)**.
- Yeni test `tests/kao/test_k3p_pronunciation_fold.js` (6 kontrol). KAO envanteri **76 → 77**.
- CSS: işaretçi (›) + açıkken dönme + hareket azaltma kuralı. `app/kao.css` pinli olduğu için `pinDeferral.files`'a eklendi.

## Ölçü panosu

| Ölçü | Şimdi | Tavan/hedef |
| --- | --- | --- |
| Runtime gzip L6 (bağlayıcı) | 128,904 KiB | 136 KiB; kalan ~7,1 KB |
| CSS gzip L9 | 15,469 KiB | 16 KiB; kalan ~0,5 KB |
| İçerik | 184,591 KiB | 256 KiB |
| App.kao* | 45 | 45 |
| KAO fixture envanteri | **77** | 77 PASS |
| H4 (s ≥ 21 doğruluğu) | %90,0 (117/130, sentetik örnek) | ≥ %85 |

## Kapılar ve açık sınırlar

- `kapi-hizli --kart K3P-19` → **HIZLI KAPI YEŞİL**. tests/kao **77 PASS**, app 78, panel 23, panel-v2 27, quran 9, reminders, driver, zikr PASS; `senkron.mjs` UYUMLU.
- Paylaşılan fixture düzeltmeleri (kapsam içi beyan, hepsi aynı doğrulama yolunun parçası): `test_kao_requirements` (R-A3 kalibrasyon şekli `s21` ile), `test_k3p_dda` (sıkılma iddiası katı argüman dizilimi yerine davranışsal), `test_k3p_deney_rapor` (H4 satırı + `s21N/s21Ok` izdüşüm alanları).
- Görsel QA (`KAO_QA_CHROME`), gerçek ekran okuyucu turu, hedef cihaz kabulü ve Tezhip görsel denetimi açık kalır (K3P-26).
- `tests/app/test_asset_pin_freshness.js`: `app/core/quranLearn.js` ve `app/kao.css` `pinDeferral.files`'ta → **ERTELENDİ** diyerek PASS (K-P).
- Hiçbir kabul kontrolü kaldırılmadı veya gevşetilmedi.

## Devir notu

K3P-19 uygulandı; ara yayın ayrı kayıtla yürütülür (pinler koordineli yükseltilir, `main`'e alınır). Yayın kaydı ve makbuzu LEDGER'da. Sıradaki kart **K3P-20**. Kişisel veri/gerçek hesap tarayıcısı açma; `mustafaras/seyma-data` kapsam dışıdır.
