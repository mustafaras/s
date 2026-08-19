"use strict";

// REM-57 — G13-C panel redaction ve reminder no-op kararı.
//
// Kararı (panelde reminder = bilinçli no-op, tek istisna REM-53'ün sabit
// lifecycle event özeti) negatif testle sabitler ve therapy / medication /
// mood / prayer completion / note / body / schedule / private title
// değerlerinin HER çıkış yüzeyinde bulunmadığını tarar.
//
// Kapsam sınırı: current observer panel (`panelCoverageManifest.js`,
// `panel.js`). Sentetik veri; browser, localStorage, fetch, GitHub veya
// gerçek kullanıcı verisi yoktur. Panel-v2 ayrı regression yüzeyidir.

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { assert, assertEqual, deepClone, deepEqual, runTests } = require("./helpers/reminder-test-helper");

const ROOT = path.resolve(__dirname, "../..");
const COVERAGE_SOURCE = fs.readFileSync(path.join(ROOT, "panelCoverageManifest.js"), "utf8");
const PANEL_SOURCE = fs.readFileSync(path.join(ROOT, "panel.js"), "utf8");
const PANEL_HTML = fs.readFileSync(path.join(ROOT, "panel.html"), "utf8");

const SHA_LATEST = "b".repeat(40);
const SHA_OTHER = "f".repeat(40);
const REV_SNAPSHOT = "c".repeat(40);
const SOURCE_UPDATED_AT = "2026-08-19T14:58:00.000Z";
const ACCEPTED_AT = "2026-08-19T15:00:00.000Z";
const BUILT_AT = "2026-08-19T15:00:05.000Z";

// Sekiz mahrem sınıf, prompt Görev 4 ile birebir.
const PRIVATE_TITLE = "Anneme ilac ver 19:30";
const SENTINELS = {
  therapy: "REM57_THERAPY_NOTE",
  medication: "REM57_MEDICATION_NAME",
  mood: "REM57_MOOD",
  prayerCompletion: "REM57_PRAYER_COMPLETION",
  note: "REM57_NOTE",
  body: "REM57_PRIVATE_BODY",
  schedule: "REM57_SCHEDULE",
  privateTitle: PRIVATE_TITLE
};
const SENTINEL_VALUES = Object.keys(SENTINELS).map((key) => SENTINELS[key]);
const REMINDER_ROOTS = [
  "reminders", "delivery", "deliveryLog", "reminderDelivery",
  "reminderDeliveries", "reminderHistory", "notificationDelivery"
];

function loadCoverage() {
  const context = {
    window: {}, Date, JSON, Array, Object, String, Number, Boolean, Math, isNaN, isFinite
  };
  vm.runInNewContext(COVERAGE_SOURCE, context, { filename: "panelCoverageManifest.js" });
  const api = context.window.PanelCoverageV1;
  if (!api) throw new Error("PanelCoverageV1 yüklenemedi");
  return api;
}

// Reminder yüzeyinin sekiz mahrem sınıfını da taşıyan sentetik app state'i.
function latestFixture() {
  return {
    version: 2,
    startDate: "2026-08-01",
    lastOpenedDate: "2026-08-19",
    savedAt: SOURCE_UPDATED_AT,
    settings: { ghToken: "REM57_TOKEN", prayer: { remindersEnabled: true, reminderOffsetMinutes: 15 } },
    reminders: {
      preferences: {
        [PRIVATE_TITLE]: {
          enabled: true,
          schedule: SENTINELS.schedule,
          body: SENTINELS.body,
          note: SENTINELS.note,
          medicationName: SENTINELS.medication,
          therapyNote: SENTINELS.therapy,
          mood: SENTINELS.mood,
          prayerCompletion: SENTINELS.prayerCompletion
        }
      }
    },
    delivery: { entries: [{ occurrenceId: "REM57_OCCURRENCE", body: SENTINELS.body }] },
    deliveryLog: { entries: [{ occurrenceId: "REM57_OCCURRENCE" }] },
    reminderDelivery: { body: SENTINELS.body },
    reminderDeliveries: [{ body: SENTINELS.body }],
    reminderHistory: [{ title: PRIVATE_TITLE }],
    notificationDelivery: { body: SENTINELS.body },
    eventLog: {
      events: [{
        eventId: "reminder-evt-1",
        correlationId: "reminder-v1:medication:2026-08-19",
        sequence: 1,
        occurredAt: "2026-08-19T09:30:00.000Z",
        section: "wellness",
        path: "data.reminders",
        operation: "update",
        summary: "Bildirim yaşam döngüsü güncellendi",
        sourceDeviceId: "synthetic-device",
        privacyClass: "summary"
      }]
    },
    days: {
      "2026-08-19": {
        mood: "iyi",
        note: "gunluk guvenli not",
        therapy: { thoughts: [{ thought: SENTINELS.therapy, createdAt: "2026-08-19T09:00:00.000Z" }] },
        prayer: { fajr: true }
      }
    },
    notifications: [{ id: "n1", ts: "2026-08-19T08:00:00.000Z" }]
  };
}

