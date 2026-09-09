# MON-28 — Journal domain state transition

**Tarih:** 2026-09-09
**Kart:** MON-28 · öncül MON-27 · Dalga 6
**Delege / registry:** SeymaJournal
**Durum:** ✅ accepted · LOCAL-ONLY

## Karar özeti

Günlük Işığı / terapi notu yüzeyinin salt içerik, hesap ve HTML üretim gövdeleri
`app/core/journal.js` içindeki `window.SeymaJournal` registry'sine alındı.
`app.js` canlı state, DOM güncellemeleri, modal/focus altyapısı, App handlerları
ve persistence sırasının sahibi olarak kaldı. `data.days.*.journal` şeması,
`sync.js`, `profile` ve `motivation` değişmedi.

## State transition table

| Alan / davranış | MON-27 sonrası canlı kaynak | MON-28 sonrası sahiplik ve kanıt |
|---|---|---|
| Günlük mod kataloğu ve faz promptları | `app.js` | `app/core/journal.js` → `SeymaJournal`; 8 mod / F1–F4 korunur |
| Aktif faz, prompt, bilimsel ipucu | `app.js` | Registry; motivation content lazy resolver ile okunur, yüklemede çağrılmaz |
| `journalStreak`, tarih kısa formatı | `app.js` | Registry; `note` veya `journal.text` üzerinden aynı ardışık hesap |
| `journalLightCardHTML` | `app.js` | Registry; `bugun` kartı parent/current 1116 byte ve SHA-256 eşit |
| `journalModalHTML` | `app.js` | Registry; textarea/count/goal/streak/savedAt copy ve dialog focus korunur |
| `open/close/setMode/onText/usePrompt/saveJournal` | `app.js` | App-owned handler ve mutation kabuğu; inline `App.*` yüzeyi değişmedi |
| Save sırası | `app.js` | `text/count/streakAtSave/savedAt` → `syncDerivedHabits` → `save(false,...)` → card/UI/render |

## Dependency ve sınır envanteri

Registry, `data`, `ui`, `activeDate`, `dayIndexFor`, `todayStr`, `addDays`,
`icon`, `esc`, `find` ve lazy `motivationProgram` resolverlarını named live bag
üzerinden alır. Eksik veya ikinci register fail-closed reddedilir. Module load
anında DOM, storage, timer, fetch, save, render veya state field write yoktur.
HTML üreticileri mevcut `App.openJournalModal`, `App.closeJournalModal`,
`App.setJournalMode`, `App.onJournalText`, `App.useJournalPrompt` ve
`App.saveJournal` inline handlerlarını aynen üretir. Dialog `role="dialog"`,
`aria-modal="true"`, `tabindex="-1"` ve ortak `App.onModalKeydown` contract'ını
korur.

## Load-order / cache-bust zinciri

Yeni kaynak `app/core/journal.js?v=20260909a`, `motivation → crisis → journal →
mediaFx` konumunda eklendi. Aynı kaynak sırası `index.html`,
`.claude/skills/run-seyma/driver.mjs`,
`.claude/skills/run-seyma/zikr-harness.mjs` ve
`tests/app/test_state_rebind_boundary.js` boot listesinde korundu. Migration,
ÆON, zikir manual, FX2 overlay/tab/touch ve reminder app-boot fixture'ları da
aynı journal kaynağını yükler.

## Evidence

- `node tests/app/test_journal_boundary.js`: **33/33**
- `node tests/app/test_modal_focus_containment.js`: **41/41**
- `node .claude/skills/run-seyma/driver.mjs --dump bugun`: **PASS**
- Parent/current `bugun` journal kartı: **1116/1116 byte**, SHA-256
  `bc43679fa42eecb0e4029f712daffc502ed737b5be0d052c33a79a7378e40b57`
- `node tests/app/test_modularization_boundary.js`: **76/76**
- `node .claude/skills/run-seyma/zikr-harness.mjs`: **95/95**
- `node tests/app/test_faz10_sync.js`: **69/69**
- Full `tests/app`, `tests/panel`, `tests/panel-v2`, `tests/quran`, premium,
  reminder smoke ve B1/B2/B3/state/save/large-file fixture aileleri: **exit 0**
- `node --check app.js`, `sync.js` ve `app/core/journal.js`: **PASS**

## Değişmeyen / ayrı kapılar

`sync.js` ve Guard 1/2, data schema/migrate/getDay/default, profile/motivation
content, render çekirdeği, modal altyapısı, panel, network ve gerçek veri deposu
değişmedi. Browser/device kabulü, push, merge, tag ve deploy yapılmadı; gerçek
veri veya token kullanılmadı. Halt yok. Sıradaki kart MON-29'dur ve yeni açık
kullanıcı yönü olmadan başlatılmaz.
