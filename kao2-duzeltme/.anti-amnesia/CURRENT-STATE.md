# KAO2-FIX — CURRENT STATE

<!-- k2f-sync
nextPrompt: none
lastSeq: 127
status: completed
-->

Baştan yazıldı: 2026-10-07 (D2F-10, geriye dönük). Program: K2F-00…43 tamam (44/44), `status=completed`, `nextPrompt=null`.
Bu dosya yalnız kapanış gerçeklerini ve açık işleri taşır; prompt başına tarihçe için [LEDGER.md](LEDGER.md) ve `evidence/K2F-NN/`.

## Kapanış hükmü
KAO2-FIX 2026-10-06'da kapandı; 2026-10-06'daki bağımsız denetim (denetim-2) "tam ve kusursuz değil" dedi: kod tarafında dört kritik kusur kapanmış, kayıt ve süreç uyumunda boşluk var.
Rapor: [denetim-2/DENETIM-RAPORU.md](../denetim-2/DENETIM-RAPORU.md). Düzeltmeler ayrı program: [denetim-2/](../denetim-2/) (durum `D2F-STATE.json`; sıradaki prompt yalnız orada). Kapanış belgesi: [KAO2-FIX-KAPANIS.md](../deliverables/KAO2-FIX-KAPANIS.md) (§8 denetim-2).

## Canlı gerçekler (araçla yeniden ölçüldü, 2026-10-08; kapanış commit'i `128ab06d`, D3F-07)
| Ölçüm | Değer | Yöntem |
|---|---|---|
| `App.kao*` handler | 45 · App yüzeyi 766 · atama 604 · `onclick` 393 | `fix-sync-check.mjs` + `d2f-sync-check.mjs` |
| Yayın pini (kapanışta) | `20261007b` (index.html `quranLearn.js?v=` = `sw.js` `SW_VERSION`, `128ab06d`'de) | `git show 128ab06d:` + grep |
| Runtime (`app/core/quranLearn*.js`) gzip(9), dosya başına toplam | **117,350 KiB** ≤ 128 | `zlib` düzey 9, `test_kao2_perf_budget.js` ile aynı toplama, `128ab06d`'de |
| `app/kao.css` gzip(9) | **13,035 KiB** ≤ 14 | aynı |
| İçerik (5 modül) gzip(9) | **183,837 KiB** ≤ 256 · eski 4 modül 164,002 ≤ 176 | aynı (önceki 183,544 D2F-12 müfredat değişikliğinden önceydi) |
| `fix-sync-check --repro` | PASS (44/44 · seq 127) | koşuldu |
| `d2f-sync-check --strict` | PASS (16/16 · seq 25) | koşuldu |

Başka sayı bu dosyada **yoktur**; test/fixture sayıları için `tests/README.md` ve `tests/kao/README.md`.

## Yayın durumu
- `main`'e alınan son KAO2-FIX yayını: K2F-43, commit `6796d87a`, pin `20261006e`, Pages run 37510458831 success ([evidence/K2F-43/YAYIN.md](../evidence/K2F-43/YAYIN.md)). Sonrasında denetim-2 sırasında tek seferlik erken yayın: pin `20261007a` (ORTAK-KURALLAR §9).
- Ardından denetim-2 yayını YAYIN-3: pin `20261007b` (denetim-2 D2F-15); kapanış commit'indeki pin budur.
- Onay türü (`FIX-STATE.releaseApproval`, D3F-07): K2F-43 **çıkarımla** (LEDGER seq 123, closed-inferred), YAYIN-3 **yetki devriyle** (denetim-2 LEDGER seq 23). İkisinde de açık kullanıcı onay cümlesi yok; D2F-15'te beklenen açık teyit gelmedi.
- Canlı bayt eşitliği: pin `20261006a…e` ve `20261007a` için **doğrulanmadı** (o pinler artık canlıda değil). `20261007b` canlıda bayt-eşit doğrulandı (denetim-2 D2F-16: 20/20).
- Cihaz kabulü yok.

## Açık işler
- **denetim-2 düzeltme programı:** kapandı (D2F-16, denetim-2 LEDGER seq 24). N-04 kararı D2F-11/12'de verildi (L1 = yetki devri, `ai-delegated`). Sonraki denetim ve düzeltmeleri: `denetim-3/` (`D3F-STATE.json`).
- **L2:** gerçek alan uzmanı onayı yoktur (0/37 işaretli); liste [evidence/K2F-24/L2-PAKET.md](../evidence/K2F-24/L2-PAKET.md). Dinî bağlamlı metinlerin L1 onayı kullanıcı devriyle yapay zekâ incelemesidir.
- **Cihaz:** K2F-26…40 görsel/odak/dakika metinleri, NavBar/alt çubuk/panel-v2 dar ekran ve ekran okuyucu turu kullanıcıda.
- **Canlı doğrulama:** eski pinler (`20261006a…e`, `20261007a`) yayından kalktığı için geriye dönük doğrulanamaz; güncel yayınlar denetim-3 kayıtlarında (`denetim-3/evidence/YAYIN-*/CANLI.md`).
- **Perf:** `test_kao2_perf_budget.js` göreli p95 bandı yavaş makinede kırmızı olabilir; referans makinede bir kez koşulmalı.
- K-3 hece sesi kayıtları; D-12 (ertelendi) ve D-21 (bağlanmadı) kararları.

## Çalışma kuralları (kalıcı)
- Tarayıcı/sunucu yok, `mustafaras/seyma-data`'ya yazım yok; doğrulama headless Node ile.
- `git add` yalnız açık dosya yollarıyla (iCloud `… 2.*` kopyaları üretebilir).
- Sandbox'ta geçici işler `$TMPDIR`/scratchpad altında; VM'den dönen dizilerde `Array.from`/`plain()` kullan.
- Yeni KAO2 işi ayrı kapsam onayı ister.
