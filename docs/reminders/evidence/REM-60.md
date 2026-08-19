# REM-60 — Panel status, provenance ve operational health

## Receipt

- **Program:** APP-REMINDER-UX
- **Prompt:** REM-60
- **Tarih:** 2026-08-19
- **Commit:** `a35c16f`
- **Repo:** `/Users/m_ras/Desktop/seyma`
- **Başlangıç HEAD:** `14b8c0d` (REM-59 kapanış makbuzu)
- **Release approval:** `NOT_APPROVED`
- **Approval evidence:** `none` (standing `after_each_prompt` teslimatı ayrı kayıttır)

## Kapsam

- **Allowlist:** `panel.js` status / provenance surfaces, `panel.css`,
  `tests/reminders/test_reminder_panel_status.js` (yeni G13-F gate),
  existing `tests/test_panel_staleness_badge.js`, `tests/test_panel_p6_qa_release.js`
  (regression)
- **Closure records:** `docs/reminders/evidence/REM-60.md`,
  `docs/reminders/APP-REMINDER-ANTI-AMNESIA-LEDGER.md`,
  `docs/reminders/APP-REMINDER-STATE.json`
- **Protected paths changed:** `no`
- **App runtime dosyası değişikliği:** `no`
- **Panel-v2:** ayrı regression olarak koşuldu, değiştirilmedi

## Görev 1 — App local state, sync receipt, projection, section fetch, capability ve device acceptance ayrı status alanları

Reminder gözlem durumu panelde beş ayrı boyuta ayrıldı:

| Boyut | Fonksiyon | Anlam |
|---|---|---|
| Kaynak (source freshness) | `reminderSourceStatusP` | reminderSystemStatusP'un 5 durumunu (unavailable/stale/error/pending/ok) 8 tona eşler; yalnız ok → accepted tazelik/başarı iddiası taşır |
| Receipt (uzak kabul) | `reminderReceiptStatusP` | syncStatusP üzerinden accepted/missing/error/pending ayrışır; accepted yalnız revision + acceptedAt kanıtıyla |
| Capability | `reminderCapabilityStatusP` | projection contract'ı (reminderCoverageVersion) mevcutsa redacted gözlem, yoksa unsupported |
| Privacy | `reminderPrivacyStatusP` | her koşulda yerel/redacted koruma etiketi; raw body asla |
| Cihaz (device acceptance / S5) | `reminderDeviceAcceptanceStatusP` | her durumda pending; ajan bu kanıtı üretemez |

Ek olarak `reminderStatusCardHTMLP` bu beş boyutu tek kartta render eder ve
`render()` içinde `coverageRibbonHTMLP`'den hemen sonra çağrılır.

## Görev 2 — accepted, stale, pending, missing, projection_invalid, error, unsupported, redacted tonları deterministic map

Yeni `reminderStatusToneMapP()` 8 tonu tek kaynaktan eşler:

| Ton | `kind` | `tone` | `cls` | `icon` |
|---|---|---|---|---|
| accepted | ok | ok | b-ok | ✓ |
| stale | warning | warning | b-warn | △ |
| pending | pending | pending | b-warn | ◷ |
| missing | muted | muted | b-dim | · |
| projection_invalid | danger | danger | b-danger | ! |
| error | danger | danger | b-danger | ! |
| unsupported | muted | muted | b-dim | · |
| redacted | ok | ok | b-ok | ⌑ |

`code` (semantik 8 ton) ile `tone` (görsel 5 ton) bilinçli olarak ayrıdır;
bilinmeyen kod fail-closed olarak muted "Durum bekleniyor"a düşer.

## Görev 3 — Status color tek anlam kaynağı değil; text + icon + source time + privacy label birlikte

Karttaki her boyut hücresi yalnız renk değil; badge metni (`label`), `icon`,
`source time` (kaynak/panel saati veya kabul saati) ve `privacy label` (yerel)
ile birlikte gösterilir. `p3TimeP`/`tsShort` kaynak zamanını, privacy hücresi
"yerel" etiketini taşır.

