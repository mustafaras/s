# ŞEYMA PREMIUM FX — YENİ SESSION STARTER (v2, 2026-08-31)

> **Bu dosya, FX-P-03'e geçmeden önce yeni bir oturumun soğuk başlangıçta okuması gereken her şeyi içerir.**
> Önceki oturumda plan belgeleri denetlendi, mimari karar B1 alındı ve **3 kırık fonksiyon bulundu**.
> Bu bulgular çözülmeden FX-P-03'e geçilmemelidir.

---

## 0. İlk 60 Saniye (Asla Atla)

```bash
cd /Users/m_ras/Desktop/seyma
git checkout premium-fx-local
git status --short --branch
cat premium-fx-plan/.anti-amnesia/FX-PROMPT-STATE.json
sed -n '1,40p' premium-fx-plan/.anti-amnesia/CURRENT-STATE.md
sed -n '20,30p' premium-fx-plan/.anti-amnesia/LEDGER.md   # seq 22, 23, 24'ü oku
git log --oneline -8
```

- `blockedPrompt` doluysa → **DUR**, kullanıcıdan çözüm iste.
- `activePrompt` doluysa → yarım kalmış prompt var; `git status` ile incele, ya tamamla ya `git checkout -- .` ile geri al.
- Aksi halde sıradaki prompt = `lastCompletedPrompt` + 1.

---

## 1. Proje Özeti

- **Repo:** `mustafaras/s` → yerel kopya `/Users/m_ras/Desktop/seyma`
- **Branch:** `premium-fx-local` (sadece yerel commitler, push yok)
- **Plan:** `premium-fx-plan/` — 54 prompt (FX-P-01 … FX-P-74)
- **Son durum:** FX-P-01 ✅, FX-P-02 ✅, plan audit-fix ✅, B1 kararı ✅
- **Sıradaki:** FX-P-03 (ama önce seq 24 bulguları çözülmeli)

---

## 2. ⚠️ KRİTİK: ÇÖZÜLMESİ GEREKEN 3 KIRIK FONKSİYON (seq 24)

**Kök neden:** FX-P-01'in "fonksiyonları kopyala" talimatı, closure bağımlılıklarını (`data`, `ui`, `getDay`) kaybettirdi. Bu fonksiyonlar **yalnızca Faz 0'da canlı getter eklendiğinde (B1) çalışır hale gelir.** Şu an iskelet; çağrılırsa kırılır.

| # | Dosya | Fonksiyon | Sorun | app.js orijinali |
|---|-------|-----------|-------|------------------|
| 1 | `app/core/dateUtils.js` | `dayIndexFor` | `window.SeymaConstants.START_DATE` kullanıyor ama `START_DATE` constants.js'te **YOK**; `data` closure'da → ReferenceError | `diffDays(data.startDate, date)+1` (app.js 4732) |
| 2 | `app/core/dateUtils.js` | `activeDate` | `window.ui` kullanıyor ama `ui` closure'da → her zaman `todayStr()` döner | `(ui.editDate)?ui.editDate:todayStr()` (app.js 4736) |
| 3 | `app/core/dateUtils.js` | `curDay` | `window.SeymaState.getDay` kullanıyor ama `getDay` closure'da → TypeError | `getDay(data,d,dayIndexFor(d))` (app.js 4738) |

