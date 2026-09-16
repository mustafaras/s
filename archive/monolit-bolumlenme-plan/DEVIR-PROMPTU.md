# DEVİR PROMPTU — app.js Monolit Bölümleme Programı (soğuk başlangıç brief'i)

**Tarih:** 2026-09-02 · **Hedef ajan:** Claude Opus (veya eşdeğer üst-model oturumu) · **Kaynak:** GitHub Copilot oturumu
**Kullanım:** Bu belge olduğu gibi yeni oturuma yapıştırılır. Opus bu belgeyi okumadan hiçbir dosya yazmaz.

---

## §0 · Kimlik ve Misyon

Sen, `mustafaras/s` deposundaki **Şeyma** projesinde `app.js` monolit bölme programını **planlama katmanından yeniden inşa edecek** ajanısın. Kullanıcı, mevcut taslak seriyi iki kez reddetti: "yetersiz, kapsamlı detaylı ve pro-premium değil, dosya isimleri bile özensiz". Görevin:

1. **`monolit-bolumlenme-plan/` altındaki tüm planlama artefaktlarını sıfırdan, repo'nun kanonik kalite barında yeniden üretmek** (mevcut içerik taslaktır; yapı fikri alınabilir, içerik kalıbı ALINMAZ).
2. **Uygulamaya BAŞLAMAK YOK.** Çıktı = plan + anti-amnesia altyapısı. Uygulama (MON-01) yalnız kullanıcının ayrı onayıyla başlar.
3. Bu belge §6'daki **öz-denetim kapısını** geçmeden teslim etme.

---

## §1 · Ortam ve Mutlak Yasaklar (CLAUDE.md/AGENTS.md ile uyumlu; ihlal = iş reddi)

| # | Kural |
|---|-------|
| G1 | **Tarayyıcıda açma yok.** Uygulama/plan doğrulaması yalnız headless: `node .claude/skills/run-seyma/driver.mjs`, `zikr-harness.mjs`, `tests/**` fixture'ları. Geçmişte bir ajan tarayıcıda açıp kullanıcının 17 günlük gerçek verisini sıfırlamıştı — bu deponun en kritik kuralıdır. |
| G2 | **`mustafaras/seyma-data` deposuna yazım yasak** (kişisel veri; tek canlı kopya). Okuma bile yalnızca zorunluysa ve salt-okunur. |
| G3 | **LOCAL-ONLY:** mevcut dal `premium-fx-local` (push edilmemiş, FX serisi 84 yerel commit). `git push`, merge, tag, deploy — kullanıcı onayı olmadan yasak. Commit yalnız yerel; `git add -A && git commit` OK. |
| G4 | Açılan yerel sunucu (gerekirse) oturum bitmeden `pkill -f http.server` ile kapatılır. |
| G5 | **Dil:** planlama belgeleri, commit mesajları, prompt metinleri **Türkçe** (repo konvansiyonu; apple-design ve premium-fx-plan ailesi birebir Türkçe). Kod/yorum dili repo geleneğine uyar. |
| G6 | Ajan asla kullanıcının token/parola/2FA gizli alanına dokunmaz; canlı hesap kurulumu kullanıcı işidir. |

---

## §1 · Kanıt Temeli — DOĞRULANMIŞ GERÇEKLER (2026-09-02 grep; yeniden kullanmadan önce canlı doğrula)

Bu rakamlar bu oturumda grep ile doğrulandı. Opus kendi oturumunda `grep` ile **canlı teyit** eder; sapma varsa plan satır ipuçlarını canlı değerle günceller ve LEDGER'a yazar.

### 1.1 app.js çıpaları (~18.957 satır, IIFE kapanışı L18957)

| Çıpa | Satır |
|------|-------|
| `var data=null;` | 2713 |
| localStorage yükleme + `data=migrate(data)` | 4415 / 4416 |
| **B1 canlı getter bloğu** | 4424–4430 (data, ui, dark, migrate, getDay, createDefaultData, save — 7 getter, `Object.defineProperty`) |
| `function migrate(d){` | 4431 |
| `function getDay(d,date,idx){` | 4964 |
| `function save(touchSource,eventSpec){` | 6271 |
| `var App={};` | 6456 |
| `function createDefaultData(){` | 6726 |
| `data=migrate(createDefaultData());` (reset) | 6734 |
| `window.App=App;` | 17021 — **atamalar bu satırdan sonra da sürer** (aynı obje referansı) |
| IIFE kapanış `})();` | 18957 |

