# KAO-FIX-18 · Sahipsiz plan maddeleri kararı (D-4) — kanıt

Dal `kao-duzeltme`, taban `5500d7b` (= origin/main). Yalnız belge; KF-6 varsayılan ("sonraki program"), kod yok.

## Kod doğrulaması (durum yazmadan önce, `app/core/quranLearn.js` + `app/kao.css`)
- `grep -c` → "bağ kur" 0 · "karıştır" 0 · niyet/namaz vakti 0 · haftalık/aktarım 0 · `SeyHaptics` 0 · `SeyAudio` 0 · `countUp` 0 · konfeti 0 · `sey-enter`/`SeyFx` 0 (kao.css da 0)
- Var olanlar: `errors.{sound,root,affix,cognate,rule,order}` sayaçları (yalnız artar; kuyrukta okunmaz); `phonics.misheard` + telaffuz ekranında "Dikkat listesi" (`:1210`); `kaoMotionAllowed()` 2 kullanım; E9 `kaoPickAyah` görülmemiş ≥%95 âyeti seçer, kullanıcı işaretler (test/ölçüm yok); gölgeleme "Yakın" kararı yalnız not gösterir, kaydedilmez (`kaoRecordDiscard`); varsayılan `settings.harakat:true`, `readability.fadeHarakat:false`.

## Durum satırları (7/7)
| Madde | Durum |
|---|---|
| 02 §5.3 hareke/soldurma | Uygulandı (KAO-FIX-15, `durable30`) |
| 02 §5.6 "bağ kur" | Uygulanmadı — sonraki program |
| 02 §5.7 hata taksonomisi | Kısmen: sayaçlar var; kuyruk ağırlığı + "en çok karıştırdıkların" yok |
| 02 §5.8 niyet önerisi | Uygulanmadı — sonraki program |
| 02 §5.10 haftalık aktarım testi | Uygulanmadı (E9 aday seçimi var, ölçüm yok) |
| 04 §4 Hareket ve FX | Kısmen: hareket ayarı dalı var; haptik/ses/countUp/konfeti/`.sey-enter` yok |
| 10 §9 Ölçüm | Kısmen: dikkat listesi var; kova B/C raporu ve "Yakın" oranı yok |

Sapma: prompt her madde için "Uygulanmadı" kalıbını öneriyor; kodda kısmen karşılanan üç maddede (5.7, 04 §4, 10 §9)
"Kısmen — …" yazıldı ki belge koddan fazla ya da eksik iddia etmesin. 5.3 promptun istediği gibi "uygulandı" işaretlendi.

## Kontroller
- `grep -c "Durum (KAO-FIX-18"` → 02: 5 · 04: 1 · 10: 1 = **7**
- `git diff --stat` → yalnız `02-PEDAGOJI.md` (+5), `04-DENEYIM-VE-TASARIM.md` (+1), `10-TELAFFUZ.md` (+1) + `duzeltme/**`
- CURRENT-STATE "Sonraki program adayları": 6 madde + diğer ertelenenler (KF-2 bölme, kısa anahtarlar; kullanıcıda: gzip, `eighty`)
- `node kuran-ogreniyorum/tools/kao-plan-check.mjs | tail -1` → PASS (6 warn)

## Kalan risk
- Yok (belge). Adaylar yeni bir program onayı ister.
