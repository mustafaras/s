# K3PD-03 — H4 sayacı cevap öncesi koşula göre

## Kapsam ve taban

- Kart: `K3PD-03`; başlangıç HEAD: `6b393f35849b6ce524174a94a37ad49558d2d644`; dal: `k3pd-denetim-duzeltmeleri`.
- Kartın yazma kapsamı: `app/core/quranLearn.js`, `tests/kao/test_k3p_pronunciation_fold.js`, `tests/kao/test_k3p_deney_rapor.js`, `tests/kao/README.md`, kullanıcı onayıyla `kao3-premium/araclar/deney-rapor.cjs` ve K3PD durum/kayıt/kanıt belgeleri; toplam 10 exact path.
- K3PD-02 kararı korunur: `daily.calib.s21={n,ok}`; yeni alan, migration veya geçmiş sayaç düzeltmesi yok.

## Kusuru yakalayan negatif sınamalar

1. İlk cevap-sonrası uygunluk uygulamasında `node tests/kao/test_k3p_pronunciation_fold.js` exit 1 verdi: cevap öncesi `s=20` olan doğru cevap, cevap sonrası `s=21`'e çıktığı için uygun kohortta hatalı sayılıyordu. Test bu sınır hatasını doğrudan yakaladı.
2. Bağımsız denetçinin bulduğu deterministik task-ID önbellek hatası için ID-only cache kullanan sentetik, bellekteki varyant aynı odaklı testten exit 1 aldı: aynı task ID'yi taşıyan yeni görev nesnesinde beklenen folded sayısı `1`, gerçek `0` idi. Varyant dosyaya yazılmadı. Son düzeltme, görev nesnesi referansı değiştiğinde UI sunum anlık görüntüsünü geçersiz kılar; testte bu regresyon kalıcı olarak yer aldı.

## Düzeltme ve davranış kanıtı

- Uygunluk görev başındaki, cevap öncesi `isDurable`/sunum durumundan bir kez dondurulur; `scheduled.s` ile cevap sonrasında tekrar hesaplanmaz.
- Açılan native `<details>` yalnız UI sunum kaydına yazılır. Yeniden çizim bu durumu sıfırlamaz. Toggle olayı ancak etkin görev nesnesi, root ve halen bağlı disclosure düğümüyle aynıysa işlenir; ayrılmış eski düğümden gecikmiş olay yeni görevi kirletemez. Aynı etkin görevin yinelenen cevap olayı ikinci kez sayaç artırmaz; undo günlük `n/ok` değerlerini geri alır ve aynı görevde açılma bilgisini korur.
- Gerçekten katlı destek, `translit` açık, `orphan`/`readerUnknown` yok ve erişilebilir ad/ARIA'da Latin okunuş sızıntısı yok koşulları korunur. Build görevleri hariçtir.
- H4 testi `s=20/21/40 × doğru/yanlış` matrisini, cevap sonrası ters yönlü FSRS hareketini, yeni nesneyle aynı deterministik task ID'yi, redraw/open, UI-only durumu, duplicate, undo ve aynı ID'li yeni görevden sonra eski detached `<details>` toggle olayını sınar. Aynı task nesnesiyle redraw sonrası da eski detached düğüm olayı reddedilir.
- Deney raporu regresyonu, yanlış cevapların paydada kaldığını eski `s21.n/ok` alanından doğrular: sentetik `n=2, ok=1` sonucu `%50`. H4 yalnız açık `--h4-baslangic` ile R+1 sonrası ve `--bugun` tarihine kadar ölçer; başlangıç eksikse yüzde basmaz, legacy sonucu birleştirmez. H2/H7 için `--kesim` ayrı kalır.
- Kusuru yakalayan karışık veri vakası: eski 9/10 (2026-10-19) + yeni 1/2 (2026-10-21), `R+1=2026-10-21`, bugün 2026-10-21. Eski kod exit 1 ve `%83,3 (10/12)` verdi; düzeltme exit 0 ve `%50,0 (1/2)` verdi, legacy `n=10` ayrı gösterildi. 2026-10-22 satırı `--bugun` filtresiyle dışlandı.
- Başlangıç yokken H4 `ölçüm yok`/`başlangıç gerekli`; gelecekteki kohortta yeni veri yokken `veri yok` gösterilir, sıfır yüzde üretilmez. Geçersiz tarih CLI exit 2; sentetik örnek başlangıcı rapor başlığında belirtilir.

## Komut ve ölçüm kayıtları

