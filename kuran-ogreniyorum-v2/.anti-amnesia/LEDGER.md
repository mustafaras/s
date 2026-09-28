# KAO2 LEDGER — yalnız eklenir

Kurallar:
- **Yalnız sona eklenir.** Eski kayıt düzeltilmez, silinmez; hata bulunursa yeni
  bir `FIX` kaydı eklenir ve eski kayda seq numarasıyla atıf yapar.
- Başlık biçimi (araç bunu ayrıştırır): `## seq N · YYYY-MM-DD · TÜR · KART`
  - TÜR: `PLAN` | `DECISION` | `CARD` | `BLOCKED` | `FIX` | `GATE` | `NOTE`
  - KART: `KAO2-NN` ya da `—`
- Her kayıtta en az şu satırlar: `- status:` ve `- next:` (sonraki kart ya da `none`).
- `CARD` kaydı kartı kapatırken: `- status: done`, `- commit:`, `- evidence:`,
  `- gates:` (komut → sonuç), `- metrics:`, `- evidence-levels:` (kaynak/test · yayın · cihaz), `- surprises:`.
- Aynı committe `KAO2-STATE.json.ledgerLastSeq` ve `CURRENT-STATE.md` güncellenir;
  `node kuran-ogreniyorum-v2/tools/kao2-sync-check.mjs` PASS olmadan commit atılmaz.
- `- commit:` satırına commit öncesinde `HEAD+1` yazılır (commit kendi hash'ini
  içeremez); gerçek hash bir sonraki kartın başlangıç kaydında (`NOTE`) belirtilir.

---

## seq 1 · 2026-09-28 · PLAN · —
- status: done
- summary: Kapsamlı analiz (01 kullanıcı yolculuğu: 9K/8Y/9O bulgu; 02 tasarım: T-01…T-26; 03 içerik ve pedagoji: P-01…P-10) ve plan (04 bilimsel temel D-01…D-21; 05 hedef deneyim; 06 tasarım sistemi; 07 müfredat v2; 08 teknik plan) yazıldı.
- key-facts: Motor (FSRS-5, kuyruk, telaffuz) sağlam; eksik olan öğretim katmanı ve rehberlik. Üniteler sıklık dilimi (quranLearn.js L552); `q.units` hiç yazılmıyor; Fâtiha taşı yanlış koşulda (L435); 25 kavramın `plainTr`'si gösterilmiyor; cevap sonrası ekran anında geçiyor (L968).
- next: KAO2-00

## seq 2 · 2026-09-28 · DECISION · —
- status: done
- summary: G0 kararları kullanıcı yetkisiyle alındı (10-KARARLAR.md).
- K-1: içerik ≤256 KiB gzip (modül başı tavan), runtime ≤80 KiB, css ≤14 KiB, ses ≤24 MB, vm p95 ≤40 ms.
- K-2: quranLearnFlow.js → quranLearnViews.js → quranLearn.js; dört liste aynı committe.
- K-3: hece sesi = insan kaydı, iki ses (kademe A); geçici olarak kelime içinde ses (kademe B); TTS yasak.
- K-4: L0 otomatik + L1 proje sahibi + L2 alan uzmanı; draft görünmez.
- measurements: içerik 158,4 KiB (bütçe 160 KiB, KF-11); runtime 50.221 B; css 7.051 B; ses 14 MB / 16 MB.
- next: KAO2-00

