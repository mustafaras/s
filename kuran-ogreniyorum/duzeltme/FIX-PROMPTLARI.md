# KAO-FIX · Sıralı düzeltme promptları

**Kaynak:** [`deliverables/KAO-UYGUNLUK-DENETIMI-20260926.md`](../deliverables/KAO-UYGUNLUK-DENETIMI-20260926.md) (1 KRİTİK · 4 YÜKSEK · 11 ORTA · 6 DÜŞÜK).
**Taban:** `main` @ `58e0ceb` (KAO kodu `7693528` ile aynı). **Dal:** `kao-duzeltme` (YEREL; push yok).
**Durum dosyası:** [`.anti-amnesia/CURRENT-STATE.md`](.anti-amnesia/CURRENT-STATE.md) · **Günlük:** [`.anti-amnesia/LEDGER.md`](.anti-amnesia/LEDGER.md) · **Bağlam kuralları:** [`BAGLAM-YONETIMI.md`](BAGLAM-YONETIMI.md).

Promptlar **yalnız sırayla** çalışır. Her prompt tek oturum, tek commit'tir. FIX-03 dört partidir; her parti ayrı oturum ve ayrı commit'tir.

---

## 0. Yeni oturuma yapıştırılacak metin

**Hazır, doldurulmuş 23 blok:** [`OTURUM-BASLATICI.md`](OTURUM-BASLATICI.md). Oradan sıradakini kopyala. Aşağıdaki genel şablon yalnız yedektir.

```text
/Users/m_ras/Desktop/seyma reposunda KAO düzeltme programının KAO-FIX-NN promptunu uygula.
Önce kuran-ogreniyorum/duzeltme/BAGLAM-YONETIMI.md'yi, sonra .anti-amnesia/CURRENT-STATE.md'yi oku;
CURRENT-STATE'teki "Sıradaki" KAO-FIX-NN değilse DUR ve bana söyle.
Sonra FIX-PROMPTLARI.md'den yalnız §1 ile "## KAO-FIX-NN" bölümünü oku (awk ile) ve yalnız o promptu uygula.
Push, merge, tag, deploy ve mustafaras/seyma-data'ya yazma yetkin yok. Bu mesaj yalnız KAO-FIX-NN için yetkidir.
```

---

## 1. Ortak sözleşme (her prompt bunu miras alır; prompt gövdesinde tekrar edilmez)

### Ö0 · Başlangıç (her oturum)
```sh
cd /Users/m_ras/Desktop/seyma
git -c core.fsmonitor=false status --short --branch | head -15
git -c core.fsmonitor=false log -1 --format='%h %s'
sed -n '1,30p' kuran-ogreniyorum/duzeltme/.anti-amnesia/CURRENT-STATE.md
tail -5 kuran-ogreniyorum/duzeltme/.anti-amnesia/LEDGER.md
```
- Dal `kao-duzeltme` değilse (FIX-00 hariç) **dur**.
- Çalışma ağacında senin olmayan kirli dosyalar varsa **dokunma, stash'leme, geri alma**. Yalnız kendi izinli dosyalarını commit'le. Kirli dosya izinli listende ise dur ve sor.
- CURRENT-STATE'te `Aktif:` doluysa önceki prompt yarım kalmıştır. `kanit/KAO-FIX-xx.md`'yi oku, önce onu tamamla.

### Ö1 · Değişmezler (ihlal = commit iptal)
| | Kural |
|---|---|
| V1 | CLAUDE.md **DATA SAFETY** aynen geçerli. Uygulamayı tarayıcıda açma/sunma; yalnız headless node:vm. |
| V2 | Push / merge / tag / deploy / `mustafaras/seyma-data` yazma **yok**. Sır isteme. |
| V3 | **Arapça hafızadan yazılmaz.** Arapça yalnız QAC/Tanzil girdisinden ve `tools/*` çıktısından gelir. Türkçe anlamı ajan yazabilir (D-12), ama `lexicon.reference.json` (quran.com) metnini **asla birebir kopyalamaz**. |
| V4 | Üretilmiş içerik modülleri (`app/content/quran{Lexicon,Grammar,ShortSurahs,Phonics}V1.js`) **elle düzenlenmez**; yalnız araçla yeniden üretilir. |
| V5 | Yeni `App.kao*` handler **ekleme**. Yeni handler fx2/v3/surface pinlerini kaydırır (App 756, onclick 393, v3 556, surface 594). Prompt açıkça isterse ekle ve pinleri gerekçeyle güncelle. |
| V6 | Yorumda `App.kao…=` ya da tıklama niteliği adı (`on` + `click=`) **yazma**: fx2 düz metin taraması yorumları da sayar. |
| V7 | `app.js`'e prompt izin vermedikçe dokunma. Kabuk bütçesi 7.800 satır; şu an 7.798. |
| V8 | Kapalı programın kayıtları (`kuran-ogreniyorum/KAO-STATE.json`, `evidence/**`, eski `.anti-amnesia/**`, `deliverables/KAO-KAPANIS.md`) değiştirilmez. İstisna FIX-16: yalnız ek (addendum). |
| V9 | Tek kök `data.quranLearn`. `migrate()` davranışı yalnız `ensureQuranLearn` içinde değişir; kullanıcı verisi **silinmez** (yalnız budama kuralı, FIX-09). |
| V10 | Tahmin yok: bir API'yi ya da alanı kullanmadan önce `grep -n` ile kaynakta doğrula. |

### Ö2 · Yayın pini prosedürü (PIN-P)
`quranLearn.js`, `kao.css`, `quranLexiconV1.js`, `quranGrammarV1.js`, `quranShortSurahsV1.js` ya da `app.js` değişirse **aynı commit'te** pin yükseltilir. `quranPhonicsV1.js`'in ayrı pini var (`20260924b`); yalnız o dosya değişirse onu yükselt.
```sh
OLD=$(grep -o 'quranLearn.js?v=[0-9a-z]*' index.html | cut -d= -f2); echo "$OLD"
NEW=$(date +%Y%m%d)a   # aynı gün ikinci kez: b, c …; OLD ile aynı olamaz
grep -rlF "$OLD" index.html sw.js tests/app | tee "$TMPDIR/pinfiles.txt"   # beklenen 9 dosya
xargs sed -i '' "s/$OLD/$NEW/g" < "$TMPDIR/pinfiles.txt"
grep -c "$NEW" sw.js   # SW_VERSION ve SW_OFFLINE_VERSION 'iip22-<NEW>' ikisi de değişmeli
for f in tests/app/*.js; do node "$f" >/dev/null 2>&1 || echo "FAIL $f"; done; echo app-bitti
```

