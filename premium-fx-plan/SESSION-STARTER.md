# ŞEYMA PREMIUM FX — YENİ SESSION STARTER (v3, 2026-09-01)

> **Bu dosya, her yeni oturumun soğuk başlangıçta okuması gereken her şeyi içerir.**
> Amaç: context'ten kopmadan, kaldığımız yerden devam etmek. Anti-amnesi dosyaları
> (`CURRENT-STATE.md`, `LEDGER.md`, `FX-PROMPT-STATE.json`, `NEXT-STEPS.md`) her
> prompt sonunda güncellenir; bu starter onları nasıl okuyup nereden devam edeceğini söyler.

---

## 0. İlk 60 Saniye (Asla Atla)

```bash
cd /Users/m_ras/Desktop/seyma
git checkout premium-fx-local
git status --short --branch
cat premium-fx-plan/.anti-amnesia/FX-PROMPT-STATE.json
sed -n '1,40p' premium-fx-plan/.anti-amnesia/CURRENT-STATE.md
git log --oneline -8
```

**Durum makinesi okuma:**
- `blockedPrompt` doluysa → **DUR**, kullanıcıdan çözüm iste.
- `activePrompt` doluysa → yarım kalmış prompt var; `git status` ile incele, ya tamamla ya `git checkout -- .` ile geri al.
- Aksi halde sıradaki prompt = `lastCompletedPrompt` + 1 (veya `NEXT-STEPS.md`'deki "Sırada Yapılacaklar" listesine bak).

---

## 1. Proje Özeti

- **Repo:** `mustafaras/s` → yerel kopya `/Users/m_ras/Desktop/seyma`
- **Branch:** `premium-fx-local` (sadece yerel commitler, **push yok**)
- **Plan:** `premium-fx-plan/` — 74 prompt (FX-P-01 … FX-P-74), 7 dalga
- **Son durum:** **Faz 1 tamamlandı** (FX-P-16 kapanışı). Dalga 1 Audio bitti.
- **Sıradaki:** **Dalga 2 / FX-P-21** (Haptics) — **ayrı kullanıcı onayı bekleniyor.**

---

## 2. ⚠️ KRİTİK: VERİ GÜVENLİĞİ (Şeyma CLAUDE.md / AGENTS.md)

- Uygulamayı **tarayıcıda açma** ("çalışıyor mu" kontrolü için).
- Görsel QA için `driver.mjs --dump <sekme>` kullan.
- `mustafaras/seyma-data` deposuna **yazma yok** (okuma serbest).
- Localhost server sadece kullanıcı ajan-tarafından ekran görüntüsü istediğinde, port `9000` ile açılır; sonunda `pkill -f http.server`.
- `sync.js` Guard 1 (localhost push engeli) ve Guard 2 (anti-clobber) **devre dışı bırakılmaz**.

---

## 3. Hard Rules (İhlali Geri Alma / Kullanıcıya Bildirme)

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

## 4. Mimari Karar B1 (seq 23) — CANLI GETTER

**Sorun:** `data` mutable bir bağlama — boot'tan sonra **6+ kez yeniden atanıyor**. Tek seferlik `window.data = data` bayat kalır.

**Çözüm (B1):** Faz 0'da (FX-P-05) `app.js`'e **canlı getter** eklendi:
```js
Object.defineProperty(window, 'data', { get: function(){ return data; }, configurable: true });
Object.defineProperty(window, 'ui',   { get: function(){ return ui; },   configurable: true });
Object.defineProperty(window, 'dark', { get: function(){ return dark; }, configurable: true });
Object.defineProperty(window, 'migrate', { get: function(){ return migrate; }, configurable: true });
Object.defineProperty(window, 'getDay',  { get: function(){ return getDay; },  configurable: true });
Object.defineProperty(window, 'createDefaultData', { get: function(){ return createDefaultData; }, configurable: true });
Object.defineProperty(window, 'save', { get: function(){ return save; }, configurable: true });
```
Her okumada closure'daki `data`'nın taze değerini döndürür. **VM'de kanıtlandı (6/6).**

**Değişmezlik yeniden tanımı:** I2/I3/I4 "dokunulmaz" = **"davranış değiştirmez"**, "hiç satır eklenmez" değil.

**Kritik uyarı:** `syncGlue.js`'te `SeyOnSyncState`/`SeyOnSynced` **yeniden tanımlanmaz** — getter-only accessor yapılırsa app.js'in strict-mode ataması THROW eder. Yalnızca `SeymaSave` getter olarak tanımlanır.

---

## 5. Ground Truth (grep ile doğrulandı)

**`app.js`'te `window`'a atanan yalnızca 3 şey:**
- `window.SeyOnSyncState` (6198)
- `window.SeyOnSynced` (6208)
- `window.App` (16888)

**Closure-scoped (window'da DEĞİL):** `data`(2710), `ui`(4678), `dark`(4616), `migrate`(4415), `getDay`(4922), `createDefaultData`(6684), `save`(6229).

**`emptyDay` fonksiyonu YOK.** **`pad` fonksiyonu** (pad2 değil) → app.js 4726.

**`constants.js` expose:** `SeymaConstants = { KEY, TKEY, FEATURE_GATE_TS, ICONS }` — SADECE bunlar.

**`mediaFx.js` API yüzeyi (FX-P-06/11):**
- `SeyAudio`: `ctx` (lazy getter), `tap`/`success`/`warning`/`bell`/`voice`/`ambient`
- `SeyHaptics`: `tap`/`success`/`error`/`refresh`/`streak`/`water`
- `SeyFx`: `isPremiumFxEnabled`/`prefersReducedMotion`/`shouldAnimate`/`ambientAllowed`/`countUp`/`ripple`/`shimmer`

**Settings alanları (FX-P-05 migrate backfill):** `premiumAtmosphere`/`uiSounds`/`voiceGuidance`/`ambientSounds`/`richHaptics`/`launchRitual`.

---

## 6. Context Load Sırası (Her Prompt Öncesi)

1. `.anti-amnesia/CURRENT-STATE.md`
2. `.anti-amnesia/LEDGER.md` (özellikle son seq'ler)
3. `premium-fx-plan/NEXT-STEPS.md`
4. `premium-fx-plan/LOCAL-ONLY-IMPLEMENTATION.md`
5. `premium-fx-plan/.prompts/PROMPT-CATALOG.md`
6. İlgili dalga spec'i: `premium-fx-plan/deliverables/SPEC-FAZ-*.md`
7. `premium-fx-plan/API-TRANSITION-GUIDE.md`
8. `premium-fx-plan/SAFEGUARDS.md`
9. Uygulanacak prompt: `.prompts/FX-P-NN.md`

---

## 7. Sıradaki İş: Dalga 2 / FX-P-21 (Haptics)

**Durum:** Faz 1 (Audio) tamamlandı. **FX-P-21 `SeyHaptics` implementasyonu** sırada, ama **ayrı kullanıcı onayı bekleniyor.**

**Başlamadan önce:**
- Kullanıcıdan Dalga 2 onayı al.
- `FX-PROMPT-STATE.json`'da `activePrompt: "FX-P-21"` yap.
- `.prompts/FX-P-21.md` dosyasını oku ve uygula.

---

## 8. Her Promptta Standart Akış

1. **FX-PROMPT-STATE.json** güncelle: `activePrompt: "FX-P-NN"`.
2. İlgili dosyaları oku ve uygula.
3. `node --check <degisen>.js` çalıştır.
4. S5 test kapısını çalıştır.
5. S6 değişmezlik kanıtını çalıştır.
6. **Anti-amnesi güncelle:** LEDGER + CURRENT-STATE + FX-PROMPT-STATE + NEXT-STEPS.
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

Prompta özel test varsa (örn. `test_premium_audio_fx.js`, `test_premium_haptics_fx.js`) onu da çalıştır.

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

## 11. Anti-Amnesi Güncellemesi (Her Prompt Sonu Zorunlu)

### LEDGER.md satırı
```markdown
| FX-P-NN | 2026-09-01 | GitHub Copilot | <kısa ad> | ✅ TAMAMLANDI | <yerel commit> | S5/S6 geçti | <bir cümle sonuç> |
```

### CURRENT-STATE.md
- "Durum" ve "Devam Eden" bölümlerini güncelle.
- Sıradaki promptu yaz.

### FX-PROMPT-STATE.json
- Başlatırken: `activePrompt: "FX-P-NN"`
- Bitirirken: `activePrompt: null`, `lastCompletedPrompt: "FX-P-NN"`, `currentPhase: "Faz X"`

### NEXT-STEPS.md
- "Sırada Yapılacaklar" listesini güncelle.

---

## 12. Tamamlanan Dalgalar (Hızlı Referans)

| Dalga | Promptlar | Durum |
|---|---|---|
| Faz -1.1 (modül iskeletleri) | FX-P-01…04 | ✅ |
| Dalga 0 (migrate + getter + API) | FX-P-05, FX-P-06 | ✅ |
| Dalga 1 (Audio) | FX-P-11…16 | ✅ |
| **Dalga 2 (Haptics)** | **FX-P-21…** | ⏳ onay bekliyor |
| Dalga 3+ (count-up, ripple, shimmer, time-theme, launch, voice, ambient) | FX-P-31… | ⏳ |

---
