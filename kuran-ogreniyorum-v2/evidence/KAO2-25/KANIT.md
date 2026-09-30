# KAO2-25 — Tek sayfalık kelime detayı (S-08) + panel aynası
Tarih: 2026-09-30 · Dal: kao2-yeniden-tasarim (= main) · Önceki commit: `1a550b72`

## Bulgu (02 T-19 · 01 Y-11 · KAO-19)
Kelime kartı **"Katman 1 / 3"** sayfalaması kullanıyordu: her katman ayrı ekran,
kullanıcı kalan bölümleri görmek için ileri-geri gidiyordu. 3. katmanda **doğrulanmamış
örnek için hata kutusu** çıkıyor ve iç kalite kuralı kullanıcıya sızıyordu (Y-11).
Panel özeti nerede kaldığını göstermiyordu.

## Yapılan
- **Tek kaydırmalı sayfa.** Bölümler: kahraman (büyük Arapça + okunuş + dinle) →
  **Anlamı** → **Türkçede** (kognat + kayma uyarısı) → **Kök** (çift, türevler, aile
  bağlantısı) → **Kur'an'da** (örnekler) → **Öğrenme durumu** (sonraki tekrar, bulunduğun
  yer, "Derse dön") → **Hata bildir** (en altta).
- **Y-11 kapandı:** yalnız okunuşu **doğrulanmış** örnekler yazılır; doğrulanmamış örnek
  **hiç gösterilmez** (hata kutusu yerine sakin boş durum metni). Kök okunuşu yoksa
  Arapça tek başına yazılır, hata kutusu üretilmez.
- **Katman durumu kaldırıldı:** `App.kaoWordLayer` ve `ui.kaoWordLayer` tamamen silindi
  (ölü yüzey bırakılmadı).
- **Panel aynası (KAO-19):** özet yeni alanlar — `start`, `unit`, `lesson`, `lessonsDone`,
  `milestones` (kazanılan taş anahtarları). **Anlatı metni YOK**; manifest katı biçimde
  süzer, bozuk/anlatı değer `null`'a düşer. Panel kartı yeni satırı **yalnız alan varsa**
  gösterir; eski veriyle kırılmaz.

## TDD (11 kontrol)
- **Kırmızı:** `test_kao2_word.js` → `katman sayacı kaldı`.
- **Kendi hatalarım (test/kapılar yakaladı):**
  1. Test lemması kognat/kök taşımıyordu → bölüm testi için tam kapsamlı lemma seçildi.
  2. `Türkçede var:` metnini `String.prototype.match` yerine `/re/.test` ile iddia ettim
     (assert.match ikinci argümanı string ister) → düzeltildi.
  3. Kök ikilisi okunuşsuzken **hata kutusu** üretti (Y-11 ihlali) → sessiz Arapça.
  4. Panel özeti için `start` alanını yazdım ama **`q.startedAt` yeni kullanıcıda null**;
     test "string olmalı" diyordu → alan nullable, test hem null hem ISO durumunu doğrular.
  5. `--kao-r-2` **izinli token değil** (scanner yalnız `r-card|ctl|pill`) → `--kao-r-ctl`.
  6. Panel projeksiyon testinde **hem** özet anahtar listesi **hem** `QURAN_LEARN_SUMMARY_KEYS`
     güncellenmeliydi; yalnız birini yaptım.
  7. `test_fx2_overlay_motion` pini iki ayrı yerde (yorum + sayım) geçiyordu; yalnız yorumu
     güncelledim → ikisi de.
- **Yeşil:** `test_kao2_word.js` **11/11** · KAO ailesi **43/43**.

## Kapılar (P3)
| Aile | Sonuç |
|---|---|
| `tests/kao/test_*.js` | PASS · **43/43** (yeni: word 11 kontrol) |
| `tests/app/test_*.js` | PASS · **77/77** |
| panel · panel-v2 · quran | PASS · 23/23 · 27/27 · 9/9 |
| reminders · driver · zikr · iip_22 | PASS |
| `kao-verify-contrast.mjs` | PASS |
| `kao2 design contract --strict` | PASS |
| `git diff --check` | temiz |

### K-1 bütçe
çalışma zamanı **92.431 / 128 KiB** · içerik 177.657/256 · css 12.824/14 · p95 4,6 ms.

## Kimlik pinleri — KASITLI DEĞİŞİM
Bu kart **bir handler'ı kaldırdı** (`kaoWordLayer`): `App.kao*` 43 → **42**,
app.js `App.*=function` 602 → **601**, benzersiz App yüzeyi 764 → **763**,
`App.kao` shim listesi güncellendi. Tıklama sayısı **393 DEĞİŞMEDİ**.
Güncellenen pin dosyaları: `test_app_surface_daily_boundary`, `test_v3_welcome`,
`test_fx2_overlay_motion`, `test_fx2_tab_transition`, `test_fx2_touch_coverage`,
`test_kao2_settings`, `test_kao2_onboarding`, `test_kao_render` (shim listesi).

## Dürüstçe açık
- Cihaz kabulü ve gerçek ekran okuyucu testi yapılmadı.
- `lesson` alanı yalnız akış motorunun `daily`/`next-unit` adımında doluyor; diğer
  durumlarda `null` (panel satırı gizlenir) — bilinçli.