### Ö3 · Uygulama disiplini
1. Önce testi yaz ya da güncelle ve **kırmızı** olduğunu gör (komut + exit'i not et). Sonra kodu yaz, yeşile getir.
2. Her `.js/.mjs` değişikliğinden sonra `node --check <dosya>`.
3. Yalnız promptun **İzinli dosyalar** listesine yaz. Başka dosya gerekiyorsa dur, CURRENT-STATE'e `Engel:` yaz, kullanıcıya sor.

### Ö4 · Standart kontroller (promptta "STD" yazıyorsa hepsi exit 0)
```sh
for f in tests/kao/*.js; do node "$f" >/dev/null 2>&1 || echo "FAIL $f"; done; echo kao-bitti
node .claude/skills/run-seyma/driver.mjs > "$TMPDIR/d.log" 2>&1; echo "driver $?"
node .claude/skills/run-seyma/zikr-harness.mjs > "$TMPDIR/z.log" 2>&1; echo "zikr $?"; tail -1 "$TMPDIR/z.log"
node tests/app/test_state_rebind_boundary.js > /dev/null 2>&1; echo "rebind $?"
node tools/shell-inventory.mjs --gate 2>&1 | tail -1
node kuran-ogreniyorum/tools/kao-plan-check.mjs 2>&1 | tail -1
git -c core.fsmonitor=false diff --check && echo diffcheck-ok
```

### Ö5 · Kanıt, günlük, durum, commit
1. `kuran-ogreniyorum/duzeltme/kanit/KAO-FIX-NN.md` (≤40 satır): önce kırmızı test komutu + exit, sonra her kontrol komutu + exit + tek satır sonuç, değişen dosyalar, kalan risk.
2. `LEDGER.md`: tek satır ekle (seq +1).
3. `CURRENT-STATE.md`: prompt satırı `done`, `Sıradaki` bir sonraki, `Aktif: —`, gerekiyorsa yeni tuzak.
4. Tek commit. Konu `KAO-FIX-NN: <Türkçe kısa açıklama>`, gövdede bulgu kimliği (ör. `Bulgu: Y-2`). Dosyaları tek tek `git add <yol>` ile ekle.

### Ö6 · Durma koşulları
- Kapı ya da karar eksik.
- İzinli olmayan dosya gerekiyor.
- Arapça yazmak gerekiyor ama korpus/araç kaynağı yok.
- Kontrol kod dışı bir nedenle geçmiyor.
- Bağlam bütçesi aşılıyor (BAGLAM-YONETIMI §8).

Durunca CURRENT-STATE'e `Engel: …` yaz, ledger'a satır ekle, kullanıcıya tek soru sor. Durmak başarısızlık değildir.

### Ö7 · Rapor dili
Kanıt düzeylerini ayır: kaynak/test ≠ yayın ≠ cihaz kabulü. "Çalışıyor" yerine "fixture X PASS, cihazda doğrulanmadı" yaz.

---

## 2. Sıralı liste

| # | Prompt | Bulgu | Bağımlılık | Tür |
|---|---|---|---|---|
| 1 | KAO-FIX-00 · Başlangıç, dal, kararlar, taban ölçümü | — | — | kurulum |
| 2 | KAO-FIX-01 · Dondurma hattı onarımı + tekrar üretim testi | O-4 | 00 | araç |
| 3 | KAO-FIX-02 · Kısa sûre çeviri çalışma kitabı ve içe alma kapısı | K-1, Y-3 | 01 | araç |
| 4 | KAO-FIX-03/A…D · Kısa sûre Türkçe katmanı (4 parti) | K-1, Y-3 | 02 | içerik |
| 5 | KAO-FIX-04 · Kısa sûre dondurma: referanstan kopuş + atıf + pin | K-1, Y-3 | 03/D | içerik+yayın |
| 6 | KAO-FIX-05 · Başlık kelimesi biçimi (bağlam şeddesi) + DİA | Y-4, D-6 | 04 | içerik |
| 7 | KAO-FIX-06 · İki yönlü kelime kartı | Y-2 | 05 | kod |
| 8 | KAO-FIX-07 · "Bilinen kelime" ve kapsam tanımı | Y-1 | 06 | kod |
| 9 | KAO-FIX-08 · Çeldirici geçmişi (R-A2) | O-1 | 07 | kod |
| 10 | KAO-FIX-09 · `daily` budama ve durum bütçesi | O-2 | 08 | kod |
| 11 | KAO-FIX-10 · Kilometre taşları | O-3 | 09 | kod |
| 12 | KAO-FIX-11 · Test kör noktaları | O-5 | 10 | test |
| 13 | KAO-FIX-12 · Kaynaklar ve lisanslar bölümü (E7) | O-6 | 11 | kod |
| 14 | KAO-FIX-13 · Arapça yazı tipi yığını | O-9 | 12 | css |
| 15 | KAO-FIX-14 · Anlam komşuları sözlük kaynağına | O-7 | 13 | içerik+kod |
| 16 | KAO-FIX-15 · Kuyruk ve şema ince ayarları | D-2, D-5 | 14 | kod |
| 17 | KAO-FIX-16 · Plan ve belge hizası | O-8, D-1, D-3 | 15 | belge |
| 18 | KAO-FIX-17 · plan-check sertleştirme | O-11 | 16 | araç |
| 19 | KAO-FIX-18 · Sahipsiz plan maddeleri kararı | D-4 | 17 | belge |
| 20 | KAO-FIX-19 · Kapanış regresyonu ve yeniden denetim | hepsi | 18 | denetim |

---

## KAO-FIX-00 · Başlangıç, dal, kararlar, taban ölçümü

**Amaç:** Düzeltme dalını aç; denetim raporunu ve bu planı commit'le; kullanıcı kararlarını kaydet; taban test durumunu ölç.
**Oku:** Yalnız CURRENT-STATE "Kararlar" tablosu.
**İzinli dosyalar:** `kuran-ogreniyorum/deliverables/KAO-UYGUNLUK-DENETIMI-20260926.md` (yalnız commit, içerik değişmez), `kuran-ogreniyorum/duzeltme/**`, `CLAUDE.md` ve `AGENTS.md` (her birine tek satır).

**Adımlar:**
1. `git -c core.fsmonitor=false switch -c kao-duzeltme` (dal varsa `switch kao-duzeltme`). `main`'e dönme.
2. Kullanıcı bu oturumda CURRENT-STATE'teki KF-1…KF-9 kararlarından birini değiştirdiyse tabloya yaz (`Kaynak: kullanıcı, <tarih>`). Değiştirmediyse `Kaynak: varsayılan` olarak bırak. **Karar uydurma.**
3. Taban ölçümü. Yalnız sayı yaz:
   ```sh
   for d in kao app panel panel-v2 quran; do p=0; f=0; for t in tests/$d/*.js; do node "$t" >/dev/null 2>&1 && p=$((p+1)) || f=$((f+1)); done; echo "$d $p/$((p+f))"; done
   node kuran-ogreniyorum/duzeltme/araclar/kao-sim.js "$PWD" 120 0.9 2>&1 | grep -E '"(lemmasBothDirections|knownByPlanDefinition|knownByCode|codeCoveragePct|grammarMax|maxSameTypeRun)"'
   ```
4. `CLAUDE.md` ve `AGENTS.md`'de "Agent Routing" altındaki KAO maddesinin **hemen sonuna** tek satır ekle. İki dosya birebir aynı cümle:
   `- **KAO düzeltme programı (KAO-FIX)** — [`kuran-ogreniyorum/duzeltme/`](kuran-ogreniyorum/duzeltme/BAGLAM-YONETIMI.md): denetim bulgularının sıralı düzeltmesi; önce BAGLAM-YONETIMI.md, sonra .anti-amnesia/CURRENT-STATE.md. Dal kao-duzeltme, yerel.`
5. İki commit (bu promptta istisna):
   - `KAO-DENETIM: bağımsız uygunluk denetimi raporu` → yalnız rapor dosyası.
   - `KAO-FIX-00: düzeltme programı iskeleti, kararlar ve taban ölçümü` → geri kalanı.

**Kabul:**
- Dal `kao-duzeltme`.
- Taban sayıları CURRENT-STATE "Taban" bölümünde. Beklenen: kao 14/14, app 77/77, panel 23/23, panel-v2 27/27, quran 9/9, iki yönlü lemma 0.
- İki commit atıldı.

**Kontroller:** STD (Ö4) + `node --check kuran-ogreniyorum/duzeltme/araclar/*.js kuran-ogreniyorum/duzeltme/araclar/*.mjs`.

---

## KAO-FIX-01 · Dondurma hattı onarımı + tekrar üretim testi (O-4)

**Amaç:** `tools/kao-content-freeze.mjs`'in bayat SHA pinini düzelt. Dört içerik modülünün araçlarla bayt-bayt yeniden üretildiğini kalıcı bir testle koru.
**Bulgu:** Denetim O-4. `cf5e0d7` `lexicon.verified.json`'u değiştirdi; `tools/kao-content-freeze.mjs:19` hâlâ `cf65aa…` bekliyor, güncel dosya `16a159…`.
**Oku:**
- `sed -n '1,40p' tools/kao-content-freeze.mjs`
- `sed -n '225,240p' tools/kao-content-freeze.mjs`
- `grep -n "freeze\b\|--freeze'" tools/kao-lexicon-build.mjs | head`

**İzinli dosyalar:** `tools/kao-content-freeze.mjs`, `tests/kao/test_kao_freeze_repro.js` (yeni), `tests/kao/README.md`, `tests/FIXTURE-MAP.json` (yalnız `node tools/fixture-map-build.mjs --write` çıktısı), `kuran-ogreniyorum/duzeltme/**`.

**Adımlar:**
1. **Test (kırmızı):** `tests/kao/test_kao_freeze_repro.js`.
   - `kuran-ogreniyorum/content/inputs/` ya da `lexicon.reference.json` yoksa `console.log('SKIP: girdi yok')` + exit 0.
   - Varsa repoyu `$TMPDIR` altına `git archive HEAD` ile kopyalar, girdileri kopyaya kopyalar ve kopyada dört komutu çalıştırır: `node tools/kao-lexicon-build.mjs --freeze`, `node tools/kao-content-freeze.mjs --freeze-grammar|--freeze-surahs|--freeze-phonics`.
   - Dört modülü repodakiyle `Buffer.equals` karşılaştırır. Repoya asla yazmaz.
   - Kırmızı olduğunu gör: `--freeze-surahs` hash hatası.
2. `tools/kao-content-freeze.mjs:19`'daki `lexicon.verified.json` değerini `shasum -a 256 kuran-ogreniyorum/content/lexicon.verified.json` çıktısıyla değiştir. Diğer üç hash'i de aynı komutla doğrula; farklıysa onları da güncelle.
3. Hash uyuşmazlık hata metnine yol göster: `… (pini güncelle: shasum -a 256 kuran-ogreniyorum/content/<dosya>)`.
4. `tests/kao/README.md`'ye tek satır ekle. `node tools/fixture-map-build.mjs --write` çalıştır.

**Kabul:**
- Test girdilerle PASS ve dört modül bayt-eş.
- Girdi yokken SKIP ile exit 0.
- Repo içerik modülleri **değişmedi** (`git diff --stat app/content` boş).

**Kontroller:** STD + `node tests/kao/test_kao_freeze_repro.js`.
**Durma:** Pin düzeltildiği hâlde çıktı farklıysa dur. Bu, içeriğin araçla uyuşmadığı anlamına gelir; farkı (`cmp -l | head`) kanıta yaz, kullanıcıya sor.

---

## KAO-FIX-02 · Kısa sûre çeviri çalışma kitabı ve içe alma kapısı (K-1, Y-3 — araç kısmı)

**Amaç:** Kısa sûre, Fâtiha ve tamamlayıcı sözlük Türkçesinin quran.com referansından değil, doğrulanmış yerel bir dosyadan (`surahs.verified.json`) gelmesi için araç altyapısını kur. Bu promptta üretim modülü **değişmez**.
**Bulgu:** K-1 (`tools/kao-content-freeze.mjs:156,161,187` → `tr: translated.tr`), Y-3 (26 İngilizce anlam).
**Oku:**
- `sed -n '100,200p' tools/kao-content-freeze.mjs | cut -c1-220`
- `grep -n "copiedFromReference\|copy\|kopya" tools/kao-lexicon-build.mjs | head -20` — sözlükteki kopya bekçisi (06 §3). Aynı mantığı yeniden kullan.
- 06 §3 ve §3.1: `awk '/^## 3\./,/^## 4\./' kuran-ogreniyorum/06-ICERIK-URETIM-HATTI.md`

**İzinli dosyalar:** `tools/kao-content-freeze.mjs`, `tests/kao/test_kao_surah_import.js` (yeni), `tests/kao/README.md`, `tests/FIXTURE-MAP.json`, `kuran-ogreniyorum/content/surahs.review.md` (yeni, üretilmiş), `kuran-ogreniyorum/duzeltme/**`.

**Adımlar:**
1. **Test (kırmızı):** `tests/kao/test_kao_surah_import.js`. Aracın saf fonksiyonlarını (dışa aktarılan `validateSurahRow`) sentetik satırlarla sınar:
   - (a) `tr` boş → hata.
   - (b) `tr` normalize edilmiş hâliyle (küçük harf, noktalama/parantez atılmış, boşluk tek) referansla aynı → `copy` hatası.
   - (c) İngilizce işaret kelimesi (`the|their|his|those|which|they|them|of|and|will|shall|your|our|who|what|that`, tam kelime) → `language` hatası.
   - (d) `verifiedBy` boş ya da `verifiedAt` `YYYY-AA-GG` değil → hata.
   - (e) Geçerli satır → hata yok.
   - Aracın modül olarak içe aktarılabilmesi için CLI gövdesini `if (import.meta.url === pathToFileURL(process.argv[1]).href)` koruması altına al.
2. `--surah-workbook [--part A|B|C|D]` alt komutu → `kuran-ogreniyorum/content/surahs.review.md`.
   - Bölüm başlıkları: `## Parti A (95–98)`, `B (99–105)`, `C (106–114)`, `D (Fâtiha + tamamlayıcı sözlük)`.
   - Sütunlar: `id | ar | pronunciation | lemmaId | ref | referans-ipucu | tr | verifiedBy | verifiedAt`.
   - `id` biçimi: sûre kelimeleri `s-<sûre>-<âyet>-<i>`, Fâtiha `f-1-<âyet>-<i>`, tamamlayıcı `ls_…`.
   - `referans-ipucu` sütunu referansın ilk 24 karakteri artı `…` olsun. Doğrulayıcı bağlamı görür ama tam metni kopyalamaya davet edilmez.
   - Mevcut `surahs.verified.json` varsa onun `tr/verifiedBy/verifiedAt` değerleri korunur. Yeniden üretim doldurulmuş satırı silmez.
3. `--surah-import` alt komutu → `surahs.review.md`'yi okur, her satırı `validateSurahRow` ile denetler ve `kuran-ogreniyorum/content/surahs.verified.json` yazar.
   - Biçim: `{schemaVersion:1, importedAt, rows:{id:{tr,verifiedBy,verifiedAt}}, counts:{total, filled, copy, language, missing}}`.
   - Boş satır "missing" sayılır, hata değildir (partiler kademeli dolar).
   - `copy>0 || language>0` ise exit 1.
4. `--freeze-surahs` bu promptta **değişmez**. Referansla çalışmaya devam eder (FIX-04 değiştirecek).
5. Çalışma kitabını tüm partilerle üret: `node tools/kao-content-freeze.mjs --surah-workbook`. Satır sayısı 618 + 29 + 190 = **837** olmalı.

**Kabul:**
- Yeni test PASS.
- `surahs.review.md` 837 satır; `tr` sütunu boş.
- `--surah-import` → `filled=0, missing=837, copy=0, language=0`, exit 0.
- `git diff --stat app/content` boş.

**Kontroller:** STD + `node tests/kao/test_kao_surah_import.js` + `node tests/kao/test_kao_freeze_repro.js`.

---

## KAO-FIX-03 · Kısa sûre Türkçe katmanı — 4 parti (K-1, Y-3 — içerik kısmı)

**Bu prompt dört kez çalışır:** `KAO-FIX-03/A`, `/B`, `/C`, `/D`. Her parti ayrı oturum, ayrı commit. CURRENT-STATE hangi partinin sırada olduğunu söyler.

| Parti | Kapsam | Satır |
|---|---|---|
| A | Tîn, Alak, Kadr, Beyyine (95–98) | 230 |
| B | Zilzâl, Âdiyât, Kâria, Tekâsür, Asr, Hümeze, Fil (99–105) | 210 |
| C | Kureyş, Mâûn, Kevser, Kâfirûn, Nasr, Tebbet, İhlâs, Felak, Nâs (106–114) | 178 |
| D | Fâtiha kelimeleri (29) + tamamlayıcı sözlük lemma anlamları (190) | 219 |

**Amaç:** Partideki her satıra **kendi** kısa Türkçe karşılığını yaz, doğrula, içe al.
**Oku:** Yalnız `surahs.review.md`'nin o parti bölümü: `awk '/^## Parti A/,/^## Parti B/' kuran-ogreniyorum/content/surahs.review.md`. Başka dosya okuma.
**İzinli dosyalar:** `kuran-ogreniyorum/content/surahs.review.md`, `kuran-ogreniyorum/content/surahs.verified.json`, `kuran-ogreniyorum/duzeltme/**`.

**Çeviri kuralları (D-12, 06 §3.1; hepsi zorunlu):**
1. `tr` = kelimenin **o âyetteki** kısa Türkçe karşılığı, 1–5 kelime. Tamamlayıcı sözlükte (Parti D, `ls_…`) **lemmanın sözlük anlamı** yazılır, bağlam çekimi değil (ör. "incire andolsun" değil "incir").
2. Referans ipucunu **kopyalama**. Aynı anlamı kendi cümlenle yaz. Kapı normalize edilmiş birebir eşitliği reddeder.
3. Yalnız Türkçe. İngilizce kelime yok. Diyanet imlâsı (Allah, Rab, âyet, sûre).
4. Tefsir hükmü yok. Parantez yalnız aynı âyetin kesit dışı sözünü tamamlar: "(yemin olsun)" ✔, "(yani kıyamet)" ✘.
5. Ön ek ve edatlar kelimeye dâhil: `وَ` → "ve …", `بِـ` → "… ile" / "…-e", `لَـ` → "elbette …".
6. Arapça hücreye (`ar`, `pronunciation`) **dokunma**.
7. `verifiedBy` = ajan kimliği (ör. `claude-opus-5.5`). `verifiedAt` = bugünün tarihi (`YYYY-AA-GG`).

**Adımlar:**
1. Partinin satırlarını sûre sûre doldur. Bir sûre bitince hemen `node tools/kao-content-freeze.mjs --surah-import` çalıştır ve `copy`/`language` sayısını gör; 0 değilse o satırları düzelt.
2. Bağlam sınırı: parti bitmeden bütçe dolarsa bitmiş son sûrede dur. `CURRENT-STATE`'e `Aktif: KAO-FIX-03/A (98'e kadar kaldı)` yaz, commit'le ve oturumu kapat.
3. Parti sonunda ilk 5 satırı ve rastgele 5 satırı kanıt dosyasına **Türkçe sütunuyla** yaz (öz-denetim örneği).

**Kabul:**
- `--surah-import`: partideki satırlar `filled`, `copy=0`, `language=0`, exit 0.
- `git diff --stat` yalnız izinli dosyaları gösteriyor.

**Kontroller:** `node tools/kao-content-freeze.mjs --surah-import` + `node tests/kao/test_kao_surah_import.js` (STD gerekmez; üretim değişmedi).
**Commit:** `KAO-FIX-03/A: Tîn–Beyyine Türkçe kelime katmanı (230)` ve benzerleri.

---

## KAO-FIX-04 · Kısa sûre dondurma: referanstan kopuş + atıf + pin (K-1, Y-3)

**Amaç:** `--freeze-surahs` Türkçeyi yalnız `surahs.verified.json`'dan alsın. Üretim modülünü yeniden üret, pini yükselt, sızıntıyı kalıcı testle kapat.
**Ön koşul:** `node tools/kao-content-freeze.mjs --surah-import` → `filled=837, missing=0, copy=0, language=0`. Değilse dur.
**Oku:**
- `sed -n '136,200p' tools/kao-content-freeze.mjs | cut -c1-240`
- `grep -n "ATTRIBUTION\|METHODOLOGY_TR\|source:" tools/kao-content-freeze.mjs | head`

**İzinli dosyalar:** `tools/kao-content-freeze.mjs`, `app/content/quranShortSurahsV1.js` (yalnız araç çıktısı), `tests/kao/test_kao_lexicon_contract.js`, `tests/kao/test_kao_phonics_contract.js`, `tests/kao/test_kao_freeze_repro.js`, pin dosyaları (PIN-P), `kuran-ogreniyorum/duzeltme/**`.

**Adımlar:**
1. **Test (kırmızı):** `test_kao_lexicon_contract.js`'e kısa sûre bloğunu ekle. Şunları doğrular:
   - (a) `words`, `prayerTexts.*.words` ve `supplements` alanlarında İngilizce işaret kelimesi 0.
   - (b) Hiçbir `source` dizgisi `Quran.com` içermez.
   - (c) Kısa sûre `ATTRIBUTION.verification` alanı `surahs.verified.json` ve D-12'ye atıf yapar.
   Mevcut modülde kırmızı olduğunu gör.
2. `freezeSurahs()`:
   - `translated.tr` yerine `verified.rows[id].tr` kullan; satır yoksa `throw`.
   - `lexicon.reference.json` **yalnız** kopya kapısı için okunur: normalize eşitlik → `throw`.
   - `JSON_SHA256`'ya `surahs.verified.json` hash'ini ekle.
   - Tamamlayıcı `source` metni: `'QAC lemma + D-12 verified KAO Turkish layer (surahs.verified.json)'`.
   - Fâtiha dalı (satır ~184–187) da aynı kaynağa geçer.
3. `ATTRIBUTION`: Tanzil, QAC, Diyanet satırları kalır. `verification` alanı `'D-12 · kuran-ogreniyorum/content/surahs.verified.json (yerel çeviri; quran.com yalnız kopya-denetim referansı, dağıtılmaz)'` olur.
4. `node tools/kao-content-freeze.mjs --freeze-surahs` → modül yeniden üretilir. Boyut ≤90 KB (araç denetler).
5. PIN-P uygula.
6. `node kuran-ogreniyorum/duzeltme/araclar/kao-content-check.js "$PWD" 20260926 | head -12`: kısa sûre Tanzil 618/618.
7. İkinci yol doğrulaması: 618 kelimenin kaçının referansla birebir aynı olduğunu `node -e` ile say (denetimdeki yöntem, rapor §5.3.a). Beklenen **0**.

**Kabul:**
- Referansla birebir aynı kelime 0 (denetimde 618).
- İngilizce 0 (denetimde 26).
- Yeni test PASS.
- Freeze-repro PASS.
- App ailesi PASS (pin).

**Kontroller:** STD + tüm `tests/app` (pin) + `node tests/kao/test_kao_freeze_repro.js`.

---

## KAO-FIX-05 · Başlık kelimesi biçimi (bağlam şeddesi) + DİA (Y-4, D-6)

**Amaç:** QAC `lemmaBw` alanı bağlam şeddesini taşıyor (`r~aHiym`, `n~aAs`, `m~a$a`). Bu yüzden 26 başlık kelimesi yalıtık biçimde yanlış (`رَّحِيم`, `نَّاس`, `مَّشَ`), DİA okunuşu da yanlış (`rraḥīm`, `nnās`, `mmaşa`). Başlık üretimini kökten düzelt.
**Bulgu:** Y-4. Liste: rapor §2 Y-4 ya da `grep -n "^\*\*Y-4" -A8 kuran-ogreniyorum/deliverables/KAO-UYGUNLUK-DENETIMI-20260926.md`.
**Oku:**
- `sed -n '190,215p' tools/kao-lexicon-build.mjs | cut -c1-200` (`bwToArabic`)
- `grep -n "lemmaAr\|ar: bwToArabic\|dia\b\|translit" tools/kao-lexicon-build.mjs | head -20`
- Bağlam §4'teki "doğrulanmış sözlükte satır" kalıbıyla `l_m_a_a_fb0e46`.

**İzinli dosyalar:** `tools/kao-lexicon-build.mjs`, `tools/kao-content-freeze.mjs` (yalnız tamamlayıcı başlık + JSON_SHA256), `kuran-ogreniyorum/content/lexicon.verified.json`, `kuran-ogreniyorum/content/lexicon.review.md` (araç çıktısıysa), `app/content/quranLexiconV1.js` ve `app/content/quranShortSurahsV1.js` (yalnız araç çıktısı), `tests/kao/test_kao_lexicon_contract.js`, `tests/kao/test_kao_requirements.js` (DİA beklentileri değişirse), pin dosyaları, `kuran-ogreniyorum/duzeltme/**`.

**Adımlar:**
1. **Test (kırmızı):** Contract testine iki kural ekle; mevcut modülde kırmızı olduğunu gör.
   - Sözlük ve tamamlayıcı sözlükte hiçbir başlığın **ilk harf kümesinde** U+0651 (şedde) yok. İlk harf kümesi: ilk harf + hemen ardından gelen harekeler.
   - `translit.dia` ve `translit.tr` başında aynı ünsüzün tekrarı (`^(\p{L})\1`) yok.
2. Saf fonksiyon `headwordBw(lemmaBw)`: Buckwalter dizgisinde ilk ünsüzü izleyen `~`'yi kaldırır. `{` / `A` / `l` önekli belirlilik yapısına dokunmaz: `{ll~ah` **değişmez**, çünkü şedde ilk harfte değil. `bwToArabic(headwordBw(x))` başlıkta, `translit` üretiminde ve tamamlayıcı sözlükte kullanılır. Kural self-test'e (`--self-test`) 4 vaka olarak eklenir: `r~aHiym→raHiym`, `{ll~ah` aynı, `n~aAs→naAs`, `Hat~aY` aynı.
3. `مَّشَ` (`m~a$a`) vakası: şedde kaldırılınca `مَشَ` kalır ve son harf yine eksiktir.
   - Önce QAC'ta aynı kökün (`ROOT:m$y`) lemma biçimlerini say:
     ```sh
     grep 'ROOT:m\$y' kuran-ogreniyorum/content/inputs/quranic-corpus-morphology-0.4.txt | grep -o 'LEM:[^|]*' | sort | uniq -c
     ```
   - Korpus `m~a$aY` ya da `ma$aY` biçimini veriyorsa onu kullan (tek istisna eşlemesi, araçta sabit ve yorumlu).
   - Vermiyorsa: başlığı olduğu gibi bırak, `lexicon.verified.json` satırına `headwordNote:'QAC lemma biçimi kesik; sözlük biçimi korpusta yok'` ekle, **dur ve kullanıcıya sor**. Arapçayı hafızadan tamamlama (V3).
4. Etkilenen satırlarda (beklenen 26 + tamamlayıcı sözlükteki benzerleri) `ar` ve `translit` araçla yeniden üretilir. Bu satırların `verifiedAt` alanı bugüne çekilir (D-12 yeniden doğrulama: satırı gözle kontrol et, `tr1` anlamı değişmez).
5. D-6: `l_bad_ala_16265e` 2:181 örneğinde kelime/okunuş sayısı uyuşmazlığının nedenini `node -e` ile bul (hangi token birleşik ya da ayrık).
   - Araç kaynaklıysa düzelt.
   - Değilse kanıta "belgeli istisna" olarak yaz.
6. Yeniden üret, sonra FIX-01 hash'ini güncelle (lexicon.verified.json değişti):
   `node tools/kao-lexicon-build.mjs --import-md` (gerekiyorsa) → `--freeze` → `node tools/kao-content-freeze.mjs --freeze-surahs` → JSON_SHA256.
7. PIN-P.

**Kabul:**
- Şeddeli başlık 0 (denetimde 26).
- DİA'da çift ünsüzle başlayan okunuş 0.
- `ٱللَّه` değişmedi.
- Contract, requirements (DİA 524/524) ve freeze-repro PASS.
- Sözlük ≤340 KB.

**Kontroller:** STD + tüm `tests/app` + `node tools/kao-lexicon-build.mjs --self-test` + `node tests/kao/test_kao_freeze_repro.js`.

---

## KAO-FIX-06 · İki yönlü kelime kartı (Y-2)

**Amaç:** Her yeni lemma iki kart üretsin (`w:<id>:ar>tr` ve `w:<id>:tr>ar`). Ters yön en erken ertesi gün gelsin.
**Bulgu:** `app/core/quranLearn.js:766` `var direction=index%2?'tr>ar':'ar>tr';`. 365 günlük simülasyonda iki yönlü lemma 0/524.
**Oku:**
- `n=$(grep -n "function kaoCandidates(" app/core/quranLearn.js | cut -d: -f1); sed -n "${n},$((n+7))p" app/core/quranLearn.js | cut -c1-400`
- `sed -n '300,345p' app/core/quranLearn.js | cut -c1-260` (`kaoBuildQueue` yeni seçim + "R-A2 yön" bloğu)
- `sed -n '190,220p' tests/kao/test_kao_queue.js`

**İzinli dosyalar:** `app/core/quranLearn.js`, `tests/kao/test_kao_queue.js`, `tests/kao/test_kao_requirements.js`, pin dosyaları, `kuran-ogreniyorum/duzeltme/**`.

**Adımlar:**
1. **Test (kırmızı):** `test_kao_queue.js`'e kelime düzeyinde 120 günlük tarama ekle. Mevcut 365 günlük tarama kalıbını kopyala; `dailyNew:10`, her gün tüm görevler doğru. Doğrular:
   - (a) Kartı olan lemmaların ≥%95'inde iki yön var.
   - (b) Bir lemmanın `tr>ar` kartı, `ar>tr` kartının `introducedAt` gününden **önce** ya da aynı gün sunulmaz.
   - (c) Günlük yeni kart sayısı (iki yön dâhil) ≤ `dailyNew`.
2. Tasarım (kısa ve açık):
   - `kaoCandidates` her lemma için yalnız `ar>tr` adayı üretir.
   - `tr>ar` adayı yalnız `ar>tr` kartı var ve `introducedAt` en az 1 takvim günü önceyse (yerel `todayStr`) aday listesine eklenir.
   - Yeni kart bütçesi iki yön için **ortak**tır.
   - `kaoBuildQueue`'daki "hepsi tek yönde" takas bloğu (satır ~325–330) artık gereksizse kaldır, ilgili test beklentisini güncelle.
3. `introducedAt` alanının yeni kartta yazıldığını doğrula (`grep -n "introducedAt" app/core/quranLearn.js`). Yazılmıyorsa `kaoAnswer`'da ilk cevapta yaz.
4. Mevcut kullanıcı verisi: tek yönlü eski kartlar korunur. Eksik yön, yukarıdaki kural gereği ertesi günden itibaren yeni aday olur. Migration gerekmez.
5. PIN-P.
6. Simülasyon: `node kuran-ogreniyorum/duzeltme/araclar/kao-sim.js "$PWD" 365 0.9 | grep -E 'lemmasBothDirections|lemmasSeen|newMax|size' -A0`

**Kabul:**
- Simülasyonda `lemmasBothDirections / lemmasSeen ≥ 0.95`.
- `newMax ≤ 10`.
- Queue ve requirements PASS.
- `App.kao*` sayısı değişmedi.

**Kontroller:** STD + tüm `tests/app`.

---

## KAO-FIX-07 · "Bilinen kelime" ve kapsam tanımı (Y-1)

**Amaç:** 02 §3'e dön: bilinen lemma = **her iki yönde** `state==='review' && s>=21` (`orphan` ve `readerUnknown` hariç). E1, hub, E9, panel ve CSV bu tek tanımı kullanır.
**Bulgu:** `app/core/quranLearn.js:1252-1256` `kaoKnownLemmaSet` şu an `reps>0 || review` kullanıyor. Mutasyon M10'da üç test plan tanımına karşı düşüyordu (testler sapmayı sabitliyor).
**Oku:**
- `sed -n '1250,1262p' app/core/quranLearn.js | cut -c1-400`
- `grep -n "kaoKnownLemmaSet\|kaoKnownLemmas\|known\[" app/core/quranLearn.js | cut -c1-120`
- Testlerde düşen iddialar: `grep -n "knownWords\|coveragePercent\|kaoCoverage\|kelime tanıdık" tests/kao/*.js | cut -c1-160`

**İzinli dosyalar:** `app/core/quranLearn.js`, `tests/kao/test_kao_requirements.js`, `tests/kao/test_kao_render.js`, `tests/kao/test_kao_panel_projection.js`, `tests/kao/test_kao_user_tasks.js`, pin dosyaları, `kuran-ogreniyorum/duzeltme/**`.

**Adımlar:**
1. **Test (kırmızı):** `test_kao_requirements.js`'e tanım testi ekle.
   - Tek yönü review ∧ s=30 → bilinmiyor.
   - İki yönü review ∧ s=21 → biliniyor.
   - Bir yönü `learning` → bilinmiyor.
   - Tek yanlış cevap (`reps:1, state:'learning'`) → bilinmiyor.
   - `kaoCoverage` = Σfreq(bilinen)/77.430.
2. `kaoKnownLemmaSet`'i plan tanımıyla yeniden yaz. Tek bir yardımcı `isDurable(card)` = `(card.state==='review'||card.st==='review') && s>=21 && card.orphan!==true && card.readerUnknown!==true`. Aynı yardımcıyı E3 "kalıcı oldu" sayacı da kullanıyorsa ortakla (`grep -n ">=21" app/core/quranLearn.js`).
3. Sapmayı sabitleyen eski test iddialarını plan tanımına göre düzelt. Her değişikliği kanıt dosyasına "eski → yeni, gerekçe 02 §3" olarak yaz.
4. Hub kartı etiketi "N kelime tanıdık" → "N kelime kalıcı". Yalnız metin; handler değişmez.
5. PIN-P.
6. `node kuran-ogreniyorum/duzeltme/araclar/kao-ui-probe.js "$PWD" | tail -4`: panel `knownWords` artık review∧s≥21 iki yönlü lemma sayısına eşit.
7. `kao-sim.js "$PWD" 365 0.9`: `knownByCode === knownByPlanDefinition`.

**Kabul:**
- Simülasyonda `knownByCode === knownByPlanDefinition`.
- Yeni tanım testi PASS.
- `kao-mutate.mjs`'in M10'u artık "plan tanımı" olduğu için kopyada **testleri geçmeli**. `kuran-ogreniyorum/duzeltme/araclar/kao-mutate.mjs` içindeki M10'u "bilinen = reps>0 (eski sapma)" olacak şekilde ters çevir; beklenti YAKALANDI.

**Kontroller:** STD + tüm `tests/app` + `tests/panel` ailesi.
**Not (kullanıcıya):** Mevcut verisi olan kullanıcıda gösterilen kapsam yüzdesi **düşecek**. Veri kaybı değil, doğru ölçüm. Kanıta yaz, final özetinde söyle.

---

## KAO-FIX-08 · Çeldirici geçmişi (R-A2, O-1)

**Amaç:** "Aynı çeldirici aynı hedefte ardışık iki tekrarda gelmez" kuralını üretim yolunda etkin kıl.
**Bulgu:** `quranLearn.js:349-350` `card.lastDistractors` alanını okuyor ama bu alan hiç yazılmıyor. Test kuralı `previousDistractors` enjekte ederek geçiyor.
**Oku:**
- `sed -n '346,362p' app/core/quranLearn.js | cut -c1-300`
- `grep -n "kaoPickDistractors(" app/core/quranLearn.js | cut -c1-120`
- `n=$(grep -n "function kaoAnswer(" app/core/quranLearn.js | cut -d: -f1); sed -n "$((n+30)),$((n+40))p" app/core/quranLearn.js | cut -c1-220`

**İzinli dosyalar:** `app/core/quranLearn.js`, `tests/kao/test_kao_requirements.js`, pin dosyaları, `kuran-ogreniyorum/duzeltme/**`.

**Adımlar:**
1. **Test (kırmızı):** Enjeksiyonsuz test. Aynı hedef kartı (review, s≥21; havuzda ≥6 uygun kart) iki ardışık gün `kaoStart` → `kaoAnswer` akışıyla sun; iki günün çeldirici kümeleri kesişmesin. Mevcut kodla kırmızı olduğunu gör: havuz küçük tutulursa kesişim çıkar.
2. `kaoAnswer`: kelime görevinde cevap kaydedilirken `scheduled.lastDistractors = task.choices.filter(c=>!c.correct).map(c=>c.cardId)` (en çok 3).
3. `kaoPickDistractors` önce `card.lastDistractors`'ı dışlar. Havuz yetersizse sözlük yedeği (`kaoBuildTask` içindeki fallback) yine dışlamayı uygular.
4. Undo (`kaoUndo`) kartı önceki kopyadan geri yüklediği için alan da geri sarılır. Bit-bit testi zaten bunu kapsar; PASS olmalı.
5. PIN-P.

**Kabul:**
- Yeni test PASS.
- 1.000 oturumluk eski test PASS.
- Undo bit-bit PASS.

**Kontroller:** STD + tüm `tests/app`.

---

## KAO-FIX-09 · `daily` budama ve durum bütçesi (O-2)

**Amaç:** `data.quranLearn.daily` son 90 günü tutsun. Uzun dönem kalibrasyon ve gece toplamları kaybolmasın. 365 gün sonunda durum ≤100 KB.
**Bulgu:** Simülasyonda 90. gün 139,1 KB, 365. gün 241,2 KB.
**Oku:**
- `sed -n '1629,1690p' app/core/quranLearn.js | cut -c1-200` (`ensureQuranLearn`)
- `n=$(grep -n "function kaoStats(" app/core/quranLearn.js | cut -d: -f1); sed -n "${n},$((n+14))p" app/core/quranLearn.js | cut -c1-260`
- `grep -n "daily\[" app/core/quranLearn.js | cut -c1-120 | head`

**İzinli dosyalar:** `app/core/quranLearn.js`, `tests/kao/test_kao_migration.js`, `tests/kao/test_kao_requirements.js`, `tests/kao/test_kao_state_budget.js` (yeni), `tests/kao/README.md`, `tests/FIXTURE-MAP.json`, `panel/panelCoverageManifest.js` (yalnız streak hesabı `daily`'ye dayanıyorsa ve etkileniyorsa), pin dosyaları, `kuran-ogreniyorum/duzeltme/**`.

**Adımlar:**
1. **Test (kırmızı):**
   - `test_kao_state_budget.js`: `kao-sim.js` mantığını kısaltılmış biçimde kullan (400 gün, p=0.9, sahte saat; kopyalamak yerine `require` ile ortak kod yoksa kendi küçük döngünü yaz). Doğrular: `JSON.stringify(data.quranLearn).length ≤ 100*1024`, `Object.keys(daily).length ≤ 91`.
   - Migration testine ekle: 200 günlük `daily` + `ensureQuranLearn` → 90 gün kalır, `calibTotals` (bantlar dâhil) budanan günlerin toplamını taşır, ikinci çağrı bayt-eş (idempotent).
2. `ensureQuranLearn`: `todayStr` yoksa en yeni tarih referans alınır. 90 günden eski günleri `q.calibTotals = {pred,ok,n,bands[10],nightRev,nightFollow{n,ok},dayFollow{n,ok}}` içine **toplayarak** kaldır.
   - Referans gün: `quranLearnDeps.todayStr()` varsa o, yoksa en büyük tarih anahtarı. Sahte saatli testte deterministik olmalı.
3. `kaoStats`: 2/6 haftalık pencereler `daily`'den (≤42 gün) değişmeden hesaplanır. "Tüm zamanlar" toplamı `calibTotals + daily` olur.
4. Seri (`kaoStudyStreak`) 90 günden uzun seriyi kaybetmesin: `q.streak={last,count}` artımlı tutulsun ya da seri hesabı `calibTotals` yanında `streakBefore` alanı taşısın. **En basit doğru çözümü seç, kanıta gerekçesini yaz.**
5. PIN-P. `kao-sim.js "$PWD" 365 0.9 | grep -A12 '"size"'`: 365. gün ≤100 KB.

**Kabul:**
- Bütçe testi PASS.
- Migration idempotent.
- Stats penceresi ve panel `streakDays` eski davranışla aynı (mevcut testler PASS).

**Kontroller:** STD + tüm `tests/app` + `tests/panel` ailesi.

---

## KAO-FIX-10 · Kilometre taşları (O-3)

**Amaç:** 03 §10'daki 6 taşın 5'i (`fatiha, namaz, half, twoThirds, eighty`) hiç kazanılmıyor. Koşullarını uygula, E1 ve hub'da son taşı göster.
**Koşullar (03 §10; FIX-07 tanımıyla):**

| Taş | Koşul |
|---|---|
| `fatiha` | Ünite 1 lemmalarının tümü `ar>tr` yönünde review ∧ s≥7 |
| `namaz` | Ünite 1–3 lemmalarının tümü `ar>tr` review ∧ s≥7 |
| `half` | kapsam ≥0,50 |
| `twoThirds` | kapsam ≥0,68 |
| `eighty` | kapsam ≥0,80 |
| `shortSurahs` | mevcut kod korunur |

**Oku:**
- `sed -n '418,424p;886,895p' app/core/quranLearn.js | cut -c1-240`
- `n=$(grep -n "function kaoUnits(" app/core/quranLearn.js | cut -d: -f1); sed -n "${n},$((n+10))p" app/core/quranLearn.js | cut -c1-260`

**İzinli dosyalar:** `app/core/quranLearn.js`, `tests/kao/test_kao_requirements.js`, `tests/kao/test_kao_render.js`, pin dosyaları, `kuran-ogreniyorum/duzeltme/**`.

**Adımlar:**
1. **Test (kırmızı):** Sentetik kartlarla her taş eşiğin bir altında `null`, eşikte ISO tarih. Taş bir kez kazanılınca geri alınmaz (kapsam düşse de).
2. Saf fonksiyon `kaoMilestoneCheck(d, nowIso)` → yeni kazanılan anahtarlar. `kaoAnswer` sonunda ve `kaoMarkUnderstood` sonunda çağrılır. Ünite üyeliği `kaoUnits()` dilimleriyle aynı kaynaktan gelir (tekrar tanımlama).
3. Yeni taş kazanılınca `ui.kaoFeedback` tek cümle ("Fâtiha'yı anlıyorum ✦"). Konfeti yok (FIX-18 kararı). `SeyFx` çağrısı yok.
4. E1 ve hub son taşı zaten `kaoMilestoneLabel` ile gösteriyor; değişmez.
5. PIN-P. `kao-sim.js "$PWD" 365 0.9 | grep -A7 milestones`: en az `fatiha` ve `half` dolu.

**Kabul:**
- Testler PASS.
- Simülasyonda taşlar doluyor.
- Undo ile taş geri sarılmıyor. Bu bilinçli bir karar: taş bir kez kazanılır; bunu testte belgele.

**Kontroller:** STD + tüm `tests/app`.

---

## KAO-FIX-11 · Test kör noktaları (O-5)

**Amaç:** Mutasyonda kaçan davranışları kalıcı testle koru. Yalnız test yazılır; üretim kodu **değişmez**. Test kırmızıysa bu gerçek bir hatadır: dur, kanıta yaz, kullanıcıya sor.
**Oku:**
- `sed -n '40,50p' tests/kao/test_kao_queue.js`
- `grep -n "kaoUndo\|bit-bit" tests/kao/test_kao_requirements.js | head`

**İzinli dosyalar:** `tests/kao/test_kao_queue.js`, `tests/kao/test_kao_requirements.js`, `kuran-ogreniyorum/duzeltme/araclar/kao-mutate.mjs`, `kuran-ogreniyorum/duzeltme/**`.

**Adımlar:**
1. Günlük yeni sınırı: 40 yeni aday, `dailyNew` ∈ {5,10,15} → kuyruktaki `isNew` sayısı tam olarak `dailyNew` (5/10/15).
2. Undo `errors`: `errorClass` taşıyan yanlış cevap → `errors[cls]` +1 → `kaoUndo()` → `errors` bit-bit eski.
3. Oturum içi tekrar (02 §2.10): yanlış cevaplanan görev kuyruğun sonuna `:retry` ile **bir kez** eklenir. Retry de yanlışsa ikinci kez eklenmez.
4. `kao-mutate.mjs`'i güncel koda uyarla: hedef dizgiler değiştiyse `from` alanlarını güncelle. Kopyada çalıştır:
   ```sh
   D="$TMPDIR/kao-mut-$(date +%s)"; mkdir -p "$D"; git archive HEAD | tar -x -C "$D"
   node kuran-ogreniyorum/duzeltme/araclar/kao-mutate.mjs "$D"
   ```
   Beklenti: **15/15 YAKALANDI** (M04 ve M09 dâhil; M10 FIX-07'de ters çevrildi).

**Kabul:**
- Üç yeni test PASS.
- Mutasyon 15/15.

**Kontroller:** Yalnız `for f in tests/kao/*.js …` ailesi + mutasyon.

---

## KAO-FIX-12 · Kaynaklar ve lisanslar bölümü (E7) (O-6)

**Amaç:** Dağıtılan uygulamada içerik ve ses kaynaklarının atfı görünür olsun (CC BY-NC 4.0 atıf yükümlülüğü).
**Oku:**
- `n=$(grep -n "function kaoSettingsHTML(" app/core/quranLearn.js | cut -d: -f1); sed -n "${n},$((n+12))p" app/core/quranLearn.js | cut -c1-240`
- Kaynak listesi: `node -e 'const m=require("./kuran-ogreniyorum/content/audio-manifest.json");console.log(JSON.stringify(m.datasets.map(d=>({id:d.id,license:d.license,attribution:d.attribution,url:d.url}))))'`

**İzinli dosyalar:** `app/core/quranLearn.js`, `app/kao.css`, `tests/kao/test_kao_render.js`, `tests/kao/test_kao_privacy.js` (yalnız "dış bağlantı ağ çağrısı değildir" beklentisi gerekiyorsa), pin dosyaları, `kuran-ogreniyorum/duzeltme/**`.

**Adımlar:**
1. **Test (kırmızı):** E7 HTML'inde `<section class="kao-sources">` var ve şu adları içerir: `Tadabur`, `CC BY-NC 4.0`, `AQQD`, `CC0`, `Tanzil`, `CC BY 3.0`, `Quranic Arabic Corpus`, `Diyanet`, `ts-fsrs`, `MIT`. Bağlantılar `rel="noopener"` ve `target="_blank"` taşır. **Yeni `App.` handler yok.**
2. Bölüm statik HTML'dir: bağlantılar düz `<a>`, onclick yok. Metinler içerik modüllerinin `ATTRIBUTION` alanından **okunur** (tekrar yazılmaz). Ses satırı için `quranLearn.js`'e manifestten türetilmiş küçük bir sabit ekle: `KAO_AUDIO_SOURCES`, 2 kayıt. Kaynağını yorumda belirt.
3. Stil yalnız mevcut tokenlarla (`--quran*`, `--f-*`).
4. PIN-P.

**Kabul:**
- Render testi PASS.
- fx2 ve v3 pinleri **değişmedi** (tüm `tests/app` PASS, sayılar aynı).

**Kontroller:** STD + tüm `tests/app` + `node kuran-ogreniyorum/tools/kao-verify-contrast.mjs | tail -1`.

---

## KAO-FIX-13 · Arapça yazı tipi yığını (O-9)

**Amaç:** Görev, okuyucu ve kelime ekranlarındaki Arapça, planın yığınıyla çizilsin: `"Noto Naskh Arabic","Amiri","Scheherazade New","Times New Roman",serif`.
**Bulgu:** `app/kao.css:23` `.kao-arabic-text{font-family:serif}`. Yığın yalnız `.kao-ph-letter>span`'de var.
**Oku:**
- `grep -o '[^}]*font-family:[^;}]*' app/kao.css`
- `grep -o '\[lang="ar"\][^{]*{[^}]*}' app/kao.css`

**İzinli dosyalar:** `app/kao.css`, `tests/kao/test_kao_render.js`, `kuran-ogreniyorum/tools/kao-verify-contrast.mjs` (yalnız okunuyorsa değişmez), pin dosyaları, `kuran-ogreniyorum/duzeltme/**`.

**Adımlar:**
1. **Test (kırmızı):** `kao.css` metnini okuyan kontrol. `.kao-arabic-text` ve `[lang="ar"]` kurallarının font-family'si `Noto Naskh Arabic` ile başlar. `font-family:serif` tek başına Arapça seçicide yok.
2. Tek bir kural yeterli: `.kao-arabic-text,[lang="ar"]` seçicisine yığını ver. `.kao-ph-letter>span` tekrarını kaldır ya da bırak (davranış aynı). `:root` ekleme. Yeni renk yok.
3. `letter-spacing` Arapça seçicilere uygulanmıyor olmalı: `grep -o '[^}]*letter-spacing[^}]*' app/kao.css`. Arapça seçiciye uygulanıyorsa kaldır.
4. PIN-P. Kontrast yeniden: `node kuran-ogreniyorum/tools/kao-verify-contrast.mjs | tail -1` → 0 eşik altı.

**Kabul:**
- Test PASS.
- Kontrast PASS.
- Cihaz doğrulaması **bekliyor** (kanıta ve CURRENT-STATE "Cihaz kabulü" listesine ekle).

**Kontroller:** STD + tüm `tests/app`.

---

## KAO-FIX-14 · Anlam komşuları sözlük kaynağına (R-A5, O-7)

**Amaç:** R-A5 komşuluğu `quranLearn.js:40-65`'teki elle yazılmış 12 kümeden değil, doğrulanmış sözlüğün `semNeighbors` alanından gelsin.
**Bulgu:** Sözlük modülünde `semNeighbors` 0 kayıt; `lexicon.verified.json`'da alan var ama `proposed:true` (D1 bulgusu).
**Oku:**
- `node -e 'const v=JSON.parse(require("fs").readFileSync("kuran-ogreniyorum/content/lexicon.verified.json","utf8"));const x=v.lemmas.filter(l=>l.semNeighbors&&(l.semNeighbors.length||l.semNeighbors.items));console.log(x.length,JSON.stringify(x[0].semNeighbors).slice(0,300))'`
- `sed -n '40,66p;255,300p' app/core/quranLearn.js | cut -c1-200`
- `grep -n "semNeighbors\|proposed" tools/kao-lexicon-build.mjs | head -20`

**İzinli dosyalar:** `tools/kao-lexicon-build.mjs`, `tools/kao-content-freeze.mjs` (yalnız JSON_SHA256), `kuran-ogreniyorum/content/lexicon.verified.json`, `kuran-ogreniyorum/content/lexicon.review.md` (araç çıktısıysa), `app/content/quranLexiconV1.js` (araç çıktısı), `app/core/quranLearn.js`, `tests/kao/test_kao_requirements.js`, `tests/kao/test_kao_lexicon_contract.js`, pin dosyaları, `kuran-ogreniyorum/duzeltme/**`.

**Adımlar:**
1. **Test (kırmızı):**
   - Contract: sözlük modülünde `semNeighbors` alanı olan lemma ≥ 79 (bugünkü elle küme kapsamı) ve her komşu kimliği sözlükte var.
   - Requirements: R-A5 1.000 oturum testi, `KAO_SEMANTIC_CLUSTERS` kaldırılmış kodla geçer.
2. D-12 doğrulaması: `proposed:true` komşu önerilerini doğrula.
   - Kural: anlamca aynı alan (ör. iman/küfür) ve öğrenmede karışma riski.
   - Doğrulanan satırda `semNeighbors.proposed=false`, `semNeighbors.verifiedAt`.
   - Kapsam en az bugünkü 12 kümenin 79 lemması. Fazlası isteğe bağlı; bağlam bütçesini aşma.
3. `--freeze` yalnız `proposed:false` komşuları kısa biçimde (`semNeighbors:['id',…]`) modüle yazar. Boyut ≤340 KB.
4. `quranLearn.js`: `KAO_SEMANTIC_CLUSTERS` ve ona bağlı kod kaldırılır. `semanticInfo` komşuları `QuranLexiconV1.byId(id).semNeighbors` alanından okur. Katalog seçeneği (`opts.catalog.semNeighbors`) test için korunur.
5. JSON_SHA256 güncellemesi, freeze-repro, PIN-P.

**Kabul:**
- `grep -c KAO_SEMANTIC_CLUSTERS app/core/quranLearn.js` = 0.
- Testler PASS.
- Sözlük ≤340 KB.
- Freeze-repro PASS.

**Kontroller:** STD + tüm `tests/app` + `node tests/kao/test_kao_freeze_repro.js`.

---

## KAO-FIX-15 · Kuyruk ve şema ince ayarları (D-2, D-5)

**Amaç:** Karar tablosundaki KF-3/KF-9 uygulanır ve küçük sapmalar kapatılır. Her madde ayrı test alır.
**Oku:**
- `sed -n '330,340p' app/core/quranLearn.js | cut -c1-240`
- `grep -n "fade&&readability\|kao-fade" app/core/quranLearn.js | cut -c1-160`
- `grep -n "errorClass" app/core/quranLearn.js | cut -c1-160`

**İzinli dosyalar:** `app/core/quranLearn.js`, `tests/kao/test_kao_queue.js`, `tests/kao/test_kao_requirements.js`, `tests/kao/test_kao_render.js`, pin dosyaları, `kuran-ogreniyorum/duzeltme/**`.

**Adımlar (her biri: kırmızı test → kod → yeşil):**
1. **KF-9 serpiştirme:** Ardışık aynı tür ≤2 kuralı gramere de uygulanır (`quranLearn.js:336`'daki `item.type!=='grammar'` muafiyeti kalkar).
   - Test: 1.000 oturumda en uzun aynı-tür dizisi ≤2.
   - Kuyruk tıkanırsa (yalnız gramer kaldıysa) döngü `break` eder, oturum kısalır. Bu kabul edilir; testte belgele.
2. **KF-3 gramer üst sınırı:** Varsayılan: **kod 4 kalır**, plan FIX-16'da 4'e güncellenir. KF-3 kullanıcı kararıyla "3" ise sabit 3 olur ve `test_kao_queue` "dört tür" beklentisi "oturum başına ≤3, dört tür birkaç oturumda" olarak değişir.
3. **R-B5 / 02 §5.3 soldurma:** Hareke soldurma yalnız `state==='review' && s>=30` olan kartlarda. Şu an `!task.isNew`. Task nesnesine `durable30` bayrağı ekle.
   - Test: learning kartında `.kao-fade` yok, review s≥30'da var.
4. **Kognat hata sınıfı:** Kelime görevinde yanlış cevap ve hedefte `cognate.shift` doluysa `errorClass:'cognate'`.
   - Test: `errors.cognate` +1.
5. `errors.sound` kelime görevlerinde artmaz; telaffuz hataları `phonics.misheard`'e gider. Bu bilinçli bir karar: kanıta yaz, kod değişmez.
6. Kısa kart anahtarları (05 §2 `st/n/l`): **uygulanmaz**. Göç riski sync bütçesinden büyük. FIX-16'da belgeye işlenir.
7. PIN-P.

**Kabul:**
- Dört yeni test PASS.
- `kao-sim.js 365` → `maxSameTypeRun ≤ 2`, `grammarMax` KF-3'e uygun.

**Kontroller:** STD + tüm `tests/app`.

---

## KAO-FIX-16 · Plan ve belge hizası (O-8, D-1, D-3)

**Amaç:** Plan belgeleri ile gerçeği uzlaştır. Kapalı programın kayıtlarını **değiştirmeden**, ek (addendum) ile düzelt. Kod yok.
**Oku:** Yalnız değiştirilecek satırlar (`grep -n` ile bul):
- 05 §1 tablo (`grep -n "≤ 260 KB\|≤ 800 satır\|≤ 18 KB" kuran-ogreniyorum/05-VERI-MODELI-VE-TEKNIK.md`)
- 06 §5 (`grep -n "410 KB" kuran-ogreniyorum/06-ICERIK-URETIM-HATTI.md`)
- 02 §2.4 (`grep -n "12–16 görev" kuran-ogreniyorum/02-PEDAGOJI.md`)
- 05 §5 (`grep -n "FSRS-4.5" kuran-ogreniyorum/05-VERI-MODELI-VE-TEKNIK.md`)
- `sed -n '1,12p;95,113p' kuran-ogreniyorum/README.md`

**İzinli dosyalar:** `kuran-ogreniyorum/02-PEDAGOJI.md`, `05-VERI-MODELI-VE-TEKNIK.md`, `06-ICERIK-URETIM-HATTI.md`, `README.md` (hepsi `kuran-ogreniyorum/` altında), `kuran-ogreniyorum/deliverables/KAO-KAPANIS-EK-1.md` (yeni), `kuran-ogreniyorum/duzeltme/**`.

**Adımlar:**
1. **05 §1 bütçeler:** Ölçülen değer ve karar (KF-2) ile güncelle. Örnek satır:
   `≤ 340 KB (KAO-15 kararı, 2026-09-25; ölçülen <bugünkü bayt>)`.
   `quranLearn.js` ve `kao.css` için KF-2'deki tavanı yaz. Bölme kararı çıktıysa "sonraki program" notu ekle.
2. **06 §5:** "Üç dosya ≤410 KB / gzip ~120 KB" satırını R-C5 ile uzlaştır: dört modül, ham tavan KF-2, gzip = kullanıcı kararı (KAPANIŞ §6.1).
3. **02 §2.4:** "12–16 görev tipik hedeftir; bağlayıcı sınırlar 05 §6'dadır (due ≤60, yeni ≤dailyNew, gramer ≤KF-3, parça ≤2)" notu. KF-4.
4. **05 §5:** "FSRS-4.5 parametre vektörü (19)" → "ts-fsrs v4.5.2 varsayılan parametreleri (FSRS-5, 19 sayı)".
5. **05 §2:** Kısa anahtar notu (FIX-15 madde 6) ve `daily` budama + `calibTotals` (FIX-09).
6. **README.md (kuran-ogreniyorum):** İlk 12 satırdaki "Üretim kodu 0/0 … henüz hiçbir kart açılmadı" ve sondaki "Şu an ne hazır, ne bekliyor" bölümünü güncel duruma çevir: program kapandı, düzeltme programı `duzeltme/`. Ayrıntı yerine bağlantı ver.
7. **`KAO-KAPANIS-EK-1.md`** (yeni, ≤80 satır):
   - Denetim özeti ve bağlantı.
   - Hangi FIX kartı hangi bulguyu kapattı (CURRENT-STATE tablosundan).
   - D-3 kararı (KF-5).
   - Yayın kaydı: `7693528` 2026-09-26 15:03'te `origin/main`'e push edildi. Kaynak: `git reflog show origin/main`; bu komutu çalıştırıp çıktıyı yaz.
   - KAPANIŞ §1 "yayın bekliyor" ifadesinin bu ekle geçersiz kılındığı.
   - Eski KAPANIŞ, LEDGER ve STATE **dokunulmaz** (V8).

**Kabul:**
- `grep -c "0/0" kuran-ogreniyorum/README.md` = 0.
- Belgelerdeki sayılar ölçülen değerlerle aynı.
- Kırık bağlantı 0: `grep -o '](\([^)]*\))' … ` ile göreli yolları `ls` et.

**Kontroller:** `node kuran-ogreniyorum/tools/kao-plan-check.mjs | tail -1` (yalnız belge; STD gerekmez).

---

## KAO-FIX-17 · plan-check sertleştirme (O-11)

**Amaç:** `kao-plan-check.mjs` KAO dosyalarına dokunan **her** commit'i görsün (konu önekinden bağımsız). KAO-FIX commit'lerini tanısın.
**Bulgu:** Denetim O-11: `a9fa40c` ve `ecc7ac7` KAO dosyalarını değiştirdi ama plan-check yalnız `^KAO-\d+` konularını tarıyor (`kao-plan-check.mjs:124`).
**Oku:**
- `sed -n '110,150p' kuran-ogreniyorum/tools/kao-plan-check.mjs | cut -c1-220`
- `grep -n "selfTest\|case(" kuran-ogreniyorum/tools/kao-plan-check.test.mjs | head`

**İzinli dosyalar:** `kuran-ogreniyorum/tools/kao-plan-check.mjs`, `kuran-ogreniyorum/tools/kao-plan-check.test.mjs`, `kuran-ogreniyorum/duzeltme/**`.

**Adımlar:**
1. **Öz-test (kırmızı), 3 yeni vaka:**
   - (a) Taban sonrası `fix(ui): …` konulu bir commit `app/core/quranLearn.js`'e dokunuyor → FAIL.
   - (b) `KAO-FIX-05: …` commit'i `app/content/quranLexiconV1.js`'e dokunuyor → PASS.
   - (c) Taban öncesi (≤ `58e0ceb`) KAO dışı commit → yalnız WARN.
2. KAO dosya kümesi: `app/core/quranLearn.js`, `app/kao.css`, `app/content/quran{Lexicon,Grammar,ShortSurahs,Phonics}V1.js`, `tools/kao-*.mjs`, `tests/kao/**`, `assets/kao/**`.
   - Taban (`58e0ceb`) sonrası bu kümeye dokunan commit'in konusu şu öneklerden biri olmalı: `KAO-\d+b?:`, `KAO-FIX-\d+(/[A-D])?:`, `KAO-DENETIM:`, `chore(kao)`. Değilse FAIL.
   - Taban öncesi için WARN listesi basılır (a9fa40c, ecc7ac7 görünür).
3. Kart başına commit sayısı raporu (`--commits` bayrağı, yalnız bilgi).
4. Dalga kapısı durumları: `auditStatus` değerleri `pass|fail|findings` kabul edilir. `findings` için STATE'te `auditFindingsAccepted[<D>]` gerekçesi zorunlu, yoksa WARN. Eski STATE'e yazma yok (V8); yalnız okuma.

**Kabul:**
- Öz-test 19/19 (16 + 3).
- `node kuran-ogreniyorum/tools/kao-plan-check.mjs` PASS; taban öncesi 2 WARN listelenir.

**Kontroller:** `node kuran-ogreniyorum/tools/kao-plan-check.test.mjs | tail -1` + `node kuran-ogreniyorum/tools/kao-plan-check.mjs | tail -3`.

---

## KAO-FIX-18 · Sahipsiz plan maddeleri kararı (D-4)

**Amaç:** Hiçbir karta ya da R-id'ye bağlanmamış plan maddelerine açık karar yaz. Varsayılan KF-6: **"sonraki program"**; kod yok.
**Maddeler:**
- 02 §5.3 → FIX-15'te yapıldı; işaretle.
- 02 §5.6 "bağ kur" görevi.
- 02 §5.7 hata taksonomisi → kuyruk ağırlığı + "en çok karıştırdıkların" satırı.
- 02 §5.8 niyet önerisi.
- 02 §5.10 haftalık aktarım testi.
- 04 §4 FX (haptik, doğru-cevap sesi, `countUp`, konfeti, `.sey-enter`).
- 10 §9 kova B/C algı doğruluğu raporu.

**İzinli dosyalar:** `kuran-ogreniyorum/02-PEDAGOJI.md`, `04-DENEYIM-VE-TASARIM.md`, `10-TELAFFUZ.md` (yalnız ilgili maddenin sonuna tek satır "Durum: …"), `kuran-ogreniyorum/duzeltme/**`.

**Adımlar:**
1. Her maddeye tek satır ekle: `> **Durum (KAO-FIX-18, <tarih>):** Uygulanmadı — sonraki program (KF-6). Gerekçe: <tek cümle>.`
   KF-6 kullanıcı kararıyla "şimdi uygula" ise bu promptta **kod yazma**. CURRENT-STATE'e yeni prompt taslağı ekle (FIX-18a…) ve dur.
2. CURRENT-STATE "Sonraki program adayları" listesine maddeleri ekle.

**Kabul:** 7 maddenin 7'sinde durum satırı var.
**Kontroller:** Yok (belge). `git diff --stat` yalnız izinli dosyalar.

---

## KAO-FIX-19 · Kapanış regresyonu ve yeniden denetim

**Amaç:** Bütün düzeltmelerin birlikte çalıştığını denetim yöntemiyle yeniden ölç. Denetim raporuna "sonrası" eki yaz. **Kod değişmez.** Kırmızı çıkan her şey yeni bir FIX promptu olarak CURRENT-STATE'e eklenir.
**İzinli dosyalar:** `kuran-ogreniyorum/deliverables/KAO-UYGUNLUK-DENETIMI-20260926.md` (yalnız sona "§8 Düzeltme sonrası" eki), `kuran-ogreniyorum/duzeltme/**`.

**Adımlar (her komutun yalnız özet satırı kanıta):**
1. Aileler:
   ```sh
   for d in kao app panel panel-v2 quran; do p=0; f=0; for t in tests/$d/*.js; do node "$t" >/dev/null 2>&1 && p=$((p+1)) || f=$((f+1)); done; echo "$d $p/$((p+f))"; done
   node tests/reminders/run-reminder-smoke.mjs 2>&1 | tail -1
   ```
2. STD (Ö4) ve `node kuran-ogreniyorum/tools/kao-verify-contrast.mjs | tail -1`.
3. `node tests/kao/test_kao_user_tasks.js --report | tail -25`: gzip sayısını not et (KF-2 / R-C5b).
4. `node kuran-ogreniyorum/duzeltme/araclar/kao-sim.js "$PWD" 365 0.9`. Beklenti:
   - `lemmasBothDirections/lemmasSeen ≥0.95`
   - `knownByCode === knownByPlanDefinition`
   - `maxSameTypeRun ≤2`
   - 365. gün ≤100 KB
   - taşlar dolu
5. `node kuran-ogreniyorum/duzeltme/araclar/kao-content-check.js "$PWD" 20260926 | head -14`. Beklenti:
   - Örnek Tanzil 1.563/1.563
   - Kısa sûre 618/618
   - Ayrıca `node -e` ile: şeddeli başlık 0, İngilizce 0, referansla birebir 0.
6. `node kuran-ogreniyorum/duzeltme/araclar/kao-ui-probe.js "$PWD" | tail -12`: 15 görünüm sorunsuz, snapshot sızıntı yok.
7. Mutasyon (kopyada): 15/15 YAKALANDI.
8. `node tests/kao/test_kao_freeze_repro.js`: 4 modül bayt-eş.
9. Rapor eki "§8 Düzeltme sonrası": bulgu → durum (kapandı/açık/kullanıcı kararı), yeni matris dağılımı, kalan cihaz kabulü listesi (O-9 yazı tipi, R-C9b, DOC04-§4f).
10. CURRENT-STATE: `Durum: completed` (açık bulgu yoksa), `Sıradaki: —`. Yayın kararı kullanıcıda.

**Kabul:**
- K-1 ve Y-1…Y-4 kapandı.
- ORTA bulgular kapandı ya da gerekçeli karar.
- Bütün aileler PASS.
- Kanıt düzeyleri ayrı yazılı; cihaz kabulü "bekliyor".

**Commit:** `KAO-FIX-19: düzeltme programı kapanış regresyonu ve yeniden denetim`.
