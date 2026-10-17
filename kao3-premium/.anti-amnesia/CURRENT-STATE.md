# K3P · CURRENT-STATE

Sıradaki prompt: K3P-26

## Son durum

- **Tarih:** 2026-10-17.
- **Son tamamlanan:** **K3P-25 — Mevcut kullanıcıya hızlı geçiş seçimi (K-C "Varsayılanlar"; Dalga 4 sonu).** 35/37 kart bitti.
- **Yetki:** kullanıcı K3P-25'i "tam ve kusursuz" uygulamamı istedi; kartın zorunlu **karar noktasında** kullanıcı
  **(a) yolunu** seçti (yeni `onboarding.k3pNoticeAt` alanı) ve CSS payı yetmezse **eski/öksüz kuralı silip pay açma** yetkisi verdi.
- **Kanıt:** kaynak/headless ve sentetik veri. Tarayıcı, gerçek hesap, kişisel veri deposu, görsel QA veya cihaz kabulü yok.

## K3P-25 ne yaptı

- **Karar noktası (kart zorunlu kıldı):** kullanıcıya iki yol sunuldu; **(a) seçildi** — teklifin bir kez gösterildiği
  `onboarding.k3pNoticeAt` alanı geriye uyumlu biçimde eklendi. (Kod incelendiğinde `whatsNewAt`'in zaten bir "bir kez" damgası
  olduğu görüldü; kullanıcı yine de kartın yazdığı (a) yolunu tercih etti.)
- **Teklif bir kez:** eski (legacy) kullanıcıda, `doneAt` dolu + `autoAdvance !== true` + damga yoksa Bugün ekranında
  `KAO_AUTO_ADVANCE_OFFER` gösterilir ve damga yazılır. İkinci açılışta bir daha **gösterilmez**.
- **Ayar sessizce değişmez (K-C/özerklik):** teklifin **gösterimi** de, **"Böyle kalsın"** da `autoAdvance`'a **dokunmaz**.
  Ayar yalnız **açık rızayla** değişir.
- **Açık rıza mevcut handler'la:** "Hızlı geçişi aç" düğmesi **doğrudan** `App.kaoToggleAutoAdvance` çağırır
  (`actionCall` args'sız eylemi zaten destekliyor) → **yeni `App.kao*` YOK (45 sabit)**. Kapatma eylemi
  `App.kaoOnboard('auto-advance-offer-close')` mevcut çoğaltıcıya eklenen yeni eylemdir.
- **Mevcut davranış korundu:** `KAO_WHATS_NEW` notu ve `whatsNewAt` yolu **aynen** duruyor; hızlı geçiş teklifi yalnız
  ayar kapalıyken ve not çakışmadığında çizilir (`noticeModel` öncelik sırası). Ayar açıkken teklif **hiç çizilmez** ve
  damga **yazılmaz**.
- **Bileşen:** `notice(options)` artık isteğe bağlı **ikinci eylem** destekliyor (`options.secondary`), mevcut
  `.kao-notice-close` sınıfı kullanılır → **yeni CSS kuralı eklenmedi** (`app/kao.css` hiç değişmedi).
- **Şema:** `normalizeOnboarding` içinde tek satır: `o.k3pNoticeAt=isoOrNull(o.k3pNoticeAt)` (yoksa `null`, bozuksa `null`,
  geçerliyse korunur, idempotent). `data` şeması ve `migrate()` değişmedi (I1–I6).
- **Test:** yeni `test_k3p_25` (**8 kontrol**); `test_kao2_migration` **14 → 15 kontrol** (K3P-25 eki: alan yokken `null`,
  normalize idempotent, bozuk tip `null`). Envanter **81 → 82**.
- **FROZEN ŞEMA fixture'ı buldu (gerçek kırmızı):** `tests/kao/test_kao_migration.js` normalize edilmiş `onboarding`'in
  **tam** alan kümesini sabitliyordu; yeni alan eklendiğinde iki yerde `k3pNoticeAt: null` beklenmesi gerekti (kapı yakaladı,
  fixture güncellendi — geriye uyumluluk burada kanıtlanıyor).

## Ölçü panosu

| Ölçü | Şimdi | Tavan/hedef |
| --- | --- | --- |
| Runtime gzip L9 (bağlayıcı) | **132,867 KiB** | 136 KiB; kalan ~3,1 KB |
| **CSS gzip L9** | **15,877 KiB** (değişmedi) | 16 KiB; kalan **126 B** — **kritik** |
| İçerik | 184,591 KiB | 256 KiB |
| App.kao* | 45 | 45 |
| KAO fixture envanteri | 82 | 82 PASS |

## Kapılar ve açık sınırlar

- `test_k3p_25`, `test_kao2_migration`, `test_kao2_onboarding`, `test_kao2_inventory`, `test_kao2_reader`,
  `test_kao2_progress`, `test_kao2_design_contract` → **PASS**. Perf bütçesi **PASS** (css 15,877 · runtime 132,867).
- **CSS bütçesi kritik:** kalan pay 126 B. Bu kart CSS'e **hiç dokunmadı**; sonraki CSS kartı §5 gereği ya eşdeğer eski
  kuralı silmeli ya da durup tavan kararını sormalıdır.
- `pinDeferral.files` = `app/core/quranLearn.js`, `app/core/quranLearnViews.js` (K-P). Ara yayın pinini **31511716**
  koymuştu; bu kart iki varlığı değiştirdiği için tazelik kapısı bunları **beyan gerektirdi** (kapı buldu, beyan edildi).
- **Açık:** görsel QA (`KAO_QA_CHROME`), ekran okuyucu turu, dokunmatik cihaz kabulü ve Tezhip denetimi **K3P-26**'da kullanıcıda.
- **Açık sınır (kartla ilgisiz):** `tekrar-uret.cjs` özeti **9/10**; düşen **R-08** tarihsel araç modelidir (eski
  `apply.words/sentences`), güncel denetim R-08 ve âyet fixture'ı PASS. Kapı bu yüzden yeşil kaldı.

## Devir notu

K3P-25 uygulandı; Dalga 4 kapandı. Sıradaki kart **K3P-26**. Push/merge/tag/deploy yok; yalnız K3P-27'de açık onayla.
Kişisel veri/gerçek hesap tarayıcısı açma; `mustafaras/seyma-data` kapsam dışıdır.
