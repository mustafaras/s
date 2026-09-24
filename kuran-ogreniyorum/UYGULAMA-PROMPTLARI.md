# Kur'an Arapçası Öğreniyorum — Uygulama Promptları (KAO-P00 … KAO-D6)

> **Tek dosya, sıralı, atlanamaz.** Her prompt bağımsız bir ajan tarafından soğuk başlangıçtan uygulanabilir.
> **Plan:** [README](README.md) · **Durum (üretilmiş):** [.anti-amnesia/CURRENT-STATE.md](.anti-amnesia/CURRENT-STATE.md) · **Kayıt:** [.anti-amnesia/LEDGER.md](.anti-amnesia/LEDGER.md) · **Makine kaynağı:** [KAO-STATE.json](KAO-STATE.json) · **Denetleyici:** `tools/kao-plan-check.mjs`
>
> Bu dosyadaki izinli dosya listeleri ve kontroller **KAO-STATE.json'dan üretilmiştir**; iki kaynak ayrışırsa STATE geçerlidir ve `kao-plan-check` FAIL verir.

---

## 0. Ajan için ilk 60 saniye

Bu dosyayı açan her ajan, **hangi promptu çalıştıracağını seçmeden önce** şunu yapar (CWD `/Users/m_ras/Desktop/seyma`):

```bash
git -c core.fsmonitor=false status --short --branch
git -c core.fsmonitor=false log -1 --format='%H%n%s'
node kuran-ogreniyorum/tools/kao-plan-check.mjs --render     # PASS olmalı; CURRENT-STATE.md tazelenir
sed -n '1,12p' kuran-ogreniyorum/.anti-amnesia/CURRENT-STATE.md
```

- `blockedPrompt` doluysa **dur**. Engel kullanıcı tarafından çözülmeden ilerlenmez.
- `activePrompt` doluysa o prompt yarım kalmıştır: `git status` ile çalışma ağacını incele, önce o kartın `evidence/KAO-xx/HANDOFF.md`'sini oku; ya tamamla ya (kullanıcı onayıyla) geri al. **Bir sonrakine atlama.**
- Aksi hâlde çalıştırılacak prompt = CURRENT-STATE'teki **Sıradaki**. `node kuran-ogreniyorum/tools/kao-plan-check.mjs --card KAO-xx` ile izinli dosya/kontrol/bağımlılık özetini al. **Sıra atlanmaz.**
- Repoda başka ajanlar (IIP programı) eş zamanlı çalışır: `git status`'ta senin olmayan dirty dosyalar görürsen **dokunma, stash'leme, geri alma**; yalnız kendi kartının dosyalarını commit'le.

---

## 1. Ortak sözleşme (her prompt bunu miras alır)

Aşağıdaki adımlar her promptta geçerlidir; prompt gövdelerinde tekrar edilmez.

### S0 · Ön koşul
`KAO-STATE.json` → `lastCompletedPrompt` bu promptun bir öncekine eşit olmalı (`promptOrder`); değilse dur ve bildir. Kartın `deps` listesindeki her kart `done` olmalı. Kart `gate` taşıyorsa `gateApproval{by,at,source}` STATE'te kayıtlı olmalı; yoksa kart `blocked` yapılır ve oturum biter (bu bir başarısızlık değil, kapıdır).

### S1 · Değişmezler (ihlali commit'i iptal ettirir)
| | Kural |
|---|---|
| K1 | **Bağımsızlık** — [11](11-BAGIMSIZLIK-SOZLESMESI.md): KAO yalnız kendi dosyalarına yazar; `archive/ilham-ibadet-premium-plan/**`'a asla; `saygi.js`'e yalnız KAO-21'de ≤3 satır |
| K2 | **Tek `data` kökü** — yalnız `data.quranLearn`; başka köke yazma yok; `migrate()` yalnız `ensureQuranLearn` çağrısı |
| K3 | **App yüzeyi** — `App.kao*` handler + `ui.kao*`; `addEventListener` ile yeni bağlama yok; overlay şablonu + `App.onModalKeydown` |
| K4 | **Ağ** — `quranLearn.js`'te `fetch` yalnız `assets/kao/`; `localStorage`/`SeySync`/token erişimi yok; mikrofon kaydı bellek-içi |
| K5 | **İçerik doğruluğu** — Arapça hafızadan yazılmaz; yalnız derleme aracı çıktısı; `verified:false` üretim paketine giremez |
| K6 | **Dört liste** — yeni `app/core|content` dosyası aynı commit'te `index.html`, `driver.mjs`, `zikr-harness.mjs`, `test_state_rebind_boundary.js`'e |
| K7 | **Tasarım** — yeni renk markası yok; `--quran*`/`--faith*`/`--f-*`/`--dur-*` tüketilir; `app/kao.css`'te `:root` tanımı yok |
| K8 | **Veri güvenliği** — CLAUDE.md DATA SAFETY; tarayıcıda açma; gerçek token/kişisel veri yok; `seyma-data` yazma yok |
| K9 | **Yayın** — commit yerel branch `kuran-ogreniyorum`'a; push/merge/tag/deploy bu promptlarla yetkili **değildir** |
| K10 | **fx2 tuzağı** — yorum satırında `App.kao…=` ya da tıklama niteliği adı yazma; pin değişirse fixture'daki sayıyı gerekçesiyle güncelle |

### S2 · Okuma disiplini
Yalnız promptun **Oku** listesi + `--card` çıktısı + varsa önceki kartın `HANDOFF.md`. Tüm planı, tüm STATE'i, tüm ledger'ı yükleme. Üretim fonksiyonlarını `rg`/Grep ile bul, dar aralık oku (CLAUDE.md 'Working in the huge files').

### S3 · Başlangıç kaydı
STATE: `activePrompt='KAO-xx'`, `cards['KAO-xx'].status='active'`, `startedAt`, `agent`. Ledger'a 'başladı' satırı (seq +1). `kao-plan-check` PASS.

### S4 · Uygulama
Yalnız izinli dosyalar (`--card` çıktısı). Her dosya değişikliğinden sonra `node --check`. Yeni fixture önce yazılır (kırmızı), sonra gövde (yeşil). Tahmin yok: emin olmadığın API'yi kaynaktan doğrula (`SeyAudio.voice`, `SeyFx.sheetClose` vb. gerçek adlar).

### S5 · Kontroller
Promptun **Kontroller** listesinin tamamı; uzun logları `evidence/KAO-xx/logs/` altına yaz, bağlama yalnız komut + exit + tek satır sonuç. Kapılı uygulama kapıları (driver/zikr/rebind/shell-inventory) listede varsa hepsi exit 0.

### S6 · Kanıt
`evidence/KAO-xx/EVIDENCE.json` ([şablon](templates/EVIDENCE.template.json)): gerçek `head`, `diffHash` (`git diff HEAD~1 HEAD | shasum -a 256`), her kontrol komut+exit, R-id durumları. `HANDOFF.md` ([şablon](templates/HANDOFF.template.md)). Kendisi kanıt olmayan şablon dolu bırakılmaz.

### S7 · Commit
Tek commit; konu **`KAO-xx: <Türkçe kısa açıklama>`** (denetleyici bu ön ekle kapsam kontrolü yapar). Yalnız izinli dosyalar staged; başkalarının dirty dosyaları staged **edilmez** (`git add <yol>` tek tek). Commit mesajı sonunda `Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>`.

### S8 · Kapanış kaydı
STATE: `cards['KAO-xx'].status='done'` (ya da `implemented`/`waiting_user`/`blocked` — gerçek durum), `requirements.status[R-..]` güncelle, `lastCompletedPrompt='KAO-xx'`, `activePrompt=null`. Ledger 'bitti' satırı (kanıt sütununda EVIDENCE yolu + HEAD). `node kuran-ogreniyorum/tools/kao-plan-check.mjs --render` PASS; `git diff --check`. STATE/ledger/CURRENT-STATE **aynı commit'te** (her kartın izinli listesinde zaten var). Ayrı bir düzeltme gerekirse konu `chore(kao): …` olur ve **yalnız** `KAO-STATE.json` + `.anti-amnesia/**` + `evidence/**` dokunabilir; denetleyici bunu da zorlar.

### S9 · Durma koşulları
Kapı onayı yok · bağımlılık done değil · izinli olmayan dosyaya ihtiyaç · içerik için Arapça yazmak gerekiyor (→ derleme aracı/insan) · kontrol geçmiyor ve nedeni kod dışı (→ `blocked`, ledger, kullanıcıya soru). Durmak başarısızlık değildir; yanlış ilerlemek başarısızlıktır.

### S10 · Raporlama dili
Kanıt düzeylerini ayır (CLAUDE.md kural 7): kaynak/test kanıtı ≠ cihaz kabulü. 'Çalışıyor' yerine 'fixture X PASS, cihazda doğrulanmadı'.

---

## 2. Sıralı çalışma listesi


1. **KAO-P00** — Başlangıç: branch, iskelet, denetleyici doğrulaması
2. **KAO-01** — Sözlük derleme aracı (ağsız)
3. **KAO-25** — Plan denetleyici (kao-plan-check) sertleştirme
4. **KAO-02** — Aday liste, kognat/komşu önerisi, inceleme tablosu
5. **KAO-03** — Yapay zekâ doğrulaması ve içe alma (D-12)
6. **KAO-04** — Gramer içeriği (24 mikro-kavram + G0.5)
7. **KAO-23** — Fonetik içeriği + mahreç SVG
8. **KAO-24** — Ses varlık hattı (alt küme + AAC)
9. **KAO-05** — quranLexiconV1.js dondurma + 4 yükleme listesi
10. **KAO-06** — quranGrammarV1 + quranShortSurahsV1 + quranPhonicsV1 (+prayerTexts)
11. **KAO-07** — Registry iskeleti + ensureQuranLearn + migrate kancası
12. **KAO-08** — FSRS saf JS portu
13. **KAO-09** — Kuyruk, görev üretici, çeldirici, gece tekrarı
14. **KAO-10** — Overlay kabuğu + E1 Home + geçici Ayarlar girişi
15. **KAO-11** — E2 oturum çekirdeği: anlam seç / Arapça seç, ses düğmesi, geri al
16. **KAO-12** — E2 gramer görevleri
17. **KAO-13** — E2 parça görevleri + E3 Done + kalibrasyon kaydı
18. **KAO-14** — E4 Üniteler + E5 Kelime (üç dokunuş, kök ağacı, bayrak)
19. **KAO-15** — Seviye 0 kapısı (harf–ses–hareke) + renkli hareke
20. **KAO-16** — E6 Okuyucu (20 kısa sûre) + vakıf noktaları + gecikmeli test kaydı
21. **KAO-17** — E7 Ayarlar + ses stili + soldurma + CSV
22. **KAO-26** — E8 Telaffuz stüdyosu
23. **KAO-27** — Gölgeleme (bellek-içi kayıt)
24. **KAO-28** — E9 Anlayabildiğin âyet
25. **KAO-28b** — E10 Mushaf ısı haritası + gecikmeli sûre testi
26. **KAO-16b** — E11 Namazda ne diyorum
27. **KAO-18** — Kontrast ve erişilebilirlik ölçümü
28. **KAO-19** — Panel aynası (manifest + özet projeksiyon)
29. **KAO-20** — Tam regresyon + kullanıcı görevleri + kalibrasyon raporu
30. **KAO-21** — Hub kartı bileşimi + köprüler (IIP koordineli)
31. **KAO-22** — Kapanış belgesi
32. **KAO-D1** — Dalga 1 denetimi — içerik altyapısı
33. **KAO-D2** — Dalga 2 denetimi — donmuş modüller ve çekirdek
34. **KAO-D3** — Dalga 3 denetimi — arayüz
35. **KAO-D4** — Dalga 4 denetimi — kalite
36. **KAO-D5** — Dalga 5 denetimi — hub entegrasyonu
37. **KAO-D6** — Dalga 6 denetimi — kapanış ve devir

---

## 3. Prompt gövdeleri

## KAO-P00 — Başlangıç: branch, iskelet, denetleyici doğrulaması

**Not:** Bu prompt bir kart değildir; izinli dosyaları STATE `bootstrap.files`'tan gelir ve `KAO-P00:` commit'leri de kapsam denetimine tabidir.

**Yeni oturuma yapıştır:**
```text
/Users/m_ras/Desktop/seyma reposunda kuran-ogreniyorum/UYGULAMA-PROMPTLARI.md ortak sözleşmesine (§0–§1) göre yalnız KAO-P00 promptunu uygula. Önce §0 komutlarını ve `node kuran-ogreniyorum/tools/kao-plan-check.mjs --card KAO-P00` çıktısını oku; tüm planı yükleme. Bu mesaj KAO-P00 için uygulama yetkisidir; yetkiyi tekrar sorma. Push/merge/tag/deploy yetkisi değildir.
```


**Amaç:** Programı sıfırdan başlatmak: yerel branch, `tests/kao/` iskeleti, `evidence/` düzeni; hiçbir üretim dosyasına dokunmadan denetleyicinin PASS verdiğini kanıtlamak.

**Oku (yalnız bunlar; yollar `kuran-ogreniyorum/` göreli, repo dosyaları kökten):**
- README.md (tamamı)
- 11-BAGIMSIZLIK-SOZLESMESI.md §1
- 12-EK-GEREKSINIMLER.md (yalnız tablo başlıkları ve R-id listesi)
- CLAUDE.md 'DATA SAFETY' bölümü (repo kökü)

**İzinli dosyalar (STATE ile birebir):**
- `tests/kao/README.md`
- `kuran-ogreniyorum/content/.gitignore`
- `kuran-ogreniyorum/evidence/KAO-P00/**`
- `kuran-ogreniyorum/KAO-STATE.json`
- `kuran-ogreniyorum/.anti-amnesia/**`

**Adımlar:**
1. `git -c core.fsmonitor=false checkout -b kuran-ogreniyorum` (varsa checkout). `main`'e dönme, merge etme.
2. `tests/kao/README.md` oluştur (fixture'lar ortak `tests/repo-root.js`'i `require('../repo-root')` ile kullanır; ayrı kopya yok): aile amacı + 13 fixture adı (05 §8) 'planlandı' durumuyla.
3. `kuran-ogreniyorum/content/.gitignore`: `inputs/` (QAC/Tanzil ham dosyaları repo'ya girmez).
4. `node kuran-ogreniyorum/tools/kao-plan-check.mjs --self-test` ve `--render` çalıştır; CURRENT-STATE.md üretildi.
5. STATE: `activePrompt='KAO-P00'` → iş bitince `lastCompletedPrompt='KAO-P00'`, `activePrompt=null`, `status='in_progress'`.

**Kontroller (hepsi exit 0; STATE ile birebir):**
- `node --check <değişen her .js/.mjs>`
- `node kuran-ogreniyorum/tools/kao-plan-check.mjs`
- `git -c core.fsmonitor=false diff --check`
- `node kuran-ogreniyorum/tools/kao-plan-check.mjs --self-test (11/11)`
- `node tests/quran/test_quran_catalog.js (kök çözümleme kalıbının hâlâ geçtiğini gösterir — değişiklik yok)`

**Bitti sayılır:** Branch var, iskelet var, plan-check PASS, ledger satırı var. Üretim dosyası diff'i **sıfır** (`git diff --stat main -- app app.js index.html sync.js` boş).

**Kanıt:** `evidence/KAO-P00/EVIDENCE.json` + `HANDOFF.md` (S6); commit konusu `KAO-P00: …` (S7); STATE/ledger (S8).

---

## KAO-01 — Sözlük derleme aracı (ağsız)

**Yeni oturuma yapıştır:**
```text
/Users/m_ras/Desktop/seyma reposunda kuran-ogreniyorum/UYGULAMA-PROMPTLARI.md ortak sözleşmesine (§0–§1) göre yalnız KAO-01 promptunu uygula. Önce §0 komutlarını ve `node kuran-ogreniyorum/tools/kao-plan-check.mjs --card KAO-01` çıktısını oku; tüm planı yükleme. Bu mesaj KAO-01 için uygulama yetkisidir; yetkiyi tekrar sorma. Push/merge/tag/deploy yetkisi değildir.
```

**Dalga:** 1 · **Bağımlılık:** — · **Gereksinimler:** —

**Amaç:** QAC v0.4 morfoloji + Tanzil Uthmani metnini **yerel dosyadan** okuyan, lemma sıklığı/kök/POS/örnek pencere çıkaran, ağsız derleme aracını yazmak.

**Oku (yalnız bunlar; yollar `kuran-ogreniyorum/` göreli, repo dosyaları kökten):**
- 06-ICERIK-URETIM-HATTI.md §1, §4
- 01-ARASTIRMA.md §1, §7
- 05-VERI-MODELI-VE-TEKNIK.md §1 (quranLexiconV1 alanları)
- `app/content/quranRevelationOrderV1.js` ilk 40 satır (frozen içerik modülü kalıbı: METHODOLOGY/ATTRIBUTION sabitleri)

**İzinli dosyalar (STATE ile birebir):**
- `tools/kao-lexicon-build.mjs`
- `kuran-ogreniyorum/content/README.md`
- `kuran-ogreniyorum/content/.gitignore`
- `kuran-ogreniyorum/evidence/KAO-01/**`
- `kuran-ogreniyorum/KAO-STATE.json`
- `kuran-ogreniyorum/.anti-amnesia/CURRENT-STATE.md`
- `kuran-ogreniyorum/.anti-amnesia/LEDGER.md`

**Adımlar:**
1. `tools/kao-lexicon-build.mjs` (ESM, sıfır bağımlılık). Alt komutlar: `--self-test` (gömülü 50 satırlık sentetik mini korpusla), `--inputs <dir>` (girdi: `quranic-corpus-morphology-0.4.txt`, `quran-uthmani.txt`; yoksa **exit 2** + hangi dosyanın nereden indirileceği + beklenen sha256).
2. Çıktı (bu kartta yalnız `--stats`): `kuran-ogreniyorum/evidence/KAO-01/stats.json` — token toplamı (77.430 olmalı), lemma sayısı, kök sayısı, ilk 25 lemma (01 §1 tablosuyla karşılaştır, fark varsa raporla).
3. Buckwalter → Arapça dönüşüm tablosu araç içinde; **Arapça dizgi elle yazılmaz**, tablo üzerinden üretilir.
4. `kuran-ogreniyorum/content/README.md`: girdi dosyaları, indirme adresi, sha256, lisans notu (D-01/D-02 taslak), aracın kullanımı.
5. Ağ yok: araçta `fetch`/`http`/`https` import'u **olmaz** (kendi self-test'i bunu tarar).

