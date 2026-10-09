# D3F-18 — F-18: `8bf8f658` süreç sapmalarının eksik kısmı ve seq 21 sayım yanlışı kayda geçti

Oturum: claude-opus-5-5 · 2026-10-09 · D3F-18

## Bulgu ve ölçüm
Rapor (F-18): `8bf8f658` öneksiz, testlerden önce atılmış ("ara durum"), plan dışı pin `20261006c`; içerik gerçek düzeltme; 6 test yalnız pin dizgisi;
görsel QA betikleri kurala uygun; "tutuldu" kararı doğru. Karar denetim-2 LEDGER seq 21'de zaten var.
Commit'in kendisinden ölçülen (seq 21 ile karşılaştırma):
- Seq 21 "Değiştirdiği **8** fixture" diyor. Doğrusu **6 test dosyası**, hepsinde yalnız pin dizgisi. Kalan iki yeni dosya görsel QA betiği, fixture değil.
- Seq 21 yalnız "öneksiz/kapsam dışı" diyor. "Testlerden önce atıldı" ve plan dışı pin `20261006c` kayıtlı değildi.
- Görsel QA betiklerinin (`shoot-app.mjs`, `shoot-panel.mjs`) CLAUDE.md kural 1 istisnasına uyumu kayıtlı değildi. Ölçüldü: yalnız `127.0.0.1:9000`,
  boş geçici profil, dış istekler kesik, `seyma-sync-force` ve `forceSync=1` kurulmuyor. `ghToken` ve `seyma-sync-force` yalnız sentetik varsayılan veride
  "yok" olduklarını kanıtlamak için mantıksal değer olarak okunuyor.
- Karar değişmedi: geri almak canlıdaki düzeltmeleri siler.

## Yapılan (yalnız kayıt)
- denetim-2 LEDGER **seq 31 · NOTE · D2F-13** (seq 21'in programı): yukarıdaki üç eksik, 6 test dosyası adıyla. Geçmiş satırlar değişmedi.
- `D2F-STATE.ledgerLastSeq` 30 → 31. `CURRENT-STATE`: `lastSeq` 31 ve "Son güncelleme"ye seq 31 (D3F-18).
- Kod, veri ve pin yok.

## TDD
- `kayit-denetimi.mjs`: olgular **commit'ten** türetilir (`git show --name-only` test listesi, index.html'deki eklenen pin, commit mesajı,
  QA betiklerinin içeriği); sabit sayı yok.
- RED (`red.txt`): not yok · CURRENT-STATE seq'i anmıyor.
- GREEN (`green.txt`): `d3f18 kayıt denetimi: PASS (8bf8f658: 6 test dosyası · pin 20261006c · QA 2 betik kurala uygun …)`. `d2f-sync-check --strict` PASS (seq 31).
- Mutasyon `kayit-mutasyon.sh` → **8/8 PASS** (`mutasyon.txt`): M1 not F-18'i anmıyor · M2 STATE senkron değil · M3 yanlış sayı · M4 bir test adı eksik ·
  M5 pin yazılmamış · M6 "testlerden önce" yok → hepsi kırmızı. M7 sağlamlık: sonraya başka bir not eklenince **yeşil kalır**.
- **Hayatta kalan mutant (dürüstlük):** ilk koşuda M1 hayatta kaldı. "denetim-3 F-18" ifadesi notun gövdesinde ("karar değişmedi" satırı) de geçtiği için
  not yine bulunuyordu. Not artık yalnız `- başlık:` satırından tanınıyor. Aynı daraltma D3F-17 denetimine de uygulandı.

## D3F-17 denetimine düzeltme (bu commit'te)
D3F-17'nin `kayit-denetimi.mjs`'i kendi notunun LEDGER'daki **son** kayıt olmasını şart koşuyordu. Seq 31 eklenince kırmızıya döndü
("F-17 notu son seq olmalı (not 30, son 31)"); bu, hızlı seti ilk yeni notta bozacaktı. Düzeltme:
- "Son seq olmalı" şartı kalktı. CURRENT-STATE notun **kendi** seq'ini anmalı. STATE ve CURRENT-STATE LEDGER'ın son seq'iyle senkron olmalı.
- `kayit-mutasyon.sh` M2 sabit `30` yerine her seq'te çalışan bir bozma kullanıyor. D3F-17 mutasyonu yeniden **5/5**.
- D3F-18 M7 bu sınıf hatayı artık yakalıyor.

## Kanıt düzeyleri
kayıt ✓ · yayın — (yalnız belge) · cihaz — (gerekmez)
