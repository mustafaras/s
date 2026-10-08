# D3F-07 — F-07: `FIX-STATE.releaseApproval` onay türünü söylüyor

Oturum: claude-opus-5-5 · 2026-10-08 · D3F-07

## Kök neden
KAO2-FIX kapanışında `FIX-STATE.releaseApproval` = `"approved_through_K2F-43"` yazıldı. Bu değer onayın türünü gizliyordu. Gerçek:
- **K2F-43 / YAYIN-2** (pin `20261006e`): prompt kapanış özetinden sonra birebir "YAYIN-2 onaylı" cümlesini ister; o cümle alınmadı.
  Onay, oturum başındaki genel talimattan **çıkarıldı** (FIX LEDGER seq 123, `closed-inferred`).
- denetim-2 LEDGER seq 22: "bu yayın K2F-43'teki yayını da açıkça onaylamış olur" koşulu gerçekleşmedi. **YAYIN-3** (pin `20261007b`)
  açık cümleyle değil, **yetki devriyle** (Claude kararı) yapıldı (denetim-2 LEDGER seq 23).
- `fix-sync-check` yalnız alanın var olup olmadığına bakıyordu (`for key of [... 'releaseApproval']`); değeri hiç sınamıyordu.
  Bu yüzden abartılı değer kapılardan geçiyordu.

## Yapılan
- **Araç** (`kao2-duzeltme/tools/fix-sync-check.mjs`, bölüm 5b):
  - Biçim: `<tür>_<YYYY-AA-GG>_<yayın>` ögeleri `+` ile birleşir; tür `explicit`, `inferred` ya da `ai-delegated` olabilir. Eski `approved_through_*` reddedilir.
  - Her öge `releaseApprovalRecord[<yayın>]` içinde aynı tür ve tarihle bulunmalı ve bir LEDGER kaydına (`{file, seq}`) bağlı olmalı.
  - LEDGER kaydı yayını anmalı ve türü doğrulamalı: inferred → `closed-inferred`, ai-delegated → `devir`, explicit → kayıttaki birebir kullanıcı cümlesi LEDGER'da geçmeli.
  - FIX LEDGER'da `closed-inferred` GATE'i olan her yayın `inferred` yazılmak zorunda.
- **Kayıt** (`kao2-duzeltme/FIX-STATE.json`): `releaseApproval` = `inferred_2026-10-06_K2F-43+ai-delegated_2026-10-07_YAYIN-3`
  (D2F-STATE'in `ai-delegated_2026-10-07_YAYIN-3` biçimiyle aynı; raporun önerisi `inferred_K2F-43 + ai-delegated_YAYIN-3`'e tarih eklendi).
  `releaseApprovalRecord`: iki yayının türü, tarihi, pini, LEDGER bağı ve açıklaması. `ledgerLastSeq` 126 → 127.
- **FIX LEDGER seq 127 NOTE · K2F-43**: düzeltme notu. Geçmiş satırlar değişmedi; seq 103…502 arasındaki tarihsel `approved_through_*` satırları olduğu gibi kaldı.
- **`evidence/K2F-43/YAYIN.md`**: sona "Düzeltme notu" bölümü eklendi. "kullanıcının açık cümlesi… YAYIN-2 onaylı sayıldı" satırı değişmedi (D3F-05'teki D2F-12 KANIT örneği gibi).
- **FIX `CURRENT-STATE.md`** (kural 8: LEDGER notu → senkron bloğu ve Canlı gerçekler yeniden ölçülür):
  - k2f-sync `lastSeq` 127.
  - "Canlı gerçekler" kapanış commit'i `128ab06d`'de, `test_kao2_perf_budget.js` yöntemiyle yeniden ölçüldü. Bayat iki değer düzeldi: pin `20261007a` → `20261007b`, içerik 183,544 → **183,837 KiB** (eski değer D2F-12 müfredat değişikliğinden önceydi). Runtime 117,350 · css 13,035 · eski 4 modül 164,002 · App.kao* 45 değişmedi.
  - "Yayın durumu": "açık teyit D2F-15'te alınır" (gerçekleşmedi) yerine iki yayının onay türü yazıldı; YAYIN-3 ve `20261007b`'nin canlı doğrulaması (D2F-16, 20/20) eklendi.
  - "Açık işler": "denetim-2 … kalan prompt'lar / N-04 karar bekler" (denetim-2 D2F-16'da kapandı) ve "bayt eşitliği komutu kullanıcıda" (eski pinler artık canlıda değil) satırları güncellendi.
  - Bu son iki düzeltme F-07'nin doğrudan konusu değil; ama kural 8 gereği yeniden ölçülen dosyada yanlış kalmamaları için yapıldı.

## TDD
- RED (yalnız araç değişmişken, eski kayıtla):
  ```
  KAO2-FIX senkron: FAIL (2)
    - releaseApproval ögesi "approved_through_K2F-43" <tür>_<tarih>_<yayın> biçiminde değil (tür: explicit|inferred|ai-delegated)
    - LEDGER seq 123: K2F-43 yayın onayı closed-inferred, ama releaseApproval onu inferred diye yazmıyor
  ```
- GREEN: `KAO2-FIX senkron: PASS · 44/44 · ledger seq 127 · App.kao* 45 · pin 20261007b (dondurulmuş: 128ab06d)` (`--repro` ile).
- Mutasyon (depoda, yeniden üretilebilir): `bash kao2-duzeltme/denetim-3/evidence/D3F-07/onay-mutasyon.sh` → **10/10 PASS**.
  Senaryolar: M0 yeşil · M1 eski değer · M2 K2F-43 explicit · M3 K2F-43 düşürüldü · M4 YAYIN-3 inferred · M5 YAYIN-3 → seq 22 (devir yok) ·
  M6 kayıt yok · M7 seq 999 · M8 tarih ≠ · M9 başka yayının LEDGER kaydı. Her kırmızı, çıktıdaki gerekçe metniyle eşleştirildi.

## Sınır (dürüstlük)
- `explicit` denetimi yalnız kayıttaki cümlenin LEDGER'da birebir geçtiğine bakar; cümlenin gerçekten bir onay olup olmadığını anlamaz.
  Bu iki yayında `explicit` yok, dolayısıyla bugün sınanan durum değil.
- Daha önceki KAO2-FIX yayınlarının (ör. K2F-03…K2F-17 erken yayınları, K2F-34) onay türü bu düzeltmede yeniden denetlenmedi.
  `releaseApproval` alanı kapanıştaki son iki yayını (K2F-43 ve kapanış pini `20261007b`'yi getiren YAYIN-3) kapsar.
- denetim-2 LEDGER'ına not eklenmedi; seq 22'deki koşulun gerçekleşmediği bilgisi FIX LEDGER seq 127'de ve FIX-STATE'te duruyor.

## Çalışma zamanı
Kod, veri ve pin değişmedi (`app/`, `index.html`, `sw.js`, `panel-v2.html` aynı) → pin yükseltilmedi (20261008a).

## Kanıt düzeyleri
kayıt/test ✓ · yayın — (yayın bu bulguda istenmedi) · cihaz —
