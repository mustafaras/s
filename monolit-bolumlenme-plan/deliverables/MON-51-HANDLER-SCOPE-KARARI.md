# MON-51 — Domain handler scope decision

## Binding scope

MON-51 does **not** mean every `App.*` name that happens to contain a domain
word. It covers the local UI handler shells whose domain logic is already
owned by one of the seven existing registries:

| Registry | Handler surface |
|---|---|
| `SeymaPrayer` | `setPrayerCity`, `setPrayerMethod`, `togglePrayer`, `setPrayerNote`, `changeNafile` |
| `SeymaZikr` | `setZikrPreset`, `zikrManualApply`, `toggleZikrPause`, `startNewZikrHatim` |
| `SeymaQuran` | `quranNoteField`, `quranAddNote`, `openQuranJourney`, `closeQuranJourney`, `openQuranSurah`, `backToQuranLibrary`, `setQuranQuery`, `clearQuranQuery`, `setQuranFilter`, `resetQuranLens`, `toggleQuranFilters`, `onQuranKeydown` |
| `SeymaSaygi` | `openSaygiPreview`, `openSaygiCollectionPerson`, `browseSaygiPerson`, `closeSaygiPerson`, `markSaygiRead` |
| `SeymaMotivation` | `openRoom`, `closeRoom`, `updateRoom`, `setRoomTab`, `toggleRoomTool`, `toggleMotivationCard` |
| `SeymaCrisis` | `openCrisis`, `closeCrisis`, `toggleCrisisDropdown`, `toggleCrisisOpt`, `toggleCrisisTrigger`, `onCrisisNote`, `completeCrisis`, `resetCrisis` |
| `SeymaJournal` | `openJournalModal`, `closeJournalModal`, `setJournalMode`, `onJournalText`, `useJournalPrompt`, `saveJournal` |

## Explicit exclusions

- `fetchPrayerLocationGPS`, `refreshPrayerTimes` and any device permission or
  network path remain app.js-owned.
- Quran submit/watch/question/refresh and all outbox, delivery, response and
  WhatsApp paths remain frozen transport owners; they are not MON-51.
- `refreshSaygi` remains app.js-owned because it initiates external fetch.
- Reminder/notification, library, health, overlay/settings/archive handlers,
  `App` construction, all data rebinds, `save`, `render` and DOM/focus helper
  ownership remain outside this card.

The listed handlers may retain app.js-owned resolver bags for mutation,
save/render and DOM/focus sequencing. `appSurface` may call the named domain
registry only; it must not copy domain bodies or redefine the registries.