Her listedeki komut exit 0 ile tamamlandı. `KAO2_WRITE_BASELINE` perf testi boyunca unset bırakıldı; baseline yazılmadı.

### Kart ve hedefli regresyonlar

| Komut | Exit / ölçüm |
| --- | --- |
| `node tests/kao/test_k3p_pronunciation_fold.js` | 0; 13 odaklı kontrol |
| `node tests/kao/test_k3p_deney_rapor.js` | 0; 7 hipotez satırı, H4 R+1 kohort sınırı, sızıntı 0, elle hesap 7/7, hata yolları 7 |
| `node tests/kao/test_k3p_pronunciation_fold.js` son stale-node regresyonuyla | 0; 13 odaklı kontrol; eski task/düğüm toggle'ı yeni sayacı bozmaz |
| `node --check kao3-premium/araclar/deney-rapor.cjs` | 0; sözdizimi |
| `node kao3-premium/araclar/deney-rapor.cjs --ornek --h4-baslangic 2026-02-15` | 0; sentetik R+1 sonrası 65/65, legacy n=65 ayrı |
| `node kao3-premium/araclar/deney-rapor.cjs --ornek --h4-baslangic 2026-02-30` | 2; geçersiz tarih reddedildi |

### G0 — sözdizimi, sentetik harness ve durum kapıları

| Komut | Exit / ölçüm |
| --- | --- |
| `node --check app.js` | 0 |
| `node --check sync.js` | 0 |
| `node --check app/core/quranLearn.js` | 0 |
| `node --check app/core/quranLearnFlow.js` | 0 |
| `node --check app/core/quranLearnViews.js` | 0 |
| `node --check tests/kao/test_k3p_pronunciation_fold.js` | 0 |
| `node --check tests/kao/test_k3p_deney_rapor.js` | 0 |
| `node .claude/skills/run-seyma/driver.mjs` | 0; sentetik Node/VM |
| `node .claude/skills/run-seyma/zikr-harness.mjs` | 0; 95/95 |
| `node tests/kao/test_k3pd_control.js` | 0; 33 kontrol negatif durumu, 34 K3PD ve 6 eski pin politikası durumu |
| `node kao3-premium/duzeltme-plani/araclar/durum.mjs --check` | 0; 34 kart, state/prompt/kayıt uyumlu; on exact path allowlist’te |
| `node kao3-premium/duzeltme-plani/araclar/durum.mjs --sonraki` | 0; K3PD-03 (canlı sıradaki aday; yetki vermez) |
| `node kao3-premium/araclar/senkron.mjs --sonraki` | 0; eski K3P 37/37, `nextPrompt=null` |
| `git diff --check` | 0; whitespace hatası yok |
| `git diff --exit-code HEAD -- kao3-premium/K3P-STATE.json kao3-premium/.anti-amnesia/LEDGER.md index.html sw.js` | 0; eski durum/ledger/pin dosyaları değişmedi |
| `rg -o 'App\.kao[A-Za-z0-9_]*\s*=' app.js \| wc -l` | 0; handler sayısı 45 |
| `shasum -a 256 kao3-premium/KAPANIS.md kao3-premium/README.md kao3-premium/kanit/sonraki/GORSEL-KANIT.md` | 0; üç korunan dosyanın başlangıç hashleri eşleşti |
| K3PD-03 allowlist parser çıkarımı | 0; 10/10 exact path |
| `gzip -n -6/-9 app/core/quranLearn.js` | 0; 112,368 / 112,046 bayt |
| `git branch --show-current && git rev-parse HEAD && git rev-list --left-right --count HEAD...origin/main` | 0; `k3pd-denetim-duzeltmeleri`, başlangıç HEAD, origin/main farkı 3/0 |

### G1 — ortak KAO regresyonları

