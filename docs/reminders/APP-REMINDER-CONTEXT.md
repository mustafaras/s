# Hatırlatma Programı — Context ve Authority Sözleşmesi

Bu dosya, yeni bir ajanın önceki sohbeti okumadan doğru dosyaları, doğru
sırayla ve gereksiz context yüklemeden bulabilmesi için hazırlanmıştır.

## 1. Authority sırası

### A. Değiştirilemez güvenlik ve çalışma kuralları

1. [`../../AGENTS.md`](../../AGENTS.md)
2. [`../../CLAUDE.md`](../../CLAUDE.md)
3. [`../../.claude/skills/run-seyma/SKILL.md`](../../.claude/skills/run-seyma/SKILL.md)

Bu üç kaynakta belirtilen browser, gerçek veri, token, sync ve kanıt
sınırları hiçbir prompt tarafından gevşetilemez.

### B. Ürün ve mimari authority

1. [`../../GELISTIRME-PLANI.md`](../../GELISTIRME-PLANI.md)
2. [`../plans/APP-HATIRLATMA-VE-BILDIRIM-UX-PLANI.md`](../plans/APP-HATIRLATMA-VE-BILDIRIM-UX-PLANI.md)
3. Güncel kaynak kod (`app.js`, `sync.js`, `sw.js`, `styles.css`, `index.html`)
4. Güncel headless test sonuçları

Roadmap veya plan “mevcut” diyorsa kod ve testte yeniden doğrulanır. Kod / test
planla çelişirse yeni davranış varsayılmaz; `APP-REMINDER-DECISIONS.md` içine
discrepancy yazılır ve ilgili prompt `blocked` kalır.

### C. Yürütme authority

1. [`APP-REMINDER-STATE.json`](APP-REMINDER-STATE.json) — makinece okunabilir
   aktif prompt ve blocker.
2. [`APP-REMINDER-ANTI-AMNESIA-LEDGER.md`](APP-REMINDER-ANTI-AMNESIA-LEDGER.md)
   — insan tarafından okunabilir kanıt ve gate durumu.
3. [`APP-REMINDER-PROMPTLARI.md`](APP-REMINDER-PROMPTLARI.md) — aktif promptun
   uygulanabilir sözleşmesi.
4. [`APP-REMINDER-TEST-MATRIX.md`](APP-REMINDER-TEST-MATRIX.md) — test ve
   kabul kapıları.
5. [`APP-REMINDER-TRACEABILITY-MATRIX.md`](APP-REMINDER-TRACEABILITY-MATRIX.md)
   — planın prompt ve kanıt kapsamı.
6. [`APP-REMINDER-APP-PANEL-SURFACE-MAP.md`](APP-REMINDER-APP-PANEL-SURFACE-MAP.md)
   — gerçek app runtime, current panel, Panel-v2 ayrımı ve data lineage.
7. [`APP-REMINDER-APPROVAL-GATE.md`](APP-REMINDER-APPROVAL-GATE.md) — canlı
   ve dış sistem işlemlerinin kullanıcı onayı kapısı.
8. [`verify-reminder-context.mjs`](verify-reminder-context.mjs) — bu kaynakların
   makinece senkron olup olmadığını doğrulayan checker.
9. [`verify-reminder-closure.mjs`](verify-reminder-closure.mjs) — prompt kapanışında
   evidence, ledger, STATE, commit ve sonraki prompt geçişini doğrulayan gate.

State, ledger ve prompt aynı durumu söylemiyorsa ajan hiçbir kod değişikliğine
başlamaz.

### 1.1. Kullanıcı onayı olmadan canlılık kilidi

`APP-REMINDER-APPROVAL-GATE.md` canonical release authority'dir. Varsayılan
durum `releaseApproval.status = not_approved` olarak kalır. Kullanıcı mevcut
konuşmada açıkça eylem ve kapsam belirtmeden hiçbir ajan:

- `git push`, branch / PR merge, tag veya release yapamaz;
- GitHub Pages workflow'unu tetikleyemez veya canlı dosyayı değiştiremez;
- production webhook, deploy servisi veya dış bildirim sistemine yazamaz;
- canlı browser / cihaz doğrulaması başlatamaz.

