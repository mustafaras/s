# K3P · CURRENT-STATE

<!-- Bu dosya her prompt'un kapanışında BAŞTAN yazılır (BAGLAM-YONETIMI §3). Başlıkları silme; senkron.mjs okur. -->

Sıradaki prompt: K3P-A3

## Son durum

- **Tarih:** 2026-10-11
- **Son tamamlanan:** K3P-A2 (A-6, D-8): ders ekranı açıkken başka modüllerin toast'ları bekletiliyor (`kaoFocusLocked` + `helpers.js` kuyruğu); kriz/güvenlik (`urgent`) ve KAO'nun kendi cevabı (`own`) ertelenmiyor; özet, çıkış ve kapatmada tek birleşik bildirim. Önce: K3P-A1 (overlay yerinde güncelleme).
- **Dal:** `kao3-premium`. `main` = dördüncü ara yayın `20261011c` (K3P-02…K3P-A2 dahil; 2026-10-11). Dal ile `main` aynı noktada.
- **Yeni oturum:** `kao3-premium/STARTER.md` içindeki metni yapıştır.
- **Kanıt düzeyi:** kaynak/headless · görsel QA yalnız K3P-00 "önce" çizgisi · cihaz yok.

## Ölçü panosu (taban → hedef)

| Ölçü | Şimdi | Hedef |
| --- | --- | --- |
| Çift şıklı görev (yerleşik) | 0/1127 ✓ | 0 |
| Okunuş hatası (vasl + idgâm) | 0 + 0 ✓ | 0 |
| Ders başına dokunuş | 69 | ≤ 40 |
| Art arda edilgin ekran | 6 | ≤ 1 |
| İlk yeni içeriğe dokunuş | 21 | ≤ 7 |
| Ders başına overlay yeniden kurulumu | 0 ✓ (K3P-A1) | 0 |
| Tanıma görevi payı | %93 | ≤ %60 |
| Bugün ekranı seçim sayısı | 13 | ≤ 5 |
| `App.kao*` sayısı | 45 | 45 |

## Açık riskler

