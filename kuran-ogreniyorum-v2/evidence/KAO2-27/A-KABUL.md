# KAO2 · A-1…A-12 kabul ölçütleri (ölçüm)

Ölçüm: 2026-09-30T12:05:57Z · node tests/kao/test_kao2_kabul.js

| # | Ölçüt | Hedef | Ölçülen | Durum | Kanıt düzeyi |
|---|---|---|---|---|---|
| A-1 | Sıfır kullanıcı modal açılışından ilk karta dokunuş | ≤3 | 3 (onboarding → daily → daily) | ✅ PASS | Fixture |
| A-2 | Yeni lemmanın ilk görünümü tanış kartı | %100 | 17 görev · 3 tanış · yeni lemma 3 (eksik 0, sıra ihlali 0) | ✅ PASS | Fixture |
| A-3 | Ekran başına dolgulu birincil düğme | ≤1 | 0 ihlal (14 görünüm) | ✅ PASS | Fixture |
| A-4 | Her durumda tek, tanımlı sıradaki adım | 7/7 durum | 7 senaryo · türler: next-unit,daily,onboarding,night-review,warmup,s0-lesson,mastery,rest | ✅ PASS | Fixture |
| A-5 | Müfredat bütünlüğü (lemma/kavram/sûre bağlamı) | 524/25/20 | 524/524 lemma · 25/25 kavram bağlı · 20/20 sûre bağlamı hazır (0 yayında — L1 onayı bekliyor) | ✅ PASS | Fixture |
| A-6 | Eski veri güvenliği (kart/günlük/taş değerleri korunur) | eski değerler derin eşit | 9 kök alan + 2 ayar birebir · 5 alan şema gereği null ile eklendi (veri değil) | ✅ PASS | Fixture |
| A-7 | Tasarım sözleşmesi (06 §7 tamamı) | weights≤4 · deco/uppercase/serif 0 · kontrast 0 ihlal | weights=2 uppercase=0 deco=0 serif=0 · kontrast 0 ihlal | ✅ PASS | Fixture |
| A-8 | Cevap sonrası geri bildirim "Devam"a kadar görünür | %100 | cevap sonrası görünür=true · Devam sonrası gizli=true | ✅ PASS | Fixture |
| A-9 | Mevcut test aileleri | hepsi yeşil | KAO 45 dosya · APP 77 dosya (+panel, panel-v2, quran, reminders) | ✅ PASS | Fixture |
| A-10 | Bütçe ve süre (K-1) | runtime ≤128 · css ≤14 · content ≤256 · p95 ≤40 ms | runtime 92.431 · css 12.815 · content 177.657 · p95 6.424 ms | ✅ PASS | Fixture |
| P10 | `App.kaoOpen()` gerçek KAO eylemine ulaşır; IIP ayrı yüzey | shim → motor + ayrı yüzey | kaoOpen true · role=dialog · IIP bağımsız | ✅ PASS | Fixture |
| A-11 | İlk hafta dönüş günleri ve ilk tekrar doğruluğu | ≥4/7 gün · ≥%80 | ölçülmedi | ⏳ | **Cihaz/kullanıcı** |
| A-12 | "Şimdi ne yapmalıyım?" anı | 0 | ölçülmedi | ⏳ | **Cihaz/kullanıcı** |

## P10 kapanış kabulü

| Kontrol | Ölçülen | Durum |
|---|---|---|
| `App.kaoOpen()` gerçek KAO eylemine ulaşır; IIP ayrı yüzey | kaoOpen true · role=dialog · IIP bağımsız | ✅ PASS |
