# K2F-40 — K-2 katman tamamlama
Tarih: 2026-10-06 · Dal: claude/admiring-pasteur-d17mpz (kao2-duzeltme içeriği) · Önceki commit: f1cb4a0 · Uygulayıcı: Claude Sonnet 5.5
Kapatılan bulgular: K2-03 · R değişimi: yok (10/10)

## İlerleme günlüğü
- [x] P1: sync PASS (40/44, seq 117), prompt in_progress
- [x] Önce döküm: 6 görev türü (meaning, arabic, audio, grammar, order, fragment) × {cevapsız, doğru, yanlış} = 18 HTML dökümü (scratchpad `before.json`)
- [x] `Views.choice` düğme kipi eklendi; `kaoTaskHTML` şık döngüsü ona taşındı
- [x] Sonra döküm: `after.json` ile `cmp` → **bayt-eşit (18/18)**
- [x] Bileşen testi genişledi; mutasyon: motor değişikliği geri alınınca `AssertionError: görev şıkları Views.choice ile kurulmalı`

## Yapılan
- `quranLearnViews.js` `choice`: `button:true` kipi (durum sınıfı + `extraClasses`, `pressed`, `disabled`, Arapça `data-kao-ar`/aria-label, `labelHtml`, `onclick`). Kip kapalıyken div çıktısı değişmez.
- `quranLearn.js` `kaoTaskHTML`: işaret/ekran okuyucu/aria HTML'i ve sınıf listesi kaldırıldı; tek çağrı `kaoViewsApi().choice({button:true,…})`.

## TDD
- Kırmızı (mutasyon): `node tests/kao/test_kao2_components.js` (motor eski hâlde) → `AssertionError: görev şıkları Views.choice ile kurulmalı`
- Yeşil: aynı komut → PASS

## Kapılar (P3)
Eşdeğer paralel koşu (kapilar.sh değil); sonuçlar LEDGER gates satırında.

## Ölçümler
- Runtime gzip(9): 115,874 → 115,991 KiB (+≈120 B); tavan 128. CSS değişmedi.
- Pinler: App.kao* 45 · yüzey 766 · atama 604 (değişmedi).

## Bilerek değişen testler
- `tests/kao/test_kao_pronunciation_contract.js`: yükleme listesine `quranLearnViews.js` eklendi (eski → yalnız motor; yeni → Views + motor) · motor artık görev şıkları için Views'a dayanır (üretimde zaten yüklü) · K2-03. Dokun listesi dışı tek satır; davranış zayıflatılmadı.

## Kanıt düzeyleri
kaynak/test ✓ · yayın — · cihaz —

## Sürprizler / sonraki promptlara not
- `Views.choice` kullanılmıyordu (yalnız testte); şimdi görev şıklarının tek kaynağı. S0 sürücüsündeki (`s0Drill`) ayrı şık kopyası kapsam dışı.
- Açık NOTE (seq 96): dinleme şıklarında doğru harf hep 1. düğme; dokunulmadı.
