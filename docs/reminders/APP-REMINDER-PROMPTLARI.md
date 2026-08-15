# APP-REMINDER-UX — Session-Bağımsız Sıralı Prompt Seti

Bu dosya, plans/APP-HATIRLATMA-VE-BILDIRIM-UX-PLANI.md planını uygulamaya dönüştürmek için hazırlanmış canonical prompt listesidir. Promptlar sırayla çalıştırılır; bir prompt başarısızsa sonraki prompta geçilmez.

## Kullanım sözleşmesi

Her başlık altındaki prompt tek başına yeni bir session'a verilebilir. Ajan promptun başlangıç, allowlist, görev, doğrulama ve kapanış bölümlerini birlikte almalıdır.

Plan ürün authority'sidir. Kod veya test planla çelişiyorsa ajan varsayım yapmaz; discrepancy yazar ve blocked olur.

Tüm promptlarda ortak sert sınırlar vardır: gerçek browser yok, gerçek veri repo'suna yazma yok, token veya özel veri isteme yok, testte gerçek ağ yok, kullanıcı açıkça ve kapsamı belirli şekilde onaylamadan push / merge / deploy yok.

## Tüm promptlar için context / auto-compact güvenlik sözleşmesi

Bu bölüm her REM promptunun ayrılmaz parçasıdır; prompt ayrı bir session'a
kopyalandığında da birlikte taşınır.

- Promptu chat geçmişine güvenerek değil, canonical dosyaları yeniden okuyarak
  başlat. Eski sohbet özeti, eski SHA, eski state veya eski test sonucu tek
  başına güncel kanıt sayılmaz.
- Büyük dosyaları bütünüyle context'e alma. `rg` ile hedef fonksiyonu bul,
  bounded line range oku; büyük diff ve uzun test çıktısını sohbete ham olarak
  taşıma. Ayrıntılı çıktıyı geçici yerel logda tut, yalnız PASS/FAIL ve gerekli
  hata bölümünü raporla.
- Context daralmaya, otomatik compact yaklaşmaya veya görev geçmişi güvenilmez
  hale gelmeye başlarsa kodlama / staging / commit işlemine devam etme. Önce
  kısa bir checkpoint yaz: aktif prompt, HEAD, çalışma ağacı, değişen dosyalar,
  son doğrulanan komutlar, açık blocker/discrepancy ve tek sonraki güvenli adım.
- Checkpoint sonrasında yeni session'a geç. Yeni session canonical state,
  ledger, prompt parity ve Git durumunu yeniden doğrulamadan önceki işin
  tamamlandığını varsayamaz; sonraki REM'e otomatik ilerleyemez.
- Handoff kompakt ve eyleme dönük olmalı; tam tarihçe append-only ledger veya
  evidence dosyasında kalır. `releaseApproval.status` bu süreçte değişmez.

Canlıya alma için canonical kilit [`APP-REMINDER-APPROVAL-GATE.md`](APP-REMINDER-APPROVAL-GATE.md)'dir. Varsayılan state `NOT_APPROVED` kalır. Yeşil test, local commit, `ready_for_user_acceptance`, “tamam”, “devam” veya eski sohbet mesajı kullanıcı onayı değildir. `mustafaras/seyma-data` yazımı için canlıya alma onayından bağımsız ayrıca açık veri yazma izni gerekir.

Önerilen yeni test dosyaları mevcut olmayabilir; ilgili prompt onları oluşturur. Mevcut testler silinmez, taşınmaz ve sessizce zayıflatılmaz.

## Ortak başlangıç

Her prompttan önce:

    cd /Users/m_ras/Desktop/seyma
    git status --short --branch
    git rev-parse HEAD

Şu sırayla oku:

1. AGENTS.md
2. docs/reminders/README.md
3. docs/reminders/APP-REMINDER-CONTEXT.md
4. docs/reminders/APP-REMINDER-STATE.json
5. docs/reminders/APP-REMINDER-ANTI-AMNESIA-LEDGER.md
6. Bu promptun referans verdiği plan bölümü ve test matrisi
7. Yalnız promptun belirttiği kaynak fonksiyonları ve bounded line range

Sonra context senkronizasyonunu doğrula:

    node docs/reminders/verify-reminder-context.mjs

Bu komut başarısızsa prompt başlatılmaz; prompt / ledger / state / traceability
elle varsayımla düzeltilmez. Release veya canlı kelimesi geçen promptlarda
approval gate ayrıca okunur ve `releaseApproval.status` `approved` değilse
yalnız hazırlık yapılır.

State içindeki activePrompt ile seçilen prompt ID aynı değilse hiçbir edit yapma. blockedPrompt doluysa önce o blocker çözülür.

## Ortak kapanış

Her prompt sonunda:

    git diff --check
    git diff --name-only
    git status --short --branch

Tüm testler geçmeden commit veya done yoktur. Başarılı ajan:

- yalnız allowlist dosyalarını stage eder;
- prompt ID'sini commit mesajına koyar;
- ledger satırına SHA, test sonucu ve evidence path yazar;
- STATE.json içindeki lastCompletedPrompt, activePrompt ve nextSafeAction alanlarını günceller;
- SESSION-HANDOFF-TEMPLATE.md ile kısa handoff verir.

Hiçbir kapanış adımı `releaseApproval.status` değerini kendi kendine
`approved` yapamaz. Onay verilmediyse kapanışta açıkça `NOT_APPROVED` ve
`live action: not performed` yazılır.

Fail, belirsizlik veya allowlist dışı ihtiyaçta üretim kodunu yarım commit etme. blockedPrompt ayarla, exact command / beklenen / gözlenen / etkiyi ledger ve decisions log'a yaz, sonraki prompta geçme.

---

## Faz R0 — Authority, sözleşme ve test zemini

### REM-00 — Canlı baseline, authority ve capability audit

**Context güvenliği:** Bu prompt tek başına verildiğinde de canonical dosyaları ve Git durumunu yeniden doğrula. Context daralırsa dur, kısa checkpoint / handoff yaz ve yeni sessiona geç; compact özeti veya eski sohbeti güncel kanıt sayma.

**Hedef:** Yalnız dokümantasyon ve kanıt baseline'ı oluştur. app.js, sync.js, sw.js, styles.css, index.html ve data değişmeyecek.

**Oku:** GELISTIRME-PLANI §0, teknik ilkeler, §11–13, §16–18; UX planı §3, §5, §8, §13–15; run-seyma/SKILL.md; tests/README.md.

**Allowlist:** APP-REMINDER-ANTI-AMNESIA-LEDGER.md, APP-REMINDER-STATE.json, APP-REMINDER-DECISIONS.md, evidence/REM-00.md.

**Görev:**

1. app.js içindeki notification, prayer, zikr, therapy, Saygı, reading, journal, save, migrate ve lifecycle fonksiyonlarını rg ile bul.
2. sync.js sanitize / merge sınırını ve sw.js notificationclick / push sınırını gerçek koddan çıkar.
3. Planla kodu mevcut, kısmi, yok ve belirsiz olarak karşılaştır.
4. Statik PWA'da uygulama kapalıyken zamanlanmış local notification garantisi olmadığını capability matrix olarak kaydet.
5. Test baseline komutlarını ve beklenen evidence seviyesini kaydet.
6. Plan-kod farklarını karar uydurmadan decisions log'a yaz.

**Doğrulama:**

    node --check app.js
    node --check sync.js
    node --check sw.js
    git diff --check

**Kabul:** Capability matrix gerçek kaynaklara dayanır; en az üç discrepancy veya discrepancy yok kanıtı yazılıdır; üretim, data, secret ve deploy değişmemiştir.

**Kapanış:** REM-00 evidence path ve commit SHA ile done yapılır; STATE activePrompt REM-01 olur.

### REM-01 — State, privacy ve delivery contract freeze

**Context güvenliği:** Bu prompt tek başına verildiğinde de canonical dosyaları ve Git durumunu yeniden doğrula. Context daralırsa dur, kısa checkpoint / handoff yaz ve yeni sessiona geç; compact özeti veya eski sohbeti güncel kanıt sayma.

**Hedef:** ReminderDefinition, ReminderPreference, ReminderOccurrence, ReminderDelivery ve SuppressionContext için tek sözleşme kilitle.

**Oku:** UX planı §5.1–5.3, §8.1–8.8, §13.1–13.4 ve REM-00 evidence; app.js migrate/save/data; sync.js sanitize.

**Allowlist:** APP-REMINDER-DECISIONS.md, APP-REMINDER-TEST-MATRIX.md, ledger ve STATE.

**Görev:**

1. Her alanı zorunlu / opsiyonel, owner, retention ve privacy seviyesiyle tabloya dök.
2. Tek data objesi ilkesi ile local-only delivery logunu uzlaştır.
3. Önerilen kararı açık yaz: kullanıcı tercihleri additive canonical state alanında, uzak payload sanitize dışında; cihaz delivery logu kısa ömürlü local key; cihazlar arası preference sync varsayılan değil.
4. data.notifications ile reminder delivery'nin neden ayrı olduğunu kanıtla.
5. Native private title ile uygulama içi detail body ayrımını test edilebilir negatif kurallara çevir.
6. Migration, sanitize, multi-tab, timezone, duplicate ve retention risklerini test matrix'e ekle.

**Doğrulama:** Belgelerde aynı alanın iki farklı sahibi olmadığını rg ile kontrol et; JSON state parse edilsin; git diff --check.

**Kabul:** Tek state/privacy/sync boundary ve her alanın owner'ı açık; kod değişmemiş.

**Kapanış:** REM-02 activePrompt ve nextSafeAction olarak ayarlanır.

### REM-02 — Synthetic test harness contract

**Context güvenliği:** Bu prompt tek başına verildiğinde de canonical dosyaları ve Git durumunu yeniden doğrula. Context daralırsa dur, kısa checkpoint / handoff yaz ve yeni sessiona geç; compact özeti veya eski sohbeti güncel kanıt sayma.

**Hedef:** Üretim koduna dokunmadan tests/reminders altında ağsız sentetik fixture zemini kur.

**Oku:** tests/README.md, run-seyma/SKILL.md, UX planı §15.1–15.4 ve mevcut VM / mock fixture desenleri.

**Allowlist:** tests/reminders/README.md, tests/reminders/helpers/reminder-test-helper.js, test_reminder_contract.js, test_reminder_timezones.js contract skeleton, tests/README.md yönlendirme satırı, docs/reminders evidence.

**Görev:**

1. Deterministic clock, Europe/Istanbul timezone, localStorage, Notification ve fetch mock contract'ı oluştur.
2. Mock fetch hiçbir zaman gerçek ağ açmasın; token veya ham payload raporlamasın.
3. Assert helper hata mesajı sensitive text taşımamalı.
4. Catalog, policy ve engine testlerinin saf fonksiyon sınırlarını belirle.
5. Missing field, unknown field preservation, deep clone ve second-call parity assertion'ları ekle.

**Doğrulama:**

    node tests/reminders/test_reminder_contract.js
    node --check tests/reminders/helpers/reminder-test-helper.js
    node --check tests/reminders/test_reminder_contract.js
    git diff --check

**Kabul:** En az 10 contract assertion PASS; helper network, browser ve real data kullanmıyor.

**Kapanış:** REM-03 ready; yalnız test commit'i.

---

## Faz R1 — Catalog, state ve Reminder Center

### REM-03 — Reminder catalog ve private copy

**Context güvenliği:** Bu prompt tek başına verildiğinde de canonical dosyaları ve Git durumunu yeniden doğrula. Context daralırsa dur, kısa checkpoint / handoff yaz ve yeni sessiona geç; compact özeti veya eski sohbeti güncel kanıt sayma.

**Hedef:** Çekirdek reminder tanımlarını DOM, network ve persistence yan etkisi olmayan versioned catalog olarak oluştur.

**Oku:** UX planı §5, §7, §9 ve §16; index.html classic script sırası; app/core/constants.js deseni.

**Allowlist:** app/core/reminderCatalog.js, index.html script/cache-bust satırları, tests/reminders/test_reminder_catalog.js ve helper.

**Görev:**

1. prayer, zikr, therapy, saygi, reading, journal, system için id, category, priority, triggerType, deepLink, privateTitle/body, detail keys, defaultWindow, defaultChannel, snoozeOptions, suppressionRules ve definitionVersion alanlarını tanımla.
2. ID'ler data.notifications ile çakışmasın.
3. Private copy Türkçe, yargısız ve hassasiyetsiz olsun.
4. Script app.js'den önce yüklenmeli; cache-bust mevcut convention'a uymalı.
5. Catalog network, DOM, Date ve localStorage kullanmamalı.

**Doğrulama:**

    node --check app/core/reminderCatalog.js
    node tests/reminders/test_reminder_catalog.js
    node --check app.js
    git diff --check

**Kabul:** Tüm catalog kayıtları zorunlu alanlara sahip; private copy negatif testleri PASS.

**Kapanış:** REM-04 ready.

### REM-04 — Preference state ve additive migration

**Context güvenliği:** Bu prompt tek başına verildiğinde de canonical dosyaları ve Git durumunu yeniden doğrula. Context daralırsa dur, kısa checkpoint / handoff yaz ve yeni sessiona geç; compact özeti veya eski sohbeti güncel kanıt sayma.

**Hedef:** Eski save'leri bozmadan reminder preference state'ini migrate et.

**Oku:** REM-01 kararı; app.js data initializer, migrate, save, load ve settings render; verify-state-migration-boundary.mjs.

**Allowlist:** app.js veya gerekçeli app/core/reminderState.js, index.html gerekiyorsa, test_reminder_migration.js, test_reminder_privacy.js local-state kısmı.

**Görev:**

1. Reminder preference'i mevcut state convention'a additive ekle.
2. Minimal, rich, malformed ve unknown-field state'lerde güvenli default üret.
3. Migration iki kez çalıştığında deep parity ver.
4. Preference state ile device delivery logunu ayır.
5. Sync sanitize kararı doğrulanmadan private preference'ı uzak payload'a çıkarma.

**Doğrulama:**

    node --check app.js
    node tests/reminders/test_reminder_migration.js
    node tests/reminders/test_reminder_privacy.js
    node .claude/skills/run-seyma/verify-state-migration-boundary.mjs
    git diff --check

**Kabul:** Eski days, prayer, profile ve zikr alanları korunuyor; secret veya detail remote fixture'a girmiyor.

**Kapanış:** REM-05 ready; migration receipt yaz.

### REM-05 — Reminder Center erişilebilir shell

**Context güvenliği:** Bu prompt tek başına verildiğinde de canonical dosyaları ve Git durumunu yeniden doğrula. Context daralırsa dur, kısa checkpoint / handoff yaz ve yeni sessiona geç; compact özeti veya eski sohbeti güncel kanıt sayma.

**Hedef:** Native permission istemeden Ayarlar altında premium Reminder Center shell'i kur.

**Oku:** UX planı §6, §9.4, §10, §12; app.js settings / overlay / inline App desenleri; styles.css token'ları.

**Allowlist:** app.js, styles.css, test_reminder_center.js ve ilgili headless assertion; index.html yalnız cache-bust.

**Görev:**

1. Ayarlar içine Hatırlatmalar ve bildirimler girişini ekle.
2. Today mode, kalan öneri, permission placeholder, quiet hours, daily budget ve Bugün tümünü sustur alanlarını göster.
3. Kategori kartlarını catalog'dan üret; stringleri tekrarlama.
4. Native olmadan in-app channel kullanılabilir olsun.
5. Light/dark, small viewport, safe area, focus, reduced-motion ve screen-reader heading kurallarını koru.
6. Yeni framework veya global event sistemi ekleme.

**Doğrulama:**

    node --check app.js
    node .claude/skills/run-seyma/driver.mjs
    node tests/reminders/test_reminder_center.js
    git diff --check

**Kabul:** Native izin istemeden shell render edilir; empty / normal state ve iki tema PASS.

**Kapanış:** REM-06 ready.

### REM-06 — Profiles, category toggles ve permission explanation

**Context güvenliği:** Bu prompt tek başına verildiğinde de canonical dosyaları ve Git durumunu yeniden doğrula. Context daralırsa dur, kısa checkpoint / handoff yaz ve yeni sessiona geç; compact özeti veya eski sohbeti güncel kanıt sayma.

**Hedef:** Sakin, Dengeli, Destekleyici, Ritüel odaklı ve Özel profillerini ve kategori tercihlerinin açıklamasını ekle.

**Oku:** UX planı §6.2, §6.5, §6.6, §11.1; mevcut settings controls.

**Allowlist:** app.js, styles.css gerekirse, test_reminder_profiles.js, test_reminder_permission.js explanation kısmı.

**Görev:**

1. Profil seçimi mevcut preference'i silmeden öneri merge etsin.
2. En fazla üç başlangıç kategorisi, kategori toggle ve channel seçimini uygulama içinde kur.
3. Permission state'i unsupported, default, granted, denied, temporary-error, pwa-limited olarak açıkla.
4. Permission request çağrısı bu promptta yoktur.
5. Reddedilince in-app channel açık kalır; izin loop başlamaz.

**Doğrulama:**

    node --check app.js
    node tests/reminders/test_reminder_profiles.js
    node tests/reminders/test_reminder_permission.js
    node .claude/skills/run-seyma/driver.mjs

