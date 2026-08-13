"use strict";

const DEFAULT_TIMEZONE = "Europe/Istanbul";
const REQUIRED_NETWORK_ERROR = "REMINDER_TEST_NETWORK_DISABLED";
const ASSERTION_ERROR = "REMINDER_ASSERTION_FAILED";
const CLONE_ERROR = "REMINDER_CLONE_UNSUPPORTED";
const CLOCK_ERROR = "REMINDER_CLOCK_INVALID";
const TIMEZONE_ERROR = "REMINDER_TIMEZONE_INVALID";
const STORAGE_ERROR = "REMINDER_STORAGE_JSON_INVALID";
const PURE_ERROR = "REMINDER_PURE_FUNCTION_FAILED";

let assertionCount = 0;
const hasOwn = Object.prototype.hasOwnProperty;

function fail(errorCode) {
  throw new Error(errorCode || ASSERTION_ERROR);
}

function assert(condition) {
  if (!condition) fail(ASSERTION_ERROR);
  assertionCount += 1;
  return true;
}

function assertEqual(actual, expected) {
  return assert(actual === expected);
}

function deepClone(value) {
  if (value === undefined) return undefined;
  let serialized;
  try {
    serialized = JSON.stringify(value);
  } catch {
    fail(CLONE_ERROR);
  }
  if (serialized === undefined) fail(CLONE_ERROR);
  try {
    return JSON.parse(serialized);
  } catch {
    fail(CLONE_ERROR);
  }
}

function deepEqual(left, right) {
  if (left === undefined || right === undefined) return left === right;
  try {
    return JSON.stringify(left) === JSON.stringify(right);
  } catch {
    return false;
  }
}

function assertThrows(fn, expectedMessage) {
  let thrown = null;
  try {
    fn();
  } catch (error) {
    thrown = error;
  }
  assert(thrown !== null);
  if (expectedMessage !== undefined) {
    assert(thrown && thrown.message === expectedMessage);
  }
  return thrown;
}

async function assertRejects(promise, expectedMessage) {
  let thrown = null;
  try {
    await promise;
  } catch (error) {
    thrown = error;
  }
  assert(thrown !== null);
  if (expectedMessage !== undefined) {
    assert(thrown && thrown.message === expectedMessage);
  }
  return thrown;
}

function parseIso(iso) {
  if (typeof iso !== "string" || !Number.isFinite(Date.parse(iso))) {
    fail(CLOCK_ERROR);
  }
  return Date.parse(iso);
}

function validateTimezone(timezone) {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: timezone }).format(new Date(0));
  } catch {
    fail(TIMEZONE_ERROR);
  }
  return timezone;
}

function dateTimeParts(epochMs, timezone) {
  validateTimezone(timezone);
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23"
  });
  const parts = {};
  formatter.formatToParts(new Date(epochMs)).forEach((part) => {
    if (part.type !== "literal") parts[part.type] = part.value;
  });
  return parts;
}

function toEpochMs(value) {
  if (value instanceof Date && Number.isFinite(value.getTime())) {
    return value.getTime();
  }
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") return parseIso(value);
  fail(CLOCK_ERROR);
}