| Komut | Exit / ölçüm |
| --- | --- |
| `node tests/kao/test_kao_migration.js` | 0; eski/bozuk/idempotent/yetim/114 sure/yol vakaları |
| `node tests/kao/test_kao2_migration.js` | 0; 15 kontrol |
| `node tests/kao/test_kao_fsrs.js` | 0; 24 yayımlanmış vektör |
| `node tests/kao/test_kao_queue.js` | 0; deterministik kuyruk, bütçe ve semantik aralık kontrolleri |
| `node tests/kao/test_kao_requirements.js` | 0; DİA 524/524, hedefli 2.819 ms <50 ms |
| `node tests/kao/test_kao_render.js` | 0 |
| `node tests/kao/test_kao2_navigation.js` | 0 |
| `node tests/kao/test_kao2_a11y.js` | 0; 14 kontrol |
| `node tests/kao/test_kao2_inventory.js` | 0; 83 test + 4 yardımcı/fixture |
| `node tests/kao/test_kao2_design_contract.js` | 0 |
| `node tests/kao/test_kao_pronunciation_contract.js` | 0; 524/524 kaynak/araç/çalışma zamanı eşleşmesi |
| `node tests/kao/test_kao_phonics_contract.js` | 0 |
| `node tests/kao/test_k3p_mount.js` | 0; 17 render, 8 ders aşaması, 16 ekran geçişi, yeniden kurulum 0 |
| `node tests/kao/test_k3p_focus_lock.js` | 0 |
| `node tests/app/test_asset_pin_freshness.js` | 0; 60 tam taze, 1 planlı erteleme, 0 engelleyici bayat |
| `node tests/app/test_iip_22.js` | 0; 13/13 |
| `env -u KAO2_WRITE_BASELINE node tests/kao/test_kao2_perf_budget.js` | 0; içerik 184.591 KiB, runtime 133.887 KiB, CSS 15.877 KiB, p95 9.306 ms, steady 4.015 ms |
| `node tools/kao/kao-plan-check.mjs` | 0; kod modu |
| `node tools/kao/kao-verify-contrast.mjs` | 0; 756 çift, eşik altı 0 |

### Ek görev türü regresyonları

| Komut | Exit / ölçüm |
| --- | --- |
| `node tests/kao/test_k3p_build.js` | 0; 7 kontrol |
| `node tests/kao/test_k3p_cloze.js` | 0; 7 kontrol |

Asset pin testindeki tek erteleme yalnız `app/core/quranLearn.js` içindir; `DURUM.json` içinde K3PD-32'ye kadar exact-path deferral olarak tanımlıdır. Bu sonuç yayın veya pin PASS'i değildir.

## Allowlist uyumu ve kontrol kapısı

- İlk bağımsız denetim, `PROMPTLAR.md:219` allowlist satırının düz metin olduğunu; `araclar/durum.mjs:131–143` aracının yalnız backtick içindeki yolları çıkardığını ve `DURUM.json`, `GUNCEL-DURUM.md`, `KAYIT.md` yollarını kendiliğinden eklemediğini saptadı. Bu yüzden seq 26–27’de yedi gerçek yol reddedildi.
- Kullanıcının aynı kartta rapor kaynağını ekleme yanıtı, `kao3-premium/araclar/deney-rapor.cjs` dosyasını K3PD-03 allowlist’ine ekleme yetkisi olarak uygulandı; yazma kapsamı 10 backtick’li exact yoldur. Genel parser veya başka kart/prompt değiştirilmedi.
- Güncel allowlist çıkarımı exit 0 ve 10 exact path verdi. Seq30/state senkronundan sonra `durum.mjs --check` ve `--sonraki` yeniden çalıştırıldı; ikisi exit 0 verdi ve K3PD-03'ü gösterdi. Eski exit 1 sonuçları yalnız tarihsel seq 26–27 kayıtlarıdır.
- Güncel `test_k3pd_control.js`: exit 0; 33 kontrol negatif durumu, 34 K3PD ve 6 eski pin politikası durumu. `git diff --check`: exit 0. Erişilebilirlik matrisi testinin ilk invocation’ı 30 saniyelik araç penceresinde oturum bıraktı; ayrı ve izole tekrar exit 0, 14 kontrol verdi.
- Seq29’daki bağımsız `PARTIAL` hükmü eski raporun `%83,3 (10/12)` karıştırmasını saptadı. Kullanıcı aynı K3PD-03 kapsamında kaynak dosyanın allowlist’e eklenmesini onayladı; 10-yol kapsamı ve R+1 uygulaması/testi güncellendi.
- Seq31 yeni bağımsız `PARTIAL` hükmü eski detached `<details>` toggle olayının aynı ID’li yeni görevi yanlış `opened` işaretleyebildiğini buldu. Önceki kod için sentetik negatif assertion exit 1; etkin task nesnesi + root + bağlı disclosure düğümü kontrolleri ve kalıcı regresyon eklendikten sonra `test_k3p_pronunciation_fold.js` exit 0 verdi. Kontrol düzlemi tekrar `in_progress`/`PARTIAL` ile eşitlendi; bu lifecycle düzeltmesi için son bağımsız denetim bekleniyor.

## Sınırlar