**Kabul:** Profil geçişi data kaybı yaratmaz; permission açıklaması mock olmadan browser açmadan test edilir.

**Kapanış:** REM-07 ready.

### REM-07 — Quiet hours, daily budget ve capacity mode

**Context güvenliği:** Bu prompt tek başına verildiğinde de canonical dosyaları ve Git durumunu yeniden doğrula. Context daralırsa dur, kısa checkpoint / handoff yaz ve yeni sessiona geç; compact özeti veya eski sohbeti güncel kanıt sayma.

**Hedef:** Quiet interval, daily cap, cooldown, priority ve capacity mode kararlarını saf policy katmanında kur.

**Oku:** UX planı §4.3, §5.2, §8.5–8.7, §17.

**Allowlist:** app/core/reminderPolicy.js veya app.js pure helper bölümü, app.js adapter, test_reminder_policy.js, test_reminder_quiet_hours.js.

**Görev:**

1. Varsayılan quiet interval 22:30–07:30 ve native daily cap 3'ü kullanıcı tercihi olarak modelle.
2. P0/P1/P2/P3, same-category cooldown ve budget kararlarını saf input/output yap.
3. Dengeli / Hafif gün / Sessiz / Ritüel odaklı modlarını uygula.
4. Tamamlanmamayı ceza veya alarm olarak yorumlama.
5. Policy network, DOM ve localStorage kullanmasın.

**Doğrulama:**

    node tests/reminders/test_reminder_policy.js
    node tests/reminders/test_reminder_quiet_hours.js
    node --check app.js
    git diff --check

**Kabul:** Saat, gün, priority, mode ve cap matrix'i PASS; budget aşımında native occurrence yok.

**Kapanış:** G1 kapanır; REM-08 ready.

---

## Faz R2 — Deterministik engine ve lifecycle

### REM-08 — Occurrence, timezone, midnight ve DST engine

**Context güvenliği:** Bu prompt tek başına verildiğinde de canonical dosyaları ve Git durumunu yeniden doğrula. Context daralırsa dur, kısa checkpoint / handoff yaz ve yeni sessiona geç; compact özeti veya eski sohbeti güncel kanıt sayma.

**Hedef:** Aynı input'un her cihazda aynı occurrence ID ve local date üretmesini sağla.

**Oku:** UX planı §8.3–8.4, §15.2; mevcut today, prayer parsing ve Hicri offset helpers.

**Allowlist:** app/core/reminderEngine.js veya app.js pure engine, test_reminder_scheduler.js, test_reminder_timezones.js.

**Görev:**

1. Fixed time, day-part ve prayer offset trigger'ları için occurrence üret.
2. Kimliği reminderId + localDate + scheduledAt + timezone + definitionVersion bileşenlerinden deterministik üret.
3. Europe/Istanbul, midnight, exact threshold, DST ve Hicri offset senaryolarını test et.
4. Stale prayer cache'te yanlış kesin saat üretme.
5. Geçmiş occurrence'ları native replay kuyruğuna koyma.

**Doğrulama:**

    node tests/reminders/test_reminder_scheduler.js
    node tests/reminders/test_reminder_timezones.js
    node --check app/core/reminderEngine.js
    git diff --check

**Kabul:** Aynı input aynı ID; midnight, DST, Hicri offset ve stale data testleri PASS; engine yan etkisiz.

**Kapanış:** REM-09 ready.

### REM-09 — Suppression, dedupe ve device delivery journal

**Context güvenliği:** Bu prompt tek başına verildiğinde de canonical dosyaları ve Git durumunu yeniden doğrula. Context daralırsa dur, kısa checkpoint / handoff yaz ve yeni sessiona geç; compact özeti veya eski sohbeti güncel kanıt sayma.

**Hedef:** Focus, visibility, timer ve reopen tekrarlarında duplicate üretme; kısa cihaz teslim günlüğü tut.

**Oku:** UX planı §8.4–8.8, §13.2–13.4; mevcut shownNotificationIds ve data.notifications.

**Allowlist:** app/core/reminderDelivery.js veya app.js helpers, app.js adapter, test_reminder_delivery.js, test_reminder_privacy.js.

**Görev:**

1. scheduled, shown, opened, snoozed, dismissed, suppressed ve failed durumlarını tanımla.
2. Son 30 gün veya son 200 occurrence retention uygula.
3. Suppression reason'ı kısa ve whitelist edilmiş tut.
4. Native body, user note, therapy text ve ilaç detayını loglama.
5. data.notifications ile ID veya merge helper paylaşma.

**Doğrulama:**

    node tests/reminders/test_reminder_delivery.js
    node tests/reminders/test_reminder_privacy.js
    node --check app.js
    git diff --check

**Kabul:** Multi-open duplicate, retention ve sensitive negative testleri PASS.

**Kapanış:** REM-10 ready.

### REM-10 — Foreground scheduler lifecycle

**Context güvenliği:** Bu prompt tek başına verildiğinde de canonical dosyaları ve Git durumunu yeniden doğrula. Context daralırsa dur, kısa checkpoint / handoff yaz ve yeni sessiona geç; compact özeti veya eski sohbeti güncel kanıt sayma.

**Hedef:** Boot, visibility, focus, pageshow, online ve sınırlı timer kontrollerini idempotent scheduler ile birleştir.

**Oku:** run-seyma/SKILL.md timer/fetch no-op bölümü; app.js lifecycle listener, render ve save.

**Allowlist:** app.js, test_reminder_lifecycle.js, driver assertion gerekirse.

**Görev:**

1. Occurrence -> policy -> delivery zincirini idempotent evaluateReminders sözleşmesine bağla.
2. Lifecycle olaylarının aynı occurrence'ı tekrar göstermesini engelle.
3. Timer'ı testte no-op bırak; mevcut network polling'i hızlandırma veya değiştirme.
4. Hidden state ve foreground state davranışını policy'ye bağla.
5. Hataları raw exception / user data olmadan whitelist reason ile kaydet.

**Doğrulama:**

    node --check app.js
    node tests/reminders/test_reminder_lifecycle.js
    node .claude/skills/run-seyma/driver.mjs
    git diff --check

**Kabul:** Boot, focus, pageshow, online ve timer fixture'ları duplicate üretmez; driver network olmadan PASS.

**Kapanış:** REM-11 ready.

### REM-11 — Catch-up, grouping ve conflict resolution

**Context güvenliği:** Bu prompt tek başına verildiğinde de canonical dosyaları ve Git durumunu yeniden doğrula. Context daralırsa dur, kısa checkpoint / handoff yaz ve yeni sessiona geç; compact özeti veya eski sohbeti güncel kanıt sayma.

**Hedef:** Reopen sonrası reminder spam'i yerine anlamlı catch-up ve tek summary üret.

**Oku:** UX planı §8.5, §8.8, §9.1–9.2.

**Allowlist:** reminder engine / app.js adapter, test_reminder_catchup.js, test_reminder_budget.js.

**Görev:**

1. Aynı zaman penceresindeki low-priority occurrence'ları tek summary yap.
2. User-created P1, ritual P2 ve discovery P3 precedence uygula.
3. Son 24 saat catch-up'ını tek uygulama içi karta indir; geçmiş native replay yapma.
4. Geçmiş namaz / ilaç olaylarında “kaçırdın” dili kullanma.
5. Coalescing reason'ını hassas veri olmadan logla.

**Doğrulama:**

    node tests/reminders/test_reminder_catchup.js
    node tests/reminders/test_reminder_budget.js
    node --check app.js

**Kabul:** 10 due occurrence tek native summary olur; precedence ve no-replay testleri PASS.

**Kapanış:** G2 kapanır; REM-12 ready.

---

## Faz R3 — Uygulama içi deneyim ve eylemler

### REM-12 — In-app reminder inbox ve premium card

**Context güvenliği:** Bu prompt tek başına verildiğinde de canonical dosyaları ve Git durumunu yeniden doğrula. Context daralırsa dur, kısa checkpoint / handoff yaz ve yeni sessiona geç; compact özeti veya eski sohbeti güncel kanıt sayma.

**Hedef:** Native izin yokken bugünün reminder'larını sakin, gruplanmış ve erişilebilir card yüzeyinde göster.

**Oku:** UX planı §6.1, §9.4, §10; app.js card/overlay/render ve styles.css.

**Allowlist:** app.js, styles.css, test_reminder_inbox.js, driver / zikr harness assertion.

**Görev:**

1. Empty, single, grouped ve suppressed state'lerini render et.
2. Cardda category, kısa private title, detail, main action ve overflow actions bulunsun.
3. Bugün mute ve kalan öneri sayısını görünür yap.
4. User text için mevcut escape helper kullan.
5. Small viewport, light/dark, safe-area, focus ve reduced-motion kurallarını koru.

**Doğrulama:**

    node --check app.js
    node .claude/skills/run-seyma/driver.mjs
    node tests/reminders/test_reminder_inbox.js
    git diff --check

**Kabul:** Native olmadan core card kullanılabilir; XSS ve empty-state assertions PASS.

**Kapanış:** REM-13 ready.

### REM-13 — Snooze, today mute, disable ve deep-link

**Context güvenliği:** Bu prompt tek başına verildiğinde de canonical dosyaları ve Git durumunu yeniden doğrula. Context daralırsa dur, kısa checkpoint / handoff yaz ve yeni sessiona geç; compact özeti veya eski sohbeti güncel kanıt sayma.

**Hedef:** Kullanıcı reminder'ı erteleyebilsin, bugün susturabilsin, kalıcı kapatabilsin ve doğru ekrana gidebilsin.

**Oku:** UX planı §6.4, §9.5, §11.3; mevcut App handlers ve deep-link desenleri.

**Allowlist:** app.js, styles.css gerekirse, test_reminder_actions.js, test_reminder_deeplinks.js.

**Görev:**

1. 10 dakika, 30 dakika, 1 saat, bu akşam, yarın, bugün gösterme ve kalıcı kapatma seçeneklerini semantik olarak uygun reminder'larda sun.
2. Snooze yeni occurrence üretirken duplicate yaratmasın.
3. faith, zikr, room, saygi, reading, gunluk ve settings hedeflerini eşleştir.
4. Card click ve native click aynı target contract'ını kullansın.
5. Bir kategori kapanınca diğer kategori veya permission state değişmesin.

**Doğrulama:**

    node --check app.js
    node tests/reminders/test_reminder_actions.js
    node tests/reminders/test_reminder_deeplinks.js
    node .claude/skills/run-seyma/driver.mjs

**Kabul:** Action state izlenebilir; deep-link doğru; kapatma geri alınabilir.

**Kapanış:** G3 kapanır; REM-14 ready.

---

## Faz R4 — Ritüel çekirdeği

### REM-14 — Namaz / İman Köşesi integration

**Context güvenliği:** Bu prompt tek başına verildiğinde de canonical dosyaları ve Git durumunu yeniden doğrula. Context daralırsa dur, kısa checkpoint / handoff yaz ve yeni sessiona geç; compact özeti veya eski sohbeti güncel kanıt sayma.

**Hedef:** Mevcut prayer timing ve İman Köşesi'ni kopyalamadan güvenli reminder occurrence / deep-link üret.

**Oku:** GELISTIRME-PLANI §34; UX planı §7.1, §8.3, §18; prayer helpers, refreshPrayerTimes, nextPrayerInfo, stale cache ve togglePrayer.

**Allowlist:** app.js, reminder catalog / engine adapter, test_reminder_prayer.js, test_reminder_timezones.js genişletmesi.

**Görev:**

1. Kullanıcının seçtiği vakit ve offset için occurrence üret.
2. Stale, missing, method/location change ve offline fallback'te kesin olmayan vakti kesin bildirim gibi gösterme.
3. Native copy namazın kılınıp kılınmadığını söylemesin.
4. Vakit sonrası işaretleme deep-link'ini koru; kaydı zorunlu yapma.
5. Zikir / tefekkür çakışmasını grouping policy'ye bırak.

**Doğrulama:**

    node --check app.js
    node tests/reminders/test_reminder_prayer.js
    node tests/reminders/test_reminder_timezones.js
    node .claude/skills/run-seyma/zikr-harness.mjs

**Kabul:** Altı vakit, offset, stale cache, city/method change ve Hicri offset testleri PASS; performed/missed private body'ye sızmıyor.

**Kapanış:** REM-15 ready.

### REM-15 — Zikir / tefekkür integration

**Context güvenliği:** Bu prompt tek başına verildiğinde de canonical dosyaları ve Git durumunu yeniden doğrula. Context daralırsa dur, kısa checkpoint / handoff yaz ve yeni sessiona geç; compact özeti veya eski sohbeti güncel kanıt sayma.

**Hedef:** User-selected tek günlük zikir daveti ve düşük frekanslı journey dönüşü ekle; seri baskısı üretme.

**Oku:** GELISTIRME-PLANI zikir bölümleri; UX planı §7.2; zikir state, reflection, overlay ve feature flag.

**Allowlist:** app.js / reminder adapter, test_reminder_zikr.js, zikr harness assertion gerekiyorsa.

**Görev:**

1. Kullanıcı seçimi olmadan native zikir reminder açma.
2. Journey dönüşünü haftalık veya seçilen pencerede düşük frekansta üret.
3. Session sonrası tefekkür kapanışını optional yap.
4. Streak kaybı, “seri bozulacak”, ceza veya dini doğruluk copy'si kullanma.
5. Hidden / visible feature flag davranışını test et.

**Doğrulama:**

    node --check app.js
    node tests/reminders/test_reminder_zikr.js
    node .claude/skills/run-seyma/zikr-harness.mjs
    node tests/reminders/test_reminder_privacy.js

**Kabul:** Preference yokken native yok; reflection text native veya delivery loga girmiyor; flag / journey testleri PASS.

**Kapanış:** REM-16 ready.

### REM-16 — Terapi odası support integration

**Context güvenliği:** Bu prompt tek başına verildiğinde de canonical dosyaları ve Git durumunu yeniden doğrula. Context daralırsa dur, kısa checkpoint / handoff yaz ve yeni sessiona geç; compact özeti veya eski sohbeti güncel kanıt sayma.

**Hedef:** User-selected nefes / ilk adım / öz şefkat / CBT pratiğine nazik, düşük frekanslı dönüş sun; klinik iddia kurma.

**Oku:** UX planı §7.3, §11.2, §13.3; therapy disclaimer ve tool akışları.

**Allowlist:** app.js, styles.css support state gerekiyorsa, test_reminder_therapy.js, test_reminder_privacy.js.

**Görev:**

1. User-selected practice dışında reminder üretme.
2. Native private title'da terapi, CBT, mood ve kriz metnini varsayılan olarak göstermeme.
3. Hafif gün / düşük kapasitede sıklığı artırma; azalt veya sustur.
4. CBT note, feeling, safe-share ve crisis text notification / delivery loga girmesin.
5. Deep-link doğru tool'a gitsin; zorunlu form / sonuç üretme.
6. Mevcut güvenlik kaynaklarını ve klinik sınırı bozma.

**Doğrulama:**

    node --check app.js
    node tests/reminders/test_reminder_therapy.js
    node tests/reminders/test_reminder_privacy.js
    node .claude/skills/run-seyma/driver.mjs

**Kabul:** Hassas negatif assertions, light mode, quiet mode ve disabled senaryoları PASS; klinik / acil yardım iddiası yok.

**Kapanış:** Safety discrepancy varsa blocked; yoksa REM-17 ready.

### REM-17 — Saygı / Günün Öncüsü reading integration

**Context güvenliği:** Bu prompt tek başına verildiğinde de canonical dosyaları ve Git durumunu yeniden doğrula. Context daralırsa dur, kısa checkpoint / handoff yaz ve yeni sessiona geç; compact özeti veya eski sohbeti güncel kanıt sayma.

**Hedef:** Günlük ilham okumasına dönüşü kolaylaştır; article loading, race ve Okudum gate'ini bozma.

**Oku:** UX planı §7.4–7.5; Saygı current code, modal, article, readAt, scroll gate ve harness.

**Allowlist:** app.js, styles.css gerekirse, test_reminder_saygi.js ve ilgili harness assertions.

**Görev:**

1. User-selected reading window için en fazla bir daily read reminder üret.
2. Article missing / fetch failure'da kullanıcıyı okudu sayma.
3. Native copy kişi adı / makale / hassas bağlamı explicit opt-in olmadan göstermesin.
4. Okudum, mediaFed, collection ve modal deep-link davranışını koru.
5. Person race ve selected person identity'sini verify et.

**Doğrulama:**

    node --check app.js
    node tests/reminders/test_reminder_saygi.js
    node .claude/skills/run-seyma/zikr-harness.mjs
    node tests/reminders/test_reminder_privacy.js

**Kabul:** Race, loading, read gate, duplicate ve private copy testleri PASS.

**Kapanış:** REM-18 ready.

### REM-18 — Reading, journal ve tek akşam kapanışı

**Context güvenliği:** Bu prompt tek başına verildiğinde de canonical dosyaları ve Git durumunu yeniden doğrula. Context daralırsa dur, kısa checkpoint / handoff yaz ve yeni sessiona geç; compact özeti veya eski sohbeti güncel kanıt sayma.