- **Çalışma zamanı bütçesi dar:** 121,0 / 128 KiB; yaklaşık 7 KiB pay kaldı (K3P-A1 +1,5, K3P-A2 +0,4 KiB). Kod ekleyen kartlar (A3, A5, 11–13, 16–18, 20, 22–24) bu payı paylaşır. Önce eski kod silinir; yetmezse tavan kararı kullanıcıdan istenir.
- **Kapı kararı K-Q (kullanıcı, 2026-10-11):** Kart kapanışında hızlı kapının tamamı yerine hedefli kapı koşulur (≤ 3 dk): `bash kao3-premium/araclar/kapi-hedefli.sh <kartın tests/kao dosyaları>` (sözdizimi + navigation/a11y/inventory/design_contract + kartın testleri + tests/app + driver + perf). Hızlı kapının tamamı ve tam kapı dalga sonunda (sıradaki K3P-A8) zorunlu.
- **Pin ertelemesi (K-P):** Pinli bir dosyayı değiştiren kart, dosyayı `K3P-STATE.json` → `pinDeferral.files` listesine ekler. Liste şu an **boş** (ara yayın `20261011c`). Ara yayın seq 8/15/17/19 yöntemiyle: ortak sürüm 15 dosyada 76 geçiş; ortak sürümü kullanmayan pinler (ör. `helpers.js` artık `20261011c`) için `test_asset_pin_freshness` katı modda koşulur ve ayrıca yükseltilir.
- **Overlay yerinde güncelleme (K3P-A1):** KAO overlay'i `#app` içinde son çocuk olarak kalır (`#app{contain:layout}` çerçevesi ve toast/kriz katman sırası korunsun diye dışarı taşınmadı). `render.js` paint, KAO açıkken `kaoPaintApp` ile diğer içeriği overlay'in önüne yazar; mount `kaoPatchOverlay`. Ekran anahtarı `#sey-ov-body[data-kao-step]` + `.kao-screen-<görünüm>`; kaydırma yalnız anahtar değişince 0. Gerçek tarayıcıda doğrulanmadı (yalnız sahte DOM).
- **Kabul testi yalnız `--yavas` ile koşar.** Pin çatışması bu yüzden plan aşamasında görünmedi; `--yavas` gerektiren kartlarda (A3, A4, A5, 16, 17, 18) aynı türden sürprizlere hazırlıklı ol.
- **Perf göreli bandı makine yüküne duyarlı.** `main`'de kırmızıydı (7,4 ms > 5,09 ms), K3P-00 ve K3P-01'de bant içindeydi. Kapılar `KAO2_ACCEPT_SLOW_HOST=1` ile koşar; mutlak tavanlar zorunludur.
- **Yavaş testler:** `test_kao2_kabul` (~230–530 sn), `test_kao2_grammar_tasks` (~170–290 sn), `test_kao2_denetim` (~35–50 sn) hızlı kapıda varsayılan olarak atlanır.
- **Tam kapı** `bash tools/kapi/kapilar.sh` 10 dakikadan uzun sürer; yalnız dalga sonlarında (`waveEnd`, sıradaki K3P-A8) koşar.
- **Deney raporu (K3P-05):** `node kao3-premium/araclar/deney-rapor.cjs <yedek.json> [--kesim GG] [--bugun GG]` — gerçek yedeği yalnız kullanıcı verir; ajan yalnız `--ornek` ile doğrular. H5 ve H9 yaklaşık ölçüdür: H5 = ilk çalışma gününden ilk bitirilen derse gün (K-G; yerleştirme kümesi aynı `doneAt` ile ayıklanır), H9 = tekrara geçmiş kartlarda hiç unutulmamış payı (alt sınır). Kesin ölçü tarihli âyet/ilk-tekrar kaydı ister; bu veri şeması kararıdır (§5).
- **Okunuş kapısı zorunlu (K3P-04'ten beri):** `okunus-denetim.cjs` exit 0 olmalı. Okunuş kuralı değişirse sıra: `node tools/kao-lexicon-build.mjs --retranslit` → `--freeze` → `kao-content-freeze --freeze-grammar/--freeze-surahs` → `node tools/kao2-curriculum-build.mjs` → `node tools/kao2-lemma-morph-build.mjs --write`; ardından `kao-content-freeze.mjs` JSON pinleri. `test_kao_pronunciation_contract` araç↔girdi↔çalışma zamanı sapmasını yakalar.
- **Okunuş imlâsı (K-A2, K3P-04B ile kapandı):** `tr` katmanı Türk alfabesiyle (Diyanet tablosu: ğ, a/ı/u – e/i/ü, el-/er-, istağfera). `dia` DİA düzeninde. Elle yazılmış namaz okunuşları (`PRAYER_READINGS`: tekbir, sübhâneke…) mekanik düzende kaldı; aynı ekranda iki gelenek görünebilir — ayrı karar.
- **L2 önerisi:** Okunuş kıraat hocası incelemesi bekliyor: K3P-04 (19 başlık, 479 lemmanın örnekleri) ve K3P-04B (341 başlık, 524 lemmanın 1.553 örneği) — `kao3-premium/kanit/K3P-04/` ve `K3P-04B/okunus-degisen.md`.
- **Dizme görevi ölçütü:** Çift şık ölçümünde dizme görevleri sıra numarasıyla (`ordinal`) ölçülür; âyette tekrar eden sözcük meşrudur (D2F-03, kullanıcı kararı K3P-01).
- **Görsel QA Chrome yolu:** `tools/kapi/gorsel-qa/cdp.mjs` varsayılanı (ms-playwright chromium-1243) bu makinede yok. K3P-26'da `KAO_QA_CHROME="$HOME/Library/Caches/ms-playwright/chromium-1247/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing"` ver.
- Kaynakçadaki atıflar çevrimiçi doğrulanmadı. Yazı tipi alt kümesinin boyutu henüz ölçülmedi.

## Devir notu

—