Yeşil testler, local commit, `ready_for_user_acceptance`, “devam” veya eski
sohbet mesajı onay değildir. `mustafaras/seyma-data` yazımı, canlıya alma
onayından bağımsız olarak ayrıca açık veri yazma izni gerektirir. Ajan bu state'i
kendi kararıyla `approved` yapamaz; release approval yalnız exact kullanıcı
mesajı ve kapsamı kaydedilerek değiştirilebilir.

## 2. Program kapsamı

### 2.1. Hedef

Hatırlatma UX planındaki ritüel, bakım, destek, sağlık, özel gün ve sistem
hatırlatmalarını kullanıcı kontrollü, mahrem, erişilebilir, deterministik ve
PWA sınırlarını dürüstçe ifade eden bir katman olarak uygulamak.

### 2.2. İlk programda izin verilen üretim yolları

Prompt kendi allowlist’inde daha dar bir sınır koyabilir; genel olarak:

- `app.js`: runtime, state migration, renderer ve App handlers.
- `styles.css`: uygulama teması ve responsive / reduced-motion yüzeyleri.
- `index.html`: script cache-bust ve gerekli kabuk / deep-link sözleşmesi.
- `sw.js`: yalnız ilgili notification click / PWA davranışı; background
  scheduling iddiası eklenmez.
- `sync.js`: yalnız ayrı prompt ve privacy gate onayı ile; gerçek data repo’ya
  yazılmaz.
- `panel.js`, `panel.html`, `panel.css`, `panelCoverageManifest.js`: yalnız
  panel aynası promptunda; hassas reminder body / rutin panel’e taşınmaz.
- `Panel-v2` arşiv kanıtı ve `tests/panel-v2/`: current panel runtime’ına
  doğrudan bağlanmaz; yalnız ayrı regression / design evidence olarak okunur.
- `tests/` ve `.claude/skills/run-seyma/`: ilgili sentetik fixture ve headless
  doğrulama.
- `docs/reminders/`: ledger, state, prompt, test matrisi, handoff ve kararlar.

### 2.3. Korunan / kapsam dışı yollar

Aşağıdaki yollar açıkça ilgili promptta allowlist edilmedikçe değiştirilemez:

- `data/`
- `mustafaras/seyma-data` veya herhangi bir gerçek veri deposu
- `seyma_motivation_v2_package/` (local-only, commit edilmez)
- frozen içerik modülleri (`profileAssessmentV1.js`, `saygiPeople.js`,
  `hijriCalendar.js`, `quran*`, `esmaulHusna*`) — içerik değişikliği ayrı
  yetkilendirme ister
- `archive/` içindeki tarihsel Panel-v2 belgeleri
- `.github/workflows/` — yayın / CI değişikliği ayrı release promptudur
- token, secret, kullanıcı localStorage dump’ı, gerçek notification payload’ı

Kod promptu bu yolları değiştirmeyi gerektiriyorsa durur ve `blocked` kaydı
açar. “Gerekli göründü” allowlist’i kendiliğinden genişletmez.

## 3. Context bütçesi politikası

Her oturumun ideal okuma paketi:

| Sıra | Kaynak | Okuma genişliği |
|---|---|---|
| 1 | `AGENTS.md` | Tümü; güvenlik atlanmaz |
| 2 | `GELISTIRME-PLANI.md` | İlk oturumda §0 + teknik ilkeler; sonra promptun belirttiği bölüm |
| 3 | `SKILL.md` + `tests/README.md` | Tümü / ilgili komut bölümü |
| 4 | Bu `README.md` + Context | Tümü; kısa yönlendirme |
| 5 | `STATE.json` + ledger | Tümü; aktif durumun tamamı |
| 6 | Prompt listesi | Yalnız aktif prompt bloğu + ortak protokol |
| 7 | UX planı | Yalnız promptun referans verdiği § bölümleri |
| 8 | Kaynak kod | `rg` sonucu ile dar line range; tüm büyük dosya değil |
| 9 | Test | Aktif promptun matrix satırları ve ilgili fixture |

Yalnız şu durumlarda planın tamamı yeniden okunur:

- program fazı değişiyorsa,
- prompt ile plan arasında discrepancy varsa,
- veri / privacy / background capability sınırı değişiyorsa,
- kullanıcı açıkça planın tamamını yeniden değerlendirmeyi isterse.

