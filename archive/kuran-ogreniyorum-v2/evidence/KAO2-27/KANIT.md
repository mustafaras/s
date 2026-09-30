# KAO2-27 — Regresyon, sürüm pini ve program kapanışı
Tarih: 2026-09-30 · Dal: kao2-yeniden-tasarim (= main) · Önceki commit: `40af1233`

## Yapılan
1. **A-1…A-10 kabul ölçütleri ölçüldü** — `tests/kao/test_kao2_kabul.js` GERÇEK koşullardan
   ölçer (uydurma sabit yok) ve `evidence/KAO2-27/A-KABUL.md` tablosunu üretir. **10/10 PASS.**
   A-11/A-12 cihaz/kullanıcıda işaretli.
2. **P10 kapanış kabulü:** `App.kaoOpen()` shim'i gerçek motora ulaşır (durum `true`), KAO
   modalı 06 sözleşmesini taşır (`role="dialog"` + `aria-modal`), KAO **kendi yayın yüzeyidir**
   (IIP sekmesi KAO ekranlarını gömmez).
3. **Sürüm pini tek committe:** `20260930k` → `20260930l`; `index.html`, `sw.js`
   (`SW_VERSION`, `SW_OFFLINE_VERSION=iip22-<pin>`, önbellek listesi), `test_iip_22.js`
   `release` sabiti ve tüm `tests/kao/*` pinleri.
4. **Kapanış belgesi** `deliverables/KAO2-KAPANIS.md`: kapanan bulgular (01/02/03 kimlikleriyle),
   K-1…K-4 durumu, ölçümler, bilerek değişen testler, kanıt düzeyleri, yayın önerileri.
5. **Kılavuz satırı:** `CLAUDE.md` + `AGENTS.md` Agent Routing'e **tek** KAO2 satırı.
6. **Durum:** `KAO2-STATE.json` `status:"completed"`, `nextCard:null`,
   `releaseApproval:"not_approved"`; LEDGER son kaydı `- next: none`.

## Ölçüm (A-KABUL.md)
| # | Ölçülen |
|---|---|
| A-1 | 3 dokunuşta ilk karta (≤3) |
| A-2 | 17 görev · 3 tanış · yeni lemma başına 1 (eksik 0, sıra ihlali 0) |
| A-3 | 14 görünümde 0 ihlal |
| A-4 | 7 senaryo · 8 adım türü |
| A-5 | 524/524 lemma · 25/25 kavram · 20/20 sûre bağlamı (0 yayında — L1) |
| A-6 | 9 kök alan + 2 ayar birebir; 5 alan şema gereği null (veri değil) |
| A-7 | weights 2 · deco/uppercase/serif 0 · kontrast 0 ihlal |
| A-8 | Cevap sonrası görünür, "Devam"dan sonra gizli |
| A-9 | KAO 45 dosya · APP 77 dosya (+ panel/panel-v2/quran/reminders) |
| A-10 | runtime 92,4/128 · css 12,8/14 · content 177,7/256 · p95 ≤40 ms |

## Kendi hatalarım (testler yakaladı)
1. **A-2 ölçümünü uydurma alanlarla yazdım** (`flow.buildLesson`) — gerçek API
   `lessonPlan(snapshot, lessonId, now, content)` ve **dizi** döndürür.
2. **A-5'i olmayan bir yoldan okudum** (`cur.texts.surahs`) — gerçek yol `cur.surahs`.
3. **A-6'da şekil eşitliği dayattım** — `migrate()` şema gereği `null` alan ekler; veri
   kaybı değildir. Ölçüt "eski değerler korunur" olarak yazıldı (alt küme karşılaştırması).
4. **A-8'i yanlış göstergeyle ölçtüm** — panel `taskId` ile eşleşir; doğru ölçüt
   `kao-choice-correct` / `Senin seçimin` geri çekilmesi.
5. **A-2'yi `isNew` bayrağıyla ölçtüm ve üretimi bozdum:** "aynı oturumda tanışı yapılan
   lemma sonraki görevlerde `isNew` olmamalı" diye değiştirdim; ama `isNew` **günlük
   `new` sayacını** besler (`kaoAnswer`), bu yüzden `test_kao2_lesson_flow` gerçek bir
   gerileme yakaladı (`0 !== 1`). **Değişiklik geri alındı**; A-2 artık **sipariş**
   kuralıyla ölçülüyor: her yeni lemma için tanış kartı vardır ve tanış, aynı lemmanın
   bütün alıştırmalarından ÖNCE gelir. (Ders: bir bayrağı yeniden anlamlandırmadan önce
   tüm tüketicilerini ara.)
6. `fresh.indexOf` düzeltmesini yazarken **bozuk ifade** ürettim (`SyntaxError`) — düzeltildi.
7. **A-2 ölçümünü uydurma alanlarla yazdım** (`flow.buildLesson`) — gerçek API
   `lessonPlan(snapshot, lessonId, now, content)` ve **dizi** döndürür.

## Kapılar (P3, tamamı)
| Aile | Sonuç |
|---|---|
| `tests/kao/test_*.js` | PASS · **45/45** (yeni: kabul 10 ölçüt + P10) |
| `tests/app/test_*.js` | PASS · **77/77** (pin güncel) |
| panel · panel-v2 · quran | PASS · 23/23 · 27/27 · 9/9 |
| reminders · driver · zikr · iip_22 | PASS |
| `kao2-sync-check.mjs` | PASS (`completed`) |

### K-1 bütçe
çalışma zamanı **92,4 / 128 KiB** · içerik 177,7/256 · css 12,8/14 · p95 ≤40 ms.

## Kanıt düzeyleri
- kaynak/test ✅ · yayın ✅ (bayt eşitliği) · **cihaz ❌** (A-11/A-12) · ekran okuyucu ❌ · L1/L2 ❌
