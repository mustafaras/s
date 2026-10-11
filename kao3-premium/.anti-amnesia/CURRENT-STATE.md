# K3P · CURRENT-STATE

<!-- Bu dosya her prompt'un kapanışında BAŞTAN yazılır (BAGLAM-YONETIMI §3). Başlıkları silme; senkron.mjs okur. -->

Sıradaki prompt: K3P-A4

## Son durum

- **Tarih:** 2026-10-11
- **Son tamamlanan:** K3P-15 (K-C, A-4): üç kollu geri bildirim. Hızlı doğru → tam panel açılmaz (şık ✓ + 600 ms otomatik geçiş); yavaş doğru (kişisel medyanın üstü ya da bu görevde ses çalındı) → tek satırlık pekiştirme şeridi + 1.600 ms geçiş, şeride dokunma (`App.kaoContinue`) otomatik geçişi durdurup ilerletir; yanlış → tam kart, "Yanlışlıkla dokundum", otomatik geçiş yok. Kişisel medyan `ui.kaoLatency` (son 50 yanıt süresi; kalıcı değil). Ayar kapalıyken (`autoAdvance === false`) doğru cevapta kompakt şerit + tek "Devam". **Varsayılan değişikliği (K-C):** yeni kullanıcı `autoAdvance: true`; mevcut kullanıcının kayıtlı değeri `ensureQuranLearn` ile değişmez. Yeni `App.kao*` yok (45). Önce: K3P-A3 (nefes ritmi).
- **Dal:** `kao3-premium`. `main` = dördüncü ara yayın `20261011c` (K3P-02…K3P-A2 dahil). Dal `main`'in 2 commit önünde (K3P-A3 + K3P-15, yayında değil).
- **Yeni oturum:** `kao3-premium/STARTER.md` içindeki metni yapıştır.
- **Kanıt düzeyi:** kaynak/headless · görsel QA yalnız K3P-00 "önce" çizgisi · cihaz yok.

## Ölçü panosu (taban → hedef)

| Ölçü | Şimdi | Hedef |
| --- | --- | --- |
| Çift şıklı görev (yerleşik) | 0/1127 ✓ | 0 |
| Okunuş hatası (vasl + idgâm) | 0 + 0 ✓ | 0 |
| Ders başına dokunuş (varsayılan açık) | 39 ✓ | ≤ 40 |
| Art arda edilgin ekran | 1 ✓ (K3P-A3; özet hariç) | ≤ 1 |
| İlk yeni içeriğe dokunuş | 7 ✓ (K3P-A3) | ≤ 7 |
| Ders başına overlay yeniden kurulumu | 0 ✓ (K3P-A1) | 0 |
| Tanıma görevi payı | %93 | ≤ %60 |
| Bugün ekranı seçim sayısı | 13 | ≤ 5 |
| `App.kao*` sayısı | 45 ✓ | 45 |

## Açık riskler