function formatLocalDate(value, timezone) {
  const parts = dateTimeParts(toEpochMs(value), timezone || DEFAULT_TIMEZONE);
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function createDeterministicClock(initialIso, timezone) {
  const chosenTimezone = timezone || DEFAULT_TIMEZONE;
  validateTimezone(chosenTimezone);
  let epochMs = parseIso(initialIso || "2026-08-13T12:34:56.000Z");

  return {
    timezone: chosenTimezone,
    now() {
      return new Date(epochMs);
    },
    nowIso() {
      return new Date(epochMs).toISOString();
    },
    localDate() {
      return formatLocalDate(epochMs, chosenTimezone);
    },
    localParts() {
      return deepClone(dateTimeParts(epochMs, chosenTimezone));
    },
    advanceMs(milliseconds) {
      if (typeof milliseconds !== "number" || !Number.isFinite(milliseconds)) {
        fail(CLOCK_ERROR);
      }
      epochMs += milliseconds;
      return this.now();
    },
    setIso(iso) {
      epochMs = parseIso(iso);
      return this.now();
    }
  };
}

function createMemoryLocalStorage(seed) {
  const entries = new Map();
  Object.keys(seed || {}).forEach((key) => entries.set(String(key), String(seed[key])));

  return {
    get length() {
      return entries.size;
    },
    getItem(key) {
      const value = entries.get(String(key));
      return value === undefined ? null : value;
    },
    setItem(key, value) {
      entries.set(String(key), String(value));
    },
    removeItem(key) {
      entries.delete(String(key));
    },
    clear() {
      entries.clear();
    },
    key(index) {
      return Array.from(entries.keys())[index] || null;
    },
    setJSON(key, value) {
      const cloned = deepClone(value);
      try {
        this.setItem(key, JSON.stringify(cloned));
      } catch {
        fail(STORAGE_ERROR);
      }
    },
    getJSON(key) {
      const raw = this.getItem(key);
      if (raw === null) return null;
      try {
        return deepClone(JSON.parse(raw));
      } catch {
        fail(STORAGE_ERROR);
      }
    }
  };
}

function createNotificationMock(initialPermission) {
  let permission = initialPermission || "default";
  const calls = [];
  let requestCount = 0;

  function NotificationMock(title, options) {
    calls.push({
      title: String(title),
      options: deepClone(options || {})
    });
  }

  Object.defineProperty(NotificationMock, "permission", {
    enumerable: true,
    get() {
      return permission;
    }
  });

  NotificationMock.requestPermission = function requestPermission() {
    requestCount += 1;
    if (permission === "default") permission = "granted";
    return Promise.resolve(permission);
  };

  return {
    Notification: NotificationMock,
    getCalls() {
      return deepClone(calls);
    },
    getRequestCount() {
      return requestCount;
    },
    setPermission(nextPermission) {
      if (!["default", "granted", "denied"].includes(nextPermission)) {
        fail(ASSERTION_ERROR);
      }
      permission = nextPermission;
    }
  };
}

function createFetchMock() {
  let callCount = 0;

  function fetchMock() {
    callCount += 1;
    return Promise.reject(new Error(REQUIRED_NETWORK_ERROR));
  }

  return {
    fetch: fetchMock,
    getCallCount() {
      return callCount;
    },
    getReport() {
      return {
        callCount,
        realNetworkOpened: false
      };
    },
    assertNoNetwork() {
      return assert(callCount === 0);
    }
  };
}

const PURE_BOUNDARY_CONTRACT = Object.freeze({
  catalog: Object.freeze({
    input: "ReminderDefinition[]",
    output: "ReminderDefinition[]",
    effects: "none"
  }),
  policy: Object.freeze({
    input: "ReminderPreference + SuppressionContext",
    output: "policy decision",
    effects: "none"
  }),
  engine: Object.freeze({
    input: "ReminderOccurrence seed + deterministic clock",
    output: "ReminderOccurrence[]",
    effects: "none"
  })
});

function invokePure(fn, input) {
  if (typeof fn !== "function") fail(PURE_ERROR);
  const callerBefore = deepClone(input);
  const isolatedInput = deepClone(input);
  let output;
  try {
    output = fn(isolatedInput);
  } catch {
    fail(PURE_ERROR);
  }
  assert(deepEqual(isolatedInput, callerBefore));
  assert(deepEqual(input, callerBefore));
  return output === undefined ? undefined : deepClone(output);
}

function getMissingFields(value, fields) {
  if (!Array.isArray(fields)) fail(ASSERTION_ERROR);
  const record = value && typeof value === "object" ? value : {};
  return fields.filter((field) => !hasOwn.call(record, field) || record[field] === undefined || record[field] === null);
}

function assertRequiredFields(value, fields) {
  return assert(getMissingFields(value, fields).length === 0);
}

function createSyntheticEnvironment(options) {
  const opts = options || {};
  const clock = createDeterministicClock(opts.initialIso, opts.timezone || DEFAULT_TIMEZONE);
  const storage = createMemoryLocalStorage(opts.storageSeed);
  const notification = createNotificationMock(opts.permission);
  const network = createFetchMock();
  return {
    clock,
    timezone: clock.timezone,
    localStorage: storage,
    Notification: notification.Notification,
    notification,
    fetch: network.fetch,
    network
  };
}

async function runTests(cases) {
  assertionCount = 0;
  for (const testCase of cases) {
    const name = testCase[0];
    const test = testCase[1];
    try {
      await test();
      console.log(`PASS ${name}`);
    } catch {
      console.error(`FAIL ${name}`);
      throw new Error("REMINDER_TEST_SUITE_FAILED");
    }
  }
  console.log(`REMINDER CONTRACT PASS: ${assertionCount} assertions`);
  return assertionCount;
}

module.exports = {
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
  formatLocalDate,
  getMissingFields,
  invokePure,
  runTests
};