**`data` yeniden atama noktaları (tamamı — plan K4 listesi):** 2713 (bildirim), 4415 (+catch `data=null`), 4416, **6079** (`backfillArchivesFromDays` içinde `data=d` **geçici takas** — try bloğu, özel dikkat), 6734, 9266 (`App.importJson`), 9270 (`App.resetConfirm`), 9296 (auth-unlock), 18857 (late-boot guard).

**App yüzeyi:** `App\.\w+\s*=\s*function` → ~545; tüm atama biçimleri (`App.x=…` alias/data-props dâhil) → ~708; doküman invariant'ı "App.* 705" (FX kapanışı). Üç sayım birlikte izlenir.

**FX çağrı noktaları (aynen korunacak — K5):** `SeyAudio` ~12 satır (voice 6743–6744, bell 8165/8671/11930, success 8296/8297/8308/8346, warning 8388/8450/11915/17992, tap 8579–8580, guides.zikir* 8664/8683/8707, greeting 18901, isQuietTime 18893) · `SeyHaptics` ~30 satır (tap setMood 8348, toggleTheme 8282, overlay open/close 8402–8403/8463–8464/8518–8519, rateBook 8439, saveToday 9644, setRoomTab 9556, streak 8346/8672/11930, water 8380) · `SeyTimeTheme` guarded çağrı 9977–9978 (render içi) · `SeyFx` 0 çağrı.

**B1/registry durum:** `SeymaState`/`SeymaSave`/`SeymaDateUtils`/`SeymaHelpers` app.js içinde **0 referans**. `app.js` yalnız `window.SeymaConstants` (L3), `SeyOnSyncState`, `SeyOnSynced`, `App` + B1 getter'ları yazar; `window.data/ui/save` **asla atanmaz** (strict-mode throw sözleşmesi: `SeyOnSyncState/SeyOnSynced` app.js'te kalır — syncGlue.js getter-only yapılırsa boot THROW eder).

### 1.2 `app/core/` mevcut 11 modül (index.html sırasıyla)