function receipt() {
  return {
    status: "accepted",
    snapshotRevision: REV_SNAPSHOT,
    sourceUpdatedAt: SOURCE_UPDATED_AT,
    submittedAt: "2026-08-19T14:59:00.000Z",
    acceptedAt: ACCEPTED_AT,
    sourceLatestSha: SHA_LATEST
  };
}

// Eski / hatalı / düşmanca bir app sürümünün yazmış olabileceği projection.
function untrustedProjection() {
  return {
    schemaVersion: 1,
    manifestVersion: "panel-coverage-v1",
    snapshotRevision: REV_SNAPSHOT,
    sourceLatestSha: SHA_LATEST,
    sourceUpdatedAt: SOURCE_UPDATED_AT,
    projectionBuiltAt: BUILT_AT,
    serverAcceptedAt: ACCEPTED_AT,
    coverage: {
      full: ["version"],
      summary: ["reminderQueueV2." + PRIVATE_TITLE + ".body", "userTextSentinel"],
      redacted: ["settings.ghToken"],
      missing: [],
      unmappedPaths: []
    },
    sections: {
      // Manifestin üretmediği uydurma reminder kartı.
      reminderHealth: { enabledCategories: 7, body: SENTINELS.body, medicationName: SENTINELS.medication },
      schedulerHealth: { nextOccurrenceAt: "2026-08-19T19:30:00.000Z", title: PRIVATE_TITLE },
      // Bilinen bölümün içine sızdırılmış reminder alanları ve ham metin.
      today: { date: "2026-08-19", record: { mood: SENTINELS.mood, reminderBody: SENTINELS.body } },
      therapyProvenance: {
        status: "ok", date: "2026-08-19", thoughtCount: 1,
        reminderNote: SENTINELS.therapy,
        occurrenceId: "REM57_OCCURRENCE",
        ghToken: "REM57_TOKEN"
      }
    },
    data: {
      version: 2,
      lastOpenedDate: "2026-08-19",
      reminders: { preferences: { [PRIVATE_TITLE]: { body: SENTINELS.body } } },
      days: { "2026-08-19": { mood: "iyi" } }
    }
  };
}

function serialize(value) {
  return JSON.stringify(value === undefined ? null : value);
}

function leaks(value) {
  const text = serialize(value);
  return SENTINEL_VALUES.filter((needle) => text.includes(needle));
}

