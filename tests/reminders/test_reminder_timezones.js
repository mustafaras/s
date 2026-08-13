"use strict";

const {
  DEFAULT_TIMEZONE,
  assertEqual,
  createDeterministicClock,
  formatLocalDate,
  runTests
} = require("./helpers/reminder-test-helper.js");

// REM-02 contract skeleton: REM-08 will add occurrence/DST engine assertions.
const timezoneCases = [
  ["Europe/Istanbul date projection is deterministic", () => {
    const clock = createDeterministicClock("2026-08-13T20:30:00.000Z", DEFAULT_TIMEZONE);
    assertEqual(formatLocalDate(clock.now(), DEFAULT_TIMEZONE), "2026-08-13");
    assertEqual(clock.localDate(), "2026-08-13");
  }],
  ["fixed clock crosses the local date boundary predictably", () => {
    const clock = createDeterministicClock("2026-08-13T20:30:00.000Z", DEFAULT_TIMEZONE);
    clock.advanceMs(2 * 60 * 60 * 1000);
    assertEqual(clock.localDate(), "2026-08-14");
  }]
];

runTests(timezoneCases).catch(() => {
  process.exitCode = 1;
});