**Hedef:** Zikir, Saygı, kitap ve günlük için aynı akşam çoklu native bildirim yerine tek optional coalesced davet üret.

**Oku:** UX planı §7.5–7.6, §8.5, §10.3, §17; library, daily light, journal, reading progress ve evening nudge code.

**Allowlist:** app.js / engine adapter, styles.css gerekirse, test_reminder_evening.js, catchup extension.

**Görev:**

1. Akşam için en fazla tek ana native davet, uygulama içinde gruplanmış alternatifler üret.
2. Ana hedefi kullanıcı seçimine göre seç; note / mood / journal text native body'ye taşıma.
3. Kayıt girilmemesini eksik veri veya başarısızlık olarak gösterme.
4. Uyku hazırlığı ve evening ritual çakışmasını budget / quiet policy'ye bağla.
5. Morning check-in + evening close varsayılan native çift bildirim olmasın.

**Doğrulama:**

    node --check app.js
    node tests/reminders/test_reminder_evening.js
    node tests/reminders/test_reminder_catchup.js
    node .claude/skills/run-seyma/driver.mjs

**Kabul:** Tek akşam native occurrence; alternatifler in-app; hassas metin sızıntısı yok.

**Kapanış:** G4 core ritual gate kapanır; REM-19 ready.

---

## Faz R5 — Günlük bakım, sağlık ve özel günler

### REM-19 — Su, uyku, kafein ve hareket bütçesi

**Context güvenliği:** Bu prompt tek başına verildiğinde de canonical dosyaları ve Git durumunu yeniden doğrula. Context daralırsa dur, kısa checkpoint / handoff yaz ve yeni sessiona geç; compact özeti veya eski sohbeti güncel kanıt sayma.

**Hedef:** Mevcut care nudge'larını ortak budget'a bağla; ayrı alarm çoğalmasını engelle.

**Oku:** UX planı §7.7, §8.6, §10.2, roadmap care nudge bölümleri; mevcut water, sleep, caffeine, magnesium, vitamin ve soul activity kodu.

**Allowlist:** app.js, styles.css gerekirse, test_reminder_care.js, test_reminder_budget.js.

**Görev:**

1. User en fazla iki care kategorisini native seçebilsin.
2. Su için uyanıklık penceresinde en fazla üç nudge; kafein için tek sleep-close; uyku için tek preparation window uygula.
3. Hareket / esneme opt-in olsun.
4. Mevcut nudge'ları duplicate etmeden catalog / policy'ye bağla.
5. Sağlık önerisini tıbbi gereklilik gibi yazma.

**Doğrulama:**

    node --check app.js
    node tests/reminders/test_reminder_care.js
    node tests/reminders/test_reminder_budget.js
    node .claude/skills/run-seyma/driver.mjs

**Kabul:** Care collision / budget PASS; mevcut kayıtlar korunuyor; aynı mesaj iki kartta duplicate değil.

**Kapanış:** REM-20 ready.

### REM-20 — Medication / supplement guarded flow

**Context güvenliği:** Bu prompt tek başına verildiğinde de canonical dosyaları ve Git durumunu yeniden doğrula. Context daralırsa dur, kısa checkpoint / handoff yaz ve yeni sessiona geç; compact özeti veya eski sohbeti güncel kanıt sayma.

**Hedef:** Yalnız kullanıcının kurduğu zamanı hatırlat; doz, etkileşim, tedavi ve atlanan doz kararı verme.

**Oku:** UX planı §7.8, §13.3, §15.1; roadmap §11; mevcut medication / supplement fields ve migration / sync sınırı.

**Allowlist:** app.js veya pure helper, styles.css form / warning gerekiyorsa, test_reminder_medication.js, test_reminder_privacy.js; sync.js yalnız privacy gate açıkça gerekirse ve önce ledger blocker ile.

**Görev:**

1. User-entered name, time, private label ve note sınırını uygula.
2. Güvenlik metnini uygulama içinde göster.
3. Native default copy genel kalsın; ilaç adı / doz body'ye sızmasın.
4. Missed occurrence otomatik yeni doz / telafi önerisi üretmesin.
5. Edit, delete, today mute, local clear ve retention'ı test et.
6. Sağlık API'si veya dış servis ekleme.

**Doğrulama:**

    node --check app.js
    node tests/reminders/test_reminder_medication.js
    node tests/reminders/test_reminder_privacy.js
    node .claude/skills/run-seyma/verify-state-migration-boundary.mjs

**Kabul:** Doz / tedavi önerisi yok; ilaç adı, note ve health text native / sync / panel fixture'ında yok; yalnız user-owned schedule occurrence üretir.

**Kapanış:** Clinical safety gate kanıtlanmadan done verme.

### REM-21 — Hicri / özel gün tercihleri

**Context güvenliği:** Bu prompt tek başına verildiğinde de canonical dosyaları ve Git durumunu yeniden doğrula. Context daralırsa dur, kısa checkpoint / handoff yaz ve yeni sessiona geç; compact özeti veya eski sohbeti güncel kanıt sayma.

**Hedef:** Hicri / kandil reminder'larını opt-in ve offset-aware yap.

**Oku:** UX planı §7.9; hijriCalendar.js, kandil lookup ve prayer offset.

**Allowlist:** app.js / catalog adapter, styles.css gerekirse, test_reminder_special_days.js, test_reminder_timezones.js.

**Görev:**

1. Tüm özel günler, seçili günler ve hiçbiri tercihlerini oluştur.
2. Native default kapalı kalsın; opt-in sonrası quiet / budget uygula.
3. Hicri offset -2, 0 ve +2 occurrence'larını test et.
4. Copy zorunluluk, ticari veya puanlayıcı olmasın.
5. Existing Hijri source ve badge mantığını yeniden yazma.

**Doğrulama:**

    node --check app.js
    node --check hijriCalendar.js
    node tests/reminders/test_reminder_special_days.js
    node tests/reminders/test_reminder_timezones.js

**Kabul:** Default opt-in ve timezone / offset testleri PASS; seçilmeyen özel gün native üretmiyor.

**Kapanış:** G5 kapanır; REM-22 ready.

---

## Faz R6 — Native PWA kanalı ve Service Worker sınırı

### REM-22 — Notification permission state machine

**Context güvenliği:** Bu prompt tek başına verildiğinde de canonical dosyaları ve Git durumunu yeniden doğrula. Context daralırsa dur, kısa checkpoint / handoff yaz ve yeni sessiona geç; compact özeti veya eski sohbeti güncel kanıt sayma.

**Hedef:** Permission request'i ilk yüklemede değil, kullanıcı açıkça native channel açtığında yap.

**Oku:** UX planı §6.5–6.6, §9.1–9.3; mevcut ÆON permission functions ve permission key'leri.

**Allowlist:** app.js, test_reminder_permission.js, test_reminder_native.js mock contract, styles.css gerekirse.

**Görev:**

1. unsupported, default, granted, denied, error ve PWA-limited state'lerini ayır.
2. Permission request'i explicit user action'a bağla.
3. Denied durumda in-app fallback ve tarayıcı ayar rehberi göster; loop üretme.
4. ÆON permission ile reminder permission'ın aynı alanı yazmadığını test et.
5. Preview notification private copy ile sunulsun.

**Doğrulama:**

    node --check app.js
    node tests/reminders/test_reminder_permission.js
    node tests/reminders/test_reminder_native.js
    node .claude/skills/run-seyma/driver.mjs

**Kabul:** Initial boot request yapmıyor; denied / unsupported fallback var; state transition mock ile PASS.

**Kapanış:** REM-23 ready.

### REM-23 — Foreground native delivery ve click routing

**Context güvenliği:** Bu prompt tek başına verildiğinde de canonical dosyaları ve Git durumunu yeniden doğrula. Context daralırsa dur, kısa checkpoint / handoff yaz ve yeni sessiona geç; compact özeti veya eski sohbeti güncel kanıt sayma.

**Hedef:** Native notification yalnız permission, budget, privacy ve desteklenen foreground koşulunda göster.

**Oku:** UX planı §8.3, §9.2–9.3; showNativeAeonNotification payload contract.

**Allowlist:** app.js, test_reminder_native.js, test_reminder_deeplinks.js, manifest.json yalnız icon metadata gerekiyorsa.

**Görev:**

1. Reminder delivery ile native display adapter'ını ayır.
2. private title, safe body, tag, renotify false, main action ve snooze / mute action contract'ını uygula.
3. Permission, budget, quiet, duplicate ve visibility engellerinde native call yapılmadığını test et.
4. Click payload'ını occurrence ID ve allowlisted deep-link ile eşleştir.
5. Background schedule garantisi veya replay ekleme.

**Doğrulama:**

    node --check app.js
    node tests/reminders/test_reminder_native.js
    node tests/reminders/test_reminder_deeplinks.js
    node .claude/skills/run-seyma/driver.mjs

**Kabul:** Native yalnız policy PASS iken çağrılıyor; click doğru target; privacy / duplicate PASS.

**Kapanış:** REM-24 ready; foreground kanıtını background kanıtı diye raporlama.

### REM-24 — Service Worker click, retry ve no-spam boundary

**Context güvenliği:** Bu prompt tek başına verildiğinde de canonical dosyaları ve Git durumunu yeniden doğrula. Context daralırsa dur, kısa checkpoint / handoff yaz ve yeni sessiona geç; compact özeti veya eski sohbeti güncel kanıt sayma.

**Hedef:** sw.js yalnız click / open-client / güvenli event routing sınırında kalsın.

**Oku:** sw.js notificationclick, manifest, run-seyma timer/fetch safety.

**Allowlist:** sw.js, manifest.json gerekirse, test_reminder_sw.js, app.js dar click adapter gerekirse.

**Görev:**

1. Reminder click payload'ını allowlisted target ile doğrula.
2. Open client / focus / postMessage akışını mevcut ÆON routing'i bozmadan genişlet.
3. Geçersiz veya hassas payload'ı ignore et.
4. Backend, token, arbitrary schedule, retry storm ve background local alarm ekleme.
5. Retry varsa bounded ve idempotent olsun.
6. Docs içinde closed-app timed notification guaranteed ifadesi kullanma.

**Doğrulama:**

    node --check sw.js
    node tests/reminders/test_reminder_sw.js
    node --check app.js
    git diff --check

**Kabul:** Existing ÆON click testi kırılmıyor; target allowlist dışına çıkmıyor; no-secret fixture PASS.

**Kapanış:** G6 kapanır; REM-25 ready.

---

## Faz R7 — Privacy, sync ve panel aynası

### REM-25 — Sync sanitize ve local-only privacy audit

**Context güvenliği:** Bu prompt tek başına verildiğinde de canonical dosyaları ve Git durumunu yeniden doğrula. Context daralırsa dur, kısa checkpoint / handoff yaz ve yeni sessiona geç; compact özeti veya eski sohbeti güncel kanıt sayma.

**Hedef:** Gerçek data repo'ya yazmadan sync sanitize, merge ve local-only boundary'yi kanıtla.

**Oku:** UX planı §8.2, §13.1–13.4, REM-01 decision; sync.js sanitize, merge ve receipt.

**Allowlist:** sync.js yalnız privacy boundary için, test_reminder_sync_privacy.js, tests/test_faz10_sync.js regression, docs decisions / ledger / state.

**Görev:**

1. Synthetic rich state içinde preference, medication label, therapy detail, body ve delivery fixtures kur.
2. Sanitize sonucunda remote payload'a hangi alanların girdiğini kanıtla.
3. Secret, token, raw private copy, user note ve therapy text payload'dan çıkar.
4. Full-replace ve old-device/new-device conflict senaryolarını test et.
5. Gerçek GitHub fetch veya mustafaras/seyma-data çağrısı yapma.

**Doğrulama:**

    node --check sync.js
    node tests/reminders/test_reminder_sync_privacy.js
    node tests/test_faz10_sync.js
    git diff --check

**Kabul:** Zero real network; private fields remote fixture'ta yok; sync regression PASS.

**Kapanış:** G7 privacy kısmı kapanır; REM-26 ready.

### REM-26 — Panel mirror ve redacted system health

**Context güvenliği:** Bu prompt tek başına verildiğinde de canonical dosyaları ve Git durumunu yeniden doğrula. Context daralırsa dur, kısa checkpoint / handoff yaz ve yeni sessiona geç; compact özeti veya eski sohbeti güncel kanıt sayma.

**Hedef:** Panelde yalnız gerekli ve redakte sistem aggregate'i göster; private routine göstermeme.

**Oku:** Panel-v2 current state, panelCoverageManifest, panel.html/panel.js ayrımı; UX planı §13.2 ve Faz R8.

**Allowlist:** panel.js, panel.html, panelCoverageManifest.js, panel.css yalnız redacted status için; test_reminder_panel_projection.js ve ilgili panel testleri.

**Görev:**

1. Önce panel reminder verisine gerçekten ihtiyaç var mı no-op kararıyla kanıtla.
2. Gerekirse yalnız aggregate enabled category count, stale prayer flag, permission health veya scheduler health projection ekle.
3. Private schedule, therapy, medication, mood, notes, body ve occurrence ID'yi redaction negative testleriyle yasakla.
4. Panel-v1 ve Panel-v2 test scope'larını karıştırma.
5. Panel koduna app state mutasyonu veya yeni write network ekleme.

**Doğrulama:**

    node --check panel.js
    node --check panelCoverageManifest.js
    node tests/reminders/test_reminder_panel_projection.js
    node tests/test_panel_p6_qa_release.js
    node -e "const fs=require('fs'); const s=fs.readFileSync('panel.html','utf8'); const o=(s.match(/<script/g)||[]).length; const c=(s.match(/<\\/script>/g)||[]).length; if(o!==c) process.exit(1); console.log('script tags OK')"

**Kabul:** No-op veya redacted projection kanıtı var; hassas negative test ve panel regression PASS; cache-bust gerekiyorsa aynı committe güncel.

**Kapanış:** REM-27 ready.

---

## Faz R8 — Accessibility, full regression ve release readiness

### REM-27 — Accessibility, copy ve theme QA

**Context güvenliği:** Bu prompt tek başına verildiğinde de canonical dosyaları ve Git durumunu yeniden doğrula. Context daralırsa dur, kısa checkpoint / handoff yaz ve yeni sessiona geç; compact özeti veya eski sohbeti güncel kanıt sayma.

**Hedef:** Hatırlatma katmanını WCAG AA, Türkçe copy, light/dark, mobile, reduced-motion ve privacy açısından denetle.

**Oku:** UX planı §4.1, §9.3, §12, §16; styles.css token'ları ve mevcut accessibility fixtures.

**Allowlist:** app.js, styles.css, panel files yalnız gerçek QA düzeltmesi gerekiyorsa; test_reminder_accessibility.js, test_reminder_copy.js, test_reminder_contrast.js, evidence.

**Görev:**

1. Card, modal, banner ve button için name, role, focus order, escape/back, touch target ve live-region testleri ekle.
2. Light/dark tüm reminder text token'larını hesapla; normal text en az 4.5:1, large text en az 3:1.
3. Terapi, ilaç adı/dozu, mood, prayer completion ve shame copy'nin native surface'e sızmasını negatif test et.
4. Reduced-motion ve emoji bağımlılığı testleri ekle.
5. Kopyayı sıcak, seçenek sunan ve klinik otorite iddiasız tut.

**Doğrulama:**

    node --check app.js
    node tests/reminders/test_reminder_accessibility.js
    node tests/reminders/test_reminder_copy.js
    node tests/reminders/test_reminder_contrast.js
    node .claude/skills/run-seyma/driver.mjs
    node .claude/skills/run-seyma/zikr-harness.mjs

**Kabul:** Her iki tema, focus, semantic, copy ve contrast assertions PASS.

**Kapanış:** G8 accessibility gate kapanır; REM-28 ready.

### REM-28 — Full regression, migration ve deterministic time matrix

**Context güvenliği:** Bu prompt tek başına verildiğinde de canonical dosyaları ve Git durumunu yeniden doğrula. Context daralırsa dur, kısa checkpoint / handoff yaz ve yeni sessiona geç; compact özeti veya eski sohbeti güncel kanıt sayma.

**Hedef:** Programın mevcut Şeyma davranışını bozmadığını ve bütün zaman / privacy sınırlarını kanıtla.

**Oku:** APP-REMINDER-TEST-MATRIX.md tüm R0–R8 satırları; tests/README.md; AGENTS full validation; REM-27 evidence.

**Allowlist:** Test / harness dosyaları; yalnız program kök nedenliyse app.js, sync.js, sw.js, styles.css, index.html; docs evidence / ledger / state.

**Görev:**

1. app.js, sync.js, sw.js, hijriCalendar.js ve yeni reminder modules syntax check.
2. Root fixture globu ile Panel-v2 globunu ayrı çalıştır.
3. driver, zikr harness, migration boundary, helper boundary ve tüm reminder tests'i çalıştır.
4. Exact threshold, midnight, quiet boundary, Europe/Istanbul, DST, Hicri offset, stale prayer, offline/online, reopen ve duplicate matrix'ini çalıştır.
5. Privacy matrix: notification body, sync sanitize, panel redaction, token absence, data repo zero-write.
6. diff name-only ve diff-check ile scope denetle.