**Kontroller (hepsi exit 0; STATE ile birebir):**
- `node --check <değişen her .js/.mjs>`
- `node kuran-ogreniyorum/tools/kao-plan-check.mjs`
- `git -c core.fsmonitor=false diff --check`
- `node tools/kao-lexicon-build.mjs --self-test`
- `node tools/kao-lexicon-build.mjs --inputs kuran-ogreniyorum/content/inputs (girdi yoksa exit 2 ve açık mesaj)`

**Bitti sayılır:** Araç self-test PASS; girdi varsa stats.json 77.430 token gösterir, yoksa exit 2 kanıtı; README hazır.

**Kanıt:** `evidence/KAO-01/EVIDENCE.json` + `HANDOFF.md` (S6); commit konusu `KAO-01: …` (S7); STATE/ledger (S8).

---

## KAO-25 — Plan denetleyici (kao-plan-check) sertleştirme

**Yeni oturuma yapıştır:**
```text
/Users/m_ras/Desktop/seyma reposunda kuran-ogreniyorum/UYGULAMA-PROMPTLARI.md ortak sözleşmesine (§0–§1) göre yalnız KAO-25 promptunu uygula. Önce §0 komutlarını ve `node kuran-ogreniyorum/tools/kao-plan-check.mjs --card KAO-25` çıktısını oku; tüm planı yükleme. Bu mesaj KAO-25 için uygulama yetkisidir; yetkiyi tekrar sorma. Push/merge/tag/deploy yetkisi değildir.
```

**Dalga:** 1 · **Bağımlılık:** — · **Gereksinimler:** —

**Amaç:** Plan denetleyiciyi sertleştirmek: ayrı test dosyası, `--card` çıktısına izinli dosya/kontrol listesi, kapsam ihlalinde açıklayıcı mesaj.

**Oku (yalnız bunlar; yollar `kuran-ogreniyorum/` göreli, repo dosyaları kökten):**
- tools/kao-plan-check.mjs (tamamı)
- 11-BAGIMSIZLIK-SOZLESMESI.md §3

**İzinli dosyalar (STATE ile birebir):**
- `kuran-ogreniyorum/tools/kao-plan-check.mjs`
- `kuran-ogreniyorum/tools/kao-plan-check.test.mjs`
- `kuran-ogreniyorum/evidence/KAO-25/**`
- `kuran-ogreniyorum/KAO-STATE.json`
- `kuran-ogreniyorum/.anti-amnesia/CURRENT-STATE.md`
- `kuran-ogreniyorum/.anti-amnesia/LEDGER.md`

