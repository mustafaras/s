const fs = require("fs");
const head = fs.readFileSync("/tmp/head_app.js", "utf8");
const mod = fs.readFileSync("app/core/reminders.js", "utf8");
const app = fs.readFileSync("app.js", "utf8");

const list = ["mergePersistedReminderState","reminderPermissionSnapshot","reminderPermissionStorageRead","reminderPermissionStorageWrite","reminderPreviewNotification","reminderNativeDisplay","reminderSystemOffline","reminderDeliveryStorageRead","reminderDeliveryStorageWrite","reminderDeliveryClear","reminderLifecycleDefaultContext","reminderLifecycleDraftActive","reminderLifecycleReplaceTarget","reminderLifecycleUpdateLive","reminderActionStorageRead","reminderActionStorageWrite","reminderLockBodyScroll","reminderUnlockBodyScroll","reminderActiveElementId","reminderRestoreFocus","reminderRemoveLocalKey"];

console.log("== HEAD app.js tanim satirlari ==");
const headLines = head.split("\n");
headLines.forEach((l, i) => {
  for (const name of list) {
    if (new RegExp("function\\s+" + name + "\\s*\\(").test(l)) console.log("  HEAD:" + (i + 1), name);
  }
});

console.log("");
console.log("== Modul icindeki cagrilari (kendi tanimi haric) ==");
for (const name of list) {
  const defRe = new RegExp("function\\s+" + name + "\\s*\\(");
  const lines = mod.split("\n");
  const uses = [];
  lines.forEach((l, i) => {
    if (defRe.test(l)) return;
    const u = l.split(name).length - 1;
    if (u > 0) uses.push(i + 1);
  });
  console.log("  " + name + " -> " + (uses.length ? "satir " + uses.slice(0, 8).join(",") + (uses.length > 8 ? "..." : "") : "CAGRILMIYOR"));
}

console.log("");
console.log("== app.js'te kalan reminder runtime izleri (ornek arama) ==");
["App.requestReminderPermission", "reminderPermissionStorageRead", "reminderNativeDisplay", "reminderLifecycleUpdateLive", "reminderPreviewNotification", "reminderSystemOffline", "mergePersistedReminderState", "reminderRestoreFocus"].forEach(name => {
  const c = app.split(name).length - 1;
  console.log("  " + name + ": " + c + " gecis");
});