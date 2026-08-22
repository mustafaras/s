"use strict";

// REM-56 — G13-B panel coverage manifest ve reminder schema classification.
//
// Her reminder alan sınıfının TEK bir coverage mode'u (full / summary /
// redacted / missing / unmapped) olduğunu, bilinmeyen reminder alanlarının
// fail-closed kaldığını ve coverage özetinin ne reminder detayı ne de ham
// path sızdırdığını sabitler.
//
// Kapsam sınırı: current observer panel adapter'ı (`panelCoverageManifest.js`).
// Sentetik veri; browser, localStorage, fetch, GitHub veya gerçek kullanıcı
// verisi yoktur. Panel-v2 ayrı bir regression yüzeyidir.

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { assert, assertEqual, deepClone, deepEqual, runTests } = require("./helpers/reminder-test-helper");

const ROOT = path.resolve(__dirname, "../..");
const COVERAGE_SOURCE = fs.readFileSync(path.join(ROOT, "panel/panelCoverageManifest.js"), "utf8");
const PANEL_SOURCE = fs.readFileSync(path.join(ROOT, "panel/panel.js"), "utf8");

const SHA_LATEST = "b".repeat(40);
const REV_SNAPSHOT = "c".repeat(40);
const ACCEPTED_AT = "2026-08-19T15:00:00.000Z";
const SOURCE_UPDATED_AT = "2026-08-19T14:58:00.000Z";
const BUILT_AT = "2026-08-19T15:00:05.000Z";

// Kullanıcı hatırlatmasını kendi kelimeleriyle adlandırabilir; bu yüzden
// "path" da tıpkı değer gibi mahrem içerik olabilir.
const PRIVATE_TITLE = "Anneme ilac ver 19:30";
const SENTINELS = [
  "REM56_PRIVATE_BODY", "REM56_MEDICATION_NAME", "REM56_DOSE", "REM56_THERAPY_NOTE",
  "REM56_JOURNAL", "REM56_MOOD", "REM56_PRAYER_COMPLETION", "REM56_OCCURRENCE_ID",
  "REM56_SCHEDULE", "REM56_TOKEN", PRIVATE_TITLE
];

const ALL_MODES = ["full", "summary", "redacted", "missing", "unmapped"];
const COVERAGE_BUCKETS = ["full", "summary", "redacted", "missing", "unmappedPaths"];
const DECLARED_REMINDER_ROOTS = [
  "reminders", "delivery", "deliveryLog", "reminderDelivery",
  "reminderDeliveries", "reminderHistory", "notificationDelivery"
];

function loadCoverage() {
  const context = {
    window: {}, Date, JSON, Array, Object, String, Number, Boolean, Math, isNaN, isFinite
  };
  vm.runInNewContext(COVERAGE_SOURCE, context, { filename: "panel/panelCoverageManifest.js" });
  const api = context.window.PanelCoverageV1;
  if (!api) throw new Error("PanelCoverageV1 yüklenemedi");
  return api;
}

// Yalnız bilinen (deklare edilmiş) reminder köklerini taşıyan sentetik state.
function declaredFixture() {
  return {
    version: 2,
    startDate: "2026-08-01",
    lastOpenedDate: "2026-08-19",
    savedAt: SOURCE_UPDATED_AT,
    settings: {
      ghToken: "REM56_TOKEN",
      prayer: { method: "diyanet", remindersEnabled: true, reminderOffsetMinutes: 15 }
    },
    reminders: {
      preferences: {
        [PRIVATE_TITLE]: {
          enabled: true,
          schedule: "REM56_SCHEDULE",
          body: "REM56_PRIVATE_BODY",
          medicationName: "REM56_MEDICATION_NAME",
          dose: "REM56_DOSE",
          therapyNote: "REM56_THERAPY_NOTE",
          journal: "REM56_JOURNAL",
          mood: "REM56_MOOD",
          prayerCompletion: "REM56_PRAYER_COMPLETION"
        }
      },
      policy: { quietHours: { start: "22:30", end: "07:30" } }
    },
    delivery: { entries: [{ occurrenceId: "REM56_OCCURRENCE_ID", body: "REM56_PRIVATE_BODY" }] },
    deliveryLog: { entries: [{ occurrenceId: "REM56_OCCURRENCE_ID" }] },
    reminderDelivery: { occurrenceId: "REM56_OCCURRENCE_ID" },
    reminderDeliveries: [{ occurrenceId: "REM56_OCCURRENCE_ID" }],
    reminderHistory: [{ occurrenceId: "REM56_OCCURRENCE_ID" }],
    notificationDelivery: { body: "REM56_PRIVATE_BODY" },
    eventLog: { events: [{ eventId: "e-1", correlationId: "reminder-v1:medication", sequence: 1 }] },
    days: { "2026-08-19": { mood: "iyi", note: "guvenli not", journal: { wordCount: 42 } } },
    notifications: [{ id: "n1", kind: "observer" }],
    locNudge: { shownCount: 2, snoozeUntil: "2026-08-19T10:00:00.000Z" }
  };
}

