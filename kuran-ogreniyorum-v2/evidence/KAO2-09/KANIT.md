# KAO2-09 — Bugün ekranı (S-02)
Tarih: 2026-09-29 · Dal: kao2-yeniden-tasarim · Önceki commit: 1a697a0c

## Yapılan
- `app/core/quranLearnViews.js`: yeni `heroCard` (bölüm etiketi · başlık · alt satır · tek `PrimaryButton` · altbilgi notları), `pathCard` (seviye, ünite ilerleme çubuğu `role="progressbar"`, kapsam ya da ilk hedef, "Tüm yolu gör") ve `todayScreen` (HeroCard + Yolun + iki bölümlü GroupedList). Tüm metin kaçışlı; eylemler mevcut güvenli `actionCall` ile.
- `app/core/quranLearn.js`: `kaoHomeHTML` gövdesi model kurucusuna çevrildi (`kaoHomeHero`, `kaoHomePath`, `kaoHomeLists`) ve görünüm views'a devredildi. Kaynak tek: `kaoNextStepFor(d, now)` (KAO2-08 motoru; `kaoNextStep` bunun sarmalayıcısı).
- `nextStep.action` eşlemesi (`KAO_HOME_ACTIONS`): daily/next-unit/warmup/night-review → `App.kaoStart()`; onboarding → `App.kaoStart()` (KAO2-11'e kadar); s0-lesson → `App.kaoGate("start")` (mevcut kapı/ders görünümü); mastery → `App.kaoStart()` (ustalık kontrolü KAO2-13'e kadar); rest → `App.kaoOpenAyah()` öneri.
- Gece penceresi ve "En çok karıştırdıkların" satırı HeroCard altbilgisine taşındı; gece etiketinde "Gece tekrarına başla · en çok N kart".
- Yolun: "Seviye N · <ad>", "Ünite i/n · <başlık> · x/y ders", gerçek ünite ilerlemesi (`Flow.unitProgress`). Kapsam yalnız bilinen kelime ≥1 iken (`<span data-countup>` korunur); sıfır kullanıcıda "İlk hedef: Fâtiha’yı anlamak · 23 kelime", `%0` yok.
- Keşfet: Kısa sûreler (20), Namazda ne diyorum, Telaffuz stüdyosu, Günün âyeti (anlaşılan sayısı değer olarak). Sen: İlerleme, Ayarlar. Kök aileleri ve Gramer notları gizli. `.kao-link-button` ana ekranda yok. İkonlar mevcut `icon()` setinden (book-open, mosque, headphones, sparkles, trending-up, settings, moon, triangle-alert).
- Erişilebilirlik korunur: ana ekrandan kalkan Mushaf haritası İlerleme ekranına grouped list satırı olarak eklendi (S-12 birleşimine kadar); "Anlaşılan âyet sayısı" sayacı Günün âyeti ekranının başlığına taşındı. İlerleme ekranında önceden var olan işaretleme hatası düzeltildi (son bölüm `</main>` dışında kalıyordu).
- (f) switch semantiği: Ayarlar'daki 5 aç/kapat düğmesi `aria-pressed` yerine `role="switch"` + `aria-checked` taşır.
- `app/kao.css`: HeroCard ve Yolun stilleri (yalnız `--kao-*` tokenları, ağırlık 600/700, büyük harf/izleme/süs yok, `.kao-path-more` 44 px, forced-colors desteği). Eski `.kao-ayah-count` stili yeniden kullanıldı.
- Sürüm pini `20260928b` değişmedi (versionPolicy + kullanıcı talimatı). app.js değişmedi, yeni `App.*` handler'ı yok.

## Kapsam onayları (2026-09-29, kullanıcı)
1. `test_kao_requirements.js` ve `test_kao_queue.js`: yalnız ana ekran/switch semantiğine bağlı beklentiler.
2. `test_kao_user_tasks.js` satır 196: ana ekrandan İlerleme'ye geçiş beklentisi.
3. KAO fikstürlerinde (navigation, queue, user_tasks, requirements, render) yalnız modül yükleme satırlarına `quranCurriculumV2.js` (queue e9 bloğuna ayrıca Flow + Views) eklenmesi (KAO2-04 emsali).

## TDD
- Kırmızı (`red.txt`): `node tests/kao/test_kao2_today.js` → `AssertionError: %0 metni görünmemeli` (exit 1); `node tests/kao/test_kao2_design_contract.js` → `strict tasarım ihlalleri` (switch semantics; exit 1).
- Yeşil (`green.txt`): today 7/7 PASS; design contract strict (f dahil) PASS.

## Kapılar (P3)
Tam çıktı: `gates.txt`.

| Komut | Sonuç |
|---|---|
| `node --check` quranLearn.js / quranLearnFlow.js / quranLearnViews.js / quranCurriculumV2.js | PASS ×4 |
| tests/kao | 25/25 PASS |
| tests/app | 77/77 PASS |
| tests/panel | 23/23 PASS |
| tests/panel-v2 | 27/27 PASS |
| tests/quran | 9/9 PASS |
| reminders smoke | PASS |
| run-seyma driver | PASS |
| zikr-harness | 95/95 PASS |
| kao-verify-contrast | 406 çift, 0 ihlal (önce 382) |
| kao2-sync-check | PASS |