**Doğrulama:**

    node --check app.js
    node --check sync.js
    node --check sw.js
    node .claude/skills/run-seyma/driver.mjs
    node .claude/skills/run-seyma/zikr-harness.mjs
    node .claude/skills/run-seyma/verify-state-migration-boundary.mjs
    node .claude/skills/run-seyma/verify-state-helper-boundary.mjs
    for f in tests/reminders/test_*.js; do node "$f"; done
    for f in tests/test_*.js; do node "$f"; done
    for f in tests/panel-v2/test_panel_v2_*.js; do node "$f"; done

**Kabul:** İlgili tüm testler PASS; known unrelated failure varsa exact scope ile decisions / ledger'a yazılmış; browser, server, real network ve data repo yok.

**Kapanış:** REM-29 ready; full matrix receipt yaz.

### REM-29 — Release packet ve kullanıcı cihazı kabul hazırlığı

**Context güvenliği:** Bu prompt tek başına verildiğinde de canonical dosyaları ve Git durumunu yeniden doğrula. Context daralırsa dur, kısa checkpoint / handoff yaz ve yeni sessiona geç; compact özeti veya eski sohbeti güncel kanıt sayma.

**Hedef:** Push yapmadan source, test, remote, Pages ve device kanıtlarını birbirine karıştırmadan release packet hazırla.

**Oku:** AGENTS Git/deploy ve evidence-level kuralları; tüm ledger; REM-28 receipt.

**Allowlist:** ledger, STATE.json, evidence/REM-29.md, decisions; README / roadmap yalnız kullanıcı ayrıca isterse.

**Görev:**

1. Source SHA, test summary, migration/privacy/accessibility receipt ve allowlist audit'i ayrı bölümlerde yaz.
2. Push / merge / deploy yapılmadığını veya açık yetki varsa sonraki ayrı işlemi belirt.
3. Clean/incognito user-device checklist hazırla: permission, lock-screen privacy, deep-link, quiet hours, app-closed limitation, iOS/Android farkı ve user confirmation.
4. Evidence level kullan; definitely fixed deme.
5. Deferred / blocked maddeleri release-ready diye etiketleme.

**Doğrulama:**

    git status --short --branch
    git rev-parse HEAD
    git diff --check

Gerçek browser açma, server başlatma, push veya deployment yapma.

**Kabul:** Release packet source/test/deploy/device kanıtlarını ayırıyor; user-device testinin ajan tarafından yapılmadığı açık; açık risklerin owner ve next action'ı var.

**Kapanış:** Program state ready_for_user_acceptance olabilir; deployed değildir. Kullanıcı ayrıca push commit merge deploy demeden dışa dönük Git / Pages işlemi yapma.

---

## Faz R9 — Ürün derinliği, sistem güvenilirliği ve release kontrolü

### REM-30 — Başarı ölçütleri ve mahremiyet korumalı observability

**Context güvenliği:** Bu prompt tek başına verildiğinde de canonical dosyaları ve Git durumunu yeniden doğrula. Context daralırsa dur, kısa checkpoint / handoff yaz ve yeni sessiona geç; compact özeti veya eski sohbeti güncel kanıt sayma.

**Hedef:** Planın “sakinlik, kontrol, mahremiyet ve eyleme geçiricilik” hedeflerini ölçülebilir ama kullanıcıyı izlemeyen kabul kriterlerine çevir.

**Oku:** UX planı §2.1–2.3, §14.5 ve §17; REM-01, REM-07 ve REM-25 kararları.

**Allowlist:** docs/reminders/APP-REMINDER-DECISIONS.md, APP-REMINDER-TEST-MATRIX.md, ledger, STATE.json, tests/reminders/test_reminder_metrics.js veya evidence/REM-30.md. Analytics servisi, gerçek kullanıcı verisi ve production telemetry yok.

**Görev:**

1. Her ürün hedefi için kullanıcı kontrolü, sakinlik, erişim, mahremiyet ve güven kabul kriteri tanımla.
2. Ölçümlerin yalnız sentetik fixture, local aggregate veya açık kullanıcı geri bildirimiyle yapılacağı sınırı yaz.
3. Click-through veya completion oranını tek başarı ölçüsü yapma; dismiss, snooze, mute ve düşük bildirim yoğunluğunu da güvenlik sinyali olarak ele al.
4. Hassas kategori, mood, terapi, ibadet veya ilaç davranışı çıkaran analitik tanımlama.
5. Ölçüm sözleşmesini traceability ve test matrix satırına bağla.

**Doğrulama:**

    node tests/reminders/test_reminder_metrics.js
    node docs/reminders/verify-reminder-context.mjs
    git diff --check

**Kabul:** Metrik sözleşmesi kişisel profil çıkarmıyor, dış telemetry zorunlu kılmıyor ve her metriğin yanlış yorumlanma riski yazılı.

**Kapanış:** G9-A evidence yaz; REM-31 ready.

### REM-31 — Sabah, gün içi, akşam ve düşük kapasite akışları

**Context güvenliği:** Bu prompt tek başına verildiğinde de canonical dosyaları ve Git durumunu yeniden doğrula. Context daralırsa dur, kısa checkpoint / handoff yaz ve yeni sessiona geç; compact özeti veya eski sohbeti güncel kanıt sayma.

**Hedef:** Hatırlatmaları tek tek kartlardan çıkarıp günün bağlamına göre sakin ve çakışmasız bir akışa yerleştir.

**Oku:** UX planı §4.3, §6.4, §9.1–9.3 ve §10; REM-07, REM-11, REM-18.

**Allowlist:** app.js, styles.css, ilgili reminder modülü, tests/reminders/test_reminder_daily_flows.js ve evidence. data/ ve gerçek sync yok.

**Görev:**

1. Sabah açılışı, gün içi tek odak, akşam kapanışı ve kullanıcı seçtiği hafif gün modunu aynı policy üzerinden modelle.
2. Namaz, zikir, okuma, günlük ve bakım adaylarını aynı zaman aralığında coalesce et.
3. Düşük kapasite modunda zorunlu dil, başarısızlık skoru veya guilt copy üretme.
4. App-open, focus, visibility ve pageshow tekrarlarında aynı akışın duplicate üretmediğini kanıtla.
5. Her akışın deep-link ve “şimdi değil” çıkışını tanımla.

**Doğrulama:**

    node tests/reminders/test_reminder_daily_flows.js
    node tests/reminders/test_reminder_budget.js
    node .claude/skills/run-seyma/driver.mjs
    git diff --check

**Kabul:** Üç günlük dönem ve düşük kapasite senaryosunda en fazla ortak bütçe kadar aday görünür; akşamda tek primary davet kalır; no-op ve dismiss güvenli.

**Kapanış:** G9-B evidence yaz; REM-32 ready.

### REM-32 — Reminder Center gelişmiş kontrol yüzeyi

**Context güvenliği:** Bu prompt tek başına verildiğinde de canonical dosyaları ve Git durumunu yeniden doğrula. Context daralırsa dur, kısa checkpoint / handoff yaz ve yeni sessiona geç; compact özeti veya eski sohbeti güncel kanıt sayma.

**Hedef:** Kullanıcının reminder davranışını tek merkezden anlamasını, önizlemesini, test etmesini ve geri almasını sağla.

**Oku:** UX planı §6.1–6.5, §9.4, §13.4 ve §14.4; REM-05, REM-06, REM-13, REM-22.

**Allowlist:** app.js, styles.css, index.html cache-bust satırı ve tests/reminders/test_reminder_center_advanced.js.

**Görev:**

1. Kategori, profil, kanal, sessiz saat, günlük bütçe, düşük kapasite ve “bugün sustur” kontrollerini tek bilgi mimarisinde birleştir.
2. Kullanıcıya hassas body içermeyen önizleme ve sentetik “test reminder” akışı sun; gerçek Notification gösterme.
3. Son reminder history kaydını kısa ömürlü, raw body içermeyen ve silinebilir olarak göster.
4. Global ayarın kategori override’ını ezmesini veya sessizce kaybetmesini engelle.
5. Reset, undo, disabled, permission unsupported ve empty state’leri erişilebilir biçimde yaz.

**Doğrulama:**

    node tests/reminders/test_reminder_center_advanced.js
    node tests/reminders/test_reminder_actions.js
    node docs/reminders/verify-reminder-context.mjs
    git diff --check

**Kabul:** Kullanıcı her ayarı tek akışta geri alabiliyor; preview gerçek dış sisteme gitmiyor; geçmişte private body yok.

**Kapanış:** G9-C evidence yaz; REM-33 ready.

### REM-33 — Sistem durumu, stale veri ve kullanıcıya dürüst uyarı

**Context güvenliği:** Bu prompt tek başına verildiğinde de canonical dosyaları ve Git durumunu yeniden doğrula. Context daralırsa dur, kısa checkpoint / handoff yaz ve yeni sessiona geç; compact özeti veya eski sohbeti güncel kanıt sayma.

**Hedef:** Vakit verisi eskidiğinde, offline durumda, izin reddedildiğinde veya sync beklediğinde kullanıcıyı yanlış güvene sokmadan bilgilendir.

**Oku:** UX planı §3.2, §4.5, §7.10, §8.8, §9.5 ve §10.4; sync.js, sw.js ve hijriCalendar.js bounded sections.

**Allowlist:** app.js, sync.js yalnız sanitize / status contract gerekiyorsa, sw.js yalnız click/status boundary gerekiyorsa, styles.css, tests/reminders/test_reminder_system_status.js.

**Görev:**

1. Fresh, stale, unavailable, permission denied, unsupported, offline ve recovery durumlarını ayrı state olarak tanımla.
2. Stale prayer data ile yeni vakitmiş gibi native veya in-app reminder üretme.
3. Sync hatasını kullanıcının reminder deneyimini kilitlemeden, raw error ve token göstermeden ifade et.
4. Background scheduling garantisi olmayan platformlarda bunu anlaşılır biçimde bildir.
5. Recovery sonrası duplicate veya geçmişten sınırsız reminder yağmuru üretme.

**Doğrulama:**

    node tests/reminders/test_reminder_system_status.js
    node tests/reminders/test_reminder_prayer.js
    node tests/reminders/test_reminder_lifecycle.js
    node --check app.js
    node --check sync.js

**Kabul:** Her capability state deterministik ve private; stale veri reminder üretmiyor; offline recovery tek kontrollü catch-up yapıyor.

**Kapanış:** G9-D evidence yaz; REM-34 ready.

### REM-34 — Opt-in kişiselleştirme ve adaptasyon guardrail’leri

**Context güvenliği:** Bu prompt tek başına verildiğinde de canonical dosyaları ve Git durumunu yeniden doğrula. Context daralırsa dur, kısa checkpoint / handoff yaz ve yeni sessiona geç; compact özeti veya eski sohbeti güncel kanıt sayma.

**Hedef:** Kişiselleştirmeyi yalnız açık kullanıcı sinyaline dayalı, açıklanabilir ve geri alınabilir hale getir.

**Oku:** UX planı §2.2, §4.2, §11.1–11.4, §13.3 ve §18; REM-01, REM-06, REM-30.

**Allowlist:** app.js, reminder policy module, styles.css, tests/reminders/test_reminder_personalization.js, decisions, evidence.

**Görev:**

1. Kullanıcının seçtiği saat, kategori, snooze ve feedback sinyallerini açıkça kaynaklandır.
2. Mood, terapi metni, ibadet tamamlanması, sağlık davranışı veya sessiz kalmayı otomatik hassas profil sinyaline dönüştürme.
3. Öneri ile otomatik değişikliği ayır; her önerinin nedenini ve geri alma yolunu göster.
4. Opt-in, opt-out, reset ve no-history durumlarını test et.
5. Adaptif sistemin günlük bütçe, quiet hours ve düşük kapasite guardrail’lerini aşamadığını kanıtla.

**Doğrulama:**

    node tests/reminders/test_reminder_personalization.js
    node tests/reminders/test_reminder_privacy.js
    node tests/reminders/test_reminder_policy.js
    node docs/reminders/verify-reminder-context.mjs

**Kabul:** Açık opt-in olmadan adaptasyon yok; kullanıcı değişikliği açıklanabilir, tersine çevrilebilir ve hassas çıkarım içermiyor.

**Kapanış:** G9-E evidence yaz; REM-35 ready.

### REM-35 — Haftalık sakin özet ve yansıma akışı

**Context güvenliği:** Bu prompt tek başına verildiğinde de canonical dosyaları ve Git durumunu yeniden doğrula. Context daralırsa dur, kısa checkpoint / handoff yaz ve yeni sessiona geç; compact özeti veya eski sohbeti güncel kanıt sayma.

**Hedef:** Daha fazla bildirim üretmeden haftalık reflection, “bu hafta” ve “on this day” deneyimini güvenli biçimde tasarla.

**Oku:** UX planı §2.2, §7.8, §10.3, §14.5, §17 ve GELISTIRME-PLANI ilgili roadmap maddeleri.

**Allowlist:** app.js, styles.css, tests/reminders/test_reminder_digest.js, local-only evidence. Sync / panel / external analytics yok.

**Görev:**

1. Haftalık özetin ham günlük, terapi, mood, ibadet completion veya ilaç detail üretmediğini garanti et.
2. Özetin yalnız cihaz içinde ve kullanıcı istediğinde görünmesini; native gönderimin ayrı opt-in olmasını tanımla.
3. “Yaptın / yapmadın” score yerine seçilebilir sakin reflection ve no-op state kullan.
4. Empty, first-week, cleared-history, timezone ve retention sonrası state’leri test et.
5. Özetin reminder budget ve quiet hours ile çakışmadığını kanıtla.

**Doğrulama:**

    node tests/reminders/test_reminder_digest.js
    node tests/reminders/test_reminder_privacy.js
    node docs/reminders/verify-reminder-context.mjs

**Kabul:** Haftalık deneyim local-only, isteğe bağlı, yargısız ve private; native veya sync davranışı ayrıca yetkilendirilmeden eklenmiyor.

**Kapanış:** G9-F evidence yaz; REM-36 ready.

### REM-36 — Türkçe copy lexicon ve mahremiyet negatif dili

**Context güvenliği:** Bu prompt tek başına verildiğinde de canonical dosyaları ve Git durumunu yeniden doğrula. Context daralırsa dur, kısa checkpoint / handoff yaz ve yeni sessiona geç; compact özeti veya eski sohbeti güncel kanıt sayma.

**Hedef:** Tüm reminder yüzeylerinde Şeyma’nın sıcak, saygılı ve klinik otorite iddiası taşımayan dilini standardize et.

**Oku:** UX planı §4, §9, §16 ve mevcut Turkish UI copy; REM-03, REM-16, REM-20, REM-27.

**Allowlist:** app.js, reminder catalog, styles.css yalnız layout etkilenirse, tests/reminders/test_reminder_copy.js, docs/reminders evidence.

**Görev:**

1. Private title, in-app detail, empty, error, permission, stale, snooze, mute ve recovery copy için canonical lexicon oluştur.
2. “Kaçırdın”, “başarısız”, “zorundasın”, “tedavi et”, “normal değilsin” ve benzeri shame / clinical authority kalıplarını negatif test et.
3. Native yüzeyde terapi, ilaç, mood, ibadet completion veya journal body sızıntısını engelle.
4. Emoji’yi anlamın tek kaynağı yapma; uzun Türkçe metinlerin 460px ekranda taşmasını test et.
5. Copy key tekrarlarını catalog / helper ile azalt; plan dışı yeni kategori adı üretme.

**Doğrulama:**

    node tests/reminders/test_reminder_copy.js
    node tests/reminders/test_reminder_privacy.js
    node tests/reminders/test_reminder_accessibility.js
    git diff --check

**Kabul:** Copy negative suite PASS; tüm native metinler genel ve mahrem; hata / kapatma dili kullanıcıyı suçlamıyor.

**Kapanış:** G9-G evidence yaz; REM-37 ready.

### REM-37 — Premium görsel sistem, responsive ve performans QA

**Context güvenliği:** Bu prompt tek başına verildiğinde de canonical dosyaları ve Git durumunu yeniden doğrula. Context daralırsa dur, kısa checkpoint / handoff yaz ve yeni sessiona geç; compact özeti veya eski sohbeti güncel kanıt sayma.

**Hedef:** Reminder yüzeyini mevcut premium Şeyma tasarımına uyumlu, iki temada erişilebilir ve düşük maliyetli hale getir.

**Oku:** UX planı §9, §12, §16; styles.css token sistemi; Panel-v2 erişilebilirlik kanıtları yalnız görsel prensip için.

**Allowlist:** styles.css, app.js render path, index.html cache-bust, tests/reminders/test_reminder_visual.js, test_reminder_contrast.js, test_reminder_performance.js.

**Görev:**

1. Yeni renkleri light ve dark token olarak tanımla; hardcoded status renklerini kaldır.
2. <=460px, safe-area, long Turkish copy, focus, 44px touch target ve reduced-motion durumlarını doğrula.
3. Scheduler tick’inde tüm uygulamayı gereksiz render etme; reminder candidate değişmediyse no-op bırak.
4. Card, banner, modal, native preview ve empty state arasında tek görsel hiyerarşi kur.
5. CSS / render performansını sentetik ölç ve görsel kaliteyi işlevsellikten koparma.

