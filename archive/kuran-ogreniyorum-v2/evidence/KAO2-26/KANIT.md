# KAO2-26 — Erişilebilirlik ve kontrast denetimi
Tarih: 2026-09-30 · Dal: kao2-yeniden-tasarim (= main) · Önceki commit: `4e8a778d`

## Yapılan (06 §6, §7 · 02 T-24…T-26 · CLAUDE.md modal klavye sözleşmesi)
`tests/kao/test_kao2_a11y.js` — **11 kontrol**, 15 görünüm × {boş, tohumlu} matrisi:
1. **Her düğme erişilebilir ada sahip** (aria-label / aria-labelledby / metin) — tüm görünümler.
2. **Modal açılışı**: gövde kilitlenir, odak diyaloğa (`sey-ov-card`) gider, dönüş kimliği
   kaydedilir; kapanışta `sheetClose` sözleşmesi ve **tetikleyiciye odak dönüşü** (`kao-hub-entry`).
3. **Diyalog kabuğu**: `role="dialog"` + `aria-modal="true"`; **backdrop odaklanabilir/`role="button"` DEĞİL**.
4. **Görünüm değişiminde odak hedefi** (LargeTitle var; odak modu kancası).
5. **`aria-live`**: yalnız geri bildirim panelinde ve durum mesajlarında, hepsi `polite`
   (kesici `assertive` yasak), canlı bölge metinle sınırlı.
6. **`aria-current="step"`** yalnız StepList/Yol akışında, en çok bir adım.
7. **Arapça öğeler `lang="ar" dir="rtl"`** — ana ekran, kelime ve okuyucu taraması (regex tabanlı).
8. **Sabit px yükseklik yok**: metin taşıyan denetimler `min-height` kullanır; boyutlu içerik
   (çubuk/nokta/ilerleme/ikon/svg/halka/mühür/diyalog kabuğu/grafik dilimi) sabit kalabilir.
9. **Kontrast aracı** `--json`: 726 çift, **0 eşik altı**, denetlenen çift sayısı düşmüyor.
10. **Odak halkası** (`:focus-visible` + token) ve **≥44 px dokunma hedefi**.
11. **Dar genişlik/%200 metin**: `overflow-wrap|word-break|min-width:0` + dar ekran sorgusu.

## Üretim düzeltmeleri (testler buldu)
- **`height` → `min-height`**: metin taşıyan 15+ denetim (`.kao-live`, `.kao-back`,
  `.kao-primary/.kao-secondary`, `.kao-choices button`, `.kao-hub-card`, `.kao-close`,
  `.kao-waqf`, `.kao-order-target`, `.kao-grammar-stimulus`, `.kao-fragment-stimulus`,
  `.kao-question`, `.kao-content-error`, `.kao-arabic-text`, `.kao-pronunciation-line`,
  `.kao-undo`, `.kao-done h2`, `.kao-coverage strong`, `.kao-summary h2`, `.kao-chip`).
  Dinamik metin %200'de artık kırpılmaz (06 §6).

## Kendi hatalarım (testler/kapılar yakaladı)
1. **`line-height` → `line-min-height`**: kaba regex'im `line-height`ı da eşledi (10 yer).
   `min-min-height:52px` gibi çift bozulmalar dahil — hepsi onarıldı.
2. `aria-live` için **keyfi sayı sınırı** koydum (≤6); gerçekte 9 canlı bölge **doğru**
   kullanımdı → kural anlamlı olanla değiştirildi (hepsi `polite`, panelde var, metinle sınırlı).
3. **Sabit px yükseklik testini `^`/`$` çapalı regex ile yazdım** — JS'te `^` yalnız dizge
   başı, bu yüzden `.kao-progress` gibi seçiciler hiç eşleşmedi ve test "geçti" göründü;
   çapalar kaldırıldı. (Ders: sessiz geçen test, yanlış geçen testtir.)
4. `.kao-chip` yüksekliğini `min-height`a çevirirken **`.kao-choices button`dan miras
   kalıyordu** → çip 64px min-height ile doğrudan kural aldı.

## Kapılar (P3)
| Aile | Sonuç |
|---|---|
| `tests/kao/test_*.js` | PASS · **44/44** (yeni: a11y 11 kontrol) |
| `tests/app/test_*.js` · panel · panel-v2 · quran | PASS · 77/77 · 23/23 · 27/27 · 9/9 |
| reminders · driver · zikr · iip_22 | PASS |
| `kao-verify-contrast.mjs` | PASS (726 çift, 0 ihlal) |
| `kao2 design contract --strict` | PASS |

### K-1 bütçe
çalışma zamanı **92.431 / 128 KiB** · içerik 177.657/256 · css **12.815/14** · p95 4,9 ms.

## Kimlik pinleri — DEĞİŞMEDİ
App.kao* **42** · app.js `App.*=function` **601** · App yüzeyi **763** · `onclick` **393**.
Bu kartta yeni handler yok; CSS dışında yalnız test dosyası eklendi.

## Dürüstçe açık
- Gerçek ekran okuyucu testi (VoiceOver/TalkBack) yapılmadı — kaynak düzeyi denetim.
- Cihaz kabulü (dokunma hedefi, gerçek %200 metin) kullanıcıda.