**Çözüm seçenekleri:**
- **A)** Bu 3 fonksiyonu app.js orijinallerine hizala (Faz 0 canlı getter'larına bağımlı hale getir): `dayIndexFor` → `window.SeymaState.data.startDate`; `activeDate` → `window.SeymaState.ui.editDate`; `curDay` → `window.SeymaState.getDay(window.SeymaState.data, d, ...)`.
- **B)** FX-P-03 testlerini bu duruma göre yaz (fonksiyonların şu an iskelet olduğunu, Faz 0'da canlanacağını doğrula).

**Ayrıca:**
- `state.js` yorumu hâlâ eski "lazy getter" yaklaşımını anlatıyor → B1'e göre güncellenmeli.
- `helpers.js` `haptic` aynı closure sorununu taşıyor (`window.SeymaState.data` → `undefined` → kapatma kontrolü devre dışı). Şu an kırıcı değil ama Faz 0'da düzeltilecek.

---

## 3. Mimari Karar B1 (seq 23) — CANLI GETTER

**Sorun:** `data` mutable bir bağlama — boot'tan sonra **6+ kez yeniden atanıyor** (4412/4413/6692/9203/18724/9173/9177). Tek seferlik `window.data = data` bayat kalır.

**Çözüm (B1):** Faz 0'da (FX-P-05) `app.js`'e **canlı getter** eklenir:
```js
Object.defineProperty(window, 'data', { get: function(){ return data; }, configurable: true });
Object.defineProperty(window, 'ui',   { get: function(){ return ui; },   configurable: true });
Object.defineProperty(window, 'dark', { get: function(){ return dark; }, configurable: true });
Object.defineProperty(window, 'migrate', { get: function(){ return migrate; }, configurable: true });
Object.defineProperty(window, 'getDay',  { get: function(){ return getDay; },  configurable: true });
Object.defineProperty(window, 'createDefaultData', { get: function(){ return createDefaultData; }, configurable: true });
Object.defineProperty(window, 'save', { get: function(){ return save; }, configurable: true });
```
Her okumada closure'daki `data`'nın taze değerini döndürür. **VM'de kanıtlandı (6/6):** boot/reset/import sonrası `window.data` taze, `SeymaState.data` doğru.

**Değişmezlik yeniden tanımı:** I2/I3/I4 "dokunulmaz" = **"davranış değiştirmez"**, "hiç satır eklenmez" değil. Canlı getter'lar mevcut fonksiyon davranışını/imzasını değiştirmez.

**Kritik uyarı:** `syncGlue.js`'te `SeyOnSyncState`/`SeyOnSynced` **yeniden tanımlanmaz** — getter-only accessor yapılırsa app.js'in strict-mode ataması THROW eder. Yalnızca `SeymaSave` getter olarak tanımlanır.

---

## 4. Ground Truth (grep ile doğrulandı)

**`app.js`'te `window`'a atanan yalnızca 3 şey:**
- `window.SeyOnSyncState` (6198)
- `window.SeyOnSynced` (6208)
- `window.App` (16888)

**Closure-scoped (window'da DEĞİL):** `data`(2710), `ui`(4678), `dark`(4616), `migrate`(4415), `getDay`(4922), `createDefaultData`(6684), `save`(6229).

**`emptyDay` fonksiyonu YOK** (plan belgeleri yanlış varsayıyordu; düzeltildi).

**`pad` fonksiyonu** (pad2 değil) → app.js 4726.

**`constants.js` expose:** `SeymaConstants = { KEY, TKEY, FEATURE_GATE_TS, ICONS }` — SADECE bunlar. `icon()`, `HABITS`, `SOUL_ACTIVITY_CATALOG` constants.js'te YOK (app.js'te).

---

## 5. Hard Rules (İhlali Geri Alma / Kullanıcıya Bildirme)

| Kural | Açıklama | Kanıt |
|---|---|---|
| **LOCAL-ONLY** | `git push`, PR, deploy, `gh pr create`, başka remote'a yazma **yasak**. | `git log` sadece yerel commitler göstermeli. |
| **I1** | `data` nesnesinin şekli değişmez; yeni alan sadece `settings.*` altına eklenir. | `node tests/app/test_faz10_sync.js` |
| **I2** | `App.<name>` handler yüzeyi değişmez. | `grep -o 'App\.[a-zA-Z0-9_]*\s*=' app.js \| sort -u` öncesi/sonrası aynı (701) |
| **I3** | `migrate()` davranışı değişmez (additive backfill genişletilebilir). | `verify-state-migration-boundary.mjs` |
| **I4** | `save()` ve `sync.js` davranışı değişmez. | `test_faz10_sync.js` |
| **I5** | `index.html`'de `app.js` `<script>` tagi kaldırılmaz. | `grep -c 'src="app.js' index.html` = 1 |
| **I6** | Tek prompt = tek yerel commit; her prompt tek başına geri alınabilir. | `git log -1` mesajı prompt kodunu içermeli. |

---

## 6. Context Load Sırası (Her Prompt Öncesi)

1. `.anti-amnesia/CURRENT-STATE.md`
2. `.anti-amnesia/LEDGER.md` (özellikle seq 22, 23, 24)
3. `premium-fx-plan/NEXT-STEPS.md`
4. `premium-fx-plan/LOCAL-ONLY-IMPLEMENTATION.md`
5. `premium-fx-plan/.prompts/PROMPT-CATALOG.md`
6. İlgili dalga spec'i: `premium-fx-plan/deliverables/SPEC-FAZ-*.md`
7. `premium-fx-plan/API-TRANSITION-GUIDE.md`
8. `premium-fx-plan/SAFEGUARDS.md`
9. Uygulanacak prompt: `.prompts/FX-P-NN.md`

---

## 7. Sıradaki İş: FX-P-03 (ama önce seq 24'ü çöz)

**FX-P-03:** `test_date_utils_boundary.js` ve `test_helpers_boundary.js` **genişlet** (dosyalar FX-P-01'de oluştu; "oluştur" değil "genişlet").

**ÖN KOŞUL:** seq 24'teki 3 kırık fonksiyonu çöz (Bölüm 2'deki A veya B seçeneği). Aksi halde FX-P-03 testleri bu kırık fonksiyonları çağırırsa başarısız olur.

---

## 8. Her Promptta Standart Akış

1. **FX-PROMPT-STATE.json** güncelle: `activePrompt: "FX-P-NN"`.
2. İlgili dosyaları oku ve uygula.
3. `node --check <degisen>.js` çalıştır.
4. S5 test kapısını çalıştır.
5. S6 değişmezlik kanıtını çalıştır.
6. **Anti-amnesi güncelle:** LEDGER + CURRENT-STATE + FX-PROMPT-STATE.
7. **Yerel commit:** `git add -A && git commit -m "premium-fx: FX-P-NN <kısa Türkçe açıklama>"`
8. **Push yapma.**

---

## 9. S5 Doğrulama Kapısı (Her Prompt Sonu)

```bash
cd /Users/m_ras/Desktop/seyma
node --check app.js && node --check sync.js
node .claude/skills/run-seyma/driver.mjs
node .claude/skills/run-seyma/zikr-harness.mjs
node tests/app/test_faz10_sync.js
node tests/panel/test_faz11_panel.js
for f in tests/panel-v2/test_panel_v2_*.js; do node "$f" || echo "FAIL: $f"; done
```

Prompta özel test varsa (örn. `test_premium_audio_fx.js`) onu da çalıştır.

---

## 10. S6 Değişmezlik Kanıtı

Prompt öncesi ve sonrasında şu komutların çıktısı aynı olmalı:

```bash
grep -o 'App\.[a-zA-Z0-9_]*\s*=' app.js | sort -u | wc -l   # 701
grep -o 'onclick="App\.[a-zA-Z0-9_]*' app.js | sort | uniq -c
grep -c 'src="app.js' index.html   # 1
```

Fark varsa → `git checkout -- .` ve kullanıcıya bildir.

---

## 11. Veri Güvenliği (Şeyma CLAUDE.md / AGENTS.md)

- Uygulamayı **tarayıcıda açma**.
- Görsel QA için `driver.mjs --dump <sekme>` kullan.
- `mustafaras/seyma-data` deposuna **yazma yok**.
- Localhost server sadece kullanıcı ajan-tarafından ekran görüntüsü istediğinde, port `9000` ile açılır; sonunda `pkill -f http.server`.

---

## 12. Anti-Amnesi Güncellemesi (Her Prompt Sonu Zorunlu)

### LEDGER.md satırı
```markdown
| FX-P-NN | 2026-08-31 | GitHub Copilot | <kısa ad> | ✅ TAMAMLANDI | <yerel commit> | S5/S6 geçti | <bir cümle sonuç> |
```

### CURRENT-STATE.md
- "Durum" ve "Devam Eden" bölümlerini güncelle.
- Sıradaki promptu yaz.

### FX-PROMPT-STATE.json
- Başlatırken: `activePrompt: "FX-P-NN"`
- Bitirirken: `activePrompt: null`, `lastCompletedPrompt: "FX-P-NN"`, `currentPhase: "Faz X"`

---

## 13. Rollback (Bir Şey Ters Giderse)

```bash
cd /Users/m_ras/Desktop/seyma
git checkout -- .
git clean -fd
git checkout premium-fx-local
```

---

## 14. İletişim Kuralı

- Her adım sonunda kısa durum raporu ver.
- "Tamamlandı" demeden önce test çıktılarını göster.
- Kullanıcıdan **her dalga öncesi** ayrı onay al.
- Şüpheye düştüğünde dur ve kullanıcıya sor.