// Gelecekteki bir app sürümünün ekleyebileceği, manifestte KARARI OLMAYAN
// reminder alanları. Hepsi fail-closed kalmalıdır.
function unknownFixture() {
  const data = declaredFixture();
  data.reminderQueueV2 = { [PRIVATE_TITLE]: { body: "REM56_PRIVATE_BODY", dose: "REM56_DOSE" } };
  data.remindersV2 = { preferences: { therapyNote: "REM56_THERAPY_NOTE" } };
  data.catchUpQueue = { entries: [{ body: "REM56_PRIVATE_BODY" }] };
  data.quietHoursV2 = { start: "23:00" };
  // ÆON sosyal bildirim dizisi full-detail allowlist'inde; bir reminder alanı
  // oraya düşerse bile `full` olmamalıdır.
  data.notifications.push({ id: "n2", reminderBody: "REM56_PRIVATE_BODY", reminderId: "r-1" });
  data.days["2026-08-19"].reminderCompletion = { prayerCompletion: "REM56_PRAYER_COMPLETION" };
  return data;
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

function serialize(value) {
  return JSON.stringify(value === undefined ? null : value);
}

function leaks(value) {
  const text = serialize(value);
  return SENTINELS.filter((needle) => text.includes(needle));
}

const cases = [
  ["the manifest declares one coverage mode per reminder field class", () => {
    const P = loadCoverage();
    const contract = P.REMINDER_COVERAGE;
    assert(!!contract);
    assertEqual(contract.contractVersion, "panel-reminder-coverage-v1");
    assertEqual(contract.schemaVersion, 1);
    assertEqual(contract.projectionSchemaVersion, 1);
    assertEqual(contract.manifestVersion, P.MANIFEST.manifestVersion);
    assertEqual(contract.decision, "local_only");
    assertEqual(contract.defaultMode, "unmapped");
    assert(deepEqual(contract.modes, ALL_MODES));

    // Prompt'un istediği 12 alan sınıfı; her biri TEK mode taşır.
    const expected = [
      "preference", "occurrence", "delivery", "category", "safeAggregate",
      "privateDetail", "therapy", "medication", "journal", "mood",
      "prayerCompletion", "token"
    ];
    assert(deepEqual(contract.fields.map((f) => f.field), expected));
    const seen = Object.create(null);
    contract.fields.forEach((entry) => {
      assert(typeof entry.mode === "string" && ALL_MODES.indexOf(entry.mode) >= 0);
      assert(Array.isArray(entry.paths) && entry.paths.length > 0);
      assert(typeof entry.why === "string" && entry.why.length > 0);
      assert(!seen[entry.field]);
      seen[entry.field] = entry.mode;
    });
    // Sync sınırını geçen tek reminder yüzeyi sabit lifecycle özetidir.
    assertEqual(seen.safeAggregate, "summary");
    ["preference", "occurrence", "delivery", "category", "privateDetail",
     "therapy", "medication", "journal", "mood", "prayerCompletion", "token"]
      .forEach((field) => assertEqual(seen[field], "redacted"));

    // Reminder kökleri bilinçli olarak expectedPaths'te DEĞİLDİR: cihaz yerel
    // sözleşmesinde yokluk sağlıklı durumdur, eksiklik değil.
    assertEqual(contract.expectedInProjection, false);
    DECLARED_REMINDER_ROOTS.forEach((root) => assert(P.MANIFEST.expectedPaths.indexOf(root) < 0));
    // Catch-all kural listenin sonunda kalmalı; yoksa fail-closed sırası bozulur.
    assertEqual(P.MANIFEST.paths[P.MANIFEST.paths.length - 1].path, "*");
  }],

  ["declared reminder paths resolve to exactly their declared mode", () => {
    const P = loadCoverage();
    const report = P.reminderCoverageReport(declaredFixture());
    assert(report.ok);
    assert(deepEqual(report.violations, []));
    assertEqual(report.contractVersion, "panel-reminder-coverage-v1");
    assertEqual(report.decision, "local_only");
    report.fields.forEach((field) => {
      assertEqual(field.resolvedModes.length, 1);
      assertEqual(field.resolvedModes[0], field.declaredMode);
      assert(ALL_MODES.indexOf(field.effectiveMode) >= 0);
    });
    // Yedi bilinen kök redacted; hiçbiri summary/full değil.
    DECLARED_REMINDER_ROOTS.forEach((root) => {
      const info = P.classifyPath(root);
      assertEqual(info.mode, "redacted");
      assert(info.mapped);
      assert(info.reminder);
      assert(info.withheld);
    });
    const coverage = P.coverageForData(declaredFixture());
    DECLARED_REMINDER_ROOTS.forEach((root) => assert(coverage.redacted.indexOf(root) >= 0));
  }],

  ["missing is a real mode: absent reminder roots report missing, not full", () => {
    const P = loadCoverage();
    const empty = { version: 2, days: {}, settings: {} };
    const report = P.reminderCoverageReport(empty);
    assert(report.ok);
    ["preference", "occurrence", "delivery", "category", "privateDetail",
     "therapy", "medication", "journal", "mood", "prayerCompletion"]
      .forEach((name) => {
        const field = report.fields.filter((f) => f.field === name)[0];
        assertEqual(field.effectiveMode, "missing");
        assertEqual(field.presentPathCount, 0);
        // Deklare edilen mode değişmez; yalnız etkin durum "missing" olur.
        assertEqual(field.declaredMode, "redacted");
      });
    assertEqual(report.modeCounts.missing >= 10, true);
    assertEqual(report.unmappedCount, 0);
  }],

  ["unknown reminder fields stay unmapped and fail closed", () => {
    const P = loadCoverage();
    const data = unknownFixture();
    ["reminderQueueV2", "remindersV2", "catchUpQueue", "quietHoursV2"].forEach((root) => {
      const info = P.classifyPath(root);
      assertEqual(info.mode, "unmapped");
      assertEqual(info.mapped, false);
      assertEqual(info.rule, null);
      assert(info.reminder);
      assert(info.withheld);
    });
    const coverage = P.coverageForData(data);
    ["reminderQueueV2", "remindersV2", "catchUpQueue", "quietHoursV2"]
      .forEach((root) => assert(coverage.unmappedPaths.indexOf(root) >= 0));
    // Bilinmeyen alan asla full veya summary listesine düşmez.
    ["full", "summary"].forEach((bucket) => {
      coverage[bucket].forEach((entry) => {
        assert(!/^(reminderQueueV2|remindersV2|catchUpQueue|quietHoursV2)/.test(entry));
      });
    });
    // Ve projeksiyon çıktısında hiç yer almaz.
    const safe = P.redactForObserver(data);
    ["reminderQueueV2", "remindersV2", "catchUpQueue", "quietHoursV2"]
      .forEach((root) => assert(!Object.prototype.hasOwnProperty.call(safe, root)));
    assert(deepEqual(leaks(safe), []));
    const snapshot = P.buildObserverSnapshot(data, receipt(), BUILT_AT);
    assert(deepEqual(leaks(snapshot), []));
    const chosen = P.chooseProjection(snapshot, data, receipt());
    assertEqual(chosen.source, "projection");
    assert(deepEqual(leaks(chosen.data), []));
    assert(deepEqual(leaks(chosen.sections), []));
  }],

  ["the full-detail allowlist cannot promote a reminder field to full", () => {
    const P = loadCoverage();
    const data = unknownFixture();
    // `notifications` full-detail allowlist'indedir; içine düşen reminder
    // alanı yine de unmapped kalır (fail-closed, allowlist'ten ÖNCE gelir).
    assertEqual(P.classifyPath("notifications", { fullDetail: true }).mode, "full");
    assertEqual(P.classifyPath("notifications.1.reminderBody", { fullDetail: true }).mode, "unmapped");
    assertEqual(P.classifyPath("notifications.1.reminderId", { fullDetail: true }).mode, "unmapped");
    assertEqual(P.classifyPath("days.2026-08-19.reminderCompletion", { fullDetail: true }).mode, "unmapped");
    const coverage = P.coverageForData(data, { fullDetail: true });
    coverage.full.forEach((entry) => assert(!/reminder|occurrence|quietHours|catchUp/i.test(entry)));
    assert(coverage.unmappedPaths.indexOf("notifications.*.reminderBody") >= 0);
    assert(coverage.unmappedPaths.indexOf("days.*.reminderCompletion") >= 0);
    // Panel-v2 aynı adapter'ı fullDetail ile tüketir; ham veri yine çıkmaz.
    const safe = P.redactForObserver(data);
    assertEqual(safe.notifications.length, 2);
    assert(!Object.prototype.hasOwnProperty.call(safe.notifications[1], "reminderBody"));
    assert(!Object.prototype.hasOwnProperty.call(safe.notifications[1], "reminderId"));
    assertEqual(safe.notifications[1].id, "n2");
    assert(!Object.prototype.hasOwnProperty.call(safe.days["2026-08-19"], "reminderCompletion"));
  }],

  ["the coverage summary carries no reminder detail and no raw path", () => {
    const P = loadCoverage();
    const data = unknownFixture();
    const coverage = P.coverageForData(data);
    const serialized = serialize(coverage);
    // Ham path'in kendisi mahrem olabilir: kullanıcı başlığı hiçbir listede yok.
    assert(deepEqual(leaks(coverage), []));
    assert(!serialized.includes(PRIVATE_TITLE));
    assert(!serialized.includes("reminders.preferences"));
    // Bilinen redacted kökler yalnız kök adıyla görünür, çocuk path'siz.
    DECLARED_REMINDER_ROOTS.forEach((root) => {
      coverage.redacted.forEach((entry) => {
        assert(entry === root || entry.indexOf(root + ".") !== 0);
      });
    });
    // Unmapped token'ları maskelidir: yalnız identifier-şekilli segmentler.
    coverage.unmappedPaths.forEach((entry) => {
      entry.split(".").forEach((segment) => {
        assert(segment === "*" || /^[A-Za-z][A-Za-z0-9_]{0,39}$/.test(segment));
      });
    });
    // Tek mode kuralı: bir path aynı anda iki kovada olamaz.
    const seen = Object.create(null);
    COVERAGE_BUCKETS.forEach((bucket) => {
      coverage[bucket].forEach((entry) => {
        assert(!seen[entry]);
        seen[entry] = bucket;
      });
    });
    // Panelin coverage yüzeyi yalnız SAYI gösterir, path listesi değil.
    const ribbon = PANEL_SOURCE.slice(PANEL_SOURCE.indexOf("function coverageRibbonHTMLP("));
    const ribbonBody = ribbon.slice(0, ribbon.indexOf("\nfunction "));
    assert(ribbonBody.includes(".length"));
    assert(!/c\.(full|summary|redacted|missing|unmappedPaths)\.(join|slice|map|forEach)/.test(ribbonBody));
  }],

  ["non-reminder fields keep their existing classification", () => {
    const P = loadCoverage();
    const data = unknownFixture();
    data.userTextSentinel = "siradan guvenli not";
    const coverage = P.coverageForData(data);
    // Bilinmeyen ama reminder OLMAYAN alan eskisi gibi summary kalır.
    assertEqual(P.classifyPath("userTextSentinel").mode, "summary");
    assert(coverage.summary.indexOf("userTextSentinel") >= 0);
    assert(coverage.unmappedPaths.indexOf("userTextSentinel") < 0);
    // Aşırı yakalama regresyonu: konum nudge zamanlaması ve namaz vakti
    // tercihi panelin mevcut meşru sinyalleridir, elenmemelidir.
    assertEqual(P.classifyPath("locNudge.snoozeUntil").mode, "summary");
    assertEqual(P.classifyPath("settings.prayer.remindersEnabled").mode, "summary");
    assertEqual(P.classifyPath("settings.prayer.reminderOffsetMinutes").mode, "summary");
    assertEqual(P.classifyPath("days.2026-08-19.therapy.share.deliveredAt").mode, "summary");
    const safe = P.redactForObserver(data);
    assertEqual(safe.locNudge.snoozeUntil, "2026-08-19T10:00:00.000Z");
    assertEqual(safe.settings.prayer.remindersEnabled, true);
    assertEqual(safe.settings.prayer.reminderOffsetMinutes, 15);
    assertEqual(safe.days["2026-08-19"].mood, "iyi");
  }],

  ["manifest and projection schema versions are validated together", () => {
    const P = loadCoverage();
    const snapshot = P.buildObserverSnapshot(unknownFixture(), receipt(), BUILT_AT);
    assertEqual(snapshot.schemaVersion, 1);
    assertEqual(snapshot.manifestVersion, "panel-coverage-v1");
    assertEqual(snapshot.reminderCoverageVersion, "panel-reminder-coverage-v1");
    assertEqual(snapshot.coverage.unmappedPaths.length > 0, true);
    // Wire sözleşmesi additive: reminderCoverageVersion taşımayan eski bir
    // projection hâlâ parse edilir, panel blank kalmaz.
    const legacyProjection = deepClone(snapshot);
    delete legacyProjection.reminderCoverageVersion;
    const parsed = P.parseObserverSnapshot(JSON.stringify(legacyProjection));
    assert(parsed.ok);
    assertEqual(parsed.value.schemaVersion, 1);
    // Yanlış schema hâlâ reddedilir.
    const wrongSchema = deepClone(snapshot);
    wrongSchema.schemaVersion = 2;
    assertEqual(P.parseObserverSnapshot(JSON.stringify(wrongSchema)).ok, false);
  }],

  ["classification is pure: no mutation and same input gives same output", () => {
    const P = loadCoverage();
    const data = unknownFixture();
    const before = deepClone(data);
    const first = P.coverageForData(data);
    const firstReport = P.reminderCoverageReport(data);
    const firstSafe = P.redactForObserver(data);
    const second = P.coverageForData(data);
    const secondReport = P.reminderCoverageReport(data);
    const secondSafe = P.redactForObserver(data);
    assert(deepEqual(data, before));
    assert(deepEqual(first, second));
    assert(deepEqual(firstReport, secondReport));
    assert(deepEqual(firstSafe, secondSafe));
    // Kaynak state hâlâ tam: adapter gözlemcidir, app state'ini budamaz.
    assertEqual(data.reminders.preferences[PRIVATE_TITLE].body, "REM56_PRIVATE_BODY");
    assertEqual(data.reminderQueueV2[PRIVATE_TITLE].dose, "REM56_DOSE");
  }],

  ["the current panel manifest is not mixed with the Panel-v2 surface", () => {
    const P = loadCoverage();
    // Bu fixture yalnız repo kökündeki current panel adapter'ını yükler.
    assert(fs.existsSync(path.join(ROOT, "panel/panelCoverageManifest.js")));
    assertEqual(P.MANIFEST.manifestVersion, "panel-coverage-v1");
    assert(!COVERAGE_SOURCE.includes("panel-v2"));
    assert(!PANEL_SOURCE.includes("panel-v2"));
    // Panel-v2 ayrı bir tüketicidir ve unmappedPaths token'larını kendi audit
    // DOM'una basar; maskeleme bu yüzden kaynakta yapılır, tüketicide değil.
    const panelV2 = fs.readFileSync(path.join(ROOT, "panel/v2/panel-v2.js"), "utf8");
    assert(panelV2.includes("coverage.unmappedPaths"));
    // Panel-v2'nin ayrı bir coverage manifesti yoktur; aynı saf adapter'ı okur.
    assert(!fs.existsSync(path.join(ROOT, "panelCoverageManifestV2.js")));
    // Current panel reminder köklerini hiç okumaz (REM-26 no-op sınırı).
    assert(!/data\.(?:reminders|deliveryLog|reminderDelivery|reminderDeliveries|reminderHistory|notificationDelivery)/.test(PANEL_SOURCE));
  }]
];

runTests(cases).catch(() => { process.exitCode = 1; });
