# K2F-14 — Seviye 0 3/4 — aşamalar ve alıştırmalar
Tarih: 2026-10-01 · Dal: kao2-duzeltme · Önceki commit: 52b2a9ea · Uygulayıcı: Claude Sonnet 5.5
Kapatılan bulgular: K5-02 (v) · D-10 · R değişimi: yok (R-04 K2F-15'te)

## İlerleme günlüğü
- [x] P1: sync PASS (14/44, nextPrompt K2F-14, seq 42); K2F-14 in_progress
- [x] Ölçüm: `kaoS0HTML` aşamaya bakmadan her şeyi tek sayfada çiziyordu; `next` yalnız `stage++`; alıştırma ve puanlama yoktu; harf dersleri `stages` meta verisinde drill sayısını (3+3+2) taşıyordu ama sorular yoktu
- [x] Tasarım: aşama başına ayrı HTML (Views `s0Screen`), motor yalnız model; `next` alıştırmada cevapsız pasif; yeni App handler yok (mevcut `kaoS0(action,…)`: `answer`, `next`, `audio`, `read`, `playall`)
- [x] Uygulama sonrası testler yazıldı (test-önce sırası bu promptta ters çıktı: önce uygulama, sonra test); önceki sürüme karşı koşturulup kırmızı doğrulandı: `AssertionError: s0.01: ilk aşama intro`
- [x] Dokun dışı tek test (syllable_audio) kullanıcı onayıyla güncellendi
- [x] Kapılar, P4

## Yapılan
- `app/core/quranLearnViews.js`: `s0Screen(model)` — aşama başına farklı HTML: **intro** (hedef + mekanik cümle + harf/işaret listesi) · **listen** (örnekler + "Dinle" · harf dersinde dinle-gör kelime + konum satırı · konum dersinde 28 harflik tablo · Fâtiha'da kelime kelime) · **drill** (soru x/n, uyaran, şıklar, `aria-live` geri bildirim, birincil düğme cevaplanana dek `disabled`) · **read** (gerçek kelime, "okunuşu gizli" ↔ "Okunuşu göster/gizle") · **done** ("Alıştırma: c / n doğru"). Aşama başına en fazla bir `.kao-primary`.
- `app/core/quranLearn.js`: `kaoS0DrillItems` (belirlenimci, ders kimliği tohum; 6–8 soru): harf dersi `letter-id`×3 · `shape`×2 · `position`×3; işaret dersleri `mark-name` + `word-sound` + `word-meaning`; konum dersi `position`×4 + `form-letter`×4; Fâtiha `word-meaning`×8. Çeldiriciler önce aynı dersten/aileden, benzersiz etiket, 2–4 şık, tek doğru. Dispatcher: `answer` (puanlama `ui.kaoS0.drill={items,index,correct,picked,results}`), `next` (alıştırmada cevapsız false; soru→soru→sonraki aşama), `read` (`toggle` okunuş; çıplak `read` = Okudum → done). Fâtiha kelimelerine `pronunciation`; harf kelimesine sözlükten Latin okunuş; konum dersine gerçek kelime (ilk bağlanan harfin kelimesi).
- `app/kao.css`: yeni S0 sınıfları (yalnız token'lar).
- Testler: `test_kao2_s0.js` (i) 5 yeni kontrol (22 kontrol): 12 ders × 4 aşama farklı HTML, ≤1 `.kao-primary`, 6–8 soru, `next` pasif, puanlama (yanlış → "Doğrusu: …", n−1/n), türler focus'a göre, çeldiriciler, tüm Arapça modüllerden, ses yoksa tamamlanır; (d)/(h) testleri dinle aşamasına uyarlandı.

## TDD
- Kırmızı (önceki sürümle): `node tests/kao/test_kao2_s0.js` → `AssertionError: s0.01: ilk aşama intro`
- Yeşil: `KAO2 s0: PASS (22 kontrol)`

## Kapılar (P3)
```
node --check (5 modül) PASS · tests/kao (49) · app (77) · panel (23) · panel-v2 (27) · quran (9) PASS
reminders · driver · zikr · kontrast · kao-plan-check · fix-sync-check --repro PASS
SONUÇ: TÜM KAPILAR YEŞİL
KAO2 perf: PASS (content 184.231 KiB · runtime 109.768 KiB · css 13.248 KiB · p95 4.285 ms · steady 2.971 ms)
```
tekrar-uret: 7/10 PASS (önceki 7/10)

## Ölçümler
- Soru sayısı: 12 dersin 12'sinde 6–8 (hedef 6–8 ✓); 5 aşama HTML'i birbirinden farklı (12/12); her aşamada ≤1 `.kao-primary`.
- `tekrar-uret`: 7/10 PASS (değişmedi; R-04 K2F-15). Bütçe: runtime 105,3 → 109,8 KiB (tavan 128) · css 13,14 → 13,25 KiB (tavan 14) · içerik değişmedi.
- Pinler değişmedi: App.kao* 43 · yüzey 764 · atama 602 · yayın 20261001e (yayınlanan `quranLearn.js`, `quranLearnViews.js`, `kao.css` değişti → sonraki yayında pin yükselmeli).

## Bilerek değişen testler
- `tests/kao/test_kao2_syllable_audio.js` (Dokun dışı, kullanıcı onayıyla): kontrolden önce `kaoS0('next')` — ses düğmesi artık dinle-gör aşamasında; iddia aynı · K5-02 (v).
- `tests/kao/test_kao2_s0.js` (d)/(h): kontroller dinle aşamasına taşındı (aşama 0 yalnız açıklama) · D-10.

## Kanıt düzeyleri
- Kaynak/test: ✓ · Yayın: yok · Cihaz: yok (kullanıcıda)

## Sürprizler / sonraki promptlara not
- S0 dersinin tamamlanması henüz `path.lessons`'a yazılmıyor (yalnız `ui.kaoS0.done`); kayıt ve besmele taşı K2F-15.
- "Soru → sonraki soru" geçişi mevcut `next` eylemini kullanır (cevaplanmadan pasif); yeni eylem/handler eklenmedi.
- Çeldirici tohumu ders kimliğidir: aynı ders her açılışta aynı sorular (bayt-eşit test); tekrarlı pratikte çeşitlilik K2F-15 sonrası bir tasarım kararı olabilir.
- Aşama içi odak yönetimi (yeni aşamaya geçince başlığa odak) diğer görünümlerle aynı sözleşmede bırakıldı (kendiliğinden odak taşımaz).
