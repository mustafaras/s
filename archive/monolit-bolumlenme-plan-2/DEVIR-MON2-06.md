# Devir — MON2-05'ten MON2-06'ya

**Tarih:** 2026-09-14 · **Son commit:** bkz. `git log -1` (MON2-05 Dalga 2 kapanışı) · **Dal:** `premium-fx-gorsel-yuzey` (LOCAL-ONLY)
**Durum:** MON2-05 tamam (5/8, Dalga 2 Görünüm kapandı). Aktif kart **MON2-06** (Alan dalı). Çalışma ağacı temiz.

## 0. İlk 2 dakika

1. Oku (bu sırayla): `monolit-bolumlenme-plan-2/README.md` §2 (bütçe tablosu) ve §5
   **MON2-06 kartı**; `MON2-STATE.json`; `.anti-amnesia/CURRENT-STATE.md`;
   `.anti-amnesia/LEDGER.md` son satır (seq 6).
2. Ölç ve LEDGER'a "önce" olarak yapıştır: `node tools/shell-inventory.mjs`
   (beklenen: app.js 8.969 · Legacy 0 · reminder gövde 408 · `*HTML` builder 6 fn / 97 satır).
3. Aktif bütçe artık **8.500 / 0 / 450 / 150** — satır hedefi 8.969 → **≤8.500**
   (builder zaten 97 ≤ 150; bu kartın işi satır düşüşü).

## 1. Kırmızı çizgiler (değişmedi)

- Push/merge/tag/deploy/tarayıcı/gerçek token/gerçek veri/`mustafaras/seyma-data` **yok**.
- Dokunma: `app/core/reminderSurface.js` (Dalga 1 ürünü, frozen), `reminders.js` + reminder×4,
  `render.js`'in MON2-05 ürünü olan builder dilimi (bu kart builder taşımaz), `sync.js`,
  `sw.js`, `panel*`, `app/content/*`, `docs/reminders/*`, `premium-fx-plan/MODULARIZATION.md`.
