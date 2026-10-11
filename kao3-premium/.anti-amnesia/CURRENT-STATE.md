# K3P · CURRENT-STATE

<!-- Bu dosya her prompt'un kapanışında BAŞTAN yazılır (BAGLAM-YONETIMI §3). Başlıkları silme; senkron.mjs okur. -->

Sıradaki prompt: K3P-04B

## Son durum

- **Tarih:** 2026-10-10
- **Son tamamlanan:** K3P-04. Okunuş motoru bağlamda okuyor: vasl elifi (ism, ibn, istagfara), şemsî idgâm (ar-rahmân), cümle içi vasl (bismi llâhi r-rahmâni r-rahîm), âyet sonu vakf, lafza-i celâl (allâh). Mekanik düzen korundu; tam Türkçe imlâ açık karar K-A2. Önce: K3P-03 (süre tabanı), K3P-02, K3P-01 ve ara yayın `20261010a`.
- **Dal:** `kao3-premium`. `main` = ara yayın `b3c97d67` (K3P-01 dahil); K3P-02…K3P-04 yalnız dalda, push yok.
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
| Ders başına overlay yeniden kurulumu | 7 | 0 |
| Tanıma görevi payı | %93 | ≤ %60 |
| Bugün ekranı seçim sayısı | 13 | ≤ 5 |
| `App.kao*` sayısı | 45 | 45 |

## Açık riskler

- **Çalışma zamanı bütçesi dar:** 119,1 / 128 KiB; yaklaşık 8,9 KiB pay kaldı. Kod ekleyen kartlar (A3, A5, 11–13, 16–18, 20, 22–24) bu payı paylaşır. Önce eski kod silinir; yetmezse tavan kararı kullanıcıdan istenir.
- **Pin ertelemesi (K-P):** Pinli bir dosyayı değiştiren kart, dosyayı `K3P-STATE.json` → `pinDeferral.files` listesine ekler. Eklemezse `test_asset_pin_freshness` kırmızı olur ve onu koşan kabul A-9 ile `kapilar.sh` de düşer. Liste şu an: `app/core/quranLearn.js` (K3P-02, K3P-04), `app/core/quranLearnFlow.js` (K3P-03) ve K3P-04'ün yeniden ürettiği `app/content/quranLexiconV1.js`, `quranGrammarV1.js`, `quranShortSurahsV1.js`, `quranCurriculumV2.js`; hepsinin pini `20261010a`. K3P-27 pinleri yükseltip listeyi boşaltır; `main`'de test tam katıdır.
- **Kabul testi yalnız `--yavas` ile koşar.** Pin çatışması bu yüzden plan aşamasında görünmedi; `--yavas` gerektiren kartlarda (A3, A4, A5, 16, 17, 18) aynı türden sürprizlere hazırlıklı ol.
- **Perf göreli bandı makine yüküne duyarlı.** `main`'de kırmızıydı (7,4 ms > 5,09 ms), K3P-00 ve K3P-01'de bant içindeydi. Kapılar `KAO2_ACCEPT_SLOW_HOST=1` ile koşar; mutlak tavanlar zorunludur.
- **Yavaş testler:** `test_kao2_kabul` (~230–530 sn), `test_kao2_grammar_tasks` (~170–290 sn), `test_kao2_denetim` (~35–50 sn) hızlı kapıda varsayılan olarak atlanır.
- **Tam kapı** `bash tools/kapi/kapilar.sh` 10 dakikadan uzun sürer; yalnız dalga sonlarında (`waveEnd`, sıradaki K3P-05) koşar.
- **Okunuş kapısı zorunlu (K3P-04'ten beri):** `okunus-denetim.cjs` exit 0 olmalı. Okunuş kuralı değişirse sıra: `node tools/kao-lexicon-build.mjs --retranslit` → `--freeze` → `kao-content-freeze --freeze-grammar/--freeze-surahs` → `node tools/kao2-curriculum-build.mjs` → `node tools/kao2-lemma-morph-build.mjs --write`; ardından `kao-content-freeze.mjs` JSON pinleri. `test_kao_pronunciation_contract` araç↔girdi↔çalışma zamanı sapmasını yakalar.
- **K-A2 → K3P-04B (sıradaki):** Tam Türkçe imlâ (غ → ğ, kalın/ince ünlü, `el-`/`er-`). Kullanıcı 2026-10-11'de K3P-05'ten önceye koydu. İlk adım gelenek tablosunu ve istağfera/istağfara seçimini kullanıcıya onaylatmak; onaysız kod yazılmaz.
- **L2 önerisi:** Okunuşu değişen 19 lemma başlığı ve 479 lemmanın örnek okunuşu kıraat hocası incelemesi bekliyor: `kao3-premium/kanit/K3P-04/okunus-degisen.md`.
- **Dizme görevi ölçütü:** Çift şık ölçümünde dizme görevleri sıra numarasıyla (`ordinal`) ölçülür; âyette tekrar eden sözcük meşrudur (D2F-03, kullanıcı kararı K3P-01).
- **Görsel QA Chrome yolu:** `tools/kapi/gorsel-qa/cdp.mjs` varsayılanı (ms-playwright chromium-1243) bu makinede yok. K3P-26'da `KAO_QA_CHROME="$HOME/Library/Caches/ms-playwright/chromium-1247/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing"` ver.
- Kaynakçadaki atıflar çevrimiçi doğrulanmadı. Yazı tipi alt kümesinin boyutu henüz ölçülmedi.

## Devir notu

—
