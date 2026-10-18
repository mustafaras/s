# K3PD-01 kanıt makbuzu

Tarih: 2026-10-18 · Durum: `done` · Bağımsız hüküm: `PASS`.

## Yetki ve başlangıç

- Kullanıcı isteği: “sıradakini tam ve kusursuz bi şekilde uygula”; canlı kontrol düzlemi K3PD-01 gösterdi ve yalnız K3PD-01 açıldı.
- Başlangıç dalı / HEAD: `k3pd-denetim-duzeltmeleri` / `27904bce682cae1db440226850dec3e8867d0627`.
- Başlangıç `HEAD...origin/main`: `1 0` (ahead/behind); remote işlem yapılmadı.
- K3PD-00 `done` ve bağımsız `PASS`; yeni aday K3PD-01.
- Eski K3P senkronu `37/37`, `nextPrompt=null`; eski `K3P-STATE.json` dondurulmuş.
- Başlangıç K3PD `pinDeferral`: doğru dal, `until=K3PD-32`, `files=[]`, `mainExceptions=[]`.
- Başlangıç hashleri: `index.html` `351be3473258f021b297127b132770dd01a7fd3be7736f42c961ab94ecf1ae6b`; `sw.js` `e268083989956cbbd4b2cb591dab5548bb1d09b83e6346acf08a21d415f587c5`; eski K3P state `9b1e967b4e14e12f69c0c81dc346145bba1962c6f8d1d149d03ad7586fca2de9`.
- Korunan önceki kirli işler değişmedi: `KAPANIS.md` `d8e8419e2849b9eec922e537bca7100149fdfee6120ce850fda77128f8af9bcd`; `kao3-premium/README.md` `1aee47cdd05726f4a5966748ae3f786bd79d2e394dd37f3ec7b083f2d36eed0f`; `GORSEL-KANIT.md` `d7627027bba21007550f0a5c76130a4d9f11b7b896d001a60e9333c81ffeed28`.

## K3PD-01 kapsamı

Yalnız bu kartın allowlist’i ve kanıtı:

1. `tests/app/test_asset_pin_freshness.js`
2. `tests/kao/test_k3pd_control.js`
3. `kao3-premium/duzeltme-plani/DURUM.json`
4. `kao3-premium/duzeltme-plani/GUNCEL-DURUM.md`
5. `kao3-premium/duzeltme-plani/KAYIT.md`
6. `kao3-premium/duzeltme-plani/kanit/K3PD-01/EVIDENCE.md`

`index.html`, `sw.js`, pin değerleri ve eski K3P state değiştirilmeyecek. Gerçek checkout dalı değiştirilmedi; yeni karar fonksiyonu saf sentetik girdilerle sınanıyor.

## Kusuru yakalayan negatif sınama

İlk kontrol fixture’ı K3PD deferral karar fonksiyonunun bulunmadığını yakaladı: `node tests/kao/test_k3pd_control.js` exit `1`; resolver export edilmediği için pin erteleme kabulü sınanamaz durumdaydı. Aynı başlangıçta `node tests/app/test_asset_pin_freshness.js` exit `0` verip 61 bağlantıyı taze saydı; mevcut script yeni K3PD state’ini okumadığı için bu PASS yeni-state kararını kanıtlamıyordu.

## Son doğrulama

### Uygulama

`tests/app/test_asset_pin_freshness.js` artık yeni K3PD state’i için saf `resolveK3pdDeferredFiles` kararını, eski K3P için ayrı geriye uyumlu karar yardımcısını dışa açıyor. K3PD ertelemesi yalnız gerçek dal adı tam eşleştiğinde, program aktif ve şema/kart sırası tutarlı olduğunda, K3PD-32 kapanmamışken ve exact pinned path listede olduğunda uygulanıyor. Main ve diğer dallar katı; bozuk/kapalı state, wildcard, klasör ve sahte branch kabul edilmiyor. Çıktı tam tazelik ile `ERTELENDİ` sayısını ayırıyor; erteleme yayın PASS’i değil. Üretim pinleri ve `pinDeferral.files` değiştirilmedi.

### Komutlar ve sonuçlar

| Komut | Exit / ölçü |
| --- | --- |
| `node tests/app/test_asset_pin_freshness.js` | `0`; 61 tam taze, 0 ertelendi, 0 engelleyici bayat / 61 bağlantı |
| `node tests/kao/test_k3pd_control.js` | `0`; 33 kontrol negatif vakası, 34 K3PD pin vakası, 6 eski K3P vakası, 34 sentetik ID |
| `node tests/app/test_iip_22.js` | `0`; 13/13 eski pin sözleşmesi fixture’ı |
| İki değişen JS testi ve G0 JS dosyaları için `node --check` | `0` |
| `node .claude/skills/run-seyma/driver.mjs` | `0`; sentetik Node/VM sürüşü tamamlandı |
| `node .claude/skills/run-seyma/zikr-harness.mjs` | `0`; 95/95 |
| `node kao3-premium/araclar/senkron.mjs --sonraki` | `0`; eski K3P 37/37, `nextPrompt=null` |
| G0 `git status`, HEAD ve `git diff --check` | `0`; HEAD başlangıçla aynı |
| Korunan üç belge SHA-256 | 3/3 başlangıç hash’iyle eşleşti |
| Pinli `index.html`, `sw.js`, eski `K3P-STATE.json` SHA-256 | Başlangıç hash’leriyle eşleşti |
| `App.kao*` handler sayımı | 45 |
| `node kao3-premium/duzeltme-plani/araclar/durum.mjs --check` | `1`; beş yol allowlist dışı raporlandı |
| `node kao3-premium/duzeltme-plani/araclar/durum.mjs --sonraki` | `1`; aynı allowlist ihlallerinde fail-closed |