- Gerçek kullanıcı cohort'u, `R` kesim tarihi, cihaz/ekran okuyucu/L2 kabulü ve yayın doğrulanmadı; gerçek kişisel veri okunmadı.
- `K3P-STATE.json`, eski K3P ledger'ı, `index.html`, `sw.js`, `migrate()`, kalıcı şema ve `App.kao*` yüzeyi değiştirilmedi.
- `KAPANIS.md`, `README.md` ve `kanit/sonraki/GORSEL-KANIT.md` başlangıçtaki ilgisiz kirli işler olarak korundu; bu karta dahil edilmedi.
- Sentetik Node/VM kanıtı gerçek browser/cihaz/L2/kullanıcı cohort kabulü değildir. `R` yayın günü ve gerçek kullanıcı kohortu mevcut değil; canlı yedek için `--h4-baslangic` verilmedikçe H4 ölçümü kapalı kalır. Yayın ve cihaz kabulü ayrı kararlardır.


### Seq32 — seq31 lifecycle bulgusu sonrası taze doğrulama

- Regresyon kırmızı/yeşil kanıtı seq31’deki sentetik detached-details olayıdır: eski aynı-ID disclosure düğümü yeni görev örneğini opened yapıyor ve uygun H4 sayımını düşürüyordu (negatif repro exit 1). Güncel test_k3p_pronunciation_fold.js aynı-ID yeni task, aynı task redraw ve detached-node gecikmiş olaylarını sınar; node tests/kao/test_k3p_pronunciation_fold.js exit 0, 13 kontrol. Listener etkin task nesnesini, root’u ve o root’a bağlı güncel details düğümünü doğrular.
- node tests/kao/test_k3p_deney_rapor.js: exit 0; 7 hipotez satırı, H4 R+1 kesimi, sızıntı 0, elle hesap 7/7, 7 hata yolu. Sentetik örnek komutu exit 0; R+1 sonrası 65/65 ve legacy n=65’i ayrı gösterdi. Bu bir gerçek kullanıcı ölçümü değildir.
- node tests/kao/test_kao_requirements.js: exit 0; DİA 524/524, hedefli 3.090 ms <50 ms. FSRS: exit 0; 24 yayımlanmış vektör. KAO migration exit 0; KAO2 migration exit 0, 15 kontrol. Build ve cloze: exit 0, 7+7 kontrol.
- G0/G1: run-seyma driver exit 0; zikr harness exit 0, 95/95. K3PD kontrol exit 0; 33 negatif, 34 yeni plan ve 6 eski pin politikası durumu.
- izole perf bütçe kontrolü exit 0; içerik 184.591 KiB, runtime 133.989 KiB, CSS 15.877 KiB, p95 6.533 ms, steady 3.314 ms. Ayrı izole ölçüdür; önceki p95 değeri zamanlama değişkenliği gösterir.
- Eski K3P senkronu exit 0, 37/37 ve nextPrompt=null. Handler sayısı 45; korunan üç kirli dosyanın başlangıç SHA-256 değerleri aynı.
- Gerçek R/ilk kohort bilinmiyor. Üretim H4 yüzdesi, gerçek tarayıcı/cihaz, ekran okuyucu ve L2 kabulü iddia edilmiyor. Taze bağımsız denetim bekleniyor.


### Bağımsız seq33 denetimi — PASS

- Denetçi prompt → source → test → diff → HEAD izini okudu; çalışma ağacını değiştirmedi. Live prompt exact allowlist 10 yol ile DURUM/KAYIT/EVIDENCE tam eşleşti; unexpected kart yolu yok.
- Eski same-ID detached details gecikmiş toggle yeniden üretimi exit 0 verdi: yeni görev opened=false kaldı ve yanlış cevap {n:1,ok:0} sayıldı. Güncel pronunciation regressions 13 kontrol; report tests R+1 kesimi, eski kayıt ayrımı, boş cohort, geçersiz tarih ve bugünden sonrası koşullarını doğruladı.
- Durum, sıradaki aday, kontrol ve diff kapıları exit 0; current HEAD/baseHead 6b393f35849b6ce524174a94a37ad49558d2d644. App.kao* sayısı 45.
- Hüküm: PASS yalnız K3PD-03 sentetik kod/rapor ve exact scope kabulidir. Gerçek R ve kullanıcı cohort’u, browser/device, screen reader, L2 ve release kabulü kanıtlanmadı. Sonraki aday K3PD-04; bu rapor sonraki kartı yetkilendirmez.
