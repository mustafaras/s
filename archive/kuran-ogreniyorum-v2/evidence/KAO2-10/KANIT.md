# KAO2-10 — Hub kartı v2 (tek bilgi, tek eylem, gerçek ilerleme)
Tarih: 2026-09-29 · Dal: kao2-yeniden-tasarim · Önceki commit: 4e836148

## Yapılan
- `app/core/quranLearnViews.js`: yeni `hubCard(model)` — 32 px ikon, başlık, alt satır, isteğe bağlı 28 px gerçek ünite halkası (`progressRing`, `role="img"`), eylem kapsülü. Tüm metin kaçışlı; iç yüzde etkileşimli öğe ya da tıklama niteliği yok (06 §5: tüm kart tek düğme).
- `app/core/quranLearn.js`: `kaoHubCardHTML` görünüme devreder; dış düğme aynen (`id="kao-hub-entry"`, `class="kao-hub-card"`, `App.kaoOpen()`, `aria-haspopup="dialog"`, erişilebilir ad "Kur’an Arapçası Öğreniyorum; …"). Model `kaoHubModel(d, now)` KAO2-08 `nextStep`'ten türetilir; 05 §8 dört durumu:
  - hiç başlamadı (onboarding) → "Kur’an Arapçası" · "Namazda söylediklerini anlamaya başla · 5 dk" · Başla (halka yok);
  - bekliyor (daily/next-unit/warmup/mastery/s0) → "Kur’an Arapçası · Ünite N" (S0: "· Harfler") · "Sıradaki: <ders> · M dk" · Devam; niyet önerisi yalnız burada ve bugün cevap yokken alt satırın yerine geçer;
  - bugün tamam (rest) → "Kur’an Arapçası ✓" · "Bugünlük tamam · yarın N tekrar" (N=0 ise sayı yok) · Aç;
  - gece penceresi → "Kur’an Arapçası" · "Uyumadan önce N kart · M dk" · Tekrar et.
- Halka: mevcut ünitenin biten ders oranı (yalnız >0 iken). Sahte yol noktaları, sabit "Günde yaklaşık 6 dakika", sayaç/rozet/âyet satırı kalktı (Y-01…Y-03, T-01…T-05).
- Ana sekme güvenliği: hub render'ı veri yazmaz (normalizasyon `cloneValue` kopyasında); motor ya da müfredat eksikse (karışık önbellek) sade karta düşer ("Kaldığın yerden devam et · Aç"), views `hubCard` yoksa yalnız başlık — ana sekme render'ı atmaz.
- `kaoCurrentUnit` yardımcısı Yolun kartı ve hub kartında ortak (davranış aynı).
- `app/kao.css`: `/* KAO2-10 … */ … /* KAO2-10 son */` bloğu — yalnız `--kao-*`/`--f-*`, ağırlık 600, gölge/hover kaldırma/büyük harf yok, forced-colors desteği. İkon zemini koyu temada 4,38:1 çıktığı için tint karışımı %12 → %8 (4,65:1).
- `saygi.js`, `app.js`, `index.html`, `sw.js` değişmedi; yeni `App.*` handler'ı yok; pin `20260928b` korundu. fx2/v3 düz metin pinleri (hub kaynak dilimi) değişmedi: dış düğme satırı quranLearn.js'te aynen, yardımcılar dilimin dışında.

## Kapsam onayı (2026-09-29, kullanıcı)
- Dokun dışı dört KAO testinde yalnız hub beklentileri (render, queue, user_tasks, requirements) — LEDGER seq38.

## TDD
- Kırmızı (`red.txt`): `node tests/kao/test_kao2_hub.js` → `AssertionError: sahte yol ve sabit süre vaadi yok` (exit 1).
- Ara kırmızı: gece fikstürü Ünite 6'nın ilk iki dersinden yalnız 7 kart kurmuştu (üst sınır 8'i sınamıyordu); fikstür 12 vadeli karta çıkarıldı, beklenti aynı. Kontrast aracı koyu temada `.kao-hub-icon` 4,38:1 → CSS düzeltildi.
- Yeşil (`green.txt`): `KAO2-10 hub: PASS (8 kontrol)`.

## Kapılar (P3)
Tam çıktı: `gates.txt`.

| Komut | Sonuç |
|---|---|
| `node --check` ×4 | PASS |
| tests/kao | 26/26 PASS |
| tests/app | 77/77 PASS |
| tests/panel | 23/23 PASS |
| tests/panel-v2 | 27/27 PASS |
| tests/quran | 9/9 PASS |
| reminders smoke | PASS |
| run-seyma driver | PASS |
| zikr-harness | 95/95 PASS |
| kao-verify-contrast | 414 çift, 0 ihlal (önce 406) |
| kao2-sync-check | PASS |

## Ölçümler
- 4 durum × başlık/alt satır/eylem 05 §8 ile birebir; halka = biten ders / ünite dersi (Ünite 1'de 1/5 → %20); başlanmamışta halka ve "%0" yok.
- Tek düğme, tek `onclick` (`App.kaoOpen()`); `kaoVisible=false` → boş dize; hub render'ı sonrası `data` JSON'u aynı.
- Boyut: runtime gzip 60,788 KiB (≤80), CSS 8,008 KiB (≤14), içerik 168,483 KiB (≤256), VM p95 4,36 ms.

## Bilerek değişen testler
- `test_kao_render.js`: "20 kısa sûre" hub'da → ana ekranda `kaoOpenSurah(114)` "Kısa sûreler" satırı (KAO-16 keşfedilebilirliği korunur); yol noktaları (Kelime/Kök/Gramer/Âyet) var → yok; "İlk oturum hazır" → "Namazda söylediklerini anlamaya başla · 5 dk"; "1 kelime kalıcı / 3 cevap bugün / Devam et" → "· Ünite N", "Sıradaki: … · N dk", "Devam" + kalıcı sayı `kaoKnownLemmaSet` ile doğrudan 1; açılan bilinmeyen kelime testi hub regex'i (`|| 0` yedeği) yerine `kaoKnownLemmaSet` ile ölçülür (sıkılaşma). Gerekçe: 05 §8, Y-01…Y-03, T-01…T-05.
- `test_kao_queue.js`: hub'da "Bugün anlayabildiğin âyet:" var → yok (tek bilgi; Günün âyeti ana ekrandan, aynı blokta doğrulanır).
- `test_kao_user_tasks.js`: hub "Gece tekrarı açık" → "Uyumadan önce 8 kart · 3 dk" + "Tekrar et".
- `test_kao_requirements.js`: `<b>Niyet önerisi:</b> …` → alt satır "Niyet önerisi: …"; hiç başlamamış kullanıcıda öneri yok (yeni beklenti), öneri "bekliyor" durumunda (fikstürde `onboarding.doneAt` set) doğrulanır.

## Kanıt düzeyleri
- Kaynak/test: ✓ · Yayın: yok (releaseApproval KAO2-09'a kadar) · Cihaz: yok (kullanıcıda).

## Sürprizler / backlog
- Eski hub seçicileri öksüz (`.kao-hub-head/.kao-hub-seal/.kao-hub-kicker/.kao-hub-status/.kao-hub-copy/.kao-hub-path/.kao-hub-foot/.kao-hub-ayah`); `test_kao_render.js` seçici listesi ve arşiv kontrast aracı bunlara bağlı → B-KAO2-10-1, KAO2-26.
- Kontrast aracı dekoratif (`aria-hidden`) `.kao-hub-icon`'u metin eşiğiyle (4,5) ölçüyor; araç kapsam dışı olduğundan CSS eşiğe uyduruldu.