- `App.x=function` sayısı **554 sabit**; inline onclick kombine kaynakta **391 sabit**
  (fx2 overlay/tab/touch fixture'ları). `grep -cE '^App\.[A-Za-z0-9_$]+\s*=\s*function' app.js`.
- `data=` 9 rebind, B1 getter, timer/listener **kaydı**, `window.App=App`, K3/K8 mutable
  pinleri ve `register*` bag'leri app.js'te kalır.
- Modal Tab/Shift+Tab/Escape sözleşmesi ve focus listesi davranışı değişmez.
- `skySceneNow`/`mountSkyCanvas` (canvas) ve `amb-wx-*` yorum tuzağı: fx2 ambience fixture'ı
  düz metin taraması yapar — CSS yorumlarında `amb-wx-`/`amb-time-` YAZMA.
- `quranJourneySubmitProceed`/`App.quranJourneySubmit` (ağ: pull+apply) ve `zikrSyncWakeLock`
  **app.js'te kalır** (README §5 MON2-06 kartı).

## 2. Dalga 2 kapanış anlık görüntüsü (doğrulanmış, MON2-05)

- `app.js` 8.969 satır (7.777 kod) · `*Legacy` 0 · reminder gövde 408 · builder 6 fn / 97
- `app/core/render.js` 1.843 satır: 37 taşınmış builder gövdesi (831 kod satırı) +
  61 fn dep + 14 sabit dep + `find` (dep bag/manifest MON-49 fail-closed)
- Kalan >2-satır builder (stayer): haritaHTML, saveButtonHTML, dailyPhotoCardHTML,
  bugunHTML(4), headerActionHTML, headerSceneHTML
- Cache-bust: `render.js?v=20260914e`, `app.js?v=20260914e` (4 app_surface pin'i senkron)
- Kapı: smoke 21/21 · `--gate` PASS (9.400 bütçesi) · driver+zikr 95/95 · verify-state B1/B2/B3 ·
  tests/app 52/52 (premium 9 + fx2 6 dahil) · panel 23/23 · panel-v2 27/27 · quran 9/9 ·
  sync 69/69 · App.x=554 · onclick=391 · dump bugun/rapor/ayarlar/hub 4/4 BAYT-EŞİT
- Bilinen koşum nondeterminizmi (migration dışı, önceden var): `app/core/health.js`
  `calculateMgNudge` skor satırı `Math.round(75+Math.random()*20)` — dump kanıtı gerektirirse
  geçici tmp driver kopyasında Math.random sabitle (LEDGER seq 6 sapma 5).

## 3. MON2-06 iş sırası (README §5)

1. **Kapsam:** `SeymaQuran`/`SeymaZikr`/`SeymaProfile` (psych için `SeymaHealth` — monolit
   haritası `docs/monolit-bolumlenme-haritasi.md` ile **önce doğrula**, aksi halde dur)
   registry'lerine app.js'te kalan alan gövdeleri: (a) yalnız-iç gövdeler **shim'siz**,
   (b) dış-referanslılar 1-liner shim, handler gövdeleri **K4 deseniyle** ilgili registry'ye
   (`App.profileAnswer`(97), `App.zikrTap`(48), `App.zikrUndo`(37), `App.refreshQuranUpdates`(35),
   `App.confirmZikrResetToday`, `App.profileItemKeydown`, `App.profilePrevious`…).
   Beklenen: quran 107 fn/750 satır (65 yalnız-iç), zikr ≈250, profile ≈217, psych ≈175; delta ≈ −0.9k.
2. **Kural:** ağ/GPS/notification çağrısı İÇEREN gövde bu karta girmez (MON2-07);
   `App.quranJourneySubmit` + `quranJourneySubmitProceed` ve `zikrSyncWakeLock` app.js'te kalır.
   Registry'ye giden handler gövdeleri için MON-50 appSurface deseni (K4) veya registry'nin
   mevcut `call('name', args)` resolver bag'i kullanılır — yeni dosya yok (K5).
3. **Kapı:** §7 ortak + `tests/quran/*.js` + `tests/app/test_zikir_*.js` +
   `test_zikr_manual_entry.js` + profile fixture'ları (`rg --files tests | grep -i profile`
   ile doğrula) + zikr-harness. Zikr-harness dump'ları önce/sonra **bayt-eşit**
   (Math.random notu §2'ye bak).
4. **Kabul:** `--gate` PASS (≤8.500 / 0 / 450 / 150); `App.x=554`; onclick fx2 birleşik
   kaynakta 391; LEDGER seq 7; CURRENT-STATE + STATE (measurements.MON2-06, shellBudget
   zaten MON2-06'da) senkron; `DEVIR-MON2-07.md`; tek yerel commit. MON2-07'ye geçme.

## 4. Bilinen tuzaklar (MON2-05'ten devralınan dersler)

- Bağımlılık analizinde tanımlayıcı listesine güvenme: `find` dersi (LEDGER seq 6 sapma 3)
  — app.js top-level çözücüleriyle çakışan Array/Object metot adları analizden kaçabilir;
  MON-49 fail-closed bunu yakalar ama önce düzeltir, sonra koştur.
- `rewrite-app` benzeri otomasyon idempotent DEĞİL; her zaman `app-orig.js` kopyasından
  çalış; kolon-0 blok taraması kolon-0 `}` satırlarını da blok BAŞLANGICI sayar.
- K8 ilkesi — pin gövdeyi izler: gövdeyi slice'layan fixture'ları taşınan dosyaya çevir
  (MON2-05 modeli: `test_today_card_preferences`, `test_modal_focus_containment`,
  `zikr-harness` z-index); fx2 birleşik kaynak (onclick 391) yeni modülü içeriyorsa
  fixture değişikliği gerekmez.
- Cache-bust: dokunulan her asset + 4 app_surface pin'i (`20260914[de]` düz deseni).
- Smoke kümesi 21 fixture; `REMINDER CONTRACT PASS` + sessiz PASS şeklinde yorumlanmalı.
- driver/zikr FILES + rebind boot listesi değişirse 4 listeye ekle (MON-25 dersi); bu kart
  yeni dosya açmaz ama registry genişlemesi mevcut dosyaları büyütür — yük sırası değişmez.