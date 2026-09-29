# KAO2 — CURRENT STATE

<!-- kao2-sync
nextCard: KAO2-13
lastSeq: 54
status: active
-->

Son güncelleme: 2026-09-29 · LEDGER seq54

## Şu an neredeyiz
KAO2-00…12 tamamlandı. Canlı Git/STATE doğrulaması KAO2-13'ü seçti; senkron kapısı başlangıçta PASS'tı. KAO2-13 için yedi seviyeli Yol görünümü, müfredat ünite satırları, ünite ayrıntısı, gerçek ilerleme, ders listesi ve fikstür eklendi. Odaklı yol fikstürü 4/4, `test_kao_render.js` PASS. Kart P6 ile durdu: `tests/kao/test_kao_user_tasks.js:80`, eski ve kaldırılmış `api.kaoUnitsHTML()` üzerinden ünite listesinden ilk kelime/kök rotasını zorunlu tutuyor. Bu dosya KAO2-13'ün Dokun listesinde değil; güncellenmedi. Tam P3 kümesi çalıştırılmadı.

## Sıradaki kartın tek cümlesi
KAO2-13 engelli ve sıradaki kart olarak kalıyor; yalnız `tests/kao/test_kao_user_tasks.js` bölüm (b) için P6'da belirtilen sınırlı test kapsamı onaylanırsa devam edilebilir.

## Canlı gerçekler
- Dal `kao2-yeniden-tasarim`; başlangıç HEAD `b67458daa322b9d8fb54feceaba6ed2a33f8450a`; temiz başlangıç çalışma ağacı.
- `KAO2-STATE.json.nextCard=KAO2-13`, kart `blocked`, `ledgerLastSeq=54`.
- Release approval yalnız `approved_through_KAO2-12`; push/merge/tag/deploy yok. Cihaz kabulü doğrulanmadı.
- G0 kapalı, G1 sunulmuş, G2 kapalı, G3/G4 açık.
- `kaoUnitSlices()` eski taş hesabı için KAO2-16'ya kadar korunuyor. İlham & İbadet sekmesi ve `saygi.js`/`app/styles.css` değiştirilmedi.
- Ünite gezinme eylemi `kaoNav('unit', id)` biçiminde; mevcut `quranLearnFlow.js` izin listesindeki `units` geçmiş yolunu id parametresiyle kullanıyor, o modül değiştirilmedi.

## P6 kapsam engeli ve istenen karar
- `node tests/kao/test_kao_user_tasks.js` → FAIL: satır 80 `api.kaoUnitsHTML is not a function`.
- İstenen kapsam: yalnız testin (b) senaryosunu Yol → Ünite → yeni ders/kelime listesi sözleşmesine güncellemek. Onay verilirse diğer senaryolar veya üretim dosyaları bu kapsam genişletmesiyle değiştirilmeyecek.
- P6 kapanışı seq54 ile kaydedildi. Kaynak/kısmi test kanıtı var; yayın ve cihaz kabulü yok. KAO2-13 kapanış kanıt dosyası üretilmedi.
