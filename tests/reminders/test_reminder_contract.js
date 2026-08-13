"use strict";

const {
  ASSERTION_ERROR,
  DEFAULT_TIMEZONE,
  PURE_BOUNDARY_CONTRACT,
  REQUIRED_NETWORK_ERROR,
  assert,
  assertEqual,
  assertRejects,
  assertRequiredFields,
  assertThrows,
  createDeterministicClock,
  createFetchMock,
  createMemoryLocalStorage,
  createNotificationMock,
  createSyntheticEnvironment,
  deepClone,
  deepEqual,
  getMissingFields,
  invokePure,
  runTests
} = require("./helpers/reminder-test-helper.js");

const contractCases = [
  ["deterministic clock keeps a fixed instant", () => {
    const clock = createDeterministicClock("2026-08-13T20:30:00.000Z", DEFAULT_TIMEZONE);
    assertEqual(clock.nowIso(), "2026-08-13T20:30:00.000Z");
    assertEqual(clock.localDate(), "2026-08-13");
    assert(clock.now() instanceof Date);
    clock.advanceMs(2 * 60 * 60 * 1000);
    assertEqual(clock.nowIso(), "2026-08-13T22:30:00.000Z");
    assertEqual(clock.localDate(), "2026-08-14");
  }],
  ["timezone contract is explicit and reproducible", () => {
    const clock = createDeterministicClock("2026-08-13T20:30:00.000Z", "Europe/Istanbul");
    const parts = clock.localParts();
    assertEqual(clock.timezone, "Europe/Istanbul");
    assertEqual(parts.year, "2026");
    assertEqual(parts.month, "08");
    assertEqual(parts.day, "13");
    assertEqual(parts.hour, "23");
  }],
  ["localStorage contract is memory-only", () => {
    const storage = createMemoryLocalStorage({ "seed-key": "seed-value" });
    assertEqual(storage.getItem("seed-key"), "seed-value");
    storage.setItem("contract-key", "contract-value");
    assertEqual(storage.getItem("contract-key"), "contract-value");
    assertEqual(storage.length, 2);
    storage.removeItem("contract-key");
    assertEqual(storage.getItem("contract-key"), null);
    storage.clear();
    assertEqual(storage.length, 0);
  }],
  ["localStorage JSON values are cloned at both boundaries", () => {
    const storage = createMemoryLocalStorage();
    const source = { id: "r-01", unknownField: { keep: true } };
    storage.setJSON("reminder", source);
    source.unknownField.keep = false;
    const firstRead = storage.getJSON("reminder");
    firstRead.unknownField.keep = false;
    const secondRead = storage.getJSON("reminder");
    assertEqual(secondRead.unknownField.keep, true);
    assert(deepEqual(secondRead, { id: "r-01", unknownField: { keep: true } }));
  }],
  ["Notification mock records calls without a browser", async () => {
    const notification = createNotificationMock();
    assertEqual(notification.Notification.permission, "default");
    new notification.Notification("Sevgili Günışığı", {
      body: "Özel ayrıntı",
      tag: "rem-01-occurrence"
    });
    const calls = notification.getCalls();
    assertEqual(calls.length, 1);
    assertEqual(calls[0].title, "Sevgili Günışığı");
    assertEqual(calls[0].options.tag, "rem-01-occurrence");
    await notification.Notification.requestPermission();
    assertEqual(notification.Notification.permission, "granted");
    assertEqual(notification.getRequestCount(), 1);
  }],
  ["fetch mock is network-disabled and reports no request payload", async () => {
    const network = createFetchMock();
    await assertRejects(
      network.fetch("https://example.invalid/should-not-open", {
        headers: { Authorization: "Bearer ghp_SYNTHETIC_TOKEN" },
        body: "synthetic raw payload"
      }),
      REQUIRED_NETWORK_ERROR
    );
    const report = network.getReport();
    assertEqual(report.callCount, 1);
    assertEqual(report.realNetworkOpened, false);
    assert(!Object.prototype.hasOwnProperty.call(report, "url"));
    assert(!Object.prototype.hasOwnProperty.call(report, "body"));
    assert(!Object.prototype.hasOwnProperty.call(report, "token"));
    const untouched = createFetchMock();
    untouched.assertNoNetwork();
  }],
  ["assertion errors never echo sensitive text", () => {
    const thrown = assertThrows(
      () => assert(false, "token=ghp_SYNTHETIC_TOKEN raw detail body"),
      ASSERTION_ERROR
    );
    assert(!thrown.message.includes("ghp_SYNTHETIC_TOKEN"));
    assert(!thrown.message.includes("raw detail body"));
  }],
  ["missing required fields are explicit", () => {
    const missing = getMissingFields(
      { id: "r-01", enabled: null },
      ["id", "enabled", "timezone"]
    );
    assert(deepEqual(missing, ["enabled", "timezone"]));
    assertThrows(
      () => assertRequiredFields({ id: "r-01" }, ["id", "timezone"]),
      ASSERTION_ERROR
    );
  }],
  ["unknown fields survive a deep clone", () => {
    const input = {
      id: "r-01",
      unknownField: { marker: "preserve-me", nested: [1, 2, 3] }
    };
    const clone = deepClone(input);
    assert(deepEqual(clone, input));
    assert(clone !== input);
    assert(clone.unknownField !== input.unknownField);
    clone.unknownField.nested.push(4);
    assertEqual(input.unknownField.nested.length, 3);
  }],
  ["pure boundary contract names catalog policy and engine", () => {
    assertEqual(PURE_BOUNDARY_CONTRACT.catalog.effects, "none");
    assertEqual(PURE_BOUNDARY_CONTRACT.policy.effects, "none");
    assertEqual(PURE_BOUNDARY_CONTRACT.engine.effects, "none");
    assertEqual(PURE_BOUNDARY_CONTRACT.catalog.input, "ReminderDefinition[]");
    assertEqual(PURE_BOUNDARY_CONTRACT.policy.output, "policy decision");
    assertEqual(PURE_BOUNDARY_CONTRACT.engine.output, "ReminderOccurrence[]");
  }],
  ["catalog function is isolated from caller state", () => {
    const source = [{ id: "r-01", unknownField: { keep: true } }];
    const result = invokePure((definitions) => definitions.map((definition) => ({
      ...definition,
      cataloged: true
    })), source);
    assertEqual(result[0].cataloged, true);
    assert(!Object.prototype.hasOwnProperty.call(source[0], "cataloged"));
    assertEqual(source[0].unknownField.keep, true);
  }],
  ["policy function has no storage or notification dependency", () => {
    const source = {
      preference: { enabled: true },
      suppression: { quietHours: false }
    };
    const result = invokePure((input) => ({
      allowed: input.preference.enabled && !input.suppression.quietHours
    }), source);
    assertEqual(result.allowed, true);
    assert(deepEqual(source, {
      preference: { enabled: true },
      suppression: { quietHours: false }
    }));
  }],
  ["engine function consumes deterministic input only", () => {
    const source = {
      occurrenceId: "occ-01",
      nowIso: "2026-08-13T20:30:00.000Z",
      unknownField: "preserve-me"
    };
    const result = invokePure((seed) => [{
      ...seed,
      scheduledAt: seed.nowIso,
      computedBy: "synthetic-engine"
    }], source);
    assertEqual(result[0].scheduledAt, source.nowIso);
    assertEqual(result[0].unknownField, "preserve-me");
    assert(!Object.prototype.hasOwnProperty.call(source, "scheduledAt"));
  }],
  ["second call returns the same pure projection", () => {
    const source = { id: "r-01", value: 7, unknownField: { stable: true } };
    const project = (input) => ({
      id: input.id,
      doubled: input.value * 2,
      unknownField: input.unknownField
    });
    const first = invokePure(project, source);
    const second = invokePure(project, source);
    assert(deepEqual(first, second));
    assert(deepEqual(source, { id: "r-01", value: 7, unknownField: { stable: true } }));
  }],
  ["synthetic environment exposes no browser or real-data boundary", () => {
    const environment = createSyntheticEnvironment({
      initialIso: "2026-08-13T12:34:56.000Z",
      timezone: DEFAULT_TIMEZONE
    });
    assert(!Object.prototype.hasOwnProperty.call(environment, "window"));
    assert(!Object.prototype.hasOwnProperty.call(environment, "document"));
    assert(!Object.prototype.hasOwnProperty.call(environment, "navigator"));
    assertEqual(environment.clock.nowIso(), "2026-08-13T12:34:56.000Z");
    environment.network.assertNoNetwork();
    assertEqual(environment.localStorage.getItem("missing"), null);
  }]
];

runTests(contractCases).catch(() => {
  process.exitCode = 1;
});
