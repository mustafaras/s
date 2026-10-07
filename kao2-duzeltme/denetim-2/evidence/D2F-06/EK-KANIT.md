# D2F-06 · EK · Ortam kırmızıları giderildi (kullanıcı yönergesi) · KANIT

Oturum: https://claude.ai/code/session_d0d6d6d9-c277-497f-98ea-e3c237d4db72
Tarih: 2026-10-07 · baseCommit `cbe0d604` · HEAD `79eca899` (D2F-06) · dal `d2f-05`.

> Bu bir **prompt değil**; `LEDGER` seq 10 `NOTE`'unun kanıt ekidir. D2F-05/D2F-06'da "ortam kırmızısı, kapsam dışı (§3)"
> denen iki kırmızı, kullanıcının açık yönergesiyle kapatıldı. `nextPrompt` ilerlemedi (D2F-07'de kalır).

## İlerleme günlüğü
1. D2F-06 kapısında iki kırmızı vardı: `tests/kao/test_kao2_kabul.js` A-4 ve `tests/app/test_settings_boundary.js`.
2. Kullanıcı: "failleri çözmen gerekiyor tam ve kusursu şekilde çözülmeli" → ikisi kök nedenden çözüldü.
3. İkisi de **test kusuru**; üretim davranışı doğruydu (kaoNightWindow yerel saat doğrudur; settings sınırının git mantığı doğruydu).

## Yapılan
### 1) `tests/kao/test_kao2_kabul.js` — A-4 `night-review`
- Kök neden: fikstür `now`'u `2026-09-30T23:30:00.000Z` sabitliyordu; `kaoNightWindow` (`app/core/quranLearn.js:423`)
  `now.getHours()` ile **YEREL** saati okur. `23:30Z` yalnız UTC konteynerinde 23:30'a denk gelir; bu makine (+03) → 02:30 → `until>90` → `daily`.
- Düzeltme: yerel duvar saati 23:30 kurulur — `{ now: new Date(2026, 8, 30, 23, 30, 0).toISOString() }`. Amaç (hedef yatış
  00:30'un 90 dk öncesi) tüm saat dilimlerinde korunur.
- Not: `nextStep`'te `night-review` kararı yalnız `night.active` + `due>0`'a bağlıdır, `dayKey(now)`'a değil
  (bkz. `app/core/quranLearnFlow.js` `nextStep`).

### 2) `tests/app/test_settings_boundary.js` — git baseline
- Kök neden: `git log --all --diff-filter=A -- app/core/settings.js` ajan ana makinesi kontrol-noktası kök commit'ini
  (`625eba07…`, yalnız `refs/agents/1eefe730-…/checkpoints/turn/*`; `main` atası **değil**, ebeveynsiz) seçiyordu →
  `git show 625eba07^:app.js` geçersiz → fixture çöküyordu.
- Düzeltme: `--all` kaldırıldı → yürüyüş yalnız HEAD ataları; MON-37 commit'i `32ad00af` bulunur, ebeveyni app.js taşır.
- Normal (UTC/ref'siz) klonda davranış değişmez: orada zaten tek ekleyici `32ad00af`'tır.

Üretim dosyası değişmedi; `?v=` pinleri, `sw.js`, `app.js`, `app/core/*` dokunulmadı. Yeni handler eklenmedi.

## TDD / kırmızı → yeşil
- Önce (değişiklikten önceki fikstürle): bu makinede A-4 `night-review`→`daily` FAIL; settings sınırı `git show 625eba07^` ile çökme.
- Sonra: ikisi de yeşil (aşağıdaki ölçümler).

## Kapılar
`KAO2_ACCEPT_SLOW_HOST=1 bash kao2-duzeltme/tools/kapilar.sh` (tam koşu, bu oturumda), çıktı aynen:
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
KAO2 perf: PASS (content 183.544 KiB · runtime 117.350 KiB · css 13.035 KiB · p95 6.059 ms · steady 3.181 ms · GÖRELİ BANT ATLANDI (yavaş makine): steady 3.181 ms ≤ bant 6.360 ms)
SONUÇ: TÜM KAPILAR YEŞİL
KAPILAR_EXIT=0
```
Ayrı koşular (bu oturumda):
- `node tests/app/test_settings_boundary.js` → **13/13 PASS**, çıkış 0 (öncesi çökme).
- `KAO2_ACCEPT_SLOW_HOST=1 node tests/kao/test_kao2_kabul.js` → **10/10 PASS, çıkış 0** (A-4 dâhil; A-9: 189/189 dosya çıkış 0).
- `node kao2-duzeltme/denetim-2/tekrar-uret-2.cjs` → **5/9 PASS** (N-01,02,03,08,09; D2F-05/06'da da 5/9 — azalmadı).
- `node kao2-duzeltme/denetim-2/tools/d2f-sync-check.mjs` → **PASS** (aşağıda).

## Ölçümler
- **Saat dilimi sondası** (6 saat dilimi; `$TMPDIR` geçici betik, commit edilmedi). Eski fikstür `night-review`'ı yalnız UTC'de
  verir; yeni fikstür altısında da:
```
UTC                localH=23  nightActive=true  kind=night-review
Asia/Tokyo         localH=23  nightActive=true  kind=night-review
America/New_York   localH=23  nightActive=true  kind=night-review
Pacific/Kiritimati localH=23  nightActive=true  kind=night-review
Etc/GMT+12         localH=23  nightActive=true  kind=night-review
Europe/Istanbul    localH=23  nightActive=true  kind=night-review
```
- **git baseline:** `git log --diff-filter=A -- app/core/settings.js` → tek satır `32ad00af… MON-37: extract settings domain registry`;
  `--all` ile ilk satır `625eba07… Agent host session … baseline checkpoint` (kök, ebeveynsiz).
- Mutasyon (scratchpad, geri alma → kırmızı): A-4 `now` eski sabit değere dönerse bu makinede `night-review`→`daily` FAIL;
  `--all` geri eklenirse `git show 625eba07^` geçersiz → settings sınırı çöker. İkisi de fikstürün nedeni izole ettiğini gösterir.
- `git diff --stat`: `tests/app/test_settings_boundary.js` (+4/−1) · `tests/kao/test_kao2_kabul.js` (+2/−1).

## Bilerek değişen testler
- A-4 `night-review` fikstürünün `now` değeri: `'2026-09-30T23:30:00.000Z'` → `new Date(2026, 8, 30, 23, 30, 0).toISOString()` ·
  gerekçe: yerel-duvar-saati niyeti; kontrol aynı (gece penceresi), yalnız saat diliminden bağımsızlandı. Başka kontrol gevşetilmedi.
- settings sınırı: yürüyüş kümesi `--all` → HEAD ataları · gerekçe: ajan ref kirliliği; normal klonda davranış aynı.

## Kanıt düzeyleri
- **kaynak/test:** yukarıdaki tüm koşular bu oturumda, bu makinede (yerel +03 — kırmızının çıktığı ortam).
- **yayın:** değişiklik yok; pin `20261007a` yalnız depodan okundu.
- **cihaz:** yok.

## Sürprizler
1. İki "kapsam dışı" kırmızı da **test kusuruydu**, ürün değil: A-4 saat dilimine bağımlıydı; settings sınırı `--all` ile ajan
   ref'ini kapıyordu. Program bunları "ortam kırmızısı" diye biriktiriyordu; oysa ikisi de kalıcı ve ortamdan bağımsız düzeltilebilirdi.
2. `test_settings_boundary.js`'in `--all`'ı, ajan ana makinesinin `refs/agents/**` kök commit'i eklendiğinde kırılıyor — bu tam da
   bu çalışma ortamının ürettiği bir kirlilik.
