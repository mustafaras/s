# D2F-02 · Kapı araçları · KANIT

Oturum: https://claude.ai/code/session_018iQKmY6Zw9KwXkn632WQoN
Tarih: 2026-10-07 · Rapordaki bulgu: D2-12 (araç kısmı), §5

## İlerleme günlüğü
1. Dal `claude/jolly-ride-9ltui4` `36015f08`'deydi; `kao2-duzeltme/denetim-2/` yoktu. D2F-01 (`10537d18`) yalnız
   `origin/claude/happy-newton-okecaw`'da; dalımız onun katı atasıydı → `git merge --ff-only` ile `10537d18`'e ilerletildi.
2. ORTAK-KURALLAR okundu; `nextPrompt` = D2F-02; `d2f-sync-check.mjs --clean` PASS.
3. Okundu: `kao-plan-check.mjs` (KAO_SUBJECT_RE), `kao-plan-check.test.mjs`, `git show 5b267dde`, `kapilar.sh`,
   `test_kao2_kabul.js` A-10, `test_kao2_perf_budget.js`.
4. Self-test genişletildi → kırmızı; plan-check düzeltildi → yeşil. Perf testi bayraklı koşu → kırmızı; düzeltildi → yeşil.
5. Mutasyon kanıtları scratchpad kopyalarında. `kapilar.sh` düzenlendi.
6. Kapılar sırayla: bayraksız (tam), sonra bayraklı (tam). Arada dosya değişmedi.

## Yapılan
- `docs/kuran-ogreniyorum/tools/kao-plan-check.mjs`
  - `KAO_SUBJECT_RE`'deki genel `K2F-NN(?: ek)?` izni kaldırıldı (5b267dde'nin genişletmesi geri alındı).
  - `SUBJECT_EXCEPTIONS`: tek hash istisnası `65e94db29eda6d81753dd70a7c5785e10052ebed` → yalnız `^K2F-38 ek:` (gerekçe yorumu ile);
    yeni `subjectRecognized(cm)` = regex VEYA (tam hash + birebir konu öneki). Kapsam taraması (bölüm 7) bunu kullanır.
  - `D2F-(0[1-9]|1[0-6])` hem `KAO_SUBJECT_RE`'ye hem `CARD_OF_SUBJECT_RE`'ye (`--commits` sayımı) eklendi.
- `kao-plan-check.test.mjs`: 8 yeni vaka — D2F-03 kabul · D2F-16 kabul · D2F-3 red · D2FX-03 red · D2F-17 red ·
  "K2F-38 ek:" 65e94db2'de kabul · "K2F-38 ek:" başka hash'te red · "K2F-07 ek:" başka hash'te red. 30 → 38 vaka.
- `tests/kao/test_kao2_perf_budget.js`: `KAO2_ACCEPT_SLOW_HOST=1` yalnız göreli bandı (taban p95 × 1,25) atlar; ölçülen
  steady değer ve bant yine stdout'a yazılır: `GÖRELİ BANT ATLANDI (yavaş makine): steady X ms >|≤ bant Y ms`.
  Mutlak tavanlar (içerik ≤256 · eski 4 modül ≤176 · müfredat ≤48 · runtime ≤128 · css ≤14 KiB · p95 ve steady p95 ≤40 ms)
  bayraktan önce ve bağımsız assert edilir. Bayraksız davranış aynı (göreli bant assert).
- `kao2-duzeltme/tools/kapilar.sh`: bayrak `=1` ise açıkça `export` edilir (kabul testi A-10 ve bütçe testi dahil tüm alt
  süreçlere geçer), değilse `unset` (bayraksız koşu eskisi gibi katı). Bayraklıda başlıkta mod satırı; perf satırı bütçe
  testinin satırını yazar ve bayrak verildiği hâlde satırda "GÖRELİ BANT ATLANDI (yavaş makine)" yoksa kapı kırmızı olur.