**Doğrulama:**

    node tests/reminders/test_reminder_visual.js
    node tests/reminders/test_reminder_contrast.js
    node tests/reminders/test_reminder_performance.js
    node .claude/skills/run-seyma/driver.mjs
    git diff --check

**Kabul:** İki tema, küçük viewport, reduced-motion ve long-copy PASS; candidate no-op render ölçülmüş; contrast normal text >=4.5:1.

**Kapanış:** G9-H evidence yaz; REM-38 ready.

### REM-38 — Multi-tab concurrency, idempotence ve conflict sınırı

**Context güvenliği:** Bu prompt tek başına verildiğinde de canonical dosyaları ve Git durumunu yeniden doğrula. Context daralırsa dur, kısa checkpoint / handoff yaz ve yeni sessiona geç; compact özeti veya eski sohbeti güncel kanıt sayma.

**Hedef:** İki sekme, offline recovery ve local full-replace sync davranışlarında reminder state’in kaybolmasını veya duplicate oluşmasını engelle.

**Oku:** UX planı §8.4, §8.5, §13.2; AGENTS data safety; sync.js save / schedule / sanitize / merge bounded sections; REM-04, REM-09, REM-25.

**Allowlist:** app.js, sync.js yalnız reminder merge / sanitize boundary gerekiyorsa, tests/reminders/test_reminder_concurrency.js, existing sync fixtures.

**Görev:**

1. Aynı occurrence için iki tabın idempotent delivery sonucu verdiğini test et.
2. Bir tabda preference değişirken diğer tabın daha yeni state’i eski full replace ile ezmesini engelle veya fail-closed yap.
3. Offline → online dönüşünde local delivery journal ile canonical preference’ı ayır.
4. Storage event / visibility / retry sırasını duplicate ve data loss açısından fixture’a bağla.
5. Gerçek data repo’ya yazmadan sync mock’unda anti-clobber kanıtı üret.

**Doğrulama:**

    node tests/reminders/test_reminder_concurrency.js
    node tests/test_faz10_sync.js
    node tests/test_panel_p0_sync.js
    node docs/reminders/verify-reminder-context.mjs

**Kabul:** İki tab ve offline recovery testleri duplicate / clobber üretmiyor; gerçek network ve gerçek veri yok.

**Kapanış:** G9-I evidence yaz; REM-39 ready.

### REM-39 — Retention, export, clear ve reset yaşam döngüsü

**Context güvenliği:** Bu prompt tek başına verildiğinde de canonical dosyaları ve Git durumunu yeniden doğrula. Context daralırsa dur, kısa checkpoint / handoff yaz ve yeni sessiona geç; compact özeti veya eski sohbeti güncel kanıt sayma.

**Hedef:** Kullanıcının reminder preference, delivery history ve local log üzerinde anlama, silme, dışa aktarma ve sıfırlama kontrolünü tamamla.

**Oku:** UX planı §8.2, §13.1–13.4, §14.4; REM-01, REM-09, REM-25, REM-32.

**Allowlist:** app.js, sync.js sanitize boundary, tests/reminders/test_reminder_retention.js, test_reminder_privacy.js, docs evidence.

**Görev:**

1. Preference, occurrence, delivery journal, notification history ve digest için ayrı retention süreleri tanımla.
2. Clear history, disable all, export summary ve full reset işlemlerini confirmation / undo / no-secret sınırlarıyla tasarla.
3. Clear işleminden sonra eski occurrence’ın yeniden oynatılmasını engelle; gerekli tombstone veya version sınırını açıkla.
4. Export’un raw note, therapy body, medication dose, token veya sync secret içermediğini negatif test et.
5. Eski state, malformed storage ve missing field durumlarında güvenli default üret.

**Doğrulama:**

    node tests/reminders/test_reminder_retention.js
    node tests/reminders/test_reminder_privacy.js
    node tests/reminders/test_reminder_migration.js
    git diff --check

**Kabul:** Retention ve clear davranışları deterministik; export privacy-safe; reset sonrası duplicate / private residue yok.

**Kapanış:** G9-J evidence yaz; REM-40 ready.

### REM-40 — Planın tamamı için reconciliation ve traceability audit

**Context güvenliği:** Bu prompt tek başına verildiğinde de canonical dosyaları ve Git durumunu yeniden doğrula. Context daralırsa dur, kısa checkpoint / handoff yaz ve yeni sessiona geç; compact özeti veya eski sohbeti güncel kanıt sayma.

**Hedef:** UX planındaki hiçbir ana bölümün prompt, test, allowlist, karar ve kanıt sahibi olmadan kalmadığını kanıtla.

**Oku:** UX planı §1–§21; APP-REMINDER-TRACEABILITY-MATRIX.md; prompt seti; ledger; test matrix; decisions.

**Allowlist:** docs/reminders/APP-REMINDER-TRACEABILITY-MATRIX.md, TEST-MATRIX.md, DECISIONS.md, ledger, STATE.json, evidence/REM-40.md. Runtime edit yok.

**Görev:**

1. Planın tüm başlıklarını section-level olarak matrix’e bağla; genel “hepsi kapsandı” ifadesi kullanma.
2. Her REM ID için plan section, test gate, allowlist, evidence owner ve next dependency kontrol et.
3. Plan ile mevcut kod / test arasında kalan her farkı discrepancy veya deferred olarak yaz.
4. Prompt sırasını, ledger sırasını ve state active prompt değerini validator ile karşılaştır.
5. Eksik coverage varsa prompt ekle veya neden kapsam dışı kaldığını karar günlüğüne yaz; ileri promptu sırf liste var diye ready yapma.

**Doğrulama:**

    node docs/reminders/verify-reminder-context.mjs
    node --check docs/reminders/verify-reminder-context.mjs
    git diff --check

**Kabul:** Plan §1–§21’in her biri en az bir prompt ve test / kanıt sahibine sahip; validator PASS; runtime ve data değişmemiş.

**Kapanış:** G10-A evidence yaz; REM-41 ready.

### REM-41 — Release candidate freeze ve evidence packet

**Context güvenliği:** Bu prompt tek başına verildiğinde de canonical dosyaları ve Git durumunu yeniden doğrula. Context daralırsa dur, kısa checkpoint / handoff yaz ve yeni sessiona geç; compact özeti veya eski sohbeti güncel kanıt sayma.

**Hedef:** Uygulama yapılmışsa release candidate’ın kaynak, test, privacy, panel, accessibility ve cihaz sınırlarını birleştir; canlıya alma yapma.

**Oku:** UX planı §19–§20; TEST-MATRIX full command set; APPROVAL-GATE; EVIDENCE-RECEIPT-TEMPLATE; REM-28–40 receipts.

**Allowlist:** evidence/REM-41.md, ledger, STATE.json, decisions, traceability ve test matrix. Source yalnız test failure remediation için ilgili prompt allowlist’iyle değişebilir.

**Görev:**

1. Full syntax, headless, root fixture, Panel-v2, reminder, migration, privacy ve context validator suite’ini yeniden çalıştır.
2. Source, test, commit, remote, CI/Pages ve device evidence seviyelerini ayrı tabloya koy.
3. Release candidate scope’unu dondur; yeni kapsam eklenirse traceability ve approval state’i yeniden not_approved yap.
4. State’i deployed değil, yalnız gerçek test durumu tamamlandıysa ready_for_user_approval olarak raporla.
5. Approval gate’teki yasaklı işlemlerin hiçbirini yapma; kullanıcı onayı için exact scope talebini handoff’a yaz.

**Doğrulama:**

    node docs/reminders/verify-reminder-context.mjs
    node --check app.js
    node --check sync.js
    node --check sw.js
    for f in tests/reminders/test_*.js; do node "$f"; done
    for f in tests/test_*.js; do node "$f"; done
    for f in tests/panel-v2/test_panel_v2_*.js; do node "$f"; done
    git diff --check

**Kabul:** Evidence packet hazır; releaseApproval.status not_approved; push, merge, deploy, live browser ve data repo write yapılmadı.

**Kapanış:** G10-B evidence yaz; REM-42 approval_required.

### REM-42 — Kullanıcı onayının exact kapsamını doğrula

**Context güvenliği:** Bu prompt tek başına verildiğinde de canonical dosyaları ve Git durumunu yeniden doğrula. Context daralırsa dur, kısa checkpoint / handoff yaz ve yeni sessiona geç; compact özeti veya eski sohbeti güncel kanıt sayma.

**Hedef:** Release kararını ajanın yorumundan ayır ve yalnız mevcut kullanıcı mesajındaki açık eylem + kapsamı state’e kaydet.

**Oku:** APP-REMINDER-APPROVAL-GATE.md tamamı; STATE.json; REM-41 evidence; SESSION-HANDOFF-TEMPLATE.

**Allowlist:** STATE.json, ledger, evidence/REM-42.md, decisions. Push / merge / deploy / external write yok.

**Görev:**

1. Mevcut konuşmada kullanıcı tarafından verilen exact release eylem cümlesini ara; bulunmuyorsa onay isteme durumunu koru.
2. “Tamam”, “devam”, “hazırla”, “test et”, “güzel” ve benzeri belirsiz ifadeleri onay kabul etme.
3. Onay varsa yalnız açıkça belirtilen branch, remote, merge, Pages, tag veya diğer işlemleri scope listesine yaz.
4. mustafaras/seyma-data yazma yetkisini release scope’undan bağımsız kontrol et.
5. Onay yoksa state’i not_approved, scope boş, evidence null, approvedAt null bırak ve satırı approval_required olarak işaretle.

**Doğrulama:**

    node docs/reminders/verify-reminder-context.mjs
    git diff --check

**Kabul:** State’teki approval kaydı exact kullanıcı kanıtına dayanıyor; agent / test / CI hiçbir zaman approvedBy olamıyor; onay yoksa dış işlem yok.

**Kapanış:** Onay yoksa REM-43 blocked / approval_required kalır. Onay varsa yalnız kapsam dahilindeki release precondition’ları handoff’a yaz; validator default planning modunda çalıştırıldı.

### REM-43 — Açık kullanıcı onayı sonrası release execution

**Context güvenliği:** Bu prompt tek başına verildiğinde de canonical dosyaları ve Git durumunu yeniden doğrula. Context daralırsa dur, kısa checkpoint / handoff yaz ve yeni sessiona geç; compact özeti veya eski sohbeti güncel kanıt sayma.

**Hedef:** Yalnız REM-42 tarafından exact current user approval ile onaylanmış ve scope’u belirlenmiş release işlemlerini, tam kanıt zinciriyle yürüt.

**Oku:** APP-REMINDER-APPROVAL-GATE.md; STATE.json; REM-41 evidence; full TEST-MATRIX; root AGENTS.md Git/deploy rules.

**Allowlist:** Kullanıcı onayında açıkça belirtilen release kapsamı; ilgili source / tests / docs ve release evidence. mustafaras/seyma-data ancak ayrıca açık veri yazma onayı varsa.

**Ön koşul — herhangi biri sağlanmıyorsa hemen STOP:**

1. STATE releaseApproval.status approved değil.
2. approvedBy user değil.
3. scope içinde yapılacak exact eylem yok.
4. evidence mevcut konuşmadaki exact kullanıcı mesajını ve tarihi göstermiyor.
5. Son test / traceability / privacy / migration / accessibility kanıtı yok.

**Görev:**

1. Onay state’ini ve scope’u değiştirmeden önce validator’ı ve tam test matrisini yeniden çalıştır.
2. Yalnız izin verilen dosyaları stage et; commit SHA’sını evidence receipt’e yaz.
3. Scope izin veriyorsa commit, push, merge, tag veya Pages adımlarını tek tek yürüt; bir adım fail olursa dur.
4. Remote equality, workflow, Pages deployment ve canlı HTTP / cache-bust kanıtını ayrı seviyelerde doğrula.
5. Canlıya alma kanıtını kullanıcı cihazı kabulüyle karıştırma; S5’i yalnız kullanıcı onayıyla kapat.
6. Veri deposu yazma scope’ta ayrıca yoksa mustafaras/seyma-data üzerinde hiçbir işlem yapma.

**Doğrulama:**

    node docs/reminders/verify-reminder-context.mjs --release-approved
    node --check app.js
    node --check sync.js
    node .claude/skills/run-seyma/driver.mjs
    for f in tests/reminders/test_*.js; do node "$f"; done
    git diff --check

**Kabul:** Yalnız kullanıcı onayındaki kapsam uygulanmış; source/test/remote/CI/Pages/live/device evidence ayrı; veri deposu ayrıca yetkilendirilmemişse değişmemiş.

**Kapanış:** Release sonucu deployed ancak gerçek Pages ve canlı kanıt varsa yazılabilir. Her eksik veya fail için ledger blocked ve release gate yeniden not_approved yapılır.

## Faz R12 — Şeyma app runtime uygulama hattı

Bu faz, reminder fikrini gerçek Şeyma runtime’ına bağlar. Her prompt yalnız
app surface map’teki owner’ını ele alır. Panel veya release kapsamı gerektiğinde
ilgili promptta açıkça belirtilmeden değiştirilemez.

### REM-44 — App boot, script order ve global adapter sözleşmesi

**Context güvenliği:** Bu prompt tek başına verildiğinde de canonical dosyaları ve Git durumunu yeniden doğrula. Context daralırsa dur, kısa checkpoint / handoff yaz ve yeni sessiona geç; compact özeti veya eski sohbeti güncel kanıt sayma.

**Hedef:** Reminder catalog, state ve engine adapter’larının build step olmayan mevcut app boot zincirine güvenli biçimde bağlanacağı sözleşmeyi kanıtla.

**Oku:** APP-REMINDER-APP-PANEL-SURFACE-MAP.md §1; index.html script order; app/core/constants.js; app.js IIFE başlangıcı; AGENTS project structure.

**Allowlist:** index.html, app/core/reminder*.js, app.js adapter boundary, tests/reminders/test_reminder_boot.js, tests/reminders/test_reminder_contract.js, evidence.

**Görev:**

1. Classic script yükleme sırasını ve global export sahiplerini tabloya çıkar.
2. Catalog / state / engine modüllerinin app.js’den önce veya sonra yüklenme zorunluluğunu belirle.
3. window.App, window.SeymaConstants ve reminder namespace çakışmalarını negative test et.
4. index.html cache-bust sürümünün yalnız ilgili asset’leri değiştirdiğini kanıtla.
5. Build, bundler, framework veya yeni global event bus ekleme.

**Doğrulama:**

    node tests/reminders/test_reminder_boot.js
    node tests/reminders/test_reminder_contract.js
    node --check app.js
    git diff --check

**Kabul:** Temiz boot, seeded boot ve reminder modülü eksik boot fail-safe; script order, namespace ve cache-bust kanıtlı.

**Kapanış:** APP-01 kapanır; REM-45 ready.

### REM-45 — App state schema, ownership ve additive migration

**Context güvenliği:** Bu prompt tek başına verildiğinde de canonical dosyaları ve Git durumunu yeniden doğrula. Context daralırsa dur, kısa checkpoint / handoff yaz ve yeni sessiona geç; compact özeti veya eski sohbeti güncel kanıt sayma.

**Hedef:** Reminder alanlarının gerçek data / settings / local-only journal sınırlarını eski kullanıcı kayıtlarını bozmadan uygulamaya bağla.

**Oku:** APP-REMINDER-APP-PANEL-SURFACE-MAP.md §1; app.js createDefaultData, migrate, getDay, data, ui; UX planı §5.1–5.3 ve §8.2.

**Allowlist:** app.js migration boundary veya app/core/reminderState.js, tests/reminders/test_reminder_app_state.js, test_reminder_migration.js, evidence.

**Görev:**

1. Preference, definition version, occurrence, delivery journal ve suppression owner’larını açıkça ayır.
2. Eski minimal, partial, rich ve malformed save’lerde additive default ve unknown-field preservation uygula.
3. ui ephemeral state ile persisted data state’i karıştırma.
4. Aynı migration’ın ikinci çalışmasında deep parity ve timestamp stability kanıtla.
5. User-owned reminder detail’i canonical sync payload’a çıkarmadan önce privacy gate’ine bağla.

**Doğrulama:**

    node tests/reminders/test_reminder_app_state.js
    node tests/reminders/test_reminder_migration.js
    node .claude/skills/run-seyma/verify-state-migration-boundary.mjs
    git diff --check

**Kabul:** Eski app state kayıpsız açılıyor; reminder yokken mevcut app davranışı değişmiyor; local-only alanlar açıkça işaretli.

**Kapanış:** APP-02’nin state kısmı kapanır; REM-46 ready.

### REM-46 — App clock, timezone ve engine adapter

**Context güvenliği:** Bu prompt tek başına verildiğinde de canonical dosyaları ve Git durumunu yeniden doğrula. Context daralırsa dur, kısa checkpoint / handoff yaz ve yeni sessiona geç; compact özeti veya eski sohbeti güncel kanıt sayma.

**Hedef:** Saf reminder occurrence / policy motorunu Şeyma’nın gerçek tarih, Hicri, prayer ve active-date yardımcılarına deterministik biçimde bağla.

