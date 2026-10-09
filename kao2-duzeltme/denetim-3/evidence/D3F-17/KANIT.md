# D3F-17 — F-17: D2F-16 ölçütünün birebir sağlanmadığı kayda geçti

Oturum: claude-opus-5-5 · 2026-10-09 · D3F-17

## Bulgu
D2F-16'nın "BİTTİ SAYILIR" ölçütü (DUZELTME-PROMPTLARI PROMPT 16): "CANLI.md kullanıcı çıktısıyla · d2f-sync-check PASS · tek commit".
Ölçüldü (git + CANLI.md):
- Canlı doğrulama komutunu kullanıcı değil Claude çalıştırdı (kullanıcı devri, LEDGER seq 23). CANLI.md başlığı ve seq 24 bunu açıkça yazıyor.
- D2F-16 önekli **2 commit** var: `55da6965` (canlı doğrulama kaydı) ve `128ab06d` (NOTE — devir listesi, 8bf8f658 tutuldu).
- d2f-sync-check PASS kısmı sağlanmıştı. Canlı eşitliğini denetim-3 bağımsız doğruladı (65/65).
Kayıt yalan söylemiyordu; eksik olan, ölçütten sapmanın kendisinin LEDGER'da düzeltme notu olarak durmasıydı.

## Yapılan (yalnız kayıt)
- `kao2-duzeltme/denetim-2/LEDGER.md` **seq 30 · NOTE · D2F-16**: ölçüt, gerçek (iki commit hash'iyle), kapanış kararının değişmediği,
  onay türü (delegated, explicit değil). Geçmiş satırlar değişmedi.
- `D2F-STATE.ledgerLastSeq` 29 → 30. `CURRENT-STATE`: `lastSeq` 30 ve "Son güncelleme" seq 30 (D3F-17).
- `CURRENT-STATE` "Canlı gerçekler": `d2f-sync-check --strict` doğru biçimde `[strict-f]` ile kırmızı verdi (tablo 2026-10-08, son kayıt 2026-10-09).
  Tablo yeni koşu yapılmadan, bugünkü YAYIN-9 tam kapısının (izole klon `a384aa8a`, 20/20) ölçtükleriyle güncellendi:
  handler/yüzey/onclick pin testleri, `tests/kao` 55, kapı, tekrar-uret 10/10 ve d2f --strict. Ölçülmeyen satırlar (ör. `tekrar-uret-2` 9/9,
  `--audit-k2f`) kendi tarihini taşır; başlık bunu söyler.
- Kod, veri ve pin yok. Sonradan "kullanıcı çıktısı" üretilemez, commit'ler birleştirilmez (geçmiş yeniden yazılmaz).

## TDD
- Denetim betiği `kayit-denetimi.mjs`: olgular **veriden** türetilir (`git log --grep=^D2F-16` commit listesi, CANLI.md başlığı); sabit sayı yok.
- RED (`red.txt`): `denetim-2 LEDGER: "NOTE · D2F-16" + "denetim-3 F-17" düzeltme notu yok` ve `CURRENT-STATE "Son güncelleme" seq 29 (D3F-17) notunu anmıyor`.
- GREEN (`green.txt`): `d3f17 kayıt denetimi: PASS (D2F-16 commit 128ab06d, 55da6965 · LEDGER son seq 30 · STATE/CURRENT senkron)`.
- `d2f-sync-check --strict --clean`: PASS · ledger seq 30 · 16/16 prompt. `fix-sync-check --clean`: PASS (seq 128).
- Mutasyon `kayit-mutasyon.sh` (tek taze klon, ağsız) → **5/5 PASS** (`mutasyon.txt`): M0 yeşil · M1 not F-17'yi anmıyor · M2 STATE senkron değil ·
  M3 commit sayısı yok · M4 commit hash'i yok → hepsi beklenen metinle kırmızı.
- **Hayatta kalan mutant (dürüstlük):** ilk sürümde M4 hayatta kaldı. `128ab06d` notta "closeCommit" satırında da geçtiği için "not hash'i anıyor mu"
  kontrolü yine geçiyordu. Test zayıftı: hash'ler artık "önekli N commit oldu" satırının **içinde** aranıyor. Sonra 5/5.

## Süreç notu
Bu KANIT.md, D3F-17 commit'ine (`0ee16b7a`) girmedi: dosya yazımı oturum korumasına takıldı ve bu, commit'ten önce fark edilmedi.
Amend yapılmadı; KANIT ayrı `D3F-17: ek` commit'iyle eklendi.

## Kanıt düzeyleri
kayıt ✓ · yayın — (yalnız belge; Pages'e çalışma zamanı farkı yok, push kullanıcı talimatıyla) · cihaz — (gerekmez)

## Sonradan düzeltme (D3F-18, 2026-10-09)
Bu denetim kendi notunun LEDGER'daki son kayıt olmasını şart koşuyordu; seq 31 (D3F-18) eklenince kırmızıya döndü. Şart kaldırıldı, not başlık satırından tanınıyor,
mutasyon M2 seq'ten bağımsız. Yeniden 5/5. Ayrıntı: [`../D3F-18/KANIT.md`](../D3F-18/KANIT.md).