- **Çalışma zamanı bütçesi dar:** 123,3 / 128 KiB; yaklaşık 4,7 KiB pay kaldı (K3P-A1 +1,5, K3P-A2 +0,4, K3P-A3 +1,3, K3P-15 +1,3 KiB). Kod ekleyen kartlar (A5, 11–13, 16–18, 20, 22–24) bu payı paylaşır. Önce eski kod silinir; yetmezse tavan kararı kullanıcıdan istenir.
- **Kapı kararı K-Q (kullanıcı, 2026-10-11):** Kart kapanışında hızlı kapının tamamı yerine hedefli kapı koşulur (≤ 3 dk): `bash kao3-premium/araclar/kapi-hedefli.sh <kartın tests/kao dosyaları>` (sözdizimi + navigation/a11y/inventory/design_contract + kartın testleri + tests/app + driver + perf). Hızlı kapının tamamı ve tam kapı dalga sonunda (sıradaki K3P-A8) zorunlu. K3P-15'te istisna: kart `kaoAutoAdvance`/`kaoTaskHTML`/`applyAnswer` geri bildirim yolunu değiştirdiği için hızlı kapı **tam** koşuldu ve üç yavaş test de (`kabul`, `grammar_tasks`, `denetim`) yeşil alındı.
- **Pin ertelemesi (K-P):** `pinDeferral.files` = `app/core/quranLearn.js`, `app/core/quranLearnFlow.js`, `app/kao.css` (K3P-15 `kao.css`'e `.kao-feedback-strip` + `.kao-feedback-strip-continue` ekledi). Ara yayın yöntemi: ortak sürümle tek geçiş; ortak sürümü kullanmayan pinler için `test_asset_pin_freshness` katı modda koşulur ve ayrıca yükseltilir.
- **Hedef/akış çatışması (K3P-A3'ten, açık):** Hedef ekranı ilk görevden önce geliyor; `targets.flow.tapsOpenToFirstTask: 2` ile çatışıyor (ölçülen 3). Karar kullanıcıda.
- **K3P-15 medyan ilk yanıtta belirsizdir:** Ölçüm yokken doğru cevap "yavaş" koluna düşer (pekiştirme şeridi); medyan oluştukça kol netleşir. KARARLAR K-C'nin "yanıt süresi zaten `kaoTaskMs` ile ölçülüyor" gerekçesine dayanır; yarıda kesilen (`kaoContinue`) ölçümler de medyana girer (kesin ölçüm değil).
- **Dokunma ölçümü "hepsi doğru":** `dokunus-olc` yalnız doğru-cevap kollarını ölçer (hızlı/yavaş). Ustalık/bağ kur/gecikmeli sûre yolları aynı geri bildirim motorunu kullanır ama ayrı ölçülmedi.
- **Overlay yerinde güncelleme (K3P-A1):** KAO overlay'i `#app` içinde son çocuk olarak kalır; `render.js` paint, KAO açıkken `kaoPaintApp` ile diğer içeriği overlay'in önüne yazar; mount `kaoPatchOverlay`. Gerçek tarayıcıda doğrulanmadı (yalnız sahte DOM).
- **`test_k3p_distractors` kararlılık tabanı:** `$TMPDIR/k3p-01-secimler-onceki.json` yerel anlık görüntüsü; anahtarı yürüyüş sırası + şık sayısı olduğu için plan sırası değişince bilerek geçersizleşir.
- **Perf göreli bandı makine yüküne duyarlı.** `main`'de kırmızıydı; kapılar `KAO2_ACCEPT_SLOW_HOST=1` ile koşar; mutlak tavanlar zorunludur (K3P-15: runtime 123,3/128 KiB, css 13,07/14 KiB, p95 5,96 ms).
- **Yavaş testler:** `test_kao2_kabul` (~230–530 sn), `test_kao2_grammar_tasks` (~170–290 sn), `test_kao2_denetim` (~35–50 sn). K3P-15'te üçü de koşuldu ve yeşil.
- **Tam kapı** `bash tools/kapi/kapilar.sh` 10 dakikadan uzun sürer; yalnız dalga sonlarında (`waveEnd`, sıradaki K3P-A8) koşar.
- **Deney raporu (K3P-05):** gerçek yedeği yalnız kullanıcı verir; ajan yalnız `--ornek` ile doğrular. H5/H9 yaklaşık ölçüdür.
- **Okunuş kapısı zorunlu (K3P-04'ten beri):** `okunus-denetim.cjs` exit 0 (K3P-15'te korundu). Okunuş kuralı değişirse sıra `lexicon-build --retranslit` → `--freeze` → `kao-content-freeze` → `kao2-curriculum-build` → `lemma-morph-build --write`.
- **L2 önerisi:** Okunuş kıraat hocası incelemesi bekliyor: K3P-04 (19 başlık) ve K3P-04B (341 başlık) — `kao3-premium/kanit/K3P-04/`, `K3P-04B/okunus-degisen.md`.
- **Görsel QA Chrome yolu:** `tools/kapi/gorsel-qa/cdp.mjs` varsayılanı bu makinede yok; K3P-26'da `KAO_QA_CHROME` ver.

## Devir notu

—