**Oku:** APP-REMINDER-APP-PANEL-SURFACE-MAP.md §1; app.js date helpers, activeDate, prayer helpers, HijriCalendarV1; UX planı §8.1–8.5.

**Allowlist:** app/core/reminderEngine.js, app.js adapter, hijri adapter only if required, tests/reminders/test_reminder_app_engine.js, test_reminder_timezones.js, test_reminder_scheduler.js.

**Görev:**

1. Engine’e injected clock / timezone ver; production adapter yalnız mevcut app clock boundary’sinden beslensin.
2. Europe/Istanbul, local date, DST, midnight, Hicri offset, prayer stale ve selected historical day senaryolarını ayır.
3. Occurrence ID’nin active UI date ile wall-clock date’i yanlışlıkla birleştirmediğini test et.
4. App boot, foreground ve date navigation aynı occurrence’ı üretmeli; duplicate üretmemeli.
5. Prayer data fresh değilse engine candidate’ı güvenli biçimde suppressed / unavailable yap.

**Doğrulama:**

    node tests/reminders/test_reminder_app_engine.js
    node tests/reminders/test_reminder_scheduler.js
    node tests/reminders/test_reminder_timezones.js
    node docs/reminders/verify-reminder-context.mjs

**Kabul:** Aynı fixture’de app adapter ve pure engine aynı occurrence sonucunu verir; timezone / stale / Hicri sınırları deterministic.

**Kapanış:** APP-02 engine bağlantısı kapanır; REM-47 ready.

### REM-47 — App save, commit ve event-log lifecycle

**Context güvenliği:** Bu prompt tek başına verildiğinde de canonical dosyaları ve Git durumunu yeniden doğrula. Context daralırsa dur, kısa checkpoint / handoff yaz ve yeni sessiona geç; compact özeti veya eski sohbeti güncel kanıt sayma.

**Hedef:** Reminder action’larının Şeyma’nın mevcut save / commit / event-log zincirine tekil, redacted ve replay-safe biçimde bağlanmasını sağla.

**Oku:** APP-REMINDER-APP-PANEL-SURFACE-MAP.md §1; app.js save, commit, appendEvent, ensureEventLog, saveLocal; sync.js event log contract.

**Allowlist:** app.js save / event adapter, tests/reminders/test_reminder_app_events.js, test_reminder_event_log.js, existing sync event fixtures.

**Görev:**

1. Enable, snooze, mute, dismiss, delivered ve opened action’larını canonical safe event summary’ye map et.
2. Raw reminder body, therapy text, medication name/dose, mood veya journal text event log’a girmez.
3. Bir kullanıcı eyleminin birden fazla save / event üretmesini negative test et.
4. Local save, pending sync, retry ve accepted receipt durumlarını action lifecycle’dan ayır.
5. ÆON social event kategorisi ile personal reminder event kategorisini ayrı tut.

**Doğrulama:**

    node tests/reminders/test_reminder_app_events.js
    node tests/reminders/test_reminder_event_log.js
    node tests/test_panel_p2_event_log.js
    git diff --check

**Kabul:** Action lifecycle idempotent, safe summary ile sınırlı ve mevcut save / sync davranışını bozmaz.

**Kapanış:** APP-02 persistence ve APP-03 event kısmı kapanır; REM-48 ready.

### REM-48 — App Reminder Center navigation, overlay ve deep-link

**Context güvenliği:** Bu prompt tek başına verildiğinde de canonical dosyaları ve Git durumunu yeniden doğrula. Context daralırsa dur, kısa checkpoint / handoff yaz ve yeni sessiona geç; compact özeti veya eski sohbeti güncel kanıt sayma.

**Hedef:** Reminder Center’ı gerçek Şeyma Ayarlar / tab / overlay navigasyonuna bağla; her hedefe erişilebilir ve geri dönülebilir bir akış ver.

**Oku:** APP-REMINDER-APP-PANEL-SURFACE-MAP.md §1; app.js App.go, settings render, overlay shell, openFaithCorner, openZikr, openReading, openJournalModal; UX planı §6 ve §9.4.

**Allowlist:** app.js navigation / render boundary, styles.css, index.html only if cache-bust, tests/reminders/test_reminder_app_navigation.js, test_reminder_deeplinks.js.

**Görev:**

1. Reminder Center girişini gerçek Ayarlar bilgi mimarisine ekle; yeni paralel router kurma.
2. Her catalog deep-link’ini gerçek App handler’ına map et; olmayan hedefi görünür unavailable state yap.
3. Overlay open / close, Escape / back, focus return, scroll lock ve safe-area davranışını kanıtla.
4. Reminder action sırasında seçili tarih, tab, draft ve unsaved input kaybolmasın.
5. Native notification click ile in-app card click aynı target contract’ını kullansın.

**Doğrulama:**

    node tests/reminders/test_reminder_app_navigation.js
    node tests/reminders/test_reminder_deeplinks.js
    node .claude/skills/run-seyma/driver.mjs
    git diff --check

**Kabul:** Her P0 reminder tek hedefe gidiyor; broken target, focus loss ve draft loss yok.

**Kapanış:** APP-03 navigation kapanır; REM-49 ready.

### REM-49 — App render lifecycle ve targeted update boundary

**Context güvenliği:** Bu prompt tek başına verildiğinde de canonical dosyaları ve Git durumunu yeniden doğrula. Context daralırsa dur, kısa checkpoint / handoff yaz ve yeni sessiona geç; compact özeti veya eski sohbeti güncel kanıt sayma.

**Hedef:** Reminder polling / action / timer değişikliklerinin büyük render fonksiyonunu gereksiz yere çalıştırıp input, modal veya scroll bozmasını engelle.

**Oku:** APP-REMINDER-APP-PANEL-SURFACE-MAP.md §1; app.js render, updateCardByKey, inline App handlers, commit; UX planı §6.4, §9.3, §12.

**Allowlist:** app.js render / update boundary, styles.css, tests/reminders/test_reminder_app_render.js, test_reminder_performance.js.

**Görev:**

1. Candidate unchanged, action accepted, draft active, overlay open ve tab inactive durumlarını ayrı render policy’ye bağla.
2. Reminder card / badge / live region için mümkünse targeted update kullan; full render gerekiyorsa reason receipt yaz.
3. Input focus, textarea draft, selected tab, modal scroll ve reduced-motion davranışını test et.
4. Timer tick’lerinin notification card’ı her saniye yeniden üretmediğini ölç.
5. Render sonrası inline App handler’larının ve aria state’lerinin canlı kaldığını doğrula.

**Doğrulama:**

    node tests/reminders/test_reminder_app_render.js
    node tests/reminders/test_reminder_performance.js
    node .claude/skills/run-seyma/driver.mjs
    git diff --check

**Kabul:** Draft / focus / overlay korunuyor; unchanged candidate no-op; target update ve full render ayrımı kanıtlı.

**Kapanış:** APP-03 render kısmı kapanır; REM-50 ready.

### REM-50 — App foreground lifecycle ve scheduler orchestration

**Context güvenliği:** Bu prompt tek başına verildiğinde de canonical dosyaları ve Git durumunu yeniden doğrula. Context daralırsa dur, kısa checkpoint / handoff yaz ve yeni sessiona geç; compact özeti veya eski sohbeti güncel kanıt sayma.

**Hedef:** Reminder scheduler’ı app’in mevcut pollRemote, onAppForeground, visibility, focus, pageshow, online ve timer akışlarına spam üretmeden bağla.

**Oku:** APP-REMINDER-APP-PANEL-SURFACE-MAP.md §1; app.js onAppForeground, pollRemote, lifecycle listeners, timers; UX planı §8.6–8.8.

**Allowlist:** app.js lifecycle adapter, app/core/reminderScheduler.js, tests/reminders/test_reminder_app_lifecycle.js, test_reminder_lifecycle.js, test_reminder_catchup.js.

**Görev:**

1. Boot, foreground, focus, pageshow, online, visibility hidden/visible ve periodic tick’i ayrı trigger olarak kaydet.
2. Aynı trigger burst’ünün tek evaluate / tek delivery sonucu verdiğini test et.
3. ÆON poll, Quran pull, sync retry ve reminder evaluate birbirinin timer’ını ezmesin.
4. Background / app-closed capability’yi yanlışlıkla local alarm garantisine dönüştürme.
5. Offline dönüşünde bounded catch-up ve no-spam kuralını uygula.

**Doğrulama:**

    node tests/reminders/test_reminder_app_lifecycle.js
    node tests/reminders/test_reminder_lifecycle.js
    node tests/reminders/test_reminder_catchup.js
    node .claude/skills/run-seyma/driver.mjs

**Kabul:** Trigger matrix deterministic; repeat lifecycle duplicate üretmiyor; existing ÆON / Quran / sync polling regresyonsuz.

**Kapanış:** APP-04 lifecycle kapanır; REM-51 ready.

### REM-51 — App surface adapter ve feature deep-link conformance

**Context güvenliği:** Bu prompt tek başına verildiğinde de canonical dosyaları ve Git durumunu yeniden doğrula. Context daralırsa dur, kısa checkpoint / handoff yaz ve yeni sessiona geç; compact özeti veya eski sohbeti güncel kanıt sayma.

**Hedef:** Namaz, zikir, terapi, Saygı, okuma, günlük, bakım ve kullanıcı kurduğu sağlık reminder’larının gerçek app surface’lerine doğru bağlandığını tek adapter sözleşmesinde kanıtla.

**Oku:** APP-REMINDER-APP-PANEL-SURFACE-MAP.md §1; app.js faith / zikr / Saygı / reading / journal / care handlers; UX planı §7 ve §10.

**Allowlist:** app.js feature adapters, app/core/reminderCatalog.js, tests/reminders/test_reminder_app_surface_conformance.js, feature-specific reminder fixtures.

**Görev:**

1. Her reminder definition için target tab, handler, required state, unavailable reason ve back path tablosu oluştur.
2. Namaz stale / zikir paused / terapi opt-out / Saygı content unavailable / reading empty / care disabled durumlarını ayrı göster.
3. Reminder açılması completion, streak veya habit tick’ini otomatik yazmasın.
4. User action ile reminder suggestion’ın event semantics’ini ayır.
5. Catalog’da olmayan hedef, handler veya feature flag’i fail-closed yap.

**Doğrulama:**

    node tests/reminders/test_reminder_app_surface_conformance.js
    node tests/reminders/test_reminder_prayer.js
    node tests/reminders/test_reminder_zikr.js
    node tests/reminders/test_reminder_therapy.js
    node tests/reminders/test_reminder_saygi.js
    node .claude/skills/run-seyma/zikr-harness.mjs

**Kabul:** P0 surface’lerin tamamı gerçek handler’a bağlı; unavailable ve opt-out durumları güvenli; otomatik completion yok.

**Kapanış:** APP-05 kapanır; REM-52 ready.

### REM-52 — App permission, native adapter ve ÆON boundary

**Context güvenliği:** Bu prompt tek başına verildiğinde de canonical dosyaları ve Git durumunu yeniden doğrula. Context daralırsa dur, kısa checkpoint / handoff yaz ve yeni sessiona geç; compact özeti veya eski sohbeti güncel kanıt sayma.

**Hedef:** Personal reminder native permission / delivery akışını mevcut ÆON notification akışından ayır ve kullanıcı kontrolünü koru.

**Oku:** APP-REMINDER-APP-PANEL-SURFACE-MAP.md §1; app.js canNotify, permission loop, showNativeAeonNotification, data.notifications; sw.js; UX planı §7.10 ve §9.

**Allowlist:** app.js notification adapter, app/core/reminderDelivery.js, sw.js click adapter, tests/reminders/test_reminder_app_notification_boundary.js, test_reminder_native.js, test_reminder_sw.js.

**Görev:**

1. ÆON social permission, reminder permission, delivery ID, tag, cap ve history alanlarını ayır.
2. Native body için generic private copy adapter’ı kullan; detail body yalnız in-app yüzeyde kalsın.
3. Permission unsupported / denied / granted / prompt / revoked state’lerini tekrar tekrar istemeden göster.
4. Notification click target’ını allowlist et; malformed payload ile app state değiştirme.
5. Service Worker’ın background scheduling yapabildiği izlenimini üretme.

**Doğrulama:**

    node tests/reminders/test_reminder_app_notification_boundary.js
    node tests/reminders/test_reminder_native.js
    node tests/reminders/test_reminder_sw.js
    node --check app.js
    node --check sw.js

**Kabul:** ÆON regresyonsuz; personal reminder private / idempotent; permission ve SW capability states dürüst.

**Kapanış:** APP-04 notification boundary kapanır; REM-53 ready.

### REM-53 — App local privacy, sanitize ve sync adapter

**Context güvenliği:** Bu prompt tek başına verildiğinde de canonical dosyaları ve Git durumunu yeniden doğrula. Context daralırsa dur, kısa checkpoint / handoff yaz ve yeni sessiona geç; compact özeti veya eski sohbeti güncel kanıt sayma.

**Hedef:** Reminder preference, delivery journal, action history ve private detail’in app localStorage → sync → projection zincirinde yanlışlıkla sızmadığını kanıtla.

**Oku:** APP-REMINDER-APP-PANEL-SURFACE-MAP.md §1 ve §3; app.js save, saveLocal; sync.js sanitize, pushWithCfg, putLatestGuarded, event log; UX planı §13.

**Allowlist:** app.js privacy adapter, sync.js sanitize / merge boundary, tests/reminders/test_reminder_app_privacy.js, test_reminder_sync_privacy.js, existing sync fixtures.

**Görev:**

1. Local-only key, canonical preference, safe event summary, projection summary ve native copy alanlarını ayrı şema olarak test et.
2. Therapy, medication, mood, prayer completion, journal, note, token, GPS ve raw body negatif fixtures’a girsin.
3. Sync disabled, offline, retry, anti-clobber, accepted receipt ve projection failure durumlarını app UI state’iyle eşleştir.
4. Full-replace sync’in reminder state’i kaybetmemesi için merge / fail-closed davranışını kanıtla.
5. Gerçek GitHub, data repo veya kullanıcı localStorage’ı kullanma.

**Doğrulama:**

    node tests/reminders/test_reminder_app_privacy.js
    node tests/reminders/test_reminder_sync_privacy.js
    node tests/test_faz10_sync.js
    node tests/test_panel_p0_sync.js

**Kabul:** Private alanlar local boundary dışına çıkmıyor; sanitize / merge / anti-clobber ve UI status ayrı kanıtlı.

**Kapanış:** APP-02 privacy ve APP-04 sync kısmı kapanır; REM-54 ready.

### REM-54 — App module, cache-bust ve headless acceptance

**Context güvenliği:** Bu prompt tek başına verildiğinde de canonical dosyaları ve Git durumunu yeniden doğrula. Context daralırsa dur, kısa checkpoint / handoff yaz ve yeni sessiona geç; compact özeti veya eski sohbeti güncel kanıt sayma.

**Hedef:** Uygulama tarafındaki reminder teslimini gerçek headless harness’larda, iki temada ve mevcut Şeyma feature regression’larıyla kapat.

**Oku:** APP-REMINDER-APP-PANEL-SURFACE-MAP.md §1; run-seyma/SKILL.md; tests/README.md; index.html asset versions; REM-44–53 receipts.