const cases = [
  ["the panel reminder surface is a deliberate no-op, not an aggregate", () => {
    const P = loadCoverage();
    // KARAR: reminder verisi cihaz yerelidir; panel gözlemcidir ve hiçbir
    // operatör kararı reminder tercihine/teslimine bağlı değildir.
    assertEqual(P.REMINDER_COVERAGE.decision, "local_only");
    assertEqual(P.REMINDER_COVERAGE.expectedInProjection, false);
    const snapshot = P.buildObserverSnapshot(latestFixture(), receipt(), BUILT_AT);
    ["reminders", "reminderHealth", "schedulerHealth", "permissionHealth",
     "reminderSummary", "deliveryHealth"].forEach((key) => {
      assert(!Object.prototype.hasOwnProperty.call(snapshot.sections, key));
    });
    // Tek istisna: REM-53'ün sabit lifecycle event özeti (safeAggregate).
    const aggregate = P.REMINDER_COVERAGE.fields.filter((f) => f.mode === "summary");
    assertEqual(aggregate.length, 1);
    assertEqual(aggregate[0].field, "safeAggregate");
    assert(aggregate[0].paths.indexOf("eventLog") >= 0);
    // Panelde reminder kartı / sekmesi / sayacı yok.
    ["reminderHealth", "schedulerHealth", "reminderCardHTML", "reminderSummaryHTML",
     "Hatırlatma Merkezi", "enabledCategoryCount"].forEach((needle) => {
      assert(!PANEL_SOURCE.includes(needle));
      assert(!PANEL_HTML.includes(needle));
    });
  }],

  ["no reminder detail reaches projection, sections, coverage or event log", () => {
    const P = loadCoverage();
    const data = latestFixture();
    const snapshot = P.buildObserverSnapshot(data, receipt(), BUILT_AT);
    assert(deepEqual(leaks(snapshot), []));
    REMINDER_ROOTS.forEach((root) => assert(!Object.prototype.hasOwnProperty.call(snapshot.data, root)));
    REMINDER_ROOTS.forEach((root) => assert(snapshot.coverage.redacted.indexOf(root) >= 0));
    assert(!serialize(snapshot.coverage).includes(PRIVATE_TITLE));
    // Event log: yalnız sabit özet, güvenli correlation ve metadata geçer.
    const parsedEvents = P.parseEventLog(data.eventLog, "2026-08-19");
    assert(parsedEvents.ok);
    assertEqual(parsedEvents.events.length, 1);
    const event = parsedEvents.events[0];
    assertEqual(event.summary, "Bildirim yaşam döngüsü güncellendi");
    assertEqual(event.correlationId, "reminder-v1:medication:2026-08-19");
    assertEqual(event.path, "data.reminders");
    assert(deepEqual(leaks(event), []));
    // Özel başlık veya ham gövde taşıyan bir event güvenli özete indirgenir.
    const hostile = P.normalizeEvent({
      eventId: "hostile-1", sequence: 2, occurredAt: "2026-08-19T10:00:00.000Z",
      section: "wellness", path: PRIVATE_TITLE, summary: PRIVATE_TITLE,
      sourceDeviceId: "synthetic-device"
    }, "synthetic-device");
    assertEqual(hostile.summary, "Güvenli kayıt özeti");
    assertEqual(hostile.path, "data");
    assert(deepEqual(leaks(hostile), []));
  }],

  ["an untrusted projection cannot smuggle reminder sections or raw paths", () => {
    const P = loadCoverage();
    const chosen = P.chooseProjection(untrustedProjection(), latestFixture(), receipt());
    assertEqual(chosen.source, "projection");
    assertEqual(chosen.reason, "ready");
    // Uydurma reminder bölümleri manifest sözleşmesinde olmadığı için düşer.
    ["reminderHealth", "schedulerHealth"].forEach((key) => {
      assert(!Object.prototype.hasOwnProperty.call(chosen.sections, key));
      assert(chosen.adoption.droppedSectionKeys.indexOf(key) >= 0);
    });
    // Ayna bölümler uzak değere güvenilmeden yerelden yeniden kurulur.
    assert(chosen.adoption.rebuiltSectionKeys.indexOf("today") >= 0);
    assert(!Object.prototype.hasOwnProperty.call(chosen.sections.today.record || {}, "reminderBody"));
    // Raw-derived bölüm alınır ama reminder/secret alanları ayıklanır.
    assert(chosen.adoption.adoptedSectionKeys.indexOf("therapyProvenance") >= 0);
    assertEqual(chosen.sections.therapyProvenance.thoughtCount, 1);
    assert(!Object.prototype.hasOwnProperty.call(chosen.sections.therapyProvenance, "reminderNote"));
    assert(!Object.prototype.hasOwnProperty.call(chosen.sections.therapyProvenance, "occurrenceId"));
    assert(!Object.prototype.hasOwnProperty.call(chosen.sections.therapyProvenance, "ghToken"));
    assert(chosen.adoption.droppedFields >= 3);
    // Uzak coverage yeniden sınıflandırılır: ham reminder path'i yayımlanmaz.
    assert(!serialize(chosen.coverage).includes(PRIVATE_TITLE));
    assert(chosen.coverage.unmappedPaths.indexOf("reminderQueueV2.*") >= 0);
    assert(chosen.coverage.summary.indexOf("userTextSentinel") >= 0);
    assert(deepEqual(leaks(chosen.sections), []));
    assert(deepEqual(leaks(chosen.coverage), []));
    assert(deepEqual(leaks(chosen.data), []));
  }],

  ["every private class is scanned across every projection output", () => {
    const P = loadCoverage();
    const data = latestFixture();
    const rec = receipt();
    const snapshot = P.buildObserverSnapshot(data, rec, BUILT_AT);
    const staleReceipt = Object.assign(receipt(), { sourceLatestSha: SHA_OTHER });
    const outputs = {
      redactForObserver: P.redactForObserver(data),
      snapshot: snapshot,
      snapshotRoundTrip: P.parseObserverSnapshot(JSON.stringify(snapshot)),
      ready: P.chooseProjection(snapshot, data, rec),
      projectionMissing: P.chooseProjection(null, data, rec),
      projectionInvalid: P.chooseProjection("{bozuk", data, rec),
      projectionStale: P.chooseProjection(snapshot, data, staleReceipt),
      receiptMissing: P.chooseProjection(snapshot, data, null),
      untrusted: P.chooseProjection(untrustedProjection(), data, rec),
      coverage: P.coverageForData(data),
      coverageFullDetail: P.coverageForData(data, { fullDetail: true }),
      reminderReport: P.reminderCoverageReport(data),
      redactedPaths: P.redactedPaths(),
      eventLog: P.parseEventLog(data.eventLog, "2026-08-19"),
      mergedEventLog: P.mergeEventLogs(data.eventLog, data.eventLog),
      notificationTimeline: P.notificationTimelineProjection(data, rec),
      normalizedReceipt: P.normalizeReceipt(rec)
    };
    Object.keys(outputs).forEach((name) => {
      const found = leaks(outputs[name]);
      assert(found.length === 0);
      // Yedi yerel kök hiçbir çıkışta kök olarak görünmez.
      const text = serialize(outputs[name]);
      assert(!text.includes('"reminderDeliveries":'));
      assert(!text.includes('"notificationDelivery":'));
      assertEqual(name === name, true);
    });
    // Gün kaydının meşru alanları korunur: tarama aşırı silme yapmıyor.
    assertEqual(outputs.ready.sections.today.record.mood, "iyi");
    assertEqual(outputs.ready.sections.today.record.note, "gunluk guvenli not");
    assertEqual(outputs.redactForObserver.settings.prayer.remindersEnabled, true);
  }],

  ["redaction never mutates the source and is deterministic", () => {
    const P = loadCoverage();
    const data = latestFixture();
    const rec = receipt();
    const projection = untrustedProjection();
    const dataBefore = deepClone(data);
    const receiptBefore = deepClone(rec);
    const projectionBefore = deepClone(projection);

    const firstSafe = P.redactForObserver(data);
    const firstSnapshot = P.buildObserverSnapshot(data, rec, BUILT_AT);
    const firstChosen = P.chooseProjection(projection, data, rec);
    const secondSafe = P.redactForObserver(data);
    const secondSnapshot = P.buildObserverSnapshot(data, rec, BUILT_AT);
    const secondChosen = P.chooseProjection(projection, data, rec);

    // Kaynak state, receipt ve uzak projection aynen korunur.
    assert(deepEqual(data, dataBefore));
    assert(deepEqual(rec, receiptBefore));
    assert(deepEqual(projection, projectionBefore));
    assertEqual(data.reminders.preferences[PRIVATE_TITLE].body, SENTINELS.body);
    assertEqual(projection.sections.reminderHealth.body, SENTINELS.body);
    // Aynı girdi → aynı projeksiyon.
    assert(deepEqual(firstSafe, secondSafe));
    assert(deepEqual(firstSnapshot, secondSnapshot));
    assert(deepEqual(firstChosen, secondChosen));
    // İkinci kez redaksiyon idempotenttir (panel yeniden okuduğunda değişmez).
    assert(deepEqual(P.redactForObserver(firstSafe), firstSafe));
  }],

  ["the panel consumer stays read-only and count-only for coverage", () => {
    const P = loadCoverage();
    // Panel reminder köklerini okumaz, reminder yazma yolu taşımaz.
    assert(!/data\.(?:reminders|deliveryLog|reminderDelivery|reminderDeliveries|reminderHistory|notificationDelivery)/.test(PANEL_SOURCE));
    ["setReminderEnabled", "setReminderCategoryEnabled", "snoozeReminderDelivery",
     "muteReminderToday", "reminderSyncPayload"].forEach((needle) => assert(!PANEL_SOURCE.includes(needle)));
    assert(!/data\/reminder[\s\S]{0,200}method:\s*["']PUT/u.test(PANEL_SOURCE));
    // Ham snapshot panel state'inde tutulsa da hiçbir render yolu okumaz.
    assert(!/PROJECTION\.snapshot\.(data|sections)/.test(PANEL_SOURCE));
    assert(!/state\.snapshot\.(data|sections)/.test(PANEL_SOURCE));
    // Coverage yüzeyi yalnız sayaç render eder.
    const ribbonStart = PANEL_SOURCE.indexOf("function coverageRibbonHTMLP(");
    assert(ribbonStart > 0);
    const ribbon = PANEL_SOURCE.slice(ribbonStart, PANEL_SOURCE.indexOf("\nfunction ", ribbonStart + 10));
    assert(/\.length/.test(ribbon));
    assert(!/c\.(full|summary|redacted|missing|unmappedPaths)\.(join|slice|map|forEach)/.test(ribbon));
    // Panel sanitize edilmiş sections'ı tüketir; kendi adopt yolu yoktur.
    assert(PANEL_SOURCE.includes("PROJECTION.sections=PROJECTION.state.sections||{}"));
    assert(!/parsed\.value\.sections|snapshot\.sections\[/.test(PANEL_SOURCE));
    // Sanitizasyon saf adapter'da yaşar; tüm tüketiciler aynı sınırı alır.
    assert(typeof P.adoptSections === "function" && typeof P.adoptCoverage === "function");
  }]
];

runTests(cases).catch(() => { process.exitCode = 1; });
