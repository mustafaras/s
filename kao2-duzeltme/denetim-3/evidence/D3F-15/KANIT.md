# D3F-15 — F-15: K2F KANIT eksikleri dosya dosya kayıtta

Oturum: claude-opus-5-5 · 2026-10-08 · D3F-15

## Kök neden
`d2f-sync-check --audit-k2f` KAO2-FIX döneminin KANIT eksiklerini yalnız sayı olarak veriyordu ("44 KANIT · 43 tanesinde Oturum: yok · 7 tanesinde
8 bölümden eksik"). Hangi dosyada ne eksik olduğu hiçbir kayıtta yazmıyordu. FIX LEDGER ve CURRENT-STATE bu eksiklerden hiç söz etmiyordu.
Eksiklerin kendisi tarihsel: K2F-00…42 KANIT'ları "Oturum:" kuralı denetim-2'de (D2F) konmadan önce yazıldı. Oturum kimliği sonradan
**uydurulamaz**; eksik bölümler de geriye dönük yazılmaz. Bu yüzden düzeltme yalnız kayıt ve envanter düzeyinde yapıldı.

## Yapılan
- **Denetim betiği** `evidence/D3F-15/k2f-kanit-envanteri.mjs` (salt okur, ağsız; `--write` yalnız envanteri yazar):
  - Bölüm listesini (`KANIT_SECTIONS`) ve K2F tabanını aracın kaynağından okur; kendi kopyasını tutmaz. Mutasyon M5 bunu kanıtlar.
  - Prompt kümesini aracınkiyle aynı yoldan hesaplar: `07802fa6..cbe0d604` aralığında commit'i olan K2F prompt'ları.
  - Bağımsız sayımını aracın `--audit-k2f` (d) satırıyla karşılaştırır.
  - K2F KANIT'larının kapanıştan (`128ab06d`) beri değişmediğini sınar (çalışma ağacı dâhil). Böylece "Oturum:" satırı sonradan uydurulamaz.
  - Envanterin ölçümle bayt bayt aynı olduğunu sınar.
  - FIX LEDGER NOTE'unu sınar: sayılar ölçümle aynı, bölümü eksik her dosya adıyla anılıyor, envantere bağlanıyor, `ledgerLastSeq` NOTE'u kapsıyor.
  - CURRENT-STATE "Canlı gerçekler" tablosundaki iki senkron satırının seq değerini FIX-STATE ve D2F-STATE'ten türetip karşılaştırır.
- **Envanter** `evidence/D3F-15/K2F-KANIT-ENVANTERI.md`: betik çıktısı, elle yazılmadı. Bölümü eksik 7 dosya, eksik bölümleri ve dosyadaki
  gerçek `##` başlıkları; "Oturum:" satırı olmayan 43 dosyanın listesi.
- **FIX LEDGER seq 128 NOTE · K2F-KANIT**: sayılar, 7 dosya ve eksik bölümleri. Başka adla duran içerik dürüstçe yazıldı: K2F-22'de
  "Ölçüm (texts.tr.json, araçla)" ve "Açık kalanlar / sonraki promptlara not" var. Geçmiş satırlar değişmedi.
- **FIX-STATE** `ledgerLastSeq` 127 → 128 (yalnız bu satır).
- **FIX CURRENT-STATE**:
  - k2f-sync `lastSeq` 128.
  - "Canlı gerçekler" yeniden ölçüldü; başlık D3F-15 oldu. `fix-sync-check --repro` satırı seq 128.
  - **Bayat bir değer bulundu:** `d2f-sync-check --strict` satırı "seq 25" diyordu, gerçek 29 (D3F-08/12/13/14 denetim-2 LEDGER'a seq 26–29
    NOTE'larını ekledi ama bu satır güncellenmedi). Satır "seq 29 · 15/15 istisna" oldu. Betiğin 7. kontrolü artık bunu da yakalıyor (M8).
  - "Açık işler"e K2F KANIT eksikleri satırı eklendi.
- **D3F-STATE**: F-15 → fixed + evidence, `nextFinding` F-16, `commits.D3F-14` ek commit hash'i `6119f442`, `commits.D3F-15`.

## TDD
- RED (betik yazıldı, kayıtlar yazılmadan):
  ```
  PASS  araç ile bağımsız sayım aynı (44 · 43 · 7)
  PASS  K2F KANIT'ları kapanıştan (128ab06d) beri değişmedi
  FAIL  envanter dosyası ölçümle aynı — kao2-duzeltme/denetim-3/evidence/D3F-15/K2F-KANIT-ENVANTERI.md yok
  FAIL  FIX LEDGER'da denetim-3 F-15 NOTE kaydı var — title'ında "denetim-3 F-15" geçen NOTE yok
  d3f15 envanter: FAIL (2)
  ```
- GREEN: `d3f15 envanter: PASS · 44 KANIT · Oturum yok 43 · bölüm eksik 7` (13/13 kontrol).
- Mutasyon (depoda, taze klon, ağsız): `bash kao2-duzeltme/denetim-3/evidence/D3F-15/envanter-mutasyon.sh` → **10/10 PASS**.
  M0 yeşil · M1 K2F-05'e sahte "Oturum:" (→ "beri değişmedi") · M2 NOTE sayısı 42/44 · M3 NOTE K2F-33'ü anmıyor · M4 envanter elle
  düzenlendi · M5 araçtan "Sürprizler" düştü (→ envanter bayat; liste araçtan okunuyor) · M6 `ledgerLastSeq` 127 · M7 CURRENT-STATE fix satırı
  seq 127 · M8 d2f satırı seq 25 · M9 NOTE başlığı F-15'i anmıyor. Her kırmızı çıktıdaki gerekçe metniyle eşleştirildi.
  Mutasyon noktası bulunamazsa betik çıkış 2 verir.

## Kapılar
- `fix-sync-check --repro`: PASS · 44/44 · ledger seq 128 · App.kao* 45 · pin 20261007b (dondurulmuş: 128ab06d).
- `d2f-sync-check --strict`: PASS · 16/16 · seq 29 · 15/15 istisna.
- Hızlı set commit'ten sonra temiz ağaçta koşuldu (sonuç commit mesajında değil, kullanıcıya raporda).

## Ölçümler (kapanış commit'i `128ab06d`, `test_kao2_perf_budget.js` yöntemi, yeniden ölçüldü)
Runtime 117,350 KiB · `app/kao.css` 13,035 · içerik 183,837 · eski 4 modül 164,002 · pin `20261007b`. CURRENT-STATE ile aynı, değişmedi.

## Sınır (dürüstlük)
- Eksikler kapanmadı, **kayda geçti**. 43 KANIT oturumsuz, 7 KANIT bölümsüz kalıyor. Oturum kimliğini kanıtlayacak başka kaynak (ör. git
  trailer) yok; bulunsa bile KANIT'a sonradan yazılmazdı.
- Araç başlığı birebir arar. K2F-22'deki "Ölçüm (…)" gibi başlıklar içerik olarak bölümü karşılayabilir; envanter bu başlıkları gösterir ama
  "karşılıyor" hükmü vermez.
- `--audit-k2f` hâlâ yalnız rapor verir (kapı değil); bu bulgu onu kapıya çevirmedi.

## Çalışma zamanı
Kod, veri ve pin değişmedi (`app/`, `index.html`, `sw.js`, `panel-v2.html` aynı) → pin yükseltilmedi (`20261008d`), tam kapı gerekmedi.

## Kanıt düzeyleri
kayıt/test ✓ · yayın — (bu bulguda istenmedi) · cihaz —