## TDD
Kırmızı (değişiklikten önceki kodla):
```
$ node docs/kuran-ogreniyorum/tools/kao-plan-check.mjs --self-test
FAIL self-test: D2F-03 commit KAO dosyasına dokunabilir
FAIL self-test: D2F-16 (üst sınır) tanınır
FAIL self-test: "K2F-38 ek:" başka hash'te reddedilir
FAIL self-test: "K2F-07 ek:" başka hash'te reddedilir
self-test 34/38
$ KAO2_ACCEPT_SLOW_HOST=1 node tests/kao/test_kao2_perf_budget.js
AssertionError [ERR_ASSERTION]: steady p95 9.779 ms exceeds baseline +25% (5.087625000000003 ms)
```
Yeşil (değişiklikten sonra):
```
$ node docs/kuran-ogreniyorum/tools/kao-plan-check.mjs --self-test   → self-test 38/38
$ node docs/kuran-ogreniyorum/tools/kao-plan-check.mjs              → INFO plan-check tabanı d19b457: 269 tarihsel commit taranmadı, 131 commit denetlendi · kao-plan-check: PASS (1 warn)
$ node tests/kao/test_kao2_perf_budget.js                           → AssertionError … steady p95 10.278 ms exceeds baseline +25% (bayraksız: değişmedi, EXIT 1)
$ KAO2_ACCEPT_SLOW_HOST=1 node tests/kao/test_kao2_perf_budget.js   → KAO2 perf: PASS (… · GÖRELİ BANT ATLANDI (yavaş makine): steady 10.311 ms > bant 6.360 ms) EXIT 0
```
Gerçek geçmişte 65e94db2 (`K2F-38 ek:`, app/kao.css) tek hash istisnasıyla geçer; plan-check PASS.

Mutasyon kanıtları (scratchpad kopyaları, çalışma ağacı değil):
- Perf: `tests/kao/test_kao2_perf_budget.js` + içerik/runtime/css/taban kopyası; kopya temiz bayraklı EXIT 0. Ardından
  ~40 KiB sıkışmaz rastgele hex içeren sahte `app/core/quranLearnZzSahte.js` eklendi → bayraklı koşu
  `AssertionError [ERR_ASSERTION]: runtime exceeds 128 KiB`, **EXIT 1**. (Bayrak mutlak tavanı gevşetmiyor.)
- Plan-check (a): kopyada `SUBJECT_EXCEPTIONS = {}` → `FAIL self-test: "K2F-38 ek:" 65e94db2 için kabul`, self-test 37/38, EXIT 1.
- Plan-check (b): kopyada D2F aralığı `D2F-\d+` yapıldı → `FAIL D2F-3 (tek hane) reddedilir` + `FAIL D2F-17 (aralık dışı) reddedilir`, 36/38.

## Kapılar
Koşu A — bayraksız (`bash kao2-duzeltme/tools/kapilar.sh`, başlangıç 2026-10-07T08:53:55Z), çıktı aynen:
```
== KAO2-FIX kapıları ==
node --check quranLearn.js         PASS
node --check quranLearnFlow.js     PASS
node --check quranLearnViews.js    PASS
node --check quranCurriculumV2.js  PASS
node --check quranGrammarV1.js     PASS
tests/kao (54)                     FAIL: test_kao2_kabul.js test_kao2_perf_budget.js
tests/app (77)                     PASS
tests/panel (23)                   PASS
tests/panel-v2 (27)                PASS
tests/quran (9)                    PASS
reminders smoke                    PASS
run-seyma driver                   PASS
run-seyma zikr                     PASS
kontrast                           PASS
l2-paket --check                   PASS
kao-plan-check                     PASS
fix-sync-check --repro             PASS
== tekrar-uret özeti ==
KAO2 denetim tekrar üretimi: 10/10 PASS · 0 FAIL
== perf ==
perf satırı okunamadı
SONUÇ: KIRMIZI KAPI VAR
EXIT=1
SÜRE 781 sn
```
Beklenen: bayraksız davranış değişmedi; tek kırmızı göreli p95 bandı (kabul A-10 + bütçe testi), D2F-01 tablosuyla aynı.

