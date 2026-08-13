"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");
const {
  assert,
  assertEqual,
  assertThrows,
  deepEqual,
  runTests
} = require("./helpers/reminder-test-helper.js");

const root = path.resolve(__dirname, "..", "..");
const catalogPath = path.join(root, "app", "core", "reminderCatalog.js");
const indexPath = path.join(root, "index.html");
const appPath = path.join(root, "app.js");
const catalogSource = fs.readFileSync(catalogPath, "utf8");
const indexSource = fs.readFileSync(indexPath, "utf8");
const appSource = fs.readFileSync(appPath, "utf8");

function loadCatalog() {
  const sandbox = {};
  vm.createContext(sandbox);
  vm.runInContext(catalogSource, sandbox, { filename: "reminderCatalog.js" });
  return sandbox.ReminderCatalogV1;
}

function plainCatalog(catalog) {
  return {
    version: catalog.version,
    idPrefix: catalog.idPrefix,
    definitions: catalog.definitions
  };
}

const requiredFields = [
  "id",
  "category",
  "priority",
  "triggerType",
  "deepLink",
  "privateTitle",
  "privateBody",
  "detailKeys",
  "defaultWindow",
  "defaultChannel",
  "snoozeOptions",
  "suppressionRules",
  "definitionVersion"
];

const allowedCategories = new Set([
  "ritual",
  "care",
  "reflection",
  "support",
  "health",
  "special",
  "system",
  "social"
]);
const allowedPriorities = new Set(["P0", "P1", "P2", "P3"]);
const allowedChannels = new Set(["in_app", "native", "summary"]);
const sensitivePrivateWords = [
  "namaz",
  "zikir",
  "terapi",
  "cbt",
  "duygu",
  "kriz",
  "saygı",
  "kitap",
  "günlük",
  "ilaç",
  "stres",
  "ruh hali",
  "kaçırdın",
  "eksik",
  "başarısız"
];

const catalogCases = [
  ["catalog loads as a versioned classic module", () => {
    const catalog = loadCatalog();
    assertEqual(catalog.version, "1.0.0");
    assertEqual(catalog.idPrefix, "reminder.catalog.v1.");
    assertEqual(catalog.definitions.length, 7);
    assertEqual(catalog.ids.length, 7);
    assert(Object.isFrozen(catalog));
    assert(Object.isFrozen(catalog.definitions));
  }],
  ["all seven definitions have the complete required shape", () => {
    const catalog = loadCatalog();
    const ids = new Set();
    catalog.definitions.forEach((definition) => {
      requiredFields.forEach((field) => {
        assert(Object.prototype.hasOwnProperty.call(definition, field));
      });
      assert(!ids.has(definition.id));
      ids.add(definition.id);
      assert(typeof definition.id === "string" && definition.id.length > 0);
      assert(allowedCategories.has(definition.category));
      assert(allowedPriorities.has(definition.priority));
      assert(typeof definition.triggerType === "string" && definition.triggerType.length > 0);
      assert(typeof definition.deepLink === "string" && definition.deepLink.length > 0);
      assert(typeof definition.privateTitle === "string" && definition.privateTitle.length > 0);
      assert(typeof definition.privateBody === "string" && definition.privateBody.length > 0);
      assert(Array.isArray(definition.detailKeys) && definition.detailKeys.length > 0);
      assert(definition.defaultWindow && typeof definition.defaultWindow === "object");
      assertEqual(definition.defaultWindow.timezone, "user");
      assert(allowedChannels.has(definition.defaultChannel));
      assert(Array.isArray(definition.snoozeOptions));
      assert(Array.isArray(definition.suppressionRules));
      assertEqual(definition.definitionVersion, catalog.version);
    });
    assertEqual(ids.size, 7);
  }],
  ["catalog IDs use a reserved namespace separate from data.notifications", () => {
    const catalog = loadCatalog();
    const existingNotificationIds = new Set([
      "observer.message.001",
      "aeon.notification.001",
      "message-2026-08-13-001"
    ]);
    catalog.ids.forEach((id) => {
      assert(id.startsWith("reminder.catalog.v1."));
      assert(!existingNotificationIds.has(id));
    });
    assert(/notifications:\[\]/.test(appSource));
    assert(!catalog.ids.some((id) => appSource.includes(`id:${id}`)));
  }],
  ["private copy is Turkish, general and non-sensitive", () => {
    const catalog = loadCatalog();
    catalog.definitions.forEach((definition) => {
      const privateText = `${definition.privateTitle} ${definition.privateBody}`.toLocaleLowerCase("tr-TR");
      sensitivePrivateWords.forEach((word) => {
        assert(!privateText.includes(word));
      });
      assert(definition.privateTitle.length <= 90);
      assert(definition.privateBody.length <= 160);
      assert(!/[\r\n]/.test(privateText));
    });
  }],
  ["catalog exposes app-only detail keys and immutable nested values", () => {
    const catalog = loadCatalog();
    catalog.definitions.forEach((definition) => {
      assert(Object.isFrozen(definition));
      assert(Object.isFrozen(definition.detailKeys));
      assert(Object.isFrozen(definition.defaultWindow));
      assert(Object.isFrozen(definition.snoozeOptions));
      assert(Object.isFrozen(definition.suppressionRules));
      definition.detailKeys.forEach((key) => assert(typeof key === "string" && key.length > 0));
    });
    assertThrows(() => {
      catalog.definitions[0].privateTitle = "değişmemeli";
    });
    assertThrows(() => {
      catalog.definitions[0].detailKeys.push("rawPrivateText");
    });
  }],
  ["catalog list and get are deterministic and side-effect free", () => {
    const first = loadCatalog();
    const second = loadCatalog();
    assert(deepEqual(plainCatalog(first), plainCatalog(second)));
    const listed = first.list();
    listed.pop();
    assertEqual(first.list().length, 7);
    first.ids.forEach((id) => assert(first.get(id) !== null));
    assertEqual(first.get("reminder.catalog.v1.unknown"), null);
  }],
  ["catalog source has no DOM, network, persistence or runtime clock dependency", () => {
    [
      /\bdocument\b/,
      /\blocalStorage\b/,
      /\bfetch\b/,
      /\bDate\b/,
      /\bNotification\b/,
      /\bnavigator\b/
    ].forEach((forbidden) => assert(!forbidden.test(catalogSource)));
    assert(indexSource.includes('<script src="app/core/reminderCatalog.js?v=20260813a"></script>'));
    const catalogIndex = indexSource.indexOf("app/core/reminderCatalog.js");
    const appIndex = indexSource.indexOf("app.js?v=");
    assert(catalogIndex > -1 && appIndex > catalogIndex);
  }]
];

runTests(catalogCases).catch(() => {
  process.exitCode = 1;
});