**Allowlist:** tests/reminders/*, .claude/skills/run-seyma/ yalnız reminder fixture assertion gerekiyorsa, docs evidence / ledger / state; runtime yalnız ilgili remediation.

**Görev:**

1. Onboarding, seeded, light, dark, mobile-width, overlay, draft, offline ve permission fixture’larını çalıştır.
2. driver ve zikr harness’ta Reminder Center, faith, zikir, Saygı, reading ve notification actionlarını doğrula.
3. Root tests ve migration / helper boundary testlerini yeniden çalıştır.
4. Script tag balance, cache-bust, syntax, console error ve no-network boundary’lerini denetle.
5. App-only scope’un panel dosyalarına veya live action’a taşmadığını kanıtla.

**Doğrulama:**

    node --check app.js
    node --check sync.js
    node --check sw.js
    node .claude/skills/run-seyma/driver.mjs
    node .claude/skills/run-seyma/zikr-harness.mjs
    node .claude/skills/run-seyma/verify-state-helper-boundary.mjs
    node .claude/skills/run-seyma/verify-state-migration-boundary.mjs
    for f in tests/test_*.js; do node "$f"; done
    git diff --check

**Kabul:** App runtime acceptance PASS; source / tests / privacy / no-network evidence ayrı; browser ve deploy yok.

**Kapanış:** R12 app gate kapanır; REM-55 ready.

## Faz R13 — ÆON observer panel uygulama hattı

Bu faz current observer panel (panel.js, panel.html, panelCoverageManifest.js,
panel.css) içindir. Panel-v2 fixture’ları yalnız ayrı regression olarak
çalıştırılır; current panel ile aynı runtime kabul edilmez.

### REM-55 — Panel source authority ve projection seçim sözleşmesi

**Context güvenliği:** Bu prompt tek başına verildiğinde de canonical dosyaları ve Git durumunu yeniden doğrula. Context daralırsa dur, kısa checkpoint / handoff yaz ve yeni sessiona geç; compact özeti veya eski sohbeti güncel kanıt sayma.

**Hedef:** Panelin latest, receipt, observer projection ve legacy fallback arasında hangi kaynağı neden seçtiğini reminder gözlemine uygun biçimde kanıtla.

**Oku:** APP-REMINDER-APP-PANEL-SURFACE-MAP.md §2; panel.js load, fetchLatest, loadObserverProjectionP; panelCoverageManifest.js chooseProjection; tests panel projection fixtures.

**Allowlist:** panel.js source selection, panelCoverageManifest.js chooseProjection boundary, tests/reminders/test_reminder_panel_source.js, existing panel projection fixtures.

**Görev:**

1. projection valid / stale / missing / invalid / receipt missing / legacy fallback durumlarını ayrı state yap.
2. Source revision, accepted receipt, sourceUpdatedAt ve projection builtAt alanlarını birbirine karıştırma.
3. Reminder status projection yoksa panelde yok, stale, pending veya error ayrımını koru.
4. Fallback sırasında raw data’yı yeni surface’e taşımadan safe shape kullan.
5. Panelin source seçimi app state’i veya reminder preference’ı mutate etmesin.

**Doğrulama:**

    node tests/reminders/test_reminder_panel_source.js
    node tests/test_panel_p1_projection.js
    node tests/test_panel_p0_sync.js
    node --check panel.js
    node --check panelCoverageManifest.js

**Kabul:** Her source state deterministic, provenance’lı ve read-only; success yalnız receipt / projection kanıtıyla gösteriliyor.

**Kapanış:** PANEL-01 source gap kapanır; REM-56 ready.

### REM-56 — Panel coverage manifest ve reminder schema classification

**Context güvenliği:** Bu prompt tek başına verildiğinde de canonical dosyaları ve Git durumunu yeniden doğrula. Context daralırsa dur, kısa checkpoint / handoff yaz ve yeni sessiona geç; compact özeti veya eski sohbeti güncel kanıt sayma.

**Hedef:** Reminder projection alanlarının manifestte açıkça full, summary, redacted, missing veya unmapped olarak sınıflanmasını sağla.

**Oku:** APP-REMINDER-APP-PANEL-SURFACE-MAP.md §2; panelCoverageManifest.js MANIFEST, coverageForData, redactedPaths; UX planı §13.2.

**Allowlist:** panelCoverageManifest.js manifest / coverage, tests/reminders/test_reminder_panel_coverage.js, tests/test_panel_p1_projection.js, evidence.

**Görev:**

1. Preference, occurrence, delivery, category, safe aggregate, private detail, therapy, medication, journal, mood, prayer completion ve token alanlarını sınıflandır.
2. Unknown future reminder fields’in unmapped kalıp yanlışlıkla full görünmesini engelle.
3. Coverage summary’nin reminder detail’i veya raw path’i göstermediğini test et.
4. Projection schema version ve manifest version değişimini karar günlüğüne bağla.
5. Panel-v2 coverage manifestiyle current panel manifestini karıştırma.

**Doğrulama:**

    node tests/reminders/test_reminder_panel_coverage.js
    node tests/test_panel_p1_projection.js
    node tests/test_panel_p6_qa_release.js
    node docs/reminders/verify-reminder-context.mjs

**Kabul:** Her reminder alanının tek coverage mode’u var; unknown alanlar fail-closed; manifest / projection schema birlikte doğrulanıyor.

**Kapanış:** PANEL-01 coverage kapanır; REM-57 ready.

### REM-57 — Panel redaction ve reminder no-op kararı

**Context güvenliği:** Bu prompt tek başına verildiğinde de canonical dosyaları ve Git durumunu yeniden doğrula. Context daralırsa dur, kısa checkpoint / handoff yaz ve yeni sessiona geç; compact özeti veya eski sohbeti güncel kanıt sayma.

**Hedef:** ÆON panelinde reminder verisinin hangi güvenli aggregate ile, hangi durumda tamamen no-op olarak kalacağını ürün ve privacy kanıtıyla kararlaştır.

**Oku:** APP-REMINDER-APP-PANEL-SURFACE-MAP.md §2 ve §4; panelCoverageManifest.js redact, redactForObserver; UX planı §13.2; REM-56.

**Allowlist:** panelCoverageManifest.js redaction, panel.js projection consumer, APP-REMINDER-DECISIONS.md, tests/reminders/test_reminder_panel_redaction.js.

**Görev:**

1. Panelde reminder göstermek gerekli mi sorusunu feature / operator / privacy gerekçesiyle cevapla.
2. No-op seçilirse projection, DOM, event log ve manifestte reminder detail’inin bulunmadığını negative test et.
3. Redacted aggregate seçilirse yalnız system health, enabled category count veya safe delivery status gibi minimum alanları tanımla.
4. Therapy, medication, mood, prayer completion, note, body, schedule ve private title’ın tüm çıkışlarını tara.
5. Redaction source state’i mutate etmesin; same input → same projection parity’si olsun.

**Doğrulama:**

    node tests/reminders/test_reminder_panel_redaction.js
    node tests/test_panel_p4_provenance.js
    node tests/test_panel_p3_root_modules.js
    git diff --check

**Kabul:** No-op veya minimum redacted design açık kararla kayıtlı; raw/private data panel DOM / projection / fixture’a girmiyor.

**Kapanış:** PANEL-01 privacy surface kapanır; REM-58 ready.

### REM-58 — Panel transport, ETag / 304 ve draft safety

**Context güvenliği:** Bu prompt tek başına verildiğinde de canonical dosyaları ve Git durumunu yeniden doğrula. Context daralırsa dur, kısa checkpoint / handoff yaz ve yeni sessiona geç; compact özeti veya eski sohbeti güncel kanıt sayma.

**Hedef:** Reminder-related panel observation’ın conditional polling, not-modified, draft defer ve render signature sözleşmesini bozmamasını sağla.

**Oku:** APP-REMINDER-APP-PANEL-SURFACE-MAP.md §2; panel.js loadTransportFileP, fetchLatest, pollConditionalDecisionP, panelDraftActiveP, applyPollRenderP, panelSig; tests panel polling.

**Allowlist:** panel.js polling / transport boundary, tests/reminders/test_reminder_panel_polling.js, tests/test_panel_p2_polling.js, tests/panel-v2 polling only regression.

**Görev:**

1. 200, 304, ETag changed, empty, malformed, network failure ve rate limit response’larını ayrı test et.
2. Kullanıcı mesaj draft’ı, textarea focus’u, drawer, filter, selected date ve expanded card varken poll render’ını ertele.
3. Deferred snapshot geldiğinde pending render tek kontrollü biçimde uygulanmalı.
4. Reminder status unchanged ise full panel render yapma; changed ise visible status / new changes ribbon’ını doğru güncelle.
5. Panel polling hiçbir reminder preference / localStorage / app state write yapmasın.

**Doğrulama:**

    node tests/reminders/test_reminder_panel_polling.js
    node tests/test_panel_p2_polling.js
    node tests/panel-v2/test_panel_v2_polling_telemetry.js
    node --check panel.js

**Kabul:** ETag / 304 / draft safety / no-mutation PASS; panel yalnız read surface olarak kalıyor.

**Kapanış:** PANEL-02 transport gap kapanır; REM-59 ready.

### REM-59 — Panel partial fetch, stale ve fail-closed durumları

**Context güvenliği:** Bu prompt tek başına verildiğinde de canonical dosyaları ve Git durumunu yeniden doğrula. Context daralırsa dur, kısa checkpoint / handoff yaz ve yeni sessiona geç; compact özeti veya eski sohbeti güncel kanıt sayma.

**Hedef:** Projection, sync receipt, event log ve transport section’larından biri başarısız olduğunda panelin sağlıklı eski snapshot’ı yanlışlıkla yok etmesini engelle.

**Oku:** APP-REMINDER-APP-PANEL-SURFACE-MAP.md §2; panel.js PROJECTION.sections, sectionFetchState, loadEventLogP, loadSyncReceiptP, projectionStatusP; panel status tests.

**Allowlist:** panel.js partial state, panelCoverageManifest.js fallback if required, tests/reminders/test_reminder_panel_partial_state.js, existing panel p3/p4/polling fixtures.

**Görev:**

1. İlk load missing, healthy, stale, partial failure, recovered ve malformed states’lerini modelle.
2. Yan kanal failure önceki sağlıklı sections’ı korumalı; yeni başarısız alan success gibi görünmemeli.
3. Reminder system status için unavailable / stale / error / pending / ok ayrımı yap.
4. fail() davranışının kullanıcı draft’ını, token state’ini veya selected UI state’ini silmediğini test et.
5. Panel status mesajlarında raw network error, token veya personal detail göstermeme.

**Doğrulama:**

    node tests/reminders/test_reminder_panel_partial_state.js
    node tests/test_panel_p3_root_modules.js
    node tests/test_panel_p4_provenance.js
    node tests/test_panel_staleness_badge.js

**Kabul:** Partial failure fail-closed; stale data stale görünür; recovery sonrası state temiz ve duplicate’siz.

**Kapanış:** PANEL-02 failure gap kapanır; REM-60 ready.

### REM-60 — Panel status, provenance ve operational health

**Context güvenliği:** Bu prompt tek başına verildiğinde de canonical dosyaları ve Git durumunu yeniden doğrula. Context daralırsa dur, kısa checkpoint / handoff yaz ve yeni sessiona geç; compact özeti veya eski sohbeti güncel kanıt sayma.

**Hedef:** Reminder gözlem durumunu panelde kaynak, tazelik, privacy, receipt ve capability olarak ayrıştır; tek yeşil rozetle maskeleme.

**Oku:** APP-REMINDER-APP-PANEL-SURFACE-MAP.md §2; panel.js syncRibbonHTMLP, coverageRibbonHTMLP, canonicalStatusP, p3StatusP, stalenessBadgeP; UX planı §7.10 ve §14.

**Allowlist:** panel.js status / provenance surfaces, panel.css, tests/reminders/test_reminder_panel_status.js, existing panel staleness / p6 QA fixtures.

**Görev:**

1. App local state, sync receipt, projection state, section fetch, reminder capability ve user-device acceptance’ı ayrı status alanları yap.
2. accepted, stale, pending, missing, projection_invalid, error, unsupported ve redacted tonlarını deterministic map et.
3. Status color tek anlam kaynağı olmasın; text, icon, source time ve privacy label birlikte olsun.
4. Panelde reminder çalışıyor iddiasını yalnız source + receipt + projection evidence varsa göster.
5. Status card raw reminder category, schedule veya body taşımamalı.

**Doğrulama:**

    node tests/reminders/test_reminder_panel_status.js
    node tests/test_panel_staleness_badge.js
    node tests/test_panel_p6_qa_release.js
    git diff --check

**Kabul:** Status map exhaustive ve fail-closed; source / time / privacy / capability birbirinden ayrılmış.

**Kapanış:** PANEL-02 provenance gap kapanır; REM-61 ready.

### REM-61 — Panel reminder dashboard card veya explicit no-op

**Context güvenliği:** Bu prompt tek başına verildiğinde de canonical dosyaları ve Git durumunu yeniden doğrula. Context daralırsa dur, kısa checkpoint / handoff yaz ve yeni sessiona geç; compact özeti veya eski sohbeti güncel kanıt sayma.

**Hedef:** Panelde reminder için gerçekten gerekli bir bento / module card olup olmadığını kanıtla; varsa yalnız redacted operational aggregate üret.

**Oku:** APP-REMINDER-APP-PANEL-SURFACE-MAP.md §2; panel.js coreModules, rootModulesCardHTMLP, p4ProvenanceCardHTMLP, d4ModuleAtlasHTMLP; UX planı §13.2.

**Allowlist:** panel.js card surface, panel.css, panelCoverageManifest.js descriptor if required, tests/reminders/test_reminder_panel_card.js, existing module card fixtures.

**Görev:**

1. Card value proposition, operator action ve privacy riskini karşılaştır; no-op kararı geçerliyse bunu decisions log’a yaz.
2. Card varsa yalnız safe aggregate: capability, source freshness, generic delivery health veya enabled-state summary kullan.
3. Private routine, reminder title, schedule, occurrence, therapy, medication, prayer completion veya user note render etme.
4. Empty / unused / pending / stale / error / redacted state’lerini aynı card contract’ında göster.
5. Cardın app state’i veya panel write endpoint’lerini tetiklemediğini kanıtla.

**Doğrulama:**

    node tests/reminders/test_reminder_panel_card.js
    node tests/test_panel_p4_module_cards.js
    node tests/test_panel_p3_root_modules.js
    git diff --check

**Kabul:** Card veya no-op seçimi gerekçeli; seçilen yol tüm state’lerde fail-safe ve privacy-safe.

**Kapanış:** PANEL-03 dashboard gap kapanır; REM-62 ready.

### REM-62 — Panel daily detail, event timeline ve reminder lifecycle

**Context güvenliği:** Bu prompt tek başına verildiğinde de canonical dosyaları ve Git durumunu yeniden doğrula. Context daralırsa dur, kısa checkpoint / handoff yaz ve yeni sessiona geç; compact özeti veya eski sohbeti güncel kanıt sayma.

**Hedef:** Reminder lifecycle gözlem için gerekli ise event timeline’a safe, append-only ve filtrelenebilir biçimde bağla.

**Oku:** APP-REMINDER-APP-PANEL-SURFACE-MAP.md §2; panel.js event helpers, eventLogCardHTMLP, eventFeatureForP, eventMatchesFilterP, selected date / day detail; sync.js event contract.

**Allowlist:** panel.js event projection / labels, panelCoverageManifest.js event coverage, tests/reminders/test_reminder_panel_timeline.js, existing event-log fixtures.

**Görev:**

1. reminder scheduled / delivered / opened / snoozed / muted / suppressed / error event’lerini safe summary’ye map et.
2. Event ID, sequence, source, revision, occurredAt ve feature metadata’yı private body’den ayır.
3. Duplicate, out-of-order, gap, future date, stale date ve missing event states’lerini görünür ama sakin göster.
4. Panel filter, event limit, selected day ve drawer focus davranışını koru.
5. Timeline reminder event’i app action’ı veya remote write başlatmasın.

**Doğrulama:**

    node tests/reminders/test_reminder_panel_timeline.js
    node tests/test_panel_p2_event_log.js
    node tests/test_panel_event_focus.js
    node tests/test_panel_p3_timeline_drawer.js

**Kabul:** Timeline append-only, redacted, sequence-audited ve UI filter’larıyla deterministic.

**Kapanış:** PANEL-03 timeline gap kapanır; REM-63 ready.

### REM-63 — Panel observer action boundary

**Context güvenliği:** Bu prompt tek başına verildiğinde de canonical dosyaları ve Git durumunu yeniden doğrula. Context daralırsa dur, kısa checkpoint / handoff yaz ve yeni sessiona geç; compact özeti veya eski sohbeti güncel kanıt sayma.

**Hedef:** Panelin mevcut ÆON / Quran / media observer writes’ını korurken reminder preference, snooze, mute, delivery veya private state write etmesini kesin olarak engelle.

**Oku:** APP-REMINDER-APP-PANEL-SURFACE-MAP.md §2 ve §4; panel.js putInbox, putTransportFileP, media writers, Quran actions; AGENTS read/write boundary.

**Allowlist:** panel.js action guard, panelCoverageManifest.js if needed, tests/reminders/test_reminder_panel_write_boundary.js, existing panel sync / Quran fixtures.

**Görev:**

1. Panel write endpoint’lerini inventory et ve reminder alanlarını denylist / schema guard ile engelle.
2. Reminder card, timeline, status ve filter UI’ında write handler bulunmadığını static + runtime mock ile kanıtla.
3. Observer inbox / Quran action’larının reminder payload’ına yanlışlıkla bağlanmadığını test et.
4. Demo mode, no token, expired token, read-only projection ve malformed action states’lerini fail-closed yap.
5. Gerçek GitHub PUT, gerçek data repo ve user device kullanma.

**Doğrulama:**

    node tests/reminders/test_reminder_panel_write_boundary.js
    node tests/test_panel_p0_sync.js
    node tests/test_quran_transport.js
    node tests/test_panel_p6_qa_release.js

**Kabul:** Reminder surface panelden hiçbir write üretemiyor; mevcut scoped observer actions regresyonsuz.

**Kapanış:** PANEL-04 kapanır; REM-64 ready.

### REM-64 — Panel privacy, redaction ve secret scanner

**Context güvenliği:** Bu prompt tek başına verildiğinde de canonical dosyaları ve Git durumunu yeniden doğrula. Context daralırsa dur, kısa checkpoint / handoff yaz ve yeni sessiona geç; compact özeti veya eski sohbeti güncel kanıt sayma.

**Hedef:** Reminder alanlarının projection JSON, panel DOM, error output, fixture ve exported summary kanallarının tamamında private kalmasını kanıtla.

**Oku:** APP-REMINDER-APP-PANEL-SURFACE-MAP.md §2–4; panelCoverageManifest.js redaction; panel.js render / fail / status; UX planı §13.

**Allowlist:** panelCoverageManifest.js, panel.js, panel.html, tests/reminders/test_reminder_panel_privacy.js, existing projection / provenance / secret fixtures.

**Görev:**

1. Therapy, medication, mood, prayer completion, journal, note, private title, schedule, token, GPS, raw profile ve media alanları için negative corpus oluştur.
2. Projection, legacy fallback, stale snapshot, error message, DOM, drawer, timeline ve card output’larını tara.
3. Safe aggregate alanlarının minimum necessary olduğunu kanıtla; coverage metadata raw path sızdırmasın.
4. Escaping, XSS, attribute context, filename / title injection ve malformed JSON boundary’lerini test et.
5. Secret scanner false positive’lerini whitelist ederek güvenlik assertion’larını zayıflatma.

**Doğrulama:**

    node tests/reminders/test_reminder_panel_privacy.js
    node tests/test_panel_p1_projection.js
    node tests/test_panel_p4_provenance.js
    node tests/test_panel_p6_qa_release.js
    git diff --check

**Kabul:** Projection + DOM + errors + fixtures secret/raw/private leakage üretmiyor; redaction source state’i mutate etmiyor.

**Kapanış:** PANEL-01 privacy tamamlanır; REM-65 ready.

### REM-65 — Panel responsive, accessibility ve render performance

**Context güvenliği:** Bu prompt tek başına verildiğinde de canonical dosyaları ve Git durumunu yeniden doğrula. Context daralırsa dur, kısa checkpoint / handoff yaz ve yeni sessiona geç; compact özeti veya eski sohbeti güncel kanıt sayma.

**Hedef:** Current ÆON panelde reminder status/card/timeline yüzeylerini premium, erişilebilir, responsive ve polling altında stabil tut.

**Oku:** APP-REMINDER-APP-PANEL-SURFACE-MAP.md §2; panel.css; panel.js render / panelDraftActiveP, panelSig; tests/panel-v2 accessibility only as separate reference.

**Allowlist:** panel.css, panel.js render boundary, panel.html semantics, tests/reminders/test_reminder_panel_a11y.js, test_reminder_panel_performance.js, existing panel responsive / a11y fixtures.

**Görev:**

1. 375, 390, 430, 768, 1280 ve 1440 viewport’larında card, ribbon, timeline, drawer ve status overflow’unu test et.
2. Light / dark theme, focus ring, keyboard, screen reader name, live region, Escape / back, 44px target ve reduced-motion sözleşmesini koru.
3. Polling unchanged state’te full render / layout shift üretme; 304 ve draft defer altında interaction state’i koru.
4. Long Turkish copy, stale/error/empty/redacted states’lerini clipping olmadan göster.
5. Panel-v2 CSS / runtime surface’ini current panel değişikliğine yanlışlıkla dahil etme.

**Doğrulama:**

    node tests/reminders/test_reminder_panel_a11y.js
    node tests/reminders/test_reminder_panel_performance.js
    node tests/test_panel_p5_responsive_a11y.js
    node tests/panel-v2/test_panel_v2_accessibility.js
    node tests/panel-v2/test_panel_v2_performance.js

**Kabul:** Current panel ve Panel-v2 ayrı PASS; no layout shift / focus loss / reduced-motion violation.

**Kapanış:** PANEL-05 kapanır; REM-66 ready.

### REM-66 — Panel fixture architecture ve current / Panel-v2 regression gate

**Context güvenliği:** Bu prompt tek başına verildiğinde de canonical dosyaları ve Git durumunu yeniden doğrula. Context daralırsa dur, kısa checkpoint / handoff yaz ve yeni sessiona geç; compact özeti veya eski sohbeti güncel kanıt sayma.

**Hedef:** Panel reminder acceptance’ının root panel fixture’ları ile Panel-v2 fixture’larını doğru scope’ta, tekrar üretilebilir ve ağsız çalıştırılmasını sağla.

**Oku:** APP-REMINDER-APP-PANEL-SURFACE-MAP.md §2 ve §4; tests/README.md; tests/panel-v2/README.md; existing panel test names; REM-55–65 receipts.

**Allowlist:** tests/reminders/*, tests/README.md, tests/panel-v2/ yalnız ayrı regression assertion gerekiyorsa, docs evidence / ledger / state.

**Görev:**

1. Current panel source, projection, redaction, transport, event, responsive ve release fixture’larını ayrı inventory et.
2. Panel-v2 fixture’larını current panel acceptance yerine koyma; iki komut setini ayrı raporla.
3. Her fixture’ın no-network, no-token, synthetic data, no-write ve deterministic clock boundary’sini static check et.
4. Fixture sayısını başarı kanıtı gibi yazma; test isimleri, exit code ve failure signature kaydet.
5. Root tests, Panel-v2 tests ve reminder tests arasında duplicate / missing coverage raporu çıkar.

**Doğrulama:**

    for f in tests/reminders/test_reminder_panel_*.js; do node "$f"; done
    for f in tests/test_panel_*.js; do node "$f"; done
    for f in tests/panel-v2/test_panel_v2_*.js; do node "$f"; done
    node docs/reminders/verify-reminder-context.mjs
    git diff --check

**Kabul:** Current panel / Panel-v2 / reminder fixture scopes açık; ağsız ve deterministic; missing fixture sessizce atlanmıyor.

**Kapanış:** R13 panel gate kapanır; REM-67 ready.

## Faz R14 — App → sync → projection → panel integration hattı

### REM-67 — Uçtan uca reminder data lineage fixture

**Context güvenliği:** Bu prompt tek başına verildiğinde de canonical dosyaları ve Git durumunu yeniden doğrula. Context daralırsa dur, kısa checkpoint / handoff yaz ve yeni sessiona geç; compact özeti veya eski sohbeti güncel kanıt sayma.

**Hedef:** Kullanıcı app action’ından paneldeki güvenli status/timeline çıktısına kadar reminder data lineage’ını tek synthetic fixture’da kanıtla.

**Oku:** APP-REMINDER-APP-PANEL-SURFACE-MAP.md §3; REM-47, REM-53, REM-55–62; sync.js event / projection paths; panelCoverageManifest.

**Allowlist:** tests/reminders/test_reminder_end_to_end_lineage.js, app/sync/panel adapters only if fixture exposes a real gap, docs evidence.

**Görev:**

1. Synthetic user action → local state → safe event → sanitize → receipt → projection → panel card/timeline akışını kur.
2. Her aşamada source, revision, timestamp, privacy mode ve evidence owner’ı ayrı assert et.
3. Local-only detail’in projection / panel output’ına girmediğini ve safe aggregate’in değişmeden taşındığını kanıtla.
4. Missing receipt, stale projection, malformed event, partial fetch ve legacy fallback branches’lerini çalıştır.
5. Fixture hiçbir gerçek endpoint, token, localStorage veya browser kullanmasın.

**Doğrulama:**

    node tests/reminders/test_reminder_end_to_end_lineage.js
    node tests/reminders/test_reminder_app_privacy.js
    node tests/reminders/test_reminder_panel_source.js
    node docs/reminders/verify-reminder-context.mjs

**Kabul:** Lineage her branch’te source / privacy / status ayrımını koruyor; app ve panel birbirinin private state owner’ı olmuyor.

**Kapanış:** INT-01 lineage kapanır; REM-68 ready.

### REM-68 — Cross-surface status ve failure semantics

**Context güvenliği:** Bu prompt tek başına verildiğinde de canonical dosyaları ve Git durumunu yeniden doğrula. Context daralırsa dur, kısa checkpoint / handoff yaz ve yeni sessiona geç; compact özeti veya eski sohbeti güncel kanıt sayma.

**Hedef:** App, sync receipt, projection manifest ve panel UI’ın aynı olay için çelişkili success / pending / stale / error iddiası üretmesini engelle.

**Oku:** APP-REMINDER-APP-PANEL-SURFACE-MAP.md §2–3; app reminder status adapter; sync receipt contract; panel status helpers; REM-33, REM-59, REM-60.

**Allowlist:** app / sync / panel status adapters, tests/reminders/test_reminder_cross_surface_status.js, decisions / evidence.

**Görev:**

1. Capability, local scheduled, delivered, sync accepted, projection built, panel visible ve device accepted state’lerini ayrı state machine olarak yaz.
2. Bir katmanın PASS’ini diğer katmana otomatik propagate etme.
3. Offline, permission denied, stale prayer, sync conflict, projection missing, panel 304 ve device unverified branches’lerini map et.
4. Kullanıcı copy’si ile operator panel copy’sini aynı hassas detail’den üretme.
5. Status transition’ların monotonic olmayan geri dönüşlerini kontrollü ve açıklanabilir yap.

**Doğrulama:**

    node tests/reminders/test_reminder_cross_surface_status.js
    node tests/reminders/test_reminder_system_status.js
    node tests/reminders/test_reminder_panel_status.js
    node tests/test_panel_p0_sync.js

**Kabul:** Her layer kendi evidence seviyesinde; çelişkili green / live / accepted iddiası yok.

**Kapanış:** INT-02 status gap kapanır; REM-69 ready.

### REM-69 — Schema version, migration ve legacy panel compatibility

**Context güvenliği:** Bu prompt tek başına verildiğinde de canonical dosyaları ve Git durumunu yeniden doğrula. Context daralırsa dur, kısa checkpoint / handoff yaz ve yeni sessiona geç; compact özeti veya eski sohbeti güncel kanıt sayma.

**Hedef:** Reminder schema veya projection manifest değiştiğinde eski app save, eski latest snapshot ve eski panel fallback’in güvenli biçimde çalışmasını sağla.

**Oku:** APP-REMINDER-APP-PANEL-SURFACE-MAP.md §1–2; app migrate; panelCoverageManifest schema / chooseProjection; sync receipt; UX planı §8.2 ve §13.2.

**Allowlist:** app migration, panel manifest compatibility, sync sanitize compatibility, tests/reminders/test_reminder_cross_surface_schema.js, existing migration / projection fixtures.

**Görev:**

1. Version 0 / missing reminder, current version, future unknown version, malformed field ve partial projection fixture’ları oluştur.
2. App migration’ın panel projection’ını bozmadığını; panel fallback’in app state’i mutate etmediğini kanıtla.
3. Unknown fields preserve / redacted / unmapped kararlarını explicit yap.
4. Schema version mismatch’i success gibi göstermeden actionable status üret.
5. Rollback / older Pages asset / stale service worker senaryosunu release note’a bağla.

**Doğrulama:**

    node tests/reminders/test_reminder_cross_surface_schema.js
    node .claude/skills/run-seyma/verify-state-migration-boundary.mjs
    node tests/test_panel_p1_projection.js
    node tests/test_panel_p6_qa_release.js

**Kabul:** Eski state / old projection / future field branches fail-safe; migration parity ve panel fallback ayrı evidence’lı.

**Kapanış:** INT-01 schema gap kapanır; REM-70 ready.

### REM-70 — Integrated privacy, security ve no-write acceptance

**Context güvenliği:** Bu prompt tek başına verildiğinde de canonical dosyaları ve Git durumunu yeniden doğrula. Context daralırsa dur, kısa checkpoint / handoff yaz ve yeni sessiona geç; compact özeti veya eski sohbeti güncel kanıt sayma.

**Hedef:** App, native, SW, sync, projection, panel DOM, error, event ve external write boundary’lerinde tek bir integrated negative security gate oluştur.

**Oku:** APP-REMINDER-APP-PANEL-SURFACE-MAP.md §3–4; AGENTS data safety; approval gate; REM-52, REM-53, REM-57, REM-63, REM-64.

**Allowlist:** tests/reminders/test_reminder_integrated_privacy.js, static scanner helper, docs evidence / decisions. Production write yok.

**Görev:**

1. Synthetic corpus ile therapy, medication, mood, prayer completion, journal, note, token, GPS, raw body ve private title’ı her output channel’da ara.
2. Browser, notification, SW, sync, projection, panel DOM, panel error, event log ve exported summary sonuçlarını ayrı raporla.
3. App / panel write endpoints’lerinde reminder payload denylist’ini test et.
4. mustafaras/seyma-data, gerçek network, gerçek token ve gerçek user device yok.
5. Fail halinde hangi surface’in blocked olduğunu exact path / assertion ile yaz.

**Doğrulama:**

    node tests/reminders/test_reminder_integrated_privacy.js
    node tests/reminders/test_reminder_app_privacy.js
    node tests/reminders/test_reminder_panel_privacy.js
    node tests/test_panel_p6_qa_release.js
    git diff --check

**Kabul:** Tüm output kanalları negative privacy suite PASS; external write count sıfır; fail-closed evidence hazır.

**Kapanış:** INT-02 privacy gate kapanır; REM-71 ready.

### REM-71 — Integrated UX, accessibility ve visual acceptance

**Context güvenliği:** Bu prompt tek başına verildiğinde de canonical dosyaları ve Git durumunu yeniden doğrula. Context daralırsa dur, kısa checkpoint / handoff yaz ve yeni sessiona geç; compact özeti veya eski sohbeti güncel kanıt sayma.

**Hedef:** Reminder’ın app ve panelde aynı veriyi farklı privacy / density / operator context ile estetik ve erişilebilir biçimde sunduğunu doğrula.

**Oku:** APP-REMINDER-APP-PANEL-SURFACE-MAP.md; UX planı §9, §12, §16, §19; app / panel visual and a11y fixtures; Panel-v2 current state yalnız ayrı referans.

**Allowlist:** tests/reminders/test_reminder_integrated_ux.js, app / panel CSS / render remediation if exact fixture fails, evidence.

**Görev:**

1. App mobile light/dark ve panel responsive light/dark / density states’lerini ayrı karşılaştır.
2. App user copy ile panel operator copy’sinin private detail paylaşmadığını doğrula.
3. Focus, keyboard, screen reader, live region, reduced motion, long Turkish text, empty/stale/error/redacted state’lerini iki yüzeyde çalıştır.
4. App action’dan panel status’a kadar visual state transition’ı deterministic markup / style assertion ile ölç.
5. Premium branding korunurken status severity, privacy ve capability text’inin görünür kalmasını sağla.

**Doğrulama:**

    node tests/reminders/test_reminder_integrated_ux.js
    node tests/reminders/test_reminder_app_render.js
    node tests/reminders/test_reminder_panel_a11y.js
    node tests/test_panel_p5_responsive_a11y.js
    git diff --check

**Kabul:** App ve panel accessibility / visual / copy acceptance PASS; surfaces birbirinin private context’ini taşımıyor.

**Kapanış:** INT-02 UX gate kapanır; REM-72 ready.

### REM-72 — App + panel release candidate ve user approval packet

**Context güvenliği:** Bu prompt tek başına verildiğinde de canonical dosyaları ve Git durumunu yeniden doğrula. Context daralırsa dur, kısa checkpoint / handoff yaz ve yeni sessiona geç; compact özeti veya eski sohbeti güncel kanıt sayma.

**Hedef:** Uygulama ve panel birlikte release candidate seviyesine geldiyse kaynak, test, projection, privacy, CI, Pages ve cihaz kanıtlarını ayır; kullanıcı onayı olmadan hiçbir live action yapma.

**Oku:** APP-REMINDER-APP-PANEL-SURFACE-MAP.md tamamı; APP-REMINDER-APPROVAL-GATE.md; REM-54, REM-66–71 receipts; full test matrix; EVIDENCE-RECEIPT-TEMPLATE.

**Allowlist:** evidence/REM-72.md, ledger, STATE.json, traceability, test matrix, decisions. Source yalnız önceki prompt’un açık remediation scope’u ile.

**Görev:**

1. App runtime, current panel, Panel-v2, root fixtures, reminder fixtures, schema, privacy, accessibility ve no-write suite’lerini yeniden çalıştır.
2. App source, panel source, sync/projection, tests, local commit, remote, CI/Pages, live HTTP ve device acceptance kanıtlarını ayrı bölümlere ayır.
3. Release candidate scope’unu app / panel / data repo eylemleri olarak ayrı yaz.
4. releaseApproval.status not_approved kalırken release packet’i tamamla; push, merge, Pages, live browser ve external write yapma.
5. Kullanıcıya sorulacak exact approval sentence’i ve scope seçeneklerini handoff’a yaz; approval’ı ajan üretmesin.

**Doğrulama:**

    node docs/reminders/verify-reminder-context.mjs
    node --check app.js
    node --check sync.js
    node --check sw.js
    node --check panel.js
    node --check panelCoverageManifest.js
    for f in tests/reminders/test_*.js; do node "$f"; done
    for f in tests/test_*.js; do node "$f"; done
    for f in tests/panel-v2/test_panel_v2_*.js; do node "$f"; done
    git diff --check

**Kabul:** App + panel release packet eksiksiz; state not_approved; canlı, push, merge, Pages ve gerçek veri deposu write yapılmamış.

**Kapanış:** R14 gate kapanır; REM-42 approval_required zincirine dönülür. REM-43 yalnız exact user approval scope sonrası ayrı kalır.

Bir fazın son promptu bitince:

- Fazın bütün promptları done veya gerekçeli deferred.
- blockedPrompt null.
- STATE ve ledger aynı activePrompt / nextSafeAction değerlerini söylüyor.
- Faz test matrisi PASS.
- Migration, privacy, accessibility ve panel etkisi ayrı kanıtlı.
- Allowlist dışı çalışma ağacı değişikliği yok.
- Cache-bust gerekiyorsa aynı committe yapılmış.
- Push / deploy yetkisi ayrıca kararlaştırılmadıysa yapılmamış.
