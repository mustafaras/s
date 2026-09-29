# KAO2 — CURRENT STATE

<!-- kao2-sync
nextCard: KAO2-17
lastSeq: 65
status: active
-->

Son güncelleme: 2026-09-29 · LEDGER seq65

## Şu an neredeyiz
**KAO2-00…16 tamamlandı (17/28).** KAO2-16 taş katmanını düzeltti: Fâtiha taşı artık
gerçek Fâtiha lemmalarına bağlı (eski sıklık dilimi koşulu 03 §2 gereği kaldırıldı),
namaz taşı tüm namaz metinlerine, **besmele** ve **u1…u12** ünite taşları eklendi;
eski kayıtlar korunur, geçiş idempotent ve kayıpsız. KAO2-15 ve öncesi 2026-09-29'da
canlıya alınmıştı; KAO2-16 **yereldir, yayınlanmadı**.

## Sıradaki kartın tek cümlesi
Sıradaki **KAO2-17**, 12 ünitenin ve derslerin Türkçe tanıtım/anlatı metinlerini
K-4 protokolüyle (kaynaklı taslak → proje sahibi → alan uzmanı) yazar; bu oturumda
başlanmadı.

## Canlı gerçekler
- Dal: `kao2-yeniden-tasarim`; bu kartın tabanı `6dae1c9c` (canlı `main` ile aynı).
- `KAO2-STATE.json`: program `active`; KAO2-16 `done`; `nextCard=KAO2-17`;
  `ledgerLastSeq=65`.
- `releaseApproval=approved_through_KAO2-15`; **KAO2-16 ve sonrası yayınlanmadı**.
  Push/merge/deploy için yeni açık kullanıcı talimatı gerekir.
- G0 kapalı, G1 sunulmuş, G2 kapalı; G3/G4 açık.
- KAO2-16 kaynak değişiklikleri: `app/core/quranLearn.js` (taş koşulları, anahtar
  uzayı, etiketler, panel projeksiyonu, `kaoUnitSlices` kaldırıldı), iki yeni fikstür
  (`test_kao2_milestones.js`, `test_kao2_migration.js`) ve üç P2.4 güncellemesi.
  **Yeni `App.kao*` handler'ı yok**; pinler ve fx2/v3 yüzeyleri değişmedi.
- **Bütçe uyarısı:** runtime `quranLearn*` **79.005 / 80 KiB** · içerik 168.483/262.144 ·
  CSS 10.421/14. KAO2-17+ için ~1 KiB yer var; kart başında ölçülmeli.
- Kaynak/test: PASS · yayın: yok · cihaz: doğrulanmadı.

## Açık riskler ve bekleyen kullanıcı işleri
- **Cihaz kabulü** hiç doğrulanmadı (KAO2-15 dâhil). Taş kutlaması ve eski veriyle
  geçiş davranışı telefonda teyit edilmeli.
- **Bütçe dar:** sonraki içerik kartları 80 KiB runtime sınırını aşabilir; gerekirse
  K-1 bütçesi kullanıcı kararıyla güncellenmeli.
- G3/G4 kapıları açık; sonraki kartlarda kendi karar/inceleme koşulları geçerli.
- KAO2-16 dâhil yayınlanmamış işler var; yayın için açık talimat gerekir.
- `perf_budget` fikstürü yük altında kırılgan (paralel CPU yükünde göreli taban
  eşiği aşılıyor; mutlak 40 ms sınırı aşılmıyor). Kart kapsamı dışı, backlog.