`constants.js` (`SeymaConstants`, ICONS) → `dateUtils.js` (`SeymaDateUtils`; dayIndexFor/activeDate/curDay `SeymaState` soft-bind) → `state.js` (`SeymaState` soft-bind getter'lar; **gövde iskelet, app.js sahip**) → `syncGlue.js` (`SeymaSave` getter; **bayat yorum: save 6229 → gerçek 6271**) → `helpers.js` (`SeymaHelpers`, 12 üye; `haptic` haptics-gating simülasyonu) → `mediaFx.js` (`SeyAudio/SeyHaptics/SeyFx`; cloud TTS, quiet-time 23–07) → `timeTheme.js` (`SeyTimeTheme`) → `reminder{Catalog,Engine,Scheduler,Delivery}.js` (frozen, `Reminder*V1`).

**state.js bayat yorum:** yeniden atama satırları 4412/4413/6692/… diye yazıyor — canlı liste yukarıda (2713/4415/4416/6079/6734/9266/9270/9296/18857). Plan bunun düzeltmesini ilgili prompt'a işler.

### 1.3 index.html script sırası (L43–72, değiştirilecek tek yüzeylerden biri)

`app/content/*` 11 modül → `app/core/constants.js` → `dateUtils, state, syncGlue, helpers, mediaFx, timeTheme` → `reminder*` 4 → SW-register inline script → `panel/panelCoverageManifest.js` → `app.js` → `sync.js`. Her modül `?v=YYYYMMDDx`. **Yeni `app/core/*` satırları `reminderDelivery.js` sonrasına, SW-register inline'ın öncesine eklenir; app.js tag'i dalın sonuna kadar korunur.**

### 1.4 Harness FILES dizileri (gerçek, güncellenmesi gerekiyor — plan MON-x'te)

- `driver.mjs` (L221–225): `['app/content/motivationProgramV2.js','app/content/profileAssessmentV1.js','app/core/constants.js','app/core/reminderCatalog.js','app/core/reminderEngine.js','app/core/reminderScheduler.js','app/core/reminderDelivery.js','app.js']` — 6 çekirdek modül EKSİK.
- `zikr-harness.mjs` (L131): content 7 + constants + reminder×4 + **state.js + mediaFx.js** + app.js — `dateUtils/syncGlue/helpers/timeTheme` EKSİK.
- Harness kuralları (`run-seyma/SKILL.md`): fetch hiç çözülmeyen Promise, timer no-op, DOM stub minimal, `sync.js` yüklenmez, gerçek localStorage/token yok. Sandbox `window=self=globalThis`.

### 1.5 Boundary fixture'ları (seri ilerledikçe **kasıtlı FAIL'e dönerler** — faz kapısı şart)

| Fixture | Assertion | Kritik iddialar |
|---------|-----------|-----------------|
| `tests/app/test_modularization_boundary.js` | 42 | [0] 5 Faz-1.1 modülü index.html'de sırayla · [1] `app.js >18000 satır` · [4] `existing < 24` (plan aşaması) · [7] `MODULARIZATION.md` **"Sürüm: 2.1"** + `| 24 |` satırı · [8] `migrate(d){`+`save(touchSource,eventSpec){` app.js'te · [9] window atama kontratı · [10] 7-modül VM-boot yüzeyi (`SeymaState.data===undefined` öncesi) |
| `tests/app/test_faz_minus11_boundary.js` | 18 | "SeymaDateUtils/SeymaHelpers app.js'te henüz çağrılmıyor" — dalga 2'de tersine döner |
| `tests/app/test_date_utils_boundary.js` | 58 | SeymaDateUtils tam yüzey + state/syncGlue getter yüzeyi |
| `tests/app/test_helpers_boundary.js` | 30 | SeymaHelpers 12 üye + haptic gating simülasyonu |

### 1.6 Fixture aileleri (tests/README.md)

`app/` 20 · `panel/` 23 · `panel-v2/` 27 · `quran/` 9 · `reminders/` 20 (`run-reminder-smoke.mjs`) + `run-seyma` harness'ları + `.claude/skills/run-seyma/verify-state-{helper-boundary,migration-boundary,adapter-contract}.mjs`. Doğrulama kapıları bu ailelerden türetilir; **bulamadığın fixture adını uydurma** — her kapı komutu listede mevcut dosyaya işaret eder.

### 1.7 graphify kanıt haritası (`docs/monolit-bolumlenme-haritasi.md`)

app.js 1323 fonksiyon: **Reminder 373 fn/%28** · Zikir 93/%7 · Kur'an 93/%7 · Saygı 69/%5 · ÆON/Luna 50/%4 · Profil 34/%3 · Okuma 29 · Namaz 25 · Su 21 · Sync 18 · İzleme/Dinleme 33 · Diğer (state/render/helpers) **419/%32**. Topluluk etiketleri yanıltıcı (aynı dosya içi algoritma artefaktı); harita dosya sınırı + fonksiyon amacı üzerine kuruludur. Ayrıştırma sırası: reminder → zikir+quran+esma → state/render/helpers çekirdeği. I1–I6 korunmalı.

### 1.8 Üst planlar ve kapanış durumu

- `premium-fx-plan/MODULARIZATION.md` **v2.1** — 24 hedef modül listesi (§2.1 tablo + §2.2 geçiş sırası + §2.3 canlı getter gerekçesi). Sürümü `test_modularization_boundary.js [7]` sert doğrular: sürüm değişecekse aynı commit'te fixture güncellenir.
- `premium-fx-plan/deliverables/FX-SERI-KAPANIS-BELGESI.md` — FX-P-01…74 tamam (70 uygulanan), `FX-PROMPT-STATE.json`: `implementationComplete:true`, `pushedToRemote:false`, dal `premium-fx-local`. Ertelenen: FX-P-66/67. API yüzeyi donmuş: `SeyAudio` (tap/success/warning/bell/voice/speakLocal/ambient×7/cloudTts×4/guides×5/greeting/isQuietTime…), `SeyHaptics` (tap/success/error/refresh/streak/water), `SeyFx`, `SeyTimeTheme`, `SeymaState/SeymaSave`, `App.toggleSetting`+`App.setVoice*`; settings alanları (premiumAtmosphere, uiSounds, voiceCloudTts=true, voiceLocalFallback=**false**…) `migrate()` backfill'li ve sanitize'lı.
- `docs/apple-design/APPLE-DESIGN-STATE.json`: AD-52 tamam (kalite-bar şablonu kaynağı).
- `docs/GELISTIRME-PLANI.md`: modülerleştirme satırı henüz YOK — plan kapanışında eklenecek.

---

## §2 · Kalite Barı — ev kalıbı (bu şablonların altına inilmez)

Opus'un üreteceği her artefakt şu **mevcut repo belgeleriyle aynı derinlik ve formatta** olacak; bunlar tek doğruluk kaynağıdır, kendini onlara bakarak değil onları AÇARAK kalibre et:

1. **`docs/apple-design/UYGULAMA-PROMPTLARI.md`** (52 prompt) — prompt kataloğunun ev kalıbı: "Ajan için ilk 60 saniye" bloğu (state okuma, yarım-prompt çözümleme), ortak sözleşme S1–S8 (ön koşul → değişmezler tablosu → veri güvenliği → doğrulama kapısı → değişmezlik kanıtı grep'leri → üç-dosya kuralı → commit → cache-bust), dalga haritası (onay kolonu), `## AD-xx · Başlık` başlıklı, her promptta **Kabul:** satırı ölçülebilir komut+beklenen değerle.
2. **`docs/apple-design/APPLE-DESIGN-STATE.json`** — durum makinesi şeması: schemaVersion, programId, status, activePrompt/blockedPrompt/lastCompletedPrompt/nextPrompt, currentWave, totalPrompts/completedPrompts, nextSafeAction (uzun), codeTouched, authority[], invariants{}, waves[] (approvalRequired!), verificationGate[], separatelyGated[].
3. **`docs/apple-design/.anti-amnesia/CURRENT-STATE.md`** — insan-okur durum: tablo Durum/Dalga/Aktif/Son/Sıradaki/Bloke/Güncellendi + uygulanan prompt listesi + program-dışı onarım notları.
4. **`premium-fx-plan/.anti-amnesia/LEDGER.md`** — **8 kolon** append-only: `| Seq | Tarih | Ajan | Tip | Durum | Commit | S-kapı | Açıklama |` (5-kolon eski format KULLANMA).
5. **`premium-fx-plan/deliverables/FX-SERI-KAPANIS-BELGESI.md`** — kapanış belgesi kalıbı (dalga tablosu + API envanteri + kalite kanıtları + mimari kararlar + kapanış sonrası sorumluluklar).

---

## §3 · Önceki denemelerin tespit edilen kusurları (bunları TEKRAR ETME)

1. **Dosya adları özensizdi:** `modularization-plan/`, `PROMPTLARI.md`, `MOD-PROMPT-STATE.json` — İngilizce, ev adlandırma ailesine aykırı. Doğrusu: `monolit-bolumlenme-plan/`, `UYGULAMA-PROMPTLARI.md`, `MON-STATE.json` (apple-design ad ailesiyle paralel).
2. **Promptlar yüzeyseldi:** "kapsam + kapılar" listelemekle yetiniyordu; ölçülebilir kabul kriteri, grep komutları, halt koşulları, taşınan yüzey listesi yoktu. Ev barı: her prompt `driver --dump <tab>` öncesi/sonrası karşılaştırması veya `grep -c` sayımı gibi **somut kanıt** ister.
3. **Numaralandırma tutarsızdı:** başlık "60 prompt" diyordu, içerik 43; dalga aralıkları kaymıştı (M-4 "18–24" diye yazılmıştı). **Dalga aralıkları tam örtüşmeli (tile), başlıkta ve tabloda birebir aynı olmalı.**
4. **Bayat referanslar:** eski S9/S10 kapı adları, `S9-tam` kalıntıları, `verify-state-adapter-contract.mjs` yerine uydurma isimler. Kapı komutları yalnız §1.6'daki gerçek dosyalara işaret eder.
5. **Sığ anti-amnesia:** CURRENT-STATE 50 satırdı, FX envanteri yoktu, devralınan onay kapıları listede ama bağlayıcı metni yoktu. Ev barı: baseline çıpas tablosu (satır numaralarıyla), FX envanteri (satır satır), devralınan yükümlülükler (FX-P-66/67, merge checklist), sonraki adım bölümü.
6. **Kod uygulandı sanıldı ama uygulanmadı** — bu iyi; ama plan belgeleri "uygula" fiiliyle yazılmıştı. Seri durumu: `status: "ready"`, `completedPrompts: 0`, `nextPrompt: "MON-01"`.

---

## §4 · Yeniden üretilecek artefakt ağacı (hedef çıktı)

```
monolit-bolumlenme-plan/
├── UYGULAMA-PROMPTLARI.md          # ev kalıbında tam katalog (aşağıdaki gereksinimler)
├── MON-STATE.json                  # APPLE-DESIGN-STATE.json şemasında
├── README.md                       # program çerçevesi + oturum protokolü + komutlar
├── .anti-amnesia/
│   ├── CURRENT-STATE.md            # durum tablosu + baseline çıpalar + FX envanteri
│   └── LEDGER.md                   # 8 kolon append-only; seq 1 = program kurulum
└── deliverables/                   # MON-S karar belgeleri + kapanış belgesi (uygulama sırasında üretilir)
```

**Adlandırma:** klasör/dosya adları Türkçe ve mevcut aileyle (`docs/monolit-bolumlenme-haritasi.md`, `docs/apple-design/…`) uyumlu. Prompt kimliği `MON-xx`. Karar protokolleri numaralı (MON-S1/S2/S3…), kırmızı çizgiler MON-K1…, ortak sözleşme S1–S8, kapı komutları yalnız gerçek dosyalar.

**Dalga yapısı (minimum — Opus derinleştirebilir, daraltamaz):** güvence/karar altyapısı → saf çekirdek (dateUtils+helpers) → state (migrate/getDay/createDefaultData; en yüksek risk) → syncGlue (save) → domain modüller (prayer→zikir→quran→saygi→motivation→crisis→journal→health→library→report→map→profile→settings→reminders→messaging) → render (tab kabukları→overlay/header/nav→modals+render çekirdeği) → appSurface (App/timer/boot) → kapanış (delege envanteri, index.html geçişi, tam regression, docs senkron, kapanış belgesi). 24 hedef modülün tamamı kapsanmalı; her domain prompt'u TEK modül taşır.

**Her prompt başlığı minimum alanlar (bir eksik bile reddedilir):**
1. Kimlik: numara + Türkçe başlık + öncül prompt + ilgili kapılar.
2. Amaç (tek cümle, "neden").
3. Kapsam: taşınan fonksiyonlar/registry hedefi (`window.Seyma<Mod>`) + app.js satır ipuçları (canlı grep ile doğrulanacak).
4. Adım adım görev (envanter → bağımlılık sınıflandırma → modül dosyası → app.js kesme + delege → index.html `?v=` + harness FILES → fixture → kapılar → commit + anti-amnesia).
5. Yasaklar (kapsam dışına çıkma, donmuş dosyalar, atama yapan state fonksiyonları…).
6. Delege şablonu + registry erişim tablosu satırı (ilgiliyse).
7. Doğrulama: ölçülebilir komutlar + beklenen çıktılar (driver `--dump` karşılaştırması, `grep -c` sayıları, fixture adları).
8. Kabul kriteri: `PASS` koşulu net.
9. Halt koşulu + LEDGER protokolü.
10. Kapsam dışı sapma keşfi → LEDGER'a yazma zorunluluğu.

**Bağlayıcı program sözleşmesi (kataloğun ortak bölümünde, tekrarsız):**
- Değişmezler: I1–I6 (apple-design planından) + M-sözleşmeleri: **M1** delege shim + registry (`function <ad>(){ return window.Seyma<Mod>.<ad>.apply(null, arguments); }`), **M2** `var data/ui/dark` + 9 yeniden atama noktası app.js'te kalır, **M3** `SeyOnSyncState/SeyOnSynced` app.js'te, **M2'** `data` ataması yapan App handler'ları (9266/9270/9296) app.js'te kalır.
- K-kuralları: load-safe modüller (IIFE yüklemede başka modül verisi/DOM/ağ yok), FX guarded çağrı aynen, donmuş yüzeyler (`sync.js`, `panel/*`, `app/content/*`, `reminder*`, `sw.js`), cache-bust her dokunulan varlık, harness FILES senkronu (index.html'e eklenen her `app/core/*` aynı commit'te), tek prompt = tek yerel commit, sıra atlanamaz.
- Doğrulama kapıları: syntax (`node --check`), modularization boundary ailesi, driver+zikr, `test_faz10_sync`, panel, premium FX ailesi, quran/reminders aileleri, `verify-state-*` üçlüsü (state/migrate dalgalarında), tam regression (dalga sınırlarında).
- LOCAL-ONLY + veri güvenliği (G1–G4) her belgenin başında.
- Mimari kararlar numaralı protokolle kilitlenir: seçenekler + red gerekçeleri + karar belgesi (`deliverables/`) + LEDGER kaydı + sonraki promptları bağlama.

---

## §5 · Kanıt tazeleme protokolü (Opus'un ilk yarım saati)

Yukarıdaki çıpalar 2026-09-02 taramasıdır. Opus **kendi grep taramasını yapar**, sapmaları not eder ve planı canlı değerlere yazar:

```bash
cd /Users/m_ras/Desktop/seyma
wc -l app.js
grep -n 'function migrate(d){\|function getDay(d,date,idx){\|function save(touchSource,eventSpec){\|function createDefaultData(){\|var App={};\|window.App=App;\|Object.defineProperty(window' app.js
grep -n 'data\s*=\s*[^=]' app.js | head -20
grep -c 'App\.[a-zA-Z0-9_]*\s*=\s*function' app.js
grep -c 'SeyAudio\.\|SeyHaptics\.' app.js
sed -n '43,75p' index.html
sed -n '215,230p' .claude/skills/run-seyma/driver.mjs && sed -n '125,140p' .claude/skills/run-seyma/zikr-harness.mjs
git log --oneline -5 && git status --short --branch
```

Sapma yoksa plan çıpaları aynen kullanılır; sapma varsa plan canlı değerle güncellenir ve fark LEDGER'a yazılır. **Plan satır numaralarını "yol gösterici" diye işaretle** — uygulama prompt'ları her taşımada canlı grep doğrulaması istemelidir.

---

## §6 · Öz-Denetim Kapısı (teslim etmeden Opus KENDİ çıktısını şu listeye vurur)

- [ ] Dosya ağacı §4'teki gibi; adlandırma tamamen Türkçe/ev ailesi; İngilizce ad yok.
- UYGULAMA-PROMPTLARI.md: her prompt 9 minimum alanı içeriyor; kabul kriterleri ölçülebilir komut+beklenen değer; halt koşulları yazılı.
- Dalga haritası aralıkları katalog başlıklarıyla **birebir** (tile) — `grep -c '^## MON-'` = başlıktaki toplam = dalga tablosu toplamı = MON-STATE `totalPrompts`.
- Kapı komutları yalnız gerçek dosyalara işaret ediyor (`tests/app/test_modularization_boundary.js`, `tests/app/test_premium_*.js`, `tests/quran/test_quran_*.js`, `tests/reminders/run-reminder-smoke.mjs`, `verify-state-*.mjs`, `driver.mjs`, `zikr-harness.mjs`) — uydurma fixture/komut yok.
- Çıpa sayıları (§1.1) ve FILES dizileri (§1.2) canlı doğrulandı; bayat satır referansı kalmadı (özellikle state.js/syncGlue.js yorumlarındaki 4412/6229 tipi değerler).
- B1 canlı-getter, 6079 geçici takas, strict-mode throw, `App` atamalarının 17021 sonrası sürmesi gibi tuzaklar ilgili promptlara önleyici yazıldı.
- Anti-amnesia: MON-STATE.json (apple-design şeması) parse OK + dalga toplamları tutarlı; CURRENT-STATE baseline çıpaları satır numaralı; LEDGER 8 kolon, append-only, seq 1 kurulum kaydı; her prompt'ın anti-amnesia güncelleme talimatı var (aynı commit kuralı).
- Hiçbir prompt uygulanmadı; `status: "ready"`; LOCAL-ONLY maddeleri (G2/G3) her belgede var.
- Seri, FX yüzeyini korumayı test edilebilir kıldı: premium FX fixture ailesi + FX envanter sayımları + guarded-call korunumu.
- Kullanıcıya teslim özeti: ağaç + prompt sayısı + dalga haritası + hangi kanıtlara dayandığı + ilk uygulama adımı (MON-01) ve onay kapısı.

Başarısız olan her madde düzeltilmeden teslim yok.

---

## §7 · Teslim sonrası

- Planlamayı kullanıcıya **özet tablo** ile sun (dalga → prompt aralığı → risk → onay).
- **Uygulamayı başlatma.** İlk uygulama adımı ayrı onay: `MON-01` (soğuk başlangıç doğrulaması + baseline ön-uçuş; üretim dosyası değişmez).
- Planlama commit'i: tek yerel commit (örn. `monolit-bolum: MON programi planlama altyapisi`), push yok.
- Önceki taslak dosyaları (`monolit-bolumlenme-plan/` içindekiler) yeniden yazımda **üstüne yazılabilir**; `premium-fx-plan/`, `docs/`, `tests/`, `app/` altına YAZMA (yalnız §4 ağacı + LEDGER/CURRENT-STATE).
- Bu devir belgesi (`DEVIR-PROMPTU.md`) sildirilmez; seri kapanışında kapanış belgesi onu referans alır.