## seq 3 · 2026-09-28 · PLAN · —
- status: done
- summary: Yol haritası bağımlılık sırasına göre yeniden dizildi (müfredat KAO2-07 → motor 08 → Bugün 09 → hub 10 → ilk açılış 11 → ders oynatıcı 12). Anti-amnezi sistemi (bu dosya, CURRENT-STATE.md, tools/kao2-sync-check.mjs) ve tek dosyalık sıralı UYGULAMA-PROMPTLARI.md oluşturuldu.
- files: kuran-ogreniyorum-v2/{09-YOL-HARITASI.md, 10-KARARLAR.md, UYGULAMA-PROMPTLARI.md, KAO2-STATE.json, tools/kao2-sync-check.mjs, .anti-amnesia/*}
- evidence-levels: kaynak/test — yalnız plan belgeleri ve senkron aracı (uygulama kodu değişmedi) · yayın — yok · cihaz — yok
- next: KAO2-00

## seq 4 · 2026-09-28 · NOTE · —
- status: done
- summary: Kullanıcı isteğiyle ("push commit merge deploy") plan klasörü `KAO2-PLAN` commit'iyle kao-duzeltme dalına alındı, main'e fast-forward birleştirildi, push edildi; GitHub Pages yeniden dağıttı. Uygulama kodu değişmedi (yalnız kuran-ogreniyorum-v2/).
- consequence: KAO2-00 artık planı commit'lemez; dal `main`'den açılır (UYGULAMA-PROMPTLARI KAO2-00 adım 1–2 güncellendi).
- evidence-levels: kaynak/test — sync-check PASS · yayın — Pages çalışması (hash ve run kimliği bir sonraki kayıtta) · cihaz — yok
- next: KAO2-00

## seq 5 · 2026-09-28 · BLOCKED · KAO2-00
- status: blocked
- title: K-1 süre kapısı mevcut sözlükte aşılıyor; üretici optimizasyonu kapsam dışı
- prev-commit: d4faa17
- commit: HEAD+1
- evidence: kuran-ogreniyorum-v2/evidence/KAO2-00/KANIT.md
- attempted: Kullanıcı d4faa17 tabanını onayladı; dal açıldı; TDD 1 KiB kırmızı, gerçek K-1 tavanlarında boyut yeşil ama süre kırmızı. R-C5 ve ses bütçesi güncellendi.
- gates: perf FAIL (82,948 / 80,949 ms >40) · user_tasks PASS · audio self-test PASS · sync PASS; diğer P3 kapıları durma koşulu nedeniyle çalıştırılmadı
- metrics: içerik 162177 B · runtime 50221 B · css 7051 B gzip; ayrı modül teşhisinde sözlük p95 84,421 ms
- changed-tests: test_kao_user_tasks.js K-1 bütçeleri; yeni test_kao2_perf_budget.js
- proposed: tools/kao-lexicon-build.mjs ve üretilmiş app/content/quranLexiconV1.js için sınırlı optimizasyon kapsam onayı; semantik/freeze kontrolleri ve tüm P3 kapıları korunmalı
- evidence-levels: kaynak/test kısmi, süre FAIL · yayın yok · cihaz yok
- surprises: mevcut sözlük yükleme süresi 40 ms bütçesini tek başına aşıyor; kaynakça teyidi tamamlanmadı
- next: KAO2-00

## seq 6 · 2026-09-28 · FIX · KAO2-00
- status: done
- summary: Seq 5 BLOCKED (a47a68f) sonrası kullanıcı tools/kao-lexicon-build.mjs ve araç çıktısı app/content/quranLexiconV1.js optimizasyonunu onayladı. Kart in_progress olarak sürdürüldü; Dokun listesi eşlendi. Tek geçişli decoder, içerik semantiği korunarak süre engelini çözdü.
- evidence: kuran-ogreniyorum-v2/evidence/KAO2-00/KANIT.md
- next: KAO2-00

## seq 7 · 2026-09-28 · CARD · KAO2-00
- status: done
- title: K-1 bütçe ve süre kapısı, ses bütçesi 24 MB, kaynakça teyidi
- prev-commit: a47a68f
- commit: HEAD+1
- evidence: kuran-ogreniyorum-v2/evidence/KAO2-00/KANIT.md
- gates: kao 18 PASS · app 77 PASS · panel 23 PASS · panel-v2 27 PASS · quran 9 PASS · reminders PASS · driver PASS · zikr 95/95 PASS · contrast 336/336 PASS · sync PASS; migration 67/67 PASS; lexicon/audio self-test PASS; semantic parity PASS; freeze 4/4 bayt-eş
- metrics: içerik gzip 162173 B · runtime 50221 B · CSS 7051 B · VM p95 3,834 ms ≤40 · 524 lemma semantik eş · 38 kaynak işaretli (37 ✓, 1 ⚠︎)
- changed-tests: R-C5 K-1 bütçeleri; yeni perf fixture; mevcut beklentiler zayıflatılmadı
- evidence-levels: kaynak/test ✓ · yayın — · cihaz —
- surprises: yükleme maliyeti onaylı üretici düzeltmesiyle çözüldü; Ausubel 1968 birincil teyidi yok, D-07 işaretli
- next: KAO2-01