### Bağımsız denetim ve engel

Bağımsız salt-okur denetçi hükmü: `FAIL — cannot close within exact allowlist`. Kartın `Yazma allowlist’i` satırı şu kısaltmaları içeriyor: `tests/app/test_asset_pin_freshness.js; test_k3pd_control.js; yeni state/durum/kayıt`. Canlı `durum.mjs` ise allowlist’i yalnız backtick’li exact paths biçiminde ayrıştırıyor. Bu yüzden testler ve `DURUM.json`, `GUNCEL-DURUM.md`, `KAYIT.md` değişiklikleri promptun anlamsal kapsamına girse de durum kapısı beşini reddediyor. `PROMPTLAR.md` veya `araclar/durum.mjs` kart allowlist’inde olmadığı için kapsamı kendiliğimden genişletmedim.


### Kullanıcı izniyle engel düzeltmesi

Kullanıcının “tama kapat o zaman” yanıtı, az önce sunulan dar düzeltme önerisine izin olarak yorumlandı; Jev belirsizlik uyarısı bu varsayım açıkça belirtilerek ele alındı. `PROMPTLAR.md` içindeki yalnız K3PD-01 allowlist satırı, denetleyici ayrıştırıcısının kabul ettiği tam backtick’li repo yollarıyla değiştirildi; `PROMPTLAR.md` yalnız kendi allowlist düzeltmesi için kapsama eklendi. Başka prompta, karta veya `durum.mjs` aracına dokunulmadı. Sonraki doğrulama ve bağımsız denetim bekleniyor; kart henüz kapanmadı.

İlk exact-path ayrıştırma denemesi, yasak eski `K3P-STATE.json` yolunun da backtick içinde bulunduğunu saptayıp exit `1` verdi. Backtick kaldırıldı; son ayrıştırma exit `0` ile tam 7 izinli yol döndürdü ve eski state’i dışarıda bıraktı.

### Yetkili kapsam düzeltmesinden sonra yeniden doğrulama

| Komut | Exit / ölçü |
| --- | --- |
| `node kao3-premium/duzeltme-plani/araclar/durum.mjs --check` | `0`; 34 kart, state/prompt/log uyumlu |
| `node kao3-premium/duzeltme-plani/araclar/durum.mjs --sonraki` | `0`; K3PD-01 (bu kartın PASS’i sonraki karta yetki vermez) |
| `node tests/app/test_asset_pin_freshness.js` | `0`; 61 tam taze, 0 ertelendi, 0 engelleyici bayat |
| `node tests/kao/test_k3pd_control.js` | `0`; 33 kontrol negatif, 34 K3PD, 6 eski pin vakası; 34 sentetik ID |
| `node tests/app/test_iip_22.js` | `0`; 13/13 |
| G0 Node sözdizimi kontrolleri | `0` |
| `node .claude/skills/run-seyma/driver.mjs` | `0`; sentetik sürüş tamamlandı |
| `node .claude/skills/run-seyma/zikr-harness.mjs` | `0`; 95/95 |
| `node kao3-premium/araclar/senkron.mjs --sonraki` | `0`; eski K3P 37/37, `nextPrompt=null` |
| Exact allowlist ayrıştırma kontrolü | `0`; 7 yol, eski `K3P-STATE.json` yok |
| G0 Git / `git diff --check` | `0`; başlangıç HEAD’i korunuyor |

Pin hashleri ve önceki üç kirli belge hash’i başlangıçla aynı; `App.kao*` handler sayısı 45. Önceki bağımsız denetimin `FAIL` hükmü tarihsel kayıttır; tam-path düzeltmesinden sonraki bağımsız hüküm henüz alınmadı. Durum `ready_for_audit`, K3PD-01 açık.

KAYIT seq 12’nin ilk taslağında iki açıklama yer tutucusu komut sanılarak yazılmıştı. Append-only seq 13 bunları açıkça geçersiz sayıp gerçek çalıştırılmış tam komutları kaydediyor; `DURUM.json` güncel `checks` dizisi de bu gerçek komutları içeriyor.

### Bağımsız yeniden denetim ve kapanış

Bağımsız salt-okur denetçi K3PD-01 için `PASS` verdi. Denetçi, prompt allowlist’inde tam 7 backtick’li yol bulunduğunu, yasak eski K3P state/pin değerlerinin dışarıda kaldığını; state `changedPaths`, seq 13 ve kanıt referanslarının hizalı olduğunu; durum kapılarının exit `0` verdiğini; pin/korunan belge hashlerinin değişmediğini; eski 37/37 program ve 45 handler sınırının korunduğunu doğruladı.

Kapanış hükmü yalnız K3PD-01 içindir. K3PD-02 sıradaki adaydır, otomatik yetki değildir. K3PD yayın onayı `NOT_APPROVED`; remote parity, cihaz, ekran okuyucu, L2 ve diğer dış kabul kapıları bu kartın kanıtı değildir.
