# ÆON Panel — Anti-Amnesia Prompt ve Ledger Paketi

Bu klasör panel gözlemlenebilirliği, senkronizasyonu ve tasarım geliştirmesi
için canonical çalışma paketidir.

## Okuma sırası

### Her yeni oturumda zorunlu

1. [`AGENTS.md`](../../AGENTS.md)
2. [`CLAUDE.md`](../../CLAUDE.md)
3. [`GELISTIRME-PLANI.md`](../../GELISTIRME-PLANI.md)
4. [`PANEL-GOZLEMLENEBILIRLIK-VE-SENKRON-PLANI.md`](plans/PANEL-GOZLEMLENEBILIRLIK-VE-SENKRON-PLANI.md)
5. [`PANEL-TASARIM-VE-GELISTIRME-PLANI.md`](plans/PANEL-TASARIM-VE-GELISTIRME-PLANI.md)
6. [`00-PANEL-ANTI-AMNESIA-BASLANGIC-PROMPTU.md`](prompts/00-PANEL-ANTI-AMNESIA-BASLANGIC-PROMPTU.md)
7. [`PANEL-LEDGER-OPERATIONS.md`](ledgers/PANEL-LEDGER-OPERATIONS.md)
8. [`PANEL-LEDGER-STATE.md`](ledgers/PANEL-LEDGER-STATE.md)

Sonra yalnız hedeflenen fazın tek promptu okunur.

Karar kayıtları [`decisions/`](decisions/) altında tutulur; PANEL-008 için
[polling/relay kararı](decisions/PANEL-008-POLLING-RELAY-KARARI.md) ETag,
taslak güvenliği ve relay karar kapısını belgeler.

## Prompt sırası

| Sıra | Prompt | Kapsam | Önkoşul |
|---:|---|---|---|
| 00 | [Anti-amnesia başlangıç](prompts/00-PANEL-ANTI-AMNESIA-BASLANGIC-PROMPTU.md) | Oturum kurtarma, sınırlar, ledger protokolü | Yok |
| 01 | [P0 senkron makbuzu](prompts/01-PANEL-P0-SENKRON-MAKBUZU-PROMPTU.md) | Receipt, revision, lag, conflict | 00 |
| 02 | [P1 coverage/projection](prompts/02-PANEL-P1-COVERAGE-PROJECTION-PROMPTU.md) | Coverage manifest ve güvenli read-model | 01 |
| 03 | [P1 eksik kök modüller](prompts/03-PANEL-P1-EKSIK-KOK-MODULLER-PROMPTU.md) | Photo, room history, Saygı, nudge, root timestamps | 02 |
| 04 | [P1 terapi/bildirim/provenance](prompts/04-PANEL-P1-TERAPI-BILDIRIM-PROVENANS-PROMPTU.md) | Hassas ayrıntı, notification lifecycle, kaynak sınıfları | 02–03 |
| 05 | [P2 event log](prompts/05-PANEL-P2-EVENT-LOG-PROMPTU.md) | Append-only olay günlüğü ve timeline kaynağı | 04 |
| 06 | [P2 polling/relay](prompts/06-PANEL-P2-POLLING-RELAY-KARARI-PROMPTU.md) | ETag/polling veya relay karar kapısı | 05 |
| 07 | [D0 IA/wireframe](prompts/07-PANEL-D0-IA-WIREFRAME-PROMPTU.md) | Bilgi mimarisi ve ekran akışı | 02 |
| 08 | [D1 token/component](prompts/08-PANEL-D1-TOKEN-COMPONENT-PROMPTU.md) | Semantic token ve ortak kart sözleşmesi | 07 |
| 09 | [D2 command center](prompts/09-PANEL-D2-COMMAND-CENTER-PROMPTU.md) | Header, sync ribbon, hero durum | 01, 08 |
| 10 | [D3 timeline/drawer](prompts/10-PANEL-D3-TIMELINE-DRAWER-PROMPTU.md) | Son değişiklikler ve ayrıntı drawer’ı | 05, 08, 09 |
| 11 | [D4 modül kartları](prompts/11-PANEL-D4-MODUL-KARTLARI-PROMPTU.md) | Eksik/özet modüllerin kullanıcı dostu aynası | 03, 04, 10 |
| 12 | [D5 responsive/a11y](prompts/12-PANEL-D5-RESPONSIVE-A11Y-PROMPTU.md) | Mobil, desktop, klavye, contrast, motion | 08–11 |
| 13 | [D6 QA/release gate](prompts/13-PANEL-D6-QA-RELEASE-GATE-PROMPTU.md) | Tam doğrulama ve kullanıcı onayı kapısı | 01–12 |

Tek oturumda birden fazla faz uygulanmaz. Her prompt sonunda durulur; bir
sonraki prompt yalnız kullanıcı açıkça “devam” dediğinde açılır.

## Ledger sözleşmesi