**Adımlar:**
1. `kuran-ogreniyorum/tools/kao-plan-check.test.mjs`: self-test vakalarını dışarı taşı + 3 yeni vaka (IIP dosyasına yazan KAO commit'i, `SeyAudio.say` yasak ifade, promptOrder ↔ başlık sırası bozuk).
2. `--card` çıktısına `deps` durumları ve 'başlanabilir mi' (tüm deps done ∧ gate onaylı) alanı ekle.
3. Davranış değişmeden yeniden düzenleme; çıkış kodları aynı.

**Kontroller (hepsi exit 0; STATE ile birebir):**
- `node --check <değişen her .js/.mjs>`
- `node kuran-ogreniyorum/tools/kao-plan-check.mjs`
- `git -c core.fsmonitor=false diff --check`
- `node kuran-ogreniyorum/tools/kao-plan-check.mjs --self-test`

**Bitti sayılır:** Yeni vakalar PASS; `--card KAO-02` 'başlanabilir' alanını doğru gösteriyor.

**Kanıt:** `evidence/KAO-25/EVIDENCE.json` + `HANDOFF.md` (S6); commit konusu `KAO-25: …` (S7); STATE/ledger (S8).

---

## KAO-02 — Aday liste, kognat/komşu önerisi, inceleme tablosu

**Yeni oturuma yapıştır:**
```text
/Users/m_ras/Desktop/seyma reposunda kuran-ogreniyorum/UYGULAMA-PROMPTLARI.md ortak sözleşmesine (§0–§1) göre yalnız KAO-02 promptunu uygula. Önce §0 komutlarını ve `node kuran-ogreniyorum/tools/kao-plan-check.mjs --card KAO-02` çıktısını oku; tüm planı yükleme. Bu mesaj KAO-02 için uygulama yetkisidir; yetkiyi tekrar sorma. Push/merge/tag/deploy yetkisi değildir.
```

**Dalga:** 1 · **Bağımlılık:** KAO-01 · **Gereksinimler:** R-A5, R-A8

**Amaç:** Aday lemma listesini (≈530) üretmek: sıklık ≤500 + çapa metin kesişimi; kova A/B/C/D; kognat **önerisi**; anlamsal komşu **önerisi**; kalıp-etiketli Türkçe türev **önerisi**; insan inceleme tablosu.

**Oku (yalnız bunlar; yollar `kuran-ogreniyorum/` göreli, repo dosyaları kökten):**
- 03-MUFREDAT.md §9 (kova tanımları), §3 (çapa metinler)
- 02-PEDAGOJI.md §2.1 (öncelik formülü), §5.2, §5.6
- 12-EK-GEREKSINIMLER.md R-A5, R-A8
- 06 §3 (inceleme sütunları)

**İzinli dosyalar (STATE ile birebir):**
- `tools/kao-lexicon-build.mjs`
- `kuran-ogreniyorum/content/lexicon.draft.json`
- `kuran-ogreniyorum/content/lexicon.review.md`
- `kuran-ogreniyorum/evidence/KAO-02/**`
- `kuran-ogreniyorum/KAO-STATE.json`
- `kuran-ogreniyorum/.anti-amnesia/CURRENT-STATE.md`
- `kuran-ogreniyorum/.anti-amnesia/LEDGER.md`

**Adımlar:**
1. `--draft`: öncelik = 0.55·sıklıkNorm + 0.30·çapaMetin + 0.15·kognatDeğil; çapa metin = Fâtiha + İhlâs/Felak/Nâs + tesbihat (Tanzil metninden; tesbihat için araç içi sabit — Arapça yine Buckwalter tablosundan).
2. Kognat önerisi: `kuran-ogreniyorum/content/tr-arabic-loans.txt` (ajan **hafızadan** doldurmaz; boş şablon + kullanıcının TDK'den dolduracağı format; yoksa kognat alanı `null`).
3. `semNeighbors[]`: aynı kökten türevler + araç içi 12 anlam kümesi (korku/takva…, iman/küfür…) — yalnız öneri, `proposed:true`.
4. `--review-md`: 06 §3 sütunlarıyla Markdown tablo; her satır `verifiedBy` boş.
5. Rapor: kova sayıları, kapsam toplamı, Türkçede var sayısı (öneri) → evidence.

**Kontroller (hepsi exit 0; STATE ile birebir):**
- `node --check <değişen her .js/.mjs>`
- `node kuran-ogreniyorum/tools/kao-plan-check.mjs`
- `git -c core.fsmonitor=false diff --check`
- `node tools/kao-lexicon-build.mjs --draft → lexicon.draft.json (aday≈530, kova A/B/C/D raporu)`
- `node tools/kao-lexicon-build.mjs --review-md`

**Bitti sayılır:** lexicon.draft.json + lexicon.review.md üretildi; kova raporu evidence'ta; hiçbir satır `verified`.

**Kanıt:** `evidence/KAO-02/EVIDENCE.json` + `HANDOFF.md` (S6); commit konusu `KAO-02: …` (S7); STATE/ledger (S8).

---

## KAO-03 — Yapay zekâ doğrulaması ve içe alma (D-12)

**Yeni oturuma yapıştır:**
```text
/Users/m_ras/Desktop/seyma reposunda kuran-ogreniyorum/UYGULAMA-PROMPTLARI.md ortak sözleşmesine (§0–§1) göre yalnız KAO-03 promptunu uygula. Önce §0 komutlarını ve `node kuran-ogreniyorum/tools/kao-plan-check.mjs --card KAO-03` çıktısını oku; tüm planı yükleme. Bu mesaj KAO-03 için uygulama yetkisidir; yetkiyi tekrar sorma. Push/merge/tag/deploy yetkisi değildir.
```

**Dalga:** 1 · **Bağımlılık:** KAO-02 · **Gereksinimler:** R-A8
**Doğrulayıcı:** ajan (yapay zekâ) — D-12; insan teyidi yoktur. Eksik satır kalırsa `waiting_user` ara durumu izinlidir.

**Amaç:** Ajan inceleme tablosunu satır satır doldurur ve onaylar (Türkçe anlam, kalıp etiketi, kognat/anlam kayması, 3 örnek parçanın Türkçesi); okunuş ve Arapça araçtan gelir. Sonra içe alır ve tutarlılık denetimini 0'a indirir.

**Oku (yalnız bunlar; yollar `kuran-ogreniyorum/` göreli, repo dosyaları kökten):**
- 06 §3 + §3.1 (onay kuralı D-12 ve alan kuralları)
- content/lexicon.review.md

**İzinli dosyalar (STATE ile birebir):**
- `kuran-ogreniyorum/content/lexicon.verified.json`
- `kuran-ogreniyorum/content/lexicon.review.md`
- `kuran-ogreniyorum/evidence/KAO-03/**`
- `kuran-ogreniyorum/KAO-STATE.json`
- `kuran-ogreniyorum/.anti-amnesia/CURRENT-STATE.md`
- `kuran-ogreniyorum/.anti-amnesia/LEDGER.md`

**Adımlar:**
1. Ajan: `lexicon.review.md` satırlarını 06 §3.1 kurallarıyla doldurur; `verifiedBy` = ajan kimliği, `verifiedAt` = tek tarih; referansı kopyalamaz (06 §2). Arapça yazmaz (araçtan gelir).
2. `--import-md` → `lexicon.verified.json`; `verifiedBy` boş satır ya da `consistency` > 0 ise **waiting_user** durumunda kal.
3. Tutarlılık: her lemma ≥3 örnek, `ref` biçimi `S:A`, Arapça yalnız Arapça blok + hareke, Türkçe boş değil.
4. STATE: `cards['KAO-03'].status='waiting_user'` ara durum izinlidir; kart yalnız tam onay + tutarlılık 0 ile `done`.

**Kontroller (hepsi exit 0; STATE ile birebir):**
- `node --check <değişen her .js/.mjs>`
- `node kuran-ogreniyorum/tools/kao-plan-check.mjs`
- `git -c core.fsmonitor=false diff --check`
- `node tools/kao-lexicon-build.mjs --import-md → verified.json; verifiedBy boş satır = 0; consistency = 0`

**Bitti sayılır:** lexicon.verified.json tüm satırları `verifiedBy`+`verifiedAt` ile, `copiedFromReferenceTotal=0`, `consistency=0`.

**Kanıt:** `evidence/KAO-03/EVIDENCE.json` + `HANDOFF.md` (S6); commit konusu `KAO-03: …` (S7); STATE/ledger (S8).

---

## KAO-04 — Gramer içeriği (24 mikro-kavram + G0.5)

**Yeni oturuma yapıştır:**
```text
/Users/m_ras/Desktop/seyma reposunda kuran-ogreniyorum/UYGULAMA-PROMPTLARI.md ortak sözleşmesine (§0–§1) göre yalnız KAO-04 promptunu uygula. Önce §0 komutlarını ve `node kuran-ogreniyorum/tools/kao-plan-check.mjs --card KAO-04` çıktısını oku; tüm planı yükleme. Bu mesaj KAO-04 için uygulama yetkisidir; yetkiyi tekrar sorma. Push/merge/tag/deploy yetkisi değildir.
```

**Dalga:** 1 · **Bağımlılık:** KAO-01 · **Gereksinimler:** R-A7, R-A8

**Amaç:** 24 gramer mikro-kavramı + G0.5 'Fiil önce gelir' içeriğini Türkçe (terimsiz + terimli çift) taslaklamak, alıştırma şablonlarıyla; Ünite 11'i Türkçe türevlerden kurmak.

**Oku (yalnız bunlar; yollar `kuran-ogreniyorum/` göreli, repo dosyaları kökten):**
- 03-MUFREDAT.md §3–6 (G1–G24 ve ünite eşlemesi)
- 02 §2.9, §5.x
- 12 R-A7, R-A8
- content/lexicon.verified.json (varsa; kalıp etiketli türevler)

**İzinli dosyalar (STATE ile birebir):**
- `tools/kao-grammar-build.mjs`
- `tools/kao-lexicon-build.mjs` (yalnız dışa aktarım)
- `kuran-ogreniyorum/content/grammar.draft.json`
- `kuran-ogreniyorum/content/grammar.verified.json`
- `kuran-ogreniyorum/content/grammar.review.md`
- `kuran-ogreniyorum/evidence/KAO-04/**`
- `kuran-ogreniyorum/KAO-STATE.json`
- `kuran-ogreniyorum/.anti-amnesia/CURRENT-STATE.md`
- `kuran-ogreniyorum/.anti-amnesia/LEDGER.md`

**Adımlar:**
1. `content/grammar.draft.json`: `{id:'g1',unit:1,title,plainTr,termTr,tables[],templates[≥3],examples[]}`; `g0_5` dâhil (SOV↔VSO ok şeması metni).
2. Örnek Arapça **yalnız** verified sözlükten / korpus referansından (`tools/kao-grammar-build.mjs --build`, `--example`); ajan hafızadan âyet yazmaz.
3. `grammar.review.md` → doğrulayıcı onayı (D-12) → `--import-grammar` → `grammar.verified.json`.
4. Şablon türleri 02 §2.3 tablosundaki adlarla birebir (ek çöz, çekim tablosu, kök bul, kalıp eşle…).

**Kontroller (hepsi exit 0; STATE ile birebir):**
- `node --check <değişen her .js/.mjs>`
- `node kuran-ogreniyorum/tools/kao-plan-check.mjs`
- `git -c core.fsmonitor=false diff --check`
- `node tools/kao-grammar-build.mjs --self-test`
- `node tools/kao-grammar-build.mjs --build → issues=0 (her kavramda ≥3 alıştırma şablonu, ≥2 tür; g0_5 mevcut)`
- `node tools/kao-grammar-build.mjs --import-grammar → verified=26/26, consistency=0; onay alanları dolu (06 §3, D-12)`

**Bitti sayılır:** grammar.verified.json onaylı; g0_5 mevcut; Ünite 11 Türkçe türev tablosu ≥60 kök.

**Kanıt:** `evidence/KAO-04/EVIDENCE.json` + `HANDOFF.md` (S6); commit konusu `KAO-04: …` (S7); STATE/ledger (S8).

---

## KAO-23 — Fonetik içeriği + mahreç SVG

**Yeni oturuma yapıştır:**
```text
/Users/m_ras/Desktop/seyma reposunda kuran-ogreniyorum/UYGULAMA-PROMPTLARI.md ortak sözleşmesine (§0–§1) göre yalnız KAO-23 promptunu uygula. Önce §0 komutlarını ve `node kuran-ogreniyorum/tools/kao-plan-check.mjs --card KAO-23` çıktısını oku; tüm planı yükleme. Bu mesaj KAO-23 için uygulama yetkisidir; yetkiyi tekrar sorma. Push/merge/tag/deploy yetkisi değildir.
```

**Dalga:** 1 · **Bağımlılık:** KAO-01 · **Gereksinimler:** R-B6, R-A9

**Amaç:** Fonetik içeriği: 28 harf kova/mahreç/Türkçe ipucu, minimal çift listesi, 7 okuma kuralı, iki katmanlı transliterasyon tablosu; 13 mahreç SVG'si.

**Oku (yalnız bunlar; yollar `kuran-ogreniyorum/` göreli, repo dosyaları kökten):**
- 10-TELAFFUZ.md (tamamı)
- 12 R-B6, R-A9
- 04 §4 (SVG/tema kuralı: currentColor)

**İzinli dosyalar (STATE ile birebir):**
- `kuran-ogreniyorum/content/phonics.draft.json`
- `kuran-ogreniyorum/content/phonics.verified.json`
- `kuran-ogreniyorum/content/phonics.review.md`
- `assets/kao/svg/**`
- `kuran-ogreniyorum/evidence/KAO-23/**`
- `kuran-ogreniyorum/KAO-STATE.json`
- `kuran-ogreniyorum/.anti-amnesia/CURRENT-STATE.md`
- `kuran-ogreniyorum/.anti-amnesia/LEDGER.md`

**Adımlar:**
1. `content/phonics.draft.json`: `letters[28]{id,ar,bucket:A|B|C,mahrec,tipTr,svg}`, `pairs[]{a,b,exampleWords[2]}` (kelimeler sözlükten id ile), `rules[7]`, `translit{bw→okunuş, bw→dia}`.
2. `assets/kao/svg/mahrec-<harf>.svg` ×13 (B+C kova): aynı sagittal siluet şablonu, yalnız vurgu yolu değişir; `fill="currentColor"`, ≤4 KB, `<title>` Türkçe.
3. İnceleme → onay → `phonics.verified.json` (Arapça bilen ikinci göz zorunlu; `verifiedBy` iki ad).

**Kontroller (hepsi exit 0; STATE ile birebir):**
- `node --check <değişen her .js/.mjs>`
- `node kuran-ogreniyorum/tools/kao-plan-check.mjs`
- `git -c core.fsmonitor=false diff --check`
- `28 harf; her B/C harfinde ≥1 minimal çift; 13 SVG ≤4 KB, fill=currentColor`

**Bitti sayılır:** phonics.verified.json + 13 SVG; transliterasyon tablosu çakışmasız.

**Kanıt:** `evidence/KAO-23/EVIDENCE.json` + `HANDOFF.md` (S6); commit konusu `KAO-23: …` (S7); STATE/ledger (S8).

---

## KAO-24 — Ses varlık hattı (alt küme + AAC)

**Yeni oturuma yapıştır:**
```text
/Users/m_ras/Desktop/seyma reposunda kuran-ogreniyorum/UYGULAMA-PROMPTLARI.md ortak sözleşmesine (§0–§1) göre yalnız KAO-24 promptunu uygula. Önce §0 komutlarını ve `node kuran-ogreniyorum/tools/kao-plan-check.mjs --card KAO-24` çıktısını oku; tüm planı yükleme. Bu mesaj KAO-24 için uygulama yetkisidir; yetkiyi tekrar sorma. Push/merge/tag/deploy yetkisi değildir.
```

**Dalga:** 1 · **Bağımlılık:** KAO-02, KAO-23 · **Gereksinimler:** R-C2
**KAPI:** D-08 ve D-09 kullanıcı onayı — `gateApproval` STATE'te yoksa `blocked` ve dur.

**Amaç:** Ses varlıkları: kaynak veri setinden yalnız gerekli alt kümeyi (lemma × 2 stil + 20 kısa sûre kelimeleri + minimal çift heceleri) seçip AAC .m4a'ya dönüştürmek, manifest ve boyut raporu üretmek.

**Oku (yalnız bunlar; yollar `kuran-ogreniyorum/` göreli, repo dosyaları kökten):**
- 10-TELAFFUZ.md §8
- 12 R-C2
- KAO-STATE.json decisions D-08, D-09 (**onay kaydı olmadan başlama**)

**İzinli dosyalar (STATE ile birebir):**
- `tools/kao-audio-build.mjs`
- `kuran-ogreniyorum/content/audio-manifest.json`
- `assets/kao/audio/**`
- `kuran-ogreniyorum/evidence/KAO-24/**`
- `kuran-ogreniyorum/KAO-STATE.json`
- `kuran-ogreniyorum/.anti-amnesia/CURRENT-STATE.md`
- `kuran-ogreniyorum/.anti-amnesia/LEDGER.md`

**Adımlar:**
1. `gateApproval` yoksa dur: STATE `cards['KAO-24'].status='blocked'`, ledger'a 'D-08/D-09 bekliyor'.
2. `tools/kao-audio-build.mjs --source <yerel klasör> --out assets/kao/audio`: adlandırma `w-<lemmaId>-<style>.m4a`, `s-<surah>-<ayah>-<i>.m4a`, `p-<pairId>.m4a`; ffmpeg yoksa exit 2 + kurulum notu; ağ yok.
3. `content/audio-manifest.json`: klip id → dosya, süre, kaynak set, lisans, okuyucu kökeni alanı (D-08 doğrulaması yazılı).
4. Boyut ≤16 MB; aşarsa stil 2'yi yalnız kısa sûrelere daralt ve raporla.

**Kontroller (hepsi exit 0; STATE ile birebir):**
- `node --check <değişen her .js/.mjs>`
- `node kuran-ogreniyorum/tools/kao-plan-check.mjs`
- `git -c core.fsmonitor=false diff --check`
- `toplam ≤16 MB; .m4a; manifest klip sayısı = dosya sayısı; köken/lisans kaydı`

**Bitti sayılır:** Manifest + klipler; köken/lisans kaydı; boyut raporu evidence'ta.

**Kanıt:** `evidence/KAO-24/EVIDENCE.json` + `HANDOFF.md` (S6); commit konusu `KAO-24: …` (S7); STATE/ledger (S8).

---

## KAO-05 — quranLexiconV1.js dondurma + 4 yükleme listesi

**Yeni oturuma yapıştır:**
```text
/Users/m_ras/Desktop/seyma reposunda kuran-ogreniyorum/UYGULAMA-PROMPTLARI.md ortak sözleşmesine (§0–§1) göre yalnız KAO-05 promptunu uygula. Önce §0 komutlarını ve `node kuran-ogreniyorum/tools/kao-plan-check.mjs --card KAO-05` çıktısını oku; tüm planı yükleme. Bu mesaj KAO-05 için uygulama yetkisidir; yetkiyi tekrar sorma. Push/merge/tag/deploy yetkisi değildir.
```

**Dalga:** 2 · **Bağımlılık:** KAO-03 · **Gereksinimler:** —

**Amaç:** `quranLexiconV1.js` donmuş içerik modülünü üretmek (`--freeze`), dört yükleme listesine eklemek, iki içerik fixture'ını yazmak.

**Oku (yalnız bunlar; yollar `kuran-ogreniyorum/` göreli, repo dosyaları kökten):**
- 05 §1 (dosya/boyut), §8 (fixture)
- 06 §4 (sürümleme, ATTRIBUTION)
- `app/content/quranStrikingVersesV1.js` 1–60 (frozen modül + insan doğrulama notu kalıbı)
- CLAUDE.md 'Load-order lesson (MON-25)'

**İzinli dosyalar (STATE ile birebir):**
- `tools/kao-lexicon-build.mjs`
- `app/content/quranLexiconV1.js`
- `index.html`
- `.claude/skills/run-seyma/driver.mjs`
- `.claude/skills/run-seyma/zikr-harness.mjs`
- `tests/app/test_state_rebind_boundary.js`
- `tests/kao/test_kao_lexicon_contract.js`
- `tests/kao/test_kao_lexicon_coverage.js`
- `kuran-ogreniyorum/evidence/KAO-05/**`
- `kuran-ogreniyorum/UYGULAMA-PROMPTLARI.md`
- `kuran-ogreniyorum/KAO-STATE.json`
- `kuran-ogreniyorum/.anti-amnesia/CURRENT-STATE.md`
- `kuran-ogreniyorum/.anti-amnesia/LEDGER.md`

**Adımlar:**
1. `node tools/kao-lexicon-build.mjs --freeze` → `app/content/quranLexiconV1.js`: IIFE, `window.QuranLexiconV1={version,METHODOLOGY_TR,ATTRIBUTION,lemmas[],roots{},byId()}`; DOM/ağ/depo erişimi yok; boyut ≤260 KB.
2. `index.html` içerik bloğuna `?v=YYYYMMDDa` ile ekle (quranStrikingVersesV1'den sonra); `driver.mjs FILES`, `zikr-harness.mjs FILES`, `test_state_rebind_boundary.js FILES`'a aynı commit'te ekle.
3. `tests/kao/test_kao_lexicon_contract.js` (id benzersiz, Arapça blok+hareke regex, verified:true her kayıt, ≥3 örnek, boyut) ve `test_kao_lexicon_coverage.js` (Σfreq/77.430 ünite eşikleri 03 §1).
4. Commit konusu `KAO-05: …` (denetleyici kapsam kontrolü buna bağlı).

**Kontroller (hepsi exit 0; STATE ile birebir):**
- `node --check <değişen her .js/.mjs>`
- `node kuran-ogreniyorum/tools/kao-plan-check.mjs`
- `git -c core.fsmonitor=false diff --check`
- `node tests/kao/test_kao_lexicon_contract.js`
- `node tests/kao/test_kao_lexicon_coverage.js`
- `node .claude/skills/run-seyma/driver.mjs`
- `node .claude/skills/run-seyma/zikr-harness.mjs`
- `node tests/app/test_state_rebind_boundary.js`
- `node tools/shell-inventory.mjs --gate`

**Bitti sayılır:** Modül yükleniyor (driver/zikr PASS), 4 liste eşit, iki fixture PASS, boyut bütçesi.

**Kanıt:** `evidence/KAO-05/EVIDENCE.json` + `HANDOFF.md` (S6); commit konusu `KAO-05: …` (S7); STATE/ledger (S8).

---

## KAO-06 — quranGrammarV1 + quranShortSurahsV1 + quranPhonicsV1 (+prayerTexts)

**Yeni oturuma yapıştır:**
```text
/Users/m_ras/Desktop/seyma reposunda kuran-ogreniyorum/UYGULAMA-PROMPTLARI.md ortak sözleşmesine (§0–§1) göre yalnız KAO-06 promptunu uygula. Önce §0 komutlarını ve `node kuran-ogreniyorum/tools/kao-plan-check.mjs --card KAO-06` çıktısını oku; tüm planı yükleme. Bu mesaj KAO-06 için uygulama yetkisidir; yetkiyi tekrar sorma. Push/merge/tag/deploy yetkisi değildir.
```

**Dalga:** 2 · **Bağımlılık:** KAO-04, KAO-23 · **Gereksinimler:** R-A6, R-B2

**Amaç:** `quranGrammarV1.js`, `quranShortSurahsV1.js` (20 sûre kelime kelime + vakıf işaretleri + `prayerTexts` rekât sırası) ve `quranPhonicsV1.js` donmuş modüllerini üretmek; 4 listeye eklemek; fonetik fixture'ı.

**Oku (yalnız bunlar; yollar `kuran-ogreniyorum/` göreli, repo dosyaları kökten):**
- 05 §1
- 10 §4 (vakıf/kurallar)
- 12 R-A6, R-B2
- 03 §7 (20 sûre listesi)

**İzinli dosyalar (STATE ile birebir):**
- `app/content/quranGrammarV1.js`
- `app/content/quranShortSurahsV1.js`
- `app/content/quranPhonicsV1.js`
- `tools/kao-content-freeze.mjs`
- `kuran-ogreniyorum/UYGULAMA-PROMPTLARI.md`
- `index.html`
- `.claude/skills/run-seyma/driver.mjs`
- `.claude/skills/run-seyma/zikr-harness.mjs`
- `tests/app/test_state_rebind_boundary.js`
- `tests/kao/test_kao_phonics_contract.js`
- `tests/kao/test_kao_lexicon_contract.js`
- `kuran-ogreniyorum/evidence/KAO-06/**`
- `kuran-ogreniyorum/KAO-STATE.json`
- `kuran-ogreniyorum/.anti-amnesia/CURRENT-STATE.md`
- `kuran-ogreniyorum/.anti-amnesia/LEDGER.md`

**Adımlar:**
1. `tools/kao-content-freeze.mjs` sahibiyle `--freeze-grammar`, `--freeze-surahs` (Tanzil penceresi; kaynakta bulunan vakıf işaretleri ۚ ۖ ۗ korunur; her kelime `lemmaId`), `--freeze-phonics`. Ana 524 sözlükte olmayan sûre lemmaları, yanlış eşleme yapılmadan sûre modülünün kaynak kayıtlı tamamlayıcı sözlüğünde çözülür (GAP-07).
2. `prayerTexts`: tekbir → Sübhâneke → Fâtiha → zamm-ı sûre → rükû → secde → tahiyyat → selâm; her kelime `lemmaId` ile sözlüğe bağlı; onay (06 §3, D-12) KAO-23/04 kapsamında alınmış olmalı, değilse `waiting_user`.
3. Üç dosya 4 listeye aynı commit'te; `?v=` bump.
4. `tests/kao/test_kao_phonics_contract.js`; lexicon contract fixture'ına sûre kelime→lemma referans bütünlüğü ekle.

**Kontroller (hepsi exit 0; STATE ile birebir):**
- `node --check <değişen her .js/.mjs>`
- `node kuran-ogreniyorum/tools/kao-plan-check.mjs`
- `git -c core.fsmonitor=false diff --check`
- `node tests/kao/test_kao_phonics_contract.js`
- `node tests/kao/test_kao_lexicon_contract.js`
- `node .claude/skills/run-seyma/driver.mjs`
- `node .claude/skills/run-seyma/zikr-harness.mjs`
- `node tests/app/test_state_rebind_boundary.js`
- `node tools/shell-inventory.mjs --gate`

**Bitti sayılır:** Üç modül yükleniyor; fixture'lar PASS; vakıf işaretleri korunmuş (fixture sayar).

**Kanıt:** `evidence/KAO-06/EVIDENCE.json` + `HANDOFF.md` (S6); commit konusu `KAO-06: …` (S7); STATE/ledger (S8).

---

## KAO-07 — Registry iskeleti + ensureQuranLearn + migrate kancası

**Yeni oturuma yapıştır:**
```text
/Users/m_ras/Desktop/seyma reposunda kuran-ogreniyorum/UYGULAMA-PROMPTLARI.md ortak sözleşmesine (§0–§1) göre yalnız KAO-07 promptunu uygula. Önce §0 komutlarını ve `node kuran-ogreniyorum/tools/kao-plan-check.mjs --card KAO-07` çıktısını oku; tüm planı yükleme. Bu mesaj KAO-07 için uygulama yetkisidir; yetkiyi tekrar sorma. Push/merge/tag/deploy yetkisi değildir.
```

**Dalga:** 2 · **Bağımlılık:** KAO-05 · **Gereksinimler:** R-C7

**Amaç:** `app/core/quranLearn.js` registry iskeleti: `ensureQuranLearn(d)`, `registerQuranLearn(deps)` (fail-closed), şema sabitleri; `state.js` migrate kancası; app.js shim; 4 liste; 3 fixture.

**Oku (yalnız bunlar; yollar `kuran-ogreniyorum/` göreli, repo dosyaları kökten):**
- 05 §1–2 (şema, kart id'leri, orphan kuralı)
- 11 §1
- `app/core/quran.js` 1–75 (registry kalıbı: deps, stateData, empty/ensure)
- `app/core/state.js` 26–35 ve 150–156 (MIGRATE_DEPENDENCIES + try/catch kalıbı)
- `app.js` satır 356 civarı (`ensureQuranJourney` shim) ve 961/2139 (dep-bag kayıt satırları)
- CLAUDE.md 'B1 live-getter boundary'

**İzinli dosyalar (STATE ile birebir):**
- `app/core/quranLearn.js`
- `app/core/state.js`
- `app.js`
- `index.html`
- `.claude/skills/run-seyma/driver.mjs`
- `.claude/skills/run-seyma/zikr-harness.mjs`
- `tests/app/test_state_rebind_boundary.js`
- `tests/kao/test_kao_migration.js`
- `tests/kao/test_kao_boundary.js`
- `tests/kao/test_kao_independence.js`
- `.claude/skills/run-seyma/verify-state-migration-boundary.mjs`
- `kuran-ogreniyorum/UYGULAMA-PROMPTLARI.md`
- `kuran-ogreniyorum/evidence/KAO-07/**`
- `kuran-ogreniyorum/KAO-STATE.json`
- `kuran-ogreniyorum/.anti-amnesia/CURRENT-STATE.md`
- `kuran-ogreniyorum/.anti-amnesia/LEDGER.md`

**Adımlar:**
1. `quranLearn.js`: yükte yalnız `window.SeymaQuranLearn` yazar; `ensureQuranLearn` additive/idempotent (05 §2 alanları; `readability`, `phonics`, `errors`, `ayahs`, `milestones`), `lexiconVersion` farkında orphan işaretleme, silme yok.
2. `state.js`: `MIGRATE_DEPENDENCIES`'e `'ensureQuranLearn'`; `migrate()` içinde Kur'an Yolculuğu satırının hemen altına `try{ ensureQuranLearn(d) }catch(e){ console.warn('[KAO] migration uygulanamadı',e) }`.
3. `app.js`: `function ensureQuranLearn(d){ return window.SeymaQuranLearn.ensureQuranLearn.apply(null,arguments); }` + migrate dep-bag'e ekleme + `registerQuranLearn({data:…,ui:…,save:…,render:…,todayStr:…,esc:…,icon:…,getDay:…})` boot'ta (fail-closed throw). Shim toplamı ≤30 satır (shell-inventory).
4. 4 liste + `?v=`; `tests/kao/test_kao_migration.js` (boş/eski/bozuk/idempotent/114 sûre sentetik — R-C7), `test_kao_boundary.js` (yükte DOM/ağ/depo yok; 4 liste eşit), `test_kao_independence.js` (IIP/`SeymaSaygi` iç referansı yok).

**Kontroller (hepsi exit 0; STATE ile birebir):**
- `node --check <değişen her .js/.mjs>`
- `node kuran-ogreniyorum/tools/kao-plan-check.mjs`
- `git -c core.fsmonitor=false diff --check`
- `node tests/kao/test_kao_migration.js`
- `node tests/kao/test_kao_boundary.js`
- `node tests/kao/test_kao_independence.js`
- `node .claude/skills/run-seyma/verify-state-migration-boundary.mjs`
- `node .claude/skills/run-seyma/driver.mjs`
- `node .claude/skills/run-seyma/zikr-harness.mjs`
- `node tests/app/test_state_rebind_boundary.js`
- `node tools/shell-inventory.mjs --gate`

**Bitti sayılır:** `data.quranLearn` eski kayıttan üretiliyor; migrate parity fixture PASS; shell-inventory gate PASS.

**Kanıt:** `evidence/KAO-07/EVIDENCE.json` + `HANDOFF.md` (S6); commit konusu `KAO-07: …` (S7); STATE/ledger (S8).

---

## KAO-08 — FSRS saf JS portu

**Yeni oturuma yapıştır:**
```text
/Users/m_ras/Desktop/seyma reposunda kuran-ogreniyorum/UYGULAMA-PROMPTLARI.md ortak sözleşmesine (§0–§1) göre yalnız KAO-08 promptunu uygula. Önce §0 komutlarını ve `node kuran-ogreniyorum/tools/kao-plan-check.mjs --card KAO-08` çıktısını oku; tüm planı yükleme. Bu mesaj KAO-08 için uygulama yetkisidir; yetkiyi tekrar sorma. Push/merge/tag/deploy yetkisi değildir.
```

**Dalga:** 2 · **Bağımlılık:** KAO-07 · **Gereksinimler:** R-A3

**Amaç:** FSRS-4.5 varsayılan parametreleriyle saf JS zamanlayıcı `kaoSchedule(card, grade, now)`; grade eşlemesi; kalibrasyon kaydı için `predictedR`.

**Oku (yalnız bunlar; yollar `kuran-ogreniyorum/` göreli, repo dosyaları kökten):**
- 05 §5
- 02 §2.2
- 12 R-A3
- 01 §4 (karar: ts-fsrs portu, MIT atıfı)

**İzinli dosyalar (STATE ile birebir):**
- `app/core/quranLearn.js`
- `tests/kao/test_kao_fsrs.js`
- `tests/kao/fixtures/fsrs-vectors.json`
- `kuran-ogreniyorum/evidence/KAO-08/**`
- `kuran-ogreniyorum/KAO-STATE.json`
- `kuran-ogreniyorum/.anti-amnesia/CURRENT-STATE.md`
- `kuran-ogreniyorum/.anti-amnesia/LEDGER.md`

**Adımlar:**
1. ts-fsrs formüllerini (stability/difficulty/retrievability, next_interval) port et; 19 parametre sabit; hedef R 0,90; dosya başında MIT atıfı (D-04).
2. `tests/kao/fixtures/fsrs-vectors.json`: ts-fsrs'in yayımlanmış örnek dizilerinden ≥20 vektör (ajan üretmez; kaynaktan alır, kaynağı yazar); yoksa vektörler README'de eksik olarak işaretlenir ve kart `waiting_user`.
3. `test_kao_fsrs.js`: vektörlerle ±1e-6, monotonluk (Again < Hard < Good < Easy aralığı), `predictedR ∈ (0,1]`.

**Kontroller (hepsi exit 0; STATE ile birebir):**
- `node --check <değişen her .js/.mjs>`
- `node kuran-ogreniyorum/tools/kao-plan-check.mjs`
- `git -c core.fsmonitor=false diff --check`
- `node tests/kao/test_kao_fsrs.js`

**Bitti sayılır:** FSRS fixture PASS; grade eşlemesi (yanlış/Hard>8 s/Good/Easy<2,5 s∧n≥3) belgelendi.

**Kanıt:** `evidence/KAO-08/EVIDENCE.json` + `HANDOFF.md` (S6); commit konusu `KAO-08: …` (S7); STATE/ledger (S8).

---

## KAO-09 — Kuyruk, görev üretici, çeldirici, gece tekrarı

**Yeni oturuma yapıştır:**
```text
/Users/m_ras/Desktop/seyma reposunda kuran-ogreniyorum/UYGULAMA-PROMPTLARI.md ortak sözleşmesine (§0–§1) göre yalnız KAO-09 promptunu uygula. Önce §0 komutlarını ve `node kuran-ogreniyorum/tools/kao-plan-check.mjs --card KAO-09` çıktısını oku; tüm planı yükleme. Bu mesaj KAO-09 için uygulama yetkisidir; yetkiyi tekrar sorma. Push/merge/tag/deploy yetkisi değildir.
```

**Dalga:** 2 · **Bağımlılık:** KAO-08 · **Gereksinimler:** R-A1, R-A2, R-A5

**Amaç:** Kuyruk kurucu (bütçe/serpiştirme/deterministik seed), görev üretici, güvenli çeldirici, anlamsal komşu ayrımı, gece tekrarı penceresi.

**Oku (yalnız bunlar; yollar `kuran-ogreniyorum/` göreli, repo dosyaları kökten):**
- 05 §6
- 02 §2.4
- 12 R-A1, R-A2, R-A5
- `app/core/health.js` `caffeineTargetBed` (satır ~927) — yalnız okuma

**İzinli dosyalar (STATE ile birebir):**
- `app/core/quranLearn.js`
- `tests/kao/test_kao_queue.js`
- `tests/kao/test_kao_requirements.js`
- `kuran-ogreniyorum/evidence/KAO-09/**`
- `kuran-ogreniyorum/KAO-STATE.json`
- `kuran-ogreniyorum/.anti-amnesia/CURRENT-STATE.md`
- `kuran-ogreniyorum/.anti-amnesia/LEDGER.md`

**Adımlar:**
1. `kaoBuildQueue(d, now, opts)`: due ≤60, yeni ≤dailyNew, gramer ≤3, parça ≤2; ardışık aynı tür ≤2; seed = gün+kart id (xorshift).
2. Çeldirici: yalnız `st=review ∧ s≥21`; aynı POS, farklı kök; aynı çeldirici aynı hedefte ardışık 2 tekrarda gelmez (R-A2).
3. `semNeighbors`: aynı oturumda ve 3 gün içinde iki komşu yeni kart yok (R-A5).
4. `kaoNightWindow(d, now)`: `settings.targetBed` (health helper'ı **dep-bag üzerinden**; yoksa `false`); 90 dk penceresi (R-A1).
5. `test_kao_queue.js` + `test_kao_requirements.js` (1.000 sentetik oturum; ihlal 0).

**Kontroller (hepsi exit 0; STATE ile birebir):**
- `node --check <değişen her .js/.mjs>`
- `node kuran-ogreniyorum/tools/kao-plan-check.mjs`
- `git -c core.fsmonitor=false diff --check`
- `node tests/kao/test_kao_queue.js`
- `node tests/kao/test_kao_requirements.js`

**Bitti sayılır:** İki fixture PASS; R-A1/A2/A5 kontrol satırları evidence'ta.

**Kanıt:** `evidence/KAO-09/EVIDENCE.json` + `HANDOFF.md` (S6); commit konusu `KAO-09: …` (S7); STATE/ledger (S8).

---

## KAO-10 — Overlay kabuğu + E1 Home + geçici Ayarlar girişi

**Yeni oturuma yapıştır:**
```text
/Users/m_ras/Desktop/seyma reposunda kuran-ogreniyorum/UYGULAMA-PROMPTLARI.md ortak sözleşmesine (§0–§1) göre yalnız KAO-10 promptunu uygula. Önce §0 komutlarını ve `node kuran-ogreniyorum/tools/kao-plan-check.mjs --card KAO-10` çıktısını oku; tüm planı yükleme. Bu mesaj KAO-10 için uygulama yetkisidir; yetkiyi tekrar sorma. Push/merge/tag/deploy yetkisi değildir.
```

**Dalga:** 3 · **Bağımlılık:** KAO-09 · **Gereksinimler:** —

**Amaç:** Overlay kabuğu (dialog/aria/klavye/odak), E1 Home, geçici Ayarlar giriş satırı; `app/kao.css`.

**Oku (yalnız bunlar; yollar `kuran-ogreniyorum/` göreli, repo dosyaları kökten):**
- 04 §1 (geçici giriş), §2 E1, §3 wireframe, §4 sözleşme
- `app.js` 3727–3728 (`openReading/closeReading` şablonu — kopyalanacak kalıp)
- CLAUDE.md 'Modal keyboard contract'
- `app/core/settings.js` Hakkında/v3 satırı çevresi (düz `<a>`/buton kalıbı)
- `tests/app/test_fx2_*.js` başlıkları (App yüzeyi 718 / onclick 391 pin — CLAUDE.md tuzağı: yorumda `App.kao…=` yazma)

**İzinli dosyalar (STATE ile birebir):**
- `app/core/quranLearn.js`
- `app/kao.css`
- `app.js`
- `app/core/settings.js`
- `index.html`
- `tests/kao/test_kao_render.js`
- `tests/app/test_fx2_*.js`
- `kuran-ogreniyorum/evidence/KAO-10/**`
- `kuran-ogreniyorum/KAO-STATE.json`
- `kuran-ogreniyorum/.anti-amnesia/CURRENT-STATE.md`
- `kuran-ogreniyorum/.anti-amnesia/LEDGER.md`

**Adımlar:**
1. `App.kaoOpen(view?)/kaoClose()/kaoSetView(v)` app.js'te 1-satır shim; gövdeler `quranLearn.js`'te (`kaoOverlayHTML`, `kaoHomeHTML`).
2. Kabuk: `#sey-ov-back` + `#sey-ov-card role=dialog aria-modal=true tabindex=-1 onkeydown=App.onModalKeydown(event,App.kaoClose)`; `reminderLockBodyScroll/Unlock`; `focusModalDialog('sey-ov-card')`; `SeyFx.sheetClose`.
3. E1: kapsam %, anlaşılan âyet sayısı, bugün N tekrar/M yeni/~dk, ünite, son kilometre taşı, gece tekrarı satırı (pencere açıksa), tek CTA.
4. `app/kao.css`: yalnız `--quran*`/`--faith*`/`--f-*`/`--dur-*` tüketir; `:root` tanımı yok; `index.html`'e `?v=` ile ekle.
5. `settings.js`: tek satır 'Kur'an Arapçası Öğreniyorum' → `App.kaoOpen()`.
6. `test_kao_render.js`: Tab/Shift+Tab/Escape, odak dönüşü, `lang=ar dir=rtl` yok (E1'de Arapça yok) — kabuk sözleşmesi; fx2 pinleri güncelle.

**Kontroller (hepsi exit 0; STATE ile birebir):**
- `node --check <değişen her .js/.mjs>`
- `node kuran-ogreniyorum/tools/kao-plan-check.mjs`
- `git -c core.fsmonitor=false diff --check`
- `node tests/kao/test_kao_render.js (dialog/aria/Tab/Shift+Tab/Escape/odak dönüşü)`
- `for f in tests/app/test_fx2_*.js; do node $f; done (pin güncel)`
- `node .claude/skills/run-seyma/driver.mjs`
- `node .claude/skills/run-seyma/zikr-harness.mjs`
- `node tests/app/test_state_rebind_boundary.js`
- `node tools/shell-inventory.mjs --gate`

**Bitti sayılır:** Overlay açılıp kapanıyor; render fixture PASS; fx2 pinleri yeni sayıyla yeşil.

**Kanıt:** `evidence/KAO-10/EVIDENCE.json` + `HANDOFF.md` (S6); commit konusu `KAO-10: …` (S7); STATE/ledger (S8).

---

## KAO-11 — E2 oturum çekirdeği: anlam seç / Arapça seç, ses düğmesi, geri al

**Yeni oturuma yapıştır:**
```text
/Users/m_ras/Desktop/seyma reposunda kuran-ogreniyorum/UYGULAMA-PROMPTLARI.md ortak sözleşmesine (§0–§1) göre yalnız KAO-11 promptunu uygula. Önce §0 komutlarını ve `node kuran-ogreniyorum/tools/kao-plan-check.mjs --card KAO-11` çıktısını oku; tüm planı yükleme. Bu mesaj KAO-11 için uygulama yetkisidir; yetkiyi tekrar sorma. Push/merge/tag/deploy yetkisi değildir.
```

**Dalga:** 3 · **Bağımlılık:** KAO-10 · **Gereksinimler:** R-A4, R-B7, R-B8, R-C2, R-C3, R-C5

**Amaç:** E2 oturum çekirdeği: anlam seç / Arapça seç görevleri, hedefli DOM güncelleme, aria-live, ses düğmesi (dokun/basılı tut), ilk sunumda otomatik ses, kognat rozeti, geri al 3 s, sessiz mod.

**Oku (yalnız bunlar; yollar `kuran-ogreniyorum/` göreli, repo dosyaları kökten):**
- 04 §2 E2, §3b
- 12 R-A4, R-B7, R-B8, R-C2, R-C3, R-C5
- `app/core/zikir.js` `zikr-live-*` hedefli güncelleme kalıbı (satır ~1130–1141)

**İzinli dosyalar (STATE ile birebir):**
- `app/core/quranLearn.js`
- `app/kao.css`
- `app.js`
- `tests/kao/test_kao_render.js`
- `tests/kao/test_kao_requirements.js`
- `tests/kao/test_kao_privacy.js`
- `kuran-ogreniyorum/evidence/KAO-11/**`
- `kuran-ogreniyorum/KAO-STATE.json`
- `kuran-ogreniyorum/.anti-amnesia/CURRENT-STATE.md`
- `kuran-ogreniyorum/.anti-amnesia/LEDGER.md`

**Adımlar:**
1. `App.kaoStart()` kuyruğu `ui.kaoQueue`'ya; `App.kaoAnswer(taskId, choiceId)`: değerlendir → `ui.kaoUndo={card önceki, daily önceki}` → FSRS → `save()` → yalnız `#kao-task` alt ağacını yenile (tam `render()` yok).
2. `App.kaoUndo()`: 3 s içinde; bit-bit geri sarma.
3. `App.kaoPlay(clipId, style)`: `<audio preload="none" src="assets/kao/audio/…">`; yükleme hatasında sessiz mod bayrağı `ui.kaoAudioFailed=true` ve görev metinle sürer.
4. Otomatik ses: `n<2` yeni kartta `data-autoplay=1`; sessiz saat (`window.SeyAudio.isQuietTime()` — mediaFx.js'te dışa açık; dep-bag üzerinden `isQuietTime` getter'ı) veya ses ayarı kapalıysa yok; Arapça metin ses başlayınca (≤150 ms) görünür.
5. Rozet: `.kao-cognate` pastil; `shift` varsa `--quran-warn` + simge + 'dikkat' metni.
6. Fixture'lar: render (aria-live, düğmeler, klavye eşdeğeri), requirements (undo bit-bit, R-A4 autoplay kuralı), privacy (fetch/audio yalnız assets/kao).

**Kontroller (hepsi exit 0; STATE ile birebir):**
- `node --check <değişen her .js/.mjs>`
- `node kuran-ogreniyorum/tools/kao-plan-check.mjs`
- `git -c core.fsmonitor=false diff --check`
- `node tests/kao/test_kao_render.js`
- `node tests/kao/test_kao_requirements.js`
- `node tests/kao/test_kao_privacy.js`
- `node .claude/skills/run-seyma/driver.mjs`
- `node .claude/skills/run-seyma/zikr-harness.mjs`
- `node tests/app/test_state_rebind_boundary.js`
- `node tools/shell-inventory.mjs --gate`

**Bitti sayılır:** Bir tam oturum iki görev türüyle akıyor; undo/autoplay/rozet fixture'ları PASS; görev geçişi ölçümü <50 ms evidence'ta.

**Kanıt:** `evidence/KAO-11/EVIDENCE.json` + `HANDOFF.md` (S6); commit konusu `KAO-11: …` (S7); STATE/ledger (S8).

---

## KAO-12 — E2 gramer görevleri

**Yeni oturuma yapıştır:**
```text
/Users/m_ras/Desktop/seyma reposunda kuran-ogreniyorum/UYGULAMA-PROMPTLARI.md ortak sözleşmesine (§0–§1) göre yalnız KAO-12 promptunu uygula. Önce §0 komutlarını ve `node kuran-ogreniyorum/tools/kao-plan-check.mjs --card KAO-12` çıktısını oku; tüm planı yükleme. Bu mesaj KAO-12 için uygulama yetkisidir; yetkiyi tekrar sorma. Push/merge/tag/deploy yetkisi değildir.
```

**Dalga:** 3 · **Bağımlılık:** KAO-11 · **Gereksinimler:** —

**Amaç:** E2 gramer görevleri: ek çöz, çekim tablosu, kök bul, kalıp eşle (çip tabanlı, klavyesiz).

**Oku (yalnız bunlar; yollar `kuran-ogreniyorum/` göreli, repo dosyaları kökten):**
- 02 §2.3 tablo
- 03 §3–6 (G1–G24)
- `app/content/quranGrammarV1.js` şablon alanları

**İzinli dosyalar (STATE ile birebir):**
- `app/core/quranLearn.js`
- `app/kao.css`
- `app.js`
- `tests/kao/test_kao_render.js`
- `tests/kao/test_kao_queue.js`
- `kuran-ogreniyorum/evidence/KAO-12/**`
- `kuran-ogreniyorum/KAO-STATE.json`
- `kuran-ogreniyorum/.anti-amnesia/CURRENT-STATE.md`
- `kuran-ogreniyorum/.anti-amnesia/LEDGER.md`

**Adımlar:**
1. Görev üreticiye 4 tür; şablonlar `QuranGrammarV1.templates`'tan; çipler `<button>` ≥44 px; doğru/yanlış aria-live.
2. Hata sınıfı: ek→`affix`, kök→`root`, kural→`rule` (`errors` sayaçları).
3. Render + queue fixture'larına tür kapsamı.

**Kontroller (hepsi exit 0; STATE ile birebir):**
- `node --check <değişen her .js/.mjs>`
- `node kuran-ogreniyorum/tools/kao-plan-check.mjs`
- `git -c core.fsmonitor=false diff --check`
- `node tests/kao/test_kao_render.js`
- `node tests/kao/test_kao_queue.js`
- `node .claude/skills/run-seyma/driver.mjs`
- `node .claude/skills/run-seyma/zikr-harness.mjs`
- `node tests/app/test_state_rebind_boundary.js`
- `node tools/shell-inventory.mjs --gate`

**Bitti sayılır:** Dört gramer türü oturumda görünüyor; fixture'lar PASS.

**Kanıt:** `evidence/KAO-12/EVIDENCE.json` + `HANDOFF.md` (S6); commit konusu `KAO-12: …` (S7); STATE/ledger (S8).

---

## KAO-13 — E2 parça görevleri + E3 Done + kalibrasyon kaydı

**Yeni oturuma yapıştır:**
```text
/Users/m_ras/Desktop/seyma reposunda kuran-ogreniyorum/UYGULAMA-PROMPTLARI.md ortak sözleşmesine (§0–§1) göre yalnız KAO-13 promptunu uygula. Önce §0 komutlarını ve `node kuran-ogreniyorum/tools/kao-plan-check.mjs --card KAO-13` çıktısını oku; tüm planı yükleme. Bu mesaj KAO-13 için uygulama yetkisidir; yetkiyi tekrar sorma. Push/merge/tag/deploy yetkisi değildir.
```

**Dalga:** 3 · **Bağımlılık:** KAO-12 · **Gereksinimler:** R-A3, R-A7, R-B4

**Amaç:** E2 parça görevleri (kelime dizme, parça çevir) + E3 Done (tek sayı) + kalibrasyon kaydı + 'sıra' hata sınıfı.

**Oku (yalnız bunlar; yollar `kuran-ogreniyorum/` göreli, repo dosyaları kökten):**
- 12 R-A3, R-A7, R-B4
- 04 §2 E3

**İzinli dosyalar (STATE ile birebir):**
- `app/core/quranLearn.js`
- `app/kao.css`
- `app.js`
- `tests/kao/test_kao_render.js`
- `tests/kao/test_kao_requirements.js`
- `kuran-ogreniyorum/evidence/KAO-13/**`
- `kuran-ogreniyorum/KAO-STATE.json`
- `kuran-ogreniyorum/.anti-amnesia/CURRENT-STATE.md`
- `kuran-ogreniyorum/.anti-amnesia/LEDGER.md`

**Adımlar:**
1. Kelime dizme: 4–6 çip; SOV sırasıyla dizme hatası `errors.order` (G0.5 ipucu).
2. E3: 'Bugün N kelime daha kalıcı oldu' (s≥21 eşiğini bu oturumda geçen kart sayısı); 'Bugün yeter' / '5 dakika daha'; 'puan'/'XP' dizgisi yok.
3. `daily[date].calib += {pred: predictedR, ok, n}` her cevapta.
4. requirements fixture'ına R-B4 dizgi kontrolü ve R-A3 alan kontrolü.

**Kontroller (hepsi exit 0; STATE ile birebir):**
- `node --check <değişen her .js/.mjs>`
- `node kuran-ogreniyorum/tools/kao-plan-check.mjs`
- `git -c core.fsmonitor=false diff --check`
- `node tests/kao/test_kao_render.js`
- `node tests/kao/test_kao_requirements.js`
- `node .claude/skills/run-seyma/driver.mjs`
- `node .claude/skills/run-seyma/zikr-harness.mjs`
- `node tests/app/test_state_rebind_boundary.js`
- `node tools/shell-inventory.mjs --gate`

**Bitti sayılır:** Tam oturum E1→E2→E3 akıyor; kalibrasyon alanı doluyor; fixture PASS.

**Kanıt:** `evidence/KAO-13/EVIDENCE.json` + `HANDOFF.md` (S6); commit konusu `KAO-13: …` (S7); STATE/ledger (S8).

---

## KAO-14 — E4 Üniteler + E5 Kelime (üç dokunuş, kök ağacı, bayrak)

**Yeni oturuma yapıştır:**
```text
/Users/m_ras/Desktop/seyma reposunda kuran-ogreniyorum/UYGULAMA-PROMPTLARI.md ortak sözleşmesine (§0–§1) göre yalnız KAO-14 promptunu uygula. Önce §0 komutlarını ve `node kuran-ogreniyorum/tools/kao-plan-check.mjs --card KAO-14` çıktısını oku; tüm planı yükleme. Bu mesaj KAO-14 için uygulama yetkisidir; yetkiyi tekrar sorma. Push/merge/tag/deploy yetkisi değildir.
```

**Dalga:** 3 · **Bağımlılık:** KAO-13 · **Gereksinimler:** R-A8, R-B3, R-B7, R-C1

**Amaç:** E4 Üniteler + E5 Kelime detayı: üç dokunuş katmanı, kök ağacı + Türkçe akrabalar (kalıp etiketli), kognat notu, 3 örnek, sonraki tekrar; içerik hata bildirimi.

**Oku (yalnız bunlar; yollar `kuran-ogreniyorum/` göreli, repo dosyaları kökten):**
- 04 §2 E4–E5, §3 wireframe E5, §3b
- 12 R-A8, R-B3, R-B7, R-C1

**İzinli dosyalar (STATE ile birebir):**
- `app/core/quranLearn.js`
- `app/kao.css`
- `app.js`
- `tests/kao/test_kao_render.js`
- `tests/kao/test_kao_requirements.js`
- `tests/app/test_fx2_tab_transition.js`
- `tests/app/test_fx2_overlay_motion.js`
- `tests/app/test_fx2_touch_coverage.js`
- `kuran-ogreniyorum/UYGULAMA-PROMPTLARI.md`
- `kuran-ogreniyorum/evidence/KAO-14/**`
- `kuran-ogreniyorum/KAO-STATE.json`
- `kuran-ogreniyorum/.anti-amnesia/CURRENT-STATE.md`
- `kuran-ogreniyorum/.anti-amnesia/LEDGER.md`

**Adımlar:**
1. `App.kaoOpenWord(lemmaId)`, `App.kaoWordLayer(n)`: ilk render yalnız katman 1; katman 2 kök ağacı (`QuranLexiconV1.roots[root].trDerivatives[{tr,pattern}]`); katman 3 örnekler.
2. `App.kaoFlag(cardId, kind)`: `cards[id].flagged={at,kind}`; toast 'Teşekkürler, sonraki içerik sürümünde bakılacak'.
3. E4: ünite listesi, ilerleme, kilit yok, sıra önerisi; Kur'an Yolculuğu 'izlendi' rozeti **yalnız okuma** (`data.quranJourney.requests[sid].status`).
4. Fixture: katman kuralı, flagged alanı, rozet.

**Kontroller (hepsi exit 0; STATE ile birebir):**
- `node --check <değişen her .js/.mjs>`
- `node kuran-ogreniyorum/tools/kao-plan-check.mjs`
- `git -c core.fsmonitor=false diff --check`
- `node tests/kao/test_kao_render.js`
- `node tests/kao/test_kao_requirements.js`
- `node tests/app/test_fx2_tab_transition.js`
- `node tests/app/test_fx2_overlay_motion.js`
- `node tests/app/test_fx2_touch_coverage.js`
- `node .claude/skills/run-seyma/driver.mjs`
- `node .claude/skills/run-seyma/zikr-harness.mjs`
- `node tests/app/test_state_rebind_boundary.js`
- `node tools/shell-inventory.mjs --gate`

**Bitti sayılır:** E4/E5 çalışıyor; üç dokunuş ve bayrak fixture'ları PASS.

**Kanıt:** `evidence/KAO-14/EVIDENCE.json` + `HANDOFF.md` (S6); commit konusu `KAO-14: …` (S7); STATE/ledger (S8).

---

## KAO-15 — Seviye 0 kapısı (harf–ses–hareke) + renkli hareke

**Yeni oturuma yapıştır:**
```text
/Users/m_ras/Desktop/seyma reposunda kuran-ogreniyorum/UYGULAMA-PROMPTLARI.md ortak sözleşmesine (§0–§1) göre yalnız KAO-15 promptunu uygula. Önce §0 komutlarını ve `node kuran-ogreniyorum/tools/kao-plan-check.mjs --card KAO-15` çıktısını oku; tüm planı yükleme. Bu mesaj KAO-15 için uygulama yetkisidir; yetkiyi tekrar sorma. Push/merge/tag/deploy yetkisi değildir.
```

**Dalga:** 3 · **Bağımlılık:** KAO-14 · **Gereksinimler:** R-A9

**Amaç:** Seviye 0 harf–ses–hareke kapısı: iki parçalı giriş kontrolü (ses yoksa (b) ertelenir), 12 mini ders, renkli hareke ayarı, okunabilirlik ayarları.

**Oku (yalnız bunlar; yollar `kuran-ogreniyorum/` göreli, repo dosyaları kökten):**
- 03 §2
- 10 §2–4
- 12 R-A9

**İzinli dosyalar (STATE ile birebir):**
- `app/core/quranLearn.js`
- `app/kao.css`
- `app.js`
- `tests/kao/test_kao_render.js`
- `tests/app/test_fx2_tab_transition.js`
- `tests/app/test_fx2_overlay_motion.js`
- `tests/app/test_fx2_touch_coverage.js`
- `kuran-ogreniyorum/UYGULAMA-PROMPTLARI.md`
- `kuran-ogreniyorum/evidence/KAO-15/**`
- `kuran-ogreniyorum/KAO-STATE.json`
- `kuran-ogreniyorum/.anti-amnesia/CURRENT-STATE.md`
- `kuran-ogreniyorum/.anti-amnesia/LEDGER.md`

**Adımlar:**
1. `App.kaoGate()`: (a) 20 kelime okunuş seçimi, (b) 12 minimal çift (ses varsa); eşikler 03 §2; `gate{passed,skipped,score,at}`.
2. 12 ders: içerik `QuranPhonicsV1` + sözlük; ders başına en çok 3 yeni ses.
3. `readability.coloredHarakat` (Seviye 0–1 varsayılan açık): hareke `<span class="kao-h-fatha|kesra|damma">` ile sarılır — sarma aracı **saf fonksiyon**, harf değiştirmez (fixture: sarma öncesi/sonrası metin eşit).
4. Satır aralığı / kelime boşluğu ayarları CSS değişkeniyle (`--kao-ar-lh`, `--kao-ar-ws`).

**Kontroller (hepsi exit 0; STATE ile birebir):**
- `node --check <değişen her .js/.mjs>`
- `node kuran-ogreniyorum/tools/kao-plan-check.mjs`
- `git -c core.fsmonitor=false diff --check`
- `node tests/kao/test_kao_render.js`
- `node tests/app/test_fx2_tab_transition.js`
- `node tests/app/test_fx2_overlay_motion.js`
- `node tests/app/test_fx2_touch_coverage.js`
- `node .claude/skills/run-seyma/driver.mjs`
- `node .claude/skills/run-seyma/zikr-harness.mjs`
- `node tests/app/test_state_rebind_boundary.js`
- `node tools/shell-inventory.mjs --gate`

**Bitti sayılır:** Kapı çalışıyor; renkli hareke sarma metni değiştirmiyor (fixture); ayarlar uygulanıyor.

**Kanıt:** `evidence/KAO-15/EVIDENCE.json` + `HANDOFF.md` (S6); commit konusu `KAO-15: …` (S7); STATE/ledger (S8).

---

## KAO-16 — E6 Okuyucu (20 kısa sûre) + vakıf noktaları + gecikmeli test kaydı

**Yeni oturuma yapıştır:**
```text
/Users/m_ras/Desktop/seyma reposunda kuran-ogreniyorum/UYGULAMA-PROMPTLARI.md ortak sözleşmesine (§0–§1) göre yalnız KAO-16 promptunu uygula. Önce §0 komutlarını ve `node kuran-ogreniyorum/tools/kao-plan-check.mjs --card KAO-16` çıktısını oku; tüm planı yükleme. Bu mesaj KAO-16 için uygulama yetkisidir; yetkiyi tekrar sorma. Push/merge/tag/deploy yetkisi değildir.
```

**Dalga:** 3 · **Bağımlılık:** KAO-15 · **Gereksinimler:** R-A6, R-C6

**Amaç:** E6 okuyucu (20 kısa sûre): kelime kelime dokunma, bilinen/bilinmeyen, vakıf noktaları, 'anladım', 7 gün sonra gecikmeli test kaydı.

**Oku (yalnız bunlar; yollar `kuran-ogreniyorum/` göreli, repo dosyaları kökten):**
- 04 §2 E6, wireframe
- 12 R-A6, R-C6
- 03 §7

**İzinli dosyalar (STATE ile birebir):**
- `app/core/quranLearn.js`
- `app/kao.css`
- `app.js`
- `tests/kao/test_kao_render.js`
- `tests/kao/test_kao_requirements.js`
- `kuran-ogreniyorum/evidence/KAO-16/**`
- `kuran-ogreniyorum/KAO-STATE.json`
- `kuran-ogreniyorum/.anti-amnesia/CURRENT-STATE.md`
- `kuran-ogreniyorum/.anti-amnesia/LEDGER.md`

**Adımlar:**
1. `App.kaoOpenSurah(sid)`, `App.kaoRevealWord(i)`, `App.kaoMarkUnderstood()` → `surahs[sid].understoodAt`, `delayedTestAt = +7 gün`.
2. Vakıf: `.kao-waqf` düğmeleri, dokununca açıklama (10 §4 madde 5).
3. Gecikmeli test: vadesi gelince kuyruğa 5 parça-çevir görevi; `delayedScore`; ≥4/5 → 'anlaşıldı' kesinleşir.
4. Bilinmeyen kelimeye dokunma → 'yarın tekrar' kuyruğuna (yeni kart bütçesi içinde).

**Kontroller (hepsi exit 0; STATE ile birebir):**
- `node --check <değişen her .js/.mjs>`
- `node kuran-ogreniyorum/tools/kao-plan-check.mjs`
- `git -c core.fsmonitor=false diff --check`
- `node tests/kao/test_kao_render.js`
- `node tests/kao/test_kao_requirements.js`
- `node .claude/skills/run-seyma/driver.mjs`
- `node .claude/skills/run-seyma/zikr-harness.mjs`
- `node tests/app/test_state_rebind_boundary.js`
- `node tools/shell-inventory.mjs --gate`

**Bitti sayılır:** Okuyucu 20 sûrede çalışıyor; vakıf ve gecikmeli test fixture'ları PASS.

**Kanıt:** `evidence/KAO-16/EVIDENCE.json` + `HANDOFF.md` (S6); commit konusu `KAO-16: …` (S7); STATE/ledger (S8).

---

## KAO-17 — E7 Ayarlar + ses stili + soldurma + CSV

**Yeni oturuma yapıştır:**
```text
/Users/m_ras/Desktop/seyma reposunda kuran-ogreniyorum/UYGULAMA-PROMPTLARI.md ortak sözleşmesine (§0–§1) göre yalnız KAO-17 promptunu uygula. Önce §0 komutlarını ve `node kuran-ogreniyorum/tools/kao-plan-check.mjs --card KAO-17` çıktısını oku; tüm planı yükleme. Bu mesaj KAO-17 için uygulama yetkisidir; yetkiyi tekrar sorma. Push/merge/tag/deploy yetkisi değildir.
```

**Dalga:** 3 · **Bağımlılık:** KAO-16 · **Gereksinimler:** R-A4, R-A9, R-B5, R-B8, R-C4

**Amaç:** E7 Ayarlar: günlük yeni, ses stili, hareke/soldurma, transliterasyon katmanı, okunabilirlik, Seviye 0'ı tekrar aç, CSV dışa aktarma.

**Oku (yalnız bunlar; yollar `kuran-ogreniyorum/` göreli, repo dosyaları kökten):**
- 04 §2 E7, §3b
- 12 R-A4, R-A9, R-B5, R-B8, R-C4
- `tests/app/test_premium_*.js` (sessiz saat davranışı)

**İzinli dosyalar (STATE ile birebir):**
- `app/core/quranLearn.js`
- `app/kao.css`
- `app.js`
- `tests/kao/test_kao_render.js`
- `tests/kao/test_kao_requirements.js`
- `tests/kao/test_kao_privacy.js`
- `kuran-ogreniyorum/evidence/KAO-17/**`
- `kuran-ogreniyorum/KAO-STATE.json`
- `kuran-ogreniyorum/.anti-amnesia/CURRENT-STATE.md`
- `kuran-ogreniyorum/.anti-amnesia/LEDGER.md`

**Adımlar:**
1. `App.kaoSetDailyNew(n)`, `kaoSetAudioStyle`, `kaoToggleHarakat`, `kaoToggleFade`, `kaoSetTranslit('tr'|'dia')`, `kaoSetReadability`, `kaoReopenGate`.
2. Soldurma: `.kao-fade` `--dur-5` geçişi; reduced-motion + uygulama hareket ayarı → anında.
3. `App.kaoExportCsv()`: Blob + `<a download>`; sütun `ar,tr,translit,root,tags`; ağ yok.
4. Fixture: CSV başlık/satır; reduced-motion dalı; privacy (Blob URL revoke).

**Kontroller (hepsi exit 0; STATE ile birebir):**
- `node --check <değişen her .js/.mjs>`
- `node kuran-ogreniyorum/tools/kao-plan-check.mjs`
- `git -c core.fsmonitor=false diff --check`
- `node tests/kao/test_kao_requirements.js`
- `node tests/kao/test_kao_privacy.js`
- `for f in tests/app/test_premium_*.js; do node $f; done`
- `node .claude/skills/run-seyma/driver.mjs`
- `node .claude/skills/run-seyma/zikr-harness.mjs`
- `node tests/app/test_state_rebind_boundary.js`
- `node tools/shell-inventory.mjs --gate`

**Bitti sayılır:** Ayarlar kalıcı (`data.quranLearn.settings/readability`); CSV çalışıyor; premium fixture'lar yeşil.

**Kanıt:** `evidence/KAO-17/EVIDENCE.json` + `HANDOFF.md` (S6); commit konusu `KAO-17: …` (S7); STATE/ledger (S8).

---

## KAO-26 — E8 Telaffuz stüdyosu

**Yeni oturuma yapıştır:**
```text
/Users/m_ras/Desktop/seyma reposunda kuran-ogreniyorum/UYGULAMA-PROMPTLARI.md ortak sözleşmesine (§0–§1) göre yalnız KAO-26 promptunu uygula. Önce §0 komutlarını ve `node kuran-ogreniyorum/tools/kao-plan-check.mjs --card KAO-26` çıktısını oku; tüm planı yükleme. Bu mesaj KAO-26 için uygulama yetkisidir; yetkiyi tekrar sorma. Push/merge/tag/deploy yetkisi değildir.
```

**Dalga:** 3 · **Bağımlılık:** KAO-17 · **Gereksinimler:** R-B6, R-C2

**Amaç:** E8 Telaffuz stüdyosu: harf kovaları, mahreç SVG, minimal çift dinleme görevleri (çok stil), FSRS ses kartları, hata→kelime bağı.

**Oku (yalnız bunlar; yollar `kuran-ogreniyorum/` göreli, repo dosyaları kökten):**
- 10 §5–6, §9
- 12 R-B6, R-C2
- `assets/kao/svg/`

**İzinli dosyalar (STATE ile birebir):**
- `app/core/quranLearn.js`
- `app/kao.css`
- `app.js`
- `tests/kao/test_kao_render.js`
- `tests/kao/test_kao_phonics_contract.js`
- `kuran-ogreniyorum/evidence/KAO-26/**`
- `kuran-ogreniyorum/KAO-STATE.json`
- `kuran-ogreniyorum/.anti-amnesia/CURRENT-STATE.md`
- `kuran-ogreniyorum/.anti-amnesia/LEDGER.md`

**Adımlar:**
1. `App.kaoOpenPhonics(letterId?)`; görevler: Hangi harf? / Hangi kelime? / Uzun mu kısa mı? / Şedde var mı? / Dinle-diz / Vakıf-vasıl; ses yoksa yalnız görsel dersler + 'ses yüklenemedi' bilgisi (R-C2).
2. `phonics` kartları FSRS ile; yanlış duyulan harfin geçtiği kelimeler 'dikkat' listesi.
3. SVG inline `currentColor`; tema otomatik.

**Kontroller (hepsi exit 0; STATE ile birebir):**
- `node --check <değişen her .js/.mjs>`
- `node kuran-ogreniyorum/tools/kao-plan-check.mjs`
- `git -c core.fsmonitor=false diff --check`
- `node tests/kao/test_kao_render.js`
- `node tests/kao/test_kao_phonics_contract.js`
- `node .claude/skills/run-seyma/driver.mjs`
- `node .claude/skills/run-seyma/zikr-harness.mjs`
- `node tests/app/test_state_rebind_boundary.js`
- `node tools/shell-inventory.mjs --gate`

**Bitti sayılır:** Stüdyo çalışıyor; sessiz modda da biter; fixture PASS.

**Kanıt:** `evidence/KAO-26/EVIDENCE.json` + `HANDOFF.md` (S6); commit konusu `KAO-26: …` (S7); STATE/ledger (S8).

---

## KAO-27 — Gölgeleme (bellek-içi kayıt)

**Yeni oturuma yapıştır:**
```text
/Users/m_ras/Desktop/seyma reposunda kuran-ogreniyorum/UYGULAMA-PROMPTLARI.md ortak sözleşmesine (§0–§1) göre yalnız KAO-27 promptunu uygula. Önce §0 komutlarını ve `node kuran-ogreniyorum/tools/kao-plan-check.mjs --card KAO-27` çıktısını oku; tüm planı yükleme. Bu mesaj KAO-27 için uygulama yetkisidir; yetkiyi tekrar sorma. Push/merge/tag/deploy yetkisi değildir.
```

**Dalga:** 3 · **Bağımlılık:** KAO-26 · **Gereksinimler:** —
**KAPI:** D-10 kullanıcı onayı — `gateApproval` STATE'te yoksa `blocked` ve dur.

**Amaç:** Gölgeleme: model 2× → bellek-içi kayıt (≤10 s) → dinle → 'Yakın / Tekrar' öz-değerlendirme; hiçbir kalıcı yol yok.

**Oku (yalnız bunlar; yollar `kuran-ogreniyorum/` göreli, repo dosyaları kökten):**
- 10 §5 (üretim), 05 §4 (mikrofon kuralı)
- 12 R-C2
- KAO-STATE decisions D-10 (**gateApproval şart**)

**İzinli dosyalar (STATE ile birebir):**
- `app/core/quranLearn.js`
- `app/kao.css`
- `app.js`
- `tests/kao/test_kao_privacy.js`
- `kuran-ogreniyorum/evidence/KAO-27/**`
- `kuran-ogreniyorum/KAO-STATE.json`
- `kuran-ogreniyorum/.anti-amnesia/CURRENT-STATE.md`
- `kuran-ogreniyorum/.anti-amnesia/LEDGER.md`

**Adımlar:**
1. `gateApproval` yoksa `blocked` + ledger.
2. `App.kaoRecordStart/Stop/Play/Discard`: `MediaRecorder` → `Blob` → `URL.createObjectURL`; overlay kapanışında `revokeObjectURL`; `data`/`localStorage`/sync'e **hiç** yazma; izin metni Türkçe ve neden açıklanır; ayar varsayılan **kapalı**.
3. `test_kao_privacy.js`: kaynak taraması (MediaRecorder bloğunda `save(`/`SeymaSave`/`localStorage` yok; Blob yalnız `ui`).

**Kontroller (hepsi exit 0; STATE ile birebir):**
- `node --check <değişen her .js/.mjs>`
- `node kuran-ogreniyorum/tools/kao-plan-check.mjs`
- `git -c core.fsmonitor=false diff --check`
- `node tests/kao/test_kao_privacy.js`
- `node .claude/skills/run-seyma/driver.mjs`
- `node .claude/skills/run-seyma/zikr-harness.mjs`
- `node tests/app/test_state_rebind_boundary.js`
- `node tools/shell-inventory.mjs --gate`

**Bitti sayılır:** Gölgeleme çalışıyor; privacy fixture PASS; ayar kapalıyken mikrofon API'si hiç çağrılmıyor.

**Kanıt:** `evidence/KAO-27/EVIDENCE.json` + `HANDOFF.md` (S6); commit konusu `KAO-27: …` (S7); STATE/ledger (S8).

---

## KAO-28 — E9 Anlayabildiğin âyet

**Yeni oturuma yapıştır:**
```text
/Users/m_ras/Desktop/seyma reposunda kuran-ogreniyorum/UYGULAMA-PROMPTLARI.md ortak sözleşmesine (§0–§1) göre yalnız KAO-28 promptunu uygula. Önce §0 komutlarını ve `node kuran-ogreniyorum/tools/kao-plan-check.mjs --card KAO-28` çıktısını oku; tüm planı yükleme. Bu mesaj KAO-28 için uygulama yetkisidir; yetkiyi tekrar sorma. Push/merge/tag/deploy yetkisi değildir.
```

**Dalga:** 3 · **Bağımlılık:** KAO-27 · **Gereksinimler:** —

**Amaç:** E9 'Bugün anlayabildiğin âyet': kelimelerinin ≥%95'i bilinen bir âyeti deterministik seçmek; kelime kelime ses + Türkçe; hub kartında satır.

**Oku (yalnız bunlar; yollar `kuran-ogreniyorum/` göreli, repo dosyaları kökten):**
- 02 §5.1
- 04 §2 E9
- 12 (R-C2 ses yoksa metin)

**İzinli dosyalar (STATE ile birebir):**
- `app/core/quranLearn.js`
- `app/kao.css`
- `app.js`
- `tests/kao/test_kao_queue.js`
- `tests/kao/test_kao_lexicon_coverage.js`
- `kuran-ogreniyorum/evidence/KAO-28/**`
- `kuran-ogreniyorum/KAO-STATE.json`
- `kuran-ogreniyorum/.anti-amnesia/CURRENT-STATE.md`
- `kuran-ogreniyorum/.anti-amnesia/LEDGER.md`

**Adımlar:**
1. `kaoPickAyah(d, dateSeed)`: `QuranShortSurahsV1` âyetleri (Seviye 6 yok) içinde kapsam ≥0,95; görülmemiş öncelikli; `ayahs.understood` listesine 'anladım' ile (en çok 400).
2. Kapsam hesabı ortak fonksiyon (`kaoCoverage`) — E1 ile aynı.

**Kontroller (hepsi exit 0; STATE ile birebir):**
- `node --check <değişen her .js/.mjs>`
- `node kuran-ogreniyorum/tools/kao-plan-check.mjs`
- `git -c core.fsmonitor=false diff --check`
- `node tests/kao/test_kao_queue.js`
- `node tests/kao/test_kao_lexicon_coverage.js`
- `node .claude/skills/run-seyma/driver.mjs`
- `node .claude/skills/run-seyma/zikr-harness.mjs`
- `node tests/app/test_state_rebind_boundary.js`
- `node tools/shell-inventory.mjs --gate`

**Bitti sayılır:** Günlük âyet seçiliyor; seçici fixture PASS; anlaşılan âyet sayacı E1'de.

**Kanıt:** `evidence/KAO-28/EVIDENCE.json` + `HANDOFF.md` (S6); commit konusu `KAO-28: …` (S7); STATE/ledger (S8).

---

## KAO-28b — E10 Mushaf ısı haritası + gecikmeli sûre testi

**Yeni oturuma yapıştır:**
```text
/Users/m_ras/Desktop/seyma reposunda kuran-ogreniyorum/UYGULAMA-PROMPTLARI.md ortak sözleşmesine (§0–§1) göre yalnız KAO-28b promptunu uygula. Önce §0 komutlarını ve `node kuran-ogreniyorum/tools/kao-plan-check.mjs --card KAO-28b` çıktısını oku; tüm planı yükleme. Bu mesaj KAO-28b için uygulama yetkisidir; yetkiyi tekrar sorma. Push/merge/tag/deploy yetkisi değildir.
```

**Dalga:** 3 · **Bağımlılık:** KAO-28 · **Gereksinimler:** R-B1, R-C6

**Amaç:** E10 Mushaf ısı haritası (114 sûre × anlaşılan âyet oranı) + gecikmeli sûre testinin haritaya yansıması.

**Oku (yalnız bunlar; yollar `kuran-ogreniyorum/` göreli, repo dosyaları kökten):**
- 12 R-B1, R-C6
- `app/core/saygi.js` `faithAnnualHeatmapHTML` (görsel dil; **yalnız okuma**)

**İzinli dosyalar (STATE ile birebir):**
- `app/core/quranLearn.js`
- `app/kao.css`
- `app.js`
- `tests/kao/test_kao_render.js`
- `tests/kao/test_kao_requirements.js`
- `kuran-ogreniyorum/evidence/KAO-28b/**`
- `kuran-ogreniyorum/KAO-STATE.json`
- `kuran-ogreniyorum/.anti-amnesia/CURRENT-STATE.md`
- `kuran-ogreniyorum/.anti-amnesia/LEDGER.md`

**Adımlar:**
1. `App.kaoOpenMap()`: 114 hücre, `aria-label` 'Sûre adı: %n anlaşıldı', eşdeğer metin listesi; renk + sayı.
2. Veri yoksa hücre boş; `delayedScore ≥4` olan sûreler koyu.

**Kontroller (hepsi exit 0; STATE ile birebir):**
- `node --check <değişen her .js/.mjs>`
- `node kuran-ogreniyorum/tools/kao-plan-check.mjs`
- `git -c core.fsmonitor=false diff --check`
- `node tests/kao/test_kao_render.js`
- `node tests/kao/test_kao_requirements.js`
- `node .claude/skills/run-seyma/driver.mjs`
- `node .claude/skills/run-seyma/zikr-harness.mjs`
- `node tests/app/test_state_rebind_boundary.js`
- `node tools/shell-inventory.mjs --gate`

**Bitti sayılır:** Harita render fixture PASS (114 hücre, aria).

**Kanıt:** `evidence/KAO-28b/EVIDENCE.json` + `HANDOFF.md` (S6); commit konusu `KAO-28b: …` (S7); STATE/ledger (S8).

---

## KAO-16b — E11 Namazda ne diyorum

**Yeni oturuma yapıştır:**
```text
/Users/m_ras/Desktop/seyma reposunda kuran-ogreniyorum/UYGULAMA-PROMPTLARI.md ortak sözleşmesine (§0–§1) göre yalnız KAO-16b promptunu uygula. Önce §0 komutlarını ve `node kuran-ogreniyorum/tools/kao-plan-check.mjs --card KAO-16b` çıktısını oku; tüm planı yükleme. Bu mesaj KAO-16b için uygulama yetkisidir; yetkiyi tekrar sorma. Push/merge/tag/deploy yetkisi değildir.
```

**Dalga:** 3 · **Bağımlılık:** KAO-28b · **Gereksinimler:** R-B2

**Amaç:** E11 'Namazda ne diyorum': rekât sırası; bilinen açık, bilinmeyen kapalı; kelimeyi öğren köprüsü; Seviye 1 bitiş ekranı.

**Oku (yalnız bunlar; yollar `kuran-ogreniyorum/` göreli, repo dosyaları kökten):**
- 12 R-B2
- `app/content/quranShortSurahsV1.js` `prayerTexts`

**İzinli dosyalar (STATE ile birebir):**
- `app/core/quranLearn.js`
- `app/kao.css`
- `app.js`
- `tests/kao/test_kao_render.js`
- `kuran-ogreniyorum/evidence/KAO-16b/**`
- `kuran-ogreniyorum/KAO-STATE.json`
- `kuran-ogreniyorum/.anti-amnesia/CURRENT-STATE.md`
- `kuran-ogreniyorum/.anti-amnesia/LEDGER.md`

**Adımlar:**
1. `App.kaoOpenPrayer()`; her satır `prayerTexts` sırasında; kapalı kelimeye dokunma → kuyruğa.
2. Ünite 1–3 kartları review olduğunda E3'ten otomatik geçiş önerisi (tek satır).

**Kontroller (hepsi exit 0; STATE ile birebir):**
- `node --check <değişen her .js/.mjs>`
- `node kuran-ogreniyorum/tools/kao-plan-check.mjs`
- `git -c core.fsmonitor=false diff --check`
- `node tests/kao/test_kao_render.js`
- `node .claude/skills/run-seyma/driver.mjs`
- `node .claude/skills/run-seyma/zikr-harness.mjs`
- `node tests/app/test_state_rebind_boundary.js`
- `node tools/shell-inventory.mjs --gate`

**Bitti sayılır:** E11 çalışıyor; render fixture PASS.

**Kanıt:** `evidence/KAO-16b/EVIDENCE.json` + `HANDOFF.md` (S6); commit konusu `KAO-16b: …` (S7); STATE/ledger (S8).

---

## KAO-18 — Kontrast ve erişilebilirlik ölçümü

**Yeni oturuma yapıştır:**
```text
/Users/m_ras/Desktop/seyma reposunda kuran-ogreniyorum/UYGULAMA-PROMPTLARI.md ortak sözleşmesine (§0–§1) göre yalnız KAO-18 promptunu uygula. Önce §0 komutlarını ve `node kuran-ogreniyorum/tools/kao-plan-check.mjs --card KAO-18` çıktısını oku; tüm planı yükleme. Bu mesaj KAO-18 için uygulama yetkisidir; yetkiyi tekrar sorma. Push/merge/tag/deploy yetkisi değildir.
```

**Dalga:** 4 · **Bağımlılık:** KAO-16b · **Gereksinimler:** R-A9

**Amaç:** Kontrast ve erişilebilirlik ölçümü: KAO renk çiftleri, 3 hareke tonu × 2 tema, odak halkası, %200 metin/320 px reflow (headless).

**Oku (yalnız bunlar; yollar `kuran-ogreniyorum/` göreli, repo dosyaları kökten):**
- `docs/apple-design/verify-contrast.mjs` (kalıp)
- 04 §4 erişilebilirlik
- 08 kontrol listesi

**İzinli dosyalar (STATE ile birebir):**
- `kuran-ogreniyorum/tools/kao-verify-contrast.mjs`
- `app/kao.css`
- `tests/kao/test_kao_render.js`
- `kuran-ogreniyorum/evidence/KAO-18/**`
- `kuran-ogreniyorum/KAO-STATE.json`
- `kuran-ogreniyorum/.anti-amnesia/CURRENT-STATE.md`
- `kuran-ogreniyorum/.anti-amnesia/LEDGER.md`

**Adımlar:**
1. `kuran-ogreniyorum/tools/kao-verify-contrast.mjs`: `app/styles.css` tokenlarını + `app/kao.css` çiftlerini okur, WCAG oranlarını hesaplar; tablo evidence'a.
2. Geçmeyen çift varsa `app/kao.css`'te düzelt (token değeri **değiştirilmez**; başka token seç veya `color-mix`).
3. Render fixture'ına 44 px hedef ve odak halkası kontrolleri.

**Kontroller (hepsi exit 0; STATE ile birebir):**
- `node --check <değişen her .js/.mjs>`
- `node kuran-ogreniyorum/tools/kao-plan-check.mjs`
- `git -c core.fsmonitor=false diff --check`
- `node kuran-ogreniyorum/tools/kao-verify-contrast.mjs (tüm çiftler ≥4.5:1 metin / 3:1 UI, 3 hareke tonu × 2 tema)`

**Bitti sayılır:** Tüm çiftler ≥4.5:1 / 3:1; rapor evidence'ta.

**Kanıt:** `evidence/KAO-18/EVIDENCE.json` + `HANDOFF.md` (S6); commit konusu `KAO-18: …` (S7); STATE/ledger (S8).

---

## KAO-19 — Panel aynası (manifest + özet projeksiyon)

**Yeni oturuma yapıştır:**
```text
/Users/m_ras/Desktop/seyma reposunda kuran-ogreniyorum/UYGULAMA-PROMPTLARI.md ortak sözleşmesine (§0–§1) göre yalnız KAO-19 promptunu uygula. Önce §0 komutlarını ve `node kuran-ogreniyorum/tools/kao-plan-check.mjs --card KAO-19` çıktısını oku; tüm planı yükleme. Bu mesaj KAO-19 için uygulama yetkisidir; yetkiyi tekrar sorma. Push/merge/tag/deploy yetkisi değildir.
```

**Dalga:** 4 · **Bağımlılık:** KAO-18 · **Gereksinimler:** R-C1, R-C8

**Amaç:** Panel aynası: manifest satırı + özet projeksiyon (kapsam %, seri, bugün çalışıldı mı, en çok karıştırılan ses sınıfı, bayrak sayısı); kelime düzeyi yok.

**Oku (yalnız bunlar; yollar `kuran-ogreniyorum/` göreli, repo dosyaları kökten):**
- `panel/panelCoverageManifest.js` 85–110, 215–225, 595–605 (satır şeması, izinli yollar, projeksiyon)
- 12 R-C1, R-C8
- 05 §4

**İzinli dosyalar (STATE ile birebir):**
- `panel/panelCoverageManifest.js`
- `panel/panel.js`
- `tests/kao/test_kao_panel_projection.js`
- `tests/panel/test_panel_p1_projection.js`
- `kuran-ogreniyorum/evidence/KAO-19/**`
- `kuran-ogreniyorum/KAO-STATE.json`
- `kuran-ogreniyorum/.anti-amnesia/CURRENT-STATE.md`
- `kuran-ogreniyorum/.anti-amnesia/LEDGER.md`

**Adımlar:**
1. Manifest: `{path:"quranLearn",owner:"quranLearn",source:"state",privacy:"summary",mode:"summary",fallback:"latest"}` + izinli anahtar listesi.
2. `panel/panel.js`: küçük bento kartı (mevcut kart kalıbı); alan eksikken çökmez.
3. `test_kao_panel_projection.js` + mevcut panel/panel-v2 aileleri yeşil.

**Kontroller (hepsi exit 0; STATE ile birebir):**
- `node --check <değişen her .js/.mjs>`
- `node kuran-ogreniyorum/tools/kao-plan-check.mjs`
- `git -c core.fsmonitor=false diff --check`
- `node tests/kao/test_kao_panel_projection.js`
- `for f in tests/panel/test_panel_*.js; do node $f; done`
- `for f in tests/panel-v2/test_panel_v2_*.js; do node $f; done`

**Bitti sayılır:** Panel özet gösteriyor; izinli alan dışı anahtar yok (fixture).

**Kanıt:** `evidence/KAO-19/EVIDENCE.json` + `HANDOFF.md` (S6); commit konusu `KAO-19: …` (S7); STATE/ledger (S8).

---

## KAO-20 — Tam regresyon + kullanıcı görevleri + kalibrasyon raporu

**Yeni oturuma yapıştır:**
```text
/Users/m_ras/Desktop/seyma reposunda kuran-ogreniyorum/UYGULAMA-PROMPTLARI.md ortak sözleşmesine (§0–§1) göre yalnız KAO-20 promptunu uygula. Önce §0 komutlarını ve `node kuran-ogreniyorum/tools/kao-plan-check.mjs --card KAO-20` çıktısını oku; tüm planı yükleme. Bu mesaj KAO-20 için uygulama yetkisidir; yetkiyi tekrar sorma. Push/merge/tag/deploy yetkisi değildir.
```

**Dalga:** 4 · **Bağımlılık:** KAO-19 · **Gereksinimler:** R-A1, R-A3, R-C5, R-C9

**Amaç:** Tam regresyon + üç kullanıcı görevi headless senaryosu + kalibrasyon/tutunma raporu + performans ölçümü; `deliverables/KAO-REGRESYON.md`.

**Oku (yalnız bunlar; yollar `kuran-ogreniyorum/` göreli, repo dosyaları kökten):**
- 08 (tamamı)
- 12 R-A1, R-A3, R-C5, R-C9
- CLAUDE.md 'Verification' (aile komutları; fx-coverage M7 tavanı notu)

**İzinli dosyalar (STATE ile birebir):**
- `tests/kao/test_kao_user_tasks.js`
- `kuran-ogreniyorum/deliverables/KAO-REGRESYON.md`
- `kuran-ogreniyorum/evidence/KAO-20/**`
- `kuran-ogreniyorum/KAO-STATE.json`
- `kuran-ogreniyorum/.anti-amnesia/CURRENT-STATE.md`
- `kuran-ogreniyorum/.anti-amnesia/LEDGER.md`

**Adımlar:**
1. `tests/kao/test_kao_user_tasks.js`: (a) hub/ayar girişinden oturuma ≤3 adım, (b) kök ağacı 2 dokunuş, (c) `audio=false` tam oturum.
2. Tüm aileler: tests/kao, tests/app, tests/panel, tests/panel-v2, tests/quran, `node tests/reminders/run-reminder-smoke.mjs`, driver/zikr, rebind, shell-inventory `--gate`, `node tools/fx-coverage.mjs --gate` (M7 tavanı bilinir; `$?` boru sonrası okunmaz).
3. Sentetik 6 haftalık oturum simülasyonu ile kalibrasyon raporu (öngörü–gerçek, 10 R-bandı) ve gece tekrarı gözlemi.
4. Görev geçişi süresi ölçümü (VM'de `performance.now`) < 50 ms; içerik gzip toplamı ≤130 KB.
5. Rapor: her aile için komut/exit/sayı; bilinen sınırlar; cihaz kabulü **bekliyor** olarak.

**Kontroller (hepsi exit 0; STATE ile birebir):**
- `node --check <değişen her .js/.mjs>`
- `node kuran-ogreniyorum/tools/kao-plan-check.mjs`
- `git -c core.fsmonitor=false diff --check`
- `node tests/kao/test_kao_user_tasks.js`
- `for f in tests/kao/*.js; do node $f; done`
- `tüm mevcut aileler (tests/app, tests/panel, tests/panel-v2, tests/quran, reminders smoke)`
- `node .claude/skills/run-seyma/driver.mjs`
- `node .claude/skills/run-seyma/zikr-harness.mjs`
- `node tests/app/test_state_rebind_boundary.js`
- `node tools/shell-inventory.mjs --gate`

**Bitti sayılır:** Rapor yazıldı; tüm aileler yeşil (M7 tavanı belgeli); R-C9 headless kısmı PASS.

**Kanıt:** `evidence/KAO-20/EVIDENCE.json` + `HANDOFF.md` (S6); commit konusu `KAO-20: …` (S7); STATE/ledger (S8).

---

## KAO-21 — Hub kartı bileşimi + köprüler (IIP koordineli)

**Yeni oturuma yapıştır:**
```text
/Users/m_ras/Desktop/seyma reposunda kuran-ogreniyorum/UYGULAMA-PROMPTLARI.md ortak sözleşmesine (§0–§1) göre yalnız KAO-21 promptunu uygula. Önce §0 komutlarını ve `node kuran-ogreniyorum/tools/kao-plan-check.mjs --card KAO-21` çıktısını oku; tüm planı yükleme. Bu mesaj KAO-21 için uygulama yetkisidir; yetkiyi tekrar sorma. Push/merge/tag/deploy yetkisi değildir.
```

**Dalga:** 5 · **Bağımlılık:** KAO-20 · **Gereksinimler:** —
**KAPI:** IIP hub/nav main'de ya da IIP sahibi onayı; saygi.js'e yalnız 1 bileşim satırı + 1 dep satırı — `gateApproval` STATE'te yoksa `blocked` ve dur.

**Amaç:** Hub kartı bileşimi (tek satır) + köprüler; geçici Ayarlar girişini kaldırma. **IIP koordinasyon kapısı.**

**Oku (yalnız bunlar; yollar `kuran-ogreniyorum/` göreli, repo dosyaları kökten):**
- 11 §2, §4 (kart sözleşmesi ve zamanlama)
- `app/core/saygi.js` `saygiHTML` satırı ve `SAYGI_DEPENDENCIES` (güncel HEAD'de yeniden bul; satır numarası değişmiş olabilir)
- `archive/ilham-ibadet-premium-plan/IIP-STATE.json` yalnız `status`/`activeCard` alanları (IIP'nin saygi.js yazma penceresi açık mı)

**İzinli dosyalar (STATE ile birebir):**
- `app/core/saygi.js`
- `app.js`
- `app/core/settings.js`
- `app/core/quranLearn.js`
- `tests/kao/test_kao_independence.js`
- `tests/kao/test_kao_render.js`
- `kuran-ogreniyorum/evidence/KAO-21/**`
- `kuran-ogreniyorum/KAO-STATE.json`
- `kuran-ogreniyorum/.anti-amnesia/CURRENT-STATE.md`
- `kuran-ogreniyorum/.anti-amnesia/LEDGER.md`

**Adımlar:**
1. Kapı: IIP `saygi.js`'te aktif yazıyorsa (`activeCard` saygi.js dokunan bir kart) **dur**, `blocked` + ledger; ya IIP `main`'e girmiş ya IIP sahibi onayı `gateApproval`'da.
2. `saygi.js`: `SAYGI_DEPENDENCIES`'e `'kaoHubCardHTML'` (1 satır) ve `saygiHTML` bileşimine `+kaoHub()` (1 satır; `quranHub()` sonrası); `kaoHub` sarmalayıcı `quranHub` kalıbıyla (1 satır).
3. `app.js` saygi dep-bag'e `kaoHubCardHTML: function(){ return window.SeymaQuranLearn?window.SeymaQuranLearn.kaoHubCardHTML():''; }`.
4. `settings.js` geçici satırı kaldır; `settings.kaoVisible` ayarı E7'de.
5. Köprüler yalnız okuma: Kur'an Yolculuğu satırında 'kelimelerini öğren' (quran.js'e dokunmadan mümkün değilse **atla ve raporla** — QY sahipliği), Esmâ kök notu aynı kural.
6. `test_kao_independence.js`: `kaoHubCardHTML` yokken `saygiHTML` çıktısı bayt-eşit.

**Kontroller (hepsi exit 0; STATE ile birebir):**
- `node --check <değişen her .js/.mjs>`
- `node kuran-ogreniyorum/tools/kao-plan-check.mjs`
- `git -c core.fsmonitor=false diff --check`
- `node tests/kao/test_kao_independence.js`
- `node tests/kao/test_kao_render.js`
- `node .claude/skills/run-seyma/driver.mjs`
- `node .claude/skills/run-seyma/zikr-harness.mjs`
- `node tests/app/test_state_rebind_boundary.js`
- `node tools/shell-inventory.mjs --gate`

**Bitti sayılır:** Kart hub'da; saygi.js diff'i ≤3 satır; independence fixture PASS; driver/zikr PASS.

**Kanıt:** `evidence/KAO-21/EVIDENCE.json` + `HANDOFF.md` (S6); commit konusu `KAO-21: …` (S7); STATE/ledger (S8).

---

## KAO-22 — Kapanış belgesi

**Yeni oturuma yapıştır:**
```text
/Users/m_ras/Desktop/seyma reposunda kuran-ogreniyorum/UYGULAMA-PROMPTLARI.md ortak sözleşmesine (§0–§1) göre yalnız KAO-22 promptunu uygula. Önce §0 komutlarını ve `node kuran-ogreniyorum/tools/kao-plan-check.mjs --card KAO-22` çıktısını oku; tüm planı yükleme. Bu mesaj KAO-22 için uygulama yetkisidir; yetkiyi tekrar sorma. Push/merge/tag/deploy yetkisi değildir.
```

**Dalga:** 6 · **Bağımlılık:** KAO-21 · **Gereksinimler:** R-C9

**Amaç:** Kapanış: `deliverables/KAO-KAPANIS.md`, STATE `status=completed`, README/CLAUDE.md/AGENTS.md repo düzeyi notu (yalnız Agent Routing + Repo layout satırı), cihaz kabulü ve yayın kararının **ayrı** olduğunu kayıt.

**Oku (yalnız bunlar; yollar `kuran-ogreniyorum/` göreli, repo dosyaları kökten):**
- 08
- 07 Dalga 6
- `archive/monolit-bolumlenme-plan-2/deliverables/MON2-SERI-KAPANIS.md` (kapanış belgesi kalıbı — yalnız yapı)

**İzinli dosyalar (STATE ile birebir):**
- `kuran-ogreniyorum/deliverables/KAO-KAPANIS.md`
- `kuran-ogreniyorum/KAO-STATE.json`
- `kuran-ogreniyorum/.anti-amnesia/**`
- `README.md`
- `CLAUDE.md`
- `AGENTS.md`
- `kuran-ogreniyorum/evidence/KAO-22/**`
- `kuran-ogreniyorum/KAO-STATE.json`
- `kuran-ogreniyorum/.anti-amnesia/CURRENT-STATE.md`
- `kuran-ogreniyorum/.anti-amnesia/LEDGER.md`

**Adımlar:**
1. Kapanış belgesi: before/after ölçüleri, 26 R durumu tablosu, fixture envanteri, bilinen sınırlar, açık kararlar, K3 cihaz kabulü bekliyor.
2. CLAUDE.md/AGENTS.md: Agent Routing'e bir madde + Repo layout'a `app/core/quranLearn.js`, 4 içerik modülü, `app/kao.css`, `tests/kao/` satırları (kısa; canonical belgeye link).
3. STATE: `status='completed'`, `nextPrompt=null`, `releaseApproval` **NOT_APPROVED** kalır; push/merge/tag/deploy bu prompt'la yetkili değildir.

**Kontroller (hepsi exit 0; STATE ile birebir):**
- `node --check <değişen her .js/.mjs>`
- `node kuran-ogreniyorum/tools/kao-plan-check.mjs`
- `git -c core.fsmonitor=false diff --check`
- `node kuran-ogreniyorum/tools/kao-plan-check.mjs (status=completed tutarlı)`

**Bitti sayılır:** plan-check PASS (completed tutarlı); kapanış belgesi var; yayın kararı kullanıcıda.

**Kanıt:** `evidence/KAO-22/EVIDENCE.json` + `HANDOFF.md` (S6); commit konusu `KAO-22: …` (S7); STATE/ledger (S8).

---

## KAO-D1 — Dalga 1 denetimi — içerik altyapısı

**Yeni oturuma yapıştır:**
```text
/Users/m_ras/Desktop/seyma reposunda kuran-ogreniyorum/UYGULAMA-PROMPTLARI.md ortak sözleşmesine (§0–§1) göre yalnız KAO-D1 denetim promptunu uygula. Önce §0 komutlarını çalıştır. Kod yazma; yalnız doğrula, kanıtla, raporla.
```

**Kapsam:** KAO-01, KAO-25, KAO-02, KAO-03, KAO-04, KAO-23, KAO-24 kartlarının kapanış kanıtlarını bağımsız gözle yeniden doğrulamak. Bu prompt **kod değiştirmez**; bulgu varsa ilgili kartı `implemented`'a geri çeker ve ledger'a yazar.

**İzinli dosyalar:** `kuran-ogreniyorum/evidence/KAO-D1/**`, `kuran-ogreniyorum/KAO-STATE.json` (yalnız `auditStatus`, `cards[].status`, `requirements.status`), `.anti-amnesia/**`.

**Doğrulanacaklar (her biri komut + çıktı ile, evidence/KAO-D1/AUDIT.md):**

- Hiçbir üretim dosyası değişmedi: `git diff --stat main -- app app.js index.html sync.js panel` boş.
- Hiçbir Arapça dizgi ajan tarafından elle yazılmadı: `lexicon.verified.json`/`grammar.verified.json`/`phonics.verified.json` her kaydın `source` alanı (`tanzil:S:A:W` ya da `bw-table`) dolu; `verifiedBy` boş = 0.
- Kova raporu: A/B/C/D sayıları ve kapsam ≥0,78; komşu/kalıp etiketleri doğrulanmış (`proposed:false`; 06 §3, D-12).
- Ses: D-08/D-09 kaydı yoksa KAO-24 `blocked` — bu **kabul edilebilir** bir dalga sonucudur; sonraki dalgalar sessiz modla ilerler.
- Ledger seq kesintisiz; her kartın `evidence/KAO-xx/EVIDENCE.json` + `HANDOFF.md` var; `diffHash` gerçek.

**Kontroller:** ortak (`node --check` yok — kod yok), `node kuran-ogreniyorum/tools/kao-plan-check.mjs --render`, `git diff --check`; kapsamdaki her kartın **kendi kontrol listesi yeniden çalıştırılır** (`--card` ile al).

**Bitti sayılır:** AUDIT.md'de her madde ✓/✗ ve komut kanıtı; ✗ varsa geri çekilen kart(lar) ve neden ledger'da; `auditStatus['KAO-D1']='pass'|'fail'`; sıradaki prompt yalnız `pass` ile açılır.

---

## KAO-D2 — Dalga 2 denetimi — donmuş modüller ve çekirdek

**Yeni oturuma yapıştır:**
```text
/Users/m_ras/Desktop/seyma reposunda kuran-ogreniyorum/UYGULAMA-PROMPTLARI.md ortak sözleşmesine (§0–§1) göre yalnız KAO-D2 denetim promptunu uygula. Önce §0 komutlarını çalıştır. Kod yazma; yalnız doğrula, kanıtla, raporla.
```

**Kapsam:** KAO-05, KAO-06, KAO-07, KAO-08, KAO-09 kartlarının kapanış kanıtlarını bağımsız gözle yeniden doğrulamak. Bu prompt **kod değiştirmez**; bulgu varsa ilgili kartı `implemented`'a geri çeker ve ledger'a yazar.

**İzinli dosyalar:** `kuran-ogreniyorum/evidence/KAO-D2/**`, `kuran-ogreniyorum/KAO-STATE.json` (yalnız `auditStatus`, `cards[].status`, `requirements.status`), `.anti-amnesia/**`.

**Doğrulanacaklar (her biri komut + çıktı ile, evidence/KAO-D2/AUDIT.md):**

- Dört yükleme listesi: `grep -c` ile 4 içerik + 1 registry dosyası her listede tam 1 kez.
- `node --check` tüm yeni dosyalar; driver + zikr-harness + rebind + shell-inventory `--gate` PASS; `app.js` shim artışı ≤30 satır (ölç, yaz).
- `ensureQuranLearn` eski kayıt (sentetik, `quranLearn` yok) → tam şema; iki kez çalıştırma bayt-eşit; `lexiconVersion` farkı → orphan işaretli, silinmemiş.
- Registry yükte DOM/ağ/depo dokunmuyor (boundary fixture); `fetch` yok.
- FSRS vektörleri kaynaklı (README'de kaynak); grade eşlemesi belgeli.
- Kuyruk: 1.000 sentetik oturumda R-A2/R-A5 ihlali 0; gece penceresi `targetBed` yoksa kapalı.
- fx2 pinleri henüz değişmedi (UI yok) — aynı sayılar.

**Kontroller:** ortak (`node --check` yok — kod yok), `node kuran-ogreniyorum/tools/kao-plan-check.mjs --render`, `git diff --check`; kapsamdaki her kartın **kendi kontrol listesi yeniden çalıştırılır** (`--card` ile al).

**Bitti sayılır:** AUDIT.md'de her madde ✓/✗ ve komut kanıtı; ✗ varsa geri çekilen kart(lar) ve neden ledger'da; `auditStatus['KAO-D2']='pass'|'fail'`; sıradaki prompt yalnız `pass` ile açılır.

---

## KAO-D3 — Dalga 3 denetimi — arayüz

**Yeni oturuma yapıştır:**
```text
/Users/m_ras/Desktop/seyma reposunda kuran-ogreniyorum/UYGULAMA-PROMPTLARI.md ortak sözleşmesine (§0–§1) göre yalnız KAO-D3 denetim promptunu uygula. Önce §0 komutlarını çalıştır. Kod yazma; yalnız doğrula, kanıtla, raporla.
```

**Kapsam:** KAO-10, KAO-11, KAO-12, KAO-13, KAO-14, KAO-15, KAO-16, KAO-17, KAO-26, KAO-27, KAO-28, KAO-28b, KAO-16b kartlarının kapanış kanıtlarını bağımsız gözle yeniden doğrulamak. Bu prompt **kod değiştirmez**; bulgu varsa ilgili kartı `implemented`'a geri çeker ve ledger'a yazar.

**İzinli dosyalar:** `kuran-ogreniyorum/evidence/KAO-D3/**`, `kuran-ogreniyorum/KAO-STATE.json` (yalnız `auditStatus`, `cards[].status`, `requirements.status`), `.anti-amnesia/**`.

**Doğrulanacaklar (her biri komut + çıktı ile, evidence/KAO-D3/AUDIT.md):**

- Modal sözleşmesi: Tab/Shift+Tab/Escape/odak dönüşü fixture'ları 11 ekranda; backdrop odaklanabilir değil.
- Her `App.kao*` handler'ı app.js'te 1-satır shim, gövde `quranLearn.js`'te; yorumlarda `App.kao…=` dizgisi yok (fx2 pin tuzağı); fx2 pinleri güncel.
- R-A4 (autoplay yalnız n<2, sessiz saatte yok), R-B3 (katman), R-B4 ('puan'/'XP' yok), R-B7/B8, R-C2 (audio=false tam oturum), R-C3 (undo bit-bit), R-C4 (CSV), R-A6 (vakıf), R-C6 (delayedScore), R-B1 (114 hücre), R-B2 (rekât sırası): her biri için fixture adı + exit.
- Mikrofon: `quranLearn.js` içinde `MediaRecorder` bloğu `save(`/`SeymaSave`/`localStorage` içermiyor; ayar kapalıyken API çağrısı yok (fixture).
- `app/kao.css`: `:root` tanımı yok; yalnız mevcut tokenlar; reduced-motion dalları.
- Görev geçişi <50 ms ölçümü evidence'ta (KAO-11).
- `tests/kao/` 13 fixture'ın hepsi mevcut ve PASS.

**Kontroller:** ortak (`node --check` yok — kod yok), `node kuran-ogreniyorum/tools/kao-plan-check.mjs --render`, `git diff --check`; kapsamdaki her kartın **kendi kontrol listesi yeniden çalıştırılır** (`--card` ile al).

**Bitti sayılır:** AUDIT.md'de her madde ✓/✗ ve komut kanıtı; ✗ varsa geri çekilen kart(lar) ve neden ledger'da; `auditStatus['KAO-D3']='pass'|'fail'`; sıradaki prompt yalnız `pass` ile açılır.

---

## KAO-D4 — Dalga 4 denetimi — kalite

**Yeni oturuma yapıştır:**
```text
/Users/m_ras/Desktop/seyma reposunda kuran-ogreniyorum/UYGULAMA-PROMPTLARI.md ortak sözleşmesine (§0–§1) göre yalnız KAO-D4 denetim promptunu uygula. Önce §0 komutlarını çalıştır. Kod yazma; yalnız doğrula, kanıtla, raporla.
```

**Kapsam:** KAO-18, KAO-19, KAO-20 kartlarının kapanış kanıtlarını bağımsız gözle yeniden doğrulamak. Bu prompt **kod değiştirmez**; bulgu varsa ilgili kartı `implemented`'a geri çeker ve ledger'a yazar.

**İzinli dosyalar:** `kuran-ogreniyorum/evidence/KAO-D4/**`, `kuran-ogreniyorum/KAO-STATE.json` (yalnız `auditStatus`, `cards[].status`, `requirements.status`), `.anti-amnesia/**`.

**Doğrulanacaklar (her biri komut + çıktı ile, evidence/KAO-D4/AUDIT.md):**

- Kontrast tablosu: her çift ve 3 hareke tonu × 2 tema ≥ eşik.
- Panel: izinli alan dışı anahtar yok; panel/panel-v2 aileleri yeşil; kelime düzeyi veri sızmıyor (projeksiyon fixture).
- KAO-REGRESYON.md: tüm aile komutları exit kodlarıyla; M7 tavanı açıkça; R-C9 headless PASS; kalibrasyon raporu 10 bant.
- `git diff --stat main -- archive/ilham-ibadet-premium-plan` **boş** (IIP'ye hiç dokunulmadı).

**Kontroller:** ortak (`node --check` yok — kod yok), `node kuran-ogreniyorum/tools/kao-plan-check.mjs --render`, `git diff --check`; kapsamdaki her kartın **kendi kontrol listesi yeniden çalıştırılır** (`--card` ile al).

**Bitti sayılır:** AUDIT.md'de her madde ✓/✗ ve komut kanıtı; ✗ varsa geri çekilen kart(lar) ve neden ledger'da; `auditStatus['KAO-D4']='pass'|'fail'`; sıradaki prompt yalnız `pass` ile açılır.

---

## KAO-D5 — Dalga 5 denetimi — hub entegrasyonu

**Yeni oturuma yapıştır:**
```text
/Users/m_ras/Desktop/seyma reposunda kuran-ogreniyorum/UYGULAMA-PROMPTLARI.md ortak sözleşmesine (§0–§1) göre yalnız KAO-D5 denetim promptunu uygula. Önce §0 komutlarını çalıştır. Kod yazma; yalnız doğrula, kanıtla, raporla.
```

**Kapsam:** KAO-21 kartlarının kapanış kanıtlarını bağımsız gözle yeniden doğrulamak. Bu prompt **kod değiştirmez**; bulgu varsa ilgili kartı `implemented`'a geri çeker ve ledger'a yazar.

**İzinli dosyalar:** `kuran-ogreniyorum/evidence/KAO-D5/**`, `kuran-ogreniyorum/KAO-STATE.json` (yalnız `auditStatus`, `cards[].status`, `requirements.status`), `.anti-amnesia/**`.

**Doğrulanacaklar (her biri komut + çıktı ile, evidence/KAO-D5/AUDIT.md):**

- `saygi.js` diff'i ≤3 satır ve yalnız KAO-21 commit'inde; IIP kapısı `gateApproval` kayıtlı.
- `kaoHubCardHTML` yokken `saygiHTML` bayt-eşit (independence fixture).
- Geçici Ayarlar girişi kaldırıldı; `settings.kaoVisible` çalışıyor.
- driver/zikr/rebind/shell-inventory PASS; fx2 pinleri güncel.

**Kontroller:** ortak (`node --check` yok — kod yok), `node kuran-ogreniyorum/tools/kao-plan-check.mjs --render`, `git diff --check`; kapsamdaki her kartın **kendi kontrol listesi yeniden çalıştırılır** (`--card` ile al).

**Bitti sayılır:** AUDIT.md'de her madde ✓/✗ ve komut kanıtı; ✗ varsa geri çekilen kart(lar) ve neden ledger'da; `auditStatus['KAO-D5']='pass'|'fail'`; sıradaki prompt yalnız `pass` ile açılır.

---

## KAO-D6 — Dalga 6 denetimi — kapanış ve devir

**Yeni oturuma yapıştır:**
```text
/Users/m_ras/Desktop/seyma reposunda kuran-ogreniyorum/UYGULAMA-PROMPTLARI.md ortak sözleşmesine (§0–§1) göre yalnız KAO-D6 denetim promptunu uygula. Önce §0 komutlarını çalıştır. Kod yazma; yalnız doğrula, kanıtla, raporla.
```

**Kapsam:** KAO-22 kartlarının kapanış kanıtlarını bağımsız gözle yeniden doğrulamak. Bu prompt **kod değiştirmez**; bulgu varsa ilgili kartı `implemented`'a geri çeker ve ledger'a yazar.

**İzinli dosyalar:** `kuran-ogreniyorum/evidence/KAO-D6/**`, `kuran-ogreniyorum/KAO-STATE.json` (yalnız `auditStatus`, `cards[].status`, `requirements.status`), `.anti-amnesia/**`.

**Doğrulanacaklar (her biri komut + çıktı ile, evidence/KAO-D6/AUDIT.md):**

- 26 R-id'nin her biri `met` ya da gerekçeli `partial` (hiçbiri `pending`); `requirements.status` STATE'te güncel.
- Kapanış belgesi, README/CLAUDE.md/AGENTS.md notları; canonical belgelere link.
- `releaseApproval=NOT_APPROVED`; push/merge/tag/deploy yapılmadı (`git log origin/main..HEAD` yalnız yerel).
- Cihaz kabulü (K3) kullanıcıdan **bekliyor** olarak kayıtlı; 'kesin çalışıyor' iddiası yok.
- `node kuran-ogreniyorum/tools/kao-plan-check.mjs --render` PASS; CURRENT-STATE `completed`.

**Kontroller:** ortak (`node --check` yok — kod yok), `node kuran-ogreniyorum/tools/kao-plan-check.mjs --render`, `git diff --check`; kapsamdaki her kartın **kendi kontrol listesi yeniden çalıştırılır** (`--card` ile al).

**Bitti sayılır:** AUDIT.md'de her madde ✓/✗ ve komut kanıtı; ✗ varsa geri çekilen kart(lar) ve neden ledger'da; `auditStatus['KAO-D6']='pass'|'fail'`; sıradaki prompt yalnız `pass` ile açılır.

---