Koşu B — bayraklı (`KAO2_ACCEPT_SLOW_HOST=1 bash kao2-duzeltme/tools/kapilar.sh`, başlangıç 2026-10-07T09:06:56Z), çıktı aynen:
```
== KAO2-FIX kapıları ==
mod: YAVAŞ MAKİNE (KAO2_ACCEPT_SLOW_HOST=1) — yalnız göreli p95 bandı atlanır, mutlak tavanlar zorunlu
node --check quranLearn.js         PASS
node --check quranLearnFlow.js     PASS
node --check quranLearnViews.js    PASS
node --check quranCurriculumV2.js  PASS
node --check quranGrammarV1.js     PASS
tests/kao (54)                     PASS
tests/app (77)                     PASS
tests/panel (23)                   PASS
tests/panel-v2 (27)                PASS
tests/quran (9)                    PASS
reminders smoke                    PASS
run-seyma driver                   PASS
run-seyma zikr                     PASS
kontrast                           PASS
l2-paket --check                   PASS
kao-plan-check                     PASS
fix-sync-check --repro             PASS
== tekrar-uret özeti ==
KAO2 denetim tekrar üretimi: 10/10 PASS · 0 FAIL
== perf ==
KAO2 perf: PASS (content 184.194 KiB · runtime 117.280 KiB · css 13.027 KiB · p95 24.275 ms · steady 9.939 ms · GÖRELİ BANT ATLANDI (yavaş makine): steady 9.939 ms > bant 6.360 ms)
SONUÇ: TÜM KAPILAR YEŞİL
EXIT=0
SÜRE 811 sn
```
Diğer kapılar (koşulardan sonra):
```
$ node kao2-duzeltme/denetim-2/tekrar-uret-2.cjs   → KAO2-FIX denetim-2 tekrar üretimi: 0/9 PASS · 9 FAIL (D2F-01 ile aynı; azalmadı)
$ node kao2-duzeltme/denetim/tekrar-uret.cjs       → KAO2 denetim tekrar üretimi: 10/10 PASS · 0 FAIL
$ node kao2-duzeltme/denetim-2/tools/d2f-sync-check.mjs → D2F senkron: PASS · 2/16 prompt done · nextPrompt D2F-03 · ledger seq 2 · N 0/9 pass · App.kao* 45 · yüzey 766 · atama 604 · onclick 393 · pin 20261006e
```

## Ölçümler
| Ölçüm | Değer |
|---|---|
| plan-check self-test | 38/38 (önce 30 vaka; 34/38 kırmızı) |
| plan-check gerçek | PASS (1 warn), 131 commit denetlendi |
| perf (bayraklı, kapı B) | content 184,194 · runtime 117,280 · css 13,027 KiB · p95 24,275 ms · steady 9,939 ms (bant 6,360 ms → atlandı) |
| kapilar.sh bayraksız | çıkış 1, 781 sn |
| kapilar.sh bayraklı | çıkış 0, 811 sn, "SONUÇ: TÜM KAPILAR YEŞİL" |
| pinler | App.kao* 45 · yüzey 766 · atama 604 · onclick 393 · yayın 20261006e (değişmedi) |

## Bilerek değişen testler
- `kao-plan-check.test.mjs`: yalnız ekleme (8 vaka); var olan 30 vaka aynı.
- `test_kao2_perf_budget.js`: bayraksız → aynı (göreli bant assert). Bayraklı → eski: bayrak yok sayılır, göreli bant FAIL;
  yeni: yalnız göreli bant atlanır ve stdout'a yazılır · gerekçe: taban KAO2-01 makinesine bağlı (rapor §5, E-6); mutlak
  tavanlar zorunlu kalır (mutasyon kanıtı yukarıda).
- Plan-check davranışı: eski: her `K2F-NN ek:` konusu tanınır; yeni: yalnız 65e94db2 · gerekçe: D2-12.

## Kanıt düzeyleri
- **Kaynak/test:** bu oturumda koşuldu — yukarıdaki tüm komutlar.
- **Yayın:** yok (pin/sw değişmedi; yayın yalnız Prompt 15).
- **Cihaz:** yok; bu prompt yalnız araçlara dokunur.

## Sürprizler
- Dal D2F-01'in gerisindeydi (yukarıda, ff-only).
- Konteyner yine sığ klon geldi: plan-check `FAIL plan-check tabanı d19b4576… bulunamadı` → `git fetch --unshallow origin`.
- `rsync` yoktu; ilk kapı koşusu başlamıştı, `tests/app` (deploy_surface_contract) kırmızı olacağından durduruldu,
  `apt-get install -y rsync` sonrası iki koşu baştan yapıldı (yukarıdaki A/B tam koşulardır).