- [Operations ledger](ledgers/PANEL-LEDGER-OPERATIONS.md): yapılan eylem,
  dosya, komut, kanıt ve dış etki kaydı.
- [State ledger](ledgers/PANEL-LEDGER-STATE.md): faz durumu, önkoşul, kabul
  kapısı, blokaj ve sonraki güvenli adım.
- Her iki ledger aynı `PANEL-###` sequence kimliğini taşır.
- Ledger satırları append-only’dir; geçmiş satır değiştirilmez.
- Bir prompt “tamamlandı” sayılmadan iki ledger’da da aynı sequence için
  kanıt bulunmalıdır.
- `planned`, `in_progress`, `blocked`, `ready_for_review`, `completed`
  durumları birbirine karıştırılmaz.

PANEL-009 / Prompt 07 D0 wireframe teslimatı:
[PANEL-D0-IA-WIREFRAME.md](plans/PANEL-D0-IA-WIREFRAME.md).

PANEL-010 / Prompt 08 D1 token/component teslimatı:
[PANEL-D1-TOKEN-COMPONENT.md](plans/PANEL-D1-TOKEN-COMPONENT.md).

PANEL-011 / Prompt 09 D2 command center teslimatı:
[PANEL-D2-COMMAND-CENTER.md](plans/PANEL-D2-COMMAND-CENTER.md).

PANEL-012 / Prompt 10 D3 timeline/drawer teslimatı:
[PANEL-D3-TIMELINE-DRAWER.md](plans/PANEL-D3-TIMELINE-DRAWER.md).

PANEL-013 / Prompt 11 D4 modül kartları teslimatı:
[PANEL-D4-MODUL-KARTLARI.md](plans/PANEL-D4-MODUL-KARTLARI.md).

PANEL-014 / Prompt 12 D5 responsive/a11y/motion teslimatı:
[PANEL-D5-RESPONSIVE-A11Y.md](plans/PANEL-D5-RESPONSIVE-A11Y.md).

PANEL-015 / Prompt 13 D6 QA/release gate teslimatı:
[PANEL-D6-QA-RELEASE-GATE.md](plans/PANEL-D6-QA-RELEASE-GATE.md).

## Şu anki durum

- Prompt paketi: hazır.
- Teknik plan: hazır.
- Tasarım planı: hazır.
- Kod uygulaması: `PANEL-003`–`PANEL-009` / Prompt 01–07 kullanıcı kabulüyle
  `completed`; Prompt 08 / `PANEL-010` review bekliyor, Prompt 09 / `PANEL-011`
  ve Prompt 10–13 / `PANEL-012`–`PANEL-015` kullanıcı kabulü ve release
  makbuzuyla `completed`.
- Commit/push/merge/deploy: PANEL-003 `cf6389c` ile; PANEL-004–006
  `631dd6d` feature commit’iyle, `ba98b74` merge commit’i üzerinden `main`’e
  push edildi. Pages run `30761174707` başarılı. PANEL-007/PANEL-008 teslimatı
  `4599331` feature commit’i ve `564b398` no-ff merge commit’iyle `main`’e
  push edildi; Pages run `30791188610` başarılı, canlı kök URL HTTP 200.
- Clone için canonical ref: `origin/main`; publication receipt ve son ledger
  güncellemeleri de bu ref üzerinde tutulur.
- Kanıt: `test_panel_p0_sync.js` 27/27; `test_panel_p1_projection.js` 35/35;
  `test_panel_p3_root_modules.js` 26/26; `test_panel_p4_provenance.js`
  19/19; `test_panel_p2_event_log.js` 13/13; `test_panel_p2_sync.js` 8/8;
  `test_panel_p2_polling.js` 15/15; mevcut app/sync/panel ve
  migration/headless kapıları da yeşil. PANEL-008 fixture’ı ETag/304,
  `If-None-Match`, p50/p95 (120/190 ms), input skip, taslak defer ve
  değişmeyen snapshot’ta tam rerender yapılmadığını kanıtlıyor.
- Coverage/projection/redaction, root-modül/mismatch/privacy,
  terapi/bildirim/provenance, append-only event log, polling/relay karar
  kapıları, D1 semantic component yüzeyi, D2 command center, D3 timeline /
  drawer, D4 modül atlası ve D5 responsive/a11y/motion pass’i hazır. Prompt
  01–07 kullanıcı kabulüyle tamamlandı; Prompt 08 `ready_for_review`, Prompt
  09–13 / `PANEL-011`–`PANEL-015` tamamlandı. D6 fixture **16/16**, tam
  komut kapısı **22/22 PASS**, ek Kur’an regresyonları **8/8 PASS**. PANEL-015
  feature commit’i `4a81910`, PR #101, `main` merge’i `c63e1de` ve Pages run
  `30813654381` success; canlı panel HTTP **200**.
- Relay açılmadı; `data/`, `data/events/`, localStorage, `seyma-data` ve
  observer write kanalları değişmedi. Rollback: `git revert c63e1de`.