## Ölçümler
- Ekran başına `.kao-primary`: tüm görünümlerde ≤1 (boş/tohumlu); ana ekran 1.
- Switch semantiği: 4 durumda 5/5 anahtar `role="switch"` + doğru `aria-checked` (önce 0/5).
- Boyut: runtime gzip 60,031 KiB (≤80), CSS gzip 7,834 KiB (≤14), içerik 168,483 KiB (≤256), VM p95 4,227 ms.
- Kontrast: yeni bileşen renkleri dahil 406 çift; yeni `.kao-path-more` 5,14:1.

## Bilerek değişen testler
- `test_kao2_design_contract.js`: (f) TODO → zorunlu (switch semantiği ihlali artık strict hata); dosya listesine müfredat modülü.
- `test_kao_render.js`: ana ekran `/Kapsam/i`, `/anlaş/`, `/10 yeni/`, `kao-time-chip` → "İlk hedef", kapsam sayacı yok (sıfır kullanıcı), `kao-hero-card`, "Hoş geldin", gece satırı altbilgide; harita girişi ana ekrandan İlerleme'ye (`kaoStatsHTML`). Gerekçe: S-02, Y-05, K-03.
- `test_kao_requirements.js`: `aria-pressed="true"` sayısı 8 → `aria-pressed` + `role="switch" aria-checked="true"` toplamı 8 ve eski toggle kalıbı yok; ana ekrandan ayarlar `kaoSetView('settings')` → grouped list `kaoSetView(&quot;settings&quot;)`; kapsam sayacı iddiası aynı, fikstüre iki yönde kalıcı bir kelime eklendi (kapsam yalnız kelime ≥1).
- `test_kao_queue.js`: ana ekranda "Bugün anlayabildiğin âyet" + sayaç → "Günün âyeti" satırı (400 anlaşıldı) + sayaç `kaoAyahHTML`'de.
- `test_kao_user_tasks.js`: `kaoSetView('stats')` → `kaoSetView("stats")` (fikstürün `esc=String` olduğu için iki kodlama da kabul).
- Yükleme satırları: navigation, queue (+Flow/Views), user_tasks, requirements (3 boot), render.

## Kanıt düzeyleri
- Kaynak/test: ✓ · Yayın: bu commit sonrası ayrı makbuz (YAYIN) · Cihaz: yok (kullanıcıda).

## Sürprizler / backlog
- Eski ana ekran seçicileri (`.kao-home`, `.kao-hero`, `.kao-time-chip`, `.kao-summary`, `.kao-today`, `.kao-today-ayah`, `.kao-night`, `.kao-milestone`, `.kao-hero-copy`) artık öksüz; arşivlenmiş kontrast aracı (`docs/kuran-ogreniyorum/tools/kao-verify-contrast.mjs`) ve render testi bunlara bağlı olduğu için silinmedi → KAO2-26 kontrast denetiminde temizlenmeli. `.kao-undo` önceden öksüzdü.
- Mastery adımı için henüz ustalık kontrolü yok; HeroCard "Pekiştirerek devam et" ile mevcut oturumu açar. `masteryAt` yazan akış gelene kadar (KAO2-13), dersleri türetilmiş olarak bitmiş kullanıcı ana ekranda ustalık başlığını görür ama öğrenmeye devam edebilir.
- Onboarding eylemi KAO2-11'e kadar doğrudan oturum başlatır.

## Ek — FIX (KAO2-00…09 denetimi, 2026-09-29)
- Bulgu: `app/kao.css` `.kao-path-more:focus-visible` `var(--quran-mid)` kullanıyordu; KAO2-09 bloğu "yalnız --kao-* tokenları" sözleşmesine aykırı. Görsel etki yok: `--kao-tint` iki temada da `var(--quran-mid)`.
- Düzeltme: `var(--kao-tint)` (kardeş odak kurallarıyla aynı token).
- Ölçüm düzeltmesi: yukarıdaki "CSS gzip 7,834 KiB" f3c9905c'de yeniden ölçüldüğünde **7,822 KiB**; FIX sonrası 7,817 KiB. Runtime 60,088 KiB (Flow FIX'i dahil), içerik 168,483 KiB, p95 4,37 ms, kontrast 406 çift / 0 ihlal.
- Bağımsız denetim (scratchpad, depo dışı): 32 aç/kapat kombinasyonunda 5/5 `role="switch"` + metinle tutarlı `aria-checked`; 11 görünüm × boş/tohumlu veride `.kao-primary` ≤1; sıfır kullanıcıda `%0` yok; eski ana ekran hedeflerinin tamamına erişim var (Harita → İlerleme, Seviye 0 → Ayarlar `kaoReopenGate`); views'a ve kullanıcı verisine HTML enjeksiyonu → ham etiket 0, geçersiz eylem onclick üretmiyor.
