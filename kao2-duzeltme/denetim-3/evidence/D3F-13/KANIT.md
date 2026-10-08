# D3F-13 — F-13: bayat ve çelişkili belgeler ölçülen gerçekle düzeltildi

Oturum: claude-opus-5-5 · 2026-10-08 · D3F-13

F-13'ün CURRENT-STATE kısmı D3F-05'te kapanmıştı. Kalan üç belge bu düzeltmede kapandı.

## Ölçüm (iddia ↔ gerçek)
| Belge | İddia | Gerçek (kaynak) |
|---|---|---|
| `denetim-2/DUZELTME-SONUCU.md` §1 | "14/14 kayıtlı istisna", `SW_VERSION 20261007a` | D2F-13 anının değeri. Kapanış: `D2F-STATE.strictExceptions` = **15**, `pins.release` = **`20261007b`** |
| aynı §2 | "(13 kayıt)" | D2F-13 anı (aynı belgenin §1'iyle 14 ↔ 13 çelişkisi); kapanış 15 |
| aynı §4 madde 5 ve 7 | canlı doğrulama "komutu kullanıcı çalıştırır"; D2F-15 yayını bekliyor | ikisi de kapandı: §5 (20/20 EŞİT), YAYIN-3 yetki devriyle (LEDGER seq 23) |
| CLAUDE.md + AGENTS.md KAO satırı | "Açık kararlar: içerik gzip 159,9 KB > 130 KB bütçe" | karar verildi: içerik ≤256 KiB, eski 4 modül ≤176 KiB (kullanıcı kararı, KAO2-FIX LEDGER seq 239–241). Ölçüm 2026-10-08: **183,950 / 164,108 KiB** |
| `denetim-2/DEVIR-LISTESI.md` §3 | eşlenmeyen 13 namaz kelimesi "uygulamada 'açık' görünürler" | `kaoPrayerHTML`: tanınmayan kelime `is-closed` başlar ("anlamı kapalı; dokununca açılır"), dokununca `is-revealed`. denetim-3 evidence/12: 94/94 düğme çalışıyor |

## Yapılan (yalnız belge; kod/veri/pin yok)
- **DUZELTME-SONUCU:** başa düzeltme notu eklendi. O anın değerleri silinmedi; yanlarına "D2F-13 anı / kapanışta 15/15 / kapanış pini `20261007b`" yazıldı.
  §3 yayın satırına sonraki canlı doğrulama eklendi. §4 madde 5 ve 7'nin üstü çizildi ve kapanışları yazıldı.
- **CLAUDE.md + AGENTS.md:** "Açık kararlar: … 130 KB" yerine "İçerik bütçesi kararı verildi (…); Açık karar: cihaz kabulü (K3)". İki dosyanın KAO satırı aynı.
- **DEVIR-LISTESI §3:** "açık görünürler" → "kapalı başlarlar … dokununca açılır" (kanıt bağlantısıyla, düzeltme notuyla).
- denetim-2 **LEDGER seq 28 NOTE · D2F-13** · `D2F-STATE.ledgerLastSeq` 27 → 28 · CURRENT-STATE senkron bloğu ve "Son güncelleme".

## TDD karşılığı (belge düzeltmesi)
- `node kao2-duzeltme/denetim-3/evidence/D3F-13/belge-denetimi.mjs`: her iddiayı kaynağından türetir. STATE'ten istisna sayısı ve pin, kodda
  `is-closed` deseni, gzip ölçümüyle içerik tavanı, CLAUDE.md ↔ AGENTS.md eşitliği.
  - RED (düzeltme öncesi): `FAIL (7)`. Doğru olan iki kontrol baştan PASS'tı: dosyalar aynı ve kod kapalı başlatıyor.
  - GREEN: `belge-denetimi: PASS` (9/9).
- `d2f-sync-check --strict` PASS (seq 28) · pages-kayit 4/4.

## Sınır
- Denetim belirli iddiaları sınar; belgelerdeki her cümleyi değil. DUZELTME-SONUCU'nun diğer satırları D2F-13 anının ölçümü olarak bırakıldı.

## Kanıt düzeyleri
kayıt/belge ✓ · yayın — (belgeler Pages'e çıkmaz) · cihaz —
