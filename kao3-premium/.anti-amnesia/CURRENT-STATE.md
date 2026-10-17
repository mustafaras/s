# K3P · CURRENT-STATE

Sıradaki prompt: K3P-24

## Son durum

- **Tarih:** 2026-10-17.
- **Son tamamlanan:** **K3P-23 — Okuyucu senkron yaldız + "Kartlarıma ekle".** 33/37 kart bitti.
- **Yetki:** kullanıcı K3P-23'ü "tam ve kusursuz" uygulamamı istedi. Yalnız yerel commit; yayın ayrı kayıtla ve açık onayla yürür.
- **Kanıt:** kaynak/headless ve sentetik veri. Tarayıcı, gerçek hesap, kişisel veri deposu, görsel QA veya cihaz kabulü yok.

## K3P-23 ne yaptı

- **Senkron yaldız (yalnız CSS):** çalan kelime (`aria-current="true"`) artık altın halkayla (`outline:2px solid var(--quran-gold)`, `outline-offset:2px`) gösterilir. Eski düz zemin vurgusu (`--kao-tint 16%`) kaldırıldı. **Hareket azaltmada** halka (renk) kalır, `animation:kao-reader-gild` kapanır (M7 uyumu; reduce tarayıcısı yeni seçiciyi kapsar).
- **"Kartlarıma ekle":** anlam balonunda düğme; `App.kaoReader('add', index)` **mevcut** çoğaltıcıya eklenen yeni bir eylem (yeni `App.kao*` handler YOK, 45 sabit). Kart **ders tanıtımıyla AYNI şemayla** yazılır — tek kurucu `kaoNewWordCard` (`state:'new'` + `introducedAt`, `reps:0`); yeni alan uydurulmadı. **İdempotent**; lemma zaten kartlarındaysa düğme **"Kartlarında var"** olur ve **devre dışıdır**; **doğrulanmamış lemma** (`lemma.verified !== true`) eklenemez.
- **Devralınan çelişki çözüldü (bilinçli karar):** `kaoRevealWord` (okurken anlam aç) bilinmeyen kelimeye **`readerUnknown:true`** işaretli bir kuyruk kartı yazıyordu; bu işaret yarının tekrarına alır ama kartı **gerçek/kalıcı** saydırmaz (`isSettled` dışı). "Kartlarıma ekle" bundan **AYRI** bir eylemdir. Ayrım tek yordamla yapıldı: **`kaoWordCardGenuine(card)`** = `readerUnknown!==true && (reps>0 || introducedAt)`. Okuma işareti artık ders/ekleme kartını **EZMEZ**; bilinçli ekleme readerUnknown taşıyan işareti ders şemasına çevirir. Mevcut `readerUnknown` davranışı (kapsam, yarının kuyruğu, `test_kao2_reader`/`test_kao2_migration` yeşil) korundu.
- Yeni test **`test_k3p_23`** (12 kontrol: yaldız CSS + kontrast ölçümü + reduce + ekle düğmesi + şema + idempotentlik + "var" devre dışı + doğrulanmamış reddi + okuma/ekleme ayrımı + 45 yüzey). KAO envanteri **80 → 81**.
- **Paylaşılan fixture düzeltmesi (kapsam içi beyan):** yok — mevcut fixture'lar değişmedi.

## Ölçü panosu

| Ölçü | Şimdi | Tavan/hedef |
| --- | --- | --- |
| Runtime gzip L6 (bağlayıcı) | **131,138 KiB** | 136 KiB; kalan ~4,9 KB |
| **CSS gzip L9** | **15,847 KiB** | 16 KiB; kalan ~157 B — **kritik** |
| İçerik | 184,591 KiB | 256 KiB |
| App.kao* | 45 | 45 |
| Kontrast çifti | 756/756 PASS | 0 hata |
| KAO fixture envanteri | **81** | 81 PASS |

## Kapılar ve açık sınırlar

- `kapi-hizli --kart K3P-23` → **yeşil** (kapanış raporunda ölçüldü). tests/kao **81 PASS** (yeni `test_k3p_23`), `test_kao2_reader` + `test_kao2_migration` PASS; `kao-verify-contrast` **756/756**.
- Ölçüm: CSS **15,847 KiB** (bütçe 16 KiB, pay ~157 B), runtime **131,138 KiB** (tavan 136).
- `tests/app/test_asset_pin_freshness.js`: `app/core/quranLearn.js` ve `app/kao.css` `pinDeferral.files`'ta → **ERTELENDİ** diyerek PASS (K-P).
- **CSS bütçesi kritik:** kalan pay ~157 B. Yeni bir kart CSS kuralı ekleyecekse önce ya aynı işi gören eski kuralı silmeli ya da §5 gereği durmalı.
- **Açık:** görsel QA (`KAO_QA_CHROME`), ekran okuyucu turu, dokunmatik cihaz kabulü ve Tezhip denetimi **K3P-26**'da kullanıcıda.

## Devir notu

K3P-23 uygulandı; çalışma ağacında pin yükseltmesi **yok**, yayın yapılmadı. Sıradaki kart **K3P-24**. Kişisel veri/gerçek hesap tarayıcısı açma; `mustafaras/seyma-data` kapsam dışıdır.