## Görev 4 — "Reminder çalışıyor" iddiası yalnız source + receipt + projection evidence varsa

`reminderWorkingClaimP()` üç kanıtı birlikte arar:
`source.tone==='accepted' && receipt.tone==='accepted' && capability.code==='redacted'`.
Üçü birlikteyse `ok:true`; aksi hâlde `reason` ile hangi kanıtın eksik olduğu
(`kaynak_kanit_yok` / `receipt_kanit_yok` / `capability_kanit_yok`) açıkça
yazılır ve pending claim render edilir.

## Görev 5 — Status card raw reminder category, schedule veya body taşımaz

- `reminderStatusCardHTMLP` hiçbir reminder category / schedule / body render
  etmez; privacy boyutu yalnız güvenli "yerel · redacted" özetidir.
- Kaynak scanning ile token sentinel'leri (`ghp_`, `github_pat_`, `Bearer `,
  `Authorization`, `PTOKEN`) ve yazma yolları (`localStorage.setItem`,
  `SeySync.schedule`, PUT) yokluğu doğrulanır.

## Doğrulama

```
node tests/reminders/test_reminder_panel_status.js → PASS (14 case / 223 assertion)
node tests/test_panel_staleness_badge.js            → PASS (7 assertion)
node tests/test_panel_p6_qa_release.js              → PASS (16 assertion)
node --check panel.js                               → PASS
git diff --check                                    → PASS
```

**Regression:** tüm reminder suite PASS, tüm panel root suite PASS, tüm Panel-v2
suite PASS, `node --check sync.js` PASS, `verify-reminder-context.mjs` PASS
(73 prompt, 66 link, approval=not_approved).

## Kabul

- Status map 8 tonla exhaustive ve fail-closed (bilinmeyen kod muted).
- Source / time / privacy / capability birbirinden ayrılmış durum alanlarıdır.
- Status color tek anlam kaynağı değildir (text + icon + time + privacy birlikte).
- "Reminder çalışıyor" iddiası yalnız source + receipt + capability birlikteyse.
- Status card hiçbir raw reminder category / schedule / body taşımaz.
- PANEL-02 provenance gap kapanır; REM-61 ready.

## Notlar / discrepancy

- `code` (8 ton) ile `tone` (görsel 5 ton) ayrımı bilinçlidir; capability
  unsupported → muted, redacted → ok görsel tonuna eşlenir.
- Cihaz (S5) kabulü ajan tarafından üretilemez; her durumda pending kalır ve
  başarı iddiası taşımaz (STATE.deviceAcceptance ile tutarlı).
- REM-61 (dashboard card / no-op) ayrı gate'tir; bu prompt yalnız status /
  provenance ayrımını kapsar.

## Standing after_each_prompt teslimat makbuzu

- **Remote equality:** `49e66de..f2d749d` fast-forward; local HEAD,
  `origin/main` ve `git ls-remote refs/heads/main` hepsi `f2d749d`. Bu push
  REM-58 (`63ccfb8`/`6261f63`), REM-59 (`2fb1068`/`00e9340`/`14b8c0d`) ve REM-60
  (`a35c16f`/`f2d749d`) kapanışlarını birlikte taşıdı.
- **Deployment:** workflow `32249456512` success (head `f2d749d`).
- **Live HTTP receipt:** `https://mustafaras.github.io/s/panel.html` HTTP 200;
  `panel.js?v=20260818c` ve `panel.css?v=20260809c` HTTP 200. `panel.html`
  cache-bust bu promptta değiştirilmedi (allowlist dışı); REM-58/59/60 panel içi
  promptlarında tutarlı no-bump deseni izlendi.
- **Cihaz kabulü (S5):** kullanıcı cihazı doğrulaması yapılmadı; `pending`.