### 3.1. 15 dakikalık birim kuralı

Her prompt:

- tek dominant risk taşımalı,
- tek oturumda anlaşılabilmeli,
- bağımsız test edilebilmeli,
- açık bir done condition’a sahip olmalı,
- bir sonraki prompta devredilebilir bir kanıt bırakmalıdır.

Bir prompt bu sınırı aşarsa ajan kodu bölmez; promptu `blocked` yapıp yeni
alt-prompt önerisini karar günlüğüne yazar.

### 3.3. App / panel route kuralı

- REM-44–REM-54 için surface map §1, ilgili `app.js` / `index.html` /
  `styles.css` / `sw.js` bounded ranges ve ilgili headless fixture okunur.
- REM-55–REM-66 için surface map §2, current `panel.js` /
  `panelCoverageManifest.js` / `panel.css` bounded ranges ve root panel
  fixture’ları okunur.
- REM-67–REM-72 için surface map §3–§4 ile her iki hattın ilgili receipts’i
  okunur; iki büyük runtime dosyası bütünüyle yüklenmez.
- Bir promptun allowlist’i app ve paneli aynı anda açmıyorsa cross-surface
  değişiklik yapılmaz; integration promptuna veya karar günlüğüne taşınır.

### 3.2. Gereksiz context üretmeme

- Aynı mevcut durumu plan, prompt, ledger ve handoff içinde kopyalama.
- Prompt yalnız gereken plan bölümüne link versin.
- Ledger yalnız sonuç, test, commit, deploy ve blocker yazsın.
- Handoff yalnız bir sonraki ajanın ilk güvenli eylemini yazsın.
- Ham test loglarını dokümana yapıştırma; kısa komut + sonuç + receipt yolu
  yeterlidir.
- Gerçek kullanıcı metni veya veri örneği yerine sentetik fixture kullan.

### 3.4. Context / auto-compact checkpoint

- Otomatik compact yaklaşırsa veya ajan önceki görev geçmişini güvenilir biçimde
  taşıyamayacağını fark ederse uygulama değişikliğine devam edilmez.
- Önce `SESSION-HANDOFF-TEMPLATE.md` biçiminde kısa checkpoint yazılır:
  aktif prompt, HEAD, çalışma ağacı, değişen dosyalar, son doğrulanmış
  komutlar, blocker/discrepancy ve tek sonraki güvenli adım.
- Checkpoint alındıktan sonra yeni session açılır. Yeni session canonical
  dosyaları, prompt parity'sini ve Git durumunu yeniden doğrular.
- Eski sohbet, compact özeti, eski SHA veya eski test çıktısı tek başına güncel
  kanıt değildir; tamamlandı / done / ready iddiası yeniden doğrulama olmadan
  verilemez.
- Tam ayrıntı append-only ledger veya evidence dosyasında tutulur; checkpoint
  kısa, kopyalanabilir ve yalnız devam etmek için gereken bilgiyi içerir.

## 4. Session giriş protokolü

Her ajan, ilk değişiklikten önce aşağıdaki komutları çalıştırır:

```bash
git status --short --branch
git rev-parse HEAD
node --version
```

Sonra:

1. `STATE.json` içindeki `activePrompt` ve `blockedPrompt` değerlerini oku.
2. `blockedPrompt` doluysa başka prompt başlatma.
3. Ledger’daki aynı satırın hâlâ güncel SHA ve test kanıtına sahip olduğunu
   doğrula.
4. Çalışma ağacındaki değişikliklerin önceki ajana ait olup olmadığını ayırt
   et; sahipliği bilinmeyen dirty dosyayı silme veya overwrite etme.
5. Promptun allowlist’i dışındaki değişiklikleri kapsam dışı kabul et.
6. Yalnız promptun referans verdiği kaynak bölümlerini bounded read ile oku.
7. `node docs/reminders/verify-reminder-context.mjs` çalıştır; fail olursa
   prompt başlatma.
8. Prompt başlarken ledger satırını `in-progress` yap ve state’i aynı aktif
   promptla güncelle.

## 5. Session çıkış protokolü

Bir prompt “done” sayılmadan önce:

1. İlgili syntax, headless, migration, privacy ve UI testlerini çalıştır.
2. Fail varsa kodu yarım bırakıp ilerleme; `blocked` protokolünü uygula.
3. `git diff --check` çalıştır.
4. `git diff --name-only` ile allowlist dışı dosya olmadığını doğrula.
5. Kanıt makbuzunu [`EVIDENCE-RECEIPT-TEMPLATE.md`](EVIDENCE-RECEIPT-TEMPLATE.md)
   formatında oluştur veya ledger’a kısa receipt yaz.
6. Yalnız ilgili dosyaları stage’le ve prompt numarasını içeren commit at.
7. Commit SHA, test özeti ve varsa deploy kanıtını ledger’a yaz.
8. `STATE.json` içindeki `lastCompletedPrompt`, `activePrompt` ve
   `nextSafeAction` değerlerini güncelle.
9. Sonraki prompt faz kilidini kontrol et.
10. `node docs/reminders/verify-reminder-context.mjs` ile prompt / ledger /
    state / traceability parity'yi yeniden doğrula.
11. `node docs/reminders/verify-reminder-closure.mjs REM-XX` ile kapanan
    promptun evidence, ledger, STATE, commit ve sonraki prompt geçişini
    doğrula; FAIL ise done/ready/handoff verme.
12. [`SESSION-HANDOFF-TEMPLATE.md`](SESSION-HANDOFF-TEMPLATE.md) ile kısa
    handoff ver.

## 6. Kanıt seviyeleri

Her raporda şu kanıtlar ayrı tutulur:

| Seviye | Anlam | Örnek |
|---|---|---|
| S0 | Kaynak / plan okundu | İlgili section ve dosya yolu |
| S1 | Statik doğrulama | `node --check`, `git diff --check` |
| S2 | Sentetik / headless test | Fixture assertion özeti |
| S3 | Commit / remote | SHA, branch ve equality |
| S4 | CI / Pages deploy | Workflow run ve deployment kanıtı |
| S5 | Kullanıcı cihazı | Kullanıcının kendi cihazındaki kabul doğrulaması |

S1 veya S2 yokken S3 “doğrulandı” anlamına gelmez. S4 yokken canlı davranış
iddia edilmez. S5 olmadan cihaz / background davranışı kesinleşmiş sayılmaz.

## 7. Discrepancy ve blocked standardı

Bir ajanın karşılaştığı durum:

- **discrepancy:** belge ile kod / test farklı; ilerlemek için karar gerekir.
- **blocked:** aktif promptun acceptance gate’i geçemiyor veya güvenli kapsam
  net değil.
- **deferred:** kapsam dışı, fakat ileride yeniden ele alınabilir.

Her kayıtta şu beş alan zorunludur:

1. exact command / kaynak,
2. beklenen,
3. gözlenen,
4. güvenlik veya ürün etkisi,
5. çözülmeden neden ilerlenemediği.

## 8. Commit / push / deploy politikası

- Prompt başına dar commit.
- `REM-02`–`REM-72` boyunca düzenli local commit serbesttir; local commit
  remote veya canlı release kanıtı değildir.
- Faz bitmeden `git push` yok. Faz bitse bile açık, güncel kullanıcı onayı
  yoksa `git push` yok.
- Program zinciri, final testleri, port `9000` üzerindeki güvenli local server
  doğrulaması ve kullanıcının kendi cihaz kontrolü tamamlanmadan hiçbir push,
  merge, tag, Pages deploy veya external write yapılmaz. Önceki approval scope
  sonraki promptlara taşınmaz.
- Kullanıcı ayrıca açıkça ve kapsam belirterek istemedikçe bu program promptları
  `main`e push / merge / Pages deploy yapmaz; yalnız fazın release gate’i hazır
  olur.
- Push yetkisi verildiğinde kaynak, test, remote equality, workflow, deploy ve
  canlı HTTP kanıtı ayrı makbuzlara yazılır.
- Gerçek veri repo’suna hiçbir prompt yazmaz; `sync.js` testleri mock’la çalışır.
  `mustafaras/seyma-data` için ayrı ve açık veri yazma onayı olmadan istisna yoktur.
- Onay state'i `approved` değilken release promptu çalıştırılmaz; yalnız release
  packet, test, traceability ve kullanıcıya onay için hazırlık yapılabilir.
